import React, { useState, useMemo } from 'react';
import {
  DEFAULT_PARTNER_PROTOCOLS,
  getSavedCustomPartners,
  saveCustomPartner,
  deleteCustomPartner,
  buildPartnerShareUrl,
  buildPartnerAnnouncementText
} from '../../data/partnerProtocols';
import { getPublicOrigin } from '../../utils/publicUrl';
import { openWhatsAppChat } from '../../utils/openExternal';
import { FiCopy, FiExternalLink, FiPlus, FiCheck, FiSend, FiTag, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SECTOR_OPTIONS = [
  { id: 'all', label: '🏢 Tüm 2026 Modeller' },
  { id: 'insaat_malzeme', label: '🏗️ İnşaat, Nalbur & Müteahhitlik' },
  { id: 'tarim_yem', label: '🌾 Tarım, Arıcılık & Yem' },
  { id: 'kargo_dagitim', label: '🚛 Nakliye, Kargo & Dağıtım' },
  { id: 'gida_frigo', label: '❄️ Gıda & Soğuk Zincir' },
  { id: 'hafriyat_santiye', label: '🚜 Hafriyat & Şantiye' },
  { id: 'oto_kurtarma', label: '🛞 Oto Kurtarma & Yol Yardım' },
  { id: 'agir_nakliye', label: '🛣️ Uzun Yol & Uluslararası Tır' }
];

const QUICK_TL_DISCOUNTS = [25000, 40000, 50000, 75000, 100000];
const QUICK_PCT_DISCOUNTS = [1.5, 2, 3, 4, 5];

export default function PartnerLinkGeneratorCard({ isMobile = false }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [customPartners, setCustomPartners] = useState(() => getSavedCustomPartners());
  const allPresets = useMemo(() => [...DEFAULT_PARTNER_PROTOCOLS, ...customPartners], [customPartners]);

  const [selectedId, setSelectedId] = useState('simder');
  const [shortName, setShortName] = useState(DEFAULT_PARTNER_PROTOCOLS[0].shortName);
  const [fullName, setFullName] = useState(DEFAULT_PARTNER_PROTOCOLS[0].fullName);
  const [logoUrl, setLogoUrl] = useState(DEFAULT_PARTNER_PROTOCOLS[0].logoUrl);
  const [icon, setIcon] = useState(DEFAULT_PARTNER_PROTOCOLS[0].icon);
  const [discountType, setDiscountType] = useState(DEFAULT_PARTNER_PROTOCOLS[0].discountType);
  const [discountValue, setDiscountValue] = useState(DEFAULT_PARTNER_PROTOCOLS[0].discountValue);
  const [defaultSector, setDefaultSector] = useState(DEFAULT_PARTNER_PROTOCOLS[0].defaultSector);
  const [extraPerk, setExtraPerk] = useState(DEFAULT_PARTNER_PROTOCOLS[0].extraPerk);
  const [targetPhone, setTargetPhone] = useState('');

  const handleSelectPreset = (preset) => {
    setSelectedId(preset.id);
    setShortName(preset.shortName);
    setFullName(preset.fullName);
    setLogoUrl(preset.logoUrl || '');
    setIcon(preset.icon || '🏛️');
    setDiscountType(preset.discountType || 'amount');
    setDiscountValue(preset.discountValue ?? 50000);
    setDefaultSector(preset.defaultSector || 'all');
    setExtraPerk(preset.extraPerk || '');
  };

  const handleStartNewCustom = () => {
    setSelectedId('custom');
    setShortName('Arıcılar Birliği');
    setFullName('Samsun İli Arıcılar Birliği Üyeleri');
    setLogoUrl('');
    setIcon('🐝');
    setDiscountType('amount');
    setDiscountValue(50000);
    setDefaultSector('tarim_yem');
    setExtraPerk('Birlik Üyelerine Özel Araç Başı 50.000 ₺ Protokol İndirimi + 1M TL %0 Faiz Avantajı');
    toast.success('Yeni dernek/birlik şablonu açıldı — adını ve indirim tutarını aşağıdan dilediğin gibi değiştirebilirsin!');
  };

  const currentConfig = useMemo(() => ({
    id: selectedId,
    shortName: shortName.trim() || 'Özel Protokol',
    fullName: fullName.trim() || shortName.trim() || 'Kurumsal Üye Protokolü',
    logoUrl,
    icon: icon || '🏛️',
    discountType,
    discountValue: Number(discountValue) || 0,
    defaultSector,
    extraPerk: extraPerk.trim()
  }), [selectedId, shortName, fullName, logoUrl, icon, discountType, discountValue, defaultSector, extraPerk]);

  const origin = getPublicOrigin();
  const generatedLink = useMemo(() => buildPartnerShareUrl(origin, currentConfig), [origin, currentConfig]);
  const generatedAnnouncement = useMemo(() => buildPartnerAnnouncementText(origin, currentConfig), [origin, currentConfig]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast.success(`🔗 ${currentConfig.shortName} indirimli takip linki kopyalandı!`);
  };

  const handleCopyAnnouncement = () => {
    navigator.clipboard.writeText(generatedAnnouncement);
    toast.success(`📋 ${currentConfig.shortName} hazır WhatsApp grup duyuru metni ve linki kopyalandı!`);
  };

  const handleSaveAsPreset = () => {
    if (!shortName.trim()) {
      toast.error('Lütfen dernek veya birlik kısa adını yazın.');
      return;
    }
    const updated = saveCustomPartner(currentConfig);
    setCustomPartners(updated);
    if (updated.length > 0) {
      setSelectedId(updated[0].id);
    }
    toast.success(`💾 "${shortName}" hızlı dernek/birlik listene kaydedildi!`);
  };

  const handleDeleteCustom = (e, id) => {
    e.stopPropagation();
    const updated = deleteCustomPartner(id);
    setCustomPartners(updated);
    if (selectedId === id) {
      handleSelectPreset(DEFAULT_PARTNER_PROTOCOLS[0]);
    }
    toast.success('Özel protokol şablonu kaldırıldı.');
  };

  const handleSendToPhone = () => {
    const clean = targetPhone.replace(/\D/g, '');
    if (clean.length < 10) {
      toast.error('Doğrudan göndermek için geçerli bir telefon numarası yazın veya "Duyuru Metnini Kopyala" butonunu kullanın.');
      return;
    }
    openWhatsAppChat(clean, generatedAnnouncement);
    toast.success(`💬 WhatsApp açılıyor...`);
  };

  return (
    <div
      className="card glass-card mt-6"
      style={{
        border: '1.5px solid rgba(245, 158, 11, 0.45)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.94) 100%)',
        boxShadow: '0 10px 30px rgba(245, 158, 11, 0.12)',
        padding: isMobile ? '14px' : '18px 20px'
      }}
    >
      {/* Üst Başlık */}
      <div
        onClick={() => setIsExpanded(prev => !prev)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {currentConfig.id === 'simder' || currentConfig.logoUrl ? (
            <div style={{
              background: '#ffffff',
              padding: '4px 10px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              height: '36px'
            }}>
              <img
                src={currentConfig.logoUrl || '/partners/simder-logo.png'}
                alt={currentConfig.shortName}
                style={{ height: '26px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
          ) : (
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem'
            }}>
              {currentConfig.icon || '🏛️'}
            </div>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: isMobile ? '0.94rem' : '1.04rem', fontWeight: 900, color: '#f8fafc' }}>
                🏛️ Dernek, Oda & Birlik Özel İndirimli Link Üretici
              </h3>
              <span style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.45)',
                color: '#34d399',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '999px'
              }}>
                SİMDER • Arıcılar Birliği • Özel Oranlı Kampanya
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
              Dernek veya oda seç, araç başı TL indirimini (örn. 50.000 ₺) veya % iskontoyu belirle; tüm katalog fiyatları otomatik düşülmüş özel link üret!
            </div>
          </div>
        </div>

        <button
          type="button"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.14)',
            color: '#cbd5e1',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '0.74rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer'
          }}
        >
          {isExpanded ? <><FiChevronUp size={14} /> Daralt</> : <><FiChevronDown size={14} /> Link Üreticiyi Aç</>}
        </button>
      </div>

      {isExpanded && (
        <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 1. Hazır Dernek / Oda Seçimi */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '7px' }}>
              1. Hazır Dernek / Oda Protokolü Seç veya Yeni Oluştur:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {allPresets.map(p => {
                const active = selectedId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '999px',
                      background: active
                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                        : 'rgba(15, 23, 42, 0.85)',
                      border: active ? '1.5px solid #fde047' : '1px solid rgba(148, 163, 184, 0.25)',
                      color: active ? '#0f172a' : '#e2e8f0',
                      fontWeight: active ? 900 : 700,
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{p.icon || '🏛️'}</span>
                    <span>{p.shortName}</span>
                    <span style={{
                      fontSize: '0.66rem',
                      padding: '1px 5px',
                      borderRadius: '6px',
                      background: active ? 'rgba(15,23,42,0.2)' : 'rgba(16, 185, 129, 0.18)',
                      color: active ? '#0f172a' : '#34d399',
                      fontWeight: 800
                    }}>
                      {p.discountType === 'percent' ? `%${p.discountValue}` : `-${(p.discountValue / 1000)}B ₺`}
                    </span>
                    {p.isCustom && (
                      <span
                        onClick={(e) => handleDeleteCustom(e, p.id)}
                        title="Bu şablonu sil"
                        style={{ marginLeft: '2px', opacity: 0.75, display: 'inline-flex', alignItems: 'center' }}
                      >
                        <FiTrash2 size={11} />
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleStartNewCustom}
                style={{
                  padding: '7px 12px',
                  borderRadius: '999px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px dashed #38bdf8',
                  color: '#38bdf8',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <FiPlus size={13} /> Yeni Dernek / Birlik Yaz
              </button>
            </div>
          </div>

          {/* 2. Dernek Adı, İndirim Tutarı / Oranı ve Sektör Ayarları */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1.4fr 1fr',
            gap: '12px',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '12px'
          }}>
            {/* Sol: Dernek / Birlik Adı */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                  Dernek / Birlik Kısa Adı (Rozette Görünür):
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="🏛️"
                    style={{
                      width: '42px',
                      textAlign: 'center',
                      padding: '8px 4px',
                      borderRadius: '8px',
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(148, 163, 184, 0.3)',
                      color: '#fff',
                      fontSize: '0.95rem'
                    }}
                    title="Emoji / Simge"
                  />
                  <input
                    type="text"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="Örn: SİMDER veya Arıcılar Birliği"
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      color: '#fff',
                      fontSize: '0.82rem',
                      fontWeight: 800
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                  Tam Kurum Başlığı (Sayfa Üstünde Yazar):
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Örn: SİMDER (Samsun İnşaatçılar ve Müteahhitler Derneği)"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'rgba(2, 6, 23, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    color: '#e2e8f0',
                    fontSize: '0.78rem'
                  }}
                />
              </div>
            </div>

            {/* Orta: Araç Başına TL İndirim veya % Oran Seçici */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fbbf24' }}>
                  <FiTag style={{ marginRight: '4px' }} /> Uygulanacak Özel Üye İndirimi:
                </label>
                <div style={{ display: 'flex', gap: '4px', background: 'rgba(2,6,23,0.8)', padding: '2px', borderRadius: '7px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountType('amount');
                      if (discountValue < 100) setDiscountValue(50000);
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '5px',
                      border: 'none',
                      background: discountType === 'amount' ? '#10b981' : 'transparent',
                      color: discountType === 'amount' ? '#052e16' : '#94a3b8',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    ₺ Sabit Tutar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountType('percent');
                      if (discountValue > 20) setDiscountValue(3);
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '5px',
                      border: 'none',
                      background: discountType === 'percent' ? '#f59e0b' : 'transparent',
                      color: discountType === 'percent' ? '#0f172a' : '#94a3b8',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    % Oranlı
                  </button>
                </div>
              </div>

              {/* Hızlı Tutar / Oran Butonları */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {(discountType === 'amount' ? QUICK_TL_DISCOUNTS : QUICK_PCT_DISCOUNTS).map(val => {
                  const isSel = Number(discountValue) === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDiscountValue(val)}
                      style={{
                        padding: '5px 8px',
                        borderRadius: '6px',
                        background: isSel ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.05)',
                        border: isSel ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                        color: isSel ? '#4ade80' : '#cbd5e1',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {discountType === 'amount' ? `${(val / 1000)} Bin ₺` : `%${val}`}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  step={discountType === 'amount' ? 5000 : 0.5}
                  min={0}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'rgba(2, 6, 23, 0.9)',
                    border: '1.5px solid rgba(16, 185, 129, 0.5)',
                    color: '#4ade80',
                    fontSize: '0.92rem',
                    fontWeight: 900
                  }}
                />
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                  {discountType === 'amount' ? '₺ / Araç Başı' : '% İskonto'}
                </span>
              </div>
            </div>

            {/* Sağ: Öne Çıkarılacak Sektör & Kaydet */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                  Açılışta Öne Çıkarılacak Araç Grubu:
                </label>
                <select
                  value={defaultSector}
                  onChange={(e) => setDefaultSector(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'rgba(2, 6, 23, 0.85)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    color: '#f8fafc',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}
                >
                  {SECTOR_OPTIONS.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleSaveAsPreset}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.14)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <FiCheck size={14} /> Bu Dernek/Birliği Hızlı Listeme Kaydet
              </button>
            </div>
          </div>

          {/* 3. Üretilen Özel Link & Tek Tıkla Paylaşım Aksiyonları */}
          <div style={{
            background: 'rgba(2, 6, 23, 0.78)',
            border: '1px solid rgba(16, 185, 129, 0.38)',
            borderRadius: '12px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc' }}>
                🎯 <span style={{ color: '#fbbf24' }}>{currentConfig.shortName}</span> İçin Üretilen Canlı İndirimli Link ({currentConfig.discountType === 'percent' ? `%${currentConfig.discountValue} İskontolu` : `Araç Başı -${Number(currentConfig.discountValue).toLocaleString('tr-TR')} ₺ İndirimli`}):
              </div>
              <a
                href={generatedLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.73rem',
                  fontWeight: 800,
                  color: '#38bdf8',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                👁️ İndirimli Sayfayı Yeni Sekmede Gör <FiExternalLink size={12} />
              </a>
            </div>

            <div style={{
              padding: '8px 10px',
              borderRadius: '8px',
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: '#38bdf8',
              fontFamily: 'monospace',
              fontSize: '0.72rem',
              wordBreak: 'break-all'
            }}>
              {generatedLink}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.3fr 1.2fr', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  padding: '10px 12px',
                  borderRadius: '9px',
                  background: 'rgba(56, 189, 248, 0.18)',
                  border: '1px solid rgba(56, 189, 248, 0.45)',
                  color: '#38bdf8',
                  fontWeight: 800,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <FiCopy size={14} /> 🔗 Sadece İndirimli Linki Kopyala
              </button>

              <button
                type="button"
                onClick={handleCopyAnnouncement}
                style={{
                  padding: '10px 12px',
                  borderRadius: '9px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  color: '#052e16',
                  fontWeight: 900,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <FiCopy size={14} /> 📋 Dernek Duyuru Metni + Linki Kopyala
              </button>

              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="tel"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="Başkan / Üye Tel (Opsiyonel)"
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    padding: '8px 10px',
                    borderRadius: '9px',
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(34, 197, 94, 0.35)',
                    color: '#fff',
                    fontSize: '0.75rem'
                  }}
                />
                <button
                  type="button"
                  onClick={handleSendToPhone}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '9px',
                    background: '#22c55e',
                    border: 'none',
                    color: '#052e16',
                    fontWeight: 900,
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                  title="Girilen numaraya WhatsApp'tan protokol duyurusunu gönder"
                >
                  <FiSend size={13} /> WA Gönder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
