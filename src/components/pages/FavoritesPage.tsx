import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Share2, Trash2, Loader, BookOpen, BookText } from 'lucide-react';
import { UserData, FavoriteItem, HadithData, VerseData } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';
import { getFavorites, removeFavorite } from '../../services/firestore';
import { auth } from '../../firebaseConfig';

interface FavoritesPageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const favoriteItems = await getFavorites(user.id);
      setFavorites(favoriteItems);
    } catch (error) {
      console.error("Failed to fetch favorites: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
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

  const handleRemoveFavorite = async (favoriteId: string) => {
    const confirmRemove = window.confirm('کیا آپ واقعی یہ پسندیدہ ہٹانا چاہتے ہیں؟');
    if (!confirmRemove) return;
    try {
      await removeFavorite(favoriteId);
      alert('پسندیدہ ہٹا دیا گیا ہے۔');
      await fetchFavorites();
    } catch (error) {
      console.error("Failed to remove favorite: ", error);
      alert('پسندیدہ ہٹانے میں کوئی مسئلہ پیش آیا۔');
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
        title="پسندیدہ"
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
        showBackButton={true}
        backAction={() => setCurrentPage('hadith-verse-page')}
      />
      <div className="flex-grow pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {favorites.length > 0 ? (
            favorites.map((favorite, index) => (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm p-6"
                dir="rtl"
              >
                <div className="flex items-center mb-2">
                  {favorite.type === 'hadith' ? (
                    <BookOpen size={20} className="text-gray-600 ml-2" />
                  ) : (
                    <BookText size={20} className="text-gray-600 ml-2" />
                  )}
                  <h2 className="font-bold text-lg text-gray-900">
                    {favorite.type === 'hadith' ? 'حدیث' : 'آیت'}
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {favorite.type === 'hadith' ? (favorite.item as HadithData).hadith : (favorite.item as VerseData).verse}
                </p>
                <p className="text-gray-500 text-sm italic mt-2">
                  {favorite.type === 'hadith' ? (favorite.item as HadithData).urduTranslation : (favorite.item as VerseData).urduTranslation}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  حوالہ: {favorite.type === 'hadith' ? (favorite.item as HadithData).reference : (favorite.item as VerseData).reference}
                </p>
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={() => handleShare(
                      favorite.type === 'hadith' ? "آج کی حدیث" : "آج کی آیت",
                      (favorite.type === 'hadith' ? (favorite.item as HadithData).hadith : (favorite.item as VerseData).verse) + "\n\n" +
                      (favorite.type === 'hadith' ? (favorite.item as HadithData).urduTranslation : (favorite.item as VerseData).urduTranslation)
                    )}
                    className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                  >
                    <Share2 size={20} />
                  </button>
                  <button
                    onClick={() => handleRemoveFavorite(favorite.id)}
                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10" dir="rtl">
              <Bookmark size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">کوئی پسندیدہ آیت یا حدیث موجود نہیں ہے۔</p>
            </div>
          )}
        </div>
      </div>
      <BottomNav currentPage="favorites" setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default FavoritesPage;