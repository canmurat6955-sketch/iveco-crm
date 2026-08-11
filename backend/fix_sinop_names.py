"""
Sinop TSO PDF'ini doğru parse edip firma isimlerini düzeltir.
PDF Format: Her firma çok satırlı, ilk satırda "XX. MESLEK GRUBU" var,
sonraki satırlar firma isminin devamı (bir sonraki "MESLEK GRUBU"na kadar).

Örnek:
  SİMPAŞ SİGORTA ARACILIK HİZMETLERİ    01. MESLEK GRUBU
  LİMİTED ŞİRKETİ SİNOP ŞUBESİ

Doğru isim: "SİMPAŞ SİGORTA ARACILIK HİZMETLERİ LİMİTED ŞİRKETİ SİNOP ŞUBESİ"
"""
import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
sys.stdout.reconfigure(encoding='utf-8')

import pdfplumber
from collections import Counter
from app.core.database import SessionLocal
from app.modules.auth.models import User
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
    upper = name.upper()
    for ilce in SINOP_ILCELER:
        if ilce in upper:
            if ilce == "MERKEZ":
                return "Merkez"
            return ilce.title()
    return "Merkez"

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
    score = 40
    lower = name.lower()
    for bonus, keywords in IVECO_KEYWORDS.items():
        if any(k in lower for k in keywords):
            score += bonus
            break
    if meslek_grubu == "09":
        score += 20
    elif meslek_grubu == "04":
        score += 10
    elif meslek_grubu == "08":
        score += 5
    elif meslek_grubu == "11":
        score += 5
    return min(score, 100)


def parse_pdf_correctly(pdf_path):
    """
    PDF'yi doğru parse et.
    Format: Her satırda firma adının bir kısmı + "XX. MESLEK GRUBU" etiketi var.
    İsim çok satıra yayılabilir. "MESLEK GRUBU" olan satır ismin İLK satırı,
    sonraki satırlar (bir sonraki MESLEK GRUBU'na kadar) ismin devamı.
    """
    pdf = pdfplumber.open(pdf_path)
    firms = []
    
    # Tüm sayfaları tek bir satır listesinde topla
    all_lines = []
    for page in pdf.pages:
        text = page.extract_text()
        if not text:
            continue
        for line in text.strip().split('\n'):
            line = line.strip()
            if line and line != "UNVAN MESLEK GRUBU":
                all_lines.append(line)
    pdf.close()
    
    # Şimdi satırları işle
    # Her firma: MESLEK GRUBU içeren satır = ilk satır, sonraki satırlar = devamı
    i = 0
    while i < len(all_lines):
        line = all_lines[i]
        match = re.search(r'(\d{2})\.\s*MESLEK\s*GRUBU', line)
        
        if match:
            meslek_grubu = match.group(1)
            # İlk satırdaki isim kısmı (MESLEK GRUBU öncesi)
            name_part = line[:match.start()].strip()
            
            # Devam satırlarını topla (bir sonraki MESLEK GRUBU'na kadar)
            continuation_parts = []
            j = i + 1
            while j < len(all_lines):
                next_line = all_lines[j]
                next_match = re.search(r'(\d{2})\.\s*MESLEK\s*GRUBU', next_line)
                if next_match:
                    break  # Yeni firma başladı
                continuation_parts.append(next_line)
                j += 1
            
            # Tam firma adını birleştir
            full_name = name_part
            if continuation_parts:
                full_name = full_name + " " + " ".join(continuation_parts)
            full_name = full_name.strip()
            
            if full_name and len(full_name) > 2:
                firms.append({
                    "name": full_name,
                    "meslek_grubu": meslek_grubu,
                })
            
            i = j  # Bir sonraki MESLEK GRUBU satırına atla
        else:
            i += 1  # Bu satır başıboş, atla (normalde olmamalı)
    
    return firms


def main():
    pdf_path = r"C:\Users\Murat\Downloads\sinop ticaret odası.pdf"
    
    print("=" * 60)
    print("  SİNOP TSO DÜZELTME - DOĞRU İSİM PARSE")
    print("=" * 60)
    print()
    
    # 1. PDF'yi doğru parse et
    print("[1/5] PDF yeniden okunuyor (doğru sırada)...")
    firms = parse_pdf_correctly(pdf_path)
    print(f"  -> {len(firms)} firma bulundu")
    
    # Duplikasyonları temizle
    seen = set()
    unique_firms = []
    for f in firms:
        key = f["name"].upper().strip()
        if key not in seen and len(key) > 3:
            seen.add(key)
            unique_firms.append(f)
    
    print(f"  -> {len(unique_firms)} benzersiz firma")
    
    # 2. Örnekleri göster
    print("\n[2/5] İlk 20 firma (doğru isim):")
    for i, f in enumerate(unique_firms[:20]):
        sector = MESLEK_GRUBU_SEKTOR.get(f["meslek_grubu"], "Diger")
        print(f"  {i+1:3d}. [{f['meslek_grubu']}] {f['name'][:70]}")
    
    # 3. Meslek grubu dağılımı
    print("\n[3/5] Meslek Grubu Dagilimi:")
    gc = Counter(f["meslek_grubu"] for f in unique_firms)
    for g, c in sorted(gc.items()):
        sector = MESLEK_GRUBU_SEKTOR.get(g, "Diger")
        print(f"  {g}. {sector}: {c} firma")
    
    # 4. Eski Sinop kayıtlarını sil ve yeniden ekle
    print("\n[4/5] Eski Sinop TSO kayitlari siliniyor ve yenisi ekleniyor...")
    db = SessionLocal()
    
    # Eski kayıtları sil
    deleted = db.query(Customer).filter(Customer.source == "sinop_tso").delete()
    print(f"  -> {deleted} eski kayit silindi")
    
    added = 0
    for f in unique_firms:
        name = f["name"]
        meslek_grubu = f["meslek_grubu"]
        sector = MESLEK_GRUBU_SEKTOR.get(meslek_grubu, "Diger")
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
    
    # 5. Özet
    sinop_count = db.query(Customer).filter(Customer.city == "Sinop").count()
    total_count = db.query(Customer).count()
    db.close()
    
    print(f"\n[5/5] TAMAMLANDI!")
    print(f"  -> Yeni eklenen: {added}")
    print(f"  -> Sinop toplam: {sinop_count}")
    print(f"  -> CRM toplam: {total_count}")
    print()


if __name__ == "__main__":
    main()
