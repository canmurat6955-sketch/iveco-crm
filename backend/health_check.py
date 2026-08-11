"""CRM veri sağlık kontrolü - temizleme sonrası"""
import sqlite3, sys, os, re
from collections import Counter
sys.stdout.reconfigure(encoding='utf-8')

DB = os.path.join(os.path.dirname(__file__), 'iveco_crm.db')
conn = sqlite3.connect(DB)
c = conn.cursor()

print("=" * 70)
print("  CRM VERİ SAĞLIK KONTROLÜ")
print("=" * 70)

# 1. Genel
c.execute("SELECT COUNT(*) FROM customers")
total = c.fetchone()[0]
c.execute("SELECT COUNT(*) FROM customers WHERE phone IS NOT NULL AND phone != ''")
tel = c.fetchone()[0]
print(f"\n  Toplam:     {total}")
print(f"  Telefonlu:  {tel} (%{100*tel//total})")
print(f"  Telefonsuz: {total-tel}")

# 2. SORUN 1: Duplikat firma isimleri
print(f"\n{'='*70}")
print("  SORUN 1: DUPLİKAT FİRMA İSİMLERİ")
print(f"{'='*70}")
c.execute("""
    SELECT UPPER(TRIM(company_name)), COUNT(*) as cnt 
    FROM customers 
    GROUP BY UPPER(TRIM(company_name)) 
    HAVING cnt > 1 
    ORDER BY cnt DESC
    LIMIT 20
""")
dup_names = c.fetchall()
c.execute("""
    SELECT COUNT(*) FROM (
        SELECT UPPER(TRIM(company_name)) as n, COUNT(*) as cnt 
        FROM customers GROUP BY n HAVING cnt > 1
    )
""")
total_dup_names = c.fetchone()[0]
print(f"  Toplam duplikat isim: {total_dup_names}")
for name, cnt in dup_names:
    c.execute("SELECT id, phone, source FROM customers WHERE UPPER(TRIM(company_name))=?", (name,))
    rows = c.fetchall()
    sources = [f"{r[2]}({'T' if r[1] else '-'})" for r in rows]
    print(f"  x{cnt} {name[:50]:<50s} | {', '.join(sources)}")

# 3. SORUN 2: Telefon numarası format sorunları
print(f"\n{'='*70}")
print("  SORUN 2: TELEFON FORMAT SORUNLARI")
print(f"{'='*70}")
c.execute("SELECT id, company_name, phone FROM customers WHERE phone IS NOT NULL AND phone != ''")
phone_issues = []
for rid, rname, rphone in c.fetchall():
    clean = re.sub(r'[^\d]', '', rphone)
    if len(clean) < 10:
        phone_issues.append((rid, rname, rphone, 'çok kısa'))
    elif len(clean) > 12:
        phone_issues.append((rid, rname, rphone, 'çok uzun'))
    elif not re.match(r'^0\d{3} \d{3} \d{2} \d{2}$', rphone) and not rphone.startswith('+'):
        phone_issues.append((rid, rname, rphone, 'format bozuk'))

print(f"  Format sorunu olan: {len(phone_issues)}")
for rid, rname, rphone, issue in phone_issues[:15]:
    print(f"  [{rid:>5d}] {rname[:35]:<35s} | {rphone:<20s} | {issue}")

# 4. SORUN 3: Eksik/garip firma isimleri
print(f"\n{'='*70}")
print("  SORUN 3: SORUNLU FİRMA İSİMLERİ")
print(f"{'='*70}")

# Çok kısa
c.execute("SELECT id, company_name, source FROM customers WHERE LENGTH(TRIM(company_name)) < 5")
short = c.fetchall()
print(f"\n  Çok kısa isimler (<5 karakter): {len(short)}")
for r in short:
    print(f"  [{r[0]:>5d}] '{r[1]}' | {r[2]}")

# Tek kelimelik
c.execute("""
    SELECT id, company_name, phone, source FROM customers 
    WHERE TRIM(company_name) NOT LIKE '% %'
    AND LENGTH(TRIM(company_name)) >= 5
""")
single = c.fetchall()
print(f"\n  Tek kelimelik isimler: {len(single)}")
for r in single[:10]:
    print(f"  [{r[0]:>5d}] {r[1]:<25s} | {(r[2] or '-'):<16s} | {r[3]}")

