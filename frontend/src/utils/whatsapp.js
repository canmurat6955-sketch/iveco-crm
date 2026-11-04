/**
 * WhatsApp Deep-Link & Modal Utility
 * Ensures every WhatsApp action in the CRM opens the Information & Customer Entry Screen.
 */

import { getPublicOrigin } from './publicUrl';

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

export function sendCustomerVipPortalWhatsApp(cust, options = {}) {
  if (!cust?.phone) return;
  const companyName = cust.company_name || cust.customer_name || 'Yetkili';
  const secKey = options.sector || detectCustomerSectorKey(cust);
  const sectorTitles = {
    gida_frigo: 'Gıda & Soğuk Zincir Dağıtım',
    kargo_dagitim: 'Kargo, Dağıtım & Nakliye',
    insaat_malzeme: 'İnşaat, Nalbur & Sanayi',
    tarim_yem: 'Tarım, Yem & Tonajlı Taşımacılık',
    oto_kurtarma: 'Oto Kurtarma & Yol Yardım',
    hafriyat_santiye: 'Hafriyat & Şantiye',
    agir_nakliye: 'Uzun Yol & Uluslararası Lojistik'
  };
  const secLabel = sectorTitles[secKey] ? `*${sectorTitles[secKey]}* operasyonunuza özel süzülmüş ` : 'işletmenize özel ';
  const vipLink = buildCustomerVipPortalLink(cust, secKey);

  const msg = (
    `Sayın *${companyName}*,\n\n` +
    `Ben IVECO ERC Samsun Otomotiv Satış Sorumlusu *Can M.* (0544 622 59 31).\n\n` +
    `Firmanız için hazırladığım ${secLabel}2026 model IVECO şasi fiyat listesini, %20 KDV vergi kalkanı hesabını, takas peşinat desteğini ve %0 faizli banka kredi seçeneklerini aşağıdaki size özel bağlantıdan inceleyebilirsiniz:\n\n` +
    `👉 ${vipLink}\n\n` +
    `Beğendiğiniz model veya takas/kredi hesaplaması için bu mesaj üzerinden bana doğrudan ulaşabilirsiniz.\n\n` +
    `İyi çalışmalar dilerim.\n*Satış Sorumlusu Can M. - 0544 622 59 31*\n*IVECO ERC Samsun Otomotiv*`
  );

  openWhatsApp(cust.phone, msg, { customer: cust, onSuccess: options.onSuccess });
}

