from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionResponse, QuestionReorderRequest
from app.services.question_service import QuestionService

router = APIRouter(tags=["Questions"])

@router.post("/forms/{form_id}/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def add_question(form_id: str, q_in: QuestionCreate, db: Session = Depends(get_db)):
    return QuestionService.add_question(db, form_id, q_in)

@router.patch("/questions/{question_id}", response_model=QuestionResponse)
def update_question(question_id: str, q_in: QuestionUpdate, db: Session = Depends(get_db)):
    return QuestionService.update_question(db, question_id, q_in)

@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: str, db: Session = Depends(get_db)):
    QuestionService.delete_question(db, question_id)
    return None

@router.post("/forms/{form_id}/questions/reorder", response_model=list[QuestionResponse])
def reorder_questions(form_id: str, req: QuestionReorderRequest, db: Session = Depends(get_db)):
    return QuestionService.reorder_questions(db, form_id, req.questions)
