/**
 * WhatsApp Deep-Link & Modal Utility
 * Ensures every WhatsApp action in the CRM opens the Information & Customer Entry Screen.
 */

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
