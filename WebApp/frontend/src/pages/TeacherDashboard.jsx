import React from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import GreetingCard from "../components/GreetingCard";
import ClassroomManagementCard from "../components/cards/ClassroomManagementCard";
import { useAuth } from "../context/AuthContext";
import { Calendar, Users, BookOpen, TrendingUp } from "lucide-react";

const TeacherDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <NavBar />
      
      {/* Main content with top padding for fixed navbar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <GreetingCard />
            
            {/* Classroom Management Card */}
            <ClassroomManagementCard 
              userRole="teacher"
              userId={user?.id}
              userName={user?.name}
              showCreateButton={false}
              viewAllRoute="/teacher/my-classes"
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Today's Schedule</h2>
              </div>
              <p className="text-gray-600">Your classes and attendance tracking will appear here.</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800">Attendance Overview</h2>
              </div>
              <p className="text-gray-600">Class-wise attendance statistics will be displayed here.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TeacherDashboard;