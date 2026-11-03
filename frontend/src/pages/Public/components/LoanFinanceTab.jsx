import React, { useState, useMemo } from 'react';
import { 
  BANK_LIST, 
  EUR_LOAN_PRESETS, 
  EUR_PARTNER_BANKS, 
  calculateEurLoan,
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

  // EUR Kredi State'leri
  const [selectedEurBankId, setSelectedEurBankId] = useState('eximbank');
  const [selectedEurPresetId, setSelectedEurPresetId] = useState('eur_80k_36');
  const [customEurAmount, setCustomEurAmount] = useState(80000);
  const [customEurTerm, setCustomEurTerm] = useState(36);

  const activeBank = BANK_LIST.find(b => b.id === selectedBankId) || BANK_LIST[0];
  const activeEurBank = EUR_PARTNER_BANKS.find(b => b.id === selectedEurBankId) || EUR_PARTNER_BANKS[0];
  const activeEurPreset = EUR_LOAN_PRESETS.find(p => p.id === selectedEurPresetId) || EUR_LOAN_PRESETS[1];

  const dynamicEurCalc = useMemo(() => {
    return calculateEurLoan(customEurAmount, customEurTerm, 5.49);
  }, [customEurAmount, customEurTerm]);

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
    setCustomEurAmount(preset.principal);
    setCustomEurTerm(preset.term);
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
              ? '32 Sayılı Karar kapsamında döviz geliri olan ihracatçı ve uluslararası lojistik firmalarına Eximbank ve anlaşmalı bankalardan yıllık %4.50 - %6.00 arası düşük faizli Euro kredisi.'
              : 'Vergi levhalı işletmelere ve KOBİ\'lere özel 1.000.000 TL\'ye kadar %0 faiz; Daily için 2.000.000 TL, 72C & Eurocargo için 4.000.000 TL, S-Way & T-Way için 6.000.000 TL\'ye varan ticari krediler.'}
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
              Uluslararası taşımacılık (TIR/Lojistik), ihracat taahhüdü veya döviz geliri olan şirketler, Türk Parasını Koruma Kanunu (32 Sayılı Karar) uyarınca <strong>dövizle (Euro) borçlanma hakkına</strong> sahiptir. Yıllık %40-50+ seviyesindeki TL faizleri yerine, <strong>yıllık %4.50 - %6.00 gibi çok düşük Euro faiziyle</strong> S-Way Çekici ve T-Way araçlarını finanse edebilir, navlun/ihracat gelirleriyle kur riski yaşamadan ödeyebilirler.
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
                onClick={() => handleWhatsAppEurLoan(activeEurPreset.principal, activeEurPreset.term, activeEurPreset.monthly, activeEurBank.name)}
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

            {/* Popular Euro Packages */}
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase' }}>
              💡 S-WAY & T-WAY İÇİN EN ÇOK KULLANILAN EURO KREDİ PAKETLERİ
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              {EUR_LOAN_PRESETS.map((preset) => {
                const isSelected = selectedEurPresetId === preset.id;
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
                    <div style={{ fontSize: '0.72rem', color: '#fbbf24', margin: '4px 0', fontWeight: 700 }}>
                      🏷️ {preset.tag}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '8px' }}>
                      {preset.desc}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '8px' }}>
                      <span style={{ color: '#cbd5e1' }}>Aylık Taksit: <strong style={{ color: '#4ade80', fontSize: '0.98rem' }}>€{preset.monthly.toLocaleString('tr-TR')}</strong></span>
                      <span style={{ color: '#94a3b8' }}>Vade: <strong>{preset.term} Ay</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Euro Loan Calculator */}
            <div style={{
              marginTop: '18px',
              padding: '14px',
              background: 'rgba(2, 6, 23, 0.7)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#38bdf8' }}>📐 KENDİ EURO KREDİ PLANINIZI HESAPLAYIN:</span>
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    Tutar (€):
                    <input
                      type="number"
                      step="5000"
                      value={customEurAmount}
                      onChange={(e) => setCustomEurAmount(Number(e.target.value) || 0)}
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '6px',
                        color: '#fff',
                        padding: '4px 8px',
                        marginLeft: '6px',
                        width: '100px',
                        fontWeight: 700
                      }}
                    />
                  </label>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    Vade:
                    <select
                      value={customEurTerm}
                      onChange={(e) => setCustomEurTerm(Number(e.target.value))}
                      style={{
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '6px',
                        color: '#fff',
                        padding: '4px 8px',
                        marginLeft: '6px',
                        fontWeight: 700
                      }}
                    >
                      <option value={12}>12 Ay</option>
                      <option value={24}>24 Ay</option>
                      <option value={36}>36 Ay</option>
                      <option value={48}>48 Ay</option>
                    </select>
                  </label>
                </div>
              </div>

              {dynamicEurCalc && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Hesaplanan Aylık Taksit (%5.49 Yıllık):</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>
                    €{dynamicEurCalc.monthly.toLocaleString('tr-TR')} <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>/ ay</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    Toplam Geri Ödeme: €{dynamicEurCalc.total.toLocaleString('tr-TR')}
                  </div>
                </div>
              )}
            </div>
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
                        background: isSel ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'rgba(255, 255, 255, 0.05)',
                        border: isSel ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: isSel ? '#fff' : '#cbd5e1',
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
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'Tüm Kampanyalar' },
                  { id: 'zero', label: '💎 Sadece %0 Faizli Paketler' },
                  { id: 'grace', label: '⏳ 6 Ay Ödemesiz Paketler' }
                ].map(f => {
                  const isSel = campaignTypeFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setCampaignTypeFilter(f.id)}
                      style={{
                        background: isSel ? 'rgba(34, 197, 94, 0.25)' : 'transparent',
                        border: isSel ? '1px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: isSel ? '#4ade80' : '#94a3b8',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.70rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Real Bank Campaigns List from Excel */}
            {realCampaigns && realCampaigns.length > 0 && (
              <div style={{ marginBottom: '22px' }}>
                <div style={{ fontSize: '0.74rem', color: '#fbbf24', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>📋 {activeBank.name} RESMİ KAMPANYA PAKETLERİ ({realCampaigns.length} SEÇENEK)</span>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>Tüm rakamlar resmi banka tablolarından alınmıştır</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                  {realCampaigns.map((camp, idx) => {
                    const isZero = camp.rate === 0;
                    const isGrace = camp.gracePeriodMonths || camp.gracePeriod || (camp.title && camp.title.includes('Ödemesiz'));
                    return (
                      <div
                        key={camp.id || idx}
                        style={{
                          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
                          border: isZero ? '1px solid rgba(16, 185, 129, 0.4)' : (isGrace ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)'),
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
                            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc' }}>
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
                            <div style={{ fontSize: '0.70rem', color: '#94a3b8', marginBottom: '6px' }}>{camp.desc}</div>
                          )}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: 'rgba(2, 6, 23, 0.5)', padding: '8px', borderRadius: '8px', fontSize: '0.72rem' }}>
                            <div>
                              <div style={{ color: '#64748b' }}>Kredi Tutarı:</div>
                              <strong style={{ color: '#fff' }}>{(camp.principal || 0).toLocaleString('tr-TR')} TL</strong>
                            </div>
                            <div>
                              <div style={{ color: '#64748b' }}>Faiz / Kar Payı:</div>
                              <strong style={{ color: isZero ? '#4ade80' : '#38bdf8' }}>{camp.rateLabel || `%${camp.rate}`}</strong>
                            </div>
                            <div>
                              <div style={{ color: '#64748b' }}>Aylık Taksit:</div>
                              <strong style={{ color: '#4ade80', fontSize: '0.84rem' }}>{(camp.monthly || 0).toLocaleString('tr-TR')} TL</strong>
                            </div>
                            <div>
                              <div style={{ color: '#64748b' }}>Toplam Ödeme:</div>
                              <strong style={{ color: '#cbd5e1' }}>{(camp.total || (camp.monthly * camp.term) || 0).toLocaleString('tr-TR')} TL</strong>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (onDirectWhatsApp) {
                              const msg = `Merhaba ${salesRep?.name || 'Can Murat Bey'}, IVECO portalından *${activeBank.name}* bünyesindeki *${camp.title || (camp.principal + ' TL')}* kampanyası (Aylık ${(camp.monthly || 0).toLocaleString('tr-TR')} TL) için ön onay ve başvuru şartlarını öğrenmek istiyorum.`;
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
                Bu banka için seçili araç grubunda resmi kampanya tablosu bulunmuyor. Size özel teklif için satış temsilcimizle iletişime geçin.
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
