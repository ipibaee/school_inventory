"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { logout } from "@/actions/auth"
import {
    LayoutDashboard,
    Package,
    ArrowRightLeft,
    Printer,
    Settings,
    ScanBarcode,
    School,
    ShoppingCart,
    LogOut
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
        color: "text-pink-700",
    },
    {
        label: "Laporan",
        icon: ArrowRightLeft,
        href: "/reports",
        color: "text-orange-700",
    },
    {
        label: "Pengaturan",
        icon: Settings,
        href: "/settings",
        color: "text-gray-500",
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
}

export function Sidebar({ user, settings }: SidebarProps) {
    const pathname = usePathname()

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        {settings?.logoUrl ? (
                            <img
                                src={settings.logoUrl}
                                alt="Logo"
                                className="w-8 h-8 object-contain"
                            />
                        ) : (
                            <School className="w-8 h-8 text-white" />
                        )}
                    </div>
                    <h1 className="text-xl font-bold truncate">
                        {settings?.schoolName || "Inventaris"}
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center w-full p-3 rounded-lg hover:bg-white/10 transition text-left">
                            <Avatar className="h-8 w-8 mr-3">
                                <AvatarImage src={user?.image || ""} />
                                <AvatarFallback className="bg-sky-500 text-white">
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium truncate text-white">
                                    {user?.name || "User"}
                                </p>
                                <p className="text-xs text-zinc-400 truncate">
                                    {user?.email || ""}
                                </p>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => logout()} className="text-red-600 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Keluar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
