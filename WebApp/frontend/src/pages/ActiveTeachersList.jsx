import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  BookOpen,
  Users,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import API from "../utills/api";
import { getUserImageURL } from "../utills/api";

export default function ActiveTeachersList() {
  const navigate = useNavigate();
  const [activeTeachers, setActiveTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveTeachers();
  }, []);

  const fetchActiveTeachers = async () => {
    setLoading(true);
    try {
      const response = await API.get("/admin/teachers-active");

      if (response.data.success) {
        setActiveTeachers(response.data.data.activeTeachers);
      }
    } catch (error) {
      console.error("Failed to fetch active teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTeacher = (teacherId) => {
    navigate(`/teacher/${teacherId}`);
  };

  const handleViewClass = (classId) => {
    navigate(`/admin/academic-class/${classId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50">
      <NavBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-cyan-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Active Teachers
              </h1>
              <p className="text-gray-600 mt-1">
                {activeTeachers.length} teacher
                {activeTeachers.length !== 1 ? "s" : ""} currently teaching
                active classes
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md p-6 animate-pulse"
              >
                <div className="flex gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTeachers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Active Teachers
            </h3>
            <p className="text-gray-500">
              No teachers are currently assigned to active classes
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTeachers.map(({ teacher, classes }) => (
              <div
                key={teacher._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-cyan-500"
              >
                {/* Teacher Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={getUserImageURL(teacher.ProfileImagePath)}
                      alt={teacher.FullName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-cyan-200"
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {teacher.FullName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        ID: {teacher.EmployeeId}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4 text-cyan-500" />
                          <span>{teacher.Email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-green-500" />
                          <span>{teacher.Phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewTeacher(teacher._id)}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    View Profile
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

                {/* Active Classes */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    Active Classes ({classes.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {classes.map((cls) => (
                      <div
                        key={cls._id}
                        onClick={() => handleViewClass(cls._id)}
                        className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-200 hover:border-cyan-400 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors">
                            {cls.ClassName}
                          </h5>
                          <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                            ACTIVE
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-3 h-3 text-purple-500" />
                            <span>Semester {cls.Semester}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3 text-blue-500" />
                            <span>
                              {cls.studentsCount} Student
                              {cls.studentsCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {cls.AcademicYear}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
