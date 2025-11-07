import React from 'react';
import { Download } from 'lucide-react';
import { UserData } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';

interface MobileAppAdPageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

const MobileAppAdPage: React.FC<MobileAppAdPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
      <TopNav
        title="موبائل ایپ"
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
        showBackButton={true}
        backAction={() => setCurrentPage('profile')}
      />
      <div className="flex-grow pt-16 pb-24 px-4 flex items-center">
        <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full mx-auto p-0 overflow-hidden">
        {/* App Header */}
        <div className="flex items-center gap-4 px-6 pt-6 pb-4">
          <img
            src="/assets/image.png"
            alt="App Icon"
            className="w-16 h-16 rounded-2xl border border-gray-200 shadow"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate" dir="rtl">Barakat-e-Darood</h1>
            <p className="text-green-700 text-sm font-medium mt-1" dir="rtl">Usman Awan</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-yellow-500 text-lg">★ ★ ★ ★ ★</span>
              <span className="text-xs text-gray-500">(100+)</span>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="px-6 pb-4">
          <a
            href="/assets/app-release.apk"
            download="daroord.apk"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg text-lg font-semibold shadow hover:bg-green-700 transition-colors"
          >
            <Download size={22} />
            ایپ ڈاؤن لوڈ کریں
          </a>
        </div>

        {/* Screenshots */}
        <div className="px-4 pb-6">
          <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-green-50 py-2">
            {[
              '/assets/screenshot4.png',
              '/assets/screenshot3.png',
              '/assets/screenshot2.png',
              '/assets/screenshot1.png',
            ].map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`App Screenshot ${idx + 1}`}
                className="h-72 w-auto rounded-xl border border-gray-200 shadow-sm bg-gray-50 flex-shrink-0"
                loading="lazy"
                style={{ minWidth: 160, maxWidth: 220 }}
              />
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="px-6 pb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-2" dir="rtl">ایپ کی خصوصیات</h2>
          <ul className="list-disc pr-6 text-right text-gray-700 space-y-1 text-base" dir="rtl">
            <li>دُرود و دعا کے فضائل اور انعامات</li>
            <li>یومیہ اور ماہانہ ٹریکنگ</li>
            <li>قرآنی جُز اور احادیث</li>
            <li>سادہ اور خوبصورت یوزر انٹرفیس</li>
            {/* <li>آف لائن استعمال کی سہولت</li> */}
          </ul>
        </div>
        </div>
      </div>
      <BottomNav currentPage="profile" setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default MobileAppAdPage;
