import React, { useState, useEffect } from 'react';
import { 
  FiX, FiCheck, FiAlertCircle, FiPlus, FiEdit2, FiTrash2, 
  FiCamera, FiTrendingUp, FiDollarSign, FiCalendar, FiActivity, FiTag, FiLoader 
} from 'react-icons/fi';
import { crmApi } from '../../api/client';
import VoiceInputButton from '../common/VoiceInputButton';

const BRANDS = [
  'IVECO', 'Ford Trucks', 'Mercedes-Benz', 'MAN', 'Scania', 
  'Isuzu', 'Volvo Trucks', 'Renault Trucks', 'Mitsubishi Fuso', 'Otokar', 'Diğer'
];

const BODY_TYPES = [
  'Kapalı Kasa', 'Açık Sac Kasa', 'Damper', 'Frigorifik (Soğutuculu)', 
  'Çekici (TIR)', 'Tenteli Kasa', 'Platform / Vinç', 'Tanker', 'Çöp / Hizmet Aracı', 'Şasi'
];

const STATUS_OPTIONS = [
  { id: 'pending', label: 'Ekspertiz Bekliyor', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300' },
  { id: 'appraised', label: 'Ekspertiz Fiyatlandı', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300' },
  { id: 'accepted', label: 'Takas Anlaşıldı', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300' },
  { id: 'rejected', label: 'Reddedildi / İptal', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300' },
  { id: 'completed', label: 'Satışla Takaslandı', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300' },
];

export default function TradeInModal({ 
  customerId, 
  customerName, 
  isOpen, 
  onClose,
  onPhotoRequest 
}) {
  const [tradeIns, setTradeIns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    vehicle_brand: 'IVECO',
    vehicle_model: '',
    model_year: new Date().getFullYear() - 3,
    mileage_km: '',
    plate_number: '',
    body_type: 'Kapalı Kasa',
    condition_notes: '',
    customer_expected_price: '',
    appraised_value: '',
    currency: 'TL',
    status: 'pending'
  });

  useEffect(() => {
    if (isOpen && customerId) {
      loadTradeIns();
    }
  }, [isOpen, customerId]);

  const loadTradeIns = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await crmApi.getTradeIns(customerId);
      setTradeIns(res.data || []);
      if (!res.data || res.data.length === 0) {
        setViewMode('form');
        resetForm();
      } else {
        setViewMode('list');
      }
    } catch (err) {
      console.error('Failed to load trade-ins:', err);
      setError('Takas kayıtları yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      vehicle_brand: 'IVECO',
      vehicle_model: '',
      model_year: new Date().getFullYear() - 3,
      mileage_km: '',
      plate_number: '',
      body_type: 'Kapalı Kasa',
      condition_notes: '',
      customer_expected_price: '',
      appraised_value: '',
      currency: 'TL',
      status: 'pending'
    });
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      vehicle_brand: item.vehicle_brand,
      vehicle_model: item.vehicle_model,
      model_year: item.model_year || '',
      mileage_km: item.mileage_km || '',
      plate_number: item.plate_number || '',
      body_type: item.body_type || 'Kapalı Kasa',
      condition_notes: item.condition_notes || '',
      customer_expected_price: item.customer_expected_price || '',
      appraised_value: item.appraised_value || '',
      currency: item.currency || 'TL',
      status: item.status || 'pending'
    });
    setViewMode('form');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vehicle_brand || !form.vehicle_model) {
      setError('Lütfen araç markası ve modelini belirtin');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const payload = {
        ...form,
        model_year: form.model_year ? parseInt(form.model_year) : null,
        mileage_km: form.mileage_km ? parseInt(form.mileage_km) : null,
        customer_expected_price: form.customer_expected_price ? parseFloat(form.customer_expected_price) : null,
        appraised_value: form.appraised_value ? parseFloat(form.appraised_value) : null,
      };

      if (editingId) {
        await crmApi.updateTradeIn(editingId, payload);
      } else {
        await crmApi.createTradeIn(customerId, payload);
      }

      await loadTradeIns();
      setViewMode('list');
      resetForm();
    } catch (err) {
      console.error('Save trade-in error:', err);
      setError('Takas değerlendirmesi kaydedilirken hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (tradeInId) => {
    if (!window.confirm('Bu takas değerlendirme kaydını silmek istediğinize emin misiniz?')) return;
    try {
      await crmApi.deleteTradeIn(tradeInId);
      setTradeIns(prev => prev.filter(t => t.id !== tradeInId));
    } catch (err) {
      console.error('Delete trade-in error:', err);
      alert('Kayıt silinemedi.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔄</span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                Takas / 2. El Araç Ekspertiz & Değerleme
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-sm sm:max-w-md">
              {customerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 pt-2 bg-slate-50/30 dark:bg-slate-800/30">
          <button
            onClick={() => {
              setViewMode('list');
              resetForm();
            }}
            className={`pb-2.5 px-4 font-medium text-sm border-b-2 transition-all flex items-center gap-2 ${
              viewMode === 'list'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <FiTrendingUp className="w-4 h-4" />
            Kayıtlar ({tradeIns.length})
          </button>
          <button
            onClick={() => {
              setViewMode('form');
              resetForm();
            }}
            className={`pb-2.5 px-4 font-medium text-sm border-b-2 transition-all flex items-center gap-2 ${
              viewMode === 'form' && !editingId
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <FiPlus className="w-4 h-4" />
            {editingId ? 'Kaydı Düzenle' : 'Yeni Takas / Ekspertiz Ekle'}
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <FiLoader className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                  <p className="text-sm">Takas kayıtları yükleniyor...</p>
                </div>
              ) : tradeIns.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center mx-auto mb-3 text-xl">
                    🔄
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    Kayıtlı takas veya 2. el ekspertiz aracı yok
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                    Müşterinin takasa vermek istediği araçları, model yılı, kilometre ve ekspertiz bedeli ile ekleyebilirsiniz.
                  </p>
                  <button
                    onClick={() => {
                      setViewMode('form');
                      resetForm();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
                  >
                    <FiPlus className="w-4 h-4" />
                    İlk Takas Aracını Ekle
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tradeIns.map((item) => {
                    const statusObj = STATUS_OPTIONS.find(s => s.id === item.status) || STATUS_OPTIONS[0];

                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {item.vehicle_brand} {item.vehicle_model}
                              </span>
                              {item.model_year && (
                                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                                  {item.model_year}
                                </span>
                              )}
                              {item.plate_number && (
                                <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">
                                  {item.plate_number}
                                </span>
                              )}
                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusObj.color}`}>
                                {statusObj.label}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                              {item.mileage_km && (
                                <span className="flex items-center gap-1">
                                  <FiActivity className="w-3.5 h-3.5 text-slate-400" />
                                  {item.mileage_km.toLocaleString('tr-TR')} km
                                </span>
                              )}
                              {item.body_type && (
                                <span className="flex items-center gap-1">
                                  <FiTag className="w-3.5 h-3.5 text-slate-400" />
                                  {item.body_type}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                                {new Date(item.created_at).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {onPhotoRequest && (
                              <button
                                onClick={() => onPhotoRequest(item.id)}
                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                title="Takas Fotoğrafı Çek / Yükle"
                              >
                                <FiCamera className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Düzenle"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Sil"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Fiyat Bilgileri Kutusu */}
                        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800">
                          <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 font-medium block">
                              Müşteri Beklenti Fiyatı
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                              {item.customer_expected_price 
                                ? `${item.customer_expected_price.toLocaleString('tr-TR')} ${item.currency || 'TL'}` 
                                : 'Belirtilmedi'}
                            </span>
                          </div>

                          <div className="bg-emerald-50/70 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40">
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                              Bayi Ekspertiz Teklifi
                            </span>
                            <span className="text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                              {item.appraised_value 
                                ? `${item.appraised_value.toLocaleString('tr-TR')} ${item.currency || 'TL'}` 
                                : 'Henüz Değerlenmedi'}
                            </span>
                          </div>
                        </div>

                        {item.condition_notes && (
                          <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60 p-2 rounded-lg">
                            <strong className="text-slate-700 dark:text-slate-200">Ekspertiz Notu: </strong>
                            {item.condition_notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* FORM VIEW (ADD / EDIT) */}
          {viewMode === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Brand */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Marka *
                  </label>
                  <select
                    value={form.vehicle_brand}
                    onChange={(e) => setForm({ ...form, vehicle_brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {BRANDS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Model */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Model & Tip *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.vehicle_model}
                    onChange={(e) => setForm({ ...form, vehicle_model: e.target.value })}
                    placeholder="Örn: Daily 35S15, Cargo 1838, Sprinter..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Model Year */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Model Yılı
                  </label>
                  <input
                    type="number"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    value={form.model_year}
                    onChange={(e) => setForm({ ...form, model_year: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Mileage KM */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kilometre (KM)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.mileage_km}
                    onChange={(e) => setForm({ ...form, mileage_km: e.target.value })}
                    placeholder="Örn: 185000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Plate Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Plaka
                  </label>
                  <input
                    type="text"
                    value={form.plate_number}
                    onChange={(e) => setForm({ ...form, plate_number: e.target.value.toUpperCase() })}
                    placeholder="Örn: 34 ABC 789"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-100 uppercase outline-none focus:ring-2 focus:ring-blue-500/20 font-mono font-semibold"
                  />
                </div>

                {/* Body Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Üst Yapı / Kasa Tipi
                  </label>
                  <select
                    value={form.body_type}
                    onChange={(e) => setForm({ ...form, body_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {BODY_TYPES.map(bt => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>

                {/* Customer Expected Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Müşterinin İstediği Fiyat (TL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={form.customer_expected_price}
                    onChange={(e) => setForm({ ...form, customer_expected_price: e.target.value })}
                    placeholder="Örn: 950000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                  />
                </div>

                {/* Appraised Value */}
                <div>
                  <label className="block text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                    Bayi Ekspertiz Değeri (TL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={form.appraised_value}
                    onChange={(e) => setForm({ ...form, appraised_value: e.target.value })}
                    placeholder="Örn: 880000"
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                  />
                </div>

                {/* Status */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Değerlendirme Durumu
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {STATUS_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setForm({ ...form, status: opt.id })}
                        className={`p-2 rounded-xl border text-xs font-medium text-left transition-all ${
                          form.status === opt.id
                            ? 'ring-2 ring-blue-500/30 border-blue-600 bg-blue-50/70 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 font-bold'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Condition Notes with Voice Dictation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ekspertiz Notu & Hasar Durumu (Boya, Değişen, Lastik %, Motor)
                  </label>
                  <VoiceInputButton
                    size="sm"
                    onTranscript={(text) => setForm(prev => ({
                      ...prev,
                      condition_notes: prev.condition_notes ? `${prev.condition_notes} ${text}` : text
                    }))}
                  />
                </div>
                <textarea
                  rows="3"
                  value={form.condition_notes}
                  onChange={(e) => setForm({ ...form, condition_notes: e.target.value })}
                  placeholder="Örn: Sağ ön çamurluk boyalı, motor saat gibi, lastikler %80 seviyesinde, damper pistonunda yağ kaçağı yok..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('list');
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
                >
                  {submitting ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" />
                      {editingId ? 'Güncellemeyi Kaydet' : 'Takas Kaydını Oluştur'}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
