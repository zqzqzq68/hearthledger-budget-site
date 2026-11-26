// HearthLedger seed data and store.
// One job: hold the household's budget facts and persist every change
// the household makes, in the browser's own local storage.

export const HOUSEHOLD = {
  name: "Alvarez household",
  members: ["Maya", "Daniel", "Sofia (9)", "Leo (6)"],
  currency: "USD",
  months: ["2026-10", "2026-11"],
  currentMonth: "2026-11",
};

export const CATEGORIES = [
  { id: "housing", label: "Housing", color: "#2f6f5e", budget: 1850 },
  { id: "groceries", label: "Groceries", color: "#4d9b6a", budget: 1100 },
  { id: "utilities", label: "Utilities", color: "#d9a441", budget: 400 },
  { id: "transport", label: "Transport", color: "#4a7fb5", budget: 380 },
  { id: "dining", label: "Dining out", color: "#c96a4a", budget: 220 },
  { id: "kids", label: "Kids & school", color: "#8a6fc0", budget: 340 },
  { id: "health", label: "Health", color: "#c04a7a", budget: 280 },
  { id: "fun", label: "Fun & treats", color: "#c9a24a", budget: 150 },
  { id: "clothing", label: "Clothing", color: "#6a8a9b", budget: 180 },
  { id: "subscriptions", label: "Subscriptions", color: "#7a7a7a", budget: 96 },
  { id: "misc", label: "Everything else", color: "#9b9b9b", budget: 150 },
  { id: "savings", label: "Savings", color: "#2f6f5e", budget: 1500 },
  { id: "income", label: "Income", color: "#2f6f5e", budget: 0 },
];

export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 2];
}

const STORE_KEY = "hearthledger-v1";

function seedTransactions() {
  // [date, payee, category, amount, note] — amounts are dollars;
  // spending is negative, income is positive.
  const rows = [
    ["2026-11-01", "Maple Street rent", "housing", -1850, "Monthly rent, 3-bed flat"],
    ["2026-11-01", "Maya salary — Northside Clinic", "income", 4200, "Take-home pay"],
    ["2026-11-01", "Daniel salary — ParcelWorks", "income", 2450, "Take-home pay"],
    ["2026-11-02", "GreenMart weekly shop", "groceries", -148.2, "Fruit, veg, pantry"],
    ["2026-11-02", "City bus passes x2", "transport", -96, "Monthly passes"],
    ["2026-11-03", "BrightSmile dentist", "health", -85, "Sofia check-up"],
    ["2026-11-03", "Corner bakery", "dining", -18.5, "Saturday croissants"],
    ["2026-11-04", "GreenMart top-up", "groceries", -62.4, "Milk, bread, eggs"],
    ["2026-11-05", "FitLife gym", "subscriptions", -45, "Family membership"],
    ["2026-11-05", "Petrol — Shell Station", "transport", -52, "Daniel's car"],
    ["2026-11-06", "School lunch money", "kids", -60, "Sofia + Leo, two weeks"],
    ["2026-11-06", "Pizza Friday", "dining", -34.9, "Takeaway night"],
    ["2026-11-07", "Water bill — City Water", "utilities", -64, "October usage"],
    ["2026-11-07", "Bookshop — Leo birthday book", "fun", -22.5, "Dinosaur atlas"],
    ["2026-11-08", "GreenMart weekly shop", "groceries", -171.35, "Weekly shop"],
    ["2026-11-09", "Electric — BrightPower", "utilities", -132, "October usage"],
    ["2026-11-09", "Pharmacy — cold medicine", "health", -28.75, "Leo's cough"],
    ["2026-11-10", "Kids' shoes — StepRight", "clothing", -74, "Leo outgrew his"],
    ["2026-11-10", "Tutoring — Maya evening class", "income", 200, "Two sessions"],
    ["2026-11-11", "GreenMart top-up", "groceries", -58.9, "Midweek top-up"],
    ["2026-11-12", "Internet — FastNet", "utilities", -79, "Fibre 500"],
    ["2026-11-12", "Cinema — family film", "fun", -42, "Four tickets"],
    ["2026-11-13", "School trip — Sofia museum", "kids", -38, "Museum day"],
    ["2026-11-14", "GreenMart weekly shop", "groceries", -159.6, "Weekly shop"],
    ["2026-11-14", "Car wash + oil top-up", "transport", -31, "Daniel's car"],
    ["2026-11-15", "Phone — MobilePlus", "utilities", -112, "Two lines"],
    ["2026-11-15", "Lunch out — Noodle House", "dining", -46.2, "Sunday lunch"],
    ["2026-11-16", "GreenMart top-up", "groceries", -71.45, "Fruit and snacks"],
    ["2026-11-17", "Winter coats — KidZone", "clothing", -89, "Sofia + Leo"],
    ["2026-11-18", "Dentist — Daniel filling", "health", -120, "Check-up + filling"],
    ["2026-11-18", "Coffee with friends", "dining", -14.75, "Maya's catch-up"],
    ["2026-11-19", "GreenMart weekly shop", "groceries", -163.8, "Weekly shop"],
    ["2026-11-20", "After-school art club", "kids", -45, "Sofia, November"],
    ["2026-11-20", "Petrol — Shell Station", "transport", -48, "Daniel's car"],
    ["2026-11-21", "Streaming — StreamBox", "subscriptions", -15.99, "Monthly plan"],
    ["2026-11-21", "Music — TuneFlow", "subscriptions", -10.99, "Family plan"],
    ["2026-11-22", "GreenMart weekly shop", "groceries", -142.3, "Weekly shop"],
    ["2026-11-22", "Board game night snacks", "fun", -19.4, "Popcorn + juice"],
    ["2026-11-23", "School supplies", "kids", -52.6, "Notebooks, pens"],
    ["2026-11-23", "Bus fare top-up", "transport", -24, "Leo's card"],
    ["2026-11-24", "GreenMart top-up", "groceries", -66.2, "Thanksgiving prep"],
    ["2026-11-24", "Takeaway — Thai Garden", "dining", -38.5, "Busy Tuesday"],
    ["2026-11-25", "Pharmacy — vitamins", "health", -32.4, "Family vitamins"],
    ["2026-10-01", "Maple Street rent", "housing", -1850, "Monthly rent, 3-bed flat"],
    ["2026-10-01", "Maya salary — Northside Clinic", "income", 4200, "Take-home pay"],
    ["2026-10-01", "Daniel salary — ParcelWorks", "income", 2450, "Take-home pay"],
    ["2026-10-03", "GreenMart weekly shop", "groceries", -168.4, "Weekly shop"],
    ["2026-10-06", "Electric — BrightPower", "utilities", -118, "September usage"],
    ["2026-10-08", "School fees — term 1", "kids", -210, "After-school care"],
    ["2026-10-11", "GreenMart weekly shop", "groceries", -154.75, "Weekly shop"],
    ["2026-10-14", "Car service", "transport", -185, "Annual service"],
    ["2026-10-17", "GreenMart weekly shop", "groceries", -149.2, "Weekly shop"],
    ["2026-10-19", "Birthday party — Sofia", "fun", -96, "Cake + decorations"],
    ["2026-10-22", "Winter boots — Maya", "clothing", -110, "New boots"],
    ["2026-10-24", "GreenMart weekly shop", "groceries", -161.5, "Weekly shop"],
    ["2026-10-27", "Dentist — family check-ups", "health", -160, "Two check-ups"],
    ["2026-10-30", "Halloween treats", "fun", -28, "Pumpkin + sweets"],
  ];
  return rows.map((r, i) => ({
    id: "t" + (i + 1),
    date: r[0],
    payee: r[1],
    category: r[2],
    amount: r[3],
    note: r[4],
  }));
}

