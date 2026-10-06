import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPhone, FiMessageSquare, FiSearch, FiTrash2, FiBriefcase, FiEdit2, FiX, FiUserPlus } from 'react-icons/fi';
import { contactsApi } from '../../api/client';

const waLink = (phone) => {
  let d = (phone || '').replace(/\D/g, '');
  if (d.startsWith('0')) d = d.slice(1);
  if (!d.startsWith('90')) d = '90' + d;
  return `https://wa.me/${d}`;
};

export default function PersonalContacts() {
  const navigate = useNavigate();
  const [data, setData] = useState({ items: [], total: 0, page: 1, total_pages: 1 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);   // {id?, full_name, phone, city, notes}
  const [converting, setConverting] = useState(null); // {id, company_name, sector}
  const debounce = useRef();

  const load = (p = page, s = search) => {
    setLoading(true);
    contactsApi.list({ page: p, page_size: 30, search: s || undefined })
      .then(r => setData(r.data))
      .catch(() => toast.error('Kişiler yüklenemedi'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page, search); }, [page]);

  const onSearch = (v) => {
    setSearch(v);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { setPage(1); load(1, v); }, 300);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing.full_name?.trim()) return toast.error('İsim boş olamaz');
    try {
      const payload = { full_name: editing.full_name, phone: editing.phone || null, city: editing.city || null, notes: editing.notes || null };
      if (editing.id) await contactsApi.update(editing.id, payload);
      else await contactsApi.create(payload);
      toast.success('Kişi kaydedildi');
      setEditing(null);
      load();
    } catch { toast.error('Kaydedilemedi'); }
  };

  const remove = async (c) => {
    if (!confirm(`"${c.full_name}" kişisi silinsin mi?`)) return;
    try { await contactsApi.remove(c.id); toast.success('Silindi'); load(); }
    catch { toast.error('Silinemedi'); }
  };

  const doConvert = async (e) => {
    e.preventDefault();
    try {
      const r = await contactsApi.convertToCustomer(converting.id, {
        company_name: converting.company_name || undefined,
        sector: converting.sector || undefined,
      });
      toast.success('Firma kaydı oluşturuldu (Müşteri Havuzu)');
      setConverting(null);
      navigate(`/customers/${r.data.customer_id}`);
    } catch { toast.error('Dönüştürülemedi'); }
  };

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>📇 Kişilerim</h2>
          <p className="text-muted" style={{ fontSize: '0.82rem' }}>
            Telefon rehberinden gelen kişiler. Firma listesini ve Pipeline'ı etkilemez. Gerektiğinde tek tıkla firmaya dönüştürebilirsiniz.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing({ full_name: '', phone: '', city: '', notes: '' })}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <FiUserPlus size={14} /> Yeni Kişi
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: 12, maxWidth: 480 }}>
        <input className="form-input" placeholder="İsim, telefon, şehir veya not ile ara..." value={search}
          onChange={e => onSearch(e.target.value)} style={{ paddingLeft: 34 }} />
        <FiSearch size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      </div>
      <div className="text-muted" style={{ fontSize: '0.78rem', marginBottom: 10 }}>
        {loading ? 'Yükleniyor...' : `${data.total.toLocaleString('tr-TR')} kişi`}
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {data.items.map(c => (
          <div key={c.id} className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{c.full_name}</div>
              <div className="text-muted" style={{ fontSize: '0.78rem', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span>{c.phone || 'Telefon yok'}</span>
                {c.city && <span>📍 {c.city}</span>}
                {c.notes && <span style={{ maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📝 {c.notes}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {c.phone && (
                <>
                  <a href={`tel:${c.phone}`} className="btn btn-xs" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                    <FiPhone size={12} /> Ara
                  </a>
                  <a href={waLink(c.phone)} target="_blank" rel="noreferrer" className="btn btn-xs" style={{ background: 'rgba(37,211,102,0.15)', color: '#25d366', border: '1px solid rgba(37,211,102,0.3)', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                    <FiMessageSquare size={12} /> WhatsApp
                  </a>
                </>
              )}
              <button className="btn btn-xs" onClick={() => setConverting({ id: c.id, company_name: c.full_name, sector: '' })}
                style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                title="Bu kişiyi firma (müşteri) kaydına dönüştür">
                <FiBriefcase size={12} /> Firmaya Dönüştür
              </button>
              <button className="btn btn-xs btn-secondary" onClick={() => setEditing({ ...c })} title="Düzenle"><FiEdit2 size={12} /></button>
              <button className="btn btn-xs btn-secondary" onClick={() => remove(c)} title="Sil" style={{ color: '#f87171' }}><FiTrash2 size={12} /></button>
            </div>
          </div>
        ))}
        {!loading && data.items.length === 0 && (
          <div className="card text-center text-muted" style={{ padding: '2rem' }}>Kişi bulunamadı</div>
        )}
      </div>

      {data.total_pages > 1 && (
        <div className="flex items-center justify-center gap-3" style={{ marginTop: 16 }}>
          <button className="btn btn-sm btn-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Önceki</button>
          <span className="text-muted" style={{ fontSize: '0.82rem' }}>{page} / {data.total_pages}</span>
          <button className="btn btn-sm btn-secondary" disabled={page >= data.total_pages} onClick={() => setPage(p => p + 1)}>Sonraki →</button>
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontWeight: 800 }}>{editing.id ? 'Kişiyi Düzenle' : 'Yeni Kişi'}</h3>
              <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><FiX size={18} /></button>
            </div>
            <form onSubmit={saveEdit}>
              <div className="form-group"><label className="form-label">Ad Soyad / Açıklama *</label>
                <input className="form-input" value={editing.full_name} onChange={e => setEditing({ ...editing, full_name: e.target.value })} autoFocus /></div>
              <div className="form-group"><label className="form-label">Telefon</label>
                <input className="form-input" value={editing.phone || ''} onChange={e => setEditing({ ...editing, phone: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Şehir</label>
                <input className="form-input" value={editing.city || ''} onChange={e => setEditing({ ...editing, city: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Not</label>
                <textarea className="form-input" rows={3} value={editing.notes || ''} onChange={e => setEditing({ ...editing, notes: e.target.value })} /></div>
              <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {converting && (
        <div className="modal-overlay" onClick={() => setConverting(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontWeight: 800 }}>Firmaya Dönüştür</h3>
              <button onClick={() => setConverting(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><FiX size={18} /></button>
            </div>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 12 }}>
              Firma kaydı Müşteri Havuzu'na eklenir. Pipeline'a almak isterseniz firma sayfasından "Pipeline'a Ekle" diyebilirsiniz.
            </p>
            <form onSubmit={doConvert}>
              <div className="form-group"><label className="form-label">Firma Adı</label>
                <input className="form-input" value={converting.company_name} onChange={e => setConverting({ ...converting, company_name: e.target.value })} autoFocus /></div>
              <div className="form-group"><label className="form-label">Sektör</label>
                <input className="form-input" placeholder="ör: Nakliyat, Gıda, İnşaat" value={converting.sector} onChange={e => setConverting({ ...converting, sector: e.target.value })} /></div>
              <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setConverting(null)}>İptal</button>
                <button type="submit" className="btn btn-primary">Firma Oluştur</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
