import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ filename: string }> }
) {
    const { filename } = await context.params
    const safeFilename = path.basename(filename)
    const filePath = path.join(process.cwd(), "public", "uploads", "arkas", safeFilename)

    if (!fs.existsSync(filePath)) {
        return new NextResponse("File tidak ditemukan", { status: 404 })
    }

    try {
        const fileBuffer = fs.readFileSync(filePath)
        const ext = path.extname(safeFilename).toLowerCase()
        let contentType = "application/octet-stream"

        if (ext === ".jpg" || ext === ".jpeg") {
            contentType = "image/jpeg"
        } else if (ext === ".png") {
            contentType = "image/png"
        } else if (ext === ".webp") {
            contentType = "image/webp"
        } else if (ext === ".pdf") {
            contentType = "application/pdf"
        }

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        })
    } catch {
        return new NextResponse("Gagal membaca file", { status: 500 })
    }
}
