from fastapi import APIRouter, Depends, status, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserCreate, UserLogin, GoogleAuthPayload, TokenResponse, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    return AuthService.register_user(db, user_in)

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    return AuthService.authenticate_user(db, login_in)

@router.post("/google", response_model=TokenResponse)
def google_auth(google_in: GoogleAuthPayload, db: Session = Depends(get_db)):
    return AuthService.google_auth(db, google_in)

@router.get("/me", response_model=UserResponse)
def get_me(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        token = ""
    else:
        token = authorization.split(" ")[1]
    return AuthService.get_current_user_from_token(db, token)
