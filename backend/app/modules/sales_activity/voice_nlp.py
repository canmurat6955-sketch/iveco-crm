"""
Araç İçi Sesli Satış Özeti NLP & Varlık Ayrıştırıcı.
Sözlü Türkçe konuşmadan müşteri, ilgilenilen araç, adet, takas, takip tarihi ve pipeline aşamasını ayıklar.
"""
import re
from datetime import date, datetime, timedelta
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.modules.crm.models import Customer


DAYS_TR = {
    "pazartesi": 0,
    "salı": 1,
    "sali": 1,
    "çarşamba": 2,
    "carsamba": 2,
    "perşembe": 3,
    "persembe": 3,
    "cuma": 4,
    "cumartesi": 5,
    "pazar": 6,
}

VEHICLE_PATTERNS = [
    # Daily modelleri
    (r"\b(daily\s*72\s*c|72\s*c\s*21|72c)\b", "Daily 72C21 (7.2 Ton Şasi)"),
    (r"\b(daily\s*70\s*c|70\s*c\s*18|70c)\b", "Daily 70C18 (7.0 Ton Şasi)"),
    (r"\b(daily\s*50\s*c|50\s*c\s*18|50c)\b", "Daily 50C18 (5.0 Ton Şasi)"),
    (r"\b(daily\s*35\s*c|35\s*c\s*16|35c|daily\s*çift\s*teker)\b", "Daily 35C16 Çift Teker Şasi"),
    (r"\b(daily\s*35\s*s|35\s*s\s*16|35s|daily\s*tek\s*teker)\b", "Daily 35S16 Tek Teker Şasi"),
    (r"\b(daily\s*panelvan|panelvan|van|16\s*m3|12\s*m3)\b", "Daily Panelvan"),
    (r"\bdaily\b", "Daily Şasi"),
    # Eurocargo modelleri
    (r"\b(eurocargo|ml180|ml160|ml150|ml120|180e|160e)\b", "Eurocargo (12-18 Ton)"),
    # Heavy modelleri
    (r"\b(s-way|sway|s\s*way|çekici)\b", "S-Way 530/570 Çekici"),
    (r"\b(t-way|tway|t\s*way|damperli\s*kamyon|şantiye)\b", "T-Way Şantiye Serisi"),
    (r"\b(x-way|xway|x\s*way)\b", "X-Way"),
]

BODY_TYPES = [
    (r"\b(damper|damperli)\b", "Damper"),
    (r"\b(frigo|frigorifik|soğutuculu|klimik)\b", "Frigorifik"),
    (r"\b(kapalı\s*kasa|kasa|alüminyum\s*kasa|kutu\s*kasa)\b", "Kapalı Kasa"),
    (r"\b(açık\s*kasa|saç\s*kasa)\b", "Açık Kasa"),
    (r"\b(kayar\s*perde|perdeli|meşrubat)\b", "Kayar Perde"),
    (r"\b(vinç|vinçli|hiab)\b", "Vinçli"),
    (r"\b(çift\s*kabin|doka)\b", "Çift Kabin"),
    (r"\b(kurtarıcı|çekici\s*kasa|oto\s*kurtarıcı)\b", "Oto Kurtarıcı"),
]

TRADE_IN_BRANDS = [
    (r"\b(transit|ford|custom)\b", "Ford", "Transit"),
    (r"\b(sprinter|mercedes|atego|axor|actros)\b", "Mercedes-Benz", "Sprinter"),
    (r"\b(master|renault|midlum)\b", "Renault", "Master"),
    (r"\b(crafter|volkswagen|vw)\b", "Volkswagen", "Crafter"),
    (r"\b(isuzu|npr|nqr)\b", "Isuzu", "NPR"),
    (r"\b(ducato|fiat)\b", "Fiat", "Ducato"),
    (r"\b(scania|r450|g400)\b", "Scania", "Kamyon/Çekici"),
    (r"\b(man|tgs|tgx)\b", "MAN", "Kamyon/Çekici"),
]


