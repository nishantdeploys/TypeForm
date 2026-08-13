import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Response(Base):
    __tablename__ = "responses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    form_id = Column(String(36), ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True)
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completion_time = Column(Float, nullable=True)
    metadata_json = Column(Text, default="{}", nullable=False)

    form = relationship("Form", back_populates="responses")
    answers = relationship("ResponseAnswer", back_populates="response", cascade="all, delete-orphan")


class ResponseAnswer(Base):
    __tablename__ = "response_answers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    response_id = Column(String(36), ForeignKey("responses.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    answer_text = Column(Text, nullable=True)
    answer_number = Column(Float, nullable=True)
    answer_json = Column(Text, nullable=True)

    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")
