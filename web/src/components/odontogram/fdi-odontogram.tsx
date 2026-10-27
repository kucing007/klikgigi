"use client";

import React, { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Edit3,
  Info,
  RotateCcw,
  Settings,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkspace } from "@/lib/store/workspace";
import { TODAY } from "@/lib/data";
import { rupiah } from "@/lib/format";
import type { ChartData, Surface, ToothState } from "@/lib/types";
import { toast } from "sonner";

/* ============================================================================
   ZERMMI ODONTOGRAM ENGINE (Reverse-Engineered & Adapted for KlikGigi.id)
   Reference: https://www.zermmi.com/en/perioapp?tab=odontogram
   ============================================================================ */

export type ZermmiMode = "historical" | "planned" | "completed";
export type ZermmiToothStatus = "present" | "missing" | "pontic" | "implant";
export type ZermmiTreatmentKind =
  | "surface_dot"
  | "surface_fill"
  | "surface_hatch"
  | "crown"
  | "root_canal"
  | "extraction";

export interface ZermmiTreatmentDef {
  id: string;
  label: string;
  idLabel: string;
  code: string;
  kind: ZermmiTreatmentKind;
  finding: boolean;
  defaultServiceId: string;
  conditionCode: string;
}

export interface ZermmiMark {
  id: string;
  treatmentId: string;
  mode: ZermmiMode | null; // null for findings like Caries
  surface: Surface | null; // null for whole-tooth treatments (Crown, Root canal, Extraction)
  performedOn: string;
  author: string;
  serviceId: string;
}

export interface OdontogramActionPayload {
  tooth: number;
  surfaces: Surface[];
  conditionCode: string;
  conditionLabel: string;
  serviceId: string;
  mode: "NOW" | "PLAN";
}

// Zermmi exact color tokens ($l, G_, $le, zle, UQe, QQe)
export const ZERMMI_MODE_COLORS: Record<ZermmiMode, string> = {
  historical: "#888888", // Existing
  planned: "#22C55E",    // Planned
  completed: "#007BFF",  // Completed
};
export const ZERMMI_FINDING_COLOR = "#DC2626"; // Caries red
const ZERMMI_STROKE = "#94A3B8";
const ZERMMI_SURFACE_BG = "#FFFFFF";
const ZERMMI_CENTER_BG = "#F7F7F7";
const ZERMMI_HOVER_BG = "#E2E8F0";
const ZERMMI_ACTIVE_TINT_OPACITY = 0.12;

const ADULT_UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const ADULT_LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

const PED_UPPER = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
const PED_LOWER = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

const FDI_TO_UNIVERSAL: Record<number, string> = {
  18: "1", 17: "2", 16: "3", 15: "4", 14: "5", 13: "6", 12: "7", 11: "8",
  21: "9", 22: "10", 23: "11", 24: "12", 25: "13", 26: "14", 27: "15", 28: "16",
  38: "17", 37: "18", 36: "19", 35: "20", 34: "21", 33: "22", 32: "23", 31: "24",
  41: "25", 42: "26", 43: "27", 44: "28", 45: "29", 46: "30", 47: "31", 48: "32",
};

export const DEFAULT_ZERMMI_CATALOG: ZermmiTreatmentDef[] = [
  {
    id: "caries",
    label: "Caries",
    idLabel: "Karies",
    code: "K02.1",
    kind: "surface_dot",
    finding: true,
    defaultServiceId: "sv_komposit2",
    conditionCode: "CARIES_DENTIN",
  },
  {
    id: "filling",
    label: "Filling",
    idLabel: "Tambalan Komposit",
    code: "RST-02",
    kind: "surface_fill",
    finding: false,
    defaultServiceId: "sv_komposit2",
    conditionCode: "RESTORATION_COMPOSITE",
  },
  {
    id: "inlay",
    label: "Inlay / Veneer",
    idLabel: "Inlay / Veneer",
    code: "EST-02",
    kind: "surface_hatch",
    finding: false,
    defaultServiceId: "sv_veneer",
    conditionCode: "RESTORATION_COMPOSITE",
  },
  {
    id: "crown",
    label: "Crown",
    idLabel: "Crown / Mahkota",
    code: "PRS-01",
    kind: "crown",
    finding: false,
    defaultServiceId: "sv_crown",
    conditionCode: "CROWN_PFM",
  },
  {
    id: "root_canal",
    label: "Root canal",
    idLabel: "Saluran Akar (PSA)",
    code: "END-01",
    kind: "root_canal",
    finding: false,
    defaultServiceId: "sv_psa1",
    conditionCode: "PULPITIS",
  },
  {
    id: "extraction",
    label: "Extraction",
    idLabel: "Cabut / Ekstraksi",
    code: "EKS-01",
    kind: "extraction",
    finding: false,
    defaultServiceId: "sv_cabut",
    conditionCode: "RADIX",
  },
];

const WHOLE_TOOTH_KINDS = new Set<ZermmiTreatmentKind>([
  "crown",
  "root_canal",
  "extraction",
]);

export function isWholeToothKind(kind: ZermmiTreatmentKind): boolean {
  return WHOLE_TOOTH_KINDS.has(kind);
}

/* ============================================================================
   EXACT ZERMMI 52x52 GEOMETRY HELPERS (ZQe, t7e, n7e, XQe, QL)
   ============================================================================ */

type ZoneKey = "top" | "bottom" | "center" | "left" | "right";
const ZONES: ZoneKey[] = ["top", "bottom", "center", "left", "right"];

// Exact 52x52 SVG paths extracted from Zermmi's ZQe(52) generator
const ZERMMI_PATHS_52 = {
  top: "M6.93,4.01 Q6.52,3.60 7.10,3.60 L44.90,3.60 Q45.48,3.60 45.07,4.01 L37.61,11.46 Q37.20,11.88 36.62,11.88 L15.38,11.88 Q14.80,11.88 14.39,11.46 Z",
  bottom:
    "M45.07,47.99 Q45.48,48.40 44.90,48.40 L7.10,48.40 Q6.52,48.40 6.93,47.99 L14.39,40.54 Q14.80,40.12 15.38,40.12 L36.62,40.12 Q37.20,40.12 37.61,40.54 Z",
  left: "M4.01,45.07 Q3.60,45.48 3.60,44.90 L3.60,7.10 Q3.60,6.52 4.01,6.93 L11.46,14.39 Q11.88,14.80 11.88,15.38 L11.88,36.62 Q11.88,37.20 11.46,37.61 Z",
  right:
    "M47.99,6.93 Q48.40,6.52 48.40,7.10 L48.40,44.90 Q48.40,45.48 47.99,45.07 L40.54,37.61 Q40.12,37.20 40.12,36.62 L40.12,15.38 Q40.12,14.80 40.54,14.39 Z",
  center: {
    x: 14.8,
    y: 14.8,
    width: 22.4,
    height: 22.4,
    rx: 1.05,
  },
};

// Hit target zones from Zermmi t7e(52)
const ZERMMI_HIT_RECTS_52: Record<
  ZoneKey,
  { x: number; y: number; width: number; height: number }
