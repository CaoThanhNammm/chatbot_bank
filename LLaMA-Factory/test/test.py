import sys
sys.path.insert(0, '/kaggle/working/LLaMA-Factory/src')

from llamafactory.chat import ChatModel
from llamafactory.extras.misc import torch_gc

args = dict(
  model_name_or_path="unsloth/llama-3-8b-Instruct-bnb-4bit", # use bnb-4bit-quantized Llama-3-8B-Instruct model
  adapter_name_or_path="/kaggle/working/llama3_lora_qa_human_hybrid",         # load the saved LoRA adapters
  template="llama3",                                         # same to the one in training
  finetuning_type="lora",                                    # same to the one in training
)
chat_model = ChatModel(args)

messages = []
print("Welcome to the CLI application, use `clear` to remove the history, use `exit` to exit the application.")
while True:
  query = input("\nUser: ")
  if query.strip() == "exit":
    break
  if query.strip() == "clear":
    messages = []
    torch_gc()
    print("History has been removed.")
    continue

  messages.append({"role": "user", "content": query})
  print("Assistant: ", end="", flush=True)

  response = ""
  for new_text in chat_model.stream_chat(messages):
    print(new_text, end="", flush=True)
    response += new_text
  print()
  messages.append({"role": "assistant", "content": response})

torch_gc()