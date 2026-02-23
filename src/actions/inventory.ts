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
        await prisma.item.delete({
            where: { id },
        })
        revalidatePath("/inventory")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete item" }
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
