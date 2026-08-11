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

def get_key_words(name):
    n = turkish_lower(name)
    words = re.findall(r'[a-zçğıöşü]{4,}', n)
    stops = {'sanayi','ticaret','limited','şirketi','anonim','ithalat','ihracat',
             'imalat','üretim','pazarlama','hizmetleri','malzemeleri','maddeleri',
             'ürünleri','sistemleri','taşımacılık','müh','gıda','inşaat','tekstil'}
    return [w for w in words if w not in stops]

# Fetch all customers
c.execute("SELECT id, company_name, phone, email, city, sector, source FROM customers WHERE is_active=1")
all_customers = c.fetchall()
cust_map = {row[0]: row for row in all_customers}

# Group by exact normalized name
exact_groups = defaultdict(list)
for row in all_customers:
    norm = normalize_name(row[1])
    exact_groups[norm].append(row)

# Filter out groups with only 1 customer
exact_dups = {k: v for k, v in exact_groups.items() if len(v) >= 2}

# Group by similar words (sharing first 2 significant words)
similar_groups = defaultdict(list)
for row in all_customers:
    words = get_key_words(row[1])
    if len(words) >= 2:
        key = ' '.join(words[:2])
        similar_groups[key].append(row)

similar_dups = {}
for key, rows in similar_groups.items():
    if len(rows) >= 2:
        # Avoid duplication with exact dups
        norms = set(normalize_name(r[1]) for r in rows)
        if len(norms) > 1:
            similar_dups[key] = rows

# Phone duplicates
phone_groups = defaultdict(list)
for row in all_customers:
    if row[2]:
        norm_phone = re.sub(r'[^\d]', '', row[2])[-10:]
        if len(norm_phone) >= 10:
            phone_groups[norm_phone].append(row)
phone_dups = {k: v for k, v in phone_groups.items() if len(v) >= 2}

# Get all contacts in customer_contacts
c.execute("""
    SELECT id, customer_id, contact_name, role, phone, email, notes
    FROM customer_contacts
""")
all_contacts = c.fetchall()

# Map customer_id to their contacts
cust_contacts = defaultdict(list)
for cc in all_contacts:
    cust_contacts[cc[1]].append(cc)

report_lines = []
report_lines.append("# Mükerrer Firmalar ve Çalışanları Raporu")
report_lines.append("Bu rapor, sistemdeki mükerrer/benzer firma kayıtlarını ve bu firmalara tanımlanmış olan çalışanların (irtibat kişilerinin) listesini içerir.\n")

# Section 1: Exact name duplicates
report_lines.append("## 1. Aynı İsimli (Mükerrer) Firma Grupları ve Çalışanları")
report_lines.append("Aşağıdaki gruplarda, normalize edilmiş isimleri birebir aynı olan firmalar listelenmiştir.\n")

exact_count = 0
for norm, rows in sorted(exact_dups.items(), key=lambda x: len(x[1]), reverse=True):
    # Check if any customer in this group has contacts in customer_contacts or contact info in customer itself
    has_any_contacts = False
    group_contacts = []
    for r in rows:
        cid = r[0]
        if cid in cust_contacts:
            has_any_contacts = True
            group_contacts.extend(cust_contacts[cid])
    
    exact_count += 1
    report_lines.append(f"### Grup {exact_count}: {rows[0][1].strip()}")
    report_lines.append("| ID | Firma Adı | Şehir | Kaynak | Telefon (Firma) | E-posta (Firma) |")
    report_lines.append("|---|---|---|---|---|---|")
    for r in rows:
        cid, name, phone, email, city, sector, source = r
        phone_str = phone or "-"
        email_str = email or "-"
        city_str = city or "-"
        report_lines.append(f"| {cid} | {name} | {city_str} | {source} | {phone_str} | {email_str} |")
    
    if group_contacts:
        report_lines.append("\n**Bu Firmalardaki Tanımlı Çalışanlar / İrtibat Kişileri:**")
        report_lines.append("| İrtibat ID | İlgili Firma ID | Çalışan Adı | Rol / Görev | Telefon | E-posta | Notlar |")
        report_lines.append("|---|---|---|---|---|---|---|")
        for cc in group_contacts:
            cc_id, cc_cust_id, cc_name, cc_role, cc_phone, cc_email, cc_notes = cc
            role_str = cc_role or "-"
            phone_str = cc_phone or "-"
            email_str = cc_email or "-"
            notes_str = cc_notes or "-"
            report_lines.append(f"| {cc_id} | {cc_cust_id} | {cc_name} | {role_str} | {phone_str} | {email_str} | {notes_str} |")
    else:
        report_lines.append("\n*Bu gruptaki firmalara ait `customer_contacts` tablosunda kayıtlı çalışan bulunamadı.*")
    report_lines.append("\n" + "---" + "\n")

