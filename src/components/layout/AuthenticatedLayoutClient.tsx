"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
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
    settings
}: AuthenticatedLayoutClientProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div className="flex h-screen w-full overflow-hidden bg-radial from-slate-50 via-slate-100/30 to-blue-50/20 dark:from-[#0b1226] dark:via-[#070b18] dark:to-[#0f142d] transition-colors duration-500 relative">
            {/* Background glowing decorations */}
            <div className="absolute w-[45rem] h-[45rem] rounded-full bg-blue-500/5 dark:bg-cyan-600/4 blur-[120px] top-10 left-10 pointer-events-none -z-10 animate-float" />
            <div className="absolute w-[40rem] h-[40rem] rounded-full bg-cyan-500/5 dark:bg-blue-600/4 blur-[110px] bottom-10 right-10 pointer-events-none -z-10 animate-float-reverse" />

            {/* Sidebar (Desktop) */}
            <div 
                className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-50 print:hidden transition-all duration-300 ${
                    isCollapsed ? "w-20" : "w-72"
                }`}
            >
                <Sidebar 
                    user={user} 
                    settings={settings} 
                    isCollapsed={isCollapsed} 
                    onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
                />
            </div>

            {/* Content Area */}
            <div 
                className={`flex-1 flex flex-col min-w-0 print:pl-0 transition-all duration-300 ${
                    isCollapsed ? "md:pl-20" : "md:pl-72"
                }`}
            >
                <div className="print:hidden">
                    <Header 
                        isCollapsed={isCollapsed} 
                        onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
                        user={user}
                        settings={settings}
                    />
                </div>
                <main className="flex-1 overflow-y-auto print:overflow-visible relative z-10 animate-fade-in px-4 md:px-8 pt-6 pb-28 md:py-6">
                    <div className="max-w-[1600px] mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav user={user} />
        </div>
    )
}
