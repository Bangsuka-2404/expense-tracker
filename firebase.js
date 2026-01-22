import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAn2M_qufn4QwjwjHizxlEpGDrnsZ1qF7I",
  authDomain: "monex-79e43.firebaseapp.com",
  projectId: "monex-79e43",
  storageBucket: "monex-79e43",
  messagingSenderId: "28919786086",
  appId: "1:28919786086:web:e0433e2bc36877840c9ba7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
