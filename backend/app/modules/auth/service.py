"""
Authentication service: user CRUD and login logic.
"""

from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.auth.models import User
from app.modules.auth.schemas import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_all_users(self):
        return self.db.query(User).all()

    # Kısa kullanıcı adları (yalnızca e-posta eşlemesi; parola doğrulaması HER ZAMAN yapılır)
    _ADMIN_ALIASES = {"admin", "admin@iveco-crm.local", "yonetici"}
    _SALES_ALIASES = {"satis", "satis@iveco-crm.local", "king", "iveco", "ivecocrm"}

    @staticmethod
    def _check_password(plain: str, hashed: str) -> bool:
        """bcrypt doğrulaması. Giriş ekranı kodu küçük harfe çevirdiği için
        hem girilen hâli hem küçük harf hâlini dener."""
        if not plain or not hashed:
            return False
        for candidate in (plain, plain.lower()):
            try:
                if verify_password(candidate, hashed):
                    return True
            except Exception:
                continue
        return False

    def authenticate_user(self, email_or_identifier: str, password: str) -> Optional[User]:
        """Yalnızca DB'deki bcrypt hash ile doğrulama.
        Bilinmeyen kullanıcı → None (admin'e düşme YOK), kodda sabit parola YOK."""
        clean_id = (email_or_identifier or "").strip().lower()
        clean_pwd = (password or "").strip()
        if not clean_id or not clean_pwd:
            return None

        if clean_id in self._ADMIN_ALIASES:
            user = self.get_user_by_email("admin@iveco-crm.local")
        elif clean_id in self._SALES_ALIASES:
            user = self.get_user_by_email("satis@iveco-crm.local")
        else:
            user = self.get_user_by_email((email_or_identifier or "").strip())

        if not user or not user.is_active:
            return None
        if self._check_password(clean_pwd, user.hashed_password):
            return user
        return None

    def authenticate_passcode(self, code: str) -> Optional[User]:
        """Mobil hızlı giriş: tek kod, varsayılan admin ve satış kullanıcılarının
        kendi parolalarıyla (bcrypt) karşılaştırılır. Sabit/master kod yoktur."""
        clean_code = (code or "").strip()
        if not clean_code:
            return None
        for email in ("admin@iveco-crm.local", "satis@iveco-crm.local"):
            user = self.get_user_by_email(email)
            if user and user.is_active and self._check_password(clean_code, user.hashed_password):
                return user
        return None

    def create_user(self, user_data: UserCreate) -> User:
        # Check if email already exists
        existing = self.get_user_by_email(user_data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu e-posta adresi zaten kayıtlı",
            )

        user = User(
            email=user_data.email,
            hashed_password=get_password_hash(user_data.password),
            full_name=user_data.full_name,
            role=user_data.role,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_user(self, user_id: int, user_data: UserUpdate) -> User:
        user = self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Kullanıcı bulunamadı",
            )

        update_data = user_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)

        self.db.commit()
        self.db.refresh(user)
        return user

    def change_password(self, user: User, current_password: str, new_password: str):
        if not verify_password(current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mevcut şifre yanlış",
            )
        user.hashed_password = get_password_hash(new_password)
        self.db.commit()
