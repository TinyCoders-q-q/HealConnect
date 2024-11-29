import {
  doc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  getFirestore,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyDZ5ji5QplIsXi_cTQRQHy-R5_EKtNN7bE",
  authDomain: "mentalhealthwelfareweb-49ed4.firebaseapp.com",
  projectId: "mentalhealthwelfareweb-49ed4",
  storageBucket: "mentalhealthwelfareweb-49ed4.appspot.com",
  messagingSenderId: "118820807032",
  appId: "1:118820807032:web:64ec64afcd0275af70a88d",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export class Chat {
  constructor(chatId, userType) {
    this.chatId = chatId;
    this.userType = userType;
    this.authenticatedUser = null;

    onAuthStateChanged(auth, (user) => {
      this.authenticatedUser = user || null;
    });

    this.setupMessageListener();
  }

  async sendMessage(content) {
    if (!this.authenticatedUser) throw new Error("No authenticated user.");

    const senderId = this.authenticatedUser.uid;
    const message = { senderId, content, timestamp: new Date().toISOString() };

    const chatDocRef = doc(db, "Chats", this.chatId);
    await updateDoc(chatDocRef, {
      messages: arrayUnion(message),
    });
  }

  setupMessageListener() {
    const chatDocRef = doc(db, "Chats", this.chatId);

    onSnapshot(chatDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const chatData = docSnapshot.data();
        this.displayMessages(chatData.messages);
      } else {
        console.error(`Chat document ${this.chatId} does not exist.`);
      }
    });
  }

  displayMessages(messages) {
    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = ""; 

    messages.forEach((message) => {
      const isSender = message.senderId === this.authenticatedUser.uid;

      const messageElement = document.createElement("div");
      messageElement.classList.add("message", isSender ? "sent" : "received");
      messageElement.textContent = message.content;

      chatBox.appendChild(messageElement);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  }
}
