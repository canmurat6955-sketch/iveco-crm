"""
Samsun TSO Sanayici Uye Listesi PDF'inden firma verisi cikarma ve CRM'e ekleme.
"""
import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))

import pdfplumber

# 1) PDF'den tum metni cikar
pdf = pdfplumber.open('samsuntso_members.pdf')
all_text = ""
for page in pdf.pages:
    text = page.extract_text()
    if text:
        all_text += text + "\n"
pdf.close()

# 2) Satirlari isle — firma satirlarini bul
lines = all_text.split("\n")
companies = []
current_sector = ""
sector_headers = []

# Sektorleri ve firmalari ayikla
i = 0
while i < len(lines):
    line = lines[i].strip()
    
    # Sektor basliklarini yakala (ornek: "1. GIDA VE ICECEK SANAYI", "a. Un ve Yem")
    # Ana sektor: Numara + buyuk harfli baslik
    if re.match(r'^\d+\.\s+[A-Z\s\u0130\u015e\u00dc\u00d6\u00c7\u011e]+$', line):
        current_sector = line.strip()
        i += 1
        continue
    # Alt sektor (a. b. c. vb)
    if re.match(r'^[a-z]\.\s+', line):
        sub = line.strip()
        current_sector_full = current_sector + " / " + sub if current_sector else sub
        i += 1
        continue
    
    # Firma satirlarini bul — numara ile baslayan satirlar
    m = re.match(r'^(\d+)\s+(.+?)(\d{2}\.\d{2}\.\d{2})\s+(.+?)\s+(Asarc\u0131k|Atakum|Bafra|Canik|\u00c7ar\u015famba|Havza|19 May\u0131s|\u0130lkad\u0131m|Kavak|Ladik|Tekkek\u00f6y|Tekke|Terme|Vezirk\u00f6pr\u00fc|Ala\u00e7am|Yakakent|Sal\u0131pazar\u0131|Ayvac\u0131k)$', line)
    if m:
        sn = m.group(1)
        firma = m.group(2).strip()
        nace = m.group(3)
        adres = m.group(4).strip()
        ilce = m.group(5).strip()
        companies.append({
            "sn": int(sn),
            "company_name": firma,
            "nace_code": nace,
            "address": adres,
            "district": ilce,
            "city": "Samsun",
            "sector_raw": current_sector,
        })
    else:
        # Bazi satirlar ikiye bolunmus olabilir — numara ile baslayip
        # ilce bilgisi bir sonraki satirda olabilir
        m2 = re.match(r'^(\d+)\s+(.+?)(\d{2}\.\d{2}\.\d{2})\s+(.+)$', line)
        if m2:
            sn = m2.group(1)
            firma = m2.group(2).strip()
            nace = m2.group(3)
            rest = m2.group(4).strip()
            
            # Ilce bilgisi rest'in sonunda olabilir
            ilce_match = re.search(r'(Asarc\u0131k|Atakum|Bafra|Canik|\u00c7ar\u015famba|Havza|19 May\u0131s|\u0130lkad\u0131m|Kavak|Ladik|Tekkek\u00f6y|Tekke|Terme|Vezirk\u00f6pr\u00fc|Ala\u00e7am|Yakakent|Sal\u0131pazar\u0131|Ayvac\u0131k)$', rest)
            if ilce_match:
                ilce = ilce_match.group(1)
                adres = rest[:ilce_match.start()].strip()
                companies.append({
                    "sn": int(sn),
                    "company_name": firma,
                    "nace_code": nace,
                    "address": adres,
                    "district": ilce if ilce != "Tekke" else "Tekkekoy",
                    "city": "Samsun",
                    "sector_raw": current_sector,
                })
    i += 1

print(f"Toplam {len(companies)} firma cikarildi")
for c in companies[:10]:
    print(f"  [{c['sn']}] {c['company_name']} — {c['district']}")
print("...")
for c in companies[-5:]:
    print(f"  [{c['sn']}] {c['company_name']} — {c['district']}")
