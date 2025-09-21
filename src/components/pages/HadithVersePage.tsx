import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Bookmark, CheckCircle, Loader, X, ChevronLeft, Trash2 } from 'lucide-react';
import { UserData, HadithData, VerseData } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';
import { getHadithOfTheDay, getVerseOfTheDay } from '../../services/firestore';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { auth } from '../../firebaseConfig';
import AllahCalligraphy from '../../assets/allah-calligraphy.png';
import MuhammadCalligraphy from '../../assets/muhammad-calligraphy.png';
import asmaulNabiData from '../../data/asmaulNabi.json';

interface HadithVersePageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

interface AsmaHusnaData {
  name: string;
  transliteration: string;
  number: number;
  en: {
    meaning: string;
  };
}

interface AsmaNabiData {
  id: number;
  name_arabic: string;
  transliteration: string;
  meaning_english: string;
  meaning_urdu: string;
}

const HadithVersePage: React.FC<HadithVersePageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [hadith, setHadith] = useState<HadithData | null>(null);
  const [verse, setVerse] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHadithFavorited, setIsHadithFavorited] = useState(false);
  const [isVerseFavorited, setIsVerseFavorited] = useState(false);
  const [hadithFavId, setHadithFavId] = useState<string | null>(null);
  const [verseFavId, setVerseFavId] = useState<string | null>(null);

  const [asmaUlHusna, setAsmaUlHusna] = useState<AsmaHusnaData[] | null>(null);
  const [showAsmaHusnaView, setShowAsmaHusnaView] = useState(false);

  const [asmaUlNabi, setAsmaUlNabi] = useState<AsmaNabiData[] | null>(null);
  const [showAsmaNabiView, setShowAsmaNabiView] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const hadithData = await getHadithOfTheDay();
        const verseData = await getVerseOfTheDay();
        setHadith(hadithData);
        setVerse(verseData);

        const asmaHusnaResponse = await fetch('https://api.aladhan.com/v1/asmaAlHusna');
        const asmaHusnaResult = await asmaHusnaResponse.json();
        if (asmaHusnaResult.code === 200 && asmaHusnaResult.data) {
          setAsmaUlHusna(asmaHusnaResult.data);
        }

        setAsmaUlNabi(asmaulNabiData);

        if (user && hadithData) {
          const q = query(collection(db, 'favorites'),
            where('userId', '==', user.id),
            where('item.hadith', '==', hadithData.hadith)
          );
          const hadithFavorites = await getDocs(q);
          if (!hadithFavorites.empty) {
            setIsHadithFavorited(true);
            setHadithFavId(hadithFavorites.docs[0].id);
          }
        }

        if (user && verseData) {
          const q = query(collection(db, 'favorites'),
            where('userId', '==', user.id),
            where('item.verse', '==', verseData.verse)
          );
          const verseFavorites = await getDocs(q);
          if (!verseFavorites.empty) {
            setIsVerseFavorited(true);
            setVerseFavId(verseFavorites.docs[0].id);
          }
        }

      } catch (error) {
        console.error("Failed to fetch data: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleShare = async (title: string, text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
        });
        alert('کامیابی سے شیئر کر دیا گیا');
      } catch (error) {
        console.error("Error sharing: ", error);
      }
    } else {
      alert("آپ کا براؤزر شیئرنگ کو سپورٹ نہیں کرتا۔");
    }
  };

  const handleAddRemoveFavorite = async (item: HadithData | VerseData, type: 'hadith' | 'verse') => {
    if (!user) return;
    
    if (type === 'hadith' && isHadithFavorited) {
      if (hadithFavId) {
        await deleteDoc(doc(db, 'favorites', hadithFavId));
        setIsHadithFavorited(false);
        setHadithFavId(null);
        alert('پسندیدہ سے ہٹا دیا گیا ہے۔');
      }
    } else if (type === 'verse' && isVerseFavorited) {
      if (verseFavId) {
        await deleteDoc(doc(db, 'favorites', verseFavId));
        setIsVerseFavorited(false);
        setVerseFavId(null);
        alert('پسندیدہ سے ہٹا دیا گیا ہے۔');
      }
    } else {
      try {
        const newFavRef = await addDoc(collection(db, 'favorites'), {
          userId: user.id,
          item,
          type,
          dateAdded: new Date(),
        });
        
        if (type === 'hadith') {
          setIsHadithFavorited(true);
          setHadithFavId(newFavRef.id);
        } else {
          setIsVerseFavorited(true);
          setVerseFavId(newFavRef.id);
        }
        alert('پسندیدہ میں شامل کر دیا گیا ہے۔');
      } catch (error) {
        console.error("Failed to add to favorites: ", error);
        alert('پسندیدہ میں شامل کرنے میں کوئی مسئلہ پیش آیا۔');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader className="animate-spin text-green-700" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans-ar">
      <TopNav
        title="آج کے پیغامات"
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
        showBackButton={true}
        backAction={() => setCurrentPage('counter')}
      />
      <div className="flex-grow pt-16 pb-24 px-4">
        <div className="max-w-xl mx-auto space-y-8">
          {/* Action Buttons Container */}
          <div className="grid grid-cols-2 gap-4">
            {/* Allah Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowAsmaHusnaView(true)}
              whileTap={{ scale: 0.95 }}
              className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center justify-center border-2 border-gray-200 transition-transform duration-200"
            >
              <img src={AllahCalligraphy} alt="ALLAH" className="h-14 w-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">اسماء الحسنیٰ</p>
            </motion.button>
            {/* Muhammad SAW Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAsmaNabiView(true)}
              className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center justify-center border-2 border-gray-200 transition-transform duration-200"
            >
              <img src={MuhammadCalligraphy} alt="Muhammad SAW" className="h-14 w-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">اسماء النبی</p>
            </motion.button>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Verse of the Day Card */}
            {verse && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-2xl shadow-md p-6 border-2 border-gray-100"
                dir="rtl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-xl text-blue-800">آج کی آیت</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddRemoveFavorite(verse, 'verse')}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        isVerseFavorited
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {isVerseFavorited ? <Trash2 size={20} /> : <Bookmark size={20} />}
                    </button>
                    <button
                      onClick={() => handleShare("آج کی آیت", verse.verse + "\n\n" + verse.urduTranslation)}
                      className="p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-900 text-lg leading-relaxed font-arabic mb-3">{verse.verse}</p>
                <p className="text-gray-600 text-sm italic">{verse.urduTranslation}</p>
                <p className="text-gray-400 text-xs mt-4 text-left">حوالہ: {verse.reference}</p>
              </motion.div>
            )}

            {/* Hadith of the Day Card */}
            {hadith && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-50 rounded-2xl shadow-md p-6 border-2 border-gray-100"
                dir="rtl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-xl text-green-800">آج کی حدیث</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddRemoveFavorite(hadith, 'hadith')}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        isHadithFavorited
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {isHadithFavorited ? <Trash2 size={20} /> : <Bookmark size={20} />}
                    </button>
                    <button
                      onClick={() => handleShare("آج کی حدیث", hadith.hadith + "\n\n" + hadith.urduTranslation)}
                      className="p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-900 text-lg leading-relaxed font-arabic mb-3">{hadith.hadith}</p>
                <p className="text-gray-600 text-sm italic">{hadith.urduTranslation}</p>
                <p className="text-gray-400 text-xs mt-4 text-left">حوالہ: {hadith.reference}</p>
              </motion.div>
            )}

            {!hadith && !verse && (
              <div className="text-center py-10" dir="rtl">
                <p className="text-gray-500">آج کی حدیث یا آیت دستیاب نہیں ہے۔</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNav currentPage="favorites" setCurrentPage={setCurrentPage} />

      {/* Asma ul Husna View (Modal/Page) */}
      <AnimatePresence>
        {showAsmaHusnaView && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="fixed inset-0 bg-white z-50 overflow-y-auto"
            dir="rtl"
          >
            <div className="p-4 pt-8 max-w-xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">اسماء الحسنیٰ</h1>
                <button
                  onClick={() => setShowAsmaHusnaView(false)}
                  className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              {asmaUlHusna ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                  {asmaUlHusna.map((name) => (
                    <motion.div
                      key={name.number}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: name.number * 0.02, duration: 0.3 }}
                      className="p-4 bg-gray-50 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center"
                    >
                      <p className="text-xl font-bold text-gray-800">{name.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{name.en.meaning}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-10">
                  <p>اسماء الحسنیٰ دستیاب نہیں ہیں۔</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Asma ul Nabi View (Modal/Page) */}
      <AnimatePresence>
        {showAsmaNabiView && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="fixed inset-0 bg-white z-50 overflow-y-auto"
            dir="rtl"
          >
            <div className="p-4 pt-8 max-w-xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">اسماء النبی</h1>
                <button
                  onClick={() => setShowAsmaNabiView(false)}
                  className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              {asmaUlNabi ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                  {asmaUlNabi.map((name) => (
                    <motion.div
                      key={name.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: name.id * 0.02, duration: 0.3 }}
                      className="p-4 bg-gray-50 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center"
                    >
                      <p className="text-xl font-bold text-gray-800">{name.name_arabic}</p>
                      <p className="text-sm text-gray-500 mt-1">{name.meaning_urdu}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-10">
                  <p>اسماء النبی دستیاب نہیں ہیں۔</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HadithVersePage;