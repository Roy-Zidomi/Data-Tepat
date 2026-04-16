import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  DollarSign,
  FileText,
  Home,
  Save,
  ShieldAlert,
  Users,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import api from '../../services/api';
import surveyService from '../../services/surveyService';
import toast from 'react-hot-toast';
import { FORM_LIMITS, clampText, digitsOnly, phoneOnly } from '../../utils/formLimits';

const TABS = [
  { key: 'household', label: 'Identitas KK', icon: Users },
  { key: 'economic', label: 'Kondisi Ekonomi', icon: DollarSign },
  { key: 'housing', label: 'Tempat Tinggal', icon: Home },
  { key: 'assets', label: 'Aset', icon: FileText },
  { key: 'vulnerability', label: 'Kerentanan', icon: ShieldAlert },
  { key: 'documents', label: 'Dokumen & Foto', icon: Camera },
];

const DOCUMENT_LABELS = {
  ktp: 'KTP Kepala Keluarga',
  kk: 'Kartu Keluarga',
  sktm: 'Surat Keterangan Tidak Mampu',
  foto_rumah: 'Foto Rumah',
  foto_lapangan: 'Foto Lapangan',
  lainnya: 'Dokumen Lainnya',
};

const FLOOR_TYPE_OPTIONS = [
  { value: 'keramik', label: 'Keramik' },
  { value: 'semen', label: 'Semen' },
  { value: 'tanah', label: 'Tanah' },
  { value: 'kayu', label: 'Kayu' },
  { value: 'vinyl', label: 'Vinyl' },
  { value: 'marmer', label: 'Marmer' },
  { value: 'lainnya', label: 'Lainnya' },
];

const ROOF_TYPE_OPTIONS = [
  { value: 'genteng', label: 'Genteng' },
  { value: 'seng', label: 'Seng' },
  { value: 'asbes', label: 'Asbes' },
  { value: 'beton', label: 'Beton' },
  { value: 'rumbia', label: 'Rumbia' },
  { value: 'lainnya', label: 'Lainnya' },
];

const WALL_TYPE_OPTIONS = [
  { value: 'tembok', label: 'Tembok' },
  { value: 'bata', label: 'Bata / Batako' },
  { value: 'kayu', label: 'Kayu' },
  { value: 'bambu', label: 'Bambu' },
  { value: 'triplek', label: 'Triplek' },
  { value: 'lainnya', label: 'Lainnya' },
];

const SURVEY_LIMITS = {
  address: 500,
  assetText: 500,
  notes: FORM_LIMITS.longNote,
};

const normalizeValue = (value) => (value || '').toString().trim().toLowerCase();

const mapOptionAndOther = (value, options) => {
  const normalized = normalizeValue(value);
  if (!normalized) return { option: '', other: '' };
  const isKnownOption = options.some((item) => item.value === normalized);
  return isKnownOption
    ? { option: normalized, other: '' }
    : { option: 'lainnya', other: value || '' };
};

const resolveOptionValue = (option, otherValue) => {
  if (!option) return null;
  if (option === 'lainnya') return (otherValue || '').trim() || null;
  return option;
};

const toNullableNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toNullableInteger = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
};

const formatDocType = (type) => DOCUMENT_LABELS[type] || type;

const toIdrString = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return `Rp${parsed.toLocaleString('id-ID')}`;
};

const deriveRecommendation = (economic, housing, vulnerability) => {
  const income = Number(economic.monthly_income_total || 0);
  const hasMajorVulnerability =
    Boolean(vulnerability.is_disaster_victim) ||
    Boolean(vulnerability.has_severe_ill_member) ||
    Boolean(vulnerability.has_disabled_member);
  const poorHousing = ['buruk', 'rusak', 'tidak_layak'].includes((housing.house_condition || '').toLowerCase());

  if (income > 0 && income <= 1200000 && (hasMajorVulnerability || poorHousing)) return 'strongly_recommended';
  if (income > 0 && income <= 2200000) return 'recommended';
  if (income <= 3500000) return 'conditional';
  return 'not_recommended';
};

