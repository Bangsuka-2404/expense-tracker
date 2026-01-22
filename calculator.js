// 🌙 Sync dark mode with tracker
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}
const display = document.getElementById("calcDisplay");

// Tabs
function showCalc(id) {
  document.querySelectorAll(".calc-section").forEach(sec => {
    sec.classList.add("hidden");
  });

  document.querySelectorAll(".calc-tabs button").forEach(btn => {
    btn.classList.remove("active");
  });

  document.getElementById(id).classList.remove("hidden");
  event.target.classList.add("active");
}

// BASIC CALCULATOR
function press(value) {
  display.value += value;
}

function clearDisplay() {
  display.value = "";
}

function calculate() {
  try {
    display.value = eval(display.value);
  } catch {
    display.value = "Error";
  }
}

// SIP CALCULATOR
function calculateSIP() {
  const P = Number(document.getElementById("sipAmount").value);
  const r = Number(document.getElementById("sipRate").value) / 100 / 12;
  const n = Number(document.getElementById("sipYears").value) * 12;

  if (!P || !r || !n) {
    document.getElementById("sipResult").textContent = "Please fill all fields";
    return;
  }

  const futureValue = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const invested = P * n;
  const returns = futureValue - invested;

  document.getElementById("sipResult").innerHTML = `
    💰 Invested: ₹${invested.toFixed(0)} <br>
    📈 Returns: ₹${returns.toFixed(0)} <br>
    🏦 Final Value: ₹${futureValue.toFixed(0)}
  `;
}

// SIMPLE INTEREST
function calculateSI() {
  const P = Number(document.getElementById("siPrincipal").value);
  const R = Number(document.getElementById("siRate").value);
  const T = Number(document.getElementById("siTime").value);

  if (!P || !R || !T) {
    document.getElementById("siResult").textContent = "Please fill all fields";
    return;
  }

  const interest = (P * R * T) / 100;
  const total = P + interest;

  document.getElementById("siResult").innerHTML = `
    💸 Interest: ₹${interest.toFixed(0)} <br>
    💰 Total Amount: ₹${total.toFixed(0)}
  `;
}
