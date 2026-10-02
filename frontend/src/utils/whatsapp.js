/**
 * WhatsApp Deep-Link Utility
 * Directly opens native WhatsApp Desktop app (Windows/Mac) or mobile app (iOS/Android)
 * avoiding redirection to WhatsApp Web.
 */

export function getWhatsAppUrl(phone, text = '') {
  if (!phone) return '#';
  const digits = phone.replace(/\D/g, '');
  const clean = digits.length >= 10 ? digits.slice(-10) : digits;
  const fullPhone = `90${clean}`;
  const encodedText = text ? encodeURIComponent(text) : '';
  return `whatsapp://send?phone=${fullPhone}${encodedText ? `&text=${encodedText}` : ''}`;
}

export function openWhatsApp(phone, text = '') {
  const url = getWhatsAppUrl(phone, text);
  if (url && url !== '#') {
    // window.location.href triggers native protocol handler without opening empty web tabs
    window.location.href = url;
  }
}
