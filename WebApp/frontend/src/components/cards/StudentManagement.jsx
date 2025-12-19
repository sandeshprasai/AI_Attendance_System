import React from "react";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentManagementCard = ({ title = "Student Management", stats = [], onViewAll }) => {
  const navigate = useNavigate();

  // Function to redirect to /add-student
  const handleAddNewStudent = () => {
    navigate("/add-student");
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          {title}
        </h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg ${
              stat.bgColor || "bg-gray-50"
            }`}
          >
            <div>
              <p className="text-sm font-medium text-gray-800">{stat.label}</p>
              {stat.subLabel && (
                <p className="text-xs text-gray-600">{stat.subLabel}</p>
              )}
            </div>
            <span className={`text-2xl font-bold ${stat.valueColor || "text-gray-800"}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Add New Button */}
      <button
        onClick={handleAddNewStudent}
        className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Add New Student
      </button>
    </div>
  );
};

export default StudentManagementCard;