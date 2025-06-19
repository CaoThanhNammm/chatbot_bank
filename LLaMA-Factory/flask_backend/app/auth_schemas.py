"""
Schema validation for authentication API requests.
"""

from marshmallow import Schema, fields, validate, validates, validates_schema, ValidationError
import re

def validate_strong_password(password):
    """Validate password strength."""
    errors = []
    
    if len(password) < 8:
        errors.append('Mật khẩu phải có ít nhất 8 ký tự')
    
    if not re.search(r'[a-z]', password):
        errors.append('Phải có ít nhất 1 chữ cái thường')
    
    if not re.search(r'[A-Z]', password):
        errors.append('Phải có ít nhất 1 chữ cái hoa')
    
    if not re.search(r'\d', password):
        errors.append('Phải có ít nhất 1 số')
    
    if not re.search(r'[@$!%*?&]', password):
        errors.append('Phải có ít nhất 1 ký tự đặc biệt (@$!%*?&)')
    
    if errors:
        raise ValidationError('; '.join(errors))

class RegisterSchema(Schema):
    """Schema for user registration requests."""
    username = fields.String(
        required=True, 
        validate=validate.Length(min=3, max=50),
        error_messages={
            'required': 'Tên đăng nhập là bắt buộc',
            'invalid': 'Tên đăng nhập không hợp lệ'
        }
    )
    email = fields.Email(
        required=True,
        error_messages={
            'required': 'Email là bắt buộc',
            'invalid': 'Email không hợp lệ'
        }
    )
    password = fields.String(
        required=True, 
        validate=validate_strong_password,
        error_messages={
            'required': 'Mật khẩu là bắt buộc',
            'invalid': 'Mật khẩu không hợp lệ'
        }
    )
    confirm_password = fields.String(
        required=True,
        error_messages={
            'required': 'Xác nhận mật khẩu là bắt buộc',
            'invalid': 'Xác nhận mật khẩu không hợp lệ'
        }
    )
    first_name = fields.String(
        validate=validate.Length(max=50),
        error_messages={'invalid': 'Tên không hợp lệ'}
    )
    last_name = fields.String(
        validate=validate.Length(max=50),
        error_messages={'invalid': 'Họ không hợp lệ'}
    )
    
    @validates_schema
    def validate_passwords_match(self, data, **kwargs):
        """Validate that passwords match."""
        if data.get('password') != data.get('confirm_password'):
            raise ValidationError('Mật khẩu xác nhận không khớp', 'confirm_password')

class LoginSchema(Schema):
    """Schema for user login requests."""
    username_or_email = fields.String(required=True)
    password = fields.String(required=True)
    remember_me = fields.Boolean(missing=False)

class ChangePasswordSchema(Schema):
    """Schema for change password requests."""
    current_password = fields.String(required=True)
    new_password = fields.String(required=True, validate=validate_strong_password)
    confirm_password = fields.String(required=True)
    
    @validates_schema
    def validate_passwords_match(self, data, **kwargs):
        """Validate that passwords match."""
        if data.get('new_password') != data.get('confirm_password'):
            raise ValidationError('Passwords do not match', 'confirm_password')
        
        if data.get('current_password') == data.get('new_password'):
            raise ValidationError('New password must be different from current password', 'new_password')

class ForgotPasswordSchema(Schema):
    """Schema for forgot password requests."""
    email = fields.Email(required=True)

class ResetPasswordSchema(Schema):
    """Schema for reset password requests."""
    token = fields.String(required=True)
    new_password = fields.String(required=True, validate=validate_strong_password)
    confirm_password = fields.String(required=True)
    
    @validates_schema
    def validate_passwords_match(self, data, **kwargs):
        """Validate that passwords match."""
        if data.get('new_password') != data.get('confirm_password'):
            raise ValidationError('Passwords do not match', 'confirm_password')