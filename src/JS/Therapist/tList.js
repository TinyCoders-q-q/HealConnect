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

// Fetch detailed patient information
async function fetchPatientDetails(patientId) {
  console.log("Fetching details for patient:", patientId); // Log patient ID
  try {
    const patientQuery = query(
      collection(db, "Users"),
      where("uid", "==", patientId)
    );

    const patientSnapshot = await getDocs(patientQuery);
    console.log("Patient snapshot:", patientSnapshot); // Log the snapshot

    if (!patientSnapshot.empty) {
      console.log("Patient details fetched:", patientSnapshot.docs[0].data());
      return patientSnapshot.docs[0].data();
    }
    console.log("No patient found with ID:", patientId);
    return null;
  } catch (error) {
    console.error("Error fetching patient details:", error);
    return null;
  }
}

// Render a list of patients
async function renderPatientList(snapshot, elementId) {
  console.log(`Rendering list for element ID: ${elementId}`);
  const listElement = document.getElementById(elementId);
  listElement.innerHTML = ""; // Clear previous items

  if (snapshot.empty) {
    console.log(`No entries found for ${elementId}`);
    listElement.innerHTML = "<li class='list-item'>No patients found.</li>";
    return;
  }

  // Fetch and render patient details for each session
  for (const doc of snapshot.docs) {
    const sessionData = doc.data();
    const patientDetails = await fetchPatientDetails(sessionData.patientId);

    const listItem = document.createElement("li");
    listItem.classList.add("list-item");

    // Render patient info with more details if available
    if (patientDetails) {
      listItem.innerHTML = `
        <div class="patient-info">
          <strong>Name:</strong> ${patientDetails.name || "N/A"}
          <br><strong>Patient ID:</strong> ${sessionData.patientId}
          <br><strong>Email:</strong> ${patientDetails.email || "N/A"}
        </div>
      `;
    } else {
      listItem.textContent = `Patient ID: ${sessionData.patientId}`;
    }

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
    await renderPatientList(activeClientsSnapshot, "therapistClients");
    await renderPatientList(incomingClientsSnapshot, "incomingClients");
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
