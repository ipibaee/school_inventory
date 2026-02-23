"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { z } from "zod"

const userSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6).optional(),
    role: z.enum(["ADMIN", "TEACHER", "TECHNICIAN"]),
})

export async function getUsers() {
    return await prisma.user.findMany({
        orderBy: {
            name: 'asc'
        }
    })
}

export async function createUser(data: z.infer<typeof userSchema>) {
    try {
        if (!data.password) {
            return { success: false, error: "Password is required for new users" }
        }

        const hashedPassword = await bcrypt.hash(data.password, 10)

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role,
            },
        })
        revalidatePath("/settings")
        return { success: true, data: user }
    } catch (error) {
        console.error("Error creating user:", error)
        return { success: false, error: "Failed to create user" }
    }
}

export async function updateUser(id: string, data: z.infer<typeof userSchema>) {
    try {
        const updateData: any = {
            name: data.name,
            email: data.email,
            role: data.role,
        }

        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10)
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
        })
        revalidatePath("/settings")
        return { success: true, data: user }
    } catch (error) {
        console.error("Error updating user:", error)
        return { success: false, error: "Failed to update user" }
    }
}

export async function deleteUser(id: string) {
    try {
        // Prevent deleting the last admin? Or maybe just the current user?
        // For now, just simple delete.
        await prisma.user.delete({
            where: { id },
        })
        revalidatePath("/settings")
        return { success: true }
    } catch (error) {
        console.error("Error deleting user:", error)
        return { success: false, error: "Failed to delete user" }
    }
}
