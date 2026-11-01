// Müşteriye gönderilen tüm bağımsız linkler için canlı adres
export const PUBLIC_ORIGIN = 'https://iveco-crm.vercel.app';

const isPrivateHost = (host) =>
  !host ||
  host === 'localhost' ||
  host === '127.0.0.1' ||
  /^10\./.test(host) ||
  /^192\.168\./.test(host) ||
  /^172\.(1[6-9]|2\d|3[01])\./.test(host);

export const getPublicOrigin = () => {
  if (typeof window === 'undefined') return PUBLIC_ORIGIN;
  return isPrivateHost(window.location.hostname) ? PUBLIC_ORIGIN : window.location.origin;
};
