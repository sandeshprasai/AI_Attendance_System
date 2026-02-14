import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import {
  BookOpen,
  Building2,
  User,
  Users,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
} from "lucide-react";
import { fetchAllAcademicClasses } from "../services/academicClass.service";

export default function ActiveClasses() {
  const navigate = useNavigate();
  const [activeClasses, setActiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveClasses();
  }, []);

  const loadActiveClasses = async () => {
    setLoading(true);
    try {
      const response = await fetchAllAcademicClasses();
      const allClasses = response.data.data || [];
      // Filter only active classes
      const active = allClasses.filter((cls) => cls.Status === "active");
      setActiveClasses(active);
    } catch (error) {
      console.error("Failed to load active classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClass = (classId) => {
    navigate(`/admin/academic-class/${classId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <NavBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Clock className="w-8 h-8 text-orange-600" />
                Active Classes Now
              </h1>
              <p className="text-gray-600 mt-2">
                {activeClasses.length} class{activeClasses.length !== 1 ? "es" : ""} currently
                active
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activeClasses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Active Classes
            </h3>
            <p className="text-gray-500">
              There are currently no active classes in the system
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeClasses.map((cls) => (
              <div
                key={cls._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-green-200 cursor-pointer relative overflow-hidden"
                onClick={() => handleViewClass(cls._id)}
              >
                {/* Active indicator */}
                <div className="absolute top-0 right-0">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-bl-lg flex items-center gap-1 text-xs font-bold">
                    <CheckCircle className="w-3 h-3" />
                    ACTIVE
                  </div>
                </div>

                {/* Class Info */}
                <div className="mb-4 mt-2">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 pr-16">
                    {cls.ClassName}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Building2 className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">
                      {cls.Department?.DepartmentName || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span>Semester {cls.Semester}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span>{cls.AcademicYear}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4 text-green-500" />
                    <span>{cls.Teacher?.FullName || "No teacher assigned"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 text-cyan-500" />
                    <span>
                      {cls.Students?.length || 0} Student
                      {cls.Students?.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* View Button */}
                <button className="w-full mt-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-md">
                  View Details →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {!loading && activeClasses.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  Quick Actions
                </h3>
                <p className="text-sm text-gray-600">
                  Manage all academic classes
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/academic-classes")}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View All Classes
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
