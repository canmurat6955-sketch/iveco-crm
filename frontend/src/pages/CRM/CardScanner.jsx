import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { scannerApi, crmApi } from '../../api/client';
import { FiCamera, FiUpload, FiCheck, FiX, FiUser, FiBriefcase, FiPhone, FiMail, FiLayers, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { duplicateDetection } from '../../services/duplicateDetection';
import { useEffect } from 'react';




export default function CardScanner() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  
  // OCR Sonuç Formu
  const [result, setResult] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [allCrmCustomers, setAllCrmCustomers] = useState([]);
  
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
    setResult(null); // Eski sonuçları temizle

    // Taramayı otomatik başlat
    startScan(selectedFile);
  };

  const startScan = async (selectedFile) => {
    setScanning(true);
    toast.loading("AI OCR kartviziti analiz ediyor ve bilgileri ayrıştırıyor...", { id: 'ocr_load' });
    
    try {
      const res = await scannerApi.scanCard(selectedFile);
      const data = res.data;
      
      setResult(data);
      setCompanyName(data.company_name || '');
      setContactName(data.contact_name || '');
      setRole(data.role || '');
      setPhone(data.phone || '');
      setEmail(data.email || '');
      setAddress(data.address || '');
      
      toast.success("Kartvizit başarıyla tarandı! Lütfen bilgileri kontrol edin.", { id: 'ocr_load' });
    } catch (err) {
      toast.error("Tarama sırasında bir hata oluştu.", { id: 'ocr_load' });
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error("Firma adı gereklidir.");
      return;
    }
    if (!contactName.trim()) {
      toast.error("İrtibat kişisi adı gereklidir.");
      return;
    }

    toast.loading("CRM'e aktarılıyor...", { id: 'save_load' });

    try {
      // 1. Firmayı (Customer) CRM'e ekle
      const customerRes = await crmApi.createCustomer({
        company_name: companyName,
        phone: phone || null,
        email: email || null,
        address: address || null,
        city: "Samsun", // Varsayılan şehir
        district: "Tekkeköy",
        segment: "B", // Varsayılan segment
        potential_level: "high", // Varsayılan potansiyel
        potential_score: 65,
        sales_notes: "Kartvizit tarayıcı ile otomatik eklendi.",
        pipeline_stage: "lead"
      });

      const customerId = customerRes.data.id;

      // 2. Kişiyi (Contact) ekle
      await crmApi.addContact(customerId, {
        contact_name: contactName,
        role: role || null,
        phone: phone || null,
        email: email || null,
        notes: "Kartvizit taramasından gelen kişi.",
        is_primary: true
      });

      toast.success("Firma ve irtibat kişisi CRM'e başarıyla eklendi! 🎉", { id: 'save_load' });
      
      // Detaya yönlendir
      navigate(`/customers/${customerId}`);
    } catch (err) {
      toast.error("CRM'e ekleme başarısız oldu.", { id: 'save_load' });
    }
  };

  return (
    <div className="mobile-page animate-in">
      <h2 className="page-title">🎴 Kartvizit Tarayıcı</h2>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
        Müşterinin kartvizitini kameradan çekin veya galeriye yükleyin. Yapay zeka bilgileri otomatik olarak CRM'e aktaracaktır.
      </p>

      {/* Upload Seçenekleri */}
      <div className="card text-center" style={{ padding: '2rem 1.5rem', border: '2px dashed var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
        {preview ? (
          <div style={{ marginBottom: 20, position: 'relative', display: 'inline-block' }}>
            <img src={preview} alt="Kartvizit Önizleme" style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} />
            <button 
              style={{ position: 'absolute', top: -10, right: -10, background: '#ef4444', border: 'none', color: '#fff', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => { setPreview(null); setResult(null); }}
            >
              <FiX size={14} />
            </button>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
            <FiCamera size={48} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.5 }} />
            <span>Kamera çekimi veya Dosya yükleme</span>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          {/* Kamera Butonu (Mobil için capture tetikler) */}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            ref={cameraInputRef} 
            onChange={(e) => handleFileChange(e, true)} 
            style={{ display: 'none' }} 
          />
          <button className="btn btn-primary flex items-center gap-2" onClick={() => cameraInputRef.current.click()} disabled={scanning}>
            <FiCamera size={16} /> Fotoğraf Çek
          </button>

          {/* Dosya Yükle Butonu */}
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          <button className="btn btn-secondary flex items-center gap-2" onClick={() => fileInputRef.current.click()} disabled={scanning}>
            <FiUpload size={16} /> Galeri Seç
          </button>
        </div>
      </div>

      {/* Tarama Yükleniyor Göstergesi */}
      {scanning && (
        <div className="card mt-4 text-center">
          <div className="loading-pulse" style={{ margin: '0 auto 10px' }} />
          <span style={{ fontSize: 13, color: 'var(--accent-blue-light)', fontWeight: 600 }}>Yapay Zeka Analiz Ediyor...</span>
        </div>
      )}

      {/* Sonuçları İnceleme Formu */}
      {result && !scanning && (
        <form onSubmit={handleSave} className="card mt-4 animate-in">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            📝 Bilgileri Kontrol Edin
          </h3>

          {allCrmCustomers.length > 0 && (() => {
            const matchObj = duplicateDetection.findMatch({ company_name: companyName, phone: phone }, allCrmCustomers);
            if (!matchObj) return null;
            const duplicate = matchObj.customer;
            return (
              <div style={{
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 8,
                padding: 12,
                marginBottom: 15,
                color: '#fbbf24',
                fontSize: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>⚠️ Bu firma zaten CRM'de kayıtlı olabilir: <strong>{duplicate.company_name}</strong></span>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => navigate(`/customers/${duplicate.id}`)}
                  style={{ padding: '4px 8px', fontSize: 11 }}
                >
                  Firmayı Aç
                </button>
              </div>
            );
          })()}


          <div className="flex flex-col gap-4">


            <div className="form-group">
              <label className="form-label"><FiLayers size={12} /> Firma Adı *</label>
              <input className="form-input" required value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label"><FiUser size={12} /> İrtibat Kişisi Adı *</label>
              <input className="form-input" required value={contactName} onChange={e => setContactName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label"><FiBriefcase size={12} /> Görevi / Rolü</label>
              <input className="form-input" value={role} onChange={e => setRole(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label"><FiPhone size={12} /> Telefon Numarası</label>
              <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label"><FiMail size={12} /> E-posta Adresi</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label"><FiMapPin size={12} /> Adres</label>
              <textarea className="form-textarea" rows={2} value={address} onChange={e => setAddress(e.target.value)} />
            </div>

            <div className="flex gap-2 mt-4">
              <button type="button" className="btn btn-secondary w-full" onClick={() => setResult(null)}>
                İptal Et
              </button>
              <button type="submit" className="btn btn-success w-full flex items-center justify-center gap-2">
                <FiCheck size={16} /> CRM'e Aktar
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
