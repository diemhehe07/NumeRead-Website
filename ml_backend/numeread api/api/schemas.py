"""Request and response contracts for the NumeRead web application with strict validation and sanitization."""

import html
import re
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, validator

SAFE_ID_REGEX = re.compile(r"^[a-zA-Z0-9_\-\.]{1,64}$")
HTML_TAG_REGEX = re.compile(r"<[^>]*?>")
VALID_DIFFICULTIES = {"easy", "average", "intermediate", "advanced"}


def sanitize_text(value: Optional[str], max_len: int = 200) -> str:
    """Strip HTML tags and trim length to prevent stored/reflected XSS."""
    if value is None:
        return ""
    cleaned = HTML_TAG_REGEX.sub("", str(value)).strip()
    return html.escape(cleaned)[:max_len]


def validate_id_field(value: str, field_name: str = "id") -> str:
    """Ensure identifier contains only safe alphanumeric/dash/underscore characters."""
    val = str(value or "").strip()
    if not val or not SAFE_ID_REGEX.match(val):
        raise ValueError(
            f"Invalid {field_name} format: must be 1-64 alphanumeric characters, underscores, dashes, or dots."
        )
    return val


def validate_difficulty(value: Optional[str]) -> str:
    diff = str(value or "easy").strip().lower()
    if diff not in VALID_DIFFICULTIES:
        return "easy"
    return diff


class AssessmentResult(BaseModel):
    readingCorrect: Optional[int] = Field(None, ge=0, le=1000)
    mathCorrect: Optional[int] = Field(None, ge=0, le=1000)
    readingScore: Optional[float] = Field(None, ge=0, le=100)
    mathScore: Optional[float] = Field(None, ge=0, le=100)
    takenAt: Optional[str] = Field(None, max_length=64)


class StudentAnalysisRequest(BaseModel):
    student_id: str = Field(..., min_length=1, max_length=64)
    name: str = Field("Student", max_length=100)
    grade: str = Field("Grade 2", max_length=60)
    section: str = Field("Section A", max_length=60)
    reading_score: float = Field(0, ge=0, le=100)
    math_score: float = Field(0, ge=0, le=100)
    mastery: Dict[str, float] = Field(default_factory=dict)
    gaps: List[str] = Field(default_factory=list)
    activities: List[str] = Field(default_factory=list)
    materials_completed: List[str] = Field(default_factory=list)
    pretest: Optional[AssessmentResult] = None
    posttest: Optional[AssessmentResult] = None

    @validator("student_id")
    def clean_student_id(cls, v: str) -> str:
        return validate_id_field(v, "student_id")

    @validator("name", "grade", "section")
    def clean_text_fields(cls, v: str) -> str:
        return sanitize_text(v, max_len=100)

    @validator("mastery")
    def validate_mastery_scores(cls, mastery: Dict[str, float]) -> Dict[str, float]:
        """Keep skill mastery on the same percentage scale as placement scores."""
        clean_mastery = {}
        for skill, score in list(mastery.items())[:50]:
            clean_skill = sanitize_text(skill, max_len=60)
            clean_score = max(0.0, min(100.0, float(score or 0)))
            clean_mastery[clean_skill] = clean_score
        return clean_mastery

    @validator("gaps", "activities", "materials_completed")
    def clean_string_lists(cls, v: List[str]) -> List[str]:
        return [sanitize_text(item, max_len=80) for item in (v or [])[:50]]


class StudentLookupRequest(BaseModel):
    student_id: str = Field(..., min_length=1, max_length=64)

    @validator("student_id")
    def clean_student_id(cls, v: str) -> str:
        return validate_id_field(v, "student_id")


