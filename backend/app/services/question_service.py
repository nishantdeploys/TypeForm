from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.form import Form
from app.models.question import Question, QuestionOption
from app.models.user import User
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionReorderItem
from app.services.form_service import FormService
from fastapi import HTTPException, status

class QuestionService:
    @staticmethod
    def add_question(db: Session, form_id: str, q_in: QuestionCreate, user: Optional[User] = None) -> Question:
        form = FormService.get_form_by_id(db, form_id, user)
        
        # Calculate max position
        max_pos = db.query(func.max(Question.position)).filter(Question.form_id == form_id).scalar()
        next_pos = (max_pos + 1) if max_pos is not None else 0

        question = Question(
            form_id=form.id,
            type=q_in.type,
            title=q_in.title,
            description=q_in.description,
            required=q_in.required,
            position=q_in.position if q_in.position > 0 else next_pos,
            settings_json=q_in.settings_json or "{}",
        )
        db.add(question)
        db.flush()

        if q_in.options:
            for idx, opt in enumerate(q_in.options):
                option = QuestionOption(
                    question_id=question.id,
                    label=opt.label,
                    value=opt.value or opt.label.lower().replace(" ", "_"),
                    position=opt.position if opt.position is not None else idx,
                )
                db.add(option)

        form.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(question)
        return question

    @staticmethod
    def get_question_by_id(db: Session, question_id: str, user: Optional[User] = None) -> Question:
        question = db.query(Question).filter(Question.id == question_id).first()
        if not question:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
        if user and question.form and question.form.owner_id and question.form.owner_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view or edit this question."
            )
        return question

    @staticmethod
    def update_question(db: Session, question_id: str, q_in: QuestionUpdate, user: Optional[User] = None) -> Question:
        question = QuestionService.get_question_by_id(db, question_id, user)
        if q_in.type is not None:
            question.type = q_in.type
        if q_in.title is not None:
            question.title = q_in.title
        if q_in.description is not None:
            question.description = q_in.description
        if q_in.required is not None:
            question.required = q_in.required
        if q_in.position is not None:
            question.position = q_in.position
        if q_in.settings_json is not None:
            question.settings_json = q_in.settings_json

        if q_in.options is not None:
            # Replace existing options
            db.query(QuestionOption).filter(QuestionOption.question_id == question.id).delete()
            for idx, opt in enumerate(q_in.options):
                option = QuestionOption(
                    question_id=question.id,
                    label=opt.label,
                    value=opt.value or opt.label.lower().replace(" ", "_"),
                    position=opt.position if opt.position is not None else idx,
                )
                db.add(option)

        question.updated_at = datetime.utcnow()
        if question.form:
            question.form.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(question)
        return question

    @staticmethod
    def delete_question(db: Session, question_id: str, user: Optional[User] = None) -> None:
        question = QuestionService.get_question_by_id(db, question_id, user)
        form = question.form
        db.delete(question)
        if form:
            form.updated_at = datetime.utcnow()
        db.commit()

    @staticmethod
    def reorder_questions(db: Session, form_id: str, items: list[QuestionReorderItem], user: Optional[User] = None) -> list[Question]:
        FormService.get_form_by_id(db, form_id, user)
        for item in items:
            db.query(Question).filter(Question.id == item.id, Question.form_id == form_id).update({"position": item.position})
        db.commit()
        return db.query(Question).filter(Question.form_id == form_id).order_by(Question.position).all()
