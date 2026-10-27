import type {
  Appointment,
  Chair,
  ChartData,
  CommissionEntry,
  CommissionRule,
  InventoryItem,
  Invoice,
  LabOrder,
  Location,
  MedicineItem,
  Notification,
  Patient,
  RecallItem,
  Service,
  Staff,
  Tenant,
  ToothHistory,
  TreatmentPlan,
  WaAutomation,
  WaMessage,
} from "./types";

/** "Today" for the prototype — every screen is anchored to this date. */
export const TODAY = "2026-10-26";
export const NOW_TIME = "10:12";

export const tenant: Tenant = {
  id: "tn_01",
  name: "Klinik Gigi Senyum Sehat",
  slug: "senyumsehat",
  customDomain: "senyumsehat.id",
  mode: "CLINIC",
  tier: "CLINIC_GROWTH",
};

export const locations: Location[] = [
  {
    id: "loc_tebet",
    name: "Senyum Sehat — Tebet",
    shortName: "Tebet",
    address: "Jl. Tebet Raya No. 42, Tebet, Jakarta Selatan 12810",
    phone: "0812-8800-4210",
    mapsUrl: "https://maps.google.com/?q=Tebet+Raya+42",
    hours: "Senin–Sabtu, 09:00–21:00",
  },
  {
    id: "loc_kemang",
    name: "Senyum Sehat — Kemang",
    shortName: "Kemang",
    address: "Jl. Kemang Raya No. 8B, Mampang Prapatan, Jakarta Selatan 12730",
    phone: "0812-8800-4211",
    mapsUrl: "https://maps.google.com/?q=Kemang+Raya+8B",
    hours: "Senin–Jumat, 13:00–21:00",
  },
];

export const chairs: Chair[] = [
  { id: "ch_1", locationId: "loc_tebet", name: "Kursi 1", isActive: true },
  { id: "ch_2", locationId: "loc_tebet", name: "Kursi 2", isActive: true },
  { id: "ch_3", locationId: "loc_tebet", name: "Kursi 3", isActive: true },
  { id: "ch_4", locationId: "loc_kemang", name: "Kursi 1", isActive: true },
  { id: "ch_5", locationId: "loc_kemang", name: "Kursi 2", isActive: false },
];

export const staff: Staff[] = [
  {
    id: "dr_budi",
    role: "OWNER",
    fullName: "Budi Santoso",
    titlePrefix: "drg.",
    displayName: "drg. Budi Santoso",
    initials: "BS",
    sip: "SIP 446/2.1.3/31.74/-1.779.3/2023",
    str: "STR 3121100320145872",
    phone: "0812-1111-2020",
    email: "budi@senyumsehat.id",
    university: "Universitas Indonesia",
    specialty: "Dokter Gigi Umum & Estetik",
    color: "#0F766E",
    isActive: true,
  },
  {
    id: "dr_siti",
    role: "DOCTOR",
    fullName: "Siti Rahmawati",
    titlePrefix: "drg.",
    titleSuffix: "Sp.Ort",
    displayName: "drg. Siti Rahmawati, Sp.Ort",
    initials: "SR",
    sip: "SIP 446/2.1.3/31.74/-1.779.3/2024",
    str: "STR 3122200420157731",
    phone: "0812-2222-3030",
    email: "siti@senyumsehat.id",
    university: "Universitas Padjadjaran",
    specialty: "Spesialis Ortodonti (Behel)",
    color: "#7C3AED",
    isActive: true,
  },
  {
    id: "dr_andi",
    role: "DOCTOR",
    fullName: "Andi Pratama",
    titlePrefix: "drg.",
    titleSuffix: "Sp.KG",
    displayName: "drg. Andi Pratama, Sp.KG",
    initials: "AP",
    sip: "SIP 446/2.1.3/31.74/-1.779.3/2022",
    str: "STR 3121100520139915",
    phone: "0812-3333-4040",
    email: "andi@senyumsehat.id",
    university: "Universitas Gadjah Mada",
    specialty: "Spesialis Konservasi Gigi (Saluran Akar)",
    color: "#B45309",
    isActive: true,
  },
  {
    id: "ns_rini",
    role: "NURSE",
    fullName: "Rini Anggraini",
    displayName: "Rini Anggraini",
    initials: "RA",
    phone: "0813-4444-5050",
    email: "rini@senyumsehat.id",
    color: "#64748B",
    isActive: true,
  },
  {
    id: "ns_dewi",
    role: "NURSE",
    fullName: "Dewi Lestari",
    displayName: "Dewi Lestari",
    initials: "DL",
    phone: "0813-5555-6060",
    email: "dewi@senyumsehat.id",
    color: "#64748B",
    isActive: true,
  },
  {
    id: "cs_maya",
    role: "CASHIER",
    fullName: "Maya Puspita",
    displayName: "Maya Puspita",
    initials: "MP",
    phone: "0813-6666-7070",
    email: "maya@senyumsehat.id",
    color: "#64748B",
    isActive: true,
  },
];

export const doctors = staff.filter((s) => s.role === "OWNER" || s.role === "DOCTOR");
export const nurses = staff.filter((s) => s.role === "NURSE");

/** Doctor weekly schedule (day 0 = Minggu). */
export const doctorSchedules = [
  { doctorId: "dr_budi", locationId: "loc_tebet", chairId: "ch_1", days: [1, 2, 3, 4, 5, 6], start: "09:00", end: "17:00" },
  { doctorId: "dr_budi", locationId: "loc_kemang", chairId: "ch_4", days: [2, 4], start: "18:00", end: "21:00" },
  { doctorId: "dr_siti", locationId: "loc_tebet", chairId: "ch_2", days: [1, 3, 5], start: "09:00", end: "15:00" },
  { doctorId: "dr_siti", locationId: "loc_kemang", chairId: "ch_4", days: [2, 4], start: "13:00", end: "17:00" },
  { doctorId: "dr_andi", locationId: "loc_tebet", chairId: "ch_3", days: [1, 2, 3, 4, 6], start: "10:00", end: "18:00" },
];

