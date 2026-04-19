import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md sera-button transition-[background-color,color,border-color,box-shadow,transform] duration-base ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:-translate-y-px hover:shadow-soft",
        destructive: "bg-destructive text-destructive-foreground shadow-xs hover:-translate-y-px hover:shadow-soft",
        outline: "border border-input bg-background text-foreground hover:bg-secondary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-foreground hover:bg-secondary",
        link: "text-primary underline-offset-4 hover:underline",
        sera: "bg-sera-navy text-sera-ivory shadow-xs hover:-translate-y-px hover:bg-sera-deep-navy hover:shadow-soft",
        "sera-outline": "border border-sera-navy/65 bg-transparent text-sera-navy hover:bg-sera-navy hover:text-sera-ivory",
        "sera-accent": "bg-sera-oxblood text-sera-ivory shadow-xs hover:-translate-y-px hover:bg-sera-oxblood-soft hover:shadow-soft",
        "sera-ivory": "bg-sera-ivory text-sera-navy shadow-xs hover:-translate-y-px hover:bg-sera-beige hover:shadow-soft",
        "sera-ghost": "bg-transparent text-sera-navy hover:bg-sera-navy/10",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-7",
        xl: "h-14 px-9 text-[0.9rem]",
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
