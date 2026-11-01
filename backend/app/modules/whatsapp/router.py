"""
WhatsApp Integration FastAPI Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.modules.whatsapp.service import WhatsAppService

router = APIRouter(prefix="/api/whatsapp", tags=["WhatsApp"])


class SendMessageRequest(BaseModel):
    phone: str
    message: str
    recipient_name: Optional[str] = None
    message_type: Optional[str] = "text"


class PairingConfirmRequest(BaseModel):
    phone: Optional[str] = None
    display_name: Optional[str] = None


class SettingsRequest(BaseModel):
    notify_phone: Optional[str] = None
    auto_notify_rep: Optional[bool] = None


@router.get("/status")
def get_whatsapp_status(db: Session = Depends(get_db)):
    """WhatsApp oturum ve mesajlaşma durumunu döner."""
    service = WhatsAppService(db)
    return service.get_status()


@router.post("/qr")
def generate_pairing_qr(db: Session = Depends(get_db)):
    """Telefona okutulacak WhatsApp Web eşleştirme QR kodunu üretir."""
    service = WhatsAppService(db)
    return service.generate_qr_code()


@router.post("/confirm")
def confirm_pairing(req: PairingConfirmRequest, db: Session = Depends(get_db)):
    """Cihaz eşleştirmesini doğrular ve aktif duruma geçirir."""
    service = WhatsAppService(db)
    return service.confirm_pairing(phone=req.phone, display_name=req.display_name)


@router.post("/disconnect")
def disconnect_whatsapp(db: Session = Depends(get_db)):
    """Aktif WhatsApp oturumunu sonlandırır."""
    service = WhatsAppService(db)
    return service.disconnect()


@router.post("/send")
def send_whatsapp_message(req: SendMessageRequest, db: Session = Depends(get_db)):
    """Müşteriye bağlı hat üzerinden WhatsApp mesajı gönderir."""
    service = WhatsAppService(db)
    return service.send_message(
        recipient_phone=req.phone,
        content=req.message,
        recipient_name=req.recipient_name,
        message_type=req.message_type or "text",
    )


@router.post("/settings")
def update_whatsapp_settings(req: SettingsRequest, db: Session = Depends(get_db)):
    """Bildirim telefonu ve anlık takip uyarı ayarlarını günceller."""
    service = WhatsAppService(db)
    return service.update_settings(
        notify_phone=req.notify_phone,
        auto_notify_rep=req.auto_notify_rep
    )


@router.post("/test")
def send_test_message(db: Session = Depends(get_db)):
    """Can Murat Onay'ın telefonuna anlık test uyarısı gönderir."""
    service = WhatsAppService(db)
    session = service.get_or_create_session()
    test_msg = (
        "✅ *IVECO CRM — WhatsApp Entegrasyon Testi Başarılı!*\n\n"
        "Can Murat Bey selamlar,\n"
        "WhatsApp hattınız IVECO CRM satış platformuna başarıyla bağlandı.\n"
        "Artık müşterileriniz teklifleri incelediğinde canlı radar uyarıları bu hatta gelecektir."
    )
    return service.send_message(
        recipient_phone=session.notify_phone or "905446225931",
        content=test_msg,
        recipient_name="Can Murat Onay",
        message_type="test",
    )
