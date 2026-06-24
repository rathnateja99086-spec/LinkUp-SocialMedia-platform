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
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// CREATE POST
const postBtn = document.getElementById("postBtn");

if (postBtn) {

  postBtn.addEventListener("click", async () => {

    const content =
      document.getElementById("postContent").value;

    if (!content.trim()) return;

    try {

      const userRef = doc(
        db,
        "users",
        auth.currentUser.uid
      );

      const userSnap = await getDoc(userRef);

      const userData = userSnap.data();

      await addDoc(
        collection(db, "posts"),
        {
          userId: auth.currentUser.uid,
          username: userData.username,
          content: content,
          createdAt: serverTimestamp(),
          likes: []
        }
      );

      document.getElementById("postContent").value = "";

      loadPosts();

    } catch (error) {

      console.log(error);

    }

  });

}


// LOAD POSTS
async function loadPosts() {

  const postsContainer =
    document.getElementById("postsContainer");

  postsContainer.innerHTML = "";

  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  for (const postDoc of snapshot.docs) {

    const post = postDoc.data();

    postsContainer.innerHTML += `
      <div style="border:1px solid #ccc;padding:10px;margin:10px">

        <h4>@${post.username || "User"}</h4>

        <p>${post.content}</p>

        <button onclick="likePost('${postDoc.id}')">
          ❤️ ${post.likes ? post.likes.length : 0}
        </button>

        <br><br>

        <input
          type="text"
          id="comment-${postDoc.id}"
          placeholder="Add comment"
        >

        <button onclick="addComment('${postDoc.id}')">
          Comment
        </button>

        <div id="comments-${postDoc.id}"></div>

      </div>
    `;

    const commentsContainer =
      document.getElementById(`comments-${postDoc.id}`);

    const commentsSnapshot =
      await getDocs(collection(db, "comments"));

    commentsSnapshot.forEach((commentDoc) => {

      const comment = commentDoc.data();

      if (comment.postId === postDoc.id) {

        commentsContainer.innerHTML += `
          <p>
            <strong>${comment.username || "User"}</strong>:
            ${comment.text}
          </p>
        `;

      }

    });

  }

}


// LIKE POST
window.likePost = async function (postId) {

  const uid = auth.currentUser.uid;

  const postRef = doc(
    db,
    "posts",
    postId
  );

  await updateDoc(postRef, {
    likes: arrayUnion(uid)
  });

  loadPosts();

};


// ADD COMMENT
window.addComment = async function (postId) {

  const input =
    document.getElementById(`comment-${postId}`);

  const text = input.value;

  if (!text.trim()) return;

  const userRef = doc(
    db,
    "users",
    auth.currentUser.uid
  );

  const userSnap =
    await getDoc(userRef);

  const userData =
    userSnap.data();

  await addDoc(
    collection(db, "comments"),
    {
      postId,
      userId: auth.currentUser.uid,
      username: userData.username,
      text,
      createdAt: serverTimestamp()
    }
  );

  input.value = "";

  loadPosts();

};


loadPosts();
async function loadUsers() {

  const usersContainer =
    document.getElementById("usersContainer");

  if (!usersContainer) return;

  usersContainer.innerHTML = "";

  const snapshot =
    await getDocs(collection(db, "users"));

  snapshot.forEach((userDoc) => {

    const user = userDoc.data();

    if (user.uid === auth.currentUser.uid)
      return;

    usersContainer.innerHTML += `
      <div style="border:1px solid #ccc;padding:10px;margin:10px">

        <h4>${user.username}</h4>

        <button
          onclick="followUser('${user.uid}')"
        >
          Follow
        </button>

      </div>
    `;

  });

}
window.followUser = async function(targetUid){

  const currentUid =
    auth.currentUser.uid;

  const currentUserRef =
    doc(db,"users",currentUid);

  const targetUserRef =
    doc(db,"users",targetUid);

  await updateDoc(currentUserRef,{
    following: arrayUnion(targetUid)
  });

  await updateDoc(targetUserRef,{
    followers: arrayUnion(currentUid)
  });

  alert("Followed User");

}
loadPosts();
loadUsers();