function seedState() {
  return {
    version: 1,
    month: HOUSEHOLD.currentMonth,
    months: HOUSEHOLD.months,
    transactions: seedTransactions(),
    budgets: Object.fromEntries(CATEGORIES.map((c) => [c.id, c.budget])),
    goals: [
      { id: "g1", name: "Emergency fund", target: 12000, saved: 8450, note: "Six months of essentials" },
      { id: "g2", name: "Family holiday — seaside", target: 3000, saved: 1875, note: "July, four of us" },
      { id: "g3", name: "New car deposit", target: 9000, saved: 2340, note: "Replace the 2014 hatchback" },
      { id: "g4", name: "Kids' education pot", target: 5000, saved: 1120, note: "Sofia + Leo, long term" },
    ],
    bills: [
      { id: "b1", name: "Maple Street rent", amount: 1850, day: 1, paid: true },
      { id: "b2", name: "FitLife gym", amount: 45, day: 5, paid: true },
      { id: "b3", name: "City Water", amount: 64, day: 7, paid: true },
      { id: "b4", name: "BrightPower electric", amount: 132, day: 9, paid: true },
      { id: "b5", name: "FastNet internet", amount: 79, day: 12, paid: true },
      { id: "b6", name: "MobilePlus phones", amount: 112, day: 15, paid: true },
      { id: "b7", name: "Home insurance", amount: 210, day: 28, paid: false },
    ],
    nextId: 1000,
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1 && Array.isArray(parsed.transactions)) return parsed;
    }
  } catch (err) {
    // A damaged store falls back to the seed data below.
  }
  const fresh = seedState();
  saveState(fresh);
  return fresh;
}

export function saveState(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

export function resetState() {
  const fresh = seedState();
  saveState(fresh);
  return fresh;
}

export function monthLabel(month) {
  const [year, m] = month.split("-").map(Number);
  const names = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  return names[m - 1] + " " + year;
}

export function monthTransactions(state, month) {
  return state.transactions.filter((t) => t.date.startsWith(month));
}

export function monthIncome(state, month) {
  return monthTransactions(state, month)
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function monthSpending(state, month) {
  return monthTransactions(state, month)
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + -t.amount, 0);
}

export function categorySpending(state, month, categoryId) {
  return monthTransactions(state, month)
    .filter((t) => t.category === categoryId && t.amount < 0)
    .reduce((sum, t) => sum + -t.amount, 0);
}

export function money(amount) {
  const sign = amount < 0 ? "-" : "";
  return sign + "$" + Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function moneyShort(amount) {
  return "$" + Math.round(amount).toLocaleString("en-US");
}
