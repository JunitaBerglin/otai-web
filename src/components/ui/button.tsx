/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#213E35] text-white hover:bg-[#1a3229] active:bg-[#152820] shadow-sm hover:shadow-md",
        destructive:
          "bg-[#d4183d] text-white hover:bg-[#b01432] active:bg-[#8f1028] shadow-sm hover:shadow-md",
        outline:
          "border-2 border-[#213E35] bg-white text-[#213E35] hover:bg-[#f8f8f8] active:bg-[#f0f0f0]",
        secondary:
          "bg-[#F8E6EC] text-[#213E35] hover:bg-[#f0d4df] active:bg-[#e8c2d2] shadow-sm",
        ghost: "text-[#213E35] hover:bg-[#F8E6EC] active:bg-[#f0d4df]",
        link: "text-[#213E35] underline-offset-4 hover:underline hover:text-[#1a3229]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
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
