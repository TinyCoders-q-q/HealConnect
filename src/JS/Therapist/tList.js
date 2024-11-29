import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZ5ji5QplIsXi_cTQRQHy-R5_EKtNN7bE",
  authDomain: "mentalhealthwelfareweb-49ed4.firebaseapp.com",
  projectId: "mentalhealthwelfareweb-49ed4",
  databaseURL:
    "https://mentalhealthwelfareweb-49ed4-default-rtdb.asia-southeast1.firebasedatabase.app/",
  storageBucket: "mentalhealthwelfareweb-49ed4.firebasestorage.app",
  messagingSenderId: "118820807032",
  appId: "1:118820807032:web:64ec64afcd0275af70a88d",
  measurementId: "G-ZGZ8PJQ6ZS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Fetch data for therapist
async function fetchTherapistData() {
  console.log("Initializing fetchTherapistData...");

  const user = await new Promise((resolve) => {
    onAuthStateChanged(auth, (authUser) => {
      console.log("Auth state changed:", authUser);
      resolve(authUser);
    });
  });

  if (!user) {
    console.log("No user is logged in.");
    alert("You must be logged in to view this page.");
    return;
  }

  const therapistId = user.uid;
  console.log("Logged in therapist ID:", therapistId);

  try {
    // Query for active clients
    console.log("Fetching active clients...");
    const clientQuery = query(
      collection(db, "TherapySessions"),
      where("therapistId", "==", therapistId),
      where("status", "==", "active") // Assuming "active" status indicates ongoing sessions
    );
    const clientSnapshot = await getDocs(clientQuery);

    console.log("Active clients fetched:", clientSnapshot);
    if (!clientSnapshot.empty) {
      console.log("Active clients data:", clientSnapshot.docs.map((doc) => doc.data()));
    }

    // Query for incoming client requests
    console.log("Fetching incoming client requests...");
    const incomingQuery = query(
      collection(db, "TherapySessions"),
      where("therapistId", "==", therapistId),
      where("status", "==", "pending") // Assuming "pending" status indicates incoming requests
    );
    const incomingSnapshot = await getDocs(incomingQuery);

    console.log("Incoming client requests fetched:", incomingSnapshot);
    if (!incomingSnapshot.empty) {
      console.log("Incoming client requests data:", incomingSnapshot.docs.map((doc) => doc.data()));
    }

    // Render the lists
    renderList(clientSnapshot, "therapistClients");
    renderList(incomingSnapshot, "incomingClients");

  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Render a list of items
function renderList(snapshot, elementId) {
  console.log(`Rendering list for element ID: ${elementId}`);
  const listElement = document.getElementById(elementId);
  listElement.innerHTML = ""; // Clear previous items

  if (snapshot.empty) {
    console.log(`No entries found for ${elementId}`);
    listElement.innerHTML = "<li class='list-item'>No entries found.</li>";
    return;
  }

  snapshot.forEach((doc) => {
    const data = doc.data();
    console.log(`Rendering item:`, data);
    const listItem = document.createElement("li");
    listItem.classList.add("list-item");

    // Render patient info
    listItem.textContent = `Patient ID: ${data.patientId}`;
    listElement.appendChild(listItem);
  });
}

// Initialize
console.log("Starting the application...");
fetchTherapistData();
