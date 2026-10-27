import * as React from "react";
import { cn } from "@/lib/utils";
import { appointmentStatusMeta, labStatusMeta, paymentStatusMeta } from "@/lib/format";
import type { AppointmentStatus, LabStatus, PaymentStatus } from "@/lib/types";

/**
 * Soft-tinted pill with a status dot. Colour is never the only signal —
 * the label is always rendered (a11y: don't rely on colour alone).
 */
export function Pill({
  color,
  children,
  className,
  dot = true,
  size = "sm",
}: {
  color: string;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
  size?: "xs" | "sm";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        size === "xs" ? "h-5 px-1.5 text-[11px]" : "h-6 px-2 text-xs",
        className,
      )}
      style={{
        color: `color-mix(in oklab, ${color} 82%, var(--foreground))`,
        backgroundColor: `color-mix(in oklab, ${color} 10%, transparent)`,
        borderColor: `color-mix(in oklab, ${color} 22%, transparent)`,
      }}
    >
      {dot && <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />}
      {children}
    </span>
  );
}

export function AppointmentStatusBadge({ status, short, size }: { status: AppointmentStatus; short?: boolean; size?: "xs" | "sm" }) {
  const m = appointmentStatusMeta[status];
  return (
    <Pill color={m.color} size={size}>
      {short ? m.short : m.label}
    </Pill>
  );
}

export function PaymentStatusBadge({ status, size }: { status: PaymentStatus; size?: "xs" | "sm" }) {
  const m = paymentStatusMeta[status];
  return <Pill color={m.color} size={size}>{m.label}</Pill>;
}

export function LabStatusBadge({ status, size }: { status: LabStatus; size?: "xs" | "sm" }) {
  const m = labStatusMeta[status];
  return <Pill color={m.color} size={size}>{m.label}</Pill>;
}

/** Red/amber medical alert chip shown on patient headers. */
export function MedicalAlertChip({
  kind,
  children,
  className,
}: {
  kind: "allergy" | "systemic" | "pregnant";
  children: React.ReactNode;
  className?: string;
}) {
  const styles =
    kind === "allergy"
      ? "bg-danger-soft text-danger border-danger/25"
      : kind === "pregnant"
        ? "bg-info-soft text-info border-info/25"
        : "bg-warning-soft text-warning border-warning/30";
  const label = kind === "allergy" ? "Alergi" : kind === "pregnant" ? "Hamil" : "Kondisi";
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-md border px-2 text-xs font-medium", styles, className)}>
      <svg viewBox="0 0 16 16" className="size-3" fill="currentColor" aria-hidden>
        <path d="M8 1.5 15 14H1L8 1.5Zm0 4a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 8 5.5Zm0 6.25a.875.875 0 1 0 0 1.75.875.875 0 0 0 0-1.75Z" />
      </svg>
      <span className="font-semibold uppercase tracking-wide text-[10px]">{label}</span>
      <span>{children}</span>
    </span>
  );
}
