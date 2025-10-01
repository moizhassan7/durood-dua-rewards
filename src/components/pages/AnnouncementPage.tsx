import { useState, useEffect } from 'react';
import { UserData, AnnouncementData } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';
import { Volume2, Loader, Trash2, CheckCircle, Upload } from 'lucide-react';
import { saveAnnouncement, fetchActiveAnnouncement, removeAnnouncement } from '../../services/firestore';

interface AnnouncementPageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

const AnnouncementPage: React.FC<AnnouncementPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<AnnouncementData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadAnnouncement = async () => {
    setLoading(true);
    try {
      const activeAnnouncement = await fetchActiveAnnouncement();
      if (activeAnnouncement) {
        setCurrentAnnouncement(activeAnnouncement);
        setTitle(activeAnnouncement.title);
        setMessage(activeAnnouncement.message);
      } else {
        setCurrentAnnouncement(null);
        setTitle('');
        setMessage('');
      }
    } catch (error) {
      console.error("Error loading announcement: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncement();
  }, []);

  const handleSave = async () => {
    if (!title && !message && !imageFile) {
      alert('براہ کرم اعلان کے لیے کچھ ٹیکسٹ یا تصویر شامل کریں۔');
      return;
    }
    setLoading(true);
    try {
      await saveAnnouncement(title, message, imageFile);
      alert('اعلان کامیابی سے محفوظ کر دیا گیا ہے۔');
      await loadAnnouncement();
      setImageFile(null);
    } catch (error) {
      console.error("Failed to save announcement: ", error);
      alert('اعلان محفوظ کرنے میں کوئی مسئلہ پیش آیا۔');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    const confirmRemove = window.confirm('کیا آپ واقعی اس اعلان کو ہٹانا چاہتے ہیں؟');
    if (!confirmRemove) return;
    setLoading(true);
    try {
      await removeAnnouncement();
      alert('اعلان کامیابی سے ہٹا دیا گیا ہے۔');
      await loadAnnouncement();
    } catch (error) {
      console.error("Failed to remove announcement: ", error);
      alert('اعلان ہٹانے میں کوئی مسئلہ پیش آیا۔');
    } finally {
      setLoading(false);
    }
  };

  const isUpdating = currentAnnouncement !== null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav
        title="اعلان کا انتظام"
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
        showBackButton={true}
        backAction={() => setCurrentPage('admin')}
      />
      <div className="flex-grow pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto">
          {currentAnnouncement && (
            <div className="bg-green-50 text-green-700 p-3 rounded-xl mb-4 flex items-center text-sm" dir="rtl">
              <CheckCircle size={18} className="ml-2" />
              <span>ایک اعلان فی الحال فعال ہے۔</span>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4" dir="rtl">
            <h1 className="text-xl font-bold text-gray-900">نیا اعلان بنائیں</h1>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عنوان (Title)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="اہم اعلان"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">پیغام (Message)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="پیغام یہاں لکھیں۔"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تصویر (اختیاری)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {currentAnnouncement?.imageUrl && (
                <p className="text-xs text-gray-500 mt-2">موجودہ تصویر استعمال ہو رہی ہے۔ نئی فائل منتخب کرنے پر تبدیل ہو جائے گی۔</p>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={loading || (!title && !message && !imageFile && !currentAnnouncement?.imageUrl)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader className="animate-spin ml-2" size={18} /> : (isUpdating ? 'تبدیل کریں اور محفوظ کریں' : 'اعلان شائع کریں')}
            </button>
            
            {isUpdating && (
              <button
                onClick={handleRemove}
                disabled={loading}
                className="w-full bg-red-100 text-red-700 py-2.5 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'ہٹایا جا رہا ہے...' : 'اعلان ہٹائیں'}
              </button>
            )}
          </div>
        </div>
      </div>
      <BottomNav currentPage="admin" setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default AnnouncementPage;