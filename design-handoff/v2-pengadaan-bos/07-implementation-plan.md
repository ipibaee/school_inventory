# 07 · Rencana implementasi & checklist

Urutan kerja yang bisa dieksekusi bertahap, tiap fase harus hijau (`tsc`, `lint`, `build`)
sebelum lanjut.

---

## Aturan umum

- Modul lama **tidak diubah** selain: entri menu "Pengadaan BOS", role `HEADMASTER`,
  relasi balik di `Item`/`User`, dan pengecualian `/verify` di middleware.
- Semua teks UI bahasa Indonesia, format tanggal `id-ID`, mata uang tidak ditampilkan di modul ini.
- Warna & ukuran mengikuti `tokens.css` + spesifikasi di `01-screens.md`.
- Jangan menambah library chart; grafik realisasi dibuat dengan flex (lihat `06-components.md`).
- Nomor dokumen, QR, dan stok **hanya** berubah lewat server action, tidak pernah dari client.

---

## Fase 1 — Fondasi data (½ hari)

1. `prisma/schema.prisma`: tambah `Procurement`, `ProcurementItem`, `ProcurementLog`,
   `VerificationVisit`, `Counter`, relasi balik di `Item` & `User` (lihat `02-data-model.md`).
2. `npx prisma migrate dev --name procurement_bos` + `npx prisma generate`.
3. `src/lib/format.ts` (format angka/tanggal `Asia/Jakarta`), `src/lib/bap-number.ts`,
   `src/lib/guard.ts`, `src/lib/qr.ts`.
4. Seed demo `prisma/seed-procurement.js` (opsional tapi sangat membantu verifikasi visual).
5. Cek: `npx prisma studio` menampilkan tabel baru; aplikasi lama tetap jalan.

## Fase 2 — Navigasi & peran (½ hari)

1. `src/auth.config.ts`: tambah `/procurement` & `/executive` ke daftar protected,
   redirect `/executive` untuk non-HEADMASTER, biarkan `/verify` publik.
2. `src/components/layout/Sidebar.tsx`: item "Pengadaan BOS" (`clipboard-list`) setelah Inventaris;
   bila role `HEADMASTER`, "Dasbor" mengarah ke `/executive` dan tampilkan "Arsip BAP".
3. Mobile: tautan Pengadaan di sheet menu avatar + akses arsip dari dasbor eksekutif.
4. Cek: menu tampil sesuai role; user lama tidak terganggu.

## Fase 3 — Server action & query (1 hari)

1. `src/actions/procurement.ts` — semua action di `04-server-actions.md`.
2. `src/lib/queries/procurement.ts` — query arsip, ringkasan, detail, verifikasi, eksekutif.
3. Uji dengan `node --experimental-strip-types` atau langsung dari halaman sementara:
   create → addItem → submit → toggleCheck → publish (pastikan stok & item baru terbentuk).
4. Pastikan `publishBap` idempoten-guard: status bukan `SUBMITTED` → error, tidak dobel stok.

## Fase 4 — `BapDocument` + cetak (1 hari)

1. `BapDocument.tsx` (pure, ukuran pt/mm sesuai `05-print-and-qr.md`).
2. `QrBox.tsx` + `bapQrSvg`.
3. `BapPrintButton.tsx` (`react-to-print`) + CSS `@page` / `.sheet` di `globals.css`.
4. Halaman `/procurement/[id]`: header + toolbar `no-print` + kertas + riwayat.
5. Cek cetak: Chrome → Print → A4, margin "None", **Background graphics ON** →
   dokumen pas 1 halaman, garis tabel utuh, QR ≥ 19mm, tidak ada baris terbelah.

## Fase 5 — Halaman pengajuan (1,5 hari)

1. `/procurement/page.tsx` (server) + `ProcurementForm` (client, react-hook-form + zod).
2. `ProcurementMetaCard`, `ApprovalSteps`, `ProcurementItemsTable`, `WarehouseQuickPick`.
3. Aksi: simpan draft (autosave/optimistis), tambah dari gudang (dialog pilih item),
   tambah barang baru (dialog), edit/hapus baris, kirim ke guru pengawas (konfirmasi).
