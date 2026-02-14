import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Filter, Download, Search, RefreshCw, TrendingUp, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:9000').replace(/\/$/, '');

const getActivityIcon = (activityType) => {
  const icons = {
    STUDENT_ADDED: '👨‍🎓',
    STUDENT_UPDATED: '✏️',
    STUDENT_DELETED: '🗑️',
    TEACHER_ADDED: '👨‍🏫',
    TEACHER_UPDATED: '📝',
    TEACHER_DELETED: '🗑️',
    CLASSROOM_CREATED: '🏫',
    CLASSROOM_UPDATED: '🔧',
    CLASSROOM_DELETED: '🗑️',
    ATTENDANCE_MARKED: '✅',
    USER_LOGIN: '🔐',
    USER_LOGOUT: '🚪',
    SYSTEM_ALERT: '⚠️',
    default: '📋'
  };
  return icons[activityType] || icons.default;
};

const getActivityColor = (activityType) => {
  const colors = {
    STUDENT_ADDED: 'border-l-blue-500 bg-blue-50',
    STUDENT_UPDATED: 'border-l-cyan-500 bg-cyan-50',
    STUDENT_DELETED: 'border-l-red-500 bg-red-50',
    TEACHER_ADDED: 'border-l-green-500 bg-green-50',
    TEACHER_UPDATED: 'border-l-emerald-500 bg-emerald-50',
    TEACHER_DELETED: 'border-l-red-500 bg-red-50',
    CLASSROOM_CREATED: 'border-l-purple-500 bg-purple-50',
    CLASSROOM_UPDATED: 'border-l-violet-500 bg-violet-50',
    CLASSROOM_DELETED: 'border-l-red-500 bg-red-50',
    ATTENDANCE_MARKED: 'border-l-orange-500 bg-orange-50',
    USER_LOGIN: 'border-l-indigo-500 bg-indigo-50',
    USER_LOGOUT: 'border-l-gray-500 bg-gray-50',
    SYSTEM_ALERT: 'border-l-yellow-500 bg-yellow-50',
    default: 'border-l-gray-500 bg-gray-50'
  };
  return colors[activityType] || colors.default;
};

const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - activityTime) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export default function RecentActivityPage() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  const activityTypes = [
    'ALL',
    'STUDENT_ADDED',
    'TEACHER_ADDED',
    'CLASSROOM_CREATED',
    'ATTENDANCE_MARKED',
    'USER_LOGIN',
    'SYSTEM_ALERT'
  ];

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, [currentPage, filterType]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (currentPage === 1) {
      fetchActivities();
    } else {
      setCurrentPage(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      // Build query params
      const params = {
        page: currentPage,
        limit: itemsPerPage
      };
      
      // Add type filter if not 'ALL'
      if (filterType !== 'ALL') {
        params.type = filterType;
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/v1/activities/recent`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        let data = response.data.data;
        
        // Apply client-side search filter if search term exists
        if (searchTerm) {
          data = data.filter(activity =>
            activity.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setActivities(data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCount(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Use mock data if API fails
      const mockData = getMockActivities();
      setActivities(mockData);
      setTotalPages(1);
      setTotalCount(mockData.length);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const response = await axios.get(`${API_BASE_URL}/api/v1/activities/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getMockActivities = () => {
    const now = Date.now();
    return [
      {
        _id: '1',
        activityType: 'STUDENT_ADDED',
        description: 'New student added: John Doe',
        performedBy: { name: 'Admin User', role: 'admin' },
        metadata: { studentId: 'STU2025001' },
        timestamp: new Date(now - 5 * 60 * 1000)
      },
      {
        _id: '2',
        activityType: 'TEACHER_ADDED',
        description: 'Teacher assigned to classroom',
        performedBy: { name: 'Admin User', role: 'admin' },
        metadata: { teacher: 'Prof. Sarah Johnson', room: 'Room 301' },
        timestamp: new Date(now - 12 * 60 * 1000)
      },
      {
        _id: '3',
        activityType: 'CLASSROOM_CREATED',
        description: 'New classroom created: Room 405',
        performedBy: { name: 'Admin User', role: 'admin' },
        metadata: { capacity: '30 students' },
        timestamp: new Date(now - 25 * 60 * 1000)
      },
      {
        _id: '4',
        activityType: 'ATTENDANCE_MARKED',
        description: 'Attendance marked for Class 10-A',
        performedBy: { name: 'Teacher Smith', role: 'teacher' },
        metadata: { present: 28, absent: 2 },
        timestamp: new Date(now - 45 * 60 * 1000)
      },
      {
        _id: '5',
        activityType: 'USER_LOGIN',
        description: 'Admin logged into the system',
        performedBy: { name: 'Admin User', role: 'admin' },
        timestamp: new Date(now - 60 * 60 * 1000)
      }
    ];
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(activities, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-log-${new Date().toISOString()}.json`;
    link.click();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Recent Activity</h1>
              <p className="text-gray-600 mt-1">Track all system activities and changes</p>
            </div>
            <button
              onClick={fetchActivities}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Today's Activities</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{stats.todayCount || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Activities</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{stats.totalCount || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Activities</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{totalCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Filter className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            {/* Filter by Type */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
              >
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity Log</h2>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse p-4 border-l-4 border-gray-300 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity) => {
                const { date, time } = formatDateTime(activity.timestamp);
                return (
                  <div
                    key={activity._id}
                    className={`p-4 border-l-4 ${getActivityColor(activity.activityType)} rounded-lg hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{getActivityIcon(activity.activityType)}</div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{activity.description}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-600">
                          {activity.performedBy && (
                            <span className="flex items-center gap-1">
                              👤 {activity.performedBy.name} ({activity.performedBy.role})
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            📅 {date}
                          </span>
                          <span className="flex items-center gap-1">
                            🕐 {time}
                          </span>
                          <span className="text-cyan-600 font-medium">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <span key={key} className="mr-3">
                                {key}: <span className="font-medium">{value}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No activities found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, totalCount)} of{' '}
                {totalCount} activities
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    // Show first, last, current, and adjacent pages
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      Math.abs(pageNum - currentPage) <= 1
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
