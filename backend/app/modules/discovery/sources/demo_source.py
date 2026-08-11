"""
Orta Karadeniz Demo Scraper — Gerçekçi firma verileri.
Samsun, Amasya, Tokat, Çorum, Ordu, Sinop bölgesindeki
lojistik, nakliye, inşaat ve tarım firmalarını simüle eder.
"""
import random
from typing import List
from app.modules.discovery.sources.base import BaseDiscoveryScraper, RawCompanyData


# ── Gerçekçi firma havuzu ────────────────────────────────────────
FIRMS = [
    # ── Samsun ────────────────────────────────────────────────────
    {"company_name": "Karadeniz Lojistik A.Ş.", "city": "Samsun", "district": "İlkadım", "sector": "Lojistik", "phone": "0362 431 00 00", "website": "www.karadenizlojistik.com.tr", "activity": "Uluslararası karayolu taşımacılığı, depolama ve dağıtım hizmetleri"},
    {"company_name": "Samsun Nakliyat Ltd. Şti.", "city": "Samsun", "district": "Atakum", "sector": "Nakliye", "phone": "0362 266 55 10", "website": "www.samsunnakliyat.com", "activity": "Şehirlerarası ve uluslararası nakliye, parsiyel taşımacılık"},
    {"company_name": "Bafra Tarım Makineleri San. Tic.", "city": "Samsun", "district": "Bafra", "sector": "Tarım", "phone": "0362 543 22 33", "website": "www.bafratarimmakine.com", "activity": "Tarım makineleri satış ve servis, yedek parça"},
    {"company_name": "Çarşamba İnşaat ve Taahhüt A.Ş.", "city": "Samsun", "district": "Çarşamba", "sector": "İnşaat", "phone": "0362 833 40 00", "website": "www.carsambains.com.tr", "activity": "Toplu konut, altyapı projeleri ve sanayi tesisi inşaatı"},
    {"company_name": "Terme Gıda Dağıtım Ltd. Şti.", "city": "Samsun", "district": "Terme", "sector": "Gıda Lojistik", "phone": "0362 876 12 00", "website": "www.termegida.com", "activity": "Soğuk zincir gıda dağıtımı, fındık ve hububat taşımacılığı"},
    {"company_name": "Vezirköprü Orman Ürünleri Tic.", "city": "Samsun", "district": "Vezirköprü", "sector": "Orman Ürünleri", "phone": "0362 646 33 50", "website": "", "activity": "Kereste, tomruk taşıma ve orman ürünleri ticareti"},
    {"company_name": "Tekkeköy Demir Çelik San.", "city": "Samsun", "district": "Tekkeköy", "sector": "Demir Çelik", "phone": "0362 256 80 00", "website": "www.tekkekoycelik.com", "activity": "Demir çelik üretimi, inşaat demiri ve profil"},
    {"company_name": "Samsun Konteyner Taşımacılık A.Ş.", "city": "Samsun", "district": "İlkadım", "sector": "Lojistik", "phone": "0362 445 67 89", "website": "www.samsunkonteyner.com.tr", "activity": "Liman konteyner taşımacılığı ve gümrük depolama"},
    {"company_name": "19 Mayıs Hafriyat ve Nakliye", "city": "Samsun", "district": "19 Mayıs", "sector": "Hafriyat", "phone": "0362 257 14 00", "website": "", "activity": "Hafriyat, kazı, dolgu ve ağır tonajlı malzeme taşımacılığı"},
    {"company_name": "Alaçam Fındık Kooperatifi", "city": "Samsun", "district": "Alaçam", "sector": "Tarım", "phone": "0362 515 10 10", "website": "", "activity": "Fındık alım, işleme, paketleme ve sevkiyat"},

    # ── Amasya ────────────────────────────────────────────────────
    {"company_name": "Amasya Taşkıran Nakliye Ltd.", "city": "Amasya", "district": "Merkez", "sector": "Nakliye", "phone": "0358 218 44 55", "website": "www.taskiran-nakliye.com", "activity": "Bölgesel ve uzun mesafe karayolu taşımacılığı"},
    {"company_name": "Suluova Şeker Fabrikası Lojistik", "city": "Amasya", "district": "Suluova", "sector": "Gıda Lojistik", "phone": "0358 417 30 00", "website": "", "activity": "Şeker pancarı taşıma, hammadde ve mamül dağıtım"},
    {"company_name": "Merzifon Sanayi Nakliyat A.Ş.", "city": "Amasya", "district": "Merzifon", "sector": "Lojistik", "phone": "0358 513 60 00", "website": "www.merzifonsanayi.com", "activity": "OSB lojistiği, fabrika taşımacılığı ve ağır yük"},
    {"company_name": "Amasya Elma Tarım Tic. Ltd.", "city": "Amasya", "district": "Merkez", "sector": "Tarım", "phone": "0358 212 80 80", "website": "www.amasyaelma.com", "activity": "Elma üretimi, soğuk hava depolama ve dağıtım"},
    {"company_name": "Göynücek İnşaat Malzemeleri", "city": "Amasya", "district": "Göynücek", "sector": "İnşaat", "phone": "0358 461 25 00", "website": "", "activity": "Yapı malzemeleri toptan satış, beton ve çimento dağıtım"},

    # ── Tokat ─────────────────────────────────────────────────────
    {"company_name": "Tokat Uluslararası Nakliyat", "city": "Tokat", "district": "Merkez", "sector": "Nakliye", "phone": "0356 214 70 70", "website": "www.tokatnakliyat.com.tr", "activity": "Uluslararası karayolu ve parsiyel taşımacılık"},
    {"company_name": "Erbaa Tarım ve Hayvancılık Koop.", "city": "Tokat", "district": "Erbaa", "sector": "Tarım", "phone": "0356 715 20 00", "website": "", "activity": "Tarımsal ürün toplama, hayvan yemi dağıtım ve nakliye"},
    {"company_name": "Turhal Şeker San. Lojistik", "city": "Tokat", "district": "Turhal", "sector": "Gıda Lojistik", "phone": "0356 275 10 00", "website": "www.turhalseker.com.tr", "activity": "Şeker üretim hammadde tedarik ve dağıtım lojistiği"},
    {"company_name": "Niksar Yol İnşaat A.Ş.", "city": "Tokat", "district": "Niksar", "sector": "İnşaat", "phone": "0356 527 30 00", "website": "www.niksaryol.com", "activity": "Karayolu yapım, köprü ve altyapı projeleri"},
    {"company_name": "Zile Madencilik ve Taşımacılık", "city": "Tokat", "district": "Zile", "sector": "Madencilik", "phone": "0356 318 40 00", "website": "", "activity": "Maden cevheri çıkarma, taşıma ve işleme"},

    # ── Çorum ─────────────────────────────────────────────────────
    {"company_name": "Çorum Lojistik Hizmetleri A.Ş.", "city": "Çorum", "district": "Merkez", "sector": "Lojistik", "phone": "0364 225 80 00", "website": "www.corumlojistik.com.tr", "activity": "Entegre lojistik, depolama ve dağıtım çözümleri"},
    {"company_name": "İskilip Kereste ve Orman San.", "city": "Çorum", "district": "İskilip", "sector": "Orman Ürünleri", "phone": "0364 351 20 00", "website": "", "activity": "Kereste üretimi, mobilya hammadde tedarik ve taşımacılık"},
    {"company_name": "Sungurlu Çimento Nakliye Ltd.", "city": "Çorum", "district": "Sungurlu", "sector": "İnşaat", "phone": "0364 311 50 00", "website": "www.sungurlucimento.com", "activity": "Çimento ve hazır beton dağıtımı, ağır tonajlı taşıma"},
    {"company_name": "Osmancık Pirinç Ticaret A.Ş.", "city": "Çorum", "district": "Osmancık", "sector": "Tarım", "phone": "0364 611 45 00", "website": "www.osmancikpirinc.com", "activity": "Pirinç üretimi, paketleme, depolama ve lojistik"},
    {"company_name": "Alaca Hafriyat ve İnşaat", "city": "Çorum", "district": "Alaca", "sector": "Hafriyat", "phone": "0364 411 33 00", "website": "", "activity": "Hafriyat, kazı işleri ve ağır iş makinesi kiralama"},

    # ── Ordu ──────────────────────────────────────────────────────
    {"company_name": "Ordu Fındık İhracat A.Ş.", "city": "Ordu", "district": "Altınordu", "sector": "Tarım", "phone": "0452 214 60 00", "website": "www.ordufindik.com.tr", "activity": "Fındık ihracatı, depolama ve uluslararası lojistik"},
    {"company_name": "Ünye Liman Lojistik Ltd.", "city": "Ordu", "district": "Ünye", "sector": "Lojistik", "phone": "0452 323 70 00", "website": "www.unyeliman.com", "activity": "Liman operasyonları, konteyner ve dökme yük taşımacılığı"},
    {"company_name": "Fatsa İnşaat Taahhüt A.Ş.", "city": "Ordu", "district": "Fatsa", "sector": "İnşaat", "phone": "0452 423 10 00", "website": "www.fatsainsaat.com", "activity": "Konut ve ticari bina inşaatı, altyapı projeleri"},
    {"company_name": "Perşembe Balıkçılık Koop.", "city": "Ordu", "district": "Perşembe", "sector": "Su Ürünleri", "phone": "0452 517 20 00", "website": "", "activity": "Balık avlama, soğuk zincir taşıma ve dağıtım"},
    {"company_name": "Kumru Nakliye ve Ticaret Ltd.", "city": "Ordu", "district": "Kumru", "sector": "Nakliye", "phone": "0452 651 30 00", "website": "", "activity": "Bölgesel nakliye, tarım ürünü ve gıda taşımacılığı"},
    {"company_name": "Akkuş Orman İşletme Müd.", "city": "Ordu", "district": "Akkuş", "sector": "Orman Ürünleri", "phone": "0452 611 15 00", "website": "", "activity": "Tomruk ve kereste taşıma, orman ürünleri lojistiği"},
    {"company_name": "Gülyalı Beton Santrali", "city": "Ordu", "district": "Gülyalı", "sector": "İnşaat", "phone": "0452 561 40 00", "website": "www.gulyalibeton.com", "activity": "Hazır beton üretimi ve transmikser ile teslimat"},

    # ── Sinop ─────────────────────────────────────────────────────
    {"company_name": "Sinop Deniz Taşımacılık A.Ş.", "city": "Sinop", "district": "Merkez", "sector": "Deniz Taşımacılığı", "phone": "0368 261 50 00", "website": "www.sinopdeniz.com.tr", "activity": "Karadeniz hattı deniz taşımacılığı ve liman hizmetleri"},
    {"company_name": "Boyabat Madencilik San.", "city": "Sinop", "district": "Boyabat", "sector": "Madencilik", "phone": "0368 315 60 00", "website": "www.boyabatmaden.com", "activity": "Bakır ve çinko madenciliği, cevher nakliye"},
    {"company_name": "Gerze Balık Hal Ltd. Şti.", "city": "Sinop", "district": "Gerze", "sector": "Su Ürünleri", "phone": "0368 718 25 00", "website": "", "activity": "Balık hali işletmeciliği, soğuk zincir dağıtım"},
    {"company_name": "Ayancık Kereste ve Mobilya San.", "city": "Sinop", "district": "Ayancık", "sector": "Orman Ürünleri", "phone": "0368 613 10 00", "website": "www.ayancikkereste.com", "activity": "Kereste üretimi, mobilya imalatı ve sevkiyat"},
    {"company_name": "Türkeli İnşaat Malzemeleri Tic.", "city": "Sinop", "district": "Türkeli", "sector": "İnşaat", "phone": "0368 515 30 00", "website": "", "activity": "Yapı malzemeleri perakende ve dağıtım"},
    {"company_name": "Durağan Tarım Koop.", "city": "Sinop", "district": "Durağan", "sector": "Tarım", "phone": "0368 415 20 00", "website": "", "activity": "Tahıl üretimi, gübre dağıtım ve tarımsal nakliye"},
    {"company_name": "Dikmen Hayvancılık ve Yem San.", "city": "Sinop", "district": "Dikmen", "sector": "Tarım", "phone": "0368 351 10 00", "website": "", "activity": "Büyükbaş hayvancılık, yem üretimi ve dağıtım"},

    # ── Ekstra firmalar ───────────────────────────────────────────
    {"company_name": "Havza Kaplıca Turizm İnş.", "city": "Samsun", "district": "Havza", "sector": "İnşaat", "phone": "0362 714 50 00", "website": "", "activity": "Termal tesis inşaatı ve otel yapımı"},
    {"company_name": "Ladik Tarım Ürünleri Koop.", "city": "Samsun", "district": "Ladik", "sector": "Tarım", "phone": "0362 836 20 00", "website": "", "activity": "Organik tarım ürünleri, depolama ve lojistik"},
    {"company_name": "Taşova Un ve Yem Fabrikası", "city": "Amasya", "district": "Taşova", "sector": "Gıda Lojistik", "phone": "0358 611 40 00", "website": "", "activity": "Un ve yem üretimi, hammadde taşıma ve dağıtım"},
    {"company_name": "Reşadiye Nakliye ve Ticaret", "city": "Tokat", "district": "Reşadiye", "sector": "Nakliye", "phone": "0356 714 15 00", "website": "", "activity": "Bölgesel nakliye, maden ve tarım ürünü taşıma"},
    {"company_name": "Mecitözü İnşaat Ltd. Şti.", "city": "Çorum", "district": "Mecitözü", "sector": "İnşaat", "phone": "0364 651 30 00", "website": "", "activity": "Konut ve altyapı inşaatı, hafriyat hizmetleri"},
    {"company_name": "Korgan Fındık Ticaret A.Ş.", "city": "Ordu", "district": "Korgan", "sector": "Tarım", "phone": "0452 771 20 00", "website": "", "activity": "Fındık alım satım, kırma tesisi ve lojistik"},
    {"company_name": "Erfelek Ahşap San. Tic.", "city": "Sinop", "district": "Erfelek", "sector": "Orman Ürünleri", "phone": "0368 451 10 00", "website": "", "activity": "Ahşap ürün imalatı ve bölgesel dağıtım"},
]


class OrtaKaradenizDemoScraper(BaseDiscoveryScraper):
    """Demo scraper: Orta Karadeniz bölgesi firma verileri."""

    def scrape(self) -> List[RawCompanyData]:
        results = []
        for f in FIRMS:
            results.append(RawCompanyData(
                company_name=f["company_name"],
                city=f["city"],
                district=f["district"],
                sector=f["sector"],
                phone=f["phone"],
                website=f.get("website", ""),
                activity_description=f["activity"],
                contact_info=f["phone"],
                raw_data={"source": "demo", "region": "orta_karadeniz"},
            ))
        return results