export const services: Service[] = [
  { id: "sv_konsul", code: "KON-01", clinicalName: "Konsultasi & Pemeriksaan Awal", laymanName: "Konsultasi & Cek Gigi", category: "CONSULT", durationMinutes: 20, bufferMinutes: 10, basePrice: 150000, materialCost: 0, requiresTooth: false, requiresConsent: false, bookableOnline: true },
  { id: "sv_scaling", code: "SCL-01", clinicalName: "Scaling & Polishing RA/RB", laymanName: "Bersihkan Karang Gigi", category: "SCALING", durationMinutes: 30, bufferMinutes: 10, basePrice: 350000, materialCost: 25000, requiresTooth: false, requiresConsent: false, bookableOnline: true },
  { id: "sv_komposit1", code: "RST-01", clinicalName: "Restorasi Komposit Kelas I", laymanName: "Tambal Gigi (Kecil)", category: "FILLING", durationMinutes: 45, bufferMinutes: 10, basePrice: 350000, materialCost: 45000, requiresTooth: true, requiresConsent: false, bookableOnline: true },
  { id: "sv_komposit2", code: "RST-02", clinicalName: "Restorasi Komposit Kelas II", laymanName: "Tambal Gigi Berlubang", category: "FILLING", durationMinutes: 45, bufferMinutes: 10, basePrice: 450000, materialCost: 60000, requiresTooth: true, requiresConsent: false, bookableOnline: true },
  { id: "sv_gic", code: "RST-05", clinicalName: "Restorasi GIC", laymanName: "Tambal Sementara", category: "FILLING", durationMinutes: 30, bufferMinutes: 10, basePrice: 250000, materialCost: 30000, requiresTooth: true, requiresConsent: false, bookableOnline: false },
  { id: "sv_psa1", code: "END-01", clinicalName: "Perawatan Saluran Akar — Kunjungan 1 (Open Access)", laymanName: "Perawatan Saraf Gigi", category: "ENDO", durationMinutes: 60, bufferMinutes: 15, basePrice: 900000, materialCost: 120000, requiresTooth: true, requiresConsent: true, bookableOnline: false },
  { id: "sv_psa2", code: "END-02", clinicalName: "PSA — Kunjungan 2 (Cleaning & Shaping)", laymanName: "Perawatan Saraf Gigi (Lanjutan)", category: "ENDO", durationMinutes: 60, bufferMinutes: 15, basePrice: 800000, materialCost: 100000, requiresTooth: true, requiresConsent: false, bookableOnline: false },
  { id: "sv_psa3", code: "END-03", clinicalName: "PSA — Kunjungan 3 (Obturasi)", laymanName: "Perawatan Saraf Gigi (Akhir)", category: "ENDO", durationMinutes: 60, bufferMinutes: 15, basePrice: 850000, materialCost: 110000, requiresTooth: true, requiresConsent: false, bookableOnline: false },
  { id: "sv_cabut", code: "EKS-01", clinicalName: "Ekstraksi Gigi Permanen", laymanName: "Cabut Gigi", category: "EXTRACTION", durationMinutes: 45, bufferMinutes: 15, basePrice: 400000, materialCost: 35000, requiresTooth: true, requiresConsent: true, bookableOnline: true },
  { id: "sv_cabutanak", code: "EKS-02", clinicalName: "Ekstraksi Gigi Sulung", laymanName: "Cabut Gigi Anak", category: "PEDO", durationMinutes: 30, bufferMinutes: 10, basePrice: 200000, materialCost: 20000, requiresTooth: true, requiresConsent: true, bookableOnline: true },
  { id: "sv_odonte", code: "BDH-01", clinicalName: "Odontektomi (Gigi Impaksi)", laymanName: "Operasi Gigi Bungsu", category: "SURGERY", durationMinutes: 90, bufferMinutes: 20, basePrice: 3500000, materialCost: 350000, requiresTooth: true, requiresConsent: true, bookableOnline: true },
  { id: "sv_ortho_pasang", code: "ORT-01", clinicalName: "Pemasangan Fixed Orthodontic (Metal)", laymanName: "Pasang Behel", category: "ORTHO", durationMinutes: 90, bufferMinutes: 15, basePrice: 8000000, materialCost: 1200000, requiresTooth: false, requiresConsent: true, bookableOnline: true },
  { id: "sv_ortho_kontrol", code: "ORT-02", clinicalName: "Kontrol Fixed Orthodontic", laymanName: "Kontrol Behel", category: "ORTHO", durationMinutes: 30, bufferMinutes: 10, basePrice: 300000, materialCost: 30000, requiresTooth: false, requiresConsent: false, bookableOnline: true },
  { id: "sv_bleaching", code: "EST-01", clinicalName: "In-Office Bleaching", laymanName: "Memutihkan Gigi", category: "AESTHETIC", durationMinutes: 60, bufferMinutes: 15, basePrice: 2500000, materialCost: 400000, requiresTooth: false, requiresConsent: true, bookableOnline: true },
  { id: "sv_veneer", code: "EST-02", clinicalName: "Direct Composite Veneer (per gigi)", laymanName: "Veneer Gigi", category: "AESTHETIC", durationMinutes: 60, bufferMinutes: 10, basePrice: 1200000, materialCost: 150000, requiresTooth: true, requiresConsent: true, bookableOnline: true },
  { id: "sv_crown", code: "PRS-01", clinicalName: "Crown Zirconia (per unit)", laymanName: "Mahkota Gigi", category: "PROSTHO", durationMinutes: 60, bufferMinutes: 15, basePrice: 4500000, materialCost: 100000, requiresTooth: true, requiresConsent: true, bookableOnline: false },
  { id: "sv_fluor", code: "PED-01", clinicalName: "Aplikasi Topikal Fluoride", laymanName: "Fluoride Anak", category: "PEDO", durationMinutes: 20, bufferMinutes: 10, basePrice: 200000, materialCost: 25000, requiresTooth: false, requiresConsent: false, bookableOnline: true },
  { id: "sv_rontgen", code: "RAD-01", clinicalName: "Foto Rontgen Periapikal", laymanName: "Rontgen Gigi", category: "CONSULT", durationMinutes: 10, bufferMinutes: 5, basePrice: 150000, materialCost: 20000, requiresTooth: true, requiresConsent: false, bookableOnline: false },
];

