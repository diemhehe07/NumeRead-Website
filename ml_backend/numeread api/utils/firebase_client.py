import os
import json
import logging
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore

logger = logging.getLogger("numeread.firebase")

# Root folder of the NumeRead API project
BASE_DIR = Path(__file__).resolve().parent.parent

# Default location of Firebase service account key
DEFAULT_CREDENTIALS_PATH = (
    BASE_DIR
    / "firebase_credentials"
    / "serviceAccountKey.json"
)

PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID", "numeread-webapp")

db = None


def initialize_firebase():
    global db

    if firebase_admin._apps:
        try:
            db = firestore.client()
            return db
        except Exception as e:
            logger.warning(f"Failed to get existing Firestore client: {e}")
            return None

    cred = None

    # 1. Check raw JSON in environment variable (ideal for cloud containers / PaaS)
    env_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
    if env_json:
        try:
            cred_dict = json.loads(env_json)
            cred = credentials.Certificate(cred_dict)
            logger.info("Loaded Firebase credentials from FIREBASE_SERVICE_ACCOUNT_JSON environment variable.")
        except Exception as e:
            logger.error(f"Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: {e}")

    # 2. Check custom file path from environment variable
    if cred is None:
        custom_path = os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH")
        if custom_path:
            p = Path(custom_path).resolve()
            if p.exists():
                cred = credentials.Certificate(str(p))
                logger.info(f"Loaded Firebase credentials from custom path: {p}")
            else:
                logger.warning(f"FIREBASE_SERVICE_ACCOUNT_PATH specified but file not found: {p}")

    # 3. Check default local path in firebase_credentials/
    if cred is None and DEFAULT_CREDENTIALS_PATH.exists():
        cred = credentials.Certificate(str(DEFAULT_CREDENTIALS_PATH))
        logger.info(f"Loaded Firebase credentials from {DEFAULT_CREDENTIALS_PATH}")

    # 4. Check Google Application Default Credentials (GCP environment)
    if cred is None and os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
        try:
            cred = credentials.ApplicationDefault()
            logger.info("Loaded Firebase credentials via Application Default Credentials.")
        except Exception as e:
            logger.warning(f"ADC initialization failed: {e}")

    if cred is not None:
        try:
            firebase_admin.initialize_app(
                cred,
                {"projectId": PROJECT_ID}
            )
            db = firestore.client()
            logger.info(f"Firebase Firestore initialized for project '{PROJECT_ID}'.")
            return db
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin app: {e}")
            return None
    else:
        logger.warning(
            "Firebase credentials not found. Firestore features will be disabled. "
            "To enable, place serviceAccountKey.json in 'firebase_credentials/' "
            "or set FIREBASE_SERVICE_ACCOUNT_JSON / FIREBASE_SERVICE_ACCOUNT_PATH."
        )
        return None


def get_db():
    global db
    if db is None:
        db = initialize_firebase()
    return db


# Initialize upon module import
initialize_firebase()