from ultralytics import YOLO
import os

# ---------------- CONFIG ----------------
PT_MODEL_PATH = ("/home/sandeshprasai/Projects/Final_Semester_Project/AI_Attendance_System/ai-ml-model/src/models/Final_YoloV8n_RestNetModelForRecognitionPipeline/Detector/best.pt"
)

ONNX_OUTPUT_DIR = ("/home/sandeshprasai/Projects/Final_Semester_Project/AI_Attendance_System/ai-ml-model/src/models/Final_YoloV8n_RestNetModelForRecognitionPipeline/Detector/YoloV8n_Detector.onnx"
)

IMG_SIZE = 512          # Must match training/inference size
OPSET = 12              # Stable for ONNX Runtime
DYNAMIC = True          # Dynamic batch size
SIMPLIFY = True         # Graph simplification
# ----------------------------------------

os.makedirs(ONNX_OUTPUT_DIR, exist_ok=True)

# Load YOLOv8 model
model = YOLO(PT_MODEL_PATH)

# Export to ONNX
model.export(
    format="onnx",
    imgsz=IMG_SIZE,
    opset=OPSET,
    dynamic=DYNAMIC,
    simplify=SIMPLIFY,
    half=False           # keep FP32 for compatibility
)

print("\n✅ YOLOv8 model successfully converted to ONNX")
print(f"📁 Saved in: {ONNX_OUTPUT_DIR}")
