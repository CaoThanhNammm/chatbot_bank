# Colab/Kaggle setup script for Flask backend with MySQL on local machine
# Run this in a Colab/Kaggle notebook

# Install required packages
!pip install flask flask-sqlalchemy flask-cors pymysql python-dotenv pyngrok

# Clone the repository (if needed)
# !git clone https://your-repo-url.git
# %cd your-repo-directory

# Upload your .env file to Colab/Kaggle or create it
# with the following content (replace with your actual values):
"""
# Flask Configuration
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
FLASK_ENV=development
FLASK_DEBUG=1

# Database Configuration
DB_HOST=localhost  # This will be overridden by ngrok
DB_PORT=3306       # This will be overridden by ngrok
DB_USER=root
DB_PASSWORD=123
DB_NAME=llama_factory

# Email Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USE_SSL=False
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216  # 16MB

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=app.log

# Ngrok Configuration
NGROK_AUTH_TOKEN=your-ngrok-auth-token
"""

# Import the setup script
from colab_setup import setup_ngrok_for_mysql

# Set up ngrok for MySQL connection
connection_details = setup_ngrok_for_mysql()

# Now you can run your Flask app
# The app will use the environment variables set by the setup script
# to connect to your local MySQL through ngrok

# Import your Flask app
from app import app

# Run the app with ngrok
from pyngrok import ngrok

# Start ngrok for the Flask app
public_url = ngrok.connect(5000)
print(f"Flask app is accessible at: {public_url}")

# Run the Flask app
app.run(host='0.0.0.0', port=5000)