> = {
  left: { x: 0, y: 0, width: 15.6, height: 52 },
  right: { x: 36.4, y: 0, width: 15.6, height: 52 },
  top: { x: 15.6, y: 0, width: 20.8, height: 15.6 },
  bottom: { x: 15.6, y: 36.4, width: 20.8, height: 15.6 },
  center: { x: 15.6, y: 15.6, width: 20.8, height: 20.8 },
};

// Dot centroids from Zermmi n7e(zone, 52)
const ZERMMI_DOT_CENTROIDS_52: Record<ZoneKey, { x: number; y: number }> = {
  top: { x: 26, y: 7.74 },
  bottom: { x: 26, y: 44.26 },
  left: { x: 7.74, y: 26 },
  right: { x: 44.26, y: 26 },
  center: { x: 26, y: 26 },
};

// Anatomical mapping of SVG zones to FDI surfaces (Zermmi QL(toothCode))
function getZoneToSurfaceMap(tooth: number): Record<ZoneKey, Surface> {
  const quadrant = Math.floor(tooth / 10);
  const isRightQuadrant = quadrant === 1 || quadrant === 4 || quadrant === 5 || quadrant === 8;
  const isLowerArch = quadrant === 3 || quadrant === 4 || quadrant === 7 || quadrant === 8;

  return {
    top: isLowerArch ? "L" : "B",
    bottom: isLowerArch ? "B" : "L",
    center: "O",
    left: isRightQuadrant ? "D" : "M",
    right: isRightQuadrant ? "M" : "D",
  };
}

function getSurfaceDisplayName(surface: Surface, tooth: number): string {
  const quadrant = Math.floor(tooth / 10);
  const pos = tooth % 10;
  const isUpper = quadrant === 1 || quadrant === 2 || quadrant === 5 || quadrant === 6;
  const isAnterior = pos >= 1 && pos <= 3;

  switch (surface) {
    case "M":
      return "Mesial (M)";
    case "D":
      return "Distal (D)";
    case "O":
      return isAnterior ? "Incisal (I/O)" : "Occlusal (O)";
    case "B":
      return isAnterior ? "Labial (B)" : "Buccal (B)";
    case "L":
      return isUpper ? "Palatal (P)" : "Lingual (L)";
  }
}

/* ============================================================================
   ZERMMI TREATMENT ICON (i4 component from Zermmi bundle)
   ============================================================================ */

export function ZermmiTreatmentIcon({
  kind,
  color,
  size = 15,
}: {
  kind: ZermmiTreatmentKind;
  color: string;
  size?: number;
}) {
  const r = size;
  const i = r * 0.06;
  const a = r - i * 2;
  const s = r * 0.16;
  const o = Math.max(0.5, r * 0.032);
  const l = Math.max(1.25, r * 0.085);

  return (
    <svg
      width={r}
      height={r}
      viewBox={`0 0 ${r} ${r}`}
      aria-hidden="true"
      className="shrink-0"
    >
      {kind === "surface_fill" && (
        <rect x={i} y={i} width={a} height={a} rx={s} fill={color} />
      )}
      {kind === "surface_hatch" && (
        <rect
          x={i}
          y={i}
          width={a}
          height={a}
          rx={s}
          fill={color}
          fillOpacity={0.3}
          stroke={color}
          strokeWidth={o * 1.9}
        />
      )}
      {kind === "surface_dot" && (
        <>
          <rect
            x={i}
            y={i}
            width={a}
            height={a}
            rx={s}
            fill={ZERMMI_SURFACE_BG}
            stroke={ZERMMI_STROKE}
            strokeWidth={o}
          />
          <circle cx={r / 2} cy={r / 2} r={r * 0.155} fill={color} />
        </>
      )}
      {kind === "crown" && (
        <rect
          x={i}
          y={i}
          width={a}
          height={a}
          rx={s}
          fill="none"
          stroke={color}
          strokeWidth={l}
        />
      )}
      {kind === "root_canal" && (
        <circle cx={r / 2} cy={r / 2} r={r * 0.2} fill={color} />
      )}
      {kind === "extraction" && (
        <g stroke={color} strokeWidth={l} strokeLinecap="round">
          <line x1={r * 0.22} y1={r * 0.22} x2={r * 0.78} y2={r * 0.78} />
          <line x1={r * 0.78} y1={r * 0.22} x2={r * 0.22} y2={r * 0.78} />
        </g>
      )}
    </svg>
  );
}

/* ============================================================================
   CONVERT INITIAL KLIKGIGI CHART DATA -> ZERMMI MARKS & STATUS
   ============================================================================ */

function buildInitialZermmiState(chart: ChartData): {
  marksByTooth: Record<number, ZermmiMark[]>;
  statusByTooth: Record<number, ZermmiToothStatus>;
} {
  const marksByTooth: Record<number, ZermmiMark[]> = {};
  const statusByTooth: Record<number, ZermmiToothStatus> = {};

  for (const [toothKey, st] of Object.entries(chart)) {
    const t = Number(toothKey);
    if (!Number.isFinite(t)) continue;

    if (st.presence === "MISSING") {
      statusByTooth[t] = "missing";
      continue;
    }

    const list: ZermmiMark[] = [];

    // Whole tooth state
    if (st.wholeCode) {
      if (st.wholeCode.startsWith("CROWN")) {
        list.push({
          id: `init_${t}_crown`,
          treatmentId: "crown",
          mode:
            st.wholeLayer === "COMPLETED"
              ? "completed"
              : st.wholeLayer === "PLANNED"
                ? "planned"
                : "historical",
          surface: null,
          performedOn: TODAY,
          author: "drg. Budi",
          serviceId: "sv_crown",
        });
      } else if (st.wholeCode.startsWith("PSA")) {
        list.push({
          id: `init_${t}_psa`,
          treatmentId: "root_canal",
          mode: st.wholeLayer === "COMPLETED" ? "completed" : "planned",
          surface: null,
          performedOn: TODAY,
          author: "drg. Budi",
          serviceId: "sv_psa2",
        });
      } else if (st.presence === "IMPACTED" || st.wholeCode.includes("IMPACTION")) {
        list.push({
          id: `init_${t}_exo`,
          treatmentId: "extraction",
          mode: "planned",
          surface: null,
          performedOn: TODAY,
          author: "drg. Andi",
          serviceId: "sv_odonte",
        });
      }
    }

    // Surface states
    if (st.surfaces) {
      for (const [surfKey, surfState] of Object.entries(st.surfaces)) {
        if (!surfState) continue;
        const s = surfKey as Surface;
        const isCaries = surfState.code.startsWith("CARIES");

        if (isCaries) {
          list.push({
            id: `init_${t}_${s}_caries`,
            treatmentId: "caries",
            mode: null,
            surface: s,
            performedOn: TODAY,
            author: "drg. Budi",
            serviceId: "sv_komposit2",
          });
        } else {
          const mode: ZermmiMode =
            surfState.layer === "COMPLETED"
              ? "completed"
              : surfState.layer === "PLANNED" || surfState.layer === "PATHOLOGY"
                ? "planned"
                : "historical";
          list.push({
            id: `init_${t}_${s}_fill`,
            treatmentId: "filling",
            mode,
            surface: s,
            performedOn: TODAY,
            author: "drg. Budi",
            serviceId: "sv_komposit2",
          });
        }
      }
    }

    if (list.length > 0) {
      marksByTooth[t] = list;
    }
  }

  return { marksByTooth, statusByTooth };
}

