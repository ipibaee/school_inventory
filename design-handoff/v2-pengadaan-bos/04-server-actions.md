# 04 · Server actions & query

Semua di `src/actions/procurement.ts` (+ `src/lib/bap.ts` untuk helper). Pola mengikuti
action yang sudah ada (`"use server"`, `auth()`, `revalidatePath`, return `{ ok, error }`
atau `throw`, dan `zod` untuk validasi).

---

## 1. Bentuk hasil standar

```ts
export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
```

Helper sesi/role di `src/lib/guard.ts`:

```ts
export async function requireUser(roles?: Role[]) {
  const session = await auth();
  if (!session?.user) throw new Error("UNAUTHENTICATED");
  if (roles && !roles.includes(session.user.role as Role)) throw new Error("FORBIDDEN");
  return session.user as { id: string; role: Role; name: string | null };
}
```

## 2. Validasi (zod)

```ts
export const procurementMetaSchema = z.object({
  periodMonth: z.coerce.number().int().min(1).max(12),
  periodYear: z.coerce.number().int().min(2020).max(2100),
  source: z.enum(["BOS_REGULER", "BOSP"]),
  inspectorId: z.string().cuid(),
  note: z.string().max(500).optional().or(z.literal("")),
});

export const itemSchema = z.object({
  kind: z.enum(["BARU", "LAMA"]),
  itemId: z.string().cuid().optional(),
  name: z.string().min(2).max(120),
  specification: z.string().max(160).optional().or(z.literal("")),
  categoryName: z.string().max(60).optional().or(z.literal("")),
  quantity: z.coerce.number().int().min(1).max(9999),
  unit: z.enum(["Unit", "Roll", "Set", "Box", "Buah", "Lembar"]).default("Unit"),
  barcode: z.string().max(40).optional().or(z.literal("")),
});

export const checkItemSchema = z.object({
  itemId: z.string().cuid(),
  checked: z.boolean(),
  condition: z.enum(["BAIK", "RUSAK", "KURANG"]).default("BAIK"),
});
```

## 3. Daftar action

### 3.1 `createProcurement(input)`

- Role: `ADMIN`, `TECHNICIAN`.
- Validasi `procurementMetaSchema`.
- Tolak bila periode sudah ada (`unique_period`).
- `status: "DRAFT"`, `createdById: user.id`, log `CREATED`.
- Revalidate `/procurement`.

### 3.2 `updateProcurementMeta(id, input)`

- Role: `ADMIN`, `TECHNICIAN`; hanya `status = DRAFT` atau `REJECTED`.
- Boleh ubah bulan/tahun (cek unik), sumber, guru pengawas, catatan.
- Log `UPDATED`.

### 3.3 `addItemFromWarehouse(procurementId, itemId, quantity)`

- Role: `ADMIN`, `TECHNICIAN`.
- Ambil `Item` + `Category`; simpan **snapshot** `name`, `specification`, `categoryName`, `unit`.
- `kind: "LAMA"`, `itemId`, `barcode` dari item.
- Tolak bila item yang sama sudah ada di pengajuan (tambahkan qty atau beri error — pilih:
  increment qty pada baris yang ada).

### 3.4 `addNewItem(procurementId, input)`

- Role: `ADMIN`, `TECHNICIAN`.
- `kind: "BARU"`, `itemId: null`, `barcode` opsional (boleh kosong → digenerate saat publish).

### 3.5 `updateItem(itemId, patch)` / `removeItem(itemId)`

- Hanya saat `DRAFT`/`REJECTED`.
- `removeItem` → log `ITEM_REMOVED`.

### 3.6 `submitProcurement(id)`

```ts
export async function submitProcurement(id: string) {
  const user = await requireUser(["ADMIN", "TECHNICIAN"]);
  return prisma.$transaction(async (tx) => {
    const p = await tx.procurement.findUnique({ where: { id }, include: { items: true } });
    if (!p) return { ok: false, error: "Pengajuan tidak ditemukan" };
    if (p.status !== "DRAFT" && p.status !== "REJECTED") return { ok: false, error: "Status tidak valid" };
    if (p.items.length === 0) return { ok: false, error: "Tambahkan minimal satu barang" };
    if (!p.inspectorId) return { ok: false, error: "Pilih guru pengawas" };

    const bapNumber = p.bapNumber ?? (await takeNextBapNumber(tx, p.periodYear, p.periodMonth));
    const qrToken = p.qrToken ?? crypto.randomBytes(16).toString("hex");

    const updated = await tx.procurement.update({
      where: { id },
      data: {
        bapNumber, qrToken, status: "SUBMITTED", submittedAt: new Date(),
        totalItems: p.items.length,
        totalUnits: p.items.reduce((a, i) => a + i.quantity, 0),
      },
    });
    await tx.procurementLog.create({ data: { procurementId: id, action: "SUBMITTED", actorId: user.id } });
    return { ok: true, data: { bapNumber: updated.bapNumber } };
  }).then((r) => { revalidatePath("/procurement"); revalidatePath("/reports"); return r; });
}
```

### 3.7 `toggleItemChecked(itemId, checked, condition?)`

- Role: `TEACHER` (hanya inspector yang ditunjuk) atau `ADMIN` bila diminta.
- Update `checked`, `checkedAt`, `checkedById`, `condition`.
- Log `CHECKED`. Revalidate halaman check.

### 3.8 `saveInspectorNote(procurementId, note)`

- Role: `TEACHER`; simpan ke `note` (gabung dengan catatan pengadaan) atau field terpisah
  `inspectorNote` bila ingin dipisah — desain menampilkan satu kolom catatan.

### 3.9 `publishBap(id)` — inti

