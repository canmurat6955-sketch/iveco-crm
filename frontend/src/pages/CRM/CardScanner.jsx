import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scannerApi, crmApi } from '../../api/client';
import { 
  FiCamera, FiUpload, FiCheck, FiX, FiUser, FiBriefcase, 
  FiPhone, FiMail, FiLayers, FiMapPin, FiSend, FiFileText, 
  FiArrowRight, FiExternalLink, FiTruck, FiClock, FiCompass,
  FiZap, FiRefreshCw, FiCheckCircle, FiTag
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { duplicateDetection } from '../../services/duplicateDetection';
import VoiceInputButton from '../../components/common/VoiceInputButton';
import { openWhatsApp } from '../../utils/whatsapp';
import { useAuth } from '../../contexts/AuthContext';

const PIPELINE_STAGES = [
  { key: 'lead', label: 'Lead', emoji: '🎯', color: '#818cf8' },
  { key: 'contact', label: 'İlk Görüşme', emoji: '📞', color: '#38bdf8' },
  { key: 'proposal', label: 'Teklif', emoji: '📋', color: '#fbbf24' },
  { key: 'negotiation', label: 'Pazarlık', emoji: '🤝', color: '#fb923c' },
];

const COMMON_VEHICLES = [
  'Daily Şasi',
  'Daily Panelvan',
  'Daily 72C',
  'Eurocargo',
  'S-Way',
  'T-Way'
];

export default function CardScanner() {
  const { user } = useAuth();
  const salesRepName = (user?.full_name && !user.full_name.includes('Sistem') && !user.full_name.includes('King'))
    ? user.full_name
    : 'Murat Onay';

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  
  // OCR Ayrıştırılmış Form State'leri
  const [result, setResult] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [role, setRole] = useState('');
  const [sector, setSector] = useState('');
  const [phone, setPhone] = useState('');
  const [landlinePhone, setLandlinePhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [allCrmCustomers, setAllCrmCustomers] = useState([]);
  
  // Yönlendirme & Satış Tercihleri
  const [pipelineStage, setPipelineStage] = useState('contact');
  const [selectedVehicle, setSelectedVehicle] = useState('Daily Şasi');
  const [salesNote, setSalesNote] = useState('');
  const [routingInProgress, setRoutingInProgress] = useState(false);
  const [actionType, setActionType] = useState(null); // 'whatsapp', 'pipeline', 'proforma', 'customer'

  // Konum Ayrıştırma State'leri
  const [locationMode, setLocationMode] = useState('gps');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [resolvedCity, setResolvedCity] = useState('Samsun');
  const [resolvedDistrict, setResolvedDistrict] = useState('Tekkeköy');
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    crmApi.getCustomers({ limit: 5000 })
      .then(res => setAllCrmCustomers(res.data.items || []))
      .catch(() => {});
  }, []);

  const handleFileChange = (e, isCamera = false) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);

    // Taramayı otomatik başlat
    startScan(selectedFile);
  };

  const startScan = async (selectedFile) => {
    setScanning(true);
    toast.loading("Yapay zekâ kartviziti inceliyor ve bilgileri ayrıştırıyor...", { id: 'ocr_load' });
    
    try {
      const res = await scannerApi.scanCard(selectedFile);
      const data = res.data;
      
      const COMMERCIAL_KEYWORDS = [
        'ticaret', 'ticareti', 'sanayi', 'ltd', 'şti', 'aş', 'a.ş', 'holding',
        'kömür', 'nakliyat', 'hafriyat', 'inşaat', 'insaat', 'otomotiv', 'petrol',
        'lojistik', 'taşımacılık', 'gıda', 'tekstil', 'turizm', 'madencilik', 'tarım',
        'pazarlama', 'ithalat', 'ihracat', 'şirketi', 'servis', 'hizmetleri'
      ];

      let finalCompany = data.company_name || '';
      let finalContact = data.contact_name || '';

      // Akıllı analiz kontrolü: Faaliyet/ticaret adı yetkili kişi olamaz!
      if (finalContact) {
        const isCommercial = COMMERCIAL_KEYWORDS.some(kw => finalContact.toLowerCase().includes(kw));
        if (isCommercial) {
          if (!finalCompany.toLowerCase().includes(finalContact.toLowerCase())) {
            finalCompany = finalCompany ? `${finalCompany} ${finalContact}` : finalContact;
          }
          finalContact = '';
        }
      }

      setResult(data);
      setCompanyName(finalCompany);
      setContactName(finalContact);
      setRole(data.role || '');
      setSector(data.sector || '');
      setPhone(data.phone || '');
      setLandlinePhone(data.landline_phone || '');
      setEmail(data.email || '');
      setWebsite(data.website || '');
      setAddress(data.address || '');

      // Konum ve koordinatları ata
      if (data.city) setResolvedCity(data.city);
      if (data.district) setResolvedDistrict(data.district);
      if (data.latitude && data.longitude) {
        setLatitude(data.latitude.toString());
        setLongitude(data.longitude.toString());
      }
      
      toast.success("Kartvizit başarıyla tarandı! Lütfen bilgileri kontrol edip yönlendirme seçin. ✨", { id: 'ocr_load' });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Tarama sırasında bir hata oluştu.", { id: 'ocr_load' });
    } finally {
      setScanning(false);
    }
  };

  const fetchGpsCoordinates = () => {
    if (!navigator.geolocation) {
      toast.error("Cihazınız konum servisini desteklemiyor.");
      return;
    }
    toast.loading("GPS konumunuz alınıyor...", { id: 'gps_load' });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        toast.success("GPS Konumu alındı! 📍", { id: 'gps_load' });

        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: { 'Accept-Language': 'tr' }
          });
          const data = await response.json();
          if (data && data.address) {
            const addr = data.address;
            const detectedCity = addr.province || addr.city || '';
            const detectedDistrict = addr.suburb || addr.town || addr.district || addr.borough || '';
            setResolvedCity(detectedCity.replace(' İl', '').replace(' İli', '').trim() || 'Samsun');
            setResolvedDistrict(detectedDistrict.trim() || 'Tekkeköy');
            toast.success(`Konum çözümlendi: ${detectedCity} / ${detectedDistrict}`);
          }
        } catch (err) {
          console.warn("Geocoding error:", err);
        }
      },
      (error) => {
        toast.error("GPS konumu alınamadı. Lütfen izinlerinizi kontrol edin.", { id: 'gps_load' });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const fetchLocationFromAddress = async () => {
    if (!address.trim()) {
      toast.error("Adres alanı boş olduğu için konum aranamıyor.");
      return;
    }
    toast.loading("Adresten koordinat aranıyor...", { id: 'addr_load' });
    
    try {
      const q = `${address.trim()}, ${resolvedCity || 'Samsun'}, Türkiye`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`, {
        headers: { 'Accept-Language': 'tr' }
      });
      const results = await response.json();
      if (results && results.length > 0) {
        setLatitude(results[0].lat);
        setLongitude(results[0].lon);
        toast.success(`Adres konumu haritada işaretlendi! 📍`, { id: 'addr_load' });
      } else {
        toast.success(`Varsayılan bölge (${resolvedCity}) konumu atandı. 📍`, { id: 'addr_load' });
      }
    } catch {
      toast.error("Adres arama servisine ulaşılamadı.", { id: 'addr_load' });
    }
  };

  // ── CRM Müşteri ve İrtibat Kaydını Oluştur ──
  const saveCustomerRecord = async (targetStage) => {
    if (!companyName.trim()) {
      toast.error("Lütfen bir firma adı girin.");
      return null;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const pStage = targetStage || pipelineStage || 'contact';
    const finalNote = salesNote.trim() || (selectedVehicle ? `${selectedVehicle} ilgisi için kartvizit görüşmesi sağlandı.` : 'Kartvizit taraması ile eklendi.');

    try {
      // 1. Müşteriyi CRM'e kaydet
      const customerRes = await crmApi.createCustomer({
        company_name: companyName.trim(),
        phone: phone || null,
        landline_phone: landlinePhone.trim() || null,
        email: email || null,
        website: website || null,
        address: address || null,
        city: resolvedCity || "Samsun",
        district: resolvedDistrict || "Tekkeköy",
        sector: sector.trim() || (role ? `${role} / Ticari Araç` : "Ticari Araç Adayı"),
        current_fleet: selectedVehicle ? `İlgilenilen: ${selectedVehicle}` : '',
        segment: "B",
        potential_level: "high",
        potential_score: 80,
        sales_notes: finalNote,
        pipeline_stage: pStage,
        pipeline_note: finalNote,
        last_contact_date: todayStr,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        source: "card_scanner"
      });

      const customerId = customerRes.data.id;

      // 2. İrtibat Kişisini (Contact) CRM'e ekle
      if (contactName.trim() && customerId) {
        try {
          await crmApi.addContact(customerId, {
            contact_name: contactName.trim(),
            role: role || null,
            phone: phone || landlinePhone || null,
            email: email || null,
            notes: "Kartvizit taramasından gelen yetkili kişi.",
            is_primary: true
          });
        } catch (cErr) {
          console.warn("Contact create warning:", cErr);
        }
      }

      return { customerId, customerData: customerRes.data };
    } catch (err) {
      console.error("Müşteri kayıt hatası:", err);
      toast.error(err.response?.data?.detail || "CRM kaydı oluşturulurken hata meydana geldi.");
      return null;
    }
  };

  // ── YÖNLENDİRME 1: WhatsApp'a Yönlendir & Pipeline'a At (Önerilen) ──
  const handleRouteWhatsApp = async () => {
    if (!phone?.trim()) {
      if (landlinePhone?.trim()) {
        toast.error(`WhatsApp yönlendirmesi için cep telefonu (05xx) gereklidir. Kartvizitte yalnızca sabit hat (${landlinePhone}) bulundu. Lütfen WhatsApp için cep numarası giriniz.`, { duration: 6000 });
      } else {
        toast.error("WhatsApp yönlendirmesi için geçerli bir cep telefonu numarası (05xx) bulunmalıdır.");
      }
      return;
    }

    try {
      setRoutingInProgress(true);
      setActionType('whatsapp');
      toast.loading("Müşteri kaydediliyor ve WhatsApp yönlendirmesi hazırlanıyor...", { id: 'route_load' });

      const stage = pipelineStage === 'proposal' ? 'proposal' : 'contact';
      const record = await saveCustomerRecord(stage);
      if (!record) {
        toast.dismiss('route_load');
        return;
      }

      toast.success("Müşteri kaydedildi ve WhatsApp Bilgi Kartı açılıyor! 🎯", { id: 'route_load' });

      const defaultMsg = `Ben IVECO ERC Otomotiv Satış Sorumlusu ${salesRepName}. Sizin için hazırladığımız avantajlı IVECO ${selectedVehicle || 'Daily Şasi'} kampanyamızı sizinle paylaşmak istedim. Düşünürseniz detayları ve araç özelliklerini görüşmekten memnuniyet duyarım.`;

      // WhatsApp modali ve yönlendirmesini tetikle
      openWhatsApp(phone, defaultMsg, {
        customer: {
          ...record.customerData,
          id: record.customerId,
          company_name: companyName,
          contact_name: contactName,
          phone: phone,
          landline_phone: landlinePhone,
          city: resolvedCity,
          district: resolvedDistrict
        },
        vehicleTitle: selectedVehicle,
        defaultStatus: stage === 'proposal' ? 'offer_given' : 'sent',
        defaultMessage: defaultMsg
      });
    } finally {
      setRoutingInProgress(false);
      setActionType(null);
    }
  };

  // ── YÖNLENDİRME 2: Doğrudan Satış Pipeline'ına Aktar (Kanban) ──
  const handleRoutePipeline = async () => {
    try {
      setRoutingInProgress(true);
      setActionType('pipeline');
      toast.loading("Müşteri Satış Pipeline'ına aktarılıyor...", { id: 'route_load' });

      const record = await saveCustomerRecord(pipelineStage);
      if (!record) {
        toast.dismiss('route_load');
        return;
      }

      toast.success(`Firma Satış Pipeline'ına (${pipelineStage.toUpperCase()}) aktarıldı! 🎯`, { id: 'route_load' });
      navigate('/pipeline');
    } finally {
      setRoutingInProgress(false);
      setActionType(null);
    }
  };

  // ── YÖNLENDİRME 3: Hızlı Proforma / Fiyat Teklifi Hazırla ──
  const handleRouteProforma = async () => {
    try {
      setRoutingInProgress(true);
      setActionType('proforma');
      toast.loading("Müşteri kaydediliyor ve Proforma sihirbazına aktarılıyor...", { id: 'route_load' });

      const record = await saveCustomerRecord('proposal');
      if (!record) {
        toast.dismiss('route_load');
        return;
      }

      toast.success("Müşteri bilgileri Proforma ekranına yüklendi! 📄", { id: 'route_load' });
      navigate('/proforma/quick', {
        state: {
          customer: {
            id: record.customerId,
            company_name: companyName,
            contact_name: contactName,
            phone: phone,
            city: resolvedCity,
            district: resolvedDistrict,
            address: address,
            email: email
          },
          vehicle_model: selectedVehicle
        }
      });
    } finally {
      setRoutingInProgress(false);
      setActionType(null);
    }
  };

  // ── YÖNLENDİRME 4: Müşteri Kartını Aç ──
  const handleRouteCustomerDetail = async () => {
    try {
      setRoutingInProgress(true);
      setActionType('customer');
      toast.loading("Müşteri CRM'e kaydediliyor...", { id: 'route_load' });

      const record = await saveCustomerRecord(pipelineStage);
      if (!record) {
        toast.dismiss('route_load');
        return;
      }

      toast.success("Müşteri kartı açılıyor! 👤", { id: 'route_load' });
      navigate(`/customers/${record.customerId}`);
    } finally {
      setRoutingInProgress(false);
      setActionType(null);
    }
  };

  return (
    <div className="mobile-page animate-in" style={{ maxWidth: 860, margin: '0 auto', padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.45rem', fontWeight: 800 }}>
            <span style={{ color: '#ec4899' }}>🎴</span> Kartvizit Tarayıcı & Akıllı Yönlendirme
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Kartviziti kameranızla çekin; yapay zekâ bilgileri ayrıştırsın, tek tıkla WhatsApp veya Satış Pipeline'ına yönlendirin.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            type="button" 
            onClick={() => navigate('/pipeline')} 
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            <span>📊 Pipeline'a Git</span>
          </button>
        </div>
      </div>

      {/* ── 1. KARTVİZİT ÇEKİM & YÜKLEME ALANI ── */}
      <div 
        className="card text-center" 
        style={{ 
          padding: '1.75rem 1.25rem', 
          border: '2px dashed var(--border-color, rgba(236, 72, 153, 0.4))', 
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.04) 0%, rgba(99, 102, 241, 0.04) 100%)',
          borderRadius: 14,
          marginBottom: '1.25rem'
        }}
      >
        {preview ? (
          <div style={{ marginBottom: 16, position: 'relative', display: 'inline-block' }}>
            <img 
              src={preview} 
              alt="Kartvizit Önizleme" 
              style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', border: '2px solid rgba(255,255,255,0.1)' }} 
            />
            <button 
              type="button"
              style={{ 
                position: 'absolute', top: -10, right: -10, 
                background: '#ef4444', border: 'none', color: '#fff', 
                borderRadius: '50%', width: 28, height: 28, 
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
              onClick={() => { setPreview(null); setResult(null); setFile(null); }}
              title="Görseli Kaldır"
            >
              <FiX size={16} />
            </button>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', marginBottom: 18 }}>
            <div 
              style={{ 
                width: 64, height: 64, borderRadius: '50%', 
                background: 'rgba(236, 72, 153, 0.12)', color: '#f472b6', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 12px' 
              }}
            >
              <FiCamera size={32} />
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              Kartvizit Fotoğrafını Çekin veya Galeriden Seçin
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Kamera çekiminde ışığın ve metinlerin net görünmesine özen gösterin
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* Kamera Butonu (Mobilde doğrudan arka kamerayı açar) */}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            ref={cameraInputRef} 
            onChange={(e) => handleFileChange(e, true)} 
            style={{ display: 'none' }} 
          />
          <button 
            type="button"
            className="btn btn-primary" 
            onClick={() => cameraInputRef.current.click()} 
            disabled={scanning}
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 8, 
              padding: '10px 18px', fontSize: '0.9rem', fontWeight: 700,
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              borderColor: '#ec4899',
              boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)'
            }}
          >
            <FiCamera size={18} /> 
            <span>{preview ? 'Yeniden Çek' : '📸 Fotoğraf Çek (Kamera)'}</span>
          </button>

          {/* Dosya / Galeri Yükle Butonu */}
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          <button 
            type="button"
            className="btn btn-secondary" 
            onClick={() => fileInputRef.current.click()} 
            disabled={scanning}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', fontSize: '0.9rem', fontWeight: 600 }}
          >
            <FiUpload size={18} /> 
            <span>Dosya / Galeri Seç</span>
          </button>
        </div>
      </div>

      {/* ── 2. YÜKLENİYOR / OCR ANALİZ DURUMU ── */}
      {scanning && (
        <div className="card text-center" style={{ padding: '2rem 1rem', marginBottom: '1.25rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <div className="loading-pulse" style={{ margin: '0 auto 12px', width: 36, height: 36 }} />
          <div style={{ fontSize: '0.95rem', color: '#38bdf8', fontWeight: 700 }}>
            Yapay Zekâ Kartviziti Analiz Ediyor...
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Firma adı, yetkili, telefon ve adres bilgileri otomatik ayıklanıyor.
          </div>
        </div>
      )}

      {/* ── 3. AYRIŞTIRILMIŞ VERİ & AKILLI YÖNLENDİRME FORMU ── */}
      {result && !scanning && (
        <div className="card animate-in" style={{ padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 14 }}>
          {/* Mükerrer Kontrol Uyarısı */}
          {allCrmCustomers.length > 0 && (() => {
            const matchObj = duplicateDetection.findMatch({ company_name: companyName, phone: phone }, allCrmCustomers);
            if (!matchObj) return null;
            const duplicate = matchObj.customer;
            return (
              <div style={{
                background: 'rgba(245, 158, 11, 0.14)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 16,
                color: '#fbbf24',
                fontSize: '0.84rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8
              }}>
                <span>⚠️ Bu firma veya telefon CRM'de zaten mevcut olabilir: <strong>{duplicate.company_name}</strong></span>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => navigate(`/customers/${duplicate.id}`)}
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                >
                  Mevcut Kartı Aç
                </button>
              </div>
            );
          })()}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📝</span> Kartvizit Bilgilerini Kontrol Edin
            </h3>
            <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
              OCR Başarılı ✓
            </span>
          </div>

          {/* Form Alanları (2 Sütunlu Grid) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 16 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <FiLayers size={13} style={{ color: '#38bdf8' }} /> Firma Adı *
              </label>
              <input 
                className="form-input" 
                required 
                value={companyName} 
                onChange={e => setCompanyName(e.target.value)} 
                placeholder="Örn: Karadeniz Lojistik A.Ş."
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <FiUser size={13} style={{ color: '#10b981' }} /> İrtibat Kişisi Adı
              </label>
              <input 
                className="form-input" 
                value={contactName} 
                onChange={e => setContactName(e.target.value)} 
                placeholder="Örn: Hasan Yılmaz"
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <FiPhone size={13} style={{ color: '#25d366' }} /> Cep Telefonu (WhatsApp) {phone && phone.startsWith('05') ? '✓' : ''}
              </label>
              <input 
                className="form-input" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="05xx xxx xx xx (WhatsApp için)"
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <FiPhone size={13} style={{ color: '#38bdf8' }} /> Sabit Hat / Ofis No
              </label>
              <input 
                className="form-input" 
                value={landlinePhone} 
                onChange={e => setLandlinePhone(e.target.value)} 
                placeholder="02xx / 03xx / 04xx / 0850..."
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <FiBriefcase size={13} style={{ color: '#f59e0b' }} /> Görevi / Rolü
              </label>
              <input 
                className="form-input" 
                value={role} 
                onChange={e => setRole(e.target.value)} 
                placeholder="Örn: Satın Alma Müdürü / Genel Müdür"
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <FiTag size={13} style={{ color: '#38bdf8' }} /> Sektör / Faaliyet Alanı
              </label>
              <input 
                className="form-input" 
                value={sector} 
                onChange={e => setSector(e.target.value)} 
                placeholder="Örn: Kömür / Yakacak / Maden"
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <FiMail size={13} style={{ color: '#c084fc' }} /> E-posta
              </label>
              <input 
                className="form-input" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="info@firma.com"
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                🌐 Web Sitesi
              </label>
              <input 
                className="form-input" 
                value={website} 
                onChange={e => setWebsite(e.target.value)} 
                placeholder="www.firma.com"
                style={{ fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Şehir</label>
              <input 
                className="form-input" 
                value={resolvedCity} 
                onChange={e => setResolvedCity(e.target.value)} 
                placeholder="Şehir"
                style={{ fontSize: '0.85rem' }}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>İlçe</label>
              <input 
                className="form-input" 
                value={resolvedDistrict} 
                onChange={e => setResolvedDistrict(e.target.value)} 
                placeholder="İlçe"
                style={{ fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <FiMapPin size={13} style={{ color: '#ef4444' }} /> Kartvizitteki Adres
            </label>
            <textarea 
              className="form-textarea" 
              rows={2} 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              placeholder="Adres metni..."
              style={{ fontSize: '0.85rem', lineHeight: '1.4' }}
            />
          </div>

          {/* Konum Tespiti (GPS / Adres) */}
          <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>📍 Harita & Konum Belirleme:</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button 
                  type="button"
                  onClick={fetchGpsCoordinates}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '3px 8px', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <FiMapPin size={12} /> Canlı GPS Al
                </button>
                <button 
                  type="button"
                  onClick={fetchLocationFromAddress}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '3px 8px', color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  Adresten Bul
                </button>
              </div>
            </div>
            {latitude && longitude && (
              <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600 }}>
                ✓ Koordinat: {parseFloat(latitude).toFixed(5)}, {parseFloat(longitude).toFixed(5)} ({resolvedCity} / {resolvedDistrict})
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              4. AKILLI YÖNLENDİRME MERKEZİ (KULLANICI TALEBİ)
             ═══════════════════════════════════════════════════════════════════ */}
          <div 
            style={{ 
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)', 
              border: '1.5px solid rgba(56, 189, 248, 0.35)', 
              borderRadius: 12, 
              padding: '14px', 
              marginTop: 16,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#38bdf8', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiZap size={16} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc' }}>
                  🎯 Akıllı Satış Yönlendirme Merkezi
                </h4>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8' }}>
                  Kartviziti kaydederken doğrudan dilediğiniz satış sürecine aktarın:
                </p>
              </div>
            </div>

            {/* A. Hedef Pipeline Aşaması Seçimi */}
            <div style={{ marginBottom: 12 }}>
              <label className="form-label" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 6, display: 'block' }}>
                📊 Eklenecek Pipeline Aşaması:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {PIPELINE_STAGES.map(st => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => setPipelineStage(st.key)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 8,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: pipelineStage === st.key ? `2px solid ${st.color}` : '1px solid var(--border-color)',
                      background: pipelineStage === st.key ? `${st.color}25` : 'rgba(255, 255, 255, 0.03)',
                      color: pipelineStage === st.key ? st.color : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 3,
                      transition: 'all 0.15s'
                    }}
                  >
                    <span>{st.emoji}</span>
                    <span>{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* B. İlgilenilen IVECO Modeli */}
            <div style={{ marginBottom: 12 }}>
              <label className="form-label" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 6, display: 'block' }}>
                🚛 İlgilenilen IVECO Modeli (Hızlı Seçim):
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {COMMON_VEHICLES.map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedVehicle(v)}
                    className="btn btn-sm"
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: selectedVehicle === v ? '1.5px solid #fbbf24' : '1px solid var(--border-color)',
                      background: selectedVehicle === v ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      color: selectedVehicle === v ? '#fbbf24' : 'var(--text-secondary)'
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* C. Satış & Ziyaret Notu (Sesli Dikte Destekli) */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label className="form-label" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', margin: 0 }}>
                  📝 Satış / Ziyaret Görüşme Notu:
                </label>
                <VoiceInputButton 
                  onTranscript={t => setSalesNote(prev => (prev ? prev + ' ' + t : t))}
                  title="Görüşme Notunu Konuşarak Yazdır"
                />
              </div>
              <input
                type="text"
                className="form-input"
                value={salesNote}
                onChange={e => setSalesNote(e.target.value)}
                placeholder="Örn: 2 adet şasi için fiyat teklifi istediler, Salı günü dönüş yapılacak..."
                style={{ fontSize: '0.82rem' }}
              />
            </div>

            {/* D. HIZLI YÖNLENDİRME AKSİYON BUTONLARI */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
              {/* 1. WhatsApp ile Yönlendir (Önerilen) */}
              <button
                type="button"
                onClick={handleRouteWhatsApp}
                disabled={routingInProgress}
                className="btn btn-success"
                style={{
                  padding: '11px 14px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: '#25d366',
                  borderColor: '#25d366',
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)'
                }}
              >
                <FiSend size={16} />
                <span>{routingInProgress && actionType === 'whatsapp' ? 'Açılıyor...' : "WhatsApp'a Yönlendir & Pipeline'a At 🚀"}</span>
              </button>

              {/* 2. Satış Pipeline'ında Gör */}
              <button
                type="button"
                onClick={handleRoutePipeline}
                disabled={routingInProgress}
                className="btn btn-primary"
                style={{
                  padding: '11px 14px',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)'
                }}
              >
                <span>🎯 Satış Pipeline'ına Aktar</span>
                <FiArrowRight size={15} />
              </button>

              {/* 3. Hızlı Proforma Hazırla */}
              <button
                type="button"
                onClick={handleRouteProforma}
                disabled={routingInProgress}
                className="btn btn-secondary"
                style={{
                  padding: '11px 14px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  color: '#fbbf24',
                  borderColor: 'rgba(251, 191, 36, 0.4)',
                  background: 'rgba(251, 191, 36, 0.1)'
                }}
              >
                <FiFileText size={15} />
                <span>📄 Hızlı Proforma / Teklif Çıkar</span>
              </button>

              {/* 4. Müşteri Kartını Aç */}
              <button
                type="button"
                onClick={handleRouteCustomerDetail}
                disabled={routingInProgress}
                className="btn btn-secondary"
                style={{
                  padding: '11px 14px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7
                }}
              >
                <FiUser size={15} />
                <span>👤 Müşteri Kartını Aç</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
