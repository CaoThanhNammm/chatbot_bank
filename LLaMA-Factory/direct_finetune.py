#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Direct fine-tuning script using LLaMA-Factory's internal API.
"""

import os
import json
import pandas as pd
from typing import List, Dict, Any, Optional

from transformers import TrainingArguments

from llamafactory.hparams import (
    ModelArguments,
    DataArguments,
    FinetuningArguments,
)
from llamafactory.data import get_template_and_fix_tokenizer
from llamafactory.model import load_model, load_tokenizer
from llamafactory.train.sft.trainer import CustomSeq2SeqTrainer
from llamafactory.data.template import Llama2Template
from llamafactory.data.loader import load_dataset, split_dataset

# Set up paths
CSV_PATH = "qa_human_hybrid_final.csv"
OUTPUT_DIR = "output/lora-vietnamese-qa"
DATASET_PATH = os.path.join(OUTPUT_DIR, "dataset.json")

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

def prepare_dataset(csv_path: str, output_path: str) -> None:
    """
    Convert CSV to the format required by LLaMA-Factory.
    """
    print(f"Loading CSV data from {csv_path}...")
    df = pd.read_csv(csv_path)
    
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
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)
    
    print(f"Created dataset with {len(dataset)} examples at {output_path}")

def run_finetuning():
    """
    Run the fine-tuning process using LLaMA-Factory's internal API.
    """
    # Prepare the dataset
    prepare_dataset(CSV_PATH, DATASET_PATH)
    
    # Define arguments
    model_args = ModelArguments(
        model_name_or_path="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
    )
    
    data_args = DataArguments(
        dataset=DATASET_PATH,  # Use the path to our JSON file
        template="llama2",
        cutoff_len=512,
    )
    
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        num_train_epochs=3,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=1,
        learning_rate=2e-4,
        logging_steps=5,
        save_steps=100,
        warmup_steps=50,
        fp16=True,
        report_to="none",
        overwrite_output_dir=True,
        do_train=True,
    )
    
    finetuning_args = FinetuningArguments(
        finetuning_type="lora",
        lora_rank=8,
        lora_alpha=16,
        lora_dropout=0.05,
    )
    
    # Load tokenizer and model
    print("Loading tokenizer and model...")
    tokenizer_module = load_tokenizer(model_args)
    tokenizer = tokenizer_module["tokenizer"]
    
    # Set up template
    template = Llama2Template(tokenizer)
    
    # Load dataset
    print("Loading dataset...")
    dataset_dict = json.load(open(DATASET_PATH, "r", encoding="utf-8"))
    
    # Process dataset
    train_dataset = []
    for example in dataset_dict:
        train_dataset.append({
            "instruction": example["instruction"],
            "input": example.get("input", ""),
            "output": example["output"]
        })
    
    # Tokenize dataset
    print("Tokenizing dataset...")
    tokenized_train_dataset = []
    for example in train_dataset:
        prompt = template.get_prompt(
            example["instruction"],
            example["input"]
        )
        prompt_ids = tokenizer.encode(prompt, add_special_tokens=False)
        
        response = example["output"]
        response_ids = tokenizer.encode(response, add_special_tokens=False)
        
        input_ids = prompt_ids + response_ids + [tokenizer.eos_token_id]
        
        # Create labels: -100 for prompt (will be ignored in loss calculation)
        labels = [-100] * len(prompt_ids) + response_ids + [tokenizer.eos_token_id]
        
        # Truncate if needed
        if len(input_ids) > data_args.cutoff_len:
            input_ids = input_ids[:data_args.cutoff_len]
            labels = labels[:data_args.cutoff_len]
        
        tokenized_train_dataset.append({
            "input_ids": input_ids,
            "labels": labels,
            "attention_mask": [1] * len(input_ids)
        })
    
    # Load model
    print("Loading model...")
    model = load_model(tokenizer, model_args, finetuning_args, training_args.do_train)
    
    # Create trainer
    print("Creating trainer...")
    trainer = CustomSeq2SeqTrainer(
        model=model,
        args=training_args,
        finetuning_args=finetuning_args,
        train_dataset=tokenized_train_dataset,
        tokenizer=tokenizer,
    )
    
    # Start training
    print("Starting training...")
    trainer.train()
    
    # Save model
    print("Saving model...")
    trainer.save_model()
    
    print(f"Fine-tuning completed. Model saved to {OUTPUT_DIR}")

if __name__ == "__main__":
    run_finetuning()