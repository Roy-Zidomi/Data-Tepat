import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Activation = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify & Activate
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const requestOtp = async (e) => {
    e.preventDefault();
    if (!phone) return toast.error('Nomor HP wajib diisi');
    
    try {
      setLoading(true);
      await api.post('/auth/otp/resend', { phone });
      toast.success('OTP berhasil dikirim ke WhatsApp Anda');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim OTP');
    } finally {
      setLoading(false);
    }
  };

  const activateAccount = async (e) => {
    e.preventDefault();
    if (!otpCode || !newPassword) return toast.error('Kode OTP dan sandi baru wajib diisi');
    if (newPassword.length < 6) return toast.error('Sandi minimal 6 karakter');

    try {
      setLoading(true);
      await api.post('/auth/activate', { phone, otpCode, newPassword });
      toast.success('Aktivasi berhasil! Silakan login dengan sandi baru Anda');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengaktivasi akun');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#4A90D9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '40px 36px 32px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1a1a2e', margin: '0 0 4px 0' }}>Aktivasi Akun</h1>
        <p style={{ fontSize: '14px', color: '#888', margin: '0 0 28px 0' }}>
          {step === 1 ? 'Masukkan nomor WhatsApp terdaftar Anda' : 'Masukkan OTP dan sandi baru Anda'}
        </p>

        {step === 1 && (
          <form onSubmit={requestOtp}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '8px' }}>Nomor WhatsApp / HP</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                required
                style={inputStyle}
              />
            </div>
            <button type="submit" disabled={loading} style={buttonStyle(loading)}>
              {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={activateAccount}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '8px' }}>Kode OTP (6 Digit)</label>
              <input
                type="text"
                maxLength="6"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                required
                style={{...inputStyle, letterSpacing: '4px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold'}}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '8px' }}>Buat Sandi Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 karakter"
                required
                style={inputStyle}
              />
            </div>
            
            <button type="submit" disabled={loading} style={buttonStyle(loading)}>
              {loading ? 'Memvalidasi...' : 'Aktivasi Sekarang'}
            </button>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
               <button type="button" onClick={requestOtp} disabled={loading} style={{ background: 'none', border: 'none', color: '#4A90D9', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  Kirim Ulang OTP
               </button>
            </div>
          </form>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <a href="/login" style={{ fontSize: '13px', color: '#888', textDecoration: 'none' }}>Kembali ke Login</a>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '10px',
  border: '1.5px solid #e5e7eb',
  backgroundColor: '#f3f6fb',
  fontSize: '14px',
  color: '#1a1a2e',
  outline: 'none',
  boxSizing: 'border-box',
};

const buttonStyle = (loading) => ({
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
});

export default Activation;
