from typing import Optional, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class QuestionOptionBase(BaseModel):
    label: str
    value: str
    position: int = 0

class QuestionOptionCreate(QuestionOptionBase):
    pass

class QuestionOptionResponse(QuestionOptionBase):
    id: str
    question_id: str

    model_config = ConfigDict(from_attributes=True)

class QuestionBase(BaseModel):
    type: str
    title: str
    description: Optional[str] = None
    required: bool = False
    position: int = 0
    settings_json: Optional[str] = "{}"

class QuestionCreate(QuestionBase):
    options: Optional[list[QuestionOptionCreate]] = []

class QuestionUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    required: Optional[bool] = None
    position: Optional[int] = None
    settings_json: Optional[str] = None
    options: Optional[list[QuestionOptionCreate]] = None

class QuestionResponse(QuestionBase):
    id: str
    form_id: str
    created_at: datetime
    updated_at: datetime
    options: list[QuestionOptionResponse] = []

    model_config = ConfigDict(from_attributes=True)

class QuestionReorderItem(BaseModel):
    id: str
    position: int

class QuestionReorderRequest(BaseModel):
    questions: list[QuestionReorderItem]
