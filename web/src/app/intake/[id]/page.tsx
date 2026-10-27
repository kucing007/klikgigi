"use client";

import { use, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getPatient, patients } from "@/lib/data";
import { toast } from "sonner";

const ALLERGY_OPTIONS = [
  "Amoxicillin / Penicillin",
  "NSAID (Ibuprofen / Asam Mefenamat)",
  "Paracetamol",
  "Anestesi Lokal (Lidocaine)",
  "Latex (Sarung Tangan Karet)",
];

const SYSTEMIC_OPTIONS = [
  "Hipertensi (Tekanan Darah Tinggi)",
  "Diabetes Melitus (Gula Darah)",
  "Penyakit Jantung / Pengencer Darah",
  "Asma / Gangguan Pernapasan",
  "Riwayat Maag / GERD Akut",
];

export default function PreVisitIntakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const pt = getPatient(id) ?? patients[0];

  const [nik, setNik] = useState(pt.nik ?? "3174025507960003");
  const [allergies, setAllergies] = useState<string[]>(pt.alerts.allergies);
  const [systemic, setSystemic] = useState<string[]>(pt.alerts.systemic);
  const [isPregnant, setIsPregnant] = useState(pt.alerts.isPregnant);
  const [submitted, setSubmitted] = useState(false);

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  return (
    <div className="min-h-svh bg-subtle/50 px-4 py-8">
      <div className="mx-auto max-w-lg space-y-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Klinik Gigi Senyum Sehat</span>
          <Link href="/app/klinis/ap_02" className="text-brand-ink hover:underline">
            Lihat di Layar Dokter →
          </Link>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-5">
          <div>
            <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-semibold text-brand-ink">
              Digital Pre-Visit Intake (Flow 2 PRD)
            </span>
            <h1 className="mt-2 text-lg font-bold tracking-tight">
              Formulir Kesehatan Pra-Kunjungan — {pt.fullName}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Data ini otomatis muncul sebagai <strong>Medical Alert Badge</strong> di layar tablet dokter gigi Anda untuk keamanan pemberian obat & anestesi.
            </p>
          </div>

          {submitted ? (
            <div className="space-y-4 rounded-lg border border-success/30 bg-success-soft/50 p-4 text-xs">
              <div className="flex items-center gap-2 text-sm font-semibold text-success">
                <CheckCircle2 className="size-4" /> Data Kesehatan Berhasil Disimpan!
              </div>
              <p className="text-foreground/80">
                Terima kasih, {pt.fullName}. Saat Anda tiba di klinik, Anda tidak perlu lagi mengisi formulir kertas di meja resepsionis.
              </p>
              <div className="flex gap-2 pt-1">
                <Button size="sm" asChild>
                  <Link href="/app/klinis/ap_02">Lihat Medical Alert di Layar Dokter</Link>
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSubmitted(false)}>
                  Ubah Data
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div>
                <Label className="text-xs">NIK KTP (16 Digit — Kesiapan Standar RME Nasional)</Label>
                <Input
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  maxLength={16}
                  className="mt-1 h-9 font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-danger">
                  Apakah Anda Memiliki Riwayat Alergi Obat / Bahan Medis?
                </Label>
                <div className="grid gap-1.5">
                  {ALLERGY_OPTIONS.map((al) => {
                    const checked = allergies.includes(al);
                    return (
                      <label
                        key={al}
                        className={`flex items-center justify-between rounded-md border px-3 py-2 cursor-pointer ${
                          checked ? "border-danger bg-danger-soft/60 font-semibold text-danger" : "bg-card"
                        }`}
                      >
                        <span>{al}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleItem(allergies, setAllergies, al)}
                          className="size-4 accent-danger"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  Kondisi Kesehatan / Riwayat Penyakit Sistemik
                </Label>
                <div className="grid gap-1.5">
                  {SYSTEMIC_OPTIONS.map((sy) => {
                    const checked = systemic.includes(sy);
                    return (
                      <label
                        key={sy}
                        className={`flex items-center justify-between rounded-md border px-3 py-2 cursor-pointer ${
                          checked ? "border-warning bg-warning-soft/60 font-semibold text-warning" : "bg-card"
                        }`}
                      >
                        <span>{sy}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleItem(systemic, setSystemic, sy)}
                          className="size-4 accent-brand"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md border bg-subtle/60 p-3">
                <div>
                  <div className="font-semibold">Sedang Hamil / Menyusui</div>
                  <div className="text-[11px] text-muted-foreground">
                    Penting untuk keamanan tindakan foto Rontgen & pemilihan obat
                  </div>
                </div>
                <Switch checked={isPregnant} onCheckedChange={setIsPregnant} />
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  setSubmitted(true);
                  toast.success("Data Pre-Visit Intake tersinkron ke Rekam Medis Klinik!");
                }}
              >
                <ShieldCheck className="size-4" /> Simpan & Kirim ke Dokter Gigi
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
