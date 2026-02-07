export enum BenzoType {
  ALPRAZOLAM = 'Alprazolam (Xanax)',
  CLONAZEPAM = 'Clonazepam (Klonopin)',
  DIAZEPAM = 'Diazepam (Valium)',
  LORAZEPAM = 'Lorazepam (Ativan)',
  TEMAZEPAM = 'Temazepam (Restoril)',
  CHLORDIAZEPOXIDE = 'Chlordiazepoxide (Librium)'
}

export enum TaperSpeed {
  SLOW = 'Slow (5% cuts)',
  MODERATE = 'Moderate (10% cuts)',
  FAST = 'Standard Ashton (Varied)', // The classic manual often uses fixed mg drops which equate to variable %
  CUSTOM = 'Custom (Target Date)'
}

export interface BenzoData {
  name: string;
  halfLife: string;
  diazepamEquivalence: number; // 1mg of this = X mg Diazepam
}

export interface TaperStep {
  id: string;
  week: number;
  originalMedDose: number; // If tapering directly
  diazepamDose: number; // The target diazepam dose
  isCompleted: boolean;
  completedDays: boolean[]; // Array tracking daily completion
  durationDays: number; // Expected days in this step (usually 7 or 14)
  notes?: string;
}

export interface TaperPlan {
  medication: BenzoType;
  startDose: number;
  startDate: string; // ISO string
  speed: TaperSpeed;
  steps: TaperStep[];
  isDiazepamCrossOver: boolean; // True if converting to Valium first
}

export interface UserPreferences {
  hasAcceptedDisclaimer: boolean;
  theme: 'light' | 'dark'; // Simplified for now
}

export interface DailyLogEntry {
  date: string; // YYYY-MM-DD
  stress: number; // 0-10
  tremors: number; // 0-10
  dizziness: number; // 0-10
  sleepQuality: number; // 0-10
  sleepHours: number;
  systolic: string; // BP Systolic
  diastolic: string; // BP Diastolic
  medications: string; // Other meds taken
  notes: string;
}

export interface UserProfile {
  name: string;
  age: string;
  usageDuration: string;
  avatar?: string;
}