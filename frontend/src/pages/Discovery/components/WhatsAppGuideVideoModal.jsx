import React, { useState, useEffect, useRef } from 'react';
import {
  FiVideo,
  FiDownload,
  FiPlay,
  FiPause,
  FiCopy,
  FiCheck,
  FiX,
  FiImage,
  FiSmartphone,
  FiLayers,
  FiVolume2,
  FiVolumeX,
  FiMusic
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const STEP_DURATION_SEC = 4.5; // Her sahne 4.5 saniye (Ahmet Neural erkek spiker sesinin doğal hızda 1.0x okunması için)
const DURATION_SEC = STEP_DURATION_SEC * 4; // 4 adım x 4.5 saniye = 18 saniye
const FPS = 30;
const CANVAS_W = 1080;
const CANVAS_H = 1920;

// ── 5 AKILCI WHATSAPP DURUM VİDEO SENARYOSU ─────────────────────────────────
// ANDROID WHATSAPP DURUM KURALI:
// Android'de açıklama + link toplamı ~180 karakteri aşarsa veya yıldız (*), madde imi ve çoklu paragraf
// kullanılırsa üstteki resimli önizleme kartı kaybolur ve video altında "...devamını oku" çıkıp link gizlenir.
// Bu yüzden tüm senaryo metinleri tek cümle (~80 krk) + alt satırda tek başına link (~155 krk toplam) olarak sınırlandırılmıştır.
const VIDEO_SCENARIOS = [
  {
    id: 'kilavuz',
    dayLabel: '1. Senaryo • Genel Kılavuz',
    shortTitle: '📲 10 Sn Kullanım Kılavuzu',
    refCode: 'wa_durum_kilavuz',
    urlBar: '🔒 iveco-fiyat-listesi.vercel.app — Dijital Fiyat & Kredi Kataloğu',
    onlyLink: 'https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_kilavuz',
    caption:
      `📲 Peşinatınızı seçip 5 bankada 2026 IVECO taksit ve KDV planınızı canlı hesaplayın 👇\n\n` +
      `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_kilavuz`,
    steps: [
      {
        badge: 'ADIM 1 / 4 • CANLI BÜTÇE SÜRGÜSÜ',
        title: 'Peşinat veya Takas Tutarınızı Kaydırarak Seçin',
        subtitle: 'Form doldurmadan sürgüyü kaydırın; tüm araçların kalan kredisi anında düşsün.',
        voiceover: 'Sürgüyü kaydırıp peşinat veya takas tutarınızı kolayca seçin.',
        audioUrl: '/audio/wa-scenarios/kilavuz_1.mp3',
        accent: '#10b981',
        accentBg: 'rgba(16, 185, 129, 0.22)'
      },
      {
        badge: 'ADIM 2 / 4 • 5 BANKA KREDİ KIYASLAMA',
        title: "'Kredi Planı'na Basıp 5 Bankayı Karşılaştırın",
        subtitle: '1 Milyon TL %0 faiz ve Kuveyt Türk 3-6 ay ödemesiz taksit tablolarını canlı açın.',
        voiceover: 'Beş bankanın sıfır faizli ve ödemesiz taksitlerini anında karşılaştırın.',
        audioUrl: '/audio/wa-scenarios/kilavuz_2.mp3',
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.22)'
      },
      {
        badge: 'ADIM 3 / 4 • KDV VERGİ KALKANI & MUHASEBE',
        title: '%20 KDV Avantajını Görün & Muhasebeye Atın',
        subtitle: 'Vergiden düşeceğiniz KDV tutarını görün, tek tuşla ortağınıza veya muhasebenize iletin.',
        voiceover: 'Yüzde yirmi KDV vergi avantajınızı görüp muhasebenize gönderin.',
        audioUrl: '/audio/wa-scenarios/kilavuz_3.mp3',
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.22)'
      },
      {
        badge: 'ADIM 4 / 4 • ŞİMDİ KENDİ TELEFONUNUZDA DENEYİN',
        title: 'Aşağıdaki Linke Dokunun, Hesabınızı Canlı Yapın!',
        subtitle: 'Kayıt yok, bekleme yok! Linke tıklayıp 10 saniyede kendi ödeme planınızı oluşturun.',
        voiceover: 'Aşağıdaki linke dokunun, kendi hesabınızı on saniyede canlı yapın!',
        audioUrl: '/audio/wa-scenarios/kilavuz_4.mp3',
        accent: '#22c55e',
        accentBg: 'rgba(34, 197, 94, 0.25)'
      }
    ]
  },
  {
    id: 'takas',
    dayLabel: '2. Senaryo • Takas + Kredi',
    shortTitle: '🔄 Eski Aracı Takasa Ver, Üstünü Kredile',
    refCode: 'wa_durum_takas',
    urlBar: '🔒 iveco-fiyat-listesi.vercel.app — Canlı Takas & Fark Kredisi Hesaplayıcı',
    onlyLink: 'https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_takas',
    caption:
      `🔄 Aracınızı takasa verince sıfır IVECO ayda kaç TL'ye gelir? 1M TL %0 Faizle hesaplayın 👇\n\n` +
      `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_takas`,
    steps: [
      {
        badge: 'TAKAS ADIM 1 / 4 • ARACINIZ PEŞİNAT OLSUN',
        title: 'Mevcut Aracınızın Değerini Sürgüden Seçin',
        subtitle: 'Cebinizden nakit çıkarmadan, elinizdeki aracın değerini peşinat olarak girin.',
        voiceover: "Mevcut ticari aracınızı peşinata saydırıp sıfır İveco'ya geçin.",
        audioUrl: '/audio/wa-scenarios/takas_1.mp3',
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.22)'
      },
      {
        badge: 'TAKAS ADIM 2 / 4 • SADECE FARKI KREDİLENDİRİN',
        title: 'Sıfır Araçtan Takas Düşer, Kalan Fark Çıkar!',
        subtitle: 'Örn: 2.390.000 TL araçtan 1.500.000 TL takas düşüldüğünde sadece 890.000 TL kalır.',
        voiceover: 'Sıfır araçtan takas bedelini düşüp sadece kalan farkı ödeyin.',
        audioUrl: '/audio/wa-scenarios/takas_2.mp3',
        accent: '#10b981',
        accentBg: 'rgba(16, 185, 129, 0.22)'
      },
      {
        badge: 'TAKAS ADIM 3 / 4 • 4 RESİMLE HIZLI EKSPERTİZ',
        title: "Kalan Farka %0 Faiz + 4 Resimle Ekspertiz",
        subtitle: 'Aracınızın dış, iç, KM ve ruhsat fotoğrafını seçip WhatsApp üzerinden fiyat alın.',
        voiceover: 'Kalan farka sıfır faiz kullanın, dört fotoğrafla ekspertiz alın.',
        audioUrl: '/audio/wa-scenarios/takas_3.mp3',
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.22)'
      },
      {
        badge: 'TAKAS ADIM 4 / 4 • CANLI TAKAS SİMÜLATÖRÜ',
        title: 'Kendi Aracınızla Üste Ne Çıkıyor Hemen Görün!',
        subtitle: 'Aşağıdaki linke dokunun, takas sürgüsüyle kendi fark taksitinizi 10 saniyede hesaplayın.',
        voiceover: 'Aşağıdaki linke tıklayın, aracınızın takas farkını hemen hesaplayın!',
        audioUrl: '/audio/wa-scenarios/takas_4.mp3',
        accent: '#22c55e',
        accentBg: 'rgba(34, 197, 94, 0.25)'
      }
    ]
  },
  {
    id: 'odemesiz',
    dayLabel: '3. Senaryo • 3-6 Ay Ödemesiz & %0 Faiz',
    shortTitle: '⏳ Şimdi Al, 3-6 Ay Sonra Öde',
    refCode: 'wa_durum_odemesiz',
    urlBar: '🔒 iveco-fiyat-listesi.vercel.app — Kasım 2026 Resmi Banka Tablosu',
    onlyLink: 'https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_odemesiz',
    caption:
      `⏳ Şimdi alın, ilk taksiti 3-6 ay sonra ödeyin: 5 bankada %0 faizli kredi tablosu 👇\n\n` +
      `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_odemesiz`,
    steps: [
      {
        badge: 'FİNANSMAN 1 / 4 • NAKİT AKIŞINIZI KORUYUN',
        title: 'Aracı Şimdi Alın, İlk Taksiti 3-6 Ay Sonra Ödeyin!',
        subtitle: 'Araç hemen para kazanmaya başlasın; ödemeniz 3 veya 6 ay sonra başlasın.',
        voiceover: 'Aracınızı bugün işe koşun, ilk taksiti altı ay sonra ödeyin!',
        audioUrl: '/audio/wa-scenarios/odemesiz_1.mp3',
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.22)'
      },
      {
        badge: 'FİNANSMAN 2 / 4 • KUVEYT TÜRK 1M - 5M TL PAKETİ',
        title: '5 Milyon TL’ye Kadar 3 ve 6 Ay Ödemesiz Kredi',
        subtitle: 'Kuveyt Türk Katılım Finansmanı ile 6 aydan 36 aya kadar esnek vade tablosu.',
        voiceover: "Kuveyt Türk'te beş milyon liraya kadar ödemesiz krediyi inceleyin.",
        audioUrl: '/audio/wa-scenarios/odemesiz_2.mp3',
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.22)'
      },
      {
        badge: 'FİNANSMAN 3 / 4 • 4 BANKADA 1 MİLYON TL %0 FAİZ',
        title: 'Garanti, Akbank, İş Bankası ve Yapı Kredi Tablosu',
        subtitle: '1.000.000 TL 6 Ay %0 Faiz (166.667 TL/Ay) veya 2M - 3M TL ticari kredi paketleri.',
        voiceover: 'Dört büyük bankada bir milyon lira sıfır faiz fırsatını görün.',
        audioUrl: '/audio/wa-scenarios/odemesiz_3.mp3',
        accent: '#10b981',
        accentBg: 'rgba(16, 185, 129, 0.22)'
      },
      {
        badge: 'FİNANSMAN 4 / 4 • TÜM BANKALAR TEK EKRANDA',
        title: 'Şubeye Gitmeden 5 Bankayı Telefonunuzda Kıyaslayın!',
        subtitle: 'Aşağıdaki linke tıklayın, istediğiniz kredi tutarını seçip taksitleri canlı görün.',
        voiceover: 'Şubeye gitmeden beş bankayı kıyaslamak için aşağıdaki linke dokunun!',
        audioUrl: '/audio/wa-scenarios/odemesiz_4.mp3',
        accent: '#22c55e',
        accentBg: 'rgba(34, 197, 94, 0.25)'
      }
    ]
  },
  {
    id: 'kdv',
    dayLabel: '4. Senaryo • %20 KDV & Muhasebe Özeti',
    shortTitle: '🧾 %20 KDV Avantajı & Nakit İndirimi',
    refCode: 'wa_durum_kdv',
    urlBar: '🔒 iveco-fiyat-listesi.vercel.app — KDV Kalkanı & Muhasebe Özeti',
    onlyLink: 'https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_kdv',
    caption:
      `🧾 Vergi ödemek yerine filoyu yenileyin: %20 KDV avantajı ve 260 Bin TL nakit indirimi 👇\n\n` +
      `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_kdv`,
    steps: [
      {
        badge: 'MUHASEBE 1 / 4 • YIL SONU VERGİ KALKANI',
        title: 'Hangi Araçta Ne Kadar KDV Vergiden Düşüyor?',
        subtitle: 'Katalogdaki her aracın üzerinde indirilebilir %20 KDV tutarı kuruşu kuruşuna yazar.',
        voiceover: 'Vergi ödemek yerine yüzde yirmi KDV avantajıyla filonuzu yenileyin.',
        audioUrl: '/audio/wa-scenarios/kdv_1.mp3',
        accent: '#10b981',
        accentBg: 'rgba(16, 185, 129, 0.22)'
      },
      {
        badge: 'MUHASEBE 2 / 4 • 260.000 TL’YE VARAN NAKİT İNDİRİMİ',
        title: '35C’de 110 Bin TL, 70C’de 260 Bin TL Peşin İndirimi!',
        subtitle: 'Kredili kampanya fiyatı ile net nakit indirimli fiyatı aynı kartta şeffaf görün.',
        voiceover: 'Daily serisinde iki yüz altmış bin lira nakit indirimini yakalayın.',
        audioUrl: '/audio/wa-scenarios/kdv_2.mp3',
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.22)'
      },
      {
        badge: 'MUHASEBE 3 / 4 • TEK TUŞLA ORTAĞA / MUHASEBEYE ATIN',
        title: "'Ortağa / Muhasebeye Gönder' Tuşuna Dokunun",
        subtitle: 'Aracın net fiyatını, KDV kalkanını ve kredi taksitini tek tıkla mali müşavirinize iletin.',
        voiceover: 'Tek tuşla araç ve KDV özetini mali müşavirinize gönderin.',
        audioUrl: '/audio/wa-scenarios/kdv_3.mp3',
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.22)'
      },
      {
        badge: 'MUHASEBE 4 / 4 • ŞİRKETİNİZ İÇİN CANLI HESAPLAYIN',
        title: 'Aşağıdaki Linkten KDV ve Nakit Tablosunu Açın!',
        subtitle: 'Hemen linke dokunun, yıl sonu vergi avantajınızı kendi telefonunuzda inceleyin.',
        voiceover: 'Şirketinize özel vergi ve indirim tablosu için linke tıklayın!',
        audioUrl: '/audio/wa-scenarios/kdv_4.mp3',
        accent: '#22c55e',
        accentBg: 'rgba(34, 197, 94, 0.25)'
      }
    ]
  },
  {
    id: 'kantar',
    dayLabel: '5. Senaryo • 35C vs 70C Kantar & Şasi',
    shortTitle: '⚖️ B Ehliyet 35C mi, 4.8 Ton 70C mi?',
    refCode: 'wa_durum_kantar',
    urlBar: '🔒 iveco-fiyat-listesi.vercel.app — Akıllı Şasi, Kasa & Kantar Seçici',
    onlyLink: 'https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_kantar',
    caption:
      `⚖️ B ehliyetli 35C mi, 4.8 tonluk 70C mi? Şasi ve net peşin fiyatları karşılaştırın 👇\n\n` +
      `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_kantar`,
    steps: [
      {
        badge: 'ŞASİ SEÇİMİ 1 / 4 • B EHLİYET & TAKOGRAF MUAFİYETİ',
        title: 'Daily 35C16: B Ehliyetle Kullanılan Çift Teker Gücü',
        subtitle: 'Takograf muafiyetli, B sınıfı ehliyetle şehir içi dağıtım için 2.390.000 TL net peşin.',
        voiceover: 'B ehliyetle kullanılan takograf muafiyetli Daily otuz beş C mi?',
        audioUrl: '/audio/wa-scenarios/kantar_1.mp3',
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.22)'
      },
      {
        badge: 'ŞASİ SEÇİMİ 2 / 4 • 4.8 TON RESMİ KANTAR KAPASİTESİ',
        title: 'Daily 70C16 & 70C18: 4.8 Ton Yük & 260 Bin İndirim!',
        subtitle: '10-12 Euro Palet kapasiteli ağır şasi; 260.000 TL nakit indirimiyle 2.420.000 TL net peşin.',
        voiceover: 'Yoksa beş tona yakın yük taşıyan indirimli yetmiş C mi?',
        audioUrl: '/audio/wa-scenarios/kantar_2.mp3',
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.22)'
      },
      {
        badge: 'ŞASİ SEÇİMİ 3 / 4 • EUROCARGO & S-WAY / T-WAY FİLO',
        title: '3.5 Tondan 40 Ton Çekiciye Tüm 2026 Fiyatları',
        subtitle: 'Frigo, tente, sac kasa, kurtarıcı veya damper; işinize uygun şasiyi tek tıkla süzün.',
        voiceover: 'Üç buçuk tondan kırk tona tüm şasi fiyatlarını inceleyin.',
        audioUrl: '/audio/wa-scenarios/kantar_3.mp3',
        accent: '#10b981',
        accentBg: 'rgba(16, 185, 129, 0.22)'
      },
      {
        badge: 'ŞASİ SEÇİMİ 4 / 4 • KENDİ ŞASİNİZİ KARŞILAŞTIRIN',
        title: 'Aşağıdaki Linke Dokunun, Şasi ve Fiyatları Kıyaslayın!',
        subtitle: '3750, 4100 ve 4750 şasi fiyat farklarını ve kredi tablosunu canlı inceleyin.',
        voiceover: 'Aşağıdaki linke dokunun, işinize en uygun şasiyi canlı karşılaştırın!',
        audioUrl: '/audio/wa-scenarios/kantar_4.mp3',
        accent: '#22c55e',
        accentBg: 'rgba(34, 197, 94, 0.25)'
      }
    ]
  }
];

function drawRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
}

function easeInOutQuad(t) {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

export default function WhatsAppGuideVideoModal({ isOpen, onClose }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const audioCtxRef = useRef(null);
  const audioBufferCacheRef = useRef({});
  const activePreviewSourceRef = useRef(null);
  const lastSpokenStepRef = useRef(-1);

  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [voiceMode, setVoiceMode] = useState('male_ahmet'); // 'male_ahmet' | 'male_baritone' | 'muted'
  const [bgMusicEnabled, setBgMusicEnabled] = useState(true);
  const [liveAudioPreview, setLiveAudioPreview] = useState(false);

  const currentScenario = VIDEO_SCENARIOS[scenarioIdx] || VIDEO_SCENARIOS[0];

  // Senaryo bazlı özel telefon içi ekran çizici
  const renderPhoneScreenContent = (ctx, scId, stepIdx, stepLocalT, phoneX, phoneY, phoneW) => {
    const contentX = phoneX + 34;
    const contentW = phoneW - 68;

    // 4. Adım tüm senaryolarda o senaryoya özel "Şimdi Linke Dokunun" final ekranıdır
    if (stepIdx === 3) {
      drawRoundedRect(ctx, contentX, phoneY + 115, contentW, 1080, 30);
      const ctaGrad = ctx.createLinearGradient(0, phoneY + 115, 0, phoneY + 1195);
      ctaGrad.addColorStop(0, '#0f291e');
      ctaGrad.addColorStop(1, '#091526');
      ctx.fillStyle = ctaGrad;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#22c55e';
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#4ade80';
      ctx.font = '900 30px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(`🚀 ${currentScenario.dayLabel.toUpperCase()}`, CANVAS_W / 2, phoneY + 195);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 44px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('2026 IVECO DİJİTAL KATALOG', CANVAS_W / 2, phoneY + 268);
      ctx.fillText('& CANLI HESAPLAMA PORTALI', CANVAS_W / 2, phoneY + 325);

      const scenarioBullets = {
        kilavuz: [
          '✅  Form doldurma veya arama zorunluluğu YOK',
          '✅  Peşinat & Takas sürgüsüyle canlı taksit hesabı',
          '✅  5 Banka (%0 Faiz & 3-6 Ay Ödemesiz) karşılaştırma',
          '✅  %20 KDV vergi kalkanı & nakit iskonto tablosu',
          '✅  Tek tuşla ortağa / muhasebeye özet gönderme'
        ],
        takas: [
          '🔄  Mevcut aracınızı peşinata saydırıp farkı görün',
          '🔥  Üste kalan farka 1.000.000 TL %0 Faiz imkanı',
          '⏳  Kuveyt Türk ile 3 ve 6 Ay Ödemesiz kredi seçeneği',
          '📸  4 Resimle (Dış, İç, KM, Ruhsat) hızlı ön ekspertiz',
          '🚛  Cebinizden nakit çıkmadan sıfır 2026 IVECO sahibi olun'
        ],
        odemesiz: [
          '⏳  Kuveyt Türk: 3 Ay ve 6 Ay Ödemesiz Dönem!',
          '💰  1.000.000 TL’den 5.000.000 TL’ye kadar kredi limiti',
          '🔥  Garanti / Akbank / İş / Yapı Kredi: 1M TL %0 Faiz',
          '📅  6 - 12 - 18 - 24 - 36 Ay esnek vade seçenekleri',
          '⚡  Şubeye gitmeden tüm banka taksitlerini canlı kıyaslayın'
        ],
        kdv: [
          '🧾  Her araçta ~400.000 TL’ye varan %20 KDV Vergi Kalkanı',
          '💵  Daily 35C’de 110.000 TL, 70C’de 260.000 TL Nakit İskonto',
          '📤  Tek tuşla mali müşavirinize / ortağınıza özet gönderin',
          '🏦  Hem nakit indirimli hem kredili fiyatları şeffaf görün',
          '📈  Devlete vergi yerine şirketinizin filosuna sıfır araç alın'
        ],
        kantar: [
          '🪪  Daily 35C16: B Ehliyet • Takograf Muafiyetli • Çift Teker',
          '⚖️  Daily 70C16 & 70C18: 4.8 Ton Net Yük • 10-12 Euro Palet',
          '💵  35C’de 2.390.000 TL, 70C’de 2.420.000 TL’den başlayan peşin',
          '🏗️  3750, 4100 ve 4750 mm şasi uzunluklarını canlı kıyaslayın',
          '🚛  Eurocargo, S-Way Çekici ve T-Way Şantiye serisi tek ekranda'
        ]
      };

      const bullets = scenarioBullets[scId] || scenarioBullets.kilavuz;
      ctx.textAlign = 'left';
      bullets.forEach((b, idx) => {
        const by = phoneY + 395 + idx * 86;
        drawRoundedRect(ctx, contentX + 44, by, contentW - 88, 68, 16);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.fill();
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '700 25px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(b, contentX + 72, by + 44);
      });

      const bounceY = Math.sin(stepLocalT * Math.PI * 6) * 14;
      drawRoundedRect(ctx, contentX + 44, phoneY + 875 + bounceY, contentW - 88, 175, 26);
      ctx.fillStyle = '#22c55e';
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#052e16';
      ctx.font = '900 36px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('👇 HEMEN AŞAĞIDAKİ LİNKE DOKUNUN!', CANVAS_W / 2, phoneY + 945 + bounceY);

      ctx.font = '800 26px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('iveco-fiyat-listesi.vercel.app', CANVAS_W / 2, phoneY + 1005 + bounceY);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 24px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('IVECO ERC Samsun Otomotiv • 0544 622 59 31', CANVAS_W / 2, phoneY + 1135);
      ctx.textAlign = 'left';
      return;
    }

    // ── SENARYO 2 (TAKAS + KREDİ) ÖZEL SAHNELERİ ─────────────────────────────
    if (scId === 'takas') {
      if (stepIdx === 0 || stepIdx === 1) {
        const slideProgress = stepIdx === 0
          ? easeInOutQuad(Math.min(1, Math.max(0, (stepLocalT - 0.1) / 0.65)))
          : 1;
        const tradeInVal = Math.round((1000000 + slideProgress * 500000) / 50000) * 50000; // 1.0M -> 1.5M TL
        const zeroVehiclePrice = 2390000; // Daily 35C16
        const diffLoan = zeroVehiclePrice - tradeInVal;

        drawRoundedRect(ctx, contentX, phoneY + 110, contentW, 350, 24);
        ctx.fillStyle = '#162238';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#f59e0b';
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = '800 26px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('🔄 MEVCUT ARACINIZIN TAKAS DEĞERİNİ SEÇİN:', contentX + 30, phoneY + 165);

        drawRoundedRect(ctx, contentX + 30, phoneY + 195, contentW - 60, 88, 16);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 24px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('Tahmini Takas Peşinatınız:', contentX + 55, phoneY + 250);
        ctx.fillStyle = '#4ade80';
        ctx.font = '900 38px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(`${tradeInVal.toLocaleString('tr-TR')} TL`, contentX + 480, phoneY + 252);

        // Slider
        const trackX = contentX + 36;
        const trackY = phoneY + 325;
        const trackW = contentW - 72;
        drawRoundedRect(ctx, trackX, trackY, trackW, 22, 11);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        const activeW = trackW * (0.35 + slideProgress * 0.45);
        drawRoundedRect(ctx, trackX, trackY, activeW, 22, 11);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(trackX + activeW, trackY + 11, 22, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Alt Fark Hesabı Tablosu
        drawRoundedRect(ctx, contentX, phoneY + 495, contentW, 560, 26);
        ctx.fillStyle = '#132038';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#10b981';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 34px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('📊 TAKAS SONRASI ÜSTE KALAN FARK HESABI', contentX + 34, phoneY + 558);

        const rows = [
          { label: 'Sıfır 2026 IVECO Daily 35C16 Bedeli:', val: '2.390.000 TL', color: '#ffffff' },
          { label: 'Mevcut Aracınızın Takas Peşinatı (-):', val: `-${tradeInVal.toLocaleString('tr-TR')} TL`, color: '#fbbf24' },
          { label: 'Üste Kredilendirilecek Net Fark:', val: `${diffLoan.toLocaleString('tr-TR')} TL`, color: '#4ade80' }
        ];

        rows.forEach((r, idx) => {
          const ry = phoneY + 595 + idx * 112;
          drawRoundedRect(ctx, contentX + 34, ry, contentW - 68, 92, 16);
          ctx.fillStyle = idx === 2 ? 'rgba(16, 185, 129, 0.18)' : '#0f172a';
          ctx.fill();
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '700 24px "Segoe UI", Inter, Arial, sans-serif';
          ctx.fillText(r.label, contentX + 58, ry + 56);
          ctx.fillStyle = r.color;
          ctx.font = '900 34px "Segoe UI", Inter, Arial, sans-serif';
          ctx.fillText(r.val, contentX + 540, ry + 58);
        });

        drawRoundedRect(ctx, contentX + 34, phoneY + 945, contentW - 68, 82, 16);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.fill();
        ctx.fillStyle = '#93c5fd';
        ctx.font = '800 25px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(`🔥 Kalan ${diffLoan.toLocaleString('tr-TR')} TL için 6 Ay %0 Faiz veya 3-6 Ay Ödemesiz Kredi!`, contentX + 55, phoneY + 995);

        drawRoundedRect(ctx, contentX + 40, phoneY + 1110, contentW - 80, 110, 22);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 29px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👆 Aracınızı peşinata saydırın, sadece kalan farkı ödeyin!', CANVAS_W / 2, phoneY + 1176);
        ctx.textAlign = 'left';
        return;
      }

      if (stepIdx === 2) {
        // 4 Resimle Takas Ekspertiz Ekranı
        drawRoundedRect(ctx, contentX, phoneY + 115, contentW, 950, 28);
        ctx.fillStyle = '#132038';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#3b82f6';
        ctx.stroke();

        ctx.fillStyle = '#60a5fa';
        ctx.font = '900 28px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('📸 4 RESİMLE YERİNDEN TAKAS ÖN EKSPERTİZİ', contentX + 36, phoneY + 175);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 34px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('Sanayiye Gitmeden Telefonunuzdan Fiyat Alın!', contentX + 36, phoneY + 230);

        const photoSlots = [
          { icon: '🚛', title: '1. Dışarıdan Görünüm', desc: 'Aracın dış kasa/şasi resmi' },
          { icon: '💺', title: '2. İç Kabin Görünümü', desc: 'Koltuk ve göğüs durumu' },
          { icon: '⏱️', title: '3. Kilometre (KM) Saati', desc: 'Güncel KM kadran resmi' },
          { icon: '📄', title: '4. Araç Ruhsat Resmi', desc: 'Model yılı ve teknik bilgi' }
        ];

        photoSlots.forEach((slot, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const sx = contentX + 36 + col * 420;
          const sy = phoneY + 275 + row * 260;

          drawRoundedRect(ctx, sx, sy, 400, 230, 20);
          ctx.fillStyle = '#0f172a';
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#10b981';
          ctx.stroke();

          ctx.font = '52px "Segoe UI Emoji", Arial';
          ctx.fillText(slot.icon, sx + 30, sy + 78);

          ctx.fillStyle = '#4ade80';
          ctx.font = '900 24px "Segoe UI", Inter, Arial, sans-serif';
          ctx.fillText('✓ Yüklendi', sx + 245, sy + 65);

          ctx.fillStyle = '#ffffff';
          ctx.font = '800 26px "Segoe UI", Inter, Arial, sans-serif';
          ctx.fillText(slot.title, sx + 30, sy + 145);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '600 21px "Segoe UI", Inter, Arial, sans-serif';
          ctx.fillText(slot.desc, sx + 30, sy + 188);
        });

        drawRoundedRect(ctx, contentX + 36, phoneY + 830, contentW - 72, 110, 22);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.fillStyle = '#052e16';
        ctx.font = '900 32px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💬 4 Resmi Gönder & Takas + Kredi Teklifi Al', CANVAS_W / 2, phoneY + 898);
        ctx.textAlign = 'left';

        ctx.font = '66px "Segoe UI Emoji", Arial';
        ctx.fillText('👆', CANVAS_W / 2 + 240, phoneY + 945);
        return;
      }
    }

    // ── SENARYO 3 (3-6 AY ÖDEMESİZ & 5 BANKA) ÖZEL SAHNELERİ ──────────────────
    if (scId === 'odemesiz') {
      if (stepIdx === 0 || stepIdx === 1) {
        drawRoundedRect(ctx, contentX, phoneY + 110, contentW, 960, 26);
        ctx.fillStyle = '#132038';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#f59e0b';
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = '900 28px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('🏛️ KUVEYT TÜRK KATILIM FİNANSMANI (1M - 5M TL)', contentX + 34, phoneY + 172);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 38px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('3 Ay ve 6 Ay Ödemesiz Dönem Tablosu', contentX + 34, phoneY + 230);

        const graceBoxes = [
          {
            title: '⏳ 3 AY ÖDEMESİZ DÖNEM SEÇENEĞİ',
            sub: 'Aracı Kasım’da alın, ilk taksitinizi Şubat 2027’de ödeyin!',
            detail: '1.000.000 TL - 5.000.000 TL Arası Kredi • %2,85 Kar Payı • 6-36 Ay Vade',
            color: '#4ade80',
            border: '#10b981'
          },
          {
            title: '🔥 6 AY ÖDEMESİZ DÖNEM SEÇENEĞİ',
            sub: 'Aracı şimdi işe koşun, tam 6 ay boyunca taksit ödemeyin!',
            detail: '1.000.000 TL - 5.000.000 TL Arası Kredi • %2,85 - %2,91 Oran • 12-36 Ay Vade',
            color: '#fbbf24',
            border: '#f59e0b'
          },
          {
            title: '📊 ÖRNEK: 2.000.000 TL KREDİ (3 AY ÖDEMESİZ)',
            sub: 'İlk 3 Ay: 0 TL Taksit  |  Sonraki Aylar: Esnek Taksit Planı',
            detail: 'Sürgüyü kaydırarak 1 Milyon TL ile 5 Milyon TL arası tüm tutarları canlı görün.',
            color: '#60a5fa',
            border: '#3b82f6'
          }
        ];

        graceBoxes.forEach((gb, idx) => {
          const gy = phoneY + 275 + idx * 245;
          drawRoundedRect(ctx, contentX + 34, gy, contentW - 68, 215, 20);
          ctx.fillStyle = '#0f172a';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = gb.border;
          ctx.stroke();

          ctx.fillStyle = gb.color;
          ctx.font = '900 30px "Segoe UI", Inter, Arial, sans-serif';
          ctx.fillText(gb.title, contentX + 60, gy + 58);

          ctx.fillStyle = '#ffffff';
          ctx.font = '800 25px "Segoe UI", Inter, Arial, sans-serif';
          ctx.fillText(gb.sub, contentX + 60, gy + 115);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '600 22px "Segoe UI", Inter, Arial, sans-serif';
          ctx.fillText(gb.detail, contentX + 60, gy + 170);
        });

        drawRoundedRect(ctx, contentX + 40, phoneY + 1110, contentW - 80, 110, 22);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 29px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👆 1 Milyondan 5 Milyona kadar ödemesiz taksitleri canlı görün!', CANVAS_W / 2, phoneY + 1176);
        ctx.textAlign = 'left';
        return;
      }
    }

    // ── SENARYO 5 (35C vs 70C KANTAR & ŞASİ) ÖZEL SAHNELERİ ──────────────────
    if (scId === 'kantar') {
      drawRoundedRect(ctx, contentX, phoneY + 110, contentW, 455, 24);
      ctx.fillStyle = '#132038';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = stepIdx === 0 ? '#3b82f6' : 'rgba(59, 130, 246, 0.35)';
      ctx.stroke();

      ctx.fillStyle = '#60a5fa';
      ctx.font = '900 25px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('🪪 SEÇENEK 1: B EHLİYET & TAKOGRAF MUAFİYETLİ', contentX + 32, phoneY + 162);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 36px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('IVECO Daily 35C16 — Çift Teker C-Şasi', contentX + 32, phoneY + 215);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 23px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('• 3750 ve 4100 Şasi Seçeneği  • SRC & Takograf Muafiyeti', contentX + 32, phoneY + 265);
      ctx.fillText('• Kampanyalı: 2.500.000 TL  |  Nakit İndirimi: -110.000 TL', contentX + 32, phoneY + 308);

      drawRoundedRect(ctx, contentX + 32, phoneY + 335, contentW - 64, 95, 16);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.fillStyle = '#4ade80';
      ctx.font = '900 34px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('Net Peşin: 2.390.000 TL  (KDV Kalkanı: ~398.333 TL)', contentX + 55, phoneY + 395);

      // Alt Kart: 70C16 / 70C18
      drawRoundedRect(ctx, contentX, phoneY + 595, contentW, 475, 24);
      ctx.fillStyle = '#132038';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = stepIdx >= 1 ? '#f59e0b' : 'rgba(245, 158, 11, 0.35)';
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = '900 25px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('⚖️ SEÇENEK 2: 4.8 TON NET YÜK & 10-12 EURO PALET', contentX + 32, phoneY + 648);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 36px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('IVECO Daily 70C16 & 70C18 (Manuel / Hi-Matic)', contentX + 32, phoneY + 702);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 23px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('• 3750, 4100 ve 4750 mm Şasi  • Resmi Kantarda 4.8 Ton Net Yük', contentX + 32, phoneY + 752);
      ctx.fillText('• Kampanyalı: 2.680.000 TL  |  Dev Nakit İndirimi: -260.000 TL!', contentX + 32, phoneY + 795);

      drawRoundedRect(ctx, contentX + 32, phoneY + 825, contentW - 64, 95, 16);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.font = '900 34px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('Net Peşin: 2.420.000 TL  (KDV Kalkanı: ~403.333 TL)', contentX + 55, phoneY + 885);

      drawRoundedRect(ctx, contentX + 40, phoneY + 1110, contentW - 80, 110, 22);
      ctx.fillStyle = '#2563eb';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 28px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👆 Tüm şasi boylarını ve Eurocargo / S-Way serisini canlı kıyaslayın!', CANVAS_W / 2, phoneY + 1176);
      ctx.textAlign = 'left';
      return;
    }

    // ── VARSAYILAN (SENARYO 1: GENEL KILAVUZ & SENARYO 4: KDV) SAHNELERİ ──────
    if (stepIdx === 0 && scId !== 'kdv') {
      const slideProgress = easeInOutQuad(Math.min(1, Math.max(0, (stepLocalT - 0.12) / 0.65)));
      const currentDownpayment = Math.round((750000 + slideProgress * 1100000) / 50000) * 50000;
      const vehicleCashPrice = 2390000;
      const remainingLoan = Math.max(0, vehicleCashPrice - currentDownpayment);
      const monthlyEst = Math.round(remainingLoan / 18);

      drawRoundedRect(ctx, contentX, phoneY + 110, contentW, 380, 26);
      ctx.fillStyle = '#132038';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#10b981';
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = '800 26px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('🔄 CANLI PEŞİNAT / TAKAS HESABI (TÜM ARAÇLARA UYGULANIR)', contentX + 30, phoneY + 162);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 23px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('Elinizdeki Peşinat veya Takas Aracınızın Değeri:', contentX + 30, phoneY + 215);

      drawRoundedRect(ctx, contentX + 540, phoneY + 178, 320, 58, 14);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.fill();
      ctx.fillStyle = '#4ade80';
      ctx.font = '900 34px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(`${currentDownpayment.toLocaleString('tr-TR')} TL`, contentX + 565, phoneY + 219);

      const trackX = contentX + 36;
      const trackY = phoneY + 285;
      const trackW = contentW - 72;
      drawRoundedRect(ctx, trackX, trackY, trackW, 24, 12);
      ctx.fillStyle = '#1e293b';
      ctx.fill();

      const activeTrackW = trackW * (0.2 + slideProgress * 0.65);
      drawRoundedRect(ctx, trackX, trackY, activeTrackW, 24, 12);
      ctx.fillStyle = '#10b981';
      ctx.fill();

      const thumbX = trackX + activeTrackW;
      const thumbY = trackY + 12;
      ctx.beginPath();
      ctx.arc(thumbX, thumbY, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#10b981';
      ctx.stroke();

      const presets = ['750.000 TL', '1.000.000 TL', '1.500.000 TL', '1.850.000 TL'];
      presets.forEach((p, idx) => {
        const px = trackX + idx * 205;
        const py = phoneY + 345;
        const isHot = (idx === 3 && slideProgress > 0.7) || (idx === 2 && slideProgress > 0.35 && slideProgress <= 0.7) || (idx === 0 && slideProgress <= 0.35);
        drawRoundedRect(ctx, px, py, 190, 52, 12);
        ctx.fillStyle = isHot ? '#10b981' : '#1e293b';
        ctx.fill();
        ctx.fillStyle = isHot ? '#052e16' : '#cbd5e1';
        ctx.font = '800 22px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(p, px + 28, py + 34);
      });

      const cardY = phoneY + 525;
      drawRoundedRect(ctx, contentX, cardY, contentW, 520, 26);
      ctx.fillStyle = '#162238';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
      ctx.stroke();

      ctx.fillStyle = '#60a5fa';
      ctx.font = '800 24px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('🪪 B EHLİYET • 🚫 TAKOGRAF MUAFİYETLİ • 🛞 ÇİFT TEKER', contentX + 30, cardY + 52);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 38px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('IVECO Daily 35C16 — 3750 Şasi', contentX + 30, cardY + 110);

      drawRoundedRect(ctx, contentX + 30, cardY + 145, 400, 130, 18);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 22px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('Nakit İndirimli Net Fiyat:', contentX + 52, cardY + 188);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 38px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('2.390.000 TL', contentX + 52, cardY + 245);

      drawRoundedRect(ctx, contentX + 455, cardY + 145, 410, 130, 18);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#10b981';
      ctx.stroke();
      ctx.fillStyle = '#6ee7b7';
      ctx.font = '700 22px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('Peşinat Sonrası Kalan Kredi:', contentX + 478, cardY + 188);
      ctx.fillStyle = '#4ade80';
      ctx.font = '900 38px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(`${remainingLoan.toLocaleString('tr-TR')} TL`, contentX + 478, cardY + 245);

      drawRoundedRect(ctx, contentX + 30, cardY + 305, contentW - 60, 88, 16);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.font = '800 26px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(
        `⚡ Seçtiğiniz ${currentDownpayment.toLocaleString('tr-TR')} TL Peşinat İle Aylık ~${monthlyEst.toLocaleString('tr-TR')} TL'den Başlayan Taksit!`,
        contentX + 52,
        cardY + 358
      );

      const pulse = 1 + Math.sin(stepLocalT * Math.PI * 6) * 0.15;
      ctx.beginPath();
      ctx.arc(thumbX, thumbY, 44 * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
      ctx.lineWidth = 5;
      ctx.stroke();

      ctx.font = '64px "Segoe UI Emoji", Arial';
      ctx.fillText('👆', thumbX - 24, thumbY + 62);

      drawRoundedRect(ctx, contentX + 80, phoneY + 1110, contentW - 160, 110, 22);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 30px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👆 Sürgüyü sağa-sola kaydırın, tüm liste anında güncellenir!', CANVAS_W / 2, phoneY + 1176);
      ctx.textAlign = 'left';
      return;
    }

    if (stepIdx === 1 && scId !== 'kdv') {
      drawRoundedRect(ctx, contentX, phoneY + 108, contentW, 130, 22);
      ctx.fillStyle = '#162238';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 32px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('🚛 Daily 35C16 & 70C18 — Resmi Kredi Tablosu', contentX + 30, phoneY + 162);

      drawRoundedRect(ctx, contentX + 590, phoneY + 132, 275, 76, 16);
      ctx.fillStyle = '#2563eb';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#93c5fd';
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 26px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('🏦 Kredi Planı Açık', contentX + 615, phoneY + 179);

      const banks = [
        {
          name: '🏦 Garanti / Akbank / İş Bankası / Yapı Kredi',
          badge: '🔥 1.000.000 TL • 6 AY • %0 FAİZ!',
          detail: 'Aylık: 166.667 TL  |  12 Ay %1,79  |  2M - 3M TL Ticari Kredi Seçeneği',
          border: '#10b981',
          bg: 'rgba(16, 185, 129, 0.14)',
          badgeColor: '#4ade80'
        },
        {
          name: '🏛️ Kuveyt Türk Katılım Finansmanı (1.000.000 TL - 5.000.000 TL)',
          badge: '⏳ 3 AY VE 6 AY ÖDEMESİZ DÖNEM SEÇENEĞİ!',
          detail: 'Şimdi alın, ilk taksiti 3 veya 6 ay sonra ödeyin! (%2,85 Kar Payı)',
          border: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.15)',
          badgeColor: '#fbbf24'
        },
        {
          name: '💳 2.000.000 TL & 3.000.000 TL Yüksek Limitli Paketler',
          badge: '6 - 12 - 18 - 24 - 36 AY ESNEK VADE',
          detail: '5 Bankanın tamamında şubeye gitmeden anında onaylı ticari finansman',
          border: '#3b82f6',
          bg: 'rgba(59, 130, 246, 0.14)',
          badgeColor: '#60a5fa'
        }
      ];

      banks.forEach((b, idx) => {
        const enterDelay = idx * 0.12;
        const cardAnim = easeOutCubic(Math.min(1, Math.max(0, (stepLocalT - enterDelay) * 3.5)));
        const cy = phoneY + 270 + idx * 265 + (1 - cardAnim) * 40;

        ctx.save();
        ctx.globalAlpha = cardAnim;
        drawRoundedRect(ctx, contentX, cy, contentW, 235, 22);
        ctx.fillStyle = b.bg;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = b.border;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 27px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(b.name, contentX + 30, cy + 56);

        drawRoundedRect(ctx, contentX + 30, cy + 80, contentW - 60, 64, 14);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.fillStyle = b.badgeColor;
        ctx.font = '900 28px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(b.badge, contentX + 50, cy + 122);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '600 23px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(b.detail, contentX + 30, cy + 195);
        ctx.restore();
      });

      drawRoundedRect(ctx, contentX + 40, phoneY + 1110, contentW - 80, 110, 22);
      ctx.fillStyle = '#2563eb';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 29px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("👆 Araç kartındaki 'Kredi Planı' tuşuyla tüm taksitleri açın!", CANVAS_W / 2, phoneY + 1176);
      ctx.textAlign = 'left';
      return;
    }

    // KDV ve Muhasebe Sahnesi
    drawRoundedRect(ctx, contentX, phoneY + 115, contentW, 940, 28);
    ctx.fillStyle = '#132038';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 25px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('⚖️ 4.8 TON NET YÜK • 10-12 PALET • AĞIR ŞASİ', contentX + 34, phoneY + 172);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 38px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('IVECO Daily 70C16 — 4750 Şasi', contentX + 34, phoneY + 228);

    drawRoundedRect(ctx, contentX + 34, phoneY + 265, contentW - 68, 150, 20);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 24px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('Kredili Kampanya Fiyatı: 2.680.000 TL   |   Nakit İndirimi: -260.000 TL', contentX + 58, phoneY + 318);

    ctx.fillStyle = '#4ade80';
    ctx.font = '900 40px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('Net Peşin Fiyat: 2.420.000 TL (KDV Dahil)', contentX + 58, phoneY + 382);

    const pulseScale = 1 + Math.sin(stepLocalT * Math.PI * 4) * 0.015;
    ctx.save();
    ctx.translate(CANVAS_W / 2, phoneY + 535);
    ctx.scale(pulseScale, pulseScale);
    ctx.translate(-CANVAS_W / 2, -(phoneY + 535));

    drawRoundedRect(ctx, contentX + 34, phoneY + 450, contentW - 68, 175, 22);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#10b981';
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.font = '900 28px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('🧾 İNDİRİLEBİLİR %20 KDV VERGİ KALKANI AVANTAJI:', contentX + 60, phoneY + 505);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 42px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('~403.333 TL Doğrudan Vergiden Düşülür!', contentX + 60, phoneY + 565);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '600 22px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('Yıl sonu vergi matrahınızdan düşüp filonuza sıfır araç kazandırın.', contentX + 60, phoneY + 605);
    ctx.restore();

    drawRoundedRect(ctx, contentX + 34, phoneY + 665, contentW - 68, 105, 20);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 31px "Segoe UI", Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📤 Araç & KDV Özetini Ortağa / Muhasebeye Gönder', CANVAS_W / 2, phoneY + 728);

    drawRoundedRect(ctx, contentX + 34, phoneY + 800, 405, 95, 18);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#60a5fa';
    ctx.stroke();
    ctx.fillStyle = '#93c5fd';
    ctx.font = '800 25px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('🔄 4 Resimle Takas Hesapla', contentX + 236, phoneY + 858);

    drawRoundedRect(ctx, contentX + 465, phoneY + 800, 405, 95, 18);
    ctx.fillStyle = '#16a34a';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 25px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('💬 WhatsApp Proforma İste', contentX + 667, phoneY + 858);
    ctx.textAlign = 'left';

    ctx.font = '68px "Segoe UI Emoji", Arial';
    ctx.fillText('👆', CANVAS_W / 2 + 220, phoneY + 775);

    drawRoundedRect(ctx, contentX + 40, phoneY + 1110, contentW - 80, 110, 22);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    ctx.fillStyle = '#052e16';
    ctx.font = '900 29px "Segoe UI", Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👆 Tek tuşla hesap özetini ortağınıza veya muhasebenize atın!', CANVAS_W / 2, phoneY + 1176);
    ctx.textAlign = 'left';
  };

  // Ana Canvas Çizim Motoru
  const renderFrame = (ctx, tSec, activeScenario = currentScenario) => {
    const clampedT = Math.max(0, Math.min(DURATION_SEC - 0.001, tSec));
    const stepIdx = Math.min(3, Math.floor(clampedT / STEP_DURATION_SEC));
    const stepLocalT = (clampedT % STEP_DURATION_SEC) / STEP_DURATION_SEC;
    const stepMeta = activeScenario.steps[stepIdx] || activeScenario.steps[0];

    // 1. Arka Plan
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    bgGrad.addColorStop(0, '#060b16');
    bgGrad.addColorStop(0.5, '#0b1528');
    bgGrad.addColorStop(1, '#070d19');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Dekoratif Işık Halesi
    const glowGrad = ctx.createRadialGradient(CANVAS_W / 2, 340, 40, CANVAS_W / 2, 340, 560);
    glowGrad.addColorStop(0, stepMeta.accentBg);
    glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, CANVAS_W, 900);

    // 2. Üst WhatsApp Durum İlerleme Çubukları (4 Segment)
    const barGap = 14;
    const totalBarsW = CANVAS_W - 100;
    const singleBarW = (totalBarsW - barGap * 3) / 4;
    for (let i = 0; i < 4; i++) {
      const bx = 50 + i * (singleBarW + barGap);
      const by = 42;
      drawRoundedRect(ctx, bx, by, singleBarW, 10, 5);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.fill();

      let fillRatio = 0;
      if (i < stepIdx) fillRatio = 1;
      else if (i === stepIdx) fillRatio = stepLocalT;

      if (fillRatio > 0) {
        drawRoundedRect(ctx, bx, by, singleBarW * fillRatio, 10, 5);
        ctx.fillStyle = stepMeta.accent;
        ctx.fill();
      }
    }

    // 3. Üst Kılavuz Başlık Alanı
    const headerEnter = easeOutCubic(Math.min(1, stepLocalT * 4.5));
    ctx.save();
    ctx.translate(0, (1 - headerEnter) * 28);
    ctx.globalAlpha = headerEnter;

    drawRoundedRect(ctx, 60, 82, 580, 54, 27);
    ctx.fillStyle = stepMeta.accentBg;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = stepMeta.accent;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 23px "Segoe UI", Inter, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`📲 ${stepMeta.badge}`, 88, 117);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 41px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(stepMeta.title, 60, 198);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 25px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(stepMeta.subtitle, 60, 248);
    ctx.restore();

    // 4. ORTA BÖLÜM: AKILLI TELEFON EKRANI ÇERÇEVESİ
    const phoneX = 60;
    const phoneY = 290;
    const phoneW = CANVAS_W - 120;
    const phoneH = 1360;

    drawRoundedRect(ctx, phoneX - 6, phoneY - 6, phoneW + 12, phoneH + 12, 48);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.stroke();

    drawRoundedRect(ctx, phoneX, phoneY, phoneW, phoneH, 42);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Telefon Üst Adres Çubuğu
    drawRoundedRect(ctx, phoneX + 24, phoneY + 22, phoneW - 48, 62, 18);
    ctx.fillStyle = '#090f1d';
    ctx.fill();
    ctx.fillStyle = '#34d399';
    ctx.font = '700 22px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(activeScenario.urlBar, phoneX + 46, phoneY + 61);

    // Senaryo içeriğini çiz
    renderPhoneScreenContent(ctx, activeScenario.id, stepIdx, stepLocalT, phoneX, phoneY, phoneW);

    // 5. En Alt Kurumsal İmza Bandı
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 24px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(
      'IVECO ERC SAMSUN OTOMOTİV  •  AŞAĞIDAKİ LİNKE TIKLAYIP CANLI HESAPLAYIN 👇',
      CANVAS_W / 2,
      CANVAS_H - 95
    );
    ctx.textAlign = 'left';
  };

  // ── WEB AUDIO API: GERÇEK TÜRKÇE ERKEK SPİKER (AHMET NEURAL) & FON MÜZİĞİ ──
  const getAudioContext = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  };

  // MP3 başındaki ve sonundaki boş sessizlikleri temizle (böylece hız artırmaya gerek kalmaz, 1.0x doğal erkek sesi korunur)
  const trimAudioBufferSilence = (ctx, buffer) => {
    try {
      const raw = buffer.getChannelData(0);
      const len = raw.length;
      const threshold = 0.008;
      let startSample = 0;
      let endSample = len - 1;

      while (startSample < len && Math.abs(raw[startSample]) < threshold) {
        startSample++;
      }
      while (endSample > startSample && Math.abs(raw[endSample]) < threshold) {
        endSample--;
      }

      const padSamples = Math.floor(buffer.sampleRate * 0.04);
      startSample = Math.max(0, startSample - padSamples);
      endSample = Math.min(len - 1, endSample + padSamples);

      const trimmedLen = endSample - startSample + 1;
      if (trimmedLen <= 0 || trimmedLen >= len * 0.96) return buffer;

      const trimmed = ctx.createBuffer(buffer.numberOfChannels, trimmedLen, buffer.sampleRate);
      for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const srcData = buffer.getChannelData(ch);
        const dstData = trimmed.getChannelData(ch);
        dstData.set(srcData.subarray(startSample, endSample + 1));
      }
      return trimmed;
    } catch (_) {
      return buffer;
    }
  };

  const loadStepAudioBuffer = async (audioUrl) => {
    if (!audioUrl) return null;
    const cacheKey = `${audioUrl}?v=ahmet_male_v3`;
    if (audioBufferCacheRef.current[cacheKey]) {
      return audioBufferCacheRef.current[cacheKey];
    }
    try {
      const ctx = getAudioContext();
      const res = await fetch(cacheKey, { cache: 'reload' });
      if (!res.ok) return null;
      const arrBuf = await res.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrBuf);
      const trimmed = trimAudioBufferSilence(ctx, decoded);
      audioBufferCacheRef.current[cacheKey] = trimmed;
      return trimmed;
    } catch (err) {
      console.warn('Voiceover yüklenemedi:', audioUrl, err);
      return null;
    }
  };

  // Seçili senaryonun 4 sahne sesini önceden belleğe yükle
  useEffect(() => {
    if (!isOpen) return;
    currentScenario.steps.forEach((st) => {
      if (st.audioUrl) loadStepAudioBuffer(st.audioUrl);
    });
  }, [isOpen, scenarioIdx]);

  // Modal kapanınca aktif sesleri durdur
  useEffect(() => {
    if (!isOpen && activePreviewSourceRef.current) {
      try {
        activePreviewSourceRef.current.stop();
      } catch (_) {}
      activePreviewSourceRef.current = null;
      setLiveAudioPreview(false);
    }
  }, [isOpen]);

  // Tek bir sahnenin gerçek erkek spiker sesini (tr-TR-AhmetNeural) 1.0x doğal hız ve tok bariton tonla çal
  const scheduleVoiceClip = (ctx, destination, buffer, startAtTime, mode = voiceMode) => {
    if (!buffer || mode === 'muted') return null;
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // ASLA playbackRate > 1.0 yapmıyoruz! 1.00x doğal hızda çalar ki ses kesinlikle incelmesin.
    source.playbackRate.setValueAtTime(1.0, startAtTime);

    if (mode === 'male_baritone') {
      // Ekstra tok radyo spikeri isteyenler için hafif derin bariton (-95 cent)
      source.detune.setValueAtTime(-95, startAtTime);
    } else {
      // Doğal Ahmet Neural Erkek Sesi (0 detune)
      source.detune.setValueAtTime(0, startAtTime);
    }

    // Stüdyo EQ filtresi (tok göğüs sesi + net diksiyon)
    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.setValueAtTime(145, startAtTime);
    bassFilter.gain.setValueAtTime(mode === 'male_baritone' ? 5.0 : 3.0, startAtTime);

    const presenceFilter = ctx.createBiquadFilter();
    presenceFilter.type = 'peaking';
    presenceFilter.frequency.setValueAtTime(2800, startAtTime);
    presenceFilter.Q.setValueAtTime(1.0, startAtTime);
    presenceFilter.gain.setValueAtTime(2.2, startAtTime);

    const voiceGain = ctx.createGain();
    voiceGain.gain.setValueAtTime(1.1, startAtTime);

    source.connect(bassFilter);
    bassFilter.connect(presenceFilter);
    presenceFilter.connect(voiceGain);
    voiceGain.connect(destination);

    source.start(startAtTime);
    return source;
  };

  // Sahne geçişlerinde hafif modern kurumsal chime + arka plan ritmi
  const scheduleTransitionChime = (ctx, destination, startAtTime, stepIdx = 0) => {
    if (!bgMusicEnabled) return;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const f1 = freqs[stepIdx % freqs.length];
    const f2 = f1 * 1.25;

    [f1, f2].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startAtTime + i * 0.055);

      gain.gain.setValueAtTime(0.0001, startAtTime + i * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.04, startAtTime + i * 0.055 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAtTime + i * 0.055 + 0.42);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(startAtTime + i * 0.055);
      osc.stop(startAtTime + i * 0.055 + 0.45);
    });
  };

  const scheduleCorporateBackgroundBed = (ctx, destination, startAtTime, totalSec = DURATION_SEC) => {
    if (!bgMusicEnabled) return [];
    const nodes = [];
    // 4 sahne için sıcak kurumsal akor yürüyüşü (Am9 -> Fmaj7 -> Cmaj7 -> G6)
    const chords = [
      [110.0, 164.81, 220.0, 261.63],
      [87.31, 130.81, 174.61, 220.0],
      [130.81, 196.0, 246.94, 329.63],
      [98.0, 146.83, 196.0, 246.94]
    ];

    for (let s = 0; s < 4; s++) {
      const sceneStart = startAtTime + s * STEP_DURATION_SEC;
      scheduleTransitionChime(ctx, destination, sceneStart + 0.02, s);

      const chord = chords[s];
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, sceneStart);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(520, sceneStart);

        gain.gain.setValueAtTime(0.0001, sceneStart);
        gain.gain.linearRampToValueAtTime(0.015, sceneStart + 0.35);
        gain.gain.setValueAtTime(0.013, sceneStart + STEP_DURATION_SEC - 0.5);
        gain.gain.linearRampToValueAtTime(0.0001, sceneStart + STEP_DURATION_SEC - 0.02);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        osc.start(sceneStart);
        osc.stop(sceneStart + STEP_DURATION_SEC);
        nodes.push(osc);
      });

      // Hafif kurumsal tempo nabzı
      for (let beat = 0; beat < Math.floor(STEP_DURATION_SEC); beat++) {
        const bTime = sceneStart + beat * 1.0;
        if (bTime >= startAtTime + totalSec) break;
        const pulseOsc = ctx.createOscillator();
        const pulseGain = ctx.createGain();
        pulseOsc.type = 'sine';
        pulseOsc.frequency.setValueAtTime(110, bTime);
        pulseOsc.frequency.exponentialRampToValueAtTime(52, bTime + 0.14);

        pulseGain.gain.setValueAtTime(0.0001, bTime);
        pulseGain.gain.linearRampToValueAtTime(0.03, bTime + 0.015);
        pulseGain.gain.exponentialRampToValueAtTime(0.0001, bTime + 0.18);

        pulseOsc.connect(pulseGain);
        pulseGain.connect(destination);
        pulseOsc.start(bTime);
        pulseOsc.stop(bTime + 0.2);
        nodes.push(pulseOsc);
      }
    }
    return nodes;
  };

  // Tek bir sahneyi canlı önizlemede seslendir
  const playSingleStepPreview = async (stepIdx, overrideMode = voiceMode) => {
    try {
      const ctx = getAudioContext();
      if (activePreviewSourceRef.current) {
        try {
          activePreviewSourceRef.current.stop();
        } catch (_) {}
        activePreviewSourceRef.current = null;
      }
      const st = currentScenario.steps[stepIdx];
      if (!st) return;
      scheduleTransitionChime(ctx, ctx.destination, ctx.currentTime + 0.01, stepIdx);
      if (overrideMode !== 'muted' && st.audioUrl) {
        const buf = await loadStepAudioBuffer(st.audioUrl);
        if (buf) {
          activePreviewSourceRef.current = scheduleVoiceClip(ctx, ctx.destination, buf, ctx.currentTime + 0.06, overrideMode);
        }
      }
    } catch (e) {
      console.warn('Önizleme sesi çalınamadı:', e);
    }
  };

  // Canlı Önizleme Döngüsü
  useEffect(() => {
    if (!isOpen || isRecording) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (!isPlaying) {
      renderFrame(ctx, currentTime, currentScenario);
      return;
    }

    startTimeRef.current = performance.now() - currentTime * 1000;

    const tick = (now) => {
      const elapsedSec = ((now - startTimeRef.current) / 1000) % DURATION_SEC;
      const stepNow = Math.min(3, Math.floor(elapsedSec / STEP_DURATION_SEC));
      if (liveAudioPreview && stepNow !== lastSpokenStepRef.current) {
        lastSpokenStepRef.current = stepNow;
        playSingleStepPreview(stepNow);
      }
      setCurrentTime(elapsedSec);
      renderFrame(ctx, elapsedSec, currentScenario);
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, isPlaying, isRecording, scenarioIdx, liveAudioPreview, voiceMode, bgMusicEnabled]);

  // Tek Tuşla Yapay Zeka Erkek Spiker Seslendirmeli Video Kaydet & İndir
  const handleDownloadVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isRecording) return;

    if (typeof canvas.captureStream !== 'function' || typeof window.MediaRecorder === 'undefined') {
      toast.error('Tarayıcınız doğrudan video kaydını desteklemiyor, 4 Adımlı Görsel İndir butonunu kullanabilirsiniz.');
      return;
    }

    if (activePreviewSourceRef.current) {
      try {
        activePreviewSourceRef.current.stop();
      } catch (_) {}
      activePreviewSourceRef.current = null;
    }

    setIsPlaying(false);
    setIsRecording(true);
    setRecordProgress(0);

    const ctx = canvas.getContext('2d');
    const videoStream = canvas.captureStream(FPS);

    // Web Audio API üzerinden Ahmet Neural Erkek Spiker + Kurumsal Fon Müziği kanalını hazırla
    let combinedStream = videoStream;
    let scheduledNodes = [];
    const includeAudio = voiceMode !== 'muted' || bgMusicEnabled;

    if (includeAudio) {
      try {
        const audioCtx = getAudioContext();
        const audioDest = audioCtx.createMediaStreamDestination();

        // Kayıt sırasında kullanıcının da duyması için monitör çıkışı
        const monitorGain = audioCtx.createGain();
        monitorGain.gain.value = 0.55;
        monitorGain.connect(audioCtx.destination);

        const masterMix = audioCtx.createGain();
        masterMix.gain.value = 1.0;
        masterMix.connect(audioDest);
        masterMix.connect(monitorGain);

        // 4 sahnenin ses dosyalarını belleğe hazırla
        const stepBuffers = await Promise.all(
          currentScenario.steps.map(st => (voiceMode !== 'muted' ? loadStepAudioBuffer(st.audioUrl) : Promise.resolve(null)))
        );

        const baseAudioTime = audioCtx.currentTime + 0.08;
        if (bgMusicEnabled) {
          const bgNodes = scheduleCorporateBackgroundBed(audioCtx, masterMix, baseAudioTime, DURATION_SEC);
          scheduledNodes.push(...bgNodes);
        }

        stepBuffers.forEach((buf, idx) => {
          if (buf && voiceMode !== 'muted') {
            const clipStart = baseAudioTime + idx * STEP_DURATION_SEC + 0.08;
            const srcNode = scheduleVoiceClip(audioCtx, masterMix, buf, clipStart, voiceMode);
            if (srcNode) scheduledNodes.push(srcNode);
          }
        });

        const audioTracks = audioDest.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          combinedStream = new MediaStream([...videoStream.getVideoTracks(), ...audioTracks]);
        }
      } catch (audioErr) {
        console.warn('Ses kanalı birleştirilemedi, sadece görüntü kaydediliyor:', audioErr);
      }
    }

    const mimeTypes = [
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4;codecs=avc1',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];
    const selectedMime = mimeTypes.find(m => window.MediaRecorder.isTypeSupported(m)) || 'video/webm';
    const ext = selectedMime.includes('mp4') ? 'mp4' : 'webm';

    const chunks = [];
    const recorder = new window.MediaRecorder(combinedStream, {
      mimeType: selectedMime,
      videoBitsPerSecond: 6000000
    });

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      scheduledNodes.forEach(n => {
        try {
          n.stop();
        } catch (_) {}
      });
      const blob = new Blob(chunks, { type: selectedMime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const audioTag = voiceMode === 'muted' ? 'Sessiz' : 'Erkek_Spiker_Sesli';
      a.download = `IVECO_WA_Durum_${currentScenario.id}_${audioTag}_${new Date().toISOString().slice(0, 10)}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsRecording(false);
      setIsPlaying(true);
      toast.success(`🎬 "${currentScenario.shortTitle}" (${voiceMode === 'muted' ? 'Sessiz' : 'Tok Erkek Spiker Sesli'}) videosu indirildi!`);
    };

    recorder.start();

    // Gerçek zamanlı saat ile görüntü ve sesi milisaniyesi milisaniyesine senkronize kaydet
    const startWallMs = performance.now();
    while (true) {
      const elapsedSec = (performance.now() - startWallMs) / 1000;
      if (elapsedSec >= DURATION_SEC) break;
      renderFrame(ctx, elapsedSec, currentScenario);
      setCurrentTime(elapsedSec);
      setRecordProgress(Math.min(99, Math.round((elapsedSec / DURATION_SEC) * 100)));
      await new Promise(r => setTimeout(r, 1000 / FPS));
    }

    renderFrame(ctx, DURATION_SEC - 0.01, currentScenario);
    setRecordProgress(100);
    recorder.stop();
  };

  // Seçili Senaryonun 4 Adımını Görsel Olarak İndir
  const handleDownload4Slides = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const sampleTimes = [0, 1, 2, 3].map(i => i * STEP_DURATION_SEC + 2.2);

    sampleTimes.forEach((t, idx) => {
      renderFrame(ctx, t, currentScenario);
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `IVECO_WA_${currentScenario.id}_Adim_${idx + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });

    renderFrame(ctx, currentTime, currentScenario);
    toast.success(`📸 "${currentScenario.shortTitle}" için 4 HD görsel indirildi!`);
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(currentScenario.caption);
    setCopiedCaption(true);
    toast.success('📋 Seçili senaryonun WhatsApp Durum açıklaması ve özel takip linki kopyalandı!');
    setTimeout(() => setCopiedCaption(false), 3000);
  };

  if (!isOpen) return null;

  const activeStepIdx = Math.min(3, Math.floor(currentTime / STEP_DURATION_SEC));

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 10, 22, 0.86)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        maxWidth: '1120px',
        width: '100%',
        maxHeight: '95vh',
        overflowY: 'auto',
        padding: '20px 24px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.65)'
      }}>
        {/* Üst Başlık */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              color: '#fff',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FiVideo size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800 }}>
                🎬 5 Akılcı Senaryolu & Tok Erkek Spiker Sesli WhatsApp Durum Stüdyosu
              </h2>
              <p style={{ margin: 0, fontSize: '0.79rem', color: 'var(--text-secondary)' }}>
                Gerçek Türkçe Erkek Spiker Sesi (Microsoft Ahmet Neural), hafif kurumsal fon müziği ve Android uyumlu takip linki
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              borderRadius: '8px',
              padding: '7px',
              cursor: 'pointer'
            }}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* ── 5 AKILCI SENARYO SEÇİCİ SEKMELER ─────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))',
          gap: '8px',
          marginBottom: '16px',
          background: 'var(--bg-secondary)',
          padding: '10px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          {VIDEO_SCENARIOS.map((sc, idx) => {
            const isSelected = scenarioIdx === idx;
            return (
              <button
                key={sc.id}
                type="button"
                disabled={isRecording}
                onClick={() => {
                  setScenarioIdx(idx);
                  setCurrentTime(0);
                  lastSpokenStepRef.current = -1;
                  setIsPlaying(true);
                  setCopiedCaption(false);
                }}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(37, 99, 235, 0.22) 100%)'
                    : 'var(--bg-card)',
                  border: isSelected ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                  borderRadius: '9px',
                  padding: '9px 11px',
                  textAlign: 'left',
                  cursor: isRecording ? 'wait' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '0.69rem', fontWeight: 800, color: isSelected ? '#34d399' : 'var(--text-muted)', marginBottom: '2px' }}>
                  {sc.dayLabel}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                  {sc.shortTitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* İçerik Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(290px, 330px) 1fr',
          gap: '22px',
          alignItems: 'start'
        }}>
          {/* SOL: Canlı 9:16 Video Önizleme */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              position: 'relative',
              width: '305px',
              height: '542px',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '2px solid rgba(16, 185, 129, 0.45)',
              boxShadow: '0 14px 35px rgba(0,0,0,0.45)',
              background: '#060b16'
            }}>
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', marginTop: '10px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setIsPlaying(p => !p)}
                disabled={isRecording}
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {isPlaying ? <FiPause size={13} /> : <FiPlay size={13} />}
                {isPlaying ? 'Duraklat' : 'Oynat'}
              </button>

              <button
                type="button"
                disabled={isRecording}
                onClick={() => {
                  const nextState = !liveAudioPreview;
                  setLiveAudioPreview(nextState);
                  if (nextState) {
                    if (voiceMode === 'muted') setVoiceMode('male_ahmet');
                    lastSpokenStepRef.current = -1;
                    setCurrentTime(0);
                    startTimeRef.current = performance.now();
                    setIsPlaying(true);
                    toast.success('🔊 Sesli önizleme açıldı! Tok erkek spiker (Ahmet AI) konuşuyor.');
                  } else if (activePreviewSourceRef.current) {
                    try {
                      activePreviewSourceRef.current.stop();
                    } catch (_) {}
                    activePreviewSourceRef.current = null;
                  }
                }}
                style={{
                  background: liveAudioPreview ? 'rgba(16, 185, 129, 0.22)' : 'var(--bg-secondary)',
                  color: liveAudioPreview ? '#34d399' : 'var(--text-primary)',
                  border: liveAudioPreview ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {liveAudioPreview ? <FiVolume2 size={14} /> : <FiVolumeX size={14} />}
                {liveAudioPreview ? '🔊 Ses Açık' : '🔈 Sesli Dinle'}
              </button>

              {[0, 1, 2, 3].map(idx => (
                <button
                  key={idx}
                  type="button"
                  disabled={isRecording}
                  onClick={() => {
                    setIsPlaying(false);
                    const targetT = idx * STEP_DURATION_SEC + 1.8;
                    setCurrentTime(targetT);
                    if (canvasRef.current) {
                      renderFrame(canvasRef.current.getContext('2d'), targetT, currentScenario);
                    }
                    playSingleStepPreview(idx);
                  }}
                  style={{
                    background: activeStepIdx === idx ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                    color: activeStepIdx === idx ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '6px 8px',
                    fontSize: '0.73rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  S{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* SAĞ: Yapay Zeka Ses Ayarları, Senaryo Akışı, Video İndirme & WhatsApp Alt Metni */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 🎙️ YAPAY ZEKA SESLENDİRME & FON MÜZİĞİ SEÇİCİ */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '12px',
              padding: '11px 14px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FiVolume2 size={15} />
                  Erkek Spiker Tonu:
                </span>

                {[
                  { id: 'male_ahmet', label: '👨 Doğal Erkek Spiker (Ahmet AI)' },
                  { id: 'male_baritone', label: '🎙️ Ekstra Tok Radyo Spikeri (Bariton)' },
                  { id: 'muted', label: '🔇 Spiker Kapalı' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isRecording}
                    onClick={() => {
                      setVoiceMode(opt.id);
                      if (opt.id !== 'muted') {
                        setTimeout(() => playSingleStepPreview(activeStepIdx, opt.id), 40);
                      }
                    }}
                    style={{
                      background: voiceMode === opt.id ? '#10b981' : 'var(--bg-card)',
                      color: voiceMode === opt.id ? '#052e16' : 'var(--text-secondary)',
                      border: voiceMode === opt.id ? '1px solid #34d399' : '1px solid var(--border-color)',
                      borderRadius: '7px',
                      padding: '5px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={isRecording}
                onClick={() => setBgMusicEnabled(b => !b)}
                style={{
                  background: bgMusicEnabled ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-card)',
                  color: bgMusicEnabled ? '#60a5fa' : 'var(--text-muted)',
                  border: bgMusicEnabled ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid var(--border-color)',
                  borderRadius: '7px',
                  padding: '5px 10px',
                  fontSize: '0.73rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <FiMusic size={13} />
                {bgMusicEnabled ? '🎵 Kurumsal Fon & Geçiş Sesi: Açık' : '🎵 Fon Sesi: Kapalı'}
              </button>
            </div>

            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '12px 15px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '0.83rem', fontWeight: 800, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiLayers style={{ color: '#10b981' }} />
                  {currentScenario.shortTitle} — 4 Sahne & Spiker Metni (Dinlemek İçin Sahneye Tıklayın):
                </div>
                <span style={{ fontSize: '0.71rem', color: '#34d399', fontWeight: 700 }}>
                  Takip: {currentScenario.refCode}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {currentScenario.steps.map((st, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setIsPlaying(false);
                      const targetT = idx * STEP_DURATION_SEC + 1.8;
                      setCurrentTime(targetT);
                      if (canvasRef.current) {
                        renderFrame(canvasRef.current.getContext('2d'), targetT, currentScenario);
                      }
                      playSingleStepPreview(idx);
                    }}
                    style={{
                      background: activeStepIdx === idx ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
                      border: activeStepIdx === idx ? `1px solid ${st.accent}` : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '7px 11px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: st.accent }}>{st.badge}</span>
                      <span style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 700 }}>🔊 Dinle</span>
                    </div>
                    <div style={{ fontSize: '0.81rem', fontWeight: 700, color: 'var(--text-heading)' }}>{st.title}</div>
                    <div style={{ fontSize: '0.74rem', color: '#a7f3d0', fontStyle: 'italic', marginTop: '2px' }}>
                      🎙️ "{st.voiceover}"
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* İndirme Butonları */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleDownloadVideo}
                disabled={isRecording}
                style={{
                  flex: 1,
                  minWidth: '250px',
                  background: isRecording
                    ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '13px 18px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: isRecording ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)'
                }}
              >
                <FiDownload size={18} />
                {isRecording
                  ? `⏳ Sesli Video Kaydediliyor (%${recordProgress})...`
                  : `🎬 "${currentScenario.shortTitle}" (${voiceMode === 'muted' ? 'Sessiz' : 'AI Sesli'}) İndir`}
              </button>

              <button
                type="button"
                onClick={handleDownload4Slides}
                disabled={isRecording}
                style={{
                  background: 'var(--bg-secondary)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  borderRadius: '10px',
                  padding: '13px 15px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px'
                }}
              >
                <FiImage size={16} />
                📸 4 Sahneyi Resim İndir (PNG)
              </button>
            </div>

            {/* Seçili Senaryonun WhatsApp Durum Alt Açıklaması (Android Uyumlu Kısa Format) */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '12px',
              padding: '13px 16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.79rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiSmartphone size={14} />
                    Android & iPhone Uyumlu Kısa Durum Metni + Link:
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    ✓ {currentScenario.caption.length} / 180 Karakter — Android'de "...devamını oku" çıkmaz ve önizleme kartı kaybolmaz
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    style={{
                      background: copiedCaption ? '#10b981' : 'var(--accent-blue)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    {copiedCaption ? <FiCheck size={13} /> : <FiCopy size={13} />}
                    {copiedCaption ? 'Kopyalandı!' : '📋 Kısa Metin + Link Kopyala'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(currentScenario.onlyLink);
                      toast.success('🔗 Sadece takip linki kopyalandı! (WhatsApp Bağlantı Etiketi için hazır)');
                    }}
                    style={{
                      background: 'var(--bg-card)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.45)',
                      borderRadius: '6px',
                      padding: '6px 11px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <FiCopy size={12} />
                    🔗 Sadece Linki Kopyala
                  </button>
                </div>
              </div>
              <pre style={{
                margin: 0,
                fontSize: '0.79rem',
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                background: 'var(--bg-card)',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                lineHeight: 1.45
              }}>
                {currentScenario.caption}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
