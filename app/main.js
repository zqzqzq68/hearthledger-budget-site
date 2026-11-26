// HearthLedger application shell.
// One job: route between pages, wire every control to the store, and keep
// the page in sync after each change. No network, no frameworks.

import { loadState, saveState, resetState } from "./data.js";
import {
  dashboardView, transactionsView, budgetsView,
  goalsView, billsView, reportsView,
} from "./views.js";

const ROUTES = {
  "/": { title: "Dashboard", render: dashboardView },
  "/transactions": { title: "Transactions", render: (s) => transactionsView(s, currentQuery()) },
  "/budgets": { title: "Budgets", render: budgetsView },
  "/goals": { title: "Savings goals", render: goalsView },
  "/bills": { title: "Bills", render: billsView },
  "/reports": { title: "Reports", render: reportsView },
};

let state = loadState();

function currentQuery() {
  const hash = location.hash.slice(1);
  const qIndex = hash.indexOf("?");
  return new URLSearchParams(qIndex === -1 ? "" : hash.slice(qIndex + 1));
}

function currentPath() {
  const hash = location.hash.slice(1);
  const qIndex = hash.indexOf("?");
  const path = qIndex === -1 ? hash : hash.slice(0, qIndex);
  return path === "" ? "/" : path;
}

function render() {
  const path = currentPath();
  const route = ROUTES[path] || ROUTES["/"];
  document.title = route.title + " — HearthLedger";
  document.getElementById("page").innerHTML = route.render(state);
  document.querySelectorAll(".nav a").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === "#" + path);
  });
  const note = document.getElementById("saved-note");
  if (note) note.textContent = "";
}

function toast(message) {
  const note = document.getElementById("saved-note");
  if (note) note.textContent = message;
}

function csvCell(value) {
  const text = String(value).replaceAll('"', '""');
  return /[",\n]/.test(text) ? '"' + text + '"' : text;
}

function exportCsv() {
  const rows = [["date", "payee", "category", "amount", "note"]];
  for (const t of state.transactions) {
    rows.push([t.date, t.payee, t.category, t.amount.toFixed(2), t.note]);
  }
  const csv = rows.map((r) => r.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "hearthledger-transactions.csv";
  link.click();
  URL.revokeObjectURL(url);
  toast("CSV downloaded.");
}

function addTransaction(form) {
  const data = new FormData(form);
  const amount = Number(data.get("amount"));
  if (!Number.isFinite(amount) || amount === 0) {
    toast("Enter an amount that is not zero.");
    return;
  }
  state.transactions.push({
    id: "t" + (state.nextId++),
    date: String(data.get("date")),
    payee: String(data.get("payee")).trim(),
    category: String(data.get("category")),
    amount,
    note: String(data.get("note") || "").trim(),
  });
  saveState(state);
  render();
  toast("Transaction added.");
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter((t) => t.id !== id);
  saveState(state);
  render();
  toast("Transaction deleted.");
}

function saveBudget(form, categoryId) {
  const value = Number(new FormData(form).get("budget"));
  if (!Number.isFinite(value) || value < 0) {
    toast("Enter a budget of $0 or more.");
    return;
  }
  state.budgets[categoryId] = value;
  saveState(state);
  render();
  toast("Budget saved.");
}

function addToGoal(form, goalId) {
  const value = Number(new FormData(form).get("amount"));
  if (!Number.isFinite(value) || value <= 0) {
    toast("Enter an amount above $0.");
    return;
  }
  const goal = state.goals.find((g) => g.id === goalId);
  if (!goal) return;
  goal.saved += value;
  saveState(state);
  render();
  toast("Added " + value.toLocaleString("en-US", { style: "currency", currency: "USD" }) + " to " + goal.name + ".");
}

function setBillPaid(id, paid) {
  const bill = state.bills.find((b) => b.id === id);
  if (!bill) return;
  bill.paid = paid;
  saveState(state);
  render();
  toast(bill.name + (paid ? " marked paid." : " marked unpaid."));
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.getAttribute("data-action");
  const id = button.getAttribute("data-id");
  if (action === "delete-tx") deleteTransaction(id);
  if (action === "pay-bill") setBillPaid(id, true);
  if (action === "unpay-bill") setBillPaid(id, false);
  if (action === "export-csv") exportCsv();
  if (action === "reset-data") {
    state = resetState();
    render();
    toast("Sample data restored.");
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (form.id === "add-tx") {
    event.preventDefault();
    addTransaction(form);
  } else if (form.classList.contains("budget-edit")) {
    event.preventDefault();
    saveBudget(form, form.getAttribute("data-category"));
  } else if (form.classList.contains("goal-add")) {
    event.preventDefault();
    addToGoal(form, form.getAttribute("data-goal"));
  } else if (form.id === "filter") {
    event.preventDefault();
    const data = new FormData(form);
    const params = new URLSearchParams();
    const q = String(data.get("q") || "").trim();
    const cat = String(data.get("cat") || "");
    if (q) params.set("q", q);
    if (cat) params.set("cat", cat);
    location.hash = "#/transactions" + (params.toString() ? "?" + params : "");
  }
});

document.addEventListener("change", (event) => {
  const select = event.target.closest("[data-action='change-month']");
  if (!select) return;
  state.month = select.value;
  saveState(state);
  render();
});

window.addEventListener("hashchange", render);
render();
