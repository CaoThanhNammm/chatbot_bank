"""
Run script for the Flask backend.
Supports local development and deployment on Kaggle with ngrok tunneling.
"""

import os
import time
import subprocess
from dotenv import load_dotenv
from app import create_app
from pyngrok import ngrok

# Load environment variables
load_dotenv()

def kill_all_ngrok_processes():
    """Kill all ngrok processes using system commands."""
    try:
        # Try to kill ngrok processes using taskkill on Windows
        if os.name == 'nt':  # Windows
            subprocess.run(['taskkill', '/f', '/im', 'ngrok.exe'], 
                         capture_output=True, text=True)
        else:  # Unix-like systems
            subprocess.run(['pkill', '-f', 'ngrok'], 
                         capture_output=True, text=True)
        
        # Also try pyngrok's kill method
        try:
            ngrok.kill()
        except:
            pass
            
        # Wait a moment for processes to terminate
        time.sleep(2)
        print("All ngrok processes terminated.")
        
    except Exception as e:
        print(f"Warning: Could not kill ngrok processes: {e}")

def run_with_ngrok(app, port=5000, max_retries=3):
    """Run the Flask app with ngrok tunnel."""
    # Get ngrok auth token from environment
    ngrok_auth_token = os.getenv("NGROK_AUTH_TOKEN_BE")
    
    if not ngrok_auth_token:
        print("Warning: NGROK_AUTH_TOKEN_BE not found in .env file")
        return False
    
    for attempt in range(max_retries):
        try:
            print(f"Attempting to setup ngrok (attempt {attempt + 1}/{max_retries})...")
            
            # Set ngrok auth token
            ngrok.set_auth_token(ngrok_auth_token)
            
            # Kill all existing ngrok processes on first attempt
            if attempt == 0:
                print("Terminating any existing ngrok processes...")
                kill_all_ngrok_processes()
            
            # Check if there are existing tunnels
            tunnels = ngrok.get_tunnels()
            existing_tunnel = None
            
            # Look for existing tunnel on this port
            for tunnel in tunnels:
                if hasattr(tunnel, 'config') and tunnel.config and str(tunnel.config.get('addr', '')).endswith(f':{port}'):
                    existing_tunnel = tunnel
                    break
            
            if existing_tunnel:
                public_url = existing_tunnel.public_url
                print(f" * Using existing ngrok tunnel \"{public_url}\" -> \"http://127.0.0.1:{port}\"")
            else:
                # Open a new ngrok tunnel to the HTTP server
                print("Creating new ngrok tunnel...")
                public_url = ngrok.connect(port).public_url
                print(f" * New ngrok tunnel \"{public_url}\" -> \"http://127.0.0.1:{port}\"")
            
            # Update any base URLs or webhooks using the public ngrok URL
            app.config["BASE_URL"] = public_url
            
            return True
            
        except Exception as e:
            error_msg = str(e)
            print(f"Error setting up ngrok (attempt {attempt + 1}): {error_msg}")
            
            # Check if it's the specific authentication/session limit error
            if "authentication failed" in error_msg.lower() and "limited to 1 simultaneous" in error_msg.lower():
                print("Detected ngrok session limit error. Attempting to resolve...")
                kill_all_ngrok_processes()
                
                if attempt < max_retries - 1:
                    print(f"Waiting 5 seconds before retry...")
                    time.sleep(5)
                    continue
            
            # If it's the last attempt or a different error, show detailed info
            if attempt == max_retries - 1:
                print("Ngrok setup failed after all attempts. This might be due to:")
                print("1. Multiple ngrok sessions running (account limit)")
                print("2. Network connectivity issues") 
                print("3. Invalid auth token")
                print("4. Ngrok service issues")
                print("\nSuggested solutions:")
                print("- Check ngrok dashboard: https://dashboard.ngrok.com/agents")
                print("- Manually run: ngrok kill")
                print("- Restart your terminal/IDE")
                print("- Check if another application is using ngrok")
                print("\nTrying to continue without ngrok...")
                return False
            else:
                print(f"Retrying in 3 seconds...")
                time.sleep(3)
    
    return False

if __name__ == "__main__":
    app = create_app()
    port = 5000
    
    print("=" * 50)
    print("Starting Flask Backend Server")
    print("=" * 50)
    
    # Setup ngrok tunnel
    ngrok_success = run_with_ngrok(app, port, max_retries=3)
    if not ngrok_success:
        print("\n" + "!" * 50)
        print("NGROK SETUP FAILED")
        print("!" * 50)
        print("Possible solutions:")
        print("1. Check ngrok dashboard: https://dashboard.ngrok.com/agents")
        print("2. Verify your NGROK_AUTH_TOKEN_BE in .env file")
        print("3. Manually run: ngrok kill")
        print("4. Restart your terminal/IDE")
        print("5. Check if another application is using ngrok")
        print("\nContinuing with local server only...")
        print("Server will be available at: http://localhost:5000")
        print("!" * 50)
    else:
        print("\n" + "✓" * 50)
        print("NGROK TUNNEL ESTABLISHED SUCCESSFULLY")
        print("✓" * 50)
    
    print(f"\nStarting Flask server on port {port}...")
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    # Run the Flask app
    try:
        app.run(host="0.0.0.0", port=port, debug=True)
    except KeyboardInterrupt:
        print("\n\nShutting down server...")
        try:
            kill_all_ngrok_processes()
            print("Ngrok tunnels closed.")
        except:
            pass
        print("Server stopped.")