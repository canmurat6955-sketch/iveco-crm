import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { discoveryApi, scannerApi, crmApi, enrichmentApi } from '../../api/client';
import useGeolocation from '../../hooks/useGeolocation';
import { searchIntentParser } from '../../services/searchIntentParser';
import { duplicateDetection } from '../../services/duplicateDetection';
import toast from 'react-hot-toast';
import { 
  FiZap, FiPlay, FiLoader, FiCheck, FiX, FiChevronLeft, 
  FiChevronRight, FiSearch, FiMapPin, FiPlus, FiNavigation, 
  FiSliders, FiArrowRight, FiInfo, FiTruck, FiTool, FiFileText,
  FiPhoneCall, FiMessageSquare, FiCheckCircle, FiRefreshCw, FiCalendar,
  FiDollarSign, FiAward, FiLayers, FiBriefcase, FiAlertCircle
} from 'react-icons/fi';

// Sadece Hedef 9 İl (Samsun, Ordu, Sivas, Giresun, Çorum, Amasya, Sinop, Tokat, Kastamonu)
export const ALLOWED_PROVINCES = [
  'Samsun', 'Ordu', 'Sivas', 'Giresun', 'Çorum', 'Amasya', 'Sinop', 'Tokat', 'Kastamonu'
];

// Bölgesel OSB ve Sanayi Siteleri (Sadece 9 Hedef İl)
const OSB_OPTIONS = [
  // Samsun
  { id: 'tekkekoy', name: 'Samsun Tekkeköy OSB', city: 'Samsun' },
  { id: 'samsun_gida_osb', name: 'Samsun Gıda İhtisas OSB', city: 'Samsun' },
  { id: 'samsun_merkez_osb', name: 'Samsun Merkez OSB', city: 'Samsun' },
  { id: 'bafra_osb', name: 'Bafra Karma OSB', city: 'Samsun' },
  { id: 'carsamba_osb', name: 'Çarşamba Karma OSB', city: 'Samsun' },
  { id: 'kavak_osb', name: 'Kavak OSB', city: 'Samsun' },
  { id: 'ilkadim_sanayi', name: 'İlkadım 19 Mayıs Sanayi', city: 'Samsun' },

  // Ordu
  { id: 'ordu_merkez_osb', name: 'Ordu Organize Sanayi Bölgesi', city: 'Ordu' },
  { id: 'fatsa_osb', name: 'Ordu Fatsa OSB & Sanayi', city: 'Ordu' },
  { id: 'unye_osb', name: 'Ünye Organize Sanayi Bölgesi', city: 'Ordu' },

  // Sivas
  { id: 'sivas_1_osb', name: 'Sivas 1. Organize Sanayi Bölgesi', city: 'Sivas' },
  { id: 'sivas_demirag_osb', name: 'Sivas Demirağ OSB', city: 'Sivas' },
  { id: 'sivas_sarkisla_osb', name: 'Sivas Şarkışla OSB', city: 'Sivas' },

  // Giresun
  { id: 'giresun_1_osb', name: 'Giresun 1. Organize Sanayi Bölgesi', city: 'Giresun' },
  { id: 'giresun_bulancak_osb', name: 'Giresun 2. OSB (Bulancak)', city: 'Giresun' },

  // Çorum
  { id: 'corum_osb', name: 'Çorum Organize Sanayi Bölgesi', city: 'Çorum' },
  { id: 'sungurlu_osb', name: 'Çorum Sungurlu OSB', city: 'Çorum' },
  { id: 'osmancik_osb', name: 'Çorum Osmancık OSB', city: 'Çorum' },

  // Amasya
  { id: 'amasya_merkez_osb', name: 'Amasya Merkez OSB', city: 'Amasya' },
  { id: 'merzifon_osb', name: 'Amasya Merzifon OSB', city: 'Amasya' },
  { id: 'suluova_et_osb', name: 'Suluova Kırmızı Et İhtisas OSB', city: 'Amasya' },

  // Sinop
  { id: 'sinop_merkez_osb', name: 'Sinop Organize Sanayi Bölgesi', city: 'Sinop' },
  { id: 'boyabat_osb', name: 'Sinop Boyabat OSB', city: 'Sinop' },

  // Tokat
  { id: 'tokat_merkez_osb', name: 'Tokat Merkez OSB', city: 'Tokat' },
  { id: 'erbaa_osb', name: 'Tokat Erbaa OSB', city: 'Tokat' },
  { id: 'turhal_osb', name: 'Tokat Turhal OSB', city: 'Tokat' },

  // Kastamonu
  { id: 'kastamonu_merkez_osb', name: 'Kastamonu Merkez OSB', city: 'Kastamonu' },
  { id: 'tosya_osb', name: 'Kastamonu Tosya OSB', city: 'Kastamonu' },
  { id: 'seydiler_osb', name: 'Kastamonu Seydiler OSB', city: 'Kastamonu' },
];

// Iveco Hedef Ticari Sektör Presetleri
const SECTOR_PRESETS = [
  { 
    id: 'soguk_zincir', 
    label: '🥩 Soğuk Zincir & Frigo', 
    desc: 'Et, Balık, Tavuk, Süt & Dondurma',
    targetVehicle: 'Iveco Daily 35C16 / 50C18 Frigorifik' 
  },
  { 
    id: 'lojistik_ambar', 
    label: '📦 Nakliyat & Kargo Ambarı', 
    desc: 'Şehir İçi Dağıtım & Koli Nakliyesi',
    targetVehicle: 'Iveco Daily 35S16 Kapalı Sac / Eurocargo' 
  },
  { 
    id: 'insaat_nalbur', 
    label: '🏗️ İnşaat, Hafriyat & Nalbur', 
    desc: 'Kereste, Mermer, Hırdavat & Agrega',
    targetVehicle: 'Iveco Daily 35C16 Sac Kasa / 70C18 Damper' 
  },
  { 
    id: 'oto_kurtarma', 
    label: '🚚 Oto Kurtarma & Çekici', 
    desc: '7/24 Yol Yardım & Ağır Kurtarıcı',
    targetVehicle: 'Iveco Daily 70C18 Kayar Kasa Platform' 
  },
  { 
    id: 'firin_unlu', 
    label: '🍞 Fırın & Ekmek Dağıtımı', 
    desc: 'Toplu Ekmek & Unlu Mamul İmalatçıları',
    targetVehicle: 'Iveco Daily 35S14 Panelvan / 35C15 Kasa' 
  },
  { 
    id: 'toptan_gida', 
    label: '🥫 Toptan Gıda & Meşrubat', 
    desc: 'Su, Meşrubat & Bakliyat Dağıtıcıları',
    targetVehicle: 'Iveco Daily 35C16 / 70C18 Kasa' 
  },
];

