"""
Model service for handling model loading, unloading, and activation.
"""

import os
import json
from typing import Dict, List, Optional, Any, Tuple
import threading
import datetime

from llamafactory.chat import ChatModel
from llamafactory.hparams import get_infer_args
from llamafactory.extras.misc import torch_gc

from ..database import db
from ..models.model import Model, ModelConfig

class ModelService:
    """
    Manages the loading, unloading, and activation of models.
    """
    
    def __init__(self):
        """Initialize the model service."""
        self.loaded_models: Dict[str, Model] = {}  # Maps model_key to Model instance
        self.active_model: Optional[str] = None  # Key of the active model
        self.active_chat_model: Optional[ChatModel] = None  # Active ChatModel instance
        self.lock = threading.Lock()  # Lock for thread safety
    
    def _get_model_key(self, model_name_or_path: str, adapter_name_or_path: str, template: str) -> str:
        """Generate a unique key for a model configuration."""
        return f"{model_name_or_path}_{adapter_name_or_path}_{template}"
    
    def load_model(self, model_name_or_path: str, adapter_name_or_path: str, template: str) -> Tuple[bool, str]:
        """
        Load a model with the specified configuration.
        
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
            
            try:
                # Create model instance
                model = Model(
                    model_key=model_key,
                    model_name_or_path=model_name_or_path,
                    adapter_name_or_path=adapter_name_or_path,
                    template=template
                )
                
                # Store model in memory
                self.loaded_models[model_key] = model
                
                # Store model config in database
                model_config = ModelConfig.query.filter_by(model_key=model_key).first()
                if not model_config:
                    model_config = ModelConfig(
                        model_key=model_key,
                        model_name_or_path=model_name_or_path,
                        adapter_name_or_path=adapter_name_or_path,
                        template=template,
                        is_active=False,
                        created_at=datetime.datetime.utcnow(),
                        updated_at=datetime.datetime.utcnow()
                    )
                    db.session.add(model_config)
                    db.session.commit()
                
                return True, f"Model registered successfully: {model_key}"
            except Exception as e:
                return False, f"Error loading model: {str(e)}"
    
    def unload_model(self, model_name_or_path: str, adapter_name_or_path: str, template: str) -> Tuple[bool, str]:
        """
        Unload a model with the specified configuration.
        
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
            
            # Unload model from memory
            model = self.loaded_models.pop(model_key)
            if model.chat_model is not None:
                model.chat_model = None
                torch_gc()  # Clean up GPU memory
            
            # Update model config in database
            model_config = ModelConfig.query.filter_by(model_key=model_key).first()
            if model_config:
                model_config.is_active = False
                model_config.updated_at = datetime.datetime.utcnow()
                db.session.commit()
            
            return True, f"Model unloaded successfully: {model_key}"
    
    def activate_model(self, model_name_or_path: str, adapter_name_or_path: str, template: str) -> Tuple[bool, str]:
        """
        Activate a model for chat.
        
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
                return False, f"Model not loaded. Load it first: {model_key}"
            
            # Check if model is already active
            if self.active_model == model_key and self.active_chat_model is not None:
                return True, f"Model already active: {model_key}"
            
            # Deactivate current model if any
            if self.active_model is not None and self.active_chat_model is not None:
                # Update previous active model in database
                prev_model_config = ModelConfig.query.filter_by(model_key=self.active_model).first()
                if prev_model_config:
                    prev_model_config.is_active = False
                    prev_model_config.updated_at = datetime.datetime.utcnow()
                
                self.active_chat_model = None
                torch_gc()  # Clean up GPU memory
            
            # Activate new model
            model = self.loaded_models[model_key]
            try:
                # Actually load the model now
                chat_model = ChatModel(model.args)
                
                # Update model and active model
                model.chat_model = chat_model
                model.is_active = True
                self.active_model = model_key
                self.active_chat_model = chat_model
                
                # Update model config in database
                model_config = ModelConfig.query.filter_by(model_key=model_key).first()
                if model_config:
                    model_config.is_active = True
                    model_config.last_activated_at = datetime.datetime.utcnow()
                    model_config.updated_at = datetime.datetime.utcnow()
                    db.session.commit()
                
                return True, f"Model activated successfully: {model_key}"
            except Exception as e:
                return False, f"Error activating model: {str(e)}"
    
    def deactivate_model(self, model_name_or_path: str) -> Tuple[bool, str]:
        """
        Deactivate the currently active model.
        
        Args:
            model_name_or_path: Path to the base model (for validation)
            
        Returns:
            Tuple of (success, message)
        """
        with self.lock:
            # Check if any model is active
            if self.active_model is None or self.active_chat_model is None:
                return False, "No active model to deactivate"
            
            # Check if the specified model is the active one
            model = self.loaded_models[self.active_model]
            if model.model_name_or_path != model_name_or_path:
                return False, f"Specified model is not the active model: {model_name_or_path}"
            
            # Deactivate model
            model.is_active = False
            self.active_chat_model = None
            self.active_model = None
            torch_gc()  # Clean up GPU memory
            
            # Update model config in database
            model_config = ModelConfig.query.filter_by(model_key=model.model_key).first()
            if model_config:
                model_config.is_active = False
                model_config.updated_at = datetime.datetime.utcnow()
                db.session.commit()
            
            return True, f"Model deactivated successfully: {model_name_or_path}"
    
    def get_loaded_models(self) -> List[Dict[str, str]]:
        """
        Get a list of all loaded models.
        
        Returns:
            List of model information dictionaries
        """
        with self.lock:
            return [model.to_dict() for model in self.loaded_models.values()]
    
    def get_active_model(self) -> Optional[Dict[str, str]]:
        """
        Get information about the currently active model.
        
        Returns:
            Dictionary with model information or None if no model is active
        """
        with self.lock:
            if self.active_model is None:
                return None
            
            model = self.loaded_models[self.active_model]
            return {
                "model_name_or_path": model.model_name_or_path,
                "adapter_name_or_path": model.adapter_name_or_path,
                "template": model.template
            }
    
    def chat(self, messages: List[Dict[str, str]], system: Optional[str] = None) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
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
                    response_data = {
                        "text": responses[0].content,
                        "generated_text": responses[0].content,
                        "usage": {
                            "prompt_tokens": responses[0].usage.prompt_tokens if hasattr(responses[0], 'usage') else 0,
                            "completion_tokens": responses[0].usage.completion_tokens if hasattr(responses[0], 'usage') else 0,
                            "total_tokens": responses[0].usage.total_tokens if hasattr(responses[0], 'usage') else 0
                        }
                    }
                    return True, "Response generated successfully", response_data
                else:
                    return False, "No response generated", None
            except Exception as e:
                return False, f"Error generating response: {str(e)}", None

# Create a singleton instance
model_service = ModelService()