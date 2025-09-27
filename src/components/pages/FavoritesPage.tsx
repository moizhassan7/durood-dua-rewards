import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, Trash2, ChevronLeft, Share2} from 'lucide-react';
import { UserData, HadithData, VerseData, } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';
import { getFavoriteHadiths, getFavoriteVerses } from '../../services/firestore';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface FavoritesPageProps {
    user: UserData;
    setCurrentPage: (page: string) => void;
    // currentPage will contain the query parameter, e.g., 'favorites?list=hadith'
    currentPage: string; 
    handleLogout: () => void;
}

type ListType = 'hadith' | 'verse';

// Helper function to extract the list type from the currentPage string
const getInitialListType = (currentPage: string): ListType => {
    if (currentPage.includes('list=hadith')) {
        return 'hadith';
    }
    if (currentPage.includes('list=verse')) {
        return 'verse';
    }
    return 'hadith'; // Default to Hadith list
};

const FavoritesPage: React.FC<FavoritesPageProps> = ({ user, setCurrentPage, currentPage, handleLogout }) => {
    const [activeList, setActiveList] = useState<ListType>(getInitialListType(currentPage));
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async (listType: ListType) => {
        if (!user) return;

        setLoading(true);
        try {
            let data: FavoriteItem[] = [];
            if (listType === 'hadith') {
                data = await getFavoriteHadiths(user.id);
            } else {
                data = await getFavoriteVerses(user.id);
            }
            setFavorites(data);
        } catch (error) {
            console.error(`Failed to fetch favorite ${listType}:`, error);
        } finally {
            setLoading(false);
        }
    };

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
    useEffect(() => {
        // Update active list if navigation comes with a new query parameter
        setActiveList(getInitialListType(currentPage));
    }, [currentPage]);
    
    // Fetch data whenever the activeList changes
    useEffect(() => {
        fetchData(activeList);
    }, [activeList, user]);


    const handleRemoveFavorite = async (favId: string) => {
        if (user && favId) {
            await deleteDoc(doc(db, 'favorites', favId));
            // Update state immediately for local list refresh
            setFavorites(prev => prev.filter(f => f.id !== favId));
            alert('پسندیدہ سے ہٹا دیا گیا ہے۔');
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans-ar">
            <TopNav
                title="پسندیدہ فہرست"
                user={user}
                setCurrentPage={setCurrentPage}
                handleLogout={handleLogout}
                showBackButton={true}
                backAction={() => setCurrentPage('hadithVerse')}
            />
            <div className="flex-grow pt-16 pb-24 px-4 max-w-xl mx-auto w-full" dir="rtl">
                
                {/* Tab Buttons */}
                <div className="flex mb-6 bg-gray-100 rounded-xl p-1 shadow-inner">
                    <button
                        onClick={() => setActiveList('hadith')}
                        className={`flex-1 py-3 text-lg font-semibold rounded-lg transition-all duration-300 ${
                            activeList === 'hadith' ? 'bg-white text-green-700 shadow-md' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        احادیث
                    </button>
                    <button
                        onClick={() => setActiveList('verse')}
                        className={`flex-1 py-3 text-lg font-semibold rounded-lg transition-all duration-300 ${
                            activeList === 'verse' ? 'bg-white text-blue-700 shadow-md' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        آیات
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader className="animate-spin text-gray-500" size={48} />
                    </div>
                ) : favorites.length > 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                    >
                        {favorites.map((fav, index) => (
                            <motion.div
                                key={fav.id}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`bg-white rounded-xl shadow-lg p-4 border border-${fav.type === 'hadith' ? 'green' : 'blue'}-100`}
                            >
                                <p className="text-gray-900 text-base leading-relaxed font-arabic mb-2">
                                    {fav.type === 'hadith' ? (fav.item as HadithData).hadith : (fav.item as VerseData).verse}
                                </p>
                                <p className="text-gray-600 text-sm italic mb-3">
                                    {fav.type === 'hadith' ? (fav.item as HadithData).urduTranslation : (fav.item as VerseData).urduTranslation}
                                </p>
                                <div className="flex justify-between items-center text-gray-400 text-xs mt-3">
                                    <span>حوالہ: {fav.type === 'hadith' ? (fav.item as HadithData).reference : (fav.item as VerseData).reference}</span>
                                    <button
                                        onClick={() => handleRemoveFavorite(fav.id)}
                                        className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                      onClick={() => handleShare(
                        fav.type === 'hadith' ? "حدیث" : "آیت", 
                        (fav.type === 'hadith' ? (fav.item as HadithData).hadith : (fav.item as VerseData).verse) + 
                        "\n\n" + 
                        (fav.type === 'hadith' ? (fav.item as HadithData).urduTranslation : (fav.item as VerseData).urduTranslation)
                      )}
                      className="p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100"
                    >
                      <Share2 size={20} />
                      </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center text-gray-500 py-10">
                        <p>آپ نے ابھی تک کوئی **پسندیدہ {activeList === 'hadith' ? 'حدیث' : 'آیت'}** شامل نہیں کی۔</p>
                    </div>
                )}
            </div>
            <BottomNav currentPage="favorites" setCurrentPage={setCurrentPage} />
        </div>
    );
};

export default FavoritesPage;