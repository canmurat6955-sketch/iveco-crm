"""
Samsun TSO Sanayici Üye Listesi PDF'inden firma verisi çıkarma ve CRM'e ekleme.
PDF: sanaciyi üyeler.pdf (806 firma, 40 sayfa)
"""
import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))

import pdfplumber
from app.core.database import SessionLocal, create_all_tables
from app.modules.crm.models import Customer
from app.modules.auth.models import User  # SQLAlchemy relationship resolution

# ── 1) PDF'den tüm metni çıkar ──────────────────────────────────
PDF_PATH = r"C:\Users\Murat\Downloads\sanaciyi üyeler.pdf"
print(f"[1/4] PDF okunuyor: {PDF_PATH}")

pdf = pdfplumber.open(PDF_PATH)
all_text = ""
for page in pdf.pages:
    text = page.extract_text()
    if text:
        all_text += text + "\n"
pdf.close()
print(f"  → {len(pdf.pages)} sayfa okundu, {len(all_text)} karakter")

# ── 2) İlçe listesi ─────────────────────────────────────────────
ILCE_LIST = [
    "Asarcık", "Atakum", "Bafra", "Canik", "Çarşamba", "Havza",
    "19 Mayıs", "İlkadım", "Kavak", "Ladik", "Tekkeköy", "Terme",
    "Vezirköprü", "Alaçam", "Yakakent", "Salıpazarı", "Ayvacık",
    # uppercase/variant
    "TEKKEKÖY",
]
ilce_pattern = "|".join(re.escape(i) for i in sorted(ILCE_LIST, key=len, reverse=True))

# ── 3) Sektör haritası (NACE kodu → Sektör) ─────────────────────
def classify_sector(nace_code, sector_raw):
    """NACE kodu ve ham sektör bilgisinden sektör belirle."""
    if not nace_code:
        return sector_raw or "Sanayi"
    
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
        "78": "İş Gücü",
        "81": "Bina Hizmetleri",
        "93": "Spor / Eğlence",
        "55": "Konaklama",
        "30": "Ulaşım Araçları",
        "45": "Otomotiv Ticaret",
    }
    
    return sector_map.get(nace_2, sector_raw or "Sanayi")

# ── 4) PDF satırlarını işle ──────────────────────────────────────
print("[2/4] Firmalar ayrıştırılıyor...")
lines = all_text.split("\n")
companies = []
current_main_sector = ""
current_sub_sector = ""

# Çok satırlı firma isimlerini birleştirmek için buffer
buffer_name_part = None
buffer_line_idx = None

