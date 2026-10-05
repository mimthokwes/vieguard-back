# Vieguard Back

Backend REST API untuk platform penjualan dan penyewaan kostum (drumband, parade, karnaval, dan acara 17 Agustusan). Dibuat dengan Express.js, TypeScript, Prisma, dan MySQL, serta melayani dua klien: aplikasi mobile pemilik/admin [vieguard-app](https://github.com/mimthokwes/vieguard-app) dan website pelanggan.

> Status: dalam pengembangan aktif.

## Latar Belakang

Usaha kostum ini melayani penjualan, penyewaan, dan pesanan custom dalam jumlah besar (satuan sampai borongan untuk satu kelompok). Pencatatan manual membuat stok, jadwal sewa, pembayaran, dan komunikasi dengan pelanggan sulit dipantau. Vieguard menyatukan semuanya dalam satu sistem:

- **Website** untuk pelanggan: melihat katalog, memesan, dan membayar.
- **Aplikasi mobile** ([vieguard-app](https://github.com/mimthokwes/vieguard-app)) untuk pemilik/admin: mengelola pesanan, stok, chat, dan laporan dari satu tempat.
- **Backend (repo ini)** sebagai sumber data bersama dan pusat logika bisnis untuk kedua klien di atas.

## Fitur

### Autentikasi dan Akun

- Login pelanggan dan admin dengan **JWT**.
- Password di-hash dengan bcrypt.
- Reset password dan pengaturan akun.

### Pesanan

- Pesanan dengan tipe **beli**, **sewa**, dan **custom**.
- Pesanan sewa dibayar penuh di awal, sedangkan pesanan standar/custom melalui alur **DP -> progres produksi -> pelunasan**.
- Riwayat perubahan status pesanan.
- Pembuatan surat perjanjian sewa (rental agreement) dalam format PDF.

### Rental

- Jadwal sewa dan tanggal pengembalian kostum.
- Tugas terjadwal (cron job) untuk kebutuhan otomatis seperti pengecekan jadwal sewa.

### Manajemen Stok

- Kelola kategori, produk, varian (ukuran), foto, dan aksesori.
- Upload foto produk.
- Input data stok/ukuran secara massal.

### Chat

- Percakapan pelanggan dan admin secara realtime lewat **Socket.IO**.

### Pembayaran dan Laporan

- Pencatatan pembayaran (DP, pelunasan, pembayaran penuh).
- Data untuk laporan dan analitik bisnis.

### Notifikasi dan Log Aktivitas

- Notifikasi untuk admin dan log aktivitas.

## Teknologi

| Bagian        | Teknologi                          |
| ------------- | ---------------------------------- |
| Runtime       | Node.js                            |
| Framework     | Express.js, TypeScript             |
| ORM           | Prisma                             |
| Database      | MySQL                              |
| Cache         | Redis (ioredis)                    |
| Realtime      | Socket.IO                          |
| Validasi      | Zod                                |
| Autentikasi   | JWT, bcryptjs, cookie-parser       |
| Upload File   | Multer                             |
| PDF           | PDFKit                             |
| Scheduler     | node-cron                          |
| Keamanan      | Helmet, CORS                       |
| Dokumentasi   | swagger-autogen, Swagger UI, Scalar |

## Prasyarat

Pastikan sudah terpasang:

- [Node.js](https://nodejs.org/) (cek dengan `node --version`)
- npm
- [MySQL](https://dev.mysql.com/downloads/) yang sudah berjalan
- [Redis](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/) yang sudah berjalan
- Git

## Instalasi

```bash
# 1. Clone repository
git clone https://github.com/mimthokwes/vieguard-back.git
cd vieguard-back

# 2. Install dependency
npm install
```

## Konfigurasi

Salin file contoh environment, lalu sesuaikan isinya.

```bash
cp .env.example .env
```

| Variabel         | Keterangan                                              | Contoh                                |
| ---------------- | ------------------------------------------------------- | ------------------------------------- |
| `PORT`           | Port server                                             | `5000`                                |
| `NODE_ENV`       | Mode aplikasi                                           | `development`                         |
| `DATABASE_URL`   | Connection string MySQL                                 | `mysql://user:password@localhost:3306/vieguard` |
| `JWT_SECRET`     | Secret untuk menandatangani JWT (ganti dengan nilai acak) | `isi_dengan_string_acak_yang_panjang` |
| `JWT_EXPIRES_IN` | Masa berlaku token                                      | `7d`                                  |
| `CORS_ORIGIN`    | Origin yang diizinkan mengakses API                     | `*`                                   |
| `REDIS_HOST`     | Host Redis                                              | `127.0.0.1`                           |
| `REDIS_PORT`     | Port Redis                                              | `6379`                                |
| `REDIS_PASSWORD` | Password Redis (kosongkan jika tidak ada)               |                                       |
| `REDIS_DB`       | Nomor database Redis                                    | `0`                                   |

> Jangan pernah meng-commit file `.env`. Untuk production, ganti `JWT_SECRET` dan batasi `CORS_ORIGIN` ke domain yang dipakai.

## Database

Proyek ini memakai `prisma db push` untuk menyelaraskan skema ke database, dan folder `prisma/migrations` tidak disimpan di repository.

```bash
# Generate Prisma Client
npm run prisma:generate

# Sinkronkan skema ke database
npm run prisma:push

# Isi data awal
npm run prisma:seed

# Isi data operasional (opsional)
npm run prisma:seed-ops
```

## Menjalankan Aplikasi

```bash
# Mode development (auto-reload)
npm run dev

# Build untuk production
npm run build

# Jalankan hasil build
npm start
```

Server berjalan di `http://localhost:5000` (sesuai nilai `PORT`).

## Skrip npm

| Perintah                 | Fungsi                                              |
| ------------------------ | --------------------------------------------------- |
| `npm run dev`            | Menjalankan server dengan ts-node-dev               |
| `npm run build`          | Generate dokumentasi API lalu compile TypeScript    |
| `npm start`              | Menjalankan hasil build dari `dist/server.js`       |
| `npm run docs:generate`  | Generate dokumentasi API (swagger-autogen)          |
| `npm run prisma:generate`| Generate Prisma Client                              |
| `npm run prisma:push`    | Sinkronkan skema Prisma ke database                 |
| `npm run prisma:seed`    | Menjalankan seed data awal                          |
| `npm run prisma:seed-ops`| Menjalankan seed data operasional                   |

## Struktur Folder

```
prisma/
  schema.prisma   # database schema
  seed.ts         # initial seed data
src/
  docs/           # API documentation generator
  server.ts       # application entry point
```

## Dokumentasi API

Dokumentasi endpoint dibuat otomatis dari kode dengan swagger-autogen dan ditampilkan lewat Swagger UI / Scalar saat server berjalan. Jalankan `npm run docs:generate` setelah menambah atau mengubah endpoint agar dokumentasi tetap sinkron.

## Tim

Proyek ini berawal dari tugas kelompok (Kelompok 7, kelas T3B) dan dikembangkan lebih lanjut untuk kebutuhan usaha yang sebenarnya.

## Lisensi

Belum ditentukan.
