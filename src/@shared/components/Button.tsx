"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--teal)] text-white hover:bg-[#267b70] focus-visible:outline-[var(--teal)] disabled:bg-slate-300",
  secondary:
    "bg-[var(--navy)] text-white hover:bg-[#1d504d] focus-visible:outline-[var(--navy)] disabled:bg-slate-300",
  ghost:
    "bg-transparent text-[var(--muted)] hover:bg-[var(--mint)] focus-visible:outline-[var(--teal)] disabled:text-slate-400",
  danger:
    "bg-rose-600 text-white hover:bg-rose-500 focus-visible:outline-rose-600 disabled:bg-rose-300",
};

export function Button({ variant = "primary", className = "", disabled, children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
