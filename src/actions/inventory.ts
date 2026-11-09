"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getItems() {
    return await prisma.item.findMany({
        include: {
            category: true,
            location: true,
        },
        orderBy: {
            updatedAt: 'desc'
        }
    })
}

export async function createItem(data: {
    name: string
    barcode: string
    categoryId: string
    locationId: string
    quantity: number
    minStock: number
    description?: string
    imageUrl?: string
    specification?: string
}) {
    try {
        const item = await prisma.item.create({
            data: {
                ...data,
            },
        })
        revalidatePath("/inventory")
        return { success: true, data: item }
    } catch (error) {
        return { success: false, error: "Failed to create item" }
    }
}

export async function updateItem(id: string, data: {
    name?: string
    barcode?: string
    categoryId?: string
    locationId?: string
    quantity?: number
    minStock?: number
    description?: string
    imageUrl?: string
    specification?: string
}) {
    try {
        const item = await prisma.item.update({
            where: { id },
            data: {
                ...data,
            },
        })
        revalidatePath("/inventory")
        return { success: true, data: item }
    } catch (error) {
        return { success: false, error: "Failed to update item" }
    }
}

export async function deleteItem(id: string) {
    try {
        const item = await prisma.item.findUnique({
            where: { id },
            include: {
                borrowings: {
                    where: { status: "ACTIVE" },
                },
            },
        })

        if (!item) {
            return { success: false, error: "Barang tidak ditemukan" }
        }

        if (item.borrowings.length > 0) {
            return {
                success: false,
                error: `Barang "${item.name}" tidak dapat dihapus karena saat ini sedang dipinjam (${item.borrowings.length} peminjaman aktif). Harap kembalikan barang terlebih dahulu.`,
            }
        }

        await prisma.$transaction(async (tx) => {
            // 1. Putuskan relasi dari dokumen BAP Pengadaan BOS agar arsip historis BAP tetap utuh
            await tx.procurementItem.updateMany({
                where: { itemId: id },
                data: { itemId: null },
            })

            // 2. Hapus riwayat mutasi / logistik barang ini
            await tx.transaction.deleteMany({
                where: { itemId: id },
            })

            // 3. Hapus riwayat peminjaman lama yang sudah dikembalikan/selesai
            await tx.borrowing.deleteMany({
                where: { itemId: id },
            })

            // 4. Hapus barang dari master inventaris
            await tx.item.delete({
                where: { id },
            })
        })

        revalidatePath("/inventory")
        revalidatePath("/dashboard")
        revalidatePath("/reports")
        return { success: true }
    } catch (error: any) {
        console.error("Error deleteItem:", error)
        return { success: false, error: error?.message || "Gagal menghapus barang dari inventaris" }
    }
}

export async function getCategories() {
    return await prisma.category.findMany()
}

export async function getLocations() {
    return await prisma.location.findMany()
}

export async function getItemByBarcode(barcode: string, locationId?: string) {
    if (locationId) {
        return await prisma.item.findFirst({
            where: {
                barcode,
                locationId
            },
            include: {
                category: true,
                location: true,
            }
        })
    }

    // If no location specified, try to find in Gudang first
    const gudang = await prisma.location.findUnique({ where: { name: "Gudang" } })
    if (gudang) {
        const itemInGudang = await prisma.item.findFirst({
            where: {
                barcode,
                locationId: gudang.id
            },
            include: {
                category: true,
                location: true,
            }
        })
        if (itemInGudang) return itemInGudang
    }

    // Fallback: return any item with this barcode
    return await prisma.item.findFirst({
        where: { barcode },
        include: {
            category: true,
            location: true,
        }
    })
}
