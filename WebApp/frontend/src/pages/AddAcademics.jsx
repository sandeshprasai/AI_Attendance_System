import { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: "bg-cyan-600", error: "bg-red-600", warning: "bg-amber-500" };
  return (
    <div className="fixed top-24 right-6 z-50 animate-bounce-in">
      <div className={`px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 ${colors[type] || colors.warning} text-white`}>
        <span>{message}</span><button onClick={onClose} className="ml-2 font-bold text-xl">×</button>
      </div>
    </div>
  );
};

export default function AddAcademicsPage() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [toast, setToast] = useState(null);
  const [deptOptions, setDeptOptions] = useState([]);
  
  // Data States
  const [depts, setDepts] = useState([{ DepartmentCode: "", DepartmentName: "" }]);
  const [subs, setSubs] = useState([{ Department: "", SubjectCode: "", SubjectName: "" }]);
  const [classes, setClasses] = useState([{ Code: "", Capacity: "", Description: "" }]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (token) axios.get(`${API_URL}api/v1/academics/allDepartments`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.data.success && setDeptOptions(res.data.data.map(d => d.DepartmentName))).catch(() => {});
  }, []);

  // Helpers
  const notify = (message, type) => setToast({ message, type });

  const updateRow = (setter, list, idx, field, val) => {
    if (field === "Capacity" && val && !/^\d+$/.test(val)) return;
    const newRow = [...list]; newRow[idx][field] = val; setter(newRow);
  };

  const modifyRows = (setter, list, action, idx, templateKey) => {
    if (action === "remove") return setter(list.filter((_, i) => i !== idx));
    
    const last = list[list.length - 1];
    const { Description, ...req } = last; 
    if (Object.values(req).some(v => !v.trim())) return notify("Fill required fields first", "error");

    const templates = { 
      dept: { DepartmentCode: "", DepartmentName: "" },
      sub: { Department: "", SubjectCode: "", SubjectName: "" },
      room: { Code: "", Capacity: "", Description: "" }
    };
    setter([...list, { ...templates[templateKey] }]);
  };

  const saveData = async (endpoint, list, setter, emptyTemplate) => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (!token) return notify("No token found", "error");

    let payload = list.filter(item => {
      const { Description, ...req } = item;
      return Object.values(req).every(v => v.trim());
    });
    
    if (!payload.length) return notify(`No valid items to add`, "error");

    // Format payloads specifically for backend
    if (endpoint === "subjects") payload = payload.map(s => ({ DepartmentName: s.Department, SubjectCode: s.SubjectCode, SubjectName: s.SubjectName }));
    const finalBody = endpoint === "classes" ? { classes: payload.map(c => ({ Class: c.Code, Capacity: c.Capacity, Description: c.Description })) } : payload;

    try {
      const res = await axios.post(`${API_URL}api/v1/academics/${endpoint}`, finalBody, { headers: { Authorization: `Bearer ${token}` } });
      notify(res.data.message || "Added successfully!", "success");
      setter([emptyTemplate]);
    } catch (err) { notify(err.response?.data?.message || "Failed to add", "error"); }
  };

  // Styles helpers
  const getInputClass = (color) => 
    `w-full px-4 py-2 rounded-lg border outline-none transition-all ${
      color === 'emerald' 
      ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100' 
      : 'border-cyan-500/30 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100'
    }`;
  
  const getBtnClass = (color) => `w-10 h-10 text-white rounded-lg font-bold shadow-sm ${color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-cyan-600 hover:bg-cyan-700'}`;

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />
      <div className="max-w-5xl mx-auto p-6 space-y-10 mb-16 pt-24">
        <h1 className="text-3xl font-bold text-gray-800">Add Academics</h1>

        {/* Departments (Emerald Style) */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-emerald-700 mb-6">Add Department</h2>
          {depts.map((d, i) => (
            <div key={i} className="flex gap-4 mb-4 items-end">
              <div className="flex-1"><label className="block text-sm font-semibold text-gray-600 mb-1">Code</label>
                <input value={d.DepartmentCode} onChange={e => updateRow(setDepts, depts, i, "DepartmentCode", e.target.value)} className={getInputClass('emerald')} placeholder="e.g. CS-01"/></div>
              <div className="flex-2"><label className="block text-sm font-semibold text-gray-600 mb-1">Name</label>
                <input value={d.DepartmentName} onChange={e => updateRow(setDepts, depts, i, "DepartmentName", e.target.value)} className={getInputClass('emerald')} placeholder="e.g. Computer Engineering"/></div>
              <div className="flex gap-2">
                <button onClick={() => modifyRows(setDepts, depts, "add", i, "dept")} className={getBtnClass('emerald')}>+</button>
                {depts.length > 1 && <button onClick={() => modifyRows(setDepts, depts, "remove", i)} className="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold shadow-sm">−</button>}
              </div>
            </div>
          ))}
          <button onClick={() => saveData("departments", depts, setDepts, { DepartmentCode: "", DepartmentName: "" })} className="bg-emerald-600 text-white px-10 py-2 rounded-lg hover:bg-emerald-700 font-semibold mt-2">Add</button>
        </section>

        {/* Subjects (Emerald Style) */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-emerald-700 mb-6">Add Subjects</h2>
          {subs.map((s, i) => (
            <div key={i} className="flex gap-4 mb-4 items-end">
              <div className="flex-1"><label className="block text-sm font-semibold text-gray-600 mb-1">Department</label>
                <select value={s.Department} onChange={e => updateRow(setSubs, subs, i, "Department", e.target.value)} className={getInputClass('emerald')}>
                  <option value="">Select Dept</option>{deptOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select></div>
              <div className="flex-1"><label className="block text-sm font-semibold text-gray-600 mb-1">Code</label>
                <input value={s.SubjectCode} onChange={e => updateRow(setSubs, subs, i, "SubjectCode", e.target.value)} className={getInputClass('emerald')} placeholder="e.g. BEX 402"/></div>
              <div className="flex-[1.5]"><label className="block text-sm font-semibold text-gray-600 mb-1">Name</label>
                <input value={s.SubjectName} onChange={e => updateRow(setSubs, subs, i, "SubjectName", e.target.value)} className={getInputClass('emerald')} placeholder="e.g. Data Structures"/></div>
              <div className="flex gap-2">
                <button onClick={() => modifyRows(setSubs, subs, "add", i, "sub")} className={getBtnClass('emerald')}>+</button>
                {subs.length > 1 && <button onClick={() => modifyRows(setSubs, subs, "remove", i)} className="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold shadow-sm">−</button>}
              </div>
            </div>
          ))}
          <button onClick={() => saveData("subjects", subs, setSubs, { Department: "", SubjectCode: "", SubjectName: "" })} className="bg-emerald-600 text-white px-10 py-2 rounded-lg hover:bg-emerald-700 font-semibold mt-2">Add</button>
        </section>

        {/* Classrooms (Cyan Style) */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>
            <h2 className="text-xl font-bold text-cyan-600">Add Classroom</h2>
          </div>
          {classes.map((c, i) => (
            <div key={i} className="flex gap-4 mb-4 items-end">
              <div className="flex-1"><label className="block text-sm font-semibold text-gray-600 mb-1">Code</label>
                <input value={c.Code} onChange={e => updateRow(setClasses, classes, i, "Code", e.target.value)} className={getInputClass('cyan')} placeholder="e.g. D001"/></div>
              <div className="flex-1"><label className="block text-sm font-semibold text-gray-600 mb-1">Capacity</label>
                <input value={c.Capacity} onChange={e => updateRow(setClasses, classes, i, "Capacity", e.target.value)} className={getInputClass('cyan')} placeholder="e.g. 50"/></div>
              <div className="flex-1"><label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                <input value={c.Description} onChange={e => updateRow(setClasses, classes, i, "Description", e.target.value)} className={getInputClass('cyan')} placeholder="Optional"/></div>
              <div className="flex gap-2">
                <button onClick={() => modifyRows(setClasses, classes, "add", i, "room")} className={getBtnClass('cyan')}>+</button>
                {classes.length > 1 && <button onClick={() => modifyRows(setClasses, classes, "remove", i)} className="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold shadow-sm">−</button>}
              </div>
            </div>
          ))}
          <button onClick={() => saveData("classes", classes, setClasses, { Code: "", Capacity: "", Description: "" })} className="bg-cyan-600 text-white px-10 py-2 rounded-lg hover:bg-cyan-700 font-semibold mt-2">Add</button>
        </section>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <Footer />
    </div>
  );
}