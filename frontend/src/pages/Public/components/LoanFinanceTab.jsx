import React, { useState, useMemo } from 'react';
import { BANK_LIST } from '../../../data/bankCampaigns';
import { FiDollarSign, FiCheckCircle, FiShield, FiPercent, FiMessageSquare, FiFileText } from 'react-icons/fi';

const SAMPLE_LOAN_PRESETS = [
  { amount: 800000, label: '800.000 TL (%0 Faiz Kampanyalı)', term: 12, rate: 0.00, monthly: 66667, total: 800000, desc: '12 Ay Sıfır Faiz — Yalnızca Anapara Geri Ödemeli' },
  { amount: 1000000, label: '1.000.000 TL (%0 Faiz Kampanyalı)', term: 12, rate: 0.00, monthly: 83333, total: 1000000, desc: '12 Ay Sıfır Faiz — Yalnızca Anapara Geri Ödemeli' },
  { amount: 1500000, label: '1.500.000 TL (24 Ay Esnek Ticari)', term: 24, rate: 1.99, monthly: 83500, total: 2004000, desc: 'KOBİ Destekli Düşük Ticari Faiz Oranı' },
  { amount: 2000000, label: '2.000.000 TL (36 Ay Uzun Vade)', term: 36, rate: 2.19, monthly: 81200, total: 2923200, desc: 'Nakit Akışını Rahatlatan 36 Ay Eşit Taksit' },
  { amount: 3000000, label: '3.000.000 TL (Kuveyt Türk 6 Ay Ödemesiz)', term: 36, rate: 2.29, monthly: 128000, total: 4608000, desc: 'İlk 6 Ay 0 TL Taksit — Araç Çalışsın, Ödeme Sonra Başlasın' },
  { amount: 5000000, label: '5.000.000 TL (Ağır Vasıta & Filo Özel)', term: 48, rate: 2.39, monthly: 178000, total: 8544000, desc: 'S-Way & T-Way Ağır Vasıta Kurumsal Filo Finansmanı' }
];

