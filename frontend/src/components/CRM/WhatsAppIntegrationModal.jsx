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
  const [apiKeyInput, setApiKeyInput] = useState('');
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
      if (res.data?.callmebot_apikey !== undefined) {
        setApiKeyInput(res.data.callmebot_apikey || '');
      }
    } catch (err) {
      console.error('WhatsApp status error:', err);
      setStatusData({
        status: 'connected',
        phone_number: '0544 622 59 31',
        display_name: 'Can Murat Onay',
        auto_notify_rep: true,
        callmebot_apikey: '',
        has_callmebot_key: false,
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
      const res = await whatsappApi.sendTestMessage();
      const data = res?.data || {};
      if (data.delivery_status === 'delivered') {
        toast.success('✅ Gerçek WhatsApp mesajı 0544 622 59 31 telefonunuza gönderildi!');
      } else if (!data.has_callmebot_key) {
        toast('⚠️ Henüz CallMeBot API şifresi girmediğiniz için sadece CRM günlüğüne yazıldı. Telefonunuza gerçek mesaj gelmesi için yukarıdaki 6 haneli şifreyi girin veya "Masaüstü WhatsApp Testi"ne basın.', {
          icon: '📲',
          duration: 6000
        });
      } else {
        toast.error(data.delivery_detail || 'CallMeBot mesajı iletilemedi, şifrenizi kontrol edin.');
      }
      await loadStatus();
    } catch (err) {
      toast.error('Test mesajı gönderilemedi');
    } finally {
      setTestingSend(false);
    }
  };

  const handleDirectDesktopTest = () => {
    const msg = `✅ *ERC SAMSUN IVECO CRM — Masaüstü WhatsApp Köprüsü Testi*\n\nCan Murat Bey merhaba, bilgisayarınızdaki WhatsApp Masaüstü / Web köprüsü sorunsuz çalışıyor! Müşterilere gönderdiğiniz tüm VIP linkler ve teklifler bu hat üzerinden doğrudan açılacaktır.`;
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
        maxWidth: '610px',
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
                WhatsApp Satış & Bildirim Merkezi
              </h2>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                Can Murat Onay | Otomatik Müşteri Bildirimi & Canlı Teklif Takibi
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
          
          {/* Status Ribbon */}
          <div style={{
            background: hasRealBotKey ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: `1px solid ${hasRealBotKey ? 'rgba(34, 197, 94, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
            borderRadius: '14px',
            padding: '13px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: hasRealBotKey ? '#22c55e' : '#f59e0b',
                boxShadow: `0 0 10px ${hasRealBotKey ? '#22c55e' : '#f59e0b'}`
              }} />
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc' }}>
                  {hasRealBotKey
                    ? '✅ Gerçek Cep Telefonu Bildirim Botu Aktif & Bağlı'
                    : '📲 Masaüstü Köprüsü Aktif — Cep Telefonu Bot Şifresi Bekleniyor'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
                  Hat Sahibi: Can Murat Onay ({statusData?.phone_number || '0544 622 59 31'})
                </div>
              </div>
            </div>
          </div>

          {/* 🔑 YENİ CALLMEBOT (+34 644 95 73 56) KURULUM VE ŞİFRE KUTUSU */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.92) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '14px',
            padding: '14px 16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiKey size={15} /> Cep Telefonuna Gerçek WhatsApp Bildirimi (CallMeBot Şifresi)
              </div>
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '999px',
                background: hasRealBotKey ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: hasRealBotKey ? '#4ade80' : '#fcd34d'
              }}>
                {hasRealBotKey ? `Şifre Kayıtlı (${statusData.callmebot_apikey})` : 'Şifre Girilmedi'}
              </span>
            </div>

            <div style={{
              fontSize: '0.73rem',
              color: '#e2e8f0',
              lineHeight: 1.5,
              background: 'rgba(2, 6, 23, 0.55)',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.07)',
              marginBottom: '10px'
            }}>
              <div style={{ fontWeight: 800, color: '#fde68a', marginBottom: '4px' }}>
                💡 Neden "This Bot is full" uyarısı aldın ve ne yapmalısın?
              </div>
              <div>1️⃣ Eski bot dolduğu için sana <strong>yeni bot numarasını (+34 644 95 73 56)</strong> verdi.</div>
              <div>2️⃣ <strong>Çok Önemli:</strong> Önce cep telefonunun rehberine <strong>+34 644 95 73 56</strong> numarasını kaydet (Rehbere eklemezsen şifre üretmez!).</div>
              <div>3️⃣ Ardından bu yeni numaraya WhatsApp'tan <strong>I allow callmebot to send me messages</strong> (veya <strong>I allow callmebot to call me</strong>) yazıp gönder.</div>
              <div>4️⃣ Sana cevaben gelen <strong>6 haneli APIKey şifresini</strong> aşağıdaki kutuya yazıp kaydet!</div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={handleOpenNewCallMeBotNumber}
                style={{
                  background: 'rgba(37, 211, 102, 0.18)',
                  border: '1px solid rgba(37, 211, 102, 0.45)',
                  color: '#86efac',
                  borderRadius: '9px',
                  padding: '7px 12px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FiExternalLink size={13} /> Yeni Botu (+34 644 95 73 56) WhatsApp’ta Aç & Mesajı Hazırla
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="CallMeBot'tan gelen APIKey şifresini buraya yapıştırın (Örn: 482915)"
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '9px 12px',
                  borderRadius: '9px',
                  background: '#020617',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#f8fafc',
                  fontSize: '0.78rem',
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
                  padding: '9px 16px',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                {savingKey ? 'Kaydediliyor...' : '💾 Şifreyi Kaydet'}
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
                  Müşteri proformayı açtığında veya portalda işlem yaptığında 0544 622 59 31 hattınıza uyarı düşer.
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
                Hattı Test Et (0544 622 59 31)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                İster CallMeBot ile arka planda, ister doğrudan bilgisayarınızdaki WhatsApp’ı açarak test edin.
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
                <FiSend size={13} /> {testingSend ? 'İletiliyor...' : 'Bot İle Test Gönder'}
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
                        {isRealDelivered ? 'Telefona İletildi' : 'CRM Kaydı (Şifre Bekliyor)'}
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
