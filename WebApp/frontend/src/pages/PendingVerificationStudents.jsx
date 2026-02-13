import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  AlertTriangle,
  ExternalLink,
  Camera,
} from "lucide-react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import API from "../utills/api";
import { getUserImageURL } from "../utills/api";

export default function PendingVerificationStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchPendingStudents();
  }, [currentPage]);

  const fetchPendingStudents = async () => {
    setLoading(true);
    try {
      const response = await API.get("/admin/students-pending", {
        params: { page: currentPage, limit },
      });

      if (response.data.success) {
        setStudents(response.data.data.students);
        setTotal(response.data.data.pagination.total);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch pending students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollFace = (rollNo) => {
    navigate(`/enroll-face?roll_no=${rollNo}`);
  };

  const handleViewDetails = (studentId) => {
    navigate(`/student/${studentId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
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
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Pending Face Verification
              </h1>
              <p className="text-gray-600 mt-1">
                {total} student{total !== 1 ? "s" : ""} pending face enrollment
              </p>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-6 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-800">
                Action Required
              </h3>
              <p className="text-sm text-orange-700 mt-1">
                These students have not enrolled their face data yet. Click "Enroll Face" to start the enrollment process for each student.
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              All Students Verified!
            </h3>
            <p className="text-gray-500">
              All students have completed face enrollment
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Photo
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Roll No
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Full Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Phone
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Department
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr
                        key={student._id}
                        className="hover:bg-orange-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="relative">
                            <img
                              src={getUserImageURL(student.ProfileImagePath)}
                              alt={student.FullName}
                              className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
                              onError={(e) => {
                                e.target.src = "/default-avatar.png";
                              }}
                            />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-800">
                            {student.RollNo}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-800">
                            {student.FullName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600 text-sm">
                            {student.Email}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600 text-sm">
                            {student.Phone}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600 text-sm">
                            {student.Faculty?.DepartmentName || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEnrollFace(student.RollNo)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                            >
                              <Camera className="w-4 h-4" />
                              Enroll Face
                            </button>
                            <button
                              onClick={() => handleViewDetails(student._id)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow-md p-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <span className="text-gray-700 font-medium">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
