from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.schemas.question import QuestionResponse

class FormBase(BaseModel):
    title: str
    description: Optional[str] = None

class FormCreate(FormBase):
    pass

class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class FormListItem(FormBase):
    id: str
    slug: str
    status: str
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    question_count: int = 0
    response_count: int = 0

    model_config = ConfigDict(from_attributes=True)

class FormResponse(FormBase):
    id: str
    slug: str
    status: str
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    question_count: int = 0
    response_count: int = 0
    questions: list[QuestionResponse] = []

    model_config = ConfigDict(from_attributes=True)
