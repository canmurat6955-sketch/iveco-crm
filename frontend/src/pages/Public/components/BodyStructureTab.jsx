import React, { useState } from 'react';
import { FiLayers, FiCheck, FiTruck, FiMessageSquare, FiInfo, FiSliders } from 'react-icons/fi';

const BODY_STRUCTURE_LIST = [
  {
    id: 'frigo',
    title: 'Frigorifik Soğutuculu Kasa (-18°C / +4°C)',
    icon: '❄️',
    badge: 'Soğuk Zincir & ATP Sertifikalı',
    sectors: ['Et & Tavuk Entegre', 'Süt & Peynir Ürünleri', 'Dondurma & Donuk Gıda', 'İlaç & Medikal Dağıtım', 'Yaş Sebze & Meyve'],
    desc: 'CTP kaplı yüksek yoğunluklu poliüretan sandviç paneller ile mükemmel ısı yalıtımı. İsteğe göre çift rejimli (-18°C / +4°C bölmeli) ve et kancalı tavan takviyeli imalat.',
    specs: {
      length: '3.80 m — 7.50 m',
      width: '2.15 m — 2.45 m',
      height: '2.00 m — 2.30 m',
      pallets: '6 — 16 Euro Palet',
      tareWeight: '~950 kg — 1.800 kg',
      coolingUnits: 'Carrier Transicold, Thermo King, Safkar (-18°C / 0°C / +4°C)'
    },
    recommendedChassis: [
      { name: 'Daily 35S16 (3750 mm)', note: 'Hafif yük, şehir içi dar sokak soğuk dağıtım (B Ehliyet)' },
      { name: 'Daily 35C16 (3750/4100 mm Çift Teker)', note: 'Ağır gıda, karkas et ve süt ürünleri için yüksek taşıma mukavemeti' },
      { name: 'Daily 72C18 (4750/5100 mm)', note: '4.5 Ton net yük, 10-12 palet kapasitesi, şehirlerarası dağıtım' },
      { name: 'Eurocargo ML 120E / 160E', note: '14-16 palet, havalı süspansiyon, süpermarket zincir lojistiği' }
    ],
    features: [
      'TSE ve ATP Sertifikalı Isı İzolasyonu',
      'Kaymaz Alüminyum Taban veya Hijyenik Epoksi Döküm',
      'Paslanmaz Krom Kapı Kilitleri ve EPDM Çift Contalama',
      'İç LED Aydınlatma ve Sıcaklık Kayıt Cihazı (Data Logger) Yuvası'
    ]
  },
  {
    id: 'damper',
    title: 'Damper Kasa (Hardox Hafriyat & Şantiye)',
    icon: '🚜',
    badge: 'Ağır Hizmet & Yüksek Mukavemet',
    sectors: ['Hafriyat & Yıkım', 'Kaya & Taş Ocakları', 'Kum, Çakıl & Agrega', 'Asfalt & Yol İnşaatı', 'Madencilik'],
    desc: 'Zorlu arazi ve dökme malzeme taşımacılığı için Hardox 450/500 aşınmaya dayanıklı çelik sac gövde. Ağır hizmet hidrolik piston ve pnömatik kilitli arka kapak.',
    specs: {
      length: '3.60 m — 6.40 m',
      width: '2.20 m — 2.45 m',
      height: '1.20 m — 1.60 m',
      pallets: '16 m³ — 24 m³ Dökme Malzeme',
      tareWeight: '~1.800 kg — 3.800 kg',
      coolingUnits: 'Ön Teleskopik Hidrolik Silindir (Hyva / Hidromas)'
    },
    recommendedChassis: [
      { name: 'Daily 35C16 (3450/3750 mm Çift Teker)', note: 'Şehir içi dar sokak kum, çakıl ve tadilat hafriyatı' },
      { name: 'T-Way 10 Teker (6x4 460/540 BG)', note: '26 Ton Karayolları / 41 Ton Şantiye GVW, 16-18 m³ Hardox Damper' },
      { name: 'T-Way 12 Teker (8x4 460/540 BG)', note: '32 Ton Karayolları / 50 Ton GVW, 22-24 m³ Ağır Kaya Damperi' }
    ],
    features: [
      'Taban 5 mm, Yanlar 4 mm Hardox 450 Aşınmaz Çelik',
      'Otomatik Pnömatik Açılır / Kapanır Arka Kapak',
      'Kabin Koruma Siperliği ve Yan Koruma Bariyerleri',
      'Devrilme Emniyetli Çift Hızlı Hidrolik Valf Sistemi'
    ]
  },
  {
    id: 'kapali_kutu',
    title: 'Kapalı Kutu & Kargo Kasası (Alüminyum / Sac)',
    icon: '📦',
    badge: 'Kargo, Mobilya & E-Ticaret',
    sectors: ['Kargo & Dağıtım', 'Mobilya & Beyaz Eşya', 'Tekstil & Konfeksiyon', 'Kuru Gıda & Toptan Dağıtım', 'Elektronik & Ambalaj'],
    desc: 'Hafif alüminyum veya dayanıklı sac gövde. Şehir içi ve şehirlerarası taşımacılıkta yüksek yük hacmi ve tam kapalı güvenlik sağlar.',
    specs: {
      length: '3.80 m — 7.80 m',
      width: '2.15 m — 2.45 m',
      height: '2.10 m — 2.60 m',
      pallets: '8 — 18 Euro Palet',
      tareWeight: '~600 kg — 1.200 kg',
      coolingUnits: 'İsteğe Bağlı Hidrolik Arka Yükleme Kapağı (Lift)'
    },
    recommendedChassis: [
      { name: 'Daily 35S16 (3750/4100 mm)', note: 'Kargo ve e-ticaret, B sınıfı ehliyet, şehir içi serbest' },
      { name: 'Daily 35C16 (4100 mm Çift Teker)', note: 'Mobilya ve ağır koli dağıtımında yüksek mukavemet' },
      { name: 'Daily 72C18 (5100 mm)', note: 'Dev hacim, 6.20 m kasa boyu, paletli mobilya sevkiyatı' },
      { name: 'Eurocargo ML 150E / 160E', note: '18 palet kapasitesi, 7.80 m kasa, tekstil ve zincir dağıtım' }
    ],
    features: [
      'Alüminyum Geçme Paneller veya Fiberglas Gövde',
      'Suya Dayanıklı Kaymaz Plywood Taban (21 mm)',
      'İki Taraflı Yük Bağlama Rayları ve Askı Boruları',
      'Çift Kanat Açılır 270° Arka Kapı ve Yan Servis Kapısı'
    ]
  },
  {
    id: 'kayar_perde',
    title: 'Kayar Perde & Tente Kasa (Hızlı Yükleme)',
    icon: '🚛',
    badge: 'Çift Taraflı Forklift Yükleme',
    sectors: ['İçecek & Meşrubat', 'Paletli Ürün Lojistiği', 'Çimento & Alçı Çuvalları', 'Oluklu Mukavva & Koli', 'Tarımsal Gübre & Tohum'],
    desc: 'İki yandan ve tavandan saniyeler içinde forklift ile yükleme imkanı. Gerdirme cırcırlı dayanıklı PVC branda ve alüminyum yan çıtalar.',
    specs: {
      length: '4.50 m — 8.20 m',
      width: '2.25 m — 2.50 m',
      height: '2.20 m — 2.70 m',
      pallets: '10 — 20 Euro Palet',
      tareWeight: '~750 kg — 1.400 kg',
      coolingUnits: 'Kayar Tavan & Sabit/Kayar Alüminyum Dikmeler'
    },
    recommendedChassis: [
      { name: 'Daily 35C16 (4100 mm)', note: 'Şehir içi paletli içecek ve market sevkiyatı' },
      { name: 'Daily 72C18 (4750/5100 mm)', note: '10-12 Euro Palet, paletli un ve yem dağıtımı' },
      { name: 'Eurocargo ML 160 E 32P (5670 mm)', note: '18-20 Palet, havalı süspansiyon, 11 ton net yük' },
      { name: 'Eurocargo 10 Teker (6x2)', note: '22 Palet, 8.40 m dev kasa, 16 ton net taşıma' }
    ],
    features: [
      '900 gr/m² Alev Yürümez Ağır Hizmet Branda',
      'İki Yandan Bağımsız Gerdirme Mekanizması',
      'Alüminyum Baba Dikmeleri ve Yük Emniyet Çıtaları',
      'İsteğe Göre Açılabilir Arka Sac Kapaklar'
    ]
  },
  {
    id: 'acik_sac',
    title: 'Açık Sac & Ahşap İlave Kasa',
    icon: '🪵',
    badge: 'İnşaat, Profil & Tarım',
    sectors: ['Demir & Profil Satıcıları', 'İnşaat Malzemeleri & Nalbur', 'Çeltik, Buğday & Tarım', 'Kereste & Ahşap Malzeme', 'Tuğla & Briket Dağıtım'],
    desc: 'Açılabilir yan ve arka sac kapaklar, demonte babalar ve isteğe bağlı ahşap/sac ilaveler. Vinçli veya açık yüklemelere uygun esnek yapı.',
    specs: {
      length: '3.60 m — 7.50 m',
      width: '2.10 m — 2.45 m',
      height: '0.40 m — 0.80 m (İlave Dahil)',
      pallets: 'Serbest Yükleme',
      tareWeight: '~450 kg — 1.000 kg',
      coolingUnits: 'Ön Kabin Koruma Korkuluğu & Merdiven'
    },
    recommendedChassis: [
      { name: 'Daily 35S16 (3450/3750 mm)', note: 'Nalbur, hırdavat ve hafif inşaat malzemesi (B Ehliyet)' },
      { name: 'Daily 35C16 (3750/4100 mm Çift Teker)', note: 'Demir, çimento, seramik gibi ağır yükler' },
      { name: 'Daily 72C18 (4350/4750 mm)', note: '4.8 Ton net taşıma, 5.50 metre boy profil demir' },
      { name: 'Eurocargo 120E / 150E / 160E', note: 'Ağır inşaat, kereste ve tarımsal çuval sevkiyatı' }
    ],
    features: [
      'Pres Baskılı Mukavemetli Sac Kapaklar',
      'Taban Baklavalı Sac veya Kaymaz Plywood',
      'Kasa İçi Gömme Yük Sabitleme Mapaları',
      'Çift Kilitli Emniyet Mandalları'
    ]
  },
  {
    id: 'oto_kurtarma',
    title: 'Kayar Kasa Platform (Oto Kurtarma / Çekici)',
    icon: '🛞',
    badge: '7/24 Yol Yardım & Araç Nakliyesi',
    sectors: ['Oto Çekici & Kurtarma', 'Yetkili Servis Filoları', 'Rent a Car Taşıma', 'Sıfır Araç Bayi Sevkiyatı', 'Trafik & Otopark İşletmeleri'],
    desc: 'Hidrolik kayar platform gövde, güçlü elektrikli/hidrolik çeki vinci, açılır rampa ve isteğe bağlı çiftli taşıma için gözlük aparatı.',
    specs: {
      length: '5.20 m — 6.50 m',
      width: '2.20 m — 2.35 m',
      height: 'Alçak Yükleme Açısı (8°-10°)',
      pallets: '1 veya 2 Binek Araç / SUV',
      tareWeight: '~1.200 kg — 1.600 kg',
      coolingUnits: '4.500 — 6.000 kg Tambur Vinç (Warn / ComeUp)'
    },
    recommendedChassis: [
      { name: 'Daily 35C16 (4100 mm Çift Teker)', note: 'Şehir içi kıvrak kurtarıcı, B ehliyet, 1 binek araç taşıma' },
      { name: 'Daily 72C18 (4750/5100 mm)', note: 'Gözlüklü çift araç taşıma, SUV ve minibüs kurtarma gücü' },
      { name: 'Eurocargo 100E / 120E', note: 'Ağır ticari, minibüs ve uzun yol filo araç taşımacılığı' }
    ],
    features: [
      'Alçak Yükleme Açısı Sayesinde Spor Araçlarda Dahi Tampon Sürtmez',
      'Uzaktan Kumandalı Hidrolik Platform & Vinç Kontrolü',
      'LED Tepe Çakarları ve Gece Çalışma Projektörleri',
      'Tekerlek Sabitleme Takozları ve Özel Spanzet Kuşakları'
    ]
  }
];

