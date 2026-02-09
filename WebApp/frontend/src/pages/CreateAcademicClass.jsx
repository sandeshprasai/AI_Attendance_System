import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import InputGroup from "../components/ui/InputGroup";
import SelectInput from "../components/ui/SelectInput";
import {
  BookOpen,
  Building2,
  GraduationCap,
  Users,
  User,
  Calendar,
  Hash,
  FileText,
} from "lucide-react";
import {
  fetchClassrooms,
  fetchSubjectsByDepartment,
  fetchTeachersByDepartment,
  fetchStudentsByDepartment,
  createAcademicClass,
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

export default function CreateAcademicClass() {
  const navigate = useNavigate();

  // ================= FORM STATE =================
  const [formData, setFormData] = useState({
    ClassName: "",
    ClassCode: "",
    PhysicalClassroom: "",
    Department: "",
    Subject: "",
    Teacher: "",
    Students: [],
    Semester: "",
    AcademicYear: "",
    Section: "",
    MaxCapacity: "48",
    Description: "",
  });

  // ================= DROPDOWN OPTIONS =================
  const [classrooms, setClassrooms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  // ================= LOADING STATES =================
  const [loading, setLoading] = useState({
    classrooms: false,
    departments: false,
    subjects: false,
    teachers: false,
    students: false,
    submit: false,
  });

  // ================= UI STATES =================
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedStudents, setSelectedStudents] = useState([]);

  // ================= FETCH INITIAL DATA =================
  useEffect(() => {
    loadClassrooms();
    loadDepartments();
  }, []);

  const loadClassrooms = async () => {
    setLoading((prev) => ({ ...prev, classrooms: true }));
    try {
      const { data } = await fetchClassrooms();
      setClassrooms(data.data || []);
    } catch (error) {
      setToast({
        message: "Failed to load classrooms",
        type: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, classrooms: false }));
    }
  };

  const loadDepartments = async () => {
    setLoading((prev) => ({ ...prev, departments: true }));
    try {
      const { data } = await fetchAllDepartments();
      setDepartments(data.data || []);
    } catch (error) {
      setToast({
        message: "Failed to load departments",
        type: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, departments: false }));
    }
  };

  // ================= CASCADING DROPDOWNS =================
  useEffect(() => {
    if (formData.Department) {
      loadSubjects(formData.Department, formData.Semester);
      loadTeachers(formData.Department);
      loadStudents(formData.Department);
    } else {
      setSubjects([]);
      setTeachers([]);
      setStudents([]);
    }
  }, [formData.Department, formData.Semester]);

  useEffect(() => {
    if (formData.Department && formData.Subject) {
      loadTeachers(formData.Department, formData.Subject);
    }
  }, [formData.Subject]);

  const loadSubjects = async (departmentId, semester) => {
    setLoading((prev) => ({ ...prev, subjects: true }));
    try {
      const { data } = await fetchSubjectsByDepartment(departmentId, semester);
      setSubjects(data.data || []);
    } catch (error) {
      setToast({
        message: "Failed to load subjects",
        type: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, subjects: false }));
    }
  };

  const loadTeachers = async (departmentId, subjectId = null) => {
    setLoading((prev) => ({ ...prev, teachers: true }));
    try {
      const { data } = await fetchTeachersByDepartment(departmentId, subjectId);
      setTeachers(data.data || []);
    } catch (error) {
      setToast({
        message: "Failed to load teachers",
        type: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, teachers: false }));
    }
  };

  const loadStudents = async (departmentId) => {
    setLoading((prev) => ({ ...prev, students: true }));
    try {
      const { data } = await fetchStudentsByDepartment(departmentId);
      setStudents(data.data || []);
    } catch (error) {
      setToast({
        message: "Failed to load students",
        type: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, students: false }));
    }
  };

  // ================= FORM HANDLERS =================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Reset dependent fields
    if (name === "Department") {
      setFormData((prev) => ({
        ...prev,
        Subject: "",
        Teacher: "",
        Students: [],
      }));
      setSelectedStudents([]);
    }

    if (name === "Subject") {
      setFormData((prev) => ({ ...prev, Teacher: "" }));
    }
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        if (prev.length >= parseInt(formData.MaxCapacity)) {
          setToast({
            message: `Cannot add more than ${formData.MaxCapacity} students`,
            type: "error",
          });
          return prev;
        }
        return [...prev, studentId];
      }
    });
  };

  // ================= VALIDATION =================
  const validateForm = () => {
    const newErrors = {};

    if (!formData.ClassName.trim())
      newErrors.ClassName = "Class name is required";
    if (!formData.ClassCode.trim())
      newErrors.ClassCode = "Class code is required";
    if (!formData.PhysicalClassroom)
      newErrors.PhysicalClassroom = "Physical classroom is required";
    if (!formData.Department) newErrors.Department = "Department is required";
    if (!formData.Subject) newErrors.Subject = "Subject is required";
    if (!formData.Teacher) newErrors.Teacher = "Teacher is required";
    if (!formData.Semester) newErrors.Semester = "Semester is required";
    if (!formData.AcademicYear.trim())
      newErrors.AcademicYear = "Academic year is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= SUBMIT HANDLER =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setToast({
        message: "Please fill all required fields",
        type: "error",
      });
      return;
    }

    setLoading((prev) => ({ ...prev, submit: true }));

    const payload = {
      ...formData,
      Students: selectedStudents,
      Semester: parseInt(formData.Semester),
      MaxCapacity: parseInt(formData.MaxCapacity),
    };

    try {
      const { data } = await createAcademicClass(payload);
      setToast({
        message: data.message || "Academic class created successfully!",
        type: "success",
      });

      // Reset form after 1 second
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1500);
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message || "Failed to create academic class",
        type: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  // ================= HELPER FUNCTIONS =================
  const getDepartmentOptions = () => {
    return departments.map((dept) => ({
      value: dept._id,
      label: `${dept.DepartmentName} (${dept.DepartmentCode})`,
    }));
  };

  const getClassroomOptions = () => {
    return classrooms.map((room) => ({
      value: room._id,
      label: `${room.Classroom} - Capacity: ${room.capacity}`,
    }));
  };

  const getSubjectOptions = () => {
    return subjects.map((subject) => ({
      value: subject._id,
      label: `${subject.SubjectName} (${subject.SubjectCode})`,
    }));
  };

  const getTeacherOptions = () => {
    return teachers.map((teacher) => ({
      value: teacher._id,
      label: `${teacher.FullName} (${teacher.EmployeeId})`,
    }));
  };

  const getSemesterOptions = () => {
    return Array.from({ length: 10 }, (_, i) => ({
      value: String(i + 1),
      label: `Semester ${i + 1}`,
    }));
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
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Create Academic Class
          </h1>
          <p className="text-gray-600 text-lg">
            Set up a new subject-wise class with students and teacher assignments
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10">
            {/* Basic Information Section */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-cyan-600 mb-8 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup
                  label="Class Name"
                  name="ClassName"
                  type="text"
                  value={formData.ClassName}
                  onChange={handleInputChange}
                  placeholder="e.g. Data Structures - Section A"
                  Icon={BookOpen}
                  error={errors.ClassName}
                />

                <InputGroup
                  label="Class Code"
                  name="ClassCode"
                  type="text"
                  value={formData.ClassCode}
                  onChange={handleInputChange}
                  placeholder="e.g. CS201-A-2024"
                  Icon={Hash}
                  error={errors.ClassCode}
                />

                <InputGroup
                  label="Academic Year"
                  name="AcademicYear"
                  type="text"
                  value={formData.AcademicYear}
                  onChange={handleInputChange}
                  placeholder="e.g. 2024-2025"
                  Icon={Calendar}
                  error={errors.AcademicYear}
                />

                <InputGroup
                  label="Section"
                  name="Section"
                  type="text"
                  value={formData.Section}
                  onChange={handleInputChange}
                  placeholder="e.g. A, B, C"
                  Icon={Hash}
                  error={errors.Section}
                />
              </div>
            </section>

            {/* Assignment Section */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-cyan-600 mb-8 flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                Class Assignment
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SelectInput
                  label="Department"
                  name="Department"
                  value={formData.Department}
                  onChange={handleInputChange}
                  options={getDepartmentOptions()}
                  placeholder="Select Department"
                  Icon={Building2}
                  error={errors.Department}
                  loading={loading.departments}
                  required
                />

                <SelectInput
                  label="Semester"
                  name="Semester"
                  value={formData.Semester}
                  onChange={handleInputChange}
                  options={getSemesterOptions()}
                  placeholder="Select Semester"
                  Icon={Calendar}
                  error={errors.Semester}
                  required
                />

                <SelectInput
                  label="Physical Classroom"
                  name="PhysicalClassroom"
                  value={formData.PhysicalClassroom}
                  onChange={handleInputChange}
                  options={getClassroomOptions()}
                  placeholder="Select Classroom"
                  Icon={Building2}
                  error={errors.PhysicalClassroom}
                  loading={loading.classrooms}
                  required
                />

                <InputGroup
                  label="Max Capacity"
                  name="MaxCapacity"
                  type="number"
                  value={formData.MaxCapacity}
                  onChange={handleInputChange}
                  placeholder="48"
                  Icon={Users}
                  error={errors.MaxCapacity}
                />

                <SelectInput
                  label="Subject"
                  name="Subject"
                  value={formData.Subject}
                  onChange={handleInputChange}
                  options={getSubjectOptions()}
                  placeholder="Select Subject"
                  Icon={BookOpen}
                  error={errors.Subject}
                  loading={loading.subjects}
                  disabled={!formData.Department}
                  required
                />

                <SelectInput
                  label="Teacher"
                  name="Teacher"
                  value={formData.Teacher}
                  onChange={handleInputChange}
                  options={getTeacherOptions()}
                  placeholder="Select Teacher"
                  Icon={User}
                  error={errors.Teacher}
                  loading={loading.teachers}
                  disabled={!formData.Department}
                  required
                />
              </div>
            </section>

            {/* Students Section */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-cyan-600 mb-8 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Assign Students
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({selectedStudents.length} / {formData.MaxCapacity} selected)
                </span>
              </h2>

              {!formData.Department ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                  Please select a department first to load students
                </div>
              ) : loading.students ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                  Loading students...
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                  No students found for this department
                </div>
              ) : (
                <div className="border-2 border-cyan-200 rounded-xl p-6 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map((student) => (
                      <label
                        key={student._id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedStudents.includes(student._id)
                            ? "border-cyan-500 bg-cyan-50"
                            : "border-gray-200 hover:border-cyan-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => handleStudentToggle(student._id)}
                          className="w-5 h-5 text-cyan-600 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {student.FullName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Roll: {student.RollNo}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Description Section */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-cyan-600 mb-8 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Additional Information
              </h2>

              <div>
                <label className="text-sm font-bold flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-cyan-600" />
                  Description
                </label>
                <textarea
                  name="Description"
                  value={formData.Description}
                  onChange={handleInputChange}
                  placeholder="Enter class description, timing, or any additional notes..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-cyan-400 rounded-xl focus:border-cyan-600 focus:outline-none resize-none"
                />
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-8 border-t border-gray-200 mt-2">
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                className="px-10 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading.submit}
                className="px-10 py-3.5 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading.submit ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-5 h-5" />
                    Create Academic Class
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
