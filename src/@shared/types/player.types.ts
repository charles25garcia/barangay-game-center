import type { AuthorRole } from "@shared/enums";

export interface Player {
  id: string;
  displayName: string;
  avatarEmoji: string;
  homeBarangay: string;
  bio: string;
  role: AuthorRole;
}

export interface ProfileUpdateInput {
  displayName: string;
  avatarEmoji: string;
  homeBarangay: string;
  bio: string;
  role: AuthorRole;
}