/* ============================================================================
   MAIN ZERMMI ODONTOGRAM COMPONENT
   ============================================================================ */

export function FdiOdontogram({
  chart,
  dentition,
  selectedTooth,
  onSelectTooth,
  onApplyAction,
  onResetTooth,
  presentationMode = false,
  compact = false,
}: {
  chart: ChartData;
  dentition: "ADULT" | "PEDIATRIC";
  selectedTooth: number;
  onSelectTooth: (t: number) => void;
  onApplyAction: (payload: OdontogramActionPayload) => void;
  onResetTooth?: (tooth: number) => void;
  presentationMode?: boolean;
  compact?: boolean;
}) {
  const { services } = useWorkspace();

  const initial = useMemo(() => buildInitialZermmiState(chart), [chart]);
  const [marksByTooth, setMarksByTooth] = useState<Record<number, ZermmiMark[]>>(
    () => initial.marksByTooth,
  );
  const [statusByTooth, setStatusByTooth] = useState<Record<number, ZermmiToothStatus>>(
    () => initial.statusByTooth,
  );
  const [catalog, setCatalog] = useState<ZermmiTreatmentDef[]>(DEFAULT_ZERMMI_CATALOG);

  // Active Zermmi Brush state
  const [activeMode, setActiveMode] = useState<ZermmiMode>("completed");
  const [activeTreatmentId, setActiveTreatmentId] = useState<string>("filling");
  const [numberingSystem, setNumberingSystem] = useState<"FDI" | "UNIVERSAL">("FDI");

  // Modals
  const [customiseOpen, setCustomiseOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<{
    tooth: number;
    treatmentId: string;
    mode: ZermmiMode | null;
    surfaces: Surface[];
    performedOn: string;
    author: string;
    serviceId: string;
  } | null>(null);

  const activeTreatment = useMemo(
    () => catalog.find((t) => t.id === activeTreatmentId) ?? catalog[0],
    [catalog, activeTreatmentId],
  );

  const isFindingActive = activeTreatment?.finding === true;
  const effectiveMode: ZermmiMode = isFindingActive ? "historical" : activeMode;

  const upperTeeth = dentition === "ADULT" ? ADULT_UPPER : PED_UPPER;
  const lowerTeeth = dentition === "ADULT" ? ADULT_LOWER : PED_LOWER;

  const formatToothLabel = (tooth: number) => {
    if (dentition === "PEDIATRIC" || numberingSystem === "FDI") return String(tooth);
    return FDI_TO_UNIVERSAL[tooth] ?? String(tooth);
  };

  // Toggle mark on tooth surface or whole tooth (exact Zermmi koe() behavior + KlikGigi Auto-Sync)
  const handleToggleMark = (tooth: number, surface: Surface | null) => {
    onSelectTooth(tooth);
    if (presentationMode || !activeTreatment) return;

    const status = statusByTooth[tooth] ?? "present";
    if (status === "missing" || status === "pontic") {
      toast.info(`Gigi #${tooth} berstatus ${status.toUpperCase()}. Ubah ke Present terlebih dahulu.`);
      return;
    }

    const whole = isWholeToothKind(activeTreatment.kind);
    const targetSurface = whole ? null : surface ?? "O";
    const targetMode: ZermmiMode | null = activeTreatment.finding ? null : activeMode;

    const existingList = marksByTooth[tooth] ?? [];
    const matchIndex = existingList.findIndex(
      (m) =>
        m.treatmentId === activeTreatment.id &&
        m.mode === targetMode &&
        m.surface === targetSurface,
    );

    if (matchIndex !== -1) {
      // Remove mark if clicked again (exact Zermmi toggle behavior)
      const updated = existingList.filter((_, idx) => idx !== matchIndex);
      setMarksByTooth((prev) => ({
        ...prev,
        [tooth]: updated,
      }));
      toast.info(
        ` Dihapus: ${activeTreatment.idLabel} pada Gigi #${tooth}${
          targetSurface ? ` (${targetSurface})` : ""
        }`,
      );
      return;
    }

    // Add new mark
    const newMark: ZermmiMark = {
      id: `zm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      treatmentId: activeTreatment.id,
      mode: targetMode,
      surface: targetSurface,
      performedOn: TODAY,
      author: "drg. Budi",
      serviceId: activeTreatment.defaultServiceId,
    };

    setMarksByTooth((prev) => ({
      ...prev,
      [tooth]: [...(prev[tooth] ?? []), newMark],
    }));

    // Sync with KlikGigi Clinical Workspace & Cashier if Planned or Completed
    if (targetMode === "completed" || targetMode === "planned") {
      onApplyAction({
        tooth,
        surfaces: targetSurface ? [targetSurface] : ["O"],
        conditionCode: activeTreatment.conditionCode,
        conditionLabel: `${activeTreatment.idLabel} (${activeTreatment.label})`,
        serviceId: activeTreatment.defaultServiceId,
        mode: targetMode === "completed" ? "NOW" : "PLAN",
      });
    } else if (activeTreatment.finding) {
      toast.success(`Temuan Karies dicatat pada Gigi #${tooth} (${targetSurface ?? "O"})`);
    } else {
      toast.info(`Restorasi Lama (Existing) dicatat pada Gigi #${tooth} (${targetSurface ?? "O"})`);
    }
  };

  const handleToothStatusChange = (tooth: number, nextStatus: ZermmiToothStatus) => {
    onSelectTooth(tooth);
    setStatusByTooth((prev) => ({
      ...prev,
      [tooth]: nextStatus,
    }));

    if (nextStatus === "missing" || nextStatus === "pontic") {
      // Clear marks if tooth is missing/pontic, matching Zermmi warn_clears_measurements
      setMarksByTooth((prev) => {
        const copy = { ...prev };
        delete copy[tooth];
        return copy;
      });
      onResetTooth?.(tooth);
    }

    toast.success(`Status Gigi #${tooth} diubah menjadi: ${nextStatus.toUpperCase()}`);
  };

  // Build grouped procedures list (exact Zermmi Gj() procedure grouping)
  const procedureRows = useMemo(() => {
    const allTeeth = [...upperTeeth, ...lowerTeeth];
    const rows: {
      key: string;
      tooth: number;
      treatment: ZermmiTreatmentDef;
      mode: ZermmiMode | null;
      surfaces: Surface[];
      performedOn: string;
      author: string;
      serviceId: string;
    }[] = [];

    for (const t of allTeeth) {
      const marks = marksByTooth[t] ?? [];
      if (marks.length === 0) continue;

      const grouped = new Map<
        string,
        {
          treatment: ZermmiTreatmentDef;
          mode: ZermmiMode | null;
          surfaces: Surface[];
          performedOn: string;
          author: string;
          serviceId: string;
        }
      >();

      for (const m of marks) {
        const def = catalog.find((c) => c.id === m.treatmentId);
        if (!def) continue;
        const gKey = `${m.treatmentId}|${m.mode ?? "finding"}|${m.performedOn}|${m.author}`;
        const existing = grouped.get(gKey);
        if (existing) {
          if (m.surface && !existing.surfaces.includes(m.surface)) {
            existing.surfaces.push(m.surface);
          }
        } else {
          grouped.set(gKey, {
            treatment: def,
            mode: m.mode,
            surfaces: m.surface ? [m.surface] : [],
            performedOn: m.performedOn,
            author: m.author,
            serviceId: m.serviceId || def.defaultServiceId,
          });
        }
      }

      for (const [gKey, val] of grouped.entries()) {
        rows.push({
          key: `${t}|${gKey}`,
          tooth: t,
          ...val,
        });
      }
    }
    return rows;
  }, [marksByTooth, upperTeeth, lowerTeeth, catalog]);

  const handleMarkProcedureCompleted = (row: (typeof procedureRows)[number]) => {
    setMarksByTooth((prev) => {
      const list = prev[row.tooth] ?? [];
      return {
        ...prev,
        [row.tooth]: list.map((m) =>
          m.treatmentId === row.treatment.id && m.mode === row.mode
            ? { ...m, mode: "completed" as ZermmiMode }
            : m,
        ),
      };
    });

    onApplyAction({
      tooth: row.tooth,
      surfaces: row.surfaces.length > 0 ? row.surfaces : ["O"],
      conditionCode: row.treatment.conditionCode,
      conditionLabel: row.treatment.idLabel,
      serviceId: row.serviceId,
      mode: "NOW",
    });
  };

  const handleRemoveProcedureGroup = (row: (typeof procedureRows)[number]) => {
    setMarksByTooth((prev) => {
      const list = prev[row.tooth] ?? [];
      return {
        ...prev,
        [row.tooth]: list.filter(
          (m) => !(m.treatmentId === row.treatment.id && m.mode === row.mode),
        ),
      };
    });
    toast.info(`Tindakan ${row.treatment.idLabel} pada Gigi #${row.tooth} dihapus.`);
  };

  return (
    <div className="space-y-3">
      {/* ====================================================================
          1. ZERMMI PALETTE TOOLBAR CARD (HGe)
          ==================================================================== */}
      {!presentationMode && (
        <div className="space-y-2.5 rounded-lg border border-zinc-300 bg-white p-3.5 shadow-xs">
          {/* Top Row: Mode Switcher (Existing / Planned / Completed) + Numbering + Customise */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div
              role="group"
              aria-label="Treatment stage"
              className={`inline-flex h-8 shrink-0 items-center rounded-md border border-zinc-300 bg-zinc-50/70 p-0.5 ${
                isFindingActive ? "opacity-60" : ""
              }`}
            >
              {(
                [
                  { key: "historical", label: "Existing", sub: "Lama" },
                  { key: "planned", label: "Planned", sub: "Rencana" },
                  { key: "completed", label: "Completed", sub: "Selesai (Kasir)" },
                ] as { key: ZermmiMode; label: string; sub: string }[]
              ).map((m) => {
                const isSelected = effectiveMode === m.key;
                const color = ZERMMI_MODE_COLORS[m.key];
                return (
                  <button
                    key={m.key}
                    type="button"
                    disabled={isFindingActive}
                    onClick={() => setActiveMode(m.key)}
                    aria-pressed={isSelected}
                    className={`relative isolate inline-flex h-full items-center gap-1.5 rounded-sm px-2.5 text-xs whitespace-nowrap transition-colors focus-visible:outline-none ${
                      isSelected
                        ? "font-semibold text-zinc-950"
                        : "font-medium text-zinc-600 hover:text-zinc-950"
                    } ${isFindingActive ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 rounded-[inherit]"
                        style={{
                          backgroundColor: color,
                          opacity: ZERMMI_ACTIVE_TINT_OPACITY + 0.04,
                        }}
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className="inline-block size-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: color,
                        opacity: isSelected ? 1 : 0.45,
                      }}
                    />
                    <span>{m.label}</span>
                    <span className="hidden text-[10px] text-zinc-500 sm:inline">
                      · {m.sub}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {dentition === "ADULT" && (
                <div
                  role="group"
                  aria-label="Tooth numbering"
                  className="inline-flex h-8 shrink-0 items-center rounded-md border border-zinc-300 bg-zinc-50 p-0.5 text-xs"
                >
                  <button
                    type="button"
                    onClick={() => setNumberingSystem("FDI")}
                    className={`inline-flex h-full items-center rounded-sm px-2.5 font-semibold transition-colors ${
                      numberingSystem === "FDI"
                        ? "bg-white text-zinc-950 shadow-2xs"
                        : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    FDI
                  </button>
                  <button
                    type="button"
                    onClick={() => setNumberingSystem("UNIVERSAL")}
                    className={`inline-flex h-full items-center rounded-sm px-2.5 font-semibold transition-colors ${
                      numberingSystem === "UNIVERSAL"
                        ? "bg-white text-zinc-950 shadow-2xs"
                        : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    1-32
                  </button>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCustomiseOpen(true)}
                className="h-8 border-zinc-300 bg-white px-2.5 text-xs font-semibold text-zinc-900 hover:bg-zinc-100"
              >
                <Settings className="size-3.5" />
                <span>Customise</span>
              </Button>
            </div>
          </div>

          {/* Middle Row: Zermmi Treatment Brush Buttons */}
          <div role="group" aria-label="Treatment" className="flex flex-wrap gap-1.5">
            {catalog.map((item) => {
              const isSelected = item.id === activeTreatmentId;
              const brushColor = item.finding
                ? ZERMMI_FINDING_COLOR
                : ZERMMI_MODE_COLORS[activeMode];
              const linkedSrv = services.find((s) => s.id === item.defaultServiceId);

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setActiveTreatmentId(item.id)}
                  className={`relative isolate inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs transition-colors focus-visible:outline-none ${
                    isSelected
                      ? "font-semibold text-zinc-950"
                      : "border-zinc-300 bg-white font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
                  }`}
                  style={
                    isSelected
                      ? {
                          borderColor: brushColor,
                          boxShadow: `inset 0 0 0 1px ${brushColor}`,
                        }
                      : undefined
                  }
                >
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-[inherit]"
                      style={{
                        backgroundColor: brushColor,
                        opacity: ZERMMI_ACTIVE_TINT_OPACITY,
                      }}
                    />
                  )}
                  <ZermmiTreatmentIcon kind={item.kind} color={brushColor} size={15} />
                  <span>{item.label}</span>
                  <span className="hidden text-[11px] text-zinc-600 sm:inline">
                    ({item.idLabel})
                  </span>
                  {item.code && (
                    <span className="rounded bg-zinc-100 px-1 py-0.2 font-mono text-[10px] font-semibold text-zinc-700">
                      {item.code}
                    </span>
                  )}
                  {!item.finding && linkedSrv && !compact && (
                    <span className="hidden font-mono text-[10px] font-semibold text-teal-800 xl:inline">
                      · {rupiah(linkedSrv.basePrice)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Row: Contextual Zermmi Hint */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-700">
            <p>
              {isWholeToothKind(activeTreatment.kind)
                ? `Klik gigi mana saja untuk menandai ${activeTreatment.label} (${activeTreatment.idLabel}). Klik lagi untuk menghapus.`
                : `Klik permukaan gigi (M/O/D/B/P) untuk menandai ${activeTreatment.label} (${activeTreatment.idLabel}). Klik lagi untuk menghapus.`}
            </p>
            {!isFindingActive && activeMode === "completed" && (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-blue-700">
                <Sparkles className="size-3" /> Mode Completed: Otomatis masuk Tagihan Kasir
              </span>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          2. ZERMMI ODONTOGRAM ARCH CANVAS CARD (QGe + mB + j7e + JL)
          ==================================================================== */}
      <div className="rounded-lg border border-zinc-300 bg-white p-4 shadow-xs">
        <div role="note" className="mb-3 flex items-center justify-between gap-2 text-xs text-zinc-700">
          <div className="flex items-center gap-1.5">
            <Info className="size-4 shrink-0 text-zinc-600" />
            <p className="leading-snug font-medium">
              Tip: klik nomor gigi (mis. 16, 36) untuk mengubah status gigi (Present, Missing, Pontic, Implant).
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-zinc-900">
            Gigi Aktif: #{selectedTooth}
          </span>
        </div>

        <div className="overflow-x-auto pb-1">
          <div
            className="mx-auto flex w-fit flex-col py-2"
            style={{ gap: compact ? "20px" : "28px" }}
          >
            {/* UPPER ARCH (Teeth on top, Tooth Number Pills below) */}
            <ZermmiArchRow
              arch="upper"
              teeth={upperTeeth}
              marksByTooth={marksByTooth}
              statusByTooth={statusByTooth}
              catalog={catalog}
              selectedTooth={selectedTooth}
              formatToothLabel={formatToothLabel}
              onSurfaceOrToothClick={handleToggleMark}
              onToothStatusChange={handleToothStatusChange}
              onSelectTooth={onSelectTooth}
              onResetTooth={(t) => {
                setMarksByTooth((prev) => {
                  const copy = { ...prev };
                  delete copy[t];
                  return copy;
                });
                setStatusByTooth((prev) => ({ ...prev, [t]: "present" }));
                onResetTooth?.(t);
              }}
            />

            {/* LOWER ARCH (Tooth Number Pills on top, Teeth below) */}
            <ZermmiArchRow
              arch="lower"
              teeth={lowerTeeth}
              marksByTooth={marksByTooth}
              statusByTooth={statusByTooth}
              catalog={catalog}
              selectedTooth={selectedTooth}
              formatToothLabel={formatToothLabel}
              onSurfaceOrToothClick={handleToggleMark}
              onToothStatusChange={handleToothStatusChange}
              onSelectTooth={onSelectTooth}
              onResetTooth={(t) => {
                setMarksByTooth((prev) => {
                  const copy = { ...prev };
                  delete copy[t];
                  return copy;
                });
                setStatusByTooth((prev) => ({ ...prev, [t]: "present" }));
                onResetTooth?.(t);
              }}
            />
          </div>
        </div>

        {/* Zermmi Legend Footer inside Arch Card (oce) */}
        <div className="mt-4 border-t border-zinc-200 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-zinc-800">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block size-3 rounded-xs"
                  style={{ backgroundColor: ZERMMI_MODE_COLORS.historical }}
                />
                Existing (Restorasi Lama)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block size-3 rounded-xs"
                  style={{ backgroundColor: ZERMMI_MODE_COLORS.planned }}
                />
                Planned (Rencana)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block size-3 rounded-xs"
                  style={{ backgroundColor: ZERMMI_MODE_COLORS.completed }}
                />
                Completed (Selesai / Auto-Kasir)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ZermmiTreatmentIcon
                  kind="surface_dot"
                  color={ZERMMI_FINDING_COLOR}
                  size={14}
                />
                Caries (Karies)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-700">
              <span className="rounded bg-red-200 px-1.5 py-0.5 font-semibold text-red-900">
                × Missing
              </span>
              <span className="rounded bg-amber-200 px-1.5 py-0.5 font-semibold text-amber-900">
                — Pontic
              </span>
              <span className="rounded bg-blue-200 px-1.5 py-0.5 font-semibold text-blue-900">
                ⚡ Implant
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          3. ZERMMI PROCEDURES TABLE (qGe) — Live Interactive List
          ==================================================================== */}
      {!compact && (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-zinc-950">
                Procedures · Daftar Temuan &amp; Tindakan Odontogram ({procedureRows.length})
              </h3>
              <p className="text-xs text-zinc-600">
                Klik tombol centang (✓) pada tindakan Planned untuk menyelesaikan &amp; mengirim otomatis ke Kasir.
              </p>
            </div>
          </div>

          {procedureRows.length === 0 ? (
            <p className="mt-3 text-xs text-zinc-600">
              Belum ada tindakan yang ditandai. Pilih jenis perawatan di atas lalu klik permukaan gigi.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-[11px] font-semibold tracking-wide text-zinc-600 uppercase">
                    <th className="w-16 py-2 pr-3">Tooth</th>
                    <th className="w-24 py-2 px-3">Surfaces</th>
                    <th className="py-2 px-3">Treatment</th>
                    <th className="w-28 py-2 px-3">State</th>
                    <th className="hidden w-24 py-2 px-3 md:table-cell">Code</th>
                    <th className="w-32 py-2 px-3">Tarif Kasir</th>
                    <th className="hidden w-28 py-2 px-3 sm:table-cell">By</th>
                    {!presentationMode && <th className="w-28 py-2 pl-3 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {procedureRows.map((row) => {
                    const srv = services.find((s) => s.id === row.serviceId);
                    const stateColor = row.treatment.finding
                      ? ZERMMI_FINDING_COLOR
                      : row.mode
                        ? ZERMMI_MODE_COLORS[row.mode]
                        : ZERMMI_MODE_COLORS.historical;
                    const stateLabel = row.treatment.finding
                      ? "Finding (Karies)"
                      : row.mode === "completed"
                        ? "Completed"
                        : row.mode === "planned"
                          ? "Planned"
                          : "Existing";

                    return (
                      <tr key={row.key} className="hover:bg-zinc-50/80">
                        <td className="py-2.5 pr-3 font-mono font-bold text-zinc-950">
                          #{formatToothLabel(row.tooth)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-zinc-800">
                          {row.surfaces.length > 0 ? row.surfaces.join(", ") : "Whole"}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2 font-semibold text-zinc-950">
                            <ZermmiTreatmentIcon
                              kind={row.treatment.kind}
                              color={stateColor}
                              size={15}
                            />
                            <span>{row.treatment.label}</span>
                            <span className="text-zinc-600 font-normal">
                              ({row.treatment.idLabel})
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                            style={{
                              backgroundColor: `${stateColor}18`,
                              color: stateColor,
                            }}
                          >
                            <span
                              className="size-1.5 rounded-full"
                              style={{ backgroundColor: stateColor }}
                            />
                            {stateLabel}
                          </span>
                        </td>
                        <td className="hidden py-2.5 px-3 font-mono text-zinc-700 md:table-cell">
                          {row.treatment.code || "—"}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-zinc-900">
                          {row.treatment.finding
                            ? "—"
                            : srv
                              ? rupiah(srv.basePrice)
                              : "—"}
                        </td>
                        <td className="hidden py-2.5 px-3 text-zinc-700 sm:table-cell">
                          {row.author}
                        </td>
                        {!presentationMode && (
                          <td className="py-2 pl-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {(row.mode === "planned" || row.treatment.finding) && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon-xs"
                                  title="Tandai Selesai & Kirim ke Kasir"
                                  onClick={() => handleMarkProcedureCompleted(row)}
                                  className="border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                                >
                                  <Check className="size-3.5" />
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                title="Edit Prosedur"
                                onClick={() =>
                                  setEditingGroup({
                                    tooth: row.tooth,
                                    treatmentId: row.treatment.id,
                                    mode: row.mode,
                                    surfaces: row.surfaces,
                                    performedOn: row.performedOn,
                                    author: row.author,
                                    serviceId: row.serviceId,
                                  })
                                }
                              >
                                <Edit3 className="size-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                title="Hapus"
                                onClick={() => handleRemoveProcedureGroup(row)}
                                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          4. ZERMMI CUSTOMISE CATALOG DIALOG (VGe)
          ==================================================================== */}
      <Dialog open={customiseOpen} onOpenChange={setCustomiseOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Customise · Katalog Kode &amp; Layanan Odontogram</DialogTitle>
            <DialogDescription>
              Sesuaikan kode ICD/prosedur dan layanan tarif Kasir untuk setiap tombol perawatan Odontogram.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 py-2">
            {catalog.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 items-center gap-2 rounded-md border border-zinc-200 p-2 text-xs"
              >
                <div className="col-span-5 flex items-center gap-2 font-semibold text-zinc-900">
                  <ZermmiTreatmentIcon
                    kind={item.kind}
                    color={
                      item.finding ? ZERMMI_FINDING_COLOR : ZERMMI_MODE_COLORS.completed
                    }
                    size={18}
                  />
                  <div className="truncate">
                    <div>{item.label}</div>
                    <div className="text-[10px] font-normal text-zinc-600">
                      {item.idLabel}
                    </div>
                  </div>
                </div>

                <div className="col-span-3">
                  <Input
                    value={item.code}
                    placeholder="Kode"
                    maxLength={12}
                    onChange={(e) =>
                      setCatalog((prev) =>
                        prev.map((c) =>
                          c.id === item.id ? { ...c, code: e.target.value } : c,
                        ),
                      )
                    }
                    className="h-8 font-mono text-xs"
                  />
                </div>

                <div className="col-span-4">
                  <select
                    value={item.defaultServiceId}
                    onChange={(e) =>
                      setCatalog((prev) =>
                        prev.map((c) =>
                          c.id === item.id
                            ? { ...c, defaultServiceId: e.target.value }
                            : c,
                        ),
                      )
                    }
                    className="h-8 w-full rounded-md border border-zinc-300 bg-white px-2 text-[11px] font-medium text-zinc-900"
                  >
                    {services.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.laymanName} ({rupiah(srv.basePrice)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setCatalog(DEFAULT_ZERMMI_CATALOG);
                toast.info("Katalog dikembalikan ke pengaturan awal");
              }}
            >
              Reset Default
            </Button>
            <Button type="button" size="sm" onClick={() => setCustomiseOpen(false)}>
              Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====================================================================
          5. ZERMMI EDIT PROCEDURE DIALOG (zGe)
          ==================================================================== */}
      <Dialog
        open={editingGroup !== null}
        onOpenChange={(o) => !o && setEditingGroup(null)}
      >
        <DialogContent className="sm:max-w-md">
          {editingGroup && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Edit Prosedur — Gigi #{formatToothLabel(editingGroup.tooth)}
                </DialogTitle>
                <DialogDescription>
                  Ubah jenis perawatan, status (Existing / Planned / Completed), permukaan gigi, atau tarif layanan.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                <div className="space-y-1.5">
                  <div className="font-semibold text-zinc-700">Treatment</div>
                  <div className="flex flex-wrap gap-1.5">
                    {catalog.map((c) => {
                      const active = c.id === editingGroup.treatmentId;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() =>
                            setEditingGroup({
                              ...editingGroup,
                              treatmentId: c.id,
                              mode: c.finding ? null : editingGroup.mode ?? "planned",
                              serviceId: c.defaultServiceId,
                            })
                          }
                          className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 font-semibold transition-colors ${
                            active
                              ? "border-zinc-950 bg-zinc-950 text-white"
                              : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100"
                          }`}
                        >
                          <ZermmiTreatmentIcon
                            kind={c.kind}
                            color={
                              c.finding
                                ? ZERMMI_FINDING_COLOR
                                : ZERMMI_MODE_COLORS[editingGroup.mode ?? "completed"]
                            }
                            size={14}
                          />
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {editingGroup.mode !== null && (
                  <div className="space-y-1.5">
                    <div className="font-semibold text-zinc-700">State</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["historical", "planned", "completed"] as ZermmiMode[]).map(
                        (m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() =>
                              setEditingGroup({ ...editingGroup, mode: m })
                            }
                            className={`flex h-8 items-center justify-center gap-1.5 rounded-md border font-semibold capitalize ${
                              editingGroup.mode === m
                                ? "border-zinc-950 bg-zinc-100 text-zinc-950"
                                : "border-zinc-300 bg-white text-zinc-700"
                            }`}
                          >
                            <span
                              className="size-2 rounded-full"
                              style={{ backgroundColor: ZERMMI_MODE_COLORS[m] }}
                            />
                            {m === "historical" ? "Existing" : m}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="font-semibold text-zinc-700">Permukaan Gigi (Surfaces)</div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(["M", "O", "D", "B", "L"] as Surface[]).map((sf) => {
                      const active = editingGroup.surfaces.includes(sf);
                      return (
                        <button
                          key={sf}
                          type="button"
                          onClick={() => {
                            const next = active
                              ? editingGroup.surfaces.filter((x) => x !== sf)
                              : [...editingGroup.surfaces, sf];
                            setEditingGroup({
                              ...editingGroup,
                              surfaces: next.length > 0 ? next : [sf],
                            });
                          }}
                          className={`h-9 rounded-md border font-mono font-bold ${
                            active
                              ? "border-zinc-950 bg-zinc-950 text-white"
                              : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100"
                          }`}
                        >
                          {sf}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingGroup(null)}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const def =
                      catalog.find((c) => c.id === editingGroup.treatmentId) ??
                      catalog[0];
                    const whole = isWholeToothKind(def.kind);
                    setMarksByTooth((prev) => {
                      const others = (prev[editingGroup.tooth] ?? []).filter(
                        (m) => m.treatmentId !== editingGroup.treatmentId,
                      );
                      const targets = whole ? [null] : editingGroup.surfaces;
                      const added: ZermmiMark[] = targets.map((s, i) => ({
                        id: `zm_edit_${Date.now()}_${i}`,
                        treatmentId: def.id,
                        mode: def.finding ? null : editingGroup.mode ?? "completed",
                        surface: s,
                        performedOn: editingGroup.performedOn,
                        author: editingGroup.author,
                        serviceId: editingGroup.serviceId,
                      }));
                      return {
                        ...prev,
                        [editingGroup.tooth]: [...others, ...added],
                      };
                    });
                    setEditingGroup(null);
                    toast.success(`Prosedur Gigi #${editingGroup.tooth} diperbarui`);
                  }}
                >
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============================================================================
   ZERMMI ARCH ROW (mB + JL + B7e + j7e)
   ============================================================================ */

function ZermmiArchRow({
  arch,
  teeth,
  marksByTooth,
  statusByTooth,
  catalog,
  selectedTooth,
  formatToothLabel,
  onSurfaceOrToothClick,
  onToothStatusChange,
  onSelectTooth,
  onResetTooth,
}: {
  arch: "upper" | "lower";
  teeth: number[];
  marksByTooth: Record<number, ZermmiMark[]>;
  statusByTooth: Record<number, ZermmiToothStatus>;
  catalog: ZermmiTreatmentDef[];
  selectedTooth: number;
  formatToothLabel: (t: number) => string;
  onSurfaceOrToothClick: (tooth: number, surface: Surface | null) => void;
  onToothStatusChange: (tooth: number, status: ZermmiToothStatus) => void;
  onSelectTooth: (tooth: number) => void;
  onResetTooth: (tooth: number) => void;
}) {
  const half = teeth.length / 2;
  const rightQuadrant = teeth.slice(0, half);
  const leftQuadrant = teeth.slice(half);

  const svgRow = (
    <div
      className="flex flex-row justify-center"
      style={{ height: "52px", gap: "20px" }}
    >
      <div className="flex flex-row">
        {rightQuadrant.map((t) => (
          <div
            key={t}
            className="flex shrink-0 justify-center"
            style={{ width: "56px" }}
          >
            <ZermmiToothSvg
              tooth={t}
              marks={marksByTooth[t] ?? []}
              status={statusByTooth[t] ?? "present"}
              catalog={catalog}
              selected={selectedTooth === t}
              onSurfaceClick={(s) => onSurfaceOrToothClick(t, s)}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-row">
        {leftQuadrant.map((t) => (
          <div
            key={t}
            className="flex shrink-0 justify-center"
            style={{ width: "56px" }}
          >
            <ZermmiToothSvg
              tooth={t}
              marks={marksByTooth[t] ?? []}
              status={statusByTooth[t] ?? "present"}
              catalog={catalog}
              selected={selectedTooth === t}
              onSurfaceClick={(s) => onSurfaceOrToothClick(t, s)}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const numberPillRow = (
    <div
      className="flex flex-row justify-center"
      style={{ height: "24px", gap: "20px" }}
    >
      {[rightQuadrant, leftQuadrant].map((quad, qIdx) => (
        <div key={qIdx} className="flex flex-row">
          {quad.map((t) => {
            const st = statusByTooth[t] ?? "present";
            const isSelected = selectedTooth === t;
            return (
              <div
                key={t}
                className="flex items-center justify-center"
                style={{ width: "56px", height: "24px" }}
              >
                <ZermmiToothStatusPopover
                  tooth={t}
                  label={formatToothLabel(t)}
                  currentStatus={st}
                  isSelected={isSelected}
                  onSelectStatus={(next) => onToothStatusChange(t, next)}
                  onSelectTooth={() => onSelectTooth(t)}
                  onResetTooth={() => onResetTooth(t)}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-1.5">
      {arch === "upper" ? (
        <>
          {svgRow}
          {numberPillRow}
        </>
      ) : (
        <>
          {numberPillRow}
          {svgRow}
        </>
      )}
    </div>
  );
}

/* ============================================================================
   ZERMMI TOOTH NUMBER PILL & STATUS POPOVER (B7e & N7e)
   ============================================================================ */

function ZermmiToothStatusPopover({
  tooth,
  label,
  currentStatus,
  isSelected,
  onSelectStatus,
  onSelectTooth,
  onResetTooth,
}: {
  tooth: number;
  label: string;
  currentStatus: ZermmiToothStatus;
  isSelected: boolean;
  onSelectStatus: (s: ZermmiToothStatus) => void;
  onSelectTooth: () => void;
  onResetTooth: () => void;
}) {
  const [open, setOpen] = useState(false);

  // Exact Zermmi N7e(status) chip styles
  const pillStyle =
    currentStatus === "missing"
      ? "bg-red-200 text-red-900 hover:bg-red-300"
      : currentStatus === "pontic"
        ? "bg-amber-200 text-amber-900 hover:bg-amber-300"
        : currentStatus === "implant"
          ? "bg-blue-200 text-blue-900 hover:bg-blue-300"
          : isSelected
            ? "bg-zinc-950 text-white ring-2 ring-teal-600/50"
            : "bg-zinc-900/15 text-zinc-950 hover:bg-zinc-900/25";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={() => onSelectTooth()}
          aria-label={`Tooth ${label}, status ${currentStatus}`}
          className={`flex h-[22px] min-w-[28px] cursor-pointer items-center justify-center gap-0.5 rounded-md px-1.5 text-xs font-semibold tabular-nums transition-colors focus:outline-none ${pillStyle}`}
        >
          <span>{label}</span>
          {currentStatus === "missing" && (
            <span className="ml-0.5 font-bold text-red-800">×</span>
          )}
          {currentStatus === "pontic" && (
            <span className="ml-0.5 font-bold text-amber-800">—</span>
          )}
          {currentStatus === "implant" && (
            <Zap className="ml-0.5 size-2.5 fill-blue-700 text-blue-700" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="center" sideOffset={6} className="w-52 p-1.5">
        <div className="px-2 py-1 text-[11px] font-semibold text-zinc-500">
          Status Gigi #{label}
        </div>
        <div role="listbox" aria-label="Set tooth status" className="space-y-0.5">
          {(
            [
              {
                status: "present",
                title: "Present (Ada)",
                activeClass: "bg-zinc-100 text-zinc-950 font-semibold",
                icon: (
                  <span className="size-2 rounded-full bg-zinc-500" />
                ),
              },
              {
                status: "missing",
                title: "Missing (Hilang)",
                activeClass: "bg-red-50 text-red-800 font-semibold",
                icon: <span className="font-bold text-red-600">×</span>,
              },
              {
                status: "pontic",
                title: "Pontic (Bridge)",
                activeClass: "bg-amber-50 text-amber-800 font-semibold",
                icon: <span className="font-bold text-amber-600">—</span>,
              },
              {
                status: "implant",
                title: "Implant (Implan)",
                activeClass: "bg-blue-50 text-blue-800 font-semibold",
                icon: <Zap className="size-3.5 fill-blue-600 text-blue-600" />,
              },
            ] as {
              status: ZermmiToothStatus;
              title: string;
              activeClass: string;
              icon: React.ReactNode;
            }[]
          ).map((opt) => {
            const selected = currentStatus === opt.status;
            return (
              <button
                key={opt.status}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onSelectStatus(opt.status);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-zinc-100 ${
                  selected ? opt.activeClass : "text-zinc-800"
                }`}
              >
                <span className="flex size-4 shrink-0 items-center justify-center">
                  {opt.icon}
                </span>
                <span className="flex-1">{opt.title}</span>
                {selected && <Check className="size-3.5 text-zinc-600" />}
              </button>
            );
          })}
        </div>

        <div className="mt-1 border-t border-zinc-200 pt-1">
          <button
            type="button"
            onClick={() => {
              onResetTooth();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-rose-700 hover:bg-rose-50"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset Semua Mark Gigi #{label}</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ============================================================================
   ZERMMI 52x52 5-SURFACE SVG TOOTH RENDERER (j7e)
   ============================================================================ */

function ZermmiToothSvg({
  tooth,
  marks,
  status,
  catalog,
  selected,
  onSurfaceClick,
}: {
  tooth: number;
  marks: ZermmiMark[];
  status: ZermmiToothStatus;
  catalog: ZermmiTreatmentDef[];
  selected: boolean;
  onSurfaceClick: (surface: Surface) => void;
}) {
  const [hoveredZone, setHoveredZone] = useState<ZoneKey | null>(null);
  const zoneMap = useMemo(() => getZoneToSurfaceMap(tooth), [tooth]);
  const isDisabled = status === "missing" || status === "pontic";

  const resolvedMarks = useMemo(
    () =>
      marks
        .map((m) => {
          const def = catalog.find((c) => c.id === m.treatmentId);
          return def ? { mark: m, def } : null;
        })
        .filter((x): x is { mark: ZermmiMark; def: ZermmiTreatmentDef } => x !== null),
    [marks, catalog],
  );

  const wholeMarks = useMemo(
    () => resolvedMarks.filter((x) => isWholeToothKind(x.def.kind)),
    [resolvedMarks],
  );

  // Determine fill & stroke for a given zone (exact Zermmi j(P) logic)
  const getZoneVisual = (zone: ZoneKey) => {
    const surface = zoneMap[zone];
    const surfMarks = resolvedMarks.filter(
      (x) => !isWholeToothKind(x.def.kind) && x.mark.surface === surface,
    );

    const fillMarks = surfMarks.filter((x) => x.def.kind === "surface_fill");
    const hatchMarks = surfMarks.filter((x) => x.def.kind === "surface_hatch");

    // Priority: completed > planned > historical
    const pickMode = (list: typeof fillMarks): ZermmiMode | null => {
      if (list.some((x) => x.mark.mode === "completed")) return "completed";
      if (list.some((x) => x.mark.mode === "planned")) return "planned";
      if (list.some((x) => x.mark.mode === "historical")) return "historical";
      return null;
    };

    const fillMode = pickMode(fillMarks);
    if (fillMode) {
      return {
        fill: ZERMMI_MODE_COLORS[fillMode],
        fillOpacity: 1,
        stroke: ZERMMI_STROKE,
        strokeWidth: 0.45,
      };
    }

    const hatchMode = pickMode(hatchMarks);
    if (hatchMode) {
      return {
        fill: ZERMMI_MODE_COLORS[hatchMode],
        fillOpacity: 0.3,
        stroke: ZERMMI_MODE_COLORS[hatchMode],
        strokeWidth: 0.9,
      };
    }

    if (hoveredZone === zone && !isDisabled) {
      return {
        fill: ZERMMI_HOVER_BG,
        fillOpacity: 1,
        stroke: ZERMMI_STROKE,
        strokeWidth: 0.55,
      };
    }

    return {
      fill: zone === "center" ? ZERMMI_CENTER_BG : ZERMMI_SURFACE_BG,
      fillOpacity: 1,
      stroke: ZERMMI_STROKE,
      strokeWidth: 0.45,
    };
  };

  return (
    <div
      data-odontogram-tooth={tooth}
      className={`rounded-sm transition-shadow ${
        selected ? "ring-2 ring-teal-600/70" : ""
      }`}
    >
      <svg
        width={52}
        height={52}
        viewBox="0 0 52 52"
        className={`block shrink-0 ${
          isDisabled ? "pointer-events-none opacity-40 grayscale" : ""
        }`}
        role="img"
        aria-label={`Tooth ${tooth}`}
      >
        {/* 1. Render 5 Surface Shapes + Hit Targets */}
        {ZONES.map((zone) => {
          const surface = zoneMap[zone];
          const vis = getZoneVisual(zone);
          const hit = ZERMMI_HIT_RECTS_52[zone];

          return (
            <React.Fragment key={zone}>
              {zone === "center" ? (
                <rect
                  x={ZERMMI_PATHS_52.center.x}
                  y={ZERMMI_PATHS_52.center.y}
                  width={ZERMMI_PATHS_52.center.width}
                  height={ZERMMI_PATHS_52.center.height}
                  rx={ZERMMI_PATHS_52.center.rx}
                  fill={vis.fill}
                  fillOpacity={vis.fillOpacity}
                  stroke={vis.stroke}
                  strokeWidth={vis.strokeWidth}
                />
              ) : (
                <path
                  d={ZERMMI_PATHS_52[zone]}
                  fill={vis.fill}
                  fillOpacity={vis.fillOpacity}
                  stroke={vis.stroke}
                  strokeWidth={vis.strokeWidth}
                />
              )}

              {!isDisabled && (
                <rect
                  x={hit.x}
                  y={hit.y}
                  width={hit.width}
                  height={hit.height}
                  fill="transparent"
                  stroke="transparent"
                  data-surface={surface}
                  data-zone={zone}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSurfaceClick(surface);
                  }}
                  onMouseEnter={() => setHoveredZone(zone)}
                  onMouseLeave={() => setHoveredZone(null)}
                  className="cursor-pointer outline-none"
                  role="button"
                  tabIndex={-1}
                  aria-label={getSurfaceDisplayName(surface, tooth)}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* 2. Render Whole-Tooth Overlays (Crown, Root Canal, Extraction) */}
        {wholeMarks.map(({ mark, def }, idx) => {
          const color =
            def.finding || !mark.mode
              ? ZERMMI_FINDING_COLOR
              : ZERMMI_MODE_COLORS[mark.mode];
          const key = `${def.id}-${mark.mode}-${idx}`;

          if (def.kind === "crown") {
            return (
              <rect
                key={key}
                x={0.84}
                y={0.84}
                width={50.32}
                height={50.32}
                rx={2.24}
                fill={color}
                fillOpacity={0.2}
                stroke={color}
                strokeWidth={1.68}
                pointerEvents="none"
              />
            );
          }

          if (def.kind === "root_canal") {
            return (
              <circle
                key={key}
                cx={26}
                cy={26}
                r={3.35}
                fill={color}
                pointerEvents="none"
              />
            );
          }

          if (def.kind === "extraction") {
            return (
              <g key={key} pointerEvents="none">
                <line
                  x1={3.35}
                  y1={3.35}
                  x2={48.65}
                  y2={48.65}
                  stroke={color}
                  strokeWidth={2.4}
                  strokeLinecap="round"
                />
                <line
                  x1={48.65}
                  y1={3.35}
                  x2={3.35}
                  y2={48.65}
                  stroke={color}
                  strokeWidth={2.4}
                  strokeLinecap="round"
                />
              </g>
            );
          }

          return null;
        })}

        {/* 3. Render Surface Dots (Caries Findings at exact surface centroids) */}
        {ZONES.map((zone) => {
          const surface = zoneMap[zone];
          const dotMarks = resolvedMarks.filter(
            (x) => x.def.kind === "surface_dot" && x.mark.surface === surface,
          );
          if (dotMarks.length === 0) return null;

          const centroid = ZERMMI_DOT_CENTROIDS_52[zone];
          const first = dotMarks[0];
          const dotColor =
            first.def.finding || !first.mark.mode
              ? ZERMMI_FINDING_COLOR
              : ZERMMI_MODE_COLORS[first.mark.mode];

          return (
            <circle
              key={`dot-${zone}`}
              cx={centroid.x}
              cy={centroid.y}
              r={2.86}
              fill={dotColor}
              stroke="#FFFFFF"
              strokeWidth={0.8}
              pointerEvents="none"
            />
          );
        })}
      </svg>
    </div>
  );
}
