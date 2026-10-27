"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  MessageCircle,
  MoreHorizontal,
  Search,
  Stethoscope,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageBody, PageHeader } from "@/components/shared/page";
import { MedicalAlertChip } from "@/components/shared/status";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { patients as initialPatients } from "@/lib/data";
import { age, dateShort, rupiah, sourceLabel } from "@/lib/format";
import type { Patient } from "@/lib/types";
import { toast } from "sonner";

type FilterChip = "ALL" | "ALERT" | "INSTALLMENT" | "NEED_INTAKE";

export default function PatientsDirectoryPage() {
  const [list, setList] = useState<Patient[]>(initialPatients);
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState<FilterChip>("ALL");
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const filtered = list.filter((p) => {
    const q = query.toLowerCase();
    const matchQ =
      !q ||
      p.fullName.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.phone.includes(q);
    if (!matchQ) return false;
    if (chip === "ALERT") {
      return p.alerts.allergies.length > 0 || p.alerts.systemic.length > 0 || p.alerts.isPregnant;
    }
    if (chip === "INSTALLMENT") return p.outstanding > 0;
    if (chip === "NEED_INTAKE") return !p.intakeCompleted;
    return true;
  });

  const handleAddPatient = () => {
    if (!newName.trim()) return;
    const created: Patient = {
      id: `pt_${Date.now()}`,
      mrn: `RM-2026-0${list.length + 730}`,
      fullName: newName,
      dob: "1995-05-15",
      gender: "P",
      phone: newPhone || "0812-0000-1111",
      alerts: { allergies: [], systemic: [], isPregnant: false },
      totalVisits: 0,
      outstanding: 0,
      lifetimeValue: 0,
      tags: ["Baru"],
      source: "WALK_IN",
      intakeCompleted: false,
      createdAt: "2026-10-26",
    };
    setList((prev) => [created, ...prev]);
    setNewOpen(false);
    setNewName("");
    setNewPhone("");
    toast.success(`Pasien ${created.fullName} (${created.mrn}) berhasil didaftarkan`);
  };

  return (
    <div>
      <PageHeader
        title="Direktori Pasien & Rekam Medis Elektronik (RME)"
        description={`${list.length} pasien terdaftar · Dilengkapi Digital Pre-Visit Intake & Medical Alert otomatis`}
        actions={
          <Button size="sm" onClick={() => setNewOpen(true)}>
            <UserPlus className="size-4" /> + Pasien Baru
          </Button>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama pasien, No. RM, atau WhatsApp…"
              className="h-8 pl-8 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                ["ALL", `Semua (${list.length})`],
                ["ALERT", "Punya Medical Alert / Alergi"],
                ["INSTALLMENT", "Cicilan Berjalan"],
                ["NEED_INTAKE", "Belum Isi Pre-Visit Intake"],
              ] as const
            ).map(([k, label]) => (
              <Button
                key={k}
                size="xs"
                variant={chip === k ? "default" : "outline"}
                onClick={() => setChip(k)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </PageHeader>

      <PageBody>
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-subtle text-[11px] font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2.5">Pasien & No. RM</th>
                <th className="px-4 py-2.5">Peringatan Medis (Intake)</th>
                <th className="px-4 py-2.5">Kunjungan Terakhir</th>
                <th className="px-4 py-2.5">Piutang / Cicilan</th>
                <th className="px-4 py-2.5">Total Nilai (LTV)</th>
                <th className="px-4 py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((p) => {
                const hasAlerts =
                  p.alerts.allergies.length > 0 || p.alerts.systemic.length > 0 || p.alerts.isPregnant;
                return (
                  <tr key={p.id} className="hover:bg-subtle/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <PersonAvatar name={p.fullName} size="sm" />
                        <div>
                          <Link href={`/app/pasien/${p.id}`} className="font-semibold hover:underline">
                            {p.fullName}
                          </Link>
                          <div className="text-[11px] text-muted-foreground">
                            <span className="font-mono">{p.mrn}</span> · {age(p.dob)} thn · {p.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.alerts.allergies.map((al) => (
                          <MedicalAlertChip key={al} kind="allergy">
                            {al}
                          </MedicalAlertChip>
                        ))}
                        {p.alerts.systemic.map((s) => (
                          <MedicalAlertChip key={s} kind="systemic">
                            {s}
                          </MedicalAlertChip>
                        ))}
                        {p.alerts.isPregnant && <MedicalAlertChip kind="pregnant">Hamil</MedicalAlertChip>}
                        {!hasAlerts && p.intakeCompleted && (
                          <span className="text-muted-foreground">Tidak ada alergi</span>
                        )}
                        {!p.intakeCompleted && (
                          <Link
                            href={`/intake/${p.id}`}
                            className="inline-flex items-center gap-1 rounded border border-dashed px-2 py-0.5 text-[11px] text-brand-ink hover:bg-brand-soft"
                          >
                            Belum isi Intake <ExternalLink className="size-2.5" />
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.lastVisit ? (
                        <div>
                          <div className="num font-medium">{dateShort(p.lastVisit)}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {p.totalVisits}x kunjungan · {sourceLabel[p.source]}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Kunjungan pertama</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.outstanding > 0 ? (
                        <span className="num font-semibold text-warning">{rupiah(p.outstanding)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="num px-4 py-3 font-medium">{rupiah(p.lifetimeValue)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button variant="outline" size="xs" asChild>
                          <Link href={`/app/pasien/${p.id}`}>RME & Odontogram</Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-xs" aria-label="Menu pasien">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem asChild>
                              <Link href="/app/klinis/ap_02">
                                <Stethoscope className="size-3.5" /> Buka Ruang Periksa
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/intake/${p.id}`} target="_blank">
                                <ExternalLink className="size-3.5" /> Buka Form Digital Intake
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() => toast.success(`Link Pre-Visit Intake dikirim ke WA ${p.fullName}`)}
                            >
                              <MessageCircle className="size-3.5" /> Kirim Link Intake via WA
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PageBody>

      {/* New Patient Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Pasien Baru</DialogTitle>
            <DialogDescription className="text-xs">
              Sistem otomatis membuat nomor Rekam Medis (RM) dan menyiapkan tautan Digital Pre-Visit Intake.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div>
              <Label className="text-xs">Nama Lengkap Sesuai KTP</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Mis. Ratna Permata"
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Nomor WhatsApp Aktif</Label>
              <Input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="mt-1 h-9 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setNewOpen(false)}>
              Batal
            </Button>
            <Button size="sm" onClick={handleAddPatient}>
              Simpan & Kirim Link Intake
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
