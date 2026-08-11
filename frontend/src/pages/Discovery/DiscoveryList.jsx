import { useState, useEffect, useRef } from 'react';
import { discoveryApi, enrichmentApi, scannerApi, crmApi } from '../../api/client';
import useGeolocation from '../../hooks/useGeolocation';
import { searchIntentParser } from '../../services/searchIntentParser';
import { duplicateDetection } from '../../services/duplicateDetection';
import toast from 'react-hot-toast';
import { 
  FiZap, FiPlay, FiLoader, FiCheck, FiX, FiChevronLeft, 
  FiChevronRight, FiSearch, FiMapPin, FiPlus, FiNavigation, 
  FiSliders, FiArrowRight, FiInfo 
} from 'react-icons/fi';

// Samsun/Ordu/Sinop bölgesi için zenginleştirilmiş test mock verileri
const MOCK_PLACES_DATA = [
  { company_name: "Karadeniz Lojistik Hizmetleri", phone: "0362 266 9090", address: "Samsun OSB 4. Cadde No:12, Tekkeköy, Samsun", district: "Tekkeköy", city: "Samsun", website: "karadenizlojistik.com.tr", sector: "Nakliye / Lojistik", rating: 4.6, google_place_id: "mock_place_01", google_maps_url: "https://maps.google.com/?cid=1" },
  { company_name: "Çarşamba Akaryakıt ve Dinlenme Tesisleri", phone: "0362 833 4455", address: "Atatürk Bulvarı No:240, Çarşamba, Samsun", district: "Çarşamba", city: "Samsun", website: "carsambapetrol.com", sector: "Akaryakıt", rating: 4.2, google_place_id: "mock_place_02", google_maps_url: "https://maps.google.com/?cid=2" },
  { company_name: "Özkan Beton Yapı Elemanları", phone: "0362 222 1122", address: "Kutlukent Mah. 12. Sokak No:4, Tekkeköy, Samsun", district: "Tekkeköy", city: "Samsun", website: "ozkanbeton.com", sector: "İnşaat", rating: 4.0, google_place_id: "mock_place_03", google_maps_url: "https://maps.google.com/?cid=3" },
  { company_name: "Sinop Lider Nakliyat", phone: "0368 261 4050", address: "Yeni Sanayi Sitesi C Blok No:8, Sinop Merkez, Sinop", district: "Merkez", city: "Sinop", website: "sinoplider.com", sector: "Nakliye / Lojistik", rating: 4.5, google_place_id: "mock_place_04", google_maps_url: "https://maps.google.com/?cid=4" },
  { company_name: "Çorum Akaryakıt Ticaret A.Ş.", phone: "0364 225 1020", address: "Ankara Yolu 3. km, Çorum Merkez, Çorum", district: "Merkez", city: "Çorum", website: "corumpetrol.com", sector: "Akaryakıt", rating: 4.1, google_place_id: "mock_place_05", google_maps_url: "https://maps.google.com/?cid=5" },
  { company_name: "Samsun Gıda Dağıtım Deposu", phone: "0362 444 3456", address: "Gıda Borsası No:18, İlkadım, Samsun", district: "İlkadım", city: "Samsun", website: "samsungida.com", sector: "Gıda", rating: 4.3, google_place_id: "mock_place_06", google_maps_url: "https://maps.google.com/?cid=6" },
  { company_name: "Ordu Taşımacılık Kooperatifi", phone: "0452 234 5678", address: "Terminal Cad. No:45, Altınordu, Ordu", district: "Altınordu", city: "Ordu", website: "ordutasimacilik.org", sector: "Nakliye / Lojistik", rating: 3.9, google_place_id: "mock_place_07", google_maps_url: "https://maps.google.com/?cid=7" },
  { company_name: "Amasya Yapı İnşaat Malzemeleri", phone: "0358 218 8090", address: "Sanayi Sitesi 2. Blok No:14, Amasya Merkez, Amasya", district: "Merkez", city: "Amasya", website: "amasyayapi.com", sector: "İnşaat", rating: 4.4, google_place_id: "mock_place_08", google_maps_url: "https://maps.google.com/?cid=8" }
];

