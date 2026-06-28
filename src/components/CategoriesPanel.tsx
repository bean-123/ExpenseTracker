import React, { useState } from 'react';
import { Category, ExpenseEntry } from '../types';
import { EMOJIS, PALETTE_COLORS, COLOR_DARK } from '../utils/constants';
import { fmt } from '../utils/helpers';

interface Props {
  categories: Category[];
  expenses: ExpenseEntry[];
  currency: string;
  onAdd: (name: string, icon: string, color: string) => void;
  onDelete: (id: string) => void;
}

export const CategoriesPanel: React.FC<Props> = ({
  categories, expenses, currency, onAdd, onDelete,
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(EMOJIS[0]);
  const [color, setColor] = useState(PALETTE_COLORS[0]);

  const catTotals: Record<string, number> = {};
  expenses.forEach(e => { catTotals[e.catId] = (catTotals[e.catId] ?? 0) + e.amount; });
  const totalEx = Object.values(catTotals).reduce((a, b) => a + b, 0) || 1;

  const handleSave = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), icon, color);
    setName(''); setIcon(EMOJIS[0]); setColor(PALETTE_COLORS[0]); setOpen(false);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">🏷️ Your categories</span>
        <button className="pill-btn btn-lavender" onClick={() => setOpen(o => !o)}>
          + New category
        </button>
      </div>

      {open && (
        <div className="add-form" style={{ marginBottom: 14 }}>
          <input className="fi" placeholder="Category name" value={name}
            onChange={e => setName(e.target.value)} />

          <div className="picker-label">Choose an icon</div>
          <div className="emoji-row">
            {EMOJIS.map(e => (
              <button key={e} type="button"
                className={`emoji-opt${e === icon ? ' sel' : ''}`}
                onClick={() => setIcon(e)}>{e}</button>
            ))}
          </div>

          <div className="picker-label">Choose a color</div>
          <div className="color-row">
            {PALETTE_COLORS.map(c => (
              <button key={c} type="button" aria-label={`Color ${c}`}
                className={`color-dot${c === color ? ' sel' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)} />
            ))}
          </div>

          <div className="form-actions">
            <button className="pill-btn btn-lavender" onClick={handleSave}>Create category</button>
            <button className="pill-btn btn-cancel" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="cat-grid">
        {categories.map(c => {
          const amt = catTotals[c.id] ?? 0;
          const pct = Math.round((amt / totalEx) * 100);
          const dark = COLOR_DARK[c.color] ?? '#333';
          return (
            <div key={c.id} className="cat-card" style={{ background: c.color }}>
              {!c.builtIn && (
                <button className="cat-del" onClick={() => onDelete(c.id)}
                  aria-label={`Delete ${c.name}`}>✕</button>
              )}
              <div className="cat-card-header">
                <div className="cat-icon" style={{ background: 'rgba(255,255,255,.4)' }}>{c.icon}</div>
                <span className="cat-name" style={{ color: dark }}>{c.name}</span>
              </div>
              <div className="cat-total" style={{ color: dark }}>
                {amt > 0 ? fmt(amt, currency) : '—'}
              </div>
              <div className="cat-sub" style={{ color: dark }}>
                {amt > 0 ? `${pct}% of spending` : 'No expenses'}
              </div>
              {amt > 0 && (
                <div className="cat-bar-track">
                  <div className="cat-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
