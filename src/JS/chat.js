import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  push,
  get,
  onChildAdded,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

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
const db = getFirestore(app);  

export class Chat {
  constructor(chatId, userType) {
    console.log("Chat Constructor Called with Parameters:", {
      chatId,
      userType,
    });

    this.chatId = chatId;
    this.userType = userType;
    this.authenticatedUser = null;
    this.patientId = null;
    this.therapistId = null;

    // Track authentication state
    onAuthStateChanged(auth, async (user) => {
      console.log("Auth State Changed in Chat Class:", user);
      this.authenticatedUser = user || null;
      if (user) {
        console.log("Fetching therapy session details for authenticated user");
        await this.fetchTherapySessionDetails(user.uid);
        console.log("Setting up message listener for authenticated user");
        this.setupMessageListener();
      }
    });
  }

  async fetchTherapySessionDetails(userId) {
    const sessionsRef = collection(db, 'TherapySessions');
  
    try {
      // Create a query to find sessions where the user is either the patient or the therapist
      const q = query(sessionsRef, where('patientId', '==', userId));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const session = doc.data();
          this.patientId = session.patientId;
          this.therapistId = session.therapistId;
          console.log("Session found:", session);
        });
      } else {
        console.log("No therapy sessions found for patientId:", userId);
      }
  
      // If you also want to check for therapistId
      const q2 = query(sessionsRef, where('therapistId', '==', userId));
      const querySnapshot2 = await getDocs(q2);
  
      if (!querySnapshot2.empty) {
        querySnapshot2.forEach((doc) => {
          const session = doc.data();
          this.patientId = session.patientId;
          this.therapistId = session.therapistId;
          console.log("Session found:", session);
        });
      } else {
        console.log("No therapy sessions found for therapistId:", userId);
      }
  
    } catch (error) {
      console.error("Error fetching therapy session details:", error);
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
          if (
            message.receiverId === "2EG2RKtIpqcyMxIduxzZJAfCKT42" ||
            message.senderId === "muMjZfPcuwWIZ9pvI0mQurVpS8A3"
          ) {
            this.displayMessage(message);
          } else {
            console.log("Message not displayed - not for current user");
          }
          console.log(message.receiverId, message.senderId);
        },
        (error) => {
          console.error("Comprehensive Listener Error:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
          });
        }
      );
    } catch (error) {
      console.error("Error in message listener setup:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
  }

  // ... (rest of your methods remain unchanged)

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
      chatId: this.chatId,
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
        name: error.name,
      });
      alert("Failed to send message. Please check console for details.");
    }
  }

  displayMessage(message) {
    console.log("Displaying Message:", message);
    const chatBox = document.getElementById("chatBox");

    // Check if the message is from the current user (therapist or patient)
   const isSender = message.senderId === this.authenticatedUser.uid;

    console.log("Message Display Details:", {
      isSender,
      currentUserId: this.authenticatedUser.uid,
      messageSenderId: message.senderId,
    });

    const messageElement = document.createElement("div");
    messageElement.classList.add("message", isSender ? "sent" : "received");

    // Set the message content
    messageElement.textContent = message.content;

    chatBox.appendChild(messageElement);

    // Scroll to the bottom of the chat box
    chatBox.scrollTop = chatBox.scrollHeight;

    console.log("Message displayed and chat box scrolled");
  }
} //TODO: change chat shit
