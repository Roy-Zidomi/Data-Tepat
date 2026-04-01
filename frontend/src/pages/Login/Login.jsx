import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, Mail, Lock } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import authService from '../../services/authService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.emailOrUsername || !formData.password) {
      toast.error('Silakan isi email/username dan password.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.login(formData.emailOrUsername, formData.password);
      const { user, token } = res.data.data;
      
      login(user, token);
      toast.success('Login berhasil!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login gagal. Periksa kembali kredensial Anda.');
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
          Masuk ke BantuTepat
        </h2>
        <p className="mt-2 text-center text-sm text-surface-600 dark:text-surface-400">
          Sistem Informasi Bantuan Sosial Terpadu
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-slide-up">
        <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl py-8 px-4 shadow-xl shadow-surface-200/50 dark:shadow-none sm:rounded-2xl sm:px-10 border border-surface-200 dark:border-surface-700">
          <form className="space-y-6" onSubmit={onSubmit}>
            <Input
              label="Email atau Username"
              name="emailOrUsername"
              type="text"
              autoComplete="username"
              required
              placeholder="Masukkan email atau username"
              icon={Mail}
              value={formData.emailOrUsername}
              onChange={handleChange}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
            />

            <div className="flex items-center justify-between hidden">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-surface-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-surface-900 dark:text-surface-300">
                  Ingat saya
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                  Lupa password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full shadow-lg shadow-primary-500/25"
              loading={loading}
              size="lg"
            >
              Masuk
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-200 dark:border-surface-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-surface-800 text-surface-500">
                  Akses terbatas untuk petugas
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
