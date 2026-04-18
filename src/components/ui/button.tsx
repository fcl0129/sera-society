import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md text-sm",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-md text-sm",
        link: "text-primary underline-offset-4 hover:underline text-sm",
        sera: "bg-sera-navy text-sera-ivory hover:bg-sera-deep-navy active:bg-sera-ink rounded-none sera-button shadow-sm hover:shadow-md active:shadow-none active:translate-y-[0.5px]",
        "sera-outline": "border-[1.5px] border-sera-navy text-sera-navy hover:bg-sera-navy hover:text-sera-ivory active:bg-sera-deep-navy rounded-none sera-button",
        "sera-accent": "bg-sera-oxblood text-sera-ivory hover:bg-sera-oxblood-soft active:bg-sera-oxblood rounded-none sera-button shadow-sm hover:shadow-md active:shadow-none active:translate-y-[0.5px]",
        "sera-ivory": "bg-sera-ivory text-sera-navy hover:bg-sera-beige active:bg-sera-sand rounded-none sera-button shadow-sm hover:shadow-md active:shadow-none active:translate-y-[0.5px]",
        "sera-ghost": "text-sera-navy hover:bg-sera-navy/5 active:bg-sera-navy/10 rounded-none sera-button",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-8",
        xl: "h-14 px-10 text-[12px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
