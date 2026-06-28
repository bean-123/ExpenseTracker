export type EntryType = 'fixed' | 'onetime';

export interface IncomeEntry {
  id: number;
  name: string;
  amount: number;
  type: EntryType;
}

export interface ExpenseEntry {
  id: number;
  name: string;
  amount: number;
  catId: string;
  type: EntryType;
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