import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onChildAdded,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDZ5ji5QplIsXi_cTQRQHy-R5_EKtNN7bE",
  authDomain: "mentalhealthwelfareweb-49ed4.firebaseapp.com",
  projectId: "mentalhealthwelfareweb-49ed4",
  databaseURL:
    "https://mentalhealthwelfareweb-49ed4-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "mentalhealthwelfareweb-49ed4.appspot.com",
  messagingSenderId: "118820807032",
  appId: "1:118820807032:web:64ec64afcd0275af70a88d",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export class Chat {
  constructor(chatId, userType, patientId, therapistId) {
    console.log("Chat Constructor Called with Parameters:", {
      chatId,
      userType,
      patientId,
      therapistId
    });

    this.chatId = chatId;
    this.userType = userType;
    this.patientId = patientId;
    this.therapistId = therapistId;
    this.authenticatedUser = null;

    // Track authentication state
    onAuthStateChanged(auth, (user) => {
      console.log("Auth State Changed in Chat Class:", user);
      this.authenticatedUser = user || null;
      if (user) {
        console.log("Setting up message listener for authenticated user");
        this.setupMessageListener();
      }
    });
  }

  async sendMessage(content) {
    console.log("Send Message Method Called:", { content });

    if (!this.authenticatedUser) {
      console.error("Send Message Failed: No authenticated user");
      return;
    }

    const senderId = this.authenticatedUser.uid;
    const receiverId = 
      this.userType === "patient" ? this.therapistId : this.patientId;

    console.log("Message Details:", {
      senderId,
      receiverId,
      chatId: this.chatId
    });

    const messageData = {
      senderId,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      chatId: this.chatId,
    };

    // Reference to the chat messages in Realtime Database
    const chatMessagesRef = ref(database, `chats/${this.chatId}/messages`);

    try {
      console.log("Attempting to push message to:", chatMessagesRef);
      const newMessageRef = await push(chatMessagesRef, messageData);
      console.log("Message sent successfully. Ref:", newMessageRef.key);
    } catch (error) {
      console.error("Comprehensive Error Sending Message:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      alert("Failed to send message. Please check console for details.");
    }
  }

  setupMessageListener() {
    console.log("Setting up message listener for chat:", this.chatId);
    const chatMessagesRef = ref(database, `chats/${this.chatId}/messages`);

    try {
      console.log("Listening to messages at ref:", chatMessagesRef);
      onChildAdded(
        chatMessagesRef,
        (snapshot) => {
          const message = snapshot.val();
          console.log("New message received:", message);
          console.log("Current User ID:", this.authenticatedUser.uid);
          console.log("Message Receiver ID:", message.receiverId);
          console.log("Message Sender ID:", message.senderId);

          // Only display messages for the current user
          if (message.receiverId === this.authenticatedUser.uid || 
              message.senderId === this.authenticatedUser.uid) {
            this.displayMessage(message);
          } else {
            console.log("Message not displayed - not for current user");
          }
        },
        (error) => {
          console.error("Comprehensive Listener Error:", {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
        }
      );
    } catch (error) {
      console.error("Error in message listener setup:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
  }

  displayMessage(message) {
    console.log("Displaying Message:", message);
    const chatBox = document.getElementById("chatBox");

    // Check if the message is from the current user
    const isSender = message.senderId === this.authenticatedUser.uid;

    console.log("Message Display Details:", {
      isSender,
      currentUserId: this.authenticatedUser.uid,
      messageSenderId: message.senderId
    });

    const messageElement = document.createElement("div");
    messageElement.classList.add("message", isSender ? "sent" : "received");
    messageElement.textContent = message.content;

    chatBox.appendChild(messageElement);

    // Scroll to the bottom of the chat box
    chatBox.scrollTop = chatBox.scrollHeight;

    console.log("Message displayed and chat box scrolled");
  }
}