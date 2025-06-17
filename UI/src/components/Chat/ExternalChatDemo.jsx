/**
 * External Chat Demo Component
 * Demonstrates the integration with external chat API (ngrok endpoint)
 */

import React, { useState, useRef, useEffect } from 'react';
import externalChatService from '../../services/ExternalChatService';
import apiService from '../../services/ApiService';

const ExternalChatDemo = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Test connection on component mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      const result = await externalChatService.testConnection();
      setConnectionStatus(result.success ? 'connected' : 'failed');
    } catch (error) {
      setConnectionStatus('failed');
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message to chat
    const newUserMessage = {
      id: Date.now(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Send message to external API
      const response = await externalChatService.sendMessage(userMessage);
      
      if (response.success) {
        // Add bot response to chat
        const botMessage = {
          id: Date.now() + 1,
          text: response.data.response || 'No response received',
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString(),
          apiResponse: response.data
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Add error message
        const errorMessage = {
          id: Date.now() + 1,
          text: `Error: ${response.error}`,
          sender: 'system',
          timestamp: new Date().toLocaleTimeString(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: `Network Error: ${error.message}`,
        sender: 'system',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessageViaApiService = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message to chat
    const newUserMessage = {
      id: Date.now(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      via: 'ApiService'
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Send message via ApiService
      const response = await apiService.sendExternalMessage(userMessage);
      
      if (response.success) {
        // Add bot response to chat
        const botMessage = {
          id: Date.now() + 1,
          text: response.data.response || 'No response received',
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString(),
          via: 'ApiService',
          apiResponse: response.data
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Add error message
        const errorMessage = {
          id: Date.now() + 1,
          text: `Error: ${response.error}`,
          sender: 'system',
          timestamp: new Date().toLocaleTimeString(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: `Network Error: ${error.message}`,
        sender: 'system',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'testing': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'failed': return 'Connection Failed';
      case 'testing': return 'Testing...';
      default: return 'Unknown';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          External Chat API Demo
        </h2>
        <p className="text-gray-600 mb-4">
          Test integration with external chat API: https://9b74-34-55-107-219.ngrok-free.app/api/chat
        </p>
        
        {/* Connection Status */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Connection Status:</span>
            <span className={`text-sm font-semibold ${getConnectionStatusColor()}`}>
              {getConnectionStatusText()}
            </span>
          </div>
          <button
            onClick={testConnection}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Test Connection
          </button>
          <button
            onClick={clearChat}
            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p>No messages yet. Send a message to start chatting!</p>
            <p className="text-sm mt-2">Try sending: "xin chào"</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${
                message.sender === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.sender === 'bot'
                    ? 'bg-white border border-gray-300 text-gray-800'
                    : 'bg-red-100 border border-red-300 text-red-800'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs opacity-75">
                    {message.timestamp}
                  </span>
                  {message.via && (
                    <span className="text-xs opacity-75 ml-2">
                      via {message.via}
                    </span>
                  )}
                </div>
                {message.apiResponse && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer opacity-75">
                      API Response
                    </summary>
                    <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                      {JSON.stringify(message.apiResponse, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here... (Press Enter to send)"
          className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="2"
          disabled={isLoading}
        />
        <div className="flex flex-col gap-2">
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send Direct'}
          </button>
          <button
            onClick={sendMessageViaApiService}
            disabled={isLoading || !inputMessage.trim()}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send via API'}
          </button>
        </div>
      </div>

      {/* API Information */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">API Information:</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Endpoint:</strong> https://9b74-34-55-107-219.ngrok-free.app/api/chat</p>
          <p><strong>Method:</strong> POST</p>
          <p><strong>Request Body:</strong> {"{ \"message\": \"your message\" }"}</p>
          <p><strong>Response:</strong> {"{ \"response\": \"bot response\", \"success\": true }"}</p>
        </div>
      </div>
    </div>
  );
};

export default ExternalChatDemo;