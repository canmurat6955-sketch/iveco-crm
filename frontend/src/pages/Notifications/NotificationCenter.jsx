import { useState, useEffect } from 'react';
import { notificationsApi } from '../../api/client';
import { useNavigate } from 'react-router-dom';
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

  const TYPE_ICONS = {
    new_company: '🏢', high_potential: '⭐',
    follow_up: '📞', campaign_expiry: '📁', system: '⚙️',
  };

  return (
    <div className="animate-in" style={{ maxWidth: 800 }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3">
          <button className={`btn btn-sm ${!unreadOnly ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setUnreadOnly(false)}>Tümü</button>
          <button className={`btn btn-sm ${unreadOnly ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setUnreadOnly(true)}>Okunmamış</button>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={markAllRead}>✓ Tümünü Okundu İşaretle</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {notifications.length > 0 ? notifications.map(n => (
          <div key={n.id} className="list-item" onClick={() => handleClick(n)}
            style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              background: n.is_read ? 'transparent' : 'rgba(43, 125, 233, 0.05)',
            }}>
            <span style={{ fontSize: '1.5rem' }}>{TYPE_ICONS[n.notification_type] || '🔔'}</span>
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
