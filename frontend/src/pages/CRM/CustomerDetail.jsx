import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { crmApi, salesApi } from '../../api/client';
import { useVisit } from '../../contexts/VisitContext';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPhone, FiMail, FiGlobe, FiMapPin, FiBriefcase, FiHash, FiTruck, FiLayers, FiMessageSquare, FiCalendar, FiPlus, FiClock, FiCheckCircle, FiStar, FiUser, FiEdit2, FiSave, FiX, FiTrash2, FiUsers } from 'react-icons/fi';


const INTERACTION_ICONS = {
  call: { icon: FiPhone, color: '#3b82f6', label: 'Telefon' },
  visit: { icon: FiMapPin, color: '#10b981', label: 'Ziyaret' },
  email: { icon: FiMail, color: '#f59e0b', label: 'E-posta' },
  whatsapp: { icon: FiMessageSquare, color: '#25d366', label: 'WhatsApp' },
  meeting: { icon: FiBriefcase, color: '#8b5cf6', label: 'Toplantı' },
};

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { startVisit } = useVisit();
  const [customer, setCustomer] = useState(null);

  const [interactions, setInteractions] = useState([]);
  const [showInteraction, setShowInteraction] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [interactionForm, setInteractionForm] = useState({ interaction_type: 'call', notes: '', next_action: '', next_action_date: '' });
  const [contacts, setContacts] = useState([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactForm, setContactForm] = useState({ contact_name: '', role: '', phone: '', email: '', notes: '', is_primary: false });
  const [editingContact, setEditingContact] = useState(null);

  useEffect(() => {
    crmApi.getCustomer(id).then(r => setCustomer(r.data)).catch(() => toast.error('Müşteri bulunamadı'));
    crmApi.getInteractions(id).then(r => setInteractions(r.data)).catch(() => {});
    crmApi.getContacts(id).then(r => setContacts(r.data)).catch(() => {});
  }, [id]);

  const addContact = async (e) => {
    e.preventDefault();
    try {
      const data = { ...contactForm };
      Object.keys(data).forEach(k => { if (data[k] === '') data[k] = null; });
      if (!data.contact_name) { toast.error('İsim gerekli'); return; }
      if (editingContact) {
        await crmApi.updateContact(editingContact.id, data);
        toast.success('Kişi güncellendi');
      } else {
        await crmApi.addContact(id, data);
        toast.success('Kişi eklendi');
      }
      setShowAddContact(false);
      setEditingContact(null);
      setContactForm({ contact_name: '', role: '', phone: '', email: '', notes: '', is_primary: false });
      crmApi.getContacts(id).then(r => setContacts(r.data));
    } catch { toast.error('Hata oluştu'); }
  };

  const deleteContact = async (contactId) => {
    if (!confirm('Bu kişiyi silmek istediğinize emin misiniz?')) return;
    try {
      await crmApi.deleteContact(contactId);
      toast.success('Kişi silindi');
      setContacts(prev => prev.filter(c => c.id !== contactId));
    } catch { toast.error('Silme hatası'); }
  };

  const openEditContact = (contact) => {
    setContactForm({
      contact_name: contact.contact_name || '',
      role: contact.role || '',
      phone: contact.phone || '',
      email: contact.email || '',
      notes: contact.notes || '',
      is_primary: contact.is_primary || false,
    });
    setEditingContact(contact);
    setShowAddContact(true);
  };

  const openEditModal = () => {
    setEditForm({
      company_name: customer.company_name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      website: customer.website || '',
      address: customer.address || '',
      city: customer.city || '',
      district: customer.district || '',
      sector: customer.sector || '',
      tax_number: customer.tax_number || '',
      current_fleet: customer.current_fleet || '',
      estimated_fleet_size: customer.estimated_fleet_size || '',
      previous_vehicles: customer.previous_vehicles || '',
      segment: customer.segment || 'C',
      potential_level: customer.potential_level || 'medium',
      potential_score: customer.potential_score || 0,
      sales_notes: customer.sales_notes || '',
    });
    setShowEdit(true);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...editForm };
      // Convert empty strings to null for optional fields
      Object.keys(data).forEach(k => { if (data[k] === '') data[k] = null; });
      // estimated_fleet_size should be int or null
      if (data.estimated_fleet_size) data.estimated_fleet_size = parseInt(data.estimated_fleet_size) || null;
      if (data.potential_score) data.potential_score = parseInt(data.potential_score) || 0;
      await crmApi.updateCustomer(id, data);
      toast.success('Müşteri bilgileri güncellendi');
      setShowEdit(false);
      crmApi.getCustomer(id).then(r => setCustomer(r.data));
    } catch (err) {
      toast.error('Güncelleme sırasında hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const addInteraction = async (e) => {
    e.preventDefault();
    try {
      const data = { ...interactionForm };
      if (!data.next_action_date) delete data.next_action_date;
      await crmApi.createInteraction(id, data);
      toast.success('Etkileşim eklendi');
      setShowInteraction(false);
      setInteractionForm({ interaction_type: 'call', notes: '', next_action: '', next_action_date: '' });
      crmApi.getInteractions(id).then(r => setInteractions(r.data));
      crmApi.getCustomer(id).then(r => setCustomer(r.data));
    } catch { toast.error('Hata oluştu'); }
  };

  const openWhatsApp = async () => {
    try {
      const msg = `Merhaba, Iveco yetkili bayisi olarak sizinle iletişime geçmek istiyoruz.`;
      const res = await salesApi.getWhatsAppLink(parseInt(id), msg);
      window.open(res.data.link, '_blank');
      await salesApi.createActivity({
        customer_id: parseInt(id), activity_type: 'whatsapp',
        message_content: msg, status: 'sent',
      });
      toast.success('WhatsApp açıldı ve log kaydedildi');
    } catch { toast.error('WhatsApp linki oluşturulamadı'); }
  };

  const handleDelete = async () => {
    if (!confirm(`"${customer.company_name}" kalıcı olarak silinecek. Emin misiniz?`)) return;
    try {
      await crmApi.deleteCustomer(id);
      toast.success('Müşteri silindi');
      navigate('/customers');
    } catch {
      toast.error('Silme hatası');
    }
  };

  if (!customer) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Yükleniyor...</div>;

  const scoreColor = customer.potential_score >= 75 ? '#10b981' : customer.potential_score >= 55 ? '#2b7de9' : customer.potential_score >= 35 ? '#f59e0b' : '#ef4444';
  const scorePercent = Math.min(100, customer.potential_score);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference;

  return (
    <div className="animate-in">
      <button className="btn btn-secondary mb-6" onClick={() => navigate('/customers')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <FiArrowLeft size={16} /> Müşteri Listesi
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Main Info */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{customer.company_name}</h2>
              <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <FiMapPin size={14} /> {customer.city}{customer.district ? ` / ${customer.district}` : ''}
              </p>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-primary btn-sm" onClick={openEditModal} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FiEdit2 size={16} /> Düzenle
              </button>
              <button className="btn btn-success btn-sm" onClick={openWhatsApp} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FiMessageSquare size={16} /> WhatsApp
              </button>
              <button className="btn btn-sm" onClick={handleDelete}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}>
                <FiTrash2 size={16} /> Sil
              </button>
            </div>
          </div>

          {/* Pipeline Stage */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { key: 'lead', label: '🎯 Lead', color: '#6366f1' },
              { key: 'contact', label: '📞 Görüşme', color: '#3b82f6' },
              { key: 'proposal', label: '📋 Teklif', color: '#f59e0b' },
              { key: 'negotiation', label: '🤝 Pazarlık', color: '#f97316' },
              { key: 'won', label: '✅ Kazanıldı', color: '#10b981' },
              { key: 'lost', label: '❌ Kaybedildi', color: '#ef4444' },
            ].map(s => {
              const active = (customer.pipeline_stage || 'lead') === s.key;
              return (
                <button key={s.key} onClick={async () => {
                  try {
                    await crmApi.updateCustomer(id, { pipeline_stage: s.key });
                    setCustomer(prev => ({ ...prev, pipeline_stage: s.key }));
                    toast.success(`Pipeline: ${s.label}`);
                  } catch { toast.error('Hata'); }
                }}
                  style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                    border: `2px solid ${s.color}`, transition: 'all 0.2s',
                    background: active ? s.color : 'transparent',
                    color: active ? '#fff' : s.color,
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = `${s.color}20`; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; }}}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className="form-row" style={{ gap: '2rem' }}>
            <div>
              <div className="text-xs text-muted mb-4" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>İletişim</div>
              <p className="text-sm mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiPhone size={14} style={{ color: 'var(--accent-blue-light)' }} /> {customer.phone || '—'}</p>
              <p className="text-sm mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiMail size={14} style={{ color: 'var(--accent-amber)' }} /> {customer.email || '—'}</p>
              <p className="text-sm mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiGlobe size={14} style={{ color: 'var(--accent-green)' }} /> {customer.website || '—'}</p>
              <p className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiMapPin size={14} style={{ color: 'var(--accent-purple)' }} /> {customer.address || '—'}</p>
            </div>
            <div>
              <div className="text-xs text-muted mb-4" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>İş Bilgileri</div>
              <p className="text-sm mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiBriefcase size={14} style={{ color: 'var(--accent-blue-light)' }} /> Sektör: {customer.sector || '—'}</p>
              <p className="text-sm mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiHash size={14} style={{ color: 'var(--accent-amber)' }} /> Vergi No: {customer.tax_number || '—'}</p>
              <p className="text-sm mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiTruck size={14} style={{ color: 'var(--accent-green)' }} /> Mevcut Filo: {customer.current_fleet || '—'}</p>
              <p className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiLayers size={14} style={{ color: 'var(--accent-purple)' }} /> Filo Büyüklüğü: {customer.estimated_fleet_size || '—'}</p>
            </div>
          </div>

          {customer.sales_notes && (
            <div className="mt-6" style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '1rem', borderLeft: `3px solid ${scoreColor}` }}>
              <div className="text-xs text-muted mb-4" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>Satış Notları</div>
              <p className="text-sm">{customer.sales_notes}</p>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Animated Score Ring */}
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem' }}>Potansiyel Skor</div>
            <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto' }}>
              <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" stroke="var(--border-color)" strokeWidth="8" fill="none" />
                <circle cx="50" cy="50" r="40" stroke={scoreColor} strokeWidth="8" fill="none"
                  strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.5rem', fontWeight: 800, color: scoreColor }}>
                {customer.potential_score}
              </div>
            </div>
            <div className="score-bar mt-4">
              <div className={`score-bar-fill ${customer.potential_score >= 75 ? 'very-high' : customer.potential_score >= 55 ? 'high' : customer.potential_score >= 35 ? 'medium' : 'low'}`}
                style={{ width: `${customer.potential_score}%` }} />
            </div>
          </div>

          {/* Meta Info */}
          <div className="card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Segment</span>
                <span className={`badge ${customer.segment === 'A' ? 'badge-green' : customer.segment === 'B' ? 'badge-blue' : customer.segment === 'C' ? 'badge-amber' : 'badge-red'}`}>{customer.segment}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Öncelik Skoru</span>
                <span className="badge" style={{
                  background: customer.priority_score >= 70 ? 'rgba(239, 68, 68, 0.12)' : customer.priority_score >= 40 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(156, 163, 175, 0.12)',
                  color: customer.priority_score >= 70 ? '#f87171' : customer.priority_score >= 40 ? '#fbbf24' : '#9ca3af',
                  border: `1px solid ${customer.priority_score >= 70 ? 'rgba(239, 68, 68, 0.25)' : customer.priority_score >= 40 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(156, 163, 175, 0.25)'}`,
                  fontWeight: 700
                }}>{customer.priority_score || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Kaynak</span>
                <span className="badge badge-blue">{customer.source}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Son Görüşme</span>
                <span className="text-sm">{customer.last_contact_date || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Kayıt Tarihi</span>
                <span className="text-sm">{new Date(customer.created_at).toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="text-xs text-muted mb-4" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>Hızlı İşlemler</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn btn-success btn-sm w-full" onClick={() => startVisit(customer.id, customer.company_name)} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <FiMapPin size={14} /> Ziyaret Başlat
              </button>
              <button className="btn btn-primary btn-sm w-full" onClick={openEditModal} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <FiEdit2 size={14} /> Bilgileri Düzenle
              </button>
              <button className="btn btn-secondary btn-sm w-full" onClick={openWhatsApp} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <FiMessageSquare size={14} /> WhatsApp Gönder
              </button>
              <button className="btn btn-secondary btn-sm w-full" onClick={() => setShowInteraction(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <FiPlus size={14} /> Etkileşim Ekle
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Interaction Timeline */}
      <div className="card mt-6">
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiClock size={18} /> Etkileşim Geçmişi</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowInteraction(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FiPlus size={14} /> Ekle
          </button>
        </div>
        {interactions.length > 0 ? (
          <div className="interaction-timeline">
            {interactions.map((intr, idx) => {
              const config = INTERACTION_ICONS[intr.interaction_type] || INTERACTION_ICONS.call;
              const Icon = config.icon;
              return (
                <div key={intr.id} className="timeline-item" style={{ animationDelay: `${idx * 80}ms` }}>
                  <div className="timeline-line" />
                  <div className="timeline-dot" style={{ background: config.color, boxShadow: `0 0 12px ${config.color}40` }}>
                    <Icon size={14} color="#fff" />
                  </div>
                  <div className="timeline-content">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="badge" style={{ background: `${config.color}20`, color: config.color, border: `1px solid ${config.color}40` }}>{config.label}</span>
                      <span className="text-xs text-muted">{new Date(intr.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    {intr.notes && <p className="text-sm" style={{ marginBottom: 6 }}>{intr.notes}</p>}
                    {intr.next_action && (
                      <div className="text-xs" style={{ color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiCalendar size={12} /> {intr.next_action}
                        {intr.next_action_date && <span className="text-muted"> ({intr.next_action_date})</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : <div className="empty-state"><p>Henüz etkileşim kaydı yok</p></div>}
      </div>

      {/* ── CONTACTS SECTION ── */}
      <div className="card mt-6">
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiUsers size={18} /> İrtibat Kişileri</h3>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditingContact(null); setContactForm({ contact_name: '', role: '', phone: '', email: '', notes: '', is_primary: false }); setShowAddContact(true); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FiPlus size={14} /> Kişi Ekle
          </button>
        </div>
        {contacts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {contacts.map(c => {
              const roleColors = {
                'Patron': '#ef4444', 'Sahip': '#ef4444', 'Müdür': '#3b82f6', 'Yönetici': '#3b82f6',
                'Muhasebe': '#f59e0b', 'Şoför': '#10b981', 'Satış': '#8b5cf6', 'Pazarlama': '#8b5cf6',
                'Aile': '#f97316', 'Şef': '#06b6d4', 'Eleman': '#6b7280',
              };
              const roleColor = roleColors[c.role] || '#6b7280';
              return (
                <div key={c.id} style={{
                  background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '0.875rem',
                  borderLeft: `3px solid ${roleColor}`, display: 'flex', flexDirection: 'column', gap: 6,
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                   onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                  <div className="flex items-center justify-between">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiUser size={14} style={{ color: roleColor }} />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{c.contact_name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => openEditContact(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                        <FiEdit2 size={13} />
                      </button>
                      <button onClick={() => deleteContact(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }}>
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                  {c.role && <span className="badge" style={{ background: `${roleColor}20`, color: roleColor, border: `1px solid ${roleColor}40`, fontSize: '0.7rem', padding: '2px 8px', width: 'fit-content' }}>{c.role}</span>}
                  {c.phone && <span className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}><FiPhone size={12} /> {c.phone}</span>}
                  {c.email && <span className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}><FiMail size={12} /> {c.email}</span>}
                  {c.notes && c.notes !== 'Rehberden otomatik aktarım' && <span className="text-xs text-muted">{c.notes}</span>}
                  {c.is_primary && <span className="badge badge-green" style={{ fontSize: '0.65rem', width: 'fit-content' }}>⭐ Birincil</span>}
                </div>
              );
            })}
          </div>
        ) : <div className="empty-state"><p>Henüz irtibat kişisi yok</p></div>}
      </div>

      {/* ── ADD/EDIT CONTACT MODAL ── */}
      {showAddContact && (
        <div className="modal-overlay" onClick={() => { setShowAddContact(false); setEditingContact(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 className="modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiUser size={20} /> {editingContact ? 'Kişi Düzenle' : 'Yeni İrtibat Kişisi'}
              </h3>
              <button onClick={() => { setShowAddContact(false); setEditingContact(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={addContact}>
              <div className="form-group">
                <label className="form-label">İsim *</label>
                <input className="form-input" value={contactForm.contact_name} onChange={e => setContactForm({ ...contactForm, contact_name: e.target.value })} required placeholder="Ahmet Yılmaz" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Rol</label>
                  <select className="form-select" value={contactForm.role || ''} onChange={e => setContactForm({ ...contactForm, role: e.target.value })}>
                    <option value="">Seçiniz...</option>
                    <option value="Patron">Patron / Sahip</option>
                    <option value="Müdür">Müdür</option>
                    <option value="Muhasebe">Muhasebeci</option>
                    <option value="Satış">Satış Sorumlusu</option>
                    <option value="Şoför">Şoför</option>
                    <option value="Şef">Şef</option>
                    <option value="Eleman">Eleman / Personel</option>
                    <option value="Aile">Aile</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input className="form-input" value={contactForm.phone || ''} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} placeholder="0532 123 45 67" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">E-posta</label>
                <input className="form-input" type="email" value={contactForm.email || ''} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} placeholder="ahmet@firma.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Not</label>
                <textarea className="form-textarea" rows={2} value={contactForm.notes || ''} onChange={e => setContactForm({ ...contactForm, notes: e.target.value })} />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="is_primary" checked={contactForm.is_primary} onChange={e => setContactForm({ ...contactForm, is_primary: e.target.checked })} />
                <label htmlFor="is_primary" className="form-label" style={{ margin: 0 }}>Birincil kişi</label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowAddContact(false); setEditingContact(null); }}>İptal</button>
                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <FiSave size={14} /> {editingContact ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720, width: '95vw' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 className="modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiEdit2 size={20} /> Müşteri Bilgilerini Düzenle
              </h3>
              <button onClick={() => setShowEdit(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={saveEdit}>
              {/* Firma Adı */}
              <div className="form-group">
                <label className="form-label">Firma Adı</label>
                <input className="form-input" value={editForm.company_name} onChange={e => handleEditChange('company_name', e.target.value)} required />
              </div>

              {/* İletişim Bilgileri */}
              <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem' }}>
                <div className="text-xs text-muted mb-4" style={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>İletişim Bilgileri</div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiPhone size={13} /> Telefon</label>
                    <input className="form-input" value={editForm.phone || ''} onChange={e => handleEditChange('phone', e.target.value)} placeholder="0362 555 1234" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiMail size={13} /> E-posta</label>
                    <input className="form-input" type="email" value={editForm.email || ''} onChange={e => handleEditChange('email', e.target.value)} placeholder="info@firma.com" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiGlobe size={13} /> Website</label>
                    <input className="form-input" value={editForm.website || ''} onChange={e => handleEditChange('website', e.target.value)} placeholder="www.firma.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiHash size={13} /> Vergi No</label>
                    <input className="form-input" value={editForm.tax_number || ''} onChange={e => handleEditChange('tax_number', e.target.value)} placeholder="1234567890" />
                  </div>
                </div>
              </div>

              {/* Adres */}
              <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem' }}>
                <div className="text-xs text-muted mb-4" style={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Adres Bilgileri</div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Şehir</label>
                    <input className="form-input" value={editForm.city || ''} onChange={e => handleEditChange('city', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">İlçe</label>
                    <input className="form-input" value={editForm.district || ''} onChange={e => handleEditChange('district', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Adres</label>
                  <textarea className="form-textarea" value={editForm.address || ''} onChange={e => handleEditChange('address', e.target.value)} rows={2} />
                </div>
              </div>

              {/* İş Bilgileri */}
              <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem' }}>
                <div className="text-xs text-muted mb-4" style={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>İş Bilgileri</div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Sektör</label>
                    <input className="form-input" value={editForm.sector || ''} onChange={e => handleEditChange('sector', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Segment</label>
                    <select className="form-select" value={editForm.segment} onChange={e => handleEditChange('segment', e.target.value)}>
                      <option value="A">A — Çok Yüksek</option>
                      <option value="B">B — Yüksek</option>
                      <option value="C">C — Orta</option>
                      <option value="D">D — Düşük</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiTruck size={13} /> Mevcut Filo</label>
                    <input className="form-input" value={editForm.current_fleet || ''} onChange={e => handleEditChange('current_fleet', e.target.value)} placeholder="ör: 3x Daily, 2x Eurocargo" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Filo Büyüklüğü</label>
                    <input className="form-input" type="number" value={editForm.estimated_fleet_size || ''} onChange={e => handleEditChange('estimated_fleet_size', e.target.value)} placeholder="ör: 5" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Önceki Araçlar</label>
                  <input className="form-input" value={editForm.previous_vehicles || ''} onChange={e => handleEditChange('previous_vehicles', e.target.value)} placeholder="ör: Ford Cargo, Mercedes Atego" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Potansiyel Seviye</label>
                    <select className="form-select" value={editForm.potential_level} onChange={e => handleEditChange('potential_level', e.target.value)}>
                      <option value="very_high">Çok Yüksek</option>
                      <option value="high">Yüksek</option>
                      <option value="medium">Orta</option>
                      <option value="low">Düşük</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Potansiyel Skor (0-100)</label>
                    <input className="form-input" type="number" min="0" max="100" value={editForm.potential_score} onChange={e => handleEditChange('potential_score', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Notlar */}
              <div className="form-group">
                <label className="form-label">Satış Notları</label>
                <textarea className="form-textarea" value={editForm.sales_notes || ''} onChange={e => handleEditChange('sales_notes', e.target.value)} rows={3} />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>İptal</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <FiSave size={14} /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interaction Modal */}
      {showInteraction && (
        <div className="modal-overlay" onClick={() => setShowInteraction(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Yeni Etkileşim</h3>
            <form onSubmit={addInteraction}>
              <div className="form-group">
                <label className="form-label">Tip</label>
                <select className="form-select" value={interactionForm.interaction_type} onChange={e => setInteractionForm({ ...interactionForm, interaction_type: e.target.value })}>
                  <option value="call">Telefon</option>
                  <option value="visit">Ziyaret</option>
                  <option value="email">E-posta</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="meeting">Toplantı</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Not</label>
                <textarea className="form-textarea" value={interactionForm.notes} onChange={e => setInteractionForm({ ...interactionForm, notes: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Sonraki Adım</label>
                  <input className="form-input" value={interactionForm.next_action} onChange={e => setInteractionForm({ ...interactionForm, next_action: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tarih</label>
                  <input className="form-input" type="date" value={interactionForm.next_action_date} onChange={e => setInteractionForm({ ...interactionForm, next_action_date: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInteraction(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
