"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { assertRole, assertAuthenticated } from "@/lib/guard"
import { takeNextBapNumber } from "@/lib/bap-number"
import { generateQrToken } from "@/lib/qr"

export type ActionResult<T = any> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

const procurementMetaSchema = z.object({
  periodMonth: z.coerce.number().int().min(1).max(12),
  periodYear: z.coerce.number().int().min(2020).max(2100),
  source: z.string().default("BOS_REGULER"),
  inspectorId: z.string().min(1, "Guru pengawas wajib dipilih"),
  note: z.string().max(500).optional().or(z.literal("")),
})

const warehouseItemInputSchema = z.object({
  procurementId: z.string().min(1),
  itemId: z.string().min(1),
  quantity: z.coerce.number().int().min(1, "Jumlah minimal 1"),
})

const newItemInputSchema = z.object({
  procurementId: z.string().min(1),
  name: z.string().min(2, "Nama barang minimal 2 karakter"),
  specification: z.string().max(200).optional().or(z.literal("")),
  categoryName: z.string().max(100).optional().or(z.literal("")),
  quantity: z.coerce.number().int().min(1, "Jumlah minimal 1"),
  unit: z.string().default("Unit"),
  barcode: z.string().max(50).optional().or(z.literal("")),
})

export async function createProcurement(input: z.infer<typeof procurementMetaSchema>): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await assertRole(["ADMIN", "TECHNICIAN"])
    const parsed = procurementMetaSchema.safeParse(input)
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message || "Input tidak valid" }
    }

    const { periodMonth, periodYear, source, inspectorId, note } = parsed.data

    // Cek duplikasi periode
    const existing = await prisma.procurement.findUnique({
      where: {
        unique_period: {
          periodMonth,
          periodYear,
        },
      },
    })

    if (existing) {
      return {
        ok: false,
        error: `Pengadaan untuk periode ${periodMonth}/${periodYear} sudah ada (Status: ${existing.status}).`,
      }
    }

    const created = await prisma.procurement.create({
      data: {
        periodMonth,
        periodYear,
        source: source || "BOS_REGULER",
        inspectorId,
        note: note || null,
        status: "DRAFT",
        createdById: user.id,
        logs: {
          create: {
            action: "CREATED",
            actorId: user.id,
            note: "Membuat draft pengadaan baru",
          },
        },
      },
    })

    revalidatePath("/procurement")
    revalidatePath("/procurement/archive")
    return { ok: true, data: { id: created.id } }
  } catch (error: any) {
    console.error("Error createProcurement:", error)
    return { ok: false, error: error.message || "Gagal membuat pengadaan" }
  }
}

export async function updateProcurementMeta(
  id: string,
  input: Partial<z.infer<typeof procurementMetaSchema>>
): Promise<ActionResult> {
  try {
    const user = await assertRole(["ADMIN", "TECHNICIAN"])

    const p = await prisma.procurement.findUnique({ where: { id } })
    if (!p) return { ok: false, error: "Dokumen pengadaan tidak ditemukan" }
    if (p.status !== "DRAFT" && p.status !== "REJECTED") {
      return { ok: false, error: "Dokumen yang sudah dikirim tidak dapat diubah" }
    }

    // Jika periode diubah, cek keunikan
    if (
      (input.periodMonth && input.periodMonth !== p.periodMonth) ||
      (input.periodYear && input.periodYear !== p.periodYear)
    ) {
      const month = input.periodMonth ?? p.periodMonth
      const year = input.periodYear ?? p.periodYear
      const exists = await prisma.procurement.findFirst({
        where: {
          periodMonth: month,
          periodYear: year,
          id: { not: id },
        },
      })
      if (exists) {
        return { ok: false, error: `Periode ${month}/${year} sudah digunakan dokumen lain` }
      }
    }

    await prisma.procurement.update({
      where: { id },
      data: {
        ...(input.periodMonth && { periodMonth: input.periodMonth }),
        ...(input.periodYear && { periodYear: input.periodYear }),
        ...(input.source && { source: input.source }),
        ...(input.inspectorId && { inspectorId: input.inspectorId }),
        ...(input.note !== undefined && { note: input.note || null }),
      },
    })

    await prisma.procurementLog.create({
      data: {
        procurementId: id,
        action: "UPDATED",
        actorId: user.id,
        note: "Memperbarui informasi dokumen",
      },
    })

    revalidatePath(`/procurement/${id}`)
    revalidatePath("/procurement")
    return { ok: true }
  } catch (error: any) {
    console.error("Error updateProcurementMeta:", error)
    return { ok: false, error: error.message || "Gagal memperbarui pengadaan" }
  }
}

