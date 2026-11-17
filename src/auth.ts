import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET

const providers: any[] = [
    Credentials({
        async authorize(credentials) {
            const parsedCredentials = z
                .object({ email: z.string().email(), password: z.string().min(6) })
                .safeParse(credentials)

            if (parsedCredentials.success) {
                const { email, password } = parsedCredentials.data
                const user = await prisma.user.findFirst({
                    where: {
                        email: {
                            equals: email,
                            mode: "insensitive",
                        },
                    },
                })
                if (!user || !user.password) return null

                const passwordsMatch = await bcrypt.compare(password, user.password)
                if (passwordsMatch) return user
            }

            console.log("Invalid credentials")
            return null
        },
    }),
]

// Aktifkan Google Provider jika Client ID dan Secret tersedia di environment
if (googleClientId && googleClientSecret) {
    providers.push(
        Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
        })
    )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    pages: {
        signIn: "/login",
    },
    providers,
    callbacks: {
        // ─────────────────────────────────────────────────────────────────────────
        // VALIDASI KEAMANAN SIGN IN GOOGLE:
        // HANYA EMAIL YANG SUDAH TERDAFTAR DI DATABASE OLEH ADMIN YANG DIIZINKAN MASUK!
        // Akun Google lain akan otomatis ditolak (AccessDenied).
        // ─────────────────────────────────────────────────────────────────────────
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                if (!user?.email) {
                    return false
                }

                const existingUser = await prisma.user.findFirst({
                    where: {
                        email: {
                            equals: user.email,
                            mode: "insensitive",
                        },
                    },
                })

                if (!existingUser) {
                    console.warn(`[Google Auth] Akses ditolak untuk email tidak terdaftar: ${user.email}`)
                    return false // Tolak akses, user diarahkan ke /login?error=AccessDenied
                }

                // Update avatar jika user belum memiliki foto
                if (user.image && !existingUser.image) {
                    try {
                        await prisma.user.update({
                            where: { id: existingUser.id },
                            data: { image: user.image },
                        })
                    } catch (e) {
                        console.error("Gagal sinkronisasi avatar Google:", e)
                    }
                }

                return true
            }

            return true
        },
        async jwt({ token, user, account }) {
            if (user) {
                if (account?.provider === "google" && user.email) {
                    const dbUser = await prisma.user.findFirst({
                        where: {
                            email: {
                                equals: user.email,
                                mode: "insensitive",
                            },
                        },
                    })
                    if (dbUser) {
                        token.sub = dbUser.id
                        token.role = dbUser.role
                        token.name = dbUser.name
                    }
                } else {
                    token.role = (user as any).role
                }
            }
            return token
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
                session.user.role = token.role as string
                if (token.name) session.user.name = token.name as string
            }
            return session
        },
    },
})
