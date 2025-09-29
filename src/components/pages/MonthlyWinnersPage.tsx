import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Trophy, CreditCard, UploadCloud, Loader, CheckCircle, XCircle } from 'lucide-react';
import { formatNumber } from '../utils/formatters';
import { UserData } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';
import { getMonthlyLeaders, acceptMonthlyPrize, resetMonthlyCountsAndAnnounce } from '../../services/firestore'; // Import reset function

interface MonthlyWinnersPageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

const prizes = [
  { rank: 1, prize: '5000 روپے نقد', icon: '💰' },
  { rank: 2, prize: 'قرآن پاک', icon: '📖' },
  { rank: 3, prize: 'تسبیح + کاؤنٹر', icon: '📿' },
];

// ---------------------------------------------------
// CUSTOM DIALOG COMPONENTS & STATE
// ---------------------------------------------------

// 1. Notification Dialog State (for success/error/validation)
interface NotificationState {
    show: boolean;
    success: boolean; // True for success, False for error/validation
    message: string;
}

// 2. Confirmation Dialog State
interface ConfirmationState {
    show: boolean;
    action: 'reset';
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

const ConfirmationDialog: React.FC<{ 
    dialog: ConfirmationState, 
    onConfirm: () => void, 
    onCancel: () => void 
}> = ({ dialog, onConfirm, onCancel }) => {
    if (!dialog.show || dialog.action !== 'reset') return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" dir="rtl">
            <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 text-center border-2 border-rose-500">
                <Trophy size={48} className="mx-auto mb-4 text-rose-500" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">ماہانہ ری سیٹ کی تصدیق</h3>
                <p className="text-gray-700 mb-6 font-semibold">
                    کیا آپ واقعی **تمام صارفین کے ماہانہ پوائنٹس صفر کرنا چاہتے ہیں**؟
                </p>
                <p className="text-sm text-red-600 mb-6">
                    🚨 اس عمل کے بعد پچھلے ماہ کا مقابلہ ختم ہو جائے گا۔ فاتحین کو ادائیگی کی تصدیق پہلے کریں۔
                </p>
                <div className="flex justify-around space-x-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                    >
                        منسوخ کریں
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2 rounded-lg font-medium text-white transition-colors bg-rose-500 hover:bg-rose-600"
                    >
                        پوائنٹس ری سیٹ کریں
                    </button>
                </div>
            </div>
        </div>
    );
};
// ---------------------------------------------------