# "ŞUBESİ" gibi anlamsız isimler
c.execute("""
    SELECT id, company_name, source FROM customers 
    WHERE UPPER(company_name) IN ('ŞUBESİ', 'MERKEZ', 'ŞUBE', 'TEST')
       OR company_name LIKE '%test%'
""")
junk = c.fetchall()
print(f"\n  Anlamsız/test kayıtlar: {len(junk)}")
for r in junk:
    print(f"  [{r[0]:>5d}] '{r[1]}' | {r[2]}")

# 5. SORUN 4: Sektör dağılımı ve eksikler
print(f"\n{'='*70}")
print("  SORUN 4: SEKTÖR DURUMU")
print(f"{'='*70}")
c.execute("""
    SELECT COALESCE(sector, '(bos)'), COUNT(*) FROM customers 
    GROUP BY COALESCE(sector, '(bos)') 
    ORDER BY COUNT(*) DESC
""")
for s, cnt in c.fetchall():
    bar = "█" * (cnt // 30)
    print(f"  {s:<30s} {cnt:>5d} {bar}")

# 6. SORUN 5: Şehir bilgisi eksik/yanlış
print(f"\n{'='*70}")
print("  SORUN 5: ŞEHİR BİLGİSİ")
print(f"{'='*70}")
c.execute("""
    SELECT COALESCE(city, '(bos)'), COUNT(*) FROM customers 
    GROUP BY COALESCE(city, '(bos)') 
    ORDER BY COUNT(*) DESC
""")
for ci, cnt in c.fetchall():
    print(f"  {ci:<25s} {cnt:>5d}")

# 7. SORUN 6: contact_import kirli isimler - hala sorunlu olanlar
print(f"\n{'='*70}")
print("  SORUN 6: REHBER KAYITLARI KALİTE")
print(f"{'='*70}")
c.execute("""
    SELECT id, company_name, phone, sector FROM customers 
    WHERE source IN ('contact_import', 'contact_import_v2')
    ORDER BY id
""")
contact_rows = c.fetchall()
print(f"  Toplam rehber kaydı: {len(contact_rows)}")

# Sektör dağılımı
contact_sectors = Counter()
for r in contact_rows:
    contact_sectors[r[3] or '(bos)'] += 1
print(f"\n  Sektör dağılımı:")
for s, cnt in contact_sectors.most_common():
    print(f"    {s:<25s} {cnt:>4d}")

# 8. SORUN 7: Duplikat telefon numaraları (hala var mı?)
print(f"\n{'='*70}")
print("  SORUN 7: KALAN DUPLİKAT TELEFONLAR")
print(f"{'='*70}")
c.execute("""
    SELECT phone, COUNT(*) as cnt FROM customers 
    WHERE phone IS NOT NULL AND phone != '' 
    GROUP BY phone HAVING cnt > 1
    ORDER BY cnt DESC
""")
remaining_dups = c.fetchall()
print(f"  Kalan duplikat telefon: {len(remaining_dups)}")
for ph, cnt in remaining_dups[:10]:
    c.execute("SELECT id, company_name, source FROM customers WHERE phone=?", (ph,))
    rows = c.fetchall()
    names = " / ".join([f"{r[1][:25]}({r[2]})" for r in rows])
    print(f"  {ph:<18s} x{cnt} | {names}")

# 9. Genel skor
print(f"\n{'='*70}")
print("  VERİ KALİTESİ SKORU")
print(f"{'='*70}")
score = 100
penalties = []

if total_dup_names > 0:
    p = min(total_dup_names, 20)
    score -= p
    penalties.append(f"Duplikat isimler: -{p} ({total_dup_names} adet)")

if len(phone_issues) > 0:
    p = min(len(phone_issues) // 5, 10)
    score -= p
    penalties.append(f"Telefon format: -{p} ({len(phone_issues)} adet)")

if len(short) + len(junk) > 0:
    p = min(len(short) + len(junk), 5)
    score -= p
    penalties.append(f"Sorunlu isimler: -{p}")

no_sector = sum(1 for r in contact_rows if not r[3] or r[3] == 'Diğer')
if no_sector > 50:
    p = 5
    score -= p
    penalties.append(f"Sektör eksik: -{p} ({no_sector} adet)")

if len(remaining_dups) > 0:
    p = min(len(remaining_dups) * 2, 15)
    score -= p
    penalties.append(f"Duplikat telefon: -{p} ({len(remaining_dups)} adet)")

phone_pct = 100 * tel // total
if phone_pct < 40:
    p = 10
    score -= p
    penalties.append(f"Telefon oranı düşük: -{p} (%{phone_pct})")

print(f"\n  Skor: {max(score,0)}/100")
for pen in penalties:
    print(f"  ⚠️  {pen}")

conn.close()
print(f"\n{'='*70}\n")
