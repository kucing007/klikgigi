"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, CreditCard, FileText, Footprints, Moon, Stethoscope, UserPlus } from "lucide-react";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useWorkspace } from "@/lib/store/workspace";
import { filterNav, navGroups } from "./nav-config";
import { invoices, patients } from "@/lib/data";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { rupiah } from "@/lib/format";
import { invoiceTotals } from "@/lib/data";

export function CommandMenu() {
  const router = useRouter();
  const { commandOpen, setCommandOpen, role, mode, toggleSidebar } = useWorkspace();
  const { setTheme, resolvedTheme } = useTheme();
  const groups = filterNav(navGroups, role, mode);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(!useWorkspace.getState().commandOpen);
      } else if (!typing && e.key === "[") {
        toggleSidebar();
      } else if (!typing && e.key === "/") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCommandOpen, toggleSidebar]);

  const go = (href: string) => {
    setCommandOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen} title="Pencarian cepat" description="Cari pasien, invoice, atau navigasi">
      <CommandInput placeholder="Ketik nama pasien, no. RM, invoice, atau perintah…" />
      <CommandList className="max-h-[440px]">
        <CommandEmpty>Tidak ada hasil.</CommandEmpty>
        <CommandGroup heading="Aksi cepat">
          <CommandItem onSelect={() => go("/app/kalender?new=1")}>
            <CalendarPlus /> Buat janji temu <CommandShortcut>N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/app/kalender?walkin=1")}>
            <Footprints /> Registrasi walk-in <CommandShortcut>W</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/app/pasien?new=1")}>
            <UserPlus /> Tambah pasien baru <CommandShortcut>P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/app/klinis/ap_02")}>
            <Stethoscope /> Buka ruang periksa — Dedi Kurniawan
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Pasien">
          {patients.slice(0, 8).map((p) => (
            <CommandItem key={p.id} value={`${p.fullName} ${p.mrn} ${p.phone}`} onSelect={() => go(`/app/pasien/${p.id}`)}>
              <PersonAvatar name={p.fullName} size="xs" />
              <span className="flex-1">{p.fullName}</span>
              <span className="font-mono text-[11px] text-muted-foreground">{p.mrn}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Invoice">
          {invoices.slice(0, 4).map((inv) => {
            const t = invoiceTotals(inv);
            const p = patients.find((x) => x.id === inv.patientId);
            return (
              <CommandItem key={inv.id} value={`${inv.number} ${p?.fullName}`} onSelect={() => go(`/app/kasir/${inv.id}`)}>
                <FileText />
                <span className="flex-1">
                  <span className="font-mono text-xs">{inv.number}</span> · {p?.fullName}
                </span>
                <span className="num text-xs text-muted-foreground">{rupiah(t.grand)}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigasi">
          {groups.flatMap((g) =>
            g.items.map((i) => (
              <CommandItem key={i.href} onSelect={() => go(i.href)}>
                <i.icon /> {i.title}
                {i.shortcut && <CommandShortcut>{i.shortcut}</CommandShortcut>}
              </CommandItem>
            )),
          )}
          <CommandItem onSelect={() => go("/app/pengaturan")}>
            <CreditCard /> Pengaturan
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Preferensi">
          <CommandItem
            onSelect={() => {
              setTheme(resolvedTheme === "dark" ? "light" : "dark");
              setCommandOpen(false);
            }}
          >
            <Moon /> Ganti tema terang/gelap
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
