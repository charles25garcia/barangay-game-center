import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className = "", children, ...rest }: CardProps) {
  return (
    <div
      className={`platform-scale rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
