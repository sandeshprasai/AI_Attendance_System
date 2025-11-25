import React, { useState, useEffect } from 'react';
import { User, Clock, Calendar } from 'lucide-react';

export default function GreetingCard({ user }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="bg-gradient-to-br from-cyan-500 via-teal-500 to-cyan-600 rounded-2xl shadow-xl p-6 text-white">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden">
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.name}
              className="w-full h-full object-cover"
            />
            
          ) : (
            <User className="w-8 h-8 text-white" />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{getGreeting()}!</h2>
          <p className="text-cyan-100 text-sm">{user?.name || 'Guest'}</p>
        </div>
      </div>

      <div className="space-y-3 mt-6">
        <div className="flex items-center gap-3 text-cyan-50">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
        </div>
        <div className="flex items-center gap-3 text-cyan-50">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      {user?.role && (
        <div className="mt-6 pt-4 border-t border-white border-opacity-20">
          <p className="text-sm text-cyan-50">
            Role: <span className="font-semibold text-white">{user.role}</span>
          </p>
        </div>
      )}
    </div>
  );
}