import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiMessageSquare, FiX, FiCheckCircle, FiCalendar, FiClock,
  FiSend, FiTag, FiTruck, FiPhone, FiCheck, FiUser, FiBriefcase,
  FiMapPin, FiChevronDown, FiChevronUp, FiSave, FiExternalLink,
  FiFileText, FiArrowRight, FiRefreshCw
} from 'react-icons/fi';
import VoiceInputButton from '../common/VoiceInputButton';
import { salesApi, vehiclesApi, crmApi } from '../../api/client';
import { launchNativeWhatsApp } from '../../utils/whatsapp';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const PIPELINE_STAGES = [
  { key: 'lead', label: 'Lead', color: '#818cf8', emoji: '🎯' },
  { key: 'contact', label: 'İlk Görüşme', color: '#38bdf8', emoji: '📞' },
  { key: 'proposal', label: 'Teklif', color: '#fbbf24', emoji: '📋' },
  { key: 'negotiation', label: 'Pazarlık', color: '#fb923c', emoji: '🤝' },
  { key: 'won', label: 'Kazanıldı', color: '#34d399', emoji: '✅' },
];

const STAGE_LABELS = {
  lead: '🎯 Lead Adayı',
  contact: '📞 İlk Görüşme',
  proposal: '📋 Teklif Verildi',
  negotiation: '🤝 Pazarlık Aşaması',
  won: '✅ Kazanıldı (Satış)',
  lost: '❌ Kaybedildi'
};

const IVECO_MODELS = [
  'Daily Şasi',
  'Daily Panelvan',
  'Daily 72C',
  'Eurocargo',
  'S-Way',
  'T-Way'
];

