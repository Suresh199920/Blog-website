"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 focus-visible:outline-primary-600 shadow-sm",
  secondary:
    "bg-accent-500 text-neutral-950 hover:bg-accent-400 focus-visible:outline-accent-500 shadow-sm",
  outline:
    "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400 focus-visible:outline-neutral-400",
  ghost:
    "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-neutral-400",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 shadow-sm",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-7 text-base gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-60",
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <span
            aria-hidden
            className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        )}
        {children}
      </button>
    );
  }
);
