"""
Conversation models for chat functionality.
"""

import datetime
import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.dialects.mysql import CHAR
from ..database import db

class Message(db.Model):
    """Message model for conversations."""
    __tablename__ = 'messages'
    
    id = db.Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = db.Column(CHAR(36), db.ForeignKey('conversations.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'user', 'assistant', or 'system'
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def __repr__(self):
        return f'<Message {self.id[:8]} - {self.role}>'
    
    def to_dict(self):
        """Convert message to dictionary."""
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'role': self.role,
            'content': self.content,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Conversation(db.Model):
    """Conversation model for chat."""
    __tablename__ = 'conversations'
    
    id = db.Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(CHAR(36), db.ForeignKey('users.id'), nullable=True)  # Optional user association
    title = db.Column(db.String(255), nullable=False, default="New Conversation")
    system_message = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    messages = db.relationship('Message', backref='conversation', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Conversation {self.id[:8]} - {self.title}>'
    
    def add_message(self, role: str, content: str) -> Message:
        """Add a message to the conversation."""
        message = Message(
            conversation_id=self.id,
            role=role,
            content=content
        )
        db.session.add(message)
        self.updated_at = datetime.datetime.utcnow()
        return message
    
    def set_system_message(self, content: str) -> None:
        """Set the system message for the conversation."""
        self.system_message = content
        self.updated_at = datetime.datetime.utcnow()
    
    def get_messages(self) -> List[Dict[str, str]]:
        """Get all messages in the conversation."""
        return [{"role": msg.role, "content": msg.content} for msg in self.messages]
    
    def clear_messages(self) -> None:
        """Clear all messages in the conversation."""
        for message in self.messages:
            db.session.delete(message)
        self.updated_at = datetime.datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert the conversation to a dictionary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "messages": [msg.to_dict() for msg in self.messages],
            "system_message": self.system_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }