import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
sys.stdout.reconfigure(encoding='utf-8')
from app.core.database import SessionLocal
from app.modules.auth.models import User
from app.modules.crm.models import Customer

def sector(name):
    n = name.lower()
    if any(k in n for k in ['nakliyat','nakliye','lojistik','logistics','römork','transport']): return 'Nakliyat / Lojistik','B','high',75
    if any(k in n for k in ['otomotiv','oto ']): return 'Otomotiv','B','high',70
    if any(k in n for k in ['demir','çelik','metal','sac','bakır','boru']): return 'Metal / Demir Çelik','C','medium',60
    if any(k in n for k in ['makina','makine','pompa','endüstriyel']): return 'Makine / Ekipman','C','medium',55
    if any(k in n for k in ['gıda','un ','şekerleme','fındık']): return 'Gıda / Tarım','C','medium',50
    if any(k in n for k in ['yapı','inşaat','cam','kereste','raf','kaplama','hırdavat']): return 'İnşaat / Yapı','C','medium',55
    if any(k in n for k in ['kablo','elektrik','ısı','enerji']): return 'Elektrik / Enerji','C','medium',55
    if any(k in n for k in ['ilaç','sağlık']): return 'Sağlık / İlaç','C','medium',50
    if any(k in n for k in ['sünger','tekstil']): return 'Tekstil','D','low',40
    if any(k in n for k in ['gübre','tarım']): return 'Tarım / Hayvancılık','C','medium',50
    return 'Diğer','C','medium',50

