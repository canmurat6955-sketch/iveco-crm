import sqlite3
import os

DB = os.path.join(os.path.dirname(__file__), 'iveco_crm.db')
conn = sqlite3.connect(DB)
c = conn.cursor()

c.execute("SELECT count(*) FROM customers")
cust_count = c.fetchone()[0]

c.execute("SELECT count(*) FROM customer_contacts")
contact_count = c.fetchone()[0]

print(f"Total Customers: {cust_count}")
print(f"Total Contacts: {contact_count}")

conn.close()
