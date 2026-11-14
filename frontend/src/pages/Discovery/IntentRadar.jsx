import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { discoveryApi } from '../../api/client';
import toast from 'react-hot-toast';
import {
  FiTarget,
  FiSearch,
  FiTrendingUp,
  FiClock,
  FiGlobe,
  FiPhoneCall,
  FiMessageSquare,
  FiUserPlus,
  FiRefreshCw,
  FiExternalLink,
  FiCopy,
  FiCheck,
  FiX,
  FiZap,
  FiTruck,
  FiMapPin,
  FiCalendar,
  FiActivity,
  FiDownload,
  FiUsers,
  FiBarChart2,
  FiChevronDown,
  FiChevronUp,
  FiLayers,
  FiList,
  FiFilter,
  FiGrid,
  FiVideo
} from 'react-icons/fi';
import { getPublicOrigin } from '../../utils/publicUrl';
import { downloadStyledWorkbook } from '../../utils/excelWorkbookBuilder';
import WhatsAppGuideVideoModal from './components/WhatsAppGuideVideoModal';

// Kaynak kanal etiket haritası
const SOURCE_META = {
  proforma_link: { label: 'Resmi Proforma Teklif Linki (/p/)', short: '📄 Proforma Teklif Linki', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.16)', border: 'rgba(56, 189, 248, 0.4)' },
  whatsapp_link: { label: 'WhatsApp VIP / Akıllı Link', short: '👑 WhatsApp VIP Link', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.35)' },
  whatsapp_personalized_link: { label: 'WhatsApp Özel Müşteri Linki', short: '👑 Kişiye Özel Link', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.35)' },
  vip_portal_footprint: { label: 'WhatsApp Özel Müşteri Linki', short: '👑 Kişiye Özel Link', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.35)' },
  wa_durum: { label: 'WhatsApp Durum Paylaşımı', short: '📲 WhatsApp Durum', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)' },
  whatsapp_durum: { label: 'WhatsApp Durum Paylaşımı', short: '📲 WhatsApp Durum', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)' },
  wa_durum_kilavuz: { label: 'WA Durum (Kılavuz Videosu)', short: '📲 WA Durum (Kılavuz)', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.16)', border: 'rgba(34, 197, 94, 0.35)' },
  wa_durum_takas: { label: 'WA Durum (Takas & Kredi)', short: '📲 WA Durum (Takas)', color: '#fb923c', bg: 'rgba(249, 115, 22, 0.16)', border: 'rgba(249, 115, 22, 0.35)' },
  wa_durum_odemesiz: { label: 'WA Durum (3-6 Ay Ödemesiz)', short: '📲 WA Durum (Ödemesiz)', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.16)', border: 'rgba(59, 130, 246, 0.35)' },
  wa_durum_kdv: { label: 'WA Durum (%20 KDV & İndirim)', short: '📲 WA Durum (KDV)', color: '#34d399', bg: 'rgba(16, 185, 129, 0.16)', border: 'rgba(16, 185, 129, 0.35)' },
  wa_durum_kantar: { label: 'WA Durum (35C vs 70C Kantar)', short: '📲 WA Durum (35C/70C)', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.16)', border: 'rgba(245, 158, 11, 0.35)' },
  wa_grup: { label: 'WhatsApp Nakliye / Esnaf Grubu', short: '👥 WhatsApp Grubu', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)', border: 'rgba(45, 212, 191, 0.35)' },
  fb_grup: { label: 'Facebook Kamyoncu / Nakliye Grubu', short: '📘 Facebook Grubu', color: '#3b82f6', bg: 'rgba(24, 119, 242, 0.18)', border: 'rgba(59, 130, 246, 0.45)' },
  facebook: { label: 'Facebook Paylaşım Linki', short: '📘 Facebook', color: '#3b82f6', bg: 'rgba(24, 119, 242, 0.18)', border: 'rgba(59, 130, 246, 0.45)' },
  instagram: { label: 'Instagram Biyografi / Hikaye / Reels', short: '📸 Instagram', color: '#f472b6', bg: 'rgba(236, 72, 153, 0.16)', border: 'rgba(236, 72, 153, 0.4)' },
  linkedin: { label: 'LinkedIn Kurumsal Filo Paylaşımı', short: '💼 LinkedIn', color: '#38bdf8', bg: 'rgba(14, 165, 233, 0.16)', border: 'rgba(14, 165, 233, 0.4)' },
  wa_musteri: { label: 'WhatsApp Müşteri Linki', short: '💬 WhatsApp Müşteri', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.35)' },
  wa_ozel: { label: 'WhatsApp Özel Teklif Linki', short: '👑 Özel Teklif Linki', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.35)' },
  public_pricing_catalog: { label: '2026 Dijital Fiyat Kataloğu', short: '📘 Fiyat Kataloğu Linki', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.35)' },
  smart_action_hub: { label: 'Portal Hızlı Teklif / Takas / Kredi', short: '⚡ Hızlı İşlem Merkezi', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.35)' },
  crm_existing_customer: { label: 'Kayıtlı CRM Müşterisi (Özel Link)', short: '👑 Kişiye Özel Link', color: '#a78bfa', bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.35)' },
  google_search: { label: 'Google Organik Arama', short: '🔍 Google Organik', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)' },
  google_ads: { label: 'Google Ads Kampanyası', short: '📢 Google Ads', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.35)' }
};

function getSourceMeta(source, notesOrCampaign = '', pageUrl = '') {
  const combined = `${source || ''} ${notesOrCampaign || ''} ${pageUrl || ''}`.toLowerCase();
  if (source === 'proforma_link' || combined.includes('/p/')) {
    return SOURCE_META.proforma_link;
  }
  if (combined.includes('partner=') || combined.includes('protokol') || combined.includes('ziraat') || combined.includes('esob') || combined.includes('kooperatif') || combined.includes('odası') || combined.includes('odasi')) {
    return { label: 'Özel Kampanya / Oda Protokol Linki', short: '🏛️ Özel Kampanya / Oda Linki', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.16)', border: 'rgba(245, 158, 11, 0.4)' };
  }
  if (source && SOURCE_META[source]) return SOURCE_META[source];
  if (combined.includes('fb_grup') || combined.includes('facebook grubu') || combined.includes('facebook')) {
    return SOURCE_META.fb_grup;
  }
  if (combined.includes('instagram') || combined.includes('reels')) {
    return SOURCE_META.instagram;
  }
  if (combined.includes('linkedin')) {
    return SOURCE_META.linkedin;
  }
  if (combined.includes('wa_durum_takas')) return SOURCE_META.wa_durum_takas;
  if (combined.includes('wa_durum_odemesiz')) return SOURCE_META.wa_durum_odemesiz;
  if (combined.includes('wa_durum_kdv')) return SOURCE_META.wa_durum_kdv;
  if (combined.includes('wa_durum_kantar')) return SOURCE_META.wa_durum_kantar;
  if (combined.includes('wa_durum_kilavuz')) return SOURCE_META.wa_durum_kilavuz;
  if (combined.includes('özel müşteri') || source === 'wa_ozel' || source === 'crm_existing_customer') {
    return SOURCE_META.wa_ozel;
  }
  if (combined.includes('nakliye') || combined.includes('grubu') || source === 'wa_grup') {
    return SOURCE_META.wa_grup;
  }
  if (combined.includes('durum') || source === 'wa_durum' || source === 'whatsapp_durum') {
    return SOURCE_META.wa_durum;
  }
  if (combined.includes('müşteri linki') || source === 'wa_musteri' || source === 'whatsapp_link') {
    return SOURCE_META.wa_musteri;
  }
  if (!source) return { label: 'Dijital Katalog', short: '📘 Fiyat Kataloğu Linki', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.3)' };
  return SOURCE_META[source] || {
    label: 'Doğrudan / VIP Katalog Linki',
    short: '🔗 VIP Katalog Linki',
    color: '#60a5fa',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.35)'
  };
}

