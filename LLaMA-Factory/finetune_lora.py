#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Fine-tuning script for LLaMA-Factory using LoRA with a CSV dataset.
"""

import os
import pandas as pd
import json
from typing import Dict, List, Optional

class LoRAFineTuner:
    """
    A class to handle fine-tuning of language models using LoRA in LLaMA-Factory.
    """
    
    def __init__(
        self,
        model_name_or_path: str,
        csv_path: str,
        output_dir: str = "output/lora-finetuned",
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
        Initialize the LoRA fine-tuner with the given parameters.
        
        Args:
            model_name_or_path: Path to the pre-trained model or its identifier from huggingface.co/models
            csv_path: Path to the CSV file containing question-answer pairs
            output_dir: Directory to save the fine-tuned model
            lora_rank: Rank of the LoRA matrices
            lora_alpha: Alpha parameter for LoRA scaling
            lora_dropout: Dropout probability for LoRA layers
            learning_rate: Learning rate for training
            num_train_epochs: Number of training epochs
            per_device_train_batch_size: Batch size per device during training
            gradient_accumulation_steps: Number of updates steps to accumulate before performing a backward/update pass
            max_seq_length: Maximum sequence length
            template: Template for formatting the data
            logging_steps: Number of steps between logging
            save_steps: Number of steps between model checkpoints
            warmup_steps: Number of steps for learning rate warmup
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
        
        # Create output directory if it doesn't exist
        os.makedirs(self.output_dir, exist_ok=True)
        
    def prepare_dataset(self, output_file: str = "dataset.json") -> str:
        """
        Convert the CSV file to the format required by LLaMA-Factory.
        
        Args:
            output_file: Name of the output JSON file
            
        Returns:
            Path to the created dataset file
        """
        print(f"Loading CSV data from {self.csv_path}...")
        df = pd.read_csv(self.csv_path)
        
        # Check if the CSV has the expected columns
        if 'question' not in df.columns or 'answer' not in df.columns:
            raise ValueError("CSV file must contain 'question' and 'answer' columns")
        
        # Convert to the format expected by LLaMA-Factory
        dataset = []
        for _, row in df.iterrows():
            item = {
                "instruction": row['question'],
                "input": "",  # No additional input
                "output": row['answer']
            }
            dataset.append(item)
        
        # Save as JSON
        dataset_path = os.path.join(self.output_dir, output_file)
        with open(dataset_path, 'w', encoding='utf-8') as f:
            json.dump(dataset, f, ensure_ascii=False, indent=2)
        
        print(f"Created dataset with {len(dataset)} examples at {dataset_path}")
        return dataset_path
    
    def run_finetuning(self, dataset_path: Optional[str] = None) -> None:
        """
        Run the fine-tuning process using LLaMA-Factory.
        
        Args:
            dataset_path: Path to the dataset file. If None, prepare_dataset will be called.
        """
        if dataset_path is None:
            dataset_path = self.prepare_dataset()
        
        # Construct the command for LLaMA-Factory
        command = [
            "python -m llamafactory.cli.run_sft",
            f"--model_name_or_path {self.model_name_or_path}",
            f"--dataset {dataset_path}",
            f"--output_dir {self.output_dir}",
            "--finetuning_type lora",
            f"--lora_rank {self.lora_rank}",
            f"--lora_alpha {self.lora_alpha}",
            f"--lora_dropout {self.lora_dropout}",
            f"--learning_rate {self.learning_rate}",
            f"--num_train_epochs {self.num_train_epochs}",
            f"--per_device_train_batch_size {self.per_device_train_batch_size}",
            f"--gradient_accumulation_steps {self.gradient_accumulation_steps}",
            f"--max_seq_length {self.max_seq_length}",
            f"--template {self.template}",
            f"--logging_steps {self.logging_steps}",
            f"--save_steps {self.save_steps}",
            f"--warmup_steps {self.warmup_steps}",
            "--overwrite_output_dir",
            "--do_train",
            "--report_to none",  # Disable wandb reporting
            "--gradient_checkpointing",  # Enable gradient checkpointing to save memory
            "--fp16",  # Use mixed precision training
        ]
        
        # Join the command parts and execute
        full_command = " \\\n  ".join(command)
        print(f"Running fine-tuning with command:\n{full_command}")
        os.system(full_command)
        
        print(f"Fine-tuning completed. Model saved to {self.output_dir}")

if __name__ == "__main__":
    # Example usage
    finetuner = LoRAFineTuner(
        model_name_or_path="meta-llama/Llama-3-8B-Instruct",  # You can change this to any model
        csv_path="qa_human_hybrid_final.csv",
        output_dir="output/lora-vietnamese-qa",
        num_train_epochs=3,
        per_device_train_batch_size=4,
        max_seq_length=1024,  # Adjust based on your data
        template="llama3",    # Use appropriate template for your model
        logging_steps=5,      # Log more frequently to see progress
    )
    
    # Run the fine-tuning
    finetuner.run_finetuning()