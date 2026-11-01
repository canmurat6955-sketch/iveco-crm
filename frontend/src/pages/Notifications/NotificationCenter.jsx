import { useState, useEffect } from 'react';
import { notificationsApi } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiStar, FiPhoneCall, FiFolder, FiSettings, FiBell, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    notificationsApi.getAll({ unread_only: unreadOnly })
      .then(r => setNotifications(r.data)).catch(() => {});
  }, [unreadOnly]);

  const markRead = async (id) => {
    await notificationsApi.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success('Tüm bildirimler okundu');
  };

  const handleClick = (notif) => {
    markRead(notif.id);
    if (notif.related_entity_type === 'discovered_company') {
      navigate('/discovery');
    } else if (notif.related_entity_type === 'customer') {
      navigate(`/customers/${notif.related_entity_id}`);
    }
  };

  const renderTypeIcon = (type) => {
    switch (type) {
      case 'new_company':
        return <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiBriefcase size={16} /></div>;
      case 'high_potential':
        return <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiStar size={16} /></div>;
      case 'follow_up':
        return <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiPhoneCall size={16} /></div>;
      case 'campaign_expiry':
        return <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiFolder size={16} /></div>;
      case 'system':
        return <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiSettings size={16} /></div>;
      default:
        return <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiBell size={16} /></div>;
    }
  };

  return (
    <div className="animate-in" style={{ maxWidth: 800 }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3">
          <button className={`btn btn-sm ${!unreadOnly ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setUnreadOnly(false)}>Tümü</button>
          <button className={`btn btn-sm ${unreadOnly ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setUnreadOnly(true)}>Okunmamış</button>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={markAllRead} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <FiCheckCircle size={14} /> Tümünü Okundu İşaretle
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {notifications.length > 0 ? notifications.map(n => (
          <div key={n.id} className="list-item" onClick={() => handleClick(n)}
            style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              background: n.is_read ? 'transparent' : 'rgba(43, 125, 233, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
            {renderTypeIcon(n.notification_type)}
            <div className="list-item-content">
              <div className="list-item-title" style={{ fontWeight: n.is_read ? 400 : 700 }}>{n.title}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-line', marginTop: 4 }}>{n.message}</div>
              <div className="text-xs text-muted" style={{ marginTop: 4 }}>
                {new Date(n.sent_at).toLocaleString('tr-TR')}
              </div>
            </div>
            {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue-light)', flexShrink: 0 }} />}
          </div>
        )) : (
          <div className="empty-state" style={{ padding: '4rem' }}><p>Bildirim yok</p></div>
        )}
      </div>
    </div>
  );
}