export async function addItemFromWarehouse(
  input: z.infer<typeof warehouseItemInputSchema>
): Promise<ActionResult> {
  try {
    const user = await assertRole(["ADMIN", "TECHNICIAN"])
    const { procurementId, itemId, quantity } = warehouseItemInputSchema.parse(input)

    const p = await prisma.procurement.findUnique({
      where: { id: procurementId },
      include: { items: true },
    })
    if (!p) return { ok: false, error: "Dokumen pengadaan tidak ditemukan" }
    if (p.status !== "DRAFT" && p.status !== "REJECTED") {
      return { ok: false, error: "Barang hanya dapat ditambah saat berstatus DRAFT" }
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { category: true },
    })
    if (!item) return { ok: false, error: "Barang inventaris tidak ditemukan" }

    // Jika item sudah ada di pengadaan ini, tambahkan quantity
    const existingItem = p.items.find((i) => i.itemId === itemId)
    if (existingItem) {
      await prisma.procurementItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      })
    } else {
      await prisma.procurementItem.create({
        data: {
          procurementId,
          kind: "LAMA",
          itemId: item.id,
          name: item.name,
          specification: item.specification || null,
          categoryName: item.category?.name || "Umum",
          quantity,
          unit: "Unit",
          barcode: item.barcode,
          condition: "BAIK",
          checked: false,
          sortOrder: p.items.length,
        },
      })
    }

    await prisma.procurementLog.create({
      data: {
        procurementId,
        action: "ITEM_ADDED",
        actorId: user.id,
        note: `Menambahkan ${quantity} unit ${item.name} dari gudang`,
      },
    })

    revalidatePath(`/procurement/${procurementId}`)
    revalidatePath("/procurement")
    return { ok: true }
  } catch (error: any) {
    console.error("Error addItemFromWarehouse:", error)
    return { ok: false, error: error.message || "Gagal menambahkan barang dari gudang" }
  }
}

export async function addNewItem(
  input: z.infer<typeof newItemInputSchema>
): Promise<ActionResult> {
  try {
    const user = await assertRole(["ADMIN", "TECHNICIAN"])
    const data = newItemInputSchema.parse(input)

    const p = await prisma.procurement.findUnique({
      where: { id: data.procurementId },
      include: { items: true },
    })
    if (!p) return { ok: false, error: "Dokumen pengadaan tidak ditemukan" }
    if (p.status !== "DRAFT" && p.status !== "REJECTED") {
      return { ok: false, error: "Barang hanya dapat ditambah saat berstatus DRAFT" }
    }

    await prisma.procurementItem.create({
      data: {
        procurementId: data.procurementId,
        kind: "BARU",
        itemId: null,
        name: data.name,
        specification: data.specification || null,
        categoryName: data.categoryName || "Umum",
        quantity: data.quantity,
        unit: data.unit || "Unit",
        barcode: data.barcode || null,
        condition: "BAIK",
        checked: false,
        sortOrder: p.items.length,
      },
    })

    await prisma.procurementLog.create({
      data: {
        procurementId: data.procurementId,
        action: "ITEM_ADDED",
        actorId: user.id,
        note: `Menambahkan barang baru: ${data.name} (${data.quantity} ${data.unit})`,
      },
    })

    revalidatePath(`/procurement/${data.procurementId}`)
    revalidatePath("/procurement")
    return { ok: true }
  } catch (error: any) {
    console.error("Error addNewItem:", error)
    return { ok: false, error: error.message || "Gagal menambahkan barang baru" }
  }
}

export async function removeItem(itemId: string): Promise<ActionResult> {
  try {
    const user = await assertRole(["ADMIN", "TECHNICIAN"])

    const it = await prisma.procurementItem.findUnique({
      where: { id: itemId },
      include: { procurement: true },
    })
    if (!it) return { ok: false, error: "Barang tidak ditemukan" }
    if (it.procurement.status !== "DRAFT" && it.procurement.status !== "REJECTED") {
      return { ok: false, error: "Barang tidak dapat dihapus dari dokumen yang sudah dikirim" }
    }

    await prisma.procurementItem.delete({ where: { id: itemId } })

    await prisma.procurementLog.create({
      data: {
        procurementId: it.procurementId,
        action: "ITEM_REMOVED",
        actorId: user.id,
        note: `Menghapus barang: ${it.name}`,
      },
    })

    revalidatePath(`/procurement/${it.procurementId}`)
    revalidatePath("/procurement")
    return { ok: true }
  } catch (error: any) {
    console.error("Error removeItem:", error)
    return { ok: false, error: error.message || "Gagal menghapus barang" }
  }
}

