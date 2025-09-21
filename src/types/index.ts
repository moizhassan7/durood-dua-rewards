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