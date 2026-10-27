"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  GraduationCap,
  MapPin,
  MoveHorizontal,
  Phone,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { doctors, locations, TODAY } from "@/lib/data";
import { addDays, dateCompact, rupiah } from "@/lib/format";
import { toast } from "sonner";

export type ClinicTemplateId =
  | "AURA_BOUTIQUE"
  | "ZURICH_CLINICAL"
  | "KIN_FAMILY"
  | "ATELIER_NOIR";

export type BlockId =
  | "blk_hero"
  | "blk_services"
  | "blk_before_after"
  | "blk_doctors"
  | "blk_locations";

export interface BuilderBlockItem {
  id: BlockId;
  type:
    | "HERO_PROFILE"
    | "LAYMAN_SERVICES_GRID"
    | "BEFORE_AFTER_SLIDER"
    | "DOCTOR_CREDENTIALS"
    | "PRACTICE_LOCATIONS";
  label: string;
  description: string;
  enabled: boolean;
  proOnly?: boolean;
}

export interface BeforeAfterCase {
  id: string;
  title: string;
  subtitle: string;
  doctorName: string;
  durationLabel: string;
  shadeBefore: string;
  shadeAfter: string;
  variant: "VENEER" | "BLEACHING" | "ORTHO";
}

export interface ClinicSiteConfig {
  slug: string;
  customDomain: string;
  templateId: ClinicTemplateId;
  clinicName: string;
  cityTag: string;
  headline: string;
  subheadline: string;
  badgeText: string;
  seoTitle: string;
  seoDescription: string;
  primaryColor: string;
  requireDeposit: boolean;
  depositAmount: number;
  hideWatermark: boolean;
  showStrSip: boolean;
  showStartingPrice: boolean;
  blocks: BuilderBlockItem[];
  cases: BeforeAfterCase[];
}

export const CLINIC_TEMPLATES: {
  id: ClinicTemplateId;
  code: string;
  name: string;
  tagline: string;
  inspiration: string;
  defaultAccent: string;
  canvasBg: string;
  inkColor: string;
  fontLabel: string;
}[] = [
  {
    id: "AURA_BOUTIQUE",
    code: "01",
    name: "Aura Hospitality Studio",
    tagline: "Editorial hangat bergaya butik wellness bebas kecemasan",
    inspiration: "Tend Dental / Mythology NYC",
    defaultAccent: "#2E5A44",
    canvasBg: "#FAF7F2",
    inkColor: "#1C1917",
    fontLabel: "Instrument Serif + Plus Jakarta Sans",
  },
  {
    id: "ZURICH_CLINICAL",
    code: "02",
    name: "Zurich Precision Grid",
    tagline: "Grid arsitektural Swiss dengan telemetri sterilisasi & STR/SIP",
    inspiration: "Swiss Clinical / Braun Medical",
    defaultAccent: "#0052FF",
    canvasBg: "#FFFFFF",
    inkColor: "#090D16",
    fontLabel: "Geist Sans + Geist Mono",
  },
  {
    id: "KIN_FAMILY",
    code: "03",
    name: "Kin Family & Pediatric",
    tagline: "Bento organik ramah keluarga & anak dengan panduan bebas takut",
    inspiration: "One Medical / Modern Family Care",
    defaultAccent: "#0D9488",
    canvasBg: "#FDFBF7",
    inkColor: "#132A26",
    fontLabel: "Plus Jakarta Sans",
  },
  {
    id: "ATELIER_NOIR",
    code: "04",
    name: "Atelier Veneer & Ortho",
    tagline: "Kontras tinggi berkelas untuk klinik estetika, veneer & aligner",
    inspiration: "Luxury Cosmetic Atelier",
    defaultAccent: "#C5A059",
    canvasBg: "#0E1013",
    inkColor: "#F4EFE6",
    fontLabel: "Instrument Serif + Geist Mono",
  },
];

export const DEFAULT_CLINIC_SITE_CONFIG: ClinicSiteConfig = {
  slug: "senyumsehat",
  customDomain: "senyumsehat.id",
  templateId: "AURA_BOUTIQUE",
  clinicName: "Senyum Sehat Dental Studio",
  cityTag: "Senopati & Kemang · Jakarta Selatan",
  headline: "Perawatan gigi yang tenang, transparan, dan selesai tepat waktu.",
  subheadline:
    "Dari pembersihan karang gigi ultrasonik hingga restorasi estetik — ditangani dokter gigi umum & spesialis dengan sterilisasi Autoclave Kelas B dan jadwal bebas antre.",
  badgeText: "4.9/5 dari 320+ Ulasan Terverifikasi Google Maps",
  seoTitle: "Senyum Sehat Dental Studio — Dokter Gigi Estetik & Keluarga Jakarta Selatan",
  seoDescription:
    "Booking jadwal scaling, tambal gigi estetik, veneer, dan ortodonti secara real-time tanpa antre di ruang tunggu.",
  primaryColor: "#2E5A44",
  requireDeposit: true,
  depositAmount: 50000,
  hideWatermark: true,
  showStrSip: true,
  showStartingPrice: true,
  blocks: [
    {
      id: "blk_hero",
      type: "HERO_PROFILE",
      label: "Hero & Janji Kenyamanan",
      description: "Headline editorial, indikator slot hari ini, dan arsitektur visual utama",
      enabled: true,
    },
    {
      id: "blk_services",
      type: "LAYMAN_SERVICES_GRID",
      label: "Menu Keluhan Bahasa Awam",
      description: "Katalog keluhan sehari-hari dengan estimasi durasi kursi & transparansi biaya",
      enabled: true,
    },
    {
      id: "blk_before_after",
      type: "BEFORE_AFTER_SLIDER",
      label: "Transformasi Senyum (Before–After)",
      description: "Perbandingan anatomi interaktif kasus Veneer, Bleaching, dan Aligner",
      enabled: true,
      proOnly: true,
    },
    {
      id: "blk_doctors",
      type: "DOCTOR_CREDENTIALS",
      label: "Tim Dokter & Lisensi STR/SIP",
      description: "Profil dokter, almamater universitas, dan nomor izin praktik resmi",
      enabled: true,
    },
    {
      id: "blk_locations",
      type: "PRACTICE_LOCATIONS",
      label: "Lokasi Studio & Ketersediaan Kursi",
      description: "Alamat cabang, jam operasional, dan status kursi real-time",
      enabled: true,
    },
  ],
  cases: [
    {
      id: "case_veneer",
      title: "Direct Composite Veneer 4 Gigi Depan",
      subtitle: "Penutupan celah diastema sentral & koreksi proporsi insisal tanpa kikis email berlebih",
      doctorName: "drg. Budi Santoso",
      durationLabel: "1x Kunjungan (90 Menit)",
      shadeBefore: "Shade A3.5 · Diastema 1.4mm",
      shadeAfter: "Shade A1 Natural · Simetris",
      variant: "VENEER",
    },
    {
      id: "case_bleach",
      title: "Airflow Scaling + In-Office Whitening",
      subtitle: "Pembersihan biofilm subgingiva dilanjutkan pencerahan warna gigi hingga 4 tingkat",
      doctorName: "drg. Budi Santoso",
      durationLabel: "1x Kunjungan (60 Menit)",
      shadeBefore: "Shade A3 · Noda Kopi/Teh",
      shadeAfter: "Shade BL3 · Gusi Sehat",
      variant: "BLEACHING",
    },
    {
      id: "case_ortho",
      title: "Koreksi Gigi Berjejal Anterior (Aligner)",
      subtitle: "Perapian lengkung rahang atas dengan protokol ortodonti minim nyeri",
      doctorName: "drg. Siti Rahma, Sp.Ort",
      durationLabel: "Kontrol 24 Minggu",
      shadeBefore: "Rotasi Insisivus Lateral",
      shadeAfter: "Lengkung Ideal Kelas I",
      variant: "ORTHO",
    },
  ],
};

const STORAGE_KEY = "klikgigi_clinic_site_config_v2";

export function useClinicSiteConfig() {
  const [config, setConfigState] = useState<ClinicSiteConfig>(DEFAULT_CLINIC_SITE_CONFIG);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ClinicSiteConfig>;
        setConfigState((prev) => ({
          ...prev,
          ...parsed,
          blocks: parsed.blocks ?? prev.blocks,
          cases: parsed.cases ?? prev.cases,
        }));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const setConfig = (
    updater: ClinicSiteConfig | ((prev: ClinicSiteConfig) => ClinicSiteConfig),
  ) => {
    setConfigState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CLINIC_SITE_CONFIG);
  };

  return { config, setConfig, resetConfig };
}

export interface LaymanComplaintItem {
  id: string;
  code: string;
  title: string;
  clinicalTerm: string;
  subtitle: string;
  duration: number;
  price: number;
}

export const LAYMAN_COMPLAINTS: LaymanComplaintItem[] = [
  {
    id: "cmp_scaling",
    code: "SC-01",
    title: "Bersihkan Karang Gigi & Noda Kopi",
    clinicalTerm: "Ultrasonic Scaling & Polishing",
    subtitle: "Gusi bebas berdarah, napas segar, dan pembersihan plak menyeluruh di sela gusi.",
    duration: 30,
    price: 350000,
  },
  {
    id: "cmp_filling",
    code: "RS-02",
    title: "Gigi Ngilu, Berlubang, atau Tambal Estetik",
    clinicalTerm: "Composite Restoration & Endodontics",
    subtitle: "Tambalan komposit nano-hybrid sewarna gigi asli atau perawatan saluran akar minim nyeri.",
    duration: 45,
    price: 350000,
  },
  {
    id: "cmp_ortho",
    code: "OR-03",
    title: "Pasang atau Kontrol Behel & Aligner",
    clinicalTerm: "Orthodontic Arch Alignment",
    subtitle: "Rapikan susunan gigi berjejal atau maju bersama Spesialis Ortodonti (Sp.Ort).",
    duration: 30,
    price: 300000,
  },
  {
    id: "cmp_aesthetic",
    code: "AE-04",
    title: "Memutihkan Gigi & Desain Senyum Veneer",
    clinicalTerm: "Bleaching & Direct/Porcelain Veneer",
    subtitle: "Koreksi warna dan bentuk gigi depan agar proporsional alami dalam 1–2 kunjungan.",
    duration: 60,
    price: 1200000,
  },
  {
    id: "cmp_extract",
    code: "OS-05",
    title: "Cabut Gigi atau Operasi Gigi Bungsu",
    clinicalTerm: "Atraumatic Extraction & Odontectomy",
    subtitle: "Prosedur anestesi lokal lembut dengan protokol sterilisasi bedah minor.",
    duration: 60,
    price: 400000,
  },
  {
    id: "cmp_consult",
    code: "DX-06",
    title: "Pemeriksaan Awal & Rencana Biaya",
    clinicalTerm: "Intraoral Camera Diagnostic",
    subtitle: "Cek kondisi seluruh gigi lewat layar kamera intraoral dengan rincian estimasi transparan.",
    duration: 20,
    price: 150000,
  },
];

const SMART_SLOTS = [
  "09:00",
  "09:45",
  "10:30",
  "11:15",
  "13:30",
  "14:15",
  "15:30",
  "16:15",
  "18:30",
];

/**
 * Custom Precision Dental Vector Iconography (Zero Emoji Slop)
 */
