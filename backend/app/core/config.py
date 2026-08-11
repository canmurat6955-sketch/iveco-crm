"""
Application configuration via pydantic-settings.
Reads from .env file and environment variables.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Iveco CRM - Müşteri İstihbarat Platformu"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = "iveco-crm-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24

    # Database
    DATABASE_URL: str = "sqlite:///./iveco_crm.db"

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    # File Storage
    FILE_STORAGE_PATH: str = "./uploads"

    # SMTP (for notifications)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    NOTIFICATION_EMAIL_FROM: str = "noreply@iveco-crm.local"

    # Enrichment
    SCORE_THRESHOLD: int = 40

    # Google Maps Platform
    GOOGLE_MAPS_API_KEY: str = ""


    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


settings = Settings()
