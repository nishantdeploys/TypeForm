import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.form import Form
from app.models.question import Question, QuestionOption
from app.models.response import Response
from app.schemas.form import FormCreate, FormUpdate
from app.utils.slug import slugify
from fastapi import HTTPException, status

class FormService:
    @staticmethod
    def get_forms(db: Session) -> list[dict]:
        forms = db.query(Form).order_by(Form.updated_at.desc()).all()
        result = []
        for form in forms:
            q_count = db.query(func.count(Question.id)).filter(Question.form_id == form.id).scalar() or 0
            r_count = db.query(func.count(Response.id)).filter(Response.form_id == form.id).scalar() or 0
            result.append({
                "id": form.id,
                "title": form.title,
                "description": form.description,
                "slug": form.slug,
                "status": form.status,
                "created_at": form.created_at,
                "updated_at": form.updated_at,
                "published_at": form.published_at,
                "question_count": q_count,
                "response_count": r_count,
            })
        return result

    @staticmethod
    def get_form_by_id(db: Session, form_id: str) -> Form:
        form = db.query(Form).filter(Form.id == form_id).first()
        if not form:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
        return form

    @staticmethod
    def get_form_by_slug(db: Session, slug: str) -> Form:
        form = db.query(Form).filter(Form.slug == slug).first()
        if not form:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Public form not found")
        return form

    @staticmethod
    def create_form(db: Session, form_in: FormCreate) -> Form:
        slug = slugify(form_in.title)
        form = Form(
            title=form_in.title,
            description=form_in.description,
            slug=slug,
            status="draft",
        )
        db.add(form)
        db.commit()
        db.refresh(form)
        return form

    @staticmethod
    def update_form(db: Session, form_id: str, form_in: FormUpdate) -> Form:
        form = FormService.get_form_by_id(db, form_id)
        if form_in.title is not None:
            form.title = form_in.title
        if form_in.description is not None:
            form.description = form_in.description
        if form_in.status is not None and form_in.status in ["draft", "published"]:
            form.status = form_in.status
            if form_in.status == "published" and not form.published_at:
                form.published_at = datetime.utcnow()
        form.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(form)
        return form

    @staticmethod
    def delete_form(db: Session, form_id: str) -> None:
        form = FormService.get_form_by_id(db, form_id)
        db.delete(form)
        db.commit()

    @staticmethod
    def duplicate_form(db: Session, form_id: str) -> Form:
        original = FormService.get_form_by_id(db, form_id)
        new_title = f"{original.title} (Copy)"
        new_slug = slugify(new_title)
        
        new_form = Form(
            title=new_title,
            description=original.description,
            slug=new_slug,
            status="draft",
        )
        db.add(new_form)
        db.flush()

        for q in original.questions:
            new_q = Question(
                form_id=new_form.id,
                type=q.type,
                title=q.title,
                description=q.description,
                required=q.required,
                position=q.position,
                settings_json=q.settings_json,
            )
            db.add(new_q)
            db.flush()

            for opt in q.options:
                new_opt = QuestionOption(
                    question_id=new_q.id,
                    label=opt.label,
                    value=opt.value,
                    position=opt.position,
                )
                db.add(new_opt)

        db.commit()
        db.refresh(new_form)
        return new_form

    @staticmethod
    def publish_form(db: Session, form_id: str) -> Form:
        form = FormService.get_form_by_id(db, form_id)
        if not form.questions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot publish form without any questions."
            )
        form.status = "published"
        form.published_at = datetime.utcnow()
        form.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(form)
        return form

    @staticmethod
    def unpublish_form(db: Session, form_id: str) -> Form:
        form = FormService.get_form_by_id(db, form_id)
        form.status = "draft"
        form.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(form)
        return form
