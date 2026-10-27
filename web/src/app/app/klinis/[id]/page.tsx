"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarPlus,
  Camera,
  Check,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  FileSignature,
  FlaskConical,
  Package,
  Pill,
  Plus,
  ShieldCheck,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MedicalAlertChip } from "@/components/shared/status";
import { PersonAvatar } from "@/components/shared/person-avatar";
import {
  FdiOdontogram,
  type OdontogramActionPayload,
} from "@/components/odontogram/fdi-odontogram";
import {
  MedicationReviewModal,
  ServiceCatalogModal,
} from "@/components/clinical/catalog-and-meds-modals";
import { useWorkspace } from "@/lib/store/workspace";
import {
  chartDedi,
  doctors,
  getPatient,
  getStaff,
  inventory,
  nurses,
  soapChips,
  toothHistories,
  treatmentPlans,
  TODAY,
} from "@/lib/data";
import { age, dateShort, rupiah } from "@/lib/format";
import type { ChartData, Service, ToothHistory } from "@/lib/types";
import { toast } from "sonner";

export default function ClinicalWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const {
    mode,
    appointments,
    services,
    invoices,
    prescriptionsByAppointment,
    ensureAppointmentInvoice,
    addInvoiceItem,
    updateInvoiceItem,
    removeInvoiceItem,
    recordInvoicePayment,
  } = useWorkspace();

  const appointment = appointments.find((a) => a.id === id) ?? appointments[1];
  const patient = getPatient(appointment.patientId) ?? getPatient("pt_dedi")!;
  const initialDoctor = getStaff(appointment.doctorId) ?? doctors[0];

  // Ensure synchronized invoice exists in global store
  const existingInvoice = invoices.find((inv) => inv.appointmentId === appointment.id);
  useEffect(() => {
    if (!existingInvoice) {
      ensureAppointmentInvoice(appointment.id);
    }
  }, [appointment.id, existingInvoice, ensureAppointmentInvoice]);

  const syncedInvoice =
    existingInvoice ??
    invoices.find((inv) => inv.patientId === patient.id) ??
    invoices[0];
  const cart = syncedInvoice.items;
  const activePrescriptions = prescriptionsByAppointment[appointment.id] ?? [];

  const [dentition, setDentition] = useState<"ADULT" | "PEDIATRIC">("ADULT");
  const [selectedTooth, setSelectedTooth] = useState<number>(36);
  const [chart, setChart] = useState<ChartData>(chartDedi);
  const [histories, setHistories] = useState<ToothHistory[]>(toothHistories);
  const [presentationMode, setPresentationMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // SOAP State
  const [soapS, setSoapS] = useState(
    "Pasien datang untuk melanjutkan perawatan saluran akar gigi 36. Keluhan nyeri spontan sudah berkurang.",
  );
  const [soapO, setSoapO] = useState(
    "Gigi 36 (M,O): Tambalan sementara utuh, perkusi (−), palpasi (−). Tekanan darah: 135/88 mmHg.",
  );
  const [soapA, setSoapA] = useState("Gigi 36: Pulpitis ireversibel (pasca ekstirpasi pulpa).");
  const [soapP, setSoapP] = useState(
    "Gigi 36: PSA Kunjungan 2 (Cleaning & Shaping) + irigasi NaOCl + dressing Ca(OH)₂.",
  );

  // Planned Phases
  const existingPlan =
    treatmentPlans.find((tp) => tp.patientId === patient.id) ?? treatmentPlans[0];
  const [planPhases, setPlanPhases] = useState(existingPlan.phases);

  // Modals & Drawers
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentSigned, setConsentSigned] = useState(existingPlan.consentSigned);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [bmhpModalOpen, setBmhpModalOpen] = useState(false);
  const [medModalOpen, setMedModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [soloCheckoutOpen, setSoloCheckoutOpen] = useState(false);

  const findService = (srvId: string) =>
    services.find((s) => s.id === srvId) ?? services[0];

  // Handle 3-Tap Odontogram Action (core.md §2 Single Atomic Update — Synced to Global Store)
  const handleOdontogramAction = (payload: OdontogramActionPayload) => {
    const srv = findService(payload.serviceId);
    const layer = payload.mode === "NOW" ? "COMPLETED" : "PLANNED";

    // 1. Update JSONB Snapshot
    setChart((prev) => {
      const curr = prev[String(payload.tooth)] ?? { presence: "PRESENT", surfaces: {} };
      const nextSurfaces = { ...curr.surfaces };
      for (const s of payload.surfaces) {
        nextSurfaces[s] = { code: payload.conditionCode, layer };
      }
      return {
        ...prev,
        [String(payload.tooth)]: {
          ...curr,
          presence: payload.conditionCode === "MISSING" ? "MISSING" : "PRESENT",
          surfaces: nextSurfaces,
        },
      };
    });

    // 2. Insert Audit History
    setHistories((prev) => [
      {
        id: `th_${Date.now()}`,
        patientId: patient.id,
        tooth: payload.tooth,
        surfaces: payload.surfaces,
        condition: payload.conditionLabel,
        layer,
        serviceId: srv.id,
        doctorId: initialDoctor.id,
        date: TODAY,
        notes:
          payload.mode === "NOW"
            ? `Dikerjakan: ${srv.clinicalName}`
            : `Direncanakan: ${srv.clinicalName}`,
      },
      ...prev,
    ]);

    // 3. Auto-append SOAP Notes
    const surfLabel = payload.surfaces.join(",");
    setSoapO((prev) => `${prev}\nGigi ${payload.tooth} (${surfLabel}): ${payload.conditionLabel}.`);
    setSoapP((prev) => `${prev}\nGigi ${payload.tooth} (${surfLabel}): ${srv.clinicalName}.`);

    // 4. Auto-create Synchronized Invoice Item OR Treatment Plan Phase
    if (payload.mode === "NOW") {
      addInvoiceItem(syncedInvoice.id, {
        id: `ci_${Date.now()}`,
        serviceId: srv.id,
        description: srv.clinicalName,
        tooth: payload.tooth,
        surfaces: payload.surfaces,
        doctorId: initialDoctor.id,
        nurseId: "ns_rini",
        qty: 1,
        unitPrice: srv.basePrice,
        discount: 0,
        materialCost: srv.materialCost,
        labCost: 0,
      });
      toast.success(
        `Gigi #${payload.tooth}: ${srv.clinicalName} otomatis disinkronkan ke tagihan Kasir (${syncedInvoice.number}) & SOAP`,
      );
    } else {
      setPlanPhases((prev) => [
        ...prev,
        {
          id: `ph_${Date.now()}`,
          order: prev.length + 1,
          tooth: payload.tooth,
          serviceId: srv.id,
          estimatedPrice: srv.basePrice,
          intervalDays: 7,
          status: "PENDING",
        },
      ]);
      toast.success(`Gigi #${payload.tooth}: ${srv.clinicalName} ditambahkan ke Treatment Plan`);
    }
  };

  const handleAddServiceFromCatalog = (srv: Service) => {
    addInvoiceItem(syncedInvoice.id, {
      id: `ci_${Date.now()}`,
      serviceId: srv.id,
      description: srv.clinicalName,
      tooth: srv.requiresTooth ? selectedTooth : undefined,
      doctorId: initialDoctor.id,
      nurseId: "ns_rini",
      qty: 1,
      unitPrice: srv.basePrice,
      discount: 0,
      materialCost: srv.materialCost,
      labCost: 0,
    });
    toast.success(`Layanan "${srv.clinicalName}" ditambahkan & disinkronkan ke Kasir`);
  };

  const handleResetTooth = (tooth: number) => {
    setChart((prev) => {
      const copy = { ...prev };
      delete copy[String(tooth)];
      return copy;
    });
    toast.info(`Status visual Gigi #${tooth} direset`);
  };

  const appendChip = (field: "S" | "O" | "A", text: string) => {
    if (field === "S") setSoapS((p) => (p ? `${p}, ${text}` : text));
    if (field === "O") setSoapO((p) => (p ? `${p}, ${text}` : text));
    if (field === "A") setSoapA((p) => (p ? `${p}, ${text}` : text));
  };

  const cartSubtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty - i.discount, 0);
  const deposit = syncedInvoice.depositDeducted;
  const finalTotal = Math.max(0, cartSubtotal - deposit);

  const selectedToothHistory = histories.filter((h) => h.tooth === selectedTooth);

  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] flex-col">
      {/* Clinical Patient Sticky Header (design.md §3 Layar 2) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="icon-xs" asChild aria-label="Kembali ke Kalender">
            <Link href="/app/kalender">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <PersonAvatar name={patient.fullName} size="md" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/app/pasien/${patient.id}`}
                className="text-sm font-semibold hover:underline"
              >
                {patient.fullName}
              </Link>
              <span className="text-xs text-muted-foreground">
                ({age(patient.dob)} thn · {patient.gender === "L" ? "Laki-laki" : "Perempuan"})
              </span>
              <span className="font-mono text-xs text-muted-foreground">{patient.mrn}</span>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700">
                Sync Kasir: {syncedInvoice.number}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {patient.alerts.allergies.map((al) => (
                <MedicalAlertChip key={al} kind="allergy">
                  {al}
                </MedicalAlertChip>
              ))}
              {patient.alerts.systemic.map((sy) => (
                <MedicalAlertChip key={sy} kind="systemic">
                  {sy} (TD: 135/88)
                </MedicalAlertChip>
              ))}
              {patient.alerts.isPregnant && (
                <MedicalAlertChip kind="pregnant">Hamil</MedicalAlertChip>
              )}
              {patient.alerts.allergies.length === 0 &&
                patient.alerts.systemic.length === 0 && (
                  <span className="text-xs text-muted-foreground">
                    Tidak ada riwayat alergi obat / komorbid
                  </span>
                )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMedModalOpen(true)}
            className="gap-1.5 text-xs"
          >
            <Pill className="size-3.5 text-brand" />
            Review Obat &amp; Resep ({activePrescriptions.length})
          </Button>

          <Button
            variant={presentationMode ? "default" : "outline"}
            size="sm"
            onClick={() => setPresentationMode(!presentationMode)}
            className="gap-1.5 text-xs"
          >
            {presentationMode ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            {presentationMode ? "Keluar Mode Pasien" : "Mode Presentasi Pasien"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setConsentOpen(true)}
            className="gap-1.5 text-xs"
          >
            <FileSignature className="size-3.5" />
            {consentSigned ? "Consent Tertandatangan" : "Informed Consent"}
          </Button>

          <Button
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => {
              if (mode === "SOLO") {
                setSoloCheckoutOpen(true);
              } else {
                toast.success(
                  `Rekam medis, resep & ${cart.length} item tindakan disinkronkan ke Kasir (${syncedInvoice.number})`,
                );
                router.push("/app/kasir");
              }
            }}
          >
            <CheckCircle2 className="size-3.5" />
            {mode === "SOLO"
              ? "Selesai & Terima Bayar (Solo)"
              : `Selesai & Buka Kasir (${rupiah(finalTotal)})`}
          </Button>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="grid flex-1 gap-5 p-4 lg:grid-cols-12">
        {/* LEFT/CENTER PANEL (7 cols): Interactive Odontogram & Clinical Visuals */}
        <div className="space-y-4 lg:col-span-7">
          <Tabs defaultValue="odontogram">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <TabsList>
                <TabsTrigger
                  value="odontogram"
                  onClick={() => setDentition("ADULT")}
                  className="text-xs"
                >
                  Dewasa (FDI 11–48)
                </TabsTrigger>
                <TabsTrigger
                  value="pediatric"
                  onClick={() => setDentition("PEDIATRIC")}
                  className="text-xs"
                >
                  Anak / Sulung (51–85)
                </TabsTrigger>
                <TabsTrigger value="imaging" className="text-xs">
                  Foto Intraoral &amp; Rontgen (3)
                </TabsTrigger>
              </TabsList>

              <span className="text-xs font-medium text-muted-foreground">
                Pilih perawatan &amp; klik permukaan gigi (M/O/D/B/P) untuk{" "}
                <strong>Charting &amp; Sync Kasir</strong>
              </span>
            </div>

            <TabsContent value="odontogram" className="mt-3">
              <FdiOdontogram
                chart={chart}
                dentition="ADULT"
                selectedTooth={selectedTooth}
                onSelectTooth={setSelectedTooth}
                onApplyAction={handleOdontogramAction}
                onResetTooth={handleResetTooth}
                presentationMode={presentationMode}
              />
            </TabsContent>

            <TabsContent value="pediatric" className="mt-3">
              <FdiOdontogram
                chart={chart}
                dentition="PEDIATRIC"
                selectedTooth={selectedTooth}
                onSelectTooth={setSelectedTooth}
                onApplyAction={handleOdontogramAction}
                onResetTooth={handleResetTooth}
                presentationMode={presentationMode}
              />
            </TabsContent>

            <TabsContent value="imaging" className="mt-3">
              <div className="rounded-lg border bg-card p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold">
                      Dokumentasi Foto Intraoral &amp; Radiografi
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Otomatis dikompresi ke WebP (~180 KB) di sisi klien untuk menghemat kuota
                      cloud
                    </div>
                  </div>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() =>
                      toast.success("Foto intraoral berhasil diunggah (WebP 164 KB)")
                    }
                  >
                    <Camera className="size-3.5" /> Unggah Foto / Rontgen
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      title: "Rontgen Periapikal Gigi #36",
                      date: "19 Okt 2026",
                      tag: "PRE-OP X-RAY",
                      kind: "XRAY_PRE",
                      note: "Radiolusensi periapikal + karies profunda M-O mendekati tanduk pulpa",
                    },
                    {
                      title: "Intraoral Oklusal Rahang Bawah",
                      date: "19 Okt 2026",
                      tag: "INTRAORAL CAM",
                      kind: "INTRAORAL",
                      note: "Karies mencapai dentin dalam gigi #36, tampak impaksi sebagian #38",
                    },
                    {
                      title: "Working Length X-Ray #36",
                      date: "26 Okt 2026",
                      tag: "WL 21.0 MM",
                      kind: "XRAY_WL",
                      note: "Konfirmasi panjang kerja 3 saluran akar (MB, ML, D) 21.0 mm",
                    },
                  ].map((img) => (
                    <div key={img.title} className="rounded-md border bg-subtle/50 p-3 text-xs">
                      <div className="relative aspect-4/3 overflow-hidden rounded border bg-[#0B0F17]">
                        {img.kind !== "INTRAORAL" ? (
                          <svg viewBox="0 0 160 120" className="h-full w-full" aria-hidden="true">
                            <rect width="160" height="120" fill="#0A0E14" />
                            <path
                              d="M0 52 Q80 46 160 52 L160 120 L0 120 Z"
                              fill="#1E293B"
                              opacity="0.7"
                            />
                            <circle
                              cx="62"
                              cy="96"
                              r={img.kind === "XRAY_PRE" ? "14" : "8"}
                              fill="#05070B"
                              opacity="0.9"
                            />
                            <path
                              d="M44 26 C44 16 108 16 108 26 L104 54 L92 94 C90 100 84 100 82 92 L78 62 L72 62 L66 94 C64 100 56 100 54 92 L48 54 Z"
                              fill="#CBD5E1"
                              opacity="0.88"
                            />
                            {img.kind === "XRAY_PRE" && (
                              <path d="M44 22 Q58 38 72 28 L56 18 Z" fill="#1E293B" />
                            )}
                            <path d="M58 36 H94 L88 54 H62 Z" fill="#0F172A" />
                            {img.kind === "XRAY_WL" && (
                              <g stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round">
                                <line x1="64" y1="14" x2="60" y2="92" />
                                <line x1="74" y1="14" x2="66" y2="90" />
                                <line x1="88" y1="14" x2="87" y2="92" />
                              </g>
                            )}
                          </svg>
                        ) : (
                          <svg viewBox="0 0 160 120" className="h-full w-full" aria-hidden="true">
                            <rect width="160" height="120" fill="#7F1D1D" />
                            <ellipse
                              cx="80"
                              cy="60"
                              rx="68"
                              ry="46"
                              fill="#B91C1C"
                              opacity="0.55"
                            />
                            <rect
                              x="44"
                              y="24"
                              width="72"
                              height="68"
                              rx="22"
                              fill="#F8FAFC"
                              stroke="#CBD5E1"
                              strokeWidth="2"
                            />
                            <path
                              d="M54 58 H106 M78 36 V80"
                              stroke="#94A3B8"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <ellipse cx="64" cy="56" rx="14" ry="12" fill="#451A03" />
                            <ellipse cx="64" cy="56" rx="8" ry="7" fill="#DC2626" opacity="0.6" />
                          </svg>
                        )}
                        <span className="absolute top-2 left-2 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-white">
                          {img.tag}
                        </span>
                      </div>
                      <div className="mt-2 font-semibold">{img.title}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{img.date}</div>
                      <p className="mt-1 text-[11px] text-muted-foreground">{img.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Audit Trail Per Tooth */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between border-b pb-2.5">
              <div>
                <h3 className="text-sm font-semibold">
                  Riwayat Klinis Gigi #{selectedTooth} (Audit Trail)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Klik nomor gigi lain pada Odontogram di atas untuk memfilter riwayat spesifik gigi
                </p>
              </div>
              <span className="num rounded bg-muted px-2 py-0.5 text-xs font-medium">
                {selectedToothHistory.length} catatan
              </span>
            </div>

            {selectedToothHistory.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Belum ada riwayat tindakan pada Gigi #{selectedTooth}. Ketuk gigi #{selectedTooth}{" "}
                di atas untuk menambah kondisi/tindakan.
              </div>
            ) : (
              <div className="mt-3 divide-y text-xs">
                {selectedToothHistory.map((h) => {
                  const doc = getStaff(h.doctorId);
                  return (
                    <div key={h.id} className="flex items-start justify-between gap-3 py-2.5">
                      <div>
                        <div className="font-medium">
                          Gigi #{h.tooth} {h.surfaces.length > 0 ? `(${h.surfaces.join(",")})` : ""}{" "}
                          — {h.condition}
                        </div>
                        {h.notes && <div className="text-muted-foreground">{h.notes}</div>}
                      </div>
                      <div className="shrink-0 text-right text-[11px] text-muted-foreground">
                        <div className="num font-medium text-foreground">{dateShort(h.date)}</div>
                        <div>{doc?.displayName}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL (5 cols): Tindakan Hari Ini, Resep Obat, Quick-Tap SOAP, Treatment Plan */}
        <div className="space-y-4 lg:col-span-5">
          {/* 1. Tindakan Hari Ini (100% Live Synced with Kasir) */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
              <div>
                <h2 className="text-sm font-semibold">
                  Tindakan &amp; Obat Hari Ini (Auto-Sync Kasir)
                </h2>
                <p className="text-xs text-muted-foreground">
                  Tersinkronisasi langsung dengan {syncedInvoice.number} di menu Kasir
                </p>
              </div>
              {!presentationMode && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    variant="default"
                    size="xs"
                    onClick={() => setServiceModalOpen(true)}
                  >
                    <Plus className="size-3" /> Layanan / Buat Baru
                  </Button>
                  <Button variant="outline" size="xs" onClick={() => setBmhpModalOpen(true)}>
                    <Package className="size-3" /> + BMHP
                  </Button>
                  <Button variant="outline" size="xs" onClick={() => setLabModalOpen(true)}>
                    <FlaskConical className="size-3" /> + Lab
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-3 space-y-2.5">
              {cart.map((item, idx) => {
                const isEditing = editingItemId === item.id;
                return (
                  <div key={item.id} className="rounded-lg border bg-subtle/40 p-3 text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold">
                          {idx + 1}. {item.description}
                        </span>
                        {item.tooth && (
                          <span className="ml-1.5 rounded border bg-card px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                            Gigi #{item.tooth}
                            {item.surfaces?.length ? ` (${item.surfaces.join(",")})` : ""}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="num font-mono font-semibold">
                          {rupiah(item.unitPrice * item.qty - item.discount)}
                        </span>
                        {!presentationMode && (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditingItemId(isEditing ? null : item.id)}
                              className="rounded p-1 text-muted-foreground hover:bg-card hover:text-foreground"
                              title="Ubah harga"
                            >
                              <Edit3 className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeInvoiceItem(syncedInvoice.id, item.id)}
                              className="rounded p-1 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                              aria-label="Hapus item"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing && !presentationMode && (
                      <div className="grid grid-cols-2 gap-2 rounded border bg-card p-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground">
                            Tarif Tindakan (Rp)
                          </label>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateInvoiceItem(syncedInvoice.id, item.id, {
                                unitPrice: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                            className="mt-0.5 h-7 font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground">
                            Modal Bahan / BMHP (Rp)
                          </label>
                          <Input
                            type="number"
                            value={item.materialCost}
                            onChange={(e) =>
                              updateInvoiceItem(syncedInvoice.id, item.id, {
                                materialCost: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                            className="mt-0.5 h-7 font-mono text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {!presentationMode && (
                      <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground">
                            Dokter Pelaksana
                          </label>
                          <select
                            value={item.doctorId}
                            onChange={(e) =>
                              updateInvoiceItem(syncedInvoice.id, item.id, {
                                doctorId: e.target.value,
                              })
                            }
                            className="mt-0.5 h-7 w-full rounded border bg-card px-2 text-[11px]"
                          >
                            {doctors.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.displayName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground">
                            Perawat Asisten
                          </label>
                          <select
                            value={item.nurseId ?? ""}
                            onChange={(e) =>
                              updateInvoiceItem(syncedInvoice.id, item.id, {
                                nurseId: e.target.value,
                              })
                            }
                            className="mt-0.5 h-7 w-full rounded border bg-card px-2 text-[11px]"
                          >
                            {nurses.map((n) => (
                              <option key={n.id} value={n.id}>
                                {n.displayName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex items-center justify-between border-t pt-2.5 text-xs">
                <span className="text-muted-foreground">
                  Tagihan Akhir Hari Ini (Potong Deposit {rupiah(deposit)})
                </span>
                <span className="num font-mono text-sm font-bold text-brand-ink">
                  {rupiah(finalTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* 2. E-Prescription & Medication Allergy Review Card */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
              <div>
                <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                  <Pill className="size-4 text-brand" /> Resep Obat &amp; Review Alergi Pasien
                </h2>
                <p className="text-xs text-muted-foreground">
                  Pemeriksaan interaksi alergi obat otomatis sebelum diserahkan ke kasir/apotek
                </p>
              </div>
              <Button size="xs" variant="outline" onClick={() => setMedModalOpen(true)}>
                <Plus className="size-3" /> Kelola &amp; Review Obat
              </Button>
            </div>

            {patient.alerts.allergies.length > 0 && (
              <div className="flex items-center justify-between rounded-md border border-danger/30 bg-danger-soft/50 px-3 py-2 text-xs text-danger">
                <span className="flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="size-3.5 shrink-0" /> Kontraindikasi Pasien:{" "}
                  {patient.alerts.allergies.join(", ")}
                </span>
                <span className="font-mono text-[10px]">NSAID Guard Aktif</span>
              </div>
            )}

            {activePrescriptions.length === 0 ? (
              <div className="py-3 text-center text-xs text-muted-foreground">
                Belum ada resep obat. Klik <strong>Kelola &amp; Review Obat</strong> untuk memilih
                dari formularium.
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {activePrescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="flex items-center justify-between gap-2 rounded-md border bg-subtle/40 p-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{rx.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Signa: {rx.signa} · {rx.qty} {rx.unit}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
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

          {/* 3. Quick-Tap SOAP Notes (Hidden in Patient Presentation Mode) */}
          {!presentationMode && (
            <div className="rounded-lg border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">Catatan Medis SOAP &amp; Quick-Tap Chips</h2>
                  <p className="text-xs text-muted-foreground">
                    Ketuk chip untuk menambahkan temuan klinis tanpa mengetik panjang
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      S — Subjective (Keluhan Pasien)
                    </Label>
                  </div>
                  <div className="mb-1.5 flex flex-wrap gap-1">
                    {soapChips.S.slice(0, 6).map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => appendChip("S", ch)}
                        className="rounded-full border bg-subtle px-2.5 py-1 text-[11px] font-medium hover:border-brand hover:bg-brand-soft"
                      >
                        + {ch}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={soapS}
                    onChange={(e) => setSoapS(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      O — Objective (Pemeriksaan &amp; Vital)
                    </Label>
                  </div>
                  <div className="mb-1.5 flex flex-wrap gap-1">
                    {soapChips.O.slice(0, 6).map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => appendChip("O", ch)}
                        className="rounded-full border bg-subtle px-2.5 py-1 text-[11px] font-medium hover:border-brand hover:bg-brand-soft"
                      >
                        + {ch}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={soapO}
                    onChange={(e) => setSoapO(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs font-semibold">A — Assessment (Diagnosa)</Label>
                    <Textarea
                      value={soapA}
                      onChange={(e) => setSoapA(e.target.value)}
                      rows={2}
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">P — Plan (Tindakan &amp; Resep)</Label>
                    <Textarea
                      value={soapP}
                      onChange={(e) => setSoapP(e.target.value)}
                      rows={2}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Multi-Visit Treatment Plan (Visible & Highlighted in Presentation Mode) */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between border-b pb-2.5">
              <div>
                <h2 className="text-sm font-semibold">
                  Tahapan Rencana Perawatan (Treatment Plan)
                </h2>
                <p className="text-xs text-muted-foreground">{existingPlan.title}</p>
              </div>
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  setPlanPhases((prev) => [
                    ...prev,
                    {
                      id: `ph_${Date.now()}`,
                      order: prev.length + 1,
                      tooth: selectedTooth,
                      serviceId: "sv_komposit2",
                      estimatedPrice: 450000,
                      intervalDays: 7,
                      status: "PENDING",
                    },
                  ]);
                  toast.success("Tahap kunjungan baru ditambahkan");
                }}
              >
                <Plus className="size-3" /> Tambah Tahap
              </Button>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              {planPhases.map((ph) => {
                const srv = findService(ph.serviceId);
                return (
                  <div
                    key={ph.id}
                    className="flex items-center justify-between gap-2 rounded-md border p-2.5"
                  >
                    <div>
                      <div className="font-medium">
                        Kunjungan {ph.order}: {srv?.clinicalName ?? "Tindakan Lanjutan"}{" "}
                        {ph.tooth ? `(Gigi #${ph.tooth})` : ""}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Interval +{ph.intervalDays} hari · Estimasi{" "}
                        <span className="num font-medium text-foreground">
                          {rupiah(ph.estimatedPrice)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        ph.status === "DONE"
                          ? "border-success/30 bg-success-soft text-success"
                          : ph.status === "SCHEDULED"
                            ? "border-info/30 bg-info-soft text-info"
                            : "bg-subtle text-muted-foreground"
                      }`}
                    >
                      {ph.status === "DONE"
                        ? "Selesai"
                        : ph.status === "SCHEDULED"
                          ? "Hari Ini"
                          : "Rencana"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modals for Medication Review & Service Catalog CRUD */}
      <MedicationReviewModal
        open={medModalOpen}
        onOpenChange={setMedModalOpen}
        appointmentId={appointment.id}
        patient={patient}
        doctorId={initialDoctor.id}
      />

      <ServiceCatalogModal
        open={serviceModalOpen}
        onOpenChange={setServiceModalOpen}
        onSelectServiceForPatient={handleAddServiceFromCatalog}
      />

      {/* Digital Informed Consent Signature Dialog */}
      <InformedConsentDialog
        open={consentOpen}
        patientName={patient.fullName}
        doctorName={initialDoctor.displayName}
        onClose={() => setConsentOpen(false)}
        onSigned={() => {
          setConsentSigned(true);
          setConsentOpen(false);
          toast.success("Digital Informed Consent berhasil ditandatangani & dienkripsi SHA-256");
        }}
      />

      {/* Order Lab Gigi Modal */}
      <Dialog open={labModalOpen} onOpenChange={setLabModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Order Lab Gigi Baru</DialogTitle>
            <DialogDescription className="text-xs">
              Biaya lab otomatis memotong perhitungan Net Base komisi dokter terkait.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div>
              <Label className="text-xs">Nama Vendor Dental Lab</Label>
              <Input defaultValue="Prima Dental Lab" className="mt-1 h-8 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Jenis Pekerjaan</Label>
                <Input
                  defaultValue={`Crown Zirconia Gigi #${selectedTooth}`}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Shade Warna (VITA)</Label>
                <Input defaultValue="A2" className="mt-1 h-8 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Biaya Lab (Rp)</Label>
                <Input defaultValue="1350000" className="mt-1 h-8 text-xs num" />
              </div>
              <div>
                <Label className="text-xs">Estimasi Selesai</Label>
                <Input type="date" defaultValue="2026-11-05" className="mt-1 h-8 text-xs" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setLabModalOpen(false)}>
              Batal
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setLabModalOpen(false);
                toast.success("Order Lab Gigi tercatat & terhubung ke encounter pasien");
              }}
            >
              Simpan Order Lab
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BMHP / Consumables Modal */}
      <Dialog open={bmhpModalOpen} onOpenChange={setBmhpModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Catat Pemakaian Bahan Habis Pakai (BMHP)</DialogTitle>
            <DialogDescription className="text-xs">
              Stok inventori akan terpotong otomatis saat kasir menyelesaikan pembayaran.
            </DialogDescription>
          </DialogHeader>
          <div className="divide-y rounded-md border text-xs">
            {inventory.slice(0, 4).map((inv) => (
              <label key={inv.id} className="flex items-center justify-between px-3 py-2">
                <div>
                  <div className="font-medium">{inv.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Sisa stok: {inv.stock} {inv.unit}
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="size-4 accent-brand" />
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button
              size="sm"
              onClick={() => {
                setBmhpModalOpen(false);
                toast.success("Pemakaian BMHP tercatat");
              }}
            >
              Simpan Pemakaian
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Solo Mode Express Checkout Drawer (design.md §1.3) */}
      <Sheet open={soloCheckoutOpen} onOpenChange={setSoloCheckoutOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Kasir Express (Solo Practitioner Mode)</SheetTitle>
            <SheetDescription className="text-xs">
              Selesaikan pembayaran &amp; kunci jadwal kunjungan berikutnya tanpa berpindah
              halaman.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4 text-xs">
            <div className="rounded-md border bg-subtle/60 p-3 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pasien</span>
                <span className="font-semibold">{patient.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({cart.length} item)</span>
                <span className="num font-medium">{rupiah(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Potongan Deposit QRIS</span>
                <span className="num text-success">−{rupiah(deposit)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-sm font-semibold">
                <span>Total Bayar Sekarang</span>
                <span className="num">{rupiah(finalTotal)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Metode Pembayaran</Label>
              <div className="grid grid-cols-3 gap-2">
                {["QRIS Dinamis", "Kartu Debit", "Tunai"].map((m, i) => (
                  <button
                    key={m}
                    type="button"
                    className={`h-9 rounded-md border font-medium ${
                      i === 0 ? "border-brand bg-brand-soft text-brand-ink" : "bg-card"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-brand/30 bg-brand-soft/40 p-3 space-y-2">
              <div className="font-semibold text-brand-ink">Prompt Retensi Otomatis</div>
              <p className="text-[11px] text-muted-foreground">
                Kunci jadwal <strong>PSA Kunjungan 3 (Obturasi)</strong> untuk {patient.fullName}{" "}
                dalam 7 hari (Senin, 2 Nov 2026 pukul 10:00)?
              </p>
              <Button
                variant="outline"
                size="xs"
                onClick={() =>
                  toast.success("Jadwal 2 Nov 2026 10:00 dikunci & pengingat WA disiapkan")
                }
              >
                <CalendarPlus className="size-3.5" /> Kunci Jadwal 2 Nov 2026 · 10:00
              </Button>
            </div>

            <Button
              className="w-full"
              onClick={() => {
                recordInvoicePayment(syncedInvoice.id, finalTotal, "QRIS", false);
                setSoloCheckoutOpen(false);
                toast.success(
                  "Pembayaran Lunas! Kwitansi PDF & instruksi pasca-tindakan dikirim ke WhatsApp pasien.",
                );
              }}
            >
              <Check className="size-4" /> Konfirmasi Lunas &amp; Kirim Kwitansi WA
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function InformedConsentDialog({
  open,
  patientName,
  doctorName,
  onClose,
  onSigned,
}: {
  open: boolean;
  patientName: string;
  doctorName: string;
  onClose: () => void;
  onSigned: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setDrawing(true);
  };

  const moveDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Persetujuan Tindakan Kedokteran Gigi (Informed Consent)</DialogTitle>
          <DialogDescription className="text-xs">
            Sesuai Permenkes RI tentang Persetujuan Tindakan Kedokteran &amp; Rekam Medis
            Elektronik.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-xs">
          <div className="rounded-md border bg-subtle/60 p-3 space-y-1">
            <div>
              <strong>Pasien:</strong> {patientName}
            </div>
            <div>
              <strong>Dokter Penanggung Jawab:</strong> {doctorName}
            </div>
            <div>
              <strong>Prosedur &amp; Risiko yang Dijelaskan:</strong> Perawatan Saluran Akar (PSA)
              &amp; anestesi lokal; potensi rasa ngilu pasca-instrumentasi 1–3 hari; alternatif
              tindakan bila perawatan tidak dilakukan.
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Tanda Tangan Pasien / Wali di Layar</Label>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                Bersihkan Pad
              </button>
            </div>
            <canvas
              ref={canvasRef}
              width={440}
              height={130}
              onPointerDown={startDraw}
              onPointerMove={moveDraw}
              onPointerUp={() => setDrawing(false)}
              onPointerLeave={() => setDrawing(false)}
              className="w-full touch-none rounded-md border bg-white cursor-crosshair"
            />
            <div className="text-[11px] text-muted-foreground">
              Goreskan tanda tangan di kotak atas menggunakan jari, stylus, atau kursor.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button size="sm" onClick={onSigned}>
            <Check className="size-3.5" /> Simpan &amp; Kunci Tanda Tangan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
