from utils.firebase_client import get_db


class FirebaseService:

    def _get_db(self):
        db = get_db()
        if db is None:
            raise RuntimeError(
                "Firebase Firestore client is not initialized. "
                "Ensure serviceAccountKey.json is in 'firebase_credentials/' "
                "or configure FIREBASE_SERVICE_ACCOUNT_JSON / FIREBASE_SERVICE_ACCOUNT_PATH."
            )
        return db

    def is_available(self) -> bool:
        return get_db() is not None

    # ============================================
    # GET STUDENT
    # ============================================

    def get_student(self, student_id: str):
        db = self._get_db()
        document = (
            db
            .collection("students")
            .document(student_id)
            .get()
        )

        if not document.exists:
            return None

        return {
            "id": document.id,
            **document.to_dict()
        }

    # ============================================
    # GET ACTIVITY LOGS
    # ============================================

    def get_activity_logs(
        self,
        student_id: str
    ):
        db = self._get_db()
        documents = (
            db
            .collection("activityLogs")
            .where(
                "studentId",
                "==",
                student_id
            )
            .stream()
        )

        return [
            {
                "id": document.id,
                **document.to_dict()
            }
            for document in documents
        ]

    # ============================================
    # SAVE PRONUNCIATION RESULT
    # ============================================

    def save_pronunciation_result(
        self,
        result: dict
    ):
        from datetime import datetime, timezone

        db = self._get_db()
        result_data = {
            **result,
            "timestamp": (
                datetime.now(timezone.utc)
                .isoformat()
            )
        }

        document = (
            db
            .collection(
                "pronunciationAttempts"
            )
            .document()
        )

        document.set(result_data)

        return document.id