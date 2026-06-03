"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { logout } from "@/actions/auth"
import { 
    LayoutDashboard, 
    Package, 
    ScanBarcode, 
    ShoppingCart, 
    Menu, 
    ArrowRightLeft, 
    Settings, 
    LogOut,
    X
} from "lucide-react"

export function MobileBottomNav({ user }: { user?: any }) {
    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const navItems = [
        { label: "Dasbor", icon: LayoutDashboard, href: "/dashboard" },
        { label: "Inventaris", icon: Package, href: "/inventory" },
        { label: "Barcode", icon: ScanBarcode, href: "/inventory/barcode" },
        { label: "Pinjam", icon: ShoppingCart, href: "/borrow" },
    ]

    return (
        <>
            {/* Fixed Bottom Navigation Bar */}
            <div className="md:hidden fixed bottom-6 left-4 right-4 h-16 rounded-2xl glass-card border border-white/20 dark:border-white/10 shadow-2xl z-40 flex items-center justify-around px-2 py-1 select-none">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-500 dark:text-slate-400 transition-all duration-300 relative",
                                isActive && "text-blue-600 dark:text-cyan-400 font-semibold"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5 transition-transform duration-300", isActive && "scale-110")} />
                            <span className="text-[10px] mt-1 tracking-wide">{item.label}</span>
                            {isActive && (
                                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-cyan-400" />
                            )}
                        </Link>
                    )
                })}
                {/* Lainnya Toggle Button */}
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className={cn(
                        "flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-500 dark:text-slate-400 transition-all duration-300 relative cursor-pointer outline-none",
                        (pathname === "/reports" || pathname === "/settings" || isMenuOpen) && "text-blue-600 dark:text-cyan-400 font-semibold"
                    )}
                >
                    <Menu className={cn("h-5 w-5 transition-transform duration-300", isMenuOpen && "rotate-90")} />
                    <span className="text-[10px] mt-1 tracking-wide">Lainnya</span>
                    {(pathname === "/reports" || pathname === "/settings") && !isMenuOpen && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-cyan-400" />
                    )}
                </button>
            </div>

            {/* Slide-up Liquid Glass Drawer for 'Lainnya' */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs z-50 animate-fade-in flex items-end justify-center">
                    {/* Backdrop Click to Close */}
                    <div className="absolute inset-0" onClick={() => setIsMenuOpen(false)} />

                    {/* Bottom Drawer Card */}
                    <div className="relative w-full max-w-lg bg-white/85 dark:bg-[#090e1f]/90 backdrop-blur-2xl border-t border-x border-white/20 dark:border-white/10 rounded-t-3xl shadow-2xl p-6 pb-10 z-10 animate-slide-up flex flex-col gap-4">
                        {/* Drawer Handle bar */}
                        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-2 shrink-0" />

                        {/* Title & Close */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Menu Lainnya</h3>
                            <button 
                                onClick={() => setIsMenuOpen(false)}
                                className="h-8 w-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition cursor-pointer"
                            >
                                <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            </button>
                        </div>

                        {/* Menu Options Grid */}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            {/* Laporan option */}
                            <Link
                                href="/reports"
                                onClick={() => setIsMenuOpen(false)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 active:scale-95",
                                    pathname === "/reports"
                                        ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-400 font-semibold"
                                        : "bg-slate-50/50 dark:bg-white/5 border-slate-200/50 dark:border-white/5 text-slate-700 dark:text-slate-300"
                                )}
                            >
                                <div className="h-10 w-10 rounded-xl bg-blue-500/10 dark:bg-cyan-500/10 flex items-center justify-center border border-blue-500/10 dark:border-cyan-500/10 mb-2">
                                    <ArrowRightLeft className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                                </div>
                                <span className="text-sm">Laporan</span>
                            </Link>

                            {/* Pengaturan option */}
                            <Link
                                href="/settings"
                                onClick={() => setIsMenuOpen(false)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 active:scale-95",
                                    pathname === "/settings"
                                        ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-400 font-semibold"
                                        : "bg-slate-50/50 dark:bg-white/5 border-slate-200/50 dark:border-white/5 text-slate-700 dark:text-slate-300"
                                )}
                            >
                                <div className="h-10 w-10 rounded-xl bg-blue-500/10 dark:bg-cyan-500/10 flex items-center justify-center border border-blue-500/10 dark:border-cyan-500/10 mb-2">
                                    <Settings className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                                </div>
                                <span className="text-sm">Pengaturan</span>
                            </Link>
                        </div>

                        {/* Logout Option */}
                        <button
                            onClick={() => {
                                setIsMenuOpen(false)
                                logout()
                            }}
                            className="w-full flex items-center justify-center gap-2 p-3 mt-2 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold transition active:scale-98 cursor-pointer"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Keluar dari Aplikasi</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