export const patients: Patient[] = [
  { id: "pt_rina", mrn: "RM-2024-0182", nik: "3174025507960003", fullName: "Rina Wijaya", dob: "1998-07-15", gender: "P", phone: "0812-9087-1122", email: "rina.w@gmail.com", address: "Jl. Tebet Barat Dalam II No. 7, Jakarta Selatan", alerts: { allergies: ["Amoxicillin"], systemic: [], isPregnant: false }, lastVisit: "2026-04-22", lastScaling: "2026-04-22", totalVisits: 6, outstanding: 0, lifetimeValue: 2850000, tags: ["Pasien Setia"], source: "LANDING_PAGE", intakeCompleted: true, createdAt: "2024-03-02" },
  { id: "pt_ahmad", mrn: "RM-2025-0411", nik: "3174031203890001", fullName: "Ahmad Fauzi", dob: "1989-03-12", gender: "L", phone: "0813-1100-2233", address: "Jl. Casablanca Raya, Jakarta Selatan", alerts: { allergies: [], systemic: [], isPregnant: false }, lastVisit: "2026-09-02", totalVisits: 3, outstanding: 0, lifetimeValue: 1250000, tags: [], source: "WHATSAPP", intakeCompleted: true, createdAt: "2025-06-11" },
  { id: "pt_dedi", mrn: "RM-2025-0533", nik: "3174040908920002", fullName: "Dedi Kurniawan", dob: "1992-08-09", gender: "L", phone: "0815-7788-9900", email: "dedi.k@outlook.com", address: "Jl. Saharjo No. 110, Manggarai, Jakarta Selatan", alerts: { allergies: ["NSAID (Ibuprofen)"], systemic: ["Hipertensi"], isPregnant: false }, lastVisit: "2026-10-19", totalVisits: 4, outstanding: 0, lifetimeValue: 1950000, tags: ["PSA Berjalan"], source: "LANDING_PAGE", intakeCompleted: true, createdAt: "2025-08-20" },
  { id: "pt_maya", mrn: "RM-2026-0702", nik: "3174054411000004", fullName: "Maya Sari", dob: "2000-11-04", gender: "P", phone: "0819-2233-4455", alerts: { allergies: [], systemic: [], isPregnant: false }, lastVisit: "2026-10-12", totalVisits: 2, outstanding: 0, lifetimeValue: 350000, tags: [], source: "LANDING_PAGE", intakeCompleted: true, createdAt: "2026-10-01" },
  { id: "pt_nadia", mrn: "RM-2025-0298", fullName: "Nadia Putri", dob: "2003-02-21", gender: "P", phone: "0812-5566-7788", alerts: { allergies: [], systemic: [], isPregnant: false }, lastVisit: "2026-09-28", totalVisits: 14, outstanding: 4000000, lifetimeValue: 6200000, tags: ["Ortho", "Cicilan"], source: "LANDING_PAGE", intakeCompleted: true, createdAt: "2025-03-14" },
  { id: "pt_hendra", mrn: "RM-2024-0091", fullName: "Hendra Gunawan", dob: "1975-05-30", gender: "L", phone: "0811-9900-1122", alerts: { allergies: ["Lidocaine dengan Epinefrin"], systemic: ["Diabetes Melitus Tipe 2", "Hipertensi"], isPregnant: false }, lastVisit: "2026-10-05", totalVisits: 9, outstanding: 0, lifetimeValue: 9800000, tags: ["Crown", "VIP"], source: "WALK_IN", intakeCompleted: true, createdAt: "2024-01-09" },
  { id: "pt_larasati", mrn: "RM-2026-0688", fullName: "Larasati Kusuma", dob: "1994-09-18", gender: "P", phone: "0857-1234-5678", alerts: { allergies: [], systemic: [], isPregnant: true }, lastVisit: "2026-09-20", totalVisits: 2, outstanding: 0, lifetimeValue: 500000, tags: ["Hamil Trimester 2"], source: "LANDING_PAGE", intakeCompleted: true, createdAt: "2026-08-30" },
  { id: "pt_bayu", mrn: "RM-2026-0721", fullName: "Bayu Saputra", dob: "2016-06-10", gender: "L", phone: "0812-7654-3210", alerts: { allergies: [], systemic: [], isPregnant: false }, totalVisits: 0, outstanding: 0, lifetimeValue: 0, tags: ["Pasien Anak"], source: "LANDING_PAGE", intakeCompleted: false, createdAt: "2026-10-24" },
  { id: "pt_citra", mrn: "RM-2025-0377", fullName: "Citra Maharani", dob: "1990-12-01", gender: "P", phone: "0878-2211-3344", alerts: { allergies: ["Penicillin"], systemic: ["Asma"], isPregnant: false }, lastVisit: "2026-04-10", lastScaling: "2026-04-10", totalVisits: 5, outstanding: 0, lifetimeValue: 3400000, tags: [], source: "RECALL", intakeCompleted: true, createdAt: "2025-04-18" },
  { id: "pt_fajar", mrn: "RM-2026-0715", fullName: "Fajar Nugroho", dob: "1996-01-25", gender: "L", phone: "0821-3344-5566", alerts: { allergies: [], systemic: [], isPregnant: false }, lastVisit: "2026-10-20", totalVisits: 1, outstanding: 0, lifetimeValue: 150000, tags: [], source: "LANDING_PAGE", intakeCompleted: true, createdAt: "2026-10-18" },
  { id: "pt_sri", mrn: "RM-2024-0145", fullName: "Sri Wahyuni", dob: "1968-04-14", gender: "P", phone: "0812-4455-6677", alerts: { allergies: [], systemic: ["Penyakit Jantung (Pasien Pengencer Darah)"], isPregnant: false }, lastVisit: "2026-08-14", totalVisits: 7, outstanding: 1200000, lifetimeValue: 5600000, tags: ["Gigi Tiruan"], source: "WALK_IN", intakeCompleted: true, createdAt: "2024-02-11" },
  { id: "pt_kevin", mrn: "RM-2026-0719", fullName: "Kevin Tanoto", dob: "1999-10-02", gender: "L", phone: "0811-2020-3030", alerts: { allergies: [], systemic: [], isPregnant: false }, totalVisits: 0, outstanding: 0, lifetimeValue: 0, tags: [], source: "LANDING_PAGE", intakeCompleted: true, createdAt: "2026-10-22" },
  { id: "pt_putri", mrn: "RM-2025-0455", fullName: "Putri Ayu Lestari", dob: "2001-07-07", gender: "P", phone: "0813-8080-9090", alerts: { allergies: [], systemic: [], isPregnant: false }, lastVisit: "2026-04-25", lastScaling: "2026-04-25", totalVisits: 4, outstanding: 0, lifetimeValue: 2600000, tags: ["Veneer"], source: "LANDING_PAGE", intakeCompleted: true, createdAt: "2025-07-02" },
  { id: "pt_rudi", mrn: "RM-2024-0201", fullName: "Rudi Hartono", dob: "1983-03-03", gender: "L", phone: "0812-6060-7070", alerts: { allergies: [], systemic: [], isPregnant: false }, lastVisit: "2026-04-18", lastScaling: "2026-04-18", totalVisits: 8, outstanding: 0, lifetimeValue: 4100000, tags: [], source: "WALK_IN", intakeCompleted: true, createdAt: "2024-04-01" },
  { id: "pt_anisa", mrn: "RM-2026-0724", fullName: "Anisa Rahma", dob: "1997-05-19", gender: "P", phone: "0858-1010-2020", alerts: { allergies: [], systemic: [], isPregnant: false }, totalVisits: 0, outstanding: 0, lifetimeValue: 0, tags: [], source: "LANDING_PAGE", intakeCompleted: false, createdAt: "2026-10-25" },
  { id: "pt_yoga", mrn: "RM-2025-0510", fullName: "Yoga Prasetyo", dob: "1987-11-11", gender: "L", phone: "0812-3030-4040", alerts: { allergies: ["Latex"], systemic: [], isPregnant: false }, lastVisit: "2026-10-14", totalVisits: 3, outstanding: 0, lifetimeValue: 4200000, tags: ["Odontektomi"], source: "LANDING_PAGE", intakeCompleted: true, createdAt: "2025-09-09" },
];

