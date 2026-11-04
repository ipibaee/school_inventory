import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-[80px] w-full rounded-[10px] border border-line bg-surface px-3.5 py-2.5 text-[13px] text-ink placeholder:text-muted-ink transition-colors outline-none",
        "disabled:cursor-not-allowed disabled:opacity-45",
        "focus:border-brand focus:ring-2 focus:ring-brand/25",
        "aria-invalid:border-rose aria-invalid:ring-2 aria-invalid:ring-rose/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
