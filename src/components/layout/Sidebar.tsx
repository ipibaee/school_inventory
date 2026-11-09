"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { logout } from "@/actions/auth"
import {
    LayoutDashboard,
    Boxes,
    ClipboardList,
    ClipboardCheck,
    Archive,
    ScanBarcode,
    ShoppingCart,
    ChartColumn,
    Settings,
    GraduationCap,
    LogOut,
} from "lucide-react"
import { User } from "next-auth"

interface SidebarProps {
    user?: User
    settings?: any
}

export function Sidebar({ user, settings }: SidebarProps) {
    const pathname = usePathname()
    const isTeacher = user?.role === "TEACHER"

    const routes = isTeacher
        ? [
              {
                  label: "Dasbor",
                  icon: LayoutDashboard,
                  href: "/dashboard",
              },
              {
                  label: "Validasi BOS",
                  icon: ClipboardCheck,
                  href: "/procurement",
              },
          ]
        : [
              {
                  label: "Dasbor",
                  icon: LayoutDashboard,
                  href: "/dashboard",
              },
              {
                  label: "Inventaris",
                  icon: Boxes,
                  href: "/inventory",
              },
              {
                  label: "Pengadaan BOS",
                  icon: ClipboardList,
                  href: "/procurement",
              },
              {
                  label: "Cetak Barcode",
                  icon: ScanBarcode,
                  href: "/inventory/barcode",
              },
              {
                  label: "Peminjaman",
                  icon: ShoppingCart,
                  href: "/borrow",
              },
              {
                  label: "Laporan",
                  icon: ChartColumn,
                  href: "/reports",
              },
              {
                  label: "Pengaturan",
                  icon: Settings,
                  href: "/settings",
              },
          ]

    return (
        <div className="flex flex-col h-full w-[264px] bg-navy text-white py-6 px-[18px] gap-6 select-none shrink-0 border-r border-line/10">
            {/* Brand Block */}
            <Link
                href="/dashboard"
                className="flex items-center gap-3 transition-opacity hover:opacity-90"
            >
                <div className="size-[38px] rounded-[11px] bg-brand grid place-items-center shrink-0">
                    {settings?.logoUrl ? (
                        <img
                            src={settings.logoUrl}
                            alt="Logo"
                            className="size-5 object-contain"
                        />
                    ) : (
                        <GraduationCap className="size-5 text-white" />
                    )}
                </div>
                <div className="flex flex-col gap-px min-w-0">
                    <span className="text-[14.5px] font-extrabold text-white tracking-[-0.2px] truncate leading-tight">
                        {settings?.schoolName || "SMK HKTI 2"}
                    </span>
                    <span className="text-[11px] font-medium text-[var(--nav-brand-product)] leading-tight">
                        HIKA Inventaris
                    </span>
                </div>
            </Link>

            {/* Menu Group */}
            <div className="flex flex-col gap-1 flex-1">
                <span className="text-[9.5px] uppercase tracking-[1.2px] text-[var(--nav-label)] font-bold px-3.5 mb-1">
                    MENU UTAMA
                </span>
                <nav className="flex flex-col gap-1">
                    {routes.map((route) => {
                        const isActive =
                            route.href === "/inventory"
                                ? pathname === "/inventory"
                                : route.href === "/procurement"
                                ? pathname === "/procurement" || pathname === "/procurement/archive" || pathname.startsWith("/procurement/")
                                : pathname.startsWith(route.href)

                        const Icon = route.icon

                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-sm font-semibold transition-colors",
                                    isActive
                                        ? "bg-[#1B3364] text-white dark:bg-[#34373D]"
                                        : "text-[#93A7C4] hover:bg-white/5 hover:text-white dark:text-[#9AA0A6]"
                                )}
                            >
                                <Icon className="size-[18px] shrink-0" strokeWidth={2} />
                                <span className="flex-1 truncate">{route.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* User Card */}
            <div className="rounded-[12px] bg-navy-2 p-[11px] flex items-center gap-2.5 mt-auto">
                <div className="size-8 rounded-full bg-brand grid place-items-center text-[13px] font-extrabold text-white shrink-0">
                    {user?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[12.5px] font-bold text-white truncate leading-tight">
                        {user?.name || "Admin Sekolah"}
                    </span>
                    <span className="text-[10px] text-[var(--nav-brand-product)] truncate leading-tight">
                        {user?.email || "admin@school.id"}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => logout()}
                    className="p-1 text-[var(--nav-brand-product)] hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Keluar"
                >
                    <LogOut className="size-[15px]" />
                </button>
            </div>
        </div>
    )
}
