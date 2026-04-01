# Blueprint: Alur Pengguna **Warga / Rumah Tangga (KK)** di Sistem BantuTepat

## Goal
Menyajikan alur lengkap mulai dari **registrasi** hingga **penerimaan bantuan**, mencakup **backend**, **frontend**, **database**, **notifikasi**, **keamanan**, dan **UX/UI**. Blueprint ini dapat langsung dijadikan acuan untuk implementasi modul warga.

---

## 1. Registrasi & Login
### Backend Endpoints
| Method | URL | Auth | Body | Response | Notes |
|--------|-----|------|------|----------|-------|
| `POST` | `/api/v1/auth/register` | ❌ | `{ username, email, password, name, phone }` | `{ token, user }` | Validasi schema (Joi/Yup). Password di‑hash dengan **bcrypt** (salt 10). JWT berisi `id`, `role`, `name`. |
| `POST` | `/api/v1/auth/login` | ❌ | `{ emailOrUsername, password }` | `{ token, user }` | Menggunakan **AuthService.login** (lihat `auth.service.js`). |
| `POST` | `/api/v1/auth/logout` | ✅ | – | `{ success:true }` | Token di‑invalidate di client (hapus dari storage). |
| `POST` | `/api/v1/auth/forgot-password` | ❌ | `{ email }` | `{ message:'Reset link sent' }` | Mengirim email dengan token satu‑paket (JWT short‑lived). |
| `POST` | `/api/v1/auth/reset-password/:token` | ❌ | `{ newPassword }` | `{ success:true }` | Verifikasi token, hash password baru, audit log.

### Database Tables
- **user** (`id PK`, `username`, `email`, `password_hash`, `role ENUM('admin','petugas','relawan','warga','donatur')`, `is_active`, `created_at`, `updated_at`)
- **audit_logs** (rekam semua aksi, termasuk `login`, `register`, `reset_password`).

### Frontend
- **Page**: `Register.jsx`, `Login.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`
- **Components**: `AuthForm`, `PasswordStrengthMeter`, `ToastNotification`
- **State**: `authStore` (Zustand) menyimpan `token`, `user`, `isAuthenticated`.
- **Validation**: `react-hook-form` + **Yup** schema, menampilkan error inline.
- **UX**: Fokus otomatis pada field pertama, show/hide password toggle, loading spinner pada submit.

---

## 2. Input Data Rumah Tangga
### Backend Endpoints
| Method | URL | Auth | Body | Response |
|--------|-----|------|------|----------|
| `GET` | `/api/v1/households` | ✅ (role warga) | – | List households (paginated) |
| `POST` | `/api/v1/households` | ✅ (role warga) | `{ kk_number, head_name, address, phone, ... }` | `{ household }` |
| `PUT` | `/api/v1/households/:id` | ✅ (owner atau admin) | Partial fields | `{ household }` |
| `GET` | `/api/v1/households/:id/family-members` | ✅ | – | List family members |
| `POST` | `/api/v1/households/:id/family-members` | ✅ | `{ name, nik, birth_date, gender, relation }` | `{ member }` |
| `PUT` | `/api/v1/family-members/:id` | ✅ | Partial fields | `{ member }` |

### Database Tables
- **household** (`id PK`, `kk_number UNIQUE`, `head_name`, `address`, `phone`, `user_id FK`, `created_at`, `updated_at`)
- **family_member** (`id PK`, `household_id FK`, `name`, `nik UNIQUE`, `birth_date`, `gender ENUM('M','F')`, `relation`, `created_at`, `updated_at`)

### Frontend
- **Page**: `HouseholdForm.jsx` (create & edit), `FamilyMemberList.jsx`, `FamilyMemberForm.jsx`
- **Components**: `AddressAutoComplete` (Google Places API optional), `DynamicTable` (pagination), `Modal` for member add/edit.
- **UX**: Wizard 2‑step (Step 1 = Data KK, Step 2 = Anggota Keluarga). Validasi NIK (numeric 16 digit). Auto‑save draft ke localStorage.

---

## 3. Upload Dokumen
### Backend Endpoints
| Method | URL | Auth | Body (multipart) | Response |
|--------|-----|------|------------------|----------|
| `POST` | `/api/v1/documents` | ✅ | `file`, `type` (`ktp`, `kk`, `sktm`, `photo_house`, `photo_field`) | `{ document }` |
| `GET` | `/api/v1/documents/:id` | ✅ (owner) | – | File stream (download) |
| `GET` | `/api/v1/documents` | ✅ | query `type` | List documents |
| `DELETE` | `/api/v1/documents/:id` | ✅ (owner) | – | `{ success:true }` |

