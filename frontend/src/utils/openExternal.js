/**
 * Mobil tarayıcılarda (özellikle iPhone Safari) await/setTimeout sonrası
 * çağrılan window.open() popup engelleyiciye takılır ve hiçbir şey olmaz.
 * Bu yardımcı önce yeni sekme dener; engellenirse aynı sekmede açar
 * (WhatsApp uygulaması bu durumda yine açılır).
 */
export const openExternal = (url) => {
  let win = null;
  try {
    win = window.open(url, '_blank');
  } catch {
    win = null;
  }
  if (!win) {
    window.location.href = url;
  }
};

/** Türkiye cep numarasını wa.me formatına (90XXXXXXXXXX) çevirir. */
export const toWhatsAppPhone = (phone) => {
  const clean = (phone || '').replace(/\D/g, '');
  if (!clean) return '';
  return clean.startsWith('90') ? clean : `90${clean.replace(/^0/, '')}`;
};

export const buildWhatsAppUrl = (text, phone) => {
  const p = toWhatsAppPhone(phone);
  return p
    ? `https://api.whatsapp.com/send?phone=${p}&text=${encodeURIComponent(text)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
};

/**
 * Bilgisayar (Windows/Mac WhatsApp Desktop) ve Mobil (iOS/Android WhatsApp App)
 * üzerinde popup engelleyiciye takılmadan doğrudan WhatsApp sohbetini açar.
 * Eğer bilgisayarda WhatsApp Masaüstü uygulaması kurulu değilse otomatik olarak
 * WhatsApp Web / API sayfasına yönlendirir.
 */
export const openWhatsAppChat = (phone, text = '') => {
  const p = toWhatsAppPhone(phone) || '905446225931';
  const encodedText = text ? encodeURIComponent(text) : '';
  const nativeUrl = `whatsapp://send?phone=${p}${encodedText ? `&text=${encodedText}` : ''}`;
  const webUrl = `https://api.whatsapp.com/send?phone=${p}${encodedText ? `&text=${encodedText}` : ''}`;

  let appOpened = false;
  const onBlur = () => {
    appOpened = true;
  };
  window.addEventListener('blur', onBlur, { once: true });

  try {
    window.location.href = nativeUrl;
  } catch {
    // ignore
  }

  setTimeout(() => {
    window.removeEventListener('blur', onBlur);
    if (!appOpened && !document.hidden) {
      openExternal(webUrl);
    }
  }, 1400);
};

