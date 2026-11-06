"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Boxes,
    ClipboardList,
    Archive,
    ScanBarcode,
    ShoppingCart,
    ChartColumn,
} from "lucide-react"

export function MobileBottomNav({ user }: { user?: any }) {
    const pathname = usePathname()
    const isHeadmaster = user?.role === "HEADMASTER"

    const navItems = isHeadmaster
        ? [
              { label: "Dasbor", icon: LayoutDashboard, href: "/executive" },
              { label: "Arsip BAP", icon: Archive, href: "/procurement/archive" },
              { label: "Laporan", icon: ChartColumn, href: "/reports" },
          ]
        : [
              { label: "Dasbor", icon: LayoutDashboard, href: "/dashboard" },
              { label: "Inventaris", icon: Boxes, href: "/inventory" },
              { label: "BOS", icon: ClipboardList, href: "/procurement" },
              { label: "Pinjam", icon: ShoppingCart, href: "/borrow" },
              { label: "Laporan", icon: ChartColumn, href: "/reports" },
          ]

    return (
        <nav className="fixed bottom-0 inset-x-0 h-[62px] bg-surface border-t border-line z-40 flex items-center justify-around px-1.5 lg:hidden print:hidden select-none">
            {navItems.map((item) => {
                const isActive =
                    item.href === "/inventory"
                        ? pathname === "/inventory"
                        : item.href === "/procurement"
                        ? pathname.startsWith("/procurement")
                        : pathname.startsWith(item.href)

                const Icon = item.icon

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center flex-1 h-full gap-[3px] transition-colors",
                            isActive ? "text-brand" : "text-muted-ink hover:text-ink"
                        )}
                    >
                        <Icon className="size-[19px] shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                        <span
                            className={cn(
                                "text-[9px] leading-tight",
                                isActive ? "font-bold" : "font-medium"
                            )}
                        >
                            {item.label}
                        </span>
                    </Link>
                )
            })}
        </nav>
    )
}
