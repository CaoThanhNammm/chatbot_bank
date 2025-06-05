"""
API routes for the Flask backend.
"""

from flask import Blueprint, request, jsonify, Response
import os
import shutil
import json
import pandas as pd
from marshmallow import ValidationError

from .database import db
from .model_manager import model_manager
from .finetune_manager import finetune_manager
from .models.finetune import FinetuningTask
from .schemas import (
    FinetuningSchema,
    ModelLoadSchema,
    ModelUnloadSchema,
    ModelUpdateActiveSchema,
    ChooseModelSchema,
    StreamChatSchema,
    ChatSchema,
    validate_request
)

api_bp = Blueprint('api', __name__)

# Fine-tuning routes
@api_bp.route('/finetune', methods=['POST'])
def start_finetuning():
    """Start a fine-tuning task."""
    import os
    import uuid
    import pandas as pd
    
    # Kiểm tra nếu có file CSV được gửi lên
    if request.content_type and request.content_type.startswith('multipart/form-data'):
        if 'dataset_file' not in request.files:
            return jsonify({"success": False, "message": "No dataset file part"}), 400
            
        dataset_file = request.files['dataset_file']
        if dataset_file.filename == '':
            return jsonify({"success": False, "message": "No file selected"}), 400
        
        # Kiểm tra phần mở rộng file
        file_ext = os.path.splitext(dataset_file.filename)[1]
        if file_ext.lower() != '.csv':
            return jsonify({"success": False, "message": "Only CSV files are allowed"}), 400
        
        # Tạo thư mục tạm nếu chưa tồn tại
        temp_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "temp")
        os.makedirs(temp_dir, exist_ok=True)
        
        # Tạo tên file duy nhất
        unique_filename = str(uuid.uuid4()) + file_ext
        file_path = os.path.join(temp_dir, unique_filename)
        
        # Lưu file
        dataset_file.save(file_path)
        
        # Kiểm tra xem file CSV có cột 'question' và 'answer' không
        try:
            df = pd.read_csv(file_path)
            required_columns = ['question', 'answer']
            if not all(col in df.columns for col in required_columns):
                return jsonify({
                    "success": False, 
                    "message": f"CSV file must contain columns: {required_columns}. Found columns: {list(df.columns)}"
                }), 400
                
            # In 5 dòng đầu tiên để kiểm tra
            print("First 5 rows of uploaded CSV file:")
            print(df.head(5))
        except Exception as e:
            return jsonify({
                "success": False, 
                "message": f"Error reading CSV file: {str(e)}"
            }), 400
        
        # Lấy dữ liệu form
        data = request.form.to_dict()
        data['dataset'] = file_path  # Thay thế dataset bằng đường dẫn đến file CSV
    else:
        # Xử lý như trước nếu không có file
        data = request.json
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400
    
    try:
        # Validate request data
        validated_data = validate_request(data, FinetuningSchema)
        
        # Start fine-tuning
        success, message, task_id = finetune_manager.start_finetuning(validated_data)
        
        if success:
            # Lấy process_id từ task mới tạo
            task = db.session.query(FinetuningTask).filter_by(id=task_id).first()
            process_id = task.process_id if task else None
            
            return jsonify({
                "success": True,
                "message": message,
                "task_id": task_id,
                "process_id": process_id
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

@api_bp.route('/finetune/status/<process_id>', methods=['GET'])
def get_finetune_status(process_id):
    """Get the status of a fine-tuning task."""
    success, message, task_info = finetune_manager.get_task_status(process_id)
    
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
    tasks = finetune_manager.get_all_tasks()
    
    return jsonify({
        "success": True,
        "tasks": tasks
    }), 200

@api_bp.route('/finetune/models', methods=['GET'])
def get_all_finetuned_models():
    """Get all fine-tuned models."""
    models = finetune_manager.get_all_finetuned_models()
    
    return jsonify({
        "success": True,
        "models": models
    }), 200

# Model management routes
@api_bp.route('/models/load', methods=['POST'])
def load_model():
    """Load a model from a completed fine-tuning task."""
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    try:
        # Validate request data
        validated_data = validate_request(data, ModelLoadSchema)
        
        # Load model
        success, message = model_manager.load_model(
            task_id=validated_data["task_id"]
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
    """Unload a model by model ID."""
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    try:
        # Validate request data
        validated_data = validate_request(data, ModelUnloadSchema)
        
        # Unload model
        success, message = model_manager.unload_model(
            model_id=validated_data["model_id"]
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

@api_bp.route('/models/update-active', methods=['POST'])
def update_model_active_status():
    """Update the active status of a model."""
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    try:
        # Validate request data
        validated_data = validate_request(data, ModelUpdateActiveSchema)
        
        # Update model active status
        success, message = model_manager.update_model_active_status(
            model_id=validated_data["model_id"],
            is_active=validated_data["is_active"]
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

# Legacy routes have been removed

@api_bp.route('/models/loaded', methods=['GET'])
def get_loaded_models():
    """Get all loaded models."""
    models = model_manager.get_loaded_models()
    
    return jsonify({
        "success": True,
        "models": models
    }), 200

@api_bp.route('/models/active', methods=['GET'])
def get_active_model():
    """Get the currently active model."""
    model = model_manager.get_active_model()
    
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

# Auto fine-tuning routes
@api_bp.route('/check-csv-file', methods=['POST'])
def check_csv_file():
    """Check if a CSV file exists."""
    data = request.json
    if not data or 'file_path' not in data:
        return jsonify({"success": False, "message": "No file path provided"}), 400
    
    file_path = data['file_path']
    if not os.path.exists(file_path):
        return jsonify({"success": False, "message": f"File not found: {file_path}"}), 404
    
    try:
        # Try to read the CSV file
        df = pd.read_csv(file_path)
        
        # Check if required columns exist
        required_columns = ['question', 'answer']
        if not all(col in df.columns for col in required_columns):
            return jsonify({
                "success": False, 
                "message": f"CSV file must contain columns: {required_columns}. Found columns: {list(df.columns)}"
            }), 400
        
        # Return first 5 rows as preview
        preview = df.head(5).to_dict(orient='records')
        
        return jsonify({
            "success": True, 
            "message": "CSV file found and validated",
            "rows_count": len(df),
            "preview": preview
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error reading CSV file: {str(e)}"}), 400

@api_bp.route('/auto-finetune', methods=['POST'])
def auto_finetune():
    """Automatically start fine-tuning with a CSV file."""
    data = request.json
    if not data or 'file_path' not in data:
        return jsonify({"success": False, "message": "No file path provided"}), 400
    
    file_path = data['file_path']
    if not os.path.exists(file_path):
        return jsonify({"success": False, "message": f"File not found: {file_path}"}), 404
    
    try:
        # Create temp directory if it doesn't exist
        temp_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "temp")
        os.makedirs(temp_dir, exist_ok=True)
        
        # Copy the CSV file to temp directory
        file_name = os.path.basename(file_path)
        temp_file_path = os.path.join(temp_dir, file_name)
        shutil.copy2(file_path, temp_file_path)
        
        # Prepare fine-tuning parameters
        finetune_params = {
            "model_name_or_path": data.get("model_name_or_path", "meta-llama/Meta-Llama-3-8B-Instruct"),
            "dataset": temp_file_path,  # Use the copied CSV file
            "template": data.get("template", "llama3"),
            "output_dir": data.get("output_dir", "llama3_lora_qa_human_hybrid"),
            "finetuning_type": data.get("finetuning_type", "lora"),
            "lora_target": data.get("lora_target", "all"),
            "per_device_train_batch_size": data.get("per_device_train_batch_size", 2),
            "gradient_accumulation_steps": data.get("gradient_accumulation_steps", 4),
            "lr_scheduler_type": data.get("lr_scheduler_type", "cosine"),
            "logging_steps": data.get("logging_steps", 5),
            "warmup_ratio": data.get("warmup_ratio", 0.1),
            "save_steps": data.get("save_steps", 1000),
            "learning_rate": data.get("learning_rate", 5e-5),
            "num_train_epochs": data.get("num_train_epochs", 3.0),
            "max_samples": data.get("max_samples", 500),
            "max_grad_norm": data.get("max_grad_norm", 1.0),
            "loraplus_lr_ratio": data.get("loraplus_lr_ratio", 16.0),
            "fp16": data.get("fp16", True),
            "report_to": data.get("report_to", "none")
        }
        
        # Start fine-tuning
        success, message, task_id = finetune_manager.start_finetuning(finetune_params)
        
        if success:
            # Get process_id from the newly created task
            task = db.session.query(FinetuningTask).filter_by(id=task_id).first()
            process_id = task.process_id if task else None
            
            return jsonify({
                "success": True,
                "message": message,
                "task_id": task_id,
                "process_id": process_id
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": message
            }), 400
    except Exception as e:
        return jsonify({"success": False, "message": f"Error starting fine-tuning: {str(e)}"}), 500

# Chat routes
@api_bp.route('/choose-model', methods=['POST'])
def choose_model():
    """Choose a model by ID and return its configuration for chat."""
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    try:
        # Validate request data
        validated_data = validate_request(data, ChooseModelSchema)
        
        # Get model configuration
        success, message, model_args = model_manager.choose_model(
            model_id=validated_data["model_id"]
        )
        
        if success:
            return jsonify({
                "success": True,
                "message": message,
                "model_args": model_args
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

@api_bp.route('/stream-chat', methods=['POST'])
def stream_chat():
    """Stream chat with a model."""
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    try:
        # Validate request data
        validated_data = validate_request(data, StreamChatSchema)
        
        # Get model ID and message
        model_id = validated_data["model_id"]
        message = validated_data["message"]
        
        # Get model configuration
        success, model_message, model_args = model_manager.choose_model(model_id)
        if not success:
            return jsonify({
                "success": False,
                "message": model_message
            }), 400
        
        def generate():
            # Initialize ChatModel with the model args
            from llamafactory.chat import ChatModel
            from llamafactory.extras.misc import torch_gc
            
            chat_model = ChatModel(model_args)
            
            # Initialize messages list
            messages = [{"role": "user", "content": message}]
            
            # Stream response
            response = ""
            yield "data: " + json.dumps({"type": "start"}) + "\n\n"
            
            for new_text in chat_model.stream_chat(messages):
                chunk = {"type": "chunk", "content": new_text}
                yield "data: " + json.dumps(chunk) + "\n\n"
                response += new_text
            
            # Add final message
            messages.append({"role": "assistant", "content": response})
            
            # Clean up
            torch_gc()
            
            # Send complete response
            yield "data: " + json.dumps({"type": "end", "content": response}) + "\n\n"
        
        return Response(generate(), mimetype='text/event-stream')
    except ValidationError as e:
        return jsonify({
            "success": False,
            "message": "Validation error",
            "errors": e.messages
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error in stream chat: {str(e)}"
        }), 500

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
        success, message, response = model_manager.chat(
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