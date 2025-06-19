"""
Test script to verify ngrok setup and configuration.
"""

import os
import requests
from dotenv import load_dotenv
from pyngrok import ngrok

# Load environment variables
load_dotenv()

def test_environment():
    """Test environment variables."""
    print("[INFO] Testing environment variables...")
    
    auth_token = os.getenv("NGROK_AUTH_TOKEN_BE")
    ngrok_url = os.getenv("NGROK_URL")
    
    if auth_token:
        print(f"[PASS] NGROK_AUTH_TOKEN_BE: {'*' * (len(auth_token) - 4) + auth_token[-4:]}")
    else:
        print("[FAIL] NGROK_AUTH_TOKEN_BE: Not found")
    
    if ngrok_url:
        print(f"[PASS] NGROK_URL: {ngrok_url}")
    else:
        print("[WARN] NGROK_URL: Not set (will auto-detect)")
    
    return bool(auth_token)

def test_ngrok_api():
    """Test ngrok API connection."""
    print("\n[INFO] Testing ngrok API connection...")
    
    try:
        response = requests.get("http://localhost:4040/api/tunnels", timeout=3)
        if response.status_code == 200:
            data = response.json()
            tunnels = data.get('tunnels', [])
            
            print(f"[PASS] Ngrok API accessible")
            print(f"[INFO] Active tunnels: {len(tunnels)}")
            
            for i, tunnel in enumerate(tunnels, 1):
                proto = tunnel.get('proto', 'unknown')
                public_url = tunnel.get('public_url', 'unknown')
                config = tunnel.get('config', {})
                addr = config.get('addr', 'unknown')
                print(f"   {i}. {proto}: {public_url} -> {addr}")
            
            return True, tunnels
        else:
            print(f"[FAIL] Ngrok API error: HTTP {response.status_code}")
            return False, []
    except requests.exceptions.RequestException as e:
        print(f"[FAIL] Cannot connect to ngrok API: {e}")
        print("[INFO] This is normal if ngrok is not running")
        return False, []

def test_pyngrok():
    """Test pyngrok library."""
    print("\n[INFO] Testing pyngrok library...")
    
    auth_token = os.getenv("NGROK_AUTH_TOKEN_BE")
    if not auth_token:
        print("[FAIL] Cannot test pyngrok without auth token")
        return False
    
    try:
        # Set auth token
        ngrok.set_auth_token(auth_token)
        print("[PASS] Auth token set successfully")
        
        # Get existing tunnels
        tunnels = ngrok.get_tunnels()
        print(f"[PASS] Retrieved {len(tunnels)} existing tunnels")
        
        return True
    except Exception as e:
        print(f"[FAIL] pyngrok error: {e}")
        return False

def test_create_tunnel():
    """Test creating a tunnel (optional)."""
    print("\n[INFO] Testing tunnel creation (optional)...")
    
    auth_token = os.getenv("NGROK_AUTH_TOKEN_BE")
    if not auth_token:
        print("[FAIL] Cannot create tunnel without auth token")
        return False
    
    try:
        # Check if we should create a test tunnel
        response = input("Create a test tunnel on port 8888? (y/N): ").lower().strip()
        if response != 'y':
            print("[SKIP] Skipping tunnel creation test")
            return True
        
        print("[INFO] Creating test tunnel...")
        tunnel = ngrok.connect(8888, proto="http")
        public_url = tunnel.public_url
        
        print(f"[PASS] Test tunnel created: {public_url}")
        print("[INFO] You can test it by visiting the URL")
        
        # Clean up
        input("Press Enter to close the test tunnel...")
        ngrok.disconnect(public_url)
        print("[PASS] Test tunnel closed")
        
        return True
    except Exception as e:
        print(f"[FAIL] Tunnel creation error: {e}")
        return False

def main():
    """Main test function."""
    print("=" * 50)
    print("NGROK CONFIGURATION TEST")
    print("=" * 50)
    
    # Test 1: Environment variables
    env_ok = test_environment()
    
    # Test 2: Ngrok API
    api_ok, tunnels = test_ngrok_api()
    
    # Test 3: pyngrok library
    pyngrok_ok = test_pyngrok() if env_ok else False
    
    # Test 4: Create tunnel (optional)
    if env_ok and pyngrok_ok:
        test_create_tunnel()
    
    # Summary
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)
    
    print(f"Environment variables: {'[PASS]' if env_ok else '[FAIL]'}")
    print(f"Ngrok API connection:  {'[PASS]' if api_ok else '[N/A]'}")
    print(f"pyngrok library:       {'[PASS]' if pyngrok_ok else '[FAIL]'}")
    
    if env_ok and pyngrok_ok:
        print("\n[SUCCESS] Ngrok setup looks good!")
        print("[INFO] You can now run: python run.py")
    else:
        print("\n[WARNING] Issues found. Please check:")
        if not env_ok:
            print("   - Add NGROK_AUTH_TOKEN_BE to .env file")
        if not pyngrok_ok:
            print("   - Verify your ngrok auth token")
            print("   - Check internet connection")
    
    print("\n[INFO] For more help, see: NGROK_SETUP.md")

if __name__ == "__main__":
    main()