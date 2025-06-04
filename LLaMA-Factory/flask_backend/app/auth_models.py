"""
Authentication models for the Flask backend.
"""

import datetime
import uuid
from sqlalchemy.dialects.mysql import CHAR
from .database import db

class User(db.Model):
    """User model for authentication."""
    __tablename__ = 'users'
    
    id = db.Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    conversations = db.relationship('Conversation', backref='user', lazy=True)
    
    def __repr__(self):
        return f'<User {self.username}>'

class PasswordResetToken(db.Model):
    """Password reset token model."""
    __tablename__ = 'password_reset_tokens'
    
    id = db.Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(CHAR(36), db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    
    # Relationship
    user = db.relationship('User', backref=db.backref('reset_tokens', lazy=True))
    
    def __repr__(self):
        return f'<PasswordResetToken {self.token[:10]}...>'