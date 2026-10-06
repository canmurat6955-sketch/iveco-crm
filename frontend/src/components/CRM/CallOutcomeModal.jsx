import React, { useState } from 'react';
import { FiPhone, FiX, FiCheck, FiCalendar, FiClock, FiFileText } from 'react-icons/fi';
import { workbenchApi } from '../../api/client';

const OUTCOMES = [
  { id: 'interested', label: 'Görüşüldü – İlgileniyor', color: '#10b981', desc: 'İletişim aşamasına taşınır' },
  { id: 'offer_given', label: 'Teklif Verildi', color: '#0284c7', desc: 'Teklif aşamasına taşınır (Skor: 95)' },
  { id: 'call_back', label: 'Tekrar Aranacak', color: '#f59e0b', desc: 'Takip tarihi belirlenir' },
  { id: 'no_answer', label: 'Ulaşılamadı / Meşgul', color: '#8b5cf6', desc: 'Otomatik yarın tekrar aranacak' },
  { id: 'not_interested', label: 'İlgilenmiyor / Kayıp', color: '#ef4444', desc: 'Fırsat kaybedildi olarak işaretlenir' },
];

export default function CallOutcomeModal({ isOpen, onClose, customer, onSuccess }) {
  if (!isOpen || !customer) return null;

  const [selectedOutcome, setSelectedOutcome] = useState('interested');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await workbenchApi.logCallOutcome({
        customer_id: customer.id,
        outcome: selectedOutcome,
        notes: notes || undefined,
        next_follow_up: followUpDate || undefined,
        channel: 'call',
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
    }}>
      <div className="modal-card" style={{
        background: 'var(--bg-card, #1e293b)', color: '#f8fafc', borderRadius: '12px',
        width: '100%', maxWidth: '480px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden'
      }}>
        {/* Başlık */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(2,132,199,0.2)',
              color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FiPhone size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Görüşme Nasıl Geçti?</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>{customer.company_name}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <FiX size={20} />
          </button>
        </div>

        {/* İçerik */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {error && (
            <div style={{
              padding: '10px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444',
              borderRadius: '8px', color: '#fca5a5', fontSize: '13px', marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '10px' }}>
            Görüşme Sonucu Seçin:
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {OUTCOMES.map((o) => {
              const active = selectedOutcome === o.id;
              return (
                <div
                  key={o.id}
                  onClick={() => setSelectedOutcome(o.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: `1.5px solid ${active ? o.color : 'rgba(255,255,255,0.08)'}`,
                    background: active ? `${o.color}15` : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: active ? o.color : '#f1f5f9' }}>
                      {o.label}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      {o.desc}
                    </div>
                  </div>
                  {active && <FiCheck color={o.color} size={18} />}
                </div>
              );
            })}
          </div>

          {/* Tekrar Aranacak veya Takip Günü */}
          {(selectedOutcome === 'call_back' || selectedOutcome === 'interested' || selectedOutcome === 'offer_given') && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px' }}>
                <FiCalendar size={14} /> Sonraki Takip / Arama Tarihi (İsteğe bağlı):
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px',
                  background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', fontSize: '13px'
                }}
              />
            </div>
          )}

          {/* Not */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px' }}>
              <FiFileText size={14} /> Görüşme Notu (İsteğe bağlı):
            </label>
            <textarea
              rows={2}
              placeholder="Örn: Daily 35C16 sordu, fiyat istedi..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', fontSize: '13px', resize: 'vertical'
              }}
            />
          </div>

          {/* Butonlar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '10px 16px', borderRadius: '8px', background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', cursor: 'pointer', fontSize: '13px'
              }}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 20px', borderRadius: '8px', background: '#0284c7',
                border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px'
              }}
            >
              {submitting ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
