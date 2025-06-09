"""
Schema validation for chat-related API requests.
"""

from marshmallow import Schema, fields, validate, ValidationError, validates, validates_schema
from typing import Dict, List, Optional, Any, Union

class MessageSchema(Schema):
    """Schema for chat message."""
    role = fields.String(required=True, validate=validate.OneOf(["user", "assistant", "system"]))
    content = fields.String(required=True)

class ChatSchema(Schema):
    """Schema for chat requests."""
    messages = fields.List(fields.Nested(MessageSchema), required=True)
    system = fields.String(missing=None)
    model_id = fields.String(missing=None)

class StreamChatSchema(Schema):
    """Schema for streaming chat requests."""
    message = fields.String(required=True)
    model_id = fields.String(required=True)

class ConversationSchema(Schema):
    """Schema for conversation operations."""
    title = fields.String(missing="New Conversation")
    user_id = fields.String(missing=None)

def validate_request(data: Dict[str, Any], schema_class: Schema) -> Dict[str, Any]:
    """
    Validate request data against a schema.
    
    Args:
        data: Request data
        schema_class: Schema class to validate against
        
    Returns:
        Validated data
        
    Raises:
        ValidationError: If validation fails
    """
    schema = schema_class()
    return schema.load(data)