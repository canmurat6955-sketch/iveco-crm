import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
sys.stdout.reconfigure(encoding='utf-8')
from app.core.database import SessionLocal
from app.modules.crm.models import Customer, CustomerContact
from app.modules.auth.models import User

def fmt(p):
    if not p: return None
    p = re.sub(r'[^\d]', '', p)
    if p.startswith('90') and len(p) == 12: return f"0{p[2:5]} {p[5:8]} {p[8:10]} {p[10:]}"
    if len(p) == 11 and p.startswith('0'): return f"0{p[1:4]} {p[4:7]} {p[7:9]} {p[9:]}"
    if len(p) == 10 and not p.startswith('0'): return f"0{p[0:3]} {p[3:6]} {p[6:8]} {p[8:]}"
    return p if len(p) >= 7 else None

firms_data = [
    # --- Samsun ---
    {
        "name": "Kuzey Beton (Kuzey Yakıt Beton Ltd. Şti.)",
        "city": "Samsun", "district": "İlkadım", "phone": "03622751111",
        "email": "info@kuzeybeton.com.tr", "website": "kuzeybeton.com.tr",
        "addr": "Güzel Dere Mah. Irmak Cad. No: 558, İlkadım / Samsun",
        "seg": "B", "pot": "high", "score": 70,
        "contacts": [{"name": "Yılmaz Koca", "role": "Müdür/Sahip", "phone": "05422586855", "is_primary": True}]
    },
    {
        "name": "Gürsoy Hazır Beton",
        "city": "Samsun", "district": "Atakum", "phone": "03624671771",
        "email": "info@gursoybeton.com.tr", "website": "gursoybeton.com.tr",
        "addr": "Çakırlar Yalı Mah. 6548. Sok. No:54 Atakum / Samsun",
        "seg": "B", "pot": "high", "score": 70,
        "contacts": [{"name": "Gürsoy Ailesi", "role": "Yönetim", "is_primary": True}]
    },
    {
        "name": "ÇK Hazır Beton (Çebi Kardeşler)",
        "city": "Samsun", "district": "Kavak", "phone": "03624326827",
        "email": "nazimkadioglu@ckhazirbeton.com", "website": "ckhazirbeton.com",
        "addr": "Emirli Mah. Emirli Sok. Çebi Kardeşler Taş Ocağı, Kavak / Samsun",
        "seg": "B", "pot": "high", "score": 70,
        "contacts": [
            {"name": "Nazım Kadıoğlu", "role": "Yetkili", "is_primary": True},
            {"name": "Çebi Kardeşler", "role": "Ortak", "is_primary": False}
        ]
    },
    {
        "name": "Votorantim Çimento - Samsun",
        "city": "Samsun", "district": "İlkadım", "phone": "03624671717",
        "website": "votorantimcimentos.com.tr",
        "addr": "Toybelen Mah. Anadolu Bulvarı No: 174/1, İlkadım / Samsun (Çarşamba tesisi de var)",
        "seg": "A", "pot": "high", "score": 85
    },
    {
        "name": "Adoçim Çimento Beton A.Ş. - Samsun",
        "city": "Samsun", "district": "İlkadım", "phone": "03622669494",
        "email": "info@adocim.com", "website": "adocim.com",
        "addr": "Yeşiltepe Mah. Irmak Cad. No:600/1, İlkadım / Samsun",
        "seg": "A", "pot": "high", "score": 85
    },
    {
        "name": "Oyak Beton - Samsun",
        "city": "Samsun", "district": "Tekkeköy", "phone": "03622664085",
        "website": "oyakbeton.com.tr",
        "addr": "Kutlukent Organize Sanayi Bölgesi, Tekkeköy / Samsun",
        "seg": "A", "pot": "high", "score": 85
    },
    {
        "name": "Akçansa (Betonsa) - Samsun",
        "city": "Samsun", "district": "İlkadım", "phone": "03622751011",
        "email": "akcansa@akcansa.com.tr", "website": "betonsa.com.tr",
        "addr": "Derecik Mah. Ovalar Cad. 204. Sokak No:2, İlkadım / Samsun",
        "seg": "A", "pot": "high", "score": 85
    },
    {
        "name": "AYBET Beton Prefabrik A.Ş.",
        "city": "Samsun", "district": "Merkez", "phone": "03624878244",
        "email": "aybet@aybet.com", "website": "aybet.com",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "Terme Hazır Beton (Başaranlar)",
        "city": "Samsun", "district": "Terme", "phone": "03628825155",
        "email": "bilgi@termehazirbeton.com",
        "seg": "B", "pot": "high", "score": 70,
        "contacts": [{"name": "Başaranlar Ailesi", "role": "Yönetim", "is_primary": True}]
    },
    {
        "name": "Betosam İnşaat Beton",
        "city": "Samsun", "district": "Tekkeköy", "phone": "03622636363",
        "addr": "Büyüklü Mah. Samsun Cad. No: 1, Tekkeköy / Samsun",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "Aksay İnşaat Hazır Beton",
        "city": "Samsun", "district": "Tekkeköy", "phone": "03622665218",
        "addr": "Kutlukent, Tekkeköy / Samsun",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "Çaksa Beton",
        "city": "Samsun", "seg": "B", "pot": "high", "score": 65
    },
    {
        "name": "Askoç Makina & Beton",
        "city": "Samsun", "district": "Tekkeköy", "seg": "C", "pot": "medium", "score": 55
    },
    {
        "name": "Celepciler Beton",
        "city": "Samsun", "seg": "B", "pot": "high", "score": 65
    },

    # --- Sinop ---
    {
        "name": "Sinop Beton (Sinop Beton Ltd.)",
        "city": "Sinop", "district": "Ayancık", "phone": "03686133339",
        "email": "destek@sinopbeton.com.tr", "website": "sinopbeton.com.tr",
        "addr": "Beşiktaş Mah. Çam Sok. No: 2/A, Ayancık / Sinop",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "Sinop Çetin Hazır Beton",
        "city": "Sinop", "district": "Merkez", "phone": "03682505758",
        "email": "cetinnakliyat@hotmail.com",
        "addr": "Meydankapı Mah. Ergül Sok. No: 1, Sinop Merkez (Tesis: Sinecan Köyü Mevkii)",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "Gerçek Beton (Gerçek Beton & Nakliyat)",
        "city": "Sinop", "district": "Merkez", "phone": "03682899191",
        "addr": "Kabalı B.M. Köyü, Sinop Merkez / Sinop",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "Çakılsan Hazır Beton",
        "city": "Sinop", "district": "Erfelek", "phone": "03685271122",
        "addr": "Kurcalı Köyü, Erfelek / Sinop",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "Ortaklar Group (Gerze)",
        "city": "Sinop", "district": "Gerze", "phone": "05364961742",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "Sinop Dizayn",
        "city": "Sinop", "district": "Merkez", "phone": "05438767756",
        "seg": "C", "pot": "medium", "score": 55,
        "contacts": [{"name": "Hakan Çepur", "role": "Yetkili", "is_primary": True}]
    },
    {
        "name": "Memiş Beton ve Nakliyat",
        "city": "Sinop", "seg": "C", "pot": "medium", "score": 55
    },
    {
        "name": "Kavuncular Hazır Beton",
        "city": "Sinop", "seg": "C", "pot": "medium", "score": 55
    },

    # --- Amasya ---
    {
        "name": "Özen Beton (Özen Hafriyat Kum Ltd. Şti.)",
        "city": "Amasya", "district": "Merkez", "phone": "03582184505",
        "email": "info@ozenbeton.com.tr", "website": "ozenbeton.com.tr",
        "addr": "Hacılar Meydanı Mah. Yavuz Acar Caddesi, Ahenk Apt. No: 116/A, Merkez / Amasya",
        "seg": "B", "pot": "high", "score": 75,
        "contacts": [
            {"name": "Hüsamettin İşleyen", "role": "Ortak", "is_primary": True},
            {"name": "Tacettin Saltaoğlu", "role": "Ortak", "is_primary": False}
        ]
    },
    {
        "name": "Akçansa (Betonsa) - Merzifon",
        "city": "Amasya", "district": "Merzifon", "phone": "03585138800",
        "email": "akcansa@akcansa.com.tr", "website": "betonsa.com.tr",
        "addr": "Buğdaylı Mah. Meray Kavşağı Sok. No: 2, Merzifon / Amasya",
        "seg": "A", "pot": "high", "score": 85
    },
    {
        "name": "Emek Beton Kum",
        "city": "Amasya", "district": "Merkez", "phone": "03582182020",
        "email": "info@emekkum.com.tr", "website": "emekkum.com.tr",
        "addr": "Pirinçci Mah. Atatürk Cad. Yeşilova İş Merkezi No: 29 K:1, Merkez / Amasya",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "Güven İş Hazır Beton",
        "city": "Amasya", "district": "Suluova", "phone": "03584178541",
        "addr": "1 Eylül Mah. İstiklal Cad. No: 588, Suluova / Amasya",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "Betosan Hazır Beton",
        "city": "Amasya", "district": "Merzifon", "phone": "03585134495",
        "addr": "Harmanlar Mah. Zübeyde Hanım Cad. 22/A, Merzifon / Amasya",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "Sağıroğlu Kireç San. Tic. A.Ş.",
        "city": "Amasya", "district": "Merkez", "phone": "03582182635",
        "addr": "Yüzevler Mah. Şair Akif Sok. 29/B, Merkez / Amasya",
        "seg": "C", "pot": "medium", "score": 55
    },
    {
        "name": "Denk Karo San. Tic. Ltd. Şti.",
        "city": "Amasya", "district": "Merzifon", "phone": "03585149777",
        "addr": "Organize Sanayi Bölgesi, Merzifon / Amasya",
        "seg": "C", "pot": "medium", "score": 55
    },

    # --- Tokat ---
    {
        "name": "Adoçim Çimento Beton A.Ş. - Tokat",
        "city": "Tokat", "district": "Merkez", "phone": "03562329192",
        "email": "info@adocim.com", "website": "adocim.com",
        "addr": "Yeniyurt Mah. 3982. Sk. No:20/A, Merkez / Tokat (Tesisler: Tokat Merkez, Artova ve Zile)",
        "seg": "A", "pot": "high", "score": 85
    },
    {
        "name": "Erbaa Beton A.Ş.",
        "city": "Tokat", "district": "Erbaa", "phone": "03567160635",
        "email": "info@erbaabeton.com.tr", "website": "erbaabeton.com.tr",
        "addr": "Erek Mahallesi Harmanlar Mevkii, Erbaa / Tokat",
        "seg": "B", "pot": "high", "score": 75,
        "contacts": [
            {"name": "Orhan Er", "role": "Yetkili", "is_primary": True},
            {"name": "Hüseyin Aktaş", "role": "Satış Müdürü", "is_primary": False},
            {"name": "Onur Er", "role": "Sevkiyat Sorumlusu", "is_primary": False}
        ]
    },
    {
        "name": "Erdem Hazır Beton",
        "city": "Tokat", "district": "Merkez", "phone": "03562441020",
        "email": "erdembeton60@hotmail.com", "website": "erdembeton.com.tr",
        "addr": "Gümenek Parkı Yanı, Döllük Köyü Mevkii, P.K. No:1, Merkez / Tokat",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "Votorantim Çimento - Tokat",
        "city": "Tokat", "district": "Merkez", "phone": "03562320240",
        "website": "votorantimcimentos.com.tr",
        "addr": "Yeniyurt Mah. Vali Zekai Gümüşdiş Blv. No: 3981, Merkez / Tokat",
        "seg": "A", "pot": "high", "score": 85
    },
    {
        "name": "Akçansa (Betonsa) - Tokat",
        "city": "Tokat", "district": "Merkez", "phone": "03562486363",
        "email": "akcansa@akcansa.com.tr",
        "addr": "Gökçe Köyü Tombulkaya Mevkii, Tokat-Sivas Yolu 10. Km, Merkez / Tokat",
        "seg": "A", "pot": "high", "score": 85
    },
    {
        "name": "Niksar Hazır Beton",
        "city": "Tokat", "district": "Niksar", "phone": "03565511192",
        "email": "niksarbeton@niksarbeton.com.tr",
        "addr": "Fatih Mah. Bosna Cad. No:1, Niksar / Tokat",
        "seg": "B", "pot": "high", "score": 75,
        "contacts": [{"name": "Salih Oruç", "role": "Yetkili", "phone": "05415511063", "is_primary": True}]
    },
    {
        "name": "Yanar Beton",
        "city": "Tokat", "district": "Merkez", "phone": "05413757001",
        "addr": "Doğukent Mah. Civarı, Merkez / Tokat",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "Kayalar Beton",
        "city": "Tokat", "district": "Erbaa",
        "seg": "B", "pot": "high", "score": 70,
        "contacts": [{"name": "Ertuğrul Kaya", "role": "Yetkili", "is_primary": True}]
    },
    {
        "name": "Erkar İnşaat (Zile)",
        "city": "Tokat", "district": "Zile", "phone": "03563180348",
        "addr": "Nakkaş Mah. Nato Yolu Cad. No: 30, Zile / Tokat",
        "seg": "C", "pot": "medium", "score": 55
    },
    {
        "name": "Altın Parke İnşaat",
        "city": "Tokat", "district": "Turhal", "phone": "05365535208",
        "addr": "Borsa Mah. Amasya Yolu, Turhal / Tokat",
        "seg": "C", "pot": "medium", "score": 55
    },

    # --- Çorum ---
    {
        "name": "Berra Beton Ltd. Şti.",
        "city": "Çorum", "district": "Merkez", "phone": "03647770019",
        "email": "bilgi@berrabeton.com", "website": "berrabeton.com",
        "addr": "Buharaevler, Kamışlı Evler Cd., Merkez / Çorum",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "Dalgıçlar Beton (Dalgıçlar Grup)",
        "city": "Çorum", "district": "Merkez", "phone": "05336846247",
        "email": "info@dalgiclar.tr", "website": "dalgiclar.tr",
        "addr": "Gülabibey, Cemilbey Yolu 3. Km, Merkez / Çorum",
        "seg": "B", "pot": "high", "score": 75,
        "contacts": [{"name": "Güvenç Dalgıç", "role": "Yetkili", "is_primary": True}]
    },
    {
        "name": "Karabeyoğlu Beton",
        "city": "Çorum", "district": "Merkez", "phone": "03642350019",
        "addr": "Mimarsinan Mah. Ankara Yolu, Merkez / Çorum",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "Adoçim Çimento Beton - Çorum",
        "city": "Çorum", "district": "Merkez", "phone": "03642240746",
        "email": "info@adocim.com",
        "addr": "Mimar Sinan Mah. Ankara Yolu 1. Cad. No: 34, Merkez / Çorum",
        "seg": "A", "pot": "high", "score": 85
    },
    {
        "name": "Estaş Hazır Beton",
        "city": "Çorum", "district": "Osmancık", "phone": "05336858188",
        "email": "estasbeton@hotmail.com", "website": "estasbeton.com",
        "addr": "Hıdırlık Mah. Gazi Cemal Erturan Sk. No: 2, Osmancık / Çorum",
        "seg": "B", "pot": "high", "score": 75,
        "contacts": [{"name": "Göbel Ailesi", "role": "Yönetim/Varisler", "is_primary": True}]
    },
    {
        "name": "Hattuşaş Hazır Beton",
        "city": "Çorum", "district": "Sungurlu", "phone": "05304941409",
        "email": "info@hattusasbeton.com", "website": "hattusasbeton.com",
        "addr": "Sungurlu / Çorum (Ayrıca Alaca, Boğazkale vb.)",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "HNN Beton (Alaca & Sungurlu)",
        "city": "Çorum", "district": "Alaca", "phone": "03642101053",
        "addr": "Alaca Yozgat Yolu 1. Km, Alaca / B. İncesu Köyü Yolu 2. Km, Sungurlu",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "Serra Maden Beton",
        "city": "Çorum", "district": "Merkez", "phone": "05334160234",
        "addr": "Osmancık Yolu, Merkez / Çorum",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "Onur Hazır Beton",
        "city": "Çorum", "district": "Merkez", "phone": "03642401212",
        "addr": "Mimarsinan Mah. Ankara Yolu 1. Cad. No: 32, Merkez / Çorum",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "Osyap Yapı",
        "city": "Çorum", "district": "Osmancık", "phone": "03646119919",
        "addr": "Çiftlikler Mah. Akyokuş, Osmancık / Çorum",
        "seg": "C", "pot": "medium", "score": 55
    },
    {
        "name": "Delice Hazır Beton",
        "city": "Çorum", "phone": "05050550019", "email": "info@delicehazirbeton.com",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "Baştaş Hazır Beton",
        "city": "Çorum", "phone": "05339262575",
        "seg": "B", "pot": "high", "score": 70
    },
    {
        "name": "İkram Hazır Beton",
        "city": "Çorum", "district": "Merkez", "phone": "03642263891",
        "seg": "B", "pot": "high", "score": 70
    }
]

