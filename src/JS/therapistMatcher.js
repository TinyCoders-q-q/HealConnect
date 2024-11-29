import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDZ5ji5QplIsXi_cTQRQHy-R5_EKtNN7bE",
  authDomain: "mentalhealthwelfareweb-49ed4.firebaseapp.com",
  projectId: "mentalhealthwelfareweb-49ed4",
  databaseURL:
    "https://mentalhealthwelfareweb-49ed4-default-rtdb.asia-southeast1.firebasedatabase.app/",
  storageBucket: "mentalhealthwelfareweb-49ed4.appspot.com",
  messagingSenderId: "118820807032",
  appId: "1:118820807032:web:64ec64afcd0275af70a88d",
  measurementId: "G-ZGZ8PJQ6ZS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

class TherapistMatcher {
  constructor() {
    this.authenticatedUser = null;

    // Get the logged-in user info on initialization
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.authenticatedUser = user;
      } else {
        this.authenticatedUser = null;
      }
    });
  }

  // Save patient's support input
  async savePatientSupportInput(
    stressLevel,
    traumaImpact,
    discomfortLevel,
    additionalMessage
  ) {
    if (!this.authenticatedUser) {
      throw new Error("No authenticated user.");
    }

    const userId = this.authenticatedUser.uid;
    const patientDocRef = doc(db, "Patients", userId);

    await setDoc(
      patientDocRef,
      {
        supportInput: {
          stressLevel,
          traumaImpact,
          discomfortLevel,
          additionalMessage,
        },
      },
      { merge: true }
    );
    console.log("Patient's support input saved.");
  }

  // Match therapists based on patient input
  async findMatchingTherapists(expertiseKeywords) {
    const therapistsRef = collection(db, "Therapists");
    const therapistsSnapshot = await getDocs(therapistsRef);

    const matchedTherapists = [];

    therapistsSnapshot.forEach((doc) => {
      const therapist = doc.data();
      const expertise = therapist.expertise.toLowerCase();

      const matches = expertiseKeywords.some((keyword) =>
        expertise.includes(keyword.toLowerCase())
      );

      if (matches) {
        matchedTherapists.push({
          id: doc.id,
          name: therapist.fullName,
          expertise: therapist.expertise,
        });
      }
    });

    return matchedTherapists;
  }

  // Request therapy session
  async requestTherapySession(therapistId) {
    if (!this.authenticatedUser) {
      throw new Error("No authenticated user.");
    }

    const patientId = this.authenticatedUser.uid;
    const chatId = `${patientId}_${therapistId}_${Date.now()}`;
    const status = "pending";

    await setDoc(doc(db, "TherapySessions", chatId), {
      patientId,
      therapistId,
      chatId,
      status,
      requestedAt: new Date().toISOString(),
    });

    console.log(`Therapy session created with chatId: ${chatId}`);
    localStorage.setItem("TherapySessions", chatId);
    return chatId;
  }
}

export default new TherapistMatcher();
