import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiEye, FiEyeOff, FiKey, FiLock, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Login() {
  const [accessCode, setAccessCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, loginPasscode } = useAuth();
  const navigate = useNavigate();

  const performLogin = async (rawCode) => {
    if (!rawCode) {
      toast.error('Lütfen giriş kodunu yazın.');
      return;
    }

    // Temizleme: boşlukları, görünmez karakterleri ve sondaki noktaları temizle
    const clean = rawCode
      .replace(/\s+/g, '')
      .replace(/[\u00a0\u200B-\u200D\uFEFF]/g, '')
      .replace(/[.,:;!]+$/, '')
      .toLowerCase();

    setLoading(true);

    // Rol ve e-posta eşleştirmesi
    let targetEmail = 'satis@iveco-crm.local';
    const isAdmin = clean.includes('admin') || clean === 'yonetici';

    if (isAdmin) {
      targetEmail = 'admin@iveco-crm.local';
    } else {
      targetEmail = 'satis@iveco-crm.local';
    }

    try {
      // 1. YOL: Yeni hızlı passcode endpoint'i
      if (typeof loginPasscode === 'function') {
        try {
          await loginPasscode(clean);
          toast.success('Giriş başarılı! Hoş geldiniz. 🎉');
          navigate('/');
          return;
        } catch (e1) {
          console.warn('Passcode endpoint yanıt vermedi, standart login deneniyor...', e1);
        }
      }

      // 2. YOL: 'erccrm' şifresi ile standart OAuth2 girişi
      try {
        await login(targetEmail, 'erccrm');
        toast.success('Giriş başarılı! Hoş geldiniz. 🎉');
        navigate('/');
        return;
      } catch (e2) {
        console.warn('erccrm şifresi başarısız, geriye dönük tohum şifresi deneniyor...', e2);
      }

      // 3. YOL: Eski seed şifreleri (satis123 / admin123) için otomatik kurtarma
      const fallbackPwd = isAdmin ? 'admin123' : 'satis123';
      try {
        await login(targetEmail, fallbackPwd);
        toast.success('Giriş başarılı! Hoş geldiniz. 🎉');
        navigate('/');
        return;
      } catch (e3) {
        // 4. YOL: Doğrudan yazılan kodu şifre olarak dene
        try {
          await login(clean, clean);
          toast.success('Giriş başarılı! Hoş geldiniz. 🎉');
          navigate('/');
          return;
        } catch (e4) {
          throw e2; // Esas hatayı fırlat
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      const isNetwork = !err.response || err.code === 'ERR_NETWORK' || [502, 503, 504].includes(err.response?.status);
      if (isNetwork) {
        toast.error('Bulut sunucusu (Render) uyanıyor olabilir. Lütfen 15 saniye bekleyip tekrar "Sisteme Bağlan" butonuna basın.', { duration: 6000 });
      } else {
        toast.error(err.response?.data?.detail || 'Hatalı giriş kodu! Lütfen "erccrm" yazın.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performLogin(accessCode);
  };

  const handleQuickLogin = (codeToUse) => {
    setAccessCode(codeToUse);
    performLogin(codeToUse);
  };

  return (
    <div className="login-page" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
      padding: '20px 16px'
    }}>
      <div className="login-card animate-in" style={{
        background: 'rgba(30, 41, 59, 0.55)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        padding: '2.5rem 1.8rem',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.5)',
        textAlign: 'center'
      }}>
        {/* Logo / Başlık */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
          border: '1px solid rgba(96, 165, 250, 0.3)',
          marginBottom: 16,
          color: '#60a5fa'
        }}>
          <FiKey size={26} />
        </div>

        <h1 style={{
          fontSize: 28,
          fontWeight: 800,
          background: 'linear-gradient(135deg, #93c5fd 0%, #3b82f6 50%, #1d4ed8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 6,
          letterSpacing: '-0.5px'
        }}>IVECO CRM</h1>
        
        <p className="login-subtitle" style={{
          fontSize: 13,
          color: '#94a3b8',
          marginBottom: 24
        }}>
          Saha Satış İstihbarat Platformu
        </p>

        {/* Hızlı Tek Tıkla Giriş Kartı */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: 12,
          padding: '12px 14px',
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          alignItems: 'center'
        }}>
          <div style={{ fontSize: 11, color: '#93c5fd', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <FiCheckCircle size={14} color="#60a5fa" />
            Tek Tıkla Hızlı Giriş (Önerilen)
          </div>
          <button
            type="button"
            onClick={() => handleQuickLogin('erccrm')}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              border: 'none',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
            }}
          >
            ⚡ "erccrm" ile Giriş Yap
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '16px 0',
          color: '#64748b',
          fontSize: 12
        }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.1)' }} />
          <span>veya manuel yazın</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        {/* Kod Giriş Formu */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left', marginBottom: 16 }}>
            <label className="form-label" htmlFor="login-access-code" style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#cbd5e1',
              marginBottom: 8,
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Giriş Kodu</span>
              <span 
                onClick={() => setAccessCode('erccrm')}
                style={{ color: '#60a5fa', cursor: 'pointer', fontSize: 11, fontWeight: 500 }}
              >
                erccrm doldur
              </span>
            </label>
            
            <div style={{ position: 'relative' }}>
              <input
                id="login-access-code"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Örn: erccrm"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                required
                style={{
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: showPassword || !accessCode ? '1px' : '4px',
                  padding: '13px 44px 13px 16px',
                  borderRadius: 10,
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={showPassword ? 'Kodu gizle' : 'Kodu göster'}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
          
          <button 
            id="login-submit" 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px 16px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <FiLock size={16} />
            {loading ? 'Giriş Yapılıyor...' : 'Sisteme Bağlan'}
          </button>
        </form>

        <p style={{
          marginTop: 22,
          fontSize: 11,
          color: '#64748b',
          lineHeight: 1.5
        }}>
          Giriş kodunuz: <strong style={{ color: '#93c5fd' }}>erccrm</strong><br/>
          Yönetici girişi için: <strong style={{ color: '#cbd5e1' }}>admin.erccrm</strong>
        </p>
      </div>
    </div>
  );
}
