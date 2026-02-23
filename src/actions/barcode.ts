"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function searchItems(query: string) {
    try {
        const items = await prisma.item.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { barcode: { contains: query } },
                ],
            },
            include: {
                category: true,
                location: true,
            },
            take: 10,
        })
        return items
    } catch (error) {
        console.error("Error searching items:", error)
        return []
    }
}

export async function createItemWithBarcode(data: {
    name: string
    categoryId: string
    locationId: string
    barcode: string
    specification?: string
}) {
    try {
        // Check if barcode exists in the specific location
        const existing = await prisma.item.findFirst({
            where: {
                barcode: data.barcode,
                locationId: data.locationId
            },
        })

        if (existing) {
            return { success: false, error: "Barcode already exists in this location" }
        }

        const item = await prisma.item.create({
            data: {
                name: data.name,
                barcode: data.barcode,
                quantity: 0, // Start with 0 stock
                minStock: 5, // Default min stock
                categoryId: data.categoryId,
                locationId: data.locationId,
                specification: data.specification,
            },
        })

        revalidatePath("/inventory")
        return { success: true, item }
    } catch (error) {
        console.error("Error creating item:", error)
        return { success: false, error: "Failed to create item" }
    }
}

export async function generateUniqueBarcode() {
    let barcode = ""
    let isUnique = false

    while (!isUnique) {
        // Generate a random 5-digit number (10000 to 99999)
        const randomNum = Math.floor(10000 + Math.random() * 90000)
        barcode = randomNum.toString()

        // Check if barcode already exists anywhere (to keep new items unique globally)
        const existingItem = await prisma.item.findFirst({
            where: { barcode },
        })

        if (!existingItem) {
            isUnique = true
        }
    }

    return barcode
}