export default function BodyStructureTab({ onSelectBody, onDirectWhatsApp, salesRep }) {
  const [selectedBodyId, setSelectedBodyId] = useState('frigo');

  const activeBody = BODY_STRUCTURE_LIST.find(b => b.id === selectedBodyId) || BODY_STRUCTURE_LIST[0];

  const handleWhatsAppConsult = (body) => {
    if (onDirectWhatsApp) {
      const msg = `Merhaba ${salesRep?.name || 'Can Murat Bey'}, *${body.title}* üst yapı çözümü ve buna en uygun IVECO şasi tavsiyeniz hakkında detaylı bilgi ve anahtar teslim fiyat teklifi rica ediyorum.`;
      onDirectWhatsApp(msg);
    }
  };

  return (
    <div style={{ color: '#f8fafc' }}>
      {/* Tab Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(15, 23, 42, 0.7) 100%)',
        border: '1px solid rgba(52, 211, 153, 0.35)',
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
          <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            TSE & SANAYİ BAKANLIĞI PROJELİ ÜST YAPI
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 2px', color: '#fff' }}>
            IVECO Kasa & Üst Yapı Çözümleri Rehberi
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            İşinize özel kasa tipini seçin; ölçüleri, taşıma hacmini ve en uyumlu IVECO şasilerini anahtar teslim inceleyin.
          </p>
        </div>
        <div style={{
          background: 'rgba(56, 189, 248, 0.15)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '12px',
          padding: '8px 14px',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.70rem', color: '#38bdf8', fontWeight: 700 }}>✅ ANAHTAR TESLİM</div>
          <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 800 }}>Ruhsata İşli & Garantili</div>
        </div>
      </div>

      {/* Body Type Selection Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginBottom: '22px' }}>
        {BODY_STRUCTURE_LIST.map(b => (
          <button
            key={b.id}
            type="button"
            onClick={() => setSelectedBodyId(b.id)}
            style={{
              background: selectedBodyId === b.id ? 'linear-gradient(135deg, #0284c7 0%, #004B93 100%)' : 'rgba(15, 23, 42, 0.7)',
              border: selectedBodyId === b.id ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '12px 14px',
              textAlign: 'left',
              cursor: 'pointer',
              color: selectedBodyId === b.id ? '#fff' : '#94a3b8',
              boxShadow: selectedBodyId === b.id ? '0 4px 16px rgba(2, 132, 199, 0.4)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{b.icon}</div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: selectedBodyId === b.id ? '#fff' : '#f8fafc', lineHeight: 1.2 }}>
              {b.title.split('(')[0]}
            </div>
            <div style={{ fontSize: '0.68rem', color: selectedBodyId === b.id ? '#bae6fd' : '#64748b', marginTop: '3px' }}>
              {b.badge}
            </div>
          </button>
        ))}
      </div>

      {/* Active Body Detail Card */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.9)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '16px',
        padding: '22px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '14px' }}>
          <div>
            <span style={{ fontSize: '1.8rem', marginRight: '8px' }}>{activeBody.icon}</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
              {activeBody.title}
            </span>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '6px', maxWidth: '650px', lineHeight: 1.5 }}>
              {activeBody.desc}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleWhatsAppConsult(activeBody)}
            style={{
              background: '#22c55e',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 16px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(34, 197, 94, 0.35)'
            }}
          >
            <FiMessageSquare size={15} /> Bu Kasa İçin Teklif Al
          </button>
        </div>

        {/* Suitable Sectors */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
            🎯 EN ÇOK TERCİH EDİLEN SEKTÖRLER
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {activeBody.sectors.map((sec, idx) => (
              <span
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '20px',
                  padding: '4px 10px',
                  fontSize: '0.74rem',
                  color: '#e2e8f0',
                  fontWeight: 600
                }}
              >
                ✓ {sec}
              </span>
            ))}
          </div>
        </div>

        {/* Specs Table */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          background: 'rgba(2, 6, 23, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ fontSize: '0.70rem', color: '#94a3b8' }}>📏 Önerilen Kasa Boyu:</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>{activeBody.specs.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.70rem', color: '#94a3b8' }}>📐 Kasa Genişliği:</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>{activeBody.specs.width}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.70rem', color: '#94a3b8' }}>📦 Palet / Hacim Kapasitesi:</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>{activeBody.specs.pallets}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.70rem', color: '#94a3b8' }}>⚖️ Kasa Dara Ağırlığı:</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fbbf24', marginTop: '2px' }}>{activeBody.specs.tareWeight}</div>
          </div>
        </div>

        {/* Recommended IVECO Chassis Models */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '0.74rem', color: '#4ade80', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
            🚛 BU KASA İÇİN EN UYUMLU IVECO ŞASİLERİ
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {activeBody.recommendedChassis.map((rc, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '10px 12px'
                }}
              >
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#fff' }}>
                  {rc.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '3px' }}>
                  {rc.note}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features Bullet points */}
        <div>
          <div style={{ fontSize: '0.74rem', color: '#cbd5e1', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
            🛡️ ÖNE ÇIKAN DONANIM VE KALİTE STANDARTLARI
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '6px' }}>
            {activeBody.features.map((feat, idx) => (
              <div key={idx} style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiCheck style={{ color: '#10b981', flexShrink: 0 }} /> {feat}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
