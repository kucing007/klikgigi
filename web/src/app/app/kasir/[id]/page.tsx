"use client";

import { use } from "react";
import { CashierWorkspace } from "../page";

export default function CashierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <CashierWorkspace initialId={id} />;
}
