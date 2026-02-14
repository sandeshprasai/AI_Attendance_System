import React, { useState } from 'react';
import { User, Mail, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:9000').replace(/\/$/, '');

/**
 * Reusable Absent Notification Card Component
 * Displays absent student information with actions to notify parents and mark as excused
 */
export default function AbsentNotificationCard({ 
  notification, 
  onNotificationSent, 
  onMarkedExcused,
  showFullDetails = false,
  compact = false,
}) {
  const [loading, setLoading] = useState({ notify: false, excuse: false });
  const [showExcuseModal, setShowExcuseModal] = useState(false);
  const [excuseReason, setExcuseReason] = useState('');
  const [sendConfirmationEmail, setSendConfirmationEmail] = useState(true);
  const [error, setError] = useState(null);

  // Get token from storage
  const getToken = () => {
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  };

  // Handle notify parent
  const handleNotifyParent = async () => {
    try {
      setLoading({ ...loading, notify: true });
      setError(null);

      const token = getToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/absent-notifications/${notification._id}/notify`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        if (onNotificationSent) {
          onNotificationSent(notification._id, response.data.data);
        }
      }
    } catch (err) {
      console.error('Error sending notification:', err);
      setError(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setLoading({ ...loading, notify: false });
    }
  };

  // Handle mark as excused
  const handleMarkExcused = async () => {
    try {
      setLoading({ ...loading, excuse: true });
      setError(null);

      const token = getToken();
      const response = await axios.patch(
        `${API_BASE_URL}/api/v1/absent-notifications/${notification._id}/excuse`,
        {
          reason: excuseReason,
          sendEmail: sendConfirmationEmail,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setShowExcuseModal(false);
        setExcuseReason('');
        if (onMarkedExcused) {
          onMarkedExcused(notification._id, response.data.data);
        }
      }
    } catch (err) {
      console.error('Error marking as excused:', err);
      setError(err.response?.data?.message || 'Failed to mark as excused');
    } finally {
      setLoading({ ...loading, excuse: false });
    }
  };

  // Determine status badge
  const getStatusBadge = () => {
    if (notification.isExcused) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Excused
        </span>
      );
    }
    
    if (notification.notificationSent) {
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full flex items-center gap-1">
          <Mail className="w-3 h-3" />
          Notified
        </span>
      );
    }

    return (
      <span className="px-3 py-1 bg-red-200 text-red-800 text-xs font-semibold rounded-full flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        Pending
      </span>
    );
  };

  // Get student name
  const studentName = notification.student?.FullName || notification.student?.Name || 'Unknown Student';
  const rollNumber = notification.student?.RollNo || notification.student?.RollNumber || 'N/A';
  const className = notification.academicClass?.ClassName || notification.academicClass?.Name || '';
  const section = notification.academicClass?.Section || '';
  const fullClassName = section ? `${className} ${section}` : className;
  const subjectName = notification.attendance?.Subject?.SubjectName || notification.attendance?.Subject?.Name || 'N/A';

  // Compact view for dashboard
  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-red-700" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">
              {studentName}
            </p>
            <p className="text-xs text-gray-600">
              {fullClassName} • Roll: {rollNumber}
            </p>
            {subjectName !== 'N/A' && (
              <p className="text-xs text-gray-500">Subject: {subjectName}</p>
            )}
          </div>
          {getStatusBadge()}
        </div>
        <div className="flex gap-2 ml-2">
          {!notification.notificationSent && (
            <button 
              onClick={handleNotifyParent}
              disabled={loading.notify}
              className="px-3 py-1.5 bg-cyan-600 text-white text-xs font-medium rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send email notification to student"
            >
              {loading.notify ? 'Sending...' : 'Notify Student'}
            </button>
          )}
          {!notification.isExcused && (
            <button 
              onClick={() => setShowExcuseModal(true)}
              disabled={loading.excuse}
              className="px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Mark this absence as excused"
            >
              Excuse
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full detailed view
  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-red-700" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800">
                {studentName}
              </h3>
              <p className="text-sm text-gray-600">
                {fullClassName}
              </p>
              <p className="text-xs text-gray-500">
                Roll Number: {rollNumber}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 mb-1">Date</p>
            <p className="text-sm font-semibold text-gray-800">
              {new Date(notification.date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Subject</p>
            <p className="text-sm font-semibold text-gray-800">
              {subjectName}
            </p>
          </div>
          {notification.notificationSent && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Notified At</p>
              <p className="text-sm font-semibold text-gray-800">
                {new Date(notification.notificationSentAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
          {notification.parentEmail && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Parent Email</p>
              <p className="text-sm font-semibold text-gray-800 truncate">
                {notification.parentEmail}
              </p>
            </div>
          )}
        </div>

        {/* Excused Details */}
        {notification.isExcused && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-800 mb-2">Excused Absence</p>
            {notification.excusedReason && (
              <p className="text-sm text-gray-700 mb-2">
                <strong>Reason:</strong> {notification.excusedReason}
              </p>
            )}
            {notification.excusedAt && (
              <p className="text-xs text-gray-600">
                Excused on {new Date(notification.excusedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {!notification.notificationSent && (
            <button 
              onClick={handleNotifyParent}
              disabled={loading.notify}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              title="Send email notification to student"
            >
              <Mail className="w-4 h-4" />
              {loading.notify ? 'Sending...' : 'Notify Student'}
            </button>
          )}
          
          {!notification.isExcused && (
            <button 
              onClick={() => setShowExcuseModal(true)}
              disabled={loading.excuse}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Excused
            </button>
          )}
        </div>
      </div>

      {/* Excuse Modal */}
      {showExcuseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Mark Absence as Excused</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Excusing (Optional)
              </label>
              <textarea
                value={excuseReason}
                onChange={(e) => setExcuseReason(e.target.value)}
                placeholder="e.g., Technical issue during face recognition, Medical emergency, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                rows="4"
                maxLength="500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {excuseReason.length}/500 characters
              </p>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendConfirmationEmail}
                  onChange={(e) => setSendConfirmationEmail(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                />
                <span className="text-sm text-gray-700">
                  Send confirmation email to parent
                </span>
              </label>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowExcuseModal(false);
                  setExcuseReason('');
                  setError(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkExcused}
                disabled={loading.excuse}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading.excuse ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
