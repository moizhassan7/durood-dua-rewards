import { useState, useEffect } from 'react';
import { CreditCard, Loader } from 'lucide-react';
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

const PayoutDetailsPage: React.FC<PayoutDetailsPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [payoutDetails, setPayoutDetails] = useState<PayoutDetails>({
    accountName: '',
    accountNumber: '',
    cnic: '',
    method: 'bank'
  });
  const [loading, setLoading] = useState(true);

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

  const handleSaveDetails = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const userDocRef = doc(db, 'users', user.id);
      await setDoc(userDocRef, {
        payout: payoutDetails,
      }, { merge: true });

      alert('تفصیلات محفوظ کر دی گئیں!');
      setCurrentPage('profile');
    } catch (error) {
      console.error("Error saving payout details: ", error);
      alert('تفصیلات محفوظ کرنے میں کوئی مسئلہ پیش آیا۔');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex-grow pt-16 pb-24 px-4">
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
          </div>
        </div>
      </div>
      <BottomNav currentPage="profile" setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default PayoutDetailsPage;