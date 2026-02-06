import { useState } from "react";
import { validateSubjects } from "../../utills/subjectValidations";
import Toast from "../ui/Toast";

const emptySubject = {
  Department: "",
  SubjectCode: "",
  SubjectName: "",
  Semester: "",
};

const AddSubjectsCard = ({
  subjects,
  setSubjects,
  deptOptions,
  loadingDept,
  addSubjectAPI,
}) => {
  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [successIndices, setSuccessIndices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const handleSubjectChange = (index, field, value) => {
    const updated = subjects.map((sub, i) =>
      i === index ? { ...sub, [field]: value } : sub
    );
    setSubjects(updated);

    // Clear backend error for this row if user edits it
    if (backendErrors[index]) {
      setBackendErrors((prev) => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });
    }
  };

  // Add new row
  const addRow = () => {
    const rowErrors = validateSubjects(subjects);
    if (Object.keys(rowErrors).length > 0) {
      setErrors(rowErrors);
      setToast({ message: "Please fix errors before adding a new row", type: "error" });
      return;
    }
    setSubjects([...subjects, { ...emptySubject }]);
  };

  // Remove row
  const removeRow = (index) => {
    const updated = subjects.filter((_, i) => i !== index);
    setSubjects(updated.length > 0 ? updated : [{ ...emptySubject }]);
    setErrors(validateSubjects(updated.length > 0 ? updated : [{ ...emptySubject }]));

    // Reindex backend errors
    if (backendErrors[index]) {
      const newBackendErrors = {};
      Object.keys(backendErrors).forEach((key) => {
        const numKey = Number(key);
        if (numKey < index) newBackendErrors[numKey] = backendErrors[key];
        else if (numKey > index) newBackendErrors[numKey - 1] = backendErrors[key];
      });
      setBackendErrors(newBackendErrors);
    }
  };

  // Submit subjects
  const handleAddSubjects = async () => {
    const rowErrors = validateSubjects(subjects);
    if (Object.keys(rowErrors).length > 0) {
      setErrors(rowErrors);
      setToast({ message: "Please fix validation errors before submitting", type: "error" });
      return;
    }

    const payload = subjects.map((s) => ({
      DepartmentName: s.Department,
      SubjectCode: s.SubjectCode.trim(),
      SubjectName: s.SubjectName.trim(),
      Semester: Number(s.Semester), // Remove "|| 1"
    }));

    setIsSubmitting(true);

    const applyResultsToUI = (results) => {
      // Map backend errors per row
      const newBackendErrors = {};
      const successRows = [];

      const norm = (v) => (v ?? "").toString().trim();

      const findRowIndex = (r) => {
        // If backend ever returns an index, prefer it.
        if (Number.isInteger(r?.rowIndex)) return r.rowIndex;
        if (Number.isInteger(r?._rowIndex)) return r._rowIndex;
        if (Number.isInteger(r?._clientIndex)) return r._clientIndex;

        const rCode = norm(r?.SubjectCode);
        const rName = norm(r?.SubjectName);
        const rDept = norm(r?.DepartmentName);
        const deptIsReliable = rDept && rDept !== "Unknown";

        // 1) Exact match (current logic) but tolerate "Unknown" dept from backend
        let idx = subjects.findIndex((s) => {
          const sCode = norm(s.SubjectCode);
          const sName = norm(s.SubjectName);
          const sDept = norm(s.Department);
          const codeOk = sCode && rCode && sCode === rCode;
          const nameOk = sName && rName && sName === rName;
          const deptOk = !deptIsReliable || sDept === rDept;
          return codeOk && nameOk && deptOk;
        });
        if (idx !== -1) return idx;

        // 2) Match by SubjectCode (most reliable identifier user typed)
        if (rCode) {
          idx = subjects.findIndex((s) => {
            const sCode = norm(s.SubjectCode);
            if (!sCode) return false;
            if (sCode !== rCode) return false;
            if (!deptIsReliable) return true;
            return norm(s.Department) === rDept;
          });
          if (idx !== -1) return idx;
        }

        // 3) Match by SubjectName (fallback)
        if (rName) {
          idx = subjects.findIndex((s) => {
            const sName = norm(s.SubjectName);
            if (!sName) return false;
            if (sName !== rName) return false;
            if (!deptIsReliable) return true;
            return norm(s.Department) === rDept;
          });
          if (idx !== -1) return idx;
        }

        return -1;
      };

      results.forEach((r) => {
        const index = findRowIndex(r);

        if (index === -1) return;

        if (!r.success) newBackendErrors[index] = r.message;
        else successRows.push(index);
      });

      setBackendErrors(newBackendErrors);
      setSuccessIndices(successRows);
      setTimeout(() => setSuccessIndices([]), 2000); // remove highlight after 2s

      // Keep only failed rows, reset if all succeeded
      const failedIndices = new Set(Object.keys(newBackendErrors).map(Number));
      const remaining = subjects.filter((_, i) => failedIndices.has(i));
      setSubjects(remaining.length > 0 ? remaining : [{ ...emptySubject }]);
      setErrors({});

      // Show toast
      if (Object.keys(newBackendErrors).length && successRows.length) {
        setToast({
          message: `${successRows.length} subject(s) added successfully. ${Object.keys(newBackendErrors).length} failed.`,
          type: "warning",
        });
      } else if (Object.keys(newBackendErrors).length) {
        setToast({ message: `All submissions failed. Please review errors.`, type: "error" });
      } else {
        setToast({ message: `All ${successRows.length} subject(s) added successfully!`, type: "success" });
      }
    };

    try {
      const res = await addSubjectAPI(payload);
      const { results } = res.data;
      applyResultsToUI(results);
    } catch (err) {
      // Backend returns 400 for partial failures, but still includes per-row results.
      let data = err?.response?.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          // ignore
        }
      }

      const results =
        data?.results ??
        data?.Results ??
        data?.data?.results ??
        err?.response?.data?.results;

      if (Array.isArray(results)) {
        applyResultsToUI(results);
        return;
      }

      setToast({
        message: data?.message || err.response?.data?.message || "Failed to add subjects. Please try again.",
        type: "error",
      });
      console.error("AddSubjects error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-emerald-700 mb-6">Add Subjects</h2>

      {subjects.map((sub, index) => (
        <div
          key={index}
          className={`mb-4 p-2 rounded-lg transition-colors ${
            backendErrors[index]
              ? "bg-red-50 border border-red-300"
              : successIndices.includes(index)
              ? "bg-green-50 border border-green-300"
              : ""
          }`}
        >
          {backendErrors[index] && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-2 mb-2">
              <p className="text-red-700 text-sm font-medium">❌ {backendErrors[index]}</p>
            </div>
          )}

          <div className="flex gap-4 items-start">
            {/* Department */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-600 mb-1">Department</label>
              <select
                value={sub.Department}
                onChange={(e) => handleSubjectChange(index, "Department", e.target.value)}
                disabled={loadingDept || isSubmitting}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors[index]?.Department ? "border-red-500" : "border-emerald-300"
                }`}
              >
                <option value="">{loadingDept ? "Loading..." : "Select Department"}</option>
                {deptOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <div className="h-5 mt-1">
                {errors[index]?.Department && (
                  <p className="text-red-500 text-xs">{errors[index].Department}</p>
                )}
              </div>
            </div>

            {/* Subject Code */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-600 mb-1">Subject Code</label>
              <input
                type="text"
                value={sub.SubjectCode}
                placeholder="e.g. BEX 402"
                onChange={(e) => handleSubjectChange(index, "SubjectCode", e.target.value)}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors[index]?.SubjectCode ? "border-red-500" : "border-emerald-300"
                }`}
              />
              <div className="h-5 mt-1">
                {errors[index]?.SubjectCode && (
                  <p className="text-red-500 text-xs">{errors[index].SubjectCode}</p>
                )}
              </div>
            </div>

            {/* Subject Name */}
            <div className="flex-[1.5]">
              <label className="block text-sm font-semibold text-gray-600 mb-1">Subject Name</label>
              <input
                type="text"
                value={sub.SubjectName}
                placeholder="e.g. Data Structures"
                onChange={(e) => handleSubjectChange(index, "SubjectName", e.target.value)}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors[index]?.SubjectName ? "border-red-500" : "border-emerald-300"
                }`}
              />
              <div className="h-5 mt-1">
                {errors[index]?.SubjectName && (
                  <p className="text-red-500 text-xs">{errors[index].SubjectName}</p>
                )}
              </div>
            </div>

            {/* Semester */}
            <div className="flex-1">
               <label className="block text-sm font-semibold text-gray-600 mb-1">Semester *</label>
              <input
                type="number"
                min={1}
                max={10}
                placeholder="1 - 10"
                value={sub.Semester}
                onChange={(e) =>
                  handleSubjectChange(index, "Semester", e.target.value === "" ? "" : e.target.value)
                }
                disabled={isSubmitting}
                required
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors[index]?.Semester ? "border-red-500" : "border-emerald-300"
                }`}
              />
              <div className="h-5 mt-1">
                {errors[index]?.Semester && (
                  <p className="text-red-500 text-xs">{errors[index].Semester}</p>
                )}
              </div>
            </div>

            {/* Add / Remove */}
            <div className="flex gap-2 pt-6">
              <button
                onClick={addRow}
                disabled={isSubmitting}
                className="w-10 h-10 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                +
              </button>
              {subjects.length > 1 && (
                <button
                  onClick={() => removeRow(index)}
                  disabled={isSubmitting}
                  className="w-10 h-10 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  −
              </button>
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={handleAddSubjects}
        disabled={isSubmitting}
        className="bg-emerald-600 text-white px-10 py-2 rounded-lg font-semibold mt-2 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Adding..." : "Add"}
      </button>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </section>
  );
};

export default AddSubjectsCard;