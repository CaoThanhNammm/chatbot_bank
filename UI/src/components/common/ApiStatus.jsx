/**
 * API Status Component
 * Shows current API configuration and allows switching between endpoints
 */

import React, { useState, useEffect } from 'react';
import { API_CONSTANTS } from '../../constants/api';
import { CHAT_CONFIG, getCurrentConfig, CURRENT_ENV } from '../../config/environment';
import apiService from '../../services/ApiService';

const ApiStatus = () => {
  const [currentConfig, setCurrentConfig] = useState(getCurrentConfig());
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [lastTestResult, setLastTestResult] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('testing');

    try {
      const response = await apiService.sendSimpleMessage('test connection');
      
      if (response.success) {
        setConnectionStatus('connected');
        setLastTestResult({
          success: true,
          message: 'Connection successful',
          response: response.data,
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        setConnectionStatus('failed');
        setLastTestResult({
          success: false,
          message: response.error || 'Connection failed',
          timestamp: new Date().toLocaleTimeString()
        });
      }
    } catch (error) {
      setConnectionStatus('failed');
      setLastTestResult({
        success: false,
        message: error.message || 'Connection failed',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'testing': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '✅';
      case 'failed': return '❌';
      case 'testing': return '🔄';
      default: return '❓';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'failed': return 'Connection Failed';
      case 'testing': return 'Testing...';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">API Status</h3>
      
      {/* Current Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Current Configuration</h4>
          <div className="text-sm space-y-1">
            <div><strong>Environment:</strong> {CURRENT_ENV}</div>
            <div><strong>Base URL:</strong> {currentConfig.BASE_URL}</div>
            <div><strong>Chat Endpoint:</strong> {API_CONSTANTS.ENDPOINTS.CHAT.SIMPLE_CHAT}</div>
            <div><strong>Timeout:</strong> {currentConfig.TIMEOUT}ms</div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Connection Status</h4>
          <div className={`inline-flex items-center px-3 py-2 rounded-lg border ${getStatusColor()}`}>
            <span className="mr-2">{getStatusIcon()}</span>
            <span className="font-medium">{getStatusText()}</span>
          </div>
          
          <div className="mt-2">
            <button
              onClick={testConnection}
              disabled={isTestingConnection}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>
      </div>

      {/* Last Test Result */}
      {lastTestResult && (
        <div className="border-t pt-3">
          <h4 className="font-medium text-gray-700 mb-2">Last Test Result</h4>
          <div className={`p-3 rounded-lg ${lastTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-medium ${lastTestResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {lastTestResult.success ? '✅ Success' : '❌ Failed'}
              </span>
              <span className="text-xs text-gray-500">{lastTestResult.timestamp}</span>
            </div>
            <div className={`text-sm ${lastTestResult.success ? 'text-green-700' : 'text-red-700'}`}>
              {lastTestResult.message}
            </div>
            {lastTestResult.response && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer opacity-75">API Response</summary>
                <pre className="text-xs mt-1 p-2 bg-white rounded overflow-x-auto">
                  {JSON.stringify(lastTestResult.response, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}

      {/* API Endpoints Info */}
      <div className="border-t pt-3 mt-3">
        <h4 className="font-medium text-gray-700 mb-2">Available Endpoints</h4>
        <div className="text-xs space-y-1 text-gray-600">
          <div><strong>Simple Chat:</strong> {API_CONSTANTS.ENDPOINTS.CHAT.SIMPLE_CHAT}</div>
          <div><strong>External Chat:</strong> {API_CONSTANTS.ENDPOINTS.CHAT.EXTERNAL_CHAT}</div>
          <div><strong>Conversations:</strong> {currentConfig.BASE_URL}{API_CONSTANTS.ENDPOINTS.CHAT.CONVERSATIONS}</div>
        </div>
      </div>
    </div>
  );
};

export default ApiStatus;