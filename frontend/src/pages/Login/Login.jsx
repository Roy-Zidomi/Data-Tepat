import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { FORM_LIMITS, clampText } from '../../utils/formLimits';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('warga');
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'password'
      ? clampText(value, FORM_LIMITS.password)
      : clampText(value, FORM_LIMITS.email);
    setFormData(prev => ({ ...prev, [name]: nextValue }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.emailOrUsername || !formData.password) {
      toast.error('Silakan isi username dan password.');
      return;
    }
    try {
      setLoading(true);
      const res = await authService.login(
        formData.emailOrUsername,
        formData.password,
        selectedRole
      );
      const { user } = res.data.data;
      login(user);
      toast.success(`Selamat datang, ${user.name}!`);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('[Login.jsx] Error details:', error);
      toast.error(error.response?.data?.message || 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#4A90D9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      {/* Card */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        padding: '40px 36px 32px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
      }}>
        {/* Title */}
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1a1a2e', margin: '0 0 4px 0' }}>Sign In</h1>
        <p style={{ fontSize: '14px', color: '#888', margin: '0 0 28px 0' }}>Silakan masuk ke akun Anda.</p>

        <form onSubmit={onSubmit}>
          {/* Username */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '8px' }}>
              Username / Email
            </label>
            <input
              type="text"
              name="emailOrUsername"
              value={formData.emailOrUsername}
              onChange={handleChange}
              placeholder="Masukkan username atau email"
              required
              maxLength={FORM_LIMITS.email}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1.5px solid #e5e7eb',
                backgroundColor: '#f3f6fb',
                fontSize: '14px',
                color: '#1a1a2e',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#4A90D9'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••"
              required
              maxLength={FORM_LIMITS.password}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1.5px solid #e5e7eb',
                backgroundColor: '#f3f6fb',
                fontSize: '14px',
                color: '#1a1a2e',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#4A90D9'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Login As */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '8px' }}>
              Login as
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #e5e7eb',
                  backgroundColor: '#f3f6fb',
                  fontSize: '14px',
                  color: '#1a1a2e',
                  outline: 'none',
                  appearance: 'none',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              >
                <option value="warga">Warga</option>
                <option value="relawan">Relawan</option>
                <option value="pengawas">Pengawas</option>
                <option value="admin_staff">Admin Staff</option>
                <option value="admin_main">Admin Utama</option>
              </select>
              {/* Custom chevron */}
              <svg
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#888' }}
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Links */}
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
            <a href="/activation" style={{ fontSize: '13px', color: '#4A90D9', fontWeight: '500', textDecoration: 'none' }}>
              Aktivasi Akun (OTP)
            </a>
            <a href="/forgot-password" style={{ fontSize: '13px', color: '#888', fontWeight: '500', textDecoration: 'none' }}>
              Lupa password?
            </a>
          </div>

          {/* Submit Button */}
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
            }}
          >
            {loading ? 'Memproses...' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Footer copyright */}
      <p style={{ marginTop: '24px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
        Copyright &copy; {new Date().getFullYear()} BantuTepat. All rights reserved.
      </p>
    </div>
  );
};

export default Login;
