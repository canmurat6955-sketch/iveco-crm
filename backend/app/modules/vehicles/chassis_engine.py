"""
IVECO Intelligent Chassis & Bodywork Matchmaking Engine
Handles wheelbase matching, bodywork dimension calculations, scale (kantar) analysis,
unladen weight calculations (tare + driver + fuel), and technical spec sheet linking.
"""
from typing import List, Dict, Any, Optional
import math

# Tahmini Üstyapı Kasa Ağırlıkları (kg)
BODY_TARE_ESTIMATES = {
    "frigo": 1100,           # Frigorifik Soğutuculu Kasa (+Soğutucu ünite + yalıtım)
    "kapali_kutu": 650,      # Kapalı Alüminyum / Sac Kargo Kasası
    "acik_sac": 500,         # Açık Sac / Ahşap Kapaklı Kasa
    "kayar_perde": 750,      # Kayar Perde / Tenteli Kasa
    "damper": 1700,          # Damper Kasa (+Hidrolik piston & şasi)
    "oto_kurtarma": 1200,    # Kayar Kasa Platform + Tambur
    "panelvan": 0,           # Fabrika çıkışlı entegre panelvan gövde
    "diger": 600
}

# ── IVECO TÜM ŞASİ VE TEKNİK ÖLÇÜ KATALOĞU ──────────────────────────
# Kullanıcının verdiği kesin teknik föy ve kantar verilerine göre yapılandırılmıştır.
CHASSIS_CONFIGURATIONS: List[Dict[str, Any]] = [
    # ── DAILY 35S (Tek Teker - 3.5 Ton Kamyonet - B Ehliyet) ──
    {
        "id": "daily_35s_3450",
        "vehicle_group": "Daily",
        "series": "Daily 35S",
        "model_code": "35S16 Şasi",
        "wheelbase": 3450,
        "wheel_type": "single",
        "cabin_type": "Standart Tek Kabin",
        "unladen_weight_kg": 2000,
        "scale_limit_kg": 4130,
        "scale_call_active": False,
        "kantar_status_text": "Kamyonet statüsünde (Aktif kantar çağrısı yok, B Ehliyet / Şehir içi 7/24 serbest)",
        "body_length_min_cm": 350,
        "body_length_max_cm": 380,
        "body_width_min_cm": 215,
        "body_width_max_cm": 235,
        "body_height_min_cm": 160,
        "body_height_max_cm": 300,
        "volume_min_m3": 12.0,
        "volume_max_m3": 26.8,
        "max_recommended_payload_kg": 1500,
        "license_required": "B Sınıfı (Otomobil Ehliyeti)",
        "tech_sheet_pdf": "/specs/daily-kamyonet-35s-35c.pdf",
        "tech_sheet_name": "DAILY KAMYONET TEKNİK FÖY.pdf",
        "best_for": ["Şehir içi kargo", "Hafif dağıtım", "E-ticaret", "Kuru gıda"],
        "badge": "B Ehliyet / 3.45m Şasi"
    },
    {
        "id": "daily_35s_3750",
        "vehicle_group": "Daily",
        "series": "Daily 35S",
        "model_code": "35S16 Şasi",
        "wheelbase": 3750,
        "wheel_type": "single",
        "cabin_type": "Standart Tek Kabin",
        "unladen_weight_kg": 2000,
        "scale_limit_kg": 4130,
        "scale_call_active": False,
        "kantar_status_text": "Kamyonet statüsünde (B Ehliyet / 4.10m - 4.50m Kasa)",
        "body_length_min_cm": 410,
        "body_length_max_cm": 450,
        "body_width_min_cm": 215,
        "body_width_max_cm": 235,
        "body_height_min_cm": 160,
        "body_height_max_cm": 300,
        "volume_min_m3": 14.1,
        "volume_max_m3": 31.7,
        "max_recommended_payload_kg": 1450,
        "license_required": "B Sınıfı (Otomobil Ehliyeti)",
        "tech_sheet_pdf": "/specs/daily-kamyonet-35s-35c.pdf",
        "tech_sheet_name": "DAILY KAMYONET TEKNİK FÖY.pdf",
        "best_for": ["Mobilya", "Hacimli kargo", "Tekstil", "Frigo gıda"],
        "badge": "B Ehliyet / 3.75m Şasi"
    },
    {
        "id": "daily_35s_4100",
        "vehicle_group": "Daily",
        "series": "Daily 35S",
        "model_code": "35S16 Şasi",
        "wheelbase": 4100,
        "wheel_type": "single",
        "cabin_type": "Standart Tek Kabin",
        "unladen_weight_kg": 2000,
        "scale_limit_kg": 4130,
        "scale_call_active": False,
        "kantar_status_text": "Kamyonet statüsünde (B Ehliyet / 4.60m - 5.00m Ekstra Uzun Kasa)",
        "body_length_min_cm": 460,
        "body_length_max_cm": 500,
        "body_width_min_cm": 215,
        "body_width_max_cm": 235,
        "body_height_min_cm": 160,
        "body_height_max_cm": 300,
        "volume_min_m3": 15.8,
        "volume_max_m3": 35.3,
        "max_recommended_payload_kg": 1400,
        "license_required": "B Sınıfı (Otomobil Ehliyeti)",
        "tech_sheet_pdf": "/specs/daily-kamyonet-35s-35c.pdf",
        "tech_sheet_name": "DAILY KAMYONET TEKNİK FÖY.pdf",
        "best_for": ["Maksimum hacim", "Yatak & mobilya", "Koli dağıtım", "5 Metre Kasa"],
        "badge": "B Ehliyet / 4.10m Şasi"
    },

    # ── DAILY 35C (Çift Teker - 3.5 Ton Kamyonet) ──
    {
        "id": "daily_35c_3450",
        "vehicle_group": "Daily",
        "series": "Daily 35C",
        "model_code": "35C16 Şasi",
        "wheelbase": 3450,
        "wheel_type": "twin",
        "cabin_type": "Standart Tek Kabin",
        "unladen_weight_kg": 2200,
        "scale_limit_kg": 4130,
        "scale_call_active": False,
        "kantar_status_text": "Kamyonet statüsünde (Çift teker ağır yük dayanımı, 3.5 Ton B Ehliyet)",
        "body_length_min_cm": 350,
        "body_length_max_cm": 380,
        "body_width_min_cm": 215,
        "body_width_max_cm": 235,
        "body_height_min_cm": 160,
        "body_height_max_cm": 300,
        "volume_min_m3": 12.0,
        "volume_max_m3": 26.8,
        "max_recommended_payload_kg": 1350,
        "license_required": "B Sınıfı (Otomobil Ehliyeti)",
        "tech_sheet_pdf": "/specs/daily-kamyonet-35s-35c.pdf",
        "tech_sheet_name": "DAILY KAMYONET TEKNİK FÖY.pdf",
        "best_for": ["İnşaat nalbur", "Demir & boya", "Kompakt ağır yük"],
        "badge": "Çift Teker / 3.45m Şasi"
    },
    {
        "id": "daily_35c_3750",
        "vehicle_group": "Daily",
        "series": "Daily 35C",
        "model_code": "35C16 Şasi",
        "wheelbase": 3750,
        "wheel_type": "twin",
        "cabin_type": "Standart Tek Kabin",
        "unladen_weight_kg": 2200,
        "scale_limit_kg": 4130,
        "scale_call_active": False,
        "kantar_status_text": "Kamyonet statüsünde (Çift teker / 4.10m - 4.50m Kasa)",
        "body_length_min_cm": 410,
        "body_length_max_cm": 450,
        "body_width_min_cm": 215,
        "body_width_max_cm": 235,
        "body_height_min_cm": 160,
        "body_height_max_cm": 300,
        "volume_min_m3": 14.1,
        "volume_max_m3": 31.7,
        "max_recommended_payload_kg": 1300,
        "license_required": "B Sınıfı (Otomobil Ehliyeti)",
        "tech_sheet_pdf": "/specs/daily-kamyonet-35s-35c.pdf",
        "tech_sheet_name": "DAILY KAMYONET TEKNİK FÖY.pdf",
        "best_for": ["Meyve sebze toptan", "Gıda soğuk zincir", "Nalbur"],
        "badge": "Çift Teker / 3.75m Şasi"
    },
    {
        "id": "daily_35c_4100",
        "vehicle_group": "Daily",
        "series": "Daily 35C",
        "model_code": "35C16 Şasi",
        "wheelbase": 4100,
        "wheel_type": "twin",
        "cabin_type": "Standart Tek Kabin",
        "unladen_weight_kg": 2200,
        "scale_limit_kg": 4130,
        "scale_call_active": False,
        "kantar_status_text": "Kamyonet statüsünde (Çift teker / 4.60m - 5.00m Kasa)",
        "body_length_min_cm": 460,
        "body_length_max_cm": 500,
        "body_width_min_cm": 215,
        "body_width_max_cm": 235,
        "body_height_min_cm": 160,
        "body_height_max_cm": 300,
        "volume_min_m3": 15.8,
        "volume_max_m3": 35.3,
        "max_recommended_payload_kg": 1250,
        "license_required": "B Sınıfı (Otomobil Ehliyeti)",
        "tech_sheet_pdf": "/specs/daily-kamyonet-35s-35c.pdf",
        "tech_sheet_name": "DAILY KAMYONET TEKNİK FÖY.pdf",
        "best_for": ["Mobilya", "Beyaz eşya", "Toptan koli"],
        "badge": "Çift Teker / 4.10m Şasi"
    },

    # ── DAILY 72C / 70C (7.2 Ton Kamyon - C Ehliyet) ──
    {
        "id": "daily_72c_3750",
        "vehicle_group": "Daily",
        "series": "Daily 72C",
        "model_code": "72C18 Şasi",
        "wheelbase": 3750,
        "wheel_type": "twin",
        "cabin_type": "Standart Tek Kabin",
        "unladen_weight_kg": 2400,
        "scale_limit_kg": 7970,
        "scale_call_active": True,
        "kantar_status_text": "7.970 kg Kantar Geçeri (Kamyon Sınıfı - ~4.8 Ton Net Yük)",
        "body_length_min_cm": 410,
        "body_length_max_cm": 450,
        "body_width_min_cm": 215,
        "body_width_max_cm": 235,
        "body_height_min_cm": 160,
        "body_height_max_cm": 300,
        "volume_min_m3": 14.1,
        "volume_max_m3": 31.7,
        "max_recommended_payload_kg": 4900,
        "license_required": "C Sınıfı Kamyon",
        "tech_sheet_pdf": "/specs/daily-kamyon-70c-72c.pdf",
        "tech_sheet_name": "DAILY KAMYON TEKNİK FÖY.pdf",
        "best_for": ["Ağır gıda", "Toptan içecek", "Kompakt damper", "Nalbur demir"],
        "badge": "7.2 Ton / 3.75m Şasi"
    },
    {
        "id": "daily_72c_4350",
        "vehicle_group": "Daily",
        "series": "Daily 72C",
        "model_code": "72C18 Şasi",
        "wheelbase": 4350,
        "wheel_type": "twin",
        "cabin_type": "Standart Tek Kabin",
        "unladen_weight_kg": 2400,
        "scale_limit_kg": 7970,
        "scale_call_active": True,
        "kantar_status_text": "7.970 kg Kantar Geçeri (5.15m - 5.40m Kasa / ~4.7 Ton Net Yük)",
        "body_length_min_cm": 515,
        "body_length_max_cm": 540,
        "body_width_min_cm": 215,
        "body_width_max_cm": 235,
        "body_height_min_cm": 160,
        "body_height_max_cm": 300,
        "volume_min_m3": 17.7,
        "volume_max_m3": 38.1,
        "max_recommended_payload_kg": 4800,
        "license_required": "C Sınıfı Kamyon",
        "tech_sheet_pdf": "/specs/daily-kamyon-70c-72c.pdf",
        "tech_sheet_name": "DAILY KAMYON TEKNİK FÖY.pdf",
        "best_for": ["Soğuk hava et/süt", "Paletli sevkiyat", "Kayar kasa oto kurtarıcı"],
        "badge": "7.2 Ton / 4.35m Şasi"
    },
    {
        "id": "daily_72c_4750",
        "vehicle_group": "Daily",
        "series": "Daily 72C",
        "model_code": "72C18 Şasi",
        "wheelbase": 4750,
        "wheel_type": "twin",
        "cabin_type": "Standart Tek Kabin",
        "unladen_weight_kg": 2400,
        "scale_limit_kg": 7970,
        "scale_call_active": True,
        "kantar_status_text": "7.970 kg Kantar Geçeri (5.80m - 6.20m Dev Kasa / Tonaj & Hacim)",
        "body_length_min_cm": 580,
        "body_length_max_cm": 620,
        "body_width_min_cm": 215,
        "body_width_max_cm": 235,
        "body_height_min_cm": 160,
        "body_height_max_cm": 300,
        "volume_min_m3": 20.0,
        "volume_max_m3": 43.7,
        "max_recommended_payload_kg": 4700,
        "license_required": "C Sınıfı Kamyon",
        "tech_sheet_pdf": "/specs/daily-kamyon-70c-72c.pdf",
        "tech_sheet_name": "DAILY KAMYON TEKNİK FÖY.pdf",
        "best_for": ["6.20m Kasa Hacmi", "12-14 Euro Palet", "Şehirlerarası nakliyat", "Tekstil"],
        "badge": "7.2 Ton / 4.75m Şasi / 6.20m Kasa"
    },

    # ── EUROCARGO 100E (ML 100 E 19 / K) ──
    {
        "id": "eurocargo_100e_3690",
        "vehicle_group": "Eurocargo",
        "series": "Eurocargo 100E",
        "model_code": "ML 100 E 19",
        "wheelbase": 3690,
        "wheel_type": "twin",
        "cabin_type": "Gündüz Kabin (Day Cab)",
        "unladen_weight_kg": 3680,
        "scale_limit_kg": 10875,
        "scale_call_active": True,
        "kantar_status_text": "10.875 kg Kantar Geçeri (~6.5 Ton Net İstiap Haddi)",
        "body_length_min_cm": 540,
        "body_length_max_cm": 575,
        "body_width_min_cm": 225,
        "body_width_max_cm": 245,
        "body_height_min_cm": 180,
        "body_height_max_cm": 300,
        "volume_min_m3": 21.9,
        "volume_max_m3": 42.3,
        "max_recommended_payload_kg": 6400,
        "license_required": "C Sınıfı Kamyon",
        "tech_sheet_pdf": "/specs/eurocargo-ml100e19.pdf",
        "tech_sheet_name": "ML 100 E 19 TEKNİK FÖY .pdf",
        "best_for": ["Orta tonaj dağıtım", "Toptan gıda", "Un & yem", "Şehirlerarası kargo"],
        "badge": "10 Ton Kamyon / 3.69m Şasi"
    },

    # ── EUROCARGO 120E (ML 120 EL 19) ──
    {
        "id": "eurocargo_120e_3690",
        "vehicle_group": "Eurocargo",
        "series": "Eurocargo 120E",
        "model_code": "ML 120 EL 19",
        "wheelbase": 3690,
        "wheel_type": "twin",
        "cabin_type": "Gündüz Kabin",
        "unladen_weight_kg": 4000,
        "scale_limit_kg": 12950,
        "scale_call_active": True,
        "kantar_status_text": "12.950 kg Kantar Geçeri (~8.2 Ton Net İstiap / 5.40m-5.75m Kasa)",
        "body_length_min_cm": 540,
        "body_length_max_cm": 575,
        "body_width_min_cm": 225,
        "body_width_max_cm": 245,
        "body_height_min_cm": 180,
        "body_height_max_cm": 300,
        "volume_min_m3": 21.9,
        "volume_max_m3": 42.3,
        "max_recommended_payload_kg": 8200,
        "license_required": "C Sınıfı Kamyon",
        "tech_sheet_pdf": "/specs/eurocargo-ml120el19.pdf",
        "tech_sheet_name": "ML 120 EL 19 TEKNİK FÖY .pdf",
        "best_for": ["Ağır dağıtım", "Çimento & yapı", "İçecek kasası", "Bölgesel lojistik"],
        "badge": "12 Ton / 3.69m Şasi"
    },
    {
        "id": "eurocargo_120e_4185",
        "vehicle_group": "Eurocargo",
        "series": "Eurocargo 120E",
        "model_code": "ML 120 EL 19",
        "wheelbase": 4185,
        "wheel_type": "twin",
        "cabin_type": "Gündüz Kabin",
        "unladen_weight_kg": 4000,
        "scale_limit_kg": 12950,
        "scale_call_active": True,
        "kantar_status_text": "12.950 kg Kantar Geçeri (~8.0 Ton Net İstiap / 6.10m-6.50m Kasa)",
        "body_length_min_cm": 610,
        "body_length_max_cm": 650,
        "body_width_min_cm": 225,
        "body_width_max_cm": 245,
        "body_height_min_cm": 180,
        "body_height_max_cm": 300,
        "volume_min_m3": 24.7,
        "volume_max_m3": 47.8,
        "max_recommended_payload_kg": 8000,
        "license_required": "C Sınıfı Kamyon",
        "tech_sheet_pdf": "/specs/eurocargo-ml120el19.pdf",
        "tech_sheet_name": "ML 120 EL 19 TEKNİK FÖY .pdf",
        "best_for": ["6.50m Geniş Kasa", "14-16 Palet Sevkiyat", "Kuru gıda & soğuk hava"],
        "badge": "12 Ton / 4.18m Şasi / 6.50m Kasa"
    },

    # ── EUROCARGO 150E (ML 150 E 21 / K) ──
    {
        "id": "eurocargo_150e_4185",
        "vehicle_group": "Eurocargo",
        "series": "Eurocargo 150E",
        "model_code": "ML 150 E 21",
        "wheelbase": 4185,
        "wheel_type": "twin",
        "cabin_type": "Yataksız Gündüz Kabin",
        "unladen_weight_kg": 4750,
        "scale_limit_kg": 16060,
        "scale_call_active": True,
        "kantar_status_text": "16.060 kg Kantar Geçeri (~10.5 Ton Net Yük / 6.10m-6.50m Kasa)",
        "body_length_min_cm": 610,
        "body_length_max_cm": 650,
        "body_width_min_cm": 230,
        "body_width_max_cm": 250,
        "body_height_min_cm": 180,
        "body_height_max_cm": 300,
        "volume_min_m3": 25.2,
        "volume_max_m3": 48.8,
        "max_recommended_payload_kg": 10500,
        "license_required": "C Sınıfı Kamyon",
        "tech_sheet_pdf": "/specs/eurocargo-ml150e21.pdf",
        "tech_sheet_name": "ML 150 E 21 TEKNİK FÖY .pdf",
        "best_for": ["Ağır yük taşımacılığı", "10 Ton üzeri sevkiyat", "Tarım & yem"],
        "badge": "15 Ton / 4.18m Şasi Yataksız"
    },
    {
        "id": "eurocargo_150e_4455",
        "vehicle_group": "Eurocargo",
        "series": "Eurocargo 150E",
        "model_code": "ML 150 E 21",
        "wheelbase": 4455,
        "wheel_type": "twin",
        "cabin_type": "Yataksız Gündüz Kabin",
        "unladen_weight_kg": 4750,
        "scale_limit_kg": 16060,
        "scale_call_active": True,
        "kantar_status_text": "16.060 kg Kantar Geçeri (~10.3 Ton Net Yük / 6.50m-6.90m Kasa)",
        "body_length_min_cm": 650,
        "body_length_max_cm": 690,
        "body_width_min_cm": 230,
        "body_width_max_cm": 250,
        "body_height_min_cm": 180,
        "body_height_max_cm": 300,
        "volume_min_m3": 26.9,
        "volume_max_m3": 51.8,
        "max_recommended_payload_kg": 10300,
        "license_required": "C Sınıfı Kamyon",
        "tech_sheet_pdf": "/specs/eurocargo-ml150e21.pdf",
        "tech_sheet_name": "ML 150 E 21 TEKNİK FÖY .pdf",
        "best_for": ["6.90m Uzun Kasa", "16 Palet Lojistik", "Bölgesel süpermarket sevkiyat"],
        "badge": "15 Ton / 4.45m Şasi Yataksız"
    },
    {
        "id": "eurocargo_150e_5175",
        "vehicle_group": "Eurocargo",
        "series": "Eurocargo 150E",
        "model_code": "ML 150 E 21 Yataklı",
        "wheelbase": 5175,
        "wheel_type": "twin",
        "cabin_type": "Yataklı Uzun Yol Kabin (Sleeper Cab)",
        "unladen_weight_kg": 4750,
        "scale_limit_kg": 16060,
        "scale_call_active": True,
        "kantar_status_text": "16.060 kg Kantar Geçeri (Yataklı Kabin / 7.10m-7.50m Dev Kasa)",
        "body_length_min_cm": 710,
        "body_length_max_cm": 750,
        "body_width_min_cm": 230,
        "body_width_max_cm": 250,
        "body_height_min_cm": 180,
        "body_height_max_cm": 300,
        "volume_min_m3": 29.4,
        "volume_max_m3": 56.3,
        "max_recommended_payload_kg": 10100,
        "license_required": "C Sınıfı Kamyon",
        "tech_sheet_pdf": "/specs/eurocargo-ml150e21.pdf",
        "tech_sheet_name": "ML 150 E 21 TEKNİK FÖY .pdf",
        "best_for": ["Şehirlerarası uzun yol", "7.50m Maksimum kasa", "Yatak konforu", "18 Palet"],
        "badge": "15 Ton / 5.17m Yataklı Şasi / 7.50m Kasa"
    },

    # ── EUROCARGO 160 (ML 160 E 32P) ──
    {
        "id": "eurocargo_160_5670",
        "vehicle_group": "Eurocargo",
        "series": "Eurocargo 160",
        "model_code": "ML 160 E 32P",
        "wheelbase": 5670,
        "wheel_type": "twin",
        "cabin_type": "Geniş Konfigürasyon / Havalı Süspansiyon",
        "unladen_weight_kg": 5475,
        "scale_limit_kg": 17080,
        "scale_call_active": True,
        "kantar_status_text": "17.080 kg Kantar Geçeri (~11 Ton Net Taşıma / 320 BG Güç)",
        "body_length_min_cm": 750,
        "body_length_max_cm": 820,
        "body_width_min_cm": 230,
        "body_width_max_cm": 255,
        "body_height_min_cm": 180,
        "body_height_max_cm": 300,
        "volume_min_m3": 31.0,
        "volume_max_m3": 62.7,
        "max_recommended_payload_kg": 10800,
        "license_required": "C Sınıfı Kamyon",
        "tech_sheet_pdf": "/specs/eurocargo-ml160e32p.pdf",
        "tech_sheet_name": "ML 160 E 32P TEKNİK FÖY .pdf",
        "best_for": ["Hassas yük (havalı süspansiyon)", "Yüksek hacim & tonaj", "8 Metre üzeri kasa"],
        "badge": "16 Ton / 5.67m Şasi Havalı"
    },

    # ── S-WAY (Ağır Vasıta & Çekici) ──
    {
        "id": "s_way_500",
        "vehicle_group": "S-Way",
        "series": "S-Way",
        "model_code": "S-Way 500 / 580 Çekici",
        "wheelbase": 3800,
        "wheel_type": "twin",
        "cabin_type": "AS Yüksek Tavan Çift Yataklı Kabin",
        "unladen_weight_kg": 7800,
        "scale_limit_kg": 40000,
        "scale_call_active": True,
        "kantar_status_text": "40.000+ kg Uluslararası Tır / Çekici Kateneri",
        "body_length_min_cm": 1360,
        "body_length_max_cm": 1360,
        "body_width_min_cm": 248,
        "body_width_max_cm": 248,
        "body_height_min_cm": 270,
        "body_height_max_cm": 300,
        "volume_min_m3": 91.0,
        "volume_max_m3": 101.0,
        "max_recommended_payload_kg": 25000,
        "license_required": "CE Sınıfı Tır",
        "tech_sheet_pdf": "/specs/s-way-500-full-plus.pdf",
        "tech_sheet_name": "S-WAY 500 FULL PLUS TEKNİK FÖY .pdf",
        "best_for": ["Uluslararası nakliye", "13.60 Dorse", "Ağır tır taşımacılığı"],
        "badge": "40+ Ton Çekici Tır"
    }
]


