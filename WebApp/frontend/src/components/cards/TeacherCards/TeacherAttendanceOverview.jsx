import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, User, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:9000').replace(/\/$/, '');

export default function TeacherAttendanceOverview() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
    
    // Set up polling every 30 seconds to auto-refresh attendance data
    const pollInterval = setInterval(() => {
      fetchAnalytics();
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(pollInterval);
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      // Fetch attendance analytics for teacher's classes
      const analyticsResponse = await axios.get(`${API_BASE_URL}/api/v1/attendance-analytics/teacher/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (analyticsResponse.data.success) {
        setAnalytics(analyticsResponse.data.data);
      }
    } catch (err) {
      console.error('Error fetching teacher attendance analytics:', err);
      setError(err.response?.data?.message || 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="h-48 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="text-red-800 font-semibold">Error Loading Attendance Data</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics || analytics.summary.sessionsToday === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Attendance Taken Today</h3>
        <p className="text-gray-500">Start taking attendance for your classes to see analytics here.</p>
      </div>
    );
  }

  const { summary, classWiseStats = [] } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Today's Attendance Overview</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Present */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Present Students</p>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{summary.totalPresent}</p>
          <p className="text-xs text-gray-600 mt-1">
            Out of {summary.totalExpected} expected
          </p>
        </div>

        {/* Total Absent */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Absent Students</p>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">{summary.totalAbsent}</p>
          <p className="text-xs text-gray-600 mt-1">
            Need attention
          </p>
        </div>

        {/* Attendance Rate */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Attendance Rate</p>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-600">{summary.attendanceRate}%</p>
          <p className="text-xs text-gray-600 mt-1">
            {summary.sessionsToday} session{summary.sessionsToday !== 1 ? 's' : ''} today
          </p>
        </div>
      </div>

      {/* Class-wise Statistics */}
      {classWiseStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Attendance Sessions</h3>
            {classWiseStats.length > 5 && (
              <Link
                to="/teacher/attendance/class-breakdown"
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
              >
                View All Records ({classWiseStats.length})
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
          <div className="space-y-3">
            {classWiseStats.slice(0, 5).map((cls, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-bold text-gray-800">
                    {cls.subjectName} {cls.subjectCode && `(${cls.subjectCode})`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {cls.subjectName} • {cls.semester && `Semester ${cls.semester}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Present: {cls.present} • Absent: {cls.absent} • Total: {cls.total}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    parseFloat(cls.attendanceRate) >= 75 
                      ? 'text-green-600' 
                      : parseFloat(cls.attendanceRate) >= 50 
                      ? 'text-yellow-600' 
                      : 'text-red-600'
                  }`}>
                    {cls.attendanceRate}%
                  </p>
                  <p className="text-xs text-gray-500">Attendance</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link
          to="/teacher/my-classes"
          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-center font-medium shadow-md"
        >
          View My Classes
        </Link>
      </div>
    </div>
  );
}
