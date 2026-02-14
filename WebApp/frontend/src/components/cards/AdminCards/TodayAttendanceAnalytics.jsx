import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, User, Download, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AbsentNotificationCard from '../../AbsentNotificationCard';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:9000').replace(/\/$/, '');

export default function TodayAttendanceAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [absentNotifications, setAbsentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      // Fetch attendance analytics for stats
      const analyticsResponse = await axios.get(`${API_BASE_URL}/api/v1/attendance-analytics/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (analyticsResponse.data.success) {
        setAnalytics(analyticsResponse.data.data.summary);
      }

      // Fetch today's absent notifications for the list
      const notificationsResponse = await axios.get(`${API_BASE_URL}/api/v1/absent-notifications/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (notificationsResponse.data.success) {
        setAbsentNotifications(notificationsResponse.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching attendance analytics:', err);
      setError(err.response?.data?.message || 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAbsentStudents = () => {
    const dataStr = JSON.stringify(absentNotifications, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `absent-students-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="h-64 bg-gray-200 rounded-xl"></div>
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

  if (!analytics) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <p className="text-gray-600">No attendance data available for today</p>
      </div>
    );
  }

  const attendanceRate = analytics.attendanceRate || 0;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Today's Attendance Analytics</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Present Students */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Present Today</p>
              <p className="text-4xl font-bold text-green-600 mt-2">{analytics.totalPresent}</p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.sessionsToday} session{analytics.sessionsToday !== 1 ? 's' : ''} recorded
              </p>
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
              <p className="text-4xl font-bold text-red-600 mt-2">{analytics.totalAbsent}</p>
              <p className="text-xs text-gray-500 mt-1">
                Out of {analytics.totalExpected} expected
              </p>
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
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Absent Students - Notifications
            <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
              {absentNotifications.length}
            </span>
          </h3>
          <div className="flex gap-2">
            {absentNotifications.length > 0 && (
              <button 
                onClick={handleExportAbsentStudents}
                className="text-cyan-600 hover:text-cyan-700 text-sm font-medium flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Export List
              </button>
            )}
            <Link
              to="/admin/absent-notifications"
              className="text-cyan-600 hover:text-cyan-700 text-sm font-medium flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              View All
            </Link>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {absentNotifications.length > 0 ? (
            absentNotifications.slice(0, 5).map((notification) => (
              <AbsentNotificationCard
                key={notification._id}
                notification={notification}
                onNotificationSent={() => fetchAnalytics()}
                onMarkedExcused={() => fetchAnalytics()}
                compact={true}
              />
            ))
          ) : (
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
          {absentNotifications.length > 5 && (
            <div className="text-center pt-3 border-t border-gray-200">
              <Link
                to="/admin/absent-notifications"
                className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
              >
                View all {absentNotifications.length} absent students →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
