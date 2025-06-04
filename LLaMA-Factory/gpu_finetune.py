#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script để fine-tuning mô hình ngôn ngữ trên GPU sử dụng LoRA với dataset tiếng Việt.
"""

import os
import pandas as pd
import json
import torch
from typing import Dict, List, Optional

class GPULoRAFineTuner:
    """
    Class để fine-tuning mô hình ngôn ngữ sử dụng LoRA trên GPU.
    """
    
    def __init__(
        self,
        model_name_or_path: str,
        csv_path: str,
        output_dir: str = "output/gpu-lora-finetuned",
        lora_rank: int = 8,
        lora_alpha: int = 16,
        lora_dropout: float = 0.05,
        learning_rate: float = 2e-4,
        num_train_epochs: int = 3,
        per_device_train_batch_size: int = 4,
        gradient_accumulation_steps: int = 1,
        max_seq_length: int = 512,
        template: str = "llama3",
        logging_steps: int = 10,
        save_steps: int = 100,
        warmup_steps: int = 100,
    ):
        """
        Khởi tạo LoRA fine-tuner với các tham số đã cho.
        
        Args:
            model_name_or_path: Đường dẫn đến mô hình pre-trained hoặc ID từ huggingface.co/models
            csv_path: Đường dẫn đến file CSV chứa các cặp câu hỏi-trả lời
            output_dir: Thư mục để lưu mô hình đã fine-tuned
            lora_rank: Rank của ma trận LoRA
            lora_alpha: Tham số Alpha cho LoRA scaling
            lora_dropout: Xác suất dropout cho các lớp LoRA
            learning_rate: Tốc độ học cho quá trình training
            num_train_epochs: Số epoch training
            per_device_train_batch_size: Kích thước batch trên mỗi thiết bị trong quá trình training
            gradient_accumulation_steps: Số bước cập nhật để tích lũy trước khi thực hiện backward/update pass
            max_seq_length: Độ dài tối đa của chuỗi
            template: Template để định dạng dữ liệu
            logging_steps: Số bước giữa các lần ghi log
            save_steps: Số bước giữa các lần lưu checkpoint mô hình
            warmup_steps: Số bước cho quá trình warmup learning rate
        """
        self.model_name_or_path = model_name_or_path
        self.csv_path = csv_path
        self.output_dir = output_dir
        self.lora_rank = lora_rank
        self.lora_alpha = lora_alpha
        self.lora_dropout = lora_dropout
        self.learning_rate = learning_rate
        self.num_train_epochs = num_train_epochs
        self.per_device_train_batch_size = per_device_train_batch_size
        self.gradient_accumulation_steps = gradient_accumulation_steps
        self.max_seq_length = max_seq_length
        self.template = template
        self.logging_steps = logging_steps
        self.save_steps = save_steps
        self.warmup_steps = warmup_steps
        
        # Kiểm tra GPU
        self.has_gpu = torch.cuda.is_available()
        if self.has_gpu:
            self.gpu_name = torch.cuda.get_device_name(0)
            self.gpu_count = torch.cuda.device_count()
            print(f"GPU detected: {self.gpu_name} (Count: {self.gpu_count})")
        else:
            print("No GPU detected. Fine-tuning will run on CPU.")
        
        # Tạo thư mục output nếu chưa tồn tại
        os.makedirs(self.output_dir, exist_ok=True)
        
    def prepare_dataset(self, output_file: str = "dataset.json") -> str:
        """
        Chuyển đổi file CSV sang định dạng yêu cầu bởi LLaMA-Factory.
        
        Args:
            output_file: Tên của file JSON đầu ra
            
        Returns:
            Đường dẫn đến file dataset đã tạo
        """
        print(f"Loading CSV data from {self.csv_path}...")
        df = pd.read_csv(self.csv_path)
        
        # Kiểm tra xem CSV có các cột mong đợi không
        if 'question' not in df.columns or 'answer' not in df.columns:
            raise ValueError("CSV file must contain 'question' and 'answer' columns")
        
        # Chuyển đổi sang định dạng mong đợi bởi LLaMA-Factory
        dataset = []
        for _, row in df.iterrows():
            item = {
                "instruction": row['question'],
                "input": "",  # No additional input
                "output": row['answer']
            }
            dataset.append(item)
        
        # Lưu dưới dạng JSON
        dataset_path = os.path.join(self.output_dir, output_file)
        with open(dataset_path, 'w', encoding='utf-8') as f:
            json.dump(dataset, f, ensure_ascii=False, indent=2)
        
        print(f"Created dataset with {len(dataset)} examples at {dataset_path}")
        return dataset_path
    
    def save_config(self) -> None:
        """
        Lưu cấu hình fine-tuning để tham khảo sau này.
        """
        config = {
            "model_name_or_path": self.model_name_or_path,
            "csv_path": self.csv_path,
            "output_dir": self.output_dir,
            "lora_rank": self.lora_rank,
            "lora_alpha": self.lora_alpha,
            "lora_dropout": self.lora_dropout,
            "learning_rate": self.learning_rate,
            "num_train_epochs": self.num_train_epochs,
            "per_device_train_batch_size": self.per_device_train_batch_size,
            "gradient_accumulation_steps": self.gradient_accumulation_steps,
            "max_seq_length": self.max_seq_length,
            "template": self.template,
            "logging_steps": self.logging_steps,
            "save_steps": self.save_steps,
            "warmup_steps": self.warmup_steps,
            "gpu_info": {
                "has_gpu": self.has_gpu,
                "gpu_name": getattr(self, 'gpu_name', 'N/A'),
                "gpu_count": getattr(self, 'gpu_count', 0)
            }
        }
        
        config_path = os.path.join(self.output_dir, "fine_tuning_config.json")
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
        
        print(f"Saved fine-tuning configuration at {config_path}")
    
    def format_prompt(self, instruction, input_text=""):
        """
        Format the prompt using the appropriate template for the model.
        """
        if self.template == "llama2":
            if input_text:
                return f"<s>[INST] {instruction} [/INST] {input_text} </s>"
            else:
                return f"<s>[INST] {instruction} [/INST] </s>"
        elif self.template == "llama3":
            if input_text:
                return f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nYou are a helpful assistant.<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{instruction}\n\n{input_text}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
            else:
                return f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nYou are a helpful assistant.<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{instruction}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
        elif self.template == "gemma":
            if input_text:
                return f"<start_of_turn>user\n{instruction}\n{input_text}<end_of_turn>\n<start_of_turn>model\n"
            else:
                return f"<start_of_turn>user\n{instruction}<end_of_turn>\n<start_of_turn>model\n"
        elif self.template == "phi":
            if input_text:
                return f"<|user|>\n{instruction}\n{input_text}\n<|assistant|>\n"
            else:
                return f"<|user|>\n{instruction}\n<|assistant|>\n"
        else:
            # Default format
            if input_text:
                return f"### Instruction:\n{instruction}\n\n### Input:\n{input_text}\n\n### Response:\n"
            else:
                return f"### Instruction:\n{instruction}\n\n### Response:\n"

    def preprocess_function(self, examples, tokenizer, max_length=512):
        """
        Preprocess the examples for training.
        """
        # Format inputs
        prompts = [self.format_prompt(instruction) for instruction in examples["instruction"]]
        
        # Tokenize inputs
        tokenized_inputs = tokenizer(
            prompts,
            truncation=True,
            max_length=max_length,
            padding="max_length",
            return_tensors="pt",
        )
        
        # Tokenize targets
        tokenized_targets = tokenizer(
            examples["output"],
            truncation=True,
            max_length=max_length,
            padding="max_length",
            return_tensors="pt",
        )
        
        # Create labels (we'll use -100 to mask the prompt part during loss calculation)
        labels = tokenized_targets["input_ids"].clone()
        
        # Set up the labels for training
        for i in range(len(prompts)):
            # Calculate the length of the prompt
            prompt_len = len(tokenizer(prompts[i], return_tensors="pt")["input_ids"][0])
            
            # Set prompt tokens to -100 (ignored in loss calculation)
            labels[i, :prompt_len] = -100
        
        tokenized_inputs["labels"] = labels
        
        return tokenized_inputs

    def run_finetuning(self, dataset_path: Optional[str] = None) -> None:
        """
        Run the fine-tuning process using direct Hugging Face Transformers approach.
        
        Args:
            dataset_path: Path to the dataset file. If None, prepare_dataset will be called.
        """
        import torch
        from datasets import Dataset
        from transformers import (
            AutoModelForCausalLM,
            AutoTokenizer,
            TrainingArguments,
            Trainer,
            DataCollatorForSeq2Seq,
        )
        from peft import (
            LoraConfig,
            get_peft_model,
            prepare_model_for_kbit_training,
            TaskType,
        )
        
        # Prepare the dataset
        if dataset_path is None:
            dataset_path = self.prepare_dataset()
        
        # Save configuration
        self.save_config()
        
        # Load the dataset from JSON
        with open(dataset_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Convert to the format expected by Hugging Face
        dataset_dict = {
            "instruction": [item["instruction"] for item in data],
            "input": [item["input"] for item in data],
            "output": [item["output"] for item in data]
        }
        
        # Create a Hugging Face Dataset
        dataset = Dataset.from_dict(dataset_dict)
        
        # Split into train and validation
        dataset = dataset.train_test_split(test_size=0.1)
        
        print(f"Created dataset with {len(dataset['train'])} training examples and {len(dataset['test'])} validation examples")
        
        # Load tokenizer
        print(f"Loading tokenizer from {self.model_name_or_path}...")
        tokenizer = AutoTokenizer.from_pretrained(self.model_name_or_path)
        
        # Ensure the tokenizer has a pad token
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        # Preprocess the dataset
        print("Preprocessing dataset...")
        tokenized_dataset = dataset.map(
            lambda examples: self.preprocess_function(examples, tokenizer, self.max_seq_length),
            batched=True,
            remove_columns=dataset["train"].column_names,
        )
        
        # Load model with memory optimization
        print(f"Loading model from {self.model_name_or_path}...")
        
        # Set environment variable to avoid memory fragmentation
        os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"
        
        # Try to import bitsandbytes for 8-bit quantization
        try:
            import bitsandbytes as bnb
            has_bnb = True
            print("Using 8-bit quantization with bitsandbytes")
        except ImportError:
            has_bnb = False
            print("bitsandbytes not found, using standard precision")
        
        # Load with 8-bit quantization if available
        if has_bnb and self.has_gpu:
            model = AutoModelForCausalLM.from_pretrained(
                self.model_name_or_path,
                load_in_8bit=True,
                device_map="auto",
                low_cpu_mem_usage=True,
                max_memory={0: "3GiB"},
            )
        else:
            model = AutoModelForCausalLM.from_pretrained(
                self.model_name_or_path,
                torch_dtype=torch.float16 if self.has_gpu else torch.float32,
                device_map="auto" if self.has_gpu else "cpu",
                low_cpu_mem_usage=True,
            )
        
        # Configure LoRA
        print("Configuring LoRA...")
        lora_config = LoraConfig(
            r=self.lora_rank,
            lora_alpha=self.lora_alpha,
            lora_dropout=self.lora_dropout,
            bias="none",
            task_type=TaskType.CAUSAL_LM,
            target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],  # Common target modules
        )
        
        # Prepare model for training
        model = prepare_model_for_kbit_training(model)
        model = get_peft_model(model, lora_config)
        
        # Ensure all trainable parameters require gradients
        for name, param in model.named_parameters():
            if param.requires_grad:
                param.requires_grad_(True)  # Explicitly set requires_grad
        
        # Handle meta device issue
        try:
            # Check if any parameter is on meta device
            has_meta_device = any(p.device.type == 'meta' for p in model.parameters())
            
            if has_meta_device:
                print("Detected parameters on meta device. Using to_empty() to move model.")
                # Use to_empty() as suggested in the error message
                device = "cuda:0" if self.has_gpu else "cpu"
                model = model.to_empty(device=device)
        except Exception as e:
            print(f"Warning: Error handling meta device: {e}")
        
        # Print trainable parameters
        model.print_trainable_parameters()
        
        # Set up training arguments with memory optimization
        training_args = TrainingArguments(
            output_dir=self.output_dir,
            num_train_epochs=self.num_train_epochs,
            per_device_train_batch_size=self.per_device_train_batch_size,
            gradient_accumulation_steps=self.gradient_accumulation_steps,
            learning_rate=self.learning_rate,
            logging_steps=self.logging_steps,
            save_steps=self.save_steps,
            warmup_steps=self.warmup_steps,
            fp16=self.has_gpu,
            report_to="none",
            overwrite_output_dir=True,
            save_total_limit=1,  # Keep only the latest checkpoint to save space
            gradient_checkpointing=False,  # Disable gradient checkpointing due to issues
            # Memory optimization options
            optim="adamw_torch",  # Use torch's AdamW which is more memory efficient
            dataloader_num_workers=0,  # Reduce parallel workers
            dataloader_pin_memory=False,  # Disable pinned memory
            ddp_find_unused_parameters=False,  # Optimize DDP
            torch_compile=False,  # Disable torch compilation
        )
        
        # Create data collator
        data_collator = DataCollatorForSeq2Seq(
            tokenizer=tokenizer,
            padding=True,
            return_tensors="pt",
        )
        
        # Create trainer with device placement handled by Trainer
        trainer = Trainer(
            model=model,
            args=training_args,
            train_dataset=tokenized_dataset["train"],
            eval_dataset=tokenized_dataset["test"],
            data_collator=data_collator,
            # Disable model to device movement in Trainer
            # We've already handled it with to_empty() if needed
            model_init=lambda: model,
        )
        
        # Start training
        print("Starting training...")
        trainer.train()
        
        # Save model
        print("Saving model...")
        model.save_pretrained(self.output_dir)
        tokenizer.save_pretrained(self.output_dir)
        
        print(f"Fine-tuning completed. Model saved to {self.output_dir}")