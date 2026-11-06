import { prisma } from "@/lib/prisma"

export async function getProcurementDetail(id: string) {
  try {
    return await prisma.procurement.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          include: {
            item: true,
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        inspector: {
          select: { id: true, name: true, email: true, role: true },
        },
        verifiedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        logs: {
          orderBy: { createdAt: "desc" },
        },
      },
    })
  } catch (error) {
    console.error("Error getProcurementDetail:", error)
    return null
  }
}

export async function getActiveDraftOrSubmitted(year: number, month: number) {
  try {
    return await prisma.procurement.findFirst({
      where: {
        periodYear: year,
        periodMonth: month,
      },
      include: {
        items: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
        inspector: true,
      },
    })
  } catch (error) {
    console.error("Error getActiveDraftOrSubmitted:", error)
    return null
  }
}

export async function listBaps({
  year,
  month,
  q,
  page = 1,
  perPage = 10,
}: {
  year?: number
  month?: number
  q?: string
  page?: number
  perPage?: number
}) {
  try {
    const where: any = {
      status: { in: ["SUBMITTED", "VERIFIED", "REJECTED"] },
    }

    if (year) where.periodYear = year
    if (month && month > 0) where.periodMonth = month

    if (q && q.trim()) {
      where.OR = [
        { bapNumber: { contains: q.trim(), mode: "insensitive" } },
        { inspector: { name: { contains: q.trim(), mode: "insensitive" } } },
        { note: { contains: q.trim(), mode: "insensitive" } },
        {
          items: {
            some: {
              name: { contains: q.trim(), mode: "insensitive" },
            },
          },
        },
      ]
    }

    const [total, baps] = await Promise.all([
      prisma.procurement.count({ where }),
      prisma.procurement.findMany({
        where,
        include: {
          inspector: {
            select: { id: true, name: true },
          },
          verifiedBy: {
            select: { id: true, name: true },
          },
          items: {
            select: { id: true, name: true, quantity: true, unit: true },
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy: [
          { periodYear: "desc" },
          { periodMonth: "desc" },
          { createdAt: "desc" },
        ],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ])

    return {
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage) || 1,
      data: baps,
    }
  } catch (error) {
    console.error("Error listBaps:", error)
    return { total: 0, page: 1, perPage, totalPages: 1, data: [] }
  }
}

export async function getBapSummary({ year }: { year?: number }) {
  try {
    const targetYear = year ?? new Date().getFullYear()
    const where: any = {
      periodYear: targetYear,
      status: { in: ["SUBMITTED", "VERIFIED"] },
    }

    const [totalDocs, agg] = await Promise.all([
      prisma.procurement.count({ where }),
      prisma.procurement.aggregate({
        where,
        _sum: {
          totalUnits: true,
          totalItems: true,
        },
      }),
    ])

    return {
      year: targetYear,
      totalBap: totalDocs,
      totalUnits: agg._sum.totalUnits ?? 0,
      totalItems: agg._sum.totalItems ?? 0,
    }
  } catch (error) {
    console.error("Error getBapSummary:", error)
    return { year: new Date().getFullYear(), totalBap: 0, totalUnits: 0, totalItems: 0 }
  }
}

export async function getBapByToken(token: string) {
  try {
    return await prisma.procurement.findFirst({
      where: {
        qrToken: token,
        status: "VERIFIED",
      },
      include: {
        items: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
        inspector: {
          select: { id: true, name: true, email: true },
        },
        verifiedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    })
  } catch (error) {
    console.error("Error getBapByToken:", error)
    return null
  }
}

export async function getExecutiveOverview({
  year,
  month,
}: {
  year?: number
  month?: number
}) {
  const currentYear = year ?? new Date().getFullYear()
  const currentMonth = month ?? new Date().getMonth() + 1

  try {
    const [totalItemsAgg, activeLoansAgg, thisMonthBap, monthlySum] =
      await Promise.all([
        prisma.item.aggregate({
          _sum: { quantity: true },
          _count: { _all: true },
        }),
        prisma.borrowing.count({
          where: { status: "ACTIVE" },
        }),
        prisma.procurement.findFirst({
          where: {
            periodYear: currentYear,
            periodMonth: currentMonth,
          },
          include: {
            inspector: true,
            verifiedBy: true,
          },
        }),
        prisma.procurement.aggregate({
          where: {
            periodYear: currentYear,
            status: "VERIFIED",
          },
          _sum: {
            totalUnits: true,
          },
        }),
      ])

    return {
      totalAssetsCount: totalItemsAgg._sum.quantity ?? 0,
      totalAssetCategories: totalItemsAgg._count._all ?? 0,
      activeLoansCount: activeLoansAgg,
      currentMonthBap: thisMonthBap,
      totalUnitsYear: monthlySum._sum.totalUnits ?? 0,
      year: currentYear,
      month: currentMonth,
    }
  } catch (error) {
    console.error("Error getExecutiveOverview:", error)
    return {
      totalAssetsCount: 0,
      totalAssetCategories: 0,
      activeLoansCount: 0,
      currentMonthBap: null,
      totalUnitsYear: 0,
      year: currentYear,
      month: currentMonth,
    }
  }
}

export async function getMonthlyRealization({ year }: { year: number }) {
  try {
    const procurements = await prisma.procurement.findMany({
      where: {
        periodYear: year,
        status: "VERIFIED",
      },
      select: {
        periodMonth: true,
        totalUnits: true,
        bapNumber: true,
        id: true,
      },
    })

    const monthlyMap: Record<number, { units: number; id?: string; bapNumber?: string }> = {}
    for (let m = 1; m <= 12; m++) {
      monthlyMap[m] = { units: 0 }
    }

    for (const p of procurements) {
      monthlyMap[p.periodMonth] = {
        units: (monthlyMap[p.periodMonth]?.units || 0) + p.totalUnits,
        id: p.id,
        bapNumber: p.bapNumber || undefined,
      }
    }

    return Object.entries(monthlyMap).map(([m, data]) => ({
      month: Number(m),
      units: data.units,
      id: data.id,
      bapNumber: data.bapNumber,
    }))
  } catch (error) {
    console.error("Error getMonthlyRealization:", error)
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      units: 0,
    }))
  }
}

export async function getPendingBatches({ limit = 5 }: { limit?: number } = {}) {
  try {
    return await prisma.procurement.findMany({
      where: {
        status: { in: ["DRAFT", "SUBMITTED"] },
      },
      include: {
        inspector: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
      orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
      take: limit,
    })
  } catch (error) {
    console.error("Error getPendingBatches:", error)
    return []
  }
}

export async function getWarehouseSuggestions({ limit = 6 }: { limit?: number } = {}) {
  try {
    return await prisma.item.findMany({
      include: {
        category: true,
        location: true,
      },
      orderBy: { name: "asc" },
      take: limit,
    })
  } catch (error) {
    console.error("Error getWarehouseSuggestions:", error)
    return []
  }
}

export async function getAvailableInspectors() {
  try {
    return await prisma.user.findMany({
      where: {
        role: { in: ["TEACHER", "ADMIN"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: "asc" },
    })
  } catch (error) {
    console.error("Error getAvailableInspectors:", error)
    return []
  }
}
