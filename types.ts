
export interface ExerciseSet {
  weight: number;
  reps: number;
}

export interface WorkoutEntry {
  completed: boolean;
  blockNumber: 1 | 2 | 3;
  exerciseA: ExerciseSet[];
  exerciseB: ExerciseSet[];
  date: string; // ISO string
  duration?: number; // In seconds
}

export interface ProgressData {
  [dateKey: string]: WorkoutEntry;
}

export interface BlockStats {
  exerciseA: ExerciseSet[];
  exerciseB: ExerciseSet[];
}

export interface MonthSummary {
  totalWorkouts: number;
  personalBests: {
    [exerciseKey: string]: ExerciseSet;
  };
}

export interface AIAnalysis {
  headline: string;
  summary: string;
  recommendations: string[];
  status: 'optimizing' | 'plateau' | 'peak';
}

export type Language = 'en' | 'ru' | 'pl';