export const appointments: Appointment[] = [
  // Kursi 1 — drg. Budi
  { id: "ap_01", patientId: "pt_rina", doctorId: "dr_budi", chairId: "ch_1", locationId: "loc_tebet", serviceId: "sv_scaling", date: TODAY, start: "09:00", end: "09:30", bufferMinutes: 10, status: "PAID", arrivedAt: "08:52", depositAmount: 50000, depositPaid: true, source: "LANDING_PAGE", confirmedViaWa: true },
  { id: "ap_02", patientId: "pt_dedi", doctorId: "dr_budi", chairId: "ch_1", locationId: "loc_tebet", serviceId: "sv_psa2", date: TODAY, start: "10:00", end: "11:00", bufferMinutes: 15, status: "ARRIVED", arrivedAt: "09:58", depositAmount: 50000, depositPaid: true, source: "LANDING_PAGE", confirmedViaWa: true, visitLabel: "PSA Kunjungan 2/3", notes: "Gigi 36 — lanjut cleaning & shaping" },
  { id: "ap_03", patientId: "pt_maya", doctorId: "dr_budi", chairId: "ch_1", locationId: "loc_tebet", serviceId: "sv_komposit2", date: TODAY, start: "11:15", end: "12:00", bufferMinutes: 10, status: "CONFIRMED", depositAmount: 50000, depositPaid: true, source: "LANDING_PAGE", confirmedViaWa: true },
  { id: "ap_04", patientId: "pt_kevin", doctorId: "dr_budi", chairId: "ch_1", locationId: "loc_tebet", serviceId: "sv_konsul", date: TODAY, start: "13:00", end: "13:20", bufferMinutes: 10, status: "BOOKED", depositAmount: 50000, depositPaid: true, source: "LANDING_PAGE", confirmedViaWa: false },
  { id: "ap_05", patientId: "pt_putri", doctorId: "dr_budi", chairId: "ch_1", locationId: "loc_tebet", serviceId: "sv_veneer", date: TODAY, start: "14:00", end: "15:00", bufferMinutes: 10, status: "CONFIRMED", depositAmount: 100000, depositPaid: true, source: "RECALL", confirmedViaWa: true },
  { id: "ap_06", patientId: "pt_anisa", doctorId: "dr_budi", chairId: "ch_1", locationId: "loc_tebet", serviceId: "sv_scaling", date: TODAY, start: "15:30", end: "16:00", bufferMinutes: 10, status: "PENDING_DEPOSIT", depositAmount: 50000, depositPaid: false, source: "LANDING_PAGE", confirmedViaWa: false },
  // Kursi 2 — drg. Siti
  { id: "ap_07", patientId: "pt_ahmad", doctorId: "dr_siti", chairId: "ch_2", locationId: "loc_tebet", serviceId: "sv_komposit1", date: TODAY, start: "09:00", end: "09:45", bufferMinutes: 10, status: "COMPLETED", arrivedAt: "08:55", depositAmount: 0, depositPaid: false, source: "WHATSAPP", confirmedViaWa: true },
  { id: "ap_08", patientId: "pt_nadia", doctorId: "dr_siti", chairId: "ch_2", locationId: "loc_tebet", serviceId: "sv_ortho_kontrol", date: TODAY, start: "10:00", end: "10:30", bufferMinutes: 10, status: "IN_CHAIR", arrivedAt: "09:50", depositAmount: 0, depositPaid: false, source: "RECALL", confirmedViaWa: true, visitLabel: "Kontrol bulan ke-8" },
  { id: "ap_09", patientId: "pt_larasati", doctorId: "dr_siti", chairId: "ch_2", locationId: "loc_tebet", serviceId: "sv_konsul", date: TODAY, start: "11:00", end: "11:20", bufferMinutes: 10, status: "CONFIRMED", depositAmount: 50000, depositPaid: true, source: "LANDING_PAGE", confirmedViaWa: true, notes: "Hamil 22 minggu — konsultasi behel" },
  { id: "ap_10", patientId: "pt_bayu", doctorId: "dr_siti", chairId: "ch_2", locationId: "loc_tebet", serviceId: "sv_fluor", date: TODAY, start: "13:30", end: "13:50", bufferMinutes: 10, status: "BOOKED", depositAmount: 50000, depositPaid: true, source: "LANDING_PAGE", confirmedViaWa: false },
  // Kursi 3 — drg. Andi
  { id: "ap_11", patientId: "pt_yoga", doctorId: "dr_andi", chairId: "ch_3", locationId: "loc_tebet", serviceId: "sv_odonte", date: TODAY, start: "10:00", end: "11:30", bufferMinutes: 20, status: "IN_CHAIR", arrivedAt: "09:40", depositAmount: 200000, depositPaid: true, source: "LANDING_PAGE", confirmedViaWa: true, notes: "Gigi 48 impaksi mesioangular" },
  { id: "ap_12", patientId: "pt_hendra", doctorId: "dr_andi", chairId: "ch_3", locationId: "loc_tebet", serviceId: "sv_crown", date: TODAY, start: "13:00", end: "14:00", bufferMinutes: 15, status: "CONFIRMED", depositAmount: 0, depositPaid: false, source: "WALK_IN", confirmedViaWa: true, notes: "Insersi crown zirconia gigi 21 — cek lab sudah diterima" },
  { id: "ap_13", patientId: "pt_sri", doctorId: "dr_andi", chairId: "ch_3", locationId: "loc_tebet", serviceId: "sv_konsul", date: TODAY, start: "15:00", end: "15:20", bufferMinutes: 10, status: "NO_SHOW", depositAmount: 0, depositPaid: false, source: "WHATSAPP", confirmedViaWa: false },
  { id: "ap_14", patientId: "pt_fajar", doctorId: "dr_andi", chairId: "ch_3", locationId: "loc_tebet", serviceId: "sv_cabut", date: TODAY, start: "16:00", end: "16:45", bufferMinutes: 15, status: "CANCELLED", depositAmount: 50000, depositPaid: true, source: "LANDING_PAGE", confirmedViaWa: true },
  // Kemang
  { id: "ap_15", patientId: "pt_citra", doctorId: "dr_siti", chairId: "ch_4", locationId: "loc_kemang", serviceId: "sv_scaling", date: "2026-10-27", start: "13:00", end: "13:30", bufferMinutes: 10, status: "CONFIRMED", depositAmount: 50000, depositPaid: true, source: "RECALL", confirmedViaWa: true },
  { id: "ap_16", patientId: "pt_rudi", doctorId: "dr_budi", chairId: "ch_4", locationId: "loc_kemang", serviceId: "sv_scaling", date: "2026-10-27", start: "18:00", end: "18:30", bufferMinutes: 10, status: "BOOKED", depositAmount: 50000, depositPaid: true, source: "RECALL", confirmedViaWa: false },
];

/** Odontogram snapshot for Dedi Kurniawan — used in the clinical workspace demo. */
export const chartDedi: ChartData = {
  "18": { presence: "MISSING", surfaces: {} },
  "16": { presence: "PRESENT", surfaces: { O: { code: "RESTORATION_COMPOSITE", layer: "EXISTING" } } },
  "14": { presence: "PRESENT", surfaces: { D: { code: "CARIES_ENAMEL", layer: "PATHOLOGY" } } },
  "11": { presence: "PRESENT", surfaces: {} },
  "21": { presence: "PRESENT", surfaces: { M: { code: "RESTORATION_COMPOSITE", layer: "COMPLETED" } } },
  "26": { presence: "PRESENT", surfaces: { O: { code: "RESTORATION_AMALGAM", layer: "EXISTING" }, M: { code: "RESTORATION_AMALGAM", layer: "EXISTING" } } },
  "28": { presence: "MISSING", surfaces: {} },
  "36": { presence: "PRESENT", wholeCode: "PSA_IN_PROGRESS", wholeLayer: "PLANNED", surfaces: { M: { code: "CARIES_PULPA", layer: "PATHOLOGY" }, O: { code: "CARIES_PULPA", layer: "PATHOLOGY" } } },
  "37": { presence: "PRESENT", surfaces: { O: { code: "CARIES_DENTIN", layer: "PATHOLOGY" } } },
  "38": { presence: "IMPACTED", wholeCode: "MESIOANGULAR_IMPACTION", wholeLayer: "PATHOLOGY", surfaces: {} },
  "46": { presence: "PRESENT", wholeCode: "CROWN_PFM", wholeLayer: "EXISTING", surfaces: {} },
  "48": { presence: "MISSING", surfaces: {} },
};

export const toothHistories: ToothHistory[] = [
  { id: "th_1", patientId: "pt_dedi", tooth: 36, surfaces: ["M", "O"], condition: "Karies mencapai pulpa — Pulpitis ireversibel", layer: "PATHOLOGY", serviceId: "sv_psa1", doctorId: "dr_budi", date: "2026-10-19", notes: "Open access, ekstirpasi pulpa, dressing Ca(OH)₂" },
  { id: "th_2", patientId: "pt_dedi", tooth: 21, surfaces: ["M"], condition: "Karies dentin", layer: "COMPLETED", serviceId: "sv_komposit1", doctorId: "dr_budi", date: "2026-03-11" },
  { id: "th_3", patientId: "pt_dedi", tooth: 36, surfaces: [], condition: "Scaling RA/RB", layer: "COMPLETED", serviceId: "sv_scaling", doctorId: "dr_siti", date: "2025-01-12" },
  { id: "th_4", patientId: "pt_dedi", tooth: 46, surfaces: [], condition: "Crown PFM (dari klinik lain)", layer: "EXISTING", doctorId: "dr_budi", date: "2025-08-20" },
];

export const conditionCatalog = [
  { code: "CARIES_ENAMEL", label: "Karies Email", short: "KE", layer: "PATHOLOGY" as const, scope: "surface" as const },
  { code: "CARIES_DENTIN", label: "Karies Dentin", short: "KD", layer: "PATHOLOGY" as const, scope: "surface" as const },
  { code: "CARIES_PULPA", label: "Karies Mencapai Pulpa", short: "KP", layer: "PATHOLOGY" as const, scope: "surface" as const },
  { code: "PULPITIS", label: "Pulpitis", short: "PUL", layer: "PATHOLOGY" as const, scope: "tooth" as const },
  { code: "NECROSIS", label: "Nekrosis Pulpa", short: "NEK", layer: "PATHOLOGY" as const, scope: "tooth" as const },
  { code: "RADIX", label: "Sisa Akar", short: "RAD", layer: "PATHOLOGY" as const, scope: "tooth" as const },
  { code: "FRACTURE", label: "Fraktur", short: "FX", layer: "PATHOLOGY" as const, scope: "tooth" as const },
  { code: "ATTRITION", label: "Atrisi / Abrasi", short: "ATR", layer: "PATHOLOGY" as const, scope: "surface" as const },
  { code: "RESTORATION_COMPOSITE", label: "Tambalan Komposit", short: "KOM", layer: "EXISTING" as const, scope: "surface" as const },
  { code: "RESTORATION_AMALGAM", label: "Tambalan Amalgam", short: "AMF", layer: "EXISTING" as const, scope: "surface" as const },
  { code: "CROWN_PFM", label: "Mahkota PFM", short: "PFM", layer: "EXISTING" as const, scope: "tooth" as const },
  { code: "CROWN_ZIRCONIA", label: "Mahkota Zirconia", short: "ZIR", layer: "EXISTING" as const, scope: "tooth" as const },
  { code: "MISSING", label: "Gigi Hilang", short: "MIS", layer: "MISSING" as const, scope: "tooth" as const },
  { code: "MESIOANGULAR_IMPACTION", label: "Impaksi Mesioangular", short: "IMP", layer: "PATHOLOGY" as const, scope: "tooth" as const },
];