i = 0
while i < len(lines):
    line = lines[i].strip()
    
    if not line or line == "---PAGE---":
        i += 1
        continue
    
    # Başlık satırını atla
    if line.startswith("SN Firma Unvanı") or line.startswith("SAMSUN TİCARET") or line.startswith("SANAYİCİ ÜYE"):
        i += 1
        continue
    
    # Ana sektör başlığı: "1. GIDA VE İÇECEK SANAYİ"
    main_sector_match = re.match(r'^(\d+)\.\s+([A-ZÇĞİÖŞÜ\s]+)$', line)
    if main_sector_match and not re.match(r'^\d+\s+\d', line):
        current_main_sector = main_sector_match.group(2).strip()
        i += 1
        continue
    
    # Alt sektör başlığı: "a. Un ve Yem"
    sub_sector_match = re.match(r'^[a-zıi]\.\s+(.+)$', line)
    if sub_sector_match:
        current_sub_sector = sub_sector_match.group(1).strip()
        i += 1
        continue
    
    # ── Firma satırını bul ──
    # Pattern 1: Tek satırda tamamlanan firma
    # SN FIRMA_ADI NACE_KODU ADRES İLÇE
    single_line = re.match(
        r'^(\d+)\s+(.+?)\s+(\d{2}\.\d{2}\.\d{2,4})\s+(.+?)\s+(' + ilce_pattern + r')\s*$',
        line
    )
    if single_line:
        sn = int(single_line.group(1))
        firma = single_line.group(2).strip()
        nace = single_line.group(3).strip()
        adres = single_line.group(4).strip()
        ilce = single_line.group(5).strip()
        
        # Eğer önceki satırda firma adının 1. kısmı varsa birleştir
        if buffer_name_part is not None:
            firma = buffer_name_part + " " + firma
            buffer_name_part = None
        
        companies.append({
            "sn": sn,
            "company_name": firma,
            "nace_code": nace,
            "address": adres,
            "district": ilce,
            "city": "Samsun",
            "main_sector": current_main_sector,
            "sub_sector": current_sub_sector,
        })
        i += 1
        continue
    
    # Pattern 2: Firma adı üst satırda, SN+NACE+ADRES+İLÇE alt satırda
    # Üst satır: Uzun firma adı (numara yok)
    # Alt satır: SN NACE ADRES İLÇE
    # Örnek:
    #   ES-KAV DEĞİRMEN VE YEM HAYVANCILIK SÜT ÜRÜNLERİ GÜBRECİLİK NAKLİYAT TURİZM
    #   4 01.47.01 Soğuksu Mah.Adnan Menderes Cad. No:3 Kavak
    #   SANAYİ VE TİCARET ANOMİN ŞİRKETİ
    
    if i + 1 < len(lines):
        next_line = lines[i + 1].strip()
        # Bir sonraki satır "SN NACE ADRES İLÇE" formatında mı?
        next_match = re.match(
            r'^(\d+)\s+(\d{2}\.\d{2}\.\d{2,4})\s+(.+?)\s+(' + ilce_pattern + r')\s*$',
            next_line
        )
        if next_match and not re.match(r'^\d+\.\s+[A-ZÇĞİÖŞÜ]', line) and not re.match(r'^[a-zıi]\.\s+', line):
            sn = int(next_match.group(1))
            nace = next_match.group(2).strip()
            adres = next_match.group(3).strip()
            ilce = next_match.group(4).strip()
            firma_name_part1 = line.strip()
            
            # 3. satırda da firma adının devamı olabilir (ŞİRKETİ, LİMİTED ŞİRKETİ, vb)
            firma_name = firma_name_part1
            j = i + 2
            while j < len(lines):
                continuation = lines[j].strip()
                # Devam satırları genelde ŞİRKETİ, BÖLGESİ, ŞUBESİ gibi kelimelerle biter
                # Ve numara ile başlamaz
                if (continuation and 
                    not re.match(r'^\d+\s', continuation) and
                    not re.match(r'^\d+\.\s+[A-ZÇĞİÖŞÜ]', continuation) and
                    not re.match(r'^[a-zıi]\.\s+', continuation) and
                    not re.match(r'^---PAGE---$', continuation) and
                    not re.match(r'^SN\s', continuation) and
                    not re.match(r'^SAMSUN\s+TİCARET', continuation) and
                    not re.match(r'^SANAYİCİ', continuation)):
                    # Bu bir devam satırı (firma adının devamı)
                    # Ancak eğer bu satır NACE kodu içeriyorsa yeni firma olabilir
                    if re.match(r'^(\d+)\s+(\d{2}\.\d{2}\.\d{2,4})', continuation):
                        break
                    firma_name += " " + continuation
                    j += 1
                else:
                    break
            
            companies.append({
                "sn": sn,
                "company_name": firma_name.strip(),
                "nace_code": nace,
                "address": adres,
                "district": ilce,
                "city": "Samsun",
                "main_sector": current_main_sector,
                "sub_sector": current_sub_sector,
            })
            i = j
            continue
    
    # Pattern 3: Adres satırı firma adının bir parçası gibi bir önceki satırla karışmış
    # Bazı firmalar NACE kodu satır sonuna doğru olmadığı durumlar
    # Numara ile başlayıp ilçe ile bitmiyorsa, çok satırlı olabilir
    num_start = re.match(r'^(\d+)\s+(\d{2}\.\d{2}\.\d{2,4})\s+(.+)$', line)
    if num_start:
        sn = int(num_start.group(1))
        nace = num_start.group(2).strip()
        rest = num_start.group(3).strip()
        
        # rest'te ilçe var mı kontrol et
        ilce_in_rest = re.search(r'\s+(' + ilce_pattern + r')\s*$', rest)
        if ilce_in_rest:
            ilce = ilce_in_rest.group(1).strip()
            adres = rest[:ilce_in_rest.start()].strip()
            
            # Firma adı önceki buffer'dan gelmiş olabilir
            if buffer_name_part:
                firma = buffer_name_part
                buffer_name_part = None
            else:
                firma = f"Firma #{sn}"
            
            companies.append({
                "sn": sn,
                "company_name": firma,
                "nace_code": nace,
                "address": adres,
                "district": ilce,
                "city": "Samsun",
                "main_sector": current_main_sector,
                "sub_sector": current_sub_sector,
            })
        else:
            # Firma adı daha önceki satırda olmalı, adres aşağıda devam ediyor
            if buffer_name_part:
                # Bu SN satırı, adres ilçe bilgisi sonraki satırda olabilir
                adres = rest
                if i + 1 < len(lines):
                    next_l = lines[i + 1].strip()
                    ilce_m = re.search(r'(' + ilce_pattern + r')\s*$', next_l)
                    if ilce_m:
                        adres += " " + next_l[:ilce_m.start()].strip()
                        ilce = ilce_m.group(1).strip()
                        
                        # İlçe'den sonraki satır da devam olabilir
                        firma = buffer_name_part
                        j = i + 2
                        while j < len(lines):
                            cont = lines[j].strip()
                            if (cont and 
                                not re.match(r'^\d+\s', cont) and
                                not re.match(r'^\d+\.\s+[A-ZÇĞİÖŞÜ]', cont) and
                                not re.match(r'^[a-zıi]\.\s+', cont) and
                                not re.match(r'^---PAGE---$', cont)):
                                firma += " " + cont
                                j += 1
                            else:
                                break
                        
                        buffer_name_part = None
                        companies.append({
                            "sn": sn,
                            "company_name": firma.strip(),
                            "nace_code": nace,
                            "address": adres.strip(),
                            "district": ilce,
                            "city": "Samsun",
                            "main_sector": current_main_sector,
                            "sub_sector": current_sub_sector,
                        })
                        i = j
                        continue
                
                buffer_name_part = None
        i += 1
        continue
    
    # Eğer satır numara ile başlıyorsa ama NACE kodu yoksa, belki firma adı + NACE bir arada
    num_only = re.match(r'^(\d+)\s+(.+)', line)
    if num_only and not re.match(r'^\d+\.\s+[A-ZÇĞİÖŞÜ\s]+$', line):
        rest = num_only.group(2).strip()
        # İçinde NACE kodu var mı?
        nace_in_line = re.search(r'(\d{2}\.\d{2}\.\d{2,4})', rest)
        if nace_in_line:
            firma_part = rest[:nace_in_line.start()].strip()
            nace = nace_in_line.group(1)
            after_nace = rest[nace_in_line.end():].strip()
            
            ilce_match = re.search(r'\s+(' + ilce_pattern + r')\s*$', after_nace)
            if ilce_match:
                ilce = ilce_match.group(1).strip()
                adres = after_nace[:ilce_match.start()].strip()
                
                if buffer_name_part:
                    firma_part = buffer_name_part + " " + firma_part
                    buffer_name_part = None
                
                companies.append({
                    "sn": int(num_only.group(1)),
                    "company_name": firma_part,
                    "nace_code": nace,
                    "address": adres,
                    "district": ilce,
                    "city": "Samsun",
                    "main_sector": current_main_sector,
                    "sub_sector": current_sub_sector,
                })
                i += 1
                continue
    
    # Hiçbir pattern'e uymadı → sonraki satırlar için firma adı buffer'ı olabilir
    # (Firma adının ilk satırı numara ile başlamıyorsa)
    if not re.match(r'^\d+', line) and len(line) > 5:
        # Büyük harfle başlayan uzun satırlar genellikle firma adı
        if re.match(r'^[A-ZÇĞİÖŞÜ(]', line):
            buffer_name_part = line
    
    i += 1

