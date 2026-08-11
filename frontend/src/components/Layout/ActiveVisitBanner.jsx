import { useState, useEffect } from 'react';
import { useVisit } from '../../contexts/VisitContext';
import { FiMapPin, FiCheckSquare, FiClock, FiX, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ActiveVisitBanner() {
  const { activeVisit, endVisit } = useVisit();
  const [duration, setDuration] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  
  // Ziyaret sonlandırma formu
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('Görüşüldü');
  const [nextAction, setNextAction] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [saving, setSaving] = useState(false);

  // Ziyaret süresini her dakika güncelle
  useEffect(() => {
    if (!activeVisit) return;
    
    const calculateDuration = () => {
      const start = new Date(activeVisit.started_at);
      const diffMs = new Date() - start;
      setDuration(Math.floor(diffMs / 60000)); // Dakika
    };

    calculateDuration();
    const interval = setInterval(calculateDuration, 60000);
    return () => clearInterval(interval);
  }, [activeVisit]);

  if (!activeVisit) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      toast.error("Lütfen görüşme notlarını girin.");
      return;
    }
    
    setSaving(true);
    const success = await endVisit(notes, outcome, nextAction, nextFollowUpDate);
    setSaving(false);
    
    if (success) {
      setShowEndModal(false);
      // Formu sıfırla
      setNotes('');
      setOutcome('Görüşüldü');
      setNextAction('');
      setNextFollowUpDate('');
    }
  };

  return (
    <>
      <div className="active-visit-banner animate-in">
        <div className="active-visit-info">
          <div className="visit-pulse-dot" />
          <FiMapPin size={16} color="var(--accent-green)" />
          <span className="visit-title">Devam Eden Ziyaret:</span>
          <strong className="visit-company">{activeVisit.company_name}</strong>
          <span className="visit-timer">
            <FiClock size={12} /> {duration} dk
          </span>
        </div>
        <button className="btn btn-success btn-sm finish-visit-btn" onClick={() => setShowEndModal(true)}>
          <FiCheckSquare size={14} /> Ziyareti Bitir
        </button>
      </div>

      {showEndModal && (
        <div className="modal-overlay" onClick={() => setShowEndModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, width: '90vw' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 className="modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                📍 Ziyaret Raporu: {activeVisit.company_name}
              </h3>
              <button onClick={() => setShowEndModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Ziyaret Notları / Görüşme Özeti *</label>
                <textarea 
                  className="form-textarea" 
                  rows={4} 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Görüşülen kişiler, araç ihtiyaçları, filo durumu vb. detayları yazın..." 
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Ziyaret Sonucu</label>
                  <select className="form-select" value={outcome} onChange={e => setOutcome(e.target.value)}>
                    <option value="Görüşüldü">🎯 Sadece Görüşüldü / Tanışma</option>
                    <option value="Teklif Verildi">📋 Teklif Sunuldu</option>
                    <option value="Satışa Yakın">🔥 Sıcak Fırsat / Pazarlık</option>
                    <option value="Satış Gerçekleşti">✅ Satış Gerçekleşti</option>
                    <option value="Olumsuz">❌ İlgilenmiyor / Olumsuz</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Bir Sonraki Adım / Aksiyon</label>
                  <input 
                    className="form-input" 
                    value={nextAction} 
                    onChange={e => setNextAction(e.target.value)} 
                    placeholder="Örn: 2 gün sonra katalog gönderilecek" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sonraki Takip Tarihi</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={nextFollowUpDate} 
                    onChange={e => setNextFollowUpDate(e.target.value)} 
                  />
                </div>
              </div>

              <div className="modal-actions mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEndModal(false)}>İptal</button>
                <button type="submit" className="btn btn-success" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <FiSave size={14} /> {saving ? 'Kaydediliyor...' : 'Ziyareti Tamamla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
