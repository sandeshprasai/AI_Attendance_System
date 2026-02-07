import os

# =========================================================
# MongoDB Configuration
# =========================================================
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/AI_Attendance_System")
DB_NAME = "AI_Attendance_System"
STUDENTS_COLLECTION = "students"
EMBEDDINGS_COLLECTION = "studentembeddings"

# =========================================================
# Paths & Storage
# =========================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
IMAGES_DIR = os.path.join(DATA_DIR, "images")

# Ensure images directory exists
os.makedirs(IMAGES_DIR, exist_ok=True)

# =========================================================
# Model Paths
# =========================================================
DETECTOR_PATH = os.path.join(BASE_DIR, "../Detector/best.onnx")
EMBEDDER_PATH = os.path.join(BASE_DIR, "../embedding/w600k_r50.onnx")
