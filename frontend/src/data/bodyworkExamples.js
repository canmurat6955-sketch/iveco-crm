// Şasi Üzerine Yapılabilecek Örnek Üstyapı (Kasa) Uygulamaları Veri Seti
// Not: Araçlar ŞASİ olarak satılmaktadır; görseller müşterilere fikir vermesi amacıyla örnek uygulama olarak sunulmaktadır.

export const BODYWORK_SERIES_TABS = [
  { id: 'all', label: '🚛 Tüm Şasi Örnekleri (24)', shortLabel: 'Tümü (24)' },
  { id: 'daily35', label: '🚐 Daily 35S / 35C Şasi (9 Örnek)', shortLabel: 'Daily 35 Şasi (9)' },
  { id: 'daily72', label: '🚚 Daily 72C Şasi (7 Örnek)', shortLabel: 'Daily 72C Şasi (7)' },
  { id: 'eurocargo', label: '🚛 Eurocargo Şasi (8 Örnek)', shortLabel: 'Eurocargo Şasi (8)' },
];

export const BODYWORK_TYPE_FILTERS = [
  { id: 'all', label: 'Tüm Kasa Tipleri' },
  { id: 'kapali_kutu', label: '📦 Kapalı Kutu & Mobilya' },
  { id: 'tenteli', label: '⛺ Tenteli & Kayar Perde' },
  { id: 'frigo', label: '❄️ Frigorifik (Soğutuculu)' },
  { id: 'acik_kasa', label: '🪵 Açık Sac & Alüminyum Kasa' },
];

