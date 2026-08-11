"""
Ordu İhracatçı Firmalar PDF → IVECO CRM Import
PDF: ordu ihracatçı firmalar.pdf (2 sayfa, ~40 firma)
Format: Tablo (No | İhracatçı Adı | Adres | Web Sitesi)
"""
import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
sys.stdout.reconfigure(encoding='utf-8')

import pdfplumber
from app.core.database import SessionLocal
from app.modules.auth.models import User
from app.modules.crm.models import Customer

# ── Sektör Tespiti (firma adından) ────────────────────────────
SEKTOR_KEYWORDS = {
    "Gıda / Tarım": ["gıda", "gida", "fındık", "findik", "tarım", "tarim", "bal ", "çay ", "dondurma",
                      "bakliyat", "şeker", "nut ", "lezzet"],
    "Ulaşım / Nakliye / Akaryakıt": ["nakliye", "nakliyat", "lojistik", "taşımacılık", "nakl.", "kargo"],
    "İnşaat / Yapı Malzemesi": ["inşaat", "inşa", "yapı", "seramik", "cam ", "yalıtım", "parke"],
    "Tekstil / Giyim": ["tekstil", "dantel", "giyim", "konfeksiyon"],
    "Metal / Makine": ["makine", "makina", "metal", "otomasyon"],
    "Orman Ürünleri / Mobilya": ["orman", "ahşap", "mobilya", "kereste"],
    "Kimya / Petrokimya": ["kimya", "petrokimya"],
    "Ambalaj / Paketleme": ["ambalaj", "paketleme", "paket"],
    "Aydınlatma": ["aydınlatma", "led"],
}

def detect_sector(name):
    lower = name.lower()
    for sector, keywords in SEKTOR_KEYWORDS.items():
        if any(k in lower for k in keywords):
            return sector
    return "Ticaret (Genel)"

# ── İlçe Tespiti (adresten) ──────────────────────────────────
ORDU_ILCELER = [
    "ALTINORDU", "ÜNYE", "FATSA", "PERŞEMBE", "ULUBEY", "AKKUŞ",
    "AYBASTI", "ÇAMAŞ", "ÇATALPINAR", "ÇAYBAŞI", "GÖLKÖY",
    "GÜLYALI", "GÜRGENTEPE", "İKİZCE", "KABADÜZ", "KABATAŞ",
    "KORGAN", "KUMRU", "MESUDİYE"
]

def detect_district(address):
    if not address:
        return "Altınordu"
    upper = address.upper()
    for ilce in ORDU_ILCELER:
        if ilce in upper:
            return ilce.title()
    return "Altınordu"

# ── Skor Hesaplama ────────────────────────────────────────────
IVECO_KEYWORDS = {
    30: ["nakliye", "nakliyat", "lojistik", "taşımacılık", "transport", "kargo", "nakl."],
    25: ["otomotiv", "araç", "tır", "kamyon", "römork", "treyler"],
    20: ["inşaat", "yapı", "beton", "çimento", "hafriyat", "kazı", "inş."],
    15: ["akaryakıt", "petrol", "benzin", "mazot"],
    10: ["tarım", "orman", "kereste", "fındık", "findik", "çay", "tarim"],
    5:  ["metal", "demir", "çelik", "makine", "sanayi", "makina"],
}

def calc_score(name, address):
    score = 50  # İhracatçı = baz skor daha yüksek
    lower = name.lower()
    for bonus, keywords in IVECO_KEYWORDS.items():
        if any(k in lower for k in keywords):
            score += bonus
            break
    # İhracatçı olması +10 bonus
    score += 10
    return min(score, 100)


def parse_pdf(pdf_path):
    """Tablo formatındaki PDF'den firma listesini çıkar."""
    pdf = pdfplumber.open(pdf_path)
    firms = []

    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                if not row or len(row) < 3:
                    continue
                no_val = (row[0] or "").strip()
                # Başlık satırını atla
                if no_val.lower() in ("no", ""):
                    continue
                # Sıra numarası olmalı
                if not no_val.isdigit():
                    continue

                name = (row[1] or "").strip().replace("\n", " ")
                address = (row[2] or "").strip().replace("\n", " ")
                website = (row[3] or "").strip() if len(row) > 3 else ""

                if name and len(name) > 2:
                    firms.append({
                        "name": name,
                        "address": address,
                        "website": website,
                    })

    pdf.close()
    return firms


def main():
    pdf_path = r"C:\Users\Murat\Downloads\ordu ihracatçı firmalar.pdf"

    print("=" * 60)
    print("  ORDU İHRACATÇI FİRMALAR → IVECO CRM IMPORT")
    print("=" * 60)
    print()

    # 1. PDF'yi parse et
    print("[1/4] PDF okunuyor...")
    firms = parse_pdf(pdf_path)
    print(f"  -> {len(firms)} firma bulundu")

    # 2. Detayları göster
    print(f"\n[2/4] Firma Listesi:")
    for i, f in enumerate(firms):
        sector = detect_sector(f["name"])
        district = detect_district(f["address"])
        score = calc_score(f["name"], f["address"])
        web = f["website"][:40] if f["website"] else "-"
        print(f"  {i+1:3d}. {f['name'][:55]:55s} | {district:12s} | {sector[:20]:20s} | {score:3d} | {web}")

    # 3. CRM'e ekle
    print(f"\n[3/4] CRM'e ekleniyor...")
    db = SessionLocal()

    added = 0
    skipped = 0

    for f in firms:
        name = f["name"]
        address = f["address"]
        website = f["website"]
        sector = detect_sector(name)
        district = detect_district(address)
        score = calc_score(name, address)

        if score >= 80:
            segment, potential = "A", "very_high"
        elif score >= 65:
            segment, potential = "B", "high"
        elif score >= 50:
            segment, potential = "C", "medium"
        else:
            segment, potential = "D", "low"

        # Duplikasyon kontrolü
        existing = db.query(Customer).filter(
            Customer.company_name == name
        ).first()

        if existing:
            skipped += 1
            continue

        customer = Customer(
            company_name=name,
            city="Ordu",
            district=district,
            address=address if address else None,
            website=website if website else None,
            sector=sector,
            segment=segment,
            potential_level=potential,
            potential_score=score,
            source="ordu_ihracatci",
            sales_notes=f"Ordu TSO ihracatçı firma listesi",
            is_active=True,
        )
        db.add(customer)
        added += 1

    db.commit()

    # 4. Özet
    ordu_count = db.query(Customer).filter(Customer.city == "Ordu").count()
    total_count = db.query(Customer).count()
    db.close()

    print(f"\n[4/4] TAMAMLANDI!")
    print(f"  -> Yeni eklenen: {added}")
    print(f"  -> Atlanan (zaten mevcut): {skipped}")
    print(f"  -> Ordu toplam: {ordu_count}")
    print(f"  -> CRM toplam: {total_count}")
    print()


if __name__ == "__main__":
    main()