export const soapChips = {
  S: ["Ngilu dingin", "Ngilu manis", "Nyeri spontan", "Nyeri saat mengunyah", "Gusi berdarah", "Bengkak", "Bau mulut", "Gigi goyang", "Kontrol rutin", "Ingin estetik"],
  O: ["Sondasi (+)", "Sondasi (−)", "Perkusi (+)", "Perkusi (−)", "Palpasi (+)", "Palpasi (−)", "Vitalitas (+)", "Vitalitas (−)", "Goyang Gr.1", "Goyang Gr.2", "Kalkulus RA/RB", "Gingiva hiperemi"],
  A: ["Karies dentin", "Pulpitis reversibel", "Pulpitis ireversibel", "Nekrosis pulpa", "Periodontitis apikalis", "Gingivitis", "Impaksi", "Maloklusi Kelas II"],
};

export const invoices: Invoice[] = [
  {
    id: "inv_0089", number: "INV/2026/10/0089", patientId: "pt_dedi", appointmentId: "ap_02", date: TODAY,
    items: [
      { id: "ii_1", serviceId: "sv_psa2", description: "PSA — Kunjungan 2 (Cleaning & Shaping)", tooth: 36, doctorId: "dr_budi", nurseId: "ns_rini", qty: 1, unitPrice: 800000, discount: 0, materialCost: 100000, labCost: 0 },
      { id: "ii_2", serviceId: "sv_rontgen", description: "Foto Rontgen Periapikal", tooth: 36, doctorId: "dr_budi", nurseId: "ns_rini", qty: 1, unitPrice: 150000, discount: 0, materialCost: 20000, labCost: 0 },
    ],
    discount: 0, depositDeducted: 50000, payments: [], status: "UNPAID", isInstallment: false,
  },
  {
    id: "inv_0088", number: "INV/2026/10/0088", patientId: "pt_ahmad", appointmentId: "ap_07", date: TODAY,
    items: [
      { id: "ii_3", serviceId: "sv_komposit1", description: "Restorasi Komposit Kelas I", tooth: 46, surfaces: ["O"], doctorId: "dr_siti", nurseId: "ns_dewi", qty: 1, unitPrice: 350000, discount: 0, materialCost: 45000, labCost: 0 },
    ],
    discount: 0, depositDeducted: 0, payments: [], status: "UNPAID", isInstallment: false,
  },
  {
    id: "inv_0087", number: "INV/2026/10/0087", patientId: "pt_rina", appointmentId: "ap_01", date: TODAY,
    items: [
      { id: "ii_4", serviceId: "sv_scaling", description: "Scaling & Polishing RA/RB", doctorId: "dr_budi", nurseId: "ns_rini", qty: 1, unitPrice: 350000, discount: 0, materialCost: 25000, labCost: 0 },
    ],
    discount: 0, depositDeducted: 50000, payments: [{ id: "py_1", amount: 300000, method: "QRIS", paidAt: "2026-10-26 09:48" }], status: "PAID", isInstallment: false,
  },
  {
    id: "inv_0071", number: "INV/2026/09/0071", patientId: "pt_nadia", date: "2025-03-20",
    items: [
      { id: "ii_5", serviceId: "sv_ortho_pasang", description: "Pemasangan Fixed Orthodontic (Metal) RA/RB", doctorId: "dr_siti", nurseId: "ns_dewi", qty: 1, unitPrice: 8000000, discount: 0, materialCost: 1200000, labCost: 0 },
    ],
    discount: 0, depositDeducted: 0,
    payments: [
      { id: "py_2", amount: 2000000, method: "TRANSFER", paidAt: "2025-03-20 11:02", note: "DP" },
      { id: "py_3", amount: 1000000, method: "QRIS", paidAt: "2025-05-21 10:15", note: "Cicilan 1" },
      { id: "py_4", amount: 1000000, method: "QRIS", paidAt: "2025-07-23 10:20", note: "Cicilan 2" },
    ],
    status: "PARTIAL", isInstallment: true, installmentPlan: { count: 6, amountPer: 1000000, nextDue: "2026-10-28" },
  },
  {
    id: "inv_0080", number: "INV/2026/10/0080", patientId: "pt_hendra", date: "2026-10-05",
    items: [
      { id: "ii_6", serviceId: "sv_crown", description: "Crown Zirconia (per unit)", tooth: 21, doctorId: "dr_andi", nurseId: "ns_rini", qty: 1, unitPrice: 4500000, discount: 250000, materialCost: 100000, labCost: 1350000 },
    ],
    discount: 0, depositDeducted: 0,
    payments: [{ id: "py_5", amount: 2250000, method: "DEBIT", paidAt: "2026-10-05 15:40", note: "DP 50%" }],
    status: "PARTIAL", isInstallment: true, installmentPlan: { count: 2, amountPer: 2000000, nextDue: TODAY },
  },
  {
    id: "inv_0076", number: "INV/2026/10/0076", patientId: "pt_sri", date: "2026-08-14",
    items: [
      { id: "ii_7", serviceId: "sv_crown", description: "Gigi Tiruan Sebagian Lepasan (Akrilik)", doctorId: "dr_andi", qty: 1, unitPrice: 2400000, discount: 0, materialCost: 0, labCost: 700000 },
    ],
    discount: 0, depositDeducted: 0,
    payments: [{ id: "py_6", amount: 1200000, method: "CASH", paidAt: "2026-08-14 14:00" }],
    status: "PARTIAL", isInstallment: true, installmentPlan: { count: 2, amountPer: 1200000, nextDue: "2026-09-14" },
  },
];

