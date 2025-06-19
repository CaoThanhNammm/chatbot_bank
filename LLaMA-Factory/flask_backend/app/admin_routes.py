"""
Admin routes for the Flask backend.
"""

from flask import Blueprint, request, jsonify
from functools import wraps
from datetime import datetime

from .auth_models import User
from .auth_manager import auth_manager
from .database import db

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    """Decorator to check if user is admin."""
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
        
        # Check if user is admin
        if not user_data.get('is_admin', False):
            return jsonify({
                'success': False,
                'message': 'Admin access required'
            }), 403
        
        # Add user data to request
        request.user = user_data
        
        return f(*args, **kwargs)
    
    return decorated

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    """Get all users (admin only)."""
    try:
        # Query all users
        users = User.query.all()
        
        # Format user data
        users_data = []
        for user in users:
            # Determine status based on is_active
            if user.is_active == 1:
                status = 'active'
            elif user.is_active == -1:
                status = 'inactive'  # Khóa tài khoản
            else:  # 0
                status = 'deleted'
            
            # Format name
            name = f"{user.first_name or ''} {user.last_name or ''}".strip()
            if not name:
                name = user.username
            
            user_data = {
                'id': user.id,
                'name': name,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'username': user.username,
                'status': status,
                'is_active': user.is_active,
                'is_admin': user.is_admin,
                'role': 'admin' if user.is_admin else 'user',
                'department': None,  # Add department field if needed later
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'updated_at': user.updated_at.isoformat() if user.updated_at else None,
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'lastLogin': user.last_login  # For compatibility with existing UI
            }
            users_data.append(user_data)
        
        return jsonify({
            'success': True,
            'data': users_data,
            'total': len(users_data)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error retrieving users: {str(e)}'
        }), 500

