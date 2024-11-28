import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js"; 
import { getFirestore, collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js"; 
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js"; 

// Initialize Firebase (your config)
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
const db = getFirestore(app);
const auth = getAuth(app);

class TherapistMatcher {
  // Save patient's support input to their profile
  async savePatientSupportInput(
    stressLevel,
    traumaImpact,
    discomfortLevel,
    additionalMessage
  ) {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            console.log("Saving patient support input...");
            console.log("User found, saving data for user ID:", user.uid);
            await setDoc(
              doc(db, "Patients", user.uid),
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
            console.log("Support input saved successfully for user:", user.uid);
            resolve(true);
          } catch (error) {
            console.error("Error saving support input:", error);
            reject(error);
          }
        } else {
          reject(new Error("No authenticated user"));
        }
      });
    });
  }

  // Updated method to find matching therapists based on expertise
  async findMatchingTherapists(expertiseKeywords) {
    try {
      const therapistsRef = collection(db, "Therapists");
      const therapistSnapshot = await getDocs(therapistsRef);
      const matchedTherapists = [];

      console.log("Expertise Keywords:", expertiseKeywords); // Log user input

      therapistSnapshot.forEach((doc) => {
        const therapistData = doc.data();
        const expertise = therapistData.expertise.toLowerCase(); // Ensure expertise is in lowercase

        // Check if the therapist's expertise matches any of the input keywords
        let isMatch = false;
        expertiseKeywords.forEach((keyword) => {
          const lowerKeyword = keyword.toLowerCase().trim(); // Trim to remove any unnecessary spaces
          // Ensure exact match of the expertise (using === to match the entire expertise, not partial)
          if (expertise === lowerKeyword) {
            isMatch = true;
          }
        });

        if (isMatch) {
          console.log(`Therapist matched: ${therapistData.fullName}`); // Log matched therapist
          matchedTherapists.push({
            id: doc.id,
            name: therapistData.fullName,
            expertise: therapistData.expertise,
            matchScore: 1, // Assuming full match for simplicity, adjust as needed
          });
        }
      });

      if (matchedTherapists.length === 0) {
        console.log("No therapists matched the expertise criteria.");
      }

      return matchedTherapists; // Return matched therapists
    } catch (error) {
      console.error("Error in finding matching therapists:", error);
      throw new Error("An error occurred while searching for therapists.");
    }
  }

  // Request therapy session with matched therapist
  async requestTherapySession(therapistId) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("No authenticated user");
        }

        const sessionRequestRef = doc(collection(db, "TherapySessions"));
        await setDoc(sessionRequestRef, {
          patientId: user.uid,
          therapistId: therapistId,
          status: "pending",
          requestedAt: new Date().toISOString(),
        });

        resolve(true);
      } catch (error) {
        console.error("Session request error:", error);
        reject(error);
      }
    });
  }
}

// Export the matcher for use in support.html
export default new TherapistMatcher();
