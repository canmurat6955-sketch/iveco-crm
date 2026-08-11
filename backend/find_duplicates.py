"""
Aynı/benzer firma isimli kayıtları bul ve listele.
Kullanıcı bunları CRM'den manuel birleştirebilir.
"""
import sqlite3, sys, os, re
from collections import defaultdict
sys.stdout.reconfigure(encoding='utf-8')

DB = os.path.join(os.path.dirname(__file__), 'iveco_crm.db')
conn = sqlite3.connect(DB)
c = conn.cursor()

def turkish_lower(t):
    return t.replace('İ','i').replace('I','ı').replace('Ö','ö').replace('Ü','ü').replace('Ş','ş').replace('Ç','ç').replace('Ğ','ğ').lower()

def normalize_name(name):
    """Firma adını normalize et - karşılaştırma için"""
    n = turkish_lower(name.strip())
    # Yaygın ekleri kaldır
    for suffix in [' limited şirketi', ' ltd şti', ' ltd. şti.', ' ltd.şti.', ' san. ve tic.', 
                   ' san.ve tic.', ' sanayi ve ticaret', ' san. tic.', ' san.tic.',
                   ' anonim şirketi', ' a.ş.', ' a.ş', ' ltd', ' limited',
                   ' ithalat ihracat', ' ithalat', ' ihracat', ' ith. ihr.',
                   ' imalat', ' üretim', ' pazarlama', ' hizmetleri',
                   ' ticaret', ' sanayi', ' san.', ' tic.']:
        n = n.replace(suffix, '')
    # Noktalama ve fazla boşluk
    n = re.sub(r'[^\w\s]', '', n)
    n = re.sub(r'\s+', ' ', n).strip()
    return n

# Tüm aktif müşterileri çek
c.execute("""
    SELECT id, company_name, phone, city, sector, source, sales_notes 
    FROM customers 
    WHERE is_active=1 
    ORDER BY company_name
""")
all_customers = c.fetchall()

# ── 1. TAM EŞLEŞMELer (normalize edilmiş isim aynı) ──
name_groups = defaultdict(list)
for row in all_customers:
    norm = normalize_name(row[1])
    name_groups[norm].append(row)

exact_matches = {k: v for k, v in name_groups.items() if len(v) >= 2}

print("=" * 80)
print("  BİRLEŞTİRİLEBİLECEK KAYITLAR")
print("=" * 80)

print(f"\n{'─'*80}")
print(f"  BÖLÜM 1: AYNI İSİMLİ KAYITLAR ({len(exact_matches)} grup)")
print(f"{'─'*80}")

group_num = 0
for norm_name, rows in sorted(exact_matches.items(), key=lambda x: len(x[1]), reverse=True):
    group_num += 1
    print(f"\n  ┌─ GRUP {group_num}: {rows[0][1][:60]}")
    for r in rows:
        rid, rname, rphone, rcity, rsector, rsource, rnotes = r
        phone_str = rphone or 'Tel yok'
        city_str = rcity or '?'
        notes_preview = (rnotes or '')[:50].replace('\n',' ')
        print(f"  │  ID:{rid:<5d} | {rname[:45]:<45s} | {phone_str:<16s} | {city_str:<10s} | {rsource}")
        if notes_preview:
            print(f"  │         Not: {notes_preview}")
    print(f"  └─ ({len(rows)} kayıt)")

# ── 2. BENZER İSİMLer (ilk 3+ kelime aynı) ──
print(f"\n{'─'*80}")
print(f"  BÖLÜM 2: BENZER İSİMLİ KAYITLAR")
print(f"{'─'*80}")

def get_key_words(name, min_len=4):
    """İsimden anlamlı kelimeleri çıkar"""
    n = turkish_lower(name)
    words = re.findall(r'[a-zçğıöşü]{4,}', n)
    # Stop words
    stops = {'sanayi','ticaret','limited','şirketi','anonim','ithalat','ihracat',
             'imalat','üretim','pazarlama','hizmetleri','malzemeleri','maddeleri',
             'ürünleri','sistemleri','taşımacılık','müh','gıda','inşaat','tekstil'}
    return [w for w in words if w not in stops]

# Kelime bazlı gruplama - ilk 2 anlamlı kelime aynıysa
word_groups = defaultdict(list)
for row in all_customers:
    words = get_key_words(row[1])
    if len(words) >= 2:
        key = ' '.join(words[:2])
        word_groups[key].append(row)

similar_matches = {}
for key, rows in word_groups.items():
    if len(rows) >= 2:
        # Exact match'lerde zaten varsa atla
        norms = set(normalize_name(r[1]) for r in rows)
        if len(norms) > 1:  # Farklı normalize isimleri varsa benzer
            similar_matches[key] = rows

group_num2 = 0
for key, rows in sorted(similar_matches.items(), key=lambda x: len(x[1]), reverse=True)[:40]:
    group_num2 += 1
    print(f"\n  ┌─ BENZER {group_num2}: \"{key}\"")
    for r in rows:
        rid, rname, rphone, rcity, rsector, rsource, rnotes = r
        phone_str = rphone or 'Tel yok'
        city_str = rcity or '?'
        print(f"  │  ID:{rid:<5d} | {rname[:45]:<45s} | {phone_str:<16s} | {city_str:<10s} | {rsource}")
    print(f"  └─ ({len(rows)} kayıt)")

# ── 3. AYNI TELEFON FARKLI İSİM (olmamalı ama kontrol) ──
print(f"\n{'─'*80}")
print(f"  BÖLÜM 3: AYNI TELEFON FARKLI İSİM")
print(f"{'─'*80}")

phone_groups = defaultdict(list)
for row in all_customers:
    if row[2]:
        norm_phone = re.sub(r'[^\d]', '', row[2])[-10:]
        if len(norm_phone) >= 10:
            phone_groups[norm_phone].append(row)

phone_dups = {k: v for k, v in phone_groups.items() if len(v) >= 2}
if phone_dups:
    for phone, rows in phone_dups.items():
        print(f"\n  Tel: {rows[0][2]}")
        for r in rows:
            print(f"    ID:{r[0]:<5d} | {r[1][:45]:<45s} | {r[4] or '?'}")
else:
    print("  ✅ Yok — tüm telefon duplikatları temizlendi")

# ── ÖZET ──
print(f"\n{'='*80}")
print(f"  ÖZET")
print(f"{'='*80}")
print(f"  Tam eşleşme grupları:  {len(exact_matches)} ({sum(len(v) for v in exact_matches.values())} kayıt)")
print(f"  Benzer isim grupları:  {len(similar_matches)} ({sum(len(v) for v in similar_matches.values())} kayıt)")
print(f"  Telefon duplikatları:  {len(phone_dups)}")
print(f"\n  📌 CRM'de Müşteri Listesi'nden bu ID'leri arayıp birleştirebilirsin.")
print(f"  📌 Birleştirmek için: 2+ kayıt seç → 'Birleştir' butonu → Ana firmayı seç")
print(f"{'='*80}\n")

conn.close()
