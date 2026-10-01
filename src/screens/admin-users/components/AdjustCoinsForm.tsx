"use client";

import { FormEvent, useState } from "react";
import { Button, FormField } from "@shared/components";
import { CoinAdjustmentType } from "@shared/enums";
import { validateCoinAdjustment } from "@shared/helpers";

interface AdjustCoinsFormProps {
  balance: number;
  onAdjust: (input: { type: CoinAdjustmentType; amount: number; reason: string }) => void;
}

export function AdjustCoinsForm({ balance, onAdjust }: AdjustCoinsFormProps) {
  const [type, setType] = useState<CoinAdjustmentType>(CoinAdjustmentType.Credit);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = Number(amount);
    const validationError = validateCoinAdjustment({ amount: parsedAmount, type, reason, balance });

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onAdjust({ type, amount: parsedAmount, reason: reason.trim() });
    setAmount("");
    setReason("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <FormField label="Action" htmlFor={`adjust-type-${balance}`}>
        <select
          id={`adjust-type-${balance}`}
          value={type}
          onChange={(event) => setType(event.target.value as CoinAdjustmentType)}
          className="platform-field"
        >
          <option value={CoinAdjustmentType.Credit}>Add coins</option>
          <option value={CoinAdjustmentType.Debit}>Deduct coins</option>
        </select>
      </FormField>

      <FormField label="Amount" htmlFor="adjust-amount">
        <input
          id="adjust-amount"
          type="number"
          min={1}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="platform-field w-28"
        />
      </FormField>

      <FormField label="Reason" htmlFor="adjust-reason" error={error}>
        <input
          id="adjust-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="e.g. Event bonus"
          className="platform-field"
        />
      </FormField>

      <Button type="submit" variant={type === CoinAdjustmentType.Debit ? "danger" : "primary"}>
        Apply
      </Button>
    </form>
  );
}
