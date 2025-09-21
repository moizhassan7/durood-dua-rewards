import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Trophy, Loader, LogOut, Settings } from 'lucide-react';
import { formatNumber } from '../utils/formatters';
import { UserData } from '../../types';
import { getMonthlyLeaders, getTodayLeaders, getAllTimeLeaders } from '../../services/firestore';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';

interface LeaderboardsPageProps {
  setCurrentPage: (page: string) => void;
  user: UserData;
  handleLogout: () => void;
}

const prizes = [
  { rank: 1, prize: '5000 روپے نقد', icon: '💰' },
  { rank: 2, prize: 'قرآن پاک', icon: '📖' },
  { rank: 3, prize: 'تسبیح + کاؤنٹر', icon: '📿' }
];

const LeaderboardsPage: React.FC<LeaderboardsPageProps> = ({ setCurrentPage, user, handleLogout }) => {
  const [activeTab, setActiveTab] = useState('this-month');
  const [monthlyLeaders, setMonthlyLeaders] = useState<UserData[]>([]);
  const [todayLeaders, setTodayLeaders] = useState<UserData[]>([]);
  const [allTimeLeaders, setAllTimeLeaders] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeaders = async () => {
      setLoading(true);
      try {
        let leaders = [];
        if (activeTab === 'this-month') {
          leaders = await getMonthlyLeaders();
        } else if (activeTab === 'today') {
          leaders = await getTodayLeaders();
        } else if (activeTab === 'all-time') {
          leaders = await getAllTimeLeaders();
        }
        // Filter out the admin user before setting the state
        const filteredLeaders = leaders.filter(leader => !leader.isAdmin);
        if (activeTab === 'this-month') {
          setMonthlyLeaders(filteredLeaders);
        } else if (activeTab === 'today') {
          setTodayLeaders(filteredLeaders);
        } else if (activeTab === 'all-time') {
          setAllTimeLeaders(filteredLeaders);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, [activeTab]);

  const renderLeaderboard = (leaders: UserData[], showStreaks: boolean = false) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-48">
          <Loader className="animate-spin text-green-600" size={48} />
        </div>
      );
    }

    if (leaders.length === 0) {
      return (
        <div className="text-center text-gray-500 mt-8" dir="rtl">
          <p>کوئی ڈیٹا موجود نہیں ہے۔</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {leaders.slice(0, 3).map((leader, index) => (
          <motion.div
            key={leader.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-xl p-4 shadow-sm flex items-center ${
              index === 0 ? 'border-2 border-amber-200' :
              index === 1 ? 'border border-amber-100' :
              'border border-gray-100'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mr-3 ${
              index === 0 ? 'bg-amber-500' :
              index === 1 ? 'bg-gray-400' :
              'bg-amber-300'
            }`}>
              {index + 1}
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-gray-900" dir="rtl">{leader.name}</h3>
              <p className="text-sm text-gray-500" dir="rtl">
                {activeTab === 'today' && `${formatNumber(leader.todayCount)} آج کے دُرود`}
                {activeTab === 'this-month' && `${formatNumber(leader.monthCount)} ماہانہ پوائنٹس`}
                {activeTab === 'all-time' && `${formatNumber(leader.totalCount)} کل پوائنٹس`}
              </p>
            </div>

            <div className="text-right">
              {activeTab === 'this-month' && (
                <>
                  <div className="text-lg font-bold" dir="rtl">{prizes[index]?.prize || ''}</div>
                  <div className="text-2xl" aria-hidden="true">{prizes[index]?.icon || ''}</div>
                </>
              )}
            </div>
          </motion.div>
        ))}

        {leaders.length > 3 && (
          <div className="mt-4">
            <h3 className="font-bold text-gray-900 mb-2" dir="rtl">باقی فاتحین</h3>
            {leaders.slice(3).map((leader, index) => (
              <div key={leader.id} className="flex items-center py-2 border-b border-gray-100 last:border-0">
                <div className="w-6 text-gray-400 mr-3">{index + 4}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900" dir="rtl">{leader.name}</h4>
                  <p className="text-sm text-gray-500" dir="rtl">
                    {activeTab === 'today' && `${formatNumber(leader.todayCount)} آج کے دُرود`}
                    {activeTab === 'this-month' && `${formatNumber(leader.monthCount)} ماہانہ پوائنٹس`}
                    {activeTab === 'all-time' && `${formatNumber(leader.totalCount)} کل پوائنٹس`}
                  </p>
                </div>
                {showStreaks && (
                  <div className="text-gray-500 text-sm" dir="rtl">{formatNumber(leader.streak)} دن</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav
        title="لیڈر بورڈ"
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
      />
      <div className="flex-grow pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex border-b border-gray-200 mb-6">
            {[
              { id: 'this-month', title: 'ماہانہ فاتحین' },
              { id: 'all-time', title: 'ہمیشہ کے فاتحین' },
              { id: 'today', title: 'آج کے فاتحین' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-center font-medium ${
                  activeTab === tab.id
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500'
                }`}
                dir="rtl"
              >
                {tab.title}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {activeTab === 'this-month' && renderLeaderboard(monthlyLeaders, true)}
            {activeTab === 'today' && renderLeaderboard(todayLeaders, false)}
            {activeTab === 'all-time' && renderLeaderboard(allTimeLeaders, true)}
          </div>
        </div>
      </div>
      <BottomNav currentPage="leaderboards" setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default LeaderboardsPage;