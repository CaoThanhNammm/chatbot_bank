"""
Ngrok Helper Script
Utility script to manage ngrok tunnels for development.
"""

import os
import subprocess
import requests
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_ngrok_status():
    """Check if ngrok is running and show tunnel info."""
    try:
        response = requests.get("http://localhost:4040/api/tunnels", timeout=3)
        if response.status_code == 200:
            data = response.json()
            tunnels = data.get('tunnels', [])
            
            if not tunnels:
                print("🟡 Ngrok is running but no tunnels are active")
                return False
            
            print("✅ Active ngrok tunnels:")
            for tunnel in tunnels:
                proto = tunnel.get('proto', 'unknown')
                public_url = tunnel.get('public_url', 'unknown')
                config = tunnel.get('config', {})
                addr = config.get('addr', 'unknown')
                print(f"   {proto}: {public_url} -> {addr}")
            return True
        else:
            print("🔴 Ngrok API not responding")
            return False
    except requests.exceptions.RequestException:
        print("🔴 Ngrok is not running (API not accessible)")
        return False

def kill_ngrok():
    """Kill all ngrok processes."""
    try:
        print("🔄 Killing ngrok processes...")
        
        if os.name == 'nt':  # Windows
            result = subprocess.run(['taskkill', '/f', '/im', 'ngrok.exe'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                print("✅ Ngrok processes killed")
            else:
                print("⚠️  No ngrok processes found to kill")
        else:  # Unix-like systems
            result = subprocess.run(['pkill', '-f', 'ngrok'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                print("✅ Ngrok processes killed")
            else:
                print("⚠️  No ngrok processes found to kill")
                
    except Exception as e:
        print(f"❌ Error killing ngrok: {e}")

def start_ngrok_manual(port=5000):
    """Start ngrok manually for the specified port."""
    auth_token = os.getenv("NGROK_AUTH_TOKEN_BE")
    
    if not auth_token:
        print("❌ NGROK_AUTH_TOKEN_BE not found in .env file")
        print("💡 Please add your ngrok auth token to .env file")
        print("   Get token from: https://dashboard.ngrok.com/get-started/your-authtoken")
        return False
    
    try:
        print(f"🚀 Starting ngrok tunnel for port {port}...")
        print("💡 This will run in the background. Use Ctrl+C to stop.")
        
        # Start ngrok with auth token
        cmd = ['ngrok', 'http', str(port), '--authtoken', auth_token]
        subprocess.run(cmd)
        
    except KeyboardInterrupt:
        print("\n🛑 Ngrok stopped by user")
    except FileNotFoundError:
        print("❌ Ngrok not found. Please install ngrok:")
        print("   Download from: https://ngrok.com/download")
    except Exception as e:
        print(f"❌ Error starting ngrok: {e}")

def main():
    """Main function to handle command line arguments."""
    if len(sys.argv) < 2:
        print("Ngrok Helper - Usage:")
        print("  python ngrok_helper.py status   - Check ngrok status")
        print("  python ngrok_helper.py kill     - Kill all ngrok processes")
        print("  python ngrok_helper.py start    - Start ngrok for port 5000")
        print("  python ngrok_helper.py start <port> - Start ngrok for specific port")
        return
    
    command = sys.argv[1].lower()
    
    if command == 'status':
        check_ngrok_status()
    elif command == 'kill':
        kill_ngrok()
    elif command == 'start':
        port = 5000
        if len(sys.argv) > 2:
            try:
                port = int(sys.argv[2])
            except ValueError:
                print("❌ Invalid port number")
                return
        start_ngrok_manual(port)
    else:
        print(f"❌ Unknown command: {command}")
        print("Available commands: status, kill, start")

if __name__ == "__main__":
    main()