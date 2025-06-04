"""
API controller for handling API routes.
"""

from flask import Blueprint, request, jsonify
from typing import Dict, Any, List, Optional
from marshmallow import ValidationError

from ..services.model_service import model_service
from ..services.finetune_service import finetune_service
from ..services.conversation_service import conversation_service
from ..schemas import (
    FinetuningSchema,
    ModelLoadSchema,
    ModelUnloadSchema,
    ModelActivateSchema,
    ModelDeactivateSchema,
    ChatSchema,
    ConversationSchema,
    MessageSchema,
    validate_request
)

api_bp = Blueprint('api', __name__)

# Fine-tuning routes
@api_bp.route('/finetune', methods=['POST'])
def start_finetuning():
    """Start a fine-tuning task."""
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    try:
        # Validate request data
        validated_data = validate_request(data, FinetuningSchema)
        
        # Start fine-tuning
        success, message, task_id = finetune_service.start_finetuning(validated_data)
        
        if success:
            return jsonify({
                "success": True,
                "message": message,
                "task_id": task_id
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": message
            }), 400
    except ValidationError as e:
        return jsonify({
            "success": False,
            "message": "Validation error",
            "errors": e.messages
        }), 400

@api_bp.route('/finetune/status/<task_id>', methods=['GET'])
def get_finetune_status(task_id):
    """Get the status of a fine-tuning task."""
    success, message, task_info = finetune_service.get_task_status(task_id)
    
    if success:
        return jsonify({
            "success": True,
            "message": message,
            "task": task_info
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": message
        }), 404

@api_bp.route('/finetune/tasks', methods=['GET'])
def get_all_finetune_tasks():
    """Get all fine-tuning tasks."""
    tasks = finetune_service.get_all_tasks()
    
    return jsonify({
        "success": True,
        "tasks": tasks
    }), 200

@api_bp.route('/finetune/models', methods=['GET'])
def get_all_finetuned_models():
    """Get all fine-tuned models."""
    models = finetune_service.get_all_finetuned_models()
    
    return jsonify({
        "success": True,
        "models": models
    }), 200

# Model management routes
@api_bp.route('/models/load', methods=['POST'])
def load_model():
    """Load a model."""
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    try:
        # Validate request data
        validated_data = validate_request(data, ModelLoadSchema)
        
        # Load model
        success, message = model_service.load_model(
            model_name_or_path=validated_data["model_name_or_path"],
            adapter_name_or_path=validated_data["adapter_name_or_path"],
            template=validated_data["template"]
        )
        
        if success:
            return jsonify({
                "success": True,
                "message": message
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": message
            }), 400
    except ValidationError as e:
        return jsonify({
            "success": False,
            "message": "Validation error",
            "errors": e.messages
        }), 400

@api_bp.route('/models/unload', methods=['POST'])
def unload_model():
    """Unload a model."""
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    try:
        # Validate request data
        validated_data = validate_request(data, ModelUnloadSchema)
        
        # Unload model
        success, message = model_service.unload_model(
            model_name_or_path=validated_data["model_name_or_path"],
            adapter_name_or_path=validated_data["adapter_name_or_path"],
            template=validated_data["template"]
        )
        
        if success:
            return jsonify({
                "success": True,
                "message": message
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": message
            }), 400
    except ValidationError as e:
        return jsonify({
            "success": False,
            "message": "Validation error",
            "errors": e.messages
        }), 400

@api_bp.route('/models/activate', methods=['POST'])
def activate_model():
    """Activate a model for chat."""
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    try:
        # Validate request data
        validated_data = validate_request(data, ModelActivateSchema)
        
        # Activate model
        success, message = model_service.activate_model(
            model_name_or_path=validated_data["model_name_or_path"],
            adapter_name_or_path=validated_data["adapter_name_or_path"],
            template=validated_data["template"]
        )
        
        if success:
            return jsonify({
                "success": True,
                "message": message
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": message
            }), 400
    except ValidationError as e:
        return jsonify({
            "success": False,
            "message": "Validation error",
            "errors": e.messages
        }), 400