export const treatmentPlans: TreatmentPlan[] = [
  {
    id: "tp_1", patientId: "pt_dedi", doctorId: "dr_budi", title: "Perawatan Saluran Akar Gigi 36 + Crown", status: "ACTIVE", createdAt: "2026-10-19", consentSigned: true,
    phases: [
      { id: "ph_1", order: 1, tooth: 36, serviceId: "sv_psa1", estimatedPrice: 900000, intervalDays: 7, status: "DONE", scheduledDate: "2026-10-19" },
      { id: "ph_2", order: 2, tooth: 36, serviceId: "sv_psa2", estimatedPrice: 800000, intervalDays: 7, status: "SCHEDULED", scheduledDate: TODAY },
      { id: "ph_3", order: 3, tooth: 36, serviceId: "sv_psa3", estimatedPrice: 850000, intervalDays: 14, status: "PENDING" },
      { id: "ph_4", order: 4, tooth: 36, serviceId: "sv_crown", estimatedPrice: 4500000, intervalDays: 0, status: "PENDING" },
    ],
  },
  {
    id: "tp_2", patientId: "pt_nadia", doctorId: "dr_siti", title: "Ortodonti Cekat RA/RB (24 bulan)", status: "ACTIVE", createdAt: "2025-03-20", consentSigned: true,
    phases: [
      { id: "ph_5", order: 1, serviceId: "sv_ortho_pasang", estimatedPrice: 8000000, intervalDays: 30, status: "DONE", scheduledDate: "2025-03-20" },
      { id: "ph_6", order: 2, serviceId: "sv_ortho_kontrol", estimatedPrice: 300000, intervalDays: 30, status: "SCHEDULED", scheduledDate: TODAY },
      { id: "ph_7", order: 3, serviceId: "sv_ortho_kontrol", estimatedPrice: 300000, intervalDays: 30, status: "PENDING" },
    ],
  },
  {
    id: "tp_3", patientId: "pt_hendra", doctorId: "dr_andi", title: "Crown Zirconia Gigi 21", status: "ACTIVE", createdAt: "2026-10-05", consentSigned: true,
    phases: [
      { id: "ph_8", order: 1, tooth: 21, serviceId: "sv_crown", estimatedPrice: 4500000, intervalDays: 21, status: "DONE", scheduledDate: "2026-10-05" },
      { id: "ph_9", order: 2, tooth: 21, serviceId: "sv_crown", estimatedPrice: 0, intervalDays: 0, status: "SCHEDULED", scheduledDate: TODAY },
    ],
  },
  {
    id: "tp_4", patientId: "pt_putri", doctorId: "dr_budi", title: "Direct Veneer 4 Gigi Anterior (12, 11, 21, 22)", status: "DRAFT", createdAt: "2026-10-12", consentSigned: false,
    phases: [
      { id: "ph_10", order: 1, tooth: 11, serviceId: "sv_veneer", estimatedPrice: 2400000, intervalDays: 7, status: "SCHEDULED", scheduledDate: TODAY },
      { id: "ph_11", order: 2, tooth: 21, serviceId: "sv_veneer", estimatedPrice: 2400000, intervalDays: 0, status: "PENDING" },
    ],
  },
  {
    id: "tp_5", patientId: "pt_yoga", doctorId: "dr_andi", title: "Odontektomi Gigi 38 & 48", status: "ACTIVE", createdAt: "2026-10-14", consentSigned: true,
    phases: [
      { id: "ph_12", order: 1, tooth: 48, serviceId: "sv_odonte", estimatedPrice: 3500000, intervalDays: 14, status: "SCHEDULED", scheduledDate: TODAY },
      { id: "ph_13", order: 2, tooth: 38, serviceId: "sv_odonte", estimatedPrice: 3500000, intervalDays: 0, status: "PENDING" },
    ],
  },
];

export const labOrders: LabOrder[] = [
  { id: "lab_1", number: "LAB-2026-031", patientId: "pt_hendra", doctorId: "dr_andi", vendor: "Prima Dental Lab", workType: "Crown Zirconia", tooth: 21, shade: "A2", cost: 1350000, sentDate: "2026-10-06", expectedReturn: "2026-10-24", status: "RECEIVED" },
  { id: "lab_2", number: "LAB-2026-034", patientId: "pt_sri", doctorId: "dr_andi", vendor: "Sinar Lab Jakarta", workType: "GTSL Akrilik RA", shade: "A3", cost: 700000, sentDate: "2026-10-15", expectedReturn: "2026-10-29", status: "SENT" },
  { id: "lab_3", number: "LAB-2026-035", patientId: "pt_nadia", doctorId: "dr_siti", vendor: "Ortho Studio Lab", workType: "Retainer Hawley RA/RB", cost: 850000, expectedReturn: "2026-11-10", status: "ORDERED", notes: "Menunggu lepas behel" },
  { id: "lab_4", number: "LAB-2026-029", patientId: "pt_rudi", doctorId: "dr_budi", vendor: "Prima Dental Lab", workType: "Crown PFM", tooth: 46, shade: "A3.5", cost: 950000, sentDate: "2026-09-20", expectedReturn: "2026-10-04", status: "FITTED" },
  { id: "lab_5", number: "LAB-2026-036", patientId: "pt_dedi", doctorId: "dr_budi", vendor: "Prima Dental Lab", workType: "Crown Zirconia (Post-PSA)", tooth: 36, shade: "A2", cost: 1350000, expectedReturn: "2026-11-20", status: "ORDERED", notes: "Menunggu obturasi selesai" },
  { id: "lab_6", number: "LAB-2026-033", patientId: "pt_putri", doctorId: "dr_budi", vendor: "Sinar Lab Jakarta", workType: "Night Guard", cost: 600000, sentDate: "2026-10-10", expectedReturn: "2026-10-22", status: "SENT", notes: "Terlambat 4 hari" },
];

export const commissionRules: CommissionRule[] = [
  { id: "cr_1", basis: "NET", type: "PERCENTAGE", value: 40, deductPromoFromDoctor: false },
  { id: "cr_2", doctorId: "dr_siti", serviceCategory: "ORTHO", basis: "NET", type: "PERCENTAGE", value: 45, deductPromoFromDoctor: false },
  { id: "cr_3", doctorId: "dr_andi", serviceCategory: "ENDO", basis: "NET", type: "PERCENTAGE", value: 45, deductPromoFromDoctor: true },
  { id: "cr_4", serviceCategory: "CONSULT", basis: "GROSS", type: "FLAT", value: 50000, deductPromoFromDoctor: false },
];

export const commissionEntries: CommissionEntry[] = [
  { id: "cm_1", doctorId: "dr_budi", invoiceNumber: "INV/2026/10/0087", patientName: "Rina Wijaya", serviceName: "Scaling & Polishing", date: TODAY, gross: 350000, deductions: 25000, base: 325000, rateLabel: "40% Net", earned: 130000, paidRatio: 1, releasable: 130000, status: "UNSETTLED" },
  { id: "cm_2", doctorId: "dr_siti", invoiceNumber: "INV/2026/09/0071", patientName: "Nadia Putri", serviceName: "Pasang Behel Metal", date: "2025-03-20", gross: 8000000, deductions: 1200000, base: 6800000, rateLabel: "45% Net", earned: 3060000, paidRatio: 0.5, releasable: 1530000, status: "UNSETTLED" },
  { id: "cm_3", doctorId: "dr_andi", invoiceNumber: "INV/2026/10/0080", patientName: "Hendra Gunawan", serviceName: "Crown Zirconia #21", date: "2026-10-05", gross: 4500000, deductions: 1700000, base: 2800000, rateLabel: "40% Net", earned: 1120000, paidRatio: 0.53, releasable: 593600, status: "UNSETTLED" },
  { id: "cm_4", doctorId: "dr_andi", invoiceNumber: "INV/2026/10/0076", patientName: "Sri Wahyuni", serviceName: "GTSL Akrilik", date: "2026-08-14", gross: 2400000, deductions: 700000, base: 1700000, rateLabel: "40% Net", earned: 680000, paidRatio: 0.5, releasable: 340000, status: "UNSETTLED" },
  { id: "cm_5", doctorId: "dr_budi", invoiceNumber: "INV/2026/10/0062", patientName: "Putri Ayu Lestari", serviceName: "Bleaching In-Office", date: "2026-10-03", gross: 2500000, deductions: 400000, base: 2100000, rateLabel: "40% Net", earned: 840000, paidRatio: 1, releasable: 840000, status: "SETTLED" },
  { id: "cm_6", doctorId: "dr_budi", invoiceNumber: "INV/2026/10/0070", patientName: "Dedi Kurniawan", serviceName: "PSA Kunjungan 1 #36", date: "2026-10-19", gross: 900000, deductions: 120000, base: 780000, rateLabel: "40% Net", earned: 312000, paidRatio: 1, releasable: 312000, status: "UNSETTLED" },
  { id: "cm_7", doctorId: "dr_andi", invoiceNumber: "INV/2026/10/0066", patientName: "Yoga Prasetyo", serviceName: "Konsultasi + Rontgen Panoramik", date: "2026-10-14", gross: 450000, deductions: 0, base: 450000, rateLabel: "Flat Rp50rb", earned: 50000, paidRatio: 1, releasable: 50000, status: "SETTLED" },
  { id: "cm_8", doctorId: "dr_siti", invoiceNumber: "INV/2026/10/0068", patientName: "Citra Maharani", serviceName: "Kontrol Behel", date: "2026-10-16", gross: 300000, deductions: 30000, base: 270000, rateLabel: "45% Net", earned: 121500, paidRatio: 1, releasable: 121500, status: "UNSETTLED" },
];

