import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import {
    BookOpen,
    Building2,
    User,
    Users,
    Calendar,
    ArrowLeft,
    Loader2,
    Camera,
    History,
    Mail,
    Phone,
    Layout,
    Eye,
} from "lucide-react";
import { fetchAcademicClassById } from "../services/academicClass.service";
import apiClient from "../utills/apiClient";

export default function AcademicClassDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const userRole = localStorage.getItem("role") || sessionStorage.getItem("role");
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attendanceHistory, setAttendanceHistory] = useState([]);

    useEffect(() => {
        loadClassDetails();
        loadAttendanceHistory();
    }, [id]);

    const loadClassDetails = async () => {
        try {
            setLoading(true);
            const res = await fetchAcademicClassById(id);
            setClassData(res.data.data);
        } catch (err) {
            console.error("Failed to load class details:", err);
            setError("Failed to load class details. It may not exist.");
        } finally {
            setLoading(false);
        }
    };

    const loadAttendanceHistory = async () => {
        try {
            const res = await apiClient.get(`/attendance/class/${id}`);
            setAttendanceHistory(res.data.data || []);
        } catch (err) {
            console.error("Failed to load attendance history:", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50 flex flex-col">
                <NavBar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading class details...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !classData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50 flex flex-col">
                <NavBar />
                <main className="flex-1 flex items-center justify-center p-6">
                    <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{error || "Class Not Found"}</h2>
                        <button
                            onClick={() => navigate("/admin/academic-classes")}
                            className="mt-6 px-6 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-all"
                        >
                            Back to Classes
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50 flex flex-col">
            <NavBar />

            <main className="flex-1 container mx-auto px-6 py-12 mt-20 mb-12 max-w-7xl">
                {/* Breadcrumb / Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold">Back to Classes</span>
                </button>

                {/* Header Section */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-10 border border-gray-100">
                    <div className="bg-gradient-to-r from-cyan-600 to-teal-600 p-10 text-white relative">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <BookOpen className="w-40 h-40" />
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                            <div>
                                <h1 className="text-4xl font-extrabold mb-2">{classData.ClassName}</h1>
                                <p className="text-cyan-100 text-xl font-medium">
                                    {classData.ClassCode} • {classData.Subject?.SubjectName}
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => navigate(userRole === "teacher" ? `/teacher/take-attendance/${id}` : `/admin/take-attendance/${id}`)}
                                    disabled={classData.Status === 'completed' || classData.Status === 'archived'}
                                    className={`px-8 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg ${
                                        classData.Status === 'completed' || classData.Status === 'archived'
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                                            : 'bg-white text-cyan-700 hover:bg-cyan-50'
                                    }`}
                                    title={classData.Status === 'completed' || classData.Status === 'archived' ? 'Cannot take attendance for completed/archived classes' : 'Take Attendance'}
                                >
                                    <Camera className="w-5 h-5" />
                                    Take Attendance
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 rounded-2xl">
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Department</p>
                                <p className="text-lg font-bold text-gray-800">{classData.Department?.DepartmentName}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-50 rounded-2xl">
                                <User className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Teacher</p>
                                <p className="text-lg font-bold text-gray-800">{classData.Teacher?.FullName}</p>
                                <p className="text-sm text-gray-500">{classData.Teacher?.Email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-emerald-50 rounded-2xl">
                                <Users className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Students</p>
                                <p className="text-lg font-bold text-gray-800">{classData.Students?.length} Students</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-amber-50 rounded-2xl">
                                <Calendar className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Session</p>
                                <p className="text-lg font-bold text-gray-800">Sem {classData.Semester} | {classData.AcademicYear}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Student List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                    <Users className="w-6 h-6 text-cyan-600" />
                                    Enrolled Students
                                </h2>
                            </div>
                            <div className="p-8 overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-gray-500 border-b border-gray-100">
                                            <th className="pb-4 font-semibold uppercase text-xs tracking-wider">Student Name</th>
                                            <th className="pb-4 font-semibold uppercase text-xs tracking-wider">Roll No</th>
                                            <th className="pb-4 font-semibold uppercase text-xs tracking-wider">Email</th>
                                            <th className="pb-4 font-semibold uppercase text-xs tracking-wider">Contact</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {classData.Students?.map((student) => (
                                            <tr key={student._id} className="hover:bg-cyan-50/30 transition-colors">
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                                                            {student.FullName?.charAt(0)}
                                                        </div>
                                                        <span className="font-bold text-gray-800">{student.FullName}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 font-mono text-gray-600">{student.RollNo}</td>
                                                <td className="py-4 text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-gray-400" />
                                                        {student.Email}
                                                    </div>
                                                </td>
                                                <td className="py-4 text-gray-600">
                                                    {student.Phone || "N/A"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {classData.Students?.length === 0 && (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">No students enrolled in this class yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Attendance History */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 h-full">
                            <div className="p-8 border-b border-gray-100 bg-gray-50">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                    <History className="w-6 h-6 text-cyan-600" />
                                    Attendance History
                                </h2>
                            </div>
                            <div className="p-8 space-y-6">
                                {attendanceHistory.length > 0 ? (
                                    attendanceHistory.map((record) => (
                                        <div 
                                            key={record._id} 
                                            onClick={() => navigate(`/admin/attendance/${record.SessionId}`)}
                                            className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-cyan-200 hover:shadow-md transition-all cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-bold text-gray-800 group-hover:text-cyan-600 transition-colors">
                                                    {new Date(record.Date).toLocaleDateString("en-US", {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-bold rounded-full">
                                                    {record.AttendancePercentage}%
                                                </span>
                                            </div>
                                            <div className="flex gap-4 text-sm mb-2">
                                                <span className="text-emerald-600 font-semibold">{record.PresentCount} Present</span>
                                                <span className="text-red-500 font-semibold">{record.AbsentCount} Absent</span>
                                            </div>
                                            <p className="text-xs text-gray-500 group-hover:text-cyan-600 transition-colors flex items-center gap-1">
                                                <Eye className="w-3 h-3" />
                                                Click to view details
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No attendance records found yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
