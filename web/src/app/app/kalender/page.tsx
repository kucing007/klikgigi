"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Filter,
  Footprints,
  MapPin,
  MessageCircle,
  Settings2,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentStatusBadge, MedicalAlertChip } from "@/components/shared/status";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { ServiceCatalogModal } from "@/components/clinical/catalog-and-meds-modals";
import { useWorkspace } from "@/lib/store/workspace";
import {
  chairs,
  doctors,
  getChair,
  getStaff,
  locations,
  TODAY,
} from "@/lib/data";
import {
  addDays,
  age,
  appointmentStatusMeta,
  dateLong,
  fromMinutes,
  rupiah,
  sourceLabel,
  toMinutes,
} from "@/lib/format";
import type { Appointment, AppointmentStatus, Patient, Service } from "@/lib/types";
import { toast } from "sonner";

const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const chairDoctorMap: Record<string, string> = {
  ch_1: "dr_budi",
  ch_2: "dr_siti",
  ch_3: "dr_andi",
  ch_4: "dr_budi",
};

export default function ChairGridCalendarPage() {
  const {
    locationId,
    setLocation,
    appointments: items,
    services,
    patients,
    addAppointment,
    updateAppointmentStatus,
  } = useWorkspace();

  const [date, setDate] = useState(TODAY);
  const [doctorFilter, setDoctorFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ACTIVE");
  const [selectedId, setSelectedId] = useState<string | null>("ap_02");
  const [vitalBP, setVitalBP] = useState("130/85");
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [bookingModal, setBookingModal] = useState<{
    open: boolean;
    walkIn?: boolean;
    chairId?: string;
    start?: string;
  }>({ open: false });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("modal");
      if (q === "booking") setBookingModal({ open: true, walkIn: false, chairId: "ch_1", start: "12:15" });
      if (q === "services") setServiceModalOpen(true);
    }
  }, []);

  const findPatient = (id: string): Patient =>
    patients.find((p) => p.id === id) ?? patients[0];
  const findService = (id: string): Service =>
    services.find((s) => s.id === id) ?? services[0];

  const activeChairs = useMemo(
    () => chairs.filter((c) => c.locationId === locationId && c.isActive),
    [locationId],
  );

  const dayAppointments = useMemo(
    () =>
      items.filter((a) => {
        if (a.date !== date || a.locationId !== locationId) return false;
        if (doctorFilter !== "ALL" && a.doctorId !== doctorFilter) return false;
        if (statusFilter === "ACTIVE" && (a.status === "CANCELLED" || a.status === "NO_SHOW")) return false;
        return true;
      }),
    [items, date, locationId, doctorFilter, statusFilter],
  );

  const selected = items.find((a) => a.id === selectedId) ?? null;

  const updateStatus = (id: string, status: AppointmentStatus) => {
    updateAppointmentStatus(id, status);
    toast.success(`Status jadwal diubah menjadi ${appointmentStatusMeta[status].label}`);
  };

  const handleCreateAppointment = (newApp: Appointment) => {
    addAppointment(newApp);
    setSelectedId(newApp.id);
    setBookingModal({ open: false });
    toast.success("Jadwal berhasil ditambahkan ke Kalender Kursi & Kasir");
  };

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden">
      {/* Calendar Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-card px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-md border bg-background p-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setDate(addDays(date, -1))}
              aria-label="Hari sebelumnya"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <button
              onClick={() => setDate(TODAY)}
              className="flex items-center gap-1.5 px-2.5 text-xs font-semibold"
            >
              <CalendarIcon className="size-3.5 text-muted-foreground" />
              <span>{dateLong(date)}</span>
            </button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setDate(addDays(date, 1))}
              aria-label="Hari berikutnya"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {date !== TODAY && (
            <Button variant="ghost" size="xs" onClick={() => setDate(TODAY)}>
              Hari Ini
            </Button>
          )}

          {/* Location selector */}
          <div className="w-[180px]">
            <Select value={locationId} onValueChange={setLocation}>
              <SelectTrigger className="h-8 text-xs">
                <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id} className="text-xs">
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Doctor Filter */}
          <div className="w-[185px]">
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Filter Dokter" />
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
          </div>

          {/* Status Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Filter className="size-3.5" />
                {statusFilter === "ACTIVE" ? "Jadwal Aktif" : "Semua Status"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="text-xs">Tampilan Status Kartu</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={statusFilter === "ACTIVE"}
                onCheckedChange={() => setStatusFilter("ACTIVE")}
              >
                Hanya Jadwal Aktif
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "ALL"}
                onCheckedChange={() => setStatusFilter("ALL")}
              >
                Tampilkan Batal & No-Show
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setServiceModalOpen(true)}
          >
            <Settings2 className="size-3.5" /> Layanan & Tarif ({services.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() =>
              setBookingModal({ open: true, walkIn: true, chairId: activeChairs[0]?.id, start: "12:15" })
            }
          >
            <Footprints className="size-3.5" /> + Walk-In
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={() =>
              setBookingModal({ open: true, walkIn: false, chairId: activeChairs[0]?.id, start: "12:15" })
            }
          >
            <CalendarPlus className="size-3.5" /> + Booking Baru
          </Button>
        </div>
      </div>

      {/* Status Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-subtle px-4 py-1.5 text-[11px] text-muted-foreground">
        <div className="flex flex-wrap items-center gap-3">
          {(
            [
              ["BOOKED", "Terjadwal"],
              ["CONFIRMED", "Konfirmasi WA"],
              ["ARRIVED", "Di Lobi (Timer)"],
              ["IN_CHAIR", "Di Kursi"],
              ["COMPLETED", "Menunggu Kasir"],
              ["PAID", "Lunas"],
            ] as const
          ).map(([st, label]) => (
            <span key={st} className="inline-flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: appointmentStatusMeta[st].color }}
              />
              {label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="hatch inline-block h-2.5 w-4 rounded-xs border" />
            Buffer Sterilisasi Kursi
          </span>
        </div>
        <span className="num">Algoritma Slot: Dokter Aktif ∩ Kursi Kosong ≥ (Durasi + Buffer)</span>
      </div>

      {/* Chair-Grid Main Area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="min-w-[780px]">
            {/* Sticky Chair Headers */}
            <div
              className="sticky top-0 z-20 grid border-b bg-card"
              style={{ gridTemplateColumns: `76px repeat(${activeChairs.length}, minmax(220px, 1fr))` }}
            >
              <div className="border-r px-3 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase">
                Waktu
              </div>
              {activeChairs.map((ch) => {
                const shiftDoc = getStaff(chairDoctorMap[ch.id]);
                const chApps = dayAppointments.filter((a) => a.chairId === ch.id);
                return (
                  <div
                    key={ch.id}
                    className="flex items-center justify-between border-r px-3.5 py-2.5 last:border-r-0"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{ch.name}</span>
                        <span className="num rounded bg-muted px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground">
                          {chApps.length} jadwal
                        </span>
                      </div>
                      {shiftDoc && (
                        <div className="truncate text-[11px] text-muted-foreground">
                          Shift: {shiftDoc.displayName}
                        </div>
                      )}
                    </div>
                    {shiftDoc && <PersonAvatar name={shiftDoc.fullName} color={shiftDoc.color} size="xs" />}
                  </div>
                );
              })}
            </div>

            {/* Time Rows */}
            <div className="divide-y">
              {HOURS.map((hour) => {
                const hourStart = toMinutes(hour);
                const hourEnd = hourStart + 60;
                return (
                  <div
                    key={hour}
                    className="grid min-h-[112px]"
                    style={{ gridTemplateColumns: `76px repeat(${activeChairs.length}, minmax(220px, 1fr))` }}
                  >
                    <div className="border-r bg-subtle/50 px-3 py-2">
                      <span className="num text-xs font-medium text-muted-foreground">{hour}</span>
                    </div>

                    {activeChairs.map((ch) => {
                      const slotApps = dayAppointments.filter((a) => {
                        if (a.chairId !== ch.id) return false;
                        const s = toMinutes(a.start);
                        return s >= hourStart && s < hourEnd;
                      });

                      return (
                        <div key={ch.id} className="relative border-r p-2 last:border-r-0">
                          {slotApps.length === 0 ? (
                            <button
                              onClick={() =>
                                setBookingModal({ open: true, walkIn: false, chairId: ch.id, start: hour })
                              }
                              className="group flex h-full min-h-[90px] w-full items-center justify-center rounded-md border border-dashed border-transparent text-xs text-muted-foreground/60 transition-colors hover:border-border-strong hover:bg-subtle/60 hover:text-foreground"
                            >
                              <span className="opacity-0 transition-opacity group-hover:opacity-100">
                                + Isi Slot {hour} ({ch.name})
                              </span>
                            </button>
                          ) : (
                            <div className="space-y-1.5">
                              {slotApps.map((app) => {
                                const pt = findPatient(app.patientId);
                                const srv = findService(app.serviceId);
                                const doc = getStaff(app.doctorId)!;
                                const isSelected = selected?.id === app.id;
                                const stColor = appointmentStatusMeta[app.status].color;
                                const bufferEnd = fromMinutes(toMinutes(app.end) + app.bufferMinutes);

                                return (
                                  <div key={app.id} className="space-y-1">
                                    <div
                                      role="button"
                                      tabIndex={0}
                                      onClick={() => setSelectedId(app.id)}
                                      onKeyDown={(e) => e.key === "Enter" && setSelectedId(app.id)}
                                      className={`w-full rounded-md border bg-card p-2.5 text-left transition-all hover:border-border-strong ${
                                        isSelected ? "ring-2 ring-brand" : ""
                                      }`}
                                      style={{
                                        borderLeftWidth: 3,
                                        borderLeftColor: stColor,
                                      }}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5">
                                            <span className="num text-[11px] font-semibold text-muted-foreground">
                                              {app.start}–{app.end}
                                            </span>
                                            {app.confirmedViaWa && (
                                              <span
                                                title="Terkonfirmasi via WhatsApp"
                                                className="text-[10px] font-medium text-info"
                                              >
                                                ✓ WA
                                              </span>
                                            )}
                                          </div>
                                          <div className="truncate text-xs font-semibold text-foreground">
                                            {pt.fullName}
                                          </div>
                                          <div className="truncate text-[11px] text-muted-foreground">
                                            {srv.laymanName} · {doc.displayName.split(",")[0]}
                                          </div>
                                        </div>
                                        <AppointmentStatusBadge status={app.status} short size="xs" />
                                      </div>

                                      {/* Contextual Indicators */}
                                      <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5">
                                        {app.status === "ARRIVED" && (
                                          <span className="num inline-flex items-center gap-1 rounded bg-warning-soft px-1.5 py-0.5 text-[10px] font-semibold text-warning">
                                            <Clock className="size-2.5" /> Menunggu 14 mnt
                                          </span>
                                        )}
                                        {app.status === "IN_CHAIR" && (
                                          <span className="inline-flex items-center gap-1 rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold text-brand-ink">
                                            <Stethoscope className="size-2.5" /> Sedang di {ch.name}
                                          </span>
                                        )}
                                        {app.status === "PAID" && (
                                          <span className="num text-[10px] font-medium text-success">
                                            Lunas · {rupiah(srv.basePrice)}
                                          </span>
                                        )}
                                        {pt.alerts.allergies.length > 0 && (
                                          <span className="inline-flex items-center gap-1 rounded bg-danger-soft px-1.5 py-0.5 text-[10px] font-semibold text-danger">
                                            <AlertTriangle className="size-2.5" /> Alergi {pt.alerts.allergies[0]}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Sterilization Buffer Bar */}
                                    <div className="hatch flex items-center justify-between rounded border border-dashed px-2 py-1 text-[10px] text-muted-foreground">
                                      <span>Buffer Sterilisasi Kursi</span>
                                      <span className="num">
                                        {app.end}–{bufferEnd} ({app.bufferMinutes}m)
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Slide-Over Detail Panel (Persistent on Desktop when selected) */}
        {selected && (
          <aside className="hidden w-[360px] shrink-0 flex-col border-l bg-card lg:flex">
            <AppointmentDetailDrawer
              app={selected}
              patient={findPatient(selected.patientId)}
              service={findService(selected.serviceId)}
              vitalBP={vitalBP}
              setVitalBP={setVitalBP}
              onUpdateStatus={updateStatus}
              onClose={() => setSelectedId(null)}
            />
          </aside>
        )}
      </div>

      {/* Mobile Sheet for Appointment Detail */}
      <Sheet
        open={!!selected && typeof window !== "undefined" && window.innerWidth < 1024}
        onOpenChange={(o) => !o && setSelectedId(null)}
      >
        <SheetContent className="w-full p-0 sm:max-w-md">
          <SheetHeader className="sr-only">
            <SheetTitle>Detail Janji Temu</SheetTitle>
            <SheetDescription>Kelola status kedatangan pasien dan masuk ruang periksa</SheetDescription>
          </SheetHeader>
          {selected && (
            <AppointmentDetailDrawer
              app={selected}
              patient={findPatient(selected.patientId)}
              service={findService(selected.serviceId)}
              vitalBP={vitalBP}
              setVitalBP={setVitalBP}
              onUpdateStatus={updateStatus}
              onClose={() => setSelectedId(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Smart Slot Booking / Walk-In Modal */}
      <SmartBookingDialog
        state={bookingModal}
        date={date}
        locationId={locationId}
        existing={items}
        services={services}
        patients={patients}
        onOpenServiceModal={() => setServiceModalOpen(true)}
        onClose={() => setBookingModal({ open: false })}
        onCreate={handleCreateAppointment}
      />

      {/* Service Catalog Modal */}
      <ServiceCatalogModal
        open={serviceModalOpen}
        onOpenChange={setServiceModalOpen}
      />
    </div>
  );
}

function AppointmentDetailDrawer({
  app,
  patient: pt,
  service: srv,
  vitalBP,
  setVitalBP,
  onUpdateStatus,
  onClose,
}: {
  app: Appointment;
  patient: Patient;
  service: Service;
  vitalBP: string;
  setVitalBP: (v: string) => void;
  onUpdateStatus: (id: string, st: AppointmentStatus) => void;
  onClose: () => void;
}) {
  const doc = getStaff(app.doctorId)!;
  const ch = getChair(app.chairId);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-2 border-b p-4">
        <div className="flex items-center gap-3">
          <PersonAvatar name={pt.fullName} size="md" />
          <div>
            <Link href={`/app/pasien/${pt.id}`} className="text-sm font-semibold hover:underline">
              {pt.fullName}
            </Link>
            <div className="text-xs text-muted-foreground">
              {age(pt.dob)} thn · <span className="font-mono">{pt.mrn}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="xs" onClick={onClose}>
          Tutup
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4 text-xs">
        {/* Medical Alerts */}
        {(pt.alerts.allergies.length > 0 || pt.alerts.systemic.length > 0 || pt.alerts.isPregnant) && (
          <div className="space-y-1.5 rounded-md border border-danger/25 bg-danger-soft/60 p-3">
            <div className="text-[10px] font-semibold tracking-wide text-danger uppercase">
              Peringatan Medis (Pre-Visit Intake)
            </div>
            <div className="flex flex-wrap gap-1.5">
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
              {pt.alerts.isPregnant && <MedicalAlertChip kind="pregnant">Hamil Trimester 2</MedicalAlertChip>}
            </div>
          </div>
        )}

        {/* Status Selector */}
        <div className="space-y-1.5">
          <Label className="text-xs">Status Kunjungan</Label>
          <Select value={app.status} onValueChange={(v) => onUpdateStatus(app.id, v as AppointmentStatus)}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(appointmentStatusMeta) as AppointmentStatus[]).map((st) => (
                <SelectItem key={st} value={st} className="text-xs">
                  {appointmentStatusMeta[st].label} — {appointmentStatusMeta[st].description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Schedule & Chair metadata */}
        <div className="space-y-2 rounded-md border bg-subtle/60 p-3">
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Waktu & Kursi</span>
            <span className="num text-right font-semibold">
              {app.start}–{app.end} (+{app.bufferMinutes}m steril) · {ch?.name}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Dokter</span>
            <span className="text-right font-medium">{doc.displayName}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Layanan</span>
            <span className="text-right font-medium">{srv.clinicalName}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Tarif Dasar</span>
            <span className="num font-semibold">{rupiah(srv.basePrice)}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Sumber Booking</span>
            <span>{sourceLabel[app.source]}</span>
          </div>
          <div className="flex justify-between gap-2 border-t pt-2">
            <span className="text-muted-foreground">Deposit Komitmen</span>
            <span className="num font-medium">
              {app.depositAmount > 0
                ? `${rupiah(app.depositAmount)} (${app.depositPaid ? "QRIS Lunas" : "Belum Bayar"})`
                : "Tanpa Deposit"}
            </span>
          </div>
        </div>

        {/* Pre-chair Vitals (Flow 3) */}
        <div className="space-y-2 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Tanda Vital Awal (Perawat/Front-Desk)</span>
            <span className="text-[11px] text-muted-foreground">Opsional</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[11px] text-muted-foreground">Tekanan Darah (mmHg)</Label>
              <Input
                value={vitalBP}
                onChange={(e) => setVitalBP(e.target.value)}
                className="num mt-1 h-8 text-xs"
                placeholder="120/80"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">Waktu Tiba di Lobi</Label>
              <Input value={app.arrivedAt ?? "09:58"} readOnly className="num mt-1 h-8 bg-subtle text-xs" />
            </div>
          </div>
        </div>

        {app.notes && (
          <div className="rounded-md border p-3">
            <div className="text-[11px] font-semibold text-muted-foreground">Catatan Klinis / Booking</div>
            <p className="mt-1 text-xs">{app.notes}</p>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="space-y-2 border-t bg-subtle/40 p-4">
        <div className="grid grid-cols-2 gap-2">
          {app.status === "CONFIRMED" || app.status === "BOOKED" ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={() => onUpdateStatus(app.id, "ARRIVED")}
            >
              <Clock className="size-3.5" /> Check-In Lobi
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={() => onUpdateStatus(app.id, "IN_CHAIR")}
            >
              Panggil ke {ch?.name}
            </Button>
          )}
          <Button size="sm" asChild className="w-full text-xs">
            <Link href={`/app/klinis/${app.id}`}>
              <Stethoscope className="size-3.5" /> Ruang Periksa
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => toast.success(`Membuka chat WhatsApp ${pt.fullName} (${pt.phone})`)}
          >
            <MessageCircle className="size-3.5" /> Chat WA Pasien
          </Button>
          <Button variant="ghost" size="xs" asChild>
            <Link href="/app/kasir">
              <CreditCard className="size-3.5" /> Buka Kasir
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

const CANDIDATE_SLOTS = [
  "08:30",
  "09:00",
  "09:40",
  "10:15",
  "11:15",
  "12:15",
  "13:30",
  "14:15",
  "15:15",
  "16:15",
  "17:00",
  "18:30",
];

function SmartBookingDialog({
  state,
  date,
  locationId,
  existing,
  services,
  patients,
  onOpenServiceModal,
  onClose,
  onCreate,
}: {
  state: { open: boolean; walkIn?: boolean; chairId?: string; start?: string };
  date: string;
  locationId: string;
  existing: Appointment[];
  services: Service[];
  patients: Patient[];
  onOpenServiceModal: () => void;
  onClose: () => void;
  onCreate: (app: Appointment) => void;
}) {
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "pt_01");
  const [serviceId, setServiceId] = useState("sv_scaling");
  const [doctorId, setDoctorId] = useState("dr_budi");
  const [chairId, setChairId] = useState(state.chairId ?? "ch_1");
  const [slot, setSlot] = useState(state.start ?? "12:15");
  const [requireDeposit, setRequireDeposit] = useState(!state.walkIn);

  const srv = services.find((s) => s.id === serviceId) ?? services[0];
  const totalNeeded = srv ? srv.durationMinutes + srv.bufferMinutes : 40;

  // Compute slot conflicts strictly on the active date & active appointments
  const slotStatuses = useMemo(() => {
    return CANDIDATE_SLOTS.map((cand) => {
      const startM = toMinutes(cand);
      const endM = startM + totalNeeded;
      const conflictingApp = existing.find((ap) => {
        if (ap.date !== date || ap.locationId !== locationId) return false;
        if (ap.status === "CANCELLED" || ap.status === "NO_SHOW") return false;
        if (ap.chairId !== chairId && ap.doctorId !== doctorId) return false;
        const apS = toMinutes(ap.start);
        const apE = toMinutes(ap.end) + ap.bufferMinutes;
        return startM < apE && endM > apS;
      });
      return {
        cand,
        conflict: !!conflictingApp,
        reason: conflictingApp
          ? `Bentrok jadwal ${conflictingApp.start}–${fromMinutes(toMinutes(conflictingApp.end) + conflictingApp.bufferMinutes)}`
          : "Slot tersedia",
      };
    });
  }, [existing, date, locationId, chairId, doctorId, totalNeeded]);

  // Ensure selected slot is always a non-conflicting slot when modal opens or doctor/chair/service changes
  useEffect(() => {
    const current = slotStatuses.find((s) => s.cand === slot);
    if (!current || current.conflict) {
      const firstOpen = slotStatuses.find((s) => !s.conflict);
      if (firstOpen) {
        setSlot(firstOpen.cand);
      }
    }
  }, [slotStatuses, slot]);

  const availableCount = slotStatuses.filter((s) => !s.conflict).length;

  const submit = () => {
    if (!srv) return;
    const endMin = toMinutes(slot) + srv.durationMinutes;
    onCreate({
      id: `ap_${Date.now()}`,
      patientId,
      doctorId,
      chairId,
      locationId,
      serviceId: srv.id,
      date,
      start: slot,
      end: fromMinutes(endMin),
      bufferMinutes: srv.bufferMinutes,
      status: state.walkIn ? "ARRIVED" : requireDeposit ? "CONFIRMED" : "BOOKED",
      arrivedAt: state.walkIn ? slot : undefined,
      depositAmount: requireDeposit ? 50000 : 0,
      depositPaid: requireDeposit,
      source: state.walkIn ? "WALK_IN" : "WHATSAPP",
      confirmedViaWa: true,
    });
  };

  return (
    <Dialog open={state.open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {state.walkIn ? "Registrasi Pasien Walk-In" : "Buat Janji Temu Baru (Smart Slot)"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Sistem memvalidasi ketersediaan <strong>Dokter ∩ Kursi Gigi ∩ Buffer Sterilisasi</strong> agar tidak terjadi bentrok jadwal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          {/* Pasien Selector */}
          <div className="space-y-1.5 min-w-0">
            <Label className="text-xs font-semibold">Pasien</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger className="h-9 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.fullName} ({p.mrn}) · {p.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Layanan & Dokter/Kursi — Clean non-overlapping 2-column grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <Label className="text-xs font-semibold">Layanan / Tindakan</Label>
                <button
                  type="button"
                  onClick={onOpenServiceModal}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
                >
                  <Sparkles className="size-3" /> + Buat / Ubah Layanan
                </button>
              </div>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger className="h-9 w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs">
                      {s.laymanName} ({s.durationMinutes}m + {s.bufferMinutes}m steril) · {rupiah(s.basePrice)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label className="text-xs font-semibold">Dokter & Kursi Gigi</Label>
              <Select
                value={`${doctorId}:${chairId}`}
                onValueChange={(v) => {
                  const [d, c] = v.split(":");
                  setDoctorId(d);
                  setChairId(c);
                }}
              >
                <SelectTrigger className="h-9 w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dr_budi:ch_1" className="text-xs">
                    drg. Budi Santoso · Kursi 1 (Utama)
                  </SelectItem>
                  <SelectItem value="dr_siti:ch_2" className="text-xs">
                    drg. Siti Rahmawati · Kursi 2 (Estetika)
                  </SelectItem>
                  <SelectItem value="dr_andi:ch_3" className="text-xs">
                    drg. Andi Pratama · Kursi 3 (Bedah)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Smart Slot Picker */}
          <div className="space-y-2 rounded-lg border bg-subtle/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <Label className="text-xs font-semibold">
                  Pilih Jam Tersedia (Durasi {srv?.durationMinutes ?? 30}m + Steril {srv?.bufferMinutes ?? 10}m = {totalNeeded} mnt)
                </Label>
                <div className="text-[11px] text-muted-foreground">
                  {availableCount} dari {slotStatuses.length} slot tersedia pada {dateLong(date)}
                </div>
              </div>
              <span className="num rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-semibold text-success">
                Slot Aktif: {slot}–{fromMinutes(toMinutes(slot) + (srv?.durationMinutes ?? 30))}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {slotStatuses.map(({ cand, conflict, reason }) => (
                <button
                  key={cand}
                  type="button"
                  disabled={conflict}
                  title={reason}
                  onClick={() => setSlot(cand)}
                  className={`num h-9 rounded-md border text-xs font-semibold transition-all ${
                    conflict
                      ? "cursor-not-allowed border-border/60 bg-muted/40 text-muted-foreground/40 line-through"
                      : slot === cand
                        ? "border-brand bg-brand text-brand-foreground shadow-xs ring-2 ring-brand/25"
                        : "border-border bg-card text-foreground hover:border-brand/50 hover:bg-brand-soft/40"
                  }`}
                >
                  {cand}
                </button>
              ))}
            </div>
          </div>

          {!state.walkIn && (
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border bg-subtle/60 p-3">
              <div>
                <div className="font-semibold">Kirim Link Deposit QRIS (Rp50.000) + Form Intake</div>
                <div className="text-[11px] text-muted-foreground">
                  Otomatis memotong tagihan kasir & mencegah pasien ghosting
                </div>
              </div>
              <input
                type="checkbox"
                checked={requireDeposit}
                onChange={(e) => setRequireDeposit(e.target.checked)}
                className="size-4 shrink-0 accent-brand"
              />
            </label>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button size="sm" onClick={submit} disabled={availableCount === 0}>
            <Check className="size-3.5" /> Simpan ke Kalender
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
