from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.form import FormCreate, FormUpdate, FormResponse, FormListItem
from app.services.form_service import FormService
from app.api.deps import get_current_user_optional
from app.models.user import User

router = APIRouter(prefix="/forms", tags=["Forms"])

@router.get("", response_model=list[FormListItem])
def list_forms(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    return FormService.get_forms(db, current_user)

@router.post("", response_model=FormResponse, status_code=status.HTTP_201_CREATED)
def create_form(
    form_in: FormCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    return FormService.create_form(db, form_in, current_user)

@router.get("/{form_id}", response_model=FormResponse)
def get_form(
    form_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    return FormService.get_form_by_id(db, form_id, current_user)

@router.patch("/{form_id}", response_model=FormResponse)
def update_form(
    form_id: str,
    form_in: FormUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    return FormService.update_form(db, form_id, form_in, current_user)

@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_form(
    form_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    FormService.delete_form(db, form_id, current_user)
    return None

@router.post("/{form_id}/duplicate", response_model=FormResponse, status_code=status.HTTP_201_CREATED)
def duplicate_form(
    form_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    return FormService.duplicate_form(db, form_id, current_user)

@router.post("/{form_id}/publish", response_model=FormResponse)
def publish_form(
    form_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    return FormService.publish_form(db, form_id, current_user)

@router.post("/{form_id}/unpublish", response_model=FormResponse)
def unpublish_form(
    form_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    return FormService.unpublish_form(db, form_id, current_user)
