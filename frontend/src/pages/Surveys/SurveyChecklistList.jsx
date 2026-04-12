import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  CircleAlert,
  Clock3,
  FileSearch,
  Image as ImageIcon,
  MapPin,
  Search,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/ui/Badge';
import { SURVEY_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const checklistTasks = [
  {
    id: 1,
    status: 'draft',
    survey_date: '2026-04-05',
    recommendation: 'need_follow_up',
    photoCount: 1,
    application: {
      application_no: 'APP-2026-001',
      household: {
        nama_kepala_keluarga: 'Budi Santoso',
        alamat: 'Jl. Merdeka No. 45, Kecamatan Sukamaju',
        region: { village: 'Sukamaju', rt: '01', rw: '05' },
      },
    },
    checklistItems: [
      { item_code: 'kondisi_atap', item_label: 'Kondisi atap terluas', value: 'Seng / Asbes', isComplete: true },
      { item_code: 'kondisi_dinding', item_label: 'Kondisi dinding', value: 'Tembok tanpa plester', isComplete: true },
      { item_code: 'kondisi_lantai', item_label: 'Kondisi lantai', value: 'Semen / plester', isComplete: true },
      { item_code: 'status_kepemilikan', item_label: 'Status kepemilikan rumah', value: '', isComplete: false },
      { item_code: 'pengeluaran_bulanan', item_label: 'Estimasi pengeluaran bulanan', value: '', isComplete: false },
      { item_code: 'catatan_tambahan', item_label: 'Catatan tambahan relawan', value: '', isComplete: false },
    ],
  },
  {
    id: 2,
    status: 'submitted',
    survey_date: '2026-04-01',
    recommendation: 'recommended',
    photoCount: 3,
    application: {
      application_no: 'APP-2026-043',
      household: {
        nama_kepala_keluarga: 'Siti Aminah',
        alamat: 'Perumahan Griya Indah Blok C2',
        region: { village: 'Mekar', rt: '03', rw: '08' },
      },
    },
    checklistItems: [
      { item_code: 'kondisi_atap', item_label: 'Kondisi atap terluas', value: 'Genteng layak', isComplete: true },
      { item_code: 'kondisi_dinding', item_label: 'Kondisi dinding', value: 'Tembok permanen', isComplete: true },
      { item_code: 'kondisi_lantai', item_label: 'Kondisi lantai', value: 'Keramik', isComplete: true },
      { item_code: 'status_kepemilikan', item_label: 'Status kepemilikan rumah', value: 'Milik sendiri', isComplete: true },
      { item_code: 'pengeluaran_bulanan', item_label: 'Estimasi pengeluaran bulanan', value: 'Rp1.500.000', isComplete: true },
      { item_code: 'catatan_tambahan', item_label: 'Catatan tambahan relawan', value: 'Lingkungan aman dan akses kendaraan mudah.', isComplete: true },
    ],
  },
  {
    id: 3,
    status: 'reviewed',
    survey_date: '2026-03-28',
    recommendation: 'need_follow_up',
    photoCount: 2,
    application: {
      application_no: 'APP-2026-032',
      household: {
        nama_kepala_keluarga: 'Rahmat Hidayat',
        alamat: 'Kp. Cibadak RT 02 RW 04',
        region: { village: 'Harapan', rt: '02', rw: '04' },
      },
    },
    checklistItems: [
      { item_code: 'kondisi_atap', item_label: 'Kondisi atap terluas', value: 'Ijuk / Rumbia / Daun', isComplete: true },
      { item_code: 'kondisi_dinding', item_label: 'Kondisi dinding', value: 'Bambu / Anyaman', isComplete: true },
      { item_code: 'kondisi_lantai', item_label: 'Kondisi lantai', value: 'Tanah', isComplete: true },
      { item_code: 'status_kepemilikan', item_label: 'Status kepemilikan rumah', value: 'Menumpang', isComplete: true },
      { item_code: 'pengeluaran_bulanan', item_label: 'Estimasi pengeluaran bulanan', value: 'Rp900.000', isComplete: true },
      { item_code: 'catatan_tambahan', item_label: 'Catatan tambahan relawan', value: 'Perlu verifikasi tambahan untuk kondisi sanitasi.', isComplete: true },
    ],
  },
];

const SurveyChecklistList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTasks = checklistTasks.filter((task) => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) return matchesStatus;

    const matchesSearch =
      task.application.application_no.toLowerCase().includes(searchValue) ||
      task.application.household.nama_kepala_keluarga.toLowerCase().includes(searchValue) ||
      task.application.household.alamat.toLowerCase().includes(searchValue);

    return matchesStatus && matchesSearch;
  });

  const totalItems = checklistTasks.reduce((sum, task) => sum + task.checklistItems.length, 0);
  const completedItems = checklistTasks.reduce(
    (sum, task) => sum + task.checklistItems.filter((item) => item.isComplete).length,
    0
  );
  const draftTasks = checklistTasks.filter((task) => task.status === 'draft').length;
  const submittedTasks = checklistTasks.filter((task) => task.status === 'submitted').length;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Checklist Survei</h1>
        <p className="text-sm text-surface-500">
          Pantau progres item survei lapangan, cek bagian yang belum lengkap, lalu lanjutkan pengisian untuk tiap keluarga.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-surface-500">Total Item Checklist</p>
              <h2 className="mt-2 text-3xl font-bold text-surface-900 dark:text-white">{completedItems}/{totalItems}</h2>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-surface-500">Seluruh tugas relawan yang sudah terisi dibanding total item checklist.</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-surface-500">Checklist Belum Final</p>
              <h2 className="mt-2 text-3xl font-bold text-amber-600">{draftTasks}</h2>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock3 className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-surface-500">Masih perlu dilengkapi sebelum hasil survei dikirim.</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-surface-500">Siap Ditinjau Admin</p>
              <h2 className="mt-2 text-3xl font-bold text-emerald-600">{submittedTasks}</h2>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <FileSearch className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-surface-500">Checklist yang sudah lengkap dan sudah diajukan.</p>
        </Card>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px] gap-4">
          <Input
            icon={Search}
            placeholder="Cari nama kepala keluarga, alamat, atau nomor pengajuan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 px-4 py-2.5 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Diajukan</option>
            <option value="reviewed">Direview</option>
          </select>
        </div>
      </Card>

      {filteredTasks.length === 0 ? (
        <Card>
          <EmptyState
            icon={CircleAlert}
            title="Checklist tidak ditemukan"
            description="Coba ubah kata kunci pencarian atau filter status untuk melihat tugas survei lainnya."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const completedCount = task.checklistItems.filter((item) => item.isComplete).length;
            const progress = Math.round((completedCount / task.checklistItems.length) * 100);

            return (
              <Card key={task.id} className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-surface-500 bg-surface-100 dark:bg-surface-800 px-2.5 py-1 rounded-lg">
                        {task.application.application_no}
                      </span>
                      <StatusBadge statusMap={SURVEY_STATUS} value={task.status} />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                        {task.application.household.nama_kepala_keluarga}
                      </h2>
                      <div className="mt-2 flex items-start gap-2 text-sm text-surface-500">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>
                          {task.application.household.alamat}
                          <br />
                          Desa {task.application.household.region.village} RT {task.application.household.region.rt}/{task.application.household.region.rw}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="rounded-xl bg-surface-50 dark:bg-surface-900/50 px-4 py-3">
                        <p className="text-surface-500">Tanggal Survei</p>
                        <p className="mt-1 font-medium text-surface-900 dark:text-white">{formatDate(task.survey_date)}</p>
                      </div>
                      <div className="rounded-xl bg-surface-50 dark:bg-surface-900/50 px-4 py-3">
                        <p className="text-surface-500">Progress Checklist</p>
                        <p className="mt-1 font-medium text-surface-900 dark:text-white">{completedCount}/{task.checklistItems.length} item</p>
                      </div>
                      <div className="rounded-xl bg-surface-50 dark:bg-surface-900/50 px-4 py-3">
                        <p className="text-surface-500">Foto Lapangan</p>
                        <p className="mt-1 font-medium text-surface-900 dark:text-white">{task.photoCount} file</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-surface-500 mb-2">
                        <span>Progres pengisian</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-200 dark:bg-surface-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-primary-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {task.checklistItems.map((item) => (
                        <div
                          key={item.item_code}
                          className={`rounded-xl border px-4 py-3 ${
                            item.isComplete
                              ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-900/10'
                              : 'border-amber-200 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-900/10'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-surface-900 dark:text-white">{item.item_label}</p>
                            <span
                              className={`text-[11px] font-semibold px-2 py-1 rounded-lg ${
                                item.isComplete
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                              }`}
                            >
                              {item.isComplete ? 'Terisi' : 'Belum'}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-surface-500">
                            {item.value || 'Belum ada jawaban untuk item ini.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:w-56 flex flex-col gap-3">
                    <div className="rounded-2xl border border-surface-200 dark:border-surface-700 p-4 bg-surface-50 dark:bg-surface-900/40">
                      <p className="text-sm font-medium text-surface-900 dark:text-white">Ringkasan Tindak Lanjut</p>
                      <div className="mt-3 flex items-center gap-2 text-sm text-surface-500">
                        <ImageIcon className="w-4 h-4" />
                        <span>{task.photoCount} bukti foto lapangan</span>
                      </div>
                      <p className="mt-3 text-sm text-surface-500">
                        {task.status === 'draft'
                          ? 'Masih ada item checklist yang perlu dilengkapi sebelum finalisasi.'
                          : task.status === 'submitted'
                            ? 'Checklist sudah terkirim dan menunggu proses review admin.'
                            : 'Checklist sudah direview, bisa dibuka kembali untuk melihat detail.'}
                      </p>
                    </div>

                    <Button onClick={() => navigate(`/surveys/${task.id}`)}>
                      {task.status === 'draft' ? 'Lanjut Isi Checklist' : 'Buka Detail Survei'}
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/surveys')}>
                      Kembali ke Tugas Survei
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SurveyChecklistList;
