import axios from 'axios';
import toast from 'react-hot-toast';

// API temel URL'i (Bizim client.js'teki axios instance'ından alınabilir veya doğrudan yazılabilir)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const offlineSync = {
  /**
   * Çevrimdışı kuyruğa yeni bir istek ekler.
   */
  queueRequest: (url, method, data, description = "İşlem") => {
    const queue = JSON.parse(localStorage.getItem('offline_requests_queue') || '[]');
    const newRequest = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      url,
      method,
      data,
      description,
      queuedAt: new Date().toISOString()
    };
    queue.push(newRequest);
    localStorage.setItem('offline_requests_queue', JSON.stringify(queue));
    toast.success(`Çevrimdışısınız. ${description} kaydedildi, internet geldiğinde senkronize edilecek. 📴`);
  },

  /**
   * Kuyruktaki tüm istekleri sırasıyla backend'e gönderir.
   */
  syncPendingRequests: async () => {
    const queue = JSON.parse(localStorage.getItem('offline_requests_queue') || '[]');
    if (queue.length === 0) return;

    // Kullanıcıya senkronizasyon başladığını bildir
    toast.loading(`${queue.length} bekleyen işlem senkronize ediliyor...`, { id: 'sync_load' });
    
    // Auth token'ı al
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const failed = [];

    for (const req of queue) {
      try {
        await axios({
          url: req.url.startsWith('http') ? req.url : `${API_URL}${req.url}`,
          method: req.method,
          data: req.data,
          headers
        });
        console.log(`[OfflineSync] Başarılı: ${req.description}`);
      } catch (err) {
        console.error(`[OfflineSync] Hata (${req.description}):`, err);
        // Ağ hatası değilse (örn 400 Bad Request) kuyruktan silinebilir, 
        // ama sunucu hatası veya ağ ise tekrar denemek için failed listesinde tut
        if (!err.response || err.response.status >= 500) {
          failed.push(req);
        }
      }
    }

    // Kalan/Başarısız olanları güncelle
    localStorage.setItem('offline_requests_queue', JSON.stringify(failed));

    if (failed.length === 0) {
      toast.success("Tüm çevrimdışı işlemler başarıyla eşitlendi! 📡✅", { id: 'sync_load' });
    } else {
      toast.error(`${failed.length} işlem eşitlenemedi, daha sonra tekrar denenecek.`, { id: 'sync_load' });
    }
  },

  /**
   * Kuyrukta bekleyen işlem sayısını döner.
   */
  getQueueLength: () => {
    const queue = JSON.parse(localStorage.getItem('offline_requests_queue') || '[]');
    return queue.length;
  }
};

// İnternet bağlantısı geldiğinde otomatik tetikle
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[OfflineSync] İnternet bağlantısı algılandı. Senkronizasyon tetikleniyor.');
    offlineSync.syncPendingRequests();
  });
}