export const waAutomations: WaAutomation[] = [
  { id: "wa_1", trigger: "APPOINTMENT_BOOKED", name: "Konfirmasi Booking + Link Intake", description: "Detail jadwal, peta lokasi, dan tautan formulir kesehatan pra-kunjungan.", delay: "Instan", enabled: true, sent30d: 214, template: "Halo Kak {nama_pasien}, jadwal Anda di {nama_klinik} sudah terkonfirmasi:\n\n🗓 {tanggal}, {jam}\n👩‍⚕️ {nama_dokter}\n📍 {alamat}\n\nHemat waktu di klinik, isi data kesehatan singkat di sini: {link_intake}" },
  { id: "wa_2", trigger: "REMINDER_H_MINUS_1", name: "Pengingat H-1 (Interaktif)", description: "Balas 1 untuk Hadir, 2 untuk Reschedule. Status otomatis jadi Terkonfirmasi.", delay: "24 jam sebelum", enabled: true, sent30d: 198, template: "Halo Kak {nama_pasien}, mengingatkan jadwal besok {tanggal} pukul {jam} bersama {nama_dokter}.\n\nBalas *1* jika hadir\nBalas *2* jika ingin ganti jadwal" },
  { id: "wa_3", trigger: "POST_OP_CARE", name: "Follow-up Pasca Tindakan", description: "Khusus cabut gigi, bedah, dan PSA. Instruksi perawatan + link ulasan Google.", delay: "H+1, 09:00", enabled: true, sent30d: 41, template: "Halo Kak {nama_pasien}, bagaimana kondisinya setelah {tindakan} kemarin? Jika ada keluhan, balas pesan ini ya.\n\nBantu kami dengan ulasan singkat: {link_review}" },
  { id: "wa_4", trigger: "TREATMENT_PLAN_FOLLOWUP", name: "Pengingat Kunjungan Lanjutan", description: "Untuk tahapan treatment plan (PSA, kontrol behel) yang belum dijadwalkan.", delay: "Interval − 2 hari", enabled: true, sent30d: 36, template: "Halo Kak {nama_pasien}, sudah waktunya {tahap_berikutnya}. Pilih jadwal di sini: {link_booking}" },
  { id: "wa_5", trigger: "SCALING_RECALL_6M", name: "Recall Scaling 6 Bulan", description: "Undangan otomatis pembersihan karang gigi rutin.", delay: "+180 hari", enabled: false, sent30d: 0, template: "Halo Kak {nama_pasien}, sudah 6 bulan sejak pembersihan karang gigi terakhir bersama {nama_dokter}. Yuk klaim slot pemeriksaan rutin: {link_booking}" },
  { id: "wa_6", trigger: "INVOICE_PAID", name: "Kwitansi Digital", description: "PDF kwitansi dikirim otomatis setelah pembayaran dikonfirmasi.", delay: "Instan", enabled: true, sent30d: 187, template: "Terima kasih Kak {nama_pasien}. Berikut kwitansi pembayaran {nomor_invoice} sebesar {total}: {link_kwitansi}" },
  { id: "wa_7", trigger: "INSTALLMENT_DUE", name: "Pengingat Cicilan", description: "H-3 sebelum jatuh tempo cicilan paket ortho/prostho.", delay: "H-3 jatuh tempo", enabled: true, sent30d: 12, template: "Halo Kak {nama_pasien}, cicilan ke-{cicilan_ke} sebesar {nominal} jatuh tempo {tanggal}. Bayar via QRIS: {link_bayar}" },
];

export const waMessages: WaMessage[] = [
  { id: "m1", patientId: "pt_anisa", automation: "Konfirmasi Booking", sentAt: "2026-10-26 08:14", status: "DELIVERED", preview: "Halo Kak Anisa, jadwal Anda di Klinik Gigi Senyum Sehat…" },
  { id: "m2", patientId: "pt_kevin", automation: "Pengingat H-1", sentAt: "2026-10-25 13:00", status: "READ", preview: "Halo Kak Kevin, mengingatkan jadwal besok…" },
  { id: "m3", patientId: "pt_maya", automation: "Pengingat H-1", sentAt: "2026-10-25 11:15", status: "REPLIED", preview: "Balasan: 1 (Hadir)" },
  { id: "m4", patientId: "pt_yoga", automation: "Follow-up Pasca Tindakan", sentAt: "2026-10-15 09:00", status: "REPLIED", preview: "Balasan: Sudah membaik dok, terima kasih" },
  { id: "m5", patientId: "pt_rina", automation: "Kwitansi Digital", sentAt: "2026-10-26 09:48", status: "READ", preview: "Terima kasih Kak Rina. Berikut kwitansi INV/2026/10/0087…" },
  { id: "m6", patientId: "pt_sri", automation: "Pengingat Cicilan", sentAt: "2026-09-11 10:00", status: "FAILED", preview: "Nomor tidak terdaftar di WhatsApp" },
  { id: "m7", patientId: "pt_nadia", automation: "Pengingat Cicilan", sentAt: "2026-10-25 10:00", status: "READ", preview: "Halo Kak Nadia, cicilan ke-4 sebesar Rp1.000.000…" },
];

export const recalls: RecallItem[] = [
  { patientId: "pt_rina", reason: "Scaling 6 bulan", lastDate: "2026-04-22", dueDate: "2026-10-22", potential: 350000, status: "BOOKED" },
  { patientId: "pt_citra", reason: "Scaling 6 bulan", lastDate: "2026-04-10", dueDate: "2026-10-10", potential: 350000, status: "BOOKED" },
  { patientId: "pt_putri", reason: "Scaling 6 bulan", lastDate: "2026-04-25", dueDate: "2026-10-25", potential: 350000, status: "INVITED" },
  { patientId: "pt_rudi", reason: "Scaling 6 bulan", lastDate: "2026-04-18", dueDate: "2026-10-18", potential: 350000, status: "BOOKED" },
  { patientId: "pt_ahmad", reason: "Kontrol tambalan", lastDate: "2026-09-02", dueDate: "2026-11-02", potential: 150000, status: "DUE" },
  { patientId: "pt_hendra", reason: "Kontrol gula darah + scaling", lastDate: "2026-04-05", dueDate: "2026-10-05", potential: 350000, status: "OVERDUE" },
  { patientId: "pt_sri", reason: "Evaluasi gigi tiruan", lastDate: "2026-08-14", dueDate: "2026-09-14", potential: 150000, status: "OVERDUE" },
  { patientId: "pt_larasati", reason: "Scaling pasca melahirkan", lastDate: "2026-09-20", dueDate: "2027-01-20", potential: 350000, status: "DUE" },
];

