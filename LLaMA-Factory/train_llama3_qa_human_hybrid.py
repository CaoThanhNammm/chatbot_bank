import json

args = dict(
  stage="sft",                                               # do supervised fine-tuning
  do_train=True,
  model_name_or_path="unsloth/llama-3-8b-Instruct-bnb-4bit", # use bnb-4bit-quantized Llama-3-8B-Instruct model
  dataset="qa_human_hybrid_final",                           # use qa_human_hybrid_final dataset
  template="llama3",                                         # use llama3 prompt template
  finetuning_type="lora",                                    # use LoRA adapters to save memory
  lora_target="all",                                         # attach LoRA adapters to all linear layers
  output_dir="llama3_lora_qa_human_hybrid",                  # the path to save LoRA adapters
  per_device_train_batch_size=2,                             # the micro batch size
  gradient_accumulation_steps=4,                             # the gradient accumulation steps
  lr_scheduler_type="cosine",                                # use cosine learning rate scheduler
  logging_steps=5,                                           # log every 5 steps
  warmup_ratio=0.1,                                          # use warmup scheduler
  save_steps=1000,                                           # save checkpoint every 1000 steps
  learning_rate=5e-5,                                        # the learning rate
  num_train_epochs=3.0,                                      # the epochs of training
  max_samples=500,                                           # use 500 examples in each dataset
  max_grad_norm=1.0,                                         # clip gradient norm to 1.0
  loraplus_lr_ratio=16.0,                                    # use LoRA+ algorithm with lambda=16.0
  fp16=True,                                                 # use float16 mixed precision training
  report_to="none",                                          # disable wandb logging
)

json.dump(args, open("train_llama3_qa_human_hybrid.json", "w", encoding="utf-8"), indent=2)
print("Configuration saved to train_llama3_qa_human_hybrid.json")
print("To train the model, run:")
print("cd /kaggle/working/LLaMA-Factory")
print("llamafactory-cli train train_llama3_qa_human_hybrid.json")