import { useState, useEffect } from 'react';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import LoginPage from './components/pages/LoginPage';
import SignupPage from './components/pages/SignupPage';
import CounterPage from './components/pages/CounterPage';
import ProfileNavPage from './components/pages/ProfileNavPage';
import ProfileDetailsPage from './components/pages/ProfileDetailsPage';
import PayoutDetailsPage from './components/pages/PayoutDetailsPage';
import SetGoalPage from './components/pages/SetGoalPage';
import LeaderboardsPage from './components/pages/LeaderboardsPage';
import AdminPanelPage from './components/pages/AdminPanelPage';
import UserManagementPage from './components/pages/UserManagementPage';
import AdminPayoutsPage from './components/pages/AdminPayoutsPage';
import MonthlyWinnersPage from './components/pages/MonthlyWinnersPage';
import SecuritySettingsPage from './components/pages/SecuritySettingsPage';
import SystemSettingsPage from './components/pages/SystemSettingsPage';
import HadithPage from './components/pages/HadithPage';
import VersePage from './components/pages/VersePage';
import HadithVersePage from './components/pages/HadithVersePage';
import QuranPage from './components/pages/QuranPage'; // New Import
import { UserData } from './types';

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [currentPage, setCurrentPage] = useState('signup');
  const [sessionCount, setSessionCount] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);
  const [rings, setRings] = useState<{ id: number }[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);

  const initialUserData = {
    totalCount: 0,
    todayCount: 0,
    monthCount: 0,
    streak: 0,
    lastLoginDate: new Date().toISOString(),
    lastMonthResetDate: new Date().toISOString(),
    dailyGoal: 1000,
    monthlyGoal: 30000,
    payout: {
      method: 'bank',
      accountName: '',
      accountNumber: '',
      cnic: ''
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoadingUser(true);
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
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

  const handleLoginSuccess = async (firebaseUser: any) => {};

  const handleSignupSuccess = async (firebaseUser: any, name: string) => {
    await updateProfile(firebaseUser, { displayName: name });
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const newUserDoc = {
      name: name,
      email: firebaseUser.email,
      ...initialUserData,
    };
    await setDoc(userDocRef, newUserDoc);
  };

  const handlePress = async () => {
    if (isCooldown || !user) return;
    setSessionCount(prev => prev + 1);
    const newRing = { id: Date.now() };
    setRings(prev => [...prev, newRing]);
    setTimeout(() => {
      setRings(prev => prev.filter(ring => ring.id !== newRing.id));
    }, 1000);
    setIsCooldown(true);
    setTimeout(() => setIsCooldown(false), 1000);
    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, {
      totalCount: increment(1),
      todayCount: increment(1),
      monthCount: increment(1),
    });
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  const renderContent = () => {
    if (loadingUser) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <p>Loading...</p>
        </div>
      );
    }

    if (!user) {
      return currentPage === 'login'
        ? <LoginPage handleLoginSuccess={handleLoginSuccess} setCurrentPage={setCurrentPage} />
        : <SignupPage handleSignupSuccess={handleSignupSuccess} setCurrentPage={setCurrentPage} />;
    }

    switch (currentPage) {
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
      case 'quran':
        return <QuranPage user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
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
      default: // 'counter'
        return <CounterPage {...{ user, setCurrentPage, setUser: handleLogout, sessionCount, onPress: handlePress, isCooldown, rings }} />;
    }
  };

  return (
    <>
      {renderContent()}
    </>
  );
}