/**
 * B2B Dernek, Oda, Birlik & Kooperatif Özel İndirim Protokolleri
 * Satış Sorumlusu (IVECO ERC Samsun Otomotiv)
 *
 * Hem hazır protokolleri (SİMDER, Arıcılar Birliği, Şoförler Odası, Ziraat Odası vb.)
 * hem de Dashboard üzerinden anlık üretilen özel oranlı/tutarlı kampanyaları destekler.
 */

const CUSTOM_PARTNERS_STORAGE_KEY = 'iveco_crm_custom_partner_protocols_v1';

export const DEFAULT_PARTNER_PROTOCOLS = [
  {
    id: 'simder',
    shortName: 'SİMDER',
    fullName: 'SİMDER (Samsun İnşaatçılar ve Müteahhitler Derneği)',
    logoUrl: '/partners/simder-logo.png',
    icon: '🏗️',
    discountType: 'amount', // 'amount' (TL) | 'percent' (%)
    discountValue: 50000,
    defaultSector: 'insaat_malzeme',
    badgeColor: '#dc2626',
    extraPerk: 'SİMDER Üyelerine Özel Araç Başı 50.000 ₺ Protokol İndirimi + 1M TL %0 Faiz Avantajı'
  },
  {
    id: 'aricilar',
    shortName: 'Arıcılar Birliği',
    fullName: 'Samsun & Karadeniz Arıcılar Birliği Üyeleri',
    logoUrl: '',
    icon: '🐝',
    discountType: 'amount',
    discountValue: 50000,
    defaultSector: 'tarim_yem',
    badgeColor: '#f59e0b',
    extraPerk: 'Arıcılar Birliği Üyelerine Özel Araç Başı 50.000 ₺ İndirim + Kovan Taşımaya Uygun Uzun Şasi Avantajı'
  },
  {
    id: 'nakliyeciler',
    shortName: 'Şoförler & Nakliyeciler Odası',
    fullName: 'Samsun Şoförler Odası & Nakliyeciler Kooperatifi',
    logoUrl: '',
    icon: '🚛',
    discountType: 'amount',
    discountValue: 50000,
    defaultSector: 'kargo_dagitim',
    badgeColor: '#0284c7',
    extraPerk: 'Oda & Kooperatif Üyelerine Özel Araç Başı 50.000 ₺ Protokol İndirimi + Takas Desteği'
  },
  {
    id: 'ziraat',
    shortName: 'Ziraat Odası',
    fullName: 'Samsun, Bafra & Çarşamba Ziraat Odası Üyeleri',
    logoUrl: '',
    icon: '🌾',
    discountType: 'amount',
    discountValue: 50000,
    defaultSector: 'tarim_yem',
    badgeColor: '#10b981',
    extraPerk: 'Ziraat Odası Üyelerine Özel Araç Başı 50.000 ₺ Üretici İndirimi + Hasat Vadeli Kredi Seçenekleri'
  },
  {
    id: 'gida_hal',
    shortName: 'Gıda Toptancıları & Hal Derneği',
    fullName: 'Samsun Gıda Toptancıları & Sebze Meyve Hali Derneği',
    logoUrl: '',
    icon: '❄️',
    discountType: 'amount',
    discountValue: 50000,
    defaultSector: 'gida_frigo',
    badgeColor: '#38bdf8',
    extraPerk: 'Dernek Üyelerine Özel Araç Başı 50.000 ₺ Frigo & Kasa Şasi İndirimi'
  },
  {
    id: 'tso_osb',
    shortName: 'Samsun TSO & OSB Sanayi',
    fullName: 'Samsun TSO & Organize Sanayi Bölgesi İşletmeleri',
    logoUrl: '',
    icon: '🏭',
    discountType: 'percent',
    discountValue: 3,
    defaultSector: 'all',
    badgeColor: '#8b5cf6',
    extraPerk: 'OSB & Ticaret Odası Üyelerine Özel %3 Kurumsal Protokol İskontosu + Filo Kredi Desteği'
  },
  {
    id: 'smmm',
    shortName: 'SMMM & Mali Müşavirler',
    fullName: 'SMMM Odası & Mali Müşavir Mükelleflerine Özel Yıl Sonu Vergi Kalkanı Protokolü',
    logoUrl: '',
    icon: '👨‍💼',
    discountType: 'amount',
    discountValue: 50000,
    defaultSector: 'all',
    badgeColor: '#059669',
    extraPerk: 'Mali Müşavir Referanslı Mükelleflere Araç Başı 50.000 ₺ İndirim + %20 KDV & Tam Yıl Amortisman Şasi Faturası Avantajı'
  }
];

