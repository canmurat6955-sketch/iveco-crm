import React, { useState, useEffect } from 'react';
import { vehiclesApi } from '../../api/client';
import { FiX, FiCheck, FiTruck, FiZap, FiInfo, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';

const INTEREST_LEVELS = [
  { value: 'very_low', label: 'Çok Düşük', color: '#64748b' },
  { value: 'low', label: 'Düşük', color: '#3b82f6' },
  { value: 'medium', label: 'Orta', color: '#f59e0b' },
  { value: 'high', label: 'Yüksek', color: '#f97316' },
  { value: 'purchase_ready', label: 'Satın Alma Aşamasında 🔥', color: '#ef4444' },
];

const PURCHASE_TIMEFRAMES = [
  { value: 'immediate', label: 'Hemen (Hazır Alıcı)' },
  { value: '0_30_days', label: '0–30 Gün (Bu Ay)' },
  { value: '1_3_months', label: '1–3 Ay' },
  { value: '3_6_months', label: '3–6 Ay' },
  { value: '6_12_months', label: '6–12 Ay' },
  { value: 'unknown', label: 'Belirsiz / Takip' },
];

export default function VehicleInterestModal({ customerId, existingInterest = null, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [cascade, setCascade] = useState(null);
  const [allMasterVehicles, setAllMasterVehicles] = useState([]);

  // Form State
  const [selectedGroup, setSelectedGroup] = useState(existingInterest?.vehicle?.vehicle_group || 'Daily');
  const [selectedSubGroup, setSelectedSubGroup] = useState(existingInterest?.vehicle?.vehicle_sub_group || '');
  const [selectedVolume, setSelectedVolume] = useState(existingInterest?.vehicle?.body_volume || '');
  const [selectedWheelbase, setSelectedWheelbase] = useState(existingInterest?.vehicle?.wheelbase || '');
  const [selectedWbs, setSelectedWbs] = useState(existingInterest?.vehicle?.wbs || '');
  const [selectedEquipment, setSelectedEquipment] = useState(existingInterest?.vehicle?.equipment_level || '');
  const [selectedUsage, setSelectedUsage] = useState(existingInterest?.vehicle?.usage_type || '');

  // Target Vehicle Selection
  const [selectedVehicleId, setSelectedVehicleId] = useState(existingInterest?.vehicle_id || null);
  const [interestLevel, setInterestLevel] = useState(existingInterest?.interest_level || 'high');
  const [purchaseTimeframe, setPurchaseTimeframe] = useState(existingInterest?.purchase_timeframe || '0_30_days');
  const [estimatedQuantity, setEstimatedQuantity] = useState(existingInterest?.estimated_quantity || 1);
  const [customerNote, setCustomerNote] = useState(existingInterest?.customer_note || '');

  // Quick Code parser box
  const [quickCode, setQuickCode] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);

  useEffect(() => {
    // Load cascade options and master vehicles
    vehiclesApi.getCascadeData()
      .then(res => setCascade(res.data))
      .catch(() => {});

    vehiclesApi.getMasterVehicles({ limit: 200 })
      .then(res => setAllMasterVehicles(res.data || []))
      .catch(() => {});
  }, []);

  // When group changes, reset sub-selections
  const handleGroupChange = (group) => {
    setSelectedGroup(group);
    setSelectedSubGroup('');
    setSelectedVolume('');
    setSelectedWheelbase('');
    setSelectedWbs('');
    setSelectedEquipment('');
    setSelectedUsage('');
    setSelectedVehicleId(null);
  };

  // Dynamic Auto-Suggestion & Match computation
  useEffect(() => {
    if (!allMasterVehicles.length) return;

    // Filter matching master vehicles
    let filtered = allMasterVehicles.filter(v => v.vehicle_group === selectedGroup);

    if (selectedSubGroup) {
      filtered = filtered.filter(v => v.vehicle_sub_group === selectedSubGroup);
    }
    if (selectedVolume) {
      filtered = filtered.filter(v => v.body_volume === parseFloat(selectedVolume));
    }
    if (selectedWheelbase) {
      filtered = filtered.filter(v => v.wheelbase === parseInt(selectedWheelbase));
    }
    if (selectedWbs) {
      filtered = filtered.filter(v => v.wbs === parseInt(selectedWbs));
    }
    if (selectedEquipment) {
      filtered = filtered.filter(v => v.equipment_level === selectedEquipment);
    }
    if (selectedUsage) {
      filtered = filtered.filter(v => v.usage_type?.toLowerCase().includes(selectedUsage.toLowerCase()));
    }

    // Auto-select if exactly 1 matches or first match
    if (filtered.length === 1 && !selectedVehicleId) {
      setSelectedVehicleId(filtered[0].id);
    } else if (filtered.length > 0 && !filtered.some(f => f.id === selectedVehicleId)) {
      setSelectedVehicleId(filtered[0].id);
    }
  }, [selectedGroup, selectedSubGroup, selectedVolume, selectedWheelbase, selectedWbs, selectedEquipment, selectedUsage, allMasterVehicles]);

  // Handle Quick Code Parse
  const handleParseCode = async (code) => {
    setQuickCode(code);
    if (!code || code.length < 3) {
      setParsedPreview(null);
      return;
    }
    try {
      const res = await vehiclesApi.parseVehicleCode(code);
      setParsedPreview(res.data);

      // Attempt to auto-match in master vehicles
      const match = allMasterVehicles.find(v =>
        v.model_code.toUpperCase() === res.data.model_code.toUpperCase() &&
        (!res.data.wheelbase || v.wheelbase === res.data.wheelbase) &&
        (!res.data.wbs || v.wbs === res.data.wbs) &&
        (!res.data.body_volume || v.body_volume === res.data.body_volume)
      );

      if (match) {
        setSelectedVehicleId(match.id);
        setSelectedGroup(match.vehicle_group);
        if (match.vehicle_sub_group) setSelectedSubGroup(match.vehicle_sub_group);
      }
    } catch {
      setParsedPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicleId) {
      toast.error('Lütfen müşterinin ilgilendiği aracı seçin');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        vehicle_id: selectedVehicleId,
        interest_level: interestLevel,
        purchase_timeframe: purchaseTimeframe,
        estimated_quantity: parseInt(estimatedQuantity) || 1,
        customer_note: customerNote.trim() || undefined,
        usage_type: selectedUsage || undefined
      };

      if (existingInterest) {
        await vehiclesApi.updateCustomerInterest(existingInterest.id, payload);
        toast.success('Araç ilgisi başarıyla güncellendi 🚚');
      } else {
        await vehiclesApi.createCustomerInterest(customerId, payload);
        toast.success('Araç ilgisi başarıyla eklendi 🎉');
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Araç ilgisi kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Get currently selected vehicle entity
  const currentVehicle = allMasterVehicles.find(v => v.id === selectedVehicleId);

  // Available options from cascade or filtered
  const subGroupOptions = cascade?.sub_groups?.[selectedGroup] || [];
  const currentVolKey = `${selectedGroup}|${selectedSubGroup}`;
  const volumeOptions = cascade?.volumes?.[currentVolKey] || [];
  const currentWbKey = `${selectedGroup}|${selectedSubGroup}`;
  const wheelbaseOptions = cascade?.wheelbases?.[currentWbKey] || [];

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem'
    }}>
      <div className="modal-card animate-in" style={{
        background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 16, width: '100%', maxWidth: 650, maxHeight: '92vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(90deg, rgba(30, 58, 138, 0.3), rgba(15, 23, 42, 0.8))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: '#1e3a8a',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa'
            }}>
              <FiTruck size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                {existingInterest ? 'Araç İlgisini Düzenle' : 'Yeni Araç İhtiyacı / İlgisi Ekle'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                Kademeli akıllı seçim veya hızlı model kodu çözücü
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#94a3b8',
            cursor: 'pointer', padding: 6, borderRadius: 6
          }}>
            <FiX size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Quick Parser Box */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)', border: '1px dashed #334155',
            borderRadius: 10, padding: '0.85rem 1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 4 }}>
                <FiZap size={13} /> Hızlı Model Kodu Çözümleyici (Opsiyonel)
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Örn: 35C16 3750, 16m3, 150E21 5175</span>
            </div>
            <input
              type="text"
              className="form-control"
              placeholder="Araç kodunu yazın (35C16, 72C16 4350, S-Way 580 Diamond)..."
              value={quickCode}
              onChange={(e) => handleParseCode(e.target.value)}
              style={{ background: '#090d16', fontSize: '0.85rem' }}
            />
            {parsedPreview && (
              <div style={{
                marginTop: 6, fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)',
                padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                ✓ <strong>Çözümlendi:</strong> {parsedPreview.summary_text}
              </div>
            )}
          </div>

          {/* 1. ADIM: Araç Grubu Seçimi */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6, display: 'block' }}>
              1. Araç Grubu
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {['Daily', 'Eurocargo', 'S-Way', 'X-Way', 'T-Way'].map(grp => {
                const active = selectedGroup === grp;
                return (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => handleGroupChange(grp)}
                    style={{
                      padding: '8px 4px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700,
                      border: active ? '2px solid #3b82f6' : '1px solid #334155',
                      background: active ? 'rgba(59, 130, 246, 0.15)' : '#1e293b',
                      color: active ? '#60a5fa' : '#cbd5e1',
                      cursor: 'pointer', transition: 'all 0.15s ease'
                    }}
                  >
                    {grp}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. ADIM: Alt Grup / Gövde */}
          {subGroupOptions.length > 0 && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6, display: 'block' }}>
                2. Kategori / Kullanım Tipi
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {subGroupOptions.map(sub => {
                  const active = selectedSubGroup === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        setSelectedSubGroup(sub);
                        setSelectedVolume('');
                        setSelectedWheelbase('');
                      }}
                      style={{
                        padding: '6px 14px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
                        border: active ? '1.5px solid #10b981' : '1px solid #334155',
                        background: active ? 'rgba(16, 185, 129, 0.15)' : '#1e293b',
                        color: active ? '#34d399' : '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. ADIM: Hacim (Daily Panelvan) veya Dingil / WBS / Donanım */}
          {volumeOptions.length > 0 && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6, display: 'block' }}>
                Panelvan Hacmi
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {volumeOptions.map(vol => {
                  const active = parseFloat(selectedVolume) === vol;
                  return (
                    <button
                      key={vol}
                      type="button"
                      onClick={() => {
                        setSelectedVolume(vol);
                        // Otomatik model önerisi (16m3 -> 35S16)
                        if (vol === 12 || vol === 16) {
                          const s16 = allMasterVehicles.find(v => v.model_code === '35S16' && v.body_volume === vol);
                          if (s16) setSelectedVehicleId(s16.id);
                        } else if (vol === 18) {
                          const c16 = allMasterVehicles.find(v => v.model_code === '35C16' && v.body_volume === vol);
                          if (c16) setSelectedVehicleId(c16.id);
                        }
                      }}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 700,
                        border: active ? '2px solid #8b5cf6' : '1px solid #334155',
                        background: active ? 'rgba(139, 92, 246, 0.15)' : '#1e293b',
                        color: active ? '#c084fc' : '#cbd5e1',
                        cursor: 'pointer'
                      }}
                    >
                      {vol} m³
                      <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 'normal', color: '#94a3b8', marginTop: 2 }}>
                        {vol === 18 ? '35C16 (Çift Teker)' : '35S16 (Tek Teker)'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dingil Mesafesi (Şasi / Rigit Kamyon) */}
          {wheelbaseOptions.length > 0 && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6, display: 'block' }}>
                Dingil Mesafesi (Wheelbase mm)
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {wheelbaseOptions.map(wb => {
                  const active = parseInt(selectedWheelbase) === wb;
                  return (
                    <button
                      key={wb}
                      type="button"
                      onClick={() => setSelectedWheelbase(wb)}
                      style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
                        border: active ? '1.5px solid #f59e0b' : '1px solid #334155',
                        background: active ? 'rgba(245, 158, 11, 0.15)' : '#1e293b',
                        color: active ? '#fbbf24' : '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      {wb} mm
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Araç Modeli Seçimi (Tüm filtrelere uyan araçlar) */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 6, display: 'block' }}>
              Eşleşen Araç Spesifikasyonu
            </label>
            <select
              className="form-control"
              value={selectedVehicleId || ''}
              onChange={(e) => setSelectedVehicleId(parseInt(e.target.value) || null)}
              style={{ background: '#090d16', color: '#f8fafc', fontWeight: 600, fontSize: '0.85rem' }}
            >
              <option value="">-- Araç Seçin --</option>
              {allMasterVehicles
                .filter(v => v.vehicle_group === selectedGroup)
                .map(v => (
                  <option key={v.id} value={v.id}>
                    {v.display_title || `${v.vehicle_group} ${v.model_code}`}
                  </option>
                ))}
            </select>
            {currentVehicle && (
              <div style={{
                marginTop: 6, padding: '8px 12px', borderRadius: 8, background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '0.78rem', color: '#93c5fd',
                display: 'flex', gap: 12, flexWrap: 'wrap'
              }}>
                <span><strong>Tonaj:</strong> {currentVehicle.tonnage_kg ? `${currentVehicle.tonnage_kg.toLocaleString('tr-TR')} kg` : '-'}</span>
                <span><strong>Teker:</strong> {currentVehicle.wheel_type === 'single' ? 'Tek Teker' : 'Çift Teker'}</span>
                <span><strong>Motor:</strong> {currentVehicle.engine_power} BG ({currentVehicle.engine_volume}L)</span>
                <span><strong>Şanzıman:</strong> {currentVehicle.transmission}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {/* İlgi Seviyesi */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 4, display: 'block' }}>
                İlgi Seviyesi
              </label>
              <select
                className="form-control"
                value={interestLevel}
                onChange={(e) => setInterestLevel(e.target.value)}
                style={{ background: '#090d16', fontSize: '0.82rem' }}
              >
                {INTEREST_LEVELS.map(lvl => (
                  <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                ))}
              </select>
            </div>

            {/* Satın Alma Zamanı */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 4, display: 'block' }}>
                Satın Alma Zamanı
              </label>
              <select
                className="form-control"
                value={purchaseTimeframe}
                onChange={(e) => setPurchaseTimeframe(e.target.value)}
                style={{ background: '#090d16', fontSize: '0.82rem' }}
              >
                {PURCHASE_TIMEFRAMES.map(tf => (
                  <option key={tf.value} value={tf.value}>{tf.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12 }}>
            {/* Adet */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 4, display: 'block' }}>
                Talep Adedi
              </label>
              <input
                type="number"
                min="1"
                max="100"
                className="form-control"
                value={estimatedQuantity}
                onChange={(e) => setEstimatedQuantity(e.target.value)}
                style={{ background: '#090d16', fontSize: '0.85rem' }}
              />
            </div>

            {/* Taşınacak Yük / Kullanım Amacı */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 4, display: 'block' }}>
                Kullanım Amacı / Kasa İhtiyacı
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: 4.20m Açık Sac Kasa, Frigo, Hafriyat Damper..."
                value={selectedUsage}
                onChange={(e) => setSelectedUsage(e.target.value)}
                style={{ background: '#090d16', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Açıklama / Not */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 4, display: 'block' }}>
              Özel Müşteri Talebi & Notlar
            </label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Müşterinin özel takas şartı, vade talebi veya kasa boyu detayları..."
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              style={{ background: '#090d16', fontSize: '0.82rem', resize: 'vertical' }}
            />
          </div>

          {/* Modal Actions */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 10,
            paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !selectedVehicleId}
              style={{
                padding: '8px 24px', fontSize: '0.85rem', fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: 6
              }}
            >
              {loading ? 'Kaydediliyor...' : (existingInterest ? 'Güncelle' : 'Araç İlgisini Kaydet')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
