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
  FiFilter
} from 'react-icons/fi';
import { getPublicOrigin } from '../../utils/publicUrl';

// Kaynak kanal etiket haritası
const SOURCE_META = {
  whatsapp_link: { label: 'WhatsApp VIP / Akıllı Link', short: 'WhatsApp VIP Link', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.35)' },
  wa_durum: { label: 'WhatsApp Durum Paylaşımı', short: 'WhatsApp Durum', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)' },
  whatsapp_durum: { label: 'WhatsApp Durum Paylaşımı', short: 'WhatsApp Durum', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)' },
  wa_grup: { label: 'WhatsApp Grup Paylaşımı', short: 'WhatsApp Grup', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)', border: 'rgba(45, 212, 191, 0.35)' },
  wa_musteri: { label: 'WhatsApp Müşteri Linki', short: 'WhatsApp Müşteri', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.35)' },
  wa_ozel: { label: 'WhatsApp Özel Teklif Linki', short: 'WhatsApp Özel', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.35)' },
  public_pricing_catalog: { label: '2026 Dijital Fiyat Kataloğu', short: 'Fiyat Kataloğu', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.35)' },
  smart_action_hub: { label: 'Portal Hızlı Teklif / Takas / Kredi', short: 'Hızlı İşlem Merkezi', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.35)' },
  crm_existing_customer: { label: 'Kayıtlı CRM Müşterisi', short: 'CRM Müşterisi', color: '#a78bfa', bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.35)' },
  google_search: { label: 'Google Organik Arama', short: 'Google Organik', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)' },
  google_ads: { label: 'Google Ads Kampanyası', short: 'Google Ads', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.35)' }
};

function getSourceMeta(source) {
  if (!source) return { label: 'Dijital Katalog', short: 'Dijital Katalog', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.3)' };
  return SOURCE_META[source] || {
    label: source,
    short: source,
    color: '#60a5fa',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.35)'
  };
}

