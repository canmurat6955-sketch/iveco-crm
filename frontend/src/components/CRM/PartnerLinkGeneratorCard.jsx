import React, { useState, useMemo, useEffect } from 'react';
import {
  DEFAULT_PARTNER_PROTOCOLS,
  getSavedCustomPartners,
  saveCustomPartner,
  deleteCustomPartner,
  buildPartnerShareUrl,
  buildPartnerAnnouncementText
} from '../../data/partnerProtocols';
import { crmApi } from '../../api/client';
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
    id: 'wa_grup',
    label: '🚚 Nakliye WA Grupları',
    shortDesc: 'Kamyoncu, nakliyeci ve lojistik WhatsApp grupları için duyuru linki',
    refCode: 'wa_grup',
    badgeText: '🚚 Nakliye WhatsApp Grubu Ziyaretçisi',
    color: '#eab308'
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

export default function PartnerLinkGeneratorCard({ isMobile = false }) {
  const [isExpanded, setIsExpanded] = useState(true);
  // 'channels' = WhatsApp Durum / Müşteri / Özel Müşteri / Instagram / LinkedIn
  // 'partners' = Dernek, Oda & Birlik Protokolleri (SİMDER, Arıcılar Birliği vb.)
  const [studioMode, setStudioMode] = useState('channels');

  // --- SEKME 1: SOSYAL MEDYA & WHATSAPP MÜŞTERİ LİNK ÜRETİCİ STATE'LERİ ---
  const [selectedChannelId, setSelectedChannelId] = useState('wa_durum');
  const [hookStyle, setHookStyle] = useState('curiosity_short'); // 'curiosity_short' | 'tradein_hook' | 'tax_hook' | 'detailed'
  const [channelSector, setChannelSector] = useState('all');
  const [vipTone, setVipTone] = useState('friendly'); // 'friendly' | 'new_lead' | 'corporate'
  const [vipCustomerSearch, setVipCustomerSearch] = useState('');
  const [vipMatchedCustomers, setVipMatchedCustomers] = useState([]);
  const [vipSelectedCustomer, setVipSelectedCustomer] = useState(null);
  const [vipCompanyName, setVipCompanyName] = useState('');
  const [vipPhone, setVipPhone] = useState('');
  const [enableChannelDiscount, setEnableChannelDiscount] = useState(false);
  const [channelDiscountType, setChannelDiscountType] = useState('amount'); // 'amount' | 'percent'
  const [channelDiscountValue, setChannelDiscountValue] = useState(50000);
  const [channelDiscountTitle, setChannelDiscountTitle] = useState('Özel Müşteri İskontosu');

  // --- SEKME 2: DERNEK, ODA & BİRLİK (SİMDER, ARICILAR BİRLİĞİ VB.) STATE'LERİ ---
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

  // Sekme 1 için üretilen Link
  const channelGeneratedLink = useMemo(() => {
    const baseOrigin = (origin || 'https://iveco-crm.vercel.app').replace(/\/$/, '');
    const params = new URLSearchParams();

    if (vipSelectedCustomer?.id) {
      params.set('cid', String(vipSelectedCustomer.id));
    }
    if (vipCompanyName.trim()) {
      params.set('company', vipCompanyName.trim());
    }
    const cleanPhone = vipPhone.replace(/\D/g, '');
    if (cleanPhone.length >= 10) {
      params.set('phone', cleanPhone);
    }
    if (channelSector && channelSector !== 'all') {
      params.set('sector', channelSector);
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
    activeChannel,
    vipSelectedCustomer,
    vipCompanyName,
    vipPhone,
    channelSector,
    enableChannelDiscount,
    channelDiscountValue,
    channelDiscountType,
    channelDiscountTitle
  ]);

  // Sekme 1 için üretilen Hazır Paylaşım Mesajı
  const channelGeneratedMessage = useMemo(() => {
    const link = channelGeneratedLink;
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

    // WHATSAPP DURUM (STATUS) ÖZEL KURALI:
    // Android WhatsApp Durum'da metin ~180 karakteri aşarsa veya linkin altında/başında metin-emoji olursa
    // üstteki beyaz resimli link kartı gizlenir. Bu yüzden Durum metinleri kısa tutulur ve link en son satırda tek başına yer alır:
    if (selectedChannelId === 'wa_durum') {
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

    // 1. SIKMAYAN 2 CÜMLELİK MERAK KANCASI (REKLAM KOKMAYAN / EN YÜKSEK TIKLAMA)
    if (hookStyle === 'curiosity_short') {
      if (selectedChannelId === 'wa_ozel' || selectedChannelId === 'wa_musteri') {
        const prefix = vipCompanyName.trim() ? `*${vipCompanyName.trim()}* — ` : '';
        return (
          `${prefix}Abi selamlar, hayırlı işler dilerim. 🙏\n\n` +
          `Seni hiç telefonla bölmeyeyim dedim; beni aramana bile gerek kalmadan elindeki aracın takasını düşüp kalan kredi taksitini ve 2026 şasi fiyatlarını kendi başına görebileceğin bir hesap makinesi hazırladım${discountShortNote}. Lazım oldukça elinin altında bulunsun 👇\n\n` +
          `*Satış Sorumlusu Can Murat — 0544 622 59 31*\n\n` +
          `${link}`
        );
      }
      if (selectedChannelId === 'wa_grup') {
        return (
          `Cümleten hayırlı işler, kazasız belasız seferler abilerim. 🙏\n\n` +
          `Grubu reklamla meşgul etmek için değil, işinize yarayacak canlı bir hesap cetveli bırakmak için yazıyorum: Kimseyi aramadan hangi ehliyetle hangi tonaj taşınır, elinizdeki aracın takasını düşünce ayda kaç TL taksit çıkar 10 saniyede kendiniz bakabilirsiniz${discountShortNote} 👇\n\n` +
          `*Satış Sorumlusu Can Murat — 0544 622 59 31*\n\n` +
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
        `Ticari araç yatırımlarında telefon trafiğine girmeden; tonaj/kasa uyumu, %20 KDV vergi kalkanı ve takas + kredi nakit akışını 30 saniyede kendi ekranınızda simüle edebileceğiniz dijital hesaplama aracımız${discountShortNote} 👇\n\n` +
        `*Satış Sorumlusu Can Murat — 0544 622 59 31 | IVECO ERC Samsun Otomotiv*\n\n` +
        `${link}`
      );
    }

    // 2. TAKAS & 4 RESİM KANCASI ("ARACIM KAÇ PARA EDER?")
    if (hookStyle === 'tradein_hook') {
      return (
        `🔄 *"Elimdeki aracı takasa versem ne kadar sayarlar, üstüne ayda kaç TL öderim?"* diye merak edenler için canlı ekran açtık!${discountShortNote}\n\n` +
        `İster ekrandaki sürgüden aracınızın takas değerini düşüp *1.000.000 TL %0 Faizle* kalan taksitinizi görün, isterseniz mevcut aracınızın *4 resmini (1 dıştan, 1 içten, KM ve ruhsat)* yükleyin 15 dakikada takas ön fiyatınızı cebinize gönderelim 👇\n\n` +
        `*Satış Sorumlusu Can Murat — 0544 622 59 31*\n\n` +
        `${link}`
      );
    }

    // 3. %20 KDV VERGİ KALKANI & MUHASEBE KANCASI
    if (hookStyle === 'tax_hook') {
      return (
        `🧾 *Vergi Ödemek Yerine Filoyu Yenilemek İsteyen İşletmelerimize Not:*\n\n` +
        `2026 model IVECO şasi ve çekici modellerimizde aracın fatura bedeli içindeki *%20 KDV tutarını doğrudan vergiden düşebileceğiniz* tutarları ve *1M TL %0 Faiz* kredi tablosunu tek ekranda hazırladık${discountShortNote}. Mali müşavirinize tek tuşla gönderebilirsiniz 👇\n\n` +
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
        `✅ *Canlı Takas + Kredi Hesabı:* Elinizdeki aracın takas değerini düşüp 1.000.000 TL 12 Ay %0 Faiz veya vadeli banka oranlarıyla aylık taksitinizi anında görün,\n` +
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
          `🔄 Elindeki aracın takas değerini düşüp *1.000.000 TL 12 Ay %0 Faiz (83.333 TL/Ay)* ile kalan taksitini 10 saniyede kendin hesaplayabilirsin,\n` +
          `📸 Mevcut aracının *4 resmini (1 dıştan, 1 içten, KM ve ruhsat)* yükleyip 15 dakikada takasla fiyat alabilirsin 👇\n\n` +
          `*Satış Sorumlusu Can Murat — 0544 622 59 31*\n\n` +
          `${link}`
        );
      }
      if (vipTone === 'corporate') {
        return (
          `Sayın *${targetTitle}* Yönetimi,\n\n` +
          `Ben IVECO ERC Samsun Otomotiv *Satış Sorumlusu Can Murat* (0544 622 59 31).\n\n` +
          `2026 yılı filo yenileme ve ticari araç yatırımlarınız kapsamında firmanıza özel hazırladığım dijital katalog, %20 KDV vergi kalkanı & amortisman özeti ve ticari kredi simülasyon bağlantınızı bilgilerinize sunarım:\n\n` +
          discountLine +
          `*Satış Sorumlusu Can Murat — 0544 622 59 31 | IVECO ERC Samsun Otomotiv*\n\n` +
          `${link}`
        );
      }
      return (
        `Sayın *${targetTitle}*,\n\n` +
        `Ben IVECO ERC Samsun Otomotiv *Satış Sorumlusu Can Murat* (0544 622 59 31).\n\n` +
        `Firmanız için hazırladığım 2026 model IVECO şasi fiyat listesini, takas + %0 faizli kredi hesaplayıcısını ve 4 resimle (1 dıştan, 1 içten, KM ve ruhsat) 15 dakikada takas ön değerleme ekranımızı aşağıdaki size özel bağlantıdan inceleyebilirsiniz 👇\n\n` +
        discountLine +
        `*Satış Sorumlusu Can Murat — 0544 622 59 31 | IVECO ERC Samsun Otomotiv*\n\n` +
        `${link}`
      );
    }

    if (selectedChannelId === 'wa_grup') {
      return (
        `🚛 *Gruptaki tüm nakliyeci, lojistikçi ve esnaf abilerime/kardeşlerime hayırlı işler, kazasız belasız seferler dilerim!*\n\n` +
        `IVECO ERC Samsun Otomotiv olarak kimseyi telefon trafiğiyle yormadan 10 saniyede kendi hesabınızı yapabileceğiniz *2026 Canlı Fiyat, Takas & Kredi Ekranımızı* açtık:\n\n` +
        discountLine +
        `✅ *Ehliyet & Tonaja Göre Seçim:* Daily 3.5 Ton (B Ehliyet), Daily 7 Ton (C1/C Ehliyet), Eurocargo (C Ehliyet), S-Way Çekici (CE Ehliyet) ve T-Way Damper/Mikser,\n` +
        `🔄 *Canlı Takas + Kredi Hesabı:* Elinizdeki aracın takas değerini düşüp 1M TL %0 Faiz veya anlaşmalı banka oranlarıyla aylık taksitinizi anında görün,\n` +
        `📸 *4 Resimle 15 Dk'da Takas:* Aracınızın 1 dıştan, 1 içten, KM ve ruhsat resmini yükleyin, 15 dakikada takasla net fiyatınızı çıkaralım,\n` +
        `🔔 *Takastan Temiz 2. El Habercisi:* Sıfır bütçesini aşanlar kaydolsun, takasa temiz araç düştüğü an ilk size haber verelim!\n\n` +
        `📞 *Satış Sorumlusu Can Murat — 0544 622 59 31*\n` +
        `👇 *Hemen incelemek ve hesap yapmak için tıklayın:*\n\n` +
        `${link}`
      );
    }

    if (selectedChannelId === 'instagram') {
      return (
        `"Elimdeki aracı takasa versem 2026 sıfır IVECO bana ayda kaç TL'ye gelir?" diye düşünmeyin, 10 saniyede kendiniz hesaplayın! 🚛📊\n\n` +
        discountLine +
        `Yeni Dijital Showroom ekranımızda neler var?\n` +
        `✅ Canlı Takas + Kredi Hesaplayıcı (1.000.000 TL 12 Ay %0 Faiz),\n` +
        `📸 4 Resimle (1 Dıştan, 1 İçten, KM, Ruhsat) 15 Dakikada Takas Ekspertizi,\n` +
        `🔒 Muhasebecinizle görüşene kadar Fiyatı 24 Saat Ücretsiz Opsiyonlama,\n` +
        `☕ Showroom Kahve, İş Yeri Ziyareti veya Canlı Görüntülü Araç Turu Randevusu,\n` +
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
      `Platform üzerinden doğrudan:\n` +
      `1️⃣ Tonaj, üstyapı ve ehliyet sınıfına göre 2026 Daily (3.5T - 7T), Eurocargo, S-Way Çekici ve T-Way şasi eşleştirmesi,\n` +
      `2️⃣ Takas peşinatı + %0 faizli TL ve EUR ticari kredi nakit akış simülasyonu,\n` +
      `3️⃣ Mali müşavirinize tek tıkla iletebileceğiniz %20 KDV Vergi Kalkanı, 5 Yıllık TCO Yakıt Avantajı & Amortisman özeti,\n` +
      `4️⃣ 4 fotoğrafla (dıştan, içten, KM, ruhsat) 15 dakikada takas değerleme ve 24 saatlik ücretsiz şasi/fiyat blokajı oluşturabilirsiniz 👇\n\n` +
      `📞 Satış Sorumlusu Can Murat — 0544 622 59 31 | IVECO ERC Samsun Otomotiv\n\n` +
      `${link}\n\n` +
      `#IVECO #Lojistik #FiloYönetimi #TicariAraç #Nakliye #SWay #Daily #Samsun`
    );
  }, [
    selectedChannelId,
    hookStyle,
    channelGeneratedLink,
    vipCompanyName,
    vipTone,
    enableChannelDiscount,
    channelDiscountType,
    channelDiscountValue
  ]);

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
                🚀 Canlı Link, Sosyal Medya & Özel Kampanya Üretici
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
                WA Durum • WA Müşteri • Özel Müşteri • Instagram • LinkedIn • Dernek/SİMDER
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
              İstediğin mecrayı veya derneği seç, dilersen özel indirim oranı ekle; tıklayan herkes Canlı Müşteri Ayak İzine hangi linkten geldiğiyle düşsün!
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
          {/* İki Ana Mod Sekmesi */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr',
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
                padding: '10px 12px',
                borderRadius: '8px',
                border: studioMode === 'channels' ? '1.5px solid #38bdf8' : 'none',
                background: studioMode === 'channels'
                  ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.38) 0%, rgba(15, 23, 42, 0.9) 100%)'
                  : 'transparent',
                color: studioMode === 'channels' ? '#ffffff' : '#94a3b8',
                fontWeight: 900,
                fontSize: isMobile ? '0.78rem' : '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              📲 1. WhatsApp (Durum / Müşteri / Özel) • Instagram • LinkedIn
            </button>
            <button
              type="button"
              onClick={() => setStudioMode('partners')}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                border: studioMode === 'partners' ? '1.5px solid #f59e0b' : 'none',
                background: studioMode === 'partners'
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.35) 0%, rgba(15, 23, 42, 0.9) 100%)'
                  : 'transparent',
                color: studioMode === 'partners' ? '#fde047' : '#94a3b8',
                fontWeight: 900,
                fontSize: isMobile ? '0.78rem' : '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              🏛️ 2. Dernek, Oda & Birlik İndirimli Linkler (SİMDER, Arıcılar vb.)
            </button>
          </div>

          {studioMode === 'channels' ? (
            /* =====================================================================
               MOD 1: WHATSAPP DURUM / MÜŞTERİ / ÖZEL MÜŞTERİ / INSTAGRAM / LINKEDIN
               ===================================================================== */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* 1. Mecra Seçimi */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '7px' }}>
                  1. Hangi Kanal İçin Link & Mesaj Üretmek İstiyorsun?
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)',
                  gap: '7px'
                }}>
                  {SOCIAL_CHANNELS.map(ch => {
                    const isSel = selectedChannelId === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setSelectedChannelId(ch.id)}
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
                {/* Sol Kutu: Müşteri / Firma Seçimi (Özellikle WhatsApp Özel Müşteri ve WhatsApp Müşteri için) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8' }}>
                    👤 Müşteri / Firma Bilgisi {selectedChannelId === 'wa_ozel' ? '(Müşteriye Özel Açılış Başlığı)' : '(Opsiyonel - Doğrudan WA Gönderimi İçin)'}:
                  </div>

                  {/* CRM'den Hızlı Müşteri Bul */}
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
                            <span style={{ color: '#38bdf8' }}>{c.phone || c.city}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      value={vipCompanyName}
                      onChange={(e) => {
                        setVipCompanyName(e.target.value);
                        if (!e.target.value) setVipSelectedCustomer(null);
                      }}
                      placeholder="Firma veya Müşteri Adı (Opsiyonel)"
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
                    <input
                      type="tel"
                      value={vipPhone}
                      onChange={(e) => setVipPhone(e.target.value)}
                      placeholder="WhatsApp Tel (05xx...)"
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

                {/* Sağ Kutu: Sektör Filtresi & İsteğe Bağlı Özel İndirim Tanımlama */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                      Açılışta Gösterilecek Araç / Sektör Vitrini:
                    </label>
                    <select
                      value={channelSector}
                      onChange={(e) => setChannelSector(e.target.value)}
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

                {/* 🎯 Sıkmayan / Merak Uyandıran Kanca Seçici */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fbbf24', marginBottom: '5px' }}>
                    🎯 Müşteriyi Sıkmadan Tıklatan Mesaj Kancası Seç:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'curiosity_short', label: '⚡ 2 Cümle Merak (Sıfır Reklam)' },
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

                {/* Hazır Paylaşım Metni Önizleme */}
                <div style={{
                  padding: '9px 11px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: '#cbd5e1',
                  fontSize: '0.73rem',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '115px',
                  overflowY: 'auto',
                  lineHeight: 1.4
                }}>
                  {channelGeneratedMessage}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.3fr 1fr', gap: '8px' }}>
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
                    <FiCopy size={14} /> 📋 Hazır Metni + Linki Kopyala
                  </button>

                  <button
                    type="button"
                    onClick={() => {
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
                      background: '#22c55e',
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
                    <FiSend size={14} /> {vipPhone.replace(/\D/g, '').length >= 10 ? '💬 WhatsApp’tan Gönder' : '💬 Kopyala & Paylaş'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* =====================================================================
               MOD 2: DERNEK, ODA & BİRLİK PROTOKOL LİNK ÜRETİCİ (SİMDER, ARICILAR VB.)
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
          )}
        </div>
      )}
    </div>
  );
}
