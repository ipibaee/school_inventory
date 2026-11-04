"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
    compact?: boolean
    className?: string
}

export function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div
                className={cn(
                    "rounded-[10px] bg-surface border border-line animate-pulse",
                    compact ? "size-8 rounded-[9px]" : "size-[38px]",
                    className
                )}
            />
        )
    }

    const isDark = resolvedTheme === "dark"

    return (
        <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
                "grid place-items-center bg-surface border border-line text-muted-ink hover:text-ink hover:bg-surface-2 transition-colors cursor-pointer",
                compact ? "size-8 rounded-[9px]" : "size-[38px] rounded-[10px]",
                className
            )}
            title={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
        >
            {isDark ? (
                <Sun className={compact ? "size-3.5" : "size-4"} />
            ) : (
                <Moon className={compact ? "size-3.5" : "size-4"} />
            )}
        </button>
    )
}
