import React from "react"

interface ExecutiveKpiCardProps {
  label: string
  value: React.ReactNode
  unit?: string
  caption: string
  icon: React.ReactNode
  variant?: "brand" | "mint" | "amber"
}

export function ExecutiveKpiCard({
  label,
  value,
  unit,
  caption,
  icon,
  variant = "brand",
}: ExecutiveKpiCardProps) {
  const iconBg =
    variant === "mint"
      ? "bg-mint-soft text-mint"
      : variant === "amber"
      ? "bg-amber-soft text-amber"
      : "bg-brand-soft text-brand"

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 flex flex-col justify-between gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-semibold text-ink-soft">{label}</span>
        <div className={`size-8 rounded-[10px] flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[28px] lg:text-[32px] font-extrabold text-ink tracking-tight leading-none">
            {value}
          </span>
          {unit && <span className="text-xs text-muted-ink font-semibold">{unit}</span>}
        </div>
        <span className="text-[11px] text-muted-ink leading-tight">{caption}</span>
      </div>
    </div>
  )
}
