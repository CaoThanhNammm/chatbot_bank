"""
Model management models.
"""

import datetime
import uuid
from typing import Dict, Any, Optional
from sqlalchemy.dialects.mysql import CHAR
from ..database import db

class ModelConfig(db.Model):
    """Model configuration model."""
    __tablename__ = 'model_configs'
    
    id = db.Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    model_key = db.Column(db.String(255), unique=True, nullable=False)
    model_name_or_path = db.Column(db.String(255), nullable=False)
    adapter_name_or_path = db.Column(db.String(255), nullable=False)
    template = db.Column(db.String(100), nullable=False)
    is_active = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    last_activated_at = db.Column(db.DateTime, nullable=True)
    
    def __repr__(self):
        return f'<ModelConfig {self.id[:8]} - {self.model_key}>'
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert the model config to a dictionary."""
        return {
            "id": self.id,
            "model_key": self.model_key,
            "model_name_or_path": self.model_name_or_path,
            "adapter_name_or_path": self.adapter_name_or_path,
            "template": self.template,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_activated_at": self.last_activated_at.isoformat() if self.last_activated_at else None
        }

class Model:
    """In-memory model class for managing loaded models."""
    
    def __init__(self, model_key: str, model_name_or_path: str, adapter_name_or_path: str, template: str):
        self.model_key = model_key
        self.model_name_or_path = model_name_or_path
        self.adapter_name_or_path = adapter_name_or_path
        self.template = template
        self.args = {
            "model_name_or_path": model_name_or_path,
            "adapter_name_or_path": adapter_name_or_path,
            "template": template,
            "finetuning_type": "lora",
            "infer_backend": "hf"
        }
        self.chat_model = None
        self.is_active = False
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert the model to a dictionary."""
        return {
            "model_key": self.model_key,
            "model_name_or_path": self.model_name_or_path,
            "adapter_name_or_path": self.adapter_name_or_path,
            "template": self.template,
            "is_active": self.is_active
        }