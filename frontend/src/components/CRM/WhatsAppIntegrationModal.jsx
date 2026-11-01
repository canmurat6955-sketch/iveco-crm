import React, { useState, useEffect } from 'react';
import { 
  FiMessageSquare, FiX, FiCheckCircle, FiAlertCircle, 
  FiRefreshCw, FiSmartphone, FiSend, FiShield, FiBell, FiPower 
} from 'react-icons/fi';
import { whatsappApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function WhatsAppIntegrationModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [testingSend, setTestingSend] = useState(false);

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
    } catch (err) {
      console.error('WhatsApp status error:', err);
      // Fallback default state
      setStatusData({
        status: 'disconnected',
        phone_number: '0544 622 59 31',
        display_name: 'Can Murat Onay',
        auto_notify_rep: true,
        recent_messages: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQr = async () => {
    setLoading(true);
    try {
      const res = await whatsappApi.generateQr();
      setQrData(res.data);
      setStatusData(prev => ({ ...prev, status: 'qr_ready' }));
      toast.success('Eşleştirme QR kodu oluşturuldu. Lütfen telefonunuzdan okutunuz.');
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
      toast.success('WhatsApp bağlantısı başarıyla kuruldu!');
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
      await whatsappApi.sendTestMessage();
      toast.success('Test uyarısı 0544 622 59 31 numaralı telefonunuza iletildi!');
      await loadStatus();
    } catch (err) {
      toast.error('Test mesajı gönderilemedi');
    } finally {
      setTestingSend(false);
    }
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

  const isConnected = statusData?.status === 'connected';

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
        maxWidth: '560px',
        maxHeight: '90vh',
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
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Status Ribbon */}
          <div style={{
            background: isConnected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${isConnected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            borderRadius: '14px',
            padding: '14px 18px',
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
                background: isConnected ? '#22c55e' : '#f59e0b',
                boxShadow: `0 0 10px ${isConnected ? '#22c55e' : '#f59e0b'}`
              }} />
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc' }}>
                  {isConnected ? 'WhatsApp Hattı Aktif & Bağlı' : 'WhatsApp Bağlantısı Bekleniyor'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                  {isConnected 
                    ? `Hat Sahibi: Can Murat Onay (${statusData?.phone_number || '0544 622 59 31'})`
                    : 'Telefonunuzdaki WhatsApp Web ile CRM arasında güvenli köprü kurun'}
                </div>
              </div>
            </div>

            {isConnected ? (
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={loading}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FiPower size={13} /> Oturumu Kapat
              </button>
            ) : null}
          </div>

          {/* QR Pairing Area (If not connected) */}
          {!isConnected && (
            <div style={{
              background: 'rgba(2, 6, 23, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center'
            }}>
              {qrData ? (
                <div>
                  <div style={{
                    display: 'inline-block',
                    background: '#fff',
                    padding: '12px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    marginBottom: '16px'
                  }}>
                    <img
                      src={qrData.qr_image_url}
                      alt="WhatsApp Web QR Kodu"
                      style={{ width: '220px', height: '220px', display: 'block' }}
                    />
                  </div>

                  <div style={{ fontSize: '0.84rem', color: '#f8fafc', fontWeight: 700, marginBottom: '6px' }}>
                    Telefonunuzdan QR Kodu Taratın
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', maxWidth: '400px', margin: '0 auto 16px', lineHeight: 1.4 }}>
                    WhatsApp ➔ <strong>Bağlı Cihazlar</strong> ➔ <strong>Cihaz Bağla</strong> seçeneğine girip kameranızı bu koda tutun.
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={handleConfirmPairing}
                      disabled={loading}
                      style={{
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 18px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <FiCheckCircle size={16} /> Eşleştirmeyi Tamamla
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerateQr}
                      disabled={loading}
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#f8fafc',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <FiRefreshCw size={14} className={loading ? 'crm-spin' : ''} /> Yenile
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '20px 10px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(37, 211, 102, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#25D366',
                    margin: '0 auto 14px'
                  }}>
                    <FiSmartphone size={32} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px' }}>
                    WhatsApp Web Köprüsü Kurun
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 auto 20px', maxWidth: '380px' }}>
                    Telefonunuzu sisteme bağlayarak müşterilere tek tıkla antetli teklif gönderebilir ve müşteri teklifi açtığı anda anlık uyarı alabilirsiniz.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateQr}
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 16px rgba(37, 211, 102, 0.35)'
                    }}
                  >
                    <FiRefreshCw size={16} /> QR Kodu Başlat
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Connected Controls */}
          {isConnected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Notification Toggle Card */}
              <div style={{
                background: 'rgba(2, 6, 23, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '16px',
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
                      Canlı Teklif Okundu Uyarısı (Radar)
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Müşteri proforma bağlantısını açtığında telefonunuza anında WhatsApp uyarısı düşer.
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
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc' }}>
                    Hattı Test Et (0544 622 59 31)
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Kendi WhatsApp numaranıza sistemden doğrulama mesajı gönderin.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendTestMessage}
                  disabled={testingSend}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FiSend size={13} /> {testingSend ? 'İletiliyor...' : 'Test Gönder'}
                </button>
              </div>

              {/* Recent Dispatches */}
              {statusData?.recent_messages && statusData.recent_messages.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    Son Otomatik Bildirim Günlüğü
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {statusData.recent_messages.map(log => (
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
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <span style={{ color: '#38bdf8', fontWeight: 700 }}>{log.recipient_name}: </span>
                          <span style={{ color: '#cbd5e1' }}>{log.content}</span>
                        </div>
                        <span style={{
                          color: '#4ade80',
                          background: 'rgba(34, 197, 94, 0.15)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.64rem',
                          fontWeight: 700
                        }}>
                          İletildi
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
          color: '#64748b'
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
