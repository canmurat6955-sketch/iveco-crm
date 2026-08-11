#!/usr/bin/env python3
"""
Iveco CRM Database - Data Quality Fix Script
=============================================
Fixes: sector normalization, junk records, city inference, duplicate merging, city normalization.
"""

import sys
import sqlite3
import re
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

DB_PATH = 'iveco_crm.db'

# ─────────────────────────────────────────────────────
# 1. SECTOR NORMALIZATION MAP
# ─────────────────────────────────────────────────────
SECTOR_MAP = {
    # Nakliyat / Lojistik
    'Nakliye': 'Nakliyat / Lojistik',
    'Lojistik': 'Nakliyat / Lojistik',
    'Taşımacılık': 'Nakliyat / Lojistik',
    'Ulaşım / Nakliye / Akaryakıt': 'Nakliyat / Lojistik',
    'Depolama / Lojistik': 'Nakliyat / Lojistik',
    'Nakliye / Lojistik': 'Nakliyat / Lojistik',
    'Uluslararası Taşımacılık': 'Nakliyat / Lojistik',
    'Soğuk Zincir Lojistik': 'Nakliyat / Lojistik',
    'Su Ürünleri Lojistik': 'Nakliyat / Lojistik',

    # İnşaat / Yapı
    'İnşaat': 'İnşaat / Yapı',
    'İnşaat Malzemesi': 'İnşaat / Yapı',
    'İnşaat Malzemeleri': 'İnşaat / Yapı',
    'İnşaat / Yapı Malzemesi': 'İnşaat / Yapı',
    'Altyapı İnşaat': 'İnşaat / Yapı',
    'Hazır Beton': 'İnşaat / Yapı',
    'Hazır Beton / Hafriyat': 'İnşaat / Yapı',
    'Hafriyat': 'İnşaat / Yapı',
    'Tesisat / Montaj': 'İnşaat / Yapı',
    'Bina Hizmetleri': 'İnşaat / Yapı',

    # Gıda
    'Gıda / Tarım': 'Gıda',
    'Gıda Perakende': 'Gıda',
    'İçecek': 'Gıda',
    'Yemek / Catering': 'Gıda',
    'Su Ürünleri': 'Gıda',

    # Tarım / Hayvancılık (already correct, but map for safety)
    'Tarım / Hayvancılık': 'Tarım / Hayvancılık',

    # Metal / Makine
    'Metal İşleme': 'Metal / Makine',
    'Metal / Makine': 'Metal / Makine',
    'Metal / Demir Çelik': 'Metal / Makine',
    'Metal / Demir-Çelik': 'Metal / Makine',
    'Makine İmalat': 'Metal / Makine',
    'Makine / Ekipman': 'Metal / Makine',

    # Otomotiv
    'Otomotiv Ticaret': 'Otomotiv',
    'Otomotiv / Araç': 'Otomotiv',

    # Tekstil / Giyim
    'Tekstil': 'Tekstil / Giyim',
    'Tekstil / Giyim': 'Tekstil / Giyim',
    'Giyim': 'Tekstil / Giyim',
    'Konfeksiyon': 'Tekstil / Giyim',
    'Deri / Tekstil': 'Tekstil / Giyim',

    # Mobilya / Orman Ürünleri
    'Mobilya': 'Mobilya / Orman Ürünleri',
    'Orman Ürünleri / Mobilya': 'Mobilya / Orman Ürünleri',
    'Mobilya / Ahşap': 'Mobilya / Orman Ürünleri',
    'Ağaç / Kereste': 'Mobilya / Orman Ürünleri',

    # Enerji / Madencilik
    'Madencilik / Enerji': 'Enerji / Madencilik',
    'Enerji': 'Enerji / Madencilik',
    'Petrol / Enerji': 'Enerji / Madencilik',
    'Elektrik / Enerji': 'Enerji / Madencilik',
    'Elektrik / Elektronik': 'Enerji / Madencilik',
    'Kömür Madenciliği': 'Enerji / Madencilik',
    'Madencilik': 'Enerji / Madencilik',
    'Petrol / Madeni Yağ': 'Enerji / Madencilik',

    # Kimya / Plastik
    'Kimya': 'Kimya / Plastik',
    'Plastik / Kauçuk': 'Kimya / Plastik',
    'Plastik / Ambalaj': 'Kimya / Plastik',
    'Gübre / Kimya': 'Kimya / Plastik',

    # Ticaret (Genel)
    'Ticaret (Genel)': 'Ticaret (Genel)',
    'Toptan Ticaret': 'Ticaret (Genel)',
    'Perakende Ticaret': 'Ticaret (Genel)',

    # Sağlık / İlaç
    'Sağlık / Eczane': 'Sağlık / İlaç',
    'Sağlık / İlaç': 'Sağlık / İlaç',
    'İlaç': 'Sağlık / İlaç',

    # Hizmet / Turizm
    'Hizmet / Turizm': 'Hizmet / Turizm',
    'Turizm / Konaklama': 'Hizmet / Turizm',
    'Spor / Eğlence': 'Hizmet / Turizm',

    # Finans / Sigorta (keep as is)
    'Finans / Sigorta': 'Finans / Sigorta',

    # Kağıt / Ambalaj
    'Kağıt Ürünleri': 'Kağıt / Ambalaj',
    'Kağıt / Ambalaj': 'Kağıt / Ambalaj',
    'Ambalaj / Paketleme': 'Kağıt / Ambalaj',

    # Diğer
    'Diğer': 'Diğer',
    'Diğer İmalat': 'Diğer',
    'Muhtelif İmalat': 'Diğer',
    'Tamir / Bakım': 'Diğer',
    'Deri / Ayakkabı': 'Diğer',
    'Aydınlatma': 'Diğer',
    'Bilişim / Yazılım': 'Diğer',
    'Basım / Matbaa': 'Diğer',
    'Reklam': 'Diğer',
    'Mühendislik': 'Diğer',
    'Atık Yönetimi': 'Diğer',
    'İş Gücü': 'Diğer',
    'Ulaşım Araçları': 'Diğer',
    'Denizcilik / Balıkçılık': 'Diğer',
    'tehlikeli madde danışmanlığı': 'Diğer',
    'Medikal': 'Sağlık / İlaç',
}

