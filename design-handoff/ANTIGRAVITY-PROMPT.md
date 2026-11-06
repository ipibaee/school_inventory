# Prompt untuk Antigravity — Redesign UI HIKA Inventaris

> Copy seluruh isi file ini sebagai pesan pertama di Antigravity, di dalam repo
> `school_inventory`. Semua file pendukung ada di folder `design-handoff/`.

---

## Tugas

Redesign **seluruh UI** aplikasi Next.js di repo ini (HIKA Inventaris — sistem inventaris sekolah)
mengikuti desain di folder `design-handoff/`. Ini **murni perubahan visual + layout**:
fitur, route, server action, schema Prisma, dan auth **tidak boleh berubah**.

Gaya baru: *clean institutional SaaS* — flat, border 1px, radius 10–16px, satu warna aksen
(biru `#2B4EFF`), sidebar navy solid, font Plus Jakarta Sans, light + dark mode.

**Hapus total** gaya lama: glassmorphism, `backdrop-blur`, blob/parallax background,
gradient dekoratif, animasi float.

## Baca dulu, berurutan

1. `design-handoff/01-design-tokens.md` — warna, tipografi, radius, spacing, ikon
2. `design-handoff/tokens.css` — salinan token yang harus dipakai (ganti isi `src/app/globals.css`)
3. `design-handoff/02-layout-shells.md` — shell desktop & mobile
4. `design-handoff/03-components.md` — komponen + resep Tailwind
5. `design-handoff/04-screens.md` — isi tiap halaman
6. `design-handoff/05-implementation-plan.md` — urutan kerja + checklist
7. Referensi visual: `design-handoff/reference/png/*.png`
   Markup acuan: `design-handoff/reference/html/*.html`
   Angka detail per layer (layar baru): `v2-pengadaan-bos/spec/*.md`

## Token wajib (ringkas)

| Peran | Light | Dark |
| --- | --- | --- |
| app background | `#F4F7FB` | `#202124` |
| surface (kartu) | `#FFFFFF` | `#292A2D` |
| surface-2 | `#FAFCFE` | `#303134` |
| border / line | `#E3EAF3` | `#3C4043` |
| teks utama (ink) | `#0B1B2E` | `#E8EAED` |
| teks sekunder (ink-soft) | `#3B4A5F` | `#BDC1C6` |
| teks tersier (muted) | `#74849A` | `#9AA0A6` |
| brand | `#2B4EFF` | `#1A73E8` |
| brand-soft | `#EBEFFF` | `#2D3037` |
| navy (sidebar) | `#0A1730` | `#1B1C1F` |
| navy-2 (user card) | `#122444` | `#2A2B2E` |
| mint / mint-soft | `#0EA47A` / `#E4F7F0` | `#81C995` / `#2C3630` |
| amber / amber-soft | `#C77605` / `#FDF2DE` | `#FDD663` / `#38321F` |
| rose / rose-soft | `#D93A47` / `#FDEBEC` | `#F28B82` / `#3A2B2A` |

- Sidebar lokal: item aktif `#1B3364` (dark `#34373D`), item idle `#93A7C4` (dark `#9AA0A6`),
  label grup `#5C7295`.
- Font: **Plus Jakarta Sans** (200–800) via `next/font/google` → `--font-plus-jakarta`.
- Radius: 6 (tag) · 8 · 9 · 10 (field/tombol/nav) · 12 · 14 (kartu mobile) · 16 (kartu desktop) · 999 (pill).
- Ukuran kunci: sidebar **264px**; padding main desktop **26px 32px**; topbar judul **27px/800**;
  bottom nav mobile **62px**; app bar mobile **±59px**; kartu desktop padding **22px**,
  kartu mobile padding **13–14px**.

## Shell

- **Desktop (≥1024px):** sidebar 264px navy (brand → "MENU UTAMA" → nav item → spacer → user card),
  main dengan padding 26/32 dan `PageHeader` (judul + subjudul + actions) di setiap halaman.
- **Mobile (<1024px):** app bar (mark/back + judul 16/800 + sub 9.5 + aksi 32px) + konten
  (padding `0 16px 12px`, gap 10–12) + **bottom nav 62px** dengan 5 tab:
  Dasbor / Inventaris / Barcode / Pinjam / Laporan.
- Tabel di mobile berubah menjadi **list kartu**, bukan scroll horizontal.

## Halaman (semua sudah ada, jangan tambah route)

`/login` · `/dashboard` · `/inventory` · `/inventory/barcode` · `/borrow` · `/reports` · `/settings`
+ dialog scan kamera. Detail per halaman: `04-screens.md`.

## Larangan

- ❌ Jangan ubah `prisma/`, `src/actions/`, `src/auth.ts`, `src/auth.config.ts`, `src/middleware.ts`,
  `src/lib/`, atau nama query/aksi.
- ❌ Jangan tambah dependency (ikon: `lucide-react` yang sudah ada; barcode: `react-barcode`;
  kamera: `html5-qrcode`).
- ❌ Jangan hapus fitur apa pun (scan keyboard listener, print mm, export PDF, dark mode, role admin).
- ❌ Jangan pakai `backdrop-blur`, shadow besar, gradient dekoratif, atau emoji sebagai ikon.
- ❌ Jangan hardcode hex selain daftar yang diizinkan di `05-implementation-plan.md`.
- ❌ Jangan copy-paste HTML export mentah — tulis ulang sebagai komponen React yang rapi
  (`PageHeader`, `MetricCard`, `StatusBadge`, `DataTable`, `MobileAppBar`, `EmptyState`, dst).

## Urutan kerja

1. `layout.tsx` (font) + `globals.css` (token dari `tokens.css`) → cek dev server.
2. Shell: `AuthenticatedLayoutClient`, `Sidebar`, `MobileBottomNav`, `PageHeader`, `MobileAppBar`.
3. Primitif shadcn: `button`, `badge`, `card`, `input`, `select`, `table`, `dialog`, `tabs`, `skeleton`.
4. Halaman satu per satu: login → dashboard → inventory → barcode → borrow → reports → settings.
   Setelah tiap halaman: bandingkan dengan `reference/png/NN-*.png` (light & dark, desktop & mobile).
5. Print styles (label barcode mm, laporan A4) + bersih-bersih sisa glass/float.
6. Verifikasi akhir: `npx tsc --noEmit`, `npm run lint`, `npm run build` harus hijau.

## Definisi selesai

- Tampilan 1440×880 dan 390×844 sesuai screenshot referensi (struktur, ukuran, warna, tipografi).
- Light & dark konsisten, tidak ada teks berkontras rendah.
- Semua fungsi lama tetap jalan (login, tambah/edit barang, pindah barang, pinjam/kembali,
  cetak barcode, export & cetak laporan, ganti tema, kelola user).
- Tidak ada error build/TypeScript, tidak ada hydration warning baru.
- Di akhir, laporkan: file yang diubah, komponen baru, dan screenshot/hasil pengecekan per halaman.
