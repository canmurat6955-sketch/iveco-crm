"""
Orta Karadeniz ve Hedef 9 İl İçin Gerçekçi Ticaret Sicil, Üst Yapıcı ve İhale Verisi Tohumlayıcı
Hedef İller: Samsun, Ordu, Sivas, Giresun, Çorum, Amasya, Sinop, Tokat, Kastamonu.
"""

from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.modules.discovery.models import (
    NewCompanyRegistration, BodybuilderPartner, BodybuilderReferral, Tender
)

REGIONAL_NEW_COMPANIES = [
    # Samsun
    {
        "company_name": "Karadeniz Frigo Lojistik ve Gıda Dağıtım Ltd. Şti.",
        "nace_code": "49.41.01",
        "nace_description": "Karayolu ile şehirler arası soğuk zincir yük taşımacılığı",
        "city": "Samsun",
        "district": "Tekkeköy",
        "capital": "1.500.000 TL",
        "phone": "0362 266 70 80",
        "address": "Tekkeköy OSB Sosyal Tesisler Yanı No:14 Tekkeköy / Samsun",
        "registration_days_ago": 4
    },
    {
        "company_name": "Canik Toptan Meşrubat ve Gıda Pazarlama San. A.Ş.",
        "nace_code": "46.34.01",
        "nace_description": "İçecek ve meşrubat toptan ticareti, bölge bayiliği",
        "city": "Samsun",
        "district": "Canik",
        "capital": "3.000.000 TL",
        "phone": "0362 238 45 12",
        "address": "Yeni Mahalle Şehit Mesut Birinci Cad. No:82 Canik / Samsun",
        "registration_days_ago": 7
    },
    {
        "company_name": "Bafra Ovası Sebze Meyve Paketleme ve Sevkiyat Ltd. Şti.",
        "nace_code": "46.31.02",
        "nace_description": "Taze meyve ve sebzelerin toptan ticareti ve kasalama",
        "city": "Samsun",
        "district": "Bafra",
        "capital": "2.200.000 TL",
        "phone": "0362 543 88 19",
        "address": "Bafra Hal İçi Blok C No:12 Bafra / Samsun",
        "registration_days_ago": 11
    },
    {
        "company_name": "Yeşilırmak Hazır Harç ve İnşaat Malzemeleri Ltd. Şti.",
        "nace_code": "46.73.01",
        "nace_description": "Çimento, kireç, alçı ve inşaat agregası toptan ticareti",
        "city": "Samsun",
        "district": "Çarşamba",
        "capital": "4.500.000 TL",
        "phone": "0362 833 24 50",
        "address": "Sanayi Sitesi 18. Blok No:4 Çarşamba / Samsun",
        "registration_days_ago": 14
    },
    {
        "company_name": "19 Mayıs Kurtarma ve Vinç Hizmetleri San. Ltd.",
        "nace_code": "52.21.04",
        "nace_description": "Karayolu çekici, oto kurtarma ve yol yardım faaliyetleri",
        "city": "Samsun",
        "district": "İlkadım",
        "capital": "1.000.000 TL",
        "phone": "0362 228 90 30",
        "address": "Kıran Mahallesi Barış Bulvarı No:142 İlkadım / Samsun",
        "registration_days_ago": 18
    },

    # Ordu
    {
        "company_name": "Karadeniz Fındık Entegre Nakliyat ve Ambar Ltd. Şti.",
        "nace_code": "49.41.02",
        "nace_description": "Kuru yemiş, kabuklu fındık ve paletli gıda nakliyesi ambarı",
        "city": "Ordu",
        "district": "Altınordu",
        "capital": "2.000.000 TL",
        "phone": "0452 233 60 70",
        "address": "Ordu Organize Sanayi Bölgesi 2. Cad. No:9 Altınordu / Ordu",
        "registration_days_ago": 5
    },
    {
        "company_name": "Fatsa Deniz Ürünleri Soğuk Hava Deposu Ltd.",
        "nace_code": "52.10.02",
        "nace_description": "Dondurulmuş balık ve deniz ürünleri depolama ve sevkiyat",
        "city": "Ordu",
        "district": "Fatsa",
        "capital": "3.500.000 TL",
        "phone": "0452 423 15 80",
        "address": "Fatsa OSB 1. Cad. No:16 Fatsa / Ordu",
        "registration_days_ago": 9
    },
    {
        "company_name": "Ünye Çimento Yapı Malzemeleri ve Hafriyat A.Ş.",
        "nace_code": "43.12.01",
        "nace_description": "Zemin hazırlama, kazı ve hafriyat işleri",
        "city": "Ordu",
        "district": "Ünye",
        "capital": "5.000.000 TL",
        "phone": "0452 324 88 40",
        "address": "Sanayi Sitesi Devlet Sahil Yolu No:205 Ünye / Ordu",
        "registration_days_ago": 16
    },

    # Çorum
    {
        "company_name": "Hitit Un ve Yem Dağıtım Lojistik Ltd. Şti.",
        "nace_code": "46.21.01",
        "nace_description": "Tahıl, tohum ve hayvan yemi toptan ticareti ve dağıtımı",
        "city": "Çorum",
        "district": "Merkez",
        "capital": "4.000.000 TL",
        "phone": "0364 254 90 20",
        "address": "Çorum Organize Sanayi Bölgesi 5. Cad. No:11 Merkez / Çorum",
        "registration_days_ago": 6
    },
    {
        "company_name": "Sungurlu Kardeşler Toprak Sanayi ve Kiremit Nakliyat",
        "nace_code": "23.32.01",
        "nace_description": "Pişmiş kilden tuğla, kiremit imalatı ve şantiye sevkiyatı",
        "city": "Çorum",
        "district": "Sungurlu",
        "capital": "2.800.000 TL",
        "phone": "0364 311 44 55",
        "address": "Ankara Asfaltı 5. Km Sungurlu / Çorum",
        "registration_days_ago": 12
    },

    # Sivas
    {
        "company_name": "Demirağ Metal Hurda ve Ağır Nakliyat San. Ltd.",
        "nace_code": "46.77.01",
        "nace_description": "Hurda ve metal atık toptan ticareti ve ağır araç sevkiyatı",
        "city": "Sivas",
        "district": "Merkez",
        "capital": "3.500.000 TL",
        "phone": "0346 226 12 34",
        "address": "Sivas 1. Organize Sanayi Bölgesi 8. Sokak No:7 Sivas",
        "registration_days_ago": 8
    },
    {
        "company_name": "Şarkışla Canlı Hayvan ve Et Nakliyesi Ltd. Şti.",
        "nace_code": "49.41.01",
        "nace_description": "Canlı hayvan ve et karkas özel taşıma kasası işletmeciliği",
        "city": "Sivas",
        "district": "Şarkışla",
        "capital": "2.000.000 TL",
        "phone": "0346 616 25 50",
        "address": "Hayvan Pazarı Karşısı No:18 Şarkışla / Sivas",
        "registration_days_ago": 15
    },

    # Giresun
    {
        "company_name": "Bulancak Soğuk Depo ve Lojistik Hizmetleri Ltd.",
        "nace_code": "52.10.02",
        "nace_description": "Dondurulmuş gıda, fındık ve soğuk zincir lojistiği",
        "city": "Giresun",
        "district": "Bulancak",
        "capital": "2.500.000 TL",
        "phone": "0454 343 55 60",
        "address": "Giresun 2. OSB Bulancak / Giresun",
        "registration_days_ago": 10
    },
    {
        "company_name": "Giresun Çözüm Temizlik ve Katı Atık Nakliyat A.Ş.",
        "nace_code": "38.11.01",
        "nace_description": "Tehlikesiz katı atık toplama ve belediye taşeron nakliyesi",
        "city": "Giresun",
        "district": "Merkez",
        "capital": "1.800.000 TL",
        "phone": "0454 216 40 20",
        "address": "Teyyaredüzü Mah. Atatürk Bulvarı No:312 Giresun",
        "registration_days_ago": 20
    },

    # Amasya
    {
        "company_name": "Merzifon Beyaz Eşya Lojistik ve Dağıtım Ltd. Şti.",
        "nace_code": "49.41.03",
        "nace_description": "Ev aletleri, ankastre ve beyaz eşya paletli nakliyesi",
        "city": "Amasya",
        "district": "Merzifon",
        "capital": "3.200.000 TL",
        "phone": "0358 513 80 90",
        "address": "Merzifon OSB 3. Cadde No:8 Merzifon / Amasya",
        "registration_days_ago": 5
    },
    {
        "company_name": "Suluova Et Entegre ve Canlı Hayvan Pazarlama Ltd.",
        "nace_code": "10.11.01",
        "nace_description": "Büyükbaş et kesimi, frigo dağıtımı ve şarküteri toptan",
        "city": "Amasya",
        "district": "Suluova",
        "capital": "4.500.000 TL",
        "phone": "0358 417 33 22",
        "address": "Suluova Kırmızı Et İhtisas OSB No:5 Suluova / Amasya",
        "registration_days_ago": 13
    },

    # Sinop
    {
        "company_name": "Boyabat Tuğla ve İnşaat Taahhüt San. Ltd.",
        "nace_code": "23.32.01",
        "nace_description": "Tuğla, kiremit imalatı ve açık kasa kamyon sevkiyatı",
        "city": "Sinop",
        "district": "Boyabat",
        "capital": "2.400.000 TL",
        "phone": "0368 315 22 10",
        "address": "Boyabat Sanayi Sitesi No:74 Boyabat / Sinop",
        "registration_days_ago": 9
    },
    {
        "company_name": "Sinop Karadeniz Balıkçılık Soğuk Hava Deposu Ltd.",
        "nace_code": "10.20.03",
        "nace_description": "Balık dondurma, şoklama ve frigorifik nakliye",
        "city": "Sinop",
        "district": "Merkez",
        "capital": "3.000.000 TL",
        "phone": "0368 261 45 60",
        "address": "Liman İçi Soğuk Hava Tesisleri No:4 Sinop",
        "registration_days_ago": 17
    },

    # Tokat
    {
        "company_name": "Erbaa Yaprak ve Konserve Gıda Lojistik A.Ş.",
        "nace_code": "10.39.02",
        "nace_description": "Sebze konservesi, salamura yaprak imalatı ve dağıtımı",
        "city": "Tokat",
        "district": "Erbaa",
        "capital": "3.800.000 TL",
        "phone": "0356 715 40 30",
        "address": "Erbaa Organize Sanayi Bölgesi 2. Blok No:14 Erbaa / Tokat",
        "registration_days_ago": 7
    },
    {
        "company_name": "Turhal Pancar ve Yem Sevkiyat Kooperatif Ortaklığı Ltd.",
        "nace_code": "49.41.01",
        "nace_description": "Şeker pancarı, küspe ve tarımsal dökme yük taşımacılığı",
        "city": "Tokat",
        "district": "Turhal",
        "capital": "2.100.000 TL",
        "phone": "0356 275 19 80",
        "address": "Şeker Fabrikası Yolu Üzeri No:42 Turhal / Tokat",
        "registration_days_ago": 19
    },

    # Kastamonu
    {
        "company_name": "Tosya Ahşap Kapı ve Orman Ürünleri Nakliyat San. Ltd.",
        "nace_code": "16.23.01",
        "nace_description": "Ahşap panel kapı, kereste toptan ticareti ve kapalı kasa dağıtımı",
        "city": "Kastamonu",
        "district": "Tosya",
        "capital": "3.500.000 TL",
        "phone": "0366 313 50 60",
        "address": "Tosya Organize Sanayi Bölgesi No:18 Tosya / Kastamonu",
        "registration_days_ago": 8
    },
    {
        "company_name": "Kastamonu Entegre Süt ve Şarküteri Ürünleri Ltd. Şti.",
        "nace_code": "10.51.01",
        "nace_description": "Süt işleme, peynir imalatı ve frigorifik zincir dağıtımı",
        "city": "Kastamonu",
        "district": "Merkez",
        "capital": "2.600.000 TL",
        "phone": "0366 214 77 90",
        "address": "Kastamonu Merkez OSB 1. Cad. No:9 Kastamonu",
        "registration_days_ago": 16
    }
]


