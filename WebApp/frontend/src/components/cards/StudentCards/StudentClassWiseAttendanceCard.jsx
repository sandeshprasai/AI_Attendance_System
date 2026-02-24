import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import apiClient from '../../../utills/apiClient';

export default function StudentClassWiseAttendanceCard() {
  const [classWiseData, setClassWiseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClassWiseAttendance();
  }, []);

  const fetchClassWiseAttendance = async () => {
    try {
      setLoading(true);
      
      const response = await apiClient.get('/student-dashboard/class-wise-attendance');

      if (response.data.success) {
        setClassWiseData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching class-wise attendance:', err);
      setError(err.response?.data?.message || 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Class-wise Attendance</h2>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Class-wise Attendance</h2>
        </div>
      </div>
      
      {classWiseData.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No attendance records yet</p>
          <p className="text-sm text-gray-500">Your attendance will appear here once classes start</p>
        </div>
      ) : (
        <div className="space-y-4">
          {classWiseData.map((classData, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg">
                    {classData.subjectName}
                    {classData.subjectCode && ` (${classData.subjectCode})`}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {classData.teacher} • {classData.className}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 font-medium">
                    {classData.presentCount}/{classData.totalSessions} classes
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getColorClass(classData.attendancePercentage)}`}>
                    {classData.attendancePercentage}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all"
                  style={{ 
                    width: `${classData.attendancePercentage}%`, 
                    backgroundColor: getBarColor(classData.attendancePercentage) 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
