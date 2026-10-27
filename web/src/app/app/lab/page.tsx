"use client";

import { useState } from "react";
import { ArrowRight, FlaskConical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageBody, PageHeader, Stat } from "@/components/shared/page";
import { LabStatusBadge } from "@/components/shared/status";
import { doctors, getPatient, getStaff, labOrders as initialOrders, patients } from "@/lib/data";
import { dateShort, labStatusMeta, rupiah } from "@/lib/format";
import type { LabOrder, LabStatus } from "@/lib/types";
import { toast } from "sonner";

const NEXT_STATUS: Record<LabStatus, LabStatus | null> = {
  ORDERED: "SENT",
  SENT: "RECEIVED",
  RECEIVED: "FITTED",
  FITTED: null,
};

export default function DentalLabPage() {
  const [orders, setOrders] = useState<LabOrder[]>(initialOrders);
  const [open, setOpen] = useState(false);
  const [vendor, setVendor] = useState("Prima Dental Lab");
  const [workType, setWorkType] = useState("Crown Zirconia Monolithic");
  const [shade, setShade] = useState("A2");
  const [cost, setCost] = useState("1350000");

  const advance = (id: string, next: LabStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)));
    toast.success(`Status order lab diperbarui menjadi ${labStatusMeta[next].label}`);
  };

  const createOrder = () => {
    const item: LabOrder = {
      id: `lab_${Date.now()}`,
      number: `LAB-2026-0${orders.length + 37}`,
      patientId: patients[0].id,
      doctorId: doctors[0].id,
      vendor,
      workType,
      tooth: 11,
      shade,
      cost: Number(cost) || 1200000,
      expectedReturn: "2026-11-06",
      status: "ORDERED",
    };
    setOrders((prev) => [item, ...prev]);
    setOpen(false);
    toast.success(`Order ${item.number} berhasil dibuat`);
  };

  return (
    <div>
      <PageHeader
        title="Pelacakan Order Dental Lab"
        description="Status cetakan crown, bridge, veneer indirect, GTSL, dan retainer — terhubung langsung ke perhitungan komisi dokter"
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> + Order Lab Baru
          </Button>
        }
      />

      <PageBody className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-4">
          {(["ORDERED", "SENT", "RECEIVED", "FITTED"] as LabStatus[]).map((st) => (
            <Stat
              key={st}
              label={labStatusMeta[st].label}
              value={`${orders.filter((o) => o.status === st).length} pekerjaan`}
              hint={
                st === "RECEIVED"
                  ? "Siap dipasang ke pasien"
                  : st === "SENT"
                    ? "Sedang dikerjakan vendor"
                    : undefined
              }
            />
          ))}
        </div>

        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-subtle text-[11px] font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2.5">No. Order & Pekerjaan</th>
                <th className="px-4 py-2.5">Pasien & Dokter</th>
                <th className="px-4 py-2.5">Vendor Dental Lab</th>
                <th className="px-4 py-2.5">Biaya Lab (Potong Net)</th>
                <th className="px-4 py-2.5">Estimasi Kembali</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => {
                const pt = getPatient(o.patientId)!;
                const doc = getStaff(o.doctorId)!;
                const next = NEXT_STATUS[o.status];
                return (
                  <tr key={o.id} className="hover:bg-subtle/50">
                    <td className="px-4 py-3">
                      <div className="font-mono text-[11px] text-muted-foreground">{o.number}</div>
                      <div className="font-semibold">
                        {o.workType} {o.tooth ? `#${o.tooth}` : ""}
                      </div>
                      {o.shade && (
                        <div className="text-[11px] text-muted-foreground">Shade VITA: {o.shade}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{pt.fullName}</div>
                      <div className="text-[11px] text-muted-foreground">{doc.displayName}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">{o.vendor}</td>
                    <td className="num px-4 py-3 font-semibold">{rupiah(o.cost)}</td>
                    <td className="px-4 py-3">
                      <div className="num font-medium">{dateShort(o.expectedReturn)}</div>
                      {o.notes && <div className="text-[11px] text-warning">{o.notes}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <LabStatusBadge status={o.status} size="xs" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {next ? (
                        <Button size="xs" variant="outline" onClick={() => advance(o.id, next)}>
                          Majukan: {labStatusMeta[next].label} <ArrowRight className="size-3" />
                        </Button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Selesai</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PageBody>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Order Dental Lab</DialogTitle>
            <DialogDescription className="text-xs">
              Tercatat di rekam medis pasien dan otomatis memotong dasar perhitungan komisi bersih dokter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div>
              <Label className="text-xs">Vendor Lab Gigi</Label>
              <Input value={vendor} onChange={(e) => setVendor(e.target.value)} className="mt-1 h-8 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Pekerjaan Lab</Label>
                <Input value={workType} onChange={(e) => setWorkType(e.target.value)} className="mt-1 h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Shade (VITA)</Label>
                <Input value={shade} onChange={(e) => setShade(e.target.value)} className="mt-1 h-8 text-xs" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Biaya Lab (Rp)</Label>
              <Input value={cost} onChange={(e) => setCost(e.target.value)} className="mt-1 h-8 text-xs num" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button size="sm" onClick={createOrder}>
              Simpan Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