REGIONAL_BODYBUILDERS = [
    # Samsun
    {
        "company_name": "Samsun Karadeniz Damper ve Kasa Sanayi",
        "contact_person": "Mustafa Usta (Karoser Uzmanı)",
        "phone": "0362 266 55 40",
        "city": "Samsun",
        "district": "Tekkeköy",
        "specialty": "Açık Sac Kasa, Damper & Ahşap Taban",
        "address": "Tekkeköy Sanayi Sitesi 14. Blok No:8 Tekkeköy / Samsun",
        "notes": "Iveco Daily 35C16 ve 70C18 için ayda 12-15 adet damper ve açık kasa imal ediyor. Şasi yönlendirmelerinde çok aktif.",
        "referrals": [
            {
                "customer_name": "Özbay Kardeşler İnşaat & Kereste",
                "customer_phone": "0532 411 20 30",
                "city": "Samsun",
                "requested_chassis": "Iveco Daily 35C16 Çift Teker Şasi",
                "requested_body": "Sac Damper Kasa (3.80m boy)",
                "status": "new",
                "notes": "Mustafa Usta aradı; müşterinin mevcut Transit aracı yetersiz gelmiş, 35C16 şasi alıp üzerine damper yaptıracak."
            },
            {
                "customer_name": "Çarşamba Çeltik ve Bakliyat Dağıtım",
                "customer_phone": "0542 633 80 90",
                "city": "Samsun",
                "requested_chassis": "Iveco Daily 70C18 Uzun Şasi",
                "requested_body": "İlave Kapaklı Dökme Hububat Kasası",
                "status": "new",
                "notes": "Çeltik ve çuval nakliyesi için 7 tonluk 70C18 şasi fiyat teklifi istiyor."
            }
        ]
    },
    {
        "company_name": "Kuzey Frigo Kasa ve Soğutucu Sistemleri Ltd.",
        "contact_person": "Ahmet Güler (Teknik Müdür)",
        "phone": "0362 266 91 10",
        "city": "Samsun",
        "district": "Tekkeköy",
        "specialty": "Frigofirik Kasa & Termo King Soğutucu (-18°C / +4°C)",
        "address": "İlkadım Sanayi Sitesi 62. Sokak No:22 Samsun",
        "notes": "Orta Karadeniz balık ve dondurulmuş tavuk sevkiyatçılarına frigo kasa yapıyor. Carrier ve Thermo King yetkili servisi.",
        "referrals": [
            {
                "customer_name": "Karadeniz Somon ve Balıkçılık A.Ş.",
                "customer_phone": "0533 710 44 20",
                "city": "Samsun",
                "requested_chassis": "Iveco Daily 50C18 Frigo Şasi",
                "requested_body": "Eksiksiz CTP Frigofirik Kasa (-20°C)",
                "status": "new",
                "notes": "Yakakent'ten Samsun merkeze taze somon taşıyacaklar, hemen teslim şasi arıyorlar."
            }
        ]
    },
    {
        "company_name": "Güven Kayar Kasa & Oto Kurtarma İmalatı",
        "contact_person": "Cemal Usta",
        "phone": "0362 238 12 70",
        "city": "Samsun",
        "district": "Canik",
        "specialty": "Hidrolik Kayar Kasa Platform & Çift Katlı Kurtarıcı",
        "address": "Eski Sanayi Sitesi 12. Blok No:4 Canik / Samsun",
        "notes": "70C18 şasiler üzerine hidrolik kayar kasa platform kuruyor. Samsun ve Ordu'da 15'ten fazla Iveco Daily kurtarıcı referansı var.",
        "referrals": [
            {
                "customer_name": "7/24 Karadeniz Oto Kurtarma",
                "customer_phone": "0544 555 19 23",
                "city": "Samsun",
                "requested_chassis": "Iveco Daily 70C18 Otomatik Vites Şasi",
                "requested_body": "6.20m Hidrolik Kayar Kasa Platform",
                "status": "new",
                "notes": "Otoyol yardım filosu kuruyorlar; 2 adet 70C18 Hi-Matic şasi için acil proforma istiyor."
            }
        ]
    },

    # Ordu
    {
        "company_name": "Fatsa Karoser & Alüminyum Meşrubat Kasası",
        "contact_person": "Engin Usta",
        "phone": "0452 423 70 80",
        "city": "Ordu",
        "district": "Fatsa",
        "specialty": "Alüminyum Meşrubat Kasası & Panel Kasa",
        "address": "Fatsa Sanayi Sitesi 4. Blok No:19 Fatsa / Ordu",
        "notes": "Ordu ve Giresun meşrubat toptancılarına alüminyum panjur kapaklı kasa montajı yapıyor.",
        "referrals": [
            {
                "customer_name": "Fatsa Doğuş Meşrubat & Su Dağıtım",
                "customer_phone": "0532 990 44 11",
                "city": "Ordu",
                "requested_chassis": "Iveco Daily 35C16 Şasi",
                "requested_body": "Alüminyum İki Yanı Panjurlu Meşrubat Kasası",
                "status": "new",
                "notes": "Su ve soda dağıtımı için alçak yükleme eşikli Daily 35C16 şasi ihtiyacı var."
            }
        ]
    },

    # Çorum
    {
        "company_name": "Çorum Özler Damper & Dorse Karoser Sanayi",
        "contact_person": "Kemal Özler",
        "phone": "0364 235 60 70",
        "city": "Çorum",
        "district": "Merkez",
        "specialty": "Ağır Hizmet Damperi, Açık Sac Kasa & Hardox Kasa",
        "address": "Çorum Küçük Sanayi Sitesi 24. Cadde No:35 Çorum",
        "notes": "Hafriyat ve kum-çakıl firmaları için Hardox damper üretiyor. Eurocargo ve Daily 70C18 montajlarında uzman.",
        "referrals": [
            {
                "customer_name": "Sungurlu Agrega Madencilik",
                "customer_phone": "0535 882 10 99",
                "city": "Çorum",
                "requested_chassis": "Iveco Eurocargo 180E28 Damper Şasi",
                "requested_body": "Kaya Tipi Damper Kasa",
                "status": "new",
                "notes": "Taş ocağı içi ve şantiye sevkiyatları için 18 tonluk Eurocargo teklifi bekliyor."
            }
        ]
    },

    # Sivas
    {
        "company_name": "Sivas Yiğido Karoser ve Çelik Kasa İmalatı",
        "contact_person": "Serdar Yiğit",
        "phone": "0346 226 77 88",
        "city": "Sivas",
        "district": "Merkez",
        "specialty": "Kapalı Çelik Kasa, İzolasyonlu Et Kasası",
        "address": "Sivas 1. OSB 4. Sokak No:12 Sivas",
        "notes": "Şarkışla ve Sivas et kombinalarına asansörlü ve raylı karkas et kasası imal ediyor.",
        "referrals": [
            {
                "customer_name": "Kangal Canlı Hayvan ve Et Kombinası",
                "customer_phone": "0543 219 88 77",
                "city": "Sivas",
                "requested_chassis": "Iveco Daily 50C18 Frigo Şasi",
                "requested_body": "Monoblok Tavandan Kancalı Et Kasası",
                "status": "new",
                "notes": "Mezbahadan kasaplara dağıtım yapacaklar; Daily 50C18 için görüşülmek isteniyor."
            }
        ]
    },

    # Giresun
    {
        "company_name": "Giresun Yıldız Kasa ve Karoser",
        "contact_person": "Murat Yıldız",
        "phone": "0454 216 90 40",
        "city": "Giresun",
        "district": "Bulancak",
        "specialty": "Fındık Nakliye Kasası & Branda Kasa",
        "address": "Bulancak Sanayi Sitesi 3. Blok No:7 Bulancak / Giresun",
        "notes": "Karadeniz fındık sezonunda yüksek havaleli brandalı kasalarda lider.",
        "referrals": []
    },

    # Amasya
    {
        "company_name": "Merzifon Hidrolik Vinç ve Kasa Sistemleri",
        "contact_person": "Hasan Usta",
        "phone": "0358 513 44 20",
        "city": "Amasya",
        "district": "Merzifon",
        "specialty": "Kasa Arkası Katlanır Hidrolik Vinç & Açık Sac Kasa",
        "address": "Merzifon Sanayi Sitesi No:42 Merzifon / Amasya",
        "notes": "İnşaat malzemecileri ve mermerciler için vinçli sac kasa montajı yapıyor.",
        "referrals": [
            {
                "customer_name": "Merzifon Mermer & Granit Sanayi",
                "customer_phone": "0536 771 90 20",
                "city": "Amasya",
                "requested_chassis": "Iveco Daily 70C18 Şasi",
                "requested_body": "Açık Kasa + 3 Tonluk Kasa Arkası Vinç",
                "status": "new",
                "notes": "Mermer blok sevkiyatı için 70C18 şasi üzerine vinç montajı planlanıyor."
            }
        ]
    }
]


