import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:9000').replace(/\/$/, '');

export default function StudentOverallStatsCard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      const response = await axios.get(`${API_BASE_URL}/api/v1/student-dashboard/overall-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching student stats:', err);
      setError(err.response?.data?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white animate-pulse">
        <div className="h-20 bg-white/20 rounded"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-gray-100 rounded-xl p-6 shadow-lg">
        <p className="text-gray-600 text-sm text-center">No attendance data available</p>
      </div>
    );
  }

  const attendanceRate = stats.attendancePercentage || 0;

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-blue-100 text-sm font-medium mb-1">Overall Attendance</p>
          <h3 className="text-5xl font-bold">{attendanceRate}%</h3>
        </div>
        <div className="bg-white/20 p-3 rounded-full">
          <BarChart3 className="w-10 h-10 text-white" />
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-blue-100">Present: {stats.presentCount}</span>
          <span className="text-blue-100">Absent: {stats.absentCount}</span>
        </div>
        <div className="flex items-center mt-3">
          {attendanceRate >= 75 ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Good attendance</span>
            </>
          ) : attendanceRate >= 60 ? (
            <>
              <TrendingUp className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Needs improvement</span>
            </>
          ) : (
            <>
              <TrendingUp className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Critical - Below 60%</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
