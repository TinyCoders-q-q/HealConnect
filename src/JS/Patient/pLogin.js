import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const patientDB = getFirestore(app);
const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");
const submit = document.getElementById("submit");

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const emailaddress = document.getElementById("emailaddress").value;
  const password = document.getElementById("password").value;

  try {
    const userCredentials = await signInWithEmailAndPassword(
      auth,
      emailaddress,
      password
    );
    const user = userCredentials.user;

    const userDoc = await getDoc(doc(patientDB, "Patients", user.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();

      if (userData.userType === "Patient") {
        console.log("Patient Login successful:", user);
        sessionStorage.setItem("fullName", userData.fullName);
        window.location.replace("seekHelp.html");
      } else {
        throw new Error(
          "Invalid account type. Please use the patient login page."
        );
      }
    } else {
      throw new Error("User profile not found");
    }
  } catch (error) {
    console.error("Login error:", error);
    errorMessage.textContent = `Login Failed: ${error.message}`;
    errorMessage.style.display = "block";
  }
});
