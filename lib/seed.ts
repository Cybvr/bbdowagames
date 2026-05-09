import { db } from "./firebase";
import { collection, doc, setDoc, getDocs, writeBatch } from "firebase/firestore";
import { games, weeklyLeaders } from "./data";
import { users as mockUsers } from "./users";

export async function seedFirestore() {
  console.log("Starting Firestore seed...");

  try {
    const batch = writeBatch(db);

    // 1. Seed Quests (Games)
    console.log("Seeding quests...");
    for (const game of games) {
      const questRef = doc(db, "quests", game.id);
      batch.set(questRef, {
        ...game,
        createdAt: new Date().toISOString(),
      });
    }

    // 2. Seed Users
    console.log("Seeding users...");
    for (const user of mockUsers) {
      // Use email as ID for easier lookup, or a slugified version
      const userDocId = user.email.replace(/[@.]/g, "_");
      const userRef = doc(db, "users", userDocId);
      batch.set(userRef, {
        ...user,
        totalPoints: 0,
        updatedAt: new Date().toISOString(),
      });
    }

    // 3. Seed Leaderboard (Current stats)
    console.log("Seeding leaderboard...");
    const leaderboardRef = doc(db, "leaderboard", "current");
    batch.set(leaderboardRef, {
      weekly: weeklyLeaders,
      updatedAt: new Date().toISOString(),
    });

    await batch.commit();
    console.log("Firestore seeded successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error seeding Firestore:", error);
    return { success: false, error };
  }
}
