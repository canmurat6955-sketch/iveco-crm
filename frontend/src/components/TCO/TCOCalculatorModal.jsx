import { useState, useMemo } from 'react';

export default function TCOCalculatorModal({ isOpen, onClose, customerName = '', vehicleType = 'daily' }) {
  const [segment, setSegment] = useState(vehicleType === 'eurocargo' ? 'eurocargo' : 'daily');
  const [annualKm, setAnnualKm] = useState(60000);
  const [years, setYears] = useState(3);
  const [fuelPrice, setFuelPrice] = useState(45.5);
  const [downtimeCostPerDay, setDowntimeCostPerDay] = useState(7500);
  const [copied, setCopied] = useState(false);

  // Total Kilometers
  const totalKm = useMemo(() => annualKm * years, [annualKm, years]);

  // Calculations based on Vehicle Segment
  // Calculations based on Vehicle Segment
  const metrics = useMemo(() => {
    if (segment === 'daily') {
      // IVECO Daily vs Rakip F. vs Rakip M.
      const ivecoServices = Math.floor(totalKm / 50000);
      const fordServices = Math.floor(totalKm / 20000);
      const mercServices = Math.floor(totalKm / 30000);

      // Maintenance & repair costs (including wet timing belt for F. and 3-piece modular bumper savings)
      const ivecoMaint = ivecoServices * 14500;
      const fordMaint = (fordServices * 12000) + (totalKm >= 90000 ? 38000 : 0) + 15000; // Islak triger + tek parça tampon hasar farkı
      const mercMaint = (mercServices * 22000) + 18000; // Yüksek parça/işçilik farkı

      // Fuel consumption (L/100km): IVECO 10.0L vs Rakip F. 11.8L vs Rakip M. 11.2L
      const ivecoFuel = (totalKm / 100) * 10.0 * fuelPrice;
      const fordFuel = (totalKm / 100) * 11.8 * fuelPrice;
      const mercFuel = (totalKm / 100) * 11.2 * fuelPrice;

      // Downtime (each service takes 1 working day)
      const ivecoDown = ivecoServices * downtimeCostPerDay;
      const fordDown = fordServices * downtimeCostPerDay;
      const mercDown = mercServices * downtimeCostPerDay;

      const ivecoTotal = ivecoMaint + ivecoFuel + ivecoDown;
      const fordTotal = fordMaint + fordFuel + fordDown;
      const mercTotal = mercMaint + mercFuel + mercDown;

      const savingsVsFord = fordTotal - ivecoTotal;
      const savingsVsMerc = mercTotal - ivecoTotal;

      return {
        vehicleName: 'IVECO Daily 35C / 72C (3.0L Heavy Duty)',
        ivecoServices, fordServices, mercServices,
        ivecoMaint, fordMaint, mercMaint,
        ivecoFuel, fordFuel, mercFuel,
        ivecoDown, fordDown, mercDown,
        ivecoTotal, fordTotal, mercTotal,
        savingsVsFord, savingsVsMerc,
        competitor1: 'Rakip F. (2.0L)',
        competitor2: 'Rakip M. (2.0L)',
        ivecoInterval: '50.000 km',
        comp1Interval: '20.000 km',
        comp2Interval: '30.000 km',
        keyHighlights: [
          '3 Parça Modüler Tampon (Rakip F. tek parça masrafına karşı düşük hasar TCO)',
          'Zincirli FPT Triger Sistemi (Rakip F. ıslak triger riskine karşı sıfır masraf)',
          'ZF Hi-Matic 8 İleri Tork Konvertör (Baskı-balata yok, debriyaj maliyeti sıfır)',
          'C-Profil Kamyon Şasisi (Ağır yükte esnemez, kantarda çökmez)'
        ]
      };
    } else {
      // IVECO Eurocargo (MLC 150 E 21) vs Rakip M. (1518) vs Rakip F. Cargo (PTC 2026 MDT Verileri)
      const ivecoServices = Math.floor(totalKm / 40000); // Resmi PTC verisi: 40.000 km
      const mercServices = Math.floor(totalKm / 20000);  // Resmi PTC verisi: 20.000 km
      const fordServices = Math.floor(totalKm / 25000);

      // Bakım ve Şanzıman Maliyeti (Eurocargo'da baskı-balata YOKTUR; Rakip M.'de robotize debriyaj balata değişimi ~65.000 TL)
      const ivecoMaint = ivecoServices * 24000;
      const mercMaint = (mercServices * 34000) + (totalKm >= 90000 ? 65000 : 0); // M. robotize debriyaj balatası yenileme
      const fordMaint = (fordServices * 30000) + (totalKm >= 90000 ? 55000 : 0);

      // Yakıt tüketimi: Eurocargo 4.5L 210 HP (21.5L/100km) vs Rakip M. 5.1L 177 HP (23.8L) vs Rakip F. (25.0L)
      const ivecoFuel = (totalKm / 100) * 21.5 * fuelPrice;
      const mercFuel = (totalKm / 100) * 23.8 * fuelPrice;
      const fordFuel = (totalKm / 100) * 25.0 * fuelPrice;

      const ivecoDown = ivecoServices * (downtimeCostPerDay * 1.5);
      const mercDown = mercServices * (downtimeCostPerDay * 1.5);
      const fordDown = fordServices * (downtimeCostPerDay * 1.5);

      const ivecoTotal = ivecoMaint + ivecoFuel + ivecoDown;
      const mercTotal = mercMaint + mercFuel + mercDown;
      const fordTotal = fordMaint + fordFuel + fordDown;

      const savingsVsMerc = mercTotal - ivecoTotal;
      const savingsVsFord = fordTotal - ivecoTotal;

      return {
        vehicleName: 'IVECO Eurocargo MLC 150 E 21 (210 HP)',
        ivecoServices, fordServices, mercServices,
        ivecoMaint, fordMaint, mercMaint,
        ivecoFuel, fordFuel, mercFuel,
        ivecoDown, fordDown, mercDown,
        ivecoTotal, fordTotal, mercTotal,
        savingsVsFord, savingsVsMerc,
        competitor1: 'Rakip F. Cargo',
        competitor2: 'Rakip M. 1518',
        ivecoInterval: '40.000 km',
        comp1Interval: '25.000 km',
        comp2Interval: '20.000 km',
        keyHighlights: [
          '8 İleri Full Otomatik Şanzıman (Baskı balata yok! Rakip M. balata değişim masrafı sıfır)',
          '40.000 km Bakım Aralığı (Rakip M. 20.000 km - Yarı yarıya daha az servis ziyareti)',
          '+163 kg Daha Yüksek Net Yük (10.481 kg kantar istiap haddi)',
          '88 cm Daha Dar Dönüş Çapı (14.72 m ile üstün şehir içi manevra)'
        ]
      };
    }
  }, [segment, totalKm, fuelPrice, downtimeCostPerDay]);

  // Formatted WhatsApp pitch text
  const whatsappPitch = useMemo(() => {
    const greeting = customerName ? `Sayın ${customerName} Yetkilisi,` : 'Sayın Yetkili,';
    const highlights = (metrics.keyHighlights || []).map(h => `• ${h}`).join('\n');
    return `${greeting}

IVECO ERC Samsun Otomotiv olarak filonuz için hazırladığımız ${years} Yıllık (${totalKm.toLocaleString('tr-TR')} km) Toplam Sahip Olma Maliyeti (TCO) Karşılaştırmamız:

🚛 ${metrics.vehicleName} Avantajı:
• Bakım Aralığı: ${metrics.ivecoInterval} (Rakiplerde ${metrics.comp2Interval})
• Toplam Servis Sayısı: Sadece ${metrics.ivecoServices} Bakım (${metrics.competitor2}'de ${metrics.mercServices} bakım!)
${highlights}

📊 ${years} Yıllık Net Filo Tasarrufunuz:
💰 ${metrics.competitor1}'a Göre Net Tasarruf: ${Math.round(metrics.savingsVsFord).toLocaleString('tr-TR')} TL
💰 ${metrics.competitor2}'e Göre Net Tasarruf: ${Math.round(metrics.savingsVsMerc).toLocaleString('tr-TR')} TL

IVECO, yüksek torklu FPT motoru, uzatılmış bakım periyodu ve şanzıman verimliliğiyle ilk alım fiyat farkını ilk yılda amorti eder.

Detaylı filo maliyet raporumuzu ve takas teklifimizi görüşmekten memnuniyet duyarım.
IVECO ERC Samsun Otomotiv - Can Murat Onay (0544 622 59 31)`;
  }, [customerName, years, totalKm, metrics]);

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(whatsappPitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: '#ffffff', color: '#0f172a',
        width: '100%', maxWidth: '820px', maxHeight: '92vh', borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          color: '#ffffff', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
              📊
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>TCO & Rakip Karşılaştırma Hesaplayıcı</h3>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
                50.000 km bakım periyodu ve motor verimliliğiyle fiyat pazarlığını kıran tasarruf analizi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)', border: 'none', color: '#fff',
              width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Segment Selector & Input Controls */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={() => setSegment('daily')}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                  background: segment === 'daily' ? '#059669' : '#e2e8f0', color: segment === 'daily' ? '#fff' : '#475569'
                }}
              >
                🚚 Hafif Ticari: IVECO Daily vs Rakip F. & M.
              </button>
              <button
                type="button"
                onClick={() => setSegment('eurocargo')}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                  background: segment === 'eurocargo' ? '#059669' : '#e2e8f0', color: segment === 'eurocargo' ? '#fff' : '#475569'
                }}
              >
                🚛 Orta Ticari: IVECO Eurocargo vs Rakip M. & F.
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Yıllık Yapılan KM:
                </label>
                <select
                  value={annualKm}
                  onChange={(e) => setAnnualKm(Number(e.target.value))}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value={40000}>40.000 km (Şehir İçi)</option>
                  <option value={60000}>60.000 km (Standart KOBİ)</option>
                  <option value={80000}>80.000 km (Bölgesel Dağıtım)</option>
                  <option value={100000}>100.000 km (Yoğun Filo)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Kullanım Süresi:
                </label>
                <select
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value={2}>2 Yıl ({annualKm * 2} km)</option>
                  <option value={3}>3 Yıl ({annualKm * 3} km - Önerilen)</option>
                  <option value={5}>5 Yıl ({annualKm * 5} km)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Mazot Litre Fiyatı (TL):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(Number(e.target.value))}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Günlük İş Kaybı (TL):
                </label>
                <input
                  type="number"
                  step="500"
                  value={downtimeCostPerDay}
                  onChange={(e) => setDowntimeCostPerDay(Number(e.target.value))}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          {/* Big Savings Highlight Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '2px solid #86efac', borderRadius: '14px', padding: '18px', textAlign: 'center'
            }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>
                {metrics.competitor1}'a Karşı {years} Yıllık Net Tasarruf
              </span>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#15803d', marginTop: '4px' }}>
                +{Math.round(metrics.savingsVsFord).toLocaleString('tr-TR')} TL
              </div>
              <span style={{ fontSize: '12px', color: '#166534', marginTop: '4px', display: 'block' }}>
                ({metrics.fordServices - metrics.ivecoServices} adet daha az yetkili servis ziyareti + yakıt farkı)
              </span>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '2px solid #93c5fd', borderRadius: '14px', padding: '18px', textAlign: 'center'
            }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase' }}>
                {metrics.competitor2}'e Karşı {years} Yıllık Net Tasarruf
              </span>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#1d4ed8', marginTop: '4px' }}>
                +{Math.round(metrics.savingsVsMerc).toLocaleString('tr-TR')} TL
              </div>
              <span style={{ fontSize: '12px', color: '#1e40af', marginTop: '4px', display: 'block' }}>
                (Düşük servis bakım ücreti + {metrics.mercServices - metrics.ivecoServices} daha az servis)
              </span>
            </div>
          </div>

          {/* Detailed Breakdown Comparison Table */}
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#334155', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '10px 14px' }}>Maliyet Kalemi ({totalKm.toLocaleString('tr-TR')} km)</th>
                  <th style={{ padding: '10px 14px', color: '#059669', fontWeight: '800' }}>⭐ {metrics.vehicleName}</th>
                  <th style={{ padding: '10px 14px' }}>{metrics.competitor1}</th>
                  <th style={{ padding: '10px 14px' }}>{metrics.competitor2}</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>Bakım Periyodu</td>
                  <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '700' }}>{metrics.ivecoInterval}</td>
                  <td style={{ padding: '10px 14px' }}>{metrics.comp1Interval}</td>
                  <td style={{ padding: '10px 14px' }}>{metrics.comp2Interval}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>Toplam Servis Sayısı</td>
                  <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '700' }}>{metrics.ivecoServices} Bakım</td>
                  <td style={{ padding: '10px 14px', color: '#dc2626', fontWeight: '600' }}>{metrics.fordServices} Bakım</td>
                  <td style={{ padding: '10px 14px', color: '#dc2626', fontWeight: '600' }}>{metrics.mercServices} Bakım</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>Servis & Bakım Maliyeti</td>
                  <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '700' }}>{Math.round(metrics.ivecoMaint).toLocaleString('tr-TR')} TL</td>
                  <td style={{ padding: '10px 14px' }}>{Math.round(metrics.fordMaint).toLocaleString('tr-TR')} TL</td>
                  <td style={{ padding: '10px 14px' }}>{Math.round(metrics.mercMaint).toLocaleString('tr-TR')} TL</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>Yakıt Tüketim Maliyeti</td>
                  <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '700' }}>{Math.round(metrics.ivecoFuel).toLocaleString('tr-TR')} TL</td>
                  <td style={{ padding: '10px 14px' }}>{Math.round(metrics.fordFuel).toLocaleString('tr-TR')} TL</td>
                  <td style={{ padding: '10px 14px' }}>{Math.round(metrics.mercFuel).toLocaleString('tr-TR')} TL</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>Serviste Yatış (İş Kaybı)</td>
                  <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '700' }}>{Math.round(metrics.ivecoDown).toLocaleString('tr-TR')} TL</td>
                  <td style={{ padding: '10px 14px' }}>{Math.round(metrics.fordDown).toLocaleString('tr-TR')} TL</td>
                  <td style={{ padding: '10px 14px' }}>{Math.round(metrics.mercDown).toLocaleString('tr-TR')} TL</td>
                </tr>
                <tr style={{ background: '#f8fafc', fontWeight: '800' }}>
                  <td style={{ padding: '12px 14px' }}>TOPLAM HARCAMA (TCO)</td>
                  <td style={{ padding: '12px 14px', color: '#059669', fontSize: '13px' }}>{Math.round(metrics.ivecoTotal).toLocaleString('tr-TR')} TL</td>
                  <td style={{ padding: '12px 14px', color: '#dc2626', fontSize: '13px' }}>{Math.round(metrics.fordTotal).toLocaleString('tr-TR')} TL</td>
                  <td style={{ padding: '12px 14px', color: '#dc2626', fontSize: '13px' }}>{Math.round(metrics.mercTotal).toLocaleString('tr-TR')} TL</td>
                </tr>

                {/* Ek Teknik Karşılaştırma Satırları (Daily MY26 & PTC 2026 MDT) */}
                {segment === 'daily' ? (
                  <>
                    <tr style={{ borderTop: '2px solid #e2e8f0', background: '#f0fdf4' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: '#166534' }}>Ön Tampon Yapısı</td>
                      <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '800' }}>3 Parça Modüler (Düşük Hasar TCO)</td>
                      <td style={{ padding: '10px 14px', color: '#dc2626' }}>Tek Parça (Yüksek Değişim Masrafı)</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>Standart</td>
                    </tr>
                    <tr style={{ background: '#fafafa' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: '#166534' }}>Triger Sistemi</td>
                      <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '800' }}>Zincirli FPT (Masrafsız, Ömür Boyu)</td>
                      <td style={{ padding: '10px 14px', color: '#dc2626' }}>Islak Triger Kayışı (Yağ İçi Hassas)</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>Zincirli</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: '#166534' }}>Şanzıman Teknolojisi</td>
                      <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '800' }}>ZF 8 İleri Tork Konvertör (Baskı-Balata Yok)</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>10 İleri Otomatik</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>9 İleri Otomatik</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr style={{ borderTop: '2px solid #e2e8f0', background: '#f0fdf4' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: '#166534' }}>Şanzıman Tipi</td>
                      <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '800' }}>8 İleri Full Otomatik ZF (Balata Yok)</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>Manuel / Robotize</td>
                      <td style={{ padding: '10px 14px', color: '#dc2626' }}>6 İleri Robotize (Balata Aşınır)</td>
                    </tr>
                    <tr style={{ background: '#fafafa' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: '#166534' }}>Dönüş Çapı (Manevra)</td>
                      <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '800' }}>14.72 m (88 cm Daha Dar Dönüş)</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>16.10 m</td>
                      <td style={{ padding: '10px 14px', color: '#dc2626' }}>15.60 m</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: '#166534' }}>Net Yük (İstiap Haddi)</td>
                      <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '800' }}>10.481 kg (+163 kg Avantaj)</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>10.100 kg</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>10.318 kg</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* WhatsApp Pitch Preview & Action */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#166534' }}>
                💬 Müşteriye Gönderilmeye Hazır WhatsApp Tasarruf Özeti:
              </span>
              <button
                type="button"
                onClick={handleCopyPitch}
                style={{
                  background: copied ? '#15803d' : '#22c55e', color: '#fff', border: 'none',
                  padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                {copied ? '✅ Kopyalandı!' : '📋 WhatsApp Metnini Kopyala'}
              </button>
            </div>
            <pre style={{
              margin: 0, padding: '12px', background: '#fff', borderRadius: '8px', border: '1px solid #bbf7d0',
              fontSize: '12px', fontFamily: 'inherit', whiteSpace: 'pre-wrap', lineHeight: 1.5, color: '#1e293b'
            }}>
              {whatsappPitch}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 20px', background: '#059669', color: '#fff', border: 'none',
              borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px'
            }}
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}
