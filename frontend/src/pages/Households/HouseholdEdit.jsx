import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit3,
  Users,
  Home,
  DollarSign,
  ShieldAlert,
  Package,
  User,
  X,
  Check,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import householdService from '../../services/householdService';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FORM_LIMITS, clampText, digitsOnly, phoneOnly } from '../../utils/formLimits';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const TABS = [
  { key: 'profile', label: 'Profil KK', icon: User },
  { key: 'members', label: 'Anggota Keluarga', icon: Users },
  { key: 'economic', label: 'Ekonomi', icon: DollarSign },
  { key: 'housing', label: 'Tempat Tinggal', icon: Home },
  { key: 'assets', label: 'Aset', icon: Package },
  { key: 'vulnerability', label: 'Kerentanan', icon: ShieldAlert },
];

const RELATIONSHIP_OPTIONS = [
  { value: 'istri', label: 'Istri' },
  { value: 'suami', label: 'Suami' },
  { value: 'anak', label: 'Anak' },
  { value: 'orang_tua', label: 'Orang Tua' },
  { value: 'mertua', label: 'Mertua' },
  { value: 'saudara', label: 'Saudara' },
  { value: 'lainnya', label: 'Lainnya' },
];

const FLOOR_TYPES = ['keramik', 'semen', 'tanah', 'kayu', 'vinyl', 'marmer', 'lainnya'];
const ROOF_TYPES = ['genteng', 'seng', 'asbes', 'beton', 'rumbia', 'lainnya'];
const WALL_TYPES = ['tembok', 'bata', 'kayu', 'bambu', 'triplek', 'lainnya'];

const toNullableNumber = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const toNullableInt = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = parseInt(v, 10);
  return Number.isInteger(n) ? n : null;
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <h3 className="text-sm font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider border-b border-surface-200 dark:border-surface-700 pb-2 mb-4">
    {children}
  </h3>
);