export async function submitProcurement(id: string): Promise<ActionResult<{ bapNumber: string }>> {
  try {
    const user = await assertRole(["ADMIN", "TECHNICIAN"])

    const result = await prisma.$transaction(async (tx) => {
      const p = await tx.procurement.findUnique({
        where: { id },
        include: { items: true },
      })
      if (!p) throw new Error("Dokumen pengadaan tidak ditemukan")
      if (p.status !== "DRAFT" && p.status !== "REJECTED") {
        throw new Error("Hanya dokumen berstatus DRAFT atau REJECTED yang dapat diajukan")
      }
      if (p.items.length === 0) {
        throw new Error("Tambahkan minimal satu barang belanjaan sebelum mengajukan")
      }
      if (!p.inspectorId) {
        throw new Error("Pilih Guru Pengawas yang bertugas memeriksa barang")
      }

      // Generate nomor BAP dan token QR jika belum ada
      const bapNumber = p.bapNumber ?? (await takeNextBapNumber(tx, p.periodYear, p.periodMonth))
      const qrToken = p.qrToken ?? generateQrToken()

      const totalItems = p.items.length
      const totalUnits = p.items.reduce((acc, it) => acc + it.quantity, 0)

      const updated = await tx.procurement.update({
        where: { id },
        data: {
          bapNumber,
          qrToken,
          status: "SUBMITTED",
          submittedAt: new Date(),
          totalItems,
          totalUnits,
        },
      })

      await tx.procurementLog.create({
        data: {
          procurementId: id,
          action: "SUBMITTED",
          actorId: user.id,
          note: `Mengajukan pengadaan ke Guru Pengawas. No BAP: ${bapNumber}`,
        },
      })

      return updated
    })

    revalidatePath("/procurement")
    revalidatePath("/procurement/archive")
    revalidatePath(`/procurement/${id}`)
    return { ok: true, data: { bapNumber: result.bapNumber! } }
  } catch (error: any) {
    console.error("Error submitProcurement:", error)
    return { ok: false, error: error.message || "Gagal mengajukan dokumen" }
  }
}

export async function toggleItemChecked(
  itemId: string,
  checked: boolean,
  condition: string = "BAIK"
): Promise<ActionResult> {
  try {
    const user = await assertAuthenticated()
    // Guru pengawas atau Admin
    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return { ok: false, error: "Hanya Guru Pengawas yang berwenang memeriksa barang" }
    }

    const item = await prisma.procurementItem.findUnique({
      where: { id: itemId },
      include: { procurement: true },
    })
    if (!item) return { ok: false, error: "Barang tidak ditemukan" }
    if (item.procurement.status !== "SUBMITTED") {
      return { ok: false, error: "Pemeriksaan hanya dapat dilakukan saat status MENUNGGU PEMERIKSAAN" }
    }

    await prisma.procurementItem.update({
      where: { id: itemId },
      data: {
        checked,
        checkedAt: checked ? new Date() : null,
        checkedById: checked ? user.id : null,
        condition: condition || "BAIK",
      },
    })

    revalidatePath(`/procurement/${item.procurementId}/check`)
    revalidatePath(`/procurement/${item.procurementId}`)
    return { ok: true }
  } catch (error: any) {
    console.error("Error toggleItemChecked:", error)
    return { ok: false, error: error.message || "Gagal mencentang pemeriksaan" }
  }
}

export async function saveInspectorNote(
  procurementId: string,
  note: string
): Promise<ActionResult> {
  try {
    const user = await assertAuthenticated()
    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return { ok: false, error: "Hanya Guru Pengawas yang berwenang mengisi catatan" }
    }

    await prisma.procurement.update({
      where: { id: procurementId },
      data: { note },
    })

    revalidatePath(`/procurement/${procurementId}/check`)
    return { ok: true }
  } catch (error: any) {
    console.error("Error saveInspectorNote:", error)
    return { ok: false, error: error.message || "Gagal menyimpan catatan" }
  }
}

