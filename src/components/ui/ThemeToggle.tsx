"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="w-[108px] h-9 bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 rounded-xl animate-pulse" />
        )
    }

    const options = [
        { value: "light", icon: Sun, label: "Terang" },
        { value: "dark", icon: Moon, label: "Gelap" },
        { value: "system", icon: Monitor, label: "Sistem" }
    ]

    return (
        <div className="flex items-center gap-1 p-1 bg-white/10 dark:bg-black/20 border border-border/50 dark:border-white/5 rounded-xl backdrop-blur-md">
            {options.map((opt) => {
                const Icon = opt.icon
                const isActive = theme === opt.value

                return (
                    <button
                        key={opt.value}
                        onClick={() => setTheme(opt.value)}
                        className={cn(
                            "p-1.5 rounded-lg transition-all duration-200 cursor-pointer outline-none relative hover:text-foreground active:scale-95",
                            isActive 
                                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-cyan-400 shadow-xs border border-black/5 dark:border-white/5 scale-105" 
                                : "text-muted-foreground hover:bg-white/5 dark:hover:bg-white/5"
                        )}
                        title={opt.label}
                    >
                        <Icon className="h-4 w-4" />
                    </button>
                )
            })}
        </div>
    )
}
