import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Mail, Lock, Heart, Phone } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import authService from '../../services/authService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { FORM_LIMITS, clampText, phoneOnly } from '../../utils/formLimits';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === 'name') nextValue = clampText(value, FORM_LIMITS.name);
    if (name === 'username') nextValue = clampText(value, FORM_LIMITS.username);
    if (name === 'email') nextValue = clampText(value, FORM_LIMITS.email);
    if (name === 'phone') nextValue = phoneOnly(value, FORM_LIMITS.phone);
    if (name === 'password' || name === 'confirmPassword') nextValue = clampText(value, FORM_LIMITS.password);

    setFormData(prev => ({ ...prev, [name]: nextValue }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password dan konfirmasi password tidak cocok.');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password harus minimal 8 karakter.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.register({
        name: formData.name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        phone: formData.phone
      });
      
      const { user } = res.data.data;
      
      login(user);
      toast.success('Pendaftaran berhasil! Anda otomatis login.');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Pendaftaran gagal. Periksa kembali form Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl rounded-t-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Heart className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
          Daftar BantuTepat
        </h2>
        <p className="mt-2 text-center text-sm text-surface-600 dark:text-surface-400">
          Sistem Informasi Bantuan Sosial Terpadu
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl animate-slide-up">
        <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl py-8 px-4 shadow-xl shadow-surface-200/50 dark:shadow-none sm:rounded-2xl sm:px-10 border border-surface-200 dark:border-surface-700">
          <form className="space-y-6" onSubmit={onSubmit}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nama Lengkap"
                name="name"
                type="text"
                required
                placeholder="cth. Budi Santoso"
                icon={User}
                value={formData.name}
                onChange={handleChange}
                maxLength={FORM_LIMITS.name}
              />
              <Input
                label="Username"
                name="username"
                type="text"
                required
                placeholder="cth. budisantoso"
                icon={User}
                value={formData.username}
                onChange={handleChange}
                maxLength={FORM_LIMITS.username}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Email"
                name="email"
                type="email"
                required
                placeholder="cth. budi@gmail.com"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                maxLength={FORM_LIMITS.email}
              />
              <Input
                label="Nomor Telepon"
                name="phone"
                type="tel"
                placeholder="cth. 08123456789"
                icon={Phone}
                value={formData.phone}
                onChange={handleChange}
                inputMode="tel"
                maxLength={FORM_LIMITS.phone}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Password"
                name="password"
                type="password"
                required
                placeholder="Minimal 8 karakter"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                maxLength={FORM_LIMITS.password}
              />
              <Input
                label="Konfirmasi Password"
                name="confirmPassword"
                type="password"
                required
                placeholder="Ulangi password"
                icon={Lock}
                value={formData.confirmPassword}
                onChange={handleChange}
                maxLength={FORM_LIMITS.password}
              />
            </div>

            <Button
              type="submit"
              className="w-full shadow-lg shadow-primary-500/25"
              loading={loading}
              size="lg"
            >
              Daftar Sekarang
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center space-x-2">
            <span className="text-sm text-surface-600 dark:text-surface-400">
              Sudah memiliki akun?
            </span>
            <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
