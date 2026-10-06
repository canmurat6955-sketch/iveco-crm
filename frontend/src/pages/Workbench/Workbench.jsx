import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPhone, FiMessageCircle, FiCheckCircle, FiClock, FiAlertCircle,
  FiEdit2, FiTrash2, FiSearch, FiFilter, FiRefreshCw, FiLayers,
  FiChevronRight, FiCheck, FiArrowRight, FiUserCheck, FiUsers
} from 'react-icons/fi';
import { workbenchApi } from '../../api/client';
import { useWhatsApp } from '../../contexts/WhatsAppContext';
import { useCall } from '../../contexts/CallContext';

export default function Workbench() {
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'missing_phone' | 'name_cleanup' | 'duplicates'

  // Contexts
  const { openWhatsAppModal } = useWhatsApp();
  const { openCallModal } = useCall();

  // ─────────────────────────────────────────────────────────────
  // TAB 1: Bugün Aranacaklar State
  // ─────────────────────────────────────────────────────────────
  const [todayData, setTodayData] = useState(null);
  const [todayLoading, setTodayLoading] = useState(true);

  const loadTodayQueue = async () => {
    setTodayLoading(true);
    try {
      const res = await workbenchApi.getTodayQueue();
      setTodayData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTodayLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'today') loadTodayQueue();
    if (activeTab === 'missing_phone') loadMissingPhone();
    if (activeTab === 'name_cleanup') loadNameCleanup();
    if (activeTab === 'duplicates') loadDuplicates();
  }, [activeTab]);

  // ─────────────────────────────────────────────────────────────
  // TAB 2: Eksik Telefonlar State
  // ─────────────────────────────────────────────────────────────
  const [missingPhoneData, setMissingPhoneData] = useState({ total: 0, items: [], by_city: {} });
  const [missingCity, setMissingCity] = useState('target_9');
  const [missingSearch, setMissingSearch] = useState('');
  const [missingLoading, setMissingLoading] = useState(false);
  const [phoneInputs, setPhoneInputs] = useState({});
  const [savingPhoneId, setSavingPhoneId] = useState(null);

  const loadMissingPhone = async () => {
    setMissingLoading(true);
    try {
      const res = await workbenchApi.getMissingPhone({
        city: missingCity,
        search: missingSearch || undefined,
        page: 1,
        page_size: 50,
      });
      setMissingPhoneData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setMissingLoading(false);
    }
  };

  const handleSavePhone = async (customerId) => {
    const phone = phoneInputs[customerId];
    if (!phone || phone.trim().length < 7) {
      alert('Lütfen geçerli bir telefon numarası girin (örn: 0362 123 45 67)');
      return;
    }
    setSavingPhoneId(customerId);
    try {
      await workbenchApi.setCustomerPhone(customerId, phone);
      // Remove from list
      setMissingPhoneData(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        items: prev.items.filter(item => item.id !== customerId),
      }));
    } catch (err) {
      alert(err?.response?.data?.detail || 'Telefon kaydedilemedi.');
    } finally {
      setSavingPhoneId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // TAB 3: Firma Adı Temizleme State
  // ─────────────────────────────────────────────────────────────
  const [cleanupData, setCleanupData] = useState({ total: 0, items: [] });
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanInputs, setCleanInputs] = useState({});
  const [selectedCleanupIds, setSelectedCleanupIds] = useState(new Set());
  const [applyingCleanup, setApplyingCleanup] = useState(false);

  const loadNameCleanup = async () => {
    setCleanupLoading(true);
    try {
      const res = await workbenchApi.getNameCleanupSuggestions();
      setCleanupData(res.data);
      const inputs = {};
      const preselected = new Set();
      res.data.items.forEach(it => {
        inputs[it.id] = it.suggested;
        preselected.add(it.id);
      });
      setCleanInputs(inputs);
      setSelectedCleanupIds(preselected);
    } catch (err) {
      console.error(err);
    } finally {
      setCleanupLoading(false);
    }
  };

  const toggleSelectAllCleanup = () => {
    if (selectedCleanupIds.size === cleanupData.items.length) {
      setSelectedCleanupIds(new Set());
    } else {
      setSelectedCleanupIds(new Set(cleanupData.items.map(it => it.id)));
    }
  };

  const toggleSelectCleanup = (id) => {
    setSelectedCleanupIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleApplyCleanup = async (singleItem = null) => {
    const itemsToApply = singleItem
      ? [{ id: singleItem.id, new_name: cleanInputs[singleItem.id] || singleItem.suggested, removed: singleItem.removed }]
      : cleanupData.items
          .filter(it => selectedCleanupIds.has(it.id))
          .map(it => ({ id: it.id, new_name: cleanInputs[it.id] || it.suggested, removed: it.removed }));

    if (itemsToApply.length === 0) {
      alert('Lütfen uygulanacak en az 1 firma seçin.');
      return;
    }

    setApplyingCleanup(true);
    try {
      const res = await workbenchApi.applyNameCleanup(itemsToApply);
      alert(`${res.data.updated} firmanın adı başarıyla güncellendi!`);
      loadNameCleanup();
    } catch (err) {
      alert(err?.response?.data?.detail || 'Güncelleme uygulanamadı.');
    } finally {
      setApplyingCleanup(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // TAB 4: Mükerrer Birleştirme State
  // ─────────────────────────────────────────────────────────────
  const [duplicateData, setDuplicateData] = useState({ total_groups: 0, extra_records: 0, groups: [] });
  const [duplicateLoading, setDuplicateLoading] = useState(false);
  const [primarySelections, setPrimarySelections] = useState({});
  const [mergingGroupId, setMergingGroupId] = useState(null);

  const loadDuplicates = async () => {
    setDuplicateLoading(true);
    try {
      const res = await workbenchApi.getDuplicateGroups();
      setDuplicateData(res.data);
      const sel = {};
      res.data.groups.forEach((g, idx) => {
        sel[idx] = g.suggested_primary_id;
      });
      setPrimarySelections(sel);
    } catch (err) {
      console.error(err);
    } finally {
      setDuplicateLoading(false);
    }
  };

  const handleMergeGroup = async (group, groupIdx) => {
    const primaryId = primarySelections[groupIdx] || group.suggested_primary_id;
    const secondaryIds = group.customers.map(c => c.id).filter(id => id !== primaryId);

    if (secondaryIds.length === 0) {
      alert('Birleştirilecek ikincil kayıt bulunamadı.');
      return;
    }

    const conf = window.confirm(
      `"${group.customers.find(c => c.id === primaryId)?.company_name}" ana kayıt olarak kalacak, ` +
      `diğer ${secondaryIds.length} kayıt birleştirilip ana kaydın altına aktarılacak. Onaylıyor musunuz?`
    );
    if (!conf) return;

    setMergingGroupId(groupIdx);
    try {
      await workbenchApi.mergeDuplicates(primaryId, secondaryIds);
      // Remove group from state
      setDuplicateData(prev => ({
        ...prev,
        total_groups: Math.max(0, prev.total_groups - 1),
        extra_records: Math.max(0, prev.extra_records - secondaryIds.length),
        groups: prev.groups.filter((_, idx) => idx !== groupIdx),
      }));
    } catch (err) {
      alert(err?.response?.data?.detail || 'Birleştirme tamamlanamadı.');
    } finally {
      setMergingGroupId(null);
    }
  };

  return (
    <div style={{ padding: '20px 24px', maxWidth: '1280px', margin: '0 auto', color: '#f8fafc' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
            Çalışma Masası & Operasyon
          </h1>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '14px' }}>
            Günlük arama akışı, hızlı sonuç kaydı ve kontrollü veri iyileştirme araçları
          </p>
        </div>

        {/* Sekmeler */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px',
          borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', gap: '4px'
        }}>
          {[
            { id: 'today', label: 'Bugün Aranacaklar', icon: FiPhone, badge: todayData?.total },
            { id: 'missing_phone', label: 'Eksik Telefonlar', icon: FiAlertCircle, badge: missingPhoneData.total },
            { id: 'name_cleanup', label: 'Firma Adı Düzeltme', icon: FiEdit2, badge: cleanupData.total },
            { id: 'duplicates', label: 'Mükerrer Birleştirme', icon: FiLayers, badge: duplicateData.total_groups },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
                  borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                  background: active ? '#0284c7' : 'transparent',
                  color: active ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span style={{
                    padding: '1px 6px', borderRadius: '10px', fontSize: '11px',
                    background: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                    color: active ? '#fff' : '#cbd5e1'
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: Bugün Aranacaklar
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'today' && (
        <div>
          {todayLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              <div className="loading-pulse" style={{ margin: '0 auto 16px' }}></div>
              <div>Aranacaklar listesi yükleniyor...</div>
            </div>
          ) : !todayData ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Veri bulunamadı.</div>
          ) : (
            <div>
              {/* İstatistik Çubuğu */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px', marginBottom: '24px'
              }}>
                <div style={{
                  background: 'var(--bg-card, #1e293b)', padding: '16px', borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>TOPLAM PLANLANAN</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                    {todayData.total}
                  </div>
                </div>
                <div style={{
                  background: 'var(--bg-card, #1e293b)', padding: '16px', borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>BUGÜN YAPILAN GÖRÜŞMELER</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                    {todayData.done_today}
                  </div>
                </div>
                <div style={{
                  background: 'var(--bg-card, #1e293b)', padding: '16px', borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>GECİKEN / BEKLEYEN TAKİP</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                    {todayData.followups?.length || 0}
                  </div>
                </div>
              </div>

              {/* Alt Listeler */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {/* 1. Takip Günü Gelenler */}
                {todayData.followups && todayData.followups.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24' }}>
                      <FiAlertCircle size={18} /> Takip Günü Gelen / Geciken Müşteriler ({todayData.followups.length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' }}>
                      {todayData.followups.map(c => renderCallCard(c, loadTodayQueue, openWhatsAppModal, openCallModal))}
                    </div>
                  </div>
                )}

                {/* 2. Aktif Fırsatlar (7+ gündür temas yok) */}
                {todayData.stale_pipeline && todayData.stale_pipeline.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
                      <FiClock size={18} /> 7+ Gündür Görüşülmeyen Sıcak Fırsatlar ({todayData.stale_pipeline.length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' }}>
                      {todayData.stale_pipeline.map(c => renderCallCard(c, loadTodayQueue, openWhatsAppModal, openCallModal))}
                    </div>
                  </div>
                )}

                {/* 3. Havuzdan Yeni Hedefler */}
                {todayData.new_calls && todayData.new_calls.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                      <FiCheckCircle size={18} /> Hedef İllerde Yeni Aranacak Yüksek Öncelikli Firmalar ({todayData.new_calls.length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' }}>
                      {todayData.new_calls.map(c => renderCallCard(c, loadTodayQueue, openWhatsAppModal, openCallModal))}
                    </div>
                  </div>
                )}

                {todayData.total === 0 && (
                  <div style={{
                    padding: '48px', textAlign: 'center', background: 'var(--bg-card, #1e293b)',
                    borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    <FiCheckCircle size={40} color="#10b981" style={{ marginBottom: '12px' }} />
                    <h4 style={{ margin: '0 0 6px', fontSize: '18px' }}>Tebrikler, tüm planlı aramalar tamamlandı!</h4>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
                      Şu an bekleyen gecikmiş arama veya takip bulunmuyor.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: Eksik Telefonlar
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'missing_phone' && (
        <div>
          {/* Filtre ve Arama */}
          <div style={{
            display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap',
            background: 'var(--bg-card, #1e293b)', padding: '14px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Şehir:</span>
              {[
                { id: 'target_9', label: 'Hedef 9 İl' },
                { id: 'Sinop', label: 'Sinop' },
                { id: 'Samsun', label: 'Samsun' },
                { id: 'Çorum', label: 'Çorum' },
                { id: 'Ordu', label: 'Ordu' },
                { id: 'all', label: 'Tüm İller' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => { setMissingCity(c.id); }}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                    background: missingCity === c.id ? '#0284c7' : 'rgba(255,255,255,0.05)',
                    color: missingCity === c.id ? '#fff' : '#cbd5e1'
                  }}
                >
                  {c.label} {missingPhoneData.by_city[c.label] ? `(${missingPhoneData.by_city[c.label]})` : ''}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, minWidth: '220px', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Firma ara..."
                value={missingSearch}
                onChange={e => setMissingSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadMissingPhone()}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: '6px', fontSize: '13px',
                  background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff'
                }}
              />
              <button
                onClick={loadMissingPhone}
                style={{
                  padding: '8px 16px', borderRadius: '6px', background: '#0284c7', border: 'none',
                  color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Ara
              </button>
            </div>
          </div>

          {missingLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              <div className="loading-pulse" style={{ margin: '0 auto 16px' }}></div>
              <div>Firmalar taranıyor...</div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '12px', fontSize: '13px', color: '#94a3b8' }}>
                Toplam <strong>{missingPhoneData.total}</strong> firmanın telefon numarası eksik. Numara ekledikçe kayıt otomatik olarak aranacaklar havuzuna girer.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {missingPhoneData.items.map(c => (
                  <div
                    key={c.id}
                    style={{
                      background: 'var(--bg-card, #1e293b)', padding: '14px 18px', borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.08)', display: 'flex',
                      alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Link to={`/customers/${c.id}`} style={{ color: '#f8fafc', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
                          {c.company_name}
                        </Link>
                        <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                          {c.city || 'İl Yok'} {c.district ? `/ ${c.district}` : ''}
                        </span>
                      </div>
                      {c.address && (
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                          📍 {c.address}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="tel"
                        placeholder="0362 123 45 67"
                        value={phoneInputs[c.id] || ''}
                        onChange={e => setPhoneInputs({ ...phoneInputs, [c.id]: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && handleSavePhone(c.id)}
                        style={{
                          width: '160px', padding: '8px 10px', borderRadius: '6px', fontSize: '13px',
                          background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)',
                          color: '#fff'
                        }}
                      />
                      <button
                        onClick={() => handleSavePhone(c.id)}
                        disabled={savingPhoneId === c.id}
                        style={{
                          padding: '8px 14px', borderRadius: '6px', background: '#10b981', border: 'none',
                          color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '4px'
                        }}
                      >
                        <FiCheck size={14} />
                        {savingPhoneId === c.id ? '...' : 'Kaydet'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: Firma Adı Düzeltme
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'name_cleanup' && (
        <div>
          <div style={{
            background: 'var(--bg-card, #1e293b)', padding: '16px 20px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                Firma Adı İyileştirme Önerileri ({cleanupData.total} Firma)
              </h3>
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '13px' }}>
                İçine NACE faaliyet kodu veya adres karışmış ünvanlar temizlenir; eski ad müşteri notlarına güvenle arşivlenir.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={toggleSelectAllCleanup}
                style={{
                  padding: '8px 14px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: '13px', cursor: 'pointer'
                }}
              >
                {selectedCleanupIds.size === cleanupData.items.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
              </button>
              <button
                onClick={() => handleApplyCleanup()}
                disabled={applyingCleanup || selectedCleanupIds.size === 0}
                style={{
                  padding: '8px 18px', borderRadius: '6px', background: '#0284c7', border: 'none',
                  color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <FiCheckCircle size={15} />
                {applyingCleanup ? 'Uygulanıyor...' : `Seçilenleri Uygula (${selectedCleanupIds.size})`}
              </button>
            </div>
          </div>

          {cleanupLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              <div className="loading-pulse" style={{ margin: '0 auto 16px' }}></div>
              <div>Öneriler taranıyor...</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cleanupData.items.map(it => {
                const isSelected = selectedCleanupIds.has(it.id);
                return (
                  <div
                    key={it.id}
                    style={{
                      background: 'var(--bg-card, #1e293b)', padding: '16px 20px', borderRadius: '10px',
                      border: `1.5px solid ${isSelected ? '#0284c7' : 'rgba(255,255,255,0.08)'}`,
                      display: 'flex', alignItems: 'flex-start', gap: '14px'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectCleanup(it.id)}
                      style={{ marginTop: '6px', width: '16px', height: '16px', cursor: 'pointer' }}
                    />

                    <div style={{ flex: 1 }}>
                      {/* Mevcut Ad */}
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                        MEVCUT AD ({it.city || 'Şehir Yok'}):
                      </div>
                      <div style={{ fontSize: '13px', color: '#f8fafc', marginBottom: '8px', lineHeight: 1.4 }}>
                        {it.current}
                      </div>

                      {/* Temizlenmiş Öneri */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '260px' }}>
                          <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600, marginBottom: '2px' }}>
                            ÖNERİLEN TEMİZ ÜNVAN (DÜZENLENEBİLİR):
                          </div>
                          <input
                            type="text"
                            value={cleanInputs[it.id] !== undefined ? cleanInputs[it.id] : it.suggested}
                            onChange={e => setCleanInputs({ ...cleanInputs, [it.id]: e.target.value })}
                            style={{
                              width: '100%', padding: '8px 10px', borderRadius: '6px', fontSize: '13px',
                              background: 'rgba(0,0,0,0.35)', border: '1px solid #0284c7',
                              color: '#fff', fontWeight: 600
                            }}
                          />
                        </div>

                        {it.removed && (
                          <div style={{ maxWidth: '300px' }}>
                            <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, marginBottom: '2px' }}>
                              AYRILAN FAALİYET / ADRES:
                            </div>
                            <div style={{
                              fontSize: '11px', color: '#fca5a5', background: 'rgba(239,68,68,0.1)',
                              padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)',
                              maxHeight: '44px', overflowY: 'auto'
                            }}>
                              {it.removed}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleApplyCleanup(it)}
                      style={{
                        padding: '8px 14px', borderRadius: '6px', background: 'rgba(2,132,199,0.2)',
                        border: '1px solid #0284c7', color: '#38bdf8', fontSize: '12px', fontWeight: 600,
                        cursor: 'pointer', whiteSpace: 'nowrap', marginTop: '16px'
                      }}
                    >
                      Tek Başına Uygula
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: Mükerrer Birleştirme
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'duplicates' && (
        <div>
          <div style={{
            background: 'var(--bg-card, #1e293b)', padding: '16px 20px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px'
          }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
              Mükerrer Kayıt Birleştirme ({duplicateData.total_groups} Grup / {duplicateData.extra_records} Fazla Kayıt)
            </h3>
            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '13px' }}>
              Aynı telefon veya aynı ünvanı paylaşan firmalar. Seçtiğiniz ana kayıt kalır, diğer kayıtların tüm teklif, aktivite ve telefonları ana kayda taşınır.
            </p>
          </div>

          {duplicateLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              <div className="loading-pulse" style={{ margin: '0 auto 16px' }}></div>
              <div>Mükerrer gruplar taranıyor...</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {duplicateData.groups.map((g, gIdx) => {
                const currentPrimaryId = primarySelections[gIdx] || g.suggested_primary_id;
                return (
                  <div
                    key={gIdx}
                    style={{
                      background: 'var(--bg-card, #1e293b)', padding: '16px 20px', borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.08)'
                    }}
                  >
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                          background: 'rgba(2,132,199,0.2)', color: '#38bdf8'
                        }}>
                          {g.reason}
                        </span>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                          {g.customers.length} kayıt eşleşti
                        </span>
                      </div>

                      <button
                        onClick={() => handleMergeGroup(g, gIdx)}
                        disabled={mergingGroupId === gIdx}
                        style={{
                          padding: '6px 14px', borderRadius: '6px', background: '#10b981', border: 'none',
                          color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '4px'
                        }}
                      >
                        <FiCheck size={14} />
                        {mergingGroupId === gIdx ? 'Birleştiriliyor...' : 'Güvenle Birleştir'}
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                      {g.customers.map(c => {
                        const isPrimary = c.id === currentPrimaryId;
                        return (
                          <div
                            key={c.id}
                            onClick={() => setPrimarySelections({ ...primarySelections, [gIdx]: c.id })}
                            style={{
                              padding: '12px 14px', borderRadius: '8px', cursor: 'pointer',
                              border: `1.5px solid ${isPrimary ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                              background: isPrimary ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)',
                              position: 'relative'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <input
                                type="radio"
                                name={`primary-${gIdx}`}
                                checked={isPrimary}
                                onChange={() => setPrimarySelections({ ...primarySelections, [gIdx]: c.id })}
                                style={{ cursor: 'pointer' }}
                              />
                              <span style={{
                                fontSize: '11px', fontWeight: 700,
                                color: isPrimary ? '#10b981' : '#94a3b8'
                              }}>
                                {isPrimary ? '★ KALACAK ANA KAYIT' : 'İkincil (Birleşecek)'}
                              </span>
                            </div>

                            <div style={{ fontWeight: 600, fontSize: '13px', color: '#f8fafc', marginBottom: '4px' }}>
                              {c.company_name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                              <div>📞 {c.phone || 'Telefon yok'}</div>
                              <div>📍 {c.city || '-'} {c.district ? `/ ${c.district}` : ''}</div>
                              {c.pipeline_stage && (
                                <div style={{ color: '#38bdf8', fontWeight: 600, marginTop: '2px' }}>
                                  Aşama: {c.pipeline_stage} ({c.activity_count} aktivite)
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Kart Render Yardımcısı
// ─────────────────────────────────────────────────────────────
function renderCallCard(c, onRefresh, openWhatsAppModal, openCallModal) {
  const stageLabels = {
    lead: 'Lead',
    contact: 'İlk Görüşme',
    proposal: 'Teklif',
    negotiation: 'Pazarlık',
    won: 'Kazanıldı',
    lost: 'Kaybedildi',
  };

  return (
    <div
      key={c.id}
      style={{
        background: 'var(--bg-card, #1e293b)', borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <Link
            to={`/customers/${c.id}`}
            style={{ fontWeight: 700, fontSize: '14px', color: '#f8fafc', textDecoration: 'none', lineHeight: 1.3 }}
          >
            {c.company_name}
          </Link>
          <span style={{
            fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
            background: 'rgba(2,132,199,0.2)', color: '#38bdf8', whiteSpace: 'nowrap'
          }}>
            Skor: {c.priority_score}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '6px 0' }}>
          <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: '#cbd5e1' }}>
            📍 {c.city || 'İl Yok'}
          </span>
          {c.pipeline_stage && (
            <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#34d399', fontWeight: 600 }}>
              {stageLabels[c.pipeline_stage] || c.pipeline_stage}
            </span>
          )}
          <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
            {c.reason}
          </span>
        </div>

        {c.phone && (
          <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 600, marginTop: '4px' }}>
            📞 {c.phone}
          </div>
        )}
        {c.note && (
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
            "{c.note}"
          </div>
        )}
      </div>

      {/* Aksiyon Butonları */}
      <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {c.phone && (
          <a
            href={`tel:${c.phone}`}
            data-customer-id={c.id}
            data-customer-name={c.company_name}
            style={{
              flex: 1, padding: '8px 10px', borderRadius: '6px', background: '#0284c7',
              color: '#fff', fontSize: '12px', fontWeight: 600, textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
            }}
          >
            <FiPhone size={13} /> Ara
          </a>
        )}

        {c.phone && (
          <button
            onClick={() => openWhatsAppModal({ customer: c, onSuccess: onRefresh })}
            style={{
              padding: '8px 12px', borderRadius: '6px', background: '#22c55e', border: 'none',
              color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <FiMessageCircle size={14} /> WA
          </button>
        )}

        <button
          onClick={() => openCallModal({ customer: c, onSuccess: onRefresh })}
          style={{
            padding: '8px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)', color: '#f8fafc', fontSize: '12px',
            fontWeight: 600, cursor: 'pointer'
          }}
        >
          Sonuç Gir
        </button>
      </div>
    </div>
  );
}
