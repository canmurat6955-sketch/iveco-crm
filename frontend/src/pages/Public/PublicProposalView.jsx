import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { crmApi } from '../../api/client';

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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🚚</div>
          <div style={{ color: '#0369a1', fontWeight: '600', fontSize: '16px' }}>IVECO Teklifiniz Hazırlanıyor...</div>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
        <div style={{ maxWidth: '480px', width: '100%', background: '#fff', padding: '32px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h2 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>Bağlantı Geçersiz</h2>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6 }}>{error || 'Teklif detaylarına ulaşılamadı. Lütfen satış danışmanınızla iletişime geçin.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '24px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: '#ffffff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
        
        {/* Header Banner */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%)', color: '#ffffff', padding: '32px 28px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <img src="/logo-iveco-white.png" alt="IVECO" style={{ height: '26px', objectFit: 'contain' }} />
            <div style={{ height: '22px', width: '1px', background: 'rgba(255, 255, 255, 0.35)' }} />
            <img src="/logo-erc-samsun-white.png" alt="ERC Samsun Otomotiv" style={{ height: '30px', objectFit: 'contain' }} />
            <div style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#fef08a',
              background: 'rgba(254, 240, 138, 0.15)',
              padding: '3px 10px',
              borderRadius: '12px',
              border: '1px solid rgba(254, 240, 138, 0.3)',
              letterSpacing: '0.5px'
            }}>
              YETKİLİ SATICI & SERVİS
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', marginBottom: '10px' }}>
                RESMİ TEKLİF & PROFORMA
              </div>
              <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800' }}>{proposal.dealer_title}</h1>
              <p style={{ margin: '6px 0 0 0', opacity: 0.85, fontSize: '13px' }}>{proposal.dealer_address}</p>
            </div>
            <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Teklif No</div>
              <div style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '0.5px' }}>{proposal.invoice_number}</div>
              <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>Tarih: {proposal.date}</div>
            </div>
          </div>
        </div>

        {/* Customer & Vehicle Main Box */}
        <div style={{ padding: '28px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              Sayın Yetkili / Firma
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
              {proposal.company_name}
            </div>
            {proposal.city && (
              <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>📍 {proposal.city}</div>
            )}
          </div>

          {/* Vehicle Specifications */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🚛 Teklif Edilen Araç & Teknik Özellikler
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '10px' }}>
                <span style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>Araç Modeli</span>
                <strong style={{ fontSize: '15px', color: '#0f172a' }}>{proposal.vehicle_model}</strong>
              </div>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '10px' }}>
                <span style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>Model Yılı / Motor</span>
                <strong style={{ fontSize: '15px', color: '#0f172a' }}>{proposal.model_year || '2026'} | {proposal.motor_power || 'Standard'}</strong>
              </div>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '10px' }}>
                <span style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>Renk / Teslimat</span>
                <strong style={{ fontSize: '15px', color: '#0f172a' }}>{proposal.color || 'BEYAZ'} | {proposal.delivery_place || 'ERC Samsun'}</strong>
              </div>
            </div>
          </div>

          {/* Price & Grand Total */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid #bbf7d0', borderRadius: '16px', padding: '24px', marginBottom: '24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
          }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>
                Anahtar Teslim Toplam Teklif Bedeli (KDV Dahil)
              </span>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#15803d', marginTop: '4px' }}>
                {Number(proposal.grand_total).toLocaleString('tr-TR')} TL
              </div>
            </div>
            {proposal.payment_terms && (
              <div style={{ background: '#fff', padding: '10px 16px', borderRadius: '10px', border: '1px solid #bbf7d0', maxWidth: '320px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#166534' }}>ÖDEME & FİNANSMAN PLANI</span>
                <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600', marginTop: '2px' }}>{proposal.payment_terms}</div>
              </div>
            )}
          </div>

          {/* Notes */}
          {proposal.notes && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '28px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Önemli Notlar & Koşullar:</span>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>{proposal.notes}</p>
            </div>
          )}

          {/* Sales Representative Card & Direct Action */}
          <div style={{
            background: '#ffffff', border: '2px solid #0284c7', borderRadius: '16px', padding: '20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                👔
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Satış Sorumlusu</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{proposal.sales_rep_name}</div>
                <div style={{ fontSize: '13px', color: '#0284c7' }}>IVECO ERC Samsun Otomotiv</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href={`https://wa.me/905300000000?text=${encodeURIComponent(`Merhaba Can Bey, ${proposal.invoice_number} numaralı ${proposal.vehicle_model} teklifinizi inceledim. Detayları görüşmek isterim.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: '#22c55e', color: '#fff', padding: '12px 20px', borderRadius: '10px',
                  fontWeight: '700', fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)'
                }}
              >
                💬 WhatsApp'tan Görüş
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: '#f8fafc', padding: '16px 28px', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
          IVECO Türkiye Yetkili Bayisi ERC Otomotiv Dijital Satış Sistemi • Güvenli Müşteri Bağlantısı
        </div>
      </div>
    </div>
  );
}
