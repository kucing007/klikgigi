"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Check,
  ChevronsUpDown,
  ExternalLink,
  MapPin,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Stethoscope,
  Building2,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/store/workspace";
import { filterNav, navGroups, settingsNav } from "./nav-config";
import { LogoMark } from "@/components/brand/logo";
import { locations, tenant, subscription } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { planTierMeta } from "@/lib/format";

export function AppSidebar() {
  const pathname = usePathname();
  const { role, mode, sidebarCollapsed: collapsed, toggleSidebar } = useWorkspace();
  const groups = filterNav(navGroups, role, mode);
  const showSettings = mode === "SOLO" || role === "OWNER";

  const isActive = (href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 flex-col border-r bg-sidebar transition-[width] duration-200 md:flex",
        collapsed ? "w-[60px]" : "w-[248px]",
      )}
    >
      <div className={cn("flex h-14 items-center gap-1 border-b px-3", collapsed && "justify-center px-2")}>
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-2 py-3" aria-label="Navigasi utama">
        {groups.map((g) => (
          <div key={g.label} className="mb-4">
            {!collapsed && (
              <div className="px-2 pb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground/80 uppercase">{g.label}</div>
            )}
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active = isActive(item.href);
                const link = (
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] font-medium text-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-foreground",
                      active && "bg-card text-foreground shadow-[0_0_0_1px_var(--border)]",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    {active && <span className="absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full bg-brand" />}
                    <item.icon className={cn("size-4 shrink-0", active ? "text-brand" : "text-muted-foreground group-hover:text-foreground")} />
                    {!collapsed && <span className="truncate">{item.title}</span>}
                    {!collapsed && item.badge && (
                      <span className="num ml-auto rounded bg-muted px-1.5 text-[11px] leading-5 text-muted-foreground">{item.badge}</span>
                    )}
                  </Link>
                );
                return (
                  <li key={item.href}>
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>{link}</TooltipTrigger>
                        <TooltipContent side="right">{item.title}</TooltipContent>
                      </Tooltip>
                    ) : (
                      link
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="mx-3 mb-3 rounded-lg border bg-card p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{planTierMeta[subscription.tier].label}</span>
            <Link href="/app/pengaturan/langganan" className="text-brand-ink hover:underline">
              Kelola
            </Link>
          </div>
          <div className="mt-2.5 space-y-2">
            <div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Kuota WhatsApp</span>
                <span className="num">
                  {subscription.usage.wa.used}/{subscription.usage.wa.limit}
                </span>
              </div>
              <Progress value={(subscription.usage.wa.used / subscription.usage.wa.limit) * 100} className="mt-1 h-1" />
            </div>
          </div>
        </div>
      )}

      <div className={cn("flex items-center gap-1 border-t p-2", collapsed && "flex-col")}>
        {showSettings && (
          <Link
            href={settingsNav.href}
            className={cn(
              "flex h-8 flex-1 items-center gap-2.5 rounded-md px-2 text-[13px] font-medium text-foreground/70 hover:bg-sidebar-accent hover:text-foreground",
              pathname.startsWith(settingsNav.href) && "bg-card text-foreground shadow-[0_0_0_1px_var(--border)]",
              collapsed && "w-8 flex-none justify-center px-0",
            )}
          >
            <settingsNav.icon className="size-4 text-muted-foreground" />
            {!collapsed && settingsNav.title}
          </Link>
        )}
        {!collapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="#" className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground" aria-label="Bantuan">
                <LifeBuoy className="size-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>Pusat Bantuan</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleSidebar}
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            >
              {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {collapsed ? "Perluas" : "Ciutkan"} <kbd className="ml-1 opacity-70">[</kbd>
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
}

function WorkspaceSwitcher({ collapsed }: { collapsed: boolean }) {
  const { mode, setMode, locationId, setLocation } = useWorkspace();
  const loc = locations.find((l) => l.id === locationId) ?? locations[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 text-left outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring",
          collapsed && "flex-none justify-center px-0",
        )}
      >
        <LogoMark className="size-7" />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold leading-tight">
                {mode === "SOLO" ? "Praktik drg. Budi" : tenant.name}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground leading-tight">
                {mode === "SOLO" ? "Solo · 2 lokasi praktik" : `Cabang ${loc.shortName}`}
              </span>
            </span>
            <ChevronsUpDown className="size-3.5 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Mode Workspace</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => setMode("CLINIC")} className="items-start gap-2.5 py-2">
            <Building2 className="mt-0.5 size-4" />
            <span className="flex-1">
              <span className="block text-sm font-medium">Klinik Multi-Dokter</span>
              <span className="block text-xs text-muted-foreground">Kalender kursi, peran tim, komisi</span>
            </span>
            {mode === "CLINIC" && <Check className="mt-0.5 size-4 text-brand" />}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setMode("SOLO")} className="items-start gap-2.5 py-2">
            <Stethoscope className="mt-0.5 size-4" />
            <span className="flex-1">
              <span className="block text-sm font-medium">Praktik Mandiri (Solo)</span>
              <span className="block text-xs text-muted-foreground">Dokter + kasir dalam satu layar</span>
            </span>
            {mode === "SOLO" && <Check className="mt-0.5 size-4 text-brand" />}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">Lokasi Praktik</DropdownMenuLabel>
        {locations.map((l, i) => (
          <DropdownMenuItem key={l.id} onSelect={() => setLocation(l.id)} className="gap-2.5">
            <MapPin className="size-4 text-muted-foreground" />
            <span className="flex-1 truncate">{l.name}</span>
            {l.id === locationId ? <Check className="size-4 text-brand" /> : <DropdownMenuShortcut>⌘{i + 1}</DropdownMenuShortcut>}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem asChild className="gap-2.5 text-muted-foreground">
          <Link href="/app/pengaturan/lokasi">
            <Plus className="size-4" /> Tambah lokasi
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="gap-2.5">
          <Link href={`/s/${tenant.slug}`} target="_blank">
            <ExternalLink className="size-4" />
            <span className="flex-1">Lihat landing page</span>
            <span className="text-xs text-muted-foreground">{tenant.slug}.klikgigi.id</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
