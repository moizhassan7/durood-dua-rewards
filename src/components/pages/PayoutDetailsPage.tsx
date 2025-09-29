import { useState, useEffect } from 'react';
import { CreditCard, Loader, CheckCircle, XCircle } from 'lucide-react'; // Added XCircle for error
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { UserData, PayoutDetails } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';

interface PayoutDetailsPageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

// ---------------------------------------------------
// NEW COMPONENT: Custom Dialog/Modal
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


const PayoutDetailsPage: React.FC<PayoutDetailsPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [payoutDetails, setPayoutDetails] = useState<PayoutDetails>({
    accountName: '',
    accountNumber: '',
    cnic: '',
    method: 'bank'
  });
  const [loading, setLoading] = useState(true);
  
  // NEW STATE for the custom dialog
  const [dialog, setDialog] = useState<DialogState>({
    show: false,
    success: false,
    message: ''
  });

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
        // Use default empty object if payout is not set to prevent errors
        setPayoutDetails({ 
            ...payoutDetails, 
            ...(userData.payout as PayoutDetails) 
        });
      }
      setLoading(false);
    };

    fetchPayoutDetails();
  }, [user]);

  const handleSaveDetails = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const userDocRef = doc(db, 'users', user.id);
      await setDoc(userDocRef, {
        payout: payoutDetails,
      }, { merge: true });

      // Show Success Dialog
      setDialog({
        show: true,
        success: true,
        message: 'تفصیلات کامیابی سے محفوظ کر دی گئیں!',
      });
      
    } catch (error) {
      console.error("Error saving payout details: ", error);
      // Show Error Dialog
      setDialog({
        show: true,
        success: false,
        message: 'تفصیلات محفوظ کرنے میں کوئی مسئلہ پیش آیا۔',
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to close the dialog and handle navigation
  const handleCloseDialog = () => {
    setDialog({ show: false, success: false, message: '' });
    // Navigate to the profile page only on successful save
    if (dialog.success) {
        setCurrentPage('profile');
    }
  };


  // Custom Loader while fetching initial data
  if (loading && !dialog.show) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <Loader className="animate-spin text-green-700" size={48} />
        </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav
        title="بینک تفصیلات"
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
        showBackButton={true}
        backAction={() => setCurrentPage('profile')}
      />
      
      {/* Disable input fields while loading (saving) */}
      <div className={`flex-grow pt-16 pb-24 px-4 ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
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
                    {method === 'bank' ? 'Bank' :
                      method === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                {/* Account Name Field */}
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
                {/* Account Number Field */}
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
                {/* CNIC Field */}
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
                className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? <Loader className="animate-spin" size={24} /> : 'تفصیلات محفوظ کریں'}
              </button>
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

export default PayoutDetailsPage;