// Chat history utility functions
export const STORAGE_KEY = 'AGRIBANK_chat_history';

/**
 * Generate a title for a conversation based on the first user message
 */
export const generateConversationTitle = (messages) => {
  const firstUserMessage = messages.find(msg => !msg.isBot);
  if (!firstUserMessage) {
    return `Cuộc trò chuyện ${new Date().toLocaleDateString('vi-VN')}`;
  }
  
  let title = firstUserMessage.text;
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }
  
  return title;
};

/**
 * Save a conversation to chat history
 */
export const saveConversationToHistory = (messages) => {
  if (messages.length === 0) return;
  
  try {
    const existingHistory = getChatHistory();
    const conversation = {
      id: Date.now().toString(),
      title: generateConversationTitle(messages),
      messages: messages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedHistory = [conversation, ...existingHistory];
    
    // Keep only the latest 50 conversations to avoid storage bloat
    const limitedHistory = updatedHistory.slice(0, 50);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
    return conversation;
  } catch (error) {
    console.error('Error saving conversation to history:', error);
    return null;
  }
};

/**
 * Get all chat history from localStorage
 */
export const getChatHistory = () => {
  try {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      // Ensure each conversation has required fields and convert timestamps
      return parsed.map(conversation => ({
        id: conversation.id || Date.now().toString(),
        title: conversation.title || 'Cuộc trò chuyện',
        messages: (conversation.messages || []).map(msg => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        })),
        createdAt: conversation.createdAt || new Date().toISOString(),
        updatedAt: conversation.updatedAt || new Date().toISOString()
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading chat history:', error);
    return [];
  }
};

/**
 * Delete a specific conversation from history
 */
export const deleteConversationFromHistory = (conversationId) => {
  try {
    const existingHistory = getChatHistory();
    const updatedHistory = existingHistory.filter(conv => conv.id !== conversationId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    return true;
  } catch (error) {
    console.error('Error deleting conversation from history:', error);
    return false;
  }
};

/**
 * Clear all chat history
 */
export const clearChatHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return false;
  }
};

/**
 * Update an existing conversation in history
 */
export const updateConversationInHistory = (conversationId, updatedMessages) => {
  try {
    const existingHistory = getChatHistory();
    const conversationIndex = existingHistory.findIndex(conv => conv.id === conversationId);
    
    if (conversationIndex !== -1) {
      existingHistory[conversationIndex] = {
        ...existingHistory[conversationIndex],
        messages: updatedMessages,
        title: generateConversationTitle(updatedMessages),
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingHistory));
      return existingHistory[conversationIndex];
    }
    return null;
  } catch (error) {
    console.error('Error updating conversation in history:', error);
    return null;
  }
};

/**
 * Search conversations by query
 */
export const searchChatHistory = (query) => {
  if (!query) return getChatHistory();
  
  const history = getChatHistory();
  const lowerQuery = query.toLowerCase();
  
  return history.filter(conversation =>
    conversation.title.toLowerCase().includes(lowerQuery) ||
    conversation.messages.some(msg => 
      msg.text.toLowerCase().includes(lowerQuery)
    )
  );
};
