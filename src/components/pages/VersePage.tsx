// components/pages/VersePage.tsx
import React, { useState, useEffect } from 'react';
import { UserData, VerseData } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';
import { Book, Loader } from 'lucide-react';
import { addVerseOfTheDay, getVerseOfTheDay, removeVerseOfTheDay } from '../../services/firestore';

interface VersePageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

const VersePage: React.FC<VersePageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [verse, setVerse] = useState('');
  const [urduTranslation, setUrduTranslation] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerseSet, setIsVerseSet] = useState(false);

  const fetchVerse = async () => {
    setLoading(true);
    try {
      const currentVerse = await getVerseOfTheDay();
      if (currentVerse) {
        setVerse(currentVerse.verse);
        setUrduTranslation(currentVerse.urduTranslation);
        setReference(currentVerse.reference);
        setIsVerseSet(true);
      } else {
        setIsVerseSet(false);
      }
    } catch (error) {
      console.error("Failed to fetch Verse: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerse();
  }, []);

  const handleAddVerse = async () => {
    if (!verse || !urduTranslation || !reference) {
      alert('براہ کرم تمام فیلڈز پُر کریں۔');
      return;
    }
    setLoading(true);
    try {
      await addVerseOfTheDay(verse, urduTranslation, reference);
      alert(isVerseSet ? 'آیت کامیابی سے تبدیل کر دی گئی ہے۔' : 'آیت کامیابی سے شامل کر دی گئی ہے۔');
      setIsVerseSet(true);
    } catch (error) {
      console.error("Failed to add Verse: ", error);
      alert('آیت شامل کرنے میں کوئی مسئلہ پیش آیا۔');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVerse = async () => {
    const confirmRemove = window.confirm('کیا آپ واقعی آج کی آیت ہٹانا چاہتے ہیں؟');
    if (!confirmRemove) return;
    setLoading(true);
    try {
      await removeVerseOfTheDay();
      alert('آیت کامیابی سے ہٹا دی گئی ہے۔');
      setVerse('');
      setUrduTranslation('');
      setReference('');
      setIsVerseSet(false);
    } catch (error) {
      console.error("Failed to remove Verse: ", error);
      alert('آیت ہٹانے میں کوئی مسئلہ پیش آیا۔');
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
        title="آج کی آیت"
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
              {isVerseSet ? 'آیت میں تبدیلی کریں' : 'آج کی آیت شامل کریں'}
            </h1>
            <div className="space-y-4" dir="rtl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">آیت</label>
                <textarea
                  value={verse}
                  onChange={(e) => setVerse(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right"
                  placeholder="مکمل آیت کا متن یہاں لکھیں۔"
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
                  placeholder="مثال: سورۃ البقرۃ، آیت نمبر 255"
                />
              </div>
              <button
                onClick={handleAddVerse}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin ml-2" size={18} />
                    <span>شامل کیا جا رہا ہے...</span>
                  </>
                ) : isVerseSet ? (
                  'آیت میں تبدیلی کریں'
                ) : (
                  'آیت شامل کریں'
                )}
              </button>
              {isVerseSet && (
                <button
                  onClick={handleRemoveVerse}
                  disabled={loading}
                  className="w-full bg-red-100 text-red-700 py-2.5 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin ml-2" size={18} />
                      <span>ہٹایا جا رہا ہے...</span>
                    </>
                  ) : (
                    'آیت ہٹائیں'
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

export default VersePage;