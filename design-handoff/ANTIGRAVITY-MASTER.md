# INSTRUKSI INDUK — Redesign HIKA Inventaris + Modul BOS

> **Ini file yang dijadikan acuan utama di Antigravity.** Berisi seluruh pekerjaan desain:
> (A) restyle aplikasi yang sudah ada, (B) fitur baru Pengadaan BOS/BAP, (C) revisi terakhir
> (satu dasbor, arsip BAP di Laporan, tanpa Kepala Sekolah, format cetak baru).
> Detail teknis ada di file lain yang dirujuk di bawah — jangan mengarang sendiri.

Repo: `school_inventory` — Next.js 16 (App Router), Tailwind v4, shadcn/ui, NextAuth 5,
Prisma 5 + PostgreSQL. Folder desain: `design-handoff/`.

---

## 0. Ringkasan pekerjaan

| Fase | Isi | Detail |
| --- | --- | --- |
| **A. Restyle** | Ganti tampilan glassmorphism lama → clean institutional SaaS (flat, border 1px, brand `#2B4EFF`, Plus Jakarta Sans, light + dark) | `01-design-tokens.md`, `02-layout-shells.md`, `03-components.md`, `04-screens.md`, `05-implementation-plan.md`, `tokens.css` |
| **B. Modul baru** | Pengadaan BOS → pemeriksaan guru → BAP sah ber-QR → arsip → verifikasi publik | `v2-pengadaan-bos/` (mulai dari `02-data-model.md`) |
| **C. Revisi final** | Satu dasbor (bukan dasbor kedua), arsip BAP jadi tab di Laporan, **tanpa Kepala Sekolah**, template cetak BAP & laporan baru | bagian 3 di bawah + `v2-pengadaan-bos/01-screens.md` |

Kerjakan **A dulu sampai build hijau**, baru **B**, lalu terapkan **C** pada hasilnya.

---

## 1. Design system (wajib dipakai)

- Font **Plus Jakarta Sans** (200–800) via `next/font/google` → `--font-plus-jakarta`.
- Token: `app-bg #F4F7FB`, `surface #FFFFFF`, `surface-2 #FAFCFE`, `line #E3EAF3`,
  `ink #0B1B2E`, `ink-soft #3B4A5F`, `muted #74849A`, `brand #2B4EFF`, `brand-soft #EBEFFF`,
  `navy #0A1730`, status `mint #0EA47A` / `amber #C77605` / `rose #D93A47`.
- Dark: `#202124` / `#292A2D` / `#303134` / `#3C4043` / `#E8EAED` / `#9AA0A6` / `#1A73E8` / `#2D3037` / `#1B1C1F`.
- Radius: kontrol 10, kartu mobile 14, kartu desktop 16, pill 999. Border selalu 1px `line`.
- **Hapus**: glassmorphism, `backdrop-blur`, blob/parallax, gradient dekoratif, animasi float.
- Ikon: `lucide-react` (sudah ada). Tidak ada library chart.
- Shell desktop: sidebar **264px** navy; main padding **26/32**. Mobile: app bar ±59px + bottom nav **62px**.
- Copy `design-handoff/tokens.css` ke `src/app/globals.css` (lalu sesuaikan).

## 2. Fitur baru (modul BOS)

Route:

| Route | Halaman |
| --- | --- |
| `/procurement` | Pengajuan pengadaan (form + tabel barang + quick pick gudang) |
| `/procurement/[id]` | Dokumen BAP A4 (preview + cetak) + riwayat |
| `/procurement/[id]/check` | Checklist pemeriksaan fisik (mobile) + aksi sahkan |
| `/reports` | **tab "Arsip BAP"** (tab ke-5) — bukan route/menu sendiri |
| `/dashboard` | dasbor yang ada + blok BOS (lihat §3) |
| `/verify/[token]` | halaman publik verifikasi QR (**tanpa login**) |

Alur status: `DRAFT → SUBMITTED → VERIFIED` (ditolak → `REJECTED` → revisi → `DRAFT`).
Nomor BAP `027/BAP-BOS/XI/2026` terbit saat submit (counter atomik per tahun), QR token 32 hex.
Publish = transaksi atomik: item tercentang → `Transaction IN` → barang BARU dibuat di Inventaris
→ status `VERIFIED`.

Detail: `v2-pengadaan-bos/02-data-model.md`, `03-roles-flows.md`, `04-server-actions.md`,
`05-print-and-qr.md`, `06-components.md`, `07-implementation-plan.md`.

## 3. Revisi final — ini yang sering salah, patuhi

1. **Satu dasbor saja.** `/dashboard` adalah satu-satunya dasbor. Tambahkan:
   - KPI ke-4 → "Pengadaan BOS" (nilai unit bulan ini, caption "Unit masuk · Nov 2026",
     ikon `shopping-cart`, chip mint).
   - **BOS Strip** penuh lebar di antara KPI dan body: chip ikon + "Pengadaan BOS · November 2026"
     + badge "Sah & Lengkap" + nomor BAP + "4 jenis · 18 unit" + pemeriksa + tombol **Lihat BAP**.
   - Mobile: KPI "Belanja BOS" + strip ringkas.
   - **JANGAN** membuat `/executive` atau dasbor kedua (layar eksekutif sudah dihapus).

2. **Arsip BAP = tab di Laporan.** Di `/reports`, tambah tab ke-5 `Arsip BAP` (desktop: underline
   tabs; mobile: chips). Isi tab: filter tahun + pill bulan + bar ringkasan + tabel BAP +
   pagination + tombol Cetak BAP. **JANGAN** membuat `/procurement/archive` atau menu arsip baru.