const MonthlyWinnersPage: React.FC<MonthlyWinnersPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [monthlyLeaders, setMonthlyLeaders] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [payoutInProgress, setPayoutInProgress] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  
  // NEW STATES
  const [notification, setNotification] = useState<NotificationState>({ show: false, success: false, message: '' });
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ show: false, action: 'reset' });

  // Notification close handler
  const handleCloseNotification = () => {
      setNotification({ show: false, success: false, message: '' });
  };
    // Confirmation handler for reset
  const handleCloseConfirmation = () => {
      setConfirmation({ show: false, action: 'reset' });
  };


  const fetchWinners = async () => {
    setLoading(true);
    try {
      const leaders = await getMonthlyLeaders();
      setMonthlyLeaders(leaders);
    } catch (error) {
      console.error("Failed to fetch monthly leaders: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinners();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // REFACTORED: Use Custom Dialog for Payout Acceptance
  const handleAcceptPayout = async (winnerId: string, pointsToDeduct: number) => {
    if (!file) {
      setNotification({
        show: true,
        success: false,
        message: 'ادائیگی کا ثبوت اپ لوڈ کرنے کے لیے ایک فائل منتخب کریں۔',
      });
      return;
    }
    
    setPayoutInProgress(winnerId);
    try {
      const prizePoints = pointsToDeduct;
      await acceptMonthlyPrize(winnerId, prizePoints, file);
      
      setNotification({
        show: true,
        success: true,
        message: 'ادائیگی کامیابی سے مکمل ہو گئی۔ فاتح کے پوائنٹس اب ڈیڈکٹ ہو جائیں گے۔',
      });
      
      setFile(null);
      setPayoutInProgress(null);
      await fetchWinners(); // Refresh the list
    } catch (error) {
      console.error("Failed to accept payout: ", error);
      setNotification({
        show: true,
        success: false,
        message: 'ادائیگی قبول کرنے میں کوئی مسئلہ پیش آیا۔',
      });
      setPayoutInProgress(null);
    }
  };
  
  // Handler to show confirmation dialog for reset
  const handleAnnounceClick = () => {
      setConfirmation({ show: true, action: 'reset' });
  };

  // REFACTORED: Confirmation handler for reset operation
  const handleAnnounceWinnersConfirm = async () => {
    // Close confirmation dialog first
    handleCloseConfirmation(); 
    
    setResetting(true);
    try {
      await resetMonthlyCountsAndAnnounce();
      
      setNotification({
        show: true,
        success: true,
        message: 'ماہانہ پوائنٹس کامیابی سے ری سیٹ کر دیے گئے ہیں۔ نیا مقابلہ شروع ہو گیا ہے۔',
      });
      
      await fetchWinners(); // Refresh the list
    } catch (error) {
      console.error("Failed to reset monthly counts: ", error);
      setNotification({
        show: true,
        success: false,
        message: 'پوائنٹس ری سیٹ کرنے میں کوئی مسئلہ پیش آیا۔',
      });
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav
        title="ماہانہ فاتحین"
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
        showBackButton={true}
        backAction={() => setCurrentPage('admin')}
      />
      <div className="flex-grow pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto">
          {/* Announce Button Block */}
          <div className="mb-6 bg-white rounded-2xl p-4 shadow-sm border border-rose-100">
            <p className="text-sm text-gray-700 mb-3" dir="rtl">
              فاتحین کو اعزاز دینے کے بعد، اگلے مقابلے کے لیے پوائنٹس ری سیٹ کریں۔
            </p>
            <button
              onClick={handleAnnounceClick} // Call handler to show confirmation
              disabled={resetting}
              className="w-full bg-rose-500 text-white py-2 rounded-lg font-medium flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {resetting ? (
                <>
                  <Loader className="animate-spin mr-2" size={20} />
                  <span>ری سیٹ کیا جا رہا ہے...</span>
                </>
              ) : (
                <span>اعلان کریں اور ری سیٹ کریں</span>
              )}
            </button>
          </div>
          
          <div className="space-y-6">
            {monthlyLeaders.length > 0 ? (
              monthlyLeaders.slice(0, 3).map((winner, index) => (
                <motion.div
                  key={winner.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100"
                >
                  <div className="flex items-center mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mr-3 ${
                      index === 0 ? 'bg-amber-500' :
                      index === 1 ? 'bg-gray-400' :
                      'bg-amber-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900" dir="rtl">{winner.name}</h3>
                      <p className="text-sm text-gray-500" dir="rtl">{formatNumber(winner.monthCount)} ماہانہ پوائنٹس</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-amber-600" dir="rtl">{prizes[index]?.prize || ''}</div>
                      <div className="text-2xl" aria-hidden="true">{prizes[index]?.icon || ''}</div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mt-4 space-y-3" dir="rtl">
                    <h4 className="font-bold text-gray-800">ادائیگی کی تفصیلات</h4>
                    <div className="text-sm text-gray-600">
                      <p><strong>طریقہ:</strong> {winner.payout?.method || 'کوئی طریقہ منتخب نہیں'}</p>
                      <p><strong>اکاؤنٹ کا نام:</strong> {winner.payout?.accountName || 'کوئی نام دستیاب نہیں'}</p>
                      <p><strong>اکاؤنٹ نمبر:</strong> {winner.payout?.accountNumber || 'کوئی نمبر دستیاب نہیں'}</p>
                      <p><strong>شناختی کارڈ نمبر:</strong> {winner.payout?.cnic || 'کوئی نمبر دستیاب نہیں'}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <label htmlFor={`file-${winner.id}`} className="block text-sm font-medium text-gray-700 mb-2">ادائیگی کا ثبوت اپ لوڈ کریں (اسکرین شاٹ)</label>
                    <input
                      id={`file-${winner.id}`}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    <button
                      onClick={() => handleAcceptPayout(winner.id, winner.monthCount)}
                      disabled={payoutInProgress === winner.id || !file}
                      className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-medium flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {payoutInProgress === winner.id ? (
                        <Loader className="animate-spin mr-2" size={20} />
                      ) : (
                        <UploadCloud className="mr-2" size={20} />
                      )}
                      <span>ادائیگی قبول کریں</span>
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="p-4 text-center text-gray-500" dir="rtl">کوئی فاتحین موجود نہیں ہیں۔</p>
            )}
          </div>
        </div>
      </div>
      <BottomNav currentPage="admin" setCurrentPage={setCurrentPage} />
      
      {/* RENDER CUSTOM DIALOGS */}
      <NotificationDialog dialog={notification} onClose={handleCloseNotification} />
      <ConfirmationDialog 
          dialog={confirmation}
          onConfirm={handleAnnounceWinnersConfirm}
          onCancel={handleCloseConfirmation}
      />
    </div>
  );
};

export default MonthlyWinnersPage;