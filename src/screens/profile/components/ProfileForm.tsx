"use client";

import { FormEvent, useState } from "react";
import { Button, FormField } from "@shared/components";
import { AuthorRole } from "@shared/enums";
import type { ProfileUpdateInput } from "@shared/types";
import { ROLE_LABELS } from "@shared/utils";

interface ProfileFormProps {
  initialValues: ProfileUpdateInput;
  onSave: (values: ProfileUpdateInput) => void;
}

const AVATAR_OPTIONS = ["🧑\u200d🌾", "🧑\u200d💻", "🧑\u200d🎨", "🧑\u200d🚀", "🧑\u200d🏫", "🧑\u200d⚕️"];
const ROLE_OPTIONS: AuthorRole[] = [AuthorRole.Player, AuthorRole.BrgyAdmin, AuthorRole.SuperAdmin];

export function ProfileForm({ initialValues, onSave }: ProfileFormProps) {
  const [values, setValues] = useState<ProfileUpdateInput>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.displayName.trim()) {
      setError("Display name is required.");
      setSaved(false);
      return;
    }
    if (!values.homeBarangay.trim()) {
      setError("Home barangay is required.");
      setSaved(false);
      return;
    }
    setError(null);
    onSave(values);
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <FormField label="Display name" htmlFor="displayName" error={error && !values.displayName.trim() ? error : null}>
        <input
          id="displayName"
          value={values.displayName}
          onChange={(event) => {
            setSaved(false);
            setValues((prev) => ({ ...prev, displayName: event.target.value }));
          }}
          className="platform-field"
        />
      </FormField>

      <FormField label="Home barangay" htmlFor="homeBarangay" error={error && !values.homeBarangay.trim() ? error : null}>
        <input
          id="homeBarangay"
          value={values.homeBarangay}
          onChange={(event) => {
            setSaved(false);
            setValues((prev) => ({ ...prev, homeBarangay: event.target.value }));
          }}
          className="platform-field"
        />
      </FormField>

      <FormField label="Bio" htmlFor="bio">
        <textarea
          id="bio"
          value={values.bio}
          onChange={(event) => {
            setSaved(false);
            setValues((prev) => ({ ...prev, bio: event.target.value }));
          }}
          rows={3}
          className="platform-field"
        />
      </FormField>

      <FormField label="Role (prototype only)" htmlFor="role">
        <select
          id="role"
          value={values.role}
          onChange={(event) => {
            setSaved(false);
            setValues((prev) => ({ ...prev, role: event.target.value as AuthorRole }));
          }}
          className="platform-field"
        >
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Avatar" htmlFor="avatarEmoji">
        <div className="flex gap-2" role="radiogroup" aria-label="Avatar">
          {AVATAR_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              role="radio"
              aria-checked={values.avatarEmoji === emoji}
              onClick={() => {
                setSaved(false);
                setValues((prev) => ({ ...prev, avatarEmoji: emoji }));
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${
                values.avatarEmoji === emoji ? "bg-emerald-600/40 ring-2 ring-emerald-400" : "bg-slate-800"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </FormField>

      <Button type="submit">Save profile</Button>

      {saved ? (
        <p role="status" className="text-sm text-emerald-400">
          Profile updated.
        </p>
      ) : null}
    </form>
  );
}