4. Tampilkan nomor BAP preview dari `peekNextBapNumber` selama `DRAFT`.
5. Cek: form kosong, validasi, submit ganda, periode sudah ada.

## Fase 6 — Arsip (1 hari)

1. `/procurement/archive/page.tsx`: `MonthTabs`, `FilterSummary`, `ArchiveTable`,
   pagination, filter via `searchParams` (`?year=&month=&q=&page=`).
2. Aksi per baris: `Cetak BAP` → `/procurement/[id]` (auto-open print), `Detail` → dokumen draft.
3. `Ekspor Rekap`: unduh CSV/XLSX sederhana (boleh CSV dulu) — atau nonaktifkan tombolnya
   bila belum siap, jangan dibiarkan mati.
4. Mobile: `BapArchiveCard` list.

## Fase 7 — Pemeriksaan guru (1 hari)

1. `/procurement/[id]/check/page.tsx`: guard role + hanya inspector yang ditunjuk.
2. `ChecklistItemCard` (toggle → `toggleItemChecked` dengan `useOptimistic`),
   `ChecklistProgressBar`, catatan pemeriksa (`saveInspectorNote`, debounce 800ms).
3. Tombol "Sahkan & Terbitkan BAP" disabled sampai semua `checked`, lalu `publishBap`.
4. `PublishSuccessDialog` (QR, detail verifikasi, 2 tombol) → redirect ke dokumen.
5. Cek: refresh di tengah jalan (state tersimpan), double-tap tombol (tidak dobel publish).

## Fase 8 — Dasbor eksekutif (1 hari)

1. `/executive/page.tsx` (guard `HEADMASTER`): 4 `ExecutiveKpiCard`,
   `MonthlyRealizationChart`, `PendingBatchList`, `Cetak Laporan Semester`.
2. Mobile: KPI 2×2, kartu BAP terakhir, `BatchArchiveCard`, bottom nav 3 tab.
3. "Cetak Laporan Semester" → halaman cetak ringkas (A4 landscape/portrait) memakai pola print
   yang sama dengan BAP (kop + tabel realisasi + tanda tangan Kepala Sekolah).

## Fase 9 — Verifikasi publik (½ hari)

1. `/verify/[token]/page.tsx` (tanpa auth, `force-dynamic`, `robots: noindex`).
2. `VerifyDocumentCard`, state tidak ditemukan, logging kunjungan via API route.
3. Uji: token valid (BAP sah), token acak, token BAP yang belum disahkan (harus tidak ditemukan).
4. Cek QR dari hasil cetak (scan dengan HP) mengarah ke halaman yang benar.

## Fase 10 — Polish (½ hari)

1. Tema gelap: cek semua halaman baru dengan toggle — pastikan tidak ada teks gelap di atas gelap.
2. Empty state + skeleton loading (`loading.tsx`) untuk tiap route baru.
3. Aksesibilitas: label input, `aria-checked` pada checklist, fokus ring, `aria-label` ikon.
4. `npx tsc --noEmit` · `npm run lint` · `npm run build`.
5. Regresi modul lama: dashboard, inventaris, barcode, peminjaman, laporan, pengaturan.

---

## Daftar file (perkiraan)

```
prisma/schema.prisma                                  (+ model baru)
prisma/seed-procurement.js                            (baru, opsional)
src/lib/bap-number.ts                                 (baru)
src/lib/qr.ts                                         (baru)
src/lib/format.ts                                     (baru)
src/lib/guard.ts                                      (baru)
src/lib/queries/procurement.ts                        (baru)
src/actions/procurement.ts                            (baru)
src/app/(authenticated)/procurement/page.tsx          (baru)
src/app/(authenticated)/procurement/archive/page.tsx  (baru)
src/app/(authenticated)/procurement/[id]/page.tsx     (baru)
src/app/(authenticated)/procurement/[id]/check/page.tsx (baru)
src/app/(authenticated)/executive/page.tsx            (baru)
src/app/verify/[token]/page.tsx                       (baru, publik)
src/app/api/verify/[token]/visit/route.ts             (baru)
src/components/procurement/*                          (14 komponen, lihat 05 & 06)
src/components/layout/Sidebar.tsx                     (edit: menu + role)
src/auth.config.ts                                    (edit: proteksi route)
src/app/globals.css                                   (edit: @page + .sheet print)
```