### Database Tables
- **document** (`id PK`, `household_id FK`, `type ENUM('ktp','kk','sktm','photo_house','photo_field')`, `url`, `uploaded_at`)
- **document_verification** (`id PK`, `document_id FK`, `status ENUM('pending','approved','rejected')`, `reviewer_id FK`, `reviewed_at`, `remarks`)

### Notification Flow
1. Setelah upload, backend men‑create `document_verification` dengan status `pending`.
2. **Event** `document_uploaded` dipublikasikan via **WebSocket (socket.io)** atau **push notification** (optional).
3. Petugas/Relawan men‑verifikasi lewat UI admin → status berubah menjadi `approved`/`rejected`.
4. Backend meng‑emit `document_verified` → frontend men‑show **Toast** dan men‑update badge pada sidebar.

### Frontend
- **Page**: `DocumentUpload.jsx` (drag‑and‑drop), `DocumentList.jsx`
- **Components**: `FileDropZone`, `ProgressBar`, `VerificationBadge`
- **UX**: Preview thumbnail, limit ukuran 5 MB, tipe file PNG/JPG/PDF only.

---

## 4. Pengajuan Bantuan
### Backend Endpoints
| Method | URL | Auth | Body | Response |
|--------|-----|------|------|----------|
| `POST` | `/api/v1/aid-applications` | ✅ | `{ household_id, aid_type_id, description }` | `{ application }` (status = `draft`) |
| `PUT` | `/api/v1/aid-applications/:id/submit` | ✅ | – | `{ application, status:'submitted' }` |
| `GET` | `/api/v1/aid-applications` | ✅ | query `status` | List applications (paginated) |
| `GET` | `/api/v1/aid-applications/:id` | ✅ | – | Detail termasuk histori status |
| `GET` | `/api/v1/aid-applications/:id/history` | ✅ | – | List `application_status_histories` |

### Database Tables
- **aid_application** (`id PK`, `household_id FK`, `aid_type_id FK`, `description`, `status ENUM('draft','submitted','under_review','verified','rejected','approved','distributed')`, `created_at`, `updated_at`)
- **application_status_history** (`id PK`, `application_id FK`, `status`, `changed_by_user_id FK`, `changed_at`, `remarks`)

### Frontend
- **Page**: `ApplicationForm.jsx` (wizard: pilih jenis bantuan → isi data → upload dokumen), `MyApplications.jsx` (list + filter), `ApplicationDetail.jsx`
- **Components**: `StatusStepper` (visualisasi alur), `ActionButton` (Submit, Cancel), `DocumentLink`
- **UX**: Simpan draft otomatis tiap 30 detik, tombol **Submit** men‑trigger endpoint `/submit`. Setelah submit, semua field menjadi read‑only.

---

## 5. Survei Lapangan (Relawan / Petugas)
### Backend Endpoints
| Method | URL | Auth | Body | Response |
|--------|-----|------|------|----------|
| `POST` | `/api/v1/surveys` | ✅ (role relawan/petugas) | `{ application_id, checklist_items[], notes }` | `{ survey }` |
| `POST` | `/api/v1/surveys/:id/photos` | ✅ | multipart `photo` | `{ photo }` |
| `GET` | `/api/v1/surveys/:id` | ✅ | – | Detail survey + checklist + photo URLs |
| `GET` | `/api/v1/surveys` | ✅ | query `application_id` | List surveys |

### Database Tables
- **survey** (`id PK`, `application_id FK`, `surveyor_id FK`, `created_at`, `updated_at`)
- **survey_checklist** (`id PK`, `survey_id FK`, `question`, `answer BOOLEAN`, `remarks`)
- **survey_photo** (`id PK`, `survey_id FK`, `url`, `uploaded_at`)

### Frontend (Admin / Relawan UI)
- **Page**: `SurveyForm.jsx`, `SurveyDetail.jsx`
- **Components**: `ChecklistTable`, `PhotoUploader`, `MapPreview` (optional GPS).
- **UX**: Checklist auto‑save, foto preview thumbnail, konfirmasi sebelum submit.

---

## 6. Skoring & Rekomendasi
### Backend Logic (service)
- **Service**: `scoring.service.js`
- Input: `household_id` → fetch data rumah tangga, dokumen status, hasil survei, histori bantuan.
- Algoritma: gabungkan **indikator ekonomi** (pendapatan, aset), **kerentanan** (disabilitas, anak < 6 th), **riwayat bantuan**.
- Output: `score (0‑100)`, `recommendation ENUM('eligible','borderline','ineligible')`.
- Simpan ke **scoring_results**.

