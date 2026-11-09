import React, { useState, useEffect } from 'react';
import {
  FiCalendar, FiLock, FiCamera, FiFileText, FiBell, FiPackage,
  FiCheckCircle, FiPhone, FiMessageCircle, FiClock, FiMapPin, FiVideo
} from 'react-icons/fi';
import { discoveryApi } from '../../../api/client';
import { openWhatsAppChat } from '../../../utils/openExternal';
import toast from 'react-hot-toast';

const APPOINTMENT_TYPES = [
  {
    id: 'showroom_coffee',
    icon: '☕',
    title: "Showroom'da Kahve & Araç İnceleme",
    sub: 'ERC Samsun Plaza’da aracı yakından inceleyin, kahvemizi için',
    badge: 'Showroom VIP Davet'
  },
  {
    id: 'tradein_appraisal',
    icon: '🔄',
    title: 'Takas Aracımla Ekspertize Gelmek İstiyorum',
    sub: 'Mevcut aracınızı getirin, 15 dk’da değerleyip net farkı çıkaralım',
    badge: 'Takas & Ekspertiz'
  },
  {
    id: 'video_tour',
    icon: '📹',
    title: 'Uzaktayım — WhatsApp Görüntülü Araç Turu',
    sub: 'Showroom’a gelemiyorsanız kabini ve şasiyi canlı görüntülü gösterelim',
    badge: 'Canlı Görüntülü Tur'
  },
  {
    id: 'workplace_or_call',
    icon: '🏢',
    title: 'İş Yerimde Ziyaret / Saatli Telefon Randevusu',
    sub: 'İş yerinizde ziyaret edelim veya tam seçtiğiniz saatte sizi arayalım',
    badge: 'İş Yeri Ziyareti / Çağrı'
  }
];

const DAY_SLOTS = ['Bugün', 'Yarın', 'Bu Hafta İçi', 'Cumartesi'];
const TIME_SLOTS = ['09:30 - 11:30', '12:00 - 14:00', '14:30 - 16:30', '16:30 - 18:00'];

const BODY_PACKAGES = [
  '❄️ Frigorifik (Soğutuculu) Kasa Dahil',
  '🚛 Kayar Perde / Tenteli Kasa Dahil',
  '📦 Kapalı Sac / Kompozit Kutu Kasa Dahil',
  '🛟 Kayar Kasa Oto Kurtarıcı Dahil',
  '🏗️ Hardox Damper / Ahşap Damper Dahil'
];

const SECOND_HAND_SEGMENTS = [
  'Temiz 2. El Daily Kamyonet / Panelvan (3.5t - 7t)',
  'Temiz 2. El S-Way / Stralis Çekici',
  'Temiz 2. El Eurocargo Kamyon',
  'Temiz 2. El T-Way / Trakker İnşaat & Damper'
];

const REQUIRED_TRADEIN_PHOTOS = [
  {
    id: 'dis_gorunum',
    label: '1. Dışarıdan Görünüm Resmi',
    shortLabel: 'Dıştan Resim',
    icon: '📸',
    desc: 'Aracın dışarıdan genel görünümü ve kasa durumu (1 adet)'
  },
  {
    id: 'ic_gorunum',
    label: '2. İçeriden Kabin Resmi',
    shortLabel: 'İçten Resim',
    icon: '💺',
    desc: 'Kabin içi, direksiyon, koltuk ve göğüs durumu (1 adet)'
  },
  {
    id: 'km_saati',
    label: '3. Kilometre (KM) Resmi',
    shortLabel: 'KM Resmi',
    icon: '⏲️',
    desc: 'Güncel kilometreyi net gösteren kadran resmi (1 adet)'
  },
  {
    id: 'ruhsat',
    label: '4. Araç Ruhsat Resmi',
    shortLabel: 'Ruhsat Resmi',
    icon: '📄',
    desc: 'Model yılı, motor/şasi ve tescil yaprağı resmi (1 adet)'
  }
];

