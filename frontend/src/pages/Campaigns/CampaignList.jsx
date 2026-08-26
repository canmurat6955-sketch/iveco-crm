import { useState, useEffect } from 'react';
import { campaignsApi, crmApi } from '../../api/client';
import toast from 'react-hot-toast';

const CATEGORY_LABELS = {
  daily_catalog: 'Daily Katalog', eurocargo_catalog: 'Eurocargo Katalog',
  sway_catalog: 'S-Way Katalog', tway_catalog: 'T-Way Katalog',
  body_solutions: 'Hazır Kasa', finance_campaign: 'Finans Kampanyası',
  stock_vehicles: 'Stok Araçlar', offer_pdf: 'Teklif PDF',
};

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'daily_catalog', description: '', validity_start: '', validity_end: '', version: '' });
  const [file, setFile] = useState(null);
  
  // Catalog Excel Upload
  const [showCatalogUpload, setShowCatalogUpload] = useState(false);
  const [catalogFile, setCatalogFile] = useState(null);
  const [uploadingCatalog, setUploadingCatalog] = useState(false);

  const handleCatalogUpload = async (e) => {
    e.preventDefault();
    if (!catalogFile) {
      toast.error('Lütfen bir Excel veya CSV dosyası seçin.');
      return;
    }
    try {
      setUploadingCatalog(true);
      toast.loading('Katalog sisteme yükleniyor...', { id: 'catalog' });
      const res = await crmApi.importVehicles(catalogFile);
      if (res.data.success) {
        toast.success(`Katalog başarıyla güncellendi! ${res.data.imported} araç eklendi, ${res.data.updated} araç güncellendi.`, { id: 'catalog', duration: 5000 });
        setShowCatalogUpload(false);
        setCatalogFile(null);
      } else {
        toast.error(res.data.message || 'Yükleme başarısız.', { id: 'catalog' });
      }
    } catch {
      toast.error('Katalog içe aktarılırken hata oluştu.', { id: 'catalog' });
    } finally {
      setUploadingCatalog(false);
    }
  };

  useEffect(() => {
    campaignsApi.getAll({ category: categoryFilter || undefined })
      .then(r => setCampaigns(r.data)).catch(() => {});
  }, [categoryFilter]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
      if (file) formData.append('file', file);
      await campaignsApi.create(formData);
      toast.success('Kampanya yüklendi');
      setShowAdd(false);
      setFile(null);
      campaignsApi.getAll({ category: categoryFilter || undefined }).then(r => setCampaigns(r.data));
    } catch { toast.error('Yükleme hatası'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Kampanyayı silmek istiyor musunuz?')) return;
    try {
      await campaignsApi.delete(id);
      toast.success('Silindi');
      setCampaigns(c => c.filter(x => x.id !== id));
    } catch { toast.error('Silme hatası'); }
  };

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <button className={`btn btn-sm ${!categoryFilter ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCategoryFilter('')}>Tümü</button>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <button key={k} className={`btn btn-sm ${categoryFilter === k ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCategoryFilter(k)}>{v}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => setShowCatalogUpload(true)}>📁 Fiyat Listesi Yükle (Excel)</button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Yeni Kampanya</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {campaigns.map(c => (
          <div key={c.id} className="card" style={{ position: 'relative' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="badge badge-blue">{CATEGORY_LABELS[c.category] || c.category}</span>
              {c.validity_end && new Date(c.validity_end) < new Date() && <span className="badge badge-red">Süresi Doldu</span>}
            </div>
            <h4 className="font-semibold mb-4" style={{ fontSize: 'var(--font-size-md)' }}>{c.title}</h4>
            {c.description && <p className="text-sm text-muted mb-4">{c.description}</p>}
            <div className="text-xs text-muted mb-4">
              {c.file_name && <p>📄 {c.file_name}</p>}
              {c.version && <p>v{c.version}</p>}
              {c.validity_end && <p>Geçerlilik: {c.validity_end}</p>}
              <p>Yüklenme: {new Date(c.created_at).toLocaleDateString('tr-TR')}</p>
            </div>
            <div className="flex gap-2">
              {c.file_name && <a href={`/api/campaigns/${c.id}/download`} className="btn btn-secondary btn-sm" target="_blank">📥 İndir</a>}
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Sil</button>
            </div>
          </div>
        ))}
        {campaigns.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}><p>Kampanya bulunamadı</p></div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Yeni Kampanya / Katalog</h3>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Başlık *</label>
                <input className="form-input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Kategori *</label>
                  <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Versiyon</label>
                  <input className="form-input" value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} placeholder="1.0" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Açıklama</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Geçerlilik Başlangıç</label>
                  <input className="form-input" type="date" value={form.validity_start} onChange={e => setForm({ ...form, validity_start: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Geçerlilik Bitiş</label>
                  <input className="form-input" type="date" value={form.validity_end} onChange={e => setForm({ ...form, validity_end: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Dosya (PDF, resim vb.)</label>
                <input type="file" className="form-input" onChange={e => setFile(e.target.files[0])} style={{ padding: '0.5rem' }} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Yükle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCatalogUpload && (
        <div className="modal-overlay" onClick={() => setShowCatalogUpload(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Araç Fiyat Listesi Yükle (Excel/CSV)</h3>
            </div>
            <form onSubmit={handleCatalogUpload}>
              <div className="form-group" style={{ margin: '1rem 0' }}>
                <label className="form-label">Excel veya CSV Dosyası *</label>
                <input 
                  type="file" 
                  className="form-input" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={e => setCatalogFile(e.target.files[0])} 
                  style={{ padding: '0.5rem' }} 
                  required 
                />
              </div>
              <div className="text-xs text-muted leading-relaxed mb-4">
                <strong>Kolon Şablonu:</strong> Excel dosyanızın ilk satırında en azından <strong>model</strong> (veya <em>araç</em>) sütunu bulunmalıdır. Diğer opsiyonel sütunlar: <strong>fiyat</strong> (matrah), <strong>motor gücü</strong>, <strong>azami ağırlık</strong>, <strong>renk</strong>, <strong>model yılı</strong>.
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCatalogUpload(false)}>İptal</button>
                <button type="submit" className="btn btn-success" disabled={uploadingCatalog}>
                  {uploadingCatalog ? 'Yükleniyor...' : 'Kataloğu Yükle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
