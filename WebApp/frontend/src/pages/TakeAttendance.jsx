import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    ArrowLeft,
    Camera,
    CheckCircle,
    XCircle,
    Users,
    Save,
    RefreshCcw,
    Loader2,
    VideoOff
} from "lucide-react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import Toast from "../components/ui/Toast";
import { fetchAcademicClassById } from "../services/academicClass.service";
import apiClient from "../utills/apiClient";

export default function TakeAttendance() {
    const { id: classId } = useParams();
    const navigate = useNavigate();
    const FLASK_API_URL = "http://localhost:5001";

    // State
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [presentStudents, setPresentStudents] = useState(new Set());
    const [lastRecognized, setLastRecognized] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Load class details
    useEffect(() => {
        const loadClass = async () => {
            try {
                const res = await fetchAcademicClassById(classId);
                setClassData(res.data.data);
            } catch (err) {
                setToast({ message: "Failed to load class details", type: "error" });
            } finally {
                setLoading(false);
            }
        };
        loadClass();
    }, [classId]);

    // Handle Camera Start/Stop
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            setCameraStream(stream);
            setIsCameraActive(true);
            // Note: videoRef.current might be null here because it hasn't rendered yet
            // The useEffect below will handle attaching the stream
        } catch (err) {
            setToast({ message: "Camera access denied", type: "error" });
        }
    };

    // Effect to attach stream when video element is ready
    useEffect(() => {
        if (isCameraActive && cameraStream && videoRef.current) {
            videoRef.current.srcObject = cameraStream;
        }
    }, [isCameraActive, cameraStream]);

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
            setIsCameraActive(false);
        }
    };

    // Recognition Loop
    useEffect(() => {
        let interval;
        if (isCameraActive && videoRef.current) {
            interval = setInterval(async () => {
                if (!videoRef.current || !canvasRef.current) return;

                const video = videoRef.current;
                const canvas = document.createElement("canvas");
                canvas.width = 640;
                canvas.height = 480;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(video, 0, 0, 640, 480);

                const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg"));
                const formData = new FormData();
                formData.append("image", blob);

                try {
                    // Prepare roll numbers for filtering
                    const rollNos = classData?.Students?.map(s => s.RollNo).join(",") || "";
                    formData.append("roll_nos", rollNos);

                    // 1. Recognize All Faces (Multi-face detection is now integrated)
                    const recognizeRes = await axios.post(`${FLASK_API_URL}/recognize`, formData);
                    const { faces_detected, results } = recognizeRes.data;

                    // 2. Draw bboxes for all detected faces on overlay canvas
                    if (canvasRef.current) {
                        const overlayCtx = canvasRef.current.getContext("2d");
                        overlayCtx.clearRect(0, 0, 640, 480);

                        if (results && results.length > 0) {
                            results.forEach(res => {
                                const [x1, y1, x2, y2] = res.bbox;
                                // Use green for matches, red for unknowns
                                overlayCtx.strokeStyle = res.match ? "#00FF00" : "#FF0000";
                                overlayCtx.lineWidth = 3;
                                overlayCtx.strokeRect(x1, y1, x2 - x1, y2 - y1);

                                // Optional: Draw name above bbox if matched
                                if (res.match && res.student) {
                                    overlayCtx.fillStyle = "#00FF00";
                                    overlayCtx.font = "bold 16px Arial";
                                    overlayCtx.fillText(res.student.name, x1, y1 > 20 ? y1 - 5 : y1 + 20);
                                }
                            });
                        }
                    }

                    // 3. Process matched students
                    if (results && results.length > 0) {
                        results.forEach(res => {
                            if (res.match && res.student) {
                                const student = res.student;

                                setPresentStudents(prev => {
                                    if (prev.has(student.roll_no)) return prev;
                                    const next = new Set(prev);
                                    next.add(student.roll_no);
                                    return next;
                                });

                                setLastRecognized(student.name);
                                // Clear name display after 2 seconds
                                setTimeout(() => setLastRecognized(null), 2000);
                            }
                        });
                    }
                } catch (err) {
                    console.error("AI Server Error:", err);
                }
            }, 500); // Run every 500ms
        }
        return () => clearInterval(interval);
    }, [isCameraActive, classData]);

    // Handle manual marking
    const toggleAttendance = (rollNo) => {
        setPresentStudents(prev => {
            const next = new Set(prev);
            if (next.has(rollNo)) next.delete(rollNo);
            else next.add(rollNo);
            return next;
        });
    };

    // Save Attendance to Backend
    const handleSave = async () => {
        if (presentStudents.size === 0) {
            if (!window.confirm("No students marked present. Are you sure?")) return;
        }

        try {
            setSaving(true);
            const attendanceRecords = classData.Students.map(student => ({
                Student: student._id,
                Status: presentStudents.has(student.RollNo) ? "present" : "absent"
            }));

            await apiClient.post("/attendance", {
                academicClassId: classId,
                date: new Date().toISOString(),
                attendanceRecords,
                sessionType: "lecture"
            });

            setToast({ message: "Attendance saved successfully!", type: "success" });
            setTimeout(() => navigate(`/admin/academic-class/${classId}`), 1500);
        } catch (err) {
            setToast({ message: "Failed to save attendance", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-24">
            <NavBar />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <main className="flex-1 container mx-auto px-6 py-8 max-w-7xl">
                <div className="flex justify-between items-center mb-8">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-cyan-600">
                        <ArrowLeft className="w-5 h-5" /> Back
                    </button>
                    <div className="text-right">
                        <h1 className="text-2xl font-bold text-gray-800">{classData?.ClassName}</h1>
                        <p className="text-gray-500">{classData?.Subject?.SubjectName}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Camera Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-black rounded-3xl overflow-hidden relative shadow-2xl aspect-video flex items-center justify-center border-4 border-white">
                            {!isCameraActive ? (
                                <div className="text-center text-gray-500">
                                    <VideoOff className="w-20 h-20 mx-auto mb-4 opacity-20" />
                                    <p>Camera is inactive</p>
                                    <button onClick={startCamera} className="mt-4 px-8 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-all">
                                        Start Detection
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                    <canvas ref={canvasRef} width={640} height={480} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
                                    <button
                                        onClick={stopCamera}
                                        className="absolute bottom-6 right-6 p-4 bg-red-600/80 text-white rounded-full hover:bg-red-700 transition-all backdrop-blur-md"
                                        title="Stop Camera"
                                    >
                                        <VideoOff className="w-6 h-6" />
                                    </button>

                                    {lastRecognized && (
                                        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-emerald-500/90 text-white px-6 py-2 rounded-full font-bold shadow-lg animate-bounce backdrop-blur-md">
                                            ✅ Recognized: {lastRecognized}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-gray-500 text-sm font-semibold uppercase">Present</p>
                                    <p className="text-3xl font-extrabold text-emerald-600">{presentStudents.size}</p>
                                </div>
                                <div className="w-px h-12 bg-gray-100"></div>
                                <div className="text-center">
                                    <p className="text-gray-500 text-sm font-semibold uppercase">Absent</p>
                                    <p className="text-3xl font-extrabold text-red-500">{(classData?.Students?.length || 0) - presentStudents.size}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-10 py-4 bg-cyan-600 text-white rounded-2xl font-bold hover:bg-cyan-700 transition-all flex items-center gap-3 shadow-xl disabled:bg-gray-400"
                            >
                                {saving ? <Loader2 className="animate-spin" /> : <Save className="w-6 h-6" />}
                                Finalize Attendance
                            </button>
                        </div>
                    </div>

                    {/* Student List Section */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Users className="w-5 h-5 text-cyan-600" />
                                Student Roster
                            </h2>
                            <button onClick={() => setPresentStudents(new Set())} className="text-gray-400 hover:text-red-500 transition-colors">
                                <RefreshCcw className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[600px]">
                            {classData?.Students?.map(student => (
                                <div
                                    key={student._id}
                                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group ${presentStudents.has(student.RollNo)
                                        ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                                        : 'bg-white border-gray-100 hover:border-cyan-200'
                                        }`}
                                    onClick={() => toggleAttendance(student.RollNo)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${presentStudents.has(student.RollNo)
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-gray-100 text-gray-500 group-hover:bg-cyan-100 group-hover:text-cyan-600'
                                            }`}>
                                            {student.RollNo}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{student.FullName}</p>
                                            <p className="text-xs text-gray-500">Roll: {student.RollNo}</p>
                                        </div>
                                    </div>
                                    {presentStudents.has(student.RollNo) ? (
                                        <CheckCircle className="text-emerald-500 w-6 h-6" />
                                    ) : (
                                        <XCircle className="text-gray-200 w-6 h-6 group-hover:text-cyan-200" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
