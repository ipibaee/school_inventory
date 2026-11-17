"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import fs from "fs"
import path from "path"

export interface ArkasSubmissionItem {
    id: string
    title: string
    year: number
    period: string | null
    description: string | null
    images: string[]
    fileNames: string[]
    createdById: string | null
    createdBy?: {
        name: string
        role: string
    } | null
    createdAt: Date
    updatedAt: Date
}

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL ARKAS SUBMISSIONS (Untuk Admin, Teknisi, & Guru)
// ─────────────────────────────────────────────────────────────────────────────
export async function getArkasSubmissions(filters?: {
    year?: number
    search?: string
}): Promise<ArkasSubmissionItem[]> {
    try {
        const session = await auth()
        if (!session?.user) {
            return []
        }

        const where: any = {}
        if (filters?.year) {
            where.year = filters.year
        }
        if (filters?.search && filters.search.trim() !== "") {
            where.OR = [
                { title: { contains: filters.search, mode: "insensitive" } },
                { period: { contains: filters.search, mode: "insensitive" } },
                { description: { contains: filters.search, mode: "insensitive" } },
            ]
        }

        const submissions = await prisma.arkasSubmission.findMany({
            where,
            orderBy: [{ year: "desc" }, { createdAt: "desc" }],
            include: {
                createdBy: {
                    select: {
                        name: true,
                        role: true,
                    },
                },
            },
        })

        return submissions as ArkasSubmissionItem[]
    } catch (error) {
        console.error("Gagal mengambil data pengajuan ARKAS:", error)
        return []
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE ARKAS SUBMISSION (Khusus Admin & Teknisi)
// ─────────────────────────────────────────────────────────────────────────────
export async function createArkasSubmission(formData: FormData) {
    try {
        const session = await auth()
        const userRole = (session?.user as any)?.role
        if (!session?.user || userRole === "TEACHER") {
            return { success: false, error: "Hanya Admin dan Teknisi yang berhak mengunggah dokumen ARKAS." }
        }

        const title = (formData.get("title") as string)?.trim()
        const year = parseInt(formData.get("year") as string) || new Date().getFullYear()
        const period = (formData.get("period") as string)?.trim() || null
        const description = (formData.get("description") as string)?.trim() || null

        if (!title) {
            return { success: false, error: "Judul pengajuan ARKAS wajib diisi." }
        }

        const files = formData.getAll("files") as File[]
        if (!files || files.length === 0 || files.every((f) => f.size === 0)) {
            return { success: false, error: "Wajib melampirkan minimal 1 foto pengajuan ARKAS." }
        }

        const uploadDir = path.join(process.cwd(), "public", "uploads", "arkas")
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        const savedUrls: string[] = []
        const savedFileNames: string[] = []

        const allowedMime = ["image/jpeg", "image/png", "image/webp", "image/jpg"]

        for (const file of files) {
            if (file.size === 0) continue

            if (!allowedMime.includes(file.type)) {
                return {
                    success: false,
                    error: `Format file ${file.name} tidak didukung. Harap unggah format JPG, PNG, atau WEBP.`,
                }
            }

            // Max 10MB per file
            if (file.size > 10 * 1024 * 1024) {
                return {
                    success: false,
                    error: `Ukuran file ${file.name} terlalu besar (maksimal 10 MB).`,
                }
            }

            const ext = path.extname(file.name) || (file.type === "image/png" ? ".png" : ".jpg")
            const uniqueName = `arkas_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`
            const targetPath = path.join(uploadDir, uniqueName)

            const buffer = Buffer.from(await file.arrayBuffer())
            fs.writeFileSync(targetPath, buffer)

            savedUrls.push(`/api/uploads/arkas/${uniqueName}`)
            savedFileNames.push(file.name)
        }

        if (savedUrls.length === 0) {
            return { success: false, error: "Tidak ada foto valid yang berhasil diproses." }
        }

        const newSubmission = await prisma.arkasSubmission.create({
            data: {
                title,
                year,
                period,
                description,
                images: savedUrls,
                fileNames: savedFileNames,
                createdById: session.user.id || null,
            },
        })

        revalidatePath("/arkas")
        return { success: true, data: newSubmission }
    } catch (error: any) {
        console.error("Gagal membuat pengajuan ARKAS:", error)
        return { success: false, error: error?.message || "Terjadi kesalahan server saat menyimpan data." }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE ARKAS SUBMISSION (Khusus Admin & Teknisi)
// ─────────────────────────────────────────────────────────────────────────────
export async function updateArkasSubmission(id: string, formData: FormData) {
    try {
        const session = await auth()
        const userRole = (session?.user as any)?.role
        if (!session?.user || userRole === "TEACHER") {
            return { success: false, error: "Hanya Admin dan Teknisi yang berhak mengubah dokumen ARKAS." }
        }

        const existing = await prisma.arkasSubmission.findUnique({
            where: { id },
        })

        if (!existing) {
            return { success: false, error: "Dokumen pengajuan ARKAS tidak ditemukan." }
        }

        const title = (formData.get("title") as string)?.trim()
        const year = parseInt(formData.get("year") as string) || existing.year
        const period = (formData.get("period") as string)?.trim() || null
        const description = (formData.get("description") as string)?.trim() || null

        if (!title) {
            return { success: false, error: "Judul pengajuan ARKAS wajib diisi." }
        }

        // Gambar yang tetap dipertahankan
        const keptImagesRaw = formData.get("keptImages") as string
        let currentImages: string[] = []
        try {
            currentImages = keptImagesRaw ? JSON.parse(keptImagesRaw) : existing.images
        } catch {
            currentImages = existing.images
        }

        // Hapus file fisik dari disk yang dibuang oleh admin
        const uploadDir = path.join(process.cwd(), "public", "uploads", "arkas")
        existing.images.forEach((imgUrl) => {
            if (!currentImages.includes(imgUrl) && imgUrl.startsWith("/api/uploads/arkas/")) {
                const baseName = path.basename(imgUrl)
                const target = path.join(uploadDir, baseName)
                if (fs.existsSync(target)) {
                    try {
                        fs.unlinkSync(target)
                    } catch (e) {
                        console.error("Gagal menghapus file lama:", e)
                    }
                }
            }
        })

        // File baru yang diunggah
        const newFiles = formData.getAll("newFiles") as File[]
        const addedUrls: string[] = []
        const addedNames: string[] = []
        const allowedMime = ["image/jpeg", "image/png", "image/webp", "image/jpg"]

        if (newFiles && newFiles.length > 0) {
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true })
            }

            for (const file of newFiles) {
                if (file.size === 0) continue

                if (!allowedMime.includes(file.type)) {
                    return {
                        success: false,
                        error: `Format file ${file.name} tidak didukung. Harap unggah format JPG, PNG, atau WEBP.`,
                    }
                }

                if (file.size > 10 * 1024 * 1024) {
                    return {
                        success: false,
                        error: `Ukuran file ${file.name} terlalu besar (maksimal 10 MB).`,
                    }
                }

                const ext = path.extname(file.name) || (file.type === "image/png" ? ".png" : ".jpg")
                const uniqueName = `arkas_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`
                const targetPath = path.join(uploadDir, uniqueName)

                const buffer = Buffer.from(await file.arrayBuffer())
                fs.writeFileSync(targetPath, buffer)

                addedUrls.push(`/api/uploads/arkas/${uniqueName}`)
                addedNames.push(file.name)
            }
        }

        const finalImages = [...currentImages, ...addedUrls]
        if (finalImages.length === 0) {
            return { success: false, error: "Dokumen ARKAS harus memiliki minimal 1 lembar foto." }
        }

        const updated = await prisma.arkasSubmission.update({
            where: { id },
            data: {
                title,
                year,
                period,
                description,
                images: finalImages,
                fileNames: [...existing.fileNames.slice(0, currentImages.length), ...addedNames],
            },
        })

        revalidatePath("/arkas")
        return { success: true, data: updated }
    } catch (error: any) {
        console.error("Gagal memperbarui pengajuan ARKAS:", error)
        return { success: false, error: error?.message || "Terjadi kesalahan server saat memperbarui data." }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE ARKAS SUBMISSION (Khusus Admin & Teknisi)
// ─────────────────────────────────────────────────────────────────────────────
export async function deleteArkasSubmission(id: string) {
    try {
        const session = await auth()
        const userRole = (session?.user as any)?.role
        if (!session?.user || userRole === "TEACHER") {
            return { success: false, error: "Hanya Admin dan Teknisi yang berhak menghapus dokumen ARKAS." }
        }

        const existing = await prisma.arkasSubmission.findUnique({
            where: { id },
        })

        if (!existing) {
            return { success: false, error: "Dokumen tidak ditemukan." }
        }

        // Hapus file fisik di public/uploads/arkas
        const uploadDir = path.join(process.cwd(), "public", "uploads", "arkas")
        existing.images.forEach((imgUrl) => {
            if (imgUrl.startsWith("/api/uploads/arkas/")) {
                const baseName = path.basename(imgUrl)
                const target = path.join(uploadDir, baseName)
                if (fs.existsSync(target)) {
                    try {
                        fs.unlinkSync(target)
                    } catch (e) {
                        console.error("Gagal menghapus file:", e)
                    }
                }
            }
        })

        await prisma.arkasSubmission.delete({
            where: { id },
        })

        revalidatePath("/arkas")
        return { success: true }
    } catch (error: any) {
        console.error("Gagal menghapus pengajuan ARKAS:", error)
        return { success: false, error: error?.message || "Gagal menghapus dokumen ARKAS." }
    }
}