export const notifications: Notification[] = [
  { id: "n1", type: "booking", title: "Booking baru dari Landing Page", body: "Anisa Rahma — Scaling, hari ini 15:30. Menunggu deposit QRIS.", time: "8 mnt lalu", unread: true, href: "/app/kalender" },
  { id: "n2", type: "intake", title: "Formulir intake terisi", body: "Kevin Tanoto melengkapi riwayat kesehatan.", time: "24 mnt lalu", unread: true, href: "/app/pasien/pt_kevin" },
  { id: "n3", type: "payment", title: "Pembayaran QRIS diterima", body: "Rp300.000 dari Rina Wijaya (INV/2026/10/0087).", time: "1 jam lalu", unread: true, href: "/app/kasir" },
  { id: "n4", type: "lab", title: "Lab terlambat", body: "Night Guard Putri Ayu — Sinar Lab, lewat 4 hari dari estimasi.", time: "2 jam lalu", unread: false, href: "/app/lab" },
  { id: "n5", type: "wa", title: "WhatsApp gagal terkirim", body: "Pengingat cicilan ke Sri Wahyuni — nomor tidak aktif.", time: "Kemarin", unread: false, href: "/app/crm" },
  { id: "n6", type: "system", title: "Kuota WhatsApp 78% terpakai", body: "392 dari 500 pesan bulan ini. Top-up 250 pesan Rp35.000.", time: "Kemarin", unread: false, href: "/app/pengaturan/langganan" },
];

export const inventory: InventoryItem[] = [
  { id: "inv1", name: "Resin Komposit A2 (Filtek Z350)", unit: "tube", stock: 6, minStock: 4, costPerUnit: 420000, category: "Restorasi" },
  { id: "inv2", name: "Bonding Agent (Single Bond Universal)", unit: "botol", stock: 2, minStock: 2, costPerUnit: 650000, category: "Restorasi" },
  { id: "inv3", name: "Pehacain (Lidocaine 2%)", unit: "ampul", stock: 38, minStock: 50, costPerUnit: 9000, category: "Anestesi" },
  { id: "inv4", name: "Sarung Tangan Nitril (M)", unit: "box", stock: 14, minStock: 10, costPerUnit: 85000, category: "APD" },
  { id: "inv5", name: "K-File #15–40", unit: "set", stock: 3, minStock: 5, costPerUnit: 120000, category: "Endodontik" },
  { id: "inv6", name: "GIC Fuji IX", unit: "kit", stock: 4, minStock: 2, costPerUnit: 780000, category: "Restorasi" },
  { id: "inv7", name: "Masker Bedah 3-ply", unit: "box", stock: 22, minStock: 10, costPerUnit: 35000, category: "APD" },
  { id: "inv8", name: "Pasta Profilaksis", unit: "jar", stock: 5, minStock: 3, costPerUnit: 95000, category: "Preventif" },
];

export const medicines: MedicineItem[] = [
  {
    id: "med_amox",
    code: "OBT-01",
    name: "Amoxicillin Trihydrate 500 mg",
    category: "ANTIBIOTIC",
    unit: "strip (10 kaplet)",
    price: 45000,
    cost: 15000,
    stock: 42,
    defaultSigna: "3×1 kaplet sesudah makan (Habiskan)",
    allergyKeywords: ["Amoxicillin", "Penicillin"],
    safeAlternativeId: "med_clinda",
    pregnancySafe: true,
  },
  {
    id: "med_clinda",
    code: "OBT-02",
    name: "Clindamycin HCl 300 mg (Aman Alergi Penisilin)",
    category: "ANTIBIOTIC",
    unit: "strip (10 kapsul)",
    price: 85000,
    cost: 35000,
    stock: 28,
    defaultSigna: "3×1 kapsul sesudah makan (Habiskan)",
    allergyKeywords: [],
    pregnancySafe: true,
  },
  {
    id: "med_mefenamat",
    code: "OBT-03",
    name: "Asam Mefenamat 500 mg",
    category: "ANALGESIC",
    unit: "strip (10 kaplet)",
    price: 35000,
    cost: 12000,
    stock: 64,
    defaultSigna: "3×1 kaplet sesudah makan bila nyeri",
    allergyKeywords: ["NSAID", "Ibuprofen", "Asam Mefenamat"],
    safeAlternativeId: "med_paracetamol",
    pregnancySafe: false,
  },
  {
    id: "med_cataflam",
    code: "OBT-04",
    name: "Kalium Diklofenak 50 mg (Cataflam)",
    category: "ANALGESIC",
    unit: "strip (10 tablet)",
    price: 75000,
    cost: 32000,
    stock: 35,
    defaultSigna: "2×1 tablet sesudah makan",
    allergyKeywords: ["NSAID", "Ibuprofen", "Diklofenak"],
    safeAlternativeId: "med_paracetamol",
    pregnancySafe: false,
  },
  {
    id: "med_paracetamol",
    code: "OBT-05",
    name: "Paracetamol 500 mg (Aman Alergi NSAID & Ibu Hamil)",
    category: "ANALGESIC",
    unit: "strip (10 kaplet)",
    price: 25000,
    cost: 8000,
    stock: 80,
    defaultSigna: "3×1 kaplet bila nyeri atau demam",
    allergyKeywords: [],
    pregnancySafe: true,
  },
  {
    id: "med_chx",
    code: "OBT-06",
    name: "Chlorhexidine Gluconate 0.2% Antiseptic Gargle",
    category: "ANTISEPTIC",
    unit: "botol 150 ml",
    price: 55000,
    cost: 24000,
    stock: 30,
    defaultSigna: "2× sehari kumur 10ml selama 30 detik",
    allergyKeywords: [],
    pregnancySafe: true,
  },
  {
    id: "med_aloclair",
    code: "OBT-07",
    name: "Aloclair Plus Oral Gel 8 ml",
    category: "TOPICAL",
    unit: "tube",
    price: 110000,
    cost: 65000,
    stock: 18,
    defaultSigna: "Oleskan 3× sehari pada area mukosa/bracket",
    allergyKeywords: [],
    pregnancySafe: true,
  },
];


/** Subscription / usage for current tenant. */
export const subscription = {
  tier: "CLINIC_GROWTH" as const,
  cycle: "YEARLY" as const,
  priceMonthly: 279000,
  periodEnd: "2027-03-14",
  usage: {
    doctors: { used: 3, limit: 5 },
    chairs: { used: 4, limit: 3 }, // over → used to show upgrade nudge
    wa: { used: 392, limit: 500, addon: 120 },
    storageMb: { used: 8420, limit: 25600 },
    encounters: { used: 286, limit: null as number | null },
  },
};

export const revenueSeries = [
  { day: "20 Okt", revenue: 4200000, visits: 11 },
  { day: "21 Okt", revenue: 6850000, visits: 14 },
  { day: "22 Okt", revenue: 3900000, visits: 9 },
  { day: "23 Okt", revenue: 7400000, visits: 15 },
  { day: "24 Okt", revenue: 9100000, visits: 17 },
  { day: "25 Okt", revenue: 2100000, visits: 5 },
  { day: "26 Okt", revenue: 3650000, visits: 8 },
];

export const monthlyRevenue = [
  { month: "Mei", revenue: 98000000, collected: 91000000 },
  { month: "Jun", revenue: 104000000, collected: 97000000 },
  { month: "Jul", revenue: 112000000, collected: 101000000 },
  { month: "Agu", revenue: 108000000, collected: 102000000 },
  { month: "Sep", revenue: 121000000, collected: 113000000 },
  { month: "Okt", revenue: 129500000, collected: 118200000 },
];

// ---------- Lookup helpers ----------
export const byId = <T extends { id: string }>(list: T[], id?: string) =>
  list.find((x) => x.id === id);

export const getPatient = (id?: string) => byId(patients, id);
export const getStaff = (id?: string) => byId(staff, id);
export const getService = (id?: string) => byId(services, id);
export const getChair = (id?: string) => byId(chairs, id);
export const getLocation = (id?: string) => byId(locations, id);

export function invoiceTotals(inv: Invoice) {
  const subtotal = inv.items.reduce((s, i) => s + i.unitPrice * i.qty - i.discount, 0);
  const grand = Math.max(0, subtotal - inv.discount - inv.depositDeducted);
  const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
  return { subtotal, grand, paid, remaining: Math.max(0, grand - paid) };
}