firms = [
    {"name":"Sampa Otomotiv","contact":"Tarık Altuncu","phone":"+90 362 311 00 00","addr":"OSB Erdoğan Tok Cad. No:11 Tekkeköy"},
    {"name":"Recepoğlu Gıda","contact":"Recepoğlu Ailesi","phone":"+90 362 266 51 00","addr":"Kirazlık Mah. Atatürk Bulvarı No:548"},
    {"name":"Yeşilyurt Demir Çelik","contact":"Hikmet Yeşilyurt","phone":"+90 362 266 71 00","addr":"OSB Vali M. Erdoğan Cebeci Bulv."},
    {"name":"Borsan Kablo","contact":"Adnan Ölmez","phone":"+90 362 266 59 25","addr":"OSB Vali M. Erdoğan Cebeci Bulv. No:45"},
    {"name":"Ulusoy Un","contact":"Eren Günhan Ulusoy","phone":"+90 362 266 90 90","addr":"Kirazlık Mah. Atatürk Bulvarı No:580"},
    {"name":"Resman Cam Sanayi","contact":"İsmet Resman","phone":"+90 362 266 92 64","addr":"Kirazlık Mah. 1033. Sokak No:12"},
    {"name":"Domak Pompa","contact":"Mansur Yılmaz","phone":"+90 362 266 90 23","addr":"Örnek Sanayi Sitesi 10. Cad. No:10"},
    {"name":"As Çelik","contact":"Aslan Ailesi","phone":"+90 362 266 56 16","addr":"OSB Vali M. Erdoğan Cebeci Bulv. No:54"},
    {"name":"Özyılmaz Fındık (Sanayi)","contact":"Azmi Yılmaz","phone":"+90 362 833 42 56","addr":"Kirazlık Mevkii Atatürk Bulvarı"},
    {"name":"Adeka İlaç Sanayi (Fabrika)","contact":"Ali Arpacıoğlu","phone":"+90 362 438 41 81","addr":"OSB Vali M. Erdoğan Cebeci Bulv. No:23"},
    {"name":"Samsun Makina Sanayi","contact":"","phone":"+90 362 266 57 84","addr":"OSB Atatürk Bulvarı No:140"},
    {"name":"Karmetal","contact":"","phone":"+90 362 266 99 71","addr":"Örnek Sanayi Sitesi 1024. Sokak"},
    {"name":"Sözdemir Yapı (Sanayi)","contact":"Sözdemir Ailesi","phone":"+90 362 266 62 10","addr":"Kirazlık Mah. Atatürk Bulvarı"},
    {"name":"Arsan Raf Sistemleri","contact":"","phone":"+90 362 266 43 00","addr":"Kirazlık Mah. 1045. Sokak No:11"},
    {"name":"Işıklar Metal","contact":"Işık Ailesi","phone":"+90 362 266 57 93","addr":"Kirazlık Mah. Atatürk Bulvarı No:496"},
    {"name":"Kuzey Isı","contact":"","phone":"+90 362 266 64 66","addr":"Örnek Sanayi Sitesi 1023. Sokak"},
    {"name":"Ayyıldız Endüstriyel","contact":"","phone":"+90 362 266 68 83","addr":"Kirazlık Mah. 1032. Sokak No:24"},
    {"name":"Siteler Hırdavat","contact":"","phone":"+90 362 266 40 40","addr":"Kirazlık Mah. Atatürk Bulvarı No:510"},
    {"name":"Davet Otomotiv","contact":"","phone":"+90 538 861 33 76","addr":"Kirazlık Mah. 1029. Sokak No:12"},
    {"name":"Mistaş Şekerleme","contact":"","phone":"+90 362 266 93 45","addr":"Kirazlık Mah. Atatürk Bulvarı No:522"},
    {"name":"Cam-Por Yapı","contact":"","phone":"+90 362 266 70 70","addr":"Örnek Sanayi Sitesi 1032. Sokak"},
    {"name":"Atn Endüstriyel","contact":"","phone":"+90 362 266 41 81","addr":"Kirazlık Mah. Bayrak Sokak"},
    {"name":"Samsun Sünger","contact":"","phone":"+90 362 266 55 55","addr":"OSB Vali M. Erdoğan Cebeci Bulv."},
    {"name":"Alkılıç Yapı","contact":"","phone":"+90 362 266 66 11","addr":"Kirazlık Mah. Atatürk Bulvarı"},
    {"name":"Emre Teknik","contact":"","phone":"+90 362 266 84 84","addr":"Örnek Sanayi Sitesi 10. Cadde"},
    {"name":"Kar-Ker Kereste","contact":"","phone":"+90 362 266 92 82","addr":"Kirazlık Mah. 1035. Sokak"},
    {"name":"Azam Isı","contact":"","phone":"+90 362 266 44 44","addr":"Kirazlık Mah. Atatürk Bulvarı"},
    {"name":"Demsa Demir","contact":"","phone":"+90 362 266 91 91","addr":"Örnek Sanayi Sitesi 1020. Sokak"},
    {"name":"Öztiryakiler Samsun","contact":"","phone":"+90 362 266 45 45","addr":"Kirazlık Mah. Atatürk Bulvarı"},
    {"name":"Gübre Fabrikaları","contact":"","phone":"+90 362 266 73 00","addr":"Tekkeköy Liman Mevkii"},
    {"name":"Reel 55 Nakliyat","contact":"","phone":"+90 362 266 47 42","addr":"Kirazlık Mah. 1033. Sokak"},
    {"name":"Atlas Römork","contact":"","phone":"+90 362 266 96 00","addr":"Örnek Sanayi Sitesi 12. Cadde"},
    {"name":"Samsun Bakır Boru","contact":"","phone":"+90 362 266 50 50","addr":"OSB Erdoğan Tok Caddesi"},
    {"name":"U.F.T. Logistics","contact":"","phone":"+90 362 266 83 33","addr":"Kirazlık Mah. Atatürk Bulvarı"},
    {"name":"Özfalcı Nakliyat","contact":"","phone":"+90 545 355 55 61","addr":"Kirazlık Mah. Sanayi Cad."},
    {"name":"Global Yapı Market (Sanayi)","contact":"","phone":"+90 362 266 61 71","addr":"Kirazlık Mah. Atatürk Bulvarı"},
    {"name":"Baykar Sac Kesim","contact":"","phone":"+90 362 238 32 99","addr":"Örnek Sanayi Sitesi 11. Cadde"},
    {"name":"DKR Çelik Makina","contact":"","phone":"+90 362 266 42 22","addr":"Kirazlık Mah. 1040. Sokak"},
    {"name":"Yeşildal Makina (Sanayi)","contact":"","phone":"+90 362 266 98 83","addr":"Kirazlık Mah. Atatürk Bulvarı"},
    {"name":"Sandıkçı Otomotiv","contact":"Ahmet Sandıkçı","phone":"+90 362 266 50 11","addr":"Kirazlık Mah. Atatürk Bulvarı"},
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
        print(f"  ATLANDI: {f['name']}")
        continue
    s, seg, pot, score = sector(f['name'])
    phone = fmt(f['phone'])
    notes = f"Samsun OSB/Sanayi İstihbarat"
    if f['contact']: notes += f" | Yetkili: {f['contact']}"
    notes += f" | Adres: {f['addr']}"

    c = Customer(company_name=f['name'], phone=phone, city='Samsun',
        district='Tekkeköy' if 'OSB' in f['addr'] or 'Tekkeköy' in f['addr'] else 'İlkadım',
        address=f['addr'], sector=s, segment=seg, potential_level=pot,
        potential_score=score, source='manual_intel', sales_notes=notes, is_active=True)
    db.add(c)
    existing.add(f['name'].upper().strip())
    added += 1
    print(f"  + {f['name']:40s} | {s:25s} | {seg} | {phone}")

db.commit()
total = db.query(Customer).count()
db.close()
print(f"\nTAMAMLANDI! Eklenen: {added} | Atlanan: {skipped} | CRM toplam: {total}")
