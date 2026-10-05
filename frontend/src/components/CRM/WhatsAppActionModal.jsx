import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiMessageSquare, FiX, FiCheckCircle, FiCalendar, FiClock,
  FiSend, FiTag, FiTruck, FiPhone, FiCheck, FiUser, FiBriefcase,
  FiMapPin, FiChevronDown, FiChevronUp, FiSave, FiExternalLink,
  FiFileText, FiArrowRight
} from 'react-icons/fi';
import VoiceInputButton from '../common/VoiceInputButton';
import { salesApi, vehiclesApi, crmApi } from '../../api/client';
import { launchNativeWhatsApp } from '../../utils/whatsapp';
import toast from 'react-hot-toast';

export default function WhatsAppActionModal({
  isOpen,
  onClose,
  customer,
  vehicleTitle = '',
  interestId = null,
  defaultStatus = 'offer_given',
  onSuccess
}) {
  const navigate = useNavigate();

  // Adım kontrolü: 'compose' (WhatsApp Mesajı) | 'post_action' (Görüşme Sonrası Müşteri Kaydı Girişi)
  const [step, setStep] = useState('compose');

  // WhatsApp Mesaj State'leri
  const [status, setStatus] = useState(defaultStatus); // 'offer_given', 'sent', 'follow_up'
  const [message, setMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [nextFollowUp, setNextFollowUp] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Müşteri Bilgileri Akordeon & Form State'leri
  const [showCustomerAccordion, setShowCustomerAccordion] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [customerSaved, setCustomerSaved] = useState(false);
  const [createdCustomerId, setCreatedCustomerId] = useState(null);

  const [customerForm, setCustomerForm] = useState({
    company_name: '',
    contact_name: '',
    phone: '',
    city: '',
    district: '',
    sector: '',
    tax_number: '',
    vergi_dairesi: '',
    current_fleet: '',
    segment: 'C',
    sales_notes: ''
  });

  useEffect(() => {
    if (isOpen && customer) {
      setStep('compose');
      setCustomerSaved(false);
      setCreatedCustomerId(null);
      setShowCustomerAccordion(false);

      // Default follow-up: 3 days later
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 3);
      setNextFollowUp(nextDate.toISOString().split('T')[0]);

      // Set default proposal message
      const vText = vehicleTitle ? `IVECO ${vehicleTitle}` : 'IVECO ticari araç';
      setMessage(
        `Sayın ${customer.company_name || 'Yetkili'}, firmanız için ilgilendiğiniz ${vText} modelimizle ilgili özel fiyat teklifimizi hazırladık. Detayları görüşmek ve sorularınızı yanıtlamak üzere incelemenize sunuyoruz.`
      );
      setInternalNote(
        vehicleTitle 
          ? `${vehicleTitle} aracı için WhatsApp üzerinden resmi fiyat teklifi iletildi.`
          : 'Müşteriye WhatsApp üzerinden teklif iletildi.'
      );
      setStatus(defaultStatus);

      // Müşteri form başlangıç verileri
      const initialForm = {
        company_name: customer.company_name || '',
        contact_name: customer.contact_name || customer.contact_person || '',
        phone: customer.phone || '',
        city: customer.city || '',
        district: customer.district || '',
        sector: customer.sector || '',
        tax_number: customer.tax_number || '',
        vergi_dairesi: customer.vergi_dairesi || '',
        current_fleet: customer.current_fleet || '',
        segment: customer.segment || 'C',
        sales_notes: customer.sales_notes || ''
      };
      setCustomerForm(initialForm);

      // Eğer mevcut müşteri ID'si varsa tam detayları CRM'den çek
      const custId = customer.id || customer.customer_id;
      if (custId) {
        crmApi.getCustomer(custId)
          .then(res => {
            if (res.data) {
              const d = res.data;
              setCustomerForm({
                company_name: d.company_name || initialForm.company_name,
                contact_name: d.contacts?.[0]?.contact_name || d.contacts?.[0]?.name || initialForm.contact_name,
                phone: d.phone || initialForm.phone,
                city: d.city || initialForm.city,
                district: d.district || '',
                sector: d.sector || '',
                tax_number: d.tax_number || '',
                vergi_dairesi: d.vergi_dairesi || '',
                current_fleet: d.current_fleet || '',
                segment: d.segment || 'C',
                sales_notes: d.sales_notes || ''
              });
            }
          })
          .catch(() => {});
      }
    }
  }, [isOpen, customer, vehicleTitle, defaultStatus]);

  if (!isOpen || !customer) return null;

  const activeCustomerId = createdCustomerId || customer.id || customer.customer_id;

  const selectTemplate = (type) => {
    const vText = vehicleTitle ? `IVECO ${vehicleTitle}` : 'IVECO ticari araç';
    if (type === 'teklif') {
      setStatus('offer_given');
      setMessage(`Sayın ${customerForm.company_name || customer.company_name || 'Yetkili'}, firmanız için ilgilendiğiniz ${vText} modelimizle ilgili özel fiyat teklifimizi hazırladık. İnceleyip değerlendirmenizi rica ederiz.`);
      setInternalNote(`${vText} için fiyat teklifi iletildi, karar bekleniyor.`);
    } else if (type === 'katalog') {
      setStatus('sent');
      setMessage(`Sayın ${customerForm.company_name || customer.company_name || 'Yetkili'}, IVECO ${vText} güncel ürün broşürünü, teknik özelliklerini ve avantajlı bayi finansman koşullarını bilginize sunuyoruz.`);
      setInternalNote(`${vText} ürün kataloğu ve teknik verileri gönderildi.`);
    } else if (type === 'kampanya') {
      setStatus('sent');
      setMessage(`Merhaba! IVECO ${vText} araçlarımızda bu aya özel düşük faiz ve takas destekli bayi kampanyamız başlamıştır. Stoktaki hemen teslim araçlarımız için detaylı bilgi alabilirsiniz.`);
      setInternalNote('Özel finansman ve takas kampanyası bilgisi paylaşıldı.');
    } else if (type === 'takip') {
      setStatus('follow_up');
      setMessage(`Sayın ${customerForm.company_name || customer.company_name || 'Yetkili'}, daha önce görüşmüş olduğumuz ${vText} aracımız hakkındaki değerlendirmenizi öğrenmek ve yardımcı olabileceğimiz noktaları netleştirmek isteriz.`);
      setInternalNote('Önceki teklif sonrası takip mesajı gönderildi.');
    }
  };

  const handleAddDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setNextFollowUp(d.toISOString().split('T')[0]);
  };

  // ── WhatsApp'a Yönlendir ve CRM Satış Aktivitesi Ekle ──
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
      const custId = activeCustomerId;

      // 1. CRM Satış Aktivitesi Kaydı Oluştur
      if (custId) {
        await salesApi.createActivity({
          customer_id: custId,
          activity_type: 'whatsapp',
          status: status, // 'offer_given', 'sent', 'follow_up'
          message_content: message,
          notes: internalNote,
          next_follow_up: nextFollowUp || undefined
        });

        // Pipeline aşamasını 'proposal' (Teklif) olarak CRM'e garanti işle
        if (status === 'offer_given') {
          try {
            await crmApi.updateCustomer(custId, {
              pipeline_stage: 'proposal',
              pipeline_note: internalNote || 'WhatsApp ile resmi araç teklifi iletildi.'
            });
          } catch (e) {
            console.warn('Customer pipeline stage update error:', e);
          }
        }
      }

      // 2. Eğer Araç İhtiyacı (Interest) ID'si varsa durumunu 'quoted' (Teklif Yapıldı) olarak güncelle
      if (interestId && status === 'offer_given') {
        try {
          const today = new Date().toISOString().split('T')[0];
          await vehiclesApi.updateCustomerInterest(interestId, {
            opportunity_status: 'quoted',
            last_activity_date: today,
            next_activity_date: nextFollowUp || undefined,
            customer_note: internalNote
          });
        } catch (err) {
          console.warn('Vehicle interest status update warning:', err);
        }
      }

      // 3. Yerel WhatsApp Uygulamasını Aç (Deep Link)
      launchNativeWhatsApp(targetPhone, message);

      if (status === 'offer_given') {
        toast.success("WhatsApp açıldı ve 'Teklif Yapıldı' olarak CRM'e kaydedildi! 🎯", { duration: 4000 });
      } else {
        toast.success("WhatsApp açıldı ve görüşme geçmişe işlendi! 💬", { duration: 4000 });
      }

      if (onSuccess) {
        onSuccess({ status, interestId, customerId: custId });
      }

      if (navigateDirectly && custId) {
        onClose();
        navigate(`/customers/${custId}`);
      } else {
        // WhatsApp'a yönlendirdikten sonra MÜŞTERİ KAYDI GİRİŞ ekranına geçiş yap
        setStep('post_action');
      }
    } catch (err) {
      console.error('WhatsApp kayıt hatası:', err);
      toast.error('Kayıt oluşturulurken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Müşteri Kaydını Güncelle veya Yeni Müşteri Oluştur ──
  const handleSaveCustomerRecord = async (e) => {
    if (e) e.preventDefault();
    if (!customerForm.company_name?.trim()) {
      toast.error('Lütfen bir firma / müşteri adı girin.');
      return;
    }

    try {
      setSavingCustomer(true);
      const custId = activeCustomerId;

      const pStage = status === 'offer_given' ? 'proposal' : 'contact';
      const pNote = customerForm.sales_notes || internalNote || (status === 'offer_given' ? 'WhatsApp üzerinden teklif sunuldu.' : 'Görüşme sağlandı.');

      if (custId) {
        // Var olan müşteriyi güncelle
        await crmApi.updateCustomer(custId, {
          company_name: customerForm.company_name,
          phone: customerForm.phone,
          city: customerForm.city,
          district: customerForm.district,
          sector: customerForm.sector,
          tax_number: customerForm.tax_number,
          vergi_dairesi: customerForm.vergi_dairesi,
          current_fleet: customerForm.current_fleet,
          segment: customerForm.segment,
          sales_notes: customerForm.sales_notes,
          pipeline_stage: pStage,
          pipeline_note: pNote
        });

        // Yetkili kişi varsa contact ekle/güncelle
        if (customerForm.contact_name?.trim()) {
          try {
            await crmApi.addContact(custId, {
              contact_name: customerForm.contact_name,
              phone: customerForm.phone,
              is_primary: true
            });
          } catch {
            // İrtibat kişisi ekleme çakışmasında sessizce devam et
          }
        }

        toast.success(`Müşteri kaydı güncellendi ve Pipeline (${pStage === 'proposal' ? 'Teklif' : 'Görüşme'}) aşamasına işlendi! 🎯`);
      } else {
        // Yeni Müşteri Oluştur
        const createRes = await crmApi.createCustomer({
          company_name: customerForm.company_name,
          phone: customerForm.phone,
          city: customerForm.city,
          district: customerForm.district,
          sector: customerForm.sector,
          tax_number: customerForm.tax_number,
          vergi_dairesi: customerForm.vergi_dairesi,
          current_fleet: customerForm.current_fleet,
          segment: customerForm.segment || 'C',
          sales_notes: customerForm.sales_notes,
          pipeline_stage: pStage,
          pipeline_note: pNote
        });

        const newId = createRes.data?.id;
        setCreatedCustomerId(newId);

        // İrtibat kişisi ekle
        if (customerForm.contact_name?.trim() && newId) {
          try {
            await crmApi.addContact(newId, {
              contact_name: customerForm.contact_name,
              phone: customerForm.phone,
              is_primary: true
            });
          } catch {}
        }

        // Yeni müşteri için aktivite kaydı oluştur
        if (newId) {
          try {
            await salesApi.createActivity({
              customer_id: newId,
              activity_type: 'whatsapp',
              status: status,
              message_content: message,
              notes: pNote,
              next_follow_up: nextFollowUp || undefined
            });
          } catch {}
        }

        toast.success(`Yeni müşteri CRM ve Satış Pipeline (${pStage === 'proposal' ? 'Teklif' : 'Görüşme'}) aşamasına eklendi! 🎯`);
      }

      setCustomerSaved(true);
      if (onSuccess) {
        onSuccess({ customerId: custId || createdCustomerId });
      }
    } catch (err) {
      console.error('Müşteri kaydetme hatası:', err);
      toast.error('Müşteri kaydı kaydedilirken bir hata oluştu.');
    } finally {
      setSavingCustomer(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 120 }}>
      <div 
        className="modal animate-in" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: 560, width: '96%', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ 
              width: 38, height: 38, borderRadius: 10, 
              background: step === 'post_action' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(37, 211, 102, 0.15)', 
              color: step === 'post_action' ? '#10b981' : '#25d366', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              {step === 'post_action' ? <FiCheckCircle size={22} /> : <FiMessageSquare size={20} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                {step === 'post_action' ? 'WhatsApp Sonrası Müşteri Kaydı' : 'WhatsApp & Teklif Gönderimi'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {step === 'post_action' 
                  ? 'Görüşme sonucu edindiğiniz bilgileri sisteme kaydedin veya güncelleyin.' 
                  : "Mesaj WhatsApp'a aktarılır ve CRM'e 'Teklif Yapıldı' olarak işlenir."}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            ADIM 1: WHATSAPP MESAJI & TEKLİF DÜZENLEME (COMPOSE)
           ═══════════════════════════════════════════════════════════════════ */}
        {step === 'compose' && (
          <div>
            {/* Müşteri & Araç Bilgi Şeridi */}
            <div style={{ background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.2)', borderRadius: 10, padding: '10px 12px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-heading)' }}>
                  {customerForm.company_name || customer.company_name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <FiPhone size={11} /> {customerForm.phone || customer.phone || 'Telefon Yok'}
                  {(customerForm.city || customer.city) && <span>· 📍 {customerForm.city || customer.city}</span>}
                </div>
              </div>
              {vehicleTitle && (
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <FiTruck size={12} /> {vehicleTitle}
                </div>
              )}
            </div>

            {/* Aksiyon Durumu Seçimi */}
            <div className="form-group mb-4">
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, display: 'block' }}>
                🎯 CRM'e İşlenecek Satış Aşaması:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setStatus('offer_given')}
                  style={{
                    padding: '8px 6px',
                    borderRadius: 8,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: status === 'offer_given' ? '2px solid #10b981' : '1px solid var(--border-color)',
                    background: status === 'offer_given' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                    color: status === 'offer_given' ? '#10b981' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    transition: 'all 0.2s'
                  }}
                >
                  <FiTag size={14} />
                  <span>Teklif Yapıldı</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('sent')}
                  style={{
                    padding: '8px 6px',
                    borderRadius: 8,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: status === 'sent' ? '2px solid #0284c7' : '1px solid var(--border-color)',
                    background: status === 'sent' ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-card)',
                    color: status === 'sent' ? '#0284c7' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    transition: 'all 0.2s'
                  }}
                >
                  <FiMessageSquare size={14} />
                  <span>Bilgilendirme</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('follow_up')}
                  style={{
                    padding: '8px 6px',
                    borderRadius: 8,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: status === 'follow_up' ? '2px solid #f59e0b' : '1px solid var(--border-color)',
                    background: status === 'follow_up' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-card)',
                    color: status === 'follow_up' ? '#f59e0b' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    transition: 'all 0.2s'
                  }}
                >
                  <FiClock size={14} />
                  <span>Takip Aşaması</span>
                </button>
              </div>
            </div>

            {/* Hazır Mesaj Şablonları */}
            <div style={{ marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                💡 Hızlı Şablonlar:
              </span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => selectTemplate('teklif')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                >
                  💼 Fiyat Teklifi
                </button>
                <button
                  type="button"
                  onClick={() => selectTemplate('katalog')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                >
                  📄 Katalog & Broşür
                </button>
                <button
                  type="button"
                  onClick={() => selectTemplate('kampanya')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                >
                  🔥 Faiz Kampanyası
                </button>
                <button
                  type="button"
                  onClick={() => selectTemplate('takip')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '3px 8px' }}
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

            {/* CRM Şirket İçi Görüşme Notu */}
            <div className="form-group mb-3">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>
                  📝 Dahili CRM Notu (Müşteri Görmez):
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
                placeholder="Örn: 2 adet 35S14 için özel indirimli teklif verildi..."
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            {/* Sonraki Takip Tarihi */}
            <div className="form-group mb-4">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>
                  📅 Sonraki Takip & Karar Tarihi:
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

            {/* ── Opsiyonel: Göndermeden Önce Müşteri Bilgilerini Düzenle Akordeonu ── */}
            <div style={{ marginBottom: '1rem', border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setShowCustomerAccordion(!showCustomerAccordion)}
                style={{
                  width: '100%', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.03)',
                  border: 'none', color: 'var(--text-secondary)', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 600
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiUser size={14} style={{ color: '#38bdf8' }} /> Müşteri Bilgilerini Önceden Düzenle (Opsiyonel)
                </span>
                {showCustomerAccordion ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </button>

              {showCustomerAccordion && (
                <div style={{ padding: '12px', background: 'var(--bg-input, #0f172a)', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Firma Adı</label>
                      <input 
                        className="form-input" 
                        value={customerForm.company_name} 
                        onChange={e => setCustomerForm({ ...customerForm, company_name: e.target.value })} 
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Yetkili Kişi</label>
                      <input 
                        className="form-input" 
                        value={customerForm.contact_name} 
                        onChange={e => setCustomerForm({ ...customerForm, contact_name: e.target.value })} 
                        placeholder="Örn: Ahmet Bey"
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Telefon</label>
                      <input 
                        className="form-input" 
                        value={customerForm.phone} 
                        onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })} 
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Şehir</label>
                      <input 
                        className="form-input" 
                        value={customerForm.city} 
                        onChange={e => setCustomerForm({ ...customerForm, city: e.target.value })} 
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Sektör</label>
                      <input 
                        className="form-input" 
                        value={customerForm.sector} 
                        onChange={e => setCustomerForm({ ...customerForm, sector: e.target.value })} 
                        placeholder="Gıda, Nakliyat vb."
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Mevcut Filo</label>
                      <input 
                        className="form-input" 
                        value={customerForm.current_fleet} 
                        onChange={e => setCustomerForm({ ...customerForm, current_fleet: e.target.value })} 
                        placeholder="Örn: 4 kamyon"
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Aksiyon Butonları */}
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
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#25d366',
                    borderColor: '#25d366',
                    fontWeight: 700,
                    padding: '8px 16px'
                  }}
                >
                  <FiSend size={15} />
                  <span>{submitting ? 'Açılıyor...' : "WhatsApp'ı Aç ve Kaydet 🚀"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            ADIM 2: WHATSAPP YÖNLENDİRMESİ SONRASI MÜŞTERİ KAYDI GİRİŞİ
           ═══════════════════════════════════════════════════════════════════ */}
        {step === 'post_action' && (
          <div className="animate-in">
            {/* Başarı Bildirimi */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 10, padding: '12px 14px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 12
            }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiCheck size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#10b981' }}>
                  WhatsApp Açıldı ve Teklif CRM'e İşlendi! 🎯
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Görüşme sırasında aldığınız bilgileri aşağıdan hemen kaydedebilir veya tam müşteri kartına geçebilirsiniz.
                </div>
              </div>
            </div>

            {/* Müşteri Kayıt Formu */}
            <form onSubmit={handleSaveCustomerRecord} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600, margin: 0 }}>
                      Firma / Müşteri Adı *
                    </label>
                    <VoiceInputButton 
                      onTranscript={t => setCustomerForm(prev => ({ ...prev, company_name: prev.company_name ? prev.company_name + ' ' + t : t }))}
                      title="Firma Adını Sesle Yazdır"
                    />
                  </div>
                  <input
                    className="form-input"
                    required
                    value={customerForm.company_name}
                    onChange={e => setCustomerForm({ ...customerForm, company_name: e.target.value })}
                    placeholder="Örn: Öz Karadeniz Nakliyat"
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600, margin: 0 }}>
                      Yetkili / İrtibat Kişisi
                    </label>
                    <VoiceInputButton 
                      onTranscript={t => setCustomerForm(prev => ({ ...prev, contact_name: prev.contact_name ? prev.contact_name + ' ' + t : t }))}
                      title="Yetkili Adını Sesle Yazdır"
                    />
                  </div>
                  <input
                    className="form-input"
                    value={customerForm.contact_name}
                    onChange={e => setCustomerForm({ ...customerForm, contact_name: e.target.value })}
                    placeholder="Örn: Mustafa Bey (Firma Sahibi)"
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 3 }}>
                    Telefon
                  </label>
                  <input
                    className="form-input"
                    value={customerForm.phone}
                    onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    placeholder="05xx xxx xx xx"
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 3 }}>
                    Sektör / Faaliyet
                  </label>
                  <input
                    className="form-input"
                    value={customerForm.sector}
                    onChange={e => setCustomerForm({ ...customerForm, sector: e.target.value })}
                    placeholder="Örn: Gıda Dağıtım, İnşaat, Lojistik"
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 3 }}>
                    Şehir & İlçe
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      className="form-input"
                      value={customerForm.city}
                      onChange={e => setCustomerForm({ ...customerForm, city: e.target.value })}
                      placeholder="Şehir"
                      style={{ fontSize: '0.85rem', flex: 1 }}
                    />
                    <input
                      className="form-input"
                      value={customerForm.district}
                      onChange={e => setCustomerForm({ ...customerForm, district: e.target.value })}
                      placeholder="İlçe"
                      style={{ fontSize: '0.85rem', flex: 1 }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 3 }}>
                    Vergi No & Dairesi
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      className="form-input"
                      value={customerForm.tax_number}
                      onChange={e => setCustomerForm({ ...customerForm, tax_number: e.target.value })}
                      placeholder="Vergi No / TC"
                      style={{ fontSize: '0.85rem', flex: 1.2 }}
                    />
                    <input
                      className="form-input"
                      value={customerForm.vergi_dairesi}
                      onChange={e => setCustomerForm({ ...customerForm, vergi_dairesi: e.target.value })}
                      placeholder="V. Dairesi"
                      style={{ fontSize: '0.85rem', flex: 1 }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 10 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600, margin: 0 }}>
                      Mevcut Filo / Araçlar
                    </label>
                    <VoiceInputButton 
                      onTranscript={t => setCustomerForm(prev => ({ ...prev, current_fleet: prev.current_fleet ? prev.current_fleet + ' ' + t : t }))}
                      title="Filoyu Sesle Yazdır"
                    />
                  </div>
                  <input
                    className="form-input"
                    value={customerForm.current_fleet}
                    onChange={e => setCustomerForm({ ...customerForm, current_fleet: e.target.value })}
                    placeholder="Örn: 3 adet 2020 Daily, 1 çekici"
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 3 }}>
                    Müşteri Segmenti
                  </label>
                  <select
                    className="form-select"
                    value={customerForm.segment}
                    onChange={e => setCustomerForm({ ...customerForm, segment: e.target.value })}
                    style={{ fontSize: '0.85rem' }}
                  >
                    <option value="A">A — Premium / Filo</option>
                    <option value="B">B — Yüksek Potansiyel</option>
                    <option value="C">C — Standart KOBİ</option>
                    <option value="D">D — Düşük Hacim</option>
                  </select>
                </div>
              </div>

              {/* Görüşme Notu / Satış Notu (Sesli Dikte Destekli) */}
              <div className="form-group" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600, margin: 0 }}>
                    🎙️ WhatsApp Görüşme Sonucu & Müşteri Notu:
                  </label>
                  <VoiceInputButton 
                    onTranscript={t => setCustomerForm(prev => ({ ...prev, sales_notes: prev.sales_notes ? prev.sales_notes + ' ' + t : t }))}
                    title="Görüşme Notunu Konuşarak Yazdır"
                  />
                </div>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={customerForm.sales_notes}
                  onChange={e => setCustomerForm({ ...customerForm, sales_notes: e.target.value })}
                  placeholder="Müşteriyle yapılan görüşme detayları, şartları, araç tercihleri ve bütçe notları..."
                  style={{ fontSize: '0.85rem', lineHeight: '1.4' }}
                />
              </div>

              {/* Kayıt Butonları */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: 6, flexWrap: 'wrap', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  style={{ fontSize: '0.82rem' }}
                >
                  Kapat ve Listeye Dön
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  {activeCustomerId && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        onClose();
                        navigate(`/customers/${activeCustomerId}`);
                      }}
                      style={{ fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                    >
                      <FiExternalLink size={13} />
                      <span>Tam Müşteri Kartını Aç</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={savingCustomer}
                    className="btn btn-primary"
                    style={{
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontWeight: 700,
                      padding: '8px 16px'
                    }}
                  >
                    <FiSave size={15} />
                    <span>{savingCustomer ? 'Kaydediliyor...' : customerSaved ? 'Kaydedildi ✓' : 'Müşteri Kaydını Güncelle 💾'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
