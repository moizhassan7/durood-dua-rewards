import { ChevronLeft, LogOut, Settings, Trophy } from 'lucide-react';
import { UserData } from '../types';

interface TopNavProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
  title: string;
  showBackButton?: boolean;
  backAction?: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ user, setCurrentPage, handleLogout, title, showBackButton, backAction }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
      <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left-aligned content: Back button or placeholder */}
        <div className="flex items-center">
          {showBackButton ? (
            <button onClick={backAction} className="p-2 text-gray-600 hover:text-gray-900">
              <ChevronLeft size={20} />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-100 to-emerald-200 flex items-center justify-center mr-3">
              <span className="text-xl font-bold text-green-700">م</span>
            </div>
          )}
          <h1 className="font-bold text-gray-900" dir="rtl">{title}</h1>
        </div>

        {/* Right-aligned navigation buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentPage('leaderboards')}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <Trophy size={20} />
          </button>
          <button
            onClick={() => user.isAdmin ? setCurrentPage('admin') : setCurrentPage('profile')}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNav;