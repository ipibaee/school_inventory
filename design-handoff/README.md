# HIKA Inventaris — Paket Handoff Desain (v1)

Paket ini berisi hasil redesign UI **HIKA Inventaris** (aplikasi Next.js di repo ini) dalam format
yang bisa langsung dibaca oleh Antigravity / AI coding agent.

**Yang berubah:** tampilan (warna, tipografi, layout, komponen) → gaya "clean institutional SaaS"
(flat, tanpa glassmorphism), sedangkan **fitur, route, dan logika bisnis tidak berubah**.

Ringkasan arah desain:

| Aspek | Lama | Baru |
| --- | --- | --- |
| Gaya | Glassmorphism + blob parallax | Flat, border tipis 1px, radius 10–16px |
| Warna utama | Biru oklch | `#2B4EFF` (light) / `#1A73E8` (dark) |
| Sidebar | Kaca transparan | Navy solid `#0A1730` + item aktif `#1B3364` |
| Font | Geist | **Plus Jakarta Sans** (200–800) |
| Tema | Light/Dark | Light/Dark (token sama, nilai beda) |
| Mobile | Bottom nav glass | App bar + bottom nav solid, kartu 2 kolom |

---

## Cara pakai di Antigravity

1. Buka folder repo `school_inventory` di Antigravity.
2. Lampirkan / sebutkan file **`design-handoff/ANTIGRAVITY-PROMPT.md`** sebagai instruksi utama.
   (Atau copy-paste isi file itu ke chat pertama.)
3. Minta agent membaca berurutan:
   `ANTIGRAVITY-PROMPT.md` → `01-design-tokens.md` → `02-layout-shells.md` →
   `03-components.md` → `04-screens.md` → `05-implementation-plan.md`.
   Kalau lebih praktis, lampirkan satu file saja: **`ALL-IN-ONE.md`**.
4. Referensi visual ada di `reference/png/` (34 screenshot), kode HTML+Tailwind hasil export
   ada di `reference/html/` (pakai sebagai acuan ukuran & markup, bukan untuk di-copy mentah).
5. Detail per-layer (nama layer, ukuran, padding, warna hasil resolve) ada di `spec/` bila agent
   butuh angka pasti.

---

## Isi paket

```
design-handoff/
├── README.md                  ← file ini
├── ANTIGRAVITY-PROMPT.md      ← instruksi utama untuk AI agent
├── 01-design-tokens.md        ← warna, tipografi, radius, spacing, shadow, ikon
├── tokens.css                 ← drop-in pengganti blok tema di src/app/globals.css
├── 02-layout-shells.md        ← shell desktop (sidebar+main) & mobile (appbar+bottom nav)
├── 03-components.md           ← spesifikasi komponen + resep kelas Tailwind
├── 04-screens.md              ← isi & struktur tiap halaman (route → layar desain)
├── 05-implementation-plan.md  ← urutan kerja + checklist acceptance
├── ALL-IN-ONE.md              ← semua dokumen di atas digabung (untuk sekali lampir)
├── reference/
│   ├── png/                   ← 34 screenshot (light + dark, desktop + mobile)
│   └── html/                  ← export HTML+Tailwind (acuan markup & ukuran)
└── spec/                      ← layer tree lengkap per layar (auto-generate dari file .pen)
```

## Pemetaan layar → route aplikasi

| Layar desain | Route / file |
| --- | --- |
| Login — Redesign + Mobile Login | `/login` · `src/app/login/page.tsx`, `src/components/auth/LoginForm.tsx` |
| Dasbor — Redesign + Mobile Dasbor | `/dashboard` · `src/app/(authenticated)/dashboard/page.tsx` |
| Inventaris — Redesign + Mobile Inventaris | `/inventory` · `src/app/(authenticated)/inventory/page.tsx` |
| Cetak Barcode — Redesign + Mobile Barcode | `/inventory/barcode` · `src/app/(authenticated)/inventory/barcode/page.tsx` |
| Peminjaman — Redesign + Mobile Peminjaman | `/borrow` · `src/app/(authenticated)/borrow/page.tsx` |
| Laporan — Redesign + Mobile Laporan | `/reports` · `src/app/(authenticated)/reports/page.tsx` |
| Pengaturan — Redesign + Mobile Pengaturan | `/settings` · `src/app/(authenticated)/settings/page.tsx` |
| Scan Kamera — Redesign + Mobile Scan | dialog · `src/components/inventory/ScanDialog.tsx`, `src/components/scanning/BarcodeScanner.tsx` |
| Di luar aplikasi | `Sistem Desain` & `Komponen` = **halaman dokumentasi desain**, tidak perlu diimplementasikan |

> Semua varian **Dark** memakai struktur layer yang identik dengan **Redesign**; bedanya hanya
> nilai token warna. Jadi cukup implementasikan satu struktur + token `dark:`.

## Aturan penting (jangan dilanggar agent)

- Jangan ubah schema Prisma, server actions, auth, atau nama query — ini murni redesign visual.
- Jangan hapus fitur. Bila ada elemen desain yang belum ada fiturnya, buat **presentational** dulu.
- Pertahankan semua behavior: scanner keyboard listener, print barcode (mm), export PDF, dark mode toggle.
- Satu sumber kebenaran warna: token di `src/app/globals.css`. Jangan hardcode hex di komponen,
  kecuali sidebar navy (lihat `01-design-tokens.md`).

---

## V2 — Modul baru (Pengadaan BOS / BAP / Dasbor Eksekutif)

Paket terpisah untuk **fitur baru** (bukan restyling): pengajuan pengadaan BOS, arsip BAP,
dokumen BAP A4 ber-QR, pemeriksaan fisik mobile, dasbor Kepala Sekolah, dan halaman verifikasi
publik. Sudah termasuk model Prisma, alur peran, server action, dan spesifikasi cetak.

→ [`v2-pengadaan-bos/README.md`](./v2-pengadaan-bos/README.md)
→ instruksi utama: [`v2-pengadaan-bos/ANTIGRAVITY-V2.md`](./v2-pengadaan-bos/ANTIGRAVITY-V2.md)
