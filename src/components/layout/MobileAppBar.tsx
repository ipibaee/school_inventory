"use client"

import { GraduationCap, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "next-auth"

interface MobileAppBarProps {
    title: string
    subtitle?: string
    back?: boolean | string
    actions?: React.ReactNode
    user?: User
    showBrandMark?: boolean
}

export function MobileAppBar({
    title,
    subtitle,
    back,
    actions,
    user,
    showBrandMark = false,
}: MobileAppBarProps) {
    const router = useRouter()

    return (
        <header className="lg:hidden flex items-center justify-between px-4 py-3.5 min-h-[59px] w-full bg-app/90 backdrop-blur-none shrink-0 sticky top-0 z-30">
            {/* Left side: Mark or Back + Title */}
            <div className="flex items-center gap-2.5 min-w-0">
                {back ? (
                    typeof back === "string" ? (
                        <Link
                            href={back}
                            className="size-[30px] rounded-[9px] bg-surface border border-line grid place-items-center shrink-0 hover:bg-surface-2 transition-colors"
                        >
                            <ArrowLeft className="size-4 text-ink-soft" />
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="size-[30px] rounded-[9px] bg-surface border border-line grid place-items-center shrink-0 hover:bg-surface-2 transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="size-4 text-ink-soft" />
                        </button>
                    )
                ) : showBrandMark ? (
                    <div className="size-[30px] rounded-[9px] bg-brand grid place-items-center shrink-0">
                        <GraduationCap className="size-4 text-white" />
                    </div>
                ) : null}

                <div className="flex flex-col min-w-0">
                    <h1 className="text-base font-extrabold tracking-[-0.4px] text-ink truncate leading-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <span className="text-[9.5px] text-muted-ink leading-tight truncate">
                            {subtitle}
                        </span>
                    )}
                </div>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-2 shrink-0">
                {actions ? (
                    actions
                ) : (
                    <>
                        <ThemeToggle compact />
                        {user && (
                            <Link href="/settings" title="Pengaturan">
                                <Avatar className="size-8 rounded-full border border-line">
                                    <AvatarImage src={user.image || ""} />
                                    <AvatarFallback className="bg-brand-soft text-brand text-[12px] font-extrabold">
                                        {user.name?.charAt(0).toUpperCase() || "A"}
                                    </AvatarFallback>
                                </Avatar>
                            </Link>
                        )}
                    </>
                )}
            </div>
        </header>
    )
}