---

## Checklist acceptance

### Fungsional

- [ ] Admin membuat pengajuan periode baru, menambah 2 barang dari gudang + 2 barang baru,
      menyimpan draft, lalu mengirim ke guru pengawas.
- [ ] Nomor BAP muncul (`027/BAP-BOS/XI/2026`) **hanya** setelah dikirim; QR token terbuat.
- [ ] Guru membuka `/procurement/[id]/check`, mencentang item satu per satu (state tersimpan
      saat refresh), mengisi catatan, tombol sahkan baru aktif saat 4/4.
- [ ] Sahkan → stok bertambah di Inventaris, barang BARU muncul sebagai item baru di Gudang,
      `Transaction` tipe `IN` tercatat dengan catatan nomor BAP.
- [ ] BAP muncul di arsip dengan badge *Terverifikasi Sah*, bisa dicetak, dan PDF/NYA
      menampilkan QR yang bisa discan.
- [ ] Scan QR → `/verify/{token}` menampilkan data benar tanpa login; token salah →
      "Dokumen tidak ditemukan"; kunjungan tercatat.
- [ ] Kepala Sekolah melihat dasbor eksekutif (KPI, realisasi 11 bulan, batch menunggu),
      bisa membuka pratinjau BAP, dan mencetak rekap semester.
- [ ] Periode ganda ditolak; user tanpa role ditolak di server (bukan hanya UI).

### Visual

- [ ] Desktop 1440×880: sidebar 264, main padding 26/32, KPI/kartu radius 16.
- [ ] Mobile 390×844: app bar ±59, bottom nav 62, action bar di atas nav, bukan menutupi konten.
- [ ] Tabel arsip & pengadaan: header dan isi **rata per kolom** (pakai `table-fixed`/`colgroup`).
- [ ] Light & dark sesuai `reference/png/01…15`; tidak ada teks `#0B1B2E` di latar gelap.
- [ ] Dokumen A4 tetap putih di kedua tema, cetak 1 halaman A4.
- [ ] Badge status konsisten: mint = sah, amber = menunggu, neutral = draft, rose = tolak.

### Teknis

- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` hijau.
- [ ] Tidak ada `any` baru di action publik; validasi zod di semua input.
- [ ] `publishBap` atomik (uji dengan dua tab bersamaan → satu sukses, satu `INVALID_STATUS`).
- [ ] `.env` baru: `NEXTAUTH_URL` dipakai untuk isi QR (dokumentasikan di README deploy).
- [ ] `middleware` tidak memblokir `/verify/**`.

---

## Skenario uji manual (ringkas)

| # | Skenario | Hasil yang diharapkan |
| --- | --- | --- |
| 1 | Buat BAP periode yang sudah ada | toast "BAP untuk periode ini sudah ada", tidak ada data ganda |
| 2 | Kirim draft tanpa barang | tombol disabled + pesan "Tambahkan minimal satu barang" |
| 3 | Guru lain membuka `/check` BAP bukan tugasnya | 403 / redirect arsip |
| 4 | Publish dua kali (double click) | publish kedua gagal, stok tidak dobel |
| 5 | Cetak BAP status SUBMITTED | watermark "MENUNGGU PENGESAHAN" muncul, QR belum aktif |
| 6 | Scan QR BAP SUBMITTED | halaman "Dokumen tidak ditemukan" |
| 7 | Buka `/verify` di mode gelap | halaman publik tetap terbaca (token tema) |
| 8 | Hapus item inventaris yang dipakai BAP lama | dokumen lama tetap utuh (snapshot nama/spesifikasi) |
| 9 | Buka `/executive` sebagai ADMIN | redirect ke `/dashboard` |
| 10 | Refresh di tengah checklist | centang & catatan tetap tersimpan |
