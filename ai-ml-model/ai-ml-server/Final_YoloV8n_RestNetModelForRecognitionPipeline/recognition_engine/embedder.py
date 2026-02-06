import cv2
import numpy as np
import onnxruntime as ort

class FaceEmbedder:
    def __init__(self, model_path):
        # Enable CUDA
        providers = ['CUDAExecutionProvider', 'CPUExecutionProvider']
        
        self.session = ort.InferenceSession(model_path, providers=providers)
        self.input_name = self.session.get_inputs()[0].name
        self.input_shape = (112, 112)

    def preprocess(self, face_crop):
        face_rgb = cv2.cvtColor(face_crop, cv2.COLOR_BGR2RGB)
        face_resized = cv2.resize(face_rgb, self.input_shape)
        # Standard ArcFace Normalization: (x - 127.5) / 128.0
        img_data = (face_resized.astype(np.float32) - 127.5) / 128.0
        img_data = np.transpose(img_data, (2, 0, 1))
        return np.expand_dims(img_data, axis=0)

    def get_embedding(self, face_crop):
        blob = self.preprocess(face_crop)
        outputs = self.session.run(None, {self.input_name: blob})
        
        # Flatten to 1D vector (512,)
        embedding = outputs[0].flatten()
        
        # L2 Normalization (Required for Cosine Similarity)
        norm = np.linalg.norm(embedding)
        if norm > 1e-6:
            embedding = embedding / norm
        return embedding