import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  Building2,
  GraduationCap,
  ChevronRight,
  Loader2,
  History,
} from "lucide-react";
import apiClient from "../utills/apiClient";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-green-100 text-green-700 border-green-300",
    completed: "bg-blue-100 text-blue-700 border-blue-300",
    archived: "bg-gray-100 text-gray-700 border-gray-300",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
        styles[status] || styles.active
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Class Card Component
const ClassCard = ({ classData, onClick, onTakeAttendance, onViewHistory }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group"
    >
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-cyan-500 to-teal-500 p-4 text-white">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">
              {classData.Subject?.SubjectName || "N/A"}
            </h3>
            <p className="text-cyan-100 text-sm">
              {classData.Subject?.SubjectCode || "N/A"}
            </p>
          </div>
          <StatusBadge status={classData.Status} />
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        {/* Department and Semester */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-purple-600" />
            <span className="text-gray-700 font-medium">
              {classData.Department?.DepartmentName || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span className="text-gray-700 font-medium">
              Semester {classData.Semester || "N/A"}
            </span>
          </div>
        </div>

        {/* Academic Year and Classroom */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-orange-600" />
            <span className="text-gray-700">
              {classData.AcademicYear || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-cyan-600" />
            <span className="text-gray-700">
              {classData.PhysicalClassroom?.Classroom || "N/A"}
            </span>
          </div>
        </div>

        {/* Schedule */}
        {classData.Schedule && (
          <div className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded-lg">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700">
              {classData.Schedule.Day} • {classData.Schedule.StartTime} -{" "}
              {classData.Schedule.EndTime}
            </span>
          </div>
        )}

        {/* Students Count */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Students</p>
              <p className="text-lg font-bold text-gray-800">
                {classData.Students?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTakeAttendance(classData);
            }}
            disabled={classData.Status === 'completed' || classData.Status === 'archived'}
            className={`flex-1 px-3 py-2 text-white text-sm font-medium rounded-lg transition-all shadow-sm ${
              classData.Status === 'completed' || classData.Status === 'archived'
                ? 'bg-gray-400 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
            }`}
            title={classData.Status === 'completed' || classData.Status === 'archived' ? 'Cannot take attendance for completed/archived classes' : 'Take Attendance'}
          >
            Take Attendance
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewHistory(classData);
            }}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all shadow-sm flex items-center justify-center gap-1"
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>
      </div>
    </div>
  );
};

// Student List Modal
const StudentListModal = ({ classData, onClose }) => {
  if (!classData) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-teal-500 p-6 text-white">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {classData.Subject?.SubjectName || "N/A"}
              </h2>
              <p className="text-cyan-100">
                {classData.Subject?.SubjectCode} • {classData.Department?.DepartmentName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Class Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-xl">
            <div>
              <p className="text-xs text-gray-600 mb-1">Semester</p>
              <p className="font-semibold text-gray-800">
                {classData.Semester || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Academic Year</p>
              <p className="font-semibold text-gray-800">
                {classData.AcademicYear || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Classroom</p>
              <p className="font-semibold text-gray-800">
                {classData.PhysicalClassroom?.Classroom || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Status</p>
              <StatusBadge status={classData.Status} />
            </div>
          </div>

          {/* Students List */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-600" />
              Students ({classData.Students?.length || 0})
            </h3>

            {classData.Students && classData.Students.length > 0 ? (
              <div className="grid gap-3">
                {classData.Students.map((student, index) => (
                  <div
                    key={student._id || index}
                    className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {student.FullName?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {student.FullName || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Roll: {student.RollNo || "N/A"} • {student.Email || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Department</p>
                      <p className="text-sm font-medium text-gray-800">
                        {student.Department?.DepartmentName || "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No students enrolled yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TeacherMyClasses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [filter, setFilter] = useState("all"); // all, active, completed

  useEffect(() => {
    // Wait for user data to be loaded before fetching classes
    if (user?.id && user?.name) {
      fetchMyClasses();
    }
  }, [user?.id, user?.name]);

  const fetchMyClasses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Debug: Log user info
      console.log("TeacherMyClasses - User info:", { 
        id: user?.id, 
        name: user?.name,
        role: user?.role 
      });

      const response = await apiClient.get("/academic-class");
      const allClasses = response.data.data || [];

      console.log("TeacherMyClasses - Total classes fetched:", allClasses.length);

      // Filter classes where the logged-in user is the teacher
      // Match by name since Teacher table IDs don't match User table IDs
      const loggedInName = user?.name;
      const myClasses = allClasses.filter((cls) => {
        // Try matching by ID first
        if (cls.Teacher?._id === user?.id) return true;
        
        // Match by name as fallback
        if (loggedInName && cls.Teacher?.FullName) {
          return cls.Teacher.FullName.toLowerCase() === loggedInName.toLowerCase();
        }
        
        return false;
      });

      console.log("TeacherMyClasses - Filtered classes:", myClasses.length);

      setClasses(myClasses);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError("Failed to load your classes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter((cls) => {
    if (filter === "all") return true;
    return cls.Status === filter;
  });

  const stats = {
    total: classes.length,
    active: classes.filter((c) => c.Status === "active").length,
    completed: classes.filter((c) => c.Status === "completed").length,
    totalStudents: classes.reduce(
      (sum, c) => sum + (c.Students?.length || 0),
      0
    ),
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <NavBar />
        <main className="flex-1 flex items-center justify-center mt-16">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading your classes...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <NavBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-cyan-600" />
            My Classes
          </h1>
          <p className="text-gray-600">
            Manage and view all your assigned classes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-cyan-500">
            <p className="text-sm text-gray-600 mb-1">Total Classes</p>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.completed}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600 mb-1">Total Students</p>
            <p className="text-3xl font-bold text-purple-600">
              {stats.totalStudents}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex gap-2">
              {["all", "active", "completed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === status
                      ? "bg-cyan-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        {error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchMyClasses}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Classes Found
            </h3>
            <p className="text-gray-600">
              {filter === "all"
                ? "You don't have any assigned classes yet."
                : `You don't have any ${filter} classes.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((classData) => (
              <ClassCard
                key={classData._id}
                classData={classData}
                onClick={() => setSelectedClass(classData)}
                onTakeAttendance={(cls) => navigate(`/teacher/take-attendance/${cls._id}`)}
                onViewHistory={(cls) => navigate(`/admin/academic-class/${cls._id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Student List Modal */}
      {selectedClass && (
        <StudentListModal
          classData={selectedClass}
          onClose={() => setSelectedClass(null)}
        />
      )}
    </div>
  );
}
