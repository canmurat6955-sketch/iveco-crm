import sqlite3
conn = sqlite3.connect('iveco_crm.db')
cur = conn.cursor()
tables = cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print("=== TABLOLAR ===")
for t in tables:
    print(t[0])
print()
print("=== KAYIT SAYILARI ===")
for t in tables:
    count = cur.execute(f'SELECT COUNT(*) FROM [{t[0]}]').fetchone()[0]
    print(f"  {t[0]}: {count}")
print()
# Customer detay
print("=== MÜŞTERI ŞEHIR DAGILIMI ===")
rows = cur.execute("SELECT city, COUNT(*) as cnt FROM customers WHERE is_active=1 GROUP BY city ORDER BY cnt DESC").fetchall()
for city, cnt in rows:
    print(f"  {city}: {cnt}")
print()
print("=== MÜŞTERI SEGMENT DAGILIMI ===")
rows = cur.execute("SELECT segment, COUNT(*) FROM customers WHERE is_active=1 GROUP BY segment ORDER BY segment").fetchall()
for seg, cnt in rows:
    print(f"  {seg}: {cnt}")
print()
print("=== MÜŞTERI KAYNAK DAGILIMI ===")
rows = cur.execute("SELECT source, COUNT(*) FROM customers WHERE is_active=1 GROUP BY source ORDER BY source").fetchall()
for src, cnt in rows:
    print(f"  {src}: {cnt}")
print()
print("=== DISCOVERY DURUM ===")
rows = cur.execute("SELECT status, COUNT(*) FROM discovered_companies GROUP BY status").fetchall()
for st, cnt in rows:
    print(f"  {st}: {cnt}")
conn.close()
