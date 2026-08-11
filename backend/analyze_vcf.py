"""VCF rehber dosyasini analiz et - kirli datayi anla"""
import re, sys, os, json
from collections import Counter
sys.stdout.reconfigure(encoding='utf-8')

def parse_vcf(filepath):
    contacts = []
    current = {}
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        for line in f:
            line = line.strip()
            if line == 'BEGIN:VCARD':
                current = {'name': '', 'org': '', 'phones': [], 'emails': [], 'raw_lines': []}
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
            elif line.startswith('EMAIL') and ':' in line:
                email = line.split(':', 1)[1].strip()
                if email:
                    current['emails'].append(email)
            if current:
                current.setdefault('raw_lines', []).append(line)
    return contacts

filepath = os.path.join(os.path.dirname(__file__), 'uploads', 'contacts.vcf')
contacts = parse_vcf(filepath)

print("=" * 70)
print("  VCF REHBER ANALİZİ")
print("=" * 70)

# Genel istatistikler
with_phone = [c for c in contacts if c['phones']]
with_org = [c for c in contacts if c['org']]
with_email = [c for c in contacts if c['emails']]

print(f"\n  Toplam kişi:    {len(contacts)}")
print(f"  Telefonlu:      {len(with_phone)}")
print(f"  Organizasyonlu: {len(with_org)}")
print(f"  E-postalı:      {len(with_email)}")
print(f"  Telefonsuz:     {len(contacts) - len(with_phone)}")

# Firma keyword analizi
FIRMA_KEYWORDS = [
    'ltd', 'a.ş', 'aş', 'şti', 'şirketi', 'limited', 'anonim',
    'inşaat', 'insaat', 'nakliyat', 'nakliye', 'lojistik', 'taşımacılık',
    'petrol', 'akaryakıt', 'benzin', 'opet',
    'tarım', 'tarim', 'hayvancılık', 'çiftlik',
    'gıda', 'gida', 'market', 'süt',
    'otomotiv', 'oto ', 'lastik', 'iveco', 'isuzu', 'ford', 'fiat',
    'makine', 'makina', 'pompa',
    'demir', 'çelik', 'metal', 'kaynak',
    'mobilya', 'ahşap', 'kereste',
    'tekstil', 'konfeksiyon',
    'eczane', 'ilaç', 'medikal',
    'hafriyat', 'beton', 'çimento', 'yapı', 'yapi',
    'elektrik', 'enerji', 'solar',
    'otel', 'turizm', 'restoran', 'cafe',
    'sigorta', 'banka',
    'ticaret', 'sanayi', 'pazarlama', 'taahhüt',
    'kooperatif', 'dernek',
    'kamyon', 'tır', 'dorse', 'treyler',
    'panelvan', 'kamyonet', 'pickup',
    'daily', 'eurocargo', 'stralis', 'trakker', 'cargo',
]

ARAC_KEYWORDS = [
    'daily', 'eurocargo', 'stralis', 'trakker', 'sway', 'tway',
    'iveco', 'isuzu', 'ford', 'fiat', 'man ', 'mercedes', 'scania', 'volvo',
    'panelvan', 'kamyon', 'kamyonet', 'tır', 'dorse', 'treyler',
    'pickup', 'cargo', 'npr', 'nqr', 'nkr',
    '4350', '3510', '35s', '70c', '65c', '35c',
    'kabin', 'şasi', 'frigorifik',
]

MUSTERI_KEYWORDS = ['müşteri', 'musteri', 'lead', 'aday', 'potansiyel']

def classify_contact(c):
    text = f"{c['name']} {c['org']}".lower()
    has_firma = any(kw in text for kw in FIRMA_KEYWORDS)
    has_arac = any(kw in text for kw in ARAC_KEYWORDS)
    has_musteri = any(kw in text for kw in MUSTERI_KEYWORDS)
    return has_firma, has_arac, has_musteri

firma_contacts = []
arac_contacts = []
musteri_contacts = []
kisi_contacts = []  # sadece kişi adı

for c in contacts:
    has_firma, has_arac, has_musteri = classify_contact(c)
    if has_firma:
        firma_contacts.append(c)
    if has_arac:
        arac_contacts.append(c)
    if has_musteri:
        musteri_contacts.append(c)
    if not has_firma and not has_arac and not has_musteri:
        kisi_contacts.append(c)

print(f"\n{'='*70}")
print("  KİŞİ SINIFLANDIRMASI")
print(f"{'='*70}")
print(f"  Firma ibareli:   {len(firma_contacts)}")
print(f"  Araç ibareli:    {len(arac_contacts)}")
print(f"  Müşteri etiketli: {len(musteri_contacts)}")
print(f"  Sadece kişi adı: {len(kisi_contacts)}")

# İsim pattern analizi
print(f"\n{'='*70}")
print("  İSİM PATTERN ANALİZİ")
print(f"{'='*70}")

# Kelime sayısı dağılımı
word_counts = Counter()
for c in contacts:
    n_words = len(c['name'].split())
    word_counts[n_words] += 1

print("\n  İsimdeki kelime sayısı dağılımı:")
for wc in sorted(word_counts.keys()):
    bar = "█" * (word_counts[wc] // 20)
    print(f"    {wc} kelime: {word_counts[wc]:>5d} {bar}")

# ORG alanı kullanımı
print(f"\n  ORG alanı olan kişiler: {len(with_org)}")
print("  ORG örnekleri:")
org_samples = [c for c in contacts if c['org']][:20]
for c in org_samples:
    print(f"    İsim: {c['name'][:35]:<35s} ORG: {c['org'][:40]}")

# Firma ibareli örnekler
print(f"\n{'='*70}")
print("  FİRMA İBARELİ KİŞİ ÖRNEKLERİ")
print(f"{'='*70}")
for c in firma_contacts[:30]:
    ph = c['phones'][0] if c['phones'] else '-'
    org = c['org'][:25] if c['org'] else ''
    print(f"  {c['name'][:45]:<45s} | {org:<25s} | {ph}")

# Araç ibareli örnekler
print(f"\n{'='*70}")
print("  ARAÇ İBARELİ KİŞİ ÖRNEKLERİ")
print(f"{'='*70}")
for c in arac_contacts[:20]:
    ph = c['phones'][0] if c['phones'] else '-'
    print(f"  {c['name'][:50]:<50s} | {ph}")

# Müşteri etiketli örnekler
print(f"\n{'='*70}")
print("  MÜŞTERİ ETİKETLİ ÖRNEKLERİ")
print(f"{'='*70}")
for c in musteri_contacts[:20]:
    ph = c['phones'][0] if c['phones'] else '-'
    print(f"  {c['name'][:50]:<50s} | {ph}")

# Sadece kişi adı olanlar
print(f"\n{'='*70}")
print("  SADECE KİŞİ ADI ÖRNEKLER (firma ibaresi yok)")
print(f"{'='*70}")
for c in kisi_contacts[:30]:
    ph = c['phones'][0] if c['phones'] else '-'
    org = c['org'][:25] if c['org'] else ''
    print(f"  {c['name'][:45]:<45s} | {org:<25s} | {ph}")

# Duplikat analizi
print(f"\n{'='*70}")
print("  DUPLİKAT ANALİZİ")
print(f"{'='*70}")

# Aynı isimle birden fazla kişi
name_counts = Counter(c['name'].strip().upper() for c in contacts if c['name'].strip())
dup_names = [(name, cnt) for name, cnt in name_counts.items() if cnt > 2]
dup_names.sort(key=lambda x: x[1], reverse=True)
print(f"\n  3+ kez tekrarlanan isimler: {len(dup_names)}")
for name, cnt in dup_names[:15]:
    print(f"    {name[:45]:<45s} x{cnt}")

# Aynı telefonla birden fazla kişi
phone_contacts = Counter()
for c in contacts:
    for ph in c['phones']:
        norm = re.sub(r'[^\d]', '', ph)[-10:]
        phone_contacts[norm] += 1

dup_phones = [(ph, cnt) for ph, cnt in phone_contacts.items() if cnt > 2]
dup_phones.sort(key=lambda x: x[1], reverse=True)
print(f"\n  3+ kez tekrarlanan telefonlar: {len(dup_phones)}")
for ph, cnt in dup_phones[:10]:
    print(f"    ...{ph} x{cnt}")

print(f"\n{'='*70}")
print("  ANALİZ TAMAMLANDI")
print(f"{'='*70}")
