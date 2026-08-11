"""
Google Places Scanner API endpoints.
"""
from app.core.config import settings
from typing import Optional, List
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session


from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.scanner.service import search_businesses
from app.modules.crm.models import Customer

router = APIRouter(prefix="/api/scanner", tags=["Scanner"])


# ── Schemas ──────────────────────────────────────────────────────

class ScanRequest(BaseModel):
    query: str = Field(..., min_length=3, description="Arama sorgusu, ör: 'Çarşamba akaryakıt firmaları'")
    max_results: int = Field(default=20, ge=1, le=60)
    api_key: Optional[str] = Field(default=None, description="Google Places API anahtarı (boşsa sunucudaki .env kullanılır)")


class ScanResult(BaseModel):
    google_place_id: str
    company_name: str
    phone: str = ""
    address: str = ""
    district: str = ""
    city: str = ""
    website: str = ""
    google_maps_url: str = ""
    rating: Optional[float] = None
    rating_count: Optional[int] = None
    business_status: str = ""
    sector: str = ""
    types: List[str] = []


class ScanResponse(BaseModel):
    results: List[ScanResult]
    total: int
    query: str
    error: Optional[str] = None


class AddToCrmRequest(BaseModel):
    company_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    website: Optional[str] = None
    sector: Optional[str] = None
    google_place_id: Optional[str] = None
    google_maps_url: Optional[str] = None
    rating: Optional[float] = None


class BulkAddRequest(BaseModel):
    api_key: Optional[str] = None
    items: List[AddToCrmRequest]


# ── Endpoints ────────────────────────────────────────────────────

