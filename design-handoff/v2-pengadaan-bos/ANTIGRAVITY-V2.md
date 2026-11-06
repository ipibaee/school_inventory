# Prompt untuk Antigravity — Modul Pengadaan BOS / BAP (v2)

> Copy seluruh isi file ini sebagai instruksi. Kerjakan di repo `school_inventory`
> (Next.js 16 App Router, Prisma 5 + PostgreSQL, NextAuth 5, Tailwind v4, shadcn/ui).

---

## Tugas

Implementasikan **modul baru**: pengajuan pengadaan barang Dana BOS → pemeriksaan fisik oleh
Guru Pengawas → Berita Acara Penerimaan Barang (BAP) sah ber-QR → arsip BAP → dasbor monitoring
untuk Kepala Sekolah → halaman verifikasi publik.

Desain (PNG + layer tree + HTML) ada di `design-handoff/v2-pengadaan-bos/`.
Gaya visual **wajib mengikuti design system v1** yang sudah dipakai aplikasi
(token di `design-handoff/tokens.css`, komponen di `design-handoff/03-components.md`).

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

## Route yang harus dibuat

| Route | Halaman |
| --- | --- |
| `/procurement` | form pengajuan + tabel barang belanjaan |
| `/procurement/archive` | arsip BAP: filter tahun/bulan, tabel, cetak |
| `/procurement/[id]` | dokumen BAP A4 (preview + cetak), detail & riwayat |
| `/procurement/[id]/check` | checklist pemeriksaan fisik (mobile), aksi sahkan |
| `/executive` | dasbor monitoring Kepala Sekolah |
| `/verify/[token]` | **publik, tanpa login** — hasil scan QR dokumen |

## Aturan

- **Jangan** mengubah modul lama (inventaris, peminjaman, barcode, laporan) selain:
  menambah entri menu "Pengadaan BOS" di sidebar, menambah role, dan menambah model Prisma.
- Peran: `ADMIN` (admin TU), `TECHNICIAN` (teknisi gudang), `TEACHER` (guru pengawas),
  **`HEADMASTER`** (kepala sekolah, role baru). Lihat matriks izin di `03-roles-flows.md`.
- Semua nomor/statistik dari DB. Jangan hardcode "18 Unit" atau "027/BAP-BOS/XI/2026".
- Nomor BAP dibentuk `{seq:3digit}/BAP-BOS/{bulan romawi}/{tahun}` dan **hanya** diberikan
  saat pengajuan dikirim (status `SUBMITTED`), memakai counter atomik per tahun.
- QR **wajib** mengarah ke `/verify/{qrToken}` dengan `qrToken` acak 32 hex, unik, dan
  tidak bisa ditebak (jangan pakai id/cuid dokumen).
- Halaman `/verify/[token]` harus bisa diakses tanpa login (longgarkan `middleware`/`authConfig`)
  dan mencatat kunjungan verifikasi.
- Cetak BAP wajib A4, ukuran font memakai **pt** (lihat `05-print-and-qr.md`), bukan px desain.
- Pengesahan (publish) harus atomik: tandai barang terverifikasi + buat `Transaction` stok masuk
  + daftarkan barang baru di Inventaris, semua dalam satu `$transaction`.
- Tema gelap otomatis lewat token; jangan menulis warna `dark:` manual kecuali yang sudah
  ditetapkan (sidebar `#1B3364`/`#3C4043`, overlay `#0B1B2E99`/`#000000A6`).

## Dependensi yang boleh ditambah

- `qrcode` (+ `@types/qrcode`) untuk generate QR (SVG/data URL) di server.
- `date-fns` (sudah ada) untuk format tanggal Indonesia.
- **Jangan** menambah library chart; grafik realisasi bulanan dibuat dengan layout/flex
  (bar horizontal), seperti di desain.

## Definisi selesai

- Alur end-to-end berjalan: buat draft → kirim → guru periksa (checklist) → sahkan →
  BAP bernomor + QR → stok masuk & barang baru terdaftar → tampil di arsip → terlihat di
  dasbor eksekutif → QR discan menampilkan halaman verifikasi yang valid.
- Light & dark sesuai referensi; desktop 1440×880 dan mobile 390×844.
- `npx tsc --noEmit`, `npm run lint`, `npm run build` hijau.
- Tidak ada regresi pada modul lama.
