"""
Authentication API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, get_current_user, get_current_admin
from app.modules.auth.service import AuthService
from app.modules.auth.schemas import (
    TokenResponse,
    UserCreate,
    UserUpdate,
    UserResponse,
    PasswordChange,
)

router = APIRouter(prefix="/api/auth", tags=["Kimlik Doğrulama"])


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Kullanıcı girişi — JWT token alır."""
    try:
        service = AuthService(db)
        user = service.authenticate_user(form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-posta veya şifre hatalı",
                headers={"WWW-Authenticate": "Bearer"},
            )
        token = create_access_token(data={"sub": str(user.id)})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
        }
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }



@router.post("/register", response_model=UserResponse)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin),
):
    """Yeni kullanıcı oluştur (sadece admin)."""
    service = AuthService(db)
    return service.create_user(user_data)


@router.get("/me", response_model=UserResponse)
def get_me(current_user=Depends(get_current_user)):
    """Mevcut kullanıcı bilgilerini döndürür."""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Profil bilgilerini günceller."""
    service = AuthService(db)
    return service.update_user(current_user.id, user_data)


@router.post("/change-password")
def change_password(
    data: PasswordChange,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Şifre değiştirir."""
    service = AuthService(db)
    service.change_password(current_user, data.current_password, data.new_password)
    return {"message": "Şifre başarıyla değiştirildi"}


@router.get("/users", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin),
):
    """Tüm kullanıcıları listeler (sadece admin)."""
    service = AuthService(db)
    return service.get_all_users()