export default function DiscoveryList() {
  // Geolocation hook'u
  const { location, error: gpsError, loading: gpsLoading, getLocation } = useGeolocation();
  
  // Arama tabları (Google Places Canlı Arama vs Taramalar)
  const [activeTab, setActiveTab] = useState('live_search'); // live_search | sources
  
  // Canlı Arama State'leri
  const [searchQuery, setSearchQuery] = useState('');
  const [parsedIntent, setParsedIntent] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState([]);
  const [crmCustomers, setCrmCustomers] = useState([]);
  const [loadingCrm, setLoadingCrm] = useState(false);
  const [searchLimit, setSearchLimit] = useState(20);

  // Tarama Kaynakları State'leri (Mevcut yapı)
  const [sources, setSources] = useState([]);
  const [companies, setCompanies] = useState({ items: [], total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [running, setRunning] = useState(null);
  const pageSize = 15;

  // 1. CRM'deki tüm müşterileri fuzzy matching için çek (Performanslı)
  useEffect(() => {
    setLoadingCrm(true);
    // Tek seferde fuzzy için tüm müşteri listesini çekiyoruz (Pagination devre dışı veya yüksek limit)
    crmApi.getCustomers({ page: 1, page_size: 5000 })
      .then(res => {
        setCrmCustomers(res.data.items || []);
      })
      .catch(() => {})
      .finally(() => setLoadingCrm(false));
  }, []);

  // 2. Tarama kaynaklarını çek (Mevcut Yapı)
  useEffect(() => {
    discoveryApi.getSources().then(r => setSources(r.data)).catch(() => {});
  }, []);

  // 3. Taranan firmaları çek (Mevcut Yapı)
  useEffect(() => {
    if (activeTab === 'sources') {
      loadCompanies();
    }
  }, [page, statusFilter, activeTab]);

  const loadCompanies = () => {
    discoveryApi.getCompanies({ page, page_size: pageSize, status: statusFilter || undefined })
      .then(r => setCompanies(r.data)).catch(() => {});
  };

  // ── Arama ve Google Places Entegrasyonu ──────────────────────────────────
  const handleLiveSearch = async (e) => {
    if (e) e.preventDefault();
    if (searchQuery.length < 3) {
      toast.error("Arama terimi en az 3 karakter olmalıdır.");
      return;
    }

    setScanning(true);
    setScanResults([]);
    
    // 1. Doğal dil parser'ı çalıştır
    const intent = searchIntentParser.parse(searchQuery);
    setParsedIntent(intent);

    try {
      // 2. Arama endpoint'ini çağır
      // (Burası backend'de Google Places'tan veri çekecek)
      const res = await scannerApi.search({
        query: searchQuery,
        max_results: searchLimit
      });

      let placesData = [];

      if (res.data.error || (res.data.results && res.data.results.length === 0)) {
        // API key yoksa veya hata geldiyse: Akıllı Mock Fallback devreye girsin!
        console.warn("Google API hatası. Mock veri fallback yapılıyor:", res.data.error);
        toast("Google API Anahtarı eksik/geçersiz. Test verileri gösteriliyor.", { icon: 'ℹ️', duration: 4000 });
        
        // Sorguya göre mock verileri filtrele
        const lowerQ = searchQuery.toLowerCase();
        placesData = MOCK_PLACES_DATA.filter(item => {
          const matchesSector = item.sector.toLowerCase().includes(intent.sector?.toLowerCase() || '') ||
                                item.company_name.toLowerCase().includes(intent.sector?.toLowerCase() || '');
          const matchesCity = item.city.toLowerCase().includes(intent.city?.toLowerCase() || '') ||
                              item.address.toLowerCase().includes(intent.city?.toLowerCase() || '');
          return matchesSector || matchesCity || item.company_name.toLowerCase().includes(lowerQ);
        });

        // Eğer filtre sonucu boşsa, rastgele 4 tane dön
        if (placesData.length === 0) {
          placesData = MOCK_PLACES_DATA.slice(0, 4);
        }
      } else {
        placesData = res.data.results || [];
      }

      // 3. Client-side Fuzzy Matching ile eşleştirme yap
      const processedResults = placesData.map(biz => {
        const matchResult = duplicateDetection.findMatch(biz, crmCustomers);
        
        // Konum hesaplama
        let distance = null;
        if (location && biz.latitude && biz.longitude) {
          // Gerçek mesafe
          distance = duplicateDetection.calculateDistance(
            location.latitude, location.longitude,
            biz.latitude, biz.longitude
          );
        } else if (location) {
          // GPS varsa ve mock veri ise, test amaçlı rastgele yakın mesafe üne
          distance = Math.random() * 8000 + 500; // 500m ile 8.5km arası
        }

        return {
          ...biz,
          match: matchResult, // { customer, score, matchType }
          distance: distance
        };
      });

      // Mesafeye veya skora göre sırala
      processedResults.sort((a, b) => {
        if (a.distance && b.distance) return a.distance - b.distance;
        return b.rating - a.rating;
      });

      setScanResults(processedResults);
      toast.success(`${processedResults.length} firma bulundu ve analiz edildi.`);

    } catch (err) {
      console.error(err);
      toast.error("Arama sırasında bir hata oluştu.");
    } finally {
      setScanning(false);
    }
  };

  // Tek firmayı CRM'e aktar
  const addSingleToCrm = async (biz) => {
    try {
      const res = await scannerApi.addToCrm({
        company_name: biz.company_name,
        phone: biz.phone,
        address: biz.address,
        district: biz.district,
        city: biz.city,
        website: biz.website,
        sector: biz.sector,
        google_place_id: biz.google_place_id,
        google_maps_url: biz.google_maps_url,
        rating: biz.rating
      });

      if (res.data.status === 'exists') {
        toast.error(res.data.message);
      } else {
        toast.success(res.data.message || 'Firma CRM\'e başarıyla eklendi!');
        // UI'da durumu güncelle (match ekle)
        setScanResults(prev => prev.map(item => {
          if (item.google_place_id === biz.google_place_id) {
            return {
              ...item,
              match: {
                customer: { id: res.data.customer_id, company_name: biz.company_name, segment: 'C' },
                score: 1.0,
                matchType: 'just_added'
              }
            };
          }
          return item;
        }));
        
        // CRM listesini güncelle
        crmApi.getCustomers({ page: 1, page_size: 5000 }).then(r => setCrmCustomers(r.data.items || []));
      }
    } catch {
      toast.error("CRM'e eklenirken bir hata oluştu.");
    }
  };

  // ── Tarama Kaynakları Bölümü İşlemleri (Mevcut Yapı) ──────────────────────────
  const runSource = async (id) => {
    setRunning(id);
    try {
      const res = await discoveryApi.runSource(id);
      toast.success(`${res.data.new_companies} yeni firma bulundu!`);
      discoveryApi.getSources().then(r => setSources(r.data));
      loadCompanies();
    } catch (err) { toast.error(err.response?.data?.detail || 'Tarama hatası'); }
    finally { setRunning(null); }
  };

  const enrichAll = async () => {
    try {
      const res = await enrichmentApi.enrichAll();
      toast.success(`${res.data.enriched} firma zenginleştirildi (${res.data.above_threshold} eşik üstü)`);
      loadCompanies();
    } catch { toast.error('Zenginleştirme hatası'); }
  };

  const convertCompany = async (id) => {
    try {
      await discoveryApi.convertToCustomer(id);
      toast.success('Firma CRM\'e aktarıldı');
      loadCompanies();
    } catch (err) { toast.error(err.response?.data?.detail || 'Aktarma hatası'); }
  };

  const rejectCompany = async (id) => {
    try {
      await discoveryApi.rejectCompany(id);
      toast('Firma reddedildi');
      loadCompanies();
    } catch { toast.error('Hata'); }
  };

  const totalPages = Math.ceil((companies.total || 0) / pageSize);

  return (
    <div className="animate-in">
      {/* Tab Switcher */}
      <div className="flex gap-4 mb-6" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          className={`btn ${activeTab === 'live_search' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('live_search')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          🔎 Google Places Canlı Arama
        </button>
        <button 
          className={`btn ${activeTab === 'sources' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('sources')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          📂 Tarama Kaynakları (TSO / Kayıtlar)
        </button>
      </div>

      {/* ── CANLI ARAMA TABI ────────────────────────────────────────────────── */}
      {activeTab === 'live_search' && (
        <div className="flex flex-col gap-6">
          {/* Arama Paneli */}
          <div className="card glass-card">
            <div className="card-header">
              <h3 className="card-title">Saha Satış Arama Paneli</h3>
              <button className="btn btn-secondary btn-sm" onClick={getLocation} disabled={gpsLoading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FiNavigation size={14} className={gpsLoading ? 'spin' : ''} />
                {location ? 'Konumu Yenile' : 'Konum Al'}
              </button>
            </div>
            
            <form onSubmit={handleLiveSearch} className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="flex items-center gap-2 w-full" style={{ background: 'var(--bg-input)', padding: '10px 16px', borderRadius: 25, border: '1px solid var(--border-color)' }}>
                  <FiSearch color="var(--text-muted)" size={18} />
                  <input 
                    type="text" 
                    placeholder="Samsun lojistik firmaları, 5km akaryakıt, Çarşamba beton..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '0.95rem' }} 
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={scanning}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 25, padding: '0 24px' }}>
                  {scanning ? <FiLoader size={16} className="spin" /> : <FiSearch size={16} />}
                  Bul
                </button>
              </div>

              {/* Arama Parametreleri */}
              <div className="flex items-center gap-6 text-xs text-muted flex-wrap">
                <div className="flex items-center gap-2">
                  <FiSliders size={14} /> Limit:
                  <select 
                    value={searchLimit} 
                    onChange={(e) => setSearchLimit(parseInt(e.target.value))}
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'white', outline: 'none', borderRadius: 4, padding: '2px 6px' }}
                  >
                    <option value={10}>10 Sonuç</option>
                    <option value={20}>20 Sonuç</option>
                    <option value={40}>40 Sonuç</option>
                  </select>
                </div>
                
                {location ? (
                  <div style={{ color: 'var(--accent-green)' }}>
                    📍 Aktif Konum: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)} (Hassasiyet: ~{Math.round(location.accuracy)}m)
                  </div>
                ) : (
                  <div style={{ color: 'var(--accent-amber)' }}>
                    ⚠️ Konum alınamadı. Arama varsayılan merkezden yapılacaktır.
                  </div>
                )}
              </div>
            </form>

            {/* Arama İntent Raporu */}
            {parsedIntent && (
              <div className="mt-4 text-xs" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', padding: '10px 14px', borderLeft: '3px solid var(--accent-blue-light)' }}>
                <strong>Analiz Edilen Arama:</strong> {parsedIntent.sector || 'Tüm Sektörler'} 
                {parsedIntent.city && ` · Şehir: ${parsedIntent.city}`}
                {parsedIntent.radius && ` · Yarıçap: ${parsedIntent.radius / 1000} km`}
                {parsedIntent.segment && ` · Segment: ${parsedIntent.segment}`}
                {parsedIntent.searchAlongRoute && ' · 🗺 Rota Üzerinde Arama Etkin'}
              </div>
            )}
          </div>

          {/* Arama Sonuç Listesi */}
          <div className="card glass-card">
            <div className="card-header">
              <h3 className="card-title">Arama Sonuçları</h3>
              <span className="badge badge-blue">{scanResults.length} Sonuç</span>
            </div>

            {scanning ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <FiLoader size={36} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-blue-light)' }} />
                <span>Google Places taranıyor ve CRM verileriyle eşleştiriliyor...</span>
              </div>
            ) : scanResults.length > 0 ? (
              <div className="flex flex-col gap-3">
                {scanResults.map((biz, idx) => {
                  const hasMatch = biz.match && biz.match.score >= 0.75;
                  const isJustAdded = biz.match && biz.match.matchType === 'just_added';
                  
                  return (
                    <div key={idx} className="list-item" style={{ padding: '1.25rem', background: 'var(--bg-input)', borderLeft: `4px solid ${hasMatch ? 'var(--accent-green)' : 'var(--accent-blue-light)'}` }}>
                      <div className="flex justify-between items-start w-full">
                        <div>
                          {/* Başlık ve Segment */}
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-base" style={{ color: 'var(--text-heading)' }}>{biz.company_name}</span>
                            {biz.rating && <span className="badge badge-amber">★ {biz.rating.toFixed(1)}</span>}
                          </div>
                          
                          {/* Adres ve Sektör */}
                          <div className="text-xs text-muted mt-2">
                            {biz.sector} · {biz.address}
                          </div>

                          {/* Telefon ve Web */}
                          <div className="text-xs text-secondary mt-1">
                            {biz.phone && `📞 ${biz.phone}`} {biz.website && ` · 🌐 ${biz.website}`}
                          </div>

                          {/* Konum / Mesafe */}
                          {biz.distance && (
                            <div className="text-xs mt-2" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-purple)' }}>
                              <FiMapPin size={12} /> Yaklaşık mesafe: <strong>{biz.distance < 1000 ? `${Math.round(biz.distance)} m` : `${(biz.distance / 1000).toFixed(1)} km`}</strong>
                            </div>
                          )}

                          {/* Eşleşme Bildirimi */}
                          {hasMatch && (
                            <div className="mt-3 text-xs" style={{ color: 'var(--accent-green)', background: 'var(--accent-green-glow)', padding: '6px 12px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <FiCheck size={12} />
                              {isJustAdded ? (
                                <span>CRM'e Eklendi (Müşteri ID: {biz.match.customer.id})</span>
                              ) : (
                                <span>Mevcut Müşteri: <strong>{biz.match.customer.company_name}</strong> (%{Math.round(biz.match.score * 100)} eşleşme - {biz.match.matchType === 'phone' ? 'Telefon' : 'İsim'})</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Aksiyon Butonları */}
                        <div className="flex gap-2">
                          {hasMatch ? (
                            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/customers/${biz.match.customer.id}`)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              Detay <FiArrowRight size={14} />
                            </button>
                          ) : (
                            <button className="btn btn-primary btn-sm" onClick={() => addSingleToCrm(biz)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <FiPlus size={14} /> CRM'e Ekle
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <FiInfo size={24} style={{ marginBottom: 8 }} />
                <p>Google Places'tan sonuçları görmek için yukarıdaki kutuya arama yazın.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TARAMA KAYNAKLARI TABI (Mevcut Yapı) ─────────────────────────────── */}
      {activeTab === 'sources' && (
        <div className="flex flex-col gap-6">
          {/* Sources Grid */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Tarama Kaynakları</h3>
              <button className="btn btn-primary btn-sm" onClick={enrichAll} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FiZap size={14} /> Tümünü Zenginleştir
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {sources.map(s => (
                <div key={s.id} style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--border-color)', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-blue-light)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-sm">{s.name}</span>
                    <span className={`badge ${s.is_active ? 'badge-green' : 'badge-red'}`}>{s.is_active ? 'Aktif' : 'Pasif'}</span>
                  </div>
                  <p className="text-xs text-muted mb-4">Tip: {s.source_type} · Son: {s.last_run_at ? new Date(s.last_run_at).toLocaleDateString('tr-TR') : 'Hiç'}</p>
                  {s.last_run_count > 0 && <p className="text-xs text-muted mb-4">Son taramada: {s.last_run_count} firma</p>}
                  <button className="btn btn-secondary btn-sm w-full" onClick={() => runSource(s.id)} disabled={running === s.id}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    {running === s.id ? <><FiLoader size={14} className="spin" /> Taranıyor...</> : <><FiPlay size={14} /> Tara</>}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-3">
              {['', 'new', 'enriched', 'converted', 'rejected'].map(s => (
                <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => { setStatusFilter(s); setPage(1); }}>
                  {s === '' ? 'Tümü' : s === 'new' ? 'Yeni' : s === 'enriched' ? 'Zenginleştirilmiş' : s === 'converted' ? 'Aktarılmış' : 'Reddedilmiş'}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted">Toplam: {companies.total}</span>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr><th>Firma</th><th>Şehir</th><th>Sektör</th><th>Skor</th><th>Durum</th><th>Tarih</th><th>İşlem</th></tr>
              </thead>
              <tbody>
                {companies.items.length > 0 ? companies.items.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="font-semibold">{c.company_name}</div>
                      <div className="text-xs text-muted">{c.activity_description}</div>
                    </td>
                    <td>{c.city || '—'}{c.district ? ` / ${c.district}` : ''}</td>
                    <td className="text-muted">{c.sector || '—'}</td>
                    <td>
                      {c.enrichment_score !== null ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold" style={{ color: c.enrichment_score >= 55 ? 'var(--accent-green)' : c.enrichment_score >= 35 ? 'var(--accent-amber)' : 'var(--accent-red)' }}>
                            {c.enrichment_score}
                          </span>
                          <div className="score-bar" style={{ width: 40 }}>
                            <div className={`score-bar-fill ${c.enrichment_score >= 75 ? 'very-high' : c.enrichment_score >= 55 ? 'high' : c.enrichment_score >= 35 ? 'medium' : 'low'}`}
                              style={{ width: `${c.enrichment_score}%` }} />
                          </div>
                        </div>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <span className={`badge ${c.status === 'new' ? 'badge-blue' : c.status === 'enriched' ? 'badge-amber' : c.status === 'converted' ? 'badge-green' : 'badge-red'}`}>
                        {c.status === 'new' ? 'Yeni' : c.status === 'enriched' ? 'Zenginleştirilmiş' : c.status === 'converted' ? 'Aktarılmış' : c.status === 'matched' ? 'Eşleşti' : 'Reddedildi'}
                      </span>
                    </td>
                    <td className="text-muted text-xs">{new Date(c.discovered_at).toLocaleDateString('tr-TR')}</td>
                    <td>
                      {(c.status === 'new' || c.status === 'enriched') && (
                        <div className="flex gap-2">
                          <button className="btn btn-success btn-sm" onClick={() => convertCompany(c.id)} title="CRM'e aktar"
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, padding: 0 }}>
                            <FiCheck size={16} />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => rejectCompany(c.id)} title="Reddet"
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, padding: 0 }}>
                            <FiX size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Firma bulunamadı</td></tr>}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                <span className="text-xs text-muted">Sayfa {page} / {totalPages}</span>
                <div className="flex gap-2">
                  <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <FiChevronLeft size={16} /> Önceki
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    Sonraki <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
