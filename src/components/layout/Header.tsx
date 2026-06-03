"use client"

import { Button } from "@/components/ui/button"
import { PanelLeftOpen, PanelLeftClose, School, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { useEffect, useState } from "react"
import { User } from "next-auth"
import { logout } from "@/actions/auth"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
    isCollapsed?: boolean
    onToggleCollapse?: () => void
    user?: User
    settings?: any
}

export function Header({ isCollapsed, onToggleCollapse, user, settings }: HeaderProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return null
    }

    return (
        <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-white/10 dark:bg-black/10 backdrop-blur-md border-b border-border/30 dark:border-white/5 h-16 transition-all duration-300">
            <div className="flex items-center gap-3">
                {/* Mobile school branding */}
                <div className="md:hidden flex items-center gap-2 select-none">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center overflow-hidden shrink-0">
                        {settings?.logoUrl ? (
                            <img src={settings.logoUrl} alt="Logo" className="w-5 h-5 object-contain" />
                        ) : (
                            <School className="w-4.5 h-4.5 text-blue-600 dark:text-cyan-400" />
                        )}
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                        {settings?.schoolName || "Inventaris"}
                    </span>
                </div>
                
                {/* Desktop Collapse Trigger */}
                {onToggleCollapse && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onToggleCollapse} 
                        className="hidden md:flex text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 h-9 w-9 rounded-xl hover:bg-slate-100/50 dark:hover:bg-white/5 active:scale-95 cursor-pointer"
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                    </Button>
                )}
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
                <ThemeToggle />

                {/* Mobile avatar / logout quick access */}
                <div className="md:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="h-8 w-8 rounded-full border border-blue-500/20 flex items-center justify-center overflow-hidden cursor-pointer outline-none relative active:scale-95 transition">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.image || ""} />
                                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold">
                                        {user?.name?.charAt(0).toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48 glass-card border border-border/50 dark:border-white/5 mt-1" align="end">
                            <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {user?.name || "User"}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border/50 dark:bg-white/5" />
                            <DropdownMenuItem onClick={() => logout()} className="text-red-600 dark:text-red-400 focus:bg-red-500/10 cursor-pointer rounded-lg p-2 text-xs font-medium">
                                <LogOut className="mr-2 h-3.5 w-3.5" />
                                <span>Keluar</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    )
}
