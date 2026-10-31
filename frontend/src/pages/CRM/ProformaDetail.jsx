import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { crmApi } from '../../api/client';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPrinter, FiTrash2, FiMessageCircle, FiDownload, FiFileText } from 'react-icons/fi';
import html2pdf from 'html2pdf.js';
import useDeviceDetect from '../../hooks/useDeviceDetect';

export default function ProformaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useDeviceDetect();
  const [proforma, setProforma] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mobil Görünüm Sığdırma & Zoom State'leri
  const [isFitToScreen, setIsFitToScreen] = useState(true);
  const containerRef = useRef(null);
  const sheetRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(1150);

  useEffect(() => {
    crmApi.getProforma(id)
      .then(res => {
        setProforma(res.data);
        return crmApi.getCustomer(res.data.customer_id);
      })
      .then(res => {
        setCustomer(res.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Proforma fatura bulunamadı.');
        navigate('/customers');
      });
  }, [id, navigate]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const cw = containerRef.current.clientWidth;
        if (cw > 0) setContainerWidth(cw);
      }
      if (sheetRef.current) {
        const sh = sheetRef.current.offsetHeight;
        if (sh > 0) setSheetHeight(sh);
      }
    };

    updateDimensions();

    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(updateDimensions);
      ro.observe(containerRef.current);
    }

    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);

    const t1 = setTimeout(updateDimensions, 100);
    const t2 = setTimeout(updateDimensions, 400);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [loading, proforma, customer, isFitToScreen]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('proforma-sheet');
    if (!element) {
      toast.error('Proforma şablonu bulunamadı.');
      return;
    }

    const prevTransform = sheetRef.current ? sheetRef.current.style.transform : '';
    const wrapper = sheetRef.current ? sheetRef.current.parentElement : null;
    const prevWrapperWidth = wrapper ? wrapper.style.width : '';
    const prevWrapperOverflow = wrapper ? wrapper.style.overflow : '';

    if (sheetRef.current) sheetRef.current.style.transform = 'none';
    if (wrapper) {
      wrapper.style.width = `${sheetBaseWidth}px`;
      wrapper.style.overflow = 'visible';
    }

    const opt = {
      margin:       [8, 8, 8, 8],
      filename:     `IVECO_PROFORMA_${proforma.invoice_number}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, logging: false, useCORS: true, scrollX: 0, scrollY: 0 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    toast.loading('PDF hazırlanıyor ve indiriliyor...', { id: 'pdf' });
    
    try {
      await html2pdf().from(element).set(opt).save();
      toast.success('PDF başarıyla indirildi!', { id: 'pdf' });
    } catch (err) {
      console.error(err);
      toast.error('PDF oluşturulurken bir hata oluştu.', { id: 'pdf' });
    } finally {
      if (sheetRef.current) sheetRef.current.style.transform = prevTransform;
      if (wrapper) {
        wrapper.style.width = prevWrapperWidth;
        wrapper.style.overflow = prevWrapperOverflow;
      }
    }
  };

  const handleDownloadExcel = async () => {
    try {
      toast.loading('Excel dosyası hazırlanıyor ve indiriliyor...', { id: 'excel' });
      const response = await crmApi.exportProformaExcel(id);
      
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `PROFORMA_${proforma.invoice_number}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Excel başarıyla indirildi!', { id: 'excel' });
    } catch (err) {
      console.error(err);
      toast.error('Excel dosyası oluşturulurken bir hata oluştu.', { id: 'excel' });
    }
  };

  // 📲 DOĞRUDAN PDF DOSYASI OLARAK WHATSAPP PAYLAŞIMI (Link Yok, Belge Dosyası)
  const handleSharePDFViaWhatsApp = async () => {
    const element = document.getElementById('proforma-sheet');
    if (!element) {
      toast.error('Proforma şablonu bulunamadı.');
      return;
    }

    const prevTransform = sheetRef.current ? sheetRef.current.style.transform : '';
    const wrapper = sheetRef.current ? sheetRef.current.parentElement : null;
    const prevWrapperWidth = wrapper ? wrapper.style.width : '';
    const prevWrapperOverflow = wrapper ? wrapper.style.overflow : '';

    if (sheetRef.current) sheetRef.current.style.transform = 'none';
    if (wrapper) {
      wrapper.style.width = `${sheetBaseWidth}px`;
      wrapper.style.overflow = 'visible';
    }

    const toastId = toast.loading('PDF hazırlanıyor ve WhatsApp\'a aktarılıyor...', { id: 'pdf-share' });

    try {
      const opt = {
        margin:       [8, 8, 8, 8],
        filename:     `IVECO_PROFORMA_${proforma.invoice_number}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, logging: false, useCORS: true, scrollX: 0, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const pdfBlob = await html2pdf().from(element).set(opt).output('blob');
      const filename = `IVECO_PROFORMA_${proforma.invoice_number}.pdf`;
      const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

      const cleanPhone = customer?.phone ? customer.phone.replace(/\D/g, '') : '';
      const recipientPhone = cleanPhone ? (cleanPhone.startsWith('90') ? cleanPhone : `90${cleanPhone.replace(/^0/, '')}`) : '';

      const shareText = `Sayın Yetkili,\n\nIVECO ERC Samsun Otomotiv olarak firmanız (${customer?.company_name || 'Değerli Müşterimiz'}) için hazırladığımız ${proforma.vehicle_model} resmi bayi proforma faturamız ekteki PDF belgesinde bilgilerinize sunulmuştur.\n\nİyi çalışmalar dileriz.\n*Can Murat ONAY - 0544 622 59 31*\n*IVECO ERC Samsun Otomotiv A.Ş.*`;

      // 1. Mobil Cihazlarda Doğrudan Dosya Paylaşımı (iOS Safari & Android)
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        toast.dismiss(toastId);
        await navigator.share({
          files: [pdfFile],
          title: `IVECO Proforma - ${proforma.invoice_number}`,
          text: shareText
        });
        toast.success('Proforma PDF başarıyla paylaşıldı!');
        return;
      }

      // 2. Masaüstü veya Dosya Paylaşımını Desteklemeyen Tarayıcılar İçin Otomatik İndirme + WhatsApp Açılışı
      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success('✅ PDF indirildi! WhatsApp açılıyor, indirilen dosyayı sohbete ekleyin.', { id: 'pdf-share', duration: 5000 });

      const wpUrl = recipientPhone
        ? `https://api.whatsapp.com/send?phone=${recipientPhone}&text=${encodeURIComponent(shareText)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

      setTimeout(() => {
        window.open(wpUrl, '_blank');
      }, 400);

    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        toast.error('PDF paylaşımı sırasında bir hata oluştu.', { id: 'pdf-share' });
      } else {
        toast.dismiss(toastId);
      }
    } finally {
      if (sheetRef.current) sheetRef.current.style.transform = prevTransform;
      if (wrapper) {
        wrapper.style.width = prevWrapperWidth;
        wrapper.style.overflow = prevWrapperOverflow;
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bu proforma faturayı silmek istediğinize emin misiniz?')) return;
    try {
      await crmApi.deleteProforma(id);
      toast.success('Proforma fatura silindi.');
      navigate(`/customers/${proforma.customer_id}`);
    } catch {
      toast.error('Silme işlemi başarısız.');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-pulse" />
        <span>Proforma fatura yükleniyor...</span>
      </div>
    );
  }

  // Standart A4 Genişliği - PDF kenar payı ve mobil uyumu için daraltılmış (680px)
  const sheetBaseWidth = 680;
  
  // Efektif genişlik (ResizeObserver ile okunan gerçek iç genişlik, yoksa güvenli ekran genişliği)
  const effectiveContainerWidth = containerWidth > 0 
    ? containerWidth 
    : (typeof window !== 'undefined' ? (window.innerWidth - 36) : sheetBaseWidth);

  // Kenarlardan 12px nefes payı bırakıyoruz ki çerçeve kenara yapışmasın veya 1px dahi taşmasın
  const targetWidth = isMobile 
    ? Math.max(260, effectiveContainerWidth - 12) 
    : sheetBaseWidth;

  const scale = (isMobile && isFitToScreen) 
    ? Math.min(1, Math.max(0.3, targetWidth / sheetBaseWidth)) 
    : 1;

  const scaledWidth = (isMobile && isFitToScreen) 
    ? Math.floor(sheetBaseWidth * scale) 
    : sheetBaseWidth;

  const scaledHeight = (isMobile && isFitToScreen && sheetHeight) 
    ? Math.ceil(sheetHeight * scale) 
    : 'auto';

  return (
    <div className="animate-in pb-12">
      {/* ── AKSİYON BARI (MOBİL ÖNCELİKLİ & DESKTOP) ── */}
      <div className="no-print mb-3">
        {isMobile ? (
          /* MOBİL AKSİYON PANELİ - ÜSTTE SABİT (STICKY) */
          <div 
            className="mobile-proforma-actions"
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 40,
              background: 'rgba(8, 11, 22, 0.94)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '6px 0 10px 0',
              borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
              marginBottom: '10px'
            }}
          >
            {/* 1. Birincil Buton: 📲 PDF Olarak WhatsApp'tan Gönder */}
            <button
              type="button"
              onClick={handleSharePDFViaWhatsApp}
              className="btn btn-lg w-full mb-2"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.92rem',
                fontWeight: 800,
                padding: '12px 14px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
                cursor: 'pointer'
              }}
            >
              <FiMessageCircle size={20} /> 📲 PDF Olarak WhatsApp'tan Gönder
            </button>

            {/* 2. İkincil Butonlar Izgarası */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '7px 2px', fontSize: '11px', fontWeight: 700 }}
              >
                <FiDownload size={15} />
                <span>PDF İndir</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadExcel}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '7px 2px', fontSize: '11px', fontWeight: 700 }}
              >
                <FiFileText size={15} />
                <span>Excel</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFitToScreen(!isFitToScreen)}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  padding: '7px 2px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: isFitToScreen ? '#38bdf8' : '#cbd5e1',
                  borderColor: isFitToScreen ? '#38bdf8' : 'rgba(99, 179, 237, 0.2)'
                }}
              >
                <span style={{ fontSize: '14px' }}>{isFitToScreen ? '🔍' : '📱'}</span>
                <span>{isFitToScreen ? '%100 Boyut' : 'Sığdır'}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(`/customers/${proforma.customer_id}`)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '7px 2px', fontSize: '11px', fontWeight: 700 }}
              >
                <FiArrowLeft size={15} />
                <span>Müşteri</span>
              </button>
            </div>
          </div>
        ) : (
          /* MASAÜSTÜ AKSİYON BARI */
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => navigate(`/customers/${proforma.customer_id}`)} className="btn btn-secondary btn-sm" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiArrowLeft size={16} /> Müşteri Kartına Dön
            </button>
            <div className="flex gap-2">
              <button onClick={handleDelete} className="btn btn-danger btn-sm" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiTrash2 size={16} /> Sil
              </button>
              <button 
                onClick={handleSharePDFViaWhatsApp} 
                className="btn btn-success btn-sm" 
                style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, background: '#10b981', borderColor: '#10b981', fontWeight: 800 }}
              >
                <FiMessageCircle size={16} /> 📲 PDF Olarak WhatsApp'tan Gönder
              </button>
              <button onClick={handleDownloadPDF} className="btn btn-primary btn-sm" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, background: '#1e40af', borderColor: '#1e40af' }}>
                <FiDownload size={16} /> PDF İndir
              </button>
              <button onClick={handleDownloadExcel} className="btn btn-primary btn-sm" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, background: '#047857', borderColor: '#047857' }}>
                <FiFileText size={16} /> Excel İndir (Banka)
              </button>
              <button onClick={handlePrint} className="btn btn-secondary btn-sm" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiPrinter size={16} /> Yazdır
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MOBİL BİLGİLENDİRME ÇUBUĞU (ÖNİZLEME MODU) ── */}
      {isMobile && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          marginBottom: '10px',
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '10px',
          fontSize: '0.74rem',
          color: '#cbd5e1'
        }}>
          <span>📄 {isFitToScreen ? 'Mobil Görünüm (Ekrana Tam Sığdırıldı)' : 'Orijinal Boyut (Kaydırarak İnceleyin)'}</span>
          <button
            type="button"
            onClick={() => setIsFitToScreen(!isFitToScreen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#38bdf8',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isFitToScreen ? '🔍 Büyüt' : '📱 Sığdır'}
          </button>
        </div>
      )}

      {/* ── YATAY TAŞMAYI ENGELLEYEN RESPONSIVE VIEWPORT ── */}
      <div 
        ref={containerRef}
        className="proforma-outer-viewport" 
        style={{
          width: '100%',
          maxWidth: '100%',
          overflowX: (isFitToScreen && isMobile) ? 'hidden' : 'auto',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: isMobile ? '2px 0 24px 0' : '0',
          boxSizing: 'border-box'
        }}
      >
        <div 
          style={{
            width: `${scaledWidth}px`,
            maxWidth: '100%',
            height: scaledHeight === 'auto' ? 'auto' : `${scaledHeight}px`,
            overflow: 'hidden',
            transition: 'width 0.15s ease, height 0.15s ease',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            borderRadius: '4px',
            margin: '0 auto',
            flexShrink: 0
          }}
        >
          <div
            ref={sheetRef}
            style={{
              transform: (isMobile && isFitToScreen) ? `scale(${scale})` : 'none',
              transformOrigin: 'top left',
              width: `${sheetBaseWidth}px`,
              minWidth: `${sheetBaseWidth}px`,
              maxWidth: `${sheetBaseWidth}px`,
              boxSizing: 'border-box'
            }}
          >
            {/* Printable Sheet A4 styled (Daraltılmış 680px - PDF ve Mobil taşma korumalı) */}
            <div id="proforma-sheet" className="print-container" style={{
              background: '#fff',
              color: '#000',
              padding: '18px 20px',
              border: '2px solid #000',
              borderRadius: '0px',
              width: `${sheetBaseWidth}px`,
              maxWidth: `${sheetBaseWidth}px`,
              boxSizing: 'border-box',
              margin: '0 auto',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              lineHeight: 1.25,
              fontSize: '11px',
              overflow: 'hidden'
            }}>
        {/* Header Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '10px' }}>
          {/* Official Dealer & Brand Logos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo-erc-samsun.png" alt="ERC Samsun Otomotiv" style={{ height: '38px', objectFit: 'contain' }} />
            <div style={{ height: '28px', width: '1.5px', background: '#94a3b8' }} />
            <img src="/logo-iveco.png" alt="IVECO" style={{ height: '24px', objectFit: 'contain' }} />
            <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#475569', letterSpacing: '0.6px', borderLeft: '1.5px solid #94a3b8', paddingLeft: '10px' }}>
              YETKİLİ SATICI & SERVİS
            </div>
          </div>
          
          <div style={{ fontWeight: 900, fontSize: '18px', letterSpacing: '0.5px', color: '#000' }}>
            PROFORMA / INVOICE
          </div>
        </div>

        {/* Info Split Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '12px', marginBottom: '10px' }}>
          {/* Left: Buyer Details */}
          <div style={{ border: '2px solid #000', padding: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex' }}>
              <span style={{ width: '105px', fontWeight: 700 }}>Sayın:</span>
              <span style={{ flex: 1, textTransform: 'uppercase', fontWeight: 700 }}>{customer.company_name}</span>
            </div>
            <div style={{ display: 'flex', marginTop: '2px' }}>
              <span style={{ width: '105px', fontWeight: 700 }}>Adres:</span>
              <span style={{ flex: 1 }}>{customer.address || '—'} {customer.district ? `${customer.district}/` : ''}{customer.city}</span>
            </div>
            <div style={{ display: 'flex', marginTop: '2px' }}>
              <span style={{ width: '105px', fontWeight: 700 }}>Vergi Dairesi:</span>
              <span style={{ flex: 1 }}>{customer.vergi_dairesi || (customer.city ? `${customer.city.toUpperCase()} V.D.` : '—')}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ width: '105px', fontWeight: 700 }}>T.C. / Vergi No:</span>
              <span style={{ flex: 1 }}>{customer.tax_number || '—'}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ width: '105px', fontWeight: 700 }}>Tel:</span>
              <span style={{ flex: 1 }}>{customer.phone || '—'}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ width: '105px', fontWeight: 700 }}>Gsm:</span>
              <span style={{ flex: 1 }}>—</span>
            </div>
            
            {/* Sales Consultant */}
            <div style={{ borderTop: '1px solid #000', marginTop: '6px', paddingTop: '5px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '105px', fontWeight: 700 }}>Satış Danışmanı:</span>
                <span style={{ flex: 1 }}>Can Murat Onay</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '105px', fontWeight: 700 }}>Gsm:</span>
                <span style={{ flex: 1 }}>0544 622 59 31</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '105px', fontWeight: 700 }}>E-Mail:</span>
                <span style={{ flex: 1 }}>murat.onay@ercsamsunotomotiv.com</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '105px', fontWeight: 700 }}>Tarih:</span>
                <span style={{ flex: 1, fontWeight: 700 }}>{new Date(proforma.date).toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
          </div>

          {/* Right: Seller Details */}
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '3px', paddingRight: '4px' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '-0.2px' }}>ERC SAMSUN OTOMOTİV</div>
            <div style={{ fontWeight: 800, fontSize: '14px', marginTop: '-3px' }}>SAN.VE TİC.A.Ş.</div>
            <div style={{ fontSize: '10.5px', marginTop: '4px', lineHeight: 1.35 }}>
              Eğercili Mah. Atatürk Bulv. No:122/3<br />
              Çarşamba / SAMSUN<br />
              Telefon : 0 362 238 06 93<br />
              Gaziler V.D. : 339 057 45 32
            </div>
          </div>
        </div>

        {/* Pricing Table */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '2px solid #000',
          marginBottom: '10px',
          fontSize: '10.5px'
        }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #000' }}>
              <th style={{ borderRight: '1px solid #000', padding: '5px 6px', textAlign: 'left', fontWeight: 700 }}>Teklif / Proforma Fatura Konusu Araca Ait Bilgiler</th>
              <th style={{ borderRight: '1px solid #000', padding: '5px 6px', width: '95px', textAlign: 'right', fontWeight: 700 }}>Birim Fiyat (TL)</th>
              <th style={{ borderRight: '1px solid #000', padding: '5px 6px', width: '38px', textAlign: 'center', fontWeight: 700 }}>Adet</th>
              <th style={{ padding: '5px 6px', width: '105px', textAlign: 'right', fontWeight: 700 }}>Toplam Tutar</th>
            </tr>
          </thead>
          <tbody>
            {/* Vehicle Model & Price */}
            <tr style={{ borderBottom: '1px solid #000' }}>
              <td style={{ borderRight: '1px solid #000', padding: '8px 6px', fontWeight: 700, verticalAlign: 'middle', textTransform: 'uppercase' }}>
                {proforma.vehicle_model}
              </td>
              <td style={{ borderRight: '1px solid #000', padding: '5px 6px', textAlign: 'right', verticalAlign: 'middle' }}>
                {proforma.unit_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </td>
              <td style={{ borderRight: '1px solid #000', padding: '5px 6px', textAlign: 'center', verticalAlign: 'middle' }}>1</td>
              <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 700, verticalAlign: 'middle' }}>
                {proforma.unit_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </td>
            </tr>

            {/* OTV Row */}
            <tr style={{ borderBottom: '1px solid #000' }}>
              <td style={{ borderRight: '1px solid #000', padding: '4px 6px', fontWeight: 700 }}>ÖTV (%{proforma.otv_rate})</td>
              <td style={{ borderRight: '1px solid #000', padding: '4px 6px', textAlign: 'right' }}>
                {proforma.otv_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </td>
              <td style={{ borderRight: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>1</td>
              <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 700 }}>
                {proforma.otv_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </td>
            </tr>

            {/* ARA TOPLAM */}
            <tr style={{ borderBottom: '1px solid #000', background: '#fafafa' }}>
              <td style={{ borderRight: '1px solid #000', padding: '4px 6px', fontWeight: 700 }}>ARA TOPLAM</td>
              <td style={{ borderRight: '1px solid #000', padding: '4px 6px', textAlign: 'right' }}>
                {proforma.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </td>
              <td style={{ borderRight: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>1</td>
              <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 700 }}>
                {proforma.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </td>
            </tr>

            {/* KDV Row */}
            <tr style={{ borderBottom: '1px solid #000' }}>
              <td style={{ borderRight: '1px solid #000', padding: '4px 6px', fontWeight: 700 }}>KDV (%{proforma.kdv_rate})</td>
              <td style={{ borderRight: '1px solid #000', padding: '4px 6px', textAlign: 'right' }}>
                {proforma.kdv_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </td>
              <td style={{ borderRight: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>1</td>
              <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 700 }}>
                {proforma.kdv_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </td>
            </tr>

            {/* GENEL TOPLAM */}
            <tr style={{ background: '#f0f0f0' }}>
              <td style={{ borderRight: '1px solid #000', padding: '5px 6px', fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
                <span>GENEL TOPLAM</span>
                <span style={{ fontStyle: 'italic', fontWeight: 700, fontSize: '9.5px' }}>{proforma.grand_total_words}</span>
              </td>
              <td style={{ borderRight: '1px solid #000', padding: '5px 6px', textAlign: 'right', fontWeight: 800 }}>
                {proforma.grand_total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </td>
              <td style={{ borderRight: '1px solid #000', padding: '5px 6px', textAlign: 'center', fontWeight: 800 }}>1</td>
              <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 800 }}>
                {proforma.grand_total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </td>
            </tr>
          </tbody>
        </table>

        {/* Specs Box */}
        <div style={{
          border: '2px solid #000',
          padding: '6px 8px',
          marginBottom: '8px',
          display: 'grid',
          gridTemplateColumns: '1fr 1.15fr',
          gap: '5px 16px',
          fontSize: '10.5px'
        }}>
          <div style={{ display: 'flex' }}>
            <span style={{ width: '110px', fontWeight: 700 }}>MODEL YILI:</span>
            <span>{proforma.model_year || '—'}</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ width: '110px', fontWeight: 700 }}>ŞASİ NO:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{proforma.chassis_no || '—'}</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ width: '110px', fontWeight: 700 }}>MOTOR NO:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{proforma.motor_no || '—'}</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ width: '110px', fontWeight: 700 }}>MOTOR GÜCÜ:</span>
            <span>{proforma.motor_power || '—'}</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ width: '110px', fontWeight: 700 }}>RENGİ:</span>
            <span>{proforma.color || '—'}</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ width: '110px', fontWeight: 700 }}>AZAMİ YÜKLÜ AĞIRLIĞI:</span>
            <span>{proforma.max_weight || '—'}</span>
          </div>
        </div>

        {/* Note (Red Box) */}
        <div style={{
          color: '#cc0000',
          fontWeight: 800,
          textAlign: 'center',
          fontSize: '9.5px',
          border: '1.5px solid #cc0000',
          padding: '5px',
          marginBottom: '8px',
          letterSpacing: '0.2px'
        }}>
          NOT : FİYATLARIMIZA KDV. ÖTV DAHİL OLUP, MTV. TRF. SİGORTASI, PLAKA VE TESCİL MASRAFLARI HARİÇTİR.
        </div>

        {/* Terms Table */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '2px solid #000',
          fontSize: '9.5px',
          marginBottom: '12px'
        }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #000' }}>
              <td style={{ width: '110px', fontWeight: 700, padding: '4px 6px', borderRight: '1px solid #000', background: '#f9f9f9' }}>TESLİMAT YERİ</td>
              <td style={{ padding: '4px 6px', fontWeight: 600 }}>{proforma.delivery_place || '—'}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #000' }}>
              <td style={{ width: '110px', fontWeight: 700, padding: '4px 6px', borderRight: '1px solid #000', background: '#f9f9f9' }}>ÖDEME ŞEKLİ</td>
              <td style={{ padding: '4px 6px', fontWeight: 700 }}>{proforma.payment_terms || '—'}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #000' }}>
              <td style={{ width: '110px', fontWeight: 700, padding: '4px 6px', borderRight: '1px solid #000', background: '#f9f9f9' }}>GEÇERLİLİK SÜRESİ</td>
              <td style={{ padding: '4px 6px', fontWeight: 700 }}>{proforma.validity_date ? new Date(proforma.validity_date).toLocaleDateString('tr-TR') : '—'}</td>
            </tr>
            <tr>
              <td style={{ width: '110px', fontWeight: 700, padding: '4px 6px', borderRight: '1px solid #000', background: '#f9f9f9', verticalAlign: 'top' }}>AÇIKLAMALAR</td>
              <td style={{ padding: '4px 6px', textAlign: 'justify', lineHeight: 1.3 }}>{proforma.notes || '—'}</td>
            </tr>
          </tbody>
        </table>

        {/* Print Footer / IVECO Logo */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '8.5px',
          color: '#333',
          borderTop: '1px solid #ccc',
          paddingTop: '6px'
        }}>
          <div>
            <div style={{ fontWeight: 700 }}>ERC SAMSUN OTOMOTİV SANAYİ TİCARET ANONİM ŞİRKETİ</div>
            <div>Adres: Eğercili Mah. Atatürk Bulv. No:122/3 Çarşamba / SAMSUN · Telefon : 0 362 844 80 20</div>
          </div>
          {/* Custom Stylized IVECO Logo */}
          <div style={{
            fontSize: '22px',
            fontWeight: 900,
            fontFamily: 'Impact, Arial Black, sans-serif',
            letterSpacing: '1px',
            color: '#0f172a',
            fontStyle: 'italic',
            lineHeight: 1
          }}>
            IVECO
          </div>
        </div>
      </div>
          </div>
        </div>
      </div>

      {/* Embedded CSS for print media layout */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Hide sidebar, header, and buttons */
          .sidebar, .header, .no-print, nav, header, button {
            display: none !important;
          }
          
          /* Reset container margins/backgrounds */
          body, .main-content, #root {
            background: #fff !important;
            color: #000 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .print-container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}} />
    </div>
  );
}
