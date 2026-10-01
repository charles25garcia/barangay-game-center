interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string | null;
  children: React.ReactNode;
}

export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-[var(--ink)]">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-sm text-[var(--coral)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
