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

const SYSTEM_IMAGE_URLS = {
  daily35_sasi: '/vehicles/daily-35s-sasi.jpg',
  daily_van: '/vehicles/daily-panelvan.jpg',
  daily70: '/vehicles/daily-35c-72c.jpg',
  eurocargo: '/vehicles/eurocargo-100-120.jpg',
  eurocargo_big: '/vehicles/eurocargo-150-160.jpg',
  sway: '/vehicles/sway-cekici.jpg',
  tway: '/vehicles/tway-damper.jpg',
  ustyapi_35: '/ustyapi/daily35-1.jpg',
  ustyapi_72: '/ustyapi/daily72-1.jpg',
  ustyapi_ec: '/ustyapi/eurocargo-1.jpg',
  logo_iveco: '/logo-iveco-white.png'
};

// ── 8 AKILCI & GERÇEK ARAÇ GÖRSELLİ WHATSAPP DURUM VİDEO SENARYOSU ──────────
// ANDROID WHATSAPP DURUM KURALI:
// Android'de açıklama + link toplamı ~180 karakteri aşarsa veya yıldız (*), madde imi ve çoklu paragraf
// kullanılırsa üstteki resimli önizleme kartı kaybolur ve video altında "...devamını oku" çıkıp link gizlenir.
// Bu yüzden tüm senaryo metinleri tek cümle (~80 krk) + alt satırda tek başına link (~155 krk toplam) olarak sınırlandırılmıştır.
const VIDEO_SCENARIOS = [
  {
    id: 'kilavuz',
    dayLabel: '1. Senaryo • Yeni Çoktan Seçmeli Ekran Kılavuzu',
    shortTitle: '📲 3 Adımda Aracını Seç & Taksit Hesapla',
    refCode: 'wa_durum_kilavuz',
    urlBar: '🔒 iveco-fiyat-listesi.vercel.app — Çoktan Seçmeli 2026 Fiyat & Taksit',
    onlyLink: 'https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_kilavuz',
    caption:
      `📲 3 adımda aracınızı seçip aynı kart içinde 2026 IVECO fiyat ve taksitinizi hesaplayın 👇\n\n` +
      `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_kilavuz`,
    steps: [
      {
        badge: 'ADIM 1 / 4 • RESİMLİ 6 ARAÇ GRUBUNDAN BİRİNE DOKUNUN',
        title: '1. Üstten Araç Grubunu Seçin & Çoktan Seçmeli Başlasın',
        subtitle: '3.5T Kamyonet, Panelvan, 7T Kamyon, Eurocargo, S-Way Çekici veya T-Way Mikser/Hafriyat.',
        voiceover: 'Üstten araç grubunu seçip çoktan seçmeli adımlarla modelinizi belirleyin.',
        audioUrl: '/audio/wa-scenarios/kilavuz_1.mp3',
        accent: '#10b981',
        accentBg: 'rgba(16, 185, 129, 0.22)'
      },
      {
        badge: 'ADIM 2 / 4 • TEK/ÇİFT TEKER → KISA/ORTA/UZUN ŞASİ → VİTES',
        title: '2. Teker Tipini, Şasi Boyunu ve Vitesi Seçin',
        subtitle: '10 kart arasında kaybolmadan: 1. Çift/Tek Teker → 2. Kısa/Orta/Uzun Şasi → 3. Manuel/Otomatik!',
        voiceover: 'Teker tipini, kısa orta uzun şasi boyunu ve vitesinizi tek dokunuşla seçin.',
        audioUrl: '/audio/wa-scenarios/kilavuz_2.mp3',
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.22)'
      },
      {
        badge: 'ADIM 3 / 4 • KART İÇİ TAKSİT HESAPLA & SON DİP FİYATI SOR',
        title: "3. Kart İçinden Taksit Hesaplayın veya Dip Fiyatı Sorun",
        subtitle: 'TL veya İhracatçı Euro Kredisi taksitini görün, yeşil tuşla Can Murat’a son oluru sorun!',
        voiceover: 'Kartın içinden taksit hesaplayın veya yeşil tuşla son dip fiyatı sorun.',
        audioUrl: '/audio/wa-scenarios/kilavuz_3.mp3',
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.22)'
      },
      {
        badge: 'ADIM 4 / 4 • ŞİMDİ KENDİ TELEFONUNUZDA DENEYİN',
        title: 'Aşağıdaki Linke Dokunun, Hesabınızı Canlı Yapın!',
        subtitle: 'Karmaşık liste yok! Linke tıklayıp 3 adımda aracınızı, taksitinizi ve dip fiyatı görün.',
        voiceover: 'Aşağıdaki linke dokunun, kendi hesabınızı on saniyede canlı yapın!',
        audioUrl: '/audio/wa-scenarios/kilavuz_4.mp3',
        accent: '#22c55e',
        accentBg: 'rgba(34, 197, 94, 0.25)'
      }
    ]
  },
  {
    id: 'coktan_secmeli',
    dayLabel: '2. Senaryo • Kamyonet & 7T Kamyon Çoktan Seçmeli',
    shortTitle: '🛻 Tek/Çift Teker • Kısa/Orta/Uzun Şasi Seçici',
    refCode: 'wa_durum_coktan',
    urlBar: '🔒 iveco-fiyat-listesi.vercel.app — 3 Adımlı Kamyonet & 70C Kamyon Seçici',
    onlyLink: 'https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_coktan',
    caption:
      `🛻 Tek/Çift teker ve Kısa/Orta/Uzun şasiyi 3 adımda seçip 2026 IVECO fiyatını görün 👇\n\n` +
      `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_coktan`,
    steps: [
      {
        badge: 'ÇOKTAN SEÇMELİ 1 / 4 • 3.5T KAMYONET & 7T KAMYON',
        title: 'Uzun Listelerde Arama Yok: 3 Adımda Aracınız Hazır!',
        subtitle: 'Hem 3.5 Ton Kamyonette hem 7 Ton Daily 70C Kamyonda adım adım çoktan seçmeli sistem.',
        voiceover: 'Kamyonet ve yedi ton kamyonda karışıklık bitti, adım adım aracınızı seçin.',
        audioUrl: '/audio/wa-scenarios/coktan_secmeli_1.mp3',
        accent: '#38bdf8',
        accentBg: 'rgba(56, 189, 248, 0.22)'
      },
      {
        badge: 'ÇOKTAN SEÇMELİ 2 / 4 • TEKER TİPİ & ŞASİ BOYU SEÇİMİ',
        title: '1. Çift/Tek Teker → 2. Kısa / Orta / Uzun Şasi',
        subtitle: '35C Çift Teker (3.0 Motor) veya 35S Tek Teker; 3.5m Kısa, 4.3m Orta, 4.8m ve 5.9m Uzun Şasi!',
        voiceover: 'Önce çift teker veya tek tekeri, ardından kısa, orta, uzun şasiyi seçin.',
        audioUrl: '/audio/wa-scenarios/coktan_secmeli_2.mp3',
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.22)'
      },
      {
        badge: 'ÇOKTAN SEÇMELİ 3 / 4 • SON SEÇİM: MANUEL / OTOMATİK',
        title: '3. Manuel veya 8 İleri Otomatik Seçin, Kart Açılsın!',
        subtitle: 'Sadece seçtiğiniz aracın net peşin fiyatı, %20 KDV mahsubu ve taksit hesaplayıcısı açılır.',
        voiceover: 'Son adımda manuel veya otomatik vitesi seçip net fiyatı anında görün.',
        audioUrl: '/audio/wa-scenarios/coktan_secmeli_3.mp3',
        accent: '#10b981',
        accentBg: 'rgba(16, 185, 129, 0.22)'
      },
      {
        badge: 'ÇOKTAN SEÇMELİ 4 / 4 • HEMEN DENEYİN',
        title: 'Aşağıdaki Linke Tıklayın, 3 Adımda İveco’nuzu Seçin!',
        subtitle: 'İster 3.5 Ton Kamyonet ister 7 Ton Kamyon; kendi şasi boyunuzu seçip dip fiyat isteyin.',
        voiceover: 'Aşağıdaki linke tıklayın, üç adımda size en uygun İveco’yu bulun!',
        audioUrl: '/audio/wa-scenarios/coktan_secmeli_4.mp3',
        accent: '#22c55e',
        accentBg: 'rgba(34, 197, 94, 0.25)'
      }
    ]
  },
  {
    id: 'takas',
    dayLabel: '3. Senaryo • Kart İçi Takas + Kredi & 4 Resim',
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
    dayLabel: '4. Senaryo • 3-6 Ay Ödemesiz & %0 Faiz',
    shortTitle: '⏳ Şimdi Al, 6 Ay Sonra Öde',
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
        subtitle: 'Aracınız hemen kazandırmaya başlasın; ödemeniz 3 veya 6 ay sonra başlasın.',
        voiceover: 'Aracınızı bugün teslim alın, ilk taksitini altı ay sonra ödeyin!',
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
        voiceover: 'Anlaşmalı bankalarda bir milyon lira sıfır faiz fırsatını görün.',
        audioUrl: '/audio/wa-scenarios/odemesiz_3.mp3',
        accent: '#10b981',
        accentBg: 'rgba(16, 185, 129, 0.22)'
      },
      {
        badge: 'FİNANSMAN 4 / 4 • TÜM BANKALAR TEK EKRANDA',
        title: 'Şubeye Gitmeden Bankaları Telefonunuzda Kıyaslayın!',
        subtitle: 'Aşağıdaki linke tıklayın, istediğiniz kredi tutarını seçip taksitleri canlı görün.',
        voiceover: 'Şubeye gitmeden tüm bankaları kıyaslamak için aşağıdaki linke dokunun!',
        audioUrl: '/audio/wa-scenarios/odemesiz_4.mp3',
        accent: '#22c55e',
        accentBg: 'rgba(34, 197, 94, 0.25)'
      }
    ]
  },
  {
    id: 'kdv',
    dayLabel: '5. Senaryo • %20 KDV & Nakit İndirimi',
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
        voiceover: 'Üç yüz yirmi beş bin liraya varan nakit alım indirimini yakalayın.',
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
    id: 'ihracat_euro',
    dayLabel: '6. Senaryo • İhracatçıya Özel Euro (€) Kredisi',
    shortTitle: '💶 İhracatçı Euro (€) Kredisi • %0 Kâr Payı',
    refCode: 'ihracat_euro',
    urlBar: '🔒 iveco-fiyat-listesi.vercel.app/?loan=eur — İhracatçı Euro Kredisi',
    onlyLink: 'https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?loan=eur&ref=ihracat_euro',
    caption:
      `🇪🇺 İhracatçı firmalarımıza özel %0 kâr paylı & 6 ay ödemesiz Euro (€) kredisi taksit tablosu 👇\n\n` +
      `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?loan=eur&ref=ihracat_euro`,
    steps: [
      {
        badge: 'İHRACATÇI 1 / 4 • 32 SAYILI KARAR EURO (€) FİNANSMANI',
        title: 'İhracatçı & Döviz Gelirli Firmalara Euro (€) Kredisi!',
        subtitle: 'Yüksek TL faiz maliyetine girmeden tüm 2026 IVECO modellerinde Euro bazlı ticari kredi.',
        voiceover: 'İhracatçı ve döviz gelirli firmalarımıza özel Euro kredisi fırsatı başladı.',
        audioUrl: '/audio/wa-scenarios/ihracat_euro_1.mp3',
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.24)'
      },
      {
        badge: 'İHRACATÇI 2 / 4 • KART İÇİNDE EURO (€) TAKSİT HESABI',
        title: "Kart İçinde '💶 İhracatçı Euro (€) Kredisi' Sekmesi!",
        subtitle: '€15.000 - €75.000 peşinat ve 12-24-36-48 ay Euro taksitlerini aynı kart içinde görün.',
        voiceover: 'Kart içindeki hesaplayıcıdan Euro kredisini seçip aylık taksitinizi görün.',
        audioUrl: '/audio/wa-scenarios/ihracat_euro_2.mp3',
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.22)'
      },
      {
        badge: 'İHRACATÇI 3 / 4 • KUVEYT TÜRK %0 KÂR PAYI & 6 AY ÖDEMESİZ',
        title: 'Kuveyt Türk %0 Kâr Payı • Garanti BBVA • BNP Paribas',
        subtitle: 'S-Way Çekici, Eurocargo, T-Way ve Daily serisinde 6 ay ödemesiz veya 60 aya varan Euro vade.',
        voiceover: "Kuveyt Türk'te sıfır kâr payı veya altı ay ödemesiz Euro finansmanı kullanın.",
        audioUrl: '/audio/wa-scenarios/ihracat_euro_3.mp3',
        accent: '#10b981',
        accentBg: 'rgba(16, 185, 129, 0.22)'
      },
      {
        badge: 'İHRACATÇI 4 / 4 • EURO KREDİ EKRANINI AÇIN',
        title: 'Aşağıdaki Linkten Euro (€) Taksitinizi Canlı Görün!',
        subtitle: 'Linke dokunduğunuzda Euro (€) kredi hesaplayıcısı otomatik açık olarak gelir.',
        voiceover: 'İhracatçıya özel Euro taksit tablosu için aşağıdaki linke dokunun!',
        audioUrl: '/audio/wa-scenarios/ihracat_euro_4.mp3',
        accent: '#22c55e',
        accentBg: 'rgba(34, 197, 94, 0.25)'
      }
    ]
  },
  {
    id: 'santiye_tway',
    dayLabel: '7. Senaryo • 12 Teker T-Way Mikser, Damper & S-Way',
    shortTitle: '🏗️ 12 Teker Mikser 5.75M • Hafriyat 5.85M TL',
    refCode: 'beton_agrega',
    urlBar: '🔒 iveco-fiyat-listesi.vercel.app — Beton Santrali, Hafriyat & Çekici Serisi',
    onlyLink: 'https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?groups=tway,sway,daily35_chassis&ref=beton_agrega',
    caption:
      `🏗️ 12 Teker T-Way Mikser (5.75M TL) & Hafriyat (5.85M TL) -325 Bin TL nakit indirimi tablosu 👇\n\n` +
      `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?groups=tway,sway,daily35_chassis&ref=beton_agrega`,
    steps: [
      {
        badge: 'ŞANTİYE 1 / 4 • HAZIR BETON, MADEN & HAFRİYAT SERİSİ',
        title: '12 Teker (8x4) T-Way & S-Way Çekici Özel Vitrini!',
        subtitle: 'Beton santralleri, taş ocakları ve hafriyat filoları için 10mm çelik şasili ağır hizmet serisi.',
        voiceover: 'Hazır beton, hafriyat ve ağır nakliye filolarına özel şantiye serisi.',
        audioUrl: '/audio/wa-scenarios/santiye_tway_1.mp3',
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.24)'
      },
      {
        badge: 'ŞANTİYE 2 / 4 • 325.000 TL NAKİT ALIM İNDİRİMİ',
        title: '12 Teker Mikser 5.750.000 TL • Hafriyat 5.850.000 TL!',
        subtitle: '6.075.000 TL / 6.175.000 TL liste fiyatı yerine tam 325.000 TL nakit indirimiyle hemen teslim.',
        voiceover: 'On iki teker mikser ve hafriyat damperinde üç yüz yirmi beş bin lira nakit indirimi.',
        audioUrl: '/audio/wa-scenarios/santiye_tway_2.mp3',
        accent: '#10b981',
        accentBg: 'rgba(16, 185, 129, 0.22)'
      },
      {
        badge: 'ŞANTİYE 3 / 4 • ~975.000 TL %20 KDV & S-WAY ÇEKİCİ',
        title: 'S-Way 500/580 BG Çekici & ~975 Bin TL KDV Kalkanı!',
        subtitle: 'Üstyapıyı beklemeden şasi faturanızı hemen kesip ~975.000 TL KDV’yi verginizden düşün.',
        voiceover: 'S-Way çekici ve T-Way serisinde yüzde yirmi KDV kalkanıyla vergiden düşün.',
        audioUrl: '/audio/wa-scenarios/santiye_tway_3.mp3',
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.22)'
      },
      {
        badge: 'ŞANTİYE 4 / 4 • ŞANTİYE ÖZEL LİNKİNİ AÇIN',
        title: 'Aşağıdaki Linkten T-Way & S-Way Fiyatlarını İnceleyin!',
        subtitle: 'Yeşil "Son Oluru / Dip Fiyatı Sor" tuşuyla şantiyenize özel filo iskontosunu öğrenin.',
        voiceover: 'Şantiye ve çekici özel fiyat ekranımız için aşağıdaki linke tıklayın!',
        audioUrl: '/audio/wa-scenarios/santiye_tway_4.mp3',
        accent: '#22c55e',
        accentBg: 'rgba(34, 197, 94, 0.25)'
      }
    ]
  },
  {
    id: 'kantar',
    dayLabel: '8. Senaryo • 3.5T / 7T Kamyon / Eurocargo Kıyaslama',
    shortTitle: '⚖️ 3.5T, 7T Kamyon, Eurocargo & T-Way Fiyatları',
    refCode: 'wa_durum_kantar',
    urlBar: '🔒 iveco-fiyat-listesi.vercel.app — Gerçek Görselli Araç & Fiyat Kataloğu',
    onlyLink: 'https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_kantar',
    caption:
      `⚖️ 3.5T Kamyonet, 7T Kamyon, Eurocargo ve T-Way net peşin fiyatlarını karşılaştırın 👇\n\n` +
      `https://iveco-fiyat-listesi.vercel.app/fiyat-listesi?ref=wa_durum_kantar`,
    steps: [
      {
        badge: 'ARAÇ GRUBU 1 / 4 • B EHLİYET 3.5 TON KAMYONET & VAN',
        title: 'Daily 3.5 Ton Tek/Çift Teker & Kapalı Panelvan',
        subtitle: 'Çoktan seçmeli Kısa, Orta ve Uzun Şasi (1.905.000 TL’den başlayan peşin fiyatlarla).',
        voiceover: 'B ehliyetle kullanılan takograf muafiyetli üç buçuk ton kamyonet mi?',
        audioUrl: '/audio/wa-scenarios/kantar_1.mp3',
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.22)'
      },
      {
        badge: 'ARAÇ GRUBU 2 / 4 • 7 TON DAILY 70C & EUROCARGO',
        title: 'Daily 7 Ton Kamyon (Kısa/Orta/Uzun) & Eurocargo!',
        subtitle: '7 Ton Kamyonda 260.000 TL nakit indirimi (2.390.000 TL’den başlayan fiyat) ve Eurocargo serisi.',
        voiceover: 'Beş tona yakın yük taşıyan indirimli yedi ton kamyon mu?',
        audioUrl: '/audio/wa-scenarios/kantar_2.mp3',
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.22)'
      },
      {
        badge: 'ARAÇ GRUBU 3 / 4 • 12 TEKER T-WAY MİKSER & HAFRİYAT',
        title: '12 Teker Mikser 5.750.000 TL • Hafriyat 5.850.000 TL!',
        subtitle: 'Liste 6.075.000 TL / 6.175.000 TL yerine tam 325.000 TL Nakit Alım İndirimiyle!',
        voiceover: 'Yoksa on iki teker mikser ve hafriyat serisi mi? Hepsini inceleyin.',
        audioUrl: '/audio/wa-scenarios/kantar_3.mp3',
        accent: '#10b981',
        accentBg: 'rgba(16, 185, 129, 0.22)'
      },
      {
        badge: 'ARAÇ GRUBU 4 / 4 • KENDİ ARACINIZI SEÇİN',
        title: 'Aşağıdaki Linke Dokunun, Grubunuzu Seçip İnceleyin!',
        subtitle: '6 araç grubundan işinize uygun olana dokunun, peşin ve vadeli fiyatı anında görün.',
        voiceover: 'Aşağıdaki linke dokunun, işinize en uygun aracı canlı karşılaştırın!',
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
  const loadedImagesRef = useRef({});

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

  // Sistemdeki gerçek araç ve üstyapı görsellerini Canvas için belleğe yükle
  useEffect(() => {
    Object.entries(SYSTEM_IMAGE_URLS).forEach(([key, url]) => {
      if (loadedImagesRef.current[key]) return;
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        loadedImagesRef.current[key] = img;
      };
      img.src = url;
    });
  }, []);

  // Yuvarlatılmış beyaz/vitrin çerçeve içinde gerçek araç fotoğrafı çizen yardımcı
  const drawVehiclePhotoBox = (ctx, imgKey, x, y, w, h, radius = 14, borderColor = '#38bdf8', mode = 'contain', bg = '#ffffff') => {
    ctx.save();
    drawRoundedRect(ctx, x, y, w, h, radius);
    ctx.fillStyle = bg;
    ctx.fill();
    if (borderColor) {
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = borderColor;
      ctx.stroke();
    }
    ctx.clip();

    const img = loadedImagesRef.current[imgKey];
    if (img && img.complete && img.naturalWidth > 0) {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const pad = mode === 'contain' ? 6 : 0;
      const availW = w - pad * 2;
      const availH = h - pad * 2;
      const scale = mode === 'cover'
        ? Math.max(availW / iw, availH / ih)
        : Math.min(availW / iw, availH / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = x + (w - dw) / 2;
      const dy = y + (h - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.font = '800 20px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('IVECO 2026', x + w / 2, y + h / 2 + 7);
      ctx.textAlign = 'left';
    }
    ctx.restore();
  };

  // Ortak: Gerçek sistemdeki 6 Resimli Araç Grubu Seçici Gridini Çizer
  const drawSixPhotoCategoryGrid = (ctx, contentX, topY, contentW, activeIdx = 0) => {
    drawRoundedRect(ctx, contentX, topY, contentW, 325, 22);
    ctx.fillStyle = '#111d35';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = '900 22px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('👇 HANGİ ARAÇ GRUBUNA BAKIYORSUNUZ? (GERÇEK GÖRSELLİ SEÇİCİ)', contentX + 22, topY + 38);

    const cats = [
      { key: 'daily35_sasi', title: '3.5 Ton Kamyonet', sub: 'B Ehliyet • Tek/Çift Teker' },
      { key: 'daily_van', title: 'Kapalı Panelvan', sub: 'B Ehliyet • 12-18 m³' },
      { key: 'daily70', title: '7 Ton Kamyon', sub: 'Daily 70C • Kısa/Orta/Uzun' },
      { key: 'eurocargo', title: 'Eurocargo', sub: '10–18 Ton • 14–20 Palet' },
      { key: 'sway', title: 'S-Way Çekici (Tır)', sub: '500–580 BG • Uzun Yol' },
      { key: 'tway', title: 'Mikser & Hafriyat', sub: 'T-Way • 12 & 10 Teker' }
    ];

    cats.forEach((c, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const bx = contentX + 20 + col * 288;
      const by = topY + 54 + row * 128;
      const isHot = idx === activeIdx;

      drawRoundedRect(ctx, bx, by, 276, 116, 16);
      ctx.fillStyle = isHot ? 'rgba(2, 132, 199, 0.36)' : '#0b1324';
      ctx.fill();
      ctx.lineWidth = isHot ? 3.5 : 1.5;
      ctx.strokeStyle = isHot ? '#fde047' : 'rgba(148, 163, 184, 0.28)';
      ctx.stroke();

      // Sol tarafında gerçek araç fotoğrafı
      drawVehiclePhotoBox(ctx, c.key, bx + 10, by + 14, 88, 62, 10, isHot ? '#fde047' : '#38bdf8', 'contain');

      ctx.fillStyle = isHot ? '#fde047' : '#ffffff';
      ctx.font = '900 19px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(c.title, bx + 106, by + 38);

      ctx.fillStyle = isHot ? '#e0f2fe' : '#93c5fd';
      ctx.font = '700 15px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(c.sub, bx + 106, by + 64);

      if (isHot) {
        drawRoundedRect(ctx, bx + 106, by + 76, 110, 26, 8);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.fillStyle = '#052e16';
        ctx.font = '900 14px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('✓ SEÇİLDİ', bx + 124, by + 94);
      }
    });
  };

  // Ortak: Çoktan Seçmeli 3 Adımlı Sihirbaz Kutusu Çizer (Tek/Çift Teker -> Kısa/Orta/Uzun Şasi -> Manuel/Otomatik)
  const drawMultipleChoiceWizardBox = (ctx, contentX, topY, contentW, mode = 'kamyonet35', stepLocalT = 0.5) => {
    drawRoundedRect(ctx, contentX, topY, contentW, 470, 24);
    const grad = ctx.createLinearGradient(0, topY, 0, topY + 470);
    grad.addColorStop(0, '#132342');
    grad.addColorStop(1, '#0c172e');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = '900 24px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText(
      mode === 'daily70'
        ? '🚛 DAILY 7 TON KAMYON (70C) — ÇOKTAN SEÇMELİ ŞASİ & VİTES SEÇİCİ'
        : '🛻 3.5 TON KAMYONET — 3 ADIMDA ÇOKTAN SEÇMELİ ARAÇ SİHİRBAZI',
      contentX + 24,
      topY + 42
    );

    // 1. ADIM: TEKER / KABİN SEÇİMİ
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 19px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('1. ADIM — Teker / Model Tipi Seçin:', contentX + 24, topY + 78);

    const step1Opts = mode === 'daily70'
      ? [
          { title: '💪 70C Çift Teker Kamyon', sub: '4.8 Ton Yük • 3.0 Motor', active: true },
          { title: '🚐 70C Dev Panelvan (19.6 m³)', sub: '5.12m İç Boy • 180 BG', active: false },
          { title: '❄️ Klimalı & C-Profil Şasi', sub: '-260.000 TL Nakit İndirimli', active: false }
        ]
      : [
          { title: '💪 35C Çift Teker', sub: '3.0 Büyük Motor (160 BG)', active: stepLocalT < 0.7 },
          { title: '🛞 35S Tek Teker', sub: '2.3 Motor • -190B İndirim', active: stepLocalT >= 0.7 },
          { title: '👷 Çift Kabin (6+1)', sub: 'Ekip + 3.0m Açık Kasa', active: false }
        ];

    step1Opts.forEach((o, i) => {
      const ox = contentX + 24 + i * 284;
      const oy = topY + 90;
      drawRoundedRect(ctx, ox, oy, 272, 82, 14);
      ctx.fillStyle = o.active ? 'rgba(16, 185, 129, 0.28)' : '#091122';
      ctx.fill();
      ctx.lineWidth = o.active ? 3 : 1.5;
      ctx.strokeStyle = o.active ? '#4ade80' : '#334155';
      ctx.stroke();

      ctx.fillStyle = o.active ? '#4ade80' : '#ffffff';
      ctx.font = '900 20px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(o.title, ox + 16, oy + 34);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 16px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(o.sub, ox + 16, oy + 62);
    });

    // 2. ADIM: KISA / ORTA / UZUN ŞASİ SEÇİMİ
    ctx.fillStyle = '#fde047';
    ctx.font = '900 19px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('2. ADIM — Şasi Boyu (Kısa / Orta / Uzun) Seçin:', contentX + 24, topY + 206);

    const step2Opts = mode === 'daily70'
      ? [
          { title: '📏 Kısa Şasi (3750)', kasa: '4.1 – 4.3m Kasa Uygun', active: false },
          { title: '📐 Orta Şasi (4350)', kasa: '5.1 – 5.3m Kasa (10 Palet)', active: stepLocalT < 0.5 },
          { title: '🚛 Uzun Şasi (4750)', kasa: '5.6 – 5.9m Kasa (12 Palet)', active: stepLocalT >= 0.5 }
        ]
      : [
          { title: '📏 Kısa Şasi (3450)', kasa: '3.5 – 3.8 Metre Kasa', active: false },
          { title: '📐 Orta Şasi (3750)', kasa: '4.1 – 4.3 Metre Kasa', active: stepLocalT < 0.55 },
          { title: '🚛 Uzun Şasi (4100)', kasa: '4.5 – 4.8 Metre Kasa', active: stepLocalT >= 0.55 }
        ];

    step2Opts.forEach((o, i) => {
      const ox = contentX + 24 + i * 284;
      const oy = topY + 218;
      drawRoundedRect(ctx, ox, oy, 272, 86, 14);
      ctx.fillStyle = o.active ? 'rgba(245, 158, 11, 0.28)' : '#091122';
      ctx.fill();
      ctx.lineWidth = o.active ? 3 : 1.5;
      ctx.strokeStyle = o.active ? '#fde047' : '#334155';
      ctx.stroke();

      ctx.fillStyle = o.active ? '#fde047' : '#ffffff';
      ctx.font = '900 20px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(o.title, ox + 16, oy + 34);
      ctx.fillStyle = '#86efac';
      ctx.font = '800 16px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(o.kasa, ox + 16, oy + 64);
    });

    // 3. ADIM: SON SEÇİM (MANUEL / OTOMATİK VİTES)
    ctx.fillStyle = '#4ade80';
    ctx.font = '900 19px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('3. ADIM (SON SEÇİM) — Vites Tipini Seçin:', contentX + 24, topY + 338);

    const step3Opts = [
      { title: '⚙️ Manuel Vites', sub: '6 İleri Manuel Şanzıman', active: stepLocalT < 0.45 },
      { title: '⚡ Otomatik (Hi-Matic)', sub: '8 İleri Tam Otomatik', active: stepLocalT >= 0.45 },
      { title: '🔄 İkisini Karşılaştır', sub: 'Manuel & Otomatik Yan Yana', active: false }
    ];

    step3Opts.forEach((o, i) => {
      const ox = contentX + 24 + i * 284;
      const oy = topY + 350;
      drawRoundedRect(ctx, ox, oy, 272, 92, 14);
      ctx.fillStyle = o.active ? 'rgba(34, 197, 94, 0.28)' : '#091122';
      ctx.fill();
      ctx.lineWidth = o.active ? 3 : 1.5;
      ctx.strokeStyle = o.active ? '#22c55e' : '#334155';
      ctx.stroke();

      ctx.fillStyle = o.active ? '#4ade80' : '#ffffff';
      ctx.font = '900 20px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(o.title, ox + 16, oy + 36);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 16px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(o.sub, ox + 16, oy + 66);
    });
  };

  // Senaryo bazlı özel telefon içi ekran çizici
  const renderPhoneScreenContent = (ctx, scId, stepIdx, stepLocalT, phoneX, phoneY, phoneW) => {
    const contentX = phoneX + 34;
    const contentW = phoneW - 68;

    // 4. Adım tüm senaryolarda gerçek araç görsel vitrinli "Şimdi Linke Dokunun" final ekranıdır
    if (stepIdx === 3) {
      drawRoundedRect(ctx, contentX, phoneY + 108, contentW, 1110, 30);
      const ctaGrad = ctx.createLinearGradient(0, phoneY + 108, 0, phoneY + 1218);
      ctaGrad.addColorStop(0, '#0f291e');
      ctaGrad.addColorStop(1, '#091526');
      ctx.fillStyle = ctaGrad;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#22c55e';
      ctx.stroke();

      // Üstte 4 Gerçek Araç Fotoğraflı Mini Vitrin Şeridi
      const showcaseKeys = ['daily35_sasi', 'daily70', 'eurocargo_big', 'tway'];
      showcaseKeys.forEach((k, idx) => {
        drawVehiclePhotoBox(ctx, k, contentX + 36 + idx * 208, phoneY + 132, 194, 110, 14, '#4ade80', 'cover');
      });

      ctx.textAlign = 'center';
      ctx.fillStyle = '#4ade80';
      ctx.font = '900 26px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(`🚀 ${currentScenario.dayLabel.toUpperCase()}`, CANVAS_W / 2, phoneY + 282);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 38px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('2026 IVECO ÇOKTAN SEÇMELİ KATALOG', CANVAS_W / 2, phoneY + 332);
      ctx.fillText('& KART İÇİ TAKSİT / EURO KREDİ EKRANI', CANVAS_W / 2, phoneY + 378);

      const scenarioBullets = {
        kilavuz: [
          '✅  Resimli 6 araç grubundan işinize uygun olanı seçin',
          '✅  Çoktan Seçmeli: Tek/Çift Teker → Kısa/Orta/Uzun Şasi → Vites',
          '✅  Karttaki "💳 Taksit & Takas Hesapla" (TL & Euro Kredi) açın',
          '✅  Sayfa değişmeden aynı kart içinde taksitinizi görün',
          '✅  "💬 Son Oluru / Dip Fiyatı Sor" ile Can Murat’a ulaşın'
        ],
        coktan_secmeli: [
          '🛻  1. Adım: 35C Çift Teker, 35S Tek Teker veya Çift Kabin seçin',
          '📏  2. Adım: Kısa (3.5m), Orta (4.3m) veya Uzun Şasi (4.8m / 5.9m)',
          '⚙️  3. Adım: Manuel veya 8 İleri Otomatik (Hi-Matic) seçin',
          '🚛  Daily 7 Ton Kamyonda da Kısa / Orta / Uzun çoktan seçmeli!',
          '💬  Seçtiğiniz aracın kartından son dip fiyatı tek tuşla sorun'
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
          '⚡  Üstyapıyı beklemeden hemen ŞASİ faturası kesim avantajı',
          '📤  "Muhasebeye Gönder" ile KDV tablosunu müşavirinize atın',
          '📈  Devlete vergi yerine şirketinizin filosuna sıfır araç alın'
        ],
        ihracat_euro: [
          '🇪🇺  32 Sayılı Karar kapsamında İhracatçıya Özel Euro (€) Kredisi',
          '💶  Kart içinde "🇹🇷 TL Kredi | 💶 İhracatçı Euro Kredisi" sekmesi',
          '🔥  Kuveyt Türk %0 Kâr Payı veya 6 Ay Ödemesiz Euro Kredisi',
          '🏦  Garanti BBVA & BNP Paribas 12 - 24 - 36 - 48 Ay Euro Taksit',
          '💬  Euro ödeme planınızla birlikte özel filo dip fiyatını sorun'
        ],
        santiye_tway: [
          '🏗️  T-Way 12 Teker (8x4) Mikser: 5.750.000 TL (-325.000 TL İndirim)',
          '🪨  T-Way 12 Teker (8x4) Hafriyat: 5.850.000 TL (-325.000 TL İndirim)',
          '🛣️  S-Way 500 / 580 BG Çekici: €123.000’dan başlayan Euro fiyatı',
          '🧾  Şantiye grubunda araç başı ~975.000 TL %20 KDV mahsubu',
          '💬  Şantiyenize özel toplu alım ve son dip fiyatı hemen sorun'
        ],
        kantar: [
          '🚐  Daily 3.5 Ton: Çoktan Seçmeli Kısa/Orta/Uzun • 1.905.000 TL’den',
          '🚛  Daily 7 Ton Kamyon: Kısa/Orta/Uzun • 2.390.000 TL’den (-260B)',
          '🚚  Eurocargo (10–18 Ton • 14–20 Palet): 3.330.000 TL’den başlayan',
          '🏗️  T-Way 12 Teker Mikser & Hafriyat: 5.750.000 TL Nakit Fırsatı',
          '💳  Her araç kartının içinde tek tuşla TL & Euro taksit hesabı'
        ]
      };

      const bullets = scenarioBullets[scId] || scenarioBullets.kilavuz;
      ctx.textAlign = 'left';
      bullets.forEach((b, idx) => {
        const by = phoneY + 415 + idx * 82;
        drawRoundedRect(ctx, contentX + 38, by, contentW - 76, 66, 15);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.fill();
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '700 23px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(b, contentX + 60, by + 42);
      });

      const bounceY = Math.sin(stepLocalT * Math.PI * 6) * 12;
      drawRoundedRect(ctx, contentX + 40, phoneY + 860 + bounceY, contentW - 80, 175, 26);
      ctx.fillStyle = '#22c55e';
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#052e16';
      ctx.font = '900 35px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('👇 HEMEN AŞAĞIDAKİ LİNKE DOKUNUN!', CANVAS_W / 2, phoneY + 928 + bounceY);

      ctx.font = '800 25px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('iveco-fiyat-listesi.vercel.app', CANVAS_W / 2, phoneY + 986 + bounceY);

      ctx.fillStyle = '#fde047';
      ctx.font = '800 24px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('Satış Sorumlusu Can Murat • 0544 622 59 31 | IVECO ERC Samsun', CANVAS_W / 2, phoneY + 1145);
      ctx.textAlign = 'left';
      return;
    }

    // ── SENARYO 2 (ÇOKTAN SEÇMELİ KAMYONET & 7T KAMYON SİHİRBAZI) ÖZEL SAHNELERİ ──
    if (scId === 'coktan_secmeli') {
      if (stepIdx === 0) {
        drawSixPhotoCategoryGrid(ctx, contentX, phoneY + 102, contentW, stepLocalT < 0.5 ? 0 : 2);
        drawMultipleChoiceWizardBox(ctx, contentX, phoneY + 448, contentW, stepLocalT < 0.5 ? 'kamyonet35' : 'daily70', stepLocalT);

        drawRoundedRect(ctx, contentX + 36, phoneY + 1120, contentW - 72, 100, 20);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 26px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👆 Kamyonet ve 7 Ton Kamyonda 3 Adımlı Çoktan Seçmeli Sistem!', CANVAS_W / 2, phoneY + 1180);
        ctx.textAlign = 'left';
        return;
      }

      if (stepIdx === 1 || stepIdx === 2) {
        const is70Mode = stepIdx === 2 && stepLocalT >= 0.5;
        drawMultipleChoiceWizardBox(ctx, contentX, phoneY + 102, contentW, is70Mode ? 'daily70' : 'kamyonet35', stepLocalT);

        // Seçim Sonucu Açılan Gerçek Fotoğraflı Araç Kartı
        const cardY = phoneY + 592;
        drawRoundedRect(ctx, contentX, cardY, contentW, 505, 24);
        ctx.fillStyle = '#162544';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#22c55e';
        ctx.stroke();

        drawRoundedRect(ctx, contentX + 24, cardY + 20, contentW - 48, 44, 10);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
        ctx.fill();
        ctx.fillStyle = '#4ade80';
        ctx.font = '900 20px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('✅ SEÇİMİNİZE UYGUN ARAÇ KARTI ANINDA AÇILDI:', contentX + 40, cardY + 49);

        // Sağ üstte gerçek araç fotoğrafı
        drawVehiclePhotoBox(ctx, is70Mode ? 'daily70' : 'daily35_sasi', contentX + contentW - 235, cardY + 78, 210, 136, 16, '#38bdf8', 'contain');

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 30px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(
          is70Mode
            ? 'Daily 7 Ton Kamyon — Uzun Şasi (Otomatik)'
            : 'Daily 3.5 Ton Çift Teker — Uzun Şasi (Otomatik)',
          contentX + 26,
          cardY + 115
        );

        ctx.fillStyle = '#86efac';
        ctx.font = '800 20px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(
          is70Mode
            ? '5.6 – 5.9 Metre Kasa (12 Palet) • ~4.7 Ton Yük • 8 İleri Otomatik'
            : '4.5 – 4.8 Metre Kasa • 3.0 Büyük Motor (160 BG) • B Ehliyet',
          contentX + 26,
          cardY + 152
        );

        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 17px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(
          is70Mode
            ? 'Fabrika Kodu: IVECO DAILY 70 C 16 H A 8 CC 4750 Hi-Matic Klimalı'
            : 'Fabrika Kodu: IVECO DAILY 35 C 16 H 3.0 A 8 CC 4100 Hi-Matic',
          contentX + 26,
          cardY + 186
        );

        // Net Fiyat Kutusu
        drawRoundedRect(ctx, contentX + 24, cardY + 225, contentW - 48, 148, 16);
        ctx.fillStyle = '#0b1324';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.45)';
        ctx.stroke();

        ctx.fillStyle = '#4ade80';
        ctx.font = '900 20px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('NAKİT / PEŞİN FİYATI (-190B / -260B NAKİT İNDİRİMLİ):', contentX + 44, cardY + 262);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 20px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(is70Mode ? 'Liste / Kredili: 2.800.000 TL' : 'Liste / Kredili: 2.490.000 TL', contentX + 44, cardY + 296);

        ctx.fillStyle = '#4ade80';
        ctx.font = '900 42px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(is70Mode ? '2.540.000 TL' : '2.300.000 TL', contentX + contentW - 44, cardY + 288);
        ctx.textAlign = 'left';

        ctx.fillStyle = '#fcd34d';
        ctx.font = '800 19px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(
          is70Mode
            ? '🧾 Vergiden Düşülen %20 KDV: ~423.333 TL   |   🔥 Yeşil Tuşla Son Dip Fiyatı Sorun'
            : '🧾 Vergiden Düşülen %20 KDV: ~383.333 TL   |   🔥 Yeşil Tuşla Son Dip Fiyatı Sorun',
          contentX + 44,
          cardY + 346
        );

        // 2 Net Ana Buton
        drawRoundedRect(ctx, contentX + 24, cardY + 392, 410, 88, 16);
        ctx.fillStyle = '#0284c7';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 24px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💳 Taksit & Takas Hesapla', contentX + 229, cardY + 445);

        drawRoundedRect(ctx, contentX + 452, cardY + 392, 424, 88, 16);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText('💬 Son Oluru / Dip Fiyatı Sor', contentX + 664, cardY + 445);
        ctx.textAlign = 'left';

        drawRoundedRect(ctx, contentX + 36, phoneY + 1120, contentW - 72, 100, 20);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.fillStyle = '#052e16';
        ctx.font = '900 26px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👆 3 Adımda Seçin, Taksiti Görün & Son Dip Fiyatı Sorun!', CANVAS_W / 2, phoneY + 1180);
        ctx.textAlign = 'left';
        return;
      }
    }

    // ── SENARYO 6 (İHRACATÇI EURO € KREDİSİ) ÖZEL SAHNELERİ ──────────────────
    if (scId === 'ihracat_euro') {
      // Üstte İhracatçı Euro Kredisi Aktif Bandı + Gerçek S-Way & Eurocargo Fotoğrafı
      drawRoundedRect(ctx, contentX, phoneY + 104, contentW, 135, 20);
      ctx.fillStyle = 'rgba(30, 58, 138, 0.75)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#60a5fa';
      ctx.stroke();

      ctx.fillStyle = '#93c5fd';
      ctx.font = '900 20px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('🇪🇺 32 SAYILI KARAR • İHRACATÇI & DÖVİZ GELİRLİ FİRMALARA ÖZEL EURO (€) KREDİSİ', contentX + 24, phoneY + 144);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 26px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('Kuveyt Türk %0 Kâr Payı / 6 Ay Ödemesiz • Garanti BBVA • BNP Paribas', contentX + 24, phoneY + 186);
      ctx.fillStyle = '#fde047';
      ctx.font = '700 18px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('S-Way Çekici, Eurocargo, T-Way ve Daily serisinde kart içi canlı Euro (€) taksit hesabı!', contentX + 24, phoneY + 218);

      // Araç Kartı + Açık Euro Hesaplayıcı
      const cardY = phoneY + 258;
      drawRoundedRect(ctx, contentX, cardY, contentW, 835, 26);
      ctx.fillStyle = '#15233e';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#60a5fa';
      ctx.stroke();

      const isSway = stepIdx !== 1;
      drawVehiclePhotoBox(ctx, isSway ? 'sway' : 'eurocargo_big', contentX + contentW - 235, cardY + 22, 210, 128, 16, '#60a5fa', 'cover');

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 30px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(isSway ? 'S-Way 500 / 580 BG Çekici (Full Plus)' : 'Eurocargo 15–16 Ton Kamyon (18 Palet)', contentX + 26, cardY + 62);
      ctx.fillStyle = '#86efac';
      ctx.font = '800 20px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(isSway ? 'NET EURO FİYATI: €123.000 (+KDV)' : 'İhracatçı Euro Karşılığı: ~€98.500', contentX + 26, cardY + 102);
      ctx.fillStyle = '#93c5fd';
      ctx.font = '700 18px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('🇪🇺 İhracatçı Euro Kredisi: 12 - 24 - 36 - 48 Ay Euro Taksit', contentX + 26, cardY + 136);

      // Kart İçi Hesaplayıcı Kutusu (TL | EUR Sekmeli)
      const calcY = cardY + 168;
      drawRoundedRect(ctx, contentX + 22, calcY, contentW - 44, 642, 20);
      ctx.fillStyle = '#0b1324';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#60a5fa';
      ctx.stroke();

      // TL | EUR Sekme Seçici
      drawRoundedRect(ctx, contentX + 44, calcY + 20, 380, 56, 12);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '800 21px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🇹🇷 TL Ticari Kredi', contentX + 234, calcY + 56);

      drawRoundedRect(ctx, contentX + 440, calcY + 20, 416, 56, 12);
      ctx.fillStyle = '#2563eb';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#fde047';
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.font = '900 22px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('💶 İhracatçı Euro (€) Kredisi', contentX + 648, calcY + 56);
      ctx.textAlign = 'left';

      // 1. Euro Peşinat Seçimi
      ctx.fillStyle = '#fde68a';
      ctx.font = '800 21px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('1. Euro (€) Peşinat veya Takas Değeriniz:', contentX + 44, calcY + 114);

      const eurPresets = ['Peşinatsız', '€15.000', '€30.000', '€50.000', '€75.000'];
      eurPresets.forEach((p, i) => {
        const px = contentX + 44 + i * 164;
        const py = calcY + 128;
        const sel = i === 2; // €30.000
        drawRoundedRect(ctx, px, py, 152, 52, 10);
        ctx.fillStyle = sel ? '#f59e0b' : '#1e293b';
        ctx.fill();
        ctx.fillStyle = sel ? '#0f172a' : '#e2e8f0';
        ctx.font = '900 19px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p, px + 76, py + 33);
      });
      ctx.textAlign = 'left';

      // 2. Euro Vade Seçimi
      ctx.fillStyle = '#93c5fd';
      ctx.font = '800 21px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('2. Euro (€) Kredi Vadesi Seçin (32 Sayılı Karar):', contentX + 44, calcY + 220);

      const eurTerms = ['12 Ay (%0 Kâr Payı)', '24 Ay Euro', '36 Ay Euro', '48 Ay Euro'];
      const activeEurIdx = stepIdx === 2 ? 0 : 2;
      eurTerms.forEach((t, i) => {
        const tx = contentX + 44 + i * 206;
        const ty = calcY + 234;
        const sel = i === activeEurIdx;
        drawRoundedRect(ctx, tx, ty, 194, 56, 12);
        ctx.fillStyle = sel ? '#2563eb' : '#1e293b';
        ctx.fill();
        ctx.lineWidth = sel ? 2.5 : 1;
        ctx.strokeStyle = sel ? '#93c5fd' : '#334155';
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 18px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(t, tx + 97, ty + 35);
      });
      ctx.textAlign = 'left';

      // Euro Sonuç Kutusu
      drawRoundedRect(ctx, contentX + 44, calcY + 314, contentW - 88, 200, 18);
      ctx.fillStyle = 'rgba(30, 58, 138, 0.42)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#60a5fa';
      ctx.stroke();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '700 22px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('Araç Bedeli: €123.000   |   Peşinat / Takas: -€30.000   |   Kalan Kredi: €93.000', contentX + 66, calcY + 358);

      ctx.fillStyle = '#4ade80';
      ctx.font = '900 42px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(
        activeEurIdx === 0
          ? '12 Ay Euro Taksit (%0 Kâr Payı!): ~€7.750 / Ay'
          : '36 Ay Euro Taksit: ~€2.840 / Ay',
        contentX + 66,
        calcY + 422
      );

      ctx.fillStyle = '#fde047';
      ctx.font = '800 20px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('🇪🇺 Kuveyt Türk (%0 Kâr Payı / 6 Ay Ödemesiz), Garanti BBVA & BNP Paribas Euro Finansmanı', contentX + 66, calcY + 476);

      // Yeşil Gönder Butonu
      drawRoundedRect(ctx, contentX + 44, calcY + 534, contentW - 88, 86, 16);
      ctx.fillStyle = '#22c55e';
      ctx.fill();
      ctx.fillStyle = '#052e16';
      ctx.font = '900 27px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💬 Euro Kredi & Son Dip Fiyatı Can Murat’a Sor', CANVAS_W / 2, calcY + 588);
      ctx.textAlign = 'left';

      drawRoundedRect(ctx, contentX + 36, phoneY + 1120, contentW - 72, 100, 20);
      ctx.fillStyle = '#2563eb';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 26px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👆 İhracatçıya Özel Euro (€) Taksitini Kart İçinde Canlı Hesaplayın!', CANVAS_W / 2, phoneY + 1180);
      ctx.textAlign = 'left';
      return;
    }

    // ── SENARYO 7 (12 TEKER T-WAY MİKSER & HAFRİYAT + S-WAY ÇEKİCİ) SAHNELERİ ─
    if (scId === 'santiye_tway') {
      const heavyCards = [
        {
          img: 'tway',
          badge: '🏗️ 12 TEKER (8x4) BETON MİKSERİ ŞASİSİ (460 BG)',
          title: 'T-Way AD410T46 8x4 — 10–12 m³ Mikser Şasisi',
          sub: 'Kampanyalı Liste: 6.075.000 TL   |   Nakit İndirimi: -325.000 TL!',
          price: 'Nakit / Peşin: 5.750.000 TL   (🧾 %20 KDV: ~958.333 TL)',
          color: '#fde047',
          border: stepIdx === 0 ? '#fde047' : 'rgba(245, 158, 11, 0.45)'
        },
        {
          img: 'tway',
          badge: '🪨 12 TEKER (8x4) AĞIR HAFRİYAT & KAYA DAMPERİ (540 BG)',
          title: 'T-Way AD410T54 8x4 — 22–24 m³ Kaya Damperi',
          sub: 'Kampanyalı Liste: 6.175.000 TL   |   Nakit İndirimi: -325.000 TL!',
          price: 'Nakit / Peşin: 5.850.000 TL   (🧾 %20 KDV: ~975.000 TL)',
          color: '#4ade80',
          border: stepIdx === 1 ? '#4ade80' : 'rgba(16, 185, 129, 0.45)'
        },
        {
          img: 'sway',
          badge: '🛣️ S-WAY 500 / 580 BG UZUN YOL & LOWBED ÇEKİCİ',
          title: 'IVECO S-Way 500 & 580 BG Çekici (Full Plus / Diamond)',
          sub: 'Retarderli • 12 İleri Otomatik • TL veya İhracatçı Euro (€) Kredili',
          price: 'Net Euro Fiyatı: €123.000 (+KDV)   |   Euro Kredi Taksitli',
          color: '#60a5fa',
          border: stepIdx === 2 ? '#60a5fa' : 'rgba(59, 130, 246, 0.45)'
        }
      ];

      heavyCards.forEach((c, idx) => {
        const cy = phoneY + 104 + idx * 332;
        drawRoundedRect(ctx, contentX, cy, contentW, 312, 22);
        ctx.fillStyle = '#132038';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = c.border;
        ctx.stroke();

        // Sağ üstte gerçek T-Way / S-Way fotoğrafı
        drawVehiclePhotoBox(ctx, c.img, contentX + contentW - 210, cy + 18, 188, 118, 14, c.color, 'cover');

        ctx.fillStyle = c.color;
        ctx.font = '900 20px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(c.badge, contentX + 24, cy + 42);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 27px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(c.title, contentX + 24, cy + 84);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '700 19px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(c.sub, contentX + 24, cy + 122);

        drawRoundedRect(ctx, contentX + 24, cy + 148, contentW - 48, 72, 14);
        ctx.fillStyle = '#0b1324';
        ctx.fill();
        ctx.fillStyle = c.color;
        ctx.font = '900 26px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(c.price, contentX + 42, cy + 194);

        // 2 Ana Buton
        drawRoundedRect(ctx, contentX + 24, cy + 236, 412, 56, 12);
        ctx.fillStyle = '#0284c7';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 20px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💳 Taksit & Takas Hesapla', contentX + 230, cy + 271);

        drawRoundedRect(ctx, contentX + 452, cy + 236, 424, 56, 12);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText('💬 Son Oluru / Dip Fiyatı Sor', contentX + 664, cy + 271);
        ctx.textAlign = 'left';
      });

      drawRoundedRect(ctx, contentX + 36, phoneY + 1120, contentW - 72, 100, 20);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 26px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👆 Şantiye & Beton Filolarına Özel Son Dip Fiyatı Hemen Sorun!', CANVAS_W / 2, phoneY + 1180);
      ctx.textAlign = 'left';
      return;
    }

    // ── SENARYO 3 (TAKAS + KREDİ) ÖZEL SAHNELERİ ─────────────────────────────
    if (scId === 'takas') {
      if (stepIdx === 0 || stepIdx === 1) {
        const slideProgress = stepIdx === 0
          ? easeInOutQuad(Math.min(1, Math.max(0, (stepLocalT - 0.1) / 0.65)))
          : 1;
        const tradeInVal = Math.round((1000000 + slideProgress * 500000) / 50000) * 50000; // 1.0M -> 1.5M TL
        const zeroVehiclePrice = 2390000;
        const diffLoan = zeroVehiclePrice - tradeInVal;

        drawRoundedRect(ctx, contentX, phoneY + 106, contentW, 365, 24);
        ctx.fillStyle = '#162238';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#3b82f6';
        ctx.stroke();

        // Sağ üstte gerçek araç fotoğrafı
        drawVehiclePhotoBox(ctx, 'daily70', contentX + contentW - 195, phoneY + 120, 172, 95, 12, '#38bdf8', 'contain');

        ctx.fillStyle = '#93c5fd';
        ctx.font = '900 23px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('💳 KART İÇİ TAKSİT & TAKAS HESAPLAYICI', contentX + 30, phoneY + 152);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 27px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('Daily 7 Ton / 3.5 Ton Çift Teker Şasi', contentX + 30, phoneY + 190);

        // Hızlı Peşinat / Takas Butonları
        const quickBtns = ['Peşinatsız', '500 Bin', '1 Milyon', '1.5 Milyon', '2 Milyon'];
        quickBtns.forEach((qb, idx) => {
          const qx = contentX + 30 + idx * 168;
          const qy = phoneY + 228;
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

        drawRoundedRect(ctx, contentX + 30, phoneY + 298, contentW - 60, 74, 16);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 23px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('Seçilen Takas / Peşinat Tutarı:', contentX + 55, phoneY + 344);
        ctx.fillStyle = '#4ade80';
        ctx.font = '900 34px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(`${tradeInVal.toLocaleString('tr-TR')} TL`, contentX + 500, phoneY + 346);

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
          { label: 'Sıfır 2026 IVECO (Nakit İndirimli):', val: '2.390.000 TL', color: '#ffffff' },
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
        // 4 Resimle Takas Ekspertiz Ekranı (Gerçek Araç Görselli)
        drawRoundedRect(ctx, contentX, phoneY + 115, contentW, 950, 28);
        ctx.fillStyle = '#132038';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#3b82f6';
        ctx.stroke();

        drawVehiclePhotoBox(ctx, 'ustyapi_35', contentX + contentW - 205, phoneY + 135, 175, 110, 14, '#10b981', 'cover');

        ctx.fillStyle = '#60a5fa';
        ctx.font = '900 26px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('📸 WHATSAPP’TAN 4 RESİMLE TAKAS EKSPERTİZİ', contentX + 36, phoneY + 175);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 31px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('Sanayiye Gitmeden 15 Dk’da Fiyat Alın!', contentX + 36, phoneY + 225);

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
        ctx.font = '900 31px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💬 Son Oluru / Dip Fiyatı Sor — Takas Teklifi Al', CANVAS_W / 2, phoneY + 898);
        ctx.textAlign = 'left';

        ctx.font = '66px "Segoe UI Emoji", Arial';
        ctx.fillText('👆', CANVAS_W / 2 + 240, phoneY + 945);
        return;
      }
    }

    // ── SENARYO 4 (3-6 AY ÖDEMESİZ & 5 BANKA) ÖZEL SAHNELERİ ──────────────────
    if (scId === 'odemesiz') {
      if (stepIdx === 0 || stepIdx === 1) {
        drawRoundedRect(ctx, contentX, phoneY + 110, contentW, 960, 26);
        ctx.fillStyle = '#132038';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#f59e0b';
        ctx.stroke();

        drawVehiclePhotoBox(ctx, 'daily35_sasi', contentX + contentW - 210, phoneY + 130, 180, 112, 14, '#f59e0b', 'contain');

        ctx.fillStyle = '#fbbf24';
        ctx.font = '900 25px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('🏛️ KUVEYT TÜRK & 5 BANKA TİCARİ KREDİ TABLOSU', contentX + 34, phoneY + 172);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 32px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('3-6 Ay Ödemesiz & %0 Faizli Seçenekler', contentX + 34, phoneY + 224);

        const graceBoxes = [
          {
            title: '⏳ 3 AY ÖDEMESİZ DÖNEM SEÇENEĞİ',
            sub: 'Aracı şimdi teslim alın, ilk taksitinizi 3 ay sonra ödeyin!',
            detail: '1.000.000 TL - 5.000.000 TL Arası Kredi • %2,85 Kar Payı • 6-36 Ay Vade',
            color: '#4ade80',
            border: '#10b981'
          },
          {
            title: '🔥 6 AY ÖDEMESİZ DÖNEM (TL & EURO KREDİ)',
            sub: 'Aracınızı bugün teslim alın, ilk 6 ay boyunca taksit ödemeyin!',
            detail: '1.000.000 TL - 5.000.000 TL veya İhracatçı Euro (€) Kredisi • 12-36 Ay Vade',
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

    // ── SENARYO 8 (3.5T, 7T, EUROCARGO & 12 TEKER T-WAY) GERÇEK RESİMLİ SAHNELER ──
    if (scId === 'kantar') {
      const cards = [
        {
          img: 'daily35_sasi',
          badge: '🚐 1. GRUP: B EHLİYET & ÇOKTAN SEÇMELİ ŞASİ',
          title: 'Daily 3.5 Ton Tek/Çift Teker (Kısa / Orta / Uzun)',
          sub: 'Tek Teker Peşin: 1.905.000 TL  |  Çift Teker: 2.035.000 TL',
          price: '190.000 TL Nakit İndirimi + %20 KDV Avantajı',
          border: stepIdx === 0 ? '#3b82f6' : 'rgba(59, 130, 246, 0.4)',
          color: '#60a5fa'
        },
        {
          img: 'daily70',
          badge: '🚛 2. GRUP: 7 TON KAMYON (KISA/ORTA/UZUN) & EUROCARGO',
          title: 'Daily 7 Ton Kamyon (70C) & Eurocargo (10–18 Ton)',
          sub: '70C Kısa/Orta/Uzun Peşin: 2.390.000 TL (-260.000 TL İndirim!)',
          price: 'Eurocargo 10–18 Ton: 3.330.000 TL’den Başlayan Peşin',
          border: stepIdx === 1 ? '#f59e0b' : 'rgba(245, 158, 11, 0.4)',
          color: '#fbbf24'
        },
        {
          img: 'tway',
          badge: '🏗️ 3. GRUP: 12 TEKER (8x4) MİKSER & KAYA DAMPERİ',
          title: 'T-Way 12 Teker (8x4) Beton Mikseri & Hafriyat',
          sub: 'Mikser Liste: 6.075.000 TL  |  Nakit İndirimi: -325.000 TL!',
          price: 'Mikser Nakit: 5.750.000 TL  |  Hafriyat: 5.850.000 TL',
          border: stepIdx === 2 ? '#10b981' : 'rgba(16, 185, 129, 0.45)',
          color: '#4ade80'
        }
      ];

      cards.forEach((c, idx) => {
        const cy = phoneY + 106 + idx * 328;
        drawRoundedRect(ctx, contentX, cy, contentW, 306, 22);
        ctx.fillStyle = '#132038';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = c.border;
        ctx.stroke();

        // Sağ üstte gerçek araç fotoğrafı
        drawVehiclePhotoBox(ctx, c.img, contentX + contentW - 205, cy + 16, 182, 116, 14, c.color, 'contain');

        ctx.fillStyle = c.color;
        ctx.font = '900 20px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(c.badge, contentX + 26, cy + 44);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 27px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(c.title, contentX + 26, cy + 88);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '700 19px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(c.sub, contentX + 26, cy + 124);

        drawRoundedRect(ctx, contentX + 26, cy + 148, contentW - 52, 68, 14);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.fillStyle = c.color;
        ctx.font = '900 25px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText(c.price, contentX + 44, cy + 191);

        // 2 Sade Buton (Taksit & Takas Hesapla | Son Oluru / Dip Fiyatı Sor)
        drawRoundedRect(ctx, contentX + 26, cy + 234, 410, 54, 12);
        ctx.fillStyle = '#2563eb';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 20px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💳 Taksit & Takas Hesapla', contentX + 231, cy + 268);

        drawRoundedRect(ctx, contentX + 454, cy + 234, 412, 54, 12);
        ctx.fillStyle = '#16a34a';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText('💬 Son Oluru / Dip Fiyatı Sor', contentX + 660, cy + 268);
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

    // ── SENARYO 1 (GENEL KILAVUZ - YENİ ÇOKTAN SEÇMELİ & GÖRSELLİ SİSTEM) ────
    if (stepIdx === 0 && scId !== 'kdv') {
      // Üstte Gerçek Fotoğraflı 6 Araç Grubu Seçici Kutular
      const activeGroupIdx = stepLocalT < 0.5 ? 0 : 2;
      drawSixPhotoCategoryGrid(ctx, contentX, phoneY + 102, contentW, activeGroupIdx);

      // Altta Çoktan Seçmeli Sihirbaz Başlangıcı + Gerçek Araç Kartı Önizlemesi
      drawMultipleChoiceWizardBox(ctx, contentX, phoneY + 446, contentW, activeGroupIdx === 0 ? 'kamyonet35' : 'daily70', stepLocalT);

      // Parmak İkonu
      const fingerTargetX = stepLocalT < 0.5 ? contentX + 140 : contentX + 700;
      ctx.font = '60px "Segoe UI Emoji", Arial';
      ctx.fillText('👆', fingerTargetX, phoneY + 255);

      drawRoundedRect(ctx, contentX + 40, phoneY + 1110, contentW - 80, 110, 22);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 27px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👆 Üstten resimli araç grubunu seçin, 3 adımda aracınızı bulun!', CANVAS_W / 2, phoneY + 1176);
      ctx.textAlign = 'left';
      return;
    }

    if (stepIdx === 1 && scId !== 'kdv') {
      if (scId === 'kilavuz') {
        // Kılavuz 2. Adım: Çoktan Seçmeli Sihirbaz + Altta Açılan Araç Kartı
        drawMultipleChoiceWizardBox(ctx, contentX, phoneY + 104, contentW, 'kamyonet35', stepLocalT);

        const cardY = phoneY + 594;
        drawRoundedRect(ctx, contentX, cardY, contentW, 495, 24);
        ctx.fillStyle = '#162544';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#38bdf8';
        ctx.stroke();

        drawVehiclePhotoBox(ctx, 'daily35_sasi', contentX + contentW - 225, cardY + 24, 200, 130, 16, '#38bdf8', 'contain');

        ctx.fillStyle = '#4ade80';
        ctx.font = '900 20px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('✅ 3 ADIMDA SEÇİLEN KAMYONET:', contentX + 26, cardY + 50);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 30px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('Daily 3.5 Ton Çift Teker — Orta Şasi (Otomatik)', contentX + 26, cardY + 95);

        ctx.fillStyle = '#86efac';
        ctx.font = '800 20px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('4.1 – 4.3 Metre Kasa • 3.0 Büyük Motor • 8 İleri Otomatik', contentX + 26, cardY + 132);

        drawRoundedRect(ctx, contentX + 24, cardY + 172, contentW - 48, 138, 16);
        ctx.fillStyle = '#0b1324';
        ctx.fill();
        ctx.fillStyle = '#4ade80';
        ctx.font = '900 38px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('Net Fiyat: 2.170.000 TL  (🧾 KDV: ~361.667 TL)', contentX + 44, cardY + 235);
        ctx.fillStyle = '#fde047';
        ctx.font = '800 20px "Segoe UI", Inter, Arial, sans-serif';
        ctx.fillText('🔥 Peşin, takaslı veya referanslı alıma özel son dip fiyatı yeşil tuşla sorun 👇', contentX + 44, cardY + 284);

        drawRoundedRect(ctx, contentX + 24, cardY + 340, 412, 92, 16);
        ctx.fillStyle = '#0284c7';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 24px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💳 Taksit & Takas Hesapla', contentX + 230, cardY + 396);

        drawRoundedRect(ctx, contentX + 452, cardY + 340, 424, 92, 16);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText('💬 Son Oluru / Dip Fiyatı Sor', contentX + 664, cardY + 396);
        ctx.textAlign = 'left';

        drawRoundedRect(ctx, contentX + 40, phoneY + 1110, contentW - 80, 110, 22);
        ctx.fillStyle = '#2563eb';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 27px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👆 Teker tipini, şasi boyunu ve vitesi seçin; kartınız anında açılsın!', CANVAS_W / 2, phoneY + 1176);
        ctx.textAlign = 'left';
        return;
      }

      // Diğer Senaryolar 2. Adım: Kart İçinde Açılan Taksit & Takas Hesaplayıcı (TL + İhracatçı Euro Sekmeli)
      drawRoundedRect(ctx, contentX, phoneY + 108, contentW, 965, 26);
      ctx.fillStyle = '#162238';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#3b82f6';
      ctx.stroke();

      drawVehiclePhotoBox(ctx, 'daily35_sasi', contentX + contentW - 190, phoneY + 122, 164, 96, 12, '#38bdf8', 'contain');

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 29px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('🚐 Daily 3.5 Ton Çift Teker — Orta Şasi', contentX + 30, phoneY + 162);

      // Kart İçi Açılır Hesaplama Kutusu
      const boxY = phoneY + 234;
      drawRoundedRect(ctx, contentX + 26, boxY, contentW - 52, 810, 22);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#3b82f6';
      ctx.stroke();

      // TL | Euro Sekmesi
      drawRoundedRect(ctx, contentX + 52, boxY + 22, 375, 52, 10);
      ctx.fillStyle = '#0284c7';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 20px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🇹🇷 TL Ticari Kredi', contentX + 239, boxY + 55);

      drawRoundedRect(ctx, contentX + 440, boxY + 22, 412, 52, 10);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.fillText('💶 İhracatçı Euro (€) Kredisi', contentX + 646, boxY + 55);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#93c5fd';
      ctx.font = '900 23px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('1️⃣ PEŞİNAT VEYA TAKAS ARACINIZIN DEĞERİNİ SEÇİN:', contentX + 52, boxY + 114);

      const dpOptions = ['Peşinatsız (0 TL)', '500 Bin TL', '1 Milyon TL', '1.5 Milyon TL'];
      const activeDpIdx = stepLocalT < 0.45 ? 2 : 3;
      dpOptions.forEach((opt, idx) => {
        const ox = contentX + 52 + idx * 198;
        const oy = boxY + 132;
        const isSel = idx === activeDpIdx;
        drawRoundedRect(ctx, ox, oy, 186, 60, 14);
        ctx.fillStyle = isSel ? '#10b981' : '#1e293b';
        ctx.fill();
        ctx.fillStyle = isSel ? '#052e16' : '#e2e8f0';
        ctx.font = '900 20px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(opt, ox + 93, oy + 38);
      });
      ctx.textAlign = 'left';

      ctx.fillStyle = '#93c5fd';
      ctx.font = '900 23px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('2️⃣ KAÇ AY VADE İSTERSİNİZ?', contentX + 52, boxY + 240);

      const termOptions = ['12 Ay Vade', '24 Ay Vade', '36 Ay Vade'];
      const activeTermIdx = stepLocalT < 0.5 ? 1 : 2;
      termOptions.forEach((tOpt, idx) => {
        const tx = contentX + 52 + idx * 265;
        const ty = boxY + 258;
        const isSel = idx === activeTermIdx;
        drawRoundedRect(ctx, tx, ty, 248, 62, 14);
        ctx.fillStyle = isSel ? '#2563eb' : '#1e293b';
        ctx.fill();
        ctx.lineWidth = isSel ? 2.5 : 1;
        ctx.strokeStyle = isSel ? '#93c5fd' : '#334155';
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 23px "Segoe UI", Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(tOpt, tx + 124, ty + 40);
      });
      ctx.textAlign = 'left';

      // Canlı Sonuç Özeti
      const dpVal = activeDpIdx === 2 ? 1000000 : 1500000;
      const remLoan = 2390000 - dpVal;
      const months = activeTermIdx === 1 ? 24 : 36;
      const rate = 0.0285;
      const factor = Math.pow(1 + rate, months);
      const monthlyPayment = Math.round((remLoan * rate * factor) / (factor - 1));

      drawRoundedRect(ctx, contentX + 52, boxY + 345, contentW - 104, 195, 18);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#10b981';
      ctx.stroke();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '700 23px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(`Peşinat Sonrası Kalan Kredi: ${remLoan.toLocaleString('tr-TR')} TL  (${months} Ay)`, contentX + 78, boxY + 392);

      ctx.fillStyle = '#4ade80';
      ctx.font = '900 44px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText(`Aylık Taksit: ~${monthlyPayment.toLocaleString('tr-TR')} TL`, contentX + 78, boxY + 458);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '800 20px "Segoe UI", Inter, Arial, sans-serif';
      ctx.fillText('🔥 1M TL %0 Faiz, Kuveyt Türk 6 Ay Ödemesiz veya İhracatçı Euro Kredisi!', contentX + 78, boxY + 508);

      // Kart İçi Yeşil WhatsApp Gönder Butonu
      drawRoundedRect(ctx, contentX + 52, boxY + 565, contentW - 104, 96, 18);
      ctx.fillStyle = '#22c55e';
      ctx.fill();
      ctx.fillStyle = '#052e16';
      ctx.font = '900 27px "Segoe UI", Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💬 Son Dip Fiyat & Taksiti Can Murat’a Sor', CANVAS_W / 2, boxY + 623);
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

    // 3. Adım / KDV ve Muhasebe Sahnesi (Gerçek Araç Görselli + 2 Butonlu Sade Tasarım)
    drawRoundedRect(ctx, contentX, phoneY + 110, contentW, 955, 28);
    ctx.fillStyle = '#132038';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    drawVehiclePhotoBox(ctx, 'daily70', contentX + contentW - 225, phoneY + 132, 198, 124, 16, '#f59e0b', 'contain');

    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 22px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('⚖️ NAKİT İNDİRİMİ + %20 İNDİRİLEBİLİR KDV VERGİ KALKANI', contentX + 34, phoneY + 164);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 31px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('Daily 7 Ton Kamyon — Uzun Şasi', contentX + 34, phoneY + 214);
    ctx.fillStyle = '#86efac';
    ctx.font = '800 20px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('5.6 – 5.9 Metre Kasa (12 Palet) • 4.7 Ton Yük • Klimalı', contentX + 34, phoneY + 248);

    drawRoundedRect(ctx, contentX + 34, phoneY + 275, contentW - 68, 150, 20);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 23px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('Kredili Liste: 2.680.000 TL   |   Nakit İndirimi: -260.000 TL', contentX + 55, phoneY + 322);

    ctx.fillStyle = '#4ade80';
    ctx.font = '900 38px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('Net Peşin Fiyat: 2.420.000 TL (KDV Dahil)', contentX + 55, phoneY + 375);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 20px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('🏗️ T-Way 12 Teker Mikser: 5.750.000 TL Nakit (-325.000 TL İndirim!)', contentX + 55, phoneY + 408);

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
    drawRoundedRect(ctx, contentX + 34, phoneY + 655, 405, 105, 20);
    ctx.fillStyle = '#2563eb';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#93c5fd';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px "Segoe UI", Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💳 Taksit & Takas Hesapla', contentX + 236, phoneY + 717);

    drawRoundedRect(ctx, contentX + 465, phoneY + 655, 405, 105, 20);
    ctx.fillStyle = '#16a34a';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#86efac';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('💬 Son Oluru / Dip Fiyatı Sor', contentX + 667, phoneY + 717);

    drawRoundedRect(ctx, contentX + 34, phoneY + 790, contentW - 68, 98, 18);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 24px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('📞 Satış Sorumlusu Can Murat — 0544 622 59 31', CANVAS_W / 2, phoneY + 835);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 20px "Segoe UI", Inter, Arial, sans-serif';
    ctx.fillText('Peşin, kredili veya takaslı alımda size özel son dip fiyatı hemen sorun', CANVAS_W / 2, phoneY + 869);
    ctx.textAlign = 'left';

    ctx.font = '68px "Segoe UI Emoji", Arial';
    ctx.fillText('👆', contentX + 680, phoneY + 765);

    drawRoundedRect(ctx, contentX + 40, phoneY + 1110, contentW - 80, 110, 22);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    ctx.fillStyle = '#052e16';
    ctx.font = '900 27px "Segoe UI", Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("👆 '💬 Son Oluru / Dip Fiyatı Sor' tuşuyla Can Murat’a bağlanın!", CANVAS_W / 2, phoneY + 1176);
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
    const cacheKey = `${audioUrl}?v=ahmet_male_v5`;
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
                🎬 8 Akılcı Senaryolu, Gerçek Araç Görselli & Tok Erkek Spiker Sesli WhatsApp Durum Stüdyosu
              </h2>
              <p style={{ margin: 0, fontSize: '0.79rem', color: 'var(--text-secondary)' }}>
                Çoktan seçmeli yeni ekran görselleri, gerçek IVECO araç fotoğrafları, Ahmet AI erkek spiker sesi ve takip linki
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

        {/* ── 8 AKILCI SENARYO SEÇİCİ SEKMELER ─────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