export async function publishBap(id: string): Promise<ActionResult<{ bapNumber: string; qrToken: string }>> {
  try {
    const user = await assertRole(["TEACHER", "ADMIN"])

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.procurement.findUnique({
        where: { id },
        include: { items: true },
      })
      if (!p) throw new Error("Dokumen pengadaan tidak ditemukan")
      if (p.status !== "SUBMITTED") throw new Error("Status dokumen bukan MENUNGGU PEMERIKSAAN")

      const unverified = p.items.filter((i) => !i.checked)
      if (unverified.length > 0) {
        throw new Error(`Masih ada ${unverified.length} barang yang belum dicentang/diverifikasi`)
      }

      // Pastikan lokasi Gudang tersedia
      let gudang = await tx.location.findFirst({
        where: { name: { equals: "Gudang", mode: "insensitive" } },
      })
      if (!gudang) {
        gudang = await tx.location.create({
          data: { name: "Gudang", description: "Gudang Utama Inventaris Sekolah" },
        })
      }

      for (const it of p.items) {
        if (it.kind === "LAMA" && it.itemId) {
          // Tambah stok item yang sudah ada
          await tx.transaction.create({
            data: {
              itemId: it.itemId,
              type: "IN",
              quantity: it.quantity,
              note: `Pengadaan Dana BOS - No BAP: ${p.bapNumber}`,
            },
          })
          await tx.item.update({
            where: { id: it.itemId },
            data: { quantity: { increment: it.quantity } },
          })
        } else {
          // Barang Baru: buat Category jika belum ada
          const categoryName = it.categoryName?.trim() || "Peralatan"
          let category = await tx.category.findFirst({
            where: { name: { equals: categoryName, mode: "insensitive" } },
          })
          if (!category) {
            category = await tx.category.create({
              data: { name: categoryName },
            })
          }

          const barcode = it.barcode?.trim() || String(Date.now()).slice(-5)

          const createdItem = await tx.item.create({
            data: {
              name: it.name,
              barcode,
              specification: it.specification || null,
              quantity: it.quantity,
              minStock: 1,
              categoryId: category.id,
              locationId: gudang.id,
            },
          })

          await tx.transaction.create({
            data: {
              itemId: createdItem.id,
              type: "IN",
              quantity: it.quantity,
              note: `Pengadaan Barang Baru Dana BOS - No BAP: ${p.bapNumber}`,
            },
          })

          await tx.procurementItem.update({
            where: { id: it.id },
            data: { itemId: createdItem.id, barcode },
          })
        }
      }

      const totalUnits = p.items.reduce((acc, it) => acc + it.quantity, 0)

      const result = await tx.procurement.update({
        where: { id },
        data: {
          status: "VERIFIED",
          verifiedAt: new Date(),
          verifiedById: user.id,
          totalUnits,
          totalItems: p.items.length,
        },
      })

      await tx.procurementLog.create({
        data: {
          procurementId: id,
          action: "PUBLISHED",
          actorId: user.id,
          note: "Dokumen BAP disahkan oleh Guru Pengawas. Stok gudang otomatis diperbarui.",
        },
      })

      return result
    })

    const pathsToRevalidate = [
      "/procurement",
      "/procurement/archive",
      `/procurement/${id}`,
      `/procurement/${id}/check`,
      "/executive",
      "/inventory",
      "/dashboard",
    ]
    pathsToRevalidate.forEach((p) => revalidatePath(p))

    return {
      ok: true,
      data: {
        bapNumber: updated.bapNumber!,
        qrToken: updated.qrToken!,
      },
    }
  } catch (error: any) {
    console.error("Error publishBap:", error)
    return { ok: false, error: error.message || "Gagal mengesahkan dokumen BAP" }
  }
}

export async function rejectBap(id: string, reason: string): Promise<ActionResult> {
  try {
    const user = await assertRole(["TEACHER", "ADMIN"])
    if (!reason || !reason.trim()) {
      return { ok: false, error: "Alasan penolakan/revisi wajib diisi" }
    }

    const p = await prisma.procurement.findUnique({ where: { id } })
    if (!p) return { ok: false, error: "Dokumen tidak ditemukan" }
    if (p.status !== "SUBMITTED") {
      return { ok: false, error: "Hanya dokumen berstatus MENUNGGU PEMERIKSAAN yang dapat ditolak" }
    }

    await prisma.procurement.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        rejectNote: reason.trim(),
      },
    })

    await prisma.procurementLog.create({
      data: {
        procurementId: id,
        action: "REJECTED",
        actorId: user.id,
        note: `Dokumen ditolak/dikembalikan: ${reason.trim()}`,
      },
    })

    revalidatePath("/procurement")
    revalidatePath("/procurement/archive")
    revalidatePath(`/procurement/${id}`)
    revalidatePath(`/procurement/${id}/check`)
    return { ok: true }
  } catch (error: any) {
    console.error("Error rejectBap:", error)
    return { ok: false, error: error.message || "Gagal menolak dokumen" }
  }
}

export async function reopenToDraft(id: string): Promise<ActionResult> {
  try {
    const user = await assertRole(["ADMIN", "TECHNICIAN"])

    const p = await prisma.procurement.findUnique({ where: { id } })
    if (!p) return { ok: false, error: "Dokumen tidak ditemukan" }
    if (p.status !== "REJECTED") {
      return { ok: false, error: "Hanya dokumen berstatus REJECTED yang dapat dibuka kembali" }
    }

    await prisma.procurement.update({
      where: { id },
      data: {
        status: "DRAFT",
      },
    })

    await prisma.procurementLog.create({
      data: {
        procurementId: id,
        action: "UPDATED",
        actorId: user.id,
        note: "Membuka kembali dokumen untuk revisi (kembali ke DRAFT)",
      },
    })

    revalidatePath("/procurement")
    revalidatePath(`/procurement/${id}`)
    return { ok: true }
  } catch (error: any) {
    console.error("Error reopenToDraft:", error)
    return { ok: false, error: error.message || "Gagal membuka kembali draft" }
  }
}
