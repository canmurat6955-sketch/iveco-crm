/**
 * WhatsApp Deep-Link & Modal Utility
 * Ensures every WhatsApp action in the CRM opens the Information & Customer Entry Screen.
 */

import { getPublicOrigin } from './publicUrl';
import { crmApi } from '../api/client';

export function getWhatsAppUrl(phone, text = '') {
  if (!phone) return '#';
  const digits = String(phone).replace(/\D/g, '');
  const clean = digits.length >= 10 ? digits.slice(-10) : digits;
  const fullPhone = `90${clean}`;
  const encodedText = text ? encodeURIComponent(text) : '';
  return `whatsapp://send?phone=${fullPhone}${encodedText ? `&text=${encodedText}` : ''}`;
}

/**
 * Directly launches the native WhatsApp Desktop / Mobile app via deep link.
 * Used internally by WhatsAppActionModal when the user hits 'Gönder / Aç'.
 */
export function launchNativeWhatsApp(phone, text = '') {
  const url = getWhatsAppUrl(phone, text);
  if (url && url !== '#') {
    window.location.href = url;
  }
}

/**
 * Universal WhatsApp trigger.
 * Opens the WhatsApp & Customer Information Modal so sales reps can view/edit customer details,
 * pick proposal templates, and save post-chat notes.
 *
 * If options.skipModal is true, launches the native WhatsApp app directly.
 */
export function openWhatsApp(phone, text = '', options = {}) {
  if (options?.skipModal) {
    launchNativeWhatsApp(phone, text);
    return;
  }

  let cust = options.customer;
  if (!cust) {
    if (typeof phone === 'object' && phone !== null) {
      cust = phone;
    } else {
      cust = { phone: String(phone || ''), company_name: '' };
    }
  }

  // Dispatch custom event to open the information & record modal
  window.dispatchEvent(new CustomEvent('open-whatsapp-modal', {
    detail: {
      customer: cust,
      vehicleTitle: options.vehicleTitle || '',
      interestId: options.interestId || null,
      defaultStatus: options.defaultStatus || 'offer_given',
      defaultMessage: text || options.defaultMessage || '',
      onSuccess: options.onSuccess
    }
  }));
}

export function detectCustomerSectorKey(cust) {
  if (!cust) return 'all';
  const text = `${cust.sector || ''} ${cust.company_name || ''} ${cust.sales_notes || ''} ${cust.note || ''}`.toLowerCase();
  if (text.includes('gıda') || text.includes('gida') || text.includes('frigo') || text.includes('süt') || text.includes('et') || text.includes('market') || text.includes('meşrubat')) return 'gida_frigo';
  if (text.includes('kargo') || text.includes('dağıtım') || text.includes('dagitim') || text.includes('mobilya') || text.includes('nakliyat')) return 'kargo_dagitim';
  if (text.includes('inşaat') || text.includes('insaat') || text.includes('nalbur') || text.includes('kereste') || text.includes('demir') || text.includes('hırdavat') || text.includes('sanayi')) return 'insaat_malzeme';
  if (text.includes('tarım') || text.includes('tarim') || text.includes('yem') || text.includes('un') || text.includes('fındık') || text.includes('çeltik') || text.includes('gübre')) return 'tarim_yem';
  if (text.includes('kurtarma') || text.includes('yol yardım') || text.includes('oto çekici')) return 'oto_kurtarma';
  if (text.includes('hafriyat') || text.includes('şantiye') || text.includes('santiye') || text.includes('maden') || text.includes('beton') || text.includes('agrega') || text.includes('damper')) return 'hafriyat_santiye';
  if (text.includes('uluslararası') || text.includes('tır') || text.includes('lojistik')) return 'agir_nakliye';
  return 'all';
}

export function buildCustomerVipPortalLink(cust, sectorOverride) {
  if (!cust) return '';
  const origin = getPublicOrigin();
  const cleanPhone = cust.phone ? String(cust.phone).replace(/\D/g, '') : '';
  const secKey = sectorOverride || detectCustomerSectorKey(cust);
  const secParam = secKey && secKey !== 'all' ? `&sector=${encodeURIComponent(secKey)}` : '';
  const companyName = cust.company_name || cust.customer_name || '';
  const cid = cust.id || cust.customer_id || '';
  return `${origin}/fiyat-listesi?cid=${cid}&company=${encodeURIComponent(companyName)}&phone=${cleanPhone}${secParam}&ref=muratonay`;
}

const SECTOR_TITLES = {
  gida_frigo: 'Gıda & Soğuk Zincir Dağıtım',
  kargo_dagitim: 'Kargo, Dağıtım & Nakliye',
  insaat_malzeme: 'İnşaat, Nalbur & Sanayi',
  tarim_yem: 'Tarım, Yem & Tonajlı Taşımacılık',
  oto_kurtarma: 'Oto Kurtarma & Yol Yardım',
  hafriyat_santiye: 'Hafriyat & Şantiye',
  agir_nakliye: 'Uzun Yol & Uluslararası Lojistik'
};

