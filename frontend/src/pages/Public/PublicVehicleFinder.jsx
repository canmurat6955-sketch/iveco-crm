import React, { useState, useEffect } from 'react';
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
  FiChevronRight
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

// Tonaj Seçenekleri
const TONNAGE_OPTIONS = [
  {
    id: '3_5_ton',
    tonnage: '3.5 Ton (B Ehliyet)',
    badge: 'En Çok Tercih Edilen',
    desc: 'Otomobil ehliyetiyle sürülür, takograf zorunluluğu yoktur, şehir merkezine 7/24 serbest girer.',
    suitableFor: ['gida_frigo', 'kargo_dagitim', 'insaat_malzeme']
  },
  {
    id: '7_2_ton',
    tonnage: '7.2 Ton (Kamyonet Gücü)',
    badge: 'Maksimum Taşıma / 4.5 Ton Yük',
    desc: 'Sınıfının en güçlü C-profil şasisi. 4.5 tona kadar net yük taşır, kamyon gibi çalışır.',
    suitableFor: ['insaat_malzeme', 'tarim_yem', 'oto_kurtarma', 'gida_frigo']
  },
  {
    id: '15_18_ton',
    tonnage: '15 - 18 Ton (Orta Kamyon)',
    badge: 'Eurocargo Segmenti',
    desc: 'Bölgesel dağıtım, yüksek hacimli yükler, damper veya kapalı kasa kamyon.',
    suitableFor: ['tarim_yem', 'insaat_malzeme', 'kargo_dagitim']
  },
  {
    id: '40_plus_ton',
    tonnage: '40+ Ton (Çekici & Tır)',
    badge: 'IVECO S-Way',
    desc: 'Ağır yük, uluslararası nakliye, 530 HP yüksek çekiş ve en düşük yakıt tüketimi.',
    suitableFor: ['agir_nakliye']
  }
];

// Kasa Seçenekleri
const BODY_TYPES = [
  { id: 'frigo', icon: '❄️', name: 'Frigorifik Soğutuculu Kasa', desc: '-18°C dondurucu veya +4°C taze gıda taşımacılığı' },
  { id: 'panelvan', icon: '🚐', name: 'Fabrika Çıkışlı Panelvan', desc: '12 m³ - 16 m³ entegre kapalı sac gövde, seri dağıtım' },
  { id: 'kapali_kutu', icon: '📦', name: 'Kapalı Kutu / Kargo Kasası', desc: 'Mobilya, tekstil, koli ve kuru gıda taşımacılığı' },
  { id: 'acik_sac', icon: '🪵', name: 'Açık Sac / Ahşap İlave Kasa', desc: 'Demir, profil, inşaat malzemesi ve paletli yük' },
  { id: 'damper', icon: '🚜', name: 'Damper Kasa', desc: 'Kum, çakıl, hafriyat ve dökme malzeme boşaltma' },
  { id: 'kayar_kasa', icon: '🛞', name: 'Kayar Kasa Platform', desc: 'Araç taşıma, vinç ve oto çekici üstyapısı' }
];

