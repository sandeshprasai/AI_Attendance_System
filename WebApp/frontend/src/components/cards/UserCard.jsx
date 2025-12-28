import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import API from "../../utills/api";

import { useNavigate } from "react-router-dom";

export default function UserCard() {
  const [stats, setStats] = useState({ student: 0, teacher: 0, admin: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get("/users/stats");
        if (data.success) setStats(data.stats);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const handleViewAllUsers = () => navigate("/admin/users");

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-orange-600" /> Users
      </h3>
      <div className="space-y-3">
        <button
          onClick={handleViewAllUsers}
          className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all transform hover:-translate-y-0.5 font-medium shadow-md text-left flex items-center justify-between"
        >
          <span>View All Users</span>
        </button>
        <div className="pt-2 space-y-2 text-sm">
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
            <span className="text-gray-700">Students</span>
            <span className="font-bold text-blue-600">{stats.student}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
            <span className="text-gray-700">Teachers</span>
            <span className="font-bold text-green-600">{stats.teacher}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
            <span className="text-gray-700">Admins</span>
            <span className="font-bold text-purple-600">{stats.admin}</span>
          </div>
        </div>
      </div>
    </div>
  );
}