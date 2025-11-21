import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Eye, EyeOff, Loader } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useEffect } from 'react';

interface SignupPageProps {
  // third optional argument is referral code the user entered or found in URL/localStorage
  handleSignupSuccess: (user: any, name: string, referral?: string | null) => void;
  setCurrentPage: (page: string) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ handleSignupSuccess, setCurrentPage }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingReferral, setPendingReferral] = useState<string | null>(null);
  const [manualReferral, setManualReferral] = useState<string>('');

  useEffect(() => {
    try {
      // Read referral param from URL
      const params = new URLSearchParams(window.location.search);
      const referral = params.get('referral');
      if (referral) {
        localStorage.setItem('pendingReferral', referral);
        setPendingReferral(referral);
      } else {
        const stored = localStorage.getItem('pendingReferral');
        if (stored) setPendingReferral(stored);
      }
    } catch (e) {
      // ignore in non-browser env
    }
  }, []);

  const handleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Determine referral to send: manual input takes precedence over pendingReferral
      const referralToSend = manualReferral && manualReferral.trim() !== '' ? manualReferral.trim() : pendingReferral;
      // Pass user, name and optional referral to parent
      handleSignupSuccess(userCredential.user, name, referralToSend);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('اس ای میل کا اکاؤنٹ پہلے سے موجود ہے');
      } else {
        setError('اکاؤنٹ بنانے میں کوئی مسئلہ پیش آیا');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-emerald-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">نیا اکاؤنٹ بنائیں</h1>
          <p className="text-amber-100 text-sm">درود شریف کی تعداد کے مطابق انعامات حاصل کریں</p>
        </div>
        
        <div className="p-6">
              {pendingReferral && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded text-sm text-emerald-800" dir="rtl">
                  ریفرل کوڈ ملا: <strong className="ml-2">{pendingReferral}</strong>
                  <button
                    onClick={() => { localStorage.removeItem('pendingReferral'); setPendingReferral(null); }}
                    className="mr-4 text-xs text-amber-600 hover:underline"
                  >حذف کریں</button>
                </div>
              )}
              {/* Manual referral input (optional). Manual input takes precedence over pendingReferral */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" dir="rtl">ریفرل کوڈ (اختیاری)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="اگر آپ کے پاس ریفرل کوڈ ہے تو یہاں درج کریں"
                  value={manualReferral}
                  onChange={(e) => setManualReferral(e.target.value)}
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1" dir="rtl">یہ کوڈ بطور حوالہ چیک کیا جائے گا — یہاں لکھیں اگر آپ نے لنک میں کوڈ نہیں پایا۔</p>
              </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" dir="rtl">
                مکمل نام
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="محمد احمد"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" dir="rtl">
                ای میل ایڈریس
              </label>
              <input
                type="email"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="user@example.com"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" dir="rtl">
                پاس ورڈ
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="********"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-500 text-center" dir="rtl">{error}</p>}
            
            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-2" size={18} />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <UserPlus className="mr-2" size={18} />
                  <span>اکاؤنٹ بنائیں</span>
                </>
              )}
            </button>
            
            <div className="text-center mt-4">
              <button
                onClick={() => setCurrentPage('login')}
                className="text-amber-600 hover:text-orange-700 font-medium"
              >
                پہلے سے اکاؤنٹ ہے؟ لاگ ان کریں
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;