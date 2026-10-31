import React, { useState, useMemo } from 'react';
import { FiHelpCircle, FiChevronDown, FiChevronUp, FiSearch, FiMessageSquare, FiPhone, FiCheckCircle } from 'react-icons/fi';

const FAQ_ITEMS = [
  {
    id: 'ehliyet_kamyonet',
    category: 'ehliyet',
    categoryLabel: 'Ehliyet & Kantar',
    question: 'Daily 35 kamyoneti B sınıfı (otomobil) ehliyetiyle kullanabilir miyim? Takograf ve şehir içi yasağı var mı?',
    answer: 'EVET, KESİNLİKLE. IVECO Daily 35 serisi (35S ve 35C) 3.500 kg azami yüklü ağırlığa sahip olduğu için Karayolları Trafik Yönetmeliği uyarınca KAMYONET statüsündedir.\n\n• Ehliyet: Standart B sınıfı (binek otomobil) ehliyeti olan herkes kullanabilir.\n• Takograf: Kamyonet statüsünde olduğu için takograf cihazı taktırma veya kullanma zorunluluğu yoktur.\n• Şehir İçi Giriş: Kamyonlara uygulanan saatlik şehir içi giriş yasaklarından muaftır; günün 24 saati şehir merkezlerinde, caddelerde ve dar sokaklarda serbestçe dağıtım yapabilirsiniz.'
  },
  {
    id: 'tek_vs_cift_teker',
    category: 'model_secimi',
    categoryLabel: 'Tek Teker vs Çift Teker',
    question: 'Daily 35S (Tek Teker) ile Daily 35C (Çift Teker) arasındaki fark nedir? Hangisini seçmeliyim?',
    answer: 'İki model arasındaki temel fark arka dingil yapısı ve şasi profilidir:\n\n1. Daily 35S (Tek Teker):\n• Arka aksta tek teker bulunur. Boş ağırlığı yaklaşık 200 kg daha hafiftir.\n• Yakıt tüketimi daha düşüktür, süspansiyonu yumuşaktır ve dar sokaklarda manevra kabiliyeti binek araç gibidir.\n• Kimler için ideal: Koli kargo, mobilya, e-ticaret, hafif gıda ve hacimli fakat tonajı 1.5 tonu geçmeyen yükler.\n\n2. Daily 35C (Çift Teker):\n• Arka aksta çift teker (toplam 4 arka tekerlek) bulunur ve ağır hizmet C-profil kamyon şasisine sahiptir.\n• Ağır yüklerde çökme yapmaz, virajlarda savrulmaz ve yüksek taşıma mukavemeti sağlar.\n• Kimler için ideal: Ağır dökme malzeme, demir/profil, süt ve et frigo kasaları, damper, oto kurtarma ve zorlu şantiye/yol şartları.'
  },
  {
    id: 'kantar_ceza_tolerans',
    category: 'ehliyet',
    categoryLabel: 'Ehliyet & Kantar',
    question: 'Kantarda ceza durumu nedir? Karayolları yasal toleransı ve net yük kapasiteleri ne kadardır?',
    answer: 'Karayolları Genel Müdürlüğü kantar denetimlerinde araç ruhsatındaki Azami Yüklü Ağırlık (AYA) esas alınır:\n\n• Daily 35 Serisi: Ruhsat AYA 3.500 kg\'dır. Karayolları mevzuatında tanınan %3.75 - %5 yasal toleransla birlikte kantardan yaklaşık 3.650 - 3.700 kg ile cezasız geçiş yapılabilir. Boş araç + kasa ağırlığı düşüldüğünde net yük kapasitesi 1.300 - 1.600 kg civarındadır.\n• Daily 72C Serisi: 7.200 kg AYA kapasitesine sahiptir ve 4.800 kg net yük taşır (C sınıfı ehliyet gerektirir).\n• Eurocargo 160: 17.080 kg kantar tescili ile 11 ton net yük taşır.\n• Eurocargo 10 Teker (6x2): 26.000 kg karayolları yasal kantar geçeriyle 16 ton net yük taşır.\n\nSistemimizdeki "Akıllı Şasi Seçici" taşımak istediğiniz net yükü girdiğinizde kantar aşımı olup olmayacağını otomatik renk kodlarıyla (Yeşil: Güvenli, Kırmızı: Aşım) gösterir.'
  },
  {
    id: 'anahtar_teslim_kasa',
    category: 'ust_yapi',
    categoryLabel: 'Üst Yapı & Kasa',
    question: 'Aracı yalnızca şasi olarak mı almalıyım, yoksa kasası (üst yapısı) yapılmış anahtar teslim alabilir miyim?',
    answer: 'HER İKİ SEÇENEK DE MEVCUTTUR.\n\nIVECO ERC Samsun Otomotiv olarak Sanayi ve Teknoloji Bakanlığı ile TSE onaylı projelendirme yetkisine sahibiz. İhtiyacınıza göre:\n1. Şasi Teslimat: Aracı sıfır şasi olarak fatura edip dilediğiniz üst yapıcıda kasa yaptırabilirsiniz.\n2. Anahtar Teslim Üst Yapılı Teslimat: Frigorifik soğutuculu, damperli, kapalı sac kutu, kayar perde tente veya oto kurtarma platformunuzu ERC Samsun garantili üst yapı partnerlerimize yaptırıp, TSE onayı ve ruhsata işletme işlemleri tamamlanmış halde doğrudan plakalı & anahtar teslim alabilirsiniz.'
  },
  {
    id: 'kredi_kampanyalari',
    category: 'kredi',
    categoryLabel: 'Kredi & Finansman',
    question: '%0 Faiz ve anlaşmalı banka ticari kredi kampanyalarının şartları nelerdir? Kimler başvurabilir?',
    answer: 'IVECO distribütörümüzün resmi anlaşmalı olduğu finansman kurumları (TEB Cetelem, Yapı Kredi, Garanti BBVA, Akbank, Kuveyt Türk, İş Bankası, Vakıf Katılım) ile yürütülen özel ticari kampanyalardır:\n\n• Kimler Faydalanabilir: Vergi levhası bulunan tüm şahıs işletmeleri, limited/anonim şirketler, KOBİ\'ler, esnaf ve sanatkarlar.\n• Limitler: Daily modellerinde 800.000 TL - 1.000.000 TL %0 Faiz (12 Ay), Eurocargo ve S-Way modellerinde 2.500.000 TL - 5.000.000 TL\'ye varan filo kredisi imkanı.\n• Katılım Bankacılığı: Faizsiz katılım prensipleriyle Kuveyt Türk üzerinden İlk 6 Ay Ödemesiz esnek finansman imkanı sağlanmaktadır.\n• Başvuru Süreci: Şirket vergi levhası, imza sirküleri ve son dönem mizanınız ile 1 saat içinde ön onay sonucu alınabilmektedir.'
  },
  {
    id: 'takas_imkani',
    category: 'teslimat',
    categoryLabel: 'Takas & Teslimat',
    question: 'Eski ticari aracımı takasa verebilir miyim? Ekspertiz süreci nasıl işler?',
    answer: 'EVET, ESKİ ARACINIZI DEĞERİNDE TAKASA ALIYORUZ.\n\nMarkası veya modeli ne olursa olsun mevcut ticari aracınızı (Ford Transit, Mercedes Sprinter/Atego, Isuzu, Renault Master vb.) uzman ekspertiz ekibimizle piyasa rayiç bedelinde değerlendiriyoruz. Takas bedelini yeni IVECO aracınızın peşinatı olarak sayıyor, kalan tutara %0 faizli veya düşük oranlı kredi tanımlayabiliyoruz.'
  },
  {
    id: 'turkiye_teslimat',
    category: 'teslimat',
    categoryLabel: 'Takas & Teslimat',
    question: 'Samsun ERC Otomotiv\'den Türkiye\'nin her yerine teslimat yapıyor musunuz? Teslimat süresi ne kadardır?',
    answer: 'EVET, TÜRKİYE\'NİN 81 İLİNE RESMİ TESLİMAT YAPIYORUZ.\n\n• Hazır Stoktaki Araçlar: Şasi araçlarımız tescil, plaka ve sigorta işlemlerinin tamamlanmasını takiben 2-3 iş günü içerisinde teslime hazır hale gelir.\n• Üst Yapılı Araçlar: Seçilen kasa tipine (frigo, damper, kutu) bağlı olarak üst yapı imalat süresi ortalama 10-18 iş günüdür.\n• Sevkiyat: Aracınızı Samsun tesislerimizden anahtar teslim alabileceğiniz gibi, profesyonel araç nakliye filomuzla Türkiye\'nin istediğiniz ilindeki adresinize veya şirketinize de teslim edebiliyoruz.'
  },
  {
    id: 'motor_omru_yakit',
    category: 'teknik',
    categoryLabel: 'Teknik & Motor',
    question: 'IVECO\'nun motor gücü, yakıt tüketimi ve servis maliyetleri diğer markalara göre nasıldır?',
    answer: 'IVECO motorları, hafif ve ağır ticari araç segmentinde dayanıklılık standardını belirleyen FPT (Fiat Powertrain Technologies) tarafından üretilir:\n\n• F1A (2.3 Litre): 156 Beygir gücü ve 380 Nm tork üretir. Şehir içi dağıtımda sınıfının en düşük yakıt tüketim değerlerine (100 km\'de ortalama 8.5 - 9.8 litre) sahiptir.\n• F1C (3.0 Litre): 160 Beygir ve 400 Nm tork. Ağır hizmet C-profil şasi ile 3.0 litrelik zincirli motor ömrü 1.000.000 km üzerinde sorunsuz çalışacak şekilde tasarlanmıştır.\n• Bakım Aralıkları: 20.000 - 40.000 km periyodik bakım aralığı sayesinde rakiplerine göre işletme ve servis maliyetlerinde %25\'e varan tasarruf sağlar.'
  },
  {
    id: 'himatic_otomatik',
    category: 'teknik',
    categoryLabel: 'Teknik & Motor',
    question: 'Hi-Matic 8 ileri tam otomatik vites ticari araçta nasıldır, arıza yapar mı?',
    answer: 'IVECO Hi-Matic şanzıman, dünyanın 1 numaralı şanzıman üreticisi ZF tarafından tasarlanan 8 İleri Tork Konvertörlü tam otomatik şanzımandır.\n\n• Robotize veya çift kavramalı (kuru kavrama) DEĞİLDİR; gerçek yağlı tork konvertörlüdür.\n• Dur-kalk trafikte veya dik rampalarda debriyaj balatası yanması ya da ısınma riski KESİNLİKLE YOKTUR.\n• 200 milisaniyeden kısa sürede pürüzsüz vites geçişi sağlar; sürücü yorgunluğunu sıfıra indirir ve debriyaj masrafını tamamen ortadan kaldırır.'
  },
  {
    id: 'vergi_avantajlari',
    category: 'kredi',
    categoryLabel: 'Kredi & Finansman',
    question: 'Sıfır ticari araç alımında şirketimize hangi vergi ve KDV avantajları sağlanır?',
    answer: 'Şirketler ve vergi mükellefleri için ticari araç alımı çok güçlü vergi kalkanı sunar:\n\n1. %20 KDV İndirimi: Faturada ödenen KDV\'nin tamamı ödenecek KDV\'den doğrudan düşülür (Binek araçlardaki gibi KDV maliyete atılmaz, anında nakit mahsubu yapılır).\n2. %100 Amortisman: Aracın KDV hariç bedelinin tamamı 5 yıl boyunca yıllık %20 oranında kurumlar/gelir vergisinden doğrudan gider olarak düşülür.\n3. Kredi Faizleri: Kredi faiz ve dosya masraflarının tamamı şirkete finansman gideri yazılır.\n4. MTV Avantajı: Kamyonet statüsündeki araçların Motorlu Taşıtlar Vergisi binek araçlara göre oldukça düşüktür.'
  }
];

