import sqlite3
import os
import re
from collections import defaultdict

DB = os.path.join(os.path.dirname(__file__), 'iveco_crm.db')
conn = sqlite3.connect(DB)
c = conn.cursor()

def turkish_lower(t):
    return t.replace('İ','i').replace('I','ı').replace('Ö','ö').replace('Ü','ü').replace('Ş','ş').replace('Ç','ç').replace('Ğ','ğ').lower()

def normalize_name(name):
    n = turkish_lower(name.strip())
    for suffix in [' limited şirketi', ' ltd şti', ' ltd. şti.', ' ltd.şti.', ' san. ve tic.', 
                   ' san.ve tic.', ' sanayi ve ticaret', ' san. tic.', ' san.tic.',
                   ' anonim şirketi', ' a.ş.', ' a.ş', ' ltd', ' limited',
                   ' ithalat ihracat', ' ithalat', ' ihracat', ' ith. ihr.',
                   ' imalat', ' üretim', ' pazarlama', ' hizmetleri',
                   ' ticaret', ' sanayi', ' san.', ' tic.']:
        n = n.replace(suffix, '')
    n = re.sub(r'[^\w\s]', '', n)
    n = re.sub(r'\s+', ' ', n).strip()
    return n

c.execute("SELECT id, company_name, phone, email, city FROM customers WHERE is_active=1")
customers = c.fetchall()

# Map normalized name to list of customers
norm_groups = defaultdict(list)
for cust in customers:
    norm = normalize_name(cust[1])
    norm_groups[norm].append(cust)

# Find duplicates
exact_dups = {k: v for k, v in norm_groups.items() if len(v) >= 2}
print(f"Number of exact duplicate company name groups: {len(exact_dups)}")

# Let's see how many of these duplicate companies have contacts in customer_contacts
cust_ids_in_dups = []
for grp in exact_dups.values():
    for cust in grp:
        cust_ids_in_dups.append(cust[0])

placeholders = ','.join('?' for _ in cust_ids_in_dups)
c.execute(f"""
    SELECT cc.id, cc.customer_id, cc.contact_name, cc.role, cc.phone, cc.email, c.company_name
    FROM customer_contacts cc
    JOIN customers c ON cc.customer_id = c.id
    WHERE cc.customer_id IN ({placeholders})
""", cust_ids_in_dups)
contacts = c.fetchall()

print(f"Total contacts found for duplicate companies: {len(contacts)}")
for contact in contacts:
    print(f"Contact ID: {contact[0]} | Customer ID: {contact[1]} | Company: {contact[6]} | Name: {contact[2]} | Role: {contact[3]} | Phone: {contact[4]}")

conn.close()
