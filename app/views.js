// HearthLedger views.
// One job: turn the stored state into the HTML of each page — dashboard,
// transactions, budgets, goals, bills and reports. Views never touch the
// network and never store anything; main.js owns routing and actions.

import {
  CATEGORIES, categoryById, monthIncome, monthLabel, monthSpending,
  monthTransactions, categorySpending, money, moneyShort,
} from "./data.js";
import { donutChart, barList, monthBars, sparkline } from "./charts.js";

export function esc(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function monthOptions(state) {
  return state.months
    .map((m) => `<option value="${m}"${m === state.month ? " selected" : ""}>${monthLabel(m)}</option>`)
    .join("");
}

function monthSwitcher(state) {
  return `<label class="month-switch">Month ` +
    `<select id="month-select" data-action="change-month">${monthOptions(state)}</select></label>`;
}

function statCard(label, value, sub) {
  return `<div class="stat"><span class="stat-label">${label}</span>` +
    `<span class="stat-value">${value}</span><span class="stat-sub">${sub}</span></div>`;
}

function txRow(t) {
  const cat = categoryById(t.category);
  const cls = t.amount < 0 ? "spend" : "income";
  return `<tr><td>${esc(t.date.slice(5))}</td><td>${esc(t.payee)}` +
    `<span class="tx-note">${esc(t.note)}</span></td>` +
    `<td><span class="chip" style="--chip:${cat.color}">${cat.label}</span></td>` +
    `<td class="amount ${cls}">${money(t.amount)}</td>` +
    `<td><button class="mini" data-action="delete-tx" data-id="${t.id}" aria-label="Delete ${esc(t.payee)}">Delete</button></td></tr>`;
}

export function dashboardView(state) {
  const month = state.month;
  const income = monthIncome(state, month);
  const spending = monthSpending(state, month);
  const saved = income - spending;
  const rate = income > 0 ? Math.round((saved / income) * 100) : 0;
  const txs = monthTransactions(state, month).filter((t) => t.amount < 0);
  const byCat = CATEGORIES.filter((c) => c.id !== "income" && c.id !== "savings")
    .map((c) => ({ label: c.label, value: categorySpending(state, month, c.id), color: c.color }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);
  const recent = [...monthTransactions(state, month)]
    .sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8);
  const upcoming = state.bills.filter((b) => !b.paid);
  const days = Array.from({ length: 25 }, (_, i) => {
    const day = String(i + 1).padStart(2, "0");
    return txs.filter((t) => t.date.endsWith("-" + day) && t.category !== "housing")
      .reduce((sum, t) => sum + -t.amount, 0);
  });
  const topGoal = [...state.goals].sort((a, b) => b.saved / b.target - a.saved / a.target)[0];
  return `<section class="page-head"><div><h1>Good evening, Alvarez household</h1>` +
    `<p class="lede">November is ${rate}% saved so far. Here is where the money stands tonight.</p></div>` +
    monthSwitcher(state) + `</section>` +
    `<section class="stats">` +
    statCard("Income in " + monthLabel(month), money(income), "Maya + Daniel + tutoring") +
    statCard("Spent so far", money(spending), "Across " + txs.length + " purchases") +
    statCard("Left to save", money(saved), "Savings rate " + rate + "%") +
    statCard("Top goal: " + esc(topGoal.name), moneyShort(topGoal.saved) + " of " + moneyShort(topGoal.target), Math.round((topGoal.saved / topGoal.target) * 100) + "% there") +
    `</section>` +
    `<section class="grid-two"><div class="card"><h2>Where November went</h2>` +
    `<div class="donut">` + donutChart(byCat) + `</div>` +
    `<ul class="legend">` + byCat.slice(0, 6).map((c) =>
      `<li><span class="dot" style="background:${c.color}"></span>${c.label} — ${money(c.value)}</li>`).join("") +
    `</ul><p><a href="#/budgets">See every budget &rarr;</a></p></div>` +
    `<div class="card"><h2>Daily spending</h2>` + sparkline(days) +
    `<p class="muted">Each point is one day of November, rent aside. Peaks are the weekly shop.</p>` +
    `<h2>Coming up</h2><ul class="plain">` + (upcoming.length ? upcoming.map((b) =>
      `<li><strong>${esc(b.name)}</strong> — ${money(b.amount)} due on the ${b.day}th ` +
      `<button class="mini" data-action="pay-bill" data-id="${b.id}">Mark paid</button></li>`).join("") :
      `<li>Every bill this month is paid. Nice work.</li>`) +
    `</ul></div></section>` +
    `<section class="card"><h2>Latest spending</h2>` +
    `<table><thead><tr><th>Date</th><th>What</th><th>Category</th><th>Amount</th><th></th></tr></thead><tbody>` +
    recent.map(txRow).join("") + `</tbody></table>` +
    `<p><a href="#/transactions">All November transactions &rarr;</a></p></section>`;
}

export function transactionsView(state, query) {
  const month = state.month;
  let txs = [...monthTransactions(state, month)].sort((a, b) => (a.date < b.date ? 1 : -1));
  const q = (query.get("q") || "").trim().toLowerCase();
  const cat = query.get("cat") || "";
  if (q) txs = txs.filter((t) => (t.payee + " " + t.note).toLowerCase().includes(q));
  if (cat) txs = txs.filter((t) => t.category === cat);
  const spent = txs.filter((t) => t.amount < 0).reduce((s, t) => s + -t.amount, 0);
  const earned = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  return `<section class="page-head"><div><h1>Transactions</h1>` +
    `<p class="lede">Every dollar in and out for ${monthLabel(month)}. ${txs.length} shown — ` +
    `${money(spent)} out, ${money(earned)} in.</p></div>` + monthSwitcher(state) + `</section>` +
    `<section class="card"><form id="add-tx" class="add-form">` +
    `<h2>Add a transaction</h2><div class="form-grid">` +
    `<label>Date <input type="date" name="date" value="${month}-25" required></label>` +
    `<label>What <input type="text" name="payee" placeholder="GreenMart weekly shop" required></label>` +
    `<label>Category <select name="category">` +
    CATEGORIES.map((c) => `<option value="${c.id}">${c.label}</option>`).join("") + `</select></label>` +
    `<label>Amount ($) <input type="number" name="amount" step="0.01" placeholder="-42.50" required></label>` +
    `<label>Note <input type="text" name="note" placeholder="Optional note"></label>` +
    `</div><p class="muted">Use a negative amount for spending, positive for money coming in.</p>` +
    `<button type="submit">Add transaction</button></form></section>` +
    `<section class="card"><form id="filter" class="filter-row">` +
    `<label>Search <input type="search" name="q" value="${esc(query.get("q") || "")}" placeholder="Shop, bill, note…"></label>` +
    `<label>Category <select name="cat"><option value="">All categories</option>` +
    CATEGORIES.map((c) => `<option value="${c.id}"${c.id === cat ? " selected" : ""}>${c.label}</option>`).join("") +
    `</select></label><button type="submit">Filter</button> ` +
    `<button type="button" data-action="export-csv">Download CSV</button></form>` +
    `<table><thead><tr><th>Date</th><th>What</th><th>Category</th><th>Amount</th><th></th></tr></thead><tbody>` +
    (txs.length ? txs.map(txRow).join("") :
      `<tr><td colspan="5">Nothing matches. Clear the search to see the whole month.</td></tr>`) +
    `</tbody></table></section>`;
}

export function budgetsView(state) {
  const month = state.month;
  const rows = CATEGORIES.filter((c) => c.id !== "income" && c.id !== "savings").map((c) => {
    const spent = categorySpending(state, month, c.id);
    const budget = state.budgets[c.id] || 0;
    const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
    const left = budget - spent;
    return { c, spent, budget, pct, left };
  });
  const totalBudget = rows.reduce((s, r) => s + r.budget, 0);
  const totalSpent = rows.reduce((s, r) => s + r.spent, 0);
  return `<section class="page-head"><div><h1>Budgets</h1>` +
    `<p class="lede">The plan for ${monthLabel(month)} is ${money(totalBudget)}; ` +
    `${money(totalSpent)} is spent. Tap a budget to change it.</p></div>` +
    monthSwitcher(state) + `</section>` +
    `<section class="budget-grid">` + rows.map((r) => {
      const bar = Math.min(100, r.pct);
      const status = r.pct > 100 ? "over" : r.pct > 85 ? "close" : "ok";
      return `<article class="budget-card ${status}"><h2>${r.c.label}</h2>` +
        `<p class="big">${money(r.spent)} <span class="muted">of ${money(r.budget)}</span></p>` +
        `<div class="meter"><span style="width:${bar}%;background:${r.c.color}"></span></div>` +
        `<p>${r.pct}% used — ${r.left >= 0 ? money(r.left) + " left" : money(-r.left) + " over"}</p>` +
        `<form class="budget-edit" data-category="${r.c.id}">` +
        `<label>Monthly budget ($) <input type="number" name="budget" min="0" step="1" value="${r.budget}" required></label>` +
        `<button type="submit">Save</button></form></article>`;
    }).join("") + `</section>`;
}

export function goalsView(state) {
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  return `<section class="page-head"><div><h1>Savings goals</h1>` +
    `<p class="lede">${money(totalSaved)} saved toward ${money(totalTarget)} of goals. ` +
    `Small, steady transfers beat grand plans.</p></div></section>` +
    `<section class="goal-grid">` + state.goals.map((g) => {
      const pct = Math.round((g.saved / g.target) * 100);
      return `<article class="card goal-card"><h2>${esc(g.name)}</h2>` +
        `<p class="muted">${esc(g.note)}</p>` +
        `<p class="big">${money(g.saved)} <span class="muted">of ${money(g.target)}</span></p>` +
        `<div class="meter"><span style="width:${Math.min(100, pct)}%"></span></div>` +
        `<p>${pct}% there — ${money(g.target - g.saved)} to go</p>` +
        `<form class="goal-add" data-goal="${g.id}">` +
        `<label>Add ($) <input type="number" name="amount" min="1" step="1" placeholder="50" required></label>` +
        `<button type="submit">Add to goal</button></form></article>`;
    }).join("") + `</section>` +
    `<section class="card"><h2>How the goals are funded</h2>` +
    `<p>Every month the household moves ${money(state.budgets.savings || 0)} into savings on payday, ` +
    `then splits it: emergency fund first, then the holiday, the car and the education pot. ` +
    `The dashboard's “Left to save” is what is still unassigned.</p></section>`;
}

export function billsView(state) {
  const paid = state.bills.filter((b) => b.paid);
  const unpaid = state.bills.filter((b) => !b.paid);
  const paidTotal = paid.reduce((s, b) => s + b.amount, 0);
  const unpaidTotal = unpaid.reduce((s, b) => s + b.amount, 0);
  const row = (b) => `<tr><td>${esc(b.name)}</td><td class="amount">${money(b.amount)}</td>` +
    `<td>Day ${b.day}</td><td>${b.paid ? "Paid" : "Due"}</td>` +
    `<td>${b.paid
      ? `<button class="mini" data-action="unpay-bill" data-id="${b.id}">Undo</button>`
      : `<button class="mini" data-action="pay-bill" data-id="${b.id}">Mark paid</button>`}</td></tr>`;
  return `<section class="page-head"><div><h1>Bills</h1>` +
    `<p class="lede">The fixed bills of ${monthLabel(state.month)}: ${money(paidTotal)} paid, ` +
    `${money(unpaidTotal)} still to go.</p></div></section>` +
    `<section class="card"><table><thead><tr><th>Bill</th><th>Amount</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody>` +
    [...state.bills].sort((a, b) => a.day - b.day).map(row).join("") +
    `</tbody></table><p class="muted">Paying a bill here only marks it in this household's book. ` +
    `It never moves real money — the bank still needs the actual payment.</p></section>`;
}

export function reportsView(state) {
  const months = state.months.map((m) => ({
    label: monthLabel(m).slice(0, 3),
    income: monthIncome(state, m),
    spending: monthSpending(state, m),
  }));
  const month = state.month;
  const byCat = CATEGORIES.filter((c) => c.id !== "income" && c.id !== "savings")
    .map((c) => ({ label: c.label, value: categorySpending(state, month, c.id), color: c.color }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);
  const top = byCat[0] || { label: "—", value: 0 };
  const txs = monthTransactions(state, month).filter((t) => t.amount < 0);
  const biggest = [...txs].sort((a, b) => a.amount - b.amount)[0];
  const avgDay = txs.length ? txs.reduce((s, t) => s + -t.amount, 0) / 25 : 0;
  const maxBar = Math.max(...byCat.map((c) => c.value), 1);
  return `<section class="page-head"><div><h1>Reports</h1>` +
    `<p class="lede">The story of ${monthLabel(month)} in numbers: where it went, ` +
    `what it cost most, and how it compares with last month.</p></div>` +
    monthSwitcher(state) + `</section>` +
    `<section class="grid-two"><div class="card"><h2>Income vs spending</h2>` +
    monthBars(months) +
    `<p class="muted">Green is money in, orange is money out. November is still being written.</p></div>` +
    `<div class="card"><h2>Biggest single cost</h2>` +
    (biggest ? `<p class="big">${money(-biggest.amount)}</p><p>${esc(biggest.payee)} — ${esc(biggest.date)}</p>` : `<p>No spending yet.</p>`) +
    `<h2>Everyday pace</h2><p class="big">${money(avgDay)}</p><p>Average spending a day in November.</p>` +
    `<h2>Top category</h2><p class="big">${esc(top.label)}</p><p>${money(top.value)} this month.</p></div></section>` +
    `<section class="card"><h2>Spending by category</h2>` +
    barList(byCat.map((c) => ({ ...c, max: maxBar, note: money(c.value) }))) +
    `<p class="muted">Bars are scaled to the biggest category, ${esc(top.label)}.</p></section>`;
}
