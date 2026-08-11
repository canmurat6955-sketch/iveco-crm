"""
Pydantic schemas for authentication requests and responses.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    username: str = Field(..., description="E-posta adresi")
    password: str = Field(..., min_length=4)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserCreate(BaseModel):
    email: str = Field(..., description="E-posta adresi")
    password: str = Field(..., min_length=6, description="Şifre (min 6 karakter)")
    full_name: str = Field(..., min_length=2, description="Ad Soyad")
    role: str = Field(default="sales_rep", description="Rol: admin, sales_rep, manager")


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


# Resolve forward reference
TokenResponse.model_rebuild()
