"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Armchair,
  ArrowRight,
  Clock,
  CreditCard,
  Footprints,
  Stethoscope,
  Tv,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBody, PageHeader, Section } from "@/components/shared/page";
import { AppointmentStatusBadge, MedicalAlertChip } from "@/components/shared/status";
import { PersonAvatar } from "@/components/shared/person-avatar";
import {
  appointments as initialAppointments,
  getChair,
  getPatient,
  getService,
  getStaff,
  TODAY,
} from "@/lib/data";
import { age } from "@/lib/format";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import { toast } from "sonner";

const COLUMNS: { status: AppointmentStatus; title: string; subtitle: string }[] = [
  { status: "CONFIRMED", title: "Akan Datang Hari Ini", subtitle: "Menunggu check-in resepsionis" },
  { status: "ARRIVED", title: "Di Ruang Tunggu (Lobi)", subtitle: "Stopwatch waktu tunggu aktif" },
  { status: "IN_CHAIR", title: "Sedang di Kursi Gigi", subtitle: "Tindakan medis berlangsung" },
  { status: "COMPLETED", title: "Selesai · Antre Kasir", subtitle: "Menunggu penyelesaian tagihan" },
];

export default function QueueBoardPage() {
  const [items, setItems] = useState<Appointment[]>(
    initialAppointments.filter((a) => a.date === TODAY),
  );

  const moveStatus = (id: string, next: AppointmentStatus) => {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status: next } : a)));
    toast.success("Status antrean pasien diperbarui");
  };

  return (
    <div>
      <PageHeader
        title="Antrean Ruang Tunggu & Kursi Gigi"
        description="Papan kontrol real-time resepsionis, perawat, dan ruang tindakan (Flow 3 PRD)"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Membuka tampilan Layar TV Ruang Tunggu (Mode Publik)")}
            >
              <Tv className="size-4" /> Layar TV Lobi
            </Button>
            <Button size="sm" asChild>
              <Link href="/app/kalender?walkin=1">
                <Footprints className="size-4" /> + Pasien Walk-In
              </Link>
            </Button>
          </>
        }
      />

      <PageBody>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const cards = items.filter((a) =>
              col.status === "CONFIRMED"
                ? a.status === "CONFIRMED" || a.status === "BOOKED"
                : a.status === col.status,
            );
            return (
              <div key={col.status} className="flex flex-col rounded-lg border bg-subtle/40">
                <div className="flex items-center justify-between border-b bg-card px-3.5 py-3 rounded-t-lg">
                  <div>
                    <div className="text-xs font-semibold">{col.title}</div>
                    <div className="text-[11px] text-muted-foreground">{col.subtitle}</div>
                  </div>
                  <span className="num rounded-full border bg-subtle px-2 py-0.5 text-xs font-semibold">
                    {cards.length}
                  </span>
                </div>

                <div className="flex-1 space-y-2.5 p-3">
                  {cards.map((app) => {
                    const pt = getPatient(app.patientId)!;
                    const doc = getStaff(app.doctorId)!;
                    const srv = getService(app.serviceId)!;
                    const ch = getChair(app.chairId);
                    return (
                      <div key={app.id} className="rounded-md border bg-card p-3 text-xs shadow-2xs space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <PersonAvatar name={pt.fullName} size="sm" />
                            <div>
                              <Link href={`/app/pasien/${pt.id}`} className="font-semibold hover:underline">
                                {pt.fullName}
                              </Link>
                              <div className="text-[11px] text-muted-foreground">
                                {age(pt.dob)} thn · {app.start} ({ch?.name})
                              </div>
                            </div>
                          </div>
                          <AppointmentStatusBadge status={app.status} short size="xs" />
                        </div>

                        <div className="text-[11px] text-muted-foreground">
                          <span className="font-medium text-foreground/85">{srv.laymanName}</span> · {doc.displayName}
                        </div>

                        {pt.alerts.allergies.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {pt.alerts.allergies.map((al) => (
                              <MedicalAlertChip key={al} kind="allergy">
                                {al}
                              </MedicalAlertChip>
                            ))}
                          </div>
                        )}

                        {app.status === "ARRIVED" && (
                          <div className="num flex items-center gap-1.5 rounded bg-warning-soft px-2 py-1 text-[11px] font-semibold text-warning">
                            <Clock className="size-3" /> Menunggu 14 menit (Sejak {app.arrivedAt ?? "09:58"})
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-1.5 border-t pt-2">
                          {(app.status === "CONFIRMED" || app.status === "BOOKED") && (
                            <Button
                              size="xs"
                              variant="outline"
                              className="w-full"
                              onClick={() => moveStatus(app.id, "ARRIVED")}
                            >
                              Check-In ke Lobi <ArrowRight className="size-3" />
                            </Button>
                          )}
                          {app.status === "ARRIVED" && (
                            <>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => moveStatus(app.id, "IN_CHAIR")}
                              >
                                <Armchair className="size-3" /> Masuk {ch?.name}
                              </Button>
                              <Button size="xs" asChild>
                                <Link href={`/app/klinis/${app.id}`}>
                                  <Stethoscope className="size-3" /> Periksa
                                </Link>
                              </Button>
                            </>
                          )}
                          {app.status === "IN_CHAIR" && (
                            <>
                              <Button size="xs" asChild className="flex-1">
                                <Link href={`/app/klinis/${app.id}`}>
                                  <Stethoscope className="size-3" /> Buka Odontogram
                                </Link>
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => moveStatus(app.id, "COMPLETED")}
                              >
                                Selesai
                              </Button>
                            </>
                          )}
                          {app.status === "COMPLETED" && (
                            <Button size="xs" asChild className="w-full">
                              <Link href="/app/kasir">
                                <CreditCard className="size-3" /> Proses Pembayaran Kasir
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </PageBody>
    </div>
  );
}
