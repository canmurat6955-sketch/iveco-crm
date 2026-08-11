import sqlite3
conn = sqlite3.connect('iveco_crm.db')
cur = conn.cursor()
cur.execute("SELECT COUNT(*) FROM customers WHERE city = 'Sinop'")
sinop = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM customers")
total = cur.fetchone()[0]
print(f"Sinop: {sinop} / Toplam: {total}")
cur.execute("SELECT company_name, sector, segment, potential_score FROM customers WHERE city = 'Sinop' LIMIT 10")
for r in cur.fetchall():
    print(f"  {r[0][:50]:50s} | {r[1]:25s} | {r[2]} | {r[3]}")
cur.execute("SELECT source, COUNT(*) as cnt FROM customers WHERE city = 'Sinop' GROUP BY source")
print("\nKaynak dagilimi:")
for r in cur.fetchall():
    print(f"  {r[0]}: {r[1]}")
conn.close()
