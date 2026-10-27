"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarPlus,
  Check,
  CheckCircle2,
  CreditCard,
  Edit3,
  MessageCircle,
  Pill,
  Plus,
  Printer,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageBody, PageHeader } from "@/components/shared/page";
import { PaymentStatusBadge } from "@/components/shared/status";
import { PersonAvatar } from "@/components/shared/person-avatar";
import {
  MedicationReviewModal,
  ServiceCatalogModal,
} from "@/components/clinical/catalog-and-meds-modals";
import {
  doctors,
  getPatient,
  getStaff,
  invoiceTotals,
  nurses,
} from "@/lib/data";
import { dateShort, paymentMethodLabel, rupiah } from "@/lib/format";
import { useWorkspace } from "@/lib/store/workspace";
import type { PaymentMethod, Service } from "@/lib/types";
import { toast } from "sonner";

export function CashierWorkspace({ initialId }: { initialId?: string }) {
  const {
    invoices,
    prescriptionsByAppointment,
    addInvoiceItem,
    updateInvoiceItem,
    removeInvoiceItem,
    recordInvoicePayment,
    resetDemoData,
  } = useWorkspace();

  const [filter, setFilter] = useState<"ALL" | "UNPAID" | "PARTIAL" | "PAID">("ALL");
  const [selectedId, setSelectedId] = useState<string>(initialId ?? invoices[0]?.id ?? "inv_0089");

  // Modals for Medication Review & Service Catalog CRUD
  const [medModalOpen, setMedModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("modal");
      if (q === "meds") setMedModalOpen(true);
      if (q === "services") setServiceModalOpen(true);
    }
  }, []);

  // Payment Controls
  const [payType, setPayType] = useState<"FULL" | "INSTALLMENT">("FULL");
  const [method, setMethod] = useState<PaymentMethod>("QRIS");
  const [installmentInput, setInstallmentInput] = useState<number>(450000);
  const [nextSlot, setNextSlot] = useState("10:00");
  const [retentionBooked, setRetentionBooked] = useState(false);

  const filtered = invoices.filter((inv) => (filter === "ALL" ? true : inv.status === filter));
  const selected = invoices.find((i) => i.id === selectedId) ?? invoices[0];
  const pt = getPatient(selected.patientId)!;
  const totals = invoiceTotals(selected);

  const appointmentKey = selected.appointmentId ?? `inv_${selected.id}`;
  const activePrescriptions = prescriptionsByAppointment[appointmentKey] ?? [];
  const unreviewedCount = activePrescriptions.filter((r) => !r.reviewedByPharmacy).length;

  // Live Anti-Dispute Commission Preview (core.md §3)
  const netBase = selected.items.reduce(
    (s, it) => s + (it.unitPrice * it.qty - it.discount - it.materialCost - it.labCost),
    0,
  );
  const totalCommissionEarned = Math.round(Math.max(0, netBase) * 0.4); // 40% Net default
  const amountBeingPaidNow =
    selected.status === "PAID"
      ? 0
      : payType === "FULL"
        ? totals.remaining
        : Math.min(installmentInput, totals.remaining);
  const projectedPaidTotal = totals.paid + selected.depositDeducted + amountBeingPaidNow;
  const projectedGrandWithDeposit = totals.grand + selected.depositDeducted;
  const paidRatio =
    projectedGrandWithDeposit > 0 ? Math.min(1, projectedPaidTotal / projectedGrandWithDeposit) : 1;
  const releasableCommission = Math.round(totalCommissionEarned * paidRatio);

  const handleAddServiceFromCatalog = (srv: Service) => {
    addInvoiceItem(selected.id, {
      id: `ii_${Date.now()}`,
      serviceId: srv.id,
      description: srv.clinicalName,
      doctorId: selected.items[0]?.doctorId ?? "dr_budi",
      nurseId: selected.items[0]?.nurseId ?? "ns_rini",
      qty: 1,
      unitPrice: srv.basePrice,
      discount: 0,
      materialCost: srv.materialCost,
      labCost: 0,
    });
    toast.success(`Layanan "${srv.clinicalName}" ditambahkan ke invoice ${selected.number}`);
  };

  const handleConfirmPayment = () => {
    if (amountBeingPaidNow <= 0) return;
    recordInvoicePayment(
      selected.id,
      amountBeingPaidNow,
      method,
      payType === "INSTALLMENT",
    );
    toast.success(
      `Pembayaran ${rupiah(amountBeingPaidNow)} via ${paymentMethodLabel[method]} berhasil! Kwitansi WA terkirim & komisi dokter (${rupiah(releasableCommission)}) tercatat.`,
    );
  };

  return (
    <div>
      <PageHeader
        title="Kasir, Review Resep & Penyelesaian Tagihan"
        description="Sinkronisasi langsung dengan Ruang Periksa: rincian tindakan, review resep obat & alergi, potongan deposit QRIS, dan komisi dokter"
        actions={
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                ["ALL", `Semua (${invoices.length})`],
                [
                  "UNPAID",
                  `Belum Bayar (${invoices.filter((i) => i.status === "UNPAID").length})`,
                ],
                [
                  "PARTIAL",
                  `Cicilan (${invoices.filter((i) => i.status === "PARTIAL").length})`,
                ],
                ["PAID", `Lunas (${invoices.filter((i) => i.status === "PAID").length})`],
              ] as const
            ).map(([k, label]) => (
              <Button
                key={k}
                size="xs"
                variant={filter === k ? "default" : "outline"}
                onClick={() => setFilter(k)}
              >
                {label}
              </Button>
            ))}
            <Button
              size="xs"
              variant="ghost"
              onClick={() => {
                resetDemoData();
                toast.info("Data tagihan & resep direset ke kondisi demo awal");
              }}
              title="Reset data demo"
            >
              <RotateCcw className="size-3.5" /> Reset
            </Button>
          </div>
        }
      />

      <PageBody>
        <div className="grid gap-6 xl:grid-cols-12">
          {/* Left 4 cols: Synchronized Invoice Queue List */}
          <div className="space-y-2.5 xl:col-span-4">
            {filtered.map((inv) => {
              const p = getPatient(inv.patientId)!;
              const t = invoiceTotals(inv);
              const active = inv.id === selected.id;
              return (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(inv.id);
                    setRetentionBooked(false);
                    setEditingItemId(null);
                  }}
                  className={`w-full rounded-xl border bg-card p-3.5 text-left transition-all ${
                    active ? "border-brand ring-2 ring-brand/25" : "hover:border-border-strong"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-muted-foreground">{inv.number}</div>
                      <div className="mt-0.5 truncate text-sm font-semibold">{p.fullName}</div>
                    </div>
                    <PaymentStatusBadge status={inv.status} size="xs" />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
                    <span>
                      {dateShort(inv.date)} · {inv.items.length} item
                    </span>
                    <span className="num font-mono font-semibold text-foreground">
                      {inv.status === "PAID" ? rupiah(t.grand) : `Sisa ${rupiah(t.remaining)}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right 8 cols: Split-Screen Checkout (design.md Layar 3) */}
          <div className="xl:col-span-8">
            <div className="overflow-hidden rounded-xl border bg-card">
              {/* Top Invoice Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
                <div className="flex items-center gap-3">
                  <PersonAvatar name={pt.fullName} size="md" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-muted-foreground">
                        {selected.number}
                      </span>
                      <PaymentStatusBadge status={selected.status} size="xs" />
                      {pt.alerts.allergies.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded bg-danger-soft px-2 py-0.5 font-mono text-[10px] font-semibold text-danger">
                          <AlertTriangle className="size-3" /> Alergi:{" "}
                          {pt.alerts.allergies.join(", ")}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-3">
                      <Link
                        href={`/app/pasien/${pt.id}`}
                        className="text-base font-semibold hover:underline"
                      >
                        Pasien: {pt.fullName}
                      </Link>
                      {selected.appointmentId && (
                        <Link
                          href={`/app/klinis/${selected.appointmentId}`}
                          className="inline-flex items-center gap-1 rounded-md border bg-subtle px-2 py-0.5 text-[11px] font-medium text-brand-ink hover:border-brand"
                        >
                          <Stethoscope className="size-3" /> Buka Ruang Periksa
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => toast.success("Membuka dialog cetak kwitansi thermal / A5")}
                  >
                    <Printer className="size-3.5" /> Cetak Kwitansi
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() =>
                      toast.success(`Kwitansi PDF dikirim ke WhatsApp ${pt.fullName}`)
                    }
                  >
                    <MessageCircle className="size-3.5" /> Kirim PDF ke WA
                  </Button>
                </div>
              </div>

              {/* Split Body: Left Rincian, Obat & Retensi | Right Pembayaran & Komisi */}
              <div className="grid divide-y lg:grid-cols-12 lg:divide-x lg:divide-y-0">
                {/* Left 7 cols: Line Items, Medication Review & Next-Visit Retention Prompt */}
                <div className="space-y-5 p-5 lg:col-span-7">
                  {/* Properly spaced header with non-overlapping action buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                    <div>
                      <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Rincian Tindakan, Obat &amp; Atribusi
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Klik nilai harga untuk mengubah tarif atau tambahkan layanan/resep
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setServiceModalOpen(true)}
                      >
                        <Plus className="size-3" /> Layanan / Tarif
                      </Button>
                      <Button
                        size="xs"
                        variant={unreviewedCount > 0 ? "default" : "outline"}
                        onClick={() => setMedModalOpen(true)}
                      >
                        <Pill className="size-3" /> Review Obat &amp; Resep (
                        {activePrescriptions.length})
                      </Button>
                    </div>
                  </div>

                  {/* Dedicated Pharmacy / Medication Review Summary Banner */}
                  <div className="rounded-xl border bg-subtle/50 p-3.5 text-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Pill className="size-3.5 text-brand" />
                        <span>Status Review Resep &amp; Keamanan Obat</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMedModalOpen(true)}
                        className="font-semibold text-brand-ink hover:underline"
                      >
                        Kelola Resep &amp; Dosis →
                      </button>
                    </div>

                    {activePrescriptions.length === 0 ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                        <span>Belum ada resep obat untuk pasien ini.</span>
                        <button
                          type="button"
                          onClick={() => setMedModalOpen(true)}
                          className="underline font-medium text-foreground"
                        >
                          + Tambah Obat dari Formularium
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {activePrescriptions.map((rx) => (
                          <div
                            key={rx.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-2.5 py-1.5 text-[11px]"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold">{rx.name}</span>
                              <span className="ml-1.5 text-muted-foreground">· {rx.signa}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-medium ${
                                  rx.reviewedByPharmacy
                                    ? "bg-emerald-500/15 text-emerald-700"
                                    : "bg-amber-500/15 text-amber-800"
                                }`}
                              >
                                <ShieldCheck className="size-3" />
                                {rx.reviewedByPharmacy ? "Aman" : "Review"}
                              </span>
                              <span className="num font-mono font-semibold">
                                {rupiah(rx.unitPrice * rx.qty)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Invoice Line Items List */}
                  <div className="space-y-3">
                    {selected.items.map((item, idx) => {
                      const isEditing = editingItemId === item.id;
                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border bg-subtle/35 p-3.5 text-xs space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold text-sm">
                                {idx + 1}. {item.description}
                              </span>
                              {item.tooth && (
                                <span className="ml-1.5 rounded border bg-card px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                                  Gigi #{item.tooth}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="num font-mono text-sm font-bold">
                                {rupiah(item.unitPrice * item.qty - item.discount)}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingItemId(isEditing ? null : item.id)
                                }
                                className="rounded p-1 text-muted-foreground hover:bg-card hover:text-foreground"
                                title="Ubah harga atau jumlah"
                              >
                                <Edit3 className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  removeInvoiceItem(selected.id, item.id);
                                  toast.info("Item dihapus dari invoice");
                                }}
                                className="rounded p-1 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                                title="Hapus baris"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Inline Price / Qty / Discount Editor */}
                          {isEditing && (
                            <div className="grid grid-cols-3 gap-2 rounded-lg border bg-card p-2.5">
                              <div>
                                <label className="text-[10px] text-muted-foreground">
                                  Harga Satuan (Rp)
                                </label>
                                <Input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) =>
                                    updateInvoiceItem(selected.id, item.id, {
                                      unitPrice: Math.max(0, Number(e.target.value) || 0),
                                    })
                                  }
                                  className="mt-0.5 h-7 font-mono text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground">
                                  Kuantitas
                                </label>
                                <Input
                                  type="number"
                                  min={1}
                                  value={item.qty}
                                  onChange={(e) =>
                                    updateInvoiceItem(selected.id, item.id, {
                                      qty: Math.max(1, Number(e.target.value) || 1),
                                    })
                                  }
                                  className="mt-0.5 h-7 font-mono text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground">
                                  Potongan / Diskon (Rp)
                                </label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={item.discount}
                                  onChange={(e) =>
                                    updateInvoiceItem(selected.id, item.id, {
                                      discount: Math.max(0, Number(e.target.value) || 0),
                                    })
                                  }
                                  className="mt-0.5 h-7 font-mono text-xs"
                                />
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div>
                              <label className="text-[10px] font-medium text-muted-foreground">
                                Dokter Pelaksana
                              </label>
                              <select
                                value={item.doctorId}
                                onChange={(e) =>
                                  updateInvoiceItem(selected.id, item.id, {
                                    doctorId: e.target.value,
                                  })
                                }
                                className="mt-0.5 h-8 w-full rounded-md border bg-card px-2 text-xs"
                              >
                                {doctors.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.displayName}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-medium text-muted-foreground">
                                Perawat Asisten
                              </label>
                              <select
                                value={item.nurseId ?? ""}
                                onChange={(e) =>
                                  updateInvoiceItem(selected.id, item.id, {
                                    nurseId: e.target.value,
                                  })
                                }
                                className="mt-0.5 h-8 w-full rounded-md border bg-card px-2 text-xs"
                              >
                                <option value="">— Tanpa Perawat —</option>
                                {nurses.map((n) => (
                                  <option key={n.id} value={n.id}>
                                    {n.displayName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {(item.materialCost > 0 || item.labCost > 0) && (
                            <div className="flex flex-wrap gap-3 border-t pt-1.5 text-[11px] text-muted-foreground">
                              {item.materialCost > 0 && (
                                <span>Potongan Bahan (BMHP): {rupiah(item.materialCost)}</span>
                              )}
                              {item.labCost > 0 && (
                                <span>Potongan Lab Gigi: {rupiah(item.labCost)}</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Prompt Retensi Otomatis (design.md Layar 3) */}
                  <div className="rounded-xl border border-brand/30 bg-brand-soft/45 p-3.5 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-brand-ink">
                      <Sparkles className="size-3.5" /> PROMPT RETENSI OTOMATIS (Dari Ruang
                      Periksa)
                    </div>
                    <p className="mt-1 leading-relaxed text-foreground/85">
                      &ldquo;{getStaff(selected.items[0]?.doctorId)?.displayName} menjadwalkan{" "}
                      <strong>Kunjungan Lanjutan / Kontrol Evaluasi</strong> dalam 7 hari (Senin, 2
                      Nov 2026). Kunci jadwal sekarang selagi pasien berada di depan kasir?&rdquo;
                    </p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <select
                        value={nextSlot}
                        onChange={(e) => setNextSlot(e.target.value)}
                        className="h-8 rounded-md border bg-card px-2.5 text-xs font-medium"
                      >
                        <option value="09:00">Senin, 2 Nov · 09:00</option>
                        <option value="10:00">Senin, 2 Nov · 10:00</option>
                        <option value="14:00">Senin, 2 Nov · 14:00</option>
                        <option value="16:00">Senin, 2 Nov · 16:00</option>
                      </select>
                      <Button
                        size="xs"
                        variant={retentionBooked ? "outline" : "default"}
                        onClick={() => {
                          setRetentionBooked(true);
                          toast.success(
                            `Jadwal lanjutan ${pt.fullName} terkunci: Senin, 2 Nov 2026 pukul ${nextSlot}`,
                          );
                        }}
                      >
                        <CalendarPlus className="size-3.5" />
                        {retentionBooked ? "Jadwal Terkunci" : "Booking Sekarang"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right 5 cols: Pembayaran, Cicilan & Kalkulasi Komisi */}
                <div className="flex flex-col justify-between space-y-4 p-5 lg:col-span-5">
                  <div className="space-y-4 text-xs">
                    <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Pembayaran &amp; Komisi Dokter
                    </h3>

                    <div className="space-y-2 rounded-xl border bg-subtle/60 p-3.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Subtotal ({selected.items.length} Item)
                        </span>
                        <span className="num font-mono font-medium">
                          {rupiah(totals.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Potongan Deposit Booking</span>
                        <span className="num font-mono font-medium text-success">
                          −{rupiah(selected.depositDeducted)}
                        </span>
                      </div>
                      {totals.paid > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sudah Dibayar Sebelumnya</span>
                          <span className="num font-mono font-medium text-info">
                            −{rupiah(totals.paid)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-2.5 text-sm font-bold">
                        <span>Sisa Tagihan Akhir</span>
                        <span className="num font-mono text-base">{rupiah(totals.remaining)}</span>
                      </div>
                    </div>

                    {selected.status !== "PAID" && (
                      <>
                        {/* Tipe Bayar: Lunas vs Cicilan */}
                        <div className="space-y-1.5">
                          <Label className="text-xs">Tipe Pembayaran</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setPayType("FULL")}
                              className={`h-9 rounded-md border text-xs font-medium ${
                                payType === "FULL"
                                  ? "border-brand bg-brand-soft text-brand-ink"
                                  : "bg-card hover:bg-subtle"
                              }`}
                            >
                              ● Pelunasan Penuh
                            </button>
                            <button
                              type="button"
                              onClick={() => setPayType("INSTALLMENT")}
                              className={`h-9 rounded-md border text-xs font-medium ${
                                payType === "INSTALLMENT"
                                  ? "border-brand bg-brand-soft text-brand-ink"
                                  : "bg-card hover:bg-subtle"
                              }`}
                            >
                              ○ Cicilan / Bertahap
                            </button>
                          </div>
                        </div>

                        {payType === "INSTALLMENT" && (
                          <div className="space-y-1">
                            <Label className="text-xs">Nominal Bayar Hari Ini (Cicilan / DP)</Label>
                            <Input
                              type="number"
                              value={installmentInput}
                              onChange={(e) => setInstallmentInput(Number(e.target.value))}
                              className="h-9 font-mono text-xs num"
                            />
                          </div>
                        )}

                        {/* Metode Pembayaran */}
                        <div className="space-y-1.5">
                          <Label className="text-xs">Metode Pembayaran</Label>
                          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                            {(["QRIS", "DEBIT", "CASH", "TRANSFER"] as PaymentMethod[]).map((m) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setMethod(m)}
                                className={`h-9 rounded-md border text-xs font-medium ${
                                  method === m
                                    ? "border-brand bg-brand text-brand-foreground"
                                    : "bg-card hover:bg-subtle"
                                }`}
                              >
                                {paymentMethodLabel[m]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Anti-Dispute Commission Engine Preview (core.md §3) */}
                    <div className="rounded-xl border bg-subtle/40 p-3.5 space-y-1.5">
                      <div className="font-semibold text-[11px] text-muted-foreground uppercase">
                        Kalkulasi Komisi Otomatis (Paid on Collection)
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Net Base (Setelah Bahan/Lab)</span>
                        <span className="num font-mono">{rupiah(netBase)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Hak Komisi (40% Net)</span>
                        <span className="num font-mono">{rupiah(totalCommissionEarned)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1.5 font-semibold text-brand-ink">
                        <span>Komisi Cair ({Math.round(paidRatio * 100)}% terbayar)</span>
                        <span className="num font-mono">{rupiah(releasableCommission)}</span>
                      </div>
                    </div>
                  </div>

                  {selected.status === "PAID" ? (
                    <div className="rounded-lg border border-success/30 bg-success-soft p-3 text-center text-xs font-semibold text-success">
                      Tagihan Ini Sudah Lunas
                    </div>
                  ) : (
                    <Button className="w-full gap-1.5" onClick={handleConfirmPayment}>
                      <CheckCircle2 className="size-4" />
                      Konfirmasi Bayar {rupiah(amountBeingPaidNow)} &amp; Kirim WA
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageBody>

      {/* Modals for Medication Review & Service Catalog CRUD */}
      <MedicationReviewModal
        open={medModalOpen}
        onOpenChange={setMedModalOpen}
        appointmentId={appointmentKey}
        patient={pt}
        doctorId={selected.items[0]?.doctorId ?? "dr_budi"}
      />

      <ServiceCatalogModal
        open={serviceModalOpen}
        onOpenChange={setServiceModalOpen}
        onSelectServiceForPatient={handleAddServiceFromCatalog}
      />
    </div>
  );
}

export default function CashierPage() {
  return <CashierWorkspace />;
}
