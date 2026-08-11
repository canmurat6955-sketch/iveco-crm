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

# Expanded set of stop words for highly accurate duplicate detection
STOPS = {
    # Common business endings and types
    'sanayi','ticaret','limited','şirketi','anonim','ithalat','ihracat','ith','ihr',
    'imalat','üretim','pazarlama','hizmetleri','malzemeleri','maddeleri',
    'ürünleri','sistemleri','taşımacılık','müh','gıda','inşaat','tekstil','ltd','sti','şti',
    'veya','grup','beyi','hanim','yeri','naks','nak','subesi','şubesi','şube','sube',
    'serbest','bölgesi','bolgesi','ortakligi','ortaklığı',
    
    # Generic industries
    'nakliye','nakliyat','lojistik','tasimacilik','taşımacılık','otomotiv','oto','motor',
    'galeri','un','irmik','tarim','tarım','petrol','beton','hazir','hazır','kum','cakil',
    'çakıl','madencilik','mermer','insaat','inşaat','taahhut','taahhüt','turizm',
    'giyim','ayakkabi','deri','mobilya','mobilyaci','mobilyacı','ahsap','ahşap','kagit',
    'kağıt','ambalaj','koli','plastik','kaucuk','kauçuk','kimya','ilac','ilaç','metal',
    'demir','celik','çelik','dokum','döküm','makina','makine','techizat','teçhizat',
    'elektrik','elektronik','aydinlatma','aydınlatma','kablo','enerji','su','gaz',
    'atik','atık','cevre','çevre','dış','iç','ihracatçi','ihracatçı','ithalatçi',
    'ithalatçı',

    # Cities and Districts (Common database noise)
    'samsun','corum','çorum','sinop','tokat','amasya','ordu','kavak','bafra','tekkeköy',
    'tekkekoy','vezirköprü','vezirkopru','erfelek','atakum','çarşamba','carsamba',
    'adana','alaçam','alacam','ordu','gerze','ayancık','ayancik','boyabat','duragan',
    'durağan','saraydüzü','sarayduzu','turhal','erbaa','niksar','zile','reşadiye',
    'resadiye','almus','pazar','yeşilyurt','yesilyurt','artova','sulusaray','başçiftlik',
    'basciftlik',
    
    # Very generic terms
    'garanti','bankasi','bankası','yapı','yapi','kredi','uluslararasi','uluslararası',
    'belgesi','rehberim','rehberi','ve','ile', 'yeni', 'eski', 'abi', 'bey', 'hanım', 
    'is', 'iş', 'telefonu', 'no', 'tel'
}

def get_significant_words(name):
    n = normalize_name(name)
    words = re.findall(r'[a-zçğıöşü]{3,}', n)
    return [w for w in words if w not in STOPS]

c.execute("SELECT id, company_name, phone, email, city, sector, source FROM customers WHERE is_active=1")
all_customers = c.fetchall()
cust_map = {r[0]: r for r in all_customers}

c.execute("""
    SELECT id, customer_id, contact_name, role, phone, email, notes
    FROM customer_contacts
""")
all_contacts = c.fetchall()

cust_contacts = defaultdict(list)
for cc in all_contacts:
    cust_contacts[cc[1]].append(cc)

print(f"Total contacts: {len(all_contacts)}")
print(f"Total active customers: {len(all_customers)}")

used_customer_ids = set()
flexible_groups = []

# Process customers that HAVE contacts first
for cid, contacts in cust_contacts.items():
    if cid in used_customer_ids:
        continue
    if cid not in cust_map:
        continue
        
    cust = cust_map[cid]
    name = cust[1]
    norm = normalize_name(name)
    sig_words = get_significant_words(name)
    
    group = [cust]
    for ocust in all_customers:
        ocid = ocust[0]
        if ocid == cid:
            continue
        oname = ocust[1]
        onorm = normalize_name(oname)
        osig_words = get_significant_words(oname)
        
        is_dup = False
        # Match 1: Normalized names match exactly
        if norm == onorm:
            is_dup = True
        # Match 2: Substring match (if not too generic, one contains the other and length of shorter is >= 5)
        elif len(norm) >= 5 and len(onorm) >= 5:
            # Check if one is a substring of the other and they share a significant word
            if (norm in onorm or onorm in norm) and any(w in osig_words for w in sig_words):
                is_dup = True
        # Match 3: Share at least 2 significant words of length >= 3
        elif len(sig_words) >= 2 and len(osig_words) >= 2:
            common = set(sig_words).intersection(osig_words)
            if len(common) >= 2:
                is_dup = True
        # Match 4: Special case when both names contain a unique name token (e.g. "Armutçuoğlu")
        elif len(sig_words) == 1 and len(osig_words) == 1 and sig_words[0] == osig_words[0] and len(sig_words[0]) >= 6:
            is_dup = True
                
        if is_dup:
            group.append(ocust)
            
    if len(group) >= 2:
        flexible_groups.append(group)
        for g in group:
            used_customer_ids.add(g[0])

print(f"Flexible duplicate groups with contacts: {len(flexible_groups)}")
for i, grp in enumerate(flexible_groups):
    print(f"\nGroup {i+1}:")
    for r in grp:
        print(f"  ID {r[0]}: '{r[1]}' (Contacts: {len(cust_contacts[r[0]])})")

conn.close()
