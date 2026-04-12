import { useState, useEffect } from 'react';
import { Users, Search, GraduationCap, Briefcase, Calendar, CreditCard } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../services/api';

const FamilyMemberList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.get('/admin-views/family-members', {
        params: { search, limit: 50 }
      });
      setData(res.data.data?.records || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat daftar anggota keluarga');
    } finally { setLoading(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Anggota Keluarga</h1>
          <p className="text-sm text-surface-500 mt-1">Daftar agregasi individu lintas rumah tangga (Read Only)</p>
        </div>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input icon={Search} placeholder="Cari NIK, Nama, atau No KK..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
      </Card>

      {error ? <Alert type="error" title="Error">{error}</Alert> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((member) => (
            <Card key={member.id} className="hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold dark:text-white truncate" title={member.name}>{member.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-surface-500">
                      <CreditCard className="w-3.5 h-3.5" /> <span>{member.nik}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-surface-600 dark:text-surface-400 mb-4 bg-surface-50 dark:bg-surface-800 p-3 rounded-lg">
                <div className="flex gap-2">
                  <span className="text-surface-400 w-24">Hubungan:</span>
                  <span className="font-medium text-surface-900 dark:text-white">{member.relationship_to_head}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-surface-400 w-24">Gender:</span>
                  <span className="capitalize">{member.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</span>
                </div>
                {member.birth_date && (
                  <div className="flex items-center gap-2">
                    <span className="text-surface-400 w-24">Tgl Lahir:</span>
                    <span><Calendar className="w-3 h-3 inline mr-1"/>{new Date(member.birth_date).toLocaleDateString('id-ID')}</span>
                  </div>
                )}
                {member.education_level && (
                  <div className="flex items-center gap-2">
                    <span className="text-surface-400 w-24">Pendidikan:</span>
                    <span className="truncate"><GraduationCap className="w-3 h-3 inline mr-1"/>{member.education_level}</span>
                  </div>
                )}
                {member.occupation && (
                  <div className="flex items-center gap-2">
                    <span className="text-surface-400 w-24">Pekerjaan:</span>
                    <span className="truncate"><Briefcase className="w-3 h-3 inline mr-1"/>{member.occupation}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-surface-100 dark:border-surface-800 text-xs">
                <div className="flex justify-between items-center text-surface-500">
                  <span>Kepala Keluarga:</span>
                  <span className="font-medium truncate ml-2" title={member.household.nama_kepala_keluarga}>
                    {member.household.nama_kepala_keluarga}
                  </span>
                </div>
              </div>
            </Card>
          ))}
          
          {data.length === 0 && (
            <div className="col-span-full text-center py-10 text-surface-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Tidak ada pendaftaran anggota keluarga yang ditemukan.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FamilyMemberList;
