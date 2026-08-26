import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { crmApi } from '../../api/client';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSave, FiFileText } from 'react-icons/fi';

export default function ProformaNew() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [form, setForm] = useState({
    vehicle_model: '',
    model_year: new Date().getFullYear().toString(),
    chassis_no: '',
    motor_no: '',
    motor_power: '2998 CM3 118 KW',
    color: 'BEYAZ',
    max_weight: '7200 KG.',
    
    // Fiyatlandırma
    unit_price: '',
    otv_rate: '4.0',
    kdv_rate: '20.0',
    
    // Şartlar
    delivery_place: "ERC SAMSUN OTOMOTİV SAN.TİC. A.Ş. 'nin SAMSUN Araç Parkı",
    payment_terms: "Şirketimizin Garanti Merkez Şubesinde bulunan TR23 0006 2000 1900 0006 2888 37 Iban Nolu Hesabına EFT veya HAVALE talimatınız ile",
    notes: "Fiyatlarımız peşin satış koşulları esas alınarak oluşturulmuş olup ödeme nakten ve defaten gerçekleştirilecektir. Vergi kanunlarında yapılacak değişiklikler lehde ve alehde fiyatlarımıza yansıtılacaktır. SUBVANSİYONLU kredi kullandırılamaz. ARAÇ KASKO KODU :520-1661",
    date: new Date().toISOString().split('T')[0],
    validity_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 5 days validity
  });

  // Live calculation results
  const [calculations, setCalculations] = useState({
    otv_amount: 0,
    subtotal: 0,
    kdv_amount: 0,
    grand_total: 0
  });

  useEffect(() => {
    crmApi.getCustomer(customerId)
      .then(res => {
        setCustomer(res.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Müşteri bulunamadı');
        navigate('/customers');
      });
  }, [customerId, navigate]);

  // Recalculate values when unit_price, otv_rate or kdv_rate changes
  useEffect(() => {
    const price = parseFloat(form.unit_price) || 0;
    const otvRate = parseFloat(form.otv_rate) || 0;
    const kdvRate = parseFloat(form.kdv_rate) || 0;

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
  }, [form.unit_price, form.otv_rate, form.kdv_rate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vehicle_model) {
      toast.error('Araç modeli gereklidir.');
      return;
    }
    if (!form.unit_price || parseFloat(form.unit_price) <= 0) {
      toast.error('Birim fiyat girilmelidir.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        unit_price: parseFloat(form.unit_price),
        otv_rate: parseFloat(form.otv_rate),
        kdv_rate: parseFloat(form.kdv_rate)
      };

      const res = await crmApi.createProforma(customerId, payload);
      toast.success('Proforma Fatura başarıyla oluşturuldu!');
      navigate(`/proformas/${res.data.id}`);
    } catch (err) {
      toast.error('Proforma oluşturulurken hata meydana geldi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-pulse" />
        <span>Müşteri bilgileri alınıyor...</span>
      </div>
    );
  }

  return (
    <div className="animate-in pb-12">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(`/customers/${customerId}`)} className="btn btn-secondary btn-sm" style={{ padding: '8px 12px' }}>
          <FiArrowLeft size={16} /> Geri Dön
        </button>
        <h2 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiFileText color="var(--accent-blue-light)" /> Yeni Proforma Fatura Hazırla
        </h2>
      </div>

      <div className="grid grid-2" style={{ gap: '1.5rem', alignItems: 'start' }}>
        {/* Form Fields Card */}
        <form onSubmit={handleSubmit} className="card glass-card">
          <div className="section-title">MÜŞTERİ BİLGİLERİ</div>
          <div className="form-group mb-6">
            <label className="form-label" style={{ opacity: 0.8 }}>Sayın (Alıcı Firma)</label>
            <input className="form-input" value={customer.company_name} disabled style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }} />
          </div>

          <div className="section-title">ARAÇ BİLGİLERİ</div>
          <div className="form-group">
            <label className="form-label">Araç Modeli / Açıklaması *</label>
            <input className="form-input" value={form.vehicle_model} onChange={e => setForm({ ...form, vehicle_model: e.target.value })} placeholder="örn: IVECO DAILY 70 C 16 H 3.0 A 8 CC 4350 EVIE" required />
          </div>

          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Model Yılı</label>
              <input className="form-input" value={form.model_year} onChange={e => setForm({ ...form, model_year: e.target.value })} placeholder="2025" />
            </div>
            <div className="form-group">
              <label className="form-label">Renk</label>
              <input className="form-input" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Şasi No</label>
              <input className="form-input" value={form.chassis_no} onChange={e => setForm({ ...form, chassis_no: e.target.value })} placeholder="ZCFCE72BX..." />
            </div>
            <div className="form-group">
              <label className="form-label">Motor No</label>
              <input className="form-input" value={form.motor_no} onChange={e => setForm({ ...form, motor_no: e.target.value })} placeholder="F1CFL411C..." />
            </div>
          </div>

          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Motor Gücü</label>
              <input className="form-input" value={form.motor_power} onChange={e => setForm({ ...form, motor_power: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Azami Yüklü Ağırlık</label>
              <input className="form-input" value={form.max_weight} onChange={e => setForm({ ...form, max_weight: e.target.value })} />
            </div>
          </div>

          <div className="section-title mt-6">FİYATLANDIRMA (TL)</div>
          <div className="grid grid-3" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Birim Fiyat (Matrah) *</label>
              <input className="form-input" type="number" step="0.01" value={form.unit_price} onChange={e => setForm({ ...form, unit_price: e.target.value })} placeholder="0.00" required />
            </div>
            <div className="form-group">
              <label className="form-label">ÖTV Oranı (%)</label>
              <input className="form-input" type="number" step="0.1" value={form.otv_rate} onChange={e => setForm({ ...form, otv_rate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">KDV Oranı (%)</label>
              <input className="form-input" type="number" step="0.1" value={form.kdv_rate} onChange={e => setForm({ ...form, kdv_rate: e.target.value })} />
            </div>
          </div>

          <div className="section-title mt-6">ŞARTLAR & TARİHLER</div>
          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Teklif Tarihi</label>
              <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Geçerlilik Süresi</label>
              <input className="form-input" type="date" value={form.validity_date} onChange={e => setForm({ ...form, validity_date: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Teslimat Yeri</label>
            <input className="form-input" value={form.delivery_place} onChange={e => setForm({ ...form, delivery_place: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Ödeme Şekli (IBAN vb.)</label>
            <textarea className="form-input" rows={2} style={{ height: 'auto', resize: 'vertical' }} value={form.payment_terms} onChange={e => setForm({ ...form, payment_terms: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Ek Notlar / Açıklamalar</label>
            <textarea className="form-input" rows={3} style={{ height: 'auto', resize: 'vertical' }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>

          <button className="btn btn-primary w-full mt-6" type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', height: '45px', fontSize: '1rem' }}>
            <FiSave size={18} /> {saving ? 'Kaydediliyor...' : 'Proforma Faturayı Kaydet'}
          </button>
        </form>

        {/* Live Calculation Preview Card */}
        <div className="card glass-card" style={{ position: 'sticky', top: '1.5rem' }}>
          <div className="section-title">HESAPLAMA ÖNİZLEME</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span className="text-muted">Birim Fiyat (Matrah):</span>
              <span style={{ fontWeight: 600 }}>
                {(parseFloat(form.unit_price) || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span className="text-muted">ÖTV Tutarı (%{form.otv_rate}):</span>
              <span style={{ fontWeight: 600 }}>
                {calculations.otv_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontWeight: 'bold' }}>
              <span>Ara Toplam:</span>
              <span>
                {calculations.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span className="text-muted">KDV Tutarı (%{form.kdv_rate}):</span>
              <span style={{ fontWeight: 600 }}>
                {calculations.kdv_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </span>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              background: 'rgba(16,185,129,0.1)', 
              border: '1px solid rgba(16,185,129,0.3)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1rem', 
              fontWeight: 'bold',
              fontSize: '1.2rem',
              color: '#10b981'
            }}>
              <span>Genel Toplam:</span>
              <span>
                {calculations.grand_total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
            <div className="text-xs text-muted mb-2">NOTLAR</div>
            <p className="text-xs text-secondary leading-relaxed" style={{ margin: 0 }}>
              * Fiyat teklifi peşin ödemeye göredir.<br />
              * KDV ve ÖTV vergileri yasal oranlara göre hesaplanır.<br />
              * Proforma faturayı kaydettiğinizde sistem otomatik olarak bir teklif numarası verecek (örn: ERC-2025-0001) ve yazdırılabilir profesyonel A4 sayfasını oluşturacaktır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
