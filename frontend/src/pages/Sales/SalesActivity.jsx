import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesApi, crmApi } from '../../api/client';
import toast from 'react-hot-toast';
import { openWhatsApp } from '../../utils/whatsapp';
import {
  FiPhone, FiPhoneCall, FiPhoneIncoming, FiPhoneOutgoing, FiPhoneMissed,
  FiMessageSquare, FiPlus, FiClock, FiUser, FiCheckCircle, FiAlertCircle,
  FiUserPlus, FiExternalLink, FiX, FiLayers
} from 'react-icons/fi';

const STATUS_MAP = {
  sent: { label: 'Gönderildi', badge: 'badge-blue' },
  replied: { label: 'Cevap Geldi', badge: 'badge-purple' },
  offer_given: { label: 'Teklif Verildi', badge: 'badge-amber' },
  follow_up: { label: 'Takip', badge: 'badge-blue' },
  hot_lead: { label: 'Sıcak Müşteri', badge: 'badge-red' },
  converted: { label: 'Kazanıldı', badge: 'badge-green' },
  lost: { label: 'Kayıp', badge: 'badge-red' },
};

const PIPELINE_COLORS = {
  sent: '#3b82f6', replied: '#8b5cf6', offer_given: '#f59e0b',
  follow_up: '#06b6d4', hot_lead: '#ef4444', converted: '#10b981', lost: '#64748b'
};

