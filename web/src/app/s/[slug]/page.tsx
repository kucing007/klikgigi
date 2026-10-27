"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutTemplate, SlidersHorizontal } from "lucide-react";
import {
  CLINIC_TEMPLATES,
  type ClinicTemplateId,
  ClinicTemplateRenderer,
  useClinicSiteConfig,
} from "@/components/clinic-site/clinic-template-renderer";

export default function PublicClinicLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { config, setConfig } = useClinicSiteConfig();

  const switchTemplate = (id: ClinicTemplateId) => {
    const meta = CLINIC_TEMPLATES.find((t) => t.id === id);
    setConfig((prev) => ({
      ...prev,
      templateId: id,
      primaryColor: meta ? meta.defaultAccent : prev.primaryColor,
    }));
  };

  return (
    <div className="min-h-svh flex flex-col">
      {/* Floating Studio Template Switcher Bar (for instant evaluation of all 4 templates) */}
      <div className="border-b bg-[#111418] text-white px-4 py-2 text-xs">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link
              href="/app/situs"
              className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-medium hover:bg-white/20"
            >
              <SlidersHorizontal className="size-3" /> Buka Studio Builder
            </Link>
            <span className="hidden sm:inline font-mono text-[11px] text-white/60">
              {slug}.klikgigi.id
            </span>
          </div>

          {/* 4-Template Live Switcher */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 inline-flex items-center gap-1 font-mono text-[10px] text-white/60 uppercase">
              <LayoutTemplate className="size-3" /> Template:
            </span>
            {CLINIC_TEMPLATES.map((t) => {
              const active = config.templateId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => switchTemplate(t.id)}
                  className={`rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors ${
                    active
                      ? "bg-white text-[#111418] font-semibold"
                      : "bg-white/10 text-white/75 hover:bg-white/20"
                  }`}
                >
                  {t.code} · {t.name.split(" ")[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rendered Clinic Microsite */}
      <div className="flex-1">
        <ClinicTemplateRenderer config={{ ...config, slug }} />
      </div>
    </div>
  );
}
