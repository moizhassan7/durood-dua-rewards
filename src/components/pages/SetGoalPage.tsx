import { useState, useEffect } from 'react';
import { Target, Loader } from 'lucide-react';
import { UserData } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface SetGoalPageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

const SetGoalPage: React.FC<SetGoalPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [dailyGoal, setDailyGoal] = useState(user.dailyGoal || 1000);
  const [monthlyGoal, setMonthlyGoal] = useState(user.monthlyGoal || 30000);
  const [loading, setLoading] = useState(false);

  const handleSaveGoals = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.id);
      await setDoc(userDocRef, { dailyGoal, monthlyGoal }, { merge: true });
      alert('مقاصد محفوظ کر دیے گئے ہیں۔');
      setCurrentPage('profile');
    } catch (error) {
      console.error("Failed to save goals: ", error);
      alert('مقاصد محفوظ کرنے میں کوئی مسئلہ پیش آیا۔');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav
        title="روزانہ / ماہانہ مقصد"
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
        showBackButton={true}
        backAction={() => setCurrentPage('profile')}
      />
      <div className="flex-grow pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h3 className="font-bold text-lg mb-4 text-center" dir="rtl">اپنے اہداف طے کریں</h3>
            <p className="text-center text-sm text-gray-600 mb-6" dir="rtl">یہاں آپ اپنے روزانہ اور ماہانہ دُرود پاک کا مقصد طے کر سکتے ہیں۔</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" dir="rtl">
                  روزانہ کا مقصد
                </label>
                <input
                  type="number"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="مثال: 1000"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" dir="rtl">
                  ماہانہ کا مقصد
                </label>
                <input
                  type="number"
                  value={monthlyGoal}
                  onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="مثال: 30000"
                  dir="rtl"
                />
              </div>

              <button
                onClick={handleSaveGoals}
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin ml-2" size={18} />
                    <span>محفوظ ہو رہا ہے...</span>
                  </>
                ) : (
                  'مقاصد محفوظ کریں'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <BottomNav currentPage="profile" setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default SetGoalPage;