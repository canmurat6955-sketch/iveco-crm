import { useState, useEffect } from 'react';
import { campaignsApi } from '../../api/client';
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
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Yeni Kampanya</button>
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
    </div>
  );
}
