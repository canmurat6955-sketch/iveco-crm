import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = accessCode.trim().toLowerCase();

    if (!code) {
      toast.error('Lütfen giriş kodunu yazın.');
      return;
    }

    setLoading(true);

    // Kod eşleştirmesi ve otomatik email ataması
    let targetEmail = '';
    
    if (code === 'erccrm') {
      targetEmail = 'satis@iveco-crm.local'; // Satış Temsilcisi
    } else if (code === 'admin.erccrm') {
      targetEmail = 'admin@iveco-crm.local'; // Yönetici
    } else {
      toast.error('Hatalı giriş kodu! Lütfen tekrar deneyin.');
      setLoading(false);
      return;
    }

    try {
      // Arka planda otomatik giriş
      await login(targetEmail, 'erccrm');
      toast.success('Giriş başarılı! Hoş geldiniz. 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
      padding: 20
    }}>
      <div className="login-card animate-in" style={{
        background: 'rgba(30, 41, 59, 0.45)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: 380,
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 800,
          background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 6,
          letterSpacing: '-0.5px'
        }}>IVECO CRM</h1>
        
        <p className="login-subtitle" style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          marginBottom: 30
        }}>
          Saha Satış İstihbarat Platformu
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left', marginBottom: 20 }}>
            <label className="form-label" style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: 8,
              display: 'block'
            }}>
              Giriş Kodu
            </label>
            <input
              id="login-access-code"
              type="password"
              className="form-input"
              placeholder="••••••"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              required
              style={{
                letterSpacing: accessCode ? '4px' : 'normal',
                textAlign: 'center',
                fontSize: 16,
                padding: '12px 16px',
                borderRadius: 8,
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                width: '100%'
              }}
            />
          </div>
          
          <button 
            id="login-submit" 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
            }}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Sisteme Bağlan'}
          </button>
        </form>

        <p style={{
          marginTop: 25,
          fontSize: 11,
          color: 'var(--text-muted)',
          opacity: 0.8
        }}>
          Giriş için firmanız tarafından verilen kodu yazın.
        </p>
      </div>
    </div>
  );
}
