// Module-scoped app for Expense Tracker
const $totalBalance = document.getElementById("totalBalance");
const $incomeTotalAmount = document.getElementById("incomeTotalAmount");
const $expenseTotalAmount = document.getElementById("expenseTotalAmount");
const $descriptiveText = document.getElementById("descriptiveText");
const $addNewTransactionForm = document.getElementById("addNewTransactionForm");
const $amountText = document.getElementById("amountText");
const $historyListContainer = document.getElementById("historyListContainer");
const $themeToggle = document.getElementById("themeToggle");

const STORAGE_KEY = "expense_tracker_transactions_v1";

function generateUID() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatMonth(date) {
  return new Intl.DateTimeFormat(navigator.language, { month: "short" }).format(date);
}

function formatCurrency(value) {
  try {
    return new Intl.NumberFormat(navigator.language || "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  } catch (e) {
    return `$${Number(value).toFixed(2)}`;
  }
}

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // restore Date objects
    return parsed.map((t) => ({ ...t, date: new Date(t.date) }));
  } catch (e) {
    console.warn("Failed to load transactions", e);
    return null;
  }
}

function saveTransactions(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Failed to save transactions", e);
  }
}

let transactions = loadTransactions() || [
  { id: generateUID(), description: "Salary", amount: 1200.0, date: new Date() },
  { id: generateUID(), description: "Groceries", amount: -54.25, date: new Date() },
];

function createCard(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";

  const item = document.createElement("article");
  item.className = "card";
  item.setAttribute("role", "listitem");
  item.dataset.id = transaction.id;

  item.innerHTML = `
    <div class="column-1">
      <p class="day">${transaction.date.getDate()}</p>
      <p class="month">${formatMonth(transaction.date)}</p>
    </div>
    <div class="column-2">
      <p class="description">${escapeHtml(transaction.description)}</p>
      <div class="amount-wrap">
        <p class="amount ${transaction.amount > 0 ? "income" : "expense"}">${formatCurrency(transaction.amount)}</p>
        <button class="delete-btn" aria-label="Delete transaction" data-id="${transaction.id}">✕</button>
      </div>
    </div>
  `;

  return item;
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

function renderTransactions() {
  $historyListContainer.innerHTML = "";
  const list = document.createElement('div');
  list.setAttribute('role', 'list');
  transactions.forEach((t) => list.appendChild(createCard(t)));
  $historyListContainer.appendChild(list);
  updateUIValues();
}

function addTransaction(transaction) {
  transactions.unshift(transaction);
  saveTransactions(transactions);
  renderTransactions();
}

function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions(transactions);
  renderTransactions();
}

function updateUIValues() {
  const amounts = transactions.map((t) => Number(t.amount) || 0);
  const total = amounts.reduce((a, b) => a + b, 0);
  const income = amounts.filter((v) => v > 0).reduce((a, b) => a + b, 0);
  const expense = amounts.filter((v) => v < 0).reduce((a, b) => a + b, 0);

  $totalBalance.innerText = formatCurrency(total);
  $incomeTotalAmount.innerText = formatCurrency(income);
  $expenseTotalAmount.innerText = formatCurrency(Math.abs(expense));
}

function handleFormSubmit(e) {
  e.preventDefault();
  const description = $descriptiveText.value.trim();
  const amount = Number.parseFloat($amountText.value);

  if (!description) {
    $descriptiveText.focus();
    alert('Please enter a description for the transaction.');
    return;
  }
  if (!Number.isFinite(amount) || amount === 0) {
    $amountText.focus();
    alert('Please enter a non-zero numeric amount.');
    return;
  }

  const transaction = {
    id: generateUID(),
    description,
    amount: Math.round(amount * 100) / 100,
    date: new Date(),
  };

  addTransaction(transaction);
  $addNewTransactionForm.reset();
  $descriptiveText.focus();
}

// Event delegation for delete buttons
$historyListContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('.delete-btn');
  if (!btn) return;
  const id = btn.dataset.id;
  if (!id) return;
  if (confirm('Delete this transaction?')) deleteTransaction(id);
});

$addNewTransactionForm.addEventListener('submit', handleFormSubmit);

// Theme toggle (simple)
function initTheme() {
  const stored = localStorage.getItem('expense_tracker_theme');
  if (stored === 'dark') {
    document.documentElement.classList.add('dark');
    if ($themeToggle) $themeToggle.setAttribute('aria-pressed', 'true');
    return;
  }
  if (stored === 'light') {
    document.documentElement.classList.remove('dark');
    if ($themeToggle) $themeToggle.setAttribute('aria-pressed', 'false');
    return;
  }

  // No explicit preference: follow system preference
  const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  const prefersDark = mq ? mq.matches : false;
  document.documentElement.classList.toggle('dark', prefersDark);
  if ($themeToggle) $themeToggle.setAttribute('aria-pressed', String(prefersDark));

  // Listen to system changes only when user hasn't set a preference
  if (mq && mq.addEventListener) {
    mq.addEventListener('change', (e) => {
      if (!localStorage.getItem('expense_tracker_theme')) {
        document.documentElement.classList.toggle('dark', e.matches);
        if ($themeToggle) $themeToggle.setAttribute('aria-pressed', String(e.matches));
      }
    });
  }
}

if ($themeToggle) {
  $themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    $themeToggle.setAttribute('aria-pressed', String(isDark));
    localStorage.setItem('expense_tracker_theme', isDark ? 'dark' : 'light');
  });
}

initTheme();
renderTransactions();

// History collapse/expand toggle
const $historyToggle = document.getElementById('historyToggle');
if ($historyToggle) {
  $historyToggle.addEventListener('click', () => {
    const expanded = $historyToggle.getAttribute('aria-expanded') === 'true';
    const newExpanded = !expanded;
    $historyToggle.setAttribute('aria-expanded', String(newExpanded));
    if (!newExpanded) {
      $historyListContainer.classList.add('collapsed');
    } else {
      $historyListContainer.classList.remove('collapsed');
    }
  });
}
