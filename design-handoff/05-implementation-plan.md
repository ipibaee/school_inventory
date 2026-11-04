# 05 · Implementation Plan

Urutan kerja yang disarankan. Setiap langkah harus **build-able** sebelum lanjut.
Repo: Next.js 16 (App Router) · Tailwind v4 · shadcn/ui · next-themes · Prisma.

---

## Aturan global

1. **Jangan ubah** `prisma/`, `src/actions/`, `src/auth.ts`, `src/auth.config.ts`, `src/middleware.ts`,
   `src/lib/`, `src/hooks/` — kecuali menambah helper presentasional.
2. Jangan menambah dependency baru. Semua ikon memakai `lucide-react` yang sudah ada.
3. Jangan menambah route. Redesign hanya mengubah tampilan route yang sudah ada.
4. Semua warna/ukuran dari token (`bg-surface`, `text-ink`, `border-line`, `bg-brand`, …).
   Hardcode hex hanya untuk: sidebar (`#1B3364`), panel navy login (`#7FA6FF`, `#A6B7D0`, `#8296B4`),
   viewfinder kamera (`#101B2E→#050912`, `#8AB4F8`), dan kertas label (`#EEF3F9`, `#C9D6E5`).
5. Mobile-first: kelas default = mobile, `lg:` = desktop. Jangan memakai `md:` untuk shell
   (breakpoint shell = `lg`, 1024px).
6. Aplikasi harus tetap bisa di-print (label barcode, laporan) dan tetap mendukung dark mode.

---

## Langkah 1 — Fondasi: font & token

**1.1 `src/app/layout.tsx`** — ganti font:

```tsx
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

// <html lang="id" className={jakarta.variable}>
// <body className="font-sans">
```

Ubah juga `lang="en"` → `lang="id"`, dan `metadata.title` → `"HIKA Inventaris · SMK HKTI 2"`.

**1.2 `src/app/globals.css`** — ganti seluruh isi dengan `design-handoff/tokens.css`.
Yang **harus dihapus**: `glassmorphism`, `@keyframes float/float-reverse`, `bg-radial`, `backdrop-blur`
manual, `-.dark` print hack lama. Yang **dipertahankan**: `@media print`, `scrollbar-none`.

**1.3 Cek** `npm run dev` → halaman login masih tampil (walau berantakan), tidak ada error CSS.

---

## Langkah 2 — Shell aplikasi

**2.1 `src/components/layout/AuthenticatedLayoutClient.tsx`** — tulis ulang jadi:

```tsx
<div className="flex h-screen w-full overflow-hidden bg-app">
  {/* Sidebar desktop: 264px, hanya lg ke atas */}
  <aside className="hidden w-[264px] shrink-0 lg:flex print:hidden">
    <Sidebar user={user} settings={settings} />
  </aside>

  {/* Area konten */}
  <div className="flex min-w-0 flex-1 flex-col">
    <main className="flex-1 overflow-y-auto px-4 pb-24 pt-0 lg:px-8 lg:pb-8 lg:pt-[26px] print:overflow-visible print:p-0">
      <div className="mx-auto w-full max-w-[1600px]">{children}</div>
    </main>
  </div>

  <MobileBottomNav user={user} />
</div>
```

Hapus: dua div glow `animate-float`, `bg-radial`, state `isCollapsed` (desain tidak punya mode collapse),
dan `<Header />` global (diganti `PageHeader` per halaman pada Langkah 4).

**2.2 `Sidebar.tsx`** — struktur baru: brand → label grup → nav list → spacer → user card.
Hapus tombol collapse/chevron, hapus warna `text-sky-500` dll. Pakai `NavItem` (§1 komponen).
Lebar penuh (`w-full`), padding `24px 18px`, `bg-navy`, teks putih.

**2.3 `MobileBottomNav.tsx`** — 5 tab, tinggi 62px, `bg-surface border-t border-line`,
ikon 19 + label 9, aktif `brand`. Sembunyikan saat `print`.

**2.4 `Header.tsx`** → jadikan `PageHeader.tsx`:

