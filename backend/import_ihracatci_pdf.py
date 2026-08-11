"""
Samsun TSO İhracatçı Firma Raporu PDF'inden firma verisi çıkarma ve CRM'e ekleme.
PDF: ihracatçı firmalar.pdf (260 firma, 14 sayfa)
Sütunlar: # | Unvan | Faaliyet Detayı | Adres | Telefon | Faks
"""
import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))

import pdfplumber
from app.core.database import SessionLocal, create_all_tables
from app.modules.crm.models import Customer
from app.modules.auth.models import User  # SQLAlchemy relationship resolution

# ── 1) PDF'den tüm metni çıkar ──────────────────────────────────
PDF_PATH = r"C:\Users\Murat\Downloads\ihracatçı firmalar.pdf"
print(f"[1/4] PDF okunuyor: {PDF_PATH}")

pdf = pdfplumber.open(PDF_PATH)
all_text = ""
for page in pdf.pages:
    text = page.extract_text()
    if text:
        all_text += text + "\n---PAGE---\n"
pdf.close()
print(f"  -> {len(pdf.pages)} sayfa okundu, {len(all_text)} karakter")

# ── 2) İlçe listesi ─────────────────────────────────────────────
ILCE_MAP = {
    "TEKKEKÖY": "Tekkeköy",
    "İLKADIM": "İlkadım",
    "ATAKUM": "Atakum",
    "CANİK": "Canik",
    "BAFRA": "Bafra",
    "ÇARŞAMBA": "Çarşamba",
    "KAVAK": "Kavak",
    "TERME": "Terme",
    "VEZİRKÖPRÜ": "Vezirköprü",
    "HAVZA": "Havza",
    "ALAÇAM": "Alaçam",
    "ASARCIK": "Asarcık",
    "LADİK": "Ladik",
    "YAKAKENT": "Yakakent",
    "SALIPAZARI": "Salıpazarı",
    "19 MAYIS": "19 Mayıs",
}

def extract_district(text):
    """Adres metninden ilçe çıkar."""
    text_upper = text.upper()
    for key, val in ILCE_MAP.items():
        # "TEKKEKÖY / SAMSUN" veya "TEKKEKÖY/SAMSUN" pattern
        if key in text_upper:
            return val
    return ""

def extract_phone(text):
    """Metinden telefon numarası çıkar."""
    # 0362... pattern
    phones = re.findall(r'(0\d{3}\d{7})', text)
    if phones:
        phone = phones[0]
        return f"{phone[:4]} {phone[4:7]} {phone[7:]}"
    return ""

# ── 3) NACE kodu → Sektör haritası ──────────────────────────────
def classify_sector(nace_code, faaliyet_raw=""):
    """NACE kodu ve faaliyet bilgisinden sektör belirle."""
    if not nace_code:
        return faaliyet_raw[:100] if faaliyet_raw else "İhracat"
    
    nace_2 = nace_code[:2] if len(nace_code) >= 2 else ""
    
    sector_map = {
        "10": "Gıda",
        "11": "İçecek",
        "01": "Tarım / Hayvancılık",
        "03": "Su Ürünleri",
        "46": "Toptan Ticaret",
        "47": "Perakende Ticaret",
        "56": "Yemek / Catering",
        "50": "Taşımacılık",
        "52": "Depolama / Lojistik",
        "24": "Metal / Demir-Çelik",
        "25": "Metal İşleme",
        "28": "Makine İmalat",
        "29": "Otomotiv / Araç",
        "27": "Elektrik / Elektronik",
        "22": "Plastik / Kauçuk",
        "20": "Kimya",
        "21": "İlaç",
        "19": "Petrol / Madeni Yağ",
        "23": "İnşaat Malzemesi",
        "41": "İnşaat",
        "42": "Altyapı İnşaat",
        "43": "Tesisat / Montaj",
        "31": "Mobilya",
        "32": "Diğer İmalat",
        "33": "Tamir / Bakım",
        "16": "Ağaç / Kereste",
        "13": "Tekstil",
        "14": "Giyim",
        "15": "Deri / Ayakkabı",
        "08": "Madencilik",
        "05": "Kömür Madenciliği",
        "35": "Enerji",
        "38": "Atık Yönetimi",
        "49": "Nakliye / Lojistik",
        "71": "Mühendislik",
        "62": "Bilişim / Yazılım",
        "78": "İş Gücü",
        "81": "Bina Hizmetleri",
        "93": "Spor / Eğlence",
        "55": "Konaklama",
        "30": "Ulaşım Araçları",
        "45": "Otomotiv Ticaret",
        "17": "Kağıt / Ambalaj",
        "26": "Elektronik",
        "12": "Tütün",
        "36": "Su Temini",
        "37": "Kanalizasyon",
        "39": "Çevre",
    }
    
    return sector_map.get(nace_2, faaliyet_raw[:80] if faaliyet_raw else "İhracat")

