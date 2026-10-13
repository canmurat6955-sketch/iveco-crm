import { useState, useMemo } from 'react';

const BODY_BUILDERS_DIRECTORY = [
  {
    city: 'Samsun',
    name: 'Samsun Teknik Karoser & Kasa',
    location: 'Tekkeköy 19 Mayıs San. Sit.',
    specialty: 'Kapalı Kasa, Açık Sac Kasa, Kayar Perde',
    phone: '0362 266 00 11',
    contact: 'Mustafa Usta',
    rating: '⭐⭐⭐⭐⭐ Yetkili Referanslı',
  },
  {
    city: 'Samsun',
    name: 'Özdamper Karadeniz İmalat',
    location: 'İlkadım Örnek Sanayi',
    specialty: 'Hafriyat Damperi, Hardox Taban Damper',
    phone: '0362 238 44 22',
    contact: 'Ali Bey',
    rating: '⭐⭐⭐⭐⭐ IVECO T-Way / Daily Uyumlu',
  },
  {
    city: 'Trabzon',
    name: 'Karadeniz Frigo Soğutma Sistemleri',
    location: 'Değirmendere Küçük San. Sit.',
    specialty: 'Frigorifik Kasa (-20°C / +4°C Soğutuculu)',
    phone: '0462 325 77 88',
    contact: 'Hasan Usta',
    rating: '⭐⭐⭐⭐⭐ ATP / Gıda Sertifikalı',
  },
  {
    city: 'Çorum',
    name: 'Hitit Damper & Treyler Sanayi',
    location: 'Çorum Organize Sanayi Bölgesi',
    specialty: 'Ağır Hizmet Damper, Çift Kabin Kasa',
    phone: '0364 254 90 00',
    contact: 'Ahmet Usta',
    rating: '⭐⭐⭐⭐⭐ Ağır Vasıta Şantiye',
  },
  {
    city: 'Ordu',
    name: 'Ünye Kasa & Karoser Sanayi',
    location: 'Ünye Sanayi Sitesi',
    specialty: 'Mobilya Kasası, Kuru Yük, Açık Ahşap Kasa',
    phone: '0452 323 15 50',
    contact: 'Recep Usta',
    rating: '⭐⭐⭐⭐ KOBİ Dağıtım',
  },
];

