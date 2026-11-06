# V2 · Modul Pengadaan BOS + BAP + Dasbor Eksekutif

Paket handoff untuk **fitur baru** (bukan redesign halaman lama). Berisi 8 layar desain
(7 dengan varian gelap) beserta model data, alur, dan rencana implementasi untuk repo
`school_inventory`.

Perbedaan dengan paket v1 (`design-handoff/`): v1 = *restyling* halaman yang sudah ada,
**v2 = fitur baru** → butuh schema Prisma, route, server action, dan halaman baru.

---

## Baca berurutan

| # | File | Isi |
| --- | --- | --- |
| 1 | [`ANTIGRAVITY-V2.md`](./ANTIGRAVITY-V2.md) | **instruksi utama** untuk AI agent |
| 2 | [`01-screens.md`](./01-screens.md) | 8 layar: route, struktur, isi, state, versi gelap |
| 3 | [`02-data-model.md`](./02-data-model.md) | model Prisma baru + relasi ke model lama + counter nomor BAP |
| 4 | [`03-roles-flows.md`](./03-roles-flows.md) | peran, matriks izin, state machine, alur QR |
| 5 | [`04-server-actions.md`](./04-server-actions.md) | daftar server action, validasi, transaksi stok |
| 6 | [`05-print-and-qr.md`](./05-print-and-qr.md) | layout A4 (mm/pt), kop, tanda tangan, QR & verifikasi publik |
| 7 | [`06-components.md`](./06-components.md) | komponen baru + yang bisa dipakai ulang dari v1 |
| 8 | [`07-implementation-plan.md`](./07-implementation-plan.md) | urutan kerja + checklist acceptance |

**Referensi visual:** `reference/png/` (15 gambar) · markup acuan: `reference/html/` ·
layer tree lengkap: `spec/`.

## Layar → route

| Layar | Route | Peran | File desain |
| --- | --- | --- | --- |
| Pengajuan Pengadaan BOS | `/procurement` | Admin TU / Teknisi | `01-pengadaan-bos-light.png`, `09-…-dark.png` |
| Arsip BAP Pengadaan | `/procurement/archive` | Admin, Guru, Kepala Sekolah | `02-…`, `10-…` |
| Dokumen BAP (A4, siap cetak) | `/procurement/[id]` | semua peran terkait | `03-bap-dokumen-a4.png` |
| Pemeriksaan Barang (mobile) | `/procurement/[id]/check` | Guru Pengawas | `05-…`, `12-…` |
| Modal pengesahan berhasil | komponen di `/check` | Guru Pengawas | `06-…`, `13-…` |
| Dasbor Monitoring Eksekutif | `/executive` | Kepala Sekolah | `04-…`, `11-…` |
| Dasbor Eksekutif (mobile) | `/executive` | Kepala Sekolah | `07-…`, `14-…` |
| Verifikasi publik via QR | `/verify/[token]` | publik (tanpa login) | `08-…`, `15-…` |

## Prinsip

1. **Gaya visual mengikuti v1** (clean institutional SaaS): kartu `surface` + border 1px `line`,
   radius 16 (desktop) / 14 (mobile), aksen `brand #2B4EFF`, font Plus Jakarta Sans.
   Token & utility ada di `design-handoff/tokens.css`.
2. **Tema gelap** bukan desain terpisah — cukup `next-themes` + `dark:`; semua warna dari token.
   Warna hardcode hanya untuk sidebar (`#1B3364`/`#3C4043`) dan overlay modal.
3. Fitur baru tidak boleh merusak modul lama (Inventaris, Peminjaman, Barcode, Laporan).
4. Semua angka di desain (18 unit, 027/BAP-BOS/XI/2026, 1.428 aset) adalah **contoh** —
   harus berasal dari database, bukan hardcode.
