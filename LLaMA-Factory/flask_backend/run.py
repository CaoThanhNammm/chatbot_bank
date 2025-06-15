"""
Run script for the Flask backend.
Supports local development and deployment on Kaggle with ngrok tunneling.
"""

import os
from dotenv import load_dotenv
from app import create_app
from pyngrok import ngrok

# Load environment variables
load_dotenv()

def run_with_ngrok(app, port=5000):
    """Run the Flask app with ngrok tunnel."""
    # Get ngrok auth token from environment
    ngrok_auth_token = os.getenv("NGROK_AUTH_TOKEN")
    
    if not ngrok_auth_token:
        print("Warning: NGROK_AUTH_TOKEN not found in .env file")
        return False
    
    # Set ngrok auth token
    ngrok.set_auth_token(ngrok_auth_token)
    
    # Open a ngrok tunnel to the HTTP server
    public_url = ngrok.connect(port).public_url
    print(f" * ngrok tunnel \"{public_url}\" -> \"http://127.0.0.1:{port}\"")
    
    # Update any base URLs or webhooks using the public ngrok URL
    app.config["BASE_URL"] = public_url
    
    return True

if __name__ == "__main__":
    app = create_app()
    port = 5000
    
    # Setup ngrok tunnel
    ngrok_success = run_with_ngrok(app, port)
    if not ngrok_success:
        print("Failed to setup ngrok tunnel. Check your auth token.")
        print("Running without ngrok...")
    
    # Run the Flask app
    app.run(host="0.0.0.0", port=port, debug=True)