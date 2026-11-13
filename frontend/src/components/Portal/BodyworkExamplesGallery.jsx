import React, { useState, useEffect, useMemo } from 'react';
import {
  BODYWORK_EXAMPLES,
  BODYWORK_SERIES_TABS,
  BODYWORK_TYPE_FILTERS,
  resolveBodyworkSeriesFromModel,
} from '../../data/bodyworkExamples';
import { openWhatsAppChat } from '../../utils/openExternal';

export default function BodyworkExamplesGallery({
  selectedModelHint = '',
  selectedBodyHint = '',
  onInspectExample,
  compact = false,
}) {
  const autoSeries = useMemo(
    () => resolveBodyworkSeriesFromModel(selectedModelHint),
    [selectedModelHint]
  );

  const [activeSeries, setActiveSeries] = useState(autoSeries || 'all');
  const [activeBodyType, setActiveBodyType] = useState('all');
  const [lightboxItem, setLightboxItem] = useState(null);

  useEffect(() => {
    if (autoSeries && autoSeries !== 'all') {
      setActiveSeries(autoSeries);
    }
  }, [autoSeries]);

  useEffect(() => {
    if (!selectedBodyHint) return;
    const b = String(selectedBodyHint).toLowerCase();
    if (b.includes('frigo')) setActiveBodyType('frigo');
    else if (b.includes('kapali') || b.includes('kutu')) setActiveBodyType('kapali_kutu');
    else if (b.includes('tente') || b.includes('perde')) setActiveBodyType('tenteli');
    else if (b.includes('acik') || b.includes('sac')) setActiveBodyType('acik_kasa');
  }, [selectedBodyHint]);

  const filteredItems = useMemo(() => {
    return BODYWORK_EXAMPLES.filter((item) => {
      if (activeSeries !== 'all' && item.series !== activeSeries) return false;
      if (activeBodyType !== 'all' && item.bodyType !== activeBodyType) return false;
      return true;
    });
  }, [activeSeries, activeBodyType]);

  const handleOpenItem = (item) => {
    setLightboxItem(item);
    if (typeof onInspectExample === 'function') {
      onInspectExample(item);
    }
  };

  const handleAskChassisOnWhatsApp = (item) => {
    const text = `Merhaba Satış Sorumlusu Can Murat Bey, portalınızdaki "${item.title}" (${item.seriesLabel}) örnek üstyapı görselini inceledim. Bu IVECO şasi aracın güncel şasi fiyatı ve kredi kampanyası hakkında bilgi alabilir miyim?`;
    openWhatsAppChat('905446225931', text);
  };

  const currentIndex = lightboxItem
    ? filteredItems.findIndex((i) => i.id === lightboxItem.id)
    : -1;

  const goPrev = (e) => {
    e.stopPropagation();
    if (filteredItems.length <= 1 || currentIndex < 0) return;
    const prevIdx = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setLightboxItem(filteredItems[prevIdx]);
  };

  const goNext = (e) => {
    e.stopPropagation();
    if (filteredItems.length <= 1 || currentIndex < 0) return;
    const nextIdx = (currentIndex + 1) % filteredItems.length;
    setLightboxItem(filteredItems[nextIdx]);
  };

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.96) 0%, rgba(20, 34, 56, 0.96) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        borderRadius: '18px',
        padding: compact ? '16px' : 'clamp(16px, 3vw, 24px)',
        marginTop: compact ? '18px' : '22px',
        marginBottom: compact ? '18px' : '22px',
        boxShadow: '0 20px 45px -15px rgba(0, 0, 0, 0.55)',
      }}
    >
      {/* Üst Başlık & Örnek Uygulama Notu */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '12px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(245, 158, 11, 0.16)',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              color: '#fde68a',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              marginBottom: '6px',
            }}
          >
            📸 ŞASİ ÜZERİ ÖRNEK ÜSTYAPI (KASA) UYGULAMALARI — FİKİR REHBERİ
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: compact ? '1.05rem' : 'clamp(1.08rem, 2.3vw, 1.32rem)',
              fontWeight: 900,
              color: '#f8fafc',
              letterSpacing: '-0.01em',
            }}
          >
            IVECO Şasi Üzerine Nasıl Kasa Yaptırabilirsiniz? (Gerçek Örnekler)
          </h3>
        </div>

        <span
          style={{
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            color: '#7dd3fc',
            borderRadius: '10px',
            padding: '6px 11px',
            fontSize: '0.74rem',
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}
        >
          🔍 Fotoğraflara Tıklayarak Büyütebilirsiniz ({filteredItems.length} Örnek)
        </span>
      </div>

      {/* Çok Net Şasi Satış Bilgilendirme Şeridi */}
      <div
        style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '12px',
          padding: '10px 14px',
          fontSize: '0.78rem',
          color: '#fef3c7',
          lineHeight: 1.5,
          marginBottom: '14px',
        }}
      >
        📌 <strong>Önemli Bilgilendirme:</strong> Yetkili bayimizden araçlarımız fabrikasyon{' '}
        <strong style={{ color: '#38bdf8', textDecoration: 'underline' }}>ŞASİ KAMYON / KAMYONET</strong>{' '}
        olarak satılmaktadır. Aşağıdaki görsellerde yer alan kasalar satışa dahil olmayıp, satın alacağınız IVECO şasisi üzerine kendi iş kolunuza göre yaptırabileceğiniz{' '}
        <strong>örnek üstyapı uygulamalarını</strong> fikir vermesi amacıyla göstermektedir.
      </div>

      {/* Şasi Modeli Sekmeleri */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '10px',
        }}
      >
        {BODYWORK_SERIES_TABS.map((tab) => {
          const isActive = activeSeries === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSeries(tab.id)}
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                  : 'rgba(30, 41, 59, 0.85)',
                color: isActive ? '#ffffff' : '#cbd5e1',
                border: isActive
                  ? '1px solid #38bdf8'
                  : '1px solid rgba(148, 163, 184, 0.25)',
                borderRadius: '10px',
                padding: '8px 13px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Kasa Tipi Alt Filtresi */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          marginBottom: '16px',
        }}
      >
        {BODYWORK_TYPE_FILTERS.map((f) => {
          const isActive = activeBodyType === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveBodyType(f.id)}
              style={{
                background: isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.7)',
                color: isActive ? '#6ee7b7' : '#94a3b8',
                border: isActive
                  ? '1px solid rgba(16, 185, 129, 0.55)'
                  : '1px solid rgba(148, 163, 184, 0.18)',
                borderRadius: '999px',
                padding: '5px 11px',
                fontSize: '0.73rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Fotoğraf Izgarası */}
      {filteredItems.length === 0 ? (
        <div
          style={{
            padding: '24px',
            textAlign: 'center',
            color: '#cbd5e1',
            background: 'rgba(2, 6, 23, 0.45)',
            borderRadius: '12px',
          }}
        >
          Bu filtrede örnek görsel bulunamadı.{' '}
          <button
            type="button"
            onClick={() => {
              setActiveSeries('all');
              setActiveBodyType('all');
            }}
            style={{
              marginLeft: '8px',
              background: '#0284c7',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 10px',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Tüm Örnekleri Göster
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(235px, 1fr))',
            gap: '14px',
          }}
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenItem(item)}
              style={{
                background: 'rgba(2, 6, 23, 0.75)',
                border: '1px solid rgba(148, 163, 184, 0.22)',
                borderRadius: '14px',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '175px',
                  background: '#020617',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(15, 23, 42, 0.88)',
                    border: '1px solid rgba(245, 158, 11, 0.5)',
                    color: '#fde68a',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  ÖRNEK ÜSTYAPI
                </span>
                <span
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: 'rgba(2, 132, 199, 0.92)',
                    color: '#fff',
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  🔍 Büyüt
                </span>
              </div>

              <div
                style={{
                  padding: '11px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  flex: 1,
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#38bdf8',
                      marginBottom: '2px',
                    }}
                  >
                    {item.seriesLabel}
                  </div>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      color: '#f8fafc',
                      lineHeight: 1.35,
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: '0.71rem',
                      color: '#94a3b8',
                      marginTop: '4px',
                      lineHeight: 1.4,
                    }}
                  >
                    {item.subtitle}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '6px',
                    paddingTop: '6px',
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                    fontSize: '0.68rem',
                    color: '#cbd5e1',
                    fontWeight: 700,
                  }}
                >
                  📐 {item.sampleDims}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Büyütülmüş Görsel (Lightbox) Modalı */}
      {lightboxItem && (
        <div
          onClick={() => setLightboxItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.92)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0f172a',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '18px',
              maxWidth: '880px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            }}
          >
            {/* Lightbox Header */}
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: '#fde68a', fontWeight: 800 }}>
                  📌 ŞASİ ÜZERİ ÖRNEK UYGULAMA (Araçlarımız Şasi Olarak Satılmaktadır)
                </div>
                <div style={{ fontSize: '0.98rem', color: '#f8fafc', fontWeight: 900 }}>
                  {lightboxItem.title}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                ✕ Kapat
              </button>
            </div>

            {/* Büyük Fotoğraf */}
            <div
              style={{
                position: 'relative',
                background: '#020617',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxHeight: '62vh',
                overflow: 'hidden',
              }}
            >
              <img
                src={lightboxItem.image}
                alt={lightboxItem.title}
                style={{
                  width: '100%',
                  maxHeight: '62vh',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
              {filteredItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: '999px',
                      width: '40px',
                      height: '40px',
                      fontSize: '1.1rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: '999px',
                      width: '40px',
                      height: '40px',
                      fontSize: '1.1rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Alt Açıklama ve Şasi Teklif Butonu */}
            <div style={{ padding: '16px 20px' }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '10px',
                }}
              >
                <span
                  style={{
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#7dd3fc',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                  }}
                >
                  🚛 {lightboxItem.seriesLabel}
                </span>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#6ee7b7',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                  }}
                >
                  📐 {lightboxItem.sampleDims}
                </span>
              </div>

              <p
                style={{
                  margin: '0 0 12px 0',
                  fontSize: '0.84rem',
                  color: '#e2e8f0',
                  lineHeight: 1.5,
                }}
              >
                {lightboxItem.subtitle}
              </p>

              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontSize: '0.74rem',
                  color: '#fde68a',
                  marginBottom: '14px',
                }}
              >
                ⚠️ <strong>Not:</strong> Araçlarımız <strong>ŞASİ</strong> olarak satılmaktadır. Görseldeki üstyapı/kasa, bu şasi üzerine yaptırabileceğiniz örnek bir uygulamadır.
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleAskChassisOnWhatsApp(lightboxItem)}
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: '#052e16',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    fontSize: '0.82rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  💬 Bu Şasi İçin Satış Sorumlusu Can Murat'tan Fiyat Sor
                </button>

                <button
                  type="button"
                  onClick={() => setLightboxItem(null)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    padding: '9px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Galeride Diğer Örneklere Bak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