REGIONAL_TENDERS = [
    {
        "tender_number": "2026/184201",
        "title": "Samsun Büyükşehir Belediyesi 12 Adet Katı Atık Toplama Aracı Kiralama ve Şasi Alımı",
        "organization": "Samsun Büyükşehir Belediyesi Fen İşleri Daire Başkanlığı",
        "city": "Samsun",
        "district": "İlkadım",
        "category": "Temizlik & Katı Atık",
        "status": "awarded",
        "estimated_vehicles": 12,
        "suggested_iveco_model": "Iveco Daily 70C18 Çöp Kasası / Eurocargo 180E",
        "contractor_name": "Akdeniz Çevre Temizlik ve Lojistik Hizmetleri A.Ş.",
        "contractor_phone": "0362 435 60 70",
        "contractor_contact": "Murat Bey (Proje Müdürü)",
        "contract_amount": "48.500.000 TL",
        "notes": "İhale sözleşmesi imzalandı. Yüklenici firma 12 adet 70C18 hidrolik sıkıştırmalı çöp kasası için şasi teklifi bekliyor."
    },
    {
        "tender_number": "2026/193040",
        "title": "Tekkeköy Belediyesi Fen İşleri Yol Bakım ve Agrega Nakliyesi Kamyonet Alımı",
        "organization": "Tekkeköy İlçe Belediyesi Destek Hizmetleri",
        "city": "Samsun",
        "district": "Tekkeköy",
        "category": "Fen İşleri & Bakım",
        "status": "awarded",
        "estimated_vehicles": 5,
        "suggested_iveco_model": "Iveco Daily 35C16 Çift Kabin Damper",
        "contractor_name": "Yeşilırmak Altyapı ve Yol İnşaat Ltd. Şti.",
        "contractor_phone": "0362 256 80 90",
        "contractor_contact": "Selim Erdem",
        "contract_amount": "14.200.000 TL",
        "notes": "Parke taşı ve asfalt yama ekipleri için çift kabinli 3.5 ton damperli araç temini yapılacak."
    },
    {
        "tender_number": "2026/177890",
        "title": "Ordu Büyükşehir Belediyesi İçme Suyu Arıza ve Mobil Müdahale Araçları Hizmet Alımı",
        "organization": "OSKİ Genel Müdürlüğü (Ordu Su ve Kanalizasyon İdaresi)",
        "city": "Ordu",
        "district": "Altınordu",
        "category": "Su & Kanalizasyon Bakım",
        "status": "awarded",
        "estimated_vehicles": 8,
        "suggested_iveco_model": "Iveco Daily 35S16 Panelvan 12m³",
        "contractor_name": "Kuzey Mühendislik ve Tesisat Taahhüt Ltd.",
        "contractor_phone": "0452 234 11 20",
        "contractor_contact": "Serhat Yıldırım",
        "contract_amount": "19.800.000 TL",
        "notes": "İçinde jeneratör ve boru kaynak ekipmanı bulunacak mobil servis panelvanları alınacak."
    },
    {
        "tender_number": "2026/165400",
        "title": "Çorum Belediyesi Park ve Bahçeler Sulama ve Bitki Taşıma Araçları",
        "organization": "Çorum Belediyesi Park Bahçeler Müdürlüğü",
        "city": "Çorum",
        "district": "Merkez",
        "category": "Park & Bahçeler",
        "status": "awarded",
        "estimated_vehicles": 6,
        "suggested_iveco_model": "Iveco Daily 35C16 Sac Kasa / Arazöz",
        "contractor_name": "Hitit Peyzaj ve Ağaçlandırma San. Ltd.",
        "contractor_phone": "0364 224 55 60",
        "contractor_contact": "Ahmet Çetin",
        "contract_amount": "11.600.000 TL",
        "notes": "Fidanlık sevkiyatı ve mobil sulama tankeri için şasi aranıyor."
    },
    {
        "tender_number": "2026/158900",
        "title": "Sivas İl Özel İdaresi Kırsal Altyapı Malzeme Dağıtım ve Servis Araçları",
        "organization": "Sivas İl Özel İdaresi Yol Ulaşım Müdürlüğü",
        "city": "Sivas",
        "district": "Merkez",
        "category": "Kırsal Yol Bakım",
        "status": "awarded",
        "estimated_vehicles": 7,
        "suggested_iveco_model": "Iveco Daily 70C18 Damperli Kamyon",
        "contractor_name": "Yiğido Hafriyat ve Taşımacılık Ltd. Şti.",
        "contractor_phone": "0346 221 40 80",
        "contractor_contact": "Mustafa Koç",
        "contract_amount": "26.400.000 TL",
        "notes": "Köy yolları stabilize malzeme serimi için 7 tonluk damperli kamyon ihtiyacı."
    }
]


