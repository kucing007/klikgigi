"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarPlus,
  ExternalLink,
  FileText,
  MessageCircle,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBody, PageHeader, Section, Stat } from "@/components/shared/page";
import { MedicalAlertChip, PaymentStatusBadge } from "@/components/shared/status";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { FdiOdontogram } from "@/components/odontogram/fdi-odontogram";
import {
  chartDedi,
  getPatient,
  getService,
  getStaff,
  invoices,
  invoiceTotals,
  patients,
  toothHistories,
  treatmentPlans,
} from "@/lib/data";
import { age, dateShort, rupiah } from "@/lib/format";
import { toast } from "sonner";

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const pt = getPatient(id) ?? patients[2];
  const [selectedTooth, setSelectedTooth] = useState(36);

  const ptInvoices = invoices.filter((i) => i.patientId === pt.id);
  const ptPlans = treatmentPlans.filter((t) => t.patientId === pt.id);

  return (
    <div>
      <PageHeader
        title={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="ghost" size="icon-xs" asChild>
              <Link href="/app/pasien">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <PersonAvatar name={pt.fullName} size="md" />
            <span>{pt.fullName}</span>
            <span className="font-mono text-xs font-normal text-muted-foreground">{pt.mrn}</span>
          </div>
        }
        description={`${age(pt.dob)} tahun · NIK: ${pt.nik ?? "3174040908920002"} · WhatsApp: ${pt.phone}`}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/intake/${pt.id}`} target="_blank">
                Form Intake <ExternalLink className="size-3.5" />
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/app/klinis/ap_02">
                <Stethoscope className="size-4" /> Buka Ruang Periksa
              </Link>
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          {pt.alerts.allergies.map((a) => (
            <MedicalAlertChip key={a} kind="allergy">
              {a}
            </MedicalAlertChip>
          ))}
          {pt.alerts.systemic.map((s) => (
            <MedicalAlertChip key={s} kind="systemic">
              {s}
            </MedicalAlertChip>
          ))}
          {pt.alerts.isPregnant && <MedicalAlertChip kind="pregnant">Hamil</MedicalAlertChip>}
        </div>
      </PageHeader>

      <PageBody className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-4">
          <Stat label="Total Kunjungan" value={`${pt.totalVisits}x`} hint={`Terakhir: ${pt.lastVisit ? dateShort(pt.lastVisit) : "—"}`} />
          <Stat label="Lifetime Value (LTV)" value={rupiah(pt.lifetimeValue)} hint="Total pembelanjaan" />
          <Stat label="Sisa Cicilan / Tagihan" value={rupiah(pt.outstanding)} hint="Status kredit pasien" />
          <Stat label="Scaling Terakhir" value={pt.lastScaling ? dateShort(pt.lastScaling) : "12 Jan 2025"} hint="Recall otomatis 6 bulan" />
        </div>

        <Section
          title="Snapshot Odontogram Terkini"
          description="Klik tombol 'Buka Ruang Periksa' di kanan atas untuk melakukan charting 3-Tap baru"
        >
          <FdiOdontogram
            chart={chartDedi}
            dentition="ADULT"
            selectedTooth={selectedTooth}
            onSelectTooth={setSelectedTooth}
            onApplyAction={() => toast.info("Buka Ruang Periksa untuk menyimpan perubahan Odontogram")}
            presentationMode
          />
        </Section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Riwayat Tindakan Klinis (Tooth Audit Trail)">
            <div className="divide-y text-xs">
              {toothHistories.map((h) => (
                <div key={h.id} className="flex items-start justify-between py-2.5">
                  <div>
                    <div className="font-semibold">
                      Gigi #{h.tooth} {h.surfaces.length ? `(${h.surfaces.join(",")})` : ""} — {h.condition}
                    </div>
                    <div className="text-muted-foreground">{h.notes ?? getService(h.serviceId)?.clinicalName}</div>
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground">
                    <div className="num font-medium text-foreground">{dateShort(h.date)}</div>
                    <div>{getStaff(h.doctorId)?.displayName}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Invoice & Riwayat Pembayaran">
            <div className="divide-y text-xs">
              {(ptInvoices.length > 0 ? ptInvoices : invoices.slice(0, 2)).map((inv) => {
                const t = invoiceTotals(inv);
                return (
                  <div key={inv.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <Link href={`/app/kasir/${inv.id}`} className="font-mono font-semibold hover:underline">
                        {inv.number}
                      </Link>
                      <div className="text-muted-foreground">{dateShort(inv.date)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="num font-semibold">{rupiah(t.grand)}</span>
                      <PaymentStatusBadge status={inv.status} size="xs" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>
      </PageBody>
    </div>
  );
}
