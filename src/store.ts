import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AmputationLevel = 
  | 'Transtibial' 
  | 'Transfemoral' 
  | 'Partial Foot' 
  | 'Hip Disarticulation' 
  | 'Transradial' 
  | 'Transhumeral' 
  | 'Other';

export interface FollowUp {
  id: string;
  date: string;
  notes: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface ProstheticSpec {
  id: string;
  type: string;
  socketType: string;
  components: string;
  alignmentNotes: string;
  dateFitted: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  amputationLevel: AmputationLevel;
  amputationDate?: string;
  notes: string;
  prosthetics: ProstheticSpec[];
  followUps: FollowUp[];
  createdAt: string;
}

interface ClinicStore {
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'prosthetics' | 'followUps'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addProsthetic: (clientId: string, spec: Omit<ProstheticSpec, 'id'>) => void;
  addFollowUp: (clientId: string, followUp: Omit<FollowUp, 'id'>) => void;
  updateFollowUp: (clientId: string, followUpId: string, updates: Partial<FollowUp>) => void;
}

export const useClinicStore = create<ClinicStore>()(
  persist(
    (set) => ({
      clients: [],
      addClient: (clientData) => set((state) => ({
        clients: [
          ...state.clients,
          {
            ...clientData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            prosthetics: [],
            followUps: [],
          }
        ]
      })),
      updateClient: (id, updates) => set((state) => ({
        clients: state.clients.map((c) => c.id === id ? { ...c, ...updates } : c)
      })),
      deleteClient: (id) => set((state) => ({
        clients: state.clients.filter((c) => c.id !== id)
      })),
      addProsthetic: (clientId, spec) => set((state) => ({
        clients: state.clients.map((c) => 
          c.id === clientId 
            ? { ...c, prosthetics: [...c.prosthetics, { ...spec, id: crypto.randomUUID() }] } 
            : c
        )
      })),
      addFollowUp: (clientId, followUp) => set((state) => ({
        clients: state.clients.map((c) => 
          c.id === clientId 
            ? { ...c, followUps: [...c.followUps, { ...followUp, id: crypto.randomUUID() }] } 
            : c
        )
      })),
      updateFollowUp: (clientId, followUpId, updates) => set((state) => ({
        clients: state.clients.map((c) => 
          c.id === clientId 
            ? { 
                ...c, 
                followUps: c.followUps.map((f) => f.id === followUpId ? { ...f, ...updates } : f) 
              } 
            : c
        )
      })),
    }),
    {
      name: 'prosthetic-clinic-storage',
    }
  )
);