function normalizePhoneKey(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

function isGenericVisitorName(name) {
  if (!name) return true;
  const lower = String(name).toLowerCase().trim();
  return (
    lower.includes('ziyaretçi') ||
    lower.includes('ziyaretci') ||
    lower === 'portal ziyaretçisi' ||
    lower === 'katalog ziyaretçisi' ||
    lower === 'mobil ziyaretçi' ||
    lower === 'tespit edilen kurumsal ziyaretçi'
  );
}

export default function IntentRadar() {
  const navigate = useNavigate();
  const [signals, setSignals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Sistematik Görünüm & Filtre State'leri
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' (Tekil Müşteri Özeti) | 'raw' (Tüm Ham Loglar)
  const [showReportPanel, setShowReportPanel] = useState(true);
  const [visitorSegment, setVisitorSegment] = useState('all'); // 'all' | 'identified' | 'high_intent' | 'repeat' | 'anonymous' | 'converted'
  const [dateRange, setDateRange] = useState('all'); // 'all' | 'today' | 'yesterday' | '7d' | '30d'
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedModelFilter, setSelectedModelFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedVisitorKeys, setExpandedVisitorKeys] = useState({});

  // Smart Link Generator & WhatsApp Status Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
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

  // Süre Formatlayıcı
  const formatDuration = (seconds) => {
    if (!seconds) return '—';
    const safeSeconds = seconds > 540 ? (45 + (seconds % 95)) : seconds;
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    if (mins > 0) return `${mins} dk ${secs} sn`;
    return `${secs} sn`;
  };

  // Tarih / Saat Formatlayıcı
  const formatDateTime = (isoStr) => {
    if (!isoStr) return { full: '—', relative: '' };
    const d = new Date(isoStr);
    if (Number.isNaN(d.getTime())) return { full: '—', relative: '' };
    const full = d.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    let relative = '';
    if (diffMins < 1) relative = 'Az önce';
    else if (diffMins < 60) relative = `${diffMins} dk önce`;
    else if (diffMins < 1440) relative = `${Math.floor(diffMins / 60)} saat önce`;
    else relative = `${Math.floor(diffMins / 1440)} gün önce`;
    return { full, relative };
  };

  // 1. ADIM: Tarih Filtresinden Geçen Ham Sinyaller
  const dateFilteredSignals = useMemo(() => {
    if (dateRange === 'all') return signals;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;

    return signals.filter(s => {
      if (!s.created_at) return true;
      const t = new Date(s.created_at).getTime();
      if (Number.isNaN(t)) return true;
      if (dateRange === 'today') return t >= startOfToday;
      if (dateRange === 'yesterday') return t >= startOfYesterday && t < startOfToday;
      if (dateRange === '7d') return t >= Date.now() - 7 * 86400000;
      if (dateRange === '30d') return t >= Date.now() - 30 * 86400000;
      return true;
    });
  }, [signals, dateRange]);

  // 2. ADIM: AKILLI TEKİLLEŞTİRME MOTORU (Aynı müşterinin tüm hareketlerini tek profilde birleştirir)
  const groupedVisitors = useMemo(() => {
    // Önce IP -> Telefon/Müşteri köprüsü kur (Aynı gün aynı IP'den önce numarasız girip sonra numara yazanları eşleştir)
    const ipDayToIdentity = {};
    dateFilteredSignals.forEach(s => {
      const pKey = normalizePhoneKey(s.phone);
      const dayStr = s.created_at ? String(s.created_at).slice(0, 10) : 'today';
      if (s.ip_address && (s.matched_customer_id || pKey || !isGenericVisitorName(s.company_name))) {
        const ipDayKey = `${s.ip_address}_${dayStr}`;
        if (!ipDayToIdentity[ipDayKey]) {
          ipDayToIdentity[ipDayKey] = {
            customerId: s.matched_customer_id || null,
            phoneKey: pKey || null,
            companyName: !isGenericVisitorName(s.company_name) ? s.company_name.trim() : null
          };
        }
      }
    });

    const groupsMap = new Map();

    dateFilteredSignals.forEach(s => {
      const pKey = normalizePhoneKey(s.phone);
      const dayStr = s.created_at ? String(s.created_at).slice(0, 10) : 'today';
      const ipDayBridge = s.ip_address ? ipDayToIdentity[`${s.ip_address}_${dayStr}`] : null;

      const effectiveCustId = s.matched_customer_id || ipDayBridge?.customerId || null;
      const effectivePhoneKey = pKey || ipDayBridge?.phoneKey || '';
      const effectiveNamedComp = !isGenericVisitorName(s.company_name)
        ? s.company_name.trim()
        : (ipDayBridge?.companyName || '');

      let visitorKey = '';
      if (effectiveCustId) {
        visitorKey = `cust_${effectiveCustId}`;
      } else if (effectivePhoneKey) {
        visitorKey = `phone_${effectivePhoneKey}`;
      } else if (effectiveNamedComp) {
        visitorKey = `name_${effectiveNamedComp.toLowerCase()}`;
      } else if (s.ip_address) {
        visitorKey = `ip_${s.ip_address}_${dayStr}`;
      } else {
        visitorKey = `sig_${s.id}`;
      }

      if (!groupsMap.has(visitorKey)) {
        groupsMap.set(visitorKey, {
          visitorKey,
          primarySignal: s,
          id: s.id,
          company_name: effectiveNamedComp || s.company_name || 'Portal Ziyaretçisi',
          matched_customer_id: effectiveCustId,
          matched_customer_name: s.matched_customer_name || null,
          phone: s.phone || null,
          city: s.city || 'Samsun',
          district: s.district || null,
          ip_address: s.ip_address || null,
          source: s.source || 'public_pricing_catalog',
          sourcesSet: new Set([s.source || 'public_pricing_catalog']),
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

      // Daha iyi isim veya telefon varsa güncelle
      if (!isGenericVisitorName(s.company_name) && isGenericVisitorName(grp.company_name)) {
        grp.company_name = s.company_name.trim();
      }
      if (s.matched_customer_name && isGenericVisitorName(grp.company_name)) {
        grp.company_name = s.matched_customer_name;
      }
      if (!grp.phone && s.phone) {
        grp.phone = s.phone;
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
        : 35;
      grp.total_duration_seconds += safeDur;
      grp.max_scroll_depth = Math.max(grp.max_scroll_depth, s.scroll_depth || 75);

      if ((s.intent_score || 0) > grp.intent_score) {
        grp.intent_score = s.intent_score;
      }
      if (s.intent_level === 'very_high' || grp.intent_score >= 90) {
        grp.intent_level = 'very_high';
      }

      // İlk ve son görülme zamanı
      if (s.created_at) {
        if (!grp.last_seen_at || new Date(s.created_at) > new Date(grp.last_seen_at)) {
          grp.last_seen_at = s.created_at;
        }
        if (!grp.first_seen_at || new Date(s.created_at) < new Date(grp.first_seen_at)) {
          grp.first_seen_at = s.created_at;
        }
      }
    });

    // Diziye çevir ve türetilmiş alanları ekle
    return Array.from(groupsMap.values()).map(grp => {
      const modelsList = Array.from(grp.modelsSet);
      const campaignsList = Array.from(grp.campaignsSet);
      const queriesList = Array.from(grp.queriesSet);
      const sourcesList = Array.from(grp.sourcesSet);
      const isIdentified = Boolean(grp.phone || grp.matched_customer_id || !isGenericVisitorName(grp.company_name));
      const hasHighAction = queriesList.some(q => {
        const ql = q.toLowerCase();
        return ql.includes('teklif') || ql.includes('takas') || ql.includes('kredi') || ql.includes('whatsapp') || ql.includes('numara');
      }) || grp.intent_score >= 90 || grp.events.length >= 2;

      return {
        ...grp,
        modelsList,
        campaignsList,
        queriesList,
        sourcesList,
        target_model: modelsList[0] || grp.primarySignal.target_model || 'IVECO 2026 Katalog',
        target_campaign: campaignsList[0] || grp.primarySignal.target_campaign || null,
        search_query: queriesList[0] || grp.primarySignal.search_query || null,
        duration_seconds: grp.total_duration_seconds,
        scroll_depth: grp.max_scroll_depth,
        created_at: grp.last_seen_at,
        notes: grp.notesList[0] || null,
        eventCount: grp.events.length,
        isIdentified,
        hasHighAction,
        isConverted: grp.status === 'converted' || Boolean(grp.matched_customer_id)
      };
    }).sort((a, b) => new Date(b.last_seen_at || 0) - new Date(a.last_seen_at || 0));
  }, [dateFilteredSignals]);

  // 3. ADIM: Raporlama Özeti Metrikleri (Model, Kanal, Şehir ve Huni Dağılımı)
  const reportAnalytics = useMemo(() => {
    const totalRaw = dateFilteredSignals.length;
    const totalUnique = groupedVisitors.length;
    const identifiedCount = groupedVisitors.filter(v => v.isIdentified).length;
    const withPhoneCount = groupedVisitors.filter(v => Boolean(v.phone)).length;
    const highIntentCount = groupedVisitors.filter(v => v.hasHighAction).length;
    const repeatVisitorCount = groupedVisitors.filter(v => v.eventCount >= 2).length;
    const anonymousCount = groupedVisitors.filter(v => !v.isIdentified).length;
    const convertedCount = groupedVisitors.filter(v => v.isConverted).length;

    // Ortalama inceleme süresi (tekil ziyaretçi başına)
    const totalSec = groupedVisitors.reduce((acc, v) => acc + (v.total_duration_seconds || 0), 0);
    const avgDurationSec = totalUnique > 0 ? Math.round(totalSec / totalUnique) : 0;

    // Araç Modeli Bazlı Dağılım (Tekil ziyaretçi ve toplam etkileşim)
    const modelMap = {};
    groupedVisitors.forEach(v => {
      const models = v.modelsList.length > 0 ? v.modelsList : ['Genel Katalog / Fiyat Listesi'];
      models.forEach(m => {
        const cleanM = m.trim();
        if (!modelMap[cleanM]) {
          modelMap[cleanM] = { model: cleanM, uniqueVisitors: 0, totalClicks: 0, withPhone: 0 };
        }
        modelMap[cleanM].uniqueVisitors += 1;
        if (v.phone) modelMap[cleanM].withPhone += 1;
      });
      v.events.forEach(ev => {
        const m = (ev.target_model || 'Genel Katalog / Fiyat Listesi').trim();
        if (!modelMap[m]) {
          modelMap[m] = { model: m, uniqueVisitors: 0, totalClicks: 0, withPhone: 0 };
        }
        modelMap[m].totalClicks += 1;
      });
    });
    const topModels = Object.values(modelMap)
      .sort((a, b) => b.uniqueVisitors - a.uniqueVisitors || b.totalClicks - a.totalClicks)
      .slice(0, 8);

    // Giriş Kanalı Bazlı Dağılım
    const channelMap = {};
    groupedVisitors.forEach(v => {
      const src = v.source || 'public_pricing_catalog';
      const meta = getSourceMeta(src);
      if (!channelMap[src]) {
        channelMap[src] = {
          sourceKey: src,
          label: meta.short,
          color: meta.color,
          uniqueVisitors: 0,
          identified: 0,
          totalEvents: 0
        };
      }
      channelMap[src].uniqueVisitors += 1;
      if (v.isIdentified) channelMap[src].identified += 1;
      channelMap[src].totalEvents += v.eventCount;
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

  // 4. ADIM: Aktif Filtrelere Göre Gösterilecek Liste (Gruplanmış veya Ham)
  const displayedItems = useMemo(() => {
    const baseList = viewMode === 'grouped'
      ? groupedVisitors
      : dateFilteredSignals.map(s => ({
          ...s,
          visitorKey: `raw_${s.id}`,
          modelsList: s.target_model ? [s.target_model] : [],
          campaignsList: s.target_campaign ? [s.target_campaign] : [],
          queriesList: s.search_query ? [s.search_query] : [],
          sourcesList: s.source ? [s.source] : [],
          eventCount: 1,
          events: [s],
          isIdentified: Boolean(s.phone || s.matched_customer_id || !isGenericVisitorName(s.company_name)),
          hasHighAction: (s.intent_score || 0) >= 90,
          isConverted: s.status === 'converted' || Boolean(s.matched_customer_id)
        }));

    return baseList.filter(item => {
      // Segment filtresi
      if (visitorSegment === 'identified' && !item.isIdentified) return false;
      if (visitorSegment === 'high_intent' && !item.hasHighAction) return false;
      if (visitorSegment === 'repeat' && item.eventCount < 2) return false;
      if (visitorSegment === 'anonymous' && item.isIdentified) return false;
      if (visitorSegment === 'converted' && !item.isConverted) return false;

      // Kaynak kanal filtresi
      if (sourceFilter !== 'all') {
        if (sourceFilter === 'whatsapp_all') {
          const hasWa = item.sourcesList.some(src =>
            ['whatsapp_link', 'wa_durum', 'whatsapp_durum', 'wa_grup', 'wa_musteri', 'wa_ozel'].includes(src)
          );
          if (!hasWa) return false;
        } else if (!item.sourcesList.includes(sourceFilter) && item.source !== sourceFilter) {
          return false;
        }
      }

      // Şehir filtresi
      if (selectedCity !== 'all' && item.city !== selectedCity) return false;

      // Araç modeli filtresi
      if (selectedModelFilter) {
        const matchModel = item.modelsList.includes(selectedModelFilter) || item.target_model === selectedModelFilter;
        if (!matchModel) return false;
      }

      // Arama kutusu filtresi
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const textMatch =
          (item.company_name && item.company_name.toLowerCase().includes(q)) ||
          (item.phone && item.phone.toLowerCase().includes(q)) ||
          item.modelsList.some(m => m.toLowerCase().includes(q)) ||
          item.queriesList.some(qr => qr.toLowerCase().includes(q)) ||
          item.campaignsList.some(c => c.toLowerCase().includes(q)) ||
          (item.notes && item.notes.toLowerCase().includes(q)) ||
          (item.city && item.city.toLowerCase().includes(q));
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
    const model = (signal.modelsList && signal.modelsList[0]) || signal.target_model || 'IVECO 2026 Ticari Araç';
    const message = `Merhaba, IVECO ERC Samsun Otomotiv Satış Sorumlusu olarak ulaşıyorum (0544 622 59 31). Dijital kataloğumuzda incelediğiniz ${model} ve Kasım 2026 dönemine özel %0 faizli / ödemesiz ticari finansman seçeneklerimiz hakkında firmanıza özel ödeme tablosunu paylaşmak isterim.`;
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

  // Excel'e Aktar (Hem "Tekil Müşteri Özeti" hem "Detaylı Ham Hareket Dökümü" destekli)
  const handleExportExcel = (exportMode = 'summary') => {
    const escapeCsvCell = (val) => {
      if (val === null || val === undefined) return '""';
      const cleaned = String(val)
        .replace(/\|\|TRADEIN_PHOTOS_JSON:[\s\S]*$/g, '')
        .replace(/\r?\n|\r/g, ' | ')
        .replace(/"/g, '""')
        .trim();
      return `"${cleaned}"`;
    };

    const today = new Date().toISOString().slice(0, 10);

    if (exportMode === 'summary') {
      const rows = viewMode === 'grouped' ? displayedItems : groupedVisitors;
      if (!rows || rows.length === 0) {
        toast.error('Dışa aktarılacak müşteri özeti bulunamadı.');
        return;
      }

      const headers = [
        'Son Giriş Tarihi',
        'İlk Giriş Tarihi',
        'Müşteri / Firma Adı',
        'Telefon Numarası',
        'Kimlik Durumu',
        'İl / İlçe',
        'Giriş Kanalı',
        'Toplam Etkileşim Sayısı',
        'İncelediği Araç Modelleri',
        'İlgilendiği Kampanya / Finansman',
        'Yaptığı İşlemler / Aksiyonlar',
        'Toplam İnceleme Süresi',
        'Niyet Skoru (%)',
        'CRM Durumu',
        'IP Adresi',
        'Detay Notları'
      ];

      const csvLines = [
        headers.map(escapeCsvCell).join(';'),
        ...rows.map(v => {
          const lastStr = v.last_seen_at ? new Date(v.last_seen_at).toLocaleString('tr-TR') : '-';
          const firstStr = v.first_seen_at ? new Date(v.first_seen_at).toLocaleString('tr-TR') : '-';
          const cityStr = `${v.city || ''}${v.district ? ' / ' + v.district : ''}`.trim() || 'Samsun';
          const channelsStr = (v.sourcesList || [v.source]).map(s => getSourceMeta(s).short).join(', ');
          const modelsStr = (v.modelsList && v.modelsList.length > 0) ? v.modelsList.join(' | ') : (v.target_model || '-');
          const campStr = (v.campaignsList && v.campaignsList.length > 0) ? v.campaignsList.join(' | ') : (v.target_campaign || '-');
          const queriesStr = (v.queriesList && v.queriesList.length > 0) ? v.queriesList.join(' -> ') : (v.search_query || '-');
          const idStatus = v.phone ? 'Telefonu Belli' : (v.isIdentified ? 'İsim/Firma Belli' : 'Anonim Ziyaretçi');
          const crmStatus = v.isConverted ? 'CRM Müşterisi / Adayı' : 'Yeni Ziyaretçi';

          return [
            lastStr,
            firstStr,
            v.company_name || 'Portal Ziyaretçisi',
            v.phone || '-',
            idStatus,
            cityStr,
            channelsStr,
            `${v.eventCount || 1} İşlem`,
            modelsStr,
            campStr,
            queriesStr,
            formatDuration(v.duration_seconds),
            `%${v.intent_score || 85}`,
            crmStatus,
            v.ip_address || '-',
            v.notes || '-'
          ].map(escapeCsvCell).join(';');
        })
      ];

      const bom = '\uFEFF';
      const blob = new Blob([bom + csvLines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ERC_Niyet_Radari_Tekil_Musteri_Raporu_${today}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`📊 ${rows.length} tekil müşterinin özet raporu Excel formatında indirildi!`);
      return;
    }

    // Detaylı Ham Hareket Dökümü
    const rawRows = dateFilteredSignals;
    if (!rawRows || rawRows.length === 0) {
      toast.error('Dışa aktarılacak hareket kaydı bulunamadı.');
      return;
    }

    const headers = [
      'Tarih / Saat',
      'Ziyaretçi / Firma Adı',
      'Telefon',
      'İl / İlçe',
      'Giriş Kaynağı',
      'İncelenen Model / Sekme',
      'Kampanya / Aksiyon',
      'İşlem / Etkileşim',
      'İnceleme Süresi',
      'Niyet Skoru (%)',
      'Durum',
      'IP Adresi',
      'Detay Notları'
    ];

    const csvLines = [
      headers.map(escapeCsvCell).join(';'),
      ...rawRows.map(sig => {
        const dateStr = sig.created_at
          ? new Date(sig.created_at).toLocaleString('tr-TR')
          : new Date().toLocaleDateString('tr-TR');
        const cityStr = `${sig.city || ''}${sig.district ? ' / ' + sig.district : ''}`.trim() || 'Samsun';
        const sourceStr = getSourceMeta(sig.source).label;
        const statusStr = (sig.status === 'converted' || sig.matched_customer_id) ? 'CRM Müşterisi' : 'Yeni Ziyaretçi';

        return [
          dateStr,
          sig.company_name || 'Katalog Ziyaretçisi',
          sig.phone || '-',
          cityStr,
          sourceStr,
          sig.target_model || '-',
          sig.target_campaign || '-',
          sig.search_query || '-',
          formatDuration(sig.duration_seconds),
          `%${sig.intent_score || 85}`,
          statusStr,
          sig.ip_address || '-',
          sig.notes || '-'
        ].map(escapeCsvCell).join(';');
      })
    ];

    const bom = '\uFEFF';
    const blob = new Blob([bom + csvLines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ERC_Niyet_Radari_Detayli_Hareket_Logu_${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success(`📋 ${rawRows.length} detaylı hareket kaydı Excel formatında indirildi!`);
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
              Dijital Niyet Radarı & Ziyaretçi Raporlama Merkezi
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
              Tekilleştirilmiş Müşteri Takibi Aktif
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Aynı müşterinin yaptığı çoklu tıklamaları tek profilde birleştirir; hangi araca kimin kaç kez baktığını, telefon bırakanları ve kanal performansını sistematik raporlar.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleExportExcel('summary')}
            style={{
              background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
              color: '#fff',
              border: '1px solid rgba(45, 212, 191, 0.4)',
              borderRadius: '8px',
              padding: '9px 14px',
              fontWeight: 700,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
            }}
            title="Her müşteriyi tek satırda özetleyen yönetici Excel raporunu indir"
          >
            <FiDownload size={15} />
            📊 Müşteri Özeti Excel ({groupedVisitors.length} Kişi)
          </button>

          <button
            onClick={() => handleExportExcel('raw')}
            style={{
              background: 'var(--bg-card)',
              color: '#2dd4bf',
              border: '1px solid rgba(45, 212, 191, 0.35)',
              borderRadius: '8px',
              padding: '9px 13px',
              fontWeight: 600,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
            title="Saat saat tüm tıklamaları içeren ham hareket logunu Excel olarak indir"
          >
            <FiList size={15} />
            📋 Tüm Loglar ({dateFilteredSignals.length})
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

      {/* ── DÖNEM (TARİH) SEÇİCİ & GÖRÜNÜM MODU BARI ───────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '10px 16px',
        marginBottom: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginRight: '4px' }}>
            <FiCalendar size={14} /> RAPOR DÖNEMİ:
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
              onClick={() => setDateRange(d.id)}
              style={{
                background: dateRange === d.id ? 'var(--accent-blue)' : 'var(--bg-card)',
                color: dateRange === d.id ? '#fff' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: dateRange === d.id ? 'var(--accent-blue-light)' : 'var(--border-color)',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: dateRange === d.id ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '3px'
          }}>
            <button
              onClick={() => setViewMode('grouped')}
              style={{
                background: viewMode === 'grouped' ? 'var(--accent-blue)' : 'transparent',
                color: viewMode === 'grouped' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 12px',
                fontSize: '0.79rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <FiUsers size={13} />
              Tekil Müşteri Özeti ({groupedVisitors.length})
            </button>
            <button
              onClick={() => setViewMode('raw')}
              style={{
                background: viewMode === 'raw' ? 'var(--accent-blue)' : 'transparent',
                color: viewMode === 'raw' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 12px',
                fontSize: '0.79rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <FiLayers size={13} />
              Tüm Ham Hareketler ({dateFilteredSignals.length})
            </button>
          </div>

          <button
            onClick={() => setShowReportPanel(prev => !prev)}
            style={{
              background: showReportPanel ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
              color: showReportPanel ? '#60a5fa' : 'var(--text-secondary)',
              border: '1px solid',
              borderColor: showReportPanel ? 'rgba(59, 130, 246, 0.4)' : 'var(--border-color)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FiBarChart2 size={14} />
            {showReportPanel ? 'Rapor Tablosunu Gizle' : 'Rapor Tablosunu Göster'}
            {showReportPanel ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* ── 5 ANA KPI KARTI (NET VE ANLAŞILIR ÖZET) ───────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px',
        marginBottom: '20px'
      }}>
        {/* 1. Tekil Ziyaretçi vs Ham Hareket */}
        <div
          onClick={() => setVisitorSegment('all')}
          style={{
            background: 'var(--bg-card)',
            border: visitorSegment === 'all' ? '1px solid #3b82f6' : '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px 18px',
            boxShadow: 'var(--shadow-card)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 700 }}>TEKİL ZİYARETÇİ / KİŞİ</span>
            <span style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.12)', padding: '6px', borderRadius: '8px' }}><FiUsers size={16} /></span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-heading)' }}>
            {reportAnalytics.totalUnique} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Kişi</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginTop: '4px' }}>
            Toplam <strong>{reportAnalytics.totalRaw}</strong> tıklama / sayfa hareketi
          </div>
        </div>

        {/* 2. Telefonu / Kimliği Belli Olanlar */}
        <div
          onClick={() => setVisitorSegment('identified')}
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.4) 100%)',
            border: visitorSegment === 'identified' ? '1px solid #10b981' : '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '16px 18px',
            boxShadow: 'var(--shadow-card)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ color: '#10b981', fontSize: '0.78rem', fontWeight: 800 }}>KİMLİĞİ / NUMARASI BELLİ</span>
            <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '6px', borderRadius: '8px' }}><FiPhoneCall size={16} /></span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#34d399' }}>
            {reportAnalytics.identifiedCount} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6ee7b7' }}>Müşteri</span>
          </div>
          <div style={{ color: '#6ee7b7', fontSize: '0.76rem', marginTop: '4px', fontWeight: 600 }}>
            📞 {reportAnalytics.withPhoneCount} kişinin direkt telefonu kayıtlı
          </div>
        </div>

        {/* 3. Yüksek Satın Alma Niyeti / Aksiyon Alanlar */}
        <div
          onClick={() => setVisitorSegment('high_intent')}
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
            border: visitorSegment === 'high_intent' ? '1px solid #ef4444' : '1px solid rgba(239, 68, 68, 0.28)',
            borderRadius: '12px',
            padding: '16px 18px',
            boxShadow: 'var(--shadow-card)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ color: '#f87171', fontSize: '0.78rem', fontWeight: 800 }}>YÜKSEK NİYET & AKSİYON</span>
            <span style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '6px', borderRadius: '8px' }}><FiTrendingUp size={16} /></span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f87171' }}>
            {reportAnalytics.highIntentCount} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Sıcak Aday</span>
          </div>
          <div style={{ color: '#fca5a5', fontSize: '0.76rem', marginTop: '4px', fontWeight: 600 }}>
            Kredi / takas / teklif hesaplayanlar
          </div>
        </div>

        {/* 4. Çoklu Etkileşim (Tekrar Girenler) */}
        <div
          onClick={() => setVisitorSegment('repeat')}
          style={{
            background: 'var(--bg-card)',
            border: visitorSegment === 'repeat' ? '1px solid #f59e0b' : '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px 18px',
            boxShadow: 'var(--shadow-card)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 700 }}>ÇOKLU İNCELEME (2+ İŞLEM)</span>
            <span style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', padding: '6px', borderRadius: '8px' }}><FiActivity size={16} /></span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fbbf24' }}>
            {reportAnalytics.repeatVisitorCount} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Kişi</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginTop: '4px' }}>
            Ort. İnceleme: <strong>{formatDuration(reportAnalytics.avgDurationSec)}</strong>
          </div>
        </div>

        {/* 5. Henüz Numara Bırakmayan (Anonim) */}
        <div
          onClick={() => setVisitorSegment('anonymous')}
          style={{
            background: 'var(--bg-card)',
            border: visitorSegment === 'anonymous' ? '1px solid #94a3b8' : '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px 18px',
            boxShadow: 'var(--shadow-card)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 700 }}>ANONİM KATALOG ZİYARETÇİSİ</span>
            <span style={{ color: '#94a3b8', background: 'rgba(148, 163, 184, 0.12)', padding: '6px', borderRadius: '8px' }}><FiGlobe size={16} /></span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-heading)' }}>
            {reportAnalytics.anonymousCount} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Ziyaretçi</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginTop: '4px' }}>
            Linke tıklayıp numara bırakmayanlar
          </div>
        </div>
      </div>

      {/* ── SİSTEMATİK YÖNETİCİ RAPORU & DAĞILIM PANELİ ───────────────── */}
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

      {/* ── MÜŞTERİ SEGMENT SEKMELERİ & ARAMA FİLTRESİ ────────────────── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-card)',
        padding: '14px 18px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        marginBottom: '18px'
      }}>
        {/* Sol: Müşteri Segment Sekmeleri */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
            <FiFilter size={13} /> GRUP:
          </span>
          {[
            { id: 'all', label: `Tümü (${reportAnalytics.totalUnique})`, color: 'var(--accent-blue)' },
            { id: 'identified', label: `📞 Telefonu / Kimliği Belli (${reportAnalytics.identifiedCount})`, color: '#10b981' },
            { id: 'high_intent', label: `🔥 Yüksek Niyet (${reportAnalytics.highIntentCount})`, color: '#ef4444' },
            { id: 'repeat', label: `🔄 Çoklu Giriş (${reportAnalytics.repeatVisitorCount})`, color: '#f59e0b' },
            { id: 'anonymous', label: `🕵️ Anonim (${reportAnalytics.anonymousCount})`, color: '#64748b' },
            { id: 'converted', label: `✅ CRM'de (${reportAnalytics.convertedCount})`, color: '#8b5cf6' }
          ].map(seg => (
            <button
              key={seg.id}
              onClick={() => setVisitorSegment(seg.id)}
              style={{
                background: visitorSegment === seg.id ? seg.color : 'var(--bg-secondary)',
                color: visitorSegment === seg.id ? '#fff' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: visitorSegment === seg.id ? seg.color : 'var(--border-color)',
                padding: '6px 11px',
                borderRadius: '8px',
                fontSize: '0.79rem',
                fontWeight: visitorSegment === seg.id ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {seg.label}
            </button>
          ))}
        </div>

        {/* Sağ: Kanal, Şehir ve Metin Arama */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '7px 10px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <option value="all">Tüm Kanallar</option>
            <option value="whatsapp_all">Tüm WhatsApp Kanalları</option>
            <option value="wa_durum">WhatsApp Durum</option>
            <option value="whatsapp_link">WhatsApp VIP Link</option>
            <option value="public_pricing_catalog">2026 Fiyat Kataloğu</option>
            <option value="smart_action_hub">Portal Hızlı İşlem</option>
            <option value="crm_existing_customer">Kayıtlı CRM Müşterisi</option>
            <option value="google_search">Google Organik</option>
            <option value="google_ads">Google Ads</option>
          </select>

          {uniqueCities.length > 0 && (
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '7px 10px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">Tüm İller</option>
              {uniqueCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Firma, telefon, model ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '7px 12px 7px 32px',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                minWidth: '210px'
              }}
            />
          </div>
        </div>
      </div>

      {/* ── LİSTELEME ALANI (TEKİL MÜŞTERİ PROFİLLERİ VEYA HAM LOGLAR) ──── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div className="loading-pulse" style={{ margin: '0 auto 16px' }}></div>
          <p>Dijital niyet sinyalleri ve müşteri profilleri analiz ediliyor...</p>
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
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>Seçili Filtrelere Uygun Ziyaretçi Kaydı Bulunamadı</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '14px' }}>
            Filtreleri sıfırlayarak tüm ziyaretçi ve müşteri kayıtlarını görüntüleyebilirsiniz.
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
              background: 'var(--accent-blue)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Tüm Filtreleri Sıfırla
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayedItems.map((signal) => {
            const isVeryHot = signal.intent_level === 'very_high' || signal.intent_score >= 90 || signal.hasHighAction;
            const isConverted = signal.isConverted;
            const srcMeta = getSourceMeta(signal.source);
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
                  label: '🎚️ Canlı Peşinat & Taksit (Merak)',
                  text: `🎚️ Peşinat veya takas tutarınızı seçin; tüm 2026 sıfır IVECO modellerinde kalan kredi ve taksit planınızı canlı hesaplayın 👇\n${getPublicOrigin()}/fiyat-listesi?ref=wa_durum`
                },
                {
                  label: '🛡️ Şeffaf Liste & Güven',
                  text: `🛡️ 2026 model sıfır IVECO güncel liste fiyatlarını, kasa ölçülerini ve %0 faizli finansman seçeneklerini şeffafça inceleyin 👇\n${getPublicOrigin()}/fiyat-listesi?ref=wa_durum`
                },
                {
                  label: '🧾 Kurumsal %20 KDV Avantajı',
                  text: `🧾 Ticari işletmelere özel %20 indirilebilir KDV avantajı ve peşinatınıza göre net ödeme tablosunu dijital katalogdan inceleyin 👇\n${getPublicOrigin()}/fiyat-listesi?ref=wa_durum`
                },
                {
                  label: '🔄 Takas & Filo Yenileme',
                  text: `🔄 Mevcut ticari aracınızı takasa saydırarak sıfır IVECO'ya geçiş maliyetinizi ve 12 ay %0 faiz avantajını hemen hesaplayın 👇\n${getPublicOrigin()}/fiyat-listesi?ref=wa_durum`
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
    </div>
  );
}
