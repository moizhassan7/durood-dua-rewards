import { useState, useEffect } from 'react';
import { ChevronLeft, Users, Share2, Copy, CheckCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { UserData } from '../../types';
import { ensureUserHasReferralCode } from '../../services/firestore';
// Removed: import { applyReferralOnSignup } from '../../services/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions'; // ADDED
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';

interface ReferralProgramPageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

const ReferralProgramPage: React.FC<ReferralProgramPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState<number>(0);
  const [referredBy, setReferredBy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [enteredCode, setEnteredCode] = useState<string>('');
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferralInfo = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      // Ensure existing users have a referral code (migration-on-read)
      try {
        await ensureUserHasReferralCode(user.id);
      } catch (err) {
        console.error('ensureUserHasReferralCode error:', err);
        // continue to fetch whatever data exists
      }

      const userDocRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.referralCode) setReferralCode(userData.referralCode as string);
        if (userData.referralCount) setReferralCount(userData.referralCount as number);
        if (userData.referredBy) setReferredBy(userData.referredBy as string);
      }

      setLoading(false);
    };

    fetchReferralInfo();
  }, [user]);

  const handleCopyLink = async () => {
    if (!referralCode) return;
    try {
      // Copy only the referral code, not a complex link
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
      alert('کاپی کرنے میں مسئلہ');
    }
  };

  const handleShare = () => {
    if (!referralCode) return;
    // Share the base signup link and explicitly mention the code
    const shareLink = `${window.location.origin}/signup`; // No referral parameter
    const shareText = `السلام عليكم ورحمة الله وبركاته
اپنے روزانہ کے درود و سلام کے ذکر کو میرے ساتھ جوڑیں اور ہر ماہ ہزاروں پوائنٹس اور انعام حاصل کریں!

رجسٹر کرنے کے لیے لنک پر کلک کریں: ${shareLink}

**میرا ریفرل کوڈ استعمال کریں:** ${referralCode}
کوڈ کو ریفرل پروگرام پیج پر داخل کریں تاکہ آپ کو 100 پوائنٹس مفت ملیں۔`; 
    
    if ((navigator as any).share) {
      (navigator as any).share({ 
        title: 'درود و سلام حاصل کریں',
        text: shareText, 
        url: shareLink 
      }).catch(() => {
        // Fallback
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,'_blank');
      });
    } else {
      // Direct WhatsApp link
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,'_blank');
    }
  };

  const handleApplyCode = async () => {
    if (!enteredCode || !user?.id) return;
    setApplying(true);
    setMessage(null);
    try {
      if (enteredCode.trim() === referralCode) {
        setMessage('آپ اپنا کوڈ استعمال نہیں کرسکتے');
        setApplying(false);
        return;
      }

      // --- Use the secure Cloud Function for application ---
      const functions = getFunctions();
      const applyReferralFn = httpsCallable(functions, 'applyReferral');
      
      const res = await applyReferralFn({ referralCode: enteredCode.trim(), points: 100 });
      const dataAny: any = res?.data;

      if (dataAny && dataAny.applied) {
        setMessage('ریفرل کامیاب ہو گیا! آپ اور ریفرر کو پوائنٹس مل گئے۔');
        
        // Refresh displayed data
        const userDocRef = doc(db, 'users', user.id);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.referralCode) setReferralCode(userData.referralCode as string);
          if (userData.referralCount) setReferralCount(userData.referralCount as number);
          if (userData.referredBy) setReferredBy(userData.referredBy as string);
        }
      } else {
        // Handle specific rejection reasons from the Cloud Function
        const reason = dataAny?.reason;
        let errorMsg = 'کوڈ لاگو نہیں ہوا — براہ کرم درست کوڈ چیک کریں یا پہلے ہی لاگو ہو چکا ہے۔';
        
        if (reason === 'self_referral') errorMsg = 'آپ اپنا کوڈ استعمال نہیں کرسکتے';
        else if (reason === 'already_referred') errorMsg = 'آپ کو پہلے ہی کسی نے مدعو کیا ہے';
        else if (reason === 'not-found') errorMsg = 'درست ریفرل کوڈ نہیں ملا';
        else if (reason === 'account_too_old') errorMsg = 'یہ اکاؤنٹ ریفرل کوڈ لاگو کرنے کے لیے بہت پرانا ہے';

        setMessage(errorMsg);
      }
    } catch (err) {
      console.error('applyReferral error:', err);
      setMessage('درخواست میں خرابی ہوئی۔ دوبارہ کوشش کریں۔');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav
        title="ریفرل پروگرام"
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
      />
      <div className="flex-grow pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto">
          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">ریفرل پروگرام</h1>
                <Users size={24} />
              </div>
              <p className="text-amber-100">
                دوستوں کو مدعو کریں اور دونوں 100 پوائنٹس حاصل کریں
              </p>
            </div>

            {/* Stats Card */}
            <div className="p-6">
              <div className="bg-amber-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-700" dir="rtl">آپ نے مدعو کیا</p>
                    <h2 className="text-2xl font-bold text-amber-900">{referralCount}</h2>
                    <p className="text-xs text-amber-600" dir="rtl">لوگوں کو</p>
                  </div>
                  <Users className="text-amber-700" size={32} />
                </div>
              </div>

              {/* Referral Code Section */}
              {referralCode && (
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1" dir="rtl">
                      آپ کا ریفرل کوڈ
                    </label>
                    <div className="font-mono text-lg font-bold text-gray-900 mb-2">
                      {referralCode}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCopyLink}
                        className="flex-1 flex items-center justify-center px-4 py-2 border border-amber-200 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                      >
                        {copied ? <CheckCircle size={18} className="mr-2" /> : <Copy size={18} className="mr-2" />}
                        <span dir="rtl">{copied ? 'کوڈ کاپی ہو گیا' : 'کوڈ کاپی کریں'}</span>
                      </button>
                      <button
                        onClick={handleShare}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 transition-colors"
                      >
                        <Share2 size={18} className="mr-2" />
                        <span dir="rtl">شیئر کریں</span>
                      </button>
                    </div>
                  </div>

                  {/* How it Works */}
                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4" dir="rtl">یہ کیسے کام کرتا ہے؟</h3>
                    <ol className="space-y-3" dir="rtl">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-amber-100 text-amber-700 rounded-full mr-2">1</span>
                        <p className="text-gray-600">اپنے دوستوں کو اپنا ریفرل کوڈ بھیجیں</p>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-amber-100 text-amber-700 rounded-full mr-2">2</span>
                        <p className="text-gray-600">جب وہ سائن اپ کر لیں تو ریفرل پروگرام پیج پر آپ کا کوڈ استعمال کریں</p>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-amber-100 text-amber-700 rounded-full mr-2">3</span>
                        <p className="text-gray-600">دونوں کو 100 پوائنٹس ملیں گے!</p>
                      </li>
                    </ol>
                  </div>
                </div>
              )}
 <button
                        onClick={handleApplyCode}
                        disabled={applying}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
                      >
                        {applying ? 'درخواست...' : 'لاگو کریں'}
                      </button>
              {/* Manual Referral Code Entry (for users who were referred after signup) */}
              <div className="mt-4">
                {!referredBy ? (
                  <div className="border border-gray-200 rounded-lg p-4 mb-4">
                    <label className="block text-sm font-medium text-gray-500 mb-2" dir="rtl">اپنا ریفرل کوڈ درج کریں</label>
                    <div className="flex space-x-2">
                      <input
                        value={enteredCode}
                        onChange={(e) => setEnteredCode(e.target.value)}
                        placeholder="مثال: Ab12Cd34"
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                     
                    </div>
                    {message && <p className="mt-2 text-sm text-gray-700" dir="rtl">{message}</p>}
                  </div>
                ) : (
                  <div className="border border-green-200 rounded-lg p-4 mb-4 bg-green-50">
                    <p className="text-sm text-green-800" dir="rtl">آپ کو پہلے ہی کسی نے مدعو کیا ہے</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setCurrentPage('profile')}
                className="mt-6 w-full flex items-center justify-center py-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={20} className="mr-2" />
                <span>واپس جائیں</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <BottomNav currentPage="profile" setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default ReferralProgramPage;