import { useState, useEffect } from 'react';
import { salesApi, crmApi } from '../../api/client';
import toast from 'react-hot-toast';
import { FiMessageSquare, FiPlus } from 'react-icons/fi';

const STATUS_MAP = {
  sent: { label: 'Gönderildi', badge: 'badge-blue' },
  replied: { label: 'Cevap Geldi', badge: 'badge-purple' },
  offer_given: { label: 'Teklif Verildi', badge: 'badge-amber' },
  follow_up: { label: 'Takip', badge: 'badge-blue' },
  hot_lead: { label: 'Sıcak Müşteri', badge: 'badge-red' },
  converted: { label: 'Kazanıldı', badge: 'badge-green' },
  lost: { label: 'Kayıp', badge: 'badge-red' },
};

export default function SalesActivityPage() {
  const [activities, setActivities] = useState([]);
  const [pipeline, setPipeline] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ customer_id: '', activity_type: 'whatsapp', template_used: '', message_content: '', status: 'sent', next_follow_up: '' });
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    salesApi.getActivities({ status: statusFilter || undefined }).then(r => setActivities(r.data)).catch(() => {});
    salesApi.getPipeline().then(r => setPipeline(r.data)).catch(() => {});
    salesApi.getTemplates().then(r => setTemplates(r.data)).catch(() => {});
  }, [statusFilter]);

  const openAddModal = async () => {
    try {
      const res = await crmApi.getCustomers({ page: 1, page_size: 100 });
      setCustomers(res.data.items);
      setShowAdd(true);
    } catch { toast.error('Müşteriler yüklenemedi'); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, customer_id: parseInt(form.customer_id) };
      if (!data.next_follow_up) delete data.next_follow_up;
      await salesApi.createActivity(data);
      toast.success('Aktivite oluşturuldu');
      setShowAdd(false);
      salesApi.getActivities({ status: statusFilter || undefined }).then(r => setActivities(r.data));
      salesApi.getPipeline().then(r => setPipeline(r.data));
    } catch (err) { toast.error(err.response?.data?.detail || 'Hata'); }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await salesApi.updateActivity(id, { status: newStatus });
      toast.success('Durum güncellendi');
      salesApi.getActivities({ status: statusFilter || undefined }).then(r => setActivities(r.data));
      salesApi.getPipeline().then(r => setPipeline(r.data));
    } catch { toast.error('Güncelleme hatası'); }
  };

  const openWhatsApp = async (customerId) => {
    try {
      const template = templates.find(t => t.category === 'introduction');
      const msg = template ? template.content : 'Merhaba, Iveco yetkili bayisinden arıyoruz.';
      const res = await salesApi.getWhatsAppLink(customerId, msg);
      window.open(res.data.link, '_blank');
    } catch { toast.error('WhatsApp linki oluşturulamadı'); }
  };

  const selectTemplate = (templateId) => {
    const t = templates.find(x => x.id === parseInt(templateId));
    if (t) setForm({ ...form, template_used: t.name, message_content: t.content });
  };

  const PIPELINE_COLORS = { sent: '#3b82f6', replied: '#8b5cf6', offer_given: '#f59e0b', follow_up: '#06b6d4', hot_lead: '#ef4444', converted: '#10b981', lost: '#64748b' };

  return (
    <div className="animate-in">
      {/* Pipeline */}
      {pipeline && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="card-title">Pipeline Özeti</h3>
            <span className="text-xs text-muted">Toplam: {pipeline.total}</span>
          </div>
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {Object.entries(STATUS_MAP).map(([key, { label }]) => (
              <div key={key} style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setStatusFilter(key === statusFilter ? '' : key)}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: PIPELINE_COLORS[key] }}>{pipeline[key] || 0}</div>
                <div className="text-xs text-muted">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button className={`btn btn-sm ${!statusFilter ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStatusFilter('')}>Tümü</button>
          {Object.entries(STATUS_MAP).map(([k, { label }]) => (
            <button key={k} className={`btn btn-sm ${statusFilter === k ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStatusFilter(k)}>{label}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={openAddModal} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><FiPlus size={16} /> Yeni Aktivite</button>
      </div>

      {/* Activities Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Müşteri</th><th>Kanal</th><th>Durum</th><th>Takip</th><th>Tarih</th><th>İşlem</th></tr></thead>
          <tbody>
            {activities.length > 0 ? activities.map(a => (
              <tr key={a.id}>
                <td className="font-semibold">{a.customer_name || `#${a.customer_id}`}</td>
                <td><span className="badge badge-blue">{a.activity_type}</span></td>
                <td><span className={`badge ${STATUS_MAP[a.status]?.badge || 'badge-blue'}`}>{STATUS_MAP[a.status]?.label || a.status}</span></td>
                <td className="text-muted text-sm">{a.next_follow_up || '—'}</td>
                <td className="text-muted text-xs">{new Date(a.created_at).toLocaleDateString('tr-TR')}</td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-sm btn-secondary" onClick={() => openWhatsApp(a.customer_id)} title="WhatsApp" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, padding: 0 }}><FiMessageSquare size={14} /></button>
                    <select className="form-select" style={{ width: 130, padding: '2px 6px', fontSize: '0.7rem' }}
                      value={a.status} onChange={e => updateStatus(a.id, e.target.value)}>
                      {Object.entries(STATUS_MAP).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
                    </select>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan={6} className="empty-state">Aktivite yok</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Yeni Satış Aktivitesi</h3>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Müşteri *</label>
                <select className="form-select" required value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}>
                  <option value="">Seçin...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.company_name} — {c.city || ''}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Kanal</label>
                  <select className="form-select" value={form.activity_type} onChange={e => setForm({ ...form, activity_type: e.target.value })}>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="call">Telefon</option>
                    <option value="email">E-posta</option>
                    <option value="visit">Ziyaret</option>
                    <option value="meeting">Toplantı</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Şablon</label>
                  <select className="form-select" onChange={e => selectTemplate(e.target.value)}>
                    <option value="">Şablon seçin...</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Mesaj</label>
                <textarea className="form-textarea" value={form.message_content} onChange={e => setForm({ ...form, message_content: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Sonraki Takip Tarihi</label>
                <input className="form-input" type="date" value={form.next_follow_up} onChange={e => setForm({ ...form, next_follow_up: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Oluştur</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
