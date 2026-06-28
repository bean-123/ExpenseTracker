import React, { useState } from 'react';
import type { IncomeEntry, EntryType } from '../types';
import { fmt } from '../utils/helpers';

interface Props {
  incomes: IncomeEntry[];
  currency: string;
  currentMonthKey: string;
  onAdd: (name: string, amount: number, type: EntryType) => void;
  onEdit: (id: number, name: string, amount: number, type: EntryType, endMonth?: string) => void;
  onEndThisMonth: (id: number, endMonth: string) => void;
  onDelete: (id: number) => void;
}

interface EditState {
  id: number;
  name: string;
  amount: string;
  type: EntryType;
  endMonth?: string;
}

export const IncomePanel: React.FC<Props> = ({ incomes, currency, currentMonthKey, onAdd, onEdit, onEndThisMonth, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<EntryType>('fixed');
  const [editing, setEditing] = useState<EditState | null>(null);

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;
    onAdd(name.trim(), amt, type);
    setName(''); setAmount(''); setType('fixed'); setOpen(false);
  };

  const handleEditSave = () => {
    if (!editing) return;
    const amt = parseFloat(editing.amount);
    if (!editing.name.trim() || isNaN(amt) || amt <= 0) return;
    onEdit(editing.id, editing.name.trim(), amt, editing.type, editing.type === 'fixed' ? editing.endMonth : undefined);
    setEditing(null);
  };

  const startEdit = (e: IncomeEntry) => {
    setOpen(false);
    setEditing({ id: e.id, name: e.name, amount: String(e.amount), type: e.type, endMonth: e.endMonth });
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">💸 Income sources</span>
        <button className="pill-btn btn-blue" onClick={() => { setOpen(o => !o); setEditing(null); }}>
          + Add income
        </button>
      </div>

      {open && (
        <div className="add-form">
          <div className="form-row">
            <input className="fi" placeholder="Source name (e.g. salary)" value={name}
              onChange={e => setName(e.target.value)} />
            <input className="fi" type="number" placeholder="Amount" value={amount}
              onChange={e => setAmount(e.target.value)} min="0" />
          </div>
          <div className="toggle-row">
            <label className={`tog-opt${type === 'fixed' ? ' selected' : ''}`}>
              <input type="radio" name="itype-add" checked={type === 'fixed'}
                onChange={() => setType('fixed')} /> Fixed monthly
            </label>
            <label className={`tog-opt${type === 'onetime' ? ' selected' : ''}`}>
              <input type="radio" name="itype-add" checked={type === 'onetime'}
                onChange={() => setType('onetime')} /> Variable / one-time
            </label>
          </div>
          <div className="form-actions">
            <button className="pill-btn btn-blue" onClick={handleSave}>Save income</button>
            <button className="pill-btn btn-cancel" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="entry-list">
        {incomes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            No income sources yet — add one above
          </div>
        ) : (
          incomes.map(e => (
            <React.Fragment key={e.id}>
              <div className="entry-row income-entry">
                <span className="entry-name">{e.name}</span>
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
                    title="Stop this monthly income after the current month"
                    onClick={() => onEndThisMonth(e.id, currentMonthKey)}>
                    Ends this month
                  </button>
                )}
              </div>
              {editing?.id === e.id && (
                <div className="add-form edit-form">
                  <div className="form-row">
                    <input className="fi" placeholder="Source name" value={editing.name}
                      onChange={ev => setEditing(ed => ed && ({ ...ed, name: ev.target.value }))} />
                    <input className="fi" type="number" placeholder="Amount" value={editing.amount}
                      onChange={ev => setEditing(ed => ed && ({ ...ed, amount: ev.target.value }))} min="0" />
                  </div>
                  <div className="toggle-row">
                    <label className={`tog-opt${editing.type === 'fixed' ? ' selected' : ''}`}>
                      <input type="radio" name={`itype-edit-${e.id}`} checked={editing.type === 'fixed'}
                        onChange={() => setEditing(ed => ed && ({ ...ed, type: 'fixed' }))} /> Fixed monthly
                    </label>
                    <label className={`tog-opt${editing.type === 'onetime' ? ' selected' : ''}`}>
                      <input type="radio" name={`itype-edit-${e.id}`} checked={editing.type === 'onetime'}
                        onChange={() => setEditing(ed => ed && ({ ...ed, type: 'onetime' }))} /> Variable / one-time
                    </label>
                  </div>
                  <div className="form-actions">
                    <button className="pill-btn btn-blue" onClick={handleEditSave}>Save changes</button>
                    <button className="pill-btn btn-cancel" onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
};
