import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
sys.stdout.reconfigure(encoding='utf-8')
from app.core.database import SessionLocal
from app.modules.auth.models import User
from app.modules.crm.models import Customer

firms = [
    {"name":"Samsun Lojistik (SLC)","contact":"Metin Akar","phone":"+90 362 502 10 11","addr":"Aşağıçinik Mah. Lojistik Sk. No:1 Tekkeköy","district":"Tekkeköy"},
    {"name":"Sandıkçı Lojistik","contact":"Ahmet Sandıkçı","phone":"+90 362 266 50 11","addr":"Kutlukent Org. San. Bulvarı No:14 Tekkeköy","district":"Tekkeköy"},
    {"name":"Ceynak Lojistik","contact":"Ali Avcı","phone":"+90 362 266 90 90","addr":"Hançerli Mah. Sahil Yolu Cad. No:190 İlkadım","district":"İlkadım"},
    {"name":"Mandıralı Lojistik","contact":"Fatih Mandıralı","phone":"+90 549 559 40 81","addr":"Toybelen Mah. 1205. Sokak No:12 İlkadım","district":"İlkadım"},
    {"name":"Uhud Ağır Nakliyat","contact":"Hamit Kurt","phone":"+90 553 295 14 48","addr":"Yeni Mah. Şehit Mesut Birinci Cad. No:83 Canik","district":"Canik"},
    {"name":"Örnek Lojistik","contact":"Örnek Ailesi","phone":"+90 549 481 54 55","addr":"Kirazlık Mah. 1031. Sokak No:2 Tekkeköy","district":"Tekkeköy"},
    {"name":"Kılıçlar Nakliyat","contact":"Mehmet Kılıç","phone":"+90 538 280 40 87","addr":"Yavuzselim Mah. Gülsan Sanayi Sitesi Canik","district":"Canik"},
    {"name":"Enisa Taşımacılık","contact":"İsa Baş","phone":"+90 546 544 61 55","addr":"Karadeniz Mah. Lise Cad. No:31/4 İlkadım","district":"İlkadım"},
    {"name":"Sezgin Logistics","contact":"Sezgin Ailesi","phone":"+90 543 253 41 55","addr":"Beylerce Mevkii, Samsun-Ordu Karayolu Çarşamba","district":"Çarşamba"},
    {"name":"Ecekar Logistics","contact":"Erkan Karaca","phone":"+90 362 445 05 52","addr":"Derebahçe Mah. Kafkas Sokak No:19 İlkadım","district":"İlkadım"},
    {"name":"Korpet Nakliye","contact":"Korpet Ailesi","phone":"+90 362 266 93 45","addr":"Gülsan Sanayi Sitesi 46. Sokak No:12 Canik","district":"Canik"},
    {"name":"Dağlı Nakliye","contact":"Hasan Dağlı","phone":"+90 530 885 27 22","addr":"Sarıcalı Mah. Stadyum Cad. Çarşamba","district":"Çarşamba"},
    {"name":"Arsel Lojistik","contact":"Arsel Ailesi","phone":"+90 362 266 84 44","addr":"Şabanoğlu Mah. Org. San. Bulv. No:50 Tekkeköy","district":"Tekkeköy"},
    {"name":"Yağız Transport","contact":"Yağız Ailesi","phone":"+90 533 137 83 18","addr":"OSB Erdoğan Tok Cad. No:11 Tekkeköy","district":"Tekkeköy"},
    {"name":"Karaçuha Lojistik","contact":"Karaçuha Ailesi","phone":"+90 362 833 22 22","addr":"Samsun-Ordu Karayolu 35. Km Çarşamba","district":"Çarşamba"},
    {"name":"Tellioğlu Lojistik","contact":"Tellioğlu Ailesi","phone":"+90 362 266 99 88","addr":"Örnek Sanayi Sitesi Tekkeköy","district":"Tekkeköy"},
    {"name":"Aksoy Ağır Nakliyat","contact":"Aksoy Ailesi","phone":"+90 532 555 66 77","addr":"Kutlukent Mevkii Tekkeköy","district":"Tekkeköy"},
    {"name":"Luna Ro-Ro","contact":"İşletme Md.","phone":"+90 362 445 00 22","addr":"Liman Mah. Gezi Cad. No:12 İlkadım","district":"İlkadım"},
    {"name":"Güngör Nakliyat","contact":"Güngör Ailesi","phone":"+90 362 431 35 19","addr":"Kale Mah. Kazımpaşa Cad. No:24 İlkadım","district":"İlkadım"},
    {"name":"Kefeli Vinç","contact":"Kefeli Ailesi","phone":"+90 532 666 55 44","addr":"Terme Sanayi Sitesi No:44 Terme","district":"Terme"},
    {"name":"Asma Nakliyat","contact":"Asma Ailesi","phone":"+90 362 854 11 00","addr":"Anbarköprü Mevkii, Çarşamba","district":"Çarşamba"},
    {"name":"Yükselen Lojistik","contact":"Yüksel Ailesi","phone":"+90 532 444 55 66","addr":"Şabanoğlu Mah. Tekkeköy","district":"Tekkeköy"},
    {"name":"Samsunport (Liman)","contact":"Operasyon Md.","phone":"+90 362 445 14 00","addr":"Hançerli Mah. Liman İşletmeleri İlkadım","district":"İlkadım"},
    {"name":"Erol Lojistik","contact":"Erol Ailesi","phone":"+90 530 111 22 33","addr":"Kılıçdede Mah. Saadet Cad. No:5 İlkadım","district":"İlkadım"},
    {"name":"Mekano Lojistik","contact":"Operasyon Md.","phone":"+90 535 666 77 88","addr":"Karşıyaka Mah. Canik","district":"Canik"},
    {"name":"Birlik Lojistik","contact":"Birlik Grubu","phone":"+90 362 238 44 55","addr":"Selahiye Mah. İlkadım","district":"İlkadım"},
    {"name":"Netlog (Samsun)","contact":"Bölge Müdürü","phone":"+90 362 266 40 40","addr":"Toybelen Mah. Ankara Yolu İlkadım","district":"İlkadım"},
    {"name":"Mars Lojistik (Samsun)","contact":"Şube Müdürü","phone":"+90 362 266 55 55","addr":"Şabanoğlu Mah. Atatürk Bulv. Tekkeköy","district":"Tekkeköy"},
    {"name":"Uniwin Logistics","contact":"","phone":"+90 362 435 00 11","addr":"Reşadiye Mah. İlkadım","district":"İlkadım"},
    {"name":"Hacıoğlu Nakliye","contact":"Hacıoğlu Ailesi","phone":"+90 541 222 33 44","addr":"Yeşilova Mah. Sanayi Cad. Canik","district":"Canik"},
    {"name":"Samsunlular Nakliyat","contact":"","phone":"+90 362 438 10 10","addr":"Yeni Mah. Atakum","district":"Atakum"},
    {"name":"Eigo Global","contact":"","phone":"+90 362 435 55 66","addr":"Derebahçe Mevkii İlkadım","district":"İlkadım"},
    {"name":"Yıldızlar Lojistik","contact":"Yıldız Ailesi","phone":"+90 362 266 12 34","addr":"Şabanoğlu Mah. Sanayi Cad. Tekkeköy","district":"Tekkeköy"},
    {"name":"Borusan Lojistik (Samsun)","contact":"Bölge Md.","phone":"+90 362 445 10 50","addr":"Hançerli Mah. İlkadım","district":"İlkadım"},
    {"name":"Alsa Nakliyat","contact":"Alper Salih","phone":"+90 532 316 96 36","addr":"Gençlik Cad. Bafra","district":"Bafra"},
    {"name":"Ugs Denizcilik","contact":"","phone":"+90 362 445 15 15","addr":"Liman Bölgesi İlkadım","district":"İlkadım"},
    {"name":"Karadeniz Çekici","contact":"","phone":"+90 544 333 44 55","addr":"Belediye Evleri Canik","district":"Canik"},
    {"name":"Altan Lojistik","contact":"","phone":"+90 212 445 25 25","addr":"Karadeniz Mah. İlkadım","district":"İlkadım"},
    {"name":"Dağlı Taşımacılık","contact":"","phone":"+90 362 833 45 45","addr":"Çay Mah. Çarşamba","district":"Çarşamba"},
    {"name":"Güney Lojistik","contact":"","phone":"+90 362 266 77 88","addr":"Örnek Sanayi Tekkeköy","district":"Tekkeköy"},
]

