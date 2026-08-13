from typing import Optional, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ResponseAnswerCreate(BaseModel):
    question_id: str
    answer_text: Optional[str] = None
    answer_number: Optional[float] = None
    answer_json: Optional[str] = None

class ResponseAnswerResponse(BaseModel):
    id: str
    question_id: str
    question_title: Optional[str] = None
    question_type: Optional[str] = None
    answer_text: Optional[str] = None
    answer_number: Optional[float] = None
    answer_json: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ResponseCreate(BaseModel):
    completion_time: Optional[float] = None
    metadata_json: Optional[str] = "{}"
    answers: list[ResponseAnswerCreate]

class ResponseListItem(BaseModel):
    id: str
    form_id: str
    submitted_at: datetime
    completion_time: Optional[float] = None
    answers_count: int = 0
    preview_answers: dict[str, Any] = {}

    model_config = ConfigDict(from_attributes=True)

class ResponseDetailResponse(BaseModel):
    id: str
    form_id: str
    submitted_at: datetime
    completion_time: Optional[float] = None
    metadata_json: Optional[str] = "{}"
    answers: list[ResponseAnswerResponse] = []

    model_config = ConfigDict(from_attributes=True)
