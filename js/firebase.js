// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCnCa46inVnVsPVn57BOd02vUnR6vgm10M",
  authDomain: "linkup-ef978.firebaseapp.com",
  projectId: "linkup-ef978",
  storageBucket: "linkup-ef978.firebasestorage.app",
  messagingSenderId: "1026103091765",
  appId: "1:1026103091765:web:5f78e8005e7cf0e2c7077c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);