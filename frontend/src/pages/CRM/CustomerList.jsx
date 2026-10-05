import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { crmApi, vehiclesApi } from '../../api/client';
import toast from 'react-hot-toast';
import { 
  FiDownload, FiPlus, FiTrash2, FiCheckSquare, FiSquare, FiGitMerge, 
  FiUsers, FiZap, FiTruck, FiPhone, FiMessageSquare, FiNavigation, FiMapPin, FiChevronRight 
} from 'react-icons/fi';
import { openWhatsApp } from '../../utils/whatsapp';
import VehicleAISearchModal from '../../components/Search/VehicleAISearchModal';

const SEGMENTS = { A: 'badge-green', B: 'badge-blue', C: 'badge-amber', D: 'badge-red' };
const POTENTIALS = { very_high: 'Çok Yüksek', high: 'Yüksek', medium: 'Orta', low: 'Düşük' };

export default function CustomerList() {
  const [customers, setCustomers] = useState({ items: [], total: 0, page: 1, total_pages: 1 });
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [sector, setSector] = useState('');
  const [vehicleGroup, setVehicleGroup] = useState('');
  const [interestLevel, setInterestLevel] = useState('');
  const [purchaseTimeframe, setPurchaseTimeframe] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [showMerge, setShowMerge] = useState(false);
  const [merging, setMerging] = useState(false);
  const [masterVehicles, setMasterVehicles] = useState([]);
  const [form, setForm] = useState({ 
    company_name: '', tax_number: '', vergi_dairesi: '', city: '', district: '', phone: '', email: '', 
    sector: '', segment: 'C', potential_level: 'medium', sales_notes: '',
    latitude: '', longitude: '',
    vehicle_group: '', vehicle_id: '', interest_level: 'high', purchase_timeframe: '0_30_days', estimated_quantity: 1
  });
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (new URLSearchParams(location.search).get('add') === 'true') {
      setShowAdd(true);
    }
  }, [location.search]);

  useEffect(() => {
    vehiclesApi.getMasterVehicles({ limit: 200 })
      .then(r => setMasterVehicles(r.data || []))
      .catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    setLoadError(false);
    crmApi.getCustomers({
      page, page_size: 15,
      search: search || undefined,
      city: city || undefined,
      sector: sector || undefined,
      vehicle_group: vehicleGroup || undefined,
      interest_level: interestLevel || undefined,
      purchase_timeframe: purchaseTimeframe || undefined
    })
      .then(r => setCustomers(r.data))
      .catch(() => {
        setLoadError(true);
        toast.error('Müşteriler yüklenemedi - sunucu bağlantısını kontrol edin');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, search, city, sector, vehicleGroup, interestLevel, purchaseTimeframe]);

  // Seçim değişince sayfayı temizle
  useEffect(() => { setSelected(new Set()); }, [page, search, city, sector, vehicleGroup, interestLevel, purchaseTimeframe]);

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === customers.items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(customers.items.map(c => c.id)));
    }
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`${selected.size} müşteri kalıcı olarak silinecek. Emin misiniz?`)) return;
    setDeleting(true);
    try {
      await crmApi.bulkDelete([...selected]);
      toast.success(`${selected.size} müşteri silindi`);
      setSelected(new Set());
      load();
    } catch (err) {
      toast.error('Silme hatası');
    } finally {
      setDeleting(false);
    }
  };

  const deleteSingle = async (id, name, e) => {
    e.stopPropagation();
    if (!confirm(`"${name}" kalıcı olarak silinecek. Emin misiniz?`)) return;
    try {
      await crmApi.deleteCustomer(id);
      toast.success('Müşteri silindi');
      load();
    } catch {
      toast.error('Silme hatası');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null
      };
      const vehicleId = submitData.vehicle_id ? parseInt(submitData.vehicle_id) : null;
      const interestLevel = submitData.interest_level || 'high';
      const purchaseTimeframe = submitData.purchase_timeframe || '0_30_days';
      const estQty = parseInt(submitData.estimated_quantity) || 1;

      delete submitData.vehicle_group;
      delete submitData.vehicle_id;
      delete submitData.interest_level;
      delete submitData.purchase_timeframe;
      delete submitData.estimated_quantity;

      const res = await crmApi.createCustomer(submitData);
      const newCustomerId = res.data?.id;

      if (newCustomerId && vehicleId) {
        await vehiclesApi.createCustomerInterest(newCustomerId, {
          vehicle_id: vehicleId,
          interest_level: interestLevel,
          purchase_timeframe: purchaseTimeframe,
          estimated_quantity: estQty
        });
        toast.success('Müşteri ve araç ilgisi başarıyla eklendi 🎉');
      } else {
        toast.success('Müşteri eklendi');
      }

      setShowAdd(false);
      setForm({ 
        company_name: '', tax_number: '', vergi_dairesi: '', city: '', district: '', phone: '', email: '', 
        sector: '', segment: 'C', potential_level: 'medium', sales_notes: '',
        latitude: '', longitude: '',
        vehicle_group: '', vehicle_id: '', interest_level: 'high', purchase_timeframe: '0_30_days', estimated_quantity: 1
      });
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Hata oluştu');
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Cihazınız konum servisini desteklemiyor.");
      return;
    }

    toast.loading("Uydudan GPS konumunuz alınıyor...", { id: 'gps_load' });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        setForm(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));

        toast.success("Konum alındı! 📍", { id: 'gps_load' });

        // Adres, şehir ve ilçeyi otomatik doldurmak için reverse geocoding yap
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
            headers: { 'Accept-Language': 'tr' }
          });
          const data = await response.json();
          if (data && data.address) {
            const addr = data.address;
            const detectedCity = addr.province || addr.city || '';
            const detectedDistrict = addr.suburb || addr.town || addr.district || addr.borough || '';
            
            setForm(prev => ({
              ...prev,
              city: detectedCity.replace(' İl', '').replace(' İli', '').trim(),
              district: detectedDistrict.trim(),
              sales_notes: (prev.sales_notes || '') + `\n[Müşteri Ziyareti GPS Konumu]: ${data.display_name}`
            }));
            toast.success(`Konum çözümlendi: ${detectedCity} / ${detectedDistrict}`);
          }
        } catch (err) {
          console.warn("Konum çözümlenemedi:", err);
        }
      },
      (error) => {
        toast.error("Konum alınamadı. İzinlerinizi ve GPS'inizi kontrol edin.", { id: 'gps_load' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMerge = async (primaryId) => {
    const secondaryIds = [...selected].filter(id => id !== primaryId);
    if (secondaryIds.length === 0) return;
    setMerging(true);
    try {
      const res = await crmApi.mergeCustomers(primaryId, secondaryIds);
      toast.success(res.data.message);
      setShowMerge(false);
      setSelected(new Set());
      load();
      // Birleştirilen ana firmaya git
      navigate(`/customers/${primaryId}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Birleştirme hatası');
    } finally {
      setMerging(false);
    }
  };

  const allChecked = customers.items.length > 0 && selected.size === customers.items.length;

  return (
    <div className="animate-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div className="flex gap-3" style={{ flex: 1, maxWidth: 700 }}>
          <input className="form-input" placeholder="Firma adı, telefon veya e-posta ile ara..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <select className="form-select" style={{ width: 150 }} value={city} onChange={e => { setCity(e.target.value); setPage(1); }}>
            <option value="">Tüm Şehirler</option>
            <option value="Samsun">Samsun</option>
            <option value="Amasya">Amasya</option>
            <option value="Tokat">Tokat</option>
            <option value="Çorum">Çorum</option>
            <option value="Ordu">Ordu</option>
            <option value="Sinop">Sinop</option>
            <option value="Bilinmiyor">Bilinmiyor</option>
          </select>
          <select className="form-select" style={{ width: 180 }} value={sector} onChange={e => { setSector(e.target.value); setPage(1); }}>
            <option value="">Tüm Sektörler</option>
            <option value="Nakliyat">Nakliyat / Lojistik</option>
            <option value="İnşaat">İnşaat / Yapı</option>
            <option value="Otomotiv">Otomotiv</option>
            <option value="Gıda">Gıda / Tarım</option>
            <option value="Tarım">Tarım / Hayvancılık</option>
            <option value="Metal">Metal / Demir Çelik</option>
            <option value="Makine">Makine / Ekipman</option>
            <option value="Tekstil">Tekstil</option>
            <option value="Petrol">Petrol / Enerji</option>
            <option value="Elektrik">Elektrik / Enerji</option>
            <option value="Plastik">Plastik / Ambalaj</option>
            <option value="Mobilya">Mobilya / Ahşap</option>
            <option value="Sağlık">Sağlık / İlaç</option>
            <option value="Turizm">Turizm / Konaklama</option>
            <option value="Diğer">Diğer</option>
          </select>
          <select className="form-select" style={{ width: 140 }} value={vehicleGroup} onChange={e => { setVehicleGroup(e.target.value); setPage(1); }}>
            <option value="">Tüm Araçlar</option>
            <option value="Daily">Daily</option>
            <option value="Eurocargo">Eurocargo</option>
            <option value="S-Way">S-Way</option>
            <option value="X-Way">X-Way</option>
            <option value="T-Way">T-Way</option>
          </select>
          <select className="form-select" style={{ width: 150 }} value={interestLevel} onChange={e => { setInterestLevel(e.target.value); setPage(1); }}>
            <option value="">Tüm İlgiler</option>
            <option value="purchase_ready">🔥 Satın Almada</option>
            <option value="high">Yüksek İlgi</option>
            <option value="medium">Orta İlgi</option>
            <option value="low">Düşük İlgi</option>
          </select>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setShowAiModal(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8',
              color: '#38bdf8', fontWeight: 600, padding: '0 12px', whiteSpace: 'nowrap'
            }}
          >
            <FiZap size={14} /> AI Araç Araması
          </button>
        </div>
        <div className="flex gap-3">
          {selected.size > 0 && (
            <>
              {selected.size >= 2 && (
                <button className="btn btn-sm" onClick={() => setShowMerge(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none' }}>
                  <FiGitMerge size={14} /> {selected.size} Kayıt Birleştir
                </button>
              )}
              <button className="btn btn-sm" onClick={deleteSelected} disabled={deleting}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ef4444', color: '#fff', border: 'none' }}>
                <FiTrash2 size={14} /> {deleting ? 'Siliniyor...' : `${selected.size} Seçili Sil`}
              </button>
            </>
          )}
          <button className="btn btn-secondary" onClick={() => navigate('/customers/import')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><FiDownload size={16} /> İçe Aktar</button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><FiPlus size={16} /> Yeni Müşteri</button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-6 text-xs text-muted">
        <span>Toplam: {customers.total} müşteri</span>
        <span>Sayfa: {customers.page} / {customers.total_pages}</span>
        {selected.size > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}>{selected.size} seçili</span>}
      </div>

      {/* Mobile Cards View (< 768px) */}
      <div className="cards-mobile-view mb-6">
        {loading ? (
          <div className="card text-center py-8 text-muted">Müşteriler yükleniyor...</div>
        ) : loadError ? (
          <div className="card text-center py-8" style={{ color: '#f87171' }}>
            ⚠️ Sunucuya bağlanılamadı.
            <div style={{ marginTop: 8 }}>
              <button className="btn btn-sm btn-primary" onClick={load}>Tekrar Dene</button>
            </div>
          </div>
        ) : customers.items.length > 0 ? (
          customers.items.map(c => {
            const isSelected = selected.has(c.id);
            const navUrl = c.latitude && c.longitude
              ? `https://maps.apple.com/?daddr=${c.latitude},${c.longitude}&dirflg=d`
              : `https://maps.apple.com/?daddr=${encodeURIComponent([c.address, c.district, c.city].filter(Boolean).join(' ') || c.company_name)}&dirflg=d`;

            return (
              <div
                key={c.id}
                className="card"
                onClick={() => navigate(`/customers/${c.id}`)}
                style={{
                  padding: '1rem',
                  border: isSelected ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                  background: isSelected ? 'rgba(59,130,246,0.06)' : 'var(--bg-card)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
                    <div onClick={(e) => toggleSelect(c.id, e)} style={{ paddingTop: 2 }}>
                      {isSelected ? (
                        <FiCheckSquare size={18} style={{ color: '#38bdf8' }} />
                      ) : (
                        <FiSquare size={18} style={{ color: 'var(--text-muted)' }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-heading)' }}>
                        {c.company_name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <FiMapPin size={12} />
                        <span>{[c.district, c.city].filter(Boolean).join(' / ') || 'Konum belirtilmedi'}</span>
                        {c.sector && <span>• {c.sector}</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span className={`badge ${SEGMENTS[c.segment] || 'badge-blue'}`}>
                      {c.segment}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: c.potential_score >= 50 ? '#10b981' : '#f59e0b' }}>
                      %{c.potential_score || 0}
                    </span>
                  </div>
                </div>

                {/* Mobile Quick Action Strip */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: c.phone ? '1fr 1fr 1fr auto' : '1fr auto',
                    gap: 6,
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: '1px solid var(--border-color)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {c.phone && (
                    <a
                      href={`tel:${c.phone}`}
                      className="btn btn-xs"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        textDecoration: 'none',
                        fontWeight: 700
                      }}
                    >
                      <FiPhone size={13} /> Ara
                    </a>
                  )}

                  {c.phone && (
                    <button
                      type="button"
                      className="btn btn-xs"
                      onClick={() => openWhatsApp(c.phone)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        background: 'rgba(37, 211, 102, 0.15)',
                        color: '#25d366',
                        border: '1px solid rgba(37, 211, 102, 0.3)',
                        fontWeight: 700
                      }}
                    >
                      <FiMessageSquare size={13} /> WA
                    </button>
                  )}

                  <a
                    href={navUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-xs"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      background: 'rgba(139, 92, 246, 0.15)',
                      color: '#c084fc',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      textDecoration: 'none',
                      fontWeight: 600
                    }}
                  >
                    <FiNavigation size={13} /> Rota
                  </a>

                  <button
                    type="button"
                    className="btn btn-xs btn-secondary"
                    onClick={() => navigate(`/customers/${c.id}`)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FiChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card text-center py-8 text-muted">Kriterlere uygun müşteri bulunamadı</div>
        )}
      </div>

      {/* Desktop Table View (>= 769px) */}
      <div className="card table-desktop-view" style={{ padding: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40, cursor: 'pointer', textAlign: 'center' }} onClick={toggleAll}>
                {allChecked ? <FiCheckSquare size={16} style={{ color: 'var(--accent-blue-light)' }} /> : <FiSquare size={16} />}
              </th>
              <th>Firma Adı</th><th>Şehir</th><th>Sektör</th><th className="hide-on-mobile">Telefon</th>
              <th>Segment</th><th className="hide-on-mobile">Öncelik</th><th>Potansiyel</th><th className="hide-on-mobile">Skor</th><th className="hide-on-mobile">Kaynak</th>
              <th style={{ width: 50 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="empty-state py-8">Müşteriler yükleniyor...</td></tr>
            ) : loadError ? (
              <tr>
                <td colSpan={10} className="empty-state py-8" style={{ color: '#f87171' }}>
                  ⚠️ Sunucuya bağlanılamadı. Lütfen CRM backend servisinin (port 8000) açık olduğunu kontrol edin.
                  <div style={{ marginTop: '0.6rem' }}>
                    <button className="btn btn-sm btn-primary" onClick={load}>Tekrar Dene</button>
                  </div>
                </td>
              </tr>
            ) : customers.items.length > 0 ? customers.items.map(c => (
              <tr key={c.id} className="clickable-row" onClick={() => navigate(`/customers/${c.id}`)}
                style={selected.has(c.id) ? { background: 'rgba(59,130,246,0.08)' } : undefined}>
                <td style={{ textAlign: 'center' }} onClick={e => toggleSelect(c.id, e)}>
                  {selected.has(c.id) ? <FiCheckSquare size={16} style={{ color: 'var(--accent-blue-light)' }} /> : <FiSquare size={16} style={{ color: 'var(--text-muted)' }} />}
                </td>
                <td className="font-semibold">{c.company_name}</td>
                <td>{c.city || '—'} {c.district ? `/ ${c.district}` : ''}</td>
                <td className="text-muted">{c.sector || '—'}</td>
                <td className="hide-on-mobile">{c.phone || '—'}</td>
                <td><span className={`badge ${SEGMENTS[c.segment] || 'badge-blue'}`}>{c.segment}</span></td>
                <td className="hide-on-mobile">
                  <span className="badge" style={{
                    background: c.priority_score >= 70 ? 'rgba(239, 68, 68, 0.12)' : c.priority_score >= 40 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(156, 163, 175, 0.12)',
                    color: c.priority_score >= 70 ? '#f87171' : c.priority_score >= 40 ? '#fbbf24' : '#9ca3af',
                    border: `1px solid ${c.priority_score >= 70 ? 'rgba(239, 68, 68, 0.25)' : c.priority_score >= 40 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(156, 163, 175, 0.25)'}`,
                    fontWeight: 700
                  }}>
                    {c.priority_score}%
                  </span>
                </td>
                <td><span className="text-sm">{POTENTIALS[c.potential_level] || c.potential_level}</span></td>
                <td className="hide-on-mobile">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{c.potential_score}</span>
                    <div className="score-bar" style={{ width: 50 }}>
                      <div className={`score-bar-fill ${c.potential_score >= 75 ? 'very-high' : c.potential_score >= 55 ? 'high' : c.potential_score >= 35 ? 'medium' : 'low'}`}
                        style={{ width: `${c.potential_score}%` }} />
                    </div>
                  </div>
                </td>
                <td className="hide-on-mobile"><span className="badge badge-blue">{c.source}</span></td>
                <td onClick={e => e.stopPropagation()}>
                  <button onClick={e => deleteSingle(c.id, c.company_name, e)} title="Sil"
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, borderRadius: 4, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#ef4444'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                    <FiTrash2 size={14} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={10} className="empty-state">Kriterlere uygun müşteri bulunamadı</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {customers.total_pages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Önceki</button>
          {Array.from({ length: Math.min(5, customers.total_pages) }, (_, i) => {
            const p = Math.max(1, page - 2) + i;
            if (p > customers.total_pages) return null;
            return <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>;
          })}
          <button disabled={page >= customers.total_pages} onClick={() => setPage(p => p + 1)}>Sonraki →</button>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Yeni Müşteri Ekle</h3>
            <form onSubmit={handleAdd}>
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Firma Adı *</label>
                  <input className="form-input" required value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Vergi Dairesi</label>
                  <input className="form-input" value={form.vergi_dairesi || ''} onChange={e => setForm({ ...form, vergi_dairesi: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Vergi No</label>
                  <input className="form-input" value={form.tax_number || ''} onChange={e => setForm({ ...form, tax_number: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Şehir</label>
                  <input className="form-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">İlçe</label>
                  <input className="form-input" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} />
                </div>
              </div>
              
              {/* GPS Konum Butonu ve Koordinatlar */}
              <div style={{ marginBottom: 15, background: 'rgba(99, 102, 241, 0.04)', padding: 12, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary w-full flex items-center justify-center gap-2" 
                  onClick={handleGetLocation}
                  style={{ background: 'rgba(59, 130, 246, 0.12)', borderColor: 'rgba(59, 130, 246, 0.25)', color: '#60a5fa', fontWeight: 'bold', height: 38 }}
                >
                  📍 Bulunduğum Noktayı Al (GPS Konumu)
                </button>
                {form.latitude && form.longitude ? (
                  <div style={{ fontSize: 11, color: '#34d399', marginTop: 8, textAlign: 'center', fontWeight: '600' }}>
                    Konum Kaydedildi: Enlem: {parseFloat(form.latitude).toFixed(6)} | Boylam: {parseFloat(form.longitude).toFixed(6)}
                  </div>
                ) : (
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
                    * Müşterinin yanındayken bu butona basarak GPS koordinatlarını otomatik kaydedebilirsiniz.
                  </div>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">E-posta</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Sektör</label>
                  <input className="form-input" value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Web Sitesi</label>
                  <input className="form-input" value={form.website || ''} onChange={e => setForm({ ...form, website: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Segment</label>
                  <select className="form-select" value={form.segment} onChange={e => setForm({ ...form, segment: e.target.value })}>
                    <option value="A">A — Premium</option>
                    <option value="B">B — Yüksek</option>
                    <option value="C">C — Orta</option>
                    <option value="D">D — Düşük</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Potansiyel</label>
                  <select className="form-select" value={form.potential_level} onChange={e => setForm({ ...form, potential_level: e.target.value })}>
                    <option value="very_high">Çok Yüksek</option>
                    <option value="high">Yüksek</option>
                    <option value="medium">Orta</option>
                    <option value="low">Düşük</option>
                  </select>
                </div>
              </div>

              {/* 🚚 İlgilenebileceği / Aradığı Araç */}
              <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: 8, padding: '0.85rem 1rem', marginBottom: 15 }}>
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, color: '#60a5fa', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiTruck size={15} /> İlgilenebileceği / Aradığı Araç (Opsiyonel)
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Araç Grubu</label>
                    <select
                      className="form-select"
                      value={form.vehicle_group || ''}
                      onChange={e => {
                        const grp = e.target.value;
                        const firstInGroup = masterVehicles.find(v => v.vehicle_group === grp);
                        setForm(prev => ({
                          ...prev,
                          vehicle_group: grp,
                          vehicle_id: firstInGroup ? String(firstInGroup.id) : ''
                        }));
                      }}
                    >
                      <option value="">-- Araç Grubu Seçin (Opsiyonel) --</option>
                      <option value="Daily">Daily (Hafif Ticari / Panelvan / Şasi)</option>
                      <option value="Eurocargo">Eurocargo (Orta Segment Kamyon)</option>
                      <option value="S-Way">S-Way (Ağır Vasıta / TIR Çekici)</option>
                      <option value="T-Way">T-Way (İnşaat / Hafriyat / Mikser)</option>
                      <option value="X-Way">X-Way (Şantiye / Karma Taşımacılık)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Model / Kasa</label>
                    <select
                      className="form-select"
                      value={form.vehicle_id || ''}
                      onChange={e => {
                        const vid = e.target.value;
                        const matched = masterVehicles.find(v => String(v.id) === String(vid));
                        setForm(prev => ({
                          ...prev,
                          vehicle_id: vid,
                          vehicle_group: matched ? matched.vehicle_group : prev.vehicle_group
                        }));
                      }}
                      disabled={!form.vehicle_group && masterVehicles.length === 0}
                    >
                      <option value="">-- Model Seçin --</option>
                      {masterVehicles
                        .filter(v => !form.vehicle_group || v.vehicle_group === form.vehicle_group)
                        .map(v => (
                          <option key={v.id} value={v.id}>
                            {v.display_title || `${v.vehicle_group} ${v.model_code} (${v.vehicle_sub_group || ''})`}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                {form.vehicle_id && (
                  <div className="form-row" style={{ marginTop: 8 }}>
                    <div className="form-group">
                      <label className="form-label">İlgi Seviyesi</label>
                      <select
                        className="form-select"
                        value={form.interest_level || 'high'}
                        onChange={e => setForm(prev => ({ ...prev, interest_level: e.target.value }))}
                      >
                        <option value="purchase_ready">Satın Alma Aşamasında 🔥</option>
                        <option value="high">Yüksek İlgi</option>
                        <option value="medium">Orta İlgi</option>
                        <option value="low">Düşük İlgi</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Alım Zamanı</label>
                      <select
                        className="form-select"
                        value={form.purchase_timeframe || '0_30_days'}
                        onChange={e => setForm(prev => ({ ...prev, purchase_timeframe: e.target.value }))}
                      >
                        <option value="immediate">Hemen (Hazır)</option>
                        <option value="0_30_days">0 - 30 Gün İçi</option>
                        <option value="1_3_months">1 - 3 Ay İçi</option>
                        <option value="3_6_months">3 - 6 Ay İçi</option>
                        <option value="6_12_months">6 - 12 Ay İçi</option>
                        <option value="unknown">Belirsiz</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ maxWidth: 100 }}>
                      <label className="form-label">Adet</label>
                      <input
                        className="form-input"
                        type="number"
                        min="1"
                        value={form.estimated_quantity || 1}
                        onChange={e => setForm(prev => ({ ...prev, estimated_quantity: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Notlar</label>
                <textarea className="form-textarea" value={form.sales_notes || ''} onChange={e => setForm({ ...form, sales_notes: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Merge Modal */}
      {showMerge && (
        <div className="modal-overlay" onClick={() => setShowMerge(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 className="modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiGitMerge size={20} style={{ color: '#8b5cf6' }} /> Kayıtları Birleştir
              </h3>
            </div>
            <p className="text-sm text-muted mb-6">Ana firmayı seçin. Diğer kayıtlar bu firmanın <strong>irtibat kişisi</strong> olarak taşınacak.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 400, overflowY: 'auto' }}>
              {customers.items.filter(c => selected.has(c.id)).map(c => (
                <div key={c.id}
                  onClick={() => !merging && handleMerge(c.id)}
                  style={{
                    background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '0.875rem',
                    border: '2px solid transparent', cursor: merging ? 'wait' : 'pointer',
                    transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'var(--bg-input)'; }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.company_name}</div>
                    <div className="text-xs text-muted" style={{ marginTop: 4 }}>
                      {c.city || '?'} • {c.sector || '?'} • {c.phone || 'Tel yok'}
                    </div>
                  </div>
                  <span className="badge" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: '0.7rem' }}>
                    🏢 Ana Firma Yap
                  </span>
                </div>
              ))}
            </div>
            <div className="modal-actions" style={{ marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowMerge(false)}>İptal</button>
            </div>
          </div>
        </div>
      )}

      <VehicleAISearchModal isOpen={showAiModal} onClose={() => setShowAiModal(false)} />
    </div>
  );
}
