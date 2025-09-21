// components/pages/LoginPage.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Eye, EyeOff, Loader } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig'; // Import auth from your config

interface LoginPageProps {
  handleLoginSuccess: (user: any) => void;
  setCurrentPage: (page: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ handleLoginSuccess, setCurrentPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Pass the user object to the parent component
      handleLoginSuccess(userCredential.user);
    } catch (err: any) {
      console.error(err);
      setError('غلط ای میل یا پاس ورڈ');
    } finally {
      setLoading(false);
    }
  };

  return (
    // The rest of your component code remains the same
    // except for the button, error message, and loading state
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-emerald-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">درود شریف کاؤنٹر</h1>
          <p className="text-emerald-100 text-sm">ہر درود پاک کی تعداد کے مطابق انعامات حاصل کریں</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" dir="rtl">
                ای میل ایڈریس
              </label>
              <input
                type="email"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-2" size={18} />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <LogIn className="mr-2" size={18} />
                  <span>لاگ ان کریں</span>
                </>
              )}
            </button>
            
            <div className="text-center mt-4">
              <button
                onClick={() => setCurrentPage('signup')}
                className="text-green-600 hover:text-emerald-700 font-medium"
              >
                نیا اکاؤنٹ بنائیں
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;