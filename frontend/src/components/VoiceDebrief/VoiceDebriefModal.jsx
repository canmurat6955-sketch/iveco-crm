import { useState, useEffect, useRef } from 'react';
import { salesApi, crmApi } from '../../api/client';

export default function VoiceDebriefModal({ isOpen, onClose, initialCustomerId = null, onSaved = () => {} }) {
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form fields for editing
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId || '');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleQuantity, setVehicleQuantity] = useState(1);
  const [bodyType, setBodyType] = useState('');
  const [hasTradeIn, setHasTradeIn] = useState(false);
  const [tradeInBrand, setTradeInBrand] = useState('');
  const [tradeInModel, setTradeInModel] = useState('');
  const [tradeInNotes, setTradeInNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');
  const [pipelineStage, setPipelineStage] = useState('proposal');
  const [cleanedSummary, setCleanedSummary] = useState('');

  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }
  }, []);

  useEffect(() => {
    if (initialCustomerId) {
      setSelectedCustomerId(initialCustomerId);
    }
  }, [initialCustomerId]);

  const startRecording = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg('Tarayıcınız ses tanımayı desteklemiyor. Aşağıdaki metin kutusuna yazarak da kullanabilirsiniz.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentText.trim());
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Mikrofon erişim izni verilmedi.');
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setErrorMsg('Mikrofon başlatılamadı: ' + err.message);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleParseText = async (textToParse) => {
    const text = textToParse || transcript;
    if (!text || text.trim().length < 3) {
      setErrorMsg('Lütfen konuşun veya analiz edilecek görüşme metnini yazın.');
      return;
    }

    setIsParsing(true);
    setErrorMsg(null);
    try {
      const res = await salesApi.parseVoiceDebrief(text);
      const data = res.data;
      setParsedData(data);

      setVehicleModel(data.vehicle_model || '');
      setVehicleQuantity(data.quantity || 1);
      setBodyType(data.body_type || '');
      setCleanedSummary(data.cleaned_summary || '');
      setFollowUpDate(data.follow_up_date || '');
      setFollowUpNote(data.follow_up_note || '');
      setPipelineStage(data.pipeline_stage || 'proposal');

      if (data.trade_in && data.trade_in.has_trade_in) {
        setHasTradeIn(true);
        setTradeInBrand(data.trade_in.vehicle_brand || '');
        setTradeInModel(data.trade_in.vehicle_model || '');
        setTradeInNotes(data.trade_in.notes || '');
      } else {
        setHasTradeIn(false);
      }

      if (data.detected_customer) {
        setSelectedCustomerId(data.detected_customer.id);
      } else if (data.candidate_customers && data.candidate_customers.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(data.candidate_customers[0].id);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Sesli metin ayrıştırılamadı: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsParsing(false);
    }
  };

  const searchCustomers = async (q) => {
    setCustomerSearch(q);
    if (!q || q.length < 2) {
      setCustomerSearchResults([]);
      return;
    }
    setIsSearchingCustomers(true);
    try {
      const res = await crmApi.getCustomers({ search: q, limit: 6 });
      setCustomerSearchResults(res.data.items || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingCustomers(false);
    }
  };

  const handleSaveDebrief = async () => {
    if (!selectedCustomerId) {
      setErrorMsg('Lütfen notun kaydedileceği müşteriyi seçin.');
      return;
    }
    if (!cleanedSummary) {
      setErrorMsg('Kayıt için bir özet not bulunamadı.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    try {
      const payload = {
        customer_id: parseInt(selectedCustomerId, 10),
        cleaned_summary: cleanedSummary,
        raw_text: transcript,
        vehicle_model: vehicleModel || null,
        vehicle_quantity: parseInt(vehicleQuantity, 10) || 1,
        body_type: bodyType || null,
        follow_up_date: followUpDate || null,
        follow_up_note: followUpNote || null,
        pipeline_stage: pipelineStage || null,
        trade_in: hasTradeIn ? {
          has_trade_in: true,
          vehicle_brand: tradeInBrand || 'Diğer',
          vehicle_model: tradeInModel || 'Araç',
          notes: tradeInNotes,
        } : null,
      };

      const res = await salesApi.commitVoiceDebrief(payload);
      setSuccessMsg(res.data.message || 'Sesli satış notu CRM\'e başarıyla işlendi!');
      setTimeout(() => {
        onSaved(res.data);
        onClose();
      }, 1400);
    } catch (err) {
      console.error(err);
      setErrorMsg('Kaydetme hatası: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: 'var(--bg-primary, #ffffff)', color: 'var(--text-primary, #0f172a)',
        width: '100%', maxWidth: '640px', maxHeight: '90vh', borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', border: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#ffffff', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px'
            }}>
              🎙️
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Araç İçi Sesli Satış Özeti</h3>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
                Görüşmeden sonra 15-20 saniye konuşun; not, araç, takas ve takip otomatik çıksın.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)', border: 'none', color: '#fff',
              width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {errorMsg && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', fontSize: '13px' }}>
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
              ✅ {successMsg}
            </div>
          )}

          {/* Microphone Big Record Button */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '16px', background: isRecording ? '#fef2f2' : '#f8fafc',
            borderRadius: '14px', border: isRecording ? '2px dashed #ef4444' : '1px dashed #cbd5e1'
          }}>
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                width: '74px', height: '74px', borderRadius: '50%',
                background: isRecording ? '#ef4444' : '#0284c7',
                color: '#fff', border: 'none', fontSize: '30px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isRecording ? '0 0 0 10px rgba(239, 68, 68, 0.25)' : '0 4px 12px rgba(2, 132, 199, 0.3)',
                transition: 'all 0.2s ease', transform: isRecording ? 'scale(1.08)' : 'scale(1)'
              }}
            >
              {isRecording ? '⏹️' : '🎙️'}
            </button>
            <span style={{ marginTop: '12px', fontSize: '14px', fontWeight: '600', color: isRecording ? '#ef4444' : '#475569' }}>
              {isRecording ? 'Sizi dinliyorum, konuşun... (Bitirmek için dokunun)' : 'Konuşmaya Başlamak İçin Dokunun'}
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Örnek: "Ahmet Bey ile görüştük, 2 adet Daily 72C damper için teklif istedi, eski Transit'i takasa verecek, haftaya Salı aramamı söyledi."
            </span>
          </div>

          {/* Transcript Area */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Görüşme Metni / Konuşma Dökümü:</label>
              {transcript && (
                <button
                  type="button"
                  onClick={() => handleParseText()}
                  disabled={isParsing}
                  style={{
                    background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px',
                    padding: '4px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  {isParsing ? 'Ayrıştırılıyor...' : '⚡ Yapay Zekâ ile Ayrıştır'}
                </button>
              )}
            </div>
            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Mikrofona basarak konuşun veya görüşme notunu buraya yapıştırıp 'Ayrıştır' butonuna basın..."
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical'
              }}
            />
          </div>

          {/* Extracted Fields (Editable Card) */}
          {(parsedData || selectedCustomerId) && (
            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px',
              display: 'flex', flexDirection: 'column', gap: '14px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                🧠 Ayrıştırılan Bilgiler (CRM Önizleme)
              </div>

              {/* Customer Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                  🏢 Müşteri Firma:
                </label>
                {parsedData?.candidate_customers && parsedData.candidate_customers.length > 0 && !selectedCustomerId && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                    {parsedData.candidate_customers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCustomerId(c.id)}
                        style={{
                          background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd',
                          padding: '4px 8px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer'
                        }}
                      >
                        + {c.company_name} ({c.city})
                      </button>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Müşteri ara (en az 2 harf)..."
                    value={customerSearch}
                    onChange={(e) => searchCustomers(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  {selectedCustomerId && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#15803d', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                      Seçili ID: #{selectedCustomerId}
                    </span>
                  )}
                </div>
                {customerSearchResults.length > 0 && (
                  <div style={{ marginTop: '6px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                    {customerSearchResults.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomerId(c.id);
                          setCustomerSearch(c.company_name);
                          setCustomerSearchResults([]);
                        }}
                        style={{ padding: '6px 10px', fontSize: '12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                      >
                        <strong>{c.company_name}</strong> - {c.city || 'Şehir Yok'}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vehicle & Quantity & Body */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                    🚛 İlgilenilen Araç:
                  </label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="örn: Daily 72C21"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                    Adet:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={vehicleQuantity}
                    onChange={(e) => setVehicleQuantity(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                    Kasa / Üst Yapı:
                  </label>
                  <input
                    type="text"
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value)}
                    placeholder="örn: Damper"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Trade-In Toggle */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🔄 Takas (Trade-In) Talebi Var mı?
                  </label>
                  <input
                    type="checkbox"
                    checked={hasTradeIn}
                    onChange={(e) => setHasTradeIn(e.target.checked)}
                    style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                  />
                </div>
                {hasTradeIn && (
                  <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Takas Marka (örn: Ford)"
                      value={tradeInBrand}
                      onChange={(e) => setTradeInBrand(e.target.value)}
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                    <input
                      type="text"
                      placeholder="Takas Model (örn: Transit 350L)"
                      value={tradeInModel}
                      onChange={(e) => setTradeInModel(e.target.value)}
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>
                )}
              </div>

              {/* Follow-up Date & Pipeline */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                    📅 Takip Tarihi:
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                    📊 Pipeline Aşaması:
                  </label>
                  <select
                    value={pipelineStage}
                    onChange={(e) => setPipelineStage(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="lead">Yeni Lead / Aday</option>
                    <option value="proposal">Teklif Hazırlanacak</option>
                    <option value="negotiation">Pazarlık / Karar Aşamasında</option>
                    <option value="won">Satış Tamamlandı (Kazanıldı)</option>
                    <option value="lost">Kaybedildi / Vazgeçti</option>
                  </select>
                </div>
              </div>

              {/* Cleaned Summary Note */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                  📝 CRM Aktivite & Ziyaret Notu:
                </label>
                <textarea
                  rows={2}
                  value={cleanedSummary}
                  onChange={(e) => setCleanedSummary(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '14px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'flex-end', gap: '10px'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px', background: '#fff', border: '1px solid #cbd5e1',
              borderRadius: '8px', color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '13px'
            }}
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSaveDebrief}
            disabled={isSaving || !selectedCustomerId}
            style={{
              padding: '8px 20px', background: !selectedCustomerId ? '#94a3b8' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: !selectedCustomerId ? 'not-allowed' : 'pointer',
              fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
            }}
          >
            {isSaving ? 'Kaydediliyor...' : '💾 CRM\'e İşle & Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
