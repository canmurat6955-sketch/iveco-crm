import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { crmApi, scannerApi } from '../../api/client';
import toast from 'react-hot-toast';
import { FiUploadCloud, FiFileText, FiMic, FiMicOff, FiCheckCircle, FiEdit } from 'react-icons/fi';

// Speech Dictation Number Converter
function parseTurkishNumber(text) {
  text = text.toLowerCase()
    .replace(/[^a-z0-9çğıöşü\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const plainDigits = text.replace(/\s/g, "");
  if (/^\d+$/.test(plainDigits)) {
    return parseInt(plainDigits);
  }

  const units = {
    "sıfır": 0, "bir": 1, "iki": 2, "üç": 3, "uc": 3, "dört": 4, "dort": 4,
    "beş": 5, "bes": 5, "altı": 6, "alti": 6, "yedi": 7, "sekiz": 8, "dokuz": 9
  };

  const tens = {
    "on": 10, "yirmi": 20, "otuz": 30, "kırk": 40, "kirk": 40,
    "elli": 50, "altmış": 60, "altmis": 60, "yetmiş": 70, "yetmis": 70,
    "seksen": 80, "doksan": 90
  };

  const scales = {
    "yüz": 100, "yuz": 100,
    "bin": 1000,
    "milyon": 1000000,
    "milyar": 1000000000
  };

  if (text.includes("buçuk") || text.includes("bucuk")) {
    const parts = text.split(/(?:buçuk|bucuk)/);
    const leftText = parts[0].trim();
    const rightText = parts[1].trim();
    
    let leftVal = parseTurkishNumber(leftText) || 0;
    let multiplier = 1;
    if (rightText.includes("milyon")) multiplier = 1000000;
    else if (rightText.includes("milyar")) multiplier = 1000000000;
    else if (rightText.includes("bin")) multiplier = 1000;
    
    return leftVal * multiplier + (0.5 * multiplier);
  }

  const words = text.split(" ");
  let total = 0;
  let current = 0;

  for (let word of words) {
    if (units[word] !== undefined) {
      current += units[word];
    } else if (tens[word] !== undefined) {
      current += tens[word];
    } else if (scales[word] !== undefined) {
      let scale = scales[word];
      if (scale === 100) {
        if (current === 0) current = 1;
        current *= 100;
      } else {
        if (current === 0 && scale === 1000) current = 1;
        total += current * scale;
        current = 0;
      }
    }
  }

  total += current;
  return total;
}

export default function ProformaQuick() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // States
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  
  // OCR Customer Details
  const [customer, setCustomer] = useState({
    company_name: '',
    tax_number: '',
    vergi_dairesi: '',
    address: '',
    city: 'SAMSUN',
    district: ''
  });

  // Proforma Details (Prefilled with ERC template example defaults)
  const [vehicle, setVehicle] = useState({
    vehicle_model: 'IVECO DAILY 70 C 16 H 3.0 A 8 CC 4350 EVIE',
    model_year: '2025',
    chassis_no: '',
    motor_no: '',
    motor_power: '2998 CM3 118 KW',
    color: 'BEYAZ',
    max_weight: '7200 KG.',
    
    unit_price: '',
    otv_rate: '4.0',
    kdv_rate: '20.0',
    
    delivery_place: "ERC SAMSUN OTOMOTİV SAN.TİC. A.Ş. 'nin SAMSUN Araç Parkı",
    payment_terms: "Şirketimizin Garanti Merkez Şubesinde bulunan TR23 0006 2000 1900 0006 2888 37 Iban Nolu Hesabına EFT veya HAVALE talimatınız ile",
    notes: "Fiyatlarımız peşin satış koşulları esas alınarak oluşturulmuş olup ödeme nakten ve defaten gerçekleştirilecektir. Vergi kanunlarında yapılacak değişiklikler lehde ve alehde fiyatlarımıza yansıtılacaktır. SUBVANSİYONLU kredi kullandırılamaz. ARAÇ KASKO KODU :520-1661",
    date: new Date().toISOString().split('T')[0],
    validity_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Live calculation results
  const [calculations, setCalculations] = useState({
    otv_amount: 0,
    subtotal: 0,
    kdv_amount: 0,
    grand_total: 0
  });

  // Dictation States
  const [listeningField, setListeningField] = useState(null); // 'model' or 'price'
  const recognitionRef = useRef(null);

  // Recalculate taxes
  useEffect(() => {
    const price = parseFloat(vehicle.unit_price) || 0;
    const otvRate = parseFloat(vehicle.otv_rate) || 0;
    const kdvRate = parseFloat(vehicle.kdv_rate) || 0;

    const otv_amount = Math.round(price * (otvRate / 100.0) * 100) / 100;
    const subtotal = Math.round((price + otv_amount) * 100) / 100;
    const kdv_amount = Math.round(subtotal * (kdvRate / 100.0) * 100) / 100;
    const grand_total = Math.round((subtotal + kdv_amount) * 100) / 100;

    setCalculations({
      otv_amount,
      subtotal,
      kdv_amount,
      grand_total
    });
  }, [vehicle.unit_price, vehicle.otv_rate, vehicle.kdv_rate]);

  // Handle OCR upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      toast.loading('Vergi levhası okunuyor...', { id: 'ocr' });
      const res = await scannerApi.scanVergiLevhasi(file);
      
      setCustomer({
        company_name: res.data.company_name,
        tax_number: res.data.tax_number || '',
        vergi_dairesi: res.data.vergi_dairesi || '',
        address: res.data.address || '',
        city: res.data.city || 'SAMSUN',
        district: res.data.district || ''
      });
      
      toast.success('Vergi levhası başarıyla ayrıştırıldı!', { id: 'ocr' });
    } catch (err) {
      toast.error('Belge taranamadı. Bilgileri elle doldurabilirsiniz.', { id: 'ocr' });
    } finally {
      setLoading(false);
    }
  };

  // Browser Native Speech Recognition
  const startSpeechRecognition = (fieldName) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Tarayıcınız ses tanımayı desteklemiyor. Chrome veya Edge kullanın.');
      return;
    }

    if (listeningField) {
      stopSpeechRecognition();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListeningField(fieldName);
      toast.success('Dinleniyor... Konuşun', { duration: 1500 });
    };

    recognition.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      if (fieldName === 'price') {
        const numericVal = parseTurkishNumber(resultText);
        if (numericVal > 0) {
          setVehicle(prev => ({ ...prev, unit_price: numericVal.toString() }));
          toast.success(`Dikte edilen fiyat: ${numericVal.toLocaleString('tr-TR')} TL`);
        } else {
          toast.error(`Sayı anlaşılamadı: "${resultText}"`);
        }
      } else if (fieldName === 'model') {
        setVehicle(prev => ({ ...prev, vehicle_model: resultText }));
        toast.success(`Model dikte edildi: "${resultText}"`);
      }
    };

    recognition.onerror = () => {
      toast.error('Ses tanıma başarısız oldu.');
      setListeningField(null);
    };

    recognition.onend = () => {
      setListeningField(null);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListeningField(null);
    }
  };

  // Submit flow
  const handleSaveAndShare = async (e) => {
    e.preventDefault();
    if (!customer.company_name) {
      toast.error('Müşteri unvanı (firma adı) gereklidir.');
      return;
    }
    if (!vehicle.vehicle_model) {
      toast.error('Araç modeli yazılmalıdır.');
      return;
    }
    if (!vehicle.unit_price || parseFloat(vehicle.unit_price) <= 0) {
      toast.error('Fiyat girmelisiniz.');
      return;
    }

    try {
      setSaving(true);
      toast.loading('İşlemler gerçekleştiriliyor...', { id: 'save' });

      // 1. Check or Create Customer
      let customerId = null;
      if (customer.tax_number) {
        const dupesRes = await crmApi.checkDuplicate({ tax_number: customer.tax_number });
        if (dupesRes.data && dupesRes.data.length > 0) {
          customerId = dupesRes.data[0].id;
        }
      }

      if (!customerId) {
        const newCustomerRes = await crmApi.createCustomer({
          company_name: customer.company_name,
          tax_number: customer.tax_number,
          vergi_dairesi: customer.vergi_dairesi,
          address: customer.address,
          city: customer.city || 'SAMSUN',
          district: customer.district || '',
          status: 'active'
        });
        customerId = newCustomerRes.data.id;
      }

      // 2. Create Proforma Invoice
      const proformaPayload = {
        ...vehicle,
        unit_price: parseFloat(vehicle.unit_price),
        otv_rate: parseFloat(vehicle.otv_rate),
        kdv_rate: parseFloat(vehicle.kdv_rate)
      };

      const proformaRes = await crmApi.createProforma(customerId, proformaPayload);
      const proformaId = proformaRes.data.id;

      toast.success('Proforma başarıyla oluşturuldu!', { id: 'save' });

      // 3. Share on WhatsApp
      const wpMessage = `Sayın ${customer.company_name.toUpperCase()}, ERC Samsun Otomotiv adına hazırladığımız ${proformaRes.data.invoice_number} numaralı proforma faturanız hazırdır. Detaylar ve yazdırma için link: https://iveco-crm.vercel.app/proformas/${proformaId}`;
      const wpUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(wpMessage)}`;
      
      window.open(wpUrl, '_blank');

      // Navigate to the printable detail page
      navigate(`/proformas/${proformaId}`);

    } catch (err) {
      toast.error('İşlem kaydedilirken hata oluştu.', { id: 'save' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in pb-12">
      <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <FiCheckCircle color="#10b981" /> 1-Tıkla Proforma Sihirbazı
      </h2>
      <p className="text-muted" style={{ marginTop: '-12px', marginBottom: '24px' }}>
        Vergi levhasını yükleyin, araç modelini ve fiyatı yazın/söyleyin ve anında WhatsApp'tan teklifinizi gönderin.
      </p>

      <div className="grid grid-2" style={{ gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Adım 1: Dosya/Levha Upload ve Müşteri Bilgileri */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Upload Card */}
          <div className="card glass-card text-center" style={{ padding: '2rem 1.5rem', border: '2px dashed var(--accent-blue)', cursor: 'pointer' }}
               onClick={() => fileInputRef.current?.click()}>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,application/pdf" style={{ display: 'none' }} />
            <FiUploadCloud size={48} color="var(--accent-blue-light)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-heading)', margin: '0 0 4px' }}>
              Vergi Levhası Yükle
            </h3>
            <p className="text-xs text-muted leading-relaxed" style={{ margin: 0 }}>
              Sürükleyip bırakın veya dokunun.<br />
              Fotoğraf (JPEG/PNG) veya dijital **PDF** belgeleri desteklenir.
            </p>
          </div>

          {/* Customer info form */}
          <div className="card glass-card">
            <div className="section-title">MÜŞTERİ BİLGİLERİ (TARAMA SONUÇLARI)</div>
            
            <div className="form-group">
              <label className="form-label">Sayın (Firma Ünvanı) *</label>
              <input className="form-input" value={customer.company_name} onChange={e => setCustomer({...customer, company_name: e.target.value})} placeholder="Levha tarandığında otomatik dolar..." required />
            </div>

            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Vergi No (VKN) *</label>
                <input className="form-input" value={customer.tax_number} onChange={e => setCustomer({...customer, tax_number: e.target.value})} placeholder="Örn: 241450137" required />
              </div>
              <div className="form-group">
                <label className="form-label">Vergi Dairesi</label>
                <input className="form-input" value={customer.vergi_dairesi} onChange={e => setCustomer({...customer, vergi_dairesi: e.target.value})} placeholder="Örn: GAZİLER V.D." />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Adres</label>
              <textarea className="form-input" rows={2} style={{ height: 'auto', resize: 'vertical' }} value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} placeholder="İş yeri adresi..." />
            </div>

            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">İlçe</label>
                <input className="form-input" value={customer.district} onChange={e => setCustomer({...customer, district: e.target.value})} placeholder="Örn: Çarşamba" />
              </div>
              <div className="form-group">
                <label className="form-label">Şehir</label>
                <input className="form-input" value={customer.city} onChange={e => setCustomer({...customer, city: e.target.value})} placeholder="Örn: SAMSUN" />
              </div>
            </div>
          </div>
        </div>

        {/* Adım 2: Fiyat ve Model Bilgileri */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card glass-card">
            <div className="section-title">TEKLİF EDİLECEK ARAÇ VE FİYAT</div>

            {/* Vehicle Model & Speech */}
            <div className="form-group">
              <label className="form-label">Araç Modeli *</label>
              <div className="flex gap-2">
                <input 
                  className="form-input" 
                  value={vehicle.vehicle_model} 
                  onChange={e => setVehicle({ ...vehicle, vehicle_model: e.target.value })} 
                  placeholder="Örn: IVECO DAILY 70 C 16 H 3.0 A 8 CC 4350 EVIE" 
                  required 
                />
                <button 
                  type="button" 
                  className={`btn btn-sm ${listeningField === 'model' ? 'btn-danger animate-pulse' : 'btn-secondary'}`}
                  onClick={() => startSpeechRecognition('model')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', padding: 0 }}
                >
                  {listeningField === 'model' ? <FiMicOff size={18} /> : <FiMic size={18} />}
                </button>
              </div>
            </div>

            {/* Price Box & Speech */}
            <div className="form-group">
              <label className="form-label">Birim Fiyat (Matrah) Söyleyin veya Yazın *</label>
              <div className="flex gap-2">
                <input 
                  className="form-input" 
                  type="number" 
                  step="0.01"
                  value={vehicle.unit_price} 
                  onChange={e => setVehicle({ ...vehicle, unit_price: e.target.value })} 
                  placeholder="Birim matrah fiyatı girin veya mikrofona konuşun..." 
                  required 
                />
                <button 
                  type="button" 
                  className={`btn btn-sm ${listeningField === 'price' ? 'btn-danger animate-pulse' : 'btn-secondary'}`}
                  onClick={() => startSpeechRecognition('price')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', padding: 0 }}
                >
                  {listeningField === 'price' ? <FiMicOff size={18} /> : <FiMic size={18} />}
                </button>
              </div>
            </div>

            {/* Calculations preview block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <div className="flex justify-between text-xs text-muted">
                <span>ÖTV Tutarı (%{vehicle.otv_rate}):</span>
                <span>{calculations.otv_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
              </div>
              <div className="flex justify-between text-xs text-muted">
                <span>KDV Tutarı (%{vehicle.kdv_rate}):</span>
                <span>{calculations.kdv_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
              </div>
              <div className="flex justify-between font-bold" style={{ color: '#10b981', borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem', fontSize: '1.1rem' }}>
                <span>Genel Toplam:</span>
                <span>{calculations.grand_total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
              </div>
            </div>

            {/* Unified Submit Button */}
            <button 
              className="btn btn-success w-full mt-6" 
              onClick={handleSaveAndShare}
              disabled={saving} 
              style={{
                display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
                height: '52px', fontSize: '1.1rem', fontWeight: 700, borderRadius: 'var(--radius-md)'
              }}
            >
              <FiCheckCircle size={22} /> {saving ? 'İşleniyor...' : 'Proforma Oluştur & WhatsApp ile Paylaş'}
            </button>
          </div>
          
          {/* Quick Technical Specs (Edit mode toggled by button) */}
          <div className="card glass-card">
            <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: showSpecs ? '1rem' : 0 }}>
              <h3 className="card-title" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Teknik Detaylar (Varsayılan Örnek Değerler)</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setShowSpecs(!showSpecs)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px' }}>
                <FiEdit size={12} /> {showSpecs ? 'Gizle' : 'Düzenle'}
              </button>
            </div>
            
            {showSpecs ? (
              <div className="grid grid-2" style={{ gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label text-xs">Model Yılı</label>
                  <input className="form-input input-sm" value={vehicle.model_year} onChange={e => setVehicle({...vehicle, model_year: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Renk</label>
                  <input className="form-input input-sm" value={vehicle.color} onChange={e => setVehicle({...vehicle, color: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Motor Gücü</label>
                  <input className="form-input input-sm" value={vehicle.motor_power} onChange={e => setVehicle({...vehicle, motor_power: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Azami Ağırlık</label>
                  <input className="form-input input-sm" value={vehicle.max_weight} onChange={e => setVehicle({...vehicle, max_weight: e.target.value})} />
                </div>
              </div>
            ) : (
              <div className="grid grid-2" style={{ gap: '0.75rem', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                <div><span className="text-muted">Model Yılı:</span> <span className="font-semibold">{vehicle.model_year}</span></div>
                <div><span className="text-muted">Renk:</span> <span className="font-semibold">{vehicle.color}</span></div>
                <div><span className="text-muted">Motor Gücü:</span> <span className="font-semibold">{vehicle.motor_power}</span></div>
                <div><span className="text-muted">Azami Ağırlık:</span> <span className="font-semibold">{vehicle.max_weight}</span></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
