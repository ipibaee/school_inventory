import { auth } from "@/auth"
import { prisma } from "./prisma"

export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, image: true },
  })
  return user
}

export async function assertAuthenticated() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("UNAUTHORIZED: Anda harus login terlebih dahulu.")
  }
  return user
}

export async function assertRole(allowedRoles: string[]) {
  const user = await assertAuthenticated()
  if (!allowedRoles.includes(user.role)) {
    throw new Error(
      `FORBIDDEN: Peran '${user.role}' tidak memiliki hak akses untuk aksi ini.`
    )
  }
  return user
}

export function canManageProcurement(role: string): boolean {
  return role === "ADMIN" || role === "TECHNICIAN"
}

export function canInspectProcurement(role: string): boolean {
  return role === "TEACHER" || role === "ADMIN"
}

export function canAccessExecutive(role: string): boolean {
  return role === "HEADMASTER" || role === "ADMIN"
}
