import React, { useState } from 'react';
import type { IncomeEntry, EntryType } from '../types';
import { fmt } from '../utils/helpers';

interface Props {
  incomes: IncomeEntry[];
  currency: string;
  onAdd: (name: string, amount: number, type: EntryType) => void;
  onDelete: (id: number) => void;
}

export const IncomePanel: React.FC<Props> = ({ incomes, currency, onAdd, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<EntryType>('fixed');

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;
    onAdd(name.trim(), amt, type);
    setName(''); setAmount(''); setType('fixed'); setOpen(false);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">💸 Income sources</span>
        <button className="pill-btn btn-blue" onClick={() => setOpen(o => !o)}>
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
              <input type="radio" name="itype" checked={type === 'fixed'}
                onChange={() => setType('fixed')} /> Fixed monthly
            </label>
            <label className={`tog-opt${type === 'onetime' ? ' selected' : ''}`}>
              <input type="radio" name="itype" checked={type === 'onetime'}
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
            <div key={e.id} className="entry-row income-entry">
              <span className="entry-name">{e.name}</span>
              <span className={`pill ${e.type === 'fixed' ? 'pill-fixed' : 'pill-onetime'}`}>
                {e.type === 'fixed' ? 'Monthly' : 'One-time'}
              </span>
              <span className="entry-amount">{fmt(e.amount, currency)}</span>
              <button className="del-btn" onClick={() => onDelete(e.id)}
                aria-label={`Remove ${e.name}`}>🗑</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
