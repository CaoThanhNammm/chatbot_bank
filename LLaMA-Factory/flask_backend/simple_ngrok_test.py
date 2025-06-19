"""
Simple ngrok test to debug connection issues.
"""

import os
import time
from dotenv import load_dotenv
from pyngrok import ngrok

# Load environment variables
load_dotenv()

def main():
    print("Starting simple ngrok test...")
    
    # Get auth token
    auth_token = os.getenv("NGROK_AUTH_TOKEN_BE")
    if not auth_token:
        print("ERROR: No auth token found")
        return
    
    print(f"Auth token: {auth_token[:10]}...")
    
    try:
        # Set auth token
        print("Setting auth token...")
        ngrok.set_auth_token(auth_token)
        print("Auth token set successfully")
        
        # Kill any existing processes
        print("Killing existing ngrok processes...")
        ngrok.kill()
        time.sleep(2)
        
        # Create tunnel
        print("Creating tunnel on port 8888...")
        tunnel = ngrok.connect(8888, proto="http")
        
        print(f"SUCCESS: Tunnel created!")
        print(f"Public URL: {tunnel.public_url}")
        print(f"Local URL: http://localhost:8888")
        
        # Keep tunnel open for a moment
        print("Tunnel will stay open for 10 seconds...")
        time.sleep(10)
        
        # Close tunnel
        print("Closing tunnel...")
        ngrok.disconnect(tunnel.public_url)
        print("Tunnel closed successfully")
        
    except Exception as e:
        print(f"ERROR: {e}")
        print(f"Error type: {type(e).__name__}")
        
        # Try to get more details
        import traceback
        print("Full traceback:")
        traceback.print_exc()

if __name__ == "__main__":
    main()