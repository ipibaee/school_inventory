import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }

    const procurement = await prisma.procurement.findFirst({
      where: { qrToken: token },
      select: { id: true },
    })

    if (!procurement) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      )
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null
    const userAgent = request.headers.get("user-agent") || null

    await prisma.verificationVisit.create({
      data: {
        procurementId: procurement.id,
        ip,
        userAgent,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging verification visit:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
