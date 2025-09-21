import React from 'react';
import { UserData } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';
import { Settings } from 'lucide-react';

interface SystemSettingsPageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

const SystemSettingsPage: React.FC<SystemSettingsPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav
        title="سسٹم سیٹنگز"
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
        showBackButton={true}
        backAction={() => setCurrentPage('admin')}
      />
      <div className="flex-grow pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 text-center">
            <Settings size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="font-bold text-xl text-gray-900" dir="rtl">سسٹم سیٹنگز</h3>
            <p className="text-sm text-gray-500 mt-2" dir="rtl">
              یہاں آپ سسٹم کی عمومی سیٹنگز، جیسے نوٹیفکیشنز اور ڈیفالٹ ویلیوز، کا انتظام کر سکتے ہیں۔
            </p>
            <p className="mt-4 text-xs text-gray-400" dir="rtl">یہ فیچر جلد ہی شامل کیا جائے گا۔</p>
          </div>
        </div>
      </div>
      <BottomNav currentPage="admin" setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default SystemSettingsPage;