```tsx
export function PageHeader({ title, subtitle, actions }: {
  title: string; subtitle?: string; actions?: React.ReactNode;
})
```

Konten: judul 27/800 ls −0.8, sub 13.5 `muted`, actions `flex gap-2.5`.
Hapus `Header` dari layout; panggil `PageHeader` di setiap halaman (desktop).
Di mobile, informasi yang sama ditampilkan lewat `MobileAppBar` (buat komponen baru
`src/components/layout/MobileAppBar.tsx` dengan props `title`, `subtitle`, `back?`, `actions?`).

**2.5** Cek: semua route masih bisa dibuka, sidebar & bottom nav tampil benar di light/dark.

---

## Langkah 3 — Primitif UI (shadcn)

| File | Perubahan |
| --- | --- |
| `ui/button.tsx` | variants: `primary`, `secondary`, `soft`, `danger`, `ghost`, `icon`; size default h-10 px-[18px] text-[13.5px] font-bold rounded-[10px], `sm` untuk mobile |
| `ui/badge.tsx` | pill + dot; variants `mint`, `rose`, `amber`, `brand`, `neutral` |
| `ui/card.tsx` | `rounded-2xl border border-line bg-surface shadow-none` (hapus glass & backdrop blur) |
| `ui/input.tsx`, `ui/textarea.tsx` | `h-10 rounded-[10px] border-line bg-surface px-3.5 text-[13px] placeholder:text-muted-ink focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/25` |
| `ui/select.tsx` | trigger sama seperti input + chevron 12px |
| `ui/dialog.tsx`, `ui/alert-dialog.tsx` | overlay `bg-[#0B1B2E]/60`, content `rounded-[18px] border-line bg-surface shadow-dialog p-[22px]` |
| `ui/table.tsx` | header `bg-surface-2` + `text-[10px] font-bold uppercase tracking-[.5px] text-muted-ink`, row `border-b border-line px-5 py-[11px]` |
| `ui/tabs.tsx` | underline & segmented style (§10 komponen) |
| `ui/skeleton.tsx` | `bg-surface-2` |
| `ui/sonner.tsx` | kartu `surface` border `line` radius 12 |
| `ui/avatar.tsx` | fallback `bg-brand` teks putih 13/800 |

Hapus seluruh pemakaian `glass-card/glass-panel/glass-input/glass-button` (19 tempat di 9 file),
ganti dengan `panel` / `bg-navy` / input standar.

---

## Langkah 4 — Halaman (satu per satu, verifikasi visual tiap selesai)

Urutan yang disarankan (paling banyak dipakai lebih dulu):

1. `/login` → `login/page.tsx`, `auth/LoginForm.tsx`
2. `/dashboard` → `dashboard/page.tsx` (KPI + aktivitas + stok)
3. `/inventory` → `inventory/page.tsx` (+ `ItemForm`, `InventoryActions`, `MoveItemDialog`, `ScanDialog`)
4. `/inventory/barcode` → `barcode/page.tsx`, `BarcodeGenerator.tsx`
5. `/borrow` → `borrow/page.tsx`, `BorrowForm`, `ReturnForm`, `ActiveLoans`
6. `/reports` → `reports/page.tsx`, `components/reports/*`
7. `/settings` → `settings/page.tsx`, `SchoolProfileForm`, `PrinterSettingsForm`, `UserManagement`
8. Polish: `loading.tsx`, empty states, toast, focus ring

Untuk setiap halaman:

- Desktop: `PageHeader` + blok isi sesuai `04-screens.md`.
- Mobile: `MobileAppBar` + konten padding `0 16px 12px` + bottom nav; tabel → list kartu.
- Setelah selesai: cek dengan Playwright/DevTools pada 1440×880 dan 390×844, light + dark.
  Bandingkan dengan `reference/png/NN-*.png`.

---

## Langkah 5 — Print & artefak

