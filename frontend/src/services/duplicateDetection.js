export const duplicateDetection = {
  /**
   * Telefon numarasını son 10 hanesini alacak şekilde normalize eder.
   */
  normalizePhone: (phone) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    return digits.slice(-10);
  },

  /**
   * Bir URL'den ana domain adını ayıklar (www., http:// kaldırır).
   */
  extractDomain: (url) => {
    if (!url) return '';
    let domain = url.toLowerCase().trim();
    if (!domain.startsWith('http')) {
      domain = 'http://' + domain;
    }
    try {
      const parsed = new URL(domain);
      return parsed.hostname.replace('www.', '');
    } catch {
      return '';
    }
  },

  /**
   * İki metin arasındaki benzerlik oranını (0-1 arası) hesaplar (Dice's Coefficient).
   */
  getStringSimilarity: (str1, str2) => {
    const s1 = (str1 || '').toLowerCase().replace(/[^a-z0-9ğüşıiöç\s]/g, '').trim();
    const s2 = (str2 || '').toLowerCase().replace(/[^a-z0-9ğüşıiöç\s]/g, '').trim();

    if (s1 === s2) return 1.0;
    if (s1.length < 2 || s2.length < 2) return 0.0;

    const getBigrams = (str) => {
      const bigrams = new Set();
      for (let i = 0; i < str.length - 1; i++) {
        bigrams.add(str.substring(i, i + 2));
      }
      return bigrams;
    };

    const bigrams1 = getBigrams(s1);
    const bigrams2 = getBigrams(s2);

    let intersection = 0;
    for (const b of bigrams1) {
      if (bigrams2.has(b)) {
        intersection++;
      }
    }

    return (2.0 * intersection) / (bigrams1.size + bigrams2.size);
  },

  /**
   * Google Places'tan gelen bir firmayı, mevcut CRM müşterileriyle eşleştirir.
   * @param {object} googleBiz Google'dan gelen firma nesnesi
   * @param {Array} crmCustomers CRM'deki tüm müşteriler
   * @returns {object|null} Eşleşen müşteri nesnesi ve benzerlik skoru
   */
  findMatch: (googleBiz, crmCustomers) => {
    if (!crmCustomers || crmCustomers.length === 0) return null;

    const gName = googleBiz.company_name || '';
    const gPhone = duplicateDetection.normalizePhone(googleBiz.phone);
    const gDomain = duplicateDetection.extractDomain(googleBiz.website);

    let bestMatch = null;
    let maxScore = 0;

    // Performans için kısıt: Eşleşenlerin listesi
    for (const c of crmCustomers) {
      // 1. Telefon Eşleşmesi (En kesin kanıt)
      if (gPhone && c.phone) {
        const cPhone = duplicateDetection.normalizePhone(c.phone);
        if (gPhone === cPhone) {
          return { customer: c, score: 1.0, matchType: 'phone' };
        }
      }

      // 2. Domain Eşleşmesi (En kesin 2. kanıt)
      if (gDomain && c.website) {
        const cDomain = duplicateDetection.extractDomain(c.website);
        if (gDomain === cDomain) {
          return { customer: c, score: 1.0, matchType: 'domain' };
        }
      }

      // 3. İsim Benzerliği
      const nameScore = duplicateDetection.getStringSimilarity(gName, c.company_name);
      
      // Eğer aynı şehirdeyse isim benzerliği eşiğini düşür
      const sameCity = googleBiz.city && c.city && googleBiz.city.toLowerCase() === c.city.toLowerCase();
      const threshold = sameCity ? 0.70 : 0.85;

      if (nameScore >= threshold && nameScore > maxScore) {
        maxScore = nameScore;
        bestMatch = { customer: c, score: nameScore, matchType: 'name' };
      }
    }

    return maxScore > 0 ? bestMatch : null;
  }
};
