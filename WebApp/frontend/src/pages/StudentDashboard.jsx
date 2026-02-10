import React from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import GreetingCard from "../components/GreetingCard";
import ClassroomManagementCard from "../components/cards/ClassroomManagementCard";
import { useAuth } from "../context/AuthContext";
import { CheckCircle, XCircle, Clock, TrendingUp, Calendar, FileText, BarChart3, AlertCircle, ChevronRight } from "lucide-react";

const AttendanceCard = ({ type, count, percentage, icon: Icon, bgColor, textColor, barColor }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border-l-4" style={{ borderColor: barColor }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{type}</p>
          <h3 className="text-4xl font-bold text-gray-800">{count}</h3>
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className={`w-8 h-8 ${textColor}`} />
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        ></div>
      </div>
      <p className="text-sm font-semibold" style={{ color: barColor }}>{percentage}%</p>
    </div>
  );
};

const AttendanceRateCard = () => {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-blue-100 text-sm font-medium mb-1">Overall Attendance</p>
          <h3 className="text-5xl font-bold">81.4%</h3>
        </div>
        <div className="bg-white/20 p-3 rounded-full">
          <BarChart3 className="w-10 h-10 text-white" />
        </div>
      </div>
      <div className="flex items-center mt-4">
        <CheckCircle className="w-5 h-5 mr-2" />
        <span className="text-sm font-medium">Good attendance</span>
      </div>
    </div>
  );
};

const AbsentNotificationCard = ({ name, classInfo, time }) => {
  return (
    <div className="bg-white rounded-lg p-4 border-l-4 border-red-500 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="bg-red-100 p-2 rounded-full mt-1">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">{name}</h4>
            <p className="text-sm text-gray-600 mb-1">{classInfo}</p>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>{time}</span>
            </div>
          </div>
        </div>
        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
          Not detected
        </span>
      </div>
    </div>
  );
};

const AnalyticsCard = ({ icon: Icon, title, color, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full ${color} text-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center justify-between`}
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-6 h-6" />
        <span className="font-semibold text-lg">{title}</span>
      </div>
      <ChevronRight className="w-5 h-5" />
    </button>
  );
};

const ReportCard = ({ icon: Icon, title, color, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full ${color} text-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center justify-between`}
    >
      <div className="flex items-center space-x-3">
        <FileText className="w-6 h-6" />
        <span className="font-semibold text-lg">{title}</span>
      </div>
      <ChevronRight className="w-5 h-5" />
    </button>
  );
};

const ClassAttendanceRow = ({ subject, teacher, present, total, percentage }) => {
  const getColorClass = (pct) => {
    if (pct >= 80) return 'text-green-600 bg-green-100';
    if (pct >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getBarColor = (pct) => {
    if (pct >= 80) return '#10b981';
    if (pct >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-800 text-lg">{subject}</h4>
          <p className="text-sm text-gray-600">{teacher}</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 font-medium">{present}/{total} classes</span>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getColorClass(percentage)}`}>
            {percentage}%
          </span>
        </div>
      </div>
      <div className="w-full bg-gray-300 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all"
          style={{ width: `${percentage}%`, backgroundColor: getBarColor(percentage) }}
        ></div>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <NavBar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Greeting Card, Analytics & Reports */}
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

            {/* Analytics Section */}
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-800 text-lg">Analytics</h3>
              </div>
              <div className="space-y-3">
                <AnalyticsCard 
                  icon={TrendingUp}
                  title="Attendance Trends"
                  color="bg-gradient-to-r from-blue-500 to-blue-600"
                />
                <AnalyticsCard 
                  icon={BarChart3}
                  title="Performance Stats"
                  color="bg-gradient-to-r from-purple-500 to-purple-600"
                />
              </div>
            </div>

            {/* Reports Section */}
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-gray-800 text-lg">Reports</h3>
              </div>
              <div className="space-y-3">
                <ReportCard 
                  title="Daily Report"
                  color="bg-gradient-to-r from-green-500 to-green-600"
                />
                <ReportCard 
                  title="Monthly Report"
                  color="bg-gradient-to-r from-teal-500 to-teal-600"
                />
              </div>
            </div>

            {/* Overall Attendance Card */}
            <div>
              <AttendanceRateCard />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* My Recent Absences */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <h2 className="text-2xl font-bold text-gray-800">My Recent Absences</h2>
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">3</span>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                  View All →
                </button>
              </div>
              
              <div className="space-y-4">
                <AbsentNotificationCard 
                  name="Web Development"
                  classInfo="Dr. Sarah Johnson • 2:00 PM"
                  time="Dec 1, 2024"
                />
                <AbsentNotificationCard 
                  name="Database Systems"
                  classInfo="Dr. Emily Williams • 4:00 PM"
                  time="Nov 29, 2024"
                />
                <AbsentNotificationCard 
                  name="Computer Networks"
                  classInfo="Prof. David Miller • 10:00 AM"
                  time="Nov 27, 2024"
                />
              </div>
            </div>

            {/* Class-wise Attendance */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-800">Class-wise Attendance</h2>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                  View All →
                </button>
              </div>
              
              <div className="space-y-4">
                <ClassAttendanceRow 
                  subject="Web Development"
                  teacher="Dr. Sarah Johnson"
                  present={28}
                  total={32}
                  percentage={87.5}
                />
                <ClassAttendanceRow 
                  subject="Data Structures"
                  teacher="Prof. Michael Chen"
                  present={25}
                  total={30}
                  percentage={83.3}
                />
                <ClassAttendanceRow 
                  subject="Database Systems"
                  teacher="Dr. Emily Williams"
                  present={22}
                  total={28}
                  percentage={78.6}
                />
                <ClassAttendanceRow 
                  subject="Computer Networks"
                  teacher="Prof. David Miller"
                  present={18}
                  total={30}
                  percentage={60.0}
                />
                <ClassAttendanceRow 
                  subject="Operating Systems"
                  teacher="Dr. Lisa Anderson"
                  present={26}
                  total={30}
                  percentage={86.7}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;