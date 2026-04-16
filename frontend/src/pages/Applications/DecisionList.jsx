import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  Pencil,
  Search,
  Send,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../services/api';
import decisionService from '../../services/decisionService';
import applicationService from '../../services/applicationService';
import toast from 'react-hot-toast';
import { FORM_LIMITS, clampText, digitsOnly } from '../../utils/formLimits';

const DECISION_LIMITS = {
  approvedNote: FORM_LIMITS.longNote,
  reasonSummary: FORM_LIMITS.longNote,
  revisionNote: FORM_LIMITS.longNote,
};

const REASON_OPTIONS = [
  { code: 'income_below_threshold', label: 'Penghasilan di bawah ambang' },
  { code: 'high_dependents', label: 'Jumlah tanggungan tinggi' },
  { code: 'poor_housing_condition', label: 'Kondisi rumah tidak layak' },
  { code: 'no_meaningful_assets', label: 'Tidak memiliki aset bernilai' },
  { code: 'vulnerability_factor', label: 'Faktor kerentanan keluarga tinggi' },
  { code: 'document_mismatch', label: 'Ketidaksesuaian dokumen/data' },
];

const TAB_CONFIG = {
  finalize: { title: 'Finalisasi Kelayakan', icon: ClipboardList },
  revise: { title: 'Revisi Keputusan', icon: Pencil },
  report: { title: 'Laporan ke Admin Utama', icon: Send },
};

const blankForm = {
  decision_status: 'approved',
  approved_aid_type_id: '',
  approved_amount: '',
  approved_note: '',
  reason_codes: [],
  reason_summary: '',
  evidence_items_manual: [],
  revision_note: '',
};

