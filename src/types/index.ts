export interface UserData {
  id: string;
  name: string;
  email: string;
  totalCount: number;
  todayCount: number;
  monthCount: number;
  streak: number;
  payout: PayoutDetails;
  lastLoginDate: string;      // New field
  lastMonthResetDate: string; // New field
  dailyGoal: number; // New field
  monthlyGoal: number; // New field
  isBlocked?: boolean; 
  isAdmin?: boolean;
  awardedStreaks: { [key: number]: boolean }; // e.g., { 10: true, 20: false, ... }
}
export interface PayoutDetails {
  method: string;
  accountName: string;
  accountNumber: string;
  cnic: string;
}
export interface RewardBannerData {
  id: number;
  title: string;
  description: string;
  bg: string;
  border: string;
}
export interface PayoutRequest {
  id: string;
  userId: string;
  userName: string;
  pointsAtRequest: number;
  status: 'pending' | 'accepted' | 'rejected';
  requestDate: Date;
  rejectionReason?: string;
  paymentProofUrl?: string;
  payoutDetails?: PayoutDetails; // New field
  payoutDate?: Date;
}

export interface HadithData {
  hadith: string;
  urduTranslation: string;
  reference: string;
  dateAdded: Date;
}

export interface VerseData {
  verse: string;
  urduTranslation: string;
  reference: string;
  dateAdded: Date;
}




// Types for Asma ul Husna and Asma ul Nabi data
export interface AsmaData {
  id: number;
  arabic: string;
  urduTranslation: string;
  englishTranslation: string;
}


// New interfaces for Quran data from CDN
export interface QuranVerse {
  id: number;
  text: string;
  translation: string;
}

export interface QuranChapterData {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: string;
  total_verses: number;
  verses: QuranVerse[];
}

export interface QuranChapterNames {
  id: number;
  name: string;
  transliteration: string;
  type: string;
  total_verses: number;
  link: string;
}

export interface AnnouncementData {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  dateAdded: Date;
}