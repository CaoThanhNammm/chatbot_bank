"""
Ngrok utilities for automatically getting the current ngrok URL.
"""

import requests
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

class NgrokUtils:
    """Utility class for working with ngrok."""
    
    def __init__(self):
        """Initialize NgrokUtils."""
        self.ngrok_api_url = "http://localhost:4040/api/tunnels"
        self.cached_url = None
        
    def get_ngrok_url(self) -> Optional[str]:
        """
        Get the current ngrok public URL.
        
        Returns:
            The ngrok public URL if available, None otherwise.
        """
        # First try to get from environment variable
        env_url = os.environ.get('NGROK_URL')
        if env_url:
            logger.info(f"Using ngrok URL from environment: {env_url}")
            return env_url
            
        # Try to get from ngrok API
        try:
            response = requests.get(self.ngrok_api_url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                tunnels = data.get('tunnels', [])
                
                # Look for HTTPS tunnel
                for tunnel in tunnels:
                    if tunnel.get('proto') == 'https':
                        public_url = tunnel.get('public_url')
                        if public_url:
                            logger.info(f"Found ngrok URL via API: {public_url}")
                            self.cached_url = public_url
                            return public_url
                            
                # If no HTTPS tunnel, try HTTP
                for tunnel in tunnels:
                    if tunnel.get('proto') == 'http':
                        public_url = tunnel.get('public_url')
                        if public_url:
                            # Convert HTTP to HTTPS
                            https_url = public_url.replace('http://', 'https://')
                            logger.info(f"Found ngrok URL via API (converted to HTTPS): {https_url}")
                            self.cached_url = https_url
                            return https_url
                            
        except requests.exceptions.RequestException as e:
            logger.warning(f"Could not connect to ngrok API: {e}")
        except Exception as e:
            logger.error(f"Error getting ngrok URL: {e}")
            
        # Return cached URL if available
        if self.cached_url:
            logger.info(f"Using cached ngrok URL: {self.cached_url}")
            return self.cached_url
            
        # No fallback URL - return None to indicate ngrok is not available
        logger.warning("No ngrok URL available - using localhost fallback")
        return None
    
    def get_backend_url(self) -> str:
        """
        Get the backend URL (ngrok URL or localhost).
        
        Returns:
            The backend URL to use for email links.
        """
        ngrok_url = self.get_ngrok_url()
        if ngrok_url:
            return ngrok_url
        
        # Fallback to localhost
        return "http://localhost:5000"
    
    def get_frontend_url(self) -> str:
        """
        Get the frontend URL.
        
        Returns:
            The frontend URL to use for email links.
        """
        # Check if there's a specific frontend URL in environment
        frontend_url = os.environ.get('FRONTEND_NGROK_URL')
        if frontend_url:
            logger.info(f"Using frontend URL from environment: {frontend_url}")
            return frontend_url
            
        # For now, use the same as backend URL
        # You can modify this if frontend has different ngrok tunnel
        return self.get_backend_url()
    
    def refresh_url(self) -> Optional[str]:
        """
        Force refresh the ngrok URL (clear cache and fetch new).
        
        Returns:
            The refreshed ngrok URL if available, None otherwise.
        """
        self.cached_url = None
        return self.get_ngrok_url()

# Create singleton instance
ngrok_utils = NgrokUtils()