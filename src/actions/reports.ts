"use server"

import { prisma } from "@/lib/prisma"

export async function getStockReport() {
    try {
        const items = await prisma.item.findMany({
            include: {
                category: true,
                location: true,
            },
            orderBy: [
                { location: { name: "asc" } },
                { category: { name: "asc" } },
                { name: "asc" },
            ],
        })
        return items
    } catch (error) {
        console.error("Error fetching stock report:", error)
        return []
    }
}

export async function getBorrowingReport(startDate?: Date, endDate?: Date) {
    try {
        const whereClause: any = {}

        if (startDate && endDate) {
            whereClause.borrowDate = {
                gte: startDate,
                lte: endDate,
            }
        }

        const borrowings = await prisma.borrowing.findMany({
            where: whereClause,
            include: {
                item: {
                    include: {
                        location: true,
                        category: true,
                    },
                },
            },
            orderBy: {
                borrowDate: "desc",
            },
        })
        return borrowings
    } catch (error) {
        console.error("Error fetching borrowing report:", error)
        return []
    }
}

export async function getIncomingItemsReport(startDate?: Date, endDate?: Date) {
    try {
        const whereClause: any = {
            type: "IN"
        }

        if (startDate && endDate) {
            whereClause.date = {
                gte: startDate,
                lte: endDate,
            }
        }

        const transactions = await prisma.transaction.findMany({
            where: whereClause,
            include: {
                item: {
                    include: {
                        location: true,
                        category: true,
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
        })
        return transactions
    } catch (error) {
        console.error("Error fetching incoming items report:", error)
        return []
    }
}

export async function getWarehouseReport(startDate?: Date, endDate?: Date) {
    try {
        const whereClause: any = {}

        if (startDate && endDate) {
            whereClause.date = {
                gte: startDate,
                lte: endDate,
            }
        }

        const transactions = await prisma.transaction.findMany({
            where: whereClause,
            include: {
                item: {
                    include: {
                        location: true,
                        category: true,
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
        })
        return transactions
    } catch (error) {
        console.error("Error fetching warehouse report:", error)
        return []
    }
}
