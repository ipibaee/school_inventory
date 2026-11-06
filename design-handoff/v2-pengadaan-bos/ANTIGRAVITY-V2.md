# Prompt untuk Antigravity — Modul Pengadaan BOS / BAP (v2)

> Copy seluruh isi file ini sebagai instruksi. Kerjakan di repo `school_inventory`
> (Next.js 16 App Router, Prisma 5 + PostgreSQL, NextAuth 5, Tailwind v4, shadcn/ui).

---

## Tugas

Implementasikan **modul baru**: pengajuan pengadaan barang Dana BOS → pemeriksaan fisik oleh
Guru Pengawas → Berita Acara Penerimaan Barang (BAP) sah ber-QR → arsip BAP di halaman Laporan →
halaman verifikasi publik, **plus** blok informasi BOS di dasbor yang sudah ada.

Desain (PNG + layer tree + HTML) ada di `design-handoff/v2-pengadaan-bos/`.
Gaya visual **wajib mengikuti design system v1** (token di `design-handoff/tokens.css`,
komponen di `design-handoff/03-components.md`).

## Keputusan yang sudah final — jangan diubah

1. **Hanya satu dasbor.** `/dashboard` tetap satu-satunya dasbor. Tambahkan di dalamnya:
   KPI "Pengadaan BOS" (menggantikan "Transaksi Hari Ini") dan satu blok **BOS Strip**
   (nomor BAP, badge status, jumlah jenis/unit, pemeriksa, tombol "Lihat BAP").
   **Jangan** membuat `/executive` atau dasbor kedua (layar eksekutif sudah dihapus).
2. **Arsip BAP = tab di `/reports`**, bukan menu/route sendiri. Tambah tab ke-5 `Arsip BAP`
   di halaman Laporan (desktop & mobile), lalu isi tab itu dengan filter tahun/bulan,
   ringkasan, dan tabel BAP. Hapus rencana route `/procurement/archive`.
3. **Tidak ada role Kepala Sekolah.** Role tetap `ADMIN`, `TECHNICIAN`, `TEACHER`.
   Jangan menambah `HEADMASTER`, jangan membuat guard/menu khusus kepala sekolah.
   Dokumen BAP **tidak** memuat tanda tangan Kepala Sekolah: hanya Penyimpan/Teknisi Barang
   dan Guru Pengawas (+ QR). Laporan cetak memakai 2 tanda tangan: "Dibuat oleh, Admin TU" dan
   "Diperiksa oleh, Guru Pengawas".

## Baca dulu

1. `design-handoff/v2-pengadaan-bos/01-screens.md`
2. `design-handoff/v2-pengadaan-bos/02-data-model.md`
3. `design-handoff/v2-pengadaan-bos/03-roles-flows.md`
4. `design-handoff/v2-pengadaan-bos/04-server-actions.md`
5. `design-handoff/v2-pengadaan-bos/05-print-and-qr.md`
6. `design-handoff/v2-pengadaan-bos/06-components.md`
7. `design-handoff/v2-pengadaan-bos/07-implementation-plan.md`
8. Referensi: `reference/png/*.png` (light + dark), `reference/html/*.html` (ukuran/markup),
   `spec/*.md` (angka per layer)

## Route yang harus dibuat / diubah

| Route | Status | Halaman |
| --- | --- | --- |
| `/procurement` | **baru** | form pengajuan + tabel barang belanjaan |
| `/procurement/[id]` | **baru** | dokumen BAP A4 (preview + cetak), riwayat |
| `/procurement/[id]/check` | **baru** | checklist pemeriksaan fisik (mobile), aksi sahkan |
| `/reports` | **ubah** | tambah tab "Arsip BAP" + **ganti format cetak laporan** (template A4 resmi, lihat `01-screens.md` §9) |
| `/dashboard` | **ubah** | KPI "Pengadaan BOS" + blok BOS Strip |
| `/verify/[token]` | **baru** | **publik, tanpa login** — hasil scan QR dokumen |

## Aturan

- **Jangan** mengubah modul lain (inventaris, peminjaman, barcode) selain menambah entri menu
  "Pengadaan BOS" di sidebar.
- Semua nomor/statistik dari DB. Jangan hardcode "18 Unit" atau "027/BAP-BOS/XI/2026".
- Nomor BAP dibentuk `{seq:3digit}/BAP-BOS/{bulan romawi}/{tahun}` dan **hanya** diberikan
  saat pengajuan dikirim (status `SUBMITTED`), memakai counter atomik per tahun.
- QR **wajib** mengarah ke `/verify/{qrToken}` dengan `qrToken` acak 32 hex, unik, tidak bisa ditebak.
- Halaman `/verify/[token]` harus bisa diakses tanpa login (longgarkan `middleware`/`authConfig`)
  dan mencatat kunjungan verifikasi.
- Cetak BAP wajib A4, ukuran font memakai **pt** (lihat `05-print-and-qr.md`), bukan px desain.
- Pengesahan (publish) harus atomik: tandai barang terverifikasi + buat `Transaction` stok masuk
  + daftarkan barang baru di Inventaris, semuanya dalam satu `$transaction`.
- Tema gelap otomatis lewat token; jangan menulis warna `dark:` manual kecuali yang ditetapkan
  (sidebar `#1B3364`/`#3C4043`, overlay `#0B1B2E99`/`#000000A6`).

## Dependensi yang boleh ditambah

- `qrcode` (+ `@types/qrcode`) untuk generate QR (SVG/data URL) di server.
- `date-fns` (sudah ada) untuk format tanggal Indonesia.
- **Jangan** menambah library chart.

## Definisi selesai

- Alur end-to-end berjalan: buat draft → kirim → guru periksa (checklist) → sahkan →
  BAP bernomor + QR → stok masuk & barang baru terdaftar → muncul di tab Arsip BAP pada Laporan →
  ringkasannya tampil di blok BOS pada Dasbor → QR discan menampilkan halaman verifikasi valid.
- Light & dark sesuai referensi; desktop 1440×880 dan mobile 390×844.
- Tidak ada role/menu/halaman khusus Kepala Sekolah.
- `npx tsc --noEmit`, `npm run lint`, `npm run build` hijau.
- Tidak ada regresi pada modul lama.
