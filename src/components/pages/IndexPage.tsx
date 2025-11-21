import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Loader, Moon, Sun, Image as ImageIcon } from 'lucide-react';
import { getBenefits } from '../../services/firestore';
import { Benefit } from '../../types';

interface IndexPageProps {
  setCurrentPage: (page: string) => void;
}

const IndexPage: React.FC<IndexPageProps> = ({ setCurrentPage }) => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getBenefits();
        setBenefits(data || []);
      } catch (error) {
        console.error("Error fetching benefits", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    if (next === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    setIsDark(!isDark);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemAnim = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
      
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-400/20 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-[30%] right-[-10%] w-80 h-80 bg-teal-300/20 dark:bg-teal-900/20 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-8 px-6 flex justify-between items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-700 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-xl">
            م
        </div>
        <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full bg-white/50 dark:bg-black/30 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-sm transition-transform hover:scale-105"
        >
            {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
        </button>
      </div>

      <div className="relative z-10 pt-6 pb-4 px-6 text-center">
        <motion.h1 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-extrabold mb-2 tracking-tight" dir="rtl"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-l from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300">
            خوش آمدید
          </span>
        </motion.h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto" dir="rtl">
          روحانی سکون اور برکت کے لیے
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="relative z-10 px-4 pb-32">
        {loading ? (
           <div className="flex justify-center py-20">
             <Loader className="animate-spin text-emerald-600" size={32} />
           </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {benefits.length > 0 ? (
              benefits.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemAnim}
                  className="group relative flex flex-col bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Image Section */}
                  <div className="h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                    {item.iconUrl ? (
                      <img 
                        src={item.iconUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      // Fallback Gradient if no image
                      <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/40 flex items-center justify-center">
                        <ImageIcon className="text-emerald-300 dark:text-emerald-700 w-12 h-12 opacity-50" />
                      </div>
                    )}
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                  </div>

                  {/* Content Section */}
                  <div className="p-5 flex flex-col flex-grow relative -mt-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex-grow">
                        <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-2 text-right" dir="rtl">
                        {item.title}
                        </h3>
                        <div className="h-0.5 w-10 bg-emerald-500 ml-auto mb-3 rounded-full opacity-50" />
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed text-right" dir="rtl">
                        {item.description}
                        </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-400">کوئی تفصیلات موجود نہیں ہیں</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Bottom Sticky Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 pointer-events-none" />
        
        <div className="relative px-6 pb-8 pt-2 max-w-md mx-auto flex flex-col gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage('signup')}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
          >
            <UserPlus size={20} />
            <span>نیا اکاؤنٹ بنائیں</span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage('login')}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 transition-colors"
          >
            <LogIn size={20} />
            <span>لاگ ان کریں</span>
          </motion.button>
        </div>
      </div>

    </div>
  );
};

export default IndexPage;