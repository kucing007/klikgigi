"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Edit3,
  Pill,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { rupiah } from "@/lib/format";
import { useWorkspace } from "@/lib/store/workspace";
import type {
  MedicineItem,
  Patient,
  PrescribedMedicine,
  Service,
  ServiceCategory,
} from "@/lib/types";
import { toast } from "sonner";

/**
 * Checks if a medicine conflicts with a patient's allergies or pregnancy state
 */
export function checkMedicineContraindication(med: MedicineItem, patient?: Patient) {
  if (!patient) return { hasAllergyConflict: false, matchedAllergy: null, pregnancyConflict: false };
  const patientAllergyText = patient.alerts.allergies.join(" ").toLowerCase();
  const matched = med.allergyKeywords.find((kw) =>
    patientAllergyText.includes(kw.toLowerCase()),
  );
  const pregnancyConflict = patient.alerts.isPregnant && !med.pregnancySafe;
  return {
    hasAllergyConflict: Boolean(matched),
    matchedAllergy: matched ?? null,
    pregnancyConflict,
  };
}

/**
 * Modal 1: Review Obat, Resep & Keamanan Alergi Pasien
 * Used in both Ruang Periksa (/app/klinis/[id]) and Kasir (/app/kasir)
 */
export function MedicationReviewModal({
  open,
  onOpenChange,
  appointmentId,
  patient,
  doctorId = "dr_budi",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  appointmentId: string;
  patient?: Patient;
  doctorId?: string;
}) {
  const {
    medicines,
    prescriptionsByAppointment,
    addPrescription,
    updatePrescription,
    removePrescription,
    markAllPrescriptionsReviewed,
    addMedicine,
  } = useWorkspace();

  const currentRx = prescriptionsByAppointment[appointmentId] ?? [];

  // Custom new medicine form
  const [showNewMedForm, setShowNewMedForm] = useState(false);
  const [newMedName, setNewMedName] = useState("");
  const [newMedUnit, setNewMedUnit] = useState("strip (10 tablet)");
  const [newMedPrice, setNewMedPrice] = useState(45000);
  const [newMedCost, setNewMedCost] = useState(15000);
  const [newMedSigna, setNewMedSigna] = useState("3×1 tablet sesudah makan");

  const handlePrescribe = (med: MedicineItem, overrideNote?: string) => {
    const conflict = checkMedicineContraindication(med, patient);
    if (conflict.hasAllergyConflict && !overrideNote) {
      toast.error(
        `Peringatan Alergi: ${patient?.fullName} memiliki riwayat alergi ${conflict.matchedAllergy}. Pilih obat alternatif aman atau konfirmasi override.`,
      );
      return;
    }

    const rx: PrescribedMedicine = {
      id: `rx_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      medicineId: med.id,
      name: med.name,
      qty: 1,
      unit: med.unit,
      unitPrice: med.price,
      unitCost: med.cost,
      signa: med.defaultSigna,
      reviewedByPharmacy: true,
      allergyOverrideNote: overrideNote,
    };

    addPrescription(appointmentId, rx, doctorId);
    toast.success(`${med.name} ditambahkan ke resep & disinkronkan ke tagihan Kasir`);
  };

  const handleCreateAndPrescribe = () => {
    if (!newMedName.trim()) {
      toast.error("Masukkan nama obat atau alkes terlebih dahulu");
      return;
    }
    const created: MedicineItem = {
      id: `med_${Date.now()}`,
      code: `OBT-${medicines.length + 1}`,
      name: newMedName.trim(),
      category: "ANALGESIC",
      unit: newMedUnit,
      price: Number(newMedPrice) || 0,
      cost: Number(newMedCost) || 0,
      stock: 50,
      defaultSigna: newMedSigna,
      allergyKeywords: [],
      pregnancySafe: true,
    };
    addMedicine(created);
    handlePrescribe(created);
    setNewMedName("");
    setShowNewMedForm(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Pill className="size-4 text-brand" /> Review Resep Obat, Dosis &amp; Alergi Pasien
          </DialogTitle>
          <DialogDescription className="text-xs">
            Setiap resep yang ditambahkan atau diubah otomatis menyinkronkan harga dan potongan
            BMHP di Ruang Periksa dan Kasir.
          </DialogDescription>
        </DialogHeader>

        {/* Patient Medical Alert Banner */}
        {patient && (
          <div
            className={`rounded-xl border p-3.5 text-xs ${
              patient.alerts.allergies.length > 0 || patient.alerts.isPregnant
                ? "border-danger/40 bg-danger-soft/60 text-danger"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-semibold">
                {patient.alerts.allergies.length > 0 ? (
                  <ShieldAlert className="size-4 shrink-0" />
                ) : (
                  <ShieldCheck className="size-4 shrink-0" />
                )}
                <span>Pasien: {patient.fullName}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {patient.alerts.allergies.length > 0 ? (
                  patient.alerts.allergies.map((al) => (
                    <span
                      key={al}
                      className="rounded bg-danger px-2 py-0.5 font-mono text-[10px] font-bold text-white"
                    >
                      ALERGI: {al.toUpperCase()}
                    </span>
                  ))
                ) : (
                  <span className="font-mono text-[11px]">Tidak Ada Alergi Obat Tercatat</span>
                )}
                {patient.alerts.systemic.map((sys) => (
                  <span
                    key={sys}
                    className="rounded border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-800"
                  >
                    KOMORBID: {sys}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Prescriptions for this Patient/Encounter */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Resep Aktif Kunjungan Ini ({currentRx.length} Obat)
            </div>
            {currentRx.length > 0 && (
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  markAllPrescriptionsReviewed(appointmentId);
                  toast.success("Seluruh dosis & interaksi alergi resep telah diverifikasi aman");
                }}
              >
                <CheckCircle2 className="size-3.5 text-emerald-600" /> Tandai Semua Telah Direview
              </Button>
            )}
          </div>

          {currentRx.length === 0 ? (
            <div className="rounded-lg border border-dashed p-5 text-center text-xs text-muted-foreground">
              Belum ada obat/resep pada kunjungan ini. Pilih dari formularium di bawah atau buat
              obat baru.
            </div>
          ) : (
            <div className="space-y-2">
              {currentRx.map((rx) => (
                <div
                  key={rx.id}
                  className="rounded-xl border bg-subtle/40 p-3 text-xs space-y-2.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{rx.name}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
                            rx.reviewedByPharmacy
                              ? "bg-emerald-500/15 text-emerald-700"
                              : "bg-amber-500/15 text-amber-800"
                          }`}
                        >
                          {rx.reviewedByPharmacy ? "Terverifikasi Aman" : "Perlu Review Dosis"}
                        </span>
                      </div>
                      {rx.notes && (
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{rx.notes}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="num font-mono text-sm font-bold">
                        {rupiah(rx.unitPrice * rx.qty)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          removePrescription(appointmentId, rx.id);
                          toast.info(`${rx.name} dihapus dari resep & tagihan`);
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                        title="Hapus obat"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Editable Signa, Qty, Price */}
                  <div className="grid gap-2 sm:grid-cols-12">
                    <div className="sm:col-span-6">
                      <label className="text-[10px] font-medium text-muted-foreground">
                        Signa / Aturan Pakai
                      </label>
                      <Input
                        value={rx.signa}
                        onChange={(e) =>
                          updatePrescription(appointmentId, rx.id, { signa: e.target.value })
                        }
                        className="mt-0.5 h-8 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-medium text-muted-foreground">
                        Jumlah ({rx.unit.split(" ")[0]})
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={rx.qty}
                        onChange={(e) =>
                          updatePrescription(appointmentId, rx.id, {
                            qty: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                        className="mt-0.5 h-8 font-mono text-xs"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-medium text-muted-foreground">
                        Harga Satuan (Rp)
                      </label>
                      <Input
                        type="number"
                        value={rx.unitPrice}
                        onChange={(e) =>
                          updatePrescription(appointmentId, rx.id, {
                            unitPrice: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className="mt-0.5 h-8 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clinic Formulary Picker with Live Allergy Guard */}
        <div className="space-y-2.5 border-t pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Formularium Obat &amp; Alkes Klinik (Deteksi Alergi Otomatis)
              </div>
              <p className="text-[11px] text-muted-foreground">
                Klik untuk meresepkan obat, atau buat obat/resep kustom baru.
              </p>
            </div>
            <Button
              size="xs"
              variant="outline"
              onClick={() => setShowNewMedForm(!showNewMedForm)}
            >
              <Plus className="size-3.5" /> {showNewMedForm ? "Tutup Form" : "Buat Obat / Alkes Baru"}
            </Button>
          </div>

          {showNewMedForm && (
            <div className="rounded-xl border bg-subtle/60 p-3.5 space-y-3 text-xs">
              <div className="font-semibold">Tambah Obat / Resep / Alkes Baru ke Katalog</div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Nama Obat / Konsumabel</Label>
                  <Input
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="Mis. Metronidazole 500 mg"
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Satuan Kemasan</Label>
                  <Input
                    value={newMedUnit}
                    onChange={(e) => setNewMedUnit(e.target.value)}
                    placeholder="strip (10 tablet)"
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Harga Jual Pasien (Rp)</Label>
                  <Input
                    type="number"
                    value={newMedPrice}
                    onChange={(e) => setNewMedPrice(Number(e.target.value))}
                    className="mt-1 h-8 font-mono text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Aturan Pakai Default (Signa)</Label>
                  <Input
                    value={newMedSigna}
                    onChange={(e) => setNewMedSigna(e.target.value)}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button size="xs" variant="ghost" onClick={() => setShowNewMedForm(false)}>
                  Batal
                </Button>
                <Button size="xs" onClick={handleCreateAndPrescribe}>
                  <Check className="size-3.5" /> Simpan &amp; Tambahkan ke Pasien
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            {medicines.map((med) => {
              const conflict = checkMedicineContraindication(med, patient);
              const safeAlt = med.safeAlternativeId
                ? medicines.find((m) => m.id === med.safeAlternativeId)
                : undefined;

              return (
                <div
                  key={med.id}
                  className={`flex flex-col justify-between rounded-xl border p-3 text-xs transition-all ${
                    conflict.hasAllergyConflict
                      ? "border-danger/50 bg-danger-soft/30"
                      : "bg-card hover:border-brand"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold leading-snug">{med.name}</span>
                      <span className="num shrink-0 font-mono font-semibold">
                        {rupiah(med.price)}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {med.defaultSigna} · {med.unit}
                    </div>

                    {conflict.hasAllergyConflict && (
                      <div className="mt-1.5 rounded-md border border-danger/30 bg-danger/10 p-2 text-[11px] text-danger">
                        <div className="flex items-center gap-1 font-semibold">
                          <AlertTriangle className="size-3.5 shrink-0" /> Kontraindikasi Alergi:{" "}
                          {conflict.matchedAllergy}
                        </div>
                        {safeAlt && (
                          <button
                            type="button"
                            onClick={() => handlePrescribe(safeAlt)}
                            className="mt-1 inline-flex items-center gap-1 font-semibold underline"
                          >
                            Pilih Alternatif Aman: {safeAlt.name}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t pt-2">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      Stok: {med.stock}
                    </span>
                    {conflict.hasAllergyConflict ? (
                      <Button
                        size="xs"
                        variant="outline"
                        className="border-danger/40 text-danger hover:bg-danger-soft"
                        onClick={() =>
                          handlePrescribe(med, "Override oleh dokter dengan pengawasan")
                        }
                      >
                        Tetap Resepkan (Override)
                      </Button>
                    ) : (
                      <Button size="xs" onClick={() => handlePrescribe(med)}>
                        <Plus className="size-3" /> Resepkan
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Modal 2: Buat, Ubah & Pilih Layanan / Tindakan Klinik (Full CRUD)
 * Solves: "saya tidak dapat membuat layanan atau mengubah"
 */
export function ServiceCatalogModal({
  open,
  onOpenChange,
  onSelectServiceForPatient,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSelectServiceForPatient?: (srv: Service) => void;
}) {
  const { services, addService, updateService, deleteService } = useWorkspace();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);

  // Form states
  const [code, setCode] = useState("TIN-09");
  const [clinicalName, setClinicalName] = useState("");
  const [laymanName, setLaymanName] = useState("");
  const [category, setCategory] = useState<ServiceCategory>("FILLING");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [bufferMinutes, setBufferMinutes] = useState(10);
  const [basePrice, setBasePrice] = useState(450000);
  const [materialCost, setMaterialCost] = useState(50000);
  const [bookableOnline, setBookableOnline] = useState(true);

  const startCreate = () => {
    setEditingId(null);
    setCreatingNew(true);
    setCode(`TIN-${services.length + 1}`);
    setClinicalName("");
    setLaymanName("");
    setCategory("FILLING");
    setDurationMinutes(45);
    setBufferMinutes(10);
    setBasePrice(400000);
    setMaterialCost(45000);
    setBookableOnline(true);
  };

  const startEdit = (srv: Service) => {
    setCreatingNew(false);
    setEditingId(srv.id);
    setCode(srv.code);
    setClinicalName(srv.clinicalName);
    setLaymanName(srv.laymanName);
    setCategory(srv.category);
    setDurationMinutes(srv.durationMinutes);
    setBufferMinutes(srv.bufferMinutes);
    setBasePrice(srv.basePrice);
    setMaterialCost(srv.materialCost);
    setBookableOnline(srv.bookableOnline);
  };

  const handleSave = () => {
    if (!clinicalName.trim()) {
      toast.error("Nama tindakan klinis wajib diisi");
      return;
    }

    if (creatingNew) {
      const created: Service = {
        id: `sv_${Date.now()}`,
        code: code.trim() || `TIN-${services.length + 1}`,
        clinicalName: clinicalName.trim(),
        laymanName: laymanName.trim() || clinicalName.trim(),
        category,
        durationMinutes: Number(durationMinutes) || 30,
        bufferMinutes: Number(bufferMinutes) || 10,
        basePrice: Number(basePrice) || 0,
        materialCost: Number(materialCost) || 0,
        requiresTooth: true,
        requiresConsent: false,
        bookableOnline,
      };
      addService(created);
      toast.success(`Layanan "${created.clinicalName}" berhasil dibuat!`);
      if (onSelectServiceForPatient) {
        onSelectServiceForPatient(created);
      }
      setCreatingNew(false);
    } else if (editingId) {
      updateService(editingId, {
        code,
        clinicalName: clinicalName.trim(),
        laymanName: laymanName.trim() || clinicalName.trim(),
        category,
        durationMinutes: Number(durationMinutes) || 30,
        bufferMinutes: Number(bufferMinutes) || 10,
        basePrice: Number(basePrice) || 0,
        materialCost: Number(materialCost) || 0,
        bookableOnline,
      });
      toast.success(`Perubahan tarif & layanan "${clinicalName}" berhasil disimpan!`);
      setEditingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <div>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="size-4 text-brand" /> Katalog Layanan, Tarif Tindakan &amp;
                Durasi Kursi
              </DialogTitle>
              <DialogDescription className="text-xs">
                Buat layanan baru, ubah tarif/modal BMHP, atau tambahkan tindakan langsung ke
                tagihan pasien.
              </DialogDescription>
            </div>
            <Button size="xs" onClick={startCreate}>
              <Plus className="size-3.5" /> Buat Layanan Baru
            </Button>
          </div>
        </DialogHeader>

        {/* Create / Edit Form */}
        {(creatingNew || editingId) && (
          <div className="rounded-xl border border-brand/40 bg-brand-soft/20 p-4 space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-semibold text-sm text-brand-ink">
                {creatingNew ? "Buat Layanan / Tindakan Baru" : `Edit Layanan (${code})`}
              </span>
              <button
                type="button"
                onClick={() => {
                  setCreatingNew(false);
                  setEditingId(null);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Tutup Editor
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs">Kode Tindakan</Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1 h-8 font-mono text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Nama Medis / Klinis (Tampil di RME &amp; Kasir)</Label>
                <Input
                  value={clinicalName}
                  onChange={(e) => setClinicalName(e.target.value)}
                  placeholder="Mis. Inlay / Onlay Porcelain E-Max"
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Nama Bahasa Awam (Tampil di Web Booking Pasien)</Label>
                <Input
                  value={laymanName}
                  onChange={(e) => setLaymanName(e.target.value)}
                  placeholder="Mis. Tambal Porselen Kuat"
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Kategori</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as ServiceCategory)}
                >
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONSULT">Konsultasi &amp; Diagnostik</SelectItem>
                    <SelectItem value="SCALING">Scaling &amp; Preventif</SelectItem>
                    <SelectItem value="FILLING">Restorasi / Tambal</SelectItem>
                    <SelectItem value="ENDO">Endodontik (PSA)</SelectItem>
                    <SelectItem value="EXTRACTION">Ekstraksi / Cabut</SelectItem>
                    <SelectItem value="SURGERY">Bedah Mulut</SelectItem>
                    <SelectItem value="ORTHO">Ortodonti (Behel)</SelectItem>
                    <SelectItem value="AESTHETIC">Estetik (Veneer/Bleaching)</SelectItem>
                    <SelectItem value="PROSTHO">Prostodonti (Crown/GTSL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Tarif Dasar Pasien (Rp)</Label>
                <Input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="mt-1 h-8 font-mono text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Potongan Modal Bahan/BMHP (Rp)</Label>
                <Input
                  type="number"
                  value={materialCost}
                  onChange={(e) => setMaterialCost(Number(e.target.value))}
                  className="mt-1 h-8 font-mono text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Durasi (Mnt)</Label>
                  <Input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="mt-1 h-8 font-mono text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Steril (Mnt)</Label>
                  <Input
                    type="number"
                    value={bufferMinutes}
                    onChange={(e) => setBufferMinutes(Number(e.target.value))}
                    className="mt-1 h-8 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
              <label className="flex items-center gap-2 text-xs">
                <Switch checked={bookableOnline} onCheckedChange={setBookableOnline} />
                <span>Bisa dipesan pasien dari Landing Page Booking Online</span>
              </label>
              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    setCreatingNew(false);
                    setEditingId(null);
                  }}
                >
                  Batal
                </Button>
                <Button size="xs" onClick={handleSave}>
                  <Check className="size-3.5" /> Simpan Layanan
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Services Table / List */}
        <div className="space-y-2">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3 text-xs hover:border-foreground/25"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-subtle px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                    {srv.code}
                  </span>
                  <span className="font-semibold text-sm">{srv.clinicalName}</span>
                  <span className="text-[11px] text-muted-foreground">
                    (Awam: {srv.laymanName})
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 font-mono text-[11px] text-muted-foreground">
                  <span>Durasi {srv.durationMinutes}m + Buffer {srv.bufferMinutes}m</span>
                  <span>·</span>
                  <span>Modal BMHP: {rupiah(srv.materialCost)}</span>
                  <span>·</span>
                  <span className="font-semibold text-foreground">
                    Tarif: {rupiah(srv.basePrice)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {onSelectServiceForPatient && (
                  <Button
                    size="xs"
                    onClick={() => {
                      onSelectServiceForPatient(srv);
                      onOpenChange(false);
                    }}
                  >
                    <Plus className="size-3" /> Tambahkan ke Pasien
                  </Button>
                )}
                <Button size="xs" variant="outline" onClick={() => startEdit(srv)}>
                  <Edit3 className="size-3" /> Ubah
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    deleteService(srv.id);
                    toast.info(`Layanan "${srv.clinicalName}" dihapus`);
                  }}
                  className="rounded p-1.5 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                  title="Hapus layanan"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