# ── 5) Temizle ve deduplike et ───────────────────────────────────
print(f"  → {len(companies)} firma ayrıştırıldı")

# SN'ye göre sırala ve duplikatları kaldır
seen_sn = set()
unique = []
for c in companies:
    if c["sn"] not in seen_sn:
        seen_sn.add(c["sn"])
        unique.append(c)
companies = sorted(unique, key=lambda x: x["sn"])

print(f"  → {len(companies)} benzersiz firma (SN bazında)")

# Önizleme
print("\n  İlk 5 firma:")
for c in companies[:5]:
    print(f"    [{c['sn']}] {c['company_name'][:60]} — {c['district']} ({c['nace_code']})")
print(f"  ...")
print(f"  Son 5 firma:")
for c in companies[-5:]:
    print(f"    [{c['sn']}] {c['company_name'][:60]} — {c['district']} ({c['nace_code']})")

# ── 6) CRM veritabanına ekle ─────────────────────────────────────
print("\n[3/4] Veritabanına ekleniyor...")
create_all_tables()
db = SessionLocal()

added = 0
skipped = 0

try:
    for c in companies:
        # Aynı firma adı + şehir var mı kontrol et (duplikasyon önleme)
        existing = db.query(Customer).filter(
            Customer.company_name == c["company_name"],
            Customer.city == c["city"]
        ).first()
        
        if existing:
            skipped += 1
            continue
        
        sector = classify_sector(c["nace_code"], c.get("sub_sector", ""))
        
        # Potansiyel skor hesapla
        score = 50  # Baz skor
        name_lower = c["company_name"].lower()
        
        # Nakliye/lojistik/taşımacılık firmalarına yüksek skor
        if any(k in name_lower for k in ["nakliye", "nakliyat", "lojistik", "taşımacılık", "transport", "kargo"]):
            score += 25
        # İnşaat firmaları
        if any(k in name_lower for k in ["inşaat", "yapı", "beton", "çimento"]):
            score += 15
        # Tarım/hayvancılık
        if any(k in name_lower for k in ["tarım", "hayvancılık", "çiftlik"]):
            score += 10
        # Büyük anonim şirketler
        if "anonim şirketi" in name_lower:
            score += 10
        # OTOMOTİV ilişkili
        if any(k in name_lower for k in ["otomotiv", "araç", "römork", "treyler", "tır", "kamyon"]):
            score += 30
        
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
            sector=sector,
            segment=segment,
            potential_level=potential,
            potential_score=score,
            source="import",
            sales_notes=f"Samsun TSO Sanayici Üye Listesi | NACE: {c['nace_code']} | Sektör: {c['main_sector']} / {c['sub_sector']}",
            is_active=True,
        )
        db.add(customer)
        added += 1
        
        # Her 100 firmada bir commit
        if added % 100 == 0:
            db.commit()
            print(f"  → {added} firma eklendi...")
    
    db.commit()
    
except Exception as e:
    db.rollback()
    print(f"  HATA: {e}")
    raise
finally:
    db.close()

print(f"\n[4/4] Tamamlandı!")
print(f"  ✓ {added} yeni firma eklendi")
print(f"  ○ {skipped} firma zaten mevcuttu (atlandı)")
print(f"  Toplam: {added + skipped} / {len(companies)}")
