import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import axios from "axios";

// Toast Component
const Toast = ({ message, type, onClose }) => {
  return (
    <div className="fixed top-24 right-6 z-50">
      <div
        className={`px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 ${
          type === "success" ? "bg-cyan-600" : "bg-red-600"
        } text-white`}
      >
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 hover:opacity-80 text-xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default function AddAcademicsPage() {
  const API_URL = import.meta.env.VITE_API_URL;

  // States
  const [departments, setDepartments] = useState([
    { DepartmentCode: "", DepartmentName: "" },
  ]);
  const [subjects, setSubjects] = useState([
    { Department: "", SubjectCode: "", SubjectName: "" },
  ]);
  const [classrooms, setClassrooms] = useState([{ Code: "", Capacity: "" }]);
  const [toast, setToast] = useState(null);
  const [deptOptions, setDeptOptions] = useState([]);
  const [loadingDept, setLoadingDept] = useState(false);

  // Fetch departments for Subjects dropdown only
  // Inside AddAcademicsPage component

  // Helper to get token
  // Helper to get token
  const getToken = () =>
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  // ========== ADD DEPARTMENTS ==========
  const addDepartment = async () => {
    const token = getToken();
    if (!token) return setToast({ message: "No token found", type: "error" });

    // Only send fully filled rows
    const payload = departments.filter(
      (d) => d.DepartmentCode && d.DepartmentName
    );

    if (payload.length === 0) {
      return setToast({ message: "No valid department to add", type: "error" });
    }

    try {
      const res = await axios.post(
        `${API_URL}api/v1/academics/departments`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setToast({
        message: res.data.message || "Departments added successfully!",
        type: "success",
      });

      // Remove submitted rows
      const remaining = departments.filter(
        (d) => !d.DepartmentCode || !d.DepartmentName
      );
      setDepartments(
        remaining.length > 0
          ? remaining
          : [{ DepartmentCode: "", DepartmentName: "" }]
      );
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to add departments",
        type: "error",
      });
    }
  };

  // ========== ADD SUBJECTS ==========
  const addSubject = async () => {
    const token = getToken();
    if (!token) return setToast({ message: "No token found", type: "error" });

    // Only send fully filled rows
    const payload = subjects
      .filter((s) => s.Department && s.SubjectCode && s.SubjectName)
      .map((s) => ({
        DepartmentName: s.Department,
        SubjectCode: s.SubjectCode,
        SubjectName: s.SubjectName,
      }));

    if (payload.length === 0) {
      return setToast({ message: "No valid subject to add", type: "error" });
    }

    try {
      const res = await axios.post(
        `${API_URL}api/v1/academics/subjects`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setToast({ message: "Subjects added successfully!", type: "success" });

      // Remove submitted rows
      const remaining = subjects.filter(
        (s) => !s.Department || !s.SubjectCode || !s.SubjectName
      );
      setSubjects(
        remaining.length > 0
          ? remaining
          : [{ Department: "", SubjectCode: "", SubjectName: "" }]
      );
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to add subjects",
        type: "error",
      });
    }
  };

  // ========== ADD CLASSROOMS ==========
  const addClassroom = async () => {
    const token = getToken();
    if (!token) return setToast({ message: "No token found", type: "error" });

    // Only send fully filled rows
    const payload = classrooms
      .filter((c) => c.Code && c.Capacity)
      .map((c) => ({
        Class: c.Code,
        Capacity: c.Capacity,
        Description: c.Description || "",
      }));

    if (payload.length === 0) {
      return setToast({ message: "No valid classroom to add", type: "error" });
    }

    try {
      const res = await axios.post(
        `${API_URL}api/v1/academics/classes`,
        { classes: payload },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setToast({
        message: res.data.message || "Classes added successfully!",
        type: "success",
      });

      // Remove submitted rows
      const remaining = classrooms.filter((c) => !c.Code || !c.Capacity);
      setClassrooms(
        remaining.length > 0 ? remaining : [{ Code: "", Capacity: "" }]
      );
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to add classrooms",
        type: "error",
      });
    }
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      const token = getToken();
      if (!token) return;

      setLoadingDept(true);
      try {
        const res = await axios.get(
          `${API_URL}api/v1/academics/allDepartments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.success && res.data.data) {
          setDeptOptions(res.data.data.map((d) => d.DepartmentName));
        }
      } catch (err) {
        console.error("Error fetching departments:", err);
        setDeptOptions([]);
      } finally {
        setLoadingDept(false);
      }
    };

    fetchDepartments();
  }, []);

  // Helper: Check if all fields in a row are filled
  const isRowFilled = (row) =>
    Object.values(row).every((val) => val.toString().trim() !== "");

  // ============ Handlers ============
  const handleDeptChange = (index, field, value) => {
    if (field === "DepartmentCode" && value && !/^\d+$/.test(value)) return;
    const updated = [...departments];
    updated[index][field] = value;
    setDepartments(updated);
  };

  const handleSubjectChange = (index, field, value) => {
    if (field === "SubjectCode" && value && !/^\d+$/.test(value)) return;
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  const handleClassroomChange = (index, field, value) => {
    if (field === "Capacity" && value && !/^\d+$/.test(value)) return; // Only capacity numeric
    const updated = [...classrooms];
    updated[index][field] = value;
    setClassrooms(updated);
  };

  const addRow = (setter, currentList, sectionName) => {
    if (isRowFilled(currentList[currentList.length - 1])) {
      if (sectionName === "dept")
        setter([...currentList, { DepartmentCode: "", DepartmentName: "" }]);
      if (sectionName === "sub")
        setter([
          ...currentList,
          { Department: "", SubjectCode: "", SubjectName: "" },
        ]);
      if (sectionName === "room")
        setter([...currentList, { Code: "", Capacity: "" }]);
    } else {
      setToast({
        message: `Please fill out all fields in the current ${sectionName} row first.`,
        type: "error",
      });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />
      <div className="max-w-5xl mx-auto p-6 space-y-10 mb-16 pt-24">
        <h1 className="text-3xl font-bold text-gray-800">Add Academics</h1>

        {/* ============ Add Department (Manual Input) ============ */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-emerald-700 mb-6">
            Add Department
          </h2>
          {departments.map((dept, index) => (
            <div key={index} className="flex gap-4 mb-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={dept.DepartmentCode}
                  placeholder="e.g. 01"
                  onChange={(e) =>
                    handleDeptChange(index, "DepartmentCode", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg border border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>
              <div className="flex-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  value={dept.DepartmentName}
                  placeholder="e.g. Computer Engineering"
                  onChange={(e) =>
                    handleDeptChange(index, "DepartmentName", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg border border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => addRow(setDepartments, departments, "dept")}
                  className="w-10 h-10 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold shadow-sm"
                >
                  +
                </button>
                {departments.length > 1 && (
                  <button
                    onClick={() =>
                      setDepartments(departments.filter((_, i) => i !== index))
                    }
                    className="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold shadow-sm"
                  >
                    −
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            className="bg-emerald-600 text-white px-10 py-2 rounded-lg hover:bg-emerald-700 font-semibold mt-2 transition-all"
            onClick={() => addDepartment(departments[departments.length - 1])}
          >
            Add
          </button>
        </section>

        {/* ============ Add Subjects (Use Backend Departments) ============ */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-emerald-700 mb-6">
            Add Subjects
          </h2>
          {subjects.map((sub, index) => (
            <div key={index} className="flex gap-4 mb-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Department
                </label>
                <select
                  value={sub.Department}
                  onChange={(e) =>
                    handleSubjectChange(index, "Department", e.target.value)
                  }
                  disabled={loadingDept}
                  className="w-full px-4 py-2 rounded-lg border border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                >
                  <option value="">
                    {loadingDept ? "Loading..." : "Select Department"}
                  </option>
                  {deptOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  value={sub.SubjectCode}
                  placeholder="e.g. 101"
                  onChange={(e) =>
                    handleSubjectChange(index, "SubjectCode", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg border border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>
              <div className="flex-[1.5]">
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={sub.SubjectName}
                  placeholder="e.g. Data Structures"
                  onChange={(e) =>
                    handleSubjectChange(index, "SubjectName", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg border border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => addRow(setSubjects, subjects, "sub")}
                  className="w-10 h-10 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold shadow-sm"
                >
                  +
                </button>
                {subjects.length > 1 && (
                  <button
                    onClick={() =>
                      setSubjects(subjects.filter((_, i) => i !== index))
                    }
                    className="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold shadow-sm"
                  >
                    −
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            className="bg-emerald-600 text-white px-10 py-2 rounded-lg hover:bg-emerald-700 font-semibold mt-2 transition-all"
            onClick={() => addSubject(subjects[subjects.length - 1])}
          >
            Add
          </button>
        </section>

        {/* ============ Add Classroom ============ */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <svg
              className="w-6 h-6 text-cyan-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
              />
            </svg>
            <h2 className="text-xl font-bold text-cyan-600">Add Classroom</h2>
          </div>

          {classrooms.map((room, index) => (
            <div key={index} className="flex gap-4 mb-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Classroom Code
                </label>
                <input
                  type="text"
                  value={room.Code}
                  placeholder="e.g. CR-101"
                  onChange={(e) =>
                    handleClassroomChange(index, "Code", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg border border-cyan-500/30 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 outline-none transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Capacity
                </label>
                <input
                  type="text"
                  value={room.Capacity}
                  placeholder="e.g. 50"
                  onChange={(e) =>
                    handleClassroomChange(index, "Capacity", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg border border-cyan-500/30 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 outline-none transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => addRow(setClassrooms, classrooms, "room")}
                  className="w-10 h-10 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-bold shadow-sm"
                >
                  +
                </button>
                {classrooms.length > 1 && (
                  <button
                    onClick={() =>
                      setClassrooms(classrooms.filter((_, i) => i !== index))
                    }
                    className="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold shadow-sm"
                  >
                    −
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            className="bg-cyan-600 text-white px-10 py-2 rounded-lg hover:bg-cyan-700 font-semibold mt-2 transition-all"
            onClick={() => addClassroom(classrooms[classrooms.length - 1])}
          >
            Add
          </button>
        </section>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <Footer />
    </div>
  );
}
