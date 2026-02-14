import React, { useState, useEffect } from 'react';
import { UserPlus, Users, BookOpen, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:9000').replace(/\/$/, '');

const getActivityIcon = (activityType) => {
  const icons = {
    STUDENT_ADDED: <UserPlus className="w-5 h-5 text-white" />,
    STUDENT_UPDATED: <UserPlus className="w-5 h-5 text-white" />,
    TEACHER_ADDED: <Users className="w-5 h-5 text-white" />,
    TEACHER_UPDATED: <Users className="w-5 h-5 text-white" />,
    CLASSROOM_CREATED: <BookOpen className="w-5 h-5 text-white" />,
    CLASSROOM_UPDATED: <BookOpen className="w-5 h-5 text-white" />,
    ATTENDANCE_MARKED: <Clock className="w-5 h-5 text-white" />,
    default: <TrendingUp className="w-5 h-5 text-white" />
  };
  
  return icons[activityType] || icons.default;
};

const getActivityColor = (activityType) => {
  const colors = {
    STUDENT_ADDED: 'bg-blue-500',
    STUDENT_UPDATED: 'bg-cyan-500',
    TEACHER_ADDED: 'bg-green-500',
    TEACHER_UPDATED: 'bg-emerald-500',
    CLASSROOM_CREATED: 'bg-purple-500',
    CLASSROOM_UPDATED: 'bg-violet-500',
    ATTENDANCE_MARKED: 'bg-orange-500',
    default: 'bg-gray-500'
  };
  
  return colors[activityType] || colors.default;
};

const getActivityBgColor = (activityType) => {
  const colors = {
    STUDENT_ADDED: 'bg-blue-50 hover:bg-blue-100',
    STUDENT_UPDATED: 'bg-cyan-50 hover:bg-cyan-100',
    TEACHER_ADDED: 'bg-green-50 hover:bg-green-100',
    TEACHER_UPDATED: 'bg-emerald-50 hover:bg-emerald-100',
    CLASSROOM_CREATED: 'bg-purple-50 hover:bg-purple-100',
    CLASSROOM_UPDATED: 'bg-violet-50 hover:bg-violet-100',
    ATTENDANCE_MARKED: 'bg-orange-50 hover:bg-orange-100',
    default: 'bg-gray-50 hover:bg-gray-100'
  };
  
  return colors[activityType] || colors.default;
};

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - activityTime) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

export default function RecentActivityCard({ activities: propActivities = [], loading: propLoading = false }) {
  const navigate = useNavigate();
  const [activities, setActivities] = useState(propActivities);
  const [loading, setLoading] = useState(propLoading);

  useEffect(() => {
    // Only fetch if no activities provided via props
    if (propActivities.length === 0) {
      fetchActivities();
      
      // Set up polling every 30 seconds to refresh activities
      const pollInterval = setInterval(() => {
        fetchActivities();
      }, 30000); // Poll every 30 seconds
      
      return () => clearInterval(pollInterval);
    } else {
      setActivities(propActivities);
      setLoading(propLoading);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      if (!token) {
        // User not logged in - silently fail without console warning
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/v1/activities/recent`, {
        params: { limit: 3 },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setActivities(response.data.data);
      }
    } catch (error) {
      // Silently fail - will show "No recent activity" message
      // This prevents UI from breaking if backend is down or user is unauthorized
      if (error.response?.status !== 401) {
        console.error('Error fetching activities:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Default mock activities if none provided (only for display purposes)
  const defaultActivities = [
    {
      _id: '1',
      activityType: 'STUDENT_ADDED',
      description: 'New student added: John Doe',
      metadata: { studentId: 'STU2025001' },
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      _id: '2',
      activityType: 'TEACHER_ADDED',
      description: 'Teacher assigned to classroom',
      metadata: { teacher: 'Prof. Sarah Johnson', room: 'Room 301' },
      timestamp: new Date(Date.now() - 12 * 60 * 1000)
    },
    {
      _id: '3',
      activityType: 'CLASSROOM_CREATED',
      description: 'New classroom created: Room 405',
      metadata: { capacity: '30 students' },
      timestamp: new Date(Date.now() - 25 * 60 * 1000)
    }
  ];

  const displayActivities = activities.length > 0 ? activities : [];

  const handleViewAll = () => {
    navigate('/admin/recent-activity');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
        <button 
          onClick={handleViewAll}
          className="text-cyan-600 hover:text-cyan-700 text-sm font-medium flex items-center gap-1 transition-colors"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        {displayActivities.slice(0, 3).map((activity) => (
          <div 
            key={activity._id} 
            className={`flex items-start gap-4 p-4 ${getActivityBgColor(activity.activityType)} rounded-lg transition-colors cursor-pointer`}
          >
            <div className={`w-10 h-10 ${getActivityColor(activity.activityType)} rounded-full flex items-center justify-center flex-shrink-0`}>
              {getActivityIcon(activity.activityType)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{activity.description}</p>
              <p className="text-xs text-gray-600">
                {activity.metadata?.studentId && `Student ID: ${activity.metadata.studentId} • `}
                {activity.metadata?.teacher && `${activity.metadata.teacher} → ${activity.metadata.room} • `}
                {activity.metadata?.capacity && `${activity.metadata.capacity} • `}
                {formatTimeAgo(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {displayActivities.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No recent activity</p>
          <p className="text-sm text-gray-500">Activity will appear here</p>
        </div>
      )}
    </div>
  );
}
