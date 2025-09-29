import React, { useState, useEffect } from 'react';
import { UserData, HadithData } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';
import { Book, Loader, CheckCircle, XCircle } from 'lucide-react';
import { addHadithOfTheDay, getHadithOfTheDay, removeHadithOfTheDay } from '../../services/firestore';

interface HadithPageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

// ---------------------------------------------------
// CUSTOM DIALOG COMPONENTS & STATE
// ---------------------------------------------------

// 1. Notification Dialog State (for success/error/validation)
interface NotificationState {
    show: boolean;
    success: boolean; // True for success, False for error/validation
    message: string;
}

// 2. Confirmation Dialog State
interface ConfirmationState {
    show: boolean;
    action: 'remove';
}

const NotificationDialog: React.FC<{ dialog: NotificationState, onClose: () => void }> = ({ dialog, onClose }) => {
    if (!dialog.show) return null;

    const Icon = dialog.success ? CheckCircle : XCircle;
    const colorClass = dialog.success ? 'text-green-500' : 'text-red-500';
    const bgColorClass = dialog.success ? 'bg-green-50' : 'bg-red-50';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" dir="rtl">
            <div className={`w-full max-w-sm rounded-xl shadow-2xl p-6 text-center ${bgColorClass} transform transition-all`}>
                <Icon size={48} className={`mx-auto mb-4 ${colorClass}`} />
                <p className="text-lg font-semibold text-gray-800 mb-4">{dialog.message}</p>
                <button
                    onClick={onClose}
                    className={`w-full py-2 rounded-lg font-medium text-white transition-colors 
                        ${dialog.success ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" dir="rtl">
            <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 text-center">
                <XCircle size={48} className="mx-auto mb-4 text-red-500" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">تصدیق کریں</h3>
                <p className="text-gray-700 mb-6">
                    کیا آپ واقعی **آج کی حدیث** ہٹانا چاہتے ہیں؟ یہ عمل مستقل ہوگا۔
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
                        className="flex-1 py-2 rounded-lg font-medium text-white transition-colors bg-red-600 hover:bg-red-700"
                    >
                        ہٹائیں
                    </button>
                </div>
            </div>
        </div>
    );
};
// ---------------------------------------------------


const HadithPage: React.FC<HadithPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [hadith, setHadith] = useState('');
  const [urduTranslation, setUrduTranslation] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHadithSet, setIsHadithSet] = useState(false);
  
  // NEW STATES
  const [notification, setNotification] = useState<NotificationState>({ show: false, success: false, message: '' });
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ show: false, action: 'remove' });

  // Dialog Close Handler
  const handleCloseDialog = () => {
      setNotification({ show: false, success: false, message: '' });
  };

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

  // REFACTORED: Use Custom Dialog
  const handleAddHadith = async () => {
    if (!hadith || !urduTranslation || !reference) {
      setNotification({
          show: true,
          success: false,
          message: 'براہ کرم حدیث، ترجمہ، اور حوالہ سمیت تمام فیلڈز پُر کریں۔'
      });
      return;
    }
    setLoading(true);
    try {
      await addHadithOfTheDay(hadith, urduTranslation, reference);
      
      setNotification({
          show: true,
          success: true,
          message: isHadithSet ? 'حدیث کامیابی سے تبدیل کر دی گئی ہے۔' : 'حدیث کامیابی سے شامل کر دی گئی ہے۔'
      });
      setIsHadithSet(true);
    } catch (error) {
      console.error("Failed to add Hadith: ", error);
      setNotification({
          show: true,
          success: false,
          message: 'حدیث شامل کرنے میں کوئی مسئلہ پیش آیا۔'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handler to show confirmation dialog
  const handleRemoveClick = () => {
    setConfirmation({ show: true, action: 'remove' });
  };

  // REFACTORED: Confirmation handler for removal
  const handleRemoveHadithConfirm = async () => {
    // Close the confirmation dialog
    setConfirmation({ show: false, action: 'remove' });
    
    setLoading(true);
    try {
      await removeHadithOfTheDay();
      
      setNotification({
          show: true,
          success: true,
          message: 'حدیث کامیابی سے ہٹا دی گئی ہے۔'
      });
      
      // Clear fields and state
      setHadith('');
      setUrduTranslation('');
      setReference('');
      setIsHadithSet(false);
    } catch (error) {
      console.error("Failed to remove Hadith: ", error);
      setNotification({
          show: true,
          success: false,
          message: 'حدیث ہٹانے میں کوئی مسئلہ پیش آیا۔'
      });
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
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                  onClick={handleRemoveClick} // Call handler to show confirmation
                  disabled={loading}
                  className="w-full bg-red-100 text-red-700 py-2.5 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center"
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
      
      {/* RENDER CUSTOM DIALOGS */}
      <NotificationDialog dialog={notification} onClose={handleCloseDialog} />
      <ConfirmationDialog 
          dialog={confirmation}
          onConfirm={handleRemoveHadithConfirm}
          onCancel={() => setConfirmation({ show: false, action: 'remove' })}
      />
    </div>
  );
};

export default HadithPage;