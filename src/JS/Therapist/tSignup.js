import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
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
const therapistDB = getFirestore(app);

const signupForm = document.getElementById("signupForm");
const submit = document.getElementById("submit");

signupForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const emailAddress = document.getElementById("emailaddress").value;
  const fullName = document.getElementById("fullname").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const citizenshipNum = document.getElementById("citizenshipNum").value;
  const licenseUrl = document.getElementById("licenseUrl").value;
  const disorderExpertise = document.getElementById("disorderExpertise").value;
  var isTherapist = false;

  try {
    if (password !== confirmPassword) {
      throw new Error("Password didn't match!");
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      emailAddress,
      password
    );
    const user = userCredential.user;

    await setDoc(doc(therapistDB, "Therapists", user.uid), {
      fullName: fullName,
      email: emailAddress,
      citizenshipid: citizenshipNum,
      license: licenseUrl,
      expertise: disorderExpertise,
      booltherapist: isTherapist,
      createdAt: new Date().toISOString(),
      userType: "Therapist",
    });

    console.log("Patient Signed Up Successfully!!");
    window.location.replace("tLogin.html");
  } catch (error) {
    console.error("Signup Failed!", error);
    errorMessage.textContent = `Signup Failed: ${error.message}`;
    errorMessage.style.display = "block";
  }
});
