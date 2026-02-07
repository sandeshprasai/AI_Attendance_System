import { useState, useRef, useEffect } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import Toast from "../components/ui/Toast";

export default function EnrollFace() {
    const FLASK_API_URL = "http://localhost:5001"; // Flask AI service URL

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [isCameraActive, setIsCameraActive] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [cameraStream, setCameraStream] = useState(null);

    // Camera device management
    const [availableCameras, setAvailableCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState("");

    const [formData, setFormData] = useState({
        student_id: "",
        name: "",
    });

    // Enumerate available cameras
    const enumerateCameras = async () => {
        try {
            console.log("Starting camera enumeration...");
            
            // Get all devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            console.log("Found video devices:", videoDevices);
            console.log("Number of cameras:", videoDevices.length);
            
            setAvailableCameras(videoDevices);
            
            // Set default camera if none selected
            if (videoDevices.length > 0 && !selectedCameraId) {
                setSelectedCameraId(videoDevices[0].deviceId);
                console.log("Default camera set to:", videoDevices[0].deviceId);
            }

            return videoDevices;
        } catch (error) {
            console.error("Error enumerating cameras:", error);
            return [];
        }
    };

    // Initial camera enumeration on mount
    useEffect(() => {
        const initCameras = async () => {
            await enumerateCameras();
        };

        initCameras();

        // Listen for device changes
        navigator.mediaDevices.addEventListener('devicechange', enumerateCameras);

        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', enumerateCameras);
        };
    }, []);

    // Fix: Attach stream to video element when it's rendered
    useEffect(() => {
        if (isCameraActive && cameraStream && videoRef.current) {
            console.log("Attaching stream to video element...");
            videoRef.current.srcObject = cameraStream;
            videoRef.current.play().catch(err => console.error("Error playing video:", err));
        }
    }, [isCameraActive, cameraStream]);

    // Debug: Log when camera state changes
    useEffect(() => {
        console.log("isCameraActive changed to:", isCameraActive);
        console.log("videoRef.current status:", videoRef.current ? "Present" : "Null");
        console.log("Available cameras count:", availableCameras.length);
    }, [isCameraActive, availableCameras]);

    // YOLO Bounding Box Detection Loop
    useEffect(() => {
        if (!isCameraActive) return;

        const interval = setInterval(async () => {
            if (!videoRef.current || !canvasRef.current) return;

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            // Set canvas size to match video
            canvas.width = 640;
            canvas.height = 480;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Capture current frame
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = 640;
            tempCanvas.height = 480;
            const tempCtx = tempCanvas.getContext("2d");
            tempCtx.drawImage(video, 0, 0, 640, 480);

            // Convert to blob
            const blob = await new Promise(resolve =>
                tempCanvas.toBlob(resolve, "image/jpeg")
            );

            const formData = new FormData();
            formData.append("image", blob);

            try {
                const response = await axios.post(
                    `${FLASK_API_URL}/detect-face`,
                    formData
                );

                const bbox = response.data?.bbox;
                if (!bbox) return;

                const [x1, y1, x2, y2] = bbox;

                // Draw bounding box on overlay canvas
                ctx.strokeStyle = "#00FF00";
                ctx.lineWidth = 3;
                ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

                // Optional: Add corner markers for better visibility
                const cornerSize = 20;
                ctx.lineWidth = 4;
                
                // Top-left corner
                ctx.beginPath();
                ctx.moveTo(x1, y1 + cornerSize);
                ctx.lineTo(x1, y1);
                ctx.lineTo(x1 + cornerSize, y1);
                ctx.stroke();
                
                // Top-right corner
                ctx.beginPath();
                ctx.moveTo(x2 - cornerSize, y1);
                ctx.lineTo(x2, y1);
                ctx.lineTo(x2, y1 + cornerSize);
                ctx.stroke();
                
                // Bottom-left corner
                ctx.beginPath();
                ctx.moveTo(x1, y2 - cornerSize);
                ctx.lineTo(x1, y2);
                ctx.lineTo(x1 + cornerSize, y2);
                ctx.stroke();
                
                // Bottom-right corner
                ctx.beginPath();
                ctx.moveTo(x2 - cornerSize, y2);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x2, y2 - cornerSize);
                ctx.stroke();

            } catch (error) {
                console.error("YOLO detection error:", error);
            }
        }, 350); // ~3 FPS (safe for Flask + ONNX)

        return () => clearInterval(interval);
    }, [isCameraActive, FLASK_API_URL]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle camera selection change
    const handleCameraChange = async (e) => {
        const newCameraId = e.target.value;
        console.log("Camera changed to:", newCameraId);
        setSelectedCameraId(newCameraId);

        // If camera is currently active, restart with new camera
        if (isCameraActive) {
            stopCamera();
            // Small delay to ensure cleanup
            setTimeout(() => {
                startCamera(newCameraId);
            }, 200);
        }
    };

    // Start camera with optional deviceId parameter
    const startCamera = async (deviceId = selectedCameraId) => {
        try {
            console.log("Requesting camera access for device:", deviceId);
            
            const constraints = {
                video: deviceId 
                    ? { 
                        deviceId: { exact: deviceId },
                        width: 640,
                        height: 480
                      }
                    : {
                        width: 640,
                        height: 480
                      }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            console.log("Camera access granted, stream acquired");

            // After getting permission, re-enumerate to get proper labels
            await enumerateCameras();

            // First, make the video element render
            setIsCameraActive(true);
            // Then, store the stream (the useEffect will handle attachment)
            setCameraStream(stream);

        } catch (error) {
            console.error("Camera error:", error);
            setToast({
                message: "Failed to access camera. Please check permissions.",
                type: "error",
            });
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop());
            setCameraStream(null);
            setIsCameraActive(false);
        }
    };

    // Capture image from camera
    const captureImage = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            const file = new File([blob], "captured.jpg", { type: "image/jpeg" });
            setCapturedImage(file);
            setImagePreview(URL.createObjectURL(blob));
            stopCamera();
        }, "image/jpeg");
    };

    // Handle file upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setCapturedImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    // Remove image
    const removeImage = () => {
        setCapturedImage(null);
        setImagePreview(null);
    };

    // Submit enrollment
    const handleSubmit = async () => {
        if (loading) return;

        // Validation
        if (!formData.student_id.trim()) {
            setToast({ message: "Student ID is required", type: "error" });
            return;
        }

        if (!formData.name.trim()) {
            setToast({ message: "Student name is required", type: "error" });
            return;
        }

        if (!capturedImage) {
            setToast({ message: "Please capture or upload an image", type: "error" });
            return;
        }

        try {
            setLoading(true);

            const data = new FormData();
            data.append("student_id", formData.student_id);
            data.append("name", formData.name);
            data.append("image", capturedImage);

            const response = await axios.post(`${FLASK_API_URL}/enroll`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setToast({
                message: response.data.message || "Student enrolled successfully!",
                type: "success",
            });

            // Reset form
            setFormData({ student_id: "", name: "" });
            setCapturedImage(null);
            setImagePreview(null);
        } catch (error) {
            setToast({
                message:
                    error.response?.data?.error ||
                    "Failed to enroll student. Please try again.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <NavBar />

            <div className="max-w-4xl mx-auto p-6 space-y-8 mb-16 pt-24">
                <h1 className="text-3xl font-bold text-gray-800">
                    Face Enrollment System
                </h1>

                {/* Student Information */}
                <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-gray-700">
                        Student Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Student ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="student_id"
                                value={formData.student_id}
                                onChange={handleInputChange}
                                disabled={loading}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="e.g., STU001"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                disabled={loading}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="e.g., John Doe"
                            />
                        </div>
                    </div>
                </div>

                {/* Camera Section */}
                <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-gray-700">
                        Capture Face Image
                    </h2>

                    {/* Camera Selection Dropdown - ALWAYS SHOW if cameras are available */}
                    {availableCameras.length > 0 && !imagePreview && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Camera {availableCameras.length > 1 && `(${availableCameras.length} available)`}
                            </label>
                            <select
                                value={selectedCameraId}
                                onChange={handleCameraChange}
                                disabled={loading || isCameraActive}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                {availableCameras.map((camera, index) => (
                                    <option key={camera.deviceId} value={camera.deviceId}>
                                        {camera.label || `Camera ${index + 1}`}
                                    </option>
                                ))}
                            </select>
                            {isCameraActive && availableCameras.length > 1 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Stop the camera to switch devices
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col items-center space-y-4">
                        {/* Video Preview with Bounding Box Overlay */}
                        {isCameraActive && (
                            <div className="relative inline-block">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    style={{ width: '640px', height: '480px' }}
                                    className="rounded-lg border-4 border-emerald-500"
                                />
                                <canvas
                                    ref={canvasRef}
                                    width={640}
                                    height={480}
                                    className="absolute top-0 left-0 pointer-events-none rounded-lg"
                                    style={{ width: '640px', height: '480px' }}
                                />
                            </div>
                        )}

                        {/* Image Preview */}
                        {imagePreview && !isCameraActive && (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="rounded-lg border-4 border-emerald-500 max-w-md"
                                />
                                <button
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {/* Camera Controls */}
                        <div className="flex gap-4">
                            {!isCameraActive && !imagePreview && (
                                <button
                                    onClick={() => startCamera()}
                                    disabled={loading || availableCameras.length === 0}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    📷 Start Camera
                                </button>
                            )}

                            {isCameraActive && (
                                <>
                                    <button
                                        onClick={captureImage}
                                        disabled={loading}
                                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-gray-400"
                                    >
                                        📸 Capture
                                    </button>
                                    <button
                                        onClick={stopCamera}
                                        disabled={loading}
                                        className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:bg-gray-400"
                                    >
                                        ⏹ Stop
                                    </button>
                                </>
                            )}
                        </div>

                        {/* File Upload Option */}
                        {!isCameraActive && !imagePreview && (
                            <div className="text-center">
                                <p className="text-gray-500 mb-2">Or upload an image</p>
                                <label className="cursor-pointer px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 inline-block">
                                    📁 Upload Image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={loading}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Hidden canvas for image capture */}
                    <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full px-6 py-3 rounded-xl text-white font-semibold ${loading ? "bg-gray-400" : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                >
                    {loading ? "Enrolling..." : "✓ Enroll Student"}
                </button>
            </div>

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
            <Footer />
        </div>
    );
}