### Database Table
- **scoring_result** (`id PK`, `household_id FK`, `score`, `recommendation`, `calculated_at`)

### Backend Endpoint
| Method | URL | Auth | Response |
|--------|-----|------|----------|
| `GET` | `/api/v1/households/:id/score` | ✅ | `{ score, recommendation }` |

### Frontend
- **Page**: `ScoreResult.jsx` (read‑only summary card)
- **Component**: `ScoreBadge` (color‑coded: green = eligible, amber = borderline, red = ineligible)
- **UX**: Show only **summary**; tombol “Lihat detail” hanya tersedia untuk admin.

---

## 7. Keputusan Admin
### Backend Endpoint
| Method | URL | Auth | Body | Response |
|--------|-----|------|------|----------|
| `POST` | `/api/v1/beneficiary-decisions` | ✅ (role admin) | `{ application_id, decision ENUM('approved','rejected','waitlisted'), notes }` | `{ decision }` |

### Database Table
- **beneficiary_decision** (`id PK`, `application_id FK`, `admin_id FK`, `decision`, `notes`, `decided_at`)

### Notification Flow
1. Admin menyimpan keputusan → **event** `decision_made`.
2. Backend meng‑push notifikasi via **socket.io** ke client warga.
3. Jika email tersedia, kirim email dengan template keputusan.

### Frontend (Warga)
- **Dashboard** men‑show **toast** “Keputusan bantuan Anda: *Approved*”.
- **Page** `DecisionDetail.jsx` men‑display keputusan, catatan admin, dan tombol “Lihat distribusi” bila approved.

---

## 8. Distribusi Bantuan
### Backend Endpoints
| Method | URL | Auth | Body | Response |
|--------|-----|------|------|----------|
| `POST` | `/api/v1/aid-distributions` | ✅ (role petugas/admin) | `{ application_id, distribution_date, location, notes }` | `{ distribution }` |
| `POST` | `/api/v1/aid-distributions/:id/proofs` | ✅ | multipart `proof_file` | `{ proof }` |
| `GET` | `/api/v1/aid-distributions/:application_id` | ✅ | – | Distribution record + proof URLs |

### Database Tables
- **aid_distribution** (`id PK`, `application_id FK`, `distribution_date`, `location`, `notes`, `created_at`)
- **distribution_proof** (`id PK`, `distribution_id FK`, `url`, `uploaded_at`)
- **distribution_status_history** (`id PK`, `distribution_id FK`, `status ENUM('scheduled','delivered','failed')`, `changed_at`, `remarks`)

### Frontend
- **Page**: `DistributionInfo.jsx` (warga melihat tanggal, lokasi, bukti foto).
- **Component**: `ProofGallery` (carousel of proof images).
- **UX**: Notifikasi “Bantuan Anda telah didistribusikan pada 12‑Jun‑2026” dengan tombol “Lihat bukti”.

---

## 9. Pengaduan & Feedback
### Backend Endpoints
| Method | URL | Auth | Body | Response |
|--------|-----|------|------|----------|
| `POST` | `/api/v1/complaints` | ✅ | `{ subject, description, related_application_id? }` | `{ complaint }` |
| `GET` | `/api/v1/complaints` | ✅ | query `status` | List complaints |
| `PUT` | `/api/v1/complaints/:id/status` | ✅ (admin/petugas) | `{ status ENUM('open','in_progress','resolved','rejected') }` | `{ complaint }` |

### Database Table
- **complaint** (`id PK`, `user_id FK`, `subject`, `description`, `related_application_id FK nullable`, `status`, `created_at`, `updated_at`)

### Notification Flow
- Warga mengirim pengaduan → **event** `complaint_created` → email konfirmasi.
- Petugas mengubah status → **event** `complaint_updated` → push notification ke warga.

### Frontend
- **Page**: `ComplaintForm.jsx`, `MyComplaints.jsx` (list + filter), `ComplaintDetail.jsx`
- **Component**: `StatusTag` (color‑coded), `CommentThread` (optional).
- **UX**: Form satu‑kolom, auto‑resize textarea, tombol “Kirim”. Setelah kirim, tampilkan nomor tiket.

---

