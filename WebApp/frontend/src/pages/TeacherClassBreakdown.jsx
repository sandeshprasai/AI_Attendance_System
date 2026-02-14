import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, Filter, ChevronLeft, ChevronRight, Loader2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:9000').replace(/\/$/, '');

export default function TeacherClassBreakdown() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClasses, setTotalClasses] = useState(0);
  const itemsPerPage = 10;
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('all'); // all, high, medium, low
  const [sortBy, setSortBy] = useState('attendanceRate'); // attendanceRate, className, present
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Today's date in YYYY-MM-DD

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data
  useEffect(() => {
    fetchClassBreakdown();
  }, [currentPage, debouncedSearch, attendanceFilter, sortBy, selectedDate]);

  const fetchClassBreakdown = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      const response = await axios.get(`${API_BASE_URL}/api/v1/attendance-analytics/teacher/class-breakdown`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch,
          filter: attendanceFilter,
          sortBy: sortBy,
          date: selectedDate
        }
      });

      if (response.data.success) {
        setClasses(response.data.data.classes);
        setTotalPages(response.data.data.totalPages);
        setTotalClasses(response.data.data.totalClasses);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (rate) => {
    const numRate = parseFloat(rate);
    if (numRate >= 75) return 'text-green-600 bg-green-50 border-green-200';
    if (numRate >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getAttendanceBadge = (rate) => {
    const numRate = parseFloat(rate);
    if (numRate >= 75) return 'bg-green-100 text-green-700';
    if (numRate >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      
      <main className="flex-1 container mx-auto px-6 py-8 max-w-7xl mt-20">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800">All Attendance Records</h1>
          <p className="text-gray-600 mt-1">
            Viewing all attendance sessions for {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Quick Date Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => {
              setSelectedDate(new Date().toISOString().split('T')[0]);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedDate === new Date().toISOString().split('T')[0]
                ? 'bg-cyan-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              setSelectedDate(yesterday.toISOString().split('T')[0]);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]
                ? 'bg-cyan-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Yesterday
          </button>
          <button
            onClick={() => {
              const lastWeek = new Date();
              lastWeek.setDate(lastWeek.getDate() - 7);
              setSelectedDate(lastWeek.toISOString().split('T')[0]);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Last Week
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Records
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by subject, class, session ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Attendance Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Rate
              </label>
              <select
                value={attendanceFilter}
                onChange={(e) => {
                  setAttendanceFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="all">All Records</option>
                <option value="high">High (≥75%)</option>
                <option value="medium">Medium (50-74%)</option>
                <option value="low">Low (&lt;50%)</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="attendanceRate">Attendance Rate</option>
                <option value="className">Subject/Class Name</option>
                <option value="present">Present Count</option>
                <option value="absent">Absent Count</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchClassBreakdown}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No attendance sessions found matching your criteria</p>
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="mb-4 text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalClasses)} of {totalClasses} attendance sessions
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {classes.map((cls, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-2 ${getAttendanceColor(cls.attendanceRate)}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {cls.subjectName} {cls.subjectCode && `(${cls.subjectCode})`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {cls.className} • {cls.semester && `Semester ${cls.semester}`}
                      </p>
                      {cls.time && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(cls.time).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getAttendanceBadge(cls.attendanceRate)}`}>
                      {cls.attendanceRate}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{cls.present}</p>
                      <p className="text-xs text-gray-600 mt-1">Present</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{cls.absent}</p>
                      <p className="text-xs text-gray-600 mt-1">Absent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-700">{cls.total}</p>
                      <p className="text-xs text-gray-600 mt-1">Total</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600 text-center">
                      Session ID: {cls.sessionId}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === i + 1
                          ? 'bg-cyan-600 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
