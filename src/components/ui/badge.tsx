import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-[7px] rounded-full px-[11px] py-[3px] text-[11.5px] font-bold w-fit whitespace-nowrap shrink-0 transition-colors border border-transparent",
  {
    variants: {
      variant: {
        default: "bg-brand-soft text-brand",
        brand: "bg-brand-soft text-brand",
        mint: "bg-mint-soft text-mint",
        available: "bg-mint-soft text-mint",
        amber: "bg-amber-soft text-amber",
        warning: "bg-amber-soft text-amber",
        rose: "bg-rose-soft text-rose",
        destructive: "bg-rose-soft text-rose",
        secondary: "bg-brand-soft text-brand-deep",
        outline: "bg-surface border-line text-ink-soft",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
  dot?: boolean
}

function Badge({
  className,
  variant,
  asChild = false,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span"

  const dotColorClass = {
    default: "bg-brand",
    brand: "bg-brand",
    mint: "bg-mint",
    available: "bg-mint",
    amber: "bg-amber",
    warning: "bg-amber",
    rose: "bg-rose",
    destructive: "bg-rose",
    secondary: "bg-brand-deep",
    outline: "bg-ink-soft",
  }[variant || "default"]

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {dot && <span className={cn("size-1.5 rounded-full shrink-0", dotColorClass)} />}
      {children}
    </Comp>
  )
}

export { Badge, badgeVariants }
