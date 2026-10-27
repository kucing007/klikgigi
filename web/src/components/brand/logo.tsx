import { cn } from "@/lib/utils";

/** KlikGigi mark — a single-stroke tooth inside a rounded square. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-brand text-brand-foreground",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-[70%]" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.5 3.5c-2.5 0-4 2-4 4.6 0 2.3.9 3.7 1.6 5.4.6 1.5.8 3.3 1.2 5 .3 1.3.8 2 1.6 2 1 0 1.3-1.1 1.6-2.6.3-1.6.6-3.4 2.5-3.4s2.2 1.8 2.5 3.4c.3 1.5.6 2.6 1.6 2.6.8 0 1.3-.7 1.6-2 .4-1.7.6-3.5 1.2-5 .7-1.7 1.6-3.1 1.6-5.4 0-2.6-1.5-4.6-4-4.6-1.8 0-2.7 1-4.5 1s-2.7-1-4.5-1Z" />
      </svg>
    </span>
  );
}

export function Logo({ className, withTld = false }: { className?: string; withTld?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <LogoMark />
      <span className="text-[15px]">
        KlikGigi{withTld && <span className="text-muted-foreground font-normal">.id</span>}
      </span>
    </span>
  );
}