def extract_entities_from_voice_text(text: str, db: Session) -> Dict[str, Any]:
    """
    Sesli metni analiz eder ve CRM varlıklarını ayıklar.
    """
    lower_text = text.lower()
    
    # 1. Miktar (Adet)
    quantity = 1
    qty_match = re.search(r"(\d+)\s*(adet|tane|kamyon|araç|şasi)", lower_text)
    if qty_match:
        try:
            quantity = int(qty_match.group(1))
        except ValueError:
            pass
    elif re.search(r"\b(iki|2)\b", lower_text):
        quantity = 2
    elif re.search(r"\b(üç|uc|3)\b", lower_text):
        quantity = 3

    # 2. İlgilenilen Araç Modeli
    vehicle_model = None
    for pattern, model_name in VEHICLE_PATTERNS:
        if re.search(pattern, lower_text):
            vehicle_model = model_name
            break

    # 3. Kasa / Üst Yapı Tipi
    body_type = None
    for pattern, b_name in BODY_TYPES:
        if re.search(pattern, lower_text):
            body_type = b_name
            break

    # 4. Takas Talebi (Trade-In)
    trade_in = None
    has_trade_in_keyword = any(k in lower_text for k in ["takas", "eski araç", "arabasını verecek", "takasa"])
    if has_trade_in_keyword:
        brand = "Diğer"
        model = "Ticari Araç"
        for pattern, b_found, m_found in TRADE_IN_BRANDS:
            if re.search(pattern, lower_text):
                brand = b_found
                model = m_found
                break
        
        # Yıl arama (örn: 2018 model)
        year_match = re.search(r"\b(201\d|202\d)\b", lower_text)
        model_year = int(year_match.group(1)) if year_match else None
        
        trade_in = {
            "has_trade_in": True,
            "vehicle_brand": brand,
            "vehicle_model": model,
            "model_year": model_year,
            "notes": f"Müşteri mevcut {brand} {model} aracını takasa vermek istiyor."
        }

    # 5. Takip Tarihi & Hatırlatıcı (Follow-up Date)
    follow_up_date = None
    follow_up_note = None
    today = date.today()

    if "yarın" in lower_text or "yarin" in lower_text:
        follow_up_date = today + timedelta(days=1)
        follow_up_note = "Yarın takip araması yapılacak"
    elif "haftaya" in lower_text:
        # Hangi gün?
        matched_day = None
        for day_name, day_idx in DAYS_TR.items():
            if day_name in lower_text:
                matched_day = day_idx
                break
        
        if matched_day is not None:
            # Önümüzdeki haftanın o günü
            days_ahead = (matched_day - today.weekday()) % 7
            if days_ahead <= 0:
                days_ahead += 7
            # "haftaya" dendiği için +7 gün garantile
            days_ahead += 7
            follow_up_date = today + timedelta(days=days_ahead)
            follow_up_note = f"Haftaya takip görüşmesi ({follow_up_date.strftime('%d.%m.%Y')})"
        else:
            follow_up_date = today + timedelta(days=7)
            follow_up_note = "Haftaya takip görüşmesi"
    else:
        # Doğrudan gün adı geçmiş mi?
        for day_name, day_idx in DAYS_TR.items():
            if day_name in lower_text:
                days_ahead = (day_idx - today.weekday()) % 7
                if days_ahead == 0:
                    days_ahead = 7
                follow_up_date = today + timedelta(days=days_ahead)
                follow_up_note = f"{day_name.capitalize()} günü takip araması"
                break
        
        # "X gün sonra" kalıbı
        days_after_match = re.search(r"(\d+)\s*gün sonra", lower_text)
        if days_after_match:
            days_count = int(days_after_match.group(1))
            follow_up_date = today + timedelta(days=days_count)
            follow_up_note = f"{days_count} gün sonra takip araması"

    # 6. Pipeline Aşaması
    pipeline_stage = "lead"
    if any(k in lower_text for k in ["fiyat istedi", "teklif istedi", "proforma", "fiyat teklifi"]):
        pipeline_stage = "proposal"
    elif any(k in lower_text for k in ["pazarlık", "indirim", "fiyatta anlaşırsak", "düşünüyor"]):
        pipeline_stage = "negotiation"
    elif any(k in lower_text for k in ["anlaştık", "satıldı", "kapora", "hayırlı olsun", "aldı"]):
        pipeline_stage = "won"
    elif any(k in lower_text for k in ["vazgeçti", "rakip aldı", "ford aldı", "mercedes aldı"]):
        pipeline_stage = "lost"

    # 7. Müşteri Tespiti (Veritabanındaki müşterilerle isim eşleştirme)
    matched_customer = None
    candidate_customers = []
    
    # İsme veya firma adına göre arama
    name_match = re.search(r"([a-zçğıöşüA-ZÇĞİÖŞÜ]+(?:\s+[a-zçğıöşüA-ZÇĞİÖŞÜ]+)?)\s+(?:bey|hanım|beyle|hanımla|ile|firması|şirketi|lojistik|nakliyat|inşaat)", text, re.IGNORECASE)
    search_term = name_match.group(1) if name_match else None
    
    if search_term and len(search_term) > 2:
        customers = db.query(Customer).filter(
            (Customer.company_name.ilike(f"%{search_term}%")) |
            (Customer.sales_notes.ilike(f"%{search_term}%"))
        ).limit(5).all()
        if customers:
            matched_customer = {"id": customers[0].id, "company_name": customers[0].company_name}
            candidate_customers = [{"id": c.id, "company_name": c.company_name, "city": c.city} for c in customers]

    # Eğer isimle bulunamadıysa son aktif müşterilerden öneriler
    if not candidate_customers:
        recent_customers = db.query(Customer).order_by(Customer.updated_at.desc()).limit(5).all()
        candidate_customers = [{"id": c.id, "company_name": c.company_name, "city": c.city} for c in recent_customers]

    # 8. Temizlenmiş & Profesyonel CRM Özeti
    vehicle_info = f"{quantity} adet {vehicle_model or 'IVECO'}"
    if body_type:
        vehicle_info += f" ({body_type} Kasa)"
    
    summary_parts = []
    if search_term:
        summary_parts.append(f"{search_term.capitalize()} ile görüşüldü.")
    else:
        summary_parts.append("Müşteri ile saha/telefon görüşmesi gerçekleştirildi.")
        
    summary_parts.append(f"Müşteri {vehicle_info} için talepte bulundu.")
    
    if trade_in:
        summary_parts.append(f"Takas Talebi: Mevcut {trade_in['vehicle_brand']} {trade_in['vehicle_model']} aracını takasa vermek istiyor.")
        
    if follow_up_date:
        summary_parts.append(f"Takip: {follow_up_date.strftime('%d.%m.%Y')} tarihinde aranacak.")

    cleaned_summary = " ".join(summary_parts)

    return {
        "raw_text": text,
        "quantity": quantity,
        "vehicle_model": vehicle_model,
        "body_type": body_type,
        "trade_in": trade_in,
        "follow_up_date": follow_up_date.isoformat() if follow_up_date else None,
        "follow_up_note": follow_up_note,
        "pipeline_stage": pipeline_stage,
        "detected_customer": matched_customer,
        "candidate_customers": candidate_customers,
        "cleaned_summary": cleaned_summary,
    }
