import React, { useState, useEffect, lazy, Suspense } from 'react';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
import { AnimatePresence } from 'framer-motion';
import { auth, db } from './firebaseConfig';
import { UserData } from './types';
import { Loader } from 'lucide-react'; 
import { incrementUserCount } from './services/firestore';

// --- Code Splitting (Lazy Loading) ---
const LoginPage = lazy(() => import('./components/pages/LoginPage'));
const SignupPage = lazy(() => import('./components/pages/SignupPage'));
const CounterPage = lazy(() => import('./components/pages/CounterPage'));
const ProfileNavPage = lazy(() => import('./components/pages/ProfileNavPage'));
const ProfileDetailsPage = lazy(() => import('./components/pages/ProfileDetailsPage'));
const PayoutDetailsPage = lazy(() => import('./components/pages/PayoutDetailsPage'));
const SetGoalPage = lazy(() => import('./components/pages/SetGoalPage'));
const LeaderboardsPage = lazy(() => import('./components/pages/LeaderboardsPage'));
const AdminPanelPage = lazy(() => import('./components/pages/AdminPanelPage'));
const UserManagementPage = lazy(() => import('./components/pages/UserManagementPage'));
const AdminPayoutsPage = lazy(() => import('./components/pages/AdminPayoutsPage'));
const MonthlyWinnersPage = lazy(() => import('./components/pages/MonthlyWinnersPage'));
const SecuritySettingsPage = lazy(() => import('./components/pages/SecuritySettingsPage'));
const SystemSettingsPage = lazy(() => import('./components/pages/SystemSettingsPage'));
const HadithPage = lazy(() => import('./components/pages/HadithPage'));
const VersePage = lazy(() => import('./components/pages/VersePage'));
const HadithVersePage = lazy(() => import('./components/pages/HadithVersePage'));
const QuranPage = lazy(() => import('./components/pages/QuranPage'));
const RulesRegulationsPage = lazy(() => import('./components/pages/RulesRegulationsPage'));
const FavoritesPage = lazy(() => import('./components/pages/FavoritesPage'));
const MobileAppAdPage = lazy(() => import('./components/pages/MobileAppAdPage'));
const BlockMessage = lazy(() => import('./components/BlockMessage'));

import AnnouncementModal from './components/pages/AnnouncementModal'; // New Import
import AnnouncementPage from './components/pages/AnnouncementPage'; // New Import
import { AnnouncementData } from './types';

// Custom Loader Component (In a real app, you'd import a dedicated file like AppLoader)
const CustomPageSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader className="animate-spin text-blue-600" size={32} />
        <p className="mt-2 text-sm text-gray-500">Loading page...</p>
    </div>
);


