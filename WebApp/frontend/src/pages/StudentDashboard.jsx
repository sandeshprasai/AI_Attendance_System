import React from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import GreetingCard from "../components/GreetingCard";
import ClassroomManagementCard from "../components/cards/ClassroomManagementCard";
import StudentOverallStatsCard from "../components/cards/StudentCards/StudentOverallStatsCard";
import StudentRecentAbsencesCard from "../components/cards/StudentCards/StudentRecentAbsencesCard";
import StudentClassWiseAttendanceCard from "../components/cards/StudentCards/StudentClassWiseAttendanceCard";
import { useAuth } from "../context/AuthContext";

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <NavBar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Greeting Card & My Classes */}
          <div className="lg:col-span-1 space-y-6">
            {/* Greeting Card */}
            <div>
              <GreetingCard />
            </div>

            {/* My Classes Card */}
            <div>
              <ClassroomManagementCard 
                userRole="student"
                userId={user?.id}
                showCreateButton={false}
                viewAllRoute="/student/my-classes"
              />
            </div>

            {/* Overall Attendance Stats Card */}
            <div>
              <StudentOverallStatsCard />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* My Recent Absences */}
            <StudentRecentAbsencesCard />

            {/* Class-wise Attendance */}
            <StudentClassWiseAttendanceCard />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;