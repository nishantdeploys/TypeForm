from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.response import ResponseListItem, ResponseDetailResponse
from app.schemas.stats import FormStatsResponse
from app.services.response_service import ResponseService

router = APIRouter(prefix="/forms", tags=["Responses & Stats"])

@router.get("/{form_id}/responses", response_model=list[ResponseListItem])
def list_responses(form_id: str, db: Session = Depends(get_db)):
    return ResponseService.get_form_responses(db, form_id)

@router.get("/{form_id}/responses/{response_id}", response_model=ResponseDetailResponse)
def get_response_detail(form_id: str, response_id: str, db: Session = Depends(get_db)):
    return ResponseService.get_response_detail(db, form_id, response_id)

@router.get("/{form_id}/statistics", response_model=FormStatsResponse)
def get_form_statistics(form_id: str, db: Session = Depends(get_db)):
    return ResponseService.get_form_statistics(db, form_id)
