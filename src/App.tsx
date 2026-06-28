import { useState, useEffect } from 'react';
import type { TabName, EntryType, IncomeEntry, ExpenseEntry } from './types';
import { useAppState } from './hooks/useAppState';
import { emptyMonthData, getMonthOptions, getCurrentMonthKey, monthKeyToNumber } from './utils/helpers';
import { exportToPDF } from './utils/exportPDF';
import { SummaryCards } from './components/SummaryCards';
import { IncomePanel } from './components/IncomePanel';
import { ExpensePanel } from './components/ExpensePanel';
import { CategoriesPanel } from './components/CategoriesPanel';
import { SavingsGoal } from './components/SavingsGoal';
import { DonutChart } from './components/DonutChart';
import './App.css';

const MONTH_OPTIONS = getMonthOptions();

export default function App() {
  const [state, setState] = useAppState();
  const [monthKey, setMonthKey] = useState(getCurrentMonthKey);
  const [tab, setTab] = useState<TabName>('income');

  const md = state.monthData[monthKey] ?? emptyMonthData();

  const setMd = (patch: Partial<typeof md>) =>
    setState(s => ({
      ...s,
      monthData: { ...s.monthData, [monthKey]: { ...md, ...patch } },
    }));

  // Auto-carry fixed entries from the previous month into any month that has no data yet
  useEffect(() => {
    if (state.monthData[monthKey]) return; // already has data, don't overwrite

    // Find the most recent month that has data
    const allKeys = Object.keys(state.monthData).sort((a, b) => monthKeyToNumber(a) - monthKeyToNumber(b));
    if (allKeys.length === 0) return;
    const prevKey = allKeys[allKeys.length - 1];
    const prevMd = state.monthData[prevKey];
    const currentMonthValue = monthKeyToNumber(monthKey);

    const carriedIncomes = prevMd.incomes
      .filter(e => e.type === 'fixed' && (!e.endMonth || currentMonthValue <= monthKeyToNumber(e.endMonth)))
      .map(e => ({ ...e, id: Date.now() + Math.random(), sourceId: e.sourceId ?? e.id }));

    const carriedExpenses = prevMd.expenses
      .filter(e => e.type === 'fixed' && (!e.endMonth || currentMonthValue <= monthKeyToNumber(e.endMonth)))
      .map(e => ({ ...e, id: Date.now() + Math.random(), sourceId: e.sourceId ?? e.id }));

    if (carriedIncomes.length === 0 && carriedExpenses.length === 0) return;

    setState(s => ({
      ...s,
      monthData: {
        ...s.monthData,
        [monthKey]: {
          incomes: carriedIncomes,
          expenses: carriedExpenses,
          savingsGoal: prevMd.savingsGoal,
        },
      },
    }));
  }, [monthKey]);

  const totalIn = md.incomes.reduce((a, e) => a + e.amount, 0);
  const totalEx = md.expenses.reduce((a, e) => a + e.amount, 0);
  const left    = totalIn - totalEx;

  // Income actions
  const addIncome = (name: string, amount: number, type: EntryType) => {
    const sourceId = Date.now();
    const newEntry = { id: Date.now() + Math.random(), sourceId, name, amount, type };
    setState(s => {
      const monthData = { ...s.monthData };
      const current = monthData[monthKey] ?? emptyMonthData();
      monthData[monthKey] = { ...current, incomes: [...current.incomes, newEntry] };

      if (type === 'fixed') {
        Object.entries(monthData).forEach(([key, month]) => {
          if (monthKeyToNumber(key) <= monthKeyToNumber(monthKey)) return;
          const entryExists = month.incomes.some(e => (e.sourceId ?? e.id) === sourceId);
          if (!entryExists) {
            monthData[key] = { ...month, incomes: [...month.incomes, { ...newEntry, id: Date.now() + Math.random() }] };
          }
        });
      }

      return { ...s, monthData };
    });
  };

  const editIncome = (id: number, name: string, amount: number, type: EntryType, endMonth?: string) =>
    setState(s => {
      const existing = s.monthData[monthKey] ?? emptyMonthData();
      const target = existing.incomes.find(e => e.id === id);
      if (!target) return s;
      const sourceId = target.sourceId ?? target.id;
      const currentMonthValue = monthKeyToNumber(monthKey);
      const updatedEntry: IncomeEntry = {
        ...target,
        name,
        amount,
        type,
        endMonth: type === 'fixed' ? endMonth : undefined,
        sourceId,
      };

      return {
        ...s,
        monthData: Object.fromEntries(Object.entries(s.monthData).map(([key, month]) => {
          const monthValue = monthKeyToNumber(key);
          return [key, {
            ...month,
            incomes: month.incomes.flatMap(e => {
              const entrySourceId = e.sourceId ?? e.id;
              const matchesSource = entrySourceId === sourceId;
              if (monthValue === currentMonthValue) {
                return e.id === id ? [updatedEntry] : [e];
              }
              if (!matchesSource) return [e];
              return type === 'fixed' ? [{ ...e, ...updatedEntry, id: e.id }] : [];
            }),
          }];
        })),
      };
    });

  const delIncome = (id: number) =>
    setMd({ incomes: md.incomes.filter(e => e.id !== id) });

  const endIncomeThisMonth = (id: number) => {
    const target = md.incomes.find(e => e.id === id);
    if (!target) return;
    const sourceId = target.sourceId ?? target.id;
    setState(s => {
      const futureMonthData = Object.fromEntries(Object.entries(s.monthData).map(([key, month]) => {
        if (monthKeyToNumber(key) <= monthKeyToNumber(monthKey)) return [key, month];
        return [key, {
          ...month,
          incomes: month.incomes.filter(e => {
            const entrySourceId = e.sourceId ?? e.id;
            const sameSource = entrySourceId === sourceId;
            const sameExact = !e.sourceId && e.name === target.name && e.amount === target.amount && e.type === 'fixed';
            return !(sameSource || sameExact);
          }),
        }];
      }));

      const existing = s.monthData[monthKey] ?? emptyMonthData();
      return {
        ...s,
        monthData: {
          ...s.monthData,
          ...futureMonthData,
          [monthKey]: {
            ...existing,
            incomes: existing.incomes.map(e => e.id === id ? { ...e, endMonth: monthKey, sourceId } : e),
          },
        },
      };
    });
  };

  // Expense actions
  const addExpense = (name: string, amount: number, catId: string, type: EntryType) => {
    const sourceId = Date.now();
    const newEntry = { id: Date.now() + Math.random(), sourceId, name, amount, catId, type };
    setState(s => {
      const monthData = { ...s.monthData };
      const current = monthData[monthKey] ?? emptyMonthData();
      monthData[monthKey] = { ...current, expenses: [...current.expenses, newEntry] };

      if (type === 'fixed') {
        Object.entries(monthData).forEach(([key, month]) => {
          if (monthKeyToNumber(key) <= monthKeyToNumber(monthKey)) return;
          const entryExists = month.expenses.some(e => (e.sourceId ?? e.id) === sourceId);
          if (!entryExists) {
            monthData[key] = { ...month, expenses: [...month.expenses, { ...newEntry, id: Date.now() + Math.random() }] };
          }
        });
      }

      return { ...s, monthData };
    });
  };

  const editExpense = (id: number, name: string, amount: number, catId: string, type: EntryType, endMonth?: string) =>
    setState(s => {
      const existing = s.monthData[monthKey] ?? emptyMonthData();
      const target = existing.expenses.find(e => e.id === id);
      if (!target) return s;
      const sourceId = target.sourceId ?? target.id;
      const currentMonthValue = monthKeyToNumber(monthKey);
      const updatedEntry: ExpenseEntry = {
        ...target,
        name,
        amount,
        catId,
        type,
        endMonth: type === 'fixed' ? endMonth : undefined,
        sourceId,
      };

      return {
        ...s,
        monthData: Object.fromEntries(Object.entries(s.monthData).map(([key, month]) => {
          const monthValue = monthKeyToNumber(key);
          return [key, {
            ...month,
            expenses: month.expenses.flatMap(e => {
              const entrySourceId = e.sourceId ?? e.id;
              const matchesSource = entrySourceId === sourceId;
              if (monthValue === currentMonthValue) {
                return e.id === id ? [updatedEntry] : [e];
              }
              if (!matchesSource) return [e];
              return type === 'fixed' ? [{ ...e, ...updatedEntry, id: e.id }] : [];
            }),
          }];
        })),
      };
    });

  const delExpense = (id: number) =>
    setMd({ expenses: md.expenses.filter(e => e.id !== id) });

  const endExpenseThisMonth = (id: number) => {
    const target = md.expenses.find(e => e.id === id);
    if (!target) return;
    const sourceId = target.sourceId ?? target.id;
    setState(s => {
      const futureMonthData = Object.fromEntries(Object.entries(s.monthData).map(([key, month]) => {
        if (monthKeyToNumber(key) <= monthKeyToNumber(monthKey)) return [key, month];
        return [key, {
          ...month,
          expenses: month.expenses.filter(e => {
            const entrySourceId = e.sourceId ?? e.id;
            const sameSource = entrySourceId === sourceId;
            const sameExact = !e.sourceId && e.name === target.name && e.amount === target.amount && e.type === 'fixed' && e.catId === target.catId;
            return !(sameSource || sameExact);
          }),
        }];
      }));

      const existing = s.monthData[monthKey] ?? emptyMonthData();
      return {
        ...s,
        monthData: {
          ...s.monthData,
          ...futureMonthData,
          [monthKey]: {
            ...existing,
            expenses: existing.expenses.map(e => e.id === id ? { ...e, endMonth: monthKey, sourceId } : e),
          },
        },
      };
    });
  };

  // Category actions
  const addCategory = (name: string, icon: string, color: string) =>
    setState(s => ({
      ...s,
      categories: [...s.categories, { id: `cat_${Date.now()}`, name, icon, color, builtIn: false }],
    }));
  const delCategory = (id: string) =>
    setState(s => ({ ...s, categories: s.categories.filter(c => c.id !== id) }));

  return (
    <div className="app">
      {/* Top bar */}
      <div className="top-bar">
        <div className="app-title">💰 MoneyBud</div>
        <div className="top-controls">
          <select className="ctrl-sel" value={monthKey} onChange={e => setMonthKey(e.target.value)}>
            {MONTH_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <select className="ctrl-sel" value={state.currency}
            onChange={e => setState(s => ({ ...s, currency: e.target.value }))}>
            {['€', '$', '£', 'kr', '¥'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button className="pill-btn btn-lavender"
            onClick={() => exportToPDF(monthKey, md, state.categories, state.currency)}>
            ⬇ Export PDF
          </button>
        </div>
      </div>

      {/* Summary */}
      <SummaryCards
        totalIn={totalIn} totalEx={totalEx} left={left}
        incomeCount={md.incomes.length} expenseCount={md.expenses.length}
        currency={state.currency}
      />

      {/* Tabs */}
      <div className="tabs">
        {(['income', 'expense', 'categories'] as TabName[]).map(t => (
          <button key={t}
            className={`tab tab-${t === 'categories' ? 'cats' : t}${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}>
            {t === 'income' ? '💸 Income' : t === 'expense' ? '🧾 Expenses' : '🏷️ Categories'}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {tab === 'income' && (
        <IncomePanel incomes={md.incomes} currency={state.currency}
          currentMonthKey={monthKey}
          onAdd={addIncome} onEdit={editIncome} onEndThisMonth={endIncomeThisMonth} onDelete={delIncome} />
      )}
      {tab === 'expense' && (
        <ExpensePanel expenses={md.expenses} categories={state.categories}
          currency={state.currency} currentMonthKey={monthKey}
          onAdd={addExpense} onEdit={editExpense} onEndThisMonth={endExpenseThisMonth} onDelete={delExpense} />
      )}
      {tab === 'categories' && (
        <CategoriesPanel categories={state.categories} expenses={md.expenses}
          currency={state.currency} onAdd={addCategory} onDelete={delCategory} />
      )}

      {/* Bottom row */}
      <div className="bottom-row">
        <SavingsGoal
          goal={md.savingsGoal} left={left} currency={state.currency}
          onChange={val => setMd({ savingsGoal: val })}
        />
        <DonutChart expenses={md.expenses} categories={state.categories} currency={state.currency} />
      </div>
    </div>
  );
}
