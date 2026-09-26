import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-md border bg-white px-3 py-1 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50",
        invalid ? "border-red-400" : "border-neutral-300",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
