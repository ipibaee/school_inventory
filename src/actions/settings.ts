"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import fs from "fs/promises"
import path from "path"

export async function getSchoolSettings() {
    try {
        const settings = await prisma.schoolSettings.findFirst()
        if (!settings) {
            // Create default settings if not exists
            return await prisma.schoolSettings.create({
                data: {
                    schoolName: "Inventaris Sekolah",
                    address: "Jl. Pendidikan No. 1",
                }
            })
        }
        return settings
    } catch (error) {
        console.error("Error getting settings:", error)
        return null
    }
}

export async function updateSchoolSettings(formData: FormData) {
    try {
        const schoolName = formData.get("schoolName") as string
        const address = formData.get("address") as string
        const phone = formData.get("phone") as string
        const email = formData.get("email") as string
        const website = formData.get("website") as string
        const logoFile = formData.get("logo") as File | null

        let logoUrl = undefined

        if (logoFile && logoFile.size > 0) {
            const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
            if (!validTypes.includes(logoFile.type)) {
                return { success: false, error: "Format file logo harus berupa PNG, JPG, JPEG, atau WEBP." }
            }
            if (logoFile.size > 500 * 1024) {
                return { success: false, error: "Ukuran file logo maksimal adalah 500 KB." }
            }

            const buffer = Buffer.from(await logoFile.arrayBuffer())
            const base64String = buffer.toString("base64")
            logoUrl = `data:${logoFile.type};base64,${base64String}`
        }

        const currentSettings = await prisma.schoolSettings.findFirst()

        if (currentSettings) {
            await prisma.schoolSettings.update({
                where: { id: currentSettings.id },
                data: {
                    schoolName,
                    address,
                    phone,
                    email,
                    website,
                    ...(logoUrl && { logoUrl }),
                },
            })
        } else {
            await prisma.schoolSettings.create({
                data: {
                    schoolName,
                    address,
                    phone,
                    email,
                    website,
                    logoUrl,
                },
            })
        }

        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Error updating settings:", error)
        return { success: false, error: "Gagal menyimpan pengaturan" }
    }
}
