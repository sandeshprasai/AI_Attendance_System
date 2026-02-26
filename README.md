# Advanced Attendance System using Face Recognition

A fully-functional intelligent attendance management system that leverages deep learning and face recognition technology to automate attendance tracking.

> **Final Year Engineering Major Project (5 Credits)**  
> Pokhara University | Cosmos College of Management and Technology

## ✨ Features

### AI/ML Model
- **Face Recognition**: Deep learning model built with TensorFlow and Keras
- **Image Processing**: Advanced preprocessing and augmentation using OpenCV and Albumentations
- **Model Training**: Complete training pipeline with train/validation/test splits
- **Real-time Detection**: YOLOv8 integration for face detection

### Web Application
- **Modern UI**: React-based frontend with TailwindCSS and Vite
- **RESTful API**: Node.js/Express backend with JWT authentication
- **Database**: MongoDB integration for data persistence
- **Image Upload**: Cloudinary integration for image storage
- **Logging**: Winston-based logging system with daily rotation
- **Email Notifications**: Nodemailer integration for alerts

### Security & Validation
- Password encryption with bcrypt
- JWT token-based authentication
- Input validation with Joi
- CORS configuration

## 🚀 Installation

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- MongoDB
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/Advanced-Attendance-System-using-Face-Recognition.git
cd Advanced-Attendance-System-using-Face-Recognition
```

### 2. Backend Setup
```bash
cd WebApp/backend
npm install
```

Create a `.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

Start the backend:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd WebApp/frontend
npm install
npm run dev
```

### 4. AI/ML Model Setup
```bash
cd ai-ml-model
python -m venv MyVenv
source MyVenv/bin/activate  # On Windows: MyVenv\Scripts\activate
pip install -r requirements.txt
```

## 📁 Project Structure
```
├── ai-ml-model/          # AI/ML model training and inference
│   ├── models/           # Trained models
│   ├── notebooks/        # Jupyter notebooks
│   └── scripts/          # Python scripts
├── WebApp/
│   ├── backend/          # Node.js Express API
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   └── middlewares/  # Custom middlewares
│   └── frontend/         # React application
│       └── src/          # Source code
└── README.md
```

## 🛠️ Tech Stack

**Frontend:** React 19, TailwindCSS, Vite, React Router, Axios  
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT  
**AI/ML:** TensorFlow, Keras, OpenCV, YOLOv8, scikit-learn  
**Tools:** Cloudinary, Nodemailer, Winston, Multer

## 📊 Project Status

| Component                     | Status       |
|-------------------------------|--------------|
| Data collection               | ✅ Completed |
| Data preprocessing            | ✅ Completed |
| Data augmentation             | ✅ Completed |
| Train/Validation/Test split   | ✅ Completed |
| Model training                | ✅ Completed |
| Model integration             | ✅ Completed |
| Web application               | ✅ Completed |
| Testing & Deployment          | ✅ Completed |

**Status:** ✅ Production Ready

## 👨‍💻 Developers

- **Santu Yadav** - [santuyadav732@gmail.com](mailto:santuyadav732@gmail.com)
- **Sandesh Prasai**

## 🏛️ Institution

**Cosmos College of Management and Technology**  
Pokhara University  
Final Year Engineering Project (5 Credits)

## 📝 License

This project is licensed to **Cosmos College of Management and Technology** and developed as part of the final year engineering curriculum at Pokhara University.

All rights reserved © 2026 Santu Yadav & Sandesh Prasai

## 📧 Contact

For inquiries, questions, or collaboration:  
📩 Email: [santuyadav732@gmail.com](mailto:santuyadav732@gmail.com)

---

**Acknowledgments:** Special thanks to Cosmos College of Management and Technology and Pokhara University for their support and guidance throughout this project.
