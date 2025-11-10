import { collection, query, orderBy, limit, getDocs, doc, addDoc, where, getDoc, updateDoc, increment, writeBatch, runTransaction, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserData, PayoutRequest, PayoutDetails, HadithData, VerseData, FavoriteItem, AnnouncementData } from '../types'; // Updated import
import { supabase } from '../supabaseClient';
import { PAYOUT_THRESHOLD } from '../constants';
import { isToday, isYesterday, calculateNewStreak } from '../utils/dateUtils'; 

import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
// Initialize Firebase Functions and Firestore
import { app } from '../firebaseConfig';

// ... firebase initialization code ...

const functions = getFunctions(app); // Get your initialized Firebase app
const db = getFirestore(app);

if (window.location.hostname === "localhost") {
  // Point the functions instance to the local emulator running on port 5001
  connectFunctionsEmulator(functions, "localhost", 5001); 
  // Optional: Connect to Firestore emulator as well
  connectFirestoreEmulator(db, "localhost", 8080);
}
/**
 * Creates a new payout request document.
 * @param userId The ID of the user.
 * @param userName The name of the user.
 * @param pointsToDeduct The number of points to deduct.
 */
export async function requestPayout(userId: string, userName: string, pointsToDeduct: number): Promise<void> {
  await addDoc(collection(db, 'payoutRequests'), {
    userId,
    userName,
    pointsAtRequest: pointsToDeduct,
    status: 'pending',
    requestDate: new Date(),
  });
}
/**
 * * Accepts a payout request, uploads proof, and updates the user's points.
 * @param requestId The ID of the request to accept.
 * @param file The screenshot file to upload.
 * @param userId The ID of the user to update points for.
 * @param pointsToDeduct The number of points to deduct.
 */
export async function acceptPayout(requestId: string, file: File, userId: string, pointsToDeduct: number): Promise<void> {
  const fileName = `${requestId}_${Date.now()}`;
  const { data, error } = await supabase.storage.from('payment-proofs').upload(fileName, file);

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);
  const paymentProofUrl = publicUrlData.publicUrl;

  // Use a transaction to safely deduct points and prevent negative values
  const userDocRef = doc(db, 'users', userId);
  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userDocRef);
    if (!userDoc.exists()) {
      throw "User document does not exist!";
    }
    const userData = userDoc.data();
    const newTotalCount = Math.max(0, userData.totalCount - pointsToDeduct);
    const newMonthCount = Math.max(0, userData.monthCount - pointsToDeduct);
    transaction.update(userDocRef, {
      totalCount: newTotalCount,
      monthCount: newMonthCount,
    });
  });

  // Update the payout request document
  const requestDocRef = doc(db, 'payoutRequests', requestId);
  await updateDoc(requestDocRef, {
    status: 'accepted',
    paymentProofUrl,
    payoutDate: new Date(),
  });
}
/**
 * Fetches the top users for the monthly leaderboard.
 * @returns An array of UserData objects.
 */
export async function getMonthlyLeaders(): Promise<UserData[]> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('monthCount', 'desc'));
  const querySnapshot = await getDocs(q);
  const leaders: UserData[] = [];
  querySnapshot.forEach((doc) => {
    leaders.push({ id: doc.id, ...doc.data() } as UserData);
  });
  return leaders;
}

/**
 * Fetches the top users for the daily leaderboard.
 * @returns An array of UserData objects.
 */
export async function getTodayLeaders(): Promise<UserData[]> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('todayCount', 'desc'));
  const querySnapshot = await getDocs(q);
  const leaders: UserData[] = [];
  querySnapshot.forEach((doc) => {
    leaders.push({ id: doc.id, ...doc.data() } as UserData);
  });
  return leaders;
}

/**
 * Fetches the top users for the all-time leaderboard.
 * @returns An array of UserData objects.
 */
export async function getAllTimeLeaders(): Promise<UserData[]> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('totalCount', 'desc'));
  const querySnapshot = await getDocs(q);
  const leaders: UserData[] = [];
  querySnapshot.forEach((doc) => {
    leaders.push({ id: doc.id, ...doc.data() } as UserData);
  });
  return leaders;
}

/**
 * Fetches all users from the database.
 * @returns An array of UserData objects.
 */
export async function getAllUsers(): Promise<UserData[]> {
  const usersRef = collection(db, 'users');
  const querySnapshot = await getDocs(usersRef);
  const allUsers: UserData[] = [];
  querySnapshot.forEach((doc) => {
    allUsers.push({ id: doc.id, ...doc.data() } as UserData);
  });
  return allUsers;
}

/**
 * Toggles the 'isBlocked' status of a user.
 * @param userId The ID of the user to block/unblock.
 * @param isBlocked The new block status.
 */
