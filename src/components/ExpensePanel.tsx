import React, { useState } from 'react';
import { ExpenseEntry, EntryType, Category } from '../types';
import { fmt } from '../utils/helpers';
import { COLOR_DARK } from '../utils/constants';

interface Props {
  expenses: ExpenseEntry[];
  categories: Category[];
  currency: string;
  onAdd: (name: string, amount: number, catId: string, type: EntryType) => void;
  onDelete: (id: number) => void;
}

export const ExpensePanel: React.FC<Props> = ({
  expenses, categories, currency, onAdd, onDelete,
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [catId, setCatId] = useState(categories[0]?.id ?? '');
  const [type, setType] = useState<EntryType>('fixed');

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;
    onAdd(name.trim(), amt, catId, type);
    setName(''); setAmount(''); setType('fixed'); setOpen(false);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">🧾 Expenses</span>
        <button className="pill-btn btn-pink" onClick={() => setOpen(o => !o)}>
          + Add expense
        </button>
      </div>

      {open && (
        <div className="add-form">
          <div className="form-row">
            <input className="fi" placeholder="What did you spend on?" value={name}
              onChange={e => setName(e.target.value)} />
            <input className="fi" type="number" placeholder="Amount" value={amount}
              onChange={e => setAmount(e.target.value)} min="0" />
          </div>
          <div className="form-row">
            <select className="fi" value={catId} onChange={e => setCatId(e.target.value)}>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div className="toggle-row">
            <label className={`tog-opt${type === 'fixed' ? ' selected' : ''}`}>
              <input type="radio" name="etype" checked={type === 'fixed'}
                onChange={() => setType('fixed')} /> Monthly (fixed)
            </label>
            <label className={`tog-opt${type === 'onetime' ? ' selected' : ''}`}>
              <input type="radio" name="etype" checked={type === 'onetime'}
                onChange={() => setType('onetime')} /> One-time
            </label>
          </div>
          <div className="form-actions">
            <button className="pill-btn btn-pink" onClick={handleSave}>Save expense</button>
            <button className="pill-btn btn-cancel" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="entry-list">
        {expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🧾</div>
            No expenses yet — add one above
          </div>
        ) : (
          expenses.map(e => {
            const cat = categories.find(c => c.id === e.catId) ?? categories[categories.length - 1];
            const dark = COLOR_DARK[cat.color] ?? '#333';
            return (
              <div key={e.id} className="entry-row expense-entry"
                style={{ borderLeftColor: cat.color, background: `${cat.color}22` }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{cat.icon}</span>
                <span className="entry-name">{e.name}</span>
                <span className="pill" style={{ background: cat.color, color: dark }}>{cat.name}</span>
                <span className={`pill ${e.type === 'fixed' ? 'pill-fixed' : 'pill-onetime'}`}>
                  {e.type === 'fixed' ? 'Monthly' : 'One-time'}
                </span>
                <span className="entry-amount">{fmt(e.amount, currency)}</span>
                <button className="del-btn" onClick={() => onDelete(e.id)}
                  aria-label={`Remove ${e.name}`}>🗑</button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
