export interface WorkEntry {
  id: string;
  date: string; // ISO string
  description: string;
  duration: number; // Duration in hours
  volume: number;
  unit: string;
  status: 'selesai' | 'proses';
  approved: boolean | null;
  createdAt: string; // ISO string
  updatedAt: string | null; // ISO string
}

export type WorkEntryFormData = Omit<WorkEntry, 'id' | 'createdAt' | 'updatedAt' | 'approved'>;