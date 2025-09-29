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

// ---------------------------------------------------
// CUSTOM DIALOG COMPONENT
// ---------------------------------------------------
interface DialogState {
    show: boolean;
    success: boolean;
    message: string;
}

const CustomDialog: React.FC<{ dialog: DialogState, onClose: () => void }> = ({ dialog, onClose }) => {
    if (!dialog.show) return null;

    const Icon = dialog.success ? CheckCircle : XCircle;
    const colorClass = dialog.success ? 'text-green-500' : 'text-red-500';
    const bgColorClass = dialog.success ? 'bg-green-50' : 'bg-red-50';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" dir="rtl">
            <div className={`w-full max-w-sm rounded-xl shadow-2xl p-6 text-center ${bgColorClass} transform transition-all`}>
                <Icon size={48} className={`mx-auto mb-4 ${colorClass}`} />
                <p className="text-lg font-semibold text-gray-800 mb-4">{dialog.message}</p>
                <button
                    onClick={onClose}
                    className={`w-full py-2 rounded-lg font-medium text-white transition-colors 
                        ${dialog.success ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                    ٹھیک ہے
                </button>
            </div>
        </div>
    );
};
// ---------------------------------------------------


const ProfileDetailsPage: React.FC<ProfileDetailsPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [displayName, setDisplayName] = useState(user.name);
  const [updatingName, setUpdatingName] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  // NEW STATE for the custom dialog
  const [dialog, setDialog] = useState<DialogState>({
    show: false,
    success: false,
    message: ''
  });

  // Function to close the dialog
  const handleCloseDialog = () => {
    setDialog({ show: false, success: false, message: '' });
  };

  // REFACTORED: Use Custom Dialog
  const handleUpdateName = async () => {
    if (!auth.currentUser || !displayName) return;
    setUpdatingName(true);
    try {
      await updateProfile(auth.currentUser, { displayName: displayName });
      const userDocRef = doc(db, 'users', user.id);
      await setDoc(userDocRef, { name: displayName }, { merge: true });
      
      setDialog({
        show: true,
        success: true,
        message: 'پروفائل کا نام کامیابی سے تبدیل کر دیا گیا ہے!',
      });
    } catch (error) {
      console.error("Error updating profile name: ", error);
      setDialog({
        show: true,
        success: false,
        message: 'پروفائل کا نام تبدیل کرنے میں کوئی مسئلہ پیش آیا۔',
      });
    } finally {
      setUpdatingName(false);
    }
  };

  // REFACTORED: Use Custom Dialog
  const handleSendVerificationEmail = async () => {
    if (!auth.currentUser) return;
    setSendingVerification(true);
    try {
      await sendEmailVerification(auth.currentUser);
      
      setDialog({
        show: true,
        success: true,
        message: 'تصدیقی ای میل بھیج دی گئی ہے۔ براہ کرم اپنا ان باکس چیک کریں۔',
      });
    } catch (error) {
      console.error("Error sending verification email: ", error);
      setDialog({
        show: true,
        success: false,
        message: 'تصدیقی ای میل بھیجنے میں کوئی مسئلہ پیش آیا۔',
      });
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
                {/* Display first letter of name */}
                <span className="text-2xl font-bold text-green-700">
                  {user.name ? user.name.charAt(0) : '؟'}
                </span>
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
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    dir="rtl"
                  >
                    {sendingVerification ? (
                      <Loader className="inline animate-spin mr-1" size={16} />
                    ) : (
                      'تصدیقی ای میل بھیجیں'
                    )}
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
                  className="w-full mt-2 bg-green-100 text-green-700 py-2 rounded-lg font-medium hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  dir="rtl"
                >
                  {updatingName ? (
                    <Loader className="animate-spin" size={20} />
                  ) : (
                    'نام تبدیل کریں'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav currentPage="profile" setCurrentPage={setCurrentPage} />
      
      {/* RENDER THE CUSTOM DIALOG */}
      <CustomDialog dialog={dialog} onClose={handleCloseDialog} />
    </div>
  );
};

export default ProfileDetailsPage;