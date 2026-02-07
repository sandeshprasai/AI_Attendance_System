import os
from dotenv import load_dotenv

# Load .env from the same directory as this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

# =========================================================
# MongoDB Configuration
# =========================================================
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "project3"
STUDENTS_COLLECTION = "students"
EMBEDDINGS_COLLECTION = "studentembeddings"

# =========================================================
# Paths & Storage
# =========================================================
DATA_DIR = os.path.join(BASE_DIR, "data")
IMAGES_DIR = os.path.join(DATA_DIR, "images")
os.makedirs(IMAGES_DIR, exist_ok=True)

# =========================================================
# Model Paths
# =========================================================
DETECTOR_PATH = os.path.join(BASE_DIR, "../Detector/best.onnx")
EMBEDDER_PATH = os.path.join(BASE_DIR, "../embedding/w600k_r50.onnx")
