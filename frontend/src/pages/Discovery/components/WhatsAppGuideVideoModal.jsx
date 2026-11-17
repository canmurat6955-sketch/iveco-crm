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
    dayLabel: '1. Senaryo • Yeni Sade Ekran Kılavuzu',
    shortTitle: '📲 10 Sn Yeni Ekran Kılavuzu',
    refCode: 'wa_durum_kilavuz',
    urlBar: '🔒 iveco-fiyat-listesi.vercel.app — 2026 Fiyat & Taksit Ekranı',
    onlyLink: 'https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_kilavuz',
    caption:
      `📲 Araç grubunu seçip aynı kart içinde 2026 IVECO peşin fiyat ve taksitinizi hesaplayın 👇\n\n` +
      `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_kilavuz`,
    steps: [
      {
        badge: 'ADIM 1 / 4 • 6 ARAÇ GRUBUNDAN BİRİNE DOKUNUN',
        title: '1. İlgilendiğiniz Araç Grubunu Seçin & Fiyatı Görün',
        subtitle: '3.5T Kamyonet, Panelvan, 7T Kamyon, Eurocargo, S-Way Çekici veya T-Way Mikser/Hafriyat.',
        voiceover: 'Sürgüyü kaydırıp peşinat veya takas tutarınızı kolayca seçin.',
        audioUrl: '/audio/wa-scenarios/kilavuz_1.mp3',
        accent: '#10b981',
        accentBg: 'rgba(16, 185, 129, 0.22)'
      },
      {
        badge: 'ADIM 2 / 4 • KART İÇİ "TAKSİT & TAKAS HESAPLA"',
        title: "2. '💳 Taksit & Takas Hesapla' Tuşuna Dokunun",
        subtitle: 'Başka sayfaya zıplamadan, aynı kartın içinde peşinatınızı ve 12-24-36 ay vadeyi seçin.',
        voiceover: 'Beş bankanın sıfır faizli ve ödemesiz taksitlerini anında karşılaştırın.',
        audioUrl: '/audio/wa-scenarios/kilavuz_2.mp3',
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.22)'
      },
      {
        badge: 'ADIM 3 / 4 • %20 KDV VERGİ İNDİRİMİ & 2 NET BUTON',
        title: "3. %20 KDV İndirimini Görün & WhatsApp'tan Sorun",
        subtitle: 'Her araçta sadece 2 net tuş var: Taksit & Takas Hesapla veya WhatsApp’tan Can Murat’a Sor!',
        voiceover: 'Yüzde yirmi KDV vergi avantajınızı görüp muhasebenize gönderin.',
        audioUrl: '/audio/wa-scenarios/kilavuz_3.mp3',
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.22)'
      },
      {
        badge: 'ADIM 4 / 4 • ŞİMDİ KENDİ TELEFONUNUZDA DENEYİN',
        title: 'Aşağıdaki Linke Dokunun, Hesabınızı Canlı Yapın!',
        subtitle: 'Karmaşık menü yok, form yok! Linke tıklayıp 10 saniyede aracınızı ve taksitinizi görün.',
        voiceover: 'Aşağıdaki linke dokunun, kendi hesabınızı on saniyede canlı yapın!',
        audioUrl: '/audio/wa-scenarios/kilavuz_4.mp3',
        accent: '#22c55e',
        accentBg: 'rgba(34, 197, 94, 0.25)'
      }
    ]
  },
  {
    id: 'takas',
    dayLabel: '2. Senaryo • Kart İçi Takas + Kredi',
    shortTitle: '🔄 Eski Aracı Takasa Ver, Üstünü Kredile',
    refCode: 'wa_durum_takas',
    urlBar: '🔒 iveco-fiyat-listesi.vercel.app — Kart İçi Takas & Taksit Hesaplayıcı',
    onlyLink: 'https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_takas',
    caption:
      `🔄 Aracınızı takasa verince sıfır IVECO ayda kaç TL'ye gelir? 1M TL %0 Faizle hesaplayın 👇\n\n` +
      `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_takas`,
    steps: [
      {
        badge: 'TAKAS ADIM 1 / 4 • KART İÇİNDE PEŞİNAT SEÇİN',
        title: "'💳 Taksit & Takas Hesapla' Tuşuna Basıp Takası Seçin",
        subtitle: '500 Bin, 1 Milyon, 1.5 Milyon veya 2 Milyon TL takas değerinizi tek dokunuşla seçin.',
        voiceover: "Mevcut ticari aracınızı peşinata saydırıp sıfır İveco'ya geçin.",
        audioUrl: '/audio/wa-scenarios/takas_1.mp3',
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.22)'
      },
      {
        badge: 'TAKAS ADIM 2 / 4 • SADECE FARKI KREDİLENDİRİN',
        title: 'Sıfır Araçtan Takas Düşer, Aylık Taksit Anında Çıkar!',
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
        subtitle: 'Aşağıdaki linke dokunun, istediğiniz aracın kartında kendi fark taksitinizi görün.',
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
    urlBar: '🔒 iveco-fiyat-listesi.vercel.app — Resmi Banka Kredi Oranları Tablosu',
    onlyLink: 'https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_odemesiz',
    caption:
      `⏳ Şimdi alın, ilk taksiti 3-6 ay sonra ödeyin: Anlaşmalı bankalarda %0 faizli kredi tablosu 👇\n\n` +
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
        badge: 'FİNANSMAN 3 / 4 • 1 MİLYON TL %0 FAİZ PAKETLERİ',
        title: 'Garanti, Akbank, İş Bankası, DenizBank & Yapı Kredi',
        subtitle: '1.000.000 TL %0 Faiz veya 2M - 5M TL yüksek limitli ticari kredi paketleri.',
        voiceover: 'Dört büyük bankada bir milyon lira sıfır faiz fırsatını görün.',
        audioUrl: '/audio/wa-scenarios/odemesiz_3.mp3',
        accent: '#10b981',
        accentBg: 'rgba(16, 185, 129, 0.22)'
      },
      {
        badge: 'FİNANSMAN 4 / 4 • TÜM BANKALAR TEK EKRANDA',
        title: 'Şubeye Gitmeden Bankaları Telefonunuzda Kıyaslayın!',
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
    dayLabel: '4. Senaryo • %20 KDV & Nakit İndirimi',
    shortTitle: '🧾 %20 KDV Avantajı & 325 Bin TL Nakit İndirimi',
    refCode: 'wa_durum_kdv',
    urlBar: '🔒 iveco-fiyat-listesi.vercel.app — %20 KDV Kalkanı & Peşin İndirimler',
    onlyLink: 'https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_kdv',
    caption:
      `🧾 Vergi ödemek yerine filoyu yenileyin: %20 KDV avantajı ve 325 Bin TL'ye varan nakit indirimi 👇\n\n` +
      `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_kdv`,
    steps: [
      {
        badge: 'MUHASEBE 1 / 4 • YIL SONU %20 KDV VERGİ KALKANI',
        title: 'Her Araç Kartında %20 KDV Vergi İndirimi Net Yazar!',
        subtitle: '380.000 TL’den 975.000 TL’ye varan indirilecek %20 KDV tutarını kart üzerinde görün.',
        voiceover: 'Vergi ödemek yerine yüzde yirmi KDV avantajıyla filonuzu yenileyin.',
        audioUrl: '/audio/wa-scenarios/kdv_1.mp3',
        accent: '#10b981',
        accentBg: 'rgba(16, 185, 129, 0.22)'
      },
      {
        badge: 'MUHASEBE 2 / 4 • 325.000 TL’YE VARAN NAKİT İNDİRİMİ',
        title: 'Daily’de 260 Bin, 12 Teker T-Way’de 325 Bin TL İndirim!',
        subtitle: '12 Teker Mikser 5.750.000 TL Nakit, 12 Teker Hafriyat 5.850.000 TL Nakit fırsatıyla.',
        voiceover: 'Daily serisinde iki yüz altmış bin lira nakit indirimini yakalayın.',
        audioUrl: '/audio/wa-scenarios/kdv_2.mp3',
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.22)'
      },
      {
        badge: 'MUHASEBE 3 / 4 • TEK TUŞLA MUHASEBEYE GÖNDERİN',
        title: "'Teknik & KDV Detayı'ndan Muhasebecinize Atın",
        subtitle: 'Aracın KDV matrahını, 1. yıl tam amortismanını ve taksitini tek tuşla iletin.',
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
    dayLabel: '5. Senaryo • 3.5T / 7T / 12 Teker Mikser & Damper',
    shortTitle: '⚖️ 3.5T, 7T Kamyon ve 12 Teker T-Way Fiyatları',
    refCode: 'wa_durum_kantar',
    urlBar: '🔒 iveco-fiyat-listesi.vercel.app — Halk Diliyle Sade Araç & Fiyat Kataloğu',
    onlyLink: 'https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_kantar',
    caption:
      `⚖️ 3.5T Kamyonet, 7T Kamyon ve 12 Teker Mikser/Hafriyat net peşin fiyatlarını karşılaştırın 👇\n\n` +
      `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_kantar`,
    steps: [
      {
        badge: 'ARAÇ GRUBU 1 / 4 • B EHLİYET 3.5 TON KAMYONET & VAN',
        title: 'Daily 3.5 Ton Tek/Çift Teker & Kapalı Panelvan',
        subtitle: 'Halk diliyle net kasa ölçüleri: Kısa, Orta ve Uzun Şasi (1.905.000 TL’den başlayan peşin).',
        voiceover: 'B ehliyetle kullanılan takograf muafiyetli Daily otuz beş C mi?',
        audioUrl: '/audio/wa-scenarios/kantar_1.mp3',
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.22)'
      },
      {
        badge: 'ARAÇ GRUBU 2 / 4 • 7 TON DAILY 70C & EUROCARGO',
        title: 'Daily 7 Ton Kamyon: 4.8 Ton Yük & 260 Bin İndirim!',
        subtitle: '10-12 Euro Palet kapasiteli uzun şasi; 260.000 TL nakit indirimiyle 2.420.000 TL net peşin.',
        voiceover: 'Yoksa beş tona yakın yük taşıyan indirimli yetmiş C mi?',
        audioUrl: '/audio/wa-scenarios/kantar_2.mp3',
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.22)'
      },
      {
        badge: 'ARAÇ GRUBU 3 / 4 • 12 TEKER T-WAY MİKSER & HAFRİYAT',
        title: '12 Teker Mikser 5.750.000 TL • Hafriyat 5.850.000 TL!',
        subtitle: 'Liste 6.075.000 TL / 6.175.000 TL yerine tam 325.000 TL Nakit Alım İndirimiyle!',
        voiceover: 'Üç buçuk tondan kırk tona tüm şasi fiyatlarını inceleyin.',
        audioUrl: '/audio/wa-scenarios/kantar_3.mp3',
        accent: '#10b981',
        accentBg: 'rgba(16, 185, 129, 0.22)'
      },
      {
        badge: 'ARAÇ GRUBU 4 / 4 • KENDİ ARACINIZI SEÇİN',
        title: 'Aşağıdaki Linke Dokunun, Grubunuzu Seçip İnceleyin!',
        subtitle: '6 araç grubundan işinize uygun olana dokunun, peşin ve vadeli fiyatı anında görün.',
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
      ctx.fillText('2026 IVECO BASİT FİYAT LİSTESİ', CANVAS_W / 2, phoneY + 268);
      ctx.fillText('& KART İÇİ TAKSİT HESAPLAYICI', CANVAS_W / 2, phoneY + 325);

      const scenarioBullets = {
        kilavuz: [
          '✅  Üstteki 6 büyük kutudan aracınızın grubunu seçin',
          '✅  Halk dilinde sade başlıklar & net peşin/liste fiyatları',
          '✅  Karttaki "💳 Taksit & Takas Hesapla" tuşuna dokunun',
          '✅  Sayfa değişmeden aynı kart içinde taksitinizi görün',
          '✅  "💬 WhatsApp’tan Sor" ile Can Murat’a tek tuşla ulaşın'
        ],
        takas: [
          '🔄  Kart içindeki "💳 Taksit & Takas Hesapla" kutusunu açın',
          '💰  500 Bin, 1 Milyon, 1.5 Milyon, 2 Milyon TL hazır tuşlar',
          '🔥  Üste kalan farka 1.000.000 TL %0 Faiz imkanı',
          '⏳  Kuveyt Türk ile 3 ve 6 Ay Ödemesiz kredi seçeneği',
          '📸  4 Resimle (Dış, İç, KM, Ruhsat) hızlı ön ekspertiz'
        ],
        odemesiz: [
          '⏳  Kuveyt Türk: 3 Ay ve 6 Ay Ödemesiz Dönem!',
          '💰  1.000.000 TL’den 5.000.000 TL’ye kadar kredi limiti',
          '🔥  Garanti / Akbank / İş / Yapı Kredi: 1M TL %0 Faiz',
          '📅  Kart içinde 12 - 24 - 36 Ay tek tuşla vade hesabı',
          '⚡  Şubeye gitmeden tüm banka taksitlerini canlı kıyaslayın'
        ],
        kdv: [
          '🧾  Her araçta %20 İndirilebilir KDV Vergi Kalkanı',
          '💵  Daily 7 Ton’da 260 Bin, 12 Teker T-Way’de 325 Bin TL İndirim',
          '💳  Kart içinden peşinatsız veya takaslı taksit hesabı',
          '💬  "WhatsApp’tan Sor" ile muhasebeniz için proforma isteyin',
          '📈  Devlete vergi yerine şirketinizin filosuna sıfır araç alın'
        ],
        kantar: [
          '🚐  Daily 3.5 Ton: B Ehliyet • Takograf Muafiyetli • 2.390.000 TL',
          '🚛  Daily 7 Ton Kamyon: 4.8 Ton Yük • 12 Palet • 2.420.000 TL',
          '🏗️  T-Way 12 Teker (8x4) Mikser: 5.750.000 TL Nakit Fırsatı',
          '🪨  T-Way 12 Teker (8x4) Hafriyat Damperi: 5.850.000 TL Nakit',
          '💳  Her araç kartının içinde tek tuşla taksit & takas hesabı'
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
      ctx.fillText('Satış Sorumlusu Can Murat • 0544 622 59 31 | IVECO ERC Samsun', CANVAS_W / 2, phoneY + 1135);
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
        const zeroVehiclePrice = 2390000; // Daily 3.5 Ton Çift Teker
        const diffLoan = zeroVehiclePrice - tradeInVal;

        drawRoundedRect(ctx, contentX, phoneY + 110, contentW, 355, 24);
        ctx.fillStyle = '#162238';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#3b82f6';
        ctx.stroke();

        ctx.fillStyle = '#93c5fd';
        ctx.font = '900 25px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('💳 KART İÇİ TAKSİT & TAKAS HESAPLAYICI (AYNI KARTTA AÇILIR)', contentX + 30, phoneY + 160);

        // Hızlı Peşinat / Takas Butonları
        const quickBtns = ['Peşinatsız', '500 Bin', '1 Milyon', '1.5 Milyon', '2 Milyon'];
        quickBtns.forEach((qb, idx) => {
          const qx = contentX + 30 + idx * 168;
          const qy = phoneY + 185;
          const isSelected = (slideProgress < 0.5 && idx === 2) || (slideProgress >= 0.5 && idx === 3);
          drawRoundedRect(ctx, qx, qy, 158, 54, 12);
          ctx.fillStyle = isSelected ? '#2563eb' : '#0f172a';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = isSelected ? '#93c5fd' : '#334155';
          ctx.stroke();
          ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
          ctx.font = '800 21px "Segoe UI", Inter, Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(qb, qx + 79, qy + 35);
        });
        ctx.textAlign = 'left';

        drawRoundedRect(ctx, contentX + 30, phoneY + 258, contentW - 60, 82, 16);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 24px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('Seçilen Takas / Peşinat Tutarı:', contentX + 55, phoneY + 308);
        ctx.fillStyle = '#4ade80';
        ctx.font = '900 36px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(`${tradeInVal.toLocaleString('tr-TR')} TL`, contentX + 500, phoneY + 310);

        // Alt Fark Hesabı Tablosu
        drawRoundedRect(ctx, contentX, phoneY + 495, contentW, 560, 26);
        ctx.fillStyle = '#132038';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#10b981';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 32px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('📊 KART İÇİNDE CANLI FARK & TAKSİT HESABI', contentX + 34, phoneY + 558);

        const rows = [
          { label: 'Daily 3.5 Ton Çift Teker (Nakit Fiyatı):', val: '2.390.000 TL', color: '#ffffff' },
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
        ctx.font = '800 24px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(`🔥 Kalan ${diffLoan.toLocaleString('tr-TR')} TL için 12 / 24 / 36 Ay Taksit veya %0 Faiz!`, contentX + 55, phoneY + 995);

        drawRoundedRect(ctx, contentX + 40, phoneY + 1110, contentW - 80, 110, 22);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 28px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👆 Karttaki hazır peşinat tuşlarına basın, kalan farkı anında görün!', CANVAS_W / 2, phoneY + 1176);
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
        ctx.fillText('📸 WHATSAPP’TAN 4 RESİMLE YERİNDEN TAKAS EKSPERTİZİ', contentX + 36, phoneY + 175);

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
          ctx.fillText('✓ Hazır', sx + 265, sy + 65);

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
        ctx.fillText('💬 WhatsApp’tan Sor — Takas & Kredi Teklifi Al', CANVAS_W / 2, phoneY + 898);
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
        ctx.font = '900 27px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('🏛️ KUVEYT TÜRK & 5 BANKA TİCARİ KREDİ TABLOSU', contentX + 34, phoneY + 172);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 36px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('Kart İçinden Taksit & 3-6 Ay Ödemesiz Seçenekler', contentX + 34, phoneY + 230);

        const graceBoxes = [
          {
            title: '⏳ 3 AY ÖDEMESİZ DÖNEM SEÇENEĞİ',
            sub: 'Aracı şimdi teslim alın, ilk taksitinizi 3 ay sonra ödeyin!',
            detail: '1.000.000 TL - 5.000.000 TL Arası Kredi • %2,85 Kar Payı • 6-36 Ay Vade',
            color: '#4ade80',
            border: '#10b981'
          },
          {
            title: '🔥 6 AY ÖDEMESİZ DÖNEM SEÇENEĞİ',
            sub: 'Aracı hemen işe koşun, tam 6 ay boyunca taksit ödemeyin!',
            detail: '1.000.000 TL - 5.000.000 TL Arası Kredi • %2,85 - %2,91 Oran • 12-36 Ay Vade',
            color: '#fbbf24',
            border: '#f59e0b'
          },
          {
            title: '💳 KART İÇİNDE 12 - 24 - 36 AY CANLI TAKSİT HESABI',
            sub: 'Her aracın altındaki "💳 Taksit & Takas Hesapla" tuşuna dokunun',
            detail: 'Peşinatınızı seçip 12, 24 ve 36 ay taksitleri aynı kart içinde canlı görün.',
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
          ctx.font = '900 28px "Segoe UI", Inter, Arial, sans-serif';
          ctx.fillText(gb.title, contentX + 55, gy + 58);

          ctx.fillStyle = '#ffffff';
          ctx.font = '800 24px "Segoe UI", Inter, Arial, sans-serif';
          ctx.fillText(gb.sub, contentX + 55, gy + 115);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '600 21px "Segoe UI", Inter, Arial, sans-serif';
          ctx.fillText(gb.detail, contentX + 55, gy + 170);
        });

        drawRoundedRect(ctx, contentX + 40, phoneY + 1110, contentW - 80, 110, 22);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 28px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👆 Karttaki Taksit & Takas Hesapla tuşuyla tüm vadeleri görün!', CANVAS_W / 2, phoneY + 1176);
        ctx.textAlign = 'left';
        return;
      }
    }

    // ── SENARYO 5 (3.5T, 7T & 12 TEKER T-WAY MİKSER/HAFRİYAT) ÖZEL SAHNELERİ ──
    if (scId === 'kantar') {
      const cards = [
        {
          badge: '🚐 1. GRUP: B EHLİYET & TAKOGRAF MUAFİYETLİ',
          title: 'Daily 3.5 Ton Çift Teker — Orta Şasi',
          sub: 'Kampanyalı: 2.500.000 TL  |  Nakit İndirimi: -110.000 TL',
          price: 'Net Peşin: 2.390.000 TL  (KDV: ~398 Bin TL)',
          border: stepIdx === 0 ? '#3b82f6' : 'rgba(59, 130, 246, 0.4)',
          color: '#60a5fa'
        },
        {
          badge: '🚛 2. GRUP: 4.8 TON NET YÜK & 10-12 EURO PALET',
          title: 'Daily 7 Ton Kamyon — Uzun Şasi (Manuel/Otomatik)',
          sub: 'Kampanyalı: 2.680.000 TL  |  Nakit İndirimi: -260.000 TL!',
          price: 'Net Peşin: 2.420.000 TL  (KDV: ~403 Bin TL)',
          border: stepIdx === 1 ? '#f59e0b' : 'rgba(245, 158, 11, 0.4)',
          color: '#fbbf24'
        },
        {
          badge: '🏗️ 3. GRUP: 12 TEKER (8x4) MİKSER & KAYA DAMPERİ',
          title: 'T-Way 12 Teker (8x4) Beton Mikseri & Hafriyat',
          sub: 'Mikser Liste: 6.075.000 TL  |  Nakit İndirimi: -325.000 TL!',
          price: 'Mikser Nakit: 5.750.000 TL  |  Hafriyat: 5.850.000 TL',
          border: stepIdx === 2 ? '#10b981' : 'rgba(16, 185, 129, 0.45)',
          color: '#4ade80'
        }
      ];

      cards.forEach((c, idx) => {
        const cy = phoneY + 108 + idx * 325;
        drawRoundedRect(ctx, contentX, cy, contentW, 302, 22);
        ctx.fillStyle = '#132038';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = c.border;
        ctx.stroke();

        ctx.fillStyle = c.color;
        ctx.font = '900 22px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(c.badge, contentX + 28, cy + 46);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 31px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(c.title, contentX + 28, cy + 94);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '600 21px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(c.sub, contentX + 28, cy + 135);

        drawRoundedRect(ctx, contentX + 28, cy + 154, contentW - 56, 68, 14);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.fillStyle = c.color;
        ctx.font = '900 27px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(c.price, contentX + 48, cy + 198);

        // 2 Sade Buton (Taksit & Takas Hesapla | WhatsApp'tan Sor)
        drawRoundedRect(ctx, contentX + 28, cy + 234, 410, 52, 12);
        ctx.fillStyle = '#2563eb';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 20px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💳 Taksit & Takas Hesapla', contentX + 233, cy + 267);

        drawRoundedRect(ctx, contentX + 454, cy + 234, 410, 52, 12);
        ctx.fillStyle = '#16a34a';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText('💬 WhatsApp’tan Sor', contentX + 659, cy + 267);
        ctx.textAlign = 'left';
      });

      drawRoundedRect(ctx, contentX + 40, phoneY + 1110, contentW - 80, 110, 22);
      ctx.fillStyle = '#2563eb';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 27px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👆 6 Araç Grubunu ve 12 Teker Şantiye Serisini Canlı Kıyaslayın!', CANVAS_W / 2, phoneY + 1176);
      ctx.textAlign = 'left';
      return;
    }

    // ── SENARYO 1 (GENEL KILAVUZ - YENİ BASİT SİSTEM) SAHNELERİ ──────────────
    if (stepIdx === 0 && scId !== 'kdv') {
      // Üstte 6 Araç Grubu Seçici Kutular (2 Satır x 3 Sütun)
      drawRoundedRect(ctx, contentX, phoneY + 105, contentW, 355, 24);
      ctx.fillStyle = '#132038';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#10b981';
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = '900 24px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('👇 1. ADIM: İLGİLENDİĞİNİZ ARAÇ GRUBUNA DOKUNUN', contentX + 28, phoneY + 150);

      const groupBoxes = [
        { icon: '🚐', name: '3.5 Ton Kamyonet', sub: 'B Ehliyet • Çift Teker', hot: stepLocalT < 0.55 },
        { icon: '📦', name: 'Kapalı Panelvan', sub: '12 - 16 m³ Hacim', hot: false },
        { icon: '🚛', name: '7 Ton Kamyon', sub: '4.8 Ton Net Yük', hot: stepLocalT >= 0.55 },
        { icon: '🏭', name: '10–18 Ton Kamyon', sub: 'Eurocargo Serisi', hot: false },
        { icon: '🛣️', name: 'S-Way Çekici (Tır)', sub: '490 & 530 BG', hot: false },
        { icon: '🏗️', name: 'Mikser & Hafriyat', sub: '12 Teker T-Way', hot: false }
      ];

      groupBoxes.forEach((gb, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        const gx = contentX + 24 + col * 286;
        const gy = phoneY + 172 + row * 132;

        drawRoundedRect(ctx, gx, gy, 272, 118, 16);
        ctx.fillStyle = gb.hot ? 'rgba(16, 185, 129, 0.22)' : '#0f172a';
        ctx.fill();
        ctx.lineWidth = gb.hot ? 3 : 1.5;
        ctx.strokeStyle = gb.hot ? '#10b981' : '#334155';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 22px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(`${gb.icon} ${gb.name}`, gx + 16, gy + 50);

        ctx.fillStyle = gb.hot ? '#6ee7b7' : '#94a3b8';
        ctx.font = '600 18px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(gb.sub, gx + 16, gy + 88);
      });

      // Altta Halk Dilinde Sade Araç Kartı + 2 Net Tuş
      const cardY = phoneY + 485;
      drawRoundedRect(ctx, contentX, cardY, contentW, 575, 26);
      ctx.fillStyle = '#162238';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.55)';
      ctx.stroke();

      ctx.fillStyle = '#60a5fa';
      ctx.font = '800 22px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('🪪 B EHLİYET • 🚫 TAKOGRAF MUAFİYETLİ • 🛞 ÇİFT TEKER', contentX + 30, cardY + 48);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 34px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('Daily 3.5 Ton Çift Teker — Orta Şasi (Otomatik)', contentX + 30, cardY + 100);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 21px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('Anlaşılır halk dilinde başlık • Karmaşık fabrika kodları gizlendi', contentX + 30, cardY + 138);

      // 2 Büyük Fiyat Kutusu (Nakit İndirimli & Kredili Liste)
      drawRoundedRect(ctx, contentX + 30, cardY + 165, 405, 145, 18);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#10b981';
      ctx.stroke();
      ctx.fillStyle = '#6ee7b7';
      ctx.font = '700 21px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('💵 Nakit İndirimli Net Fiyat:', contentX + 52, cardY + 208);
      ctx.fillStyle = '#4ade80';
      ctx.font = '900 38px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('2.390.000 TL', contentX + 52, cardY + 265);
      ctx.fillStyle = '#a7f3d0';
      ctx.font = '700 18px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('🔥 110.000 TL Nakit İndirimi Dahil', contentX + 52, cardY + 295);

      drawRoundedRect(ctx, contentX + 455, cardY + 165, 405, 145, 18);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#334155';
      ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 21px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('🏦 Kredili / Kampanyalı Liste:', contentX + 478, cardY + 208);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 38px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('2.500.000 TL', contentX + 478, cardY + 265);
      ctx.fillStyle = '#fbbf24';
      ctx.font = '700 18px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('🧾 %20 KDV Avantajı: ~398.333 TL', contentX + 478, cardY + 295);

      // Yeni Sade 2 Buton Düzeni
      drawRoundedRect(ctx, contentX + 30, cardY + 340, contentW - 60, 46, 12);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.14)';
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.font = '800 21px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('✨ YENİ SADE TASARIM: Her araç kartında sadece 2 net işlem tuşu!', contentX + 50, cardY + 370);

      drawRoundedRect(ctx, contentX + 30, cardY + 408, 405, 105, 20);
      ctx.fillStyle = '#2563eb';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#93c5fd';
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 26px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💳 Taksit & Takas Hesapla', contentX + 232, cardY + 468);

      drawRoundedRect(ctx, contentX + 455, cardY + 408, 405, 105, 20);
      ctx.fillStyle = '#16a34a';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 26px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('💬 WhatsApp’tan Sor', contentX + 657, cardY + 468);
      ctx.textAlign = 'left';

      // Parmak İkonu
      const fingerTargetX = stepLocalT < 0.55 ? contentX + 140 : contentX + 700;
      const fingerTargetY = stepLocalT < 0.55 ? phoneY + 265 : phoneY + 265;
      ctx.font = '62px "Segoe UI Emoji", Arial';
      ctx.fillText('👆', fingerTargetX, fingerTargetY);

      drawRoundedRect(ctx, contentX + 40, phoneY + 1110, contentW - 80, 110, 22);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 28px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👆 Üstten araç grubunu seçin, sade fiyat kartlarını hemen görün!', CANVAS_W / 2, phoneY + 1176);
      ctx.textAlign = 'left';
      return;
    }

    if (stepIdx === 1 && scId !== 'kdv') {
      // 2. Adım: Kart İçinde Açılan Taksit & Takas Hesaplayıcı
      drawRoundedRect(ctx, contentX, phoneY + 108, contentW, 965, 26);
      ctx.fillStyle = '#162238';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#3b82f6';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 31px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('🚐 Daily 3.5 Ton Çift Teker — Orta Şasi', contentX + 30, phoneY + 160);

      // 2 Ana Tuş (Mavi Tuş Aktif: Taksit Paneli Açık)
      drawRoundedRect(ctx, contentX + 30, phoneY + 185, 410, 74, 16);
      ctx.fillStyle = '#2563eb';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#93c5fd';
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 23px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💳 Taksit & Takas Kapat ▲', contentX + 235, phoneY + 231);

      drawRoundedRect(ctx, contentX + 455, phoneY + 185, 405, 74, 16);
      ctx.fillStyle = '#16a34a';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 23px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('💬 WhatsApp’tan Sor', contentX + 657, phoneY + 231);
      ctx.textAlign = 'left';

      // Kart İçi Açılır Hesaplama Kutusu
      const boxY = phoneY + 282;
      drawRoundedRect(ctx, contentX + 26, boxY, contentW - 52, 760, 22);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#3b82f6';
      ctx.stroke();

      ctx.fillStyle = '#93c5fd';
      ctx.font = '900 24px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('1️⃣ PEŞİNAT VEYA TAKAS ARACINIZIN DEĞERİNİ SEÇİN:', contentX + 52, boxY + 50);

      const dpOptions = ['Peşinatsız (0 TL)', '500 Bin TL', '1 Milyon TL', '1.5 Milyon TL'];
      const activeDpIdx = stepLocalT < 0.45 ? 2 : 3;
      dpOptions.forEach((opt, idx) => {
        const ox = contentX + 52 + idx * 198;
        const oy = boxY + 72;
        const isSel = idx === activeDpIdx;
        drawRoundedRect(ctx, ox, oy, 186, 62, 14);
        ctx.fillStyle = isSel ? '#10b981' : '#1e293b';
        ctx.fill();
        ctx.fillStyle = isSel ? '#052e16' : '#e2e8f0';
        ctx.font = '900 20px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(opt, ox + 93, oy + 39);
      });
      ctx.textAlign = 'left';

      ctx.fillStyle = '#93c5fd';
      ctx.font = '900 24px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('2️⃣ KAÇ AY VADE İSTERSİNİZ?', contentX + 52, boxY + 190);

      const termOptions = ['12 Ay Vade', '24 Ay Vade', '36 Ay Vade'];
      const activeTermIdx = stepLocalT < 0.5 ? 1 : 2;
      termOptions.forEach((tOpt, idx) => {
        const tx = contentX + 52 + idx * 265;
        const ty = boxY + 212;
        const isSel = idx === activeTermIdx;
        drawRoundedRect(ctx, tx, ty, 248, 64, 14);
        ctx.fillStyle = isSel ? '#2563eb' : '#1e293b';
        ctx.fill();
        ctx.lineWidth = isSel ? 2.5 : 1;
        ctx.strokeStyle = isSel ? '#93c5fd' : '#334155';
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 23px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(tOpt, tx + 124, ty + 41);
      });
      ctx.textAlign = 'left';

      // Canlı Sonuç Özeti (Kalan Kredi & Aylık Taksit)
      const dpVal = activeDpIdx === 2 ? 1000000 : 1500000;
      const remLoan = 2390000 - dpVal;
      const months = activeTermIdx === 1 ? 24 : 36;
      const rate = 0.0285;
      const factor = Math.pow(1 + rate, months);
      const monthlyPayment = Math.round((remLoan * rate * factor) / (factor - 1));

      drawRoundedRect(ctx, contentX + 52, boxY + 305, contentW - 104, 195, 18);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#10b981';
      ctx.stroke();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '700 23px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(`Peşinat Sonrası Kalan Kredi: ${remLoan.toLocaleString('tr-TR')} TL  (${months} Ay)`, contentX + 78, boxY + 355);

      ctx.fillStyle = '#4ade80';
      ctx.font = '900 44px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(`Aylık Taksit: ~${monthlyPayment.toLocaleString('tr-TR')} TL`, contentX + 78, boxY + 422);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '800 21px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('🔥 1M TL 6 Ay %0 Faiz veya Kuveyt Türk 3-6 Ay Ödemesiz Seçenekli!', contentX + 78, boxY + 472);

      // Kart İçi Yeşil WhatsApp Gönder Butonu
      drawRoundedRect(ctx, contentX + 52, boxY + 530, contentW - 104, 96, 18);
      ctx.fillStyle = '#22c55e';
      ctx.fill();
      ctx.fillStyle = '#052e16';
      ctx.font = '900 27px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💬 Bu Hesabı WhatsApp’tan Can Murat’a Gönder', CANVAS_W / 2, boxY + 588);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 20px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Başka sayfaya gitmeden aynı kartın içinde anında hesaplanır!', CANVAS_W / 2, boxY + 675);
      ctx.textAlign = 'left';

      drawRoundedRect(ctx, contentX + 40, phoneY + 1110, contentW - 80, 110, 22);
      ctx.fillStyle = '#2563eb';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 28px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("👆 '💳 Taksit & Takas Hesapla' ile kart içinde taksitinizi görün!", CANVAS_W / 2, phoneY + 1176);
      ctx.textAlign = 'left';
      return;
    }

    // 3. Adım / KDV ve Muhasebe Sahnesi (Yeni 2 Butonlu Sade Tasarım + 12 Teker & 7 Ton İndirimi)
    drawRoundedRect(ctx, contentX, phoneY + 115, contentW, 940, 28);
    ctx.fillStyle = '#132038';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 24px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('⚖️ NAKİT İNDİRİMİ + %20 İNDİRİLEBİLİR KDV VERGİ KALKANI', contentX + 34, phoneY + 170);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 35px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('Daily 7 Ton Kamyon — Uzun Şasi (4.8 Ton Yük)', contentX + 34, phoneY + 225);

    drawRoundedRect(ctx, contentX + 34, phoneY + 255, contentW - 68, 155, 20);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 23px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('Kredili Liste: 2.680.000 TL   |   Nakit İndirimi: -260.000 TL', contentX + 55, phoneY + 305);

    ctx.fillStyle = '#4ade80';
    ctx.font = '900 38px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('Net Peşin Fiyat: 2.420.000 TL (KDV Dahil)', contentX + 55, phoneY + 362);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 20px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('🏗️ T-Way 12 Teker Mikser: 5.750.000 TL Nakit (-325.000 TL İndirim!)', contentX + 55, phoneY + 396);

    const pulseScale = 1 + Math.sin(stepLocalT * Math.PI * 4) * 0.015;
    ctx.save();
    ctx.translate(CANVAS_W / 2, phoneY + 535);
    ctx.scale(pulseScale, pulseScale);
    ctx.translate(-CANVAS_W / 2, -(phoneY + 535));

    drawRoundedRect(ctx, contentX + 34, phoneY + 445, contentW - 68, 175, 22);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#10b981';
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.font = '900 27px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('🧾 İNDİRİLEBİLİR %20 KDV VERGİ KALKANI AVANTAJI:', contentX + 58, phoneY + 500);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 40px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('~403.333 TL Doğrudan Vergiden Düşülür!', contentX + 58, phoneY + 558);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '600 21px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('12 Teker T-Way Mikserde ~958.333 TL İndirilebilir KDV Avantajı!', contentX + 58, phoneY + 598);
    ctx.restore();

    // Yeni 2 Butonlu Sade Kart Altı
    drawRoundedRect(ctx, contentX + 34, phoneY + 660, 405, 105, 20);
    ctx.fillStyle = '#2563eb';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#93c5fd';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 25px "Segoe UI", Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💳 Taksit & Takas Hesapla', contentX + 236, phoneY + 722);

    drawRoundedRect(ctx, contentX + 465, phoneY + 660, 405, 105, 20);
    ctx.fillStyle = '#16a34a';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#86efac';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 25px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('💬 WhatsApp’tan Sor', contentX + 667, phoneY + 722);

    drawRoundedRect(ctx, contentX + 34, phoneY + 795, contentW - 68, 98, 18);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 24px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('📞 Satış Sorumlusu Can Murat — 0544 622 59 31', CANVAS_W / 2, phoneY + 840);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 20px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('Tek tuşla resmi proforma veya kredi tablosunu WhatsApp’tan isteyin', CANVAS_W / 2, phoneY + 874);
    ctx.textAlign = 'left';

    ctx.font = '68px "Segoe UI Emoji", Arial';
    ctx.fillText('👆', contentX + 680, phoneY + 765);

    drawRoundedRect(ctx, contentX + 40, phoneY + 1110, contentW - 80, 110, 22);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    ctx.fillStyle = '#052e16';
    ctx.font = '900 28px "Segoe UI", Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("👆 '💬 WhatsApp’tan Sor' tuşuyla tek tıkla Can Murat’a bağlanın!", CANVAS_W / 2, phoneY + 1176);
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