db = SessionLocal()
existing = {c.company_name.upper().strip() for c in db.query(Customer.company_name).all()}
added_firms, added_contacts, skipped = 0, 0, 0

for firm in firms_data:
    name = firm['name'].strip()
    if name.upper() in existing:
        skipped += 1
        continue
    
    phone = fmt(firm.get('phone', ''))
    notes = f"Sektör: Hazır Beton / Çimento | Kaynak: Web Araştırması"
    if firm.get('addr'):
        notes += f" | Adres: {firm['addr']}"
        
    cust = Customer(
        company_name=name,
        phone=phone,
        email=firm.get('email'),
        website=firm.get('website'),
        city=firm.get('city'),
        district=firm.get('district'),
        address=firm.get('addr'),
        sector="İnşaat / Hazır Beton",
        segment=firm.get('seg', 'B'),
        potential_level=firm.get('pot', 'high'),
        potential_score=firm.get('score', 70),
        source='discovery',
        sales_notes=notes,
        pipeline_stage='lead',
        is_active=True
    )
    db.add(cust)
    db.flush()  # ID almak için veritabanına gönderiyoruz
    
    # 📌 İrtibat kişilerini ekleyelim
    for c_info in firm.get('contacts', []):
        contact_phone = fmt(c_info.get('phone', '')) if c_info.get('phone') else None
        contact = CustomerContact(
            customer_id=cust.id,
            contact_name=c_info['name'],
            role=c_info.get('role', 'Yetkili'),
            phone=contact_phone,
            is_primary=c_info.get('is_primary', False)
        )
        db.add(contact)
        added_contacts += 1
        
    existing.add(name.upper())
    added_firms += 1

db.commit()
total = db.query(Customer).count()
db.close()

print(f"TAMAMLANDI! Eklenen Firma: {added_firms} | Eklenen İrtibat: {added_contacts} | Atlanan (Mevcut): {skipped} | CRM Toplam Müşteri: {total}")
