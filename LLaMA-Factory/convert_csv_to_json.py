import csv
import json
import os
import codecs

# Path to the CSV file
csv_file = "qa_human_hybrid_final.csv"

# Output JSON files
train_json_file = os.path.join("data", "qa_human_hybrid_final", "train.json")
val_json_file = os.path.join("data", "qa_human_hybrid_final", "validation.json")

# Create directory if it doesn't exist
os.makedirs(os.path.join("data", "qa_human_hybrid_final"), exist_ok=True)

# Read CSV file with utf-8-sig to handle BOM character
data = []
with codecs.open(csv_file, 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        data.append({
            "instruction": row["question"],
            "input": "",
            "output": row["answer"]
        })

# Split data into train and validation sets (90% train, 10% validation)
split_idx = int(len(data) * 0.9)
train_data = data[:split_idx]
val_data = data[split_idx:]

# Write train data to JSON file
with open(train_json_file, 'w', encoding='utf-8') as f:
    json.dump(train_data, f, ensure_ascii=False, indent=2)

# Write validation data to JSON file
with open(val_json_file, 'w', encoding='utf-8') as f:
    json.dump(val_data, f, ensure_ascii=False, indent=2)

print(f"Converted {len(data)} rows to JSON format")
print(f"Train data: {len(train_data)} examples saved to {train_json_file}")
print(f"Validation data: {len(val_data)} examples saved to {val_json_file}")