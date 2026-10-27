"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  Globe,
  HandCoins,
  Pill,
  Plus,
  Settings2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { CLINIC_TEMPLATES } from "@/components/clinic-site/clinic-template-renderer";
import {
  MedicationReviewModal,
  ServiceCatalogModal,
} from "@/components/clinical/catalog-and-meds-modals";
import {
  FdiOdontogram,
  type OdontogramActionPayload,
} from "@/components/odontogram/fdi-odontogram";
import { useWorkspace } from "@/lib/store/workspace";
import { chartDedi } from "@/lib/data";
import { planTierMeta, rupiah } from "@/lib/format";
import type { ChartData, PlanTier } from "@/lib/types";
import { toast } from "sonner";

const TIERS: {
  key: PlanTier;
  tag: string;
  audience: string;
  desc: string;
  items: string[];
  featured?: boolean;
}[] = [
  {
    key: "FREE",
    tag: "Starter",
    audience: "Associate / Dokter Baru",
    desc: "Rekam medis digital dasar & profil praktik.",
    items: [
      "1 Dokter · 1 Kursi Gigi",
      "25 kunjungan RME / bulan",
      "1 Situs Klinik Dasar",
      "Odontogram FDI & Kasir QRIS",
    ],
  },
  {
    key: "SOLO_PRO",
    tag: "Most Popular",
    audience: "Praktik Mandiri (TPMDG)",
    desc: "Otomatisasi penuh tanpa staf resepsionis.",
    featured: true,
    items: [
      "1 Dokter (+1 Perawat) · Multi-Lokasi",
      "Kunjungan Tanpa Batas + 150 WA/bln",
      "4 Template Web + Deposit QRIS",
      "Odontogram Interaktif + Review Resep",
    ],
  },
  {
    key: "CLINIC_GROWTH",
    tag: "Clinic",
    audience: "Klinik Gigi 1–3 Kursi",
    desc: "Operasional multi-dokter & bagi hasil otomatis.",
    items: [
      "s/d 5 Dokter & 3 Kursi Gigi",
      "Kunjungan Tanpa Batas + 500 WA/bln",
      "Custom Domain (.id / .com)",
      "Mesin Komisi Net Collection & Lab",
    ],
  },
  {
    key: "CLINIC_PRO",
    tag: "Scale",
    audience: "Multi-Cabang",
    desc: "Kendali penuh jaringan klinik gigi.",
    items: [
      "Dokter & Kursi Tanpa Batas",
      "1.500 WA/bln + Nomor WA Sendiri",
      "Multi-Web Cabang + Meta Pixel",
      "Laporan Laba Rugi Lintas Cabang",
    ],
  },
];

const FAQS = [
  {
    q: "Apakah tindakan dari Odontogram dan Review Obat langsung masuk ke Kasir?",
    a: "Ya, secara real-time. Saat dokter menandai permukaan gigi (M/O/D/B/P) pada mode Completed atau memverifikasi resep obat di Ruang Periksa, tagihan Kasir langsung terisi otomatis tanpa ketik ulang.",
  },
  {
    q: "Bisakah saya menambah layanan baru atau mengubah harga sendiri?",
    a: "Bisa kapan saja. Anda dapat menambah tindakan baru, mengatur tarif dasar, potongan bahan BMHP, serta durasi kursi & jeda sterilisasi langsung dari tombol Customise atau Katalog Layanan.",
  },
  {
    q: "Bagaimana cara kerja Safety Check alergi obat pasien?",
    a: "Sistem membaca riwayat alergi pasien dari Pre-Visit Intake (mis. NSAID atau Penicillin), memberi peringatan pada obat kontraindikasi, dan menyarankan alternatif yang aman.",
  },
  {
    q: "Apa perbedaan Solo Mode (TPMDG) dan Clinic Mode?",
    a: "Solo Mode menyatukan Odontogram dan Kasir dalam satu layar untuk dokter praktik mandiri. Clinic Mode memisahkan Ruang Periksa dan Kasir Front-Desk lengkap dengan komisi dokter.",
  },
];

