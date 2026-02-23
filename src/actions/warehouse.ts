"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function processWarehouseTransaction(data: {
    type: "IN" | "OUT"
    barcode: string
    quantity: number
    note?: string
}) {
    try {
        // 1. Resolve "Gudang" Location ID
        const gudang = await prisma.location.findUnique({
            where: { name: "Gudang" }
        })

        if (!gudang) {
            return { success: false, error: "Lokasi 'Gudang' tidak ditemukan. Hubungi admin." }
        }

        // 2. Find Item in Gudang
        let item = await prisma.item.findFirst({
            where: {
                barcode: data.barcode,
                locationId: gudang.id
            },
        })

        if (!item) {
            if (data.type === "OUT") {
                return { success: false, error: "Barang tidak ditemukan di Gudang" }
            }

            // For IN, if item doesn't exist in Gudang, check if it exists elsewhere to copy details
            const existingItemAnywhere = await prisma.item.findFirst({
                where: { barcode: data.barcode }
            })

            if (existingItemAnywhere) {
                // Create new item record in Gudang with same details
                item = await prisma.item.create({
                    data: {
                        name: existingItemAnywhere.name,
                        barcode: existingItemAnywhere.barcode,
                        description: existingItemAnywhere.description,
                        quantity: 0, // Will be incremented below
                        minStock: existingItemAnywhere.minStock,
                        imageUrl: existingItemAnywhere.imageUrl,
                        specification: existingItemAnywhere.specification,
                        categoryId: existingItemAnywhere.categoryId,
                        locationId: gudang.id
                    }
                })
            } else {
                return { success: false, error: "Data barang belum ada di sistem. Silakan buat barang baru terlebih dahulu." }
            }
        }

        if (data.type === "OUT" && item.quantity < data.quantity) {
            return { success: false, error: "Stok di Gudang tidak mencukupi" }
        }

        // Update item quantity
        const newQuantity = data.type === "IN"
            ? item.quantity + data.quantity
            : item.quantity - data.quantity

        await prisma.$transaction([
            prisma.item.update({
                where: { id: item.id },
                data: { quantity: newQuantity },
            }),
            prisma.transaction.create({
                data: {
                    type: data.type,
                    quantity: data.quantity,
                    note: data.note,
                    itemId: item.id,
                },
            }),
        ])

        revalidatePath("/inventory")
        return { success: true, item: { ...item, quantity: newQuantity } }
    } catch (error) {
        console.error("Error processing warehouse transaction:", error)
        return { success: false, error: "Gagal memproses transaksi" }
    }
}
