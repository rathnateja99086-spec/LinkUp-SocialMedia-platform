import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ====================
// REGISTER
// ====================

const registerBtn =
  document.getElementById("registerBtn");

if (registerBtn) {

  registerBtn.addEventListener("click", async () => {

    const username =
      document.getElementById("username").value;

    const email =
      document.getElementById("email").value;

    const password =
      document.getElementById("password").value;

    try {

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user =
        userCredential.user;

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          username: username,
          email: email,
          bio: "",
          followers: [],
          following: []
        }
      );

      alert("Registration Successful");

      window.location.href =
        "login.html";

    } catch (error) {

      alert(error.message);

    }

  });

}


// ====================
// EMAIL LOGIN
// ====================

const loginBtn =
  document.getElementById("loginBtn");

if (loginBtn) {

  loginBtn.addEventListener("click", async () => {

    const email =
      document.getElementById("loginEmail").value;

    const password =
      document.getElementById("loginPassword").value;

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Login Successful");

      window.location.href =
        "feed.html";

    } catch (error) {

      alert(error.message);

    }

  });

}


// ====================
// GOOGLE LOGIN
// ====================

const googleLoginBtn =
  document.getElementById("googleLoginBtn");

if (googleLoginBtn) {

  googleLoginBtn.addEventListener(
    "click",
    async () => {

      try {

        const provider =
          new GoogleAuthProvider();

        const result =
          await signInWithPopup(
            auth,
            provider
          );

        const user =
          result.user;

        const userRef =
          doc(db, "users", user.uid);

        const userSnap =
          await getDoc(userRef);

        // Create Firestore user document
        // only first time

        if (!userSnap.exists()) {

          await setDoc(userRef, {

            uid: user.uid,

            username:
              user.displayName ||
              "Google User",

            email:
              user.email,

            bio: "",

            followers: [],

            following: []

          });

        }

        alert("Google Login Successful");

        window.location.href =
          "feed.html";

      } catch (error) {

        console.error(error);

        alert(error.message);

      }

    }
  );

}