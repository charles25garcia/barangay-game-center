interface BadgeProps {
  label: string;
}

export function Badge({ label }: BadgeProps) {
  return (
    <span className="whitespace-nowrap rounded-full bg-emerald-600/20 px-2 py-1 text-xs font-semibold text-emerald-300">
      {label}
    </span>
  );
}
