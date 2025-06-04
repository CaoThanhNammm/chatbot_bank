#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Minimal fine-tuning script for Vietnamese QA dataset.
"""

import os
import pandas as pd
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling,
)
from peft import LoraConfig, get_peft_model, TaskType
from datasets import Dataset

# Set up paths
CSV_PATH = "qa_human_hybrid_final.csv"
OUTPUT_DIR = "output/lora-vietnamese-qa"
MODEL_NAME = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load CSV data
print("Loading CSV data...")
df = pd.read_csv(CSV_PATH)

# Create simple text dataset
texts = []
for i, row in df.iterrows():
    # Format as simple instruction-response pair
    text = f"Question: {row['question']}\nAnswer: {row['answer']}\n\n"
    texts.append(text)

# Create dataset
dataset = Dataset.from_dict({"text": texts})
dataset = dataset.train_test_split(test_size=0.1)
print(f"Created dataset with {len(dataset['train'])} training examples")

# Load tokenizer and model
print("Loading tokenizer and model...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)

# Configure LoRA
print("Configuring LoRA...")
lora_config = LoraConfig(
    r=8,
    lora_alpha=16,
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.CAUSAL_LM,
)

# Apply LoRA to model
model = get_peft_model(model, lora_config)

# Tokenize function
def tokenize_function(examples):
    return tokenizer(examples["text"], truncation=True, max_length=512)

# Tokenize dataset
print("Tokenizing dataset...")
tokenized_dataset = dataset.map(tokenize_function, batched=True)

# Set up training arguments
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    num_train_epochs=3,
    per_device_train_batch_size=4,
    save_steps=100,
    logging_steps=10,
    learning_rate=2e-4,
    weight_decay=0.01,
    report_to="none",
)

# Create data collator
data_collator = DataCollatorForLanguageModeling(
    tokenizer=tokenizer,
    mlm=False,
)

# Create trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset["train"],
    eval_dataset=tokenized_dataset["test"],
    data_collator=data_collator,
)

# Start training
print("Starting training...")
trainer.train()

# Save model
print("Saving model...")
model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)

print(f"Fine-tuning completed. Model saved to {OUTPUT_DIR}")