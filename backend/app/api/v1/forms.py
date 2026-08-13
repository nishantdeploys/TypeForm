from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.form import FormCreate, FormUpdate, FormResponse, FormListItem
from app.services.form_service import FormService

router = APIRouter(prefix="/forms", tags=["Forms"])

@router.get("", response_model=list[FormListItem])
def list_forms(db: Session = Depends(get_db)):
    return FormService.get_forms(db)

@router.post("", response_model=FormResponse, status_code=status.HTTP_201_CREATED)
def create_form(form_in: FormCreate, db: Session = Depends(get_db)):
    return FormService.create_form(db, form_in)

@router.get("/{form_id}", response_model=FormResponse)
def get_form(form_id: str, db: Session = Depends(get_db)):
    return FormService.get_form_by_id(db, form_id)

@router.patch("/{form_id}", response_model=FormResponse)
def update_form(form_id: str, form_in: FormUpdate, db: Session = Depends(get_db)):
    return FormService.update_form(db, form_id, form_in)

@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_form(form_id: str, db: Session = Depends(get_db)):
    FormService.delete_form(db, form_id)
    return None

@router.post("/{form_id}/duplicate", response_model=FormResponse, status_code=status.HTTP_201_CREATED)
def duplicate_form(form_id: str, db: Session = Depends(get_db)):
    return FormService.duplicate_form(db, form_id)

@router.post("/{form_id}/publish", response_model=FormResponse)
def publish_form(form_id: str, db: Session = Depends(get_db)):
    return FormService.publish_form(db, form_id)

@router.post("/{form_id}/unpublish", response_model=FormResponse)
def unpublish_form(form_id: str, db: Session = Depends(get_db)):
    return FormService.unpublish_form(db, form_id)
