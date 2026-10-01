"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_ROUTES } from "@code/routers";
import { selectPlayerProfile, useAppSelector } from "@code/state";

export function SideNav() {
  const pathname = usePathname();
  const profile = useAppSelector(selectPlayerProfile);

  const visibleRoutes = APP_ROUTES.filter(
    (route) => !route.restrictedToRoles || route.restrictedToRoles.includes(profile.role)
  );

  return (
    <nav aria-label="Primary" className="flex flex-col gap-1">
      {visibleRoutes.map((route) => {
        const isActive = pathname === route.path;
        return (
          <Link
            key={route.path}
            href={route.path}
            aria-current={isActive ? "page" : undefined}
              className={`platform-rise flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              isActive
                ? "bg-[var(--mint)] text-[var(--navy)]"
                : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--navy)]"
            }`}
          >
            <span aria-hidden="true">{route.icon}</span>
            {route.label}
          </Link>
        );
      })}
    </nav>
  );
}
