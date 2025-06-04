#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Direct LoRA fine-tuning script using Hugging Face Transformers.
"""

import os
import json
import pandas as pd
import torch
from typing import List, Dict, Any
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

# Set up paths
CSV_PATH = "qa_human_hybrid_final.csv"
OUTPUT_DIR = "output/lora-vietnamese-qa"
MODEL_NAME = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

def prepare_dataset():
    """
    Convert CSV to a Hugging Face Dataset.
    """
    print(f"Loading CSV data from {CSV_PATH}...")
    df = pd.read_csv(CSV_PATH)
    
    # Check if the CSV has the expected columns
    if 'question' not in df.columns or 'answer' not in df.columns:
        raise ValueError("CSV file must contain 'question' and 'answer' columns")
    
    # Convert to the format expected by Hugging Face
    data = {
        "instruction": df["question"].tolist(),
        "input": [""] * len(df),  # No additional input
        "output": df["answer"].tolist()
    }
    
    # Create a Hugging Face Dataset
    dataset = Dataset.from_dict(data)
    
    # Split into train and validation
    dataset = dataset.train_test_split(test_size=0.1)
    
    print(f"Created dataset with {len(dataset['train'])} training examples and {len(dataset['test'])} validation examples")
    
    return dataset

def format_prompt(instruction, input_text=""):
    """
    Format the prompt using Llama 2 style.
    """
    if input_text:
        return f"<s>[INST] {instruction} [/INST] {input_text} </s>"
    else:
        return f"<s>[INST] {instruction} [/INST] </s>"

def preprocess_function(examples, tokenizer, max_length=512):
    """
    Preprocess the examples for training.
    """
    # Format inputs
    prompts = [format_prompt(instruction) for instruction in examples["instruction"]]
    
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

def run_finetuning():
    """
    Run the fine-tuning process.
    """
    # Prepare the dataset
    dataset = prepare_dataset()
    
    # Load tokenizer
    print(f"Loading tokenizer from {MODEL_NAME}...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    
    # Ensure the tokenizer has a pad token
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    
    # Preprocess the dataset
    print("Preprocessing dataset...")
    tokenized_dataset = dataset.map(
        lambda examples: preprocess_function(examples, tokenizer),
        batched=True,
        remove_columns=dataset["train"].column_names,
    )
    
    # Load model
    print(f"Loading model from {MODEL_NAME}...")
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        torch_dtype=torch.float16,
        device_map="auto",
    )
    
    # Configure LoRA
    print("Configuring LoRA...")
    lora_config = LoraConfig(
        r=8,                      # Rank
        lora_alpha=16,            # Alpha parameter
        lora_dropout=0.05,        # Dropout probability
        bias="none",              # Bias type
        task_type=TaskType.CAUSAL_LM,  # Task type
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],  # Which modules to apply LoRA to
    )
    
    # Prepare model for training
    model = prepare_model_for_kbit_training(model)
    model = get_peft_model(model, lora_config)
    
    # Print trainable parameters
    model.print_trainable_parameters()
    
    # Set up training arguments
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
        save_total_limit=3,
    )
    
    # Create data collator
    data_collator = DataCollatorForSeq2Seq(
        tokenizer=tokenizer,
        padding=True,
        return_tensors="pt",
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

if __name__ == "__main__":
    run_finetuning()