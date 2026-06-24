import { auth, db } from "./firebase.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// LOAD PROFILE
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);

  const userSnap = await getDoc(userRef);

  const userData = userSnap.data();

  document.getElementById("profileUsername").textContent =
    userData.username;

  document.getElementById("profileEmail").textContent =
    userData.email;

  document.getElementById("profileBio").textContent =
    userData.bio || "No bio yet";

  document.getElementById("followersCount").textContent =
    userData.followers?.length || 0;

  document.getElementById("followingCount").textContent =
    userData.following?.length || 0;

  // Populate edit fields
  document.getElementById("usernameInput").value =
    userData.username || "";

  document.getElementById("bioInput").value =
    userData.bio || "";

});


// LOGOUT
document
  .getElementById("logoutBtn")
  .addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "login.html";

  });


// SHOW / HIDE EDIT PROFILE SECTION
document
  .getElementById("editProfileBtn")
  .addEventListener("click", () => {

    const section =
      document.getElementById("editSection");

    const btn =
      document.getElementById("editProfileBtn");

    if (section.style.display === "none") {

      section.style.display = "block";
      btn.textContent = "Cancel";

    } else {

      section.style.display = "none";
      btn.textContent = "Edit Profile";

    }

  });


// SAVE PROFILE
document
  .getElementById("saveProfileBtn")
  .addEventListener("click", async () => {

    const user = auth.currentUser;

    if (!user) return;

    const username =
      document.getElementById("usernameInput").value;

    const bio =
      document.getElementById("bioInput").value;

    await updateDoc(
      doc(db, "users", user.uid),
      {
        username,
        bio
      }
    );

    document.getElementById("profileUsername").textContent =
      username;

    document.getElementById("profileBio").textContent =
      bio;

    document.getElementById("editSection").style.display =
      "none";

    document.getElementById("editProfileBtn").textContent =
      "Edit Profile";

    alert("Profile Updated Successfully");

  });