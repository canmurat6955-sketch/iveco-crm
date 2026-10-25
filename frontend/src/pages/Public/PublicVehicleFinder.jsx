import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { discoveryApi } from '../../api/client';
import toast, { Toaster } from 'react-hot-toast';
import {
  FiTruck,
  FiCheckCircle,
  FiDollarSign,
  FiShield,
  FiPhoneCall,
  FiMessageSquare,
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiLayers,
  FiCalendar,
  FiZap,
  FiChevronRight,
  FiDownload,
  FiFileText,
  FiAlertCircle,
  FiMaximize2,
  FiShare2,
  FiCopy
} from 'react-icons/fi';

// Sektör Seçenekleri
const SECTORS = [
  { id: 'gida_frigo', icon: '🥩', label: 'Soğuk Zincir & Gıda', desc: 'Et, süt, tavuk, dondurma, peynir ve medikal' },
  { id: 'kargo_dagitim', icon: '📦', label: 'Kargo & Dağıtım', desc: 'Şehir içi koli, e-ticaret, mobilya, beyaz eşya' },
  { id: 'insaat_malzeme', icon: '🏗️', label: 'İnşaat & Nalbur', desc: 'Demir, çimento, kereste, hırdavat, agrega' },
  { id: 'tarim_yem', icon: '🌾', label: 'Tarım, Un & Yem', desc: 'Çeltik, un çuvalı, fındık, tohum ve gübre' },
  { id: 'oto_kurtarma', icon: '🚚', label: 'Oto Kurtarma', desc: '7/24 kayar kasa araç taşıma ve yol yardım' },
  { id: 'agir_nakliye', icon: '🛣️', label: 'Ağır Vasıta & Çekici', desc: 'Şehirlerarası ve uluslararası tır taşımacılığı' }
];

// Hızlı Tonaj Seçenekleri
const QUICK_TONNAGES = [
  { id: '1_5_ton', label: '1.5 Ton', payloadKg: 1500, badge: 'B Ehliyet Kamyonet', desc: 'Otomobil ehliyeti, takografsız, şehir içine 7/24 serbest' },
  { id: '3_5_ton', label: '3.5 Ton', payloadKg: 3500, badge: 'B Ehliyet / Çift Teker', desc: 'Ağır yük kamyonet dayanımı, şehir içi serbest' },
  { id: '4_8_ton', label: '4.8 Ton', payloadKg: 4800, badge: 'Daily 72C Kamyon', desc: '7.970 kg kantar geçeri, sınıfının en yüksek net yükü' },
  { id: '6_5_ton', label: '6.5 Ton', payloadKg: 6500, badge: 'Eurocargo 100E', desc: '10.875 kg kantar geçeri, şehirlerarası ve bölge dağıtım' },
  { id: '8_0_ton', label: '8.0 Ton', payloadKg: 8000, badge: 'Eurocargo 120E', desc: '12.950 kg kantar geçeri, 6.50 metreye kadar kasa' },
  { id: '10_5_ton', label: '10.5 Ton', payloadKg: 10500, badge: 'Eurocargo 150E', desc: '16.060 kg kantar geçeri, 7.50 metreye kadar dev kasa' },
  { id: '11_0_ton', label: '11.0 Ton', payloadKg: 11000, badge: 'Eurocargo 160', desc: '17.080 kg kantar geçeri, havalı süspansiyon, 320 BG' },
  { id: '25_0_ton', label: '25 Ton+', payloadKg: 25000, badge: 'IVECO S-Way', desc: '40.000+ kg çekici katar ağırlığı, 13.60 dorse, 530 HP' },
];

// Kasa Seçenekleri ve Dara Ağırlıkları
const BODY_TYPES = [
  { id: 'frigo', icon: '❄️', name: 'Frigorifik Soğutuculu Kasa', tare: 1100, desc: '-18°C dondurucu veya +4°C taze gıda taşımacılığı' },
  { id: 'kapali_kutu', icon: '📦', name: 'Kapalı Kutu / Kargo Kasası', tare: 650, desc: 'Mobilya, tekstil, koli ve kuru gıda taşımacılığı' },
  { id: 'acik_sac', icon: '🪵', name: 'Açık Sac / Ahşap İlave Kasa', tare: 500, desc: 'Demir, profil, inşaat malzemesi ve paletli yük' },
  { id: 'kayar_perde', icon: '🚛', name: 'Kayar Perde / Tente Kasa', tare: 750, desc: 'Hızlı yan yükleme, paletli kargo ve içecek sevkiyatı' },
  { id: 'damper', icon: '🚜', name: 'Damper Kasa', tare: 1700, desc: 'Kum, çakıl, hafriyat ve dökme malzeme boşaltma' },
  { id: 'oto_kurtarma', icon: '🛞', name: 'Kayar Kasa Platform', tare: 1200, desc: 'Araç taşıma, vinç ve oto çekici üstyapısı' }
];