# ─────────────────────────────────────────────────────
# District → City mapping for city inference
# ─────────────────────────────────────────────────────
DISTRICT_CITY_MAP = {
    # Samsun districts
    'bafra': 'Samsun', 'çarşamba': 'Samsun', 'terme': 'Samsun', 'vezirköprü': 'Samsun',
    'kavak': 'Samsun', 'ladik': 'Samsun', 'alaçam': 'Samsun', 'havza': 'Samsun',
    'tekkeköy': 'Samsun', 'atakum': 'Samsun', 'ilkadım': 'Samsun', 'canik': 'Samsun',
    'yakakent': 'Samsun', 'ayvacık': 'Samsun', 'salıpazarı': 'Samsun', 'asarcık': 'Samsun',
    '19 mayıs': 'Samsun',
    # Sinop districts
    'boyabat': 'Sinop', 'gerze': 'Sinop', 'durağan': 'Sinop', 'erfelek': 'Sinop',
    'ayancık': 'Sinop', 'türkeli': 'Sinop', 'dikmen': 'Sinop', 'saraydüzü': 'Sinop',
    # Ordu districts
    'ünye': 'Ordu', 'fatsa': 'Ordu', 'altınordu': 'Ordu', 'perşembe': 'Ordu',
    'akkuş': 'Ordu', 'aybastı': 'Ordu', 'gölköy': 'Ordu', 'gülyalı': 'Ordu',
    'korgan': 'Ordu', 'kumru': 'Ordu', 'mesudiye': 'Ordu', 'ulubey': 'Ordu',
    'kabadüz': 'Ordu', 'kabataş': 'Ordu', 'çamaş': 'Ordu', 'çatalpınar': 'Ordu',
    'ikizce': 'Ordu',
    # Amasya districts
    'merzifon': 'Amasya', 'suluova': 'Amasya', 'göynücek': 'Amasya',
    'gümüşhacıköy': 'Amasya', 'taşova': 'Amasya', 'hamamözü': 'Amasya',
    # Tokat districts
    'turhal': 'Tokat', 'erbaa': 'Tokat', 'niksar': 'Tokat', 'zile': 'Tokat',
    'reşadiye': 'Tokat', 'almus': 'Tokat', 'artova': 'Tokat', 'pazar': 'Tokat',
    'sulusaray': 'Tokat', 'başçiftlik': 'Tokat', 'yeşilyurt': 'Tokat',
    # Çorum districts
    'sungurlu': 'Çorum', 'osmancık': 'Çorum', 'iskilip': 'Çorum', 'alaca': 'Çorum',
    'bayat': 'Çorum', 'kargı': 'Çorum', 'mecitözü': 'Çorum', 'ortaköy': 'Çorum',
    'dodurga': 'Çorum', 'laçin': 'Çorum', 'oğuzlar': 'Çorum', 'uğurludağ': 'Çorum',
    'boğazkale': 'Çorum',
    # Giresun districts
    'bulancak': 'Giresun', 'espiye': 'Giresun', 'görele': 'Giresun', 'tirebolu': 'Giresun',
    'keşap': 'Giresun', 'eynesil': 'Giresun', 'piraziz': 'Giresun', 'yağlıdere': 'Giresun',
    'şebinkarahisar': 'Giresun', 'alucra': 'Giresun', 'çamoluk': 'Giresun',
    'çanakçı': 'Giresun', 'dereli': 'Giresun', 'doğankent': 'Giresun',
    'güce': 'Giresun',
}

