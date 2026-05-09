import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-green)] text-white border-b-[5px] border-[var(--color-green-dark)] active:border-b-0 active:translate-y-[5px]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-[var(--color-text-muted)] hover:text-[var(--color-blue)] hover:bg-[var(--color-page-bg)] font-bold no-underline border-none bg-transparent",
        link: "text-primary underline-offset-4 hover:underline",
        game: "items-center rounded-[var(--radius-md)] cursor-pointer inline-flex text-[15px] font-black justify-center px-6 py-3 uppercase transition-all duration-100 ease-in-out bg-[var(--color-green)] border-b-[5px] border-[var(--color-green-dark)] text-white active:border-b-0 active:translate-y-[5px]",
        gameBlue: "items-center rounded-[var(--radius-md)] cursor-pointer inline-flex text-[15px] font-black justify-center px-6 py-3 uppercase transition-all duration-100 ease-in-out bg-[var(--color-blue)] border-b-[var(--color-blue-dark)] border-b-[5px] text-white hover:opacity-90 active:border-b-0 active:translate-y-[5px]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        xl: "h-14 px-10 text-lg rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
