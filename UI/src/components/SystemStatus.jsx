import React, { useState, useEffect } from 'react';
import { systemApi } from '../utils/api';

/**
 * SystemStatus component displays the current status of the backend system
 * including API connectivity, model status, and other system health metrics
 */
const SystemStatus = () => {
  const [status, setStatus] = useState({
    isLoading: true,
    apiConnected: false,
    modelLoaded: false,
    databaseConnected: false,
    lastChecked: null,
    services: [],
    error: null
  });

  // Fetch system status on component mount and every 60 seconds
  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        setStatus(prev => ({ ...prev, isLoading: true }));
        
        // Get system status from API
        const response = await systemApi.getStatus();
        
        if (response.success) {
          setStatus({
            isLoading: false,
            apiConnected: true,
            modelLoaded: response.data.modelLoaded || false,
            databaseConnected: response.data.databaseConnected || false,
            lastChecked: new Date(),
            services: response.data.services || [],
            error: null
          });
        } else {
          throw new Error(response.error || 'Failed to fetch system status');
        }
      } catch (error) {
        console.error('Error fetching system status:', error);
        setStatus({
          isLoading: false,
          apiConnected: false,
          modelLoaded: false,
          databaseConnected: false,
          lastChecked: new Date(),
          services: [],
          error: error.message || 'Failed to connect to system API'
        });
      }
    };

    // Fetch status immediately
    fetchSystemStatus();
    
    // Set up interval to fetch status every 60 seconds
    const intervalId = setInterval(fetchSystemStatus, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Render status indicator with appropriate color
  const StatusIndicator = ({ isActive, label }) => (
    <div className="flex items-center mb-2">
      <div className={`w-3 h-3 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span className="text-sm">{label}: {isActive ? 'Online' : 'Offline'}</span>
    </div>
  );

  return (
    <div className="max-w-xs p-4 bg-white rounded-lg shadow">
      <h3 className="mb-3 text-lg font-medium">System Status</h3>
      
      {status.isLoading ? (
        <div className="flex items-center justify-center h-20">
          <div className="w-6 h-6 border-b-2 rounded-full animate-spin border-primary"></div>
        </div>
      ) : status.error ? (
        <div className="mb-2 text-sm text-red-500">
          {status.error}
        </div>
      ) : (
        <>
          <StatusIndicator isActive={status.apiConnected} label="API Server" />
          <StatusIndicator isActive={status.modelLoaded} label="AI Model" />
          <StatusIndicator isActive={status.databaseConnected} label="Database" />
          
          {status.services.length > 0 && (
            <div className="mt-3">
              <h4 className="mb-1 text-sm font-medium">Services</h4>
              {status.services.map((service, index) => (
                <StatusIndicator 
                  key={index}
                  isActive={service.status === 'online'} 
                  label={service.name}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {status.lastChecked && (
        <div className="mt-2 text-xs text-gray-500">
          Last checked: {status.lastChecked.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default SystemStatus;