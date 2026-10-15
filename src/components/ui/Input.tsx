"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

const CONTROL =
  "w-full rounded-lg border bg-white px-3.5 text-sm text-neutral-900 " +
  "placeholder:text-neutral-400 transition-colors " +
  "focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 " +
  "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500";

function useFieldIds(provided?: string) {
  const generated = useId();
  const id = provided || `field-${generated}`;
  return { id, labelId: `${id}-label`, errorId: `${id}-error` };
}

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...props },
  ref
) {
  const ids = useFieldIds(id);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={ids.id}
          className="mb-1.5 block text-sm font-medium text-neutral-800"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={ids.id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? ids.errorId : hint ? `${ids.id}-hint` : undefined}
        className={cn(
          CONTROL,
          "h-11",
          error ? "border-red-400" : "border-neutral-300",
          className
        )}
        {...props}
      />
      {hint && !error && (
        <p id={`${ids.id}-hint`} className="mt-1.5 text-xs text-neutral-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={ids.errorId} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    error?: string;
    hint?: string;
  }
>(function Textarea({ label, error, hint, className, id, rows = 4, ...props }, ref) {
  const ids = useFieldIds(id);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={ids.id}
          className="mb-1.5 block text-sm font-medium text-neutral-800"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={ids.id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? ids.errorId : hint ? `${ids.id}-hint` : undefined}
        className={cn(
          CONTROL,
          "resize-y py-2.5 leading-relaxed",
          error ? "border-red-400" : "border-neutral-300",
          className
        )}
        {...props}
      />
      {hint && !error && (
        <p id={`${ids.id}-hint`} className="mt-1.5 text-xs text-neutral-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={ids.errorId} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    error?: string;
    hint?: string;
  }
>(function Select({ label, error, hint, className, id, children, ...props }, ref) {
  const ids = useFieldIds(id);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={ids.id}
          className="mb-1.5 block text-sm font-medium text-neutral-800"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={ids.id}
        aria-invalid={error ? true : undefined}
        className={cn(
          CONTROL,
          "h-11 cursor-pointer pr-9",
          error ? "border-red-400" : "border-neutral-300",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {hint && !error && (
        <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>
      )}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & { label?: React.ReactNode };

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, className, id, ...props }, ref) {
    const generated = useId();
    const inputId = id || `check-${generated}`;

    return (
      <div className="flex items-center gap-2.5">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={cn(
            "size-4 cursor-pointer shrink-0 rounded border-neutral-300 text-primary-600",
            "focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-0",
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={inputId}
            className="cursor-pointer text-sm text-neutral-700 select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
