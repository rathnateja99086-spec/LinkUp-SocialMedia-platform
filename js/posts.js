import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ====================
// LOGOUT
// ====================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}


// ====================
// CREATE POST
// ====================

const postBtn = document.getElementById("postBtn");

if (postBtn) {

  postBtn.addEventListener("click", async () => {

    const content =
      document.getElementById("postContent").value.trim();

    if (!content) return;

    try {

      const userRef =
        doc(db, "users", auth.currentUser.uid);

      const userSnap =
        await getDoc(userRef);

      const userData =
        userSnap.data();

      await addDoc(
        collection(db, "posts"),
        {
          userId: auth.currentUser.uid,
          username: userData.username,
          content,
          createdAt: serverTimestamp(),
          likes: []
        }
      );

      document.getElementById("postContent").value = "";

      loadPosts();

    } catch (error) {

      console.error(error);

    }

  });

}


// ====================
// LOAD POSTS
// ====================

async function loadPosts(search = "") {

  const postsContainer =
    document.getElementById("postsContainer");

  if (!postsContainer) return;

  postsContainer.innerHTML = "";

  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc")
  );

  const snapshot =
    await getDocs(q);

  for (const postDoc of snapshot.docs) {

    const post =
      postDoc.data();

    const currentUid =
      auth.currentUser.uid;

    const liked =
      post.likes?.includes(currentUid);

    postsContainer.innerHTML += `

      <div class="border-b p-4">

        <div class="font-bold text-lg">
          @${post.username}
        </div>

        <p class="mt-2">
          ${post.content}
        </p>

        <div class="mt-3 flex gap-4 items-center">

  <button
    onclick="toggleLike('${postDoc.id}')"
    class="text-red-500"
  >
    ${liked ? "❤️" : "🤍"}
    ${post.likes?.length || 0}
  </button>

  ${
    post.userId === auth.currentUser.uid
      ? `
      <button
        onclick="deletePost('${postDoc.id}')"
        class="text-red-600 font-semibold"
      >
        Delete
      </button>
      `
      : ""
  }

</div>

        <div class="mt-4">

          <input
            id="comment-${postDoc.id}"
            placeholder="Add comment"
            class="border p-2 rounded w-full"
          >

          <button
            onclick="addComment('${postDoc.id}')"
            class="mt-2 bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Comment
          </button>

        </div>

        <div
          id="comments-${postDoc.id}"
          class="mt-3"
        ></div>

      </div>

    `;

    await loadComments(postDoc.id);

  }

}


// ====================
// LIKE / UNLIKE
// ====================

window.toggleLike = async function(postId) {

  const uid =
    auth.currentUser.uid;

  const postRef =
    doc(db, "posts", postId);

  const postSnap =
    await getDoc(postRef);

  const post =
    postSnap.data();

  if (post.likes?.includes(uid)) {

    await updateDoc(postRef, {
      likes: arrayRemove(uid)
    });

  } else {

    await updateDoc(postRef, {
      likes: arrayUnion(uid)
    });

  }

  loadPosts();

};

window.deletePost = async function(postId){

  const confirmDelete =
    confirm("Delete this post?");

  if(!confirmDelete) return;

  await deleteDoc(
    doc(db,"posts",postId)
  );

  loadPosts();

};
// ====================
// COMMENTS
// ====================

window.addComment = async function(postId) {

  const input =
    document.getElementById(`comment-${postId}`);

  const text =
    input.value.trim();

  if (!text) return;

  const userRef =
    doc(db, "users", auth.currentUser.uid);

  const userSnap =
    await getDoc(userRef);

  const user =
    userSnap.data();

  await addDoc(
    collection(db, "comments"),
    {
      postId,
      userId: auth.currentUser.uid,
      username: user.username,
      text,
      createdAt: serverTimestamp()
    }
  );

  input.value = "";

  loadPosts();

};


async function loadComments(postId) {

  const container =
    document.getElementById(`comments-${postId}`);

  if (!container) return;

  container.innerHTML = "";

  const commentsSnapshot =
    await getDocs(collection(db, "comments"));

  commentsSnapshot.forEach((commentDoc) => {

    const comment =
      commentDoc.data();

    if (comment.postId === postId) {

      container.innerHTML += `

        <div class="mt-2 text-sm">

          <strong>
            ${comment.username}
          </strong>

          : ${comment.text}

        </div>

      `;

    }

  });

}


// ====================
// SUGGESTED USERS
// ====================

async function loadUsers() {

  const usersContainer =
    document.getElementById("usersContainer");

  const searchInput =
    document.getElementById("searchUser");

  if (!usersContainer) return;

  usersContainer.innerHTML = "";

  const search =
    searchInput
      ? searchInput.value.trim()
      : "";

  const snapshot =
    await getDocs(collection(db, "users"));

  snapshot.forEach((userDoc) => {

    const user =
      userDoc.data();

    if (
      user.uid === auth.currentUser.uid
    ) return;

    if (
      search &&
      !user.username
        .toLowerCase()
        .includes(search.toLowerCase())
    ) {
      return;
    }

    usersContainer.innerHTML += `
      <div class="flex justify-between items-center border-b py-3">

        <div>
          <div class="font-semibold">
            ${user.username}
          </div>

          <div class="text-sm text-gray-500">
            @${user.username}
          </div>
        </div>

        <button
          onclick="followUser('${user.uid}')"
          class="bg-black text-white px-4 py-1 rounded-full"
        >
          Follow
        </button>

      </div>
    `;
  });

}

// ====================
// FOLLOW USER
// ====================

window.followUser = async function(targetUid) {

  const currentUid =
    auth.currentUser.uid;

  const currentUserRef =
    doc(db, "users", currentUid);

  const targetUserRef =
    doc(db, "users", targetUid);

  await updateDoc(currentUserRef, {
    following: arrayUnion(targetUid)
  });

  await updateDoc(targetUserRef, {
    followers: arrayUnion(currentUid)
  });

  alert("User Followed");

  loadUsers();

};


// ====================
// INIT
// ====================
const searchInput =
  document.getElementById("searchUser");

if(searchInput){

  searchInput.addEventListener(
    "input",
    (e) => {

      loadUsers(e.target.value);

    }
  );

}

loadPosts();
loadUsers();