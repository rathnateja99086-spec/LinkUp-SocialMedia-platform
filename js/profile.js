import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const profileNameTop = document.getElementById("profileNameTop");
const postCountTop = document.getElementById("postCountTop");

const profileName = document.getElementById("profileName");
const profileUsername = document.getElementById("profileUsername");
const profileBio = document.getElementById("profileBio");
const profileLocation = document.getElementById("profileLocation");
const profileWebsite = document.getElementById("profileWebsite");
const joinedDate = document.getElementById("joinedDate");

const followersCount = document.getElementById("followersCount");
const followingCount = document.getElementById("followingCount");

const postsContainer = document.getElementById("postsContainer");

const logoutBtn = document.getElementById("logoutBtn");


// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}


// Auth Check
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {

    // Get User Data
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const userData = userSnap.data();

    // Top Header
    profileNameTop.textContent =
      userData.username || "User";

    // Profile Info
    profileName.textContent =
      userData.username || "User";

    profileUsername.textContent =
      "@" + (userData.username || "user");

    profileBio.textContent =
      userData.bio || "No bio yet.";

    profileLocation.textContent =
      userData.location || "";

    // Website
    if (userData.website) {
      profileWebsite.href = userData.website;
      profileWebsite.textContent = userData.website;
    } else {
      profileWebsite.textContent = "";
    }

    // Joined Date
    joinedDate.textContent =
      "Joined " +
      new Date(user.metadata.creationTime)
        .toLocaleDateString("en-US", {
          month: "long",
          year: "numeric"
        });

    // Followers
    followersCount.textContent =
      userData.followers
        ? userData.followers.length
        : 0;

    followingCount.textContent =
      userData.following
        ? userData.following.length
        : 0;

    // Load Posts
    const postsQuery = query(
      collection(db, "posts"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const postSnapshot =
      await getDocs(postsQuery);
    console.log("Posts found:", postSnapshot.size);

    postCountTop.textContent =
      `${postSnapshot.size} Posts`;
    console.log(postCountTop);
    postsContainer.innerHTML = "";

    if (postSnapshot.empty) {

      postsContainer.innerHTML = `
        <div class="p-6 text-center text-gray-500">
          No posts yet.
        </div>
      `;

      return;
    }

    postSnapshot.forEach((postDoc) => {

      const post = postDoc.data();

      const postElement =
      document.createElement("article");

      postElement.className =
        "p-md border-b border-outline-variant/30";

      postElement.innerHTML = `
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <span class="font-bold">
              ${userData.username}
            </span>
            <span class="text-sm text-gray-500">
              ${post.createdAt?.toDate
                ? post.createdAt.toDate().toLocaleString()
                : ""}
            </span>
          </div>

          <p class="text-body-md">
            ${post.content || ""}
          </p>
        </div>
      `;

      postsContainer.appendChild(postElement);

    });

  } catch (error) {

    console.error(error);

  }

});