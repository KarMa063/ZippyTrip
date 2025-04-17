import * as React from "react"
import { cn } from "../glib/utils"

const createCardPart = (
  Component: React.ElementType,
  defaultClass: string
) => {
  return React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
    ({ className, ...props }, ref) => (
      <Component ref={ref} className={cn(defaultClass, className)} {...props} />
    )
  )
}

const Card = createCardPart("div", "rounded-lg border bg-card text-card-foreground shadow-sm")
const CardHeader = createCardPart("div", "flex flex-col space-y-1.5 p-6")
const CardTitle = createCardPart("h3", "text-2xl font-semibold leading-none tracking-tight")
const CardDescription = createCardPart("p", "text-sm text-muted-foreground")
const CardContent = createCardPart("div", "p-6 pt-0")
const CardFooter = createCardPart("div", "flex items-center p-6 pt-0")

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
