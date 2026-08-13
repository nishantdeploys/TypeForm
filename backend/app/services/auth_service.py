from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, GoogleAuthPayload, TokenResponse, UserResponse
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from app.core.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

class AuthService:
    @staticmethod
    def register_user(db: Session, user_in: UserCreate) -> TokenResponse:
        existing = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists. Please log in."
            )

        hashed = hash_password(user_in.password)
        user = User(
            email=user_in.email.lower().strip(),
            hashed_password=hashed,
            full_name=user_in.full_name,
            avatar_url=user_in.avatar_url,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token({"sub": user.id, "email": user.email})
        return TokenResponse(access_token=token, user=UserResponse.model_validate(user))

    @staticmethod
    def authenticate_user(db: Session, login_in: UserLogin) -> TokenResponse:
        user = db.query(User).filter(User.email == login_in.email.lower().strip()).first()
        if not user or not user.hashed_password or not verify_password(login_in.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email address or password."
            )

        token = create_access_token({"sub": user.id, "email": user.email})
        return TokenResponse(access_token=token, user=UserResponse.model_validate(user))

    @staticmethod
    def google_auth(db: Session, google_in: GoogleAuthPayload) -> TokenResponse:
        email = google_in.email.lower().strip()
        user = db.query(User).filter(User.email == email).first()

        if not user:
            user = User(
                email=email,
                full_name=google_in.full_name or email.split("@")[0].capitalize(),
                avatar_url=google_in.avatar_url,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            if google_in.full_name and not user.full_name:
                user.full_name = google_in.full_name
            if google_in.avatar_url and not user.avatar_url:
                user.avatar_url = google_in.avatar_url
            db.commit()
            db.refresh(user)

        token = create_access_token({"sub": user.id, "email": user.email})
        return TokenResponse(access_token=token, user=UserResponse.model_validate(user))

    @staticmethod
    def get_current_user_from_token(db: Session, token: str) -> User:
        payload = decode_access_token(token)
        if not payload or "sub" not in payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token."
            )
        user_id = payload["sub"]
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found."
            )
        return user