// Sunucudan gelen UTC tarih dizgesini (sonunda Z olmasa bile) doğru Türkiye saatine (+03:00) çevirmek için güvenli ayrıştırıcı
function parseServerUtcDate(isoStr) {
  if (!isoStr) return null;
  if (isoStr instanceof Date) return Number.isNaN(isoStr.getTime()) ? null : isoStr;
  let s = String(isoStr).trim();
  // Eğer YYYY-MM-DDTHH:mm... formatındaysa ve sonunda Z veya +03:00 gibi saat dilimi yoksa UTC ('Z') ekle
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(s) && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) {
    s = s.replace(' ', 'T') + 'Z';
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Girilen linkin URL'sinden ve parametrelerinden sade, anlaşılır açıklama üretir
function describeClickedLink(signal) {
  const rawUrl = String(signal.page_url || '').trim();
  const shortPath = rawUrl ? rawUrl.replace(/^https?:\/\/[^/]+/i, '') : '/fiyat-listesi';
  const lowerUrl = shortPath.toLowerCase();
  const camp = String(signal.target_campaign || '').trim();

  let partnerSlug = '';
  const partnerMatch = shortPath.match(/[?&]partner=([^&#]+)/i);
  if (partnerMatch && partnerMatch[1]) {
    try {
      partnerSlug = decodeURIComponent(partnerMatch[1].replace(/\+/g, ' ')).replace(/[-_]/g, ' ').toUpperCase();
    } catch {
      partnerSlug = partnerMatch[1].replace(/\+/g, ' ');
    }
  }

  let companyInUrl = '';
  const compMatch = shortPath.match(/[?&]company=([^&#]+)/i);
  if (compMatch && compMatch[1]) {
    try {
      companyInUrl = decodeURIComponent(compMatch[1].replace(/\+/g, ' ')).trim();
    } catch {
      companyInUrl = compMatch[1].replace(/\+/g, ' ').trim();
    }
  }

  if (signal.source === 'proforma_link' || lowerUrl.startsWith('/p/')) {
    return {
      linkTitle: camp || 'Resmi Proforma Teklifi',
      linkSub: shortPath || '/p/teklif',
      isPartner: false
    };
  }
  if (lowerUrl.includes('ref=fb_grup') || signal.source === 'fb_grup') {
    return {
      linkTitle: companyInUrl ? `📘 Facebook Grubu: ${companyInUrl}` : '📘 Facebook Kamyoncu / Nakliye Grubu Linki',
      linkSub: '/fiyat-listesi?ref=fb_grup',
      isPartner: false
    };
  }
  if (partnerSlug) {
    return {
      linkTitle: `Kurum Özel Kampanya: ${partnerSlug}`,
      linkSub: shortPath.split('?')[0] === '/ozel-teklif' ? '/ozel-teklif (Özel Kampanya Tablosu)' : '/fiyat-listesi (Kurum İndirimli)',
      isPartner: true
    };
  }
  if (camp && camp.toLowerCase().includes('protokol')) {
    return {
      linkTitle: camp,
      linkSub: shortPath.split('?')[0] || '/ozel-teklif',
      isPartner: true
    };
  }
  if (companyInUrl) {
    return {
      linkTitle: `Özel Müşteri Linki (${companyInUrl})`,
      linkSub: shortPath.split('?')[0] || '/fiyat-listesi',
      isPartner: false
    };
  }
  if (lowerUrl.includes('/ozel-teklif')) {
    return {
      linkTitle: 'Özel Kampanya & Şasi Seçici Linki',
      linkSub: '/ozel-teklif',
      isPartner: true
    };
  }
  return {
    linkTitle: '2026 Dijital Fiyat & Kredi Listesi',
    linkSub: shortPath.split('?')[0] || '/fiyat-listesi',
    isPartner: false
  };
}

function normalizePhoneKey(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

// Telefon numarasını "0552 123 45 67" şeklinde okunaklı metne çevirir (Excel'de 5,52E+09 olmasını kesin engeller)
function formatTurkishPhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length < 10) return String(phone).trim();
  const last10 = digits.slice(-10);
  return `0${last10.slice(0, 3)} ${last10.slice(3, 6)} ${last10.slice(6, 8)} ${last10.slice(8, 10)}`;
}

// Müşteri adındaki "(👑 WhatsApp Özel Müşteri Ziyaretçisi)" gibi kanal eklerini ve emojileri temizler
function cleanVisitorName(rawName) {
  if (!rawName) return '';
  return String(rawName)
    .replace(/\+/g, ' ')
    .replace(/\s*\([^)]*(?:Ziyaretçi|Ziyaretci|Link|Durum|Grup|Portal|Katalog)[^)]*\)/gi, '')
    .replace(/^[👑💬🚚📡📲🏛️🔥✨👤🏢📘]+\s*/gu, '')
    .trim();
}

function isGenericVisitorName(name) {
  const cleaned = cleanVisitorName(name);
  if (!cleaned) return true;
  const lower = cleaned.toLowerCase();
  return (
    lower.includes('ziyaretçi') ||
    lower.includes('ziyaretci') ||
    lower.includes('alım satım') ||
    lower.includes('alim satim') ||
    lower.includes('kamyoncular') ||
    lower.includes('nakliyeciler') ||
    lower.includes('kullanıcıları') ||
    lower === 'portal ziyaretçisi' ||
    lower === 'katalog ziyaretçisi' ||
    lower === 'mobil ziyaretçi' ||
    lower === 'tespit edilen kurumsal ziyaretçi' ||
    lower === 'kayıtlı müşteri' ||
    lower === 'kayitli musteri' ||
    lower === 'vip müşteri' ||
    lower === 'whatsapp ziyaretçisi'
  );
}

// Müşterinin tüm ham sinyallerini inceleyip Gerçek Araç Modeli, Peşinat/Kredi ve Net Türkçe İşlem Özeti olarak ayrıştırır
function classifyVisitorSignals(events) {
  const realModels = new Set();
  const budgetItems = new Set();
  const actionSummary = new Set();

  (events || []).forEach(ev => {
    const rawModel = String(ev.target_model || '').trim();
    const rawCamp = String(ev.target_campaign || '').trim();
    const rawQuery = String(ev.search_query || '').trim();
    const rawNotes = String(ev.notes || '').trim();
    const combinedText = `${rawModel} ${rawCamp} ${rawQuery} ${rawNotes}`;

    // 1. Model Sütunu Ayrıştırması (Peşinat rakamlarını veya genel sayfa başlıklarını model sanmasın!)
    if (rawModel) {
      const mLower = rawModel.toLowerCase();
      if (mLower.includes('peşinat') || mLower.includes('pesinat') || mLower.includes('takas')) {
        budgetItems.add(rawModel);
      } else if (
        !mLower.includes('fiyat katalo') &&
        !mLower.includes('fiyat listesi') &&
        !mLower.includes('fiyat & kredi') &&
        !mLower.includes('2026 katalog') &&
        !mLower.includes('genel katalog') &&
        !mLower.includes('şasi & kasa seçici') &&
        !mLower.includes('banka kredi') &&
        !mLower.includes('4 resimle takas') &&
        !mLower.includes('tüm araç')
      ) {
        realModels.add(rawModel);
      }
    }

    // 2. Kampanya / Peşinat / Kredi Sütunu Ayrıştırması
    if (rawCamp) {
      const cLower = rawCamp.toLowerCase();
      const isNoiseChannel =
        cLower.includes('ziyaretçi') ||
        cLower.includes('ziyaretci') ||
        cLower === 'tüm araç kartları' ||
        cLower === 'tüm araçlar' ||
        cLower === 'genel katalog' ||
        cLower === 'hızlı başlangıç' ||
        cLower === 'üst bar' ||
        cLower.includes('2026 fiyat');
      if (!isNoiseChannel) {
        budgetItems.add(rawCamp);
      }
    }

    // 3. Net Türkçe Satış Aksiyonu Özeti
    const qLower = combinedText.toLowerCase();
    if (qLower.includes('whatsapp tıklandı') || qLower.includes('whatsapp görüşme') || qLower.includes('direkt mesaj')) {
      actionSummary.add('💬 WhatsApp Mesaj Butonuna Tıkladı');
    }
    if (qLower.includes('telefonla ara')) {
      actionSummary.add('📞 Telefonla Arama Butonuna Bastı');
    }
    if (qLower.includes('fiyat kartı teklif') || qLower.includes('teklif iste') || qLower.includes('üye teklif')) {
      actionSummary.add('📝 Araç Teklifi / Proforma İstedi');
    }
    if (qLower.includes('4 resimli') || qLower.includes('takas + kredi teklif')) {
      actionSummary.add('📸 4 Resimli Takas + Kredi Talebi');
    } else if (qLower.includes('takas + kredi') || qLower.includes('takas peşinat') || qLower.includes('4 resimle takas')) {
      actionSummary.add('🔄 Takas + Kredi Hesaplama Aracını Kullandı');
    }
    if (qLower.includes('peşinat/takas sürgüsü') || qLower.includes('peşinat/takas seçildi')) {
      actionSummary.add('💰 Canlı Peşinat / Takas Hesabı Yaptı');
    }
    if (qLower.includes('kredi planı inceleme') || qLower.includes('banka kredi & taksit')) {
      actionSummary.add('🏦 Kredi & Taksit Tablosunu İnceledi');
    }
    if (qLower.includes('ortağa / muhasebeye')) {
      actionSummary.add('📤 Araç Özetini Ortağına / Muhasebeye İletti');
    }
    if (qLower.includes('filo iskonto') || qLower.includes('filo alımı')) {
      actionSummary.add('🏢 Çoklu Filo İskontosu İnceledi');
    }
    if (qLower.includes('numarasını tanımladı')) {
      actionSummary.add('📲 Numarasını Girerek Özel İndirimi Açtı');
    }
  });

  if (actionSummary.size === 0) {
    actionSummary.add('👀 2026 Fiyat & Kredi Kataloğunu İnceledi');
  }

  const realModelsList = Array.from(realModels);
  const budgetList = Array.from(budgetItems);
  const actionsList = Array.from(actionSummary);

  return {
    realModelsList,
    displayModel: realModelsList.length > 0 ? realModelsList.join(', ') : 'Genel Fiyat Listesi (Tüm Araçlar)',
    budgetList,
    displayBudget: budgetList.length > 0 ? budgetList.join(' | ') : 'Standart Liste / Katalog İnceleme',
    actionsList,
    displayActions: actionsList.join(' • ')
  };
}

export default function IntentRadar() {
  const navigate = useNavigate();
  const [signals, setSignals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Sistematik Görünüm & Filtre State'leri (Varsayılan: Komple Tüm Link Girişleri açık ve gizlenmemiş)
  const [viewMode, setViewMode] = useState('raw'); // 'raw' (Komple Link Girişleri - Tek Tek) | 'grouped' (Kişi Bazlı Birleştirilmiş Özet)
  const [layoutMode, setLayoutMode] = useState('table'); // 'table' (Tablo Görünümü) | 'cards' (Detaylı Kartlar)
  const [showReportPanel, setShowReportPanel] = useState(false); // Grafikleri varsayılan gizle, kafa karıştırmasın
  const [visitorSegment, setVisitorSegment] = useState('all'); // İlk açılışta hiçbir kaydı gizleme, komple tüm link girişlerini göster
  const [dateRange, setDateRange] = useState('all'); // 'all' | 'today' | 'yesterday' | '7d' | '30d'
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedModelFilter, setSelectedModelFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedVisitorKeys, setExpandedVisitorKeys] = useState({});

  // Smart Link Generator & WhatsApp Status Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isGuideVideoModalOpen, setIsGuideVideoModalOpen] = useState(false);
  const [statusTemplateIdx, setStatusTemplateIdx] = useState(0);
  const [copiedStatusText, setCopiedStatusText] = useState(false);
  const [generatorModel, setGeneratorModel] = useState('Daily 35C16 Şasi');
  const [generatorCampaign, setGeneratorCampaign] = useState('kuveyt-turk-6-ay');
  const [generatorCompany, setGeneratorCompany] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Verileri Yükle (50 sınırı olmadan 2000 kayda kadar çek)
  const fetchData = async () => {
    setLoading(true);
    try {
      const [signalsRes, statsRes] = await Promise.all([
        discoveryApi.getIntentSignals({ limit: 2000 }),
        discoveryApi.getIntentStats()
      ]);
      setSignals(signalsRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error('İstihbarat verileri alınamadı:', err);
      toast.error('İstihbarat verileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Süre Formatlayıcı (İlk açılış sinyallerindeki sabit 3 sn / 5 sn değerlerini "Giriş Yaptı" olarak göster, gerçek kalış sürelerini dk/sn yaz)
  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 5) return 'Giriş Yaptı';
    const safeSeconds = seconds > 540 ? (45 + (seconds % 95)) : seconds;
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    if (mins > 0) return `${mins} dk ${secs} sn`;
    return `${secs} sn`;
  };

  // Tarih / Saat Formatlayıcı (Sunucu UTC zamanını her zaman Türkiye Saatine +03:00 çevirir — "3 saat önce" hatasını kesin önler)
  const formatDateTime = (isoStr) => {
    const d = parseServerUtcDate(isoStr);
    if (!d) return { full: '—', relative: '' };
    const full = d.toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const diffMs = Math.max(0, Date.now() - d.getTime());
    const diffMins = Math.floor(diffMs / 60000);
    let relative = '';
    if (diffMins < 1) relative = 'Az önce';
    else if (diffMins < 60) relative = `${diffMins} dk önce`;
    else if (diffMins < 1440) relative = `${Math.floor(diffMins / 60)} saat önce`;
    else relative = `${Math.floor(diffMins / 1440)} gün önce`;
    return { full, relative };
  };

  // 1. ADIM: Bot / Önizleme Taramalarından Arındırılmış & Tarih Filtresinden Geçen Sinyaller
  const dateFilteredSignals = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const seenIpMinute = new Set();

    return signals.filter(s => {
      const ipStr = String(s.ip_address || '');
      // Facebook / Meta link önizleme robotu IP'lerini (66.220.149.x vb.) filtrele
      if (
        ipStr.startsWith('66.220.14') ||
        ipStr.startsWith('66.220.15') ||
        ipStr.startsWith('173.252.') ||
        ipStr.startsWith('69.63.17') ||
        ipStr.startsWith('69.171.')
      ) {
        return false;
      }

      // Aynı IP'den aynı dakikada çift tetiklenmiş 3 sn'lik mükerrer açılış kaydını gizle
      const minKey = ipStr && s.created_at ? `${ipStr}_${String(s.created_at).slice(0, 16)}` : '';
      if (minKey && s.source === 'whatsapp_personalized_link' && (s.duration_seconds || 0) <= 5 && seenIpMinute.has(minKey)) {
        return false;
      }
      if (minKey) seenIpMinute.add(minKey);

      if (dateRange === 'all') return true;
      const d = parseServerUtcDate(s.created_at);
      if (!d) return true;
      const t = d.getTime();
      if (dateRange === 'today') return t >= startOfToday;
      if (dateRange === 'yesterday') return t >= startOfYesterday && t < startOfToday;
      if (dateRange === '7d') return t >= Date.now() - 7 * 86400000;
      if (dateRange === '30d') return t >= Date.now() - 30 * 86400000;
      return true;
    });
  }, [signals, dateRange]);

  // 2. ADIM: ÇOK ANAHTARLI AKILLI TEKİLLEŞTİRME MOTORU
  // (Aynı müşterinin farklı günlerdeki, farklı linklerdeki veya farklı telefon/ID ile yaptığı tüm girişlerini TEK satırda birleştirir)
  const groupedVisitors = useMemo(() => {
    const custIdToCanonical = {};
    const phoneToCanonical = {};
    const nameToCanonical = {};
    const ipDayToCanonical = {};

    // 1. Geçiş: Kimliği belli sinyallerden Kanonik Müşteri Anahtarı (canonicalKey) haritası oluştur
    dateFilteredSignals.forEach(s => {
      const custId = s.matched_customer_id ? String(s.matched_customer_id) : '';
      const pKey = normalizePhoneKey(s.phone);
      const rawCleanName = cleanVisitorName(s.matched_customer_name || s.company_name);
      const nameKey = !isGenericVisitorName(rawCleanName) ? rawCleanName.toLowerCase().replace(/\s+/g, ' ') : '';
      const dayStr = s.created_at ? String(s.created_at).slice(0, 10) : 'today';
      const ipDayKey = s.ip_address ? `${s.ip_address}_${dayStr}` : '';

      if (!custId && !pKey && !nameKey) return;

      // Mevcut eşleşmiş bir canonicalKey var mı kontrol et
      const existingKey =
        (nameKey && nameToCanonical[nameKey]) ||
        (pKey && phoneToCanonical[pKey]) ||
        (custId && custIdToCanonical[custId]) ||
        (nameKey ? `id_name_${nameKey}` : pKey ? `id_phone_${pKey}` : `id_cust_${custId}`);

      if (nameKey) nameToCanonical[nameKey] = existingKey;
      if (pKey) phoneToCanonical[pKey] = existingKey;
      if (custId) custIdToCanonical[custId] = existingKey;
      if (ipDayKey && !ipDayToCanonical[ipDayKey]) {
        ipDayToCanonical[ipDayKey] = existingKey;
      }
    });

    const groupsMap = new Map();

    // 2. Geçiş: Tüm sinyalleri kanonik müşteri profilinde topla
    dateFilteredSignals.forEach(s => {
      const custId = s.matched_customer_id ? String(s.matched_customer_id) : '';
      const pKey = normalizePhoneKey(s.phone);
      const rawCleanName = cleanVisitorName(s.matched_customer_name || s.company_name);
      const nameKey = !isGenericVisitorName(rawCleanName) ? rawCleanName.toLowerCase().replace(/\s+/g, ' ') : '';
      const dayStr = s.created_at ? String(s.created_at).slice(0, 10) : 'today';
      const ipDayKey = s.ip_address ? `${s.ip_address}_${dayStr}` : '';

      const visitorKey =
        (nameKey && nameToCanonical[nameKey]) ||
        (pKey && phoneToCanonical[pKey]) ||
        (custId && custIdToCanonical[custId]) ||
        (ipDayKey && ipDayToCanonical[ipDayKey]) ||
        (ipDayKey ? `anon_ip_${ipDayKey}` : `anon_sig_${s.id}`);

      if (!groupsMap.has(visitorKey)) {
        groupsMap.set(visitorKey, {
          visitorKey,
          primarySignal: s,
          id: s.id,
          company_name: !isGenericVisitorName(rawCleanName) ? rawCleanName : 'Anonim Katalog Ziyaretçisi',
          matched_customer_id: s.matched_customer_id || null,
          matched_customer_name: s.matched_customer_name || null,
          phone: s.phone ? formatTurkishPhone(s.phone) : null,
          phonesSet: new Set(s.phone ? [formatTurkishPhone(s.phone)] : []),
          city: s.city || 'Samsun',
          district: s.district || null,
          ip_address: s.ip_address || null,
          source: s.source || 'public_pricing_catalog',
          sourcesSet: new Set([s.source || 'public_pricing_catalog']),
          visitDaysSet: new Set([dayStr]),
          modelsSet: new Set(),
          campaignsSet: new Set(),
          queriesSet: new Set(),
          notesList: [],
          events: [],
          total_duration_seconds: 0,
          max_scroll_depth: 0,
          intent_score: s.intent_score || 80,
          intent_level: s.intent_level || 'high',
          status: s.status || 'new',
          first_seen_at: s.created_at,
          last_seen_at: s.created_at
        });
      }

      const grp = groupsMap.get(visitorKey);
      grp.events.push(s);
      grp.visitDaysSet.add(dayStr);

      if (!isGenericVisitorName(rawCleanName) && isGenericVisitorName(grp.company_name)) {
        grp.company_name = rawCleanName;
      }
      if (s.phone) {
        const fmtPhone = formatTurkishPhone(s.phone);
        grp.phonesSet.add(fmtPhone);
        if (!grp.phone) grp.phone = fmtPhone;
      }
      if (!grp.matched_customer_id && s.matched_customer_id) {
        grp.matched_customer_id = s.matched_customer_id;
      }
      if (s.status === 'converted' || s.matched_customer_id) {
        grp.status = 'converted';
      }
      if (s.city && (!grp.city || grp.city === 'Samsun')) {
        grp.city = s.city;
        if (s.district) grp.district = s.district;
      }
      if (s.source) {
        grp.sourcesSet.add(s.source);
      }
      if (s.target_model) {
        grp.modelsSet.add(s.target_model);
      }
      if (s.target_campaign) {
        grp.campaignsSet.add(s.target_campaign);
      }
      if (s.search_query) {
        grp.queriesSet.add(s.search_query);
      }
      if (s.notes && !grp.notesList.includes(s.notes)) {
        grp.notesList.push(s.notes);
      }

      const safeDur = s.duration_seconds
        ? (s.duration_seconds > 540 ? (45 + (s.duration_seconds % 95)) : s.duration_seconds)
        : 20;
      grp.total_duration_seconds += safeDur;
      grp.max_scroll_depth = Math.max(grp.max_scroll_depth, s.scroll_depth || 75);

      if ((s.intent_score || 0) > grp.intent_score) {
        grp.intent_score = s.intent_score;
      }
      if (s.intent_level === 'very_high' || grp.intent_score >= 90) {
        grp.intent_level = 'very_high';
      }

      if (s.created_at) {
        if (!grp.last_seen_at || new Date(s.created_at) > new Date(grp.last_seen_at)) {
          grp.last_seen_at = s.created_at;
        }
        if (!grp.first_seen_at || new Date(s.created_at) < new Date(grp.first_seen_at)) {
          grp.first_seen_at = s.created_at;
        }
      }
    });

    // Diziye çevir, akıllı sınıflandırmayı uygula ve sırala
    return Array.from(groupsMap.values()).map(grp => {
      const classified = classifyVisitorSignals(grp.events);
      const phonesList = Array.from(grp.phonesSet);
      const allPhonesText = phonesList.join(' / ');
      const sourcesList = Array.from(grp.sourcesSet);
      const isIdentified = Boolean(phonesList.length > 0 || grp.matched_customer_id || !isGenericVisitorName(grp.company_name));

      // Telefonu var ama ismi hala genel ise "Kayıtlı Müşteri (05XX...)" olarak adlandır
      let finalDisplayName = grp.company_name;
      if (isGenericVisitorName(finalDisplayName)) {
        finalDisplayName = phonesList.length > 0
          ? `Numarası Kayıtlı Müşteri`
          : 'Anonim Katalog Ziyaretçisi';
      }

      const hasMeaningfulAction =
        classified.budgetList.length > 0 ||
        classified.realModelsList.length > 0 ||
        classified.actionsList.some(a => !a.includes('Kataloğunu İnceledi')) ||
        grp.events.length >= 2;

      const hasHighAction =
        (isIdentified && hasMeaningfulAction) ||
        classified.budgetList.length > 0 ||
        classified.actionsList.some(a => a.includes('WhatsApp') || a.includes('Teklif') || a.includes('Takas') || a.includes('Peşinat') || a.includes('Kredi') || a.includes('Muhasebe')) ||
        grp.events.length >= 3;

      const srcMeta = getSourceMeta(grp.source, `${Array.from(grp.campaignsSet).join(' ')} ${grp.notesList.join(' ')}`);

      // Öncelik Etiketi
      let priorityBadge = '👀 Katalog İnceleme';
      if (phonesList.length > 0 && hasHighAction) {
        priorityBadge = '🔥 Çok Sıcak (Hemen Ara)';
      } else if (phonesList.length > 0) {
        priorityBadge = '📞 Telefonu Belli Müşteri';
      } else if (isIdentified) {
        priorityBadge = '🏢 İsim / Firma Belli';
      } else if (hasMeaningfulAction) {
        priorityBadge = '⚡ Numarasız Ama Ciddi İnceleme';
      }

      return {
        ...grp,
        company_name: finalDisplayName,
        phone: phonesList[0] || null,
        allPhonesText: allPhonesText || '—',
        visitDaysCount: grp.visitDaysSet.size,
        channelLabel: srcMeta.short,
        channelMeta: srcMeta,
        priorityBadge,
        modelsList: classified.realModelsList.length > 0 ? classified.realModelsList : ['Genel Fiyat Listesi'],
        realModelsList: classified.realModelsList,
        displayModel: classified.displayModel,
        campaignsList: classified.budgetList,
        displayBudget: classified.displayBudget,
        queriesList: classified.actionsList,
        displayActions: classified.displayActions,
        sourcesList,
        target_model: classified.displayModel,
        target_campaign: classified.displayBudget,
        search_query: classified.displayActions,
        duration_seconds: grp.total_duration_seconds,
        scroll_depth: grp.max_scroll_depth,
        created_at: grp.last_seen_at,
        notes: grp.notesList[0] || null,
        eventCount: grp.events.length,
        isIdentified,
        hasMeaningfulAction,
        hasHighAction,
        isConverted: grp.status === 'converted' || Boolean(grp.matched_customer_id)
      };
    }).sort((a, b) => new Date(b.last_seen_at || 0) - new Date(a.last_seen_at || 0));
  }, [dateFilteredSignals]);

  // 3. ADIM: Raporlama Özeti Metrikleri (Sadece Gerçek Modeller ve Temiz Kanallar)
  const reportAnalytics = useMemo(() => {
    const totalRaw = dateFilteredSignals.length;
    const totalUnique = groupedVisitors.length;
    const identifiedCount = groupedVisitors.filter(v => v.isIdentified).length;
    const withPhoneCount = groupedVisitors.filter(v => Boolean(v.phone)).length;
    const highIntentCount = groupedVisitors.filter(v => v.hasHighAction).length;
    const repeatVisitorCount = groupedVisitors.filter(v => v.eventCount >= 2).length;
    const anonymousCount = groupedVisitors.filter(v => !v.isIdentified).length;
    const convertedCount = groupedVisitors.filter(v => v.isConverted).length;

    const totalSec = groupedVisitors.reduce((acc, v) => acc + (v.total_duration_seconds || 0), 0);
    const avgDurationSec = totalUnique > 0 ? Math.round(totalSec / totalUnique) : 0;

    // Araç Modeli Bazlı Dağılım (Peşinat rakamlarından arındırılmış gerçek modeller)
    const modelMap = {};
    groupedVisitors.forEach(v => {
      const models = v.realModelsList.length > 0 ? v.realModelsList : ['Genel Fiyat Listesi (Tüm Araçlar)'];
      models.forEach(m => {
        const cleanM = m.trim();
        if (!modelMap[cleanM]) {
          modelMap[cleanM] = { model: cleanM, uniqueVisitors: 0, totalClicks: 0, withPhone: 0 };
        }
        modelMap[cleanM].uniqueVisitors += 1;
        modelMap[cleanM].totalClicks += v.eventCount;
        if (v.phone) modelMap[cleanM].withPhone += 1;
      });
    });
    const topModels = Object.values(modelMap)
      .sort((a, b) => b.uniqueVisitors - a.uniqueVisitors || b.totalClicks - a.totalClicks)
      .slice(0, 8);

    // Giriş Kanalı Bazlı Dağılım
    const channelMap = {};
    groupedVisitors.forEach(v => {
      const chLabel = v.channelLabel || 'Dijital Katalog';
      if (!channelMap[chLabel]) {
        channelMap[chLabel] = {
          sourceKey: chLabel,
          label: chLabel,
          color: v.channelMeta?.color || '#60a5fa',
          uniqueVisitors: 0,
          identified: 0,
          totalEvents: 0
        };
      }
      channelMap[chLabel].uniqueVisitors += 1;
      if (v.isIdentified) channelMap[chLabel].identified += 1;
      channelMap[chLabel].totalEvents += v.eventCount;
    });
    const channelBreakdown = Object.values(channelMap).sort((a, b) => b.uniqueVisitors - a.uniqueVisitors);

    // İl Dağılımı
    const cityMap = {};
    groupedVisitors.forEach(v => {
      const c = (v.city || 'Samsun').trim();
      cityMap[c] = (cityMap[c] || 0) + 1;
    });
    const cityBreakdown = Object.entries(cityMap)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalRaw,
      totalUnique,
      identifiedCount,
      withPhoneCount,
      highIntentCount,
      repeatVisitorCount,
      anonymousCount,
      convertedCount,
      avgDurationSec,
      topModels,
      channelBreakdown,
      cityBreakdown
    };
  }, [dateFilteredSignals, groupedVisitors]);

  // 4. ADIM: Aktif Filtrelere Göre Gösterilecek Liste
  const displayedItems = useMemo(() => {
    const baseList = viewMode === 'grouped'
      ? groupedVisitors.map(g => ({
          ...g,
          clickedLinkInfo: describeClickedLink(g.primarySignal || g)
        }))
      : dateFilteredSignals.map(s => {
          const classified = classifyVisitorSignals([s]);
          const srcMeta = getSourceMeta(s.source, `${s.target_campaign || ''} ${s.notes || ''}`, s.page_url || '');
          const cleanedName = cleanVisitorName(s.matched_customer_name || s.company_name);
          const isId = Boolean(s.phone || s.matched_customer_id || !isGenericVisitorName(cleanedName));
          const linkInfo = describeClickedLink(s);
          return {
            ...s,
            visitorKey: `raw_${s.id}`,
            company_name: !isGenericVisitorName(cleanedName) ? cleanedName : (s.phone ? 'Numarası Kayıtlı Müşteri' : 'Anonim Link Ziyaretçisi'),
            phone: s.phone ? formatTurkishPhone(s.phone) : null,
            allPhonesText: s.phone ? formatTurkishPhone(s.phone) : '—',
            visitDaysCount: 1,
            channelLabel: srcMeta.short,
            channelMeta: srcMeta,
            clickedLinkInfo: linkInfo,
            priorityBadge: s.phone ? '📞 Telefonu Belli' : (isId ? '🏢 Firma Belli' : '👀 Link Girişi'),
            modelsList: classified.realModelsList.length > 0 ? classified.realModelsList : ['Genel Fiyat Listesi'],
            realModelsList: classified.realModelsList,
            displayModel: classified.displayModel,
            campaignsList: classified.budgetList,
            displayBudget: classified.displayBudget,
            queriesList: classified.actionsList,
            displayActions: classified.displayActions,
            sourcesList: s.source ? [s.source] : [],
            eventCount: 1,
            events: [s],
            isIdentified: isId,
            hasMeaningfulAction: classified.budgetList.length > 0 || classified.realModelsList.length > 0,
            hasHighAction: (s.intent_score || 0) >= 90,
            isConverted: s.status === 'converted' || Boolean(s.matched_customer_id)
          };
        });

    return baseList.filter(item => {
      if (visitorSegment === 'identified' && !item.isIdentified) return false;
      if (visitorSegment === 'with_phone' && !item.phone) return false;
      if (visitorSegment === 'high_intent' && !item.hasHighAction) return false;
      if (visitorSegment === 'repeat' && item.eventCount < 2) return false;
      if (visitorSegment === 'anonymous' && item.isIdentified) return false;
      if (visitorSegment === 'converted' && !item.isConverted) return false;

      if (sourceFilter !== 'all') {
        const chText = `${item.channelLabel || ''} ${item.source || ''} ${item.clickedLinkInfo?.linkTitle || ''} ${item.page_url || ''}`.toLowerCase();
        if (sourceFilter === 'whatsapp_all') {
          if (!chText.includes('whatsapp') && !chText.includes('wa_')) return false;
        } else if (sourceFilter === 'partner_only') {
          if (!item.clickedLinkInfo?.isPartner && !chText.includes('oda') && !chText.includes('protokol') && !chText.includes('partner=')) return false;
        } else if (sourceFilter === 'wa_durum_only') {
          if (!chText.includes('durum')) return false;
        } else if (sourceFilter === 'personal_only') {
          if (!chText.includes('özel') && !chText.includes('proforma') && !chText.includes('crm_existing')) return false;
        } else if (item.channelLabel !== sourceFilter && !item.sourcesList.includes(sourceFilter) && item.source !== sourceFilter) {
          return false;
        }
      }

      if (selectedCity !== 'all' && item.city !== selectedCity) return false;

      if (selectedModelFilter) {
        const matchModel = item.modelsList.includes(selectedModelFilter) || item.displayModel.includes(selectedModelFilter);
        if (!matchModel) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const textMatch =
          (item.company_name && item.company_name.toLowerCase().includes(q)) ||
          (item.allPhonesText && item.allPhonesText.toLowerCase().includes(q)) ||
          (item.displayModel && item.displayModel.toLowerCase().includes(q)) ||
          (item.displayBudget && item.displayBudget.toLowerCase().includes(q)) ||
          (item.displayActions && item.displayActions.toLowerCase().includes(q)) ||
          (item.channelLabel && item.channelLabel.toLowerCase().includes(q)) ||
          (item.clickedLinkInfo?.linkTitle && item.clickedLinkInfo.linkTitle.toLowerCase().includes(q)) ||
          (item.page_url && item.page_url.toLowerCase().includes(q));
        if (!textMatch) return false;
      }

      return true;
    });
  }, [viewMode, groupedVisitors, dateFilteredSignals, visitorSegment, sourceFilter, selectedCity, selectedModelFilter, searchQuery]);

  // Şehirler listesi
  const uniqueCities = useMemo(() => {
    const set = new Set();
    signals.forEach(s => {
      if (s.city) set.add(s.city);
    });
    return Array.from(set);
  }, [signals]);

  // CRM Lead'e Aktar
  const handleConvertToLead = async (signal) => {
    try {
      setActionLoading(signal.id);
      const res = await discoveryApi.convertIntentToLead(signal.id);
      toast.success(res.data.message || 'Müşteri CRM satış adaylarına eklendi!');
      setSignals(prev =>
        prev.map(s => (s.id === signal.id ? { ...s, status: 'converted', matched_customer_id: res.data.customer_id } : s))
      );
      if (res.data.customer_id) {
        toast((t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Müşteri kartına gitmek ister misiniz?</span>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate(`/customers/${res.data.customer_id}`);
              }}
              style={{
                background: 'var(--accent-blue)',
                color: '#fff',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Görüntüle
            </button>
          </div>
        ), { duration: 6000 });
      }
    } catch (err) {
      console.error(err);
      toast.error('Adaya dönüştürülürken bir hata oluştu');
    } finally {
      setActionLoading(null);
    }
  };

  // Doğrudan WhatsApp Mesajı Gönder
  const handleOpenWhatsApp = (signal) => {
    if (!signal.phone) {
      toast.error('Telefon numarası bulunamadı');
      return;
    }
    const cleanPhone = signal.phone.replace(/\D/g, '');
    const model = (signal.realModelsList && signal.realModelsList[0]) || 'IVECO 2026 Ticari Araç';
    const message = `Merhaba, IVECO ERC Samsun Otomotiv Satış Sorumlusu Can Murat olarak ulaşıyorum (0544 622 59 31). Dijital kataloğumuzda incelediğiniz ${model} ve Kasım 2026 dönemine özel %0 faizli / ödemesiz ticari finansman seçeneklerimiz hakkında firmanıza özel ödeme tablosunu paylaşmak isterim.`;
    const url = `https://wa.me/90${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Akıllı Link Üret
  const handleGenerateLink = () => {
    const slug = generatorModel.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const compSlug = generatorCompany.trim() ? encodeURIComponent(generatorCompany.trim().replace(/\s+/g, '_')) : 'kampanya_ziyaretci';
    const link = `${getPublicOrigin()}/campaigns/${slug}?utm_source=whatsapp&utm_medium=smart_link&camp=${generatorCampaign}&ref=muratonay&cust=${compSlug}`;
    setGeneratedLink(link);
    setCopiedLink(false);
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopiedLink(true);
    toast.success('Akıllı kampanya linki panoya kopyalandı!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // ── AKILLI EXCEL (.XLSX) RAPORU OLUŞTURUCU (3 AYRI SEKME, GENİŞ SÜTUNLAR, BOZULMAYAN TELEFONLAR) ──
  const handleExportExcel = () => {
    if (!groupedVisitors || groupedVisitors.length === 0) {
      toast.error('Dışa aktarılacak ziyaretçi kaydı bulunamadı.');
      return;
    }

    const nowStr = new Date().toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const todayFile = new Date().toISOString().slice(0, 10);

    // 1. SEKME VERİSİ: Sadece Kimliği / Telefonu Belli Müşteriler (Öncelikli Arama Listesi)
    const identifiedVisitors = groupedVisitors.filter(v => v.isIdentified);
    // 3. SEKME VERİSİ: Anonim Ziyaretçiler (Önce bütçe/model hesaplayan ciddi anonimler, sonra hızlı bakıp çıkanlar)
    const anonymousVisitors = groupedVisitors
      .filter(v => !v.isIdentified)
      .sort((a, b) => (b.hasMeaningfulAction ? 1 : 0) - (a.hasMeaningfulAction ? 1 : 0) || b.eventCount - a.eventCount);

    // ── SAYFA 1: 1-Aranacak Musteriler ───────────────────────────────────────
    const sheet1Rows = [
      {
        height: 30,
        cells: [
          { v: 'IVECO ERC SAMSUN — NİYET RADARI: ARANACAK MÜŞTERİLER & KİMLİĞİ BELLİ ZİYARETÇİLER', s: 1 },
          { v: '', s: 1 }, { v: '', s: 1 }, { v: '', s: 1 }, { v: '', s: 1 }, { v: '', s: 1 }, { v: '', s: 1 }, { v: '', s: 1 }
        ]
      },
      {
        height: 22,
        cells: [
          {
            v: `Rapor Tarihi: ${nowStr}   |   Kimliği / Telefonu Belli: ${identifiedVisitors.length} Müşteri   |   Doğrudan Telefonu Olan: ${reportAnalytics.withPhoneCount} Kişi   |   (Anonim ziyaretçiler 3. sekmede ayrılmıştır)`,
            s: 2
          },
          { v: '', s: 2 }, { v: '', s: 2 }, { v: '', s: 2 }, { v: '', s: 2 }, { v: '', s: 2 }, { v: '', s: 2 }, { v: '', s: 2 }
        ]
      },
      {
        height: 26,
        cells: [
          { v: 'Öncelik Durumu', s: 3 },
          { v: 'Müşteri / Firma Adı', s: 3 },
          { v: 'Telefon Numarası', s: 3 },
          { v: 'İncelediği Araç Modeli', s: 3 },
          { v: 'Peşinat / Takas / Kredi Tercihi', s: 3 },
          { v: 'Müşteri Ne Yaptı? (Net Özet)', s: 3 },
          { v: 'Ziyaret & Süre', s: 3 },
          { v: 'Geliş Kanalı & Son Tarih', s: 3 }
        ]
      },
      ...identifiedVisitors.map((v, idx) => {
        const lastDateStr = v.last_seen_at ? formatDateTime(v.last_seen_at).full : '-';
        const visitSummary = v.visitDaysCount > 1
          ? `${v.visitDaysCount} Farklı Gün • ${v.eventCount} İşlem (${formatDuration(v.duration_seconds)})`
          : `${v.eventCount} İşlem (${formatDuration(v.duration_seconds)})`;
        const hasSpecialBudget = v.campaignsList && v.campaignsList.length > 0;
        const baseCellStyle = idx % 2 === 1 ? 13 : 4;

        return {
          height: 24,
          cells: [
            { v: v.priorityBadge, s: v.phone && v.hasHighAction ? 9 : 10 },
            { v: v.company_name, s: 5 },
            { v: v.allPhonesText, s: v.phone ? 6 : 11 },
            { v: v.displayModel, s: v.realModelsList.length > 0 ? 7 : baseCellStyle },
            { v: v.displayBudget, s: hasSpecialBudget ? 8 : baseCellStyle },
            { v: v.displayActions, s: baseCellStyle },
            { v: visitSummary, s: 11 },
            { v: `${v.channelLabel} (${lastDateStr})`, s: baseCellStyle }
          ]
        };
      })
    ];

    // ── SAYFA 2: 2-Yonetici ve Model Ozeti ───────────────────────────────────
    const sheet2Rows = [
      {
        height: 30,
        cells: [
          { v: 'IVECO ERC SAMSUN — YÖNETİCİ ÖZETİ, İNCELENEN MODELLER VE KANAL PERFORMANSI', s: 1 },
          { v: '', s: 1 }, { v: '', s: 1 }, { v: '', s: 1 }, { v: '', s: 1 }
        ]
      },
      {
        height: 22,
        cells: [
          { v: `Rapor Tarihi: ${nowStr}   |   Toplam Tekil Ziyaretçi: ${reportAnalytics.totalUnique} Kişi   |   Toplam Tıklama: ${reportAnalytics.totalRaw} Hareket`, s: 2 },
          { v: '', s: 2 }, { v: '', s: 2 }, { v: '', s: 2 }, { v: '', s: 2 }
        ]
      },
      { height: 14, cells: [] },
      {
        height: 25,
        cells: [
          { v: '1. GENEL MÜŞTERİ HUNİSİ ÖZETİ', s: 12 },
          { v: 'Kişi Sayısı', s: 12 },
          { v: 'Oran (%)', s: 12 },
          { v: 'Açıklama', s: 12 },
          { v: '', s: 12 }
        ]
      },
      {
        height: 22,
        cells: [
          { v: 'Toplam Tekil Ziyaretçi', s: 5 },
          { v: reportAnalytics.totalUnique, t: 'num', s: 11 },
          { v: '%100', s: 11 },
          { v: 'Aynı kişinin çoklu tıklamaları birleştirilmiş net kişi sayısı', s: 4 },
          { v: '', s: 4 }
        ]
      },
      {
        height: 22,
        cells: [
          { v: 'Kimliği / Telefonu Belli Müşteriler', s: 5 },
          { v: reportAnalytics.identifiedCount, t: 'num', s: 6 },
          { v: `%${reportAnalytics.totalUnique > 0 ? Math.round((reportAnalytics.identifiedCount / reportAnalytics.totalUnique) * 100) : 0}`, s: 6 },
          { v: `Doğrudan aranabilir (${reportAnalytics.withPhoneCount} telefon numarası kayıtlı)`, s: 4 },
          { v: '', s: 4 }
        ]
      },
      {
        height: 22,
        cells: [
          { v: 'Kredi / Peşinat / Takas Hesaplayan Sıcak Adaylar', s: 5 },
          { v: reportAnalytics.highIntentCount, t: 'num', s: 9 },
          { v: `%${reportAnalytics.totalUnique > 0 ? Math.round((reportAnalytics.highIntentCount / reportAnalytics.totalUnique) * 100) : 0}`, s: 9 },
          { v: 'Canlı peşinat sürgüsü, kredi planı veya WhatsApp butonu kullananlar', s: 4 },
          { v: '', s: 4 }
        ]
      },
      {
        height: 22,
        cells: [
          { v: 'Anonim Katalog Ziyaretçileri (Numarasız)', s: 5 },
          { v: reportAnalytics.anonymousCount, t: 'num', s: 11 },
          { v: `%${reportAnalytics.totalUnique > 0 ? Math.round((reportAnalytics.anonymousCount / reportAnalytics.totalUnique) * 100) : 0}`, s: 11 },
          { v: 'WhatsApp Durum / Grup linkinden girip henüz numara yazmayanlar', s: 4 },
          { v: '', s: 4 }
        ]
      },
      { height: 16, cells: [] },
      {
        height: 25,
        cells: [
          { v: '2. İNCELENEN ARAÇ MODELLERİ DAĞILIMI', s: 3 },
          { v: 'Bakan Tekil Kişi', s: 3 },
          { v: 'Toplam Tıklama', s: 3 },
          { v: 'Telefonu Belli Olan', s: 3 },
          { v: 'Durum Notu', s: 3 }
        ]
      },
      ...reportAnalytics.topModels.map(m => ({
        height: 22,
        cells: [
          { v: m.model, s: 7 },
          { v: m.uniqueVisitors, t: 'num', s: 11 },
          { v: m.totalClicks, t: 'num', s: 11 },
          { v: m.withPhone, t: 'num', s: m.withPhone > 0 ? 6 : 11 },
          { v: m.withPhone > 0 ? `${m.withPhone} müşterinin telefonu hazır` : 'Katalog üzerinden incelendi', s: 4 }
        ]
      })),
      { height: 16, cells: [] },
      {
        height: 25,
        cells: [
          { v: '3. GİRİŞ KANALI & PAYLAŞIM PERFORMANSI', s: 3 },
          { v: 'Gelen Tekil Kişi', s: 3 },
          { v: 'Kimliği Belli Olan', s: 3 },
          { v: 'Kimlik Dönüşüm Oranı', s: 3 },
          { v: 'Toplam Etkileşim', s: 3 }
        ]
      },
      ...reportAnalytics.channelBreakdown.map(ch => {
        const pct = ch.uniqueVisitors > 0 ? Math.round((ch.identified / ch.uniqueVisitors) * 100) : 0;
        return {
          height: 22,
          cells: [
            { v: ch.label, s: 5 },
            { v: ch.uniqueVisitors, t: 'num', s: 11 },
            { v: ch.identified, t: 'num', s: ch.identified > 0 ? 6 : 11 },
            { v: `%${pct}`, s: pct >= 50 ? 6 : 11 },
            { v: `${ch.totalEvents} İşlem`, s: 11 }
          ]
        };
      })
    ];

    // ── SAYFA 3: 3-Anonim Ziyaretciler ───────────────────────────────────────
    const sheet3Rows = [
      {
        height: 30,
        cells: [
          { v: 'ANONİM PORTAL ZİYARETÇİLERİ (HENÜZ NUMARA BIRAKMAYANLAR — ÖNCELİK SIRALI)', s: 1 },
          { v: '', s: 1 }, { v: '', s: 1 }, { v: '', s: 1 }, { v: '', s: 1 }, { v: '', s: 1 }
        ]
      },
      {
        height: 22,
        cells: [
          {
            v: `Toplam ${anonymousVisitors.length} Anonim Ziyaretçi   |   En üstte Peşinat/Kredi hesaplayan veya spesifik araç inceleyen ciddi ziyaretçiler yer alır.`,
            s: 2
          },
          { v: '', s: 2 }, { v: '', s: 2 }, { v: '', s: 2 }, { v: '', s: 2 }, { v: '', s: 2 }
        ]
      },
      {
        height: 26,
        cells: [
          { v: 'Ziyaretçi Tipi', s: 3 },
          { v: 'Geliş Kanalı', s: 3 },
          { v: 'İncelediği Araç Modeli', s: 3 },
          { v: 'Hesapladığı Peşinat / Kredi', s: 3 },
          { v: 'Yaptığı İşlem Özeti', s: 3 },
          { v: 'Ziyaret Tarihi & Süresi', s: 3 }
        ]
      },
      ...anonymousVisitors.map((v, idx) => {
        const lastDateStr = v.last_seen_at ? formatDateTime(v.last_seen_at).full : '-';
        const baseStyle = idx % 2 === 1 ? 13 : 4;
        return {
          height: 22,
          cells: [
            { v: v.hasMeaningfulAction ? '⚡ Ciddi İnceleme (Numarasız)' : '👀 Hızlı Katalog Bakışı', s: v.hasMeaningfulAction ? 9 : baseStyle },
            { v: v.channelLabel, s: 5 },
            { v: v.displayModel, s: v.realModelsList.length > 0 ? 7 : baseStyle },
            { v: v.displayBudget, s: v.campaignsList.length > 0 ? 8 : baseStyle },
            { v: v.displayActions, s: baseStyle },
            { v: `${lastDateStr} • ${v.eventCount} İşlem (${formatDuration(v.duration_seconds)})`, s: 11 }
          ]
        };
      })
    ];

    downloadStyledWorkbook(`IVECO_Niyet_Radari_Akilli_Rapor_${todayFile}.xlsx`, [
      {
        name: '1-Aranacak Musteriler',
        colWidths: [26, 28, 19, 30, 32, 42, 24, 30],
        rows: sheet1Rows,
        merges: ['A1:H1', 'A2:H2'],
        freezeRow: 3,
        autoFilterRef: `A3:H${Math.max(4, sheet1Rows.length)}`
      },
      {
        name: '2-Yonetici ve Model Ozeti',
        colWidths: [38, 18, 18, 22, 42],
        rows: sheet2Rows,
        merges: ['A1:E1', 'A2:E2']
      },
      {
        name: '3-Anonim Ziyaretciler',
        colWidths: [28, 24, 30, 32, 42, 28],
        rows: sheet3Rows,
        merges: ['A1:F1', 'A2:F2'],
        freezeRow: 3,
        autoFilterRef: `A3:F${Math.max(4, sheet3Rows.length)}`
      }
    ]);

    toast.success(`📊 Akıllı Excel Raporu (.xlsx) 3 ayrı sekme ve düzenlenmiş sütunlarla indirildi!`);
  };

  const toggleExpandVisitor = (key) => {
    setExpandedVisitorKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1440px', margin: '0 auto', color: 'var(--text-primary)' }}>
      {/* ── ÜST BAŞLIK & HIZLI AKSİYONLAR ──────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
              color: '#fff',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)'
            }}>
              <FiTarget size={22} />
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Niyet Radarı & Komple Link Girişleri
            </h1>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }}></span>
              Canlı Link Takibi Aktif ({dateFilteredSignals.length} Giriş)
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Paylaştığınız tüm linklere (Fiyat Listesi, Özel Kampanya, Oda/Kooperatif, WhatsApp Durum, Proforma) yapılan girişlerin tamamını tek ekranda sade ve net görün.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleExportExcel()}
            style={{
              background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
              color: '#fff',
              border: '1px solid rgba(45, 212, 191, 0.45)',
              borderRadius: '8px',
              padding: '9px 16px',
              fontWeight: 800,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)'
            }}
            title="3 Ayrı Sekmeli (1-Aranacak Müşteriler, 2-Yönetici Özeti, 3-Anonim Ziyaretçiler) Düzenli Excel (.xlsx) İndir"
          >
            <FiDownload size={16} />
            📊 Excel İndir (.xlsx)
          </button>

          <button
            onClick={() => {
              setIsLinkModalOpen(true);
              handleGenerateLink();
            }}
            style={{
              background: 'linear-gradient(135deg, #004B93 0%, #2b7de9 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 14px',
              fontWeight: 600,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(43, 125, 233, 0.35)'
            }}
          >
            <FiZap size={15} />
            Takip Linki Üret
          </button>

          <button
            onClick={() => setIsGuideVideoModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
              color: '#fff',
              border: '1px solid rgba(251, 191, 36, 0.45)',
              borderRadius: '8px',
              padding: '9px 14px',
              fontWeight: 800,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)'
            }}
            title="WhatsApp Durum için 16 saniyelik geçişli Dijital Katalog Kullanım Kılavuzu Videosu üret ve indir"
          >
            <FiVideo size={15} />
            🎬 WA Kılavuz Videosu
          </button>

          <button
            onClick={() => setIsStatusModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 14px',
              fontWeight: 700,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
            }}
          >
            <FiMessageSquare size={15} />
            WA Durum Paylaş
          </button>

          <button
            onClick={fetchData}
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '9px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.84rem'
            }}
            title="Yenile"
          >
            <FiRefreshCw size={15} className={loading ? 'loading-pulse' : ''} />
            Yenile
          </button>
        </div>
      </div>

      {/* ── BÜYÜK VE NET 2 ANA GÖRÜNÜM SEÇİCİ (VARSAYILAN: KOMPLE LİNK GİRİŞLERİ) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <button
          type="button"
          onClick={() => {
            setViewMode('raw');
            setLayoutMode('table');
          }}
          style={{
            background: viewMode === 'raw'
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(15, 23, 42, 0.9) 100%)'
              : 'var(--bg-card)',
            border: viewMode === 'raw' ? '2px solid #10b981' : '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '14px 18px',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            boxShadow: viewMode === 'raw' ? '0 4px 18px rgba(16, 185, 129, 0.18)' : 'none'
          }}
        >
          <div>
            <div style={{ fontSize: '1.02rem', fontWeight: 800, color: viewMode === 'raw' ? '#34d399' : 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔗 1. Komple Link Girişleri (Tüm Kayıtlar)
              {viewMode === 'raw' && (
                <span style={{ background: '#10b981', color: '#052e16', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 900 }}>
                  AÇIK
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.79rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Hiçbir giriş gizlenmez; atılan linklere yapılan tüm girişleri saat saat alt alta gösterir.
            </div>
          </div>
          <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#34d399' }}>{dateFilteredSignals.length}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Toplam Giriş</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setViewMode('grouped');
            setLayoutMode('table');
          }}
          style={{
            background: viewMode === 'grouped'
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.22) 0%, rgba(15, 23, 42, 0.9) 100%)'
              : 'var(--bg-card)',
            border: viewMode === 'grouped' ? '2px solid #3b82f6' : '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '14px 18px',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            boxShadow: viewMode === 'grouped' ? '0 4px 18px rgba(59, 130, 246, 0.18)' : 'none'
          }}
        >
          <div>
            <div style={{ fontSize: '1.02rem', fontWeight: 800, color: viewMode === 'grouped' ? '#60a5fa' : 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              👥 2. Kişi Bazlı Birleştirilmiş Özet
              {viewMode === 'grouped' && (
                <span style={{ background: '#3b82f6', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 900 }}>
                  AÇIK
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.79rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Aynı müşterinin farklı zamanlardaki çoklu tıklamalarını tek müşteri satırında birleştirir.
            </div>
          </div>
          <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#60a5fa' }}>{groupedVisitors.length}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Tekil Kişi</div>
          </div>
        </button>
      </div>

      {/* ── TEK SATIRLIK SADE HIZLI FİLTRE & ARAMA KUTUSU ───────────────── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '14px 16px',
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Üst Satır: Hızlı Kanal / Müşteri Filtre Butonları */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted)', marginRight: '4px' }}>
              HIZLI FİLTRE:
            </span>
            {[
              {
                id: 'all_entries',
                label: `🌐 Komple Tümü (${viewMode === 'raw' ? dateFilteredSignals.length : groupedVisitors.length})`,
                active: visitorSegment === 'all' && sourceFilter === 'all',
                color: '#10b981',
                onClick: () => { setVisitorSegment('all'); setSourceFilter('all'); setSelectedModelFilter(''); }
              },
              {
                id: 'identified_only',
                label: `📞 İsim / Telefonu Belli Olanlar (${reportAnalytics.identifiedCount} Kişi)`,
                active: visitorSegment === 'identified' && sourceFilter === 'all',
                color: '#059669',
                onClick: () => { setVisitorSegment('identified'); setSourceFilter('all'); }
              },
              {
                id: 'partner_links',
                label: `🏛️ Özel Kampanya / Oda Linkleri`,
                active: sourceFilter === 'partner_only',
                color: '#f59e0b',
                onClick: () => { setVisitorSegment('all'); setSourceFilter(sourceFilter === 'partner_only' ? 'all' : 'partner_only'); }
              },
              {
                id: 'wa_durum_links',
                label: `📲 WhatsApp Durum Girişleri`,
                active: sourceFilter === 'wa_durum_only',
                color: '#34d399',
                onClick: () => { setVisitorSegment('all'); setSourceFilter(sourceFilter === 'wa_durum_only' ? 'all' : 'wa_durum_only'); }
              },
              {
                id: 'personal_links',
                label: `👑 Kişiye Özel / Proforma Linkler`,
                active: sourceFilter === 'personal_only',
                color: '#38bdf8',
                onClick: () => { setVisitorSegment('all'); setSourceFilter(sourceFilter === 'personal_only' ? 'all' : 'personal_only'); }
              },
              {
                id: 'anonymous_only',
                label: `🕵️ Numarasız (Anonim) Girişler`,
                active: visitorSegment === 'anonymous' && sourceFilter === 'all',
                color: '#64748b',
                onClick: () => { setVisitorSegment('anonymous'); setSourceFilter('all'); }
              }
            ].map(btn => (
              <button
                key={btn.id}
                type="button"
                onClick={btn.onClick}
                style={{
                  background: btn.active ? btn.color : 'var(--bg-secondary)',
                  color: btn.active ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: btn.active ? btn.color : 'var(--border-color)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: btn.active ? 800 : 600,
                  cursor: 'pointer'
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setLayoutMode(layoutMode === 'table' ? 'cards' : 'table')}
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '6px 11px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {layoutMode === 'table' ? <FiGrid size={13} /> : <FiList size={13} />}
              {layoutMode === 'table' ? 'Kart Görünümü' : 'Tablo Görünümü'}
            </button>

            <button
              type="button"
              onClick={() => setShowReportPanel(prev => !prev)}
              style={{
                background: showReportPanel ? 'rgba(59, 130, 246, 0.16)' : 'var(--bg-secondary)',
                color: showReportPanel ? '#60a5fa' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: showReportPanel ? 'rgba(59, 130, 246, 0.4)' : 'var(--border-color)',
                borderRadius: '8px',
                padding: '6px 11px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <FiBarChart2 size={13} />
              {showReportPanel ? 'Grafikleri Gizle' : '📊 Kanal & Araç Grafikleri'}
            </button>
          </div>
        </div>

        {/* Alt Satır: Tarih Seçimi + Arama Kutusu */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FiCalendar size={13} /> TARİH:
            </span>
            {[
              { id: 'all', label: 'Tüm Zamanlar' },
              { id: 'today', label: 'Bugün' },
              { id: 'yesterday', label: 'Dün' },
              { id: '7d', label: 'Son 7 Gün' },
              { id: '30d', label: 'Son 30 Gün' }
            ].map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDateRange(d.id)}
                style={{
                  background: dateRange === d.id ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                  color: dateRange === d.id ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: dateRange === d.id ? 'var(--accent-blue-light)' : 'var(--border-color)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.77rem',
                  fontWeight: dateRange === d.id ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', flex: '1', maxWidth: '340px', minWidth: '220px' }}>
            <FiSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Firma, telefon, oda adı veya araç ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '7px 12px 7px 32px',
                color: 'var(--text-primary)',
                fontSize: '0.82rem'
              }}
            />
          </div>
        </div>
      </div>

      {/* ── İSTEĞE BAĞLI YÖNETİCİ RAPORU & DAĞILIM PANELİ (VARSAYILAN GİZLİ) ── */}
      {showReportPanel && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '16px',
          marginBottom: '22px'
        }}>
          {/* SÜTUN 1: EN ÇOK İNCELENEN ARAÇ MODELLERİ RAPORU */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px 18px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <FiTruck style={{ color: '#3b82f6' }} />
                İncelenen Araç Modelleri Raporu
              </div>
              {selectedModelFilter && (
                <button
                  onClick={() => setSelectedModelFilter('')}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Filtreyi Kaldır ✕
                </button>
              )}
            </div>

            {reportAnalytics.topModels.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '16px 0' }}>Henüz model verisi yok.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {reportAnalytics.topModels.map((m, idx) => {
                  const maxVis = Math.max(...reportAnalytics.topModels.map(x => x.uniqueVisitors), 1);
                  const pct = Math.round((m.uniqueVisitors / maxVis) * 100);
                  const isSelected = selectedModelFilter === m.model;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedModelFilter(isSelected ? '' : m.model)}
                      style={{
                        background: isSelected ? 'rgba(59, 130, 246, 0.16)' : 'var(--bg-secondary)',
                        border: isSelected ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title="Bu modeli inceleyen müşterileri filtrelemek için tıklayın"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: isSelected ? '#60a5fa' : 'var(--text-primary)' }}>
                          {m.model}
                        </span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.74rem' }}>
                          <span style={{ color: '#60a5fa', fontWeight: 800 }}>{m.uniqueVisitors} Kişi</span>
                          <span style={{ color: 'var(--text-muted)' }}>({m.totalClicks} tıklama)</span>
                          {m.withPhone > 0 && (
                            <span style={{ color: '#34d399', fontWeight: 700 }}>📞 {m.withPhone}</span>
                          )}
                        </div>
                      </div>
                      <div style={{ height: '5px', background: 'rgba(148, 163, 184, 0.15)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)', borderRadius: '4px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SÜTUN 2: GİRİŞ KANALI / KAYNAK PERFORMANSI RAPORU */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px 18px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <FiBarChart2 style={{ color: '#10b981' }} />
                Giriş Kanalı & Kaynak Raporu
              </div>
              {sourceFilter !== 'all' && (
                <button
                  onClick={() => setSourceFilter('all')}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Tüm Kanallar ✕
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {reportAnalytics.channelBreakdown.map((ch, idx) => {
                const isSelected = sourceFilter === ch.sourceKey;
                const convPct = ch.uniqueVisitors > 0 ? Math.round((ch.identified / ch.uniqueVisitors) * 100) : 0;
                return (
                  <div
                    key={idx}
                    onClick={() => setSourceFilter(isSelected ? 'all' : ch.sourceKey)}
                    style={{
                      background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
                      border: isSelected ? '1px solid #10b981' : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '9px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    title="Sadece bu kanaldan gelenleri filtrelemek için tıklayın"
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: ch.color }}>
                        {ch.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Toplam {ch.totalEvents} hareket • Kimlik oranı: <strong>%{convPct}</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                        {ch.uniqueVisitors} Kişi
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>
                        {ch.identified} Tanımlı Müşteri
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Şehir / Bölge Dağılım Özeti */}
            {reportAnalytics.cityBreakdown.length > 0 && (
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  📍 İL / BÖLGE DAĞILIMI:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {reportAnalytics.cityBreakdown.map(cb => (
                    <button
                      key={cb.city}
                      onClick={() => setSelectedCity(selectedCity === cb.city ? 'all' : cb.city)}
                      style={{
                        background: selectedCity === cb.city ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                        color: selectedCity === cb.city ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {cb.city}: <strong>{cb.count}</strong>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── LİSTELEME ALANI (KOMPLE LİNK GİRİŞLERİ VEYA KİŞİ BAZLI TABLO) ──── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div className="loading-pulse" style={{ margin: '0 auto 16px' }}></div>
          <p>Link girişleri yükleniyor...</p>
        </div>
      ) : displayedItems.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '12px',
          padding: '48px 24px',
          textAlign: 'center',
          border: '1px dashed var(--border-color)'
        }}>
          <FiTarget size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>Seçili Filtreye Uygun Link Girişi Bulunamadı</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '14px' }}>
            Tüm link girişlerini görmek için aşağıdaki butona tıklayabilirsiniz.
          </p>
          <button
            onClick={() => {
              setVisitorSegment('all');
              setDateRange('all');
              setSourceFilter('all');
              setSelectedCity('all');
              setSelectedModelFilter('');
              setSearchQuery('');
            }}
            style={{
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🌐 Komple Tüm Link Girişlerini Göster ({dateFilteredSignals.length} Giriş)
          </button>
        </div>
      ) : layoutMode === 'table' ? (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{
            padding: '12px 18px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {viewMode === 'raw' ? (
                <>🔗 Komple Link Girişleri Listesi ({displayedItems.length} Giriş Gösteriliyor)</>
              ) : (
                <>👥 Kişi Bazlı Birleştirilmiş Özet Tablo ({displayedItems.length} Kişi Gösteriliyor)</>
              )}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              {viewMode === 'raw'
                ? 'En son yapılan link girişi en üstte yer alır • Hiçbir giriş gizlenmemiştir'
                : 'Aynı müşterinin farklı günlerdeki girişleri tek satırda birleştirilmiştir'}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', minWidth: '1040px' }}>
              <thead>
                <tr style={{ background: 'rgba(30, 58, 138, 0.35)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '11px 14px', fontWeight: 800, color: '#93c5fd', whiteSpace: 'nowrap' }}>Tarih & Saat</th>
                  <th style={{ padding: '11px 14px', fontWeight: 800, color: '#93c5fd' }}>Hangi Linke Girildi? (Kanal & Link)</th>
                  <th style={{ padding: '11px 14px', fontWeight: 800, color: '#93c5fd', whiteSpace: 'nowrap' }}>Giren Kişi / Firma & Konum</th>
                  <th style={{ padding: '11px 14px', fontWeight: 800, color: '#93c5fd', whiteSpace: 'nowrap' }}>Telefon Numarası</th>
                  <th style={{ padding: '11px 14px', fontWeight: 800, color: '#93c5fd' }}>Baktığı Araç & Ne Yaptı?</th>
                  <th style={{ padding: '11px 14px', fontWeight: 800, color: '#93c5fd', textAlign: 'right', whiteSpace: 'nowrap' }}>Hızlı İşlem</th>
                </tr>
              </thead>
              <tbody>
                {displayedItems.map((signal, idx) => {
                  const timeInfo = formatDateTime(signal.created_at);
                  const hasSpecialBudget = signal.campaignsList && signal.campaignsList.length > 0;
                  const hasSpecificVehicle = signal.realModelsList && signal.realModelsList.length > 0;
                  const srcMeta = signal.channelMeta || getSourceMeta(signal.source);
                  const linkInfo = signal.clickedLinkInfo || describeClickedLink(signal);

                  return (
                    <tr
                      key={signal.visitorKey}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        background: signal.phone
                          ? 'rgba(16, 185, 129, 0.04)'
                          : idx % 2 === 1
                          ? 'rgba(255,255,255,0.015)'
                          : 'transparent'
                      }}
                    >
                      {/* 1. SÜTUN: Tarih & Saat */}
                      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-heading)', fontSize: '0.82rem' }}>
                          {timeInfo.full}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                          {timeInfo.relative && (
                            <span style={{
                              background: timeInfo.relative.includes('Az önce') || timeInfo.relative.includes('dk')
                                ? 'rgba(16, 185, 129, 0.18)'
                                : 'rgba(148, 163, 184, 0.14)',
                              color: timeInfo.relative.includes('Az önce') || timeInfo.relative.includes('dk')
                                ? '#34d399'
                                : 'var(--text-muted)',
                              padding: '1px 7px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 700
                            }}>
                              🕒 {timeInfo.relative}
                            </span>
                          )}
                          <span style={{ fontSize: '0.71rem', color: 'var(--text-muted)' }}>
                            ⏱️ {formatDuration(signal.duration_seconds)}
                          </span>
                        </div>
                      </td>

                      {/* 2. SÜTUN: Hangi Linke Girildi? (Kanal & Link Detayı) */}
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            background: srcMeta.bg,
                            color: srcMeta.color,
                            border: `1px solid ${srcMeta.border}`
                          }}>
                            {signal.channelLabel}
                          </span>
                          {viewMode === 'grouped' && signal.eventCount > 1 && (
                            <span style={{
                              background: 'rgba(245, 158, 11, 0.16)',
                              color: '#fbbf24',
                              padding: '2px 7px',
                              borderRadius: '5px',
                              fontSize: '0.7rem',
                              fontWeight: 800
                            }}>
                              {signal.eventCount} Giriş
                            </span>
                          )}
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                          {linkInfo.linkTitle}
                        </div>
                        <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          🔗 {linkInfo.linkSub}
                        </div>
                      </td>

                      {/* 3. SÜTUN: Giren Kişi / Firma & Konum */}
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ fontWeight: 800, color: signal.isIdentified ? 'var(--text-heading)' : 'var(--text-secondary)', fontSize: '0.84rem' }}>
                          {signal.company_name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', fontSize: '0.72rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                          <span>📍 {signal.city || 'Samsun'}{signal.district ? ` / ${signal.district}` : ''}</span>
                          {signal.ip_address && <span>• IP: {signal.ip_address}</span>}
                          {signal.isConverted && (
                            <span style={{ color: '#a78bfa', fontWeight: 700 }}>• ✓ CRM Kayıtlı</span>
                          )}
                        </div>
                      </td>

                      {/* 4. SÜTUN: Telefon Numarası */}
                      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                        {signal.phone ? (
                          <span style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            display: 'inline-block'
                          }}>
                            📞 {signal.allPhonesText}
                          </span>
                        ) : (
                          <span style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.75rem',
                            background: 'rgba(148, 163, 184, 0.1)',
                            padding: '3px 8px',
                            borderRadius: '5px'
                          }}>
                            Numara Bırakmadı
                          </span>
                        )}
                      </td>

                      {/* 5. SÜTUN: Baktığı Araç & Linkte Ne Yaptı? */}
                      <td style={{ padding: '11px 14px', maxWidth: '330px' }}>
                        <div style={{
                          color: hasSpecificVehicle ? '#60a5fa' : 'var(--text-primary)',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          marginBottom: '3px'
                        }}>
                          🚛 {signal.displayModel}
                        </div>
                        {hasSpecialBudget && (
                          <div style={{
                            color: '#fbbf24',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            marginBottom: '3px'
                          }}>
                            💰 {signal.displayBudget}
                          </div>
                        )}
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', fontWeight: 600 }}>
                          {signal.displayActions}
                        </div>
                      </td>

                      {/* 6. SÜTUN: Hızlı İşlem */}
                      <td style={{ padding: '11px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          {signal.phone && (
                            <>
                              <a
                                href={`tel:${signal.phone.replace(/\s+/g, '')}`}
                                style={{
                                  background: 'rgba(16, 185, 129, 0.15)',
                                  color: '#34d399',
                                  border: '1px solid rgba(16, 185, 129, 0.35)',
                                  padding: '5px 9px',
                                  borderRadius: '6px',
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                  textDecoration: 'none'
                                }}
                                title="Hemen Ara"
                              >
                                📞 Ara
                              </a>
                              <button
                                onClick={() => handleOpenWhatsApp(signal)}
                                style={{
                                  background: '#25D366',
                                  color: '#fff',
                                  border: 'none',
                                  padding: '5px 9px',
                                  borderRadius: '6px',
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                  cursor: 'pointer'
                                }}
                                title="WhatsApp Mesajı Gönder"
                              >
                                💬 WA
                              </button>
                            </>
                          )}
                          {signal.matched_customer_id ? (
                            <button
                              onClick={() => navigate(`/customers/${signal.matched_customer_id}`)}
                              style={{
                                background: 'rgba(139, 92, 246, 0.16)',
                                color: '#c4b5fd',
                                border: '1px solid rgba(139, 92, 246, 0.35)',
                                padding: '5px 8px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '0.74rem',
                                cursor: 'pointer'
                              }}
                              title="CRM Müşteri Kartını Aç"
                            >
                              Kart ↗
                            </button>
                          ) : (
                            <button
                              onClick={() => handleConvertToLead(signal)}
                              disabled={actionLoading === signal.id}
                              style={{
                                background: 'rgba(59, 130, 246, 0.15)',
                                color: '#60a5fa',
                                border: '1px solid rgba(59, 130, 246, 0.35)',
                                padding: '5px 8px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '0.73rem',
                                cursor: 'pointer'
                              }}
                              title="CRM Müşteri Havuzuna Ekle"
                            >
                              + CRM
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayedItems.map((signal) => {
            const isVeryHot = signal.intent_level === 'very_high' || signal.intent_score >= 90 || signal.hasHighAction;
            const isConverted = signal.isConverted;
            const srcMeta = signal.channelMeta || getSourceMeta(signal.source);
            const timeInfo = formatDateTime(signal.created_at);
            const isExpanded = Boolean(expandedVisitorKeys[signal.visitorKey]);

            return (
              <div
                key={signal.visitorKey}
                style={{
                  background: 'var(--bg-card)',
                  border: signal.phone
                    ? '1px solid rgba(16, 185, 129, 0.45)'
                    : isVeryHot
                    ? '1px solid rgba(245, 158, 11, 0.4)'
                    : '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '18px 22px',
                  boxShadow: isVeryHot ? '0 4px 20px rgba(245, 158, 11, 0.07)' : 'var(--shadow-card)',
                  position: 'relative'
                }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(270px, 1.7fr) minmax(270px, 1.7fr) minmax(190px, 1fr) minmax(210px, 1.1fr)',
                  gap: '18px',
                  alignItems: 'center'
                }}>
                  {/* 1. SÜTUN: Ziyaretçi / Müşteri Kimliği, Tarih & Kanal */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{
                        background: srcMeta.bg,
                        color: srcMeta.color,
                        border: `1px solid ${srcMeta.border}`,
                        borderRadius: '5px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {srcMeta.short}
                      </span>

                      {signal.eventCount > 1 && (
                        <span style={{
                          background: 'rgba(245, 158, 11, 0.16)',
                          color: '#fbbf24',
                          border: '1px solid rgba(245, 158, 11, 0.35)',
                          borderRadius: '5px',
                          padding: '2px 8px',
                          fontSize: '11px',
                          fontWeight: 800
                        }}>
                          🔥 {signal.eventCount} Etkileşim
                        </span>
                      )}

                      {isConverted && (
                        <span style={{
                          background: 'rgba(139, 92, 246, 0.15)',
                          color: '#a78bfa',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          borderRadius: '5px',
                          padding: '2px 8px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          ✓ CRM Kayıtlı
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 5px', color: 'var(--text-heading)' }}>
                      {signal.company_name || 'Portal Ziyaretçisi'}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiMapPin size={13} style={{ color: 'var(--text-muted)' }} />
                        {signal.city || 'Samsun'}{signal.district ? ` / ${signal.district}` : ''}
                      </span>

                      {signal.phone ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: '#34d399',
                          background: 'rgba(16, 185, 129, 0.12)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: 800
                        }}>
                          <FiPhoneCall size={12} />
                          {signal.phone}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Numara bırakmadı
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      <span>🕒 {timeInfo.full} {timeInfo.relative ? `(${timeInfo.relative})` : ''}</span>
                      {signal.ip_address && <span>• IP: {signal.ip_address}</span>}
                    </div>
                  </div>

                  {/* 2. SÜTUN: İncelenen Araçlar, Aksiyonlar & Notlar */}
                  <div>
                    {/* İncelediği tüm araç modelleri */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '7px' }}>
                      {(signal.modelsList && signal.modelsList.length > 0 ? signal.modelsList : [signal.target_model || 'IVECO 2026 Katalog']).map((mdl, mIdx) => (
                        <span
                          key={mIdx}
                          style={{
                            background: 'rgba(43, 125, 233, 0.14)',
                            color: '#60a5fa',
                            border: '1px solid rgba(43, 125, 233, 0.3)',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FiTruck size={12} /> {mdl}
                        </span>
                      ))}

                      {(signal.campaignsList || []).slice(0, 2).map((cmp, cIdx) => (
                        <span
                          key={cIdx}
                          style={{
                            background: 'rgba(245, 158, 11, 0.12)',
                            color: '#fbbf24',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                        >
                          {cmp}
                        </span>
                      ))}
                    </div>

                    {/* Yaptığı Aksiyonlar / Arama Terimleri */}
                    {signal.queriesList && signal.queriesList.length > 0 && (
                      <div style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        marginBottom: '6px'
                      }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                          {signal.queriesList.length > 1 ? `Yaptığı İşlemler (${signal.queriesList.length} Adım)` : 'Son İşlem / Aksiyon'}
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fef08a' }}>
                          {signal.queriesList.slice(0, 3).join('  ➔  ')}
                        </div>
                      </div>
                    )}

                    {/* Notlar & Takas Fotoğrafları */}
                    {signal.notes && (() => {
                      const parts = String(signal.notes).split('||TRADEIN_PHOTOS_JSON:');
                      const cleanText = parts[0]?.trim();
                      let photosObj = null;
                      if (parts[1]) {
                        try {
                          photosObj = JSON.parse(parts[1]);
                        } catch {
                          photosObj = null;
                        }
                      }
                      const photoLabels = {
                        dis_gorunum: '1. Dıştan',
                        ic_gorunum: '2. İçten',
                        km_saati: '3. KM',
                        ruhsat: '4. Ruhsat'
                      };
                      return (
                        <div style={{ marginTop: '4px' }}>
                          {cleanText && (
                            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35, whiteSpace: 'pre-line' }}>
                              {cleanText}
                            </p>
                          )}
                          {photosObj && Object.keys(photosObj).length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                              {Object.entries(photosObj).map(([k, src]) => (
                                <a
                                  key={k}
                                  href={src}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    background: 'rgba(16, 185, 129, 0.12)',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    borderRadius: '6px',
                                    padding: '4px',
                                    textDecoration: 'none'
                                  }}
                                  title="Büyütmek için tıklayın"
                                >
                                  <img
                                    src={src}
                                    alt={photoLabels[k] || k}
                                    style={{ width: '54px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                  />
                                  <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 700, marginTop: '2px' }}>
                                    {photoLabels[k] || k}
                                  </span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* 3. SÜTUN: Davranış, Süre & Geçmiş Detayı Butonu */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '5px' }}>
                      <span style={{
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        color: isVeryHot ? '#ef4444' : '#f59e0b'
                      }}>
                        %{signal.intent_score || 85}
                      </span>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: isVeryHot ? '#ef4444' : '#f59e0b'
                      }}>
                        {isVeryHot ? 'Yüksek Öncelik' : 'Aktif İlgi'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiClock size={12} style={{ color: 'var(--text-muted)' }} />
                        Toplam Süre: <strong>{formatDuration(signal.duration_seconds)}</strong>
                      </div>
                      <div>
                        İnceleme: <strong>{signal.modelsList?.length || 1} Model / {signal.eventCount || 1} Adım</strong>
                      </div>
                    </div>

                    {signal.eventCount > 1 && (
                      <button
                        type="button"
                        onClick={() => toggleExpandVisitor(signal.visitorKey)}
                        style={{
                          marginTop: '7px',
                          background: 'rgba(59, 130, 246, 0.12)',
                          color: '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '6px',
                          padding: '4px 9px',
                          fontSize: '0.73rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {isExpanded ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
                        {isExpanded ? 'Geçmişi Gizle' : `🕒 Ziyaret Geçmişi (${signal.eventCount})`}
                      </button>
                    )}
                  </div>

                  {/* 4. SÜTUN: İletişim & CRM Aksiyon Butonları */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {signal.phone ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <a
                          href={`tel:${signal.phone.replace(/\s+/g, '')}`}
                          style={{
                            flex: 1,
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.35)',
                            borderRadius: '6px',
                            padding: '8px 10px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            textDecoration: 'none'
                          }}
                        >
                          <FiPhoneCall size={14} /> Hemen Ara
                        </a>

                        <button
                          onClick={() => handleOpenWhatsApp(signal)}
                          style={{
                            flex: 1,
                            background: 'rgba(34, 197, 94, 0.15)',
                            color: '#22c55e',
                            border: '1px solid rgba(34, 197, 94, 0.35)',
                            borderRadius: '6px',
                            padding: '8px 10px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            cursor: 'pointer'
                          }}
                        >
                          <FiMessageSquare size={14} /> WhatsApp
                        </button>
                      </div>
                    ) : (
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textAlign: 'center',
                        background: 'var(--bg-secondary)',
                        padding: '6px',
                        borderRadius: '6px'
                      }}>
                        Numara Henüz Girilmedi
                      </div>
                    )}

                    {!isConverted ? (
                      <button
                        onClick={() => handleConvertToLead(signal)}
                        disabled={actionLoading === signal.id}
                        style={{
                          background: 'linear-gradient(135deg, #004B93 0%, #2b7de9 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: actionLoading === signal.id ? 'not-allowed' : 'pointer',
                          boxShadow: '0 2px 8px rgba(0, 75, 147, 0.3)'
                        }}
                      >
                        {actionLoading === signal.id ? (
                          <>
                            <div className="loading-pulse" style={{ width: '14px', height: '14px' }}></div>
                            Aktarılıyor...
                          </>
                        ) : (
                          <>
                            <FiUserPlus size={14} /> CRM'e Lead Olarak Aktar
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(signal.matched_customer_id ? `/customers/${signal.matched_customer_id}` : '/pipeline')}
                        style={{
                          background: 'rgba(139, 92, 246, 0.15)',
                          color: '#a78bfa',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <FiExternalLink size={14} /> Müşteri Kartını Gör
                      </button>
                    )}
                  </div>
                </div>

                {/* AÇILIR ZİYARET GEÇMİŞİ (TIMELINE) */}
                {isExpanded && signal.events && signal.events.length > 1 && (
                  <div style={{
                    marginTop: '14px',
                    paddingTop: '12px',
                    borderTop: '1px dashed var(--border-color)',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    padding: '12px 14px'
                  }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#60a5fa', marginBottom: '8px' }}>
                      📋 Bu Ziyaretçinin Kronolojik Portal Hareketleri ({signal.events.length} Kayıt):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {signal.events.map((ev, eIdx) => {
                        const evTime = formatDateTime(ev.created_at);
                        return (
                          <div
                            key={ev.id || eIdx}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '140px 1fr 1fr 90px',
                              gap: '10px',
                              fontSize: '0.76rem',
                              padding: '6px 10px',
                              background: 'var(--bg-card)',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              alignItems: 'center'
                            }}
                          >
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{evTime.full}</span>
                            <span style={{ color: '#60a5fa', fontWeight: 700 }}>{ev.target_model || 'Genel Katalog'}</span>
                            <span style={{ color: '#fef08a' }}>{ev.search_query || ev.target_campaign || 'Sayfa İncelemesi'}</span>
                            <span style={{ color: 'var(--text-secondary)', textAlign: 'right' }}>{formatDuration(ev.duration_seconds)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── SMART TRACKING LINK GENERATOR MODAL ────────────────── */}
      {isLinkModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsLinkModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <FiX size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #004B93 0%, #2b7de9 100%)',
                color: '#fff',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FiZap size={20} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                Akıllı Kampanya Takip Linki Üretici
              </h2>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: 1.5 }}>
              Müşteriye WhatsApp veya SMS ile göndereceğiniz linki özelleştirin. Müşteri linke tıkladığı anda sistem IP, inceleme süresi ve arama niyetini bu radara canlı düşürür.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  HEDEF ARAÇ MODELİ
                </label>
                <select
                  value={generatorModel}
                  onChange={(e) => {
                    setGeneratorModel(e.target.value);
                    handleGenerateLink();
                  }}
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem'
                  }}
                >
                  <option value="Daily 35C16 Şasi">IVECO Daily 35C16 Şasi</option>
                  <option value="Daily 35S16 Panelvan">IVECO Daily 35S16 Panelvan</option>
                  <option value="Daily 70C / 72C Şasi">IVECO Daily 70C / 72C (7.2 Ton)</option>
                  <option value="Eurocargo ML150E21">IVECO Eurocargo 150E21</option>
                  <option value="S-Way 530 Çekici">IVECO S-Way 530 Çekici</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  KAMPANYA / FİNANSMAN SEÇENEĞİ
                </label>
                <select
                  value={generatorCampaign}
                  onChange={(e) => {
                    setGeneratorCampaign(e.target.value);
                    handleGenerateLink();
                  }}
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem'
                  }}
                >
                  <option value="kuveyt-turk-6-ay">Kuveyt Türk 6 Ay Ödemesiz - Bayi Katkılı</option>
                  <option value="albaraka-sifir-faiz">Albaraka Türk %0 Kâr Payı Kampanyası</option>
                  <option value="garanti-bbva-agir">Garanti BBVA Ağır Vasıta Çatı Matrisi</option>
                  <option value="tco-tasarruf">TCO Yakıt & Servis Tasarruf Aracı</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  FİRMA / MÜŞTERİ ADI (Opsiyonel Takip Etiketi)
                </label>
                <input
                  type="text"
                  placeholder="Örn: Sampa Lojistik, Temel Nakliyat..."
                  value={generatorCompany}
                  onChange={(e) => {
                    setGeneratorCompany(e.target.value);
                  }}
                  onBlur={handleGenerateLink}
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
            </div>

            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                ÜRETİLEN AKILLI İSTİHBARAT LİNKİ:
              </div>
              <div style={{
                fontSize: '0.82rem',
                color: '#60a5fa',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                lineHeight: 1.4
              }}>
                {generatedLink || `${getPublicOrigin()}/campaigns/daily-35c16`}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleCopyLink}
                style={{
                  flex: 1,
                  background: copiedLink ? '#10b981' : 'linear-gradient(135deg, #004B93 0%, #2b7de9 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                {copiedLink ? (
                  <>
                    <FiCheck size={18} /> Link Panoya Kopyalandı!
                  </>
                ) : (
                  <>
                    <FiCopy size={18} /> Takip Linkini Kopyala
                  </>
                )}
              </button>

              <button
                onClick={() => setIsLinkModalOpen(false)}
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WHATSAPP STATUS SHARING MODAL ────────────────────── */}
      {isStatusModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsStatusModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <FiX size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                background: '#22c55e',
                color: '#fff',
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(34, 197, 94, 0.4)'
              }}>
                <FiMessageSquare size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                  WhatsApp Durum Paylaşım Kartı
                </h2>
                <span style={{ fontSize: '0.78rem', color: '#4ade80' }}>
                  Akıllı Araç & Kredi Seçici Linki
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginBottom: '12px', lineHeight: 1.5 }}>
              Hem <strong>iPhone hem Android</strong> cihazlarda yeşil S-Way resimli kartı ve tıklanabilir linki koruyan kurumsal şablonlardan birini seçip paylaşın:
            </p>

            {(() => {
              const statusTemplates = [
                {
                  label: '📲 1. Senaryo: Canlı Kılavuz',
                  text: `📲 Peşinatınızı seçip 5 bankada 2026 IVECO taksit ve KDV planınızı canlı hesaplayın 👇\n${getPublicOrigin()}/fiyat-listesi?ref=wa_durum_kilavuz`
                },
                {
                  label: '🔄 2. Senaryo: Takas + Kredi',
                  text: `🔄 Aracınızı takasa verince sıfır IVECO ayda kaç TL'ye gelir? 1M TL %0 Faizle hesaplayın 👇\n${getPublicOrigin()}/fiyat-listesi?ref=wa_durum_takas`
                },
                {
                  label: '⏳ 3. Senaryo: 3-6 Ay Ödemesiz',
                  text: `⏳ Şimdi alın, ilk taksiti 3-6 ay sonra ödeyin: 5 bankada %0 faizli kredi tablosu 👇\n${getPublicOrigin()}/fiyat-listesi?ref=wa_durum_odemesiz`
                },
                {
                  label: '🧾 4. Senaryo: %20 KDV & İndirim',
                  text: `🧾 Vergi ödemek yerine filoyu yenileyin: %20 KDV avantajı ve 260 Bin TL nakit indirimi 👇\n${getPublicOrigin()}/fiyat-listesi?ref=wa_durum_kdv`
                },
                {
                  label: '⚖️ 5. Senaryo: 35C vs 70C Kantar',
                  text: `⚖️ B ehliyetli 35C mi, 4.8 tonluk 70C mi? Şasi ve net peşin fiyatları karşılaştırın 👇\n${getPublicOrigin()}/fiyat-listesi?ref=wa_durum_kantar`
                }
              ];
              const activeTpl = statusTemplates[statusTemplateIdx] || statusTemplates[0];

              return (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
                    {statusTemplates.map((tpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setStatusTemplateIdx(idx);
                          setCopiedStatusText(false);
                        }}
                        style={{
                          background: statusTemplateIdx === idx ? 'rgba(34, 197, 94, 0.2)' : 'var(--bg-primary)',
                          color: statusTemplateIdx === idx ? '#4ade80' : 'var(--text-secondary)',
                          border: statusTemplateIdx === idx ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>

                  <div style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '14px',
                    marginBottom: '16px',
                    fontSize: '0.84rem',
                    lineHeight: 1.55,
                    color: '#e2e8f0',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {activeTpl.text}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(activeTpl.text);
                        setCopiedStatusText(true);
                        toast.success('WhatsApp Durum metni ve linki panoya kopyalandı!');
                        setTimeout(() => setCopiedStatusText(false), 3000);
                      }}
                      style={{
                        flex: 1,
                        background: copiedStatusText ? '#10b981' : '#22c55e',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)'
                      }}
                    >
                      {copiedStatusText ? (
                        <>
                          <FiCheck size={18} /> Metin Kopyalandı!
                        </>
                      ) : (
                        <>
                          <FiCopy size={18} /> Seçili Şablonu & Linki Kopyala
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setIsStatusModalOpen(false);
                        setIsGuideVideoModalOpen(true);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <FiVideo size={16} /> 🎬 Kullanım Kılavuzu Videosu İndir
                    </button>

                    <button
                      onClick={() => window.open('https://web.whatsapp.com', '_blank')}
                      style={{
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#4ade80',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        cursor: 'pointer'
                      }}
                    >
                      WhatsApp Web'i Aç
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* 🎬 WhatsApp Durum 9:16 Dijital Katalog Kullanım Kılavuzu Video Stüdyosu */}
      <WhatsAppGuideVideoModal
        isOpen={isGuideVideoModalOpen}
        onClose={() => setIsGuideVideoModalOpen(false)}
      />
    </div>
  );
}
