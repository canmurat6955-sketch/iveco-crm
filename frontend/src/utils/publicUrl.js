// Müşteriye gönderilen tüm bağımsız linkler için Cloudflare (İstanbul POP) korumalı resmi katalog adresi
// (Türk Telekom / Superonline / Kurumsal Wi-Fi'larda Vercel IP bloklamasını ve ERR_SSL_PROTOCOL_ERROR hatasını %100 önler)
export const PUBLIC_ORIGIN = 'https://iveco-crm.onrender.com';

export const getPublicOrigin = () => {
  return PUBLIC_ORIGIN;
};
