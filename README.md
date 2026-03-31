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

- Frontend: React + Vite
- Backend: Node.js
- Data layer: Prisma
- Configuration: `.env` terpisah untuk frontend dan backend

## Status Project

Repository ini masih berada pada tahap **initial base**. Struktur utama project, pemisahan frontend-backend, dan file konfigurasi dasar sudah tersedia, tetapi implementasi fitur inti masih perlu dilanjutkan.

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

3. Install dependency

```bash
cd backend
npm install

cd ../frontend
npm install
```

4. Jalankan project

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

Frontend:

- `VITE_API_URL`
- `VITE_APP_NAME`

## License

Team : Projo (Negeri dan Rakyat)
