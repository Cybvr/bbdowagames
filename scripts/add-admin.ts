import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addAdmin(email: string) {
  const userDocId = email.replace(/[@.]/g, "_");
  const userRef = doc(db, "users", userDocId);
  
  const [localPart] = email.split("@");
  const name = localPart
    .split(".")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const userData = {
    name: name,
    email: email,
    role: "admin",
    totalPoints: 0,
    createdAt: new Date(), // using local date since serverTimestamp() might be tricky in some script contexts but usually works
  };

  try {
    await setDoc(userRef, userData, { merge: true });
    console.log(`Successfully added/updated user ${email} as admin.`);
  } catch (error) {
    console.error("Error adding admin:", error);
  }
}

const targetEmail = "jide.pinheiro@bbdowestafrica.com";
addAdmin(targetEmail).then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
