import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
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
                nextUrl.pathname.startsWith("/procurement") ||
                nextUrl.pathname.startsWith("/executive")

            if (isProtected) {
                if (!isLoggedIn) return false // Redirect unauthenticated users to login page

                // Executive dashboard guard
                if (nextUrl.pathname.startsWith("/executive")) {
                    if (userRole && userRole !== "HEADMASTER" && userRole !== "ADMIN") {
                        return Response.redirect(new URL("/dashboard", nextUrl))
                    }
                }

                return true
            } else if (isLoggedIn) {
                // Redirect logged-in users away from login page
                if (nextUrl.pathname === "/login") {
                    if (userRole === "HEADMASTER") {
                        return Response.redirect(new URL("/executive", nextUrl))
                    }
                    return Response.redirect(new URL("/dashboard", nextUrl))
                }
                return true
            }
            return true
        },
    },
    providers: [],
} satisfies NextAuthConfig
