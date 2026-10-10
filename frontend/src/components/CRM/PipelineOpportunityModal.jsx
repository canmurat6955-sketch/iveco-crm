import { useState, useEffect, useRef } from 'react';
import { crmApi, salesApi, vehiclesApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  FiX, FiCheck, FiSearch, FiPlus, FiUserPlus, FiUser, FiPhone, 
  FiMapPin, FiTruck, FiCalendar, FiFileText, FiFolder, FiCheckCircle, 
  FiChevronDown, FiAlertCircle, FiTag, FiBriefcase
} from 'react-icons/fi';

const TARGET_PROVINCES = [
  'Samsun', 'Ordu', 'Sivas', 'Giresun', 'Çorum', 'Amasya', 'Sinop', 'Tokat', 'Kastamonu'
];

const STAGES = [
  { key: 'lead', label: 'Lead (Aday)', emoji: '🎯', color: '#6366f1' },
  { key: 'contact', label: 'İlk Görüşme', emoji: '📞', color: '#3b82f6' },
  { key: 'proposal', label: 'Teklif Verildi', emoji: '📋', color: '#f59e0b' },
  { key: 'negotiation', label: 'Pazarlık', emoji: '🤝', color: '#f97316' },
  { key: 'won', label: 'Kazanıldı (Satış)', emoji: '✅', color: '#10b981' },
  { key: 'lost', label: 'Kaybedildi', emoji: '❌', color: '#ef4444' },
];

const ACTIVITY_TYPES = [
  { key: 'visit', label: 'Yüz Yüze Ziyaret' },
  { key: 'call', label: 'Telefon Görüşmesi' },
  { key: 'whatsapp', label: 'WhatsApp İletişimi' },
  { key: 'meeting', label: 'Bayi / Showroom Toplantısı' },
  { key: 'email', label: 'E-posta' },
];