3. **Tidak ada Kepala Sekolah.**
   - Role hanya `ADMIN`, `TECHNICIAN`, `TEACHER`. Jangan menambah `HEADMASTER`.
   - Tidak ada menu/guard/halaman khusus kepala sekolah.
   - **Tanda tangan "Mengetahui, Kepala Sekolah" dihapus dari semua dokumen.**
     - BAP: 2 tanda tangan → `Penyimpan / Teknisi Barang` (kiri) dan
       `Guru Pengawas / Pemeriksa` + kotak QR (kanan).
     - Laporan cetak: `Dibuat oleh, Admin TU` (kiri) dan `Diperiksa oleh, Guru Pengawas` (kanan).

4. **Format cetak baru (A4 resmi) untuk BAP dan semua laporan.**
   - Ganti `ReportHeader.tsx` lama (garis + "Generated on") dengan template dokumen resmi:
     KOP surat (logo + PEMERINTAH PROVINSI / DINAS PENDIDIKAN / nama sekolah / alamat / NPSP)
     → garis ganda → judul + periode → strip ringkasan 3 sel → tabel bergaris → catatan →
     baris total → tanggal → 2 tanda tangan → footer ("Dicetak … · Halaman x dari y").
   - 4 varian laporan: **Stok**, **Peminjaman**, **Mutasi Gudang**, **Barang Masuk**
     (kolom mengikuti `src/components/reports/*`). Lebar kolom & isi contoh: lihat
     `v2-pengadaan-bos/01-screens.md` §9 dan `reference/png/16…19`.
   - Cetak pakai `pt`/`mm` (bukan px desain): body 9,5pt · tabel 7,5–8pt · QR 19–22mm ·
     margin 14/16mm · `@page { size: A4; margin: 0 }` · `.no-print` untuk chrome.
   - Status di tabel cetak ditulis sebagai **teks berwarna**, bukan badge (agar tidak terpotong).

## 4. Urutan kerja

1. **Fondasi**: font + `globals.css` (token) → build hijau.
2. **Shell**: `AuthenticatedLayoutClient`, `Sidebar` (264px, tambah menu "Pengadaan BOS"),
   `MobileBottomNav` (62px), `PageHeader`, `MobileAppBar`.
3. **Primitif UI**: button/badge/card/input/select/table/dialog/tabs/skeleton (sesuai v1).
4. **Halaman lama**: login → dashboard (+ BOS strip) → inventory → barcode → borrow →
   reports (+ tab Arsip BAP + template cetak baru) → settings.
5. **Modul BOS**: schema Prisma + migrasi → lib (bap-number, qr, guard, format) → server actions →
   `BapDocument` + print → `/procurement` → `/procurement/[id]` → `/procurement/[id]/check` →
   `/verify/[token]`.
6. **Polish**: dark mode, empty/loading states, aksesibilitas, print.
7. **Verifikasi**: `npx tsc --noEmit` · `npm run lint` · `npm run build` · uji alur end-to-end.

## 5. File & aset rujukan

```
design-handoff/
├── ANTIGRAVITY-MASTER.md          ← file ini (acuan utama)
├── 01-design-tokens.md             token & tipografi
├── 02-layout-shells.md             shell desktop/mobile
├── 03-components.md                spesifikasi komponen
├── 04-screens.md                   layar lama (login, inventory, borrow, reports, settings)
├── 05-implementation-plan.md       rencana fase A
├── tokens.css                      drop-in globals.css
├── reference/png|html/             screenshot & export HTML untuk layar lama
└── v2-pengadaan-bos/
    ├── ANTIGRAVITY-V2.md           instruksi modul BOS (detail)
    ├── 01-screens.md               8 layar v2 + §9 template cetak laporan
    ├── 02-data-model.md            5 model Prisma + counter
    ├── 03-roles-flows.md            role, izin, state machine, QR
    ├── 04-server-actions.md         action + validasi + publishBap
    ├── 05-print-and-qr.md           BAP A4 (pt/mm), QR, /verify
    ├── 06-components.md             komponen baru
    ├── 07-implementation-plan.md    fase B + checklist
    ├── reference/png/ (19 gambar), reference/html/, spec/
```

## 6. Larangan

- ❌ Jangan mengubah `prisma/` (selain menambah model baru), `src/actions/*` yang lama,
  `src/auth.ts`, `src/auth.config.ts` (selain route baru), `src/lib/`, `src/hooks/`.
- ❌ Jangan menambah dependency selain `qrcode` (+types); jangan library chart/PDF.
- ❌ Jangan menghapus fitur lama (scan keyboard, print barcode mm, export, dark mode, role admin).
- ❌ Jangan hardcode angka desain ("18 Unit", "027/BAP-BOS/XI/2026", "1.428") — ambil dari DB.
- ❌ Jangan membuat halaman/role/dasbor Kepala Sekolah.
- ❌ Jangan copy-paste HTML export mentah — tulis komponen React yang rapi.

## 7. Definisi selesai

- Seluruh aplikasi konsisten dengan design system (light + dark), desktop 1440×880 & mobile 390×844.
- Modul BOS berjalan end-to-end: draft → kirim → periksa → sahkan → BAP ber-QR → stok masuk →
  arsip di Laporan → ringkasan di Dasbor → verifikasi publik valid.
- Dokumen BAP & 4 laporan tercetak rapi 1 halaman A4, **tanpa** tanda tangan Kepala Sekolah.
- Tidak ada role/menu/halaman Kepala Sekolah, tidak ada dasbor kedua, tidak ada route arsip terpisah.
- `tsc`, `lint`, `build` hijau; modul lama tidak regresi.
- Laporkan di akhir: file yang diubah, komponen baru, dan hasil pengecekan per halaman.
