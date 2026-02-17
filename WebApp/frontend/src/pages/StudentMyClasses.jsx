import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, User, TrendingUp, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import apiClient from '../utills/apiClient';
import { formatKathmanduDateTime } from '../utils/timezoneHelper';

export default function StudentMyClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedClass, setExpandedClass] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/student-dashboard/my-classes-detailed');
      
      if (response.data.success) {
        setClasses(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError(err.response?.data?.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (classId) => {
    setExpandedClass(expandedClass === classId ? null : classId);
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusColor = (status) => {
    if (status === 'active' || status === 'ongoing') return 'bg-green-100 text-green-700';
    if (status === 'completed') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <NavBar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <NavBar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-600">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <NavBar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-600" />
            My Classes
          </h1>
          <p className="text-gray-600 mt-2">View all your enrolled classes and attendance history</p>
        </div>

        {/* Classes List */}
        {classes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Classes Enrolled</h2>
            <p className="text-gray-500">You are not enrolled in any classes yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {classes.map((cls) => (
              <div 
                key={cls.classId}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Class Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-800">
                          {cls.subject.name}
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(cls.status)}`}>
                          {cls.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">
                        {cls.subject.code && `${cls.subject.code} • `}
                        {cls.className}
                        {cls.classCode && ` (${cls.classCode})`}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        <span>{cls.teacher.name}</span>
                        {cls.semester && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Semester {cls.semester}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Attendance Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Total Sessions */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Total Sessions</p>
                      <p className="text-2xl font-bold text-gray-800">{cls.attendance.totalSessions}</p>
                    </div>

                    {/* Present */}
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Present</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="text-2xl font-bold text-green-600">{cls.attendance.presentCount}</p>
                      </div>
                    </div>

                    {/* Absent */}
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Absent</p>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <p className="text-2xl font-bold text-red-600">{cls.attendance.absentCount}</p>
                      </div>
                    </div>

                    {/* Attendance Rate */}
                    <div className={`p-4 rounded-lg border-2 ${getAttendanceColor(cls.attendance.attendancePercentage)}`}>
                      <p className="text-xs mb-1">Attendance Rate</p>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        <p className="text-2xl font-bold">{cls.attendance.attendancePercentage}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                {cls.attendance.history.length > 0 && (
                  <button
                    onClick={() => toggleExpand(cls.classId)}
                    className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-gray-700 font-medium"
                  >
                    {expandedClass === cls.classId ? (
                      <>
                        <ChevronUp className="w-5 h-5" />
                        Hide Attendance History
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-5 h-5" />
                        View Attendance History ({cls.attendance.history.length} sessions)
                      </>
                    )}
                  </button>
                )}

                {/* Attendance History */}
                {expandedClass === cls.classId && cls.attendance.history.length > 0 && (
                  <div className="p-6 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Attendance History
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {cls.attendance.history.map((record, index) => {
                        // Use createdAt if available, otherwise fall back to date
                        const timestamp = record.createdAt || record.date;
                        
                        // Debug logging
                        if (index === 0) {
                          console.log('First attendance record:', {
                            record,
                            timestamp,
                            createdAt: record.createdAt,
                            date: record.date
                          });
                        }
                        
                        const dateTime = timestamp ? formatKathmanduDateTime(timestamp) : { date: 'N/A', time: 'N/A' };
                        
                        console.log('Formatted dateTime:', dateTime);
                        
                        return (
                          <div 
                            key={index}
                            className={`p-4 rounded-lg border-l-4 ${
                              record.status === 'present' 
                                ? 'bg-green-50 border-green-500' 
                                : 'bg-red-50 border-red-500'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {record.status === 'present' ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                )}
                                <div>
                                  <p className={`font-semibold ${
                                    record.status === 'present' ? 'text-green-700' : 'text-red-700'
                                  }`}>
                                    {record.status === 'present' ? 'Present' : 'Absent'}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {dateTime.date} • {dateTime.time}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Session ID</p>
                                <p className="text-sm font-mono text-gray-700">{record.sessionId}</p>
                                {record.status === 'present' && (
                                  <p className="text-xs text-green-600 mt-1">
                                    Detected in {record.presenceCount} snapshot(s)
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
