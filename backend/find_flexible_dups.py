import sqlite3
import os
import re
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

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

def get_significant_words(name):
    n = normalize_name(name)
    words = re.findall(r'[a-zçğıöşü]{3,}', n)
    stops = {'sanayi','ticaret','limited','şirketi','anonim','ithalat','ihracat',
             'imalat','üretim','pazarlama','hizmetleri','malzemeleri','maddeleri',
             'ürünleri','sistemleri','taşımacılık','müh','gıda','inşaat','tekstil',
             'veya','grup','beyi','hanim','yeri','naks','nak'}
    return [w for w in words if w not in stops]

c.execute("SELECT id, company_name, phone, email, city, sector, source FROM customers WHERE is_active=1")
all_customers = c.fetchall()

# Map customer ID to customer row
cust_map = {r[0]: r for r in all_customers}

# Fetch all contacts in customer_contacts
c.execute("""
    SELECT id, customer_id, contact_name, role, phone, email, notes
    FROM customer_contacts
""")
all_contacts = c.fetchall()

# Map customer_id to contacts
cust_contacts = defaultdict(list)
for cc in all_contacts:
    cust_contacts[cc[1]].append(cc)

print(f"Total contacts: {len(all_contacts)}")
print(f"Total active customers: {len(all_customers)}")

# Let's group all duplicate companies and find associated contacts
# First, exact duplicates
exact_groups = defaultdict(list)
for row in all_customers:
    norm = normalize_name(row[1])
    exact_groups[norm].append(row)

exact_dups = {k: v for k, v in exact_groups.items() if len(v) >= 2}
print(f"Exact duplicate groups: {len(exact_dups)}")

# Let's find flexible duplicates for each customer that HAS contacts
used_customer_ids = set()
flexible_groups = []

for cid, contacts in cust_contacts.items():
    if cid in used_customer_ids:
        continue
    if cid not in cust_map:
        continue
        
    cust = cust_map[cid]
    name = cust[1]
    norm = normalize_name(name)
    sig_words = get_significant_words(name)
    
    # Find all matches in all_customers
    group = [cust]
    for ocust in all_customers:
        ocid = ocust[0]
        if ocid == cid:
            continue
        oname = ocust[1]
        onorm = normalize_name(oname)
        
        is_dup = False
        # Match 1: Normalized names match exactly
        if norm == onorm:
            is_dup = True
        # Match 2: Substring match (one contains the other and length of shorter is >= 4)
        elif (len(norm) >= 4 and norm in onorm) or (len(onorm) >= 4 and onorm in norm):
            is_dup = True
        # Match 3: Share at least 2 significant words of length >= 3
        elif len(sig_words) >= 2:
            osig_words = get_significant_words(oname)
            common = set(sig_words).intersection(osig_words)
            if len(common) >= 2:
                is_dup = True
                
        if is_dup:
            group.append(ocust)
            
    if len(group) >= 2:
        # Save group
        flexible_groups.append(group)
        for g in group:
            used_customer_ids.add(g[0])

print(f"Flexible duplicate groups with contacts: {len(flexible_groups)}")
for i, grp in enumerate(flexible_groups):
    print(f"\nGroup {i+1}:")
    for r in grp:
        print(f"  ID {r[0]}: '{r[1]}' (Contacts: {len(cust_contacts[r[0]])})")

conn.close()
