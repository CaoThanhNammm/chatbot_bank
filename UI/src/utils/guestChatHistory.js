// Guest Chat History utility functions
export const GUEST_CONVERSATIONS_KEY = 'AGRIBANK_guest_conversations';
export const GUEST_CURRENT_CONVERSATION_KEY = 'AGRIBANK_guest_current_conversation';

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
 * Save current conversation to guest history
 */
export const saveCurrentConversation = (messages, sessionId) => {
  if (messages.length <= 1) return null; // Don't save if only welcome message exists
  
  try {
    const conversation = {
      id: sessionId || `guest-${Date.now()}`,
      title: generateConversationTitle(messages),
      messages: messages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save current conversation
    localStorage.setItem(GUEST_CURRENT_CONVERSATION_KEY, JSON.stringify(conversation));
    
    // Update conversations list
    const existingConversations = getGuestConversations();
    const existingIndex = existingConversations.findIndex(conv => conv.id === conversation.id);
    
    if (existingIndex !== -1) {
      // Update existing conversation
      existingConversations[existingIndex] = conversation;
    } else {
      // Add new conversation
      existingConversations.unshift(conversation);
    }
    
    // Keep only the latest 10 conversations for guest mode
    const limitedConversations = existingConversations.slice(0, 10);
    localStorage.setItem(GUEST_CONVERSATIONS_KEY, JSON.stringify(limitedConversations));
    
    return conversation;
  } catch (error) {
    console.error('Error saving guest conversation:', error);
    return null;
  }
};

/**
 * Get all guest conversations
 */
export const getGuestConversations = () => {
  try {
    const savedConversations = localStorage.getItem(GUEST_CONVERSATIONS_KEY);
    if (savedConversations) {
      return JSON.parse(savedConversations);
    }
    return [];
  } catch (error) {
    console.error('Error loading guest conversations:', error);
    return [];
  }
};

/**
 * Get a specific conversation by ID
 */
export const getGuestConversation = (conversationId) => {
  try {
    const conversations = getGuestConversations();
    return conversations.find(conv => conv.id === conversationId) || null;
  } catch (error) {
    console.error('Error getting guest conversation:', error);
    return null;
  }
};

/**
 * Get current conversation
 */
export const getCurrentConversation = () => {
  try {
    const currentConversation = localStorage.getItem(GUEST_CURRENT_CONVERSATION_KEY);
    if (currentConversation) {
      return JSON.parse(currentConversation);
    }
    return null;
  } catch (error) {
    console.error('Error loading current guest conversation:', error);
    return null;
  }
};

/**
 * Clear all guest conversations
 */
export const clearGuestConversations = () => {
  try {
    localStorage.removeItem(GUEST_CONVERSATIONS_KEY);
    localStorage.removeItem(GUEST_CURRENT_CONVERSATION_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing guest conversations:', error);
    return false;
  }
};