"""
Fine-tuning manager for handling model fine-tuning.
"""

import os
import json
import threading
import datetime
from typing import Dict, List, Optional, Any, Tuple
import uuid

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

from flask import current_app
from .database import db
from .models.finetune import FinetuningTask

class FinetuneManager:
    """
    Manages the fine-tuning of models.
    """
    
    def __init__(self, output_base_dir: str = "output"):
        """Initialize the fine-tuning manager."""
        self.output_base_dir = output_base_dir
        self.tasks: Dict[str, FinetuningTask] = {}
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
        # Lấy ứng dụng Flask từ current_app
        app = current_app._get_current_object()
        
        # Sử dụng ngữ cảnh ứng dụng Flask
        with app.app_context():
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
        # Lấy ứng dụng Flask từ current_app
        app = current_app._get_current_object()
        
        # Thêm log để debug
        print(f"Starting fine-tuning with parameters: {task_params}")
        
        # Sử dụng ngữ cảnh ứng dụng Flask
        with app.app_context():
            with self.lock:
                try:
                    # Generate task ID and process ID
                    task_id = str(uuid.uuid4())
                    process_id = str(uuid.uuid4())  # ID chung cho tất cả các trạng thái của quá trình fine-tuning này
                    
                    print(f"Generated task ID: {task_id}, process ID: {process_id}")
                    
                    # Create output directory
                    output_dir = os.path.join(self.output_base_dir, task_params.get("output_dir", f"task_{task_id[:8]}"))
                    if os.path.exists(output_dir):
                        return False, f"Output directory already exists: {output_dir}", None
                    
                    # Đảm bảo thư mục output tồn tại
                    os.makedirs(self.output_base_dir, exist_ok=True)
                    
                    print(f"Output directory will be: {output_dir}")
                    
                    # Create task in database
                    task = FinetuningTask(
                        id=task_id,
                        process_id=process_id,
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
                        report_to=task_params.get("report_to", "none"),
                        created_at=datetime.datetime.utcnow(),
                        updated_at=datetime.datetime.utcnow()
                    )
                    
                    # Save to database
                    db.session.add(task)
                    db.session.commit()
                    
                    print(f"Task saved to database with ID: {task_id}")
                    
                    # Store task in memory for quick access
                    self.tasks[task_id] = task
                    
                    # Chạy fine-tuning trực tiếp thay vì sử dụng thread
                    print(f"Running fine-tuning directly for task ID: {task_id}")
                    
                    # Cập nhật trạng thái thành "running" và lưu vào database
                    running_task = FinetuningTask(
                        id=str(uuid.uuid4()),
                        process_id=process_id,
                        status="running",
                        model_name_or_path=self.tasks[task_id].model_name_or_path,
                        dataset=self.tasks[task_id].dataset,
                        template=self.tasks[task_id].template,
                        output_dir=self.tasks[task_id].output_dir,
                        finetuning_type=self.tasks[task_id].finetuning_type,
                        lora_target=self.tasks[task_id].lora_target,
                        per_device_train_batch_size=self.tasks[task_id].per_device_train_batch_size,
                        gradient_accumulation_steps=self.tasks[task_id].gradient_accumulation_steps,
                        lr_scheduler_type=self.tasks[task_id].lr_scheduler_type,
                        logging_steps=self.tasks[task_id].logging_steps,
                        warmup_ratio=self.tasks[task_id].warmup_ratio,
                        save_steps=self.tasks[task_id].save_steps,
                        learning_rate=self.tasks[task_id].learning_rate,
                        num_train_epochs=self.tasks[task_id].num_train_epochs,
                        max_samples=self.tasks[task_id].max_samples,
                        max_grad_norm=self.tasks[task_id].max_grad_norm,
                        loraplus_lr_ratio=self.tasks[task_id].loraplus_lr_ratio,
                        fp16=self.tasks[task_id].fp16,
                        report_to=self.tasks[task_id].report_to,
                        created_at=datetime.datetime.utcnow(),
                        updated_at=datetime.datetime.utcnow()
                    )
                    db.session.add(running_task)
                    db.session.commit()
                    
                    # Cập nhật task trong bộ nhớ
                    self.tasks[running_task.id] = running_task
                    print(f"Updated task status to 'running' with new ID: {running_task.id}")
                    
                    try:
                        # Lấy task mới nhất từ database
                        task = db.session.query(FinetuningTask).filter_by(id=running_task.id).first()
                        if not task:
                            print(f"Error: Task with ID {running_task.id} not found in database")
                            return False, f"Task not found in database", None
                        
                        print(f"Preparing fine-tuning arguments for task: {task.id}")
                        
                        # Create arguments
                        model_args = ModelArguments(
                            model_name_or_path=task.model_name_or_path,
                        )
                        
                        # Sử dụng đường dẫn tuyệt đối đến thư mục data
                        root_dir = osp.dirname(osp.dirname(osp.dirname(osp.abspath(__file__))))
                        data_dir = osp.join(root_dir, "data")
                        
                        print(f"Using data directory: {data_dir}")
                        print(f"Dataset: {task.dataset}, Template: {task.template}")
                        
                        # Kiểm tra nếu dataset là đường dẫn đến file CSV
                        if isinstance(task.dataset, str) and task.dataset.lower().endswith('.csv'):
                            import pandas as pd
                            import json
                            import shutil
                            
                            # Tạo thư mục tạm để lưu file CSV nếu chưa tồn tại
                            csv_dir = osp.join(data_dir, "csv_uploads")
                            os.makedirs(csv_dir, exist_ok=True)
                            
                            # Tạo tên file duy nhất trong thư mục data
                            csv_filename = f"uploaded_{osp.basename(task.dataset)}"
                            csv_path = osp.join(csv_dir, csv_filename)
                            
                            # Copy file CSV vào thư mục data nếu nó không ở đó
                            if not osp.exists(csv_dir) or not osp.samefile(osp.dirname(task.dataset), csv_dir):
                                shutil.copy2(task.dataset, csv_path)
                                print(f"Copied CSV file to: {csv_path}")
                            else:
                                csv_path = task.dataset
                            
                            # In 5 dòng đầu tiên của file CSV
                            try:
                                df = pd.read_csv(csv_path)
                                print("First 5 rows of CSV file:")
                                print(df.head(5))
                                
                                # Kiểm tra xem có cột 'question' và 'answer' không
                                required_columns = ['question', 'answer']
                                if not all(col in df.columns for col in required_columns):
                                    raise ValueError(f"CSV file must contain columns: {required_columns}")
                                
                                # Chuyển đổi CSV sang định dạng JSON yêu cầu
                                json_data = []
                                for _, row in df.iterrows():
                                    json_data.append({
                                        "instruction": row['question'],
                                        "input": "",
                                        "output": row['answer']
                                    })
                                
                                # Tạo tên file JSON
                                dataset_name = f"csv_dataset_{osp.splitext(osp.basename(task.dataset))[0]}"
                                json_filename = f"{dataset_name}.json"
                                json_path = osp.join(data_dir, json_filename)
                                
                                # Lưu file JSON
                                with open(json_path, 'w', encoding='utf-8') as f:
                                    json.dump(json_data, f, ensure_ascii=False, indent=2)
                                
                                print(f"Converted CSV to JSON and saved to: {json_path}")
                                
                                # Cập nhật file dataset_info.json
                                dataset_info_path = osp.join(data_dir, "dataset_info.json")
                                if osp.exists(dataset_info_path):
                                    with open(dataset_info_path, 'r', encoding='utf-8') as f:
                                        dataset_info = json.load(f)
                                else:
                                    dataset_info = {}
                                
                                # Thêm thông tin dataset mới
                                dataset_info[dataset_name] = {
                                    "file_name": json_filename,
                                    "columns": {
                                        "prompt": "instruction",
                                        "query": "input",
                                        "response": "output"
                                    }
                                }
                                
                                # Lưu lại file dataset_info.json
                                with open(dataset_info_path, 'w', encoding='utf-8') as f:
                                    json.dump(dataset_info, f, ensure_ascii=False, indent=2)
                                
                                print(f"Updated dataset_info.json with new dataset: {dataset_name}")
                                
                                # Sử dụng dataset mới tạo
                                data_args = DataArguments(
                                    dataset=dataset_name,
                                    template=task.template,
                                    dataset_dir=data_dir,
                                )
                                
                            except Exception as e:
                                print(f"Error processing CSV file: {str(e)}")
                                # Nếu có lỗi, sử dụng file CSV trực tiếp
                                data_args = DataArguments(
                                    dataset="csv",  # Đặt loại dataset là csv
                                    template=task.template,
                                    dataset_dir=osp.dirname(csv_path),  # Sử dụng thư mục chứa file CSV
                                )
                        else:
                            # Xử lý như trước đối với dataset thông thường
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
                        
                        print(f"Starting run_sft for task: {task.id}")
                        
                        # Run fine-tuning
                        run_sft(
                            model_args=model_args,
                            data_args=data_args,
                            training_args=training_args,
                            finetuning_args=finetuning_args,
                            generating_args=generating_args,
                        )
                        
                        print(f"Fine-tuning completed successfully for task: {task.id}")
                        
                        # Tạo một bản ghi mới cho trạng thái "completed" và lưu vào database
                        completed_task = FinetuningTask(
                            id=str(uuid.uuid4()),
                            process_id=process_id,
                            status="completed",
                            model_name_or_path=task.model_name_or_path,
                            dataset=task.dataset,
                            template=task.template,
                            output_dir=task.output_dir,
                            finetuning_type=task.finetuning_type,
                            lora_target=task.lora_target,
                            per_device_train_batch_size=task.per_device_train_batch_size,
                            gradient_accumulation_steps=task.gradient_accumulation_steps,
                            lr_scheduler_type=task.lr_scheduler_type,
                            logging_steps=task.logging_steps,
                            warmup_ratio=task.warmup_ratio,
                            save_steps=task.save_steps,
                            learning_rate=task.learning_rate,
                            num_train_epochs=task.num_train_epochs,
                            max_samples=task.max_samples,
                            max_grad_norm=task.max_grad_norm,
                            loraplus_lr_ratio=task.loraplus_lr_ratio,
                            fp16=task.fp16,
                            report_to=task.report_to,
                            created_at=datetime.datetime.utcnow(),
                            updated_at=datetime.datetime.utcnow(),
                            completed_at=datetime.datetime.utcnow()
                        )
                        db.session.add(completed_task)
                        db.session.commit()
                        
                        # Cập nhật task trong bộ nhớ
                        self.tasks[completed_task.id] = completed_task
                        print(f"Updated task status to 'completed' with new ID: {completed_task.id}")
                        
                    except Exception as e:
                        print(f"Error during fine-tuning: {str(e)}")
                        # Tạo một bản ghi mới cho trạng thái "failed" và lưu vào database
                        failed_task = FinetuningTask(
                            id=str(uuid.uuid4()),
                            process_id=process_id,
                            status="failed",
                            model_name_or_path=task.model_name_or_path if 'task' in locals() else running_task.model_name_or_path,
                            dataset=task.dataset if 'task' in locals() else running_task.dataset,
                            template=task.template if 'task' in locals() else running_task.template,
                            output_dir=task.output_dir if 'task' in locals() else running_task.output_dir,
                            error_message=str(e),
                            finetuning_type=task.finetuning_type if 'task' in locals() else running_task.finetuning_type,
                            lora_target=task.lora_target if 'task' in locals() else running_task.lora_target,
                            per_device_train_batch_size=task.per_device_train_batch_size if 'task' in locals() else running_task.per_device_train_batch_size,
                            gradient_accumulation_steps=task.gradient_accumulation_steps if 'task' in locals() else running_task.gradient_accumulation_steps,
                            lr_scheduler_type=task.lr_scheduler_type if 'task' in locals() else running_task.lr_scheduler_type,
                            logging_steps=task.logging_steps if 'task' in locals() else running_task.logging_steps,
                            warmup_ratio=task.warmup_ratio if 'task' in locals() else running_task.warmup_ratio,
                            save_steps=task.save_steps if 'task' in locals() else running_task.save_steps,
                            learning_rate=task.learning_rate if 'task' in locals() else running_task.learning_rate,
                            num_train_epochs=task.num_train_epochs if 'task' in locals() else running_task.num_train_epochs,
                            max_samples=task.max_samples if 'task' in locals() else running_task.max_samples,
                            max_grad_norm=task.max_grad_norm if 'task' in locals() else running_task.max_grad_norm,
                            loraplus_lr_ratio=task.loraplus_lr_ratio if 'task' in locals() else running_task.loraplus_lr_ratio,
                            fp16=task.fp16 if 'task' in locals() else running_task.fp16,
                            report_to=task.report_to if 'task' in locals() else running_task.report_to,
                            created_at=datetime.datetime.utcnow(),
                            updated_at=datetime.datetime.utcnow()
                        )
                        db.session.add(failed_task)
                        db.session.commit()
                        
                        # Cập nhật task trong bộ nhớ
                        self.tasks[failed_task.id] = failed_task
                        print(f"Updated task status to 'failed' with new ID: {failed_task.id}, error: {str(e)}")
                        return False, f"Error during fine-tuning: {str(e)}", task_id
                    
                    return True, f"Fine-tuning task completed with ID: {task_id}", task_id
                    
                except Exception as e:
                    print(f"Error in start_finetuning: {str(e)}")
                    return False, f"Error starting fine-tuning: {str(e)}", None
    
    # Phương thức _run_finetuning đã được tích hợp trực tiếp vào start_finetuning
    
    def get_task_status(self, process_id: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Get the status of a fine-tuning task.
        
        Args:
            process_id: ID chung của quá trình fine-tuning
            
        Returns:
            Tuple of (success, message, task_info)
        """
        # Lấy ứng dụng Flask từ current_app
        app = current_app._get_current_object()
        
        # Sử dụng ngữ cảnh ứng dụng Flask
        with app.app_context():
            # Tìm task mới nhất với process_id tương ứng
            task = db.session.query(FinetuningTask).filter_by(process_id=process_id).order_by(FinetuningTask.created_at.desc()).first()
            
            if not task:
                return False, f"Task not found with process ID: {process_id}", None
            
            return True, f"Task status: {task.status}", task.to_dict()
    
    def get_all_tasks(self) -> List[Dict[str, Any]]:
        """
        Get information about all fine-tuning tasks.
        
        Returns:
            List of dictionaries with task information
        """
        # Lấy ứng dụng Flask từ current_app
        app = current_app._get_current_object()
        
        # Sử dụng ngữ cảnh ứng dụng Flask
        with app.app_context():
            # Lấy tất cả các task từ database, nhóm theo process_id và chỉ lấy task mới nhất của mỗi process
            tasks = []
            process_ids = db.session.query(FinetuningTask.process_id).distinct().all()
            
            for (process_id,) in process_ids:
                latest_task = db.session.query(FinetuningTask).filter_by(process_id=process_id).order_by(FinetuningTask.created_at.desc()).first()
                if latest_task:
                    tasks.append(latest_task.to_dict())
            
            return tasks

# Create a singleton instance
finetune_manager = FinetuneManager()