"use client";

import { Card } from "@shared/components";
import { profileUpdated, selectPlayerProfile, useAppDispatch, useAppSelector } from "@code/state";
import type { ProfileUpdateInput } from "@shared/types";
import { ProfileForm } from "./components/ProfileForm";
import { ResetDemoDataCard } from "./components/ResetDemoDataCard";

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectPlayerProfile);

  function handleSave(values: ProfileUpdateInput) {
    dispatch(profileUpdated(values));
  }

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h2 className="platform-heading text-xl font-bold">Manage your account</h2>
        <p className="platform-copy text-sm">Update your display name, barangay, and avatar.</p>
      </header>

      <Card>
        <ProfileForm initialValues={profile} onSave={handleSave} />
      </Card>

      <ResetDemoDataCard />
    </section>
  );
}
