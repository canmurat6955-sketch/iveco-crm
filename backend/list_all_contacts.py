import sqlite3
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

DB = os.path.join(os.path.dirname(__file__), 'iveco_crm.db')
conn = sqlite3.connect(DB)
c = conn.cursor()

c.execute("""
    SELECT cc.id, cc.customer_id, cc.contact_name, cc.role, cc.phone, cc.email, c.company_name
    FROM customer_contacts cc
    JOIN customers c ON cc.customer_id = c.id
    ORDER BY c.company_name
""")
contacts = c.fetchall()

print(f"Total contacts in database: {len(contacts)}")
for cc in contacts:
    print(f"ID: {cc[0]} | CustomerID: {cc[1]} | Company: {cc[6]} | Name: {cc[2]} | Role: {cc[3]} | Phone: {cc[4]} | Email: {cc[5]}")

conn.close()
