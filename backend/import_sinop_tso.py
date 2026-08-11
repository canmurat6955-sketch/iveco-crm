"""
Sinop Ticaret Odası PDF'inden firma verisi çıkarma ve CRM'e ekleme.
PDF: sinop ticaret odası.pdf (72 sayfa, ~1555 kayıt)
Format: UNVAN | MESLEK GRUBU (satır satır, firma adları birden fazla satıra yayılıyor)
"""
import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
sys.stdout.reconfigure(encoding='utf-8')

import pdfplumber
from collections import Counter
from app.modules.auth.models import User
from app.core.database import SessionLocal
from app.modules.crm.models import Customer

# ── Meslek Grubu → Sektör Haritası ─────────────────────────────
MESLEK_GRUBU_SEKTOR = {
    "01": "Finans / Sigorta",
    "02": "Gıda / Tarım",
    "03": "Tekstil / Giyim",
    "04": "İnşaat / Yapı Malzemesi",
    "05": "Ticaret (Genel)",
    "06": "Hizmet / Turizm",
    "07": "Sağlık / Eczane",
    "08": "Metal / Makine",
    "09": "Ulaşım / Nakliye / Akaryakıt",
    "10": "Orman Ürünleri / Mobilya",
    "11": "Madencilik / Enerji",
    "12": "Denizcilik / Balıkçılık",
}

# ── İlçe Tespiti ──────────────────────────────────────────────
SINOP_ILCELER = [
    "MERKEZ", "AYANCIK", "BOYABAT", "DİKMEN", "DURAĞAN",
    "ERFELEK", "GERZE", "SARAYDÜZÜ", "TÜRKELİ"
]

def detect_district(name):
    """Firma adından ilçe tespit et."""
    upper = name.upper()
    for ilce in SINOP_ILCELER:
        if ilce in upper:
            if ilce == "MERKEZ":
                return "Merkez"
            return ilce.title()
    return "Merkez"  # Varsayılan

# ── Skor Hesaplama ────────────────────────────────────────────
IVECO_KEYWORDS = {
    30: ["nakliye", "nakliyat", "lojistik", "taşımacılık", "transport", "kargo"],
    25: ["otomotiv", "araç", "tır", "kamyon", "römork", "treyler"],
    20: ["inşaat", "yapı", "beton", "çimento", "hafriyat", "kazı"],
    15: ["akaryakıt", "petrol", "benzin", "mazot", "opet", "bp", "shell"],
    10: ["tarım", "orman", "kereste", "odun", "tomruk", "balıkçılık"],
    5:  ["metal", "demir", "çelik", "makine", "sanayi"],
}

def calc_score(name, meslek_grubu):
    """Firma adı ve meslek grubundan potansiyel skor hesapla."""
    score = 40  # Baz skor
    lower = name.lower()
    
    for bonus, keywords in IVECO_KEYWORDS.items():
        if any(k in lower for k in keywords):
            score += bonus
            break
    
    # Meslek grubuna göre bonus
    if meslek_grubu == "09":  # Ulaşım/Nakliye
        score += 20
    elif meslek_grubu == "04":  # İnşaat
        score += 10
    elif meslek_grubu == "08":  # Metal/Makine
        score += 5
    elif meslek_grubu == "11":  # Madencilik
        score += 5
    
    return min(score, 100)


def parse_pdf(pdf_path):
    """PDF'den firma listesini çıkar."""
    pdf = pdfplumber.open(pdf_path)
    firms = []
    
    for page in pdf.pages:
        text = page.extract_text()
        if not text:
            continue
        
        lines = text.strip().split('\n')
        
        # Her satırı kontrol et
        buffer = ""
        for line in lines:
            line = line.strip()
            if not line or line == "UNVAN MESLEK GRUBU":
                continue
            
            # Meslek grubu satırda var mı?
            match = re.search(r'(\d{2})\.\s*MESLEK\s*GRUBU', line)
            if match:
                meslek_grubu = match.group(1)
                # Meslek grubu öncesi kısım firma adının devamı
                name_part = line[:match.start()].strip()
                full_name = (buffer + " " + name_part).strip() if buffer else name_part
                
                if full_name and len(full_name) > 2:
                    firms.append({
                        "name": full_name,
                        "meslek_grubu": meslek_grubu,
                    })
                buffer = ""
            else:
                # Bu satır firma adının parçası
                buffer = (buffer + " " + line).strip() if buffer else line
    
    pdf.close()
    return firms


def main():
    pdf_path = r"C:\Users\Murat\Downloads\sinop ticaret odası.pdf"
    
    print("=" * 60)
    print("  SİNOP TİCARET ODASI → IVECO CRM IMPORT")
    print("=" * 60)
    print()
    
    # 1. PDF'yi parse et
    print("[1/4] PDF okunuyor...")
    firms = parse_pdf(pdf_path)
    print(f"  → {len(firms)} firma bulundu")
    
    # 2. Duplikasyonları temizle (aynı isimli firma varsa ilkini al)
    seen = set()
    unique_firms = []
    for f in firms:
        key = f["name"].upper().strip()
        if key not in seen and len(key) > 3:
            seen.add(key)
            unique_firms.append(f)
    
    print(f"  → {len(unique_firms)} benzersiz firma (duplikat temizlendi)")
    
    # 3. Meslek grubu dağılımı
    print("\n[2/4] Meslek Grubu Dağılımı:")
    gc = Counter(f["meslek_grubu"] for f in unique_firms)
    for g, c in sorted(gc.items()):
        sector = MESLEK_GRUBU_SEKTOR.get(g, "Diğer")
        print(f"  {g}. {sector}: {c} firma")
    
    # 4. CRM'e ekle
    print("\n[3/4] CRM'e ekleniyor...")
    db = SessionLocal()
    
    added = 0
    updated = 0
    skipped = 0
    
    for f in unique_firms:
        name = f["name"]
        meslek_grubu = f["meslek_grubu"]
        sector = MESLEK_GRUBU_SEKTOR.get(meslek_grubu, "Diğer")
        district = detect_district(name)
        score = calc_score(name, meslek_grubu)
        
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
            # Zaten varsa skoru güncelle
            if existing.city != "Sinop":
                existing.city = "Sinop"
                updated += 1
            else:
                skipped += 1
            continue
        
        customer = Customer(
            company_name=name,
            city="Sinop",
            district=district,
            sector=sector,
            segment=segment,
            potential_level=potential,
            potential_score=score,
            source="sinop_tso",
            sales_notes=f"Sinop TSO {meslek_grubu}. Meslek Grubu",
            is_active=True,
        )
        db.add(customer)
        added += 1
    
    db.commit()
    db.close()
    
    # 5. Özet
    print(f"\n[4/4] TAMAMLANDI!")
    print(f"  → Yeni eklenen: {added}")
    print(f"  → Güncellenen: {updated}")
    print(f"  → Atlanan (zaten mevcut): {skipped}")
    print(f"  → Toplam CRM kayıt: {added + updated + skipped}")
    
    # Segment dağılımı
    db2 = SessionLocal()
    sinop_count = db2.query(Customer).filter(Customer.city == "Sinop").count()
    total_count = db2.query(Customer).count()
    db2.close()
    print(f"\n  Sinop toplam: {sinop_count}")
    print(f"  CRM toplam: {total_count}")
    print()


if __name__ == "__main__":
    main()