export async function toggleBlockUser(userId: string, isBlocked: boolean): Promise<void> {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, { isBlocked });
}
export async function getUsersPayouts(userId: string): Promise<PayoutRequest[]> {
  const q = query(
    collection(db, "payoutRequests"),
    where("userId", "==", userId),
    orderBy("requestDate", "desc")
  );
  const snapshot = await getDocs(q);

  const requests: PayoutRequest[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    requests.push({
      id: doc.id,
      ...data,
      status: data.status || "pending", // ✅ default to pending if missing
    } as PayoutRequest);
  });

  return requests;
}

export async function getPendingPayouts(): Promise<PayoutRequest[]> {
  const q = query(
    collection(db, "payoutRequests"),
    where("status", "==", "pending")
  );

  const snapshot = await getDocs(q);

  // Use Promise.all to fetch all user documents in parallel for better performance
  const requestsWithPayouts = await Promise.all(
    snapshot.docs.map(async (requestDoc) => {
      const requestData = requestDoc.data();
      const userDocRef = doc(db, 'users', requestData.userId);
      const userDoc = await getDoc(userDocRef);

      let payoutDetails: PayoutDetails | undefined = undefined;
      if (userDoc.exists()) {
        payoutDetails = userDoc.data().payout;
      }

      return {
        id: requestDoc.id,
        ...requestData,
        payoutDetails: payoutDetails,
      } as PayoutRequest;
    })
  );

  console.log("✅ Pending requests fetched:", requestsWithPayouts);
  return requestsWithPayouts;
}

/**
 * Rejects a payout request.
 * @param requestId The ID of the request to reject.
 * @param reason An optional reason for the rejection.
 */
export async function rejectPayout(requestId: string, reason?: string): Promise<void> {
  const requestDocRef = doc(db, 'payoutRequests', requestId);
  await updateDoc(requestDocRef, {
    status: 'rejected',
    rejectionReason: reason || '',
    payoutDate: new Date(),
  });
}

/**
 * Gets the count of pending payout requests.
 * @returns The number of pending requests.
 */
export async function getPendingPayoutsCount(): Promise<number> {
  const q = query(collection(db, 'payoutRequests'), where('status', '==', 'pending'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.size;
}
/**
 * Resets the monthly counts for all users using a batched write.
 */
export async function resetMonthlyCountsAndAnnounce(): Promise<void> {
  const usersRef = collection(db, 'users');
  const querySnapshot = await getDocs(usersRef);
  
  const batch = writeBatch(db);
  const thisMonth = new Date().toISOString().slice(0, 7);

  querySnapshot.forEach((userDoc) => {
    const userDocRef = doc(db, 'users', userDoc.id);
    batch.update(userDocRef, {
      totalCount: 0,
      todayCount: 0,
      monthCount: 0,
      lastMonthResetDate: thisMonth
    });
  });

  await batch.commit();
}
/**
 * Accepts a monthly prize payout, uploads proof, and updates the user's points.
 * @param userId The ID of the user to update.
 * @param prizePoints The points to be deducted for the prize.
 * @param prizeProofFile The screenshot file to upload.
 */
export async function acceptMonthlyPrize(userId: string, prizePoints: number, prizeProofFile: File): Promise<void> {
    const fileName = `monthly-prizes/${userId}_${Date.now()}`;
    const { data, error } = await supabase.storage.from('payment-proofs').upload(fileName, prizeProofFile);

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);
    const prizeProofUrl = publicUrlData.publicUrl;

    const userDocRef = doc(db, 'users', userId);
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) {
        throw "User document does not exist!";
      }
      const userData = userDoc.data();
      const newTotalCount = Math.max(0, userData.totalCount - prizePoints);
      const newMonthCount = Math.max(0, userData.monthCount - prizePoints);

      transaction.update(userDocRef, {
        totalCount: newTotalCount,
        monthCount: newMonthCount,
        lastPrizeProofUrl: prizeProofUrl,
        lastPrizePayoutDate: new Date(),
      });
    });
}

  /**
 * Adds or updates the Hadith of the Day.
 * @param hadith The hadith text.
 * @param urduTranslation The Urdu translation.
 * @param reference The reference for the hadith.
 */
export async function addHadithOfTheDay(hadith: string, urduTranslation: string, reference: string): Promise<void> {
  const hadithDocRef = doc(db, 'hadithOfTheDay', 'current');
  await setDoc(hadithDocRef, {
    hadith,
    urduTranslation,
    reference,
    dateAdded: new Date(),
  });
}

/**
 * Fetches the current Hadith of the Day.
 * @returns The HadithData object.
 */
export async function getHadithOfTheDay(): Promise<HadithData | null> {
  const hadithDocRef = doc(db, 'hadithOfTheDay', 'current');
  const docSnap = await getDoc(hadithDocRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as unknown as HadithData;
  }
  return null;
}

/**
 * Removes the current Hadith of the Day.
 */
export async function removeHadithOfTheDay(): Promise<void> {
  const hadithDocRef = doc(db, 'hadithOfTheDay', 'current');
  await deleteDoc(hadithDocRef);
}

/**
 * Adds or updates the Verse of the Day.
 * @param verse The verse text.
 * @param urduTranslation The Urdu translation.
 * @param reference The reference for the verse.
 */
export async function addVerseOfTheDay(verse: string, urduTranslation: string, reference: string): Promise<void> {
  const verseDocRef = doc(db, 'verseOfTheDay', 'current');
  await setDoc(verseDocRef, {
    verse,
    urduTranslation,
    reference,
    dateAdded: new Date(),
  });
}

/**
 * Fetches the current Verse of the Day.
 * @returns The VerseData object.
 */
export async function getVerseOfTheDay(): Promise<VerseData | null> {
  const verseDocRef = doc(db, 'verseOfTheDay', 'current');
  const docSnap = await getDoc(verseDocRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as unknown as VerseData;
  }
  return null;
}

/**
 * Removes the current Verse of the Day.
 */
export async function removeVerseOfTheDay(): Promise<void> {
  const verseDocRef = doc(db, 'verseOfTheDay', 'current');
  await deleteDoc(verseDocRef);
}

// --- New Functions for User Favorites ---

/**
 * Fetches all favorited Hadiths for a specific user.
 * @param userId The ID of the user.
 * @returns An array of FavoriteItem objects for Hadiths.
 */
export async function getFavoriteHadiths(userId: string): Promise<FavoriteItem[]> {
  const q = query(
    collection(db, 'favorites'),
    where('userId', '==', userId),
    where('type', '==', 'hadith'),
    orderBy('dateAdded', 'desc') // Show most recent first
  );
  const snapshot = await getDocs(q);

  const favorites: FavoriteItem[] = [];
  snapshot.forEach((doc) => {
    // Manually reconstruct the object to ensure HadithData/VerseData is nested under 'item'
    const data = doc.data();
    favorites.push({
      id: doc.id,
      userId: data.userId,
      type: data.type,
      item: data.item as HadithData, // Assuming correct type for hadith
      dateAdded: data.dateAdded.toDate(), // Convert Firestore Timestamp to Date
    } as FavoriteItem);
  });

  return favorites;
}

/**
 * Fetches all favorited Verses for a specific user.
 * @param userId The ID of the user.
 * @returns An array of FavoriteItem objects for Verses.
 */
export async function getFavoriteVerses(userId: string): Promise<FavoriteItem[]> {
  const q = query(
    collection(db, 'favorites'),
    where('userId', '==', userId),
    where('type', '==', 'verse'),
    orderBy('dateAdded', 'desc') // Show most recent first
  );
  const snapshot = await getDocs(q);

  const favorites: FavoriteItem[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    favorites.push({
      id: doc.id,
      userId: data.userId,
      type: data.type,
      item: data.item as VerseData, // Assuming correct type for verse
      dateAdded: data.dateAdded.toDate(), // Convert Firestore Timestamp to Date
    } as FavoriteItem);
  });

  return favorites;
}
export interface FavoriteItem {
  id: string; // Document ID
  userId: string;
  type: 'hadith' | 'verse';
  item: HadithData | VerseData;
  dateAdded: Date;
}

// ---------------- Referral Code Migration ----------------
/**
 * Generates a referral code for an existing user if they don't have one.
 * Returns the existing code if user already has one, or creates and returns a new one.
 */
export async function ensureUserHasReferralCode(userId: string): Promise<string> {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) {
    throw new Error('User document does not exist');
  }
  
  const userData = userDoc.data();
  
  // If user already has a referral code, return it
  if (userData.referralCode) {
    return userData.referralCode;
  }
  
  // Otherwise, generate a new code
  const code = await createReferralCodeForUser(userId);
  return code;
}

/**
 * Saves a new announcement, uploading an image to Supabase if provided.
 * @param title The announcement title.
 * @param message The announcement body text.
 * @param imageFile The optional image file to upload.
 */
export async function saveAnnouncement(title: string, message: string, imageFile: File | null): Promise<void> {
  let imageUrl: string | undefined;

  if (imageFile) {
    const fileName = `announcements/${Date.now()}_${imageFile.name}`;
    const { data, error } = await supabase.storage.from('payment-proofs').upload(fileName, imageFile);

    if (error) {
      throw error;
    }
    const { data: publicUrlData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);
    imageUrl = publicUrlData.publicUrl;
  }

  const announcementDocRef = doc(db, 'announcements', 'current');
  await setDoc(announcementDocRef, {
    title,
    message,
    imageUrl: imageUrl || null,
    dateAdded: new Date(),
  });
}

