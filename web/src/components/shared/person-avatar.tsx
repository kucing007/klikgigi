import { cn } from "@/lib/utils";
import { initials as toInitials } from "@/lib/format";

/** Initials avatar. Uses neutral surface + optional accent ring for doctors. */
export function PersonAvatar({
  name,
  color,
  size = "md",
  className,
}: {
  name: string;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const sz = { xs: "size-5 text-[9px]", sm: "size-6 text-[10px]", md: "size-8 text-xs", lg: "size-11 text-sm" }[size];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border bg-subtle font-semibold text-foreground/80",
        sz,
        className,
      )}
      style={color ? { backgroundColor: `color-mix(in oklab, ${color} 12%, var(--card))`, color: `color-mix(in oklab, ${color} 80%, var(--foreground))`, borderColor: `color-mix(in oklab, ${color} 25%, transparent)` } : undefined}
      aria-hidden
    >
      {toInitials(name)}
    </span>
  );
}
