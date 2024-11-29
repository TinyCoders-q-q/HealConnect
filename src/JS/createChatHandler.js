import { getFirestore, doc, getDoc, collection } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { Chat } from "./chat.js";

const db = getFirestore();
const auth = getAuth();

export async function initializeChat() {
  const user = await new Promise((resolve) => {
    onAuthStateChanged(auth, resolve);
  });

  if (!user) {
    alert("You need to log in to access the chat.");
    return;
  }

  const userId = user.uid;
  let userType = null;

  const therapistDoc = await getDoc(doc(db, "Therapists", userId));
  const patientDoc = await getDoc(doc(db, "Patients", userId));

  if (therapistDoc.exists()) {
    userType = "therapist";
  } else if (patientDoc.exists()) {
    userType = "patient";
  } else {
    alert("Invalid user account.");
    return;
  }

  var sid =localStorage.getItem("TherapySessions");

  const sessionSnapshot = await getDoc(doc(db, "TherapySessions", userId));

  if (!sessionSnapshot.exists()) {
    alert("No therapy session associated with your account.");
    return;
  }

  const chatId = sessionSnapshot.data()?.chatId;

  if (!chatId) {
    alert("Chat session not found.");
    return;
  }

  const chat = new Chat(chatId, userType);

  document.getElementById("sendButton").addEventListener("click", () => {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();

    if (message) {
      chat.sendMessage(message);
      messageInput.value = "";
    }
  });
}
