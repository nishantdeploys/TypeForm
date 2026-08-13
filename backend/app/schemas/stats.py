from typing import Optional, Any
from pydantic import BaseModel

class OptionStat(BaseModel):
    label: str
    value: str
    count: int
    percentage: float

class QuestionStat(BaseModel):
    question_id: str
    title: str
    type: str
    total_answers: int
    average_number: Optional[float] = None
    options: list[OptionStat] = []
    text_samples: list[str] = []

class FormStatsResponse(BaseModel):
    form_id: str
    total_responses: int
    avg_completion_time: Optional[float] = None
    questions_stats: list[QuestionStat] = []
