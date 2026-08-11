"""
Notification API endpoints.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.notifications.service import NotificationService

router = APIRouter(prefix="/api/notifications", tags=["Bildirimler"])


@router.get("")
def list_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = NotificationService(db)
    notifs = service.get_notifications(current_user.id, unread_only, limit)
    return [
        {
            "id": n.id, "title": n.title, "message": n.message,
            "notification_type": n.notification_type,
            "related_entity_type": n.related_entity_type,
            "related_entity_id": n.related_entity_id,
            "is_read": n.is_read, "channel": n.channel,
            "sent_at": n.sent_at, "read_at": n.read_at,
        }
        for n in notifs
    ]


@router.get("/unread-count")
def unread_count(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return {"count": NotificationService(db).get_unread_count(current_user.id)}


@router.put("/{notification_id}/read")
def mark_read(notification_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    NotificationService(db).mark_read(notification_id, current_user.id)
    return {"message": "Okundu"}


@router.put("/read-all")
def mark_all_read(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    NotificationService(db).mark_all_read(current_user.id)
    return {"message": "Tümü okundu"}


@router.get("/preferences")
def get_preferences(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    pref = NotificationService(db).get_preferences(current_user.id)
    return {
        "score_threshold": pref.score_threshold,
        "email_enabled": pref.email_enabled,
        "daily_digest_enabled": pref.daily_digest_enabled,
        "digest_time": pref.digest_time,
    }


@router.put("/preferences")
def update_preferences(data: dict, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    pref = NotificationService(db).update_preferences(current_user.id, data)
    return {"message": "Tercihler güncellendi"}
