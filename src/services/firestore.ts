import { collection, query, orderBy, limit, getDocs, doc, addDoc, where, getDoc, updateDoc, increment, writeBatch, runTransaction, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserData, PayoutRequest, PayoutDetails, HadithData, VerseData, FavoriteItem, AnnouncementData } from '../types'; // Updated import
import { supabase } from '../supabaseClient';
import { PAYOUT_THRESHOLD } from '../constants';

/**
 * Creates a new payout request document.
 * @param userId The ID of the user.
 * @param userName The name of the user.
 * @param pointsToDeduct The number of points to deduct.
 */
// export async function requestPayout(userId: string, userName: string, pointsToDeduct: number): Promise<void> {
//   await addDoc(collection(db, 'payoutRequests'), {
//     userId,
//     userName,
//     pointsAtRequest: pointsToDeduct, // Use the dynamic amount
//     status: 'pending',
//     requestDate: new Date(),
//   });
// }
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
 * 
 * Accepts a payout request, uploads proof, and updates the user's points.
 * @param requestId The ID of the request to accept.
 * @param file The screenshot file to upload.
 * @param userId The ID of the user to update points for.
 * @param pointsToDeduct The number of points to deduct.
 */
// export async function acceptPayout(requestId: string, file: File, userId: string, pointsToDeduct: number): Promise<void> {
//   const fileName = `${requestId}_${Date.now()}`;
//   const { data, error } = await supabase.storage.from('payment-proofs').upload(fileName, file);

//   if (error) {
//     throw error;
//   }

//   const { data: publicUrlData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);
//   const paymentProofUrl = publicUrlData.publicUrl;

//   const requestDocRef = doc(db, 'payoutRequests', requestId);
//   await updateDoc(requestDocRef, {
//     status: 'accepted',
//     paymentProofUrl,
//     payoutDate: new Date(),
//   });

//   const userDocRef = doc(db, 'users', userId);
//   await updateDoc(userDocRef, {
//     totalCount: increment(-pointsToDeduct), // Deduct the dynamic amount
//     monthCount: increment(-pointsToDeduct), // Deduct from monthly count too
//   });
// }
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
// export async function getMonthlyLeaders(): Promise<UserData[]> {
//   const usersRef = collection(db, 'users');
//   const q = query(usersRef, orderBy('monthCount', 'desc'), limit(5));
//   const querySnapshot = await getDocs(q);
//   const leaders: UserData[] = [];
//   querySnapshot.forEach((doc) => {
//     leaders.push({ id: doc.id, ...doc.data() } as UserData);
//   });
//   return leaders;
// }

export async function getMonthlyLeaders(): Promise<UserData[]> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('monthCount', 'desc'), limit(5));
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
  const q = query(usersRef, orderBy('todayCount', 'desc'), limit(5));
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
  const q = query(usersRef, orderBy('totalCount', 'desc'), limit(5));
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
 * Creates a new payout request document.
 * @param userId The ID of the user.
 * @param userName The name of the user.
 * @param points The points the user is cashing in.
 */
// export async function requestPayout(userId: string, userName: string, points: number): Promise<void> {
//   await addDoc(collection(db, 'payoutRequests'), {
//     userId,
//     userName,
//     pointsAtRequest: points,
//     status: 'pending',
//     requestDate: new Date(),
//   });
// }
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
 * Accepts a payout request, uploads proof, and updates the user's points.
 * @param requestId The ID of the request to accept.
 * @param file The screenshot file to upload.
 * @param userId The ID of the user to update points for.
 * @param pointsToDeduct The number of points to deduct.
 */
// export async function acceptPayout(requestId: string, file: File, userId: string, pointsToDeduct: number): Promise<void> {
//   // Use a unique file name to avoid conflicts
//   const fileName = `${requestId}_${Date.now()}`;
//   const { data, error } = await supabase.storage.from('payment-proofs').upload(fileName, file);

//   if (error) {
//     throw error;
//   }

//   // Get the public URL for the uploaded file
//   const { data: publicUrlData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);
//   const paymentProofUrl = publicUrlData.publicUrl;

//   const requestDocRef = doc(db, 'payoutRequests', requestId);
//   await updateDoc(requestDocRef, {
//     status: 'accepted',
//     paymentProofUrl,
//     payoutDate: new Date(),
//   });

//   const userDocRef = doc(db, 'users', userId);
//   await updateDoc(userDocRef, {
//     totalCount: increment(-pointsToDeduct),
//     monthCount: increment(-pointsToDeduct),
//   });
// }
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