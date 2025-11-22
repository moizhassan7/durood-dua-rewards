import React, { useState, useEffect, lazy, Suspense, useRef, useCallback } from 'react';
import { onAuthStateChanged, updateProfile, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { AnimatePresence } from 'framer-motion';
import { auth, db } from './firebaseConfig';
// Referrals handled client-side
import { UserData, AnnouncementData } from './types';
import { Loader } from 'lucide-react'; 
import { incrementUserCountBatch, createReferralCodeForUser, fetchActiveAnnouncement, applyReferralClient } from './services/firestore';
import BlockMessage from './components/BlockMessage';

// --- Code Splitting (Lazy Loading) ---
// Auth & Public Pages
const IndexPage = lazy(() => import('./components/pages/IndexPage'));
const LoginPage = lazy(() => import('./components/pages/LoginPage'));
const SignupPage = lazy(() => import('./components/pages/SignupPage'));

// Core User Pages
const CounterPage = lazy(() => import('./components/pages/CounterPage'));
const ProfileNavPage = lazy(() => import('./components/pages/ProfileNavPage'));
const ProfileDetailsPage = lazy(() => import('./components/pages/ProfileDetailsPage'));
const PayoutDetailsPage = lazy(() => import('./components/pages/PayoutDetailsPage'));
const SetGoalPage = lazy(() => import('./components/pages/SetGoalPage'));
const LeaderboardsPage = lazy(() => import('./components/pages/LeaderboardsPage'));
const ReferralProgramPage = lazy(() => import('./components/pages/ReferralProgramPage'));
const FavoritesPage = lazy(() => import('./components/pages/FavoritesPage'));

// Content Pages
const HadithVersePage = lazy(() => import('./components/pages/HadithVersePage'));
const QuranPage = lazy(() => import('./components/pages/QuranPage'));
const RulesRegulationsPage = lazy(() => import('./components/pages/RulesRegulationsPage'));
const MobileAppAdPage = lazy(() => import('./components/pages/MobileAppAdPage'));

// Admin Pages
const AdminPanelPage = lazy(() => import('./components/pages/AdminPanelPage'));
const UserManagementPage = lazy(() => import('./components/pages/UserManagementPage'));
const AdminPayoutsPage = lazy(() => import('./components/pages/AdminPayoutsPage'));
const MonthlyWinnersPage = lazy(() => import('./components/pages/MonthlyWinnersPage'));
const SecuritySettingsPage = lazy(() => import('./components/pages/SecuritySettingsPage'));
const SystemSettingsPage = lazy(() => import('./components/pages/SystemSettingsPage'));
const HadithPage = lazy(() => import('./components/pages/HadithPage'));
const VersePage = lazy(() => import('./components/pages/VersePage'));
const AnnouncementPage = lazy(() => import('./components/pages/AnnouncementPage'));

// Modals
const AnnouncementModal = lazy(() => import('./components/pages/AnnouncementModal'));

// Constants
const SESSION_EXPIRY_MS = 3 * 24 * 60 * 60 * 1000; // 3 Days in milliseconds

// Custom Loader Component
const CustomPageSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader className="animate-spin text-emerald-600" size={32} />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 font-medium">Loading...</p>
    </div>
);

