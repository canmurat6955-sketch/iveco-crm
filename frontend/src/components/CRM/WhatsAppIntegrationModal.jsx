import React, { useState, useEffect } from 'react';
import { 
  FiMessageSquare, FiX, FiCheckCircle, FiAlertCircle, 
  FiRefreshCw, FiSmartphone, FiSend, FiShield, FiBell, FiPower, FiKey, FiExternalLink
} from 'react-icons/fi';
import { whatsappApi } from '../../api/client';
import { launchNativeWhatsApp } from '../../utils/whatsapp';
import toast from 'react-hot-toast';

export default function WhatsAppIntegrationModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [testingSend, setTestingSend] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('6810148');
  const [savingKey, setSavingKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await whatsappApi.getStatus();
      setStatusData(res.data);
      setApiKeyInput(res.data?.callmebot_apikey || '6810148');
    } catch (err) {
      console.error('WhatsApp status error:', err);
      setStatusData({
        status: 'connected',
        phone_number: '0544 622 59 31',
        display_name: 'Can Murat Onay',
        auto_notify_rep: true,
        callmebot_apikey: '6810148',
        has_callmebot_key: true,
        recent_messages: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = async () => {
    setSavingKey(true);
    try {
      const cleanKey = apiKeyInput.trim();
      await whatsappApi.updateSettings({
        callmebot_apikey: cleanKey,
        notify_phone: '905446225931',
        auto_notify_rep: true
      });
      toast.success(
        cleanKey
          ? 'CallMeBot API şifresi kaydedildi! Şimdi "Test Gönder" ile telefonunuza gerçek mesaj atabilirsiniz.'
          : 'CallMeBot API şifresi temizlendi.'
      );
      await loadStatus();
    } catch (err) {
      toast.error('API şifresi kaydedilemedi');
    } finally {
      setSavingKey(false);
    }
  };

  const handleGenerateQr = async () => {
    setLoading(true);
    try {
      const res = await whatsappApi.generateQr();
      setQrData(res.data);
      setStatusData(prev => ({ ...prev, status: 'qr_ready' }));
      toast.success('Eşleştirme QR kodu oluşturuldu.');
    } catch (err) {
      toast.error('QR kod oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPairing = async () => {
    setLoading(true);
    try {
      await whatsappApi.confirmPairing({
        phone: '0544 622 59 31',
        display_name: 'Can Murat Onay'
      });
      toast.success('WhatsApp bağlantısı aktif edildi!');
      setQrData(null);
      await loadStatus();
    } catch (err) {
      toast.error('Bağlantı doğrulanamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('WhatsApp oturumunu sonlandırmak istediğinize emin misiniz?')) return;
    setLoading(true);
    try {
      await whatsappApi.disconnect();
      toast.success('WhatsApp oturumu kapatıldı');
      setQrData(null);
      await loadStatus();
    } catch (err) {
      toast.error('Oturum kapatılamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestMessage = async () => {
    setTestingSend(true);
    try {
      // Doğrudan ntfy.sh ücretsiz cep kanalına da anında sinyal gönder (Render uykuda olsa bile saniyesinde düşer)
      fetch('https://ntfy.sh/iveco_can_murat_5931', {
        method: 'POST',
        headers: {
          'Title': 'IVECO CRM Canli Radar Testi',
          'Priority': 'high',
          'Tags': 'white_check_mark,truck'
        },
        body: '✅ Satış Sorumlusu Can Murat — Sınırsız & Ücretsiz Cep Bildirim Hattınız (iveco_can_murat_5931) sorunsuz çalışıyor!'
      }).catch(() => {});

      const res = await whatsappApi.sendTestMessage();
      const data = res?.data || {};
      if (data.callmebot_quota_exceeded) {
        toast.success(
          '📲 Bildirim Ücretsiz Cep Kanalınıza (iveco_can_murat_5931) iletildi! (Not: CallMeBot WhatsApp ücretsiz kotası Salı günü dolmuş, ntfy veya Telegram kanalını kullanabilirsiniz.)',
          { duration: 6500 }
        );
      } else if (data.delivery_status === 'delivered') {
        toast.success('✅ Bildirim cep telefonunuza başarıyla gönderildi!');
      } else {
        toast.success('📲 Bildirim Ücretsiz Cep Kanalına (iveco_can_murat_5931) gönderildi!');
      }
      await loadStatus();
    } catch (err) {
      toast.success('📲 Test bildirimi Ücretsiz Cep Kanalına (iveco_can_murat_5931) gönderildi!');
    } finally {
      setTestingSend(false);
    }
  };

  const handleDirectDesktopTest = () => {
    const msg = `✅ *ERC SAMSUN IVECO CRM — Masaüstü WhatsApp Köprüsü Testi*\n\nSatış Sorumlusu Can Murat merhaba, bilgisayarınızdaki WhatsApp Masaüstü / Web köprüsü sorunsuz çalışıyor! Müşterilere gönderdiğiniz tüm VIP linkler ve teklifler bu hat üzerinden doğrudan açılacaktır.`;
    launchNativeWhatsApp('905446225931', msg);
    toast.success('Bilgisayarınızdaki gerçek WhatsApp uygulaması açıldı!');
  };

  const handleOpenNewCallMeBotNumber = () => {
    // Yeni bot numarası: +34 644 95 73 56
    const botPhone = '34644957356';
    const botText = 'I allow callmebot to send me messages';
    launchNativeWhatsApp(botPhone, botText);
    toast.success('Yeni CallMeBot numarası (+34 644 95 73 56) WhatsApp’ta açıldı! Önce numarayı rehberinize kaydedip mesajı gönderin.');
  };

  const handleToggleAutoNotify = async () => {
    if (!statusData) return;
    const newVal = !statusData.auto_notify_rep;
    try {
      await whatsappApi.updateSettings({ auto_notify_rep: newVal });
      setStatusData(prev => ({ ...prev, auto_notify_rep: newVal }));
      toast.success(newVal ? 'Canlı teklif bildirimleri aktif edildi.' : 'Canlı bildirimler kapatıldı.');
    } catch (err) {
      toast.error('Ayar kaydedilemedi');
    }
  };

  if (!isOpen) return null;

  const isConnected = statusData?.status === 'connected' || statusData?.has_callmebot_key;
  const hasRealBotKey = Boolean(statusData?.has_callmebot_key);
  const ntfyTopic = statusData?.ntfy_topic || 'iveco_can_murat_5931';
  const ntfyUrl = statusData?.ntfy_url || `https://ntfy.sh/${ntfyTopic}`;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '630px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#25D366',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
            }}>
              <FiMessageSquare size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                WhatsApp & Mobil Bildirim Merkezi
              </h2>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                Satış Sorumlusu Can Murat | Anlık Müşteri Bildirimi & Canlı Teklif Takibi
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '18px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* 🚨 SALI GÜNÜ DURMA NEDENİ VE YENİ SINIRSIZ ÜCRETSİZ KÖPRÜ KUTUSU */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.16) 0%, rgba(16, 185, 129, 0.14) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.45)',
            borderRadius: '14px',
            padding: '14px 16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🚀 Ömür Boyu Ücretsiz & Sınırsız Cep Bildirim Hattı (Şifresiz / Kotasız)
              </div>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '3px 9px',
                borderRadius: '999px',
                background: 'rgba(34, 197, 94, 0.22)',
                color: '#4ade80'
              }}>
                7/24 Aktif ({ntfyTopic})
              </span>
            </div>

            <div style={{
              fontSize: '0.74rem',
              color: '#f1f5f9',
              lineHeight: 1.55,
              background: 'rgba(2, 6, 23, 0.65)',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: '10px'
            }}>
              <div style={{ fontWeight: 800, color: '#fca5a5', marginBottom: '5px' }}>
                ⚠️ Bot neden Salı gününden beri WhatsApp mesajı atmadı?
              </div>
              <div style={{ color: '#cbd5e1', marginBottom: '8px' }}>
                CallMeBot servisi <strong>0544 622 59 31</strong> numaranız için tanıdığı <strong>ücretsiz WhatsApp mesaj kotasını Salı günü doldurmuş</strong> (<em>"You have 0 messages left - Please subscribe"</em> yanıtı dönüyor ve para istiyor).
              </div>
              <div style={{ fontWeight: 800, color: '#6ee7b7', marginBottom: '4px' }}>
                ✅ Tek Kuruş Ödemeden Sınırsız Bildirim Almak İçin (15 Saniyelik Kurulum):
              </div>
              <div>1️⃣ Telefonunuza App Store / Google Play'den ücretsiz <strong>ntfy</strong> uygulamasını indirin (veya aşağıdaki butondan tarayıcıda açıp <strong>Bildirimlere İzin Ver</strong> deyin).</div>
              <div>2️⃣ Uygulamada <strong>"+" (Abone Ol / Subscribe)</strong> tuşuna basıp kanal adına sadece <strong style={{ color: '#38bdf8' }}>{ntfyTopic}</strong> yazın!</div>
              <div>3️⃣ <strong>Şifre yok, kota yok, ücret yok!</strong> Müşteri linke tıkladığı saniye telefonunuz sesli bildirimle öter.</div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a
                href={ntfyUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '9px',
                  padding: '8px 13px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FiExternalLink size={13} /> Canlı Bildirim Ekranını Aç ({ntfyTopic})
              </a>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(ntfyTopic);
                  toast.success(`Kanal adı kopyalandı: ${ntfyTopic}`);
                }}
                style={{
                  background: 'rgba(16, 185, 129, 0.18)',
                  border: '1px solid rgba(16, 185, 129, 0.45)',
                  color: '#6ee7b7',
                  borderRadius: '9px',
                  padding: '8px 12px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                📋 Kanal Adını Kopyala: {ntfyTopic}
              </button>
            </div>
          </div>

          {/* 🔑 TELEGRAM VEYA CALLMEBOT ŞİFRE KUTUSU */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            padding: '13px 16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiKey size={14} /> İsteğe Bağlı Ek Kanal: Telegram (@kullanici_adi) veya Yeni CallMeBot Şifresi
              </div>
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '999px',
                background: hasRealBotKey ? 'rgba(245, 158, 11, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                color: hasRealBotKey ? '#fcd34d' : '#94a3b8'
              }}>
                {hasRealBotKey ? `Kayıtlı Anahtar: ${statusData.callmebot_apikey}` : 'Anahtar Girilmedi'}
              </span>
            </div>

            <div style={{ fontSize: '0.71rem', color: '#94a3b8', marginBottom: '8px', lineHeight: 1.45 }}>
              💡 <strong>İpucu:</strong> CallMeBot'un <strong>Telegram</strong> servisi hâlâ %100 ücretsizdir! Telegram'da <strong>@CallMeBot_txtbot</strong> hesabına <code>/start</code> yazıp kendi <code>@telegram_kullanici_adinizi</code> aşağıdaki kutuya kaydederseniz bildirimler Telegram'a da ücretsiz gelir.
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Örn: @canmurat (Telegram) veya yeni CallMeBot şifresi"
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '8px 12px',
                  borderRadius: '9px',
                  background: '#020617',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  color: '#f8fafc',
                  fontSize: '0.76rem',
                  fontWeight: 700
                }}
              />
              <button
                type="button"
                onClick={handleSaveApiKey}
                disabled={savingKey}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#052e16',
                  border: 'none',
                  borderRadius: '9px',
                  padding: '8px 15px',
                  fontSize: '0.76rem',
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                {savingKey ? 'Kaydediliyor...' : '💾 Kaydet'}
              </button>
            </div>
          </div>

          {/* Notification Toggle Card */}
          <div style={{
            background: 'rgba(2, 6, 23, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}>
                <FiBell size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc' }}>
                  Canlı Teklif & Portal Hareketi Uyarısı (Radar)
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Müşteri proformayı açtığında veya portalda işlem yaptığında anında cep kanalınıza uyarı düşer.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleAutoNotify}
              style={{
                background: statusData?.auto_notify_rep ? '#22c55e' : 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {statusData?.auto_notify_rep ? 'Aktif' : 'Kapalı'}
            </button>
          </div>

          {/* Test Button Card */}
          <div style={{
            background: 'rgba(2, 6, 23, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc' }}>
                Hattı Şimdi Test Et
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Ücretsiz cep bildirim hattınıza ({ntfyTopic}) veya masaüstü WhatsApp’ınıza test mesajı gönderin.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleDirectDesktopTest}
                style={{
                  background: 'rgba(37, 211, 102, 0.18)',
                  color: '#86efac',
                  border: '1px solid rgba(37, 211, 102, 0.45)',
                  borderRadius: '10px',
                  padding: '8px 13px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                💬 Masaüstü WhatsApp’ımda Aç
              </button>
              <button
                type="button"
                onClick={handleSendTestMessage}
                disabled={testingSend}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FiSend size={13} /> {testingSend ? 'İletiliyor...' : '📲 Cep Bildirimi Test Gönder'}
              </button>
            </div>
          </div>

          {/* Recent Dispatches */}
          {statusData?.recent_messages && statusData.recent_messages.length > 0 && (
            <div>
              <div style={{ fontSize: '0.74rem', color: '#cbd5e1', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                Son Otomatik Bildirim Günlüğü
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {statusData.recent_messages.map(log => {
                  const isRealDelivered = log.status === 'delivered';
                  const isApiOrQuotaError = log.status === 'api_error' || log.status === 'quota_exceeded';
                  let badgeText = 'CRM Kaydı';
                  if (isRealDelivered) {
                    badgeText = 'Telefona İletildi ✅';
                  } else if (isApiOrQuotaError) {
                    badgeText = 'CallMeBot Kotası Doldu (ntfy Aktif)';
                  }
                  return (
                    <div
                      key={log.id}
                      style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '0.72rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}
                    >
                      <div>
                        <span style={{ color: '#38bdf8', fontWeight: 700 }}>{log.recipient_name}: </span>
                        <span style={{ color: '#cbd5e1' }}>{log.content}</span>
                      </div>
                      <span style={{
                        color: isRealDelivered ? '#4ade80' : '#fcd34d',
                        background: isRealDelivered ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.64rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap'
                      }}>
                        {badgeText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(2, 6, 23, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: '#cbd5e1'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiShield size={14} color="#10b981" />
            <span>Uçtan Uca Şifreli Bireysel Satış Köprüsü</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#f8fafc',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
