import { useState, useEffect } from "react";
import { Activity, Database, Cpu, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import axios from "axios";
import API from "../../../utills/api";

export default function SystemStatusCard() {
  const FLASK_API_URL = "http://localhost:5001";
  
  const [status, setStatus] = useState({
    database: { connected: false, checking: true },
    aiServer: { online: false, checking: true },
  });

  useEffect(() => {
    checkSystemStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = async () => {
    // Check Database
    checkDatabase();
    
    // Check AI Server
    checkAIServer();
  };

  const checkDatabase = async () => {
    try {
      const response = await API.get("/admin/system-status");
      setStatus((prev) => ({
        ...prev,
        database: {
          connected: response.data.data.database.connected,
          checking: false,
        },
      }));
    } catch (error) {
      console.error("Failed to check database status:", error);
      setStatus((prev) => ({
        ...prev,
        database: {
          connected: false,
          checking: false,
        },
      }));
    }
  };

  const checkAIServer = async () => {
    try {
      // Try to ping Flask server with a simple health check
      await axios.get(`${FLASK_API_URL}/health`, {
        timeout: 3000, // 3 second timeout
      });
      setStatus((prev) => ({
        ...prev,
        aiServer: {
          online: true,
          checking: false,
        },
      }));
    } catch (error) {
      // Server is offline or unreachable
      setStatus((prev) => ({
        ...prev,
        aiServer: {
          online: false,
          checking: false,
        },
      }));
    }
  };

  const getStatusIcon = (isConnected, isChecking) => {
    if (isChecking) {
      return <AlertCircle className="w-5 h-5 text-yellow-500 animate-pulse" />;
    }
    return isConnected ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusBadge = (isConnected, isChecking) => {
    if (isChecking) {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full animate-pulse">
          CHECKING...
        </span>
      );
    }
    return isConnected ? (
      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
        ONLINE
      </span>
    ) : (
      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
        OFFLINE
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-600" />
          System Status
        </h3>
        <button
          onClick={checkSystemStatus}
          className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {/* Database Status */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Database</p>
              <p className="text-xs text-gray-600">MongoDB Connection</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status.database.connected, status.database.checking)}
            {getStatusBadge(status.database.connected, status.database.checking)}
          </div>
        </div>

        {/* AI Server Status */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Cpu className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                AI Recognition Server
              </p>
              <p className="text-xs text-gray-600">Flask API (Port 5001)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status.aiServer.online, status.aiServer.checking)}
            {getStatusBadge(status.aiServer.online, status.aiServer.checking)}
          </div>
        </div>
      </div>

      {/* Warning Messages */}
      {!status.database.checking && !status.database.connected && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700 font-medium">
            ⚠️ Database connection lost. Please check MongoDB server.
          </p>
        </div>
      )}

      {!status.aiServer.checking && !status.aiServer.online && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-xs text-orange-700 font-medium">
            ⚠️ AI Server offline. Face recognition features unavailable. Start
            Flask server on port 5001.
          </p>
        </div>
      )}

      {/* All Systems Operational */}
      {!status.database.checking &&
        !status.aiServer.checking &&
        status.database.connected &&
        status.aiServer.online && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-700 font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              All systems operational
            </p>
          </div>
        )}
    </div>
  );
}
