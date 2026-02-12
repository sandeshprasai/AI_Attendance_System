import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import {
    ArrowLeft,
    Calendar,
    Clock,
    Users,
    CheckCircle,
    XCircle,
    User,
    BookOpen,
    Loader2,
    TrendingUp,
    Eye,
    CheckCheck,
} from "lucide-react";
import apiClient from "../utills/apiClient";

export default function AttendanceDetails() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attendanceData, setAttendanceData] = useState(null);

    useEffect(() => {
        loadAttendanceDetails();
    }, [sessionId]);

    const loadAttendanceDetails = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/attendance/session/${sessionId}`);
            setAttendanceData(res.data.data);
        } catch (err) {
            console.error("Failed to load attendance details:", err);
            setError("Failed to load attendance details. Session may not exist.");
        } finally {
            setLoading(false);
        }
    };

    // Get student's status in a specific snapshot
    const getStudentStatusInSnapshot = (snapshot, studentId) => {
        const record = snapshot.RecognizedStudents?.find(
            (r) => r.Student._id === studentId
        );
        return record?.Status || "absent";
    };

    // Get student's final attendance record
    const getStudentFinalRecord = (studentId) => {
        return attendanceData?.FinalAttendanceRecords?.find(
            (r) => r.Student._id === studentId
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <NavBar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading attendance details...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !attendanceData) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <NavBar />
                <main className="flex-1 flex items-center justify-center p-6">
                    <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {error || "Attendance Not Found"}
                        </h2>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-6 px-6 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-all"
                        >
                            Go Back
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Prepare student list from final records
    const allStudents = attendanceData.FinalAttendanceRecords || [];
    const presentStudents = allStudents.filter((r) => r.FinalStatus === "present");
    const absentStudents = allStudents.filter((r) => r.FinalStatus === "absent");

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-24">
            <NavBar />

            <main className="flex-1 container mx-auto px-6 py-8 max-w-7xl">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-semibold">Back</span>
                </button>

                {/* Header Section */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                {attendanceData.AcademicClass?.ClassName}
                            </h1>
                            <p className="text-gray-600 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                {attendanceData.Subject?.SubjectName} ({attendanceData.Subject?.SubjectCode})
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span className="font-semibold">
                                    {new Date(attendanceData.Date).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span className="font-semibold capitalize">{attendanceData.SessionType}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-cyan-500">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-600 text-sm font-semibold uppercase">Total Students</p>
                            <Users className="w-5 h-5 text-cyan-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{attendanceData.TotalStudents}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-emerald-500">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-600 text-sm font-semibold uppercase">Present</p>
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-3xl font-bold text-emerald-600">{attendanceData.PresentCount}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-600 text-sm font-semibold uppercase">Absent</p>
                            <XCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="text-3xl font-bold text-red-600">{attendanceData.AbsentCount}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-600 text-sm font-semibold uppercase">Attendance %</p>
                            <TrendingUp className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-3xl font-bold text-purple-600">{attendanceData.AttendancePercentage}%</p>
                    </div>
                </div>

                {/* Snapshot Summary */}
                {attendanceData.Snapshots && attendanceData.Snapshots.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <CheckCheck className="w-6 h-6 text-cyan-600" />
                            Snapshot Summary
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {attendanceData.Snapshots.map((snapshot, idx) => (
                                <div
                                    key={idx}
                                    className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {snapshot.SnapshotNumber}
                                        </div>
                                        <span className="font-bold text-gray-800">Snapshot {snapshot.SnapshotNumber}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        {new Date(snapshot.Timestamp).toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                    <p className="text-2xl font-bold text-emerald-600">
                                        {snapshot.RecognizedStudents?.filter((s) => s.Status !== "absent").length || 0}{" "}
                                        <span className="text-sm text-gray-600 font-normal">present</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Student Details Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Present Students */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-6 bg-emerald-50 border-b border-emerald-100">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                Present Students ({presentStudents.length})
                            </h2>
                        </div>
                        <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                            {presentStudents.map((record) => (
                                <div
                                    key={record.Student._id}
                                    className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {record.Student.FullName?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{record.Student.FullName}</p>
                                                <p className="text-sm text-gray-600">Roll: {record.Student.RollNo}</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                                            Present
                                        </span>
                                    </div>

                                    {/* Snapshot breakdown */}
                                    <div className="flex gap-2 mt-3">
                                        <span className="text-xs text-gray-600 font-semibold">Snapshots:</span>
                                        <div className="flex gap-1">
                                            {attendanceData.Snapshots?.map((snapshot, idx) => {
                                                const status = getStudentStatusInSnapshot(snapshot, record.Student._id);
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                            status !== "absent"
                                                                ? "bg-emerald-500 text-white"
                                                                : "bg-gray-200 text-gray-500"
                                                        }`}
                                                        title={`Snapshot ${snapshot.SnapshotNumber}: ${status}`}
                                                    >
                                                        {snapshot.SnapshotNumber}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <span className="text-xs text-emerald-600 font-bold ml-2">
                                            {record.PresenceCount}/{attendanceData.Snapshots?.length}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {presentStudents.length === 0 && (
                                <div className="text-center py-12">
                                    <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No students marked present</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Absent Students */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-6 bg-red-50 border-b border-red-100">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-red-600" />
                                Absent Students ({absentStudents.length})
                            </h2>
                        </div>
                        <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                            {absentStudents.map((record) => (
                                <div
                                    key={record.Student._id}
                                    className="p-4 rounded-2xl bg-red-50 border border-red-200 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {record.Student.FullName?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{record.Student.FullName}</p>
                                                <p className="text-sm text-gray-600">Roll: {record.Student.RollNo}</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                            Absent
                                        </span>
                                    </div>

                                    {/* Snapshot breakdown */}
                                    <div className="flex gap-2 mt-3">
                                        <span className="text-xs text-gray-600 font-semibold">Snapshots:</span>
                                        <div className="flex gap-1">
                                            {attendanceData.Snapshots?.map((snapshot, idx) => {
                                                const status = getStudentStatusInSnapshot(snapshot, record.Student._id);
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                            status !== "absent"
                                                                ? "bg-emerald-500 text-white"
                                                                : "bg-gray-200 text-gray-500"
                                                        }`}
                                                        title={`Snapshot ${snapshot.SnapshotNumber}: ${status}`}
                                                    >
                                                        {snapshot.SnapshotNumber}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <span className="text-xs text-red-600 font-bold ml-2">
                                            {record.PresenceCount}/{attendanceData.Snapshots?.length}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {absentStudents.length === 0 && (
                                <div className="text-center py-12">
                                    <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">All students present! 🎉</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Session Info Footer */}
                <div className="mt-8 bg-gray-100 rounded-2xl p-6">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span>Session ID: {attendanceData.SessionId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full font-semibold">
                                {attendanceData.Status}
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
