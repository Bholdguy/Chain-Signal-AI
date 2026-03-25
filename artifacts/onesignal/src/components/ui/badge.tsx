import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-mono font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary/10 text-primary": variant === "default",
          "border-transparent bg-success/10 text-success": variant === "success",
          "border-transparent bg-warning/10 text-warning": variant === "warning",
          "border-transparent bg-destructive/10 text-destructive": variant === "destructive",
          "text-foreground border-border": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}
