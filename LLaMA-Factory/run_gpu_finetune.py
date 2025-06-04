#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script để chạy fine-tuning với LoRA trên GPU sử dụng dataset QA tiếng Việt.
"""

from gpu_finetune import GPULoRAFineTuner

if __name__ == "__main__":
    # Tạo fine-tuner với Microsoft Phi-2 (mô hình nhỏ nhưng hiệu quả cho fine-tuning)
    finetuner = GPULoRAFineTuner(
        # Sử dụng mô hình Phi-2 của Microsoft
        model_name_or_path="microsoft/phi-2",
        csv_path="qa_human_hybrid_final.csv",
        output_dir="output/gpu-lora-vietnamese-qa",
        # Tham số LoRA
        lora_rank=8,
        lora_alpha=16,
        lora_dropout=0.05,
        # Tham số training
        learning_rate=2e-4,
        num_train_epochs=3,
        per_device_train_batch_size=4,  # Có thể điều chỉnh dựa trên kích thước VRAM của GPU
        gradient_accumulation_steps=2,  # Tăng lên nếu gặp lỗi OOM (Out of Memory)
        max_seq_length=512,
        # Sử dụng template phù hợp với mô hình
        template="phi",
        # Tham số logging
        logging_steps=5,
        save_steps=100,
        warmup_steps=50,
    )
    
    # Chạy fine-tuning
    finetuner.run_finetuning()