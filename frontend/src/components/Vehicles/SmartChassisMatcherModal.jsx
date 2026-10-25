import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FiX, FiTruck, FiCheckCircle, FiAlertCircle, FiDownload, 
  FiMessageSquare, FiFileText, FiRefreshCw, FiLayers, FiMaximize2, FiMinimize2, FiCopy, FiEye
} from 'react-icons/fi';
import { vehiclesApi } from '../../api/client';
import { openWhatsApp } from '../../utils/whatsapp';
import toast from 'react-hot-toast';

const QUICK_PAYLOADS = [
  { label: '1.5 Ton (B Ehliyet)', kg: 1500 },
  { label: '3.5 Ton', kg: 3500 },
  { label: '4.8 Ton (Daily 72C)', kg: 4800 },
  { label: '6.5 Ton (Eurocargo 100E)', kg: 6500 },
  { label: '8.0 Ton (Eurocargo 120E)', kg: 8000 },
  { label: '10.5 Ton (Eurocargo 150E)', kg: 10500 },
  { label: '11.0 Ton (Eurocargo 160)', kg: 11000 },
  { label: '25 Ton (S-Way Tır)', kg: 25000 },
];

const BODY_TYPES = [
  { id: 'kapali_kutu', label: 'Kapalı Kutu / Kargo', tare: '650 kg' },
  { id: 'frigo', label: 'Frigorifik Soğutuculu (+Ünite)', tare: '1.100 kg' },
  { id: 'acik_sac', label: 'Açık Sac / İlave Kapak', tare: '500 kg' },
  { id: 'kayar_perde', label: 'Kayar Perde / Tente', tare: '750 kg' },
  { id: 'damper', label: 'Damper Kasa', tare: '1.700 kg' },
  { id: 'oto_kurtarma', label: 'Kayar Kasa Kurtarıcı', tare: '1.200 kg' },
];

