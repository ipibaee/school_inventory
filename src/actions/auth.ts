"use server"

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn("credentials", {
            ...Object.fromEntries(formData),
            redirectTo: "/dashboard",
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Email atau password salah."
                default:
                    return "Terjadi kesalahan saat masuk."
            }
        }
        throw error
    }
}

export async function loginWithGoogle() {
    const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID
    const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET

    if (!googleClientId || !googleClientSecret) {
        return {
            error: "Google Client ID & Secret belum dikonfigurasi di file .env server.",
        }
    }

    try {
        await signIn("google", { redirectTo: "/dashboard" })
    } catch (error) {
        // NEXT_REDIRECT wajib diteruskan agar Next.js melakukan pengalihan ke akun Google
        throw error
    }
}

export async function logout() {
    await signOut({ redirectTo: "/login" })
}
