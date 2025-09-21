import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader, ArrowLeft } from 'lucide-react';

interface AsmaHusnaData {
  name: string;
  transliteration: string;
  number: number;
  en: {
    meaning: string;
  };
}

interface AsmaUlHusnaPageProps {
  setCurrentPage: (page: string) => void;
}

const AsmaUlHusnaPage: React.FC<AsmaUlHusnaPageProps> = ({ setCurrentPage }) => {
  const [asmaUlHusna, setAsmaUlHusna] = useState<AsmaHusnaData[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAsma = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://api.aladhan.com/v1/asmaAlHusna');
        const result = await response.json();

        if (result.code === 200 && result.data) {
          setAsmaUlHusna(result.data);
        } else {
          alert('اسماء الحسنیٰ حاصل کرنے میں ناکامی۔');
        }
      } catch (error) {
        console.error("Failed to fetch Asma ul Husna: ", error);
        alert('اسماء الحسنیٰ حاصل کرنے میں کوئی مسئلہ پیش آیا۔');
      } finally {
        setLoading(false);
      }
    };
    fetchAsma();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="pt-16 pb-4 px-4 bg-white shadow-sm flex items-center justify-between" dir="rtl">
        <button onClick={() => setCurrentPage('hadithVerse')} className="p-2 text-gray-600 hover:text-green-600 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">اسماء الحسنیٰ (اللہ کے 99 نام)</h1>
        <div></div> {/* Spacer to balance the layout */}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-grow p-4 overflow-y-auto"
      >
        <div className="max-w-md mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          {asmaUlHusna && asmaUlHusna.map((name) => (
            <motion.div
              key={name.number}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: name.number * 0.02 }}
              className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              dir="rtl"
            >
              <p className="text-lg font-bold text-gray-800">{name.name}</p>
              <p className="text-sm text-gray-600 italic mt-1">{name.en.meaning}</p>
              <p className="text-xs text-gray-400 mt-1">{name.number}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AsmaUlHusnaPage;