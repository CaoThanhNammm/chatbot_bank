"""
Conversation manager for handling chat conversations.
"""

import uuid
from typing import Dict, List, Optional, Any, Tuple
import threading
from datetime import datetime

class Conversation:
    """Represents a chat conversation."""
    
    def __init__(self, conversation_id: str, title: str = "New Conversation"):
        """Initialize a conversation."""
        self.conversation_id = conversation_id
        self.title = title
        self.messages: List[Dict[str, str]] = []
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
        self.system_message: Optional[str] = None
    
    def add_message(self, role: str, content: str) -> None:
        """Add a message to the conversation."""
        self.messages.append({"role": role, "content": content})
        self.updated_at = datetime.now()
    
    def set_system_message(self, content: str) -> None:
        """Set the system message for the conversation."""
        self.system_message = content
        self.updated_at = datetime.now()
    
    def get_messages(self) -> List[Dict[str, str]]:
        """Get all messages in the conversation."""
        return self.messages
    
    def clear_messages(self) -> None:
        """Clear all messages in the conversation."""
        self.messages = []
        self.updated_at = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert the conversation to a dictionary."""
        return {
            "conversation_id": self.conversation_id,
            "title": self.title,
            "messages": self.messages,
            "system_message": self.system_message,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

class ConversationManager:
    """
    Manages chat conversations.
    """
    
    def __init__(self):
        """Initialize the conversation manager."""
        self.conversations: Dict[str, Conversation] = {}
        self.lock = threading.Lock()
    
    def create_conversation(self, title: str = "New Conversation") -> Tuple[bool, str, str]:
        """
        Create a new conversation.
        
        Args:
            title: Title of the conversation
            
        Returns:
            Tuple of (success, message, conversation_id)
        """
        with self.lock:
            conversation_id = str(uuid.uuid4())
            self.conversations[conversation_id] = Conversation(conversation_id, title)
            return True, f"Conversation created successfully: {conversation_id}", conversation_id
    
    def get_conversation(self, conversation_id: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Get a conversation by ID.
        
        Args:
            conversation_id: ID of the conversation
            
        Returns:
            Tuple of (success, message, conversation)
        """
        with self.lock:
            if conversation_id not in self.conversations:
                return False, f"Conversation not found: {conversation_id}", None
            
            return True, "Conversation found", self.conversations[conversation_id].to_dict()
    
    def add_message(self, conversation_id: str, role: str, content: str) -> Tuple[bool, str]:
        """
        Add a message to a conversation.
        
        Args:
            conversation_id: ID of the conversation
            role: Role of the message sender ('user' or 'assistant')
            content: Content of the message
            
        Returns:
            Tuple of (success, message)
        """
        with self.lock:
            if conversation_id not in self.conversations:
                return False, f"Conversation not found: {conversation_id}"
            
            if role not in ["user", "assistant"]:
                return False, f"Invalid role: {role}"
            
            self.conversations[conversation_id].add_message(role, content)
            return True, "Message added successfully"
    
    def set_system_message(self, conversation_id: str, content: str) -> Tuple[bool, str]:
        """
        Set the system message for a conversation.
        
        Args:
            conversation_id: ID of the conversation
            content: Content of the system message
            
        Returns:
            Tuple of (success, message)
        """
        with self.lock:
            if conversation_id not in self.conversations:
                return False, f"Conversation not found: {conversation_id}"
            
            self.conversations[conversation_id].set_system_message(content)
            return True, "System message set successfully"
    
    def get_messages(self, conversation_id: str) -> Tuple[bool, str, Optional[List[Dict[str, str]]]]:
        """
        Get all messages in a conversation.
        
        Args:
            conversation_id: ID of the conversation
            
        Returns:
            Tuple of (success, message, messages)
        """
        with self.lock:
            if conversation_id not in self.conversations:
                return False, f"Conversation not found: {conversation_id}", None
            
            return True, "Messages retrieved successfully", self.conversations[conversation_id].get_messages()
    
    def clear_conversation(self, conversation_id: str) -> Tuple[bool, str]:
        """
        Clear all messages in a conversation.
        
        Args:
            conversation_id: ID of the conversation
            
        Returns:
            Tuple of (success, message)
        """
        with self.lock:
            if conversation_id not in self.conversations:
                return False, f"Conversation not found: {conversation_id}"
            
            self.conversations[conversation_id].clear_messages()
            return True, "Conversation cleared successfully"
    
    def delete_conversation(self, conversation_id: str) -> Tuple[bool, str]:
        """
        Delete a conversation.
        
        Args:
            conversation_id: ID of the conversation
            
        Returns:
            Tuple of (success, message)
        """
        with self.lock:
            if conversation_id not in self.conversations:
                return False, f"Conversation not found: {conversation_id}"
            
            del self.conversations[conversation_id]
            return True, "Conversation deleted successfully"
    
    def get_all_conversations(self) -> List[Dict[str, Any]]:
        """
        Get all conversations.
        
        Returns:
            List of conversation dictionaries
        """
        with self.lock:
            return [conversation.to_dict() for conversation in self.conversations.values()]

# Create a singleton instance
conversation_manager = ConversationManager()