export const BODYWORK_EXAMPLES = [
  // ── DAILY 35 (35S / 35C 3.5 TON ŞASİ ÖRNEKLERİ) ─────────────────────────
  {
    id: 'd35-1',
    series: 'daily35',
    seriesLabel: 'IVECO Daily 35S / 35C Şasi (3.5 Ton - B Ehliyet)',
    bodyType: 'tenteli',
    bodyTypeLabel: 'Örnek Uygulama: İlaveli Tenteli Sac Kasa',
    title: 'Daily 35S16 Tek Teker Şasi — Tenteli Sac Kasa Örneği',
    subtitle: 'Şehir içi dağıtım, gıda, tekstil ve paket taşımacılığı için hafif şasi üzeri tenteli uygulama örneği.',
    image: '/ustyapi/daily35-1.jpg',
    sampleDims: 'Örnek Kasa Boyu: 3.80 m - 4.30 m | B Sınıfı Ehliyet & Takograf Muafiyetli Şasi',
  },
  {
    id: 'd35-2',
    series: 'daily35',
    seriesLabel: 'IVECO Daily 35S / 35C Şasi (3.5 Ton - B Ehliyet)',
    bodyType: 'tenteli',
    bodyTypeLabel: 'Örnek Uygulama: Yüksek Tenteli Kasa',
    title: 'Daily 35S16 Şasi — Yüksek Hacimli Tenteli Kasa Örneği',
    subtitle: 'Kompakt şasi üzerinde yüksek tavanlı branda/tenteli üstyapı uygulaması.',
    image: '/ustyapi/daily35-2.jpg',
    sampleDims: 'Örnek Kasa Boyu: 3.80 m - 4.20 m | Şehir İçi Kıvrak Şasi',
  },
  {
    id: 'd35-3',
    series: 'daily35',
    seriesLabel: 'IVECO Daily 35C Şasi (Çift Teker - B Ehliyet)',
    bodyType: 'kapali_kutu',
    bodyTypeLabel: 'Örnek Uygulama: Kapalı Kutu (Kargo / Paket) Kasa',
    title: 'Daily 35C16 Çift Teker Şasi — Kapalı Kutu Kasa Örneği',
    subtitle: 'E-ticaret, kargo, kuru gıda ve beyaz eşya dağıtımı için çift tekerlekli C-şasi üzeri kapalı kutu örneği.',
    image: '/ustyapi/daily35-3.jpg',
    sampleDims: 'Örnek Kasa Boyu: 4.30 m - 4.90 m | Çift Teker C-Şasi',
  },
  {
    id: 'd35-4',
    series: 'daily35',
    seriesLabel: 'IVECO Daily 35C Şasi (Çift Teker - B Ehliyet)',
    bodyType: 'tenteli',
    bodyTypeLabel: 'Örnek Uygulama: Şapkalı Tenteli Sac Kasa',
    title: 'Daily 35C16 Çift Teker Şasi — Şapkalı Tenteli Kasa Örneği',
    subtitle: 'Kabin üstü şapka bölmeli, yan kapakları açılabilir çok amaçlı ticari üstyapı örneği.',
    image: '/ustyapi/daily35-4.jpg',
    sampleDims: 'Örnek Kasa Boyu: 4.50 m - 4.90 m | B Ehliyet Kamyonet Şasi',
  },
  {
    id: 'd35-5',
    series: 'daily35',
    seriesLabel: 'IVECO Daily 35C Şasi (Çift Teker - B Ehliyet)',
    bodyType: 'kapali_kutu',
    bodyTypeLabel: 'Örnek Uygulama: Şapkalı Mobilya & İnşaat Kutu Kasa',
    title: 'Daily 35C16 Şasi — Şapkalı Mobilya & Lojistik Kasa Örneği',
    subtitle: 'Mobilya, yapı malzemesi ve çeyiz taşımacılığında sık tercih edilen şapkalı kapalı kasa örneği.',
    image: '/ustyapi/daily35-5.jpg',
    sampleDims: 'Örnek Kasa Boyu: 4.70 m - 5.10 m | Yüksek Hacimli Şapkalı Kasa',
  },
  {
    id: 'd35-6',
    series: 'daily35',
    seriesLabel: 'IVECO Daily 35C Şasi (Çift Teker - B Ehliyet)',
    bodyType: 'frigo',
    bodyTypeLabel: 'Örnek Uygulama: Frigorifik (Soğutuculu) Kasa',
    title: 'Daily 35C16 Şasi — Soğutuculu Frigorifik Kasa Örneği',
    subtitle: 'Süt ürünleri, et, balık, dondurulmuş gıda ve soğuk zincir dağıtımı için izoleli frigo üstyapı örneği.',
    image: '/ustyapi/daily35-6.jpg',
    sampleDims: 'Örnek Kasa Boyu: 4.20 m - 4.70 m | Yan Kapılı Soğuk Zincir Uygulaması',
  },
  {
    id: 'd35-7',
    series: 'daily35',
    seriesLabel: 'IVECO Daily 35C Şasi (Çift Teker - B Ehliyet)',
    bodyType: 'tenteli',
    bodyTypeLabel: 'Örnek Uygulama: Şapkalı Tenteli + Minicargo Römork',
    title: 'Daily 35C16 Şasi — Yüksek Hacimli Tenteli & Römork Örneği',
    subtitle: 'Yalıtım (EPS), sünger ve mobilya gibi hacimli yükler için şapkalı kasa ve arka römork kombinasyonu örneği.',
    image: '/ustyapi/daily35-7.jpg',
    sampleDims: 'Örnek Uygulama: Maksimum Kübaj / Hafif Hacimli Yük Taşımacılığı',
  },
  {
    id: 'd35-8',
    series: 'daily35',
    seriesLabel: 'IVECO Daily 35C Şasi (Çift Teker - B Ehliyet)',
    bodyType: 'tenteli',
    bodyTypeLabel: 'Örnek Uygulama: Römorklu Kafes / Hacim Kombinasyonu',
    title: 'Daily 35C16 Şasi — Römorklu Uzun Hacim Uygulama Örneği',
    subtitle: '3.5 tonluk Daily C-şasi arkasına hafif römork bağlanarak elde edilen yüksek hacimli taşıma örneği.',
    image: '/ustyapi/daily35-8.jpg',
    sampleDims: 'Örnek Uygulama: Yalıtım / Mobilya / Ambalaj Lojistiği',
  },
  {
    id: 'd35-9',
    series: 'daily35',
    seriesLabel: 'IVECO Daily 35C Şasi (Çift Teker - B Ehliyet)',
    bodyType: 'acik_kasa',
    bodyTypeLabel: 'Örnek Uygulama: Alüminyum Kapaklı Açık Kasa',
    title: 'Daily 35C16 Şasi — Alüminyum Açık Kasa Örneği',
    subtitle: 'Hırdavat, cıvata, inşaat malzemesi, tüp/su ve açık yük taşımacılığı için hafif alüminyum kapaklı kasa örneği.',
    image: '/ustyapi/daily35-9.jpg',
    sampleDims: 'Örnek Kasa Boyu: 4.30 m - 4.90 m | Forklift Yüklemeye Uygun Açık Kasa',
  },

  // ── DAILY 72C (7.2 TON ŞASİ KAMYON ÖRNEKLERİ) ───────────────────────────
  {
    id: 'd72-1',
    series: 'daily72',
    seriesLabel: 'IVECO Daily 72C18 Şasi (7.970 kg Kantar Geçeri)',
    bodyType: 'kapali_kutu',
    bodyTypeLabel: 'Örnek Uygulama: Şapkalı Uzun Kapalı Kutu Kasa',
    title: 'Daily 72C18 Şasi — Şapkalı Kapalı Kutu (Mobilya / Lojistik) Örneği',
    subtitle: '7.2 tonluk uzun şasi üzerinde yüksek hacimli şapkalı kapalı kutu üstyapı uygulaması.',
    image: '/ustyapi/daily72-1.jpg',
    sampleDims: 'Örnek Kasa Boyu: 5.50 m - 6.20 m | ~4.8 Ton Net Yük Kapasiteli Şasi',
  },
  {
    id: 'd72-2',
    series: 'daily72',
    seriesLabel: 'IVECO Daily 72C18 Hi-Matic Şasi (7.970 kg Kantar)',
    bodyType: 'frigo',
    bodyTypeLabel: 'Örnek Uygulama: Frigorifik (Soğutuculu) Kasa',
    title: 'Daily 72C18 Hi-Matic Şasi — Frigorifik Soğuk Zincir Örneği',
    subtitle: 'Bölgesel gıda, et/süt ve soğuk zincir lojistiğinde 4.5 - 4.8 ton net yük için frigorifik üstyapı örneği.',
    image: '/ustyapi/daily72-2.jpg',
    sampleDims: 'Örnek Kasa Boyu: 5.20 m - 5.80 m | 10-12 Palet Frigo Kapasitesi',
  },
  {
    id: 'd72-3',
    series: 'daily72',
    seriesLabel: 'IVECO Daily 72C18 Hi-Matic Şasi (7.970 kg Kantar)',
    bodyType: 'acik_kasa',
    bodyTypeLabel: 'Örnek Uygulama: Şapkalı Açık Sac Kasa',
    title: 'Daily 72C18 Hi-Matic Şasi — Şapkalı Açık Sac Kasa Örneği',
    subtitle: 'Kereste, demir/profil, yapı malzemesi ve paletli yükler için ağır hizmet tipi açık sac kasa örneği.',
    image: '/ustyapi/daily72-3.jpg',
    sampleDims: 'Örnek Kasa Boyu: 5.40 m - 6.10 m | Ağır Hizmet C-Profil Şasi',
  },
  {
    id: 'd72-4',
    series: 'daily72',
    seriesLabel: 'IVECO Daily 72C18 Hi-Matic Şasi (7.970 kg Kantar)',
    bodyType: 'tenteli',
    bodyTypeLabel: 'Örnek Uygulama: Şapkalı Tenteli Zahire & Gıda Kasası',
    title: 'Daily 72C18 Hi-Matic Şasi — Tenteli Zahire / Fındık Kasası Örneği',
    subtitle: 'Karadeniz bölgesinde fındık, zahire, tarım ürünleri ve çuvallı yük taşımacılığına uygun şapkalı tenteli kasa örneği.',
    image: '/ustyapi/daily72-4.jpg',
    sampleDims: 'Örnek Kasa Boyu: 5.40 m - 6.00 m | Bölgesel Tarım & Nakliye',
  },
  {
    id: 'd72-5',
    series: 'daily72',
    seriesLabel: 'IVECO Daily 72C18 Şasi (7.970 kg Kantar)',
    bodyType: 'kapali_kutu',
    bodyTypeLabel: 'Örnek Uygulama: 6.20 m Uzun Kapalı Kutu Kasa',
    title: 'Daily 72C18 5100 Şasi — 6.20 m Uzun Kapalı Kutu Örneği',
    subtitle: '5100 mm dingil mesafeli şasi üzerine tepe rüzgarlıklı 6.20 metre uzunluğunda kapalı kutu kasa örneği.',
    image: '/ustyapi/daily72-5.jpg',
    sampleDims: 'Örnek Kasa Boyu: 6.00 m - 6.20 m | ~35 m³ Hacim',
  },
  {
    id: 'd72-6',
    series: 'daily72',
    seriesLabel: 'IVECO Daily 72C18 Hi-Matic Şasi (7.970 kg Kantar)',
    bodyType: 'acik_kasa',
    bodyTypeLabel: 'Örnek Uygulama: İlaveli Sebze / Meyve / Hal Kasası',
    title: 'Daily 72C18 Hi-Matic Şasi — İlaveli Hal & Sebze Kasası Örneği',
    subtitle: 'Hal taşımacılığı, sebze-meyve kasaları ve tarım lojistiği için havalandırmalı yan ilaveli açık kasa örneği.',
    image: '/ustyapi/daily72-6.jpg',
    sampleDims: 'Örnek Kasa Boyu: 5.40 m - 6.00 m | Hal & Gıda Lojistiği',
  },
  {
    id: 'd72-7',
    series: 'daily72',
    seriesLabel: 'IVECO Daily 72C18 Şasi (7.970 kg Kantar)',
    bodyType: 'acik_kasa',
    bodyTypeLabel: 'Örnek Uygulama: Uzun Şasi Açık Sac/Alüminyum Kasa',
    title: 'Daily 72C18 Şasi — 3 Kapaklı Uzun Açık Kasa Örneği',
    subtitle: 'Yanlardan tam açılır 3 parçalı kapak sistemiyle vinç ve forklift yüklemesine uygun uzun açık kasa örneği.',
    image: '/ustyapi/daily72-7.jpg',
    sampleDims: 'Örnek Kasa Boyu: 5.80 m - 6.20 m | Paletli Yapı & Sanayi Yükü',
  },

  // ── EUROCARGO (100E / 120E / 150E / 160E KAMYON ŞASİ ÖRNEKLERİ) ─────────
  {
    id: 'ec-1',
    series: 'eurocargo',
    seriesLabel: 'IVECO Eurocargo 150-210 Şasi (15 Ton Sınıfı)',
    bodyType: 'acik_kasa',
    bodyTypeLabel: 'Örnek Uygulama: Ağır Hizmet Açık Sac Kasa',
    title: 'Eurocargo 150-210 Şasi — 3 Kapaklı Açık Sac Kasa Örneği',
    subtitle: '15 ton sınıfı Eurocargo şasisi üzerinde inşaat, demir, paletli tuğla ve sanayi yükleri için açık sac kasa örneği.',
    image: '/ustyapi/eurocargo-1.jpg',
    sampleDims: 'Örnek Kasa Boyu: 6.20 m - 7.20 m | Tector 210 BG Motor',
  },
  {
    id: 'ec-2',
    series: 'eurocargo',
    seriesLabel: 'IVECO Eurocargo 160-250 / 160-320 Şasi (6x2 / İlaveli)',
    bodyType: 'acik_kasa',
    bodyTypeLabel: 'Örnek Uygulama: Uzun Şasi Açık Kasa (10 Teker)',
    title: 'Eurocargo Uzun Şasi — Yüksek Tonajlı Açık Sac Kasa Örneği',
    subtitle: 'Uzun şasi ve ilave dingil kombinasyonuyla yüksek tonajlı açık yük taşımacılığı üstyapı örneği.',
    image: '/ustyapi/eurocargo-2.jpg',
    sampleDims: 'Örnek Kasa Boyu: 7.50 m - 8.50 m | Ağır Tonaj Nakliye',
  },
  {
    id: 'ec-3',
    series: 'eurocargo',
    seriesLabel: 'IVECO Eurocargo 100-190 / 120E Şasi',
    bodyType: 'frigo',
    bodyTypeLabel: 'Örnek Uygulama: Carrier Frigorifik Kasa',
    title: 'Eurocargo 100-190 Şasi — Soğutuculu Frigorifik Kasa Örneği',
    subtitle: 'Şehirlerarası ve bölgesel et, süt, donuk gıda dağıtımı için Carrier soğutuculu izoleli kasa örneği.',
    image: '/ustyapi/eurocargo-3.jpg',
    sampleDims: 'Örnek Kasa Boyu: 5.80 m - 6.80 m | 14-16 Palet Soğuk Zincir',
  },
  {
    id: 'ec-4',
    series: 'eurocargo',
    seriesLabel: 'IVECO Eurocargo 160-320 Şasi (10 Teker Uzun Şasi)',
    bodyType: 'tenteli',
    bodyTypeLabel: 'Örnek Uygulama: Kayar Perdeli & Kapaklı Tenteli Kasa',
    title: 'Eurocargo 160-320 Şasi — Uzun Kayar Perdeli Tenteli Kasa Örneği',
    subtitle: 'Şehirlerarası komple ve parsiyel lojistik için yan kapaklı ve kayar perdeli yüksek hacimli üstyapı örneği.',
    image: '/ustyapi/eurocargo-4.jpg',
    sampleDims: 'Örnek Kasa Boyu: 7.80 m - 8.60 m | 20-22 Euro Palet Kapasitesi',
  },
  {
    id: 'ec-5',
    series: 'eurocargo',
    seriesLabel: 'IVECO Eurocargo 160-320 Şasi (10 Teker)',
    bodyType: 'kapali_kutu',
    bodyTypeLabel: 'Örnek Uygulama: Yan Kapılı Uzun Kapalı Kutu Kasa',
    title: 'Eurocargo 160-320 Şasi — Tepe Rüzgarlıklı Kapalı Kutu Örneği',
    subtitle: 'Ulusal zincir market, mobilya, beyaz eşya ve tekstil lojistiği için yüksek hacimli kapalı kutu kasa örneği.',
    image: '/ustyapi/eurocargo-5.jpg',
    sampleDims: 'Örnek Kasa Boyu: 7.80 m - 8.50 m | 320 BG Uzun Yol Şasisi',
  },
  {
    id: 'ec-6',
    series: 'eurocargo',
    seriesLabel: 'IVECO Eurocargo 150-210 Şasi',
    bodyType: 'tenteli',
    bodyTypeLabel: 'Örnek Uygulama: Römorklu Kayar Perde (Kamyon + Römork)',
    title: 'Eurocargo 150-210 Şasi — Römorklu Yüksek Hacim Tenteli Örneği',
    subtitle: 'Hacimli sanayi, plastik, kablo ve mobilya taşımacılığında TIR hacmi sunan kamyon + römork üstyapı örneği.',
    image: '/ustyapi/eurocargo-6.jpg',
    sampleDims: 'Örnek Uygulama: Kamyon + Tandem Römork (100+ m³ Kübaj)',
  },
  {
    id: 'ec-7',
    series: 'eurocargo',
    seriesLabel: 'IVECO Eurocargo 150-250 Şasi',
    bodyType: 'frigo',
    bodyTypeLabel: 'Örnek Uygulama: Uzun Şasi Frigorifik Soğuk Zincir Kasa',
    title: 'Eurocargo 150-250 Şasi — 16-18 Palet Frigorifik Kasa Örneği',
    subtitle: 'Yüksek tonajlı dondurulmuş gıda, yaş meyve-sebze ve hal lojistiği için uzun şasi frigorifik üstyapı örneği.',
    image: '/ustyapi/eurocargo-7.jpg',
    sampleDims: 'Örnek Kasa Boyu: 6.80 m - 7.60 m | 250 BG Tector 7 Motor',
  },
  {
    id: 'ec-8',
    series: 'eurocargo',
    seriesLabel: 'IVECO Eurocargo 150 / 120 Şasi',
    bodyType: 'tenteli',
    bodyTypeLabel: 'Örnek Uygulama: Kayar Perdeli Mobilya & Yapı Kasası',
    title: 'Eurocargo Şasi — Kayar Perdeli Mobilya & Kapı/Mutfak Kasası Örneği',
    subtitle: 'Banyo, kapı, mutfak ve mobilya üreticilerinin şehirlerarası sevkiyatlarında kullandığı kayar perdeli kasa örneği.',
    image: '/ustyapi/eurocargo-8.jpg',
    sampleDims: 'Örnek Kasa Boyu: 6.50 m - 7.40 m | Yan Kapaklı & Kayar Perdeli',
  },
];

export function resolveBodyworkSeriesFromModel(modelKeyOrText = '') {
  const s = String(modelKeyOrText || '').toLowerCase();
  if (s.includes('72c') || s.includes('70c') || s.includes('truck_72c')) return 'daily72';
  if (
    s.includes('eurocargo') ||
    s.includes('100e') ||
    s.includes('120e') ||
    s.includes('150e') ||
    s.includes('160e') ||
    s.includes('180e') ||
    s.includes('150-210') ||
    s.includes('150-250') ||
    s.includes('160-320') ||
    s.includes('100-190')
  ) {
    return 'eurocargo';
  }
  if (s.includes('35c') || s.includes('35s') || s.includes('daily 35') || s.includes('chassis_35')) {
    return 'daily35';
  }
  return 'all';
}
