"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getItemByBarcode(barcode: string) {
    try {
        // Prioritize finding item in Gudang
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
                },
            })
            if (itemInGudang) return itemInGudang
        }

        // Fallback: find any item with this barcode
        const item = await prisma.item.findFirst({
            where: { barcode },
            include: {
                category: true,
                location: true,
            },
        })
        return item
    } catch (error) {
        console.error("Error fetching item:", error)
        return null
    }
}

export async function createBorrowing(data: {
    studentName: string
    studentId?: string
    itemIds: string[]
    dueDate: Date
}) {
    try {
        await prisma.$transaction(async (tx) => {
            for (const itemId of data.itemIds) {
                await tx.borrowing.create({
                    data: {
                        studentName: data.studentName,
                        studentId: data.studentId || null,
                        itemId: itemId,
                        dueDate: data.dueDate,
                        status: "ACTIVE",
                    },
                })

                await tx.transaction.create({
                    data: {
                        type: "OUT",
                        quantity: 1,
                        itemId: itemId,
                        note: `Borrowed by ${data.studentName}${data.studentId ? ` (${data.studentId})` : ""}`,
                    },
                })

                await tx.item.update({
                    where: { id: itemId },
                    data: {
                        quantity: {
                            decrement: 1,
                        },
                    },
                })
            }
        })

        revalidatePath("/inventory")
        revalidatePath("/borrow")
        return { success: true }
    } catch (error) {
        console.error("Error creating borrowing:", error)
        return { success: false, error: "Failed to process borrowing" }
    }
}

export async function getActiveBorrowing(barcode: string) {
    try {
        // Find item by barcode (any location)
        // Since borrowing is linked to specific Item ID, we first need to find WHICH item ID is borrowed.
        // But we only have barcode.
        // We should look for Borrowing records where item.barcode === barcode AND status === ACTIVE.

        const borrowing = await prisma.borrowing.findFirst({
            where: {
                item: { barcode },
                status: "ACTIVE",
            },
            include: {
                item: true,
            },
        })

        if (!borrowing) return { error: "No active borrowing found for this item" }

        return { borrowing }
    } catch (error) {
        console.error("Error fetching active borrowing:", error)
        return { error: "Failed to fetch borrowing record" }
    }
}

export async function returnItem(borrowingId: string, condition: string) {
    try {
        await prisma.$transaction(async (tx) => {
            const borrowing = await tx.borrowing.findUnique({
                where: { id: borrowingId },
            })

            if (!borrowing) throw new Error("Borrowing record not found")

            await tx.borrowing.update({
                where: { id: borrowingId },
                data: {
                    status: "RETURNED",
                    returnDate: new Date(),
                    condition: condition,
                },
            })

            await tx.transaction.create({
                data: {
                    type: "IN",
                    quantity: 1,
                    itemId: borrowing.itemId,
                    note: `Returned by ${borrowing.studentName} (${borrowing.studentId}). Condition: ${condition}`,
                },
            })

            await tx.item.update({
                where: { id: borrowing.itemId },
                data: {
                    quantity: {
                        increment: 1,
                    },
                },
            })
        })

        revalidatePath("/inventory")
        revalidatePath("/borrow")
        return { success: true }
    } catch (error) {
        console.error("Error returning item:", error)
        return { success: false, error: "Failed to return item" }
    }
}

export async function getActiveLoans() {
    try {
        const loans = await prisma.borrowing.findMany({
            where: {
                status: "ACTIVE",
            },
            include: {
                item: {
                    include: {
                        location: true,
                        category: true,
                    },
                },
            },
            orderBy: {
                dueDate: "asc",
            },
        })
        return loans
    } catch (error) {
        console.error("Error fetching active loans:", error)
        return []
    }
}
