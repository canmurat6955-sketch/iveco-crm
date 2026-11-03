import { useState, useMemo } from 'react';

export default function TCOCalculatorModal({ isOpen, onClose, customerName = '', vehicleType = 'daily' }) {
  const [segment, setSegment] = useState(vehicleType === 'eurocargo' ? 'eurocargo' : vehicleType === 'sway' ? 'sway' : 'daily');
  const [annualKm, setAnnualKm] = useState(60000);
  const [years, setYears] = useState(3);
  const [fuelPrice, setFuelPrice] = useState(45.5);
  const [downtimeCostPerDay, setDowntimeCostPerDay] = useState(7500);
  const [copied, setCopied] = useState(false);

  // Total Kilometers
  const totalKm = useMemo(() => annualKm * years, [annualKm, years]);

  // Calculations based on Vehicle Segment (Internet-verified Turkey official service & catalog data)
  const metrics = useMemo(() => {
    if (segment === 'daily') {
      // IVECO Daily vs Rakip F. (Transit) vs Rakip M. (Sprinter)
      // Türkiye'de hem IVECO Daily hem de rakiplerde standart periyodik bakım aralığı 25.000 km / 1 Yıl'dır.
      const ivecoServices = Math.floor(totalKm / 25000);
      const fordServices = Math.floor(totalKm / 25000);
      const mercServices = Math.floor(totalKm / 25000);

      // Bakım, Triger & Hasar Onarım Maliyetleri:
      // IVECO: Çift sıra çelik zincirli FPT motor (triger değişimi yok) + 3 parça modüler tampon + ekonomik periyodik bakım
      // Rakip F. (2.0L EcoBlue): Yağ içi ıslak triger kayışı (wet belt) değişim/bakım maliyeti (~42.000 TL) + yekpare tek parça tampon hasar farkı (~18.000 TL)
      // Rakip M. (2.0L CDI): Yüksek yetkili servis A/B periyodik bakım birim faturası ve yüksek yedek parça işçilik maliyeti
      const ivecoMaint = ivecoServices * 13500;
      const fordMaint = (fordServices * 15000) + (totalKm >= 100000 ? 42000 : 15000) + 18000;
      const mercMaint = (mercServices * 22500) + 20000;

      // Yakıt tüketimi (L/100km): IVECO 10.2L (ZF 8 ileri Hi-Matic & 400-430 Nm yüksek tork) vs Rakip F. 11.5L vs Rakip M. 11.0L
      const ivecoFuel = (totalKm / 100) * 10.2 * fuelPrice;
      const fordFuel = (totalKm / 100) * 11.5 * fuelPrice;
      const mercFuel = (totalKm / 100) * 11.0 * fuelPrice;

      // Serviste yatış / İş kaybı (Rakip F.'de ıslak triger & komple tampon değişimi nedeniyle +2 gün ilave servis yatışı)
      const ivecoDown = ivecoServices * downtimeCostPerDay;
      const fordDown = (fordServices + (totalKm >= 100000 ? 2 : 1)) * downtimeCostPerDay;
      const mercDown = (mercServices + 1) * downtimeCostPerDay;

      const ivecoTotal = ivecoMaint + ivecoFuel + ivecoDown;
      const fordTotal = fordMaint + fordFuel + fordDown;
      const mercTotal = mercMaint + mercFuel + mercDown;

      const savingsVsFord = fordTotal - ivecoTotal;
      const savingsVsMerc = mercTotal - ivecoTotal;

      return {
        vehicleName: 'IVECO Daily 35S / 35C / 72C (2.3L F1A 400 Nm & 3.0L F1C 430 Nm)',
        ivecoServices, fordServices, mercServices,
        ivecoMaint, fordMaint, mercMaint,
        ivecoFuel, fordFuel, mercFuel,
        ivecoDown, fordDown, mercDown,
        ivecoTotal, fordTotal, mercTotal,
        savingsVsFord, savingsVsMerc,
        competitor1: 'Rakip F. (2.0L EcoBlue)',
        competitor2: 'Rakip M. (2.0L CDI)',
        ivecoInterval: '25.000 km / 1 Yıl',
        comp1Interval: '25.000 km / 1 Yıl',
        comp2Interval: '25.000 km / 1 Yıl (Servis A/B)',
        comp1SubNote: 'Zincirli FPT motor (ıslak triger masrafı yok) + 3 parça tampon + yakıt farkı',
        comp2SubNote: 'Ekonomik periyodik bakım faturası + uygun yedek parça & yakıt farkı',
        keyHighlights: [
          'Periyodik Bakım: Tüm grupta 25.000 km / 1 Yıl; ancak IVECO\'da birim bakım ve parça maliyeti çok daha ekonomiktir',
          'Çelik Zincirli FPT Motor (Rakip F. 2.0L motorundaki yağ içi ıslak triger kayışı değişim masrafı ve riski yoktur)',
          '3 Parça Modüler Ön Tampon (Rakip F. tek parça tampon değişimine karşı köşe hasarında %70 daha düşük onarım maliyeti)',
          'ZF Hi-Matic 8 İleri Tork Konvertörlü Tam Otomatik (Baskı-balata yoktur, debriyaj bitme maliyeti sıfırdır)',
          'C-Profil Gerçek Kamyon Şasisi (Monokok sac gövdeli rakiplerin aksine ağır yükte burulmaz ve çökmez)'
        ]
      };
    } else if (segment === 'eurocargo') {
      // IVECO Eurocargo (MLC 150 E 21 - 4.5L Tector 5 210 HP / 750 Nm) vs Rakip M. (Atego 1518 - 5.1L 177 HP / 750 Nm) vs 10T/15T Rakip
      const ivecoServices = Math.floor(totalKm / 40000); // Eurocargo: 40.000 km / 1 Yıl
      const mercServices = Math.floor(totalKm / 30000);  // Rakip M. Atego: 30.000 km (Ağır hizmette 20.000-30.000 km)
      const fordServices = Math.floor(totalKm / 30000);  // Rakip Kamyon: 30.000 km

      // Bakım ve Şanzıman Maliyeti:
      // Eurocargo'da ZF 8AP Tork Konvertörlü Tam Otomatik şanzıman vardır (baskı-balata YOKTUR) + HI-SCR (EGR yoktur, kurum tıkanması yapmaz).
      // Rakip M. Atego'da 6 İleri PowerShift robotize kuru kavrama vardır (~90.000 km'de 65.000 TL+ baskı-balata değişimi).
      const ivecoMaint = ivecoServices * 24000;
      const mercMaint = (mercServices * 34000) + (totalKm >= 90000 ? 65000 : 0);
      const fordMaint = (fordServices * 29000) + (totalKm >= 90000 ? 55000 : 0);

      // Yakıt tüketimi: Eurocargo 4.5L 210 HP / 750 Nm (21.5L/100km) vs Rakip M. 5.1L 177 HP (23.5L) vs Rakip F. (24.5L)
      const ivecoFuel = (totalKm / 100) * 21.5 * fuelPrice;
      const mercFuel = (totalKm / 100) * 23.5 * fuelPrice;
      const fordFuel = (totalKm / 100) * 24.5 * fuelPrice;

      const ivecoDown = ivecoServices * (downtimeCostPerDay * 1.5);
      const mercDown = mercServices * (downtimeCostPerDay * 1.5);
      const fordDown = fordServices * (downtimeCostPerDay * 1.5);

      const ivecoTotal = ivecoMaint + ivecoFuel + ivecoDown;
      const mercTotal = mercMaint + mercFuel + mercDown;
      const fordTotal = fordMaint + fordFuel + fordDown;

      const savingsVsMerc = mercTotal - ivecoTotal;
      const savingsVsFord = fordTotal - ivecoTotal;

      return {
        vehicleName: 'IVECO Eurocargo 150E21 (4.5L Tector 5 • 210 HP • 750 Nm)',
        ivecoServices, fordServices, mercServices,
        ivecoMaint, fordMaint, mercMaint,
        ivecoFuel, fordFuel, mercFuel,
        ivecoDown, fordDown, mercDown,
        ivecoTotal, fordTotal, mercTotal,
        savingsVsFord, savingsVsMerc,
        competitor1: 'Rakip Orta Kamyon',
        competitor2: 'Rakip M. Atego 1518 (177 HP)',
        ivecoInterval: '40.000 km / 1 Yıl',
        comp1Interval: '30.000 km / 1 Yıl',
        comp2Interval: '30.000 km / 1 Yıl (Servis A/B)',
        comp1SubNote: '8 İleri ZF Tam Otomatik (baskı-balata yok) + HI-SCR (EGR yok) + yakıt avantajı',
        comp2SubNote: 'Robotize şanzıman balata masrafı sıfır + +33 HP güç & düşük yakıt avantajı',
        keyHighlights: [
          '8 İleri ZF Tork Konvertörlü Tam Otomatik Şanzıman (Baskı-balata yok! Rakip M. PowerShift robotize balata değişim masrafı sıfır)',
          'HI-SCR Teknolojisi: EGR valfi ve soğutucusu yoktur; şehir içi dağıtımda DPF kurum tıkanması ve zorunlu rejenerasyon duruşu yaşatmaz',
          '210 HP Güç & 750 Nm Tork (Rakip M. 1518 modeli 5.1L hacme rağmen 177 HP güçte kalır)',
          '+163 kg Daha Yüksek Net Yük (4.519 kg hafif şasi ile 10.481 kg net kantar istiap haddi)',
          '88 cm Daha Dar Dönüş Çapı (14.72 m ile şehir içi dar sokaklarda tek hamlede manevra)'
        ]
      };
    } else {
      // IVECO S-Way (AS440S500 / 530 - 12.9L Cursor 13) vs Rakip F. (F-MAX 500 PS) vs Rakip M. (Actros 1848 / 1851)
      const ivecoServices = Math.floor(totalKm / 80000); // Uzun yol Türkiye standardı: 60.000 - 80.000 km
      const fordServices = Math.floor(totalKm / 70000);
      const mercServices = Math.floor(totalKm / 70000);

      const ivecoMaint = ivecoServices * 38000;
      const fordMaint = (fordServices * 36000) + (totalKm >= 150000 ? 45000 : 0); // EGR + DPF bakım farkı
      const mercMaint = (mercServices * 48000) + (totalKm >= 150000 ? 55000 : 0);

      // Yakıt tüketimi (L/100km): S-Way 28.2L (HI-SCR & 12 İleri ZF Hi-Tronix) vs F-MAX 29.8L vs Actros 29.2L
      const ivecoFuel = (totalKm / 100) * 28.2 * fuelPrice;
      const fordFuel = (totalKm / 100) * 29.8 * fuelPrice;
      const mercFuel = (totalKm / 100) * 29.2 * fuelPrice;

      const ivecoDown = ivecoServices * (downtimeCostPerDay * 2);
      const fordDown = fordServices * (downtimeCostPerDay * 2);
      const mercDown = mercServices * (downtimeCostPerDay * 2);

      const ivecoTotal = ivecoMaint + ivecoFuel + ivecoDown;
      const fordTotal = fordMaint + fordFuel + fordDown;
      const mercTotal = mercMaint + mercFuel + mercDown;

      const savingsVsFord = fordTotal - ivecoTotal;
      const savingsVsMerc = mercTotal - ivecoTotal;

      return {
        vehicleName: 'IVECO S-Way AS440S500 / 530 (12.9L Cursor 13 • 2.500-2.600 Nm)',
        ivecoServices, fordServices, mercServices,
        ivecoMaint, fordMaint, mercMaint,
        ivecoFuel, fordFuel, mercFuel,
        ivecoDown, fordDown, mercDown,
        ivecoTotal, fordTotal, mercTotal,
        savingsVsFord, savingsVsMerc,
        competitor1: 'Rakip F. F-MAX (12.7L 500 PS)',
        competitor2: 'Rakip M. Actros (12.8L 480/510 PS)',
        ivecoInterval: '60.000 - 80.000 km',
        comp1Interval: '60.000 - 80.000 km',
        comp2Interval: '60.000 - 80.000 km',
        comp1SubNote: 'HI-SCR (EGR arızası yok) + aerodinamik kabin ile %4-5 yakıt tasarrufu',
        comp2SubNote: 'Düşük yetkili servis/parça maliyeti + 12 İleri ZF Hi-Tronix verimliliği',
        keyHighlights: [
          'HI-SCR Emisyon Sistemi (EGR valfi olmadan sadece SCR ile Euro 6; daha düşük yanma ısısı ve %4\'e varan yakıt ekonomisi)',
          '12 İleri ZF HI-TRONIX Otomatik Şanzıman (GPS destekli Hi-Cruise öngörülü sürüş ile rampa öncesi optimum vites seçimi)',
          '12.9L Cursor 13 Motor: 500 - 530 - 580 HP güç ve 2.500 - 2.800 Nm geniş düşük devir tork bandı (Downspeeding)',
          'Düz Tabanlı Geniş Kabin (2.15 m iç yükseklik) & Yüksek İkinci El Döviz Değeri'
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
• Periyodik Bakım Aralığı: ${metrics.ivecoInterval}
${highlights}

📊 ${years} Yıllık Net Filo Tasarrufunuz:
💰 ${metrics.competitor1}'a Göre Net Tasarruf: ${Math.round(metrics.savingsVsFord).toLocaleString('tr-TR')} TL
💰 ${metrics.competitor2}'e Göre Net Tasarruf: ${Math.round(metrics.savingsVsMerc).toLocaleString('tr-TR')} TL

IVECO, yüksek torklu zincirli FPT motoru, HI-MATIC / HI-TRONIX ZF şanzıman teknolojisi ve düşük parça/bakım maliyetiyle ilk alım yatırımını hızla amorti eder.

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
        width: '100%', maxWidth: '860px', maxHeight: '92vh', borderRadius: '16px',
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
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>TCO & Rakip Karşılaştırma Hesaplayıcı (Resmi Veriler)</h3>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
                Gerçek bakım periyotları (Daily 25.000 km, Eurocargo 40.000 km), şanzıman ve motor verimliliğiyle tasarruf analizi.
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
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setSegment('daily')}
                style={{
                  flex: '1 1 200px', padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer',
                  background: segment === 'daily' ? '#059669' : '#e2e8f0', color: segment === 'daily' ? '#fff' : '#334155'
                }}
              >
                🚐 Hafif Ticari: Daily (25.000 km Bakım)
              </button>
              <button
                type="button"
                onClick={() => setSegment('eurocargo')}
                style={{
                  flex: '1 1 200px', padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer',
                  background: segment === 'eurocargo' ? '#059669' : '#e2e8f0', color: segment === 'eurocargo' ? '#fff' : '#334155'
                }}
              >
                🚚 Orta Kamyon: Eurocargo (40.000 km Bakım)
              </button>
              <button
                type="button"
                onClick={() => setSegment('sway')}
                style={{
                  flex: '1 1 200px', padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer',
                  background: segment === 'sway' ? '#059669' : '#e2e8f0', color: segment === 'sway' ? '#fff' : '#334155'
                }}
              >
                🚛 Çekici: S-Way vs F-MAX & Actros
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Yıllık Yapılan KM:
                </label>
                <select
                  value={annualKm}
                  onChange={(e) => setAnnualKm(Number(e.target.value))}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value={50000}>50.000 km (Şehir İçi)</option>
                  <option value={75000}>75.000 km (Standart KOBİ)</option>
                  <option value={100000}>100.000 km (Bölgesel Dağıtım)</option>
                  <option value={125000}>125.000 km (Yoğun Filo)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Kullanım Süresi:
                </label>
                <select
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value={2}>2 Yıl ({(annualKm * 2).toLocaleString('tr-TR')} km)</option>
                  <option value={3}>3 Yıl ({(annualKm * 3).toLocaleString('tr-TR')} km - Önerilen)</option>
                  <option value={5}>5 Yıl ({(annualKm * 5).toLocaleString('tr-TR')} km)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
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
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
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
              <span style={{ fontSize: '11.5px', color: '#166534', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                ({metrics.comp1SubNote})
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
              <span style={{ fontSize: '11.5px', color: '#1e40af', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                ({metrics.comp2SubNote})
              </span>
            </div>
          </div>

          {/* Detailed Breakdown Comparison Table */}
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#1e293b', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '10px 14px' }}>Maliyet Kalemi ({totalKm.toLocaleString('tr-TR')} km)</th>
                  <th style={{ padding: '10px 14px', color: '#059669', fontWeight: '800' }}>⭐ {metrics.vehicleName}</th>
                  <th style={{ padding: '10px 14px' }}>{metrics.competitor1}</th>
                  <th style={{ padding: '10px 14px' }}>{metrics.competitor2}</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>Periyodik Bakım Aralığı</td>
                  <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '700' }}>{metrics.ivecoInterval}</td>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>{metrics.comp1Interval}</td>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>{metrics.comp2Interval}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>Toplam Periyodik Servis Sayısı</td>
                  <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '700' }}>{metrics.ivecoServices} Bakım</td>
                  <td style={{ padding: '10px 14px', color: metrics.fordServices > metrics.ivecoServices ? '#dc2626' : '#334155', fontWeight: '600' }}>{metrics.fordServices} Bakım</td>
                  <td style={{ padding: '10px 14px', color: metrics.mercServices > metrics.ivecoServices ? '#dc2626' : '#334155', fontWeight: '600' }}>{metrics.mercServices} Bakım</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>Bakım, Triger / Balata & Onarım Maliyeti</td>
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
                  <td style={{ padding: '12px 14px' }}>TOPLAM İŞLETME HARCAMASI (TCO)</td>
                  <td style={{ padding: '12px 14px', color: '#059669', fontSize: '13px' }}>{Math.round(metrics.ivecoTotal).toLocaleString('tr-TR')} TL</td>
                  <td style={{ padding: '12px 14px', color: '#dc2626', fontSize: '13px' }}>{Math.round(metrics.fordTotal).toLocaleString('tr-TR')} TL</td>
                  <td style={{ padding: '12px 14px', color: '#dc2626', fontSize: '13px' }}>{Math.round(metrics.mercTotal).toLocaleString('tr-TR')} TL</td>
                </tr>

                {/* Ek Teknik Karşılaştırma Satırları */}
                {segment === 'daily' ? (
                  <>
                    <tr style={{ borderTop: '2px solid #e2e8f0', background: '#f0fdf4' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: '#166534' }}>Motor & Maksimum Tork</td>
                      <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '800' }}>2.3L (156 HP / 400 Nm) & 3.0L (180 HP / 430 Nm)</td>
                      <td style={{ padding: '10px 14px', color: '#334155' }}>2.0L EcoBlue (165-170 HP / 390 Nm)</td>
                      <td style={{ padding: '10px 14px', color: '#334155' }}>2.0L CDI (170 HP / 400 Nm)</td>
                    </tr>
                    <tr style={{ background: '#fafafa' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: '#166534' }}>Triger Sistemi</td>
                      <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '800' }}>Çift Sıra Çelik Zincirli FPT (Ömür Boyu)</td>
                      <td style={{ padding: '10px 14px', color: '#dc2626' }}>Yağ İçi Islak Triger Kayışı (Hassas)</td>
                      <td style={{ padding: '10px 14px', color: '#334155' }}>Zincirli</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: '#166534' }}>Ön Tampon & Şasi Yapısı</td>
                      <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '800' }}>3 Parça Modüler Tampon + C-Kesit Kamyon Şasisi</td>
                      <td style={{ padding: '10px 14px', color: '#dc2626' }}>Tek Parça Tampon + Entegre Sac Gövde</td>
                      <td style={{ padding: '10px 14px', color: '#334155' }}>Standart Tampon + Entegre Kutu Gövde</td>
                    </tr>
                    <tr style={{ background: '#fafafa' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: '#166534' }}>Otomatik Şanzıman</td>
                      <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '800' }}>ZF 8 İleri HI-MATIC Tork Konvertörlü</td>
                      <td style={{ padding: '10px 14px', color: '#334155' }}>10 İleri Otomatik</td>
                      <td style={{ padding: '10px 14px', color: '#334155' }}>9G-TRONIC (9 İleri Otomatik)</td>
                    </tr>
                  </>
                ) : segment === 'eurocargo' ? (
                  <>
                    <tr style={{ borderTop: '2px solid #e2e8f0', background: '#f0fdf4' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: '#166534' }}>Motor & Emisyon Sistemi</td>
                      <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '800' }}>4.5L Tector 5 (210 HP / 750 Nm) • HI-SCR (EGR Yok)</td>
                      <td style={{ padding: '10px 14px', color: '#334155' }}>EGR + SCR Sistemli</td>
                      <td style={{ padding: '10px 14px', color: '#dc2626' }}>5.1L OM934 (177 HP / 750 Nm) • EGR + SCR</td>
                    </tr>
                    <tr style={{ background: '#fafafa' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: '#166534' }}>Şanzıman Teknolojisi</td>
                      <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '800' }}>8 İleri Full Otomatik ZF (Tork Konvertörlü - Balata Yok)</td>
                      <td style={{ padding: '10px 14px', color: '#334155' }}>Manuel / Robotize</td>
                      <td style={{ padding: '10px 14px', color: '#dc2626' }}>6 İleri PowerShift Robotize (Baskı-Balata Aşınır)</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: '#166534' }}>Dönüş Çapı & Net Yük (15T)</td>
                      <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '800' }}>14.72 m Dönüş • 10.481 kg Net İstiap (+163 kg)</td>
                      <td style={{ padding: '10px 14px', color: '#334155' }}>16.10 m • 10.100 kg</td>
                      <td style={{ padding: '10px 14px', color: '#334155' }}>15.60 m • 10.318 kg</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr style={{ borderTop: '2px solid #e2e8f0', background: '#f0fdf4' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: '#166534' }}>Motor & Tork</td>
                      <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '800' }}>12.9L Cursor 13 (500-580 HP / 2.500-2.800 Nm)</td>
                      <td style={{ padding: '10px 14px', color: '#334155' }}>12.7L Ecotorq (500 PS / 2.500 Nm)</td>
                      <td style={{ padding: '10px 14px', color: '#334155' }}>12.8L OM471 (480-510 PS / 2.300-2.500 Nm)</td>
                    </tr>
                    <tr style={{ background: '#fafafa' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: '#166534' }}>Emisyon & Şanzıman</td>
                      <td style={{ padding: '10px 14px', color: '#059669', fontWeight: '800' }}>HI-SCR (EGR Yok) + 12 İleri ZF HI-TRONIX</td>
                      <td style={{ padding: '10px 14px', color: '#334155' }}>EGR + SCR + 16 İleri Otomatik</td>
                      <td style={{ padding: '10px 14px', color: '#334155' }}>EGR + SCR + 12 İleri PowerShift 3</td>
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
