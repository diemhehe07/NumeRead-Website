"""HTTP API consumed by the NumeRead website.

The API retrieves learner data directly from Firebase Firestore,
converts it into the NumeRead AI format, and generates an
adaptive learning recommendation.
"""

import os
import time
import logging
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware

from assessment.quiz_generator import QuizGenerator
from api.schemas import (
    PersonalizedGameItemsRequest,
    StoreGameItemsRequest,
    LearningSessionRequest,
    StudentAnalysisRequest,
    StudentLookupRequest,
    PronunciationRequest,
    TutorFeedbackRequest,
    validate_id_field,
    validate_difficulty,
)

from data.firebase_service import FirebaseService

logger = logging.getLogger("numeread.api")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Enforces essential modern HTTP security headers against XSS, clickjacking, MIME sniffing, and framing."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), geolocation=(), microphone=(self)"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://www.gstatic.com https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; "
            "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; "
            "img-src 'self' data: https: blob:; "
            "connect-src 'self' http://127.0.0.1:8000 http://localhost:8000 http://127.0.0.1:5000 http://localhost:5000 https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://numeread-webapp.firebaseapp.com https://numeread-webapp.web.app; "
            "media-src 'self' blob: data:; "
            "frame-ancestors 'self'; "
            "object-src 'none'; "
            "base-uri 'self';"
        )
        if "server" in response.headers:
            del response.headers["server"]
        return response


class RateLimitAndPayloadLimitMiddleware(BaseHTTPMiddleware):
    """Guards against automated pentest fuzzing, brute force, and memory exhaustion."""

    def __init__(self, app, max_requests: int = 150, window_seconds: int = 60, max_body_size: int = 1048576):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.max_body_size = max_body_size
        self.requests = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        # 1. Reject oversized payloads (buffer overflow / DoS protection)
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.max_body_size:
            return Response(
                content='{"detail":"Payload too large. Maximum allowed size is 1MB."}',
                status_code=413,
                media_type="application/json"
            )

        # 2. Sliding window rate limiting per client IP
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - self.window_seconds

        client_history = [t for t in self.requests[client_ip] if t > window_start]
        if len(client_history) >= self.max_requests:
            logger.warning(f"Rate limit triggered for IP: {client_ip}")
            return Response(
                content='{"detail":"Rate limit exceeded. Please wait a moment and try again."}',
                status_code=429,
                media_type="application/json",
                headers={"Retry-After": str(int(self.window_seconds))}
            )

        client_history.append(now)
        self.requests[client_ip] = client_history

        return await call_next(request)



READING_SKILLS = (
    "Blends",
    "Reading fluency",
    "Vocabulary",
    "Comprehension",
)

MATH_SKILLS = (
    "Addition facts",
    "Subtraction",
    "Word problems",
    "Place value",
)