# ── 4) PDF satırlarını işle ──────────────────────────────────────
print("[2/4] İhracatçı firmalar ayrıştırılıyor...")
lines = all_text.split("\n")
companies = []

# Her firma çok satırlı olabilir. Pattern:
# İlk satır: FIRMA_ADI  NACE_KODU - Faaliyet açıklaması  ADRES  TELEFON
# İkinci satır: NUMARA  (firma adı devamı)  (adres devamı)  (faks?)
# Devam satırları: faaliyet açıklaması devamı, adres devamı vb.

# Tüm metni tek parça olarak işlemek yerine, firma blokları oluşturalım
# Her firma # numarası ile başlar

# Önce tüm satırları temizle ve birleştir
clean_lines = []
for line in lines:
    stripped = line.strip()
    if stripped and stripped != "---PAGE---":
        # Sayfa başlığı ve sütun başlığını atla
        if stripped.startswith("Sayfa:") or stripped.startswith("# Unvan"):
            continue
        if stripped.startswith("Samsun Ticaret ve Sanayi"):
            continue
        if stripped.startswith("İhracatçı Firma Raporu"):
            continue
        clean_lines.append(stripped)

# Tüm temiz metni birleştir
full_text = "\n".join(clean_lines)

# NACE kodu pattern: XX.XX.XX
nace_pattern = re.compile(r'(\d{2}\.\d{2}\.\d{2})')

# Firma bloklarını bul
# Her firma, satır başında ya da satır ortasında bir numara ile tanımlanır
# Numara satırın başında değil, genellikle 2. satırda

# Daha iyi yaklaşım: tüm metinde NACE kodlarını bul ve etrafındaki bilgiyi çıkar
# Ama önce firma numaralarını kullanarak blokları ayıralım

# Strateji: Tüm clean_lines'ı tara
# Bir satırda NACE kodu varsa, o satır ve etrafı bir firma bloğu

