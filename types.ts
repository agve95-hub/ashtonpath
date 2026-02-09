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
  ASHTON = 'Ashton Manual Standard', 
  CUSTOM = 'Custom (Target Date)'
}

export type Metabolism = 'slow' | 'average' | 'fast';

export type TaperPhase = 'crossover' | 'stabilize' | 'reduction' | 'jump';

export interface BenzoData {
  name: string;
  halfLife: string;
  diazepamEquivalence: number; // 1mg of this = X mg Diazepam
}

export interface TaperStep {
  id: string;
  week: number;
  phase: TaperPhase; 
  originalMedDose: number; // Dose of the original med (e.g., Xanax)
  diazepamDose: number; // Dose of Valium
  totalDiazepamEq: number; // For the chart
  isCompleted: boolean;
  completedDays: boolean[]; // Array tracking daily completion
  durationDays: number; // Expected days in this step (usually 7 or 14)
  notes?: string;
  globalDayStart: number; // To track "Day X of withdrawal"
}

export interface TaperPlan {
  medication: BenzoType;
  startDose: number;
  startDate: string; // ISO string
  speed: TaperSpeed;
  age: number;
  metabolism: Metabolism;
  yearsUsing: number;
  steps: TaperStep[];
  isDiazepamCrossOver: boolean; 
}

export interface UserPreferences {
  hasAcceptedDisclaimer: boolean;
  theme: 'light' | 'dark'; 
}

export interface DailyLogEntry {
  date: string; // YYYY-MM-DD
  // Ashton Specific Symptoms
  stress: number; // 0-10
  tremors: number; // 0-10
  dizziness: number; // 0-10
  musclePain?: number; // 0-10
  nausea?: number; // 0-10
  irritability?: number; // 0-10
  // New Ashton symptoms
  depersonalization?: number; // 0-10 (Psychological)
  sensorySensitivity?: number; // 0-10 (Light/Sound/Taste)
  tinnitus?: number; // 0-10 (Ringing ears)
  
  sleepQuality: number; // 0-10
  sleepHours: number;
  systolic: string; // BP Systolic
  diastolic: string; // BP Diastolic
  medications: string; // Other meds taken
  activities?: string[]; // New field for activities
  notes: string;
}

export interface UserProfile {
  name: string;
  avatar?: string;
}