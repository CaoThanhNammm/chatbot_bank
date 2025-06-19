"""
Authentication manager for handling user authentication operations.
"""

import os
import jwt
import datetime
import secrets
import string
from typing import Dict, Tuple, Optional, Any
from werkzeug.security import generate_password_hash, check_password_hash
from flask import current_app, url_for
from .database import db
from .auth_models import User, PasswordResetToken, ActivationToken
from .mail_config import mail_config
from .ngrok_utils import ngrok_utils

class AuthManager:
    """
    Manages user authentication operations including login, register, 
    change password, and forgot password functionality.
    """
    
    def __init__(self):
        """Initialize the authentication manager."""
        self.token_expiration = datetime.timedelta(days=1)  # Default token expiration
    
    def register(self, username: str, email: str, password: str, first_name: Optional[str] = None, last_name: Optional[str] = None) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
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
        
        # Create new user with is_active = 0 (chưa kích hoạt)
        hashed_password = generate_password_hash(password)
        new_user = User(
            username=username,
            email=email,
            password=hashed_password,
            first_name=first_name,
            last_name=last_name,
            is_active=0,  # Mặc định chưa kích hoạt
            created_at=datetime.datetime.utcnow(),
            updated_at=datetime.datetime.utcnow()
        )
        
        try:
            db.session.add(new_user)
            db.session.commit()
            
            # Generate activation token
            token_string = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(64))
            expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            
            activation_token = ActivationToken(
                user_id=new_user.id,
                token=token_string,
                expires_at=expiration,
                created_at=datetime.datetime.utcnow()
            )
            
            db.session.add(activation_token)
            db.session.commit()
            
            # Return user data without password
            user_data = {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "first_name": new_user.first_name,
                "last_name": new_user.last_name,
                "is_admin": new_user.is_admin,
                "is_active": new_user.is_active,
                "created_at": new_user.created_at.isoformat()
            }
            
            # Send activation email only after successful token creation
            try:
                backend_url = ngrok_utils.get_backend_url()
                activation_url = f"{backend_url}/api/auth/activate?token={token_string}"
                activation_subject = "Kích hoạt tài khoản LLaMA-Factory"
                activation_body = f"""
Xin chào {first_name or username},

Cảm ơn bạn đã đăng ký tài khoản LLaMA-Factory!

Để hoàn tất quá trình đăng ký, vui lòng kích hoạt tài khoản của bạn bằng cách nhấp vào liên kết dưới đây:

{activation_url}

Liên kết này sẽ hết hạn sau 24 giờ.

Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.

Trân trọng,
Đội ngũ LLaMA-Factory
"""
                activation_html = f"""
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }}
        .footer {{ margin-top: 30px; font-size: 12px; color: #777; }}
        .header {{ text-align: center; margin-bottom: 30px; }}
        .content {{ background-color: #f9f9f9; padding: 20px; border-radius: 8px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="color: #4CAF50;">Kích hoạt tài khoản LLaMA-Factory</h2>
        </div>
        <div class="content">
            <p>Xin chào <strong>{first_name or username}</strong>,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản LLaMA-Factory!</p>
            <p>Để hoàn tất quá trình đăng ký, vui lòng kích hoạt tài khoản của bạn bằng cách nhấp vào nút dưới đây:</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{activation_url}" class="button">Kích hoạt tài khoản</a>
            </p>
            <p>Hoặc sao chép và dán liên kết này vào trình duyệt của bạn:</p>
            <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 4px;">{activation_url}</p>
            <p><strong>Lưu ý:</strong> Liên kết này sẽ hết hạn sau 24 giờ.</p>
            <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
        </div>
        <p>Trân trọng,<br><strong>Đội ngũ LLaMA-Factory</strong></p>
        <div class="footer">
            <p>Đây là email tự động, vui lòng không trả lời email này.</p>
        </div>
    </div>
</body>
</html>
"""
                mail_config.send_email(
                    subject=activation_subject,
                    recipients=[email],
                    body=activation_body,
                    html=activation_html
                )
                current_app.logger.info(f"Activation email sent successfully to {email}")
            except Exception as e:
                # Log the error but don't fail registration if email sending fails
                current_app.logger.error(f"Failed to send activation email to {email}: {str(e)}")
            
            return True, "Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.", user_data
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Registration failed for {email}: {str(e)}")
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
            return False, "Tên đăng nhập/email hoặc mật khẩu không đúng", None
        
        # Check if user is deleted
        if user.is_active == -1:
            return False, "Tài khoản không tồn tại", None
        
        # Check password
        if not check_password_hash(user.password, password):
            return False, "Tên đăng nhập/email hoặc mật khẩu không đúng", None
        
        # Check if user is not activated
        if user.is_active == 0:
            # Check if we should resend activation email (throttling)
            should_resend = self._should_resend_activation_email(user)
            if should_resend:
                try:
                    self._resend_activation_email(user)
                    return False, "Tài khoản chưa được kích hoạt. Email kích hoạt mới đã được gửi, vui lòng kiểm tra email.", None
                except Exception as e:
                    current_app.logger.error(f"Failed to resend activation email: {str(e)}")
                    return False, "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để kích hoạt tài khoản.", None
            else:
                return False, "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để kích hoạt tài khoản hoặc thử lại sau.", None
        
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
                "last_name": user.last_name,
                "is_admin": user.is_admin
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
            
            # Send email with reset link
            frontend_url = ngrok_utils.get_frontend_url()
            reset_url = f"{frontend_url}/reset-password?token={token_string}"
            email_subject = "Password Reset Request"
            email_body = f"""
Hello,

You have requested to reset your password. Please click the link below to reset your password:

{reset_url}

This link will expire in 24 hours.

If you did not request a password reset, please ignore this email.

Best regards,
The LLaMA-Factory Team
"""
            email_html = f"""
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .button {{ display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }}
        .footer {{ margin-top: 30px; font-size: 12px; color: #777; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>You have requested to reset your password. Please click the button below to reset your password:</p>
        <p><a href="{reset_url}" class="button">Reset Password</a></p>
        <p>Or copy and paste this link in your browser:</p>
        <p>{reset_url}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,<br>The LLaMA-Factory Team</p>
        <div class="footer">
            <p>This is an automated email, please do not reply.</p>
        </div>
    </div>
</body>
</html>
"""
            success, message = mail_config.send_email(
                subject=email_subject,
                recipients=[user.email],
                body=email_body,
                html=email_html
            )
            
            if success:
                return True, "Password reset instructions have been sent to your email"
            else:
                # If email sending fails, still return success but log the error
                current_app.logger.error(f"Failed to send password reset email: {message}")
                return True, "Password reset instructions have been sent to your email"
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
            
            # Check if user is active
            if user.is_active != 1:
                return False, None
            
            # Return user data
            user_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_admin": user.is_admin,
                "is_active": user.is_active
            }
            
            return True, user_data
        except jwt.ExpiredSignatureError:
            return False, None
        except jwt.InvalidTokenError:
            return False, None
    
    def _should_resend_activation_email(self, user: User) -> bool:
        """
        Check if we should resend activation email (throttling mechanism).
        Only allow resending if no activation email was sent in the last 5 minutes.
        
        Args:
            user: User object to check
            
        Returns:
            bool: True if should resend, False otherwise
        """
        # Get the most recent activation token for this user
        latest_token = ActivationToken.query.filter_by(user_id=user.id)\
                                          .order_by(ActivationToken.created_at.desc())\
                                          .first()
        
        if not latest_token:
            return True  # No token exists, allow sending
        
        # Check if last token was created more than 5 minutes ago
        time_diff = datetime.datetime.utcnow() - latest_token.created_at
        return time_diff.total_seconds() > 300  # 5 minutes = 300 seconds
    
    def _resend_activation_email(self, user: User) -> None:
        """
        Resend activation email to user.
        
        Args:
            user: User object to send activation email to
        """
        # Delete any existing activation tokens for this user
        ActivationToken.query.filter_by(user_id=user.id).delete()
        
        # Generate new activation token
        token_string = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(64))
        expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        
        activation_token = ActivationToken(
            user_id=user.id,
            token=token_string,
            expires_at=expiration,
            created_at=datetime.datetime.utcnow()
        )
        
        db.session.add(activation_token)
        db.session.commit()
        
        # Send activation email
        backend_url = ngrok_utils.get_backend_url()
        activation_url = f"{backend_url}/api/auth/activate?token={token_string}"
        activation_subject = "Kích hoạt tài khoản LLaMA-Factory"
        activation_body = f"""
Xin chào {user.first_name or user.username},

Bạn đã yêu cầu gửi lại email kích hoạt tài khoản.

Để kích hoạt tài khoản của bạn, vui lòng nhấp vào liên kết dưới đây:

{activation_url}

Liên kết này sẽ hết hạn sau 24 giờ.

Nếu bạn không yêu cầu này, vui lòng bỏ qua email này.

Trân trọng,
Đội ngũ LLaMA-Factory
"""
        activation_html = f"""
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }}
        .footer {{ margin-top: 30px; font-size: 12px; color: #777; }}
        .header {{ text-align: center; margin-bottom: 30px; }}
        .content {{ background-color: #f9f9f9; padding: 20px; border-radius: 8px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="color: #4CAF50;">Kích hoạt tài khoản LLaMA-Factory</h2>
        </div>
        <div class="content">
            <p>Xin chào <strong>{user.first_name or user.username}</strong>,</p>
            <p>Bạn đã yêu cầu gửi lại email kích hoạt tài khoản.</p>
            <p>Để kích hoạt tài khoản của bạn, vui lòng nhấp vào nút dưới đây:</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{activation_url}" class="button">Kích hoạt tài khoản</a>
            </p>
            <p>Hoặc sao chép và dán liên kết này vào trình duyệt của bạn:</p>
            <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 4px;">{activation_url}</p>
            <p><strong>Lưu ý:</strong> Liên kết này sẽ hết hạn sau 24 giờ.</p>
            <p>Nếu bạn không yêu cầu này, vui lòng bỏ qua email này.</p>
        </div>
        <p>Trân trọng,<br><strong>Đội ngũ LLaMA-Factory</strong></p>
        <div class="footer">
            <p>Đây là email tự động, vui lòng không trả lời email này.</p>
        </div>
    </div>
</body>
</html>
"""
        try:
            mail_config.send_email(
                subject=activation_subject,
                recipients=[user.email],
                body=activation_body,
                html=activation_html
            )
            current_app.logger.info(f"Resent activation email to {user.email}")
        except Exception as e:
            current_app.logger.error(f"Failed to resend activation email to {user.email}: {str(e)}")
            raise  # Re-raise the exception so the caller can handle it
    
    def activate_user(self, token: str) -> Tuple[bool, str]:
        """
        Activate a user account using activation token.
        
        Args:
            token: Activation token
            
        Returns:
            Tuple of (success, message)
        """
        # Find activation token
        activation_token = ActivationToken.query.filter_by(token=token).first()
        if not activation_token:
            return False, "Token kích hoạt không hợp lệ hoặc đã hết hạn"
        
        # Check if token is expired
        if activation_token.expires_at < datetime.datetime.utcnow():
            # Delete expired token
            db.session.delete(activation_token)
            db.session.commit()
            return False, "Token kích hoạt đã hết hạn"
        
        # Find user
        user = User.query.get(activation_token.user_id)
        if not user:
            return False, "Người dùng không tồn tại"
        
        # Check if user is already activated
        if user.is_active == 1:
            # Delete the token since user is already activated
            db.session.delete(activation_token)
            db.session.commit()
            return True, "Tài khoản đã được kích hoạt trước đó"
        
        # Activate user
        user.is_active = 1
        user.updated_at = datetime.datetime.utcnow()
        
        # Delete the used token
        db.session.delete(activation_token)
        
        try:
            db.session.commit()
            return True, "Tài khoản đã được kích hoạt thành công"
        except Exception as e:
            db.session.rollback()
            return False, f"Lỗi khi kích hoạt tài khoản: {str(e)}"
    
    def update_active_status(self, user_id: str, status: int) -> Tuple[bool, str]:
        """
        Update user active status.
        
        Args:
            user_id: ID of the user
            status: New status (0: chưa kích hoạt, 1: đã kích hoạt, -1: đã xóa)
            
        Returns:
            Tuple of (success, message)
        """
        # Validate status
        if status not in [0, 1, -1]:
            return False, "Trạng thái không hợp lệ"
        
        # Find user
        user = User.query.get(user_id)
        if not user:
            return False, "Người dùng không tồn tại"
        
        # Update status
        user.is_active = status
        user.updated_at = datetime.datetime.utcnow()
        
        try:
            db.session.commit()
            status_text = {0: "chưa kích hoạt", 1: "đã kích hoạt", -1: "đã xóa"}
            return True, f"Cập nhật trạng thái thành công: {status_text[status]}"
        except Exception as e:
            db.session.rollback()
            return False, f"Lỗi khi cập nhật trạng thái: {str(e)}"

# Create a singleton instance
auth_manager = AuthManager()