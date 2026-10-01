import { AuthorRole } from "@shared/enums";

export const ROLE_LABELS: Record<AuthorRole, string> = {
  [AuthorRole.Player]: "Player",
  [AuthorRole.BrgyAdmin]: "Brgy Admin",
  [AuthorRole.SuperAdmin]: "Super Admin",
};

/** Roles allowed to access the SuperAdmin/Brgy Admin management pages. */
export const ADMIN_ROLES: AuthorRole[] = [AuthorRole.SuperAdmin, AuthorRole.BrgyAdmin];

