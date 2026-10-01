import type { ReactNode } from "react";
import { AuthorRole } from "@shared/enums";
import { Card } from "@shared/components";
import { ROLE_LABELS } from "@shared/utils";

interface RequireRoleProps {
  currentRole: AuthorRole;
  allowedRoles: AuthorRole[];
  children: ReactNode;
}

/** Renders children only when currentRole is included in allowedRoles; otherwise shows a restricted message. */
export function RequireRole({ currentRole, allowedRoles, children }: RequireRoleProps) {
  if (!allowedRoles.includes(currentRole)) {
    return (
      <Card className="border-rose-900/60">
        <h2 className="text-lg font-semibold text-white">Access restricted</h2>
        <p className="text-sm text-slate-400">
          This page is only available to {allowedRoles.map((role) => ROLE_LABELS[role]).join(" or ")}{" "}
          accounts. Your current role is {ROLE_LABELS[currentRole]}. Change your role from the Profile
          page to preview this section in this prototype.
        </p>
      </Card>
    );
  }

  return <>{children}</>;
}
