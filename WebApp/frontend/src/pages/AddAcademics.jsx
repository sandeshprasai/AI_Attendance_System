import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import AddSubjectsCard from "../components/cards/AddSubjectsCard";

import {
  addDepartments,
  addSubjects,
  addClassrooms,
  fetchAllDepartments,
} from "../services/academics.service";

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

export default function AddAcademicsPage() {
  // ================= STATES =================
  const [departments, setDepartments] = useState([
    { DepartmentCode: "", DepartmentName: "" },
  ]);

  const [subjects, setSubjects] = useState([
    { Department: "", SubjectCode: "", SubjectName: "" ,  Semester: ""},
  ]);

  const [classrooms, setClassrooms] = useState([
    { Code: "", Capacity: "", Description: "" },
  ]);

  const [deptOptions, setDeptOptions] = useState([]);
  const [loadingDept, setLoadingDept] = useState(false);
  const [toast, setToast] = useState(null);

  // ================= API HANDLERS =================
  const handleAddDepartment = async () => {
    const payload = departments.filter(
      (d) => d.DepartmentCode && d.DepartmentName
    );

    if (!payload.length)
      return setToast({ message: "No valid department to add", type: "error" });

    try {
      const res = await addDepartments(payload);
      setToast({
        message: res.data.message || "Departments added successfully!",
        type: "success",
      });
      setDepartments([{ DepartmentCode: "", DepartmentName: "" }]);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to add departments",
        type: "error",
      });
    }
  };

  const handleAddClassroom = async () => {
    const payload = classrooms
      .filter((c) => c.Code && c.Capacity)
      .map((c) => ({
        Class: c.Code,
        Capacity: c.Capacity,
        Description: c.Description || "",
      }));

    if (!payload.length)
      return setToast({ message: "No valid classroom to add", type: "error" });

    try {
      const res = await addClassrooms(payload);
      setToast({
        message: res.data.message || "Classes added successfully!",
        type: "success",
      });
      setClassrooms([{ Code: "", Capacity: "", Description: "" }]);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to add classrooms",
        type: "error",
      });
    }
  };

  // ================= FETCH DEPARTMENTS =================
  useEffect(() => {
    const loadDepartments = async () => {
      setLoadingDept(true);
      try {
        const res = await fetchAllDepartments();
        setDeptOptions(res.data?.data?.map((d) => d.DepartmentName) || []);
      } finally {
        setLoadingDept(false);
      }
    };
    loadDepartments();
  }, []);

  // ================= HELPERS =================
  const isRowFilled = (row) =>
    Object.entries(row)
      .filter(([k]) => k !== "Description")
      .every(([, v]) => v.toString().trim());

  const addRow = (setter, list, type) => {
    if (!isRowFilled(list[list.length - 1])) {
      return setToast({
        message: "Please fill all required fields first",
        type: "error",
      });
    }

    if (type === "dept")
      setter([...list, { DepartmentCode: "", DepartmentName: "" }]);
    if (type === "sub")
      setter([...list, { Department: "", SubjectCode: "", SubjectName: "" ,}]);
    if (type === "room")
      setter([...list, { Code: "", Capacity: "", Description: "" }]);
  };

  // ================= UI =================
  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />

      <div className="max-w-5xl mx-auto p-6 space-y-10 mb-16 pt-24">
        <h1 className="text-3xl font-bold text-gray-800">Add Academics</h1>

        {/* ================= DEPARTMENT CARD ================= */}
        <section className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-bold text-emerald-700 mb-6">
            Add Department
          </h2>

          {departments.map((dept, i) => (
            <div key={i} className="flex gap-4 mb-4 items-end">
              <input
                className="flex-1 px-4 py-2 border rounded-lg"
                placeholder="Code"
                value={dept.DepartmentCode}
                onChange={(e) => {
                  const d = [...departments];
                  d[i].DepartmentCode = e.target.value;
                  setDepartments(d);
                }}
              />
              <input
                className="flex-1 px-4 py-2 border rounded-lg"
                placeholder="Department Name"
                value={dept.DepartmentName}
                onChange={(e) => {
                  const d = [...departments];
                  d[i].DepartmentName = e.target.value;
                  setDepartments(d);
                }}
              />
              <button
                onClick={() => addRow(setDepartments, departments, "dept")}
                className="w-10 h-10 bg-emerald-600 text-white rounded-lg"
              >
                +
              </button>
            </div>
          ))}

          <button
            onClick={handleAddDepartment}
            className="bg-emerald-600 text-white px-8 py-2 rounded-lg"
          >
            Add
          </button>
        </section>

        {/* ================= SUBJECT CARD ================= */}
        <AddSubjectsCard
          subjects={subjects}
          setSubjects={setSubjects}
          deptOptions={deptOptions}
          loadingDept={loadingDept}
          addSubjectAPI={addSubjects}
        />
        {/* ================= CLASSROOM CARD ================= */}
        <section className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-bold text-cyan-600 mb-6">
            Add Classroom
          </h2>

          {classrooms.map((room, i) => (
            <div key={i} className="flex gap-4 mb-4 items-end">
              <input
                className="flex-1 px-4 py-2 border rounded-lg"
                placeholder="Code"
                value={room.Code}
                onChange={(e) => {
                  const r = [...classrooms];
                  r[i].Code = e.target.value;
                  setClassrooms(r);
                }}
              />
              <input
                className="flex-1 px-4 py-2 border rounded-lg"
                placeholder="Capacity"
                value={room.Capacity}
                onChange={(e) => {
                  const r = [...classrooms];
                  r[i].Capacity = e.target.value;
                  setClassrooms(r);
                }}
              />
              <input
                className="flex-1 px-4 py-2 border rounded-lg"
                placeholder="Description"
                value={room.Description}
                onChange={(e) => {
                  const r = [...classrooms];
                  r[i].Description = e.target.value;
                  setClassrooms(r);
                }}
              />
              <button
                onClick={() => addRow(setClassrooms, classrooms, "room")}
                className="w-10 h-10 bg-cyan-600 text-white rounded-lg"
              >
                +
              </button>
            </div>
          ))}

          <button
            onClick={handleAddClassroom}
            className="bg-cyan-600 text-white px-8 py-2 rounded-lg"
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