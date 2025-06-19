"""
Run script for the Flask backend.
Supports local development and deployment with ngrok tunneling.
"""

import os
import time
import subprocess
import requests
from dotenv import load_dotenv
from app import create_app
from pyngrok import ngrok

# Load environment variables
load_dotenv()

def detect_existing_ngrok_url():
    """
    Detect existing ngrok URL from ngrok API.
    Returns the public URL if found, None otherwise.
    """
    try:
        response = requests.get("http://localhost:4040/api/tunnels", timeout=3)
        if response.status_code == 200:
            data = response.json()
            tunnels = data.get('tunnels', [])
            
            # Look for HTTPS tunnel first
            for tunnel in tunnels:
                if tunnel.get('proto') == 'https':
                    public_url = tunnel.get('public_url')
                    if public_url:
                        print(f"[PASS] Detected existing ngrok HTTPS tunnel: {public_url}")
                        return public_url
                        
            # If no HTTPS tunnel, try HTTP and convert to HTTPS
            for tunnel in tunnels:
                if tunnel.get('proto') == 'http':
                    public_url = tunnel.get('public_url')
                    if public_url:
                        https_url = public_url.replace('http://', 'https://')
                        print(f"[PASS] Detected existing ngrok HTTP tunnel (converted to HTTPS): {https_url}")
                        return https_url
                        
    except requests.exceptions.RequestException:
        # Ngrok API not available - this is normal if ngrok isn't running
        pass
    except Exception as e:
        print(f"[WARN]  Error detecting ngrok URL: {e}")
        
    return None

def set_ngrok_environment_variable(url):
    """Set NGROK_URL environment variable for the current session."""
    if url:
        os.environ['NGROK_URL'] = url
        print(f"Email links will use: {url}")
    else:
        print("Email links will use fallback URL")

