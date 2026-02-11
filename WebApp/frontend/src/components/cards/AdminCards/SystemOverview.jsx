import { useState, useEffect } from "react";
import { Users, User, BookOpen, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../../utills/api";

const SystemOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClassrooms: 0,
    activeClasses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch all stats in parallel
      const [studentsRes, teachersRes, classroomsRes, activeClassesRes] = await Promise.all([
        API.get("/admin/stats/students"),
        API.get("/admin/stats/teachers"),
        API.get("/admin/stats/classrooms"),
        API.get("/admin/stats/active-classes"),
      ]);

      setStats({
        totalStudents: studentsRes.data?.data?.total || 0,
        totalTeachers: teachersRes.data?.data?.total || 0,
        totalClassrooms: classroomsRes.data?.data?.total || 0,
        activeClasses: activeClassesRes.data?.data?.active || 0,
      });
    } catch (error) {
      console.error("Failed to fetch system stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "blue",
      action: "View all",
      link: "/all-students",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      borderColor: "border-blue-500",
      hoverColor: "hover:text-blue-700",
    },
    {
      title: "Total Teachers",
      value: stats.totalTeachers,
      icon: User,
      color: "green",
      action: "View all",
      link: null,
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      borderColor: "border-green-500",
      hoverColor: "hover:text-green-700",
    },
    {
      title: "Classrooms",
      value: stats.totalClassrooms,
      icon: BookOpen,
      color: "purple",
      action: "Manage",
      link: null,
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      borderColor: "border-purple-500",
      hoverColor: "hover:text-purple-700",
    },
    {
      title: "Active Now",
      value: stats.activeClasses,
      icon: Camera,
      color: "orange",
      action: "Monitor",
      link: null,
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
      borderColor: "border-orange-500",
      hoverColor: "hover:text-orange-700",
    },
  ];

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">System Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 mt-2"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">System Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${card.borderColor} hover:shadow-lg transition-shadow`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
                </div>
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
              <button 
                onClick={() => card.link && navigate(card.link)}
                disabled={!card.link}
                className={`${card.textColor} text-sm font-medium ${card.hoverColor} flex items-center gap-1 ${!card.link ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {card.action} →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SystemOverview;
