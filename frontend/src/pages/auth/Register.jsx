import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Mail, Lock, HeartHandshake, Phone } from 'lucide-react';
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
      
      const { user, token, csrfToken } = res.data.data;
      
      login(user, token, csrfToken);
      toast.success('Pendaftaran berhasil! Anda otomatis login.');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Pendaftaran gagal. Periksa kembali form Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950 flex font-sans">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-5/12 bg-surface-900 relative overflow-hidden items-end p-12">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute -top-[15%] -left-[5%] w-[50%] h-[50%] rounded-full bg-primary-600/10 blur-3xl"></div>
          <div className="absolute bottom-[5%] -right-[10%] w-[45%] h-[45%] rounded-full bg-primary-400/8 blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 text-white mb-6">
            <div className="p-2 bg-white/10 rounded-lg">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">BantuTepat</span>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Bergabung dengan Platform Bantuan Sosial Terpadu
          </h2>
          <p className="text-surface-400 text-sm max-w-sm">
            Daftarkan akun Anda untuk mengakses fitur pendataan, verifikasi, dan distribusi bantuan sosial.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-7/12 flex items-center justify-center px-4 py-10 sm:p-12 overflow-y-auto">
        {/* Mobile logo */}
        <div className="absolute top-6 left-4 lg:hidden flex items-center gap-2 text-surface-900 dark:text-white">
          <HeartHandshake className="w-5 h-5 text-primary-600" />
          <span className="text-lg font-bold">BantuTepat</span>
        </div>

        <div className="w-full max-w-lg animate-fade-in pt-10 lg:pt-0">
          <div className="mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white tracking-tight">
              Daftar Akun
            </h2>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
              Sistem Informasi Bantuan Sosial Terpadu
            </p>
          </div>

          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-4 sm:p-6">
            <form className="space-y-5" onSubmit={onSubmit}>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full"
                loading={loading}
                size="lg"
              >
                Daftar Sekarang
              </Button>
            </form>

            <div className="mt-5 flex items-center justify-center gap-1.5">
              <span className="text-sm text-surface-500 dark:text-surface-400">
                Sudah memiliki akun?
              </span>
              <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                Masuk di sini
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
