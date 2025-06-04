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
from .models.model import ModelConfig
from .models.finetune import FinetuningTask

class ModelManager:
    """
    Manages the loading, unloading, and activation of models.
    """
    
    def __init__(self):
        """Initialize the model manager."""
        self.loaded_models: Dict[str, Dict[str, Any]] = {}  # Maps model_key to model info
        self.active_model: Optional[str] = None  # Key of the active model
        self.active_chat_model: Optional[ChatModel] = None  # Active ChatModel instance
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
                "infer_backend": "hf"  # Use Huggingface backend
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
                "infer_backend": "hf"  # Use Huggingface backend
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
                if self.active_model == model_key and self.active_chat_model is not None:
                    # Update database anyway
                    if not model_config.is_active:
                        model_config.is_active = True
                        model_config.last_activated_at = datetime.datetime.utcnow()
                        db.session.commit()
                    return True, f"Model already active: {model_key}"
                
                # Deactivate all other models in database
                other_active_models = db.session.query(ModelConfig).filter(
                    ModelConfig.is_active == True,
                    ModelConfig.id != model_id
                ).all()
                for other_model in other_active_models:
                    other_model.is_active = False
                    db.session.add(other_model)
                
                # Deactivate current model in memory if any
                if self.active_model is not None and self.active_chat_model is not None:
                    self.active_chat_model = None
                    torch_gc()  # Clean up GPU memory
                
                # Activate new model
                model_info = self.loaded_models[model_key]
                try:
                    # Actually load the model now
                    chat_model = ChatModel(model_info["args"])
                    
                    # Update model info and active model in memory
                    model_info["chat_model"] = chat_model
                    self.loaded_models[model_key] = model_info
                    self.active_model = model_key
                    self.active_chat_model = chat_model
                    
                    # Update database
                    model_config.is_active = True
                    model_config.last_activated_at = datetime.datetime.utcnow()
                    db.session.commit()
                    
                    return True, f"Model activated successfully: {model_key}"
                except Exception as e:
                    return False, f"Error activating model: {str(e)}"
            # If deactivating
            else:
                # Check if model is active
                if self.active_model != model_key or self.active_chat_model is None:
                    # Update database anyway
                    if model_config.is_active:
                        model_config.is_active = False
                        db.session.commit()
                    return True, f"Model already inactive: {model_key}"
                
                # Deactivate model in memory
                self.active_chat_model = None
                self.active_model = None
                torch_gc()  # Clean up GPU memory
                
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
    
    def get_active_model(self) -> Optional[Dict[str, str]]:
        """
        Get information about the currently active model.
        
        Returns:
            Dictionary with model information or None if no model is active
        """
        with self.lock:
            if self.active_model is None:
                return None
            
            info = self.loaded_models[self.active_model]
            result = {
                "model_name_or_path": info["model_name_or_path"],
                "adapter_name_or_path": info["adapter_name_or_path"],
                "template": info["template"],
                "model_key": self.active_model
            }
            
            # Get model ID from database if available
            model_config = db.session.query(ModelConfig).filter_by(model_key=self.active_model).first()
            if model_config:
                result["id"] = model_config.id
            
            return result
    
    def chat(self, messages: List[Dict[str, str]], system: Optional[str] = None) -> Tuple[bool, str, Optional[str]]:
        """
        Generate a response using the active model.
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            system: Optional system message
            
        Returns:
            Tuple of (success, message, response)
        """
        with self.lock:
            if self.active_model is None or self.active_chat_model is None:
                return False, "No active model for chat", None
            
            try:
                responses = self.active_chat_model.chat(messages=messages, system=system)
                if responses and len(responses) > 0:
                    return True, "Response generated successfully", responses[0].content
                else:
                    return False, "No response generated", None
            except Exception as e:
                return False, f"Error generating response: {str(e)}", None

# Create a singleton instance
model_manager = ModelManager()