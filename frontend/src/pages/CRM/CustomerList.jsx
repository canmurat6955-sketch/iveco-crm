import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crmApi } from '../../api/client';
import toast from 'react-hot-toast';
import { FiDownload, FiPlus, FiTrash2, FiCheckSquare, FiSquare, FiGitMerge, FiUsers } from 'react-icons/fi';

const SEGMENTS = { A: 'badge-green', B: 'badge-blue', C: 'badge-amber', D: 'badge-red' };
const POTENTIALS = { very_high: 'Çok Yüksek', high: 'Yüksek', medium: 'Orta', low: 'Düşük' };

export default function CustomerList() {
  const [customers, setCustomers] = useState({ items: [], total: 0, page: 1, total_pages: 1 });
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [sector, setSector] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [showMerge, setShowMerge] = useState(false);
  const [merging, setMerging] = useState(false);
  const [form, setForm] = useState({ company_name: '', city: '', district: '', phone: '', email: '', sector: '', segment: 'C', potential_level: 'medium' });
  const navigate = useNavigate();

  const load = () => {
    crmApi.getCustomers({ page, page_size: 15, search: search || undefined, city: city || undefined, sector: sector || undefined })
      .then(r => setCustomers(r.data))
      .catch(() => toast.error('Müşteriler yüklenemedi'));
  };

  useEffect(() => { load(); }, [page, search, city, sector]);

  // Seçim değişince sayfayı temizle
  useEffect(() => { setSelected(new Set()); }, [page, search, city, sector]);

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === customers.items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(customers.items.map(c => c.id)));
    }
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`${selected.size} müşteri kalıcı olarak silinecek. Emin misiniz?`)) return;
    setDeleting(true);
    try {
      await crmApi.bulkDelete([...selected]);
      toast.success(`${selected.size} müşteri silindi`);
      setSelected(new Set());
      load();
    } catch (err) {
      toast.error('Silme hatası');
    } finally {
      setDeleting(false);
    }
  };

  const deleteSingle = async (id, name, e) => {
    e.stopPropagation();
    if (!confirm(`"${name}" kalıcı olarak silinecek. Emin misiniz?`)) return;
    try {
      await crmApi.deleteCustomer(id);
      toast.success('Müşteri silindi');
      load();
    } catch {
      toast.error('Silme hatası');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await crmApi.createCustomer(form);
      toast.success('Müşteri eklendi');
      setShowAdd(false);
      setForm({ company_name: '', city: '', district: '', phone: '', email: '', sector: '', segment: 'C', potential_level: 'medium' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Hata oluştu');
    }
  };

  const handleMerge = async (primaryId) => {
    const secondaryIds = [...selected].filter(id => id !== primaryId);
    if (secondaryIds.length === 0) return;
    setMerging(true);
    try {
      const res = await crmApi.mergeCustomers(primaryId, secondaryIds);
      toast.success(res.data.message);
      setShowMerge(false);
      setSelected(new Set());
      load();
      // Birleştirilen ana firmaya git
      navigate(`/customers/${primaryId}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Birleştirme hatası');
    } finally {
      setMerging(false);
    }
  };

  const allChecked = customers.items.length > 0 && selected.size === customers.items.length;

  return (
    <div className="animate-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div className="flex gap-3" style={{ flex: 1, maxWidth: 700 }}>
          <input className="form-input" placeholder="Firma adı, telefon veya e-posta ile ara..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <select className="form-select" style={{ width: 150 }} value={city} onChange={e => { setCity(e.target.value); setPage(1); }}>
            <option value="">Tüm Şehirler</option>
            <option value="Samsun">Samsun</option>
            <option value="Amasya">Amasya</option>
            <option value="Tokat">Tokat</option>
            <option value="Çorum">Çorum</option>
            <option value="Ordu">Ordu</option>
            <option value="Sinop">Sinop</option>
            <option value="Bilinmiyor">Bilinmiyor</option>
          </select>
          <select className="form-select" style={{ width: 180 }} value={sector} onChange={e => { setSector(e.target.value); setPage(1); }}>
            <option value="">Tüm Sektörler</option>
            <option value="Nakliyat">Nakliyat / Lojistik</option>
            <option value="İnşaat">İnşaat / Yapı</option>
            <option value="Otomotiv">Otomotiv</option>
            <option value="Gıda">Gıda / Tarım</option>
            <option value="Tarım">Tarım / Hayvancılık</option>
            <option value="Metal">Metal / Demir Çelik</option>
            <option value="Makine">Makine / Ekipman</option>
            <option value="Tekstil">Tekstil</option>
            <option value="Petrol">Petrol / Enerji</option>
            <option value="Elektrik">Elektrik / Enerji</option>
            <option value="Plastik">Plastik / Ambalaj</option>
            <option value="Mobilya">Mobilya / Ahşap</option>
            <option value="Sağlık">Sağlık / İlaç</option>
            <option value="Turizm">Turizm / Konaklama</option>
            <option value="Diğer">Diğer</option>
          </select>
        </div>
        <div className="flex gap-3">
          {selected.size > 0 && (
            <>
              {selected.size >= 2 && (
                <button className="btn btn-sm" onClick={() => setShowMerge(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none' }}>
                  <FiGitMerge size={14} /> {selected.size} Kayıt Birleştir
                </button>
              )}
              <button className="btn btn-sm" onClick={deleteSelected} disabled={deleting}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ef4444', color: '#fff', border: 'none' }}>
                <FiTrash2 size={14} /> {deleting ? 'Siliniyor...' : `${selected.size} Seçili Sil`}
              </button>
            </>
          )}
          <button className="btn btn-secondary" onClick={() => navigate('/customers/import')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><FiDownload size={16} /> İçe Aktar</button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><FiPlus size={16} /> Yeni Müşteri</button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-6 text-xs text-muted">
        <span>Toplam: {customers.total} müşteri</span>
        <span>Sayfa: {customers.page} / {customers.total_pages}</span>
        {selected.size > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}>{selected.size} seçili</span>}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40, cursor: 'pointer', textAlign: 'center' }} onClick={toggleAll}>
                {allChecked ? <FiCheckSquare size={16} style={{ color: 'var(--accent-blue-light)' }} /> : <FiSquare size={16} />}
              </th>
              <th>Firma Adı</th><th>Şehir</th><th>Sektör</th><th className="hide-on-mobile">Telefon</th>
              <th>Segment</th><th className="hide-on-mobile">Öncelik</th><th>Potansiyel</th><th className="hide-on-mobile">Skor</th><th className="hide-on-mobile">Kaynak</th>
              <th style={{ width: 50 }}></th>
            </tr>
          </thead>
          <tbody>
            {customers.items.length > 0 ? customers.items.map(c => (
              <tr key={c.id} className="clickable-row" onClick={() => navigate(`/customers/${c.id}`)}
                style={selected.has(c.id) ? { background: 'rgba(59,130,246,0.08)' } : undefined}>
                <td style={{ textAlign: 'center' }} onClick={e => toggleSelect(c.id, e)}>
                  {selected.has(c.id) ? <FiCheckSquare size={16} style={{ color: 'var(--accent-blue-light)' }} /> : <FiSquare size={16} style={{ color: 'var(--text-muted)' }} />}
                </td>
                <td className="font-semibold">{c.company_name}</td>
                <td>{c.city || '—'} {c.district ? `/ ${c.district}` : ''}</td>
                <td className="text-muted">{c.sector || '—'}</td>
                <td className="hide-on-mobile">{c.phone || '—'}</td>
                <td><span className={`badge ${SEGMENTS[c.segment] || 'badge-blue'}`}>{c.segment}</span></td>
                <td className="hide-on-mobile">
                  <span className="badge" style={{
                    background: c.priority_score >= 70 ? 'rgba(239, 68, 68, 0.12)' : c.priority_score >= 40 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(156, 163, 175, 0.12)',
                    color: c.priority_score >= 70 ? '#f87171' : c.priority_score >= 40 ? '#fbbf24' : '#9ca3af',
                    border: `1px solid ${c.priority_score >= 70 ? 'rgba(239, 68, 68, 0.25)' : c.priority_score >= 40 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(156, 163, 175, 0.25)'}`,
                    fontWeight: 700
                  }}>
                    {c.priority_score}%
                  </span>
                </td>
                <td><span className="text-sm">{POTENTIALS[c.potential_level] || c.potential_level}</span></td>
                <td className="hide-on-mobile">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{c.potential_score}</span>
                    <div className="score-bar" style={{ width: 50 }}>
                      <div className={`score-bar-fill ${c.potential_score >= 75 ? 'very-high' : c.potential_score >= 55 ? 'high' : c.potential_score >= 35 ? 'medium' : 'low'}`}
                        style={{ width: `${c.potential_score}%` }} />
                    </div>
                  </div>
                </td>
                <td className="hide-on-mobile"><span className="badge badge-blue">{c.source}</span></td>
                <td onClick={e => e.stopPropagation()}>
                  <button onClick={e => deleteSingle(c.id, c.company_name, e)} title="Sil"
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, borderRadius: 4, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#ef4444'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                    <FiTrash2 size={14} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={10} className="empty-state">Müşteri bulunamadı</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {customers.total_pages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Önceki</button>
          {Array.from({ length: Math.min(5, customers.total_pages) }, (_, i) => {
            const p = Math.max(1, page - 2) + i;
            if (p > customers.total_pages) return null;
            return <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>;
          })}
          <button disabled={page >= customers.total_pages} onClick={() => setPage(p => p + 1)}>Sonraki →</button>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Yeni Müşteri Ekle</h3>
            <form onSubmit={handleAdd}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Firma Adı *</label>
                  <input className="form-input" required value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Vergi No</label>
                  <input className="form-input" value={form.tax_number || ''} onChange={e => setForm({ ...form, tax_number: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Şehir</label>
                  <input className="form-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">İlçe</label>
                  <input className="form-input" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">E-posta</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Sektör</label>
                  <input className="form-input" value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Web Sitesi</label>
                  <input className="form-input" value={form.website || ''} onChange={e => setForm({ ...form, website: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Segment</label>
                  <select className="form-select" value={form.segment} onChange={e => setForm({ ...form, segment: e.target.value })}>
                    <option value="A">A — Premium</option>
                    <option value="B">B — Yüksek</option>
                    <option value="C">C — Orta</option>
                    <option value="D">D — Düşük</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Potansiyel</label>
                  <select className="form-select" value={form.potential_level} onChange={e => setForm({ ...form, potential_level: e.target.value })}>
                    <option value="very_high">Çok Yüksek</option>
                    <option value="high">Yüksek</option>
                    <option value="medium">Orta</option>
                    <option value="low">Düşük</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notlar</label>
                <textarea className="form-textarea" value={form.sales_notes || ''} onChange={e => setForm({ ...form, sales_notes: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Merge Modal */}
      {showMerge && (
        <div className="modal-overlay" onClick={() => setShowMerge(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 className="modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiGitMerge size={20} style={{ color: '#8b5cf6' }} /> Kayıtları Birleştir
              </h3>
            </div>
            <p className="text-sm text-muted mb-6">Ana firmayı seçin. Diğer kayıtlar bu firmanın <strong>irtibat kişisi</strong> olarak taşınacak.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 400, overflowY: 'auto' }}>
              {customers.items.filter(c => selected.has(c.id)).map(c => (
                <div key={c.id}
                  onClick={() => !merging && handleMerge(c.id)}
                  style={{
                    background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '0.875rem',
                    border: '2px solid transparent', cursor: merging ? 'wait' : 'pointer',
                    transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'var(--bg-input)'; }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.company_name}</div>
                    <div className="text-xs text-muted" style={{ marginTop: 4 }}>
                      {c.city || '?'} • {c.sector || '?'} • {c.phone || 'Tel yok'}
                    </div>
                  </div>
                  <span className="badge" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: '0.7rem' }}>
                    🏢 Ana Firma Yap
                  </span>
                </div>
              ))}
            </div>
            <div className="modal-actions" style={{ marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowMerge(false)}>İptal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
