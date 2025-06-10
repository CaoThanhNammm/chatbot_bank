import os
import subprocess
import time
from dotenv import load_dotenv
import requests
import json

# Load environment variables
load_dotenv()

def setup_ngrok_for_mysql():
    """
    Set up ngrok tunnel for MySQL connection from Colab/Kaggle to local MySQL
    """
    # Get ngrok auth token from .env
    ngrok_token = os.getenv('NGROK_AUTH_TOKEN')
    
    if not ngrok_token:
        raise ValueError("NGROK_AUTH_TOKEN not found in .env file")
    
    print("Setting up ngrok for MySQL connection...")
    
    # Install ngrok if not already installed
    try:
        subprocess.run(["ngrok", "--version"], check=True, capture_output=True)
        print("ngrok is already installed")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Installing ngrok...")
        !pip install pyngrok
        from pyngrok import ngrok, conf
        conf.get_default().auth_token = ngrok_token
    
    # Start ngrok tunnel for MySQL
    from pyngrok import ngrok, conf
    conf.get_default().auth_token = ngrok_token
    
    # Kill any existing ngrok processes
    ngrok.kill()
    
    # Start a new tunnel for MySQL
    mysql_tunnel = ngrok.connect(3306, "tcp")
    print(f"MySQL tunnel established: {mysql_tunnel}")
    
    # Extract the public URL and port
    # Format is typically: tcp://X.X.X.X:YYYY
    public_url = mysql_tunnel.public_url
    parts = public_url.replace("tcp://", "").split(":")
    host = parts[0]
    port = int(parts[1])
    
    print(f"MySQL is now accessible at: {host}:{port}")
    
    # Update the environment variables for the current session
    os.environ['DB_HOST'] = host
    os.environ['DB_PORT'] = str(port)
    
    # Return the connection details
    return {
        'host': host,
        'port': port,
        'user': os.getenv('DB_USER'),
        'password': os.getenv('DB_PASSWORD'),
        'database': os.getenv('DB_NAME')
    }

def test_mysql_connection(connection_details):
    """
    Test the MySQL connection using the provided details
    """
    try:
        import pymysql
        conn = pymysql.connect(
            host=connection_details['host'],
            port=connection_details['port'],
            user=connection_details['user'],
            password=connection_details['password'],
            database=connection_details['database']
        )
        print("MySQL connection successful!")
        conn.close()
        return True
    except Exception as e:
        print(f"MySQL connection failed: {e}")
        return False

if __name__ == "__main__":
    # Set up ngrok for MySQL
    connection_details = setup_ngrok_for_mysql()
    
    # Test the connection
    test_mysql_connection(connection_details)
    
    print("\nTo use these connection details in your Flask app, add the following code:")
    print("import os")
    print("os.environ['DB_HOST'] = '" + connection_details['host'] + "'")
    print("os.environ['DB_PORT'] = '" + str(connection_details['port']) + "'")
    
    # Keep the script running to maintain the tunnel
    print("\nKeeping the tunnel open. Press Ctrl+C to stop.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Shutting down ngrok tunnel...")
        from pyngrok import ngrok
        ngrok.kill()