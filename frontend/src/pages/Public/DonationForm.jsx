import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, CreditCard, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { FORM_LIMITS, clampText, digitsOnly, phoneOnly } from '../../utils/formLimits';

const DONATION_MESSAGE_LIMIT = 500;

const DonationForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
    payment_method: 'bank_transfer',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === 'amount') nextValue = digitsOnly(value, FORM_LIMITS.money);
    if (name === 'name') nextValue = clampText(value, FORM_LIMITS.name);
    if (name === 'email') nextValue = clampText(value, FORM_LIMITS.email);
    if (name === 'phone') nextValue = phoneOnly(value, FORM_LIMITS.phone);
    if (name === 'message') nextValue = clampText(value, DONATION_MESSAGE_LIMIT);

    setFormData({ ...formData, [name]: nextValue });
  };

  const setAmount = (val) => {
    setFormData({ ...formData, amount: val.toString() });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(formData.amount) < 10000) {
      toast.error('Minimal donasi adalah Rp 10.000');
      return;
    }

    setLoading(true);
    // Simulate API Call / Payment Gateway redirection
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      toast.success('Deklarasi donasi berhasil! Terima kasih atas partisipasi Anda.');
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center p-4">
         <Card className="max-w-md w-full text-center p-8 space-y-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
               <CheckCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold dark:text-white">Terima Kasih, {formData.name || 'Orang Baik'}!</h1>
            <p className="text-surface-600 dark:text-surface-400">
               Niat baik Anda senilai <b>Rp {Number(formData.amount).toLocaleString()}</b> telah tercatat. Silakan lakukan transfer ke rekening virtual di bawah ini untuk mengonfirmasi:
            </p>
            <div className="bg-surface-100 dark:bg-surface-800 p-4 rounded-xl border border-surface-200 dark:border-surface-700 font-mono text-lg font-bold tracking-widest text-primary-600 dark:text-primary-400">
               8820 1918 3931 1000
            </div>
            <p className="text-xs text-surface-500">Virtual Account otomatis memverifikasi saldo Anda dalam 10 menit.</p>
            <Button className="w-full mt-4" onClick={() => navigate('/public-dashboard')}>Kembali ke Dashboard Publik</Button>
         </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/public-dashboard')} className="mb-6 -ml-4">
          Kembali
        </Button>

        <div className="text-center space-y-3 mb-10">
           <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto shadow-md shadow-primary-500/20">
             <Heart className="w-8 h-8" />
           </div>
           <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white">Berdonasi untuk Sesama</h1>
           <p className="text-surface-600 dark:text-surface-400 max-w-xl mx-auto">
             Setiap rupiah yang Anda donasikan dikelola transparan untuk didistribusikan langsung kepada keluarga tak mampu yang telah disurvei.
           </p>
        </div>

        <Card className="p-6 md:p-8 shadow-2xl shadow-primary-900/5 dark:shadow-none">
           <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Nominal donasi */}
              <div className="space-y-4">
                 <h2 className="text-lg font-bold dark:text-white border-b pb-2 dark:border-surface-700">1. Ketik Nominal Donasi (Rp)</h2>
                 
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   {[50000, 100000, 250000, 500000].map(val => (
                     <button
                       key={val}
                       type="button"
                       onClick={() => setAmount(val)}
                       className={`py-3 rounded-xl border-2 font-bold transition-all ${Number(formData.amount) === val ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'border-surface-200 text-surface-600 hover:border-primary-300 dark:border-surface-700 dark:text-surface-300'}`}
                     >
                       Rp {(val/1000).toLocaleString()}K
                     </button>
                   ))}
                 </div>
                 <Input 
                   type="text" 
                    name="amount" 
                    value={formData.amount} 
                    onChange={handleChange} 
                    placeholder="Atau masukkan nominal lain" 
                    className="text-lg font-bold pb-2"
                    inputMode="numeric"
                    maxLength={FORM_LIMITS.money}
                    required
                 />
              </div>

              {/* Data Donatur */}
              <div className="space-y-4">
                 <h2 className="text-lg font-bold dark:text-white border-b pb-2 dark:border-surface-700">2. Informasi Donatur</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Nama Lengkap" name="name" value={formData.name} onChange={handleChange} placeholder="Hamba Allah / Anonim" maxLength={FORM_LIMITS.name} />
                    <Input label="Email (Untuk Bukti)" type="email" name="email" value={formData.email} onChange={handleChange} maxLength={FORM_LIMITS.email} />
                    <div className="col-span-full">
                       <Input label="Nomor WhatsApp (Opsional)" name="phone" value={formData.phone} onChange={handleChange} inputMode="tel" maxLength={FORM_LIMITS.phone} />
                    </div>
                    <div className="col-span-full">
                       <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Pesan atau Doa (Opsional)</label>
                       <textarea 
                         name="message"
                         value={formData.message}
                         onChange={handleChange}
                         rows={2}
                         maxLength={DONATION_MESSAGE_LIMIT}
                         className="w-full rounded-lg border-surface-300 focus:border-primary-500 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
                         placeholder="Tulis doa atau dukungan Anda..."
                       />
                       <p className="mt-1 text-xs text-surface-500 text-right">
                         {formData.message.length}/{DONATION_MESSAGE_LIMIT}
                       </p>
                    </div>
                 </div>
              </div>

              <div className="flex bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl items-start gap-3 border border-blue-200 dark:border-blue-800">
                 <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                 <p className="text-sm text-blue-800 dark:text-blue-200">
                   Sistem pembayaran akan dilanjutkan melalui Gateway Pembayaran aman yang memfasilitasi E-Wallet, Kartu Kredit, maupun Transfer Bank.
                 </p>
              </div>

              <Button type="submit" size="lg" className="w-full py-4 text-lg" loading={loading} icon={CreditCard}>
                 Lanjutkan Pembayaran
              </Button>
           </form>
        </Card>
      </div>
    </div>
  );
};

export default DonationForm;
