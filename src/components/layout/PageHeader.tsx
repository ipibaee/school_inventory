import { cn } from "@/lib/utils"

interface PageHeaderProps {
    title: string
    subtitle?: string
    actions?: React.ReactNode
    className?: string
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
    return (
        <div className={cn("hidden lg:flex items-center justify-between gap-4 mb-6", className)}>
            <div className="flex flex-col gap-1">
                <h1 className="text-[27px] font-extrabold leading-tight tracking-[-0.8px] text-ink">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-[13.5px] text-muted-ink">
                        {subtitle}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-2.5">
                    {actions}
                </div>
            )}
        </div>
    )
}