i = 0
while i < len(clean_lines):
    line = clean_lines[i]
    
    # NACE kodu içeren satırı bul (firma başlangıcı)
    nace_match = nace_pattern.search(line)
    if nace_match:
        nace_code = nace_match.group(1)
        before_nace = line[:nace_match.start()].strip()
        after_nace = line[nace_match.end():].strip()
        
        # Faaliyet açıklaması " - " ile başlar
        faaliyet = ""
        adres_part = after_nace
        if after_nace.startswith(" - ") or after_nace.startswith("- "):
            # Faaliyet ve adres aynı satırda
            faaliyet = after_nace.lstrip(" -").strip()
            adres_part = ""
        
        # before_nace firma adını içerir
        firma_name = before_nace
        
        # Bir sonraki satırda numara var mı? (çok satırlı firma adı)
        firma_number = None
        extra_lines = []
        j = i + 1
        
        while j < len(clean_lines):
            next_line = clean_lines[j].strip()
            
            # Boş satır veya yeni firma (NACE kodu içeriyor)
            if nace_pattern.search(next_line):
                break
            
            # Numara ile başlayan satır (firma numarası + devam bilgileri)
            num_match = re.match(r'^(\d{1,3})\s+(.+)', next_line)
            if num_match and int(num_match.group(1)) <= 265:
                if firma_number is None:
                    firma_number = int(num_match.group(1))
                    rest = num_match.group(2).strip()
                    extra_lines.append(rest)
                else:
                    extra_lines.append(next_line)
            else:
                extra_lines.append(next_line)
            
            j += 1
        
        # Tüm extra satırları birleştir
        full_block = firma_name
        if extra_lines:
            full_block += " " + " ".join(extra_lines)
        
        # Firma adını, adresi, telefonu ayır
        # Firma adı genellikle "ŞİRKETİ", "LTD", "A.Ş." ile biter
        # Adres genellikle "MAH." veya "MAHALLESİ" ile başlar
        # Telefon 0362... pattern
        
        # Telefon çıkar
        phone = extract_phone(full_block)
        
        # İlçe çıkar
        district = extract_district(full_block)
        
        # Adres çıkar - MAH/MAHALLESİ pattern'inden telefon numarasına kadar
        address = ""
        mah_match = re.search(r'((?:\w+\s+)?(?:MAH\.|MAHALLESİ|OSB\s+MAH)[\s\S]*?(?:SAMSUN|$))', full_block, re.IGNORECASE)
        if mah_match:
            addr_raw = mah_match.group(1).strip()
            # Telefon numarasını adres'ten çıkar
            addr_raw = re.sub(r'0\d{3}\d{7}', '', addr_raw).strip()
            address = addr_raw
        
        # Firma adını temizle
        # Firma adı: NACE kodundan önceki kısım + numara satırındaki ek kısım
        # Genellikle "ŞİRKETİ" veya "ŞUBESİ" ile biter
        name_parts = [firma_name]
        for extra in extra_lines:
            # Adres kısmına ulaştığımızda dur
            if re.search(r'(?:MAH\.|MAHALLESİ|OSB|CADDE|CAD\.|BULVAR|BUL\.)', extra, re.IGNORECASE):
                break
            # Telefon numarasına ulaştığımızda dur
            if re.search(r'0\d{3}\d{7}', extra):
                break
            # Faaliyet devamı ise (küçük harfle başlıyorsa) atla
            if extra and extra[0].islower():
                break
            name_parts.append(extra)
        
        company_name = " ".join(name_parts).strip()
        # Firma adından numara, NACE ve gereksiz kısımları temizle
        company_name = re.sub(r'\s+\d{2}\.\d{2}\.\d{2}.*', '', company_name).strip()
        company_name = re.sub(r'\s+0\d{3}\d{7}.*', '', company_name).strip()
        # Adres kısımlarını temizle
        company_name = re.sub(r'\s+(?:\w+\s+)?(?:MAH\.|MAHALLESİ).*', '', company_name, flags=re.IGNORECASE).strip()
        
        if firma_number and company_name:
            companies.append({
                "sn": firma_number,
                "company_name": company_name,
                "nace_code": nace_code,
                "faaliyet": faaliyet[:200],
                "address": address[:300],
                "district": district,
                "city": "Samsun",
                "phone": phone,
            })
        
        i = j
        continue
    
    i += 1

# ── 5) Temizle ve deduplike et ───────────────────────────────────
print(f"  -> {len(companies)} firma ayrıştırıldı")

# SN'ye göre sırala ve duplikatları kaldır
seen_sn = set()
unique = []
for c in companies:
    if c["sn"] not in seen_sn:
        seen_sn.add(c["sn"])
        unique.append(c)
companies = sorted(unique, key=lambda x: x["sn"])

print(f"  -> {len(companies)} benzersiz firma (SN bazında)")

# Önizleme
print("\n  Ilk 5 firma:")
for c in companies[:5]:
    print(f"    [{c['sn']}] {c['company_name'][:65]} | {c['district']} | {c['nace_code']} | {c['phone']}")
print(f"  ...")
print(f"  Son 5 firma:")
for c in companies[-5:]:
    print(f"    [{c['sn']}] {c['company_name'][:65]} | {c['district']} | {c['nace_code']} | {c['phone']}")