function compressImageToDataUrl(file, maxDim = 720, quality = 0.68) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CustomerSmartActionHub({
  activeModelTitle = 'IVECO 2026 Ticari Araç',
  activePrice = 2150000,
  customerCompany = '',
  customerPhone = '',
  customerCity = 'Samsun',
  customerId = '',
  salesRep = { name: 'Satış Sorumlusu Can M.', phoneDisplay: '0544 622 59 31', phoneWhatsapp: '905446225931' },
  onTrackFootprint
}) {
  const [selectedAction, setSelectedAction] = useState('appointment'); // 'appointment' | 'option24h' | 'tradein_photo' | 'tax_summary' | 'body_pkg' | 'second_hand'

  useEffect(() => {
    const handleSelectAction = (e) => {
      const act = e?.detail?.action;
      if (act) {
        setSelectedAction(act);
      }
    };
    window.addEventListener('iveco:select-smart-action', handleSelectAction);
    return () => window.removeEventListener('iveco:select-smart-action', handleSelectAction);
  }, []);

  // Ortak iletişim state
  const [nameInput, setNameInput] = useState(customerCompany || '');
  const [phoneInput, setPhoneInput] = useState(customerPhone || '');
  const [cityInput, setCityInput] = useState(customerCity || 'Samsun');

  useEffect(() => {
    if (customerPhone && !phoneInput) setPhoneInput(customerPhone);
    if (customerCompany && !nameInput) setNameInput(customerCompany);
  }, [customerPhone, customerCompany]);

  // 1. Randevu state
  const [apptType, setApptType] = useState(APPOINTMENT_TYPES[0]);
  const [apptDay, setApptDay] = useState('Yarın');
  const [apptTime, setApptTime] = useState('12:00 - 14:00');
  const [apptAddressOrNote, setApptAddressOrNote] = useState('');

  // 2. 24 Saat Opsiyon state
  const [optionCode, setOptionCode] = useState('');

  // 3. 4 Resimle Takasla Fiyat Al state (1 Dıştan, 1 İçten, KM, Ruhsat)
  const [tradeInPhotos, setTradeInPhotos] = useState({
    dis_gorunum: null,
    ic_gorunum: null,
    km_saati: null,
    ruhsat: null
  });
  const [tradeInCarInfo, setTradeInCarInfo] = useState('');
  const [tradeInKmInput, setTradeInKmInput] = useState('');

  // 5. Üstyapı paket state
  const [selectedBodyPkg, setSelectedBodyPkg] = useState(BODY_PACKAGES[0]);

  // 6. 2. El Habercisi state
  const [selectedSecondHand, setSelectedSecondHand] = useState(SECOND_HAND_SEGMENTS[0]);
  const [secondHandBudget, setSecondHandBudget] = useState('1.250.000 TL - 1.750.000 TL');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const cleanWhatsappPhone = salesRep?.phoneWhatsapp || '905446225931';

  const sendSignalToCrm = async ({ tag, model, campaign, notes, score = 98 }) => {
    const parsedCid = customerId ? parseInt(customerId, 10) : undefined;
    const effectivePhone = (phoneInput.trim() || customerPhone || '').trim();
    const effectiveName = (nameInput.trim() || customerCompany || '').trim();
    if (effectivePhone || effectiveName) {
      try {
        window.localStorage.setItem('iveco_visitor_profile_v1', JSON.stringify({
          phone: effectivePhone,
          name: effectiveName,
          company: effectiveName,
          updatedAt: Date.now()
        }));
      } catch {
        // ignore storage errors
      }
    }
    if (onTrackFootprint) {
      onTrackFootprint(tag, model, campaign, effectivePhone, effectiveName);
    }
    try {
      await discoveryApi.recordIntentSignal({
        source: customerId ? 'crm_existing_customer' : 'smart_action_hub',
        search_query: `[${tag}]`,
        target_model: model || activeModelTitle,
        target_campaign: campaign,
        company_name: effectiveName || 'Portal Müşterisi',
        city: cityInput.trim() || 'Samsun',
        phone: effectivePhone,
        page_url: window.location.href,
        referrer: document.referrer || 'smart_action_hub',
        duration_seconds: 45,
        scroll_depth: 90,
        intent_score: score,
        intent_level: 'very_high',
        matched_customer_id: !isNaN(parsedCid) ? parsedCid : undefined,
        notes
      });
    } catch {
      // Sessizce devam et
    }
  };

  // 1. Randevu Kaydet
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!phoneInput.trim() || phoneInput.replace(/\D/g, '').length < 10) {
      toast.error('Sizinle iletişime geçebilmemiz için lütfen telefon numaranızı yazın.');
      return;
    }
    setSubmitting(true);
    const summary = `${apptType.badge} (${apptDay} • ${apptTime})`;
    await sendSignalToCrm({
      tag: `📅 RANDEVU: ${apptType.title}`,
      model: activeModelTitle,
      campaign: summary,
      notes: `Müşteri Randevu Talebi Oluşturdu!\nTür: ${apptType.title}\nTarih/Saat: ${apptDay} (${apptTime})\nİncelenen Araç: ${activeModelTitle}\nNot/Adres: ${apptAddressOrNote || '-'}`
    });
    setSubmitting(false);
    setSuccessMsg(`✅ "${apptType.title}" randevu talebiniz (${apptDay}, ${apptTime}) Satış Sorumlusu Can M. ekranına iletildi!`);
    toast.success('Randevu talebiniz alındı!');
  };

  // 2. 24 Saat Şasi Opsiyonla
  const handleLock24Hours = async (e) => {
    e.preventDefault();
    if (!phoneInput.trim() || phoneInput.replace(/\D/g, '').length < 10) {
      toast.error('Opsiyon kodunuzu oluşturmak için lütfen telefon numaranızı girin.');
      return;
    }
    setSubmitting(true);
    const code = `ERC-24S-${Math.floor(1000 + Math.random() * 9000)}`;
    await sendSignalToCrm({
      tag: `🔒 24 SAAT ŞASİ OPSİYONU (${code})`,
      model: activeModelTitle,
      campaign: `24 Saat Fiyat & Kredi Opsiyonu #${code}`,
      notes: `Müşteri muhasebecisi/ortağıyla görüşene kadar "${activeModelTitle}" modelini 24 saat adına opsiyonladı. Opsiyon Kodu: ${code}`
    });
    setOptionCode(code);
    setSubmitting(false);
    setSuccessMsg(`🔒 ${activeModelTitle} için 24 saatlik ücretsiz fiyat & kredi opsiyonunuz tanımlandı! Opsiyon Kodunuz: #${code}`);
    toast.success(`24 Saatlik Opsiyon Kodunuz: #${code}`);
  };

  // 3. 4 Resimle Takas Ön Fiyatlama (1 Dıştan, 1 İçten, KM, Ruhsat)
  const uploadedTradeInCount = REQUIRED_TRADEIN_PHOTOS.filter(p => Boolean(tradeInPhotos[p.id])).length;

  const handleTradeInPhotoSelect = async (slotId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setTradeInPhotos(prev => ({
        ...prev,
        [slotId]: {
          file,
          name: file.name,
          dataUrl
        }
      }));
      const slotMeta = REQUIRED_TRADEIN_PHOTOS.find(s => s.id === slotId);
      toast.success(`${slotMeta?.shortLabel || 'Resim'} eklendi ✓`);
    } catch {
      toast.error('Fotoğraf yüklenirken bir sorun oluştu, lütfen tekrar deneyin.');
    }
  };

  const handleRemoveTradeInPhoto = (slotId) => {
    setTradeInPhotos(prev => ({ ...prev, [slotId]: null }));
  };

  const handleTradeInPhotoWhatsApp = async (requireAllFour = true) => {
    const missingSlots = REQUIRED_TRADEIN_PHOTOS.filter(p => !tradeInPhotos[p.id]);
    if (requireAllFour && missingSlots.length > 0) {
      toast.error(
        `Takasla fiyat almak için 4 resim gereklidir. Eksik: ${missingSlots.map(m => m.shortLabel).join(', ')}`,
        { duration: 4000 }
      );
      return;
    }

    setSubmitting(true);
    const photoPayload = {};
    REQUIRED_TRADEIN_PHOTOS.forEach(p => {
      if (tradeInPhotos[p.id]?.dataUrl) {
        photoPayload[p.id] = tradeInPhotos[p.id].dataUrl;
      }
    });
    const hasAnyPhoto = Object.keys(photoPayload).length > 0;
    const serializedPhotos = hasAnyPhoto ? `\n||TRADEIN_PHOTOS_JSON:${JSON.stringify(photoPayload)}` : '';

    await sendSignalToCrm({
      tag: `📸 4 RESİMLE TAKAS FİYAT TALEBİ (${uploadedTradeInCount}/4 Resim)`,
      model: activeModelTitle,
      campaign: `Takas Ekspertizi (${uploadedTradeInCount}/4 Resim Yüklendi)`,
      notes:
        `Müşteri 4 Resimle Takas Ön Fiyat Talebi Gönderdi!\n` +
        `• Hedef Sıfır Araç: ${activeModelTitle}\n` +
        `• Mevcut Takas Aracı: ${tradeInCarInfo.trim() || 'Belirtilmedi'}\n` +
        `• Mevcut KM: ${tradeInKmInput.trim() || 'KM Resminde'}\n` +
        `• Yüklenen Resimler (${uploadedTradeInCount}/4): Dıştan (${tradeInPhotos.dis_gorunum ? '✓' : 'Eksik'}), İçten (${tradeInPhotos.ic_gorunum ? '✓' : 'Eksik'}), KM (${tradeInPhotos.km_saati ? '✓' : 'Eksik'}), Ruhsat (${tradeInPhotos.ruhsat ? '✓' : 'Eksik'})` +
        serializedPhotos
    });
    setSubmitting(false);

    const carDesc = tradeInCarInfo.trim() ? `*${tradeInCarInfo.trim()}*` : 'mevcut ticari aracım';
    const kmDesc = tradeInKmInput.trim() ? ` (*${tradeInKmInput.trim()} KM*)` : '';
    const msg =
      `Merhaba Can Bey,\n\n` +
      `2026 model *${activeModelTitle}* için elimdeki ${carDesc}${kmDesc} adına *Takasla Fiyat Almak* istiyorum.\n\n` +
      `📸 *Takas Ekspertizi İçin Gerekli 4 Resim:*\n` +
      `1️⃣ *Dışarıdan Görünüm Resmi (1 Adet)* ${tradeInPhotos.dis_gorunum ? '✅ (Yüklendi)' : '📷'}\n` +
      `2️⃣ *İçeriden Kabin Resmi (1 Adet)* ${tradeInPhotos.ic_gorunum ? '✅ (Yüklendi)' : '📷'}\n` +
      `3️⃣ *Kilometre (KM) Kadran Resmi (1 Adet)* ${tradeInPhotos.km_saati ? '✅ (Yüklendi)' : '📷'}\n` +
      `4️⃣ *Araç Ruhsat Resmi (1 Adet)* ${tradeInPhotos.ruhsat ? '✅ (Yüklendi)' : '📷'}\n\n` +
      `Tahmini takas bedelini ve kalan kredi ödeme planını çıkarabilir miyiz?`;

    setSuccessMsg(`✅ 4 resimlik takas ön değerleme talebiniz Satış Sorumlusu Can M. ekranına iletildi!`);

    // Bilgisayar (WhatsApp Desktop) ve Mobil cihazlarda popup engelleyiciye takılmadan doğrudan aç
    openWhatsAppChat(cleanWhatsappPhone, msg);
  };

  // 4. Mali Müşavir %20 KDV & Amortisman Özeti
  const handleTaxSummaryWhatsApp = async () => {
    const basePrice = Number(activePrice) || 2150000;
    const kdvAmount = Math.round(basePrice - basePrice / 1.2);
    const yearlyDepreciation = Math.round((basePrice / 1.2) * 0.2);
    await sendSignalToCrm({
      tag: '🧾 MALİ MÜŞAVİR VERGİ KALKANI ÖZETİ',
      model: activeModelTitle,
      campaign: `%20 KDV (${kdvAmount.toLocaleString('tr-TR')} TL) İndirim Özeti`,
      notes: `Müşteri mali müşavirine göndermek üzere %20 KDV ve Amortisman vergi özeti talep etti.`
    });
    const msg =
      `Merhaba Can Bey,\n\n` +
      `*${activeModelTitle}* yatırımı için mali müşavirime / muhasebeme iletmek üzere;\n` +
      `• *%20 İndirilecek KDV Tutarı (~${kdvAmount.toLocaleString('tr-TR')} TL)*,\n` +
      `• *Yıllık Amortisman Gideri (~${yearlyDepreciation.toLocaleString('tr-TR')} TL)* ve\n` +
      `• *Resmi Proforma / Finansman Ödeme Planı* tablosunu WhatsApp üzerinden gönderebilir misiniz?`;
    openWhatsAppChat(cleanWhatsappPhone, msg);
  };

  // 5. Üstyapı (Kasa) Dahil Anahtar Teslim Paket
  const handleBodyPackageRequest = async (e) => {
    e.preventDefault();
    if (!phoneInput.trim() || phoneInput.replace(/\D/g, '').length < 10) {
      toast.error('Anahtar teslim fiyatı iletebilmemiz için lütfen telefon numaranızı girin.');
      return;
    }
    setSubmitting(true);
    await sendSignalToCrm({
      tag: `📦 ÜSTYAPI DAHİL PAKET: ${selectedBodyPkg}`,
      model: activeModelTitle,
      campaign: selectedBodyPkg,
      notes: `Müşteri "${activeModelTitle}" şasisi + "${selectedBodyPkg}" üstyapı dahil anahtar teslim fiyat istedi.`
    });
    setSubmitting(false);
    setSuccessMsg(`📦 "${activeModelTitle} + ${selectedBodyPkg}" anahtar teslim paket talebiniz Satış Sorumlusu Can M.'ye iletildi!`);
    toast.success('Üstyapı dahil paket talebiniz alındı!');
  };

  // 6. Takastan Temiz 2. El Habercisi
  const handleSecondHandAlert = async (e) => {
    e.preventDefault();
    if (!phoneInput.trim() || phoneInput.replace(/\D/g, '').length < 10) {
      toast.error('Takasa temiz araç düştüğünde haber verebilmemiz için telefon numaranızı girin.');
      return;
    }
    setSubmitting(true);
    await sendSignalToCrm({
      tag: `🔔 2. EL TAKAS HABERCİSİ: ${selectedSecondHand}`,
      model: selectedSecondHand,
      campaign: `Bütçe: ${secondHandBudget}`,
      notes: `Müşteri sıfır araç bütçesini aştığı için takastan temiz 2. el araç düştüğünde ilk kendisine haber verilmesini istedi.\nAradığı: ${selectedSecondHand}\nBütçe: ${secondHandBudget}`,
      score: 90
    });
    setSubmitting(false);
    setSuccessMsg(`🔔 Kaydınız alındı! Takastan temiz "${selectedSecondHand}" geldiği anda ilk size haber vereceğiz.`);
    toast.success('2. El Takas Habercisi kaydınız oluşturuldu!');
  };

  const basePriceNum = Number(activePrice) || 2150000;
  const kdvShield = Math.round(basePriceNum - basePriceNum / 1.2);
  const firstYearDepr = Math.round((basePriceNum / 1.2) * 0.2);

  return (
    <div
      id="smart-customer-action-hub"
      style={{
        marginTop: '22px',
        marginBottom: '22px',
        padding: '20px',
        borderRadius: '16px',
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.96) 0%, rgba(12, 34, 64, 0.94) 100%)',
        border: '1.5px solid rgba(56, 189, 248, 0.42)',
        boxShadow: '0 14px 36px rgba(2, 6, 23, 0.45)',
        color: '#f8fafc'
      }}
    >
      {/* Başlık */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
        <div>
          <span style={{
            display: 'inline-block',
            background: 'rgba(16, 185, 129, 0.18)',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            color: '#34d399',
            fontSize: '0.7rem',
            fontWeight: 900,
            padding: '3px 10px',
            borderRadius: '999px',
            marginBottom: '6px'
          }}>
            💡 SİZE ÖZEL HIZLI ÇÖZÜM MERKEZİ • SATIŞ SORUMLUSU CAN M.
          </span>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc' }}>
            Nasıl İlerlemek İstersiniz? (10 Saniyede Seçin)
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            İster showroom’da kahvemizi içmeye gelin, ister iş yerinizde ziyaret edelim, isterseniz fiyatı 24 saat adınıza kilitleyin.
          </p>
        </div>
      </div>

      {/* 6 Ampul Sekme Butonları */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))',
        gap: '8px',
        marginBottom: '16px'
      }}>
        {[
          { id: 'appointment', icon: '📅', title: 'Randevu / Ziyaret İste', sub: 'Showroom, İş Yeri veya Görüntülü' },
          { id: 'option24h', icon: '🔒', title: '24 Saat Adıma Ayır', sub: 'Ortağıma/Muhasebeye Soracağım' },
          { id: 'tradein_photo', icon: '📸', title: '4 Resimle Takasla Fiyat Al', sub: 'Dıştan, İçten, KM & Ruhsat (15 Dk)' },
          { id: 'tax_summary', icon: '🧾', title: 'Muhasebecime Vergi Özeti', sub: '%20 KDV & Amortisman Tablosu' },
          { id: 'body_pkg', icon: '📦', title: 'Kasa + Şasi Anahtar Teslim', sub: 'Frigo, Tenteli, Damper, Kurtarıcı' },
          { id: 'second_hand', icon: '🔔', title: 'Takastan 2. El Habercisi', sub: 'Sıfır Bütçemi Aşıyor Diyenlere' }
        ].map(tab => {
          const active = selectedAction === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSelectedAction(tab.id);
                setSuccessMsg('');
                if (onTrackFootprint) {
                  onTrackFootprint(`Hızlı Çözüm Sekmesi: ${tab.title}`, activeModelTitle, tab.sub);
                }
              }}
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                borderRadius: '11px',
                border: active ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                background: active
                  ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.32), rgba(15, 23, 42, 0.95))'
                  : 'rgba(15, 23, 42, 0.65)',
                color: '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: active ? '#38bdf8' : '#f8fafc' }}>
                {tab.icon} {tab.title}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                {tab.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* Başarı Mesajı */}
      {successMsg && (
        <div style={{
          marginBottom: '14px',
          padding: '12px 14px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.18)',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          color: '#a7f3d0',
          fontSize: '0.84rem',
          fontWeight: 800
        }}>
          {successMsg}
        </div>
      )}

      {/* 1. RANDEVU / ZİYARET SEÇİCİ */}
      {selectedAction === 'appointment' && (
        <form onSubmit={handleBookAppointment} style={{ background: 'rgba(2, 6, 23, 0.55)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#38bdf8', marginBottom: '10px' }}>
            1. Görüşme Tercihinizi Seçin:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', marginBottom: '14px' }}>
            {APPOINTMENT_TYPES.map(t => {
              const isSel = apptType.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setApptType(t)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    border: isSel ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                    background: isSel ? 'rgba(16, 185, 129, 0.16)' : 'rgba(15, 23, 42, 0.7)'
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
                    {t.icon} {t.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '3px' }}>
                    {t.sub}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '5px' }}>
                2. Hangi Gün Uygun?
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {DAY_SLOTS.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setApptDay(d)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '7px',
                      border: apptDay === d ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.12)',
                      background: apptDay === d ? 'rgba(2, 132, 199, 0.25)' : 'rgba(15, 23, 42, 0.8)',
                      color: apptDay === d ? '#38bdf8' : '#cbd5e1',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '5px' }}>
                3. Hangi Saat Aralığı?
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {TIME_SLOTS.map(ts => (
                  <button
                    key={ts}
                    type="button"
                    onClick={() => setApptTime(ts)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '7px',
                      border: apptTime === ts ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.12)',
                      background: apptTime === ts ? 'rgba(2, 132, 199, 0.25)' : 'rgba(15, 23, 42, 0.8)',
                      color: apptTime === ts ? '#38bdf8' : '#cbd5e1',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {ts}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Adınız / Firma Adı"
              style={{ padding: '9px 11px', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.82rem' }}
            />
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="Cep Telefonunuz (05XX...)"
              required
              style={{ padding: '9px 11px', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(56, 189, 248, 0.45)', color: '#fff', fontSize: '0.82rem' }}
            />
            <input
              type="text"
              value={apptAddressOrNote}
              onChange={(e) => setApptAddressOrNote(e.target.value)}
              placeholder={apptType.id === 'workplace_or_call' ? 'İlçe / İş Yeri Adresi veya Notunuz' : 'Varsa Takas Aracınız / Notunuz'}
              style={{ padding: '9px 11px', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.82rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#052e16',
              border: 'none',
              fontWeight: 900,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            {submitting ? 'Kaydediliyor...' : `📅 ${apptType.title} Randevumu Oluştur (${apptDay} • ${apptTime})`}
          </button>
        </form>
      )}

      {/* 2. 24 SAAT ÜCRETSİZ ŞASİ & FİYAT OPSİYONLAMA */}
      {selectedAction === 'option24h' && (
        <form onSubmit={handleLock24Hours} style={{ background: 'rgba(2, 6, 23, 0.55)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#fbbf24', marginBottom: '6px' }}>
            🔒 Ortağınızla veya Muhasebecinizle Görüşene Kadar Bu Fiyatı 24 Saat Adınıza Ayıralım
          </div>
          <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '0 0 12px', lineHeight: 1.45 }}>
            İncelediğiniz <strong>{activeModelTitle}</strong> modelinin mevcut kampanya fiyatını ve <strong>1.000.000 TL %0 Faiz</strong> kredi kontenjanını hiçbir kapora ödemeden <strong>24 saat boyunca firmanız adına</strong> rezerve edebilirsiniz.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Firma Adı veya Adınız Soyadınız"
              required
              style={{ padding: '10px 12px', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', fontSize: '0.84rem' }}
            />
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="Cep Telefonunuz (Opsiyon Kodu SMS/WA İçin)"
              required
              style={{ padding: '10px 12px', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.5)', color: '#fff', fontSize: '0.84rem' }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#0f172a',
              border: 'none',
              fontWeight: 900,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            {submitting ? 'Opsiyon Tanımlanıyor...' : '🔒 Bu Şasiyi ve Kampanyayı 24 Saat Adıma Opsiyonla (Ücretsiz)'}
          </button>
          {optionCode && (
            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#fde68a', fontWeight: 800, textAlign: 'center' }}>
              Resmi Opsiyon Kodunuz: #{optionCode} — Satış Sorumlusu Can M. şasinizi 24 saat bloke etmiştir.
            </div>
          )}
        </form>
      )}

      {/* 3. 4 RESİMLE TAKASLA FİYAT AL (1 DIŞTAN, 1 İÇTEN, KM VE RUHSAT RESMİ) */}
      {selectedAction === 'tradein_photo' && (
        <div style={{ background: 'rgba(2, 6, 23, 0.55)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
            <div style={{ fontSize: '0.94rem', fontWeight: 900, color: '#34d399' }}>
              📸 Sanayiye veya Plazaya Gelmeden 4 Resimle 15 Dakikada Takasla Fiyat Alın
            </div>
            <span style={{
              background: uploadedTradeInCount === 4 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.2)',
              border: uploadedTradeInCount === 4 ? '1px solid #10b981' : '1px solid rgba(245, 158, 11, 0.5)',
              color: uploadedTradeInCount === 4 ? '#34d399' : '#fde68a',
              fontSize: '0.74rem',
              fontWeight: 900,
              padding: '4px 10px',
              borderRadius: '999px'
            }}>
              {uploadedTradeInCount === 4 ? '✓ 4 / 4 Resim Hazır' : `📷 ${uploadedTradeInCount} / 4 Gerekli Resim Eklendi`}
            </span>
          </div>

          <p style={{ fontSize: '0.79rem', color: '#cbd5e1', margin: '0 0 12px', lineHeight: 1.5 }}>
            Mevcut ticari aracınızın net takas ön fiyatlaması için <strong>4 adet resim</strong> gereklidir:{' '}
            <strong style={{ color: '#fde68a' }}>1 adet dışarıdan, 1 adet içeriden (kabin), 1 adet kilometre (KM) saati ve 1 adet ruhsat resmi.</strong>{' '}
            Aşağıdaki kutulardan telefon kameranızla çekebilir veya galeriden seçebilirsiniz:
          </p>

          {/* 4 Resim Yükleme Kutuları */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))',
            gap: '10px',
            marginBottom: '12px'
          }}>
            {REQUIRED_TRADEIN_PHOTOS.map((slot) => {
              const uploaded = tradeInPhotos[slot.id];
              return (
                <div
                  key={slot.id}
                  style={{
                    background: uploaded ? 'rgba(16, 185, 129, 0.12)' : 'rgba(15, 23, 42, 0.85)',
                    border: uploaded ? '1.5px solid #10b981' : '1px dashed rgba(148, 163, 184, 0.45)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 900, color: uploaded ? '#34d399' : '#f8fafc' }}>
                        {slot.icon} {slot.label}
                      </span>
                      {uploaded && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#10b981' }}>✓ Yüklendi</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '3px', lineHeight: 1.35 }}>
                      {slot.desc}
                    </div>
                  </div>

                  {uploaded ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <img
                        src={uploaded.dataUrl}
                        alt={slot.label}
                        style={{
                          width: '56px',
                          height: '44px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid rgba(16, 185, 129, 0.6)'
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                        <label
                          style={{
                            background: 'rgba(56, 189, 248, 0.2)',
                            color: '#7dd3fc',
                            border: '1px solid rgba(56, 189, 248, 0.4)',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          Değiştir
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleTradeInPhotoSelect(slot.id, e)}
                            style={{ display: 'none' }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveTradeInPhoto(slot.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.18)',
                            color: '#fca5a5',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          ✕ Kaldır
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'rgba(56, 189, 248, 0.14)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        color: '#7dd3fc',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        marginTop: '2px'
                      }}
                    >
                      <FiCamera size={14} /> Resim Çek / Seç
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleTradeInPhotoSelect(slot.id, e)}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>

          {/* Opsiyonel Araç & İletişim Bilgisi */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text"
              value={tradeInCarInfo}
              onChange={(e) => setTradeInCarInfo(e.target.value)}
              placeholder="Takas Aracınız (Örn: 2020 Transit / Daily)"
              style={{ padding: '9px 11px', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.16)', color: '#fff', fontSize: '0.8rem' }}
            />
            <input
              type="text"
              value={tradeInKmInput}
              onChange={(e) => setTradeInKmInput(e.target.value)}
              placeholder="Güncel KM (Örn: 185.000 KM)"
              style={{ padding: '9px 11px', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.16)', color: '#fff', fontSize: '0.8rem' }}
            />
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="Cep Telefonunuz (05XX...)"
              style={{ padding: '9px 11px', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#fff', fontSize: '0.8rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleTradeInPhotoWhatsApp(true)}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '10px',
                background: uploadedTradeInCount === 4 ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#052e16',
                border: 'none',
                fontWeight: 900,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <FiCamera size={17} />
              {uploadedTradeInCount === 4
                ? '✅ 4 Resmi Gönder & 15 Dk’da Takas Fiyatı Al (Can M.)'
                : `📸 4 Resmi Tamamla & Takasla Fiyat Al (${uploadedTradeInCount}/4 Resim Eklendi)`}
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleTradeInPhotoWhatsApp(false)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#7dd3fc',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                fontWeight: 800,
                fontSize: '0.76rem',
                cursor: 'pointer'
              }}
            >
              💬 4 Resmi (Dıştan, İçten, KM, Ruhsat) Doğrudan WhatsApp Sohbetinden Göndermek İstiyorum
            </button>
          </div>
        </div>
      )}

      {/* 4. MALİ MÜŞAVİR VERGİ & AMORTİSMAN ÖZETİ */}
      {selectedAction === 'tax_summary' && (
        <div style={{ background: 'rgba(2, 6, 23, 0.55)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.35)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#38bdf8', marginBottom: '8px' }}>
            🧾 Mali Müşavirinize Gönderebileceğiniz Resmi Vergi Avantajı Özeti ({activeModelTitle})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.85)', padding: '10px 12px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>İndirilecek %20 KDV Kalkanı</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#34d399', marginTop: '2px' }}>
                {kdvShield.toLocaleString('tr-TR')} TL
              </div>
              <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Fatura kesildiği ay KDV'den düşülür</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.85)', padding: '10px 12px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>1. Yıl Amortisman Gideri (~%20)</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>
                {firstYearDepr.toLocaleString('tr-TR')} TL
              </div>
              <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Kurumlar/Gelir vergisi matrahından düşülür</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.85)', padding: '10px 12px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Toplam 1. Yıl Vergi Avantajı</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fbbf24', marginTop: '2px' }}>
                {(kdvShield + Math.round(firstYearDepr * 0.25)).toLocaleString('tr-TR')} TL
              </div>
              <div style={{ fontSize: '0.66rem', color: '#64748b' }}>KDV + Kurumlar Vergisi Kalkanı</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleTaxSummaryWhatsApp}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              background: '#0284c7',
              color: '#fff',
              border: 'none',
              fontWeight: 900,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            🧾 Muhasebecime İletmek İçin Bu Vergi & Proforma Tablosunu WhatsApp'ıma Gönderin
          </button>
        </div>
      )}

      {/* 5. ŞASİ + ÜSTYAPI (KASA) DAHİL ANAHTAR TESLİM PAKET */}
      {selectedAction === 'body_pkg' && (
        <form onSubmit={handleBodyPackageRequest} style={{ background: 'rgba(2, 6, 23, 0.55)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.35)' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#38bdf8', marginBottom: '8px' }}>
            📦 Şasi + Üstyapı (Kasa) Dahil Anahtar Teslim Teklif İste ({activeModelTitle})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {BODY_PACKAGES.map(pkg => (
              <button
                key={pkg}
                type="button"
                onClick={() => setSelectedBodyPkg(pkg)}
                style={{
                  padding: '7px 11px',
                  borderRadius: '8px',
                  border: selectedBodyPkg === pkg ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.12)',
                  background: selectedBodyPkg === pkg ? 'rgba(2, 132, 199, 0.28)' : 'rgba(15, 23, 42, 0.8)',
                  color: selectedBodyPkg === pkg ? '#38bdf8' : '#cbd5e1',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {pkg}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Firma Adı / Adınız"
              style={{ padding: '9px 11px', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.82rem' }}
            />
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="Cep Telefonunuz"
              required
              style={{ padding: '9px 11px', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(56, 189, 248, 0.45)', color: '#fff', fontSize: '0.82rem' }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              background: '#0284c7',
              color: '#fff',
              border: 'none',
              fontWeight: 900,
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            📦 {selectedBodyPkg} Anahtar Teslim Fiyatı Gönderin
          </button>
        </form>
      )}

      {/* 6. SIFIR BÜTÇEMİ AŞIYOR — TAKASTAN TEMİZ 2. EL HABERCİSİ */}
      {selectedAction === 'second_hand' && (
        <form onSubmit={handleSecondHandAlert} style={{ background: 'rgba(2, 6, 23, 0.55)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#c084fc', marginBottom: '6px' }}>
            🔔 Sıfır Araç Bütçenizi Aşıyorsa: Takasa Temiz 2. El IVECO Geldiğinde İlk Size Haber Verelim!
          </div>
          <p style={{ fontSize: '0.76rem', color: '#cbd5e1', margin: '0 0 10px' }}>
            Sıfır araç verdiğimiz müşterilerimizden takasa aldığımız, yetkili servis ekspertizli temiz 2. el araçlar ilana bile çıkmadan satılmaktadır. Aradığınız modeli seçin, takasa düştüğü gün ilk sizi arayalım:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            {SECOND_HAND_SEGMENTS.map(seg => (
              <button
                key={seg}
                type="button"
                onClick={() => setSelectedSecondHand(seg)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: selectedSecondHand === seg ? '1.5px solid #c084fc' : '1px solid rgba(255,255,255,0.12)',
                  background: selectedSecondHand === seg ? 'rgba(168, 85, 247, 0.25)' : 'rgba(15, 23, 42, 0.8)',
                  color: selectedSecondHand === seg ? '#e9d5ff' : '#cbd5e1',
                  fontSize: '0.73rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {seg}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Adınız / Firma Adı"
              style={{ padding: '9px 11px', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.82rem' }}
            />
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="Cep Telefonunuz"
              required
              style={{ padding: '9px 11px', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(168, 85, 247, 0.5)', color: '#fff', fontSize: '0.82rem' }}
            />
            <input
              type="text"
              value={secondHandBudget}
              onChange={(e) => setSecondHandBudget(e.target.value)}
              placeholder="Yaklaşık Bütçe Aralığınız"
              style={{ padding: '9px 11px', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.82rem' }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
              color: '#fff',
              border: 'none',
              fontWeight: 900,
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            🔔 Takasa Temiz Araç Geldiğinde İlk Bana Haber Verin
          </button>
        </form>
      )}
    </div>
  );
}
