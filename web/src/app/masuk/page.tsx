"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/logo";
import { useWorkspace } from "@/lib/store/workspace";
import { roleLabel } from "@/components/app-shell/nav-config";
import type { Role } from "@/lib/types";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { setRole, setMode } = useWorkspace();

  const quickLogin = (role: Role, mode: "SOLO" | "CLINIC" = "CLINIC") => {
    setRole(role);
    setMode(mode);
    toast.success(`Masuk sebagai ${mode === "SOLO" ? "Dokter Praktik Mandiri" : roleLabel[role]}`);
    router.push("/app");
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-subtle/40 px-4 py-10">
      <div className="w-full max-w-sm space-y-5">
        <div className="flex justify-between items-center">
          <Link href="/">
            <Logo withTld />
          </Link>
          <Link href="/onboarding" className="text-xs font-medium text-brand-ink hover:underline">
            Daftar Gratis →
          </Link>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4 text-xs">
          <div>
            <h1 className="text-base font-bold">Masuk ke KlikGigi</h1>
            <p className="text-muted-foreground">
              Gunakan akun email klinik atau pilih akses cepat peran RBAC di bawah untuk demo.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs">Email</Label>
              <Input defaultValue="budi@senyumsehat.id" className="mt-1 h-9 text-xs" />
            </div>
            <div>
              <Label className="text-xs">Kata Sandi</Label>
              <Input type="password" defaultValue="••••••••••••" className="mt-1 h-9 text-xs" />
            </div>
            <Button className="w-full" onClick={() => quickLogin("OWNER", "CLINIC")}>
              Masuk ke Dashboard <ArrowRight className="size-3.5" />
            </Button>
          </div>

          <div className="border-t pt-3 space-y-1.5">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase">
              Akses Cepat Pratinjau Peran (RBAC Demo)
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Button variant="outline" size="xs" onClick={() => quickLogin("OWNER", "CLINIC")}>
                Owner / Super Admin
              </Button>
              <Button variant="outline" size="xs" onClick={() => quickLogin("OWNER", "SOLO")}>
                Dokter Mandiri (Solo)
              </Button>
              <Button variant="outline" size="xs" onClick={() => quickLogin("DOCTOR", "CLINIC")}>
                Dokter Associate
              </Button>
              <Button variant="outline" size="xs" onClick={() => quickLogin("CASHIER", "CLINIC")}>
                Resepsionis / Kasir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
