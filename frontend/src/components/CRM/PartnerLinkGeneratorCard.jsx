import React, { useState, useMemo, useEffect } from 'react';
import {
  DEFAULT_PARTNER_PROTOCOLS,
  getSavedCustomPartners,
  saveCustomPartner,
  deleteCustomPartner,
  buildPartnerShareUrl,
  buildPartnerAnnouncementText
} from '../../data/partnerProtocols';
import { BANK_LIST } from '../../data/bankCampaigns';
import { REGIONAL_PROSPECTS_DIRECTORY, PROSPECT_CATEGORY_TABS } from '../../data/regionalProspectsDirectory';
import { crmApi, discoveryApi } from '../../api/client';
import { getPublicOrigin } from '../../utils/publicUrl';
import { openWhatsAppChat } from '../../utils/openExternal';
import {
  FiCopy, FiExternalLink, FiPlus, FiCheck, FiSend, FiTag,
  FiTrash2, FiChevronDown, FiChevronUp, FiShare2, FiUsers, FiSearch
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const SECTOR_OPTIONS = [
  { id: 'all', label: '🏢 Tüm 2026 Modeller (Genel Vitrin)' },
  { id: 'insaat_malzeme', label: '🏗️ İnşaat, Nalbur & Müteahhitlik' },
  { id: 'tarim_yem', label: '🌾 Tarım, Arıcılık & Yem' },
  { id: 'kargo_dagitim', label: '🚛 Nakliye, Kargo & Dağıtım' },
  { id: 'gida_frigo', label: '❄️ Gıda & Soğuk Zincir' },
  { id: 'hafriyat_santiye', label: '🚜 Hafriyat & Şantiye' },
  { id: 'oto_kurtarma', label: '🛞 Oto Kurtarma & Yol Yardım' },
  { id: 'agir_nakliye', label: '🛣️ Uzun Yol & Uluslararası Tır' }
];

const VEHICLE_GROUP_OPTIONS = [
  { id: 'daily35_chassis', label: '🛻 Daily 3.5T Şasi' },
  { id: 'daily35_van', label: '🚐 Daily Panelvan' },
  { id: 'daily70', label: '🚛 Daily 70C (7 Ton)' },
  { id: 'eurocargo', label: '🚚 Eurocargo (10–18T)' },
  { id: 'sway', label: '🛣️ S-Way Çekici' },
  { id: 'tway', label: '🚜 T-Way (Mikser/Hafriyat)' }
];

const VEHICLE_GROUP_PRESETS = [
  { id: 'all', label: '🌟 Tümü Açık', groups: [] },
  { id: 'beton_insaat', label: '🏗️ Beton Santrali & İnşaat (S-Way + T-Way + Daily)', groups: ['tway', 'sway', 'daily35_chassis'] },
  { id: 'santiye', label: '🚜 Sadece Şantiye (T-Way + S-Way)', groups: ['tway', 'sway'] },
  { id: 'lojistik', label: '🛣️ Lojistik Filo (S-Way + Eurocargo + 70C)', groups: ['sway', 'eurocargo', 'daily70'] },
  { id: 'esnaf', label: '📦 Şehir İçi Dağıtım (Daily Şasi + Panelvan + 70C)', groups: ['daily35_chassis', 'daily35_van', 'daily70'] }
];

const SOCIAL_CHANNELS = [
  {
    id: 'wa_durum',
    label: '🟢 WhatsApp Durum',
    shortDesc: 'WhatsApp Durum (Status) hikayesi için takip linki',
    refCode: 'wa_durum',
    badgeText: '🟢 WhatsApp Durum Ziyaretçisi',
    color: '#22c55e'
  },
  {
    id: 'wa_musteri',
    label: '💬 WhatsApp Müşteri',
    shortDesc: 'Fiyat soran müşteriye anında atılacak genel katalog & kredi linki',
    refCode: 'wa_musteri',
    badgeText: '💬 WhatsApp Müşteri Linki Ziyaretçisi',
    color: '#38bdf8'
  },
  {
    id: 'wa_ozel',
    label: '👑 WhatsApp Özel Müşteriler (VIP)',
    shortDesc: 'Müşterinin ismine/firmasına ve isteğe bağlı özel indirime sahip VIP link',
    refCode: 'wa_ozel',
    badgeText: '👑 WhatsApp Özel Müşteri Ziyaretçisi',
    color: '#f59e0b'
  },
  {
    id: 'mail_kurumsal',
    label: '📧 E-Posta / Kurumsal Mail',
    shortDesc: 'Satın alma, filo ve muhasebe birimlerine hazır konu başlığı + kurumsal mail metni + takip linki',
    refCode: 'mail_kurumsal',
    badgeText: '📧 Kurumsal E-Posta Ziyaretçisi',
    color: '#a855f7'
  },
  {
    id: 'banka_kanal',
    label: '🏦 Bankacılara Özel (Tek Banka Linki)',
    shortDesc: 'Sadece seçilen bankanın (Garanti, DenizBank vb.) kredi oranlarını gösterir',
    refCode: 'banka_garanti',
    badgeText: '🏦 Banka Özel Link Ziyaretçisi',
    color: '#38bdf8'
  },
  {
    id: 'smmm_kanal',
    label: '👨‍💼 Mali Müşavir / Muhasebeci',
    shortDesc: 'Mali müşavirlere ve mükelleflerine özel %20 KDV + Kampanya Tablosu linki',
    refCode: 'smmm_kanal',
    badgeText: '👨‍💼 Mali Müşavir / SMMM Linki Ziyaretçisi',
    color: '#10b981'
  },
  {
    id: 'wa_grup',
    label: '🚚 Nakliye WA Grupları',
    shortDesc: 'Kamyoncu, nakliyeci ve lojistik WhatsApp grupları için duyuru linki',
    refCode: 'wa_grup',
    badgeText: '🚚 Nakliye WhatsApp Grubu Ziyaretçisi',
    color: '#eab308'
  },
  {
    id: 'fb_grup',
    label: '📘 Facebook Grupları',
    shortDesc: 'Facebook kamyoncu, nakliyeci, esnaf ve alım-satım grupları için paylaşım linki',
    refCode: 'fb_grup',
    badgeText: '📘 Facebook Grubu Ziyaretçisi',
    color: '#1877F2'
  },
  {
    id: 'instagram',
    label: '📸 Instagram',
    shortDesc: 'Biyografi (Bio), Hikaye (Link Etiketi) ve Reels paylaşım linki',
    refCode: 'instagram',
    badgeText: '📸 Instagram Ziyaretçisi',
    color: '#ec4899'
  },
  {
    id: 'linkedin',
    label: '💼 LinkedIn',
    shortDesc: 'Kurumsal filo yöneticileri ve şirket sahipleri için paylaşım linki',
    refCode: 'linkedin',
    badgeText: '💼 LinkedIn Ziyaretçisi',
    color: '#0ea5e9'
  }
];

const QUICK_TL_DISCOUNTS = [25000, 40000, 50000, 75000, 100000];
const QUICK_PCT_DISCOUNTS = [1.5, 2, 3, 4, 5];
const TAX_OUTREACH_SENT_KEY = 'iveco_year_end_tax_sent_v1';

export default function PartnerLinkGeneratorCard({ isMobile = false }) {
  const [isExpanded, setIsExpanded] = useState(true);
  // 'channels' = WhatsApp Durum / Müşteri / Özel Müşteri / Kurumsal Mail / Bankacılara Özel / Mali Müşavir / FB Grupları / Instagram / LinkedIn
  // 'partners' = Dernek, Oda & Birlik Protokolleri (SİMDER, SMMM, Arıcılar Birliği vb.)
  // 'tax_radar' = Madde 4: CRM'deki Eski Kayıtlara & Niyet Radarı'na "Yıl Sonu KDV / Vergi Uyarısı" Hızlı Tarama
  const [studioMode, setStudioMode] = useState('channels');

  // --- SEKME 1: SOSYAL MEDYA, E-POSTA & WHATSAPP MÜŞTERİ LİNK ÜRETİCİ STATE'LERİ ---
  const [selectedChannelId, setSelectedChannelId] = useState('wa_durum');
  const [selectedBankChannelId, setSelectedBankChannelId] = useState('garanti');
  const [bankOpenTab, setBankOpenTab] = useState('krediler'); // 'krediler' | 'fiyatlar'
  const [mailTemplate, setMailTemplate] = useState('kurumsal_filo'); // 'kurumsal_filo' | 'beton_santiye' | 'kdv_muhasebe' | 'takas_yenileme'
  const [vipEmail, setVipEmail] = useState('');
  const [hookStyle, setHookStyle] = useState('curiosity_short'); // 'curiosity_short' | 'tradein_hook' | 'tax_hook' | 'detailed'
  const [channelSector, setChannelSector] = useState('all');
  const [selectedVehicleGroups, setSelectedVehicleGroups] = useState([]); // [] = Tümü açık, örn: ['tway','sway','daily35_chassis']
  const [vipTone, setVipTone] = useState('friendly'); // 'friendly' | 'new_lead' | 'corporate'
  const [vipCustomerSearch, setVipCustomerSearch] = useState('');
  const [vipMatchedCustomers, setVipMatchedCustomers] = useState([]);
  const [vipSelectedCustomer, setVipSelectedCustomer] = useState(null);
  const [vipCompanyName, setVipCompanyName] = useState('');
  const [vipPhone, setVipPhone] = useState('');
  const [enableExporterEurLoan, setEnableExporterEurLoan] = useState(false);
  const [enableChannelDiscount, setEnableChannelDiscount] = useState(false);
  const [channelDiscountType, setChannelDiscountType] = useState('amount'); // 'amount' | 'percent'
  const [channelDiscountValue, setChannelDiscountValue] = useState(50000);
  const [channelDiscountTitle, setChannelDiscountTitle] = useState('Özel Müşteri İskontosu');

  // --- SEKME 2: DERNEK, ODA & BİRLİK (SİMDER, SMMM, ARICILAR BİRLİĞİ VB.) STATE'LERİ ---
  const [customPartners, setCustomPartners] = useState(() => getSavedCustomPartners());
  const allPresets = useMemo(() => [...DEFAULT_PARTNER_PROTOCOLS, ...customPartners], [customPartners]);
  const [selectedId, setSelectedId] = useState('simder');
  const [shortName, setShortName] = useState(DEFAULT_PARTNER_PROTOCOLS[0].shortName);
  const [fullName, setFullName] = useState(DEFAULT_PARTNER_PROTOCOLS[0].fullName);
  const [logoUrl, setLogoUrl] = useState(DEFAULT_PARTNER_PROTOCOLS[0].logoUrl);
  const [icon, setIcon] = useState(DEFAULT_PARTNER_PROTOCOLS[0].icon);
  const [discountType, setDiscountType] = useState(DEFAULT_PARTNER_PROTOCOLS[0].discountType);
  const [discountValue, setDiscountValue] = useState(DEFAULT_PARTNER_PROTOCOLS[0].discountValue);
  const [defaultSector, setDefaultSector] = useState(DEFAULT_PARTNER_PROTOCOLS[0].defaultSector);
  const [extraPerk, setExtraPerk] = useState(DEFAULT_PARTNER_PROTOCOLS[0].extraPerk);
  const [targetPhone, setTargetPhone] = useState('');

  // --- SEKME 3 (MADDE 4): ESKİ CRM KAYITLARI & NİYET RADARI YIL SONU KDV TARAMASI STATE'LERİ ---
  const [taxRadarTargets, setTaxRadarTargets] = useState([]);
  const [taxRadarLoading, setTaxRadarLoading] = useState(false);
  const [taxRadarSearch, setTaxRadarSearch] = useState('');
  const [taxRadarFilter, setTaxRadarFilter] = useState('unsent'); // 'all' | 'unsent' | 'crm' | 'radar'
  const [taxRadarTemplate, setTaxRadarTemplate] = useState('esnaf_kdv'); // 'esnaf_kdv' | 'kurumsal_vergi' | 'smmm_muhasebe' | 'ihracat_euro'
  const [sentTaxPhones, setSentTaxPhones] = useState(() => {
    try {
      const raw = window.localStorage.getItem(TAX_OUTREACH_SENT_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const origin = getPublicOrigin();

  // CRM'den müşteri arama (WhatsApp Özel Müşteriler için)
  useEffect(() => {
    const q = vipCustomerSearch.trim();
    if (q.length < 2) {
      setVipMatchedCustomers([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await crmApi.getCustomers({ search: q, page_size: 5 });
        const items = res.data?.items || res.data || [];
        setVipMatchedCustomers(items);
      } catch {
        setVipMatchedCustomers([]);
      }
    }, 260);
    return () => clearTimeout(timer);
  }, [vipCustomerSearch]);

  const activeChannel = useMemo(
    () => SOCIAL_CHANNELS.find(c => c.id === selectedChannelId) || SOCIAL_CHANNELS[0],
    [selectedChannelId]
  );

  const selectedBankObj = useMemo(
    () => BANK_LIST.find(b => b.id === selectedBankChannelId) || BANK_LIST[0],
    [selectedBankChannelId]
  );

  const toggleVehicleGroup = (groupId) => {
    setSelectedVehicleGroups(prev => {
      const exists = prev.includes(groupId);
      const next = exists ? prev.filter(id => id !== groupId) : [...prev, groupId];
      if (next.length === VEHICLE_GROUP_OPTIONS.length) return [];
      return next;
    });
  };

  // Sekme 1 için üretilen Link
  const channelGeneratedLink = useMemo(() => {
    const baseOrigin = (origin || 'https://iveco-crm.onrender.com').replace(/\/$/, '');
    const params = new URLSearchParams();
    const isEurLoanActive = enableExporterEurLoan || hookStyle === 'exporter_eur' || (selectedChannelId === 'mail_kurumsal' && mailTemplate === 'ihracat_euro');

    if (selectedChannelId === 'banka_kanal') {
      params.set('bank', selectedBankObj.id);
      if (bankOpenTab === 'krediler') {
        params.set('tab', 'krediler');
      }
      if (isEurLoanActive) {
        params.set('loan', 'eur');
      }
      if (vipCompanyName.trim()) {
        params.set('bbranch', vipCompanyName.trim());
        params.set('company', `${selectedBankObj.shortName} - ${vipCompanyName.trim()}`);
      }
      const cleanPhone = vipPhone.replace(/\D/g, '');
      if (cleanPhone.length >= 10) {
        params.set('phone', cleanPhone);
      }
      if (selectedVehicleGroups.length > 0) {
        params.set('groups', selectedVehicleGroups.join(','));
      } else if (channelSector && channelSector !== 'all') {
        params.set('sector', channelSector);
      }
      if (enableChannelDiscount && Number(channelDiscountValue) > 0) {
        params.set('partner', 'vip_ozel');
        params.set('pshort', `${selectedBankObj.shortName} Müşterisi`);
        params.set('pname', `${selectedBankObj.name} Portföy Müşterisi Özel İndirimi`);
        params.set('pdisc', String(channelDiscountValue));
        params.set('pdisc_type', channelDiscountType);
        params.set('picon', selectedBankObj.icon || '🏦');
      }
      params.set('ref', `banka_${selectedBankObj.id}`);
      return `${baseOrigin}/fiyat-listesi?${params.toString()}`;
    }

    const isSameSelectedCustomer =
      vipSelectedCustomer?.id &&
      vipCompanyName.trim() &&
      vipCompanyName.trim().toLowerCase() === (vipSelectedCustomer.company_name || '').trim().toLowerCase();

    if (isSameSelectedCustomer && selectedChannelId !== 'fb_grup' && selectedChannelId !== 'mail_kurumsal') {
      params.set('cid', String(vipSelectedCustomer.id));
    }
    if (vipCompanyName.trim()) {
      params.set('company', vipCompanyName.trim());
    }
    const cleanPhone = vipPhone.replace(/\D/g, '');
    if (cleanPhone.length >= 10 && selectedChannelId !== 'mail_kurumsal' && selectedChannelId !== 'fb_grup') {
      params.set('phone', cleanPhone);
    }
    if (selectedVehicleGroups.length > 0) {
      params.set('groups', selectedVehicleGroups.join(','));
    } else if (channelSector && channelSector !== 'all') {
      params.set('sector', channelSector);
    }
    if (isEurLoanActive) {
      params.set('loan', 'eur');
    }
    if (enableChannelDiscount && Number(channelDiscountValue) > 0) {
      const label = vipCompanyName.trim()
        ? `${vipCompanyName.trim()} Özel İndirimi`
        : (channelDiscountTitle.trim() || 'Özel Kampanya İndirimi');
      params.set('partner', 'vip_ozel');
      params.set('pshort', vipCompanyName.trim() || 'VIP Müşteri');
      params.set('pname', label);
      params.set('pdisc', String(channelDiscountValue));
      params.set('pdisc_type', channelDiscountType);
      params.set('picon', '👑');
    }
    params.set('ref', activeChannel.refCode);
    return `${baseOrigin}/fiyat-listesi?${params.toString()}`;
  }, [
    origin,
    selectedChannelId,
    selectedBankObj,
    bankOpenTab,
    activeChannel,
    vipSelectedCustomer,
    vipCompanyName,
    vipPhone,
    channelSector,
    selectedVehicleGroups,
    enableExporterEurLoan,
    hookStyle,
    mailTemplate,
    enableChannelDiscount,
    channelDiscountValue,
    channelDiscountType,
    channelDiscountTitle
  ]);

  const mailSubject = useMemo(() => {
    const compPrefix = vipCompanyName.trim() ? `${vipCompanyName.trim()} — ` : '';
    const discNote = enableChannelDiscount && Number(channelDiscountValue) > 0
      ? (channelDiscountType === 'percent' ? ` (%${channelDiscountValue} Özel İskonto)` : ` (-${Number(channelDiscountValue).toLocaleString('tr-TR')} TL Özel İndirim)`)
      : '';
    if (mailTemplate === 'ihracat_euro' || enableExporterEurLoan) {
      return `${compPrefix}2026 IVECO İhracatçı Euro (€) Kredisi (%0 Kâr Payı / 6 Ay Ödemesiz) & Filo Teklifi${discNote}`;
    }
    if (mailTemplate === 'beton_santiye' || (selectedVehicleGroups.includes('tway') && selectedVehicleGroups.length <= 3)) {
      return `${compPrefix}2026 IVECO 12 Teker Beton Mikseri, Ağır Hafriyat Damperi & Çekici Özel Fiyat Teklifi${discNote}`;
    }
    if (mailTemplate === 'kdv_muhasebe') {
      return `${compPrefix}2026 IVECO Yıl Sonu %20 KDV Mahsubu, Tam Amortisman & Şasi Faturası Tablosu${discNote}`;
    }
    if (mailTemplate === 'takas_yenileme') {
      return `${compPrefix}Filo Yenileme, Takas Değerleme & 1.000.000 TL %0 Faizli 2026 IVECO Teklifi${discNote}`;
    }
    return `${compPrefix}2026 Model IVECO Ticari Araç Fiyat Listesi, Filo İskontosu & Kredi Simülasyonu${discNote}`;
  }, [vipCompanyName, mailTemplate, selectedVehicleGroups, enableExporterEurLoan, enableChannelDiscount, channelDiscountValue, channelDiscountType]);

  // Sekme 1 için üretilen Hazır Paylaşım Mesajı
  const channelGeneratedMessage = useMemo(() => {
    const link = channelGeneratedLink;
    const isEurLoanActive = enableExporterEurLoan || hookStyle === 'exporter_eur' || (selectedChannelId === 'mail_kurumsal' && mailTemplate === 'ihracat_euro');
    const discountShortNote = enableChannelDiscount && Number(channelDiscountValue) > 0
      ? (channelDiscountType === 'percent'
          ? ` (%${channelDiscountValue} özel iskonto tanımlı)`
          : ` (${Number(channelDiscountValue).toLocaleString('tr-TR')} TL özel indirim tanımlı)`)
      : '';
    const discountLine = enableChannelDiscount && Number(channelDiscountValue) > 0
      ? (channelDiscountType === 'percent'
          ? `🎁 *Size Özel Tanımlanan İndirim:* Tüm 2026 modellerde *%${channelDiscountValue} Özel İskonto* fiyatlardan otomatik düşülmüştür!\n`
          : `🎁 *Size Özel Tanımlanan İndirim:* Tüm 2026 modellerde *Araç Başı ${Number(channelDiscountValue).toLocaleString('tr-TR')} TL Özel İndirim* fiyatlardan otomatik düşülmüştür!\n`)
      : '';
    const eurBonusLine = isEurLoanActive
      ? `💶 *İhracatçı Euro (€) Kredisi Avantajı:* 32 Sayılı Karar kapsamında ihracatçı firmalarımıza özel *Kuveyt Türk (%0 Kâr Payı / 6 Ay Ödemesiz), Garanti BBVA ve BNP Paribas Euro (€) Kredi* taksitlerini ekranınızda doğrudan Euro bazında hesaplayabilirsiniz!\n`
      : '';

    // 📧 KURUMSAL E-POSTA / MAİL ŞABLONLARI (Düz Metin, Resmi Hitap, İmza Bloğu ve Özel Link)
    if (selectedChannelId === 'mail_kurumsal') {
      const targetCompany = vipCompanyName.trim() ? `Sayın ${vipCompanyName.trim()} Yönetimi / Satın Alma ve Finans Müdürlüğü,` : 'Sayın Yetkili,';
      const plainDiscountLine = enableChannelDiscount && Number(channelDiscountValue) > 0
        ? (channelDiscountType === 'percent'
            ? `\n• FİRMANIZA ÖZEL TANIMLI İSKONTO: Aşağıdaki bağlantıda tüm 2026 model araçlarımızda firmanıza özel %${channelDiscountValue} kurumsal filo iskontosu fiyatlardan otomatik olarak düşülmüştür.\n`
            : `\n• FİRMANIZA ÖZEL TANIMLI İNDİRİM: Aşağıdaki bağlantıda tüm 2026 model araçlarımızda firmanıza özel araç başı ${Number(channelDiscountValue).toLocaleString('tr-TR')} TL kurumsal indirim fiyatlardan otomatik olarak düşülmüştür.\n`)
        : '';
      const plainEurBonusLine = isEurLoanActive
        ? `\n• İHRACATÇI EURO (€) KREDİSİ AVANTAJI (32 Sayılı Karar): İhracatçı / döviz gelirli firmanıza özel Kuveyt Türk (%0 Kâr Payı / 6 Ay Ödemesiz), Garanti BBVA ve BNP Paribas Euro (€) kredi taksitlerini bağlantıdaki her araç kartı içinde doğrudan Euro bazında simüle edebilirsiniz.\n`
        : '';

      const groupLabels = selectedVehicleGroups.length > 0
        ? VEHICLE_GROUP_OPTIONS.filter(g => selectedVehicleGroups.includes(g.id)).map(g => g.label.replace(/^[^\s]+\s/, '')).join(', ')
        : 'Daily (3.5T - 7T), Eurocargo (10T - 18T), S-Way Çekici ve T-Way (Mikser / Hafriyat)';

      const signatureBlock =
        `\nSaygılarımla,\n\n` +
        `Can Murat\n` +
        `Ticari Araç Satış Sorumlusu\n` +
        `IVECO ERC Samsun Otomotiv Yetkili Bayii\n` +
        `GSM / WhatsApp: 0544 622 59 31`;

      if (mailTemplate === 'ihracat_euro') {
        return (
          `${targetCompany}\n\n` +
          `İhracat ve uluslararası lojistik operasyonlarınız kapsamında; 32 Sayılı Karar uyarınca döviz gelirli firmalarımıza özel hazırladığımız "2026 Model IVECO İhracatçı Euro (€) Kredisi, %20 KDV Kalkanı & Filo Teklifimizi" bilgilerinize sunarız:\n` +
          plainDiscountLine +
          `\n1. İhracatçıya Özel Euro (€) Finansmanı: Yüksek TL kredi maliyetlerine girmeden; Kuveyt Türk (%0 Kâr Payı veya 6 Ay Ödemesiz Dönem), Garanti BBVA ve BNP Paribas anlaşmalı Euro (€) kredi paketlerimizle 12 aydan 60 aya varan Euro bazlı taksit imkanı sunuyoruz.\n` +
          `2. Kapsanan Araç Grupları: ${groupLabels} (S-Way Çekici, Eurocargo, Daily 70C ve 3.5T serisi dahil tüm ticari modellerimiz).\n` +
          `3. %20 KDV Mahsubu & Tam Amortisman: Fatura içindeki %20 KDV'nin tamamı doğrudan mahsup edilir ve kıst amortisman sınırı olmaksızın 1. yıl %20 tam amortisman gider yazılır. Üstyapıyı beklemeden hemen şasi faturası kesebilmekteyiz.\n\n` +
          `Firmanıza özel Euro (€) kredi taksit hesaplayıcısı açık olarak hazırlanan dijital katalog bağlantımız:\n\n` +
          `${link}\n` +
          signatureBlock
        );
      }

      if (mailTemplate === 'beton_santiye') {
        return (
          `${targetCompany}\n\n` +
          `2026 yılı hazır beton, inşaat, maden ve şantiye yatırımlarınız kapsamında; IVECO ERC Samsun Otomotiv olarak hazırladığımız güncel 12 Teker (8x4) T-Way, S-Way Çekici ve Daily şasi fiyatlarımızı bilgilerinize sunarız:\n` +
          plainDiscountLine +
          plainEurBonusLine +
          `\n• 12 Teker (8x4) T-Way AD410T46 (460 BG) Beton Mikseri Şasisi:\n` +
          `  - Kampanyalı Liste Fiyatı: 6.075.000 TL (KDV Dahil)\n` +
          `  - Nakit / Peşin Alım Özel Fiyatı: 5.750.000 TL (-325.000 TL Nakit İndirimi)\n` +
          `• 12 Teker (8x4) T-Way AD410T54 (540 BG) Ağır Hafriyat / Kaya Damperi Şasisi:\n` +
          `  - Kampanyalı Liste Fiyatı: 6.175.000 TL (KDV Dahil)\n` +
          `  - Nakit / Peşin Alım Özel Fiyatı: 5.850.000 TL (-325.000 TL Nakit İndirimi)\n` +
          `• Vergi & Amortisman Avantajı: Fatura içindeki %20 KDV'nin tamamı doğrudan ödenecek KDV'den mahsup edilir ve binek araçlardaki kıst amortisman sınırı olmaksızın 1. yıl %20 tam amortisman gider yazılır. Üstyapı imalatını beklemeden hemen şasi faturası kesebilmekteyiz.\n\n` +
          `Firmanız için filtrelenmiş canlı fiyat listesini, %20 KDV & amortisman tablosunu ve ticari kredi simülasyonunu aşağıdaki kurumsal bağlantımızdan inceleyebilirsiniz:\n\n` +
          `${link}\n` +
          signatureBlock
        );
      }

      if (mailTemplate === 'kdv_muhasebe') {
        return (
          `${targetCompany}\n\n` +
          `Vergi ve nakit akışı planlaması döneminde yüksek KDV veya Kurumlar/Gelir Vergisi ödemek yerine ticari araç filonuzu yenileyebilmeniz adına hazırladığımız "2026 IVECO %20 KDV Mahsubu, Tam Amortisman & Kampanya Tablomuzu" bilgilerinize sunarız:\n` +
          plainDiscountLine +
          plainEurBonusLine +
          `\n1. %20 İndirilecek KDV Kalkanı: Ticari şasi, panelvan, kamyon ve çekici faturalarımızdaki %20 KDV'nin tamamı tek seferde ödenecek KDV'nizden mahsup edilir.\n` +
          `2. Kıst Amortisman Muafiyeti: Binek araçların aksine ticari araçlarımızda kıst amortisman kısıtlaması yoktur; yılın hangi ayında fatura kesilirse kesilsin 1. yıl %20 tam amortisman doğrudan gider yazılır.\n` +
          `3. Üstyapıyı Beklemeden Hemen Şasi Faturası: Kasa, frigo, damper veya mikser imalat sırasını beklemeden ŞASİ faturanızı hemen keserek vergi avantajını anında kullanmanızı sağlıyoruz.\n` +
          `4. Finansman Desteği: 1.000.000 TL 12 Ay %0 Faiz (Aylık 83.333 TL), İhracatçı Euro (€) Kredisi veya anlaşmalı banka ticari kredi paketleri.\n\n` +
          `Mali müşaviriniz ve finans departmanınızla birlikte model bazlı KDV matrahlarını ve aylık ödeme tablosunu aşağıdaki canlı bağlantımızdan inceleyebilirsiniz:\n\n` +
          `${link}\n` +
          signatureBlock
        );
      }

      if (mailTemplate === 'takas_yenileme') {
        return (
          `${targetCompany}\n\n` +
          `Filonuzda bulunan mevcut ticari araçlarınızı değerinde takasa vererek 2026 model sıfır kilometre IVECO (${groupLabels}) araçlarla yenileyebilmeniz için hazırladığımız dijital hesaplama ekranımızı bilgilerinize sunarız:\n` +
          plainDiscountLine +
          plainEurBonusLine +
          `\n• Canlı Takas + Kredi Simülasyonu: Mevcut aracınızın tahmini takas bedelini peşinata sayarak, kalan tutar için 1.000.000 TL 12 Ay %0 Faiz, İhracatçı Euro (€) Kredisi ve anlaşmalı banka ticari kredi taksitlerini anında hesaplayabilirsiniz.\n` +
          `• 4 Fotoğrafla 15 Dakikada Takas Ön Değerleme: Aracınızı bayimize getirmeden ekran üzerinden 4 fotoğraf (dıştan, içten, KM ve ruhsat) yükleyerek 15 dakika içinde resmi takas ön teklifimizi alabilirsiniz.\n` +
          `• 24 Saat Ücretsiz Şasi & Fiyat Blokajı: Yönetim ve muhasebe onay süreciniz boyunca seçtiğiniz aracı 24 saat ücretsiz olarak firmanız adına opsiyonlayabilirsiniz.\n\n` +
          `Firmanıza özel hazırlanan dijital katalog ve takas/kredi simülasyon bağlantısı:\n\n` +
          `${link}\n` +
          signatureBlock
        );
      }

      // Default: 'kurumsal_filo'
      return (
        `${targetCompany}\n\n` +
        `2026 yılı ticari araç ve filo yatırımlarınız kapsamında; IVECO ERC Samsun Otomotiv olarak firmanız için hazırladığımız güncel dijital fiyat listemizi, %20 KDV vergi kalkanı & amortisman tablomuzu ve ticari kredi simülasyon bağlantımızı bilgilerinize sunarız:\n` +
        plainDiscountLine +
        plainEurBonusLine +
        `\n• Kapsanan Araç Grupları: ${groupLabels}\n` +
        `• Canlı Finansman & Takas Hesaplayıcı: 1.000.000 TL 12 Ay %0 Faiz kampanyamız, İhracatçı Euro (€) Kredisi ve anlaşmalı banka ticari kredi oranlarıyla aylık ödeme planınızı ekran üzerinden anında oluşturabilirsiniz.\n` +
        `• %20 KDV & Tam Amortisman Tablosu: Üstyapı imalatını beklemeden hemen şasi faturası kesim imkanı, %20 KDV mahsubu ve 1. yıl tam amortisman dökümünü tek tıkla muhasebe biriminize aktarabilirsiniz.\n` +
        `• Resmi Proforma & 24 Saat Fiyat Blokajı: İlgilendiğiniz modeller için aynı gün resmi banka proforması oluşturabilir veya fiyatı 24 saat ücretsiz sabitleyebilirsiniz.\n\n` +
        `Firmanıza özel hazırlanan canlı katalog ve hesaplama bağlantısı:\n\n` +
        `${link}\n` +
        signatureBlock
      );
    }

    // 🏦 BANKACILARA ÖZEL (SADECE SEÇİLEN BANKANIN ORANLARI GÖRÜNEN TEK BANKA LİNKİ)
    if (selectedChannelId === 'banka_kanal') {
      const bankerGreeting = vipCompanyName.trim()
        ? `Sayın *${vipCompanyName.trim()}* (${selectedBankObj.name}),`
        : `${selectedBankObj.icon} *Değerli ${selectedBankObj.name} Ticari / KOBİ Portföy Yöneticimiz,*`;
      const isParticipation = selectedBankObj.type === 'Katılım';
      const rateTermLabel = isParticipation ? 'kâr payı ve finansman' : 'faiz ve ticari kredi';
      if (hookStyle === 'curiosity_short') {
        return (
          `${bankerGreeting} merhabalar, kolay gelsin. 🙏\n\n` +
          `Ben IVECO ERC Samsun Otomotiv *Satış Sorumlusu Can Murat* (0544 622 59 31).\n\n` +
          `Şubenizde ticari araç (kamyonet, panelvan, kamyon veya çekici) yatırımı ya da yıl sonu KDV/vergi mahsubu için kredi limiti kullanan müşterileriniz olduğunda, *sadece ${selectedBankObj.name} ${rateTermLabel} oranlarının* ve 2026 IVECO proforma fiyatlarımızın yer aldığı *${selectedBankObj.shortName} Özel Dijital Ekranımızı* aşağıya bıraktım${discountShortNote}.\n\n` +
          eurBonusLine +
          `Müşterinizle doğrudan paylaşabilirsiniz; ekranda yalnızca *${selectedBankObj.name}* paketleri görünür ve şasi proformasını aynı gün hazırlarız 👇\n\n` +
          `*Satış Sorumlusu Can Murat — 0544 622 59 31*\n\n` +
          `${link}`
        );
      }
      return (
        `${bankerGreeting}\n\n` +
        `Ben IVECO ERC Samsun Otomotiv *Satış Sorumlusu Can Murat* (0544 622 59 31).\n\n` +
        `Portföyünüzde ticari araç alımı, filo yenileme veya yıl sonu vergi/KDV planlaması yapan müşterileriniz için *yalnızca ${selectedBankObj.name} ${rateTermLabel} oranlarının ve vade paketlerinin* yer aldığı özel hesaplama bağlantımızı bilgilerinize sunarım${discountShortNote}:\n\n` +
        discountLine +
        eurBonusLine +
        `${selectedBankObj.icon} *Sadece ${selectedBankObj.name} Oranları:* Bu bağlantıda diğer bankalar yer almaz; yalnızca *${selectedBankObj.name}* ticari finansman paketleri ve taksit tablosu açılır.\n` +
        `⚡ *Aynı Gün Proforma & Şasi Faturası:* Kredi/finansman onayı çıkan müşterilerinize üstyapıyı beklemeden *aynı gün resmi şasi proforması ve faturası* kesiyoruz.\n` +
        `🧾 *%20 KDV & Tam Amortisman Tablosu:* Müşteriniz araç kartından %20 KDV mahsubu ve 1. yıl tam amortisman hesabını tek tuşla görebilir.\n\n` +
        `📞 *Satış Sorumlusu Can Murat — 0544 622 59 31 | IVECO ERC Samsun Otomotiv*\n` +
        `👇 *${selectedBankObj.name} özel kredi ve 2026 IVECO fiyat ekranı:*\n\n` +
        `${link}`
      );
    }

    // WHATSAPP DURUM (STATUS) ÖZEL KURALI:
    if (selectedChannelId === 'wa_durum') {
      if (hookStyle === 'exporter_eur' || enableExporterEurLoan) {
        return (
          `🇪🇺 İhracatçı firmalarımıza özel Kuveyt Türk %0 Kâr Payı & 6 Ay Ödemesiz Euro (€) Kredisiyle 2026 IVECO taksitinizi hesaplayın${discountShortNote} 👇\n\n` +
          `${link}`
        );
      }
      if (hookStyle === 'tradein_hook') {
        return (
          `🔄 Aracınızı takasa verince 2026 IVECO ayda kaç TL'ye gelir? 1M TL %0 Faizle hemen hesaplayın${discountShortNote} 👇\n\n` +
          `${link}`
        );
      }
      if (hookStyle === 'tax_hook') {
        return (
          `🧾 Vergi ödemek yerine filoyu yenileyin: %20 KDV vergi indirimi ve 1M TL %0 Faiz tablosu${discountShortNote} 👇\n\n` +
          `${link}`
        );
      }
      if (hookStyle === 'detailed') {
        return (
          `🚛 2026 IVECO Canlı Fiyat, Takas & 1M TL %0 Faiz Kredi Hesaplama Ekranımız Açıldı${discountShortNote} 👇\n\n` +
          `${link}`
        );
      }
      return (
        `Kimseyi aramadan 10 saniyede elinizdeki aracın takasını düşüp 2026 IVECO kredi taksitinizi hesaplayın${discountShortNote} 👇\n\n` +
        `${link}`
      );
    }

    // 💶 İHRACATÇI EURO (€) KREDİSİ ÖZEL KANCASI
    if (hookStyle === 'exporter_eur') {
      const prefix = vipCompanyName.trim() ? `Sayın *${vipCompanyName.trim()}* Yönetimi, ` : '';
      return (
        `${prefix}merhabalar, hayırlı işler ve bol ihracatlar dilerim. 🙏\n\n` +
        `Ben IVECO ERC Samsun Otomotiv *Satış Sorumlusu Can Murat* (0544 622 59 31).\n\n` +
        `İhracatçı ve döviz gelirli firmalarımızın yüksek TL faiz maliyetine girmeden *32 Sayılı Karar kapsamında Euro (€) Kredisiyle* ticari araç alabilmesi için hazırladığımız *İhracatçı Özel Euro (€) Finansman & Fiyat Ekranımızı* aşağıya bıraktım${discountShortNote}:\n\n` +
        discountLine +
        `🇪🇺 *Kuveyt Türk %0 Kâr Payı & 6 Ay Ödemesiz Euro Kredisi:* Aracınızı bugün teslim alın, ilk Euro taksitini 6 ay sonra ödeyin veya 12 Ay %0 kâr payı avantajından yararlanın.\n` +
        `💶 *Garanti BBVA & BNP Paribas 12-60 Ay Euro Paketleri:* S-Way Çekici, Eurocargo, T-Way ve Daily serisi tüm araçlarımızda kart içindeki *"Taksit & Takas Hesapla"* tuşuyla aylık Euro (€) taksitinizi anında görebilirsiniz.\n` +
        `🧾 *%20 KDV Mahsubu & Hemen Şasi Faturası:* Üstyapıyı beklemeden şasi faturanızı hemen kesip %20 KDV ve tam amortisman avantajını kullanabilirsiniz 👇\n\n` +
        `📞 *Satış Sorumlusu Can Murat — 0544 622 59 31*\n\n` +
        `${link}`
      );
    }

    // 1. SIKMAYAN 2 CÜMLELİK MERAK KANCASI (REKLAM KOKMAYAN / EN YÜKSEK TIKLAMA)
    if (hookStyle === 'curiosity_short') {
      if (selectedChannelId === 'wa_ozel' || selectedChannelId === 'wa_musteri') {
        const prefix = vipCompanyName.trim() ? `*${vipCompanyName.trim()}* — ` : '';
        return (
          `${prefix}Abi selamlar, hayırlı işler dilerim. 🙏\n\n` +
          `Seni hiç telefonla bölmeyeyim dedim; beni aramana bile gerek kalmadan elindeki aracın takasını düşüp kalan kredi taksitini${isEurLoanActive ? ' (veya İhracatçı Euro € kredisini)' : ''} ve 2026 şasi fiyatlarını kendi başına görebileceğin bir hesap makinesi hazırladım${discountShortNote}. Lazım oldukça elinin altında bulunsun 👇\n\n` +
          eurBonusLine +
          `*Satış Sorumlusu Can Murat — 0544 622 59 31*\n\n` +
          `${link}`
        );
      }
      if (selectedChannelId === 'wa_grup') {
        return (
          `Cümleten hayırlı işler, kazasız belasız seferler abilerim. 🙏\n\n` +
          `Grubu reklamla meşgul etmek için değil, işinize yarayacak canlı bir hesap cetveli bırakmak için yazıyorum: Kimseyi aramadan hangi ehliyetle hangi tonaj taşınır, elinizdeki aracın takasını düşünce ayda kaç TL (veya ihracatçıya kaç €) taksit çıkar 10 saniyede kendiniz bakabilirsiniz${discountShortNote} 👇\n\n` +
          eurBonusLine +
          `*Satış Sorumlusu Can Murat — 0544 622 59 31*\n\n` +
          `${link}`
        );
      }
      if (selectedChannelId === 'fb_grup') {
        const groupPrefix = vipCompanyName.trim() ? `📘 ${vipCompanyName.trim()} ailesine ` : 'Gruptaki tüm kamyoncu, nakliyeci ve esnaf abilerime/kardeşlerime ';
        return (
          `${groupPrefix}hayırlı işler, kazasız belasız seferler dilerim! 🚛🙏\n\n` +
          `Kimseyi aramadan 10 saniyede elinizdeki aracın takas değerini düşüp, 2026 model sıfır IVECO şasi (Daily 3.5T, Daily 7T, Eurocargo, S-Way) için 1.000.000 TL %0 Faizle (veya ihracatçıya özel Euro € kredisiyle) ayda kaç taksit çıkacağını ve 24 farklı gerçek üstyapı örneğini kendi ekranınızda görebileceğiniz canlı hesap cetvelimizi bıraktım${discountShortNote} 👇\n\n` +
          `📞 Satış Sorumlusu Can Murat — 0544 622 59 31 (IVECO ERC Samsun)\n\n` +
          `${link}`
        );
      }
      if (selectedChannelId === 'instagram') {
        return (
          `"Elimdeki aracı takasa versem 2026 sıfır IVECO bana ayda kaç TL'ye gelir?" diye kimseye sormayın, 10 saniyede kendiniz hesaplayın! 🚛👇\n\n` +
          `*Satış Sorumlusu Can Murat — 0544 622 59 31*\n\n` +
          `${link}`
        );
      }
      return (
        `Ticari araç yatırımlarında telefon trafiğine girmeden; tonaj/kasa uyumu, %20 KDV vergi kalkanı, İhracatçı Euro (€) kredisi ve takas + kredi nakit akışını 30 saniyede kendi ekranınızda simüle edebileceğiniz dijital hesaplama aracımız${discountShortNote} 👇\n\n` +
        `*Satış Sorumlusu Can Murat — 0544 622 59 31 | IVECO ERC Samsun Otomotiv*\n\n` +
        `${link}`
      );
    }

    // 2. TAKAS & 4 RESİM KANCASI ("ARACIM KAÇ PARA EDER?")
    if (hookStyle === 'tradein_hook') {
      return (
        `🔄 *"Elimdeki aracı takasa versem ne kadar sayarlar, üstüne ayda kaç TL öderim?"* diye merak edenler için canlı ekran açtık!${discountShortNote}\n\n` +
        eurBonusLine +
        `İster araç kartındaki *"💳 Taksit & Takas Hesapla"* tuşundan aracınızın takas değerini düşüp *1.000.000 TL %0 Faizle (veya İhracatçı Euro € Kredisiyle)* kalan taksitinizi görün, isterseniz *"💬 Son Oluru / Dip Fiyatı Sor"* tuşuyla 15 dakikada takas ön fiyatınızı cebinize gönderelim 👇\n\n` +
        `*Satış Sorumlusu Can Murat — 0544 622 59 31*\n\n` +
        `${link}`
      );
    }

    // 3. %20 KDV VERGİ KALKANI, KAMPANYA TABLOSU & ŞASİ FATURASI KANCASI
    if (hookStyle === 'tax_hook' || selectedChannelId === 'smmm_kanal') {
      if (selectedChannelId === 'smmm_kanal') {
        const prefix = vipCompanyName.trim() ? `Sayın *${vipCompanyName.trim()}*,\n\n` : `👨‍💼 *Değerli Mali Müşavirimiz / SMMM Meslek Mensubumuz,*\n\n`;
        return (
          `${prefix}` +
          `Yıl sonu vergi planlamasında yüksek *KDV* veya *Gelir/Kurumlar Vergisi* çıkacak mükellefleriniz için hazırladığımız *2026 IVECO KDV, Tam Amortisman & Kampanya Tablomuzu* bilgilerinize sunarız${discountShortNote}:\n\n` +
          `🧾 *1. %20 İndirilecek KDV:* Ticari şasi/panelvan/çekici faturasındaki *%20 KDV (~308.000 TL - 1.150.000 TL)* tek seferde ödenecek KDV'den mahsup edilir.\n` +
          `📉 *2. Kıst Amortisman Yok:* Binek araçların aksine ticari araçlarımızda kıst amortisman sınırı yoktur; yılın son ayında kesilen faturada bile *1. yıl %20 tam amortisman* gider yazılır.\n` +
          `⚡ *3. Üstyapıyı Beklemeden Hemen Şasi Faturası:* Kasa/frigo imalatını beklemeden *ŞASİ faturasını hemen kesiyoruz*; mükellefiniz 2026 vergi avantajını kaçırmadan üstyapısını yaptırabiliyor.\n` +
          `💳 *4. Kampanya Özeti:* *1.000.000 TL 12 Ay %0 Faiz (83.333 TL/Ay)* ve ihracatçı mükelleflere özel *Euro (€) Kredisi*\n\n` +
          `📞 *Satış Sorumlusu Can Murat — 0544 622 59 31 | IVECO ERC Samsun Otomotiv*\n` +
          `👇 *Canlı KDV & Kampanya Tablosunu incelemek veya mükellefinizle paylaşmak için tıklayın:*\n\n` +
          `${link}`
        );
      }
      return (
        `🧾 *Yıl Sonu Vergi & KDV Ödemek Yerine Filoyu Yenilemek İsteyen İşletmelerimize Not:*\n\n` +
        `2026 model IVECO şasi, panelvan ve çekici alımlarında:\n` +
        `✅ Fatura içindeki *%20 KDV'nin tamamını* doğrudan ödenecek KDV'nizden düşebilir,\n` +
        `✅ Binek araçtaki kıst amortisman cezasına takılmadan *1. yıl %20 tam amortisman* gider yazabilir,\n` +
        `✅ Kasa/üstyapı sırasını beklemeden *ŞASİ faturanızı hemen kestirip* *1.000.000 TL 12 Ay %0 Faiz* (veya ihracatçıya özel Euro € kredisi) avantajından yararlanabilirsiniz${discountShortNote}!\n\n` +
        eurBonusLine +
        `📊 Her araç kartındaki *"Teknik & KDV Detayı"* bölümünden kendi faturanızı hesaplayıp mali müşavirinize tek tuşla gönderebilirsiniz 👇\n\n` +
        `*Satış Sorumlusu Can Murat — 0544 622 59 31*\n\n` +
        `${link}`
      );
    }

    if (selectedChannelId === 'wa_musteri') {
      return (
        `Merhaba, hayırlı işler dilerim. 🙏\n\n` +
        `Ben IVECO ERC Samsun Otomotiv *Satış Sorumlusu Can Murat* (0544 622 59 31).\n\n` +
        `2026 model IVECO Daily (B ve C Ehliyet), Eurocargo, S-Way ve T-Way güncel fiyat listemizi, anlaşmalı banka kredi oranlarımızı ve takas hesaplama ekranımızı aşağıdaki bağlantıdan inceleyebilirsiniz:\n\n` +
        discountLine +
        eurBonusLine +
        `✅ *Canlı Takas + Kredi Hesabı:* Elinizdeki aracın takas değerini düşüp 1.000.000 TL 12 Ay %0 Faiz, İhracatçı Euro (€) Kredisi veya vadeli banka oranlarıyla aylık taksitinizi anında görün,\n` +
        `🧾 *%20 KDV & Kampanya Tablosu:* Model bazlı indirilecek KDV ve tam yıl amortisman tablosunu tek tıkla muhasebecinize iletin,\n` +
        `📸 *4 Resimle 15 Dk'da Takas:* Mevcut aracınızın 1 dıştan, 1 içten, KM ve ruhsat resmini yükleyip 15 dakikada takas ön fiyatı alın 👇\n\n` +
        `*Satış Sorumlusu Can Murat — 0544 622 59 31*\n\n` +
        `${link}`
      );
    }

    if (selectedChannelId === 'wa_ozel') {
      const targetTitle = vipCompanyName.trim() || 'Değerli Müşterimiz';
      if (vipTone === 'friendly') {
        return (
          `${vipCompanyName.trim() ? `*${vipCompanyName.trim()}* — ` : ''}Abi merhaba, hayırlı işler, bol kazançlar dilerim. 🙏\n\n` +
          `IVECO ERC Samsun'da *Satış Sorumlusu Can Murat* olarak senin için özel bir canlı katalog ve hesaplama bağlantısı hazırladım. Artık 2026 şasi fiyatlarına bakmak veya takas/kredi hesabı yapmak için beni aramana bile gerek yok:\n\n` +
          discountLine +
          eurBonusLine +
          `🔄 Elindeki aracın takas değerini düşüp *1.000.000 TL 12 Ay %0 Faiz (83.333 TL/Ay)* ile kalan taksitini 10 saniyede kendin hesaplayabilirsin,\n` +
          `🧾 Yıl sonu *%20 KDV İndirimi + Tam Amortisman* tablosunu tek tuşla muhasebecine gönderebilirsin,\n` +
          `📸 Mevcut aracının *4 resmini (1 dıştan, 1 içten, KM ve ruhsat)* yükleyip 15 dakikada takasla fiyat alabilirsin 👇\n\n` +
          `*Satış Sorumlusu Can Murat — 0544 622 59 31*\n\n` +
          `${link}`
        );
      }
      if (vipTone === 'corporate') {
        return (
          `Sayın *${targetTitle}* Yönetimi,\n\n` +
          `Ben IVECO ERC Samsun Otomotiv *Satış Sorumlusu Can Murat* (0544 622 59 31).\n\n` +
          `2026 yılı filo yenileme ve ticari araç yatırımlarınız kapsamında firmanıza özel hazırladığım dijital katalog, %20 KDV vergi kalkanı & tam yıl amortisman özeti (üstyapıyı beklemeden şasi faturası kesim imkanı) ve ticari kredi simülasyon bağlantınızı bilgilerinize sunarım:\n\n` +
          discountLine +
          eurBonusLine +
          `*Satış Sorumlusu Can Murat — 0544 622 59 31 | IVECO ERC Samsun Otomotiv*\n\n` +
          `${link}`
        );
      }
      return (
        `Sayın *${targetTitle}*,\n\n` +
        `Ben IVECO ERC Samsun Otomotiv *Satış Sorumlusu Can Murat* (0544 622 59 31).\n\n` +
        `Firmanız için hazırladığım 2026 model IVECO şasi fiyat listesini, %20 KDV + kampanya tablosunu, takas + %0 faizli kredi hesaplayıcısını ve 4 resimle (1 dıştan, 1 içten, KM ve ruhsat) 15 dakikada takas ön değerleme ekranımızı aşağıdaki size özel bağlantıdan inceleyebilirsiniz 👇\n\n` +
        discountLine +
        eurBonusLine +
        `*Satış Sorumlusu Can Murat — 0544 622 59 31 | IVECO ERC Samsun Otomotiv*\n\n` +
        `${link}`
      );
    }

    if (selectedChannelId === 'wa_grup') {
      return (
        `🚛 *Gruptaki tüm nakliyeci, lojistikçi ve esnaf abilerime/kardeşlerime hayırlı işler, kazasız belasız seferler dilerim!*\n\n` +
        `IVECO ERC Samsun Otomotiv olarak kimseyi telefon trafiğiyle yormadan 10 saniyede kendi hesabınızı yapabileceğiniz *2026 Canlı Fiyat, KDV Tablosu, Takas & Kredi Ekranımızı* açtık:\n\n` +
        discountLine +
        eurBonusLine +
        `✅ *Ehliyet & Tonaja Göre Seçim:* Daily 3.5 Ton (B Ehliyet), Daily 7 Ton (C1/C Ehliyet), Eurocargo (C Ehliyet), S-Way Çekici (CE Ehliyet) ve T-Way Damper/Mikser,\n` +
        `🔄 *Canlı Takas + Kredi Hesabı:* Elinizdeki aracın takas değerini düşüp 1M TL %0 Faiz, İhracatçı Euro (€) Kredisi veya anlaşmalı banka oranlarıyla aylık taksitinizi anında görün,\n` +
        `🧾 *Yıl Sonu %20 KDV & Şasi Faturası Avantajı:* Üstyapıyı beklemeden şasi faturanızı hemen kesip %20 KDV'yi verginizden düşün,\n` +
        `📸 *4 Resimle 15 Dk'da Takas:* Aracınızın 1 dıştan, 1 içten, KM ve ruhsat resmini yükleyin, 15 dakikada takasla net fiyatınızı çıkaralım!\n\n` +
        `📞 *Satış Sorumlusu Can Murat — 0544 622 59 31*\n` +
        `👇 *Hemen incelemek ve hesap yapmak için tıklayın:*\n\n` +
        `${link}`
      );
    }

    if (selectedChannelId === 'fb_grup') {
      const groupTitle = vipCompanyName.trim() ? `📘 ${vipCompanyName.trim()} üyelerine özel ` : '';
      return (
        `🚛 Gruptaki tüm kamyoncu, nakliyeci, lojistikçi ve esnaf abilerime/kardeşlerime hayırlı işler, bol kazançlar dilerim!\n\n` +
        `${groupTitle}IVECO ERC Samsun Otomotiv olarak kimseyi telefon trafiğiyle yormadan 10 saniyede kendi hesabınızı yapabileceğiniz 2026 Canlı Şasi Fiyat, KDV Tablosu, Takas & Kredi Ekranımızı açtık:\n\n` +
        discountLine +
        eurBonusLine +
        `✅ Ehliyet & Tonaja Göre Şasi Seçimi: Daily 3.5 Ton (B Ehliyet), Daily 7 Ton (C1/C Ehliyet), Eurocargo (C Ehliyet), S-Way Çekici ve T-Way,\n` +
        `🏗️ 24 Gerçek Üstyapı Örneği Galerisi: Şasi üzerine tente, kapalı kasa, frigo, damper, vinç ve oto kurtarıcı uygulama örnekleri,\n` +
        `🧾 %20 KDV & Tam Amortisman Tablosu: Üstyapıyı beklemeden şasi faturası kesip %20 KDV'yi vergiden düşme hesabı,\n` +
        `🔄 Canlı Takas + Kredi Hesabı: Elinizdeki aracın takas değerini düşüp 1.000.000 TL 12 Ay %0 Faiz, İhracatçı Euro (€) Kredisi veya banka oranlarıyla aylık taksitinizi anında görün,\n` +
        `📸 4 Resimle 15 Dk'da Takas: Aracınızın 1 dıştan, 1 içten, KM ve ruhsat resmini yükleyin, 15 dakikada takasla net fiyatınızı çıkaralım!\n\n` +
        `📞 Satış Sorumlusu Can Murat — 0544 622 59 31 | IVECO ERC Samsun Otomotiv\n` +
        `👇 Hemen incelemek ve kendi hesabınızı yapmak için tıklayın:\n\n` +
        `${link}`
      );
    }

    if (selectedChannelId === 'instagram') {
      return (
        `"Elimdeki aracı takasa versem 2026 sıfır IVECO bana ayda kaç TL'ye gelir?" diye düşünmeyin, 10 saniyede kendiniz hesaplayın! 🚛📊\n\n` +
        discountLine +
        eurBonusLine +
        `Yeni Dijital Showroom ekranımızda neler var?\n` +
        `✅ Canlı Takas + Kredi Hesaplayıcı (1.000.000 TL 12 Ay %0 Faiz & İhracatçı Euro Kredisi),\n` +
        `🧾 Yıl Sonu %20 KDV & Mali Müşavir Kampanya Tablosu,\n` +
        `📸 4 Resimle (1 Dıştan, 1 İçten, KM, Ruhsat) 15 Dakikada Takas Ekspertizi,\n` +
        `🔒 Muhasebecinizle görüşene kadar Fiyatı 24 Saat Ücretsiz Opsiyonlama,\n` +
        `🔔 Sıfır bütçesini aşanlar için: Takastan Temiz 2. El IVECO Habercisi!\n\n` +
        `📞 Satış Sorumlusu Can Murat — 0544 622 59 31\n` +
        `👇 Hemen denemek için profilimdeki / hikayemdeki linke tıklayın:\n\n` +
        `${link}`
      );
    }

    // linkedin
    return (
      `Ticari araç ve filo yatırımlarında telefon trafiğine girmeden, 30 saniyede şeffaf fizibilite çıkarabileceğiniz "IVECO ERC Dijital Showroom & Finansman Merkezi" yayında. 🚛📈\n\n` +
      discountLine +
      eurBonusLine +
      `Platform üzerinden doğrudan:\n` +
      `1️⃣ Tonaj, üstyapı ve ehliyet sınıfına göre 2026 Daily (3.5T - 7T), Eurocargo, S-Way Çekici ve T-Way şasi eşleştirmesi,\n` +
      `2️⃣ Takas peşinatı + %0 faizli TL ve İhracatçı Euro (€) ticari kredi nakit akış simülasyonu,\n` +
      `3️⃣ Mali müşavirinize tek tıkla iletebileceğiniz %20 KDV Vergi Kalkanı, Kıst Amortisman Muafiyeti & Üstyapıyı Beklemeden Hemen Şasi Faturası Özeti,\n` +
      `4️⃣ 4 fotoğrafla (dıştan, içten, KM, ruhsat) 15 dakikada takas değerleme ve 24 saatlik ücretsiz şasi/fiyat blokajı oluşturabilirsiniz 👇\n\n` +
      `📞 Satış Sorumlusu Can Murat — 0544 622 59 31 | IVECO ERC Samsun Otomotiv\n\n` +
      `${link}\n\n` +
      `#IVECO #Lojistik #FiloYönetimi #TicariAraç #Nakliye #SWay #Daily #Samsun`
    );
  }, [
    selectedChannelId,
    selectedBankObj,
    mailTemplate,
    selectedVehicleGroups,
    hookStyle,
    channelGeneratedLink,
    vipCompanyName,
    vipTone,
    enableExporterEurLoan,
    enableChannelDiscount,
    channelDiscountType,
    channelDiscountValue
  ]);

  // --- SEKME 3 (MADDE 4): YENİ BÖLGE HEDEF LİSTELERİ (GSM & MAİL) + CRM & RADAR TARAMASI ---
  useEffect(() => {
    const normalizePhoneKey = (p) => {
      const digits = String(p || '').replace(/\D/g, '');
      if (digits.length < 10) return '';
      return digits.slice(-10);
    };

    const seedList = REGIONAL_PROSPECTS_DIRECTORY.map(item => {
      const pKey = normalizePhoneKey(item.phone);
      return {
        key: item.id,
        phoneKey: pKey || item.id,
        phone: item.phone || '',
        email: item.email || '',
        isGsm: pKey.startsWith('5'),
        customerId: null,
        name: item.name,
        contact: item.contact || '',
        city: item.city || 'Samsun',
        model: item.model || '2026 IVECO Şasi',
        groups: item.groups || [],
        category: item.category,
        sourceType: 'directory',
        sourceBadge: `🎯 ${item.subGroup}`
      };
    });

    if (taxRadarTargets.length === 0) {
      setTaxRadarTargets(seedList);
    }

    if (studioMode !== 'tax_radar') return;
    let active = true;
    const loadTargets = async () => {
      setTaxRadarLoading(true);
      try {
        const [crmRes, radarRes] = await Promise.allSettled([
          crmApi.getCustomers({ page_size: 100 }),
          discoveryApi.getIntentSignals({ limit: 150 })
        ]);
        const mapByKey = new Map();
        seedList.forEach(s => mapByKey.set(s.phoneKey || s.key, s));

        if (radarRes.status === 'fulfilled') {
          const signals = radarRes.value?.data || [];
          signals.forEach(s => {
            const pKey = normalizePhoneKey(s.phone);
            if (!pKey) return;
            const rawName = (s.matched_customer_name || s.company_name || '').trim();
            const isAnon = !rawName || rawName.toLowerCase().includes('anonim') || rawName.toLowerCase().includes('ziyaretçi');
            if (!mapByKey.has(pKey)) {
              mapByKey.set(pKey, {
                key: `radar_${pKey}`,
                phoneKey: pKey,
                phone: s.phone,
                email: '',
                isGsm: pKey.startsWith('5'),
                customerId: s.matched_customer_id || null,
                name: isAnon ? 'Niyet Radarı Ziyaretçisi' : rawName,
                city: s.city || 'Samsun',
                model: s.target_model || '2026 IVECO Şasi',
                groups: [],
                category: 'radar',
                sourceType: 'radar',
                sourceBadge: '📡 Niyet Radarı'
              });
            }
          });
        }

        if (crmRes.status === 'fulfilled') {
          const items = crmRes.value?.data?.items || crmRes.value?.data || [];
          items.forEach(c => {
            const pKey = normalizePhoneKey(c.phone);
            const mapKey = pKey || `crm_${c.id}`;
            const existing = mapByKey.get(mapKey);
            if (existing && existing.sourceType === 'directory') return;
            mapByKey.set(mapKey, {
              key: `crm_${c.id}`,
              phoneKey: mapKey,
              phone: c.phone || '',
              email: c.email || existing?.email || '',
              isGsm: pKey.startsWith('5'),
              customerId: c.id,
              name: c.company_name || c.contact_person || existing?.name || 'Kayıtlı Müşteri',
              city: c.city || existing?.city || 'Samsun',
              model: existing?.model || c.interested_model || '2026 IVECO Şasi',
              groups: [],
              category: 'crm',
              sourceType: existing ? 'both' : 'crm',
              sourceBadge: existing ? '🔥 CRM + Radarda İnceledi' : '🗂️ CRM Kayıtlı Müşteri'
            });
          });
        }

        if (active) {
          setTaxRadarTargets(Array.from(mapByKey.values()));
        }
      } catch {
        // ignore
      } finally {
        if (active) setTaxRadarLoading(false);
      }
    };
    loadTargets();
    return () => { active = false; };
  }, [studioMode]);

  const buildTaxRadarCustomerLink = (target) => {
    const baseOrigin = (origin || 'https://iveco-crm.onrender.com').replace(/\/$/, '');
    const params = new URLSearchParams();
    if (target.customerId) params.set('cid', String(target.customerId));
    if (target.name && !target.name.includes('Ziyaretçisi')) params.set('company', target.name);
    if (target.phoneKey && /^\d{10}$/.test(target.phoneKey)) params.set('phone', target.phoneKey);
    if (Array.isArray(target.groups) && target.groups.length > 0) {
      params.set('groups', target.groups.join(','));
    }
    if (taxRadarTemplate === 'ihracat_euro') {
      params.set('loan', 'eur');
    }
    params.set('ref', target.category === 'smmm_odalar' ? 'smmm_kanal' : taxRadarTemplate === 'ihracat_euro' ? 'ihracat_euro' : 'yilsonu_kdv_tarama');
    return `${baseOrigin}/fiyat-listesi?${params.toString()}`;
  };

  const buildTaxRadarCustomerMessage = (target) => {
    const link = buildTaxRadarCustomerLink(target);
    const hasRealName = target.name && !target.name.includes('Ziyaretçisi') && !target.name.includes('Kayıtlı Müşteri');
    const titlePrefix = hasRealName ? `*${target.name}* — ` : '';
    const modelNote = target.model && target.model !== 'Genel Fiyat Listesi' ? `*${target.model}* ve ` : '';

    if (taxRadarTemplate === 'ihracat_euro') {
      return (
        `${titlePrefix}Merhabalar, hayırlı işler ve bol ihracatlar dilerim. 🙏\n\n` +
        `Ben IVECO ERC Samsun Otomotiv *Satış Sorumlusu Can Murat* (0544 622 59 31).\n\n` +
        `İhracatçı ve döviz gelirli firmalarımızın yüksek TL faiz maliyetine girmeden *32 Sayılı Karar kapsamında Euro (€) Kredisiyle* ticari araç alabilmesi için firmanıza özel hazırladığımız *İhracatçı Euro (€) Finansman & %20 KDV Ekranımızı* bilgilerinize sunarım:\n\n` +
        `🇪🇺 *Kuveyt Türk %0 Kâr Payı & 6 Ay Ödemesiz Euro Kredisi:* Aracınızı bugün teslim alın, ilk Euro taksitini 6 ay sonra ödeyin veya 12 Ay %0 kâr payı avantajından yararlanın.\n` +
        `💶 *Garanti BBVA & BNP Paribas 12-60 Ay Euro Paketleri:* ${modelNote}tüm 2026 modellerimizde kart içindeki *"Taksit & Takas Hesapla"* tuşuyla aylık Euro (€) taksitinizi anında görebilirsiniz.\n` +
        `🧾 *%20 KDV & Hemen Şasi Faturası:* Üstyapıyı beklemeden şasi faturanızı hemen kesip %20 KDV ve tam amortisman avantajını kullanabilirsiniz 👇\n\n` +
        `*Satış Sorumlusu Can Murat — 0544 622 59 31*\n\n` +
        `${link}`
      );
    }

    if (target.category === 'beton_hafriyat') {
      return (
        `${titlePrefix}Merhabalar, hayırlı işler, bol kazançlar dilerim. 🙏\n\n` +
        `Ben IVECO ERC Samsun Otomotiv *Satış Sorumlusu Can Murat* (0544 622 59 31).\n\n` +
        `Hazır beton, hafriyat ve şantiye yatırımlarınız için sadece *T-Way (12 Teker Mikser: 5.750.000 TL Nakit / 6.075.000 TL Liste — 12 Teker Hafriyat: 5.850.000 TL Nakit / 6.175.000 TL Liste), S-Way Çekici ve Daily Şasi* modellerimizin açık olduğu firmanıza özel fiyat ve %20 KDV mahsup ekranımızı aşağıya bıraktım 👇\n\n` +
        `*Satış Sorumlusu Can Murat — 0544 622 59 31*\n\n` +
        `${link}`
      );
    }

    if (target.category === 'karoser_servis') {
      return (
        `${titlePrefix}Ustam selamlar, hayırlı işler, kolay gelsin. 🙏\n\n` +
        `Ben IVECO ERC Samsun Otomotiv *Satış Sorumlusu Can Murat* (0544 622 59 31).\n\n` +
        `Sanayide yanına kasa/üstyapı yaptırmaya gelen veya elindeki eski aracına ağır masraf çıkıp takasla sıfıra geçmek isteyen müşterilerin olduğunda beraber paslaşalım. Güncel 2026 şasi ölçüleri, net peşin/kredili fiyatlarımız ve takas ekranımız aşağıda elinin altında bulunsun 👇\n\n` +
        `*Satış Sorumlusu Can Murat — 0544 622 59 31*\n\n` +
        `${link}`
      );
    }

    if (taxRadarTemplate === 'kurumsal_vergi') {
      return (
        `Sayın ${hasRealName ? `*${target.name}* Yönetimi` : 'Değerli İş Ortağımız'},\n\n` +
        `Ben IVECO ERC Samsun Otomotiv *Satış Sorumlusu Can Murat* (0544 622 59 31).\n\n` +
        `Yıl sonu vergi planlaması döneminde yüksek KDV veya Kurumlar/Gelir Vergisi ödemek yerine filonuzu yenileyebilmeniz için firmanıza özel *2026 KDV, Tam Amortisman & Kampanya Tablomuzu* hazırladım:\n\n` +
        `🧾 *%20 İndirilecek KDV:* Ticari şasi/çekici faturasındaki %20 KDV'nin tamamı tek seferde ödenecek KDV'den mahsup edilir.\n` +
        `📉 *Kıst Amortisman Yok:* Binek araçların aksine ticari araçlarımızda kıst amortisman sınırı yoktur; *1. yıl %20 tam amortisman* doğrudan gider yazılır.\n` +
        `⚡ *Üstyapıyı Beklemeden Hemen Şasi Faturası:* Kasa/frigo imalatının bitmesini beklemeden *ŞASİ faturanızı hemen kesiyoruz*; vergi avantajını bu yıl kullanıp üstyapıyı dilediğiniz zaman yaptırabilirsiniz.\n` +
        `💳 *Finansman:* *1.000.000 TL 12 Ay %0 Faiz (83.333 TL/Ay)* veya İhracatçı Euro (€) Kredisi\n\n` +
        `👇 *Firmanıza özel canlı KDV & Kampanya Tablosunu incelemek ve mali müşavirinize iletmek için tıklayın:*\n\n` +
        `${link}`
      );
    }

    if (taxRadarTemplate === 'smmm_muhasebe' || target.category === 'smmm_odalar') {
      return (
        `${titlePrefix}Merhaba, hayırlı işler dilerim. 🙏\n\n` +
        `Mali müşavirinizle yıl sonu KDV ve vergi mahsubu hesabınızı kolayca yapabilmeniz için ${modelNote}2026 model IVECO ticari araçlarımızın *KDV Hariç Net Matrah, %20 İndirilecek KDV, 1. Yıl Tam Amortisman (Kıst Amortisman Yok) ve 1M TL %0 Faiz Kampanya Tablosunu* aşağıdaki bağlantıya yükledim.\n\n` +
        `⚡ Üstyapının (kasa/frigo/tente) bitmesini beklemeden *ŞASİ faturanızı hemen kesip* 2026 vergisinden düşebiliyoruz.\n\n` +
        `📞 *Satış Sorumlusu Can Murat — 0544 622 59 31 | IVECO ERC Samsun*\n` +
        `👇 *KDV & Kampanya Tablosunu açmak veya muhasebecinize iletmek için tıklayın:*\n\n` +
        `${link}`
      );
    }

    // Default: 'esnaf_kdv' (Samimi Esnaf Yıl Sonu KDV & Şasi Faturası Uyarısı)
    return (
      `${titlePrefix}Abi selamlar, hayırlı işler, bol kazançlar dilerim. 🙏\n\n` +
      `Sene sonu yaklaşırken yüksek KDV veya vergi ödemek yerine aracı yenilemek istersen diye önemli bir avantajı haber vermek istedim: Kasa/üstyapı sırasını hiç beklemeden *ŞASİ faturanı hemen kesebiliyoruz*; böylece aracın içindeki *%20 KDV'nin tamamını (~310.000 TL - 650.000 TL)* ve *1. yıl tam amortismanı* doğrudan verginden düşebiliyorsun.\n\n` +
      `Üstelik elindeki aracın takasını düşüp *1.000.000 TL 12 Ay %0 Faiz (83.333 TL/Ay)* ile kalan taksitini ve *KDV & Kampanya Tablosunu* 10 saniyede görebileceğin sana özel ekranı aşağıya bıraktım 👇\n\n` +
      `*Satış Sorumlusu Can Murat — 0544 622 59 31*\n\n` +
      `${link}`
    );
  };

  const handleSendTaxRadarToTarget = (target) => {
    const msg = buildTaxRadarCustomerMessage(target);
    openWhatsAppChat(target.phoneKey || target.phone, msg);
    const updated = { ...sentTaxPhones, [target.phoneKey]: new Date().toISOString() };
    setSentTaxPhones(updated);
    try {
      window.localStorage.setItem(TAX_OUTREACH_SENT_KEY, JSON.stringify(updated));
    } catch {}
    toast.success(`💬 ${target.name} için özel mesaj WhatsApp'ta açıldı!`);
  };

  const handleSendMailToTarget = (target) => {
    const baseOrigin = (origin || 'https://iveco-crm.onrender.com').replace(/\/$/, '');
    const mailParams = new URLSearchParams();
    if (target.name && !target.name.includes('Ziyaretçisi')) mailParams.set('company', target.name);
    if (Array.isArray(target.groups) && target.groups.length > 0) {
      mailParams.set('groups', target.groups.join(','));
    }
    if (taxRadarTemplate === 'ihracat_euro') {
      mailParams.set('loan', 'eur');
    }
    mailParams.set('ref', 'mail_kurumsal');
    const link = `${baseOrigin}/fiyat-listesi?${mailParams.toString()}`;
    const cleanBody = buildTaxRadarCustomerMessage(target).replace(/\*/g, '').replace(buildTaxRadarCustomerLink(target), link);
    const subject = `${target.name} — 2026 Model IVECO Özel Fiyat Listesi, %20 KDV Avantajı & Finansman Teklifi`;
    const mailtoUrl = `mailto:${encodeURIComponent(target.email || '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(cleanBody)}`;
    window.location.href = mailtoUrl;
    const updated = { ...sentTaxPhones, [target.phoneKey]: new Date().toISOString() };
    setSentTaxPhones(updated);
    try {
      window.localStorage.setItem(TAX_OUTREACH_SENT_KEY, JSON.stringify(updated));
    } catch {}
    toast.success(`📧 ${target.name} için hazır kurumsal E-Posta açılıyor...`);
  };

  const filteredTaxRadarTargets = useMemo(() => {
    return taxRadarTargets.filter(t => {
      const isSent = Boolean(sentTaxPhones[t.phoneKey]);
      if (taxRadarFilter === 'unsent' && isSent) return false;
      if (taxRadarFilter === 'crm' && t.sourceType !== 'crm' && t.sourceType !== 'both') return false;
      if (taxRadarFilter === 'radar' && t.sourceType !== 'radar' && t.sourceType !== 'both') return false;
      if (taxRadarFilter === 'all_new' && t.sourceType !== 'directory') return false;
      if (['karoser_servis', 'beton_hafriyat', 'hal_gida_soguk', 'nakliye_ambar', 'smmm_odalar'].includes(taxRadarFilter)) {
        if (t.category !== taxRadarFilter) return false;
      }
      if (taxRadarSearch.trim()) {
        const q = taxRadarSearch.toLowerCase();
        const match =
          (t.name && t.name.toLowerCase().includes(q)) ||
          (t.phone && t.phone.toLowerCase().includes(q)) ||
          (t.email && t.email.toLowerCase().includes(q)) ||
          (t.city && t.city.toLowerCase().includes(q)) ||
          (t.model && t.model.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [taxRadarTargets, sentTaxPhones, taxRadarFilter, taxRadarSearch]);

  // --- SEKME 2 FONKSİYONLARI (DERNEK / ODA / SİMDER / ARICILAR BİRLİĞİ) ---
  const handleSelectPreset = (preset) => {
    setSelectedId(preset.id);
    setShortName(preset.shortName);
    setFullName(preset.fullName);
    setLogoUrl(preset.logoUrl || '');
    setIcon(preset.icon || '🏛️');
    setDiscountType(preset.discountType || 'amount');
    setDiscountValue(preset.discountValue ?? 50000);
    setDefaultSector(preset.defaultSector || 'all');
    setExtraPerk(preset.extraPerk || '');
  };

  const handleStartNewCustom = () => {
    setSelectedId('custom');
    setShortName('Arıcılar Birliği');
    setFullName('Samsun İli Arıcılar Birliği Üyeleri');
    setLogoUrl('');
    setIcon('🐝');
    setDiscountType('amount');
    setDiscountValue(50000);
    setDefaultSector('tarim_yem');
    setExtraPerk('Birlik Üyelerine Özel Araç Başı 50.000 ₺ Protokol İndirimi + 1M TL %0 Faiz Avantajı');
    toast.success('Yeni dernek/birlik şablonu açıldı — adını ve indirim tutarını aşağıdan dilediğin gibi değiştirebilirsin!');
  };

  const currentConfig = useMemo(() => ({
    id: selectedId,
    shortName: shortName.trim() || 'Özel Protokol',
    fullName: fullName.trim() || shortName.trim() || 'Kurumsal Üye Protokolü',
    logoUrl,
    icon: icon || '🏛️',
    discountType,
    discountValue: Number(discountValue) || 0,
    defaultSector,
    extraPerk: extraPerk.trim()
  }), [selectedId, shortName, fullName, logoUrl, icon, discountType, discountValue, defaultSector, extraPerk]);

  const generatedLink = useMemo(() => buildPartnerShareUrl(origin, currentConfig), [origin, currentConfig]);
  const generatedAnnouncement = useMemo(() => buildPartnerAnnouncementText(origin, currentConfig), [origin, currentConfig]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast.success(`🔗 ${currentConfig.shortName} indirimli takip linki kopyalandı!`);
  };

  const handleCopyAnnouncement = () => {
    navigator.clipboard.writeText(generatedAnnouncement);
    toast.success(`📋 ${currentConfig.shortName} hazır WhatsApp grup duyuru metni ve linki kopyalandı!`);
  };

  const handleSaveAsPreset = () => {
    if (!shortName.trim()) {
      toast.error('Lütfen dernek veya birlik kısa adını yazın.');
      return;
    }
    const updated = saveCustomPartner(currentConfig);
    setCustomPartners(updated);
    if (updated.length > 0) {
      setSelectedId(updated[0].id);
    }
    toast.success(`💾 "${shortName}" hızlı dernek/birlik listene kaydedildi!`);
  };

  const handleDeleteCustom = (e, id) => {
    e.stopPropagation();
    const updated = deleteCustomPartner(id);
    setCustomPartners(updated);
    if (selectedId === id) {
      handleSelectPreset(DEFAULT_PARTNER_PROTOCOLS[0]);
    }
    toast.success('Özel protokol şablonu kaldırıldı.');
  };

  const handleSendToPhone = () => {
    const clean = targetPhone.replace(/\D/g, '');
    if (clean.length < 10) {
      toast.error('Doğrudan göndermek için geçerli bir telefon numarası yazın veya "Duyuru Metnini Kopyala" butonunu kullanın.');
      return;
    }
    openWhatsAppChat(clean, generatedAnnouncement);
    toast.success(`💬 WhatsApp açılıyor...`);
  };

  return (
    <div
      className="card glass-card mt-4 mb-6"
      style={{
        border: '1.5px solid rgba(56, 189, 248, 0.45)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(23, 37, 84, 0.92) 100%)',
        boxShadow: '0 12px 34px rgba(2, 132, 199, 0.18)',
        padding: isMobile ? '14px' : '18px 20px'
      }}
    >
      {/* Üst Başlık */}
      <div
        onClick={() => setIsExpanded(prev => !prev)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '11px',
            background: 'linear-gradient(135deg, #0284c7 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '1.2rem',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
          }}>
            <FiShare2 size={20} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: isMobile ? '0.95rem' : '1.06rem', fontWeight: 900, color: '#f8fafc' }}>
                🚀 Canlı Link, Sosyal Medya, Mali Müşavir & Yıl Sonu KDV Tarama Üretici
              </h3>
              <span style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.45)',
                color: '#34d399',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '999px'
              }}>
                WA • Mali Müşavir (SMMM) • Facebook Grupları • SİMDER/Oda • Yıl Sonu KDV Taraması
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
              İstediğin mecrayı, mali müşavir protokolünü veya eski müşteri KDV taramasını seç; tıklayan herkes Canlı Müşteri Ayak İzine hangi linkten geldiğiyle düşsün!
            </div>
          </div>
        </div>

        <button
          type="button"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.14)',
            color: '#cbd5e1',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '0.74rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer'
          }}
        >
          {isExpanded ? <><FiChevronUp size={14} /> Daralt</> : <><FiChevronDown size={14} /> Link Üreticiyi Aç</>}
        </button>
      </div>

      {isExpanded && (
        <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Üç Ana Mod Sekmesi */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1fr 1.15fr',
            gap: '8px',
            background: 'rgba(2, 6, 23, 0.65)',
            padding: '5px',
            borderRadius: '11px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <button
              type="button"
              onClick={() => setStudioMode('channels')}
              style={{
                padding: '10px 10px',
                borderRadius: '8px',
                border: studioMode === 'channels' ? '1.5px solid #38bdf8' : 'none',
                background: studioMode === 'channels'
                  ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.38) 0%, rgba(15, 23, 42, 0.9) 100%)'
                  : 'transparent',
                color: studioMode === 'channels' ? '#ffffff' : '#94a3b8',
                fontWeight: 900,
                fontSize: isMobile ? '0.76rem' : '0.79rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              📲 1. WhatsApp • Mali Müşavir • FB Grupları • Sosyal
            </button>
            <button
              type="button"
              onClick={() => setStudioMode('partners')}
              style={{
                padding: '10px 10px',
                borderRadius: '8px',
                border: studioMode === 'partners' ? '1.5px solid #f59e0b' : 'none',
                background: studioMode === 'partners'
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.35) 0%, rgba(15, 23, 42, 0.9) 100%)'
                  : 'transparent',
                color: studioMode === 'partners' ? '#fde047' : '#94a3b8',
                fontWeight: 900,
                fontSize: isMobile ? '0.76rem' : '0.79rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              🏛️ 2. Dernek, Oda & SMMM İndirimli Linkler
            </button>
            <button
              type="button"
              onClick={() => setStudioMode('tax_radar')}
              style={{
                padding: '10px 10px',
                borderRadius: '8px',
                border: studioMode === 'tax_radar' ? '1.5px solid #10b981' : 'none',
                background: studioMode === 'tax_radar'
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.38) 0%, rgba(15, 23, 42, 0.9) 100%)'
                  : 'transparent',
                color: studioMode === 'tax_radar' ? '#4ade80' : '#94a3b8',
                fontWeight: 900,
                fontSize: isMobile ? '0.76rem' : '0.79rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              🧾 3. Yıl Sonu KDV & Eski Müşteri Taraması (CRM+Radar)
            </button>
          </div>

          {studioMode === 'channels' ? (
            /* =====================================================================
               MOD 1: WHATSAPP DURUM / MÜŞTERİ / ÖZEL MÜŞTERİ / FACEBOOK GRUPLARI / INSTAGRAM / LINKEDIN
               ===================================================================== */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* 1. Mecra Seçimi */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '7px' }}>
                  1. Hangi Kanal İçin Link & Mesaj Üretmek İstiyorsun?
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(128px, 1fr))',
                  gap: '7px'
                }}>
                  {SOCIAL_CHANNELS.map(ch => {
                    const isSel = selectedChannelId === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          setSelectedChannelId(ch.id);
                          if (ch.id === 'mail_kurumsal' || ch.id === 'fb_grup') {
                            setVipSelectedCustomer(null);
                            setVipPhone('');
                          }
                        }}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '10px',
                          background: isSel
                            ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.35) 0%, rgba(15, 23, 42, 0.95) 100%)'
                            : 'rgba(15, 23, 42, 0.8)',
                          border: isSel ? `2px solid ${ch.color}` : '1px solid rgba(148, 163, 184, 0.2)',
                          color: isSel ? '#ffffff' : '#cbd5e1',
                          fontWeight: isSel ? 900 : 700,
                          fontSize: '0.76rem',
                          cursor: 'pointer',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '3px',
                          boxShadow: isSel ? `0 4px 14px ${ch.color}33` : 'none'
                        }}
                      >
                        <span>{ch.label}</span>
                        <span style={{ fontSize: '0.63rem', color: isSel ? '#7dd3fc' : '#64748b', fontWeight: 600, lineHeight: 1.2 }}>
                          {ch.shortDesc.slice(0, 34)}...
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 🏦 BANKACILARA ÖZEL TEK BANKA SEÇİCİ KUTUSU */}
              {selectedChannelId === 'banka_kanal' && (
                <div style={{
                  background: `linear-gradient(135deg, ${selectedBankObj.color || '#0284c7'}28 0%, rgba(15, 23, 42, 0.95) 100%)`,
                  border: `1.5px solid ${selectedBankObj.color || '#38bdf8'}`,
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#fff' }}>
                        🏦 Hangi Bankanın Portföy Yöneticisine / Müşterisine Link Göndereceksin?
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '2px' }}>
                        Seçtiğin bankanın linkini gönderdiğinde müşterinin ve bankacının ekranında <strong style={{ color: '#4ade80' }}>SADECE {selectedBankObj.name}</strong> oranları, vade paketleri ve logosu görünür; diğer bankalar gizlenir!
                      </div>
                    </div>

                    {/* Açılış Sekmesi Seçimi */}
                    <div style={{ display: 'flex', gap: '5px', background: 'rgba(2, 6, 23, 0.75)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <button
                        type="button"
                        onClick={() => setBankOpenTab('krediler')}
                        style={{
                          padding: '5px 9px',
                          borderRadius: '6px',
                          border: bankOpenTab === 'krediler' ? '1px solid #38bdf8' : 'none',
                          background: bankOpenTab === 'krediler' ? 'rgba(2, 132, 199, 0.35)' : 'transparent',
                          color: bankOpenTab === 'krediler' ? '#fff' : '#94a3b8',
                          fontSize: '0.69rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        💳 Doğrudan {selectedBankObj.shortName} Kredi Tablosu Açılsın
                      </button>
                      <button
                        type="button"
                        onClick={() => setBankOpenTab('fiyatlar')}
                        style={{
                          padding: '5px 9px',
                          borderRadius: '6px',
                          border: bankOpenTab === 'fiyatlar' ? '1px solid #10b981' : 'none',
                          background: bankOpenTab === 'fiyatlar' ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                          color: bankOpenTab === 'fiyatlar' ? '#fff' : '#94a3b8',
                          fontSize: '0.69rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        🚛 Fiyat Listesi Açılsın ({selectedBankObj.shortName} Kilitli)
                      </button>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
                    gap: '7px'
                  }}>
                    {BANK_LIST.map(bank => {
                      const isBankSel = selectedBankChannelId === bank.id;
                      return (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBankChannelId(bank.id)}
                          style={{
                            padding: '8px 8px',
                            borderRadius: '9px',
                            border: isBankSel ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.14)',
                            background: isBankSel
                              ? bank.bgGradient
                              : 'rgba(2, 6, 23, 0.78)',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '2px',
                            textAlign: 'left',
                            boxShadow: isBankSel ? '0 6px 16px rgba(0,0,0,0.4)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>
                              {bank.icon} {bank.shortName}
                            </span>
                            {isBankSel && (
                              <span style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.22)', padding: '1px 5px', borderRadius: '4px', fontWeight: 900 }}>
                                SEÇİLİ
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.62rem', color: isBankSel ? 'rgba(255,255,255,0.9)' : '#94a3b8', fontWeight: 600 }}>
                            {bank.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Özel Müşteri Bilgileri & İsteğe Bağlı Özel İndirim / Sektör */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr',
                gap: '12px',
                background: 'rgba(15, 23, 42, 0.78)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '12px'
              }}>
                {/* Sol Kutu: Müşteri / Firma / Facebook Grubu / Bankacı Seçimi */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8' }}>
                    {selectedChannelId === 'fb_grup'
                      ? '📘 Paylaşılacak Facebook Grubu Adı (Opsiyonel - Hangi Gruptan Geldiğini Görmek İçin):'
                      : selectedChannelId === 'banka_kanal'
                        ? `🏦 ${selectedBankObj.name} Şube veya Portföy Yöneticisi Adı (Opsiyonel):`
                        : `👤 Müşteri / Firma Bilgisi ${selectedChannelId === 'wa_ozel' ? '(Müşteriye Özel Açılış Başlığı)' : '(Opsiyonel - Doğrudan WA Gönderimi İçin)'}:`}
                  </div>

                  {/* CRM'den Hızlı Müşteri Bul veya Facebook Grubu / Banka Şubesi Hızlı Etiketleri */}
                  {selectedChannelId === 'fb_grup' ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {[
                        'Türkiye Kamyoncular ve Nakliyeciler',
                        'IVECO Daily & Eurocargo Kullanıcıları',
                        'Karadeniz Nakliyeciler & Lojistik',
                        'Kamyon & Çekici Alım Satım Grubu',
                        'Oto Kurtarıcı & Çekici Esnafları'
                      ].map(gName => (
                        <button
                          key={gName}
                          type="button"
                          onClick={() => setVipCompanyName(vipCompanyName === gName ? '' : gName)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: vipCompanyName === gName ? '1px solid #1877F2' : '1px solid rgba(255,255,255,0.1)',
                            background: vipCompanyName === gName ? 'rgba(24, 119, 242, 0.28)' : 'rgba(255,255,255,0.04)',
                            color: vipCompanyName === gName ? '#93c5fd' : '#94a3b8',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          📘 {gName}
                        </button>
                      ))}
                    </div>
                  ) : selectedChannelId === 'banka_kanal' ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {[
                        'Samsun Ticari Şube',
                        'İlkadım Şubesi KOBİ Portföy',
                        'Atakum Şubesi Ticari Portföy',
                        'Samsun Sanayi Şubesi',
                        'Bafra / Çarşamba Şubesi',
                        'Ordu / Trabzon / Çorum Ticari Şube'
                      ].map(bName => (
                        <button
                          key={bName}
                          type="button"
                          onClick={() => setVipCompanyName(vipCompanyName === bName ? '' : bName)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: vipCompanyName === bName ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                            background: vipCompanyName === bName ? 'rgba(2, 132, 199, 0.28)' : 'rgba(255,255,255,0.04)',
                            color: vipCompanyName === bName ? '#7dd3fc' : '#94a3b8',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          🏦 {bName}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={vipCustomerSearch}
                        onChange={(e) => setVipCustomerSearch(e.target.value)}
                        placeholder="🔍 Kayıtlı müşterilerden ara (Örn: Yılmaz, 0532...)"
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          background: 'rgba(2, 6, 23, 0.85)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          color: '#fff',
                          fontSize: '0.76rem'
                        }}
                      />
                      {vipMatchedCustomers.length > 0 && (
                        <div style={{
                          marginTop: '4px',
                          background: '#020617',
                          border: '1px solid rgba(56, 189, 248, 0.45)',
                          borderRadius: '8px',
                          maxHeight: '130px',
                          overflowY: 'auto',
                          padding: '4px'
                        }}>
                          {vipMatchedCustomers.map(c => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setVipSelectedCustomer(c);
                                setVipCompanyName(c.company_name || '');
                                setVipPhone(c.phone || '');
                                if (c.email) setVipEmail(c.email);
                                setVipCustomerSearch('');
                                setVipMatchedCustomers([]);
                                toast.success(`✅ ${c.company_name} seçildi!`);
                              }}
                              style={{
                                padding: '6px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.74rem',
                                color: '#f8fafc',
                                display: 'flex',
                                justifyContent: 'space-between',
                                borderBottom: '1px solid rgba(255,255,255,0.05)'
                              }}
                            >
                              <strong>{c.company_name}</strong>
                              <span style={{ color: '#38bdf8' }}>{c.email || c.phone || c.city}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: selectedChannelId === 'fb_grup' ? '1fr' : '1.2fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      value={vipCompanyName}
                      onChange={(e) => {
                        const nextVal = e.target.value;
                        setVipCompanyName(nextVal);
                        if (
                          !nextVal ||
                          (vipSelectedCustomer &&
                            nextVal.trim().toLowerCase() !== (vipSelectedCustomer.company_name || '').trim().toLowerCase())
                        ) {
                          setVipSelectedCustomer(null);
                          if (selectedChannelId === 'mail_kurumsal' || vipSelectedCustomer) {
                            setVipPhone('');
                          }
                        }
                      }}
                      placeholder={
                        selectedChannelId === 'fb_grup'
                          ? 'Facebook Grup Adı yazın veya boş bırakın (Opsiyonel)'
                          : selectedChannelId === 'banka_kanal'
                            ? `${selectedBankObj.shortName} Şube veya Bankacı Adı (Opsiyonel)`
                            : selectedChannelId === 'mail_kurumsal'
                              ? 'Kurumsal Firma veya Satın Alma Yetkilisi Adı (Opsiyonel)'
                              : 'Firma veya Müşteri Adı (Opsiyonel)'
                      }
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'rgba(2, 6, 23, 0.85)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        color: '#fff',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}
                    />
                    {selectedChannelId === 'mail_kurumsal' ? (
                      <input
                        type="email"
                        value={vipEmail}
                        onChange={(e) => setVipEmail(e.target.value)}
                        placeholder="Alıcı E-Posta (Örn: satinalma@firma.com)"
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: 'rgba(2, 6, 23, 0.85)',
                          border: '1px solid rgba(168, 85, 247, 0.45)',
                          color: '#d8b4fe',
                          fontSize: '0.78rem',
                          fontWeight: 700
                        }}
                      />
                    ) : selectedChannelId !== 'fb_grup' ? (
                      <input
                        type="tel"
                        value={vipPhone}
                        onChange={(e) => setVipPhone(e.target.value)}
                        placeholder={selectedChannelId === 'banka_kanal' ? 'Bankacı WA Tel (05xx...)' : 'WhatsApp Tel (05xx...)'}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: 'rgba(2, 6, 23, 0.85)',
                          border: '1px solid rgba(34, 197, 94, 0.35)',
                          color: '#4ade80',
                          fontSize: '0.78rem',
                          fontWeight: 700
                        }}
                      />
                    ) : null}
                  </div>

                  {selectedChannelId === 'wa_ozel' && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'friendly', label: '🤝 Samimi Esnaf ("Abi merhaba")' },
                        { id: 'new_lead', label: '✨ Standart Kurumsal' },
                        { id: 'corporate', label: '🏢 Filo & Vergi Kalkanı' }
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setVipTone(t.id)}
                          style={{
                            flex: 1,
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: vipTone === t.id ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                            background: vipTone === t.id ? 'rgba(245, 158, 11, 0.22)' : 'rgba(255,255,255,0.04)',
                            color: vipTone === t.id ? '#fde047' : '#94a3b8',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sağ Kutu: Çoklu Araç Grubu Seçici & İsteğe Bağlı Özel İndirim Tanımlama */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', flexWrap: 'wrap', gap: '4px' }}>
                      <label style={{ fontSize: '0.74rem', fontWeight: 900, color: '#38bdf8' }}>
                        🚛 Linkte Hangi Araç Grupları Gözüksün?
                      </label>
                      <span style={{ fontSize: '0.66rem', color: selectedVehicleGroups.length > 0 ? '#4ade80' : '#94a3b8', fontWeight: 800 }}>
                        {selectedVehicleGroups.length === 0
                          ? '🌟 Tüm Araç Grupları Açık'
                          : `🔒 Sadece ${selectedVehicleGroups.length} Grup Gösterilecek`}
                      </span>
                    </div>

                    {/* Hızlı Hazır Paketler (Örn: Beton Santrali = S-Way + T-Way + Daily) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '7px' }}>
                      {VEHICLE_GROUP_PRESETS.map(preset => {
                        const isPresetActive =
                          preset.groups.length === selectedVehicleGroups.length &&
                          preset.groups.every(g => selectedVehicleGroups.includes(g));
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setSelectedVehicleGroups(preset.groups);
                              setChannelSector('all');
                            }}
                            style={{
                              padding: '4px 7px',
                              borderRadius: '6px',
                              border: isPresetActive ? '1.5px solid #f59e0b' : '1px solid rgba(255,255,255,0.12)',
                              background: isPresetActive ? 'rgba(245, 158, 11, 0.25)' : 'rgba(2, 6, 23, 0.65)',
                              color: isPresetActive ? '#fde047' : '#cbd5e1',
                              fontSize: '0.66rem',
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Tek Tek Araç Grubu Seçme Kutucukları */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: '5px'
                    }}>
                      {VEHICLE_GROUP_OPTIONS.map(grp => {
                        const isChecked = selectedVehicleGroups.length === 0 || selectedVehicleGroups.includes(grp.id);
                        const isExplicitlyPicked = selectedVehicleGroups.includes(grp.id);
                        return (
                          <button
                            key={grp.id}
                            type="button"
                            onClick={() => toggleVehicleGroup(grp.id)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '7px',
                              border: isExplicitlyPicked
                                ? '1.5px solid #22c55e'
                                : isChecked
                                  ? '1px solid rgba(56, 189, 248, 0.35)'
                                  : '1px solid rgba(255,255,255,0.08)',
                              background: isExplicitlyPicked
                                ? 'rgba(16, 185, 129, 0.22)'
                                : isChecked
                                  ? 'rgba(15, 23, 42, 0.85)'
                                  : 'rgba(2, 6, 23, 0.45)',
                              color: isChecked ? '#f8fafc' : '#64748b',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '4px',
                              textAlign: 'left'
                            }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {grp.label}
                            </span>
                            <span style={{ color: isChecked ? '#4ade80' : '#475569', fontSize: '0.72rem', fontWeight: 900 }}>
                              {isChecked ? '✓' : '○'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 💶 İhracatçı Müşteri: Euro (€) Kredisi Seçeneğini Öne Çıkar */}
                  <div style={{
                    padding: '8px 10px',
                    borderRadius: '9px',
                    background: enableExporterEurLoan ? 'rgba(37, 99, 235, 0.22)' : 'rgba(2, 6, 23, 0.6)',
                    border: enableExporterEurLoan ? '1.5px solid #60a5fa' : '1px solid rgba(255,255,255,0.08)'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.73rem', fontWeight: 900, color: enableExporterEurLoan ? '#93c5fd' : '#cbd5e1' }}>
                      <span>🇪🇺 İhracatçı Müşteri: Euro (€) Kredisi Seçeneğini Öne Çıkar (?loan=eur)</span>
                      <input
                        type="checkbox"
                        checked={enableExporterEurLoan}
                        onChange={(e) => setEnableExporterEurLoan(e.target.checked)}
                        style={{ accentColor: '#3b82f6', width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </label>
                    {enableExporterEurLoan && (
                      <div style={{ fontSize: '0.67rem', color: '#bfdbfe', marginTop: '4px', lineHeight: 1.3 }}>
                        ✓ Müşteri linki açtığında Kuveyt Türk (%0 Kâr Payı / 6 Ay Ödemesiz), Garanti BBVA & BNP Paribas <strong>Euro (€) Kredi Hesaplayıcısı</strong> otomatik seçili gelir ve mesaja Euro kredisi bilgisi eklenir.
                      </div>
                    )}
                  </div>

                  {/* Bu Linke Özel İndirim / Oran Aç-Kapat */}
                  <div style={{
                    padding: '8px 10px',
                    borderRadius: '9px',
                    background: enableChannelDiscount ? 'rgba(16, 185, 129, 0.14)' : 'rgba(2, 6, 23, 0.6)',
                    border: enableChannelDiscount ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(255,255,255,0.08)'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 800, color: enableChannelDiscount ? '#4ade80' : '#cbd5e1' }}>
                      <span>🏷️ Bu Linke Özel Araç Başı İndirim / Oran Uygula</span>
                      <input
                        type="checkbox"
                        checked={enableChannelDiscount}
                        onChange={(e) => setEnableChannelDiscount(e.target.checked)}
                        style={{ accentColor: '#10b981', width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </label>

                    {enableChannelDiscount && (
                      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {[25000, 50000, 75000, 100000].map(val => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => {
                                setChannelDiscountType('amount');
                                setChannelDiscountValue(val);
                              }}
                              style={{
                                padding: '3px 7px',
                                borderRadius: '5px',
                                border: channelDiscountType === 'amount' && Number(channelDiscountValue) === val ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.12)',
                                background: channelDiscountType === 'amount' && Number(channelDiscountValue) === val ? 'rgba(16, 185, 129, 0.28)' : 'rgba(255,255,255,0.05)',
                                color: '#4ade80',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              -{val / 1000}B ₺
                            </button>
                          ))}
                          {[2, 3, 5].map(pct => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => {
                                setChannelDiscountType('percent');
                                setChannelDiscountValue(pct);
                              }}
                              style={{
                                padding: '3px 7px',
                                borderRadius: '5px',
                                border: channelDiscountType === 'percent' && Number(channelDiscountValue) === pct ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.12)',
                                background: channelDiscountType === 'percent' && Number(channelDiscountValue) === pct ? 'rgba(245, 158, 11, 0.28)' : 'rgba(255,255,255,0.05)',
                                color: '#fde047',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              %{pct}
                            </button>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input
                            type="number"
                            value={channelDiscountValue}
                            onChange={(e) => setChannelDiscountValue(e.target.value)}
                            style={{
                              width: '110px',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              background: '#020617',
                              border: '1px solid #10b981',
                              color: '#4ade80',
                              fontWeight: 900,
                              fontSize: '0.8rem'
                            }}
                          />
                          <span style={{ fontSize: '0.72rem', color: '#a7f3d0', fontWeight: 700 }}>
                            {channelDiscountType === 'percent' ? '% Otomatik İskonto' : '₺ Araç Başı İndirim'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Üretilen Link & Hazır Paylaşım Kutusu */}
              <div style={{
                background: 'rgba(2, 6, 23, 0.82)',
                border: `1.5px solid ${activeChannel.color}66`,
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#f8fafc' }}>
                    {activeChannel.label} Takip Linki <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.72rem' }}>({activeChannel.badgeText} olarak radara düşer)</span>
                  </div>
                  <a
                    href={channelGeneratedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.73rem',
                      fontWeight: 800,
                      color: '#38bdf8',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    👁️ Linki Yeni Sekmede Aç <FiExternalLink size={12} />
                  </a>
                </div>

                <div style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.92)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  fontFamily: 'monospace',
                  fontSize: '0.73rem',
                  wordBreak: 'break-all'
                }}>
                  {channelGeneratedLink}
                </div>

                {/* 🎯 Sıkmayan / Merak Uyandıran Kanca Seçici veya Kurumsal Mail Şablon Seçici */}
                {selectedChannelId === 'mail_kurumsal' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d8b4fe', marginBottom: '5px' }}>
                        📧 Hazır Kurumsal E-Posta Şablonu & Konusu Seç:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: '6px' }}>
                        {[
                          { id: 'kurumsal_filo', label: '🏢 Kurumsal Satın Alma & Filo' },
                          { id: 'ihracat_euro', label: '💶 İhracatçı Euro (€) Kredisi & Filo' },
                          { id: 'beton_santiye', label: '🏗️ Beton Santrali & Hafriyat (12 Teker)' },
                          { id: 'kdv_muhasebe', label: '🧾 Muhasebe / %20 KDV & Amortisman' },
                          { id: 'takas_yenileme', label: '🔄 Filo Yenileme, Takas & %0 Faiz' }
                        ].map(tpl => {
                          const active = mailTemplate === tpl.id;
                          return (
                            <button
                              key={tpl.id}
                              type="button"
                              onClick={() => {
                                setMailTemplate(tpl.id);
                                if (tpl.id === 'beton_santiye') {
                                  setSelectedVehicleGroups(['tway', 'sway', 'daily35_chassis']);
                                }
                              }}
                              style={{
                                padding: '6px 8px',
                                borderRadius: '7px',
                                border: active ? '1.5px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                                background: active ? 'rgba(168, 85, 247, 0.25)' : 'rgba(15, 23, 42, 0.7)',
                                color: active ? '#e9d5ff' : '#cbd5e1',
                                fontSize: '0.7rem',
                                fontWeight: active ? 900 : 700,
                                cursor: 'pointer'
                              }}
                            >
                              {tpl.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* E-Posta Konu Başlığı (Subject) Kutusu */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      background: 'rgba(88, 28, 135, 0.28)',
                      border: '1px solid rgba(168, 85, 247, 0.45)',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ fontSize: '0.74rem', color: '#f3e8ff', fontWeight: 800, flex: 1 }}>
                        <span style={{ color: '#c084fc', marginRight: '6px' }}>📌 E-Posta Konusu:</span>
                        {mailSubject}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(mailSubject);
                          toast.success('📌 E-Posta konu başlığı kopyalandı!');
                        }}
                        style={{
                          padding: '4px 9px',
                          borderRadius: '6px',
                          background: 'rgba(168, 85, 247, 0.3)',
                          border: '1px solid rgba(216, 180, 254, 0.5)',
                          color: '#f3e8ff',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        📋 Konuyu Kopyala
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fbbf24', marginBottom: '5px' }}>
                      🎯 Müşteriyi Sıkmadan Tıklatan Mesaj Kancası Seç:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: '6px' }}>
                      {[
                        { id: 'curiosity_short', label: '⚡ 2 Cümle Merak (Sıfır Reklam)' },
                        { id: 'exporter_eur', label: '💶 İhracatçı Euro (€) Kredisi' },
                        { id: 'tradein_hook', label: '🔄 "Aracım Kaç Para Eder?" Kancası' },
                        { id: 'tax_hook', label: '🧾 "%20 KDV Vergi Kalkanı" Kancası' },
                        { id: 'detailed', label: '📋 Detaylı Tanıtım Metni' }
                      ].map(h => {
                        const active = hookStyle === h.id;
                        return (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => setHookStyle(h.id)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '7px',
                              border: active ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                              background: active ? 'rgba(16, 185, 129, 0.22)' : 'rgba(15, 23, 42, 0.7)',
                              color: active ? '#4ade80' : '#cbd5e1',
                              fontSize: '0.7rem',
                              fontWeight: active ? 900 : 700,
                              cursor: 'pointer'
                            }}
                          >
                            {h.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Hazır Paylaşım Metni Önizleme */}
                <div style={{
                  padding: '9px 11px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: '#cbd5e1',
                  fontSize: '0.73rem',
                  whiteSpace: 'pre-wrap',
                  maxHeight: selectedChannelId === 'mail_kurumsal' ? '150px' : '115px',
                  overflowY: 'auto',
                  lineHeight: 1.4
                }}>
                  {channelGeneratedMessage}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile
                    ? '1fr'
                    : selectedChannelId === 'mail_kurumsal'
                      ? '1fr 1.2fr 1.1fr 1.1fr'
                      : '1fr 1.3fr 1fr',
                  gap: '8px'
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(channelGeneratedLink);
                      toast.success(`🔗 ${activeChannel.label} linki kopyalandı!`);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '9px',
                      background: 'rgba(56, 189, 248, 0.18)',
                      border: '1px solid rgba(56, 189, 248, 0.45)',
                      color: '#38bdf8',
                      fontWeight: 800,
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <FiCopy size={14} /> 🔗 Sadece Linki Kopyala
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(channelGeneratedMessage);
                      toast.success(`📋 ${activeChannel.label} hazır metni + linki kopyalandı!`);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '9px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      color: '#052e16',
                      fontWeight: 900,
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <FiCopy size={14} /> {selectedChannelId === 'mail_kurumsal' ? '📋 Mail Metni + Linki Kopyala' : '📋 Hazır Metni + Linki Kopyala'}
                  </button>

                  {selectedChannelId === 'mail_kurumsal' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const toAddr = vipEmail.trim();
                          const mailtoUrl = `mailto:${encodeURIComponent(toAddr)}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(channelGeneratedMessage)}`;
                          window.location.href = mailtoUrl;
                          toast.success('📧 Varsayılan E-Posta uygulamanız (Outlook / Mail) konu ve metin hazır olarak açılıyor...');
                        }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '9px',
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                          border: 'none',
                          color: '#ffffff',
                          fontWeight: 900,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <FiSend size={14} /> 📧 Mail Uygulamasında Aç
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const toAddr = vipEmail.trim();
                          const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toAddr)}&su=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(channelGeneratedMessage)}`;
                          window.open(gmailUrl, '_blank', 'noopener,noreferrer');
                          toast.success('📨 Gmail yeni mesaj ekranı konu + metin + link hazır olarak açıldı!');
                        }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '9px',
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          border: 'none',
                          color: '#ffffff',
                          fontWeight: 900,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        📨 Gmail’de Hazır Aç
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedChannelId === 'fb_grup') {
                          navigator.clipboard.writeText(channelGeneratedMessage);
                          toast.success('📋 Gönderi metni kopyalandı! Facebook grubunda "Ctrl+V / Yapıştır" yapabilirsiniz.');
                          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(channelGeneratedLink)}`, '_blank', 'noopener,noreferrer');
                          return;
                        }
                        const clean = vipPhone.replace(/\D/g, '');
                        if (clean.length >= 10) {
                          openWhatsAppChat(clean, channelGeneratedMessage);
                          toast.success('💬 WhatsApp açılıyor...');
                        } else {
                          navigator.clipboard.writeText(channelGeneratedMessage);
                          toast.success('📋 Metin kopyalandı! (Doğrudan kişiye açmak için yukarıya telefon numarası yazabilirsin)');
                        }
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '9px',
                        background: selectedChannelId === 'fb_grup' ? '#1877F2' : '#22c55e',
                        border: 'none',
                        color: selectedChannelId === 'fb_grup' ? '#ffffff' : '#052e16',
                        fontWeight: 900,
                        fontSize: '0.76rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <FiSend size={14} /> {selectedChannelId === 'fb_grup'
                        ? '📘 Kopyala & Facebook’ta Paylaş'
                        : (vipPhone.replace(/\D/g, '').length >= 10 ? '💬 WhatsApp’tan Gönder' : '💬 Kopyala & Paylaş')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : studioMode === 'partners' ? (
            /* =====================================================================
               MOD 2: DERNEK, ODA & BİRLİK PROTOKOL LİNK ÜRETİCİ (SİMDER, SMMM, ARICILAR VB.)
               ===================================================================== */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* 1. Hazır Dernek / Oda Seçimi */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '7px' }}>
                  1. Hazır Dernek / Oda Protokolü Seç veya Yeni Oluştur:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                  {allPresets.map(p => {
                    const active = selectedId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPreset(p)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '999px',
                          background: active
                            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                            : 'rgba(15, 23, 42, 0.85)',
                          border: active ? '1.5px solid #fde047' : '1px solid rgba(148, 163, 184, 0.25)',
                          color: active ? '#0f172a' : '#e2e8f0',
                          fontWeight: active ? 900 : 700,
                          fontSize: '0.76rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>{p.icon || '🏛️'}</span>
                        <span>{p.shortName}</span>
                        <span style={{
                          fontSize: '0.66rem',
                          padding: '1px 5px',
                          borderRadius: '6px',
                          background: active ? 'rgba(15,23,42,0.2)' : 'rgba(16, 185, 129, 0.18)',
                          color: active ? '#0f172a' : '#34d399',
                          fontWeight: 800
                        }}>
                          {p.discountType === 'percent' ? `%${p.discountValue}` : `-${(p.discountValue / 1000)}B ₺`}
                        </span>
                        {p.isCustom && (
                          <span
                            onClick={(e) => handleDeleteCustom(e, p.id)}
                            title="Bu şablonu sil"
                            style={{ marginLeft: '2px', opacity: 0.75, display: 'inline-flex', alignItems: 'center' }}
                          >
                            <FiTrash2 size={11} />
                          </span>
                        )}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleStartNewCustom}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '999px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px dashed #38bdf8',
                      color: '#38bdf8',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <FiPlus size={13} /> Yeni Dernek / Birlik Yaz
                  </button>
                </div>
              </div>

              {/* 2. Dernek Adı, İndirim Tutarı / Oranı ve Sektör Ayarları */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1.4fr 1fr',
                gap: '12px',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '12px'
              }}>
                {/* Sol: Dernek / Birlik Adı */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                      Dernek / Birlik Kısa Adı (Rozette Görünür):
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        placeholder="🏛️"
                        style={{
                          width: '42px',
                          textAlign: 'center',
                          padding: '8px 4px',
                          borderRadius: '8px',
                          background: 'rgba(2, 6, 23, 0.8)',
                          border: '1px solid rgba(148, 163, 184, 0.3)',
                          color: '#fff',
                          fontSize: '0.95rem'
                        }}
                        title="Emoji / Simge"
                      />
                      <input
                        type="text"
                        value={shortName}
                        onChange={(e) => setShortName(e.target.value)}
                        placeholder="Örn: SİMDER veya Arıcılar Birliği"
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: 'rgba(2, 6, 23, 0.8)',
                          border: '1px solid rgba(56, 189, 248, 0.35)',
                          color: '#fff',
                          fontSize: '0.82rem',
                          fontWeight: 800
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                      Tam Kurum Başlığı (Sayfa Üstünde Yazar):
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Örn: SİMDER (Samsun İnşaatçılar ve Müteahhitler Derneği)"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'rgba(2, 6, 23, 0.8)',
                        border: '1px solid rgba(148, 163, 184, 0.25)',
                        color: '#e2e8f0',
                        fontSize: '0.78rem'
                      }}
                    />
                  </div>
                </div>

                {/* Orta: Araç Başına TL İndirim veya % Oran Seçici */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fbbf24' }}>
                      <FiTag style={{ marginRight: '4px' }} /> Uygulanacak Özel Üye İndirimi:
                    </label>
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(2,6,23,0.8)', padding: '2px', borderRadius: '7px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setDiscountType('amount');
                          if (discountValue < 100) setDiscountValue(50000);
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '5px',
                          border: 'none',
                          background: discountType === 'amount' ? '#10b981' : 'transparent',
                          color: discountType === 'amount' ? '#052e16' : '#94a3b8',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        ₺ Sabit Tutar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDiscountType('percent');
                          if (discountValue > 20) setDiscountValue(3);
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '5px',
                          border: 'none',
                          background: discountType === 'percent' ? '#f59e0b' : 'transparent',
                          color: discountType === 'percent' ? '#0f172a' : '#94a3b8',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        % Oranlı
                      </button>
                    </div>
                  </div>

                  {/* Hızlı Tutar / Oran Butonları */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {(discountType === 'amount' ? QUICK_TL_DISCOUNTS : QUICK_PCT_DISCOUNTS).map(val => {
                      const isSel = Number(discountValue) === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setDiscountValue(val)}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            background: isSel ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.05)',
                            border: isSel ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                            color: isSel ? '#4ade80' : '#cbd5e1',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          {discountType === 'amount' ? `${(val / 1000)} Bin ₺` : `%${val}`}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      step={discountType === 'amount' ? 5000 : 0.5}
                      min={0}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'rgba(2, 6, 23, 0.9)',
                        border: '1.5px solid rgba(16, 185, 129, 0.5)',
                        color: '#4ade80',
                        fontSize: '0.92rem',
                        fontWeight: 900
                      }}
                    />
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                      {discountType === 'amount' ? '₺ / Araç Başı' : '% İskonto'}
                    </span>
                  </div>
                </div>

                {/* Sağ: Öne Çıkarılacak Sektör & Kaydet */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                      Açılışta Öne Çıkarılacak Araç Grubu:
                    </label>
                    <select
                      value={defaultSector}
                      onChange={(e) => setDefaultSector(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'rgba(2, 6, 23, 0.85)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        color: '#f8fafc',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}
                    >
                      {SECTOR_OPTIONS.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveAsPreset}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'rgba(56, 189, 248, 0.14)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      color: '#38bdf8',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <FiCheck size={14} /> Bu Dernek/Birliği Hızlı Listeme Kaydet
                  </button>
                </div>
              </div>

              {/* 3. Üretilen Özel Link & Tek Tıkla Paylaşım Aksiyonları */}
              <div style={{
                background: 'rgba(2, 6, 23, 0.78)',
                border: '1px solid rgba(16, 185, 129, 0.38)',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {(currentConfig.id === 'simder' || currentConfig.logoUrl) && (
                      <img
                        src={currentConfig.logoUrl || '/partners/simder-logo.png'}
                        alt={currentConfig.shortName}
                        style={{ height: '22px', background: '#fff', padding: '2px 6px', borderRadius: '5px' }}
                      />
                    )}
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc' }}>
                      🎯 <span style={{ color: '#fbbf24' }}>{currentConfig.shortName}</span> İçin Üretilen Canlı İndirimli Link ({currentConfig.discountType === 'percent' ? `%${currentConfig.discountValue} İskontolu` : `Araç Başı -${Number(currentConfig.discountValue).toLocaleString('tr-TR')} ₺ İndirimli`}):
                    </div>
                  </div>
                  <a
                    href={generatedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.73rem',
                      fontWeight: 800,
                      color: '#38bdf8',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    👁️ İndirimli Sayfayı Yeni Sekmede Gör <FiExternalLink size={12} />
                  </a>
                </div>

                <div style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  color: '#38bdf8',
                  fontFamily: 'monospace',
                  fontSize: '0.72rem',
                  wordBreak: 'break-all'
                }}>
                  {generatedLink}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.3fr 1.2fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '9px',
                      background: 'rgba(56, 189, 248, 0.18)',
                      border: '1px solid rgba(56, 189, 248, 0.45)',
                      color: '#38bdf8',
                      fontWeight: 800,
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <FiCopy size={14} /> 🔗 Sadece İndirimli Linki Kopyala
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyAnnouncement}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '9px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      color: '#052e16',
                      fontWeight: 900,
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <FiCopy size={14} /> 📋 Dernek Duyuru Metni + Linki Kopyala
                  </button>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="tel"
                      value={targetPhone}
                      onChange={(e) => setTargetPhone(e.target.value)}
                      placeholder="Başkan / Üye Tel (Opsiyonel)"
                      style={{
                        flex: 1,
                        minWidth: '120px',
                        padding: '8px 10px',
                        borderRadius: '9px',
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(34, 197, 94, 0.35)',
                        color: '#fff',
                        fontSize: '0.75rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSendToPhone}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '9px',
                        background: '#22c55e',
                        border: 'none',
                        color: '#052e16',
                        fontWeight: 900,
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap'
                      }}
                      title="Girilen numaraya WhatsApp'tan protokol duyurusunu gönder"
                    >
                      <FiSend size={13} /> WA Gönder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* =====================================================================
               MOD 3 (MADDE 4): CRM ESKİ KAYITLAR & NİYET RADARI YIL SONU KDV TARAMASI
               ===================================================================== */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '11px',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#4ade80' }}>
                      🧾 Yıl Sonu KDV & Şasi Faturası Uyarısı — Eski Müşteri & Radar Taraması
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
                      Sistemde daha önce fiyat sormuş, teklif almış veya Niyet Radarı'na düşmüş müşterilere <strong>"Üstyapıyı beklemeden şasi faturanızı hemen kesip %20 KDV + tam yıl amortismanı vergiden düşün"</strong> mesajını ismine özel takip linkiyle tek tıkla gönderin!
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      color: '#38bdf8',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '999px'
                    }}>
                      Toplam: {taxRadarTargets.length} Numaralı Kayıt • Gönderilen: {Object.keys(sentTaxPhones).length}
                    </span>
                    {Object.keys(sentTaxPhones).length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSentTaxPhones({});
                          try { window.localStorage.removeItem(TAX_OUTREACH_SENT_KEY); } catch {}
                          toast.success('Gönderildi işaretleri sıfırlandı.');
                        }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.16)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          color: '#fca5a5',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        İşaretleri Sıfırla
                      </button>
                    )}
                  </div>
                </div>

                {/* Mesaj Şablonu Seçici */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fde047', marginBottom: '5px' }}>
                    1. Gönderilecek Yıl Sonu KDV, İhracatçı Euro Kredisi & Şasi Faturası Şablonunu Seç:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'esnaf_kdv', label: '🤝 Samimi Esnaf (%20 KDV + Hemen Şasi Faturası + 1M %0 Faiz)' },
                      { id: 'kurumsal_vergi', label: '🏢 Kurumsal Filo (%20 KDV + Kıst Amortisman Yok + Kredi)' },
                      { id: 'ihracat_euro', label: '💶 İhracatçı Euro (€) Kredisi (%0 Kâr Payı / 6 Ay Ödemesiz + %20 KDV)' },
                      { id: 'smmm_muhasebe', label: '👨‍💼 Muhasebe / Mali Müşavir KDV & Kampanya Tablosu Özeti' }
                    ].map(tpl => {
                      const active = taxRadarTemplate === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => setTaxRadarTemplate(tpl.id)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: active ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.12)',
                            background: active ? 'rgba(16, 185, 129, 0.24)' : 'rgba(2, 6, 23, 0.78)',
                            color: active ? '#4ade80' : '#cbd5e1',
                            fontSize: '0.72rem',
                            fontWeight: active ? 900 : 700,
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          {tpl.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Filtre & Arama Çubuğu */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {[
                      { id: 'unsent', label: '⏳ Gönderilmeyenler' },
                      { id: 'all', label: '📋 Tümü' },
                      ...PROSPECT_CATEGORY_TABS,
                      { id: 'crm', label: '🗂️ CRM Kayıtları' },
                      { id: 'radar', label: '📡 Niyet Radarı' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setTaxRadarFilter(f.id)}
                        style={{
                          padding: '6px 9px',
                          borderRadius: '7px',
                          border: taxRadarFilter === f.id ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                          background: taxRadarFilter === f.id ? 'rgba(56, 189, 248, 0.24)' : 'rgba(2, 6, 23, 0.7)',
                          color: taxRadarFilter === f.id ? '#7dd3fc' : '#cbd5e1',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ position: 'relative', width: '100%' }}>
                    <FiSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={13} />
                    <input
                      type="text"
                      value={taxRadarSearch}
                      onChange={(e) => setTaxRadarSearch(e.target.value)}
                      placeholder="Firma adı, GSM (05xx), e-posta (@), şehir veya sektöre göre ara..."
                      style={{
                        width: '100%',
                        padding: '7px 10px 7px 28px',
                        borderRadius: '8px',
                        background: 'rgba(2, 6, 23, 0.88)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        color: '#fff',
                        fontSize: '0.75rem'
                      }}
                    />
                  </div>
                </div>

                {/* Müşteri Listesi */}
                <div style={{
                  maxHeight: '360px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  paddingRight: '4px'
                }}>
                  {taxRadarLoading && filteredTaxRadarTargets.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem' }}>
                      ⏳ Müşteri kayıtları taranıyor...
                    </div>
                  ) : filteredTaxRadarTargets.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.76rem' }}>
                      Bu filtrede görüntülenecek müşteri kalmadı. "📋 Tümü" sekmesine geçebilirsiniz.
                    </div>
                  ) : (
                    filteredTaxRadarTargets.slice(0, 120).map(target => {
                      const isSent = Boolean(sentTaxPhones[target.phoneKey]);
                      return (
                        <div
                          key={target.key}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '8px',
                            padding: '8px 11px',
                            borderRadius: '9px',
                            background: isSent ? 'rgba(16, 185, 129, 0.08)' : 'rgba(2, 6, 23, 0.85)',
                            border: isSent ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(148, 163, 184, 0.2)'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#f8fafc' }}>
                                {target.name}
                              </span>
                              <span style={{
                                fontSize: '0.64rem',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: '999px',
                                background: target.sourceType === 'directory'
                                  ? 'rgba(168, 85, 247, 0.22)'
                                  : target.sourceType === 'both'
                                    ? 'rgba(245, 158, 11, 0.22)'
                                    : target.sourceType === 'radar'
                                      ? 'rgba(56, 189, 248, 0.2)'
                                      : 'rgba(148, 163, 184, 0.2)',
                                color: target.sourceType === 'directory'
                                  ? '#e9d5ff'
                                  : target.sourceType === 'both'
                                    ? '#fde047'
                                    : target.sourceType === 'radar'
                                      ? '#7dd3fc'
                                      : '#cbd5e1'
                              }}>
                                {target.sourceBadge}
                              </span>
                              {isSent && (
                                <span style={{
                                  fontSize: '0.64rem',
                                  fontWeight: 900,
                                  color: '#4ade80',
                                  background: 'rgba(16, 185, 129, 0.2)',
                                  padding: '1px 6px',
                                  borderRadius: '999px'
                                }}>
                                  ✓ Gönderildi
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.71rem', color: '#94a3b8', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {target.phone && (
                                <span style={{ color: target.isGsm ? '#4ade80' : '#93c5fd', fontWeight: 800 }}>
                                  {target.isGsm ? '📱 GSM:' : '☎️ Sabit:'} {target.phone}
                                </span>
                              )}
                              {target.email && (
                                <span style={{ color: '#d8b4fe', fontWeight: 800 }}>
                                  📧 {target.email}
                                </span>
                              )}
                              <span>• 📍 {target.city}</span>
                              <span>• 🚛 {target.model}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(buildTaxRadarCustomerMessage(target));
                                toast.success(`📋 ${target.name} için mesaj + özel takip linki kopyalandı!`);
                              }}
                              style={{
                                padding: '7px 10px',
                                borderRadius: '8px',
                                background: 'rgba(56, 189, 248, 0.16)',
                                border: '1px solid rgba(56, 189, 248, 0.4)',
                                color: '#7dd3fc',
                                fontSize: '0.71rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <FiCopy size={12} /> Kopyala
                            </button>

                            {target.email && (
                              <button
                                type="button"
                                onClick={() => handleSendMailToTarget(target)}
                                style={{
                                  padding: '7px 11px',
                                  borderRadius: '8px',
                                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                                  border: 'none',
                                  color: '#ffffff',
                                  fontSize: '0.72rem',
                                  fontWeight: 900,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                              >
                                📧 Mail Gönder
                              </button>
                            )}

                            {(target.isGsm || !target.email) && target.phone && (
                              <button
                                type="button"
                                onClick={() => handleSendTaxRadarToTarget(target)}
                                style={{
                                  padding: '7px 12px',
                                  borderRadius: '8px',
                                  background: isSent ? 'rgba(16, 185, 129, 0.25)' : '#22c55e',
                                  border: isSent ? '1px solid #10b981' : 'none',
                                  color: isSent ? '#4ade80' : '#052e16',
                                  fontSize: '0.73rem',
                                  fontWeight: 900,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                              >
                                <FiSend size={12} /> {isSent ? 'Tekrar WA' : '💬 WhatsApp Gönder'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
