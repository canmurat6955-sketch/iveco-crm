import React, { useState, useEffect, useMemo } from 'react';
import {
  FiPhoneCall, FiMessageSquare, FiBookOpen, FiX, FiCheck,
  FiMic, FiMicOff, FiSend, FiUserPlus, FiSearch, FiDollarSign,
  FiClock, FiZap
} from 'react-icons/fi';
import { crmApi } from '../../api/client';
import { sendCustomerVipPortalWhatsApp } from '../../utils/whatsapp';
import { getPublicOrigin } from '../../utils/publicUrl';
import { IVECO_PRICING_CATALOG } from '../../data/ivecoPricingCatalog';
import toast from 'react-hot-toast';

const QUICK_OUTCOMES = [
  { id: 'interested', label: '🔥 Ulaşıldı — İlgili / Sıcak', note: 'Müşteriyle görüşüldü, araçlarla ilgileniyor.' },
  { id: 'quote', label: '📄 Fiyat / Teklif İstedi', note: 'Fiyat ve kredi/proforma teklifi talep etti.' },
  { id: 'tradein', label: '🔄 Takas Aracı Var', note: 'Mevcut aracını takasa verip yenilemek istiyor.' },
  { id: 'busy', label: '⏳ Meşgul / Tekrar Aranacak', note: 'Şu an müsait değil, tekrar aranacak.' },
  { id: 'no_need', label: '❄️ Şu An İhtiyacı Yok', note: 'Şu an alım planı yok, ileride takip edilecek.' }
];

const OBJECTION_SCRIPTS = [
  {
    title: '💬 "Fiyatlar yüksek / Nakit sıkışık" diyen müşteriye:',
    script: 'Aracın fatura bedelinin içerisindeki %20 KDV tutarını doğrudan vergiden düşüyorsunuz. Ayrıca elinizdeki mevcut aracı takas peşinatına sayıp üstüne 1.000.000 TL için 12 Ay %0 Faiz (aylık 83.333 TL) kredi kullandığınızda nakdinize dokunmadan aracı filoya katabiliyorsunuz.'
  },
  {
    title: '💬 "Rakip marka (F. / M.) bakıyoruz" diyen müşteriye:',
    script: 'Daily ve S-Way serimizde C-kesitli gerçek kamyon şasisi ve Hi-Matic 8 ileri tam otomatik şanzıman var. Uzun yolda ve dağıtımda muadil rakiplere göre 100 km’de ortalama 1.5 - 2.5 litre yakıt avantajı ve baskı-balata masrafını sıfırlayan tork konvertörlü yapı sunuyoruz.'
  },
  {
    title: '💬 "Şu an araç ihtiyacım yok" diyen müşteriye:',
    script: 'Hiç sorun değil, ben size WhatsApp’tan 2026 şasi fiyatlarımızı ve Takas + Kredi hesaplayıcımızı içeren özel katalog linkimizi bırakıyorum; dilediğiniz zaman kendi aracınızın takas değerini girip aylık taksitleri inceleyebilirsiniz.'
  },
  {
    title: '💬 "7 tonluk veya şehir içi dağıtım aracı arıyorum" diyene:',
    script: 'Kamyon yasağına takılmadan ve dar sokaklarda manevra kaybetmeden 4 - 4.5 ton net yük taşıyabilen sınıfındaki tek gerçek kamyon şasili araç IVECO Daily 70C serisidir.'
  }
];

