"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { User } from "next-auth"

interface AuthenticatedLayoutClientProps {
    children: React.ReactNode
    user?: User
    settings?: any
}

export function AuthenticatedLayoutClient({
    children,
    user,
    settings,
}: AuthenticatedLayoutClientProps) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-app">
            {/* Sidebar desktop: 264px, hanya lg ke atas */}
            <aside className="hidden w-[264px] shrink-0 lg:flex print:hidden">
                <Sidebar user={user} settings={settings} />
            </aside>

            {/* Area konten */}
            <div className="flex min-w-0 flex-1 flex-col">
                <main className="flex-1 overflow-y-auto px-4 pb-24 pt-0 lg:px-8 lg:pb-8 lg:pt-[26px] print:overflow-visible print:p-0">
                    <div className="mx-auto w-full max-w-[1600px]">{children}</div>
                </main>
            </div>

            <MobileBottomNav user={user} />
        </div>
    )
}