export default function MarketingHomePage() {
  const {
    services,
    patients,
    invoices,
    prescriptionsByAppointment,
    addInvoiceItem,
  } = useWorkspace();

  const [selectedTooth, setSelectedTooth] = useState<number>(36);
  const [heroChart, setHeroChart] = useState<ChartData>(chartDedi);
  const [lastActionSummary, setLastActionSummary] = useState<{
    tooth: number;
    surfaces: string;
    serviceId: string;
  }>({
    tooth: 36,
    surfaces: "M, O",
    serviceId: "sv_psa1",
  });

  const [applyQrisDeposit, setApplyQrisDeposit] = useState(true);
  const [workspaceMode, setWorkspaceMode] = useState<"SOLO" | "CLINIC">("CLINIC");
  const [billingCycle, setBillingCycle] = useState<"YEARLY" | "MONTHLY">("YEARLY");

  const [medModalOpen, setMedModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);

  const demoPatient = patients.find((p) => p.id === "pt_dedi") ?? patients[2];
  const demoInvoice = invoices.find((i) => i.appointmentId === "ap_02") ?? invoices[0];
  const demoPrescriptions = prescriptionsByAppointment["ap_02"] ?? [];

  const activeService =
    services.find((s) => s.id === lastActionSummary.serviceId) ?? services[0];

  const prescriptionSubtotal = demoPrescriptions.reduce(
    (sum, rx) => sum + rx.unitPrice * rx.qty,
    0,
  );
  const depositDeduction = applyQrisDeposit ? 50000 : 0;
  const grossProcedureAndMeds =
    (activeService?.basePrice ?? 900000) + prescriptionSubtotal;
  const finalPatientPayable = Math.max(0, grossProcedureAndMeds - depositDeduction);
  const netRevenueBase = Math.max(
    0,
    (activeService?.basePrice ?? 900000) - (activeService?.materialCost ?? 120000),
  );
  const doctorCommission = Math.round(netRevenueBase * 0.4);

  const handleHeroOdontogramAction = (payload: OdontogramActionPayload) => {
    const srv = services.find((s) => s.id === payload.serviceId) ?? services[0];
    setLastActionSummary({
      tooth: payload.tooth,
      surfaces: payload.surfaces.join(", "),
      serviceId: srv.id,
    });

    if (payload.mode === "NOW" && demoInvoice) {
      addInvoiceItem(demoInvoice.id, {
        id: `ii_${Date.now()}`,
        serviceId: srv.id,
        description: `${srv.clinicalName} (Gigi #${payload.tooth} · ${payload.surfaces.join(",")})`,
        tooth: payload.tooth,
        surfaces: payload.surfaces,
        qty: 1,
        unitPrice: srv.basePrice,
        discount: 0,
        materialCost: srv.materialCost,
        labCost: 0,
        doctorId: "dr_budi",
        nurseId: "ns_rini",
      });
      toast.success(
        `Gigi #${payload.tooth}: ${srv.clinicalName} otomatis disinkronkan ke Tagihan Kasir (${demoInvoice.number}).`,
      );
    } else {
      toast.success(
        `Gigi #${payload.tooth}: ${srv.clinicalName} ditambahkan ke Rencana Perawatan (Planned).`,
      );
    }
  };

  return (
    <div className="min-h-dvh bg-white text-zinc-950 selection:bg-zinc-900 selection:text-white">
      {/* ====================================================================
          HIGH-CONTRAST STICKY HEADER (21st.dev Minimalist Architecture)
          ==================================================================== */}
      <header className="sticky top-0 z-40 border-b border-zinc-300 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-15 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Logo withTld />
            <nav className="hidden items-center gap-6 text-sm font-semibold text-zinc-700 md:flex">
              <a href="#fitur" className="transition-colors hover:text-zinc-950">
                Fitur
              </a>
              <a href="#alur" className="transition-colors hover:text-zinc-950">
                Cara Kerja
              </a>
              <a href="#harga" className="transition-colors hover:text-zinc-950">
                Harga
              </a>
              <a href="#faq" className="transition-colors hover:text-zinc-950">
                FAQ
              </a>
              <Link
                href="/s/senyumsehat"
                className="text-teal-800 transition-colors hover:text-teal-950"
              >
                Contoh Web Klinik ↗
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden h-9 px-3 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950 sm:inline-flex"
            >
              <Link href="/masuk">Masuk</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-9 rounded-lg border-2 border-zinc-300 bg-white px-3.5 text-xs font-semibold text-zinc-950 shadow-xs hover:border-zinc-400 hover:bg-zinc-100"
            >
              <Link href="/app">Buka App</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="h-9 rounded-lg bg-zinc-950 px-4 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800"
            >
              <Link href="/onboarding">
                Mulai Gratis <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          ARCHITECTURAL RAIL CONTAINER (max-w-6xl border-x border-zinc-300)
          ==================================================================== */}
      <main className="mx-auto max-w-6xl border-x border-zinc-300">
        {/* ==================================================================
            1. HERO SECTION + LIVE ZERMMI ODONTOGRAM WORKSPACE
            ================================================================== */}
        <section className="relative overflow-hidden border-b border-zinc-300 px-4 pt-14 pb-16 sm:px-8 sm:pt-20 sm:pb-20">
          {/* Subtle 21st.dev Background Grid */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#d4d4d84d_1px,transparent_1px),linear-gradient(to_bottom,#d4d4d84d_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
          />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-zinc-100 px-3.5 py-1 font-mono text-xs font-semibold text-zinc-800">
              <span className="size-2 rounded-full bg-teal-600" />
              <span>Dental Practice OS · RME Permenkes 24/2022</span>
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-[-0.03em] text-zinc-950 sm:text-6xl sm:leading-[1.08] [text-wrap:balance]">
              Sistem operasi klinik gigi modern.{" "}
              <span className="text-teal-700">Dari booking hingga bagi hasil.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed font-normal text-zinc-700 [text-wrap:pretty]">
              Satukan website klinik, kalender kursi anti-bentrok, Odontogram 5-permukaan
              interaktif, review resep obat bebas alergi, dan komisi dokter otomatis dalam
              satu antarmuka yang bersih.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                asChild
                className="h-11 rounded-lg bg-zinc-950 px-6 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
              >
                <Link href="/onboarding">
                  Mulai Gratis 14 Hari <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-11 rounded-lg border-2 border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-950 shadow-xs hover:border-zinc-400 hover:bg-zinc-100"
              >
                <Link href="/app/klinis/ap_02">Buka Ruang Periksa</Link>
              </Button>
            </div>
          </div>

          {/* ================================================================
              INTERACTIVE ZERMMI ODONTOGRAM + AUTO-SYNCED CASHIER FRAME
              ================================================================ */}
          <div className="relative mt-12 overflow-hidden rounded-xl border-2 border-zinc-300 bg-zinc-50/60 shadow-[0_24px_60px_-24px_rgba(9,9,11,0.16)]">
            {/* App Window Topbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-300 bg-white px-4 py-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-zinc-300" />
                  <span className="size-2.5 rounded-full bg-zinc-300" />
                  <span className="size-2.5 rounded-full bg-zinc-300" />
                </div>
                <span className="font-mono text-xs font-semibold text-zinc-800">
                  klikgigi.id / odontogram / {demoPatient.fullName.toLowerCase().replace(" ", "-")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-rose-300 bg-rose-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-rose-800">
                  <AlertTriangle className="size-3" /> Alergi:{" "}
                  {demoPatient.alerts.allergies.join(", ")}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow-2xs hover:bg-zinc-100"
                >
                  <Settings2 className="size-3.5" /> Buat / Ubah Layanan ({services.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMedModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow-2xs hover:bg-zinc-100"
                >
                  <Pill className="size-3.5" /> Review Obat ({demoPrescriptions.length})
                </button>
              </div>
            </div>

            {/* Interactive Zermmi Odontogram Canvas */}
            <div className="p-4 sm:p-5">
              <FdiOdontogram
                chart={heroChart}
                dentition="ADULT"
                selectedTooth={selectedTooth}
                onSelectTooth={setSelectedTooth}
                onApplyAction={handleHeroOdontogramAction}
                onResetTooth={(t) => {
                  setHeroChart((prev) => {
                    const copy = { ...prev };
                    delete copy[String(t)];
                    return copy;
                  });
                }}
              />
            </div>

            {/* Bottom Live Cashier & Net Commission Sync Bar */}
            <div className="grid gap-4 border-t border-zinc-300 bg-white p-4 sm:p-5 lg:grid-cols-12 lg:items-center">
              <div className="space-y-1 lg:col-span-5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-teal-800 border border-teal-200">
                    <span className="size-1.5 rounded-full bg-teal-600" /> Auto-Sync Kasir:{" "}
                    {demoInvoice?.number}
                  </span>
                  <span className="font-mono text-xs font-semibold text-zinc-700">
                    Gigi #{lastActionSummary.tooth} ({lastActionSummary.surfaces})
                  </span>
                </div>
                <div className="text-sm font-bold text-zinc-950">
                  {activeService?.clinicalName}{" "}
                  <span className="font-mono text-teal-800">
                    ({rupiah(activeService?.basePrice ?? 900000)})
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-700">
                  <span>
                    Resep Obat ({demoPrescriptions.length} item):{" "}
                    <strong className="font-mono text-zinc-950">
                      {rupiah(prescriptionSubtotal)}
                    </strong>
                  </span>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-zinc-800">
                    <input
                      type="checkbox"
                      checked={applyQrisDeposit}
                      onChange={(e) => setApplyQrisDeposit(e.target.checked)}
                      className="size-3.5 accent-zinc-950"
                    />
                    <span>Potong Deposit QRIS (-Rp50.000)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:col-span-4">
                <div className="rounded-lg border border-zinc-300 bg-zinc-50 px-3.5 py-2.5">
                  <div className="text-[11px] font-semibold text-zinc-600">
                    Total Tagihan Pasien
                  </div>
                  <div className="num mt-0.5 font-mono text-base font-bold text-zinc-950">
                    {rupiah(finalPatientPayable)}
                  </div>
                </div>
                <div className="rounded-lg border border-teal-300 bg-teal-50/60 px-3.5 py-2.5">
                  <div className="text-[11px] font-semibold text-teal-900">
                    Komisi drg. Budi (40% Net)
                  </div>
                  <div className="num mt-0.5 font-mono text-base font-bold text-teal-800">
                    {rupiah(doctorCommission)}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 lg:col-span-3">
                <Button
                  size="sm"
                  onClick={() =>
                    handleHeroOdontogramAction({
                      tooth: selectedTooth,
                      surfaces: ["M", "O"],
                      conditionCode: "RESTORATION_COMPOSITE",
                      conditionLabel: activeService?.clinicalName ?? "Tindakan",
                      serviceId: activeService?.id ?? "sv_komposit2",
                      mode: "NOW",
                    })
                  }
                  className="h-9 bg-zinc-950 px-3.5 text-xs font-semibold text-white hover:bg-zinc-800"
                >
                  <Plus className="size-3.5" /> Kirim ke Kasir
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-9 border-2 border-zinc-300 bg-white px-3.5 text-xs font-semibold text-zinc-950 hover:border-zinc-400 hover:bg-zinc-100"
                >
                  <Link href="/app/kasir">
                    Buka Kasir <ArrowUpRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            2. ARCHITECTURAL 4-METRIC STRIP (High-Contrast Text & Hairlines)
            ================================================================== */}
        <section className="grid grid-cols-2 divide-x divide-y divide-zinc-300 border-b border-zinc-300 sm:grid-cols-4 sm:divide-y-0">
          <div className="p-6 sm:p-8">
            <div className="font-mono text-2xl font-bold tracking-tight text-zinc-950">
              1 Klik
            </div>
            <div className="mt-1 text-xs font-medium text-zinc-700">
              Permukaan Odontogram langsung menjadi invoice kasir
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="font-mono text-2xl font-bold tracking-tight text-zinc-950">
              -80%
            </div>
            <div className="mt-1 text-xs font-medium text-zinc-700">
              Penurunan pasien batal via Deposit QRIS
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="font-mono text-2xl font-bold tracking-tight text-zinc-950">
              100% Aman
            </div>
            <div className="mt-1 text-xs font-medium text-zinc-700">
              Safety check alergi obat (NSAID/Penicillin)
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="font-mono text-2xl font-bold tracking-tight text-zinc-950">
              Rp 0 Selisih
            </div>
            <div className="mt-1 text-xs font-medium text-zinc-700">
              Komisi dokter dari uang masuk bersih
            </div>
          </div>
        </section>

        {/* ==================================================================
            3. MINIMALIST BENTO GRID (21st.dev Hairline Cells)
            ================================================================== */}
        <section id="fitur" className="border-b border-zinc-300">
          <div className="border-b border-zinc-300 px-4 py-12 sm:px-8 sm:py-16">
            <div className="font-mono text-xs font-bold tracking-wider text-teal-800 uppercase">
              Platform Terpadu
            </div>
            <h2 className="mt-2 max-w-xl text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
              Enam modul inti. Satu alur kerja yang tenang.
            </h2>
          </div>

          <div className="grid divide-y divide-zinc-300 md:grid-cols-2 md:divide-x">
            {/* Cell 1: Smart Chair Calendar */}
            <div className="flex flex-col justify-between p-6 sm:p-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-xs font-semibold text-zinc-600">
                  <span>01 / SMART CHAIR CALENDAR</span>
                  <Calendar className="size-4 text-zinc-700" />
                </div>
                <h3 className="text-base font-bold text-zinc-950">
                  Jadwal Dokter ∩ Kursi Gigi ∩ Buffer Sterilisasi
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-700">
                  Mencegah dua dokter berebut satu Dental Unit. Menyisipkan jeda sterilisasi 10
                  menit otomatis di setiap pergantian pasien.
                </p>
              </div>

              <div className="mt-6 space-y-1.5 rounded-lg border border-zinc-300 bg-zinc-50 p-3 font-mono text-xs font-medium text-zinc-900">
                <div className="flex justify-between rounded border border-zinc-300 bg-white px-2.5 py-1.5">
                  <span>09:00–09:30 · Scaling</span>
                  <span className="font-semibold text-teal-800">Kursi 1</span>
                </div>
                <div className="flex justify-between rounded border border-dashed border-zinc-400 px-2.5 py-1 text-zinc-700">
                  <span>09:30–09:40 · Sterilisasi Unit</span>
                  <span>+10m</span>
                </div>
                <div className="flex justify-between rounded border border-zinc-300 bg-white px-2.5 py-1.5">
                  <span>09:40–10:40 · PSA Gigi #36</span>
                  <span className="font-semibold text-zinc-950">Tersedia</span>
                </div>
              </div>
            </div>

            {/* Cell 2: Medication Safety Review */}
            <div className="flex flex-col justify-between p-6 sm:p-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-xs font-semibold text-zinc-600">
                  <span>02 / SAFETY CHECK RESEP</span>
                  <ShieldAlert className="size-4 text-zinc-700" />
                </div>
                <h3 className="text-base font-bold text-zinc-950">
                  Review Obat &amp; Proteksi Alergi Pasien
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-700">
                  Mendeteksi kontraindikasi obat terhadap riwayat alergi pasien secara otomatis dan
                  menyinkronkan harga resep langsung ke Kasir.
                </p>
              </div>

              <div className="mt-6 space-y-1.5 rounded-lg border border-zinc-300 bg-zinc-50 p-3 text-xs">
                <div className="flex items-center justify-between rounded border border-rose-300 bg-rose-50 px-3 py-2">
                  <span className="font-semibold text-rose-950 line-through">
                    Asam Mefenamat 500mg
                  </span>
                  <span className="font-mono text-[11px] font-bold text-rose-800">
                    Alergi NSAID
                  </span>
                </div>
                <div className="flex items-center justify-between rounded border border-zinc-300 bg-white px-3 py-2">
                  <span className="font-semibold text-zinc-950">
                    Paracetamol 500mg (Alternatif)
                  </span>
                  <span className="font-mono text-[11px] font-bold text-teal-800">Aman</span>
                </div>
              </div>
            </div>

            {/* Cell 3: Flexible Service Catalog CRUD */}
            <div className="flex flex-col justify-between border-t border-zinc-300 p-6 sm:p-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-xs font-semibold text-zinc-600">
                  <span>03 / KATALOG LAYANAN MANDIRI</span>
                  <Settings2 className="size-4 text-zinc-700" />
                </div>
                <h3 className="text-base font-bold text-zinc-950">
                  Buat Layanan Baru &amp; Ubah Tarif Kapan Saja
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-700">
                  Tambah tindakan medis, atur harga dasar, biaya bahan habis pakai (BMHP), dan
                  durasi kursi tanpa ketergantungan tim IT.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-lg border border-zinc-300 bg-zinc-50 p-3 text-xs">
                <div>
                  <div className="font-semibold text-zinc-950">{services.length} Layanan Aktif</div>
                  <div className="text-[11px] font-medium text-zinc-700">
                    Sinkron ke Odontogram, Kalender &amp; Kasir
                  </div>
                </div>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setServiceModalOpen(true)}
                  className="h-7 border-2 border-zinc-300 bg-white px-2.5 font-semibold text-zinc-950 hover:bg-zinc-100"
                >
                  Kelola Tarif
                </Button>
              </div>
            </div>

            {/* Cell 4: Net Collection Commission */}
            <div className="flex flex-col justify-between border-t border-zinc-300 p-6 sm:p-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-xs font-semibold text-zinc-600">
                  <span>04 / KOMISI NET COLLECTION</span>
                  <HandCoins className="size-4 text-zinc-700" />
                </div>
                <h3 className="text-base font-bold text-zinc-950">
                  Bagi Hasil Dokter &amp; Perawat Tanpa Rekap Excel
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-700">
                  Komisi dihitung otomatis dari uang kas riil masuk dikurangi potongan biaya lab
                  gigi dan BMHP, termasuk untuk pembayaran cicilan.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 rounded-lg border border-zinc-300 bg-zinc-50 p-3 font-mono text-xs">
                <div className="rounded border border-zinc-300 bg-white p-2">
                  <div className="text-[10px] font-semibold text-zinc-600">Kas Masuk</div>
                  <div className="font-bold text-zinc-950">Rp3,8jt</div>
                </div>
                <div className="rounded border border-zinc-300 bg-white p-2">
                  <div className="text-[10px] font-semibold text-zinc-600">Biaya Lab</div>
                  <div className="font-bold text-zinc-700">-Rp900rb</div>
                </div>
                <div className="rounded border border-zinc-300 bg-white p-2">
                  <div className="text-[10px] font-semibold text-zinc-600">Komisi 40%</div>
                  <div className="font-bold text-teal-800">Rp1,16jt</div>
                </div>
              </div>
            </div>

            {/* Cell 5: 4-Template Clinic Website Studio */}
            <div className="flex flex-col justify-between border-t border-zinc-300 p-6 sm:p-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-xs font-semibold text-zinc-600">
                  <span>05 / STUDIO WEBSITE KLINIK</span>
                  <Globe className="size-4 text-zinc-700" />
                </div>
                <h3 className="text-base font-bold text-zinc-950">
                  4 Template Situs Klinik + 4-Step Booking Pasien
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-700">
                  Dilengkapi galeri perbandingan senyum Before–After interaktif, pilihan keluhan
                  bahasa awam, dan pembayaran Deposit QRIS.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-lg border border-zinc-300 bg-zinc-50 p-3 text-xs">
                <div className="flex items-center gap-2">
                  {CLINIC_TEMPLATES.map((t) => (
                    <span
                      key={t.id}
                      title={t.name}
                      className="size-4 rounded-full border border-zinc-400"
                      style={{ backgroundColor: t.defaultAccent }}
                    />
                  ))}
                  <span className="ml-1 text-xs font-medium text-zinc-700">
                    4 Tema Arsitektural
                  </span>
                </div>
                <Link
                  href="/app/situs"
                  className="font-semibold text-zinc-950 underline underline-offset-2"
                >
                  Buka Studio ↗
                </Link>
              </div>
            </div>

            {/* Cell 6: Solo Mode vs Clinic Mode */}
            <div className="flex flex-col justify-between border-t border-zinc-300 p-6 sm:p-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-xs font-semibold text-zinc-600">
                  <span>06 / ADAPTIVE WORKSPACE</span>
                  <div className="inline-flex rounded-md border border-zinc-300 bg-zinc-100 p-0.5 font-sans text-xs">
                    <button
                      type="button"
                      onClick={() => setWorkspaceMode("SOLO")}
                      className={`rounded px-2.5 py-0.5 font-semibold ${
                        workspaceMode === "SOLO"
                          ? "bg-white text-zinc-950 shadow-2xs"
                          : "text-zinc-600"
                      }`}
                    >
                      Solo
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkspaceMode("CLINIC")}
                      className={`rounded px-2.5 py-0.5 font-semibold ${
                        workspaceMode === "CLINIC"
                          ? "bg-white text-zinc-950 shadow-2xs"
                          : "text-zinc-600"
                      }`}
                    >
                      Clinic
                    </button>
                  </div>
                </div>
                <h3 className="text-base font-bold text-zinc-950">
                  {workspaceMode === "SOLO"
                    ? "Solo Mode: Praktik Mandiri Tanpa Resepsionis"
                    : "Clinic Mode: Delegasi Ruang Periksa ke Kasir"}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-700">
                  {workspaceMode === "SOLO"
                    ? "Odontogram dan laci pembayaran QRIS menyatu di satu layar dokter."
                    : "Tindakan dokter otomatis masuk ke antrean Kasir Front-Desk & Recall WhatsApp."}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 rounded-lg border border-zinc-300 bg-zinc-50 p-3 text-center text-xs font-semibold text-zinc-800">
                <div className="rounded border border-zinc-300 bg-white py-1.5">
                  1. Charting
                </div>
                <div className="rounded border border-zinc-300 bg-white py-1.5">
                  {workspaceMode === "SOLO" ? "2. Laci QRIS" : "2. Meja Kasir"}
                </div>
                <div className="rounded bg-zinc-950 py-1.5 text-white">3. Lunas + WA</div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            4. 3-STEP WORKFLOW (Clean High-Contrast Columns)
            ================================================================== */}
        <section id="alur" className="border-b border-zinc-300">
          <div className="border-b border-zinc-300 px-4 py-12 sm:px-8 sm:py-16">
            <div className="font-mono text-xs font-bold tracking-wider text-teal-800 uppercase">
              Alur Kerja
            </div>
            <h2 className="mt-2 max-w-xl text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
              Tiga langkah otomatis dari lobi hingga laporan komisi.
            </h2>
          </div>

          <div className="grid divide-y divide-zinc-300 md:grid-cols-3 md:divide-x md:divide-y-0">
            <div className="space-y-2.5 p-6 sm:p-8">
              <span className="font-mono text-xs font-bold text-teal-800">01</span>
              <h3 className="text-sm font-bold text-zinc-950">
                Booking &amp; Pre-Visit Intake
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-700">
                Pasien memilih slot kursi yang kosong di website klinik, membayar Deposit QRIS
                Rp50.000, dan mengisi riwayat alergi obat dari ponsel sebelum tiba.
              </p>
            </div>
            <div className="space-y-2.5 p-6 sm:p-8">
              <span className="font-mono text-xs font-bold text-teal-800">02</span>
              <h3 className="text-sm font-bold text-zinc-950">
                Odontogram Interaktif &amp; Review Resep
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-700">
                Dokter mengetuk permukaan gigi (M/O/D/B/P) pada Odontogram. Sistem memvalidasi
                keamanan resep obat terhadap alergi pasien secara instan.
              </p>
            </div>
            <div className="space-y-2.5 p-6 sm:p-8">
              <span className="font-mono text-xs font-bold text-teal-800">03</span>
              <h3 className="text-sm font-bold text-zinc-950">
                Pelunasan, Komisi &amp; Recall 6 Bulan
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-700">
                Kasir memproses pembayaran, sistem menghitung komisi bersih dokter, memotong stok
                BMHP, dan menjadwalkan pengingat Scaling 6 bulan via WhatsApp.
              </p>
            </div>
          </div>
        </section>

        {/* ==================================================================
            5. MONOCHROME BENTO PRICING (High Contrast & Tactile Buttons)
            ================================================================== */}
        <section id="harga" className="border-b border-zinc-300 px-4 py-16 sm:px-8 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="font-mono text-xs font-bold tracking-wider text-teal-800 uppercase">
                Harga Transparan
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                Mulai gratis. Skala sesuai jumlah kursi.
              </h2>
            </div>

            <div className="inline-flex items-center rounded-lg border border-zinc-300 bg-zinc-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => setBillingCycle("YEARLY")}
                className={`rounded-md px-3 py-1.5 font-semibold transition-colors ${
                  billingCycle === "YEARLY"
                    ? "bg-white text-zinc-950 shadow-2xs"
                    : "text-zinc-700 hover:text-zinc-950"
                }`}
              >
                Tahunan (-23%)
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("MONTHLY")}
                className={`rounded-md px-3 py-1.5 font-semibold transition-colors ${
                  billingCycle === "MONTHLY"
                    ? "bg-white text-zinc-950 shadow-2xs"
                    : "text-zinc-700 hover:text-zinc-950"
                }`}
              >
                Bulanan
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((t) => {
              const meta = planTierMeta[t.key];
              const price = billingCycle === "YEARLY" ? meta.yearly : meta.monthly;
              return (
                <div
                  key={t.key}
                  className={`flex flex-col justify-between rounded-xl border p-6 text-xs transition-colors ${
                    t.featured
                      ? "border-zinc-950 bg-zinc-950 text-white shadow-lg"
                      : "border-zinc-300 bg-white text-zinc-950 hover:border-zinc-400"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono text-[11px] font-semibold uppercase tracking-wider ${
                          t.featured ? "text-teal-300" : "text-teal-800"
                        }`}
                      >
                        {t.tag}
                      </span>
                      <span
                        className={`size-2 rounded-full ${
                          t.featured ? "bg-teal-400" : "bg-zinc-400"
                        }`}
                      />
                    </div>
                    <h3 className="mt-3 text-base font-bold">{meta.label}</h3>
                    <p
                      className={`mt-1 text-xs leading-relaxed ${
                        t.featured ? "text-zinc-300" : "text-zinc-700"
                      }`}
                    >
                      {t.desc}
                    </p>

                    <div
                      className={`my-5 border-y py-4 ${
                        t.featured ? "border-zinc-800" : "border-zinc-200"
                      }`}
                    >
                      <span className="num font-mono text-2xl font-bold tracking-tight">
                        {price === 0 ? "Rp 0" : rupiah(price)}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          t.featured ? "text-zinc-300" : "text-zinc-600"
                        }`}
                      >
                        {" "}
                        / bln
                      </span>
                    </div>

                    <ul className="space-y-2.5 text-xs">
                      {t.items.map((it) => (
                        <li key={it} className="flex items-start gap-2">
                          <Check
                            className={`mt-0.5 size-3.5 shrink-0 ${
                              t.featured ? "text-teal-400" : "text-teal-700"
                            }`}
                          />
                          <span className={t.featured ? "text-zinc-100" : "text-zinc-800"}>
                            {it}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    asChild
                    size="sm"
                    variant={t.featured ? "default" : "outline"}
                    className={`mt-6 h-10 w-full text-xs font-semibold ${
                      t.featured
                        ? "bg-white text-zinc-950 hover:bg-zinc-100"
                        : "border-2 border-zinc-300 bg-white text-zinc-950 hover:border-zinc-400 hover:bg-zinc-100"
                    }`}
                  >
                    <Link href="/onboarding">Pilih {meta.label}</Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ==================================================================
            6. MINIMALIST FAQ GRID
            ================================================================== */}
        <section id="faq" className="border-b border-zinc-300">
          <div className="border-b border-zinc-300 px-4 py-12 sm:px-8">
            <div className="font-mono text-xs font-bold tracking-wider text-teal-800 uppercase">
              FAQ
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950">
              Pertanyaan umum.
            </h2>
          </div>

          <div className="grid divide-y divide-zinc-300 md:grid-cols-2 md:divide-x">
            {FAQS.map((item, idx) => (
              <div
                key={item.q}
                className={`space-y-2 p-6 text-xs sm:p-8 sm:text-sm ${
                  idx >= 2 ? "md:border-t md:border-zinc-300" : ""
                }`}
              >
                <h3 className="text-sm font-bold text-zinc-950">{item.q}</h3>
                <p className="leading-relaxed text-zinc-700">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================================
            7. CLEAN FINAL CALL TO ACTION
            ================================================================== */}
        <section className="px-4 py-16 text-center sm:px-8 sm:py-20">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
            Siap merapikan operasional klinik gigi Anda?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-700">
            Mulai dengan akses penuh Solo Pro selama 14 hari tanpa kartu kredit.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              asChild
              className="h-11 rounded-lg bg-zinc-950 px-6 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
            >
              <Link href="/onboarding">
                Mulai Gratis 14 Hari <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-11 rounded-lg border-2 border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-950 shadow-xs hover:border-zinc-400 hover:bg-zinc-100"
            >
              <Link href="/app">Buka Workspace Klinik</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* ====================================================================
          MINIMALIST FOOTER
          ==================================================================== */}
      <footer className="border-t border-zinc-300 bg-white py-10 text-xs font-medium text-zinc-700">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo withTld />
            <span className="font-mono text-xs text-zinc-600">
              © 2026 KlikGigi.id · RME Permenkes 24/2022
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-5 font-semibold text-zinc-800">
            <Link href="/app/klinis/ap_02" className="hover:text-zinc-950">
              Odontogram
            </Link>
            <Link href="/app/kalender" className="hover:text-zinc-950">
              Kalender
            </Link>
            <Link href="/app/kasir" className="hover:text-zinc-950">
              Kasir
            </Link>
            <Link href="/app/komisi" className="hover:text-zinc-950">
              Komisi
            </Link>
            <Link href="/app/situs" className="hover:text-zinc-950">
              Studio Web
            </Link>
            <Link href="/s/senyumsehat" className="hover:text-zinc-950">
              Web Pasien
            </Link>
          </div>
        </div>
      </footer>

      {/* Live Modals */}
      <MedicationReviewModal
        open={medModalOpen}
        onOpenChange={setMedModalOpen}
        appointmentId="ap_02"
        patient={demoPatient}
        doctorId="dr_budi"
      />

      <ServiceCatalogModal
        open={serviceModalOpen}
        onOpenChange={setServiceModalOpen}
        onSelectServiceForPatient={(srv) =>
          setLastActionSummary((prev) => ({ ...prev, serviceId: srv.id }))
        }
      />
    </div>
  );
}
