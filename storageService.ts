import { ProgressData } from './types';

const STORAGE_KEY = 'fittrack_progress_v1';

export const saveProgress = (data: ProgressData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadProgress = (): ProgressData => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return {};
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to parse saved progress", e);
    return {};
  }
};