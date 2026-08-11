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

c.execute("SELECT id, company_name, phone, email, city, sector, source FROM customers")
all_customers = c.fetchall()

norm_groups = defaultdict(list)
for cust in all_customers:
    norm = normalize_name(cust[1])
    norm_groups[norm].append(cust)

exact_dups = {k: v for k, v in norm_groups.items() if len(v) >= 2}

print("=== EXACT DUPLICATE GROUPS IN CUSTOMERS TABLE ===")
for norm, custs in sorted(exact_dups.items(), key=lambda x: len(x[1]), reverse=True)[:15]:
    print(f"\nGroup: {norm} ({len(custs)} entries)")
    for cust in custs:
        cid, name, phone, email, city, sector, source = cust
        print(f"  ID: {cid} | Name: {name} | Phone: {phone} | Email: {email} | City: {city} | Source: {source}")
        
        # Check contacts for this customer
        c.execute("SELECT id, contact_name, role, phone, email FROM customer_contacts WHERE customer_id=?", (cid,))
        contacts = c.fetchall()
        for cc in contacts:
            print(f"    -> Contact: ID {cc[0]} | Name: {cc[1]} | Role: {cc[2]} | Phone: {cc[3]} | Email: {cc[4]}")

conn.close()
