from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.form import FormResponse
from app.schemas.response import ResponseCreate, ResponseDetailResponse
from app.services.form_service import FormService
from app.services.response_service import ResponseService

router = APIRouter(prefix="/public/forms", tags=["Public Respondent Flow"])

@router.get("/{slug}", response_model=FormResponse)
def get_public_form(slug: str, db: Session = Depends(get_db)):
    form = FormService.get_form_by_slug(db, slug)
    if form.status != "published":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This form is not currently published."
        )
    return form

@router.post("/{slug}/responses", status_code=status.HTTP_201_CREATED)
def submit_public_response(slug: str, res_in: ResponseCreate, db: Session = Depends(get_db)):
    response = ResponseService.submit_public_response(db, slug, res_in)
    return {
        "success": True,
        "response_id": response.id,
        "message": "Response submitted successfully."
    }
