from flask import Flask
from flask_cors import CORS

from core.pipeline import RecognitionPipeline
from config import DETECTOR_PATH, EMBEDDER_PATH
from routes import detection_bp, enrollment_bp, recognition_bp

# =========================================================
# Flask App Initialization
# =========================================================
app = Flask(__name__)
CORS(app)

# =========================================================
# Pipeline Initialization
# =========================================================
# Initialize the recognition pipeline once and store in app config
# This allows all blueprints to access the same pipeline instance
pipe = RecognitionPipeline(
    detector_path=DETECTOR_PATH,
    embedder_path=EMBEDDER_PATH
)

# Store pipeline in app config for blueprint access
app.config['RECOGNITION_PIPELINE'] = pipe

# =========================================================
# Health Check Endpoint
# =========================================================
@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint for system status monitoring"""
    return {
        "status": "online",
        "message": "AI Recognition Server is running",
        "service": "Face Recognition API"
    }, 200

# =========================================================
# Blueprint Registration
# =========================================================
# Register all route blueprints
app.register_blueprint(detection_bp)
app.register_blueprint(enrollment_bp)
app.register_blueprint(recognition_bp)

# =========================================================
# Run Server
# =========================================================
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )