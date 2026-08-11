# Rehberdeki firma ibaresi olan kisileri CRM'e yeni musteri olarak ekle
import sys, os, re, json

sys.path.insert(0, os.path.dirname(__file__))
sys.stdout.reconfigure(encoding='utf-8')

from app.core.database import SessionLocal
from app.modules.auth.models import User
from app.modules.crm.models import Customer


# Firma ibareleri - bunlardan biri geçiyorsa firma kişisidir
FIRMA_KEYWORDS = [
    # Şirket türleri
    'ltd', 'a.ş', 'aş ', 'şti', 'şirketi', 'limited', 'anonim',
    # Sektörler
    'inşaat', 'insaat', 'nakliyat', 'nakliye', 'lojistik', 'taşımacılık', 'tasimacilik',
    'petrol', 'akaryakıt', 'akaryakit', 'benzin', 'opet', 'bp ', 'shell',
    'tarım', 'tarim', 'hayvancılık', 'hayvancilik', 'çiftlik', 'ciftlik',
    'gıda', 'gida', 'market', 'süt ', 'un ', 'yem ',
    'otomotiv', 'oto ', 'otopark', 'lastik', 'iveco', 'isuzu', 'ford', 'fiat',
    'makine', 'makina', 'pompa', 'hidrolik',
    'demir', 'çelik', 'celik', 'metal', 'kaynak',
    'mobilya', 'ahşap', 'ahsap', 'kereste',
    'tekstil', 'konfeksiyon', 'kumaş', 'kumas',
    'eczane', 'ilaç', 'ilac', 'medikal', 'tıbbi',
    'hafriyat', 'beton', 'çimento', 'cimento', 'yapı', 'yapi',
    'elektrik', 'enerji', 'solar', 'güneş',
    'otel', 'turizm', 'restoran', 'cafe', 'kafe',
    'hukuk', 'avukat', 'noter',
    'sigorta', 'finans', 'banka',
    'bilişim', 'bilisim', 'yazılım', 'yazilim', 'teknoloji',
    'matbaa', 'reklam', 'ajans',
    'ticaret', 'sanayi', 'pazarlama', 'taahhüt', 'taahhut',
    'mühendislik', 'muhendislik',
    'danışmanlık', 'danismanlik',
    'kooperatif', 'dernek', 'vakıf', 'oda ',
    # Araç/Kamyon ipuçları
    'kamyon', 'tır ', 'tir ', 'dorse', 'treyler', 'trailer',
    'panelvan', 'kamyonet', 'pickup',
    'daily', 'eurocargo', 'stralis', 'trakker',
    'npr', 'nqr', 'cargo',
]


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


def is_firma(contact):
    """Kişinin firma/iş ilişkili olup olmadığını kontrol et."""
    text = f"{contact['name']} {contact['org']}".lower()
    for kw in FIRMA_KEYWORDS:
        if kw in text:
            return True
    return False


def normalize_phone(phone):
    phone = re.sub(r'[^\d]', '', phone)
    if phone.startswith('90') and len(phone) == 12:
        return f"0{phone[2:5]} {phone[5:8]} {phone[8:10]} {phone[10:]}"
    if phone.startswith('0') and len(phone) == 11:
        return f"0{phone[1:4]} {phone[4:7]} {phone[7:9]} {phone[9:]}"
    if len(phone) == 10 and not phone.startswith('0'):
        return f"0{phone[:3]} {phone[3:6]} {phone[6:8]} {phone[8:]}"
    return phone