# Section 2: Similar name duplicates that have contacts
report_lines.append("## 2. Benzer İsimli Firma Grupları ve Çalışanları")
report_lines.append("Aşağıdaki gruplarda, isimleri benzer olan (ilk iki anlamlı kelimesi ortak olan) ve **en az bir çalışan kaydı barındıran** firmalar listelenmiştir.\n")

similar_count = 0
for key, rows in sorted(similar_dups.items(), key=lambda x: len(x[1]), reverse=True):
    # Check if there are any contacts in this group
    group_contacts = []
    for r in rows:
        cid = r[0]
        if cid in cust_contacts:
            group_contacts.extend(cust_contacts[cid])
            
    if not group_contacts:
        continue  # Only list similar groups with actual contacts to keep the report concise and useful
        
    similar_count += 1
    report_lines.append(f"### Benzer Grup {similar_count}: \"{key.upper()}\"")
    report_lines.append("| ID | Firma Adı | Şehir | Kaynak | Telefon (Firma) | E-posta (Firma) |")
    report_lines.append("|---|---|---|---|---|---|")
    for r in rows:
        cid, name, phone, email, city, sector, source = r
        phone_str = phone or "-"
        email_str = email or "-"
        city_str = city or "-"
        report_lines.append(f"| {cid} | {name} | {city_str} | {source} | {phone_str} | {email_str} |")
    
    report_lines.append("\n**Bu Firmalardaki Tanımlı Çalışanlar / İrtibat Kişileri:**")
    report_lines.append("| İrtibat ID | İlgili Firma ID | Çalışan Adı | Rol / Görev | Telefon | E-posta | Notlar |")
    report_lines.append("|---|---|---|---|---|---|---|")
    for cc in group_contacts:
        cc_id, cc_cust_id, cc_name, cc_role, cc_phone, cc_email, cc_notes = cc
        role_str = cc_role or "-"
        phone_str = cc_phone or "-"
        email_str = cc_email or "-"
        notes_str = cc_notes or "-"
        report_lines.append(f"| {cc_id} | {cc_cust_id} | {cc_name} | {role_str} | {phone_str} | {email_str} | {notes_str} |")
    report_lines.append("\n" + "---" + "\n")

# Section 3: Phone duplicates with contacts
report_lines.append("## 3. Aynı Telefon Numarasına Sahip Farklı İsimli Firmalar")
report_lines.append("Aşağıdaki gruplarda, telefon numaraları aynı olan fakat firma isimleri farklı olan kayıtlar listelenmiştir.\n")

phone_count = 0
for phone, rows in phone_dups.items():
    group_contacts = []
    for r in rows:
        cid = r[0]
        if cid in cust_contacts:
            group_contacts.extend(cust_contacts[cid])
            
    phone_count += 1
    report_lines.append(f"### Telefon Grubu {phone_count}: {rows[0][2]}")
    report_lines.append("| ID | Firma Adı | Şehir | Kaynak | Telefon | E-posta |")
    report_lines.append("|---|---|---|---|---|---|")
    for r in rows:
        cid, name, phone_val, email, city, sector, source = r
        phone_str = phone_val or "-"
        email_str = email or "-"
        city_str = city or "-"
        report_lines.append(f"| {cid} | {name} | {city_str} | {source} | {phone_str} | {email_str} |")
        
    if group_contacts:
        report_lines.append("\n**Bu Firmalardaki Tanımlı Çalışanlar / İrtibat Kişileri:**")
        report_lines.append("| İrtibat ID | İlgili Firma ID | Çalışan Adı | Rol / Görev | Telefon | E-posta | Notlar |")
        report_lines.append("|---|---|---|---|---|---|---|")
        for cc in group_contacts:
            cc_id, cc_cust_id, cc_name, cc_role, cc_phone, cc_email, cc_notes = cc
            role_str = cc_role or "-"
            phone_str = cc_phone or "-"
            email_str = cc_email or "-"
            notes_str = cc_notes or "-"
            report_lines.append(f"| {cc_id} | {cc_cust_id} | {cc_name} | {role_str} | {phone_str} | {email_str} | {notes_str} |")
    else:
        report_lines.append("\n*Bu gruptaki firmalara ait `customer_contacts` tablosunda kayıtlı çalışan bulunamadı.*")
    report_lines.append("\n" + "---" + "\n")

# Write report to markdown file
report_path = os.path.join(os.path.dirname(__file__), 'mükerrer_firma_calisanlari.md')
with open(report_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(report_lines))

print(f"Report generated successfully at: {report_path}")
conn.close()
