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
  Users,
  Building2,
} from "lucide-react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import API from "../utills/api";
import { getUserImageURL } from "../utills/api";

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get(`/admin/students/${id}`);
      if (response.data.success) {
        setStudent(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch student details:", err);
      setError("Failed to load student details");
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
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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

  if (error || !student) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <NavBar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {error || "Student Not Found"}
            </h2>
            <p className="text-gray-600 mb-6">
              Unable to load student details. Please try again.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <NavBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Students List
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Student Details</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <img
                src={getUserImageURL(student.ProfileImagePath)}
                alt={student.FullName}
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
              />
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {student.FullName}
              </h2>
              <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Roll No: {student.RollNo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-500" />
                  <span>{student.Faculty?.DepartmentName || "N/A"}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Section {student.Section || "N/A"}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Room {student.Classroom}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  Year {student.YearOfEnrollment}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Personal Information</h3>
          </div>

          <div className="divide-y divide-gray-200">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              <div className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                    <p className="text-base text-gray-800 break-all">{student.Email}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Phone Number</p>
                    <p className="text-base text-gray-800">{student.Phone}</p>
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
                    <p className="text-base text-gray-800">{formatDate(student.DateOfBirth)}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Hash className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">University Registration</p>
                    <p className="text-base text-gray-800">{student.UniversityReg || "N/A"}</p>
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
                    <p className="text-sm font-medium text-gray-500 mb-1">Department Code</p>
                    <p className="text-base text-gray-800">
                      {student.Faculty?.DepartmentCode || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Subjects</p>
                    <p className="text-base text-gray-800">
                      {student.Subjects?.length || 0} Subjects Assigned
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            {(student.GuardianName || student.GuardianPhone) && (
              <>
                <div className="bg-gray-50 px-6 py-3">
                  <h4 className="text-lg font-semibold text-gray-700">Guardian Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                  {student.GuardianName && (
                    <div className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-rose-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500 mb-1">Guardian Name</p>
                          <p className="text-base text-gray-800">{student.GuardianName}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {student.GuardianPhone && (
                    <div className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Phone className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500 mb-1">Guardian Phone</p>
                          <p className="text-base text-gray-800">{student.GuardianPhone}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Address */}
            {student.FullAddress && (
              <div className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Full Address</p>
                    <p className="text-base text-gray-800">{student.FullAddress}</p>
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
              {formatDate(student.createdAt)}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{" "}
              {formatDate(student.updatedAt)}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