```ts
export async function publishBap(id: string) {
  const user = await requireUser(["TEACHER"]);
  const result = await prisma.$transaction(async (tx) => {
    const p = await tx.procurement.findUnique({
      where: { id },
      include: { items: true, createdBy: true },
    });
    if (!p) throw new Error("NOT_FOUND");
    if (p.status !== "SUBMITTED") throw new Error("INVALID_STATUS");
    if (p.items.some((i) => !i.checked)) throw new Error("ITEMS_NOT_ALL_CHECKED");

    const gudang =
      (await tx.location.findFirst({ where: { name: { equals: "Gudang", mode: "insensitive" } } })) ??
      (await tx.location.create({ data: { name: "Gudang" } }));

    for (const it of p.items) {
      if (it.kind === "LAMA" && it.itemId) {
        await tx.transaction.create({
          data: { itemId: it.itemId, type: "IN", quantity: it.quantity, note: `BAP ${p.bapNumber}` },
        });
        await tx.item.update({
          where: { id: it.itemId },
          data: { quantity: { increment: it.quantity } },
        });
      } else {
        const categoryName = it.categoryName?.trim() || "Belum dikategorikan";
        const category =
          (await tx.category.findFirst({ where: { name: categoryName } })) ??
          (await tx.category.create({ data: { name: categoryName } }));
        const barcode = it.barcode?.trim() || String(Date.now()).slice(-5);
        const created = await tx.item.create({
          data: {
            name: it.name,
            barcode,
            specification: it.specification ?? null,
            quantity: it.quantity,
            minStock: 1,
            categoryId: category.id,
            locationId: gudang.id,
          },
        });
        await tx.transaction.create({
          data: { itemId: created.id, type: "IN", quantity: it.quantity, note: `BAP ${p.bapNumber}` },
        });
        await tx.procurementItem.update({ where: { id: it.id }, data: { itemId: created.id } });
      }
    }

    const updated = await tx.procurement.update({
      where: { id },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
        verifiedById: user.id,
        totalUnits: p.items.reduce((a, i) => a + i.quantity, 0),
        totalItems: p.items.length,
      },
    });
    await tx.procurementLog.create({ data: { procurementId: id, action: "PUBLISHED", actorId: user.id } });
    return updated;
  });

  ["/procurement", `/procurement/${id}`, "/reports", "/dashboard", "/inventory"]
    .forEach((p) => revalidatePath(p));
  return { ok: true, data: { bapNumber: result.bapNumber, qrToken: result.qrToken } };
}
```

### 3.10 `rejectBap(id, reason)` · `reopenToDraft(id)`

- `TEACHER` menolak dengan alasan wajib → `REJECTED` + `rejectNote` + log.
- `ADMIN`/`TECHNICIAN` membuka kembali `REJECTED` → `DRAFT` (nomor & token dipertahankan).

### 3.11 Query (bukan action — `src/lib/queries/procurement.ts`)

```ts
export async function listBaps({ year, month, q, page = 1, perPage = 10 }) { ... }
export async function getBapSummary({ year }) { ... }
export async function getProcurementDetail(id) { ... }   // items + users + logs
export async function getBapByToken(token) { ... }        // hanya status VERIFIED
// Untuk blok BOS di /dashboard (bukan dasbor terpisah):
export async function getDashboardBosSummary({ year, month }) { ... }  // BAP terakhir + total unit
export async function getWarehouseSuggestions({ limit = 3 }) { ... }
```

## 4. Format & util

`src/lib/format.ts`:

```ts
export const formatNumberID = (n: number) => new Intl.NumberFormat("id-ID").format(n);
export const formatDateID = (d: Date) =>
  formatInTimeZone(d, "Asia/Jakarta", "dd MMM yyyy", { locale: id });       // "06 Nov 2026"
export const formatLongDateID = (d: Date) =>
  formatInTimeZone(d, "Asia/Jakarta", "EEEE, dd MMMM yyyy", { locale: id }); // "Jumat, 06 November 2026"
export const formatTimeID = (d: Date) => formatInTimeZone(d, "Asia/Jakarta", "HH:mm", { locale: id });
```

## 5. Komponen server vs client

| Halaman | Jenis | Catatan |
| --- | --- | --- |
| `/procurement` | server (fetch data) + client form | form pakai `react-hook-form` + `zodResolver` (sudah ada) |
| `/reports` (tab Arsip BAP) | server | filter lewat `searchParams` (`?tab=bap&year=&month=&q=&page=`), tabel server-rendered |
| `/dashboard` (blok BOS) | server | satu query ringkas, tidak memblok render KPI lain |
| `/procurement/[id]` | server | tombol cetak = client (`react-to-print`) |
| `/procurement/[id]/check` | server + client checklist | toggle optimistis (`useOptimistic`/`useTransition`) |
| `/verify/[token]` | server, **tanpa auth** | `dynamic = "force-dynamic"` |

## 6. Error & pesan

Gunakan pesan bahasa Indonesia yang jelas dan tampilkan lewat toast/sonner:

| Kode | Pesan UI |
| --- | --- |
| `UNAUTHENTICATED` | "Sesi berakhir, silakan masuk kembali." |
| `FORBIDDEN` | "Anda tidak punya akses untuk aksi ini." |
| `INVALID_STATUS` | "Status dokumen sudah berubah. Muat ulang halaman." |
| `ITEMS_NOT_ALL_CHECKED` | "Semua barang harus diperiksa sebelum disahkan." |
| `PERIOD_EXISTS` | "BAP untuk periode ini sudah ada." |
| `NOT_FOUND` | "Dokumen tidak ditemukan." |
