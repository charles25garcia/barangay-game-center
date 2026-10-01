interface AvatarProps {
  emoji: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-lg",
  md: "h-12 w-12 text-2xl",
  lg: "h-16 w-16 text-3xl",
};

export function Avatar({ emoji, name, size = "md" }: AvatarProps) {
  return (
    <span
      role="img"
      aria-label={`${name}'s avatar`}
      className={`flex items-center justify-center rounded-full bg-slate-800 ${SIZE_CLASSES[size]}`}
    >
      {emoji}
    </span>
  );
}
