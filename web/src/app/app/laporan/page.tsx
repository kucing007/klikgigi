"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBody, PageHeader, Section, Stat } from "@/components/shared/page";
import { monthlyRevenue } from "@/lib/data";
import { rupiah } from "@/lib/format";
import { toast } from "sonner";

export default function ReportsPage() {
  const maxMonth = Math.max(...monthlyRevenue.map((m) => m.revenue));

  const categoryBreakdown = [
    { name: "Ortodonti (Behel & Kontrol)", revenue: 42500000, pct: 33 },
    { name: "Estetik (Veneer & Bleaching)", revenue: 31200000, pct: 24 },
    { name: "Konservasi & Saluran Akar (PSA)", revenue: 24800000, pct: 19 },
    { name: "Prostodonti (Crown Zirconia & GTSL)", revenue: 18400000, pct: 14 },
    { name: "Scaling & Preventif", revenue: 12600000, pct: 10 },
  ];

  const sourceBreakdown = [
    { source: "Landing Page KlikGigi (Instagram / Google Maps)", count: 164, conversion: "94% hadir" },
    { source: "Otomasi Recall WhatsApp 6 Bulan", count: 58, conversion: "96% hadir" },
    { source: "Chat WhatsApp Langsung", count: 41, conversion: "83% hadir" },
    { source: "Pasien Walk-In", count: 23, conversion: "100% hadir" },
  ];

  return (
    <div>
      <PageHeader
        title="Laporan Keuangan, Akuisisi & Performa Klinis"
        description="Analisis Gross Revenue vs Net Collection, profitabilitas pasca potongan lab/BMHP, dan efektivitas akuisisi Landing Page"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Laporan Laba-Rugi Oktober 2026 (XLSX) berhasil diunduh")}
          >
            <Download className="size-3.5" /> Ekspor Laporan Bulanan
          </Button>
        }
      />

      <PageBody className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Omzet Kotor (Oktober 2026)"
            value={rupiah(129500000)}
            delta={{ value: "7% vs September", positive: true }}
            hint="286 kunjungan pasien"
          />
          <Stat
            label="Uang Masuk Riil (Net Collection)"
            value={rupiah(118200000)}
            delta={{ value: "91,2% collection rate", positive: true }}
            hint="Sisanya cicilan berjalan"
          />
          <Stat
            label="Biaya Lab Gigi & BMHP"
            value={rupiah(19400000)}
            hint="15% dari omzet kotor"
          />
          <Stat
            label="Tingkat No-Show Pasien"
            value="3,1%"
            delta={{ value: "Turun dari 18% (sebelum DP QRIS)", positive: true }}
            hint="Proteksi deposit aktif"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <Section
            title="Gross Revenue vs Net Collection (6 Bulan Terakhir)"
            description="Perbandingan nilai tagihan dengan uang tunai/non-tunai yang benar-benar masuk"
            className="lg:col-span-7"
          >
            <div className="grid grid-cols-6 items-end gap-4 pt-4" style={{ height: 210 }}>
              {monthlyRevenue.map((m) => {
                const grossPct = Math.round((m.revenue / maxMonth) * 100);
                const colPct = Math.round((m.collected / maxMonth) * 100);
                return (
                  <div key={m.month} className="flex h-full flex-col items-center justify-end gap-1.5">
                    <span className="num text-[11px] font-medium text-muted-foreground">
                      {Math.round(m.collected / 1000000)}jt
                    </span>
                    <div className="flex w-full flex-1 items-end justify-center gap-1">
                      <div
                        className="w-1/2 rounded-t bg-foreground/15"
                        style={{ height: `${grossPct}%` }}
                        title={`Gross: ${rupiah(m.revenue)}`}
                      />
                      <div
                        className="w-1/2 rounded-t bg-brand"
                        style={{ height: `${colPct}%` }}
                        title={`Collected: ${rupiah(m.collected)}`}
                      />
                    </div>
                    <span className="text-xs font-medium">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </Section>

          <Section
            title="Kontribusi Omzet per Kategori Layanan"
            description="Oktober 2026"
            className="lg:col-span-5"
          >
            <div className="space-y-3 text-xs">
              {categoryBreakdown.map((c) => (
                <div key={c.name} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{c.name}</span>
                    <span className="num font-semibold">
                      {rupiah(c.revenue)} ({c.pct}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-subtle">
                    <div className="h-full bg-brand" style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <Section
          title="Sumber Akuisisi Pasien & Efektivitas Kehadiran"
          description="Bukti atribusi langsung dari No-Code Landing Page & Otomasi Recall WhatsApp"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            {sourceBreakdown.map((s) => (
              <div key={s.source} className="rounded-md border bg-subtle/40 p-3.5">
                <div className="font-medium text-muted-foreground">{s.source}</div>
                <div className="num mt-1.5 text-xl font-semibold">{s.count} kunjungan</div>
                <div className="mt-1 text-[11px] font-medium text-brand-ink">{s.conversion}</div>
              </div>
            ))}
          </div>
        </Section>
      </PageBody>
    </div>
  );
}
