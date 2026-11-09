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

export async function getTeacherValidations(teacherId?: string) {
  try {
    const [pending, verified] = await Promise.all([
      prisma.procurement.findMany({
        where: {
          status: "SUBMITTED",
          ...(teacherId
            ? {
                OR: [{ inspectorId: teacherId }, { inspectorId: null }],
              }
            : {}),
        },
        include: {
          items: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
          createdBy: { select: { id: true, name: true, email: true } },
          inspector: { select: { id: true, name: true, email: true } },
          _count: { select: { items: true } },
        },
        orderBy: { submittedAt: "desc" },
      }),
      prisma.procurement.findMany({
        where: {
          status: "VERIFIED",
          ...(teacherId
            ? {
                OR: [{ inspectorId: teacherId }, { verifiedById: teacherId }],
              }
            : {}),
        },
        include: {
          items: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
          inspector: { select: { id: true, name: true, email: true } },
          verifiedBy: { select: { id: true, name: true, email: true } },
          _count: { select: { items: true } },
        },
        orderBy: { verifiedAt: "desc" },
        take: 10,
      }),
    ])

    return { pending, verified }
  } catch (error) {
    console.error("Error getTeacherValidations:", error)
    return { pending: [], verified: [] }
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
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    })
  } catch (error) {
    console.error("Error getBapByToken:", error)
    return null
  }
}

export async function getWarehouseSuggestions({ limit = 100 }: { limit?: number } = {}) {
  try {
    return await prisma.item.findMany({
      where: {
        location: {
          name: {
            equals: "Gudang",
            mode: "insensitive",
          },
        },
      },
      include: {
        category: true,
        location: true,
      },
      orderBy: { name: "asc" },
      ...(limit ? { take: limit } : {}),
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
