import { useState, useEffect } from 'react';
import { ChevronLeft, User, Search, Loader, ShieldOff, Shield, CheckCircle, XCircle } from 'lucide-react';
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

// ---------------------------------------------------
// CUSTOM DIALOG COMPONENTS & STATE
// ---------------------------------------------------

// 1. Confirmation Dialog State
interface ConfirmationState {
    show: boolean;
    userId: string | null;
    isBlocked: boolean; // Current status of the user being targeted
    name: string;
}

// 2. Notification Dialog State (for success/error)
interface NotificationState {
    show: boolean;
    success: boolean;
    message: string;
}

const NotificationDialog: React.FC<{ dialog: NotificationState, onClose: () => void }> = ({ dialog, onClose }) => {
    if (!dialog.show) return null;

    const Icon = dialog.success ? CheckCircle : XCircle;
    const colorClass = dialog.success ? 'text-green-500' : 'text-red-500';
    const bgColorClass = dialog.success ? 'bg-green-50' : 'bg-red-50';
    const buttonClass = dialog.success ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" dir="rtl">
            <div className={`w-full max-w-sm rounded-xl shadow-2xl p-6 text-center ${bgColorClass} transform transition-all`}>
                <Icon size={48} className={`mx-auto mb-4 ${colorClass}`} />
                <p className="text-lg font-semibold text-gray-800 mb-4">{dialog.message}</p>
                <button
                    onClick={onClose}
                    className={`w-full py-2 rounded-lg font-medium text-white transition-colors ${buttonClass}`}
                >
                    ٹھیک ہے
                </button>
            </div>
        </div>
    );
};

const ConfirmationDialog: React.FC<{ 
    dialog: ConfirmationState, 
    onConfirm: () => void, 
    onCancel: () => void 
}> = ({ dialog, onConfirm, onCancel }) => {
    if (!dialog.show) return null;

    const action = dialog.isBlocked ? 'اَن بلاک' : 'بلاک';
    const actionColor = dialog.isBlocked ? 'text-green-600' : 'text-red-600';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" dir="rtl">
            <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 text-center">
                <Shield size={48} className={`mx-auto mb-4 ${actionColor}`} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">کارروائی کی تصدیق</h3>
                <p className="text-gray-700 mb-6">
                    کیا آپ واقعی صارف <span className="font-semibold">{dialog.name}</span> کو <span className={`font-bold ${actionColor}`}>{action}</span> کرنا چاہتے ہیں؟
                </p>
                <div className="flex justify-around space-x-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                    >
                        منسوخ کریں
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2 rounded-lg font-medium text-white transition-colors 
                            ${dialog.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        {action} کریں
                    </button>
                </div>
            </div>
        </div>
    );
};

// ---------------------------------------------------


const UserManagementPage: React.FC<UserManagementPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  // NEW STATES for dialogs
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
      show: false,
      userId: null,
      isBlocked: false,
      name: ''
  });
  const [notification, setNotification] = useState<NotificationState>({
      show: false,
      success: false,
      message: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const users = await getAllUsers();
      // Filter out the current admin user for safety/simplicity
      setAllUsers(users.filter(u => u.id !== user.id)); 
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

  // Handler to show the Confirmation Dialog
  const handleBlockClick = (targetUser: UserData) => {
    setConfirmation({
        show: true,
        userId: targetUser.id,
        isBlocked: targetUser.isBlocked || false,
        name: targetUser.name,
    });
  };

  // Handler for the actual Firestore operation
  const handleToggleBlockConfirm = async () => {
    if (!confirmation.userId) return;

    const { userId, isBlocked, name } = confirmation;

    // Immediately close the confirmation dialog
    setConfirmation({ show: false, userId: null, isBlocked: false, name: '' }); 
    setUpdatingUser(userId);

    try {
      await toggleBlockUser(userId, !isBlocked);
      
      setNotification({
          show: true,
          success: true,
          message: `صارف ${name} کو کامیابی سے ${!isBlocked ? 'بلاک' : 'اَن بلاک'} کر دیا گیا ہے۔`
      });

      await fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Failed to toggle block status: ", error);
      setNotification({
          show: true,
          success: false,
          message: 'اسٹیٹس تبدیل کرنے میں کوئی مسئلہ پیش آیا۔ دوبارہ کوشش کریں۔'
      });
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
                        // UPDATED: Calls handleBlockClick to show confirmation dialog
                        onClick={() => handleBlockClick(u)} 
                        disabled={updatingUser === u.id}
                        className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors flex items-center justify-center min-w-[70px] ${u.isBlocked ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                        title={u.isBlocked ? 'صارف کو اَن بلاک کریں' : 'صارف کو بلاک کریں'}
                      >
                        {updatingUser === u.id ? (
                          <Loader size={16} className="animate-spin" />
                        ) : u.isBlocked ? (
                          'بلاک شدہ'
                        ) : (
                          'فعال'
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

      {/* RENDER CUSTOM DIALOGS */}
      <ConfirmationDialog 
          dialog={confirmation}
          onConfirm={handleToggleBlockConfirm}
          onCancel={() => setConfirmation({ show: false, userId: null, isBlocked: false, name: '' })}
      />
      <NotificationDialog 
          dialog={notification}
          onClose={() => setNotification({ show: false, success: false, message: '' })}
      />
    </div>
  );
};

export default UserManagementPage;