"""
Email configuration for the Flask backend.
"""

import os
import logging
from flask_mail import Mail, Message

# Initialize extensions
mail = Mail()

class MailConfig:
    """Mail configuration class for email operations."""
    
    def __init__(self):
        """Initialize mail configuration."""
        self.logger = logging.getLogger(__name__)
    
    def init_app(self, app):
        """Initialize mail with the Flask app."""
        # Email configuration is already set in config.py
        
        # Initialize Flask-Mail
        mail.init_app(app)
        
        self.logger.info("Mail service initialized")
    
    def send_email(self, subject, recipients, body, html=None):
        """
        Send an email.
        
        Args:
            subject: Email subject
            recipients: List of recipient email addresses
            body: Plain text email body
            html: HTML email body (optional)
            
        Returns:
            Tuple of (success, message)
        """
        try:
            msg = Message(
                subject=subject,
                recipients=recipients,
                body=body,
                html=html
            )
            mail.send(msg)
            return True, "Email sent successfully"
        except Exception as e:
            self.logger.error(f"Failed to send email: {str(e)}")
            return False, f"Failed to send email: {str(e)}"

# Create a singleton instance
mail_config = MailConfig()