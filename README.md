# BantuTepat

**Smart Digital Solution for Social Assistance Distribution**

BantuTepat adalah platform digital untuk mendukung pendataan, verifikasi, prioritisasi, dan pemantauan penyaluran bantuan sosial agar lebih tepat sasaran, transparan, dan akuntabel. Proyek ini dikembangkan dalam konteks **TechSprint 2026**.

## Fokus Solusi

- pendataan penerima bantuan berbasis rumah tangga atau KK
- rekomendasi prioritas penerima berbasis indikator sosial-ekonomi
- dashboard transparansi distribusi bantuan
- audit trail untuk mendukung akuntabilitas dan evaluasi

## Struktur Repository

```text
Data-Tepat/
|-- backend/
|   |-- prisma/
|   `-- src/
|-- frontend/
|   |-- public/
|   `-- src/
`-- README.md
```

## Tech Stack

- Frontend: React + Vite, Tailwind CSS, Zustand
- Backend: Node.js, Express
- Data layer: Prisma, PostgreSQL
- Configuration: `.env` terpisah untuk frontend dan backend
- Upload: Multer (Penyimpanan Lokal)

## Fitur Terimplementasi

- **Autentikasi & Otorisasi:** Sistem login JWT berbasis Role (Admin, Surveyor, dll).
- **Master Data Warga:** Registrasi penduduk, rumah tangga, kondisi ekonomi, rumah, dan aset.
- **Pengajuan Bantuan:** Pembuatan pengajuan per tipe bantuan terintegrasi dengan dokumen verifikasi.
- **Distribusi Bantuan:** Pelacakan proses penyaluran dan penyimpanan bukti distribusi.
- **Komplain & Audit:** Sistem pengelolaan keluhan warga dan pencatatan audit log secara otomatis.

## Status Project

Sistem saat ini berada dalam **fase pengembangan aktif**. Struktur utama project telah mencakup fitur inti API (pengajuan, distribusi, warga, komplain) beserta skema database yang komprehensif pada level backend. Sementara itu, UI di bagian frontend telah dibangun dengan state management dan komponen yang spesifik.

## Getting Started

1. Clone repository

```bash
git clone <repository-url>
cd Data-Tepat
```

2. Siapkan file environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
*(Pastikan Anda menyesuaikan credentials PostgreSQL pada parameter `DATABASE_URL` di `backend/.env`)*

3. Install dependency

```bash
cd backend
npm install

cd ../frontend
npm install
```

4. Setup Database

```bash
cd backend
npx prisma generate
npx prisma db push
```

5. Jalankan project

```bash
cd backend
npm run dev

cd ../frontend
npm run dev
```

## Environment Variables

Backend:

- `DATABASE_URL`
- `PORT`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `UPLOAD_DIR`
- `MAX_FILE_SIZE`

Frontend:

- `VITE_API_URL`
- `VITE_APP_NAME`

## Catatan Penting

- Penyimpanan file (seperti KTP atau bukti dokumentasi) saat ini masih mengandalkan mekanisme local storage (`uploads/`), belum diintegrasikan ke layanan Cloud Object Storage.
- Skema database sudah mencakup penanganan tabel OTP, namun sistem pengiriman tiket (SMS/WA) belum sepenuhnya aktif secara end-to-end tanpa integrasi eksternal.

## License

Team : Projo (Negeri dan Rakyat)