def kill_all_ngrok_processes():
    """Kill all ngrok processes using system commands."""
    try:
        print("Terminating existing ngrok processes...")
        
        # Try pyngrok's kill method first
        try:
            ngrok.kill()
            print("[PASS] Ngrok processes killed via pyngrok")
        except Exception as e:
            print(f"[WARN]  pyngrok.kill() failed: {e}")
        
        # Try to kill ngrok processes using system commands
        if os.name == 'nt':  # Windows
            result = subprocess.run(['taskkill', '/f', '/im', 'ngrok.exe'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                print("[PASS] Ngrok processes killed via taskkill")
        else:  # Unix-like systems
            result = subprocess.run(['pkill', '-f', 'ngrok'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                print("[PASS] Ngrok processes killed via pkill")
            
        # Wait for processes to terminate
        time.sleep(3)
        
    except Exception as e:
        print(f"[WARN]  Warning: Could not kill ngrok processes: {e}")

def run_with_ngrok(app, port=5000):
    """Run the Flask app with ngrok tunnel."""
    # First, try to detect existing ngrok tunnel
    existing_url = detect_existing_ngrok_url()
    if existing_url:
        app.config["BASE_URL"] = existing_url
        set_ngrok_environment_variable(existing_url)
        return True, existing_url
    
    # If no existing tunnel, try to create new one
    print("[INFO] No existing ngrok tunnel found, attempting to create new one...")
    
    # Get ngrok auth token from environment
    ngrok_auth_token = os.getenv("NGROK_AUTH_TOKEN_BE")
    
    if not ngrok_auth_token:
        print("[WARN]  Warning: NGROK_AUTH_TOKEN_BE not found in .env file")
        print("[TIP] You can either:")
        print("   1. Set NGROK_AUTH_TOKEN_BE in your .env file")
        print("   2. Start ngrok manually: ngrok http 5000")
        print("   3. Set NGROK_URL manually in .env file")
        return False, None
    
    try:
        print("[START] Setting up ngrok tunnel...")
        
        # Kill any existing ngrok processes first
        kill_all_ngrok_processes()
        
        # Set ngrok auth token
        ngrok.set_auth_token(ngrok_auth_token)
        
        # Create new ngrok tunnel
        print(f"[LINK] Creating ngrok tunnel for port {port}...")
        tunnel = ngrok.connect(port, proto="http")
        public_url = tunnel.public_url
        
        # Convert to HTTPS if needed
        if public_url.startswith('http://'):
            public_url = public_url.replace('http://', 'https://')
        
        print(f"[PASS] Ngrok tunnel created: {public_url} -> http://127.0.0.1:{port}")
        
        # Update app config
        app.config["BASE_URL"] = public_url
        set_ngrok_environment_variable(public_url)
        
        return True, public_url
        
    except Exception as e:
        error_msg = str(e).lower()
        print(f"[FAIL] Error setting up ngrok: {e}")
        
        # Provide specific error guidance
        if "authentication failed" in error_msg:
            print("\n🔑 Authentication Error:")
            print("- Check your NGROK_AUTH_TOKEN_BE in .env file")
            print("- Get token from: https://dashboard.ngrok.com/get-started/your-authtoken")
        elif "limited to 1 simultaneous" in error_msg or "session limit" in error_msg:
            print("\n📊 Session Limit Error:")
            print("- Ngrok free plan allows only 1 tunnel at a time")
            print("- Check ngrok dashboard: https://dashboard.ngrok.com/agents")
            print("- Kill existing tunnels: ngrok kill")
        elif "tunnel not found" in error_msg or "connection refused" in error_msg:
            print("\n[URL] Connection Error:")
            print("- Check your internet connection")
            print("- Try running: ngrok http 5000 manually")
        else:
            print("\n🔧 General troubleshooting:")
            print("- Restart your terminal/IDE")
            print("- Check ngrok service status")
            print("- Try manual setup: ngrok http 5000")
        
        return False, None

if __name__ == "__main__":
    app = create_app()
    port = 5000
    
    print("=" * 50)
    print("Starting Flask Backend Server")
    print("=" * 50)
    
    # Check if user wants to force local mode
    use_local_only = os.getenv("USE_LOCAL_ONLY", "true").lower() == "true"
    
    if use_local_only:
        print("[CONFIG] Running in LOCAL MODE (ngrok disabled)")
        print(f"[LOCAL] Server will be available at: http://localhost:{port}")
        app.config["BASE_URL"] = f"http://localhost:{port}"
        ngrok_success = False
        ngrok_url = None
    else:
        # Check for manual NGROK_URL override first
        manual_ngrok_url = os.getenv("NGROK_URL")
        if manual_ngrok_url:
            print(f"[CONFIG] Using manual NGROK_URL from environment: {manual_ngrok_url}")
            app.config["BASE_URL"] = manual_ngrok_url
            set_ngrok_environment_variable(manual_ngrok_url)
            ngrok_success = True
            ngrok_url = manual_ngrok_url
        else:
            # Setup ngrok tunnel (auto-detect or create new)
            ngrok_success, ngrok_url = run_with_ngrok(app, port)
        
        if not ngrok_success:
            print("\n" + "!" * 50)
            print("[WARN]  NGROK SETUP FAILED - SWITCHING TO LOCAL MODE")
            print("!" * 50)
            print("[TIP] To use ngrok again:")
            print("1. Set USE_LOCAL_ONLY=false in .env file")
            print("2. Start ngrok manually: ngrok http 5000")
            print("3. Set NGROK_URL in .env file")
            print("4. Check ngrok dashboard: https://dashboard.ngrok.com/agents")
            print("\n[LOCAL] Running in local mode...")
            print(f"[LOCATION] Server will be available at: http://localhost:{port}")
            app.config["BASE_URL"] = f"http://localhost:{port}"
            print("!" * 50)
        else:
            print("\n" + "✅" * 15)
            print("[SUCCESS] NGROK TUNNEL ESTABLISHED SUCCESSFULLY")
            print(f"[URL] Public URL: {ngrok_url}")
            print("✅" * 15)
    
    print(f"\n[SERVER]  Starting Flask server on port {port}...")
    print("[INPUT]  Press Ctrl+C to stop the server")
    print("-" * 50)
    
    # Run the Flask app
    try:
        app.run(host="0.0.0.0", port=port, debug=True)
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down server...")
        if not use_local_only:
            try:
                kill_all_ngrok_processes()
                print("🔌 Ngrok tunnels closed.")
            except:
                pass
        print("✅ Server stopped.")