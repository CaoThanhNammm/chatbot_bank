import React, { useState, useEffect } from 'react';
import { chatApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components';

const ConversationsDebugPage = () => {
  const { user, authenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  const loadConversations = async () => {
    if (!authenticated || !user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      console.log('Loading conversations for user:', user.id);
      const response = await chatApi.getConversations(user.id);
      
      console.log('API Response:', response);
      setApiResponse(response);

      if (response.success) {
        let conversations = [];
        if (response.data && response.data.conversations && Array.isArray(response.data.conversations)) {
          conversations = response.data.conversations;
        } else if (response.data && Array.isArray(response.data)) {
          conversations = response.data;
        }
        
        console.log('Extracted conversations:', conversations);
        setConversations(conversations);
      } else {
        setError(response.error || 'Failed to load conversations');
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPI = async () => {
    if (!authenticated || !user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      const token = localStorage.getItem('token');
      const url = `https://21f2-171-247-78-59.ngrok-free.app/api/conversations?user_id=${user.id}`;
      
      console.log('Testing direct API call:', { url, token: token ? 'Present' : 'Missing' });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      const responseText = await response.text();
      console.log('Direct API response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        setError(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
        return;
      }

      console.log('Direct API parsed data:', data);
      setApiResponse({
        success: response.ok,
        data: data,
        status: response.status,
        statusText: response.statusText
      });

      if (response.ok && data.success && data.conversations) {
        setConversations(data.conversations);
      } else {
        setError(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Direct API test error:', err);
      setError(err.message || 'Failed to test direct API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated && user) {
      loadConversations();
    }
  }, [authenticated, user]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Conversations Debug</h1>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            Please login to test conversations API
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Conversations API Debug</h1>
        
        <div className="mb-4 space-x-2">
          <Button onClick={loadConversations} disabled={loading}>
            {loading ? 'Loading...' : 'Test via API Service'}
          </Button>
          <Button onClick={testDirectAPI} disabled={loading} variant="outline">
            {loading ? 'Loading...' : 'Test Direct API'}
          </Button>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">User Info</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {/* API Response */}
        {apiResponse && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Raw API Response</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
            Loading conversations...
          </div>
        )}

        {/* Conversations List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Conversations ({conversations.length})
          </h2>
          
          {conversations.length > 0 ? (
            <div className="space-y-4">
              {conversations.map((conversation, index) => (
                <div key={conversation.id || index} className="border border-gray-200 rounded p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>ID:</strong> {conversation.id}
                    </div>
                    <div>
                      <strong>User ID:</strong> {conversation.user_id}
                    </div>
                    <div className="col-span-2">
                      <strong>Title:</strong> {conversation.title}
                    </div>
                    <div>
                      <strong>Created:</strong> {conversation.created_at}
                    </div>
                    <div>
                      <strong>Updated:</strong> {conversation.updated_at}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              No conversations found
            </div>
          )}
        </div>

        {/* API Endpoint Info */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-2">API Endpoint Info</h2>
          <div className="text-sm space-y-2">
            <div><strong>Endpoint:</strong> GET /conversations</div>
            <div><strong>Query Parameter:</strong> user_id={user?.id}</div>
            <div><strong>Expected Response Format:</strong></div>
            <pre className="bg-gray-100 p-4 rounded text-xs mt-2">
{`{
  "success": true,
  "conversations": [
    {
      "id": "string",
      "title": "string", 
      "user_id": "string",
      "created_at": "string (datetime)",
      "updated_at": "string (datetime)"
    }
  ]
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationsDebugPage;