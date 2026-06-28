import { useState, useEffect } from 'react';
import type { TabName, EntryType } from './types';
import { useAppState } from './hooks/useAppState';
import { emptyMonthData, getMonthOptions, getCurrentMonthKey } from './utils/helpers';
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
    const allKeys = Object.keys(state.monthData).sort();
    if (allKeys.length === 0) return;
    const prevKey = allKeys[allKeys.length - 1];
    const prevMd = state.monthData[prevKey];

    const carriedIncomes = prevMd.incomes
      .filter(e => e.type === 'fixed')
      .map(e => ({ ...e, id: Date.now() + Math.random() }));

    const carriedExpenses = prevMd.expenses
      .filter(e => e.type === 'fixed')
      .map(e => ({ ...e, id: Date.now() + Math.random() }));

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
  const addIncome = (name: string, amount: number, type: EntryType) =>
    setMd({ incomes: [...md.incomes, { id: Date.now(), name, amount, type }] });

  const editIncome = (id: number, name: string, amount: number, type: EntryType) =>
    setMd({ incomes: md.incomes.map(e => e.id === id ? { ...e, name, amount, type } : e) });

  const delIncome = (id: number) =>
    setMd({ incomes: md.incomes.filter(e => e.id !== id) });

  // Expense actions
  const addExpense = (name: string, amount: number, catId: string, type: EntryType) =>
    setMd({ expenses: [...md.expenses, { id: Date.now(), name, amount, catId, type }] });

  const editExpense = (id: number, name: string, amount: number, catId: string, type: EntryType) =>
    setMd({ expenses: md.expenses.map(e => e.id === id ? { ...e, name, amount, catId, type } : e) });

  const delExpense = (id: number) =>
    setMd({ expenses: md.expenses.filter(e => e.id !== id) });

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
          onAdd={addIncome} onEdit={editIncome} onDelete={delIncome} />
      )}
      {tab === 'expense' && (
        <ExpensePanel expenses={md.expenses} categories={state.categories}
          currency={state.currency} onAdd={addExpense} onEdit={editExpense} onDelete={delExpense} />
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
