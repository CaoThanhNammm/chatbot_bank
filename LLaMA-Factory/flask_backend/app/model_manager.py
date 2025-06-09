"""
Model manager for handling model loading, unloading, and activation.
"""

import os
import json
import datetime
from typing import Dict, List, Optional, Any, Tuple
import threading

from llamafactory.chat import ChatModel
from llamafactory.hparams import get_infer_args
from llamafactory.extras.misc import torch_gc

from .database import db
from .models.finetune import FinetuningTask
from .models.model import ModelConfig

class ModelManager:
    """
    Manages the loading, unloading, and activation of models.
    """
    
    def __init__(self):
        """Initialize the model manager."""
        self.loaded_models: Dict[str, Dict[str, Any]] = {}  # Maps model_key to model info
        self.active_models: Dict[str, ChatModel] = {}  # Maps model_key to active ChatModel instances
        self.active_model: Optional[str] = None  # Key of the primary active model (for backward compatibility)
        self.active_chat_model: Optional[ChatModel] = None  # Primary active ChatModel instance (for backward compatibility)
        self.lock = threading.Lock()  # Lock for thread safety
    
    def _get_model_key(self, model_name_or_path: str, adapter_name_or_path: str, template: str) -> str:
        """Generate a unique key for a model configuration."""
        return f"{model_name_or_path}_{adapter_name_or_path}_{template}"
    
    def load_model(self, task_id: str) -> Tuple[bool, str]:
        """
        Load a model from a completed fine-tuning task.
        
        Args:
            task_id: ID of the fine-tuning task
            
        Returns:
            Tuple of (success, message)
        """
        with self.lock:
            # Find the fine-tuning task
            task = db.session.query(FinetuningTask).filter_by(id=task_id).first()
            if not task:
                return False, f"Fine-tuning task not found with ID: {task_id}"
            
            # Check if the task is completed
            if task.status != "completed":
                return False, f"Fine-tuning task is not completed. Current status: {task.status}"
            
            # Get model parameters from the task
            model_name_or_path = task.model_name_or_path
            adapter_name_or_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                                               "output", task.output_dir)
            template = task.template
            
            # Generate model key
            model_key = self._get_model_key(model_name_or_path, adapter_name_or_path, template)
            
            # Check if model is already loaded
            if model_key in self.loaded_models:
                # Check if it's already in the database
                existing_config = db.session.query(ModelConfig).filter_by(model_key=model_key).first()
                if not existing_config:
                    # Add to database if not already there
                    model_config = ModelConfig(
                        model_key=model_key,
                        model_name_or_path=model_name_or_path,
                        adapter_name_or_path=adapter_name_or_path,
                        template=template,
                        is_active=False
                    )
                    db.session.add(model_config)
                    db.session.commit()
                
                return True, f"Model already loaded: {model_key}"
            
            # Validate paths
            if not os.path.exists(adapter_name_or_path):
                return False, f"Adapter path does not exist: {adapter_name_or_path}"
            
            # Create model args
            args = {
                "model_name_or_path": model_name_or_path,
                "adapter_name_or_path": adapter_name_or_path,
                "template": template,
                "finetuning_type": "lora",
                "infer_backend": "huggingface"  # Use Huggingface backend
            }
            
            try:
                # Store model info without loading it yet
                self.loaded_models[model_key] = {
                    "model_name_or_path": model_name_or_path,
                    "adapter_name_or_path": adapter_name_or_path,
                    "template": template,
                    "args": args,
                    "chat_model": None  # Will be loaded when activated
                }
                
                # Add to database
                model_config = ModelConfig(
                    model_key=model_key,
                    model_name_or_path=model_name_or_path,
                    adapter_name_or_path=adapter_name_or_path,
                    template=template,
                    is_active=False
                )
                db.session.add(model_config)
                db.session.commit()
                
                return True, f"Model registered successfully: {model_key}"
            except Exception as e:
                return False, f"Error loading model: {str(e)}"
                
    # Keep the old method for backward compatibility
    def load_model_legacy(self, model_name_or_path: str, adapter_name_or_path: str, template: str) -> Tuple[bool, str]:
        """
        Legacy method to load a model with the specified configuration.
        
        Args:
            model_name_or_path: Path to the base model
            adapter_name_or_path: Path to the LoRA adapter
            template: Template name
            
        Returns:
            Tuple of (success, message)
        """
        with self.lock:
            model_key = self._get_model_key(model_name_or_path, adapter_name_or_path, template)
            
            # Check if model is already loaded
            if model_key in self.loaded_models:
                return True, f"Model already loaded: {model_key}"
            
            # Validate paths
            if not os.path.exists(adapter_name_or_path):
                return False, f"Adapter path does not exist: {adapter_name_or_path}"
            
            # Create model args
            args = {
                "model_name_or_path": model_name_or_path,
                "adapter_name_or_path": adapter_name_or_path,
                "template": template,
                "finetuning_type": "lora",
                "infer_backend": "huggingface"  # Use Huggingface backend
            }
            
            try:
                # Store model info without loading it yet
                self.loaded_models[model_key] = {
                    "model_name_or_path": model_name_or_path,
                    "adapter_name_or_path": adapter_name_or_path,
                    "template": template,
                    "args": args,
                    "chat_model": None  # Will be loaded when activated
                }
                
                # Add to database
                model_config = ModelConfig(
                    model_key=model_key,
                    model_name_or_path=model_name_or_path,
                    adapter_name_or_path=adapter_name_or_path,
                    template=template,
                    is_active=False
                )
                db.session.add(model_config)
                db.session.commit()
                
                return True, f"Model registered successfully: {model_key}"
            except Exception as e:
                return False, f"Error loading model: {str(e)}"
    
    def unload_model(self, model_id: str) -> Tuple[bool, str]:
        """
        Unload a model with the specified model ID.
        
        Args:
            model_id: ID of the model configuration
            
        Returns:
            Tuple of (success, message)
        """
        with self.lock:
            # Find the model configuration
            model_config = db.session.query(ModelConfig).filter_by(id=model_id).first()
            if not model_config:
                return False, f"Model configuration not found with ID: {model_id}"
            
            model_key = model_config.model_key
            
            # Check if model is loaded
            if model_key not in self.loaded_models:
                # Remove from database anyway
                db.session.delete(model_config)
                db.session.commit()
                return True, f"Model configuration removed from database: {model_key}"
            
            # Check if model is active
            if model_config.is_active:
                return False, f"Cannot unload active model. Deactivate it first."
            
            # Unload model
            model_info = self.loaded_models.pop(model_key)
            if model_info["chat_model"] is not None:
                del model_info["chat_model"]
                torch_gc()  # Clean up GPU memory
            
            # Remove from database
            db.session.delete(model_config)
            db.session.commit()
            
            return True, f"Model unloaded successfully: {model_key}"
            
    # Keep the old method for backward compatibility
    def unload_model_legacy(self, model_name_or_path: str, adapter_name_or_path: str, template: str) -> Tuple[bool, str]:
        """
        Legacy method to unload a model with the specified configuration.
        
        Args:
            model_name_or_path: Path to the base model
            adapter_name_or_path: Path to the LoRA adapter
            template: Template name
            
        Returns:
            Tuple of (success, message)
        """
        with self.lock:
            model_key = self._get_model_key(model_name_or_path, adapter_name_or_path, template)
            
            # Check if model is loaded
            if model_key not in self.loaded_models:
                return False, f"Model not loaded: {model_key}"
            
            # Check if model is active
            if self.active_model == model_key:
                return False, f"Cannot unload active model. Deactivate it first."
            
            # Find the model configuration in database
            model_config = db.session.query(ModelConfig).filter_by(model_key=model_key).first()
            
            # Unload model
            model_info = self.loaded_models.pop(model_key)
            if model_info["chat_model"] is not None:
                del model_info["chat_model"]
                torch_gc()  # Clean up GPU memory
            
            # Remove from database if exists
            if model_config:
                db.session.delete(model_config)
                db.session.commit()
            
            return True, f"Model unloaded successfully: {model_key}"
    
    def update_model_active_status(self, model_id: str, is_active: bool) -> Tuple[bool, str]:
        """
        Update the active status of a model.
        
        Args:
            model_id: ID of the model configuration
            is_active: Whether to activate or deactivate the model
            
        Returns:
            Tuple of (success, message)
        """
        with self.lock:
            # Find the model configuration
            model_config = db.session.query(ModelConfig).filter_by(id=model_id).first()
            if not model_config:
                return False, f"Model configuration not found with ID: {model_id}"
            
            model_key = model_config.model_key
            
            # Check if model is loaded
            if model_key not in self.loaded_models:
                return False, f"Model not loaded in memory. Cannot update status: {model_key}"
            
            # If activating
            if is_active:
                # Check if model is already active
                if model_key in self.active_models:
                    # Update database anyway
                    if not model_config.is_active:
                        model_config.is_active = True
                        model_config.last_activated_at = datetime.datetime.utcnow()
                        db.session.commit()
                    return True, f"Model already active: {model_key}"
                
                # Update database to mark this model as active
                model_config.is_active = True
                model_config.last_activated_at = datetime.datetime.utcnow()
                db.session.commit()
                
                # No need to deactivate other models - we support multiple active models now
                
                # Activate new model
                model_info = self.loaded_models[model_key]
                try:
                    # Force CPU usage for this activation
                    print(f"Activating model {model_key} on CPU")
                    
                    # Save original CUDA_VISIBLE_DEVICES value
                    original_cuda_devices = os.environ.get("CUDA_VISIBLE_DEVICES", "")
                    
                    # Set environment variable to use CPU
                    os.environ["CUDA_VISIBLE_DEVICES"] = ""
                    
                    # Prepare model args
                    args = model_info["args"].copy()
                    
                    # Add low CPU memory usage flag
                    args["low_cpu_mem_usage"] = True
                    
                    # Actually load the model now
                    chat_model = ChatModel(args)
                    
                    # Update model info in loaded_models
                    model_info["chat_model"] = chat_model
                    model_info["args"] = args  # Save the updated args
                    self.loaded_models[model_key] = model_info
                    
                    # Add to active models dictionary
                    self.active_models[model_key] = chat_model
                    
                    # Also update the legacy active model variables if this is the first active model
                    if self.active_model is None:
                        self.active_model = model_key
                        self.active_chat_model = chat_model
                    
                    # Restore original CUDA_VISIBLE_DEVICES value
                    os.environ["CUDA_VISIBLE_DEVICES"] = original_cuda_devices
                    
                    # Return success with device info
                    return True, f"Model activated successfully on CPU: {model_key}"
                except Exception as e:
                    return False, f"Error activating model: {str(e)}"
            # If deactivating
            else:
                # Check if model is active
                if model_key not in self.active_models:
                    # Update database anyway
                    if model_config.is_active:
                        model_config.is_active = False
                        db.session.commit()
                    return True, f"Model already inactive: {model_key}"
                
                # Remove from active models dictionary
                if model_key in self.active_models:
                    del self.active_models[model_key]
                
                # If this was the legacy active model, update those variables
                if self.active_model == model_key:
                    self.active_chat_model = None
                    self.active_model = None
                    
                    # If there are other active models, set one as the legacy active model
                    if self.active_models:
                        # Get the first active model
                        first_key = next(iter(self.active_models))
                        self.active_model = first_key
                        self.active_chat_model = self.active_models[first_key]
                
                # Clean up GPU memory
                torch_gc()
                
                # Update database
                model_config.is_active = False
                db.session.commit()
                
                return True, f"Model deactivated successfully: {model_key}"
    
    # Legacy methods have been removed
    
    def get_loaded_models(self) -> List[Dict[str, str]]:
        """
        Get a list of all loaded models.
        
        Returns:
            List of model information dictionaries
        """
        with self.lock:
            result = []
            
            # Get all model configurations from database
            model_configs = db.session.query(ModelConfig).all()
            
            # Create a mapping from model_key to model_id
            model_key_to_id = {config.model_key: config.id for config in model_configs}
            
            # Create the result list
            for key, info in self.loaded_models.items():
                model_info = {
                    "model_name_or_path": info["model_name_or_path"],
                    "adapter_name_or_path": info["adapter_name_or_path"],
                    "template": info["template"],
                    "is_active": key == self.active_model,
                    "model_key": key
                }
                
                # Add model_id if available in database
                if key in model_key_to_id:
                    model_info["id"] = model_key_to_id[key]
                
                result.append(model_info)
            
            return result
    
    def get_active_model(self) -> Optional[Dict[str, Any]]:
        """
        Get information about the currently active model.
        For backward compatibility, returns the primary active model.
        Use get_active_models() to get all active models.
        
        Returns:
            Dictionary with model information or None if no model is active
        """
        with self.lock:
            if self.active_model is None:
                if not self.active_models:
                    return None
                # Use the first active model
                model_key = next(iter(self.active_models))
            else:
                model_key = self.active_model
            
            info = self.loaded_models[model_key]
            result = {
                "model_name_or_path": info["model_name_or_path"],
                "adapter_name_or_path": info["adapter_name_or_path"],
                "template": info["template"],
                "model_key": model_key
            }
            
            # Get model ID from database if available
            model_config = db.session.query(ModelConfig).filter_by(model_key=model_key).first()
            if model_config:
                result["id"] = model_config.id
            
            return result
            
    def get_active_models(self) -> List[Dict[str, Any]]:
        """
        Get information about all currently active models.
        
        Returns:
            List of dictionaries with model information
        """
        with self.lock:
            if not self.active_models:
                return []
            
            result = []
            
            # Get all model IDs from database
            model_configs = db.session.query(ModelConfig).all()
            model_key_to_id = {config.model_key: config.id for config in model_configs}
            
            for model_key in self.active_models:
                info = self.loaded_models[model_key]
                model_info = {
                    "model_name_or_path": info["model_name_or_path"],
                    "adapter_name_or_path": info["adapter_name_or_path"],
                    "template": info["template"],
                    "model_key": model_key,
                    "is_primary": model_key == self.active_model
                }
                
                # Add model_id if available
                if model_key in model_key_to_id:
                    model_info["id"] = model_key_to_id[model_key]
                
                result.append(model_info)
            
            return result
    
    def choose_model(self, model_id: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Choose a model by ID and return its configuration for chat.
        
        Args:
            model_id: ID of the model configuration
            
        Returns:
            Tuple of (success, message, model_args)
        """
        with self.lock:
            # Find the model configuration
            model_config = db.session.query(ModelConfig).filter_by(id=model_id).first()
            if not model_config:
                return False, f"Model configuration not found with ID: {model_id}", None
            
            # Check if model is active
            if not model_config.is_active:
                return False, f"Model is not active. Please activate it first.", None
            
            # Force CPU usage for model inference
            # Return model configuration with CPU settings
            model_args = {
                "model_name_or_path": model_config.model_name_or_path,
                "adapter_name_or_path": model_config.adapter_name_or_path,
                "template": model_config.template,
                "finetuning_type": "lora",
                "infer_backend": "huggingface",  # Use Huggingface backend
                "low_cpu_mem_usage": True
            }
            
            # Temporarily set environment variable to use CPU
            # Note: This affects only the current request
            os.environ["CUDA_VISIBLE_DEVICES"] = ""
            
            return True, "Model configuration retrieved successfully", model_args
    
    def chat(self, messages: List[Dict[str, str]], system: Optional[str] = None, model_id: Optional[str] = None) -> Tuple[bool, str, Optional[str]]:
        """
        Generate a response using the specified model or active model.
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            system: Optional system message
            model_id: Optional model ID to use for chat (if not provided, uses active model)
            
        Returns:
            Tuple of (success, message, response)
        """
        with self.lock:
            chat_model = None
            model_key = None
            
            # If model_id is provided, try to use that specific model
            if model_id:
                try:
                    # Get model config from database
                    model_config = ModelConfig.query.filter_by(id=model_id).first()
                    if not model_config:
                        return False, f"Model with ID {model_id} not found", None
                    
                    model_key = model_config.model_key
                    
                    # Check if model is active
                    if model_key in self.active_models:
                        chat_model = self.active_models[model_key]
                    else:
                        return False, f"Model {model_key} is not active. Please activate it first.", None
                except Exception as e:
                    return False, f"Error finding model: {str(e)}", None
            else:
                # Use active model if no model_id is provided
                if self.active_model is None or self.active_chat_model is None:
                    if not self.active_models:
                        return False, "No active model for chat", None
                    else:
                        # Use the first active model
                        model_key = next(iter(self.active_models))
                        chat_model = self.active_models[model_key]
                else:
                    chat_model = self.active_chat_model
                    model_key = self.active_model
            
            try:
                # Use chat() instead of stream_chat() to get a list of responses
                responses = chat_model.chat(messages=messages)
                
                # Log responses for debugging
                print(f"Using model: {model_key}")
                print(f"Messages: {messages}")
                print(f"Responses: {responses}")
                
                if responses and len(responses) > 0:
                    # Create response data
                    response_data = {
                        "text": responses[0].response_text,
                        "generated_text": responses[0].response_text,
                        "usage": {
                            "prompt_tokens": responses[0].prompt_length if hasattr(responses[0], 'prompt_length') else 0,
                            "completion_tokens": responses[0].response_length if hasattr(responses[0], 'response_length') else 0,
                            "total_tokens": (responses[0].prompt_length + responses[0].response_length) if hasattr(responses[0], 'prompt_length') and hasattr(responses[0], 'response_length') else 0
                        }
                    }
                    return True, "Response generated successfully", response_data
                else:
                    return False, "No response generated", None
            except Exception as e:
                return False, f"Error generating response: {str(e)}", None

# Create a singleton instance
model_manager = ModelManager()
