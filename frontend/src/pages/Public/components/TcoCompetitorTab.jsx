import React, { useState } from 'react';
import { 
  FiCheck, FiX, FiAlertTriangle, FiDollarSign, FiShield, 
  FiTruck, FiTool, FiTrendingDown, FiMessageSquare, FiInfo, FiLayers 
} from 'react-icons/fi';

export default function TcoCompetitorTab({ onDirectWhatsApp, salesRep }) {
  const [activeSubTab, setActiveSubTab] = useState('daily_my26');

  const handleConsultantQuote = (topic) => {
    if (onDirectWhatsApp) {
      const msg = `Merhaba ${salesRep?.name || 'Can Murat Bey'}, TCO & Rakip Karşılaştırma analizinizdeki *${topic}* hakkında detaylı bilgi ve işletmemize özel filo tasarruf simülasyonu talep ediyorum.`;
      onDirectWhatsApp(msg);
    }
  };

  return (
    <div style={{ color: '#f8fafc' }}>
      {/* Tab Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0, 75, 147, 0.35) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        borderRadius: '16px',
        padding: '20px 22px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: '0 8px 30px rgba(0, 75, 147, 0.25)'
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            RESMİ KATALOG VERİLERİ & TOPLAM SAHİP OLMA MALİYETİ (TCO)
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '4px 0 3px', color: '#fff' }}>
            Neden IVECO? Rakip Karşılaştırma & TCO Analizi
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, maxWidth: '680px', lineHeight: 1.45 }}>
            Araç satın alma bedeli buzdağının sadece görünen kısmıdır. Resmi bakım periyotları, çelik zincirli motor ömrü, tork konvertörlü ZF şanzıman, 3 parçalı modüler tampon ve yasal istiap kapasitesiyle IVECO'nun sunduğu gerçek maliyet avantajlarını inceleyin.
          </p>
        </div>
        <div style={{
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.4)',
          borderRadius: '12px',
          padding: '10px 16px',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.70rem', color: '#4ade80', fontWeight: 700 }}>📉 5 YILLIK TCO AVANTAJI</div>
          <div style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 800 }}>Doğrulanmış Resmi Verilerle Tasarruf</div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '20px',
        background: 'rgba(15, 23, 42, 0.7)',
        padding: '6px',
        borderRadius: '25px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {[
          { id: 'daily_my26', label: 'Hafif Ticari (Daily MY26 vs F. & Rakipler)', icon: '🚐' },
          { id: 'eurocargo_15t', label: '15T Orta Ağır (Eurocargo vs M. 1518)', icon: '🚛' },
          { id: 'eurocargo_10t', label: '10T Dağıtım (Eurocargo vs 10T Rakip)', icon: '🚚' },
          { id: 'sway_heavy', label: 'Çekici & Ağır Vasıta (S-Way vs F-MAX & Actros)', icon: '🛣️' },
          { id: 'market_feedback', label: 'Piyasa & Kullanıcı Geri Dönüşleri', icon: '💬' }
        ].map((sub) => {
          const isActive = activeSubTab === sub.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setActiveSubTab(sub.id)}
              style={{
                flex: '1 1 180px',
                background: isActive ? 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)' : 'transparent',
                color: isActive ? '#fff' : '#cbd5e1',
                border: isActive ? '1px solid #38bdf8' : '1px solid transparent',
                borderRadius: '20px',
                padding: '8px 14px',
                fontSize: '0.78rem',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <span>{sub.icon}</span>
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── BÖLÜM 1: 15T EUROCARGO VS M. ── */}
      {activeSubTab === 'eurocargo_15t' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Highlight Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>⚙️ ŞANZIMAN & BASKI-BALATA</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>ZF 8AP Tam Otomatik</div>
              <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                Tork konvertörlüdür, kuru kavrama baskı-balata <strong>YOKTUR</strong>. Rakip M.'nin 6 ileri PowerShift robotize şanzımanındaki gibi balata aşınması ve 65.000 TL+ değişim maliyeti sıfırdır.
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>⚖️ NET YÜK KAPASİTESİ</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>+163 kg Daha Fazla İstiap</div>
              <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                Eurocargo 4.519 kg boş ağırlığı ile rakip M. 1518'den (4.682 kg) 163 kg daha hafiftir. Her seferde 10.481 kg net yük taşıyarak karayolları kantarında kazandırır.
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700 }}>🔄 ŞEHİR İÇİ MANEVRA</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>88 cm Daha Dar Dönüş</div>
              <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                Daha uzun dingil mesafesine (4.185 mm) sahip olmasına rağmen 14.72 m dönüş çapı ile M.'den (15.60 m) dar sokaklarda çok daha kıvraktır.
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 700 }}>🐎 HI-SCR (EGR'SİZ) & 210 HP</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>210 HP • 750 Nm • 40.000 km Bakım</div>
              <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                Eurocargo 4.5L Tector 5 motor 210 HP üretirken M. 5.1L 177 HP'de kalır. EGR valfi içermeyen HI-SCR teknolojisi ile kurum tıkanması yaşatmaz.
              </p>
            </div>
          </div>

          {/* Comparison Table */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '14px 18px',
              background: 'rgba(2, 132, 199, 0.15)',
              borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>
                <span style={{ fontSize: '0.70rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>RESMİ KATALOG VERİLERİ (PTC 2026 MDT)</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                  15T Eurocargo MLC 150 E 21 vs 15T Rakip M. (Atego 1518 / 42)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleConsultantQuote('15T Eurocargo vs M. Karşılaştırması')}
                style={{
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FiMessageSquare size={13} /> Eurocargo Teklifi Al
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(15, 28, 50, 0.85)', borderBottom: '1px solid rgba(255, 255, 255, 0.16)' }}>
                    <th style={{ padding: '12px 16px', color: '#f1f5f9', fontWeight: 800, width: '22%' }}>Özellik / Parametre</th>
                    <th style={{ padding: '12px 16px', color: '#38bdf8', fontWeight: 800, width: '28%', background: 'rgba(2, 132, 199, 0.16)' }}>
                      IVECO Eurocargo MLC 150 E 21
                    </th>
                    <th style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 800, width: '24%' }}>
                      Rakip M. 1518 / 42
                    </th>
                    <th style={{ padding: '12px 16px', color: '#4ade80', fontWeight: 800, width: '26%' }}>
                      TCO & İşletme Avantajı
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      feature: 'Şanzıman Tipi',
                      iveco: 'Full Otomatik (8 İleri ZF 8AP Tork Konvertörlü)',
                      competitor: 'Otomatikleştirilmiş / Robotize (6 İleri PowerShift 3)',
                      advantage: 'Kuru kavrama baskı-balata yok! Balata aşınması ve 65.000 TL+ değişim maliyeti sıfır.',
                      highlight: true
                    },
                    {
                      feature: 'Motor Gücü, Tork & Hacim',
                      iveco: '210 HP • 750 Nm Tork • 4.5L FPT Tector 5',
                      competitor: '177 HP • 750 Nm Tork • 5.1L OM934',
                      advantage: '+33 HP daha yüksek beygir gücü. Düşük motor hacmiyle %8-12 yakıt tasarrufu.',
                      highlight: true
                    },
                    {
                      feature: 'Emisyon Teknolojisi (EGR / DPF)',
                      iveco: 'HI-SCR (EGR Valfi Yok - Saf SCR Sistemi)',
                      competitor: 'EGR + SCR + DPF',
                      advantage: 'EGR olmadığı için motora kurum dönmez; şehir içi dağıtımda DPF tıkanması ve rejenerasyon duruşu yaşanmaz.',
                      highlight: true
                    },
                    {
                      feature: 'Periyodik Bakım Aralığı',
                      iveco: '40.000 km / 1 Yıl (800 Saat)',
                      competitor: '30.000 - 40.000 km (Ağır Hizmette 20.000-30.000 km)',
                      advantage: 'Uzun bakım periyodu ve M. Servis A/B faturalarına kıyasla %35 daha ekonomik yetkili servis maliyeti.',
                      highlight: true
                    },
                    {
                      feature: 'Yük Kapasitesi (İstiap)',
                      iveco: '10.481 kg Net Yük Kapasitesi',
                      competitor: '10.318 kg Net Yük Kapasitesi',
                      advantage: '+163 kg daha fazla net yük. Yılda tonlarca ilave navlun geliri.',
                      highlight: true
                    },
                    {
                      feature: 'Boş Ağırlık (Şasi)',
                      iveco: '4.519 kg (Hafif ve Dayanıklı Şasi)',
                      competitor: '4.682 kg',
                      advantage: '163 kg daha hafif şasi = Daha az yakıt ve daha çok yük imkanı.',
                      highlight: false
                    },
                    {
                      feature: 'Dönüş Çapı (Manevra)',
                      iveco: '14.720 mm (Kaldırımdan Kaldırıma)',
                      competitor: '15.600 mm',
                      advantage: '88 cm daha dar alanda döner. Şehir içi dağıtımda sıfır manevra zorluğu.',
                      highlight: true
                    },
                    {
                      feature: 'Dingil Mesafesi',
                      iveco: '4.185 mm',
                      competitor: '4.160 mm',
                      advantage: 'Daha dengeli yük dağılımı ve karoseri uyumu.',
                      highlight: false
                    },
                    {
                      feature: 'Ön Aks Kapasitesi',
                      iveco: '5.3 Ton (Ağır Hizmet Aksı)',
                      competitor: '5.1 Ton',
                      advantage: 'Önde +200 kg daha yüksek taşıma ve vinç/kar küreme dayanımı.',
                      highlight: false
                    },
                    {
                      feature: 'Arka Aks Kapasitesi',
                      iveco: '10.7 Ton',
                      competitor: '10.5 Ton',
                      advantage: 'Arkada +200 kg daha yüksek yük taşıma mukavemeti.',
                      highlight: false
                    },
                    {
                      feature: 'Yakıt Tankı Kapasitesi',
                      iveco: '200 Litre',
                      competitor: '120 Litre',
                      advantage: '+80 Litre yakıt kapasitesi. Şehirlerarası yolda istasyon arama derdi yok.',
                      highlight: false
                    },
                    {
                      feature: 'Kabin Genişliği',
                      iveco: '2.40 m',
                      competitor: '2.30 m',
                      advantage: '+10 cm daha geniş yaşam alanı, çift kişilik rahat oturma.',
                      highlight: false
                    },
                    {
                      feature: 'Dijital Kadran & Multimedya',
                      iveco: '10" Tam Renkli Dijital Kadran + 7" Multimedya',
                      competitor: '5" Küçük Ekran / Opsiyonel Radyo',
                      advantage: 'Standart Apple CarPlay & Android Auto, tüm telematik ve filo verileri göz önünde.',
                      highlight: true
                    }
                  ].map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        background: row.highlight ? 'rgba(2, 132, 199, 0.08)' : (idx % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'transparent')
                      }}
                    >
                      <td style={{ padding: '12px 16px', color: '#f8fafc', fontWeight: 700 }}>
                        {row.feature}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#38bdf8', fontWeight: 800, background: 'rgba(2, 132, 199, 0.1)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <FiCheck color="#38bdf8" /> {row.iveco}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 600 }}>
                        {row.competitor}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#4ade80', fontWeight: 600 }}>
                        {row.advantage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── BÖLÜM 2: 10T EUROCARGO VS 10T RAKİP ── */}
      {activeSubTab === 'eurocargo_10t' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Highlight Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>🔧 PERİYODİK BAKIM ARALIĞI</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>40.000 km vs 20.000 km</div>
              <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                10T rakip kamyonlar (NPR 10 vb.) her 20.000 km'de servise girmek zorundayken, Eurocargo 40.000 km veya 800 saatte bir servise girer. <strong>Servis ziyareti yarı yarıya düşer!</strong>
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>⚡ TORK & ÇEKİŞ GÜCÜ</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>680 Nm Tork (+170 Nm Fark)</div>
              <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                Rakibin 5.2L motordan ürettiği 510 Nm torka karşılık Eurocargo 4.5L FPT motorla 680 Nm tork üretir. Yüklüyken dik rampalarda bayılmaz ve daha az yakar.
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700 }}>🎯 DİFERANSİYEL & OTOYOL SEYRİ</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>3.73 Seri Arka Aks Oranı</div>
              <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                Rakibin 4.78 oranına kıyasla Eurocargo seri diferansiyeli sayesinde 90 km/s hızda düşük devirde akar, motor bağırmaz, yakıt tasarrufu sağlar.
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 700 }}>🔄 KIVRAKLIK & DÖNÜŞ ÇAPI</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>1.07 Metre Daha Dar Dönüş</div>
              <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                Eurocargo 14.20 m duvardan duvara dönüş çapı ile dar sokak aralarında rakip kamyonların geri manevra yapmak zorunda kaldığı yerlerden tek hamlede döner.
              </p>
            </div>
          </div>

          {/* Comparison Table */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '14px 18px',
              background: 'rgba(2, 132, 199, 0.15)',
              borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>
                <span style={{ fontSize: '0.70rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>RESMİ KATALOG VERİLERİ (PTC 2026 MDT)</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                  10T Eurocargo MLC 100 E 19 vs 10T Rakip Kamyon (NPR 10 Sınıfı)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleConsultantQuote('10T Eurocargo vs Rakip Karşılaştırması')}
                style={{
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FiMessageSquare size={13} /> 10T Teklifi Al
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(15, 28, 50, 0.85)', borderBottom: '1px solid rgba(255, 255, 255, 0.16)' }}>
                    <th style={{ padding: '12px 16px', color: '#f1f5f9', fontWeight: 800, width: '22%' }}>Özellik / Parametre</th>
                    <th style={{ padding: '12px 16px', color: '#38bdf8', fontWeight: 800, width: '28%', background: 'rgba(2, 132, 199, 0.16)' }}>
                      IVECO Eurocargo MLC 100 E 19
                    </th>
                    <th style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 800, width: '24%' }}>
                      10T Rakip Kamyon (NPR 10)
                    </th>
                    <th style={{ padding: '12px 16px', color: '#4ade80', fontWeight: 800, width: '26%' }}>
                      TCO & İşletme Avantajı
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      feature: 'Periyodik Bakım Aralığı',
                      iveco: '40.000 km veya 800 Saat',
                      competitor: '20.000 km / 1 Yıl',
                      advantage: '%50 daha az servis ziyareti. Servis ve iş kaybı maliyetleri yarı yarıya düşer!',
                      highlight: true
                    },
                    {
                      feature: 'Maksimum Tork',
                      iveco: '680 Nm Tork (1.250 - 1.900 d/d)',
                      competitor: '510 Nm Tork (1.600 - 2.600 d/d)',
                      advantage: '+170 Nm tork avantajı ve çok daha alt devirde gelen çekiş gücü ile düşük yakıt.',
                      highlight: true
                    },
                    {
                      feature: 'Motor Hacmi, Güç & Emisyon',
                      iveco: '4.485 cc • 190 HP • HI-SCR (EGR Yok)',
                      competitor: '5.193 cc • 190 PS • EGR + DPD',
                      advantage: 'Daha düşük hacimle +170 Nm fazla tork; EGR olmadığı için DPD/DPF kurum tıkanması yok.',
                      highlight: true
                    },
                    {
                      feature: 'Şanzıman Seçeneği',
                      iveco: 'ZF 8AP 8 İleri Tork Konvertörlü Tam Otomatik / 6 İleri',
                      competitor: '6 İleri Manuel veya Robotize (Kuru Kavrama)',
                      advantage: 'Tam otomatik versiyonda baskı-balata bitme ve debriyaj ısınma sorunu yaşanmaz.',
                      highlight: true
                    },
                    {
                      feature: 'Dönüş Çapı (Manevra)',
                      iveco: '14.200 mm (Duvardan Duvara)',
                      competitor: '15.270 mm',
                      advantage: '1.07 metre daha dar dönüş. Dar şehir sokaklarında üstün kıvraklık.',
                      highlight: true
                    },
                    {
                      feature: 'Arka Aks Oranı',
                      iveco: '3.73 Seri Diferansiyel',
                      competitor: '4.78',
                      advantage: 'Otoyolda düşük motor devri, daha sessiz kabin ve %10+ yakıt tasarrufu.',
                      highlight: true
                    },
                    {
                      feature: 'Ön Aks Kapasitesi',
                      iveco: '3.600 kg',
                      competitor: '3.400 kg',
                      advantage: 'Önde +200 kg daha yüksek taşıma direnci.',
                      highlight: false
                    },
                    {
                      feature: 'Yakıt Deposu',
                      iveco: '120 Litre',
                      competitor: '100 Litre',
                      advantage: '+20 Litre daha fazla menzil.',
                      highlight: false
                    },
                    {
                      feature: 'Kabin Yüksekliği & Hacim',
                      iveco: '2.553 mm Yükseklik (2.16 m Genişlik)',
                      competitor: '2.275 mm Yükseklik (2.04 m Genişlik)',
                      advantage: '+28 cm yüksek tavan ile kabin içinde rahat hareket alanı ve gerçek kamyon konforu.',
                      highlight: false
                    },
                    {
                      feature: 'Geri Görüş Kamerası & Hız Sabitleyici',
                      iveco: 'Standart Donanım',
                      competitor: 'Opsiyonel / Yok',
                      advantage: 'Geri yanaşma kazalarını önler, uzun yolda yakıtı optimize eder.',
                      highlight: true
                    },
                    {
                      feature: 'Dijital Kadran & Ekran',
                      iveco: '10 inç Dijital Kadran & 7 inç Multimedya',
                      competitor: 'Analog Göstergeler / Basit Panel',
                      advantage: 'Tüm araç sağlığı ve telematik verilerini sürücüye eksiksiz sunar.',
                      highlight: true
                    }
                  ].map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        background: row.highlight ? 'rgba(2, 132, 199, 0.08)' : (idx % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'transparent')
                      }}
                    >
                      <td style={{ padding: '12px 16px', color: '#f8fafc', fontWeight: 700 }}>
                        {row.feature}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#38bdf8', fontWeight: 800, background: 'rgba(2, 132, 199, 0.1)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <FiCheck color="#38bdf8" /> {row.iveco}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 600 }}>
                        {row.competitor}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#4ade80', fontWeight: 600 }}>
                        {row.advantage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── BÖLÜM 3: DAILY MY26 VS RAKİP F. & DİĞERLERİ ── */}
      {activeSubTab === 'daily_my26' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Highlight Cards for Daily MY26 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>🔧 RESMİ BAKIM ARALIĞI</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>25.000 km / 1 Yıl Periyot</div>
              <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                Hem IVECO Daily'de hem tüm rakiplerde (Rakip F., M., Ft., R.) resmi bakım aralığı <strong>25.000 km / 1 Yıl</strong>'dır. Daily, ekonomik filtre/servis faturası ve sıfır sürpriz arıza ile TCO'da öne geçer.
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>⛓️ ÇELİK ZİNCİRLİ FPT MOTOR</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>2.3L (400 Nm) & 3.0L (430 Nm)</div>
              <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                Çift sıra çelik zincirli FPT motor triger değişimi gerektirmez. Rakip F. 2.0L EcoBlue motorlardaki <strong>yağ içi ıslak triger kayışı (wet belt)</strong> kopma riski ve ağır revizyon masrafı yoktur.
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(168, 85, 247, 0.35)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 700 }}>⚙️ ZF 8 İLERİ HI-MATIC OTOMATİK</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>Tork Konvertörlü Tam Otomatik</div>
              <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                Kuru kavrama baskı-balata yoktur. Dur-kalk şehir içi dağıtımda ve dik rampalarda debriyaj ısınması veya balata bitme masrafı sıfırdır.
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700 }}>🛡️ 3 PARÇA TAMPON & C-ŞASİ</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>3.5T - 7.2T Kamyon Şasisi</div>
              <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                Gerçek C-kesit kamyon şasisi ağır yükte esnemez. 3 parçalı modüler ön tampon sayesinde köşe darbesinde komple tampon yerine sadece ilgili köşe düşük maliyetle değişir.
              </p>
            </div>
          </div>

          {/* Daily Design & TCO Comparison Grid */}
          <div style={{
            background: 'rgba(15, 28, 50, 0.9)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '16px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.70rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>RESMİ KATALOG & REKABET VERİLERİ (DAILY MY26)</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                  Daily MY26 Hafif Ticari Segment Rekabet Analizi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleConsultantQuote('Daily MY26 vs Rakip F. Analizi')}
                style={{
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FiMessageSquare size={13} /> Daily Teklifi Al
              </button>
            </div>

            {/* Matrix Table */}
            <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: 'rgba(15, 28, 50, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.16)' }}>
                    <th style={{ padding: '12px 14px', textAlign: 'left', color: '#f1f5f9', fontWeight: 800, width: '25%' }}>Teknik / Tasarım Donanımı</th>
                    <th style={{ padding: '12px 14px', color: '#38bdf8', fontWeight: 800, background: 'rgba(2, 132, 199, 0.16)', width: '15%' }}>
                      IVECO Daily
                    </th>
                    <th style={{ padding: '12px 14px', color: '#e2e8f0', fontWeight: 700, width: '15%' }}>Rakip F. (Transit)</th>
                    <th style={{ padding: '12px 14px', color: '#e2e8f0', fontWeight: 700, width: '15%' }}>Rakip M. (Sprinter)</th>
                    <th style={{ padding: '12px 14px', color: '#e2e8f0', fontWeight: 700, width: '15%' }}>Rakip Ft. (Ducato)</th>
                    <th style={{ padding: '12px 14px', color: '#e2e8f0', fontWeight: 700, width: '15%' }}>Rakip R. (Master)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: 'Periyodik Bakım Aralığı & Birim Maliyet',
                      desc: 'Tüm hafif ticari rakiplerde resmi bakım periyodu 25.000 km / 1 Yıl olarak eşittir',
                      iveco: { status: 'check', text: '25.000 km / 1 Yıl (Ekonomik)' },
                      f: { status: 'opt', text: '25.000 km / 1 Yıl' },
                      m: { status: 'opt', text: '25.000 km (Pahalı Servis A/B)' },
                      fiat: { status: 'opt', text: '25.000 km / 1 Yıl' },
                      renault: { status: 'opt', text: '25.000 km / 1 Yıl' }
                    },
                    {
                      name: 'Motor Hacmi, Güç & Tork',
                      desc: 'Yüksek hacimli endüstriyel blok ile rampada bayılmayan yüksek tork ve uzun motor ömrü',
                      iveco: { status: 'check', text: '2.3L (156 HP/400 Nm) & 3.0L (180 HP/430 Nm)' },
                      f: { status: 'opt', text: '2.0L EcoBlue (165-170 HP / 390 Nm)' },
                      m: { status: 'opt', text: '2.0L OM654 (170 HP / 400 Nm)' },
                      fiat: { status: 'opt', text: '2.2L (140-180 HP / 380 Nm)' },
                      renault: { status: 'opt', text: '2.0L / 2.3L (150-170 HP)' }
                    },
                    {
                      name: 'Triger Sistemi (Motor Güvenliği)',
                      desc: 'Çift sıra çelik zincirli FPT motor vs Yağ içinde çalışan hassas ıslak triger kayışı',
                      iveco: { status: 'check', text: 'Çelik Zincirli FPT (Ömür Boyu)' },
                      f: { status: 'cross', text: 'Yağ İçi Islak Kayış (Wet Belt)' },
                      m: { status: 'check', text: 'Zincirli' },
                      fiat: { status: 'cross', text: 'Triger Kayışlı' },
                      renault: { status: 'check', text: 'Zincirli' }
                    },
                    {
                      name: 'C-Profil Gerçek Kamyon Şasisi (3.5T - 7.2T)',
                      desc: 'Ağır tonajda bükülmeyen, kantar yüküne ve özel üstyapıya dayanıklı merdiven şasi',
                      iveco: { status: 'check', text: 'C-Kesit Kamyon Şasi' },
                      f: { status: 'cross', text: 'Monokok / Entegre Sac Gövde' },
                      m: { status: 'cross', text: 'Entegre Kutu Profil Gövde' },
                      fiat: { status: 'cross', text: 'Monokok Sac (Önden Çekiş)' },
                      renault: { status: 'cross', text: 'Monokok Sac' }
                    },
                    {
                      name: 'ZF 8 İleri Tork Konvertörlü Otomatik (Hi-Matic)',
                      desc: 'Baskı balata yok, debriyaj maliyeti sıfır, 200 ms altında sarsıntısız geçiş',
                      iveco: { status: 'check', text: '8 İleri ZF Tork Konvertör' },
                      f: { status: 'opt', text: '10 İleri Otomatik' },
                      m: { status: 'opt', text: '9 İleri 9G-TRONIC' },
                      fiat: { status: 'opt', text: '8/9 İleri Otomatik' },
                      renault: { status: 'opt', text: '9 İleri / Robotize' }
                    },
                    {
                      name: '3 Parça Modüler Ön Tampon',
                      desc: 'Köşe çarpmalarında komple tampon yerine sadece hasarlı parçanın değişimi (%65 tasarruf)',
                      iveco: { status: 'check', text: '3 Parça Modüler' },
                      f: { status: 'cross', text: 'Tek Parça Yekpare' },
                      m: { status: 'cross', text: 'Tek Parça Yekpare' },
                      fiat: { status: 'check', text: '3 Parça' },
                      renault: { status: 'cross', text: 'Tek Parça' }
                    },
                    {
                      name: 'Viraj Aydınlatmalı Ön Sis Farları',
                      desc: 'Standart donanımda kavşak ve viraj içi gece aydınlatması',
                      iveco: { status: 'check', text: 'STANDART' },
                      f: { status: 'opt', text: 'Opsiyonel (Ek Ücret)' },
                      m: { status: 'opt', text: 'Opsiyonel (Ek Ücret)' },
                      fiat: { status: 'cross', text: 'Yok / Opsiyonel' },
                      renault: { status: 'opt', text: 'Opsiyonel' }
                    },
                    {
                      name: '270° Açılan Arka Kapılar & Yük Gözlem Camı',
                      desc: 'Dar alanlarda ergonomik rampa yanaşması ve kabinden yük bölmesini izleme imkanı',
                      iveco: { status: 'check', text: 'STANDART' },
                      f: { status: 'opt', text: 'Kapı Mevcut / Cam Yok' },
                      m: { status: 'opt', text: 'Opsiyonel (Ek Ücret)' },
                      fiat: { status: 'opt', text: 'Opsiyonel (Ek Ücret)' },
                      renault: { status: 'opt', text: 'Opsiyonel' }
                    },
                    {
                      name: 'Hi-Adaptive Akıllı Hafızalı Koltuklar',
                      desc: 'Vücut şeklini alan visco sünger, kaza anında boyun kamçı etkisini -%15 azaltır',
                      iveco: { status: 'check', text: 'STANDART' },
                      f: { status: 'cross', text: 'Standart Sünger' },
                      m: { status: 'cross', text: 'Standart Sünger' },
                      fiat: { status: 'cross', text: 'Standart Sünger' },
                      renault: { status: 'cross', text: 'Standart Sünger' }
                    }
                  ].map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                        <div style={{ fontWeight: 800, color: '#f8fafc' }}>{row.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>{row.desc}</div>
                      </td>

                      {/* IVECO */}
                      <td style={{ padding: '12px 14px', background: 'rgba(2, 132, 199, 0.12)' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#38bdf8', fontWeight: 800 }}>
                          <span style={{ background: '#10b981', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>✓</span>
                          <span>{row.iveco.text}</span>
                        </div>
                      </td>

                      {/* F. */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: row.f.status === 'cross' ? '#f87171' : (row.f.status === 'opt' ? '#fbbf24' : '#4ade80'), fontWeight: 600 }}>
                          {row.f.status === 'cross' && <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>✕</span>}
                          {row.f.status === 'opt' && <span style={{ background: '#f59e0b', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>○</span>}
                          {row.f.status === 'check' && <span style={{ background: '#10b981', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>✓</span>}
                          <span>{row.f.text}</span>
                        </div>
                      </td>

                      {/* M. */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: row.m.status === 'cross' ? '#f87171' : (row.m.status === 'opt' ? '#fbbf24' : '#4ade80'), fontWeight: 600 }}>
                          {row.m.status === 'cross' && <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>✕</span>}
                          {row.m.status === 'opt' && <span style={{ background: '#f59e0b', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>○</span>}
                          {row.m.status === 'check' && <span style={{ background: '#10b981', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>✓</span>}
                          <span>{row.m.text}</span>
                        </div>
                      </td>

                      {/* FIAT */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: row.fiat.status === 'cross' ? '#f87171' : (row.fiat.status === 'opt' ? '#fbbf24' : '#4ade80'), fontWeight: 600 }}>
                          {row.fiat.status === 'cross' && <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>✕</span>}
                          {row.fiat.status === 'opt' && <span style={{ background: '#f59e0b', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>○</span>}
                          {row.fiat.status === 'check' && <span style={{ background: '#10b981', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>✓</span>}
                          <span>{row.fiat.text}</span>
                        </div>
                      </td>

                      {/* RENAULT */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: row.renault.status === 'cross' ? '#f87171' : (row.renault.status === 'opt' ? '#fbbf24' : '#4ade80'), fontWeight: 600 }}>
                          {row.renault.status === 'cross' && <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>✕</span>}
                          {row.renault.status === 'opt' && <span style={{ background: '#f59e0b', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>○</span>}
                          {row.renault.status === 'check' && <span style={{ background: '#10b981', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>✓</span>}
                          <span>{row.renault.text}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Deep Dive: Tampon & Triger TCO Analizi */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ fontSize: '2rem' }}>💡</div>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fbbf24', marginBottom: '3px' }}>
                  Filo Yöneticileri İçin 25.000 km Bakım, Çelik Zincir ve 3 Parça Tamponun Gerçek TCO Etkisi
                </div>
                <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: 0, lineHeight: 1.45 }}>
                  Hafif ticari araç segmentinde hem IVECO Daily hem de rakipler (Rakip F., Rakip M., Rakip Ft., Rakip R.) yılda bir veya <strong>25.000 km'de bir periyodik bakıma</strong> girer. Ancak TCO farkını yaratan 3 ana unsur vardır: <strong>(1)</strong> Rakip F.'nin 2.0L motorundaki yağ içi ıslak triger kayışı (wet belt) ağır revizyon maliyeti doğururken, Daily'nin <strong>çelik zincirli 2.3L ve 3.0L FPT motorları</strong> triger değişimi istemez. <strong>(2)</strong> Rakip M.'nin yetkili servis A/B bakım faturaları çok yüksekken Daily yetkili servis bakımı ekonomiktir. <strong>(3)</strong> Köşe sürtmelerinde rakiplerde yekpare tampon komple değişirken, Daily'de <strong>3 parçalı modüler tamponun</strong> sadece ilgili köşesi dakikalar içinde düşük maliyetle yenilenir.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BÖLÜM 4: ÇEKİCİ & AĞIR VASITA (S-WAY VS F-MAX & ACTROS) ── */}
      {activeSubTab === 'sway_heavy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Highlight Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>🔥 HI-SCR (EGR'SİZ MOTOR)</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>EGR Valfi & Soğutucusu Yok</div>
              <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                S-Way 12.9L Cursor 13 motor egzoz gazını silindire geri basmaz. Rakip F-MAX ve Actros'ta görülen EGR valfi/soğutucusu arızası ve kurum birikimi S-Way'de sıfırdır.
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>⛽ YAKIT & AERODİNAMİK</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>100 km'de 1.5 - 2.0 L Tasarruf</div>
              <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                Düşük sürtünmeli kabin aerodinamiği, 12 ileri ZF HI-TRONIX şanzıman ve saf yanma teknolojisiyle uluslararası uzun yolda yılda yüz binlerce TL mazot tasarrufu sağlar.
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700 }}>🔧 BAKIM PERİYODU</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>60.000 - 80.000 km Bakım</div>
              <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                Türkiye uzun yol koşullarında tüm ağır vasıta çekicilerde olduğu gibi 60.000 - 80.000 km periyodik bakım aralığına ve çok daha ekonomik filtre/parça maliyetine sahiptir.
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(168, 85, 247, 0.35)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 700 }}>🐎 GÜÇ & TORK SEÇENEKLERİ</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>490 / 530 / 570 / 580 HP</div>
              <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                2.500 Nm'den 2.800 Nm'ye uzanan devasa tork bandı ve yüksek güçlü motor/retarder kombinasyonuyla ağır tonajlı rampalarda vites düşürmeden tırmanır.
              </p>
            </div>
          </div>

          {/* S-Way Comparison Table */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '14px 18px',
              background: 'rgba(2, 132, 199, 0.15)',
              borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>
                <span style={{ fontSize: '0.70rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>AĞIR VASITA ÇEKİCİ SEGMENTİ DOĞRULANMIŞ VERİLER</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                  IVECO S-Way (AS440S500 / 530) vs Rakip F. (F-MAX 500) vs Rakip M. (Actros 1848 / 1851)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleConsultantQuote('IVECO S-Way Çekici Filo TCO Analizi')}
                style={{
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FiMessageSquare size={13} /> S-Way Teklifi Al
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(15, 28, 50, 0.85)', borderBottom: '1px solid rgba(255, 255, 255, 0.16)' }}>
                    <th style={{ padding: '12px 16px', color: '#f1f5f9', fontWeight: 800, width: '20%' }}>Özellik / Parametre</th>
                    <th style={{ padding: '12px 16px', color: '#38bdf8', fontWeight: 800, width: '28%', background: 'rgba(2, 132, 199, 0.16)' }}>
                      IVECO S-Way (Cursor 13)
                    </th>
                    <th style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 800, width: '26%' }}>
                      Rakip F. (F-MAX 500)
                    </th>
                    <th style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 800, width: '26%' }}>
                      Rakip M. (Actros 1848 / 1851)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      feature: 'Motor Hacmi, Güç & Tork',
                      iveco: '12.9L Cursor 13 • 490 / 530 / 580 HP (2.500 - 2.800 Nm)',
                      fmax: '12.7L Ecotorq • 500 PS (2.500 Nm)',
                      actros: '12.8L OM471 • 476 - 510 PS (2.300 - 2.500 Nm)',
                      highlight: true
                    },
                    {
                      feature: 'Emisyon & Yanma Teknolojisi',
                      iveco: 'HI-SCR (EGR Valfi Yok - %100 Temiz Hava Yanması)',
                      fmax: 'EGR + SCR + DPF',
                      actros: 'EGR + SCR + DPF',
                      highlight: true
                    },
                    {
                      feature: 'Şanzıman Sistemi',
                      iveco: '12 İleri ZF HI-TRONIX Otomatikleştirilmiş',
                      fmax: '16 İleri Ecotorq / ZF Otomatikleştirilmiş',
                      actros: '12 İleri PowerShift 3 Otomatikleştirilmiş',
                      highlight: false
                    },
                    {
                      feature: 'Periyodik Bakım Aralığı (TR)',
                      iveco: '60.000 - 80.000 km / 1 Yıl (Ekonomik Parça)',
                      fmax: '60.000 - 80.000 km / 1 Yıl',
                      actros: '60.000 - 80.000 km / 1 Yıl (Yüksek Servis Maliyeti)',
                      highlight: true
                    },
                    {
                      feature: 'Ön Tampon & Gövde Onarımı',
                      iveco: 'Çok Parçalı Modüler Tampon (Bölgesel Değişim)',
                      fmax: 'Yüksek Maliyetli Ön Gövde Parçaları',
                      actros: 'Yüksek Yetkili Servis Hasar Faturası',
                      highlight: true
                    }
                  ].map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        background: row.highlight ? 'rgba(2, 132, 199, 0.08)' : (idx % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'transparent')
                      }}
                    >
                      <td style={{ padding: '12px 16px', color: '#f8fafc', fontWeight: 700 }}>{row.feature}</td>
                      <td style={{ padding: '12px 16px', color: '#38bdf8', fontWeight: 800, background: 'rgba(2, 132, 199, 0.1)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <FiCheck color="#38bdf8" /> {row.iveco}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 600 }}>{row.fmax}</td>
                      <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 600 }}>{row.actros}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── BÖLÜM 4: SAHA & PİYASA GERİ DÖNÜŞLERİ ── */}
      {activeSubTab === 'market_feedback' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(2, 6, 23, 0.95) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '20px'
          }}>
            <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
              GERÇEK FİLO DENEYİMLERİ & SAHA İSTİHBARATI
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 16px' }}>
              Piyasada Rakipler Hakkında Ne Konuşuluyor? Kullanıcı Geri Bildirimleri
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {/* M. Kartı */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fca5a5' }}>
                    Rakip M. Saha Geri Bildirimleri
                  </span>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '2px 8px', borderRadius: '4px' }}>
                    Yüksek TCO Riski
                  </span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.55 }}>
                  <li><strong>Yüksek İlk Satın Alma & Yıldız Primi:</strong> Aynı taşıma kapasitesindeki araç için markaya fahiş ilk yatırım bedeli ödenmesi.</li>
                  <li><strong>Çok Pahalı Yetkili Servis & Parça:</strong> Garanti süresi boyunca periyodik bakım faturalarının ve yedek parça birim fiyatlarının sektörel ortalamanın çok üzerinde olması.</li>
                  <li><strong>Robotize Şanzıman Isınma Şikayetleri:</strong> Yoğun dur-kalk şehir içi dağıtımlarda debriyaj ısınma ikazı ve 80.000 - 120.000 km aralığında erken baskı-balata bitme maliyeti.</li>
                  <li><strong>Donanımların Çoğunun Opsiyon Olması:</strong> Geri görüş kamerası, büyük ekran gibi temel unsurların dahi yüksek paket ücretleriyle satılması.</li>
                </ul>
              </div>

              {/* F. Kartı */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fde68a' }}>
                    Rakip F. Saha Geri Bildirimleri
                  </span>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '2px 8px', borderRadius: '4px' }}>
                    Şasi & Motor Hassasiyeti
                  </span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.55 }}>
                  <li><strong>Yekpare Ön Tampon Masrafı:</strong> Tek parça tampon sebebiyle en ufak sürtmede komple tampon değişimi zorunluluğu, kasko mini onarım limitlerinin aşılması.</li>
                  <li><strong>Ağır Yükte Şasi Esnemesi & Çökme:</strong> Daily'nin kamyon tipi C-kesit merdiven şasisine karşın, hafif binek türevi gövde yapısının kantarda arkadan sarkma yapması.</li>
                  <li><strong>Islak Triger Kayışı Hassasiyeti:</strong> Motor yağının içinde çalışan triger kayışı tasarımının periyodik bakım aksamalarında yağ pompasını tıkama riski ve piyasadaki revizyon endişeleri.</li>
                  <li><strong>Zincirli FPT Motor Karşısında Ömür:</strong> Daily'nin 1.000.000 km ağır hizmet için tasarlanan 3.0L ve 2.3L FPT zincirli motorlarına kıyasla daha kısa motor revizyon ömrü.</li>
                </ul>
              </div>

              {/* Rakip R. (Fransız Grubu) */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#e2e8f0' }}>
                    Rakip R. Saha Geri Bildirimleri
                  </span>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, background: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8', padding: '2px 8px', borderRadius: '4px' }}>
                    Mukavemet & Değer Kaybı
                  </span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.55 }}>
                  <li><strong>Monokok Şasi Yetersizliği:</strong> Kamyon şasisi yerine sac kafes kullandıkları için ağır yük, frigorifik kasa ve damper uygulamalarında şasi burulması.</li>
                  <li><strong>İkinci Elde Hızlı Değer Kaybı:</strong> IVECO ve diğer piyasa rakiplerine göre 3-5 yıl sonrasında ikinci el değerini koruyamaması ve yüksek amortisman kaybı.</li>
                  <li><strong>Yetkili Üst Yapı Çözümlerinin Kısıtlılığı:</strong> Fabrika çıkışı karoseri hazırlık soketlerinin ve PTO (yavru şanzıman) çıkışlarının yetersizliği.</li>
                </ul>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div style={{
              marginTop: '20px',
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>
                  Şirketinizin Filosuna Özel TCO Tasarruf Raporu İsteyin
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  Mevcut filonuzdaki araçların yıllık yakıt, periyodik bakım ve kasko hasar maliyetlerini karşılaştıralım.
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleConsultantQuote('Filo Özel TCO Tasarruf Raporu')}
                style={{
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '0.80rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FiMessageSquare size={14} /> Murat Bey ile TCO Görüşmesi Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
