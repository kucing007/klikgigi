"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Code2,
  ExternalLink,
  Globe,
  Layers,
  LayoutTemplate,
  Monitor,
  Palette,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tablet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  type BlockId,
  CLINIC_TEMPLATES,
  type ClinicTemplateId,
  ClinicTemplateRenderer,
  LAYMAN_COMPLAINTS,
  useClinicSiteConfig,
} from "@/components/clinic-site/clinic-template-renderer";
import { rupiah } from "@/lib/format";
import { toast } from "sonner";

const ACCENT_PRESETS = [
  { name: "Botanical Sage", hex: "#2E5A44" },
  { name: "Surgical Cobalt", hex: "#0052FF" },
  { name: "Clinical Teal", hex: "#0F766E" },
  { name: "Atelier Bronze", hex: "#C5A059" },
  { name: "Espresso Ink", hex: "#1C1917" },
  { name: "Deep Indigo", hex: "#1E3A8A" },
];

export default function LandingPageBuilderStudio() {
  const { config, setConfig, resetConfig } = useClinicSiteConfig();
  const [selectedBlock, setSelectedBlock] = useState<BlockId>("blk_hero");
  const [leftTab, setLeftTab] = useState<"TEMPLATES" | "BLOCKS">("TEMPLATES");
  const [rightTab, setRightTab] = useState<"INSPECTOR" | "BOOKING" | "SEO">("INSPECTOR");
  const [viewport, setViewport] = useState<"MOBILE" | "TABLET" | "DESKTOP">("DESKTOP");

  const selectTemplate = (tplId: ClinicTemplateId) => {
    const meta = CLINIC_TEMPLATES.find((t) => t.id === tplId);
    setConfig((prev) => ({
      ...prev,
      templateId: tplId,
      primaryColor: meta ? meta.defaultAccent : prev.primaryColor,
    }));
    toast.success(`Template diubah ke ${meta?.name}`);
  };

  const toggleBlock = (id: BlockId) => {
    setConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)),
    }));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    setConfig((prev) => {
      const next = [...prev.blocks];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return { ...prev, blocks: next };
    });
  };

  const activeBlockMeta = config.blocks.find((b) => b.id === selectedBlock) ?? config.blocks[0];
  const activeTemplateMeta =
    CLINIC_TEMPLATES.find((t) => t.id === config.templateId) ?? CLINIC_TEMPLATES[0];

  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] flex-col bg-background">
      {/* ====================================================================
          TOP STUDIO COMMAND BAR
          ==================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight">
                No-Code Dental Website Studio
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500" /> ISR &lt; 120ms
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="font-mono">https://{config.slug}.klikgigi.id</span>
              <span>·</span>
              <span className="font-mono text-foreground/80">{config.customDomain}</span>
            </div>
          </div>
        </div>

        {/* Center Viewport Switcher */}
        <div className="flex items-center gap-1 rounded-lg border bg-subtle p-1 text-xs">
          <button
            type="button"
            onClick={() => setViewport("MOBILE")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              viewport === "MOBILE"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="size-3.5" /> Mobile (390px)
          </button>
          <button
            type="button"
            onClick={() => setViewport("TABLET")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              viewport === "TABLET"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tablet className="size-3.5" /> Tablet (768px)
          </button>
          <button
            type="button"
            onClick={() => setViewport("DESKTOP")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              viewport === "DESKTOP"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="size-3.5" /> Desktop (Full)
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Code2 className="size-3.5" /> Skema JSON
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-sm font-semibold">
                  Structured Block Schema (landing_pages.page_config)
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Konfigurasi JSON ini disimpan di PostgreSQL dan dirender melalui Incremental Static
                  Regeneration (ISR) di rute publik /s/{config.slug}.
                </DialogDescription>
              </DialogHeader>
              <pre className="max-h-[420px] overflow-auto rounded-lg border bg-subtle p-3 font-mono text-[11px] leading-relaxed">
                {JSON.stringify(config, null, 2)}
              </pre>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              resetConfig();
              toast.info("Konfigurasi studio dikembalikan ke pengaturan awal.");
            }}
          >
            <RotateCcw className="size-3.5" /> Reset
          </Button>

          <Button variant="outline" size="sm" asChild className="h-8 text-xs">
            <Link href={`/s/${config.slug}`} target="_blank">
              Buka Situs Publik <ExternalLink className="size-3.5" />
            </Link>
          </Button>

          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={() =>
              toast.success(
                `Situs berhasil dipublikasikan ke https://${config.slug}.klikgigi.id (${activeTemplateMeta.name})`,
              )
            }
          >
            <Check className="size-3.5" /> Publikasikan
          </Button>
        </div>
      </div>

      {/* ====================================================================
          3-PANE STUDIO WORKSPACE
          ==================================================================== */}
      <div className="grid flex-1 lg:grid-cols-12">
        {/* ------------------------------------------------------------------
            LEFT RAIL (3 COLS): TEMPLATE GALLERY & STRUCTURED BLOCK TREE
            ------------------------------------------------------------------ */}
        <aside className="flex flex-col border-r bg-card lg:col-span-3">
          <div className="grid grid-cols-2 border-b p-1.5 text-xs">
            <button
              type="button"
              onClick={() => setLeftTab("TEMPLATES")}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 font-medium transition-colors ${
                leftTab === "TEMPLATES"
                  ? "bg-subtle text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutTemplate className="size-3.5" /> 4 Template Studio
            </button>
            <button
              type="button"
              onClick={() => setLeftTab("BLOCKS")}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 font-medium transition-colors ${
                leftTab === "BLOCKS"
                  ? "bg-subtle text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="size-3.5" /> Susunan Blok ({config.blocks.filter((b) => b.enabled).length}/5)
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {leftTab === "TEMPLATES" ? (
              <>
                <div className="text-[11px] text-muted-foreground leading-relaxed">
                  Pilih arsitektur visual klinik Anda. Seluruh konten, jadwal dokter, dan laci
                  booking 4-langkah otomatis menyesuaikan tata letak dan tipografi.
                </div>

                <div className="space-y-2.5">
                  {CLINIC_TEMPLATES.map((tpl) => {
                    const active = config.templateId === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => selectTemplate(tpl.id)}
                        className={`w-full rounded-xl border p-3 text-left transition-all ${
                          active
                            ? "border-brand bg-brand-soft/35 ring-1 ring-brand"
                            : "bg-background hover:border-foreground/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-semibold text-muted-foreground">
                            TEMPLATE {tpl.code}
                          </span>
                          <div className="flex items-center gap-1">
                            <span
                              className="size-3.5 rounded-full border"
                              style={{ backgroundColor: tpl.canvasBg }}
                              title="Canvas"
                            />
                            <span
                              className="size-3.5 rounded-full border"
                              style={{ backgroundColor: tpl.defaultAccent }}
                              title="Accent"
                            />
                            <span
                              className="size-3.5 rounded-full border"
                              style={{ backgroundColor: tpl.inkColor }}
                              title="Ink"
                            />
                          </div>
                        </div>

                        <div className="mt-1.5 text-xs font-semibold">{tpl.name}</div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                          {tpl.tagline}
                        </p>

                        <div className="mt-2.5 flex items-center justify-between border-t pt-2 font-mono text-[10px] text-muted-foreground">
                          <span>{tpl.fontLabel}</span>
                          {active && (
                            <span className="font-semibold text-brand-ink">Aktif</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div className="text-[11px] text-muted-foreground leading-relaxed">
                  Klik blok untuk mengedit kontennya di panel kanan, ubah urutan, atau matikan
                  visibilitas blok.
                </div>

                <div className="space-y-2">
                  {config.blocks.map((b, idx) => {
                    const selected = selectedBlock === b.id;
                    return (
                      <div
                        key={b.id}
                        onClick={() => {
                          setSelectedBlock(b.id);
                          setRightTab("INSPECTOR");
                        }}
                        className={`cursor-pointer rounded-lg border p-2.5 text-xs transition-all ${
                          selected
                            ? "border-brand bg-brand-soft/35"
                            : "bg-background hover:bg-subtle/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold leading-snug">{b.label}</div>
                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveBlock(idx, -1)}
                              className="rounded p-1 text-muted-foreground hover:bg-subtle hover:text-foreground disabled:opacity-30"
                              aria-label="Naikkan urutan blok"
                            >
                              <ArrowUp className="size-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === config.blocks.length - 1}
                              onClick={() => moveBlock(idx, 1)}
                              className="rounded p-1 text-muted-foreground hover:bg-subtle hover:text-foreground disabled:opacity-30"
                              aria-label="Turunkan urutan blok"
                            >
                              <ArrowDown className="size-3" />
                            </button>
                            <Switch
                              checked={b.enabled}
                              onCheckedChange={() => toggleBlock(b.id)}
                            />
                          </div>
                        </div>
                        <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                          <span>{b.type}</span>
                          {b.proOnly && (
                            <span className="rounded bg-brand-soft px-1.5 py-0.5 text-brand-ink">
                              Solo Pro+
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </aside>

        {/* ------------------------------------------------------------------
            CENTER STAGE (6 COLS): LIVE INTERACTIVE VIEWPORT CANVAS
            ------------------------------------------------------------------ */}
        <section className="flex flex-col bg-dots-subtle p-4 sm:p-6 lg:col-span-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="rounded bg-card px-2 py-1 font-mono text-[11px] font-medium shadow-2xs border">
                {activeTemplateMeta.code} · {activeTemplateMeta.name}
              </span>
              <span className="text-muted-foreground text-[11px]">
                Klik bagian mana pun di kanvas untuk mengedit blok
              </span>
            </div>
            <Link
              href={`/s/${config.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-brand-ink hover:underline"
            >
              Pratinjau Layar Penuh <ExternalLink className="size-3" />
            </Link>
          </div>

          <div className="flex flex-1 justify-center overflow-y-auto">
            <div
              className={`overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 ${
                viewport === "MOBILE"
                  ? "w-[390px]"
                  : viewport === "TABLET"
                    ? "w-[740px]"
                    : "w-full"
              }`}
            >
              {/* Browser Frame Top Chrome */}
              <div className="flex items-center justify-between border-b bg-subtle px-3.5 py-2 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-rose-400/80" />
                  <span className="size-2.5 rounded-full bg-amber-400/80" />
                  <span className="size-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <div className="flex items-center gap-1.5 rounded-md border bg-card px-3 py-0.5 font-mono text-[10px] text-muted-foreground">
                  <Globe className="size-3 text-emerald-600" />
                  https://{config.slug}.klikgigi.id
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">SSL</div>
              </div>

              {/* Live Rendered Multi-Template Microsite */}
              <div className="max-h-[760px] overflow-y-auto">
                <ClinicTemplateRenderer
                  config={config}
                  inspectable
                  selectedBlockId={selectedBlock}
                  onSelectBlock={(id) => {
                    setSelectedBlock(id);
                    setRightTab("INSPECTOR");
                  }}
                  compactMode={viewport === "MOBILE"}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            RIGHT RAIL (3 COLS): CONTEXTUAL PROPERTY INSPECTOR
            ------------------------------------------------------------------ */}
        <aside className="flex flex-col border-l bg-card lg:col-span-3">
          <div className="grid grid-cols-3 border-b p-1.5 text-xs">
            <button
              type="button"
              onClick={() => setRightTab("INSPECTOR")}
              className={`flex items-center justify-center gap-1 rounded-md py-1.5 font-medium ${
                rightTab === "INSPECTOR"
                  ? "bg-subtle text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings2 className="size-3.5" /> Blok
            </button>
            <button
              type="button"
              onClick={() => setRightTab("BOOKING")}
              className={`flex items-center justify-center gap-1 rounded-md py-1.5 font-medium ${
                rightTab === "BOOKING"
                  ? "bg-subtle text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Palette className="size-3.5" /> Tema & QRIS
            </button>
            <button
              type="button"
              onClick={() => setRightTab("SEO")}
              className={`flex items-center justify-center gap-1 rounded-md py-1.5 font-medium ${
                rightTab === "SEO"
                  ? "bg-subtle text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search className="size-3.5" /> Domain & SEO
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
            {/* TAB 1: CONTEXTUAL BLOCK INSPECTOR */}
            {rightTab === "INSPECTOR" && (
              <>
                <div className="rounded-lg border bg-subtle/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-semibold text-brand-ink uppercase">
                      Properti Blok Aktif
                    </span>
                    <Switch
                      checked={activeBlockMeta.enabled}
                      onCheckedChange={() => toggleBlock(activeBlockMeta.id)}
                    />
                  </div>
                  <div className="mt-1 text-sm font-semibold">{activeBlockMeta.label}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {activeBlockMeta.description}
                  </div>
                </div>

                {selectedBlock === "blk_hero" && (
                  <div className="space-y-3.5">
                    <div>
                      <Label className="text-xs">Nama Studio / Klinik</Label>
                      <Input
                        value={config.clinicName}
                        onChange={(e) =>
                          setConfig((p) => ({ ...p, clinicName: e.target.value }))
                        }
                        className="mt-1 h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Tag Lokasi Singkat (Header)</Label>
                      <Input
                        value={config.cityTag}
                        onChange={(e) =>
                          setConfig((p) => ({ ...p, cityTag: e.target.value }))
                        }
                        className="mt-1 h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Headline Utama</Label>
                      <Textarea
                        rows={2}
                        value={config.headline}
                        onChange={(e) =>
                          setConfig((p) => ({ ...p, headline: e.target.value }))
                        }
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Subheadline Penjelas</Label>
                      <Textarea
                        rows={3}
                        value={config.subheadline}
                        onChange={(e) =>
                          setConfig((p) => ({ ...p, subheadline: e.target.value }))
                        }
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Social Proof Google Maps</Label>
                      <Input
                        value={config.badgeText}
                        onChange={(e) =>
                          setConfig((p) => ({ ...p, badgeText: e.target.value }))
                        }
                        className="mt-1 h-8 text-xs"
                      />
                    </div>
                  </div>
                )}

                {selectedBlock === "blk_services" && (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <div className="font-semibold">Tampilkan Harga Mulai (Transparan)</div>
                        <div className="text-[11px] text-muted-foreground">
                          Meningkatkan konversi booking pasien baru hingga 2.4x
                        </div>
                      </div>
                      <Switch
                        checked={config.showStartingPrice}
                        onCheckedChange={(v) =>
                          setConfig((p) => ({ ...p, showStartingPrice: v }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="font-semibold">
                        Pemetaan Bahasa Awam ke Katalog Tindakan (6 Kartu)
                      </div>
                      {LAYMAN_COMPLAINTS.map((c) => (
                        <div key={c.id} className="rounded-md border bg-subtle/40 p-2.5">
                          <div className="flex items-center justify-between font-semibold">
                            <span>{c.title}</span>
                            <span className="font-mono text-[11px]">{rupiah(c.price)}</span>
                          </div>
                          <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                            {c.clinicalTerm} · Durasi kursi {c.duration} mnt
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedBlock === "blk_before_after" && (
                  <div className="space-y-3.5">
                    <div className="text-[11px] text-muted-foreground">
                      Kelola studi kasus transformasi senyum yang dapat digeser langsung oleh
                      pasien.
                    </div>
                    {config.cases.map((cs, idx) => (
                      <div key={cs.id} className="space-y-2 rounded-lg border p-3">
                        <div className="font-mono text-[10px] font-semibold text-brand-ink">
                          KASUS #{idx + 1} · {cs.variant}
                        </div>
                        <div>
                          <Label className="text-[11px]">Judul Kasus</Label>
                          <Input
                            value={cs.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setConfig((p) => ({
                                ...p,
                                cases: p.cases.map((item, i) =>
                                  i === idx ? { ...item, title: val } : item,
                                ),
                              }));
                            }}
                            className="mt-1 h-7 text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[11px]">Label Sebelum</Label>
                            <Input
                              value={cs.shadeBefore}
                              onChange={(e) => {
                                const val = e.target.value;
                                setConfig((p) => ({
                                  ...p,
                                  cases: p.cases.map((item, i) =>
                                    i === idx ? { ...item, shadeBefore: val } : item,
                                  ),
                                }));
                              }}
                              className="mt-1 h-7 text-[11px]"
                            />
                          </div>
                          <div>
                            <Label className="text-[11px]">Label Sesudah</Label>
                            <Input
                              value={cs.shadeAfter}
                              onChange={(e) => {
                                const val = e.target.value;
                                setConfig((p) => ({
                                  ...p,
                                  cases: p.cases.map((item, i) =>
                                    i === idx ? { ...item, shadeAfter: val } : item,
                                  ),
                                }));
                              }}
                              className="mt-1 h-7 text-[11px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedBlock === "blk_doctors" && (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <div className="font-semibold">Tampilkan Nomor STR &amp; SIP Resmi</div>
                        <div className="text-[11px] text-muted-foreground">
                          Membangun kredibilitas medis sesuai regulasi Kemenkes RI
                        </div>
                      </div>
                      <Switch
                        checked={config.showStrSip}
                        onCheckedChange={(v) => setConfig((p) => ({ ...p, showStrSip: v }))}
                      />
                    </div>
                  </div>
                )}

                {selectedBlock === "blk_locations" && (
                  <div className="space-y-3">
                    <div className="rounded-lg border bg-subtle/40 p-3">
                      <div className="font-semibold">Sinkronisasi Otomatis Jadwal Cabang</div>
                      <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                        Alamat cabang, jam buka, dan ketersediaan kursi ditarik langsung dari
                        pengaturan Kalender Multi-Chair.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB 2: THEME PALETTE & ANTI-GHOSTING QRIS DEPOSIT */}
            {rightTab === "BOOKING" && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Warna Aksen Utama Situs</Label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {ACCENT_PRESETS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setConfig((p) => ({ ...p, primaryColor: c.hex }))}
                        className={`flex items-center gap-2 rounded-md border p-2 text-left text-[11px] ${
                          config.primaryColor === c.hex
                            ? "border-foreground font-semibold"
                            : "border-border"
                        }`}
                      >
                        <span
                          className="size-4 shrink-0 rounded-full"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="truncate">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border bg-subtle/40 p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Wajibkan Deposit QRIS Anti-Ghosting</div>
                      <div className="text-[11px] text-muted-foreground">
                        Memangkas pasien No-Show hingga 80%
                      </div>
                    </div>
                    <Switch
                      checked={config.requireDeposit}
                      onCheckedChange={(v) => setConfig((p) => ({ ...p, requireDeposit: v }))}
                    />
                  </div>

                  {config.requireDeposit && (
                    <div>
                      <Label className="text-[11px]">Nominal Deposit Komitmen (Rp)</Label>
                      <Input
                        type="number"
                        value={config.depositAmount}
                        onChange={(e) =>
                          setConfig((p) => ({ ...p, depositAmount: Number(e.target.value) }))
                        }
                        className="mt-1 h-8 font-mono text-xs"
                      />
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Otomatis memotong tagihan akhir pasien di layar Kasir Split-Screen.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-xl border bg-subtle/40 p-3.5">
                  <div>
                    <div className="font-semibold">Sembunyikan Watermark KlikGigi.id</div>
                    <div className="text-[11px] text-muted-foreground">
                      Tersedia mulai paket Solo Pro (Rp129rb/bln)
                    </div>
                  </div>
                  <Switch
                    checked={config.hideWatermark}
                    onCheckedChange={(v) => setConfig((p) => ({ ...p, hideWatermark: v }))}
                  />
                </div>
              </div>
            )}

            {/* TAB 3: DOMAIN ROUTING & GOOGLE LOCAL SEO */}
            {rightTab === "SEO" && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Subdomain Instan KlikGigi</Label>
                  <div className="mt-1 flex items-center rounded-md border bg-subtle px-2.5">
                    <input
                      value={config.slug}
                      onChange={(e) => setConfig((p) => ({ ...p, slug: e.target.value }))}
                      className="h-8 flex-1 bg-transparent font-mono text-xs outline-none"
                    />
                    <span className="font-mono text-muted-foreground">.klikgigi.id</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Custom Domain Klinik (Clinic Growth+)</Label>
                  <Input
                    value={config.customDomain}
                    onChange={(e) =>
                      setConfig((p) => ({ ...p, customDomain: e.target.value }))
                    }
                    className="mt-1 h-8 font-mono text-xs"
                  />
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-600">
                    <ShieldCheck className="size-3.5" /> CNAME cname.klikgigi.id terverifikasi · TLS
                    Aktif
                  </div>
                </div>

                <div className="border-t pt-3 space-y-3">
                  <div>
                    <Label className="text-xs">Judul Meta SEO Lokal</Label>
                    <Input
                      value={config.seoTitle}
                      onChange={(e) => setConfig((p) => ({ ...p, seoTitle: e.target.value }))}
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Deskripsi Meta Google</Label>
                    <Textarea
                      rows={3}
                      value={config.seoDescription}
                      onChange={(e) =>
                        setConfig((p) => ({ ...p, seoDescription: e.target.value }))
                      }
                      className="mt-1 text-xs"
                    />
                  </div>

                  {/* Live Google SERP Preview */}
                  <div className="rounded-lg border bg-card p-3 space-y-1">
                    <div className="font-mono text-[10px] text-muted-foreground uppercase">
                      Pratinjau Hasil Pencarian Google
                    </div>
                    <div className="text-[11px] text-emerald-700 font-mono">
                      https://{config.customDomain}
                    </div>
                    <div className="text-sm font-semibold text-[#1a0dab] dark:text-sky-400 leading-snug">
                      {config.seoTitle}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {config.seoDescription}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
