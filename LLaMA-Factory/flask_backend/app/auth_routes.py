"""
Authentication routes for the Flask backend.
"""

from flask import Blueprint, request, jsonify, current_app
from marshmallow import ValidationError
from functools import wraps

from .auth_manager import auth_manager
from .auth_schemas import (
    RegisterSchema, 
    LoginSchema, 
    ChangePasswordSchema, 
    ForgotPasswordSchema,
    ResetPasswordSchema
)

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    """Decorator to check if token is valid."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check if token is in headers
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({
                'success': False,
                'message': 'Token is missing'
            }), 401
        
        # Verify token
        is_valid, user_data = auth_manager.verify_token(token)
        if not is_valid or not user_data:
            return jsonify({
                'success': False,
                'message': 'Token is invalid or expired'
            }), 401
        
        # Add user data to request
        request.user = user_data
        
        return f(*args, **kwargs)
    
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    # Validate request data
    try:
        data = RegisterSchema().load(request.json)
    except ValidationError as e:
        return jsonify({
            'success': False,
            'message': 'Validation error',
            'errors': e.messages
        }), 400
    
    # Register user
    success, message, user_data = auth_manager.register(
        username=data['username'],
        email=data['email'],
        password=data['password'],
        first_name=data.get('first_name'),
        last_name=data.get('last_name')
    )
    
    if not success:
        return jsonify({
            'success': False,
            'message': message
        }), 400
    
    return jsonify({
        'success': True,
        'message': message,
        'user': user_data
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a user."""
    # Validate request data
    try:
        data = LoginSchema().load(request.json)
    except ValidationError as e:
        return jsonify({
            'success': False,
            'message': 'Validation error',
            'errors': e.messages
        }), 400
    
    # Login user
    success, message, auth_data = auth_manager.login(
        username_or_email=data['username_or_email'],
        password=data['password']
    )
    
    if not success:
        return jsonify({
            'success': False,
            'message': message
        }), 401
    
    return jsonify({
        'success': True,
        'message': message,
        'data': auth_data
    }), 200

@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password():
    """Change user password."""
    # Validate request data
    try:
        data = ChangePasswordSchema().load(request.json)
    except ValidationError as e:
        return jsonify({
            'success': False,
            'message': 'Validation error',
            'errors': e.messages
        }), 400
    
    # Change password
    success, message = auth_manager.change_password(
        user_id=request.user['id'],
        current_password=data['current_password'],
        new_password=data['new_password']
    )
    
    if not success:
        return jsonify({
            'success': False,
            'message': message
        }), 400
    
    return jsonify({
        'success': True,
        'message': message
    }), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Initiate forgot password process."""
    # Validate request data
    try:
        data = ForgotPasswordSchema().load(request.json)
    except ValidationError as e:
        return jsonify({
            'success': False,
            'message': 'Validation error',
            'errors': e.messages
        }), 400
    
    # Process forgot password request
    success, message = auth_manager.forgot_password(
        email=data['email']
    )
    
    # Always return success for security reasons
    return jsonify({
        'success': True,
        'message': 'If the email exists, a password reset link has been sent'
    }), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset user password using token."""
    # Validate request data
    try:
        data = ResetPasswordSchema().load(request.json)
    except ValidationError as e:
        return jsonify({
            'success': False,
            'message': 'Validation error',
            'errors': e.messages
        }), 400
    
    # Reset password
    success, message = auth_manager.reset_password(
        token=data['token'],
        new_password=data['new_password']
    )
    
    if not success:
        return jsonify({
            'success': False,
            'message': message
        }), 400
    
    return jsonify({
        'success': True,
        'message': message
    }), 200

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_user_profile():
    """Get current user profile."""
    return jsonify({
        'success': True,
        'user': request.user
    }), 200