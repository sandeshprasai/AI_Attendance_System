import React, { useState, useEffect } from 'react';
import { Bell, Filter, Download, RefreshCw, Calendar, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import AbsentNotificationCard from '../components/AbsentNotificationCard';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:9000').replace(/\/$/, '');

export default function AbsentNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, notified, excused
  const [dateFilter, setDateFilter] = useState(''); // ISO date string
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 5;

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    notified: 0,
    excused: 0,
  });

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, statusFilter, dateFilter]);

  useEffect(() => {
    // Calculate stats from all notifications (not just current page)
    if (notifications.length > 0) {
      calculateStats(notifications);
    }
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      // Build query params
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: '-date',
      };

      // Add filters
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (dateFilter) {
        params.date = dateFilter;
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/absent-notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (response.data.success) {
        const data = response.data.data.notifications || response.data.data;
        const pagination = response.data.data.pagination || response.data.pagination;
        
        console.log('API Response:', response.data);
        console.log('Pagination data:', pagination);
        
        setNotifications(data);
        setFilteredNotifications(data);
        setTotalPages(pagination?.pages || Math.ceil((pagination?.total || data.length) / itemsPerPage));
        setTotalCount(pagination?.total || data.length);
        
        // Fetch stats separately for all data
        fetchAllStats();
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStats = async () => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const response = await axios.get(`${API_BASE_URL}/api/v1/absent-notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 1000, sortBy: '-date' } // Get all for stats
      });

      if (response.data.success) {
        const allData = response.data.data.notifications || response.data.data;
        calculateStats(allData);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await fetchNotifications();
    setRefreshing(false);
  };

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      pending: data.filter(n => n.status === 'pending').length,
      notified: data.filter(n => n.status === 'notified').length,
      excused: data.filter(n => n.status === 'excused' || n.isExcused).length,
    };
    setStats(stats);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setDateFilter('');
    setCurrentPage(1);
  };

  const handleNotificationSent = (notificationId, data) => {
    setNotifications(prev => prev.map(n => 
      n._id === notificationId 
        ? { ...n, notificationSent: true, status: 'notified', notificationSentAt: data.sentAt, parentEmail: data.emailSent }
        : n
    ));
  };

  const handleMarkedExcused = (notificationId, data) => {
    setNotifications(prev => prev.map(n => 
      n._id === notificationId 
        ? { ...n, isExcused: true, status: 'excused', excusedAt: data.excusedAt, excusedReason: data.excusedReason }
        : n
    ));
  };

  const handleExportNotifications = () => {
    const dataStr = JSON.stringify(filteredNotifications, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `absent-notifications-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkNotify = async () => {
    if (stats.pending === 0) {
      alert('No pending notifications to send');
      return;
    }

    if (!confirm(`Send notifications to all ${stats.pending} pending students?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      // Fetch all pending notification IDs
      const allResponse = await axios.get(`${API_BASE_URL}/api/v1/absent-notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'pending', limit: 1000 }
      });

      const pendingIds = (allResponse.data.data.notifications || allResponse.data.data)
        .filter(n => !n.notificationSent && !n.isExcused)
        .map(n => n._id);

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/absent-notifications/bulk/notify`,
        { notificationIds: pendingIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(`Successfully sent ${response.data.data.success.length} notifications`);
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error in bulk notify:', err);
      alert('Failed to send bulk notifications');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-gray-200 rounded-xl"></div>
              <div className="h-48 bg-gray-200 rounded-xl"></div>
              <div className="h-48 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Bell className="w-8 h-8 text-cyan-600" />
                Absentee Notifications
              </h1>
              <p className="text-gray-600 mt-2">
                Manage absent student notifications and parent communications
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button
                onClick={handleExportNotifications}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Absences</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
                </div>
                <Users className="w-12 h-12 text-gray-400" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Notified</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{stats.notified}</p>
                </div>
                <AlertCircle className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Excused</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.excused}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="notified">Notified</option>
                    <option value="excused">Excused</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => handleDateFilterChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleClearFilters}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {stats.pending > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  <strong>{stats.pending}</strong> notifications are pending
                </p>
              </div>
              <button
                onClick={handleBulkNotify}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                Notify All Pending
              </button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-red-800 font-semibold">Error Loading Notifications</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button 
              onClick={fetchNotifications}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            <>
              {filteredNotifications.map((notification) => (
                <AbsentNotificationCard
                  key={notification._id}
                  notification={notification}
                  onNotificationSent={handleNotificationSent}
                  onMarkedExcused={handleMarkedExcused}
                  showFullDetails={true}
                />
              ))}
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {totalCount === 0 ? 'No Absent Notifications' : 'No Matching Notifications'}
              </h3>
              <p className="text-gray-600">
                {totalCount === 0 
                  ? 'All students are present. Great job!' 
                  : 'Try adjusting your filters to see more results.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination - Always show when there are notifications */}
        {totalCount > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-lg p-6 mt-6 border-2 border-indigo-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm font-medium">
                <span className="text-gray-700">Showing </span>
                <span className="text-indigo-600 font-bold text-lg">{(currentPage - 1) * itemsPerPage + 1}</span>
                <span className="text-gray-700"> to </span>
                <span className="text-indigo-600 font-bold text-lg">{Math.min(currentPage * itemsPerPage, totalCount)}</span>
                <span className="text-gray-700"> of </span>
                <span className="text-purple-600 font-bold text-lg">{totalCount}</span>
                <span className="text-gray-700"> notifications</span>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    console.log('Previous clicked, current page:', currentPage);
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  disabled={currentPage === 1}
                  className={`px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md ${
                    currentPage === 1
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  ← Previous
                </button>
                
                {/* Page Numbers */}
                <div className="flex gap-2">
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
                          onClick={() => {
                            console.log('Page number clicked:', pageNum);
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`px-4 py-2 rounded-lg transition-all font-bold shadow-md ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-110 ring-2 ring-purple-300'
                              : 'bg-white border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-500 hover:scale-105'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} className="px-2 text-indigo-400 font-bold text-xl">•••</span>;
                    }
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => {
                    console.log('Next clicked, current page:', currentPage, 'total pages:', totalPages);
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  disabled={currentPage >= totalPages}
                  className={`px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md ${
                    currentPage >= totalPages
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  Next →
                </button>
              </div>
            </div>
            
            {/* Debug info - remove after testing */}
            <div className="mt-2 text-xs text-gray-500 text-center">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
