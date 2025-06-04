#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script to prepare a dataset for LoRA fine-tuning.
"""

import os
import pandas as pd
from datasets import Dataset
from transformers import AutoTokenizer

# Set up paths
CSV_PATH = "qa_human_hybrid_final.csv"
OUTPUT_DIR = "output/lora-vietnamese-qa"
MODEL_NAME = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load CSV data
print(f"Loading CSV data from {CSV_PATH}...")
df = pd.read_csv(CSV_PATH)

# Display some statistics
print(f"Total examples: {len(df)}")
print(f"Question column: {df['question'].name}")
print(f"Answer column: {df['answer'].name}")
print("\nSample data:")
print(df.head(2))

# Create dataset
data = {
    "instruction": df["question"].tolist(),
    "output": df["answer"].tolist()
}
dataset = Dataset.from_dict(data)
dataset = dataset.train_test_split(test_size=0.1)
print(f"\nCreated dataset with {len(dataset['train'])} training examples and {len(dataset['test'])} validation examples")

# Load tokenizer
print(f"\nLoading tokenizer from {MODEL_NAME}...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

# Define prompt template
def format_prompt(instruction):
    return f"<s>[INST] {instruction} [/INST] </s>"

# Show a sample prompt
sample_instruction = df["question"].iloc[0]
sample_output = df["answer"].iloc[0]
formatted_prompt = format_prompt(sample_instruction)

print("\nSample instruction:")
print(sample_instruction)
print("\nSample output:")
print(sample_output)
print("\nFormatted prompt:")
print(formatted_prompt)

# Tokenize the sample
tokenized_prompt = tokenizer(formatted_prompt, return_tensors="pt")
tokenized_output = tokenizer(sample_output, return_tensors="pt")

print(f"\nPrompt token count: {len(tokenized_prompt['input_ids'][0])}")
print(f"Output token count: {len(tokenized_output['input_ids'][0])}")
print(f"Total token count: {len(tokenized_prompt['input_ids'][0]) + len(tokenized_output['input_ids'][0])}")

# Save dataset to disk
train_path = os.path.join(OUTPUT_DIR, "train.json")
test_path = os.path.join(OUTPUT_DIR, "test.json")
dataset["train"].to_json(train_path)
dataset["test"].to_json(test_path)

print(f"\nDataset saved to {train_path} and {test_path}")
print("\nTo fine-tune with this dataset, you would run a command like:")
print(f"python -m transformers.trainer train --model_name_or_path {MODEL_NAME} --train_file {train_path} --validation_file {test_path} --output_dir {OUTPUT_DIR} --num_train_epochs 3 --per_device_train_batch_size 4 --learning_rate 2e-4 --fp16")