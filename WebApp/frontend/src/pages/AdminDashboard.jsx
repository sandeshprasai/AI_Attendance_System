import React, { useState, useEffect } from 'react';
import { User, LogOut, Clock, Calendar, Users, UserPlus, BookOpen, Settings, Camera, TrendingUp, AlertCircle } from 'lucide-react';
import Navbar from '../components/NavBar';
import GreetingCard from '../components/GreetingCard';
import { useAuth } from '.././context/AuthContext';




export default function AdminDashboard() {
    const { user } = useAuth();


  

  const [currentTime, setCurrentTime] = useState(new Date());
 
  
  

  // Mock stats - replace with actual data from your backend
  const stats = {
    totalStudents: 145,
    totalTeachers: 12,
    totalClassrooms: 8,
    activeClasses: 3,
    presentToday: 118,
    absentToday: 27
  };

  // Mock absent students data - replace with actual data
  const absentStudents = [
    { id: 1, name: "John Smith", class: "Class 10-A", reason: "Not detected", time: "8:30 AM" },
    { id: 2, name: "Emily Davis", class: "Class 9-B", reason: "Not detected", time: "8:45 AM" },
    { id: 3, name: "Michael Brown", class: "Class 10-A", reason: "Not detected", time: "9:00 AM" },
    { id: 4, name: "Sarah Wilson", class: "Class 8-C", reason: "Not detected", time: "9:15 AM" },
    { id: 5, name: "David Lee", class: "Class 10-B", reason: "Not detected", time: "9:30 AM" }
  ];

  const attendanceRate = ((stats.presentToday / stats.totalStudents) * 100).toFixed(1);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

 

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Your Existing Navbar */}
      <Navbar  />
      

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column - Greeting & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Greeting Card */}
            {/* Use Reusable Greeting Card Component */}
            <GreetingCard  />

            {/* Quick Access Cards */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-600" />
                Analytics
              </h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:-translate-y-0.5 font-medium shadow-md text-left flex items-center justify-between">
                  <span>Attendance Trends</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 font-medium shadow-md text-left flex items-center justify-between">
                  <span>Performance Stats</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
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

            {/* Users Card */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                Users
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => alert('Redirecting to All Users page...')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all transform hover:-translate-y-0.5 font-medium shadow-md text-left flex items-center justify-between"
                >
                  <span>View All Users</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
                <div className="pt-2 space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Students</span>
                    <span className="font-bold text-blue-600">{stats.totalStudents}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Teachers</span>
                    <span className="font-bold text-green-600">{stats.totalTeachers}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                    <span className="text-gray-700">Admins</span>
                    <span className="font-bold text-purple-600">3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Dashboard */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Attendance Analytics */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Today's Attendance Analytics</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                
                {/* Present Students */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Present Today</p>
                      <p className="text-4xl font-bold text-green-600 mt-2">{stats.presentToday}</p>
                    </div>
                    <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${attendanceRate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-green-600">{attendanceRate}%</span>
                  </div>
                </div>

                {/* Absent Students */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Absent Today</p>
                      <p className="text-4xl font-bold text-red-600 mt-2">{stats.absentToday}</p>
                    </div>
                    <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${100 - attendanceRate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-red-600">{(100 - attendanceRate).toFixed(1)}%</span>
                  </div>
                </div>

                {/* Attendance Rate */}
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-cyan-100 text-sm font-medium">Attendance Rate</p>
                      <p className="text-4xl font-bold mt-2">{attendanceRate}%</p>
                    </div>
                    <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <p className="text-cyan-100 text-sm">
                    {attendanceRate >= 80 ? '✓ Good attendance' : '⚠ Below target (80%)'}
                  </p>
                </div>
              </div>

              {/* Absent Students Notification Panel */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Absent Students - Notifications
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                      {absentStudents.length}
                    </span>
                  </h3>
                  <button className="text-cyan-600 hover:text-cyan-700 text-sm font-medium flex items-center gap-1">
                    Export List
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {absentStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-red-700" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">{student.name}</p>
                          <p className="text-xs text-gray-600">{student.class} • {student.time}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-red-200 text-red-800 text-xs font-semibold rounded-full">
                            {student.reason}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button 
                          onClick={() => alert(`Notifying parents of ${student.name}`)}
                          className="px-3 py-2 bg-cyan-600 text-white text-xs font-medium rounded-lg hover:bg-cyan-700 transition-colors"
                        >
                          Notify Parents
                        </button>
                        <button 
                          onClick={() => alert(`Marking ${student.name} as excused`)}
                          className="px-3 py-2 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Mark Excused
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {absentStudents.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">No absent students today!</p>
                    <p className="text-sm text-gray-500">Perfect attendance achieved 🎉</p>
                  </div>
                )}
              </div>
            </div>

            {/* System Overview Stats */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">System Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Students */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Students</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalStudents}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">
                    View all →
                  </button>
                </div>

                {/* Total Teachers */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Teachers</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalTeachers}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <button className="text-green-600 text-sm font-medium hover:text-green-700 flex items-center gap-1">
                    View all →
                  </button>
                </div>

                {/* Total Classrooms */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Classrooms</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalClassrooms}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <button className="text-purple-600 text-sm font-medium hover:text-purple-700 flex items-center gap-1">
                    Manage →
                  </button>
                </div>

                {/* Active Classes */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Active Now</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stats.activeClasses}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Camera className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <button className="text-orange-600 text-sm font-medium hover:text-orange-700 flex items-center gap-1">
                    Monitor →
                  </button>
                </div>
              </div>
            </div>

            {/* Management Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Student Management */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Student Management
                  </h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Recently Added</p>
                      <p className="text-xs text-gray-600">Last 7 days</p>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">12</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Pending Verification</p>
                      <p className="text-xs text-gray-600">Face photos needed</p>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">3</span>
                  </div>
                </div>
                <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Add New Student
                </button>
              </div>

              {/* Teacher Management */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    Teacher Management
                  </h3>
                  <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Active Teachers</p>
                      <p className="text-xs text-gray-600">Currently teaching</p>
                    </div>
                    <span className="text-2xl font-bold text-green-600">5</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Pending Assignment</p>
                      <p className="text-xs text-gray-600">No classroom assigned</p>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">2</span>
                  </div>
                </div>
                <button className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                  Add New Teacher
                </button>
              </div>

              {/* Classroom Management */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    Classroom Management
                  </h3>
                  <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Active Classrooms</p>
                      <p className="text-xs text-gray-600">With assigned teachers</p>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">8</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Avg. Students/Class</p>
                      <p className="text-xs text-gray-600">Current distribution</p>
                    </div>
                    <span className="text-2xl font-bold text-cyan-600">18</span>
                  </div>
                </div>
                <button className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                  Create Classroom
                </button>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-600" />
                    System Status
                  </h3>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    ONLINE
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-medium text-gray-800">AI Recognition</p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-medium text-gray-800">Database</p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">Connected</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-cyan-50 rounded-lg">
                  <p className="text-xs text-cyan-800">
                    <strong>Last sync:</strong> {currentTime.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">New student added: John Doe</p>
                    <p className="text-xs text-gray-600">Student ID: STU2025001 • 5 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Teacher assigned to classroom</p>
                    <p className="text-xs text-gray-600">Prof. Sarah Johnson → Room 301 • 12 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">New classroom created: Room 405</p>
                    <p className="text-xs text-gray-600">Capacity: 30 students • 25 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}