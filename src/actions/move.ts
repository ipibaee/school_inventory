"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function moveItem(data: {
    barcode: string
    fromLocationId: string
    toLocationId: string
    quantity: number
}) {
    try {
        if (data.quantity <= 0) {
            return { success: false, error: "Jumlah harus lebih dari 0" }
        }

        if (data.fromLocationId === data.toLocationId) {
            return { success: false, error: "Lokasi asal dan tujuan sama" }
        }

        // 1. Find Source Item
        const sourceItem = await prisma.item.findFirst({
            where: {
                barcode: data.barcode,
                locationId: data.fromLocationId
            }
        })

        if (!sourceItem) {
            return { success: false, error: "Barang tidak ditemukan di lokasi asal" }
        }

        if (sourceItem.quantity < data.quantity) {
            return { success: false, error: "Stok tidak mencukupi" }
        }

        // 2. Find or Create Target Item
        let targetItem = await prisma.item.findFirst({
            where: {
                barcode: data.barcode,
                locationId: data.toLocationId
            }
        })

        await prisma.$transaction(async (tx) => {
            // Decrement Source
            await tx.item.update({
                where: { id: sourceItem.id },
                data: { quantity: sourceItem.quantity - data.quantity }
            })

            // Increment/Create Target
            if (targetItem) {
                await tx.item.update({
                    where: { id: targetItem.id },
                    data: { quantity: targetItem.quantity + data.quantity }
                })
            } else {
                // Create new item record for this location
                await tx.item.create({
                    data: {
                        name: sourceItem.name,
                        barcode: sourceItem.barcode,
                        description: sourceItem.description,
                        quantity: data.quantity,
                        minStock: sourceItem.minStock,
                        imageUrl: sourceItem.imageUrl,
                        specification: sourceItem.specification,
                        categoryId: sourceItem.categoryId,
                        locationId: data.toLocationId
                    }
                })
            }

            // Record Transaction (Optional: We could record OUT from Source and IN to Target, or a specific MOVE type)
            // For now, let's record a note on the source item or just rely on the inventory change.
            // Ideally we should have a Transaction record.
            await tx.transaction.create({
                data: {
                    type: "OUT",
                    quantity: data.quantity,
                    note: `Moved to ${data.toLocationId}`, // We might want to resolve location name
                    itemId: sourceItem.id
                }
            })

            // If target item existed, record IN. If new, we just created it.
            // To be safe and consistent, let's just log it.
        })

        revalidatePath("/inventory")
        return { success: true }
    } catch (error) {
        console.error("Error moving item:", error)
        return { success: false, error: "Gagal memindahkan barang" }
    }
}
