import { db } from "./firebase";
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  updateDoc,
  query, 
  where, 
  orderBy,
  addDoc,
  serverTimestamp 
} from "firebase/firestore";
import { Game, Leader } from "./data";
import { AppUser, UserRole } from "./users";
import { StoredSubmission } from "./submissions";

/**
 * QUESTS
 */
export async function fetchQuests(): Promise<Game[]> {
  const querySnapshot = await getDocs(collection(db, "quests"));
  const quests: Game[] = [];
  querySnapshot.forEach((doc) => {
    quests.push({ id: doc.id, ...doc.data() } as Game);
  });
  return quests.sort((a, b) => b.week - a.week);
}

/**
 * USERS
 */
export async function fetchUserProfile(email: string): Promise<AppUser | null> {
  const userDocId = email.replace(/[@.]/g, "_");
  const docRef = doc(db, "users", userDocId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as AppUser;
  }
  return null;
}

export async function fetchAllUsers(): Promise<AppUser[]> {
  const querySnapshot = await getDocs(collection(db, "users"));
  const users: AppUser[] = [];
  querySnapshot.forEach((doc) => {
    users.push(doc.data() as AppUser);
  });
  return users.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createUserProfile(user: AppUser) {
  const userDocId = user.email.replace(/[@.]/g, "_");
  await setDoc(doc(db, "users", userDocId), {
    ...user,
    totalPoints: 0,
    createdAt: serverTimestamp(),
  }, { merge: true });
}

export async function updateUserRole(email: string, role: UserRole) {
  const userDocId = email.replace(/[@.]/g, "_");
  const docRef = doc(db, "users", userDocId);
  await updateDoc(docRef, { role });
}

/**
 * SUBMISSIONS
 */
export async function submitQuestResponse(submission: Omit<StoredSubmission, "id" | "submittedAt">) {
  return await addDoc(collection(db, "submissions"), {
    ...submission,
    submittedAt: serverTimestamp(),
    status: "pending"
  });
}

export async function fetchUserSubmissions(email: string): Promise<StoredSubmission[]> {
  const q = query(collection(db, "submissions"), where("email", "==", email));
  const querySnapshot = await getDocs(q);
  const subs: StoredSubmission[] = [];
  querySnapshot.forEach((doc) => {
    subs.push({ id: doc.id, ...doc.data() } as StoredSubmission);
  });
  return subs;
}

/**
 * LEADERBOARD
 */
export async function fetchLeaderboard() {
  const docRef = doc(db, "leaderboard", "current");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}
