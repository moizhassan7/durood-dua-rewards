// components/pages/HadithPage.tsx
import React, { useState, useEffect } from 'react';
import { UserData, HadithData } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';
import { Book, Loader } from 'lucide-react';
import { addHadithOfTheDay, getHadithOfTheDay, removeHadithOfTheDay } from '../../services/firestore';

interface HadithPageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

const HadithPage: React.FC<HadithPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [hadith, setHadith] = useState('');
  const [urduTranslation, setUrduTranslation] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHadithSet, setIsHadithSet] = useState(false);

  const fetchHadith = async () => {
    setLoading(true);
    try {
      const currentHadith = await getHadithOfTheDay();
      if (currentHadith) {
        setHadith(currentHadith.hadith);
        setUrduTranslation(currentHadith.urduTranslation);
        setReference(currentHadith.reference);
        setIsHadithSet(true);
      } else {
        setIsHadithSet(false);
      }
    } catch (error) {
      console.error("Failed to fetch Hadith: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHadith();
  }, []);

  const handleAddHadith = async () => {
    if (!hadith || !urduTranslation || !reference) {
      alert('براہ کرم تمام فیلڈز پُر کریں۔');
      return;
    }
    setLoading(true);
    try {
      await addHadithOfTheDay(hadith, urduTranslation, reference);
      alert(isHadithSet ? 'حدیث کامیابی سے تبدیل کر دی گئی ہے۔' : 'حدیث کامیابی سے شامل کر دی گئی ہے۔');
      setIsHadithSet(true);
    } catch (error) {
      console.error("Failed to add Hadith: ", error);
      alert('حدیث شامل کرنے میں کوئی مسئلہ پیش آیا۔');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveHadith = async () => {
    const confirmRemove = window.confirm('کیا آپ واقعی آج کی حدیث ہٹانا چاہتے ہیں؟');
    if (!confirmRemove) return;
    setLoading(true);
    try {
      await removeHadithOfTheDay();
      alert('حدیث کامیابی سے ہٹا دی گئی ہے۔');
      setHadith('');
      setUrduTranslation('');
      setReference('');
      setIsHadithSet(false);
    } catch (error) {
      console.error("Failed to remove Hadith: ", error);
      alert('حدیث ہٹانے میں کوئی مسئلہ پیش آیا۔');
    } finally {
      setLoading(false);
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
        title="آج کی حدیث"
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
        showBackButton={true}
        backAction={() => setCurrentPage('admin')}
      />
      <div className="flex-grow pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h1 className="text-xl font-bold text-gray-900 mb-6 text-center" dir="rtl">
              {isHadithSet ? 'حدیث میں تبدیلی کریں' : 'آج کی حدیث شامل کریں'}
            </h1>
            <div className="space-y-4" dir="rtl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">حدیث</label>
                <textarea
                  value={hadith}
                  onChange={(e) => setHadith(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right"
                  placeholder="مکمل حدیث کا متن یہاں لکھیں۔"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اردو ترجمہ</label>
                <textarea
                  value={urduTranslation}
                  onChange={(e) => setUrduTranslation(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right"
                  placeholder="ترجمہ یہاں لکھیں۔"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">حوالہ</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right"
                  placeholder="مثال: صحیح بخاری، 1:52"
                />
              </div>
              <button
                onClick={handleAddHadith}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin ml-2" size={18} />
                    <span>شامل کیا جا رہا ہے...</span>
                  </>
                ) : isHadithSet ? (
                  'حدیث میں تبدیلی کریں'
                ) : (
                  'حدیث شامل کریں'
                )}
              </button>
              {isHadithSet && (
                <button
                  onClick={handleRemoveHadith}
                  disabled={loading}
                  className="w-full bg-red-100 text-red-700 py-2.5 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin ml-2" size={18} />
                      <span>ہٹایا جا رہا ہے...</span>
                    </>
                  ) : (
                    'حدیث ہٹائیں'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <BottomNav currentPage="admin" setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default HadithPage;