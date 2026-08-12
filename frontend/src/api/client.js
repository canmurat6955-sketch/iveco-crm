import axios from 'axios';
import { offlineSync } from '../services/offlineSync';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});


// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle errors and offline queueing
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config } = error;
    
    // Sadece veri değiştirici istekler (POST, PUT, DELETE) ve Ağ hataları / Çevrimdışı modda çalış
    const isMutation = ['post', 'put', 'delete'].includes(config?.method?.toLowerCase());
    const isNetworkError = !error.response || 
                           error.code === 'ERR_NETWORK' || 
                           [502, 503, 504].includes(error.response?.status);
    
    if (isMutation && (isNetworkError || (typeof navigator !== 'undefined' && !navigator.onLine))) {
      let description = "Veri Değişikliği";
      if (config.url.includes('/visits/start')) description = "Ziyaret Başlatma";
      else if (config.url.includes('/end')) description = "Ziyaret Sonlandırma";
      else if (config.url.includes('/activities')) description = "Satış Aktivitesi Kaydı";
      else if (config.url.includes('/customers')) description = "Müşteri Değişikliği";
      
      offlineSync.queueRequest(config.url, config.method, JSON.parse(config.data || '{}'), description);
      
      // Hata fırlatmak yerine, uygulamanın devam etmesi için başarılıymış gibi simüle edilmiş response dön
      return Promise.resolve({
        data: { id: "offline-" + Date.now(), message: "Çevrimdışı kaydedildi", is_offline: true }
      });
    }
    
    return Promise.reject(error);
  }
);



export default api;

// ── Auth API ────────────────────────────────────────────────────
export const authApi = {
  login: (username, password) =>
    api.post('/auth/login', new URLSearchParams({ username, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// ── CRM API ─────────────────────────────────────────────────────
export const crmApi = {
  getCustomers: (params) => api.get('/crm/customers', { params }),
  getMapMarkers: () => api.get('/crm/customers/map-markers'),
  getNearbyCustomers: (params) => api.get('/crm/nearby', { params }),
  searchRouteAlong: (params) => api.get('/crm/route-search', { params }),

  getCustomer: (id) => api.get(`/crm/customers/${id}`),
  createCustomer: (data) => api.post('/crm/customers', data),

  updateCustomer: (id, data) => api.put(`/crm/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/crm/customers/${id}`),
  bulkDelete: (ids) => api.post('/crm/customers/bulk-delete', { ids }),
  deleteBySource: (source) => api.delete(`/crm/customers/source/${source}`),
  importFile: (formData) => api.post('/crm/customers/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getInteractions: (id) => api.get(`/crm/customers/${id}/interactions`),
  createInteraction: (id, data) => api.post(`/crm/customers/${id}/interactions`, data),
  getStats: () => api.get('/crm/stats'),
  getDuplicates: () => api.get('/crm/duplicates'),
  checkDuplicate: (data) => api.post('/crm/customers/check-duplicate', data),
  // Contact (irtibat kişisi) endpoints
  getContacts: (customerId) => api.get(`/crm/customers/${customerId}/contacts`),
  addContact: (customerId, data) => api.post(`/crm/customers/${customerId}/contacts`, data),
  updateContact: (contactId, data) => api.put(`/crm/contacts/${contactId}`, data),
  deleteContact: (contactId) => api.delete(`/crm/contacts/${contactId}`),
  getContactSuggestions: () => api.get('/crm/contact-suggestions'),
  mergeCustomers: (primaryId, secondaryIds) => api.post('/crm/customers/merge', { primary_id: primaryId, secondary_ids: secondaryIds }),
};

// ── Discovery API ───────────────────────────────────────────────
export const discoveryApi = {
  getSources: () => api.get('/discovery/sources'),
  createSource: (data) => api.post('/discovery/sources', data),
  runSource: (id) => api.post(`/discovery/sources/${id}/run`),
  getCompanies: (params) => api.get('/discovery/companies', { params }),
  getCompany: (id) => api.get(`/discovery/companies/${id}`),
  convertToCustomer: (id) => api.post(`/discovery/companies/${id}/convert`),
  rejectCompany: (id) => api.post(`/discovery/companies/${id}/reject`),
  getStats: () => api.get('/discovery/stats'),
};

// ── Enrichment API ──────────────────────────────────────────────
export const enrichmentApi = {
  getQueue: () => api.get('/enrichment/queue'),
  enrichSingle: (id) => api.post(`/enrichment/run/${id}`),
  enrichAll: () => api.post('/enrichment/run-all'),
  getConfig: () => api.get('/enrichment/config'),
};

// ── Notifications API ───────────────────────────────────────────
export const notificationsApi = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data) => api.put('/notifications/preferences', data),
};

// ── Campaigns API ───────────────────────────────────────────────
export const campaignsApi = {
  getAll: (params) => api.get('/campaigns', { params }),
  get: (id) => api.get(`/campaigns/${id}`),
  create: (formData) => api.post('/campaigns', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  delete: (id) => api.delete(`/campaigns/${id}`),
  getCategories: () => api.get('/campaigns/categories'),
};

// ── Sales API ───────────────────────────────────────────────────
export const salesApi = {
  getActivities: (params) => api.get('/sales/activities', { params }),
  createActivity: (data) => api.post('/sales/activities', data),
  updateActivity: (id, data) => api.put(`/sales/activities/${id}`, data),
  getPipeline: () => api.get('/sales/pipeline'),
  getTodayCalls: () => api.get('/sales/today'),
  getFollowUps: () => api.get('/sales/follow-ups'),
  getWhatsAppLink: (customerId, message) => api.post('/sales/whatsapp-link', null, { params: { customer_id: customerId, message } }),
  getTemplates: (params) => api.get('/sales/templates', { params }),
  createTemplate: (data) => api.post('/sales/templates', data),
  
  // Ziyaret Modu
  getActiveVisit: () => api.get('/sales/visits/active'),
  startVisit: (data) => api.post('/sales/visits/start', data),
  endVisit: (id, data) => api.post(`/sales/visits/${id}/end`, data),

  // Rota Planlayıcı
  optimizeRoute: (data) => api.post('/sales/routes/optimize', data),
  createRoutePlan: (data) => api.post('/sales/routes', data),
  getRoutePlans: () => api.get('/sales/routes'),
  getRoutePlan: (id) => api.get(`/sales/routes/${id}`),
  deleteRoutePlan: (id) => api.delete(`/sales/routes/${id}`),
  markStopVisited: (planId, stopId, visited) => api.put(`/sales/routes/${planId}/stops/${stopId}/visited`, null, { params: { visited } }),
};



// ── Dashboard API ───────────────────────────────────────────────
export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
  getTodayCalls: () => api.get('/dashboard/today-calls'),
  getNewDiscoveries: () => api.get('/dashboard/new-discoveries'),
  getHighPotential: () => api.get('/dashboard/high-potential'),
  getPendingResponses: () => api.get('/dashboard/pending-responses'),
  getRecentCampaigns: () => api.get('/dashboard/recent-campaigns'),
  getPipeline: () => api.get('/dashboard/pipeline'),
  getAnalytics: () => api.get('/dashboard/analytics'),
  getGeoData: () => api.get('/dashboard/geo-data'),
};

// ── Scanner API ─────────────────────────────────────────────────
export const scannerApi = {
  search: (data) => api.post('/scanner/search', data),
  addToCrm: (data) => api.post('/scanner/add-to-crm', data),
  bulkAdd: (data) => api.post('/scanner/bulk-add', data),
  getConfig: () => api.get('/scanner/config'),
  scanCard: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/scanner/scan-card', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};