export default function PublicVehicleFinder() {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || 'whatsapp_durum';

  const [step, setStep] = useState(1);
  const [selectedSector, setSelectedSector] = useState('gida_frigo');
  const [selectedTonnage, setSelectedTonnage] = useState('3_5_ton');
  const [selectedBody, setSelectedBody] = useState('frigo');

  // Kredi Hesaplayıcı Parametreleri
  const [loanPrincipal, setLoanPrincipal] = useState(1000000);
  const [loanTerm, setLoanTerm] = useState(36);

  // Müşteri İletişim Formu
  const [customerName, setCustomerName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('Samsun');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Dwell Time Tracking
  const [startTime] = useState(Date.now());

  // Otomatik Eşleşen Araç Algoritması
  const matchedVehicle = React.useMemo(() => {
    if (selectedTonnage === '40_plus_ton' || selectedSector === 'agir_nakliye') {
      return {
        model: 'IVECO S-Way 530 Çekici',
        subTitle: 'Cursor 13 Motor / 530 HP / Ağır Nakliye Lideri',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80',
        badge: 'Uzun Yol & Tır',
        specs: [
          { label: 'Motor', val: '12.9L Cursor 13 (530 HP / 2500 Nm)' },
          { label: 'Şanzıman', val: '12 İleri Otomatik Hi-Tronix' },
          { label: 'Kabin', val: 'AS Yüksek Tavan Çift Yataklı Lüks Kabin' },
          { label: 'Yakıt Tasarrufu', val: '%4-5 daha az yakıt, Retarder standart' }
        ],
        priceRange: '115.000 € - 128.000 € + KDV',
        campaign: 'Ağır Vasıta Garanti BBVA & Kuveyt Türk Çatı Finansmanı',
        defaultLoan: 3000000
      };
    }

    if (selectedTonnage === '15_18_ton') {
      return {
        model: 'IVECO Eurocargo ML150E21 / ML180E',
        subTitle: 'Tector 7 Motor / 15-18 Ton GVW / Orta Tonaj Şampiyonu',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&auto=format&fit=crop&q=80',
        badge: 'Orta Tonaj Kamyon',
        specs: [
          { label: 'Motor', val: '6.7L Tector 7 (210 - 280 HP)' },
          { label: 'İstiap Haddi', val: '10 - 12 Ton Net Taşıma' },
          { label: 'Kasa Uyumu', val: 'Kapalı Kasa, Damper veya Frigo' },
          { label: 'Dönüş Çapı', val: 'Şehir içine en rahat giren orta kamyon' }
        ],
        priceRange: '3.450.000 TL - 3.850.000 TL + KDV',
        campaign: 'Eurocargo Avantajlı Bayi Katkılı Ticari Kredi',
        defaultLoan: 2000000
      };
    }

    if (selectedTonnage === '7_2_ton') {
      return {
        model: 'IVECO Daily 70C18 / 72C18 Şasi',
        subTitle: '3.0L F1C 180 HP Heavy Duty / 7.2 Ton Şasi',
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
        badge: '4.5 Ton Net İstiap Haddi',
        specs: [
          { label: 'Motor', val: '3.0L F1C Heavy Duty (180 HP / 430 Nm)' },
          { label: 'Net Taşıma', val: '4.500 kg (Kamyon kadar yük taşır)' },
          { label: 'Şasi', val: 'C-Profil Yüksek Mukavemetli Çelik Şasi' },
          { label: 'Servis Aralığı', val: '50.000 km uzatılmış bakım periyodu' }
        ],
        priceRange: '2.350.000 TL - 2.580.000 TL + KDV',
        campaign: 'Kuveyt Türk 6 Ay Ödemesiz - Bayi Katkılı Kampanya',
        defaultLoan: 1500000
      };
    }

    if (selectedBody === 'panelvan') {
      return {
        model: 'IVECO Daily 35S16 Panelvan (12m³ / 16m³)',
        subTitle: '2.3L - 3.0L 160 HP / B Ehliyet / Şehir İçi Hızlı Dağıtım',
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
        badge: 'B Sınıfı Ehliyet / Panelvan',
        specs: [
          { label: 'Hacim', val: '12 m³ veya 16 m³ Geniş Kargo Alanı' },
          { label: 'Ehliyet', val: 'B Sınıfı Otomobil Ehliyeti Geçerli' },
          { label: 'Şehir İçi', val: 'Takografsız, 7/24 Şehir Merkezine Giriş' },
          { label: 'Sürüş', val: 'Binek otomobil konforunda ergonomik kabin' }
        ],
        priceRange: '1.690.000 TL - 1.820.000 TL + KDV',
        campaign: 'Kuveyt Türk 6 Ay Ödemesiz Ticari Taşıt Kredisi',
        defaultLoan: 1000000
      };
    }

    // Varsayılan: Daily 35C16 Şasi Kamyonet (Çift Teker)
    return {
      model: 'IVECO Daily 35C16 Şasi Kamyonet (Çift Arka Teker)',
      subTitle: '3.0L F1C 160 HP Ağır Şasi / B Ehliyet / Çift Teker Sağlamlığı',
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80',
      badge: 'B Sınıfı Ehliyet / Çift Teker Şasi',
      specs: [
        { label: 'Motor Hacmi', val: '3.0 Litre F1C Ticari Motor (Rakiplerin 2.0L motorlarına göre 3 kat ömür)' },
        { label: 'Güç & Tork', val: '160 HP / 380 Nm Güçlü Çekiş' },
        { label: 'Şasi & Dingil', val: 'Çift Arka Teker C-Profil Kamyon Şasisi' },
        { label: 'Bakım Periyodu', val: '50.000 km Servis Aralığı (En düşük TCO)' }
      ],
      priceRange: '1.780.000 TL - 1.950.000 TL + KDV (Şasi)',
      campaign: 'Kuveyt Türk 6 Ay Ödemesiz - Bayi Katkılı Finansman',
      defaultLoan: 1000000
    };
  }, [selectedSector, selectedTonnage, selectedBody]);

  // Kredi Hesaplama (Kuveyt Türk 6 Ay Ödemesiz)
  const loanCalculations = React.useMemo(() => {
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

  // Form Gönderimi (Teklif İste & CRM'e Lead Olarak Yaz)
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      toast.error('Lütfen geçerli bir telefon numarası girin (örn: 0532 555 10 14)');
      return;
    }

    setSubmitting(true);
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);

    const leadPayload = {
      source: 'whatsapp_link',
      search_query: `[WhatsApp Durum Seçici]: ${selectedSector} | ${selectedTonnage} | ${selectedBody}`,
      target_model: matchedVehicle.model,
      target_campaign: `Kuveyt Türk 6 Ay Ödemesiz (${loanPrincipal.toLocaleString('tr-TR')} TL / ${loanTerm} Ay)`,
      company_name: customerCompany.trim() || customerName.trim() || 'WhatsApp Durum Ziyaretçisi',
      city: customerCity,
      phone: customerPhone.trim(),
      page_url: window.location.href,
      referrer: document.referrer || 'whatsapp_status',
      duration_seconds: durationSeconds,
      scroll_depth: 100,
      intent_score: 98,
      intent_level: 'very_high',
      notes: `Müşteri WhatsApp durumundaki araç seçiciyi kullandı. Sektör: ${selectedSector}, İstenen Tonaj: ${selectedTonnage}, Kasa: ${selectedBody}. Kredi: ${loanPrincipal.toLocaleString('tr-TR')} TL (${loanTerm} ay). Notu: ${customerNotes}`
    };

    try {
      await discoveryApi.recordIntentSignal(leadPayload);
      setSubmitted(true);
      toast.success('Talebiniz başarıyla alındı! Satış Temsilcimiz Can Murat sizinle iletişime geçecektir.');
    } catch (err) {
      console.error(err);
      toast.error('Kayıt alınırken bir sorun oluştu, lütfen doğrudan WhatsApp üzerinden iletişime geçin.');
    } finally {
      setSubmitting(false);
    }
  };

  // Doğrudan WhatsApp Aç
  const handleDirectWhatsApp = () => {
    const cleanPhone = '905325551014'; // Can Murat'ın kurumsal hattı
    const msg = `Merhaba Can Bey, WhatsApp durumunuzdaki IVECO Akıllı Araç ve Kredi Seçici üzerinden baktım.\n\n🚛 *Tavsiye Edilen Araç:* ${matchedVehicle.model}\n⚖️ *İhtiyacım:* ${selectedTonnage} | Kasa: ${selectedBody}\n💳 *İlgilendiğim Kredi:* Kuveyt Türk 6 Ay Ödemesiz (${loanPrincipal.toLocaleString('tr-TR')} TL - ${loanTerm} Ay)\n\nAracın güncel stok durumu ve firmanıza özel teklif tablosu hakkında görüşmek istiyorum.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
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
      <div style={{ maxWidth: '640px', margin: '0 auto 20px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 75, 147, 0.25)', border: '1px solid rgba(43, 125, 233, 0.4)', padding: '6px 14px', borderRadius: '30px', marginBottom: '10px' }}>
          <span style={{ color: '#60a5fa', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '1px' }}>IVECO ERC OTOMOTİV</span>
          <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>• Samsun Yetkili Bayi</span>
        </div>

        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.3, margin: '0 0 6px' }}>
          İşinize En Uygun IVECO'yu ve Kredi Planınızı 30 Saniyede Belirleyin
        </h1>
        <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0 }}>
          Tonaj ve kasa ihtiyacınızı seçin; sistemimiz en verimli aracı ve <strong>Kuveyt Türk 6 Ay Ödemesiz</strong> taksit tutarını anında hesaplasın.
        </p>

        {/* Can Murat Temsilci Rozeti */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(99, 179, 237, 0.2)',
          borderRadius: '25px',
          padding: '6px 16px',
          marginTop: '12px'
        }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#004B93', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
            CM
          </div>
          <div style={{ textAlign: 'left', fontSize: '0.78rem' }}>
            <span style={{ color: '#f8fafc', fontWeight: 700, display: 'block' }}>Can Murat</span>
            <span style={{ color: '#38bdf8' }}>Satış Sorumlusu</span>
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
        </div>
      </div>

      {/* ── STEPPER BAR ─────────────────────────────────────────── */}
      <div style={{ maxWidth: '640px', margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
        {[
          { num: 1, label: 'Sektör' },
          { num: 2, label: 'Tonaj' },
          { num: 3, label: 'Kasa' },
          { num: 4, label: 'Teklif & Kredi' }
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => s.num < step && setStep(s.num)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              cursor: s.num < step ? 'pointer' : 'default',
              position: 'relative',
              zIndex: 2
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: step === s.num ? '#004B93' : step > s.num ? '#10b981' : '#1e293b',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: step === s.num ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
              boxShadow: step === s.num ? '0 0 12px rgba(56, 189, 248, 0.4)' : 'none',
              marginBottom: '4px'
            }}>
              {step > s.num ? <FiCheck size={16} /> : s.num}
            </div>
            <span style={{ fontSize: '0.72rem', color: step >= s.num ? '#f8fafc' : '#64748b', fontWeight: step === s.num ? 700 : 500 }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT CONTAINER ──────────────────────────────── */}
      <div style={{
        maxWidth: '640px',
        margin: '0 auto',
        background: 'rgba(17, 24, 51, 0.85)',
        border: '1px solid rgba(99, 179, 237, 0.18)',
        borderRadius: '16px',
        padding: '20px 18px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(8px)'
      }}>

        {/* ── ADIM 1: SEKTÖR SEÇİMİ ─────────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px', color: '#f8fafc' }}>
              1. Hangi alanda taşıma yapıyorsunuz?
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '16px' }}>
              İş kolunuza en uygun motor dayanımı ve şasi yapısını belirlemek için seçin:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px', marginBottom: '20px' }}>
              {SECTORS.map(sec => {
                const isSelected = selectedSector === sec.id;
                return (
                  <div
                    key={sec.id}
                    onClick={() => setSelectedSector(sec.id)}
                    style={{
                      background: isSelected ? 'rgba(0, 75, 147, 0.35)' : 'rgba(15, 23, 42, 0.6)',
                      border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{sec.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#38bdf8' : '#f8fafc' }}>
                        {sec.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        {sec.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #004B93 0%, #2b7de9 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '14px',
                fontWeight: 700,
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(43, 125, 233, 0.4)'
              }}
            >
              Devam Et (Tonaj Seçimi) <FiArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ── ADIM 2: TONAJ & EHLİYET SEÇİMİ ─────────────────────── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px', color: '#f8fafc' }}>
              2. İhtiyacınız olan tonaj & taşıma kapasitesi?
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '16px' }}>
              Sürüş ehliyeti ve şehir merkezi kurallarına göre doğru tonajı seçin:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {TONNAGE_OPTIONS.map(ton => {
                const isSelected = selectedTonnage === ton.id;
                return (
                  <div
                    key={ton.id}
                    onClick={() => setSelectedTonnage(ton.id)}
                    style={{
                      background: isSelected ? 'rgba(0, 75, 147, 0.35)' : 'rgba(15, 23, 42, 0.6)',
                      border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isSelected ? '#38bdf8' : '#f8fafc' }}>
                        {ton.tonnage}
                      </span>
                      <span style={{
                        background: isSelected ? '#38bdf8' : 'rgba(255,255,255,0.08)',
                        color: isSelected ? '#0f172a' : '#94a3b8',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}>
                        {ton.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
                      {ton.desc}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '14px 20px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <FiArrowLeft size={16} />
              </button>

              <button
                onClick={() => setStep(3)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #004B93 0%, #2b7de9 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(43, 125, 233, 0.4)'
                }}
              >
                Devam Et (Kasa Seçimi) <FiArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── ADIM 3: KASA & HACİM SEÇİMİ ───────────────────────── */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px', color: '#f8fafc' }}>
              3. İstediğiniz kasa veya üstyapı tipi?
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '16px' }}>
              IVECO'nun fabrika çıkışlı ve anlaşmalı üst yapıcı kasa alternatifleri:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px', marginBottom: '20px' }}>
              {BODY_TYPES.map(b => {
                const isSelected = selectedBody === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBody(b.id)}
                    style={{
                      background: isSelected ? 'rgba(0, 75, 147, 0.35)' : 'rgba(15, 23, 42, 0.6)',
                      border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '22px' }}>{b.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: isSelected ? '#38bdf8' : '#f8fafc' }}>
                        {b.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                        {b.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '14px 20px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <FiArrowLeft size={16} />
              </button>

              <button
                onClick={() => setStep(4)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                }}
              >
                ⚡ Eşleşen Aracı & Kredi Kampanyasını Gör <FiArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── ADIM 4: EŞLEŞEN ARAÇ & KREDİ HESAPLAMA EKRANI ───────── */}
        {step === 4 && (
          <div>
            {/* Eşleşen Araç Başlığı */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 75, 147, 0.4) 0%, rgba(16, 185, 129, 0.15) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ background: '#10b981', color: '#0f172a', fontWeight: 800, fontSize: '0.72rem', padding: '3px 8px', borderRadius: '12px' }}>
                  ✓ İŞİNİZE EN UYGUN SEÇİM
                </span>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
                  {matchedVehicle.badge}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px' }}>
                {matchedVehicle.model}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0 0 12px' }}>
                {matchedVehicle.subTitle}
              </p>

              {/* Teknik Özellikler Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                {matchedVehicle.specs.map((sp, idx) => (
                  <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{sp.label}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>{sp.val}</div>
                  </div>
                ))}
              </div>

              {/* Fiyat Bilgisi */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Kampanyalı Liste Başlangıcı:</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>{matchedVehicle.priceRange}</span>
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
                Aracınızı hemen teslim alın, işinize başlayın; ilk <strong>6 ay boyunca 0 TL taksit</strong> ödeyin!
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
                  📋 Can Murat'tan Resmi Proforma & Stok Teklifi İsteyin
                </h4>
                <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '0 0 12px' }}>
                  Bilgilerinizi bırakın; Can Murat aracın güncel şasi stok durumunu ve size özel kasko/sigorta hediyeli teklifini 15 dakikada iletsin.
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
                  {submitting ? 'İletiliyor...' : '📞 Beni Arayın & Fiyat Teklifi Gönderin'}
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
                  Talebiniz Can Murat'a Ulaştı!
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0 0 10px' }}>
                  Seçtiğiniz <strong>{matchedVehicle.model}</strong> için en güncel şasi ve Kuveyt Türk kampanya tablosuyla 15 dakika içinde aranacaksınız.
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
              <FiMessageSquare size={18} /> Can Murat ile WhatsApp'tan Hemen Görüş
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
                textAlign: 'center'
              }}
            >
              ← Farklı bir araç veya tonaj için tekrar hesapla
            </button>
          </div>
        )}
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <div style={{ maxWidth: '640px', margin: '24px auto 0', textAlign: 'center', color: '#64748b', fontSize: '0.74rem' }}>
        IVECO ERC Otomotiv Ticari Araçlar Yetkili Bayi • Samsun<br />
        Bu hesaplama bilgilendirme amaçlı olup resmi proforma teklif yerine geçmez.
      </div>
    </div>
  );
}
