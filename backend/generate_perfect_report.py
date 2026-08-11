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

# Fetch all customers
c.execute("SELECT id, company_name, phone, email, city, sector, source FROM customers WHERE is_active=1")
all_customers = c.fetchall()
cust_map = {row[0]: row for row in all_customers}

# Group by exact normalized name for Section 2
exact_groups = defaultdict(list)
for row in all_customers:
    norm = normalize_name(row[1])
    exact_groups[norm].append(row)

exact_dups = {k: v for k, v in exact_groups.items() if len(v) >= 2}

# Get all contacts in customer_contacts
c.execute("""
    SELECT id, customer_id, contact_name, role, phone, email, notes
    FROM customer_contacts
""")
all_contacts = c.fetchall()

# Map customer_id to contacts
cust_contacts = defaultdict(list)
for cc in all_contacts:
    cust_contacts[cc[1]].append(cc)

# Find flexible duplicate groups for customers with contacts
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
        elif len(norm) >= 5 and len(onorm) >= 5 and (norm in onorm or onorm in norm) and any(w in osig_words for w in sig_words):
            is_dup = True
        # Match 3: Share at least 2 significant words of length >= 3
        elif len(sig_words) >= 2 and len(osig_words) >= 2 and len(set(sig_words).intersection(osig_words)) >= 2:
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

# Prepare report contents
report_lines = []
report_lines.append("# Mükerrer Firma Kayıtları ve İlgili Çalışanlar Raporu")
report_lines.append("Bu rapor, sistemdeki mükerrer/benzer firma kayıtlarını ve bu firmalarda tanımlı olan çalışanları (irtibat kişilerini) listeler. Birleştirme işlemlerini kolaylaştırmak için tüm ilişkili ID'ler ve iletişim bilgileri gruplanmıştır.\n")

report_lines.append("## Özet İstatistikler")
report_lines.append(f"- **Toplam Aktif Firma:** {len(all_customers)}")
report_lines.append(f"- **Toplam Çalışan / İrtibat Kişisi (Contacts):** {len(all_contacts)}")
report_lines.append(f"- **Çalışanı Olan Mükerrer/Benzer Firma Grubu Sayısı:** {len(flexible_groups)}")
report_lines.append(f"- **Çalışanı Olmayan Birebir Aynı İsimli Firma Grubu Sayısı:** {len(exact_dups)}\n")

report_lines.append("---")
report_lines.append("## BÖLÜM 1: Çalışan Barındıran Mükerrer/Benzer Firma Grupları")
report_lines.append("Bu bölümdeki firma gruplarında **en az bir kayıtlı çalışan** (`customer_contacts`) bulunmaktadır. Birleştirme yaparken bu çalışan kayıtlarının kaybolmaması için hedef ana firmaya taşınması gerekir.\n")

for i, grp in enumerate(flexible_groups):
    # Find all contacts in this group
    grp_contacts = []
    for r in grp:
        cid = r[0]
        if cid in cust_contacts:
            grp_contacts.extend(cust_contacts[cid])
            
    # Group header based on primary company name
    group_name = grp[0][1].strip()
    report_lines.append(f"### 📁 Grup {i+1}: {group_name}")
    
    # List companies in this group
    report_lines.append("\n**Gruptaki Firma Kayıtları:**")
    report_lines.append("| ID | Firma Adı | Şehir | Kaynak | Telefon (Firma) | E-posta (Firma) |")
    report_lines.append("| :--- | :--- | :--- | :--- | :--- | :--- |")
    for r in grp:
        cid, name, phone, email, city, sector, source = r
        phone_str = phone or "-"
        email_str = email or "-"
        city_str = city or "-"
        report_lines.append(f"| **{cid}** | {name} | {city_str} | {source} | {phone_str} | {email_str} |")
        
    # List contacts in this group
    report_lines.append("\n**Bu Firmalara Ait Çalışanlar / İrtibat Kişileri:**")
    report_lines.append("| İrtibat ID | Bağlı Olduğu Firma ID | Çalışan Adı | Rol / Görev | Telefon | E-posta | Notlar |")
    report_lines.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- |")
    for cc in grp_contacts:
        cc_id, cc_cust_id, cc_name, cc_role, cc_phone, cc_email, cc_notes = cc
        role_str = cc_role or "-"
        phone_str = cc_phone or "-"
        email_str = cc_email or "-"
        notes_str = cc_notes or "-"
        report_lines.append(f"| {cc_id} | **{cc_cust_id}** | **{cc_name}** | {role_str} | {phone_str} | {email_str} | {notes_str} |")
        
    report_lines.append("\n" + "---" + "\n")

report_lines.append("## BÖLÜM 2: Çalışanı Olmayan Birebir Aynı İsimli Firma Grupları")
report_lines.append("Bu bölümdeki firma gruplarında `customer_contacts` tablosuna kayıtlı çalışan bulunmamaktadır. Ancak firma isimleri birebir aynı veya çok benzer olduğundan, kayıtların tek bir çatı altında birleştirilmesi ve firma detaylarındaki telefon/e-postaların birleştirilen kayda aktarılması önerilir.\n")

exact_count = 0
for norm, rows in sorted(exact_dups.items(), key=lambda x: len(x[1]), reverse=True):
    # Check if any customer in this exact group was already processed in Section 1
    # if so, skip to avoid duplicate listings
    if any(r[0] in used_customer_ids for r in rows):
        continue
        
    exact_count += 1
    group_name = rows[0][1].strip()
    report_lines.append(f"### 📁 Grup {exact_count}: {group_name}")
    report_lines.append("| ID | Firma Adı | Şehir | Kaynak | Telefon (Firma) | E-posta (Firma) |")
    report_lines.append("| :--- | :--- | :--- | :--- | :--- | :--- |")
    for r in rows:
        cid, name, phone, email, city, sector, source = r
        phone_str = phone or "-"
        email_str = email or "-"
        city_str = city or "-"
        report_lines.append(f"| **{cid}** | {name} | {city_str} | {source} | {phone_str} | {email_str} |")
    report_lines.append("\n*Bu gruptaki firmalara ait `customer_contacts` tablosunda kayıtlı çalışan bulunmamaktadır.*\n")
    report_lines.append("\n" + "---" + "\n")

# Write report to markdown file
report_path = os.path.join(os.path.dirname(__file__), 'mükerrer_firma_calisanlari.md')
with open(report_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(report_lines))

print(f"Perfect report generated successfully at: {report_path}")
conn.close()
