"""
Conversation service for handling chat conversations.
"""

import uuid
from typing import Dict, List, Optional, Any, Tuple
import threading
from datetime import datetime

from ..database import db
from ..models.conversation import Conversation, Message

class ConversationService:
    """
    Manages chat conversations.
    """
    
    def __init__(self):
        """Initialize the conversation service."""
        self.lock = threading.Lock()
    
    def create_conversation(self, title: str = "New Conversation", user_id: Optional[int] = None) -> Tuple[bool, str, str]:
        """
        Create a new conversation.
        
        Args:
            title: Title of the conversation
            user_id: ID of the user who owns the conversation (optional)
            
        Returns:
            Tuple of (success, message, conversation_id)
        """
        try:
            conversation = Conversation(
                conversation_uuid=str(uuid.uuid4()),
                title=title,
                user_id=user_id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            db.session.add(conversation)
            db.session.commit()
            
            return True, f"Conversation created successfully", conversation.conversation_uuid
        except Exception as e:
            db.session.rollback()
            return False, f"Failed to create conversation: {str(e)}", ""
    
    def get_conversation(self, conversation_id: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Get a conversation by ID.
        
        Args:
            conversation_id: UUID of the conversation
            
        Returns:
            Tuple of (success, message, conversation)
        """
        conversation = Conversation.query.filter_by(conversation_uuid=conversation_id).first()
        
        if not conversation:
            return False, f"Conversation not found: {conversation_id}", None
        
        return True, "Conversation found", conversation.to_dict()
    
    def add_message(self, conversation_id: str, role: str, content: str) -> Tuple[bool, str]:
        """
        Add a message to a conversation.
        
        Args:
            conversation_id: UUID of the conversation
            role: Role of the message sender ('user' or 'assistant')
            content: Content of the message
            
        Returns:
            Tuple of (success, message)
        """
        if role not in ["user", "assistant", "system"]:
            return False, f"Invalid role: {role}"
        
        conversation = Conversation.query.filter_by(conversation_uuid=conversation_id).first()
        
        if not conversation:
            return False, f"Conversation not found: {conversation_id}"
        
        try:
            conversation.add_message(role, content)
            conversation.updated_at = datetime.utcnow()
            db.session.commit()
            return True, "Message added successfully"
        except Exception as e:
            db.session.rollback()
            return False, f"Failed to add message: {str(e)}"
    
    def set_system_message(self, conversation_id: str, content: str) -> Tuple[bool, str]:
        """
        Set the system message for a conversation.
        
        Args:
            conversation_id: UUID of the conversation
            content: Content of the system message
            
        Returns:
            Tuple of (success, message)
        """
        conversation = Conversation.query.filter_by(conversation_uuid=conversation_id).first()
        
        if not conversation:
            return False, f"Conversation not found: {conversation_id}"
        
        try:
            conversation.set_system_message(content)
            db.session.commit()
            return True, "System message set successfully"
        except Exception as e:
            db.session.rollback()
            return False, f"Failed to set system message: {str(e)}"
    
    def get_messages(self, conversation_id: str) -> Tuple[bool, str, Optional[List[Dict[str, str]]]]:
        """
        Get all messages in a conversation.
        
        Args:
            conversation_id: UUID of the conversation
            
        Returns:
            Tuple of (success, message, messages)
        """
        conversation = Conversation.query.filter_by(conversation_uuid=conversation_id).first()
        
        if not conversation:
            return False, f"Conversation not found: {conversation_id}", None
        
        return True, "Messages retrieved successfully", conversation.get_messages()
    
    def clear_conversation(self, conversation_id: str) -> Tuple[bool, str]:
        """
        Clear all messages in a conversation.
        
        Args:
            conversation_id: UUID of the conversation
            
        Returns:
            Tuple of (success, message)
        """
        conversation = Conversation.query.filter_by(conversation_uuid=conversation_id).first()
        
        if not conversation:
            return False, f"Conversation not found: {conversation_id}"
        
        try:
            conversation.clear_messages()
            db.session.commit()
            return True, "Conversation cleared successfully"
        except Exception as e:
            db.session.rollback()
            return False, f"Failed to clear conversation: {str(e)}"
    
    def delete_conversation(self, conversation_id: str) -> Tuple[bool, str]:
        """
        Delete a conversation.
        
        Args:
            conversation_id: UUID of the conversation
            
        Returns:
            Tuple of (success, message)
        """
        conversation = Conversation.query.filter_by(conversation_uuid=conversation_id).first()
        
        if not conversation:
            return False, f"Conversation not found: {conversation_id}"
        
        try:
            db.session.delete(conversation)
            db.session.commit()
            return True, "Conversation deleted successfully"
        except Exception as e:
            db.session.rollback()
            return False, f"Failed to delete conversation: {str(e)}"
    
    def get_all_conversations(self, user_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Get all conversations, optionally filtered by user.
        
        Args:
            user_id: ID of the user to filter by (optional)
            
        Returns:
            List of conversation dictionaries
        """
        if user_id:
            conversations = Conversation.query.filter_by(user_id=user_id).all()
        else:
            conversations = Conversation.query.all()
        
        return [conversation.to_dict() for conversation in conversations]

# Create a singleton instance
conversation_service = ConversationService()