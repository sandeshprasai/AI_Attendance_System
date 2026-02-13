import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserPlus, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";
import API from "../../../utills/api";

export default function StudentManagementCard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    recentlyAdded: 0,
    pendingVerification: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await API.get("/admin/student-management-stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch student management stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const items = [
    {
      title: "Recently Added",
      value: stats.recentlyAdded,
      icon: UserPlus,
      color: "blue",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      hoverColor: "hover:bg-blue-100",
      link: "/students-recently-added",
    },
    {
      title: "Pending Verification",
      value: stats.pendingVerification,
      icon: AlertTriangle,
      color: "orange",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      hoverColor: "hover:bg-orange-100",
      link: "/students-pending-verification",
      warning: stats.pendingVerification > 0,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Student Management
        </h3>
        <div className="text-sm text-gray-500">
          Total: <span className="font-bold text-blue-600">{stats.totalStudents}</span>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <button
            key={item.title}
            onClick={() => navigate(item.link)}
            className={`w-full p-4 rounded-xl ${item.bgColor} ${item.hoverColor} transition-all duration-200 border-2 border-transparent hover:border-${item.color}-200 group`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                  <item.icon className={`w-5 h-5 ${item.textColor}`} />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-600 font-medium">
                    {item.title}
                  </p>
                  <p className={`text-2xl font-bold ${item.textColor}`}>
                    {item.value}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.warning && item.value > 0 && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                    !
                  </span>
                )}
                <ArrowRight
                  className={`w-5 h-5 ${item.textColor} group-hover:translate-x-1 transition-transform`}
                />
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => navigate("/add-student")}
        className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-md flex items-center justify-center gap-2"
      >
        <UserPlus className="w-4 h-4" />
        Add Student
      </button>
    </div>
  );
}
