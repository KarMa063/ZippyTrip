import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "../glib/utils"

const createTabsPart = (
  Component: React.ElementType,
  defaultClass: string
) => {
  return React.forwardRef<React.ElementRef<typeof Component>, React.ComponentPropsWithoutRef<typeof Component>>(
    ({ className, ...props }, ref) => (
      <Component ref={ref} className={cn(defaultClass, className)} {...props} />
    )
  )
}

const Tabs = TabsPrimitive.Root
const TabsList = createTabsPart(TabsPrimitive.List, "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground")
const TabsTrigger = createTabsPart(TabsPrimitive.Trigger, "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm")
const TabsContent = createTabsPart(TabsPrimitive.Content, "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2")

export { Tabs, TabsList, TabsTrigger, TabsContent }
