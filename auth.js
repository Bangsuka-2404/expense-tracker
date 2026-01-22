import { auth, provider } from "./firebase.js";
import {
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Login button
document.getElementById("googleLogin").addEventListener("click", async () => {
  await signInWithPopup(auth, provider);
});

// After login, decide where to go
onAuthStateChanged(auth, (user) => {
  if (!user) return;

  // 🔁 First time user
  if (!user.displayName) {
    window.location.href = "name.html";
  } else {
    // ✅ Returning user
    window.location.href = "tracker.html";
  }
});
