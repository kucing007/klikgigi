"use client";

import { useState } from "react";
import { CheckCircle2, Download, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageBody, PageHeader, Section, Stat } from "@/components/shared/page";
import { commissionEntries as initialEntries, doctors, getStaff } from "@/lib/data";
import { dateShort, rupiah } from "@/lib/format";
import { toast } from "sonner";

export default function DoctorCommissionPage() {
  const [entries, setEntries] = useState(initialEntries);
  const [doctorFilter, setDoctorFilter] = useState<string>("ALL");

  const filtered = entries.filter((e) => (doctorFilter === "ALL" ? true : e.doctorId === doctorFilter));
  const totalEarned = filtered.reduce((s, e) => s + e.earned, 0);
  const totalReleasable = filtered
    .filter((e) => e.status === "UNSETTLED")
    .reduce((s, e) => s + e.releasable, 0);
  const totalSettled = filtered
    .filter((e) => e.status === "SETTLED")
    .reduce((s, e) => s + e.releasable, 0);

  const settleAll = () => {
    setEntries((prev) =>
      prev.map((e) =>
        doctorFilter === "ALL" || e.doctorId === doctorFilter ? { ...e, status: "SETTLED" } : e,
      ),
    );
    toast.success("Seluruh komisi siap cair berhasil ditandai Lunas / Dicairkan ke rekening dokter");
  };

  return (
    <div>
      <PageHeader
        title="Ledger Komisi Dokter (Anti-Sengketa · Paid on Collection)"
        description="Rumus: Net Base = (Harga × Qty) − Biaya Bahan − Biaya Lab Gigi · Komisi cair proporsional sesuai rasio pembayaran cicilan masuk"
        actions={
          <>
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="h-8 w-[210px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">
                  Semua Dokter ({doctors.length})
                </SelectItem>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id} className="text-xs">
                    {d.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Slip bagi hasil dokter (CSV/PDF) berhasil diunduh")}
            >
              <Download className="size-3.5" /> Unduh Slip Komisi
            </Button>
            <Button size="sm" onClick={settleAll}>
              <HandCoins className="size-4" /> Cairkan Komisi Siap Bayar
            </Button>
          </>
        }
      />

      <PageBody className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat
            label="Total Hak Komisi (Jika Invoice Lunas 100%)"
            value={rupiah(totalEarned)}
            hint="Berdasarkan atribusi baris item tindakan"
          />
          <Stat
            label="Komisi Siap Dicairkan (Releasable)"
            value={rupiah(totalReleasable)}
            delta={{ value: "Sesuai uang masuk riil", positive: true }}
            hint="Otomatis bertambah saat pasien bayar cicilan"
          />
          <Stat
            label="Sudah Dicairkan (Settled Bulan Ini)"
            value={rupiah(totalSettled)}
            hint="Tercatat di jurnal pengeluaran klinik"
          />
        </div>

        <Section
          title="Rincian Perhitungan Komisi per Baris Tindakan"
          description="Transparan bagi pemilik klinik maupun dokter associate"
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-subtle text-[11px] font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2.5">Tanggal & Invoice</th>
                  <th className="px-4 py-2.5">Dokter & Tindakan</th>
                  <th className="px-4 py-2.5">Harga Kotor</th>
                  <th className="px-4 py-2.5">Potongan Bahan/Lab</th>
                  <th className="px-4 py-2.5">Net Base</th>
                  <th className="px-4 py-2.5">Skema & Hak 100%</th>
                  <th className="px-4 py-2.5">Rasio Bayar</th>
                  <th className="px-4 py-2.5">Komisi Cair</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((c) => {
                  const doc = getStaff(c.doctorId);
                  return (
                    <tr key={c.id} className="hover:bg-subtle/50">
                      <td className="px-4 py-3">
                        <div className="font-mono font-semibold">{c.invoiceNumber}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {dateShort(c.date)} · {c.patientName}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{doc?.displayName}</div>
                        <div className="text-[11px] text-muted-foreground">{c.serviceName}</div>
                      </td>
                      <td className="num px-4 py-3">{rupiah(c.gross)}</td>
                      <td className="num px-4 py-3 text-muted-foreground">−{rupiah(c.deductions)}</td>
                      <td className="num px-4 py-3 font-medium">{rupiah(c.base)}</td>
                      <td className="px-4 py-3">
                        <div className="num font-medium">{rupiah(c.earned)}</div>
                        <div className="text-[11px] text-muted-foreground">{c.rateLabel}</div>
                      </td>
                      <td className="num px-4 py-3">
                        <span className="rounded border bg-subtle px-1.5 py-0.5 text-[11px] font-semibold">
                          {Math.round(c.paidRatio * 100)}%
                        </span>
                      </td>
                      <td className="num px-4 py-3 font-semibold text-brand-ink">
                        {rupiah(c.releasable)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {c.status === "SETTLED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-semibold text-success">
                            <CheckCircle2 className="size-3" /> Cair
                          </span>
                        ) : (
                          <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-semibold text-warning">
                            Siap Cair
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      </PageBody>
    </div>
  );
}
