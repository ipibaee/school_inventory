# Redesign handoff — baca ini dulu

UI aplikasi ini sudah didesain ulang. Semua spesifikasi ada di **`design-handoff/`**.

**Mulai dari:** [`design-handoff/ANTIGRAVITY-PROMPT.md`](./design-handoff/ANTIGRAVITY-PROMPT.md)

| File | Isi |
| --- | --- |
| `design-handoff/ANTIGRAVITY-PROMPT.md` | instruksi utama untuk AI agent (tugas, aturan, urutan kerja) |
| `design-handoff/01-design-tokens.md` | token warna, tipografi, radius, spacing, ikon |
| `design-handoff/tokens.css` | isi pengganti tema di `src/app/globals.css` |
| `design-handoff/02-layout-shells.md` | shell desktop (sidebar 264px) & mobile (app bar + bottom nav 62px) |
| `design-handoff/03-components.md` | spesifikasi komponen + resep kelas Tailwind |
| `design-handoff/04-screens.md` | isi tiap route (`/login`, `/dashboard`, …) |
| `design-handoff/05-implementation-plan.md` | langkah kerja + checklist acceptance |
| `design-handoff/ALL-IN-ONE.md` | semua file di atas digabung jadi satu |
| `design-handoff/reference/png/` | 34 screenshot desain (light/dark, desktop/mobile) |
| `design-handoff/reference/html/` | export HTML+Tailwind sebagai acuan ukuran & markup |
| `design-handoff/spec/` | layer tree detail per layar |

Ringkas: ganti gaya glassmorphism lama → flat institutional SaaS, font Plus Jakarta Sans,
aksen `#2B4EFF`, sidebar navy `#0A1730`. Fitur, route, dan server action **tidak berubah**.

---

## V2 — Modul Pengadaan BOS / BAP (fitur baru)

- Prompt: `design-handoff/v2-pengadaan-bos/ANTIGRAVITY-V2.md`
- Semua dokumen digabung: `design-handoff/v2-pengadaan-bos/ALL-IN-ONE-V2.md`
- Referensi: `v2-pengadaan-bos/reference/png/` (15 gambar), `reference/html/`, `spec/`

Isi: 8 layar (7 dengan versi dark), model Prisma baru, alur peran & state machine,
server actions, spesifikasi cetak A4 + QR verifikasi publik.
