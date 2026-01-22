import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Elements
const balanceEl = document.getElementById("balance");
const expenseList = document.getElementById("expenseList");
const addCreditInput = document.getElementById("addCreditInput");
const addCreditBtn = document.getElementById("addCreditBtn");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const categoryInput = document.getElementById("category");
const addExpenseBtn = document.getElementById("addExpense");
const logoutBtn = document.getElementById("logoutBtn");
const themeToggle = document.getElementById("themeToggle");
const donutMonthSelect = document.getElementById("donutMonthSelect");

// Auth guard
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
});

// Data
let credit = Number(localStorage.getItem("credit")) || 0;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// ➕ Add credit
addCreditBtn.addEventListener("click", () => {
  const amount = Number(addCreditInput.value);
  if (!amount || amount <= 0) return alert("Enter valid amount");

  credit += amount;
  localStorage.setItem("credit", credit);
  addCreditInput.value = "";
  render();
});

// ➕ Add expense
addExpenseBtn.addEventListener("click", () => {
  const amount = Number(amountInput.value);
  const date = dateInput.value;
  const category = categoryInput.value;

  if (!amount || !date || !category) return alert("Fill all fields");

  expenses.push({ amount, date, category });
  localStorage.setItem("expenses", JSON.stringify(expenses));
  render();
});

// 🗑️ Delete expense
function deleteExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  render();
}

