"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { logout } from "@/actions/auth"
import {
    LayoutDashboard,
    Package,
    ArrowRightLeft,
    Settings,
    ScanBarcode,
    School,
    ShoppingCart,
    LogOut,
    ChevronLeft,
    ChevronRight
} from "lucide-react"

const routes = [
    {
        label: "Dasbor",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Inventaris",
        icon: Package,
        href: "/inventory",
        color: "text-violet-500",
    },
    {
        label: "Cetak Barcode",
        icon: ScanBarcode,
        href: "/inventory/barcode",
        color: "text-indigo-500",
    },
    {
        label: "Peminjaman",
        icon: ShoppingCart,
        href: "/borrow",
        color: "text-pink-600",
    },
    {
        label: "Laporan",
        icon: ArrowRightLeft,
        href: "/reports",
        color: "text-orange-500",
    },
    {
        label: "Pengaturan",
        icon: Settings,
        href: "/settings",
        color: "text-emerald-500",
    },
]

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "next-auth"

interface SidebarProps {
    user?: User
    settings?: any
    isCollapsed?: boolean
    onToggleCollapse?: () => void
}

export function Sidebar({ user, settings, isCollapsed = false, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname()

    return (
        <div 
            className={cn(
                "relative space-y-4 py-4 flex flex-col h-full bg-white/40 dark:bg-[#0c0f1d]/40 backdrop-blur-xl border-r border-border/50 dark:border-white/5 text-slate-800 dark:text-slate-100 transition-all duration-300 shadow-xs select-none",
                isCollapsed ? "w-20" : "w-72"
            )}
        >
            {/* Collapse toggle tab (Desktop Only) */}
            {onToggleCollapse && (
                <button
                    onClick={onToggleCollapse}
                    className="hidden md:flex absolute top-6 -right-3 h-6 w-6 rounded-full border border-border/80 dark:border-white/10 bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 shadow-md hover:shadow-lg items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition active:scale-95 z-50"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </button>
            )}

            <div className="px-3 py-2 flex-1 flex flex-col min-h-0">
                {/* Brand Logo & Name */}
                <Link 
                    href="/dashboard" 
                    className={cn(
                        "flex items-center mb-10 transition-all duration-300", 
                        isCollapsed ? "justify-center pl-0" : "pl-3"
                    )}
                >
                    <div className={cn("relative w-8 h-8 flex items-center justify-center rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10 border border-indigo-500/15 shadow-inner shrink-0", isCollapsed ? "mr-0" : "mr-4")}>
                        {settings?.logoUrl ? (
                            <img
                                src={settings.logoUrl}
                                alt="Logo"
                                className="w-6 h-6 object-contain"
                            />
                        ) : (
                            <School className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        )}
                    </div>
                    <h1 
                        className={cn(
                            "text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent truncate transition-all duration-300", 
                            isCollapsed ? "opacity-0 w-0 pointer-events-none hidden" : "opacity-100 w-auto"
                        )}
                    >
                        {settings?.schoolName || "Inventaris"}
                    </h1>
                </Link>

                {/* Navigation Links */}
                <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
                    {routes.map((route) => {
                        const isActive = pathname === route.href
                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-200 active:scale-98",
                                    isActive
                                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-400/8 font-semibold shadow-xs"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-white/5"
                                )}
                            >
                                <div className={cn("flex items-center flex-1", isCollapsed ? "justify-center" : "")}>
                                    <route.icon 
                                        className={cn(
                                            "h-5 w-5 transition-transform duration-300 group-hover:scale-110", 
                                            isCollapsed ? "mr-0" : "mr-3",
                                            isActive ? "text-indigo-600 dark:text-indigo-400" : route.color
                                        )} 
                                    />
                                    <span 
                                        className={cn(
                                            "transition-all duration-300 truncate",
                                            isCollapsed ? "opacity-0 w-0 pointer-events-none hidden" : "opacity-100 w-auto"
                                        )}
                                    >
                                        {route.label}
                                    </span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Profile Dropdown Footer */}
            <div className="px-3 py-2 border-t border-border/40 dark:border-white/5">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className={cn(
                            "flex items-center w-full p-2 rounded-xl hover:bg-slate-100/50 dark:hover:bg-white/5 transition text-left cursor-pointer outline-none active:scale-98",
                            isCollapsed ? "justify-center" : ""
                        )}>
                            <Avatar className={cn("h-8 w-8 shadow-xs border border-indigo-500/20 shrink-0", isCollapsed ? "mr-0" : "mr-3")}>
                                <AvatarImage src={user?.image || ""} />
                                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold">
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className={cn(
                                "flex-1 overflow-hidden transition-all duration-300", 
                                isCollapsed ? "opacity-0 w-0 pointer-events-none hidden" : "opacity-100 w-auto"
                            )}>
                                <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">
                                    {user?.name || "User"}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {user?.email || ""}
                                </p>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 glass-card border border-border/50 dark:border-white/5" align="end" side="right" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-semibold leading-none text-slate-800 dark:text-slate-200">{user?.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border/50 dark:bg-white/5" />
                        <DropdownMenuItem onClick={() => logout()} className="text-red-600 dark:text-red-400 focus:bg-red-500/10 cursor-pointer rounded-lg p-2 font-medium">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Keluar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
