import cv2
import numpy as np
import time
import onnxruntime as ort
from pipeline import RecognitionPipeline

def run_camera_test():
    # Verification: Ensure CUDA is visible to ONNX
    print(f"[DEBUG] Available Providers: {ort.get_available_providers()}")
    
    detector_path = "../Detector/best.onnx"
    embedder_path = "../embedding/w600k_r50.onnx"
    
    print("[INFO] Initializing GPU Pipeline...")
    pipe = RecognitionPipeline(detector_path, embedder_path)
    
    cap = cv2.VideoCapture("http://192.168.1.81:4747/video")
    if not cap.isOpened():
        print("[ERROR] Could not open IP camera stream.")
        return

    reference_embedding = None

    while True:
        ret, frame = cap.read()
        if not ret: break

        frame = cv2.flip(frame, 1)
        start_time = time.time()
        
        # Inference
        embedding, bbox = pipe.process_image(frame)
        
        inf_ms = (time.time() - start_time) * 1000

        if bbox is not None:
            x1, y1, x2, y2 = bbox
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            if reference_embedding is not None and embedding is not None:
                sim = pipe.compute_similarity(embedding, reference_embedding)
                color = (0, 255, 0) if sim > 0.45 else (0, 0, 255)
                text = f"Match: {sim:.2f}" if sim > 0.45 else f"Unknown: {sim:.2f}"
                cv2.putText(frame, text, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        # Performance Overlay
        cv2.putText(frame, f"GPU Inference: {inf_ms:.1f}ms", (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

        cv2.imshow("GPU Face Recognition Test", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('s') and embedding is not None:
            reference_embedding = embedding
            print("[INFO] Reference Saved.")
        elif key == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run_camera_test()