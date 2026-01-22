import { auth } from "./firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const nameInput = document.getElementById("nameInput");
const saveBtn = document.getElementById("saveName");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // If already saved, skip
  if (localStorage.getItem("monexName")) {
    window.location.href = "tracker.html";
  }
});

saveBtn.addEventListener("click", () => {
  if (!nameInput.value.trim()) {
    alert("Please enter your name");
    return;
  }

  // ✅ Save app-specific name
  localStorage.setItem("monexName", nameInput.value.trim());

  window.location.href = "tracker.html";
});
