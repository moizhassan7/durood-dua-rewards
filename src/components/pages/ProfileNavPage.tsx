import { useState, useEffect } from 'react';
import { User, CreditCard, Target, ChevronRight, LogOut, Mail, CheckCircle, XCircle, Loader, Shield } from 'lucide-react';
import { UserData, PayoutRequest } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';
import { requestPayout, getUsersPayouts } from '../../services/firestore';
import { formatNumber } from '../utils/formatters';

interface ProfileNavPageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

const PAYOUT_THRESHOLD = 30000;

// ---------------------------------------------------
// CUSTOM DIALOG COMPONENT & STATE
// ---------------------------------------------------
interface DialogState {
    show: boolean;
    success: boolean; // Indicates success or error/warning
    message: string;
}

const CustomDialog: React.FC<{ dialog: DialogState, onClose: () => void }> = ({ dialog, onClose }) => {
    if (!dialog.show) return null;

    const Icon = dialog.success ? CheckCircle : XCircle;
    const colorClass = dialog.success ? 'text-green-500' : 'text-red-500';
    const bgColorClass = dialog.success ? 'bg-green-50' : 'bg-red-50';
    const buttonClass = dialog.success ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';
    
    // Use an Exclamation mark for warnings/validation errors (optional styling change)
    const WarningIcon = Shield;
    const isWarning = !dialog.success && dialog.message.includes('درست رقم'); // Simple check for validation error

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" dir="rtl">
            <div className={`w-full max-w-sm rounded-xl shadow-2xl p-6 text-center 
                ${isWarning ? 'bg-yellow-50' : bgColorClass} transform transition-all`}>
                
                {isWarning ? (
                    <WarningIcon size={48} className="mx-auto mb-4 text-yellow-600" />
                ) : (
                    <Icon size={48} className={`mx-auto mb-4 ${colorClass}`} />
                )}
                
                <p className="text-lg font-semibold text-gray-800 mb-4">{dialog.message}</p>
                
                <button
                    onClick={onClose}
                    className={`w-full py-2 rounded-lg font-medium text-white transition-colors 
                        ${isWarning ? 'bg-yellow-600 hover:bg-yellow-700' : buttonClass}`}
                >
                    ٹھیک ہے
                </button>
            </div>
        </div>
    );
};
// ---------------------------------------------------


