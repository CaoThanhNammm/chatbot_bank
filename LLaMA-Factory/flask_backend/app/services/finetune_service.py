"""
Fine-tuning service for handling model fine-tuning.
"""

import os
import json
import uuid
import threading
import datetime
from typing import Dict, List, Optional, Any, Tuple
import sys
import os.path as osp

# Add parent directory to path to import llamafactory
sys.path.append(osp.dirname(osp.dirname(osp.dirname(osp.abspath(__file__)))))

from llamafactory.train.sft.workflow import run_sft
from llamafactory.hparams import (
    ModelArguments,
    DataArguments,
    TrainingArguments,
    FinetuningArguments,
    GeneratingArguments
)

from ..database import db
from ..models.finetune import FinetuningTask

class FinetuneService:
    """
    Manages the fine-tuning of models.
    """
    
    def __init__(self, output_base_dir: str = "output"):
        """Initialize the fine-tuning service."""
        self.output_base_dir = output_base_dir
        self.lock = threading.Lock()
        
        # Create output directory if it doesn't exist
        os.makedirs(self.output_base_dir, exist_ok=True)
    
    def _get_all_output_dirs(self) -> List[str]:
        """Get all output directories."""
        if not os.path.exists(self.output_base_dir):
            return []
        
        return [
            os.path.join(self.output_base_dir, d)
            for d in os.listdir(self.output_base_dir)
            if os.path.isdir(os.path.join(self.output_base_dir, d))
        ]
    
    def get_all_finetuned_models(self) -> List[Dict[str, Any]]:
        """
        Get information about all fine-tuned models.
        
        Returns:
            List of dictionaries with model information
        """
        output_dirs = self._get_all_output_dirs()
        models = []
        
        for output_dir in output_dirs:
            # Check if this is a valid fine-tuned model directory
            adapter_config_path = os.path.join(output_dir, "adapter_config.json")
            if os.path.exists(adapter_config_path):
                try:
                    with open(adapter_config_path, "r", encoding="utf-8") as f:
                        adapter_config = json.load(f)
                    
                    # Get model name from README.md if it exists
                    model_name = os.path.basename(output_dir)
                    readme_path = os.path.join(output_dir, "README.md")
                    if os.path.exists(readme_path):
                        with open(readme_path, "r", encoding="utf-8") as f:
                            readme_content = f.read()
                            # Try to extract model name from README
                            if "# " in readme_content:
                                model_name = readme_content.split("# ")[1].split("\n")[0].strip()
                    
                    models.append({
                        "output_dir": output_dir,
                        "model_name": model_name,
                        "adapter_type": adapter_config.get("peft_type", "Unknown"),
                        "base_model": adapter_config.get("base_model_name_or_path", "Unknown")
                    })
                except Exception as e:
                    # Skip invalid directories
                    continue
        
        return models
    
    def start_finetuning(self, task_params: Dict[str, Any]) -> Tuple[bool, str, Optional[str]]:
        """
        Start a fine-tuning task.
        
        Args:
            task_params: Dictionary with task parameters
            
        Returns:
            Tuple of (success, message, task_id)
        """
        with self.lock:
            # Create a new task with UUID
            task_uuid = str(uuid.uuid4())
            
            # Create output directory
            output_dir = os.path.join(self.output_base_dir, task_params.get("output_dir", f"task_{task_uuid[:8]}"))
            if os.path.exists(output_dir):
                return False, f"Output directory already exists: {output_dir}", None
            
            # Create task
            task = FinetuningTask(
                id=task_uuid,
                status="pending",
                model_name_or_path=task_params.get("model_name_or_path"),
                dataset=task_params.get("dataset"),
                template=task_params.get("template"),
                output_dir=output_dir,
                finetuning_type=task_params.get("finetuning_type", "lora"),
                lora_target=task_params.get("lora_target", "all"),
                per_device_train_batch_size=task_params.get("per_device_train_batch_size", 2),
                gradient_accumulation_steps=task_params.get("gradient_accumulation_steps", 4),
                lr_scheduler_type=task_params.get("lr_scheduler_type", "cosine"),
                logging_steps=task_params.get("logging_steps", 5),
                warmup_ratio=task_params.get("warmup_ratio", 0.1),
                save_steps=task_params.get("save_steps", 1000),
                learning_rate=task_params.get("learning_rate", 5e-5),
                num_train_epochs=task_params.get("num_train_epochs", 3.0),
                max_samples=task_params.get("max_samples", 500),
                max_grad_norm=task_params.get("max_grad_norm", 1.0),
                loraplus_lr_ratio=task_params.get("loraplus_lr_ratio", 16.0),
                fp16=task_params.get("fp16", True),
                report_to=task_params.get("report_to", "none")
            )
            
            try:
                # Store task in database
                db.session.add(task)
                db.session.commit()
                
                # Start fine-tuning in a separate thread
                thread = threading.Thread(target=self._run_finetuning, args=(task_uuid,))
                thread.daemon = True
                thread.start()
                
                return True, f"Fine-tuning task started with ID: {task_uuid}", task_uuid
            except Exception as e:
                db.session.rollback()
                return False, f"Failed to start fine-tuning task: {str(e)}", None
    
    def _run_finetuning(self, task_id: str) -> None:
        """
        Run the fine-tuning task.
        
        Args:
            task_id: ID of the task to run
        """
        # Get task from database
        task = FinetuningTask.query.filter_by(id=task_id).first()
        if not task:
            return
        
        # Update task status
        task.status = "running"
        db.session.commit()
        
        try:
            # Create arguments
            model_args = ModelArguments(
                model_name_or_path=task.model_name_or_path,
            )
            
            # Use absolute path to data directory
            root_dir = osp.dirname(osp.dirname(osp.dirname(osp.abspath(__file__))))
            data_dir = osp.join(root_dir, "data")
            
            data_args = DataArguments(
                dataset=task.dataset,
                template=task.template,
                dataset_dir=data_dir,
            )
            
            training_args = TrainingArguments(
                output_dir=task.output_dir,
                do_train=True,
                per_device_train_batch_size=task.per_device_train_batch_size,
                gradient_accumulation_steps=task.gradient_accumulation_steps,
                learning_rate=task.learning_rate,
                num_train_epochs=task.num_train_epochs,
                lr_scheduler_type=task.lr_scheduler_type,
                logging_steps=task.logging_steps,
                save_steps=task.save_steps,
                max_grad_norm=task.max_grad_norm,
                warmup_ratio=task.warmup_ratio,
                fp16=task.fp16,
                report_to=task.report_to,
            )
            
            finetuning_args = FinetuningArguments(
                finetuning_type=task.finetuning_type,
                lora_target=task.lora_target,
                loraplus_lr_ratio=task.loraplus_lr_ratio,
            )
            
            generating_args = GeneratingArguments()
            
            # Run fine-tuning
            run_sft(
                model_args=model_args,
                data_args=data_args,
                training_args=training_args,
                finetuning_args=finetuning_args,
                generating_args=generating_args,
            )
            
            # Update task status
            task.status = "completed"
            task.completed_at = datetime.datetime.utcnow()
            db.session.commit()
        
        except Exception as e:
            # Update task status
            task.status = "failed"
            task.error_message = str(e)
            db.session.commit()
    
    def get_task_status(self, task_id: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Get the status of a fine-tuning task.
        
        Args:
            task_id: ID of the task
            
        Returns:
            Tuple of (success, message, task_info)
        """
        task = FinetuningTask.query.filter_by(id=task_id).first()
        
        if not task:
            return False, f"Task not found: {task_id}", None
        
        return True, f"Task status: {task.status}", task.to_dict()
    
    def get_all_tasks(self) -> List[Dict[str, Any]]:
        """
        Get information about all fine-tuning tasks.
        
        Returns:
            List of dictionaries with task information
        """
        tasks = FinetuningTask.query.all()
        return [task.to_dict() for task in tasks]

# Create a singleton instance
finetune_service = FinetuneService()