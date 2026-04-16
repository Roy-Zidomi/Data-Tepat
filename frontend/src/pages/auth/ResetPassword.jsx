import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { KeyRound, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { FORM_LIMITS, clampText } from '../../utils/formLimits';

/**
 * ResetPassword - Public page for resetting password via token from email.
 * URL: /reset-password?token=xxx
 */
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#4A90D9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{
          backgroundColor: '#fff', borderRadius: '20px', padding: '40px 36px 32px',
          width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444', margin: '0 0 12px 0' }}>Link Tidak Valid</h1>
          <p style={{ fontSize: '14px', color: '#666', margin: '0 0 24px 0' }}>
            Token reset password tidak ditemukan. Pastikan Anda menggunakan link yang benar dari email.
          </p>
          <Link to="/forgot-password" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '12px 28px', borderRadius: '50px',
            background: 'linear-gradient(135deg, #4A90D9, #5B9FE8)',
            color: '#fff', fontSize: '14px', fontWeight: '600',
            textDecoration: 'none', boxShadow: '0 4px 12px rgba(74,144,217,0.35)'
          }}>
            Minta Link Baru
          </Link>
        </div>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!formData.newPassword) e.newPassword = 'Password baru wajib diisi';
    else if (formData.newPassword.length < 6) e.newPassword = 'Password minimal 6 karakter';
    if (!formData.confirmPassword) e.confirmPassword = 'Konfirmasi password wajib diisi';
    else if (formData.newPassword !== formData.confirmPassword) e.confirmPassword = 'Password tidak cocok';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await authService.resetPassword(token, formData.newPassword);
      toast.success('Password berhasil direset!');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mereset password. Token mungkin sudah kedaluwarsa.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '12px 42px 12px 16px',
    borderRadius: '10px',
    border: errors[field] ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb',
    backgroundColor: '#f3f6fb',
    fontSize: '14px',
    color: '#1a1a2e',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  });

  const eyeBtn = { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#b0b0b0', padding: '0' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#4A90D9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '20px', padding: '40px 36px 32px',
        width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #4A90D9, #5B9FE8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <KeyRound style={{ width: '20px', height: '20px', color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1a1a2e', margin: '0' }}>Reset Password</h1>
        </div>
        <p style={{ fontSize: '14px', color: '#888', margin: '0 0 28px 0' }}>
          Buat password baru untuk akun Anda.
        </p>

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '8px' }}>
              Password Baru
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNew ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => { setFormData(p => ({ ...p, newPassword: clampText(e.target.value, FORM_LIMITS.password) })); setErrors(p => ({ ...p, newPassword: null })); }}
                placeholder="Minimal 6 karakter"
                required
                maxLength={FORM_LIMITS.password}
                style={inputStyle('newPassword')}
                onFocus={e => e.target.style.borderColor = '#4A90D9'}
                onBlur={e => e.target.style.borderColor = errors.newPassword ? '#ef4444' : '#e5e7eb'}
              />
              <button type="button" onClick={() => setShowNew(!showNew)} style={eyeBtn}>
                {showNew ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>
            {errors.newPassword && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px' }}>{errors.newPassword}</p>}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '8px' }}>
              Konfirmasi Password Baru
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => { setFormData(p => ({ ...p, confirmPassword: clampText(e.target.value, FORM_LIMITS.password) })); setErrors(p => ({ ...p, confirmPassword: null })); }}
                placeholder="Ulangi password baru"
                required
                maxLength={FORM_LIMITS.password}
                style={inputStyle('confirmPassword')}
                onFocus={e => e.target.style.borderColor = '#4A90D9'}
                onBlur={e => e.target.style.borderColor = errors.confirmPassword ? '#ef4444' : '#e5e7eb'}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={eyeBtn}>
                {showConfirm ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>
            {errors.confirmPassword && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px' }}>{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: '50px', border: 'none',
              background: loading ? '#a0bfe0' : 'linear-gradient(135deg, #4A90D9, #5B9FE8)',
              color: '#fff', fontSize: '16px', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 20px rgba(74,144,217,0.45)',
              transition: 'all 0.2s', letterSpacing: '0.5px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {loading ? (
              'Memproses...'
            ) : (
              <>
                <CheckCircle style={{ width: '16px', height: '16px' }} />
                Reset Password
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
      </div>

      <p style={{ marginTop: '24px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
        Copyright &copy; {new Date().getFullYear()} BantuTepat. All rights reserved.
      </p>
    </div>
  );
};

export default ResetPassword;
