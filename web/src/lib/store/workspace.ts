"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  appointments as initialAppointments,
  invoices as initialInvoices,
  labOrders as initialLabOrders,
  medicines as initialMedicines,
  patients as initialPatients,
  services as initialServices,
  TODAY,
} from "@/lib/data";
import type {
  Appointment,
  AppointmentStatus,
  Invoice,
  InvoiceItem,
  LabOrder,
  MedicineItem,
  Patient,
  PaymentMethod,
  PrescribedMedicine,
  Role,
  Service,
  TenantMode,
} from "@/lib/types";

interface WorkspaceState {
  mode: TenantMode;
  role: Role;
  locationId: string;
  sidebarCollapsed: boolean;
  commandOpen: boolean;

  // Live Synchronized Domain State
  services: Service[];
  medicines: MedicineItem[];
  appointments: Appointment[];
  invoices: Invoice[];
  prescriptionsByAppointment: Record<string, PrescribedMedicine[]>;
  labOrders: LabOrder[];
  patients: Patient[];

  // UI Actions
  setMode: (m: TenantMode) => void;
  setRole: (r: Role) => void;
  setLocation: (id: string) => void;
  toggleSidebar: () => void;
  setCommandOpen: (o: boolean) => void;

  // Services Catalog CRUD
  addService: (srv: Service) => void;
  updateService: (id: string, patch: Partial<Service>) => void;
  deleteService: (id: string) => void;

  // Medicines & Formulary CRUD
  addMedicine: (med: MedicineItem) => void;
  updateMedicine: (id: string, patch: Partial<MedicineItem>) => void;
  deleteMedicine: (id: string) => void;

  // Appointments CRUD
  addAppointment: (app: Appointment) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;

  // Invoices & Clinical Billing Sync
  setInvoiceItems: (invoiceId: string, items: InvoiceItem[]) => void;
  addInvoiceItem: (invoiceId: string, item: InvoiceItem) => void;
  updateInvoiceItem: (invoiceId: string, itemId: string, patch: Partial<InvoiceItem>) => void;
  removeInvoiceItem: (invoiceId: string, itemId: string) => void;
  recordInvoicePayment: (
    invoiceId: string,
    amount: number,
    method: PaymentMethod,
    isInstallment: boolean,
  ) => void;
  ensureAppointmentInvoice: (appointmentId: string) => string;

  // Prescription & Medication Review Sync
  addPrescription: (appointmentId: string, rx: PrescribedMedicine, doctorId?: string) => void;
  updatePrescription: (
    appointmentId: string,
    rxId: string,
    patch: Partial<PrescribedMedicine>,
  ) => void;
  removePrescription: (appointmentId: string, rxId: string) => void;
  markAllPrescriptionsReviewed: (appointmentId: string) => void;

  // Lab & Patients
  addLabOrder: (order: LabOrder) => void;
  addPatient: (patient: Patient) => void;
  resetDemoData: () => void;
}

const initialPrescriptions: Record<string, PrescribedMedicine[]> = {
  ap_02: [
    {
      id: "rx_init_1",
      medicineId: "med_paracetamol",
      name: "Paracetamol 500 mg (Aman Alergi NSAID & Ibu Hamil)",
      qty: 1,
      unit: "strip (10 kaplet)",
      unitPrice: 25000,
      unitCost: 8000,
      signa: "3×1 kaplet bila nyeri sesudah makan",
      notes: "Pasien alergi NSAID (Ibuprofen) — gunakan Paracetamol",
      reviewedByPharmacy: true,
    },
    {
      id: "rx_init_2",
      medicineId: "med_chx",
      name: "Chlorhexidine Gluconate 0.2% Antiseptic Gargle",
      qty: 1,
      unit: "botol 150 ml",
      unitPrice: 55000,
      unitCost: 24000,
      signa: "2× sehari kumur 10ml selama 30 detik",
      reviewedByPharmacy: false,
    },
  ],
};

export const useWorkspace = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      mode: "CLINIC",
      role: "OWNER",
      locationId: "loc_tebet",
      sidebarCollapsed: false,
      commandOpen: false,

      services: initialServices,
      medicines: initialMedicines,
      appointments: initialAppointments,
      invoices: initialInvoices,
      prescriptionsByAppointment: initialPrescriptions,
      labOrders: initialLabOrders,
      patients: initialPatients,

      setMode: (mode) => set({ mode }),
      setRole: (role) => set({ role }),
      setLocation: (locationId) => set({ locationId }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCommandOpen: (commandOpen) => set({ commandOpen }),

      // Services CRUD
      addService: (srv) => set((s) => ({ services: [srv, ...s.services] })),
      updateService: (id, patch) =>
        set((s) => ({
          services: s.services.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        })),
      deleteService: (id) =>
        set((s) => ({
          services: s.services.filter((item) => item.id !== id),
        })),

      // Medicines CRUD
      addMedicine: (med) => set((s) => ({ medicines: [med, ...s.medicines] })),
      updateMedicine: (id, patch) =>
        set((s) => ({
          medicines: s.medicines.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        })),
      deleteMedicine: (id) =>
        set((s) => ({
          medicines: s.medicines.filter((item) => item.id !== id),
        })),

      // Appointments CRUD
      addAppointment: (app) =>
        set((s) => ({
          appointments: [...s.appointments, app],
        })),
      updateAppointmentStatus: (id, status) =>
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status,
                  arrivedAt: status === "ARRIVED" ? a.arrivedAt ?? "10:15" : a.arrivedAt,
                }
              : a,
          ),
        })),

      // Ensure an invoice exists for a given appointmentId
      ensureAppointmentInvoice: (appointmentId) => {
        const state = get();
        const existing = state.invoices.find((inv) => inv.appointmentId === appointmentId);
        if (existing) return existing.id;

        const app = state.appointments.find((a) => a.id === appointmentId);
        const srv = state.services.find((s) => s.id === app?.serviceId) ?? state.services[0];
        const newId = `inv_${Date.now()}`;
        const newInvoice: Invoice = {
          id: newId,
          number: `INV/2026/10/${String(state.invoices.length + 85).padStart(4, "0")}`,
          patientId: app?.patientId ?? "pt_dedi",
          appointmentId,
          date: app?.date ?? TODAY,
          items: app
            ? [
                {
                  id: `ii_${Date.now()}`,
                  serviceId: srv.id,
                  description: srv.clinicalName,
                  doctorId: app.doctorId,
                  nurseId: "ns_rini",
                  qty: 1,
                  unitPrice: srv.basePrice,
                  discount: 0,
                  materialCost: srv.materialCost,
                  labCost: 0,
                },
              ]
            : [],
          discount: 0,
          depositDeducted: app?.depositPaid ? app.depositAmount : 0,
          payments: [],
          status: "UNPAID",
          isInstallment: false,
        };
        set((s) => ({ invoices: [newInvoice, ...s.invoices] }));
        return newId;
      },

      setInvoiceItems: (invoiceId, items) =>
        set((s) => ({
          invoices: s.invoices.map((inv) => (inv.id === invoiceId ? { ...inv, items } : inv)),
        })),

      addInvoiceItem: (invoiceId, item) =>
        set((s) => ({
          invoices: s.invoices.map((inv) =>
            inv.id === invoiceId ? { ...inv, items: [...inv.items, item] } : inv,
          ),
        })),

      updateInvoiceItem: (invoiceId, itemId, patch) =>
        set((s) => ({
          invoices: s.invoices.map((inv) =>
            inv.id === invoiceId
              ? {
                  ...inv,
                  items: inv.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
                }
              : inv,
          ),
        })),

      removeInvoiceItem: (invoiceId, itemId) =>
        set((s) => ({
          invoices: s.invoices.map((inv) =>
            inv.id === invoiceId
              ? { ...inv, items: inv.items.filter((it) => it.id !== itemId) }
              : inv,
          ),
        })),

      recordInvoicePayment: (invoiceId, amount, method, isInstallment) =>
        set((s) => ({
          invoices: s.invoices.map((inv) => {
            if (inv.id !== invoiceId) return inv;
            const nextPayments = [
              ...inv.payments,
              {
                id: `py_${Date.now()}`,
                amount,
                method,
                paidAt: `${TODAY} 10:35`,
                note: isInstallment ? "Cicilan" : "Pelunasan",
              },
            ];
            const subtotal = inv.items.reduce((acc, i) => acc + i.unitPrice * i.qty - i.discount, 0);
            const grand = Math.max(0, subtotal - inv.discount - inv.depositDeducted);
            const newPaid = nextPayments.reduce((acc, p) => acc + p.amount, 0);
            const isNowPaid = newPaid >= grand;
            return {
              ...inv,
              payments: nextPayments,
              status: isNowPaid ? "PAID" : "PARTIAL",
              isInstallment: !isNowPaid,
            };
          }),
        })),

      addPrescription: (appointmentId, rx, doctorId = "dr_budi") => {
        const invId = get().ensureAppointmentInvoice(appointmentId);
        set((s) => {
          const list = s.prescriptionsByAppointment[appointmentId] ?? [];
          const invoiceItemId = `ii_rx_${rx.id}`;
          return {
            prescriptionsByAppointment: {
              ...s.prescriptionsByAppointment,
              [appointmentId]: [...list, rx],
            },
            invoices: s.invoices.map((inv) =>
              inv.id === invId
                ? {
                    ...inv,
                    items: [
                      ...inv.items.filter((i) => i.id !== invoiceItemId),
                      {
                        id: invoiceItemId,
                        serviceId: rx.medicineId,
                        description: `[Resep Obat] ${rx.name} — ${rx.signa}`,
                        doctorId,
                        qty: rx.qty,
                        unitPrice: rx.unitPrice,
                        discount: 0,
                        materialCost: rx.unitCost * rx.qty,
                        labCost: 0,
                      },
                    ],
                  }
                : inv,
            ),
          };
        });
      },

      updatePrescription: (appointmentId, rxId, patch) =>
        set((s) => {
          const list = (s.prescriptionsByAppointment[appointmentId] ?? []).map((r) =>
            r.id === rxId ? { ...r, ...patch } : r,
          );
          const updatedRx = list.find((r) => r.id === rxId);
          const invoiceItemId = `ii_rx_${rxId}`;
          return {
            prescriptionsByAppointment: {
              ...s.prescriptionsByAppointment,
              [appointmentId]: list,
            },
            invoices: updatedRx
              ? s.invoices.map((inv) =>
                  inv.appointmentId === appointmentId
                    ? {
                        ...inv,
                        items: inv.items.map((it) =>
                          it.id === invoiceItemId
                            ? {
                                ...it,
                                description: `[Resep Obat] ${updatedRx.name} — ${updatedRx.signa}`,
                                qty: updatedRx.qty,
                                unitPrice: updatedRx.unitPrice,
                                materialCost: updatedRx.unitCost * updatedRx.qty,
                              }
                            : it,
                        ),
                      }
                    : inv,
                )
              : s.invoices,
          };
        }),

      removePrescription: (appointmentId, rxId) =>
        set((s) => {
          const list = (s.prescriptionsByAppointment[appointmentId] ?? []).filter(
            (r) => r.id !== rxId,
          );
          const invoiceItemId = `ii_rx_${rxId}`;
          return {
            prescriptionsByAppointment: {
              ...s.prescriptionsByAppointment,
              [appointmentId]: list,
            },
            invoices: s.invoices.map((inv) =>
              inv.appointmentId === appointmentId
                ? {
                    ...inv,
                    items: inv.items.filter((it) => it.id !== invoiceItemId),
                  }
                : inv,
            ),
          };
        }),

      markAllPrescriptionsReviewed: (appointmentId) =>
        set((s) => ({
          prescriptionsByAppointment: {
            ...s.prescriptionsByAppointment,
            [appointmentId]: (s.prescriptionsByAppointment[appointmentId] ?? []).map((r) => ({
              ...r,
              reviewedByPharmacy: true,
            })),
          },
        })),

      addLabOrder: (order) => set((s) => ({ labOrders: [order, ...s.labOrders] })),
      addPatient: (patient) => set((s) => ({ patients: [patient, ...s.patients] })),

      resetDemoData: () =>
        set({
          services: initialServices,
          medicines: initialMedicines,
          appointments: initialAppointments,
          invoices: initialInvoices,
          prescriptionsByAppointment: initialPrescriptions,
          labOrders: initialLabOrders,
          patients: initialPatients,
        }),
    }),
    {
      name: "klikgigi-workspace-v3",
    },
  ),
);
