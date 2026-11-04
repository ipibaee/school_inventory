import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-[13.5px] font-bold transition-colors disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-brand/40 active:translate-y-px cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-brand text-white hover:bg-brand/90 shadow-none",
        primary: "bg-brand text-white hover:bg-brand/90 shadow-none",
        destructive: "bg-rose-soft text-rose hover:bg-rose-soft/80 border border-transparent",
        danger: "bg-rose-soft text-rose hover:bg-rose-soft/80 border border-transparent",
        outline: "bg-surface text-ink-soft border border-line hover:bg-surface-2",
        secondary: "bg-surface text-ink-soft border border-line hover:bg-surface-2",
        soft: "bg-brand-soft text-brand-deep hover:bg-brand-soft/80",
        ghost: "text-muted-ink hover:text-ink hover:bg-surface-2",
        link: "text-brand underline-offset-4 hover:underline",
        icon: "bg-surface text-muted-ink border border-line hover:text-ink hover:bg-surface-2",
      },
      size: {
        default: "h-10 px-[18px] py-[11px]",
        sm: "h-8 rounded-[9px] px-3.5 py-1.5 text-xs",
        lg: "h-11 rounded-[10px] px-6 text-sm",
        icon: "size-[38px] p-0",
        "icon-sm": "size-8 rounded-[9px] p-0",
        "icon-lg": "size-11 rounded-[10px] p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
