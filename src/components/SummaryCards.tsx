import React from 'react';
import { calcHealthScore, fmt } from '../utils/helpers';

interface Props {
  totalIn: number;
  totalEx: number;
  left: number;
  incomeCount: number;
  expenseCount: number;
  currency: string;
}

export const SummaryCards: React.FC<Props> = ({
  totalIn, totalEx, left, incomeCount, expenseCount, currency,
}) => {
  const pct = totalIn > 0 ? Math.round((left / totalIn) * 100) : 0;
  const health = calcHealthScore(left, totalIn);

  return (
    <div className="summary-cards">
      <div className="scard sc-blue">
        <div className="scard-label">Total income</div>
        <div className="scard-amount">{fmt(totalIn, currency)}</div>
        <div className="scard-sub">{incomeCount} source{incomeCount !== 1 ? 's' : ''}</div>
      </div>
      <div className="scard sc-pink">
        <div className="scard-label">Total expenses</div>
        <div className="scard-amount">{fmt(totalEx, currency)}</div>
        <div className="scard-sub">{expenseCount} item{expenseCount !== 1 ? 's' : ''}</div>
      </div>
      <div className="scard sc-mint">
        <div className="scard-label">Left to save</div>
        <div className="scard-amount">{left < 0 ? '-' : ''}{fmt(left, currency)}</div>
        <div className="scard-sub">{pct}% of income</div>
      </div>
      <div className="scard sc-yellow">
        <div className="scard-label">Financial health</div>
        <div className={`health-badge ${health.cls}`}>{health.label}</div>
        <div className="scard-sub">{health.desc}</div>
      </div>
    </div>
  );
};