class LearningSessionRequest(BaseModel):
    student_id: str = Field(..., min_length=1, max_length=64)
    content_id: Optional[str] = Field(None, max_length=64)
    concepts: List[str] = Field(default_factory=list)
    performance: float = Field(0, ge=0, le=1)
    time_spent: float = Field(0, ge=0, le=86400)
    engagement_level: Optional[float] = Field(None, ge=0, le=1)
    interaction_count: int = Field(1, ge=0, le=10000)
    content_type: str = Field("game", max_length=40)

    @validator("student_id")
    def clean_student_id(cls, v: str) -> str:
        return validate_id_field(v, "student_id")

    @validator("content_id")
    def clean_content_id(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        return validate_id_field(v, "content_id")

    @validator("concepts")
    def clean_concepts(cls, v: List[str]) -> List[str]:
        return [sanitize_text(c, max_len=60) for c in (v or [])[:20]]

    @validator("content_type")
    def clean_content_type(cls, v: str) -> str:
        return sanitize_text(v, max_len=40) or "game"


# Kept as aliases so existing Python callers do not break.
LearningRequest = StudentAnalysisRequest


class LearningResponse(BaseModel):
    student_id: str
    recommendations: List[Dict]
    timestamp: str


class PronunciationRequest(BaseModel):
    student_id: str = Field(..., min_length=1, max_length=64)
    target_word: str = Field(..., min_length=1, max_length=64)
    spoken_word: str = Field("", max_length=64)
    score: float = Field(0, ge=0, le=100)
    confidence: float = Field(0, ge=0, le=1)
    points: int = Field(0, ge=0, le=10000)

    @validator("student_id")
    def clean_student_id(cls, v: str) -> str:
        return validate_id_field(v, "student_id")

    @validator("target_word", "spoken_word")
    def clean_words(cls, v: str) -> str:
        return sanitize_text(v, max_len=64)


class TutorFeedbackRequest(BaseModel):
    skill: str = Field(..., min_length=1, max_length=80)
    difficulty: str = Field("average", max_length=40)
    correct: bool = False
    prompt: str = Field("", max_length=500)

    @validator("skill")
    def clean_skill(cls, v: str) -> str:
        return sanitize_text(v, max_len=80)

    @validator("difficulty")
    def clean_diff(cls, v: str) -> str:
        return validate_difficulty(v)

    @validator("prompt")
    def clean_prompt(cls, v: str) -> str:
        return sanitize_text(v, max_len=500)


# ============================================
# ADAPTIVE TEST BANK & GAME ITEMS SCHEMAS
# ============================================

class GameItemSchema(BaseModel):
    id: str = Field(..., max_length=64)
    prompt: str = Field(..., max_length=500)
    answer: Any
    choices: List[Any] = Field(default_factory=list)
    a: Optional[Union[int, float]] = None
    b: Optional[Union[int, float]] = None
    tip: Optional[str] = Field(None, max_length=300)
    scaffold: Optional[str] = Field(None, max_length=300)
    targetSubtopic: Optional[str] = Field(None, max_length=100)
    isPersonalized: bool = True
    type: Optional[str] = Field(None, max_length=60)
    num: Optional[int] = None
    den: Optional[int] = None
    hundreds: Optional[int] = None
    tens: Optional[int] = None
    ones: Optional[int] = None
    story: Optional[str] = Field(None, max_length=1000)
    correctOp: Optional[str] = Field(None, max_length=20)


class PersonalizedGameItemsRequest(BaseModel):
    student_id: Optional[str] = Field("demo-student", max_length=64)
    activity_id: str = Field(..., min_length=1, max_length=64)
    difficulty: str = Field("easy", max_length=40)
    skill: Optional[str] = Field("", max_length=80)
    struggling: Optional[bool] = False
    mastery: Optional[Dict[str, float]] = Field(default_factory=dict)
    gaps: Optional[List[str]] = Field(default_factory=list)
    learning_progress: Optional[Dict[str, Any]] = Field(default_factory=dict)
    count: Optional[int] = Field(10, ge=1, le=50)
    subtopic: Optional[str] = Field(None, max_length=100)
    recent_performance: Optional[float] = Field(None, ge=0, le=1)
    failed_attempts: Optional[int] = Field(0, ge=0, le=1000)

    @validator("student_id")
    def clean_student_id(cls, v: Optional[str]) -> str:
        if not v:
            return "demo-student"
        return validate_id_field(v, "student_id")

    @validator("activity_id")
    def clean_activity_id(cls, v: str) -> str:
        return validate_id_field(v, "activity_id")

    @validator("difficulty")
    def clean_difficulty_val(cls, v: str) -> str:
        return validate_difficulty(v)

    @validator("skill", "subtopic")
    def clean_labels(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        return sanitize_text(v, max_len=100)


class PersonalizedGameItemsResponse(BaseModel):
    status: str = "success"
    activity_id: str
    difficulty: str
    student_id: Optional[str] = None
    target_subtopic: str
    reason: str
    count: int
    items: List[Dict[str, Any]]
    source: str = "adaptive_engine"
    timestamp: str


class StoreGameItemsRequest(BaseModel):
    activity_id: str = Field(..., min_length=1, max_length=64)
    difficulty: str = Field("easy", max_length=40)
    student_id: Optional[str] = Field(None, max_length=64)
    items: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @validator("activity_id")
    def clean_activity_id(cls, v: str) -> str:
        return validate_id_field(v, "activity_id")

    @validator("difficulty")
    def clean_diff(cls, v: str) -> str:
        return validate_difficulty(v)

    @validator("student_id")
    def clean_student_id(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        return validate_id_field(v, "student_id")

    @validator("items")
    def validate_items_len(cls, v: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if len(v) > 50:
            raise ValueError("Cannot store more than 50 items at once.")
        return v
