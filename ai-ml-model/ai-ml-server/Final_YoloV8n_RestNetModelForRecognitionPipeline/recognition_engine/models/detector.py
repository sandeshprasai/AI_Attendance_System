import cv2
import numpy as np
import onnxruntime as ort

class FaceDetector:
    def __init__(self, model_path, input_size=(512, 512), conf_threshold=0.5):
        # Configure providers optimized for M2 Mac
        providers = [
            'CoreMLExecutionProvider',  # M2 Neural Engine acceleration
            'CPUExecutionProvider'
        ]
        
        # Session options for speed
        options = ort.SessionOptions()
        options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        options.intra_op_num_threads = 4  # Optimize for M2
        options.inter_op_num_threads = 4
        
        self.session = ort.InferenceSession(model_path, sess_options=options, providers=providers)
        self.input_size = input_size
        self.conf_threshold = conf_threshold
        self.input_name = self.session.get_inputs()[0].name

    def preprocess(self, img):
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(img_rgb, self.input_size)
        img_data = img_resized.astype(np.float32) / 255.0
        img_data = np.transpose(img_data, (2, 0, 1))
        return np.expand_dims(img_data, axis=0)

    def detect(self, image):
        h, w = image.shape[:2]
        blob = self.preprocess(image)
        outputs = self.session.run(None, {self.input_name: blob})
        
        # Shape: (1, 5, 5376) -> Transpose to (5376, 5)
        output = np.squeeze(outputs[0]).T 
        
        faces = []
        for row in output:
            conf = row[4]
            if conf > self.conf_threshold:
                cx, cy, nw, nh = row[0:4]
                # Map back to original image pixels
                x1 = int((cx - nw/2) * w / self.input_size[0])
                y1 = int((cy - nh/2) * h / self.input_size[1])
                x2 = int((cx + nw/2) * w / self.input_size[0])
                y2 = int((cy + nh/2) * h / self.input_size[1])
                
                faces.append({'bbox': [max(0, x1), max(0, y1), min(w, x2), min(h, y2)], 'conf': float(conf)})
        
        return sorted(faces, key=lambda x: x['conf'], reverse=True)