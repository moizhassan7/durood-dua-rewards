import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Trophy, CreditCard, UploadCloud, Loader } from 'lucide-react';
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

const MonthlyWinnersPage: React.FC<MonthlyWinnersPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [monthlyLeaders, setMonthlyLeaders] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [payoutInProgress, setPayoutInProgress] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

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

  const handleAcceptPayout = async (winnerId: string, pointsToDeduct: number) => {
    if (!file) {
      alert('ادائیگی کا ثبوت اپ لوڈ کرنے کے لیے ایک فائل منتخب کریں۔');
      return;
    }
    
    setPayoutInProgress(winnerId);
    try {
      // Assuming a valid payout request ID exists or can be generated.
      const prizePoints = pointsToDeduct; // Use current monthCount as prize points
      await acceptMonthlyPrize(winnerId, prizePoints, file);
      alert('ادائیگی کامیابی سے مکمل ہو گئی۔');
      setFile(null); // Clear the file input
      setPayoutInProgress(null);
      await fetchWinners(); // Refresh the list
    } catch (error) {
      console.error("Failed to accept payout: ", error);
      alert('ادائیگی قبول کرنے میں کوئی مسئلہ پیش آیا۔');
      setPayoutInProgress(null);
    }
  };

  const handleAnnounceWinners = async () => {
    const confirmAnnounce = window.confirm('کیا آپ واقعی تمام صارفین کے ماہانہ پوائنٹس صفر کرنا چاہتے ہیں؟ فاتحین کے نام محفوظ رہیں گے۔');
    if (confirmAnnounce) {
      setResetting(true);
      try {
        await resetMonthlyCountsAndAnnounce();
        alert('ماہانہ پوائنٹس کامیابی سے ری سیٹ کر دیے گئے ہیں۔ نیا مقابلہ شروع ہو گیا ہے۔');
        await fetchWinners(); // Refresh the list (it will be empty/show new scores)
      } catch (error) {
        console.error("Failed to reset monthly counts: ", error);
        alert('پوائنٹس ری سیٹ کرنے میں کوئی مسئلہ پیش آیا۔');
      } finally {
        setResetting(false);
      }
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
              onClick={handleAnnounceWinners}
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
    </div>
  );
};

export default MonthlyWinnersPage;