## 10. Keamanan & Privasi
| Area | Mechanism |
|------|-----------|
| **Transport** | Semua request melalui **HTTPS** (dev: `vite dev server` + `proxy` ke backend). |
| **Auth** | JWT signed dengan `HS256`, `exp` 7 hari, disimpan di **httpOnly** cookie *atau* `localStorage` (dengan X‑SSRF protection). |
| **Authorization** | Middleware `authorizeRoles([...])` pada setiap route (lihat `auth.middleware.js`). |
| **Data Sensitif** | NIK, alamat, dokumen hanya dapat di‑fetch oleh pemilik (`user_id`) atau admin. Endpoint meng‑filter fields sebelum mengirim response. |
| **Audit** | Semua perubahan (create/update/delete) tercatat di `audit_logs` (table: `id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `timestamp`). |
| **Rate Limiting** | `express-rate-limit` pada login & register (max 5 req/min per IP). |
| **CORS** | Hanya domain front‑end yang di‑allow (`http://localhost:5173` atau production domain). |
| **File Storage** | Dokumen disimpan di folder server terisolasi (`/uploads`) dengan nama hash unik, path disimpan di DB. Akses file melalui endpoint yang memeriksa otorisasi. |
| **Content Security Policy** | Header CSP di `app.js` untuk mencegah XSS. |

---

## 11. UX/UI Guidelines (Frontend)
1. **Dashboard Pribadi** – Card‑grid menampilkan:
   - Status aplikasi (stepper).
   - Notifikasi terbaru (badge).
   - Shortcut ke “Upload Dokumen”, “Buat Pengajuan”, “Lihat Distribusi”.
2. **Formulir** – Single‑column, label di atas input, spacing 1.5rem, gunakan **Tailwind** utility `space-y-4`.
3. **Responsive** – Mobile: sidebar collapses to hamburger, semua tabel menjadi **horizontal scroll** atau **card list**. Desktop: grid 2‑col untuk wizard.
4. **Loading States** – Skeleton UI (`react-loading-skeleton`) saat men‑fetch data.
5. **Feedback** – Toast (auto‑dismiss 5s) untuk sukses/error, warna hijau/merah.
6. **Accessibility** – ARIA labels pada tombol, kontras warna ≥ 4.5:1, fokus keyboard navigable.
7. **Performance** – Pagination (server‑side) untuk list > 20 item, lazy‑load gambar dengan `loading='lazy'`, memoization (`React.memo`) pada tabel statis.

---

## 12. Integrasi Frontend ↔ Backend
- **Axios Instance** (`src/services/api.js`) sudah meng‑inject JWT pada header `Authorization: Bearer <token>`.
- **Global Error Interceptor** – men‑handle 401 → logout otomatis, men‑show modal “Session expired”.
- **React Context / Zustand** – `authStore` menyimpan token & user, `uiStore` mengelola sidebar state & global notifications.
- **WebSocket (socket.io)** – optional untuk real‑time notifikasi (document verification, decision, distribution). Frontend subscribe pada channel `user_{id}`.

---

## 13. Checklist Implementasi (High‑Level)
- [ ] Buat semua tabel di **Prisma schema** (user, household, family_member, document, document_verification, aid_application, application_status_history, survey, survey_checklist, survey_photo, scoring_result, beneficiary_decision, aid_distribution, distribution_proof, distribution_status_history, complaint, audit_log).
- [ ] Generate migration & seed admin + contoh warga.
- [ ] Implementasi **Auth Service** (register, login, reset, logout) dengan validasi Joi/Yup.
- [ ] Middleware **authenticate** + **authorizeRoles**.
- [ ] CRUD API untuk household, family‑member, documents, applications, surveys, scoring, decisions, distributions, complaints.
- [ ] Event emitter / socket.io untuk notifikasi real‑time.
- [ ] Frontend pages & components sesuai daftar di atas, terhubung ke API via Axios.
- [ ] UI/UX: Tailwind config (dark mode, custom palette), responsive layout, skeleton loaders.
- [ ] Testing: unit tests untuk services, e2e tests (Cypress) untuk flow warga.
- [ ] Dokumentasi API (Swagger) & README untuk developer.

---

**Next Steps**
1. Review blueprint dengan tim product untuk menyesuaikan nama endpoint atau field tambahan.
2. Prioritaskan implementasi **Registrasi → Input Rumah Tangga → Upload Dokumen** (MVP).
3. Setelah MVP stabil, lanjutkan **Pengajuan → Survei → Skoring → Keputusan → Distribusi**.

---

*Apabila ada penyesuaian atau tambahan modul, beri tahu saya agar saya dapat memperbaharui blueprint.*
