import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
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

// Fetch detailed patient information
async function fetchPatientDetails(patientId) {
  console.log("Fetching details for patient:", patientId);
  try {
    const patientQuery = query(
      collection(db, "Users"),
      where("uid", "==", patientId)
    );

    const patientSnapshot = await getDocs(patientQuery);

    if (!patientSnapshot.empty) {
      return patientSnapshot.docs[0].data();
    }
    console.log("No patient found with ID:", patientId);
    return null;
  } catch (error) {
    console.error("Error fetching patient details:", error);
    return null;
  }
}

// Start chat with a patient
async function startChat(patientId, sessionId, isNewRequest = false) {
  try {
    // Update session status
    const sessionRef = doc(db, "TherapySessions", sessionId);
    await updateDoc(sessionRef, {
      status: "active",
      lastInteraction: new Date(),
    });

    // Navigate to chat page or open chat window
    // You might want to replace this with your actual chat navigation logic
    window.location.href = `../../HTML/Patient/chat.html?patientId=${patientId}&sessionId=${sessionId}`;
  } catch (error) {
    console.error("Error starting chat:", error);
    alert("Failed to start chat. Please try again.");
  }
}

// Render a list of patients with start talking button
async function renderPatientList(snapshot, elementId, isNewRequest = false) {
  const listElement = document.getElementById(elementId);
  listElement.innerHTML = ""; // Clear previous items

  if (snapshot.empty) {
    listElement.innerHTML = `<li class='list-item'>No ${
      isNewRequest ? "incoming" : "active"
    } patients found.</li>`;
    return;
  }

  // Fetch and render patient details for each session
  for (const doc of snapshot.docs) {
    const sessionData = doc.data();
    const patientDetails = await fetchPatientDetails(sessionData.patientId);

    const listItem = document.createElement("li");
    listItem.classList.add("list-item");

    // Render patient info with start talking button
    const startTalkingButton = document.createElement("button");
    startTalkingButton.textContent = "Start Talking";
    startTalkingButton.classList.add("start-talking-btn");
    startTalkingButton.addEventListener("click", () =>
      startChat(sessionData.patientId, doc.id, isNewRequest)
    );

    // Create patient info div
    const patientInfoDiv = document.createElement("div");
    patientInfoDiv.classList.add("patient-info");

    // Populate patient info
    if (patientDetails) {
      patientInfoDiv.innerHTML = `
        <strong>Name:</strong> ${patientDetails.name || "N/A"}
        <br><strong>Patient ID:</strong> ${sessionData.patientId}
        <br><strong>Email:</strong> ${patientDetails.email || "N/A"}
      `;
    } else {
      patientInfoDiv.textContent = `Patient ID: ${sessionData.patientId}`;
    }

    // Append patient info and button to list item
    listItem.appendChild(patientInfoDiv);
    listItem.appendChild(startTalkingButton);

    listElement.appendChild(listItem);
  }
}

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
    const activeClientsQuery = query(
      collection(db, "TherapySessions"),
      where("therapistId", "==", therapistId),
      where("status", "==", "active")
    );
    const activeClientsSnapshot = await getDocs(activeClientsQuery);

    // Query for incoming client requests
    console.log("Fetching incoming client requests...");
    const incomingClientsQuery = query(
      collection(db, "TherapySessions"),
      where("therapistId", "==", therapistId),
      where("status", "==", "pending")
    );

    const incomingClientsSnapshot = await getDocs(incomingClientsQuery);

    // Render the lists
    await renderPatientList(activeClientsSnapshot, "therapistClients", false);
    await renderPatientList(incomingClientsSnapshot, "incomingClients", true);
  } catch (error) {
    console.error("Error fetching data:", error);
    // Display error message to the user
    const errorElement = document.getElementById("error-message");
    if (errorElement) {
      errorElement.textContent =
        "Failed to load patient information. Please try again later.";
    }
  }
}

// Initialize
console.log("Starting the application...");
fetchTherapistData();

// Export functions if needed for testing or external use
export { fetchTherapistData, startChat };
