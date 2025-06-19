"""
Run script for Flask backend in LOCAL mode only.
This script runs the Flask app without ngrok tunneling.
"""

import os
from dotenv import load_dotenv
from app import create_app

# Load environment variables
load_dotenv()

def run_local_server(port=5000):
    """Run the Flask app in local mode only."""
    app = create_app()
    
    print("=" * 50)
    print("Starting Flask Backend Server - LOCAL MODE")
    print("=" * 50)
    
    # Force local mode configuration
    app.config["BASE_URL"] = f"http://localhost:{port}"
    os.environ['USE_LOCAL_ONLY'] = 'true'
    
    print(f"[CONFIG] Running in LOCAL MODE ONLY")
    print(f"[LOCAL]  Server will be available at: http://localhost:{port}")
    print(f"[INFO]   Ngrok is DISABLED for this session")
    print(f"[ACCESS] Frontend should connect to: http://localhost:{port}")
    
    print(f"\n[SERVER] Starting Flask server on port {port}...")
    print("[INPUT]  Press Ctrl+C to stop the server")
    print("-" * 50)
    
    # Run the Flask app in local mode
    try:
        app.run(host="0.0.0.0", port=port, debug=True)
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down local server...")
        print("✅ Server stopped.")

if __name__ == "__main__":
    # Get port from environment or use default
    port = int(os.getenv("FLASK_PORT", 5000))
    run_local_server(port)