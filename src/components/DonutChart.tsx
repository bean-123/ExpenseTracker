import { useRef, useEffect } from 'react';
import type { Category, ExpenseEntry } from '../types';

interface Props {
  expenses: ExpenseEntry[];
  categories: Category[];
  currency: string;
}

export const DonutChart: React.FC<Props> = ({ expenses, categories }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const catTotals: Record<string, number> = {};
  expenses.forEach(e => { catTotals[e.catId] = (catTotals[e.catId] ?? 0) + e.amount; });
  const activeCats = Object.keys(catTotals).filter(k => catTotals[k] > 0);
  const total = activeCats.reduce((a, k) => a + catTotals[k], 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const sz = 110, cx = 55, cy = 55, r = 42, inner = 26;
    ctx.clearRect(0, 0, sz, sz);

    if (!activeCats.length) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 14;
      ctx.stroke();
      return;
    }

    let angle = -Math.PI / 2;
    activeCats.forEach(k => {
      const cat = categories.find(c => c.id === k);
      const slice = (catTotals[k] / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = cat?.color ?? '#eee';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      angle += slice;
    });

    ctx.beginPath();
    ctx.arc(cx, cy, inner, 0, 2 * Math.PI);
    ctx.fillStyle = 'var(--surface-2, #fff)';
    ctx.fill();
  }, [expenses, categories]);

  return (
    <div className="chart-panel">
      <div className="panel-header">
        <span className="panel-title">📊 Spending by category</span>
      </div>
      <div className="chart-wrap">
        <canvas ref={canvasRef} width={110} height={110} />
        <div className="chart-legend">
          {activeCats.length === 0 ? (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Add expenses to see the breakdown
            </span>
          ) : (
            activeCats.slice(0, 6).map(k => {
              const cat = categories.find(c => c.id === k);
              const pct = Math.round((catTotals[k] / total) * 100);
              return (
                <div key={k} className="legend-item">
                  <div className="legend-dot" style={{ background: cat?.color }} />
                  <span>{cat?.icon} {cat?.name}</span>
                  <span className="legend-pct">{pct}%</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
