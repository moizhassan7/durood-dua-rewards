import React, { useState } from 'react';
import { UserData } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';
import { Shield, Mail, CheckCircle, XCircle, Loader } from 'lucide-react';
import { sendEmailVerification, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

interface SecuritySettingsPageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

// ---------------------------------------------------
// CUSTOM DIALOG COMPONENT & STATE
// ---------------------------------------------------
interface NotificationState {
    show: boolean;
    success: boolean; // True for success, False for error/validation
    message: string;
}

const NotificationDialog: React.FC<{ dialog: NotificationState, onClose: () => void }> = ({ dialog, onClose }) => {
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


const SecuritySettingsPage: React.FC<SecuritySettingsPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  
  // Local form validation error state (kept for immediate feedback below inputs)
  const [formError, setFormError] = useState<string | null>(null); 
  
  // NEW STATE for custom dialog notifications
  const [notification, setNotification] = useState<NotificationState>({
      show: false,
      success: false,
      message: ''
  });

  const handleCloseNotification = () => {
      setNotification({ show: false, success: false, message: '' });
  };


  // REFACTORED: Use Custom Dialog for success/failure
  const handleUpdatePassword = async () => {
    setFormError(null);

    if (newPassword !== confirmPassword) {
      setFormError('نیا پاس ورڈ اور تصدیقی پاس ورڈ ایک جیسے نہیں ہیں۔');
      return;
    }
    if (!auth.currentUser || !oldPassword || !newPassword) {
      setFormError('براہ کرم تمام فیلڈز پُر کریں۔');
      return;
    }

    setPasswordLoading(true);

    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, oldPassword);
      
      // Step 1: Re-authenticate user (required for sensitive operations like password change)
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Step 2: Update password
      await updatePassword(auth.currentUser, newPassword);
      
      // Show Success Dialog
      setNotification({
          show: true,
          success: true,
          message: 'پاس ورڈ کامیابی سے تبدیل ہو گیا ہے۔'
      });
      
      // Clear fields
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err: any) {
      console.error("Error updating password: ", err);
      
      let errorMessage = 'پاس ورڈ تبدیل کرنے میں کوئی مسئلہ پیش آیا۔';
      if (err.code === 'auth/wrong-password') {
        errorMessage = 'آپ کا موجودہ پاس ورڈ غلط ہے۔';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'نیا پاس ورڈ بہت کمزور ہے۔ براہ کرم مضبوط پاس ورڈ استعمال کریں۔';
      }
      
      // Show Error Dialog
      setNotification({
          show: true,
          success: false,
          message: errorMessage
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // REFACTORED: Use Custom Dialog for verification status
  const handleSendVerificationEmail = async () => {
    if (!auth.currentUser) return;
    setVerificationLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      
      // Show Success Dialog
      setNotification({
          show: true,
          success: true,
          message: 'تصدیقی ای میل کامیابی سے بھیج دی گئی ہے۔ براہ کرم اپنا ان باکس چیک کریں۔'
      });
      
    } catch (error) {
      console.error("Error sending verification email: ", error);
      
      // Show Error Dialog
      setNotification({
          show: true,
          success: false,
          message: 'تصدیقی ای میل بھیجنے میں کوئی مسئلہ پیش آیا۔'
      });
    } finally {
      setVerificationLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav
        title="امنیت کے انتظامات"
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
        showBackButton={true}
        backAction={() => setCurrentPage('admin')}
      />
      <div className="flex-grow pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto">
          {/* Email Verification Status */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4 text-lg" dir="rtl">ای میل کی توثیق</h3>
            <div className="flex items-center space-x-2" dir="rtl">
              {auth.currentUser?.emailVerified ? (
                <CheckCircle size={20} className="text-green-500" />
              ) : (
                <XCircle size={20} className="text-red-500" />
              )}
              <span className={`text-sm ${auth.currentUser?.emailVerified ? 'text-green-500' : 'text-red-500'}`}>
                {auth.currentUser?.emailVerified ? 'ای میل کی تصدیق ہو گئی ہے' : 'ای میل کی تصدیق نہیں ہوئی'}
              </span>
            </div>
            {!auth.currentUser?.emailVerified && (
              <button
                onClick={handleSendVerificationEmail}
                disabled={verificationLoading}
                className="mt-4 w-full bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                dir="rtl"
              >
                {verificationLoading ? (
                    <>
                        <Loader className="animate-spin ml-2" size={18} />
                        <span>بھیجا جا رہا ہے...</span>
                    </>
                ) : (
                    'تصدیقی ای میل دوبارہ بھیجیں'
                )}
              </button>
            )}
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4 text-lg" dir="rtl">پاس ورڈ تبدیل کریں</h3>
            <div className="space-y-4" dir="rtl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">موجودہ پاس ورڈ</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right"
                  placeholder="********"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نیا پاس ورڈ</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right"
                  placeholder="********"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">پاس ورڈ کی تصدیق کریں</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right"
                  placeholder="********"
                />
              </div>
              {/* Using local formError for immediate feedback */}
              {formError && <p className="text-sm text-red-500 mt-2">{formError}</p>} 
              
              <button
                onClick={handleUpdatePassword}
                disabled={passwordLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {passwordLoading ? (
                  <>
                    <Loader className="animate-spin ml-2" size={18} />
                    <span>محفوظ ہو رہا ہے...</span>
                  </>
                ) : (
                  'پاس ورڈ تبدیل کریں'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <BottomNav currentPage="admin" setCurrentPage={setCurrentPage} />
      
      {/* RENDER THE CUSTOM DIALOG */}
      <NotificationDialog dialog={notification} onClose={handleCloseNotification} />
    </div>
  );
};

export default SecuritySettingsPage;