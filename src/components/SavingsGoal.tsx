import React from 'react';
import { fmt } from '../utils/helpers';

interface Props {
  goal: number;
  left: number;
  currency: string;
  onChange: (val: number) => void;
}

export const SavingsGoal: React.FC<Props> = ({ goal, left, currency, onChange }) => {
  const prog = goal > 0 ? Math.min(100, Math.max(0, Math.round((left / goal) * 100))) : 0;
  const fillColor = prog >= 100 ? '#0d6635' : prog >= 50 ? '#2a9d6e' : '#e8a020';

  return (
    <div className="goal-panel">
      <div className="panel-header">
        <span className="panel-title" style={{ color: '#1a7a50' }}>🎯 Savings goal</span>
      </div>
      <input
        className="goal-input"
        type="number"
        placeholder="Set a monthly target..."
        min="0"
        value={goal || ''}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
      />
      <div className="prog-track">
        <div className="prog-fill" style={{ width: `${prog}%`, background: fillColor }} />
      </div>
      <div className="prog-label">
        {goal > 0
          ? `${fmt(Math.max(0, left), currency)} of ${fmt(goal, currency)} goal — ${prog}%`
          : 'Set a goal to see your progress'}
      </div>
    </div>
  );
};
