import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { Chat } from "./chat.js";

const db = getFirestore();
const rtdb = getDatabase();
const auth = getAuth();

export async function initializeChat() {
  console.log("Starting chat initialization...");
  
  try {
    const user = await new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        console.log("Auth state changed. User:", user);
        resolve(user);
      });
    });

    if (!user) {
      console.error("No authenticated user. Authentication failed.");
      alert("You need to log in to access the chat.");
      return;
    }

    console.log("Authenticated User ID:", user.uid);

    const userId = user.uid;
    let userType = null;

    console.log("Checking user type...");
    const therapistDoc = await getDoc(doc(db, "Therapists", userId));
    const patientDoc = await getDoc(doc(db, "Patients", userId));

    if (therapistDoc.exists()) {
      userType = "therapist";
      console.log("User is a therapist");
    } else if (patientDoc.exists()) {
      userType = "patient";
      console.log("User is a patient");
    } else {
      console.error("Invalid user account. No matching therapist or patient found.");
      alert("Invalid user account.");
      return;
    }

    const sessionId = localStorage.getItem("TherapySessions");
    console.log("Session ID from localStorage:", sessionId);

    if (!sessionId) {
      console.error("No therapy session associated with the account.");
      alert("No therapy session associated with your account.");
      return;
    }

    // Fetch session details from Firestore
    const sessionSnapshot = await getDoc(doc(db, "TherapySessions", sessionId));

    if (!sessionSnapshot.exists()) {
      console.error("Chat session not found in Firestore");
      alert("Chat session not found.");
      return;
    }

    const sessionData = sessionSnapshot.data();
    console.log("Session Data:", sessionData);

    const chatId = sessionData.chatId;
    const patientId = sessionData.patientId;
    const therapistId = sessionData.therapistId;

    console.log("Chat Initialization Details:", {
      chatId,
      userType,
      patientId,
      therapistId
    });

    // Initialize chat with all necessary parameters
    const chat = new Chat(chatId, userType, patientId, therapistId);

    // Setup message input and send functionality
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");

    sendButton.addEventListener("click", () => {
      console.log("Send button clicked");
      sendMessage();
    });
    messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        console.log("Enter key pressed in message input");
        sendMessage();
      }
    });

    function sendMessage() {
      const message = messageInput.value.trim();
      console.log("Attempting to send message:", message);
      if (message) {
        chat.sendMessage(message);
        messageInput.value = "";
      }
    }

    console.log("Chat initialization completed successfully");
  } catch (error) {
    console.error("Comprehensive Chat Initialization Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    alert("Failed to initialize chat. Please check console for details.");
  }
}