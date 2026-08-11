"""SQLite ile dogrudan CRM veri analizi"""
import sqlite3, sys, os
sys.stdout.reconfigure(encoding='utf-8')

db_path = os.path.join(os.path.dirname(__file__), 'iveco_crm.db')
conn = sqlite3.connect(db_path)
c = conn.cursor()

print("=" * 70)
print("  IVECO CRM - VERİ KALİTESİ ANALİZİ")
print("=" * 70)

# 1. Genel
c.execute("SELECT COUNT(*) FROM customers")
total = c.fetchone()[0]
c.execute("SELECT COUNT(*) FROM customers WHERE phone IS NULL OR phone=''")
no_phone = c.fetchone()[0]
print(f"\n  Toplam müşteri:  {total}")
print(f"  Telefonlu:       {total - no_phone}")
print(f"  Telefonsuz:      {no_phone}")

# 2. Kaynak dağılımı
print(f"\n{'='*70}")
print("  KAYNAK DAĞILIMI")
print(f"{'='*70}")
c.execute("SELECT COALESCE(source,'(bos)'), COUNT(*) FROM customers GROUP BY source ORDER BY COUNT(*) DESC")
for r in c.fetchall():
    print(f"  {r[0]:<25s} {r[1]:>5d}")

# 3. Pipeline dağılımı
print(f"\n{'='*70}")
print("  PIPELINE DURUMU")
print(f"{'='*70}")
c.execute("SELECT COALESCE(pipeline_stage,'(bos)'), COUNT(*) FROM customers GROUP BY pipeline_stage ORDER BY COUNT(*) DESC")
for r in c.fetchall():
    print(f"  {r[0]:<25s} {r[1]:>5d}")

# 4. Kirli data analizi
print(f"\n{'='*70}")
print("  KİRLİ DATA ANALİZİ")
print(f"{'='*70}")

# Tek kelimelik
c.execute("SELECT COUNT(*) FROM customers WHERE company_name NOT LIKE '% %'")
single = c.fetchone()[0]
print(f"\n  Tek kelimelik isimler: {single}")

# Kısa isimler
c.execute("SELECT COUNT(*) FROM customers WHERE LENGTH(company_name) < 10")
short = c.fetchone()[0]
print(f"  Kısa isimler (<10 kar): {short}")

# Duplikat telefon
c.execute("SELECT COUNT(*) FROM (SELECT phone FROM customers WHERE phone IS NOT NULL AND phone != '' GROUP BY phone HAVING COUNT(*) > 1)")
dup_phone = c.fetchone()[0]
print(f"  Duplikat telefon: {dup_phone} numara")

# Rehberden gelen ama eşleşmemiş
c.execute("SELECT COUNT(*) FROM customers WHERE source='contact_import'")
from_contact = c.fetchone()[0]
print(f"  Rehberden import: {from_contact}")

c.execute("SELECT COUNT(*) FROM customers WHERE source='contact_import' AND (sector IS NULL OR sector='Diger')")
unknown = c.fetchone()[0]
print(f"  Sektörü belirsiz: {unknown}")

# 5. Tek kelimelik isim örnekleri
print(f"\n{'='*70}")
print("  TEK KELİMELİK İSİM ÖRNEKLERİ")
print(f"{'='*70}")
c.execute("SELECT id, company_name, phone, source FROM customers WHERE company_name NOT LIKE '% %' LIMIT 25")
for r in c.fetchall():
    print(f"  [{r[0]:>5d}] {r[1]:<30s} | {(r[2] or '-'):<16s} | {r[3] or '-'}")

# 6. Duplikat telefon örnekleri
print(f"\n{'='*70}")
print("  DUPLİKAT TELEFON ÖRNEKLERİ")
print(f"{'='*70}")
c.execute("""
    SELECT phone, COUNT(*) as cnt 
    FROM customers 
    WHERE phone IS NOT NULL AND phone != '' 
    GROUP BY phone 
    HAVING cnt > 1 
    ORDER BY cnt DESC 
    LIMIT 15
""")
dup_phones = c.fetchall()
for phone, cnt in dup_phones:
    c.execute("SELECT id, company_name, source FROM customers WHERE phone=?", (phone,))
    rows = c.fetchall()
    names = " / ".join([f"{r[1][:30]}({r[2]})" for r in rows])
    print(f"  {phone:<18s} [{cnt} kayit] {names}")

# 7. Rehberden import - örnekler
print(f"\n{'='*70}")
print("  REHBERDEN GELEN KAYITLAR (contact_import)")
print(f"{'='*70}")
c.execute("""
    SELECT id, company_name, phone, sector, sales_notes 
    FROM customers 
    WHERE source='contact_import' 
    ORDER BY id 
    LIMIT 30
""")
for r in c.fetchall():
    notes = (r[4] or '')[:60]
    print(f"  [{r[0]:>5d}] {r[1][:45]:<45s} | {(r[2] or '-'):<16s} | {r[3] or '-'}")
    if notes:
        print(f"         Not: {notes}")

# 8. Eşleşme potansiyeli olan kayıtlar
# Rehber kişilerin isimlerinde firma ibareleri var mı?
print(f"\n{'='*70}")
print("  EŞLEŞTİRME POTANSİYELİ - Rehber vs CRM")
print(f"{'='*70}")

# contact_import kaynaklı isimlerden, CRM'deki mevcut firmalara benzer olanlar
c.execute("SELECT id, company_name, phone FROM customers WHERE source='contact_import'")
contact_rows = c.fetchall()

c.execute("SELECT id, company_name, phone FROM customers WHERE source != 'contact_import'")
crm_rows = c.fetchall()

print(f"  Rehberden gelen: {len(contact_rows)}")
print(f"  CRM mevcut:      {len(crm_rows)}")

# Basit kelime eşleştirmesi
import re
def get_words(name):
    name = name.upper()
    for w in ['LTD', 'AŞ', 'ŞTİ', 'LİMİTED', 'ŞİRKETİ', 'ANONİM', 'SANAYİ', 'TİCARET', 'VE']:
        name = name.replace(w, '')
    return set(re.findall(r'[A-ZÇĞİÖŞÜ]{3,}', name))

potential_matches = []
for cid, cname, cphone in contact_rows:
    contact_words = get_words(cname)
    if not contact_words:
        continue
    for rid, rname, rphone in crm_rows:
        crm_words = get_words(rname)
        if not crm_words:
            continue
        common = contact_words & crm_words
        if len(common) >= 2:
            score = len(common) / max(len(contact_words), len(crm_words))
            if score >= 0.4:
                potential_matches.append((score, cname, rname, cphone, rphone, common))

potential_matches.sort(reverse=True)
print(f"\n  Potansiyel yeni eşleşmeler: {len(potential_matches)}")
for score, cname, rname, cphone, rphone, common in potential_matches[:25]:
    print(f"  [{score:.2f}] Rehber: {cname[:35]:<35s} <-> CRM: {rname[:35]}")
    print(f"         Tel: {(cphone or '-'):<16s}     Tel: {(rphone or '-')}")
    print(f"         Ortak: {', '.join(common)}")

conn.close()
print(f"\n{'='*70}")
