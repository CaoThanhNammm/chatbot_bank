"""
Database initialization script.
"""

import os
import sys
import logging
from flask import Flask

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.mysql_config import mysql_config
from app.database import db

def init_database():
    """Initialize the database."""
    # Create Flask app
    app = create_app()
    
    with app.app_context():
        try:
            # First, create the database if it doesn't exist
            success, message = mysql_config.create_database()
            if not success:
                logger.error(f"Failed to create database: {message}")
                return False
            
            logger.info(message)
            
            # Create all tables
            db.create_all()
            logger.info("All database tables created successfully")
            
            # Check if tables were created
            success, result = mysql_config.execute_query("SHOW TABLES")
            if success:
                logger.info(f"Tables in database: {', '.join([list(table.values())[0] for table in result])}")
            else:
                logger.error(f"Failed to show tables: {result}")
            
            return True
        except Exception as e:
            logger.error(f"Error initializing database: {str(e)}")
            return False

if __name__ == "__main__":
    logger.info("Starting database initialization...")
    if init_database():
        logger.info("Database initialization completed successfully")
    else:
        logger.error("Database initialization failed")
        sys.exit(1)