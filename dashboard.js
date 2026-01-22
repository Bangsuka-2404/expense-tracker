import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const welcomeText = document.getElementById("welcomeText");
const nameInput = document.getElementById("nameInput");
const saveNameBtn = document.getElementById("saveName");
const logoutBtn = document.getElementById("logout");
const userPhoto = document.getElementById("userPhoto");

// 🔐 Protect dashboard
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  welcomeText.textContent = `Hello, ${user.displayName || "Monex User"} 👋`;

  if (user.photoURL) {
    userPhoto.src = user.photoURL;
    userPhoto.style.display = "block";
  }

  if (user.displayName) {
    nameInput.value = user.displayName;
  }
});

// 💾 Save name
saveNameBtn.addEventListener("click", async () => {
  if (!nameInput.value.trim()) {
    alert("Please enter a name");
    return;
  }

  try {
    await updateProfile(auth.currentUser, {
      displayName: nameInput.value
    });

    welcomeText.textContent = `Hello, ${nameInput.value} 👋`;
    alert("Name saved successfully ✅");
  } catch (err) {
    alert(err.message);
  }
});

// 🔓 Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});