class ChassisMatchingEngine:
    """
    Kullanıcının talep ettiği m³ hacim, yük ağırlığı (kg) ve kasa boyutlarına göre
    en ideal IVECO modelini, şasisini ve kasa ölçülerini belirleyen hesaplama motoru.
    """

    @classmethod
    def match(
        cls,
        payload_kg: float,
        volume_m3: Optional[float] = None,
        body_length_cm: Optional[float] = None,
        body_width_cm: Optional[float] = None,
        body_height_cm: Optional[float] = None,
        body_type: str = "kapali_kutu",
        license_preference: Optional[str] = None, # "B", "C", "ANY"
    ) -> Dict[str, Any]:
        """
        En uygun aracı seçer ve tüm kantar/boyut analizini döner.
        """
        body_tare = BODY_TARE_ESTIMATES.get(body_type, 650)

        # Eğer m³ verilmedi ama boyutlar verildiyse hesapla
        computed_volume_m3 = volume_m3
        if not computed_volume_m3 and body_length_cm and body_width_cm and body_height_cm:
            computed_volume_m3 = (body_length_cm * body_width_cm * body_height_cm) / 1_000_000.0

        if not computed_volume_m3:
            # Varsayılan yük ağırlığına göre ortalama m³ tahmini
            computed_volume_m3 = max(15.0, round(payload_kg / 150.0, 1))

        # Aday araçları filtrele ve puanla
        candidates = []
        for ch in CHASSIS_CONFIGURATIONS:
            # Lisans filtresi
            if license_preference == "B" and "B Sınıfı" not in ch["license_required"]:
                continue
            if license_preference == "C" and "C Sınıfı" not in ch["license_required"] and "CE" not in ch["license_required"]:
                continue

            # Kantar Ağırlık Analizi
            gross_needed_kg = ch["unladen_weight_kg"] + body_tare + payload_kg
            scale_margin_kg = ch["scale_limit_kg"] - gross_needed_kg
            is_scale_safe = scale_margin_kg >= -100  # Küçük tolerans payı

            # Hacim Analizi
            volume_fit = computed_volume_m3 <= (ch["volume_max_m3"] * 1.05)

            # Özel Uzunluk Kısıtı
            length_fit = True
            if body_length_cm:
                length_fit = (ch["body_length_min_cm"] * 0.95) <= body_length_cm <= (ch["body_length_max_cm"] * 1.05)

            # Uygunluk Puanı Hesaplama
            score = 100.0

            # Kantar puanı
            if ch["scale_call_active"]:
                if scale_margin_kg < 0:
                    score -= abs(scale_margin_kg) / 50.0  # Aşım cezası
                else:
                    score += min(20.0, scale_margin_kg / 500.0)
            else:
                # 35S / 35C kamyonet: yük sınırı kontrolü
                if payload_kg > ch["max_recommended_payload_kg"]:
                    score -= (payload_kg - ch["max_recommended_payload_kg"]) / 20.0

            # Hacim puanı
            if computed_volume_m3 > ch["volume_max_m3"]:
                score -= (computed_volume_m3 - ch["volume_max_m3"]) * 5.0
            elif computed_volume_m3 < ch["volume_min_m3"]:
                score -= (ch["volume_min_m3"] - computed_volume_m3) * 2.0
            else:
                score += 15.0

            # Uzunluk puanı
            if body_length_cm:
                if not length_fit:
                    score -= 40.0

            candidates.append({
                "config": ch,
                "score": score,
                "gross_needed_kg": gross_needed_kg,
                "scale_margin_kg": scale_margin_kg,
                "is_scale_safe": is_scale_safe,
                "volume_fit": volume_fit,
            })

        # Puanlara göre sırala
        candidates.sort(key=lambda x: x["score"], reverse=True)

        if not candidates:
            # Fallback en büyük araca yönlendir
            best_candidate = {
                "config": CHASSIS_CONFIGURATIONS[-1],
                "score": 50,
                "gross_needed_kg": payload_kg + 7800 + body_tare,
                "scale_margin_kg": 40000 - (payload_kg + 7800 + body_tare),
                "is_scale_safe": True,
                "volume_fit": True
            }
        else:
            best_candidate = candidates[0]

        best_cfg = best_candidate["config"]

        # Önerilen Kasa Boyutlarını Hesapla (İstenen m³ ve şasi sınırlarına göre)
        rec_length_cm = body_length_cm or round((best_cfg["body_length_min_cm"] + best_cfg["body_length_max_cm"]) / 2.0)
        rec_length_cm = max(best_cfg["body_length_min_cm"], min(best_cfg["body_length_max_cm"], rec_length_cm))

        rec_width_cm = body_width_cm or round((best_cfg["body_width_min_cm"] + best_cfg["body_width_max_cm"]) / 2.0)
        rec_width_cm = max(best_cfg["body_width_min_cm"], min(best_cfg["body_width_max_cm"], rec_width_cm))

        # Yükseklik hesabı: Hacim / (Boy * En)
        if body_height_cm:
            rec_height_cm = body_height_cm
        else:
            floor_area_m2 = (rec_length_cm / 100.0) * (rec_width_cm / 100.0)
            target_h_m = computed_volume_m3 / floor_area_m2 if floor_area_m2 > 0 else 2.2
            rec_height_cm = round(target_h_m * 100.0)

        rec_height_cm = max(best_cfg["body_height_min_cm"], min(best_cfg["body_height_max_cm"], rec_height_cm))

        final_volume_m3 = round((rec_length_cm * rec_width_cm * rec_height_cm) / 1_000_000.0, 1)

        # Euro Palet Kapasitesi Hesabı (80 x 120 cm standart palet)
        # Genişlik >= 215 cm olduğunda çift sıra (2 sıra 80 cm veya 120 cm) dizilebilir
        pallets_by_length = math.floor(rec_length_cm / 120.0) * 2
        pallets_alt = math.floor(rec_length_cm / 80.0) * 2
        pallet_capacity = max(pallets_by_length, pallets_alt)

        # Kantar Değerlendirme Raporu
        total_gross_kg = best_cfg["unladen_weight_kg"] + body_tare + payload_kg
        kantar_margin = best_cfg["scale_limit_kg"] - total_gross_kg
        
        if best_cfg["scale_call_active"]:
            if kantar_margin >= 0:
                kantar_status = "safe"
                kantar_title = "KANTARDAN GÜVENLE GEÇER"
                kantar_desc = f"Yasal kantar sınırı ({best_cfg['scale_limit_kg']} kg) dahilinde. Kalan yük payı: {int(kantar_margin)} kg."
            else:
                kantar_status = "overload"
                kantar_title = "DİKKAT: KANTAR SINIR AŞIMI RİSKİ"
                kantar_desc = f"Bu yük ile toplam ağırlık ({int(total_gross_kg)} kg), kantar sınırını ({best_cfg['scale_limit_kg']} kg) {abs(int(kantar_margin))} kg aşıyor. Bir üst tonajlı şasi önerilir."
        else:
            kantar_status = "exempt"
            kantar_title = "KAMYONET STATÜSÜ (3.5 Ton B Sınıfı Ehliyet)"
            kantar_desc = f"3.5 Ton azami yüklü ağırlık sınıfında olup B sınıfı ehliyet ile kullanılır. Şehir içine 7/24 takografsız serbest giriş yapabilir."

        # WhatsApp Paylaşım Mesajı Taslağı
        wa_message = (
            f"Merhaba, IVECO ERC Otomotiv olarak talebinizi inceledik.\n\n"
            f"🎯 *İhtiyacınıza Özel Önerilen Araç:* IVECO {best_cfg['series']} ({best_cfg['wheelbase']} mm Şasi)\n"
            f"📦 *Önerilen Kasa Ölçüleri:* {rec_length_cm} cm boy × {rec_width_cm} cm en × {rec_height_cm} cm yükseklik\n"
            f"📊 *Net Kasa Hacmi:* {final_volume_m3} m³ (~{pallet_capacity} Euro Palet)\n"
            f"⚖️ *Kantar & Ağırlık:* Kantar Limiti: {best_cfg['scale_limit_kg']} kg | Araç Boş: {best_cfg['unladen_weight_kg']} kg | Taşınacak Yük: {int(payload_kg)} kg\n"
            f"📄 *Teknik Föy:* {best_cfg['tech_sheet_name']}\n\n"
            f"Detaylı teklif, kredi kampanyası ve takas desteğini görüşmek üzere bekleriz."
        )

        # Alternatif Araçlar (İlk 3 aday)
        alternatives = []
        for cand in candidates[1:4]:
            c_cfg = cand["config"]
            alternatives.append({
                "id": c_cfg["id"],
                "series": c_cfg["series"],
                "model_code": c_cfg["model_code"],
                "wheelbase": c_cfg["wheelbase"],
                "badge": c_cfg["badge"],
                "scale_limit_kg": c_cfg["scale_limit_kg"],
                "unladen_weight_kg": c_cfg["unladen_weight_kg"],
                "body_length_range": f"{c_cfg['body_length_min_cm']}-{c_cfg['body_length_max_cm']} cm",
                "volume_range": f"{c_cfg['volume_min_m3']}-{c_cfg['volume_max_m3']} m³",
                "tech_sheet_pdf": c_cfg["tech_sheet_pdf"],
                "license_required": c_cfg["license_required"]
            })

        return {
            "success": True,
            "inputs": {
                "payload_kg": payload_kg,
                "volume_m3": computed_volume_m3,
                "body_type": body_type,
                "body_length_cm": body_length_cm,
                "body_width_cm": body_width_cm,
                "body_height_cm": body_height_cm,
                "license_preference": license_preference,
            },
            "recommendation": {
                "id": best_cfg["id"],
                "vehicle_group": best_cfg["vehicle_group"],
                "series": best_cfg["series"],
                "model_code": best_cfg["model_code"],
                "wheelbase": best_cfg["wheelbase"],
                "wheel_type": best_cfg["wheel_type"],
                "cabin_type": best_cfg["cabin_type"],
                "badge": best_cfg["badge"],
                "license_required": best_cfg["license_required"],
                "tech_sheet_pdf": best_cfg["tech_sheet_pdf"],
                "tech_sheet_name": best_cfg["tech_sheet_name"],
                "best_for": best_cfg["best_for"],
                "dimensions": {
                    "length_cm": rec_length_cm,
                    "width_cm": rec_width_cm,
                    "height_cm": rec_height_cm,
                    "volume_m3": final_volume_m3,
                    "pallet_capacity": pallet_capacity,
                    "allowed_length_range": f"{best_cfg['body_length_min_cm']} - {best_cfg['body_length_max_cm']} cm",
                    "allowed_width_range": f"{best_cfg['body_width_min_cm']} - {best_cfg['body_width_max_cm']} cm",
                    "allowed_height_range": f"{best_cfg['body_height_min_cm']} - {best_cfg['body_height_max_cm']} cm",
                },
                "scale_analysis": {
                    "unladen_weight_kg": best_cfg["unladen_weight_kg"],
                    "estimated_body_tare_kg": body_tare,
                    "payload_kg": payload_kg,
                    "total_gross_kg": total_gross_kg,
                    "scale_limit_kg": best_cfg["scale_limit_kg"],
                    "margin_kg": kantar_margin,
                    "status": kantar_status,
                    "title": kantar_title,
                    "description": kantar_desc,
                    "scale_call_active": best_cfg["scale_call_active"],
                },
                "whatsapp_proposal": wa_message
            },
            "alternatives": alternatives
        }