export default function PublicVehicleFinder() {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || 'whatsapp_durum';
  const customerIdParam = searchParams.get('cid') || searchParams.get('customer_id');
  const companyParam = searchParams.get('company') || searchParams.get('firma') || searchParams.get('comp') || '';
  const nameParam = searchParams.get('name') || searchParams.get('yetkili') || '';
  const phoneParam = searchParams.get('phone') || searchParams.get('tel') || '';
  const sectorParam = searchParams.get('sector') || '';
  const payloadParam = searchParams.get('payload') || searchParams.get('tonaj') || '';
  const volumeParam = searchParams.get('volume') || searchParams.get('hacim') || '';
  const bodyParam = searchParams.get('body') || searchParams.get('kasa') || '';

  const isPreviewMode = searchParams.get('preview') === 'true' || searchParams.get('test') === 'true' || searchParams.get('demo') === 'true';
  const isVipCustomer = Boolean(customerIdParam || companyParam || nameParam || phoneParam);

  const [step, setStep] = useState(1);
  const [selectedSector, setSelectedSector] = useState(
    SECTORS.some(s => s.id === sectorParam) ? sectorParam : 'gida_frigo'
  );
  
  // Tonaj & Hacim State'leri
  const [payloadKg, setPayloadKg] = useState(
    payloadParam && !isNaN(Number(payloadParam)) ? Number(payloadParam) : 4800
  );
  const [volumeM3, setVolumeM3] = useState(
    volumeParam && !isNaN(Number(volumeParam)) ? Number(volumeParam) : 28
  );
  const [customDims, setCustomDims] = useState(false);
  const [bodyLengthCm, setBodyLengthCm] = useState(580);
  const [bodyWidthCm, setBodyWidthCm] = useState(225);
  const [bodyHeightCm, setBodyHeightCm] = useState(220);
  const [selectedBody, setSelectedBody] = useState(
    BODY_TYPES.some(b => b.id === bodyParam) ? bodyParam : 'frigo'
  );

  // Kredi Parametreleri
  const [loanPrincipal, setLoanPrincipal] = useState(1500000);
  const [loanTerm, setLoanTerm] = useState(36);

  // Müşteri İletişim Formu (Mevcut Müşteri Linkinden Otomatik Doldurma)
  const [customerName, setCustomerName] = useState(nameParam);
  const [customerCompany, setCustomerCompany] = useState(companyParam);
  const [customerPhone, setCustomerPhone] = useState(phoneParam);
  const [customerCity, setCustomerCity] = useState('Samsun');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [startTime] = useState(Date.now());

  // Kişisel VIP Link tıklandığında CRM'e sessizce dijital niyet / ziyaret sinyali kaydet
  useEffect(() => {
    if (!isPreviewMode && (customerIdParam || phoneParam || companyParam)) {
      const parsedCid = customerIdParam ? parseInt(customerIdParam, 10) : undefined;
      discoveryApi.recordIntentSignal({
        source: 'whatsapp_personalized_link',
        search_query: `[Kişisel Link Ziyareti]: ${companyParam || nameParam || 'VIP Müşteri'} Araç Seçiciyi Açtı`,
        target_model: 'IVECO Şasi & Kasa Seçici',
        company_name: companyParam || nameParam || 'Kayıtlı Müşteri',
        phone: phoneParam || undefined,
        city: 'Samsun',
        page_url: window.location.href,
        referrer: document.referrer || 'whatsapp_chat',
        duration_seconds: 3,
        scroll_depth: 30,
        intent_score: 92,
        intent_level: 'high',
        matched_customer_id: !isNaN(parsedCid) ? parsedCid : undefined,
        notes: `Müşteri WhatsApp üzerinden iletilen kişiselleştirilmiş şasi & kantar seçici bağlantısını tıkladı.`
      }).catch(err => console.debug('Intent signal log error:', err));
    }
  }, [customerIdParam, phoneParam, companyParam, isPreviewMode]);

  // ── KESİN ŞASİ, KASA BOYUTLARI VE KANTAR EŞLEŞTİRME MOTORU ──────
  const matched = useMemo(() => {
    const bodyTare = BODY_TYPES.find(b => b.id === selectedBody)?.tare || 650;
    const targetVolume = customDims 
      ? (bodyLengthCm * bodyWidthCm * bodyHeightCm) / 1000000 
      : volumeM3;

    // 1. Ağır Vasıta & Çekici (≥ 18 Ton veya Ağır Nakliye)
    if (payloadKg >= 18000 || selectedSector === 'agir_nakliye') {
      return {
        modelTitle: 'IVECO S-Way 500 / 580 Çekici (Cursor 13)',
        series: 'S-Way 500',
        wheelbase: '3800 mm',
        badge: 'Uluslararası Tır & Çekici',
        license: 'CE Sınıfı Ehliyet',
        kantarLimit: 40000,
        unladenWeight: 7800,
        totalGross: 7800 + bodyTare + payloadKg,
        kantarStatus: 'safe',
        kantarTitle: '40.000+ kg Uluslararası Tır Katar Limiti',
        kantarDesc: 'Cursor 13 motor, Hi-Tronix şanzıman ve yüksek tavan çift yataklı kabin.',
        dims: {
          length: '1360 cm (Dorse)',
          width: '248 cm',
          height: '270 - 300 cm',
          volume: '90 - 100 m³',
          pallets: '33 Euro Palet'
        },
        pdfUrl: '/specs/s-way-500-full-plus.pdf',
        pdfName: 'S-WAY 500 FULL PLUS TEKNİK FÖY .pdf',
        priceRange: '115.000 € - 128.000 € + KDV',
        defaultLoan: 3000000
      };
    }

    // 2. Eurocargo 160 (11 Ton Net Yük veya Dingilsiz 5670 Şasi)
    if (payloadKg > 10500 || targetVolume > 52) {
      return {
        modelTitle: 'IVECO Eurocargo ML 160 E 32P (5670 mm Şasi)',
        series: 'Eurocargo 160',
        wheelbase: '5670 mm',
        badge: '17.080 kg Kantar Geçeri / 320 BG',
        license: 'C Sınıfı Kamyon',
        kantarLimit: 17080,
        unladenWeight: 5475, // Dingilsiz boş ağırlık
        totalGross: 5475 + bodyTare + payloadKg,
        kantarStatus: (5475 + bodyTare + payloadKg) <= 17080 ? 'safe' : 'overload',
        kantarTitle: '17.080 kg ile Kantardan Geçer',
        kantarDesc: 'Havalı süspansiyonlu, dingilsiz 5475 kg boş ağırlık, 7.50m - 8.20m dev kasa hacmi.',
        dims: {
          length: `${Math.max(750, Math.min(820, customDims ? bodyLengthCm : 780))} cm`,
          width: '230 - 255 cm',
          height: `${customDims ? bodyHeightCm : 240} cm`,
          volume: `${targetVolume.toFixed(1)} m³`,
          pallets: '18 - 20 Euro Palet'
        },
        pdfUrl: '/specs/eurocargo-ml160e32p.pdf',
        pdfName: 'ML 160 E 32P TEKNİK FÖY .pdf',
        priceRange: '4.100.000 TL - 4.450.000 TL + KDV',
        defaultLoan: 2500000
      };
    }

    // 3. Eurocargo 150E (10 Ton Net Yük / 4185 - 5175 Şasi)
    if (payloadKg > 8000 || targetVolume > 42) {
      const isSleeper = targetVolume > 48;
      const wb = isSleeper ? '5175 mm Yataklı' : '4455 mm Yataksız';
      const lenRange = isSleeper ? '710 - 750 cm' : '650 - 690 cm';
      return {
        modelTitle: `IVECO Eurocargo ML 150 E 21 (${wb} Şasi)`,
        series: 'Eurocargo 150E',
        wheelbase: wb,
        badge: '16.060 kg Kantar Geçeri / 10.5 Ton Net',
        license: 'C Sınıfı Kamyon',
        kantarLimit: 16060,
        unladenWeight: 4750,
        totalGross: 4750 + bodyTare + payloadKg,
        kantarStatus: (4750 + bodyTare + payloadKg) <= 16060 ? 'safe' : 'overload',
        kantarTitle: '16.060 kg ile Kantardan Geçer',
        kantarDesc: `Tector 7 motor, 4750 kg boş ağırlık, ${lenRange} kasa boyu seçeneği.`,
        dims: {
          length: `${isSleeper ? 730 : 670} cm (Kasa aralığı: ${lenRange})`,
          width: '230 - 250 cm',
          height: `${customDims ? bodyHeightCm : 230} cm`,
          volume: `${targetVolume.toFixed(1)} m³`,
          pallets: isSleeper ? '18 Euro Palet' : '16 Euro Palet'
        },
        pdfUrl: '/specs/eurocargo-ml150e21.pdf',
        pdfName: 'ML 150 E 21 TEKNİK FÖY .pdf',
        priceRange: '3.650.000 TL - 3.950.000 TL + KDV',
        defaultLoan: 2000000
      };
    }

    // 4. Eurocargo 120E (8 Ton Net Yük / 3690 - 4185 Şasi)
    if (payloadKg > 6500 || targetVolume > 35) {
      const isLong = targetVolume > 38 || (customDims && bodyLengthCm > 575);
      const wb = isLong ? '4185 mm' : '3690 mm';
      const lenRange = isLong ? '610 - 650 cm' : '540 - 575 cm';
      return {
        modelTitle: `IVECO Eurocargo ML 120 EL 19 (${wb} Şasi)`,
        series: 'Eurocargo 120E',
        wheelbase: wb,
        badge: '12.950 kg Kantar Geçeri / 8 Ton Net',
        license: 'C Sınıfı Kamyon',
        kantarLimit: 12950,
        unladenWeight: 4000,
        totalGross: 4000 + bodyTare + payloadKg,
        kantarStatus: (4000 + bodyTare + payloadKg) <= 12950 ? 'safe' : 'overload',
        kantarTitle: '12.950 kg ile Kantardan Geçer',
        kantarDesc: `4.000 kg boş ağırlık (şoför+yakıt dahil), ${lenRange} kasa konulabilir.`,
        dims: {
          length: `${isLong ? 630 : 560} cm (Kasa aralığı: ${lenRange})`,
          width: '225 - 245 cm',
          height: `${customDims ? bodyHeightCm : 225} cm`,
          volume: `${targetVolume.toFixed(1)} m³`,
          pallets: isLong ? '16 Euro Palet' : '14 Euro Palet'
        },
        pdfUrl: '/specs/eurocargo-ml120el19.pdf',
        pdfName: 'ML 120 EL 19 TEKNİK FÖY .pdf',
        priceRange: '3.300.000 TL - 3.550.000 TL + KDV',
        defaultLoan: 2000000
      };
    }

    // 5. Eurocargo 100E (6.5 Ton Net Yük / 3690 Şasi)
    if (payloadKg > 4800 || targetVolume > 30) {
      return {
        modelTitle: 'IVECO Eurocargo ML 100 E 19 (3690 mm Şasi)',
        series: 'Eurocargo 100E',
        wheelbase: '3690 mm',
        badge: '10.875 kg Kantar Geçeri / 6.5 Ton Net',
        license: 'C Sınıfı Kamyon',
        kantarLimit: 10875,
        unladenWeight: 3680,
        totalGross: 3680 + bodyTare + payloadKg,
        kantarStatus: (3680 + bodyTare + payloadKg) <= 10875 ? 'safe' : 'overload',
        kantarTitle: '10.875 kg ile Kantardan Geçer',
        kantarDesc: '3.680 kg boş ağırlık (şoför+yakıt dahil), 540 cm ila 575 cm kasa boyu.',
        dims: {
          length: '540 - 575 cm (Önerilen: 560 cm)',
          width: '225 - 245 cm',
          height: `${customDims ? bodyHeightCm : 220} cm`,
          volume: `${targetVolume.toFixed(1)} m³`,
          pallets: '14 Euro Palet'
        },
        pdfUrl: '/specs/eurocargo-ml100e19.pdf',
        pdfName: 'ML 100 E 19 TEKNİK FÖY .pdf',
        priceRange: '2.950.000 TL - 3.200.000 TL + KDV',
        defaultLoan: 1500000
      };
    }

    // 6. Daily 72C (4.8 Ton Net Yük / 3750 - 4350 - 4750 Şasi)
    if (payloadKg > 2000 || targetVolume > 26) {
      let wb = '4750 mm';
      let lenRange = '580 - 620 cm';
      let recLen = 600;
      if (targetVolume <= 20 && !customDims) {
        wb = '3750 mm';
        lenRange = '410 - 450 cm';
        recLen = 430;
      } else if (targetVolume <= 26 && !customDims) {
        wb = '4350 mm';
        lenRange = '515 - 540 cm';
        recLen = 525;
      }

      const totalGross = 2400 + bodyTare + payloadKg;
      return {
        modelTitle: `IVECO Daily 72C18 Şasi (${wb} Şasi)`,
        series: 'Daily 72C',
        wheelbase: wb,
        badge: '7.970 kg Kantar Geçeri / 4.8 Ton Net Yük',
        license: 'C Sınıfı Kamyon',
        kantarLimit: 7970,
        unladenWeight: 2400,
        totalGross: totalGross,
        kantarStatus: totalGross <= 7970 ? 'safe' : 'overload',
        kantarTitle: '7.970 kg ile Kantardan Geçer',
        kantarDesc: `2.400 kg boş ağırlık (şoför+yakıt dahil), ${lenRange} kasa seçeneği, 3.0L 180 HP C-profil şasi.`,
        dims: {
          length: `${recLen} cm (Kasa aralığı: ${lenRange})`,
          width: '215 - 235 cm (Önerilen: 225 cm)',
          height: '160 - 300 cm (Önerilen: 220 cm)',
          volume: `${targetVolume.toFixed(1)} m³`,
          pallets: '12 - 14 Euro Palet'
        },
        pdfUrl: '/specs/daily-kamyon-70c-72c.pdf',
        pdfName: 'DAILY KAMYON TEKNİK FÖY.pdf',
        priceRange: '2.350.000 TL - 2.580.000 TL + KDV',
        defaultLoan: 1500000
      };
    }

    // 7. Daily 35C (Çift Teker - B Ehliyet)
    if (payloadKg > 1500 || selectedSector === 'insaat_malzeme' || selectedSector === 'tarim_yem') {
      let wb = '3750 mm';
      let lenRange = '410 - 450 cm';
      let recLen = 430;
      if (targetVolume <= 18) {
        wb = '3450 mm';
        lenRange = '350 - 380 cm';
        recLen = 365;
      } else if (targetVolume > 22) {
        wb = '4100 mm';
        lenRange = '460 - 500 cm';
        recLen = 480;
      }

      return {
        modelTitle: `IVECO Daily 35C16 Çift Teker (${wb} Şasi)`,
        series: 'Daily 35C',
        wheelbase: wb,
        badge: 'B Sınıfı Ehliyet / Çift Arka Teker',
        license: 'B Sınıfı (Otomobil Ehliyeti)',
        kantarLimit: 4130,
        unladenWeight: 2200,
        totalGross: 2200 + bodyTare + payloadKg,
        kantarStatus: 'exempt',
        kantarTitle: 'Kamyonet Statüsünde (Kantara Girmiyor)',
        kantarDesc: '2.200 kg boş ağırlık, 4.130 kg yasal kantar geçeri (aktif kantar çağrısı yok). Çift teker ağır yük dayanımı.',
        dims: {
          length: `${recLen} cm (Kasa aralığı: ${lenRange})`,
          width: '215 - 235 cm (Önerilen: 220 cm)',
          height: '160 - 300 cm (Önerilen: 210 cm)',
          volume: `${targetVolume.toFixed(1)} m³`,
          pallets: '8 - 10 Euro Palet'
        },
        pdfUrl: '/specs/daily-kamyonet-35s-35c.pdf',
        pdfName: 'DAILY KAMYONET TEKNİK FÖY .pdf',
        priceRange: '1.780.000 TL - 1.950.000 TL + KDV',
        defaultLoan: 1000000
      };
    }

    // 8. Daily 35S (Tek Teker - B Ehliyet)
    let wb = '3450 mm';
    let lenRange = '350 - 380 cm';
    let recLen = 365;
    if (targetVolume > 20) {
      wb = '4100 mm';
      lenRange = '460 - 500 cm';
      recLen = 480;
    } else if (targetVolume > 16) {
      wb = '3750 mm';
      lenRange = '410 - 450 cm';
      recLen = 430;
    }

    return {
      modelTitle: `IVECO Daily 35S16 Tek Teker (${wb} Şasi)`,
      series: 'Daily 35S',
      wheelbase: wb,
      badge: 'B Sınıfı Ehliyet / Tek Teker Şasi',
      license: 'B Sınıfı (Otomobil Ehliyeti)',
      kantarLimit: 4130,
      unladenWeight: 2000,
      totalGross: 2000 + bodyTare + payloadKg,
      kantarStatus: 'exempt',
      kantarTitle: 'Kamyonet Statüsünde (Kantara Girmiyor)',
      kantarDesc: '2.000 kg boş ağırlık (şoför+yakıt dahil), şehir merkezine 7/24 takografsız serbest giriş.',
      dims: {
        length: `${recLen} cm (Kasa aralığı: ${lenRange})`,
        width: '215 - 235 cm (Önerilen: 215 cm)',
        height: '160 - 300 cm (Önerilen: 200 cm)',
        volume: `${targetVolume.toFixed(1)} m³`,
        pallets: '8 Euro Palet'
      },
      pdfUrl: '/specs/daily-kamyonet-35s-35c.pdf',
      pdfName: 'DAILY KAMYONET TEKNİK FÖY .pdf',
      priceRange: '1.690.000 TL - 1.820.000 TL + KDV',
      defaultLoan: 1000000
    };
  }, [payloadKg, volumeM3, customDims, bodyLengthCm, bodyWidthCm, bodyHeightCm, selectedBody, selectedSector]);

  // Kredi Hesaplama (Kuveyt Türk 6 Ay Ödemesiz)
  const loanCalculations = useMemo(() => {
    let monthly = 48808;
    let total = 1757097;
    let rate = '%2.40';

    if (loanPrincipal === 1000000) {
      if (loanTerm === 24) {
        monthly = 62390;
        total = 1497371;
        rate = '%2.21';
      } else {
        monthly = 48808;
        total = 1757097;
        rate = '%2.40';
      }
    } else if (loanPrincipal === 1500000) {
      if (loanTerm === 24) {
        monthly = 98972;
        total = 2375326;
        rate = '%2.55';
      } else {
        monthly = 77336;
        total = 2784087;
        rate = '%2.67';
      }
    } else if (loanPrincipal === 2000000) {
      if (loanTerm === 24) {
        monthly = 132176;
        total = 3172216;
        rate = '%2.20';
      } else {
        monthly = 103526;
        total = 3726932;
        rate = '%2.32';
      }
    } else {
      // 3.000.000 TL
      if (loanTerm === 24) {
        monthly = 198000;
        total = 4752000;
        rate = '%2.20';
      } else {
        monthly = 154500;
        total = 5562000;
        rate = '%2.35';
      }
    }

    return { monthly, total, rate };
  }, [loanPrincipal, loanTerm]);

  // Form Gönderimi (Teklif İste & CRM'e Lead / Müşteri Etkileşimi Olarak Yaz)
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      toast.error('Lütfen geçerli bir telefon numarası girin (örn: 0532 555 10 14)');
      return;
    }

    setSubmitting(true);
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    const parsedCid = customerIdParam ? parseInt(customerIdParam, 10) : undefined;

    const leadPayload = {
      source: customerIdParam ? 'crm_existing_customer' : (refCode || 'whatsapp_link'),
      search_query: `[Şasi & Kasa Seçici]: ${selectedSector} | ${payloadKg} kg | ${volumeM3} m3 | ${selectedBody}`,
      target_model: matched.modelTitle,
      target_campaign: `Kuveyt Türk 6 Ay Ödemesiz (${loanPrincipal.toLocaleString('tr-TR')} TL / ${loanTerm} Ay)`,
      company_name: customerCompany.trim() || customerName.trim() || 'WhatsApp Ziyaretçisi',
      city: customerCity,
      phone: customerPhone.trim(),
      page_url: window.location.href,
      referrer: document.referrer || 'whatsapp_chat',
      duration_seconds: durationSeconds,
      scroll_depth: 100,
      intent_score: 99,
      intent_level: 'very_high',
      matched_customer_id: !isNaN(parsedCid) ? parsedCid : undefined,
      notes: `Müşteri Akıllı Şasi Seçiciyi kullandı.\nModel: ${matched.modelTitle}\nŞasi: ${matched.wheelbase}\nYük: ${payloadKg} kg, Hacim: ${matched.dims.volume}\nKasa: ${matched.dims.length} x ${matched.dims.width} x ${matched.dims.height}\nKantar Sınırı: ${matched.kantarLimit} kg, Boş Ağırlık: ${matched.unladenWeight} kg\nMüşteri Notu: ${customerNotes}`
    };

    if (isPreviewMode) {
      setSubmitted(true);
      setSubmitting(false);
      toast.success('🛠️ TEST MODU: Simülasyon başarılı! Gerçek müşteride bu veriler anında Satış Pipeline\'ına düşer.', { duration: 5000 });
      return;
    }

    try {
      await discoveryApi.recordIntentSignal(leadPayload);
      setSubmitted(true);
      toast.success('Talebiniz alındı! Satış Temsilcimiz Can Murat (Sales Priest) sizinle iletişime geçecektir.');
    } catch (err) {
      console.error(err);
      toast.error('Kayıt alınırken bir sorun oluştu, lütfen doğrudan WhatsApp üzerinden iletişime geçin.');
    } finally {
      setSubmitting(false);
    }
  };

  // Doğrudan WhatsApp Aç (Can Murat)
  const handleDirectWhatsApp = () => {
    const cleanPhone = '905325551014';
    const clientGreeting = (customerCompany || customerName)
      ? `Merhaba Can Bey, ben ${customerCompany || customerName}. Paylaştığınız IVECO Akıllı Şasi, Kasa ve Finansman Seçici üzerinden inceleme yaptım.\n\n`
      : `Merhaba Can Bey, paylaştığınız IVECO Akıllı Şasi, Kasa ve Kredi Seçici üzerinden inceleme yaptım.\n\n`;

    const msg = (
      clientGreeting +
      `🚛 *Tavsiye Edilen Model:* ${matched.modelTitle}\n` +
      `📐 *Önerilen Kasa Boyutları:* ${matched.dims.length} × ${matched.dims.width} × ${matched.dims.height} (${matched.dims.volume})\n` +
      `⚖️ *Yük İhtiyacım:* ${payloadKg} kg Net Yük | Kantar Durumu: ${matched.kantarTitle}\n` +
      `💳 *İlgilendiğim Kredi:* Kuveyt Türk 6 Ay Ödemesiz (${loanPrincipal.toLocaleString('tr-TR')} TL / ${loanTerm} Ay)\n\n` +
      `Bu aracın hazır şasi stok durumu ve resmi teklifi hakkında görüşmek istiyorum.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Sayfayı Paylaş / Linki Kopyala
  const handleShareLink = async () => {
    const shareUrl = window.location.href;
    const shareTitle = 'IVECO Akıllı Şasi, Kasa & Finansman Seçici';
    const shareText = `İşinize en uygun IVECO şasisini, kasa ölçülerini ve 6 ay ödemesiz kredi planını buradan hesaplayabilirsiniz:\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {}
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Konfigürasyon bağlantısı kopyalandı! 📋');
    } catch {
      toast.error('Bağlantı kopyalanamadı.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #080b16 0%, #0d1224 100%)',
      color: '#e2e8f0',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '16px 12px 60px'
    }}>
      <Toaster position="top-center" />

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div style={{ maxWidth: '680px', margin: '0 auto 20px', textAlign: 'center' }}>
        
        {/* Test & Önizleme Modu Rozeti (Can Murat Kontrol Paneli) */}
        {isPreviewMode && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.35) 0%, rgba(180, 83, 9, 0.45) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.65)',
            borderRadius: '14px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            textAlign: 'left',
            boxShadow: '0 4px 15px rgba(217, 119, 6, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.4rem' }}>🛠️</span>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24' }}>
                  CANLI TEST & ÖNİZLEME MODU (Sales Priest: Can Murat)
                </div>
                <div style={{ fontSize: '0.74rem', color: '#fef3c7' }}>
                  Bu ekranı şu anda sadece siz test ediyorsunuz. Müşteriye göndermeden önce tüm kasa ölçülerini, kantar sınırlarını ve WhatsApp butonunu deneyebilirsiniz.
                </div>
              </div>
            </div>
            <span style={{
              background: '#b45309',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: 800,
              flexShrink: 0
            }}>
              GİZLİ TEST
            </span>
          </div>
        )}

        {/* VIP Karşılama Kartı (Linkten Müşteri / Firma Bilgisi Gelmişse) */}
        {isVipCustomer && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 75, 147, 0.45) 0%, rgba(15, 23, 42, 0.85) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.45)',
            borderRadius: '16px',
            padding: '14px 18px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 8px 24px rgba(0, 75, 147, 0.25)',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                flexShrink: 0,
                boxShadow: '0 0 14px rgba(2, 132, 199, 0.5)'
              }}>
                ✨
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  FİRMANIZA ÖZEL HAZIRLANDI
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.25 }}>
                  Sayın {customerCompany || customerName || 'Değerli Müşterimiz'}, Hoş Geldiniz!
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
                  Satış Sorumlunuz <strong style={{ color: '#e2e8f0' }}>Can Murat (Sales Priest)</strong> operasyonunuza özel teknik şasi ve kantar simülasyonunu hazırladı.
                </div>
              </div>
            </div>
            <button
              onClick={handleShareLink}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#f8fafc',
                borderRadius: '10px',
                padding: '7px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0
              }}
              title="Bu bağlantıyı kopyala veya paylaş"
            >
              <FiShare2 size={13} /> Paylaş
            </button>
          </div>
        )}

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 75, 147, 0.25)', border: '1px solid rgba(43, 125, 233, 0.4)', padding: '6px 14px', borderRadius: '30px', marginBottom: '10px' }}>
          <span style={{ color: '#60a5fa', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '1px' }}>IVECO ERC OTOMOTİV</span>
          <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>• Samsun Yetkili Bayi</span>
        </div>

        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.3, margin: '0 0 6px' }}>
          İşinize En Uygun IVECO Şasisini, Kasa Ölçüsünü ve Kredi Planını Belirleyin
        </h1>
        <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0 }}>
          Taşıyacağınız tonaj ve kasa hacmini seçin; sistemimiz kantar sınırına en uygun şasiyi, kasa ebatlarını ve <strong>Kuveyt Türk 6 Ay Ödemesiz</strong> taksit tutarını anında hesaplasın.
        </p>

        {/* Can Murat Temsilci Rozeti (Sales Priest) & Paylaş Butonu */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(99, 179, 237, 0.25)',
          borderRadius: '25px',
          padding: '6px 16px',
          marginTop: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#004B93', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
            CM
          </div>
          <div style={{ textAlign: 'left', fontSize: '0.78rem' }}>
            <span style={{ color: '#f8fafc', fontWeight: 700, display: 'block' }}>Can Murat</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>Sales Priest</span>
          </div>
          <button
            onClick={handleDirectWhatsApp}
            style={{
              background: '#22c55e',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              marginLeft: '6px'
            }}
          >
            <FiMessageSquare size={12} /> WhatsApp
          </button>
          <button
            onClick={handleShareLink}
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '20px',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
            title="Sistemin linkini kopyala"
          >
            <FiCopy size={12} /> Linki Kopyala
          </button>
        </div>
      </div>

      {/* ── STEPPER BAR (2 ADIM: TONAJ & METREKÜP ➔ KREDİ & TEKLİF PLANI) ── */}
      <div style={{ maxWidth: '680px', margin: '0 auto 20px', display: 'flex', justifyContent: 'center', gap: '14px', position: 'relative' }}>
        {[
          { num: 1, label: '1. Tonaj & Metreküp' },
          { num: 2, label: '2. Kredi & Teklif Planı' }
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => s.num < step && setStep(s.num)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: s.num < step ? 'pointer' : 'default',
              padding: '8px 18px',
              borderRadius: '24px',
              background: step === s.num ? 'rgba(0, 75, 147, 0.45)' : 'rgba(15, 23, 42, 0.6)',
              border: step === s.num ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: step === s.num ? '#0284c7' : step > s.num ? '#10b981' : '#1e293b',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.82rem'
            }}>
              {step > s.num ? <FiCheck size={14} /> : s.num}
            </div>
            <span style={{ fontSize: '0.84rem', color: step === s.num ? '#38bdf8' : '#94a3b8', fontWeight: step === s.num ? 800 : 500 }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── CARD CONTENT ────────────────────────────────────────── */}
      <div style={{
        maxWidth: '680px',
        margin: '0 auto',
        background: 'rgba(17, 24, 51, 0.85)',
        border: '1px solid rgba(99, 179, 237, 0.2)',
        borderRadius: '16px',
        padding: '22px 20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(8px)'
      }}>

        {/* ── ADIM 1: TONAJ & METREKÜP SEÇİMİ ─────────────────────── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px', color: '#f8fafc' }}>
              1. Taşıyacağınız Net Yük (Tonaj) ve Kasa Hacmi (Metreküp)
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '18px' }}>
              İşinize uygun net tonajı ve metreküpü belirleyin; sistemimiz kantar sınırına en uygun şasiyi ve Kuveyt Türk 6 ay ödemesiz kredi planınızı anında hazırlasın:
            </p>

            {/* Net Yük Ağırlığı Sürgüsü */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                  TAŞINACAK NET YÜK AĞIRLIĞI:
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>
                  {(payloadKg / 1000).toFixed(1)} Ton ({payloadKg.toLocaleString('tr-TR')} kg)
                </span>
              </div>

              <input
                type="range"
                min="1000"
                max="25000"
                step="250"
                value={payloadKg}
                onChange={e => setPayloadKg(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0284c7', marginBottom: '12px' }}
              />

              {/* Hızlı Çipler */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {QUICK_TONNAGES.map(qt => (
                  <button
                    key={qt.id}
                    type="button"
                    onClick={() => setPayloadKg(qt.payloadKg)}
                    style={{
                      background: payloadKg === qt.payloadKg ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
                      color: payloadKg === qt.payloadKg ? '#fff' : '#94a3b8',
                      border: '1px solid',
                      borderColor: payloadKg === qt.payloadKg ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: payloadKg === qt.payloadKg ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {qt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Kasa Hacmi (m³) / Boyutlar */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                  TALEP EDİLEN KASA HACMİ (m³):
                </span>
                <button
                  type="button"
                  onClick={() => setCustomDims(!customDims)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#38bdf8',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {customDims ? 'm³ Sürgüsüne Dön' : 'Özel Kasa Ebatı (cm) Gir'}
                </button>
              </div>

              {!customDims ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>İdeal Kasa Hacmi:</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10b981' }}>{volumeM3} m³</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="65"
                    step="1"
                    value={volumeM3}
                    onChange={e => setVolumeM3(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#10b981', marginBottom: '6px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b' }}>
                    <span>12 m³ (Kamyonet)</span>
                    <span>28 m³ (7.2 Ton Kamyon)</span>
                    <span>45 m³ (Eurocargo)</span>
                    <span>65 m³ (Dev Hacim)</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Dış Boy (cm)</label>
                    <input
                      type="number"
                      value={bodyLengthCm}
                      onChange={e => setBodyLengthCm(Number(e.target.value))}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 8px', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Dış En (cm)</label>
                    <input
                      type="number"
                      value={bodyWidthCm}
                      onChange={e => setBodyWidthCm(Number(e.target.value))}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 8px', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Yükseklik (cm)</label>
                    <input
                      type="number"
                      value={bodyHeightCm}
                      onChange={e => setBodyHeightCm(Number(e.target.value))}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 8px', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ⚡ ANLIK EŞLEŞEN İDEAL ŞASİ ÖNİZLEMESİ */}
            <div style={{
              background: 'rgba(0, 75, 147, 0.3)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#93c5fd', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  OTOMATİK EŞLEŞEN İDEAL ŞASİ:
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                  {matched.modelTitle} ({matched.wheelbase})
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '3px' }}>
                  {matched.kantarTitle} · Kasa: {matched.dims.length} × {matched.dims.width}
                </div>
              </div>
              <div style={{
                background: matched.kantarStatus === 'safe' ? '#10b981' : '#38bdf8',
                color: '#0f172a',
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                fontWeight: 800
              }}>
                {matched.kantarStatus === 'safe' ? 'KANTAR UYGUN ✓' : 'KANTAR DENGELİ'}
              </div>
            </div>

            {/* İLERLEME BUTONU */}
            <button
              onClick={() => setStep(2)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                fontWeight: 800,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
              }}
            >
              <span>Kredi & Taksit Planına Geç (Kuveyt Türk 6 Ay Ödemesiz)</span>
              <FiArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ── ADIM 2: EŞLEŞEN ŞASİ, KASA BOYUTLARI, KANTAR & KREDİ ─ */}
        {step === 2 && (
          <div>
            {/* Geri Dön Butonu */}
            <div style={{ marginBottom: '14px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <FiArrowLeft size={14} /> Tonaj ve Metreküpü Değiştir
              </button>
            </div>

            {/* Eşleşen Araç Kartı */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 75, 147, 0.4) 0%, rgba(16, 185, 129, 0.15) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '14px',
              padding: '18px',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: 6 }}>
                <span style={{ background: '#10b981', color: '#0f172a', fontWeight: 800, fontSize: '0.72rem', padding: '3px 8px', borderRadius: '12px' }}>
                  ✓ İHTİYACINIZA EN UYGUN ŞASİ
                </span>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>
                  {matched.badge}
                </span>
              </div>

              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px' }}>
                {matched.modelTitle}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0 0 14px' }}>
                Şasi: <strong style={{ color: '#38bdf8' }}>{matched.wheelbase}</strong> · Ehliyet: <strong style={{ color: '#f8fafc' }}>{matched.license}</strong>
              </p>

              {/* 📐 KASA ÖLÇÜLERİ & HACİM KUTUSU */}
              <div style={{
                background: 'rgba(10, 18, 36, 0.8)',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  📐 ŞASİYE UYGUN KASA BOYUTLARI:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px 4px' }}>
                    <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>KASA BOYU</span>
                    <strong style={{ fontSize: '0.82rem', color: '#38bdf8' }}>{matched.dims.length}</strong>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px 4px' }}>
                    <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>KASA ENİ</span>
                    <strong style={{ fontSize: '0.82rem', color: '#38bdf8' }}>{matched.dims.width}</strong>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', padding: '8px 4px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <span style={{ fontSize: '0.65rem', color: '#10b981', display: 'block' }}>NET HACİM</span>
                    <strong style={{ fontSize: '0.82rem', color: '#10b981' }}>{matched.dims.volume}</strong>
                  </div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Euro Palet Kapasitesi: <strong style={{ color: '#fff' }}>{matched.dims.pallets}</strong></span>
                  <span>Kasa Yüksekliği: <strong style={{ color: '#38bdf8' }}>{matched.dims.height}</strong></span>
                </div>
              </div>

              {/* ⚖️ KANTAR KARNESİ & GÜVENLİK ANALİZİ */}
              <div style={{
                background: matched.kantarStatus === 'safe' ? 'rgba(16, 185, 129, 0.12)' : matched.kantarStatus === 'exempt' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: '1px solid',
                borderColor: matched.kantarStatus === 'safe' ? 'rgba(16, 185, 129, 0.4)' : matched.kantarStatus === 'exempt' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  {matched.kantarStatus === 'overload' ? (
                    <FiAlertCircle size={18} style={{ color: '#ef4444' }} />
                  ) : (
                    <FiCheckCircle size={18} style={{ color: matched.kantarStatus === 'safe' ? '#10b981' : '#38bdf8' }} />
                  )}
                  <strong style={{ fontSize: '0.85rem', color: matched.kantarStatus === 'overload' ? '#ef4444' : '#fff' }}>
                    {matched.kantarTitle}
                  </strong>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  {matched.kantarDesc}
                </p>

                {/* Ağırlık Dökümü */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '8px 10px', fontSize: '0.7rem' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Araç Boş (Şoför+Yakıt):</span>
                    <strong style={{ color: '#fff' }}>{matched.unladenWeight} kg</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Kasa Ağırlığı:</span>
                    <strong style={{ color: '#fff' }}>+{BODY_TYPES.find(b => b.id === selectedBody)?.tare || 650} kg</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Yükünüz:</span>
                    <strong style={{ color: '#38bdf8' }}>+{payloadKg} kg</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Kantar Sınırı:</span>
                    <strong style={{ color: '#10b981' }}>{matched.kantarLimit} kg</strong>
                  </div>
                </div>
              </div>

              {/* 📄 TEKNİK FÖY İNDİRME BUTONU */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <a
                  href={matched.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    padding: '10px',
                    color: '#fff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none'
                  }}
                  title="Resmi Teknik Föy PDF"
                >
                  <FiDownload size={15} style={{ color: '#38bdf8' }} />
                  <span>Resmi Teknik Föyü İndir (PDF)</span>
                </a>
              </div>
            </div>

            {/* ── KUVEYT TÜRK 6 AY ÖDEMESİZ FİNANSMAN KARTI ─────── */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>
                  <FiDollarSign />
                </span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fbbf24', margin: 0 }}>
                  Kuveyt Türk 6 Ay Ödemesiz - Bayi Katkılı Kampanya
                </h4>
              </div>

              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '14px' }}>
                Aracınızı hemen teslim alın; ilk <strong>6 ay boyunca 0 TL taksit</strong> ödeyin!
              </p>

              {/* Kredi Tutarı Butonları */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  KREDİ TUTARI SEÇİN:
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[1000000, 1500000, 2000000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setLoanPrincipal(amt)}
                      style={{
                        flex: 1,
                        background: loanPrincipal === amt ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                        color: loanPrincipal === amt ? '#0f172a' : '#f8fafc',
                        border: '1px solid',
                        borderColor: loanPrincipal === amt ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {amt.toLocaleString('tr-TR')} TL
                    </button>
                  ))}
                </div>
              </div>

              {/* Vade Seçimi */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  VADE SEÇENEĞİ (İLK 6 AY ERTELEMELİ):
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { months: 24, label: '24 Ay (6 Ay Ödemesiz + 18 Taksit)' },
                    { months: 36, label: '36 Ay (6 Ay Ödemesiz + 30 Taksit)' }
                  ].map(t => (
                    <button
                      key={t.months}
                      onClick={() => setLoanTerm(t.months)}
                      style={{
                        flex: 1,
                        background: loanTerm === t.months ? '#0284c7' : 'rgba(255,255,255,0.06)',
                        color: loanTerm === t.months ? '#fff' : '#f8fafc',
                        border: '1px solid',
                        borderColor: loanTerm === t.months ? '#38bdf8' : 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hesaplanan Taksit Özeti */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    İlk 6 Ay Sonraki Aylık Taksit:
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fbbf24' }}>
                    {loanCalculations.monthly.toLocaleString('tr-TR')} TL <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/ ay</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                    İlk 6 Ay: 0 TL
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Avantajlı Oran: {loanCalculations.rate}
                  </div>
                </div>
              </div>
            </div>

            {/* ── İLETİŞİM & TEKLİF ALMA FORMU ──────────────────────── */}
            {!submitted ? (
              <form onSubmit={handleSubmitLead} style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(99, 179, 237, 0.2)', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 4px' }}>
                  📋 Can Murat (Sales Priest) — Resmi Teklif & Şasi Rezervasyonu
                </h4>
                <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '0 0 12px' }}>
                  Bilgilerinizi bırakın; Can Murat aracın fabrika şasi teslim tarihini ve firmanıza özel teklifini 15 dakikada iletsin.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <input
                      type="text"
                      placeholder="Adınız Soyadınız *"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#fff',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Firma / Ticari Ünvan"
                      value={customerCompany}
                      onChange={(e) => setCustomerCompany(e.target.value)}
                      style={{
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#fff',
                        fontSize: '0.85rem'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Şehir (Örn: Samsun)"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      style={{
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#fff',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      placeholder="Cep Telefonu (05XX XXX XX XX) *"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#38bdf8',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div>
                    <textarea
                      placeholder="İlave Notunuz / Mevcut Araç Takas Talebiniz (Opsiyonel)"
                      rows={2}
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: '#fff',
                        fontSize: '0.82rem',
                        resize: 'none'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #004B93 0%, #2b7de9 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(43, 125, 233, 0.4)'
                  }}
                >
                  {submitting ? 'İletiliyor...' : '📞 Can Murat Beni Arasın & Teklif Göndersin'}
                </button>
              </form>
            ) : (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '14px',
                padding: '18px',
                textAlign: 'center',
                marginBottom: '16px'
              }}>
                <FiCheckCircle size={36} style={{ color: '#10b981', marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px' }}>
                  Talebiniz Can Murat'a (Sales Priest) Ulaştı!
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0 0 10px' }}>
                  Seçtiğiniz <strong>{matched.modelTitle}</strong> için en güncel şasi ve Kuveyt Türk kampanya tablosuyla 15 dakika içinde aranacaksınız.
                </p>
              </div>
            )}

            {/* Alternatif Doğrudan WhatsApp Butonu */}
            <button
              onClick={handleDirectWhatsApp}
              style={{
                width: '100%',
                background: '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '14px',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)',
                marginBottom: '12px'
              }}
            >
              <FiMessageSquare size={18} /> Can Murat (Sales Priest) ile WhatsApp'tan Hemen Görüş
            </button>

            <button
              onClick={() => setStep(1)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textAlign: 'center',
                display: 'block',
                margin: '0 auto'
              }}
            >
              ← Farklı bir tonaj veya kasa ölçüsü için tekrar hesapla
            </button>
          </div>
        )}
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <div style={{ maxWidth: '680px', margin: '24px auto 0', textAlign: 'center', color: '#64748b', fontSize: '0.74rem' }}>
        IVECO ERC Otomotiv Ticari Araçlar Yetkili Bayi • Samsun<br />
        Tüm boş ağırlıklar şoför ve yakıt dahil resmi teknik föy verileridir.
      </div>
    </div>
  );
}
