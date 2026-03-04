# Panduan Deploy ke Vercel dengan Database Gratis (PostgreSQL)

Karena Vercel adalah platform *serverless*, database bawaan (SQLite) tidak cocok untuk digunakan karena datanya akan hilang setelah server di-restart (ephemeral). 
Oleh karena itu, kita mengubah database ke **PostgreSQL**. Anda bisa menggunakan penyedia database PostgreSQL gratis seperti **Neon** atau **Supabase**.

Berikut adalah langkah-langkah untuk melakukan *deploy* aplikasi School Inventory ke **Vercel** secara gratis.

## Langkah 1: Buat Database PostgreSQL (Gratis)
Pilih salah satu layanan ini untuk mendapatkan database PostgreSQL secara gratis:

### Opsi A: Menggunakan Neon.tech (Direkomendasikan)
1. Buka [Neon.tech](https://neon.tech/) dan buat akun (bisa daftar menggunakan akun GitHub/Google).
2. Setelah login, klik **Create Project** atau **New Project**.
3. Beri nama proyek (misal: `school-inventory-db`), pilih region terdekat (misalnya Singapore), dan versi PostgreSQL (biasanya versi 15 atau terbaru).
4. Setelah database dibuat, di *dashboard* utama, cari bagian **Connection Details**.
5. Centang opsi **Pooled connection** (jika ada opsi `Prisma`, pilih tab `Prisma`).
6. Salin **Connection String** yang diberikan (dimulai dengan `postgresql://...` atau `postgres://...`). Simpan URL ini, Anda akan membutuhkannya nanti.

### Opsi B: Menggunakan Supabase
1. Buka [Supabase.com](https://supabase.com/) dan buat akun.
2. Klik **New Project**, beri nama proyek (misal: `school-inventory`), lalu buat *database password* yang kuat (simpan password ini). Region pilih opsi terdekat (Singapore).
3. Setelah proyek selesai dibuat (membutuhkan beberapa menit), pergi ke menu **Settings > Database**.
4. Scroll ke bawah cari bagian **Connection string**, pilih tab **URI**.
5. Salin URL tersebut dan ganti parameter `[YOUR-PASSWORD]` dengan password yang Anda buat di langkah ke-2.

---

## Langkah 2: Deploy ke Vercel
1. Pastikan seluruh kode proyek ini sudah di-push dan tersimpan di **GitHub**, **GitLab**, atau **Bitbucket**.
2. Kunjungi [Vercel.com](https://vercel.com/) dan login (disarankan menggunakan akun GitHub tempat repositori Anda berada).
3. Di dashboard Vercel, klik **Add New...** > **Project**.
4. Cari repositori `school-inventory` Anda lalu klik **Import**.
5. Di halaman "Configure Project", biarkan sebagian besar pengaturan secara *default* (Framework Preset akan otomatis mendeteksi **Next.js**).
6. **Sangat Penting:** Buka bagian **Environment Variables**. Tambahkan *environment variables* berikut:

| Name         | Value                                                              |
|--------------|--------------------------------------------------------------------|
| `DATABASE_URL` | *(Paste URL Connection String dari Neon atau Supabase di sini)*    |
| `AUTH_SECRET`  | *(Buat string rahasia acak, contoh: `secret12345!@#$`)             |

7. Klik tombol **Deploy** dan tunggu proses selesai.

---

## Langkah 3: Selesai!

Dalam file `package.json`, *script build* sudah diubah menjadi:
```json
"build": "prisma generate && prisma db push && next build"
```
Artinya Vercel akan secara otomatis men-*generate* Prisma Client dan membuat tabel-tabel (`db push`) di dalam database PostgreSQL online Anda pada saat *deploy*!

Setelah *deploy* sukses, Vercel akan memberi Anda *domain* gratis seperti `https://school-inventory-xxx.vercel.app` yang dapat Anda akses dari perangkat mana pun yang terhubung di internet.

### Catatan Penting
- Jika Anda ingin tetap mencoba atau melakukan *development* secara lokal di komputer, pastikan Anda juga mengubah `DATABASE_URL` di file `.env` lokal Anda menggunakan *connection string* dari database online tersebut (atau jalankan PostgreSQL di komputer lokal Anda).