const buildSurveySummary = ({ household, economic, housing, assets, vulnerability, documents }) => {
  const summaryParts = [
    `Survei lapangan selesai untuk KK ${household.nomor_kk} (${household.nama_kepala_keluarga}).`,
    household.alamat ? `Alamat kunjungan: ${household.alamat}.` : null,
    economic.monthly_income_total ? `Pendapatan bulanan: ${toIdrString(economic.monthly_income_total)}.` : null,
    economic.monthly_basic_expense ? `Pengeluaran pokok: ${toIdrString(economic.monthly_basic_expense)}.` : null,
    housing.house_condition ? `Kondisi rumah: ${housing.house_condition}.` : null,
    assets.other_assets ? `Aset tambahan: ${assets.other_assets}.` : null,
    vulnerability.special_condition_notes ? `Catatan kerentanan: ${vulnerability.special_condition_notes}.` : null,
    `Dokumen/foto terunggah: ${documents.length} file.`,
  ].filter(Boolean);

  return summaryParts.join(' ');
};

const SurveyAction = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('household');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState({});

  const [household, setHousehold] = useState({
    nomor_kk: '',
    nama_kepala_keluarga: '',
    nik_kepala_keluarga: '',
    alamat: '',
    phone: '',
  });

  const [economic, setEconomic] = useState({
    monthly_income_total: '',
    income_source: '',
    head_job_status: '',
    monthly_basic_expense: '',
    dependents_count: '',
    has_other_income_source: false,
    debt_estimation: '',
    notes: '',
  });

  const [housing, setHousing] = useState({
    home_ownership_status: 'milik_sendiri',
    house_condition: '',
    floor_type_option: '',
    floor_type_other: '',
    roof_type_option: '',
    roof_type_other: '',
    wall_type_option: '',
    wall_type_other: '',
    clean_water_access: false,
    electricity_access: false,
    bedroom_count: '',
    notes: '',
  });

  const [assets, setAssets] = useState({
    owns_house: false,
    has_bicycle: false,
    has_motorcycle: false,
    has_car: false,
    has_other_land: false,
    productive_assets: '',
    savings_range: '',
    other_assets: '',
  });

  const [vulnerability, setVulnerability] = useState({
    is_disaster_victim: false,
    lost_job_recently: false,
    has_severe_ill_member: false,
    has_disabled_member: false,
    has_elderly_member: false,
    has_pregnant_member: false,
    has_school_children: false,
    ever_received_aid_before: false,
    special_condition_notes: '',
  });

  const [documents, setDocuments] = useState([]);
  const [docType, setDocType] = useState('foto_rumah');
  const [uploadFile, setUploadFile] = useState(null);

  const updateHouseholdField = (field, value) => {
    let nextValue = value;

    if (field === 'nomor_kk' || field === 'nik_kepala_keluarga') nextValue = digitsOnly(value, FORM_LIMITS.kkNik);
    if (field === 'nama_kepala_keluarga') nextValue = clampText(value, FORM_LIMITS.name);
    if (field === 'phone') nextValue = phoneOnly(value, FORM_LIMITS.phone);
    if (field === 'alamat') nextValue = clampText(value, SURVEY_LIMITS.address);

    setHousehold((prev) => ({ ...prev, [field]: nextValue }));
  };

  const updateEconomicField = (field, value) => {
    let nextValue = value;

    if (['monthly_income_total', 'monthly_basic_expense', 'debt_estimation'].includes(field)) {
      nextValue = digitsOnly(value, FORM_LIMITS.money);
    }
    if (field === 'dependents_count') nextValue = digitsOnly(value, FORM_LIMITS.count);
    if (field === 'income_source') nextValue = clampText(value, 150);
    if (field === 'head_job_status') nextValue = clampText(value, 100);
    if (field === 'notes') nextValue = clampText(value, SURVEY_LIMITS.notes);

    setEconomic((prev) => ({ ...prev, [field]: nextValue }));
  };

  const updateHousingField = (field, value) => {
    let nextValue = value;

    if (field === 'bedroom_count') nextValue = digitsOnly(value, FORM_LIMITS.count);
    if (['floor_type_other', 'roof_type_other', 'wall_type_other'].includes(field)) {
      nextValue = clampText(value, 100);
    }
    if (field === 'notes') nextValue = clampText(value, SURVEY_LIMITS.notes);

    setHousing((prev) => ({ ...prev, [field]: nextValue }));
  };

  const updateAssetsField = (field, value) => {
    let nextValue = value;

    if (field === 'productive_assets') nextValue = clampText(value, SURVEY_LIMITS.assetText);
    if (field === 'savings_range') nextValue = clampText(value, 100);
    if (field === 'other_assets') nextValue = clampText(value, SURVEY_LIMITS.notes);

    setAssets((prev) => ({ ...prev, [field]: nextValue }));
  };

  const updateVulnerabilityField = (field, value) => {
    let nextValue = value;

    if (field === 'special_condition_notes') nextValue = clampText(value, SURVEY_LIMITS.notes);

    setVulnerability((prev) => ({ ...prev, [field]: nextValue }));
  };

  const latestDocumentsByType = useMemo(() => {
    const grouped = {};
    documents.forEach((doc) => {
      const current = grouped[doc.document_type];
      if (!current || new Date(doc.uploaded_at) > new Date(current.uploaded_at)) {
        grouped[doc.document_type] = doc;
      }
    });
    return grouped;
  }, [documents]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [householdRes, documentRes] = await Promise.all([
        api.get(`/households/${id}`),
        api.get(`/documents/household/${id}`),
      ]);

      const detail = householdRes.data.data;
      const docs = documentRes.data.data || [];

      setHousehold({
        nomor_kk: detail.nomor_kk || '',
        nama_kepala_keluarga: detail.nama_kepala_keluarga || '',
        nik_kepala_keluarga: detail.nik_kepala_keluarga || '',
        alamat: detail.alamat || '',
        phone: detail.phone || '',
      });

      setEconomic({
        monthly_income_total: detail.economicCondition?.monthly_income_total ?? '',
        income_source: detail.economicCondition?.income_source || '',
        head_job_status: detail.economicCondition?.head_job_status || '',
        monthly_basic_expense: detail.economicCondition?.monthly_basic_expense ?? '',
        dependents_count: detail.economicCondition?.dependents_count ?? '',
        has_other_income_source: Boolean(detail.economicCondition?.has_other_income_source),
        debt_estimation: detail.economicCondition?.debt_estimation ?? '',
        notes: detail.economicCondition?.notes || '',
      });

      setHousing({
        home_ownership_status: detail.housingCondition?.home_ownership_status || 'milik_sendiri',
        house_condition: detail.housingCondition?.house_condition || '',
        ...(() => {
          const mapped = mapOptionAndOther(detail.housingCondition?.floor_type, FLOOR_TYPE_OPTIONS);
          return {
            floor_type_option: mapped.option,
            floor_type_other: mapped.other,
          };
        })(),
        ...(() => {
          const mapped = mapOptionAndOther(detail.housingCondition?.roof_type, ROOF_TYPE_OPTIONS);
          return {
            roof_type_option: mapped.option,
            roof_type_other: mapped.other,
          };
        })(),
        ...(() => {
          const mapped = mapOptionAndOther(detail.housingCondition?.wall_type, WALL_TYPE_OPTIONS);
          return {
            wall_type_option: mapped.option,
            wall_type_other: mapped.other,
          };
        })(),
        clean_water_access: Boolean(detail.housingCondition?.clean_water_access),
        electricity_access: Boolean(detail.housingCondition?.electricity_access),
        bedroom_count: detail.housingCondition?.bedroom_count ?? '',
        notes: detail.housingCondition?.notes || '',
      });

      setAssets({
        owns_house: Boolean(detail.householdAsset?.owns_house),
        has_bicycle: Boolean(detail.householdAsset?.has_bicycle),
        has_motorcycle: Boolean(detail.householdAsset?.has_motorcycle),
        has_car: Boolean(detail.householdAsset?.has_car),
        has_other_land: Boolean(detail.householdAsset?.has_other_land),
        productive_assets: detail.householdAsset?.productive_assets || '',
        savings_range: detail.householdAsset?.savings_range || '',
        other_assets: detail.householdAsset?.other_assets || '',
      });

      setVulnerability({
        is_disaster_victim: Boolean(detail.vulnerability?.is_disaster_victim),
        lost_job_recently: Boolean(detail.vulnerability?.lost_job_recently),
        has_severe_ill_member: Boolean(detail.vulnerability?.has_severe_ill_member),
        has_disabled_member: Boolean(detail.vulnerability?.has_disabled_member),
        has_elderly_member: Boolean(detail.vulnerability?.has_elderly_member),
        has_pregnant_member: Boolean(detail.vulnerability?.has_pregnant_member),
        has_school_children: Boolean(detail.vulnerability?.has_school_children),
        ever_received_aid_before: Boolean(detail.vulnerability?.ever_received_aid_before),
        special_condition_notes: detail.vulnerability?.special_condition_notes || '',
      });

      setDocuments(docs);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat detail data survei lapangan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const runSave = async (section, callback, successMessage) => {
    try {
      setSaving((prev) => ({ ...prev, [section]: true }));
      await callback();
      toast.success(successMessage);
      return true;
    } catch (err) {
      const firstError = err.response?.data?.errors?.[0];
      const message = firstError
        ? `Validasi ${firstError.field}: ${firstError.message}`
        : (err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.');
      toast.error(message);
      return false;
    } finally {
      setSaving((prev) => ({ ...prev, [section]: false }));
    }
  };

  const saveHousehold = () =>
    runSave(
      'household',
      () =>
        api.put(`/households/${id}`, {
          nomor_kk: household.nomor_kk,
          nama_kepala_keluarga: household.nama_kepala_keluarga,
          nik_kepala_keluarga: household.nik_kepala_keluarga || null,
          alamat: household.alamat,
          phone: household.phone || null,
        }),
      'Identitas warga berhasil diperbarui.'
    );

  const saveEconomic = () =>
    runSave(
      'economic',
      () =>
        api.put(`/household-data/economic-conditions/${id}`, {
          monthly_income_total: toNullableNumber(economic.monthly_income_total),
          income_source: economic.income_source || null,
          head_job_status: economic.head_job_status || null,
          monthly_basic_expense: toNullableNumber(economic.monthly_basic_expense),
          dependents_count: toNullableInteger(economic.dependents_count),
          has_other_income_source: Boolean(economic.has_other_income_source),
          debt_estimation: toNullableNumber(economic.debt_estimation),
          notes: economic.notes || null,
        }),
      'Kondisi ekonomi berhasil disimpan.'
    );

  const saveHousing = () =>
    runSave(
      'housing',
      () => {
        const floorTypeValue = resolveOptionValue(housing.floor_type_option, housing.floor_type_other);
        const roofTypeValue = resolveOptionValue(housing.roof_type_option, housing.roof_type_other);
        const wallTypeValue = resolveOptionValue(housing.wall_type_option, housing.wall_type_other);

        if (housing.floor_type_option === 'lainnya' && !floorTypeValue) {
          throw { response: { data: { message: 'Isi keterangan Lainnya untuk jenis lantai.' } } };
        }
        if (housing.roof_type_option === 'lainnya' && !roofTypeValue) {
          throw { response: { data: { message: 'Isi keterangan Lainnya untuk jenis atap.' } } };
        }
        if (housing.wall_type_option === 'lainnya' && !wallTypeValue) {
          throw { response: { data: { message: 'Isi keterangan Lainnya untuk jenis dinding.' } } };
        }

        return api.put(`/household-data/housing-conditions/${id}`, {
          home_ownership_status: housing.home_ownership_status || null,
          house_condition: housing.house_condition || null,
          floor_type: floorTypeValue,
          roof_type: roofTypeValue,
          wall_type: wallTypeValue,
          clean_water_access: Boolean(housing.clean_water_access),
          electricity_access: Boolean(housing.electricity_access),
          sanitation_type: null,
          bedroom_count: toNullableInteger(housing.bedroom_count),
          notes: housing.notes || null,
        });
      },
      'Kondisi tempat tinggal berhasil disimpan.'
    );

  const saveAssets = () =>
    runSave(
      'assets',
      () =>
        api.put(`/household-data/assets/${id}`, {
          owns_house: Boolean(assets.owns_house),
          has_bicycle: Boolean(assets.has_bicycle),
          has_motorcycle: Boolean(assets.has_motorcycle),
          has_car: Boolean(assets.has_car),
          has_other_land: Boolean(assets.has_other_land),
          productive_assets: assets.productive_assets || null,
          savings_range: assets.savings_range || null,
          other_assets: assets.other_assets || null,
        }),
      'Data aset rumah tangga berhasil disimpan.'
    );

  const saveVulnerability = () =>
    runSave(
      'vulnerability',
      () =>
        api.put(`/household-data/vulnerabilities/${id}`, {
          is_disaster_victim: Boolean(vulnerability.is_disaster_victim),
          lost_job_recently: Boolean(vulnerability.lost_job_recently),
          has_severe_ill_member: Boolean(vulnerability.has_severe_ill_member),
          has_disabled_member: Boolean(vulnerability.has_disabled_member),
          has_elderly_member: Boolean(vulnerability.has_elderly_member),
          has_pregnant_member: Boolean(vulnerability.has_pregnant_member),
          has_school_children: Boolean(vulnerability.has_school_children),
          ever_received_aid_before: Boolean(vulnerability.ever_received_aid_before),
          special_condition_notes: vulnerability.special_condition_notes || null,
        }),
      'Data kerentanan berhasil disimpan.'
    );

  const uploadDocument = () =>
    runSave(
      'documents',
      async () => {
        if (!uploadFile) {
          throw { response: { data: { message: 'Pilih file dokumen/foto terlebih dahulu.' } } };
        }

        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('household_id', id);
        formData.append('document_type', docType);

        await api.post('/documents', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setUploadFile(null);
        await fetchData();
      },
      'Dokumen/foto berhasil diunggah.'
    );

  const submitSurveyResult = () =>
    runSave(
      'submitSurvey',
      async () => {
        const latestDocs = Object.values(latestDocumentsByType);
        const hasFieldPhoto = latestDocs.some((doc) => ['foto_rumah', 'foto_lapangan'].includes(doc.document_type));

        if (!hasFieldPhoto) {
          throw { response: { data: { message: 'Unggah minimal foto rumah atau foto lapangan sebelum menyelesaikan survei.' } } };
        }

        const summary = buildSurveySummary({
          household,
          economic,
          housing,
          assets,
          vulnerability,
          documents: latestDocs,
        });

        await surveyService.submitFromHousehold(id, {
          summary,
          recommendation: deriveRecommendation(economic, housing, vulnerability),
          matches_submitted_data: true,
        });
      },
      'Hasil survei berhasil dikirim ke admin staff.'
    );

  const handleSubmitAndExit = async () => {
    const success = await submitSurveyResult();
    if (success) {
      navigate('/my-survey-results');
    }
  };

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/surveys')} className="-ml-4">
          Kembali ke Tugas Survei
        </Button>
        <Alert type="error" title="Gagal Memuat Data">{error}</Alert>
      </div>
    );
  }

  const renderTabContent = () => {
    if (activeTab === 'household') {
      return (
        <Card className="space-y-5">
          <Card.Header className="mb-0">
            <Card.Title>Identitas Warga</Card.Title>
          </Card.Header>
          <p className="text-sm text-surface-500">
            Relawan dapat memperbarui data dasar warga bila ditemukan perbedaan saat kunjungan lapangan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nomor KK"
              value={household.nomor_kk}
              onChange={(e) => updateHouseholdField('nomor_kk', e.target.value)}
              inputMode="numeric"
              maxLength={FORM_LIMITS.kkNik}
            />
            <Input
              label="NIK Kepala Keluarga"
              value={household.nik_kepala_keluarga}
              onChange={(e) => updateHouseholdField('nik_kepala_keluarga', e.target.value)}
              inputMode="numeric"
              maxLength={FORM_LIMITS.kkNik}
            />
            <Input
              label="Nama Kepala Keluarga"
              value={household.nama_kepala_keluarga}
              onChange={(e) => updateHouseholdField('nama_kepala_keluarga', e.target.value)}
              maxLength={FORM_LIMITS.name}
            />
            <Input
              label="Nomor Telepon"
              value={household.phone}
              onChange={(e) => updateHouseholdField('phone', e.target.value)}
              inputMode="tel"
              maxLength={FORM_LIMITS.phone}
            />
          </div>

          <Input
            label="Alamat Lengkap"
            value={household.alamat}
            onChange={(e) => updateHouseholdField('alamat', e.target.value)}
            maxLength={SURVEY_LIMITS.address}
          />

          <div className="flex justify-end">
            <Button icon={Save} loading={saving.household} onClick={saveHousehold}>
              Simpan Identitas
            </Button>
          </div>
        </Card>
      );
    }

    if (activeTab === 'economic') {
      return (
        <Card className="space-y-5">
          <Card.Header className="mb-0">
            <Card.Title>Kondisi Ekonomi</Card.Title>
          </Card.Header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              label="Pendapatan Bulanan Total (Rp)"
              value={economic.monthly_income_total}
              onChange={(e) => updateEconomicField('monthly_income_total', e.target.value)}
              inputMode="numeric"
              maxLength={FORM_LIMITS.money}
            />
            <Input
              type="text"
              label="Pengeluaran Pokok Bulanan (Rp)"
              value={economic.monthly_basic_expense}
              onChange={(e) => updateEconomicField('monthly_basic_expense', e.target.value)}
              inputMode="numeric"
              maxLength={FORM_LIMITS.money}
            />
            <Input
              label="Sumber Pendapatan Utama"
              value={economic.income_source}
              onChange={(e) => updateEconomicField('income_source', e.target.value)}
              maxLength={150}
            />
            <Input
              label="Status Pekerjaan Kepala Keluarga"
              value={economic.head_job_status}
              onChange={(e) => updateEconomicField('head_job_status', e.target.value)}
              maxLength={100}
            />
            <Input
              type="text"
              label="Jumlah Tanggungan"
              value={economic.dependents_count}
              onChange={(e) => updateEconomicField('dependents_count', e.target.value)}
              inputMode="numeric"
              maxLength={FORM_LIMITS.count}
            />
            <Input
              type="text"
              label="Estimasi Utang (Rp)"
              value={economic.debt_estimation}
              onChange={(e) => updateEconomicField('debt_estimation', e.target.value)}
              inputMode="numeric"
              maxLength={FORM_LIMITS.money}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
            <input
              type="checkbox"
              checked={economic.has_other_income_source}
              onChange={(e) =>
                setEconomic((prev) => ({ ...prev, has_other_income_source: e.target.checked }))
              }
            />
            Ada sumber pendapatan tambahan
          </label>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Catatan Ekonomi</label>
            <textarea
              rows={3}
              value={economic.notes}
              onChange={(e) => updateEconomicField('notes', e.target.value)}
              maxLength={SURVEY_LIMITS.notes}
              className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm dark:bg-surface-900 dark:border-surface-700 dark:text-white"
            />
            <p className="mt-1 text-right text-xs text-surface-500">{economic.notes.length}/{SURVEY_LIMITS.notes}</p>
          </div>

          <div className="rounded-xl bg-surface-50 dark:bg-surface-900/50 p-4 text-sm text-surface-600 dark:text-surface-300">
            Estimasi ringkas: pendapatan {formatCurrency(toNullableNumber(economic.monthly_income_total))} dan
            pengeluaran {formatCurrency(toNullableNumber(economic.monthly_basic_expense))}.
          </div>

          <div className="flex justify-end">
            <Button icon={Save} loading={saving.economic} onClick={saveEconomic}>
              Simpan Kondisi Ekonomi
            </Button>
          </div>
        </Card>
      );
    }

    if (activeTab === 'housing') {
      return (
        <Card className="space-y-5">
          <Card.Header className="mb-0">
            <Card.Title>Kondisi Tempat Tinggal</Card.Title>
          </Card.Header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Status Kepemilikan Rumah</label>
              <select
                value={housing.home_ownership_status}
                onChange={(e) => setHousing((prev) => ({ ...prev, home_ownership_status: e.target.value }))}
                className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
              >
                <option value="milik_sendiri">Milik Sendiri</option>
                <option value="kontrak">Kontrak / Sewa</option>
                <option value="menumpang">Menumpang</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Kondisi Umum Rumah</label>
              <select
                value={housing.house_condition}
                onChange={(e) => updateHousingField('house_condition', e.target.value)}
                className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
              >
                <option value="">Pilih kondisi rumah</option>
                <option value="layak">Layak</option>
                <option value="semi_layak">Semi Layak</option>
                <option value="tidak_layak">Tidak Layak</option>
              </select>
            </div>
            <Input
              type="text"
              label="Jumlah Kamar Tidur"
              value={housing.bedroom_count}
              onChange={(e) => updateHousingField('bedroom_count', e.target.value)}
              inputMode="numeric"
              maxLength={FORM_LIMITS.count}
            />
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Jenis Lantai</label>
              <select
                value={housing.floor_type_option}
                onChange={(e) =>
                  setHousing((prev) => ({
                    ...prev,
                    floor_type_option: e.target.value,
                    floor_type_other: e.target.value === 'lainnya' ? prev.floor_type_other : '',
                  }))
                }
                className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
              >
                <option value="">Pilih jenis lantai</option>
                {FLOOR_TYPE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Jenis Atap</label>
              <select
                value={housing.roof_type_option}
                onChange={(e) =>
                  setHousing((prev) => ({
                    ...prev,
                    roof_type_option: e.target.value,
                    roof_type_other: e.target.value === 'lainnya' ? prev.roof_type_other : '',
                  }))
                }
                className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
              >
                <option value="">Pilih jenis atap</option>
                {ROOF_TYPE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Jenis Dinding</label>
              <select
                value={housing.wall_type_option}
                onChange={(e) =>
                  setHousing((prev) => ({
                    ...prev,
                    wall_type_option: e.target.value,
                    wall_type_other: e.target.value === 'lainnya' ? prev.wall_type_other : '',
                  }))
                }
                className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
              >
                <option value="">Pilih jenis dinding</option>
                {WALL_TYPE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {housing.floor_type_option === 'lainnya' && (
              <Input
                label="Lainnya (Jenis Lantai)"
                value={housing.floor_type_other}
                onChange={(e) => updateHousingField('floor_type_other', e.target.value)}
                placeholder="Tuliskan jenis lantai"
                maxLength={100}
              />
            )}
            {housing.roof_type_option === 'lainnya' && (
              <Input
                label="Lainnya (Jenis Atap)"
                value={housing.roof_type_other}
                onChange={(e) => updateHousingField('roof_type_other', e.target.value)}
                placeholder="Tuliskan jenis atap"
                maxLength={100}
              />
            )}
            {housing.wall_type_option === 'lainnya' && (
              <Input
                label="Lainnya (Jenis Dinding)"
                value={housing.wall_type_other}
                onChange={(e) => updateHousingField('wall_type_other', e.target.value)}
                placeholder="Tuliskan jenis dinding"
                maxLength={100}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
              <input
                type="checkbox"
                checked={housing.clean_water_access}
                onChange={(e) => setHousing((prev) => ({ ...prev, clean_water_access: e.target.checked }))}
              />
              Akses air bersih tersedia
            </label>
            <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
              <input
                type="checkbox"
                checked={housing.electricity_access}
                onChange={(e) => setHousing((prev) => ({ ...prev, electricity_access: e.target.checked }))}
              />
              Akses listrik tersedia
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Catatan Tempat Tinggal</label>
            <textarea
              rows={3}
              value={housing.notes}
              onChange={(e) => updateHousingField('notes', e.target.value)}
              maxLength={SURVEY_LIMITS.notes}
              className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm dark:bg-surface-900 dark:border-surface-700 dark:text-white"
            />
            <p className="mt-1 text-right text-xs text-surface-500">{housing.notes.length}/{SURVEY_LIMITS.notes}</p>
          </div>

          <div className="flex justify-end">
            <Button icon={Save} loading={saving.housing} onClick={saveHousing}>
              Simpan Kondisi Tempat Tinggal
            </Button>
          </div>
        </Card>
      );
    }

    if (activeTab === 'assets') {
      const assetCheckbox = (field, label) => (
        <label key={field} className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
          <input
            type="checkbox"
            checked={assets[field]}
            onChange={(e) => setAssets((prev) => ({ ...prev, [field]: e.target.checked }))}
          />
          {label}
        </label>
      );

      return (
        <Card className="space-y-5">
          <Card.Header className="mb-0">
            <Card.Title>Aset Rumah Tangga</Card.Title>
          </Card.Header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assetCheckbox('owns_house', 'Memiliki rumah')}
            {assetCheckbox('has_bicycle', 'Memiliki sepeda')}
            {assetCheckbox('has_motorcycle', 'Memiliki motor')}
            {assetCheckbox('has_car', 'Memiliki mobil')}
            {assetCheckbox('has_other_land', 'Memiliki lahan/tanah lain')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Aset Produktif"
              value={assets.productive_assets}
              onChange={(e) => updateAssetsField('productive_assets', e.target.value)}
              maxLength={SURVEY_LIMITS.assetText}
            />
            <Input
              label="Rentang Tabungan"
              value={assets.savings_range}
              onChange={(e) => updateAssetsField('savings_range', e.target.value)}
              placeholder="Contoh: < 500 ribu"
              maxLength={100}
            />
          </div>

          <Input
            label="Aset Lainnya"
            value={assets.other_assets}
            onChange={(e) => updateAssetsField('other_assets', e.target.value)}
            maxLength={SURVEY_LIMITS.notes}
          />

          <div className="flex justify-end">
            <Button icon={Save} loading={saving.assets} onClick={saveAssets}>
              Simpan Data Aset
            </Button>
          </div>
        </Card>
      );
    }

    if (activeTab === 'vulnerability') {
      const vulnerabilityCheckbox = (field, label) => (
        <label key={field} className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
          <input
            type="checkbox"
            checked={vulnerability[field]}
            onChange={(e) => setVulnerability((prev) => ({ ...prev, [field]: e.target.checked }))}
          />
          {label}
        </label>
      );

      return (
        <Card className="space-y-5">
          <Card.Header className="mb-0">
            <Card.Title>Kerentanan Rumah Tangga</Card.Title>
          </Card.Header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vulnerabilityCheckbox('is_disaster_victim', 'Korban bencana')}
            {vulnerabilityCheckbox('lost_job_recently', 'Kehilangan pekerjaan baru-baru ini')}
            {vulnerabilityCheckbox('has_severe_ill_member', 'Ada anggota dengan sakit berat')}
            {vulnerabilityCheckbox('has_disabled_member', 'Ada anggota disabilitas')}
            {vulnerabilityCheckbox('has_elderly_member', 'Ada anggota lansia')}
            {vulnerabilityCheckbox('has_pregnant_member', 'Ada ibu hamil')}
            {vulnerabilityCheckbox('has_school_children', 'Ada anak usia sekolah')}
            {vulnerabilityCheckbox('ever_received_aid_before', 'Pernah menerima bantuan sebelumnya')}
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Catatan Kondisi Khusus</label>
            <textarea
              rows={3}
              value={vulnerability.special_condition_notes}
              onChange={(e) => updateVulnerabilityField('special_condition_notes', e.target.value)}
              maxLength={SURVEY_LIMITS.notes}
              className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm dark:bg-surface-900 dark:border-surface-700 dark:text-white"
            />
            <p className="mt-1 text-right text-xs text-surface-500">
              {vulnerability.special_condition_notes.length}/{SURVEY_LIMITS.notes}
            </p>
          </div>

          <div className="flex justify-end">
            <Button icon={Save} loading={saving.vulnerability} onClick={saveVulnerability}>
              Simpan Data Kerentanan
            </Button>
          </div>
        </Card>
      );
    }

    return (
      <Card className="space-y-5">
        <Card.Header className="mb-0">
          <Card.Title>Dokumen & Foto Lapangan</Card.Title>
        </Card.Header>
        <p className="text-sm text-surface-500">
          Untuk mengganti foto rumah/dokumen lain, cukup unggah file baru dengan tipe dokumen yang sama.
          Riwayat dokumen lama tetap tersimpan sebagai jejak audit.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)_auto] gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Jenis Dokumen</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
            >
              {Object.entries(DOCUMENT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">File Dokumen</label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="block w-full rounded-lg border border-surface-300 px-3 py-2 text-sm dark:bg-surface-900 dark:border-surface-700 dark:text-white"
            />
          </div>

          <Button icon={Save} loading={saving.documents} onClick={uploadDocument}>
            Unggah
          </Button>
        </div>

        {uploadFile && (
          <Alert type="info" title="File dipilih">
            {uploadFile.name} ({Math.round(uploadFile.size / 1024)} KB)
          </Alert>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-200">Versi Dokumen Terbaru per Jenis</h3>
          {Object.keys(latestDocumentsByType).length === 0 ? (
            <p className="text-sm text-surface-500">Belum ada dokumen diunggah untuk rumah tangga ini.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.values(latestDocumentsByType).map((doc) => (
                <div key={doc.id} className="rounded-xl border border-surface-200 dark:border-surface-700 p-3">
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    {formatDocType(doc.document_type)}
                  </p>
                  <p className="text-xs text-surface-500 mt-1">{doc.original_filename || '-'}</p>
                  <p className="text-xs text-surface-500 mt-1">
                    Unggah: {formatDateTime(doc.uploaded_at)}
                  </p>
                  <p className="text-xs text-surface-500 mt-1">
                    Status: {doc.verifications?.[0]?.status || 'pending'}
                  </p>
                  {doc.file_url && (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-2 text-xs text-primary-600 hover:underline"
                    >
                      Buka File
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">
      <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/surveys')} className="-ml-4">
        Kembali ke Tugas Survei
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Form Input & Edit Data Lapangan</h1>
        <p className="text-sm text-surface-500 mt-1">
          Relawan mengisi seluruh data kelayakan berdasarkan hasil kunjungan lapangan, lalu memperbarui dokumen bila ada perubahan.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                isActive
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-surface-500'}`} />
                <span className={`text-xs font-semibold ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-surface-600 dark:text-surface-300'}`}>
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {renderTabContent()}

      <Alert type="warning" title="Catatan Integritas Data">
        Pastikan data lapangan yang diinput benar sesuai kondisi nyata. Semua perubahan tersimpan dalam jejak audit sistem.
      </Alert>

      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/surveys')}>
          Kembali ke Daftar Tugas
        </Button>
        <Button icon={CheckCircle2} loading={saving.submitSurvey} onClick={handleSubmitAndExit}>
          Selesai & Kirim Hasil Survei
        </Button>
      </div>
    </div>
  );
};

export default SurveyAction;
