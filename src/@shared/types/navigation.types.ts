import type { AuthorRole } from "@shared/enums";

export interface AppRoute {
  path: string;
  label: string;
  icon: string;
  description: string;
  restrictedToRoles?: AuthorRole[];
}

