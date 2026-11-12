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
  FiLayers
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const DURATION_SEC = 16; // 4 adım x 4 saniye = 16 saniye
const FPS = 30;
const CANVAS_W = 1080;
const CANVAS_H = 1920;

// ── 5 AKILCI WHATSAPP DURUM VİDEO SENARYOSU ─────────────────────────────────
const VIDEO_SCENARIOS = [
  {
    id: 'kilavuz',
    dayLabel: '1. Senaryo • Genel Kılavuz',
    shortTitle: '📲 10 Sn Kullanım Kılavuzu',
    refCode: 'wa_durum_kilavuz',
    urlBar: '🔒 iveco-fiyat-listesi.vercel.app — Dijital Fiyat & Kredi Kataloğu',
    caption:
      `📲 *2026 IVECO Dijital Fiyat & Kredi Kataloğu Nasıl Kullanılır? (15 Sn Rehber)*\n\n` +
      `1️⃣ Sürgüyü kaydırıp peşinat veya takas tutarınızı seçin\n` +
      `2️⃣ 5 Bankanın (%0 Faiz & 3-6 Ay Ödemesiz) taksitini karşılaştırın\n` +
      `3️⃣ %20 KDV vergi avantajını görüp tek tuşla muhasebenize gönderin\n\n` +
      `👇 *Kimseyi aramadan kendi hesabınızı canlı yapmak için tıklayın:*\n\n` +
      `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_kilavuz`,
    steps: [
      {
        badge: 'ADIM 1 / 4 • CANLI BÜTÇE SÜRGÜSÜ',
        title: 'Peşinat veya Takas Tutarınızı Kaydırarak Seçin',
        subtitle: 'Form doldurmadan sürgüyü kaydırın; tüm araçların kalan kredisi anında düşsün.',
        accent: '#10b981',
        accentBg: 'rgba(16, 185, 129, 0.22)'
      },
      {
        badge: 'ADIM 2 / 4 • 5 BANKA KREDİ KIYASLAMA',
        title: "'Kredi Planı'na Basıp 5 Bankayı Karşılaştırın",
        subtitle: '1 Milyon TL %0 faiz ve Kuveyt Türk 3-6 ay ödemesiz taksit tablolarını canlı açın.',
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.22)'
      },
      {
        badge: 'ADIM 3 / 4 • KDV VERGİ KALKANI & MUHASEBE',
        title: '%20 KDV Avantajını Görün & Muhasebeye Atın',
        subtitle: 'Vergiden düşeceğiniz KDV tutarını görün, tek tuşla ortağınıza veya muhasebenize iletin.',
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.22)'
      },
      {
        badge: 'ADIM 4 / 4 • ŞİMDİ KENDİ TELEFONUNUZDA DENEYİN',
        title: 'Aşağıdaki Linke Dokunun, Hesabınızı Canlı Yapın!',
        subtitle: 'Kayıt yok, bekleme yok! Linke tıklayıp 10 saniyede kendi ödeme planınızı oluşturun.',
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
    caption:
      `🔄 *Mevcut Ticari Aracınızı Peşinata Saydırıp Sıfır IVECO'ya Geçmenin Hesabı:*\n\n` +
      `• Aracınızın tahmini takas değerini sürgüden seçin (Örn: 1.500.000 TL)\n` +
      `• Sadece üste kalan fark için *1 Milyon TL %0 Faiz* veya *3-6 Ay Ödemesiz* krediyi görün\n` +
      `• İsterseniz 4 fotoğraf yükleyip anında takas ön ekspertizi alın!\n\n` +
      `👇 *Kendi aracınızın takas farkını canlı hesaplamak için tıklayın:*\n\n` +
      `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_takas`,
    steps: [
      {
        badge: 'TAKAS ADIM 1 / 4 • ARACINIZ PEŞİNAT OLSUN',
        title: 'Mevcut Aracınızın Değerini Sürgüden Seçin',
        subtitle: 'Cebinizden nakit çıkarmadan, elinizdeki aracın değerini peşinat olarak girin.',
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.22)'
      },
      {
        badge: 'TAKAS ADIM 2 / 4 • SADECE FARKI KREDİLENDİRİN',
        title: 'Sıfır Araçtan Takas Düşer, Kalan Fark Çıkar!',
        subtitle: 'Örn: 2.390.000 TL araçtan 1.500.000 TL takas düşüldüğünde sadece 890.000 TL kalır.',
        accent: '#10b981',
        accentBg: 'rgba(16, 185, 129, 0.22)'
      },
      {
        badge: 'TAKAS ADIM 3 / 4 • 4 RESİMLE HIZLI EKSPERTİZ',
        title: "Kalan Farka %0 Faiz + 4 Resimle Ekspertiz",
        subtitle: 'Aracınızın dış, iç, KM ve ruhsat fotoğrafını seçip WhatsApp üzerinden fiyat alın.',
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.22)'
      },
      {
        badge: 'TAKAS ADIM 4 / 4 • CANLI TAKAS SİMÜLATÖRÜ',
        title: 'Kendi Aracınızla Üste Ne Çıkıyor Hemen Görün!',
        subtitle: 'Aşağıdaki linke dokunun, takas sürgüsüyle kendi fark taksitinizi 10 saniyede hesaplayın.',
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
    caption:
      `⏳ *Aracı Bugün İşe Koşun, İlk Taksiti 3 veya 6 Ay Sonra Ödeyin!*\n\n` +
      `🏦 *Kuveyt Türk:* 1 Milyon TL'den 5 Milyon TL'ye kadar *3 ve 6 Ay Ödemesiz Dönem*\n` +
      `🔥 *Garanti / Akbank / İş Bankası / Yapı Kredi:* 1.000.000 TL 6 Ay *%0 Faiz* (veya 12 Ay %1,79)\n\n` +
      `👇 *5 bankanın tamamında taksitleri canlı karşılaştırmak için tıklayın:*\n\n` +
      `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_odemesiz`,
    steps: [
      {
        badge: 'FİNANSMAN 1 / 4 • NAKİT AKIŞINIZI KORUYUN',
        title: 'Aracı Şimdi Alın, İlk Taksiti 3-6 Ay Sonra Ödeyin!',
        subtitle: 'Araç hemen para kazanmaya başlasın; ödemeniz 3 veya 6 ay sonra başlasın.',
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.22)'
      },
      {
        badge: 'FİNANSMAN 2 / 4 • KUVEYT TÜRK 1M - 5M TL PAKETİ',
        title: '5 Milyon TL’ye Kadar 3 ve 6 Ay Ödemesiz Kredi',
        subtitle: 'Kuveyt Türk Katılım Finansmanı ile 6 aydan 36 aya kadar esnek vade tablosu.',
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.22)'
      },
      {
        badge: 'FİNANSMAN 3 / 4 • 4 BANKADA 1 MİLYON TL %0 FAİZ',
        title: 'Garanti, Akbank, İş Bankası ve Yapı Kredi Tablosu',
        subtitle: '1.000.000 TL 6 Ay %0 Faiz (166.667 TL/Ay) veya 2M - 3M TL ticari kredi paketleri.',
        accent: '#10b981',
        accentBg: 'rgba(16, 185, 129, 0.22)'
      },
      {
        badge: 'FİNANSMAN 4 / 4 • TÜM BANKALAR TEK EKRANDA',
        title: 'Şubeye Gitmeden 5 Bankayı Telefonunuzda Kıyaslayın!',
        subtitle: 'Aşağıdaki linke tıklayın, istediğiniz kredi tutarını seçip taksitleri canlı görün.',
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
    caption:
      `🧾 *Yıl Sonu Vergi Planlaması: ~400.000 TL İndirilebilir %20 KDV Avantajı!*\n\n` +
      `• Daily 35C serisinde *110.000 TL*, Daily 70C serisinde *260.000 TL* Peşin İskontosu\n` +
      `• Her aracın altında doğrudan vergiden düşülebilir *%20 KDV tutarı* hazır hesaplı\n` +
      `• Tek tuşla *"Ortağa / Muhasebeye Gönder"* butonuyla özeti WhatsApp'tan iletin!\n\n` +
      `👇 *Firmanıza özel KDV ve nakit iskonto tablosunu görmek için tıklayın:*\n\n` +
      `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_kdv`,
    steps: [
      {
        badge: 'MUHASEBE 1 / 4 • YIL SONU VERGİ KALKANI',
        title: 'Hangi Araçta Ne Kadar KDV Vergiden Düşüyor?',
        subtitle: 'Katalogdaki her aracın üzerinde indirilebilir %20 KDV tutarı kuruşu kuruşuna yazar.',
        accent: '#10b981',
        accentBg: 'rgba(16, 185, 129, 0.22)'
      },
      {
        badge: 'MUHASEBE 2 / 4 • 260.000 TL’YE VARAN NAKİT İNDİRİMİ',
        title: '35C’de 110 Bin TL, 70C’de 260 Bin TL Peşin İndirimi!',
        subtitle: 'Kredili kampanya fiyatı ile net nakit indirimli fiyatı aynı kartta şeffaf görün.',
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.22)'
      },
      {
        badge: 'MUHASEBE 3 / 4 • TEK TUŞLA ORTAĞA / MUHASEBEYE ATIN',
        title: "'Ortağa / Muhasebeye Gönder' Tuşuna Dokunun",
        subtitle: 'Aracın net fiyatını, KDV kalkanını ve kredi taksitini tek tıkla mali müşavirinize iletin.',
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.22)'
      },
      {
        badge: 'MUHASEBE 4 / 4 • ŞİRKETİNİZ İÇİN CANLI HESAPLAYIN',
        title: 'Aşağıdaki Linkten KDV ve Nakit Tablosunu Açın!',
        subtitle: 'Hemen linke dokunun, yıl sonu vergi avantajınızı kendi telefonunuzda inceleyin.',
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
    caption:
      `⚖️ *İşinize Hangi IVECO Daha Uygun? B Ehliyetli 35C mi, 4.8 Tonluk 70C mi?*\n\n` +
      `🪪 *Daily 35C16:* B Ehliyet • Takograf Muafiyetli • Çift Teker C-Şasi (2.390.000 TL'den başlayan net peşin)\n` +
      `🚛 *Daily 70C16 / 70C18:* 4.8 Ton Net Yük • 10-12 Palet • 260.000 TL Nakit İndirimi (2.420.000 TL'den başlayan net peşin)\n\n` +
      `👇 *Yükünüze ve kasa ölçünüze göre tüm şasileri karşılaştırmak için tıklayın:*\n\n` +
      `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_kantar`,
    steps: [
      {
        badge: 'ŞASİ SEÇİMİ 1 / 4 • B EHLİYET & TAKOGRAF MUAFİYETİ',
        title: 'Daily 35C16: B Ehliyetle Kullanılan Çift Teker Gücü',
        subtitle: 'Takograf muafiyetli, B sınıfı ehliyetle şehir içi dağıtım için 2.390.000 TL net peşin.',
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.22)'
      },
      {
        badge: 'ŞASİ SEÇİMİ 2 / 4 • 4.8 TON RESMİ KANTAR KAPASİTESİ',
        title: 'Daily 70C16 & 70C18: 4.8 Ton Yük & 260 Bin İndirim!',
        subtitle: '10-12 Euro Palet kapasiteli ağır şasi; 260.000 TL nakit indirimiyle 2.420.000 TL net peşin.',
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.22)'
      },
      {
        badge: 'ŞASİ SEÇİMİ 3 / 4 • EUROCARGO & S-WAY / T-WAY FİLO',
        title: '3.5 Tondan 40 Ton Çekiciye Tüm 2026 Fiyatları',
        subtitle: 'Frigo, tente, sac kasa, kurtarıcı veya damper; işinize uygun şasiyi tek tıkla süzün.',
        accent: '#10b981',
        accentBg: 'rgba(16, 185, 129, 0.22)'
      },
      {
        badge: 'ŞASİ SEÇİMİ 4 / 4 • KENDİ ŞASİNİZİ KARŞILAŞTIRIN',
        title: 'Aşağıdaki Linke Dokunun, Şasi ve Fiyatları Kıyaslayın!',
        subtitle: '3750, 4100 ve 4750 şasi fiyat farklarını ve kredi tablosunu canlı inceleyin.',
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

  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [copiedCaption, setCopiedCaption] = useState(false);

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
    const stepIdx = Math.min(3, Math.floor(clampedT / 4));
    const stepLocalT = (clampedT % 4) / 4;
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
      setCurrentTime(elapsedSec);
      renderFrame(ctx, elapsedSec, currentScenario);
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, isPlaying, isRecording, scenarioIdx]);

  // Tek Tuşla 16 Saniyelik Video Kaydet & İndir
  const handleDownloadVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isRecording) return;

    if (typeof canvas.captureStream !== 'function' || typeof window.MediaRecorder === 'undefined') {
      toast.error('Tarayıcınız doğrudan video kaydını desteklemiyor, 4 Adımlı Görsel İndir butonunu kullanabilirsiniz.');
      return;
    }

    setIsPlaying(false);
    setIsRecording(true);
    setRecordProgress(0);

    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(FPS);

    const mimeTypes = [
      'video/mp4;codecs=avc1',
      'video/mp4',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ];
    const selectedMime = mimeTypes.find(m => window.MediaRecorder.isTypeSupported(m)) || 'video/webm';
    const ext = selectedMime.includes('mp4') ? 'mp4' : 'webm';

    const chunks = [];
    const recorder = new window.MediaRecorder(stream, {
      mimeType: selectedMime,
      videoBitsPerSecond: 6000000
    });

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: selectedMime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `IVECO_WA_Durum_${currentScenario.id}_${new Date().toISOString().slice(0, 10)}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsRecording(false);
      setIsPlaying(true);
      toast.success(`🎬 "${currentScenario.shortTitle}" videosu indirildi!`);
    };

    recorder.start();

    const totalFrames = DURATION_SEC * FPS;
    for (let f = 0; f < totalFrames; f++) {
      const tSec = f / FPS;
      renderFrame(ctx, tSec, currentScenario);
      setCurrentTime(tSec);
      setRecordProgress(Math.round(((f + 1) / totalFrames) * 100));
      await new Promise(r => setTimeout(r, 1000 / FPS));
    }

    recorder.stop();
  };

  // Seçili Senaryonun 4 Adımını Görsel Olarak İndir
  const handleDownload4Slides = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const sampleTimes = [2.2, 6.2, 10.2, 14.2];

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

  const activeStepIdx = Math.min(3, Math.floor(currentTime / 4));

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
                🎬 5 Akılcı Senaryolu WhatsApp Durum Video & Kılavuz Stüdyosu
              </h2>
              <p style={{ margin: 0, fontSize: '0.79rem', color: 'var(--text-secondary)' }}>
                Her gün farklı bir müşteri ihtiyacına (Genel Kılavuz, Takas, 3-6 Ay Ödemesiz, %20 KDV, 35C vs 70C) odaklanan geçişli video ve takip linki
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

            <div style={{ display: 'flex', gap: '6px', marginTop: '10px', width: '100%', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setIsPlaying(p => !p)}
                disabled={isRecording}
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {isPlaying ? <FiPause size={13} /> : <FiPlay size={13} />}
                {isPlaying ? 'Duraklat' : 'Oynat'}
              </button>

              {[0, 1, 2, 3].map(idx => (
                <button
                  key={idx}
                  type="button"
                  disabled={isRecording}
                  onClick={() => {
                    setIsPlaying(false);
                    const targetT = idx * 4 + 1.8;
                    setCurrentTime(targetT);
                    if (canvasRef.current) {
                      renderFrame(canvasRef.current.getContext('2d'), targetT, currentScenario);
                    }
                  }}
                  style={{
                    background: activeStepIdx === idx ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                    color: activeStepIdx === idx ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Sahne {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* SAĞ: Seçili Senaryo Akışı, Video İndirme & WhatsApp Alt Metni */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '13px 16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '9px' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiLayers style={{ color: '#10b981' }} />
                  {currentScenario.shortTitle} — 4 Sahnelik Geçiş Planı:
                </div>
                <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>
                  Takip Kodu: {currentScenario.refCode}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {currentScenario.steps.map((st, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setIsPlaying(false);
                      const targetT = idx * 4 + 1.8;
                      setCurrentTime(targetT);
                      if (canvasRef.current) {
                        renderFrame(canvasRef.current.getContext('2d'), targetT, currentScenario);
                      }
                    }}
                    style={{
                      background: activeStepIdx === idx ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
                      border: activeStepIdx === idx ? `1px solid ${st.accent}` : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: st.accent }}>{st.badge}</div>
                    <div style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-heading)' }}>{st.title}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{st.subtitle}</div>
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
                  ? `⏳ Video Hazırlanıyor (%${recordProgress})...`
                  : `🎬 "${currentScenario.shortTitle}" Videosunu İndir`}
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

            {/* Seçili Senaryonun WhatsApp Durum Alt Açıklaması */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '12px',
              padding: '13px 16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '0.79rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiSmartphone size={14} />
                  Bu Senaryonun WhatsApp Durum Açıklaması (Özel Takip Linkli):
                </span>
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  style={{
                    background: copiedCaption ? '#10b981' : 'var(--accent-blue)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  {copiedCaption ? <FiCheck size={13} /> : <FiCopy size={13} />}
                  {copiedCaption ? 'Kopyalandı!' : 'Metni & Linki Kopyala'}
                </button>
              </div>
              <pre style={{
                margin: 0,
                fontSize: '0.76rem',
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                background: 'var(--bg-card)',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                lineHeight: 1.42
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