def fmt(p):
    p = re.sub(r'[^\d]', '', p)
    if p.startswith('90') and len(p)==12:
        return f"0{p[2:5]} {p[5:8]} {p[8:10]} {p[10:]}"
    return p

db = SessionLocal()
existing = {c.company_name.upper().strip() for c in db.query(Customer.company_name).all()}

added, skipped = 0, 0
for f in firms:
    if f['name'].upper().strip() in existing:
        skipped += 1
        print(f"  ATLANDI (mevcut): {f['name']}")
        continue
    phone = fmt(f['phone'])
    notes = f"Samsun Lojistik İstihbarat"
    if f['contact']: notes += f" | Yetkili: {f['contact']}"
    notes += f" | Adres: {f['addr']}"

    c = Customer(
        company_name=f['name'], phone=phone, city='Samsun', district=f['district'],
        address=f['addr'], sector='Nakliyat / Lojistik', segment='B',
        potential_level='high', potential_score=75, source='manual_intel',
        sales_notes=notes, is_active=True,
    )
    db.add(c)
    existing.add(f['name'].upper().strip())
    added += 1
    print(f"  + {f['name']:40s} | {phone} | {f['district']}")

db.commit()
total = db.query(Customer).count()
db.close()

print(f"\nTAMAMLANDI! Eklenen: {added} | Atlanan: {skipped} | CRM toplam: {total}")