const CheckboxField = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <div
      className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors border-2 ${
        checked
          ? 'bg-primary-500 border-primary-500'
          : 'border-surface-300 dark:border-surface-600 group-hover:border-primary-400'
      }`}
      onClick={onChange}
    >
      {checked && <Check className="w-3 h-3 text-white" />}
    </div>
    <span className="text-sm text-surface-700 dark:text-surface-300">{label}</span>
  </label>
);

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const HouseholdEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [error, setError] = useState('');

  // Form states
  const [profile, setProfile] = useState({
    nomor_kk: '',
    nama_kepala_keluarga: '',
    nik_kepala_keluarga: '',
    alamat: '',
    phone: '',
  });

  const [members, setMembers] = useState([]);
  const [editingMember, setEditingMember] = useState(null); // { id?, isNew, data }
  const [memberForm, setMemberForm] = useState({
    nik: '', name: '', relationship_to_head: 'anak', birth_date: '', gender: 'laki_laki',
    occupation: '', education_level: '',
  });

  const [economic, setEconomic] = useState({
    monthly_income_total: '', income_source: '', head_job_status: '',
    monthly_basic_expense: '', dependents_count: '',
    has_other_income_source: false, debt_estimation: '', notes: '',
  });

  const [housing, setHousing] = useState({
    home_ownership_status: 'milik_sendiri', house_condition: '',
    floor_type: '', roof_type: '', wall_type: '',
    clean_water_access: false, electricity_access: false,
    bedroom_count: '', notes: '',
  });

  const [assets, setAssets] = useState({
    owns_house: false, has_bicycle: false, has_motorcycle: false,
    has_car: false, has_other_land: false,
    productive_assets: '', savings_range: '', other_assets: '',
  });

  const [vulnerability, setVulnerability] = useState({
    is_disaster_victim: false, lost_job_recently: false,
    has_severe_ill_member: false, has_disabled_member: false,
    has_elderly_member: false, has_pregnant_member: false,
    has_school_children: false, ever_received_aid_before: false,
    special_condition_notes: '',
  });

  // ─── Fetch ─────────────────────────────────
  const fetchHousehold = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await householdService.getById(id);
      const h = res.data.data;

      setProfile({
        nomor_kk: h.nomor_kk || '',
        nama_kepala_keluarga: h.nama_kepala_keluarga || '',
        nik_kepala_keluarga: h.nik_kepala_keluarga || '',
        alamat: h.alamat || '',
        phone: h.phone || '',
      });

      setMembers(h.familyMembers || []);

      const ec = h.economicCondition || {};
      setEconomic({
        monthly_income_total: ec.monthly_income_total ?? '',
        income_source: ec.income_source || '',
        head_job_status: ec.head_job_status || '',
        monthly_basic_expense: ec.monthly_basic_expense ?? '',
        dependents_count: ec.dependents_count ?? '',
        has_other_income_source: Boolean(ec.has_other_income_source),
        debt_estimation: ec.debt_estimation ?? '',
        notes: ec.notes || '',
      });

      const hc = h.housingCondition || {};
      setHousing({
        home_ownership_status: hc.home_ownership_status || 'milik_sendiri',
        house_condition: hc.house_condition || '',
        floor_type: hc.floor_type || '',
        roof_type: hc.roof_type || '',
        wall_type: hc.wall_type || '',
        clean_water_access: Boolean(hc.clean_water_access),
        electricity_access: Boolean(hc.electricity_access),
        bedroom_count: hc.bedroom_count ?? '',
        notes: hc.notes || '',
      });

      const ha = h.householdAsset || {};
      setAssets({
        owns_house: Boolean(ha.owns_house),
        has_bicycle: Boolean(ha.has_bicycle),
        has_motorcycle: Boolean(ha.has_motorcycle),
        has_car: Boolean(ha.has_car),
        has_other_land: Boolean(ha.has_other_land),
        productive_assets: ha.productive_assets || '',
        savings_range: ha.savings_range || '',
        other_assets: ha.other_assets || '',
      });

      const vul = h.vulnerability || {};
      setVulnerability({
        is_disaster_victim: Boolean(vul.is_disaster_victim),
        lost_job_recently: Boolean(vul.lost_job_recently),
        has_severe_ill_member: Boolean(vul.has_severe_ill_member),
        has_disabled_member: Boolean(vul.has_disabled_member),
        has_elderly_member: Boolean(vul.has_elderly_member),
        has_pregnant_member: Boolean(vul.has_pregnant_member),
        has_school_children: Boolean(vul.has_school_children),
        ever_received_aid_before: Boolean(vul.ever_received_aid_before),
        special_condition_notes: vul.special_condition_notes || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data rumah tangga.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHousehold();
  }, [fetchHousehold]);

  // ─── Save helpers ──────────────────────────
  const runSave = async (key, fn, msg) => {
    try {
      setSaving((p) => ({ ...p, [key]: true }));
      await fn();
      toast.success(msg);
      return true;
    } catch (err) {
      const firstErr = err.response?.data?.errors?.[0];
      const message = firstErr
        ? `Validasi ${firstErr.field}: ${firstErr.message}`
        : err.response?.data?.message || 'Terjadi kesalahan.';
      toast.error(message);
      return false;
    } finally {
      setSaving((p) => ({ ...p, [key]: false }));
    }
  };

  const saveProfile = () =>
    runSave('profile', () => householdService.update(id, {
      nomor_kk: profile.nomor_kk,
      nama_kepala_keluarga: profile.nama_kepala_keluarga,
      nik_kepala_keluarga: profile.nik_kepala_keluarga || null,
      alamat: profile.alamat,
      phone: profile.phone || null,
    }), 'Profil KK berhasil diperbarui.');

  const saveEconomic = () =>
    runSave('economic', () => api.put(`/household-data/economic-conditions/${id}`, {
      monthly_income_total: toNullableNumber(economic.monthly_income_total),
      income_source: economic.income_source || null,
      head_job_status: economic.head_job_status || null,
      monthly_basic_expense: toNullableNumber(economic.monthly_basic_expense),
      dependents_count: toNullableInt(economic.dependents_count),
      has_other_income_source: Boolean(economic.has_other_income_source),
      debt_estimation: toNullableNumber(economic.debt_estimation),
      notes: economic.notes || null,
    }), 'Data ekonomi berhasil disimpan.');

  const saveHousing = () =>
    runSave('housing', () => api.put(`/household-data/housing-conditions/${id}`, {
      home_ownership_status: housing.home_ownership_status || null,
      house_condition: housing.house_condition || null,
      floor_type: housing.floor_type || null,
      roof_type: housing.roof_type || null,
      wall_type: housing.wall_type || null,
      clean_water_access: Boolean(housing.clean_water_access),
      electricity_access: Boolean(housing.electricity_access),
      sanitation_type: null,
      bedroom_count: toNullableInt(housing.bedroom_count),
      notes: housing.notes || null,
    }), 'Data tempat tinggal berhasil disimpan.');

  const saveAssets = () =>
    runSave('assets', () => api.put(`/household-data/assets/${id}`, {
      owns_house: Boolean(assets.owns_house),
      has_bicycle: Boolean(assets.has_bicycle),
      has_motorcycle: Boolean(assets.has_motorcycle),
      has_car: Boolean(assets.has_car),
      has_other_land: Boolean(assets.has_other_land),
      productive_assets: assets.productive_assets || null,
      savings_range: assets.savings_range || null,
      other_assets: assets.other_assets || null,
    }), 'Data aset berhasil disimpan.');

  const saveVulnerability = () =>
    runSave('vulnerability', () => api.put(`/household-data/vulnerabilities/${id}`, {
      is_disaster_victim: Boolean(vulnerability.is_disaster_victim),
      lost_job_recently: Boolean(vulnerability.lost_job_recently),
      has_severe_ill_member: Boolean(vulnerability.has_severe_ill_member),
      has_disabled_member: Boolean(vulnerability.has_disabled_member),
      has_elderly_member: Boolean(vulnerability.has_elderly_member),
      has_pregnant_member: Boolean(vulnerability.has_pregnant_member),
      has_school_children: Boolean(vulnerability.has_school_children),
      ever_received_aid_before: Boolean(vulnerability.ever_received_aid_before),
      special_condition_notes: vulnerability.special_condition_notes || null,
    }), 'Data kerentanan berhasil disimpan.');

  // ─── Member CRUD ───────────────────────────
  const openAddMember = () => {
    setMemberForm({ nik: '', name: '', relationship_to_head: 'anak', birth_date: '', gender: 'laki_laki', occupation: '', education_level: '' });
    setEditingMember({ isNew: true });
  };

  const openEditMember = (member) => {
    setMemberForm({
      nik: member.nik || '',
      name: member.name || '',
      relationship_to_head: member.relationship_to_head || 'anak',
      birth_date: member.birth_date ? member.birth_date.substring(0, 10) : '',
      gender: member.gender || 'laki_laki',
      occupation: member.occupation || '',
      education_level: member.education_level || '',
    });
    setEditingMember({ isNew: false, id: member.id });
  };

  const cancelEditMember = () => setEditingMember(null);

  const saveMember = async () => {
    if (!memberForm.name.trim()) {
      toast.error('Nama anggota keluarga wajib diisi.');
      return;
    }
    const payload = {
      name: memberForm.name,
      nik: memberForm.nik || null,
      relationship_to_head: memberForm.relationship_to_head,
      birth_date: memberForm.birth_date || null,
      gender: memberForm.gender || null,
      occupation: memberForm.occupation || null,
      education_level: memberForm.education_level || null,
    };

    const success = await runSave('member', async () => {
      if (editingMember.isNew) {
        await api.post(`/households/${id}/members`, { members: [payload] });
      } else {
        await api.put(`/households/${id}/members/${editingMember.id}`, payload);
      }
      await fetchHousehold();
    }, editingMember.isNew ? 'Anggota keluarga berhasil ditambahkan.' : 'Anggota keluarga berhasil diperbarui.');

    if (success) setEditingMember(null);
  };

  const deleteMember = async (memberId, memberName) => {
    if (!window.confirm(`Hapus anggota "${memberName}" dari keluarga ini?`)) return;
    await runSave(`del_${memberId}`, async () => {
      await api.delete(`/households/${id}/members/${memberId}`);
      setMembers((prev) => prev.filter((m) => m.id.toString() !== memberId.toString()));
    }, 'Anggota keluarga berhasil dihapus.');
  };

  // ─── Render ────────────────────────────────
  if (loading) return <PageLoader />;
  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/households')} className="-ml-4">
          Kembali
        </Button>
        <Alert type="error" title="Gagal Memuat Data">{error}</Alert>
      </div>
    );
  }

  const renderTabContent = () => {
    // ── Tab: Profil KK ──────────────────────
    if (activeTab === 'profile') {
      return (
        <Card className="space-y-5">
          <Card.Header className="mb-0">
            <Card.Title>Edit Profil Kepala Keluarga</Card.Title>
          </Card.Header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nomor KK"
              value={profile.nomor_kk}
              onChange={(e) => setProfile((p) => ({ ...p, nomor_kk: digitsOnly(e.target.value, FORM_LIMITS.kkNik) }))}
              inputMode="numeric"
              maxLength={FORM_LIMITS.kkNik}
            />
            <Input
              label="NIK Kepala Keluarga"
              value={profile.nik_kepala_keluarga}
              onChange={(e) => setProfile((p) => ({ ...p, nik_kepala_keluarga: digitsOnly(e.target.value, FORM_LIMITS.kkNik) }))}
              inputMode="numeric"
              maxLength={FORM_LIMITS.kkNik}
            />
            <Input
              label="Nama Lengkap Kepala Keluarga"
              value={profile.nama_kepala_keluarga}
              onChange={(e) => setProfile((p) => ({ ...p, nama_kepala_keluarga: clampText(e.target.value, FORM_LIMITS.name) }))}
              maxLength={FORM_LIMITS.name}
            />
            <Input
              label="Nomor Telepon"
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: phoneOnly(e.target.value, FORM_LIMITS.phone) }))}
              inputMode="tel"
              maxLength={FORM_LIMITS.phone}
            />
          </div>

          <Input
            label="Alamat Lengkap"
            value={profile.alamat}
            onChange={(e) => setProfile((p) => ({ ...p, alamat: clampText(e.target.value, 500) }))}
            maxLength={500}
          />

          <div className="flex justify-end">
            <Button icon={Save} loading={saving.profile} onClick={saveProfile}>
              Simpan Profil
            </Button>
          </div>
        </Card>
      );
    }

    // ── Tab: Anggota Keluarga ───────────────
    if (activeTab === 'members') {
      return (
        <div className="space-y-4">
          {/* Member form (add/edit) */}
          {editingMember && (
            <Card className="border-2 border-primary-300 dark:border-primary-700 space-y-4">
              <Card.Header className="mb-0">
                <Card.Title>{editingMember.isNew ? 'Tambah Anggota Baru' : 'Edit Anggota Keluarga'}</Card.Title>
              </Card.Header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  label="Nama Lengkap *"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm((p) => ({ ...p, name: clampText(e.target.value, FORM_LIMITS.name) }))}
                  maxLength={FORM_LIMITS.name}
                  placeholder="Nama sesuai KTP"
                />
                <Input
                  label="NIK"
                  value={memberForm.nik}
                  onChange={(e) => setMemberForm((p) => ({ ...p, nik: digitsOnly(e.target.value, FORM_LIMITS.kkNik) }))}
                  inputMode="numeric"
                  maxLength={FORM_LIMITS.kkNik}
                />
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Hubungan dengan Kepala Keluarga
                  </label>
                  <select
                    value={memberForm.relationship_to_head}
                    onChange={(e) => setMemberForm((p) => ({ ...p, relationship_to_head: e.target.value }))}
                    className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
                  >
                    {RELATIONSHIP_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Tanggal Lahir"
                  type="date"
                  value={memberForm.birth_date}
                  onChange={(e) => setMemberForm((p) => ({ ...p, birth_date: e.target.value }))}
                />
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={memberForm.gender}
                    onChange={(e) => setMemberForm((p) => ({ ...p, gender: e.target.value }))}
                    className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
                  >
                    <option value="laki_laki">Laki-laki</option>
                    <option value="perempuan">Perempuan</option>
                  </select>
                </div>
                <Input
                  label="Pekerjaan"
                  value={memberForm.occupation}
                  onChange={(e) => setMemberForm((p) => ({ ...p, occupation: clampText(e.target.value, 100) }))}
                  maxLength={100}
                />
                <Input
                  label="Pendidikan Terakhir"
                  value={memberForm.education_level}
                  onChange={(e) => setMemberForm((p) => ({ ...p, education_level: clampText(e.target.value, 100) }))}
                  maxLength={100}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" icon={X} onClick={cancelEditMember}>
                  Batal
                </Button>
                <Button icon={Save} loading={saving.member} onClick={saveMember}>
                  {editingMember.isNew ? 'Tambah Anggota' : 'Simpan Perubahan'}
                </Button>
              </div>
            </Card>
          )}

          {/* Member list */}
          <Card>
            <Card.Header>
              <Card.Title>Daftar Anggota Keluarga ({members.length} orang)</Card.Title>
              {!editingMember && (
                <Button size="sm" icon={Plus} onClick={openAddMember} variant="outline">
                  Tambah Anggota
                </Button>
              )}
            </Card.Header>

            {members.length === 0 ? (
              <div className="text-center py-10 text-surface-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Belum ada anggota keluarga yang tercatat.</p>
                <Button icon={Plus} variant="outline" size="sm" className="mt-4" onClick={openAddMember}>
                  Tambahkan Anggota Pertama
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-surface-900 dark:text-white truncate">{member.name}</p>
                        <p className="text-sm text-surface-500">
                          {member.relationship_to_head}
                          {member.gender ? ` • ${member.gender === 'laki_laki' ? 'Laki-laki' : 'Perempuan'}` : ''}
                          {member.occupation ? ` • ${member.occupation}` : ''}
                        </p>
                        {member.nik && (
                          <p className="text-xs text-surface-400 mt-0.5">NIK: {member.nik}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="xs"
                        variant="ghost"
                        icon={Edit3}
                        onClick={() => openEditMember(member)}
                        disabled={Boolean(editingMember)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        icon={Trash2}
                        onClick={() => deleteMember(member.id, member.name)}
                        loading={saving[`del_${member.id}`]}
                        disabled={Boolean(editingMember)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      );
    }

    // ── Tab: Ekonomi ────────────────────────
    if (activeTab === 'economic') {
      return (
        <Card className="space-y-5">
          <Card.Header className="mb-0">
            <Card.Title>Kondisi Ekonomi</Card.Title>
          </Card.Header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Pendapatan Bulanan Total (Rp)"
              value={economic.monthly_income_total}
              onChange={(e) => setEconomic((p) => ({ ...p, monthly_income_total: digitsOnly(e.target.value, FORM_LIMITS.money) }))}
              inputMode="numeric"
              maxLength={FORM_LIMITS.money}
            />
            <Input
              label="Pengeluaran Pokok Bulanan (Rp)"
              value={economic.monthly_basic_expense}
              onChange={(e) => setEconomic((p) => ({ ...p, monthly_basic_expense: digitsOnly(e.target.value, FORM_LIMITS.money) }))}
              inputMode="numeric"
              maxLength={FORM_LIMITS.money}
            />
            <Input
              label="Sumber Pendapatan Utama"
              value={economic.income_source}
              onChange={(e) => setEconomic((p) => ({ ...p, income_source: clampText(e.target.value, 150) }))}
              maxLength={150}
            />
            <Input
              label="Status Pekerjaan Kepala Keluarga"
              value={economic.head_job_status}
              onChange={(e) => setEconomic((p) => ({ ...p, head_job_status: clampText(e.target.value, 100) }))}
              maxLength={100}
            />
            <Input
              label="Jumlah Tanggungan"
              value={economic.dependents_count}
              onChange={(e) => setEconomic((p) => ({ ...p, dependents_count: digitsOnly(e.target.value, FORM_LIMITS.count) }))}
              inputMode="numeric"
              maxLength={FORM_LIMITS.count}
            />
            <Input
              label="Estimasi Utang (Rp)"
              value={economic.debt_estimation}
              onChange={(e) => setEconomic((p) => ({ ...p, debt_estimation: digitsOnly(e.target.value, FORM_LIMITS.money) }))}
              inputMode="numeric"
              maxLength={FORM_LIMITS.money}
            />
          </div>

          <CheckboxField
            label="Ada sumber pendapatan tambahan"
            checked={economic.has_other_income_source}
            onChange={() => setEconomic((p) => ({ ...p, has_other_income_source: !p.has_other_income_source }))}
          />

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Catatan Ekonomi</label>
            <textarea
              rows={3}
              value={economic.notes}
              onChange={(e) => setEconomic((p) => ({ ...p, notes: clampText(e.target.value, 1000) }))}
              maxLength={1000}
              className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm dark:bg-surface-900 dark:border-surface-700 dark:text-white"
            />
          </div>

          <div className="flex justify-end">
            <Button icon={Save} loading={saving.economic} onClick={saveEconomic}>
              Simpan Data Ekonomi
            </Button>
          </div>
        </Card>
      );
    }

    // ── Tab: Tempat Tinggal ─────────────────
    if (activeTab === 'housing') {
      return (
        <Card className="space-y-5">
          <Card.Header className="mb-0">
            <Card.Title>Kondisi Tempat Tinggal</Card.Title>
          </Card.Header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Status Kepemilikan</label>
              <select
                value={housing.home_ownership_status}
                onChange={(e) => setHousing((p) => ({ ...p, home_ownership_status: e.target.value }))}
                className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
              >
                <option value="milik_sendiri">Milik Sendiri</option>
                <option value="kontrak">Kontrak / Sewa</option>
                <option value="menumpang">Menumpang</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Kondisi Rumah</label>
              <select
                value={housing.house_condition}
                onChange={(e) => setHousing((p) => ({ ...p, house_condition: e.target.value }))}
                className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
              >
                <option value="">Pilih kondisi</option>
                <option value="layak">Layak</option>
                <option value="semi_layak">Semi Layak</option>
                <option value="tidak_layak">Tidak Layak</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Jenis Lantai</label>
              <select
                value={housing.floor_type}
                onChange={(e) => setHousing((p) => ({ ...p, floor_type: e.target.value }))}
                className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
              >
                <option value="">Pilih jenis lantai</option>
                {FLOOR_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Jenis Atap</label>
              <select
                value={housing.roof_type}
                onChange={(e) => setHousing((p) => ({ ...p, roof_type: e.target.value }))}
                className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
              >
                <option value="">Pilih jenis atap</option>
                {ROOF_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Jenis Dinding</label>
              <select
                value={housing.wall_type}
                onChange={(e) => setHousing((p) => ({ ...p, wall_type: e.target.value }))}
                className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
              >
                <option value="">Pilih jenis dinding</option>
                {WALL_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <Input
              label="Jumlah Kamar Tidur"
              value={housing.bedroom_count}
              onChange={(e) => setHousing((p) => ({ ...p, bedroom_count: digitsOnly(e.target.value, FORM_LIMITS.count) }))}
              inputMode="numeric"
              maxLength={FORM_LIMITS.count}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CheckboxField
              label="Akses Air Bersih"
              checked={housing.clean_water_access}
              onChange={() => setHousing((p) => ({ ...p, clean_water_access: !p.clean_water_access }))}
            />
            <CheckboxField
              label="Akses Listrik"
              checked={housing.electricity_access}
              onChange={() => setHousing((p) => ({ ...p, electricity_access: !p.electricity_access }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Catatan</label>
            <textarea
              rows={3}
              value={housing.notes}
              onChange={(e) => setHousing((p) => ({ ...p, notes: clampText(e.target.value, 1000) }))}
              maxLength={1000}
              className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm dark:bg-surface-900 dark:border-surface-700 dark:text-white"
            />
          </div>

          <div className="flex justify-end">
            <Button icon={Save} loading={saving.housing} onClick={saveHousing}>
              Simpan Data Tempat Tinggal
            </Button>
          </div>
        </Card>
      );
    }

    // ── Tab: Aset ───────────────────────────
    if (activeTab === 'assets') {
      return (
        <Card className="space-y-5">
          <Card.Header className="mb-0">
            <Card.Title>Kepemilikan Aset</Card.Title>
          </Card.Header>

          <div>
            <SectionLabel>Kepemilikan (centang jika memiliki)</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'owns_house', label: 'Memiliki Rumah Sendiri' },
                { key: 'has_bicycle', label: 'Memiliki Sepeda' },
                { key: 'has_motorcycle', label: 'Memiliki Motor' },
                { key: 'has_car', label: 'Memiliki Mobil' },
                { key: 'has_other_land', label: 'Memiliki Tanah / Lahan Lain' },
              ].map(({ key, label }) => (
                <CheckboxField
                  key={key}
                  label={label}
                  checked={assets[key]}
                  onChange={() => setAssets((p) => ({ ...p, [key]: !p[key] }))}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Kisaran Tabungan</label>
              <select
                value={assets.savings_range}
                onChange={(e) => setAssets((p) => ({ ...p, savings_range: e.target.value }))}
                className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
              >
                <option value="">Pilih kisaran</option>
                <option value="kurang_dari_1jt">Kurang dari Rp 1 Juta</option>
                <option value="1jt_5jt">Rp 1 - 5 Juta</option>
                <option value="5jt_20jt">Rp 5 - 20 Juta</option>
                <option value="lebih_dari_20jt">Lebih dari Rp 20 Juta</option>
              </select>
            </div>
            <Input
              label="Aset Produktif (deskripsi)"
              value={assets.productive_assets}
              onChange={(e) => setAssets((p) => ({ ...p, productive_assets: clampText(e.target.value, 500) }))}
              maxLength={500}
              placeholder="Misal: Sapi 2 ekor, kebun dll"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Aset Lainnya</label>
            <textarea
              rows={3}
              value={assets.other_assets}
              onChange={(e) => setAssets((p) => ({ ...p, other_assets: clampText(e.target.value, 1000) }))}
              maxLength={1000}
              className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm dark:bg-surface-900 dark:border-surface-700 dark:text-white"
              placeholder="Deskripsikan aset lain yang dimiliki..."
            />
          </div>

          <div className="flex justify-end">
            <Button icon={Save} loading={saving.assets} onClick={saveAssets}>
              Simpan Data Aset
            </Button>
          </div>
        </Card>
      );
    }

    // ── Tab: Kerentanan ─────────────────────
    if (activeTab === 'vulnerability') {
      return (
        <Card className="space-y-5">
          <Card.Header className="mb-0">
            <Card.Title>Kerentanan Keluarga</Card.Title>
          </Card.Header>

          <div>
            <SectionLabel>Kondisi Kerentanan (centang jika berlaku)</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'is_disaster_victim', label: 'Korban Bencana Alam' },
                { key: 'lost_job_recently', label: 'Baru-baru ini Kehilangan Pekerjaan (PHK)' },
                { key: 'has_severe_ill_member', label: 'Ada Anggota dengan Penyakit Berat' },
                { key: 'has_disabled_member', label: 'Ada Anggota Penyandang Disabilitas' },
                { key: 'has_elderly_member', label: 'Ada Anggota Lansia (≥ 60 tahun)' },
                { key: 'has_pregnant_member', label: 'Ada Anggota yang Sedang Hamil' },
                { key: 'has_school_children', label: 'Ada Anak Usia Sekolah' },
                { key: 'ever_received_aid_before', label: 'Pernah Menerima Bantuan Sosial Sebelumnya' },
              ].map(({ key, label }) => (
                <CheckboxField
                  key={key}
                  label={label}
                  checked={vulnerability[key]}
                  onChange={() => setVulnerability((p) => ({ ...p, [key]: !p[key] }))}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Catatan Kondisi Khusus</label>
            <textarea
              rows={4}
              value={vulnerability.special_condition_notes}
              onChange={(e) => setVulnerability((p) => ({ ...p, special_condition_notes: clampText(e.target.value, 1000) }))}
              maxLength={1000}
              className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm dark:bg-surface-900 dark:border-surface-700 dark:text-white"
              placeholder="Tuliskan kondisi khusus lainnya yang perlu diketahui..."
            />
          </div>

          <div className="flex justify-end">
            <Button icon={Save} loading={saving.vulnerability} onClick={saveVulnerability}>
              Simpan Data Kerentanan
            </Button>
          </div>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/households')} className="-ml-4 mb-2">
            Kembali ke Data Rumah Tangga
          </Button>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Edit Data Keluarga
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            Update profil, anggota keluarga, dan data sosial-ekonomi rumah tangga.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/households/${id}`)}
        >
          Lihat Detail
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-surface-100 dark:bg-surface-800 p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => { setActiveTab(key); setEditingMember(null); }}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors flex-shrink-0 ${
              activeTab === key
                ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default HouseholdEdit;