export default function PipelineOpportunityModal({
  isOpen,
  onClose,
  initialStage = 'lead',
  initialCustomerId = null,
  initialCompanyName = '',
  onSuccess
}) {
  const { user } = useAuth();
  
  // ── Müşteri Seçim & Arama State'leri ──
  const [customerMode, setCustomerMode] = useState('existing'); // 'existing' | 'new'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const searchTimeoutRef = useRef(null);

  // ── Yeni Müşteri Alanları ──
  const [newCustomer, setNewCustomer] = useState({
    company_name: '',
    city: 'Samsun',
    district: '',
    phone: '',
    sector: '',
    initial_contact_name: '',
    initial_contact_role: 'Firma Sahibi'
  });

  // ── Müşteri Yetkilileri State'i ──
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    contact_name: '',
    phone: '',
    role: 'Firma Yetkilisi'
  });

  // ── Ziyaret & Fırsat Form Alanları ──
  const [visitDate, setVisitDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [nextFollowUpDate, setNextFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [pipelineStage, setPipelineStage] = useState(initialStage || 'lead');
  const [activityType, setActivityType] = useState('visit');
  const [possibleVehicle, setPossibleVehicle] = useState('Daily 35S16');
  const [vehicleCount, setVehicleCount] = useState(1);
  const [targetFleet, setTargetFleet] = useState('');
  const [isHeavyVehicle, setIsHeavyVehicle] = useState(false);
  const [is7TonDaily, setIs7TonDaily] = useState('hayir');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Modal açıldığında başlatma
  useEffect(() => {
    if (isOpen) {
      setPipelineStage(initialStage || 'lead');
      if (initialCustomerId) {
        setCustomerMode('existing');
        crmApi.getCustomer(initialCustomerId)
          .then(res => {
            setSelectedCustomer(res.data);
            loadCustomerContacts(res.data.id);
          })
          .catch(() => {
            setSelectedCustomer({ id: initialCustomerId, company_name: initialCompanyName || 'Müşteri' });
          });
      } else {
        setSelectedCustomer(null);
        setSearchQuery('');
        setSearchResults([]);
      }
    }
  }, [isOpen, initialStage, initialCustomerId, initialCompanyName]);

  // Canlı arama (Debounced)
  useEffect(() => {
    if (customerMode !== 'existing') return;
    if (selectedCustomer) return;

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        crmApi.getCustomers({ search: searchQuery.trim(), page: 1, page_size: 15 })
          .then(res => {
            setSearchResults(res.data?.items || []);
          })
          .catch(() => {
            setSearchResults([]);
          })
          .finally(() => setIsSearching(false));
      }, 250);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, customerMode, selectedCustomer]);

  // Seçilen müşterinin yetkililerini getir
  const loadCustomerContacts = async (customerId) => {
    try {
      const res = await crmApi.getContacts(customerId);
      const items = res.data || [];
      setContacts(items);
      if (items.length > 0) {
        const primary = items.find(c => c.is_primary) || items[0];
        setSelectedContactId(primary.id);
      } else {
        setSelectedContactId('');
      }
    } catch {
      setContacts([]);
    }
  };

  const handleSelectCustomer = (cust) => {
    setSelectedCustomer(cust);
    setSearchQuery('');
    setSearchResults([]);
    loadCustomerContacts(cust.id);
  };

  const handleClearSelectedCustomer = () => {
    setSelectedCustomer(null);
    setContacts([]);
    setSelectedContactId('');
  };

  // Yeni yetkili hızlı kaydet
  const handleCreateContactInline = async () => {
    if (!selectedCustomer) return;
    if (!newContact.contact_name.trim()) {
      toast.error('Yetkili adını yazınız.');
      return;
    }
    try {
      const res = await crmApi.addContact(selectedCustomer.id, {
        contact_name: newContact.contact_name.trim(),
        phone: newContact.phone.trim() || undefined,
        role: newContact.role.trim() || 'Firma Yetkilisi',
        is_primary: contacts.length === 0
      });
      toast.success('Yetkili eklendi! ✓');
      const added = res.data;
      setContacts(prev => [...prev, added]);
      setSelectedContactId(added.id);
      setShowAddContact(false);
      setNewContact({ contact_name: '', phone: '', role: 'Firma Yetkilisi' });
    } catch {
      toast.error('Yetkili eklenemedi');
    }
  };

  // Ana Kaydet İşlemi
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Müşteri Kontrolü
    if (customerMode === 'existing' && !selectedCustomer) {
      toast.error('Lütfen listeden bir müşteri seçin veya "Yeni Müşteri" sekmesini kullanın.');
      return;
    }

    if (customerMode === 'new' && !newCustomer.company_name.trim()) {
      toast.error('Lütfen firma unvanını yazın.');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Fırsat ve müşteri kaydı işleniyor...');

    try {
      let customerId = selectedCustomer?.id;
      let finalCompanyName = selectedCustomer?.company_name;

      // ── ADIM 1: Yeni Müşteri İse CRM'e Oluştur ──
      if (customerMode === 'new') {
        const createPayload = {
          company_name: newCustomer.company_name.trim(),
          city: newCustomer.city || 'Samsun',
          district: newCustomer.district.trim() || undefined,
          phone: newCustomer.phone.trim() || undefined,
          sector: newCustomer.sector.trim() || undefined,
          pipeline_stage: pipelineStage,
          pipeline_note: notes ? `${possibleVehicle ? `[${possibleVehicle}] ` : ''}${notes}` : (possibleVehicle ? `İlgilenilen: ${possibleVehicle}` : 'Yeni Pipeline Fırsatı'),
          potential_score: pipelineStage === 'proposal' ? 95 : (pipelineStage === 'contact' ? 75 : 60),
          potential_level: pipelineStage === 'proposal' ? 'very_high' : 'high',
          last_contact_date: visitDate,
          sales_notes: notes || undefined
        };

        const createRes = await crmApi.createCustomer(createPayload);
        customerId = createRes.data.id;
        finalCompanyName = createRes.data.company_name;

        // Yetkili bilgisi varsa irtibat kişisi olarak ekle
        if (newCustomer.initial_contact_name.trim()) {
          try {
            await crmApi.addContact(customerId, {
              contact_name: newCustomer.initial_contact_name.trim(),
              role: newCustomer.initial_contact_role.trim() || 'Firma Sahibi',
              phone: newCustomer.phone.trim() || undefined,
              is_primary: true
            });
          } catch {
            // İkincil hata ana işlemi bozmasın
          }
        }
      } else {
        // ── Mevcut Müşteri İse Pipeline Aşamasını ve Notunu Güncelle ──
        const updatePayload = {
          pipeline_stage: pipelineStage,
          pipeline_note: notes ? `${possibleVehicle ? `[${possibleVehicle}] ` : ''}${notes}` : (possibleVehicle ? `İlgilenilen: ${possibleVehicle}` : selectedCustomer.pipeline_note || 'Pipeline Fırsatı'),
          last_contact_date: visitDate,
          potential_score: Math.max(selectedCustomer.potential_score || 0, pipelineStage === 'proposal' ? 95 : (pipelineStage === 'contact' ? 75 : 60)),
        };
        await crmApi.updateCustomer(customerId, updatePayload);
      }

      // ── ADIM 2: Resmi Ziyaret & Aktivite Kaydını Oluştur ──
      const vehicleSummary = [
        vehicleCount && possibleVehicle ? `${vehicleCount} Adet ${possibleVehicle}` : possibleVehicle,
        isHeavyVehicle ? 'Ağır Vasıta (S-Way)' : null,
        is7TonDaily === 'evet' ? '7 Ton Daily' : null,
        targetFleet ? `Hedef Filo: ${targetFleet}` : null
      ].filter(Boolean).join(' | ');

      const chosenContact = contacts.find(c => String(c.id) === String(selectedContactId));
      const contactLabel = chosenContact ? `Yetkili: ${chosenContact.contact_name} (${chosenContact.role || 'Yetkili'})` : (newCustomer.initial_contact_name ? `Yetkili: ${newCustomer.initial_contact_name}` : null);

      const finalNotesParts = [
        contactLabel,
        vehicleSummary ? `Olası Araç: ${vehicleSummary}` : null,
        notes ? `Açıklama: ${notes}` : null
      ].filter(Boolean);

      const activityStatus = pipelineStage === 'won' ? 'converted' 
        : (pipelineStage === 'lost' ? 'lost' 
        : (pipelineStage === 'proposal' ? 'offer_given' 
        : 'follow_up'));

      await salesApi.createActivity({
        customer_id: customerId,
        activity_type: activityType,
        status: activityStatus,
        notes: finalNotesParts.join('\n') || 'Pipeline fırsat kaydı oluşturuldu.',
        next_follow_up: nextFollowUpDate || undefined
      });

      // ── ADIM 3: Araç Kataloğu İlgisi Kaydı (Opsiyonel) ──
      if (possibleVehicle) {
        try {
          const seriesName = possibleVehicle.includes('Daily') ? 'Daily' 
            : (possibleVehicle.includes('Way') || isHeavyVehicle ? 'S-Way' : possibleVehicle.slice(0, 30));
          await vehiclesApi.createCustomerInterest(customerId, {
            series: seriesName,
            interest_level: 'high',
            notes: `Pipeline kaydı: ${vehicleSummary}`
          });
        } catch {
          // Gerekirse sessiz geç
        }
      }

      toast.success(`"${finalCompanyName}" Pipeline'a başarıyla kaydedildi! 🎉`, { id: toastId });
      if (onSuccess) onSuccess({ id: customerId, company_name: finalCompanyName, pipeline_stage: pipelineStage });
      onClose();
    } catch (err) {
      console.error('Pipeline kaydı hatası:', err);
      const detail = err.response?.data?.detail || err.message || 'Kayıt sırasında bir hata oluştu.';
      toast.error(detail, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal animate-in" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: 720, 
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          background: 'var(--bg-secondary, #1e293b)',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden'
        }}
      >
        {/* ── BAŞLIK & ÜST ARAÇ ÇUBUĞU (Kullanıcının gönderdiği Iveco Ziyaret Yeni ekranı stili) ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16
            }}>
              📋
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>
                Pipeline / Ziyaret Yeni
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>
                Müşteri fırsatı ve saha görüşme kaydı
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="btn btn-primary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 700,
                fontSize: 13,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderColor: '#059669',
                padding: '6px 14px'
              }}
            >
              <FiCheck size={16} /> Devam & Kaydet
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn btn-ghost btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                color: '#f87171',
                padding: '6px 10px',
                fontSize: 13
              }}
            >
              <FiX size={16} /> Kapat
            </button>
          </div>
        </div>

        {/* ── İÇERİK FORMU (KAYDIRILABİLİR ALAN) ── */}
        <form onSubmit={handleSubmit} style={{ padding: '18px 22px', overflowY: 'auto', flex: 1 }}>
          
          {/* ── SEÇİM TÜRÜ HAPLARI: Mevcut Müşteri Ara vs. Yeni Müşteri Ekle ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
            background: 'rgba(15, 23, 42, 0.6)',
            padding: 4,
            borderRadius: 10,
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button
              type="button"
              onClick={() => { setCustomerMode('existing'); handleClearSelectedCustomer(); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: 'none',
                background: customerMode === 'existing' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                color: customerMode === 'existing' ? '#93c5fd' : '#94a3b8',
                fontWeight: customerMode === 'existing' ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s ease'
              }}
            >
              <FiSearch size={15} /> Mevcut Müşterilerde Ara
            </button>
            <button
              type="button"
              onClick={() => { setCustomerMode('new'); setSelectedCustomer(null); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: 'none',
                background: customerMode === 'new' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                color: customerMode === 'new' ? '#6ee7b7' : '#94a3b8',
                fontWeight: customerMode === 'new' ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s ease'
              }}
            >
              <FiUserPlus size={15} /> Yeni Müşteri Kaydı Aç
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* DURUM 1: MEVCUT MÜŞTERİ ARAMA & SEÇİM                               */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          {customerMode === 'existing' && (
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>
                <span>* Müşteri</span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>3.601 firma içinde hızlı arama</span>
              </label>

              {/* Seçilmiş Müşteri Rozeti */}
              {selectedCustomer ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(96, 165, 250, 0.4)',
                  color: '#fff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                      🏢
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#f8fafc' }}>
                        {selectedCustomer.company_name}
                      </div>
                      <div style={{ fontSize: 12, color: '#93c5fd', display: 'flex', gap: 12, marginTop: 2 }}>
                        <span>📍 {selectedCustomer.city || 'Şehir Yok'} {selectedCustomer.district ? `/ ${selectedCustomer.district}` : ''}</span>
                        {selectedCustomer.phone && <span>📞 {selectedCustomer.phone}</span>}
                        {selectedCustomer.sector && <span>🏷️ {selectedCustomer.sector}</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearSelectedCustomer}
                    className="btn btn-secondary btn-xs"
                    style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6 }}
                  >
                    Değiştir
                  </button>
                </div>
              ) : (
                /* Arama Kutusu ve Yeşil '+' Butonu */
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Seçmek için müşteri ünvanı, şehir veya telefon giriniz..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        autoFocus
                        style={{
                          paddingLeft: 34,
                          fontSize: 13.5,
                          background: 'rgba(15, 23, 42, 0.8)',
                          borderColor: searchResults.length > 0 ? '#3b82f6' : 'rgba(255, 255, 255, 0.15)'
                        }}
                      />
                      <FiSearch size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      {isSearching && (
                        <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#60a5fa' }}>
                          Aranıyor...
                        </div>
                      )}
                    </div>
                    
                    {/* Hızlı Yeni Müşteri Ekleme '+' Butonu (Resimdeki yeşil ikon gibi) */}
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerMode('new');
                        setNewCustomer(prev => ({ ...prev, company_name: searchQuery }));
                      }}
                      title="Yeni Müşteri Ekle"
                      style={{
                        padding: '0 14px',
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <FiPlus size={16} /> Yeni
                    </button>
                  </div>

                  {/* Canlı Arama Sonuç Dropdown'u */}
                  {searchResults.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 50,
                      marginTop: 4,
                      background: 'rgba(15, 23, 42, 0.98)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      borderRadius: 10,
                      maxHeight: 250,
                      overflowY: 'auto',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.8)'
                    }}>
                      {searchResults.map(c => (
                        <div
                          key={c.id}
                          onClick={() => handleSelectCustomer(c)}
                          style={{
                            padding: '9px 14px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9' }}>
                              {c.company_name}
                            </div>
                            <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', gap: 10, marginTop: 2 }}>
                              <span>📍 {c.city || 'Bilinmiyor'}</span>
                              {c.phone && <span>📞 {c.phone}</span>}
                              {c.sector && <span>🏷️ {c.sector}</span>}
                            </div>
                          </div>
                          <div>
                            {c.pipeline_stage ? (
                              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', fontWeight: 600 }}>
                                {STAGES.find(s => s.key === c.pipeline_stage)?.label || c.pipeline_stage}
                              </span>
                            ) : (
                              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' }}>
                                Havuz
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchQuery.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 50,
                      marginTop: 4,
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 10,
                      padding: '12px 14px',
                      fontSize: 12,
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>Müşteri bulunamadı.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerMode('new');
                          setNewCustomer(prev => ({ ...prev, company_name: searchQuery }));
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#34d399',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <FiPlus size={14} /> "{searchQuery}" olarak yeni müşteri oluştur
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* DURUM 2: YENİ MÜŞTERİ HIZLI FORMU (Kullanıcı yeni müşteri seçtiyse)   */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          {customerMode === 'new' && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 12,
              padding: '14px 16px',
              marginBottom: 18
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiUserPlus size={15} /> Yeni Müşteri Bilgileri
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                  Kaydedildiğinde CRM veritabanına eklenecektir
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: 11.5 }}>Firma Ünvanı *</label>
                  <input
                    type="text"
                    required={customerMode === 'new'}
                    className="form-input"
                    placeholder="Örn: Karadeniz Dağıtım Lojistik Ltd. Şti."
                    value={newCustomer.company_name}
                    onChange={e => setNewCustomer({ ...newCustomer, company_name: e.target.value })}
                    style={{ fontSize: 13 }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 11.5 }}>Şehir</label>
                  <select
                    className="form-select"
                    value={newCustomer.city}
                    onChange={e => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    style={{ fontSize: 13 }}
                  >
                    {TARGET_PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    <option value="Diğer">Diğer İl</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 11.5 }}>İlçe</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Örn: Tekkeköy, Merkez"
                    value={newCustomer.district}
                    onChange={e => setNewCustomer({ ...newCustomer, district: e.target.value })}
                    style={{ fontSize: 13 }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 11.5 }}>Telefon</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="0532..."
                    value={newCustomer.phone}
                    onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    style={{ fontSize: 13 }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 11.5 }}>Sektör</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Gıda, Nakliye, Hafriyat, İnşaat..."
                    value={newCustomer.sector}
                    onChange={e => setNewCustomer({ ...newCustomer, sector: e.target.value })}
                    style={{ fontSize: 13 }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 11.5 }}>Yetkili Kişi Adı</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Örn: Ahmet Yılmaz"
                    value={newCustomer.initial_contact_name}
                    onChange={e => setNewCustomer({ ...newCustomer, initial_contact_name: e.target.value })}
                    style={{ fontSize: 13 }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 11.5 }}>Yetkili Rolü</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Firma Sahibi, Filo Müdürü..."
                    value={newCustomer.initial_contact_role}
                    onChange={e => setNewCustomer({ ...newCustomer, initial_contact_role: e.target.value })}
                    style={{ fontSize: 13 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* MÜŞTERİ YETKİLİSİ (Resimdeki: * Müşteri Yetkilisi + Folder + Plus)      */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          {customerMode === 'existing' && selectedCustomer && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
                  * Müşteri Yetkilisi
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddContact(!showAddContact)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#60a5fa',
                    cursor: 'pointer',
                    fontSize: 11.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <FiPlus size={13} /> {showAddContact ? 'Yetkili Ekle İptal' : 'Yeni Yetkili Ekle'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  className="form-select"
                  value={selectedContactId}
                  onChange={e => setSelectedContactId(e.target.value)}
                  style={{ flex: 1, fontSize: 13 }}
                >
                  {contacts.length === 0 && (
                    <option value="">Kayıtlı yetkili bulunamadı (Yeni ekleyin)</option>
                  )}
                  {contacts.map(ct => (
                    <option key={ct.id} value={ct.id}>
                      {ct.contact_name} {ct.role ? `(${ct.role})` : ''} {ct.phone ? `— ${ct.phone}` : ''}
                    </option>
                  ))}
                </select>
                
                <button
                  type="button"
                  onClick={() => setShowAddContact(true)}
                  title="Yeni Yetkili Ekle"
                  style={{
                    padding: '0 12px',
                    borderRadius: 8,
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#34d399',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <FiPlus size={16} />
                </button>
              </div>

              {/* Yetkili Ekleme Inline Kartı */}
              {showAddContact && (
                <div style={{
                  marginTop: 8,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Yetkili Adı *"
                    value={newContact.contact_name}
                    onChange={e => setNewContact({ ...newContact, contact_name: e.target.value })}
                    style={{ flex: 2, minWidth: 140, fontSize: 12 }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Telefon"
                    value={newContact.phone}
                    onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                    style={{ flex: 2, minWidth: 120, fontSize: 12 }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Görevi (Firma Sahibi vb.)"
                    value={newContact.role}
                    onChange={e => setNewContact({ ...newContact, role: e.target.value })}
                    style={{ flex: 2, minWidth: 120, fontSize: 12 }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateContactInline}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: 11, padding: '6px 12px' }}
                  >
                    Ekle
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* ZİYARET & FIRSAT DETAYLARI (Iveco Ziyaret Ekranındaki Alanlar)          */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            marginBottom: 16
          }}>
            {/* Ziyaret Tarihi */}
            <div>
              <label className="form-label" style={{ fontSize: 12 }}>* Ziyaret / Görüşme Tarihi</label>
              <input
                type="date"
                required
                className="form-input"
                value={visitDate}
                onChange={e => setVisitDate(e.target.value)}
                style={{ fontSize: 13 }}
              />
            </div>

            {/* Sonraki Ziyaret / Takip Tarihi */}
            <div>
              <label className="form-label" style={{ fontSize: 12 }}>Sonraki Ziyaret / Takip Tarihi</label>
              <input
                type="date"
                className="form-input"
                value={nextFollowUpDate}
                onChange={e => setNextFollowUpDate(e.target.value)}
                style={{ fontSize: 13 }}
              />
            </div>

            {/* Pipeline Aşaması (Durum) */}
            <div>
              <label className="form-label" style={{ fontSize: 12 }}>* Pipeline Durumu</label>
              <select
                className="form-select"
                value={pipelineStage}
                onChange={e => setPipelineStage(e.target.value)}
                style={{ fontSize: 13, fontWeight: 700 }}
              >
                {STAGES.map(s => (
                  <option key={s.key} value={s.key}>
                    {s.emoji} {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ziyaret / Görüşme Tipi */}
            <div>
              <label className="form-label" style={{ fontSize: 12 }}>* Ziyaret / Görüşme Tipi</label>
              <select
                className="form-select"
                value={activityType}
                onChange={e => setActivityType(e.target.value)}
                style={{ fontSize: 13 }}
              >
                {ACTIVITY_TYPES.map(t => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── ARAÇ İSTEMİ & FİLO (Iveco Formu) ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            marginBottom: 16,
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div>
              <label className="form-label" style={{ fontSize: 12 }}>* Olası Araç İstemi (Model)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Örn: Daily 35S16, S-Way 530..."
                value={possibleVehicle}
                onChange={e => setPossibleVehicle(e.target.value)}
                style={{ fontSize: 13 }}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 12 }}>Adet</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={vehicleCount}
                onChange={e => setVehicleCount(e.target.value)}
                style={{ fontSize: 13 }}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 12 }}>Amaçlanan Filo / Mevcut Park</label>
              <input
                type="text"
                className="form-input"
                placeholder="Örn: 5 Araçlık Dağıtım Parkı"
                value={targetFleet}
                onChange={e => setTargetFleet(e.target.value)}
                style={{ fontSize: 13 }}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 12 }}>7 Ton Daily ile İlgili</label>
              <select
                className="form-select"
                value={is7TonDaily}
                onChange={e => setIs7TonDaily(e.target.value)}
                style={{ fontSize: 13 }}
              >
                <option value="hayir">Hayır</option>
                <option value="evet">Evet (70C18 / 70C21)</option>
              </select>
            </div>
          </div>

          {/* ── AĞIR VASITA & SATIŞ SORUMLUSU ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 16
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#e2e8f0' }}>
              <input
                type="checkbox"
                checked={isHeavyVehicle}
                onChange={e => setIsHeavyVehicle(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#3b82f6' }}
              />
              <span style={{ fontWeight: 600 }}>Ağır Vasıta ile İlgili (S-Way, T-Way, Çekici, Kamyon)</span>
            </label>

            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              Satış Sorumlusu: <strong style={{ color: '#93c5fd' }}>{user?.full_name || 'King Temsilcisi'}</strong>
            </div>
          </div>

          {/* ── GÖRÜŞME NOTU / AÇIKLAMA (Resimdeki: Minimum 150 Karakter Sayacı Alanı) ── */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: '#e2e8f0' }}>
                * Açıklama / Görüşme Notları
              </label>
              <span style={{ fontSize: 11, color: notes.length < 50 ? '#f59e0b' : '#34d399', fontWeight: 600 }}>
                Açıklama Uzunluk: {notes.length}
              </span>
            </div>
            <textarea
              className="form-input"
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Müşterinin beklentileri, takas durumu, fiyat görüşmesi, teklif ayrıntıları..."
              style={{ fontSize: 13, resize: 'vertical' }}
            />
            <div style={{ fontSize: 11, color: '#f87171', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <FiAlertCircle size={12} /> Bu alanlar kampanya ve takip raporları için önemlidir. Lütfen özenle doldurunuz.
            </div>
          </div>

          {/* ── ALT BUTONLAR ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: 18,
            paddingTop: 14,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn btn-secondary"
              style={{ fontSize: 13, padding: '8px 16px' }}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{
                fontSize: 13,
                fontWeight: 700,
                padding: '8px 20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
              }}
            >
              <FiCheck size={16} />
              {saving ? 'Kaydediliyor...' : 'Fırsatı & Ziyareti Kaydet'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
