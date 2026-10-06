import React, { useState, useEffect } from 'react';
import { FiDownload, FiX, FiShare } from 'react-icons/fi';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Already installed in standalone mode? Don't show
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      return;
    }

    // Dismissed previously in this session?
    if (sessionStorage.getItem('pwa_prompt_dismissed')) {
      return;
    }

    // iOS detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isAppleDevice);

    if (isAppleDevice) {
      // Show iOS banner after 3 seconds
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android/Desktop Chrome beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIosGuide(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: '76px', // Above bottom navigation
        left: '16px',
        right: '16px',
        maxWidth: '480px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, #0284c7, #0369a1)',
        color: '#ffffff',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        zIndex: 9998,
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiDownload size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.2 }}>
              Uygulamayı Ana Ekrana Ekle
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', marginTop: '2px' }}>
              Tek dokunuşla tam ekran, internetsiz ve daha hızlı kullanım
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleInstallClick}
            style={{
              padding: '6px 12px', borderRadius: '6px', background: '#ffffff', color: '#0284c7',
              border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap'
            }}
          >
            {isIos ? 'Nasıl?' : 'Yükle'}
          </button>
          <button
            onClick={handleDismiss}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* iOS Rehber Modal */}
      {showIosGuide && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card, #1e293b)', color: '#f8fafc', borderRadius: '14px',
            width: '100%', maxWidth: '380px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 700 }}>
              iPhone / iPad'e Ekleme
            </h3>
            <ol style={{ paddingLeft: '20px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 20px' }}>
              <li>Safari alt menüsündeki <strong>Paylaş <FiShare style={{ verticalAlign: 'middle' }} /></strong> butonuna dokunun.</li>
              <li>Açılan menüde aşağı kaydırıp <strong>"Ana Ekrana Ekle"</strong> seçeneğini seçin.</li>
              <li>Sağ üstteki <strong>"Ekle"</strong> butonuna basın.</li>
            </ol>
            <button
              onClick={() => setShowIosGuide(false)}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px', background: '#0284c7',
                border: 'none', color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer'
              }}
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </>
  );
}