export default function SalesActivityPage() {
  const navigate = useNavigate();

  // Ana Sekme State'i: 'calls' | 'whatsapp' | 'activities'
  const [activeMainTab, setActiveMainTab] = useState('calls');

  // ── ÇAĞRI TAKİP STATE'LERİ ──
  const [calls, setCalls] = useState([]);
  const [callStats, setCallStats] = useState(null);
  const [callDirectionFilter, setCallDirectionFilter] = useState(''); // '', 'inbound', 'outbound', 'missed', 'unmatched'
  const [showCallModal, setShowCallModal] = useState(false);
  const [callForm, setCallForm] = useState({
    phone_number: '',
    direction: 'outbound',
    duration_minutes: 2,
    duration_seconds: 30,
    outcome: 'Olumlu',
    notes: '',
  });

  // Bilinmeyen Numarayı CRM'e Ekle Modal
  const [convertingCall, setConvertingCall] = useState(null);
  const [leadForm, setLeadForm] = useState({
    company_name: '',
    contact_name: '',
    city: 'Samsun',
    district: '',
    sector: '',
  });

  // ── WHATSAPP STATE'LERİ ──
  const [whatsappMessages, setWhatsappMessages] = useState([]);

  // ── AKTİVİTE & PIPELINE STATE'LERİ ──
  const [activities, setActivities] = useState([]);
  const [pipeline, setPipeline] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customer_id: '',
    activity_type: 'whatsapp',
    template_used: '',
    message_content: '',
    status: 'sent',
    next_follow_up: ''
  });
  const [statusFilter, setStatusFilter] = useState('');

  // Veri Yükleme
  const loadCalls = () => {
    const params = {};
    if (callDirectionFilter === 'unmatched') {
      params.unmatched_only = true;
    } else if (callDirectionFilter) {
      params.direction = callDirectionFilter;
    }
    salesApi.getCallLogs(params).then(r => setCalls(r.data || [])).catch(() => {});
    salesApi.getCallStats().then(r => setCallStats(r.data)).catch(() => {});
  };

  const loadWhatsApp = () => {
    salesApi.getWhatsAppMessages({ limit: 100 })
      .then(r => setWhatsappMessages(r.data || []))
      .catch(() => {});
  };

  const loadActivities = () => {
    salesApi.getActivities({ status: statusFilter || undefined }).then(r => setActivities(r.data || [])).catch(() => {});
    salesApi.getPipeline().then(r => setPipeline(r.data)).catch(() => {});
    salesApi.getTemplates().then(r => setTemplates(r.data || [])).catch(() => {});
  };

  useEffect(() => {
    loadCalls();
  }, [callDirectionFilter]);

  useEffect(() => {
    if (activeMainTab === 'whatsapp') {
      loadWhatsApp();
    } else if (activeMainTab === 'activities') {
      loadActivities();
    }
  }, [activeMainTab, statusFilter]);

  // Yeni Arama Kaydetme
  const handleSaveCall = async (e) => {
    e.preventDefault();
    try {
      const totalSecs = (parseInt(callForm.duration_minutes) || 0) * 60 + (parseInt(callForm.duration_seconds) || 0);
      await salesApi.createCallLog({
        phone_number: callForm.phone_number,
        direction: callForm.direction,
        duration_seconds: totalSecs,
        outcome: callForm.outcome,
        notes: callForm.notes,
        source: 'manual'
      });
      toast.success('Telefon görüşmesi kaydedildi 📞');
      setShowCallModal(false);
      setCallForm({ phone_number: '', direction: 'outbound', duration_minutes: 2, duration_seconds: 30, outcome: 'Olumlu', notes: '' });
      loadCalls();
    } catch {
      toast.error('Görüşme kaydedilirken hata oluştu');
    }
  };

  // Bilinmeyen Numarayı CRM Müşterisi Yap
  const handleConvertToLead = async (e) => {
    e.preventDefault();
    if (!convertingCall) return;
    try {
      const res = await salesApi.convertCallToLead(convertingCall.id, leadForm);
      toast.success(res.data?.message || 'Müşteri oluşturuldu');
      setConvertingCall(null);
      setLeadForm({ company_name: '', contact_name: '', city: 'Samsun', district: '', sector: '' });
      loadCalls();
      if (res.data?.customer_id) {
        navigate(`/customers/${res.data.customer_id}`);
      }
    } catch {
      toast.error('Müşteri oluşturulurken hata oluştu');
    }
  };

  // Eski Aktivite İşlemleri
  const openAddModal = async () => {
    try {
      const res = await crmApi.getCustomers({ page: 1, page_size: 100 });
      setCustomers(res.data.items || []);
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
      loadActivities();
    } catch (err) { toast.error(err.response?.data?.detail || 'Hata'); }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await salesApi.updateActivity(id, { status: newStatus });
      toast.success('Durum güncellendi');
      loadActivities();
    } catch { toast.error('Güncelleme hatası'); }
  };

  const handleOpenWhatsApp = (customerDataOrId, phone = '') => {
    let custObj = {};
    let targetPhone = phone;
    if (typeof customerDataOrId === 'object' && customerDataOrId !== null) {
      custObj = customerDataOrId;
      targetPhone = custObj.phone || targetPhone;
    } else if (typeof customerDataOrId === 'number') {
      custObj = { id: customerDataOrId };
    } else if (typeof customerDataOrId === 'string') {
      targetPhone = customerDataOrId;
      custObj = { phone: targetPhone };
    }
    openWhatsApp(targetPhone, '', { customer: custObj, defaultStatus: 'offer_given' });
  };

  const selectTemplate = (templateId) => {
    const t = templates.find(x => x.id === parseInt(templateId));
    if (t) setForm({ ...form, template_used: t.name, message_content: t.content });
  };

  return (
    <div className="animate-in">
      {/* ── ANA BAŞLIK & SEKME SEÇİCİ ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiPhoneCall style={{ color: '#3b82f6' }} /> Çağrı & İletişim Takip Merkezi
          </h2>
          <p className="text-sm text-muted" style={{ margin: '4px 0 0 0' }}>
            Telefon görüşmeleri, WhatsApp konuşma geçmişi ve satış aktivitelerinin tek noktadan canlı takibi
          </p>
        </div>

        {/* Ana Sekmeler */}
        <div className="flex gap-2" style={{ background: 'var(--bg-card)', padding: 4, borderRadius: 10, border: '1px solid var(--border-color)' }}>
          <button
            className={`btn btn-sm ${activeMainTab === 'calls' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveMainTab('calls')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <FiPhone size={14} /> 📞 Arama Günlüğü ({callStats?.total_calls ?? '...'})
          </button>
          <button
            className={`btn btn-sm ${activeMainTab === 'whatsapp' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveMainTab('whatsapp')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <FiMessageSquare size={14} /> 💬 WhatsApp Akışı ({whatsappMessages.length})
          </button>
          <button
            className={`btn btn-sm ${activeMainTab === 'activities' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveMainTab('activities')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <FiLayers size={14} /> 📊 Pipeline & Şablonlar
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          SEKME 1: ÇAĞRI TAKİP & ARAMA GÜNLÜĞÜ
         ════════════════════════════════════════════════════════════════════════ */}
      {activeMainTab === 'calls' && (
        <div>
          {/* KPI İstatistik Kartları */}
          {callStats && (
            <div className="stat-grid mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <div className="card" style={{ padding: '1.25rem' }}>
                <div className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Toplam Arama</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-blue-light)', marginTop: 4 }}>
                  {callStats.total_calls}
                </div>
                <div className="text-xs text-muted mt-1">Sistemdeki tüm kayıtlar</div>
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <div className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Toplam Konuşma</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>
                  {Math.floor(callStats.total_duration_seconds / 60)} <span style={{ fontSize: '1rem', fontWeight: 600 }}>dk</span> {callStats.total_duration_seconds % 60} <span style={{ fontSize: '1rem', fontWeight: 600 }}>sn</span>
                </div>
                <div className="text-xs text-muted mt-1">Müşterilerle geçen süre</div>
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <div className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Giden / Gelen</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
                  ↗️ {callStats.outbound_count} <span style={{ fontSize: '1.1rem', color: '#94a3b8' }}>/</span> ↙️ {callStats.inbound_count}
                </div>
                <div className="text-xs text-muted mt-1">❌ {callStats.missed_count} cevapsız</div>
              </div>

              <div className="card" style={{ padding: '1.25rem', borderLeft: callStats.unmatched_count > 0 ? '4px solid #f59e0b' : undefined }}>
                <div className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Bilinmeyen Arayanlar</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: callStats.unmatched_count > 0 ? '#f59e0b' : 'var(--text-primary)', marginTop: 4 }}>
                  {callStats.unmatched_count}
                </div>
                <div className="text-xs text-muted mt-1">
                  {callStats.unmatched_count > 0 ? 'Adaya çevrilmeyi bekliyor' : 'Tümü CRM ile eşleşti'}
                </div>
              </div>
            </div>
          )}

          {/* Filtre ve Toolbar */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex gap-2 flex-wrap">
              <button
                className={`btn btn-sm ${callDirectionFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCallDirectionFilter('')}
              >
                Tümü
              </button>
              <button
                className={`btn btn-sm ${callDirectionFilter === 'outbound' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCallDirectionFilter('outbound')}
              >
                ↗️ Giden Aramalar
              </button>
              <button
                className={`btn btn-sm ${callDirectionFilter === 'inbound' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCallDirectionFilter('inbound')}
              >
                ↙️ Gelen Aramalar
              </button>
              <button
                className={`btn btn-sm ${callDirectionFilter === 'missed' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCallDirectionFilter('missed')}
              >
                ❌ Cevapsızlar
              </button>
              <button
                className={`btn btn-sm ${callDirectionFilter === 'unmatched' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCallDirectionFilter('unmatched')}
                style={{ borderColor: '#f59e0b', color: callDirectionFilter === 'unmatched' ? '#fff' : '#f59e0b' }}
              >
                ❓ Bilinmeyen Numaralar
              </button>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setShowCallModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <FiPhone size={15} /> Arama Kaydı Ekle
            </button>
          </div>

          {/* Çağrı Tablosu */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Müşteri / Numara</th>
                  <th>Yön</th>
                  <th>Konuşma Süresi</th>
                  <th>Görüşme Sonucu</th>
                  <th>Görüşme Notu</th>
                  <th>Temsilci</th>
                  <th>Tarih & Saat</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {calls.length > 0 ? (
                  calls.map(c => {
                    const isOutbound = c.direction === 'outbound';
                    const isInbound = c.direction === 'inbound';
                    const isMissed = c.direction === 'missed';

                    const dirBadge = isOutbound
                      ? { label: '↗️ Giden', style: { background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' } }
                      : isInbound
                        ? { label: '↙️ Gelen', style: { background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' } }
                        : { label: '❌ Cevapsız', style: { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' } };

                    const mins = Math.floor(c.duration_seconds / 60);
                    const secs = c.duration_seconds % 60;
                    const durText = c.duration_seconds > 0 ? `${mins} dk ${secs} sn` : '0 sn';

                    return (
                      <tr key={c.id}>
                        <td>
                          {c.company_name ? (
                            <div>
                              <div
                                style={{ fontWeight: 700, color: 'var(--accent-blue-light)', cursor: 'pointer' }}
                                onClick={() => navigate(`/customers/${c.customer_id}`)}
                              >
                                {c.company_name}
                              </div>
                              <div className="text-xs text-muted">
                                {c.contact_name ? `${c.contact_name} · ` : ''}{c.phone_number}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <FiAlertCircle size={13} /> {c.phone_number}
                              </div>
                              <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>Eşleşmemiş Numara</span>
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="badge" style={{ ...dirBadge.style, fontSize: '0.72rem' }}>
                            {dirBadge.label}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{durText}</span>
                        </td>
                        <td>
                          {c.outcome ? (
                            <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>{c.outcome}</span>
                          ) : (
                            <span className="text-muted text-xs">—</span>
                          )}
                        </td>
                        <td style={{ maxWidth: 220 }}>
                          <span className="text-xs" style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                            {c.notes || '—'}
                          </span>
                        </td>
                        <td className="text-xs text-muted">
                          {c.user_name || 'Satış Temsilcisi'}
                        </td>
                        <td className="text-xs text-muted" style={{ whiteSpace: 'nowrap' }}>
                          {new Date(c.call_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          {c.customer_id ? (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => navigate(`/customers/${c.customer_id}`)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', fontSize: '0.72rem' }}
                            >
                              <FiExternalLink size={12} /> Profil
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setConvertingCall(c);
                                setLeadForm({ company_name: '', contact_name: '', city: 'Samsun', district: '', sector: '' });
                              }}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', fontSize: '0.72rem', background: '#f59e0b', borderColor: '#f59e0b' }}
                            >
                              <FiUserPlus size={12} /> CRM'e Ekle
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
                      <div style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 6 }}>Kayıtlı telefon görüşmesi bulunamadı.</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        Yapılan müşteri aramalarını kaydetmek için sağ üstteki <strong>"+ Arama Kaydı Ekle"</strong> butonunu kullanabilirsiniz.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          SEKME 2: WHATSAPP İLETİŞİM MERKEZİ & CANLI AKIŞ
         ════════════════════════════════════════════════════════════════════════ */}
      {activeMainTab === 'whatsapp' && (
        <div>
          <div className="card mb-4" style={{ background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.1), rgba(15, 23, 42, 0.4))', border: '1px solid rgba(37, 211, 102, 0.25)' }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: '#25d366', color: '#fff', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiMessageSquare size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--text-heading)' }}>WhatsApp İletişim Geçmişi</h4>
                  <p className="text-xs text-muted" style={{ margin: '2px 0 0 0' }}>
                    Saha ekibi tarafından müşterilere gönderilen WhatsApp mesajları ve görüşme geçmişi
                  </p>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={loadWhatsApp}>Yenile</button>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Müşteri / Telefon</th>
                  <th>Yön</th>
                  <th>Mesaj İçeriği</th>
                  <th>Durum</th>
                  <th>Kaynak</th>
                  <th>Tarih & Saat</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {whatsappMessages.length > 0 ? (
                  whatsappMessages.map(m => (
                    <tr key={m.id}>
                      <td>
                        {m.company_name ? (
                          <div>
                            <div
                              style={{ fontWeight: 700, color: 'var(--accent-blue-light)', cursor: 'pointer' }}
                              onClick={() => navigate(`/customers/${m.customer_id}`)}
                            >
                              {m.company_name}
                            </div>
                            <div className="text-xs text-muted">{m.phone_number}</div>
                          </div>
                        ) : (
                          <div style={{ fontWeight: 600 }}>{m.phone_number}</div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${m.direction === 'outbound' ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: '0.72rem' }}>
                          {m.direction === 'outbound' ? '↗️ Giden' : '↙️ Gelen'}
                        </span>
                      </td>
                      <td style={{ maxWidth: 350 }}>
                        <span className="text-sm" style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                          {m.content}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{m.status}</span>
                      </td>
                      <td className="text-xs text-muted">{m.source}</td>
                      <td className="text-xs text-muted" style={{ whiteSpace: 'nowrap' }}>
                        {new Date(m.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        {m.customer_id ? (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/customers/${m.customer_id}`)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', fontSize: '0.72rem' }}
                          >
                            <FiExternalLink size={12} /> Sohbet Detayı
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenWhatsApp({ phone: m.normalized_phone, company_name: m.sender_name || 'WhatsApp İletişim' })}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', fontSize: '0.72rem' }}
                          >
                            <FiMessageSquare size={12} /> WhatsApp'ta Aç
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
                      <div style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 6 }}>Henüz kayıtlı WhatsApp iletişimi bulunmuyor.</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        Müşteriler veya Kişilerim ekranındaki <strong>"WhatsApp Mesajı"</strong> butonuna tıkladığınızda kayıtlar buraya otomatik düşer.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          SEKME 3: SATIŞ AKTİVİTELERİ & PİPELİNE
         ════════════════════════════════════════════════════════════════════════ */}
      {activeMainTab === 'activities' && (
        <div>
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
            <button className="btn btn-primary" onClick={openAddModal} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <FiPlus size={16} /> Yeni Aktivite
            </button>
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
                        <button className="btn btn-sm btn-secondary" onClick={() => handleOpenWhatsApp({ id: a.customer_id, company_name: a.customer_name, phone: a.phone })} title="WhatsApp" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, padding: 0 }}><FiMessageSquare size={14} /></button>
                        <select className="form-select" style={{ width: 130, padding: '2px 6px', fontSize: '0.7rem' }}
                          value={a.status} onChange={e => updateStatus(a.id, e.target.value)}>
                          {Object.entries(STATUS_MAP).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
                      <div style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 6 }}>Henüz kayıtlı satış aktivitesi bulunmuyor.</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        Müşterilerle yapılan görüşmeleri kaydetmek için sağ üstteki <strong>"+ Yeni Aktivite"</strong> butonunu kullanabilirsiniz.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: YENİ ARAMA KAYDI ── */}
      {showCallModal && (
        <div className="modal-overlay" onClick={() => setShowCallModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 className="modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiPhone size={20} style={{ color: '#3b82f6' }} /> Telefon Görüşmesi Kaydet
              </h3>
              <button onClick={() => setShowCallModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveCall}>
              <div className="form-group">
                <label className="form-label">Aranan / Arayan Telefon Numarası *</label>
                <input
                  className="form-input"
                  value={callForm.phone_number}
                  onChange={e => setCallForm({ ...callForm, phone_number: e.target.value })}
                  placeholder="0532 123 45 67"
                  required
                />
                <span className="text-xs text-muted">Sistem numarayı CRM müşterileri ve irtibat kişileri ile otomatik eşleştirir.</span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Arama Yönü</label>
                  <select
                    className="form-select"
                    value={callForm.direction}
                    onChange={e => setCallForm({ ...callForm, direction: e.target.value })}
                  >
                    <option value="outbound">↗️ Giden Arama</option>
                    <option value="inbound">↙️ Gelen Arama</option>
                    <option value="missed">❌ Cevapsız Arama</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Görüşme Sonucu</label>
                  <select
                    className="form-select"
                    value={callForm.outcome}
                    onChange={e => setCallForm({ ...callForm, outcome: e.target.value })}
                  >
                    <option value="Olumlu">✅ Olumlu / İlgili</option>
                    <option value="Teklif İstendi">📋 Teklif / Fiyat İstendi</option>
                    <option value="Randevu Alındı">📅 Randevu Alındı</option>
                    <option value="Daha Sonra Aranacak">⏰ Daha Sonra Aranacak</option>
                    <option value="Ulaşılamadı">📵 Ulaşılamadı / Meşgul</option>
                    <option value="İlgilenmiyor">⛔ İlgilenmiyor</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Süre (Dakika)</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    max="180"
                    value={callForm.duration_minutes}
                    onChange={e => setCallForm({ ...callForm, duration_minutes: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Süre (Saniye)</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    max="59"
                    value={callForm.duration_seconds}
                    onChange={e => setCallForm({ ...callForm, duration_seconds: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Görüşme Özeti & Satış Notu</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={callForm.notes}
                  onChange={e => setCallForm({ ...callForm, notes: e.target.value })}
                  placeholder="Görüşülen konu, sorulan model (örn: Daily 35S16), fiyat talebi..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCallModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <FiPhone size={14} /> Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: BİLİNMEYEN NUMARAYI CRM'E EKLE ── */}
      {convertingCall && (
        <div className="modal-overlay" onClick={() => setConvertingCall(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 className="modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiUserPlus size={20} style={{ color: '#f59e0b' }} /> Arayan Numarayı CRM'e Kaydet
              </h3>
              <button onClick={() => setConvertingCall(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                <FiX size={20} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem' }}>
              <div className="text-xs text-muted">Arayan Telefon:</div>
              <div style={{ fontWeight: 800, color: 'var(--text-heading)', fontSize: '1.1rem' }}>{convertingCall.phone_number}</div>
              {convertingCall.notes && <div className="text-xs text-muted mt-1">Not: {convertingCall.notes}</div>}
            </div>

            <form onSubmit={handleConvertToLead}>
              <div className="form-group">
                <label className="form-label">Firma Unvanı *</label>
                <input
                  className="form-input"
                  required
                  value={leadForm.company_name}
                  onChange={e => setLeadForm({ ...leadForm, company_name: e.target.value })}
                  placeholder="Örn: Öz Karadeniz Nakliyat Ltd. Şti."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Yetkili / İrtibat Kişisi</label>
                <input
                  className="form-input"
                  value={leadForm.contact_name}
                  onChange={e => setLeadForm({ ...leadForm, contact_name: e.target.value })}
                  placeholder="Örn: Ahmet Yılmaz (Firma Sahibi)"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Şehir</label>
                  <select
                    className="form-select"
                    value={leadForm.city}
                    onChange={e => setLeadForm({ ...leadForm, city: e.target.value })}
                  >
                    <option value="Samsun">Samsun</option>
                    <option value="Ordu">Ordu</option>
                    <option value="Çorum">Çorum</option>
                    <option value="Amasya">Amasya</option>
                    <option value="Giresun">Giresun</option>
                    <option value="Sinop">Sinop</option>
                    <option value="Tokat">Tokat</option>
                    <option value="Kastamonu">Kastamonu</option>
                    <option value="Sivas">Sivas</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">İlçe</label>
                  <input
                    className="form-input"
                    value={leadForm.district}
                    onChange={e => setLeadForm({ ...leadForm, district: e.target.value })}
                    placeholder="Tekkeköy, Merkez vb."
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Sektör</label>
                <input
                  className="form-input"
                  value={leadForm.sector}
                  onChange={e => setLeadForm({ ...leadForm, sector: e.target.value })}
                  placeholder="Nakliye, Gıda Dağıtım, İnşaat..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setConvertingCall(null)}>İptal</button>
                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f59e0b', borderColor: '#f59e0b' }}>
                  <FiCheckCircle size={14} /> CRM'e Aday Olarak Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: YENİ AKTİVİTE (KLASİK) ── */}
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
