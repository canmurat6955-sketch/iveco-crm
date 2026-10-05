import { useState, useEffect } from 'react';
import { 
  FiMessageSquare, FiX, FiCheckCircle, FiCalendar, FiClock,
  FiSend, FiTag, FiTruck, FiPhone, FiCheck
} from 'react-icons/fi';
import VoiceInputButton from '../common/VoiceInputButton';
import { salesApi, vehiclesApi } from '../../api/client';
import { openWhatsApp } from '../../utils/whatsapp';
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
  const [status, setStatus] = useState(defaultStatus); // 'offer_given', 'sent', 'follow_up'
  const [message, setMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [nextFollowUp, setNextFollowUp] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && customer) {
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
    }
  }, [isOpen, customer, vehicleTitle, defaultStatus]);

  if (!isOpen || !customer) return null;

  const selectTemplate = (type) => {
    const vText = vehicleTitle ? `IVECO ${vehicleTitle}` : 'IVECO ticari araç';
    if (type === 'teklif') {
      setStatus('offer_given');
      setMessage(`Sayın ${customer.company_name || 'Yetkili'}, firmanız için ilgilendiğiniz ${vText} modelimizle ilgili özel fiyat teklifimizi hazırladık. İnceleyip değerlendirmenizi rica ederiz.`);
      setInternalNote(`${vText} için fiyat teklifi iletildi, karar bekleniyor.`);
    } else if (type === 'katalog') {
      setStatus('sent');
      setMessage(`Sayın ${customer.company_name || 'Yetkili'}, IVECO ${vText} güncel ürün broşürünü, teknik özelliklerini ve avantajlı bayi finansman koşullarını bilginize sunuyoruz.`);
      setInternalNote(`${vText} ürün kataloğu ve teknik verileri gönderildi.`);
    } else if (type === 'kampanya') {
      setStatus('sent');
      setMessage(`Merhaba! IVECO ${vText} araçlarımızda bu aya özel düşük faiz ve takas destekli bayi kampanyamız başlamıştır. Stoktaki hemen teslim araçlarımız için detaylı bilgi alabilirsiniz.`);
      setInternalNote('Özel finansman ve takas kampanyası bilgisi paylaşıldı.');
    } else if (type === 'takip') {
      setStatus('follow_up');
      setMessage(`Sayın ${customer.company_name || 'Yetkili'}, daha önce görüşmüş olduğumuz ${vText} aracımız hakkındaki değerlendirmenizi öğrenmek ve yardımcı olabileceğimiz noktaları netleştirmek isteriz.`);
      setInternalNote('Önceki teklif sonrası takip mesajı gönderildi.');
    }
  };

  const handleAddDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setNextFollowUp(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer.phone) {
      toast.error('Müşterinin telefon numarası bulunmuyor.');
      return;
    }
    if (!message.trim()) {
      toast.error('Lütfen bir WhatsApp mesajı yazın.');
      return;
    }

    try {
      setSubmitting(true);

      // 1. CRM Satış Aktivitesi Kaydı Oluştur
      await salesApi.createActivity({
        customer_id: customer.id || customer.customer_id,
        activity_type: 'whatsapp',
        status: status, // 'offer_given', 'sent', 'follow_up'
        message_content: message,
        notes: internalNote,
        next_follow_up: nextFollowUp || undefined
      });

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
      openWhatsApp(customer.phone, message);

      if (status === 'offer_given') {
        toast.success("WhatsApp açıldı ve 'Teklif Yapıldı' olarak CRM'e kaydedildi! 🎯", { duration: 4000 });
      } else {
        toast.success("WhatsApp açıldı ve görüşme geçmişe işlendi! 💬", { duration: 4000 });
      }

      if (onSuccess) {
        onSuccess({ status, interestId });
      }
      onClose();
    } catch (err) {
      console.error('WhatsApp kayıt hatası:', err);
      toast.error('Kayıt oluşturulurken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 120 }}>
      <div 
        className="modal animate-in" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: 540, width: '95%', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(37, 211, 102, 0.15)', color: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiMessageSquare size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                WhatsApp & Teklif Gönderimi
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Mesaj doğrudan müşterinin WhatsApp sohbetine aktarılır ve CRM'e işlenir.
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

        {/* Müşteri & Araç Bilgi Şeridi */}
        <div style={{ background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.2)', borderRadius: 10, padding: '10px 12px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-heading)' }}>
              {customer.company_name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <FiPhone size={11} /> {customer.phone || 'Telefon Yok'}
              {customer.city && <span>· 📍 {customer.city}</span>}
            </div>
          </div>
          {vehicleTitle && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <FiTruck size={12} /> {vehicleTitle}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
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

          {/* Hızlı Şablonlar */}
          <div className="form-group mb-3">
            <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              Hazır Teklif & Mesaj Şablonu Seç:
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => selectTemplate('teklif')}
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                💼 Teklif İletildi
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => selectTemplate('katalog')}
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                📄 Ürün Kataloğu
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => selectTemplate('kampanya')}
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                🔥 Faiz Kampanyası
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => selectTemplate('takip')}
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                ⏳ Karar Takibi
              </button>
            </div>
          </div>

          {/* WhatsApp Mesaj Metni */}
          <div className="form-group mb-3">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>
                💬 WhatsApp'a Gönderilecek Metin:
              </label>
              <VoiceInputButton 
                size="sm"
                onTranscript={(text) => setMessage(prev => prev ? `${prev} ${text}` : text)}
              />
            </div>
            <textarea
              className="form-textarea"
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="WhatsApp mesaj içeriğini buraya yazın veya mikrofona basarak konuşun..."
              required
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          {/* Dahili CRM Notu (Internal Notes) */}
          <div className="form-group mb-3">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>
                📝 CRM Görüşme / Teklif Notunuz:
              </label>
              <VoiceInputButton 
                size="sm"
                onTranscript={(text) => setInternalNote(prev => prev ? `${prev} ${text}` : text)}
              />
            </div>
            <input
              type="text"
              className="form-input"
              value={internalNote}
              onChange={e => setInternalNote(e.target.value)}
              placeholder="Örn: 35C16 aracı için 1.450.000 TL takas destekli teklif sunuldu. Karar bekleniyor."
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

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
              style={{ fontSize: '0.85rem' }}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={submitting}
              style={{
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#25d366',
                borderColor: '#25d366',
                fontWeight: 700,
                padding: '8px 16px'
              }}
            >
              {submitting ? (
                <span>Kaydediliyor...</span>
              ) : (
                <>
                  <FiSend size={15} />
                  <span>WhatsApp'ı Aç & {status === 'offer_given' ? "'Teklif Yapıldı' Kaydet" : 'Kaydı Tamamla'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
