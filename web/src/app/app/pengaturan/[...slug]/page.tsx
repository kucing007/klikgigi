"use client";

import { use } from "react";
import { SettingsWorkspace } from "../page";

export default function SettingsSubPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = use(params);
  const first = slug?.[0] ?? "langganan";
  const tabMap: Record<string, string> = {
    langganan: "langganan",
    lokasi: "lokasi",
    layanan: "layanan",
    profil: "tim",
    notifikasi: "langganan",
  };
  return <SettingsWorkspace defaultTab={tabMap[first] ?? "langganan"} />;
}