export default function App() {
    const [user, setUser] = useState<UserData | null>(null);
    const [currentPage, setCurrentPage] = useState('signup');
    const [sessionCount, setSessionCount] = useState(0);
    const [isCooldown, setIsCooldown] = useState(false);
    const [rings, setRings] = useState<{ id: number }[]>([]);
    const [loadingUser, setLoadingUser] = useState(true);
    const [showBlockMessage, setShowBlockMessage] = useState(false);
    const [activeAnnouncement, setActiveAnnouncement] = useState<AnnouncementData | null>(null);
    const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  

    const UNBLOCK_EMAIL = 'contact@dalitask.com';
    // ... (initialUserData definition remains the same) ...
    const initialUserData = {
        totalCount: 0, todayCount: 0, monthCount: 0, streak: 0,
        lastLoginDate: new Date().toISOString(), lastMonthResetDate: new Date().toISOString(),
        dailyGoal: 1000, monthlyGoal: 30000,
        payout: { method: 'bank', accountName: '', accountNumber: '', cnic: '' },
        isBlocked: false,
    };


    // ... (useEffect and all handler functions remain the same) ...

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoadingUser(true);
            if (firebaseUser) {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        
                        // --- SECURITY CHECK ---
                        if (userData.isBlocked) {
                            auth.signOut();
                            setShowBlockMessage(true);
                            setUser(null);
                            setCurrentPage('login');
                            setLoadingUser(false);
                            return;
                        }
                        // --- END SECURITY CHECK ---

                        const today = new Date().toISOString().slice(0, 10);
                        const thisMonth = new Date().toISOString().slice(0, 7);

                        let updates = {};
                        let newStreak = userData.streak;
                        const lastLoginDateString = userData.lastLoginDate || new Date().toISOString();
                        const lastMonthResetDateString = userData.lastMonthResetDate || new Date().toISOString();

                        if (lastLoginDateString.slice(0, 10) !== today) {
                            updates = { ...updates, todayCount: 0, lastLoginDate: today };
                            
                            const lastDate = new Date(lastLoginDateString);
                            const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
                            
                            if (lastDate.toISOString().slice(0, 10) === yesterday) {
                                newStreak = newStreak + 1;
                            } else {
                                newStreak = 0;
                            }
                            updates = { ...updates, streak: newStreak };
                        }

                        if (lastMonthResetDateString.slice(0, 7) !== thisMonth) {
                            updates = { ...updates, monthCount: 0, lastMonthResetDate: thisMonth };
                        }

                        if (Object.keys(updates).length > 0) {
                            updateDoc(userDocRef, updates).catch(error => {
                                console.error("Error updating user data: ", error);
                            });
                        }

                        setUser({
                            id: firebaseUser.uid,
                            name: userData.name || firebaseUser.displayName || '',
                            email: firebaseUser.email || '',
                            isAdmin: userData.isAdmin || false,
                            ...userData
                        } as UserData);
                    } else {
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
                setCurrentPage('login');
                setLoadingUser(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        const fetchAnnouncement = async () => {
          // Lazy load the announcement data only after user state is stable
          const { fetchActiveAnnouncement } = await import('./services/firestore');
          const announcementData = await fetchActiveAnnouncement();
          setActiveAnnouncement(announcementData);
        };
        if (user) {
            fetchAnnouncement();
        }
      }, [user]);

    const handleLoginSuccess = async (firebaseUser: any) => {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.isBlocked) {
                await auth.signOut();
                setShowBlockMessage(true);
                return;
            }
        }
    };

    const handleSignupSuccess = async (firebaseUser: any, name: string) => {
        await updateProfile(firebaseUser, { displayName: name });
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const newUserDoc = {
            name: name, email: firebaseUser.email, isBlocked: false, ...initialUserData,
        };
        await setDoc(userDocRef, newUserDoc);
    };

   const handlePress = async () => {
        if (isCooldown || !user || user.isBlocked) return;
        
        // 1. UI Effects (Immediate feedback)
        setSessionCount(prev => prev + 1);
        const newRing = { id: Date.now() };
        setRings(prev => [...prev, newRing]);
        setTimeout(() => {
            setRings(prev => prev.filter(ring => ring.id !== newRing.id));
        }, 1000);
        setIsCooldown(true);
        setTimeout(() => setIsCooldown(false), 1000);

        // 2. Database Update (Comprehensive logic handled by service)
        try {
            // Call the service function to handle counts, streak, and bonus logic atomically
            await incrementUserCount(user.id);
            // The onSnapshot listener in useEffect will automatically update the local 'user' state
        } catch (error) {
            console.error("Error updating user count and streak:", error);
            // Handle error: perhaps revert sessionCount or show a notification
        }
    };

    const handleLogout = async () => {
        await auth.signOut();
    };


    const renderContent = () => {
        // 1. Initial Authentication/Data Load Spinner
        if (loadingUser) {
            return <CustomPageSpinner />; 
        }

        if (showBlockMessage) {
            return <BlockMessage onClose={() => { setShowBlockMessage(false); setCurrentPage('login'); }} email={UNBLOCK_EMAIL} />;
        }

        if (!user) {
            return currentPage === 'login'
                ? <LoginPage handleLoginSuccess={handleLoginSuccess} setCurrentPage={setCurrentPage} />
                : <SignupPage handleSignupSuccess={handleSignupSuccess} setCurrentPage={setCurrentPage} />;
        }

        const basePage = currentPage.split('?')[0];

        switch (basePage) {
            case 'profile':
                return <ProfileNavPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
            case 'profile-details':
                return <ProfileDetailsPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
            case 'payout-details':
                return <PayoutDetailsPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
            case 'set-goal':
                return <SetGoalPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
            case 'leaderboards':
                return <LeaderboardsPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
            case 'hadith-verse-page':
                return <HadithVersePage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
            case 'favorites':
                return <FavoritesPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} currentPage={currentPage} />;
            case 'quran':
                return <QuranPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
            case 'rules-regulations':
                return <RulesRegulationsPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
            case 'mobile-app-ad':
                return <MobileAppAdPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
            
            // --- Admin Pages ---
            case 'admin':
                if (user.isAdmin) {
                    return <AdminPanelPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
                }
                return <CounterPage {...{ user, setCurrentPage, setUser: handleLogout, sessionCount, onPress: handlePress, isCooldown, rings }} />;
            case 'user-management':
                if (user.isAdmin) {
                    return <UserManagementPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
                }
                return <CounterPage {...{ user, setCurrentPage, setUser: handleLogout, sessionCount, onPress: handlePress, isCooldown, rings }} />;
            case 'payout-requests':
                if (user.isAdmin) {
                    return <AdminPayoutsPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
                }
                return <CounterPage {...{ user, setCurrentPage, setUser: handleLogout, sessionCount, onPress: handlePress, isCooldown, rings }} />;
            case 'monthly-winners-view':
                if (user.isAdmin) {
                    return <MonthlyWinnersPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
                }
                return <CounterPage {...{ user, setCurrentPage, setUser: handleLogout, sessionCount, onPress: handlePress, isCooldown, rings }} />;
            case 'hadith-of-the-day-admin':
                if (user.isAdmin) {
                    return <HadithPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
                }
                return <CounterPage {...{ user, setCurrentPage, setUser: handleLogout, sessionCount, onPress: handlePress, isCooldown, rings }} />;
            case 'verse-of-the-day-admin':
                if (user.isAdmin) {
                    return <VersePage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
                }
                return <CounterPage {...{ user, setCurrentPage, setUser: handleLogout, sessionCount, onPress: handlePress, isCooldown, rings }} />;
            case 'security-settings':
                if (user.isAdmin) {
                    return <SecuritySettingsPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
                }
                return <CounterPage {...{ user, setCurrentPage, setUser: handleLogout, sessionCount, onPress: handlePress, isCooldown, rings }} />;
            case 'system-settings':
                if (user.isAdmin) {
                    return <SystemSettingsPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
                }
                return <CounterPage {...{ user, setCurrentPage, setUser: handleLogout, sessionCount, onPress: handlePress, isCooldown, rings }} />;
            case 'announcement-admin':
                if (user.isAdmin) {
                    return <AnnouncementPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
                }
                return <CounterPage {...{ user, setCurrentPage, setUser: handleLogout, sessionCount, onPress: handlePress, isCooldown, rings }} />;
            default: // 'counter'
                return <CounterPage {...{ user, setCurrentPage, setUser: handleLogout, sessionCount, onPress: handlePress, isCooldown, rings }} />;
        }
    };

    return (
        <>
            <AnimatePresence>
                {/* Show Announcement Modal only if active, not dismissed, and user is logged in */}
                {user && activeAnnouncement && !announcementDismissed && (
                    <AnnouncementModal 
                        announcement={activeAnnouncement}
                        onClose={() => setAnnouncementDismissed(true)}
                    />
                )}
            </AnimatePresence>
            <Suspense fallback={<CustomPageSpinner />}>
                {renderContent()}
            </Suspense>
        </>
    );
}