import { useState, useEffect } from 'react';
import { ChevronRight, CreditCard, Loader, LogOut, Trophy, Settings, Mail, CheckCircle, XCircle, User, Target } from 'lucide-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { updateProfile, sendEmailVerification } from 'firebase/auth';
import { db, auth } from '../../firebaseConfig';
import { UserData, PayoutDetails } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';

interface ProfilePageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [payoutDetails, setPayoutDetails] = useState<PayoutDetails>({
    accountName: '',
    accountNumber: '',
    cnic: '',
    method: 'bank'
  });
  const [displayName, setDisplayName] = useState(user.name);
  const [loading, setLoading] = useState(true);
  const [updatingName, setUpdatingName] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  useEffect(() => {
    const fetchPayoutDetails = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      const userDocRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.payout) {
          setPayoutDetails(userData.payout as PayoutDetails);
        }
      }
      setLoading(false);
    };

    fetchPayoutDetails();
  }, [user]);

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

  const handleSaveDetails = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const userDocRef = doc(db, 'users', user.id);
      await setDoc(userDocRef, {
        payout: payoutDetails,
      }, { merge: true });

      alert('تفصیلات محفوظ کر دی گئیں!');
      setLoading(false);
    } catch (error) {
      console.error("Error saving payout details: ", error);
      alert('تفصیلات محفوظ کرنے میں کوئی مسئلہ پیش آیا۔');
    } finally {
      setLoading(false);
    }
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <>
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
          </>
        );

      case 'bank-details':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 mb-3" dir="rtl">انعامات وصول کرنے کا طریقہ</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['bank', 'easypaisa', 'jazzcash'].map((method) => (
                <button
                  key={method}
                  onClick={() => setPayoutDetails({ ...payoutDetails, method })}
                  className={`py-2 rounded-lg text-sm font-medium ${
                    payoutDetails.method === method
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  dir="rtl"
                >
                  {method === 'bank' ? 'بینک' :
                   method === 'easypaisa' ? 'ایزی پیسا' : 'جazzCash'}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" dir="rtl">
                  اکاؤنٹ ہولڈر کا نام
                </label>
                <input
                  type="text"
                  value={payoutDetails.accountName}
                  onChange={(e) => setPayoutDetails({...payoutDetails, accountName: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="محمد احمد"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" dir="rtl">
                  اکاؤنٹ نمبر / موبائل نمبر
                </label>
                <input
                  type="text"
                  value={payoutDetails.accountNumber}
                  onChange={(e) => setPayoutDetails({...payoutDetails, accountNumber: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder={payoutDetails.method === 'bank' ? 'XXXX-XXXX-XXXX-1234' : '0300-XXXXXXX'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" dir="rtl">
                  شناختی کارڈ نمبر (CNIC)
                </label>
                <input
                  type="text"
                  value={payoutDetails.cnic}
                  onChange={(e) => setPayoutDetails({...payoutDetails, cnic: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="XXXXX-XXXXXXX-X"
                />
              </div>
            </div>
            <button
              onClick={handleSaveDetails}
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader className="animate-spin" size={24} /> : 'تفصیلات محفوظ کریں'}
            </button>
          </div>
        );

      case 'set-goal':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 mb-3" dir="rtl">اپنا مقصد طے کریں</h3>
            <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-600" dir="rtl">
              <p>یہاں آپ اپنے روزانہ یا ماہانہ دُرود پاک کا مقصد طے کر سکتے ہیں۔</p>
              <p className="mt-2">فیچر ابھی شامل کیا جا رہا ہے۔</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav
        title="پروفائل سیٹنگز"
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
      />
      <div className="flex-grow pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h1 className="text-xl font-bold text-gray-900 mb-6" dir="rtl">پروفائل</h1>

            <div className="space-y-4 mb-6">
              {[
                { id: 'profile', label: 'پروفائل', icon: User },
                { id: 'bank-details', label: 'بینک تفصیلات', icon: CreditCard },
                { id: 'set-goal', label: 'روزانہ / ماہانہ مقصد', icon: Target },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  dir="rtl"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={20} className="ml-2" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={20} />
                </button>
              ))}
            </div>

            {renderSectionContent()}
          </div>

          <div className="flex flex-col items-center mt-6 space-y-4">
            <button
              onClick={handleLogout}
              className="w-full max-w-sm bg-red-100 text-red-700 py-3 rounded-lg font-medium hover:bg-red-200 transition-colors"
            >
              <LogOut className="inline-block mr-2" size={18} />
              لاگ آؤٹ
            </button>
            <p className="text-xs text-gray-400" dir="ltr">
              Developed by Moiz Hassan
            </p>
          </div>
        </div>
      </div>
      <BottomNav currentPage="profile" setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default ProfilePage;