import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignsApi, getBaseUrl } from '../../api/client';
import toast from 'react-hot-toast';
import { 
  FiFileText, FiCreditCard, FiUploadCloud, FiPlus, FiTrash2, 
  FiCheck, FiX, FiRefreshCw, FiDollarSign, FiClock, FiChevronDown, FiChevronUp,
  FiEye, FiExternalLink, FiMessageSquare
} from 'react-icons/fi';

const CATEGORY_LABELS = {
  daily_catalog: 'Daily Katalog', eurocargo_catalog: 'Eurocargo Katalog',
  sway_catalog: 'S-Way Katalog', tway_catalog: 'T-Way Katalog',
  body_solutions: 'Hazır Kasa', finance_campaign: 'Finans Kampanyası',
  stock_vehicles: 'Stok Araçlar', offer_pdf: 'Teklif PDF',
};

export default function CampaignList() {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState('financing'); // 'financing' | 'catalogs'

  // ── 1. Standart Kampanyalar / Kataloglar State'leri ──
  const [campaigns, setCampaigns] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'daily_catalog', description: '', validity_start: '', validity_end: '', version: '' });
  const [file, setFile] = useState(null);

  // ── 2. Banka Çatı Finansmanı & Taksit Matrisleri State'leri ──
  const [financingMatrices, setFinancingMatrices] = useState([]);
  const [financingGroupFilter, setFinancingGroupFilter] = useState(''); // '' | 'light_medium' | 'heavy'
  const [loadingMatrices, setLoadingMatrices] = useState(false);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const excelInputRef = useRef(null);

  // ── 3. WhatsApp Kampanya İletilen Firmalar State'leri ──
  const [recipients, setRecipients] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [showRecipients, setShowRecipients] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  // Yeni Manuel Matris Modal
  const [showAddMatrix, setShowAddMatrix] = useState(false);
  const [matrixForm, setMatrixForm] = useState({
    bank_name: 'Kuveyt Türk',
    vehicle_group: 'light_medium',
    campaign_name: '',
    applicable_models: 'Daily 35 Şasi & Van',
    validity_period: 'Ekim - Kasım 2026',
    notes: '',
    tiers: [
      {
        principal: 1000000,
        formatted_principal: '1.000.000 TL',
        terms: [
          { months: 24, grace_months: 6, monthly_payment: 62390, rate: '%2.21' },
          { months: 36, grace_months: 6, monthly_payment: 48808, rate: '%2.40' }
        ]
      }
    ]
  });

  const loadCatalogs = () => {
    campaignsApi.getAll({ category: categoryFilter || undefined })
      .then(r => setCampaigns(r.data || [])).catch(() => {});
  };

  const loadFinancing = () => {
    setLoadingMatrices(true);
    campaignsApi.getFinancingMatrices({ vehicle_group: financingGroupFilter || undefined })
      .then(r => setFinancingMatrices(r.data || []))
      .catch(() => {})
      .finally(() => setLoadingMatrices(false));

    // WhatsApp ile iletilen ve okunan firmaları yükle
    campaignsApi.getOutreachRecipients()
      .then(r => setRecipients(r.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    if (mainTab === 'catalogs') {
      loadCatalogs();
    } else {
      loadFinancing();
    }
  }, [mainTab, categoryFilter, financingGroupFilter]);

  // ── Katalog İşlemleri ──
  const handleAddCatalog = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
      if (file) formData.append('file', file);
      await campaignsApi.create(formData);
      toast.success('Kampanya yüklendi');
      setShowAdd(false);
      setFile(null);
      loadCatalogs();
    } catch { toast.error('Yükleme hatası'); }
  };

  const handleDeleteCatalog = async (id) => {
    if (!confirm('Kampanyayı silmek istiyor musunuz?')) return;
    try {
      await campaignsApi.delete(id);
      toast.success('Silindi');
      setCampaigns(c => c.filter(x => x.id !== id));
    } catch { toast.error('Silme hatası'); }
  };

  // ── Excel Yükleme İşlemi ──
  const handleExcelUpload = async (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    try {
      setUploadingExcel(true);
      toast.loading('Kampanya Excel dosyası taranıyor ve oranlar matrise aktarılıyor...', { id: 'xl_load' });
      const formData = new FormData();
      formData.append('file', uploadedFile);
      const res = await campaignsApi.uploadCampaignExcel(formData);
      toast.success(res.data?.message || 'Banka çatı matrisleri başarıyla aktarıldı! 🚀', { id: 'xl_load' });
      loadFinancing();
    } catch (err) {
      console.error(err);
      toast.error('Excel dosyası aktarılırken bir hata oluştu.', { id: 'xl_load' });
    } finally {
      setUploadingExcel(false);
      if (excelInputRef.current) excelInputRef.current.value = '';
    }
  };

  const handleDeleteMatrix = async (id) => {
    if (!confirm('Bu çatı finansman matrisini silmek istediğinize emin misiniz?')) return;
    try {
      await campaignsApi.deleteFinancingMatrix(id);
      toast.success('Finansman matrisi silindi.');
      setFinancingMatrices(prev => prev.filter(m => m.id !== id));
    } catch {
      toast.error('Silme işlemi başarısız.');
    }
  };

  const handleToggleMatrixStatus = async (matrix) => {
    try {
      const updated = !matrix.is_active;
      await campaignsApi.updateFinancingMatrix(matrix.id, { is_active: updated });
      toast.success(`Matris ${updated ? 'aktif' : 'pasif'} duruma getirildi.`);
      setFinancingMatrices(prev => prev.map(m => m.id === matrix.id ? { ...m, is_active: updated } : m));
    } catch {
      toast.error('Güncelleme hatası.');
    }
  };

  const handleSaveManualMatrix = async (e) => {
    e.preventDefault();
    if (!matrixForm.campaign_name.trim()) {
      toast.error('Lütfen bir kampanya adı girin.');
      return;
    }

    try {
      await campaignsApi.createFinancingMatrix({
        bank_name: matrixForm.bank_name,
        vehicle_group: matrixForm.vehicle_group,
        campaign_name: matrixForm.campaign_name,
        applicable_models: matrixForm.applicable_models,
        validity_period: matrixForm.validity_period,
        notes: matrixForm.notes,
        tiers_json: JSON.stringify(matrixForm.tiers),
        is_active: true
      });
      toast.success('Yeni çatı kampanya matrisi kaydedildi! 🎉');
      setShowAddMatrix(false);
      loadFinancing();
    } catch {
      toast.error('Kayıt sırasında hata oluştu.');
    }
  };

  return (
    <div className="animate-in">
      {/* Üst Ana Tab Seçimi */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.75rem',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${mainTab === 'financing' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMainTab('financing')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <FiCreditCard size={15} />
            <span>Banka Çatı Kampanyaları & Matrisler</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mainTab === 'catalogs' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMainTab('catalogs')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <FiFileText size={15} />
            <span>Katalog & Dosya Arşivi</span>
          </button>
        </div>

        {/* Sağ Üst Hızlı Aksiyonlar */}
        {mainTab === 'financing' ? (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="file"
              ref={excelInputRef}
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => excelInputRef.current?.click()}
              disabled={uploadingExcel}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#10b981', borderColor: '#10b981' }}
              title="Bankadan gelen LM_EYLÜL veya HEAVY Excel tablosunu yükleyerek oranları otomatik içe aktarın"
            >
              <FiUploadCloud size={15} />
              <span>{uploadingExcel ? 'İçe Aktarılıyor...' : 'Kampanya Exceli Yükle (.xlsx)'}</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddMatrix(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <FiPlus size={15} />
              <span>+ Yeni Matris Ekle</span>
            </button>
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            + Yeni Dosya Yükle
          </button>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: BANKA ÇATI KAMPANYALARI & TAKSİT MATRİSLERİ
         ───────────────────────────────────────────────────────────── */}
      {mainTab === 'financing' && (
        <div>
          {/* Alt Grup Filtreleri */}
          <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <div className="flex gap-2">
              <button
                className={`btn btn-sm ${!financingGroupFilter ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFinancingGroupFilter('')}
              >
                Tüm Gruplar
              </button>
              <button
                className={`btn btn-sm ${financingGroupFilter === 'light_medium' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFinancingGroupFilter('light_medium')}
              >
                🚚 L&M (Daily 35, 70C & Eurocargo)
              </button>
              <button
                className={`btn btn-sm ${financingGroupFilter === 'heavy' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFinancingGroupFilter('heavy')}
              >
                🚛 HEAVY (S-Way, T-Way, X-Way)
              </button>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Toplam {financingMatrices.length} aktif çatı anlaşması tanımlı
            </div>
          </div>

          {/* WhatsApp Kampanya Gönderilen & Okunan 14 Samsun Nakliyat/Ambar Firması */}
          {recipients.length > 0 && (
            <div className="card mb-6" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 78, 59, 0.15))',
              border: '1.5px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 12,
              padding: '1.25rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{
                      background: '#10b981',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 6,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      ✓✓ %100 OKUNDU
                    </span>
                    <span style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6
                    }}>
                      IVECO Daily Şasi (35C16 / 70C)
                    </span>
                    <span style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#fbbf24',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6
                    }}>
                      Kuveyt Türk 6 Ay Ödemesiz Bayi Katkılı
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '6px 0 2px 0', color: 'var(--text-heading)' }}>
                    📬 Kampanya İletilen ve Okunan Firmalar ({recipients.length} Firma)
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                    Samsun bölgesi ambar, kargo ve lojistik firmalarına WhatsApp üzerinden görsel ve resmi kampanya mesajı iletildi. Tüm firmalar tarafından çift tık ile okundu.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-xs btn-secondary"
                    onClick={() => setPreviewImage('/campaigns/kuveyt_turk_daily_6ay.png')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', borderColor: '#10b981', color: '#10b981' }}
                  >
                    <FiEye size={13} />
                    <span>Kampanya Görselini Gör</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-secondary"
                    onClick={() => setShowRecipients(!showRecipients)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
                  >
                    {showRecipients ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                    <span>{showRecipients ? 'Listeyi Gizle' : `Firmaları Göster (${recipients.length})`}</span>
                  </button>
                </div>
              </div>

              {/* Mesaj Önizleme Kutusu */}
              <div style={{
                marginTop: 12,
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px dashed rgba(16, 185, 129, 0.3)',
                borderRadius: 8,
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.1rem' }}>💬</span>
                  <span>
                    <strong>İletilen Resmi Mesaj:</strong> "Ben IVECO ERC Samsun Otomotiv Satış Sorumlusu Can Murat Onay. Sizin için hazırladığımız avantajlı IVECO Daily Şasi kampanyamızı sizinle paylaşmak istedim. Düşünürseniz detayları ve araç özelliklerini görüşmekten memnuniyet duyarım."
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>Temsilci: Can Murat Onay (0544 622 59 31)</span> • <span>Eki: Kuveyt Türk Taksit Tablosu</span>
                </div>
              </div>

              {/* Firma Listesi Kartları / Tablosu */}
              {showRecipients && (
                <div style={{
                  marginTop: 14,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '0.75rem'
                }}>
                  {recipients.map(r => (
                    <div
                      key={r.id}
                      onClick={() => navigate(`/customers/${r.customer_id}`)}
                      style={{
                        background: 'var(--bg-card, #1e293b)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: 8,
                        padding: '10px 12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#10b981';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.25)';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-heading)' }}>
                            {r.company_name}
                          </div>
                          <span style={{
                            background: '#dcfce7',
                            color: '#166534',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: 4,
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3
                          }}>
                            ✓✓ {r.read_time || 'Okundu'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>📍 {r.district || 'Samsun'}</span>
                          <span>•</span>
                          <span>{r.phone}</span>
                        </div>
                      </div>

                      <div style={{
                        marginTop: 8,
                        paddingTop: 6,
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.72rem'
                      }}>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>
                          📋 Teklif Aşaması (%{r.potential_score || 80})
                        </span>
                        <span style={{ color: '#38bdf8', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          Müşteri Kartı <FiExternalLink size={11} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Matris Kartları Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
            {financingMatrices.map(matrix => {
              let tiers = [];
              try {
                tiers = JSON.parse(matrix.tiers_json || '[]');
              } catch {}

              const isHeavy = matrix.vehicle_group === 'heavy';

              return (
                <div key={matrix.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: matrix.is_active ? 1 : 0.65 }}>
                  <div>
                    {/* Kart Başlığı */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: isHeavy ? '#fef3c7' : '#e0f2fe',
                            color: isHeavy ? '#92400e' : '#0369a1'
                          }}>
                            {isHeavy ? 'HEAVY (Ağır Vasıta)' : 'L&M (Daily & Eurocargo)'}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: matrix.is_active ? '#dcfce7' : '#fee2e2',
                            color: matrix.is_active ? '#166534' : '#991b1b',
                            fontWeight: 600
                          }}>
                            {matrix.is_active ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                          {matrix.bank_name}
                        </h4>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>
                          {matrix.campaign_name}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <div>📅 {matrix.validity_period || 'Güncel'}</div>
                        <div style={{ fontSize: '0.7rem', marginTop: 2 }}>{matrix.applicable_models}</div>
                      </div>
                    </div>

                    {/* Taksit Tablosu */}
                    {tiers.length > 0 ? (
                      <div style={{
                        marginTop: 10,
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        overflowX: 'auto',
                        background: 'var(--bg-secondary, rgba(0,0,0,0.02))'
                      }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                          <thead>
                            <tr style={{ background: 'var(--border-color)', opacity: 0.8, textAlign: 'left' }}>
                              <th style={{ padding: '4px 8px' }}>Kredi Tutarı</th>
                              <th style={{ padding: '4px 8px' }}>Vadeler & Aylık Taksitler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tiers.slice(0, 6).map((tier, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                <td style={{ padding: '5px 8px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                  {tier.formatted_principal || `${Number(tier.principal).toLocaleString('tr-TR')} TL`}
                                </td>
                                <td style={{ padding: '5px 8px' }}>
                                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {tier.terms?.map((term, tIdx) => (
                                      <span key={tIdx} style={{
                                        background: 'var(--card-bg, #fff)',
                                        border: '1px solid var(--border-color)',
                                        padding: '2px 5px',
                                        borderRadius: '4px',
                                        whiteSpace: 'nowrap'
                                      }}>
                                        <strong>{term.grace_months ? `${term.grace_months}+` : ''}{term.months} Ay:</strong> {Number(term.monthly_payment).toLocaleString('tr-TR')} TL {term.rate && <span style={{ opacity: 0.7 }}>({term.rate})</span>}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ padding: '10px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Matris detayı bulunmuyor.
                      </div>
                    )}

                    {matrix.notes && (
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
                        Not: {matrix.notes}
                      </p>
                    )}
                  </div>

                  {/* Kart Aksiyonları */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 8, borderTop: '1px solid var(--border-color)' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleToggleMatrixStatus(matrix)}
                      style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                    >
                      {matrix.is_active ? 'Pasife Al' : 'Aktif Et'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteMatrix(matrix.id)}
                      style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              );
            })}

            {financingMatrices.length === 0 && !loadingMatrices && (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <p>Kayıtlı çatı finansman matrisi bulunamadı. "Kampanya Exceli Yükle" butonuyla banka tablonuzu aktarabilirsiniz.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: KATALOG & STANDART DOSYA ARŞİVİ
         ───────────────────────────────────────────────────────────── */}
      {mainTab === 'catalogs' && (
        <div>
          <div className="flex items-center justify-between mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              <button className={`btn btn-sm ${!categoryFilter ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCategoryFilter('')}>Tümü</button>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <button key={k} className={`btn btn-sm ${categoryFilter === k ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCategoryFilter(k)}>{v}</button>
              ))}
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
                  {c.file_name && (
                    <a 
                      href={`${getBaseUrl()}/campaigns/${c.id}/download`} 
                      className="btn btn-secondary btn-sm" 
                      target="_blank"
                      rel="noreferrer"
                    >
                      📥 İndir
                    </a>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCatalog(c.id)}>Sil</button>
                </div>
              </div>
            ))}
            {campaigns.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}><p>Kampanya bulunamadı</p></div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal 1: Yeni Standart Kampanya / Katalog Yükle ── */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Yeni Kampanya / Katalog</h3>
            <form onSubmit={handleAddCatalog}>
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

      {/* ── Modal 2: Yeni Manuel Çatı Finansman Matrisi Ekle ── */}
      {showAddMatrix && (
        <div className="modal-overlay" onClick={() => setShowAddMatrix(false)}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Yeni Banka Çatı Kampanyası</h3>
            <form onSubmit={handleSaveManualMatrix}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Banka Adı *</label>
                  <input
                    className="form-input"
                    required
                    value={matrixForm.bank_name}
                    onChange={e => setMatrixForm({ ...matrixForm, bank_name: e.target.value })}
                    placeholder="Örn: Kuveyt Türk, Denizbank, Garanti"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Araç Grubu *</label>
                  <select
                    className="form-select"
                    value={matrixForm.vehicle_group}
                    onChange={e => setMatrixForm({ ...matrixForm, vehicle_group: e.target.value })}
                  >
                    <option value="light_medium">🚚 L&M (Daily & Eurocargo)</option>
                    <option value="heavy">🚛 HEAVY (S-Way, T-Way, X-Way)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Kampanya Başlığı *</label>
                <input
                  className="form-input"
                  required
                  value={matrixForm.campaign_name}
                  onChange={e => setMatrixForm({ ...matrixForm, campaign_name: e.target.value })}
                  placeholder="Örn: 6 Ay Ödemesiz - Bayi Katkılı Kampanya"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Geçerli Modeller</label>
                  <input
                    className="form-input"
                    value={matrixForm.applicable_models}
                    onChange={e => setMatrixForm({ ...matrixForm, applicable_models: e.target.value })}
                    placeholder="Örn: Daily 35 Şasi & Van"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Geçerlilik Dönemi</label>
                  <input
                    className="form-input"
                    value={matrixForm.validity_period}
                    onChange={e => setMatrixForm({ ...matrixForm, validity_period: e.target.value })}
                    placeholder="Örn: Ekim - Kasım 2026"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notlar</label>
                <input
                  className="form-input"
                  value={matrixForm.notes}
                  onChange={e => setMatrixForm({ ...matrixForm, notes: e.target.value })}
                  placeholder="Opsiyonel kampanya şartı veya bayi notu"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddMatrix(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kampanya Görseli Önizleme Modalı */}
      {previewImage && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }} onClick={() => setPreviewImage(null)}>
          <div style={{
            position: 'relative',
            maxWidth: '900px',
            maxHeight: '90vh',
            background: 'var(--bg-card, #1e293b)',
            borderRadius: 12,
            padding: '1.25rem',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-heading)' }}>
                📊 Kuveyt Türk 6 Ay Ödemesiz - Bayi Katkılı Kampanya Tablosu
              </div>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setPreviewImage(null)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <FiX size={16} /> Kapat
              </button>
            </div>
            <div style={{ overflow: 'auto', textAlign: 'center', background: '#000', borderRadius: 8, padding: 8 }}>
              <img
                src={previewImage}
                alt="Kampanya Tablosu"
                style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: 4 }}
              />
            </div>
            <div style={{ marginTop: 10, textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Bu kampanya tablosu WhatsApp üzerinden 14 Samsun lojistik ve nakliyat firmasına resmi teklif olarak iletilmiştir.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
