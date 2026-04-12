import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Camera,
  CircleAlert,
  Eye,
  FileImage,
  Image as ImageIcon,
  MapPin,
  Search,
  UserRound,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/Badge';
import { SURVEY_STATUS } from '../../utils/constants';
import { formatDate, formatDateTime } from '../../utils/formatters';

const buildPhotoDataUrl = ({ title, subtitle, accent, surface }) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${surface}" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bg)" />
      <rect x="70" y="80" width="1060" height="740" rx="40" fill="rgba(255,255,255,0.16)" />
      <rect x="120" y="170" width="470" height="330" rx="28" fill="rgba(255,255,255,0.18)" />
      <rect x="640" y="170" width="430" height="220" rx="28" fill="rgba(255,255,255,0.20)" />
      <rect x="640" y="430" width="430" height="270" rx="28" fill="rgba(15,23,42,0.16)" />
      <circle cx="250" cy="350" r="96" fill="rgba(255,255,255,0.35)" />
      <rect x="195" y="430" width="250" height="18" rx="9" fill="rgba(255,255,255,0.7)" />
      <rect x="660" y="220" width="260" height="26" rx="13" fill="rgba(255,255,255,0.85)" />
      <rect x="660" y="268" width="210" height="18" rx="9" fill="rgba(255,255,255,0.55)" />
      <rect x="660" y="316" width="300" height="18" rx="9" fill="rgba(255,255,255,0.45)" />
      <text x="120" y="115" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#ffffff">${title}</text>
      <text x="120" y="150" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.82)">${subtitle}</text>
      <text x="660" y="480" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#ffffff">Dokumentasi lapangan</text>
      <text x="660" y="525" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.82)">Bukti visual survei rumah tangga</text>
      <text x="660" y="575" font-family="Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.68)">Galeri simulasi untuk antarmuka relawan</text>
    </svg>
  `)}`;

const photoRecords = [
  {
    id: 'SP-001',
    surveyId: 1,
    surveyStatus: 'draft',
    uploadedAt: '2026-04-05T09:12:00',
    caption: 'Tampak depan rumah dengan akses jalan utama dan dinding samping terlihat jelas.',
    category: 'Tampak Depan',
    fileName: 'survey-budi-depan.jpg',
    imageUrl: buildPhotoDataUrl({
      title: 'Rumah Budi Santoso',
      subtitle: 'Tampak depan dan akses masuk',
      accent: '#2563eb',
      surface: '#0f172a',
    }),
    application: {
      application_no: 'APP-2026-001',
      household: {
        nama_kepala_keluarga: 'Budi Santoso',
        alamat: 'Jl. Merdeka No. 45, Kecamatan Sukamaju',
        region: { village: 'Sukamaju', rt: '01', rw: '05' },
      },
    },
  },
  {
    id: 'SP-002',
    surveyId: 1,
    surveyStatus: 'draft',
    uploadedAt: '2026-04-05T09:28:00',
    caption: 'Bagian ruang utama dan kondisi lantai semen untuk melengkapi catatan checklist.',
    category: 'Bagian Dalam',
    fileName: 'survey-budi-dalam.jpg',
    imageUrl: buildPhotoDataUrl({
      title: 'Interior Rumah',
      subtitle: 'Lantai dan ruang utama',
      accent: '#0f766e',
      surface: '#164e63',
    }),
    application: {
      application_no: 'APP-2026-001',
      household: {
        nama_kepala_keluarga: 'Budi Santoso',
        alamat: 'Jl. Merdeka No. 45, Kecamatan Sukamaju',
        region: { village: 'Sukamaju', rt: '01', rw: '05' },
      },
    },
  },
  {
    id: 'SP-003',
    surveyId: 2,
    surveyStatus: 'submitted',
    uploadedAt: '2026-04-01T13:05:00',
    caption: 'Fasad rumah dan halaman depan, kondisi bangunan terlihat rapi dan layak.',
    category: 'Tampak Depan',
    fileName: 'survey-siti-fasad.jpg',
    imageUrl: buildPhotoDataUrl({
      title: 'Rumah Siti Aminah',
      subtitle: 'Fasad rumah dan halaman',
      accent: '#f59e0b',
      surface: '#7c2d12',
    }),
    application: {
      application_no: 'APP-2026-043',
      household: {
        nama_kepala_keluarga: 'Siti Aminah',
        alamat: 'Perumahan Griya Indah Blok C2',
        region: { village: 'Mekar', rt: '03', rw: '08' },
      },
    },
  },
  {
    id: 'SP-004',
    surveyId: 2,
    surveyStatus: 'submitted',
    uploadedAt: '2026-04-01T13:17:00',
    caption: 'Area dapur dan sumber air bersih sebagai bukti kondisi sanitasi keluarga.',
    category: 'Sanitasi',
    fileName: 'survey-siti-dapur.jpg',
    imageUrl: buildPhotoDataUrl({
      title: 'Area Dapur',
      subtitle: 'Sanitasi dan sumber air',
      accent: '#22c55e',
      surface: '#14532d',
    }),
    application: {
      application_no: 'APP-2026-043',
      household: {
        nama_kepala_keluarga: 'Siti Aminah',
        alamat: 'Perumahan Griya Indah Blok C2',
        region: { village: 'Mekar', rt: '03', rw: '08' },
      },
    },
  },
  {
    id: 'SP-005',
    surveyId: 2,
    surveyStatus: 'submitted',
    uploadedAt: '2026-04-01T13:29:00',
    caption: 'Dokumentasi kepala keluarga di depan rumah untuk validasi kunjungan lapangan.',
    category: 'Verifikasi Kunjungan',
    fileName: 'survey-siti-validasi.jpg',
    imageUrl: buildPhotoDataUrl({
      title: 'Validasi Kunjungan',
      subtitle: 'Kepala keluarga di lokasi',
      accent: '#8b5cf6',
      surface: '#312e81',
    }),
    application: {
      application_no: 'APP-2026-043',
      household: {
        nama_kepala_keluarga: 'Siti Aminah',
        alamat: 'Perumahan Griya Indah Blok C2',
        region: { village: 'Mekar', rt: '03', rw: '08' },
      },
    },
  },
  {
    id: 'SP-006',
    surveyId: 3,
    surveyStatus: 'reviewed',
    uploadedAt: '2026-03-28T10:02:00',
    caption: 'Kondisi atap dan dinding anyaman bambu pada sisi kiri bangunan utama.',
    category: 'Kondisi Struktur',
    fileName: 'survey-rahmat-struktur.jpg',
    imageUrl: buildPhotoDataUrl({
      title: 'Rumah Rahmat Hidayat',
      subtitle: 'Struktur bangunan utama',
      accent: '#ef4444',
      surface: '#7f1d1d',
    }),
    application: {
      application_no: 'APP-2026-032',
      household: {
        nama_kepala_keluarga: 'Rahmat Hidayat',
        alamat: 'Kp. Cibadak RT 02 RW 04',
        region: { village: 'Harapan', rt: '02', rw: '04' },
      },
    },
  },
];

