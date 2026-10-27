"use client";

import { useState } from "react";
import {
  Building2,
  Check,
  CreditCard,
  MessageCircle,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageBody, PageHeader, Section } from "@/components/shared/page";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { roleLabel } from "@/components/app-shell/nav-config";
import { ServiceCatalogModal } from "@/components/clinical/catalog-and-meds-modals";
import { useWorkspace } from "@/lib/store/workspace";
import {
  chairs as initialChairs,
  locations,
  staff,
  subscription,
} from "@/lib/data";
import { categoryLabel, planTierMeta, rupiah } from "@/lib/format";
import type { PlanTier } from "@/lib/types";
import { toast } from "sonner";

export function SettingsWorkspace({ defaultTab = "langganan" }: { defaultTab?: string }) {
  const { services: serviceList, deleteService } = useWorkspace();
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("YEARLY");
  const [activeTier, setActiveTier] = useState<PlanTier>(subscription.tier);
  const [waAddonCredits, setWaAddonCredits] = useState(subscription.usage.wa.addon);
  const [chairList, setChairList] = useState(initialChairs);
  const [feeBearer, setFeeBearer] = useState<"PATIENT" | "CLINIC">("PATIENT");
  const [serviceModalOpen, setServiceModalOpen] = useState(false);

  const tiers: {
    key: PlanTier;
    badge?: string;
    subtitle: string;
    doctors: string;
    chairs: string;
    encounters: string;
    waQuota: string;
    storage: string;
    highlights: string[];
  }[] = [
    {
      key: "FREE",
      subtitle: "Untuk drg. baru / Associate (Personal Branding & RME Dasar)",
      doctors: "1 Dokter",
      chairs: "1 Kursi Gigi",
      encounters: "Maks. 25 kunjungan / bln",
      waQuota: "Klik Manual ke WA Web",
      storage: "250 MB Total",
      highlights: [
        "1 Landing Page Dasar (dengan watermark KlikGigi)",
        "Odontogram Dasar & Catatan SOAP",
        "Kasir Dasar (Tunai / QRIS Statis)",
      ],
    },
    {
      key: "SOLO_PRO",
      badge: "Paling Populer untuk TPMDG",
      subtitle: "Untuk Praktik Mandiri (TPMDG) yang ingin bebas antre & otomatis",
      doctors: "1 Dokter (+1 Akun Perawat)",
      chairs: "1 Kursi (Multi-Lokasi Praktik)",
      encounters: "Unlimited Kunjungan",
      waQuota: "150 Pesan WA Otomatis / bln",
      storage: "5 GB (Auto-WebP)",
      highlights: [
        "Tanpa Watermark + Slider Foto Before-After",
        "Smart Slot + Deposit QRIS Anti-Ghosting Otomatis",
        "3-Tap Odontogram-to-Billing + Mode Presentasi + Digital Consent",
        "Tracking Cicilan Pasien (Behel / PSA)",
      ],
    },
    {
      key: "CLINIC_GROWTH",
      badge: "Paket Aktif Anda",
      subtitle: "Untuk Klinik Gigi Multi-Dokter (1–3 Kursi Gigi)",
      doctors: "s/d 5 Dokter Gigi",
      chairs: "s/d 3 Kursi Gigi",
      encounters: "Unlimited Kunjungan",
      waQuota: "500 Pesan WA Otomatis / bln",
      storage: "25 GB (Auto-WebP)",
      highlights: [
        "Semua fitur Solo Pro + Custom Domain Klinik",
        "Kalender Multi-Chair + Live Waiting Timer",
        "Mesin Hitung Komisi Dokter & Perawat Otomatis (Net Collection)",
        "Pelacakan Order Dental Lab & Inventori BMHP",
      ],
    },
    {
      key: "CLINIC_PRO",
      subtitle: "Untuk Klinik Ramai & Multi-Cabang",
      doctors: "Unlimited Dokter",
      chairs: "Unlimited Kursi",
      encounters: "Unlimited Kunjungan",
      waQuota: "1.500 Pesan WA / bln + Custom Sender",
      storage: "100 GB (Auto-WebP)",
      highlights: [
        "Multi-Landing Page per Cabang + Meta Pixel & Google Ads",
        "Nomor WhatsApp Pengirim Resmi Milik Klinik Sendiri",
        "Komisi Multi-Skema + Laporan Laba Rugi Lintas Cabang",
      ],
    },
  ];

  return (
    <div>
      <PageHeader
        title="Pengaturan Klinik, Katalog Layanan & Langganan SaaS"
        description="Konfigurasi cabang, kursi gigi, durasi & buffer sterilisasi tindakan, hak akses tim (RBAC), dan paket KlikGigi"
        actions={
          <Button size="sm" className="text-xs" onClick={() => setServiceModalOpen(true)}>
            <Plus className="size-3.5" /> + Buat / Ubah Layanan
          </Button>
        }
      />

      <PageBody>
        <Tabs defaultValue={defaultTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="langganan" className="text-xs">
              Langganan & Kuota (4-Tier Pricing)
            </TabsTrigger>
            <TabsTrigger value="lokasi" className="text-xs">
              Cabang & Kursi Gigi ({chairList.length})
            </TabsTrigger>
            <TabsTrigger value="layanan" className="text-xs">
              Katalog Layanan & Buffer Steril ({serviceList.length})
            </TabsTrigger>
            <TabsTrigger value="tim" className="text-xs">
              Tim & Hak Akses RBAC ({staff.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SUBSCRIPTION & PRICING (pricing.md) */}
          <TabsContent value="langganan" className="mt-5 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  Filosofi Harga KlikGigi.id
                </div>
                <div className="text-sm font-semibold">
                  &ldquo;Harga sepertiga dari 1x tindakan Scaling, namun menghasilkan puluhan pasien baru setiap bulan.&rdquo;
                </div>
              </div>
              <div className="inline-flex items-center rounded-md border bg-subtle p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setBillingCycle("MONTHLY")}
                  className={`rounded px-3 py-1 font-medium ${
                    billingCycle === "MONTHLY" ? "bg-card shadow-2xs" : "text-muted-foreground"
                  }`}
                >
                  Bulanan
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("YEARLY")}
                  className={`rounded px-3 py-1 font-medium ${
                    billingCycle === "YEARLY" ? "bg-card shadow-2xs" : "text-muted-foreground"
                  }`}
                >
                  Tahunan (Hemat ~23%)
                </button>
              </div>
            </div>

            {/* 4-Tier Pricing Grid */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {tiers.map((t) => {
                const meta = planTierMeta[t.key];
                const price = billingCycle === "YEARLY" ? meta.yearly : meta.monthly;
                const isCurrent = activeTier === t.key;
                return (
                  <div
                    key={t.key}
                    className={`flex flex-col justify-between rounded-lg border bg-card p-4 text-xs ${
                      isCurrent ? "border-brand ring-2 ring-brand/30" : ""
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{meta.label}</span>
                        {t.badge && (
                          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand-ink">
                            {t.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{t.subtitle}</p>
                      <div className="border-y py-3">
                        <div className="num text-2xl font-bold">
                          {price === 0 ? "Rp0" : rupiah(price)}
                          <span className="text-xs font-normal text-muted-foreground"> / bulan</span>
                        </div>
                        {price > 0 && billingCycle === "YEARLY" && (
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            Harga bulanan normal: <span className="line-through">{rupiah(meta.monthly)}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dokter Gigi</span>
                          <span className="font-semibold">{t.doctors}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Kursi Gigi</span>
                          <span className="font-semibold">{t.chairs}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Kunjungan / RME</span>
                          <span className="font-semibold">{t.encounters}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Kuota WA Otomatis</span>
                          <span className="font-semibold">{t.waQuota}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cloud Storage</span>
                          <span className="font-semibold">{t.storage}</span>
                        </div>
                      </div>

                      <ul className="space-y-1.5 border-t pt-2.5 text-[11px]">
                        {t.highlights.map((h) => (
                          <li key={h} className="flex items-start gap-1.5">
                            <Check className="mt-0.5 size-3.5 shrink-0 text-brand" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      size="sm"
                      variant={isCurrent ? "outline" : "default"}
                      className="mt-4 w-full text-xs"
                      onClick={() => {
                        setActiveTier(t.key);
                        toast.success(`Paket langganan diubah ke ${meta.label}`);
                      }}
                    >
                      {isCurrent ? "Paket Aktif Saat Ini" : `Pilih ${meta.label}`}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Add-On Token WA & Fintech Convenience Fee Settings (pricing.md §4) */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Section
                title="Add-On Token WhatsApp (Tidak Hangus di Akhir Bulan)"
                description="Kuota bulanan Anda: 392 / 500 terpakai · Sisa kredit Add-On: 120 pesan"
              >
                <div className="flex items-center justify-between rounded-md border bg-subtle/50 p-3 text-xs">
                  <div>
                    <div className="font-semibold">Paket Top-Up 250 Pesan WhatsApp Resmi</div>
                    <div className="text-[11px] text-muted-foreground">
                      Hanya Rp35.000 (Rp140/pesan) · Aktif selamanya tanpa masa kedaluwarsa
                    </div>
                  </div>
                  <Button
                    size="xs"
                    onClick={() => {
                      setWaAddonCredits((c) => c + 250);
                      toast.success("Top-up +250 kredit WhatsApp berhasil! Total cadangan: " + (waAddonCredits + 250));
                    }}
                  >
                    <MessageCircle className="size-3.5" /> Beli +250 WA (Rp35.000)
                  </Button>
                </div>
              </Section>

              <Section
                title="Pengaturan Biaya Admin QRIS Dinamis (Platform Convenience Fee)"
                description="Biaya transaksi Rp2.000 per pembayaran Deposit Booking QRIS"
              >
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setFeeBearer("PATIENT")}
                    className={`rounded-md border p-2.5 text-left ${
                      feeBearer === "PATIENT" ? "border-brand bg-brand-soft text-brand-ink" : "bg-card"
                    }`}
                  >
                    <div className="font-semibold">Ditanggung Pasien</div>
                    <div className="text-[11px] opacity-80">Pasien membayar Deposit Rp50.000 + Admin Rp2.000</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeeBearer("CLINIC")}
                    className={`rounded-md border p-2.5 text-left ${
                      feeBearer === "CLINIC" ? "border-brand bg-brand-soft text-brand-ink" : "bg-card"
                    }`}
                  >
                    <div className="font-semibold">Disubsidi Klinik</div>
                    <div className="text-[11px] opacity-80">Pasien bayar pas Rp50.000, klinik terima Rp48.000</div>
                  </button>
                </div>
              </Section>
            </div>
          </TabsContent>

          {/* TAB 2: LOCATIONS & CHAIRS */}
          <TabsContent value="lokasi" className="mt-5 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {locations.map((loc) => {
                const locChairs = chairList.filter((c) => c.locationId === loc.id);
                return (
                  <Section
                    key={loc.id}
                    title={loc.name}
                    description={`${loc.address} · ${loc.hours}`}
                    actions={
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          setChairList((prev) => [
                            ...prev,
                            {
                              id: `ch_${Date.now()}`,
                              locationId: loc.id,
                              name: `Kursi ${locChairs.length + 1}`,
                              isActive: true,
                            },
                          ]);
                          toast.success(`Kursi baru ditambahkan di ${loc.shortName}`);
                        }}
                      >
                        <Plus className="size-3" /> Tambah Kursi
                      </Button>
                    }
                  >
                    <div className="space-y-2 text-xs">
                      {locChairs.map((ch) => (
                        <div key={ch.id} className="flex items-center justify-between rounded-md border p-2.5">
                          <div>
                            <span className="font-semibold">{ch.name}</span>
                            <span className="ml-2 text-[11px] text-muted-foreground">
                              {ch.isActive ? "Aktif menerima jadwal" : "Nonaktif / Maintenance"}
                            </span>
                          </div>
                          <Switch
                            checked={ch.isActive}
                            onCheckedChange={() =>
                              setChairList((prev) =>
                                prev.map((x) => (x.id === ch.id ? { ...x, isActive: !x.isActive } : x)),
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </Section>
                );
              })}
            </div>
          </TabsContent>

          {/* TAB 3: SERVICES CATALOG & BUFFER */}
          <TabsContent value="layanan" className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card p-3.5 text-xs">
              <div>
                <div className="font-semibold">Katalog Tindakan Medis, Tarif Dasar & Buffer Sterilisasi</div>
                <div className="text-[11px] text-muted-foreground">
                  Tersinkronisasi otomatis ke Odontogram 3-Tap, Smart Slot Kalender, Kasir, dan Website Publik Klinik
                </div>
              </div>
              <Button size="sm" className="h-8 text-xs" onClick={() => setServiceModalOpen(true)}>
                <Plus className="size-3.5" /> + Buat Layanan Baru / Edit Tarif
              </Button>
            </div>
            <div className="overflow-x-auto rounded-lg border bg-card">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-subtle text-[11px] font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Kode & Nama Klinis</th>
                    <th className="px-4 py-2.5">Nama Bahasa Awam (Landing Page)</th>
                    <th className="px-4 py-2.5">Durasi + Buffer Steril</th>
                    <th className="px-4 py-2.5">Tarif Dasar</th>
                    <th className="px-4 py-2.5">Potongan Bahan (BMHP)</th>
                    <th className="px-4 py-2.5">Wajib Consent</th>
                    <th className="px-4 py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {serviceList.map((s) => (
                    <tr key={s.id} className="hover:bg-subtle/50">
                      <td className="px-4 py-3">
                        <div className="font-mono text-[11px] text-muted-foreground">{s.code}</div>
                        <div className="font-semibold">{s.clinicalName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{s.laymanName}</div>
                        <div className="text-[11px] text-muted-foreground">{categoryLabel[s.category]}</div>
                      </td>
                      <td className="num px-4 py-3">
                        <span className="font-semibold">{s.durationMinutes} mnt</span> +{" "}
                        <span className="text-muted-foreground">{s.bufferMinutes} mnt steril</span>
                      </td>
                      <td className="num px-4 py-3 font-semibold">{rupiah(s.basePrice)}</td>
                      <td className="num px-4 py-3 text-muted-foreground">{rupiah(s.materialCost)}</td>
                      <td className="px-4 py-3">
                        {s.requiresConsent ? (
                          <span className="rounded bg-warning-soft px-2 py-0.5 text-[10px] font-semibold text-warning">
                            Wajib Tanda Tangan
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Opsional</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => setServiceModalOpen(true)}
                          >
                            <Pencil className="size-3" /> Ubah
                          </Button>
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            className="text-muted-foreground hover:text-danger"
                            onClick={() => {
                              deleteService(s.id);
                              toast.info(`Layanan ${s.clinicalName} dihapus`);
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* TAB 4: TEAM & RBAC */}
          <TabsContent value="tim" className="mt-5">
            <div className="overflow-x-auto rounded-lg border bg-card">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-subtle text-[11px] font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Nama & Kredensial</th>
                    <th className="px-4 py-2.5">Peran RBAC</th>
                    <th className="px-4 py-2.5">Nomor SIP / STR</th>
                    <th className="px-4 py-2.5">Kontak</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {staff.map((st) => (
                    <tr key={st.id} className="hover:bg-subtle/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <PersonAvatar name={st.fullName} color={st.color} size="sm" />
                          <div>
                            <div className="font-semibold">{st.displayName}</div>
                            {st.specialty && (
                              <div className="text-[11px] text-muted-foreground">{st.specialty}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{roleLabel[st.role]}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                        {st.sip ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{st.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </PageBody>

      <ServiceCatalogModal
        open={serviceModalOpen}
        onOpenChange={setServiceModalOpen}
      />
    </div>
  );
}

export default function SettingsPage() {
  return <SettingsWorkspace />;
}
