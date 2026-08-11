"""
VCF rehber + CRM analizi: Aynı firmaya ait kişileri grupla.
Patron, şoför, muhasebeci gibi aynı firmadan birden fazla kişi bul.
"""
import sys, os, re, json, sqlite3
from collections import defaultdict
sys.stdout.reconfigure(encoding='utf-8')

DB_PATH = os.path.join(os.path.dirname(__file__), 'iveco_crm.db')
VCF_PATH = os.path.join(os.path.dirname(__file__), 'uploads', 'contacts.vcf')

# Rol kelimeleri
ROL_WORDS = {
    'patron': 'Patron', 'sahibi': 'Sahip', 'sahip': 'Sahip', 'owner': 'Sahip',
    'müdür': 'Müdür', 'müdürü': 'Müdür', 'manager': 'Müdür', 'yönetici': 'Yönetici',
    'muhasebeci': 'Muhasebe', 'muhasebe': 'Muhasebe', 'mali': 'Muhasebe',
    'şoför': 'Şoför', 'şöför': 'Şoför', 'sürücü': 'Şoför', 'driver': 'Şoför',
    'sekreter': 'Sekreter', 'asistan': 'Asistan', 'destek': 'Destek',
    'satış': 'Satış', 'pazarlama': 'Pazarlama', 'sales': 'Satış',
    'mühendis': 'Mühendis', 'teknisyen': 'Teknisyen', 'usta': 'Usta',
    'şef': 'Şef', 'chef': 'Şef', 'yetkili': 'Yetkili', 'sorumlu': 'Sorumlu',
    'eleman': 'Eleman', 'çalışan': 'Çalışan', 'personel': 'Personel',
    'oğlu': 'Aile', 'kardeş': 'Aile', 'abi': 'Aile', 'abla': 'Aile',
    'baba': 'Aile', 'dayı': 'Aile', 'amca': 'Aile',
}

def turkish_lower(t):
    return t.replace('İ', 'i').replace('I', 'ı').lower()

def normalize_phone(phone):
    phone = re.sub(r'[^\d]', '', phone)
    if phone.startswith('90') and len(phone) == 12:
        return phone
    if phone.startswith('0') and len(phone) == 11:
        return '90' + phone[1:]
    if len(phone) == 10:
        return '90' + phone
    return phone

def format_phone(phone):
    n = normalize_phone(phone)
    if len(n) == 12 and n.startswith('90'):
        return f"0{n[2:5]} {n[5:8]} {n[8:10]} {n[10:]}"
    return phone

def parse_vcf(filepath):
    contacts = []
    current = {}
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        for line in f:
            line = line.strip()
            if line == 'BEGIN:VCARD':
                current = {'name': '', 'org': '', 'phones': []}
            elif line == 'END:VCARD':
                if current.get('name') or current.get('org'):
                    contacts.append(current)
                current = {}
            elif line.startswith('FN:') or line.startswith('FN;'):
                current['name'] = line.split(':', 1)[1].strip()
            elif line.startswith('ORG:') or line.startswith('ORG;'):
                current['org'] = line.split(':', 1)[1].strip().rstrip(';')
            elif line.startswith('TEL') and ':' in line:
                phone = line.split(':', 1)[1].strip()
                phone = re.sub(r'[^\d+]', '', phone)
                if len(phone) >= 7:
                    current['phones'].append(phone)
    return contacts

# Firma anahtar kelimeler
FIRMA_KEYWORDS = [
    'nakliyat', 'nakliye', 'lojistik', 'taşımacılık', 'transport',
    'inşaat', 'insaat', 'yapı', 'yapi', 'hafriyat', 'beton',
    'tarım', 'tarim', 'hayvancılık', 'çiftlik', 'yem',
    'gıda', 'gida', 'market', 'süt', 'et',
    'petrol', 'akaryakıt', 'benzin', 'opet',
    'otomotiv', 'oto', 'galeri', 'lastik', 'traktör',
    'tekstil', 'konfeksiyon', 'kumaş',
    'mobilya', 'ahşap', 'kereste',
    'demir', 'çelik', 'metal', 'sac',
    'elektrik', 'enerji', 'solar',
    'makine', 'makina', 'pompa',
    'eczane', 'ilaç', 'medikal',
    'otel', 'turizm', 'restoran',
    'sigorta', 'banka',
    'ticaret', 'sanayi', 'pazarlama', 'taahhüt',
    'ltd', 'şti', 'a.ş', 'limited',
    'kooperatif', 'dernek',
]

def extract_firma(name):
    """İsimden firma adı anahtar kelimelerini çıkar."""
    words = turkish_lower(name).split()
    firma_parts = []
    for w in words:
        w_clean = re.sub(r'[^a-zçğıöşü0-9]', '', w)
        if w_clean in FIRMA_KEYWORDS or any(kw in w_clean for kw in FIRMA_KEYWORDS if len(kw) >= 4):
            firma_parts.append(w_clean)
    return firma_parts

def extract_role(name):
    """İsimden rol bilgisi çıkar."""
    for word in turkish_lower(name).split():
        word_clean = re.sub(r'[^a-zçğıöşü]', '', word)
        if word_clean in ROL_WORDS:
            return ROL_WORDS[word_clean]
    return None

# ─── ANA ANALİZ ───
contacts = parse_vcf(VCF_PATH)
contacts_with_phone = [c for c in contacts if c['phones']]

