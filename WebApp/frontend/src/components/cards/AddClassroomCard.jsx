const AddClassroomCard = ({
  classrooms,
  setClassrooms,
  handleClassroomChange,
  addRow,
  addClassroom,
}) => {
  return (
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
        <h2 className="text-xl font-bold text-cyan-600">
          Add Classroom
        </h2>
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
              placeholder="e.g. D001"
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
        onClick={addClassroom}
      >
        Add
      </button>
    </section>
  );
};

export default AddClassroomCard;