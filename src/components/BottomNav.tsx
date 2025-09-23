import { Home, Trophy, Settings, Bookmark, BookOpen } from 'lucide-react';
import { getAuth } from 'firebase/auth';

interface BottomNavProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around py-3">
          <button 
            className={`flex flex-col items-center ${currentPage === 'counter' ? 'text-green-600' : 'text-gray-500'}`}
            onClick={() => setCurrentPage('counter')}
          >
            <Home size={22} />
            <span className="text-xs mt-1" dir="rtl">گھر</span>
          </button>
          <button 
            className={`flex flex-col items-center ${currentPage === 'leaderboards' ? 'text-green-600' : 'text-gray-500'}`}
            onClick={() => setCurrentPage('leaderboards')}
          >
            <Trophy size={22} />
            <span className="text-xs mt-1" dir="rtl">لیڈر بورڈ</span>
          </button>
          <button
            className={`flex flex-col items-center ${currentPage === 'quran' ? 'text-green-600' : 'text-gray-500'}`}
            onClick={() => setCurrentPage('quran')}
          >
            <BookOpen size={22} />
            <span className="text-xs mt-1" dir="rtl">قرآن</span>
          </button>
          <button
            className={`flex flex-col items-center ${currentPage === 'hadith-verse-page' ? 'text-green-600' : 'text-gray-500'}`}
            onClick={() => setCurrentPage('hadith-verse-page')}
          >
            <Bookmark size={22} />
            <span className="text-xs mt-1" dir="rtl">پسندیدہ</span>
          </button>
          <button 
            className={`flex flex-col items-center ${currentPage === 'profile' ? 'text-green-600' : 'text-gray-500'}`}
            onClick={() => setCurrentPage('profile')}
          >
            <Settings size={22} />
            <span className="text-xs mt-1" dir="rtl">پروفائل</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;