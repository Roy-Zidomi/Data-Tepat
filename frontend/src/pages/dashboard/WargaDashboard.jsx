import { Users, MessageSquare, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const wargaAccessCards = [
  {
    title: 'Anggota Keluarga',
    description: 'Lihat daftar anggota keluarga yang tercatat di rumah tangga Anda.',
    path: '/family-members',
    actionLabel: 'Lihat Anggota',
    icon: Users,
    colorClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    title: 'Pengaduan Saya',
    description: 'Pantau status pengaduan dan kirim laporan baru bila ada masalah.',
    path: '/complaints',
    actionLabel: 'Lihat / Laporkan',
    icon: MessageSquare,
    colorClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  },
];

const WargaDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard Warga</h1>
        <p className="text-sm text-surface-500 mt-1">
          Akun warga dapat melihat anggota keluarga serta mengelola laporan pengaduan miliknya sendiri.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {wargaAccessCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="flex flex-col gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.colorClass}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">{card.title}</h2>
                <p className="text-sm text-surface-500 mt-1">{card.description}</p>
              </div>
              <Button variant="outline" icon={Eye} onClick={() => navigate(card.path)}>
                {card.actionLabel}
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="border-dashed">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Catatan Akses</h2>
        <p className="text-sm text-surface-500 mt-2">
          Fitur tambah data, ajukan bantuan, edit rumah tangga, dan unggah dokumen dinonaktifkan untuk akun warga.
          Jika ada perubahan data, prosesnya dilakukan melalui admin atau petugas terkait.
        </p>
      </Card>
    </div>
  );
};

export default WargaDashboard;
