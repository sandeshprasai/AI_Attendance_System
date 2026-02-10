import React, { useState, useEffect } from 'react';
import { BookOpen, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utills/apiClient';

/**
 * ClassroomManagementCard - Reusable component for displaying classroom statistics
 * 
 * @param {Object} props
 * @param {string} props.userRole - User role: "admin", "teacher", or "student"
 * @param {string} props.userId - Optional user ID for filtering data (teacher/student specific)
 * @param {string} props.userName - Optional user name for filtering (teacher/student specific)
 * @param {boolean} props.showCreateButton - Show or hide the Create Classroom button (default: true)
 * @param {string} props.createButtonLabel - Custom label for create button (default: "Create Classroom")
 * @param {string} props.createButtonRoute - Custom route for create button (default: "/admin/create-academic-class")
 * @param {string} props.viewAllRoute - Custom route for View All button
 */
export default function ClassroomManagementCard({
  userRole = 'admin',
  userId = null,
  userName = null,
  showCreateButton = true,
  createButtonLabel = 'Create Classroom',
  createButtonRoute = '/admin/create-academic-class',
  viewAllRoute = '/admin/academic-classes'
}) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeClassrooms: 0,
    completedClassrooms: 0,
    avgStudentsPerClass: 0,
    totalTeachersInActive: 0,
    totalStudentsInActive: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    // For teachers, wait until we have either userId or userName
    if (userRole === 'teacher' && !userId && !userName) {
      return;
    }
    fetchClassroomStats();
  }, [userRole, userId, userName]);

  const fetchClassroomStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Fetch academic classes from API
      const response = await apiClient.get('/academic-class');
      const classes = response.data.data || [];
      
      // Filter based on user role
      let filteredClasses = classes;
      if (userRole === 'teacher' && (userId || userName)) {
        // For teachers, we need to match by Teacher username from context
        // Since Teacher table IDs don't match User table IDs
        const storedUserName = userName || window.localStorage.getItem('name') || window.sessionStorage.getItem('name');
        
        filteredClasses = classes.filter(cls => {
          // Try matching by ID first (in case it's linked properly)
          if (userId && cls.Teacher?._id === userId) return true;
          
          // Match by name
          if (storedUserName && cls.Teacher?.FullName) {
            return cls.Teacher.FullName.toLowerCase() === storedUserName.toLowerCase();
          }
          
          return false;
        });
      } else if (userRole === 'student' && userId) {
        filteredClasses = classes.filter(cls => 
          cls.Students?.some(student => student._id === userId)
        );
      }

      // Calculate statistics
      const activeClasses = filteredClasses.filter(cls => cls.Status === 'active');
      const completedClasses = filteredClasses.filter(cls => cls.Status === 'completed');
      
      // Use active + completed for avg calculation
      const activeAndCompleted = [...activeClasses, ...completedClasses];
      
      const totalStudents = activeAndCompleted.reduce((sum, cls) => 
        sum + (cls.Students?.length || 0), 0
      );
      const avgStudents = activeAndCompleted.length > 0 
        ? Math.round(totalStudents / activeAndCompleted.length) 
        : 0;

      // Calculate total students in ACTIVE classes only
      const totalStudentsInActive = activeClasses.reduce((sum, cls) => 
        sum + (cls.Students?.length || 0), 0
      );

      // Calculate total teachers in ACTIVE classes only
      const activeTeacherIds = new Set();
      activeClasses.forEach(cls => {
        if (cls.Teacher?._id) {
          activeTeacherIds.add(cls.Teacher._id);
        }
      });

      setStats({
        activeClassrooms: activeClasses.length,
        completedClassrooms: completedClasses.length,
        avgStudentsPerClass: avgStudents,
        totalTeachersInActive: activeTeacherIds.size,
        totalStudentsInActive: totalStudentsInActive,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching classroom stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load classroom data'
      }));
    }
  };

  const handleCreateClick = () => {
    navigate(createButtonRoute);
  };

  const handleViewAllClick = () => {
    if (viewAllRoute) {
      navigate(viewAllRoute);
    }
  };

  // Role-specific titles and descriptions
  const getTitleByRole = () => {
    switch (userRole) {
      case 'teacher':
        return 'My Classrooms';
      case 'student':
        return 'My Classes';
      default:
        return 'Classroom Management';
    }
  };

  const getActiveDescription = () => {
    switch (userRole) {
      case 'teacher':
        return 'Classes you teach';
      case 'student':
        return 'Classes enrolled';
      default:
        return 'With assigned teachers';
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
        <div className="space-y-2">
          <div className="h-14 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-600" />
          {getTitleByRole()}
        </h3>
        {viewAllRoute && (
          <button
            onClick={handleViewAllClick}
            className="text-purple-600 hover:text-purple-700 text-xs font-medium transition-colors"
          >
            View All
          </button>
        )}
      </div>

      {stats.error ? (
        <div className="text-center py-3 text-red-500 text-xs">
          {stats.error}
        </div>
      ) : (
        <>
          {/* Summary Grid - Class Status */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Active Classrooms */}
            <div className="p-2.5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-sm transition-all">
              <p className="text-xs text-gray-600 mb-0.5">Active</p>
              <p className="text-xl font-bold text-green-600">{stats.activeClassrooms}</p>
            </div>

            {/* Completed Classrooms */}
            <div className="p-2.5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 hover:shadow-sm transition-all">
              <p className="text-xs text-gray-600 mb-0.5">Completed</p>
              <p className="text-xl font-bold text-blue-600">{stats.completedClassrooms}</p>
            </div>
          </div>

          <div className="space-y-2">
            {/* Average Students per Class */}
            <div className="flex items-center justify-between p-2.5 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <div>
                <p className="text-xs font-medium text-gray-800">
                  {userRole === 'student' ? 'Avg. Classmates' : 'Avg. Students/Class'}
                </p>
                <p className="text-[10px] text-gray-500">Active + Completed</p>
              </div>
              <span className="text-xl font-bold text-purple-600">
                {stats.avgStudentsPerClass}
              </span>
            </div>

            {/* Total Teachers in Active Classes (only for admin) */}
            {userRole === 'admin' && (
              <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-800">Total Teachers</p>
                    <p className="text-[10px] text-gray-500">In active classes</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-amber-600">
                  {stats.totalTeachersInActive}
                </span>
              </div>
            )}

            {/* Total Students in Active Classes */}
            {userRole !== 'student' && (
              <div className="flex items-center justify-between p-2.5 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-800">Total Students</p>
                    <p className="text-[10px] text-gray-500">In active classes</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-indigo-600">
                  {stats.totalStudentsInActive}
                </span>
              </div>
            )}
          </div>

          {/* Create/Action Button */}
          {showCreateButton && userRole === 'admin' && (
            <button
              onClick={handleCreateClick}
              className="mt-3 w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
            >
              {createButtonLabel}
            </button>
          )}

          {/* View Classes Button for Teacher/Student */}
          {(userRole === 'teacher' || userRole === 'student') && viewAllRoute && (
            <button
              onClick={handleViewAllClick}
              className="mt-3 w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
            >
              View My Classes
            </button>
          )}
        </>
      )}
    </div>
  );
}
