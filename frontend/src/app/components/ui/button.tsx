import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex min-h-11 min-w-0 items-center justify-center gap-2 whitespace-normal rounded-lg text-center text-base font-semibold leading-tight transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 sm:whitespace-nowrap [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 [&_svg]:shrink-0 outline-none focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-[var(--primary-hover)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-[var(--destructive-hover)] focus-visible:outline-destructive",
        outline:
          "border-2 border-border bg-background text-foreground hover:border-primary hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-[var(--secondary-hover)]",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        link: "min-h-0 px-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-5 py-3 has-[>svg]:px-4",
        sm: "min-h-10 rounded-lg gap-1.5 px-4 py-2 text-[0.95rem] has-[>svg]:px-3",
        lg: "min-h-12 rounded-xl px-7 py-4 text-lg has-[>svg]:px-5",
        icon: "size-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
