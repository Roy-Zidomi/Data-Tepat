import { useState, useEffect } from 'react';
import { Users, Search, Shield, User, Plus, Edit2, Lock, Unlock, Mail, Phone, Hash, Copy, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../services/api';
import toast from 'react-hot-toast';

const roleOptions = [
  { value: 'admin_main', label: 'Admin Utama' },
  { value: 'admin_staff', label: 'Admin Staff' },
  { value: 'pengawas', label: 'Pengawas' },
  { value: 'relawan', label: 'Relawan' },
  { value: 'warga', label: 'Warga' }
];

const roleColors = {
  admin_main: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  admin_staff: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  pengawas: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  relawan: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warga: 'bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-300',
};

/**
 * TempPasswordModal - Displayed once after admin creates a new account.
 * Shows temporary password with copy button and security warning.
 */
const TempPasswordModal = ({ info, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(info.tempPassword);
      setCopied(true);
      toast.success('Password berhasil disalin');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = info.tempPassword;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success('Password berhasil disalin');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Akun Berhasil Dibuat" size="md">
      <div className="space-y-5">
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        {/* User info */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white">{info.name}</h3>
          <p className="text-sm text-surface-500 mt-0.5">
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${roleColors[info.role] || roleColors.warga}`}>
              {info.role?.replace('_', ' ')}
            </span>
          </p>
          {info.username && (
            <p className="text-xs text-surface-500 mt-2">
              Username: <span className="font-mono font-medium text-surface-700 dark:text-surface-300">{info.username}</span>
            </p>
          )}
        </div>

        {/* Password display */}
        <div className="bg-surface-50 dark:bg-surface-800/80 border border-surface-200 dark:border-surface-700 rounded-xl p-4">
          <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 mb-2 uppercase tracking-wider">
            Password Sementara
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-lg font-mono font-bold text-surface-900 dark:text-white tracking-wider bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-600 rounded-lg px-3 py-2 select-all">
              {showPassword ? info.tempPassword : '••••••••••'}
            </code>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 rounded-lg bg-surface-100 dark:bg-surface-700 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
              title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg transition-colors ${
                copied
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                  : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 hover:bg-primary-200 dark:hover:bg-primary-900/50'
              }`}
              title="Salin password"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Security warning */}
        <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            <strong>Password ini hanya ditampilkan sekali.</strong> Harap catat dan sampaikan ke pengguna secara aman. Pengguna akan diminta mengganti password saat login pertama kali.
          </p>
        </div>

        {/* Close button */}
        <div className="flex justify-end pt-2 border-t border-surface-200 dark:border-surface-700">
          <Button variant="primary" onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </Modal>
  );
};