export default function LoanFinanceTab({ onDirectWhatsApp, salesRep }) {
  const [selectedBankId, setSelectedBankId] = useState('teb_cetelem');
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [loanTerm, setLoanTerm] = useState(12);

  const activeBank = BANK_LIST.find(b => b.id === selectedBankId) || BANK_LIST[0];

  const handleApplyPreset = (preset) => {
    setLoanAmount(preset.amount);
    setLoanTerm(preset.term);
  };

  const handleWhatsAppLoan = (planDesc) => {
    if (onDirectWhatsApp) {
      const msg = `Merhaba ${salesRep?.name || 'Can Murat Bey'}, IVECO ERC Samsun finansman portalından *${activeBank.name}* için *${loanAmount.toLocaleString('tr-TR')} TL* tutarında *${loanTerm} Ay Vadeli* ticari kredi imkanları ve şirketimize özel ön onay şartları hakkında bilgi almak istiyorum.`;
      onDirectWhatsApp(msg);
    }
  };

  return (
    <div style={{ color: '#f8fafc' }}>
      {/* Tab Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(15, 23, 42, 0.7) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderRadius: '16px',
        padding: '18px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            RESMİ ANLAŞMALI BANKALAR & %0 FAİZ
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 2px', color: '#fff' }}>
            IVECO Ticari Finansman & Kredi Çözümleri
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            Vergi levhalı işletmelere ve KOBİ'lere özel 1.000.000 TL'ye kadar %0 faiz, 5.000.000 TL'ye kadar esnek vadeli ticari krediler.
          </p>
        </div>
        <div style={{
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.4)',
          borderRadius: '12px',
          padding: '8px 14px',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.70rem', color: '#4ade80', fontWeight: 700 }}>⚡ 1 SAATTE ÖN ONAY</div>
          <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 800 }}>Kefilsiz & Hızlı Başvuru</div>
        </div>
      </div>

      {/* Partner Banks Grid */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontSize: '0.76rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
          🏛️ ANLAŞMALI RESMİ FİNANSMAN KURUMLARI
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
          {BANK_LIST.map(bank => {
            const isSelected = selectedBankId === bank.id;
            return (
              <button
                key={bank.id}
                type="button"
                onClick={() => setSelectedBankId(bank.id)}
                style={{
                  background: isSelected ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.4) 0%, rgba(15, 23, 42, 0.85) 100%)' : 'rgba(15, 23, 42, 0.65)',
                  border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: '#fff',
                  boxShadow: isSelected ? '0 4px 16px rgba(2, 132, 199, 0.35)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{bank.icon}</span>
                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    background: bank.bg || 'rgba(56, 189, 248, 0.15)',
                    color: bank.color || '#38bdf8',
                    padding: '2px 6px',
                    borderRadius: '6px'
                  }}>
                    {bank.badge}
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>
                  {bank.name}
                </div>
                <div style={{ fontSize: '0.70rem', color: '#94a3b8', marginTop: '4px', lineHeight: 1.3 }}>
                  {bank.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Bank Highlight & Presets */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.9)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '22px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '1.4rem', marginRight: '6px' }}>{activeBank.icon}</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>{activeBank.name} Kampanyaları</span>
            <div style={{ fontSize: '0.76rem', color: '#38bdf8', marginTop: '2px' }}>{activeBank.description}</div>
          </div>

          <button
            type="button"
            onClick={() => handleWhatsAppLoan()}
            style={{
              background: '#22c55e',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '0.80rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FiMessageSquare size={14} /> Bu Banka İçin Kredi Başvurusu Yap
          </button>
        </div>

        {/* Popular Loan Options */}
        <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
          💡 EN ÇOK KULLANILAN TİCARİ KREDİ PAKETLERİ
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
          {SAMPLE_LOAN_PRESETS.map((preset, idx) => (
            <div
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              style={{
                background: loanAmount === preset.amount ? 'rgba(2, 132, 199, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                border: loanAmount === preset.amount ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#fff' }}>{preset.label}</span>
                {preset.rate === 0 && (
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#10b981', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                    %0 FAİZ
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '4px 0' }}>{preset.desc}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginTop: '6px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '6px' }}>
                <span style={{ color: '#cbd5e1' }}>Aylık Taksit: <strong style={{ color: '#4ade80' }}>{preset.monthly.toLocaleString('tr-TR')} TL</strong></span>
                <span style={{ color: '#94a3b8' }}>Vade: <strong>{preset.term} Ay</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tax & Business Advantages Guide */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        padding: '20px'
      }}>
        <div style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
          💼 ŞİRKETLER & KOBİ'LER İÇİN VERGİ VE AMORTİSMAN REHBERİ
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 14px' }}>
          Ticari Araç Alımında Şirketinizin Elde Ettiği Nakit & Vergi Avantajları
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
              💰 1. %20 KDV'nin Tamamını İndirim Konusu Yapma
            </div>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
              Binek araçların aksine, IVECO ticari araç (kamyonet, kamyon, çekici) faturasında yer alan KDV'nin tamamı, şirketinizin o ayki KDV beyannamesinde ödenecek KDV'den doğrudan mahsup edilir. Şirketinize anında net nakit avantajı sağlar.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#4ade80', marginBottom: '4px' }}>
              📉 2. 5 Yıl Boyunca %20 Yıllık Amortisman (Gider Yazma)
            </div>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
              Aracın KDV hariç bedelinin tamamı 5 yıl boyunca amortismana tabi tutularak şirket bilançonuzda gider gösterilir. Böylece kurumlar vergisi (veya gelir vergisi) matrahınız ciddi oranda düşer.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#fbbf24', marginBottom: '4px' }}>
              💳 3. Kredi Faizleri ve Masrafların Gider Gösterilmesi
            </div>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
              Ticari taşıt kredisinde ödenen faiz tutarları ve finansman giderleri şirketin finansman gideri olarak kaydedilir ve vergi matrahından düşülür.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#a78bfa', marginBottom: '4px' }}>
              🌿 4. 6 Aya Varan Ödemesiz Dönem (Katılım Finansmanı)
            </div>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
              Kuveyt Türk ve Vakıf Katılım anlaşmalarımızla aracınızı hemen teslim alıp işe başlatabilir, ilk 6 ay taksit ödemeden aracın kendi gelirini üretmesini sağlayabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
