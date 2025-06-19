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

@auth_bp.route('/activate', methods=['GET'])
def activate_account():
    """Activate user account using token from email link."""
    token = request.args.get('token')
    
    if not token:
        return """
        <html>
        <head>
            <title>Lỗi kích hoạt</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .error { color: #d32f2f; }
            </style>
        </head>
        <body>
            <h2 class="error">Lỗi kích hoạt tài khoản</h2>
            <p>Token kích hoạt không hợp lệ.</p>
        </body>
        </html>
        """, 400
    
    # Activate user
    success, message = auth_manager.activate_user(token)
    
    if success:
        # Redirect to login page with success message
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
        return f"""
        <html>
        <head>
            <title>Kích hoạt thành công</title>
            <style>
                body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; }}
                .success {{ color: #4CAF50; }}
                .button {{ display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <h2 class="success">Kích hoạt tài khoản thành công!</h2>
            <p>{message}</p>
            <p>Bạn có thể đăng nhập ngay bây giờ.</p>
            <a href="{frontend_url}/login" class="button">Đăng nhập</a>
            <script>
                // Auto redirect after 3 seconds
                setTimeout(function() {{
                    window.location.href = '{frontend_url}/login';
                }}, 3000);
            </script>
        </body>
        </html>
        """
    else:
        return f"""
        <html>
        <head>
            <title>Lỗi kích hoạt</title>
            <style>
                body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; }}
                .error {{ color: #d32f2f; }}
            </style>
        </head>
        <body>
            <h2 class="error">Lỗi kích hoạt tài khoản</h2>
            <p>{message}</p>
        </body>
        </html>
        """, 400

@auth_bp.route('/resend-activation', methods=['POST'])
def resend_activation():
    """Resend activation email."""
    data = request.json
    if not data or not data.get('email'):
        return jsonify({
            'success': False,
            'message': 'Email là bắt buộc'
        }), 400
    
    email = data.get('email')
    
    # Find user by email
    from .auth_models import User
    user = User.query.filter_by(email=email).first()
    
    if not user:
        # For security, don't reveal if email doesn't exist
        return jsonify({
            'success': True,
            'message': 'Nếu email tồn tại và chưa được kích hoạt, email kích hoạt sẽ được gửi lại.'
        }), 200
    
    if user.is_active == 1:
        return jsonify({
            'success': False,
            'message': 'Tài khoản đã được kích hoạt'
        }), 400
    
    if user.is_active == -1:
        return jsonify({
            'success': False,
            'message': 'Tài khoản không tồn tại'
        }), 400
    
    # Check throttling
    should_resend = auth_manager._should_resend_activation_email(user)
    if not should_resend:
        return jsonify({
            'success': False,
            'message': 'Vui lòng đợi 5 phút trước khi yêu cầu gửi lại email kích hoạt'
        }), 429
    
    # Resend activation email
    try:
        auth_manager._resend_activation_email(user)
        return jsonify({
            'success': True,
            'message': 'Email kích hoạt đã được gửi lại'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Có lỗi xảy ra khi gửi email'
        }), 500

@auth_bp.route('/update-active', methods=['POST'])
@token_required
def update_active_status():
    """Update user active status (admin only)."""
    # Check if user is admin
    if not request.user.get('is_admin', False):
        return jsonify({
            'success': False,
            'message': 'Không có quyền truy cập'
        }), 403
    
    data = request.json
    if not data:
        return jsonify({
            'success': False,
            'message': 'Dữ liệu không hợp lệ'
        }), 400
    
    user_id = data.get('user_id')
    status = data.get('status')
    
    if not user_id or status is None:
        return jsonify({
            'success': False,
            'message': 'Thiếu user_id hoặc status'
        }), 400
    
    # Update active status
    success, message = auth_manager.update_active_status(user_id, status)
    
    if success:
        return jsonify({
            'success': True,
            'message': message
        }), 200
    else:
        return jsonify({
            'success': False,
            'message': message
        }), 400