def seed_regional_discovery_data(db: Session, force_refresh: bool = False):
    """
    Hedef 9 il için gerçek bölgesel ticaret sicil şirketlerini, üst yapıcıları ve ihaleleri
    veritabanına ekler. Eğer tablolar boşsa veya force_refresh=True ise çalışır.
    """
    seeded_counts = {"new_companies": 0, "bodybuilders": 0, "referrals": 0, "tenders": 0}
    now = datetime.now(timezone.utc)

    # 1. Yeni Kurulan Şirketler (Ticaret Sicil / NACE)
    existing_companies_count = db.query(NewCompanyRegistration).count()
    if existing_companies_count == 0 or force_refresh:
        for comp in REGIONAL_NEW_COMPANIES:
            exists = db.query(NewCompanyRegistration).filter(
                NewCompanyRegistration.company_name == comp["company_name"]
            ).first()
            if not exists:
                reg_date = now - timedelta(days=comp["registration_days_ago"])
                record = NewCompanyRegistration(
                    company_name=comp["company_name"],
                    nace_code=comp["nace_code"],
                    nace_description=comp["nace_description"],
                    city=comp["city"],
                    district=comp["district"],
                    capital=comp["capital"],
                    phone=comp["phone"],
                    address=comp["address"],
                    registration_date=reg_date,
                    status="new",
                    created_at=reg_date,
                )
                db.add(record)
                seeded_counts["new_companies"] += 1
        db.commit()

    # 2. Üst Yapıcı Partnerleri & Yönlendirmeleri
    existing_bb_count = db.query(BodybuilderPartner).count()
    if existing_bb_count == 0 or force_refresh:
        for bb in REGIONAL_BODYBUILDERS:
            existing_partner = db.query(BodybuilderPartner).filter(
                BodybuilderPartner.company_name == bb["company_name"]
            ).first()
            if not existing_partner:
                partner = BodybuilderPartner(
                    company_name=bb["company_name"],
                    contact_person=bb["contact_person"],
                    phone=bb["phone"],
                    city=bb["city"],
                    district=bb["district"],
                    specialty=bb["specialty"],
                    address=bb["address"],
                    notes=bb["notes"],
                    is_active=True,
                )
                db.add(partner)
                db.flush()
                seeded_counts["bodybuilders"] += 1
                existing_partner = partner

            # Referrals (Şasi Talepleri)
            for ref in bb.get("referrals", []):
                ref_exists = db.query(BodybuilderReferral).filter(
                    BodybuilderReferral.customer_name == ref["customer_name"],
                    BodybuilderReferral.bodybuilder_id == existing_partner.id
                ).first()
                if not ref_exists:
                    new_ref = BodybuilderReferral(
                        bodybuilder_id=existing_partner.id,
                        customer_name=ref["customer_name"],
                        customer_phone=ref["customer_phone"],
                        city=ref["city"],
                        requested_chassis=ref["requested_chassis"],
                        requested_body=ref["requested_body"],
                        status=ref.get("status", "new"),
                        notes=ref.get("notes", ""),
                    )
                    db.add(new_ref)
                    seeded_counts["referrals"] += 1
        db.commit()

    # 3. Kamu & Belediye İhale Radarı
    existing_tenders_count = db.query(Tender).count()
    if existing_tenders_count == 0 or force_refresh:
        for t in REGIONAL_TENDERS:
            exists = db.query(Tender).filter(
                (Tender.tender_number == t["tender_number"]) | (Tender.title == t["title"])
            ).first()
            if not exists:
                record = Tender(
                    tender_number=t["tender_number"],
                    title=t["title"],
                    organization=t["organization"],
                    city=t["city"],
                    district=t.get("district"),
                    category=t.get("category", "Kamu"),
                    status=t.get("status", "awarded"),
                    estimated_vehicles=t.get("estimated_vehicles", 1),
                    suggested_iveco_model=t.get("suggested_iveco_model"),
                    contractor_name=t.get("contractor_name"),
                    contractor_phone=t.get("contractor_phone"),
                    contractor_contact=t.get("contractor_contact"),
                    contract_amount=t.get("contract_amount"),
                    notes=t.get("notes"),
                    tender_date=now - timedelta(days=5),
                )
                db.add(record)
                seeded_counts["tenders"] += 1
        db.commit()

    return seeded_counts