class NumeReadModel:
    """Explainable NumeRead placement and recommendation model."""

    MATERIALS = {
        "pretest": [
            "Blends and Phonics Module",
            "Addition Facts Module",
        ],
        "reading": [
            "Blends and Phonics Module",
            "Reading Fluency Audio-Visual",
            "Sentence Builder",
        ],
        "math": [
            "Addition Facts Module",
            "Word Problem Walkthrough",
            "Math strategy worksheet",
        ],
        "both": [
            "Reading Fluency Audio-Visual",
            "Addition Facts Module",
            "Read-and-Solve Worksheet",
        ],
        "enrichment": [
            "Advanced Challenge Set",
            "Word Problem Walkthrough",
        ],
    }

    def _band(self, score: float) -> str:
        if score < 50:
            return "needs support"

        if score < 75:
            return "developing"

        if score < 90:
            return "proficient"

        return "advanced"

    def _difficulty(
        self,
        score: float,
        has_pretest: bool
    ) -> str:

        if not has_pretest or score < 50:
            return "easy"

        if score < 75:
            return "average"

        if score < 90:
            return "intermediate"

        return "advanced"

    def _priority_area(
        self,
        student: StudentAnalysisRequest
    ) -> str:

        if not student.pretest:
            return "pretest"

        if student.reading_score <= student.math_score - 10:
            return "reading"

        if student.math_score <= student.reading_score - 10:
            return "math"

        if (
            student.reading_score < 75
            and student.math_score < 75
        ):
            return "both"

        return "enrichment"

    def _weak_skills(
        self,
        student: StudentAnalysisRequest,
        area: str
    ) -> List[str]:

        if area == "reading":
            eligible = READING_SKILLS

        elif area == "math":
            eligible = MATH_SKILLS

        else:
            eligible = READING_SKILLS + MATH_SKILLS

        reported = [
            gap
            for gap in student.gaps
            if gap in eligible
        ]

        mastery_gaps = [
            skill
            for skill in eligible
            if student.mastery.get(skill, 100) < 75
        ]

        return list(
            dict.fromkeys(
                reported + mastery_gaps
            )
        )[:4]

    def analyze(
        self,
        student: StudentAnalysisRequest
    ) -> Dict[str, Any]:

        area = self._priority_area(student)

        reading_level = self._band(
            student.reading_score
        )

        math_level = self._band(
            student.math_score
        )

        reading_difficulty = self._difficulty(
            student.reading_score,
            bool(student.pretest)
        )

        math_difficulty = self._difficulty(
            student.math_score,
            bool(student.pretest)
        )

        weak_skills = self._weak_skills(
            student,
            area
        )

        messages = {
            "pretest": (
                "Take the pre-test first so NumeRead "
                "can place you in the right reading "
                "and math level."
            ),

            "reading": (
                "Reading needs more support than math. "
                f"Start with {reading_difficulty} reading "
                "games and audio-guided materials."
            ),

            "math": (
                "Math needs more support than reading. "
                f"Start with {math_difficulty} math games "
                "and review number strategies."
            ),

            "both": (
                "Reading and math both need guided practice. "
                "Use short daily lessons before games."
            ),

            "enrichment": (
                "You are ready for enrichment. "
                "Try intermediate or advanced activities "
                "for deeper practice."
            ),
        }

        path_labels = {
            "pretest": "Pre-test placement",
            "reading": "Reading fluency path",
            "math": "Numeracy recovery path",
            "both": (
                "Foundational reading and numeracy path"
            ),
            "enrichment": "Grade 2 enrichment path",
        }

        return {
            "student_id": student.student_id,

            "area": area,

            "readingLevel": reading_level,

            "mathLevel": math_level,

            "readingDifficulty": reading_difficulty,

            "mathDifficulty": math_difficulty,

            "materials": self.MATERIALS[area],

            "priority_skills": weak_skills,

            "recommended_path": path_labels[area],

            "message": messages[area],

            "progress": {
                "activities_completed": len(
                    student.activities
                ),

                "materials_completed": len(
                    student.materials_completed
                ),

                "pretest_complete": bool(
                    student.pretest
                ),

                "posttest_complete": bool(
                    student.posttest
                ),
            },

            "timestamp": (
                datetime.now(timezone.utc)
                .isoformat()
            ),
        }


