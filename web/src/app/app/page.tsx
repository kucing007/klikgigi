"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  FlaskConical,
  Footprints,
  MessageCircle,
  Sparkles,
  Stethoscope,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageBody, PageHeader, Section, Stat } from "@/components/shared/page";
import { AppointmentStatusBadge, LabStatusBadge, MedicalAlertChip } from "@/components/shared/status";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { useWorkspace } from "@/lib/store/workspace";
import {
  appointments,
  chairs,
  getChair,
  getPatient,
  getService,
  getStaff,
  invoices,
  invoiceTotals,
  labOrders,
  recalls,
  revenueSeries,
  TODAY,
} from "@/lib/data";
import { age, dateLong, rupiah } from "@/lib/format";
import { toast } from "sonner";

type PaywallTriggerKey = "26th_patient" | "no_show" | "wa_recall" | "watermark" | "associate_commission" | null;

export default function AppHomePage() {
  const { mode, setMode, locationId } = useWorkspace();
  const [paywallDemo, setPaywallDemo] = useState<PaywallTriggerKey>(null);

  const todayApps = appointments.filter((a) => a.date === TODAY && a.locationId === locationId);
  const waitingApps = todayApps.filter((a) => a.status === "ARRIVED");
  const inChairApps = todayApps.filter((a) => a.status === "IN_CHAIR");
  const unpaidInvoices = invoices.filter((i) => i.status !== "PAID");
  const pendingRecalls = recalls.filter((r) => r.status === "DUE" || r.status === "OVERDUE");
  const maxRev = Math.max(...revenueSeries.map((r) => r.revenue));

  return (
    <div>
      <PageHeader
        title={mode === "SOLO" ? "Praktik Hari Ini — drg. Budi Santoso" : "Ringkasan Operasional"}
        description={`${dateLong(TODAY)} · ${todayApps.length} jadwal terdaftar hari ini`}
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Sparkles className="size-3.5 text-brand" />
                  Simulasi Trigger Konversi
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  5 Contextual Paywall Triggers (pricing.md)
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setPaywallDemo("26th_patient")}>
                  1. Pasien ke-26 Bulan Ini (Kuota Free Habis)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPaywallDemo("no_show")}>
                  2. Pasien Batal / Ghosting (Anti-No-Show)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPaywallDemo("wa_recall")}>
                  3. 18 Pasien Waktunya Scaling 6 Bulan
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPaywallDemo("watermark")}>
                  4. Hapus Watermark & Slider Before-After
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPaywallDemo("associate_commission")}>
                  5. Tambah Dokter Ke-2 & Kalkulator Komisi
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" asChild>
              <Link href="/app/kalender?walkin=1">
                <Footprints className="size-4" /> Walk-In
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/app/kalender?new=1">
                <CalendarPlus className="size-4" /> Buat Janji Temu
              </Link>
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-subtle px-3 py-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">Mode Tampilan:</span>
            <button
              onClick={() => setMode("CLINIC")}
              className={`rounded px-2 py-0.5 font-medium transition-colors ${
                mode === "CLINIC" ? "bg-card text-foreground shadow-2xs border" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Multi-Doctor Clinic
            </button>
            <button
              onClick={() => setMode("SOLO")}
              className={`rounded px-2 py-0.5 font-medium transition-colors ${
                mode === "SOLO" ? "bg-card text-foreground shadow-2xs border" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Solo Practitioner (Express)
            </button>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span>
              Ruang tunggu: <strong className="num text-foreground">{waitingApps.length} pasien</strong>
            </span>
            <span>·</span>
            <span>
              Kursi aktif: <strong className="num text-foreground">{inChairApps.length}/3</strong>
            </span>
            <span>·</span>
            <Link href="/s/senyumsehat" target="_blank" className="inline-flex items-center gap-1 text-brand-ink hover:underline">
              senyumsehat.klikgigi.id <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>
      </PageHeader>

      <PageBody className="space-y-6">
        {/* KPI Row */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Penerimaan Hari Ini (Net Collection)"
            value={rupiah(3650000)}
            delta={{ value: "14% vs Senin lalu", positive: true }}
            hint="Termasuk DP QRIS Rp350.000"
          />
          <Stat
            label="Kunjungan Hari Ini"
            value={`${todayApps.length} pasien`}
            delta={{ value: "92% tingkat hadir", positive: true }}
            hint="1 selesai · 2 di kursi · 1 menunggu"
          />
          <Stat
            label="Tagihan & Cicilan Aktif"
            value={rupiah(6150000)}
            hint={`${unpaidInvoices.length} invoice belum lunas`}
          />
          <Stat
            label="Potensi Recall Bulan Ini"
            value={rupiah(6300000)}
            delta={{ value: "18 pasien jatuh tempo", positive: true }}
            hint="Scaling 6 bln & kontrol PSA"
          />
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left 8 cols: Live Patient Flow & Chair Queue */}
          <div className="space-y-6 lg:col-span-8">
            <Section
              title={mode === "SOLO" ? "Antrean Pasien Saya Hari Ini" : "Alur Pasien Hari Ini (Real-Time)"}
              description="Klik tindakan untuk langsung membuka Odontogram 3-Tap atau memproses pembayaran kasir"
              actions={
                <Button variant="ghost" size="xs" asChild>
                  <Link href="/app/kalender">
                    Buka Kalender Kursi <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              }
              bodyClassName="p-0"
            >
              <div className="divide-y">
                {todayApps.map((app) => {
                  const pt = getPatient(app.patientId)!;
                  const doc = getStaff(app.doctorId)!;
                  const srv = getService(app.serviceId)!;
                  const ch = getChair(app.chairId);
                  const hasAlerts = pt.alerts.allergies.length > 0 || pt.alerts.systemic.length > 0 || pt.alerts.isPregnant;

                  return (
                    <div key={app.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-subtle/60">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="w-14 shrink-0">
                          <div className="num text-sm font-semibold">{app.start}</div>
                          <div className="num text-[11px] text-muted-foreground">{srv.durationMinutes} mnt</div>
                        </div>
                        <PersonAvatar name={pt.fullName} size="md" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Link href={`/app/pasien/${pt.id}`} className="text-sm font-medium hover:underline">
                              {pt.fullName}
                            </Link>
                            <span className="text-xs text-muted-foreground">({age(pt.dob)} th)</span>
                            {app.visitLabel && (
                              <span className="rounded border bg-subtle px-1.5 py-0.2 text-[11px] font-medium text-foreground/80">
                                {app.visitLabel}
                              </span>
                            )}
                            {hasAlerts &&
                              pt.alerts.allergies.map((al) => (
                                <MedicalAlertChip key={al} kind="allergy">
                                  {al}
                                </MedicalAlertChip>
                              ))}
                            {pt.alerts.isPregnant && <MedicalAlertChip kind="pregnant">Trimester 2</MedicalAlertChip>}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground/80">{srv.clinicalName}</span>
                            <span>·</span>
                            <span>{ch?.name}</span>
                            {mode === "CLINIC" && (
                              <>
                                <span>·</span>
                                <span>{doc.displayName}</span>
                              </>
                            )}
                            {app.status === "ARRIVED" && (
                              <span className="num inline-flex items-center gap-1 font-medium text-warning">
                                <Clock className="size-3" /> Menunggu 14 mnt
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <AppointmentStatusBadge status={app.status} />

                        {app.status === "ARRIVED" || app.status === "IN_CHAIR" ? (
                          <Button size="xs" asChild>
                            <Link href={`/app/klinis/${app.id}`}>
                              <Stethoscope className="size-3.5" /> Ruang Periksa
                            </Link>
                          </Button>
                        ) : app.status === "COMPLETED" ? (
                          <Button size="xs" variant="outline" asChild>
                            <Link href="/app/kasir">
                              <CreditCard className="size-3.5" /> Proses Kasir
                            </Link>
                          </Button>
                        ) : (
                          <Button size="xs" variant="ghost" asChild>
                            <Link href={`/app/klinis/${app.id}`}>Buka RME</Link>
                          </Button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-xs" aria-label="Opsi jadwal">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                              <Link href={`/app/klinis/${app.id}`}>Buka Ruang Periksa</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/app/pasien/${pt.id}`}>Lihat Profil & RME</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => toast.success(`Pengingat WA dikirim ke ${pt.fullName}`)}>
                              Kirim Pengingat WA
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-danger"
                              onSelect={() => setPaywallDemo("no_show")}
                            >
                              Tandai Tidak Hadir (No-Show)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* Weekly Revenue Bar Chart */}
            <Section
              title="Tren Penerimaan 7 Hari Terakhir"
              description="Pendapatan bersih terkumpul per hari (Tunai, QRIS, Debit, Cicilan)"
              actions={
                <Button variant="ghost" size="xs" asChild>
                  <Link href="/app/laporan">
                    Laporan Lengkap <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              }
            >
              <div className="grid grid-cols-7 items-end gap-3 pt-4" style={{ height: 170 }}>
                {revenueSeries.map((item, idx) => {
                  const pct = Math.round((item.revenue / maxRev) * 100);
                  const isToday = idx === revenueSeries.length - 1;
                  return (
                    <div key={item.day} className="flex h-full flex-col items-center justify-end gap-1.5">
                      <span className="num text-[11px] font-medium text-muted-foreground">
                        {(item.revenue / 1000000).toFixed(1)}jt
                      </span>
                      <div className="flex w-full flex-1 items-end">
                        <div
                          className={`w-full rounded-t transition-all ${
                            isToday ? "bg-brand" : "bg-foreground/15 hover:bg-foreground/25"
                          }`}
                          style={{ height: `${Math.max(pct, 12)}%` }}
                          title={`${item.day}: ${rupiah(item.revenue)} (${item.visits} kunjungan)`}
                        />
                      </div>
                      <span className={`text-[11px] ${isToday ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Section>
          </div>

          {/* Right 4 cols: Operational Alerts, Lab, Recall, Cashier Queue */}
          <div className="space-y-6 lg:col-span-4">
            {/* Active Chairs Status */}
            <Section title="Status Kursi Gigi (Cabang Tebet)" description="Okupansi real-time & sterilisasi">
              <div className="space-y-2.5">
                {chairs
                  .filter((c) => c.locationId === "loc_tebet")
                  .map((ch) => {
                    const active = todayApps.find((a) => a.chairId === ch.id && a.status === "IN_CHAIR");
                    const waiting = todayApps.find((a) => a.chairId === ch.id && a.status === "ARRIVED");
                    const pt = active ? getPatient(active.patientId) : waiting ? getPatient(waiting.patientId) : undefined;
                    const doc = active ? getStaff(active.doctorId) : waiting ? getStaff(waiting.doctorId) : undefined;
                    return (
                      <div key={ch.id} className="flex items-center justify-between rounded-md border p-2.5 text-xs">
                        <div>
                          <div className="font-semibold text-foreground">{ch.name}</div>
                          <div className="text-muted-foreground">
                            {active
                              ? `${pt?.fullName} · ${doc?.displayName}`
                              : waiting
                                ? `Menunggu: ${pt?.fullName}`
                                : "Kosong · Siap pakai"}
                          </div>
                        </div>
                        {active ? (
                          <AppointmentStatusBadge status="IN_CHAIR" size="xs" />
                        ) : waiting ? (
                          <AppointmentStatusBadge status="ARRIVED" size="xs" />
                        ) : (
                          <span className="rounded-full border bg-subtle px-2 py-0.5 text-[11px] text-muted-foreground">
                            Steril
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </Section>

            {/* Recall 6 Bulan */}
            <Section
              title="Recall & Retensi Pasien"
              description={`${pendingRecalls.length} pasien jatuh tempo kontrol / scaling`}
              actions={
                <Button variant="ghost" size="xs" asChild>
                  <Link href="/app/crm">Buka CRM</Link>
                </Button>
              }
            >
              <div className="space-y-2.5">
                {recalls.slice(0, 4).map((rc) => {
                  const pt = getPatient(rc.patientId)!;
                  return (
                    <div key={rc.patientId + rc.reason} className="flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{pt.fullName}</div>
                        <div className="text-muted-foreground">
                          {rc.reason} · <span className="num">{rupiah(rc.potential)}</span>
                        </div>
                      </div>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => toast.success(`Undangan Recall WA dikirim ke ${pt.fullName}`)}
                      >
                        <MessageCircle className="size-3" /> Undang WA
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* Dental Lab Tracking */}
            <Section
              title="Pelacakan Order Lab Gigi"
              description="Crown, GTSL, dan retainer"
              actions={
                <Button variant="ghost" size="xs" asChild>
                  <Link href="/app/lab">Semua ({labOrders.length})</Link>
                </Button>
              }
            >
              <div className="space-y-2.5">
                {labOrders.slice(0, 3).map((lo) => {
                  const pt = getPatient(lo.patientId)!;
                  return (
                    <div key={lo.id} className="flex items-center justify-between gap-2 rounded-md border p-2.5 text-xs">
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {lo.workType} {lo.tooth ? `#${lo.tooth}` : ""}
                        </div>
                        <div className="truncate text-muted-foreground">
                          {pt.fullName} · {lo.vendor}
                        </div>
                      </div>
                      <LabStatusBadge status={lo.status} size="xs" />
                    </div>
                  );
                })}
              </div>
            </Section>
          </div>
        </div>
      </PageBody>

      {/* Contextual Paywall Modal (pricing.md §3) */}
      <ContextualPaywallDialog trigger={paywallDemo} onClose={() => setPaywallDemo(null)} />
    </div>
  );
}

function ContextualPaywallDialog({
  trigger,
  onClose,
}: {
  trigger: PaywallTriggerKey;
  onClose: () => void;
}) {
  if (!trigger) return null;

  const content: Record<
    Exclude<PaywallTriggerKey, null>,
    { badge: string; title: string; body: string; metric: string; tier: string; price: string; cta: string }
  > = {
    "26th_patient": {
      badge: "Momentum Nilai Ekonomi · Pasien ke-26",
      title: "Selamat Dok! Praktik Anda sudah melayani 25 pasien bulan ini.",
      body: "Dari 25 kunjungan bulan ini, estimasi omzet praktik Anda mencapai Rp9.450.000. Buka kuota kunjungan & RME tanpa batas hanya dengan sepertiga tarif 1x tindakan Scaling.",
      metric: "ROI ~73x dari biaya langganan bulanan",
      tier: "Solo Pro",
      price: "Rp129.000 / bln (atau Rp99.000/bln tahunan)",
      cta: "Upgrade ke Solo Pro — Unlimited Pasien",
    },
    no_show: {
      badge: "Anti-Ghosting Protection",
      title: "Kesal kursi kosong karena pasien batal datang mendadak?",
      body: "Aktifkan Deposit Booking QRIS Otomatis (mis. Rp50.000) dan Pengingat WhatsApp Interaktif H-1 untuk memangkas tingkat pasien No-Show hingga 80%.",
      metric: "Rata-rata menyelamatkan 4–6 jam kursi kosong per bulan",
      tier: "Solo Pro",
      price: "Rp129.000 / bln",
      cta: "Aktifkan Deposit QRIS & WA Reminder",
    },
    wa_recall: {
      badge: "Mesin Retensi Otomatis",
      title: "Ada 18 pasien Anda yang sudah waktunya Scaling 6 bulan!",
      body: "Jangan biarkan pasien lupa jadwal kontrol atau pindah ke klinik lain. Kirimkan undangan WhatsApp otomatis berisi link booking langsung ke 18 pasien tersebut.",
      metric: "Potensi omzet langsung: Rp6.300.000 bulan ini",
      tier: "Solo Pro / Clinic Growth",
      price: "Mulai Rp129.000 / bln (Termasuk 150–500 kuota WA)",
      cta: "Kirim 18 Undangan Recall Otomatis",
    },
    watermark: {
      badge: "Aesthetic Prestige & Branding",
      title: "Tampilkan Transformasi Senyum Tanpa Watermark",
      body: "Hapus badge 'Powered by KlikGigi' dan aktifkan komponen Before-After Image Slider interaktif untuk meningkatkan konversi pasien veneer, bleaching, dan ortodonti.",
      metric: "+38% konversi janji temu dari pengunjung Instagram/TikTok",
      tier: "Solo Pro",
      price: "Rp129.000 / bln",
      cta: "Buka Slider Before-After & Hapus Watermark",
    },
    associate_commission: {
      badge: "Ekspansi Tim Klinik · Anti-Sengketa",
      title: "Tambah Dokter Sejawat & Hitung Bagi Hasil Otomatis",
      body: "Kelola hingga 5 dokter gigi dan 3 kursi dengan perhitungan komisi otomatis berbasis Net Collection (setelah potong biaya lab & bahan) serta rilis proporsional sesuai cicilan pasien.",
      metric: "0 selisih hitung bagi hasil di akhir bulan",
      tier: "Clinic Growth",
      price: "Rp349.000 / bln (atau Rp279.000/bln tahunan)",
      cta: "Upgrade ke Clinic Growth",
    },
  };

  const c = content[trigger];

  return (
    <Dialog open={!!trigger} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-1 inline-flex w-fit items-center gap-1.5 rounded-full border bg-brand-soft px-2.5 py-0.5 text-[11px] font-medium text-brand-ink">
            <TrendingUp className="size-3" /> {c.badge}
          </div>
          <DialogTitle className="text-base">{c.title}</DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">{c.body}</DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border bg-subtle p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Paket Rekomendasi</span>
            <span className="font-semibold text-foreground">{c.tier}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-muted-foreground">Investasi</span>
            <span className="num font-medium text-foreground">{c.price}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 border-t pt-2 font-medium text-brand-ink">
            <CheckCircle2 className="size-3.5" /> {c.metric}
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Nanti Saja
          </Button>
          <Button size="sm" asChild onClick={onClose}>
            <Link href="/app/pengaturan/langganan">{c.cta}</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
