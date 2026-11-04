"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  variant = "segmented",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: "segmented" | "underline"
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        variant === "segmented"
          ? "inline-flex h-10 items-center justify-center rounded-[11px] p-1 bg-surface border border-line gap-1 text-muted-ink"
          : "inline-flex items-center gap-6 border-b border-line bg-transparent p-0 h-auto w-full",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap text-[13px] font-bold transition-colors cursor-pointer outline-none disabled:pointer-events-none disabled:opacity-45",
        "data-[state=active]:text-white data-[state=active]:bg-brand rounded-[8px] px-3.5 py-1.5 text-muted-ink hover:text-ink",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // When inside underline list:
        "group-data-[variant=underline]:rounded-none group-data-[variant=underline]:border-b-2 group-data-[variant=underline]:border-transparent group-data-[variant=underline]:data-[state=active]:border-brand group-data-[variant=underline]:data-[state=active]:bg-transparent group-data-[variant=underline]:data-[state=active]:text-brand group-data-[variant=underline]:px-1 group-data-[variant=underline]:py-2.5",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
