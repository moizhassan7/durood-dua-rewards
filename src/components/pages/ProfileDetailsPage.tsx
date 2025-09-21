import { useState, useEffect } from 'react';
import { User, Loader, Mail, CheckCircle, XCircle } from 'lucide-react';
import { updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { UserData } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';

interface ProfileDetailsPageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

const ProfileDetailsPage: React.FC<ProfileDetailsPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [displayName, setDisplayName] = useState(user.name);
  const [updatingName, setUpdatingName] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  const handleUpdateName = async () => {
    if (!auth.currentUser || !displayName) return;
    setUpdatingName(true);
    try {
      await updateProfile(auth.currentUser, { displayName: displayName });
      const userDocRef = doc(db, 'users', user.id);
      await setDoc(userDocRef, { name: displayName }, { merge: true });
      alert('پروفائل کا نام تبدیل کر دیا گیا ہے!');
    } catch (error) {
      console.error("Error updating profile name: ", error);
      alert('پروفائل کا نام تبدیل کرنے میں کوئی مسئلہ پیش آیا۔');
    } finally {
      setUpdatingName(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!auth.currentUser) return;
    setSendingVerification(true);
    try {
      await sendEmailVerification(auth.currentUser);
      alert('تصدیقی ای میل بھیج دی گئی ہے۔');
    } catch (error) {
      console.error("Error sending verification email: ", error);
      alert('تصدیقی ای میل بھیجنے میں کوئی مسئلہ پیش آیا۔');
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav
        title="پروفائل"
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
        showBackButton={true}
        backAction={() => setCurrentPage('profile')}
      />
      <div className="flex-grow pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-100 to-emerald-200 flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-green-700">م</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900" dir="rtl">{user.name}</h2>
                <p className="text-gray-500 text-sm" dir="rtl">{user.email}</p>
                <div className="flex items-center text-sm mt-1" dir="rtl">
                  {auth.currentUser?.emailVerified ? (
                    <CheckCircle size={16} className="text-green-500 ml-1" />
                  ) : (
                    <XCircle size={16} className="text-red-500 ml-1" />
                  )}
                  <span className={auth.currentUser?.emailVerified ? 'text-green-500' : 'text-red-500'}>
                    {auth.currentUser?.emailVerified ? 'ای میل کی تصدیق ہو گئی ہے' : 'ای میل کی تصدیق نہیں ہوئی'}
                  </span>
                </div>
                {!auth.currentUser?.emailVerified && (
                  <button
                    onClick={handleSendVerificationEmail}
                    disabled={sendingVerification}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    dir="rtl"
                  >
                    {sendingVerification ? 'بھیجا جا رہا ہے...' : 'تصدیقی ای میل بھیجیں'}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 mb-3" dir="rtl">ذاتی تفصیلات</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" dir="rtl">
                  مکمل نام
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="محمد احمد"
                />
                <button
                  onClick={handleUpdateName}
                  disabled={updatingName || displayName === user.name}
                  className="w-full mt-2 bg-green-100 text-green-700 py-2 rounded-lg font-medium hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  dir="rtl"
                >
                  {updatingName ? 'محفوظ ہو رہا ہے...' : 'نام تبدیل کریں'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav currentPage="profile" setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default ProfileDetailsPage;