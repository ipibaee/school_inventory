"use server"

import { prisma } from "@/lib/prisma"

export async function getDashboardStats() {
    try {
        const [
            totalItems,
            lowStockItems,
            activeLoans,
            todayTransactions
        ] = await Promise.all([
            prisma.item.count(),
            prisma.item.count({
                where: {
                    quantity: {
                        lte: prisma.item.fields.minStock
                    }
                }
            }),
            prisma.borrowing.count({
                where: {
                    status: "ACTIVE"
                }
            }),
            prisma.transaction.count({
                where: {
                    date: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            })
        ])

        return {
            totalItems,
            lowStockItems,
            activeLoans,
            todayTransactions
        }
    } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        return {
            totalItems: 0,
            lowStockItems: 0,
            activeLoans: 0,
            todayTransactions: 0
        }
    }
}

export async function getRecentActivity() {
    try {
        const transactions = await prisma.transaction.findMany({
            take: 5,
            orderBy: {
                date: "desc"
            },
            include: {
                item: true
            }
        })
        return transactions
    } catch (error) {
        console.error("Error fetching recent activity:", error)
        return []
    }
}

export async function getLowStockItems() {
    try {
        const items = await prisma.item.findMany({
            where: {
                quantity: {
                    lte: prisma.item.fields.minStock
                }
            },
            take: 5,
            include: {
                location: true
            }
        })
        return items
    } catch (error) {
        console.error("Error fetching low stock items:", error)
        return []
    }
}
