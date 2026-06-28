import { MONTHS } from './constants';
import type { MonthData } from '../types';

export function fmt(amount: number, currency: string): string {
  return `${currency}${Math.abs(Math.round(amount)).toLocaleString()}`;
}

export function getMonthOptions(): { key: string; label: string }[] {
  const now = new Date();
  const options = [];
  for (let i = -2; i <= 4; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    const label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    options.push({ key, label });
  }
  return options;
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}`;
}

export function getMonthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

export function emptyMonthData(): MonthData {
  return { incomes: [], expenses: [], savingsGoal: 0 };
}

export function calcHealthScore(left: number, totalIn: number): {
  label: string;
  cls: string;
  desc: string;
} {
  const pct = totalIn > 0 ? Math.round((left / totalIn) * 100) : 0;
  if (left < 0)   return { label: 'Overspending', cls: 'hr', desc: 'Spending more than you earn' };
  if (pct < 20)   return { label: 'Watch it',     cls: 'ha', desc: 'Try to save at least 20%' };
  return             { label: 'Healthy',          cls: 'hg', desc: 'Great job keeping on track!' };
}
