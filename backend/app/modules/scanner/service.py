"""
Google Places API ile firma tarama servisi.
Text Search ile bölgesel firma arama, telefon/adres/website bilgisi çekme.
"""
import httpx
import re
from typing import Optional
from app.core.config import settings


PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"

FIELD_MASK = ",".join([
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.nationalPhoneNumber",
    "places.internationalPhoneNumber",
    "places.websiteUri",
    "places.googleMapsUri",
    "places.rating",
    "places.userRatingCount",
    "places.businessStatus",
    "places.types",
    "places.primaryType",
    "places.location",
])


# Sektör / iş türü haritası (Places API types → CRM sektör)
TYPE_SECTOR_MAP = {
    "gas_station": "Akaryakıt",
    "fuel": "Akaryakıt",
    "construction": "İnşaat",
    "hardware_store": "İnşaat Malzemesi",
    "building_materials_store": "İnşaat Malzemesi",
    "trucking_company": "Nakliye / Lojistik",
    "moving_company": "Nakliye / Lojistik",
    "car_dealer": "Otomotiv",
    "car_repair": "Otomotiv Servis",
    "car_rental": "Araç Kiralama",
    "farm": "Tarım",
    "food_store": "Gıda",
    "grocery_store": "Gıda",
    "supermarket": "Gıda / Market",
    "restaurant": "Yemek / Catering",
    "hotel": "Konaklama",
    "factory": "Sanayi",
    "industrial_area": "Sanayi",
    "store": "Ticaret",
    "real_estate_agency": "Gayrimenkul",
    "veterinary_care": "Veteriner",
    "mining": "Madencilik",
    "electrician": "Elektrik",
    "plumber": "Tesisat",
}


def _classify_sector(types: list[str], primary_type: str = "") -> str:
    """Google Places tiplerinden CRM sektörü belirle."""
    if primary_type and primary_type in TYPE_SECTOR_MAP:
        return TYPE_SECTOR_MAP[primary_type]
    for t in (types or []):
        if t in TYPE_SECTOR_MAP:
            return TYPE_SECTOR_MAP[t]
    return "Diğer"


def _extract_district_city(address: str) -> tuple[str, str, str]:
    """Adres metninden ilçe ve şehir çıkar. Türkiye adresleri: ... İlçe/Şehir"""
    if not address:
        return "", "", ""
    
    # "Çarşamba/Samsun" veya "Çarşamba, Samsun" pattern
    parts = re.split(r'[,/]', address)
    parts = [p.strip() for p in parts if p.strip()]
    
    city = ""
    district = ""
    
    # Son parça genellikle "Türkiye"
    # Ondan önceki "Samsun" (il), ondan önceki "Çarşamba" (ilçe)
    if len(parts) >= 3:
        # "..., Çarşamba, Samsun, Türkiye" veya benzeri
        for i, p in enumerate(parts):
            if p.lower() in ["türkiye", "turkey"]:
                if i >= 2:
                    city = parts[i - 1]
                    district = parts[i - 2]
                elif i >= 1:
                    city = parts[i - 1]
                break
        if not city and len(parts) >= 2:
            city = parts[-1]
            district = parts[-2] if len(parts) >= 3 else ""
    elif len(parts) == 2:
        city = parts[-1]
        district = parts[0]
    
    # İlçe ve şehir içindeki posta kodu veya numara temizle
    city = re.sub(r'\d{5}', '', city).strip()
    district = re.sub(r'\d{5}', '', district).strip()
    
    return address, district, city


async def search_businesses(
    query: str,
    api_key: str,
    max_results: int = 20,
    location_bias: Optional[dict] = None,
) -> dict:
    """
    Google Places API ile firma ara.
    
    Args:
        query: Arama sorgusu (ör: "Çarşamba akaryakıt firmaları")
        api_key: Google API anahtarı
        max_results: Maksimum sonuç sayısı (max 20 per page)
        location_bias: Opsiyonel konum ağırlığı
    
    Returns:
        {"results": [...], "total": int, "query": str}
    """
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": FIELD_MASK,
    }
    
    body = {
        "textQuery": query,
        "languageCode": "tr",
        "maxResultCount": min(max_results, 20),
    }
    
    if location_bias:
        body["locationBias"] = location_bias
    
    all_results = []
    page_token = None
    pages_fetched = 0
    max_pages = (max_results + 19) // 20  # Her sayfada max 20 sonuç
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        while pages_fetched < max_pages:
            if page_token:
                body["pageToken"] = page_token
            
            resp = await client.post(PLACES_SEARCH_URL, json=body, headers=headers)
            
            if resp.status_code != 200:
                error_detail = resp.text[:500]
                return {
                    "results": [],
                    "total": 0,
                    "query": query,
                    "error": f"Google API Hatası ({resp.status_code}): {error_detail}",
                }
            
            data = resp.json()
            places = data.get("places", [])
            
            for place in places:
                display_name = place.get("displayName", {})
                name = display_name.get("text", "") if isinstance(display_name, dict) else str(display_name)
                
                address_full = place.get("formattedAddress", "")
                address, district, city = _extract_district_city(address_full)
                
                types = place.get("types", [])
                primary_type = place.get("primaryType", "")
                sector = _classify_sector(types, primary_type)
                
                result = {
                    "google_place_id": place.get("id", ""),
                    "company_name": name,
                    "phone": place.get("nationalPhoneNumber", "") or place.get("internationalPhoneNumber", ""),
                    "address": address_full,
                    "district": district,
                    "city": city,
                    "website": place.get("websiteUri", ""),
                    "google_maps_url": place.get("googleMapsUri", ""),
                    "rating": place.get("rating"),
                    "rating_count": place.get("userRatingCount"),
                    "business_status": place.get("businessStatus", ""),
                    "sector": sector,
                    "types": types[:5],  # İlk 5 tip
                }
                all_results.append(result)
            
            page_token = data.get("nextPageToken")
            pages_fetched += 1
            
            if not page_token or len(all_results) >= max_results:
                break
    
    return {
        "results": all_results[:max_results],
        "total": len(all_results),
        "query": query,
    }
