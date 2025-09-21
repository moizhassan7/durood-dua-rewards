
import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase credentials
const supabaseUrl = 'https://ockxmstrfzugdywivriy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ja3htc3RyZnp1Z2R5d2l2cml5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY1NTkxNSwiZXhwIjoyMDczMjMxOTE1fQ.hnxI1ZA8m4X-SeMBum28oCI2dE2V7AF7CjJ_ozgg0VY';
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 


import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Trophy, Settings, LogOut, Loader, Clock } from "lucide-react";
import BottomNav from "../BottomNav";
import { formatNumber } from "../utils/formatters";
import { UserData, RewardBannerData } from "../../types";

interface CounterPageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  setUser: (user: UserData | null) => void;
  sessionCount: number;
  onPress: () => Promise<void>;
  isCooldown: boolean;
  rings: { id: number }[];
}

const rewardBanners: RewardBannerData[] = [
  {
    id: 1,
    title: "ہر صحیح دُرود = ۱ پوائنٹ = 0.1 روپے",
    description: "آپ کے تمام دُرود پاک کی تعداد کے مطابق آپ کو انعامات ملتے رہیں گے",
    bg: "bg-gradient-to-r from-amber-50 to-amber-100",
    border: "border-amber-200",
  },
  {
    id: 2,
    title: "ہر مہینے 29 تاریخ کو انعامات کا اعلان",
    description: "ہر مہینے کی 29 تاریخ کو نئے فاتحین کا اعلان کیا جاتا ہے",
    bg: "bg-gradient-to-r from-emerald-50 to-emerald-100",
    border: "border-emerald-200",
  },
  {
    id: 3,
    title: "پہلا انعام: ۵۰۰۰ روپے نقد",
    description: "ماہانہ مقابلے میں پہلے نمبر پر آنے والے کو 5000 روپے نقد انعام",
    bg: "bg-gradient-to-r from-rose-50 to-rose-100",
    border: "border-rose-200",
  },
];

const CounterPage: React.FC<CounterPageProps> = ({
  user,
  setCurrentPage,
  setUser,
  sessionCount,
  onPress,
  isCooldown,
  rings,
}) => {
  const handlePressWithUpdate = async () => {
    await onPress();
  };

  const dailyProgress = Math.min(100, (user.todayCount / user.dailyGoal) * 100);
  const monthlyProgress = Math.min(
    100,
    (user.monthCount / user.monthlyGoal) * 100
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pt-16 pb-24 overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-100 to-emerald-200 flex items-center justify-center mr-3">
              <span className="text-xl font-bold text-green-700">م</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900" dir="rtl">
                {user.name}
              </h1>
              <p className="text-xs text-gray-500" dir="rtl">
                کل دُرود: {formatNumber(user.totalCount)}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setCurrentPage("leaderboards")}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <Trophy size={20} />
            </button>
            <button
              onClick={() =>
                user.isAdmin
                  ? setCurrentPage("admin")
                  : setCurrentPage("profile")
              }
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => setUser(null)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>
      
      {/* Counter Area */}
      <div
        className="max-w-md mx-auto px-4 relative flex flex-col items-center justify-start"
      >
        {/* Reward Banners (MOVED TO TOP) */}
        <div className="space-y-3 mb-6 mt-4 w-full">
          {rewardBanners.map((banner) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: banner.id * 0.1 }}
              className={`rounded-xl p-4 border-l-4 ${banner.border} ${banner.bg}`}
            >
              <h3 className="font-bold text-gray-900 mb-1" dir="rtl">
                {banner.title}
              </h3>
              <p className="text-sm text-gray-600" dir="rtl">
                {banner.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats & Streak (MOVED) */}
        <div className="grid grid-cols-2 gap-4 mb-6 w-full">
          {[
            { title: 'آج کا کاؤنٹ', value: formatNumber(user.todayCount), icon: '📅' },
            { title: 'ماہانہ کاؤنٹ', value: formatNumber(user.monthCount), icon: '📆' },
            { title: 'کل کمائی', value: `${formatNumber(user.monthCount * 0.1)} روپے`, icon: '💰' },
            { title: 'مسلسل وقفہ', value: `${user.streak} دن`, icon: '⏳' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-sm text-center"
            >
              <div className="text-xl mb-1" aria-hidden="true">{stat.icon}</div>
              <div className="text-xs text-gray-500" dir="rtl">{stat.title}</div>
              <div className="font-bold text-gray-900" dir="rtl">{stat.value}</div>
            </motion.div>
          ))}
        </div>
        
        {/* Goal Progress Bars (MOVED DOWN) */}
        <div className="space-y-4 mb-8 w-full">
          {/* Daily Goal */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2" dir="rtl">
              <span className="font-bold text-sm text-gray-900">
                روزانہ کا مقصد
              </span>
              <span className="text-xs text-gray-500">
                {formatNumber(user.todayCount)} / {formatNumber(user.dailyGoal)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 relative overflow-hidden">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${dailyProgress}%` }}
              ></div>
              <span
                className="absolute inset-0 text-center text-[10px] font-bold text-white leading-[10px]"
                dir="ltr"
              >
                {dailyProgress.toFixed(0)}%
              </span>
            </div>
          </div>
          {/* Monthly Goal */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2" dir="rtl">
              <span className="font-bold text-sm text-gray-900">
                ماہانہ کا مقصد
              </span>
              <span className="text-xs text-gray-500">
                {formatNumber(user.monthCount)} /{" "}
                {formatNumber(user.monthlyGoal)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 relative overflow-hidden">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${monthlyProgress}%` }}
              ></div>
              <span
                className="absolute inset-0 text-center text-[10px] font-bold text-white leading-[10px]"
                dir="ltr"
              >
                {monthlyProgress.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Counter Button */}
        <div className="relative w-full flex-grow min-h-[280px]">
          <AnimatePresence>
            {rings.map((ring) => (
              <motion.div
                key={ring.id}
                initial={{ scale: 0, opacity: 0.7 }}
                animate={{ scale: 3, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border-2 border-green-400"
              />
            ))}
          </AnimatePresence>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePressWithUpdate}
            disabled={isCooldown}
            className={`absolute inset-0 rounded-full flex flex-col items-center justify-center font-bold text-white text-2xl shadow-lg transition-all ${
              isCooldown
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800"
            }`}
          >
            {isCooldown ? (
              <div className="flex flex-col items-center">
                <Loader className="animate-spin mb-2" size={24} />
                <span>انتظار کریں</span>
              </div>
            ) : (
              <>
                <span>دُرود</span>
                <span>{formatNumber(sessionCount)}</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav currentPage="counter" setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default CounterPage;