const ProfileNavPage: React.FC<ProfileNavPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [loadingPayouts, setLoadingPayouts] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState<number | ''>('');
  
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


  useEffect(() => {
    const fetchPayouts = async () => {
      if (!user?.id) return;
      setLoadingPayouts(true);
      try {
        const requests = await getUsersPayouts(user.id);
        setPayoutRequests(requests);
      } catch (error) {
        console.error("Failed to fetch payout requests: ", error);
      } finally {
        setLoadingPayouts(false);
      }
    };
    fetchPayouts();
  }, [user]);

  // REFACTORED: Use Custom Dialog for Payout Request
  const handlePayoutRequest = async () => {
    // 1. Input Validation Check
    if (!user || !payoutAmount || payoutAmount < PAYOUT_THRESHOLD || payoutAmount > user.totalCount) {
      setDialog({
        show: true,
        success: false, // Treat as a warning/error
        message: 'براہ کرم ادائیگی کی درست رقم داخل کریں۔ رقم کم از کم 30,000 اور آپ کے کل پوائنٹس سے زیادہ نہیں ہونی چاہیے.',
      });
      return;
    }

    setRequestingPayout(true);
    try {
      await requestPayout(user.id, user.name, payoutAmount);
      
      // Show Success Dialog
      setDialog({
        show: true,
        success: true,
        message: 'آپ کی ادائیگی کی درخواست کامیابی سے بھیج دی گئی ہے۔',
      });
      
      // Optimistically update the list
      setPayoutRequests(prev => [{
        id: 'new_temp_id', // Use a UUID generator in a real app
        userId: user.id,
        userName: user.name,
        pointsAtRequest: payoutAmount,
        status: 'pending',
        requestDate: new Date(),
      } as PayoutRequest, ...prev]);
      setPayoutAmount('');
      
    } catch (error) {
      console.error("Failed to send payout request: ", error);
      // Show Error Dialog
      setDialog({
        show: true,
        success: false,
        message: 'درخواست بھیجنے میں کوئی مسئلہ پیش آیا۔ دوبارہ کوشش کریں یا ایڈمن سے رابطہ کریں۔',
      });
    } finally {
      setRequestingPayout(false);
    }
  };

  const isPayoutDetailsComplete = user.payout.accountName && user.payout.accountNumber && user.payout.cnic;
  const hasPendingRequest = payoutRequests.some(req => req.status === 'pending');
  const canRequestPayout = 
    user.totalCount >= PAYOUT_THRESHOLD && 
    !hasPendingRequest && 
    isPayoutDetailsComplete &&
    (typeof payoutAmount === 'number' && payoutAmount >= PAYOUT_THRESHOLD && payoutAmount <= user.totalCount);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav
        title="پروفائل"
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
      />
      <div className="flex-grow pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto">
          {/* User Info Header */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-100 to-emerald-200 flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-green-700">
                    {user.name ? user.name.charAt(0) : '؟'}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900" dir="rtl">{user.name}</h2>
                <p className="text-gray-500 text-sm" dir="rtl">{user.email}</p>
              </div>
            </div>
            
            {/* Payout Request Section */}
            <div className="border-t border-gray-100 pt-4 mt-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2" dir="rtl">آپ کے پوائنٹس</h3>
              <div className="flex justify-between items-center mb-4">
                <span className="text-3xl font-bold text-green-600" dir="rtl">{formatNumber(user.totalCount)}</span>
                <span className="text-sm text-gray-500" dir="rtl">پوائنٹس</span>
              </div>
              
              {!isPayoutDetailsComplete && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4" dir="rtl">
                  <p>ادائیگی کی درخواست بھیجنے سے پہلے، براہ کرم اپنی بینک تفصیلات مکمل کریں۔</p>
                </div>
              )}

              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" dir="rtl">
                          ادائیگی کی رقم
                      </label>
                      <input
                          type="number"
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(Number(e.target.value))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder={`کم از کم ${formatNumber(PAYOUT_THRESHOLD)} پوائنٹس`}
                          min={PAYOUT_THRESHOLD}
                          max={user.totalCount}
                      />
                  </div>
              </div>
              
              <button
                onClick={handlePayoutRequest}
                disabled={!canRequestPayout || requestingPayout}
                className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center mt-4 ${
                  canRequestPayout
                    ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:opacity-90'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                dir="rtl"
              >
                {requestingPayout ? (
                  <>
                    <Loader className="animate-spin ml-2" size={18} />
                    <span>درخواست بھیجی جا رہی ہے...</span>
                  </>
                ) : hasPendingRequest ? (
                  'زیر التواء درخواست ہے'
                ) : !isPayoutDetailsComplete ? (
                  'ادائیگی کی تفصیلات مکمل کریں'
                ) : (
                  `ادائیگی کی درخواست بھیجیں`
                )}
              </button>
            </div>
          </div>

          {/* Vertical Nav Items */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="space-y-4">
              {[
                { id: 'profile-details', label: 'پروفائل', icon: User },
                { id: 'payout-details', label: 'بینک تفصیلات', icon: CreditCard },
                { id: 'set-goal', label: 'روزانہ / ماہانہ مقصد', icon: Target },
                { id: 'rules-regulations', label: 'قوانین اور پالیسیز', icon: Shield },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className="w-full flex items-center justify-between p-4 rounded-lg transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200"
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
          </div>

          {/* Payout History */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4" dir="rtl">ادائیگی کی تاریخ</h3>
            {loadingPayouts ? (
              <div className="flex justify-center py-4">
                <Loader className="animate-spin text-green-600" size={24} />
              </div>
            ) : payoutRequests.length > 0 ? (
              <ul className="space-y-3">
                {payoutRequests.map(req => (
                  <li key={req.id} className="p-3 bg-gray-50 rounded-lg flex flex-col" dir="rtl">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold text-gray-900">{formatNumber(req.pointsAtRequest)} پوائنٹس</div>
                      <div className="text-sm font-bold">
                        {req.status === 'pending' && <span className="text-orange-500">زیر التواء</span>}
                        {req.status === 'accepted' && <span className="text-green-500">قبول شدہ</span>}
                        {req.status === 'rejected' && <span className="text-red-500">مسترد شدہ</span>}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      تاریخ درخواست: {req.requestDate.toDate().toLocaleDateString('ur-PK')}
                    </div>
                    {req.status === 'accepted' && req.paymentProofUrl && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-800 mb-2">ادائیگی کا ثبوت</h4>
                        <img src={req.paymentProofUrl} alt="Payment Proof" className="w-full rounded-lg" />
                      </div>
                    )}
                    {req.status === 'rejected' && req.rejectionReason && (
                      <div className="mt-4">
                        <h4 className="font-medium text-red-600 mb-1">مسترد ہونے کی وجہ</h4>
                        <p className="text-sm text-red-500">{req.rejectionReason}</p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500" dir="rtl">کوئی درخواست نہیں ہے۔</p>
            )}
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
              Developed by Moiz Hassan. <br/>
            </p>
          </div>
        </div>
      </div>
      <BottomNav currentPage="profile" setCurrentPage={setCurrentPage} />
      
      {/* RENDER THE CUSTOM DIALOG */}
      <CustomDialog dialog={dialog} onClose={handleCloseDialog} />
    </div>
  );
};

export default ProfileNavPage;