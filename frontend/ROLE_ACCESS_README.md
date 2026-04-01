# Panduan Akses Role (Role-Based Access Control) BantuTepat

Dokumen ini menjelaskan bagaimana sistem hak akses (RBAC) diterapkan pada frontend **BantuTepat**, serta alur akses masing-masing level pengguna (*role*). 

Sistem dirancang mengamankan data sensitif sekaligus menyederhanakan alur kerja pengguna berdasarkan tanggung jawab kompartemennya masing-masing.

---

## 1. Mekanisme Login dan Routing

### A. Login Authenticated
Semua pengguna internal (Admin, Relawan, Petugas, Warga) wajib login melalui URL kredensial:
*   **URL Portal Login:** `http://localhost:5173/login` (development) atau `http://localhost:3000/login` (production)

Setelah login divalidasi oleh endpoint `/api/v1/auth/login`, sistem mengembalikan **Token JWT** dan **Role Type** pengguna.
React `Zustand store` (`authStore.js`) akan mencegat akses ke rute terlarang berdasarkan *role* tersebut.

### B. Public Access (Tanpa Login)
Peran `Donatur` atau Publik eksternal tidak memerlukan akun terdaftar. Mereka memiliki akses terbuka ke metrik performa atau portal donasi:
*   **URL Public Dashboard:** `/public-dashboard`
*   **URL Donasi:** `/donasi`

---

## 2. Peta Akses per Role (Navigation Matrix)

Setelah pengguna internal berhasil Autentikasi dan masuk ke sistem, URL Utama (Homepage) yang akan dirender adalah `/dashboard`. Tampilan *Dashboard* akan berbeda-beda tergantung peran pengguna (Warga melihat Profil/Status, sedangkan Admin melihat Agregat Nasional).

Berikut adalah pemetaan rute lengkap *Sidebar* yang diizinkan untuk setiap peran:

### 👑 Admin (Manajemen Penuh)
Admin bertugas memantau seluruh sistem dan memiliki akses krusial pada modul master.  
**Rute yang diizinkan:**
- `/dashboard` : Visualisasi seluruh alur dan metrik sistem.
- `/applications`: Peninjauan (Approve/Reject) pengajuan dari warga.
- `/decisions` : Akses modul pengambilan keputusan final kelayakan bantuan (Scoring akhir).
- `/distributions` : Pemantauan alur distribusi barang/dana.
- `/users` : Manajemen kredensial dan pembuatan akun Petugas/Relawan.
- `/regions` : Pemeliharaan data desa/kelurahan/kota.
- `/aid-types` : Setup jenis paket/kriteria tipe bantuan sosial (PKH, BPNT, BLT, dll).
- `/audit-logs` : Memantau catatan audit dari setiap aksi (*create, edit, delete, approve*) yang dilakukan di dalam sistem.

### 📋 Petugas (Supervisi & Eksekusi)
Petugas bertugas memverifikasi distribusi pada lini akhir pelayanan.  
**Rute yang diizinkan:**
- `/dashboard` : *Monitoring Dashboard* operasi harian.
- `/households` : Pemantauan data rumah tangga penerima.
- `/applications` : Pengecekan permohonan aktif atau sedang diproses.
- `/distributions` : Koordinasi penerimaan bantuan serta rekaman sukses distribusi.

### 📝 Relawan (Data Lapangan)
Relawan adalah garda depan yang blusukan mendata dan memverifikasi profil secara faktual di lapangan. Menu difokuskan murni untuk input data.  
**Rute yang diizinkan:**
- `/households` : Pengisian Formulir Rumah Tangga dasar.
- `/family-members` : Mendata Anggota Keluarga (istri/anak/tanggungan).
- `/documents` : Manajemen berkas/foto verifikasi KTP/KK/Surat miskin.
- `/surveys` : Melakukan survei langsung.
- `/survey-checklists`: Mengisi instrumen ceklis kriteria kerentanan (atap rumah terbuat dari tanah, penghasilan di bawah rata-rata, dll).
- `/survey-photos` : Mengamankan dan mengunggah bukti foto survei.

### 👤 Warga (Pemohon / Warga Mandiri)
Warga diarahkan sebagai objek penyangga aplikasi ini, dengan akses terbatas pada data privasinya sendiri atau permohonannya sendiri.  
**Rute yang diizinkan:**
- `/dashboard` : *Status Dashboard* melihat rekam jejak apakah bantuan cair/ditolak.
- `/households` : Mengajukan pembaruan data struktur rumah tangga dasar miliknya sendiri.
- `/family-members` : Mendaftarkan NIK anak atau memverifikasi kependudukan mandiri.
- `/documents` : Mengunggah kelengkapan file digital (KTP, Surat Pengantar RT/RW).
- `/applications` : Membuat permohonan pengajuan kelayakan bantuan terintegrasi secara asinkron.
- `/complaints` : Sarana input pengaduan apabila dana belum cair atau status disalahgunakan petugas.

---

## 3. Keamanan Halaman (Frontend Guards)
Sistem ini menggunakan teknik perlindungan React Component `ProtectedRoute`.

Sebagai contoh, jika status Anda adalah **Warga**, mencoba mengakses URL `http://localhost:5173/audit-logs` secara paksa akan menyebabkan halaman mengeksekusi validasi role, menemukan Anda tidak berstatus `admin`, lantas memancalkan paksa (me-redirect atau mendepak) Anda kembali ke halaman `/dashboard` tanpa menampilkan sedikitpun User Interface atau data log API tersebut. Data API juga terenkripsi di Backend Express via middleware `authorizeRoles()`.
