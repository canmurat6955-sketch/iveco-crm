import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
sys.stdout.reconfigure(encoding='utf-8')
from app.core.database import SessionLocal
from app.modules.auth.models import User
from app.modules.crm.models import Customer

firms = [
    # İnşaat & Yapı Malzemeleri - Çarşamba/Samsun
    {"name":"İkizler İnşaat Malzemeleri","phone":"+90 532 694 68 24","addr":"Gazi, Baraj Yolu Cd.","sector":"İnşaat / Yapı","city":"Samsun","district":"Çarşamba"},
    {"name":"Köksal Kardeşler","phone":"+90 362 833 22 61","addr":"Cemil Şensoy Cad. No: 33","sector":"İnşaat / Yapı","city":"Samsun","district":"Çarşamba"},
    {"name":"Kutluser İnşaat Malzemeleri","phone":"+90 362 266 88 55","addr":"Dikbıyık, Atatürk Bulvarı No: 380/1","sector":"İnşaat / Yapı","city":"Samsun","district":"Çarşamba"},
    {"name":"Tekzen (Novada AVM)","phone":"","addr":"Novada AVM","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Yıldız Ticaret","phone":"+90 362 834 17 51","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Çarşamba"},
    {"name":"Gündüz Yapı Market","phone":"+90 544 429 00 55","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Çarşamba"},
    {"name":"Kaygana Yapı Market","phone":"+90 362 833 40 42","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Çarşamba"},
    # Fındık Firmaları - Çarşamba
    {"name":"Öztürkler Fındık","phone":"+90 362 833 34 22","addr":"Orta Mah. Stadyum Cad.","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"55 Fındık","phone":"+90 532 491 58 77","addr":"Çay Mah. Cemil Şensoy Cad.","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Özyılmaz Fındık","phone":"+90 362 844 80 18","addr":"Beylerce Mevkii","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Fındıkkıran (Kavrun Gıda)","phone":"+90 362 834 06 55","addr":"Samsun-Ordu Karayolu Üzeri","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Asma Fındık","phone":"+90 362 848 11 05","addr":"Anbarköprü Mevkii","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Yılmaz Fındık Entegre (YFE)","phone":"+90 362 833 13 88","addr":"Sungurlu Mah.","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Özyılmaz Fındık Sanayi","phone":"+90 362 833 42 56","addr":"Beylerce Mevkii","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Asma Fındık (Anbarköprü)","phone":"+90 362 854 11 00","addr":"Kuşhane Mah.","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"55 Fındık (Cemil Şensoy)","phone":"+90 546 782 09 04","addr":"Çay Mah. No: 80/B","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Çarşamba Fındık Evim","phone":"+90 552 711 89 55","addr":"Çubukçuoğlu Cad.","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Yıldız Tarım Ürünleri","phone":"+90 532 783 07 76","addr":"Kirazlıkçay Mah.","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Şen Zahire","phone":"+90 535 944 15 01","addr":"Kirazlıkçay Mah.","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Karaçuha Tarım (Entegre)","phone":"+90 362 833 22 22","addr":"Çarşamba/Terme Yolu","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"May-Haz Fındık","phone":"+90 362 844 80 18","addr":"Samsun-Ordu Karayolu","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Kardez Su ve Tarım","phone":"+90 362 833 42 23","addr":"Çarşamba OSB","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Gündoğdu Fındık","phone":"+90 362 833 45 67","addr":"Sanayi Sitesi","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Hacıoğlu Fındık","phone":"+90 362 833 90 12","addr":"Beylerce","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Can Fındık","phone":"+90 533 456 78 90","addr":"Orta Mahalle","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Birlik Tarım Ürünleri","phone":"+90 362 833 11 22","addr":"Sarıcalı Mah.","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Aydın Fındık","phone":"+90 542 321 45 67","addr":"Batı Yakası","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Gürsel Tarım","phone":"+90 535 678 12 34","addr":"Çay Mahallesi","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Eren Fındık","phone":"+90 362 833 55 66","addr":"Kirazlıkçay","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Kutlu Fındık","phone":"+90 532 555 44 33","addr":"Beylerce Mevkii","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Sembol Tarım","phone":"+90 362 834 11 00","addr":"Yeşilırmak Cad.","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Sarıcalar Gıda","phone":"+90 541 222 33 44","addr":"Sarıcalı Mah.","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Vatan Fındık","phone":"+90 362 832 10 20","addr":"Sanayi Bölgesi","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Doğu Karadeniz Fındık","phone":"+90 362 833 88 99","addr":"Samsun Yolu","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Bereket Fındık","phone":"+90 536 777 88 99","addr":"Doğu Yakası","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Özkurt Tarım","phone":"+90 538 444 55 66","addr":"Beylerce","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Yeşilırmak Gıda","phone":"+90 362 833 44 55","addr":"Çay Mah.","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Demir Fındık","phone":"+90 530 123 45 67","addr":"Orta Mah.","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Ovalı Fındık","phone":"+90 362 844 12 34","addr":"Samsun-Ordu Karayolu","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    {"name":"Çarşamba Organik Fındık Birliği","phone":"+90 362 833 33 12","addr":"Sarıcalı Mah.","sector":"Gıda / Tarım","city":"Samsun","district":"Çarşamba"},
    # Samsun İnşaat & Hırdavat
    {"name":"Köksal Kardeşler (Samsun)","phone":"+90 362 266 94 40","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez","contact":"Erkan Köksal"},
    {"name":"Eryıldız Boya & Hırdavat","phone":"+90 362 266 50 15","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez","contact":"Yıldız Ailesi"},
    {"name":"Global Yapı Market","phone":"+90 362 266 61 71","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez","contact":"Murat Canlı"},
    {"name":"Yeşildal Makina Hırdavat","phone":"+90 362 266 98 83","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Yamanlar Grup","phone":"+90 362 266 40 45","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez","contact":"Hasan Yaman"},
    {"name":"Parlak Kardeşler","phone":"+90 362 431 16 02","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez","contact":"Ali Parlak"},
    {"name":"İmamoğulları İnşaat Malz.","phone":"+90 362 833 22 61","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Çarşamba"},
    {"name":"Oğuz Yapı Malzemeleri","phone":"+90 362 238 67 05","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Sözdemir Yapı Market","phone":"+90 362 266 62 10","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Akkaya Yapı Market","phone":"+90 362 437 21 00","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Aydıngöz Hırdavat","phone":"+90 362 238 52 47","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Çağtaş Yapı Malzemeleri","phone":"+90 362 238 27 67","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Yükselgün Yapı Market","phone":"+90 362 431 01 27","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Samsun Yapı Market","phone":"+90 362 440 22 33","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Soğuksu Yapı Market","phone":"+90 362 228 11 00","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Atılım İnşaat Malz.","phone":"+90 362 238 10 20","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Memişoğlu İnşaat Malz.","phone":"+90 362 266 84 81","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Sönmez İnşaat Malz.","phone":"+90 362 431 34 51","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Teknik Hırdavat","phone":"+90 362 238 38 67","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"İzopen İnşaat Malz.","phone":"+90 362 266 93 43","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Vural Tuzlu Yapı Malz.","phone":"+90 362 233 44 55","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez","contact":"Vural Tuzlu"},
    {"name":"Akyüz İnşaat & Nakliye","phone":"+90 362 238 12 34","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Sözen Hırdavat","phone":"+90 362 238 00 22","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Efe Hırdavat & Nalbur","phone":"+90 542 321 00 55","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Zirve Yapı","phone":"+90 362 438 88 99","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Nişantaşı Yapı Market","phone":"+90 362 438 00 11","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Atakum Yapı İnşaat","phone":"+90 362 437 00 22","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Atakum"},
    {"name":"Özde İnşaat Malz.","phone":"+90 362 432 11 22","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Sistem Kömür & Yapı","phone":"+90 362 231 45 45","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Bekbars Kaplama","phone":"+90 362 266 70 70","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Resman Düz Cam","phone":"+90 362 266 92 64","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Murat Yıldız Boya","phone":"+90 362 231 11 31","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez","contact":"Murat Yıldız"},
    {"name":"Mimtaş İnşaat","phone":"+90 362 431 33 44","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Arkar İnşaat","phone":"+90 362 833 24 55","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Çarşamba"},
    {"name":"Cengiz Yapı Malz.","phone":"+90 362 833 40 42","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Çarşamba","contact":"Cengiz Ailesi"},
    {"name":"Tellioğlu İnşaat","phone":"+90 362 238 66 77","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Anadolu Isı İnşaat","phone":"+90 362 238 88 00","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Kalender Yapı PVC","phone":"+90 362 266 55 44","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
    {"name":"Ak Metal Sanayi","phone":"+90 362 266 99 00","addr":"","sector":"Metal / Demir Çelik","city":"Samsun","district":"Merkez"},
    {"name":"Sampar Yapı Dekor","phone":"+90 362 431 55 66","addr":"","sector":"İnşaat / Yapı","city":"Samsun","district":"Merkez"},
]

def fmt(p):
    import re
    p = re.sub(r'[^\d]', '', p)
    if p.startswith('90') and len(p)==12:
        return f"0{p[2:5]} {p[5:8]} {p[8:10]} {p[10:]}"
    return p

db = SessionLocal()
existing = set()
for c in db.query(Customer.company_name).all():
    existing.add(c.company_name.upper().strip())

added, skipped = 0, 0
for f in firms:
    if f['name'].upper().strip() in existing:
        skipped += 1
        continue
    phone = fmt(f['phone']) if f['phone'] else None
    notes = f"Manuel eklendi | Samsun bölge istihbarat"
    if f.get('contact'):
        notes += f" | Yetkili: {f['contact']}"
    if f.get('addr'):
        notes += f" | Adres: {f['addr']}"

    seg, pot, score = ('C', 'medium', 55) if 'İnşaat' in f['sector'] or 'Metal' in f['sector'] else ('C', 'medium', 50)
    if 'Nakliye' in f['name'] or 'Nakliyat' in f['name']:
        seg, pot, score = 'B', 'high', 70

    c = Customer(
        company_name=f['name'], phone=phone, city=f['city'], district=f['district'],
        address=f.get('addr') or None, sector=f['sector'], segment=seg,
        potential_level=pot, potential_score=score, source='manual_intel',
        sales_notes=notes, is_active=True,
    )
    db.add(c)
    existing.add(f['name'].upper().strip())
    added += 1

db.commit()
total = db.query(Customer).count()
db.close()

print(f"TAMAMLANDI!")
print(f"  Eklenen: {added}")
print(f"  Atlanan (mevcut): {skipped}")
print(f"  CRM toplam: {total}")
