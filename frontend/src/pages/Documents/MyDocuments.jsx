import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Search, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import documentService from '../../services/documentService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import { formatDateTime, capitalizeWords } from '../../utils/formatters';

const DOC_STATUS_MAP = {
  pending: { label: 'Menunggu', color: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300' },
  verified: { label: 'Diterima', color: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300' },
  rejected: { label: 'Ditolak', color: 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-300' },
};

const MyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await documentService.getMyDocuments();
      setDocuments(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat dokumen Anda.');
      toast.error('Gagal mengambil data dokumen.');
    } finally {
      setLoading(false);
    }
  };

  const getDocStatus = (doc) => {
    if (!doc.verifications || doc.verifications.length === 0) return 'pending';
    return doc.verifications[0].status; // Get latest verification status
  };

  const getStatusColor = (status) => DOC_STATUS_MAP[status]?.color || DOC_STATUS_MAP.pending.color;
  const getStatusLabel = (status) => DOC_STATUS_MAP[status]?.label || 'Menunggu';

  const filteredDocs = documents.filter(doc => 
    doc.document_type?.toLowerCase().includes(search.toLowerCase()) ||
    doc.original_filename?.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const totalDocs = documents.length;
  const acceptedDocs = documents.filter(d => getDocStatus(d) === 'verified').length;
  const pendingDocs = documents.filter(d => getDocStatus(d) === 'pending').length;
  const rejectedDocs = documents.filter(d => getDocStatus(d) === 'rejected').length;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dokumen Saya</h1>
          <p className="mt-1 text-sm text-surface-500">
            Kelola dan pantau status dokumen persyaratan bantuan Anda di sini.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-surface-50 dark:bg-surface-800/50">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-surface-500">Total Dokumen</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{totalDocs}</p>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center gap-4 bg-success-50 dark:bg-success-900/10 border-success-100 dark:border-success-800/30">
          <div className="p-3 bg-success-100 dark:bg-success-800/40 text-success-600 dark:text-success-400 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-success-600 dark:text-success-400">Diterima</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{acceptedDocs}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-warning-50 dark:bg-warning-900/10 border-warning-100 dark:border-warning-800/30">
          <div className="p-3 bg-warning-100 dark:bg-warning-800/40 text-warning-600 dark:text-warning-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-warning-600 dark:text-warning-400">Menunggu</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{pendingDocs}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-danger-50 dark:bg-danger-900/10 border-danger-100 dark:border-danger-800/30">
          <div className="p-3 bg-danger-100 dark:bg-danger-800/40 text-danger-600 dark:text-danger-400 rounded-xl">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-danger-600 dark:text-danger-400">Ditolak</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{rejectedDocs}</p>
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <div className="max-w-md">
          <Input
            icon={Search}
            placeholder="Cari nama atau tipe dokumen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {error && (
        <Alert type="error" title="Error">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center flex-col items-center py-12">
          <Spinner size="lg" />
          <p className="mt-4 text-surface-500">Memuat rincian dokumen...</p>
        </div>
      ) : filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredDocs.map((doc) => {
            const status = getDocStatus(doc);
            const verificationNote = doc.verifications?.[0]?.verification_note;

            return (
              <Card key={doc.id} className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="p-3 bg-surface-100 dark:bg-surface-800 text-primary-500 rounded-lg shrink-0">
                  <FileText className="w-8 h-8" />
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg text-surface-900 dark:text-white">
                      {doc.original_filename || 'Dokumen Tidak Bernama'}
                    </h3>
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                      {getStatusLabel(status)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-surface-600 dark:text-surface-400 uppercase tracking-wider">
                    {doc.document_type.replace(/_/g, ' ')}
                  </p>
                  <div className="text-sm flex items-center gap-4 text-surface-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> 
                      Diunggah: {formatDateTime(doc.uploaded_at)}
                    </span>
                  </div>
                  {verificationNote && (
                    <div className="mt-3 text-sm bg-surface-100 dark:bg-surface-800/50 p-2.5 rounded-lg border border-surface-200 dark:border-surface-700">
                      <span className="font-semibold text-surface-700 dark:text-surface-300">Catatan: </span>
                      <span className="text-surface-600 dark:text-surface-400">{verificationNote}</span>
                    </div>
                  )}
                </div>

                <div className="shrink-0 w-full md:w-auto mt-2 md:mt-0 flex justify-end">
                   {doc.file_url ? (
                     <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                        <Button variant="outline" icon={Eye} className="w-full">
                          Lihat File
                        </Button>
                     </a>
                   ) : (
                     <span className="text-sm text-surface-400 italic">File diproses</span>
                   )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="py-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-surface-100 dark:bg-surface-800 rounded-full mb-4 text-surface-400">
            <FileText className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-1">Belum Ada Dokumen</h3>
          <p className="text-surface-500 max-w-sm">
            {search ? 'Tidak ada dokumen yang sesuai dengan pencarian Anda.' : 'Anda belum memiliki riwayat unggahan dokumen.'}
          </p>
        </Card>
      )}
    </div>
  );
};

export default MyDocuments;
