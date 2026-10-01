"use client";

import { FormEvent, useState } from "react";
import { Button, FormField } from "@shared/components";
import { validateMissionBonus } from "@shared/helpers";

interface MissionBonusFormProps {
  currentBonusCoins: number;
  onSubmitBonus: (bonusCoins: number) => void;
}

export function MissionBonusForm({ currentBonusCoins, onSubmitBonus }: MissionBonusFormProps) {
  const [bonusCoins, setBonusCoins] = useState(String(currentBonusCoins));
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = Number(bonusCoins);
    const validationError = validateMissionBonus(parsedAmount);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onSubmitBonus(parsedAmount);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <FormField label="Bonus coins" htmlFor="mission-bonus" error={error}>
        <input
          id="mission-bonus"
          type="number"
          min={1}
          value={bonusCoins}
          onChange={(event) => setBonusCoins(event.target.value)}
          className="platform-field w-32"
        />
      </FormField>

      <Button type="submit">Save bonus</Button>
    </form>
  );
}
