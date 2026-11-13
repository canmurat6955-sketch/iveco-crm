import React, { useState, useMemo } from 'react';
import { 
  BANK_LIST, 
  EUR_LOAN_PRESETS, 
  EUR_PARTNER_BANKS, 
  getCampaignsForVehicleAndBank,
  HEAVY_CAMPAIGNS
} from '../../../data/bankCampaigns';
import { FiDollarSign, FiCheckCircle, FiShield, FiPercent, FiMessageSquare, FiGlobe } from 'react-icons/fi';

// Not: Kaynaksız "hızlı kredi paketi" örnekleri kaldırıldı; yalnızca resmi banka tablolarındaki kampanyalar gösterilir.

export default function LoanFinanceTab({ onDirectWhatsApp, salesRep }) {
  // Para Birimi Modu: 'TRY' veya 'EUR'
  const [currencyMode, setCurrencyMode] = useState('TRY');

  // TL Kredi State'leri
  const [selectedBankId, setSelectedBankId] = useState('teb_cetelem');
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [loanTerm, setLoanTerm] = useState(12);

  // Araç Sınıfı & Kampanya Tipi Filtreleri (Excel Entegrasyonu)
  const [selectedVehicleCategory, setSelectedVehicleCategory] = useState('daily35');
  const [campaignTypeFilter, setCampaignTypeFilter] = useState('all'); // 'all', 'zero', 'grace'

  // EUR Kredi State'leri — paketler doğrudan banka Excel tablolarından (varsayılan: Kuveyt Türk)
  const [selectedEurBankId, setSelectedEurBankId] = useState('kuveyt_turk');
  const [selectedEurPresetId, setSelectedEurPresetId] = useState(null);
  const [eurTypeFilter, setEurTypeFilter] = useState('all'); // 'all' | 'zero' | 'grace' | 'equal'

  const activeBank = BANK_LIST.find(b => b.id === selectedBankId) || BANK_LIST[0];
  const activeEurBank = EUR_PARTNER_BANKS.find(b => b.id === selectedEurBankId) || EUR_PARTNER_BANKS[0];

  const eurPackages = useMemo(() => {
    let list = EUR_LOAN_PRESETS.filter(p => p.bankId === activeEurBank.id);
    if (eurTypeFilter === 'zero') list = list.filter(p => p.rate === 0);
    else if (eurTypeFilter === 'grace') list = list.filter(p => p.gracePeriodMonths);
    else if (eurTypeFilter === 'equal') list = list.filter(p => !p.gracePeriodMonths && p.rate !== 0);
    return list;
  }, [activeEurBank.id, eurTypeFilter]);

  const activeEurPreset = eurPackages.find(p => p.id === selectedEurPresetId) || eurPackages[0] || null;

  // Seçili banka ve araç grubuna ait resmi Excel kampanyaları
  const realCampaigns = useMemo(() => {
    const res = getCampaignsForVehicleAndBank(selectedVehicleCategory, selectedBankId);
    let list = res.campaigns || [];
    if (campaignTypeFilter === 'zero') {
      list = list.filter(c => c.rate === 0);
    } else if (campaignTypeFilter === 'grace') {
      list = list.filter(c => c.gracePeriodMonths || c.gracePeriod || (c.title && c.title.toLowerCase().includes('ödemesiz')) || (c.desc && c.desc.toLowerCase().includes('ödemesiz')));
    }
    return list;
  }, [selectedVehicleCategory, selectedBankId, campaignTypeFilter]);

  const handleApplyPreset = (preset) => {
    setLoanAmount(preset.amount);
    setLoanTerm(preset.term);
  };

  const handleApplyEurPreset = (preset) => {
    setSelectedEurPresetId(preset.id);
  };

  const handleWhatsAppLoan = () => {
    if (onDirectWhatsApp) {
      const msg = `Merhaba ${salesRep?.name || 'Can Murat Bey'}, IVECO ERC Samsun finansman portalından *${activeBank.name}* için *${loanAmount.toLocaleString('tr-TR')} TL* tutarında *${loanTerm} Ay Vadeli* ticari kredi imkanları ve şirketimize özel ön onay şartları hakkında bilgi almak istiyorum.`;
      onDirectWhatsApp(msg);
    }
  };

  const handleWhatsAppEurLoan = (amount, term, monthly, bankName) => {
    if (onDirectWhatsApp) {
      const msg = `Merhaba ${salesRep?.name || 'Can Murat Bey'}, şirketimiz ihracat/döviz gelirine sahip olup (32 Sayılı Karar kapsamında), *${bankName || activeEurBank.name}* üzerinden *€${amount.toLocaleString('tr-TR')}* tutarında *${term} Ay Vadeli* (Aylık Yaklaşık €${monthly.toLocaleString('tr-TR')}) İhracatçı Euro Taşıt Kredisi imkanları hakkında detaylı bilgi ve ön onay talep ediyoruz.`;
      onDirectWhatsApp(msg);
    }
  };

  return (
    <div style={{ color: '#f8fafc' }}>
      {/* Tab Banner */}
      <div style={{
        background: currencyMode === 'EUR' 
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(15, 23, 42, 0.85) 100%)'
          : 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(15, 23, 42, 0.7) 100%)',
        border: currencyMode === 'EUR' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.35)',
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
          <div style={{ 
            fontSize: '0.72rem', 
            color: currencyMode === 'EUR' ? '#34d399' : '#fbbf24', 
            fontWeight: 800, 
            textTransform: 'uppercase', 
            letterSpacing: '0.8px' 
          }}>
            {currencyMode === 'EUR' 
              ? '🇪🇺 İHRACATÇI & ULUSLARARASI NAKLİYEYE ÖZEL DÖVİZ KREDİSİ' 
              : '🇹🇷 RESMİ ANLAŞMALI BANKALAR & %0 FAİZ'}
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 2px', color: '#fff' }}>
            {currencyMode === 'EUR' 
              ? 'S-Way & T-Way İhracatçı Euro (EUR) Kredisi' 
              : 'IVECO Ticari Finansman & Kredi Çözümleri'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            {currencyMode === 'EUR'
              ? '32 Sayılı Karar kapsamında döviz geliri olan ihracatçı ve uluslararası lojistik firmalarına Kuveyt Türk, Garanti BBVA ve BNP Paribas resmi kampanya tablolarından Euro finansman: Kuveyt Türk\'te 24 aya kadar %0 kâr payı, 6 ay ödemesiz dönem ve 60 aya kadar eşit taksit seçenekleri.'
              : 'Vergi levhalı işletmelere ve KOBİ\'lere özel 800.000 TL - 1.500.000 TL arası %0 faiz; Daily için 2.000.000 TL, 72C & Eurocargo için 4.000.000 TL, S-Way & T-Way için 6.000.000 TL\'ye varan ticari krediler.'}
          </p>
        </div>
        <div style={{
          background: currencyMode === 'EUR' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(34, 197, 94, 0.15)',
          border: currencyMode === 'EUR' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(34, 197, 94, 0.4)',
          borderRadius: '12px',
          padding: '8px 14px',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.70rem', color: currencyMode === 'EUR' ? '#38bdf8' : '#4ade80', fontWeight: 700 }}>
            {currencyMode === 'EUR' ? '🛡️ 32 SAYILI KARAR' : '⚡ 1 SAATTE ÖN ONAY'}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 800 }}>
            {currencyMode === 'EUR' ? 'Döviz Gelirine Özel Düşük Faiz' : 'Kefilsiz & Hızlı Başvuru'}
          </div>
        </div>
      </div>

      {/* Currency Switcher: TL vs EUR Toggle */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        background: 'rgba(15, 23, 42, 0.8)',
        padding: '6px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        width: 'fit-content',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => setCurrencyMode('TRY')}
          style={{
            background: currencyMode === 'TRY' ? '#0284c7' : 'transparent',
            color: currencyMode === 'TRY' ? '#fff' : '#94a3b8',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          <span>🇹🇷</span> TL Ticari Krediler & %0 Faiz
        </button>

        <button
          type="button"
          onClick={() => setCurrencyMode('EUR')}
          style={{
            background: currencyMode === 'EUR' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
            color: currencyMode === 'EUR' ? '#fff' : '#94a3b8',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          <span>💶</span> İhracatçıya Özel Euro (EUR) Kredisi
          <span style={{ fontSize: '0.66rem', background: '#f59e0b', color: '#000', padding: '1px 6px', borderRadius: '4px', fontWeight: 900 }}>
            Düşük Faiz
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. SEÇENEK: İHRACATÇI EURO KREDİLERİ (EUR MODE)          */}
      {/* ======================================================== */}
      {currencyMode === 'EUR' ? (
        <div>
          {/* Legislative Warning & Benefit Box */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <span style={{ fontSize: '1.4rem' }}>🇪🇺</span>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              <strong style={{ color: '#4ade80' }}>İhracatçı Firmalar İçin Euro Kredisi Neden Çok Büyük Avantajdır?</strong><br />
              Uluslararası taşımacılık (TIR/Lojistik), ihracat taahhüdü veya döviz geliri olan şirketler, Türk Parasını Koruma Kanunu (32 Sayılı Karar) uyarınca <strong>dövizle (Euro) borçlanma hakkına</strong> sahiptir. Örneğin Kuveyt Türk'te <strong>€80.000 için 24 aya kadar, €90.000 - €110.000 için 12 aya kadar %0 kâr payı</strong> ve 6 ay ödemesiz dönem; Garanti BBVA ve BNP Paribas'ta ise <strong>60 aya kadar çok düşük faizli sabit Euro taksit</strong> imkanı vardır.
            </div>
          </div>

          {/* Euro Partner Financial Institutions */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ fontSize: '0.76rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
              🏛️ ANLAŞMALI EURO FİNANSMAN KURUMLARI
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
              {EUR_PARTNER_BANKS.map(bank => {
                const isSelected = selectedEurBankId === bank.id;
                return (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => setSelectedEurBankId(bank.id)}
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.35) 0%, rgba(15, 23, 42, 0.9) 100%)' : 'rgba(15, 23, 42, 0.65)',
                      border: isSelected ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#fff',
                      boxShadow: isSelected ? '0 4px 16px rgba(16, 185, 129, 0.35)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{bank.icon}</span>
                      <span style={{
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#4ade80',
                        padding: '2px 6px',
                        borderRadius: '6px'
                      }}>
                        {bank.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#f8fafc' }}>
                      {bank.name}
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#94a3b8', marginTop: '4px', lineHeight: 1.3 }}>
                      {bank.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Euro Loan Presets Grid */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '22px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '1.4rem', marginRight: '6px' }}>{activeEurBank.icon}</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>{activeEurBank.name} — İhracatçı Euro Paketleri</span>
                <div style={{ fontSize: '0.76rem', color: '#4ade80', marginTop: '2px' }}>{activeEurBank.desc}</div>
              </div>

              <button
                type="button"
                onClick={() => activeEurPreset && handleWhatsAppEurLoan(activeEurPreset.principal, activeEurPreset.term, activeEurPreset.monthly, activeEurBank.name)}
                style={{
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '9px 18px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FiMessageSquare size={14} /> Bu Euro Paketi İçin Ön Başvuru Yap
              </button>
            </div>

            {/* Bank Euro Packages (resmi banka tablosu) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                📋 {activeEurBank.shortName} RESMİ EURO PAKETLERİ ({eurPackages.length} SEÇENEK) — S-WAY & T-WAY
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[['all', 'Tümü'], ['zero', '%0 Faiz / Kâr Payı'], ['grace', '6 Ay Ödemesiz'], ['equal', 'Eşit Taksit']].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setEurTypeFilter(key); setSelectedEurPresetId(null); }}
                    style={{
                      background: eurTypeFilter === key ? '#10b981' : 'rgba(255,255,255,0.05)',
                      color: eurTypeFilter === key ? '#fff' : '#cbd5e1',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {eurPackages.length === 0 && (
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '12px', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '10px', marginBottom: '10px' }}>
                Bu bankada seçili tipte Euro paketi yok. Diğer filtreleri deneyin veya satış temsilcimize danışın.
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              {eurPackages.map((preset) => {
                const isSelected = activeEurPreset?.id === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleApplyEurPreset(preset)}
                    style={{
                      background: isSelected ? 'rgba(16, 185, 129, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                      border: isSelected ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.94rem', fontWeight: 900, color: '#fff' }}>€{preset.principal.toLocaleString('tr-TR')}</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>
                        {preset.rateLabel}
                      </span>
                    </div>
                    {preset.tag && (
                      <div style={{ fontSize: '0.72rem', color: '#fbbf24', margin: '4px 0', fontWeight: 700 }}>
                        🏷️ {preset.tag}
                      </div>
                    )}
                    <div style={{ fontSize: '0.74rem', color: '#e2e8f0', margin: '4px 0', fontWeight: 600 }}>
                      {preset.title}
                    </div>
                    {preset.desc && (
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '8px' }}>
                        {preset.desc}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '8px' }}>
                      <span style={{ color: '#cbd5e1' }}>Aylık Taksit: <strong style={{ color: '#4ade80', fontSize: '0.98rem' }}>€{preset.monthly.toLocaleString('tr-TR')}</strong></span>
                      <span style={{ color: '#94a3b8' }}>Vade: <strong>{preset.term} Ay</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Seçili paket özeti — tüm rakamlar banka tablosundan, formülle hesaplanmaz */}
            {activeEurPreset && (
              <div style={{
                marginTop: '18px',
                padding: '14px',
                background: 'rgba(18, 34, 60, 0.85)',
                borderRadius: '10px',
                border: '1px solid rgba(16, 185, 129, 0.42)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                fontSize: '0.76rem'
              }}>
                <div><div style={{ color: '#cbd5e1', fontWeight: 600 }}>Seçili Paket</div><strong style={{ color: '#fff' }}>{activeEurPreset.title}</strong></div>
                <div><div style={{ color: '#cbd5e1', fontWeight: 600 }}>Aylık Taksit</div><strong style={{ color: '#10b981', fontSize: '1.1rem' }}>€{activeEurPreset.monthly.toLocaleString('tr-TR')}</strong></div>
                <div><div style={{ color: '#cbd5e1', fontWeight: 600 }}>Toplam Geri Ödeme</div><strong style={{ color: '#f1f5f9' }}>€{activeEurPreset.total.toLocaleString('tr-TR')}</strong></div>
                <div><div style={{ color: '#cbd5e1', fontWeight: 600 }}>Oran</div><strong style={{ color: '#38bdf8' }}>{activeEurPreset.rateLabel}</strong></div>
                <div style={{ gridColumn: '1 / -1', fontSize: '0.70rem', color: '#94a3b8' }}>
                  Rakamlar {activeEurBank.name} resmi kampanya tablosundan alınmıştır. Kesin ödeme planı banka onayıyla netleşir.
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* 2. SEÇENEK: TL TİCARİ KREDİLER (TRY MODE)                */
        /* ======================================================== */
        <div>
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
                      background: isSelected ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.45) 0%, rgba(28, 48, 80, 0.92) 100%)' : 'rgba(30, 52, 86, 0.82)',
                      border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(148, 163, 184, 0.25)',
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
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
                      {bank.name}
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.3 }}>
                      {bank.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Bank Highlight & Presets */}
          <div style={{
            background: 'rgba(26, 44, 74, 0.92)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '22px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '1.4rem', marginRight: '6px' }}>{activeBank.icon}</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>{activeBank.name} Kampanyaları</span>
                <div style={{ fontSize: '0.76rem', color: '#7dd3fc', marginTop: '2px' }}>{activeBank.description}</div>
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

            {/* Vehicle Segment & Campaign Type Filters */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🎯 ARAÇ SEGMENTİ SEÇİN:</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {[
                  { id: 'daily35', label: '🚚 Daily 35 (Maks 2M TL)' },
                  { id: 'daily70', label: '🚛 72C / Daily 70 (Maks 4M TL)' },
                  { id: 'eurocargo', label: '📦 Eurocargo (Maks 4M TL)' },
                  { id: 'heavy', label: '🏗️ S-Way & T-Way (6M TL Filo)' }
                ].map(cat => {
                  const isSel = selectedVehicleCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedVehicleCategory(cat.id)}
                      style={{
                        background: isSel ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'rgba(35, 58, 94, 0.85)',
                        border: isSel ? '1px solid #38bdf8' : '1px solid rgba(148, 163, 184, 0.25)',
                        color: isSel ? '#fff' : '#e2e8f0',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Campaign Type Pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {[
                  { id: 'all', label: '📋 Tüm Kampanyalar' },
                  { id: 'zero', label: '💎 Sadece %0 Faizli Paketler' },
                  { id: 'grace', label: '⏳ Şimdi Al, 6 Ay Sonra Öde (Ödemesiz Dönem)' }
                ].map(f => {
                  const isSel = campaignTypeFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setCampaignTypeFilter(f.id)}
                      style={{
                        background: isSel ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'rgba(35, 58, 94, 0.85)',
                        border: isSel ? '1.5px solid #4ade80' : '1px solid rgba(148, 163, 184, 0.28)',
                        color: '#ffffff',
                        padding: '7px 12px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              {/* Takas Peşinat Destek Kutusu */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(15, 28, 50, 0.85) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ fontSize: '0.76rem', color: '#fde68a', fontWeight: 700 }}>
                  🔄 <strong>Nakit Peşinatınız Yok mu?</strong> Mevcut aracınızın <strong>4 resmini (1 dışarıdan, 1 içeriden, KM ve ruhsat)</strong> göndererek takas peşinatına saydırıp kalan tutara kredi kullanabilirsiniz.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onDirectWhatsApp) {
                      const msg =
                        `Merhaba ${salesRep?.name || 'Can Murat Bey'}, mevcut ticari aracımı takasa vererek peşinat saydırmak ve kalan tutar için *${activeBank.name}* üzerinden ticari kredi kullanmak istiyorum.\n\n` +
                        `📸 *Takas Ön Ekspertiz İçin Gerekli 4 Resim:*\n` +
                        `1️⃣ Dışarıdan Görünüm Resmi (1 Adet)\n` +
                        `2️⃣ İçeriden Kabin Resmi (1 Adet)\n` +
                        `3️⃣ Kilometre (KM) Kadran Resmi (1 Adet)\n` +
                        `4️⃣ Araç Ruhsat Resmi (1 Adet)\n\n` +
                        `Takas değerleme ve kredi ödeme planı hakkında bilgi alabilir miyim?`;
                      onDirectWhatsApp(msg);
                    }
                  }}
                  style={{
                    background: '#f59e0b',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.74rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  🔄 4 Resimle Takas + Kredi İste
                </button>
              </div>
            </div>

            {/* Real Bank Campaigns List from Excel */}
            {realCampaigns && realCampaigns.length > 0 && (
              <div style={{ marginBottom: '22px' }}>
                <div style={{ fontSize: '0.74rem', color: '#fbbf24', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>📋 {activeBank.name} RESMİ KAMPANYA PAKETLERİ ({realCampaigns.length} SEÇENEK)</span>
                  <span style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: 600 }}>Tüm rakamlar resmi banka tablolarından alınmıştır</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                  {realCampaigns.map((camp, idx) => {
                    const isZero = camp.rate === 0;
                    const isGrace = camp.gracePeriodMonths || camp.gracePeriod || (camp.title && camp.title.includes('Ödemesiz'));
                    return (
                      <div
                        key={camp.id || idx}
                        style={{
                          background: 'linear-gradient(135deg, rgba(35, 58, 94, 0.9) 0%, rgba(25, 43, 72, 0.92) 100%)',
                          border: isZero ? '1px solid rgba(16, 185, 129, 0.45)' : (isGrace ? '1px solid rgba(245, 158, 11, 0.45)' : '1px solid rgba(148, 163, 184, 0.24)'),
                          borderRadius: '12px',
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '8px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#ffffff' }}>
                              {camp.title || `${(camp.principal || 0).toLocaleString('tr-TR')} TL — ${camp.term} Ay`}
                            </span>
                            {camp.tag && (
                              <span style={{
                                fontSize: '0.64rem',
                                fontWeight: 800,
                                background: isZero ? '#10b981' : (isGrace ? '#f59e0b' : '#0284c7'),
                                color: isZero || !isGrace ? '#fff' : '#000',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                whiteSpace: 'nowrap'
                              }}>
                                {camp.tag}
                              </span>
                            )}
                          </div>
                          {camp.desc && (
                            <div style={{ fontSize: '0.70rem', color: '#cbd5e1', marginBottom: '6px' }}>{camp.desc}</div>
                          )}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: 'rgba(15, 28, 50, 0.6)', border: '1px solid rgba(148, 163, 184, 0.16)', padding: '8px', borderRadius: '8px', fontSize: '0.72rem' }}>
                            <div>
                              <div style={{ color: '#cbd5e1', fontWeight: 600 }}>Kredi Tutarı:</div>
                              <strong style={{ color: '#fff' }}>{(camp.principal || 0).toLocaleString('tr-TR')} TL</strong>
                            </div>
                            <div>
                              <div style={{ color: '#cbd5e1', fontWeight: 600 }}>Faiz / Kar Payı:</div>
                              <strong style={{ color: isZero ? '#4ade80' : '#38bdf8' }}>{camp.rateLabel || `%${camp.rate}`}</strong>
                            </div>
                            <div>
                              <div style={{ color: '#cbd5e1', fontWeight: 600 }}>Aylık Taksit:</div>
                              <strong style={{ color: '#4ade80', fontSize: '0.84rem' }}>{(camp.monthly || 0).toLocaleString('tr-TR')} TL</strong>
                            </div>
                            <div>
                              <div style={{ color: '#cbd5e1', fontWeight: 600 }}>Toplam Ödeme:</div>
                              <strong style={{ color: '#f1f5f9' }}>{(camp.total || (camp.monthly * camp.term) || 0).toLocaleString('tr-TR')} TL</strong>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.67rem', color: '#7dd3fc', fontWeight: 700, marginTop: '6px' }}>
                            👤 Not: Satış Sorumlusu Can Murat • 0544 622 59 31
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (onDirectWhatsApp) {
                              const msg = `Merhaba ${salesRep?.name || 'Satış Sorumlusu Can Murat'}, IVECO portalından *${activeBank.name}* bünyesindeki *${camp.title || (camp.principal + ' TL')}* kampanyası (Aylık ${(camp.monthly || 0).toLocaleString('tr-TR')} TL) için ön onay ve başvuru şartlarını öğrenmek istiyorum.`;
                              onDirectWhatsApp(msg);
                            }
                          }}
                          style={{
                            background: 'rgba(34, 197, 94, 0.15)',
                            border: '1px solid rgba(34, 197, 94, 0.35)',
                            color: '#4ade80',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            width: '100%',
                            transition: 'all 0.15s'
                          }}
                        >
                          <FiMessageSquare size={13} /> Bu Paketle WhatsApp'tan Başvur
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {realCampaigns.length === 0 && (
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '14px', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '10px' }}>
                Bu banka için seçili araç grubunda resmi kampanya tablosu bulunmuyor. Size özel teklif için Satış Sorumlusu Can Murat (0544 622 59 31) ile iletişime geçin.
              </div>
            )}
          </div>
        </div>
      )}

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

          <div style={{ background: 'rgba(16, 185, 129, 0.06)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#34d399', marginBottom: '4px' }}>
              🇪🇺 5. İhracatçılar İçin Düşük Faizli Euro Kredisi & Kur Koruması
            </div>
            <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: 0, lineHeight: 1.45 }}>
              Döviz kazandırıcı faaliyeti olan lojistik ve ihracat şirketleri, 32 Sayılı Karar kapsamında yıllık %4.50 - %6.00 arası çok düşük Euro faiziyle kredi kullanarak navlun gelirleriyle taksitlerini döviz olarak kur riski olmadan doğrudan ödeyebilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
