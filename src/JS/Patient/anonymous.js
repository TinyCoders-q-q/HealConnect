import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDZ5ji5QplIsXi_cTQRQHy-R5_EKtNN7bE",
    authDomain: "mentalhealthwelfareweb-49ed4.firebaseapp.com",
    databaseURL: "https://mentalhealthwelfareweb-49ed4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mentalhealthwelfareweb-49ed4",
    storageBucket: "mentalhealthwelfareweb-49ed4.firebasestorage.app",
    messagingSenderId: "118820807032",
    appId: "1:118820807032:web:64ec64afcd0275af70a88d",
    measurementId: "G-ZGZ8PJQ6ZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Add Event Listener for Anonymous Login
document.getElementById("anonymousLoginBtn").addEventListener("click", async () => {
    const usernameInput = document.getElementById("usernameInput").value.trim();
    const statusMessage = document.getElementById("statusMessage");
    const errorMessage = document.getElementById("errorMessage");

    try {
        // Reset messages
        statusMessage.style.display = "none";
        errorMessage.style.display = "none";

        // Assign a default name if the input is empty
        const username = usernameInput || "User";

        // Generate a new UID for this session
        const newUID = crypto.randomUUID();

        // Authenticate anonymously
        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;

        console.log("Authenticated anonymously:", user); // Debugging info

        // Save to Firestore with the new UID and username
        const docRef = doc(db, "anonymousUsers", newUID);
        await setDoc(docRef, {
            sessionId: newUID,
            userId: user.uid,
            username: username, // Save the username
            userType: "patient",
            createdAt: new Date().toISOString(),
        });

        console.log("User saved to Firestore with username:", username);

        // Show success message
        statusMessage.textContent = `Welcome, ${username}! Redirecting...`;
        statusMessage.style.display = "block";

        // Redirect to seekHelp.html after a short delay
        setTimeout(() => {
            window.location.href = "seekHelp.html";
        }, 2000);
    } catch (error) {
        console.error("Error during anonymous login:", error);

        // Show error message
        errorMessage.textContent = `Error: ${error.message}`;
        errorMessage.style.display = "block";
    }
});