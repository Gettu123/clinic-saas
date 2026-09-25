import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildSeed,
  DEFAULT_CONFIGS,
  nid,
  type Appointment,
  type ClinicConfig,
  type DocFile,
  type Patient,
} from "@/lib/clinic/model";

type ClinicState = {
  tenantId: string | null;
  configs: Record<string, ClinicConfig>;
  patients: Patient[];
  appointments: Appointment[];
  enter: (tenantId: string) => void;
  leave: () => void;
  saveConfig: (patch: Partial<ClinicConfig>) => void;
  addPatient: (input: Omit<Patient, "id" | "status">) => string;
  updatePatient: (id: string, patch: Partial<Omit<Patient, "id">>) => void;
  addAppointment: (input: Omit<Appointment, "id" | "documentos" | "notas" | "medicamentoRascunho" | "posologia"> & { documentos?: DocFile[] }) => string;
  updateAppointment: (id: string, patch: Partial<Omit<Appointment, "id">>) => void;
  resetDemo: () => void;
};

const seed = buildSeed();

export const useClinic = create<ClinicState>()(
  persist(
    (set, get) => ({
      tenantId: null,
      configs: DEFAULT_CONFIGS,
      patients: seed.patients,
      appointments: seed.appointments,
      enter: (tenantId) => set({ tenantId }),
      leave: () => set({ tenantId: null }),
      saveConfig: (patch) => {
        const id = get().tenantId;
        if (!id) return;
        const current = get().configs[id] ?? DEFAULT_CONFIGS[id] ?? { email: "", whatsapp: "" };
        set({ configs: { ...get().configs, [id]: { ...current, ...patch } } });
      },
      addPatient: (input) => {
        const id = nid("P");
        const patient: Patient = { ...input, id, status: "Ativo" };
        set({ patients: [...get().patients, patient] });
        return id;
      },
      updatePatient: (id, patch) =>
        set({
          patients: get().patients.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }),
      addAppointment: (input) => {
        const id = nid("A");
        const appointment: Appointment = {
          notas: "",
          medicamentoRascunho: "",
          posologia: "",
          documentos: input.documentos ?? [],
          ...input,
          id,
        };
        set({ appointments: [...get().appointments, appointment] });
        return id;
      },
      updateAppointment: (id, patch) =>
        set({
          appointments: get().appointments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        }),
      resetDemo: () => {
        const next = buildSeed();
        set({
          patients: next.patients,
          appointments: next.appointments,
          configs: DEFAULT_CONFIGS,
        });
      },
    }),
    {
      name: "clinic-saas-mvp",
      skipHydration: true,
      partialize: (s) => ({
        tenantId: s.tenantId,
        configs: s.configs,
        patients: s.patients,
        appointments: s.appointments,
      }),
    },
  ),
);