const DecisionList = ({ defaultTab = 'finalize' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [search, setSearch] = useState('');
  const [pendingApps, setPendingApps] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [aidTypes, setAidTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [applicationDocuments, setApplicationDocuments] = useState([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([]);
  const [manualEvidence, setManualEvidence] = useState({ evidence_type: '', label: '', file_url: '', note: '' });
  const [formData, setFormData] = useState(blankForm);

  const updateSearch = (value) => {
    setSearch(clampText(value, FORM_LIMITS.search));
  };

  const updateFormField = (field, value) => {
    let nextValue = value;

    if (field === 'approved_amount') nextValue = digitsOnly(value, FORM_LIMITS.money);
    if (field === 'reason_summary') nextValue = clampText(value, DECISION_LIMITS.reasonSummary);
    if (field === 'approved_note') nextValue = clampText(value, DECISION_LIMITS.approvedNote);
    if (field === 'revision_note') nextValue = clampText(value, DECISION_LIMITS.revisionNote);

    setFormData((prev) => ({ ...prev, [field]: nextValue }));
  };

  const updateManualEvidence = (field, value) => {
    let nextValue = value;

    if (field === 'evidence_type') nextValue = clampText(value, FORM_LIMITS.evidenceType);
    if (field === 'label') nextValue = clampText(value, FORM_LIMITS.evidenceLabel);
    if (field === 'file_url') nextValue = clampText(value, FORM_LIMITS.url);
    if (field === 'note') nextValue = clampText(value, FORM_LIMITS.note);

    setManualEvidence((prev) => ({ ...prev, [field]: nextValue }));
  };

  const fetchAidTypes = async () => {
    const response = await api.get('/aid-types');
    setAidTypes(response.data.data || []);
  };

  const fetchPending = async () => {
    const response = await api.get('/aid-applications/all', {
      params: { status: 'admin_review', limit: 100, search: search || undefined },
    });
    setPendingApps(response.data.data?.records || []);
  };

  const fetchDecisions = async () => {
    const response = await decisionService.getAll({
      limit: 100,
      application_no: search || undefined,
      household_name: search || undefined,
    });
    setDecisions(response.data.data?.records || []);
  };

  const loadApplicationDocuments = async (applicationId) => {
    const detail = await applicationService.getById(applicationId);
    const docs = detail.data?.data?.household?.documents || [];
    setApplicationDocuments(docs);
  };

  const refreshAll = async () => {
    try {
      setLoading(true);
      setError('');
      await Promise.all([fetchAidTypes(), fetchPending(), fetchDecisions()]);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data keputusan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const filteredDecisions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return decisions;
    return decisions.filter((decision) => {
      const appNo = decision.application?.application_no?.toLowerCase() || '';
      const household = decision.application?.household?.nama_kepala_keluarga?.toLowerCase() || '';
      return appNo.includes(keyword) || household.includes(keyword);
    });
  }, [decisions, search]);

  const reportableDecisions = filteredDecisions.filter(
    (decision) => decision.decision_status === 'approved' && !decision.reported_to_main
  );

  const resetFormState = () => {
    setFormData(blankForm);
    setSelectedDocumentIds([]);
    setApplicationDocuments([]);
    setManualEvidence({ evidence_type: '', label: '', file_url: '', note: '' });
  };

  const openFinalizeModal = async (application) => {
    try {
      setSelectedApplication(application);
      setSelectedDecision(null);
      resetFormState();
      setFormData((prev) => ({ ...prev, approved_aid_type_id: application.aid_type_id?.toString() || '' }));
      await loadApplicationDocuments(application.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat dokumen rumah tangga');
      setSelectedApplication(null);
    }
  };

  const openRevisionModal = async (decision) => {
    try {
      setSelectedDecision(decision);
      setSelectedApplication(null);
      resetFormState();

      setFormData({
        decision_status: decision.decision_status || 'approved',
        approved_aid_type_id: decision.approved_aid_type_id?.toString() || '',
        approved_amount: decision.approved_amount || '',
        approved_note: decision.approved_note || '',
        reason_codes: Array.isArray(decision.reason_codes) ? decision.reason_codes : [],
        reason_summary: decision.reason_summary || '',
        evidence_items_manual: [],
        revision_note: '',
      });

      const existingEvidence = Array.isArray(decision.evidence_items) ? decision.evidence_items : [];
      const existingDocIds = existingEvidence
        .filter((item) => item.source_type === 'document' && item.source_id)
        .map((item) => item.source_id.toString());
      setSelectedDocumentIds(existingDocIds);
      const existingManual = existingEvidence
        .filter((item) => item.source_type !== 'document')
        .map((item) => ({
          evidence_type: item.evidence_type || '',
          label: item.label || '',
          file_url: item.file_url || '',
          note: item.note || '',
        }));
      if (existingManual.length > 0) {
        setFormData((prev) => ({ ...prev, evidence_items_manual: existingManual }));
      }

      await loadApplicationDocuments(decision.application?.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat data revisi');
      setSelectedDecision(null);
    }
  };

  const toggleReasonCode = (code) => {
    const exists = formData.reason_codes.includes(code);
    setFormData((prev) => ({
      ...prev,
      reason_codes: exists
        ? prev.reason_codes.filter((item) => item !== code)
        : [...prev.reason_codes, code],
    }));
  };

  const toggleDocumentEvidence = (documentId) => {
    const idString = documentId.toString();
    setSelectedDocumentIds((prev) =>
      prev.includes(idString) ? prev.filter((id) => id !== idString) : [...prev, idString]
    );
  };

  const addManualEvidence = () => {
    if (!manualEvidence.evidence_type || !manualEvidence.label) {
      toast.error('Tipe bukti dan label bukti manual wajib diisi');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      evidence_items_manual: [...prev.evidence_items_manual, manualEvidence],
    }));
    setManualEvidence({ evidence_type: '', label: '', file_url: '', note: '' });
  };

  const removeManualEvidence = (index) => {
    setFormData((prev) => ({
      ...prev,
      evidence_items_manual: prev.evidence_items_manual.filter((_, idx) => idx !== index),
    }));
  };

  const buildEvidenceItems = () => {
    const selectedDocs = applicationDocuments
      .filter((doc) => selectedDocumentIds.includes(doc.id.toString()))
      .map((doc) => ({
        evidence_type: doc.document_type || 'document',
        label: doc.original_filename || doc.document_type || `Dokumen #${doc.id}`,
        source_type: 'document',
        source_id: doc.id,
        file_url: doc.file_url?.startsWith('http') ? doc.file_url : null,
        note: null,
      }));

    const manualItems = formData.evidence_items_manual.map((item) => ({
      evidence_type: item.evidence_type,
      label: item.label,
      source_type: 'manual',
      source_id: null,
      file_url: item.file_url || null,
      note: item.note || null,
    }));

    return [...selectedDocs, ...manualItems];
  };

  const validateDecisionPayload = (payload, { isRevision = false } = {}) => {
    if (payload.reason_codes.length < 2) {
      toast.error('Pilih minimal 2 alasan keputusan');
      return false;
    }

    if (!payload.reason_summary || payload.reason_summary.length < 20) {
      toast.error('Ringkasan alasan minimal 20 karakter');
      return false;
    }

    if (payload.decision_status === 'approved' && !payload.approved_aid_type_id) {
      toast.error('Jenis bantuan wajib dipilih untuk keputusan approved');
      return false;
    }

    if (!Array.isArray(payload.evidence_items) || payload.evidence_items.length === 0) {
      toast.error('Minimal 1 bukti dokumen/foto wajib dipilih');
      return false;
    }

    if (isRevision && (!payload.revision_note || payload.revision_note.length < 10)) {
      toast.error('Catatan revisi minimal 10 karakter');
      return false;
    }

    return true;
  };

  const handleFinalizeSubmit = async (event) => {
    event.preventDefault();
    if (!selectedApplication) return;

    const payload = {
      application_id: selectedApplication.id,
      decision_status: formData.decision_status,
      approved_aid_type_id: formData.approved_aid_type_id || null,
      approved_amount: formData.approved_amount || null,
      approved_note: formData.approved_note || null,
      reason_codes: formData.reason_codes,
      reason_summary: formData.reason_summary,
      evidence_items: buildEvidenceItems(),
    };

    if (!validateDecisionPayload(payload)) return;

    try {
      setSubmitting(true);
      await decisionService.create(payload);
      toast.success('Keputusan final staff berhasil disimpan');
      setSelectedApplication(null);
      resetFormState();
      await refreshAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan keputusan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevisionSubmit = async (event) => {
    event.preventDefault();
    if (!selectedDecision) return;

    const payload = {
      decision_status: formData.decision_status,
      approved_aid_type_id: formData.approved_aid_type_id || null,
      approved_amount: formData.approved_amount || null,
      approved_note: formData.approved_note || null,
      reason_codes: formData.reason_codes,
      reason_summary: formData.reason_summary,
      evidence_items: buildEvidenceItems(),
      revision_note: formData.revision_note,
    };

    if (!validateDecisionPayload(payload, { isRevision: true })) return;

    try {
      setSubmitting(true);
      await decisionService.revise(selectedDecision.id, payload);
      toast.success('Revisi keputusan berhasil disimpan');
      setSelectedDecision(null);
      resetFormState();
      await refreshAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal merevisi keputusan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportToMain = async (decisionId) => {
    try {
      await decisionService.reportToMain(decisionId);
      toast.success('Laporan berhasil dikirim ke admin utama');
      await fetchDecisions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim laporan ke admin utama');
    }
  };

  if (loading) return <PageLoader />;

  const renderDecisionForm = ({ isRevision = false } = {}) => (
    <>
      <div className="space-y-3">
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Status Keputusan</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, decision_status: 'approved' }))}
            className={`rounded-xl border-2 p-3 text-sm font-semibold transition ${
              formData.decision_status === 'approved'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                : 'border-surface-200 text-surface-500 dark:border-surface-700'
            }`}
          >
            Layak (Approved)
          </button>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, decision_status: 'rejected' }))}
            className={`rounded-xl border-2 p-3 text-sm font-semibold transition ${
              formData.decision_status === 'rejected'
                ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                : 'border-surface-200 text-surface-500 dark:border-surface-700'
            }`}
          >
            Tidak Layak
          </button>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, decision_status: 'waitlisted' }))}
            className={`rounded-xl border-2 p-3 text-sm font-semibold transition ${
              formData.decision_status === 'waitlisted'
                ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                : 'border-surface-200 text-surface-500 dark:border-surface-700'
            }`}
          >
            Perlu Review
          </button>
        </div>
      </div>

      {formData.decision_status === 'approved' && (
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/10 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Jenis Bantuan</label>
            <select
              value={formData.approved_aid_type_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, approved_aid_type_id: e.target.value }))}
              className="w-full rounded-xl border border-surface-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-surface-700 dark:bg-surface-800"
              required
            >
              <option value="">Pilih bantuan...</option>
              {aidTypes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
          <Input
            label="Nominal / Kuota"
            value={formData.approved_amount}
            onChange={(e) => updateFormField('approved_amount', e.target.value)}
            placeholder="Contoh: 250000"
            inputMode="numeric"
            maxLength={FORM_LIMITS.money}
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Alasan Keputusan (minimal 2)</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {REASON_OPTIONS.map((reason) => (
            <label key={reason.code} className="inline-flex items-center gap-2 rounded-lg border border-surface-200 px-3 py-2 text-sm dark:border-surface-700">
              <input
                type="checkbox"
                checked={formData.reason_codes.includes(reason.code)}
                onChange={() => toggleReasonCode(reason.code)}
              />
              {reason.label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Ringkasan Alasan</label>
        <textarea
          rows={4}
          value={formData.reason_summary}
          onChange={(e) => updateFormField('reason_summary', e.target.value)}
          maxLength={DECISION_LIMITS.reasonSummary}
          className="w-full rounded-xl border border-surface-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-surface-700 dark:bg-surface-800"
          placeholder="Tuliskan alasan final secara ringkas (min 20 karakter)..."
        />
        <p className="text-right text-xs text-surface-500">
          {formData.reason_summary.length}/{DECISION_LIMITS.reasonSummary}
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-surface-200 p-4 dark:border-surface-700">
        <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-200">Pilih Bukti Dokumen/Foto</h3>
        {applicationDocuments.length === 0 ? (
          <p className="text-xs text-surface-500">Belum ada dokumen di rumah tangga ini. Tambahkan bukti manual di bawah.</p>
        ) : (
          <div className="space-y-2">
            {applicationDocuments.map((doc) => (
              <label key={doc.id} className="flex items-start gap-2 rounded-lg border border-surface-200 px-3 py-2 text-sm dark:border-surface-700">
                <input
                  type="checkbox"
                  checked={selectedDocumentIds.includes(doc.id.toString())}
                  onChange={() => toggleDocumentEvidence(doc.id)}
                  className="mt-0.5"
                />
                <span>
                  <span className="font-medium">{doc.original_filename || doc.document_type || `Dokumen #${doc.id}`}</span>
                  <span className="block text-xs text-surface-500">Tipe: {doc.document_type || '-'} </span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 rounded-xl border border-dashed border-surface-300 p-4 dark:border-surface-700">
        <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-200">Tambah Bukti Manual</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            label="Tipe Bukti"
            value={manualEvidence.evidence_type}
            onChange={(e) => updateManualEvidence('evidence_type', e.target.value)}
            placeholder="contoh: foto_rumah_depan"
            maxLength={FORM_LIMITS.evidenceType}
          />
          <Input
            label="Label Bukti"
            value={manualEvidence.label}
            onChange={(e) => updateManualEvidence('label', e.target.value)}
            placeholder="contoh: Foto rumah bagian depan"
            maxLength={FORM_LIMITS.evidenceLabel}
          />
          <Input
            label="URL Bukti (opsional)"
            value={manualEvidence.file_url}
            onChange={(e) => updateManualEvidence('file_url', e.target.value)}
            placeholder="https://..."
            maxLength={FORM_LIMITS.url}
          />
          <Input
            label="Catatan (opsional)"
            value={manualEvidence.note}
            onChange={(e) => updateManualEvidence('note', e.target.value)}
            placeholder="Catatan bukti"
            maxLength={FORM_LIMITS.note}
          />
        </div>
        <div className="flex justify-end">
          <Button type="button" size="sm" variant="outline" onClick={addManualEvidence}>Tambah Bukti Manual</Button>
        </div>

        {formData.evidence_items_manual.length > 0 && (
          <div className="space-y-2">
            {formData.evidence_items_manual.map((item, index) => (
              <div key={`${item.label}-${index}`} className="flex items-center justify-between rounded-lg bg-surface-50 px-3 py-2 text-sm dark:bg-surface-800/50">
                <span>{item.label} ({item.evidence_type})</span>
                <button
                  type="button"
                  onClick={() => removeManualEvidence(index)}
                  className="text-red-500 hover:underline"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Catatan Administratif</label>
        <textarea
          rows={3}
          value={formData.approved_note}
          onChange={(e) => updateFormField('approved_note', e.target.value)}
          maxLength={DECISION_LIMITS.approvedNote}
          className="w-full rounded-xl border border-surface-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-surface-700 dark:bg-surface-800"
          placeholder="Catatan tambahan keputusan"
        />
        <p className="text-right text-xs text-surface-500">
          {formData.approved_note.length}/{DECISION_LIMITS.approvedNote}
        </p>
      </div>

      {isRevision && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Catatan Revisi (wajib)</label>
          <textarea
            rows={3}
            value={formData.revision_note}
            onChange={(e) => updateFormField('revision_note', e.target.value)}
            maxLength={DECISION_LIMITS.revisionNote}
            className="w-full rounded-xl border border-surface-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-surface-700 dark:bg-surface-800"
            placeholder="Jelaskan alasan koreksi data atau perubahan keputusan"
          />
          <p className="text-right text-xs text-surface-500">
            {formData.revision_note.length}/{DECISION_LIMITS.revisionNote}
          </p>
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Finalisasi Kelayakan Staff</h1>
        <p className="text-sm text-surface-500">
          Staff melakukan keputusan final, revisi berjejak, dan mengirim laporan warga layak ke admin utama.
        </p>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            refreshAll();
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <div className="min-w-[220px] flex-1">
            <Input
              icon={Search}
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
              placeholder="Cari no. permohonan / kepala keluarga..."
              maxLength={FORM_LIMITS.search}
            />
          </div>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
      </Card>

      <div className="flex flex-wrap gap-2">
        {Object.entries(TAB_CONFIG).map(([key, tab]) => {
          const Icon = tab.icon;
          const active = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                active
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/25 dark:text-primary-300'
                  : 'border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.title}
            </button>
          );
        })}
      </div>

      {error && <Alert type="error" title="Error">{error}</Alert>}

      {activeTab === 'finalize' && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-200 bg-surface-50 text-surface-500 dark:border-surface-800 dark:bg-surface-800/40 dark:text-surface-400">
              <tr>
                <th className="px-5 py-3">No Permohonan</th>
                <th className="px-5 py-3">Kepala Keluarga</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800/60">
              {pendingApps.map((app) => (
                <tr key={app.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30">
                  <td className="px-5 py-4 font-semibold text-surface-900 dark:text-white">{app.application_no}</td>
                  <td className="px-5 py-4">{app.household?.nama_kepala_keluarga || '-'}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                      {app.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button size="xs" icon={CheckCircle2} onClick={() => openFinalizeModal(app)}>
                      Finalisasi
                    </Button>
                  </td>
                </tr>
              ))}
              {pendingApps.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-surface-500">
                    <ShieldAlert className="mx-auto mb-2 h-7 w-7 opacity-50" />
                    Tidak ada permohonan pada status admin_review.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'revise' && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-200 bg-surface-50 text-surface-500 dark:border-surface-800 dark:bg-surface-800/40 dark:text-surface-400">
              <tr>
                <th className="px-5 py-3">No Permohonan</th>
                <th className="px-5 py-3">Kepala Keluarga</th>
                <th className="px-5 py-3">Keputusan</th>
                <th className="px-5 py-3">Revisi</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800/60">
              {filteredDecisions.map((decision) => (
                <tr key={decision.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30">
                  <td className="px-5 py-4 font-semibold text-surface-900 dark:text-white">{decision.application?.application_no || '-'}</td>
                  <td className="px-5 py-4">{decision.application?.household?.nama_kepala_keluarga || '-'}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-lg px-2 py-1 text-xs font-bold ${
                      decision.decision_status === 'approved'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : decision.decision_status === 'rejected'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}>
                      {decision.decision_status}
                    </span>
                  </td>
                  <td className="px-5 py-4">v{decision.latest_revision_no || 1}</td>
                  <td className="px-5 py-4 text-right">
                    <Button size="xs" variant="secondary" icon={Pencil} onClick={() => openRevisionModal(decision)}>
                      Koreksi
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredDecisions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-surface-500">
                    Belum ada keputusan yang dapat direvisi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'report' && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-200 bg-surface-50 text-surface-500 dark:border-surface-800 dark:bg-surface-800/40 dark:text-surface-400">
              <tr>
                <th className="px-5 py-3">No Permohonan</th>
                <th className="px-5 py-3">Kepala Keluarga</th>
                <th className="px-5 py-3">Ringkasan Alasan</th>
                <th className="px-5 py-3">Bukti</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800/60">
              {reportableDecisions.map((decision) => (
                <tr key={decision.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30">
                  <td className="px-5 py-4 font-semibold text-surface-900 dark:text-white">{decision.application?.application_no || '-'}</td>
                  <td className="px-5 py-4">{decision.application?.household?.nama_kepala_keluarga || '-'}</td>
                  <td className="px-5 py-4 max-w-md">
                    <p className="line-clamp-2">{decision.reason_summary || '-'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      <FileCheck2 className="h-3.5 w-3.5" />
                      {Array.isArray(decision.evidence_items) ? decision.evidence_items.length : 0}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button size="xs" icon={Send} onClick={() => handleReportToMain(decision.id)}>
                      Kirim ke Admin Utama
                    </Button>
                  </td>
                </tr>
              ))}
              {reportableDecisions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-surface-500">
                    Semua keputusan approved sudah dilaporkan ke admin utama.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        isOpen={Boolean(selectedApplication)}
        onClose={() => {
          setSelectedApplication(null);
          resetFormState();
        }}
        title="Finalisasi Kelayakan"
        size="xl"
      >
        {selectedApplication && (
          <form onSubmit={handleFinalizeSubmit} className="space-y-4">
            <Alert type="info" title="Kebijakan">
              Keputusan final tidak dihapus. Jika ada salah input, gunakan fitur revisi dengan jejak audit.
            </Alert>
            {renderDecisionForm({ isRevision: false })}
            <div className="flex justify-end gap-3 border-t border-surface-200 pt-4 dark:border-surface-700">
              <Button type="button" variant="ghost" onClick={() => setSelectedApplication(null)}>Batal</Button>
              <Button type="submit" loading={submitting} icon={CheckCircle2}>Simpan Keputusan Final</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(selectedDecision)}
        onClose={() => {
          setSelectedDecision(null);
          resetFormState();
        }}
        title="Revisi Keputusan"
        size="xl"
      >
        {selectedDecision && (
          <form onSubmit={handleRevisionSubmit} className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  Revisi akan membuat versi baru (v{(selectedDecision.latest_revision_no || 1) + 1}) dan otomatis membatalkan status laporan sebelumnya.
                </p>
              </div>
            </div>
            {renderDecisionForm({ isRevision: true })}
            <div className="flex justify-end gap-3 border-t border-surface-200 pt-4 dark:border-surface-700">
              <Button type="button" variant="ghost" onClick={() => setSelectedDecision(null)}>Batal</Button>
              <Button type="submit" loading={submitting} icon={Pencil}>Simpan Revisi</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default DecisionList;
