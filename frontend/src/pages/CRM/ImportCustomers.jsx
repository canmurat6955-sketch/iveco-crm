import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crmApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function ImportCustomers() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Dosya seçin');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await crmApi.importFile(formData);
      setResult(res.data);
      toast.success(`${res.data.imported} müşteri aktarıldı`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'İçe aktarma hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in" style={{ maxWidth: 700 }}>
      <button className="btn btn-secondary mb-6" onClick={() => navigate('/customers')}>← Müşteri Listesi</button>

      <div className="card">
        <h3 className="card-title mb-6">Excel / CSV İçe Aktar</h3>

        <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem', border: '1px dashed var(--border-color)' }}>
          <p className="text-sm text-muted mb-4">Desteklenen formatlar: <strong>.xlsx, .xls, .csv</strong></p>
          <p className="text-xs text-muted mb-4">Tanınan kolon başlıkları: firma, şehir, ilçe, telefon, e-posta, web, sektör, segment, notlar, vergi no</p>
        </div>

        <form onSubmit={handleImport}>
          <div className="form-group">
            <label className="form-label">Dosya Seçin</label>
            <input type="file" accept=".xlsx,.xls,.csv" className="form-input" onChange={e => setFile(e.target.files[0])} style={{ padding: '0.5rem' }} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || !file}>
            {loading ? 'İşleniyor...' : '📥 İçe Aktar'}
          </button>
        </form>

        {result && (
          <div className="mt-6" style={{ padding: '1.5rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <h4 className="font-semibold mb-4">İçe Aktarma Sonucu</h4>
            <div className="form-row">
              <p className="text-sm">Toplam satır: <strong>{result.total_rows}</strong></p>
              <p className="text-sm" style={{ color: 'var(--accent-green)' }}>Aktarılan: <strong>{result.imported}</strong></p>
              <p className="text-sm" style={{ color: 'var(--accent-amber)' }}>Duplicate: <strong>{result.duplicates}</strong></p>
              <p className="text-sm" style={{ color: 'var(--accent-red)' }}>Hata: <strong>{result.errors}</strong></p>
            </div>
            {result.error_details.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-muted mb-4">Detaylar:</p>
                <ul style={{ fontSize: '0.75rem', color: 'var(--text-muted)', listStyle: 'disc', paddingLeft: '1.5rem' }}>
                  {result.error_details.slice(0, 10).map((d, i) => <li key={i}>{d}</li>)}
                  {result.error_details.length > 10 && <li>...ve {result.error_details.length - 10} detay daha</li>}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