const SurveyPhotoGallery = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const filteredPhotos = photoRecords.filter((photo) => {
    const matchesStatus = statusFilter === 'all' || photo.surveyStatus === statusFilter;
    const keyword = search.trim().toLowerCase();

    if (!keyword) return matchesStatus;

    const matchesSearch =
      photo.application.application_no.toLowerCase().includes(keyword) ||
      photo.application.household.nama_kepala_keluarga.toLowerCase().includes(keyword) ||
      photo.caption.toLowerCase().includes(keyword) ||
      photo.category.toLowerCase().includes(keyword);

    return matchesStatus && matchesSearch;
  });

  const totalPhotos = photoRecords.length;
  const pendingPhotos = photoRecords.filter((photo) => photo.surveyStatus === 'draft').length;
  const completedSurveys = new Set(
    photoRecords.filter((photo) => photo.surveyStatus !== 'draft').map((photo) => photo.surveyId)
  ).size;

  const modalFooter = selectedPhoto ? (
    <>
      <Button variant="outline" onClick={() => navigate(`/surveys/${selectedPhoto.surveyId}`)}>
        Buka Form Survei
      </Button>
      <Button onClick={() => setSelectedPhoto(null)}>Tutup Detail</Button>
    </>
  ) : null;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Foto Survei</h1>
        <p className="text-sm text-surface-500">
          Lihat dokumentasi lapangan per tugas survei, buka preview besar, dan cek detail keluarga serta waktu unggahnya.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-surface-500">Total Foto Tersimpan</p>
              <h2 className="mt-2 text-3xl font-bold text-surface-900 dark:text-white">{totalPhotos}</h2>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-surface-500">Semua foto bukti lapangan yang sudah diunggah relawan.</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-surface-500">Perlu Finalisasi</p>
              <h2 className="mt-2 text-3xl font-bold text-amber-600">{pendingPhotos}</h2>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <CircleAlert className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-surface-500">Foto dari survei draft yang masih perlu ditinjau sebelum dikirim.</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-surface-500">Survei Dengan Foto Lengkap</p>
              <h2 className="mt-2 text-3xl font-bold text-emerald-600">{completedSurveys}</h2>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <FileImage className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-surface-500">Tugas yang sudah punya dokumentasi dan sudah lanjut ke tahap berikutnya.</p>
        </Card>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px] gap-4">
          <Input
            icon={Search}
            placeholder="Cari nama keluarga, kategori foto, caption, atau nomor pengajuan..."
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

      {filteredPhotos.length === 0 ? (
        <Card>
          <EmptyState
            icon={ImageIcon}
            title="Foto survei tidak ditemukan"
            description="Coba ubah kata kunci pencarian atau filter status untuk melihat dokumentasi lain."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPhotos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden p-0">
              <div className="relative aspect-[4/3] overflow-hidden bg-surface-100 dark:bg-surface-900">
                <img
                  src={photo.imageUrl}
                  alt={photo.caption}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                />
                <div className="absolute top-3 left-3">
                  <StatusBadge statusMap={SURVEY_STATUS} value={photo.surveyStatus} />
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-lg bg-black/55 text-white text-xs font-medium">
                    {photo.category}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-surface-500 mb-2">
                    <span className="font-semibold bg-surface-100 dark:bg-surface-800 px-2.5 py-1 rounded-lg">
                      {photo.application.application_no}
                    </span>
                    <span>{photo.fileName}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                    {photo.application.household.nama_kepala_keluarga}
                  </h2>
                  <p className="mt-2 text-sm text-surface-500 line-clamp-2">{photo.caption}</p>
                </div>

                <div className="space-y-2 text-sm text-surface-500">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      {photo.application.household.alamat}
                      <br />
                      Desa {photo.application.household.region.village} RT {photo.application.household.region.rt}/{photo.application.household.region.rw}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 shrink-0" />
                    <span>{formatDateTime(photo.uploadedAt)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1" icon={Eye} onClick={() => setSelectedPhoto(photo)}>
                    Lihat Detail
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => navigate(`/surveys/${photo.surveyId}`)}>
                    Buka Survei
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedPhoto)}
        onClose={() => setSelectedPhoto(null)}
        title={selectedPhoto ? `Detail Foto ${selectedPhoto.id}` : 'Detail Foto'}
        size="xl"
        footer={modalFooter}
      >
        {selectedPhoto && (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)] gap-6">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-900">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.caption}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-2xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 p-4">
                <p className="text-sm font-medium text-surface-900 dark:text-white">Catatan Foto</p>
                <p className="mt-2 text-sm text-surface-500">{selectedPhoto.caption}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge statusMap={SURVEY_STATUS} value={selectedPhoto.surveyStatus} />
                <span className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 text-xs font-semibold text-surface-600 dark:text-surface-300">
                  {selectedPhoto.category}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-surface-900 dark:text-white">
                  {selectedPhoto.application.household.nama_kepala_keluarga}
                </h3>
                <p className="mt-1 text-sm text-surface-500">{selectedPhoto.application.application_no}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface-50 dark:bg-surface-900/50 p-4">
                  <p className="text-xs uppercase tracking-wide text-surface-500">Waktu Unggah</p>
                  <p className="mt-2 text-sm font-medium text-surface-900 dark:text-white">{formatDateTime(selectedPhoto.uploadedAt)}</p>
                </div>
                <div className="rounded-xl bg-surface-50 dark:bg-surface-900/50 p-4">
                  <p className="text-xs uppercase tracking-wide text-surface-500">Tanggal Survei</p>
                  <p className="mt-2 text-sm font-medium text-surface-900 dark:text-white">{formatDate(selectedPhoto.uploadedAt)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-surface-200 dark:border-surface-700 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <UserRound className="w-4 h-4 mt-0.5 text-surface-400 shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-surface-500">Kepala Keluarga</p>
                    <p className="mt-1 text-sm font-medium text-surface-900 dark:text-white">
                      {selectedPhoto.application.household.nama_kepala_keluarga}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-surface-400 shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-surface-500">Alamat Survei</p>
                    <p className="mt-1 text-sm text-surface-700 dark:text-surface-300">
                      {selectedPhoto.application.household.alamat}
                      <br />
                      Desa {selectedPhoto.application.household.region.village} RT {selectedPhoto.application.household.region.rt}/{selectedPhoto.application.household.region.rw}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileImage className="w-4 h-4 mt-0.5 text-surface-400 shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-surface-500">Nama File</p>
                    <p className="mt-1 text-sm text-surface-700 dark:text-surface-300">{selectedPhoto.fileName}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Tindak lanjut</p>
                <p className="mt-2 text-sm text-blue-800 dark:text-blue-300">
                  Gunakan foto ini untuk memastikan checklist dan catatan survei sudah konsisten sebelum finalisasi tugas relawan.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SurveyPhotoGallery;
