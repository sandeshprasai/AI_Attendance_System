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
  Filter,
  CheckCircle,
  XCircle,
  Archive,
} from "lucide-react";
import {
  fetchAllAcademicClasses,
  updateAcademicClassStatus,
} from "../services/academicClass.service";
import { fetchAllDepartments } from "../services/academics.service";

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-24 right-6 z-50 animate-bounce-in">
      <div
        className={`px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 ${
          type === "success"
            ? "bg-cyan-600"
            : type === "error"
            ? "bg-red-600"
            : "bg-amber-500"
        } text-white`}
      >
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 text-xl font-bold">
          ×
        </button>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-green-100 text-green-800 border-green-300",
    completed: "bg-blue-100 text-blue-800 border-blue-300",
    archived: "bg-gray-100 text-gray-800 border-gray-300",
  };

  const icons = {
    active: <CheckCircle className="w-4 h-4" />,
    completed: <Archive className="w-4 h-4" />,
    archived: <XCircle className="w-4 h-4" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border-2 ${styles[status]}`}
    >
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function AcademicClassList() {
  const navigate = useNavigate();

  // ================= STATE =================
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // ================= FILTERS =================
  const [filters, setFilters] = useState({
    status: "",
    departmentId: "",
    semester: "",
    academicYear: "",
  });

  // ================= LOAD DATA =================
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, classes]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [classesRes, deptRes] = await Promise.all([
        fetchAllAcademicClasses(),
        fetchAllDepartments(),
      ]);
      setClasses(classesRes.data.data || []);
      setDepartments(deptRes.data.data || []);
    } catch (error) {
      setToast({
        message: "Failed to load academic classes",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...classes];

    if (filters.status) {
      filtered = filtered.filter((c) => c.Status === filters.status);
    }

    if (filters.departmentId) {
      filtered = filtered.filter(
        (c) => c.Department._id === filters.departmentId
      );
    }

    if (filters.semester) {
      filtered = filtered.filter(
        (c) => c.Semester === parseInt(filters.semester)
      );
    }

    if (filters.academicYear) {
      filtered = filtered.filter((c) => c.AcademicYear === filters.academicYear);
    }

    setFilteredClasses(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      departmentId: "",
      semester: "",
      academicYear: "",
    });
  };

  const handleStatusChange = async (classId, newStatus) => {
    try {
      await updateAcademicClassStatus(classId, newStatus);
      setToast({
        message: "Status updated successfully",
        type: "success",
      });
      loadData();
    } catch (error) {
      setToast({
        message: "Failed to update status",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50">
      <NavBar />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <main className="container mx-auto px-6 py-12 mt-20 mb-12 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              Academic Classes
            </h1>
            <p className="text-gray-600 text-lg">
              Manage all subject-wise classes and assignments
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/create-academic-class")}
            className="px-8 py-3.5 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <BookOpen className="w-5 h-5" />
            Create New Class
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-cyan-600" />
            <h2 className="text-xl font-bold text-gray-800">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="px-4 py-3 border-2 border-cyan-400 rounded-xl focus:outline-none focus:border-cyan-600 font-medium"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>

            <select
              name="departmentId"
              value={filters.departmentId}
              onChange={handleFilterChange}
              className="px-4 py-3 border-2 border-cyan-400 rounded-xl focus:outline-none focus:border-cyan-600 font-medium"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.DepartmentName}
                </option>
              ))}
            </select>

            <select
              name="semester"
              value={filters.semester}
              onChange={handleFilterChange}
              className="px-4 py-3 border-2 border-cyan-400 rounded-xl focus:outline-none focus:border-cyan-600 font-medium"
            >
              <option value="">All Semesters</option>
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Semester {i + 1}
                </option>
              ))}
            </select>

            <button
              onClick={clearFilters}
              className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-6 text-gray-600 font-medium">Loading academic classes...</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
            <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              No classes found
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Create your first academic class to get started
            </p>
            <button
              onClick={() => navigate("/admin/create-academic-class")}
              className="px-8 py-3.5 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-all shadow-md"
            >
              Create Academic Class
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredClasses.map((classItem) => (
              <div
                key={classItem._id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 leading-snug">
                      {classItem.ClassName}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      {classItem.ClassCode}
                    </p>
                  </div>
                  <StatusBadge status={classItem.Status} />
                </div>

                {/* Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-cyan-600" />
                    <span className="text-gray-700">
                      {classItem.Subject?.SubjectName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-cyan-600" />
                    <span className="text-gray-700">
                      {classItem.Department?.DepartmentName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-cyan-600" />
                    <span className="text-gray-700">
                      {classItem.Teacher?.FullName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-cyan-600" />
                    <span className="text-gray-700">
                      {classItem.Students?.length} Students
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-cyan-600" />
                    <span className="text-gray-700">
                      Semester {classItem.Semester} | {classItem.AcademicYear}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  {classItem.Status === "active" && (
                    <button
                      onClick={() =>
                        handleStatusChange(classItem._id, "completed")
                      }
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all"
                    >
                      Mark Completed
                    </button>
                  )}
                  {classItem.Status === "completed" && (
                    <button
                      onClick={() =>
                        handleStatusChange(classItem._id, "archived")
                      }
                      className="flex-1 px-4 py-2.5 bg-gray-600 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-all"
                    >
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() =>
                      navigate(`/admin/academic-class/${classItem._id}`)
                    }
                    className="flex-1 px-4 py-2.5 border-2 border-cyan-600 text-cyan-600 rounded-lg text-sm font-semibold hover:bg-cyan-50 transition-all"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && filteredClasses.length > 0 && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2 font-medium">Total Classes</p>
              <p className="text-4xl font-bold text-gray-800">
                {filteredClasses.length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2 font-medium">Active</p>
              <p className="text-4xl font-bold text-green-600">
                {filteredClasses.filter((c) => c.Status === "active").length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2 font-medium">Completed</p>
              <p className="text-4xl font-bold text-blue-600">
                {filteredClasses.filter((c) => c.Status === "completed").length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2 font-medium">Archived</p>
              <p className="text-4xl font-bold text-gray-600">
                {filteredClasses.filter((c) => c.Status === "archived").length}
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