# ── 6) CRM veritabanına ekle ─────────────────────────────────────
print("\n[3/4] Veritabanina ekleniyor...")
create_all_tables()
db = SessionLocal()

added = 0
skipped = 0
updated = 0

try:
    for c in companies:
        # Aynı firma adı + şehir var mı kontrol et
        existing = db.query(Customer).filter(
            Customer.company_name == c["company_name"],
            Customer.city == c["city"]
        ).first()
        
        if existing:
            # Firma zaten var ama ihracatçı bilgisi ekle
            if existing.source != "import_ihracat":
                # sales_notes'a ihracatçı bilgisi ekle
                ihracat_note = f"IHRACATCI FIRMA | NACE: {c['nace_code']} | {c['faaliyet']}"
                if existing.sales_notes:
                    if "IHRACATCI" not in existing.sales_notes:
                        existing.sales_notes += f" | {ihracat_note}"
                else:
                    existing.sales_notes = ihracat_note
                
                # Telefon yoksa ekle
                if not existing.phone and c["phone"]:
                    existing.phone = c["phone"]
                
                # Potansiyel skoru artır (ihracatçı = yüksek potansiyel)
                existing.potential_score = min(existing.potential_score + 20, 100)
                if existing.potential_score >= 80:
                    existing.segment = "A"
                    existing.potential_level = "very_high"
                elif existing.potential_score >= 65:
                    existing.segment = "B"
                    existing.potential_level = "high"
                
                updated += 1
            else:
                skipped += 1
            continue
        
        sector = classify_sector(c["nace_code"], c.get("faaliyet", ""))
        
        # Potansiyel skor hesapla - İhracatçılar baz olarak yüksek
        score = 65  # İhracatçı baz skoru (normal firmalardan yüksek)
        name_lower = c["company_name"].lower()
        
        # Nakliye/lojistik/taşımacılık firmalarına yüksek skor
        if any(k in name_lower for k in ["nakliye", "nakliyat", "lojistik", "taşımacılık", "transport", "kargo"]):
            score += 20
        # İnşaat firmaları
        if any(k in name_lower for k in ["inşaat", "yapı", "beton", "çimento"]):
            score += 10
        # Otomotiv ilişkili
        if any(k in name_lower for k in ["otomotiv", "araç", "römork", "treyler", "tır", "kamyon", "motor"]):
            score += 25
        # Makine/metal firmaları
        if any(k in name_lower for k in ["makine", "makina", "metal", "çelik", "döküm"]):
            score += 10
        # Büyük anonim şirketler
        if "anonim şirketi" in name_lower:
            score += 5
        
        score = min(score, 100)
        
        # Segment belirleme
        if score >= 80:
            segment = "A"
            potential = "very_high"
        elif score >= 65:
            segment = "B"
            potential = "high"
        elif score >= 50:
            segment = "C"
            potential = "medium"
        else:
            segment = "D"
            potential = "low"
        
        customer = Customer(
            company_name=c["company_name"],
            city=c["city"],
            district=c["district"],
            address=c["address"],
            phone=c["phone"],
            sector=sector,
            segment=segment,
            potential_level=potential,
            potential_score=score,
            source="import_ihracat",
            sales_notes=f"IHRACATCI FIRMA | Samsun TSO Ihracatci Listesi | NACE: {c['nace_code']} | {c['faaliyet']}",
            is_active=True,
        )
        db.add(customer)
        added += 1
        
        # Her 50 firmada bir commit
        if added % 50 == 0:
            db.commit()
            print(f"  -> {added} firma eklendi...")
    
    db.commit()
    
except Exception as e:
    db.rollback()
    print(f"  HATA: {e}")
    import traceback
    traceback.print_exc()
    raise
finally:
    db.close()

print(f"\n[4/4] Tamamlandi!")
print(f"  + {added} yeni ihracatci firma eklendi")
print(f"  ~ {updated} mevcut firma ihracatci olarak guncellendi")
print(f"  o {skipped} firma zaten mevcuttu (atlandi)")
print(f"  Toplam: {added + updated + skipped} / {len(companies)}")