def guess_sector(text):
    """İsimden sektör tahmini yap."""
    text = text.lower()
    if any(k in text for k in ['nakliyat', 'nakliye', 'lojistik', 'taşımacılık', 'tasimacilik', 'kamyon', 'tır', 'dorse']):
        return 'Nakliyat / Lojistik'
    if any(k in text for k in ['inşaat', 'insaat', 'hafriyat', 'beton', 'yapı', 'yapi', 'çimento']):
        return 'İnşaat / Yapı'
    if any(k in text for k in ['tarım', 'tarim', 'hayvancılık', 'hayvancilik', 'çiftlik', 'yem ', 'tohum']):
        return 'Tarım / Hayvancılık'
    if any(k in text for k in ['gıda', 'gida', 'market', 'süt', 'un ', 'baharat', 'restoran']):
        return 'Gıda / Tarım'
    if any(k in text for k in ['petrol', 'akaryakıt', 'akaryakit', 'benzin', 'opet', 'bp ']):
        return 'Petrol / Enerji'
    if any(k in text for k in ['otomotiv', 'oto ', 'lastik', 'iveco', 'isuzu', 'ford']):
        return 'Otomotiv'
    if any(k in text for k in ['makine', 'makina', 'pompa', 'hidrolik']):
        return 'Makine / Ekipman'
    if any(k in text for k in ['demir', 'çelik', 'metal', 'kaynak']):
        return 'Metal / Demir Çelik'
    if any(k in text for k in ['tekstil', 'konfeksiyon', 'kumaş']):
        return 'Tekstil'
    if any(k in text for k in ['mobilya', 'ahşap', 'kereste']):
        return 'Mobilya / Ahşap'
    if any(k in text for k in ['elektrik', 'enerji', 'solar']):
        return 'Elektrik / Enerji'
    if any(k in text for k in ['ilaç', 'ilac', 'eczane', 'medikal']):
        return 'Sağlık / İlaç'
    if any(k in text for k in ['otel', 'turizm', 'cafe', 'kafe']):
        return 'Turizm / Konaklama'
    return 'Diğer'


def guess_potential(text):
    """Sektöre göre potansiyel seviyesi belirle (Iveco için)."""
    text = text.lower()
    # Yüksek potansiyel: nakliyat, lojistik, inşaat, hafriyat
    if any(k in text for k in ['nakliyat', 'nakliye', 'lojistik', 'taşımacılık', 'kamyon', 'tır', 'dorse',
                                'hafriyat', 'beton', 'iveco', 'isuzu', 'daily', 'eurocargo']):
        return 'high', 'B', 75
    if any(k in text for k in ['inşaat', 'insaat', 'yapı', 'yapi']):
        return 'high', 'B', 70
    if any(k in text for k in ['tarım', 'tarim', 'hayvancılık', 'gıda', 'gida', 'petrol']):
        return 'medium', 'C', 55
    return 'medium', 'C', 50


