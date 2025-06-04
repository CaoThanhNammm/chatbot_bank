"""
MySQL configuration for the Flask backend.
"""

import os
import logging
import pymysql
from typing import Tuple, Dict, Any, Optional

class MySQLConfig:
    """MySQL configuration class for direct database operations."""
    
    def __init__(self):
        """Initialize MySQL configuration."""
        self.logger = logging.getLogger(__name__)
        self.connection_params = self._get_connection_params()
    
    def _get_connection_params(self) -> Dict[str, Any]:
        """Get MySQL connection parameters from environment variables."""
        return {
            'host': os.environ.get('DB_HOST', 'localhost'),
            'user': os.environ.get('DB_USER', 'root'),
            'password': os.environ.get('DB_PASSWORD', ''),
            'port': int(os.environ.get('DB_PORT', 3306)),
            'database': os.environ.get('DB_NAME', 'llama_factory'),
            'charset': 'utf8mb4',
            'cursorclass': pymysql.cursors.DictCursor,
            'autocommit': True
        }
    
    def get_connection(self):
        """Get a MySQL connection."""
        try:
            connection = pymysql.connect(**self.connection_params)
            return connection
        except Exception as e:
            self.logger.error(f"Error connecting to MySQL: {str(e)}")
            raise
    
    def execute_query(self, query: str, params: Optional[tuple] = None) -> Tuple[bool, Any]:
        """
        Execute a MySQL query.
        
        Args:
            query: SQL query to execute
            params: Query parameters
            
        Returns:
            Tuple of (success, result)
        """
        connection = None
        try:
            connection = self.get_connection()
            with connection.cursor() as cursor:
                cursor.execute(query, params)
                if query.strip().upper().startswith('SELECT'):
                    result = cursor.fetchall()
                else:
                    connection.commit()
                    result = cursor.rowcount
                return True, result
        except Exception as e:
            self.logger.error(f"Error executing query: {str(e)}")
            if connection:
                connection.rollback()
            return False, str(e)
        finally:
            if connection:
                connection.close()
    
    def create_database(self) -> Tuple[bool, str]:
        """
        Create the database if it doesn't exist.
        
        Returns:
            Tuple of (success, message)
        """
        # Save the current database name
        db_name = self.connection_params['database']
        
        # Remove database from connection params temporarily
        self.connection_params.pop('database', None)
        
        try:
            connection = self.get_connection()
            with connection.cursor() as cursor:
                # Create database if it doesn't exist
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                self.logger.info(f"Database '{db_name}' created or already exists")
                return True, f"Database '{db_name}' created or already exists"
        except Exception as e:
            self.logger.error(f"Error creating database: {str(e)}")
            return False, str(e)
        finally:
            if connection:
                connection.close()
            
            # Restore database name to connection params
            self.connection_params['database'] = db_name
    
    def check_connection(self) -> Tuple[bool, str]:
        """
        Check database connection.
        
        Returns:
            Tuple of (success, message)
        """
        try:
            connection = self.get_connection()
            with connection.cursor() as cursor:
                cursor.execute("SELECT VERSION()")
                version = cursor.fetchone()
                return True, f"Connected to MySQL version: {version['VERSION()']}"
        except Exception as e:
            return False, f"Database connection failed: {str(e)}"
        finally:
            if connection:
                connection.close()

# Create a singleton instance
mysql_config = MySQLConfig()