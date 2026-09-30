import React, { useState, useEffect } from 'react';
import { vehiclesApi } from '../../api/client';
import { FiTruck, FiPlus, FiEdit2, FiTrash2, FiSearch, FiCheck, FiX, FiBarChart2, FiLayers, FiPackage, FiUsers } from 'react-icons/fi';
import StockMatchModal from './StockMatchModal';
import toast from 'react-hot-toast';

export default function VehicleManagement() {
  const [activeTab, setActiveTab] = useState('master'); // 'master', 'stock', 'reports'

  // Master Vehicles State
  const [masterVehicles, setMasterVehicles] = useState([]);
  const [groupFilter, setGroupFilter] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [masterForm, setMasterForm] = useState({
    brand: 'IVECO',
    vehicle_group: 'Daily',
    vehicle_sub_group: 'Şasi Kamyonet',
    model_code: '',
    tonnage_kg: 3500,
    wheel_type: 'twin',
    wheel_count: 6,
    engine_code: 'F1A',
    engine_power: 160,
    engine_volume: 2.3,
    transmission: 'Manuel',
    transmission_code: 'MAN',
    body_volume: '',
    wheelbase: '',
    wbs: '',
    equipment_level: '',
    usage_type: '',
    body_type: '',
    body_length: '',
    body_width: '',
    body_height: '',
    body_brand: '',
    body_price: '',
    active: true
  });

  // Stock State
  const [stocks, setStocks] = useState([]);
  const [selectedStockForMatch, setSelectedStockForMatch] = useState(null);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [stockForm, setStockForm] = useState({
    vehicle_id: '',
    chassis_no: '',
    status: 'in_stock',
    location: 'Samsun Merkez Bayi',
    year: 2024,
    color: 'Beyaz',
    list_price: '',
    currency: 'EUR',
    notes: ''
  });

  // Reports State
  const [reports, setReports] = useState(null);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    loadMasterVehicles();
    loadStocks();
    loadReports();
  }, []);

  const loadMasterVehicles = () => {
    vehiclesApi.getMasterVehicles({
      vehicle_group: groupFilter || undefined,
      model_code: searchCode || undefined,
      active_only: false,
      limit: 200
    })
      .then(res => setMasterVehicles(res.data || []))
      .catch(() => toast.error('Araç kataloğu yüklenemedi'));
  };

  const loadStocks = () => {
    vehiclesApi.getStockList()
      .then(res => setStocks(res.data || []))
      .catch(() => toast.error('Stok listesi yüklenemedi'));
  };

  const loadReports = () => {
    setLoadingReports(true);
    vehiclesApi.getDemandReports()
      .then(res => setReports(res.data))
      .catch(() => toast.error('Talep raporları yüklenemedi'))
      .finally(() => setLoadingReports(false));
  };

  useEffect(() => {
    loadMasterVehicles();
  }, [groupFilter, searchCode]);

  // Master Vehicle Handlers
  const handleSaveMaster = async (e) => {
    e.preventDefault();
    if (!masterForm.model_code) {
      toast.error('Model kodu zorunludur');
      return;
    }

    try {
      const payload = {
        ...masterForm,
        tonnage_kg: masterForm.tonnage_kg ? parseInt(masterForm.tonnage_kg) : null,
        engine_power: masterForm.engine_power ? parseInt(masterForm.engine_power) : null,
        engine_volume: masterForm.engine_volume ? parseFloat(masterForm.engine_volume) : null,
        body_volume: masterForm.body_volume ? parseFloat(masterForm.body_volume) : null,
        wheelbase: masterForm.wheelbase ? parseInt(masterForm.wheelbase) : null,
        wbs: masterForm.wbs ? parseInt(masterForm.wbs) : null,
        body_length: masterForm.body_length ? parseFloat(masterForm.body_length) : null,
        body_width: masterForm.body_width ? parseFloat(masterForm.body_width) : null,
        body_height: masterForm.body_height ? parseFloat(masterForm.body_height) : null,
        body_price: masterForm.body_price ? parseFloat(masterForm.body_price) : null,
      };

      if (editingVehicle) {
        await vehiclesApi.updateMasterVehicle(editingVehicle.id, payload);
        toast.success('Araç tanımı güncellendi');
      } else {
        await vehiclesApi.createMasterVehicle(payload);
        toast.success('Yeni araç tanımı eklendi');
      }

      setShowAddModal(false);
      setEditingVehicle(null);
      loadMasterVehicles();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Kayıt sırasında hata oluştu');
    }
  };

  const handleToggleActive = async (v) => {
    try {
      await vehiclesApi.updateMasterVehicle(v.id, { active: !v.active });
      toast.success(v.active ? 'Araç pasife alındı' : 'Araç aktifleştirildi');
      loadMasterVehicles();
    } catch {
      toast.error('Durum değiştirilemedi');
    }
  };

  // Stock Handlers
  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!stockForm.vehicle_id) {
      toast.error('Lütfen araç modelini seçin');
      return;
    }

    try {
      await vehiclesApi.createStock({
        ...stockForm,
        vehicle_id: parseInt(stockForm.vehicle_id),
        year: parseInt(stockForm.year) || 2024,
        list_price: stockForm.list_price ? parseFloat(stockForm.list_price) : null
      });
      toast.success('Stok aracı başarıyla eklendi 🎉');
      setShowAddStockModal(false);
      loadStocks();
    } catch {
      toast.error('Stok eklenemedi');
    }
  };

  const handleDeleteStock = async (stockId) => {
    if (!confirm('Bu stok kaydını silmek istediğinize emin misiniz?')) return;
    try {
      await vehiclesApi.deleteStock(stockId);
      toast.success('Stok aracı silindi');
      loadStocks();
    } catch {
      toast.error('Silme başarısız');
    }
  };

  return (
    <div className="animate-in" style={{ padding: '0 0 2rem 0' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12, marginBottom: '1.5rem'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiTruck color="#38bdf8" /> IVECO Araç Yönetimi & Talep Zekâsı
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
            Merkezi dinamik araç master verileri, bayi fiziksel stok envanteri ve müşteri talep analizleri
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 6, background: '#1e293b', padding: 4, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('master')}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700,
              border: 'none', cursor: 'pointer',
              background: activeTab === 'master' ? '#3b82f6' : 'transparent',
              color: activeTab === 'master' ? '#fff' : '#94a3b8'
            }}
          >
            📋 Araç Kataloğu ({masterVehicles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stock')}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700,
              border: 'none', cursor: 'pointer',
              background: activeTab === 'stock' ? '#10b981' : 'transparent',
              color: activeTab === 'stock' ? '#fff' : '#94a3b8'
            }}
          >
            📦 Stok Envanteri ({stocks.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('reports'); loadReports(); }}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700,
              border: 'none', cursor: 'pointer',
              background: activeTab === 'reports' ? '#8b5cf6' : 'transparent',
              color: activeTab === 'reports' ? '#fff' : '#94a3b8'
            }}
          >
            📊 Talep Zekâsı Raporları
          </button>
        </div>
      </div>

      {/* ── TAB 1: VEHICLE MASTER DATA ── */}
      {activeTab === 'master' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                style={{ width: 140 }}
                value={groupFilter}
                onChange={e => setGroupFilter(e.target.value)}
              >
                <option value="">Tüm Gruplar</option>
                <option value="Daily">Daily</option>
                <option value="Eurocargo">Eurocargo</option>
                <option value="S-Way">S-Way</option>
                <option value="X-Way">X-Way</option>
                <option value="T-Way">T-Way</option>
              </select>
              <input
                type="text"
                className="form-input"
                placeholder="Model Kodu ara (35C16, 150E21...)"
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                style={{ width: 220 }}
              />
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { setEditingVehicle(null); setShowAddModal(true); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
            >
              <FiPlus size={14} /> Yeni Model / WBS Ekle
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Grup</th>
                  <th>Kategori</th>
                  <th>Model Kodu</th>
                  <th>Tonaj / Teker</th>
                  <th>Motor (BG)</th>
                  <th>Dingil / WBS / Hacim</th>
                  <th>Şanzıman</th>
                  <th>Donanım / Kullanım</th>
                  <th>Durum</th>
                  <th style={{ textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {masterVehicles.map(v => (
                  <tr key={v.id} style={{ opacity: v.active ? 1 : 0.5 }}>
                    <td><strong style={{ color: '#38bdf8' }}>{v.vehicle_group}</strong></td>
                    <td>{v.vehicle_sub_group || '-'}</td>
                    <td><span style={{ fontWeight: 800, color: '#f8fafc' }}>{v.model_code}</span></td>
                    <td>{v.tonnage_kg ? `${v.tonnage_kg} kg` : '-'} / {v.wheel_type === 'twin' ? 'Çift' : 'Tek'}</td>
                    <td>{v.engine_power ? `${v.engine_power} BG` : '-'}</td>
                    <td>
                      {v.wheelbase ? `${v.wheelbase} mm Dingil` : v.wbs ? `WBS ${v.wbs}` : v.body_volume ? `${v.body_volume} m³` : '-'}
                    </td>
                    <td>{v.transmission}</td>
                    <td>{v.equipment_level || v.usage_type || '-'}</td>
                    <td>
                      {v.active ? (
                        <span className="badge badge-green">Aktif</span>
                      ) : (
                        <span className="badge" style={{ background: '#334155', color: '#94a3b8' }}>Pasif</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => { setEditingVehicle(v); setMasterForm({ ...v }); setShowAddModal(true); }}
                        style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', marginRight: 8 }}
                        title="Düzenle"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(v)}
                        style={{ background: 'none', border: 'none', color: v.active ? '#ef4444' : '#10b981', cursor: 'pointer' }}
                        title={v.active ? 'Pasife Al' : 'Aktifleştir'}
                      >
                        {v.active ? <FiTrash2 size={14} /> : <FiCheck size={14} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: PHYSICAL VEHICLE STOCK ── */}
      {activeTab === 'stock' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title" style={{ margin: 0 }}>
              📦 Bayi Araç Envanteri & Müşteri Eşleştirme
            </h3>
            <button
              className="btn btn-success btn-sm"
              onClick={() => setShowAddStockModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <FiPlus size={14} /> Stok Aracı Ekle
            </button>
          </div>

          <div style={{ overflowX: 'auto', padding: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {stocks.map(st => {
                const v = st.vehicle;
                return (
                  <div key={st.id} style={{
                    background: 'var(--bg-input)', borderRadius: 12, padding: '1.1rem',
                    border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: 10
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                          {v?.display_title || `${v?.vehicle_group} ${v?.model_code}`}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Şasi: {st.chassis_no || 'Belirtilmedi'} • {st.location}
                        </span>
                      </div>
                      <span className="badge badge-green">{st.status}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 10, fontSize: '0.8rem', color: '#cbd5e1' }}>
                      <span>Model: {st.year}</span>
                      <span>Renk: {st.color}</span>
                      {st.list_price && (
                        <span style={{ color: '#10b981', fontWeight: 700 }}>
                          {st.list_price.toLocaleString('tr-TR')} {st.currency}
                        </span>
                      )}
                    </div>

                    {st.notes && (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: 6 }}>
                        {st.notes}
                      </div>
                    )}

                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: 10, marginTop: 4
                    }}>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setSelectedStockForMatch(st.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.78rem' }}
                      >
                        <FiUsers size={13} /> Bu Araçla İlgilenen Müşteriler
                      </button>
                      <button
                        onClick={() => handleDeleteStock(st.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: DEMAND INTELLIGENCE REPORTS ── */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {loadingReports ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Raporlar hesaplanıyor...</div>
          ) : reports ? (
            <>
              {/* Total demand summary bar */}
              <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(90deg, rgba(30, 58, 138, 0.4), rgba(15, 23, 42, 0.8))' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                  📊 IVECO Müşteri Talep Dağılımı ve Trend Analizi
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                  Toplam İncelenen Talep: <strong>{reports.total_interests} Araç İhtiyacı</strong>
                </p>
              </div>

              {/* Grid of Report Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                {/* 1. By Group */}
                <div className="card">
                  <div className="card-header"><h4 className="card-title">Araç Grubuna Göre Talep</h4></div>
                  <div style={{ padding: '1rem' }}>
                    {reports.by_group.map(it => (
                      <div key={it.key} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                          <span><strong>{it.label}</strong></span>
                          <span>{it.demand_count} müşteri (%{it.percentage})</span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                          <div style={{ width: `${it.percentage}%`, height: '100%', background: '#3b82f6', borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. By Model */}
                <div className="card">
                  <div className="card-header"><h4 className="card-title">Model Bazında Talep</h4></div>
                  <div style={{ padding: '1rem' }}>
                    {reports.by_model.slice(0, 6).map(it => (
                      <div key={it.key} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                          <span><strong>{it.label}</strong></span>
                          <span>{it.demand_count} müşteri (%{it.percentage})</span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                          <div style={{ width: `${it.percentage}%`, height: '100%', background: '#10b981', borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. By Interest Level */}
                <div className="card">
                  <div className="card-header"><h4 className="card-title">İlgi Seviyesi Dağılımı</h4></div>
                  <div style={{ padding: '1rem' }}>
                    {reports.by_interest_level.map(it => (
                      <div key={it.key} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                          <span><strong>{it.label}</strong></span>
                          <span>{it.demand_count} talep (%{it.percentage})</span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                          <div style={{ width: `${it.percentage}%`, height: '100%', background: '#f59e0b', borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. By Purchase Timeframe */}
                <div className="card">
                  <div className="card-header"><h4 className="card-title">Satın Alma Zamanı</h4></div>
                  <div style={{ padding: '1rem' }}>
                    {reports.by_purchase_timeframe.map(it => (
                      <div key={it.key} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                          <span><strong>{it.label}</strong></span>
                          <span>{it.demand_count} talep (%{it.percentage})</span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                          <div style={{ width: `${it.percentage}%`, height: '100%', background: '#8b5cf6', borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Stock Match Modal */}
      {selectedStockForMatch && (
        <StockMatchModal
          stockId={selectedStockForMatch}
          onClose={() => setSelectedStockForMatch(null)}
        />
      )}

      {/* Add Master Vehicle Modal */}
      {showAddModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div className="modal-card animate-in" style={{
            background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '90vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, color: '#f8fafc' }}>
                {editingVehicle ? 'Araç Modelini Düzenle' : 'Yeni Araç Modeli Tanımla'}
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSaveMaster} style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                <div>
                  <label className="form-label">Araç Grubu *</label>
                  <select
                    className="form-control"
                    value={masterForm.vehicle_group}
                    onChange={e => setMasterForm({ ...masterForm, vehicle_group: e.target.value })}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Eurocargo">Eurocargo</option>
                    <option value="S-Way">S-Way</option>
                    <option value="X-Way">X-Way</option>
                    <option value="T-Way">T-Way</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Model Kodu *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Örn: 35C16, 150E21, 580"
                    value={masterForm.model_code}
                    onChange={e => setMasterForm({ ...masterForm, model_code: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div>
                  <label className="form-label">Tonaj (kg)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="3500, 7200..."
                    value={masterForm.tonnage_kg}
                    onChange={e => setMasterForm({ ...masterForm, tonnage_kg: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Motor Gücü (BG)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="160, 210, 500..."
                    value={masterForm.engine_power}
                    onChange={e => setMasterForm({ ...masterForm, engine_power: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Motor Hacmi (L)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    placeholder="2.3, 3.0, 6.7..."
                    value={masterForm.engine_volume}
                    onChange={e => setMasterForm({ ...masterForm, engine_volume: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div>
                  <label className="form-label">Dingil (Wheelbase mm)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="3750, 4350..."
                    value={masterForm.wheelbase}
                    onChange={e => setMasterForm({ ...masterForm, wheelbase: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">WBS (Eurocargo)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="3690, 5175..."
                    value={masterForm.wbs}
                    onChange={e => setMasterForm({ ...masterForm, wbs: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Hacim (Panelvan m³)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    placeholder="12, 16, 18..."
                    value={masterForm.body_volume}
                    onChange={e => setMasterForm({ ...masterForm, body_volume: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                <div>
                  <label className="form-label">Kasa Uzunluğu (mm - Opsiyonel)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Örn: 4200 (wheelbase'den ayrı)"
                    value={masterForm.body_length}
                    onChange={e => setMasterForm({ ...masterForm, body_length: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Kasa Tipi / Üst Yapı</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Açık Sac Kasa, Damper, Frigo..."
                    value={masterForm.body_type}
                    onChange={e => setMasterForm({ ...masterForm, body_type: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddStockModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div className="modal-card animate-in" style={{
            background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, width: '100%', maxWidth: 540, padding: '1.5rem'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#f8fafc' }}>Yeni Stok Aracı Girişi</h3>
            <form onSubmit={handleSaveStock} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="form-label">Araç Modeli *</label>
                <select
                  className="form-control"
                  value={stockForm.vehicle_id}
                  onChange={e => setStockForm({ ...stockForm, vehicle_id: e.target.value })}
                  required
                >
                  <option value="">-- Araç Seçin --</option>
                  {masterVehicles.filter(v => v.active).map(v => (
                    <option key={v.id} value={v.id}>
                      {v.display_title || `${v.vehicle_group} ${v.model_code}`}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                <div>
                  <label className="form-label">Şasi No (VIN)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ZCF35C..."
                    value={stockForm.chassis_no}
                    onChange={e => setStockForm({ ...stockForm, chassis_no: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Bulunduğu Yer</label>
                  <input
                    type="text"
                    className="form-control"
                    value={stockForm.location}
                    onChange={e => setStockForm({ ...stockForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div>
                  <label className="form-label">Model Yılı</label>
                  <input
                    type="number"
                    className="form-control"
                    value={stockForm.year}
                    onChange={e => setStockForm({ ...stockForm, year: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Renk</label>
                  <input
                    type="text"
                    className="form-control"
                    value={stockForm.color}
                    onChange={e => setStockForm({ ...stockForm, color: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Fiyat</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Liste Fiyatı"
                    value={stockForm.list_price}
                    onChange={e => setStockForm({ ...stockForm, list_price: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddStockModal(false)}>İptal</button>
                <button type="submit" className="btn btn-success">Stoka Ekle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
