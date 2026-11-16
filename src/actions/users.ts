"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { auth } from "@/auth"

const userSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6).optional(),
    role: z.enum(["ADMIN", "TEACHER", "TECHNICIAN"]),
})

export async function getMyProfile() {
    try {
        const session = await auth()
        if (!session?.user?.id && !session?.user?.email) return null

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    session.user.id ? { id: session.user.id } : {},
                    session.user.email ? { email: session.user.email } : {},
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                createdAt: true,
            },
        })
        return user
    } catch (error) {
        console.error("Failed to fetch my profile:", error)
        return null
    }
}

export async function updateMyProfile(formData: {
    name: string
    email: string
    currentPassword?: string
    newPassword?: string
}) {
    try {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: "Sesi telah berakhir. Silakan login kembali." }
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    session.user.id ? { id: session.user.id } : {},
                    session.user.email ? { email: session.user.email } : {},
                ],
            },
        })

        if (!user) {
            return { success: false, error: "Data pengguna tidak ditemukan di server." }
        }

        const trimmedEmail = (formData.email || "").trim().toLowerCase()
        const trimmedName = (formData.name || "").trim()

        if (!trimmedEmail || !trimmedName) {
            return { success: false, error: "Nama lengkap dan email tidak boleh kosong." }
        }

        // Cek duplikasi email dengan akun pengguna lain
        if (trimmedEmail !== user.email.toLowerCase()) {
            const emailExist = await prisma.user.findUnique({
                where: { email: trimmedEmail },
            })
            if (emailExist && emailExist.id !== user.id) {
                return { success: false, error: "Alamat email ini sudah terdaftar pada akun lain." }
            }
        }

        const updateData: any = {
            name: trimmedName,
            email: trimmedEmail,
        }

        // Ganti password (opsional)
        if (formData.newPassword && formData.newPassword.trim()) {
            const newPass = formData.newPassword.trim()
            if (newPass.length < 6) {
                return { success: false, error: "Password baru minimal 6 karakter." }
            }

            // Jika user punya password lama, lakukan verifikasi
            if (user.password) {
                if (!formData.currentPassword) {
                    return { success: false, error: "Masukkan password saat ini untuk memverifikasi penggantian." }
                }
                const isMatch = await bcrypt.compare(formData.currentPassword, user.password)
                if (!isMatch) {
                    return { success: false, error: "Password saat ini salah." }
                }
            }

            updateData.password = await bcrypt.hash(newPass, 10)
        }

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
        })

        revalidatePath("/settings")
        return {
            success: true,
            data: {
                id: updated.id,
                name: updated.name,
                email: updated.email,
                role: updated.role,
            },
        }
    } catch (error) {
        console.error("Error updating profile:", error)
        return { success: false, error: "Gagal memperbarui profil pengguna." }
    }
}

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
