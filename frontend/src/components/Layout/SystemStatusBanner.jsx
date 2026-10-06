import { useEffect, useState } from 'react';
import api from '../../api/client';

/**
 * Üst bilgi şeridi:
 *  - Sunucu uyanıyor (Render ücretsiz plan ~50 sn) → mavi bilgi
 *  - Kalıcı veritabanı bağlı değil → kırmızı uyarı (yeni kayıtlar yeniden başlatmada silinir)
 */
export default function SystemStatusBanner() {
  const [waking, setWaking] = useState(false);
  const [storage, setStorage] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onWake = (e) => setWaking(!!e.detail?.active);
    window.addEventListener('iveco:server-waking', onWake);
    api.get('/health')
      .then((res) => setStorage(res.data?.storage || null))
      .catch(() => {});
    return () => window.removeEventListener('iveco:server-waking', onWake);
  }, []);

  const notPersistent = storage && storage.persistent === false;

  if (!waking && (!notPersistent || dismissed)) return null;

  const base = {
    padding: '8px 12px',
    fontSize: 12.5,
    lineHeight: 1.45,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 60,
  };

  return (
    <div>
      {waking && (
        <div style={{ ...base, background: 'rgba(59,130,246,0.18)', color: '#93c5fd', borderBottom: '1px solid rgba(59,130,246,0.35)' }}>
          <span>⏳ Sunucu uyanıyor, işleminiz birkaç saniye içinde tamamlanacak… (ilk açılış 30-60 sn sürebilir)</span>
        </div>
      )}
      {notPersistent && !dismissed && (
        <div style={{ ...base, background: 'rgba(239,68,68,0.18)', color: '#fca5a5', borderBottom: '1px solid rgba(239,68,68,0.4)' }}>
          <span>
            🔴 <strong>Kalıcı veritabanı bağlı değil.</strong> Sunucu yeniden başlarsa bugün eklenen kayıtlar silinebilir.
            Yöneticinin Render'a <code>DATABASE_URL</code> tanımlaması gerekiyor.
          </span>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}
            aria-label="Kapat"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
