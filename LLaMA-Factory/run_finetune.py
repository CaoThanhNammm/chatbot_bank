#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script để chạy fine-tuning với LoRA trên GPU sử dụng dataset QA tiếng Việt.
"""

from gpu_finetune import GPULoRAFineTuner

if __name__ == "__main__":
    # Tạo fine-tuner với Microsoft Phi-2 (mô hình nhỏ nhưng hiệu quả cho fine-tuning)
    finetuner = GPULoRAFineTuner(
        # Sử dụng mô hình TinyLlama (nhỏ hơn Phi-2)
        model_name_or_path="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
        csv_path="qa_human_hybrid_final.csv",
        output_dir="output/gpu-lora-vietnamese-qa-tinyllama",
        # Tham số LoRA
        lora_rank=8,
        lora_alpha=16,
        lora_dropout=0.05,
        # Tham số training
        learning_rate=2e-4,
        num_train_epochs=3,
        per_device_train_batch_size=1,  # Giảm batch size xuống 1 để phù hợp với VRAM
        gradient_accumulation_steps=8,  # Tăng lên để bù đắp cho batch size nhỏ
        max_seq_length=256,  # Giảm độ dài chuỗi để tiết kiệm bộ nhớ
        # Sử dụng template phù hợp với mô hình
        template="llama2",
        # Tham số logging
        logging_steps=5,
        save_steps=100,
        warmup_steps=50,
    )
    
    # Chạy fine-tuning
    finetuner.run_finetuning()