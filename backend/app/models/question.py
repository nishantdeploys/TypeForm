import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Question(Base):
    __tablename__ = "questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    form_id = Column(String(36), ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # short_text, long_text, multiple_choice, dropdown, email, number, yes_no, rating
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    required = Column(Boolean, default=False, nullable=False)
    position = Column(Integer, default=0, nullable=False, index=True)
    settings_json = Column(Text, default="{}", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    form = relationship("Form", back_populates="questions")
    options = relationship(
        "QuestionOption",
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="QuestionOption.position"
    )
    answers = relationship("ResponseAnswer", back_populates="question", cascade="all, delete-orphan")


class QuestionOption(Base):
    __tablename__ = "question_options"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    label = Column(String(255), nullable=False)
    value = Column(String(255), nullable=False)
    position = Column(Integer, default=0, nullable=False)

    question = relationship("Question", back_populates="options")
