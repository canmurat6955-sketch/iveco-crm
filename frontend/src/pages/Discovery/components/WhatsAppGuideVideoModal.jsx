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
  FiSmartphone
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const DURATION_SEC = 16; // 4 adım x 4 saniye = 16 saniye (WhatsApp Durum için ideal süre)
const FPS = 30;
const CANVAS_W = 1080;
const CANVAS_H = 1920;

const GUIDE_STEPS = [
  {
    id: 1,
    badge: 'ADIM 1 / 4 • CANLI BÜTÇE SÜRGÜSÜ',
    title: 'Peşinat veya Takas Tutarınızı Kaydırarak Seçin',
    subtitle: 'Hiçbir form doldurmadan sürgüyü kaydırın; tüm araçların kalan kredisi anında düşsün.',
    accent: '#10b981',
    accentBg: 'rgba(16, 185, 129, 0.2)'
  },
  {
    id: 2,
    badge: 'ADIM 2 / 4 • 5 BANKA KREDİ KIYASLAMA',
    title: "'Kredi Planı'na Basıp 5 Bankayı Karşılaştırın",
    subtitle: '1 Milyon TL %0 faiz ve Kuveyt Türk 3-6 ay ödemesiz taksit tablolarını canlı açın.',
    accent: '#3b82f6',
    accentBg: 'rgba(59, 130, 246, 0.2)'
  },
  {
    id: 3,
    badge: 'ADIM 3 / 4 • KDV VERGİ KALKANI & TAKAS',
    title: '%20 KDV Avantajını Görün & Muhasebeye Atın',
    subtitle: 'Vergiden düşeceğiniz KDV tutarını görün, tek tuşla ortağınıza veya muhasebenize iletin.',
    accent: '#f59e0b',
    accentBg: 'rgba(245, 158, 11, 0.2)'
  },
  {
    id: 4,
    badge: 'ADIM 4 / 4 • ŞİMDİ KENDİ TELEFONUNUZDA DENEYİN',
    title: 'Aşağıdaki Linke Dokunun, Hesabınızı Canlı Yapın!',
    subtitle: 'Kayıt yok, bekleme yok! Linke tıklayıp 10 saniyede kendi ödeme planınızı oluşturun.',
    accent: '#22c55e',
    accentBg: 'rgba(34, 197, 94, 0.25)'
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

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const statusGuideUrl = 'https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum';

  const statusCaptionText =
    `📲 *2026 IVECO Dijital Fiyat & Kredi Kataloğu Nasıl Kullanılır?*\n\n` +
    `1️⃣ Sürgüyü kaydırıp peşinat veya takas tutarınızı seçin\n` +
    `2️⃣ 5 Bankanın (%0 Faiz & 3-6 Ay Ödemesiz) taksitini karşılaştırın\n` +
    `3️⃣ %20 KDV vergi avantajını görüp tek tuşla muhasebenize gönderin\n\n` +
    `👇 *Kimseyi aramadan kendi hesabınızı canlı yapmak için tıklayın:*\n\n` +
    `${statusGuideUrl}`;

  // Ana Canvas Çizim Motoru (tSec: 0..16 saniye arası)
  const renderFrame = (ctx, tSec) => {
    const clampedT = Math.max(0, Math.min(DURATION_SEC - 0.001, tSec));
    const stepIdx = Math.min(3, Math.floor(clampedT / 4));
    const stepLocalT = (clampedT % 4) / 4; // 0..1 within current 4s step
    const stepMeta = GUIDE_STEPS[stepIdx];

    // 1. Arka Plan (Derin Kurumsal Lacivert / Koyu Tema)
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

    // 3. Üst Kılavuz Başlık Alanı (Yumuşak Giriş Animasyonlu)
    const headerEnter = easeOutCubic(Math.min(1, stepLocalT * 4.5));
    ctx.save();
    ctx.translate(0, (1 - headerEnter) * 28);
    ctx.globalAlpha = headerEnter;

    // Adım Rozeti
    drawRoundedRect(ctx, 60, 82, 520, 54, 27);
    ctx.fillStyle = stepMeta.accentBg;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = stepMeta.accent;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 24px "Segoe UI", Inter, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`📲 ${stepMeta.badge}`, 88, 117);

    // Ana Başlık
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 44px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(stepMeta.title, 60, 198);

    // Alt Açıklama
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 26px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(stepMeta.subtitle, 60, 248);
    ctx.restore();

    // 4. ORTA BÖLÜM: AKILLI TELEFON EKRANI ÇERÇEVESİ (Mockup)
    const phoneX = 60;
    const phoneY = 290;
    const phoneW = CANVAS_W - 120; // 960px
    const phoneH = 1360;

    // Telefon Dış Gölge & Çerçeve
    drawRoundedRect(ctx, phoneX - 6, phoneY - 6, phoneW + 12, phoneH + 12, 48);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.stroke();

    drawRoundedRect(ctx, phoneX, phoneY, phoneW, phoneH, 42);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Telefon Üst Tarayıcı / Adres Çubuğu
    drawRoundedRect(ctx, phoneX + 24, phoneY + 22, phoneW - 48, 62, 18);
    ctx.fillStyle = '#090f1d';
    ctx.fill();
    ctx.fillStyle = '#34d399';
    ctx.font = '700 22px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('🔒 iveco-fiyat-listesi.vercel.app  —  2026 Dijital Fiyat & Kredi Kataloğu', phoneX + 50, phoneY + 61);

    const contentX = phoneX + 34;
    const contentW = phoneW - 68;

    // ── SAHNE 1: CANLI PEŞİNAT / TAKAS SÜRGÜSÜ (0 - 4 sn) ───────────────────
    if (stepIdx === 0) {
      const slideProgress = easeInOutQuad(Math.min(1, Math.max(0, (stepLocalT - 0.12) / 0.65)));
      const currentDownpayment = Math.round((750000 + slideProgress * 1100000) / 50000) * 50000; // 750.000 -> 1.850.000 TL
      const vehicleCashPrice = 2470000; // Daily 35C16 3750
      const remainingLoan = Math.max(0, vehicleCashPrice - currentDownpayment);
      const monthlyEst = Math.round(remainingLoan / 18);

      // Üst Bilgi Kutusu
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

      // Canlı Değişen Büyük Peşinat Rakamı
      drawRoundedRect(ctx, contentX + 540, phoneY + 178, 320, 58, 14);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.fill();
      ctx.fillStyle = '#4ade80';
      ctx.font = '900 34px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(`${currentDownpayment.toLocaleString('tr-TR')} TL`, contentX + 565, phoneY + 219);

      // Sürgü Çubuğu (Slider Track)
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

      // Sürgü Tutamacı (Thumb)
      const thumbX = trackX + activeTrackW;
      const thumbY = trackY + 12;
      ctx.beginPath();
      ctx.arc(thumbX, thumbY, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#10b981';
      ctx.stroke();

      // Hızlı Seçim Butonları
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

      // Altında Canlı Güncellenen Örnek Araç Kartı
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

      // Fiyat Kutuları
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

      // Canlı Taksit Özeti Bandı
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

      // Parmak İmleci & Odak Balonu
      const pulse = 1 + Math.sin(stepLocalT * Math.PI * 6) * 0.15;
      ctx.beginPath();
      ctx.arc(thumbX, thumbY, 44 * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
      ctx.lineWidth = 5;
      ctx.stroke();

      ctx.font = '64px "Segoe UI Emoji", Arial';
      ctx.fillText('👆', thumbX - 24, thumbY + 62);

      // Sarı Rehber Etiketi
      drawRoundedRect(ctx, contentX + 80, phoneY + 1110, contentW - 160, 110, 22);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 30px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👆 Sürgüyü sağa-sola kaydırın, tüm liste anında güncellenir!', CANVAS_W / 2, phoneY + 1176);
      ctx.textAlign = 'left';
    }

    // ── SAHNE 2: 5 BANKA KREDİ & ÖDEMESİZ DÖNEM TABLOSU (4 - 8 sn) ──────────
    if (stepIdx === 1) {
      // Üstte Seçilen Araç Başlığı
      drawRoundedRect(ctx, contentX, phoneY + 108, contentW, 130, 22);
      ctx.fillStyle = '#162238';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 32px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('🚛 Daily 35C16 & 70C18 — Resmi Kredi Tablosu', contentX + 30, phoneY + 162);

      // "🏦 Kredi Planı" Butonu Vurgusu
      drawRoundedRect(ctx, contentX + 590, phoneY + 132, 275, 76, 16);
      ctx.fillStyle = '#2563eb';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#93c5fd';
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 26px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('🏦 Kredi Planı Açık', contentX + 615, phoneY + 179);

      // 5 Banka Karşılaştırma Kartları
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

      // Alt Rehber Bandı
      drawRoundedRect(ctx, contentX + 40, phoneY + 1110, contentW - 80, 110, 22);
      ctx.fillStyle = '#2563eb';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 29px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("👆 Araç kartındaki 'Kredi Planı' tuşuyla tüm taksitleri açın!", CANVAS_W / 2, phoneY + 1176);
      ctx.textAlign = 'left';
    }

    // ── SAHNE 3: %20 KDV VERGİ KALKANI & ORTAĞA / MUHASEBEYE GÖNDER (8 - 12 sn) ──
    if (stepIdx === 2) {
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

      // Kampanyalı vs Nakit İndirimli Fiyat
      drawRoundedRect(ctx, contentX + 34, phoneY + 265, contentW - 68, 150, 20);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 24px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('Kredili Kampanya Fiyatı: 2.680.000 TL   |   Nakit İndirimi: -260.000 TL', contentX + 58, phoneY + 318);

      ctx.fillStyle = '#4ade80';
      ctx.font = '900 40px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('Net Peşin Fiyat: 2.420.000 TL (KDV Dahil)', contentX + 58, phoneY + 382);

      // %20 KDV Vergi Kalkanı Vurgu Kutusu
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
      ctx.fillText('Devlete ödeyeceğiniz vergi yerine filonuza sıfır araç kazandırın.', contentX + 60, phoneY + 605);
      ctx.restore();

      // 3 Aksiyon Butonu (Ortağa Gönder / 4 Resimle Takas / WhatsApp Teklif)
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

      // Parmak İmleci
      ctx.font = '68px "Segoe UI Emoji", Arial';
      ctx.fillText('👆', CANVAS_W / 2 + 220, phoneY + 775);

      // Alt Rehber Bandı
      drawRoundedRect(ctx, contentX + 40, phoneY + 1110, contentW - 80, 110, 22);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.fillStyle = '#052e16';
      ctx.font = '900 29px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👆 Tek tuşla hesap özetini ortağınıza veya muhasebenize atın!', CANVAS_W / 2, phoneY + 1176);
      ctx.textAlign = 'left';
    }

    // ── SAHNE 4: FİNAL ÇAĞRISI — AŞAĞIDAKİ LİNKE DOKUNUN (12 - 16 sn) ────────
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
      ctx.font = '900 32px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('🚀 10 SANİYEDE KENDİ HESABINIZI YAPIN', CANVAS_W / 2, phoneY + 195);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('2026 IVECO DİJİTAL KATALOG', CANVAS_W / 2, phoneY + 268);
      ctx.fillText('& CANLI KREDİ SİSTEMİ', CANVAS_W / 2, phoneY + 328);

      const bullets = [
        '✅  Form doldurma veya bekleme zorunluluğu YOK',
        '✅  Peşinat & Takas sürgüsüyle canlı taksit hesabı',
        '✅  5 Banka (%0 Faiz & 3-6 Ay Ödemesiz) karşılaştırma',
        '✅  %20 KDV vergi kalkanı & nakit iskonto tablosu',
        '✅  Daily 35C • Daily 70C • Eurocargo • S-Way • T-Way'
      ];

      ctx.textAlign = 'left';
      bullets.forEach((b, idx) => {
        const by = phoneY + 400 + idx * 86;
        drawRoundedRect(ctx, contentX + 50, by, contentW - 100, 68, 16);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.fill();
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '700 26px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(b, contentX + 80, by + 44);
      });

      // Zıplayan Aşağı Ok & Çağrı Kutusu
      const bounceY = Math.sin(stepLocalT * Math.PI * 6) * 14;
      drawRoundedRect(ctx, contentX + 50, phoneY + 875 + bounceY, contentW - 100, 175, 26);
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
    }

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
      renderFrame(ctx, currentTime);
      return;
    }

    startTimeRef.current = performance.now() - currentTime * 1000;

    const tick = (now) => {
      const elapsedSec = ((now - startTimeRef.current) / 1000) % DURATION_SEC;
      setCurrentTime(elapsedSec);
      renderFrame(ctx, elapsedSec);
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, isPlaying, isRecording]);

  // Tek Tuşla 16 Saniyelik Video (.webm / .mp4) Kaydet & İndir
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
      videoBitsPerSecond: 6000000 // 6 Mbps net HD kalite
    });

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: selectedMime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `IVECO_WhatsApp_Durum_Kullanim_Kilavuzu_${new Date().toISOString().slice(0, 10)}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsRecording(false);
      setIsPlaying(true);
      toast.success('🎬 16 Saniyelik WhatsApp Durum Kullanım Kılavuzu Videosu indirildi!');
    };

    recorder.start();

    const totalFrames = DURATION_SEC * FPS;
    for (let f = 0; f < totalFrames; f++) {
      const tSec = f / FPS;
      renderFrame(ctx, tSec);
      setCurrentTime(tSec);
      setRecordProgress(Math.round(((f + 1) / totalFrames) * 100));
      await new Promise(r => setTimeout(r, 1000 / FPS));
    }

    recorder.stop();
  };

  // 4 Adımı Tek Tek HD Story Görseli (.png) Olarak İndir
  const handleDownload4Slides = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const sampleTimes = [2.2, 6.2, 10.2, 14.2]; // Her adımın en net anı

    sampleTimes.forEach((t, idx) => {
      renderFrame(ctx, t);
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `IVECO_WA_Durum_Kilavuz_Adim_${idx + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });

    renderFrame(ctx, currentTime);
    toast.success('📸 4 Adımlı HD WhatsApp Durum Kılavuz Görselleri indirildi!');
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(statusCaptionText);
    setCopiedCaption(true);
    toast.success('📋 WhatsApp Durum açıklama metni ve takip linki kopyalandı!');
    setTimeout(() => setCopiedCaption(false), 3000);
  };

  if (!isOpen) return null;

  const activeStepIdx = Math.min(3, Math.floor(currentTime / 4));

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 10, 22, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '18px'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        maxWidth: '1040px',
        width: '100%',
        maxHeight: '94vh',
        overflowY: 'auto',
        padding: '22px 26px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)'
      }}>
        {/* Üst Başlık */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #2563eb 100%)',
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
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                🎬 WhatsApp Durum "Dijital Katalog Kullanım Kılavuzu" Video Stüdyosu
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Müşterilere linkin içinde nasıl peşinat, 5 banka kredisi ve KDV hesabı yapacaklarını adım adım gösteren 9:16 dikey tanıtım videosu
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

        {/* İçerik Grid: Sol Canlı 9:16 Telefon Önizleme | Sağ İndirme & WhatsApp Açıklama Metni */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(290px, 340px) 1fr',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* SOL: Canlı 9:16 Video Önizleme Canvas'ı */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              position: 'relative',
              width: '310px',
              height: '551px',
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

            {/* Oynat / Durdur & Adım Seçici */}
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
                      renderFrame(canvasRef.current.getContext('2d'), targetT);
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
                  Adım {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* SAĞ: Adım Özeti, Tek Tuşla Video İndirme & WhatsApp Durum Açıklaması */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 4 Adım Senaryo Özeti */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '14px 16px'
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '10px' }}>
                📽️ Videodaki 4 Akılcı Geçiş Sahnesi (16 Saniye — Kullanım Kılavuzu Kurgu):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {GUIDE_STEPS.map((st, idx) => (
                  <div
                    key={st.id}
                    onClick={() => {
                      setIsPlaying(false);
                      const targetT = idx * 4 + 1.8;
                      setCurrentTime(targetT);
                      if (canvasRef.current) {
                        renderFrame(canvasRef.current.getContext('2d'), targetT);
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
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: st.accent }}>{st.badge}</div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-heading)' }}>{st.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{st.subtitle}</div>
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
                  minWidth: '240px',
                  background: isRecording
                    ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '13px 18px',
                  fontSize: '0.9rem',
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
                  : '🎬 16 Sn Geçişli Videoyu İndir (WA Durum)'}
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
                  padding: '13px 16px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px'
                }}
                title="İsterseniz 4 adımı 4 ayrı WhatsApp Durum görseli olarak da indirebilirsiniz"
              >
                <FiImage size={16} />
                📸 4 Adımı Görsel Olarak İndir (PNG)
              </button>
            </div>

            {/* WhatsApp Durum Alt Açıklama Metni (Videonun Altına Yapıştırılacak Linkli Metin) */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '12px',
              padding: '14px 16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiSmartphone size={14} />
                  Videonun Altına Yapıştırılacak WhatsApp Durum Açıklaması (Tıklanabilir Linkli):
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
                fontSize: '0.77rem',
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                background: 'var(--bg-card)',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                lineHeight: 1.45
              }}>
                {statusCaptionText}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
