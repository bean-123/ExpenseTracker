import type { Category } from '../types';

export const EMOJIS = [
  '🏠','🛒','🚗','📱','💊','🎬','💰','📦',
  '✈️','🎓','🐾','👗','🍕','☕','💡','🏋️',
  '🎮','🎵','💄','🧴','🏦','🎁',
];

export const PALETTE_COLORS = [
  '#FFD6E0','#C5E8F7','#C8F5E1','#FFF3B0',
  '#E2D9F3','#FFE5CC','#D6F0FF','#FFD6F5',
  '#D6FFE8','#FFF0D6','#E8D6FF','#D6FFFD',
];

export const COLOR_DARK: Record<string, string> = {
  '#FFD6E0': '#b5476a',
  '#C5E8F7': '#1a6a92',
  '#C8F5E1': '#1a7a50',
  '#FFF3B0': '#9a7c00',
  '#E2D9F3': '#6842b0',
  '#FFE5CC': '#b05a10',
  '#D6F0FF': '#1a5a80',
  '#FFD6F5': '#8a2070',
  '#D6FFE8': '#0a6a35',
  '#FFF0D6': '#8a5000',
  '#E8D6FF': '#5020a0',
  '#D6FFFD': '#0a7070',
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'housing',        name: 'Housing',        icon: '🏠', color: '#C5E8F7', builtIn: true },
  { id: 'food',           name: 'Food',            icon: '🛒', color: '#FFD6E0', builtIn: true },
  { id: 'transport',      name: 'Transport',       icon: '🚗', color: '#C8F5E1', builtIn: true },
  { id: 'subscriptions',  name: 'Subscriptions',   icon: '📱', color: '#E2D9F3', builtIn: true },
  { id: 'health',         name: 'Health',          icon: '💊', color: '#FFE5CC', builtIn: true },
  { id: 'entertainment',  name: 'Entertainment',   icon: '🎬', color: '#FFF3B0', builtIn: true },
  { id: 'savings',        name: 'Savings',         icon: '💰', color: '#D6FFE8', builtIn: true },
  { id: 'other',          name: 'Other',           icon: '📦', color: '#D6F0FF', builtIn: true },
];

export const CURRENCIES = ['€', '$', '£', 'kr', '¥'];

export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
