#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script to prepare the dataset for LLaMA-Factory.
"""

import os
import pandas as pd
import json

def prepare_dataset(csv_path, output_dir, output_file="dataset.json"):
    """
    Convert the CSV file to the format required by LLaMA-Factory.
    
    Args:
        csv_path: Path to the CSV file
        output_dir: Directory to save the output file
        output_file: Name of the output JSON file
        
    Returns:
        Path to the created dataset file
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
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Save as JSON
    dataset_path = os.path.join(output_dir, output_file)
    with open(dataset_path, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)
    
    print(f"Created dataset with {len(dataset)} examples at {dataset_path}")
    return dataset_path

if __name__ == "__main__":
    # Prepare the dataset
    dataset_path = prepare_dataset(
        csv_path="qa_human_hybrid_final.csv",
        output_dir="data",
        output_file="vietnamese_qa.json"
    )
    
    print(f"Dataset prepared at: {dataset_path}")
    print("You can now use this dataset with LLaMA-Factory for fine-tuning.")