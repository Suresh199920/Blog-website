import { cn } from "@/lib/utils";

type Variant = "default" | "primary" | "accent" | "outline" | "success";

const VARIANTS: Record<Variant, string> = {
  default: "bg-neutral-100 text-neutral-700",
  primary: "bg-primary-50 text-primary-700",
  accent: "bg-accent-100 text-accent-800",
  outline: "border border-neutral-300 text-neutral-600",
  success: "bg-emerald-50 text-emerald-700",
};

export function Badge({
  variant = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}
