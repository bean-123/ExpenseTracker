import { useState, useEffect } from 'react';
import { AppState } from '../types';
import { DEFAULT_CATEGORIES } from '../utils/constants';

const STORAGE_KEY = 'budgetapp_v3';

function defaultState(): AppState {
  return {
    monthData: {},
    categories: DEFAULT_CATEGORIES,
    currency: '€',
  };
}

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as AppState;
    } catch (_) {}
    return defaultState();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
  }, [state]);

  return [state, setState] as const;
}
