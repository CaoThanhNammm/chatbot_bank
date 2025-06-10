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
    without Docker
    """
    # Get ngrok auth token from .env
    ngrok_token = os.getenv('NGROK_AUTH_TOKEN')
    
    if not ngrok_token:
        raise ValueError("NGROK_AUTH_TOKEN not found in .env file")
    
    print("Setting up ngrok for MySQL connection (non-Docker setup)...")
    
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
    
    # Get MySQL port from .env or use default
    mysql_port = int(os.getenv('DB_PORT', 3306))
    
    # Start a new tunnel for MySQL
    mysql_tunnel = ngrok.connect(mysql_port, "tcp")
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

def setup_mysql_for_remote_access():
    """
    Configure MySQL to accept remote connections
    Note: This requires MySQL to be installed locally and accessible
    """
    print("Checking MySQL configuration for remote access...")
    
    try:
        import pymysql
        
        # Connect to MySQL
        conn = pymysql.connect(
            host='localhost',
            port=int(os.getenv('DB_PORT', 3306)),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD')
        )
        
        cursor = conn.cursor()
        
        # Check if the user already has remote access
        cursor.execute("SELECT Host, User FROM mysql.user WHERE User = %s", (os.getenv('DB_USER'),))
        hosts = [row[0] for row in cursor.fetchall()]
        
        if '%' in hosts:
            print(f"User '{os.getenv('DB_USER')}' already has remote access configured.")
        else:
            # Create user with remote access if not exists
            print(f"Configuring remote access for user '{os.getenv('DB_USER')}'...")
            cursor.execute(f"CREATE USER IF NOT EXISTS '{os.getenv('DB_USER')}'@'%' IDENTIFIED BY '{os.getenv('DB_PASSWORD')}'")
            cursor.execute(f"GRANT ALL PRIVILEGES ON *.* TO '{os.getenv('DB_USER')}'@'%' WITH GRANT OPTION")
            cursor.execute("FLUSH PRIVILEGES")
            print("Remote access configured successfully.")
        
        # Check if bind-address is set to allow remote connections
        cursor.execute("SHOW VARIABLES LIKE 'bind_address'")
        bind_address = cursor.fetchone()[1]
        
        if bind_address == '*' or bind_address == '0.0.0.0':
            print("MySQL is configured to accept connections from any IP.")
        else:
            print(f"Warning: MySQL bind_address is set to '{bind_address}'.")
            print("To allow remote connections, you may need to modify your MySQL configuration:")
            print("1. Edit your my.cnf or my.ini file")
            print("2. Set bind-address = 0.0.0.0")
            print("3. Restart MySQL service")
        
        conn.close()
        return True
    except Exception as e:
        print(f"Error configuring MySQL for remote access: {e}")
        print("You may need to manually configure MySQL to accept remote connections.")
        return False

if __name__ == "__main__":
    # Configure MySQL for remote access
    setup_mysql_for_remote_access()
    
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