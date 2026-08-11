import sqlite3
import os
import re

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

c.execute("SELECT id, company_name FROM customers WHERE is_active=1")
all_custs = c.fetchall()

# Check for specific IDs
target_ids = [3154, 3158, 3165, 489, 3189, 3206, 3216, 3223, 3409, 3239, 3426, 3457, 3300, 3674, 3446, 3404, 3463, 3361, 133, 3294, 3371]

for tid in target_ids:
    c.execute("SELECT company_name FROM customers WHERE id=?", (tid,))
    res = c.fetchone()
    if not res:
        print(f"ID {tid} not found!")
        continue
    name = res[0]
    norm = normalize_name(name)
    
    # Find matching customers
    matches = []
    for cid, cname in all_custs:
        if cid == tid:
            continue
        cnorm = normalize_name(cname)
        if cnorm == norm or (len(norm) > 4 and norm in cnorm) or (len(cnorm) > 4 and cnorm in norm):
            matches.append((cid, cname))
            
    if matches:
        print(f"\nTarget ID {tid}: '{name}' (Normalized: '{norm}') has potential duplicates:")
        for mcid, mcname in matches:
            print(f"  - ID {mcid}: '{mcname}'")
    else:
        # Check if there are matches on first two words
        words = re.findall(r'[a-zçğıöşü]{4,}', turkish_lower(name))
        # Remove stop words
        stops = {'sanayi','ticaret','limited','şirketi','anonim','ithalat','ihracat',
                 'imalat','üretim','pazarlama','hizmetleri','malzemeleri','maddeleri',
                 'ürünleri','sistemleri','taşımacılık','müh','gıda','inşaat','tekstil'}
        meaningful = [w for w in words if w not in stops]
        if len(meaningful) >= 2:
            key = ' '.join(meaningful[:2])
            word_matches = []
            for cid, cname in all_custs:
                if cid == tid:
                    continue
                cwords = re.findall(r'[a-zçğıöşü]{4,}', turkish_lower(cname))
                cmeaningful = [w for w in cwords if w not in stops]
                if len(cmeaningful) >= 2 and ' '.join(cmeaningful[:2]) == key:
                    word_matches.append((cid, cname))
            if word_matches:
                print(f"\nTarget ID {tid}: '{name}' has word matches on key '{key}':")
                for mcid, mcname in word_matches:
                    print(f"  - ID {mcid}: '{mcname}'")

conn.close()