/**
 * Fetches the current active announcement.
 * @returns The active AnnouncementData object or null.
 */
export async function fetchActiveAnnouncement(): Promise<AnnouncementData | null> {
  const docRef = doc(db, 'announcements', 'current');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as AnnouncementData;
  }
  return null;
}

/**
 * Removes the current active announcement.
 */
export async function removeAnnouncement(): Promise<void> {
  const docRef = doc(db, 'announcements', 'current');
  await deleteDoc(docRef);
}

// File: services/firestore.ts (Add this new function)
// NOTE: Make sure to import the date utilities:

export async function incrementUserCount(userId: string): Promise<void> {
    const userDocRef = doc(db, 'users', userId);
    const today = new Date();
    const todayDateString = today.toISOString().slice(0, 10); // YYYY-MM-DD

    await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
            throw new Error("User document does not exist!");
        }
        
        const userData = userDoc.data() as UserData;
        let pointsToAdd = 1; // Base point for the click
        let streakBonus = 0;
        let updates: any = {};
        
        const currentLastLoginDate = userData.lastLoginDate || '';
        let newStreak = userData.streak;

        // --- 1. Daily Reset and Streak Check (Happens ONLY on the first count of the day) ---
        if (!currentLastLoginDate || !isToday(currentLastLoginDate)) {
            // Recalculate streak and reset todayCount
            newStreak = calculateNewStreak(currentLastLoginDate, userData.streak);
            updates.streak = newStreak;
            updates.lastLoginDate = todayDateString;
            updates.todayCount = 1; // Start today's count at 1 (for the current click)

            // --- 2. Streak Bonus Check ---
            const milestones = [10, 20, 30, 40, 50];
            // Ensure awardedStreaks is initialized if missing
            const awardedStreaks = userData.awardedStreaks || {};

            if (milestones.includes(newStreak) && !awardedStreaks[newStreak]) {
                streakBonus = newStreak * 10;
                pointsToAdd += streakBonus;
                
                awardedStreaks[newStreak] = true;
                updates.awardedStreaks = awardedStreaks;
                console.log(`User ${userId} earned a ${streakBonus} point bonus.`);
            }
        } else {
            // User already counted today, only increment todayCount
            updates.todayCount = increment(1);
        }
        
        // --- 3. Update Counts and Apply Bonus ---
        // totalCount and monthCount get the base click + the bonus (if any)
        updates.totalCount = increment(pointsToAdd);
        updates.monthCount = increment(pointsToAdd);

        transaction.update(userDocRef, updates);
    });
}

// ---------------- Referral System Helpers ----------------
/**
 * Generate a secure, URL-friendly referral code.
 * Uses crypto.getRandomValues for browser-safe randomness and a base62 alphabet.
 */
function generateReferralCode(length = 8) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  // Use Web Crypto API for secure randomness
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback (shouldn't run in browser): Math.random
    for (let i = 0; i < length; i++) array[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(array).map((n) => alphabet[n % alphabet.length]).join('');
}

/**
 * Create and persist a unique referral code for a user.
 * Ensures uniqueness by creating a doc in `referralCodes/{code}` mapping to userId using a transaction.
 */
export async function createReferralCodeForUser(userId: string): Promise<string> {
  // Try a few times to avoid collision
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = generateReferralCode(8);
    const codeDocRef = doc(db, 'referralCodes', code);
    try {
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(codeDocRef);
        if (snap.exists()) {
          throw new Error('collision');
        }
  // store normalized lowercase to support case-insensitive lookup later
  transaction.set(codeDocRef, { userId, createdAt: new Date(), normalized: code.toLowerCase() });
        const userDocRef = doc(db, 'users', userId);
        transaction.update(userDocRef, { referralCode: code });
      });
      return code;
    } catch (err: any) {
      if (err.message && err.message.indexOf('collision') >= 0) {
        // collision, try again
        continue;
      }
      // If transaction failed for other reasons, rethrow
      throw err;
    }
  }
  throw new Error('Failed to generate a unique referral code after multiple attempts');
}

/**
 * Apply referral when a new user signs up using a referral code.
 * NOTE: THIS FUNCTION IS DEPRECATED. The Cloud Function 'applyReferral' should be used instead
 * for a more secure and atomic operation, both on signup and manual entry.
 * REMOVED: The previous implementation of applyReferralOnSignup.
 */