# Telefon deduplicate
seen_phones = set()
unique_contacts = []
for c in contacts_with_phone:
    norm = normalize_phone(c['phones'][0])
    if norm not in seen_phones:
        seen_phones.add(norm)
        unique_contacts.append(c)

print("=" * 70)
print("  FİRMA KİŞİ GRUPLAMA ANALİZİ")
print("=" * 70)
print(f"  VCF benzersiz telefonlu: {len(unique_contacts)}")

# CRM müşterilerini yükle
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
cursor.execute("SELECT id, company_name, phone, sector, city FROM customers WHERE is_active=1")
crm_customers = cursor.fetchall()

# CRM telefon → müşteri mapping
crm_phone_map = {}
for cid, cname, cphone, csector, ccity in crm_customers:
    if cphone:
        crm_phone_map[normalize_phone(re.sub(r'[^\d+]', '', cphone))] = {
            'id': cid, 'name': cname, 'sector': csector, 'city': ccity
        }

# Strateji 1: Aynı firma kelimesi + farklı kişi adları olan VCF kişilerini grupla
firma_groups = defaultdict(list)

for c in unique_contacts:
    name = c['name']
    firma_words = extract_firma(name)
    role = extract_role(name)
    
    if not firma_words:
        continue
    
    # Firma anahtar kelimelerinden bir key oluştur
    # Ama sadece firma kelimesi değil, bağlam da önemli (örn. "Özcan Yapı" vs "Emek Yapı")
    # İsimdeki firma-olmayan kelimeleri de dahil et
    name_lower = turkish_lower(name)
    all_words = re.findall(r'[a-zçğıöşü]{3,}', name_lower)
    
    # Firma adı = firma kelimeleri + hemen önceki anlamlı kelime
    firma_key_parts = []
    for i, w in enumerate(all_words):
        w_clean = re.sub(r'[^a-zçğıöşü0-9]', '', w)
        if w_clean in FIRMA_KEYWORDS or any(kw in w_clean for kw in FIRMA_KEYWORDS if len(kw) >= 4):
            # Bu kelime + önceki kelime
            if i > 0:
                firma_key_parts.append(all_words[i-1])
            firma_key_parts.append(w_clean)
    
    firma_key = ' '.join(sorted(set(firma_key_parts)))
    if len(firma_key) < 5:
        continue
    
    firma_groups[firma_key].append({
        'name': name,
        'phone': format_phone(c['phones'][0]),
        'norm_phone': normalize_phone(c['phones'][0]),
        'role': role,
        'org': c.get('org', ''),
    })

# Sadece 2+ kişili grupları al
multi_groups = {k: v for k, v in firma_groups.items() if len(v) >= 2}

# Strateji 2: CRM müşterisi ile eşleştir
results = []
for firma_key, people in sorted(multi_groups.items(), key=lambda x: len(x[1]), reverse=True):
    # CRM'de bu firma var mı?
    crm_match = None
    for person in people:
        if person['norm_phone'] in crm_phone_map:
            crm_match = crm_phone_map[person['norm_phone']]
            break
    
    # CRM eşleşmesi yoksa isim bazlı ara
    if not crm_match:
        key_words = set(firma_key.split())
        for cid, cname, cphone, csector, ccity in crm_customers:
            crm_words = set(re.findall(r'[a-zçğıöşü]{4,}', turkish_lower(cname)))
            overlap = key_words & crm_words
            if len(overlap) >= 2 or (len(overlap) == 1 and len(list(overlap)[0]) >= 6):
                crm_match = {'id': cid, 'name': cname, 'sector': csector, 'city': ccity}
                break
    
    results.append({
        'firma_key': firma_key,
        'people': people,
        'crm_match': crm_match,
    })

# Sonuçları göster
print(f"\n  Firma grupları (2+ kişi): {len(multi_groups)}")
print(f"  CRM eşleşmeli:           {sum(1 for r in results if r['crm_match'])}")

print(f"\n{'─'*70}")
print("  FİRMA GRUPLARI")
print(f"{'─'*70}")

for r in results[:60]:
    crm = r['crm_match']
    if crm:
        print(f"\n  🏢 CRM: {crm['name'][:50]} (ID:{crm['id']}, {crm.get('city','')})")
    else:
        print(f"\n  🆕 YENİ FİRMA: {r['firma_key']}")
    
    for p in r['people']:
        role_str = f" [{p['role']}]" if p['role'] else ""
        in_crm = "📌" if p['norm_phone'] in crm_phone_map else "  "
        print(f"  {in_crm} {p['name'][:40]:<40s} | {p['phone']}{role_str}")

# JSON rapor
report = {
    'total_groups': len(results),
    'crm_matched': sum(1 for r in results if r['crm_match']),
    'groups': []
}

for r in results:
    group = {
        'firma_key': r['firma_key'],
        'crm_customer_id': r['crm_match']['id'] if r['crm_match'] else None,
        'crm_customer_name': r['crm_match']['name'] if r['crm_match'] else None,
        'people': r['people'],
    }
    report['groups'].append(group)

report_path = os.path.join(os.path.dirname(__file__), 'contact_groups.json')
with open(report_path, 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print(f"\n  📄 Rapor: {report_path}")

conn.close()
print(f"\n{'='*70}\n")
