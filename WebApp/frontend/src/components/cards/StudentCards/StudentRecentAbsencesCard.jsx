import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { formatKathmanduDateTime } from '../../../utils/timezoneHelper';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:9000').replace(/\/$/, '');

export default function StudentRecentAbsencesCard() {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAbsences();
  }, []);

  const fetchAbsences = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      const response = await axios.get(`${API_BASE_URL}/api/v1/student-dashboard/recent-absences?limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setAbsences(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching recent absences:', err);
      setError(err.response?.data?.message || 'Failed to load absences');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">My Recent Absences</h2>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-800">My Recent Absences</h2>
          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
            {absences.length}
          </span>
        </div>
      </div>
      
      {absences.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">No recent absences!</p>
          <p className="text-sm text-gray-500">Great job maintaining attendance 🎉</p>
        </div>
      ) : (
        <div className="space-y-4">
          {absences.map((absence, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg p-4 border-l-4 border-red-500 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="bg-red-100 p-2 rounded-full mt-1">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {absence.subject}
                      {absence.subjectCode && ` (${absence.subjectCode})`}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">
                      {absence.teacher} • {absence.className}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{formatKathmanduDateTime(absence.date).date}</span>
                    </div>
                  </div>
                </div>
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                  Absent
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
