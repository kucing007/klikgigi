"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  MessageCircle,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageBody, PageHeader, Section, Stat } from "@/components/shared/page";
import {
  getPatient,
  recalls as initialRecalls,
  subscription,
  waAutomations as initialAutomations,
  waMessages,
} from "@/lib/data";
import { dateShort, rupiah } from "@/lib/format";
import { toast } from "sonner";

export default function WhatsAppCrmPage() {
  const [automations, setAutomations] = useState(initialAutomations);
  const [recalls, setRecalls] = useState(initialRecalls);
  const [selectedAutoId, setSelectedAutoId] = useState(initialAutomations[0].id);

  const selectedAuto = automations.find((a) => a.id === selectedAutoId) ?? automations[0];

  const toggleAuto = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    );
    toast.success("Status antrean otomasi WhatsApp diperbarui");
  };

  const sendRecallBatch = () => {
    setRecalls((prev) =>
      prev.map((r) => (r.status === "DUE" || r.status === "OVERDUE" ? { ...r, status: "INVITED" } : r)),
    );
    toast.success("Undangan Recall Scaling 6 Bulan dikirim otomatis ke pasien jatuh tempo!");
  };

  return (
    <div>
      <PageHeader
        title="Otomasi WhatsApp CRM, Follow-Up & Recall 6 Bulan"
        description="Mesin retensi terukur berbasis antrean terjadwal (BullMQ) — konfirmasi H-1, instruksi pasca-bedah H+1, dan recall scaling"
        actions={
          <Button size="sm" onClick={sendRecallBatch}>
            <Send className="size-3.5" /> Kirim Undangan Recall Massal
          </Button>
        }
      />

      <PageBody className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-4">
          <Stat
            label="Kuota WA Bulan Ini"
            value={`${subscription.usage.wa.used} / ${subscription.usage.wa.limit}`}
            hint={`+${subscription.usage.wa.addon} token Add-On tidak hangus`}
          />
          <Stat
            label="Tingkat Konfirmasi H-1"
            value="91,4%"
            delta={{ value: "No-show turun 78%", positive: true }}
            hint="Pasien membalas '1' (Hadir)"
          />
          <Stat
            label="Ulasan Google Maps Baru"
            value="+34 ulasan"
            hint="Dari pesan otomatis H+1 Post-Op Care"
          />
          <Stat
            label="Potensi Omzet Recall"
            value={rupiah(recalls.reduce((s, r) => s + r.potential, 0))}
            hint={`${recalls.length} pasien dalam siklus recall`}
          />
        </div>

        <Tabs defaultValue="automations">
          <TabsList>
            <TabsTrigger value="automations" className="text-xs">
              7 Trigger Otomasi WhatsApp
            </TabsTrigger>
            <TabsTrigger value="recalls" className="text-xs">
              Daftar Recall 6 Bulan ({recalls.length})
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs">
              Log Pengiriman Pesan ({waMessages.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="automations" className="mt-4">
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="space-y-2.5 lg:col-span-7">
                {automations.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAutoId(a.id)}
                    role="button"
                    tabIndex={0}
                    className={`flex items-center justify-between gap-3 rounded-lg border bg-card p-3.5 text-xs transition-all ${
                      selectedAuto.id === a.id ? "border-brand ring-2 ring-brand/30" : "hover:border-border-strong"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{a.name}</span>
                        <span className="rounded border bg-subtle px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground">
                          {a.trigger}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{a.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" /> Jadwal: {a.delay}
                        </span>
                        <span>·</span>
                        <span className="num">Terkirim 30 hari: {a.sent30d} pesan</span>
                      </div>
                    </div>
                    <Switch
                      checked={a.enabled}
                      onCheckedChange={() => toggleAuto(a.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ))}
              </div>

              <div className="lg:col-span-5">
                <Section
                  title={`Template: ${selectedAuto.name}`}
                  description={`Trigger: ${selectedAuto.trigger} · Delay: ${selectedAuto.delay}`}
                >
                  <div className="space-y-3 text-xs">
                    <div className="flex flex-wrap gap-1">
                      {[
                        "{nama_pasien}",
                        "{nama_dokter}",
                        "{tanggal}",
                        "{jam}",
                        "{link_intake}",
                        "{link_booking}",
                        "{link_review}",
                      ].map((v) => (
                        <span
                          key={v}
                          className="rounded border bg-subtle px-2 py-0.5 font-mono text-[11px] text-foreground/80"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                    <Textarea
                      value={selectedAuto.template}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAutomations((prev) =>
                          prev.map((x) => (x.id === selectedAuto.id ? { ...x, template: val } : x)),
                        );
                      }}
                      rows={7}
                      className="font-mono text-xs leading-relaxed"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => toast.success("Pesan uji coba dikirim ke nomor WA dokter")}
                      >
                        Kirim Uji Coba
                      </Button>
                      <Button
                        size="xs"
                        onClick={() => toast.success("Template pesan WhatsApp disimpan")}
                      >
                        Simpan Template
                      </Button>
                    </div>
                  </div>
                </Section>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recalls" className="mt-4">
            <div className="overflow-x-auto rounded-lg border bg-card">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-subtle text-[11px] font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Pasien</th>
                    <th className="px-4 py-2.5">Program Recall</th>
                    <th className="px-4 py-2.5">Kunjungan Terakhir</th>
                    <th className="px-4 py-2.5">Jatuh Tempo</th>
                    <th className="px-4 py-2.5">Potensi Nilai</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recalls.map((r) => {
                    const pt = getPatient(r.patientId)!;
                    return (
                      <tr key={r.patientId + r.reason} className="hover:bg-subtle/50">
                        <td className="px-4 py-3 font-semibold">{pt.fullName}</td>
                        <td className="px-4 py-3">{r.reason}</td>
                        <td className="num px-4 py-3 text-muted-foreground">{dateShort(r.lastDate)}</td>
                        <td className="num px-4 py-3 font-medium">{dateShort(r.dueDate)}</td>
                        <td className="num px-4 py-3 font-semibold">{rupiah(r.potential)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              r.status === "BOOKED"
                                ? "bg-success-soft text-success"
                                : r.status === "INVITED"
                                  ? "bg-info-soft text-info"
                                  : r.status === "OVERDUE"
                                    ? "bg-danger-soft text-danger"
                                    : "bg-warning-soft text-warning"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => toast.success(`Undangan WA dikirim ke ${pt.fullName}`)}
                          >
                            <MessageCircle className="size-3" /> Kirim WA
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <div className="overflow-x-auto rounded-lg border bg-card">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-subtle text-[11px] font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Waktu Kirim</th>
                    <th className="px-4 py-2.5">Pasien</th>
                    <th className="px-4 py-2.5">Trigger Otomasi</th>
                    <th className="px-4 py-2.5">Cuplikan Pesan / Balasan</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {waMessages.map((m) => {
                    const pt = getPatient(m.patientId);
                    return (
                      <tr key={m.id} className="hover:bg-subtle/50">
                        <td className="num px-4 py-3 text-muted-foreground">{m.sentAt}</td>
                        <td className="px-4 py-3 font-semibold">{pt?.fullName}</td>
                        <td className="px-4 py-3">{m.automation}</td>
                        <td className="px-4 py-3 text-muted-foreground">{m.preview}</td>
                        <td className="px-4 py-3 font-mono text-[11px] font-semibold">{m.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </PageBody>
    </div>
  );
}
