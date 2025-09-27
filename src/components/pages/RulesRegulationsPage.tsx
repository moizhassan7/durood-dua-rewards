import React from 'react';
import { UserData } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';
import { BookOpen, Shield, Trophy } from 'lucide-react';

interface RulesRegulationsPageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

const RulesRegulationsPage: React.FC<RulesRegulationsPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav
        title="قوانین اور پالیسیز"
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
        showBackButton={true}
        backAction={() => setCurrentPage('profile')}
      />
      <div className="flex-grow pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6" dir="rtl">
            <div className="flex items-center mb-4">
              <Trophy size={24} className="text-amber-500 ml-2" />
              <h3 className="font-bold text-lg text-gray-900">انعامات کے قوانین</h3>
            </div>
            <p className="text-sm text-gray-700">
              یہاں آپ کو ماہانہ اور مجموعی انعامات کے لیے اہلیت، فاتح کے انتخاب کا طریقہ کار، اور پوائنٹس کے دعوے کی شرائط و ضوابط ملیں گے۔
            </p>
            <ul className="list-disc pr-5 mt-3 text-sm text-gray-600 space-y-2">
              <li>ہر مہینے کی 29 تاریخ کو اعلان کیا جائے گا۔</li>
              <li>ادائیگی کے دعوے کے لیے کم از کم 30,000 پوائنٹس درکار ہیں۔</li>
              <li>
                **ادائیگی کی تفصیلات (بینک/ایزی پیسہ/جاز کیش) کا مکمل اندراج ضروری ہے۔ نامکمل تفصیلات کی صورت میں آپ کی زیر التواء درخواستیں خود بخود منسوخ کر دی جائیں گی۔**
              </li>
              <li>پوائنٹس صرف ایک بار ہی کلیم کیے جا سکتے ہیں۔</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6" dir="rtl">
            <div className="flex items-center mb-4">
              <Shield size={24} className="text-blue-500 ml-2" />
              <h3 className="font-bold text-lg text-gray-900">پرائیویسی پالیسی</h3>
            </div>
            <p className="text-sm text-gray-700">
              یہ پالیسی وضاحت کرتی ہے کہ ہم آپ کا ذاتی ڈیٹا کیسے جمع، استعمال اور محفوظ کرتے ہیں۔ آپ کے ای میل اور گنتی کے پوائنٹس صرف انتظامی اور سروس کے مقاصد کے لیے استعمال ہوتے ہیں۔
            </p>
            <p className="mt-3 text-xs text-blue-500">
              <a href="#">پوری پالیسی پڑھیں</a>
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6" dir="rtl">
            <div className="flex items-center mb-4">
              <BookOpen size={24} className="text-green-500 ml-2" />
              <h3 className="font-bold text-lg text-gray-900">استعمال کی شرائط</h3>
            </div>
            <p className="text-sm text-gray-700">
              ایپ استعمال کرنے سے پہلے آپ کو صارف کے تمام حقوق اور ذمہ داریوں کو قبول کرنا ہوگا۔ دھوکہ دہی کی صورت میں اکاؤنٹ بلاک کر دیا جائے گا۔
            </p>
            <p className="mt-3 text-xs text-green-500">
              <a href="#">مکمل شرائط پڑھیں</a>
            </p>
          </div>
        </div>
      </div>
      <BottomNav currentPage="profile" setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default RulesRegulationsPage;