import { useState, useEffect } from 'react';
import { ChevronLeft, User, Search, Loader, ShieldOff, Shield } from 'lucide-react';
import { formatNumber } from '../utils/formatters';
import { getAllUsers, toggleBlockUser } from '../../services/firestore';
import { UserData } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';

interface UserManagementPageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const users = await getAllUsers();
      setAllUsers(users);
      setFilteredUsers(users);
    } catch (error) {
      console.error("Failed to fetch users: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const results = allUsers.filter(u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, allUsers]);

  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    setUpdatingUser(userId);
    try {
      await toggleBlockUser(userId, !isBlocked);
      alert(`صارف ${!isBlocked ? 'بلاک' : 'اَن بلاک'} ہو گیا ہے۔`);
      await fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Failed to toggle block status: ", error);
      alert('اسٹیٹس تبدیل کرنے میں کوئی مسئلہ پیش آیا۔');
    } finally {
      setUpdatingUser(null);
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
        title="صارفین کا انتظام"
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
        showBackButton={true}
        backAction={() => setCurrentPage('admin')}
      />
      <div className="flex-grow pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto">
          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="صارف تلاش کریں..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              dir="rtl"
            />
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* User List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {filteredUsers.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <li key={u.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User size={20} className="text-gray-500" />
                      </div>
                      <div dir="rtl">
                        <h3 className="font-bold text-gray-900">{u.name}</h3>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                    </div>
                    <div dir="rtl" className="text-right flex items-center space-x-2">
                      <div className="text-sm font-medium text-green-600">
                        {formatNumber(u.totalCount)} دُرود
                      </div>
                      <div className="text-xs text-gray-500">
                        {u.streak} دن
                      </div>
                      <button
                        onClick={() => handleToggleBlock(u.id, u.isBlocked || false)}
                        disabled={updatingUser === u.id}
                        className={`p-2 rounded-full ${u.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
                        title={u.isBlocked ? 'صارف کو اَن بلاک کریں' : 'صارف کو بلاک کریں'}
                      >
                        {updatingUser === u.id ? (
                          <Loader size={20} className="animate-spin" />
                        ) : u.isBlocked ? (
                         "BLOCKED"
                        ) : (
                         "ACTIVE"
                        )}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 text-center text-gray-500" dir="rtl">کوئی صارف نہیں ملا۔</p>
            )}
          </div>
        </div>
      </div>
      <BottomNav currentPage="admin" setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default UserManagementPage;