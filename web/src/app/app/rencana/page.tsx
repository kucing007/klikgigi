"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarPlus, CheckCircle2, FileSignature, MessageCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBody, PageHeader, Section, Stat } from "@/components/shared/page";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { getPatient, getService, getStaff, treatmentPlans as initialPlans } from "@/lib/data";
import { dateShort, rupiah } from "@/lib/format";
import { toast } from "sonner";

export default function TreatmentPlansPage() {
  const [plans, setPlans] = useState(initialPlans);

  const totalPipelineValue = plans.reduce(
    (s, p) => s + p.phases.filter((ph) => ph.status !== "DONE").reduce((a, b) => a + b.estimatedPrice, 0),
    0,
  );

  return (
    <div>
      <PageHeader
        title="Rencana Perawatan Multi-Kunjungan (Treatment Plans)"
        description="Pelacakan tahapan perawatan saluran akar (PSA), ortodonti, veneer, dan prostodonti beserta pengingat otomatis H-2"
      />

      <PageBody className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat
            label="Nilai Pipeline Perawatan Aktif"
            value={rupiah(totalPipelineValue)}
            hint={`${plans.length} rencana perawatan berjalan`}
          />
          <Stat
            label="Tingkat Penyelesaian Tahapan"
            value="84%"
            delta={{ value: "+19% sejak pengingat WA H-2 aktif", positive: true }}
            hint="Pasien menyelesaikan hingga tahap akhir"
          />
          <Stat
            label="Informed Consent Digital"
            value="4 / 5"
            hint="1 rencana menunggu tanda tangan pasien"
          />
        </div>

        <div className="space-y-4">
          {plans.map((tp) => {
            const pt = getPatient(tp.patientId)!;
            const doc = getStaff(tp.doctorId)!;
            const estTotal = tp.phases.reduce((s, p) => s + p.estimatedPrice, 0);
            const doneCount = tp.phases.filter((p) => p.status === "DONE").length;

            return (
              <Section
                key={tp.id}
                title={
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{tp.title}</span>
                    <span className="rounded border bg-subtle px-2 py-0.5 text-[11px] font-medium">
                      {doneCount}/{tp.phases.length} tahap selesai
                    </span>
                    {tp.consentSigned ? (
                      <span className="inline-flex items-center gap-1 rounded bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success">
                        <CheckCircle2 className="size-3" /> Consent Tertandatangan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-warning">
                        <FileSignature className="size-3" /> Menunggu Consent
                      </span>
                    )}
                  </div>
                }
                description={
                  <span className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span>Pasien: <strong>{pt.fullName}</strong> ({pt.mrn})</span>
                    <span>·</span>
                    <span>Dokter: {doc.displayName}</span>
                    <span>·</span>
                    <span>Total Estimasi: <strong className="num">{rupiah(estTotal)}</strong></span>
                  </span>
                }
                actions={
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => toast.success(`Pengingat kunjungan lanjutan dikirim ke WA ${pt.fullName}`)}
                  >
                    <MessageCircle className="size-3.5" /> Kirim Pengingat WA
                  </Button>
                }
              >
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {tp.phases.map((ph) => {
                    const srv = getService(ph.serviceId);
                    return (
                      <div key={ph.id} className="flex flex-col justify-between rounded-md border bg-subtle/40 p-3 text-xs">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Kunjungan {ph.order}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                ph.status === "DONE"
                                  ? "bg-success-soft text-success"
                                  : ph.status === "SCHEDULED"
                                    ? "bg-info-soft text-info"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {ph.status === "DONE"
                                ? "Selesai"
                                : ph.status === "SCHEDULED"
                                  ? "Terjadwal"
                                  : "Menunggu"}
                            </span>
                          </div>
                          <div className="mt-1 font-medium text-foreground/90">
                            {srv?.clinicalName} {ph.tooth ? `(#${ph.tooth})` : ""}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t pt-2 text-[11px] text-muted-foreground">
                          <span className="num font-semibold text-foreground">{rupiah(ph.estimatedPrice)}</span>
                          {ph.scheduledDate ? (
                            <span className="num">{dateShort(ph.scheduledDate)}</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setPlans((prev) =>
                                  prev.map((x) =>
                                    x.id === tp.id
                                      ? {
                                          ...x,
                                          phases: x.phases.map((p) =>
                                            p.id === ph.id
                                              ? { ...p, status: "SCHEDULED", scheduledDate: "2026-11-02" }
                                              : p,
                                          ),
                                        }
                                      : x,
                                  ),
                                );
                                toast.success("Tahap dijadwalkan untuk 2 Nov 2026");
                              }}
                              className="inline-flex items-center gap-1 font-medium text-brand-ink hover:underline"
                            >
                              <CalendarPlus className="size-3" /> Jadwalkan
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            );
          })}
        </div>
      </PageBody>
    </div>
  );
}
