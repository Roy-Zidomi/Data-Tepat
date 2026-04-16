import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import authService from '../../services/authService';

/**
 * ForgotPassword - Public page where users enter their email to receive a password reset link.
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email wajib diisi');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#4A90D9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        padding: '40px 36px 32px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
      }}>
        {!sent ? (
          <>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1a1a2e', margin: '0 0 4px 0' }}>
              Lupa Password
            </h1>
            <p style={{ fontSize: '14px', color: '#888', margin: '0 0 28px 0' }}>
              Masukkan email Anda untuk menerima link reset password.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '8px' }}>
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#b0b0b0', width: '18px', height: '18px' }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="nama@email.com"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 42px',
                      borderRadius: '10px',
                      border: error ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb',
                      backgroundColor: '#f3f6fb',
                      fontSize: '14px',
                      color: '#1a1a2e',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#4A90D9'}
                    onBlur={e => e.target.style.borderColor = error ? '#ef4444' : '#e5e7eb'}
                  />
                </div>
                {error && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px' }}>{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '50px',
                  border: 'none',
                  background: loading ? '#a0bfe0' : 'linear-gradient(135deg, #4A90D9, #5B9FE8)',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 20px rgba(74,144,217,0.45)',
                  transition: 'all 0.2s',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {loading ? (
                  'Mengirim...'
                ) : (
                  <>
                    <Send style={{ width: '16px', height: '16px' }} />
                    Kirim Link Reset
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Link
                to="/login"
                style={{ fontSize: '13px', color: '#4A90D9', fontWeight: '500', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft style={{ width: '14px', height: '14px' }} />
                Kembali ke Login
              </Link>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #34d399)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <CheckCircle style={{ width: '32px', height: '32px', color: '#fff' }} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 8px 0' }}>
              Email Terkirim!
            </h2>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', margin: '0 0 8px 0' }}>
              Link reset password telah dikirim ke <strong style={{ color: '#1a1a2e' }}>{email}</strong>
            </p>
            <p style={{ fontSize: '12px', color: '#999', margin: '0 0 24px 0' }}>
              Link berlaku selama 15 menit. Periksa juga folder spam Anda.
            </p>
            <Link
              to="/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '12px 28px', borderRadius: '50px',
                background: 'linear-gradient(135deg, #4A90D9, #5B9FE8)',
                color: '#fff', fontSize: '14px', fontWeight: '600',
                textDecoration: 'none', boxShadow: '0 4px 12px rgba(74,144,217,0.35)'
              }}
            >
              <ArrowLeft style={{ width: '14px', height: '14px' }} />
              Kembali ke Login
            </Link>
          </div>
        )}
      </div>

      <p style={{ marginTop: '24px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
        Copyright &copy; {new Date().getFullYear()} BantuTepat. All rights reserved.
      </p>
    </div>
  );
};

export default ForgotPassword;
