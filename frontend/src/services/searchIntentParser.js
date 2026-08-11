export const searchIntentParser = {
  /**
   * Doğal dildeki sorguyu analiz eder ve yapılandırılmış arama kriterleri döner.
   * @param {string} query Kullanıcının yazdığı metin
   * @returns {object} Yapılandırılmış sorgu parametreleri
   */
  parse: (query) => {
    if (!query) return null;

    const q = query.toLowerCase().trim();
    
    // Varsayılan intent nesnesi
    const intent = {
      originalQuery: query,
      source: 'google_places', // google_places | crm
      category: null,          // Google Places tipi
      sector: null,            // CRM Sektör adı
      radius: null,            // Metre cinsinden yarıçap
      segment: null,           // A, B, C, D
      location: 'current_location',
      city: null,
      searchAlongRoute: false,
      destination: null,
      potential: null          // very_high, high, medium, low
    };

    // 1. Kaynak Tespiti (CRM vs Google Places)
    if (q.includes('müşteri') || q.includes('crm') || q.includes('kayıtlı')) {
      intent.source = 'crm';
    }

    // 2. Segment Filtresi
    if (q.includes('a segment') || q.includes('a sınıfı') || q.includes('segment a')) {
      intent.segment = 'A';
      intent.source = 'crm'; // Segment sadece CRM'de olur
    } else if (q.includes('b segment') || q.includes('b sınıfı') || q.includes('segment b')) {
      intent.segment = 'B';
      intent.source = 'crm';
    } else if (q.includes('c segment') || q.includes('c sınıfı') || q.includes('segment c')) {
      intent.segment = 'C';
      intent.source = 'crm';
    } else if (q.includes('d segment') || q.includes('d sınıfı') || q.includes('segment d')) {
      intent.segment = 'D';
      intent.source = 'crm';
    }

    // 3. Potansiyel Seviyesi
    if (q.includes('çok yüksek potansiyel') || q.includes('very high')) {
      intent.potential = 'very_high';
      intent.source = 'crm';
    } else if (q.includes('yüksek potansiyel') || q.includes('yüksek fırsat')) {
      intent.potential = 'high';
      intent.source = 'crm';
    } else if (q.includes('orta potansiyel')) {
      intent.potential = 'medium';
      intent.source = 'crm';
    } else if (q.includes('düşük potansiyel')) {
      intent.potential = 'low';
      intent.source = 'crm';
    }

    // 4. Sektör & Kategori Algılama
    if (q.includes('akaryakıt') || q.includes('petrol') || q.includes('benzin') || q.includes('istasyon')) {
      intent.category = 'gas_station';
      intent.sector = 'Akaryakıt';
    } else if (q.includes('lojistik') || q.includes('nakliye') || q.includes('nakliyat') || q.includes('taşımacılık') || q.includes('cargo') || q.includes('kargo') || q.includes('tır')) {
      intent.category = 'trucking_company';
      intent.sector = 'Nakliye / Lojistik';
    } else if (q.includes('inşaat') || q.includes('beton') || q.includes('çimento') || q.includes('yapı')) {
      intent.category = 'construction';
      intent.sector = 'İnşaat';
    } else if (q.includes('otomotiv') || q.includes('galeri') || q.includes('oto') || q.includes('servis')) {
      intent.category = 'car_dealer';
      intent.sector = 'Otomotiv';
    } else if (q.includes('gıda') || q.includes('market') || q.includes('catering') || q.includes('yemek')) {
      intent.category = 'food_store';
      intent.sector = 'Gıda';
    } else if (q.includes('sanayi') || q.includes('fabrika') || q.includes('üretim') || q.includes('metal') || q.includes('makine')) {
      intent.category = 'factory';
      intent.sector = 'Sanayi';
    }

    // 5. Yarıçap (Radius) Algılama (km veya m)
    const radiusMatch = q.match(/(\d+)\s*(km|m|kilometre|metre)/);
    if (radiusMatch) {
      const val = parseInt(radiusMatch[1]);
      const unit = radiusMatch[2];
      if (unit.startsWith('k') || unit === 'kilometre') {
        intent.radius = val * 1000; // km -> metre
      } else {
        intent.radius = val; // m -> metre
      }
    }

    // 6. Şehir / Konum Algılama
    const cities = ['samsun', 'sinop', 'çorum', 'ordu', 'amasya', 'tokat', 'giresun', 'trabzon'];
    for (const city of cities) {
      if (q.includes(city)) {
        intent.city = city.charAt(0).toUpperCase() + city.slice(1);
        intent.location = 'city';
      }
    }

    // 7. Rota Üzerinde Arama (Along Route)
    if (q.includes('yolunda') || q.includes('yol üzerindeki') || q.includes('giderken') || q.includes('rotasındaki')) {
      intent.searchAlongRoute = true;
      
      // Hedef şehir bulma (Örn: "Ordu yolunda", "Ordu'ya giderken")
      for (const city of cities) {
        if (q.includes(city) && q.indexOf(city) > q.indexOf('yol')) {
          intent.destination = city.charAt(0).toUpperCase() + city.slice(1);
        }
      }
    }

    return intent;
  }
};
