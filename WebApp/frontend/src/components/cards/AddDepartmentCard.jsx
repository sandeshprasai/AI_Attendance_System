const AddDepartmentCard = ({
  departments,
  setDepartments,
  handleDeptChange,
  addRow,
  addDepartment,
}) => {
  return (
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
              placeholder="e.g. CS-01"
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
        onClick={addDepartment}
      >
        Add
      </button>
    </section>
  );
};

export default AddDepartmentCard;