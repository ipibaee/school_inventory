"use server"

import { prisma } from "@/lib/prisma"

export async function getDashboardStats() {
    try {
        const now = new Date()
        const currentMonth = now.getMonth() + 1
        const currentYear = now.getFullYear()

        const [
            totalItems,
            lowStockItems,
            activeLoans,
            todayTransactions,
            currentBap
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
            }),
            prisma.procurement.findFirst({
                where: {
                    periodYear: currentYear,
                    periodMonth: currentMonth,
                },
                include: {
                    inspector: { select: { name: true } },
                    _count: { select: { items: true } },
                },
                orderBy: { updatedAt: "desc" }
            })
        ])

        return {
            totalItems,
            lowStockItems,
            activeLoans,
            todayTransactions,
            bosUnits: currentBap?.status === "VERIFIED" ? currentBap.totalUnits : 0,
            currentBap,
            currentMonth,
            currentYear,
        }
    } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        return {
            totalItems: 0,
            lowStockItems: 0,
            activeLoans: 0,
            todayTransactions: 0,
            bosUnits: 0,
            currentBap: null,
            currentMonth: new Date().getMonth() + 1,
            currentYear: new Date().getFullYear(),
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
            take: 3,
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
