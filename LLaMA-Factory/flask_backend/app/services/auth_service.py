"""
Authentication service for handling user authentication operations.
"""

import os
import jwt
import datetime
import secrets
import string
from typing import Dict, Tuple, Optional, Any
from werkzeug.security import generate_password_hash, check_password_hash
from flask import current_app

from ..database import db
from ..models.user import User, PasswordResetToken

class AuthService:
    """
    Manages user authentication operations including login, register, 
    change password, and forgot password functionality.
    """
    
    def __init__(self):
        """Initialize the authentication service."""
        self.token_expiration = datetime.timedelta(days=1)  # Default token expiration
    
    def register(self, username: str, email: str, password: str, 
                first_name: Optional[str] = None, last_name: Optional[str] = None) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Register a new user.
        
        Args:
            username: Username for the new user
            email: Email address for the new user
            password: Password for the new user
            first_name: First name of the user (optional)
            last_name: Last name of the user (optional)
            
        Returns:
            Tuple of (success, message, user_data)
        """
        # Check if username already exists
        if User.query.filter_by(username=username).first():
            return False, "Username already exists", None
        
        # Check if email already exists
        if User.query.filter_by(email=email).first():
            return False, "Email already exists", None
        
        # Create new user
        hashed_password = generate_password_hash(password)
        new_user = User(
            username=username,
            email=email,
            password=hashed_password,
            first_name=first_name,
            last_name=last_name,
            created_at=datetime.datetime.utcnow(),
            updated_at=datetime.datetime.utcnow()
        )
        
        try:
            db.session.add(new_user)
            db.session.commit()
            
            # Return user data without password
            user_data = {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "first_name": new_user.first_name,
                "last_name": new_user.last_name,
                "created_at": new_user.created_at.isoformat()
            }
            
            return True, "User registered successfully", user_data
        except Exception as e:
            db.session.rollback()
            return False, f"Registration failed: {str(e)}", None
    
    def login(self, username_or_email: str, password: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Authenticate a user and generate a JWT token.
        
        Args:
            username_or_email: Username or email of the user
            password: Password of the user
            
        Returns:
            Tuple of (success, message, auth_data)
        """
        # Find user by username or email
        user = User.query.filter((User.username == username_or_email) | 
                                (User.email == username_or_email)).first()
        
        if not user:
            return False, "Invalid username/email or password", None
        
        # Check password
        if not check_password_hash(user.password, password):
            return False, "Invalid username/email or password", None
        
        # Generate JWT token
        token_payload = {
            "user_id": user.id,
            "username": user.username,
            "exp": datetime.datetime.utcnow() + self.token_expiration
        }
        
        token = jwt.encode(
            token_payload,
            current_app.config["JWT_SECRET_KEY"],
            algorithm="HS256"
        )
        
        # Update last login timestamp
        user.last_login = datetime.datetime.utcnow()
        db.session.commit()
        
        # Return auth data
        auth_data = {
            "token": token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name
            },
            "expires_at": (datetime.datetime.utcnow() + self.token_expiration).isoformat()
        }
        
        return True, "Login successful", auth_data
    
    def change_password(self, user_id: int, current_password: str, new_password: str) -> Tuple[bool, str]:
        """
        Change a user's password.
        
        Args:
            user_id: ID of the user
            current_password: Current password of the user
            new_password: New password to set
            
        Returns:
            Tuple of (success, message)
        """
        # Find user
        user = User.query.get(user_id)
        if not user:
            return False, "User not found"
        
        # Verify current password
        if not check_password_hash(user.password, current_password):
            return False, "Current password is incorrect"
        
        # Update password
        user.password = generate_password_hash(new_password)
        user.updated_at = datetime.datetime.utcnow()
        
        try:
            db.session.commit()
            return True, "Password changed successfully"
        except Exception as e:
            db.session.rollback()
            return False, f"Failed to change password: {str(e)}"
    
    def forgot_password(self, email: str) -> Tuple[bool, str]:
        """
        Initiate the forgot password process by generating a reset token.
        
        Args:
            email: Email of the user requesting password reset
            
        Returns:
            Tuple of (success, message)
        """
        # Find user by email
        user = User.query.filter_by(email=email).first()
        if not user:
            # For security reasons, don't reveal that the email doesn't exist
            return True, "If the email exists, a password reset link has been sent"
        
        # Generate a secure token
        token_string = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(64))
        
        # Set expiration time (24 hours from now)
        expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        
        # Delete any existing tokens for this user
        PasswordResetToken.query.filter_by(user_id=user.id).delete()
        
        # Create new token
        reset_token = PasswordResetToken(
            user_id=user.id,
            token=token_string,
            expires_at=expiration,
            created_at=datetime.datetime.utcnow()
        )
        
        try:
            db.session.add(reset_token)
            db.session.commit()
            
            # In a real application, you would send an email with the reset link
            # For this example, we'll just return the token
            return True, f"Password reset token generated: {token_string}"
        except Exception as e:
            db.session.rollback()
            return False, f"Failed to generate reset token: {str(e)}"
    
    def reset_password(self, token: str, new_password: str) -> Tuple[bool, str]:
        """
        Reset a user's password using a reset token.
        
        Args:
            token: Password reset token
            new_password: New password to set
            
        Returns:
            Tuple of (success, message)
        """
        # Find token
        reset_token = PasswordResetToken.query.filter_by(token=token).first()
        if not reset_token:
            return False, "Invalid or expired token"
        
        # Check if token is expired
        if reset_token.expires_at < datetime.datetime.utcnow():
            # Delete expired token
            db.session.delete(reset_token)
            db.session.commit()
            return False, "Token has expired"
        
        # Find user
        user = User.query.get(reset_token.user_id)
        if not user:
            return False, "User not found"
        
        # Update password
        user.password = generate_password_hash(new_password)
        user.updated_at = datetime.datetime.utcnow()
        
        # Delete the used token
        db.session.delete(reset_token)
        
        try:
            db.session.commit()
            return True, "Password reset successfully"
        except Exception as e:
            db.session.rollback()
            return False, f"Failed to reset password: {str(e)}"
    
    def verify_token(self, token: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """
        Verify a JWT token and return the user data.
        
        Args:
            token: JWT token to verify
            
        Returns:
            Tuple of (is_valid, user_data)
        """
        try:
            # Decode token
            payload = jwt.decode(
                token,
                current_app.config["JWT_SECRET_KEY"],
                algorithms=["HS256"]
            )
            
            # Get user
            user_id = payload.get("user_id")
            user = User.query.get(user_id)
            
            if not user:
                return False, None
            
            # Return user data
            user_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name
            }
            
            return True, user_data
        except jwt.ExpiredSignatureError:
            return False, None
        except jwt.InvalidTokenError:
            return False, None

# Create a singleton instance
auth_service = AuthService()