const FAQ_CATEGORIES = [
  { id: 'all', label: 'Tüm Sorular' },
  { id: 'ehliyet', label: 'Ehliyet & Kantar' },
  { id: 'tek_vs_cift_teker', label: 'Tek vs Çift Teker' },
  { id: 'ust_yapi', label: 'Üst Yapı (Kasa)' },
  { id: 'kredi', label: 'Kredi & Finansman' },
  { id: 'teslimat', label: 'Takas & Teslimat' },
  { id: 'teknik', label: 'Teknik & Motor' }
];

export default function FaqLinkedInTab({ onDirectWhatsApp, salesRep }) {
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState(['ehliyet_kamyonet', 'tek_vs_cift_teker']);

  const toggleOpen = (id) => {
    setOpenIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter(item => {
      if (selectedCat !== 'all' && item.category !== selectedCat) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedCat, searchQuery]);

  const handleAskSpecificQuestion = (questionTitle) => {
    if (onDirectWhatsApp) {
      const msg = `Merhaba ${salesRep?.name || 'Can Murat Bey'}, LinkedIn / Müşteri Rehberinizdeki *"${questionTitle}"* konusu hakkında size danışmak ve şirketimize özel detaylı bilgi almak istiyorum.`;
      onDirectWhatsApp(msg);
    }
  };

  return (
    <div style={{ color: '#f8fafc' }}>
      {/* Tab Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0, 119, 181, 0.25) 0%, rgba(15, 23, 42, 0.7) 100%)',
        border: '1px solid rgba(0, 119, 181, 0.45)',
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
          <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            💼 LINKEDIN & DİJİTAL MÜŞTERİ BİLGİ MERKEZİ
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 2px', color: '#fff' }}>
            Ticari Araç Alıcılarının Aklına Gelen 10 Kritik Soru & Yanıtları
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            Ehliyetten kantara, çift teker mukavemetinden %0 faizli kredilere kadar tüm sorularınızın şeffaf yanıtları.
          </p>
        </div>
        <div style={{
          background: 'rgba(0, 119, 181, 0.2)',
          border: '1px solid rgba(0, 119, 181, 0.5)',
          borderRadius: '12px',
          padding: '8px 14px',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.70rem', color: '#38bdf8', fontWeight: 700 }}>🔍 ŞEFFAF DANIŞMANLIK</div>
          <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 800 }}>Can Murat Onay Güvencesi</div>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {FAQ_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCat(cat.id)}
              style={{
                background: selectedCat === cat.id ? '#0284c7' : 'rgba(15, 23, 42, 0.65)',
                color: selectedCat === cat.id ? '#fff' : '#94a3b8',
                border: selectedCat === cat.id ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Aklınıza gelen soruyu veya anahtar kelimeyi yazın (örn: ehliyet, kantar, çift teker, kredi, kasa)..."
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Accordion Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIds.includes(faq.id);
          return (
            <div
              key={faq.id}
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: isOpen ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: isOpen ? '0 4px 20px rgba(0, 75, 147, 0.2)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {/* Question Header */}
              <div
                onClick={() => toggleOpen(faq.id)}
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  cursor: 'pointer',
                  background: isOpen ? 'rgba(2, 132, 199, 0.12)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: isOpen ? '#0284c7' : 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    flexShrink: 0
                  }}>
                    {idx + 1}
                  </span>
                  <div>
                    <span style={{ fontSize: '0.90rem', fontWeight: 800, color: isOpen ? '#38bdf8' : '#f8fafc' }}>
                      {faq.question}
                    </span>
                    <span style={{
                      display: 'inline-block',
                      marginLeft: '8px',
                      fontSize: '0.64rem',
                      color: '#94a3b8',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {faq.categoryLabel}
                    </span>
                  </div>
                </div>
                <div style={{ color: isOpen ? '#38bdf8' : '#64748b' }}>
                  {isOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </div>
              </div>

              {/* Answer Content */}
              {isOpen && (
                <div style={{
                  padding: '14px 18px 16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  background: 'rgba(2, 6, 23, 0.5)'
                }}>
                  <div style={{ fontSize: '0.80rem', color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {faq.answer}
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => handleAskSpecificQuestion(faq.question)}
                      style={{
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.35)',
                        color: '#4ade80',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <FiMessageSquare size={13} /> Bu Konuyu Can Murat Onay'a Sor
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still Have Questions CTA */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(2, 6, 23, 0.98) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        borderRadius: '16px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>💬</div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px' }}>
          Aklınıza Takılan Başka Bir Soru mu Var?
        </h3>
        <p style={{ fontSize: '0.80rem', color: '#94a3b8', margin: '0 auto 14px', maxWidth: '520px', lineHeight: 1.45 }}>
          Filo yapınız, rotalarınız, özel kasa projeleriniz veya takas teklifleriniz için Satış Sorumlumuz <strong>{salesRep?.name || 'Can Murat Onay'}</strong> ile doğrudan iletişime geçebilirsiniz.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onDirectWhatsApp && onDirectWhatsApp(`Merhaba ${salesRep?.name || 'Can Murat Bey'}, aklıma takılan bir soru var ve sizinle görüşmek istiyorum.`)}
            style={{
              background: '#22c55e',
              color: '#fff',
              border: 'none',
              borderRadius: '25px',
              padding: '10px 20px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 16px rgba(34, 197, 94, 0.35)'
            }}
          >
            <FiMessageSquare size={15} /> WhatsApp'tan Hemen Sor
          </button>

          <a
            href={`tel:${salesRep?.phoneClean || '05446225931'}`}
            style={{
              background: '#0284c7',
              color: '#fff',
              border: 'none',
              borderRadius: '25px',
              padding: '10px 20px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(2, 132, 199, 0.35)'
            }}
          >
            <FiPhone size={15} /> Telefonla Ara ({salesRep?.phoneDisplay || '0544 622 59 31'})
          </a>
        </div>
      </div>
    </div>
  );
}
