"""
IVECO CRM - MEGA REHBER EŞLEŞTİRME VE TEMİZLEME
==================================================
3 aşamalı veri temizleme:
  1. Telefon eşleştirme (VCF → CRM telefonsuz müşteriler)
  2. Akıllı isim parse (kirli rehber verisi → temiz alanlar)
  3. Duplikat temizliği
"""
import sys, os, re, json, sqlite3
from collections import defaultdict, Counter
from difflib import SequenceMatcher

sys.stdout.reconfigure(encoding='utf-8')

DB_PATH = os.path.join(os.path.dirname(__file__), 'iveco_crm.db')
VCF_PATH = os.path.join(os.path.dirname(__file__), 'uploads', 'contacts.vcf')

# ============================================================
#  TÜRKÇE NLP YARDIMCILARI
# ============================================================

# İl/ilçe listesi (Orta Karadeniz bölgesi ağırlıklı)
ILLER = {
    'samsun', 'sinop', 'ordu', 'amasya', 'tokat', 'çorum', 'giresun',
    'trabzon', 'rize', 'artvin', 'gümüşhane', 'bayburt', 'kastamonu',
    'ankara', 'istanbul', 'izmir', 'bursa', 'antalya', 'konya', 'sivas',
    'hatay', 'mersin', 'adana', 'gaziantep', 'kayseri', 'eskişehir',
}

ILCELER = {
    # Samsun
    'atakum', 'ilkadım', 'canik', 'tekkeköy', 'bafra', 'çarşamba', 'terme',
    'vezirköprü', 'havza', 'kavak', 'ladik', 'alaçam', 'yakakent', 'salıpazarı',
    'ayvacık', 'ondokuzmayıs', '19mayıs', 'asarcık',
    # Sinop
    'boyabat', 'ayancık', 'gerze', 'durağan', 'erfelek', 'dikmen', 'saraydüzü',
    'türkeli',
    # Amasya
    'merzifon', 'suluova', 'taşova', 'göynücek', 'gümüşhacıköy', 'hamamözü',
    # Ordu
    'ünye', 'fatsa', 'perşembe', 'altınordu', 'kumru', 'korgan', 'mesudiye',
    'gölköy', 'gülyalı', 'kabadüz', 'ulubey', 'akkuş', 'aybastı', 'çamaş',
    'çatalpınar', 'ikizce',
    # Tokat
    'erbaa', 'niksar', 'turhal', 'zile', 'pazar', 'almus', 'artova', 'başçiftlik',
    'reşadiye', 'sulusaray', 'yeşilyurt',
    # Çorum
    'sungurlu', 'osmancık', 'iskilip', 'alaca', 'bayat', 'kargı', 'mecitözü',
    'ortaköy', 'uğurludağ', 'dodurga', 'laçin', 'oğuzlar', 'boğazkale',
}

# Araç model/tip kelimeleri
ARAC_WORDS = {
    'daily', 'eurocargo', 'stralis', 'trakker', 'sway', 'tway', 'xway',
    'iveco', 'isuzu', 'ford', 'fiat', 'man', 'mercedes', 'scania', 'volvo',
    'panelvan', 'kamyon', 'kamyonet', 'tır', 'dorse', 'treyler', 'trailer',
    'pickup', 'cargo', 'npr', 'nqr', 'nkr', 'transit', 'ducato', 'boxer',
    'kabin', 'şasi', 'frigorifik', 'tenteli', 'damperi', 'damper', 'vinç',
    '4350', '3510', '35s', '70c', '65c', '35c', '150e21', '50c', 'bellona',
    'cargocar', 'lastik',
}

# CRM etiket kelimeleri (isimden çıkarılacak)
ETIKET_WORDS = {
    'müşteri', 'musteri', 'lead', 'aday', 'potansiyel', 'rehberim', 'rehber',
    'abi', 'abla', 'bey', 'hanım', 'dayım', 'amcam', 'abinin', 'hocam',
    'sahibinden', 'cep', 'telefon', 'iş', 'ev',
}

# Sektör kelimeleri
SEKTOR_MAP = {
    'nakliyat': 'Nakliyat / Lojistik', 'nakliye': 'Nakliyat / Lojistik',
    'lojistik': 'Nakliyat / Lojistik', 'taşımacılık': 'Nakliyat / Lojistik',
    'transport': 'Nakliyat / Lojistik', 'kargo': 'Nakliyat / Lojistik',
    'inşaat': 'İnşaat / Yapı', 'yapı': 'İnşaat / Yapı', 'hafriyat': 'İnşaat / Yapı',
    'beton': 'İnşaat / Yapı', 'çimento': 'İnşaat / Yapı',
    'tarım': 'Tarım / Hayvancılık', 'hayvancılık': 'Tarım / Hayvancılık',
    'çiftlik': 'Tarım / Hayvancılık', 'yem': 'Tarım / Hayvancılık',
    'gıda': 'Gıda / Tarım', 'market': 'Gıda / Tarım', 'süt': 'Gıda / Tarım',
    'petrol': 'Petrol / Enerji', 'akaryakıt': 'Petrol / Enerji',
    'benzin': 'Petrol / Enerji', 'opet': 'Petrol / Enerji',
    'otomotiv': 'Otomotiv', 'oto': 'Otomotiv', 'galeri': 'Otomotiv',
    'tekstil': 'Tekstil', 'konfeksiyon': 'Tekstil', 'kumaş': 'Tekstil',
    'mobilya': 'Mobilya / Ahşap', 'ahşap': 'Mobilya / Ahşap',
    'kereste': 'Mobilya / Ahşap',
    'demir': 'Metal / Demir Çelik', 'çelik': 'Metal / Demir Çelik',
    'metal': 'Metal / Demir Çelik', 'kaynak': 'Metal / Demir Çelik',
    'sac': 'Metal / Demir Çelik',
    'elektrik': 'Elektrik / Enerji', 'enerji': 'Elektrik / Enerji',
    'solar': 'Elektrik / Enerji',
    'makine': 'Makine / Ekipman', 'makina': 'Makine / Ekipman',
    'pompa': 'Makine / Ekipman',
    'eczane': 'Sağlık / İlaç', 'ilaç': 'Sağlık / İlaç', 'medikal': 'Sağlık / İlaç',
    'otel': 'Turizm / Konaklama', 'turizm': 'Turizm / Konaklama',
    'sigorta': 'Finans / Sigorta',
}

FIRMA_SUFFIXES = [
    'ltd', 'şti', 'a.ş', 'aş', 'limited', 'anonim', 'şirketi',
    'san.', 'tic.', 'sanayi', 'ticaret', 'taahhüt', 'pazarlama',
    'kooperatif', 'dernek',
]


def normalize_phone(phone):
    """Telefon numarasını 90XXXXXXXXXX formatına normalize et."""
    phone = re.sub(r'[^\d]', '', phone)
    if phone.startswith('90') and len(phone) == 12:
        return phone
    if phone.startswith('0') and len(phone) == 11:
        return '90' + phone[1:]
    if len(phone) == 10 and not phone.startswith('0'):
        return '90' + phone
    return phone


def format_phone(phone):
    """Normalize edilmiş telefonu 0XXX XXX XX XX formatına çevir."""
    norm = normalize_phone(phone)
    if len(norm) == 12 and norm.startswith('90'):
        return f"0{norm[2:5]} {norm[5:8]} {norm[8:10]} {norm[10:]}"
    return phone


def turkish_lower(text):
    """Türkçe küçük harf dönüşümü."""
    return text.replace('İ', 'i').replace('I', 'ı').lower()


def tokenize_name(text):
    """İsimden anlamlı tokenler çıkar, sektör/yasal ekleri temizle."""
    text = turkish_lower(text)
    # Yasal ekleri temizle
    for suffix in ['limited şirketi', 'anonim şirketi', 'san. ve tic.', 
                   'san. tic.', 'sanayi ve ticaret', 'ltd. şti.', 'ltd şti',
                   'a.ş.', 'ltd.']:
        text = text.replace(suffix, '')
    # Alfanumerik kelimeleri al
    words = re.findall(r'[a-zçğıöşü0-9]{2,}', text)
    # Çok yaygın dolgu kelimeleri çıkar
    stopwords = {'ve', 'ile', 'san', 'tic', 'ltd', 'aş', 'şti'}
    return [w for w in words if w not in stopwords]


def smart_parse_contact(name, org=''):
    """
    Kirli rehber ismini akıllı parse et.
    Returns: {person, company, vehicle, location, sector, tags}
    """
    result = {
        'person': '', 'company': '', 'vehicle': '',
        'location': '', 'sector': '', 'tags': [],
    }
    
    words = name.split()
    person_parts = []
    company_parts = []
    vehicle_parts = []
    location_parts = []
    tag_parts = []
    
    for word in words:
        wl = turkish_lower(word)
        wl_stripped = re.sub(r'[^a-zçğıöşü0-9]', '', wl)
        
        # Araç modeli mi?
        if wl_stripped in ARAC_WORDS or re.match(r'^\d{3,4}[a-z]?\d*$', wl_stripped):
            vehicle_parts.append(word)
        # İl mi?
        elif wl_stripped in ILLER:
            location_parts.append(word)
        # İlçe mi?
        elif wl_stripped in ILCELER:
            location_parts.append(word)
        # Etiket mi?
        elif wl_stripped in ETIKET_WORDS:
            tag_parts.append(word)
        # Sektör kelimesi mi?
        elif wl_stripped in SEKTOR_MAP:
            company_parts.append(word)
            if not result['sector']:
                result['sector'] = SEKTOR_MAP[wl_stripped]
        # Firma suffix mi?
        elif wl_stripped in {'ltd', 'şti', 'aş', 'limited', 'anonim', 'şirketi', 
                             'san', 'tic', 'sanayi', 'ticaret'}:
            company_parts.append(word)
        else:
            # Muhtemelen kişi adı parçası
            person_parts.append(word)
    
    # ORG alanı varsa firmayı oradan al
    if org and org.strip():
        result['company'] = org.strip()
    elif company_parts:
        # Firma kelimeleri + önceki kişi adı parçalarından firma oluştur
        result['company'] = ' '.join(person_parts + company_parts)
        person_parts = []  # firma olarak kullanıldıysa kişi adı boş
    
    result['person'] = ' '.join(person_parts)
    result['vehicle'] = ' '.join(vehicle_parts)
    result['location'] = ' '.join(location_parts)
    result['tags'] = tag_parts
    
    return result


# ============================================================
#  VCF OKUMA
# ============================================================

def parse_vcf(filepath):
    """VCF dosyasını oku ve kişileri döndür."""
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


def dedup_contacts(contacts):
    """Telefon numarasına göre kişileri deduplicate et."""
    seen = {}  # norm_phone -> contact
    result = []
    no_phone = []
    
    for c in contacts:
        if not c['phones']:
            no_phone.append(c)
            continue
        
        key = normalize_phone(c['phones'][0])
        if key not in seen:
            seen[key] = c
            result.append(c)
        # else: skip duplicate
    
    return result, len(contacts) - len(result) - len(no_phone)


# ============================================================
#  EŞLEŞTIRME MOTORU
# ============================================================

def build_crm_index(conn):
    """CRM müşterilerinden arama indeksi oluştur."""
    c = conn.cursor()
    c.execute("""
        SELECT id, company_name, phone, source, sector 
        FROM customers 
        WHERE is_active = 1
    """)
    
    customers = []
    phone_index = {}  # norm_phone -> customer_id
    word_index = defaultdict(set)  # word -> set of customer ids
    
    for row in c.fetchall():
        cid, cname, cphone, csource, csector = row
        cust = {
            'id': cid, 'name': cname, 'phone': cphone,
            'source': csource, 'sector': csector,
            'tokens': tokenize_name(cname),
        }
        customers.append(cust)
        
        # Telefon indeksi
        if cphone:
            norm = normalize_phone(re.sub(r'[^\d+]', '', cphone))
            phone_index[norm] = cid
        
        # Kelime indeksi
        for token in cust['tokens']:
            if len(token) >= 3:
                word_index[token].add(cid)
    
    return customers, phone_index, word_index


def score_match(contact_tokens, crm_tokens):
    """İki token listesi arasında gelişmiş skor hesapla."""
    if not contact_tokens or not crm_tokens:
        return 0.0, set()
    
    ct = set(contact_tokens)
    cr = set(crm_tokens)
    
    # Ortak kelimeler
    common = ct & cr
    if not common:
        return 0.0, set()
    
    # Jaccard
    jaccard = len(common) / len(ct | cr)
    
    # Önemli (uzun) kelimelerin eşleşme oranı
    imp_ct = {t for t in ct if len(t) >= 4}
    imp_cr = {t for t in cr if len(t) >= 4}
    if imp_ct and imp_cr:
        imp_match = len(imp_ct & imp_cr) / min(len(imp_ct), len(imp_cr))
    else:
        imp_match = 0
    
    # Fuzzy eşleşme (yakın yazılan kelimeler)
    fuzzy_bonus = 0
    for tw in ct - common:
        if len(tw) >= 4:
            for cw in cr - common:
                if len(cw) >= 4:
                    ratio = SequenceMatcher(None, tw, cw).ratio()
                    if ratio >= 0.80:
                        fuzzy_bonus += 0.1
                        common.add(f"{tw}~{cw}")
                        break
    
    score = jaccard * 0.3 + imp_match * 0.5 + min(fuzzy_bonus, 0.2) * 1.0
    
    # Bonus: çok uzun kelimelerin eşleşmesi (firma adı gibi)
    very_long = {t for t in common if len(t) >= 6 and '~' not in t}
    if very_long:
        score += 0.1 * min(len(very_long), 2)
    
    return min(score, 1.0), common


def find_best_match(contact, customers, phone_index, word_index):
    """Bir kişi için en iyi CRM eşleşmesini bul."""
    
    # Strateji 1: Telefon numarası eşleşmesi (en güvenilir)
    for phone in contact['phones']:
        norm = normalize_phone(phone)
        if norm in phone_index:
            cid = phone_index[norm]
            cust = next((c for c in customers if c['id'] == cid), None)
            if cust:
                return {
                    'customer_id': cid,
                    'customer_name': cust['name'],
                    'score': 1.0,
                    'method': 'phone_match',
                    'common': {'TELEFON'},
                }
    
    # Strateji 2: İsim eşleştirme
    search_text = f"{contact['name']} {contact.get('org', '')}"
    contact_tokens = tokenize_name(search_text)
    
    if not contact_tokens:
        return None
    
    # Aday havuzu oluştur (en az 1 ortak kelime)
    candidate_ids = set()
    for token in contact_tokens:
        if len(token) >= 3:
            candidate_ids.update(word_index.get(token, set()))
    
    if not candidate_ids:
        return None
    
    best = None
    best_score = 0
    
    for cid in candidate_ids:
        cust = next((c for c in customers if c['id'] == cid), None)
        if not cust:
            continue
        
        score, common = score_match(contact_tokens, cust['tokens'])
        
        if score > best_score and score >= 0.35:
            best_score = score
            best = {
                'customer_id': cid,
                'customer_name': cust['name'],
                'customer_phone': cust['phone'],
                'score': round(score, 3),
                'method': 'name_match',
                'common': common,
            }
    
    return best


# ============================================================
#  ANA İŞLEM
# ============================================================

def main():
    print("=" * 70)
    print("  IVECO CRM - MEGA VERİ TEMİZLEME VE EŞLEŞTİRME")
    print("=" * 70)
    
    # ---- AŞAMA 0: VCF oku ve temizle ----
    print(f"\n{'─'*70}")
    print("  AŞAMA 0: VCF OKUMA VE DEDUPLICATE")
    print(f"{'─'*70}")
    
    contacts = parse_vcf(VCF_PATH)
    print(f"  Ham kişi sayısı: {len(contacts)}")
    
    contacts_with_phone = [c for c in contacts if c['phones']]
    contacts_deduped, dup_count = dedup_contacts(contacts_with_phone)
    print(f"  Telefonlu:       {len(contacts_with_phone)}")
    print(f"  Deduplicate:     {len(contacts_deduped)} (çıkarılan: {dup_count})")
    
    # ---- AŞAMA 1: CRM ile eşleştirme ----
    print(f"\n{'─'*70}")
    print("  AŞAMA 1: CRM EŞLEŞTİRME")
    print(f"{'─'*70}")
    
    conn = sqlite3.connect(DB_PATH)
    customers, phone_index, word_index = build_crm_index(conn)
    
    no_phone_customers = [c for c in customers if not c['phone']]
    print(f"  CRM toplam:     {len(customers)}")
    print(f"  CRM telefonsuz: {len(no_phone_customers)}")
    print(f"  Kelime indeksi: {len(word_index)} kelime")
    print(f"\n  Eşleştirme başlıyor...")
    
    matches = []
    phone_matches = []
    name_matches_high = []
    name_matches_med = []
    unmatched = []
    
    for i, contact in enumerate(contacts_deduped):
        if i % 500 == 0 and i > 0:
            print(f"    ... {i}/{len(contacts_deduped)} işlendi")
        
        result = find_best_match(contact, customers, phone_index, word_index)
        
        if result:
            result['contact_name'] = contact['name']
            result['contact_org'] = contact.get('org', '')
            result['contact_phones'] = contact['phones']
            matches.append(result)
            
            if result['method'] == 'phone_match':
                phone_matches.append(result)
            elif result['score'] >= 0.60:
                name_matches_high.append(result)
            else:
                name_matches_med.append(result)
        else:
            unmatched.append(contact)
    
    print(f"\n  SONUÇLAR:")
    print(f"  ├─ Telefon eşleşmesi:  {len(phone_matches)}")
    print(f"  ├─ İsim yüksek (≥0.60): {len(name_matches_high)}")
    print(f"  ├─ İsim orta (0.35-0.59): {len(name_matches_med)}")
    print(f"  └─ Eşleşmesiz:         {len(unmatched)}")
    
    # ---- AŞAMA 2: Akıllı parse + Telefon atama ----
    print(f"\n{'─'*70}")
    print("  AŞAMA 2: TELEFON ATAMA (CRM GÜNCELLEME)")
    print(f"{'─'*70}")
    
    cursor = conn.cursor()
    updated_phone = 0
    updated_notes = 0
    skipped_already = 0
    skipped_conflict = 0
    
    # Sadece yüksek güven eşleşmeleri uygula
    apply_matches = phone_matches + name_matches_high
    
    for m in apply_matches:
        cid = m['customer_id']
        cursor.execute("SELECT phone, sales_notes FROM customers WHERE id=?", (cid,))
        row = cursor.fetchone()
        if not row:
            continue
        
        existing_phone, existing_notes = row
        new_phone = format_phone(m['contact_phones'][0])
        
        # Parse edilen bilgi
        parsed = smart_parse_contact(m['contact_name'], m.get('contact_org', ''))
        
        if not existing_phone or existing_phone.strip() == '':
            # Telefonsuz → telefon ata
            notes_parts = []
            if parsed['person']:
                notes_parts.append(f"İrtibat: {parsed['person']}")
            if parsed['vehicle']:
                notes_parts.append(f"Araç: {parsed['vehicle']}")
            if parsed['location']:
                notes_parts.append(f"Konum: {parsed['location']}")
            
            new_notes = existing_notes or ''
            if notes_parts:
                append = " | ".join(notes_parts)
                if append not in new_notes:
                    new_notes = f"{new_notes} | {append}".strip(' |')
            
            cursor.execute("""
                UPDATE customers 
                SET phone=?, sales_notes=?, updated_at=datetime('now')
                WHERE id=?
            """, (new_phone, new_notes, cid))
            updated_phone += 1
            
        elif normalize_phone(re.sub(r'[^\d+]', '', existing_phone)) == normalize_phone(m['contact_phones'][0]):
            # Aynı telefon zaten var → sadece irtibat bilgisi ekle
            if parsed['person']:
                new_notes = existing_notes or ''
                contact_note = f"İrtibat: {parsed['person']}"
                if contact_note not in new_notes:
                    new_notes = f"{new_notes} | {contact_note}".strip(' |')
                    cursor.execute("""
                        UPDATE customers 
                        SET sales_notes=?, updated_at=datetime('now')
                        WHERE id=?
                    """, (new_notes, cid))
                    updated_notes += 1
            skipped_already += 1
        else:
            # Farklı telefon var → çakışma, skip
            skipped_conflict += 1
    
    conn.commit()
    
    print(f"  ✅ Telefon atanan:   {updated_phone}")
    print(f"  📝 Not eklenen:     {updated_notes}")
    print(f"  ⏭️  Zaten telefonlu: {skipped_already}")
    print(f"  ⚠️  Çakışan telefon: {skipped_conflict}")
    
    # ---- AŞAMA 3: Eşleşmemiş firma kişileri → yeni CRM kaydı ----
    print(f"\n{'─'*70}")
    print("  AŞAMA 3: YENİ FİRMA KAYITLARI (Eşleşmemiş rehber)")  
    print(f"{'─'*70}")
    
    # Mevcut telefon numaralarını çek
    cursor.execute("SELECT phone FROM customers WHERE phone IS NOT NULL AND phone != ''")
    existing_phones = set()
    for row in cursor.fetchall():
        existing_phones.add(normalize_phone(re.sub(r'[^\d+]', '', row[0])))
    
    new_records = []
    for contact in unmatched:
        if not contact['phones']:
            continue
        
        norm_phone = normalize_phone(contact['phones'][0])
        if norm_phone in existing_phones:
            continue
        
        parsed = smart_parse_contact(contact['name'], contact.get('org', ''))
        
        # Firma ibaresi olan veya sektör bulunan kişileri ekle
        has_company = bool(parsed['company'])
        has_sector = bool(parsed['sector'])
        
        if has_company or has_sector:
            company_name = parsed['company'] or contact['name']
            phone = format_phone(contact['phones'][0])
            
            notes_parts = [f"Rehberden: {contact['name']}"]
            if parsed['person'] and parsed['company']:
                notes_parts.append(f"İrtibat: {parsed['person']}")
            if parsed['vehicle']:
                notes_parts.append(f"Araç: {parsed['vehicle']}")
            
            # Potansiyel seviyesi
            sector = parsed['sector'] or 'Diğer'
            if sector in ('Nakliyat / Lojistik', 'İnşaat / Yapı'):
                pot_level, segment, pot_score = 'high', 'B', 70
            elif sector in ('Tarım / Hayvancılık', 'Gıda / Tarım', 'Petrol / Enerji'):
                pot_level, segment, pot_score = 'medium', 'C', 55
            else:
                pot_level, segment, pot_score = 'medium', 'C', 50
            
            record = {
                'company_name': company_name.strip(),
                'phone': phone,
                'district': parsed['location'] or None,
                'sector': sector,
                'segment': segment,
                'potential_level': pot_level,
                'potential_score': pot_score,
                'source': 'contact_import_v2',
                'sales_notes': ' | '.join(notes_parts),
                'is_active': 1,
                'pipeline_stage': 'lead',
            }
            
            # Araç bilgisi varsa
            if parsed['vehicle']:
                record['current_fleet'] = parsed['vehicle']
            
            new_records.append(record)
            existing_phones.add(norm_phone)
    
    print(f"  Eşleşmemiş kişi: {len(unmatched)}")
    print(f"  Firma ibareli:    {len(new_records)}")
    
    # CRM'e ekle
    added = 0
    for rec in new_records:
        try:
            cols = ', '.join(rec.keys())
            placeholders = ', '.join(['?'] * len(rec))
            cursor.execute(
                f"INSERT INTO customers ({cols}) VALUES ({placeholders})",
                list(rec.values())
            )
            added += 1
        except Exception as e:
            pass
    
    conn.commit()
    
    print(f"  ✅ CRM'e eklenen:  {added}")
    
    # ---- AŞAMA 4: Duplikat temizliği ----
    print(f"\n{'─'*70}")
    print("  AŞAMA 4: DUPLİKAT TEMİZLİĞİ")
    print(f"{'─'*70}")
    
    # CRM'deki duplikat telefon numaralarını bul
    cursor.execute("""
        SELECT phone, COUNT(*) as cnt 
        FROM customers 
        WHERE phone IS NOT NULL AND phone != '' 
        GROUP BY phone 
        HAVING cnt > 1
        ORDER BY cnt DESC
    """)
    dup_phones = cursor.fetchall()
    
    merged = 0
    for phone, cnt in dup_phones:
        cursor.execute("""
            SELECT id, company_name, source, sector, sales_notes, phone, 
                   potential_score, created_at
            FROM customers 
            WHERE phone = ? 
            ORDER BY potential_score DESC, created_at ASC
        """, (phone,))
        dupes = cursor.fetchall()
        
        if len(dupes) <= 1:
            continue
        
        # Master: en yüksek skorlu ve en eski kayıt (CRM kaynağı öncelikli)
        master = dupes[0]
        master_id = master[0]
        
        for dupe in dupes[1:]:
            dupe_id = dupe[0]
            dupe_name = dupe[1]
            dupe_notes = dupe[4] or ''
            
            # Master'ın notlarına duplikat bilgisi ekle
            cursor.execute("SELECT sales_notes FROM customers WHERE id=?", (master_id,))
            master_notes = cursor.fetchone()[0] or ''
            
            if dupe_name not in master_notes:
                merge_note = f"Birleştirme: {dupe_name}"
                master_notes = f"{master_notes} | {merge_note}".strip(' |')
                cursor.execute("""
                    UPDATE customers SET sales_notes=? WHERE id=?
                """, (master_notes, master_id))
            
            # Duplikatı sil
            cursor.execute("DELETE FROM customers WHERE id=?", (dupe_id,))
            merged += 1
    
    conn.commit()
    print(f"  Duplikat telefon çifti: {len(dup_phones)}")
    print(f"  ✅ Birleştirilen kayıt: {merged}")
    
    # ---- ÖZET RAPOR ----
    print(f"\n{'='*70}")
    print("  ÖZET RAPOR")
    print(f"{'='*70}")
    
    cursor.execute("SELECT COUNT(*) FROM customers")
    total = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM customers WHERE phone IS NOT NULL AND phone != ''")
    with_phone = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM customers WHERE source='contact_import_v2'")
    from_v2 = cursor.fetchone()[0]
    
    print(f"\n  CRM Toplam müşteri: {total}")
    print(f"  CRM Telefonlu:      {with_phone} (%{100*with_phone//total})")
    print(f"  CRM Telefonsuz:     {total - with_phone}")
    print(f"  Yeni eklenen (v2):  {from_v2}")
    print(f"\n  Bu işlemde:")
    print(f"    📞 Telefon atanan:    {updated_phone}")
    print(f"    📝 Not güncellenen:   {updated_notes}")
    print(f"    ➕ Yeni kayıt:        {added}")
    print(f"    🔗 Duplikat birleşen: {merged}")
    
    # Detaylı rapor JSON
    report = {
        'vcf_total': len(contacts),
        'vcf_with_phone': len(contacts_with_phone),
        'vcf_deduped': len(contacts_deduped),
        'matches_phone': len(phone_matches),
        'matches_name_high': len(name_matches_high),
        'matches_name_med': len(name_matches_med),
        'unmatched': len(unmatched),
        'updated_phone': updated_phone,
        'updated_notes': updated_notes,
        'new_records': added,
        'duplicates_merged': merged,
        'crm_total': total,
        'crm_with_phone': with_phone,
        'phone_matches_detail': [
            {
                'contact': m['contact_name'],
                'customer': m['customer_name'],
                'phone': m['contact_phones'][0] if m['contact_phones'] else '',
                'score': m['score'],
            }
            for m in phone_matches[:50]
        ],
        'name_matches_high_detail': [
            {
                'contact': m['contact_name'],
                'customer': m['customer_name'],
                'phone': m['contact_phones'][0] if m['contact_phones'] else '',
                'score': m['score'],
                'common': list(m.get('common', [])),
            }
            for m in name_matches_high[:100]
        ],
        'unmatched_firma': [
            {
                'name': c['name'],
                'phone': c['phones'][0] if c['phones'] else '',
            }
            for c in unmatched[:100]
            if any(kw in turkish_lower(c['name']) for kw in SEKTOR_MAP)
        ],
    }
    
    report_path = os.path.join(os.path.dirname(__file__), 'mega_match_report.json')
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"\n  📄 Detaylı rapor: {report_path}")
    
    conn.close()
    print(f"\n{'='*70}")
    print("  TAMAMLANDI! ✅")
    print(f"{'='*70}\n")


if __name__ == '__main__':
    main()
