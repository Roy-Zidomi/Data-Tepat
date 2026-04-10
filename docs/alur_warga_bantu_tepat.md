# Alur Pengguna Warga (BantuTepat) - End-to-End Flow

Dokumen ini mendeskripsikan secara komprehensif alur sistem (flow) untuk aktor **Warga / Rumah Tangga (KK)** pada platform **BantuTepat**. Setiap tahapan dilengkapi dengan desain detail dari sisi *Frontend (UI/UX)*, *Backend (API)*, *Database Tabel*, dan *Keamanan*.

---

## 1. Registrasi & Login
Warga harus mendaftar dan masuk ke dalam sistem dengan aman.

- **Frontend (UI/UX):**
  - **Halaman:** `/register`, `/login`, `/forgot-password`.
  - **Komponen:** `AuthForm`, `InputField`, `SubmitButton`.
  - **UX:** Validasi realtime (panjang password minimal 8 karakter, format email valid). Menyediakan indikator loading saat memproses login.
- **Backend (API):**
  - `POST /api/auth/register`: Menerima input data, melakukan hashing password dengan `bcrypt` (salt rounds: 10). Membuat entri baru dengan `role = 'warga'`.
  - `POST /api/auth/login`: Memverifikasi kredensial, menghasilkan JWT Token.
  - `POST /api/auth/reset-password`: Mengirimkan link token ke email (jika ada).
- **Database:** Tabel `users` (`username`, `email`, `password_hash`, `role`).
- **Keamanan:** Password di-hash, Proteksi Brute-Force pada endpoint login, Penggunaan JWT (sebaiknya disimpan di *httpOnly cookie* atau memori Global State).

---

## 2. Input Data Rumah Tangga
Warga melengkapi profil kepala keluarga dan anggota keluarga di dalamnya.

- **Frontend (UI/UX):**
  - **Halaman:** `/household/create`, `/household/:id/members`.
  - **Komponen:** `Stepper` (Langkah 1: Identitas KK, Langkah 2: Anggota Keluarga), `FamilyMemberCard`, `FormInput`.
  - **UX:** Form *wizard* step-by-step agar pengguna tidak kebingungan. Auto-format input Nomor KK dan NIK (16 digit angka).
- **Backend (API):**
  - `POST /api/households`: Membuat data awal `households` (status: `draft`). Menghubungkan log user dengan `created_by_user_id`.
  - `POST /api/households/:id/members`: Menyimpan daftar anggota keluarga.
  - `GET /api/regions`: Mengambil data provinsi/kota/kecamatan/desa untuk pengisian wilayah asri secara *cascading drop-down*.
- **Database:** Tabel `households`, `family_members`, `regions`.
- **Keamanan:** Validasi kepemilikan data (hanya user pembuat yang bisa mengubah datanya). Validasi NIK dan KK untuk mencegah duplikasi masif (dibantu atribut `unique` di DB / tabel `duplicate_checks`).

---

## 3. Upload Dokumen
Sebagai bukti validitas, warga mengunggah berkas-berkas penting.

- **Frontend (UI/UX):**
  - **Halaman:** `/household/:id/documents`.
  - **Komponen:** `Dropzone` atau `FileInputButton`, `DocumentPreview`.
  - **UX:** Menampilkan persentase unggahan. Tipe dokumen dibatasi (PDF, JPG, PNG) dengan maksimal ukuran (misal: 2MB).
- **Backend (API):**
  - `POST /api/documents/upload`: Menerima fail dari frontend (menggunakan *Multer* pada Express.js), menyimpannya ke Cloud Storage / lokal, dan mencatat URL.
  - `GET /api/documents/household/:id`: Mengambil daftar dokumen berserta status verifikasi berjalan.
- **Database:** Tabel `documents` (untuk letak *file_url*), `document_verifications` (untuk menyimpan status dari admin *verified / rejected*).
- **Notifikasi:** "Dokumen Anda sedang ditinjau." atau notifikasi *Push* bila ditolak untuk diunggah ulang.

---

## 4. Pengajuan Bantuan
Jika profil dan dokumen telah terverifikasi atau lengkap, Warga dapat memulai pendaftaran program bantuan tertentu.

- **Frontend (UI/UX):**
  - **Halaman:** `/applications/new`, `/dashboard`.
  - **Komponen:** `AidProgramList`, `ApplicationStatusBadge`.
  - **UX:** Muncul *Confirmation Modal* sebelum pendaftaran ('Apakah data Anda sudah sesuai?'). Status historis aplikasi ditampilkan *Timeline-style* pada dashboard.
- **Backend (API):**
  - `GET /api/aid-types`: Mendapatkan daftar program bantuan yang aktif (`is_active = true`).
  - `POST /api/applications`: Membuat baris baru di `aid_applications` (status default: `submitted`) untuk `household_id` dan `aid_type_id` terlampir.
- **Database:** Tabel `aid_applications`, `application_status_histories`.
- **Notifikasi:** "Pengajuan bantuan No. [X] berhasil dibuat. Saat ini berstatus: Submitted."

---

## 5. Survei Lapangan (Sudut Pandang Warga)
Survei dilakukan oleh *petugas/relawan*, tetapi warga berhak tahu progresnya (Status).

