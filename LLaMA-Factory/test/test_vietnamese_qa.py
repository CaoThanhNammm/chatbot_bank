#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import torch
from llamafactory.chat import ChatModel
from llamafactory.extras.misc import torch_gc

class VietnameseQAModelTester:
    """
    A class to test Vietnamese QA model trained with LLaMA-Factory
    """
    
    def __init__(self, model_path, base_model_path=None, template="llama3", finetuning_type="lora"):
        """
        Initialize the model tester
        
        Args:
            model_path: Path to the fine-tuned model or adapter
            base_model_path: Path to the base model (if None, will be inferred from adapter config)
            template: Template name used for formatting prompts
            finetuning_type: Type of fine-tuning (lora, full, etc.)
        """
        self.model_path = model_path
        self.base_model_path = base_model_path
        self.template = template
        self.finetuning_type = finetuning_type
        
        # Initialize the model
        self.chat_model = None
        self._initialize_model()
        
    def _initialize_model(self):
        """Initialize the chat model with the specified parameters"""
        args = {
            "model_name_or_path": self.base_model_path or "unsloth/llama-3-8b-Instruct-bnb-4bit",
            "adapter_name_or_path": self.model_path,
            "template": self.template,
            "finetuning_type": self.finetuning_type,
        }
        
        print(f"Initializing model with args: {args}")
        self.chat_model = ChatModel(args)
        print("Model initialized successfully!")
        
    def ask_question(self, question, stream=True):
        """
        Ask a question to the model
        
        Args:
            question: The question to ask
            stream: Whether to stream the response or not
            
        Returns:
            The model's response
        """
        messages = [{"role": "user", "content": question}]
        
        if stream:
            print("Assistant: ", end="", flush=True)
            response = ""
            for new_text in self.chat_model.stream_chat(messages):
                print(new_text, end="", flush=True)
                response += new_text
            print()
            return response
        else:
            response = self.chat_model.chat(messages)[0].content
            print(f"Assistant: {response}")
            return response
            
    def cleanup(self):
        """Clean up GPU memory"""
        torch_gc()
        

def main():
    # Set the model path
    model_path = "output/llama3_lora_qa_human_hybrid"
    
    # Create the tester
    tester = VietnameseQAModelTester(
        model_path=model_path,
        template="llama3",
        finetuning_type="lora"
    )
    
    # Test with a specific question
    question = "Trường Đại học Nông Lâm Thành phố Hồ Chí Minh tọa lạc ở đâu và có diện tích bao nhiêu?"
    
    print("\nQuestion:", question)
    tester.ask_question(question)
    
    # Clean up
    tester.cleanup()
    

if __name__ == "__main__":
    main()