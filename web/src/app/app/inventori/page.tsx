"use client";

import { useState } from "react";
import { AlertTriangle, PackagePlus, Pill, Plus, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageBody, PageHeader, Stat } from "@/components/shared/page";
import { useWorkspace } from "@/lib/store/workspace";
import { inventory as initialInventory } from "@/lib/data";
import { rupiah } from "@/lib/format";
import { toast } from "sonner";

export default function InventoryPage() {
  const { medicines, addMedicine } = useWorkspace();
  const [items, setItems] = useState(initialInventory);
  const [showNewMedForm, setShowNewMedForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<"ANTIBIOTIC" | "ANALGESIC" | "ANTISEPTIC" | "TOPICAL" | "ALKES">("ANALGESIC");
  const [newSigna, setNewSigna] = useState("3x1 sesudah makan");
  const [newPrice, setNewPrice] = useState("15000");
  const [newAllergyKeywords, setNewAllergyKeywords] = useState("");

  const lowStockCount = items.filter((i) => i.stock <= i.minStock).length;

  const restock = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, stock: i.stock + 10 } : i)));
    toast.success("Stok BMHP berhasil ditambah (+10 unit)");
  };

  const handleCreateMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Nama obat wajib diisi");
      return;
    }
    const keywords = newAllergyKeywords
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    addMedicine({
      id: `med_${Date.now()}`,
      code: `OBT-${Math.floor(100 + Math.random() * 900)}`,
      name: newName.trim(),
      category: newCategory,
      unit: "Strip (10 Tab)",
      defaultSigna: newSigna.trim() || "3x1 sesudah makan",
      price: Math.max(0, Number(newPrice) || 0),
      cost: Math.max(0, Math.round((Number(newPrice) || 0) * 0.5)),
      stock: 50,
      allergyKeywords: keywords,
      pregnancySafe: true,
    });
    setNewName("");
    setNewAllergyKeywords("");
    setShowNewMedForm(false);
    toast.success("Obat / Alkes baru ditambahkan ke Formularium Klinik & Kasir");
  };

  return (
    <div>
      <PageHeader
        title="Inventori BMHP & Formularium Obat / Resep"
        description="Stok bahan habis pakai & katalog obat terhubung langsung dengan Pemeriksaan Klinis (Safety Check Alergi) dan Kasir"
        actions={
          <Button size="sm" className="text-xs" onClick={() => setShowNewMedForm(true)}>
            <Plus className="size-3.5" /> + Tambah Obat / Alkes Baru
          </Button>
        }
      />

      <PageBody className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-4">
          <Stat label="Total SKU Bahan Medis" value={`${items.length} item`} hint="Restorasi, anestesi, endodontik, APD" />
          <Stat
            label="Formularium Obat & Resep"
            value={`${medicines.length} obat`}
            hint="Sinkron ke Review Resep & Kasir"
          />
          <Stat
            label="Perlu Restock Segera"
            value={`${lowStockCount} item`}
            delta={{ value: "Di bawah batas minimum", positive: false }}
            hint="Pehacain, K-File, Bonding Agent"
          />
          <Stat
            label="Nilai Persediaan Aktif"
            value={rupiah(items.reduce((s, i) => s + i.stock * i.costPerUnit, 0))}
            hint="Berdasarkan HPP rata-rata"
          />
        </div>

        {showNewMedForm && (
          <form onSubmit={handleCreateMed} className="space-y-3 rounded-lg border border-brand/30 bg-brand-soft/15 p-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-sm">Tambah Obat / Alkes ke Formularium Klinik</div>
              <Button type="button" variant="ghost" size="xs" onClick={() => setShowNewMedForm(false)}>
                Tutup
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-5">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-[11px]">Nama Obat & Dosis</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Mis: Ibuprofen 400mg / Cataflam 50mg"
                  className="h-8 bg-card text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Kategori</Label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as typeof newCategory)}
                  className="h-8 w-full rounded-md border bg-card px-2 text-xs"
                >
                  <option value="ANALGESIC">Analgesik (Anti-Nyeri)</option>
                  <option value="ANTIBIOTIC">Antibiotik</option>
                  <option value="ANTISEPTIC">Antiseptik / Kumur</option>
                  <option value="TOPICAL">Gel Topikal</option>
                  <option value="ALKES">Alkes Pasien</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Harga Jual (Rp)</Label>
                <Input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="num h-8 bg-card text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Signa Default</Label>
                <Input
                  value={newSigna}
                  onChange={(e) => setNewSigna(e.target.value)}
                  className="h-8 bg-card text-xs"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3 pt-1">
              <div className="flex-1 min-w-[240px] space-y-1">
                <Label className="text-[11px]">Kata Kunci Peringatan Alergi (Pisahkan koma)</Label>
                <Input
                  value={newAllergyKeywords}
                  onChange={(e) => setNewAllergyKeywords(e.target.value)}
                  placeholder="Mis: NSAID, Ibuprofen, Penicillin"
                  className="h-8 bg-card text-xs"
                />
              </div>
              <Button type="submit" size="sm" className="h-8 text-xs">
                <Plus className="size-3.5" /> Simpan ke Formularium
              </Button>
            </div>
          </form>
        )}

        <Tabs defaultValue="bmhp">
          <TabsList>
            <TabsTrigger value="bmhp" className="text-xs">
              Bahan Habis Pakai / BMHP ({items.length})
            </TabsTrigger>
            <TabsTrigger value="obat" className="text-xs">
              Formularium Obat & Alkes Resep ({medicines.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bmhp" className="mt-4">
            <div className="overflow-x-auto rounded-lg border bg-card">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-subtle text-[11px] font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Nama Bahan / Alkes</th>
                    <th className="px-4 py-2.5">Kategori</th>
                    <th className="px-4 py-2.5">Stok Saat Ini</th>
                    <th className="px-4 py-2.5">Batas Minimum</th>
                    <th className="px-4 py-2.5">HPP per Satuan</th>
                    <th className="px-4 py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item) => {
                    const isLow = item.stock <= item.minStock;
                    return (
                      <tr key={item.id} className="hover:bg-subtle/50">
                        <td className="px-4 py-3 font-semibold">{item.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                        <td className="px-4 py-3">
                          <span className={`num font-semibold ${isLow ? "text-danger" : "text-foreground"}`}>
                            {item.stock} {item.unit}
                          </span>
                          {isLow && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded bg-danger-soft px-1.5 py-0.5 text-[10px] font-semibold text-danger">
                              <AlertTriangle className="size-2.5" /> Stok Menipis
                            </span>
                          )}
                        </td>
                        <td className="num px-4 py-3 text-muted-foreground">
                          {item.minStock} {item.unit}
                        </td>
                        <td className="num px-4 py-3 font-medium">{rupiah(item.costPerUnit)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button size="xs" variant="outline" onClick={() => restock(item.id)}>
                            <PackagePlus className="size-3.5" /> +10 Restock
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="obat" className="mt-4">
            <div className="overflow-x-auto rounded-lg border bg-card">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-subtle text-[11px] font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Kode & Nama Obat</th>
                    <th className="px-4 py-2.5">Kategori & Kemasan</th>
                    <th className="px-4 py-2.5">Signa / Aturan Pakai</th>
                    <th className="px-4 py-2.5">Deteksi Kontraindikasi Alergi</th>
                    <th className="px-4 py-2.5">Stok</th>
                    <th className="px-4 py-2.5 text-right">Harga Jual</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {medicines.map((m) => (
                    <tr key={m.id} className="hover:bg-subtle/50">
                      <td className="px-4 py-3">
                        <div className="font-mono text-[10px] text-muted-foreground">{m.code}</div>
                        <div className="font-semibold flex items-center gap-1.5">
                          <Pill className="size-3.5 text-brand" />
                          {m.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{m.category}</div>
                        <div className="text-[11px] text-muted-foreground">{m.unit}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{m.defaultSigna}</td>
                      <td className="px-4 py-3">
                        {m.allergyKeywords.length > 0 ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 rounded bg-danger-soft px-1.5 py-0.5 text-[10px] font-semibold text-danger">
                              <ShieldAlert className="size-2.5" /> Blokir: {m.allergyKeywords.join(", ")}
                            </span>
                            {m.safeAlternativeId && (
                              <div className="text-[10px] text-muted-foreground">
                                Alternatif aman tersedia ({m.safeAlternativeId})
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-success font-medium">Aman untuk Alergi NSAID/Penicillin</span>
                        )}
                      </td>
                      <td className="num px-4 py-3 font-medium">{m.stock}</td>
                      <td className="num px-4 py-3 text-right font-semibold">{rupiah(m.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </PageBody>
    </div>
  );
}
