# Handoff desain — baca ini dulu

Semua spesifikasi desain ada di **`design-handoff/`**.
**Acuan utama untuk AI agent:** [`design-handoff/ANTIGRAVITY-MASTER.md`](./design-handoff/ANTIGRAVITY-MASTER.md)

Isi ringkas:

| Bagian | File | Isi |
| --- | --- | --- |
| Instruksi induk | `design-handoff/ANTIGRAVITY-MASTER.md` | seluruh pekerjaan (restyle + modul BOS + revisi final) |
| Design system | `01-design-tokens.md`, `tokens.css`, `02-layout-shells.md`, `03-components.md` | token, shell, komponen |
| Layar lama | `04-screens.md`, `reference/png|html/` | login, dashboard, inventory, barcode, borrow, reports, settings |
| Rencana fase A | `05-implementation-plan.md` | langkah restyle |
| Modul BOS (fase B) | `v2-pengadaan-bos/` | pengadaan, BAP A4 + QR, pemeriksaan, arsip, verifikasi publik |
| Detail layar baru | `v2-pengadaan-bos/01-screens.md` (§9 = template cetak laporan) | 8 layar + 4 template cetak |
| Semua dokumen v2 | `v2-pengadaan-bos/ALL-IN-ONE-V2.md` | gabungan sekali lampir |

**Keputusan final yang wajib dipatuhi**

1. Satu dasbor saja (`/dashboard`) + blok BOS — **tidak ada** dasbor kedua/`/executive`.
2. Arsip BAP = tab di `/reports` — **tidak ada** route arsip terpisah.
3. **Tidak ada role/menu/halaman Kepala Sekolah**, dan **tanda tangannya dihapus** dari semua
   dokumen (BAP & laporan).
4. Format cetak BAP + 4 laporan memakai template A4 resmi (KOP, tabel bergaris, 2 tanda tangan).
