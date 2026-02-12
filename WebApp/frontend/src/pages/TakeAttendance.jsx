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
    VideoOff,
    Clock,
    CheckCheck
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
    const [lastRecognized, setLastRecognized] = useState(null);

    // NEW: Snapshot-based attendance state
    const [sessionId, setSessionId] = useState(null);
    const [currentSnapshot, setCurrentSnapshot] = useState(0);
    const [requiredSnapshots] = useState(4);
    const [snapshots, setSnapshots] = useState([]); // Store all 4 snapshots
    const [currentPresentStudents, setCurrentPresentStudents] = useState(new Set());
    const [sessionStatus, setSessionStatus] = useState("not_started"); // not_started, in_progress, finalized
    const [snapshotTimer, setSnapshotTimer] = useState(null);
    const [nextSnapshotTime, setNextSnapshotTime] = useState(null);

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

    // Timer countdown for next snapshot
    useEffect(() => {
        if (!nextSnapshotTime) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = nextSnapshotTime - now;
            
            if (remaining <= 0) {
                setSnapshotTimer(null);
                setNextSnapshotTime(null);
            } else {
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                setSnapshotTimer(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [nextSnapshotTime]);

    // Handle Camera Start/Stop
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            setCameraStream(stream);
            setIsCameraActive(true);
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
        if (isCameraActive && videoRef.current && sessionStatus !== "finalized") {
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

                    // 1. Recognize All Faces
                    const recognizeRes = await axios.post(`${FLASK_API_URL}/recognize`, formData);
                    const { faces_detected, results } = recognizeRes.data;

                    // 2. Draw bboxes for all detected faces on overlay canvas
                    if (canvasRef.current) {
                        const overlayCtx = canvasRef.current.getContext("2d");
                        overlayCtx.clearRect(0, 0, 640, 480);

                        if (results && results.length > 0) {
                            results.forEach(res => {
                                const [x1, y1, x2, y2] = res.bbox;
                                overlayCtx.strokeStyle = res.match ? "#00FF00" : "#FF0000";
                                overlayCtx.lineWidth = 3;
                                overlayCtx.strokeRect(x1, y1, x2 - x1, y2 - y1);

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

                                setCurrentPresentStudents(prev => {
                                    if (prev.has(student.roll_no)) return prev;
                                    const next = new Set(prev);
                                    next.add(student.roll_no);
                                    return next;
                                });

                                setLastRecognized(student.name);
                                setTimeout(() => setLastRecognized(null), 2000);
                            }
                        });
                    }
                } catch (err) {
                    console.error("AI Server Error:", err);
                }
            }, 500);
        }
        return () => clearInterval(interval);
    }, [isCameraActive, classData, sessionStatus]);

    // Handle manual marking
    const toggleAttendance = (rollNo) => {
        setCurrentPresentStudents(prev => {
            const next = new Set(prev);
            if (next.has(rollNo)) next.delete(rollNo);
            else next.add(rollNo);
            return next;
        });
    };

    // NEW: Save individual snapshot
    const handleSaveSnapshot = async () => {
        if (currentPresentStudents.size === 0) {
            if (!window.confirm("No students marked present. Continue?")) return;
        }

        try {
            setSaving(true);
            const snapshotNumber = currentSnapshot + 1;

            // Prepare recognized students for this snapshot
            const recognizedStudents = classData.Students.map(student => ({
                Student: student._id,
                Status: currentPresentStudents.has(student.RollNo) ? "present" : "absent",
                MarkedAt: new Date().toISOString(),
            }));

            const payload = {
                academicClassId: classId,
                date: new Date().toISOString().split('T')[0],
                snapshotNumber: snapshotNumber,
                recognizedStudents: recognizedStudents,
                sessionType: "lecture",
                requiredSnapshots: requiredSnapshots,
            };

            // Add sessionId if this is not the first snapshot
            if (sessionId) {
                payload.sessionId = sessionId;
            }

            const response = await apiClient.post("/attendance/snapshot", payload);

            if (response.data.success) {
                const newSessionId = response.data.data.sessionId;
                const status = response.data.data.status;

                // Save sessionId from first snapshot
                if (!sessionId) {
                    setSessionId(newSessionId);
                }

                // Store this snapshot data
                setSnapshots(prev => [
                    ...prev,
                    {
                        number: snapshotNumber,
                        timestamp: new Date(),
                        presentCount: currentPresentStudents.size,
                        presentStudents: new Set(currentPresentStudents),
                    }
                ]);

                setCurrentSnapshot(snapshotNumber);
                setSessionStatus(status === "finalized" ? "finalized" : "in_progress");

                // Clear current selection for next snapshot
                setCurrentPresentStudents(new Set());

                // Set timer for next snapshot (15 minutes)
                if (snapshotNumber < requiredSnapshots) {
                    const nextTime = Date.now() + (15 * 60 * 1000); // 15 minutes
                    setNextSnapshotTime(nextTime);
                    setToast({ 
                        message: `Snapshot ${snapshotNumber}/${requiredSnapshots} saved! Next in 15 min`, 
                        type: "success" 
                    });
                } else {
                    setToast({ 
                        message: "All snapshots complete! Attendance finalized.", 
                        type: "success" 
                    });
                    setTimeout(() => navigate(`/admin/academic-class/${classId}`), 2000);
                }
            }
        } catch (err) {
            console.error('Save snapshot error:', err);
            
            // Extract meaningful error message
            let errorMessage = "Failed to save snapshot";
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            // Handle specific error cases
            if (errorMessage.includes('E11000') || errorMessage.includes('duplicate key')) {
                errorMessage = "⚠️ Database conflict detected! Please run the migration script first. See console for details.";
                console.error('\n❌ DUPLICATE KEY ERROR DETECTED!');
                console.error('The old unique index still exists in MongoDB.');
                console.error('\n🔧 FIX: Run this command from backend folder:');
                console.error('   node scripts/dropOldIndex.js\n');
            } else if (errorMessage.includes('Network Error') || errorMessage.includes('ECONNREFUSED')) {
                errorMessage = "Cannot connect to server. Please ensure backend is running on port 5000.";
            } else if (errorMessage.includes('AI server')) {
                errorMessage = "AI recognition server not responding. Please check if it's running on port 5001.";
            }
            
            setToast({ message: errorMessage, type: "error" });
        } finally {
            setSaving(false);
        }
    };

    // NEW: Finalize attendance early
    const handleFinalizeEarly = async () => {
        if (currentSnapshot === 0) {
            setToast({ message: "Take at least one snapshot first", type: "error" });
            return;
        }

        if (!window.confirm(`Finalize with only ${currentSnapshot}/${requiredSnapshots} snapshots?`)) {
            return;
        }

        try {
            setSaving(true);
            const response = await apiClient.post("/attendance/finalize", { sessionId });

            if (response.data.success) {
                setSessionStatus("finalized");
                setToast({ message: "Attendance finalized!", type: "success" });
                setTimeout(() => navigate(`/admin/academic-class/${classId}`), 1500);
            }
        } catch (err) {
            console.error('Finalize error:', err);
            
            let errorMessage = "Failed to finalize attendance";
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setToast({ message: errorMessage, type: "error" });
        } finally {
            setSaving(false);
        }
    };

    // Calculate overall presence across all snapshots
    const getStudentSnapshotCount = (rollNo) => {
        return snapshots.filter(snap => snap.presentStudents.has(rollNo)).length;
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

                {/* NEW: Snapshot Progress Bar */}
                <div className="mb-6 bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Attendance Progress</h3>
                            <p className="text-sm text-gray-500">Snapshot {currentSnapshot}/{requiredSnapshots}</p>
                        </div>
                        {snapshotTimer && (
                            <div className="flex items-center gap-2 bg-cyan-50 px-4 py-2 rounded-full">
                                <Clock className="w-4 h-4 text-cyan-600" />
                                <span className="text-cyan-600 font-bold">Next snapshot in: {snapshotTimer}</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="flex gap-2 mb-4">
                        {[...Array(requiredSnapshots)].map((_, idx) => (
                            <div
                                key={idx}
                                className={`flex-1 h-3 rounded-full transition-all ${
                                    idx < currentSnapshot
                                        ? 'bg-emerald-500'
                                        : idx === currentSnapshot
                                        ? 'bg-cyan-300 animate-pulse'
                                        : 'bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Snapshot History */}
                    {snapshots.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {snapshots.map((snap, idx) => (
                                <div key={idx} className="flex-shrink-0 bg-emerald-50 border border-emerald-200 rounded-xl p-3 min-w-[140px]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckCheck className="w-4 h-4 text-emerald-600" />
                                        <span className="text-sm font-bold text-emerald-700">Snapshot {snap.number}</span>
                                    </div>
                                    <p className="text-xs text-gray-600">{snap.timestamp.toLocaleTimeString()}</p>
                                    <p className="text-lg font-bold text-emerald-600">{snap.presentCount} present</p>
                                </div>
                            ))}
                        </div>
                    )}
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

                                    {/* Snapshot indicator */}
                                    <div className="absolute top-6 right-6 bg-cyan-500/90 text-white px-4 py-2 rounded-full font-bold backdrop-blur-md">
                                        Snapshot {currentSnapshot + 1}/{requiredSnapshots}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-gray-500 text-sm font-semibold uppercase">Current Present</p>
                                    <p className="text-3xl font-extrabold text-emerald-600">{currentPresentStudents.size}</p>
                                </div>
                                <div className="w-px h-12 bg-gray-100"></div>
                                <div className="text-center">
                                    <p className="text-gray-500 text-sm font-semibold uppercase">Current Absent</p>
                                    <p className="text-3xl font-extrabold text-red-500">{(classData?.Students?.length || 0) - currentPresentStudents.size}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {sessionStatus !== "finalized" && (
                                    <>
                                        <button
                                            onClick={handleSaveSnapshot}
                                            disabled={saving || sessionStatus === "finalized"}
                                            className="px-8 py-4 bg-cyan-600 text-white rounded-2xl font-bold hover:bg-cyan-700 transition-all flex items-center gap-3 shadow-xl disabled:bg-gray-400"
                                        >
                                            {saving ? <Loader2 className="animate-spin" /> : <Camera className="w-6 h-6" />}
                                            Save Snapshot {currentSnapshot + 1}
                                        </button>
                                        {currentSnapshot > 0 && (
                                            <button
                                                onClick={handleFinalizeEarly}
                                                disabled={saving}
                                                className="px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-3 shadow-xl disabled:bg-gray-400"
                                            >
                                                <CheckCheck className="w-6 h-6" />
                                                Finalize Early
                                            </button>
                                        )}
                                    </>
                                )}
                                {sessionStatus === "finalized" && (
                                    <div className="px-8 py-4 bg-emerald-100 text-emerald-700 rounded-2xl font-bold flex items-center gap-3">
                                        <CheckCircle className="w-6 h-6" />
                                        Finalized!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Student List Section */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Users className="w-5 h-5 text-cyan-600" />
                                Student Roster
                            </h2>
                            <button onClick={() => setCurrentPresentStudents(new Set())} className="text-gray-400 hover:text-red-500 transition-colors">
                                <RefreshCcw className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[600px]">
                            {classData?.Students?.map(student => {
                                const snapshotCount = getStudentSnapshotCount(student.RollNo);
                                const isCurrentlyPresent = currentPresentStudents.has(student.RollNo);
                                
                                return (
                                    <div
                                        key={student._id}
                                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group ${
                                            isCurrentlyPresent
                                                ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                                                : 'bg-white border-gray-100 hover:border-cyan-200'
                                        }`}
                                        onClick={() => toggleAttendance(student.RollNo)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                                isCurrentlyPresent
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-gray-100 text-gray-500 group-hover:bg-cyan-100 group-hover:text-cyan-600'
                                            }`}>
                                                {student.RollNo}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{student.FullName}</p>
                                                <p className="text-xs text-gray-500">
                                                    Roll: {student.RollNo}
                                                    {snapshotCount > 0 && (
                                                        <span className="ml-2 text-emerald-600 font-semibold">
                                                            • {snapshotCount}/{currentSnapshot} snapshots
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        {isCurrentlyPresent ? (
                                            <CheckCircle className="text-emerald-500 w-6 h-6" />
                                        ) : (
                                            <XCircle className="text-gray-200 w-6 h-6 group-hover:text-cyan-200" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
