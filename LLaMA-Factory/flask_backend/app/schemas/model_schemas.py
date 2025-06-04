"""
Schema validation for model-related API requests.
"""

from marshmallow import Schema, fields, validate, ValidationError, validates, validates_schema

class FinetuningSchema(Schema):
    """Schema for fine-tuning requests."""
    model_name_or_path = fields.String(required=True)
    dataset = fields.String(required=True)
    template = fields.String(required=True)
    output_dir = fields.String(required=True)
    finetuning_type = fields.String(missing="lora")
    lora_target = fields.String(missing="all")
    per_device_train_batch_size = fields.Integer(missing=2)
    gradient_accumulation_steps = fields.Integer(missing=4)
    lr_scheduler_type = fields.String(missing="cosine")
    logging_steps = fields.Integer(missing=5)
    warmup_ratio = fields.Float(missing=0.1)
    save_steps = fields.Integer(missing=1000)
    learning_rate = fields.Float(missing=5e-5)
    num_train_epochs = fields.Float(missing=3.0)
    max_samples = fields.Integer(missing=500)
    max_grad_norm = fields.Float(missing=1.0)
    loraplus_lr_ratio = fields.Float(missing=16.0)
    fp16 = fields.Boolean(missing=True)
    report_to = fields.String(missing="none")

class ModelLoadSchema(Schema):
    """Schema for model loading requests."""
    task_id = fields.String(required=True)

class ModelUnloadSchema(Schema):
    """Schema for model unloading requests."""
    model_id = fields.String(required=True)

class ModelUpdateActiveSchema(Schema):
    """Schema for model activation/deactivation requests."""
    model_id = fields.String(required=True)
    is_active = fields.Boolean(required=True)

# Legacy schemas have been removed