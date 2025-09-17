# 🎓 AI Attendance System (Final Year Project)

An advanced attendance management system that leverages **Face Recognition** to automate attendance marking.  
The system consists of a **Python backend (AI + API)** and a **React frontend (WebApp)**, making it efficient, scalable, and user-friendly.

---

## 📂 Project Structure
```plaintext
AI_Attendance_System/
├── AI_And_ML_Model/            # AI & ML-related resources
│   ├── data/                   # Dataset storage
│   │   ├── faces/              # Cropped faces for training & inference
│   │   ├── processed/          # Preprocessed/cleaned dataset
│   │   └── raw/                # Raw image dataset (collected samples)
│   ├── docs/                   # Documentation for AI model
│   ├── models/                 # Trained model files (.h5, .pkl, etc.)
│   ├── notebooks/              # Jupyter notebooks for experiments
│   └── scripts/                # Python scripts for preprocessing, training, testing
│
└── WebApp/                     # Full-stack web application
    ├── Backend/                # Backend (Node.js/Express API)
    │   ├── Controller/         # Business logic & request handling
    │   ├── Middleware/         # Authentication & custom middlewares
    │   ├── Model/              # Database models (Mongoose/ORM)
    │   ├── routes/             # API routes
    │   ├── Utills/             # Utility/helper functions
    │   ├── node_modules/       # Installed dependencies
    │   └── package.json        # Backend dependencies & scripts
    │
    └── Frontend/               # Frontend (React.js app)
        └── react_frontend/
            ├── components/     # Reusable UI components
            ├── context/        # React Context API for global state
            ├── hooks/          # Custom React hooks
            ├── pages/          # Page components (routes)
            ├── public/         # Static assets (favicon, index.html)
            ├── src/            # Source code
            │   └── assets/     # Images, icons, etc.
            └── utills/         # Utility functions

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
