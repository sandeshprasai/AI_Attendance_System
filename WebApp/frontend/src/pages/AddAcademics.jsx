import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

// Toast Component with auto-dismiss
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // Disappear after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-24 right-6 z-50 animate-bounce-in">
      <div
        className={`px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 ${
          type === "success" ? "bg-cyan-600" : type === "error" ? "bg-red-600" : "bg-amber-500"
        } text-white`}
      >
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-80 text-xl font-bold">×</button>
      </div>
    </div>
  );
};

export default function AddAcademicsPage() {
  const API_URL = import.meta.env.VITE_API_URL;

  // States
  const [departments, setDepartments] = useState([{ DepartmentCode: "", DepartmentName: "" }]);
  const [subjects, setSubjects] = useState([{ Department: "", SubjectCode: "", SubjectName: "" }]);
  const [classrooms, setClassrooms] = useState([{ Code: "", Capacity: "", Description: "" }]);
  const [toast, setToast] = useState(null);

  const departmentOptions = ["CIVIL", "COMPUTER", "BE IT", "BBA", "ARCHITECTURE", "ELECTRONICS", "BE SOFTWARE"];

  const isRowFilled = (row) => {
    // Description is optional for classrooms, others are mandatory
    const { Description, ...requiredFields } = row;
    return Object.values(requiredFields).every(val => val.toString().trim() !== "");
  };

  // Generic Submit Handler to track success/failure
  const handleBulkSubmit = async (dataList, endpoint, sectionName) => {
    const validData = dataList.filter(isRowFilled);
    
    if (validData.length === 0) {
      setToast({ message: `Please fill in the ${sectionName} details properly.`, type: "error" });
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const item of validData) {
      try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        if (response.ok) successCount++;
        else failCount++;
      } catch (error) {
        failCount++;
      }
    }

    setToast({
      message: `${sectionName}: ${successCount} Succeeded, ${failCount} Failed`,
      type: failCount === 0 ? "success" : successCount > 0 ? "warning" : "error"
    });
  };

  // ============ Handlers ============

  const handleDeptChange = (index, field, value) => {
    const updated = [...departments];
    updated[index][field] = value; // Restriction on digits removed to allow Strings
    setDepartments(updated);
  };

  const handleSubjectChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value; // Restriction on digits removed
    setSubjects(updated);
  };

  const handleClassroomChange = (index, field, value) => {
    // Capacity still ideally should be a number, but Code is now String
    if (field === "Capacity" && value && !/^\d+$/.test(value)) return;
    const updated = [...classrooms];
    updated[index][field] = value;
    setClassrooms(updated);
  };

  const addRow = (setter, currentList, sectionName, template) => {
    if (isRowFilled(currentList[currentList.length - 1])) {
      setter([...currentList, template]);
    } else {
      setToast({ message: `Please fill out all required fields in the current ${sectionName} row first.`, type: "error" });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />
      <div className="max-w-5xl mx-auto p-6 space-y-10 mb-16 pt-24">
        <h1 className="text-3xl font-bold text-gray-800">Add Academics</h1>

        {/* ============ Add Department ============ */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-emerald-700 mb-6">Add Department</h2>
          {departments.map((dept, index) => (
            <div key={index} className="flex gap-4 mb-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Code</label>
                <input
                  type="text"
                  value={dept.DepartmentCode}
                  placeholder="e.g. CS-01"
                  onChange={(e) => handleDeptChange(index, "DepartmentCode", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-emerald-300 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="flex-[2]">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Department Name</label>
                <input
                  type="text"
                  value={dept.DepartmentName}
                  placeholder="e.g. Computer Engineering"
                  onChange={(e) => handleDeptChange(index, "DepartmentName", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-emerald-300 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => addRow(setDepartments, departments, 'dept', { DepartmentCode: "", DepartmentName: "" })} className="w-10 h-10 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold">+</button>
                {departments.length > 1 && (
                  <button onClick={() => setDepartments(departments.filter((_, i) => i !== index))} className="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold">−</button>
                )}
              </div>
            </div>
          ))}
          <button onClick={() => handleBulkSubmit(departments, 'departments', 'Departments')} className="bg-emerald-600 text-white px-10 py-2 rounded-lg hover:bg-emerald-700 font-semibold mt-2">Add Departments</button>
        </section>

        {/* ============ Add Subjects ============ */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-emerald-700 mb-6">Add Subjects</h2>
          {subjects.map((sub, index) => (
            <div key={index} className="flex gap-4 mb-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Department</label>
                <select 
                  value={sub.Department} 
                  onChange={(e) => handleSubjectChange(index, "Department", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-emerald-300 focus:border-emerald-500 bg-white"
                >
                  <option value="">Select Dept</option>
                  {departmentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Subject Code</label>
                <input
                  type="text"
                  value={sub.SubjectCode}
                  placeholder="e.g. BEX 402"
                  onChange={(e) => handleSubjectChange(index, "SubjectCode", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-emerald-300 focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="flex-[1.5]">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Subject Name</label>
                <input
                  type="text"
                  value={sub.SubjectName}
                  placeholder="e.g. Data Structures"
                  onChange={(e) => handleSubjectChange(index, "SubjectName", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-emerald-300 focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => addRow(setSubjects, subjects, 'sub', { Department: "", SubjectCode: "", SubjectName: "" })} className="w-10 h-10 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold">+</button>
                {subjects.length > 1 && (
                  <button onClick={() => setSubjects(subjects.filter((_, i) => i !== index))} className="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold">−</button>
                )}
              </div>
            </div>
          ))}
          <button onClick={() => handleBulkSubmit(subjects, 'subjects', 'Subjects')} className="bg-emerald-600 text-white px-10 py-2 rounded-lg hover:bg-emerald-700 font-semibold mt-2">Add Subjects</button>
        </section>

        {/* ============ Add Classroom ============ */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-bold text-cyan-600">Add Classroom</h2>
          </div>
          
          {classrooms.map((room, index) => (
            <div key={index} className="space-y-4 mb-8 pb-4 border-b border-gray-100 last:border-0">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Classroom Code</label>
                  <input
                    type="text"
                    value={room.Code}
                    placeholder="e.g. D001"
                    onChange={(e) => handleClassroomChange(index, "Code", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-cyan-500/30 focus:border-cyan-600 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Capacity</label>
                  <input
                    type="text"
                    value={room.Capacity}
                    placeholder="e.g. 50"
                    onChange={(e) => handleClassroomChange(index, "Capacity", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-cyan-500/30 focus:border-cyan-600 outline-none"
                  />
                </div>
                <div className="flex-[2]">
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    value={room.Description}
                    placeholder="e.g. Third Floor, West Wing"
                    onChange={(e) => handleClassroomChange(index, "Description", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-cyan-500/30 focus:border-cyan-600 outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => addRow(setClassrooms, classrooms, 'room', { Code: "", Capacity: "", Description: "" })} className="w-10 h-10 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-bold">+</button>
                  {classrooms.length > 1 && (
                    <button onClick={() => setClassrooms(classrooms.filter((_, i) => i !== index))} className="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold">−</button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => handleBulkSubmit(classrooms, 'classrooms', 'Classrooms')} className="bg-cyan-600 text-white px-10 py-2 rounded-lg hover:bg-cyan-700 font-semibold mt-2">Add Classrooms</button>
        </section>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <Footer />
    </div>
  );
}