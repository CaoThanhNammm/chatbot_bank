/**
 * API Settings Page
 * Page for managing API configurations and testing connections
 */

import React, { useState } from 'react';
import { ApiStatus } from '../components/common';
import { ExternalChatDemo } from '../components/Chat';

const ApiSettingsPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">API Settings & Testing</h1>
          <p className="text-gray-600">
            Manage API configurations and test external chat integrations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API Status Panel */}
          <div>
            <ApiStatus />
          </div>

          {/* Quick Test Panel */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick API Test</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Test Messages</h4>
                <div className="grid grid-cols-1 gap-2">
                  <TestButton message="xin chào" label="Vietnamese Greeting" />
                  <TestButton message="Hello" label="English Greeting" />
                  <TestButton message="Tôi muốn biết thông tin về tài khoản" label="Account Info" />
                  <TestButton message="What services do you offer?" label="Services Query" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Chat Demo */}
        <div className="mt-8">
          <ExternalChatDemo />
        </div>
      </div>
    </div>
  );
};

// Test Button Component
const TestButton = ({ message, label }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testMessage = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const apiService = (await import('../services/ApiService')).default;
      const response = await apiService.sendSimpleMessage(message);
      
      setResult({
        success: response.success,
        message: response.success ? response.data.response : response.error,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setResult({
        success: false,
        message: error.message,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-medium text-sm">{label}</div>
          <div className="text-xs text-gray-500">"{message}"</div>
        </div>
        <button
          onClick={testMessage}
          disabled={isLoading}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Testing...' : 'Test'}
        </button>
      </div>
      
      {result && (
        <div className={`text-xs p-2 rounded ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <div className="flex items-center justify-between">
            <span>{result.success ? '✅' : '❌'}</span>
            <span className="opacity-75">{result.timestamp}</span>
          </div>
          <div className="mt-1">{result.message}</div>
        </div>
      )}
    </div>
  );
};

export default ApiSettingsPage;