# Telefon Rehberi -> CRM Eslestirme Araci (Optimized v2)
# 4000+ kisi x 3000+ firma = hizli hash-tabanli eslestirme
import sys, os, re, csv, json
from collections import defaultdict

sys.path.insert(0, os.path.dirname(__file__))
sys.stdout.reconfigure(encoding='utf-8')

from app.core.database import SessionLocal
from app.modules.auth.models import User
from app.modules.crm.models import Customer


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
    phone = normalize_phone(phone)
    if len(phone) == 12 and phone.startswith('90'):
        return f"0{phone[2:5]} {phone[5:8]} {phone[8:10]} {phone[10:]}"
    return phone


def tokenize(text):
    """Metinden aranabilir token seti oluştur."""
    text = text.upper()
    # Yaygın ekleri kaldır
    for w in ['LİMİTED ŞİRKETİ', 'LTD', 'ŞTİ', 'A.Ş.', 'AŞ', 'ANONİM ŞİRKETİ',
              'SANAYİ VE TİCARET', 'SAN.', 'TİC.', 'VE', 'İNŞAAT', 'TAAHHÜT',
              'NAKLİYAT', 'NAKLİYE', 'OTOMOTİV', 'GIDA', 'TARIM', 'HAYVANCILIK',
              'İTHALAT', 'İHRACAT', 'PAZARLAMA', 'TURİZM', 'ENERJİ', 'TEMİZLİK',
              'TEKSTİL', 'PETROL', 'AKARYAKIT', 'MADENCİLİK', 'HİZMETLERİ']:
        text = text.replace(w, '')
    # Alfanumerik kelimeleri al
    words = re.findall(r'[A-ZÇĞİÖŞÜa-zçğıöşü0-9]{2,}', text)
    return set(words)


def build_index(customers):
    """CRM firmalarından ters indeks oluştur - her kelime hangi firmalarda geçiyor."""
    word_index = defaultdict(list)  # word -> [(customer_id, company_name, phone, full_token_set)]
    customer_tokens = {}

    for cid, cname, cphone in customers:
        tokens = tokenize(cname)
        customer_tokens[cid] = (cname, cphone, tokens)
        for token in tokens:
            word_index[token].append(cid)

    return word_index, customer_tokens


def match_contact(contact, word_index, customer_tokens):
    """Bir kişiyi CRM'deki firmalarla hızlı eşleştir."""
    search_text = f"{contact['name']} {contact['org']}"
    contact_tokens = tokenize(search_text)

    if not contact_tokens:
        return None

    # Adayları bul: en az 1 ortak kelimesi olan firmalar
    candidate_scores = defaultdict(int)
    for token in contact_tokens:
        for cid in word_index.get(token, []):
            candidate_scores[cid] += 1

    if not candidate_scores:
        return None

    # En çok ortak kelimesi olan adayları değerlendir
    best = None
    best_score = 0

    for cid, common_count in sorted(candidate_scores.items(), key=lambda x: x[1], reverse=True)[:10]:
        cname, cphone, crm_tokens = customer_tokens[cid]

        if not crm_tokens:
            continue

        # Jaccard benzerliği: ortak kelimeler / toplam kelimeler
        intersection = contact_tokens & crm_tokens
        union = contact_tokens | crm_tokens
        jaccard = len(intersection) / len(union) if union else 0

        # Önemli kelimelerin (kısa olmayan) eşleşme oranı
        important_contact = {t for t in contact_tokens if len(t) >= 4}
        important_crm = {t for t in crm_tokens if len(t) >= 4}
        if important_contact and important_crm:
            important_match = len(important_contact & important_crm) / min(len(important_contact), len(important_crm))
        else:
            important_match = 0

        # Toplam skor
        score = jaccard * 0.4 + important_match * 0.6

        if score > best_score and score >= 0.3:
            best_score = score
            best = (cid, cname, score, search_text.strip())

    return best


def main():
    if len(sys.argv) < 2:
        print("Kullanim: python import_contacts.py <vcf_dosyasi>")
        return

    filepath = sys.argv[1]
    if not os.path.exists(filepath):
        print(f"HATA: Dosya bulunamadi: {filepath}")
        return

    print("=" * 60)
    print("  TELEFON REHBERİ → IVECO CRM EŞLEŞTİRME")
    print("=" * 60)

    # 1. VCF oku
    print(f"\n[1/5] Dosya okunuyor...")
    contacts = parse_vcf(filepath)
    with_phone = [c for c in contacts if c['phones']]
    print(f"  → {len(contacts)} kişi, {len(with_phone)} telefonlu")

    # 2. CRM'den veri çek
    print(f"\n[2/5] CRM veritabanı okunuyor...")
    db = SessionLocal()
    customers = db.query(Customer.id, Customer.company_name, Customer.phone).all()
    no_phone = sum(1 for c in customers if not c.phone)
    print(f"  → {len(customers)} müşteri ({no_phone} telefonsuz)")

    # 3. İndeks oluştur + eşleştir
    print(f"\n[3/5] Hızlı indeks oluşturuluyor ve eşleştiriliyor...")
    word_index, customer_tokens = build_index(customers)
    print(f"  → İndeks: {len(word_index)} benzersiz kelime")

    matched = []
    unmatched = []

    for i, contact in enumerate(with_phone):
        if i % 500 == 0 and i > 0:
            print(f"  ... {i}/{len(with_phone)} işlendi")

        result = match_contact(contact, word_index, customer_tokens)
        if result:
            cid, cname, score, term = result
            matched.append({
                'contact_name': contact['name'],
                'contact_org': contact['org'],
                'phones': contact['phones'],
                'customer_id': cid,
                'customer_name': cname,
                'score': round(score, 3),
                'matched_via': term,
            })
        else:
            unmatched.append(contact)

    print(f"  → {len(matched)} eşleşme, {len(unmatched)} eşleşmesiz")

    # 4. Sonuçları göster
    matched.sort(key=lambda x: x['score'], reverse=True)
    high = [m for m in matched if m['score'] >= 0.5]
    med = [m for m in matched if 0.3 <= m['score'] < 0.5]

    print(f"\n[4/5] SONUÇLAR:")
    print(f"\n  ✅ YÜKSEK GÜVEN ({len(high)} adet, skor ≥ 0.50):")
    for m in high[:40]:
        ph = format_phone(m['phones'][0])
        print(f"    [{m['score']:.2f}] {m['customer_name'][:50]:50s} ← {ph}  ({m['contact_name']})")

    if med:
        print(f"\n  ⚠️  ORTA GÜVEN ({len(med)} adet, skor 0.30-0.49):")
        for m in med[:20]:
            ph = format_phone(m['phones'][0])
            print(f"    [{m['score']:.2f}] {m['customer_name'][:50]:50s} ← {ph}  ({m['contact_name']})")

    # 5. CRM güncelle (yüksek güven)
    print(f"\n[5/5] CRM güncelleniyor (skor ≥ 0.50)...")
    updated = 0
    already = 0
    for m in high:
        customer = db.query(Customer).filter(Customer.id == m['customer_id']).first()
        if customer:
            if customer.phone:
                already += 1
                continue
            customer.phone = format_phone(m['phones'][0])
            updated += 1

    db.commit()

    total_with_phone = db.query(Customer).filter(Customer.phone.isnot(None), Customer.phone != '').count()
    total = db.query(Customer).count()
    db.close()

    # Rapor kaydet
    report = {
        'total_contacts': len(contacts), 'with_phone': len(with_phone),
        'matched': len(matched), 'high_confidence': len(high), 'medium_confidence': len(med),
        'updated': updated, 'already_had_phone': already,
        'matches': matched[:200],
        'unmatched_sample': [{'name': c['name'], 'org': c['org'], 'phone': c['phones'][0] if c['phones'] else ''} for c in unmatched[:100]],
    }
    report_path = os.path.join(os.path.dirname(__file__), 'contact_match_report.json')
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"  TAMAMLANDI!")
    print(f"{'='*60}")
    print(f"  Rehber:              {len(contacts)} kişi ({len(with_phone)} telefonlu)")
    print(f"  Eşleşme:            {len(matched)} ({len(high)} yüksek, {len(med)} orta)")
    print(f"  CRM güncellenen:    {updated}")
    print(f"  Zaten telefonlu:    {already}")
    print(f"  CRM telefonlu:      {total_with_phone}/{total}")
    print(f"  Rapor:              {report_path}")
    print()


if __name__ == '__main__':
    main()
