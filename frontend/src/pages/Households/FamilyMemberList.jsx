import { useState, useEffect } from 'react';
import {
  Baby,
  Briefcase,
  Calendar,
  CreditCard,
  Eye,
  GraduationCap,
  Heart,
  Home,
  Search,
  UserRound,
  Users,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../services/api';
import { capitalizeWords, formatDate, maskNIK } from '../../utils/formatters';

const relationWeight = (relationship) => {
  const relation = (relationship || '').toLowerCase();
  if (relation.includes('kepala')) return 0;
  if (relation.includes('istri') || relation.includes('suami')) return 1;
  if (relation.includes('anak')) return 2;
  return 3;
};

const isHeadRelation = (relationship) => (relationship || '').toLowerCase().includes('kepala');
const isSpouseRelation = (relationship) => {
  const relation = (relationship || '').toLowerCase();
  return relation.includes('istri') || relation.includes('suami');
};
const isChildRelation = (relationship) => (relationship || '').toLowerCase().includes('anak');

const FamilyMemberList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  
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

  const modalFooter = selectedHousehold ? (
    <Button onClick={() => setSelectedHousehold(null)}>Tutup Detail</Button>
  ) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Anggota Keluarga</h1>
          <p className="text-sm text-surface-500 mt-1">Daftar rumah tangga dengan fokus pada kepala keluarga dan ringkasan anggota di dalamnya.</p>
        </div>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input icon={Search} placeholder="Cari kepala keluarga, anggota, atau No KK..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
      </Card>

      {error ? <Alert type="error" title="Error">{error}</Alert> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((household) => {
            const sortedMembers = [...(household.familyMembers || [])].sort((a, b) => {
              const weightDiff = relationWeight(a.relationship_to_head) - relationWeight(b.relationship_to_head);
              if (weightDiff !== 0) return weightDiff;
              return (a.name || '').localeCompare(b.name || '');
            });

            const headMember = sortedMembers.find((member) => isHeadRelation(member.relationship_to_head));
            const spouseMembers = sortedMembers.filter((member) => isSpouseRelation(member.relationship_to_head));
            const childMembers = sortedMembers.filter((member) => isChildRelation(member.relationship_to_head));
            const otherMembers = sortedMembers.filter(
              (member) =>
                !isHeadRelation(member.relationship_to_head) &&
                !isSpouseRelation(member.relationship_to_head) &&
                !isChildRelation(member.relationship_to_head)
            );
            const totalMembers = sortedMembers.length || household._count?.familyMembers || 0;
            const leadName = headMember?.name || household.nama_kepala_keluarga;
            const leadNik = headMember?.nik || household.nik_kepala_keluarga;

            return (
              <Card key={household.id} className="hover:shadow-card-hover transition-all">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <Home className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-surface-500">Kepala Keluarga</p>
                      <h3 className="text-lg font-bold dark:text-white truncate" title={leadName}>{leadName}</h3>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-surface-500">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{household.nomor_kk}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-xl bg-surface-50 dark:bg-surface-800 px-3 py-3">
                    <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
                      <Heart className="w-4 h-4" />
                      <span className="text-xs font-medium">Pasangan</span>
                    </div>
                    <p className="mt-2 text-xl font-bold text-surface-900 dark:text-white">{spouseMembers.length}</p>
                  </div>
                  <div className="rounded-xl bg-surface-50 dark:bg-surface-800 px-3 py-3">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <Baby className="w-4 h-4" />
                      <span className="text-xs font-medium">Anak</span>
                    </div>
                    <p className="mt-2 text-xl font-bold text-surface-900 dark:text-white">{childMembers.length}</p>
                  </div>
                  <div className="rounded-xl bg-surface-50 dark:bg-surface-800 px-3 py-3">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-medium">Total</span>
                    </div>
                    <p className="mt-2 text-xl font-bold text-surface-900 dark:text-white">{totalMembers}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-surface-200 dark:border-surface-700 px-4 py-3 mb-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-surface-500">Nama di depan</span>
                    <span className="font-medium text-surface-900 dark:text-white truncate">{leadName}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm mt-2">
                    <span className="text-surface-500">NIK Kepala</span>
                    <span className="font-medium text-surface-900 dark:text-white">{leadNik ? maskNIK(leadNik) : '-'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm mt-2">
                    <span className="text-surface-500">Preview anggota</span>
                    <span className="font-medium text-surface-900 dark:text-white truncate">
                      {spouseMembers[0]?.name || childMembers[0]?.name || otherMembers[0]?.name || 'Belum ada anggota lain'}
                    </span>
                  </div>
                </div>

                <Button className="w-full" icon={Eye} onClick={() => setSelectedHousehold(household)}>
                  Lihat Detail Keluarga
                </Button>
              </Card>
            );
          })}
          
          {data.length === 0 && (
            <div className="col-span-full">
              <Card>
                <EmptyState
                  icon={Users}
                  title="Data keluarga tidak ditemukan"
                  description="Coba ubah kata kunci pencarian untuk melihat rumah tangga lain."
                />
              </Card>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedHousehold)}
        onClose={() => setSelectedHousehold(null)}
        title={selectedHousehold ? `Detail Keluarga - ${selectedHousehold.nama_kepala_keluarga}` : 'Detail Keluarga'}
        size="xl"
        footer={modalFooter}
      >
        {selectedHousehold && (() => {
          const sortedMembers = [...(selectedHousehold.familyMembers || [])].sort((a, b) => {
            const weightDiff = relationWeight(a.relationship_to_head) - relationWeight(b.relationship_to_head);
            if (weightDiff !== 0) return weightDiff;
            return (a.name || '').localeCompare(b.name || '');
          });

          const headMember = sortedMembers.find((member) => isHeadRelation(member.relationship_to_head)) || {
            id: `head-${selectedHousehold.id}`,
            name: selectedHousehold.nama_kepala_keluarga,
            nik: selectedHousehold.nik_kepala_keluarga || null,
            relationship_to_head: 'Kepala Keluarga',
          };
          const spouseMembers = sortedMembers.filter((member) => isSpouseRelation(member.relationship_to_head));
          const childMembers = sortedMembers.filter((member) => isChildRelation(member.relationship_to_head));
          const otherMembers = sortedMembers.filter(
            (member) =>
              !isHeadRelation(member.relationship_to_head) &&
              !isSpouseRelation(member.relationship_to_head) &&
              !isChildRelation(member.relationship_to_head)
          );

          const memberSections = [
            { title: 'Pasangan', members: spouseMembers, icon: Heart, emptyText: 'Belum ada data pasangan.' },
            { title: 'Anak', members: childMembers, icon: Baby, emptyText: 'Belum ada data anak.' },
            { title: 'Anggota Lain', members: otherMembers, icon: Users, emptyText: 'Tidak ada anggota lain yang tercatat.' },
          ];

          return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] gap-6">
                <Card className="p-5 bg-surface-50 dark:bg-surface-900/40 border-surface-200 dark:border-surface-700">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <UserRound className="w-7 h-7" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-surface-500">Kepala Keluarga</p>
                      <h3 className="text-xl font-bold text-surface-900 dark:text-white truncate">{headMember.name}</h3>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-surface-500">Nomor KK</p>
                          <p className="font-medium text-surface-900 dark:text-white">{selectedHousehold.nomor_kk}</p>
                        </div>
                        <div>
                          <p className="text-surface-500">NIK</p>
                          <p className="font-medium text-surface-900 dark:text-white">{headMember.nik ? maskNIK(headMember.nik) : '-'}</p>
                        </div>
                        <div>
                          <p className="text-surface-500">Gender</p>
                          <p className="font-medium text-surface-900 dark:text-white">
                            {headMember.gender === 'male' ? 'Laki-laki' : headMember.gender === 'female' ? 'Perempuan' : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-surface-500">Pekerjaan</p>
                          <p className="font-medium text-surface-900 dark:text-white">{headMember.occupation || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-4">
                    <p className="text-sm text-surface-500">Total Anggota</p>
                    <p className="mt-2 text-3xl font-bold text-surface-900 dark:text-white">{sortedMembers.length || 1}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-surface-500">Jumlah Anak</p>
                    <p className="mt-2 text-3xl font-bold text-emerald-600">{childMembers.length}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-surface-500">Jumlah Pasangan</p>
                    <p className="mt-2 text-3xl font-bold text-pink-600">{spouseMembers.length}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-surface-500">Anggota Lain</p>
                    <p className="mt-2 text-3xl font-bold text-blue-600">{otherMembers.length}</p>
                  </Card>
                </div>
              </div>

              {memberSections.map((section) => {
                const SectionIcon = section.icon;
                return (
                  <div key={section.title} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <SectionIcon className="w-4 h-4 text-surface-500" />
                      <h4 className="text-base font-semibold text-surface-900 dark:text-white">{section.title}</h4>
                    </div>
                    {section.members.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-surface-300 dark:border-surface-700 px-4 py-5 text-sm text-surface-500">
                        {section.emptyText}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.members.map((member) => (
                          <div key={member.id} className="rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h5 className="font-semibold text-surface-900 dark:text-white truncate">{member.name}</h5>
                                <p className="text-sm text-surface-500">{capitalizeWords((member.relationship_to_head || '').toLowerCase())}</p>
                              </div>
                              <span className="rounded-full bg-surface-100 dark:bg-surface-700 px-2 py-1 text-xs text-surface-500">
                                {member.nik ? maskNIK(member.nik) : 'Tanpa NIK'}
                              </span>
                            </div>
                            <div className="mt-3 space-y-2 text-sm text-surface-500">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{member.birth_date ? formatDate(member.birth_date) : 'Tanggal lahir belum diisi'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                <span>{member.occupation || 'Pekerjaan belum diisi'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" />
                                <span>{member.education_level || 'Pendidikan belum diisi'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default FamilyMemberList;
