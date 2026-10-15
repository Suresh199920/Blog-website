import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
          <Icon className="size-6 text-neutral-400" aria-hidden />
        </div>
      )}
      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-neutral-500">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 py-16"
    >
      <span
        aria-hidden
        className="size-8 animate-spin rounded-full border-[3px] border-neutral-200 border-t-primary-600"
      />
      {label && <p className="text-sm text-neutral-500">{label}</p>}
      <span className="sr-only">{label ?? "Loading"}</span>
    </div>
  );
}
