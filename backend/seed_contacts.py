"""
Gruplama analizinden bulunan kişileri customer_contacts tablosuna ekle.
Her firma grubu için CRM eşleşmesi varsa o firmaya contact olarak kaydet.
"""
import sqlite3, json, sys, os, re
sys.stdout.reconfigure(encoding='utf-8')

DB = os.path.join(os.path.dirname(__file__), 'iveco_crm.db')
GROUPS = os.path.join(os.path.dirname(__file__), 'contact_groups.json')

with open(GROUPS, 'r', encoding='utf-8') as f:
    data = json.load(f)

conn = sqlite3.connect(DB)
cursor = conn.cursor()

# Mevcut contactları kontrol et (duplikat eklemeye)
cursor.execute("SELECT customer_id, phone FROM customer_contacts")
existing = set()
for row in cursor.fetchall():
    if row[1]:
        existing.add((row[0], re.sub(r'[^\d]', '', row[1])[-10:]))

added = 0
skipped = 0

print("=" * 70)
print("  REHBER KİŞİLERİ → CUSTOMER_CONTACTS AKTARIMI")
print("=" * 70)

for group in data['groups']:
    cid = group.get('crm_customer_id')
    if not cid:
        continue
    
    cname = group.get('crm_customer_name', '?')
    
    for person in group['people']:
        phone = person.get('phone', '')
        phone_norm = re.sub(r'[^\d]', '', phone)[-10:]
        
        # Duplikat kontrolü
        if (cid, phone_norm) in existing:
            skipped += 1
            continue
        
        # İsimden firma kelimelerini çıkarıp kişi adını bul
        name = person['name']
        role = person.get('role', None)
        
        try:
            cursor.execute("""
                INSERT INTO customer_contacts (customer_id, contact_name, role, phone, notes, is_primary, created_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            """, (cid, name, role, phone, f"Rehberden otomatik aktarım", 0))
            
            existing.add((cid, phone_norm))
            added += 1
            print(f"  ✅ [{cid}] {cname[:30]:<30s} ← {name[:30]:<30s} ({role or '-'})")
        except Exception as e:
            print(f"  ❌ Hata: {e}")

conn.commit()

print(f"\n{'='*70}")
print(f"  Eklenen: {added}")
print(f"  Atlanan (duplikat): {skipped}")
print(f"{'='*70}")

# Kontrol
cursor.execute("SELECT COUNT(*) FROM customer_contacts")
total = cursor.fetchone()[0]
cursor.execute("SELECT COUNT(DISTINCT customer_id) FROM customer_contacts")
firms = cursor.fetchone()[0]
print(f"\n  Toplam contact: {total}")
print(f"  Toplam firma:   {firms}")

conn.close()