@api_bp.route('/models/deactivate', methods=['POST'])
def deactivate_model():
    """Deactivate the currently active model."""
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    try:
        # Validate request data
        validated_data = validate_request(data, ModelDeactivateSchema)
        
        # Deactivate model
        success, message = model_service.deactivate_model(
            model_name_or_path=validated_data["model_name_or_path"]
        )
        
        if success:
            return jsonify({
                "success": True,
                "message": message
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": message
            }), 400
    except ValidationError as e:
        return jsonify({
            "success": False,
            "message": "Validation error",
            "errors": e.messages
        }), 400

@api_bp.route('/models/loaded', methods=['GET'])
def get_loaded_models():
    """Get all loaded models."""
    models = model_service.get_loaded_models()
    
    return jsonify({
        "success": True,
        "models": models
    }), 200

@api_bp.route('/models/active', methods=['GET'])
def get_active_model():
    """Get the currently active model."""
    model = model_service.get_active_model()
    
    if model:
        return jsonify({
            "success": True,
            "model": model
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": "No active model"
        }), 404

# Chat routes
@api_bp.route('/chat', methods=['POST'])
def chat():
    """Generate a response using the active model."""
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    try:
        # Validate request data
        validated_data = validate_request(data, ChatSchema)
        
        # Generate response
        success, message, response = model_service.chat(
            messages=validated_data["messages"],
            system=validated_data.get("system")
        )
        
        if success:
            return jsonify({
                "success": True,
                "message": message,
                "response": response
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": message
            }), 400
    except ValidationError as e:
        return jsonify({
            "success": False,
            "message": "Validation error",
            "errors": e.messages
        }), 400

# Conversation routes
@api_bp.route('/conversations', methods=['POST'])
def create_conversation():
    """Create a new conversation."""
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    try:
        # Validate request data
        validated_data = validate_request(data, ConversationSchema)
        
        # Create conversation
        success, message, conversation_id = conversation_service.create_conversation(
            title=validated_data.get("title", "New Conversation"),
            user_id=validated_data.get("user_id")
        )
        
        if success:
            return jsonify({
                "success": True,
                "message": message,
                "conversation_id": conversation_id
            }), 201
        else:
            return jsonify({
                "success": False,
                "message": message
            }), 400
    except ValidationError as e:
        return jsonify({
            "success": False,
            "message": "Validation error",
            "errors": e.messages
        }), 400

@api_bp.route('/conversations/<conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    """Get a conversation by ID."""
    success, message, conversation = conversation_service.get_conversation(conversation_id)
    
    if success:
        return jsonify({
            "success": True,
            "message": message,
            "conversation": conversation
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": message
        }), 404

@api_bp.route('/conversations', methods=['GET'])
def get_all_conversations():
    """Get all conversations."""
    user_id = request.args.get('user_id', type=int)
    conversations = conversation_service.get_all_conversations(user_id)
    
    return jsonify({
        "success": True,
        "conversations": conversations
    }), 200

@api_bp.route('/conversations/<conversation_id>/messages', methods=['POST'])
def add_message(conversation_id):
    """Add a message to a conversation."""
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    try:
        # Validate request data
        validated_data = validate_request(data, MessageSchema)
        
        # Add message
        success, message = conversation_service.add_message(
            conversation_id=conversation_id,
            role=validated_data["role"],
            content=validated_data["content"]
        )
        
        if success:
            return jsonify({
                "success": True,
                "message": message
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": message
            }), 400
    except ValidationError as e:
        return jsonify({
            "success": False,
            "message": "Validation error",
            "errors": e.messages
        }), 400

@api_bp.route('/conversations/<conversation_id>/messages', methods=['GET'])
def get_messages(conversation_id):
    """Get all messages in a conversation."""
    success, message, messages = conversation_service.get_messages(conversation_id)
    
    if success:
        return jsonify({
            "success": True,
            "message": message,
            "messages": messages
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": message
        }), 404

@api_bp.route('/conversations/<conversation_id>/clear', methods=['POST'])
def clear_conversation(conversation_id):
    """Clear all messages in a conversation."""
    success, message = conversation_service.clear_conversation(conversation_id)
    
    if success:
        return jsonify({
            "success": True,
            "message": message
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": message
        }), 400

@api_bp.route('/conversations/<conversation_id>', methods=['DELETE'])
def delete_conversation(conversation_id):
    """Delete a conversation."""
    success, message = conversation_service.delete_conversation(conversation_id)
    
    if success:
        return jsonify({
            "success": True,
            "message": message
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": message
        }), 400