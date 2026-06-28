export type EntryType = 'fixed' | 'onetime';

export interface IncomeEntry {
  id: number;
  sourceId?: number;
  name: string;
  amount: number;
  type: EntryType;
  endMonth?: string;
}

export interface ExpenseEntry {
  id: number;
  sourceId?: number;
  name: string;
  amount: number;
  catId: string;
  type: EntryType;
  endMonth?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  builtIn: boolean;
}

export interface MonthData {
  incomes: IncomeEntry[];
  expenses: ExpenseEntry[];
  savingsGoal: number;
}

export interface AppState {
  monthData: Record<string, MonthData>;
  categories: Category[];
  currency: string;
}

export type TabName = 'income' | 'expense' | 'categories';