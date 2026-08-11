import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
sys.stdout.reconfigure(encoding='utf-8')
from app.core.database import SessionLocal
from app.modules.auth.models import User
from app.modules.crm.models import Customer

firms = [
    {"name":"Sarplast Plastik Sanayi","contact":"Hamdi Sar","phone":"+90 362 266 55 20","addr":"İstiklal, Atatürk Bl. No:151, Tekkeköy/Samsun","city":"Samsun","district":"Tekkeköy"},
    {"name":"Hakan Ambalaj","contact":"","phone":"+90 362 266 96 76","addr":"Şabanoğlu, 61. Sk. No:65, Tekkeköy/Samsun","city":"Samsun","district":"Tekkeköy"},
    {"name":"Orpack Ambalaj","contact":"","phone":"+90 452 234 12 12","addr":"Karapınar OSB Mah. 1163. Sk. No:6 Altınordu/Ordu","city":"Ordu","district":"Altınordu"},
    {"name":"Araboğlu Plastik Ambalaj","contact":"","phone":"+90 362 431 59 39","addr":"Kıran Mah. Gıda Borsası F Blok No:1 İlkadım/Samsun","city":"Samsun","district":"İlkadım"},
    {"name":"Hilal Plasper Plastik","contact":"Tuba Günay Başgöl","phone":"+90 541 577 09 77","addr":"Yeni Cami OSB Mah. 4. Cadde No:8 Kavak/Samsun","city":"Samsun","district":"Kavak"},
    {"name":"Hürsan Ambalaj","contact":"","phone":"+90 452 888 54 44","addr":"Şirinevler Mah. 662. Sk No:7/B Altınordu/Ordu","city":"Ordu","district":"Altınordu"},
    {"name":"Çelebiler Plastik","contact":"","phone":"+90 452 233 17 03","addr":"Karapınar OSB Mah. 1168. Sok. No:3 Altınordu/Ordu","city":"Ordu","district":"Altınordu"},
    {"name":"Emek Ambalaj","contact":"Ahmet Eker","phone":"+90 452 214 98 09","addr":"Bucak Mah. 22 Nolu Sok. No:13 Altınordu/Ordu","city":"Ordu","district":"Altınordu"},
    {"name":"İz Ambalaj Sanayi","contact":"Sabri Kiriş","phone":"+90 452 777 52 51","addr":"Akyazı Mah. 878. Sokak No:4 Altınordu/Ordu","city":"Ordu","district":"Altınordu"},
    {"name":"Karadeniz Toptan Ambalaj","contact":"","phone":"+90 362 233 44 55","addr":"Derebahçe Mah. 1827. Sokak No:9/A İlkadım/Samsun","city":"Samsun","district":"İlkadım"},
    {"name":"Ambalaj Dünyası","contact":"","phone":"+90 545 461 09 61","addr":"Balaç, Alparslan Blv. No:125/D Atakum/Samsun","city":"Samsun","district":"Atakum"},
    {"name":"Aydın Ambalaj","contact":"Mevlüt Aydın","phone":"+90 452 214 42 28","addr":"Zübeyde Hanım Cad. No:103/B Altınordu/Ordu","city":"Ordu","district":"Altınordu"},
    {"name":"Ordu Ambalaj ve Plastik","contact":"","phone":"+90 505 544 86 11","addr":"Yenimahalle, İsmetpaşa Cad. No:75/A Altınordu/Ordu","city":"Ordu","district":"Altınordu"},
    {"name":"Özbey Ambalaj","contact":"","phone":"+90 541 834 15 88","addr":"Soğuksu Mah. F.S.M. Cad. No:14/B Kavak/Samsun","city":"Samsun","district":"Kavak"},
    {"name":"Sercan Kağıtçılık","contact":"Hasan Alptekin","phone":"+90 452 223 09 88","addr":"Şarkiye Mah. Fatma Hatun Sok. No:34/B Altınordu/Ordu","city":"Ordu","district":"Altınordu"},
    {"name":"Güven Poşet Kağıt","contact":"Ali Güven Gürel","phone":"+90 452 214 24 47","addr":"Yeni Mah. İsmetpaşa Cad. No:17 Altınordu/Ordu","city":"Ordu","district":"Altınordu"},
    {"name":"Saathane Ambalaj","contact":"","phone":"+90 552 077 53 06","addr":"Pazar, Cami Kebir Sk. No:4 İlkadım/Samsun","city":"Samsun","district":"İlkadım"},
    {"name":"Okyanus Kutu Ambalaj","contact":"","phone":"+90 362 266 50 11","addr":"Şabanoğlu Mah. 59. Sokak No:59 Tekkeköy/Samsun","city":"Samsun","district":"Tekkeköy"},
    {"name":"Kırca Gıda (Ambalaj)","contact":"Birol Kırca","phone":"+90 452 323 27 17","addr":"Liseler Mah. Niksar Cad. No:151/A Ünye/Ordu","city":"Ordu","district":"Ünye"},
    {"name":"Şahin Kağıtçılık","contact":"Bülent Şahin","phone":"+90 452 211 00 22","addr":"Selimiye Mah. İnayet Sıtkı Cad. Altınordu/Ordu","city":"Ordu","district":"Altınordu"},
]

def fmt(p):
    p = re.sub(r'[^\d]', '', p)
    if p.startswith('90') and len(p)==12: return f"0{p[2:5]} {p[5:8]} {p[8:10]} {p[10:]}"
    return p

db = SessionLocal()
existing = {c.company_name.upper().strip() for c in db.query(Customer.company_name).all()}
added, skipped = 0, 0

for f in firms:
    if f['name'].upper().strip() in existing:
        skipped += 1; continue
    phone = fmt(f['phone'])
    notes = f"Ambalaj/Plastik Sektörü İstihbarat"
    if f['contact']: notes += f" | Yetkili: {f['contact']}"
    notes += f" | Adres: {f['addr']}"
    c = Customer(company_name=f['name'], phone=phone, city=f['city'], district=f['district'],
        address=f['addr'], sector='Plastik / Ambalaj', segment='C', potential_level='medium',
        potential_score=50, source='manual_intel', sales_notes=notes, is_active=True)
    db.add(c)
    existing.add(f['name'].upper().strip())
    added += 1
    print(f"  + {f['name']:35s} | {f['city']:7s} | {phone}")

db.commit()
total = db.query(Customer).count()
db.close()
print(f"\nTAMAMLANDI! Eklenen: {added} | Atlanan: {skipped} | CRM toplam: {total}")