const UserList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modals
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [tempPasswordInfo, setTempPasswordInfo] = useState(null);
  
  // Forms loading state
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'relawan' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.get('/users', {
        params: { search, role: roleFilter || undefined, limit: 100 }
      });
      setData(res.data.data?.records || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat daftar pengguna');
    } finally { setLoading(false); }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/users', formData);
      const responseData = res.data?.data;
      const tempPassword = responseData?.tempPassword;
      const createdUser = responseData?.user || responseData;

      setCreateModalOpen(false);

      // If temp password was returned (non-warga), show it
      if (tempPassword) {
        setTempPasswordInfo({
          name: createdUser?.name || formData.name,
          role: createdUser?.role || formData.role,
          username: createdUser?.username || '',
          tempPassword,
        });
      } else {
        toast.success('Akun warga berhasil dibuat (aktivasi via OTP)');
      }

      setFormData({ name: '', email: '', phone: '', role: 'relawan' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat pengguna');
    } finally { setSubmitting(false); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.put(`/users/${editUser.id}`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      // Update role if changed
      if (formData.role !== editUser.role) {
         await api.patch(`/users/${editUser.id}/role`, { role: formData.role });
      }

      toast.success('Data pengguna berhasil diperbarui');
      setEditUser(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui pengguna');
    } finally { setSubmitting(false); }
  };

  const handleToggleActive = async (user) => {
    const action = user.is_active ? 'menonaktifkan' : 'mengaktifkan';
    if (!window.confirm(`Anda yakin ingin ${action} akses untuk ${user.name}?`)) return;
    
    try {
      await api.patch(`/users/${user.id}/active`, { is_active: !user.is_active });
      toast.success(`Akun berhasil di-${user.is_active ? 'nonaktifkan' : 'aktifkan'}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status aktif');
    }
  };

  const openEditModal = (user) => {
    setFormData({ name: user.name, email: user.email || '', phone: user.phone || '', role: user.role });
    setEditUser(user);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Manajemen Pengguna</h1>
          <p className="text-sm text-surface-500 mt-1">Kelola akun admin, staf, pengawas, dan relawan</p>
        </div>
        <Button icon={Plus} onClick={() => setCreateModalOpen(true)}>Buat Akun Baru</Button>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input icon={Search} placeholder="Cari nama, email, atau username..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm px-3 py-2.5 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua Peran</option>
            {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
      </Card>

      {error ? <Alert type="error" title="Error">{error}</Alert> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((user) => (
            <Card key={user.id} className={`hover:shadow-card-hover transition-all flex flex-col ${!user.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    user.is_active ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30' : 'bg-surface-200 text-surface-500 dark:bg-surface-700'
                  }`}>
                    {user.role.includes('admin') ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold dark:text-white truncate" title={user.name}>{user.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`px-2 py-[2px] rounded-full text-[10px] font-bold uppercase tracking-wider ${roleColors[user.role] || roleColors.warga}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                      {!user.is_active && <Lock className="w-3 h-3 text-red-500" />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-surface-600 dark:text-surface-400 mb-4 flex-1">
                <div className="flex items-center gap-2"><Hash className="w-3.5 h-3.5 text-surface-400"/> <span className="truncate">{user.username}</span></div>
                {user.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-surface-400"/> <span className="truncate">{user.email}</span></div>}
                {user.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-surface-400"/> <span>{user.phone}</span></div>}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-surface-100 dark:border-surface-800">
                <Button size="xs" variant="secondary" icon={Edit2} className="flex-1 justify-center" onClick={() => openEditModal(user)}>
                  Edit
                </Button>
                <Button size="xs" variant={user.is_active ? 'outline' : 'primary'} 
                  className={`flex-1 justify-center ${user.is_active ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20' : ''}`}
                  icon={user.is_active ? Lock : Unlock} 
                  onClick={() => handleToggleActive(user)}>
                  {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                </Button>
              </div>
            </Card>
          ))}
          
          {data.length === 0 && (
            <div className="col-span-full text-center py-10 text-surface-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Tidak ada pengguna yang ditemukan.</p>
            </div>
          )}
        </div>
      )}

      {/* CREATE MODAL */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Buat Akun Baru" size="md">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input label="Nama Lengkap" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Cth. Supardi" />
          <Input label="Email Pribadi" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="supardi@email.com" />
          <Input label="Nomor Telepon (WhatsApp)" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="08123456789" />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Peran Pengguna</label>
            <select
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              className="w-full rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm px-3 py-2.5 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
            >
              {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <p className="text-xs text-surface-500 mt-1">Username dan Password akan di-generate otomatis dan dikirim via Email atau sistem.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
            <Button type="button" variant="ghost" onClick={() => setCreateModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" loading={submitting}>Simpan & Buat Akun</Button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit Profil Pengguna" size="md">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input label="Nama Lengkap" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <Input label="Email Pribadi" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <Input label="Nomor Telepon (WhatsApp)" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Peran Pengguna</label>
            <select
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              className="w-full rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm px-3 py-2.5 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
              disabled={editUser?.role === 'admin_main'}
            >
              {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            {editUser?.role === 'admin_main' && <p className="text-xs text-red-500 mt-1">Peran Admin Utama tidak dapat diubah dari dashboard.</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
            <Button type="button" variant="ghost" onClick={() => setEditUser(null)}>Batal</Button>
            <Button type="submit" variant="primary" loading={submitting}>Simpan Perubahan</Button>
          </div>
        </form>
      </Modal>

      {/* TEMP PASSWORD MODAL */}
      {tempPasswordInfo && (
        <TempPasswordModal
          info={tempPasswordInfo}
          onClose={() => setTempPasswordInfo(null)}
        />
      )}

    </div>
  );
};

export default UserList;
