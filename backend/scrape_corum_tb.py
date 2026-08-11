"""
Çorum Ticaret Borsası - HTML Table parse ile üye scraper
"""
import requests
import json
import re
import sys
import time
import html

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "https://www.corumtb.org.tr/TradeMembers"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept-Language": "tr-TR,tr;q=0.9",
}

all_members = []
seen = set()

for page in range(1, 23):  # Sayfalar 1'den başlıyor gibi görünüyor, yine de 1-22 diyelim
    url = f"{BASE_URL}?q=&group=&type=&nace=&page={page}"
    print(f"Sayfa {page}/22...", end=" ")
    
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.encoding = 'utf-8'
        raw = resp.text
        
        # Her üye bir <tr> etiketi içinde
        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', raw, re.DOTALL)
        
        page_count = 0
        for row in rows:
            # Başlık satırını atla
            if '<th' in row:
                continue
                
            name_match = re.search(r'<strong>(.*?)</strong>', row, re.DOTALL)
            nace_match = re.search(r'<span[^>]*badge[^>]*>(.*?)</span>', row, re.DOTALL)
            desc_match = re.search(r'</span>(.*?)</div>', row, re.DOTALL)
            
            if name_match:
                # İsmi temizle ve HTML karakterlerini dönüştür (örn. &#x130; -> İ)
                name = html.unescape(name_match.group(1)).strip()
                # Gereksiz boşluk ve tabları sil
                name = re.sub(r'\s+', ' ', name)
                
                nace_code = html.unescape(nace_match.group(1)).strip() if nace_match else ""
                nace_desc = html.unescape(desc_match.group(1)).strip() if desc_match else ""
                
                # NACE açıklamasının başındaki/sonundaki boşlukları sil
                nace_desc = re.sub(r'^\s*-\s*', '', nace_desc).strip()
                
                if len(name) > 3 and name not in seen:
                    seen.add(name)
                    all_members.append({
                        "name": name,
                        "naceCode": nace_code,
                        "naceDesc": nace_desc
                    })
                    page_count += 1
        
        print(f"→ {page_count} üye")
        
    except Exception as e:
        print(f"HATA: {e}")
    
    time.sleep(0.3)

print(f"\nToplam: {len(all_members)} üye")

if all_members:
    with open("corum_members.json", "w", encoding="utf-8") as f:
        json.dump(all_members, f, ensure_ascii=False, indent=2)
    print(f"Kaydedildi: corum_members.json")