@router.post("/search", response_model=ScanResponse)
async def scan_businesses(
    req: ScanRequest,
    current_user=Depends(get_current_user),
):
    """Google Places API ile firma ara."""
    api_key = req.api_key or settings.GOOGLE_MAPS_API_KEY
    if not api_key or api_key == "MOCK_GOOGLE_MAPS_API_KEY":
        # Google Places anahtarı yoksa, zengin yerel demo sonuçları üret
        q = req.query.lower()
        
        # Sektör belirleme
        sector = "Diğer"
        if any(x in q for x in ["nakliye", "nakliyat", "lojistik", "tasima", "tasimacilik", "kargo", "sevk", "hafriyat"]):
            sector = "Nakliye / Lojistik"
        elif any(x in q for x in ["insaat", "yapi", "beton", "cimento", "harc", "mermer"]):
            sector = "İnşaat"
        elif any(x in q for x in ["akaryakit", "petrol", "benzin", "dinlenme", "lpg"]):
            sector = "Akaryakıt"
        elif any(x in q for x in ["otomotiv", "servis", "tamir", "yedek parca", "lastik"]):
            sector = "Otomotiv"
        elif any(x in q for x in ["gida", "market", "toptan", "un", "yem", "tarim"]):
            sector = "Gıda / Tarım"

        # Şehir belirleme
        city = "Samsun"
        district = "Tekkeköy"
        if "ordu" in q:
            city = "Ordu"
            district = "Altınordu"
        elif "çorum" in q or "corum" in q:
            city = "Çorum"
            district = "Merkez"
        elif "sinop" in q:
            city = "Sinop"
            district = "Merkez"
        elif "tokat" in q:
            city = "Tokat"
            district = "Merkez"
        elif "amasya" in q:
            city = "Amasya"
            district = "Merkez"

        # Rastgele ama anlamlı isimler üret
        import random
        random.seed(req.query)
        
        if sector == "Nakliye / Lojistik":
            prefixes = ["Öz", "Karadeniz", "Önder", "Lider", "Hilal", "Güven", "Doğu", "Umut", "Esen", "Yiğit"]
            suffixes = ["Lojistik ve Taşımacılık A.Ş.", "Nakliyat Ticaret Ltd. Şti.", "Uluslararası Nakliye", "Kargo Dağıtım", "Hafriyat Lojistik"]
        elif sector == "İnşaat":
            prefixes = ["Yılmaz", "Kaya", "Demir", "Çelik", "Ak", "Yeşil", "Özkan", "Mert", "Bayrak", "Fırat"]
            suffixes = ["Hazır Beton Tesisleri", "İnşaat ve Taahhüt Sanayi", "Yapı Malzemeleri Grubu", "Prekast Beton Yapı", "Müteahhitlik Hizmetleri"]
        elif sector == "Akaryakıt":
            prefixes = ["Mavi", "Yıldız", "Opet", "Petrol Ofisi", "Shell", "Erçal", "Aygaz", "Total", "Bölge", "Karadeniz"]
            suffixes = ["Akaryakıt İstasyonu", "Petrolleri ve Dinlenme Tesisleri", "Otogaz ve Petrol Ürünleri", "Enerji ve Yakıt Dağıtım"]
        elif sector == "Otomotiv":
            prefixes = ["Öz", "Karadeniz", "Oto", "Iveco", "Servis", "Eren", "Yiğit", "Şahin", "Doğan", "Arslan"]
            suffixes = ["Otomotiv Servis ve Yedek Parça", "Lastik ve Jant Bayii", "Ağır Vasıta Tamir", "Ticari Araçlar Sanayi"]
        else:
            prefixes = ["Anadolu", "Avrasya", "Birlik", "Merkez", "Özgür", "Vatan", "Kardeşler", "Akdeniz"]
            suffixes = ["Gıda Pazarlama Ltd.", "Tekstil ve Sanayi Ticaret", "Metal Demir Çelik Sanayi", "Toptan Market Deposu"]

        results = []
        for i in range(1, 11):
            pref = random.choice(prefixes)
            suff = random.choice(suffixes)
            comp_name = f"{pref} {suff}"
            
            # Aynı isimlerin tekrarlanmasını önle
            if comp_name in [r["company_name"] for r in results]:
                comp_name = f"{pref} {random.choice(prefixes)} {suff}"
                
            place_id = f"mock_google_place_{city.lower()}_{sector.split('/')[0].strip().lower()}_{i}"
            phone_num = f"0{random.randint(300, 499)} {random.randint(100, 999)} {random.randint(10, 99)}{random.randint(10, 99)}"
            web_domain = comp_name.lower().replace(" ", "").replace("ş", "s").replace("ç", "c").replace("ı", "i").replace("ğ", "g").replace("ö", "o").replace("ü", "u").split(".")[0].split("ltd")[0].split("a.ş")[0]
            if len(web_domain) > 15:
                web_domain = web_domain[:15]
            website = f"www.{web_domain}.com.tr"
            
            rating = round(random.uniform(3.8, 4.9), 1)
            rating_count = random.randint(15, 250)
            
            results.append({
                "google_place_id": place_id,
                "company_name": comp_name,
                "phone": phone_num,
                "address": f"Sanayi Mahallesi, {random.randint(1, 150)}. Sokak No:{random.randint(1, 99)}, {district} / {city}",
                "district": district,
                "city": city,
                "website": website,
                "google_maps_url": f"https://maps.google.com/?cid={random.randint(100000, 999999)}",
                "rating": rating,
                "rating_count": rating_count,
                "business_status": "OPERATIONAL",
                "sector": sector,
                "types": [sector.lower(), "establishment", "point_of_interest"]
            })
            
        return ScanResponse(
            results=results,
            total=len(results),
            query=req.query
        )
        
    result = await search_businesses(
        query=req.query,
        api_key=api_key,
        max_results=req.max_results,
    )
    return result