export default function OfficeQuickAssistantDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('logger'); // 'logger' | 'cheatsheet'

  // Logger state
  const [rawInput, setRawInput] = useState('');
  const [channel, setChannel] = useState('call'); // 'call' | 'whatsapp'
  const [searching, setSearching] = useState(false);
  const [matchedCustomers, setMatchedCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCity, setNewCity] = useState('Samsun');
  const [notes, setNotes] = useState('');
  const [followUpDays, setFollowUpDays] = useState(2); // 48 Saat Unutma Kalkanı varsayılan
  const [saving, setSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Cheatsheet state
  const [priceSearch, setPriceSearch] = useState('');

  // Klavye kısayolu: Alt + K
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.altKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Yazılan/yapıştırılan metinden telefon veya isim ayıkla ve CRM'de ara
  useEffect(() => {
    const trimmed = rawInput.trim();
    if (!trimmed || trimmed.length < 3) {
      setMatchedCustomers([]);
      setSelectedCustomer(null);
      return;
    }

    // Eğer WhatsApp'tan kopyalanmış uzun bir satırsa içindeki telefon numarasını yakala
    const phoneMatch = trimmed.match(/(?:\+?90|0)?\s*\(?5\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/);
    const digitsOnly = phoneMatch ? phoneMatch[0].replace(/\D/g, '').slice(-10) : '';
    const queryStr = digitsOnly.length >= 7 ? digitsOnly : trimmed.slice(0, 35);

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await crmApi.getCustomers({ search: queryStr, page_size: 5 });
        const items = res.data?.items || res.data || [];
        setMatchedCustomers(items);
        if (items.length === 1) {
          setSelectedCustomer(items[0]);
        } else {
          setSelectedCustomer(null);
        }
      } catch {
        setMatchedCustomers([]);
      } finally {
        setSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [rawInput]);

  const toggleVoiceDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Tarayıcınız sesli yazdırmayı desteklemiyor (Chrome veya Edge kullanın).');
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript) {
        setNotes(prev => (prev ? `${prev} ${transcript}` : transcript));
      }
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSaveQuickLog = async (alsoSendVip = false) => {
    if (!selectedCustomer && !rawInput.trim()) {
      toast.error('Lütfen görüştüğünüz telefon numarasını veya firma adını yazın.');
      return;
    }

    setSaving(true);
    try {
      let targetCustomer = selectedCustomer;

      // Eğer müşteri sistemde kayıtlı değilse otomatik yeni müşteri kartı aç
      if (!targetCustomer) {
        const digits = rawInput.replace(/\D/g, '');
        const cleanPhone = digits.length >= 10 ? `0${digits.slice(-10)}` : rawInput.trim();
        const companyTitle = newCompanyName.trim() || `Hızlı Kayıt (${cleanPhone})`;

        const createRes = await crmApi.createCustomer({
          company_name: companyTitle,
          phone: digits.length >= 7 ? cleanPhone : '',
          city: newCity || 'Samsun',
          source: channel === 'whatsapp' ? 'whatsapp_hizli' : 'telefon_hizli',
          sales_notes: notes.trim() || 'Ofis hızlı görüşme kaydı ile eklendi.'
        });
        targetCustomer = createRes.data;
        toast.success(`🆕 "${companyTitle}" yeni müşteri olarak eklendi!`);
      }

      const nextDate = new Date(Date.now() + followUpDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const prefix = channel === 'whatsapp' ? '[WhatsApp Görüşmesi]' : '[Telefon Görüşmesi]';

      await crmApi.createInteraction(targetCustomer.id, {
        interaction_type: channel === 'whatsapp' ? 'whatsapp' : 'call',
        notes: `${prefix} ${notes.trim() || 'Müşteri ile görüşüldü.'}`,
        next_action: `${followUpDays} gün sonra geri dönüş kontrolü`,
        next_action_date: nextDate
      });

      toast.success(`✅ ${targetCustomer.company_name} görüşmesi kaydedildi ve ${followUpDays} gün sonraya takip kuruldu!`);

      if (alsoSendVip && (targetCustomer.phone || rawInput.replace(/\D/g, '').length >= 10)) {
        sendCustomerVipPortalWhatsApp(
          {
            ...targetCustomer,
            phone: targetCustomer.phone || rawInput.replace(/\D/g, '').slice(-10)
          },
          { skipModal: true }
        );
      }

      // Formu temizle
      setRawInput('');
      setNotes('');
      setNewCompanyName('');
      setSelectedCustomer(null);
      setMatchedCustomers([]);
    } catch (err) {
      console.error(err);
      toast.error('Kayıt sırasında bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const filteredCatalog = useMemo(() => {
    const q = priceSearch.trim().toLowerCase();
    if (!q) return IVECO_PRICING_CATALOG.slice(0, 12);
    return IVECO_PRICING_CATALOG.filter(item =>
      `${item.model} ${item.segment} ${item.category} ${item.tonnage}`.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [priceSearch]);

  return (
    <>
      {/* Sağ Alt Sabit Hızlı Asistan Butonu */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Hızlı Görüşme Kaydı & Telefon Kopya Kağıdı (Kısayol: Alt + K)"
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '20px',
          zIndex: 1100,
          background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
          color: '#f8fafc',
          border: '1.5px solid rgba(56, 189, 248, 0.55)',
          borderRadius: '999px',
          padding: '11px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          fontWeight: 800,
          fontSize: '0.82rem',
          cursor: 'pointer',
          boxShadow: '0 10px 28px rgba(2, 132, 199, 0.38)'
        }}
      >
        <FiPhoneCall size={16} color="#38bdf8" />
        <span>📞 Hızlı Görüşme Kaydı & Kopya Kağıdı</span>
        <span style={{
          background: 'rgba(56, 189, 248, 0.2)',
          color: '#7dd3fc',
          padding: '2px 6px',
          borderRadius: '6px',
          fontSize: '0.68rem'
        }}>
          Alt+K
        </span>
      </button>

      {/* Sağ Çekmece (Drawer) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 1200,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '470px',
              height: '100%',
              background: '#0f172a',
              borderLeft: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              color: '#f8fafc',
              boxShadow: '-12px 0 36px rgba(0,0,0,0.6)'
            }}
          >
            {/* Üst Başlık */}
            <div style={{
              padding: '16px 18px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.18), rgba(15, 23, 42, 0.95))'
            }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                  ⚡ Ofis Satış Asistanı (Can M.)
                </div>
                <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '2px' }}>
                  Telefon/WhatsApp kaydı gir veya konuşurken fiyat/argüman oku
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: '#cbd5e1',
                  borderRadius: '8px',
                  padding: '6px',
                  cursor: 'pointer'
                }}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Sekme Seçici */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '6px',
              padding: '10px 14px',
              background: 'rgba(15, 23, 42, 0.9)',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('logger')}
                style={{
                  padding: '8px 6px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'logger' ? '#0284c7' : 'rgba(255,255,255,0.05)',
                  color: activeTab === 'logger' ? '#fff' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '0.73rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                <FiPhoneCall size={13} /> 1. Hızlı Kayıt
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cheatsheet')}
                style={{
                  padding: '8px 6px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'cheatsheet' ? '#0284c7' : 'rgba(255,255,255,0.05)',
                  color: activeTab === 'cheatsheet' ? '#fff' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '0.73rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                <FiBookOpen size={13} /> 2. Kopya Kağıdı
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('social')}
                style={{
                  padding: '8px 6px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'social' ? '#10b981' : 'rgba(255,255,255,0.05)',
                  color: activeTab === 'social' ? '#052e16' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '0.73rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                <FiZap size={13} /> 3. Sosyal Medya
              </button>
            </div>

            {/* İçerik */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
              {activeTab === 'logger' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Kanal Seçimi */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setChannel('call')}
                      style={{
                        flex: 1,
                        padding: '9px',
                        borderRadius: '8px',
                        border: channel === 'call' ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                        background: channel === 'call' ? 'rgba(2, 132, 199, 0.2)' : 'rgba(255,255,255,0.03)',
                        color: channel === 'call' ? '#38bdf8' : '#94a3b8',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      📞 Telefonla Görüştüm
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel('whatsapp')}
                      style={{
                        flex: 1,
                        padding: '9px',
                        borderRadius: '8px',
                        border: channel === 'whatsapp' ? '1.5px solid #22c55e' : '1px solid rgba(255,255,255,0.1)',
                        background: channel === 'whatsapp' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(255,255,255,0.03)',
                        color: channel === 'whatsapp' ? '#4ade80' : '#94a3b8',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      💬 WhatsApp'tan Yazıştım
                    </button>
                  </div>

                  {/* Telefon veya Firma Adı Yapıştır */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '5px' }}>
                      1. Görüştüğün Telefon Numarasını, Firma Adını veya WhatsApp Mesajını Yapıştır:
                    </label>
                    <input
                      type="text"
                      value={rawInput}
                      onChange={(e) => setRawInput(e.target.value)}
                      placeholder="Örn: 0532 123 45 67 veya Yılmaz Lojistik..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        color: '#fff',
                        fontSize: '0.86rem'
                      }}
                    />
                    {searching && (
                      <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '4px' }}>
                        CRM'de aranıyor...
                      </div>
                    )}
                  </div>

                  {/* Eşleşen Müşteri Varsa Göster, Yoksa Yeni Kayıt Alanı Aç */}
                  {matchedCustomers.length > 0 && (
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      borderRadius: '10px',
                      padding: '10px 12px'
                    }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34d399', marginBottom: '6px' }}>
                        ✅ Sistemde Eşleşen Müşteri ({matchedCustomers.length}):
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {matchedCustomers.map(c => {
                          const isSel = selectedCustomer?.id === c.id;
                          return (
                            <div
                              key={c.id}
                              onClick={() => setSelectedCustomer(c)}
                              style={{
                                padding: '8px 10px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                background: isSel ? 'rgba(16, 185, 129, 0.22)' : 'rgba(15, 23, 42, 0.7)',
                                border: isSel ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>{c.company_name}</div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{c.city || 'Samsun'} • {c.phone || 'Tel yok'}</div>
                              </div>
                              {isSel && <FiCheck size={16} color="#10b981" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {rawInput.trim().length >= 3 && !searching && matchedCustomers.length === 0 && (
                    <div style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiUserPlus size={14} /> Yeni Numara / Firma — Otomatik Müşteri Kartı Açılacak
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                        <input
                          type="text"
                          value={newCompanyName}
                          onChange={(e) => setNewCompanyName(e.target.value)}
                          placeholder="Firma veya Kişi Adı (Opsiyonel)"
                          style={{
                            padding: '8px 10px',
                            borderRadius: '7px',
                            background: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: '#fff',
                            fontSize: '0.8rem'
                          }}
                        />
                        <input
                          type="text"
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          placeholder="Şehir"
                          style={{
                            padding: '8px 10px',
                            borderRadius: '7px',
                            background: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: '#fff',
                            fontSize: '0.8rem'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Hızlı Sonuç Etiketleri */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                      2. Ne Konuşuldu? (Tek Tıkla Seç veya Sesle Yazdır):
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      {QUICK_OUTCOMES.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setNotes(prev => (prev ? `${prev} ${item.note}` : item.note))}
                          style={{
                            padding: '5px 9px',
                            borderRadius: '999px',
                            background: 'rgba(56, 189, 248, 0.12)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            color: '#7dd3fc',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Görüşme Notu:</span>
                      <button
                        type="button"
                        onClick={toggleVoiceDictation}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: isListening ? '#ef4444' : 'rgba(16, 185, 129, 0.18)',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          color: isListening ? '#fff' : '#34d399',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        {isListening ? <FiMicOff size={12} /> : <FiMic size={12} />}
                        {isListening ? 'Dinleniyor...' : '🎙️ Sesle Yazdır'}
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Örn: S-Way 530 çekici soruyor, elinde 2020 model takas aracı var..."
                      style={{
                        width: '100%',
                        padding: '9px 11px',
                        borderRadius: '8px',
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff',
                        fontSize: '0.82rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {/* Otomatik Takip Kalkanı */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                      3. Unutma Kalkanı (Ne Zaman Tekrar Hatırlatılsın?):
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {[
                        { days: 1, label: 'Yarın' },
                        { days: 2, label: '48 Saat (2 Gün)' },
                        { days: 4, label: '4 Gün Sonra' },
                        { days: 7, label: '1 Hafta' }
                      ].map(opt => (
                        <button
                          key={opt.days}
                          type="button"
                          onClick={() => setFollowUpDays(opt.days)}
                          style={{
                            padding: '7px 6px',
                            borderRadius: '7px',
                            border: followUpDays === opt.days ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                            background: followUpDays === opt.days ? 'rgba(2, 132, 199, 0.22)' : 'rgba(255,255,255,0.03)',
                            color: followUpDays === opt.days ? '#38bdf8' : '#94a3b8',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Kaydet Butonları */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSaveQuickLog(false)}
                      style={{
                        width: '100%',
                        padding: '11px',
                        borderRadius: '9px',
                        background: '#0284c7',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      {saving ? 'Kaydediliyor...' : '💾 Görüşmeyi Kaydet & Takibe Al'}
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSaveQuickLog(true)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '9px',
                        background: 'rgba(16, 185, 129, 0.18)',
                        color: '#34d399',
                        border: '1px solid rgba(16, 185, 129, 0.45)',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <FiSend size={14} /> Kaydet + Müşteriye WhatsApp VIP Link Gönder
                    </button>
                  </div>
                </div>
              ) : activeTab === 'cheatsheet' ? (
                /* TAB 2: TELEFON KOPYA KAĞIDI */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* 1M TL Kredi Hızlı Kopya Kutusu */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(15, 23, 42, 0.9))',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '10px',
                    padding: '12px'
                  }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#34d399', marginBottom: '6px' }}>
                      💳 1.000.000 TL Ticari Kredi Hazır Taksit Tablosu
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                      <div style={{ background: 'rgba(15,23,42,0.8)', padding: '7px', borderRadius: '7px' }}>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>12 Ay (%0 Faiz)</div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#34d399' }}>83.333 ₺/Ay</div>
                      </div>
                      <div style={{ background: 'rgba(15,23,42,0.8)', padding: '7px', borderRadius: '7px' }}>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>24 Ay Vadeli</div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#38bdf8' }}>~56.500 ₺/Ay</div>
                      </div>
                      <div style={{ background: 'rgba(15,23,42,0.8)', padding: '7px', borderRadius: '7px' }}>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>36 Ay Vadeli</div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#fbbf24' }}>~44.200 ₺/Ay</div>
                      </div>
                    </div>
                  </div>

                  {/* Hızlı 2026 Fiyat Arama */}
                  <div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                      🚛 2026 Model Hızlı Fiyat & %20 KDV Kalkanı Bak:
                    </div>
                    <input
                      type="text"
                      value={priceSearch}
                      onChange={(e) => setPriceSearch(e.target.value)}
                      placeholder="Model filtrele (Örn: 70C, 35S, S-Way, Hi-Matic)..."
                      style={{
                        width: '100%',
                        padding: '8px 11px',
                        borderRadius: '8px',
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        color: '#fff',
                        fontSize: '0.8rem',
                        marginBottom: '8px'
                      }}
                    />
                    <div style={{ maxHeight: '210px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {filteredCatalog.map(item => {
                        const price = item.cashPrice || item.campaignPrice || 0;
                        const kdvShield = Math.round(price - price / 1.2);
                        return (
                          <div
                            key={item.id}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '8px',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.07)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#f8fafc' }}>{item.model}</div>
                              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                                {item.transmission} • {item.bodyLength} • %20 KDV Avantajı: <strong style={{ color: '#34d399' }}>{kdvShield.toLocaleString('tr-TR')} ₺</strong>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#38bdf8' }}>
                                {price.toLocaleString('tr-TR')} ₺
                              </div>
                              <div style={{ fontSize: '0.64rem', color: '#64748b' }}>Nakit / Kampanya</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Telefonda Birebir Okunacak Hazır Argümanlar */}
                  <div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                      🎯 Telefonda Müşteriye Birebir Okunacak İtiraz Cevapları:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {OBJECTION_SCRIPTS.map((obj, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '9px',
                            background: 'rgba(15, 23, 42, 0.85)',
                            borderLeft: '3px solid #38bdf8',
                            border: '1px solid rgba(255,255,255,0.08)'
                          }}
                        >
                          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
                            {obj.title}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#e2e8f0', lineHeight: 1.45 }}>
                            "{obj.script}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* TAB 3: SOSYAL MEDYA TAKİPLİ LİNKLER & HAZIR LANSMAN METİNLERİ */
                (() => {
                  const origin = getPublicOrigin();
                  const socialCards = [
                    {
                      id: 'wa_durum',
                      badge: '🟢 WhatsApp Durum (Status) — En Güçlü Kanca',
                      color: '#22c55e',
                      link: `${origin}/fiyat-listesi?ref=wa_durum`,
                      desc: 'Durumdan tıklayanlar Dashboard’a "🟢 WhatsApp Durum Ziyaretçisi" olarak düşer.',
                      text:
                        `🚛 2026 IVECO Canlı Fiyat, Takas & Randevu Ekranımız Açıldı!\n\n` +
                        `Kimseyi aramanıza gerek kalmadan tek tıkla:\n` +
                        `🔄 Elinizdeki aracın takas değerini düşüp 1M TL %0 Faiz (83.333 TL/Ay) ile kalan taksitinizi hesaplayın,\n` +
                        `📸 Mevcut aracınızın 3 fotoğrafını gönderip 15 dk'da takas ön fiyatı alın,\n` +
                        `🔒 Beğendiğiniz şasiyi 24 saat ücretsiz adınıza opsiyonlayın veya\n` +
                        `☕ Showroom kahve / görüntülü araç turu randevunuzu seçin:\n\n` +
                        `👉 ${origin}/fiyat-listesi?ref=wa_durum\n\n` +
                        `Satış Sorumlusu Can M. | IVECO ERC Samsun Otomotiv\n📞 0544 622 59 31`
                    },
                    {
                      id: 'instagram',
                      badge: '📸 Instagram Biyografi & Reels Lansmanı',
                      color: '#ec4899',
                      link: `${origin}/fiyat-listesi?ref=instagram`,
                      desc: 'Profilinden veya Reels’ten tıklayanlar "📸 Instagram Ziyaretçisi" olarak düşer.',
                      text:
                        `"Elimdeki aracı takasa versem 2026 sıfır IVECO bana ayda kaç TL'ye gelir?" diye düşünmeyin, 10 saniyede kendiniz hesaplayın! 🚛📊\n\n` +
                        `Yeni Dijital Showroom ekranımızda neler var?\n` +
                        `✅ Canlı Takas + Kredi Hesaplayıcı (1.000.000 TL 12 Ay %0 Faiz),\n` +
                        `📸 3 Fotoğrafla 15 Dakikada WhatsApp Takas Ekspertizi,\n` +
                        `🔒 Muhasebecinizle görüşene kadar Fiyatı 24 Saat Ücretsiz Opsiyonlama,\n` +
                        `☕ Showroom Kahve, İş Yeri Ziyareti veya Canlı Görüntülü Araç Turu Randevusu,\n` +
                        `🔔 Sıfır bütçesini aşanlar için: Takastan Temiz 2. El IVECO Habercisi!\n\n` +
                        `👉 Hemen denemek için profilimdeki linke tıklayın:\n${origin}/fiyat-listesi?ref=instagram\n\n` +
                        `📞 Satış Sorumlusu Can M. — 0544 622 59 31 | IVECO ERC Samsun Otomotiv`
                    },
                    {
                      id: 'linkedin',
                      badge: '💼 LinkedIn Kurumsal Filo Lansmanı',
                      color: '#38bdf8',
                      link: `${origin}/fiyat-listesi?ref=linkedin`,
                      desc: 'LinkedIn’den tıklayan filo yöneticileri "💼 LinkedIn Ziyaretçisi" olarak düşer.',
                      text:
                        `Ticari araç ve filo yatırımlarında telefon trafiğine girmeden, 30 saniyede şeffaf fizibilite çıkarabileceğiniz "IVECO ERC Dijital Showroom & Finansman Merkezi" yayında. 🚛📈\n\n` +
                        `Platform üzerinden doğrudan:\n` +
                        `1️⃣ Tonaj ve üstyapıya göre 2026 Daily, Eurocargo, S-Way ve T-Way şasi eşleştirmesi,\n` +
                        `2️⃣ Takas peşinatı + %0 faizli ticari kredi nakit akış simülasyonu,\n` +
                        `3️⃣ Mali müşavirinize tek tıkla iletebileceğiniz %20 KDV Vergi Kalkanı & Amortisman özeti,\n` +
                        `4️⃣ 24 saatlik ücretsiz şasi/fiyat blokajı ve İş Yeri Ziyareti / Online Sunum randevusu oluşturabilirsiniz:\n\n` +
                        `🔗 ${origin}/fiyat-listesi?ref=linkedin\n\n` +
                        `Satış Sorumlusu Can M. | IVECO ERC Samsun Otomotiv | 📞 0544 622 59 31`
                    },
                    {
                      id: 'facebook',
                      badge: '📘 Facebook Kamyoncu & Nakliyeci Grupları',
                      color: '#60a5fa',
                      link: `${origin}/fiyat-listesi?ref=facebook`,
                      desc: 'Facebook gruplarından tıklayanlar "📘 Facebook Ziyaretçisi" olarak düşer.',
                      text:
                        `Karadeniz bölgesindeki nakliyeci, gıda dağıtım ve hafriyatçı esnafımız için 2026 IVECO Canlı Hesaplama & Takas Ekranımızı açtık! 🚛\n\n` +
                        `👉 İster elinizdeki aracın takas değerini seçip kalan kredi taksitinizi ekranda görün,\n` +
                        `👉 İster mevcut aracınızın 3 fotoğrafını gönderip 15 dakikada takas fiyatı alın,\n` +
                        `👉 Sıfır bütçenizi aşıyorsa "Takastan Temiz 2. El Habercisi"ne kaydolun, takasa temiz araç düştüğü gün ilk size haber verelim:\n\n` +
                        `🔗 ${origin}/fiyat-listesi?ref=facebook\n\n` +
                        `Satış Sorumlusu Can M. — 0544 622 59 31 (IVECO ERC Samsun Otomotiv)`
                    }
                  ];

                  const copyToClipboard = (val, label) => {
                    navigator.clipboard.writeText(val);
                    toast.success(`✅ ${label} panoya kopyalandı!`);
                  };

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{
                        padding: '10px 12px',
                        borderRadius: '9px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        fontSize: '0.74rem',
                        color: '#a7f3d0',
                        lineHeight: 1.45
                      }}>
                        📡 Aşağıdaki özel takip linklerinden birini paylaştığında, tıklayan kişi form doldurmasa bile Gösterge Panelindeki <strong>Canlı Müşteri Ayak İzi</strong> kutuna hangi sosyal medyadan geldiğiyle birlikte düşer ve zil çalar!
                      </div>

                      {socialCards.map(card => (
                        <div
                          key={card.id}
                          style={{
                            padding: '12px',
                            borderRadius: '10px',
                            background: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderLeft: `3px solid ${card.color}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
                            {card.badge}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            {card.desc}
                          </div>
                          <div style={{
                            padding: '6px 8px',
                            borderRadius: '6px',
                            background: 'rgba(2, 6, 23, 0.7)',
                            fontSize: '0.7rem',
                            color: '#38bdf8',
                            wordBreak: 'break-all',
                            fontFamily: 'monospace'
                          }}>
                            {card.link}
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(card.link, `${card.badge} Takip Linki`)}
                              style={{
                                flex: 1,
                                padding: '7px 10px',
                                borderRadius: '7px',
                                background: 'rgba(56, 189, 248, 0.16)',
                                border: '1px solid rgba(56, 189, 248, 0.4)',
                                color: '#38bdf8',
                                fontWeight: 800,
                                fontSize: '0.72rem',
                                cursor: 'pointer'
                              }}
                            >
                              🔗 Sadece Linki Kopyala
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(card.text, `${card.badge} Hazır Paylaşım Metni`)}
                              style={{
                                flex: 1.3,
                                padding: '7px 10px',
                                borderRadius: '7px',
                                background: '#10b981',
                                border: 'none',
                                color: '#052e16',
                                fontWeight: 900,
                                fontSize: '0.72rem',
                                cursor: 'pointer'
                              }}
                            >
                              📋 Hazır Metni + Linki Kopyala
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
