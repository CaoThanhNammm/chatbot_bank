#!/usr/bin/env python
# -*- coding: utf-8 -*-

from vietnamese_qa_model import VietnameseQAModel

def main():
    # Khởi tạo model
    model = VietnameseQAModel(
        model_path="output/gpu-lora-vietnamese-qa-tinyllama",
        device="auto",
        max_new_tokens=512,
        temperature=0.7,
    )
    
    # Câu hỏi cụ thể
    question = "Trường Đại học Nông Lâm Thành phố Hồ Chí Minh trực thuộc cơ quan nào và đã đạt được những huân chương nào?"
    
    print("\nCau hoi:", question)
    print("\nDang xu ly cau hoi...")
    
    # Lấy câu trả lời
    answer = model.answer(question)
    
    # Hiển thị câu trả lời
    print("\nCau tra loi:")
    print(answer)

if __name__ == "__main__":
    main()