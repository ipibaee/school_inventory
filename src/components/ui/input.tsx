import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[10px] border border-line bg-surface px-3.5 py-2 text-[13px] text-ink placeholder:text-muted-ink transition-colors outline-none",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-xs file:font-semibold file:text-ink",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45",
        "focus:border-brand focus:ring-2 focus:ring-brand/25",
        "aria-invalid:border-rose aria-invalid:ring-2 aria-invalid:ring-rose/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