export default function DiscoveryList() {
  const navigate = useNavigate();
  const { location, loading: gpsLoading, getLocation } = useGeolocation();

  // Ana Navigasyon Tabları
  const [activeTab, setActiveTab] = useState('osb_radar'); // osb_radar | tenders | bodybuilders | new_registrations | live_search | sources

  // ── Bölge Filtresi (Sadece Hedef 9 İl) ──────────────────────────────
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState('Tümü');
  const [scrapingLiveTenders, setScrapingLiveTenders] = useState(false);

  // ── Tab 1: Akılcı OSB Radar State'leri ──────────────────────────────
  const [selectedOsb, setSelectedOsb] = useState('Samsun Tekkeköy OSB');
  const [selectedSector, setSelectedSector] = useState('soguk_zincir');
  const [customOsbQuery, setCustomOsbQuery] = useState('');
  const [searchingOsb, setSearchingOsb] = useState(false);
  const [osbResults, setOsbResults] = useState([]);

  // ── Tab 2: Kamu & Belediye İhale Radarı State'leri ──────────────────
  const [tenders, setTenders] = useState([]);
  const [loadingTenders, setLoadingTenders] = useState(false);
  const [showTenderModal, setShowTenderModal] = useState(false);
  const [newTender, setNewTender] = useState({
    tender_number: '',
    title: '',
    organization: '',
    city: 'Samsun',
    district: '',
    category: 'Temizlik & Çöp',
    estimated_vehicles: 8,
    suggested_iveco_model: 'Iveco Daily 70C18 Çöp Kasası',
    contractor_name: '',
    contractor_phone: '',
    contractor_contact: '',
    contract_amount: '',
    notes: ''
  });

  // ── Tab 3: Üst Yapıcı Partnerleri & Yönlendirmeler State'leri ───────
  const [bodybuilders, setBodybuilders] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loadingBb, setLoadingBb] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showBbModal, setShowBbModal] = useState(false);
  const [newReferral, setNewReferral] = useState({
    bodybuilder_id: '',
    customer_name: '',
    customer_phone: '',
    city: 'Samsun',
    requested_chassis: 'Iveco Daily 35C16 Şasi',
    requested_body: 'Frigorifik Kasa (-18°C)',
    notes: ''
  });
  const [newBb, setNewBb] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    city: 'Samsun',
    district: '',
    specialty: 'Frigofirik Kasa & Soğutucu',
    address: '',
    notes: ''
  });

  // ── Tab 4: Yeni Kurulan Şirketler (Ticaret Sicil / NACE) ────────────
  const [newCompanies, setNewCompanies] = useState([]);
  const [loadingNewCompanies, setLoadingNewCompanies] = useState(false);

  // ── Tab 5: Serbest Arama & Kaynaklar (Mevcut Yapı) ──────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState([]);
  const [sources, setSources] = useState([]);
  const [companies, setCompanies] = useState({ items: [], total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [running, setRunning] = useState(null);
  const [searchLimit, setSearchLimit] = useState(20);
  const pageSize = 15;

  // İlk yüklemede verileri çek
  useEffect(() => {
    // OSB Radarı ilk aramayı otomatik yap
    handleOsbSearch();
    loadTenders();
    loadBodybuildersAndReferrals();
    loadNewCompanies();
    discoveryApi.getSources().then(r => setSources(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'sources') {
      loadCompanies();
    }
  }, [page, statusFilter, activeTab]);

  // ── OSB Radar Arama Fonksiyonu ─────────────────────────────────────
  const handleOsbSearch = async () => {
    setSearchingOsb(true);
    try {
      const selectedOsbObj = OSB_OPTIONS.find(o => o.name === selectedOsb);
      const res = await discoveryApi.searchOsbRadar({
        osb_name: selectedOsb,
        sector_preset: selectedSector,
        custom_query: customOsbQuery || undefined,
        city: selectedOsbObj?.city || 'Samsun',
        limit: 20
      });
      setOsbResults(res.data || []);
      toast.success(`${res.data?.length || 0} potansiyel firma radarda tespit edildi.`);
    } catch (err) {
      toast.error('OSB Radar taramasında hata oluştu.');
    } finally {
      setSearchingOsb(false);
    }
  };

  // OSB'den Tek Tıkla CRM'e Ekle
  const addOsbToCrm = async (biz) => {
    try {
      const res = await scannerApi.addToCrm({
        company_name: biz.company_name,
        phone: biz.phone,
        address: biz.address,
        district: biz.district,
        city: biz.city,
        sector: biz.sector,
        google_place_id: biz.google_place_id,
        google_maps_url: biz.google_maps_url,
        rating: biz.rating,
        sales_notes: `OSB Radarı: ${selectedOsb}. Tavsiye Edilen Araç: ${biz.recommended_iveco} (${biz.target_body_type || 'Üst Yapı'}). Uyumluluk Skoru: ${biz.iveco_match_score}`
      });

      if (res.data.status === 'exists') {
        toast.error(res.data.message);
      } else {
        toast.success(res.data.message || 'Firma CRM\'e başarıyla eklendi!');
        setOsbResults(prev => prev.map(item => {
          if (item.company_name === biz.company_name) {
            return {
              ...item,
              is_existing_customer: true,
              existing_customer_id: res.data.customer_id,
              existing_customer_name: biz.company_name
            };
          }
          return item;
        }));
      }
    } catch {
      toast.error('CRM\'e eklenirken bir hata oluştu.');
    }
  };

  // ── İhale Radarı Fonksiyonları ─────────────────────────────────────
  const loadTenders = async (prov = selectedProvinceFilter) => {
    setLoadingTenders(true);
    try {
      const params = prov && prov !== 'Tümü' ? { city: prov } : {};
      const res = await discoveryApi.getTenders(params);
      setTenders(res.data || []);
    } catch {
      // Hata sessizce yutulabilir
    } finally {
      setLoadingTenders(false);
    }
  };

  const handleScrapeLiveTenders = async () => {
    setScrapingLiveTenders(true);
    try {
      const targetCity = selectedProvinceFilter !== 'Tümü' ? selectedProvinceFilter : null;
      toast.loading("İlan.gov.tr'den canlı kamu ihaleleri taranıyor...", { id: 'tender-scrape' });
      const res = await discoveryApi.scrapeLiveTenders(targetCity);
      setTenders(res.data || []);
      toast.success(`${res.data?.length || 0} aktif kamu ihalesi güncellendi!`, { id: 'tender-scrape' });
    } catch {
      toast.error('Canlı ihale taramasında hata oluştu.', { id: 'tender-scrape' });
    } finally {
      setScrapingLiveTenders(false);
    }
  };

  const handleCreateTender = async (e) => {
    e.preventDefault();
    try {
      await discoveryApi.createTender(newTender);
      toast.success('Yeni ihale başarıyla kaydedildi!');
      setShowTenderModal(false);
      loadTenders();
    } catch {
      toast.error('İhale kaydedilirken hata oluştu.');
    }
  };

  const convertTenderToLead = async (tenderId) => {
    try {
      const res = await discoveryApi.convertTenderToLead(tenderId);
      toast.success(res.data.message || 'İhale yüklenicisi CRM\'e aktarıldı!');
      loadTenders();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'CRM\'e aktarılırken hata oluştu.');
    }
  };

  // ── Üst Yapıcı Fonksiyonları ───────────────────────────────────────
  const loadBodybuildersAndReferrals = async (prov = selectedProvinceFilter) => {
    setLoadingBb(true);
    try {
      const params = prov && prov !== 'Tümü' ? { city: prov } : {};
      const [bbRes, refRes] = await Promise.all([
        discoveryApi.getBodybuilders(params),
        discoveryApi.getReferrals(params)
      ]);
      setBodybuilders(bbRes.data || []);
      setReferrals(refRes.data || []);
      if (bbRes.data?.length > 0 && !newReferral.bodybuilder_id) {
        setNewReferral(prev => ({ ...prev, bodybuilder_id: bbRes.data[0].id }));
      }
    } catch {
      // Hata yutulabilir
    } finally {
      setLoadingBb(false);
    }
  };

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    try {
      await discoveryApi.createReferral(newReferral);
      toast.success('Müşteri şasi talebi başarıyla kaydedildi!');
      setShowReferralModal(false);
      loadBodybuildersAndReferrals();
    } catch {
      toast.error('Talep kaydedilemedi.');
    }
  };

  const handleCreateBodybuilder = async (e) => {
    e.preventDefault();
    try {
      await discoveryApi.createBodybuilder(newBb);
      toast.success('Yeni üst yapıcı partneri eklendi!');
      setShowBbModal(false);
      loadBodybuildersAndReferrals();
    } catch {
      toast.error('Üst yapıcı kaydedilemedi.');
    }
  };

  const convertReferralToLead = async (referralId) => {
    try {
      const res = await discoveryApi.convertReferralToLead(referralId);
      toast.success(res.data.message || 'Talep CRM\'e aktarıldı!');
      loadBodybuildersAndReferrals();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'CRM\'e aktarma hatası');
    }
  };

  // ── Yeni Kurulan Şirketler ─────────────────────────────────────────
  const loadNewCompanies = async (prov = selectedProvinceFilter) => {
    setLoadingNewCompanies(true);
    try {
      const params = prov && prov !== 'Tümü' ? { city: prov } : {};
      const res = await discoveryApi.getNewRegistrations(params);
      setNewCompanies(res.data || []);
    } catch {
    } finally {
      setLoadingNewCompanies(false);
    }
  };

  // ── Bölge Filtresi Değiştiğinde ────────────────────────────────────
  const handleProvinceFilterChange = (prov) => {
    setSelectedProvinceFilter(prov);
    loadTenders(prov);
    loadBodybuildersAndReferrals(prov);
    loadNewCompanies(prov);

    if (prov !== 'Tümü') {
      const osbsInProv = OSB_OPTIONS.filter(o => o.city === prov);
      if (osbsInProv.length > 0) {
        setSelectedOsb(osbsInProv[0].name);
      }
    }
  };

  const convertNewCompanyToLead = async (id) => {
    try {
      const res = await discoveryApi.convertNewCompanyToLead(id);
      toast.success(res.data.message || 'Firma CRM\'e aktarıldı!');
      loadNewCompanies();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'CRM\'e aktarma hatası');
    }
  };

  // ── Klasik Tarama & Serbest Arama Fonksiyonları ────────────────────
  const loadCompanies = () => {
    discoveryApi.getCompanies({ page, page_size: pageSize, status: statusFilter || undefined })
      .then(r => setCompanies(r.data)).catch(() => {});
  };

  const handleLiveSearch = async (e) => {
    if (e) e.preventDefault();
    if (searchQuery.length < 3) {
      toast.error("Arama terimi en az 3 karakter olmalıdır.");
      return;
    }
    setScanning(true);
    try {
      const res = await scannerApi.search({ query: searchQuery, max_results: searchLimit });
      setScanResults(res.data.results || []);
      toast.success(`${res.data.results?.length || 0} firma bulundu.`);
    } catch {
      toast.error('Arama sırasında hata oluştu.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="animate-in">
      {/* Sayfa Başlığı */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>Müşteri İstihbaratı & Lead Radarı</h2>
          <p className="text-sm text-muted">Samsun ve Karadeniz bölgesinde ticari araç alım potansiyeli olan sıcak firmaları yakalayın.</p>
        </div>
      </div>

      {/* Ana Tab Menüsü */}
      <div className="flex gap-2 mb-6 flex-wrap" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <button 
          className={`btn ${activeTab === 'osb_radar' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('osb_radar')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <FiTarget size={16} /> 🎯 OSB & Sektörel Radar
        </button>
        <button 
          className={`btn ${activeTab === 'tenders' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('tenders')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <FiFileText size={16} /> 🏛️ Kamu & Belediye İhale Radarı
          {tenders.length > 0 && <span className="badge badge-amber" style={{ marginLeft: 4 }}>{tenders.length}</span>}
        </button>
        <button 
          className={`btn ${activeTab === 'bodybuilders' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('bodybuilders')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <FiTool size={16} /> 🛠️ Üst Yapıcı Partner Ağı & Talepler
          {referrals.length > 0 && <span className="badge badge-green" style={{ marginLeft: 4 }}>{referrals.length}</span>}
        </button>
        <button 
          className={`btn ${activeTab === 'new_registrations' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('new_registrations')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <FiBriefcase size={16} /> 🏢 Yeni Kurulan Şirketler (NACE)
        </button>
        <button 
          className={`btn ${activeTab === 'live_search' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('live_search')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <FiSearch size={16} /> 🔎 Serbest Arama
        </button>
      </div>

      {/* ── 9 HEDEF İL HIZLI FİLTRE BARI ───────────────────────────────── */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          padding: '0.75rem 1rem',
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          marginBottom: '1.25rem'
        }}
      >
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue-light)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <FiMapPin size={15} /> HEDEF İL FİLTRESİ:
        </span>
        {['Tümü', ...ALLOWED_PROVINCES].map(prov => (
          <button
            key={prov}
            type="button"
            className={`btn btn-sm ${selectedProvinceFilter === prov ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleProvinceFilterChange(prov)}
            style={{
              borderRadius: 16,
              padding: '0.25rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: selectedProvinceFilter === prov ? 700 : 500
            }}
          >
            {prov === 'Tümü' ? '🌐 Tümü (9 İl)' : prov}
          </button>
        ))}
      </div>

      {/* ── TAB 1: AKILCI OSB & SEKTÖREL RADAR ───────────────────────────── */}
      {activeTab === 'osb_radar' && (
        <div className="flex flex-col gap-6">
          {/* Radar Filtre Paneli */}
          <div className="card glass-card">
            <div className="card-header">
              <h3 className="card-title"><FiTarget style={{ marginRight: 8, color: 'var(--accent-blue-light)' }} /> Bölgesel Sanayi & Sektör Avcısı</h3>
              <span className="text-xs text-muted">Hedefli OSB taraması yaparak doğrudan şasi/kamyonet ihtiyacı olan firmaları bulun (9 İl Kapsamı)</span>
            </div>

            {/* OSB Hızlı Seçim Hapları */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-muted mb-2 block">
                1. HEDEF BÖLGE / ORGANİZE SANAYİ BÖLGESİ SEÇİN {selectedProvinceFilter !== 'Tümü' ? `(${selectedProvinceFilter})` : ''}:
              </label>
              <div className="flex gap-2 flex-wrap">
                {(selectedProvinceFilter === 'Tümü' ? OSB_OPTIONS : OSB_OPTIONS.filter(o => o.city === selectedProvinceFilter)).map(osb => (
                  <button 
                    key={osb.id} 
                    type="button" 
                    className={`btn btn-sm ${selectedOsb === osb.name ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedOsb(osb.name)}
                    style={{ borderRadius: 20 }}
                  >
                    📍 {osb.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sektör Presetleri */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-muted mb-2 block">2. IVECO HEDEF TİCARİ SEKTÖR PRESET'İ SEÇİN:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {SECTOR_PRESETS.map(preset => {
                  const isSelected = selectedSector === preset.id;
                  return (
                    <div 
                      key={preset.id} 
                      onClick={() => setSelectedSector(preset.id)}
                      style={{ 
                        padding: '0.85rem 1rem', 
                        borderRadius: 'var(--radius-md)', 
                        background: isSelected ? 'var(--accent-blue-glow)' : 'var(--bg-input)',
                        border: `1.5px solid ${isSelected ? 'var(--accent-blue-light)' : 'var(--border-color)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div className="font-semibold text-sm mb-1" style={{ color: isSelected ? 'var(--accent-blue-light)' : 'var(--text-heading)' }}>
                        {preset.label}
                      </div>
                      <div className="text-xs text-muted mb-2">{preset.desc}</div>
                      <div className="text-xs" style={{ color: 'var(--accent-amber)' }}>
                        🎯 {preset.targetVehicle}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Özel Arama Terimi & Buton */}
            <div className="flex gap-3 items-center pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
              <div className="flex-1">
                <input 
                  type="text" 
                  className="input" 
                  placeholder="İsteğe bağlı ek arama terimi (Örn: balık toptan, kereste, hazır beton)..."
                  value={customOsbQuery}
                  onChange={e => setCustomOsbQuery(e.target.value)}
                  style={{ background: 'var(--bg-input)' }}
                />
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleOsbSearch} 
                disabled={searchingOsb}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.6rem 1.75rem', fontWeight: 600 }}
              >
                {searchingOsb ? <><FiLoader size={18} className="spin" /> Radar Taranıyor...</> : <><FiTarget size={18} /> Radarı Başlat</>}
              </button>
            </div>
          </div>

          {/* Radar Sonuçları */}
          <div className="card glass-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Tespit Edilen Potansiyel Müşteri Listesi</h3>
                <span className="text-xs text-muted">{selectedOsb} · {SECTOR_PRESETS.find(p => p.id === selectedSector)?.label}</span>
              </div>
              <span className="badge badge-blue">{osbResults.length} Firma</span>
            </div>

            {searchingOsb ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <FiLoader size={36} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-blue-light)' }} />
                <span>Bölgesel sanayi sicili ve Google işletme haritası taranıyor...</span>
              </div>
            ) : osbResults.length > 0 ? (
              <div className="flex flex-col gap-3">
                {osbResults.map((biz, idx) => (
                  <div 
                    key={idx} 
                    className="list-item" 
                    style={{ 
                      padding: '1.25rem', 
                      background: 'var(--bg-input)', 
                      borderLeft: `4px solid ${biz.is_existing_customer ? 'var(--accent-green)' : 'var(--accent-amber)'}`,
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div className="flex justify-between items-start w-full flex-wrap gap-4">
                      <div className="flex-1 min-w-[280px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-base" style={{ color: 'var(--text-heading)' }}>{biz.company_name}</span>
                          {biz.rating && <span className="badge badge-amber">★ {biz.rating}</span>}
                          <span className="badge badge-green">🎯 %{biz.iveco_match_score} Iveco Uyumu</span>
                        </div>

                        <div className="text-xs text-muted mt-2">
                          📍 {biz.address || `${biz.city} / ${biz.district || 'Merkez'}`}
                        </div>

                        <div className="text-xs text-secondary mt-1">
                          {biz.phone && <span>📞 {biz.phone}</span>}
                          {biz.google_maps_url && (
                            <a href={biz.google_maps_url} target="_blank" rel="noopener noreferrer" className="ml-3 text-xs" style={{ color: 'var(--accent-blue-light)' }}>
                              🗺️ Haritada Aç ↗
                            </a>
                          )}
                        </div>

                        <div className="mt-3 text-xs p-2 rounded" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)', display: 'inline-block' }}>
                          💡 <strong>Hedef Araç & Kasa:</strong> {biz.recommended_iveco} {biz.target_body_type ? `· [${biz.target_body_type}]` : ''}
                        </div>

                        {biz.is_existing_customer && (
                          <div className="mt-2 text-xs" style={{ color: 'var(--accent-green)' }}>
                            ✅ <strong>Zaten CRM\'de Kayıtlı:</strong> {biz.existing_customer_name}
                          </div>
                        )}
                      </div>

                      {/* Aksiyon */}
                      <div>
                        {biz.is_existing_customer ? (
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => navigate(`/customers/${biz.existing_customer_id}`)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          >
                            Müşteri Detayı <FiArrowRight size={14} />
                          </button>
                        ) : (
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => addOsbToCrm(biz)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          >
                            <FiPlus size={14} /> CRM\'e Aday Ekle
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FiInfo size={24} style={{ marginBottom: 8 }} />
                <p>Bu arama kriterine uygun işletme bulunamadı. Lütfen OSB veya sektör filtresini değiştirin.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: KAMU & BELEDİYE İHALE RADARI ───────────────────────────── */}
      {activeTab === 'tenders' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>Belediye & Kamu Araç İhaleleri İzleme Radarı</h3>
              <p className="text-xs text-muted">Bölgedeki çöp toplama, fen işleri ve lojistik ihalelerini kazanan yüklenicilere toplu filo şasisi sunun.</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={handleScrapeLiveTenders} 
                disabled={scrapingLiveTenders}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {scrapingLiveTenders ? <FiLoader className="spin" size={16} /> : <FiRefreshCw size={16} />}
                {scrapingLiveTenders ? 'İlanlar Taranıyor...' : '📡 İlan.gov.tr Canlı İhale Tara'}
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setShowTenderModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FiPlus size={16} /> + Yeni İhale Kaydet
              </button>
            </div>
          </div>

          <div className="card glass-card">
            {loadingTenders ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <FiLoader size={36} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-blue-light)' }} />
                <span>İhale bülteni yükleniyor...</span>
              </div>
            ) : tenders.length > 0 ? (
              <div className="flex flex-col gap-4">
                {tenders.map(t => (
                  <div key={t.id} className="list-item" style={{ padding: '1.25rem', background: 'var(--bg-input)', borderLeft: '4px solid var(--accent-purple)' }}>
                    <div className="flex justify-between items-start w-full flex-wrap gap-4">
                      <div className="flex-1 min-w-[280px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-base" style={{ color: 'var(--text-heading)' }}>{t.title}</span>
                          {t.tender_number && <span className="badge badge-blue">İKN: {t.tender_number}</span>}
                          <span className={`badge ${t.status === 'awarded' ? 'badge-green' : 'badge-amber'}`}>
                            {t.status === 'awarded' ? 'Sözleşme İmzalandı / Sonuçlandı' : 'Teklif Aşamasında'}
                          </span>
                        </div>

                        <div className="text-xs text-muted mt-2">
                          🏛️ <strong>Kurum:</strong> {t.organization} · 📍 {t.city} {t.district ? `/${t.district}` : ''} · 📂 {t.category}
                        </div>

                        <div className="mt-2 text-xs flex gap-4 flex-wrap" style={{ color: 'var(--accent-amber)' }}>
                          <span>🚛 <strong>Araç İhtiyacı:</strong> {t.estimated_vehicles} Adet</span>
                          <span>💡 <strong>Önerilen Şasi:</strong> {t.suggested_iveco_model || 'Iveco Şasi'}</span>
                          {t.contract_amount && <span>💰 <strong>İhale Bedeli:</strong> {t.contract_amount}</span>}
                        </div>

                        {/* Kazanan Yüklenici Bilgileri */}
                        {t.contractor_name ? (
                          <div className="mt-3 p-3 rounded text-xs" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <div className="font-semibold text-sm" style={{ color: 'var(--accent-green)' }}>
                              🏆 Kazanan Yüklenici: {t.contractor_name}
                            </div>
                            <div className="text-secondary mt-1">
                              {t.contractor_phone && <span>📞 Tel: {t.contractor_phone}</span>}
                              {t.contractor_contact && <span> · 👤 Yetkili: {t.contractor_contact}</span>}
                            </div>
                            {t.notes && <div className="text-muted mt-1 italic">Not: {t.notes}</div>}
                          </div>
                        ) : (
                          <div className="mt-2 text-xs text-muted">Henüz kazanan yüklenici firma bilgisi girilmemiş.</div>
                        )}
                      </div>

                      {/* Aksiyon */}
                      <div className="flex flex-col gap-2 items-end">
                        {t.matched_customer_id ? (
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => navigate(`/customers/${t.matched_customer_id}`)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          >
                            ✅ CRM\'de Açık Teklif <FiArrowRight size={14} />
                          </button>
                        ) : t.contractor_name ? (
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => convertTenderToLead(t.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          >
                            🚀 Kazananı CRM\'e Aktar
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FiInfo size={24} style={{ marginBottom: 8 }} />
                <p>Seçili il için kayıtlı ihale bulunmuyor. İlan.gov.tr'den canlı kamu ihalelerini taramak için yukarıdaki "📡 İlan.gov.tr Canlı İhale Tara" butonuna tıklayabilirsiniz.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: ÜST YAPICI PARTNERLERİ & YÖNLENDİRMELER ────────────────── */}
      {activeTab === 'bodybuilders' && (
        <div className="flex flex-col gap-8">
          {/* Bölüm A: Gelen Sıcak Şasi Talepleri */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>Üst Yapıcılardan Gelen Sıcak Şasi Talepleri</h3>
                <p className="text-xs text-muted">Kasacı ve frigo ustalarının yönlendirdiği sıcak şasi müşterileri</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowReferralModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FiPlus size={16} /> + Yeni Müşteri Talebi Gir
              </button>
            </div>

            <div className="card glass-card">
              {referrals.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {referrals.map(r => (
                    <div key={r.id} className="list-item" style={{ padding: '1.25rem', background: 'var(--bg-input)', borderLeft: '4px solid var(--accent-green)' }}>
                      <div className="flex justify-between items-start w-full flex-wrap gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-base" style={{ color: 'var(--text-heading)' }}>{r.customer_name}</span>
                            <span className="badge badge-green">Yönlendiren: {r.bodybuilder_name}</span>
                            <span className="badge badge-purple">{r.status === 'new' ? 'Yeni Sıcak Talep' : r.status === 'contacted' ? 'Görüşüldü' : r.status}</span>
                          </div>

                          <div className="text-xs text-muted mt-2">
                            📞 <strong>Telefon:</strong> {r.customer_phone || '—'} · 📍 {r.city || 'Samsun'}
                          </div>

                          <div className="mt-2 text-xs" style={{ color: 'var(--accent-amber)' }}>
                            🚛 <strong>Talep Edilen:</strong> {r.requested_chassis || 'Iveco Şasi'} · 🛠️ <strong>Üst Yapı:</strong> {r.requested_body || 'Kasa'}
                          </div>

                          {r.notes && <div className="text-xs text-muted mt-1 italic">Not: {r.notes}</div>}
                        </div>

                        {/* Butonlar */}
                        <div className="flex gap-2 items-center">
                          {r.customer_phone && (
                            <a 
                              href={`https://wa.me/90${r.customer_phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Merhaba ${r.customer_name}, ${r.bodybuilder_name} referansıyla iletişime geçiyorum. Aradığınız ${r.requested_chassis || 'Iveco şasi'} için görüşebilir miyiz?`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#25D366' }}
                            >
                              <FiMessageSquare size={14} /> WhatsApp
                            </a>
                          )}

                          {r.crm_customer_id ? (
                            <button 
                              className="btn btn-secondary btn-sm" 
                              onClick={() => navigate(`/customers/${r.crm_customer_id}`)}
                            >
                              CRM Kaydı →
                            </button>
                          ) : (
                            <button 
                              className="btn btn-primary btn-sm" 
                              onClick={() => convertReferralToLead(r.id)}
                            >
                              ➕ CRM\'e Aktar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FiInfo size={24} style={{ marginBottom: 8 }} />
                  <p>Seçili il için henüz üst yapıcı yönlendirmesi bulunmuyor. Yeni müşteri talebi geldiğinde yukarıdaki "+ Yeni Müşteri Talebi Gir" butonunu kullanabilirsiniz.</p>
                </div>
              )}
            </div>
          </div>

          {/* Bölüm B: Anlaşmalı Üst Yapıcı Ağı */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>Anlaşmalı Üst Yapıcı (Kasacı / Karoser) Ağı</h3>
                <p className="text-xs text-muted">Bölgedeki frigo, damper, kurtarıcı ve vinç montajcıları</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowBbModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FiPlus size={16} /> + Yeni Kasacı Ekle
              </button>
            </div>

            {bodybuilders.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {bodybuilders.map(bb => (
                  <div key={bb.id} className="card glass-card">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-base" style={{ color: 'var(--text-heading)' }}>{bb.company_name}</div>
                      <span className="badge badge-blue">{bb.specialty}</span>
                    </div>
                    <div className="text-xs text-muted mb-2">👤 <strong>Usta / Yetkili:</strong> {bb.contact_person || '—'}</div>
                    <div className="text-xs text-secondary mb-2">📞 <strong>Telefon:</strong> {bb.phone || '—'}</div>
                    <div className="text-xs text-muted mb-3">📍 {bb.address || `${bb.city} / ${bb.district || ''}`}</div>
                    {bb.notes && <div className="text-xs text-muted italic mb-3">"{bb.notes}"</div>}
                    <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <span className="text-xs font-semibold" style={{ color: 'var(--accent-green)' }}>
                        {bb.referrals_count || 0} Yönlendirme
                      </span>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => {
                          setNewReferral(prev => ({ ...prev, bodybuilder_id: bb.id }));
                          setShowReferralModal(true);
                        }}
                      >
                        + Talep Gir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card glass-card empty-state">
                <FiTool size={24} style={{ marginBottom: 8 }} />
                <p>Seçili il için kayıtlı üst yapıcı / kasacı partneri bulunmuyor. Yeni bir usta veya karoser atölyesi kaydetmek için yukarıdaki "+ Yeni Kasacı Ekle" butonuna tıklayabilirsiniz.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: YENİ KURULAN ŞİRKETLER (NACE RADARI) ──────────────────── */}
      {activeTab === 'new_registrations' && (
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>Ticaret Sicil Yeni Kurulan Şirketler Radarı</h3>
            <p className="text-xs text-muted">Son 30 günde tescil edilen toptancı, hafriyatçı ve lojistik şirketleri (İlk 1-3 ayda araç filosu kurmak zorundalar).</p>
          </div>

          <div className="card glass-card">
            {newCompanies.length > 0 ? (
              <div className="flex flex-col gap-3">
                {newCompanies.map(c => (
                  <div key={c.id} className="list-item" style={{ padding: '1.25rem', background: 'var(--bg-input)', borderLeft: '4px solid var(--accent-blue-light)' }}>
                    <div className="flex justify-between items-start w-full flex-wrap gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-base" style={{ color: 'var(--text-heading)' }}>{c.company_name}</span>
                          {c.nace_code && <span className="badge badge-amber">NACE: {c.nace_code}</span>}
                          {c.capital && <span className="badge badge-green">{c.capital}</span>}
                        </div>

                        <div className="text-xs text-muted mt-2">
                          📂 <strong>Faaliyet Alanı:</strong> {c.nace_description || '—'}
                        </div>

                        <div className="text-xs text-secondary mt-1">
                          📍 {c.address || `${c.city} / ${c.district || ''}`} {c.phone && ` · 📞 ${c.phone}`}
                        </div>

                        {c.registration_date && (
                          <div className="text-xs text-muted mt-1">
                            📅 Tescil Tarihi: {new Date(c.registration_date).toLocaleDateString('tr-TR')}
                          </div>
                        )}
                      </div>

                      <div>
                        {c.matched_customer_id ? (
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/customers/${c.matched_customer_id}`)}>
                            CRM\'de Kayıtlı →
                          </button>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={() => convertNewCompanyToLead(c.id)}>
                            ➕ CRM\'e Aday Ekle
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FiInfo size={24} style={{ marginBottom: 8 }} />
                <p>Seçili il için yeni şirket kaydı bulunamadı. Ticaret sicil bültenleri güncellendikçe kayıtlar listelenecektir.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 5: SERBEST ARAMA (Google Places) ─────────────────────────── */}
      {activeTab === 'live_search' && (
        <div className="flex flex-col gap-6">
          <div className="card glass-card">
            <div className="card-header">
              <h3 className="card-title">Google Places Serbest Arama</h3>
              <button className="btn btn-secondary btn-sm" onClick={getLocation} disabled={gpsLoading}>
                <FiNavigation size={14} className={gpsLoading ? 'spin' : ''} /> {location ? 'Konum Aktif' : 'Konum Al'}
              </button>
            </div>
            <form onSubmit={handleLiveSearch} className="flex gap-3">
              <input 
                type="text" 
                className="input" 
                placeholder="Örn: Çarşamba beton santrali, Bafra unlu mamuller..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ background: 'var(--bg-input)' }}
              />
              <button type="submit" className="btn btn-primary" disabled={scanning}>
                {scanning ? <FiLoader size={16} className="spin" /> : <FiSearch size={16} />} Ara
              </button>
            </form>
          </div>

          <div className="card glass-card">
            <div className="card-header">
              <h3 className="card-title">Arama Sonuçları</h3>
              <span className="badge badge-blue">{scanResults.length} Sonuç</span>
            </div>
            {scanResults.length > 0 ? (
              <div className="flex flex-col gap-3">
                {scanResults.map((biz, idx) => (
                  <div key={idx} className="list-item" style={{ padding: '1rem', background: 'var(--bg-input)' }}>
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <div className="font-semibold text-sm">{biz.company_name}</div>
                        <div className="text-xs text-muted">{biz.address} {biz.phone && `· ${biz.phone}`}</div>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => addOsbToCrm(biz)}>
                        + CRM\'e Ekle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state"><p>Arama yapmak için yukarıya bir ifade yazın.</p></div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: YENİ İHALE EKLE ────────────────────────────────────────── */}
      {showTenderModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-in" style={{ maxWidth: 550 }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>🏛️ Yeni Kamu / Belediye İhalesi Kaydet</h3>
              <button className="btn-icon" onClick={() => setShowTenderModal(false)}><FiX size={18} /></button>
            </div>
            <form onSubmit={handleCreateTender} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-muted">İhale Başlığı *</label>
                <input required className="input" placeholder="Örn: Samsun B.Ş.B. 3 Yıllık Çöp Toplama Alımı" value={newTender.title} onChange={e => setNewTender({ ...newTender, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted">İhale Kayıt No (İKN)</label>
                  <input className="input" placeholder="Örn: 2026/145892" value={newTender.tender_number} onChange={e => setNewTender({ ...newTender, tender_number: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted">İlgili Kurum *</label>
                  <input required className="input" placeholder="Örn: Samsun B.Ş.B. Temizlik" value={newTender.organization} onChange={e => setNewTender({ ...newTender, organization: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted">Şehir (Hedef 9 İl) *</label>
                  <select className="input" value={newTender.city} onChange={e => setNewTender({ ...newTender, city: e.target.value })}>
                    {ALLOWED_PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted">İlçe / Bölge</label>
                  <input className="input" placeholder="Örn: Tekkeköy, Fatsa..." value={newTender.district} onChange={e => setNewTender({ ...newTender, district: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted">Tahmini Araç İhtiyacı</label>
                  <input type="number" className="input" value={newTender.estimated_vehicles} onChange={e => setNewTender({ ...newTender, estimated_vehicles: parseInt(e.target.value) || 1 })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted">Önerilen Iveco Şasi</label>
                  <input className="input" placeholder="Örn: Daily 70C18 Çöp Kasası" value={newTender.suggested_iveco_model} onChange={e => setNewTender({ ...newTender, suggested_iveco_model: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted">Kazanan Yüklenici Firma</label>
                  <input className="input" placeholder="Örn: Kuzey Çevre Ltd." value={newTender.contractor_name} onChange={e => setNewTender({ ...newTender, contractor_name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted">Yüklenici Telefonu</label>
                  <input className="input" placeholder="0362 ..." value={newTender.contractor_phone} onChange={e => setNewTender({ ...newTender, contractor_phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">Sözleşme / İhale Bedeli</label>
                <input className="input" placeholder="Örn: 25.000.000 ₺" value={newTender.contract_amount} onChange={e => setNewTender({ ...newTender, contract_amount: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">İhale Notları</label>
                <textarea className="input" rows={2} placeholder="Şartname gereksinimleri, teslim süreleri..." value={newTender.notes} onChange={e => setNewTender({ ...newTender, notes: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTenderModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: YENİ MÜŞTERİ TALEBİ (REFERRAL) ─────────────────────────── */}
      {showReferralModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-in" style={{ maxWidth: 500 }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>🛠️ Üst Yapıcıdan Gelen Müşteri Talebi</h3>
              <button className="btn-icon" onClick={() => setShowReferralModal(false)}><FiX size={18} /></button>
            </div>
            <form onSubmit={handleCreateReferral} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-muted">Yönlendiren Üst Yapıcı *</label>
                <select 
                  required 
                  className="input" 
                  value={newReferral.bodybuilder_id} 
                  onChange={e => setNewReferral({ ...newReferral, bodybuilder_id: parseInt(e.target.value) })}
                >
                  {bodybuilders.map(bb => (
                    <option key={bb.id} value={bb.id}>{bb.company_name} ({bb.contact_person || 'Yetkili'})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted">Müşteri / Firma Adı *</label>
                  <input required className="input" placeholder="Örn: Balıkçı Hasan" value={newReferral.customer_name} onChange={e => setNewReferral({ ...newReferral, customer_name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted">Müşteri Telefonu *</label>
                  <input required className="input" placeholder="0532 ..." value={newReferral.customer_phone} onChange={e => setNewReferral({ ...newReferral, customer_phone: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted">Şehir (Hedef 9 İl)</label>
                  <select className="input" value={newReferral.city} onChange={e => setNewReferral({ ...newReferral, city: e.target.value })}>
                    {ALLOWED_PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted">Talep Edilen Şasi</label>
                  <input className="input" placeholder="Örn: Daily 35C16" value={newReferral.requested_chassis} onChange={e => setNewReferral({ ...newReferral, requested_chassis: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">İstenen Üst Yapı / Kasa</label>
                <input className="input" placeholder="Örn: Frigorifik Kasa" value={newReferral.requested_body} onChange={e => setNewReferral({ ...newReferral, requested_body: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">Usta Notu</label>
                <textarea className="input" rows={2} placeholder="Müşterinin özel istekleri, bütçesi..." value={newReferral.notes} onChange={e => setNewReferral({ ...newReferral, notes: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReferralModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: YENİ ÜST YAPICI EKLE ─────────────────────────────────── */}
      {showBbModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-in" style={{ maxWidth: 500 }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>🛠️ Yeni Üst Yapıcı (Kasacı) Ekle</h3>
              <button className="btn-icon" onClick={() => setShowBbModal(false)}><FiX size={18} /></button>
            </div>
            <form onSubmit={handleCreateBodybuilder} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-muted">Firma Adı *</label>
                <input required className="input" placeholder="Örn: Karadeniz Frigo Kasa Sanayi" value={newBb.company_name} onChange={e => setNewBb({ ...newBb, company_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted">Usta / Yetkili Adı</label>
                  <input className="input" placeholder="Örn: Ahmet Usta" value={newBb.contact_person} onChange={e => setNewBb({ ...newBb, contact_person: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted">Telefon</label>
                  <input className="input" placeholder="0362 ..." value={newBb.phone} onChange={e => setNewBb({ ...newBb, phone: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted">Şehir (Hedef 9 İl) *</label>
                  <select className="input" value={newBb.city} onChange={e => setNewBb({ ...newBb, city: e.target.value })}>
                    {ALLOWED_PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted">Uzmanlık Alanı *</label>
                  <input required className="input" placeholder="Örn: Frigorifik, Damper, Vinç" value={newBb.specialty} onChange={e => setNewBb({ ...newBb, specialty: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">Adres / Sanayi Sitesi</label>
                <input className="input" placeholder="Örn: Tekkeköy Sanayi 4. Blok" value={newBb.address} onChange={e => setNewBb({ ...newBb, address: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBbModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
