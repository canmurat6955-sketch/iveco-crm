"""
Ticaret odaları ve Google araştırmasından toplanan gerçek Orta Karadeniz firmaları.
Bu script CRM customers ve discovered_companies tablolarına veri ekler.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timezone, timedelta
import random
from app.core.database import SessionLocal, create_all_tables
from app.modules.auth.models import User  # Required: Customer has FK to User
from app.modules.crm.models import Customer
from app.modules.discovery.models import DiscoveredCompany, DiscoverySource

create_all_tables()
db = SessionLocal()

# ══════════════════════════════════════════════════════════════════
# 1) CRM MÜŞTERİLERİ — Mevcut müşteri portföyü (zaten ilişki olan)
# ══════════════════════════════════════════════════════════════════
CRM_CUSTOMERS = [
    # Samsun
    {"company_name": "Sandıkçı Global Lojistik", "city": "Samsun", "district": "İlkadım", "sector": "Lojistik", "phone": "0362 431 55 00", "website": "www.sandikci.com.tr", "segment": "A", "potential_level": "very_high", "potential_score": 88, "sales_notes": "Karayolu lojistik, geniş tır filosu. Filo yenileme döneminde."},
    {"company_name": "HSM Hafriyat", "city": "Samsun", "district": "İlkadım", "sector": "Hafriyat", "phone": "0362 266 00 55", "website": "www.samsunhafriyat.com.tr", "segment": "B", "potential_level": "high", "potential_score": 72, "sales_notes": "Bina temel hafriyatı, yıkım, moloz nakliye. Kamyon filosu var."},
    {"company_name": "BT Karadeniz Şirketler Grubu", "city": "Samsun", "district": "Atakum", "sector": "İnşaat", "phone": "0362 433 40 00", "website": "www.btkaradeniz.com.tr", "segment": "A", "potential_level": "very_high", "potential_score": 85, "sales_notes": "Büyük inşaat taahhüt. Çok sayıda şantiye, araç ihtiyacı yüksek."},
    {"company_name": "Demta Yapı", "city": "Samsun", "district": "İlkadım", "sector": "İnşaat", "phone": "0362 230 12 00", "website": "www.demtayapi.com", "segment": "B", "potential_level": "high", "potential_score": 68, "sales_notes": "Konut imalatı ve taahhüt. Şantiye araçları kullanıyor."},
    {"company_name": "Ice Frigo Lojistik", "city": "Samsun", "district": "İlkadım", "sector": "Soğuk Zincir Lojistik", "phone": "0362 502 30 00", "website": "www.icefrigolojistik.com.tr", "segment": "A", "potential_level": "very_high", "potential_score": 92, "sales_notes": "Frigofirik taşımacılık, parsiyel dağıtım. Daily filo potansiyeli çok yüksek."},
    {"company_name": "Usta Hafriyat", "city": "Samsun", "district": "Kavak", "sector": "Hafriyat", "phone": "0362 746 30 00", "website": "www.ustahafriyat.com.tr", "segment": "B", "potential_level": "high", "potential_score": 65, "sales_notes": "Temel kazı, dolgu, yol açma, kum-mıcır taşıma."},
    {"company_name": "Samfish Soğuk Hava Deposu", "city": "Samsun", "district": "19 Mayıs", "sector": "Su Ürünleri Lojistik", "phone": "0362 257 40 00", "website": "www.samfish.com.tr", "segment": "B", "potential_level": "high", "potential_score": 70, "sales_notes": "ISO 22000 sertifikalı. Soğuk zincir dağıtım, Daily/Eurocargo ihtiyacı."},
    {"company_name": "Ulusoy Karadeniz Taşımacılık", "city": "Samsun", "district": "İlkadım", "sector": "Lojistik", "phone": "0362 445 80 00", "website": "www.ulusoykaradeniz.com", "segment": "A", "potential_level": "very_high", "potential_score": 90, "sales_notes": "Bölgesel lojistik devi. Tır ve kamyon filosu geniş."},
    # Çorum
    {"company_name": "Berra Beton", "city": "Çorum", "district": "Merkez", "sector": "Hazır Beton", "phone": "0364 777 00 19", "website": "www.berrabeton.com", "segment": "B", "potential_level": "high", "potential_score": 74, "sales_notes": "Hazır beton üretim ve dağıtım. Transmikser filosu var."},
    {"company_name": "Çınar Nakliyat", "city": "Çorum", "district": "Merkez", "sector": "Lojistik", "phone": "0364 224 50 00", "website": "www.cinarnak.com", "segment": "B", "potential_level": "high", "potential_score": 71, "sales_notes": "Karayolu ve uluslararası lojistik. Filo genişletme planı var."},
    {"company_name": "Arinna Uluslararası Taşımacılık", "city": "Çorum", "district": "Merkez", "sector": "Uluslararası Taşımacılık", "phone": "0364 225 30 00", "website": "www.arinnatrans.com", "segment": "A", "potential_level": "very_high", "potential_score": 82, "sales_notes": "Uluslararası taşımacılık, S-Way potansiyeli."},
    {"company_name": "Karabeyoğlu Hazır Beton", "city": "Çorum", "district": "Merkez", "sector": "Hazır Beton", "phone": "0364 235 00 19", "website": "", "segment": "C", "potential_level": "medium", "potential_score": 55, "sales_notes": "Beton dağıtım filosu mevcut."},
    {"company_name": "Abdurrahman Çorum İnşaat", "city": "Çorum", "district": "Merkez", "sector": "İnşaat", "phone": "0364 213 10 00", "website": "www.abdurrahmancoruminsaat.com.tr", "segment": "A", "potential_level": "high", "potential_score": 78, "sales_notes": "Gölet, baraj, sulama projeleri. Ağır tonaj araç ihtiyacı."},
    # Amasya
    {"company_name": "Özen Beton Şirketler Grubu", "city": "Amasya", "district": "Merkez", "sector": "Hazır Beton / Hafriyat", "phone": "0358 218 45 05", "website": "www.ozenbeton.com.tr", "segment": "A", "potential_level": "very_high", "potential_score": 80, "sales_notes": "Beton, hafriyat ve taahhüt. Geniş araç filosu."},
    {"company_name": "Vefa Demir Çimento ve Nakliyat", "city": "Amasya", "district": "Merkez", "sector": "İnşaat Malzemeleri", "phone": "0358 218 99 38", "website": "www.vefademircimento.com.tr", "segment": "B", "potential_level": "high", "potential_score": 67, "sales_notes": "Demir, çimento nakliyesi. Kamyon filosu var."},
    {"company_name": "Bahadıroğulları Nakliyat", "city": "Amasya", "district": "Merkez", "sector": "Nakliye", "phone": "0358 212 60 00", "website": "www.bahadirogullari.com", "segment": "B", "potential_level": "high", "potential_score": 63, "sales_notes": "Bölgesel nakliye ambarı. Düzenli sefer hattı."},
    # Tokat
    {"company_name": "Tokat Kardeşler İnşaat", "city": "Tokat", "district": "Merkez", "sector": "İnşaat", "phone": "0532 551 40 13", "website": "www.tokatkardeslerinsaat.com", "segment": "B", "potential_level": "high", "potential_score": 66, "sales_notes": "İnşaat taahhüt, müteahhitlik. Şantiye araçları."},
    {"company_name": "Eren Hafriyat Yapı", "city": "Tokat", "district": "Merkez", "sector": "Hafriyat", "phone": "0542 495 19 75", "website": "www.erenhafriyatyapi.com.tr", "segment": "B", "potential_level": "high", "potential_score": 64, "sales_notes": "Hafriyat, iş makinesi kiralama. Kamyon ihtiyacı."},
    {"company_name": "Yanar Beton", "city": "Tokat", "district": "Merkez", "sector": "Hazır Beton", "phone": "0541 375 70 01", "website": "www.yanarbeton.com.tr", "segment": "B", "potential_level": "medium", "potential_score": 58, "sales_notes": "Hazır beton üretim ve transmikser dağıtım."},
    {"company_name": "Turhal Nakliyat", "city": "Tokat", "district": "Turhal", "sector": "Nakliye", "phone": "0356 275 20 00", "website": "", "segment": "C", "potential_level": "medium", "potential_score": 50, "sales_notes": "Bölgesel nakliye, şeker pancarı taşıma."},
    # Ordu
    {"company_name": "Ordu Lojistik", "city": "Ordu", "district": "Altınordu", "sector": "Lojistik", "phone": "0452 214 70 00", "website": "www.ordulojistik.com.tr", "segment": "B", "potential_level": "high", "potential_score": 69, "sales_notes": "Bölgesel lojistik, fındık ve tarım ürünü taşıma."},
    {"company_name": "Uzunoğlu Nakliyat", "city": "Ordu", "district": "Altınordu", "sector": "Nakliye", "phone": "0452 223 30 00", "website": "www.orduuzunoglunakliyat.com", "segment": "C", "potential_level": "medium", "potential_score": 52, "sales_notes": "Şehirlerarası nakliye hizmeti."},
    # Sinop
    {"company_name": "Sinop Nakliyat", "city": "Sinop", "district": "Merkez", "sector": "Nakliye", "phone": "0368 261 40 00", "website": "www.sinopnakliyatt.com.tr", "segment": "C", "potential_level": "medium", "potential_score": 48, "sales_notes": "Bölgesel nakliye ve ambar hizmetleri."},
]

# ══════════════════════════════════════════════════════════════════
# 2) KEŞFEDİLEN FİRMALAR — Discovery'den gelen potansiyel müşteriler
# ══════════════════════════════════════════════════════════════════
DISCOVERED = [
    # Samsun
    {"company_name": "Çavuşoğlu İnşaat", "city": "Samsun", "district": "İlkadım", "sector": "İnşaat", "phone": "0362 431 20 00", "website": "www.cavusunogluinsaat.com.tr", "activity": "Müteahhitlik, konut inşaatı, yapı süreç yönetimi", "score": 72},
    {"company_name": "Özdelen İnşaat", "city": "Samsun", "district": "İlkadım", "sector": "İnşaat", "phone": "0362 230 45 00", "website": "www.ozdeleninsaat.com", "activity": "Anahtar teslim, tadilat, kat karşılığı inşaat", "score": 65},
    {"company_name": "Kızılkaya Hafriyat İnşaat", "city": "Samsun", "district": "Atakum", "sector": "Hafriyat", "phone": "0362 248 30 00", "website": "", "activity": "Hafriyat, kazı, dolgu işleri", "score": 60},
    {"company_name": "Havza Ay Hafriyat", "city": "Samsun", "district": "Havza", "sector": "Hafriyat", "phone": "0362 714 25 00", "website": "www.ayhafriyat.com", "activity": "Temel kazısı, bina yıkımı, inşaat atık taşıma", "score": 55},
    {"company_name": "Özgüray Nakliyat", "city": "Samsun", "district": "İlkadım", "sector": "Nakliye", "phone": "0362 432 10 00", "website": "www.ozguraynakliyat.com.tr", "activity": "K belgeli şehirlerarası taşımacılık", "score": 58},
    {"company_name": "Kılıçlar Nakliyat", "city": "Samsun", "district": "İlkadım", "sector": "Nakliye", "phone": "0362 431 80 00", "website": "www.kiliclarnakliyat.com", "activity": "Parsiyel taşımacılık, şehirlerarası nakliye", "score": 56},
    {"company_name": "Tamgüç Panel ve Soğutma", "city": "Samsun", "district": "İlkadım", "sector": "Soğutma Sistemleri", "phone": "0362 266 90 00", "website": "www.tamgucsogutma.com.tr", "activity": "Soğuk hava deposu imalatı, endüstriyel soğutma", "score": 45},
    {"company_name": "Devranlı Lojistik", "city": "Samsun", "district": "Terme", "sector": "Lojistik", "phone": "0362 876 50 00", "website": "", "activity": "Soğuk zincir taşıma, frigofirik nakliye", "score": 68},
    {"company_name": "Tarım Kredi Lojistik Samsun", "city": "Samsun", "district": "İlkadım", "sector": "Tarım Lojistik", "phone": "0362 431 00 55", "website": "www.tklojistik.com.tr", "activity": "Isı kontrollü taşımacılık, tarım ürünü dağıtım", "score": 75},
    {"company_name": "Erçal İnşaat", "city": "Samsun", "district": "Canik", "sector": "İnşaat", "phone": "0362 239 10 00", "website": "", "activity": "Konut ve ticari bina inşaatı", "score": 50},
    {"company_name": "E&A İnşaat Samsun", "city": "Samsun", "district": "İlkadım", "sector": "İnşaat", "phone": "0362 431 65 00", "website": "www.eainsaatsamsun.com", "activity": "İnşaat taahhüt ve müteahhitlik", "score": 52},
    {"company_name": "Mega Anadolu Lojistik", "city": "Samsun", "district": "İlkadım", "sector": "Lojistik", "phone": "0362 502 10 00", "website": "www.megaanadolu.com.tr", "activity": "Karayolu lojistik, uluslararası taşımacılık", "score": 78},
    # Çorum
    {"company_name": "Şato Lojistik", "city": "Çorum", "district": "Merkez", "sector": "Lojistik / İnşaat", "phone": "0364 225 60 00", "website": "", "activity": "Uluslararası taşımacılık ve inşaat taahhüt", "score": 70},
    {"company_name": "Çorum Önder Nakliyat", "city": "Çorum", "district": "Merkez", "sector": "Nakliye", "phone": "0364 224 40 00", "website": "", "activity": "Uluslararası nakliye ve lojistik", "score": 65},
    {"company_name": "Bilgin Yapı", "city": "Çorum", "district": "Merkez", "sector": "İnşaat", "phone": "0364 227 30 00", "website": "", "activity": "Konut ve ticari yapı inşaatı", "score": 55},
    {"company_name": "Bestaş Yol Yapı", "city": "Çorum", "district": "Merkez", "sector": "Yol İnşaat", "phone": "0364 213 50 00", "website": "", "activity": "Yol yapım, altyapı projeleri", "score": 72},
    {"company_name": "İkram Hazır Beton", "city": "Çorum", "district": "Merkez", "sector": "Hazır Beton", "phone": "0364 226 38 91", "website": "", "activity": "Hazır beton üretimi ve dağıtım", "score": 60},
    {"company_name": "Çınar Hazır Beton", "city": "Çorum", "district": "Bayat", "sector": "Hazır Beton", "phone": "0364 036 17 17", "website": "", "activity": "Hazır beton, hafriyat, kazı dolgu", "score": 58},
    {"company_name": "Öksüzoğlu İnşaat", "city": "Çorum", "district": "Merkez", "sector": "İnşaat", "phone": "0364 225 80 00", "website": "", "activity": "Müteahhitlik ve taahhüt işleri", "score": 52},
    # Amasya
    {"company_name": "Amasya Işık Hafriyat", "city": "Amasya", "district": "Merkez", "sector": "Hafriyat", "phone": "0537 963 21 99", "website": "", "activity": "Hafriyat ve inşaat hizmetleri", "score": 55},
    {"company_name": "Güven İş Hazır Beton", "city": "Amasya", "district": "Suluova", "sector": "Hazır Beton", "phone": "0358 417 85 41", "website": "", "activity": "Hazır beton üretim ve dağıtım", "score": 62},
    {"company_name": "Yeni Tokat Amasya Nakliyat Ambarı", "city": "Amasya", "district": "Merkez", "sector": "Nakliye", "phone": "0358 212 40 00", "website": "www.yenitokatamasya.com", "activity": "Komple/parsiyel yük, ambar hizmeti", "score": 60},
    # Tokat
    {"company_name": "TOK-TEM İnşaat Mühendislik", "city": "Tokat", "district": "Merkez", "sector": "İnşaat", "phone": "0356 213 40 90", "website": "", "activity": "Müteahhitlik, proje, çevre düzenleme", "score": 58},
    {"company_name": "Reşadiye Nakliye Ticaret", "city": "Tokat", "district": "Reşadiye", "sector": "Nakliye", "phone": "0356 714 15 00", "website": "", "activity": "Maden ve tarım ürünü taşıma", "score": 50},
    {"company_name": "Tokat Ambarım Nakliyat", "city": "Tokat", "district": "Merkez", "sector": "Nakliye", "phone": "0356 214 55 00", "website": "www.tokatambarim.com", "activity": "Ambar ve parsiyel taşımacılık", "score": 48},
    # Ordu
    {"company_name": "Vetrans Lojistik Ordu", "city": "Ordu", "district": "Altınordu", "sector": "Lojistik", "phone": "0452 225 60 00", "website": "www.vetranslojistik.com", "activity": "Karayolu lojistik, Karadeniz hattı", "score": 65},
    {"company_name": "Assan Lojistik Ordu", "city": "Ordu", "district": "Altınordu", "sector": "Lojistik", "phone": "0452 214 90 00", "website": "www.assanlojistik.com.tr", "activity": "Lojistik ve depolama hizmetleri", "score": 62},
    {"company_name": "Ordu Puma Nakliyat", "city": "Ordu", "district": "Altınordu", "sector": "Nakliye", "phone": "0452 223 50 00", "website": "www.ordupumanakliyat.com.tr", "activity": "Şehirlerarası nakliye, ticari taşıma", "score": 55},
    # Sinop
    {"company_name": "Boyabat Madencilik", "city": "Sinop", "district": "Boyabat", "sector": "Madencilik", "phone": "0368 315 60 00", "website": "", "activity": "Bakır çinko madencilik, cevher nakliye", "score": 68},
]

# ── Kaydet ─────────────────────────────────────────────────────────
print("=" * 60)
print("Iveco CRM — Gerçek Firma Verileri Yükleniyor")
print("=" * 60)

# Customers
added_c = 0
for c in CRM_CUSTOMERS:
    exists = db.query(Customer).filter(Customer.company_name == c["company_name"]).first()
    if exists:
        continue
    days_ago = random.randint(5, 120)
    cust = Customer(
        company_name=c["company_name"], city=c["city"], district=c["district"],
        sector=c["sector"], phone=c["phone"], website=c.get("website", ""),
        segment=c["segment"], potential_level=c["potential_level"],
        potential_score=c["potential_score"], sales_notes=c["sales_notes"],
        source="discovery", is_active=True,
        created_at=datetime.now(timezone.utc) - timedelta(days=days_ago),
    )
    db.add(cust)
    added_c += 1
db.commit()
print(f"[OK] {added_c} musteri CRM'e eklendi")

# Discovered companies
src = db.query(DiscoverySource).first()
src_id = src.id if src else None
added_d = 0
for d in DISCOVERED:
    exists = db.query(DiscoveredCompany).filter(DiscoveredCompany.company_name == d["company_name"]).first()
    if exists:
        continue
    days_ago = random.randint(1, 30)
    comp = DiscoveredCompany(
        source_id=src_id, company_name=d["company_name"],
        city=d["city"], district=d["district"], sector=d["sector"],
        phone=d["phone"], website=d.get("website", ""),
        activity_description=d["activity"],
        contact_info=d["phone"],
        status="enriched" if d["score"] >= 55 else "new",
        enrichment_score=d["score"],
        discovered_at=datetime.now(timezone.utc) - timedelta(days=days_ago),
    )
    db.add(comp)
    added_d += 1
db.commit()
print(f"[OK] {added_d} firma kesif havuzuna eklendi")
print(f"\nToplam CRM: {db.query(Customer).count()}")
print(f"Toplam Keşif: {db.query(DiscoveredCompany).count()}")
print("=" * 60)
db.close()
