"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  CalendarPlus,
  ChevronDown,
  CreditCard,
  FlaskConical,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Plus,
  Search,
  Sun,
  UserPlus,
  UserRound,
  Footprints,
  Keyboard,
  Check,
  CalendarCheck,
  Wallet,
  ClipboardCheck,
  MessageCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspace } from "@/lib/store/workspace";
import { notifications, getStaff } from "@/lib/data";
import { filterNav, navGroups, roleLabel } from "./nav-config";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";
import { useState } from "react";

const roleUser: Record<Role, string> = { OWNER: "dr_budi", DOCTOR: "dr_siti", NURSE: "ns_rini", CASHIER: "cs_maya" };

export function AppTopbar() {
  const { setCommandOpen } = useWorkspace();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 md:px-4">
      <MobileNav />
      <button
        onClick={() => setCommandOpen(true)}
        className="flex h-8 w-full max-w-sm items-center gap-2 rounded-md border bg-card px-2.5 text-sm text-muted-foreground shadow-xs transition-colors hover:border-border-strong"
      >
        <Search className="size-4" />
        <span className="flex-1 truncate text-left">Cari pasien, RM, invoice…</span>
        <kbd className="hidden rounded border bg-muted px-1.5 font-mono text-[10px] sm:inline">⌘K</kbd>
      </button>
      <div className="ml-auto flex items-center gap-1">
        <QuickCreate />
        <NotificationsPopover />
        <ThemeMenu />
        <UserMenu />
      </div>
    </header>
  );
}

function QuickCreate() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Baru</span>
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/app/kalender?new=1">
              <CalendarPlus /> Janji temu <DropdownMenuShortcut>N</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/app/kalender?walkin=1">
              <Footprints /> Registrasi walk-in <DropdownMenuShortcut>W</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/app/pasien?new=1">
              <UserPlus /> Pasien baru <DropdownMenuShortcut>P</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/app/kasir?new=1">
            <CreditCard /> Invoice manual
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/app/lab?new=1">
            <FlaskConical /> Order lab gigi
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const notifIcon = {
  booking: CalendarCheck,
  payment: Wallet,
  intake: ClipboardCheck,
  lab: FlaskConical,
  wa: MessageCircle,
  system: Info,
};

function NotificationsPopover() {
  const [tab, setTab] = useState("all");
  const unread = notifications.filter((n) => n.unread).length;
  const list = tab === "unread" ? notifications.filter((n) => n.unread) : notifications;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative" aria-label={`Notifikasi (${unread} belum dibaca)`}>
          <Bell className="size-4" />
          {unread > 0 && <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-danger ring-2 ring-background" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-semibold">Notifikasi</span>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="h-7">
              <TabsTrigger value="all" className="h-5 px-2 text-xs">Semua</TabsTrigger>
              <TabsTrigger value="unread" className="h-5 px-2 text-xs">Belum dibaca · {unread}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <ul className="max-h-[420px] divide-y overflow-y-auto">
          {list.map((n) => {
            const Icon = notifIcon[n.type];
            return (
              <li key={n.id}>
                <Link href={n.href ?? "#"} className="flex gap-3 px-3 py-2.5 hover:bg-accent">
                  <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md border bg-subtle text-muted-foreground">
                    <Icon className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-medium">{n.title}</span>
                      {n.unread && <span className="size-1.5 shrink-0 rounded-full bg-brand" />}
                    </span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">{n.body}</span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground/80">{n.time}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between border-t px-3 py-2">
          <button className="text-xs text-muted-foreground hover:text-foreground">Tandai semua dibaca</button>
          <Link href="/app/pengaturan/notifikasi" className="text-xs text-brand-ink hover:underline">
            Atur notifikasi
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ThemeMenu() {
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Tema tampilan">
          <Sun className="size-4 dark:hidden" />
          <Moon className="hidden size-4 dark:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light"><Sun /> Terang</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark"><Moon /> Gelap</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system"><Monitor /> Ikuti sistem</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu() {
  const { role, setRole, mode } = useWorkspace();
  const user = getStaff(roleUser[role])!;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="ml-1 flex items-center gap-2 rounded-md p-1 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
        <PersonAvatar name={user.fullName} size="sm" color={user.role === "NURSE" || user.role === "CASHIER" ? undefined : user.color} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="text-sm font-medium">{user.displayName}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
          <div className="mt-1.5 inline-flex rounded border bg-muted px-1.5 text-[11px] text-muted-foreground">
            {mode === "SOLO" ? "Dokter Praktik Mandiri" : roleLabel[role]}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/app/pengaturan/profil"><UserRound /> Profil & SIP/STR</Link>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={mode === "SOLO"}>
            <Keyboard className="size-4 text-muted-foreground" /> Lihat sebagai peran
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Pratinjau RBAC (demo)</DropdownMenuLabel>
            {(Object.keys(roleLabel) as Role[]).map((r) => (
              <DropdownMenuItem key={r} onSelect={() => setRole(r)}>
                <span className="flex-1">{roleLabel[r]}</span>
                {r === role && <Check className="size-4 text-brand" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem asChild>
          <Link href="/app/pengaturan/langganan"><CreditCard /> Langganan & tagihan</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/masuk"><LogOut /> Keluar</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileNav() {
  const pathname = usePathname();
  const { role, mode } = useWorkspace();
  const groups = filterNav(navGroups, role, mode);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Buka menu">
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetTitle className="flex h-14 items-center border-b px-4">
          <Logo />
        </SheetTitle>
        <nav className="space-y-4 p-3">
          {groups.map((g) => (
            <div key={g.label}>
              <div className="px-2 pb-1 text-[11px] font-medium text-muted-foreground uppercase">{g.label}</div>
              {g.items.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  className={cn(
                    "flex h-9 items-center gap-2.5 rounded-md px-2 text-sm",
                    (i.href === "/app" ? pathname === "/app" : pathname.startsWith(i.href)) ? "bg-accent font-medium" : "text-foreground/75",
                  )}
                >
                  <i.icon className="size-4 text-muted-foreground" /> {i.title}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