export default function WhatsAppActionModal({
  isOpen,
  onClose,
  customer,
  vehicleTitle = '',
  interestId = null,
  defaultStatus = 'offer_given',
  defaultMessage = '',
  onSuccess
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const salesRepName = (user?.full_name && !user.full_name.includes('Sistem') && !user.full_name.includes('King'))
    ? user.full_name
    : 'Can Murat';

  // Adım kontrolü: 'compose' (WhatsApp Mesajı & Hazırlık) | 'post_action' (Bilgi Kartı & Pipeline Onayı)
  const [step, setStep] = useState('compose');

  // Pipeline & Satış Aktivite State'leri
  const [pipelineStage, setPipelineStage] = useState('proposal');
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleTitle || 'Daily Şasi');
  const [status, setStatus] = useState(defaultStatus); // 'offer_given', 'sent', 'follow_up'
  const [message, setMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [nextFollowUp, setNextFollowUp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [changingStage, setChangingStage] = useState(false);

  // Müşteri Bilgileri & Akordeon State'leri
  const [showCustomerAccordion, setShowCustomerAccordion] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [customerSaved, setCustomerSaved] = useState(false);
  const [createdCustomerId, setCreatedCustomerId] = useState(null);

  const [customerForm, setCustomerForm] = useState({
    company_name: '',
    contact_name: '',
    phone: '',
    landline_phone: '',
    city: '',
    district: '',
    sector: '',
    tax_number: '',
    vergi_dairesi: '',
    current_fleet: '',
    segment: '',
    sales_notes: ''
  });

  useEffect(() => {
    if (isOpen && customer) {
      setStep('compose');
      setCustomerSaved(false);
      setCreatedCustomerId(null);
      setShowCustomerAccordion(false);

      setSelectedVehicle(vehicleTitle || 'Daily Şasi');

      // Default follow-up: 3 gün sonra
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 3);
      setNextFollowUp(nextDate.toISOString().split('T')[0]);

      // Başlangıç pipeline aşaması
      const existingStage = customer.pipeline_stage;
      const initialStage = (existingStage && existingStage !== 'pool')
        ? existingStage
        : (defaultStatus === 'offer_given' ? 'proposal' : 'contact');
      setPipelineStage(initialStage);
      setStatus(defaultStatus);

      // WhatsApp Mesajı ve Dahili Not
      const curVeh = vehicleTitle || 'Daily Şasi';
      const vText = `IVECO ${curVeh}`;
      if (defaultMessage) {
        setMessage(defaultMessage);
      } else {
        const recipient = customer.contact_name?.trim()
          ? `Sayın ${customer.contact_name}`
          : `Sayın ${customer.company_name || 'Yetkili'}`;
        setMessage(
          `Merhaba ${recipient}, ben IVECO ERC Otomotiv Satış Sorumlusu ${salesRepName}. ${customer.company_name ? customer.company_name + ' firmanız' : 'Firmanız'} için hazırladığımız avantajlı ${vText} kampanyamızı ve özel fiyat teklifimizi sizinle paylaşmak istedim. Düşünürseniz hemen teslim araçlarımız, düşük faiz ve takas destekli bayi fırsatlarımız hakkında detaylı bilgi vermekten memnuniyet duyarım.`
        );
      }

      setInternalNote(
        `${curVeh} aracı için WhatsApp üzerinden resmi teklif/görüşme yönlendirildi.`
      );

      // Müşteri form başlangıç verileri
      const initialForm = {
        company_name: customer.company_name || customer.name || '',
        contact_name: customer.contact_name || customer.contact_person || '',
        phone: customer.phone || '',
        landline_phone: customer.landline_phone || '',
        city: customer.city || '',
        district: customer.district || '',
        sector: customer.sector || '',
        tax_number: customer.tax_number || '',
        vergi_dairesi: customer.vergi_dairesi || '',
        current_fleet: customer.current_fleet || `İlgilenilen: ${curVeh}`,
        segment: customer.segment || '',
        sales_notes: customer.sales_notes || ''
      };
      setCustomerForm(initialForm);

      // Eğer kayıtlı müşteri ID'si varsa CRM'den en güncel detayları çek
      const custId = customer.id || customer.customer_id;
      if (custId) {
        crmApi.getCustomer(custId)
          .then(res => {
            if (res.data) {
              const d = res.data;
              if (d.pipeline_stage && d.pipeline_stage !== 'pool') {
                setPipelineStage(d.pipeline_stage);
              }
              setCustomerForm({
                company_name: d.company_name || initialForm.company_name,
                contact_name: d.contacts?.[0]?.contact_name || d.contacts?.[0]?.name || initialForm.contact_name,
                phone: d.phone || initialForm.phone,
                landline_phone: d.landline_phone || initialForm.landline_phone,
                city: d.city || initialForm.city,
                district: d.district || '',
                sector: d.sector || '',
                tax_number: d.tax_number || '',
                vergi_dairesi: d.vergi_dairesi || '',
                current_fleet: d.current_fleet || initialForm.current_fleet,
                segment: d.segment || '',
                sales_notes: d.sales_notes || ''
              });
            }
          })
          .catch(() => {});
      }
    }
  }, [isOpen, customer, vehicleTitle, defaultStatus, defaultMessage]);

  if (!isOpen || !customer) return null;

  const activeCustomerId = createdCustomerId || customer.id || customer.customer_id;

  const handleSelectModel = (model) => {
    setSelectedVehicle(model);
    setCustomerForm(prev => ({
      ...prev,
      current_fleet: `İlgilenilen: ${model}`
    }));
    setInternalNote(`${model} aracı için WhatsApp üzerinden görüşme/teklif yönlendirildi.`);
    const recipient = customerForm.contact_name?.trim()
      ? `Sayın ${customerForm.contact_name}`
      : `Sayın ${customerForm.company_name || customer.company_name || 'Yetkili'}`;
    if (pipelineStage === 'proposal') {
      setMessage(`Merhaba ${recipient}, ben IVECO ERC Otomotiv Satış Sorumlusu ${salesRepName}. Firmanız için hazırladığımız avantajlı IVECO ${model} kampanyamızı ve özel fiyat teklifimizi sizinle paylaşmak istedim. Düşünürseniz hemen teslim araçlarımız, düşük faiz ve takas destekli bayi fırsatlarımız hakkında detaylı bilgi vermekten memnuniyet duyarım.`);
    } else {
      setMessage(`Merhaba ${recipient}, ben IVECO ERC Otomotiv Satış Sorumlusu ${salesRepName}. Hazırladığımız avantajlı IVECO ${model} kampanyamızı ve özel teklifimizi sizinle paylaşmak istedim. Düşünürseniz detayları ve araç özelliklerini görüşmekten memnuniyet duyarım.`);
    }
  };

  const selectTemplate = (type) => {
    const curVeh = selectedVehicle || vehicleTitle || 'Daily Şasi';
    const vText = `IVECO ${curVeh}`;
    const recipient = customerForm.contact_name?.trim()
      ? `Sayın ${customerForm.contact_name}`
      : `Sayın ${customerForm.company_name || customer.company_name || 'Yetkili'}`;

    if (type === 'teklif') {
      setStatus('offer_given');
      setPipelineStage('proposal');
      setMessage(`Merhaba ${recipient}, ben IVECO ERC Otomotiv Satış Sorumlusu ${salesRepName}. Firmanız için hazırladığımız avantajlı ${vText} kampanyamızı ve özel fiyat teklifimizi sizinle paylaşmak istedim. Düşünürseniz teklif detaylarını ve ödeme seçeneklerini birlikte değerlendirmekten memnuniyet duyarım.`);
      setInternalNote(`${vText} için fiyat teklifi iletildi, karar bekleniyor.`);
    } else if (type === 'katalog') {
      setStatus('sent');
      setPipelineStage('contact');
      setMessage(`Merhaba ${recipient}, ben IVECO ERC Otomotiv Satış Sorumlusu ${salesRepName}. ${vText} güncel ürün broşürünü, teknik özelliklerini ve avantajlı bayi finansman koşullarımızı bilginize sunmak istedim. Düşünürseniz araç detaylarını ve uygun donanım alternatiflerini görüşmekten memnuniyet duyarım.`);
      setInternalNote(`${vText} ürün kataloğu ve teknik verileri gönderildi.`);
    } else if (type === 'kampanya') {
      setStatus('sent');
      setPipelineStage('contact');
      setMessage(`Merhaba ${recipient}, ben IVECO ERC Otomotiv Satış Sorumlusu ${salesRepName}. ${vText} araçlarımız için hazırladığımız düşük faiz ve takas destekli yeni dönem bayi kampanyamızı sizinle paylaşmak istedim. Düşünürseniz stoktaki hemen teslim araçlarımız hakkında detaylı bilgi vermekten memnuniyet duyarım.`);
      setInternalNote('Özel finansman ve takas kampanyası bilgisi paylaşıldı.');
    } else if (type === 'takip') {
      setStatus('follow_up');
      setMessage(`Merhaba ${recipient}, ben IVECO ERC Otomotiv Satış Sorumlusu ${salesRepName}. Daha önce paylaşmış olduğumuz ${vText} kampanyamız ve teklifimiz hakkındaki değerlendirmenizi öğrenmek istedim. Düşünürseniz yardımcı olabileceğimiz noktaları netleştirmekten memnuniyet duyarım.`);
      setInternalNote('Önceki teklif sonrası takip mesajı gönderildi.');
    }
  };

  const handleAddDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setNextFollowUp(d.toISOString().split('T')[0]);
  };

  // ── WhatsApp'a Yönlendir ve Satış Pipeline'ına Garantili Ekle ──
  const handleLaunchWhatsApp = async ({ navigateDirectly = false } = {}) => {
    const targetPhone = customerForm.phone || customer.phone;
    if (!targetPhone) {
      toast.error('Müşterinin telefon numarası bulunmuyor.');
      return;
    }
    if (!message.trim()) {
      toast.error('Lütfen bir WhatsApp mesajı yazın.');
      return;
    }

    try {
      setSubmitting(true);
      let effectiveCustId = activeCustomerId;
      const todayStr = new Date().toISOString().split('T')[0];
      const pStage = pipelineStage || (status === 'offer_given' ? 'proposal' : 'contact');
      const pNote = customerForm.sales_notes || internalNote || (pStage === 'proposal' ? 'WhatsApp üzerinden teklif iletildi.' : 'WhatsApp görüşmesi başlatıldı.');

      // 1. Müşteri henüz CRM'de kayıtlı değilse oluştur ve Pipeline'a ata
      if (!effectiveCustId) {
        try {
          const compName = (customerForm.company_name || customer.company_name || customer.name || 'Yeni Keşif Adayı').trim();
          const createRes = await crmApi.createCustomer({
            company_name: compName,
            phone: targetPhone,
            landline_phone: customerForm.landline_phone || customer.landline_phone || null,
            city: customerForm.city || customer.city || 'Samsun',
            district: customerForm.district || customer.district || '',
            sector: customerForm.sector || customer.sector || 'Ticari Araç Adayı',
            tax_number: customerForm.tax_number || customer.tax_number || '',
            vergi_dairesi: customerForm.vergi_dairesi || customer.vergi_dairesi || '',
            current_fleet: customerForm.current_fleet || (selectedVehicle || vehicleTitle ? `İlgilenilen: ${selectedVehicle || vehicleTitle}` : ''),
            segment: customerForm.segment || null,
            sales_notes: pNote,
            pipeline_stage: pStage,
            pipeline_note: pNote,
            last_contact_date: todayStr,
            potential_score: 95,
            potential_level: 'very_high',
            source: 'discovery_whatsapp'
          });

          if (createRes.data?.id) {
            effectiveCustId = createRes.data.id;
            setCreatedCustomerId(effectiveCustId);
            setCustomerSaved(true);

            // Yetkili kişi varsa contact ekle
            if (customerForm.contact_name?.trim()) {
              try {
                await crmApi.addContact(effectiveCustId, {
                  contact_name: customerForm.contact_name,
                  phone: targetPhone,
                  is_primary: true
                });
              } catch {}
            }
          }
        } catch (createErr) {
          console.warn('Otomatik müşteri oluşturma uyarısı:', createErr);
        }
      } else {
        // 2. Mevcut müşteri ise Pipeline Aşaması, Not ve Son İletişim Tarihini GARANTİ GÜNCELLE!
        try {
          await crmApi.updateCustomer(effectiveCustId, {
            pipeline_stage: pStage,
            pipeline_note: pNote,
            last_contact_date: todayStr
          });
        } catch (uErr) {
          console.warn('Müşteri pipeline güncelleme uyarısı:', uErr);
        }
      }

      // 3. CRM Satış Aktivitesi Kaydı Oluştur
      if (effectiveCustId) {
        try {
          await salesApi.createActivity({
            customer_id: effectiveCustId,
            activity_type: 'whatsapp',
            status: status, // 'offer_given', 'sent', 'follow_up'
            message_content: message,
            notes: internalNote || pNote,
            next_follow_up: nextFollowUp || undefined
          });
        } catch (actErr) {
          console.warn('Satış aktivitesi kayıt uyarısı:', actErr);
        }
      }

      // 4. Araç Talebi (Interest) varsa durumunu 'quoted' veya 'contacted' yap
      if (interestId) {
        try {
          await vehiclesApi.updateCustomerInterest(interestId, {
            opportunity_status: status === 'offer_given' ? 'quoted' : 'contacted',
            last_activity_date: todayStr,
            next_activity_date: nextFollowUp || undefined,
            customer_note: internalNote
          });
        } catch (err) {
          console.warn('Vehicle interest status update warning:', err);
        }
      }

      // 5. Yerel WhatsApp Uygulamasını Aç (Deep Link)
      launchNativeWhatsApp(targetPhone, message);

      toast.success(`WhatsApp açıldı ve müşteri Satış Pipeline'ına (${STAGE_LABELS[pStage] || pStage}) eklendi! 🎯`, { duration: 5000 });

      if (onSuccess) {
        onSuccess({ status, interestId, customerId: effectiveCustId, pipeline_stage: pStage });
      }

      if (navigateDirectly && effectiveCustId) {
        onClose();
        navigate(`/customers/${effectiveCustId}`);
      } else {
        // WhatsApp yönlendirmesinden sonra BİLGİ KARTINA geçiş yap
        setStep('post_action');
      }
    } catch (err) {
      console.error('WhatsApp kayıt hatası:', err);
      toast.error('Kayıt oluşturulurken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── 1-Tıkla Pipeline Aşamasını Değiştir (Bilgi Kartı İçinden) ──
  const handleUpdateStage = async (newStage) => {
    const custId = activeCustomerId;
    if (!custId) return;
    try {
      setChangingStage(true);
      await crmApi.updateCustomer(custId, {
        pipeline_stage: newStage,
        pipeline_note: `Aşama ${STAGE_LABELS[newStage] || newStage} olarak güncellendi.`
      });
      setPipelineStage(newStage);
      toast.success(`Pipeline Aşaması "${STAGE_LABELS[newStage]}" olarak güncellendi! 🎯`);
      if (onSuccess) {
        onSuccess({ status, interestId, customerId: custId, pipeline_stage: newStage });
      }
    } catch (err) {
      console.error('Aşama güncelleme hatası:', err);
      toast.error('Aşama güncellenirken bir hata oluştu');
    } finally {
      setChangingStage(false);
    }
  };

  // ── Müşteri Ek Bilgilerini Güncelle (Opsiyonel Akordeon) ──
  const handleSaveCustomerRecord = async (e) => {
    if (e) e.preventDefault();
    if (!customerForm.company_name?.trim()) {
      toast.error('Lütfen bir firma / müşteri adı girin.');
      return;
    }

    try {
      setSavingCustomer(true);
      const custId = activeCustomerId;
      const todayStr = new Date().toISOString().split('T')[0];
      const pStage = pipelineStage || (status === 'offer_given' ? 'proposal' : 'contact');
      const pNote = customerForm.sales_notes || internalNote || 'Bilgiler güncellendi.';

      if (custId) {
        await crmApi.updateCustomer(custId, {
          company_name: customerForm.company_name,
          phone: customerForm.phone,
          city: customerForm.city,
          district: customerForm.district,
          sector: customerForm.sector,
          tax_number: customerForm.tax_number,
          vergi_dairesi: customerForm.vergi_dairesi,
          current_fleet: customerForm.current_fleet,
          segment: customerForm.segment || null,
          sales_notes: customerForm.sales_notes,
          pipeline_stage: pStage,
          pipeline_note: pNote,
          last_contact_date: todayStr
        });

        if (customerForm.contact_name?.trim()) {
          try {
            await crmApi.addContact(custId, {
              contact_name: customerForm.contact_name,
              phone: customerForm.phone,
              is_primary: true
            });
          } catch {}
        }

        setCustomerSaved(true);
        toast.success(`Müşteri bilgileri güncellendi! 💾`);
      }
    } catch (err) {
      console.error('Müşteri kaydetme hatası:', err);
      toast.error('Bilgiler kaydedilirken bir hata oluştu.');
    } finally {
      setSavingCustomer(false);
    }
  };

  const targetPhone = customerForm.phone || customer.phone;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
      onClick={e => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 640,
          maxHeight: '92vh',
          overflowY: 'auto',
          margin: 0,
          background: 'var(--bg-card, #1e293b)',
          border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          borderRadius: 14,
          padding: '1.25rem'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: step === 'post_action' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(37, 211, 102, 0.15)',
                color: step === 'post_action' ? '#10b981' : '#25d366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {step === 'post_action' ? <FiCheckCircle size={20} /> : <FiMessageSquare size={18} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {step === 'compose' ? 'WhatsApp Mesajı & Satış Pipeline' : 'WhatsApp Yönlendirildi · Bilgi Kartı'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {step === 'compose' ? "Yönlendirme yapıldığında müşteri doğrudan Satış Pipeline'ına işlenir." : "Müşteri Satış Pipeline'ına alındı, aşama ve iletişim özeti aşağıdadır."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            ADIM 1: MESAJ HAZIRLIĞI & PIPELINE AŞAMA SEÇİMİ
           ═══════════════════════════════════════════════════════════════════ */}
        {step === 'compose' && (
          <div>
            {/* Hedef Müşteri Özeti */}
            <div
              style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 8,
                padding: '10px 12px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {customerForm.company_name || customer.company_name || 'İsimsiz Firma'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {customerForm.contact_name && <span>👤 {customerForm.contact_name}</span>}
                  {targetPhone && <span>📱 {targetPhone}</span>}
                  {customerForm.landline_phone && <span>☎️ Sabit: {customerForm.landline_phone}</span>}
                  {customerForm.city && <span>📍 {customerForm.city} {customerForm.district ? `/ ${customerForm.district}` : ''}</span>}
                </div>
              </div>
              {(selectedVehicle || vehicleTitle) && (
                <div className="badge badge-amber" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiTruck size={13} /> {selectedVehicle || vehicleTitle}
                </div>
              )}
            </div>

            {/* Pipeline Hedef Aşaması Seçici */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block' }}>
                🎯 Eklenecek Pipeline Aşaması:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {[
                  { key: 'contact', label: 'İlk Görüşme', emoji: '📞', color: '#38bdf8' },
                  { key: 'proposal', label: 'Teklif', emoji: '📋', color: '#fbbf24' },
                  { key: 'negotiation', label: 'Pazarlık', emoji: '🤝', color: '#fb923c' },
                  { key: 'won', label: 'Kazanıldı', emoji: '✅', color: '#34d399' }
                ].map(st => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => {
                      setPipelineStage(st.key);
                      if (st.key === 'proposal') setStatus('offer_given');
                      else if (st.key === 'contact') setStatus('sent');
                    }}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 8,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: pipelineStage === st.key ? `2px solid ${st.color}` : '1px solid var(--border-color)',
                      background: pipelineStage === st.key ? `${st.color}20` : 'var(--bg-card)',
                      color: pipelineStage === st.key ? st.color : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 3,
                      transition: 'all 0.15s'
                    }}
                  >
                    <span>{st.emoji}</span>
                    <span>{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* IVECO Model Seçimi (Hızlı Seçim) */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                <FiTruck size={14} style={{ color: '#fbbf24' }} /> İlgilenilen IVECO Modeli:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {IVECO_MODELS.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelectModel(m)}
                    style={{
                      padding: '7px 8px',
                      borderRadius: 8,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: (selectedVehicle === m) ? '2px solid #fbbf24' : '1px solid var(--border-color)',
                      background: (selectedVehicle === m) ? 'rgba(251, 191, 36, 0.2)' : 'var(--bg-card)',
                      color: (selectedVehicle === m) ? '#fbbf24' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      transition: 'all 0.15s'
                    }}
                  >
                    <FiTruck size={12} />
                    <span>{m}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hızlı Şablonlar */}
            <div style={{ marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                💡 Hızlı Şablonlar (Tek tıkla hazır metin):
              </span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => selectTemplate('teklif')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                >
                  💼 Fiyat Teklifi
                </button>
                <button
                  type="button"
                  onClick={() => selectTemplate('katalog')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                >
                  📄 Katalog & Broşür
                </button>
                <button
                  type="button"
                  onClick={() => selectTemplate('kampanya')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                >
                  🔥 Kampanya Koşulları
                </button>
                <button
                  type="button"
                  onClick={() => selectTemplate('takip')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                >
                  ⏳ Karar Takibi
                </button>
              </div>
            </div>

            {/* WhatsApp Mesaj Metni + Sesli Dikte */}
            <div className="form-group mb-3">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>
                  💬 WhatsApp Mesaj Metni:
                </label>
                <VoiceInputButton
                  onTranscript={t => setMessage(prev => (prev ? prev + ' ' + t : t))}
                  title="Mesajı Sesle Yazdır"
                />
              </div>
              <textarea
                className="form-textarea"
                rows={3}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Müşteriye iletilecek WhatsApp mesajını yazın veya mikrofona konuşun..."
                style={{ fontSize: '0.85rem', lineHeight: '1.4' }}
              />
            </div>

            {/* Dahili CRM Notu */}
            <div className="form-group mb-3">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>
                  📝 Dahili Satış Notu (Pipeline kartında görünür):
                </label>
                <VoiceInputButton
                  onTranscript={t => setInternalNote(prev => (prev ? prev + ' ' + t : t))}
                  title="Notu Sesle Yazdır"
                />
              </div>
              <input
                type="text"
                className="form-input"
                value={internalNote}
                onChange={e => setInternalNote(e.target.value)}
                placeholder="Örn: 2 adet Daily için özel indirimli teklif iletildi..."
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            {/* Sonraki Takip Tarihi */}
            <div className="form-group mb-4">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>
                  📅 Sonraki Takip Tarihi:
                </label>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button type="button" onClick={() => handleAddDays(3)} className="btn btn-secondary btn-sm" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>+3 Gün</button>
                  <button type="button" onClick={() => handleAddDays(7)} className="btn btn-secondary btn-sm" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>+1 Hafta</button>
                  <button type="button" onClick={() => handleAddDays(15)} className="btn btn-secondary btn-sm" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>+15 Gün</button>
                </div>
              </div>
              <input
                type="date"
                className="form-input"
                value={nextFollowUp}
                onChange={e => setNextFollowUp(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            {/* Aksiyon Butonları */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', flexWrap: 'wrap', gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={submitting}
                style={{ fontSize: '0.82rem' }}
              >
                İptal
              </button>

              <div style={{ display: 'flex', gap: 8 }}>
                {activeCustomerId && (
                  <button
                    type="button"
                    onClick={() => handleLaunchWhatsApp({ navigateDirectly: true })}
                    disabled={submitting}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                    title="WhatsApp'ı aç ve doğrudan tam müşteri detay sayfasına yönlendir"
                  >
                    <FiExternalLink size={13} />
                    <span>WhatsApp & Kartı Aç</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleLaunchWhatsApp({ navigateDirectly: false })}
                  disabled={submitting}
                  className="btn btn-success"
                  style={{
                    fontSize: '0.88rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    background: '#25d366',
                    borderColor: '#25d366',
                    fontWeight: 800,
                    padding: '8px 18px',
                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)'
                  }}
                >
                  <FiSend size={15} />
                  <span>{submitting ? 'Yönlendiriliyor...' : "WhatsApp'a Yönlendir & Pipeline'a Ekle 🚀"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            ADIM 2: BİLGİ KARTI & PİPELİNE YÖNLENDİRME (KULLANICI TALEBİ)
           ═══════════════════════════════════════════════════════════════════ */}
        {step === 'post_action' && (
          <div className="animate-in">
            {/* 1. Başarı & Pipeline Onay Banner'ı */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(59, 130, 246, 0.12) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: 14
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: '#10b981',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                }}
              >
                <FiCheck size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span>WhatsApp Yönlendirildi · Satış Pipeline'ına Eklendi!</span>
                  <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>AKTİF TAKİPTE</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                  Müşteri <strong>{STAGE_LABELS[pipelineStage] || pipelineStage}</strong> aşamasına aktarıldı ve satış aktivitesi kaydedildi.
                </div>
              </div>
            </div>

            {/* 2. Tek Tıkla Aşama Değiştirici */}
            <div
              style={{
                background: 'var(--bg-input, #0f172a)',
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                padding: '10px 12px',
                marginBottom: '1rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📊 Pipeline Aşaması (Değiştirmek için tıkla):
                </span>
                <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 700 }}>
                  {changingStage ? 'Güncelleniyor...' : STAGE_LABELS[pipelineStage] || pipelineStage}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                {PIPELINE_STAGES.map(st => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => handleUpdateStage(st.key)}
                    disabled={changingStage}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 8,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      border: pipelineStage === st.key ? `2px solid ${st.color}` : '1px solid var(--border-color)',
                      background: pipelineStage === st.key ? `${st.color}25` : 'rgba(255, 255, 255, 0.03)',
                      color: pipelineStage === st.key ? st.color : 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 3,
                      transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ fontSize: '0.95rem' }}>{st.emoji}</span>
                    <span>{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Müşteri & İletişim Bilgi Kartı */}
            <div
              style={{
                background: 'var(--bg-card, #1e293b)',
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: '1rem'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>🏢 Firma / Müşteri:</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {customerForm.company_name || customer.company_name || '—'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>👤 Yetkili Kişi:</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {customerForm.contact_name || customer.contact_name || 'Belirtilmedi'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>📱 Cep Telefonu (WhatsApp):</span>
                  <a href={`tel:${targetPhone}`} style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8', textDecoration: 'none' }}>
                    {targetPhone || '—'}
                  </a>
                </div>
                {customerForm.landline_phone && (
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>☎️ Sabit Hat / Ofis:</span>
                    <a href={`tel:${customerForm.landline_phone}`} style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', textDecoration: 'none' }}>
                      {customerForm.landline_phone}
                    </a>
                  </div>
                )}
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>📍 Konum:</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {[customerForm.city || customer.city, customerForm.district || customer.district].filter(Boolean).join(' / ') || 'Belirtilmedi'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>🚛 İlgilenilen Araç:</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fbbf24' }}>
                    {vehicleTitle || customerForm.current_fleet || 'IVECO Ticari Araç'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>📅 Sonraki Takip:</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>
                    {nextFollowUp || 'Planlanmadı'}
                  </span>
                </div>
              </div>

              {/* İletilen WhatsApp Mesajı Özeti */}
              {message && (
                <div
                  style={{
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: '1px dashed var(--border-color)',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: '#25d366', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    💬 İletilen WhatsApp Mesajı:
                  </span>
                  <div
                    style={{
                      background: 'rgba(37, 211, 102, 0.08)',
                      borderLeft: '3px solid #25d366',
                      padding: '7px 10px',
                      borderRadius: '0 6px 6px 0',
                      fontStyle: 'italic',
                      lineHeight: 1.4
                    }}
                  >
                    "{message}"
                  </div>
                </div>
              )}
            </div>

            {/* 4. Ana Hızlı Aksiyon & Yönlendirme Butonları */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/pipeline');
                }}
                className="btn btn-primary"
                style={{
                  flex: '1 1 180px',
                  padding: '10px 14px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
                }}
              >
                <span>🎯 Satış Pipeline'ında Gör</span>
                <FiArrowRight size={16} />
              </button>

              {activeCustomerId && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`/customers/${activeCustomerId}`);
                  }}
                  className="btn btn-secondary"
                  style={{
                    flex: '1 1 140px',
                    padding: '10px 14px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <FiUser size={14} />
                  <span>Müşteri Kartına Git</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => launchNativeWhatsApp(targetPhone, message)}
                className="btn btn-secondary"
                style={{
                  padding: '10px 12px',
                  fontSize: '0.82rem',
                  color: '#25d366',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
                title="WhatsApp uygulamasını tekrar aç"
              >
                <FiMessageSquare size={14} />
                <span>Tekrar Aç</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ padding: '10px 14px', fontSize: '0.84rem' }}
              >
                Kapat
              </button>
            </div>

            {/* 5. Opsiyonel: Ek Firma Bilgilerini Düzenle Akordeonu */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setShowCustomerAccordion(!showCustomerAccordion)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiFileText size={14} style={{ color: '#c084fc' }} />
                  Ek Müşteri Bilgilerini Tamamla (Vergi No, Filo vb.)
                </span>
                {showCustomerAccordion ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
              </button>

              {showCustomerAccordion && (
                <form onSubmit={handleSaveCustomerRecord} style={{ padding: '12px', background: 'var(--bg-input, #0f172a)', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Vergi Numarası / TC</label>
                      <input
                        className="form-input"
                        value={customerForm.tax_number}
                        onChange={e => setCustomerForm({ ...customerForm, tax_number: e.target.value })}
                        placeholder="Vergi No"
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Vergi Dairesi</label>
                      <input
                        className="form-input"
                        value={customerForm.vergi_dairesi}
                        onChange={e => setCustomerForm({ ...customerForm, vergi_dairesi: e.target.value })}
                        placeholder="V. Dairesi"
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 8 }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Mevcut Filo / Araçlar</label>
                      <input
                        className="form-input"
                        value={customerForm.current_fleet}
                        onChange={e => setCustomerForm({ ...customerForm, current_fleet: e.target.value })}
                        placeholder="Örn: 3 adet Daily, 1 çekici"
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Sektör</label>
                      <input
                        className="form-input"
                        value={customerForm.sector}
                        onChange={e => setCustomerForm({ ...customerForm, sector: e.target.value })}
                        placeholder="Gıda, Nakliyat vb."
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.72rem' }}>Müşteri Görüşme Notu</label>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      value={customerForm.sales_notes}
                      onChange={e => setCustomerForm({ ...customerForm, sales_notes: e.target.value })}
                      placeholder="Görüşme notları..."
                      style={{ fontSize: '0.8rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                    <button
                      type="submit"
                      disabled={savingCustomer}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                    >
                      <FiSave size={13} />
                      <span>{savingCustomer ? 'Kaydediliyor...' : customerSaved ? 'Kaydedildi ✓' : 'Bilgileri Kaydet'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
