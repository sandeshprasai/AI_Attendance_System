import { useState } from "react";
import { validateClassrooms } from "../../utills/classroomValidations";
import Toast from "../ui/Toast";

const emptyClassroom = {
  Code: "",
  Capacity: "",
  Description: "",
};

const AddClassroomCard = ({ addClassroomAPI }) => {
  const [classrooms, setClassrooms] = useState([{ ...emptyClassroom }]);
  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [successIndices, setSuccessIndices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const handleClassroomChange = (index, field, value) => {
    const updated = classrooms.map((room, i) =>
      i === index ? { ...room, [field]: value } : room
    );
    setClassrooms(updated);

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
    const rowErrors = validateClassrooms(classrooms);
    if (Object.keys(rowErrors).length > 0) {
      setErrors(rowErrors);
      setToast({ message: "Please fix errors before adding a new row", type: "error" });
      return;
    }
    setClassrooms([...classrooms, { ...emptyClassroom }]);
  };

  // Remove row
  const removeRow = (index) => {
    const updated = classrooms.filter((_, i) => i !== index);
    setClassrooms(updated.length > 0 ? updated : [{ ...emptyClassroom }]);
    setErrors(validateClassrooms(updated.length > 0 ? updated : [{ ...emptyClassroom }]));

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

  // Submit classrooms
  const handleAddClassrooms = async () => {
    const rowErrors = validateClassrooms(classrooms);
    if (Object.keys(rowErrors).length > 0) {
      setErrors(rowErrors);
      setToast({ message: "Please fix validation errors before submitting", type: "error" });
      return;
    }

    const payload = classrooms.map((room) => ({
      Class: room.Code.trim(),
      Capacity: Number(room.Capacity),
      Description: room.Description?.trim() || "",
    }));

    setIsSubmitting(true);

    const applyResultsToUI = (results) => {
      // Map backend errors per row
      const newBackendErrors = {};
      const successRows = [];

      const norm = (v) => (v ?? "").toString().trim().toLowerCase();

      const findRowIndex = (r) => {
        const rClassroom = norm(r?.Classroom);

        // Match by Classroom code
        let idx = classrooms.findIndex((room) => {
          const roomCode = norm(room.Code);
          return roomCode && rClassroom && roomCode === rClassroom;
        });

        return idx;
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
      const remaining = classrooms.filter((_, i) => failedIndices.has(i));
      setClassrooms(remaining.length > 0 ? remaining : [{ ...emptyClassroom }]);
      setErrors({});

      // Show toast
      if (Object.keys(newBackendErrors).length && successRows.length) {
        setToast({
          message: `${successRows.length} classroom(s) added successfully. ${Object.keys(newBackendErrors).length} failed.`,
          type: "warning",
        });
      } else if (Object.keys(newBackendErrors).length) {
        setToast({ message: `All submissions failed. Please review errors.`, type: "error" });
      } else {
        setToast({ message: `All ${successRows.length} classroom(s) added successfully!`, type: "success" });
      }
    };

    try {
      const res = await addClassroomAPI(payload);
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
        message: data?.message || err.response?.data?.message || "Failed to add classrooms. Please try again.",
        type: "error",
      });
      console.error("AddClassrooms error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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
            {/* Classroom Code */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Classroom Code
              </label>
              <input
                type="text"
                value={room.Code}
                placeholder="Enter Classroom Number"
                onChange={(e) =>
                  handleClassroomChange(index, "Code", e.target.value)
                }
                disabled={isSubmitting}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors[index]?.Code ? "border-red-500" : "border-cyan-500/30"
                } focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 outline-none transition-all`}
              />
              {errors[index]?.Code && (
                <p className="text-red-500 text-xs mt-1">{errors[index].Code}</p>
              )}
            </div>

            {/* Capacity */}
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
                disabled={isSubmitting}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors[index]?.Capacity ? "border-red-500" : "border-cyan-500/30"
                } focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 outline-none transition-all`}
              />
              {errors[index]?.Capacity && (
                <p className="text-red-500 text-xs mt-1">{errors[index].Capacity}</p>
              )}
            </div>

            {/* Description */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                value={room.Description}
                placeholder="e.g. Third Floor, West Wing"
                onChange={(e) =>
                  handleClassroomChange(index, "Description", e.target.value)
                }
                disabled={isSubmitting}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors[index]?.Description ? "border-red-500" : "border-cyan-500/30"
                } focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 outline-none transition-all`}
              />
              {errors[index]?.Description && (
                <p className="text-red-500 text-xs mt-1">{errors[index].Description}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-6">
              <button
                onClick={addRow}
                disabled={isSubmitting}
                className="w-10 h-10 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>

              {classrooms.length > 1 && (
                <button
                  onClick={() => removeRow(index)}
                  disabled={isSubmitting}
                  className="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  −
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        className="bg-cyan-600 text-white px-10 py-2 rounded-lg hover:bg-cyan-700 font-semibold mt-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleAddClassrooms}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Adding..." : "Add"}
      </button>
    </section>
  );
};

export default AddClassroomCard;