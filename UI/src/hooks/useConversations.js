import { useState, useEffect, useCallback } from 'react';
import { chatApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await chatApi.getConversations(user.id);
      console.log('Conversations API response:', response);
      
      if (response.success) {
        // Handle different response structures
        let conversations = [];
        if (response.data && response.data.conversations && Array.isArray(response.data.conversations)) {
          conversations = response.data.conversations;
        } else if (response.data && Array.isArray(response.data)) {
          conversations = response.data;
        }
        
        console.log('Loaded conversations:', conversations);
        setConversations(conversations);
      } else {
        console.error('Failed to load conversations:', response.error);
        setError('Failed to load conversations');
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create new conversation
  const createConversation = useCallback(async (title = "New Conversation") => {
    if (!user) return null;
    
    try {
      const response = await chatApi.createConversation(title, user.id);
      if (response.success && response.data.conversation_id) {
        // Create the conversation object for immediate use
        const newConversation = {
          id: response.data.conversation_id,
          title: title,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: user.id
        };
        
        // Add to local state immediately for better UX - place at the beginning of the list
        setConversations(prev => {
          // Check if conversation already exists to avoid duplicates
          const exists = prev.some(conv => conv.id === newConversation.id);
          if (exists) {
            return prev;
          }
          return [newConversation, ...prev];
        });
        
        // Reload conversations to get the updated list from server with proper data
        setTimeout(() => {
          loadConversations();
        }, 200);
        
        return newConversation;
      } else {
        setError('Failed to create conversation');
        return null;
      }
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError('Failed to create conversation');
      return null;
    }
  }, [user, loadConversations]);

  // Load conversation messages
  const loadConversationMessages = useCallback(async (conversationId) => {
    if (!conversationId) {
      console.warn('No conversationId provided to loadConversationMessages');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading messages for conversation:', conversationId);
      const response = await chatApi.getConversationMessages(conversationId);
      console.log('Messages response:', response);
      
      if (response.success) {
        console.log('API response data:', response.data);
        
        // Handle different response structures
        let messages = [];
        if (response.data && response.data.messages && Array.isArray(response.data.messages)) {
          messages = response.data.messages;
        } else if (response.data && Array.isArray(response.data)) {
          messages = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          messages = response.data.data;
        }
        
        console.log('Extracted messages array:', messages);
        
        if (messages.length > 0) {
          // Transform API messages to UI format and sort by timestamp
          const transformedMessages = messages
            .map((msg, index) => {
              const transformedMsg = {
                id: msg.id || `msg-${conversationId}-${index}-${Date.now()}`, // Ensure unique ID
                text: msg.content || msg.message || msg.text || '', // Try multiple field names
                isBot: msg.role === 'assistant' || msg.role === 'bot' || msg.sender === 'bot',
                timestamp: new Date(msg.created_at || msg.timestamp || msg.time || Date.now())
              };
              console.log('Transformed message:', transformedMsg);
              return transformedMsg;
            })
            .filter(msg => msg.text.trim() !== '') // Filter out empty messages
            .sort((a, b) => a.timestamp - b.timestamp); // Sort chronologically
          
          console.log('Final transformed messages:', transformedMessages);
          setCurrentMessages(transformedMessages);
        } else {
          console.log('No messages found in conversation');
          setCurrentMessages([]); // Set empty array for conversations without messages
        }
      } else {
        console.warn('API request failed:', response);
        setCurrentMessages([]); // Set empty array on API failure
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setCurrentMessages([]); // Set empty array on error
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  // Select conversation
  const selectConversation = useCallback(async (conversation) => {
    try {
      console.log('Selecting conversation:', conversation);
      
      // Set conversation first
      setCurrentConversation(conversation);
      
      // Clear current messages to show loading state
      setCurrentMessages([]);
      setError(null);
      
      // Add a small delay to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Load messages for the selected conversation
      await loadConversationMessages(conversation.id);
      
      console.log('Conversation selected and messages loaded');
    } catch (error) {
      console.error('Error in selectConversation:', error);
      setError('Failed to select conversation');
      setCurrentMessages([]); // Ensure messages are cleared on error
    }
  }, [loadConversationMessages]);

  // Add message to conversation
  const addMessageToConversation = useCallback(async (conversationId, role, content) => {
    try {
      const response = await chatApi.addMessageToConversation(conversationId, role, content);
      if (response.success) {
        // Update the conversation's updated_at timestamp in local state
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, updated_at: new Date().toISOString() }
            : conv
        ));
        
        // Don't reload messages here as they are managed optimistically in the UI
        return true;
      } else {
        setError('Failed to add message');
        return false;
      }
    } catch (err) {
      console.error('Error adding message:', err);
      setError('Failed to add message');
      return false;
    }
  }, []);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId) => {
    try {
      const response = await chatApi.deleteConversation(conversationId);
      if (response.success) {
        // Remove from local state
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        
        // If this was the current conversation, clear it
        if (currentConversation && currentConversation.id === conversationId) {
          setCurrentConversation(null);
          setCurrentMessages([]);
        }
        
        return true;
      } else {
        setError('Failed to delete conversation');
        return false;
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError('Failed to delete conversation');
      return false;
    }
  }, [currentConversation]);

  // Clear conversation messages
  const clearConversation = useCallback(async (conversationId) => {
    try {
      const response = await chatApi.clearConversation(conversationId);
      if (response.success) {
        // If this is the current conversation, clear messages
        if (currentConversation && currentConversation.id === conversationId) {
          setCurrentMessages([]);
        }
        return true;
      } else {
        setError('Failed to clear conversation');
        return false;
      }
    } catch (err) {
      console.error('Error clearing conversation:', err);
      setError('Failed to clear conversation');
      return false;
    }
  }, [currentConversation]);

  // Start new conversation
  const startNewConversation = useCallback(() => {
    setCurrentConversation(null);
    setCurrentMessages([]);
  }, []);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  return {
    conversations,
    currentConversation,
    currentMessages,
    loading,
    error,
    loadConversations,
    createConversation,
    selectConversation,
    addMessageToConversation,
    deleteConversation,
    clearConversation,
    startNewConversation,
    setCurrentMessages, // For optimistic updates
    setCurrentConversation // For direct conversation setting
  };
};