import type { AppointmentStatus, LabStatus, PaymentStatus, PlanTier } from "./types";

const idr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const idrCompact = new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 });

/** Rp450.000 */
export const rupiah = (n: number) => idr.format(n).replace(/\s/g, "");
/** Rp1,2 jt */
export const rupiahShort = (n: number) => `Rp${idrCompact.format(n)}`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const MONTHS_LONG = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
export const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
export const DAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function parse(d: string) {
  const [y, m, day] = d.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day));
}

/** 26 Okt 2026 */
export const dateShort = (d: string) => {
  const x = parse(d);
  return `${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
};
/** Senin, 26 Oktober 2026 */
export const dateLong = (d: string) => {
  const x = parse(d);
  return `${DAYS[x.getUTCDay()]}, ${x.getUTCDate()} ${MONTHS_LONG[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
};
/** Sen, 26 Okt */
export const dateCompact = (d: string) => {
  const x = parse(d);
  return `${DAYS_SHORT[x.getUTCDay()]}, ${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]}`;
};
export const addDays = (d: string, n: number) => {
  const x = parse(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
};
export const dayOfWeek = (d: string) => parse(d).getUTCDay();

export const age = (dob: string, today = "2026-10-26") => {
  const a = parse(dob);
  const b = parse(today);
  let y = b.getUTCFullYear() - a.getUTCFullYear();
  if (b.getUTCMonth() < a.getUTCMonth() || (b.getUTCMonth() === a.getUTCMonth() && b.getUTCDate() < a.getUTCDate())) y--;
  return y;
};

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const fromMinutes = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

export const initials = (name: string) =>
  name
    .replace(/^(drg\.|dr\.)\s*/i, "")
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

// ---------- Status metadata ----------
export const appointmentStatusMeta: Record<
  AppointmentStatus,
  { label: string; short: string; color: string; description: string }
> = {
  PENDING_DEPOSIT: { label: "Menunggu Deposit", short: "Deposit", color: "var(--st-pending)", description: "QRIS belum dibayar" },
  BOOKED: { label: "Terjadwal", short: "Terjadwal", color: "var(--st-booked)", description: "Belum konfirmasi WA" },
  CONFIRMED: { label: "Terkonfirmasi", short: "Konfirmasi", color: "var(--st-confirmed)", description: "Terkonfirmasi via WA" },
  ARRIVED: { label: "Di Ruang Tunggu", short: "Menunggu", color: "var(--st-arrived)", description: "Pasien sudah tiba" },
  IN_CHAIR: { label: "Sedang Tindakan", short: "Di Kursi", color: "var(--st-inchair)", description: "Pasien di kursi" },
  COMPLETED: { label: "Menunggu Kasir", short: "Ke Kasir", color: "var(--st-completed)", description: "Tindakan selesai, belum bayar" },
  PAID: { label: "Lunas", short: "Lunas", color: "var(--st-paid)", description: "Selesai & lunas" },
  CANCELLED: { label: "Dibatalkan", short: "Batal", color: "var(--st-cancelled)", description: "Dibatalkan" },
  NO_SHOW: { label: "Tidak Datang", short: "No-show", color: "var(--st-noshow)", description: "Pasien tidak hadir" },
};

export const paymentStatusMeta: Record<PaymentStatus, { label: string; color: string }> = {
  UNPAID: { label: "Belum Bayar", color: "var(--st-completed)" },
  PARTIAL: { label: "Cicilan", color: "var(--st-confirmed)" },
  PAID: { label: "Lunas", color: "var(--st-paid)" },
};

export const labStatusMeta: Record<LabStatus, { label: string; color: string; step: number }> = {
  ORDERED: { label: "Dipesan", color: "var(--st-booked)", step: 0 },
  SENT: { label: "Dikirim ke Lab", color: "var(--st-confirmed)", step: 1 },
  RECEIVED: { label: "Diterima Klinik", color: "var(--st-arrived)", step: 2 },
  FITTED: { label: "Terpasang", color: "var(--st-paid)", step: 3 },
};

export const planTierMeta: Record<PlanTier, { label: string; monthly: number; yearly: number }> = {
  FREE: { label: "Free", monthly: 0, yearly: 0 },
  SOLO_PRO: { label: "Solo Pro", monthly: 129000, yearly: 99000 },
  CLINIC_GROWTH: { label: "Clinic Growth", monthly: 349000, yearly: 279000 },
  CLINIC_PRO: { label: "Clinic Pro", monthly: 699000, yearly: 549000 },
};

export const paymentMethodLabel = { CASH: "Tunai", QRIS: "QRIS", DEBIT: "Kartu Debit", CREDIT: "Kartu Kredit", TRANSFER: "Transfer Bank" } as const;
export const sourceLabel = { LANDING_PAGE: "Landing Page", WALK_IN: "Walk-in", WHATSAPP: "WhatsApp", RECALL: "Recall" } as const;
export const categoryLabel = {
  CONSULT: "Konsultasi & Diagnostik",
  SCALING: "Scaling / Pembersihan",
  FILLING: "Tambal / Restorasi",
  ENDO: "Saluran Akar (PSA)",
  EXTRACTION: "Cabut Gigi",
  SURGERY: "Bedah Mulut",
  ORTHO: "Ortodonti (Behel)",
  AESTHETIC: "Estetik",
  PROSTHO: "Prostodonti",
  PEDO: "Gigi Anak",
} as const;