- `BarcodeGenerator`: pastikan area label memakai `mm` dan `@media print` menyembunyikan chrome.
- `reports`: kop cetak (`ReportHeader`) memakai font & warna sama; paksa hitam-putih saat print.
- `@page { size: A4; margin: 12mm; }` bila belum ada.

---

## Langkah 6 — Bersih-bersih

- Hapus `src/components/ui/MouseParallaxBackground.tsx` bila tidak dipakai lagi.
- Hapus keyframes `float` / `animate-float` / `bg-radial` yang tersisa.
- Pastikan tidak ada `backdrop-blur` / `bg-white/xx` acak di luar daftar hardcode yang diizinkan.
- `npx tsc --noEmit` · `npm run lint` · `npm run build` hijau.

---

## Checklist acceptance

**Umum**

- [ ] `npm run build` sukses, tidak ada hydration warning baru.
- [ ] Light & dark sama-sama benar; tidak ada teks yang tidak terbaca (kontras ≥ 4.5:1 untuk body).
- [ ] Tidak ada glassmorphism/backdrop-blur/blob/parallax.
- [ ] Font Plus Jakarta Sans ter-load (cek Network), fallback aman.
- [ ] 1440×880 dan 390×844 tidak ada scroll horizontal pada body.

**Shell**

- [ ] Sidebar 264px, navy, item aktif `#1B3364`, tanpa tombol collapse.
- [ ] Topbar per halaman: judul 27px + sub 13.5px + actions rata kanan.
- [ ] Bottom nav 62px, 5 tab, aktif `brand`, tidak muncul di desktop.
- [ ] Konten tidak tertutup bottom nav (padding bawah ≥ 88px di mobile).

**Halaman**

- [ ] Login: split 660/780, panel brand navy, form 346px, semua state.
- [ ] Dasbor: 4 KPI, aktivitas, stok hampir habis, "LIVE" badge.
- [ ] Inventaris: filter lokasi, tabel 7 kolom, pagination, badge status, aksi edit.
- [ ] Barcode: panel printer 326px, pratinjau grid label, print bersih (ukuran mm benar).
- [ ] Peminjaman: tab Pinjam/Kembalikan, keranjang qty ±, peminjaman aktif.
- [ ] Laporan: 4 tab, 3 filter, ringkasan + total, footer cetak.
- [ ] Pengaturan: identitas, logo, tema (3 opsi), sesi; simpan berfungsi.
- [ ] Scan: dialog overlay (desktop) & fullscreen (mobile), kamera start/stop benar.

**Aksesibilitas**

- [ ] Semua input punya `<label>`/`aria-label`; ikon-only button punya `aria-label`.
- [ ] Fokus terlihat (`ring-2 ring-brand/40`) di semua kontrol interaktif.
- [ ] Badge status tidak hanya warna — selalu ada teks.
- [ ] Tombol ≥ 44×44px di mobile (kecuali ikon inline non-interaktif).

---

## Cara verifikasi cepat

```bash
npm run dev            # buka http://localhost:3000
npm run lint
npx tsc --noEmit
npm run build
```

Banduan visual (desktop 1440×880, light):

| Halaman | File referensi |
| --- | --- |
| Login | `reference/png/03-login-light.png` |
| Dasbor | `reference/png/02-dasbor-light.png` |
| Inventaris | `reference/png/04-inventaris-light.png` |
| Barcode | `reference/png/05-cetak-barcode-light.png` |
| Peminjaman | `reference/png/06-peminjaman-light.png` |
| Laporan | `reference/png/07-laporan-light.png` |
| Pengaturan | `reference/png/08-pengaturan-light.png` |
| Scan | `reference/png/16-scan-kamera-light.png` |
| Mobile (semua) | `reference/png/18-*.png` … `33-*.png` |

Markup acuan per halaman (Tailwind, hasil export dari desain, ukuran px asli):
`reference/html/desktop-light-1.html`, `desktop-light-2.html`, `mobile-light-1.html`,
`mobile-light-2.html`, `design-system.html`. **Gunakan sebagai acuan ukuran & struktur —
tulis ulang sebagai komponen React, jangan copy-paste div statis.**