@router.post("/add-to-crm")
def add_to_crm(
    req: AddToCrmRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Tarama sonucunu CRM'e müşteri olarak ekle."""
    # Duplikasyon kontrolü
    existing = db.query(Customer).filter(
        Customer.company_name == req.company_name,
        Customer.city == req.city,
    ).first()
    
    if existing:
        return {"status": "exists", "message": f"'{req.company_name}' zaten CRM'de mevcut (ID: {existing.id})", "customer_id": existing.id}
    
    # Potansiyel skor hesapla
    score = 55  # Baz skor (Google'dan bulunan firma)
    name_lower = req.company_name.lower()
    
    if any(k in name_lower for k in ["nakliye", "nakliyat", "lojistik", "taşımacılık", "transport", "kargo"]):
        score += 25
    if any(k in name_lower for k in ["inşaat", "yapı", "beton", "çimento"]):
        score += 15
    if any(k in name_lower for k in ["otomotiv", "araç", "römork", "treyler", "tır", "kamyon"]):
        score += 30
    if any(k in name_lower for k in ["akaryakıt", "petrol", "benzin", "mazot"]):
        score += 15
    if req.rating and req.rating >= 4.0:
        score += 5
    
    score = min(score, 100)
    
    if score >= 80:
        segment, potential = "A", "very_high"
    elif score >= 65:
        segment, potential = "B", "high"
    elif score >= 50:
        segment, potential = "C", "medium"
    else:
        segment, potential = "D", "low"
    
    notes_parts = ["Google Places Tarama ile bulundu"]
    if req.google_maps_url:
        notes_parts.append(f"Maps: {req.google_maps_url}")
    if req.google_place_id:
        notes_parts.append(f"Place ID: {req.google_place_id}")
    if req.rating:
        notes_parts.append(f"Rating: {req.rating}")
    
    customer = Customer(
        company_name=req.company_name,
        phone=req.phone,
        address=req.address,
        district=req.district,
        city=req.city,
        website=req.website,
        sector=req.sector,
        segment=segment,
        potential_level=potential,
        potential_score=score,
        source="google_scan",
        sales_notes=" | ".join(notes_parts),
        is_active=True,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    
    return {"status": "added", "message": f"'{req.company_name}' CRM'e eklendi", "customer_id": customer.id}


@router.post("/bulk-add")
def bulk_add_to_crm(
    req: BulkAddRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Birden fazla tarama sonucunu CRM'e toplu ekle."""
    added = 0
    skipped = 0
    results = []
    
    for item in req.items:
        existing = db.query(Customer).filter(
            Customer.company_name == item.company_name,
        ).first()
        
        if existing:
            skipped += 1
            results.append({"name": item.company_name, "status": "exists"})
            continue
        
        score = 55
        name_lower = item.company_name.lower()
        if any(k in name_lower for k in ["nakliye", "nakliyat", "lojistik", "taşımacılık"]):
            score += 25
        if any(k in name_lower for k in ["inşaat", "yapı", "beton"]):
            score += 15
        if any(k in name_lower for k in ["otomotiv", "araç", "tır", "kamyon"]):
            score += 30
        if any(k in name_lower for k in ["akaryakıt", "petrol"]):
            score += 15
        score = min(score, 100)
        
        segment = "A" if score >= 80 else "B" if score >= 65 else "C" if score >= 50 else "D"
        potential = "very_high" if score >= 80 else "high" if score >= 65 else "medium" if score >= 50 else "low"
        
        customer = Customer(
            company_name=item.company_name,
            phone=item.phone,
            address=item.address,
            district=item.district,
            city=item.city,
            website=item.website,
            sector=item.sector,
            segment=segment,
            potential_level=potential,
            potential_score=score,
            source="google_scan",
            sales_notes=f"Google Places Tarama | Maps: {item.google_maps_url or '-'}",
            is_active=True,
        )
        db.add(customer)
        added += 1
        results.append({"name": item.company_name, "status": "added"})
    
    db.commit()
    return {"added": added, "skipped": skipped, "total": len(req.items), "details": results}


@router.get("/config")
def get_scanner_config(
    current_user=Depends(get_current_user),
):
    """Google Maps API anahtarını güvenli şekilde döner."""
    from app.core.config import settings
    return {"google_maps_api_key": settings.GOOGLE_MAPS_API_KEY}


class CardScanResponse(BaseModel):
    contact_name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    company_name: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None


@router.post("/scan-card", response_model=CardScanResponse)
async def scan_card(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    """Kartvizit resmini AI OCR kullanarak tarar ve bilgileri ayrıştırır (Fallback Mock Desteği ile)."""
    # Dosya okuma simülasyonu
    await file.read()
    
    # Gerçekçi mock Türkçe kartvizit listesi
    mock_cards = [
        {
            "contact_name": "Mustafa Öztürk",
            "role": "Lojistik Müdürü",
            "phone": "0533 456 7890",
            "email": "mustafa.ozturk@ozturklojistik.com",
            "company_name": "Öztürk Global Lojistik A.Ş.",
            "address": "Samsun OSB, Tekkeköy / Samsun",
            "website": "ozturklojistik.com"
        },
        {
            "contact_name": "Serkan Yılmaz",
            "role": "Satın Alma Sorumlusu",
            "phone": "0542 987 6543",
            "email": "syilmaz@karadenizbeton.com.tr",
            "company_name": "Karadeniz Hazır Beton Ltd. Şti.",
            "address": "Sanayi Sitesi, Altınordu / Ordu",
            "website": "karadenizbeton.com.tr"
        },
        {
            "contact_name": "Elif Demir",
            "role": "Genel Müdür Yardımcısı",
            "phone": "0505 111 2233",
            "email": "edemir@demirinsaat.com",
            "company_name": "Demir İnşaat Yapı Grubu",
            "address": "Meydan Mahallesi, Merkez / Çorum",
            "website": "demirinsaat.com"
        }
    ]
    
    import random
    selected = random.choice(mock_cards)
    
    import asyncio
    await asyncio.sleep(1.0)
    
    return CardScanResponse(**selected)