export function getSavedCustomPartners() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_PARTNERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomPartner(partnerObj) {
  if (typeof window === 'undefined' || !partnerObj?.shortName) return [];
  const current = getSavedCustomPartners();
  const id = partnerObj.id || `custom_${partnerObj.shortName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
  const entry = {
    id,
    shortName: partnerObj.shortName.trim(),
    fullName: (partnerObj.fullName || partnerObj.shortName).trim(),
    logoUrl: partnerObj.logoUrl || '',
    icon: partnerObj.icon || '🏛️',
    discountType: partnerObj.discountType === 'percent' ? 'percent' : 'amount',
    discountValue: Number(partnerObj.discountValue) || 50000,
    defaultSector: partnerObj.defaultSector || 'all',
    badgeColor: partnerObj.badgeColor || '#10b981',
    extraPerk: partnerObj.extraPerk || '',
    isCustom: true
  };
  const updated = [entry, ...current.filter(p => p.id !== id && p.shortName !== entry.shortName)].slice(0, 20);
  try {
    window.localStorage.setItem(CUSTOM_PARTNERS_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function deleteCustomPartner(partnerId) {
  if (typeof window === 'undefined') return [];
  const current = getSavedCustomPartners().filter(p => p.id !== partnerId);
  try {
    window.localStorage.setItem(CUSTOM_PARTNERS_STORAGE_KEY, JSON.stringify(current));
  } catch {}
  return current;
}

/**
 * URL SearchParams içinden aktif dernek/oda protokolünü çözer.
 * Örn: ?partner=simder veya ?partner=custom&pname=Ordu+Arıcılar+Birliği&pdisc=50000&pdisc_type=amount
 */
export function resolvePartnerFromSearchParams(searchParams) {
  if (!searchParams) return null;
  const partnerCode = (searchParams.get('partner') || searchParams.get('dernek') || searchParams.get('protokol') || '').trim();
  const customName = (searchParams.get('pname') || '').trim();
  const customShort = (searchParams.get('pshort') || '').trim();
  const discParam = searchParams.get('pdisc');
  const discTypeParam = searchParams.get('pdisc_type');
  const sectorParam = searchParams.get('psector') || searchParams.get('sector') || '';
  const noteParam = (searchParams.get('pnote') || '').trim();
  const iconParam = (searchParams.get('picon') || '').trim();

  if (!partnerCode && !customName) return null;

  const lowerCode = partnerCode.toLowerCase();
  const allPresets = [...DEFAULT_PARTNER_PROTOCOLS, ...getSavedCustomPartners()];
  const matchedPreset = allPresets.find(p => p.id.toLowerCase() === lowerCode || p.shortName.toLowerCase() === lowerCode);

  const discountType = discTypeParam === 'percent'
    ? 'percent'
    : discTypeParam === 'amount'
      ? 'amount'
      : (matchedPreset?.discountType || 'amount');

  const rawParsedDisc = discParam !== null && discParam !== '' && !isNaN(Number(discParam))
    ? Number(discParam)
    : (matchedPreset?.discountValue ?? 50000);
  // Güvenlik sınırı: URL parametresiyle aşırı/geçersiz indirim manipülasyonunu engelle
  const parsedDisc = discountType === 'percent'
    ? Math.min(10, Math.max(1, Math.round(rawParsedDisc)))
    : Math.min(100000, Math.max(5000, Math.round(rawParsedDisc)));

  const shortName = customShort || matchedPreset?.shortName || customName || partnerCode.toUpperCase();
  const shortLower = shortName.toLocaleLowerCase('tr-TR');
  const customFullLower = customName.toLocaleLowerCase('tr-TR');
  const stalePresetKeywords = ['arıcılar', 'aricilar', 'simder', 'şoförler', 'ziraat odası', 'gıda toptancıları', 'samsun tso', 'smmm'];
  const isStaleCustomName = Boolean(
    customShort &&
    customName &&
    stalePresetKeywords.some(kw => customFullLower.includes(kw) && !shortLower.includes(kw))
  );

  const isTransportCoop =
    shortLower.includes('taşıyıcı') ||
    shortLower.includes('tasiyici') ||
    shortLower.includes('nakliye') ||
    shortLower.includes('kooperatif') ||
    shortLower.includes('lojistik') ||
    shortLower.includes('şoför');

  const fullName = isStaleCustomName
    ? shortName
    : (customName || matchedPreset?.fullName || shortName);
  const logoUrl = matchedPreset?.logoUrl || (lowerCode.includes('simder') ? '/partners/simder-logo.png' : '');
  const rawIcon = iconParam || matchedPreset?.icon || '🏛️';
  const icon = (isStaleCustomName || (rawIcon === '🐝' && !shortLower.includes('arı') && !shortLower.includes('ari')))
    ? (isTransportCoop ? '🚛' : '🏛️')
    : rawIcon;
  const rawSector = sectorParam || matchedPreset?.defaultSector || 'all';
  const defaultSector = (isStaleCustomName || (rawSector === 'tarim_yem' && isTransportCoop))
    ? 'nakliye_lojistik'
    : rawSector;
  const badgeColor = matchedPreset?.badgeColor || '#10b981';

  const discountLabel = discountType === 'percent'
    ? `%${parsedDisc} Özel Üye İskontosu`
    : `Araç Başı ${parsedDisc.toLocaleString('tr-TR')} ₺ Üye İndirimi`;

  const generatedExtraPerk = `${shortName} Üyelerine Özel ${discountLabel} + 1M TL %0 Faiz Avantajı`;
  const extraPerk = (isStaleCustomName || (noteParam && noteParam.includes('50.000') && parsedDisc !== 50000))
    ? generatedExtraPerk
    : (noteParam || matchedPreset?.extraPerk || generatedExtraPerk);

  return {
    id: matchedPreset?.id || lowerCode || 'custom_partner',
    shortName,
    fullName,
    logoUrl,
    icon,
    discountType,
    discountValue: parsedDisc,
    discountLabel,
    defaultSector,
    badgeColor,
    extraPerk
  };
}

/**
 * Bir aracın fiyatına dernek/oda protokol indirimini uygular.
 */
export function calculatePartnerVehiclePricing(vehicle, partnerProtocol, tcmbEurRate = 38.5) {
  if (!vehicle || !partnerProtocol || vehicle.isCustomPrice) {
    return null;
  }

  const isEur = vehicle.currency === 'EUR';
  if (isEur) {
    const baseEur = vehicle.eurPrice || vehicle.cashPrice || 0;
    if (!baseEur) return null;
    const baseTl = Math.round(baseEur * tcmbEurRate);
    const discountTl = partnerProtocol.discountType === 'percent'
      ? Math.round(baseTl * (partnerProtocol.discountValue / 100))
      : Math.round(partnerProtocol.discountValue);
    const discountEur = partnerProtocol.discountType === 'percent'
      ? Math.round(baseEur * (partnerProtocol.discountValue / 100))
      : Math.max(100, Math.round(discountTl / (tcmbEurRate || 38.5)));
    const finalEur = Math.max(0, baseEur - discountEur);
    const finalTl = Math.max(0, baseTl - discountTl);
    return {
      isEur: true,
      baseEur,
      baseTl,
      discountEur,
      discountTl,
      finalEur,
      finalTl,
      discountBadgeText: partnerProtocol.discountType === 'percent'
        ? `%${partnerProtocol.discountValue} ${partnerProtocol.shortName} İndirimi (-€${discountEur.toLocaleString('tr-TR')})`
        : `-${discountTl.toLocaleString('tr-TR')} ₺ (≈ €${discountEur.toLocaleString('tr-TR')}) ${partnerProtocol.shortName} İndirimi`
    };
  }

  const baseCampaign = vehicle.campaignPrice || vehicle.cashPrice || 0;
  const baseCash = vehicle.cashPrice || vehicle.campaignPrice || 0;
  if (!baseCash) return null;

  const discountTl = partnerProtocol.discountType === 'percent'
    ? Math.round(baseCash * (partnerProtocol.discountValue / 100))
    : Math.round(partnerProtocol.discountValue);

  const finalCampaign = Math.max(0, baseCampaign - discountTl);
  const finalCash = Math.max(0, baseCash - discountTl);

  return {
    isEur: false,
    baseCampaign,
    baseCash,
    discountTl,
    finalCampaign,
    finalCash,
    discountBadgeText: partnerProtocol.discountType === 'percent'
      ? `%${partnerProtocol.discountValue} ${partnerProtocol.shortName} İndirimi (-${discountTl.toLocaleString('tr-TR')} ₺)`
      : `-${discountTl.toLocaleString('tr-TR')} ₺ ${partnerProtocol.shortName} Üye İndirimi`
  };
}

/**
 * Dashboard veya Asistan üzerinden seçilen dernek ayarlarıyla paylaşılabilir takip linki üretir.
 */
export function buildPartnerShareUrl(origin, config) {
  const baseOrigin = (origin || 'https://iveco-crm.onrender.com').replace(/\/$/, '');
  const params = new URLSearchParams();

  const partnerId = (config.id || 'custom').toLowerCase();
  params.set('partner', partnerId);

  // Eğer varsayılan preset'ten farklı bir isim/tutar girildiyse veya custom ise URL'e ekle
  const defaultMatch = DEFAULT_PARTNER_PROTOCOLS.find(p => p.id === partnerId);
  if (!defaultMatch || config.fullName !== defaultMatch.fullName) {
    params.set('pname', config.fullName || config.shortName);
  }
  if (!defaultMatch || config.shortName !== defaultMatch.shortName) {
    params.set('pshort', config.shortName);
  }
  if (!defaultMatch || Number(config.discountValue) !== Number(defaultMatch.discountValue)) {
    params.set('pdisc', String(config.discountValue));
  }
  if (!defaultMatch || config.discountType !== defaultMatch.discountType) {
    params.set('pdisc_type', config.discountType);
  }
  if (config.defaultSector && config.defaultSector !== 'all') {
    params.set('sector', config.defaultSector);
  }
  if (config.extraPerk && (!defaultMatch || config.extraPerk !== defaultMatch.extraPerk)) {
    params.set('pnote', config.extraPerk);
  }
  if (config.icon && (!defaultMatch || config.icon !== defaultMatch.icon)) {
    params.set('picon', config.icon);
  }

  const slug = (config.shortName || partnerId)
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
    .slice(0, 36)
    .replace(/_$/g, '');

  params.set('ref', `protokol_${slug || partnerId}`);

  return `${baseOrigin}/fiyat-listesi?${params.toString()}`;
}

/**
 * Dernek / Oda / Birlik WhatsApp Grubu veya Üye Duyuru Mesajı Üretir
 */
export function buildPartnerAnnouncementText(origin, config) {
  const link = buildPartnerShareUrl(origin, config);
  const discText = config.discountType === 'percent'
    ? `*%${config.discountValue} Kurumsal Protokol İskontosu*`
    : `*Araç Başına ${Number(config.discountValue).toLocaleString('tr-TR')} TL Özel Protokol İndirimi*`;

  const lowerId = `${config.id || ''} ${config.shortName || ''}`.toLowerCase();
  if (lowerId.includes('smmm') || lowerId.includes('müşavir') || lowerId.includes('musavir') || lowerId.includes('muhasebe')) {
    return (
      `👨‍💼 *Değerli Mali Müşavirimiz / SMMM Meslek Mensubumuz,*\n\n` +
      `Yıl sonu vergi planlaması döneminde yüksek *KDV* veya *Gelir/Kurumlar Vergisi* çıkacak mükellefleriniz için IVECO ERC Samsun Otomotiv olarak hazırladığımız *2026 Ticari Araç Vergi Kalkanı & Kampanya Tablomuzu* bilgilerinize sunarız:\n\n` +
      `🧾 *1. %20 İndirilecek KDV Avantajı:* Ticari şasi kamyon, panelvan ve çekici faturalarımızdaki *%20 KDV (~410.000 TL - 1.150.000 TL)* binek araç kısıtlamasına takılmadan tek seferde mükellefinizin ödenecek KDV'sinden düşülebilir.\n` +
      `📉 *2. Kıst Amortisman Yok — 1. Yıl Tam Amortisman:* Binek araçların aksine ticari araçlarımızda kıst amortisman sınırı yoktur; Aralık ayında kesilen faturada dahi *1. yıl tam (%20) amortisman* doğrudan gider yazılabilir.\n` +
      `⚡ *3. Üstyapıyı Beklemeden "Hemen Şasi Faturası" İmkanı:* Kasa, frigo veya tente üstyapısının tamamlanmasını beklemeden *ŞASİ faturasını yıl bitmeden hemen kesiyoruz*; mükellefiniz vergi avantajını bu yıl kullanırken üstyapısını dilediği zaman yaptırabiliyor.\n` +
      `💳 *4. Mükellefinize Özel İndirim & %0 Faiz:* Referansınızla gelen mükelleflerinize ${discText} ve *1.000.000 TL 12 Ay %0 Faiz (83.333 TL/Ay)* kredi imkanı tanımlanmıştır.\n\n` +
      `📞 *Satış Sorumlusu Can Murat — 0544 622 59 31 | IVECO ERC Samsun Otomotiv*\n` +
      `👇 *Model bazlı net KDV matrahı, indirilecek KDV ve kampanya tablosunu incelemek veya mükellefinizle paylaşmak için tıklayın:*\n\n` +
      `${link}`
    );
  }

  const rawShort = (config.shortName || 'Özel Protokol').trim();
  const rawFull = (config.fullName || rawShort).trim();
  const shortLower = rawShort.toLocaleLowerCase('tr-TR');
  const fullLower = rawFull.toLocaleLowerCase('tr-TR');
  const staleKeywords = ['arıcılar', 'aricilar', 'simder', 'şoförler', 'ziraat odası', 'gıda toptancıları', 'samsun tso', 'smmm'];
  const isMismatchedFull = staleKeywords.some(kw => fullLower.includes(kw) && !shortLower.includes(kw));
  const cleanTitle = (isMismatchedFull ? rawShort : rawFull).replace(/\s+Üyeleri$/i, '').trim();

  return (
    `${config.icon || '🚛'} *${cleanTitle} — Değerli Üyelerimize Özel IVECO 2026 Kampanyası!*\n\n` +
    `IVECO ERC Samsun Otomotiv ile yapılan özel iş birliği kapsamında, tüm *${rawShort}* üyelerimize 2026 model sıfır IVECO ticari araç alımlarında ${discText} tanımlanmıştır! 🚛\n\n` +
    `*${rawShort} Üyelerine Özel Dijital Ekranımızda Neler Var?*\n` +
    `✅ Tüm araçlarda *${rawShort} Üye İndirimi düşülmüş* net protokol fiyatlarını ve *%20 İndirilecek KDV* tutarlarını anında görün,\n` +
    `🔄 Elinizdeki mevcut aracın takas değerini düşüp *1.000.000 TL 12 Ay %0 Faiz (83.333 TL/Ay)* veya *6 Ay Ödemesiz* banka oranlarıyla kalan taksitinizi 10 saniyede hesaplayın,\n` +
    `📸 Takasa vereceğiniz aracın *4 resmini (1 dıştan, 1 içten, KM ve ruhsat)* yükleyip 15 dakikada takas ön fiyatı alın,\n` +
    `🔒 Beğendiğiniz şasiyi ve üye indirimini 24 saat ücretsiz adınıza opsiyonlayın 👇\n\n` +
    `📞 *Satış Sorumlusu Can Murat — 0544 622 59 31 | IVECO ERC Samsun Otomotiv*\n\n` +
    `${link}`
  );
}