export function ComplaintVectorIcon({
  id,
  accentColor,
  className = "size-6",
}: {
  id: string;
  accentColor: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      {id === "cmp_scaling" && (
        <>
          <path
            d="M10 8.5C7.8 8.5 6.5 10.4 6.8 13C7.1 15.6 8.3 18.2 8.9 21.8C9.3 24 10.6 24.5 11.4 22.5C12.1 20.8 12.6 18.5 14 18.5C15.4 18.5 15.9 20.8 16.6 22.5C17.4 24.5 18.7 24 19.1 21.8C19.7 18.2 20.9 15.6 21.2 13C21.5 10.4 20.2 8.5 18 8.5C16.4 8.5 15.3 9.4 14 9.4C12.7 9.4 11.6 8.5 10 8.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24 5L26 9M22 7L28 7"
            stroke={accentColor}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M22.5 14.5C24.5 14.5 26 16 26 18"
            stroke={accentColor}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      )}
      {id === "cmp_filling" && (
        <>
          <path
            d="M11 7.5C8.2 7.5 6.8 9.8 7.2 12.8C7.6 15.8 9 19 9.7 23.2C10.1 25.5 11.7 26 12.6 23.8C13.4 21.8 14 19.2 16 19.2C18 19.2 18.6 21.8 19.4 23.8C20.3 26 21.9 25.5 22.3 23.2C23 19 24.4 15.8 24.8 12.8C25.2 9.8 23.8 7.5 21 7.5C19 7.5 17.6 8.6 16 8.6C14.4 8.6 13 7.5 11 7.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M12.5 8.5C13.8 11.2 18.2 11.2 19.5 8.5"
            fill={accentColor}
            fillOpacity="0.25"
            stroke={accentColor}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      )}
      {id === "cmp_ortho" && (
        <>
          <rect
            x="5"
            y="9"
            width="6.5"
            height="13"
            rx="2.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="12.75"
            y="8"
            width="6.5"
            height="14.5"
            rx="2.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="20.5"
            y="9"
            width="6.5"
            height="13"
            rx="2.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M3.5 15.5H28.5" stroke={accentColor} strokeWidth="1.8" strokeLinecap="round" />
          <rect x="7" y="14" width="2.5" height="3" rx="0.5" fill={accentColor} />
          <rect x="14.75" y="14" width="2.5" height="3" rx="0.5" fill={accentColor} />
          <rect x="22.5" y="14" width="2.5" height="3" rx="0.5" fill={accentColor} />
        </>
      )}
      {id === "cmp_aesthetic" && (
        <>
          <path
            d="M10.5 7.5H21.5C22.8 7.5 23.8 8.7 23.6 10L22.2 19.5C21.6 23.2 19 25.5 16 25.5C13 25.5 10.4 23.2 9.8 19.5L8.4 10C8.2 8.7 9.2 7.5 10.5 7.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M12.5 11.5C13 15.5 14.2 18.5 16 20.5"
            stroke={accentColor}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M25 5.5L26 8L28.5 9L26 10L25 12.5L24 10L21.5 9L24 8L25 5.5Z"
            fill={accentColor}
          />
        </>
      )}
      {id === "cmp_extract" && (
        <>
          <path
            d="M11 8C8.5 8 7.2 10 7.6 12.8C8 15.6 9.3 18.5 10 22.5C10.4 24.6 11.8 25 12.7 23C13.4 21.2 14.2 18.8 16 18.8C17.8 18.8 18.6 21.2 19.3 23C20.2 25 21.6 24.6 22 22.5C22.7 18.5 24 15.6 24.4 12.8C24.8 10 23.5 8 21 8C19.2 8 17.8 9 16 9C14.2 9 12.8 8 11 8Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeDasharray="2.5 2"
          />
          <path
            d="M16 11.5V16.5M13.5 14H18.5"
            stroke={accentColor}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      )}
      {id === "cmp_consult" && (
        <>
          <circle cx="13" cy="12" r="5.5" stroke="currentColor" strokeWidth="1.6" />
          <circle
            cx="13"
            cy="12"
            r="2.8"
            fill={accentColor}
            fillOpacity="0.2"
            stroke={accentColor}
            strokeWidth="1.2"
          />
          <path
            d="M17 16L25 24"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M22 7L26 11"
            stroke={accentColor}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

/**
 * Anatomical SVG Smile Arc Comparison (Before vs After)
 * Replaces text placeholders with real clinical vector art.
 */
export function InteractiveBeforeAfterSmile({
  cases,
  accentColor,
  darkTheme = false,
}: {
  cases: BeforeAfterCase[];
  accentColor: string;
  darkTheme?: boolean;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [sliderPos, setSliderPos] = useState(54);
  const currentCase = cases[activeIdx] ?? cases[0];

  const renderTeethArch = (mode: "BEFORE" | "AFTER") => {
    const isBefore = mode === "BEFORE";
    const toothFill = isBefore
      ? currentCase.variant === "BLEACHING"
        ? "#E9D8A6"
        : "#F1E7CC"
      : "#FCFBF9";
    const toothStroke = isBefore ? "#C2B280" : "#CBD5E1";
    const gumFill = isBefore ? "#D9777F" : "#F2A6B0";
    // Central diastema gap on BEFORE for Veneer
    const gapOffset = isBefore && currentCase.variant === "VENEER" ? 7 : 0;
    const orthoShift = isBefore && currentCase.variant === "ORTHO" ? -5 : 0;

    return (
      <svg
        viewBox="0 0 560 220"
        className="h-full w-full select-none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`gum-${mode}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gumFill} stopOpacity="0.85" />
            <stop offset="100%" stopColor={gumFill} stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id={`enamel-${mode}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={toothFill} />
            <stop offset="65%" stopColor={isBefore ? "#E5D5B0" : "#F4F6F8"} />
            <stop offset="100%" stopColor={isBefore ? "#D6C394" : "#E8EEF2"} />
          </linearGradient>
        </defs>

        {/* Background oral cavity */}
        <rect width="560" height="220" fill={darkTheme ? "#121316" : "#1E1B18"} />

        {/* Upper Gingival Architecture */}
        <path
          d="M0 0H560V88C470 112 390 120 280 120C170 120 90 112 0 88V0Z"
          fill={`url(#gum-${mode})`}
        />

        {/* Gingival zenith scallops */}
        <path
          d="M95 85 Q122 62 150 85 Q182 54 214 84 Q246 46 278 84 Q312 46 346 84 Q378 54 410 85 Q438 62 465 85"
          fill="none"
          stroke={isBefore ? "#B94A54" : "#E28794"}
          strokeWidth="3"
          opacity="0.65"
        />

        {/* Tooth #13 Canine */}
        <path
          d="M96 80 C96 64 142 64 144 82 L140 144 C136 164 106 160 100 140 Z"
          fill={`url(#enamel-${mode})`}
          stroke={toothStroke}
          strokeWidth="1.5"
        />

        {/* Tooth #12 Lateral Incisor */}
        <g transform={`translate(0, ${orthoShift})`}>
          <path
            d={
              isBefore && currentCase.variant === "VENEER"
                ? "M148 76 C148 58 202 58 204 76 L200 146 L182 141 L152 146 Z"
                : "M148 76 C148 58 202 58 204 76 L200 150 C196 162 156 162 152 148 Z"
            }
            fill={`url(#enamel-${mode})`}
            stroke={toothStroke}
            strokeWidth="1.5"
          />
        </g>

        {/* Tooth #11 Central Incisor (Right) */}
        <g transform={`translate(${-gapOffset}, 0)`}>
          <path
            d="M208 68 C208 48 274 48 276 68 L274 162 C270 174 216 174 212 160 Z"
            fill={`url(#enamel-${mode})`}
            stroke={toothStroke}
            strokeWidth="1.6"
          />
          {!isBefore && (
            <path
              d="M224 82 V146"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.7"
            />
          )}
        </g>

        {/* Tooth #21 Central Incisor (Left) */}
        <g transform={`translate(${gapOffset}, 0)`}>
          <path
            d="M284 68 C286 48 352 48 352 68 L348 160 C344 174 290 174 286 162 Z"
            fill={`url(#enamel-${mode})`}
            stroke={toothStroke}
            strokeWidth="1.6"
          />
          {!isBefore && (
            <path
              d="M300 82 V146"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.7"
            />
          )}
        </g>

        {/* Tooth #22 Lateral Incisor */}
        <g transform={`translate(0, ${-orthoShift})`}>
          <path
            d="M356 76 C358 58 412 58 412 76 L408 148 C404 162 364 162 360 150 Z"
            fill={`url(#enamel-${mode})`}
            stroke={toothStroke}
            strokeWidth="1.5"
          />
        </g>

        {/* Tooth #23 Canine */}
        <path
          d="M416 82 C418 64 464 64 464 80 L460 140 C454 160 424 164 420 144 Z"
          fill={`url(#enamel-${mode})`}
          stroke={toothStroke}
          strokeWidth="1.5"
        />

        {/* Cervical plaque / staining indicators on BEFORE */}
        {isBefore && currentCase.variant === "BLEACHING" && (
          <g opacity="0.45" fill="#B58938">
            <ellipse cx="242" cy="118" rx="18" ry="24" />
            <ellipse cx="318" cy="118" rx="18" ry="24" />
            <ellipse cx="176" cy="114" rx="12" ry="18" />
            <ellipse cx="384" cy="114" rx="12" ry="18" />
          </g>
        )}

        {/* Clear aligner precision attachments on AFTER ORTHO */}
        {!isBefore && currentCase.variant === "ORTHO" && (
          <g stroke={accentColor} strokeWidth="1.2" fill="#FFFFFF" fillOpacity="0.35">
            <rect x="170" y="106" width="8" height="12" rx="2" />
            <rect x="380" y="106" width="8" height="12" rx="2" />
            <path
              d="M92 152 Q280 176 468 152"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.7"
            />
          </g>
        )}

        {/* Golden proportion caliper overlay on AFTER */}
        {!isBefore && (
          <g opacity="0.55" stroke="#FFFFFF" strokeWidth="0.75" strokeDasharray="3 3">
            <line x1="208" y1="40" x2="208" y2="185" />
            <line x1="280" y1="40" x2="280" y2="185" />
            <line x1="352" y1="40" x2="352" y2="185" />
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      {/* Case Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {cases.map((c, idx) => {
            const active = idx === activeIdx;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  borderColor: active ? accentColor : "rgba(128,128,128,0.25)",
                  backgroundColor: active ? accentColor : "transparent",
                  color: active ? "#FFFFFF" : "inherit",
                }}
              >
                {c.title}
              </button>
            );
          })}
        </div>
        <span className="font-mono text-[11px] opacity-75">{currentCase.durationLabel}</span>
      </div>

      {/* Interactive Split Viewport */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
        {/* Base Layer: BEFORE */}
        <div className="absolute inset-0">{renderTeethArch("BEFORE")}</div>

        {/* Clipped Layer: AFTER */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <div className="h-full w-[560px] sm:w-[760px] max-w-none">
            {renderTeethArch("AFTER")}
          </div>
        </div>

        {/* Divider Line & Handle */}
        <div
          className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.5)]"
          style={{ left: `${sliderPos}%` }}
        >
          <div
            className="
              absolute top-1/2 -translate-x-1/2 -translate-y-1/2
              flex size-9 items-center justify-center
              rounded-full border-2 border-white text-white shadow-md
            "
            style={{ backgroundColor: accentColor }}
          >
            <MoveHorizontal className="size-4" />
          </div>
        </div>

        {/* Floating Clinical Telemetry Badges */}
        <div className="pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-md bg-black/75 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
          <span className="size-2 rounded-full bg-emerald-400" />
          SESUDAH · {currentCase.shadeAfter}
        </div>
        <div className="pointer-events-none absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-md bg-black/75 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-xs">
          SEBELUM · {currentCase.shadeBefore}
        </div>

        {/* Invisible Range Input Covering Canvas for Direct Dragging */}
        <input
          type="range"
          min={8}
          max={92}
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          aria-label="Geser perbandingan anatomi gigi sebelum dan sesudah"
          className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>

      {/* Case Metadata Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs opacity-85">
        <div>
          <span className="font-semibold">{currentCase.subtitle}</span>
        </div>
        <div className="font-mono text-[11px]">
          Operator: <strong>{currentCase.doctorName}</strong>
        </div>
      </div>
    </div>
  );
}

/**
 * Real Vector QRIS Matrix Component (Zero [QRIS Rp50rb] text box)
 */
export function DynamicQrisSvg({ amount }: { amount: number }) {
  return (
    <div className="flex flex-col items-center rounded-lg border bg-white p-2.5 text-[#111418] shadow-2xs">
      <div className="mb-1 flex w-full items-center justify-between border-b pb-1 text-[9px] font-bold tracking-wider">
        <span>QRIS</span>
        <span className="font-mono text-emerald-700">GPN · DINAMIS</span>
      </div>
      <svg viewBox="0 0 100 100" className="size-24" aria-label="Kode QRIS Dinamis">
        <rect width="100" height="100" fill="#FFFFFF" />
        {/* Finder Patterns */}
        <rect x="6" y="6" width="24" height="24" fill="none" stroke="#111418" strokeWidth="4" />
        <rect x="12" y="12" width="12" height="12" fill="#111418" />
        <rect x="70" y="6" width="24" height="24" fill="none" stroke="#111418" strokeWidth="4" />
        <rect x="76" y="12" width="12" height="12" fill="#111418" />
        <rect x="6" y="70" width="24" height="24" fill="none" stroke="#111418" strokeWidth="4" />
        <rect x="12" y="76" width="12" height="12" fill="#111418" />
        {/* Data Modules */}
        <g fill="#111418">
          <rect x="36" y="8" width="6" height="6" />
          <rect x="48" y="8" width="6" height="12" />
          <rect x="58" y="14" width="6" height="6" />
          <rect x="36" y="20" width="8" height="6" />
          <rect x="8" y="36" width="6" height="8" />
          <rect x="20" y="38" width="12" height="6" />
          <rect x="38" y="34" width="6" height="6" />
          <rect x="60" y="34" width="8" height="8" />
          <rect x="76" y="36" width="6" height="12" />
          <rect x="86" y="42" width="8" height="6" />
          <rect x="10" y="52" width="12" height="6" />
          <rect x="28" y="54" width="6" height="10" />
          <rect x="62" y="52" width="10" height="6" />
          <rect x="78" y="56" width="14" height="6" />
          <rect x="36" y="68" width="8" height="8" />
          <rect x="50" y="66" width="6" height="12" />
          <rect x="64" y="70" width="12" height="6" />
          <rect x="82" y="72" width="10" height="10" />
          <rect x="38" y="84" width="10" height="8" />
          <rect x="56" y="86" width="14" height="6" />
          <rect x="74" y="86" width="6" height="8" />
        </g>
        {/* Center Brand Seal */}
        <rect x="41" y="41" width="18" height="18" rx="3" fill="#0F766E" />
        <path d="M46 50H54M50 46V54" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <div className="mt-1 font-mono text-[10px] font-semibold">{rupiah(amount)}</div>
    </div>
  );
}

/**
 * Multi-Template Clinic Renderer
 * Powers both `/app/situs` (Builder Live Stage) and `/s/[slug]` (Public Microsite)
 */
export function ClinicTemplateRenderer({
  config,
  inspectable = false,
  selectedBlockId,
  onSelectBlock,
  compactMode = false,
}: {
  config: ClinicSiteConfig;
  inspectable?: boolean;
  selectedBlockId?: BlockId;
  onSelectBlock?: (id: BlockId) => void;
  compactMode?: boolean;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedComplaint, setSelectedComplaint] = useState<LaymanComplaintItem>(
    LAYMAN_COMPLAINTS[0],
  );
  const [selectedLocation, setSelectedLocation] = useState(locations[0].id);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("ANY");
  const [selectedDate, setSelectedDate] = useState(addDays(TODAY, 1));
  const [selectedSlot, setSelectedSlot] = useState("10:30");
  const [patientName, setPatientName] = useState("");
  const [patientWa, setPatientWa] = useState("");
  const [patientNote, setPatientNote] = useState("");

  const next14Days = Array.from({ length: 14 }, (_, i) => addDays(TODAY, i));

  const openBookingWith = (cmp = LAYMAN_COMPLAINTS[0], initialStep: 1 | 2 = 1) => {
    setSelectedComplaint(cmp);
    setStep(initialStep);
    setDrawerOpen(true);
  };

  const isEnabled = (id: BlockId) =>
    config.blocks.find((b) => b.id === id)?.enabled ?? true;

  const blockOrder = config.blocks.filter((b) => b.enabled).map((b) => b.id);

  // Template-specific visual tokens
  const tpl = config.templateId;
  const isNoir = tpl === "ATELIER_NOIR";
  const isZurich = tpl === "ZURICH_CLINICAL";
  const isAura = tpl === "AURA_BOUTIQUE";
  const isKin = tpl === "KIN_FAMILY";

  const surfaceStyle: React.CSSProperties =
    tpl === "AURA_BOUTIQUE"
      ? { backgroundColor: "#FAF7F2", color: "#1C1917" }
      : tpl === "ZURICH_CLINICAL"
        ? { backgroundColor: "#FFFFFF", color: "#090D16" }
        : tpl === "KIN_FAMILY"
          ? { backgroundColor: "#FDFBF7", color: "#132A26" }
          : { backgroundColor: "#0E1013", color: "#F4EFE6" };

  const cardBg = isNoir
    ? "bg-[#16191E] border-[#262A32] text-[#F4EFE6]"
    : isAura
      ? "bg-[#F3EFE6]/80 border-[#E2DDD2] text-[#1C1917]"
      : isZurich
        ? "bg-white border-[#CBD5E1] text-[#090D16] rounded-none"
        : "bg-white border-[#E4E2DD] text-[#132A26] rounded-2xl shadow-2xs";

  const headingFontClass =
    isAura || isNoir
      ? "font-serif tracking-tight font-normal"
      : "font-display tracking-tight font-semibold";

  const wrapBlock = (id: BlockId, label: string, content: React.ReactNode) => {
    if (!isEnabled(id)) return null;
    const isSelected = inspectable && selectedBlockId === id;
    return (
      <div
        key={id}
        onClick={(e) => {
          if (inspectable && onSelectBlock) {
            e.stopPropagation();
            onSelectBlock(id);
          }
        }}
        className={`relative transition-all ${
          inspectable
            ? "cursor-pointer rounded-xl ring-offset-2 hover:ring-2 hover:ring-[#0F766E]/50"
            : ""
        } ${isSelected ? "ring-2 ring-[#0F766E]" : ""}`}
      >
        {inspectable && (
          <div
            className={`pointer-events-none absolute -top-2.5 right-3 z-20 flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] font-medium shadow-2xs ${
              isSelected
                ? "bg-[#0F766E] text-white"
                : "border bg-white/95 text-neutral-700"
            }`}
          >
            <span>{label}</span>
            {isSelected && <span>· Aktif</span>}
          </div>
        )}
        {content}
      </div>
    );
  };

  return (
    <div style={surfaceStyle} className="min-h-full transition-colors duration-200">
      {/* Top Clinic Navigation Header */}
      <header
        className={`border-b px-4 sm:px-8 py-4 ${
          isNoir
            ? "border-[#262A32] bg-[#0E1013]/95"
            : isZurich
              ? "border-[#CBD5E1] bg-white"
              : "border-black/10 bg-inherit"
        }`}
      >
        {isZurich && (
          <div className="mb-3 flex flex-wrap items-center justify-between border-b border-[#E2E8F0] pb-2 font-mono text-[10px] tracking-wider text-slate-500 uppercase">
            <span>PROTOCOL: STERILISASI AUTOCLAVE KELAS-B</span>
            <span>KURSI TERSEDIA HARI INI: 4 SLOT</span>
            <span>REG: KEMENKES RI RME-SATUSEHAT</span>
          </div>
        )}

        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex size-9 items-center justify-center rounded-lg font-mono text-xs font-bold text-white"
              style={{ backgroundColor: config.primaryColor }}
            >
              SS
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">{config.clinicName}</div>
              <div className="text-[11px] opacity-65">{config.cityTag}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/intake/pt_rina"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-current/20 px-3 py-1.5 text-xs font-medium opacity-85 hover:opacity-100"
            >
              <ClipboardCheck className="size-3.5" /> Pre-Visit Intake
            </Link>
            <button
              type="button"
              onClick={() => openBookingWith(LAYMAN_COMPLAINTS[0], 1)}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition-transform active:scale-98"
              style={{ backgroundColor: config.primaryColor }}
            >
              <Calendar className="size-3.5" /> Buat Janji Temu
            </button>
          </div>
        </div>
      </header>

      {/* Main Template Body */}
      <div
        className={`mx-auto max-w-5xl px-4 sm:px-8 ${
          compactMode ? "space-y-8 py-6" : "space-y-14 py-10 sm:py-14"
        }`}
      >
        {blockOrder.map((blockId) => {
          /* ================================================================
             BLOCK 1: HERO PROFILE (4 Distinct Template Layouts)
             ================================================================ */
          if (blockId === "blk_hero") {
            return wrapBlock(
              "blk_hero",
              "01 · HERO_PROFILE",
              <section>
                <div
                  className={`grid items-center gap-8 ${
                    compactMode ? "grid-cols-1" : "lg:grid-cols-12"
                  }`}
                >
                  <div className={compactMode ? "space-y-4" : "lg:col-span-7 space-y-5"}>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 font-medium ${
                          isZurich
                            ? "border border-slate-300 bg-slate-50 font-mono text-[11px]"
                            : "rounded-full border border-current/15 bg-current/5"
                        }`}
                      >
                        <Star className="size-3.5 fill-amber-500 text-amber-500" />
                        {config.badgeText}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-medium"
                        style={{
                          backgroundColor: `${config.primaryColor}18`,
                          color: isNoir ? "#E5C17B" : config.primaryColor,
                        }}
                      >
                        <span
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: config.primaryColor }}
                        />
                        Slot Tersedia Hari Ini
                      </span>
                    </div>

                    <h1
                      className={`${headingFontClass} ${
                        compactMode
                          ? "text-2xl sm:text-3xl leading-[1.12]"
                          : isAura || isNoir
                            ? "text-4xl sm:text-5xl leading-[1.06]"
                            : "text-3xl sm:text-4xl leading-[1.12]"
                      }`}
                    >
                      {config.headline}
                    </h1>

                    <p className="max-w-xl text-sm sm:text-base leading-relaxed opacity-80">
                      {config.subheadline}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => openBookingWith(LAYMAN_COMPLAINTS[0], 1)}
                        className={`inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all hover:opacity-95 ${
                          isZurich ? "rounded-none" : "rounded-full"
                        }`}
                        style={{ backgroundColor: config.primaryColor }}
                      >
                        <Calendar className="size-4" /> Pilih Jadwal & Keluhan
                      </button>

                      <Link
                        href="/intake/pt_rina"
                        className={`inline-flex items-center gap-2 border border-current/20 px-4 py-3 text-xs sm:text-sm font-medium transition-colors hover:bg-current/5 ${
                          isZurich ? "rounded-none" : "rounded-full"
                        }`}
                      >
                        <ClipboardCheck className="size-4" /> Isi Data Kesehatan (1 Menit)
                      </Link>
                    </div>

                    {/* Trust Pillars */}
                    <div className="grid grid-cols-3 gap-3 border-t border-current/10 pt-5 text-xs">
                      <div>
                        <div className="font-mono text-sm font-bold">0 Menit</div>
                        <div className="text-[11px] opacity-70">Bebas antre dengan Smart Slot</div>
                      </div>
                      <div>
                        <div className="font-mono text-sm font-bold">100% Transparan</div>
                        <div className="text-[11px] opacity-70">Estimasi biaya sebelum tindakan</div>
                      </div>
                      <div>
                        <div className="font-mono text-sm font-bold">STR & SIP Aktif</div>
                        <div className="text-[11px] opacity-70">Dokter gigi umum & spesialis</div>
                      </div>
                    </div>
                  </div>

                  {/* Architectural Visual Card on Right */}
                  {!compactMode && (
                    <div className="lg:col-span-5">
                      <div
                        className={`overflow-hidden border p-5 ${cardBg} ${
                          isAura ? "rounded-t-[40px] rounded-b-2xl" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-current/10 pb-3 text-xs">
                          <span className="font-mono text-[11px] uppercase opacity-70">
                            Ketersediaan Kursi Hari Ini
                          </span>
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <span className="size-1.5 rounded-full bg-emerald-500" /> Live Sync
                          </span>
                        </div>

                        <div className="mt-4 space-y-2.5">
                          {doctors.map((d, idx) => {
                            const nextSlot = ["10:30", "13:30", "15:30"][idx] ?? "10:30";
                            return (
                              <div
                                key={d.id}
                                className="flex items-center justify-between rounded-lg border border-current/10 bg-current/[0.03] p-3 text-xs"
                              >
                                <div className="flex items-center gap-2.5">
                                  <PersonAvatar name={d.fullName} color={d.color} size="sm" />
                                  <div>
                                    <div className="font-semibold">{d.displayName}</div>
                                    <div className="text-[11px] opacity-70">{d.specialty}</div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDoctor(d.id);
                                    setSelectedSlot(nextSlot);
                                    setStep(3);
                                    setDrawerOpen(true);
                                  }}
                                  className="rounded-md px-2.5 py-1.5 font-mono text-[11px] font-semibold text-white"
                                  style={{ backgroundColor: config.primaryColor }}
                                >
                                  Jam {nextSlot}
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-4 flex items-center justify-between rounded-lg border border-current/10 bg-current/[0.02] px-3 py-2 text-[11px] opacity-80">
                          <span>Jeda sterilisasi otomatis antar pasien</span>
                          <span className="font-mono font-semibold">10 Menit / Kursi</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>,
            );
          }

          /* ================================================================
             BLOCK 2: LAYMAN SERVICES GRID (Zero Emojis — Vector Dental Icons)
             ================================================================ */
          if (blockId === "blk_services") {
            return wrapBlock(
              "blk_services",
              "02 · LAYMAN_SERVICES_GRID",
              <section className="space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-2 border-b border-current/10 pb-3">
                  <div>
                    <div className="font-mono text-[11px] uppercase opacity-60">
                      Katalog Perawatan Transparan
                    </div>
                    <h2 className={`${headingFontClass} mt-0.5 text-2xl sm:text-3xl`}>
                      Pilih Keluhan dengan Bahasa Sehari-hari
                    </h2>
                  </div>
                  <p className="max-w-xs text-xs opacity-75">
                    Sistem langsung mencocokkan dokter gigi dan durasi kursi yang tepat untuk Anda.
                  </p>
                </div>

                <div
                  className={`grid gap-3.5 ${
                    compactMode ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
                  }`}
                >
                  {LAYMAN_COMPLAINTS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => openBookingWith(c, 2)}
                      className={`group flex flex-col justify-between border p-4 text-left transition-all hover:-translate-y-0.5 ${cardBg}`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div
                            className="flex size-10 items-center justify-center rounded-lg border border-current/10"
                            style={{ backgroundColor: `${config.primaryColor}14` }}
                          >
                            <ComplaintVectorIcon
                              id={c.id}
                              accentColor={config.primaryColor}
                              className="size-6"
                            />
                          </div>
                          <span className="font-mono text-[10px] opacity-55">
                            {c.code} · ~{c.duration} mnt
                          </span>
                        </div>

                        <div>
                          <div className="text-sm font-semibold leading-snug">{c.title}</div>
                          <div className="mt-0.5 font-mono text-[10px] opacity-60">
                            {c.clinicalTerm}
                          </div>
                          <p className="mt-1.5 text-xs leading-relaxed opacity-75">
                            {c.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-current/10 pt-3 text-xs">
                        {config.showStartingPrice ? (
                          <div>
                            <span className="text-[11px] opacity-65">Estimasi mulai </span>
                            <span className="num font-mono font-semibold">
                              {rupiah(c.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] opacity-65">Konsultasi Terjadwal</span>
                        )}
                        <span
                          className="inline-flex items-center gap-1 font-semibold"
                          style={{ color: isNoir ? "#E5C17B" : config.primaryColor }}
                        >
                          Pilih <ArrowUpRight className="size-3.5" />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>,
            );
          }

          /* ================================================================
             BLOCK 3: BEFORE-AFTER ANATOMICAL SMILE SLIDER
             ================================================================ */
          if (blockId === "blk_before_after") {
            return wrapBlock(
              "blk_before_after",
              "03 · BEFORE_AFTER_SLIDER",
              <section className={`border p-5 sm:p-7 ${cardBg}`}>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className="font-mono text-[11px] uppercase opacity-60">
                      Dokumentasi Klinis Terverifikasi
                    </div>
                    <h2 className={`${headingFontClass} mt-0.5 text-2xl sm:text-3xl`}>
                      Transformasi Senyum Pasien
                    </h2>
                  </div>
                  <p className="text-xs opacity-75">
                    Geser garis tengah untuk membandingkan anatomi gigi sebelum &amp; sesudah tindakan.
                  </p>
                </div>

                <InteractiveBeforeAfterSmile
                  cases={config.cases}
                  accentColor={config.primaryColor}
                  darkTheme={isNoir}
                />
              </section>,
            );
          }

          /* ================================================================
             BLOCK 4: DOCTOR CREDENTIALS (Verified STR & SIP)
             ================================================================ */
          if (blockId === "blk_doctors") {
            return wrapBlock(
              "blk_doctors",
              "04 · DOCTOR_CREDENTIALS",
              <section className="space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-2 border-b border-current/10 pb-3">
                  <div>
                    <div className="font-mono text-[11px] uppercase opacity-60">
                      Dewan Medis & Operator
                    </div>
                    <h2 className={`${headingFontClass} mt-0.5 text-2xl sm:text-3xl`}>
                      Tim Dokter Gigi Berizin Resmi
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs opacity-75">
                    <ShieldCheck className="size-4 text-emerald-600" /> Terdaftar Konsil Kedokteran Indonesia
                  </span>
                </div>

                <div className={`grid gap-4 ${compactMode ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
                  {doctors.map((d) => (
                    <div
                      key={d.id}
                      className={`flex flex-col justify-between border p-4 text-xs ${cardBg}`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <PersonAvatar name={d.fullName} color={d.color} size="md" />
                          <div>
                            <div className="text-sm font-semibold">{d.displayName}</div>
                            <div className="opacity-75">{d.specialty}</div>
                          </div>
                        </div>

                        <div className="space-y-1.5 border-t border-current/10 pt-3 text-[11px] opacity-85">
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className="size-3.5 shrink-0 opacity-70" />
                            <span>Alumni {d.university}</span>
                          </div>
                          {config.showStrSip && (
                            <>
                              <div className="font-mono text-[10px] opacity-75">{d.str}</div>
                              <div className="font-mono text-[10px] opacity-75">{d.sip}</div>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDoctor(d.id);
                          setStep(3);
                          setDrawerOpen(true);
                        }}
                        className="mt-4 w-full rounded-md border border-current/20 py-2 text-center text-xs font-semibold transition-colors hover:bg-current/5"
                      >
                        Lihat Jadwal {d.displayName.split(",")[0]}
                      </button>
                    </div>
                  ))}
                </div>
              </section>,
            );
          }

          /* ================================================================
             BLOCK 5: PRACTICE LOCATIONS & LIVE AVAILABILITY
             ================================================================ */
          if (blockId === "blk_locations") {
            return wrapBlock(
              "blk_locations",
              "05 · PRACTICE_LOCATIONS",
              <section className="space-y-5">
                <div className="border-b border-current/10 pb-3">
                  <div className="font-mono text-[11px] uppercase opacity-60">
                    Kunjungan Tanpa Antre
                  </div>
                  <h2 className={`${headingFontClass} mt-0.5 text-2xl sm:text-3xl`}>
                    Lokasi Studio & Jam Praktik
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {locations.map((loc) => (
                    <div key={loc.id} className={`border p-5 text-xs space-y-3 ${cardBg}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{loc.name}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-500" /> Buka Hari Ini
                        </span>
                      </div>

                      <div className="flex items-start gap-2 opacity-80">
                        <MapPin className="mt-0.5 size-3.5 shrink-0" />
                        <span>{loc.address}</span>
                      </div>

                      <div className="flex items-center justify-between border-t border-current/10 pt-3 text-[11px]">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <Clock className="size-3.5 opacity-70" /> {loc.hours}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Phone className="size-3" /> {loc.phone}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>,
            );
          }

          return null;
        })}

        {/* Watermark Footer if Free Tier */}
        {!config.hideWatermark && (
          <div className="rounded-lg border border-current/15 bg-current/5 py-2.5 text-center text-xs opacity-75">
            Dibuat dengan <strong>KlikGigi.id</strong> — Sistem Operasi &amp; Website Klinik Gigi Indonesia
          </div>
        )}
      </div>

      {/* Sticky Bottom Booking Bar */}
      <div
        className={`sticky bottom-0 z-30 border-t px-4 py-3 backdrop-blur-md ${
          isNoir
            ? "border-[#262A32] bg-[#0E1013]/90"
            : "border-black/10 bg-white/90 text-[#111418]"
        }`}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="hidden sm:block text-xs">
            <div className="font-semibold">{config.clinicName} — Smart Slot Booking</div>
            <div className="opacity-70">
              Konfirmasi instan ke WhatsApp dalam &lt; 45 detik ·{" "}
              {config.requireDeposit
                ? `Deposit komitmen ${rupiah(config.depositAmount)} memotong tagihan akhir`
                : "Tanpa biaya reservasi"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => openBookingWith(LAYMAN_COMPLAINTS[0], 1)}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full px-6 py-2.5 text-xs font-semibold text-white shadow-xs"
            style={{ backgroundColor: config.primaryColor }}
          >
            <Calendar className="size-4" /> Buat Janji Temu Sekarang
          </button>
        </div>
      </div>

      {/* ====================================================================
          4-STEP MOBILE BOOKING DRAWER (Zero Emojis + Real QRIS Vector)
          ==================================================================== */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto max-h-[90svh] max-w-xl overflow-y-auto rounded-t-2xl p-5"
        >
          <SheetHeader className="text-left">
            <div className="flex items-center justify-between">
              <span
                className="font-mono text-[11px] font-semibold uppercase"
                style={{ color: config.primaryColor }}
              >
                {step <= 4 ? `Langkah ${step} dari 4` : "Reservasi Terkonfirmasi"}
              </span>
              {step > 1 && step <= 4 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" /> Kembali
                </button>
              )}
            </div>
            <SheetTitle className="text-base">
              {step === 1 && "Pilih Keluhan atau Perawatan"}
              {step === 2 && "Pilih Lokasi Studio & Dokter Gigi"}
              {step === 3 && "Pilih Tanggal & Jam Kosong (Real-Time)"}
              {step === 4 && "Data Diri & Komitmen Kehadiran (QRIS)"}
              {step === 5 && "Janji Temu Berhasil Dikunci"}
            </SheetTitle>
            <SheetDescription className="text-xs">
              {step === 1 &&
                "Pilih keluhan dengan bahasa sehari-hari; durasi kursi dihitung otomatis."}
              {step === 2 &&
                "Pilih cabang terdekat atau pilih dokter yang tersedia paling cepat."}
              {step === 3 &&
                "Hanya menampilkan slot di mana Dokter, Kursi Gigi, dan jeda sterilisasi tersedia."}
              {step === 4 &&
                `Deposit ${rupiah(config.depositAmount)} otomatis memotong total tagihan Anda di kasir klinik.`}
              {step === 5 &&
                "Detail jadwal, peta lokasi, dan tautan Pre-Visit Intake telah dikirim ke WhatsApp Anda."}
            </SheetDescription>
          </SheetHeader>

          {/* STEP 1: KELUHAN */}
          {step === 1 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {LAYMAN_COMPLAINTS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedComplaint(c);
                    setStep(2);
                  }}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left text-xs transition-all ${
                    selectedComplaint.id === c.id
                      ? "border-brand bg-brand-soft/40"
                      : "hover:bg-subtle"
                  }`}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card">
                    <ComplaintVectorIcon
                      id={c.id}
                      accentColor={config.primaryColor}
                      className="size-5"
                    />
                  </div>
                  <div>
                    <div className="font-semibold leading-snug">{c.title}</div>
                    <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                      ~{c.duration} mnt · Mulai {rupiah(c.price)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 2: LOKASI & DOKTER */}
          {step === 2 && (
            <div className="mt-4 space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs">Pilih Lokasi Cabang</Label>
                <div className="grid grid-cols-2 gap-2">
                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setSelectedLocation(loc.id)}
                      className={`rounded-lg border p-3 text-left ${
                        selectedLocation === loc.id
                          ? "border-brand bg-brand-soft/40"
                          : "hover:bg-subtle"
                      }`}
                    >
                      <div className="font-semibold">{loc.name}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{loc.hours}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Pilih Dokter Gigi</Label>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDoctor("ANY");
                    setStep(3);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg border p-3 text-left ${
                    selectedDoctor === "ANY"
                      ? "border-brand bg-brand-soft/50"
                      : "hover:bg-subtle"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="size-4 text-brand" />
                    <div>
                      <div className="font-semibold">
                        Dokter Siapa Saja yang Tersedia Paling Cepat
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Rekomendasi untuk mendapatkan pilihan jam kosong terbanyak
                      </div>
                    </div>
                  </div>
                </button>

                <div className="grid gap-2 pt-1">
                  {doctors.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setSelectedDoctor(d.id);
                        setStep(3);
                      }}
                      className={`flex items-center justify-between rounded-lg border p-3 text-left ${
                        selectedDoctor === d.id
                          ? "border-brand bg-brand-soft/40"
                          : "hover:bg-subtle"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <PersonAvatar name={d.fullName} color={d.color} size="sm" />
                        <div>
                          <div className="font-semibold">{d.displayName}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {d.specialty} · {d.sip}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-brand-ink">
                        Pilih
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TANGGAL & JAM SMART SLOTS */}
          {step === 3 && (
            <div className="mt-4 space-y-4 text-xs">
              <div>
                <Label className="text-xs">Pilih Tanggal (14 Hari ke Depan)</Label>
                <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-1">
                  {next14Days.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDate(d)}
                      className={`shrink-0 rounded-md border px-3 py-2 text-center ${
                        selectedDate === d
                          ? "border-brand bg-brand text-brand-foreground"
                          : "bg-card hover:bg-subtle"
                      }`}
                    >
                      <div className="font-mono text-[11px] font-semibold">{dateCompact(d)}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs">
                  Jam Tersedia (Durasi {selectedComplaint.duration} mnt + 10 mnt sterilisasi kursi)
                </Label>
                <div className="mt-1.5 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {SMART_SLOTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSlot(s)}
                      className={`num h-9 rounded-md border font-mono font-semibold ${
                        selectedSlot === s
                          ? "border-brand bg-brand text-brand-foreground"
                          : "bg-card hover:bg-subtle"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <Button className="w-full" onClick={() => setStep(4)}>
                Lanjut ke Konfirmasi Data
              </Button>
            </div>
          )}

          {/* STEP 4: DATA RINGKAS & REAL VECTOR QRIS */}
          {step === 4 && (
            <div className="mt-4 space-y-4 text-xs">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Nama Lengkap Pasien</Label>
                  <Input
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Mis. Rina Wijaya"
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Nomor WhatsApp Aktif</Label>
                  <Input
                    value={patientWa}
                    onChange={(e) => setPatientWa(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Catatan Keluhan Singkat (Opsional)</Label>
                <Input
                  value={patientNote}
                  onChange={(e) => setPatientNote(e.target.value)}
                  placeholder="Mis. Gigi geraham kiri bawah ngilu saat minum dingin"
                  className="mt-1 h-9 text-xs"
                />
              </div>

              {config.requireDeposit && (
                <div className="flex flex-col items-center justify-between gap-4 rounded-xl border bg-subtle/60 p-4 sm:flex-row">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 font-semibold text-brand-ink">
                      <QrCode className="size-4" /> Deposit Komitmen Kehadiran:{" "}
                      {rupiah(config.depositAmount)}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Deposit ini <strong>100% memotong tagihan akhir Anda</strong> di kasir klinik.
                      Kunci slot kursi gigi Anda dalam <strong>09:48 menit</strong>.
                    </p>
                  </div>
                  <DynamicQrisSvg amount={config.depositAmount} />
                </div>
              )}

              <Button
                className="w-full"
                onClick={() => {
                  setStep(5);
                  toast.success(
                    config.requireDeposit
                      ? `Pembayaran Deposit QRIS ${rupiah(config.depositAmount)} terverifikasi! Jadwal terkunci.`
                      : "Jadwal janji temu Anda berhasil dikunci!",
                  );
                }}
              >
                <CheckCircle2 className="size-4" />{" "}
                {config.requireDeposit
                  ? "Simulasikan Bayar QRIS & Kunci Jadwal"
                  : "Konfirmasi & Kunci Jadwal"}
              </Button>
            </div>
          )}

          {/* STEP 5: BOOKING SUCCESS */}
          {step === 5 && (
            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-lg border border-success/30 bg-success-soft/50 p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-sm text-success">
                  <CheckCircle2 className="size-4" /> Jadwal Terkonfirmasi ({dateCompact(selectedDate)} ·{" "}
                  {selectedSlot})
                </div>
                <div className="text-foreground/80">
                  Layanan: <strong>{selectedComplaint.title}</strong> ·{" "}
                  {config.requireDeposit
                    ? `Deposit ${rupiah(config.depositAmount)} tercatat otomatis di Kasir.`
                    : "Konfirmasi dikirim ke WhatsApp."}
                </div>
              </div>

              <div className="rounded-lg border bg-subtle p-4 space-y-2.5">
                <div className="flex items-center gap-1.5 font-semibold">
                  <ClipboardCheck className="size-4 text-brand" /> Hemat Waktu di Klinik (Digital
                  Pre-Visit Intake)
                </div>
                <p className="text-muted-foreground">
                  Lengkapi riwayat alergi obat dan kondisi kesehatan singkat dari HP Anda sekarang
                  agar langsung masuk ke ruang periksa saat tiba.
                </p>
                <Button asChild className="w-full">
                  <Link href="/intake/pt_rina">
                    <ClipboardCheck className="size-4" /> Isi Data Kesehatan Singkat (1 Menit)
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
