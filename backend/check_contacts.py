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

# Fetch all contacts with their company names
c.execute("""
    SELECT cc.id, cc.customer_id, cc.contact_name, cc.role, cc.phone, cc.email, c.company_name
    FROM customer_contacts cc
    JOIN customers c ON cc.customer_id = c.id
""")
all_contacts = c.fetchall()

print(f"Total contacts in database: {len(all_contacts)}")

# Let's check which companies have these contacts, and see if any of their company names normalize to the same name
# as some OTHER company in the customers table.
# To do this, let's normalize all company names in the database.
c.execute("SELECT id, company_name FROM customers WHERE is_active=1")
all_customers = c.fetchall()

norm_to_custs = defaultdict(list)
for cust in all_customers:
    norm = normalize_name(cust[1])
    norm_to_custs[norm].append(cust)

# Find all duplicate name groups (len >= 2)
duplicate_norms = {k: v for k, v in norm_to_custs.items() if len(v) >= 2}
print(f"Duplicate norms count: {len(duplicate_norms)}")

# For each contact, let's check if their company name is in duplicate_norms
contacts_in_duplicates = []
for contact in all_contacts:
    cc_id, cust_id, contact_name, role, phone, email, company_name = contact
    norm_co = normalize_name(company_name)
    if norm_co in duplicate_norms:
        contacts_in_duplicates.append(contact)

print(f"Contacts belonging to EXACT duplicate company name groups: {len(contacts_in_duplicates)}")

# Let's check SIMILAR matches (get_key_words based)
def get_key_words(name, min_len=4):
    n = turkish_lower(name)
    words = re.findall(r'[a-zçğıöşü]{4,}', n)
    stops = {'sanayi','ticaret','limited','şirketi','anonim','ithalat','ihracat',
             'imalat','üretim','pazarlama','hizmetleri','malzemeleri','maddeleri',
             'ürünleri','sistemleri','taşımacılık','müh','gıda','inşaat','tekstil'}
    return [w for w in words if w not in stops]

word_groups = defaultdict(list)
for row in all_customers:
    words = get_key_words(row[1])
    if len(words) >= 2:
        key = ' '.join(words[:2])
        word_groups[key].append(row)

similar_matches = {}
for key, rows in word_groups.items():
    if len(rows) >= 2:
        norms = set(normalize_name(r[1]) for r in rows)
        if len(norms) > 1:
            similar_matches[key] = rows

print(f"Similar duplicate groups count: {len(similar_matches)}")

contacts_in_similar = []
for contact in all_contacts:
    cc_id, cust_id, contact_name, role, phone, email, company_name = contact
    # See if company belongs to any of similar_matches
    for key, rows in similar_matches.items():
        if any(r[0] == cust_id for r in rows):
            contacts_in_similar.append((key, contact))

print(f"Contacts belonging to SIMILAR duplicate company name groups: {len(contacts_in_similar)}")

conn.close()
