from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthPayload(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    credential: Optional[str] = None

class UserResponse(UserBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
