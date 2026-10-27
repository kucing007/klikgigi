import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FlaskConical,
  Globe,
  HandCoins,
  LayoutDashboard,
  MessageCircle,
  Package,
  Settings,
  Users,
  Armchair,
  type LucideIcon,
} from "lucide-react";
import type { Role, TenantMode } from "@/lib/types";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  roles?: Role[]; // undefined = all roles
  modes?: TenantMode[]; // undefined = all modes
  soloTitle?: string;
  shortcut?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Operasional",
    items: [
      { title: "Beranda", soloTitle: "Praktik Hari Ini", href: "/app", icon: LayoutDashboard, shortcut: "G H" },
      { title: "Kalender Kursi", soloTitle: "Jadwal", href: "/app/kalender", icon: CalendarDays, badge: "12", shortcut: "G K" },
      { title: "Antrean", href: "/app/antrean", icon: Armchair, badge: "3", modes: ["CLINIC"], roles: ["OWNER", "CASHIER", "NURSE", "DOCTOR"] },
      { title: "Pasien", href: "/app/pasien", icon: Users, shortcut: "G P" },
      { title: "Kasir", href: "/app/kasir", icon: CreditCard, badge: "2", roles: ["OWNER", "CASHIER"], shortcut: "G B" },
    ],
  },
  {
    label: "Klinis",
    items: [
      { title: "Rencana Perawatan", href: "/app/rencana", icon: ClipboardList, roles: ["OWNER", "DOCTOR", "NURSE", "CASHIER"] },
      { title: "Order Lab Gigi", href: "/app/lab", icon: FlaskConical, badge: "1", roles: ["OWNER", "DOCTOR", "NURSE"] },
      { title: "Inventori BMHP", href: "/app/inventori", icon: Package, roles: ["OWNER", "NURSE"] },
    ],
  },
  {
    label: "Pertumbuhan",
    items: [
      { title: "Landing Page", soloTitle: "Situs Saya", href: "/app/situs", icon: Globe, roles: ["OWNER"] },
      { title: "WhatsApp & Recall", href: "/app/crm", icon: MessageCircle, roles: ["OWNER", "CASHIER"] },
    ],
  },
  {
    label: "Keuangan",
    items: [
      { title: "Komisi Dokter", soloTitle: "Pendapatan Saya", href: "/app/komisi", icon: HandCoins, roles: ["OWNER", "DOCTOR"] },
      { title: "Laporan", href: "/app/laporan", icon: BarChart3, roles: ["OWNER"] },
    ],
  },
];

export const settingsNav: NavItem = { title: "Pengaturan", href: "/app/pengaturan", icon: Settings, roles: ["OWNER"] };

export function filterNav(groups: NavGroup[], role: Role, mode: TenantMode) {
  return groups
    .map((g) => ({
      ...g,
      items: g.items
        .filter((i) => (mode === "SOLO" ? !i.modes || i.modes.includes("SOLO") : !i.modes || i.modes.includes(mode)))
        .filter((i) => mode === "SOLO" || !i.roles || i.roles.includes(role))
        .map((i) => ({ ...i, title: mode === "SOLO" && i.soloTitle ? i.soloTitle : i.title })),
    }))
    .filter((g) => g.items.length > 0);
}

export const roleLabel: Record<Role, string> = {
  OWNER: "Owner / Admin",
  DOCTOR: "Dokter Gigi",
  NURSE: "Perawat Gigi",
  CASHIER: "Resepsionis / Kasir",
};
