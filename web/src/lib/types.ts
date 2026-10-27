// Domain types for KlikGigi — mirrors db.md schema (front-end only, mock data).

export type TenantMode = "SOLO" | "CLINIC";
export type PlanTier = "FREE" | "SOLO_PRO" | "CLINIC_GROWTH" | "CLINIC_PRO";
export type Role = "OWNER" | "DOCTOR" | "NURSE" | "CASHIER";

export type AppointmentStatus =
  | "PENDING_DEPOSIT"
  | "BOOKED"
  | "CONFIRMED"
  | "ARRIVED"
  | "IN_CHAIR"
  | "COMPLETED"
  | "PAID"
  | "CANCELLED"
  | "NO_SHOW";

export type BookingSource = "LANDING_PAGE" | "WALK_IN" | "WHATSAPP" | "RECALL";

export type ServiceCategory =
  | "CONSULT"
  | "SCALING"
  | "FILLING"
  | "ENDO"
  | "EXTRACTION"
  | "SURGERY"
  | "ORTHO"
  | "AESTHETIC"
  | "PROSTHO"
  | "PEDO";

export type Surface = "M" | "O" | "D" | "B" | "L";
export type LayerStatus = "EXISTING" | "PATHOLOGY" | "PLANNED" | "COMPLETED" | "MISSING";
export type ToothPresence = "PRESENT" | "MISSING" | "IMPACTED" | "UNERUPTED";

export type PaymentMethod = "CASH" | "QRIS" | "DEBIT" | "CREDIT" | "TRANSFER";
export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";
export type LabStatus = "ORDERED" | "SENT" | "RECEIVED" | "FITTED";
export type PlanStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type PhaseStatus = "PENDING" | "SCHEDULED" | "DONE";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  customDomain?: string;
  mode: TenantMode;
  tier: PlanTier;
  trialEndsAt?: string;
}

export interface Location {
  id: string;
  name: string;
  shortName: string;
  address: string;
  phone: string;
  mapsUrl: string;
  hours: string;
}

export interface Chair {
  id: string;
  locationId: string;
  name: string;
  isActive: boolean;
}

export interface Staff {
  id: string;
  role: Role;
  fullName: string;
  titlePrefix?: string;
  titleSuffix?: string;
  displayName: string;
  initials: string;
  sip?: string;
  str?: string;
  phone: string;
  email: string;
  university?: string;
  specialty?: string;
  color: string; // calendar accent
  isActive: boolean;
}

export interface Service {
  id: string;
  code: string;
  clinicalName: string;
  laymanName: string;
  category: ServiceCategory;
  durationMinutes: number;
  bufferMinutes: number;
  basePrice: number;
  materialCost: number;
  requiresTooth: boolean;
  requiresConsent: boolean;
  bookableOnline: boolean;
}

export interface MedicalAlerts {
  allergies: string[];
  systemic: string[];
  isPregnant: boolean;
}

export interface Patient {
  id: string;
  mrn: string;
  nik?: string;
  fullName: string;
  dob: string;
  gender: "L" | "P";
  phone: string;
  email?: string;
  address?: string;
  alerts: MedicalAlerts;
  lastVisit?: string;
  lastScaling?: string;
  totalVisits: number;
  outstanding: number;
  lifetimeValue: number;
  tags: string[];
  source: BookingSource;
  intakeCompleted: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  chairId: string;
  locationId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string; // HH:mm (service end, excludes buffer)
  bufferMinutes: number;
  status: AppointmentStatus;
  arrivedAt?: string; // HH:mm
  depositAmount: number;
  depositPaid: boolean;
  source: BookingSource;
  confirmedViaWa: boolean;
  notes?: string;
  visitLabel?: string; // "Kunjungan 2/3"
}

export interface SurfaceState {
  code: string;
  layer: LayerStatus;
}

