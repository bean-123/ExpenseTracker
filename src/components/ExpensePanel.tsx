import React, { useState } from 'react';
import type { ExpenseEntry, EntryType, Category } from '../types';
import { fmt } from '../utils/helpers';
import { COLOR_DARK } from '../utils/constants';

interface Props {
  expenses: ExpenseEntry[];
  categories: Category[];
  currency: string;
  currentMonthKey: string;
  onAdd: (name: string, amount: number, catId: string, type: EntryType) => void;
  onEdit: (id: number, name: string, amount: number, catId: string, type: EntryType, endMonth?: string) => void;
  onEndThisMonth: (id: number, endMonth: string) => void;
  onDelete: (id: number) => void;
}

interface EditState {
  id: number;
  name: string;
  amount: string;
  catId: string;
  type: EntryType;
  endMonth?: string;
}

export const ExpensePanel: React.FC<Props> = ({
  expenses, categories, currency, currentMonthKey, onAdd, onEdit, onEndThisMonth, onDelete,
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [catId, setCatId] = useState(categories[0]?.id ?? '');
  const [type, setType] = useState<EntryType>('fixed');
  const [editing, setEditing] = useState<EditState | null>(null);

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;
    onAdd(name.trim(), amt, catId, type);
    setName(''); setAmount(''); setType('fixed'); setOpen(false);
  };

  const handleEditSave = () => {
    if (!editing) return;
    const amt = parseFloat(editing.amount);
    if (!editing.name.trim() || isNaN(amt) || amt <= 0) return;
    onEdit(editing.id, editing.name.trim(), amt, editing.catId, editing.type, editing.type === 'fixed' ? editing.endMonth : undefined);
    setEditing(null);
  };

  const startEdit = (e: ExpenseEntry) => {
    setOpen(false);
    setEditing({ id: e.id, name: e.name, amount: String(e.amount), catId: e.catId, type: e.type, endMonth: e.endMonth });
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">🧾 Expenses</span>
        <button className="pill-btn btn-pink" onClick={() => { setOpen(o => !o); setEditing(null); }}>
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
              <input type="radio" name="etype-add" checked={type === 'fixed'}
                onChange={() => setType('fixed')} /> Monthly (fixed)
            </label>
            <label className={`tog-opt${type === 'onetime' ? ' selected' : ''}`}>
              <input type="radio" name="etype-add" checked={type === 'onetime'}
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
            const dark = COLOR_DARK[cat?.color] ?? '#333';
            return (
              <React.Fragment key={e.id}>
                <div className="entry-row expense-entry"
                  style={{ borderLeftColor: cat?.color, background: `${cat?.color}22` }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{cat?.icon}</span>
                  <span className="entry-name">{e.name}</span>
                  <span className="pill" style={{ background: cat?.color, color: dark }}>{cat?.name}</span>
                  <span className={`pill ${e.type === 'fixed' ? 'pill-fixed' : 'pill-onetime'}`}>
                    {e.type === 'fixed' ? 'Monthly' : 'One-time'}
                  </span>
                  {e.type === 'fixed' && e.endMonth === currentMonthKey && (
                    <span className="entry-note">Ends this month</span>
                  )}
                  <span className="entry-amount">{fmt(e.amount, currency)}</span>
                  <button className="edit-btn" onClick={() => startEdit(e)}
                    aria-label={`Edit ${e.name}`}>✏️</button>
                  <button className="del-btn" onClick={() => onDelete(e.id)}
                    aria-label={`Remove ${e.name}`}>🗑</button>
                  {e.type === 'fixed' && e.endMonth !== currentMonthKey && (
                    <button type="button" className="pill-btn btn-cancel end-btn"
                      title="Stop this monthly expense after the current month"
                      onClick={() => onEndThisMonth(e.id, currentMonthKey)}>
                      Ends this month
                    </button>
                  )}
                </div>
                {editing?.id === e.id && (
                  <div className="add-form edit-form">
                    <div className="form-row">
                      <input className="fi" placeholder="Expense name" value={editing.name}
                        onChange={ev => setEditing(ed => ed && ({ ...ed, name: ev.target.value }))} />
                      <input className="fi" type="number" placeholder="Amount" value={editing.amount}
                        onChange={ev => setEditing(ed => ed && ({ ...ed, amount: ev.target.value }))} min="0" />
                    </div>
                    <div className="form-row">
                      <select className="fi" value={editing.catId}
                        onChange={ev => setEditing(ed => ed && ({ ...ed, catId: ev.target.value }))}>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="toggle-row">
                      <label className={`tog-opt${editing.type === 'fixed' ? ' selected' : ''}`}>
                        <input type="radio" name={`etype-edit-${e.id}`} checked={editing.type === 'fixed'}
                          onChange={() => setEditing(ed => ed && ({ ...ed, type: 'fixed' }))} /> Monthly (fixed)
                      </label>
                      <label className={`tog-opt${editing.type === 'onetime' ? ' selected' : ''}`}>
                        <input type="radio" name={`etype-edit-${e.id}`} checked={editing.type === 'onetime'}
                          onChange={() => setEditing(ed => ed && ({ ...ed, type: 'onetime' }))} /> One-time
                      </label>
                    </div>
                    <div className="form-actions">
                      <button className="pill-btn btn-pink" onClick={handleEditSave}>Save changes</button>
                      <button className="pill-btn btn-cancel" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
};
