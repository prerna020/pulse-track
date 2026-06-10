import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#1a1208] text-white",
        secondary:
          "border-transparent bg-[rgba(26,18,8,0.05)] text-[#5c4a32]",
        outline: "border-[rgba(26,18,8,0.1)] text-[#1a1208]",
        destructive:
          "border-transparent bg-[#fdf0ee] text-[#a63d2f]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