export default function BodybuilderMatcherModal({ isOpen, onClose, customerName = '' }) {
  const [loadType, setLoadType] = useState('dry_cargo');
  const [desiredPayload, setDesiredPayload] = useState('4_5'); // ton
  const [palletCount, setPalletCount] = useState(10);
  const [bodyType, setBodyType] = useState('closed_box');
  const [selectedCity, setSelectedCity] = useState('Samsun');
  const [copied, setCopied] = useState(false);

  // Match recommendation
  const recommendation = useMemo(() => {
    let model = 'IVECO Daily 35C16 Çift Teker';
    let wheelbase = '3750 mm';
    let maxPayload = '1.800 kg';
    let innerDimensions = '4.20m x 2.15m x 2.20m';
    let gvw = '3.500 kg (B Ehliyet, Takograf Yok)';
    let highlight = 'B Sınıfı Ehliyetle sürülebilir, şehir içine rahat girer.';

    if (desiredPayload === '1_5' || palletCount <= 8) {
      model = 'IVECO Daily 35C16 Çift Teker Şasi';
      wheelbase = '3450 / 3750 mm';
      maxPayload = '1.800 kg';
      innerDimensions = '3.80m x 2.10m x 2.15m (8 Palet)';
      gvw = '3.500 kg (B Ehliyet)';
      highlight = 'Şehir içi dar sokak dağıtımları için ideal dingil mesafesi.';
    } else if (desiredPayload === '4_5' || palletCount <= 12) {
      model = 'IVECO Daily 72C21 (7.2 Ton Şasi Kamyon)';
      wheelbase = '4100 / 4350 mm';
      maxPayload = '4.600 kg (Net Faydalı Yük)';
      innerDimensions = '5.10m x 2.25m x 2.30m (10-12 Palet)';
      gvw = '7.200 kg Azami Yüklü Ağırlık';
      highlight = 'Sınıfının en yüksek şasi taşıma kapasitesi (210 HP motor, 470 Nm tork).';
    } else if (desiredPayload === '7_10' || palletCount <= 16) {
      model = 'IVECO Eurocargo ML120E / ML160E';
      wheelbase = '4815 / 5175 mm';
      maxPayload = '8.500 kg Faydalı Yük';
      innerDimensions = '6.50m x 2.45m x 2.50m (14-16 Palet)';
      gvw = '12.000 - 16.000 kg';
      highlight = 'Bölgesel nakliye, ağır meşrubat ve toptan gıda lojistiği standardı.';
    } else {
      model = 'IVECO Eurocargo ML180E veya S-Way 530 Çekici';
      wheelbase = '5670 mm / 3800 mm Çekici';
      maxPayload = '12.000 - 24.000 kg';
      innerDimensions = '7.60m+ Kasa veya Dorse (24-33 Palet)';
      gvw = '18.000 kg / 40.000 kg Katar';
      highlight = 'Uzun yol ve ağır yük taşımacılığında rakipsiz tonaj ve hacim.';
    }

    let bodyLabel = 'Kapalı Kasa';
    if (bodyType === 'refrigerated') bodyLabel = 'Frigorifik (-18°C / +4°C Soğutuculu)';
    else if (bodyType === 'tipper') bodyLabel = 'Damper Kasa (Hardox Taban)';
    else if (bodyType === 'open_box') bodyLabel = 'Açık Saç Kasa (Babalı / Açılır Kapak)';
    else if (bodyType === 'curtain') bodyLabel = 'Kayar Perdeli Kasa (İçecek / Hızlı Yükleme)';

    return {
      model,
      wheelbase,
      maxPayload,
      innerDimensions,
      gvw,
      highlight,
      bodyLabel,
    };
  }, [desiredPayload, palletCount, bodyType]);

  // Filtered bodybuilders
  const filteredBuilders = useMemo(() => {
    if (selectedCity === 'all') return BODY_BUILDERS_DIRECTORY;
    return BODY_BUILDERS_DIRECTORY.filter(b => b.city === selectedCity);
  }, [selectedCity]);

  // Formatted WhatsApp consultation text
  const whatsappConsultation = useMemo(() => {
    const greeting = customerName ? `Sayın ${customerName} Yetkilisi,` : 'Sayın Yetkili,';
    return `${greeting}

Taşıma ihtiyacınız (${palletCount} Palet / ${recommendation.maxPayload}) doğrultusunda en ideal şasi ve üst yapı konfigürasyonumuz:

🚛 Önerilen Şasi: ${recommendation.model}
• Dingil Mesafesi: ${recommendation.wheelbase}
• Kasa Tipi: ${recommendation.bodyLabel}
• İç Kasa Ölçüleri: ${recommendation.innerDimensions}
• Azami Yüklü / Ehliyet: ${recommendation.gvw}
• Neden Bu Model? ${recommendation.highlight}

🛠️ Bölgesel Anlaşmalı Üst Yapı Çözüm Ortaklarımız:
Samsun, Trabzon ve Çorum'daki anlaşmalı yetkili karoser imalatçılarımız ile anahtar teslim kasa montajı ve garanti koordinasyonunu ERC Otomotiv olarak sağlıyoruz.

Aracın şasi ve hazır üst yapılı teslimat sürelerini görüşmek üzere memnuniyetle yardımcı olmak isterim.
IVECO ERC Otomotiv - Can Murat`;
  }, [customerName, palletCount, recommendation]);

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappConsultation);
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
        width: '100%', maxWidth: '850px', maxHeight: '92vh', borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
          color: '#ffffff', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
              🏗️
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Şasi - Üst Yapı & İstiap Haddi Eşleştirme Motoru</h3>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
                Müşterinin yük ve palet ihtiyacına göre en doğru şasi, dingil ve bölgesel üst yapıcı önerisi.
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
          
          {/* Inputs Box */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Kasa / Üst Yapı Tipi:
                </label>
                <select
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value)}
                  style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="closed_box">Kapalı Kutu Kasa (Kuru Yük / Mobilya)</option>
                  <option value="refrigerated">Frigorifik (Soğutuculu Gıda / Et / Süt)</option>
                  <option value="tipper">Damper Kasa (Hafriyat / Şantiye / Moloz)</option>
                  <option value="open_box">Açık Saç Kasa (Profil / Demir / Tarım)</option>
                  <option value="curtain">Kayar Perdeli Kasa (İçecek / Hızlı Yükleme)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Hedef Faydalı Yük (İstiap):
                </label>
                <select
                  value={desiredPayload}
                  onChange={(e) => setDesiredPayload(e.target.value)}
                  style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="1_5">1.5 - 2.0 Ton (Hafif Dağıtım)</option>
                  <option value="4_5">3.5 - 4.6 Ton (7.2T Kamyonet/Kamyon)</option>
                  <option value="7_10">7.0 - 9.0 Ton (12-16T Eurocargo)</option>
                  <option value="12_plus">12.0+ Ton (Ağır Tonaj / Çekici)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Palet Sayısı (120x80cm):
                </label>
                <select
                  value={palletCount}
                  onChange={(e) => setPalletCount(Number(e.target.value))}
                  style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value={6}>6 Euro Palet</option>
                  <option value={8}>8 Euro Palet</option>
                  <option value={10}>10 Euro Palet</option>
                  <option value={12}>12 Euro Palet</option>
                  <option value={14}>14 Euro Palet</option>
                  <option value={16}>16 Euro Palet</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Bölgesel İmalatçı Şehri:
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="Samsun">Samsun (Önerilen)</option>
                  <option value="Trabzon">Trabzon</option>
                  <option value="Çorum">Çorum</option>
                  <option value="Ordu">Ordu / Ünye</option>
                  <option value="all">Tüm Karadeniz</option>
                </select>
              </div>
            </div>
          </div>

          {/* Engine Output Matching Card */}
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '2px solid #f59e0b', borderRadius: '14px', padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🎯 EN UYGUN IVECO ŞASİ VE TEKNİK KONFİGÜRASYON
                </span>
                <h4 style={{ margin: '4px 0', fontSize: '20px', fontWeight: '800', color: '#78350f' }}>
                  {recommendation.model}
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#92400e', fontWeight: '500' }}>
                  {recommendation.highlight}
                </p>
              </div>

              <div style={{ background: '#ffffff', padding: '8px 14px', borderRadius: '10px', border: '1px solid #f59e0b', textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>İç Kasa Ölçüleri</span>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>{recommendation.innerDimensions}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '16px' }}>
              <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Dingil Mesafesi (Wheelbase)</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{recommendation.wheelbase}</strong>
              </div>
              <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Net İstiap Haddi</span>
                <strong style={{ fontSize: '13px', color: '#059669' }}>{recommendation.maxPayload}</strong>
              </div>
              <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Azami Yüklü Ağırlık / Sınıf</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{recommendation.gvw}</strong>
              </div>
            </div>
          </div>

          {/* Regional Bodybuilders Directory */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
              📍 Bölgesel Anlaşmalı Üst Yapıcılar & İletişim Rehberi ({selectedCity})
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              {filteredBuilders.map((b, idx) => (
                <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{b.name}</strong>
                    <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>{b.city}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{b.location}</div>
                  <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600', marginTop: '4px' }}>Uzmanlık: {b.specialty}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '12px', color: '#334155' }}>👤 {b.contact}</span>
                    <a href={`tel:${b.phone}`} style={{ fontSize: '12px', color: '#0284c7', fontWeight: '700', textDecoration: 'none' }}>📞 {b.phone}</a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Consultation Pitch */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>
                💬 Müşteriye Gönderilecek Üst Yapı Danışmanlık Metni:
              </span>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  background: copied ? '#15803d' : '#d97706', color: '#fff', border: 'none',
                  padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                }}
              >
                {copied ? '✅ Kopyalandı!' : '📋 WhatsApp Metnini Kopyala'}
              </button>
            </div>
            <pre style={{
              margin: 0, padding: '12px', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1',
              fontSize: '12px', fontFamily: 'inherit', whiteSpace: 'pre-wrap', lineHeight: 1.5, color: '#1e293b'
            }}>
              {whatsappConsultation}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 20px', background: '#d97706', color: '#fff', border: 'none',
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
