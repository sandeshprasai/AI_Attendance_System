import React, { useState, useEffect } from 'react';
import { BookOpen, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../utills/apiClient';

/**
 * StudentMyClassesCard - Displays student's enrolled classes
 */
export default function StudentMyClassesCard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeClasses: 0,
    totalClasses: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchStudentClasses();
  }, []);

  const fetchStudentClasses = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      const response = await apiClient.get('/student-dashboard/my-classes');

      if (response.data.success) {
        const classes = response.data.data || [];
        const activeClasses = classes.filter(cls => cls.Status === 'active' || cls.Status === 'ongoing');

        setStats({
          activeClasses: activeClasses.length,
          totalClasses: classes.length,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Error fetching student classes:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Failed to load classes'
      }));
    }
  };

  if (stats.loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-5 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="h-16 bg-gray-100 rounded-lg"></div>
          <div className="h-16 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-600" />
          My Classes
        </h3>
      </div>

      {stats.error ? (
        <div className="text-center py-3 text-red-500 text-xs">
          {stats.error}
        </div>
      ) : stats.totalClasses === 0 ? (
        <div className="text-center py-4">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-600 text-sm font-medium">No classes enrolled yet</p>
          <p className="text-gray-500 text-xs">You'll see your classes here once enrolled</p>
        </div>
      ) : (
        <>
          {/* Summary Grid - Class Status */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Active Classes */}
            <div className="p-2.5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-sm transition-all">
              <p className="text-xs text-gray-600 mb-0.5">Active Classes</p>
              <p className="text-xl font-bold text-green-600">{stats.activeClasses}</p>
            </div>

            {/* Total Classes */}
            <div className="p-2.5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 hover:shadow-sm transition-all">
              <p className="text-xs text-gray-600 mb-0.5">Total Enrolled</p>
              <p className="text-xl font-bold text-blue-600">{stats.totalClasses}</p>
            </div>
          </div>

          {/* View Classes Button */}
          <button
            onClick={() => navigate('/student/my-classes')}
            className="mt-3 w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
          >
            View All Classes
          </button>
        </>
      )}
    </div>
  );
}
