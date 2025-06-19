"""
Flask backend for LLaMA-Factory fine-tuning and inference.
"""

import os
from flask import Flask
from flask_cors import CORS

from .database import DatabaseConfig, db
from .mail_config import MailConfig, mail
from .config import current_config

# Initialize extensions
db_config = DatabaseConfig()
mail_config = MailConfig()

def create_app(config_name=None):
    """Create and configure the Flask application."""
    app = Flask(__name__, instance_relative_config=True)
    
    # Determine which configuration to use
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    # Load configuration
    from .config import config
    app_config = config.get(config_name, config['default'])
    app_config.init_app(app)
    
    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
      # Initialize CORS with specific settings
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://localhost:3000", "https://d15f-35-232-143-151.ngrok-free.app", "https://c790-171-247-78-59.ngrok-free.app", "*"],  # Allow all origins for development
            "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization", "Accept", "ngrok-skip-browser-warning"],
            "expose_headers": ["Content-Type", "Access-Control-Allow-Origin", "Access-Control-Allow-Methods", "Access-Control-Allow-Headers"],
            "supports_credentials": True
        }
    })

    # Initialize database
    db_config.init_app(app)
    
    # Initialize mail
    mail_config.init_app(app)
    
    # Import and register blueprints
    from .routes import api_bp
    from .auth_routes import auth_bp
    from .admin_routes import admin_bp
    
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Import all models to ensure they are registered with SQLAlchemy
    from .auth_models import User, PasswordResetToken, ActivationToken
    from .models.conversation import Conversation, Message
    from .models.finetune import FinetuningTask
    from .models.model import ModelConfig
    
    # Create database tables
    with app.app_context():
        db.create_all()
        app.logger.info("Database tables created successfully")
    
    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint."""
        return {'status': 'ok', 'version': '1.0.0'}, 200
    
    # Serve static files
    from flask import send_from_directory
    
    @app.route('/static/<path:filename>')
    def serve_static(filename):
        """Serve static files."""
        static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'static')
        return send_from_directory(static_folder, filename)
    
    @app.route('/finetune-form')
    def finetune_form():
        """Serve the fine-tuning form."""
        return send_from_directory(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'static'), 'finetune_form.html')
    
    @app.route('/auto-finetune')
    def auto_finetune():
        """Serve the auto fine-tuning form."""
        return send_from_directory(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'static'), 'auto_finetune.html')
    
    return app