def main():
    if len(sys.argv) < 2:
        print("Kullanim: python import_contacts_firma.py <vcf_dosyasi>")
        return

    filepath = sys.argv[1]
    print("=" * 60)
    print("  REHBER → CRM: SADECE FİRMA İBARELİ KİŞİLER")
    print("=" * 60)

    # 1. Önce yanlış atanan telefonları geri al
    print("\n[1/4] Önceki yanlış atamalar geri alınıyor...")
    db = SessionLocal()

    # updated_at bugün olan ve source'u contact olmayan kayıtları bul
    from datetime import date
    today = date.today()
    reverted = 0
    customers = db.query(Customer).filter(
        Customer.phone.isnot(None),
        Customer.phone != '',
        Customer.updated_at >= f"{today} 00:00:00"
    ).all()

    for c in customers:
        # Bugün güncellenen ve source'u contact_import olmayan kayıtlar
        if c.source != 'contact_import':
            # Bu kayıt mevcut CRM kaydıydı, telefonunu sıfırla
            if c.updated_at and c.updated_at.date() == today and c.created_at.date() != today:
                c.phone = None
                reverted += 1

    db.commit()
    print(f"  → {reverted} yanlış telefon atamsı geri alındı")

    # 2. VCF oku
    print(f"\n[2/4] Rehber okunuyor...")
    contacts = parse_vcf(filepath)
    with_phone = [c for c in contacts if c['phones']]
    print(f"  → {len(contacts)} kişi, {len(with_phone)} telefonlu")

    # 3. Firma ibaresi olanları filtrele
    print(f"\n[3/4] Firma ibaresi olanlar filtreleniyor...")
    firma_contacts = [c for c in with_phone if is_firma(c)]
    print(f"  → {len(firma_contacts)} firma ibareli kişi bulundu")

    # Duplikatları kontrol et (aynı telefon numarası)
    seen_phones = set()
    unique_firma = []
    for c in firma_contacts:
        phone_key = re.sub(r'[^\d]', '', c['phones'][0])[-10:]  # Son 10 hane
        if phone_key not in seen_phones:
            seen_phones.add(phone_key)
            unique_firma.append(c)

    print(f"  → {len(unique_firma)} benzersiz firma ({len(firma_contacts) - len(unique_firma)} duplikat)")

    # Mevcut CRM'de telefonu zaten olan numaraları çıkar
    existing_phones = set()
    for c in db.query(Customer.phone).filter(Customer.phone.isnot(None), Customer.phone != '').all():
        if c.phone:
            clean = re.sub(r'[^\d]', '', c.phone)[-10:]
            existing_phones.add(clean)

    # Mevcut firma isimlerini de kontrol et
    existing_names = set()
    for c in db.query(Customer.company_name).all():
        existing_names.add(c.company_name.upper().strip())

    new_firma = []
    skipped_phone = 0
    skipped_name = 0
    for c in unique_firma:
        phone_key = re.sub(r'[^\d]', '', c['phones'][0])[-10:]
        name = (c['name'] or c['org']).upper().strip()
        if phone_key in existing_phones:
            skipped_phone += 1
            continue
        if name in existing_names:
            skipped_name += 1
            continue
        new_firma.append(c)

    print(f"  → {len(new_firma)} yeni firma (CRM'de yok)")
    print(f"  → {skipped_phone} telefonu zaten kayıtlı, {skipped_name} ismi zaten kayıtlı")

    # 4. CRM'e ekle
    print(f"\n[4/4] CRM'e ekleniyor...")
    added = 0
    for c in new_firma:
        name = c['name'] or c['org']
        full_text = f"{c['name']} {c['org']}"
        phone = normalize_phone(c['phones'][0])
        sector = guess_sector(full_text)
        pot_level, segment, pot_score = guess_potential(full_text)

        customer = Customer(
            company_name=name.strip(),
            phone=phone,
            city='Bilinmiyor',
            district=None,
            sector=sector,
            segment=segment,
            potential_level=pot_level,
            potential_score=pot_score,
            source='contact_import',
            sales_notes=f"Rehberden aktarıldı | Orijinal kayıt: {c['name']} / {c['org']}",
            is_active=True,
        )
        db.add(customer)
        added += 1

    db.commit()

    # İstatistik
    total = db.query(Customer).count()
    from_contacts = db.query(Customer).filter(Customer.source == 'contact_import').count()
    db.close()

    # Listeyi göster
    print(f"\n{'='*70}")
    print(f"  EKLENEN FİRMALAR ({added} adet)")
    print(f"{'='*70}")
    for c in new_firma[:50]:
        name = (c['name'] or c['org'])[:45]
        phone = normalize_phone(c['phones'][0])
        sector = guess_sector(f"{c['name']} {c['org']}")
        print(f"  {name:45s} | {phone:15s} | {sector}")

    if len(new_firma) > 50:
        print(f"  ... ve {len(new_firma) - 50} firma daha")

    print(f"\n{'='*60}")
    print(f"  TAMAMLANDI!")
    print(f"{'='*60}")
    print(f"  Rehber toplam:        {len(contacts)}")
    print(f"  Firma ibareli:        {len(firma_contacts)}")
    print(f"  Benzersiz:            {len(unique_firma)}")
    print(f"  Yeni eklenen:         {added}")
    print(f"  CRM rehber toplam:    {from_contacts}")
    print(f"  CRM genel toplam:     {total}")


if __name__ == '__main__':
    main()
