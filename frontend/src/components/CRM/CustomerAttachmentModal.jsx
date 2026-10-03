import React, { useState, useEffect, useRef } from 'react';
import { 
  FiX, FiCamera, FiUploadCloud, FiImage, FiFileText, 
  FiTrash2, FiExternalLink, FiCheck, FiAlertCircle, FiEye, FiTag, FiPlus, FiLoader 
} from 'react-icons/fi';
import { crmApi } from '../../api/client';
import VoiceInputButton from '../common/VoiceInputButton';

const CATEGORIES = [
  { id: 'fleet_photo', label: 'Araç & Filo', icon: '🚛', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { id: 'business_card', label: 'Kartvizit', icon: '📇', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  { id: 'tax_plate', label: 'Vergi Levhası & Ruhsat', icon: '📑', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { id: 'trade_in_photo', label: 'Takas / Ekspertiz', icon: '🔄', color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  { id: 'facility', label: 'Tesis & Garaj', icon: '🏢', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  { id: 'general', label: 'Genel Evrak', icon: '📁', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
];

export default function CustomerAttachmentModal({ 
  customerId, 
  customerName, 
  isOpen, 
  onClose,
  initialCategory = 'fleet_photo',
  tradeInId = null
}) {
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'upload'
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [filterCategory, setFilterCategory] = useState('all');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewModalImage, setPreviewModalImage] = useState(null);
  const [error, setError] = useState(null);

  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && customerId) {
      loadAttachments();
    }
  }, [isOpen, customerId]);

  const loadAttachments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await crmApi.getAttachments(customerId);
      setAttachments(res.data || []);
      if (res.data && res.data.length === 0) {
        setActiveTab('upload');
      }
    } catch (err) {
      console.error('Failed to load attachments:', err);
      setError('Dosyalar yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Lütfen bir fotoğraf veya dosya seçin');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', selectedCategory);
      if (title.trim()) {
        formData.append('title', title.trim());
      }
      if (tradeInId) {
        formData.append('trade_in_id', tradeInId);
      }

      await crmApi.uploadAttachment(customerId, formData);
      setSelectedFile(null);
      setPreviewUrl(null);
      setTitle('');
      await loadAttachments();
      setActiveTab('gallery');
    } catch (err) {
      console.error('Upload error:', err);
      setError('Dosya yüklenirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!window.confirm('Bu fotoğraf/belgeyi silmek istediğinize emin misiniz?')) return;
    try {
      await crmApi.deleteAttachment(attachmentId);
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Dosya silinemedi.');
    }
  };

  if (!isOpen) return null;

  const filteredAttachments = filterCategory === 'all' 
    ? attachments 
    : attachments.filter(a => a.category === filterCategory);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📸</span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                Müşteri Fotoğraf & Belge Arşivi
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-sm sm:max-w-md">
              {customerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 pt-2 bg-slate-50/30 dark:bg-slate-800/30">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`pb-2.5 px-4 font-medium text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'gallery'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <FiImage className="w-4 h-4" />
            Galeri ({attachments.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-4 font-medium text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <FiPlus className="w-4 h-4" />
            Yeni Fotoğraf / Belge Ekle
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: GALLERY */}
          {activeTab === 'gallery' && (
            <div>
              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-none text-xs">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                    filterCategory === 'all'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Tümü ({attachments.length})
                </button>
                {CATEGORIES.map(cat => {
                  const count = attachments.filter(a => a.category === cat.id).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setFilterCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        filterCategory === cat.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label} ({count})</span>
                    </button>
                  );
                })}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <FiLoader className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                  <p className="text-sm">Görseller yükleniyor...</p>
                </div>
              ) : filteredAttachments.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mx-auto mb-3 text-xl">
                    📸
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    Henüz yüklenmiş fotoğraf veya belge yok
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                    Filo araçları, kartvizitler veya ruhsat fotoğraflarını mobil kameranızla hemen yükleyebilirsiniz.
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
                  >
                    <FiCamera className="w-4 h-4" />
                    Kamera ile Çek / Dosya Seç
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {filteredAttachments.map((item) => {
                    const isImg = item.file_type?.startsWith('image/') || item.file_url.match(/\.(jpg|jpeg|png|webp|gif)$/i);
                    const catInfo = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[5];

                    return (
                      <div
                        key={item.id}
                        className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                      >
                        <div className="aspect-square bg-slate-200 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center cursor-pointer"
                          onClick={() => {
                            if (isImg) setPreviewModalImage(item);
                            else window.open(item.file_url, '_blank');
                          }}
                        >
                          {isImg ? (
                            <img
                              src={item.file_url}
                              alt={item.title || item.file_name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-3 text-slate-400">
                              <FiFileText className="w-10 h-10 text-slate-500 mb-1" />
                              <span className="text-[10px] uppercase font-bold tracking-wider">
                                {item.file_name.split('.').pop()}
                              </span>
                            </div>
                          )}

                          {/* Quick Actions Hover Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <span className="p-2 rounded-lg bg-white/90 text-slate-800 hover:bg-white transition-all shadow-md">
                              <FiEye className="w-4 h-4" />
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                              }}
                              className="p-2 rounded-lg bg-red-600/90 text-white hover:bg-red-700 transition-all shadow-md"
                              title="Sil"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Category Badge on Image */}
                          <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-sm ${catInfo.color}`}>
                            {catInfo.icon} {catInfo.label}
                          </span>
                        </div>

                        <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={item.title || item.file_name}>
                            {item.title || item.file_name}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                            <span>{new Date(item.created_at).toLocaleDateString('tr-TR')}</span>
                            <a
                              href={item.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-blue-500 flex items-center gap-0.5"
                            >
                              <FiExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD */}
          {activeTab === 'upload' && (
            <form onSubmit={handleUpload} className="space-y-4">
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Kategori Seçin
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        selectedCategory === cat.id
                          ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 font-medium'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-xs font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Trigger Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Fotoğraf / Belge Kaynağı
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Camera Direct Trigger */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-700/60 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 transition-all active:scale-[0.98]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <FiCamera className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold block">Kamerayı Aç</span>
                      <span className="text-[10px] text-blue-600/70 dark:text-blue-400">Anında fotoğraf çek</span>
                    </div>
                  </button>

                  {/* File / Gallery Trigger */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all active:scale-[0.98]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-700 text-white flex items-center justify-center shadow-md">
                      <FiUploadCloud className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold block">Galeriden / Dosyadan Seç</span>
                      <span className="text-[10px] text-slate-400">Resim veya PDF seç</span>
                    </div>
                  </button>
                </div>

                {/* Hidden Inputs */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Preview & Details */}
              {selectedFile && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Önizleme"
                      className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                      <FiFileText className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Title / Description Note with VoiceInputButton */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Başlık veya Not (İsteğe bağlı)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn: 2023 Iveco Daily Ön Kasa Hasarı, Şirket Kartviziti..."
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                  <div className="absolute right-2">
                    <VoiceInputButton
                      size="sm"
                      onTranscript={(text) => setTitle(prev => (prev ? `${prev} ${text}` : text))}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('gallery')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || uploading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
                >
                  {uploading ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" />
                      Dosyayı Kaydet
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Fullscreen Image Preview Lightbox */}
      {previewModalImage && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setPreviewModalImage(null)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-3 text-white">
            <a
              href={previewModalImage.file_url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all flex items-center gap-1.5 text-xs font-semibold"
            >
              <FiExternalLink className="w-4 h-4" /> Orijinal Boyut
            </a>
            <button
              onClick={() => setPreviewModalImage(null)}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
          <img
            src={previewModalImage.file_url}
            alt={previewModalImage.title}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {previewModalImage.title && (
            <p className="text-white/90 text-sm font-medium mt-3 bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm">
              {previewModalImage.title}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
