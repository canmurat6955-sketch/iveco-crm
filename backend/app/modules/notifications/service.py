"""
Notification service.
"""
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.modules.notifications.models import Notification, NotificationPreference


class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def get_notifications(self, user_id: int, unread_only: bool = False, limit: int = 50) -> List[Notification]:
        query = self.db.query(Notification).filter(
            (Notification.user_id == user_id) | (Notification.user_id.is_(None))
        )
        if unread_only:
            query = query.filter(Notification.is_read == False)
        return query.order_by(desc(Notification.sent_at)).limit(limit).all()

    def get_unread_count(self, user_id: int) -> int:
        return self.db.query(Notification).filter(
            ((Notification.user_id == user_id) | (Notification.user_id.is_(None))),
            Notification.is_read == False,
        ).count()

    def mark_read(self, notification_id: int, user_id: int):
        notif = self.db.query(Notification).filter(Notification.id == notification_id).first()
        if notif:
            notif.is_read = True
            notif.read_at = datetime.now(timezone.utc)
            self.db.commit()

    def mark_all_read(self, user_id: int):
        self.db.query(Notification).filter(
            ((Notification.user_id == user_id) | (Notification.user_id.is_(None))),
            Notification.is_read == False,
        ).update({"is_read": True, "read_at": datetime.now(timezone.utc)}, synchronize_session=False)
        self.db.commit()

    def create_notification(
        self, title: str, message: str, notification_type: str,
        user_id: Optional[int] = None,
        related_entity_type: Optional[str] = None,
        related_entity_id: Optional[int] = None,
        channel: str = "dashboard",
    ) -> Notification:
        notif = Notification(
            user_id=user_id, title=title, message=message,
            notification_type=notification_type,
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id,
            channel=channel,
        )
        self.db.add(notif)
        self.db.commit()
        self.db.refresh(notif)
        return notif

    def create_new_company_notification(self, company_name: str, city: str, score: int, company_id: int):
        """Create notification for a newly discovered high-potential company."""
        district_info = ""
        title = "Yeni potansiyel müşteri bulundu"
        message = (
            f"📍 {city}\n"
            f"🏢 {company_name}\n"
            f"📊 Potansiyel skoru: {score}/100\n"
            f"Çekici/kamyon kullanıcısı olma ihtimali yüksek."
        )
        return self.create_notification(
            title=title, message=message,
            notification_type="new_company",
            related_entity_type="discovered_company",
            related_entity_id=company_id,
        )

    def get_preferences(self, user_id: int) -> NotificationPreference:
        pref = self.db.query(NotificationPreference).filter(
            NotificationPreference.user_id == user_id
        ).first()
        if not pref:
            pref = NotificationPreference(user_id=user_id)
            self.db.add(pref)
            self.db.commit()
            self.db.refresh(pref)
        return pref

    def update_preferences(self, user_id: int, data: dict) -> NotificationPreference:
        pref = self.get_preferences(user_id)
        for key, val in data.items():
            if hasattr(pref, key):
                setattr(pref, key, val)
        self.db.commit()
        self.db.refresh(pref)
        return pref
