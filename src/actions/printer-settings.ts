"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getPrinterSettings() {
    try {
        const settings = await prisma.printerSettings.findFirst()
        return settings
    } catch (error) {
        console.error("Error fetching printer settings:", error)
        return null
    }
}

export async function updatePrinterSettings(data: {
    paperSize: string
}) {
    try {
        const existingSettings = await prisma.printerSettings.findFirst()

        if (existingSettings) {
            await prisma.printerSettings.update({
                where: { id: existingSettings.id },
                data,
            })
        } else {
            await prisma.printerSettings.create({
                data,
            })
        }

        revalidatePath("/settings")
        return { success: true }
    } catch (error) {
        console.error("Error updating printer settings:", error)
        return { success: false, error: "Failed to update printer settings" }
    }
}
