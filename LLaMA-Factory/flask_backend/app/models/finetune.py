"""
Fine-tuning models for model training.
"""

import datetime
import uuid
from typing import Dict, Any, Optional
from sqlalchemy.dialects.mysql import CHAR
from ..database import db

class FinetuningTask(db.Model):
    """Fine-tuning task model."""
    __tablename__ = 'finetuning_tasks'
    
    id = db.Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    process_id = db.Column(CHAR(36), nullable=False, index=True)  # ID chung để nhận diện các trạng thái của cùng một quá trình fine-tuning
    status = db.Column(db.String(20), nullable=False)  # 'pending', 'running', 'completed', 'failed'
    model_name_or_path = db.Column(db.String(255), nullable=False)
    dataset = db.Column(db.String(255), nullable=False)
    template = db.Column(db.String(100), nullable=False)
    output_dir = db.Column(db.String(255), nullable=False)
    error_message = db.Column(db.Text, nullable=True)
    
    # Fine-tuning parameters
    finetuning_type = db.Column(db.String(50), nullable=False, default="lora")
    lora_target = db.Column(db.String(50), nullable=False, default="all")
    per_device_train_batch_size = db.Column(db.Integer, nullable=False, default=2)
    gradient_accumulation_steps = db.Column(db.Integer, nullable=False, default=4)
    lr_scheduler_type = db.Column(db.String(50), nullable=False, default="cosine")
    logging_steps = db.Column(db.Integer, nullable=False, default=5)
    warmup_ratio = db.Column(db.Float, nullable=False, default=0.1)
    save_steps = db.Column(db.Integer, nullable=False, default=1000)
    learning_rate = db.Column(db.Float, nullable=False, default=5e-5)
    num_train_epochs = db.Column(db.Float, nullable=False, default=3.0)
    max_samples = db.Column(db.Integer, nullable=False, default=500)
    max_grad_norm = db.Column(db.Float, nullable=False, default=1.0)
    loraplus_lr_ratio = db.Column(db.Float, nullable=False, default=16.0)
    fp16 = db.Column(db.Boolean, nullable=False, default=True)
    report_to = db.Column(db.String(50), nullable=False, default="none")
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    def __repr__(self):
        return f'<FinetuningTask {self.id[:8]} - {self.status}>'
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert the task to a dictionary."""
        return {
            "id": self.id,
            "process_id": self.process_id,
            "status": self.status,
            "model_name_or_path": self.model_name_or_path,
            "dataset": self.dataset,
            "template": self.template,
            "output_dir": self.output_dir,
            "error_message": self.error_message,
            "finetuning_type": self.finetuning_type,
            "lora_target": self.lora_target,
            "per_device_train_batch_size": self.per_device_train_batch_size,
            "gradient_accumulation_steps": self.gradient_accumulation_steps,
            "lr_scheduler_type": self.lr_scheduler_type,
            "logging_steps": self.logging_steps,
            "warmup_ratio": self.warmup_ratio,
            "save_steps": self.save_steps,
            "learning_rate": self.learning_rate,
            "num_train_epochs": self.num_train_epochs,
            "max_samples": self.max_samples,
            "max_grad_norm": self.max_grad_norm,
            "loraplus_lr_ratio": self.loraplus_lr_ratio,
            "fp16": self.fp16,
            "report_to": self.report_to,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }