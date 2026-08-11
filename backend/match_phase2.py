"""
Orta güven eşleşmeleri analiz et ve uygulanabilir olanları uygula.
Ayrıca CRM'deki mevcut firma kayıtları ile rehber kişilerini
daha agresif eşleştir.
"""
import sqlite3, sys, os, re, json
from collections import defaultdict
sys.stdout.reconfigure(encoding='utf-8')

DB_PATH = os.path.join(os.path.dirname(__file__), 'iveco_crm.db')
VCF_PATH = os.path.join(os.path.dirname(__file__), 'uploads', 'contacts.vcf')


def normalize_phone(phone):
    phone = re.sub(r'[^\d]', '', phone)
    if phone.startswith('90') and len(phone) == 12:
        return phone
    if phone.startswith('0') and len(phone) == 11:
        return '90' + phone[1:]
    if len(phone) == 10 and not phone.startswith('0'):
        return '90' + phone
    return phone


def format_phone(phone):
    norm = normalize_phone(phone)
    if len(norm) == 12 and norm.startswith('90'):
        return f"0{norm[2:5]} {norm[5:8]} {norm[8:10]} {norm[10:]}"
    return phone


def turkish_lower(text):
    return text.replace('İ', 'i').replace('I', 'ı').lower()


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


def extract_significant_words(text):
    """İsimden anlamlı kelimeleri çıkar (>=4 harf, stopwords hariç)."""
    text = turkish_lower(text)
    # Yasal ekleri temizle
    for s in ['limited şirketi', 'anonim şirketi', 'sanayi ve ticaret',
              'san. ve tic.', 'ltd. şti.', 'san.', 'tic.']:
        text = text.replace(s, '')
    words = re.findall(r'[a-zçğıöşü]{3,}', text)
    stopwords = {'ve', 'ile', 'san', 'tic', 'ltd', 'aş', 'şti', 'abi', 'bey',
                 'hanım', 'abla', 'müşteri', 'lead', 'aday', 'rehberim'}
    return [w for w in words if w not in stopwords and len(w) >= 3]


def main():
    print("=" * 70)
    print("  AŞAMA 2: GELİŞMİŞ EŞLEŞTİRME (Mevcut CRM firmalarına telefon)")
    print("=" * 70)

    # VCF oku
    contacts = parse_vcf(VCF_PATH)
    contacts_with_phone = [c for c in contacts if c['phones']]
    
    # Telefon → kişi adı mapping (deduplicate)
    phone_to_contact = {}
    for c in contacts_with_phone:
        norm = normalize_phone(c['phones'][0])
        if norm not in phone_to_contact:
            phone_to_contact[norm] = c
    
    print(f"  VCF benzersiz telefonlu: {len(phone_to_contact)}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Telefonsuz CRM müşterilerini al (sadece gerçek firma kayıtları)
    cursor.execute("""
        SELECT id, company_name, source, sector, sales_notes
        FROM customers
        WHERE (phone IS NULL OR phone = '')
          AND source NOT IN ('contact_import', 'contact_import_v2')
          AND is_active = 1
    """)
    no_phone_customers = cursor.fetchall()
    print(f"  Telefonsuz CRM firma kayıtları: {len(no_phone_customers)}")
    
    # Mevcut telefonları topla (çakışma kontrolü)
    cursor.execute("SELECT phone FROM customers WHERE phone IS NOT NULL AND phone != ''")
    existing_phones = set()
    for row in cursor.fetchall():
        existing_phones.add(normalize_phone(re.sub(r'[^\d+]', '', row[0])))
    
    # Her CRM firma kaydı için VCF'de eşleşme ara
    matched = []
    
    for cid, cname, csource, csector, cnotes in no_phone_customers:
        crm_words = extract_significant_words(cname)
        if not crm_words:
            continue
        
        best_match = None
        best_score = 0
        
        for norm_phone, contact in phone_to_contact.items():
            # Bu telefon zaten CRM'de var mı?
            if norm_phone in existing_phones:
                continue
            
            contact_text = f"{contact['name']} {contact.get('org', '')}"
            contact_words = extract_significant_words(contact_text)
            
            if not contact_words:
                continue
            
            # Ortak kelimeler
            crm_set = set(crm_words)
            contact_set = set(contact_words)
            common = crm_set & contact_set
            
            if not common:
                continue
            
            # Önemli (uzun) kelimelerin eşleşmesi
            imp_common = {w for w in common if len(w) >= 4}
            
            # Skor hesapla
            if imp_common:
                # En az 1 önemli kelime eşleşti
                coverage = len(imp_common) / min(
                    len({w for w in crm_set if len(w) >= 4}) or 1,
                    len({w for w in contact_set if len(w) >= 4}) or 1
                )
                score = 0.3 + coverage * 0.7
            else:
                # Sadece kısa kelimeler eşleşti
                score = len(common) / len(crm_set | contact_set) * 0.5
            
            if score > best_score and score >= 0.4:
                best_score = score
                best_match = {
                    'customer_id': cid,
                    'customer_name': cname,
                    'contact_name': contact['name'],
                    'phone': norm_phone,
                    'score': round(score, 3),
                    'common': common,
                    'imp_common': imp_common,
                    'source': csource,
                }
        
        if best_match:
            matched.append(best_match)
    
    # Skora göre sırala
    matched.sort(key=lambda x: x['score'], reverse=True)
    
    # Yüksek güven eşleşmeleri göster ve uygula
    high = [m for m in matched if m['score'] >= 0.6]
    med = [m for m in matched if 0.4 <= m['score'] < 0.6]
    
    print(f"\n  Yüksek güven (≥0.60): {len(high)}")
    print(f"  Orta güven (0.40-0.59): {len(med)}")
    
    print(f"\n{'─'*70}")
    print("  YÜKSEK GÜVEN EŞLEŞMELERİ (otomatik uygulanacak)")
    print(f"{'─'*70}")
    
    applied = 0
    applied_phones = set()
    
    for m in high:
        norm = m['phone']
        if norm in existing_phones or norm in applied_phones:
            continue
        
        phone_fmt = format_phone(norm)
        imp = ', '.join(m['imp_common'])
        print(f"  [{m['score']:.2f}] {m['customer_name'][:40]:<40s} <- {m['contact_name'][:25]:<25s} | {phone_fmt} | {imp}")
        
        # Uygula
        note_append = f"Rehber eşleşme: {m['contact_name']}"
        cursor.execute("SELECT sales_notes FROM customers WHERE id=?", (m['customer_id'],))
        old_notes = cursor.fetchone()[0] or ''
        new_notes = f"{old_notes} | {note_append}".strip(' |')
        
        cursor.execute("""
            UPDATE customers 
            SET phone=?, sales_notes=?, updated_at=datetime('now')
            WHERE id=?
        """, (phone_fmt, new_notes, m['customer_id']))
        
        applied += 1
        applied_phones.add(norm)
    
    conn.commit()
    print(f"\n  ✅ Uygulanan: {applied}")
    
    # Orta güven eşleşmeleri göster (kontrol için)
    print(f"\n{'─'*70}")
    print("  ORTA GÜVEN EŞLEŞMELERİ (kontrol için)")
    print(f"{'─'*70}")
    
    med_applied = 0
    for m in med:
        norm = m['phone']
        if norm in existing_phones or norm in applied_phones:
            continue
        
        phone_fmt = format_phone(norm)
        common_str = ', '.join(m['common'])
        imp_str = ', '.join(m['imp_common']) if m['imp_common'] else '-'
        
        # En az 1 önemli (>=5 harf) kelime varsa uygula
        very_important = {w for w in m['imp_common'] if len(w) >= 5}
        if very_important:
            marker = "✅"
            note_append = f"Rehber eşleşme (orta): {m['contact_name']}"
            cursor.execute("SELECT sales_notes FROM customers WHERE id=?", (m['customer_id'],))
            old_notes = cursor.fetchone()[0] or ''
            new_notes = f"{old_notes} | {note_append}".strip(' |')
            
            cursor.execute("""
                UPDATE customers 
                SET phone=?, sales_notes=?, updated_at=datetime('now')
                WHERE id=?
            """, (phone_fmt, new_notes, m['customer_id']))
            med_applied += 1
            applied_phones.add(norm)
        else:
            marker = "⚠️"
        
        print(f"  {marker} [{m['score']:.2f}] {m['customer_name'][:35]:<35s} <- {m['contact_name'][:25]:<25s} | {phone_fmt} | ortak: {imp_str}")
        
        if med_applied + applied >= 500:
            break
    
    conn.commit()
    
    print(f"\n  ✅ Orta güvenden uygulanan: {med_applied}")
    
    # Final durum
    cursor.execute("SELECT COUNT(*) FROM customers")
    total = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM customers WHERE phone IS NOT NULL AND phone != ''")
    with_phone = cursor.fetchone()[0]
    cursor.execute("""
        SELECT COUNT(*) FROM customers 
        WHERE (phone IS NULL OR phone='') 
          AND source NOT IN ('contact_import', 'contact_import_v2')
    """)
    still_no_phone = cursor.fetchone()[0]
    
    print(f"\n{'='*70}")
    print("  FİNAL DURUM")
    print(f"{'='*70}")
    print(f"  CRM Toplam:         {total}")
    print(f"  Telefonlu:          {with_phone} (%{100*with_phone//total})")
    print(f"  Firma telefonsuz:   {still_no_phone}")
    print(f"  Bu turda eklenen:   {applied + med_applied}")
    
    conn.close()
    print(f"\n{'='*70}\n")


if __name__ == '__main__':
    main()
