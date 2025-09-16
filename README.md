# 🎓 Advanced Attendance System using Face Recognition

An advanced attendance management system that leverages **Face Recognition** to automate attendance marking.  
The system consists of a **Python backend (AI + API)** and a **React frontend (WebApp)**, making it efficient, scalable, and user-friendly.

---

## 📂 Project Structure
```plaintext
AI_Attendance_System/
│── WebApp/            # Frontend (React) + Backend (Node)
│── data/              # Dataset storage (ignored in Git)
│   ├── raw/           # Original collected images (unprocessed)
│   ├── processed/     # Preprocessed/cleaned images for training
│   └── faces/         # Cropped faces used in training & inference
│── notebooks/         # Jupyter notebooks for experiments, EDA, and model prototyping
│── models/            # Trained ML/DL models (ignored in Git, shared externally if large)
│── docs/              # Documentation, reports, diagrams
│── scripts/           # Utility scripts for preprocessing, training, etc.
│── README.md          # Project overview and instructions
│── .gitignore         # Files/folders excluded from version control
│── requirements.txt   # Python dependencies

---
```


## ✅ Tasks Completed So Far

- **Dataset Collection**
  - Collected images of multiple subjects for training and testing.
  - Ensured dataset diversity (lighting, angles, backgrounds).
  - Organized into class-wise folders.

- **Project Structure Setup**
  - Created main repo with clean folder structure.
  - Added `.gitignore` to exclude large files (datasets, models, `node_modules`, venvs).
  - Added placeholders (`requirements.txt`, `Dockerfile`, `README.md`).

- **Environment Setup**
  - Defined Python virtual environment (`face_crop_env`) for backend.
  - Ensured compatibility for Jupyter notebooks & training pipelines.

- **Planning Documentation**
  - Defined roles of `raw`, `processed`, and `faces` datasets.
  - Structured repo to keep backend (Flask/FastAPI) and frontend (React) under `WebApp/`.

---

## 🚀 Next Steps

- **Preprocessing**
  - Convert collected images into consistent resolution (e.g., 224×224).
  - Perform face detection & cropping (`faces/` dataset).

- **Model Training**
  - Train a face recognition model (e.g., CNN, FaceNet, or OpenCV DNN).
  - Save trained models into `models/`.

- **Backend Development**
  - Implement API for attendance marking.
  - Integrate model inference in backend.

- **Frontend Development**
  - Build React interface for students & teachers.
  - Connect frontend with backend API.

- **Deployment**
  - Containerize with Docker.
  - Deploy on cloud (Heroku, Render, or similar).

---

## ⚠️ Notes

- Full datasets & trained models are **not uploaded** to GitHub (due to size).  
  Instead, they are stored externally (Google Drive / Hugging Face Datasets) and linked when needed.  

---

👨‍💻 **Developed by:** [Sandesh Prasai , Santu Yadav , Saurab Ghimire , Kiran Dhakal ]  
🎓 **B.E. Computer Engineering** – Cosmos College of Management and Technology
