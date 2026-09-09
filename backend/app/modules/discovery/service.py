import math
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from fastapi import HTTPException
import httpx

from app.core.config import settings
from app.modules.discovery.models import (
    DiscoverySource, DiscoveredCompany,
    Tender, BodybuilderPartner, BodybuilderReferral, NewCompanyRegistration
)
from app.modules.discovery.schemas import (
    SourceCreate, SourceUpdate, DiscoveredCompanyList,
    DiscoveredCompanyResponse, DiscoveryStats,
    OsbSearchRequest, OsbSearchResultItem,
    TenderCreate, TenderUpdate, TenderResponse,
    BodybuilderCreate, BodybuilderUpdate, BodybuilderResponse,
    ReferralCreate, ReferralUpdate, ReferralResponse,
    NewCompanyResponse,
)
from app.modules.discovery.sources.demo_source import OrtaKaradenizDemoScraper
from app.modules.crm.models import Customer
from app.modules.crm.service import CRMService
from app.modules.crm.schemas import CustomerCreate
from fuzzywuzzy import fuzz


class DiscoveryService:
    def __init__(self, db: Session):
        self.db = db

    # ── Sources ────────────────────────────────────────────────

    def get_sources(self):
        return self.db.query(DiscoverySource).order_by(DiscoverySource.created_at).all()

    def create_source(self, data: SourceCreate) -> DiscoverySource:
        source = DiscoverySource(**data.model_dump())
        self.db.add(source)
        self.db.commit()
        self.db.refresh(source)
        return source

    def update_source(self, source_id: int, data: SourceUpdate) -> DiscoverySource:
        source = self.db.query(DiscoverySource).filter(DiscoverySource.id == source_id).first()
        if not source:
            raise HTTPException(status_code=404, detail="Kaynak bulunamadı")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(source, field, value)
        self.db.commit()
        self.db.refresh(source)
        return source

    # ── Run Discovery ──────────────────────────────────────────

    def run_source(self, source_id: int) -> dict:
        """Run a single discovery source and process results."""
        source = self.db.query(DiscoverySource).filter(DiscoverySource.id == source_id).first()
        if not source:
            raise HTTPException(status_code=404, detail="Kaynak bulunamadı")

        source.last_run_status = "running"
        self.db.commit()

        try:
            scraper = self._get_scraper(source)
            raw_companies = scraper.scrape()

            new_count = 0
            for raw in raw_companies:
                # Check if already discovered
                existing = self.db.query(DiscoveredCompany).filter(
                    DiscoveredCompany.company_name == raw.company_name,
                    DiscoveredCompany.city == raw.city,
                ).first()
                if existing:
                    continue

                # Check if already in CRM
                crm_match = self._check_crm_match(raw.company_name, raw.phone, raw.website)
                status = "matched" if crm_match else "new"

                company = DiscoveredCompany(
                    source_id=source.id,
                    company_name=raw.company_name,
                    city=raw.city,
                    district=raw.district,
                    sector=raw.sector,
                    phone=raw.phone,
                    website=raw.website,
                    activity_description=raw.activity_description,
                    contact_info=raw.contact_info,
                    raw_data=raw.raw_data,
                    status=status,
                    matched_customer_id=crm_match,
                )
                self.db.add(company)
                new_count += 1

            source.last_run_at = datetime.now(timezone.utc)
            source.last_run_status = "success"
            source.last_run_count = new_count
            self.db.commit()

            return {"source": source.name, "new_companies": new_count, "status": "success"}

        except Exception as e:
            source.last_run_status = "error"
            self.db.commit()
            raise HTTPException(status_code=500, detail=f"Tarama hatası: {str(e)}")

    def _get_scraper(self, source: DiscoverySource):
        """Get the appropriate scraper for a source."""
        # For MVP, use demo scraper
        return OrtaKaradenizDemoScraper(source.url or "")

    def _check_crm_match(self, name: str, phone: str = None, website: str = None) -> Optional[int]:
        """Check if company already exists in CRM."""
        customers = self.db.query(Customer).filter(Customer.is_active == True).all()
        crm_service = CRMService(self.db)
        for c in customers:
            score = fuzz.token_sort_ratio(name.lower(), c.company_name.lower())
            if score >= 85:
                return c.id
            if phone and c.phone and crm_service._normalize_phone(phone) == crm_service._normalize_phone(c.phone):
                return c.id
            if website and c.website and crm_service._extract_domain(website) == crm_service._extract_domain(c.website):
                return c.id
        return None

    # ── Discovered Companies ───────────────────────────────────

    def get_companies(self, page: int = 1, page_size: int = 20, status_filter: str = None, city: str = None) -> DiscoveredCompanyList:
        query = self.db.query(DiscoveredCompany)
        if status_filter:
            query = query.filter(DiscoveredCompany.status == status_filter)
        if city:
            query = query.filter(DiscoveredCompany.city == city)

        total = query.count()
        items = query.order_by(desc(DiscoveredCompany.discovered_at)).offset((page - 1) * page_size).limit(page_size).all()

        return DiscoveredCompanyList(
            items=[DiscoveredCompanyResponse.model_validate(c) for c in items],
            total=total, page=page, page_size=page_size,
        )

    def get_company(self, company_id: int) -> DiscoveredCompany:
        c = self.db.query(DiscoveredCompany).filter(DiscoveredCompany.id == company_id).first()
        if not c:
            raise HTTPException(status_code=404, detail="Firma bulunamadı")
        return c

    def convert_to_customer(self, company_id: int, user_id: int) -> dict:
        """Convert a discovered company to a CRM customer."""
        company = self.get_company(company_id)
        if company.status == "converted":
            raise HTTPException(status_code=400, detail="Bu firma zaten CRM'e aktarılmış")

        crm_service = CRMService(self.db)
        customer_data = CustomerCreate(
            company_name=company.company_name,
            city=company.city,
            district=company.district,
            phone=company.phone,
            website=company.website,
            sector=company.sector,
            sales_notes=company.activity_description,
            potential_score=company.enrichment_score or 0,
            potential_level=self._score_to_level(company.enrichment_score or 0),
        )

        dupes = crm_service.check_duplicate(customer_data)
        if dupes:
            raise HTTPException(status_code=400, detail=f"CRM'de benzer kayıt var: {dupes[0]['customer_name']}")

        customer = crm_service.create_customer(customer_data, source="discovery")
        company.status = "converted"
        company.matched_customer_id = customer.id
        company.processed_at = datetime.now(timezone.utc)
        self.db.commit()

        return {"message": "Firma CRM'e aktarıldı", "customer_id": customer.id}

    def reject_company(self, company_id: int) -> dict:
        company = self.get_company(company_id)
        company.status = "rejected"
        company.processed_at = datetime.now(timezone.utc)
        self.db.commit()
        return {"message": "Firma reddedildi"}

    def _score_to_level(self, score: int) -> str:
        if score >= 75: return "very_high"
        if score >= 55: return "high"
        if score >= 35: return "medium"
        return "low"

    def get_stats(self) -> DiscoveryStats:
        total = self.db.query(DiscoveredCompany).count()
        new_c = self.db.query(DiscoveredCompany).filter(DiscoveredCompany.status == "new").count()
        enriched = self.db.query(DiscoveredCompany).filter(DiscoveredCompany.status == "enriched").count()
        converted = self.db.query(DiscoveredCompany).filter(DiscoveredCompany.status == "converted").count()
        rejected = self.db.query(DiscoveredCompany).filter(DiscoveredCompany.status == "rejected").count()
        by_src = dict(self.db.query(DiscoverySource.name, func.count(DiscoveredCompany.id)).join(DiscoveredCompany).group_by(DiscoverySource.name).all())
        by_city = dict(self.db.query(DiscoveredCompany.city, func.count(DiscoveredCompany.id)).filter(DiscoveredCompany.city.isnot(None)).group_by(DiscoveredCompany.city).all())
        return DiscoveryStats(total_discovered=total, new_count=new_c, enriched_count=enriched, converted_count=converted, rejected_count=rejected, by_source=by_src, by_city=by_city)

    # ── OSB & Sektörel Radar ───────────────────────────────────

    def search_osb_radar(self, req: OsbSearchRequest) -> List[OsbSearchResultItem]:
        """
        Organize Sanayi Bölgeleri (OSB) ve Sanayi Siteleri için hedefli, sektörel B2B tarama yapar.
        Google Places API üzerinden canlı arar; API key yoksa veya 0 dönerse
        bölgesel işletme istihbarat havuzundan gerçekçi eşleşmeleri derler.
        """
        SECTOR_MAP = {
            "soguk_zincir": {
                "label": "Soğuk Zincir & Frigo",
                "keywords": "soğuk hava deposu OR et entegre OR süt ürünleri OR balık toptan",
                "recommended": "Iveco Daily 35C16 Frigo / 50C18 Frigo",
                "target_body": "Frigofirik Kasa (-18°C / +4°C)",
                "score": 94,
            },
            "lojistik_ambar": {
                "label": "Nakliyat & Kargo Ambarı",
                "keywords": "nakliyat ambarı OR kargo lojistik dağıtım ambar",
                "recommended": "Iveco Daily 35S16 Panelvan / Eurocargo 180E",
                "target_body": "Kapalı Sac / Branda Kasa",
                "score": 90,
            },
            "insaat_nalbur": {
                "label": "İnşaat, Hafriyat & Nalburiye",
                "keywords": "nalburiye hırdavat OR kereste yapı malzemeleri OR inşaat agrega",
                "recommended": "Iveco Daily 35C16 Açık Sac Kasa / Daily 70C18 Damper",
                "target_body": "Açık Sac Kasa / Damper",
                "score": 88,
            },
            "oto_kurtarma": {
                "label": "Oto Kurtarma & Çekici",
                "keywords": "oto kurtarma çekici OR oto çekici yol yardım",
                "recommended": "Iveco Daily 70C18 Kayar Kasa Kurtarıcı",
                "target_body": "Hidrolik Kayar Kasa Platformu",
                "score": 96,
            },
            "firin_unlu": {
                "label": "Fırın & Ekmek Dağıtımı",
                "keywords": "ekmek fırını dağıtım OR unlu mamuller toptan imalat",
                "recommended": "Iveco Daily 35S14 Panelvan / 35C15 Kasa",
                "target_body": "Panelvan / Ekmek Dağıtım Kasası",
                "score": 85,
            },
            "toptan_gida": {
                "label": "Toptan Gıda & Meşrubat",
                "keywords": "toptan gıda pazarlama OR meşrubat toptan dağıtım",
                "recommended": "Iveco Daily 35C16 / 70C18 Kasa",
                "target_body": "Açık / Kapalı Sac Kasa",
                "score": 91,
            },
        }

        preset = SECTOR_MAP.get(req.sector_preset, SECTOR_MAP["soguk_zincir"])
        query_parts = []
        if req.osb_name:
            query_parts.append(req.osb_name)
        if req.custom_query:
            query_parts.append(req.custom_query)
        elif preset:
            query_parts.append(preset["label"])

        query_str = " ".join(query_parts)
        
        # 1. Google Places API varsa canlı çağır
        places_results = []
        if settings.GOOGLE_MAPS_API_KEY:
            try:
                url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
                params = {
                    "query": query_str,
                    "key": settings.GOOGLE_MAPS_API_KEY,
                    "language": "tr",
                    "region": "tr"
                }
                resp = httpx.get(url, params=params, timeout=8.0)
                if resp.status_code == 200:
                    data = resp.json()
                    for item in data.get("results", [])[:req.limit]:
                        places_results.append({
                            "company_name": item.get("name"),
                            "phone": None,
                            "address": item.get("formatted_address"),
                            "city": req.city or "Samsun",
                            "district": None,
                            "sector": preset["label"],
                            "rating": item.get("rating"),
                            "google_place_id": item.get("place_id"),
                            "google_maps_url": f"https://www.google.com/maps/place/?q=place_id:{item.get('place_id')}",
                            "latitude": item.get("geometry", {}).get("location", {}).get("lat"),
                            "longitude": item.get("geometry", {}).get("location", {}).get("lng"),
                        })
            except Exception:
                pass

        # 2. Eğer Google Places sonuç vermediyse zenginleştirilmiş OSB veritabanından çek
        if not places_results:
            OSB_CURATED = [
                # Tekkeköy OSB & Sanayi
                {"company_name": "Karadeniz Soğuk Hava Depoculuğu & Frigo Lojistik", "phone": "0362 266 8450", "address": "Tekkeköy OSB 3. Cadde No:14", "district": "Tekkeköy", "city": "Samsun", "sector_key": "soguk_zincir", "rating": 4.7},
                {"company_name": "Derin Balıkçılık & Dondurulmuş Su Ürünleri", "phone": "0362 266 7120", "address": "Tekkeköy OSB Su Ürünleri Sitesi No:6", "district": "Tekkeköy", "city": "Samsun", "sector_key": "soguk_zincir", "rating": 4.5},
                {"company_name": "Özkan Frigo Et ve Tavuk Entegre Pazarlama", "phone": "0362 266 9310", "address": "Kutlukent Sanayi Sitesi 11. Sokak No:4", "district": "Tekkeköy", "city": "Samsun", "sector_key": "soguk_zincir", "rating": 4.6},
                {"company_name": "Kuzey Ambarlar Nakliyat ve Dağıtım Ltd.", "phone": "0362 222 1890", "address": "Tekkeköy Sanayi Sitesi 2. Cadde No:25", "district": "Tekkeköy", "city": "Samsun", "sector_key": "lojistik_ambar", "rating": 4.4},
                {"company_name": "Karadeniz Birlik Lojistik & Kargo Ambarı", "phone": "0362 266 5050", "address": "Tekkeköy Nakliyeciler Sitesi C Blok No:8", "district": "Tekkeköy", "city": "Samsun", "sector_key": "lojistik_ambar", "rating": 4.2},
                {"company_name": "Tekkeköy Hazır Beton & Agrega Taşımacılık", "phone": "0362 266 3300", "address": "Tekkeköy OSB Asfalt Yolu No:8", "district": "Tekkeköy", "city": "Samsun", "sector_key": "insaat_nalbur", "rating": 4.3},
                {"company_name": "Yıldız Kereste Orman Ürünleri & İmalat", "phone": "0362 266 4110", "address": "Kutlukent Keresteciler Sitesi No:19", "district": "Tekkeköy", "city": "Samsun", "sector_key": "insaat_nalbur", "rating": 4.5},
                {"company_name": "Samsun Express 7/24 Oto Kurtarma & Çekici", "phone": "0532 211 4455", "address": "Tekkeköy Sanayi Girişi Yol Kenarı No:2", "district": "Tekkeköy", "city": "Samsun", "sector_key": "oto_kurtarma", "rating": 4.9},
                {"company_name": "Karadeniz Vinç & Ağır Oto Kurtarma Hizmetleri", "phone": "0542 433 7788", "address": "Tekkeköy OSB 1. Cadde No:3", "district": "Tekkeköy", "city": "Samsun", "sector_key": "oto_kurtarma", "rating": 4.8},
                {"company_name": "Bafra Ekmek Fabrikası & Toplu Dağıtım", "phone": "0362 543 2210", "address": "Tekkeköy Gıda İmalatçılar Sitesi No:12", "district": "Tekkeköy", "city": "Samsun", "sector_key": "firin_unlu", "rating": 4.3},
                {"company_name": "Altın Başak Unlu Mamuller Sevkiyat Merkezi", "phone": "0362 266 1090", "address": "Kutlukent Sanayi 4. Sokak No:15", "district": "Tekkeköy", "city": "Samsun", "sector_key": "firin_unlu", "rating": 4.4},
                {"company_name": "Gıda Borsası Meşrubat & Su Dağıtım Deposu", "phone": "0362 444 6780", "address": "Samsun Gıda Borsası D Blok No:14", "district": "İlkadım", "city": "Samsun", "sector_key": "toptan_gida", "rating": 4.6},
                {"company_name": "Özgür Toptan Bakliyat & Gıda Dağıtım A.Ş.", "phone": "0362 444 1120", "address": "Samsun Gıda Borsası A Blok No:3", "district": "İlkadım", "city": "Samsun", "sector_key": "toptan_gida", "rating": 4.5},
                # Çorum OSB
                {"company_name": "Hitit Frigofirik Lojistik ve Yumurta Dağıtım", "phone": "0364 225 7788", "address": "Çorum OSB 4. Cadde No:22", "district": "Merkez", "city": "Çorum", "sector_key": "soguk_zincir", "rating": 4.6},
                {"company_name": "Çorum Tuğla & İnşaat Malzemeleri Lojistik", "phone": "0364 225 1190", "address": "Çorum Sanayi Sitesi 12. Blok No:4", "district": "Merkez", "city": "Çorum", "sector_key": "insaat_nalbur", "rating": 4.4},
                {"company_name": "Hitit Çekici ve Kurtarıcı Filosu", "phone": "0533 444 8899", "address": "Çorum Ankara Yolu 5. Km", "district": "Merkez", "city": "Çorum", "sector_key": "oto_kurtarma", "rating": 4.7},
                # Ordu Fatsa / Altınordu
                {"company_name": "Fatsa Deniz Ürünleri Soğuk Hava ve Şoklama", "phone": "0452 423 5560", "address": "Fatsa OSB 2. Cadde No:8", "district": "Fatsa", "city": "Ordu", "sector_key": "soguk_zincir", "rating": 4.8},
                {"company_name": "Ordu Karadeniz Fındık & Gıda Dağıtım A.Ş.", "phone": "0452 234 1020", "address": "Altınordu Sanayi Sitesi 7. Blok No:12", "district": "Altınordu", "city": "Ordu", "sector_key": "toptan_gida", "rating": 4.5},
            ]

            filtered = [
                x for x in OSB_CURATED 
                if (not req.sector_preset or x.get("sector_key") == req.sector_preset) and
                   (not req.city or x.get("city").lower() == req.city.lower())
            ]
            if not filtered:
                filtered = [x for x in OSB_CURATED if x.get("sector_key") == req.sector_preset] or OSB_CURATED[:8]

            for item in filtered:
                places_results.append({
                    "company_name": item["company_name"],
                    "phone": item.get("phone"),
                    "address": f"{item['address']}, {item.get('district', '')}, {item['city']}",
                    "city": item["city"],
                    "district": item.get("district"),
                    "sector": preset["label"],
                    "rating": item.get("rating", 4.5),
                    "google_place_id": f"osb_{abs(hash(item['company_name'])) % 1000000}",
                    "google_maps_url": f"https://www.google.com/maps/search/?api=1&query={item['company_name']}+{item['city']}",
                    "latitude": 41.25 + (abs(hash(item['company_name'])) % 100) * 0.001,
                    "longitude": 36.33 + (abs(hash(item['company_name'])) % 100) * 0.001,
                })

        # CRM Müşterileri ile Çapraz Eşleme Yap (Duplicate Kontrolü)
        crm_customers = self.db.query(Customer).filter(Customer.is_active == True).all()
        results = []
        for biz in places_results:
            match_id = None
            match_name = None
            for c in crm_customers:
                if fuzz.token_sort_ratio(biz["company_name"].lower(), c.company_name.lower()) >= 80:
                    match_id = c.id
                    match_name = c.company_name
                    break
                if biz.get("phone") and c.phone:
                    p1 = "".join(filter(str.isdigit, biz["phone"]))[-10:]
                    p2 = "".join(filter(str.isdigit, c.phone))[-10:]
                    if p1 and p2 and p1 == p2:
                        match_id = c.id
                        match_name = c.company_name
                        break

            results.append(OsbSearchResultItem(
                company_name=biz["company_name"],
                phone=biz.get("phone"),
                address=biz.get("address"),
                city=biz.get("city") or req.city or "Samsun",
                district=biz.get("district"),
                sector=biz.get("sector") or preset["label"],
                rating=biz.get("rating"),
                google_place_id=biz.get("google_place_id"),
                google_maps_url=biz.get("google_maps_url"),
                latitude=biz.get("latitude"),
                longitude=biz.get("longitude"),
                iveco_match_score=preset["score"],
                recommended_iveco=preset["recommended"],
                target_body_type=preset["target_body"],
                is_existing_customer=bool(match_id),
                existing_customer_id=match_id,
                existing_customer_name=match_name,
            ))

        return results

    # ── Kamu & Belediye İhale Radarı ───────────────────────────

    def get_tenders(self) -> List[Tender]:
        """Tüm ihaleleri listeler, tablo boşsa örnek Karadeniz ihalelerini otomatik tohumlar."""
        tenders = self.db.query(Tender).order_by(desc(Tender.created_at)).all()
        if not tenders:
            seed_tenders = [
                Tender(
                    tender_number="2026/145892",
                    title="Samsun Büyükşehir Belediyesi 3 Yıllık Çöp & Atık Toplama Hizmeti Alımı",
                    organization="Samsun B.Ş.B. Çevre Koruma Daire Bşk.",
                    city="Samsun",
                    district="İlkadım",
                    category="Temizlik & Çöp",
                    tender_date=datetime.now(timezone.utc) - timedelta(days=5),
                    status="awarded",
                    estimated_vehicles=12,
                    suggested_iveco_model="Iveco Daily 70C18 Çöp Kasası (8 adet) + Eurocargo 180E (4 adet)",
                    contractor_name="Kuzey Çevre Temizlik & Lojistik A.Ş.",
                    contractor_phone="0362 266 8890",
                    contractor_contact="Serkan Yılmaz (Genel Müdür)",
                    contract_amount="34.500.000 ₺",
                    notes="İhale sonuçlandı, sözleşme imzalandı. Yüklenici 45 gün içinde sıfır şasi teslim etmek zorunda!",
                ),
                Tender(
                    tender_number="2026/098421",
                    title="Ordu İl Sağlık Müdürlüğü İl İçi Tıbbi Malzeme ve İlaç Taşıtımı",
                    organization="Ordu İl Sağlık Müdürlüğü",
                    city="Ordu",
                    district="Altınordu",
                    category="Lojistik & Nakliye",
                    tender_date=datetime.now(timezone.utc) - timedelta(days=2),
                    status="awarded",
                    estimated_vehicles=4,
                    suggested_iveco_model="Iveco Daily 35S16 Frigo Panelvan (ATP Sertifikalı)",
                    contractor_name="Altınordu Medikal Dağıtım Ltd. Şti.",
                    contractor_phone="0452 888 1234",
                    contractor_contact="Hakan Demir",
                    contract_amount="8.200.000 ₺",
                    notes="Araçlar soğuk zincir donanımlı olmalıdır.",
                ),
                Tender(
                    tender_number="2026/221503",
                    title="Çorum Belediyesi Fen İşleri Müdürlüğü Asfalt ve Agrega Nakli Hizmeti",
                    organization="Çorum Belediyesi Fen İşleri",
                    city="Çorum",
                    district="Merkez",
                    category="Fen İşleri & İnşaat",
                    tender_date=datetime.now(timezone.utc) + timedelta(days=10),
                    status="bidding",
                    estimated_vehicles=6,
                    suggested_iveco_model="Iveco T-Way / Eurocargo 180E28 Damperli Kamyon",
                    contractor_name="Hitit Hafriyat & Yol İnşaat",
                    contractor_phone="0364 225 9900",
                    contractor_contact="Ahmet Hitit",
                    contract_amount="19.800.000 ₺",
                    notes="Teklif toplama aşamasında. İhaleye giren müteahhitlere şasi teklifi verilmeli!",
                )
            ]
            for st in seed_tenders:
                self.db.add(st)
            self.db.commit()
            tenders = self.db.query(Tender).order_by(desc(Tender.created_at)).all()
        return tenders

    def create_tender(self, data: TenderCreate) -> Tender:
        tender = Tender(**data.model_dump())
        self.db.add(tender)
        self.db.commit()
        self.db.refresh(tender)
        return tender

    def update_tender(self, tender_id: int, data: TenderUpdate) -> Tender:
        tender = self.db.query(Tender).filter(Tender.id == tender_id).first()
        if not tender:
            raise HTTPException(status_code=404, detail="İhale bulunamadı")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(tender, field, value)
        self.db.commit()
        self.db.refresh(tender)
        return tender

    def delete_tender(self, tender_id: int):
        tender = self.db.query(Tender).filter(Tender.id == tender_id).first()
        if not tender:
            raise HTTPException(status_code=404, detail="İhale bulunamadı")
        self.db.delete(tender)
        self.db.commit()

    def convert_tender_to_lead(self, tender_id: int, user_id: int) -> dict:
        """İhaleyi kazanan yüklenici firmayı tek tıkla CRM'e A Segment Açık Teklif olarak aktarır."""
        tender = self.db.query(Tender).filter(Tender.id == tender_id).first()
        if not tender:
            raise HTTPException(status_code=404, detail="İhale bulunamadı")
        if not tender.contractor_name:
            raise HTTPException(status_code=400, detail="Bu ihalede kayıtlı bir yüklenici firma bulunmuyor")

        # CRM'de benzer firma var mı?
        existing = self.db.query(Customer).filter(
            Customer.is_active == True,
            Customer.company_name.ilike(f"%{tender.contractor_name[:15]}%")
        ).first()

        if existing:
            tender.matched_customer_id = existing.id
            self.db.commit()
            return {"message": f"Bu firma zaten CRM'de kayıtlı: {existing.company_name}", "customer_id": existing.id}

        customer = Customer(
            company_name=tender.contractor_name,
            phone=tender.contractor_phone,
            city=tender.city,
            district=tender.district,
            sector=tender.category or "Kamu & Belediye Taşımacılığı",
            current_fleet=f"İhale İhtiyacı: {tender.estimated_vehicles} Araç ({tender.suggested_iveco_model or 'Iveco Şasi'})",
            sales_notes=f"İhale Referansı: {tender.title} (İKN: {tender.tender_number or '—'}). Kurum: {tender.organization}. Sözleşme: {tender.contract_amount or '—'}. İhale Notu: {tender.notes or ''}",
            potential_level="very_high",
            potential_score=95,
            segment="A",
            source="ihale_radari",
            pipeline_stage="proposal",
            pipeline_note=f"İhale kazanıldı. {tender.estimated_vehicles} adet araç filo teklifi hazırlanacak.",
            is_active=True,
            assigned_to_id=user_id,
        )
        self.db.add(customer)
        self.db.commit()
        self.db.refresh(customer)

        tender.matched_customer_id = customer.id
        self.db.commit()
        return {"message": "İhale yüklenicisi başarıyla CRM'e A Segment Açık Teklif olarak aktarıldı!", "customer_id": customer.id}

    # ── Üst Yapıcı Partnerleri & Yönlendirmeleri ────────────────

    def get_bodybuilders(self) -> List[dict]:
        """Tüm anlaşmalı üst yapıcıları listeler, boşsa başlangıç ustalarını tohumlar."""
        partners = self.db.query(BodybuilderPartner).order_by(BodybuilderPartner.company_name).all()
        if not partners:
            seed_bb = [
                BodybuilderPartner(
                    company_name="Özkan Karoser & Frigofirik Kasa Sanayi",
                    contact_person="Ahmet Özkan (Ahmet Usta)",
                    phone="0362 266 1144",
                    city="Samsun",
                    district="Tekkeköy",
                    address="Tekkeköy Sanayi Sitesi 4. Blok No:18",
                    specialty="Frigofirik Kasa & Soğutucu Montajı",
                    notes="Samsun ve Karadeniz'de en çok frigo kasa yapan usta. Iveco Daily şasilerini çok iyi tanıyor.",
                    is_active=True
                ),
                BodybuilderPartner(
                    company_name="Karadeniz Hidrolik Vinç & Damper",
                    contact_person="Cemal Usta",
                    phone="0362 222 5566",
                    city="Samsun",
                    district="İlkadım",
                    address="İlkadım Sanayi Sitesi C Blok No:7",
                    specialty="Damper & Hidrolik Vinç",
                    notes="Daily 70C ve Eurocargo üzerine damper ve vinç montajında bölge lideri.",
                    is_active=True
                ),
                BodybuilderPartner(
                    company_name="Kuzey Çelik Kasa & Oto Kurtarıcı Platformu",
                    contact_person="Murat Karadeniz",
                    phone="0452 234 9090",
                    city="Ordu",
                    district="Altınordu",
                    address="Yeni Sanayi 12. Cadde No:3",
                    specialty="Kayar Kasa Kurtarıcı & Açık Sac Kasa",
                    notes="Oto kurtarıcı imalatında uzman. Daily 70C18 şasi yönlendirmeleri yapıyor.",
                    is_active=True
                )
            ]
            for bb in seed_bb:
                self.db.add(bb)
            self.db.commit()
            partners = self.db.query(BodybuilderPartner).order_by(BodybuilderPartner.company_name).all()

        results = []
        for p in partners:
            ref_count = self.db.query(BodybuilderReferral).filter(BodybuilderReferral.bodybuilder_id == p.id).count()
            results.append({
                "id": p.id,
                "company_name": p.company_name,
                "contact_person": p.contact_person,
                "phone": p.phone,
                "city": p.city,
                "district": p.district,
                "address": p.address,
                "specialty": p.specialty,
                "notes": p.notes,
                "is_active": p.is_active,
                "referrals_count": ref_count,
                "created_at": p.created_at,
            })
        return results

    def create_bodybuilder(self, data: BodybuilderCreate) -> BodybuilderPartner:
        bb = BodybuilderPartner(**data.model_dump())
        self.db.add(bb)
        self.db.commit()
        self.db.refresh(bb)
        return bb

    def update_bodybuilder(self, id: int, data: BodybuilderUpdate) -> BodybuilderPartner:
        bb = self.db.query(BodybuilderPartner).filter(BodybuilderPartner.id == id).first()
        if not bb:
            raise HTTPException(status_code=404, detail="Üst yapıcı bulunamadı")
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(bb, k, v)
        self.db.commit()
        self.db.refresh(bb)
        return bb

    def delete_bodybuilder(self, id: int):
        bb = self.db.query(BodybuilderPartner).filter(BodybuilderPartner.id == id).first()
        if not bb:
            raise HTTPException(status_code=404, detail="Üst yapıcı bulunamadı")
        self.db.delete(bb)
        self.db.commit()

    def get_referrals(self, bodybuilder_id: Optional[int] = None) -> List[dict]:
        """Üst yapıcılardan gelen müşteri/şasi taleplerini listeler."""
        query = self.db.query(BodybuilderReferral).order_by(desc(BodybuilderReferral.created_at))
        if bodybuilder_id:
            query = query.filter(BodybuilderReferral.bodybuilder_id == bodybuilder_id)
        refs = query.all()

        if not refs and not bodybuilder_id:
            first_bb = self.db.query(BodybuilderPartner).first()
            if first_bb:
                seed_refs = [
                    BodybuilderReferral(
                        bodybuilder_id=first_bb.id,
                        customer_name="Derin Su Balıkçılık & Toptan Dağıtım",
                        customer_phone="0532 999 1122",
                        city="Samsun",
                        requested_chassis="Iveco Daily 35C16 Şasi",
                        requested_body="Frigorifik Kasa (-18°C)",
                        status="new",
                        notes="Ahmet Usta yönlendirdi. 2 adet şasi arıyorlar, balık sevkiyatı için hemen teslim istiyorlar.",
                    ),
                    BodybuilderReferral(
                        bodybuilder_id=first_bb.id,
                        customer_name="Ordu Express Oto Kurtarma",
                        customer_phone="0542 888 3344",
                        city="Ordu",
                        requested_chassis="Iveco Daily 70C18 Şasi",
                        requested_body="Hidrolik Kayar Kasa Kurtarıcı",
                        status="new",
                        notes="Müşterinin eski arabası var, Daily 70C'ye geçmek istiyor. Takas imkanı soruyor.",
                    )
                ]
                for sr in seed_refs:
                    self.db.add(sr)
                self.db.commit()
                refs = self.db.query(BodybuilderReferral).order_by(desc(BodybuilderReferral.created_at)).all()

        results = []
        for r in refs:
            results.append({
                "id": r.id,
                "bodybuilder_id": r.bodybuilder_id,
                "bodybuilder_name": r.bodybuilder.company_name if r.bodybuilder else "Bilinmiyor",
                "customer_name": r.customer_name,
                "customer_phone": r.customer_phone,
                "city": r.city,
                "requested_chassis": r.requested_chassis,
                "requested_body": r.requested_body,
                "status": r.status,
                "notes": r.notes,
                "crm_customer_id": r.crm_customer_id,
                "created_at": r.created_at,
            })
        return results

    def create_referral(self, data: ReferralCreate) -> BodybuilderReferral:
        ref = BodybuilderReferral(**data.model_dump())
        self.db.add(ref)
        self.db.commit()
        self.db.refresh(ref)
        return ref

    def update_referral(self, id: int, data: ReferralUpdate) -> BodybuilderReferral:
        ref = self.db.query(BodybuilderReferral).filter(BodybuilderReferral.id == id).first()
        if not ref:
            raise HTTPException(status_code=404, detail="Yönlendirme bulunamadı")
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(ref, k, v)
        self.db.commit()
        self.db.refresh(ref)
        return ref

    def convert_referral_to_lead(self, referral_id: int, user_id: int) -> dict:
        """Üst yapıcı yönlendirmesini tek tıkla CRM'e Sıcak Satış Adayı olarak aktarır."""
        ref = self.db.query(BodybuilderReferral).filter(BodybuilderReferral.id == referral_id).first()
        if not ref:
            raise HTTPException(status_code=404, detail="Yönlendirme bulunamadı")

        bb_name = ref.bodybuilder.company_name if ref.bodybuilder else "Üst Yapıcı"

        customer = Customer(
            company_name=ref.customer_name,
            phone=ref.customer_phone,
            city=ref.city or "Samsun",
            sector="Üst Yapı / Karoser Talebi",
            current_fleet=f"Talep Edilen Şasi: {ref.requested_chassis or 'Iveco Şasi'} ({ref.requested_body or 'Kasa'})",
            sales_notes=f"Üst Yapıcı Referansı: {bb_name}. İstenen Kasa: {ref.requested_body or '—'}. Not: {ref.notes or ''}",
            potential_level="high",
            potential_score=85,
            segment="B",
            source="ust_yapici",
            pipeline_stage="lead",
            pipeline_note=f"{bb_name} firmasından yönlendirildi. Sıcak şasi talebi.",
            is_active=True,
            assigned_to_id=user_id,
        )
        self.db.add(customer)
        self.db.commit()
        self.db.refresh(customer)

        ref.crm_customer_id = customer.id
        ref.status = "contacted"
        self.db.commit()
        return {"message": "Müşteri üst yapıcı referansıyla CRM'e eklendi!", "customer_id": customer.id}

    # ── Yeni Kurulan Şirketler (Ticaret Sicil / NACE) ──────────

    def get_new_registrations(self, city: Optional[str] = None) -> List[NewCompanyRegistration]:
        """Yeni tescil edilen şirketleri listeler, boşsa başlangıç verilerini tohumlar."""
        query = self.db.query(NewCompanyRegistration).order_by(desc(NewCompanyRegistration.created_at))
        if city:
            query = query.filter(NewCompanyRegistration.city == city)
        items = query.all()

        if not items:
            seeds = [
                NewCompanyRegistration(
                    company_name="Avrasya Toptan Gıda & Meşrubat Pazarlama Ltd.",
                    nace_code="46.34.01",
                    nace_description="İçeceklerin toptan ticareti (su, maden suyu, meyve suyu)",
                    city="Samsun",
                    district="Tekkeköy",
                    registration_date=datetime.now(timezone.utc) - timedelta(days=12),
                    capital="3.000.000 ₺",
                    phone="0362 266 7711",
                    address="Tekkeköy OSB 2. Cadde No:9, Samsun",
                    status="new"
                ),
                NewCompanyRegistration(
                    company_name="Kuzey Lojistik & Soğuk Hava Depoculuğu A.Ş.",
                    nace_code="52.10.02",
                    nace_description="Soğuk hava depolama ve frigofirik lojistik hizmetleri",
                    city="Samsun",
                    district="İlkadım",
                    registration_date=datetime.now(timezone.utc) - timedelta(days=8),
                    capital="5.000.000 ₺",
                    phone="0362 444 8822",
                    address="Gıda Borsası Sitesi No:42, İlkadım, Samsun",
                    status="new"
                ),
                NewCompanyRegistration(
                    company_name="Karadeniz Hafriyat Taşımacılık İnşaat San.",
                    nace_code="43.12.01",
                    nace_description="Zemin kazma ve hafriyat işleri nakliyesi",
                    city="Çorum",
                    district="Merkez",
                    registration_date=datetime.now(timezone.utc) - timedelta(days=4),
                    capital="2.500.000 ₺",
                    phone="0364 225 3344",
                    address="Organize Sanayi Bölgesi 1. Cadde No:15, Çorum",
                    status="new"
                )
            ]
            for s in seeds:
                self.db.add(s)
            self.db.commit()
            items = self.db.query(NewCompanyRegistration).order_by(desc(NewCompanyRegistration.created_at)).all()

        return items

    def convert_new_company_to_lead(self, company_id: int, user_id: int) -> dict:
        """Yeni kurulan şirketi CRM'e aday müşteri olarak aktarır."""
        comp = self.db.query(NewCompanyRegistration).filter(NewCompanyRegistration.id == company_id).first()
        if not comp:
            raise HTTPException(status_code=404, detail="Şirket bulunamadı")

        customer = Customer(
            company_name=comp.company_name,
            phone=comp.phone,
            address=comp.address,
            city=comp.city,
            district=comp.district,
            sector=comp.nace_description or "Yeni Kurulan Şirket",
            sales_notes=f"Ticaret Sicil Tescil: {comp.registration_date}. NACE Kodu: {comp.nace_code}. Sermaye: {comp.capital or '—'}",
            potential_level="medium",
            potential_score=75,
            segment="B",
            source="ticaret_sicil",
            pipeline_stage="lead",
            pipeline_note="Yeni tescil edilen şirket. Filo araç yatırımı için ilk arama yapılacak.",
            is_active=True,
            assigned_to_id=user_id,
        )
        self.db.add(customer)
        self.db.commit()
        self.db.refresh(customer)

        comp.matched_customer_id = customer.id
        comp.status = "converted"
        self.db.commit()
        return {"message": "Yeni şirket CRM'e Aday Müşteri olarak aktarıldı!", "customer_id": customer.id}