export default function SmartChassisMatcherModal({ isOpen, onClose, initialPayload = 4500, initialVolume = 25, customer = null }) {
  const [payloadKg, setPayloadKg] = useState(initialPayload);
  const [volumeM3, setVolumeM3] = useState(initialVolume);
  const [bodyType, setBodyType] = useState('kapali_kutu');
  const [licensePref, setLicensePref] = useState('ANY'); // 'B', 'C', 'ANY'

  // Opsiyonel Kasa Ölçüleri
  const [useExactDims, setUseExactDims] = useState(false);
  const [lengthCm, setLengthCm] = useState(540);
  const [widthCm, setWidthCm] = useState(225);
  const [heightCm, setHeightCm] = useState(220);

  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      runMatch();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, payloadKg, volumeM3, bodyType, licensePref, useExactDims, lengthCm, widthCm, heightCm]);

  // ESC ile kapat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const runMatch = async () => {
    try {
      setLoading(true);
      const payload = {
        payload_kg: Number(payloadKg),
        volume_m3: useExactDims ? undefined : Number(volumeM3),
        body_length_cm: useExactDims ? Number(lengthCm) : undefined,
        body_width_cm: useExactDims ? Number(widthCm) : undefined,
        body_height_cm: useExactDims ? Number(heightCm) : undefined,
        body_type: bodyType,
        license_preference: licensePref === 'ANY' ? undefined : licensePref
      };
      const res = await vehiclesApi.matchChassis(payload);
      setMatchResult(res.data);
    } catch (err) {
      console.error('Match error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const rec = matchResult?.recommendation;
  const dims = rec?.dimensions;
  const scale = rec?.scale_analysis;

  const getCustomerShareUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://iveco-crm.vercel.app';
    const cleanPhone = customer?.phone ? customer.phone.replace(/\D/g, '') : '';
    const compName = customer?.company_name || '';
    const cid = customer?.id || '';
    const params = new URLSearchParams();
    if (cid) params.set('cid', cid);
    if (compName) params.set('company', compName);
    if (cleanPhone) params.set('phone', cleanPhone);
    params.set('payload', payloadKg);
    params.set('body', bodyType);
    params.set('ref', 'canmurat_crm_matcher');
    return `${origin}/arac-secici?${params.toString()}`;
  };

  const handleSendWhatsApp = () => {
    const phone = customer?.phone || '';
    let text = rec?.whatsapp_proposal || '';
    const shareUrl = getCustomerShareUrl();
    if (text) {
      text += `\n\n🔗 *Özel Konfigüratörünüzü Buradan İnceleyebilirsiniz:*\n${shareUrl}`;
    }
    openWhatsApp(phone, text, { customer });
  };

  const handleCopyCustomerLink = async () => {
    const shareUrl = getCustomerShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(
        customer?.company_name 
          ? `${customer.company_name} için özel bağlantı kopyalandı! 📋`
          : 'Konfigürasyon bağlantısı kopyalandı! 📋'
      );
    } catch {
      toast.error('Bağlantı kopyalanamadı.');
    }
  };

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 11, 24, 0.82)',
        backdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'linear-gradient(180deg, #0d1a30 0%, #080f1d 100%)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: 18,
          width: '100%',
          maxWidth: 960,
          maxHeight: '94vh',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.8), 0 0 30px rgba(2, 132, 199, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: '#f8fafc',
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f2b54 0%, #07152b 100%)',
          padding: '16px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(2, 132, 199, 0.6)'
            }}>
              <FiTruck size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                  Akıllı Şasi, Kasa & Kantar Hesaplama Motoru
                </h2>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.18)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: '0.68rem',
                  fontWeight: 800
                }}>
                  TEKNİK FÖY DESTEKLİ
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                Müşterinin istediği net yük (kg) ve m³ hacme göre otomatik araç, şasi ve kasa ataması yapar.
                {customer?.company_name && <strong style={{ color: '#38bdf8', marginLeft: 6 }}>· Müşteri: {customer.company_name}</strong>}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#cbd5e1',
              borderRadius: 8,
              cursor: 'pointer',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modal Gövdesi: 2 Sütunlu Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 16,
          padding: '20px 22px',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* SOL SÜTUN: Girdiler & Parametreler */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 1. Taşınacak Net Yük Ağırlığı */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 14,
              padding: '14px 16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
                  1. TAŞINACAK NET YÜK AĞIRLIĞI
                </label>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8' }}>
                  {(payloadKg / 1000).toFixed(1)} Ton ({payloadKg.toLocaleString('tr-TR')} kg)
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="500"
                max="25000"
                step="250"
                value={payloadKg}
                onChange={e => setPayloadKg(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0284c7', marginBottom: 12 }}
              />

              {/* Hızlı Çipler */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {QUICK_PAYLOADS.map(qp => (
                  <button
                    key={qp.kg}
                    type="button"
                    onClick={() => setPayloadKg(qp.kg)}
                    style={{
                      background: payloadKg === qp.kg ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
                      color: payloadKg === qp.kg ? '#fff' : '#94a3b8',
                      border: '1px solid',
                      borderColor: payloadKg === qp.kg ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 12,
                      padding: '3px 9px',
                      fontSize: '0.72rem',
                      fontWeight: payloadKg === qp.kg ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Kasa Hacmi (m³) veya Serbest Ölçü */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 14,
              padding: '14px 16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
                  2. TALEP EDİLEN KASA HACMİ VEYA ÖLÇÜLERİ
                </label>
                <button
                  type="button"
                  onClick={() => setUseExactDims(!useExactDims)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#38bdf8',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {useExactDims ? 'm³ Sürgüsüne Geç' : 'Özel cm Ölçüsü Gir'}
                </button>
              </div>

              {!useExactDims ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>İstenen Kasa Hacmi:</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>{volumeM3} m³</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="65"
                    step="1"
                    value={volumeM3}
                    onChange={e => setVolumeM3(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#10b981', marginBottom: 8 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b' }}>
                    <span>12 m³ (Şehir içi)</span>
                    <span>25 m³ (Standart Kargo)</span>
                    <span>45 m³ (Dev Hacim)</span>
                    <span>65 m³ (160E)</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Boy (cm)</label>
                    <input
                      type="number"
                      value={lengthCm}
                      onChange={e => setLengthCm(Number(e.target.value))}
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 8,
                        padding: '6px 8px',
                        color: '#fff',
                        fontSize: '0.82rem',
                        fontWeight: 700
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>En (cm)</label>
                    <input
                      type="number"
                      value={widthCm}
                      onChange={e => setWidthCm(Number(e.target.value))}
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 8,
                        padding: '6px 8px',
                        color: '#fff',
                        fontSize: '0.82rem',
                        fontWeight: 700
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Yükseklik (cm)</label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={e => setHeightCm(Number(e.target.value))}
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 8,
                        padding: '6px 8px',
                        color: '#fff',
                        fontSize: '0.82rem',
                        fontWeight: 700
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Kasa Tipi ve Ehliyet Kısıtı */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 14,
              padding: '14px 16px'
            }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', display: 'block', marginBottom: 8 }}>
                3. KASA TİPİ & DARA AĞIRLIĞI
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
                {BODY_TYPES.map(bt => (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => setBodyType(bt.id)}
                    style={{
                      background: bodyType === bt.id ? 'rgba(2, 132, 199, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid',
                      borderColor: bodyType === bt.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      color: bodyType === bt.id ? '#fff' : '#94a3b8',
                      fontSize: '0.74rem',
                      fontWeight: bodyType === bt.id ? 700 : 500,
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div>{bt.label}</div>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Kasa Darası: ~{bt.tare}</span>
                  </button>
                ))}
              </div>

              {/* Ehliyet Tercihi */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Ehliyet Kısıtı:</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[
                    { id: 'ANY', label: 'Fark Etmez' },
                    { id: 'B', label: 'B Sınıfı (3.5 Ton)' },
                    { id: 'C', label: 'C Kamyon' },
                  ].map(lp => (
                    <button
                      key={lp.id}
                      type="button"
                      onClick={() => setLicensePref(lp.id)}
                      style={{
                        background: licensePref === lp.id ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
                        color: licensePref === lp.id ? '#fff' : '#94a3b8',
                        border: '1px solid',
                        borderColor: licensePref === lp.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                        borderRadius: 12,
                        padding: '3px 10px',
                        fontSize: '0.72rem',
                        fontWeight: licensePref === lp.id ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {lp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SAĞ SÜTUN: Sistem Ataması, Önerilen Kasa Boyutları, Kantar Karnesi & Föy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {rec ? (
              <>
                {/* 🎯 ÖNERİLEN MODEL & ŞASİ KARTI */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(15, 23, 42, 0.8) 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.45)',
                  borderRadius: 16,
                  padding: '16px 20px',
                  boxShadow: '0 8px 30px rgba(2, 132, 199, 0.15)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        OTOMATİK SİSTEM ATAMASI:
                      </span>
                      <h3 style={{ margin: '2px 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                        IVECO {rec.series} — {rec.wheelbase} mm Şasi
                      </h3>
                      <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                        {rec.model_code} · {rec.cabin_type} · {rec.license_required}
                      </p>
                    </div>

                    <span style={{
                      background: 'rgba(2, 132, 199, 0.25)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.5)',
                      padding: '4px 10px',
                      borderRadius: 14,
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}>
                      {rec.badge}
                    </span>
                  </div>

                  {/* Önerilen Kasa Ölçüleri Grid */}
                  <div style={{
                    background: 'rgba(10, 18, 36, 0.75)',
                    borderRadius: 12,
                    padding: '12px 14px',
                    margin: '12px 0',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>
                      📐 ŞASİYE UYGUN DIŞTAN KASA ÖLÇÜLERİ:
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' }}>
                      <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 8, padding: '6px 4px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>KASA BOYU</span>
                        <strong style={{ fontSize: '0.88rem', color: '#38bdf8' }}>{dims.length_cm} cm</strong>
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 8, padding: '6px 4px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>KASA ENİ</span>
                        <strong style={{ fontSize: '0.88rem', color: '#38bdf8' }}>{dims.width_cm} cm</strong>
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 8, padding: '6px 4px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>YÜKSEKLİK</span>
                        <strong style={{ fontSize: '0.88rem', color: '#38bdf8' }}>{dims.height_cm} cm</strong>
                      </div>
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, padding: '6px 4px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        <span style={{ fontSize: '0.65rem', color: '#10b981', display: 'block' }}>NET HACİM</span>
                        <strong style={{ fontSize: '0.88rem', color: '#10b981' }}>{dims.volume_m3} m³</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: '0.72rem', color: '#94a3b8' }}>
                      <span>Sığan Euro Palet: <strong style={{ color: '#f8fafc' }}>~{dims.pallet_capacity} Adet (80x120 cm)</strong></span>
                      <span>İzin Verilen Boy Aralığı: <strong style={{ color: '#38bdf8' }}>{dims.allowed_length_range}</strong></span>
                    </div>
                  </div>

                  {/* ⚖️ KANTAR KARNESİ & AĞIRLIK ANALİZİ */}
                  <div style={{
                    background: scale.status === 'safe' 
                      ? 'rgba(16, 185, 129, 0.1)' 
                      : scale.status === 'exempt'
                      ? 'rgba(56, 189, 248, 0.1)'
                      : 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid',
                    borderColor: scale.status === 'safe' 
                      ? 'rgba(16, 185, 129, 0.4)' 
                      : scale.status === 'exempt'
                      ? 'rgba(56, 189, 248, 0.4)'
                      : 'rgba(239, 68, 68, 0.4)',
                    borderRadius: 12,
                    padding: '12px 14px',
                    marginBottom: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      {scale.status === 'safe' ? (
                        <FiCheckCircle size={18} style={{ color: '#10b981' }} />
                      ) : scale.status === 'exempt' ? (
                        <FiCheckCircle size={18} style={{ color: '#38bdf8' }} />
                      ) : (
                        <FiAlertCircle size={18} style={{ color: '#ef4444' }} />
                      )}
                      <strong style={{ fontSize: '0.84rem', color: scale.status === 'overload' ? '#ef4444' : '#fff' }}>
                        {scale.title}
                      </strong>
                    </div>

                    <p style={{ margin: '0 0 10px', fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                      {scale.description}
                    </p>

                    {/* Ağırlık Detay Tablosu */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 6,
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: 8,
                      padding: '8px 10px',
                      fontSize: '0.7rem'
                    }}>
                      <div>
                        <span style={{ color: '#64748b', display: 'block' }}>Araç Boş (Şoför+Yakıt):</span>
                        <strong style={{ color: '#f8fafc' }}>{scale.unladen_weight_kg} kg</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block' }}>Kasa Darası:</span>
                        <strong style={{ color: '#f8fafc' }}>+{scale.estimated_body_tare_kg} kg</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block' }}>Yük Ağırlığı:</span>
                        <strong style={{ color: '#38bdf8' }}>+{scale.payload_kg} kg</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block' }}>Kantar Sınırı:</span>
                        <strong style={{ color: '#10b981' }}>{scale.scale_limit_kg} kg</strong>
                      </div>
                    </div>
                  </div>

                  {/* AKSİYON BUTONLARI: PDF Föy & WhatsApp */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {/* PDF Teknik Föy İndir / İncele */}
                    <a
                      href={rec.tech_sheet_pdf}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        flex: '1 1 180px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 10,
                        padding: '10px 14px',
                        color: '#fff',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        textDecoration: 'none',
                        transition: 'background 0.15s ease'
                      }}
                      title="Teknik föy PDF dosyasını aç"
                    >
                      <FiDownload size={15} style={{ color: '#38bdf8' }} />
                      <span>Teknik Föyü İndir (PDF)</span>
                    </a>

                    {/* WhatsApp Teklif Gönder */}
                    <button
                      type="button"
                      onClick={handleSendWhatsApp}
                      style={{
                        flex: '1 1 180px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        borderRadius: 10,
                        padding: '10px 14px',
                        color: '#fff',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                      }}
                      title="Müşteriye WhatsApp teklif taslağı ve özel konfigürasyon linkini gönder"
                    >
                      <FiMessageSquare size={15} />
                      <span>WhatsApp'tan Paylaş</span>
                    </button>

                    {/* Müşteriye Özel Link Kopyala */}
                    <button
                      type="button"
                      onClick={handleCopyCustomerLink}
                      style={{
                        background: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        borderRadius: 10,
                        padding: '10px 14px',
                        color: '#38bdf8',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        cursor: 'pointer'
                      }}
                      title="Müşteriye özel hesaplayıcı linkini panoya kopyala"
                    >
                      <FiCopy size={15} />
                      <span>Linki Kopyala</span>
                    </button>

                    {/* Müşteri Gözünden Önizle */}
                    <button
                      type="button"
                      onClick={() => window.open(getCustomerShareUrl() + '&preview=true', '_blank')}
                      style={{
                        background: 'rgba(217, 119, 6, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.45)',
                        borderRadius: 10,
                        padding: '10px 14px',
                        color: '#fbbf24',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        cursor: 'pointer'
                      }}
                      title="Müşteriye göndermeden önce bu ekranı yeni sekmede canlı test et"
                    >
                      <FiEye size={15} />
                      <span>Müşteri Gözünden Önizle</span>
                    </button>
                  </div>
                </div>

                {/* 🔄 ALTERNATİF MODEL SEÇENEKLERİ */}
                {matchResult.alternatives?.length > 0 && (
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 14,
                    padding: '12px 16px'
                  }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>
                      DİĞER UYGUN ALTERNATİF ŞASİLER:
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {matchResult.alternatives.map(alt => (
                        <div
                          key={alt.id}
                          style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: 8,
                            padding: '8px 12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.75rem'
                          }}
                        >
                          <div>
                            <strong style={{ color: '#f8fafc' }}>IVECO {alt.series} ({alt.wheelbase} mm)</strong>
                            <span style={{ color: '#64748b', marginLeft: 8 }}>Kasa: {alt.body_length_range} ({alt.volume_range})</span>
                          </div>
                          <a
                            href={alt.tech_sheet_pdf}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <FiFileText size={12} /> Föy
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                <FiRefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px', color: '#0284c7' }} />
                <p>En uygun araç ve şasi eşleştiriliyor...</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: 'rgba(5, 11, 24, 0.95)',
          padding: '12px 22px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.72rem',
          color: '#64748b'
        }}>
          <span>⚡ IVECO ERC Otomotiv — Satış Mühendisliği & Şasi Atama Sistemi</span>
          <span>Boş ağırlıklar şoför ve yakıt dahil resmi teknik föy verileridir.</span>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
