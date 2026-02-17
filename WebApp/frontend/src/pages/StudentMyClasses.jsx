import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, User, TrendingUp, CheckCircle, XCircle, ChevronDown, ChevronUp, Filter, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import apiClient from '../utills/apiClient';
import { formatKathmanduDateTime } from '../utils/timezoneHelper';

export default function StudentMyClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedClass, setExpandedClass] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const classesPerPage = 3;
  
  // Filter and search state
  const [filters, setFilters] = useState({
    semester: 'all',
    status: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/student-dashboard/my-classes-detailed');
      
      if (response.data.success) {
        const classesData = response.data.data;
        console.log('Fetched classes:', classesData);
        console.log('Sample semester value:', classesData[0]?.semester, 'Type:', typeof classesData[0]?.semester);
        setClasses(classesData);
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
    if (status === 'archived') return 'bg-gray-100 text-gray-700';
    return 'bg-gray-100 text-gray-700';
  };

  // Filter and search classes
  const filteredClasses = classes.filter(cls => {
    // Filter by semester - convert both to string for comparison
    if (filters.semester !== 'all') {
      const filterSemester = filters.semester.toString();
      const classSemester = cls.semester?.toString() || '';
      if (filterSemester !== classSemester) return false;
    }
    
    // Filter by status
    if (filters.status !== 'all' && cls.status?.toLowerCase() !== filters.status) return false;
    
    // Search by subject name or teacher name (using debounced query)
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      const subjectMatch = cls.subject?.name?.toLowerCase().includes(query);
      const teacherMatch = cls.teacher?.name?.toLowerCase().includes(query);
      if (!subjectMatch && !teacherMatch) return false;
    }
    
    return true;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredClasses.length / classesPerPage);
  const startIndex = (currentPage - 1) * classesPerPage;
  const endIndex = startIndex + classesPerPage;
  const currentClasses = filteredClasses.slice(startIndex, endIndex);

  // Reset to page 1 when filters or debounced search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, debouncedSearchQuery]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      semester: 'all',
      status: 'all'
    });
    setSearchQuery('');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

        {/* Filters and Search */}
        {classes.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-800">Filter & Search Classes</h2>
            </div>
            
            {/* Search Bar */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Subject or Teacher
                {searchQuery !== debouncedSearchQuery && (
                  <span className="ml-2 text-xs text-purple-600 animate-pulse">Searching...</span>
                )}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for subject name or teacher name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Semester Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                <select
                  value={filters.semester}
                  onChange={(e) => handleFilterChange('semester', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Semesters</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                  <option value="9">Semester 9</option>
                  <option value="10">Semester 10</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Results count and Clear Button */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {currentClasses.length} of {filteredClasses.length} classes
              </div>
              {(filters.semester !== 'all' || filters.status !== 'all' || searchQuery.trim()) && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Classes List */}
        {classes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Classes Enrolled</h2>
            <p className="text-gray-500">You are not enrolled in any classes yet.</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <Filter className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Classes Found</h2>
            <p className="text-gray-500">No classes match your filter criteria.</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {currentClasses.map((cls) => (
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
                        const dateTime = timestamp ? formatKathmanduDateTime(timestamp) : { date: 'N/A', time: 'N/A' };
                        
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-purple-600 hover:bg-purple-50 shadow-md'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-purple-50 shadow-md'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-purple-600 hover:bg-purple-50 shadow-md'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
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