@admin_bp.route('/users', methods=['POST'])
@admin_required
def create_user():
    """Create new user (admin only)."""
    try:
        data = request.json
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        # Validation
        if not data.get('name') or not data['name'].strip():
            return jsonify({
                'success': False,
                'message': 'Name is required'
            }), 400
        
        if not data.get('email') or not data['email'].strip():
            return jsonify({
                'success': False,
                'message': 'Email is required'
            }), 400
        
        if not data.get('password') or not data['password'].strip():
            return jsonify({
                'success': False,
                'message': 'Password is required'
            }), 400
        
        # Strong password validation
        password = data['password']
        password_errors = []
        
        if len(password) < 8:
            password_errors.append('Mật khẩu phải có ít nhất 8 ký tự')
        
        import re
        if not re.search(r'[a-z]', password):
            password_errors.append('Phải có ít nhất 1 chữ cái thường')
        
        if not re.search(r'[A-Z]', password):
            password_errors.append('Phải có ít nhất 1 chữ cái hoa')
        
        if not re.search(r'\d', password):
            password_errors.append('Phải có ít nhất 1 số')
        
        if not re.search(r'[@$!%*?&]', password):
            password_errors.append('Phải có ít nhất 1 ký tự đặc biệt (@$!%*?&)')
        
        if password_errors:
            return jsonify({
                'success': False,
                'message': '; '.join(password_errors)
            }), 400
        
        # Check if email already exists
        existing_user = User.query.filter_by(email=data['email'].strip()).first()
        if existing_user:
            return jsonify({
                'success': False,
                'message': 'Email already exists'
            }), 400
        
        # Split name into first_name and last_name
        name_parts = data['name'].strip().split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Create username from email
        username = data['email'].split('@')[0]
        
        # Create new user
        new_user = User(
            username=username,
            email=data['email'].strip(),
            first_name=first_name,
            last_name=last_name,
            is_admin=data.get('role') == 'admin',
            is_active=1,  # Active by default
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Set password from request
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.commit()
        
        # Return created user data
        name = f"{new_user.first_name or ''} {new_user.last_name or ''}".strip()
        if not name:
            name = new_user.username
        
        user_data = {
            'id': new_user.id,
            'name': name,
            'first_name': new_user.first_name,
            'last_name': new_user.last_name,
            'email': new_user.email,
            'username': new_user.username,
            'status': 'active',
            'is_active': new_user.is_active,
            'is_admin': new_user.is_admin,
            'role': 'admin' if new_user.is_admin else 'user',
            'created_at': new_user.created_at.isoformat() if new_user.created_at else None,
            'updated_at': new_user.updated_at.isoformat() if new_user.updated_at else None,
            'last_login': None,
            'lastLogin': None
        }
        
        return jsonify({
            'success': True,
            'message': 'User created successfully',
            'data': user_data
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error creating user: {str(e)}'
        }), 500

@admin_bp.route('/users/<user_id>', methods=['GET'])
@admin_required
def get_user(user_id):
    """Get specific user (admin only)."""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Determine status based on is_active
        if user.is_active == 1:
            status = 'active'
        elif user.is_active == -1:
            status = 'inactive'  # Khóa tài khoản
        else:  # 0
            status = 'deleted'
        
        # Format name
        name = f"{user.first_name or ''} {user.last_name or ''}".strip()
        if not name:
            name = user.username
        
        user_data = {
            'id': user.id,
            'name': name,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'username': user.username,
            'status': status,
            'is_active': user.is_active,
            'is_admin': user.is_admin,
            'role': 'admin' if user.is_admin else 'user',
            'department': None,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'updated_at': user.updated_at.isoformat() if user.updated_at else None,
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'lastLogin': user.last_login
        }
        
        return jsonify({
            'success': True,
            'data': user_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error retrieving user: {str(e)}'
        }), 500

@admin_bp.route('/users/<user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """Update user (admin only)."""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        data = request.json
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        # Validation
        if 'name' in data:
            if not data['name'] or not data['name'].strip():
                return jsonify({
                    'success': False,
                    'message': 'Name is required'
                }), 400
            
            # Split name into first_name and last_name
            name_parts = data['name'].strip().split(' ', 1)
            user.first_name = name_parts[0]
            user.last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        if 'email' in data:
            if not data['email'] or not data['email'].strip():
                return jsonify({
                    'success': False,
                    'message': 'Email is required'
                }), 400
            
            # Check if email already exists (excluding current user)
            existing_user = User.query.filter(
                User.email == data['email'].strip(),
                User.id != user_id
            ).first()
            
            if existing_user:
                return jsonify({
                    'success': False,
                    'message': 'Email already exists'
                }), 400
            
            user.email = data['email'].strip()
        
        if 'role' in data:
            if data['role'] == 'admin':
                user.is_admin = True
            else:
                user.is_admin = False
        
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        # Return updated user data
        # Determine status based on is_active
        if user.is_active == 1:
            status = 'active'
        elif user.is_active == -1:
            status = 'inactive'
        else:  # 0
            status = 'deleted'
        
        # Format name
        name = f"{user.first_name or ''} {user.last_name or ''}".strip()
        if not name:
            name = user.username
        
        updated_user_data = {
            'id': user.id,
            'name': name,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'username': user.username,
            'status': status,
            'is_active': user.is_active,
            'is_admin': user.is_admin,
            'role': 'admin' if user.is_admin else 'user',
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'updated_at': user.updated_at.isoformat() if user.updated_at else None,
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'lastLogin': user.last_login
        }
        
        return jsonify({
            'success': True,
            'message': 'User updated successfully',
            'data': updated_user_data
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error updating user: {str(e)}'
        }), 500

@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Delete user (admin only)."""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Soft delete by setting is_active to -1
        user.is_active = -1
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error deleting user: {str(e)}'
        }), 500

@admin_bp.route('/users/<user_id>/activate', methods=['POST'])
@admin_required
def activate_user(user_id):
    """Activate user (admin only)."""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        user.is_active = 1
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User activated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error activating user: {str(e)}'
        }), 500

@admin_bp.route('/users/<user_id>/deactivate', methods=['POST'])
@admin_required
def deactivate_user(user_id):
    """Deactivate user (admin only)."""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        user.is_active = -1  # Cập nhật thành -1 khi khóa tài khoản
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User deactivated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error deactivating user: {str(e)}'
        }), 500