export default function App() {
    // --- State ---
    const [user, setUser] = useState<UserData | null>(null);
    const [currentPage, setCurrentPage] = useState('index');
    const [loadingUser, setLoadingUser] = useState(true);
    
    // Counter State
    const [sessionCount, setSessionCount] = useState(0);
    const [isCooldown, setIsCooldown] = useState(false);
    const [rings, setRings] = useState<{ id: number }[]>([]);
    
    // Security & Announcements
    const [showBlockMessage, setShowBlockMessage] = useState(false);
    const [activeAnnouncement, setActiveAnnouncement] = useState<AnnouncementData | null>(null);
    const [announcementDismissed, setAnnouncementDismissed] = useState(false);
    
    // Click Batching Refs
    const [, setPendingClicks] = useState(0); // Trigger re-render if needed, though ref is main source
    const pendingClicksRef = useRef(0);
    const flushHandle = useRef<number | null>(null);
    const flushIntervalRef = useRef<number | null>(null);

    const UNBLOCK_EMAIL = 'contact@dalitask.com';
    
    const initialUserData = {
        totalCount: 0, todayCount: 0, monthCount: 0, streak: 0,
        lastLoginDate: new Date().toISOString(), lastMonthResetDate: new Date().toISOString(),
        dailyGoal: 1000, monthlyGoal: 30000,
        payout: { method: 'bank', accountName: '', accountNumber: '', cnic: '' },
        isBlocked: false,
    };

    // --- Effects ---

    // 1. Auth Listener & Data Sync & Session Expiry
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoadingUser(true);
            if (firebaseUser) {
                // --- Session Expiry Check ---
                const storedLoginTime = localStorage.getItem('loginTimestamp');
                if (storedLoginTime) {
                    const timePassed = Date.now() - parseInt(storedLoginTime, 10);
                    if (timePassed > SESSION_EXPIRY_MS) {
                        console.log('Session expired (3 days limit)');
                        await auth.signOut();
                        localStorage.removeItem('loginTimestamp');
                        setUser(null);
                        setLoadingUser(false);
                        setCurrentPage('login'); // Redirect to login on expiry
                        return;
                    }
                } else {
                    // If no timestamp exists (legacy session), set it now
                    localStorage.setItem('loginTimestamp', Date.now().toString());
                }
                // ---------------------------

                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        
                        // Security Check
                        if (userData.isBlocked) {
                            auth.signOut();
                            setShowBlockMessage(true);
                            setUser(null);
                            setCurrentPage('login');
                            setLoadingUser(false);
                            return;
                        }

                        // Reset Logic (Daily/Monthly)
                        const today = new Date().toISOString().slice(0, 10);
                        const thisMonth = new Date().toISOString().slice(0, 7);
                        let updates = {};
                        let newStreak = userData.streak || 0;
                        
                        const lastLoginDateString = userData.lastLoginDate || new Date().toISOString();
                        const lastMonthResetDateString = userData.lastMonthResetDate || new Date().toISOString();

                        if (lastLoginDateString.slice(0, 10) !== today) {
                            updates = { ...updates, todayCount: 0, lastLoginDate: today };
                            
                            const lastDate = new Date(lastLoginDateString);
                            const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
                            
                            if (lastDate.toISOString().slice(0, 10) === yesterday) {
                                newStreak += 1;
                            } else {
                                newStreak = 0;
                            }
                            updates = { ...updates, streak: newStreak };
                        }

                        if (lastMonthResetDateString.slice(0, 7) !== thisMonth) {
                            updates = { ...updates, monthCount: 0, lastMonthResetDate: thisMonth };
                        }

                        if (Object.keys(updates).length > 0) {
                            updateDoc(userDocRef, updates).catch(err => console.error("Reset update failed", err));
                        }

                        setUser({
                            id: firebaseUser.uid,
                            name: userData.name || firebaseUser.displayName || '',
                            email: firebaseUser.email || '',
                            isAdmin: userData.isAdmin || false,
                            ...userData
                        } as UserData);
                        
                        // Redirect Logic: 
                        // Only redirect if user is explicitly on Login or Signup pages.
                        // We REMOVED 'index' from here so logged-in users can see the Landing Page.
                        if (['login', 'signup'].includes(currentPage)) {
                            setCurrentPage('counter');
                        }

                    } else {
                        // User created in Auth but not Firestore yet
                        setUser({
                            id: firebaseUser.uid,
                            name: firebaseUser.displayName || '',
                            email: firebaseUser.email || '',
                            isAdmin: false,
                            ...initialUserData
                        } as UserData);
                        setCurrentPage('profile-details');
                    }
                    setLoadingUser(false);
                });
                return () => unsubscribeFirestore();
            } else {
                setUser(null);
                // Don't force login page if they are on index/signup
                if (!['index', 'signup'].includes(currentPage)) {
                   setCurrentPage('index');
                }
                setLoadingUser(false);
            }
        });
        return () => unsubscribeAuth();
    }, []); // Removed currentPage dependency to prevent loops

    // 2. Announcements
    useEffect(() => {
        const loadAnnouncement = async () => {
            if (user) {
                try {
                    const data = await fetchActiveAnnouncement();
                    setActiveAnnouncement(data);
                } catch (e) {
                    console.error("Failed to fetch announcements", e);
                }
            }
        };
        loadAnnouncement();
    }, [user]);

    // 3. Auto-Flush Clicks Interval
    useEffect(() => {
        if (!user) return;
        
        flushIntervalRef.current = window.setInterval(() => {
            flushClicks();
        }, 12000); // Flush every 12 seconds if there are pending clicks

        return () => {
            if (flushIntervalRef.current) {
                clearInterval(flushIntervalRef.current);
                flushIntervalRef.current = null;
            }
        };
    }, [user]);

    // --- Handlers ---

    const flushClicks = useCallback(async () => {
        if (!user) return;
        const n = pendingClicksRef.current;
        if (n <= 0) return;

        pendingClicksRef.current = 0;
        setPendingClicks(0);

        try {
            await incrementUserCountBatch(user.id, n);
        } catch (error) {
            console.error("Error flushing clicks:", error);
        }
    }, [user]);

    const handlePress = async () => {
        if (isCooldown || !user || user.isBlocked) return;
        
        // UI Effects
        setSessionCount(prev => prev + 1);
        const newRing = { id: Date.now() };
        setRings(prev => [...prev, newRing]);
        setTimeout(() => setRings(prev => prev.filter(r => r.id !== newRing.id)), 1000);
        
        setIsCooldown(true);
        setTimeout(() => setIsCooldown(false), 1000); // 1 second cooldown

        // Optimistic UI Update
        setUser(prev => {
            if (!prev) return null;
            return {
                ...prev,
                todayCount: (prev.todayCount || 0) + 1,
                monthCount: (prev.monthCount || 0) + 1,
                totalCount: (prev.totalCount || 0) + 1,
            } as UserData;
        });

        // Queue Click
        pendingClicksRef.current += 1;
        setPendingClicks(pendingClicksRef.current);

        // Debounce Flush
        if (flushHandle.current) clearTimeout(flushHandle.current);
        flushHandle.current = window.setTimeout(() => {
            flushClicks();
        }, 2000);
    };

    const handleLoginSuccess = async (firebaseUser: User) => {
        // Set session timestamp on login
        localStorage.setItem('loginTimestamp', Date.now().toString());

        // Check block status immediately
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().isBlocked) {
            await auth.signOut();
            setShowBlockMessage(true);
        } else {
            if (referral && referral.trim() !== '') {
                try {
                    const functions = getFunctions();
                    const applyReferralFn = httpsCallable(functions, 'applyReferral');
                    await applyReferralFn({ referralCode: referral.trim(), points: 200 });
                    localStorage.removeItem('pendingReferral');
                } catch (err) {
                    console.error('Applying referral failed', err);
                }
            }
            setCurrentPage('counter');
        }
    };

    const handleSignupSuccess = async (firebaseUser: User, name: string, referral?: string | null) => {
        // Set session timestamp on signup
        localStorage.setItem('loginTimestamp', Date.now().toString());

        await updateProfile(firebaseUser, { displayName: name });
        
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const newUserDoc = {
            name: name,
            email: firebaseUser.email,
            createdAt: new Date(),
            referredBy: null,
            referralCode: null,
            referralCount: 0,
            ...initialUserData
        };
        
        await setDoc(userDocRef, newUserDoc);

        // Generate Referral Code
        try {
            await createReferralCodeForUser(firebaseUser.uid);
        } catch (err) {
            console.error('Referral code creation failed', err);
        }

        // Apply Referral if exists
        if (referral && referral.trim() !== '') {
            try {
                await applyReferralClient(referral.trim(), firebaseUser.uid, 200);
                localStorage.removeItem('pendingReferral');
            } catch (err) {
                console.error('Applying referral failed', err);
            }
        }
        setCurrentPage('counter');
    };

    const handleLogout = async () => {
        // Flush before logout
        await flushClicks();
        await auth.signOut();
        // Clear session timestamp
        localStorage.removeItem('loginTimestamp');
        setUser(null);
        setCurrentPage('index');
        setSessionCount(0);
    };

    // --- Routing ---

    const renderContent = () => {
        if (loadingUser) return <CustomPageSpinner />;
        if (showBlockMessage) return <BlockMessage onClose={() => { setShowBlockMessage(false); setCurrentPage('login'); }} email={UNBLOCK_EMAIL} />;

        // Public Routes (Not Logged In)
        if (!user) {
            if (currentPage === 'login') return <LoginPage handleLoginSuccess={handleLoginSuccess} setCurrentPage={setCurrentPage} />;
            if (currentPage === 'signup') return <SignupPage handleSignupSuccess={handleSignupSuccess} setCurrentPage={setCurrentPage} />;
            return <IndexPage setCurrentPage={setCurrentPage} />;
        }

        // Private Routes (Logged In)
        const basePage = currentPage.split('?')[0];

        switch (basePage) {
            // Public Landing (Available to logged-in users now)
            case 'index': return <IndexPage setCurrentPage={setCurrentPage} />;

            // Core
            case 'counter': return <CounterPage user={user} setCurrentPage={setCurrentPage} setUser={handleLogout} sessionCount={sessionCount} onPress={handlePress} isCooldown={isCooldown} rings={rings} />;
            
            // Profile & Settings
            case 'profile': return <ProfileNavPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
            case 'profile-details': return <ProfileDetailsPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
            case 'payout-details': return <PayoutDetailsPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
            case 'set-goal': return <SetGoalPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
            case 'referral-program': return <ReferralProgramPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
            
            // Features
            case 'leaderboards': return <LeaderboardsPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
            case 'hadith-verse-page': return <HadithVersePage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
            case 'favorites': return <FavoritesPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} currentPage={currentPage} />;
            case 'quran': return <QuranPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
            case 'rules-regulations': return <RulesRegulationsPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
            case 'mobile-app-ad': return <MobileAppAdPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;

            // Admin Pages (Guarded)
            case 'admin': 
                return user.isAdmin ? <AdminPanelPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} /> : <CounterPage user={user} setCurrentPage={setCurrentPage} setUser={handleLogout} sessionCount={sessionCount} onPress={handlePress} isCooldown={isCooldown} rings={rings} />;
            case 'user-management': 
                return user.isAdmin ? <UserManagementPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} /> : <CounterPage user={user} setCurrentPage={setCurrentPage} setUser={handleLogout} sessionCount={sessionCount} onPress={handlePress} isCooldown={isCooldown} rings={rings} />;
            case 'payout-requests': 
                return user.isAdmin ? <AdminPayoutsPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} /> : <CounterPage user={user} setCurrentPage={setCurrentPage} setUser={handleLogout} sessionCount={sessionCount} onPress={handlePress} isCooldown={isCooldown} rings={rings} />;
            case 'monthly-winners-view': 
                return user.isAdmin ? <MonthlyWinnersPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} /> : <CounterPage user={user} setCurrentPage={setCurrentPage} setUser={handleLogout} sessionCount={sessionCount} onPress={handlePress} isCooldown={isCooldown} rings={rings} />;
            case 'security-settings': 
                return user.isAdmin ? <SecuritySettingsPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} /> : <CounterPage user={user} setCurrentPage={setCurrentPage} setUser={handleLogout} sessionCount={sessionCount} onPress={handlePress} isCooldown={isCooldown} rings={rings} />;
            case 'system-settings': 
                return user.isAdmin ? <SystemSettingsPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} /> : <CounterPage user={user} setCurrentPage={setCurrentPage} setUser={handleLogout} sessionCount={sessionCount} onPress={handlePress} isCooldown={isCooldown} rings={rings} />;
            case 'hadith-of-the-day-admin': 
                return user.isAdmin ? <HadithPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} /> : <CounterPage user={user} setCurrentPage={setCurrentPage} setUser={handleLogout} sessionCount={sessionCount} onPress={handlePress} isCooldown={isCooldown} rings={rings} />;
            case 'verse-of-the-day-admin': 
                return user.isAdmin ? <VersePage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} /> : <CounterPage user={user} setCurrentPage={setCurrentPage} setUser={handleLogout} sessionCount={sessionCount} onPress={handlePress} isCooldown={isCooldown} rings={rings} />;
            case 'announcement-admin': 
                return user.isAdmin ? <AnnouncementPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} /> : <CounterPage user={user} setCurrentPage={setCurrentPage} setUser={handleLogout} sessionCount={sessionCount} onPress={handlePress} isCooldown={isCooldown} rings={rings} />;

            // Fallback
            default: return <CounterPage user={user} setCurrentPage={setCurrentPage} setUser={handleLogout} sessionCount={sessionCount} onPress={handlePress} isCooldown={isCooldown} rings={rings} />;
        }
    };

    return (
        <>
            <AnimatePresence>
                {/* Global Announcement Modal Overlay */}
                {user && activeAnnouncement && !announcementDismissed && (
                    <Suspense fallback={null}>
                        <AnnouncementModal 
                            announcement={activeAnnouncement}
                            onClose={() => setAnnouncementDismissed(true)}
                        />
                    </Suspense>
                )}
            </AnimatePresence>
            
            <Suspense fallback={<CustomPageSpinner />}>
                {renderContent()}
            </Suspense>
        </>
    );
}