class EduAdaptAPI:
    """NumeRead FastAPI application."""

    def __init__(
        self,
        learning_platform: Optional[Any] = None,
        web_root: Optional[str] = None,
    ):

        self.app = FastAPI(
            title="NumeRead Adaptive Learning API",
            version="1.0.0",
        )

        self.platform = learning_platform

        self.model = NumeReadModel()
        self.quiz_generator = getattr(learning_platform, 'quiz_generator', None) or QuizGenerator({})

        # Firebase service
        self.firebase = FirebaseService()

        # Temporary in-memory session storage
        self.sessions: Dict[
            str,
            List[Dict[str, Any]]
        ] = {}

        # Attach Security & Rate-Limiting Middlewares
        self.app.add_middleware(SecurityHeadersMiddleware)
        self.app.add_middleware(RateLimitAndPayloadLimitMiddleware)

        # Configure safe CORS origins
        env_origins = os.environ.get("ALLOWED_ORIGINS", "")
        if env_origins.strip() == "*":
            origins = ["*"]
        elif env_origins.strip():
            origins = [o.strip() for o in env_origins.split(",") if o.strip()]
        else:
            origins = [
                "http://localhost:8000",
                "http://127.0.0.1:8000",
                "http://localhost:5000",
                "http://127.0.0.1:5000",
                "https://numeread-webapp.web.app",
                "https://numeread-webapp.firebaseapp.com",
            ]

        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=False,
            allow_methods=["GET", "POST", "OPTIONS"],
            allow_headers=["Content-Type", "Authorization"],
        )

        self.setup_routes()

        # In local development the API and web app are served from one origin.
        # This avoids separate processes, CORS configuration, and hard-coded URLs.
        if web_root:
            site_directory = Path(web_root).resolve()
            if not site_directory.is_dir():
                raise ValueError(f"Website directory does not exist: {site_directory}")
            self.app.mount(
                "/",
                StaticFiles(directory=str(site_directory), html=True),
                name="website",
            )

    def build_student_analysis(
        self,
        student_data: Dict[str, Any]
    ) -> StudentAnalysisRequest:
        """Convert Firebase student data into AI input."""

        student_id = str(
            student_data.get("id")
            or student_data.get("student_id")
            or ""
        )

        if not student_id:
            raise HTTPException(
                status_code=400,
                detail="Student record has no valid ID."
            )

        return StudentAnalysisRequest(

            student_id=student_id,

            name=str(
                student_data.get(
                    "name",
                    "Student"
                )
                or "Student"
            ),

            grade=str(
                student_data.get(
                    "grade",
                    "Grade 2"
                )
                or "Grade 2"
            ),

            section=str(
                student_data.get(
                    "section",
                    student_data.get(
                        "gradeSection",
                        "Section A"
                    )
                )
                or "Section A"
            ),

            reading_score=float(
                student_data.get(
                    "reading",
                    0
                )
                or 0
            ),

            math_score=float(
                student_data.get(
                    "math",
                    0
                )
                or 0
            ),

            mastery=student_data.get(
                "mastery",
                {}
            ) or {},

            gaps=student_data.get(
                "gaps",
                []
            ) or [],

            activities=student_data.get(
                "activities",
                []
            ) or [],

            materials_completed=student_data.get(
                "materialsCompleted",
                []
            ) or [],

            pretest=student_data.get(
                "pretest"
            ),

            posttest=student_data.get(
                "posttest"
            ),
        )

    def setup_routes(self) -> None:

        # ============================================
        # FIREBASE → AI → RECOMMENDATION
        # ============================================

        async def analyze_student(
            request: StudentLookupRequest
        ) -> Dict[str, Any]:

            try:

                # 1. Get student from Firebase
                student_data = (
                    self.firebase.get_student(
                        request.student_id
                    )
                )

                if student_data is None:
                    raise HTTPException(
                        status_code=404,
                        detail=(
                            f"Student "
                            f"'{request.student_id}' "
                            "was not found in Firebase."
                        ),
                    )

                # 2. Convert Firebase data
                student = (
                    self.build_student_analysis(
                        student_data
                    )
                )

                # 3. Run AI analysis
                result = self.model.analyze(
                    student
                )

                # 4. Use the initialized adaptive-learning platform as the
                # recommendation engine.  The placement result remains
                # explainable while this list is calculated by the project's
                # content recommender using learner gaps and preferences.
                if self.platform:
                    target_concepts = result["priority_skills"]
                    if not target_concepts:
                        target_concepts = list(
                            READING_SKILLS if result["area"] == "reading"
                            else MATH_SKILLS if result["area"] == "math"
                            else READING_SKILLS + MATH_SKILLS
                        )

                    recommendations = self.platform.get_personalized_recommendations(
                        student.student_id,
                        target_concepts,
                        max_recommendations=3,
                    )
                    result["model_recommendations"] = recommendations
                    result["model"] = "NumeRead adaptive learning platform"

                # 5. Identify data source
                result["data_source"] = "firebase"

                return result

            except HTTPException:
                raise

            except Exception as e:
                logger.error(f"Error analyzing student: {e}", exc_info=True)
                raise HTTPException(
                    status_code=500,
                    detail="An error occurred while analyzing student data."
                )

        # Keep the existing aliases so older
        # NumeRead integrations don't break.
        for path in (
            "/api/analyze-student",
            "/analyze-student",
            "/student/analyze",
            "/recommendations",
        ):

            self.app.add_api_route(
                path,
                analyze_student,
                methods=["POST"],
                response_model=None,
            )

        # ============================================
        # RECORD LEARNING SESSION
        # ============================================

        @self.app.post(
            "/record-learning-session"
        )
        async def record_learning_session(
            request: LearningSessionRequest
        ) -> Dict[str, Any]:

            session = request.dict()

            session["timestamp"] = (
                datetime.now(timezone.utc)
                .isoformat()
            )

            self.sessions.setdefault(
                request.student_id,
                []
            ).append(session)

            if self.platform:

                self.platform.record_learning_session(
                    request.student_id,
                    session
                )

            return {
                "status": "success",
                "student_id": request.student_id,
            }

        # ============================================
        # PRONUNCIATION CHECK
        # ============================================

        @self.app.post(
            "/api/pronunciation/check"
        )
        async def check_pronunciation(
            request: PronunciationRequest
        ) -> Dict[str, Any]:

            try:

                result = {
                    "studentId": request.student_id,
                    "targetWord": request.target_word,
                    "spokenWord": request.spoken_word,
                    "score": request.score,
                    "confidence": request.confidence,
                    "points": request.points,
                }

                attempt_id = (
                    self.firebase
                    .save_pronunciation_result(
                        result
                    )
                )

                return {
                    "status": "success",
                    "attempt_id": attempt_id,
                    "student_id": request.student_id,
                    "score": request.score,
                    "points": request.points,
                }

            except Exception as e:
                logger.error(f"Error saving pronunciation result: {e}", exc_info=True)
                raise HTTPException(
                    status_code=500,
                    detail="An error occurred while recording pronunciation attempt."
                )

        @self.app.post("/api/tutor-feedback")
        async def tutor_feedback(
            request: TutorFeedbackRequest
        ) -> Dict[str, str]:
            """Return concise feedback from the local NumeRead tutor model."""
            skill = request.skill.lower()
            if request.correct:
                feedback = "Great work. Explain the strategy once, then try the next challenge."
            elif "blend" in skill:
                feedback = "Say the first two sounds slowly, then blend them together."
            elif "fluency" in skill or "pronunciation" in skill:
                feedback = "Read one short phrase at a time and listen for each sound."
            elif "word problem" in skill:
                feedback = "Circle the numbers, underline the question, then choose the operation."
            else:
                feedback = "Break the problem into smaller parts and try one helpful strategy."

            return {
                "feedback": feedback,
                "model": "NumeRead adaptive tutor",
            }

        # ============================================
        # STUDENT PROGRESS
        # ============================================

        @self.app.get(
            "/student-progress/{student_id}"
        )
        async def student_progress(
            student_id: str
        ) -> Dict[str, Any]:

            if self.platform:

                return (
                    self.platform.get_student_progress(
                        student_id
                    )
                )

            sessions = self.sessions.get(
                student_id,
                []
            )

            if not sessions:

                raise HTTPException(
                    status_code=404,
                    detail=(
                        "No learning sessions "
                        "found for this student."
                    ),
                )

            return {
                "student_id": student_id,
                "total_sessions": len(
                    sessions
                ),
                "sessions": sessions,
            }

        # ============================================
        # ADAPTIVE GAME ITEMS & TEST BANK STORAGE
        # ============================================

        @self.app.post("/api/test-bank/generate-personalized")
        @self.app.post("/api/adaptive-game-items")
        async def generate_personalized_game_items_endpoint(
            request: PersonalizedGameItemsRequest
        ) -> Dict[str, Any]:
            """
            Generate personalized game items for students who struggle with a skill
            (e.g., Subtraction across-ten or Division equal groups) or when difficulty is too high.
            Stores the resulting items in the test bank storage.
            """
            try:
                student_profile = {
                    "student_id": request.student_id or "demo-student",
                    "mastery": request.mastery or {},
                    "gaps": request.gaps or [],
                    "struggling": request.struggling or False,
                    "recent_performance": request.recent_performance or 1.0,
                    "failed_attempts": request.failed_attempts or 0,
                }

                # Attempt to enrich with stored Firestore student data if available
                if request.student_id and request.student_id != "demo-student":
                    try:
                        firebase_student = self.firebase.get_student(request.student_id)
                        if firebase_student:
                            merged_mastery = {
                                **firebase_student.get("mastery", {}),
                                **(request.mastery or {})
                            }
                            student_profile["mastery"] = merged_mastery
                            merged_gaps = list(dict.fromkeys(
                                (firebase_student.get("gaps") or []) + (request.gaps or [])
                            ))
                            student_profile["gaps"] = merged_gaps
                            prog = firebase_student.get("learningProgress", {}).get(request.activity_id, {})
                            if prog:
                                student_profile["failed_attempts"] = max(
                                    int(student_profile["failed_attempts"]),
                                    int(prog.get("attempts", 0))
                                )
                                if "lastPerformance" in prog:
                                    student_profile["recent_performance"] = float(prog["lastPerformance"])
                    except Exception:
                        pass

                generator = (
                    getattr(self.platform, "quiz_generator", None)
                    or self.quiz_generator
                )

                result = generator.generate_personalized_game_items(
                    activity_id=request.activity_id,
                    difficulty=request.difficulty,
                    student_profile=student_profile,
                    count=request.count or 10,
                    subtopic_override=request.subtopic
                )

                result["timestamp"] = datetime.now(timezone.utc).isoformat()
                return result

            except Exception as e:
                logger.error(f"Error generating personalized game items: {e}", exc_info=True)
                raise HTTPException(
                    status_code=500,
                    detail="An error occurred while generating personalized items."
                )

        @self.app.get("/api/test-bank/{activity_id}/{difficulty}")
        async def get_test_bank_items_endpoint(
            activity_id: str,
            difficulty: str,
            student_id: Optional[str] = None
        ) -> Dict[str, Any]:
            """Retrieve items from the test bank storage (supports personalized items by student_id)."""
            clean_activity = validate_id_field(activity_id, "activity_id")
            clean_diff = validate_difficulty(difficulty)
            clean_student = validate_id_field(student_id, "student_id") if student_id else None

            generator = (
                getattr(self.platform, "quiz_generator", None)
                or self.quiz_generator
            )
            items = generator.get_stored_game_items(clean_activity, clean_diff, clean_student)
            return {
                "activity_id": clean_activity,
                "difficulty": clean_diff,
                "student_id": clean_student,
                "count": len(items),
                "items": items
            }

        @self.app.post("/api/test-bank/store")
        async def store_test_bank_items_endpoint(
            request: StoreGameItemsRequest
        ) -> Dict[str, Any]:
            """Store items into the test bank storage."""
            try:
                generator = (
                    getattr(self.platform, "quiz_generator", None)
                    or self.quiz_generator
                )
                key = generator.store_game_items(
                    activity_id=request.activity_id,
                    difficulty=request.difficulty,
                    items=request.items,
                    student_id=request.student_id
                )
                return {
                    "status": "success",
                    "storage_key": key,
                    "count": len(request.items)
                }
            except Exception as e:
                logger.error(f"Error storing test bank items: {e}", exc_info=True)
                raise HTTPException(
                    status_code=500,
                    detail="An error occurred while storing test bank items."
                )

        # ============================================
        # HEALTH CHECK
        # ============================================

        @self.app.get("/health")
        async def health_check() -> Dict[str, str]:

            return {
                "status": "healthy",
                "service": (
                    "NumeRead Adaptive Learning API"
                ),
            }

    def run(
        self,
        host: str = "0.0.0.0",
        port: int = 8000
    ) -> None:

        import uvicorn

        uvicorn.run(
            self.app,
            host=host,
            port=port,
        )


# Preferred NumeRead name
NumeReadAPI = EduAdaptAPI
