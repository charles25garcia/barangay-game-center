"use client";

import { FormEvent, useState } from "react";
import { Button, FormField } from "@shared/components";
import { validateShareAmount } from "@shared/helpers";

interface ShareCoinsFormProps {
  balance: number;
  dailyRemaining: number;
  selfName: string;
  onShare: (input: { recipientName: string; amount: number; note?: string }) => void;
}

export function ShareCoinsForm({ balance, dailyRemaining, selfName, onShare }: ShareCoinsFormProps) {
  const [recipientName, setRecipientName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = Number(amount);
    const validationError = validateShareAmount({
      amount: parsedAmount,
      balance,
      dailyRemaining,
      recipientName,
      selfName,
    });

    if (validationError) {
      setError(validationError);
      setSuccess(false);
      return;
    }

    setError(null);
    onShare({ recipientName: recipientName.trim(), amount: parsedAmount, note: note.trim() || undefined });
    setSuccess(true);
    setRecipientName("");
    setAmount("");
    setNote("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <FormField label="Recipient name" htmlFor="recipientName">
        <input
          id="recipientName"
          value={recipientName}
          onChange={(event) => {
            setSuccess(false);
            setRecipientName(event.target.value);
          }}
          placeholder="e.g. Maria Santos"
          className="platform-field"
        />
      </FormField>

      <FormField label="Amount" htmlFor="amount">
        <input
          id="amount"
          type="number"
          min={1}
          value={amount}
          onChange={(event) => {
            setSuccess(false);
            setAmount(event.target.value);
          }}
          className="platform-field"
        />
      </FormField>

      <FormField label="Note (optional)" htmlFor="note">
        <input
          id="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="platform-field"
        />
      </FormField>

      {error ? (
        <p role="alert" className="text-sm text-rose-400">
          {error}
        </p>
      ) : null}

      <Button type="submit">Share coins</Button>

      {success ? (
        <p role="status" className="text-sm text-emerald-400">
          Coins shared successfully.
        </p>
      ) : null}
    </form>
  );
}
