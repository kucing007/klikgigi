"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Globe,
  HandCoins,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/logo";
import { useWorkspace } from "@/lib/store/workspace";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const { setMode } = useWorkspace();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [tenantMode, setTenantMode] = useState<"SOLO" | "CLINIC">("CLINIC");
  const [clinicName, setClinicName] = useState("Klinik Gigi Senyum Sehat");
  const [slug, setSlug] = useState("senyumsehat");
  const [chairCount, setChairCount] = useState(3);
  const [bufferMin, setBufferMin] = useState(10);
  const [commRate, setCommRate] = useState(40);

  const finish = () => {
    setMode(tenantMode);
    toast.success("14-Day Reverse Trial (Solo Pro + 30 WA Gratis) diaktifkan!");
    router.push("/app");
  };

  return (
    <div className="min-h-svh bg-subtle/40 px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Logo withTld />
          </Link>
          <span className="text-xs font-medium text-muted-foreground">
            Onboarding Flow 1 PRD · Langkah {step} / 5
          </span>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-5 text-xs">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-base font-bold">1. Pilih Mode Workspace Anda</h1>
                <p className="text-muted-foreground">
                  Antarmuka KlikGigi beradaptasi otomatis antara praktik mandiri dan klinik multi-dokter.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setTenantMode("SOLO")}
                  className={`rounded-lg border p-4 text-left space-y-1.5 ${
                    tenantMode === "SOLO" ? "border-brand bg-brand-soft/40" : "hover:bg-subtle"
                  }`}
                >
                  <Stethoscope className="size-5 text-brand" />
                  <div className="text-sm font-semibold">Solo Practitioner (TPMDG)</div>
                  <p className="text-[11px] text-muted-foreground">
                    Unified Express Workspace: Dokter + Kasir dalam 1 layar. Mendukung jadwal praktik di banyak lokasi.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setTenantMode("CLINIC")}
                  className={`rounded-lg border p-4 text-left space-y-1.5 ${
                    tenantMode === "CLINIC" ? "border-brand bg-brand-soft/40" : "hover:bg-subtle"
                  }`}
                >
                  <Building2 className="size-5 text-brand" />
                  <div className="text-sm font-semibold">Multi-Doctor Dental Clinic</div>
                  <p className="text-[11px] text-muted-foreground">
                    Kalender Multi-Chair, pemisahan peran Resepsionis/Perawat/Dokter, & komisi otomatis.
                  </p>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-base font-bold">2. Sumber Daya Fisik & Kursi Gigi (Dental Units)</h1>
                <p className="text-muted-foreground">
                  Digunakan oleh algoritma Smart Slot Scheduling untuk mencegah double-booking kursi.
                </p>
              </div>
              <div>
                <Label className="text-xs">Nama Praktik / Klinik</Label>
                <Input
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="mt-1 h-9 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Jumlah Kursi Gigi Aktif (Dental Chairs)</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={chairCount}
                  onChange={(e) => setChairCount(Number(e.target.value))}
                  className="mt-1 h-9 text-xs num"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-base font-bold">3. Katalog Layanan & Buffer Sterilisasi Kursi</h1>
                <p className="text-muted-foreground">
                  Jeda sterilisasi otomatis ditambahkan di antara setiap jadwal pasien.
                </p>
              </div>
              <div>
                <Label className="text-xs">Default Buffer Sterilisasi Kursi (Menit)</Label>
                <Input
                  type="number"
                  value={bufferMin}
                  onChange={(e) => setBufferMin(Number(e.target.value))}
                  className="mt-1 h-9 text-xs num"
                />
              </div>
              <div className="rounded-md border bg-subtle/60 p-3">
                18 layanan standar kedokteran gigi (Scaling, Restorasi Komposit, PSA, Odontektomi, Behel, Veneer, Crown Zirconia) telah disiapkan dan dapat disesuaikan kapan saja.
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-base font-bold">4. Aturan Komisi Dokter (Anti-Sengketa)</h1>
                <p className="text-muted-foreground">
                  Komisi dihitung dari Net Base (setelah potong biaya bahan & lab) dan cair proporsional sesuai pembayaran masuk.
                </p>
              </div>
              <div>
                <Label className="text-xs">Persentase Komisi Default Dokter (% dari Net Collection)</Label>
                <Input
                  type="number"
                  value={commRate}
                  onChange={(e) => setCommRate(Number(e.target.value))}
                  className="mt-1 h-9 text-xs num"
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-base font-bold">5. Publikasikan Subdomain Landing Page</h1>
                <p className="text-muted-foreground">
                  Siap dipasang di bio Instagram/TikTok dan profil Google Maps klinik Anda.
                </p>
              </div>
              <div>
                <Label className="text-xs">Alamat Web Klinik Anda</Label>
                <div className="mt-1 flex items-center rounded-md border bg-subtle px-3">
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="h-9 flex-1 bg-transparent text-xs font-semibold outline-none"
                  />
                  <span className="text-muted-foreground">.klikgigi.id</span>
                </div>
              </div>
              <div className="rounded-md border border-brand/30 bg-brand-soft/40 p-3 text-brand-ink">
                <strong>14-Day Reverse Trial Aktif:</strong> Seluruh fitur Solo Pro + 30 Kuota WhatsApp Otomatis gratis selama 14 hari tanpa kartu kredit.
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            {step > 1 ? (
              <Button variant="ghost" size="sm" onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}>
                <ArrowLeft className="size-3.5" /> Sebelumnya
              </Button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <Button size="sm" onClick={() => setStep((s) => (s + 1) as 2 | 3 | 4 | 5)}>
                Lanjut <ArrowRight className="size-3.5" />
              </Button>
            ) : (
              <Button size="sm" onClick={finish}>
                <Check className="size-3.5" /> Masuk ke Workspace KlikGigi
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
