"""
WhatsApp integration service.
Handles multi-device session pairing, status management,
direct message dispatch, and sales rep lead notifications.
"""
from datetime import datetime, timezone
import secrets
import urllib.parse
import urllib.request
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from app.modules.whatsapp.models import WhatsAppSession, WhatsAppMessageLog

DEFAULT_CALLMEBOT_APIKEY = "6810148"
_LAST_PORTAL_ALERT_TS: Dict[str, float] = {}


class WhatsAppService:
    def __init__(self, db: Session):
        self.db = db

    def _extract_apikey(self, session: WhatsAppSession) -> str:
        raw = (session.qr_data or "").strip()
        if raw.startswith("callmebot:"):
            val = raw.split("callmebot:", 1)[1].strip()
            if val:
                return val
        return DEFAULT_CALLMEBOT_APIKEY

    def get_or_create_session(self) -> WhatsAppSession:
        """Retrieves or creates the primary WhatsApp connection session."""
        session = self.db.query(WhatsAppSession).filter(WhatsAppSession.session_id == "default").first()
        if not session:
            session = WhatsAppSession(
                session_id="default",
                status="connected",
                phone_number="0544 622 59 31",
                display_name="Can Murat Onay",
                qr_data=f"callmebot:{DEFAULT_CALLMEBOT_APIKEY}",
                notify_phone="905446225931",
                auto_notify_rep=True,
            )
            self.db.add(session)
            self.db.commit()
            self.db.refresh(session)
        elif not session.qr_data or not session.qr_data.startswith("callmebot:"):
            session.qr_data = f"callmebot:{DEFAULT_CALLMEBOT_APIKEY}"
            session.status = "connected"
            self.db.commit()
            self.db.refresh(session)
        return session

    def generate_qr_code(self) -> Dict[str, Any]:
        """
        Generates a new pairing token and QR code payload for WhatsApp Web pairing.
        """
        session = self.get_or_create_session()
        existing_key = self._extract_apikey(session)
        pairing_token = f"2@{secrets.token_urlsafe(32)},{secrets.token_urlsafe(16)},IVECO-CRM-CANMURATONAY"

        if not existing_key:
            session.qr_data = pairing_token
        session.status = "qr_ready"
        session.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(session)

        qr_image_url = f"https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data={pairing_token}"

        return {
            "session_id": session.session_id,
            "status": session.status,
            "pairing_token": pairing_token,
            "qr_image_url": qr_image_url,
            "expires_in_seconds": 60,
        }

    def confirm_pairing(self, phone: Optional[str] = None, display_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Confirms device pairing (when user scans QR code).
        """
        session = self.get_or_create_session()
        existing_key = self._extract_apikey(session)
        session.status = "connected"
        session.phone_number = phone or "0544 622 59 31"
        session.display_name = display_name or "Can Murat Onay"
        if not existing_key:
            session.qr_data = None
        session.connected_at = datetime.now(timezone.utc)
        session.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(session)

        return {
            "success": True,
            "status": session.status,
            "phone_number": session.phone_number,
            "display_name": session.display_name,
            "connected_at": session.connected_at.isoformat(),
        }

    def disconnect(self) -> Dict[str, Any]:
        """
        Disconnects the active WhatsApp session.
        """
        session = self.get_or_create_session()
        session.status = "disconnected"
        session.updated_at = datetime.now(timezone.utc)
        self.db.commit()

        return {
            "success": True,
            "status": "disconnected",
            "message": "WhatsApp oturumu sonlandırıldı.",
        }

    def get_status(self) -> Dict[str, Any]:
        """Returns the current connection status and recent message statistics."""
        session = self.get_or_create_session()
        apikey = self._extract_apikey(session)

        recent_logs = (
            self.db.query(WhatsAppMessageLog)
            .order_by(WhatsAppMessageLog.created_at.desc())
            .limit(10)
            .all()
        )

        logs_data = [
            {
                "id": log.id,
                "recipient_phone": log.recipient_phone,
                "recipient_name": log.recipient_name,
                "message_type": log.message_type,
                "content": log.content[:80] + ("..." if len(log.content) > 80 else ""),
                "status": log.status,
                "created_at": log.created_at.isoformat() if log.created_at else None,
            }
            for log in recent_logs
        ]

        return {
            "status": session.status,
            "phone_number": session.phone_number,
            "display_name": session.display_name,
            "notify_phone": session.notify_phone,
            "auto_notify_rep": session.auto_notify_rep,
            "callmebot_apikey": apikey,
            "has_callmebot_key": bool(apikey),
            "connected_at": session.connected_at.isoformat() if session.connected_at else None,
            "recent_messages": logs_data,
        }

    def update_settings(
        self,
        notify_phone: Optional[str] = None,
        auto_notify_rep: Optional[bool] = None,
        callmebot_apikey: Optional[str] = None,
    ) -> Dict[str, Any]:
        session = self.get_or_create_session()
        if notify_phone is not None:
            clean_p = "".join(filter(str.isdigit, notify_phone))
            if clean_p.startswith("0"):
                clean_p = "90" + clean_p[1:]
            elif clean_p and not clean_p.startswith("90") and len(clean_p) == 10:
                clean_p = "90" + clean_p
            session.notify_phone = clean_p or "905446225931"
        if auto_notify_rep is not None:
            session.auto_notify_rep = auto_notify_rep
        if callmebot_apikey is not None:
            clean_key = callmebot_apikey.strip()
            session.qr_data = f"callmebot:{clean_key}" if clean_key else None
            if clean_key:
                session.status = "connected"
                session.connected_at = datetime.now(timezone.utc)
        session.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        apikey = self._extract_apikey(session)
        return {
            "success": True,
            "notify_phone": session.notify_phone,
            "auto_notify_rep": session.auto_notify_rep,
            "callmebot_apikey": apikey,
            "has_callmebot_key": bool(apikey),
        }

    def send_message(
        self,
        recipient_phone: str,
        content: str,
        recipient_name: Optional[str] = None,
        message_type: str = "text"
    ) -> Dict[str, Any]:
        """
        Dispatches an automated WhatsApp message through CallMeBot API (if configured) and logs it.
        """
        session = self.get_or_create_session()
        apikey = self._extract_apikey(session)

        clean_phone = "".join(filter(str.isdigit, recipient_phone))
        if clean_phone.startswith("0"):
            clean_phone = "90" + clean_phone[1:]
        elif not clean_phone.startswith("90") and len(clean_phone) == 10:
            clean_phone = "90" + clean_phone

        delivery_status = "local_only"
        delivery_detail = "CallMeBot API şifresi girilmediği için yalnızca CRM günlüğüne kaydedildi."

        if apikey:
            try:
                encoded_text = urllib.parse.quote(content)
                url = f"https://api.callmebot.com/whatsapp.php?phone={clean_phone}&text={encoded_text}&apikey={urllib.parse.quote(apikey)}"
                req = urllib.request.Request(url, headers={"User-Agent": "IVECO-CRM-Notifier/1.0"})
                with urllib.request.urlopen(req, timeout=10) as resp:
                    body = resp.read().decode("utf-8", errors="ignore")
                    if resp.status == 200 and ("Message queued" in body or "Message sent" in body or "queued" in body.lower()):
                        delivery_status = "delivered"
                        delivery_detail = "WhatsApp mesajı CallMeBot üzerinden cep telefonunuza iletildi!"
                    else:
                        delivery_status = "api_error"
                        delivery_detail = f"CallMeBot yanıtı: {body[:120]}"
            except Exception as exc:
                delivery_status = "api_error"
                delivery_detail = f"CallMeBot bağlantı hatası: {str(exc)[:100]}"

        log = WhatsAppMessageLog(
            recipient_phone=clean_phone,
            recipient_name=recipient_name or "Müşteri",
            message_type=message_type,
            content=content,
            status=delivery_status,
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)

        return {
            "success": delivery_status == "delivered",
            "has_callmebot_key": bool(apikey),
            "delivery_status": delivery_status,
            "delivery_detail": delivery_detail,
            "message_id": log.id,
            "recipient_phone": clean_phone,
            "status": delivery_status,
            "sent_at": log.created_at.isoformat(),
        }

    def notify_rep_proposal_viewed(
        self,
        company_name: str,
        vehicle_model: str,
        token: str,
        city: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Sends an instant WhatsApp lead alert to Can Murat Onay when a customer views a proposal.
        """
        session = self.get_or_create_session()
        if not session.auto_notify_rep:
            return None

        city_text = f" ({city})" if city else ""
        alert_text = (
            f"🔔 *TEKLİFİNİZ İNCELENİYOR! (Canlı Radar)*\n\n"
            f"Sayın Can Murat Onay,\n"
            f"*{company_name}*{city_text} az önce *{vehicle_model}* teklifinizi açtı ve incelemeye başladı.\n\n"
            f"📍 Sıcak temas için tam arama anı!\n"
            f"🔗 Teklif: https://iveco-fiyat-listesi.vercel.app/p/{token}"
        )

        return self.send_message(
            recipient_phone=session.notify_phone or "905446225931",
            content=alert_text,
            recipient_name="Can Murat Onay",
            message_type="alert",
        )

    def notify_rep_portal_footprint(
        self,
        company_name: str,
        action_label: str,
        vehicle_model: str,
        city: Optional[str] = None,
        phone: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Sends an instant WhatsApp alert when a customer takes a high-intent action in the portal.
        """
        session = self.get_or_create_session()
        if not session.auto_notify_rep or not self._extract_apikey(session):
            return None

        now_ts = datetime.now(timezone.utc).timestamp()
        dedup_key = f"{company_name or 'anon'}:{action_label or ''}"
        last_ts = _LAST_PORTAL_ALERT_TS.get(dedup_key, 0.0)
        if now_ts - last_ts < 45:
            return None
        _LAST_PORTAL_ALERT_TS[dedup_key] = now_ts

        city_text = f" ({city})" if city else ""
        phone_text = f"\n📞 Tel: {phone}" if phone else ""
        alert_text = (
            f"🔥 *MÜŞTERİ ŞU AN PORTALDA!*\n"
            f"🏢 Firma: *{company_name}*{city_text}{phone_text}\n"
            f"⚡ İşlem: {action_label}\n"
            f"🚛 Model: {vehicle_model}"
        )
        return self.send_message(
            recipient_phone=session.notify_phone or "905446225931",
            content=alert_text,
            recipient_name="Can Murat Onay",
            message_type="alert",
        )