- **Frontend (UI/UX):**
  - **Halaman:** `/applications/:id`.
  - **UX:** Indikator di *Timeline* akan berubah menjadi "Under Review / Sedang Disurvei". Sistem tidak menampilkan data form rinci survei milik petugas untuk pertimbangan independensi dan privasi, melainkan hanya *summary*.
- **Backend (API):**
  - `GET /api/applications/:id/status-tracking`: Membalas agregasi dari progres petugas survei yang menempel ke `application_id`.
- **Database:** Diambil ringkasan dari tabel `surveys` (menampilkan tanggal survei dilakukan).

---

## 6. Skoring & Rekomendasi
Sistem menetapkan tingkat kelayakan.

- **Frontend (UI/UX):**
  - **Halaman:** `/applications/:id`.
  - **UX:** Sistem tidak akan menampilkan bobot mentah yang bisa dimanipulasi moral *hazard*, sistem hanya memberikan rentang rekomendasi atau visual kategori (contohnya: "Prioritas Menengah").
- **Backend (API):**
  - `GET /api/applications/:id/score-summary`: Endpoint khusus Warga yang mengambil dari *scoring_result*, namun **di-filter / disaring** (jangan kembalikan field sensitif `total_score` secara gamblang jika kebijakan rahasia, kembalikan saja `priority_level`).
- **Database:** Tabel `scoring_results`.

---

## 7. Keputusan Admin & 8. Distribusi Bantuan
Keputusan penentuan dan juga proses penyaluran hak warga.

- **Frontend (UI/UX):**
  - **Halaman:** `/dashboard`, `/distributions`.
  - **Komponen:** `DecisionBanner` (Berwarna Hijau untuk Approved, Merah untuk Rejected). `DistributionCard` menunjukkan jadwal pengambilan/pengiriman, kuantitas (`quantity` dan `unit`).
- **Backend (API):**
  - `GET /api/applications/:id/decision`: Membaca relasi tunggal ke tabel `beneficiary_decisions`.
  - `GET /api/distributions/my-distributions`: Mengambil distribusi dari tiket bantuan berstatus disetujui.
- **Database:** Tabel `beneficiary_decisions`, `aid_distributions`, `distribution_proofs` (Warga bisa melihat ringkasan bukti serah-terima foto/dokumen jika hak telah disalurkan).
- **Notifikasi:** Peringatan "Selamat, Pengajuan Anda Disetujui" dan "Pemberitahuan Waktu dan Tempat Penyaluran Bantuan".

---

## 9. Pengaduan & Feedback
Apabila terjadi salah sasaran atau tidak kesesuaian data / distribusi.

- **Frontend (UI/UX):**
  - **Halaman:** `/complaints/create`, `/complaints`.
  - **Komponen:** `TextArea` (Deskripsi pengaduan), Dropdown jenis layanan/pengajuan.
  - **UX:** Pesan bahwa pengaduan dapat diajukan dengan menyebutkan *Application No* atau *Distribution Code*.
- **Backend (API):**
  - `POST /api/complaints`: Merangkai komplain masuk. `submitted_by_user_id` adalah ID Warga.
  - `GET /api/complaints/my-complaints`: Melihat tiket pengaduan aktif.
- **Database:** Tabel `complaints`.

---

## 10. Keamanan & Privasi
1. **RBAC (Role Based Access Control):** Semua API warga (`/api/households/...`, `/api/applications/...`) **WAJIB** mengekstrak `userId` dari subjek token JWT di Middleware. **Tidak boleh** ada parameter `userId` body yang dipercaya dari klien.
2. **Data Obfuscation:** Tampilkan NIK pada UI dengan menyembunyikan beberapa digit tengah (contoh: `3201**********02`), NIK utuh hanya bisa dilihat dengan penekanan tombol `show/hide` secara spesifik, sehingga aman dari *shoulder surfing*.
3. **Audit Trail:** Segala operasi warga seperti pencatatan input data dan update *draft* rumah tangga tercatat dalam `audit_logs`.

---

## 11. Pedoman UX/UI & Integrasi Front/Back
- **Teknologi:** React.js + Tailwind CSS untuk Frontend, Axios untuk API request. Express.js + Prisma ORM (Backend).
- **State Management:** Menggunakan *React Context / Zustand* untuk menyimpan State Auth Token dan Profil dasar agar ringan dan mengurangi frekuensi query backend.
- **Performa Loading & Data Besar:** Implementasi *Pagination* pada log status histori/pengaduan. Penggunaan *React Suspense* atau skeleton loader (Shimmer UI) selagi Axios fetch API.
- **Responsivitas:** Semua tampilan diutamakan *Mobile-First/Mobile-friendly*, mengingat warga kemungkinan besar mengakses dari telepon genggam menggunakan paket data.
- **API Request Flow:**
  `[ Warga Klik Form ] -> Validasi Front-End -> [ Axios Request + Header Bearer XYZ ] -> [ Express Middleware Autentikasi ] -> [ Prisma Database ] -> Response OK -> [ React Router Redirect/Toaster Alert ]`
