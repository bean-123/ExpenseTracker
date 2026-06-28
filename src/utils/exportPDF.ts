import { MonthData, Category } from '../types';
import { COLOR_DARK } from './constants';
import { fmt, getMonthLabel } from './helpers';

export async function exportToPDF(
  monthKey: string,
  monthData: MonthData,
  categories: Category[],
  currency: string,
): Promise<void> {
  // @ts-ignore – jsPDF loaded from CDN via index.html
  const { jsPDF } = (window as any).jspdf;
  if (!jsPDF) {
    alert('PDF export is not available — make sure jsPDF is loaded.');
    return;
  }

  const doc = new jsPDF();
  const monthLabel = getMonthLabel(monthKey);
  const totalIn  = monthData.incomes.reduce((a, e) => a + e.amount, 0);
  const totalEx  = monthData.expenses.reduce((a, e) => a + e.amount, 0);
  const left     = totalIn - totalEx;
  const pct      = totalIn > 0 ? Math.round((left / totalIn) * 100) : 0;

  let y = 20;

  // Header
  doc.setFillColor(255, 214, 224);
  doc.roundedRect(10, 10, 190, 18, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(181, 71, 106);
  doc.text(`Monthly Budget — ${monthLabel}`, 105, 21, { align: 'center' });
  y = 38;

  // Summary cards
  const cards = [
    { label: 'Total income',   val: fmt(totalIn, currency), r: 197, g: 232, b: 247, tr: 42,  tg: 127, tb: 168 },
    { label: 'Total expenses', val: fmt(totalEx, currency), r: 255, g: 214, b: 224, tr: 181, tg: 71,  tb: 106 },
    { label: 'Left to save',   val: fmt(left,    currency), r: 200, g: 245, b: 225, tr: 26,  tg: 122, tb: 80  },
  ];
  cards.forEach((c, i) => {
    const x = 10 + i * 65;
    doc.setFillColor(c.r, c.g, c.b);
    doc.roundedRect(x, y, 60, 22, 3, 3, 'F');
    doc.setFontSize(9); doc.setTextColor(c.tr, c.tg, c.tb);
    doc.text(c.label, x + 30, y + 7, { align: 'center' });
    doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text(c.val, x + 30, y + 16, { align: 'center' });
  });
  y += 32;

  // Income
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(42, 127, 168);
  doc.text('Income sources', 14, y); y += 7;
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  if (monthData.incomes.length === 0) {
    doc.setTextColor(150, 150, 150); doc.text('No income entries', 16, y); y += 6;
  } else {
    monthData.incomes.forEach(e => {
      doc.setTextColor(60, 60, 60);
      doc.text(`${e.type === 'fixed' ? '[Fixed] ' : '[One-time] '}${e.name}`, 16, y);
      doc.text(fmt(e.amount, currency), 196, y, { align: 'right' });
      y += 6;
    });
  }
  y += 4;

  // Expenses grouped by category
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(181, 71, 106);
  doc.text('Expenses', 14, y); y += 7;
  doc.setFontSize(9);
  if (monthData.expenses.length === 0) {
    doc.setTextColor(150, 150, 150); doc.text('No expense entries', 16, y); y += 6;
  } else {
    monthData.expenses.forEach(e => {
      const cat = categories.find(c => c.id === e.catId) ?? { name: 'Other', icon: '📦' };
      doc.setTextColor(60, 60, 60);
      doc.text(
        `${e.type === 'fixed' ? '[Fixed] ' : '[One-time] '}${e.name} (${cat.name})`,
        16, y,
      );
      doc.text(fmt(e.amount, currency), 196, y, { align: 'right' });
      y += 6;
    });
  }
  y += 4;

  // Savings goal
  if (monthData.savingsGoal > 0) {
    const prog = Math.min(100, Math.max(0, Math.round((left / monthData.savingsGoal) * 100)));
    doc.setFillColor(200, 245, 225);
    doc.roundedRect(10, y, 190, 14, 3, 3, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(26, 122, 80);
    doc.text(
      `Savings goal: ${fmt(monthData.savingsGoal, currency)} — Progress: ${Math.max(0, prog)}% (${fmt(Math.max(0, left), currency)} saved)`,
      105, y + 9, { align: 'center' },
    );
    y += 20;
  }

  // Health score
  doc.setFillColor(255, 243, 176);
  doc.roundedRect(10, y, 190, 12, 3, 3, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(154, 124, 0);
  const status = left < 0 ? 'Overspending' : pct < 20 ? 'Watch it' : 'Healthy';
  doc.text(
    `Financial health: ${status} — Saving ${Math.max(0, pct)}% of income`,
    105, y + 8, { align: 'center' },
  );

  doc.save(`budget-${monthLabel.replace(' ', '-')}.pdf`);
}
