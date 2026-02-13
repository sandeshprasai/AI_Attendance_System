import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  User,
  BookOpen,
  MapPin,
  Hash,
  GraduationCap,
  Briefcase,
  Building2,
} from "lucide-react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import API from "../utills/api";
import { getUserImageURL } from "../utills/api";

export default function TeacherDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeacherDetails();
  }, [id]);

  const fetchTeacherDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get(`/admin/teachers/${id}`);
      if (response.data.success) {
        setTeacher(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch teacher details:", err);
      setError("Failed to load teacher details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
        <NavBar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex gap-6 mb-8">
                <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
        <NavBar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {error || "Teacher Not Found"}
            </h2>
            <p className="text-gray-600 mb-6">
              Unable to load teacher details. Please try again.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <NavBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Teachers List
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Teacher Details</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <img
                src={getUserImageURL(teacher.ProfileImagePath)}
                alt={teacher.FullName}
                className="w-32 h-32 rounded-full object-cover border-4 border-green-200 shadow-lg"
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
              />
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {teacher.FullName}
              </h2>
              <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Employee ID: {teacher.EmployeeId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-500" />
                  <span>{teacher.Faculty || "N/A"}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {teacher.Subjects?.length || 0} Subject{teacher.Subjects?.length !== 1 ? "s" : ""}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  Joined {teacher.JoinedYear}
                </span>
                {teacher.Classroom && teacher.Classroom.length > 0 && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {teacher.Classroom.length} Classroom{teacher.Classroom.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Personal Information</h3>
          </div>

          <div className="divide-y divide-gray-200">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              <div className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                    <p className="text-base text-gray-800 break-all">{teacher.Email}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Phone Number</p>
                    <p className="text-base text-gray-800">{teacher.Phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              <div className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Date of Birth</p>
                    <p className="text-base text-gray-800">{formatDate(teacher.DateOfBirth)}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Year Joined</p>
                    <p className="text-base text-gray-800">{teacher.JoinedYear || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              <div className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Faculty / Department</p>
                    <p className="text-base text-gray-800">
                      {teacher.Faculty || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Hash className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Employee ID</p>
                    <p className="text-base text-gray-800">{teacher.EmployeeId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subjects */}
            {teacher.Subjects && teacher.Subjects.length > 0 && (
              <>
                <div className="bg-gray-50 px-6 py-3">
                  <h4 className="text-lg font-semibold text-gray-700">Teaching Subjects</h4>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {teacher.Subjects.map((subject, index) => (
                      <div
                        key={subject._id || index}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3"
                      >
                        <BookOpen className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {subject.SubjectName || "Unknown Subject"}
                          </p>
                          {subject.SubjectCode && (
                            <p className="text-xs text-gray-600">{subject.SubjectCode}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Classrooms */}
            {teacher.Classroom && teacher.Classroom.length > 0 && (
              <>
                <div className="bg-gray-50 px-6 py-3">
                  <h4 className="text-lg font-semibold text-gray-700">Assigned Classrooms</h4>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {teacher.Classroom.map((classroom, index) => (
                      <div
                        key={classroom._id || index}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3"
                      >
                        <GraduationCap className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {classroom.Classroom || "Unknown Class"}
                          </p>
                          {classroom.description && (
                            <p className="text-xs text-gray-600">{classroom.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Address */}
            {teacher.FullAddress && (
              <div className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Full Address</p>
                    <p className="text-base text-gray-800">{teacher.FullAddress}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timestamps */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Created:</span>{" "}
              {formatDate(teacher.createdAt)}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{" "}
              {formatDate(teacher.updatedAt)}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