export interface ToothState {
  presence: ToothPresence;
  wholeCode?: string;
  wholeLayer?: LayerStatus;
  surfaces: Partial<Record<Surface, SurfaceState>>;
  mobility?: number;
}

export type ChartData = Record<string, ToothState>;

export interface ToothHistory {
  id: string;
  patientId: string;
  tooth: number;
  surfaces: Surface[];
  condition: string;
  layer: LayerStatus;
  serviceId?: string;
  doctorId: string;
  date: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  serviceId: string;
  description: string;
  tooth?: number;
  surfaces?: Surface[];
  doctorId: string;
  nurseId?: string;
  qty: number;
  unitPrice: number;
  discount: number;
  materialCost: number;
  labCost: number;
}

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  note?: string;
}

export interface Invoice {
  id: string;
  number: string;
  patientId: string;
  appointmentId?: string;
  date: string;
  items: InvoiceItem[];
  discount: number;
  depositDeducted: number;
  payments: Payment[];
  status: PaymentStatus;
  isInstallment: boolean;
  installmentPlan?: { count: number; amountPer: number; nextDue: string };
}

export interface TreatmentPhase {
  id: string;
  order: number;
  tooth?: number;
  serviceId: string;
  estimatedPrice: number;
  intervalDays: number;
  status: PhaseStatus;
  scheduledDate?: string;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  doctorId: string;
  title: string;
  status: PlanStatus;
  createdAt: string;
  phases: TreatmentPhase[];
  consentSigned: boolean;
}

export interface LabOrder {
  id: string;
  number: string;
  patientId: string;
  doctorId: string;
  vendor: string;
  workType: string;
  tooth?: number;
  shade?: string;
  cost: number;
  sentDate?: string;
  expectedReturn: string;
  status: LabStatus;
  notes?: string;
}

export interface CommissionEntry {
  id: string;
  doctorId: string;
  invoiceNumber: string;
  patientName: string;
  serviceName: string;
  date: string;
  gross: number;
  deductions: number;
  base: number;
  rateLabel: string;
  earned: number;
  paidRatio: number;
  releasable: number;
  status: "UNSETTLED" | "SETTLED";
}

export interface CommissionRule {
  id: string;
  doctorId?: string;
  serviceCategory?: ServiceCategory;
  basis: "GROSS" | "NET";
  type: "PERCENTAGE" | "FLAT";
  value: number;
  deductPromoFromDoctor: boolean;
}

export interface WaAutomation {
  id: string;
  trigger: string;
  name: string;
  description: string;
  delay: string;
  enabled: boolean;
  sent30d: number;
  template: string;
}

export interface WaMessage {
  id: string;
  patientId: string;
  automation: string;
  sentAt: string;
  status: "SENT" | "DELIVERED" | "READ" | "REPLIED" | "FAILED";
  preview: string;
}

export interface RecallItem {
  patientId: string;
  reason: string;
  lastDate: string;
  dueDate: string;
  potential: number;
  status: "DUE" | "INVITED" | "BOOKED" | "OVERDUE";
}

export interface Notification {
  id: string;
  type: "booking" | "payment" | "lab" | "intake" | "system" | "wa";
  title: string;
  body: string;
  time: string;
  unread: boolean;
  href?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  costPerUnit: number;
  category: string;
}

export interface MedicineItem {
  id: string;
  code: string;
  name: string;
  category: "ANTIBIOTIC" | "ANALGESIC" | "ANTISEPTIC" | "TOPICAL" | "ALKES";
  unit: string;
  price: number;
  cost: number;
  stock: number;
  defaultSigna: string;
  allergyKeywords: string[];
  safeAlternativeId?: string;
  pregnancySafe: boolean;
}

export interface PrescribedMedicine {
  id: string;
  medicineId: string;
  name: string;
  qty: number;
  unit: string;
  unitPrice: number;
  unitCost: number;
  signa: string;
  notes?: string;
  reviewedByPharmacy: boolean;
  allergyOverrideNote?: string;
}

