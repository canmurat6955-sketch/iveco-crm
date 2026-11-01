import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { crmApi } from '../../api/client';
import { 
  FiTruck, FiFileText, FiMapPin, FiPhoneCall, FiMessageSquare, 
  FiCheckCircle, FiShield, FiCalendar, FiUser, FiAlertCircle
} from 'react-icons/fi';

export default function PublicProposalView() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proposal, setProposal] = useState(null);

  useEffect(() => {
    if (!token) return;
    const fetchProposal = async () => {
      try {
        setLoading(true);
        const res = await crmApi.getPublicProformaView(token);
        setProposal(res.data);
      } catch (err) {
        console.error(err);
        setError('Teklif bağlantısı bulunamadı veya süresi dolmuş olabilir.');
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [token]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1120', color: '#94a3b8' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-pulse" style={{ margin: '0 auto 16px auto', width: 36, height: 36 }}></div>
          <div style={{ color: '#38bdf8', fontWeight: '700', fontSize: '15px', letterSpacing: '0.02em' }}>
            IVECO Resmi Teklif Dosyası Yükleniyor...
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: 4 }}>
            ERC Samsun Otomotiv Yetkili Satıcı & Servis
          </div>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1120', padding: '20px' }}>
        <div style={{ maxWidth: '480px', width: '100%', background: '#0f172a', border: '1px solid #1e293b', padding: '32px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#ef4444' }}>
            <FiAlertCircle size={28} />
          </div>
          <h2 style={{ fontSize: '19px', color: '#f8fafc', marginBottom: '8px', fontWeight: 800 }}>Bağlantı Geçersiz veya Süresi Dolmuş</h2>
          <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.6 }}>{error || 'Teklif detaylarına ulaşılamadı. Lütfen satış temsilciniz ile iletişime geçiniz.'}</p>
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #1e293b', fontSize: '12px', color: '#64748b' }}>
            IVECO ERC Samsun Otomotiv • 0544 622 59 31
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080c16', padding: 'clamp(14px, 3vw, 28px) clamp(10px, 2vw, 18px)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto', background: '#0f172a', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)', border: '1px solid #1e293b' }}>
        
        {/* Kurumsal Başlık Şeridi */}
        <div style={{ background: 'linear-gradient(135deg, #002c6c 0%, #004b93 100%)', color: '#ffffff', padding: 'clamp(20px, 4vw, 30px) clamp(16px, 4vw, 26px)', position: 'relative', borderBottom: '2px solid rgba(56, 189, 248, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="/logo-iveco-white.png" alt="IVECO" style={{ height: '24px', objectFit: 'contain' }} />
              <div style={{ height: '20px', width: '1px', background: 'rgba(255, 255, 255, 0.3)' }} />
              <img src="/logo-erc-samsun-white.png" alt="ERC Samsun Otomotiv" style={{ height: '28px', objectFit: 'contain' }} />
            </div>

            <div style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#38bdf8',
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '4px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <FiShield size={12} /> YETKİLİ SATICI & SERVİS
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '8px' }}>
                <FiFileText size={12} /> RESMİ DİJİTAL PROFORMA
              </div>
              <h1 style={{ margin: 0, fontSize: 'clamp(19px, 4.5vw, 24px)', fontWeight: '800', letterSpacing: '-0.02em' }}>{proposal.dealer_title}</h1>
              <p style={{ margin: '4px 0 0 0', opacity: 0.85, fontSize: '12.5px', color: '#e2e8f0' }}>{proposal.dealer_address}</p>
            </div>
            <div style={{ textAlign: 'right', background: 'rgba(15, 23, 42, 0.45)', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Teklif Referansı</div>
              <div style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '0.5px', color: '#ffffff' }}>{proposal.invoice_number}</div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '3px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                <FiCalendar size={11} /> {proposal.date}
              </div>
            </div>
          </div>
        </div>

        {/* Gövde ve Teklif İçeriği */}
        <div style={{ padding: 'clamp(16px, 4vw, 26px)' }}>
          
          {/* Müşteri Ünvan Kutusu */}
          <div style={{ background: '#131b2e', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Sayın Yetkili / Firma
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc' }}>
              {proposal.company_name}
            </div>
            {proposal.city && (
              <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <FiMapPin size={12} style={{ color: '#38bdf8' }} /> {proposal.city}
              </div>
            )}
          </div>

          {/* Araç ve Teknik Veriler */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <FiTruck size={14} style={{ color: '#38bdf8' }} /> Teklif Edilen Araç & Teknik Donanım
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '10px' }}>
              <div style={{ background: '#131b2e', border: '1px solid #1e293b', padding: '12px 14px', borderRadius: '8px' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Araç Modeli</span>
                <strong style={{ fontSize: '14.5px', color: '#f8fafc' }}>{proposal.vehicle_model}</strong>
              </div>
              <div style={{ background: '#131b2e', border: '1px solid #1e293b', padding: '12px 14px', borderRadius: '8px' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Model Yılı / Motor</span>
                <strong style={{ fontSize: '14.5px', color: '#f8fafc' }}>{proposal.model_year || '2026'} • {proposal.motor_power || 'Standard'}</strong>
              </div>
              <div style={{ background: '#131b2e', border: '1px solid #1e293b', padding: '12px 14px', borderRadius: '8px' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Renk & Teslim Noktası</span>
                <strong style={{ fontSize: '14.5px', color: '#f8fafc' }}>{proposal.color || 'BEYAZ'} • {proposal.delivery_place || 'ERC Samsun'}</strong>
              </div>
            </div>
          </div>

          {/* Fiyat ve Anahtar Teslim Bedeli */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)', 
            borderRadius: '12px', 
            padding: 'clamp(16px, 4vw, 22px)', 
            marginBottom: '22px',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '16px'
          }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Anahtar Teslim Net Fiyat (KDV Dahil)
              </span>
              <div style={{ fontSize: 'clamp(24px, 5.5vw, 32px)', fontWeight: '900', color: '#ffffff', marginTop: '3px' }}>
                {Number(proposal.grand_total).toLocaleString('tr-TR')} TL
              </div>
              {proposal.notes && proposal.notes.toLowerCase().includes('peşin alım indirimi') && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '11.5px', fontWeight: 700, padding: '3px 9px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.4)', marginTop: '8px' }}>
                  <FiCheckCircle size={12} /> Özel Peşin Alım İndirimi Uygulanmıştır
                </div>
              )}
            </div>
            {proposal.payment_terms && (
              <div style={{ background: '#0a0f1d', padding: '10px 14px', borderRadius: '8px', border: '1px solid #1e293b', maxWidth: '340px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ÖDEME & FİNANSMAN SEÇENEĞİ</span>
                <div style={{ fontSize: '12.5px', color: '#cbd5e1', fontWeight: '600', marginTop: '3px', lineHeight: 1.4 }}>{proposal.payment_terms}</div>
              </div>
            )}
          </div>

          {/* Notlar & Satış Koşulları */}
          {proposal.notes && (
            <div style={{ background: '#0a0f1d', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px', marginBottom: '24px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Önemli Notlar & Satış Koşulları:</span>
              <p style={{ margin: '5px 0 0 0', fontSize: '12.5px', color: '#cbd5e1', lineHeight: 1.6 }}>{proposal.notes}</p>
            </div>
          )}

          {/* Satış Danışmanı Kartı & WhatsApp Aksiyonu */}
          <div style={{
            background: '#131b2e', 
            border: '1px solid rgba(56, 189, 248, 0.3)', 
            borderRadius: '12px', 
            padding: '16px 20px',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(0, 75, 147, 0.25)', border: '1px solid #0284c7', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiUser size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Satış & Filo Danışmanınız</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#f8fafc' }}>{proposal.sales_rep_name || 'Can Murat ONAY'}</div>
                <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: 1 }}>IVECO ERC Samsun Otomotiv • 0544 622 59 31</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flex: '1 1 240px' }}>
              <a
                href={`https://wa.me/905446225931?text=${encodeURIComponent(`Merhaba Murat Bey, ${proposal.invoice_number} numaralı ${proposal.vehicle_model} teklifinizi inceledim. Detayları görüşmek isterim.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  background: '#10b981', 
                  color: '#ffffff', 
                  padding: '11px 18px', 
                  borderRadius: '8px',
                  fontWeight: '700', 
                  fontSize: '13px', 
                  textDecoration: 'none', 
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  width: '100%'
                }}
              >
                <FiMessageSquare size={16} /> Murat Bey ile WhatsApp'tan Görüş
              </a>
            </div>
          </div>
        </div>

        {/* Kurumsal Alt Bilgi */}
        <div style={{ background: '#0a0f1d', padding: '16px 24px', borderTop: '1px solid #1e293b', textAlign: 'center', fontSize: '11px', color: '#64748b', lineHeight: 1.5 }}>
          <div style={{ fontWeight: 700, color: '#94a3b8', marginBottom: '3px' }}>
            IVECO Yetkili Satıcısı ERC Samsun Otomotiv San. ve Tic. A.Ş. • Dijital Satış Sistemi
          </div>
          <div>
            * Bu teklif bilgilendirme amaçlı olup kesin satış taahhüdü teşkil etmez. Nihai araç fiyatı, teslim tarihi ve resmi banka kredi onay şartları IVECO ERC Samsun Otomotiv ile düzenlenecek resmi satış sözleşmesiyle kesinleşir.
          </div>
        </div>
      </div>
    </div>
  );
}
