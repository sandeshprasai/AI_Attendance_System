import React, { useState, useEffect } from 'react';
import { User, LogOut, Clock, Calendar, Users, UserPlus, BookOpen, Settings, Camera, TrendingUp, AlertCircle, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import GreetingCard from '../components/GreetingCard';
import UserCard from"../components/cards/UserCard";
import ClassroomManagementCard from '../components/cards/ClassroomManagementCard';
import SystemOverview from '../components/cards/AdminCards/SystemOverview';
import StudentManagementCard from '../components/cards/AdminCards/StudentManagementCard';
import TeacherManagementCard from '../components/cards/AdminCards/TeacherManagementCard';
import SystemStatusCard from '../components/cards/AdminCards/SystemStatusCard';
import RecentActivityCard from '../components/cards/AdminCards/RecentActivityCard';
import TodayAttendanceAnalytics from '../components/cards/AdminCards/TodayAttendanceAnalytics';
import { useAuth } from '.././context/AuthContext';




export default function AdminDashboard() {
    const { user } = useAuth();


  

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

 

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Your Existing Navbar */}
      <Navbar  />
      

      {/* Main Content */}
       {/* Scrollable Area */}
 
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Sidebar - Quick Access & Status */}
          <div className="lg:col-span-1 space-y-6">
            {/* Greeting Card */}
            <GreetingCard  />

            {/* System Status - Moved to sidebar for prominence */}
            <SystemStatusCard />

            {/* Recent Activity Preview - Moved to sidebar */}
            <RecentActivityCard />

            {/* Users Card */}
            <UserCard />

            {/* Quick Links Card */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-cyan-600" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link 
                  to="/admin/absent-notifications"
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:-translate-y-0.5 font-medium shadow-md text-left flex items-center justify-between"
                >
                  <span>Absentee Notifications</span>
                  <Bell className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Reports Card */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Reports
              </h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:-translate-y-0.5 font-medium shadow-md text-left flex items-center justify-between">
                  <span>Daily Report</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                <button className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all transform hover:-translate-y-0.5 font-medium shadow-md text-left flex items-center justify-between">
                  <span>Monthly Report</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content - Attendance & Management */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Today's Attendance Analytics Component */}
            <TodayAttendanceAnalytics />

            {/* System Overview Stats */}
            <SystemOverview />

            {/* Management Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student Management */}
              <StudentManagementCard />

              {/* Teacher Management */}
              <TeacherManagementCard />
            </div>

            {/* Classroom Management - Full Width */}
            <ClassroomManagementCard
              userRole="admin"
              showCreateButton={true}
              createButtonLabel="Create Classroom"
              createButtonRoute="/admin/create-academic-class"
              viewAllRoute="/admin/academic-classes"
            />
          </div>
        </div>
      </main>
      {/* Your Existing Footer */}
      <Footer />
    </div>
  );
}