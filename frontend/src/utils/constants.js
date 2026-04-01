/**
 * Application-wide constants and enum mappings.
 */

export const ROLES = {
  admin: { label: 'Administrator', color: 'badge-danger' },
  petugas: { label: 'Petugas', color: 'badge-info' },
  relawan: { label: 'Relawan', color: 'badge-success' },
  warga: { label: 'Warga', color: 'badge-neutral' },
  donatur: { label: 'Donatur', color: 'badge-warning' },
};

export const HOUSEHOLD_STATUS = {
  draft: { label: 'Draft', color: 'badge-neutral' },
  submitted: { label: 'Diajukan', color: 'badge-info' },
  under_review: { label: 'Dalam Review', color: 'badge-warning' },
  verified: { label: 'Terverifikasi', color: 'badge-success' },
  rejected: { label: 'Ditolak', color: 'badge-danger' },
};

export const APPLICATION_STATUS = {
  draft: { label: 'Draft', color: 'badge-neutral' },
  submitted: { label: 'Diajukan', color: 'badge-info' },
  initial_validation: { label: 'Validasi Awal', color: 'badge-info' },
  document_verification: { label: 'Verifikasi Dokumen', color: 'badge-warning' },
  field_survey: { label: 'Survei Lapangan', color: 'badge-warning' },
  scoring: { label: 'Scoring', color: 'badge-warning' },
  admin_review: { label: 'Review Admin', color: 'badge-info' },
  approved: { label: 'Disetujui', color: 'badge-success' },
  rejected: { label: 'Ditolak', color: 'badge-danger' },
  cancelled: { label: 'Dibatalkan', color: 'badge-neutral' },
};

export const SURVEY_STATUS = {
  draft: { label: 'Draft', color: 'badge-neutral' },
  submitted: { label: 'Diajukan', color: 'badge-info' },
  reviewed: { label: 'Direview', color: 'badge-success' },
};

export const SURVEY_RECOMMENDATION = {
  recommended: { label: 'Direkomendasikan', color: 'badge-success' },
  not_recommended: { label: 'Tidak Direkomendasikan', color: 'badge-danger' },
  need_follow_up: { label: 'Perlu Tindak Lanjut', color: 'badge-warning' },
};

export const PRIORITY_LEVEL = {
  sangat_layak: { label: 'Sangat Layak', color: 'badge-success' },
  layak: { label: 'Layak', color: 'badge-info' },
  verifikasi_tambahan: { label: 'Verifikasi Tambahan', color: 'badge-warning' },
  tidak_prioritas: { label: 'Tidak Prioritas', color: 'badge-danger' },
};

export const DECISION_STATUS = {
  approved: { label: 'Disetujui', color: 'badge-success' },
  rejected: { label: 'Ditolak', color: 'badge-danger' },
  waitlisted: { label: 'Daftar Tunggu', color: 'badge-warning' },
};

export const DISTRIBUTION_STATUS = {
  received: { label: 'Diterima', color: 'badge-neutral' },
  recorded: { label: 'Tercatat', color: 'badge-neutral' },
  allocated: { label: 'Dialokasikan', color: 'badge-info' },
  sent: { label: 'Dikirim', color: 'badge-warning' },
  delivered: { label: 'Terkirim', color: 'badge-info' },
  completed: { label: 'Selesai', color: 'badge-success' },
  failed: { label: 'Gagal', color: 'badge-danger' },
};

export const COMPLAINT_STATUS = {
  open: { label: 'Terbuka', color: 'badge-warning' },
  in_review: { label: 'Dalam Review', color: 'badge-info' },
  resolved: { label: 'Selesai', color: 'badge-success' },
  rejected: { label: 'Ditolak', color: 'badge-danger' },
};

export const COMPLAINT_TYPE = {
  data_error: { label: 'Kesalahan Data' },
  aid_not_received: { label: 'Bantuan Tidak Diterima' },
  distribution_error: { label: 'Kesalahan Distribusi' },
  other: { label: 'Lainnya' },
};

export const AUDIT_ACTIONS = {
  create: { label: 'Buat', color: 'badge-success' },
  update: { label: 'Ubah', color: 'badge-info' },
  delete: { label: 'Hapus', color: 'badge-danger' },
  verify: { label: 'Verifikasi', color: 'badge-warning' },
  approve: { label: 'Setujui', color: 'badge-success' },
  reject: { label: 'Tolak', color: 'badge-danger' },
  distribute: { label: 'Distribusi', color: 'badge-info' },
  login: { label: 'Login', color: 'badge-neutral' },
};
