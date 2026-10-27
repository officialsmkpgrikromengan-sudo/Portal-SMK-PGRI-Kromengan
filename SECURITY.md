# Panduan Keamanan & Perlindungan Kredensial (GitHub Secret Protection)

Dokumen ini menjelaskan arsitektur keamanan dan perlindungan kunci rahasia (API Keys, Token, & Kredensial Database) pada aplikasi **SMK PGRI Kromengan** agar tidak bocor ke publik ketika repositori diunggah ke GitHub.

---

## 1. Arsitektur Pencegahan Kebocoran API Key

Aplikasi ini menerapkan standar keamanan **Defense-in-Depth** untuk memastikan kunci API (seperti `GEMINI_API_KEY`) tidak pernah terlihat oleh publik di GitHub:

### A. Penyimpanan Kunci Hanya Sisi Server (Backend Only)
* Seluruh kunci rahasia dibaca secara eksklusif di backend Node.js (`server/`) menggunakan `process.env.GEMINI_API_KEY`.
* **DILARANG** memberi awalan `VITE_` pada kunci API rahasia. Variabel dengan awalan `VITE_` akan dikompilasi oleh Vite langsung ke dalam berkas JavaScript browser (`dist/assets/*.js`) yang dapat dibaca oleh siapa saja via Inspect Element DevTools.
* Klien frontend berkomunikasi melalui proxy endpoint `/api/ai/generate` tanpa pernah mengetahui kunci API aslinya.

### B. Konfigurasi `.gitignore` yang Ketat
Berkas `.gitignore` telah dikonfigurasi untuk secara otomatis memblokir berkas-berkas sensitif berikut agar tidak ikut terunggah ke GitHub:
1. **Berkas Environment**: `.env`, `.env.*`, `*.env`, `.env.local`, `.env.production` (hanya `.env.example` tanpa nilai rahasia yang diizinkan).
2. **Sertifikat & Private Keys**: `*.pem`, `*.key`, `*.cert`, `*.token`, `id_rsa*`, `id_ed25519*`.
3. **Berkas Kredensial JSON**: `credentials.json`, `client_secret*.json`, `service-account*.json`, `firebase-applet-config.json`.
4. **Database Fisik SQLite**: `data/*.sqlite*`, `data/*.db*`, `*.db-journal`, `*.sqlite-wal` (mencegah data siswa, guru, dan kredensial akun ter-push ke GitHub).

### C. Penggunaan Template `.env.example` yang Aman
* File `.env.example` di repositori publik **TIDAK BERISI KUNCI ASLI** (nilainya kosong).
* Jangan pernah mengganti isi `.env.example` dengan kunci produksi Anda. Buatlah salinan file `.env` di lingkungan hosting Anda.

---

## 2. Cara Menjalankan Aplikasi Secara Aman

1. **Di Lingkungan Lokal / VPS**:
   Salin template environment:
   ```bash
   cp .env.example .env
   ```
   Buka file `.env` dan masukkan kunci rahasia Anda:
   ```env
   GEMINI_API_KEY="kunci_rahasia_gemini_anda_disini"
   APP_URL="http://localhost:3000"
   NODE_ENV="production"
   PORT=3000
   ```
   *File `.env` otomatis diabaikan oleh Git dan aman dari GitHub.*

2. **Di GitHub Actions / Cloud Hosting (Cloud Run, Vercel, Railway, VPS)**:
   * Masukkan `GEMINI_API_KEY` melalui menu **Environment Variables / Secrets** di panel kontrol hosting Anda (bukan di-commit ke Git).
   * Pada GitHub, gunakan menu **Settings > Secrets and variables > Actions** untuk menyimpan token rahasia.

---

## 3. Verifikasi Keamanan Kode (Static Audit Checklist)

Sebelum melakukan `git push` ke GitHub, sistem telah memverifikasi:
- [x] Nol referensi `process.env.GEMINI_API_KEY` di direktori `src/` (frontend).
- [x] Nol referensi `VITE_*_KEY` atau token rahasia di direktori `src/`.
- [x] File `.env.example` bersih tanpa nilai sensitif nyata.
- [x] File `.gitignore` mengabaikan seluruh format `.env` dan database `.sqlite`.
- [x] Seluruh kueri SQLite menggunakan *Parameterized Prepared Statements* (`?`) dan *Table Whitelist* untuk mencegah SQL Injection.
- [x] Endpoint autentikasi `/api/auth/*` dilindungi *Sliding-Window Rate Limiting* untuk mencegah serangan brute-force.
