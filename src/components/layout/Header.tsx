"use client"

import { Button } from "@/components/ui/button"
import { Menu, PanelLeftOpen, PanelLeftClose } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/layout/Sidebar"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { useEffect, useState } from "react"
import { User } from "next-auth"

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
        <div className="flex items-center justify-between px-6 py-4 bg-white/10 dark:bg-black/10 backdrop-blur-md border-b border-border/30 dark:border-white/5 h-16 transition-all duration-300">
            <div className="flex items-center gap-3">
                {/* Mobile Menu trigger */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden text-slate-600 dark:text-slate-300 h-9 w-9 rounded-xl hover:bg-slate-100/50 dark:hover:bg-white/5 active:scale-95 cursor-pointer">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 bg-transparent border-0 w-72 shadow-2xl">
                        <Sidebar user={user} settings={settings} />
                    </SheetContent>
                </Sheet>
                
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
            
            <div className="flex items-center gap-4">
                <ThemeToggle />
            </div>
        </div>
    )
}
