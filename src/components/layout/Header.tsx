"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/layout/Sidebar"
import { useEffect, useState } from "react"

export function Header() {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return null
    }

    return (
        <div className="flex items-center p-4">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 bg-[#111827]">
                    <Sidebar />
                </SheetContent>
            </Sheet>
            <div className="flex w-full justify-end">
                {/* UserButton or ThemeToggle can go here */}
            </div>
        </div>
    )
}
