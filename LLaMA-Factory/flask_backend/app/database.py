"""
Database configuration for the Flask backend.
"""

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os
import logging

# Initialize SQLAlchemy instance
db = SQLAlchemy()
migrate = Migrate()

class DatabaseConfig:
    """Database configuration class for MySQL."""
    
    def __init__(self, app=None):
        """Initialize database configuration."""
        self.app = app
        self.logger = logging.getLogger(__name__)
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize database with Flask app."""
        # Database configuration is already set in config.py
        
        # Initialize extensions
        db.init_app(app)
        migrate.init_app(app, db)
        
        self.logger.info(f"Database initialized with URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    def create_tables(self):
        """Create all tables in the database."""
        try:
            with self.app.app_context():
                db.create_all()
                self.logger.info("All database tables created successfully")
        except Exception as e:
            self.logger.error(f"Error creating database tables: {str(e)}")
            raise
    
    def drop_tables(self):
        """Drop all tables in the database."""
        try:
            with self.app.app_context():
                db.drop_all()
                self.logger.info("All database tables dropped successfully")
        except Exception as e:
            self.logger.error(f"Error dropping database tables: {str(e)}")
            raise
    
    def reset_tables(self):
        """Reset all tables in the database."""
        self.drop_tables()
        self.create_tables()
        
    def check_connection(self):
        """Check database connection."""
        try:
            with self.app.app_context():
                db.engine.connect()
                return True, "Database connection successful"
        except Exception as e:
            return False, f"Database connection failed: {str(e)}"