// 🔄 Render
function render() {
  expenseList.innerHTML = "";
  let totalSpent = 0;

  expenses.forEach((e, index) => {
    totalSpent += e.amount;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${e.date} • ${e.category}</span>
      <div>
        <strong>₹${e.amount}</strong>
        <button class="delete-btn">❌</button>
      </div>
    `;

    li.querySelector(".delete-btn").addEventListener("click", () => {
      deleteExpense(index);
    });

    expenseList.appendChild(li);
  });

  balanceEl.textContent = Math.max(credit - totalSpent, 0);

  populateDonutMonths();
  updateDonutChart();
  updateDailyChart();
}

// 🔓 Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// 🌙 Theme toggle
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent =
    document.body.classList.contains("dark") ? "☀️" : "🌙";
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});

// 🍩 DONUT CHART
let donutChart;

function populateDonutMonths() {
  const set = new Set();

  expenses.forEach(e => {
    const d = new Date(e.date);
    set.add(`${d.getFullYear()}-${d.getMonth()}`);
  });

  donutMonthSelect.innerHTML = "";

  Array.from(set).sort().forEach(key => {
    const [y, m] = key.split("-");
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = new Date(y, m).toLocaleString("default", {
      month: "long",
      year: "numeric"
    });
    donutMonthSelect.appendChild(opt);
  });
}

function updateDonutChart() {
  if (!donutMonthSelect.value) return;

  const [year, month] = donutMonthSelect.value.split("-");
  const totals = {};

  expenses.forEach(e => {
    const d = new Date(e.date);
    if (d.getFullYear() == year && d.getMonth() == month) {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    }
  });

  const ctx = document.getElementById("expenseChart");
  if (!ctx) return;

  if (donutChart) donutChart.destroy();

  donutChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(totals),
      datasets: [{
        data: Object.values(totals),
        backgroundColor: [
          "#ff9f1c","#ff6b6b","#4dabf7",
          "#51cf66","#9775fa","#ffd43b"
        ]
      }]
    },
    options: { cutout: "60%" }
  });
}

donutMonthSelect.addEventListener("change", updateDonutChart);

// 📊 DAILY BAR GRAPH
let dailyChart;
let currentStartDate = new Date();
currentStartDate.setHours(0,0,0,0);
const DAYS_VISIBLE = 7;

function formatLocalDate(d) {
  return (
    d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

function updateDailyChart() {
  const labels = [];
  const data = [];

  for (let i = 0; i < DAYS_VISIBLE; i++) {
    const d = new Date(currentStartDate);
    d.setDate(d.getDate() + i);

    const key = formatLocalDate(d);

    labels.push(
      d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    );

    const total = expenses
      .filter(e => e.date === key)
      .reduce((s, e) => s + e.amount, 0);

    data.push(total);
  }

  const end = new Date(currentStartDate);
  end.setDate(end.getDate() + DAYS_VISIBLE - 1);

  document.getElementById("dateRange").textContent =
    `${currentStartDate.toDateString()} – ${end.toDateString()}`;

  const ctx = document.getElementById("dailyChart");
  if (!ctx) return;

  if (dailyChart) dailyChart.destroy();

  dailyChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Daily Spending",
        data,
        backgroundColor: "#4dabf7",
        borderRadius: 6
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } }
    }
  });
}

document.getElementById("nextDays").addEventListener("click", () => {
  currentStartDate.setDate(currentStartDate.getDate() + DAYS_VISIBLE);
  updateDailyChart();
});

document.getElementById("prevDays").addEventListener("click", () => {
  currentStartDate.setDate(currentStartDate.getDate() - DAYS_VISIBLE);
  updateDailyChart();
});

// Initial render
render();
// 🤖 SMART CHATBOT (UPDATED)
const chatToggle = document.getElementById("chatToggle");
const chatbot = document.getElementById("chatbot");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");
const chatOptions = document.getElementById("chatOptions");

// Toggle chatbot
chatToggle.onclick = () => {
  chatbot.style.display =
    chatbot.style.display === "flex" ? "none" : "flex";
};

// Add message helper
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = sender === "user" ? "chat-user" : "chat-bot";
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Bot logic
function getBotReply(msg) {
  msg = msg.toLowerCase();

  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  const credit = Number(localStorage.getItem("credit")) || 0;

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const balance = credit - totalSpent;

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];

  const todaySpent = expenses
    .filter(e => e.date === today)
    .reduce((s, e) => s + e.amount, 0);

  const yesterdaySpent = expenses
    .filter(e => e.date === yesterday)
    .reduce((s, e) => s + e.amount, 0);

  const uniqueDays = new Set(expenses.map(e => e.date)).size;
  const avgDaily =
    uniqueDays > 0 ? Math.round(totalSpent / uniqueDays) : 0;

  const categoryTotals = {};
  expenses.forEach(e => {
    categoryTotals[e.category] =
      (categoryTotals[e.category] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1]);

  if (msg.includes("balance"))
    return `💰 Your current balance is ₹${balance}`;

  if (msg.includes("today"))
    return `📅 You spent ₹${todaySpent} today`;

  if (msg.includes("yesterday"))
    return `📅 Yesterday you spent ₹${yesterdaySpent}`;

  if (msg.includes("total"))
    return `💸 Total spent so far is ₹${totalSpent}`;

  if (msg.includes("average"))
    return `📊 Your average daily spend is ₹${avgDaily}`;

  if (msg.includes("top") || msg.includes("most"))
    return sortedCategories.length
      ? `🏆 You spend most on ${sortedCategories[0][0]} (₹${sortedCategories[0][1]})`
      : "No expenses yet";

  if (msg.includes("least"))
    return sortedCategories.length > 1
      ? `📉 Least spent category is ${sortedCategories[sortedCategories.length - 1][0]}`
      : "Not enough data yet";

  if (msg.includes("how many") || msg.includes("count"))
    return `🧾 You have logged ${expenses.length} expenses so far`;

  if (msg.includes("help"))
    return (
      "You can ask me things like:\n" +
      "• balance\n" +
      "• today spent\n" +
      "• total spent\n" +
      "• top category\n" +
      "• average spend\n\n" +
      "Or click an option below 👇"
    );

  return "🤔 I didn’t understand. Try clicking an option below 👇";
}

// Send typed message
sendChat.onclick = () => {
  const msg = chatInput.value.trim();
  if (!msg) return;

  addMessage(msg, "user");
  chatInput.value = "";

  setTimeout(() => {
    addMessage(getBotReply(msg), "bot");
  }, 400);
};

// Handle option button clicks
if (chatOptions) {
  chatOptions.addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON") return;

    const msg = e.target.dataset.msg;
    addMessage(msg, "user");

    setTimeout(() => {
      addMessage(getBotReply(msg), "bot");
    }, 300);
  });
}


// 💰 SAVINGS GOAL LOGIC (FIXED + CONFETTI ADDED)
const savingPurposeInput = document.getElementById("savingPurpose");
const savingTargetInput = document.getElementById("savingTarget");
const savingAmountInput = document.getElementById("savingAmount");
const savingDateInput = document.getElementById("savingDate");
const addSavingBtn = document.getElementById("addSavingBtn");
const savingProgress = document.getElementById("savingProgress");
const savingInfo = document.getElementById("savingInfo");
const savingLogs = document.getElementById("savingLogs");
const savingPercentEl = document.getElementById("savingPercent");

let savings =
  JSON.parse(localStorage.getItem("savings")) || {
    purpose: "",
    target: 0,
    logs: [],
    completed: false
  };

function saveSavings() {
  localStorage.setItem("savings", JSON.stringify(savings));
}

function renderSavings() {
  savingPurposeInput.value = savings.purpose;
  savingTargetInput.value = savings.target || "";

  savingLogs.innerHTML = "";

  const totalSaved = savings.logs.reduce(
    (sum, log) => sum + log.amount,
    0
  );

  let percent = 0;

  if (savings.target > 0) {
    percent = Math.min((totalSaved / savings.target) * 100, 100);
    savingProgress.style.width = percent + "%";

    if (savingPercentEl) {
      savingPercentEl.textContent = Math.floor(percent) + "%";
    }

    const remaining = savings.target - totalSaved;

    if (remaining <= 0) {
      savingInfo.textContent = "You did it! 🎉";

      if (!savings.completed) {
        launchConfetti();
        savings.completed = true;
        saveSavings();
      }
    } else {
      savingInfo.textContent = `₹${remaining} remaining to reach your goal`;
      savings.completed = false;
    }
  } else {
    savingProgress.style.width = "0%";
    if (savingPercentEl) savingPercentEl.textContent = "";
    savingInfo.textContent = "Set a target to start saving 💡";
  }

  savings.logs.forEach(log => {
    const li = document.createElement("li");
    li.textContent = `${log.date} — ₹${log.amount}`;
    savingLogs.appendChild(li);
  });
}

addSavingBtn.onclick = () => {
  const purpose = savingPurposeInput.value.trim();
  const target = Number(savingTargetInput.value);
  const amount = Number(savingAmountInput.value);
  const date = savingDateInput.value;

  if (!purpose || !target || !amount || !date) {
    alert("Please fill all fields");
    return;
  }

  savings.purpose = purpose;
  savings.target = target;
  savings.logs.push({ amount, date });
  savings.completed = false;

  savingAmountInput.value = "";
  savingDateInput.value = "";

  saveSavings();
  renderSavings();
};

renderSavings();

// 🎉 CONFETTI CELEBRATION (UNCHANGED)
function launchConfetti() {
  const container = document.getElementById("confetti-container");
  container.innerHTML = "";

  const colors = [
    "#ff6b6b",
    "#feca57",
    "#48dbfb",
    "#1dd1a1",
    "#5f27cd"
  ];

  for (let i = 0; i < 120; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");

    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration =
      2 + Math.random() * 2 + "s";
    confetti.style.transform =
      `rotate(${Math.random() * 360}deg)`;

    container.appendChild(confetti);

    setTimeout(() => confetti.remove(), 4000);
  }
}
// 🆕 NEW GOAL & DELETE GOAL LOGIC
const newGoalBtn = document.getElementById("newGoalBtn");
const deleteGoalBtn = document.getElementById("deleteGoalBtn");

// Start new goal
newGoalBtn.onclick = () => {
  if (!confirm("Start a new savings goal? This will clear the current one.")) {
    return;
  }

  savings = {
    purpose: "",
    target: 0,
    logs: [],
    completed: false
  };

  saveSavings();
  renderSavings();
};

// Delete completed goal
deleteGoalBtn.onclick = () => {
  if (!savings.completed) {
    alert("You can only delete a goal after completing it 🎯");
    return;
  }

  const ok = confirm(
    "Are you sure you want to delete this completed savings goal?"
  );

  if (!ok) return;

  savings = {
    purpose: "",
    target: 0,
    logs: [],
    completed: false
  };

  saveSavings();
  renderSavings();
};
