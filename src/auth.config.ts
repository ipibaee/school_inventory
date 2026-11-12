import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    trustHost: true,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl, headers } }) {
            const isLoggedIn = !!auth?.user
            const userRole = (auth?.user as any)?.role

            // Public routes
            if (nextUrl.pathname.startsWith("/verify")) {
                return true
            }

            const isProtected =
                nextUrl.pathname.startsWith("/dashboard") ||
                nextUrl.pathname.startsWith("/inventory") ||
                nextUrl.pathname.startsWith("/borrow") ||
                nextUrl.pathname.startsWith("/reports") ||
                nextUrl.pathname.startsWith("/settings") ||
                nextUrl.pathname.startsWith("/procurement")

            if (isProtected) {
                if (!isLoggedIn) {
                    const host =
                        headers.get("x-forwarded-host") ||
                        (headers.get("host") && !headers.get("host")?.includes("localhost") ? headers.get("host") : null) ||
                        "inventaris.ipibaee.my.id"
                    const proto = headers.get("x-forwarded-proto") || "https"
                    const loginUrl = new URL("/login", `${proto}://${host}`)
                    loginUrl.searchParams.set("callbackUrl", `${proto}://${host}${nextUrl.pathname}`)
                    return Response.redirect(loginUrl)
                }

                // Guru Pengawas hanya fokus pada Dasbor dan Validasi/Cetak Dokumen BAP
                if (userRole === "TEACHER") {
                    if (
                        nextUrl.pathname.startsWith("/inventory") ||
                        nextUrl.pathname.startsWith("/borrow") ||
                        nextUrl.pathname.startsWith("/settings") ||
                        nextUrl.pathname.includes("/barcode")
                    ) {
                        return Response.redirect(new URL("/dashboard", nextUrl))
                    }
                }

                return true
            } else if (isLoggedIn) {
                // Redirect logged-in users away from login page
                if (nextUrl.pathname === "/login") {
                    return Response.redirect(new URL("/dashboard", nextUrl))
                }
                return true
            }
            return true
        },
    },
    providers: [],
} satisfies NextAuthConfig

