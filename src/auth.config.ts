import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard") ||
                nextUrl.pathname.startsWith("/inventory") ||
                nextUrl.pathname.startsWith("/borrow") ||
                nextUrl.pathname.startsWith("/reports") ||
                nextUrl.pathname.startsWith("/settings")

            if (isOnDashboard) {
                if (isLoggedIn) return true
                return false // Redirect unauthenticated users to login page
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
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
