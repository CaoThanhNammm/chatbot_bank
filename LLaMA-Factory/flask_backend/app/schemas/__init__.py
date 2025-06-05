"""
Schemas package for the Flask backend.
"""

# Import auth schemas
from .auth_schemas import (
    RegisterSchema,
    LoginSchema,
    ChangePasswordSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema
)

# Import model schemas
from .model_schemas import (
    FinetuningSchema,
    ModelLoadSchema,
    ModelUnloadSchema,
    ModelUpdateActiveSchema,
    ChooseModelSchema
)

# Import chat schemas
from .chat_schemas import (
    MessageSchema,
    ChatSchema,
    StreamChatSchema,
    ConversationSchema,
    validate_request
)

# Re-export all schemas
__all__ = [
    # Auth schemas
    'RegisterSchema',
    'LoginSchema',
    'ChangePasswordSchema',
    'ForgotPasswordSchema',
    'ResetPasswordSchema',
    
    # Model schemas
    'FinetuningSchema',
    'ModelLoadSchema',
    'ModelUnloadSchema',
    'ModelUpdateActiveSchema',
    'ChooseModelSchema',
    
    # Chat schemas
    'MessageSchema',
    'ChatSchema',
    'StreamChatSchema',
    'ConversationSchema',
    'validate_request'
]