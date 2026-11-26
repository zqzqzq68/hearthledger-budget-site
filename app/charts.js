// HearthLedger charts.
// One job: turn numbers into small inline SVG pictures — a donut, a set of
// horizontal bars and a set of vertical bars — with no library and no
// network. Every function returns an SVG string the views drop into a page.

function polar(cx, cy, radius, angleDeg) {
  const angle = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

function arcPath(cx, cy, radius, startAngle, endAngle) {
  const [sx, sy] = polar(cx, cy, radius, startAngle);
  const [ex, ey] = polar(cx, cy, radius, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${radius} ${radius} 0 ${large} 1 ${ex.toFixed(1)} ${ey.toFixed(1)}`;
}

// A donut of category shares. slices: [{label, value, color}].
export function donutChart(slices, size = 220, thickness = 34) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - thickness) / 2;
  if (total <= 0) {
    return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="No spending yet">` +
      `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#e6e2d8" stroke-width="${thickness}"/>` +
      `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="15" fill="#6b655a">No spending yet</text></svg>`;
  }
  let angle = 0;
  let paths = "";
  for (const slice of slices) {
    const share = slice.value / total;
    const start = angle;
    const end = angle + share * 360;
    // A hairline gap keeps neighbouring slices readable.
    const gap = share >= 1 ? 0 : 1.2;
    paths += `<path d="${arcPath(cx, cy, radius, start + gap / 2, end - gap / 2)}" fill="none" stroke="${slice.color}" stroke-width="${thickness}"/>`;
    angle = end;
  }
  const top = slices[0];
  return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Spending by category">` +
    paths +
    `<text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="13" fill="#6b655a">${top.label}</text>` +
    `<text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="17" font-weight="700" fill="#2b2b26">${Math.round((top.value / total) * 100)}%</text></svg>`;
}

// Horizontal bars: rows: [{label, value, max, color, note}].
export function barList(rows, width = 520) {
  const labelWidth = 132;
  const barMax = width - labelWidth - 96;
  let out = `<svg viewBox="0 0 ${width} ${rows.length * 34 + 6}" role="img" aria-label="Category spending bars">`;
  rows.forEach((row, i) => {
    const y = i * 34 + 6;
    const barWidth = Math.max(2, (row.value / row.max) * barMax);
    const over = row.value > row.max;
    out += `<text x="0" y="${y + 15}" font-size="13" fill="#3a382f">${row.label}</text>` +
      `<rect x="${labelWidth}" y="${y + 4}" width="${barWidth}" height="14" rx="4" fill="${row.color}"/>` +
      `<text x="${labelWidth + barWidth + 8}" y="${y + 15}" font-size="12" fill="${over ? "#b3402e" : "#6b655a"}">${row.note}</text>`;
  });
  return out + "</svg>";
}

// Vertical month bars: months: [{label, income, spending}].
export function monthBars(months, width = 560, height = 220) {
  const top = 18;
  const bottom = height - 26;
  const maxValue = Math.max(...months.flatMap((m) => [m.income, m.spending]), 1);
  const slot = width / months.length;
  const barWidth = Math.min(30, slot / 3);
  let out = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Income and spending by month">`;
  months.forEach((m, i) => {
    const cx = slot * i + slot / 2;
    const incomeH = ((bottom - top) * m.income) / maxValue;
    const spendH = ((bottom - top) * m.spending) / maxValue;
    out += `<rect x="${(cx - barWidth - 3).toFixed(1)}" y="${(bottom - incomeH).toFixed(1)}" width="${barWidth}" height="${incomeH.toFixed(1)}" rx="3" fill="#2f6f5e"/>` +
      `<rect x="${(cx + 3).toFixed(1)}" y="${(bottom - spendH).toFixed(1)}" width="${barWidth}" height="${spendH.toFixed(1)}" rx="3" fill="#c96a4a"/>` +
      `<text x="${cx.toFixed(1)}" y="${height - 8}" text-anchor="middle" font-size="12" fill="#6b655a">${m.label}</text>`;
  });
  out += `<text x="0" y="12" font-size="12" fill="#2f6f5e">\u25a0 Income</text>` +
    `<text x="78" y="12" font-size="12" fill="#c96a4a">\u25a0 Spending</text>`;
  return out + "</svg>";
}

// A thin sparkline of daily spending across one month.
export function sparkline(values, width = 560, height = 64) {
  if (values.length < 2) return "";
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1);
  const points = values.map((v, i) => `${(i * step).toFixed(1)},${(height - 6 - ((height - 12) * v) / max).toFixed(1)}`).join(" ");
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Daily spending trend" preserveAspectRatio="none">` +
    `<polyline points="${points}" fill="none" stroke="#2f6f5e" stroke-width="2"/>` +
    `<line x1="0" y1="${height - 1}" x2="${width}" y2="${height - 1}" stroke="#e6e2d8" stroke-width="1"/></svg>`;
}