# City names for direct matching
CITY_NAMES = {
    'samsun': 'Samsun', 'sinop': 'Sinop', 'ordu': 'Ordu',
    'amasya': 'Amasya', 'tokat': 'Tokat', 'çorum': 'Çorum',
    'giresun': 'Giresun',
}


def turkish_lower(s):
    """Turkish-aware lowercase."""
    if not s:
        return ''
    return s.replace('I', 'ı').replace('İ', 'i').lower()


def infer_city_from_text(text):
    """Try to find a city name or district name in the given text."""
    if not text:
        return None
    tl = turkish_lower(text)

    # Check city names first
    for city_lower, city_proper in CITY_NAMES.items():
        # Match as whole word (boundary check)
        if re.search(r'\b' + re.escape(city_lower) + r'\b', tl):
            return city_proper

    # Check district names
    for district_lower, city_proper in DISTRICT_CITY_MAP.items():
        if re.search(r'\b' + re.escape(district_lower) + r'\b', tl):
            return city_proper

    return None


def main():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    c = conn.cursor()

    stats = defaultdict(int)

    print("=" * 70)
    print("  IVECO CRM - DATA QUALITY FIX SCRIPT")
    print("=" * 70)

    # ─────────────────────────────────────────────────
    # STEP 1: JUNK RECORD CLEANUP
    # ─────────────────────────────────────────────────
    print("\n" + "─" * 70)
    print("  STEP 1: JUNK RECORD CLEANUP")
    print("─" * 70)

    # 1a. Delete company_name = 'null'
    c.execute("SELECT id FROM customers WHERE company_name = 'null'")
    null_ids = [r[0] for r in c.fetchall()]
    if null_ids:
        c.execute("DELETE FROM customers WHERE company_name = 'null'")
        stats['deleted_null'] = len(null_ids)
        print(f"  ✓ Deleted {len(null_ids)} record(s) with company_name='null': IDs {null_ids}")

    # 1b. Delete company_name = 'Bilinmeyen'
    c.execute("SELECT id FROM customers WHERE company_name = 'Bilinmeyen'")
    bilinmeyen_ids = [r[0] for r in c.fetchall()]
    if bilinmeyen_ids:
        c.execute("DELETE FROM customers WHERE company_name = 'Bilinmeyen'")
        stats['deleted_bilinmeyen'] = len(bilinmeyen_ids)
        print(f"  ✓ Deleted {len(bilinmeyen_ids)} record(s) with company_name='Bilinmeyen': IDs {bilinmeyen_ids}")

    # 1c. Handle 'ŞUBESİ' (ID 484) - just the word "ŞUBESİ" as entire name - delete it
    c.execute("SELECT id, company_name FROM customers WHERE TRIM(company_name) = 'ŞUBESİ'")
    subesi_rows = c.fetchall()
    if subesi_rows:
        for row in subesi_rows:
            c.execute("DELETE FROM customers WHERE id = ?", (row[0],))
            stats['deleted_subesi'] += 1
            print(f"  ✓ Deleted junk record ID {row[0]} with company_name='{row[1]}'")

    # 1d. Fix sectors containing address text (very long sectors with address info)
    c.execute("SELECT id, company_name, sector FROM customers WHERE LENGTH(sector) > 40")
    address_sector_rows = c.fetchall()
    for row in address_sector_rows:
        rid, name, sector = row
        # These are garbage sectors with embedded addresses → set to 'Diğer'
        c.execute("UPDATE customers SET sector = 'Diğer' WHERE id = ?", (rid,))
        stats['fixed_address_sectors'] += 1
        print(f"  ✓ Fixed address-in-sector for ID {rid} ({name[:50]}...)")
        print(f"    Old sector: {sector[:60]}...")
        print(f"    New sector: Diğer")

    # Also fix company_name fields that have address/description junk appended
    c.execute("SELECT id, company_name FROM customers WHERE LENGTH(company_name) > 100 AND company_name LIKE '%faaliyetleri%'")
    junk_name_rows = c.fetchall()
    for row in junk_name_rows:
        rid, name = row
        # Try to extract the actual company name (before the description junk)
        # Pattern: Company name followed by activity description
        parts = re.split(r'\s+(sağlığına|ortaöğretim|organizasyonun)', name)
        if len(parts) > 1:
            clean_name = parts[0].strip()
            c.execute("UPDATE customers SET company_name = ? WHERE id = ?", (clean_name, rid))
            stats['fixed_junk_names'] += 1
            print(f"  ✓ Cleaned company name for ID {rid}")
            print(f"    Old: {name[:70]}...")
            print(f"    New: {clean_name}")

    # Also fix remaining junk company names (with embedded address descriptions)
    c.execute("""SELECT id, company_name FROM customers 
                 WHERE company_name LIKE '%organizasyonun stratejik%' 
                 OR company_name LIKE '%ortaöğretim%'
                 OR company_name LIKE '%sağlığına yönelik%'""")
    more_junk = c.fetchall()
    for row in more_junk:
        rid, name = row
        # Extract the proper company name before the junk description
        for pattern in [r'\s+sağlığına\b', r'\s+ortaöğretim\b', r'\s+organizasyonun\b']:
            match = re.search(pattern, name)
            if match:
                clean_name = name[:match.start()].strip()
                c.execute("UPDATE customers SET company_name = ? WHERE id = ?", (clean_name, rid))
                stats['fixed_junk_names'] += 1
                print(f"  ✓ Cleaned company name for ID {rid}")
                print(f"    Old: {name[:70]}...")
                print(f"    New: {clean_name}")
                break

    conn.commit()

    # ─────────────────────────────────────────────────
    # STEP 2: SECTOR NORMALIZATION
    # ─────────────────────────────────────────────────
    print("\n" + "─" * 70)
    print("  STEP 2: SECTOR NORMALIZATION")
    print("─" * 70)

    c.execute("SELECT DISTINCT sector FROM customers WHERE sector IS NOT NULL")
    all_sectors = [r[0] for r in c.fetchall()]

    sector_changes = defaultdict(int)
    for old_sector in all_sectors:
        new_sector = SECTOR_MAP.get(old_sector)
        if new_sector and new_sector != old_sector:
            c.execute("UPDATE customers SET sector = ? WHERE sector = ?", (new_sector, old_sector))
            count = c.rowcount
            sector_changes[f"{old_sector} → {new_sector}"] = count
            stats['sectors_normalized'] += count

    if sector_changes:
        print(f"  ✓ Normalized {stats['sectors_normalized']} records across {len(sector_changes)} sector mappings:")
        for change, count in sorted(sector_changes.items()):
            print(f"    • {change} ({count} records)")
    else:
        print("  ○ No sector normalization needed")

    conn.commit()

    # ─────────────────────────────────────────────────
    # STEP 3: CITY NORMALIZATION (case fix)
    # ─────────────────────────────────────────────────
    print("\n" + "─" * 70)
    print("  STEP 3: CITY NORMALIZATION (case fix)")
    print("─" * 70)

    c.execute("UPDATE customers SET city = 'Samsun' WHERE city = 'samsun'")
    stats['city_case_fixed'] = c.rowcount
    if stats['city_case_fixed']:
        print(f"  ✓ Fixed {stats['city_case_fixed']} records: 'samsun' → 'Samsun'")
    else:
        print("  ○ No city case fixes needed")

    conn.commit()

    # ─────────────────────────────────────────────────
    # STEP 4: CITY INFERENCE from company_name / sales_notes
    # ─────────────────────────────────────────────────
    print("\n" + "─" * 70)
    print("  STEP 4: CITY INFERENCE")
    print("─" * 70)

    c.execute("""SELECT id, company_name, sales_notes, district 
                 FROM customers 
                 WHERE city = 'Bilinmiyor' OR city IS NULL OR TRIM(city) = ''""")
    unknown_city_rows = c.fetchall()
    print(f"  Found {len(unknown_city_rows)} records with unknown city")

    city_inferred = 0
    for row in unknown_city_rows:
        rid, name, notes, district = row

        # Try company_name first
        inferred = infer_city_from_text(name)

        # Try district column
        if not inferred and district:
            dl = turkish_lower(district)
            if dl in DISTRICT_CITY_MAP:
                inferred = DISTRICT_CITY_MAP[dl]
            elif dl in CITY_NAMES:
                inferred = CITY_NAMES[dl]

        # Try sales_notes
        if not inferred:
            inferred = infer_city_from_text(notes)

        if inferred:
            c.execute("UPDATE customers SET city = ? WHERE id = ?", (inferred, rid))
            city_inferred += 1
            if city_inferred <= 20:  # Print first 20 examples
                print(f"  ✓ ID {rid}: '{name[:50]}' → city: {inferred}")

    stats['city_inferred'] = city_inferred
    if city_inferred > 20:
        print(f"  ... and {city_inferred - 20} more")
    print(f"  Total: {city_inferred}/{len(unknown_city_rows)} cities inferred")

    conn.commit()

    # ─────────────────────────────────────────────────
    # STEP 5: DUPLICATE NAME MERGING
    # ─────────────────────────────────────────────────
    print("\n" + "─" * 70)
    print("  STEP 5: DUPLICATE NAME MERGING")
    print("─" * 70)

    c.execute("""
        SELECT UPPER(TRIM(company_name)) as norm_name, COUNT(*) as cnt
        FROM customers
        GROUP BY UPPER(TRIM(company_name))
        HAVING cnt > 1
        ORDER BY cnt DESC
    """)
    dup_groups = c.fetchall()
    print(f"  Found {len(dup_groups)} groups of duplicate company names")

    total_merged = 0
    total_deleted = 0

    for norm_name, cnt in dup_groups:
        if not norm_name or norm_name.strip() == '':
            continue

        c.execute("""
            SELECT id, company_name, phone, sector, sales_notes, created_at, 
                   city, district, email, website, source
            FROM customers 
            WHERE UPPER(TRIM(company_name)) = ?
            ORDER BY
                CASE WHEN phone IS NOT NULL AND phone != '' THEN 0 ELSE 1 END,
                CASE WHEN sector IS NOT NULL AND sector != '' THEN 0 ELSE 1 END,
                CASE WHEN city IS NOT NULL AND city != '' AND city != 'Bilinmiyor' THEN 0 ELSE 1 END,
                CASE WHEN email IS NOT NULL AND email != '' THEN 0 ELSE 1 END,
                created_at ASC
        """, (norm_name,))
        dups = c.fetchall()

        if len(dups) < 2:
            continue

        # Keep the first one (best data), merge notes from others
        keeper = dups[0]
        keeper_id = keeper[0]
        keeper_notes = keeper[4] or ''

        merged_notes_parts = []
        delete_ids = []

        for dup in dups[1:]:
            dup_id = dup[0]
            dup_notes = dup[4] or ''

            # Collect non-empty notes from duplicates
            if dup_notes.strip() and dup_notes.strip() not in keeper_notes:
                merged_notes_parts.append(dup_notes.strip())

            # Also fill in missing data from duplicates into keeper
            # Phone
            if not keeper[2] and dup[2]:
                c.execute("UPDATE customers SET phone = ? WHERE id = ?", (dup[2], keeper_id))
            # Sector
            if (not keeper[3] or keeper[3] == 'Diğer') and dup[3] and dup[3] != 'Diğer':
                c.execute("UPDATE customers SET sector = ? WHERE id = ?", (dup[3], keeper_id))
            # City
            if (not keeper[6] or keeper[6] == 'Bilinmiyor') and dup[6] and dup[6] != 'Bilinmiyor':
                c.execute("UPDATE customers SET city = ? WHERE id = ?", (dup[6], keeper_id))
            # District
            if not keeper[7] and dup[7]:
                c.execute("UPDATE customers SET district = ? WHERE id = ?", (dup[7], keeper_id))
            # Email
            if not keeper[8] and dup[8]:
                c.execute("UPDATE customers SET email = ? WHERE id = ?", (dup[8], keeper_id))
            # Website
            if not keeper[9] and dup[9]:
                c.execute("UPDATE customers SET website = ? WHERE id = ?", (dup[9], keeper_id))

            delete_ids.append(dup_id)

        # Merge notes
        if merged_notes_parts:
            new_notes = keeper_notes
            for part in merged_notes_parts:
                if new_notes:
                    new_notes += '\n--- (birleştirilen kayıt notu) ---\n' + part
                else:
                    new_notes = part
            c.execute("UPDATE customers SET sales_notes = ? WHERE id = ?", (new_notes, keeper_id))

        # Delete duplicates
        for did in delete_ids:
            c.execute("DELETE FROM customers WHERE id = ?", (did,))
            total_deleted += 1

        total_merged += 1
        if total_merged <= 15:
            print(f"  ✓ Merged group: '{keeper[1][:60]}' — kept ID {keeper_id}, deleted IDs {delete_ids}")

    if total_merged > 15:
        print(f"  ... and {total_merged - 15} more groups")

    stats['duplicate_groups_merged'] = total_merged
    stats['duplicate_records_deleted'] = total_deleted
    print(f"  Total: {total_merged} groups merged, {total_deleted} duplicate records deleted")

    conn.commit()

    # ─────────────────────────────────────────────────
    # FINAL SUMMARY
    # ─────────────────────────────────────────────────
    print("\n" + "=" * 70)
    print("  FINAL SUMMARY")
    print("=" * 70)

    c.execute("SELECT COUNT(*) FROM customers")
    final_count = c.fetchone()[0]

    c.execute("SELECT COUNT(DISTINCT sector) FROM customers WHERE sector IS NOT NULL")
    sector_count = c.fetchone()[0]

    c.execute("SELECT DISTINCT sector FROM customers WHERE sector IS NOT NULL ORDER BY sector")
    final_sectors = [r[0] for r in c.fetchall()]

    c.execute("SELECT city, COUNT(*) FROM customers WHERE city IS NOT NULL AND city != 'Bilinmiyor' GROUP BY city ORDER BY COUNT(*) DESC")
    city_dist = c.fetchall()

    c.execute("SELECT COUNT(*) FROM customers WHERE city IS NULL OR city = 'Bilinmiyor' OR TRIM(city) = ''")
    still_unknown = c.fetchone()[0]

    print(f"""
  Records deleted (null name):          {stats.get('deleted_null', 0)}
  Records deleted (Bilinmeyen):         {stats.get('deleted_bilinmeyen', 0)}
  Records deleted (ŞUBESİ junk):        {stats.get('deleted_subesi', 0)}
  Address-in-sector fixed:              {stats.get('fixed_address_sectors', 0)}
  Junk company names cleaned:           {stats.get('fixed_junk_names', 0)}
  Sector records normalized:            {stats.get('sectors_normalized', 0)}
  City case fixed (samsun→Samsun):      {stats.get('city_case_fixed', 0)}
  Cities inferred from text:            {stats.get('city_inferred', 0)}
  Duplicate groups merged:              {stats.get('duplicate_groups_merged', 0)}
  Duplicate records deleted:            {stats.get('duplicate_records_deleted', 0)}

  Final record count:                   {final_count}
  Final distinct sectors ({sector_count}):""")

    for s in final_sectors:
        c.execute("SELECT COUNT(*) FROM customers WHERE sector = ?", (s,))
        cnt = c.fetchone()[0]
        print(f"    • {s} ({cnt})")

    print(f"\n  City distribution:")
    for city, cnt in city_dist:
        print(f"    • {city}: {cnt}")
    print(f"    • Still unknown: {still_unknown}")

    print("\n" + "=" * 70)
    print("  DATA QUALITY FIX COMPLETE ✓")
    print("=" * 70)

    conn.close()


if __name__ == '__main__':
    main()
