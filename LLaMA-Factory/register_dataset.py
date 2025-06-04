#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script to register a custom dataset with LLaMA-Factory.
"""

import os
import json
import pandas as pd
from pathlib import Path

# Set up paths
CSV_PATH = "qa_human_hybrid_final.csv"
DATASET_NAME = "vietnamese_qa"
CONFIG_DIR = os.path.join("data", DATASET_NAME)
DATASET_INFO_PATH = os.path.join("data", "dataset_info.json")

# Create dataset directory
os.makedirs(CONFIG_DIR, exist_ok=True)

def prepare_dataset():
    """
    Convert CSV to the format required by LLaMA-Factory and register it.
    """
    print(f"Loading CSV data from {CSV_PATH}...")
    df = pd.read_csv(CSV_PATH)
    
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
    
    # Save as JSON in the dataset directory
    train_path = os.path.join(CONFIG_DIR, "train.json")
    with open(train_path, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)
    
    # Create a small validation set (10% of the data)
    val_size = max(1, len(dataset) // 10)
    val_dataset = dataset[:val_size]
    
    val_path = os.path.join(CONFIG_DIR, "validation.json")
    with open(val_path, 'w', encoding='utf-8') as f:
        json.dump(val_dataset, f, ensure_ascii=False, indent=2)
    
    print(f"Created dataset with {len(dataset)} training examples and {len(val_dataset)} validation examples")
    
    # Register the dataset in dataset_info.json
    register_dataset(DATASET_NAME)
    
    return DATASET_NAME

def register_dataset(dataset_name):
    """
    Register the dataset in dataset_info.json.
    """
    # Create or load dataset_info.json
    if os.path.exists(DATASET_INFO_PATH):
        with open(DATASET_INFO_PATH, 'r', encoding='utf-8') as f:
            dataset_info = json.load(f)
    else:
        dataset_info = {}
    
    # Add our dataset
    dataset_info[dataset_name] = {
        "hf_hub_url": "",
        "script_url": "",
        "columns": {
            "prompt": "instruction",
            "query": "input",
            "response": "output",
            "history": ""
        }
    }
    
    # Save the updated dataset_info.json
    with open(DATASET_INFO_PATH, 'w', encoding='utf-8') as f:
        json.dump(dataset_info, f, ensure_ascii=False, indent=2)
    
    print(f"Registered dataset '{dataset_name}' in {DATASET_INFO_PATH}")

if __name__ == "__main__":
    dataset_name = prepare_dataset()
    print(f"Dataset '{dataset_name}' is ready for fine-tuning.")
    print("You can now run fine-tuning with:")
    print(f"python -m llamafactory.launcher --stage sft --do_train --model_name_or_path TinyLlama/TinyLlama-1.1B-Chat-v1.0 --dataset {dataset_name} --template llama2 --finetuning_type lora --output_dir output/lora-vietnamese-qa")