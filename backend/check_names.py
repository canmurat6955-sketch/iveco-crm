import sqlite3
conn = sqlite3.connect('iveco_crm.db')
cur = conn.cursor()

# Check Sinop company names that start with legal suffixes
cur.execute("""
    SELECT id, company_name FROM customers 
    WHERE source = 'sinop_tso' 
    ORDER BY id
    LIMIT 50
""")
rows = cur.fetchall()

print("=== İLK 50 SİNOP FİRMASI ===\n")
for r in rows:
    print(f"  [{r[0]:4d}] {r[1]}")

# Count how many start with common suffixes
prefixes = [
    'LİMİTED ŞİRKETİ',
    'ANONİM ŞİRKETİ',
    'TİCARET LİMİTED',
    'İNŞAAT TAAHHÜT',
    'TİCARET VE SANAYİ',
    'REKLAM SANAYİ',
    'PAZARLAMA VE TİCARET',
    'TİCARET ANONİM',
    'SANAYİ VE TİCARET',
    'SANAYİ TİCARET',
]

print("\n=== BAŞTA YANLIŞ ŞİRKET TİPİ OLANLAR ===\n")
for prefix in prefixes:
    cur.execute(f"SELECT COUNT(*) FROM customers WHERE source='sinop_tso' AND company_name LIKE '{prefix}%'")
    cnt = cur.fetchone()[0]
    if cnt > 0:
        print(f"  '{prefix}...' ile başlayan: {cnt}")
        cur.execute(f"SELECT company_name FROM customers WHERE source='sinop_tso' AND company_name LIKE '{prefix}%' LIMIT 3")
        for r in cur.fetchall():
            print(f"    → {r[0][:80]}")

conn.close()