export function buildVipPortalMessageByTone(cust, tone = 'new_lead', sectorOverride) {
  const companyName = cust?.company_name || cust?.customer_name || 'Yetkili';
  const secKey = sectorOverride || detectCustomerSectorKey(cust);
  const secLabel = SECTOR_TITLES[secKey] ? `*${SECTOR_TITLES[secKey]}* operasyonunuza özel süzülmüş ` : 'işletmenize özel ';
  const vipLink = buildCustomerVipPortalLink(cust, secKey);

  if (tone === 'friendly') {
    return (
      `Abi merhaba, hayırlı işler dilerim.\n\n` +
      `IVECO ERC Samsun'da işini çok kolaylaştıracak yeni bir canlı ekran açtık. Artık 2026 model şasi fiyatlarına bakmak veya elindeki aracın takas değerini düşüp kalan kredi taksitini görmek için beni aramana bile gerek yok :)\n\n` +
      `Aşağıdaki sana özel linkten elindeki aracın takasını seçip 1M TL %0 faizle kalan ödemeyi 10 saniyede kendin hesaplayabilir, istersen 3 fotoğraf gönderip 15 dk'da takas fiyatı alabilirsin:\n\n` +
      `👉 ${vipLink}\n\n` +
      `Kafana yatan bir model olursa ekrandaki tek tuşla bana düşüyor zaten. Bol kazançlar!\n` +
      `*Satış Sorumlusu Can M. - 0544 622 59 31*`
    );
  }

  if (tone === 'corporate_fleet') {
    return (
      `Sayın *${companyName}* Yönetimi,\n\n` +
      `Ben IVECO ERC Samsun Otomotiv Satış Sorumlusu *Can M.* (0544 622 59 31).\n\n` +
      `Çoklu araç yatırımlarınız ve 2026 filo yenileme planlarınız kapsamında; ${secLabel}filo iskontosu, mali müşavirinize tek tıkla iletebileceğiniz %20 KDV vergi kalkanı & amortisman özeti, 5 yıllık yakıt (TCO) analizi ve takas + ticari kredi simülasyonunu içeren kurumsal bağlantınızı bilgilerinize sunarım:\n\n` +
      `👉 ${vipLink}\n\n` +
      `İhtiyacınıza özel proforma çalışması veya iş yerinizde/online görüşme randevusu için bağlantı üzerinden doğrudan talep oluşturabilirsiniz.\n\n` +
      `Saygılarımla,\n*Satış Sorumlusu Can M. - 0544 622 59 31*\n*IVECO ERC Samsun Otomotiv*`
    );
  }

  // Varsayılan: 'new_lead' (Yeni Müşteri / İlk Temas)
  return (
    `Sayın *${companyName}*,\n\n` +
    `Ben IVECO ERC Samsun Otomotiv Satış Sorumlusu *Can M.* (0544 622 59 31).\n\n` +
    `Firmanız için hazırladığım ${secLabel}2026 model IVECO şasi fiyat listesini, takas + %0 faizli kredi hesaplayıcısını ve 3 fotoğrafla 15 dakikada takas ön değerleme ekranımızı aşağıdaki size özel bağlantıdan inceleyebilirsiniz:\n\n` +
    `👉 ${vipLink}\n\n` +
    `Beğendiğiniz modeli 24 saat ücretsiz adınıza opsiyonlayabilir veya bu mesaj üzerinden bana doğrudan ulaşabilirsiniz.\n\n` +
    `İyi çalışmalar dilerim.\n*Satış Sorumlusu Can M. - 0544 622 59 31*\n*IVECO ERC Samsun Otomotiv*`
  );
}

export function sendCustomerVipPortalWhatsApp(cust, options = {}) {
  if (!cust?.phone) return;
  const secKey = options.sector || detectCustomerSectorKey(cust);
  const tone = options.tone || 'new_lead';
  const msg = buildVipPortalMessageByTone(cust, tone, secKey);

  const cid = cust.id || cust.customer_id;
  const followUpDate48h = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  if (cid) {
    const sectorNote = SECTOR_TITLES[secKey] ? ` (${SECTOR_TITLES[secKey]})` : '';
    crmApi.createInteraction(cid, {
      interaction_type: 'whatsapp',
      notes: `[WhatsApp] VIP Dijital Showroom & 2026 Fiyat/Kredi Hesaplayıcı Linki gönderildi${sectorNote}.`,
      next_action: '48 Saat Unutma Kalkanı: VIP Katalog & Teklif geri dönüş takibi',
      next_action_date: followUpDate48h
    }).catch(() => {});
  }

  openWhatsApp(cust.phone, msg, {
    customer: cust,
    skipModal: Boolean(options.skipModal),
    onSuccess: options.onSuccess
  });
}

