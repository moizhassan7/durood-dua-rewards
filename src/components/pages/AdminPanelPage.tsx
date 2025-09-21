// components/pages/AdminPanelPage.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Users, CreditCard, Trophy, Download, Shield, Settings, Loader, LogOut, BookOpen, BookText } from 'lucide-react';
import { formatNumber } from '../utils/formatters';
import { UserData } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';
import { getAllUsers, getMonthlyLeaders, getPendingPayoutsCount, resetMonthlyCountsAndAnnounce } from '../../services/firestore';

interface AdminPanelPageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

const prizes = [
  { rank: 1, prize: '5000 روپے نقد', icon: '💰' },
  { rank: 2, prize: 'قرآن پاک', icon: '📖' },
  { rank: 3, prize: 'تسبیح + کاؤنٹر', icon: '📿' },
];

const AdminPanelPage: React.FC<AdminPanelPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [pendingPayoutsCount, setPendingPayoutsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const users = await getAllUsers();
      setAllUsers(users);
      const pendingCount = await getPendingPayoutsCount();
      setPendingPayoutsCount(pendingCount);
    } catch (error) {
      console.error("Failed to fetch admin data: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);
  
  const getNextAnnouncementDate = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 29);
    return nextMonth.toLocaleDateString('ur-PK', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleDownloadReport = () => {
    if (allUsers.length === 0) {
      alert('ڈاؤن لوڈ کرنے کے لیے کوئی صارف ڈیٹا موجود نہیں ہے۔');
      return;
    }

    const headers = ["ID", "Name", "Email", "Total Count", "Monthly Count", "Streak"];
    const rows = allUsers.map(u => [
      u.id,
      u.name,
      u.email,
      u.totalCount,
      u.monthCount,
      u.streak
    ].join(','));
    
    const csvContent = headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'darood_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('رپورٹ کامیابی سے ڈاؤن لوڈ ہو گئی ہے۔');
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
        title="ایڈمن پینل"
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
      />
      <div className="flex-grow pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto">
          {/* Admin Cards */}
          <div className="space-y-4 mb-6">
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100"
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                  <Users size={20} className="text-emerald-600" />
                </div>
                <h2 className="font-bold text-gray-900" dir="rtl">صارفین کا انتظام</h2>
              </div>
              <p className="text-gray-600 text-sm mb-4" dir="rtl">
                کل صارفین: {allUsers.length}
              </p>
              <button
                onClick={() => setCurrentPage('user-management')}
                className="w-full bg-emerald-50 text-emerald-700 py-2 rounded-lg font-medium flex items-center justify-center"
              >
                <ChevronDown className="transform rotate-180 mr-2" size={16} />
                تفصیلات دیکھیں
              </button>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100"
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                  <CreditCard size={20} className="text-amber-600" />
                </div>
                <h2 className="font-bold text-gray-900" dir="rtl">انعامات کی ادائیگی</h2>
              </div>
              <p className="text-gray-600 text-sm mb-4" dir="rtl">
                زیر التواء درخواستیں: {pendingPayoutsCount}
              </p>
              <button
                onClick={() => setCurrentPage('payout-requests')}
                className="w-full bg-amber-50 text-amber-600 py-2 rounded-lg font-medium flex items-center justify-center"
              >
                <ChevronDown className="transform rotate-180 mr-2" size={16} />
                ادائیگیاں دیکھیں
              </button>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100"
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mr-3">
                  <Trophy size={20} className="text-rose-600" />
                </div>
                <h2 className="font-bold text-gray-900" dir="rtl">ماہانہ فاتحین</h2>
              </div>
              <p className="text-gray-600 text-sm mb-4" dir="rtl">
                29 تاریخ کو فاتحین کا اعلان کریں، انعامات تفویض کریں، اور رپورٹ ڈاؤن لوڈ کریں
              </p>
              <button onClick={() => setCurrentPage('monthly-winners-view')} className="w-full bg-rose-50 text-rose-600 py-2 rounded-lg font-medium flex items-center justify-center">
                <ChevronDown className="transform rotate-180 mr-2" size={16} />
                فاتحین دیکھیں
              </button>
            </motion.div>
            
            {/* Hadith of the Day Card */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100"
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <BookOpen size={20} className="text-blue-600" />
                </div>
                <h2 className="font-bold text-gray-900" dir="rtl">آج کی حدیث</h2>
              </div>
              <p className="text-gray-600 text-sm mb-4" dir="rtl">
                روزانہ کی حدیث شامل کریں، اس میں تبدیلی کریں یا اس کا جائزہ لیں۔
              </p>
              <button
                onClick={() => setCurrentPage('hadith-of-the-day-admin')}
                className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg font-medium flex items-center justify-center"
              >
                <ChevronDown className="transform rotate-180 mr-2" size={16} />
                حدیث شامل کریں
              </button>
            </motion.div>
            
            {/* Verse of the Day Card */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-fuchsia-100"
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-fuchsia-100 flex items-center justify-center mr-3">
                  <BookText size={20} className="text-fuchsia-600" />
                </div>
                <h2 className="font-bold text-gray-900" dir="rtl">آج کی آیت</h2>
              </div>
              <p className="text-gray-600 text-sm mb-4" dir="rtl">
                روزانہ کی آیت شامل کریں، اس میں تبدیلی کریں یا اس کا جائزہ لیں۔
              </p>
              <button
                onClick={() => setCurrentPage('verse-of-the-day-admin')}
                className="w-full bg-fuchsia-50 text-fuchsia-600 py-2 rounded-lg font-medium flex items-center justify-center"
              >
                <ChevronDown className="transform rotate-180 mr-2" size={16} />
                آیت شامل کریں
              </button>
            </motion.div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-900" dir="rtl">انتظامیہ کے اختیارات</h2>
              <button onClick={handleDownloadReport} className="flex items-center text-sm text-amber-600">
                <Download size={16} className="mr-1" />
                ڈاؤن لوڈ
              </button>
            </div>
            
            <button
              onClick={() => setCurrentPage('security-settings')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center mb-3"
              dir="rtl"
            >
              <Shield className="mr-2" size={18} />
              امنیت کے انتظامات
            </button>
            <button
              onClick={() => setCurrentPage('system-settings')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center"
              dir="rtl"
            >
              <Settings className="mr-2" size={18} />
              سسٹم سیٹنگز
            </button>
          </div>
        </div>
      </div>
      <BottomNav currentPage="admin" setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default AdminPanelPage;