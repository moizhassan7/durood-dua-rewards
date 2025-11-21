import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CreditCard, Trophy, Download, Shield, Settings, Loader, BookOpen, BookText, Volume2, Plus, Save, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { UserData, Benefit } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';
import { getAllUsers, getPendingPayoutsCount, getBenefits, saveBenefits } from '../../services/firestore';

interface AdminPanelPageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

const AdminPanelPage: React.FC<AdminPanelPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [pendingPayoutsCount, setPendingPayoutsCount] = useState(0);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingBenefits, setSavingBenefits] = useState(false);

  const [showBenefitsModal, setShowBenefitsModal] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  const [benefitForm, setBenefitForm] = useState({ title: '', description: '', iconUrl: '' });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [users, pendingCount, fetchedBenefits] = await Promise.all([
        getAllUsers(),
        getPendingPayoutsCount(),
        getBenefits()
      ]);
      setAllUsers(users);
      setPendingPayoutsCount(pendingCount);
      setBenefits(fetchedBenefits || []);
    } catch (error) {
      console.error("Failed to fetch admin data: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    const current = localStorage.getItem('theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    if (next === 'dark') document.documentElement.classList.add('dark'); 
    else document.documentElement.classList.remove('dark');
  };

  const handleSaveBenefitsToDb = async () => {
    setSavingBenefits(true);
    try {
      await saveBenefits(benefits);
      alert('Benefits saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save benefits');
    } finally {
      setSavingBenefits(false);
    }
  };

  const openModal = (benefit?: Benefit) => {
    if (benefit) {
      setEditingBenefit(benefit);
      setBenefitForm({ title: benefit.title, description: benefit.description, iconUrl: benefit.iconUrl || '' });
    } else {
      setEditingBenefit(null);
      setBenefitForm({ title: '', description: '', iconUrl: '' });
    }
    setShowBenefitsModal(true);
  };

  const saveModalData = () => {
    if(!benefitForm.title) return alert("عنوان ضروری ہے");

    const newBenefit: Benefit = {
      id: editingBenefit?.id || `${Date.now()}`,
      title: benefitForm.title,
      description: benefitForm.description,
      iconUrl: benefitForm.iconUrl || ''
    };

    setBenefits(prev => {
      if (editingBenefit) {
        return prev.map(b => b.id === editingBenefit.id ? newBenefit : b);
      }
      return [...prev, newBenefit];
    });
    setShowBenefitsModal(false);
  };

  const handleDownloadReport = () => {
    if (allUsers.length === 0) return alert('No user data.');
    const headers = ["ID", "Name", "Email", "Total Count", "Monthly Count", "Streak"];
    const rows = allUsers.map(u => [u.id, u.name, u.email, u.totalCount, u.monthCount, u.streak].join(','));
    const csvContent = headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'darood_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      <TopNav title="ایڈمن پینل" user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />
      
      <div className="flex-grow pt-20 pb-24 px-4">
        <div className="max-w-md mx-auto">
          
          <div className="flex justify-end mb-4">
            <button onClick={toggleTheme} className="px-4 py-2 rounded-full bg-white dark:bg-gray-800 border dark:border-gray-700 text-sm font-medium shadow-sm text-gray-700 dark:text-gray-200">
              Toggle Theme
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-8">
            <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-emerald-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3" dir="rtl">
                <div className="flex items-center">
                   <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center ml-3">
                    <Users size={20} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="font-bold text-gray-900 dark:text-white">صارفین</h2>
                </div>
                <span className="text-2xl font-bold text-emerald-600">{allUsers.length}</span>
              </div>
              <button onClick={() => setCurrentPage('user-management')} className="w-full mt-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 py-2 rounded-lg text-sm font-medium">
                تفصیلات دیکھیں
              </button>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-amber-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3" dir="rtl">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center ml-3">
                    <CreditCard size={20} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <h2 className="font-bold text-gray-900 dark:text-white">ادائیگیاں</h2>
                </div>
                {pendingPayoutsCount > 0 && (
                   <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{pendingPayoutsCount} زیر التواء</span>
                )}
              </div>
              <button onClick={() => setCurrentPage('payout-requests')} className="w-full mt-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 py-2 rounded-lg text-sm font-medium">
                درخواستیں دیکھیں
              </button>
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setCurrentPage('monthly-winners-view')} className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl flex flex-col items-center text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-800">
                    <Trophy size={24} className="mb-2" />
                    <span className="text-sm font-medium">فاتحین</span>
                </button>
                <button onClick={() => setCurrentPage('hadith-of-the-day-admin')} className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex flex-col items-center text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                    <BookOpen size={24} className="mb-2" />
                    <span className="text-sm font-medium">حدیث</span>
                </button>
                <button onClick={() => setCurrentPage('verse-of-the-day-admin')} className="bg-fuchsia-50 dark:bg-fuchsia-900/20 p-4 rounded-xl flex flex-col items-center text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-100 dark:border-fuchsia-800">
                    <BookText size={24} className="mb-2" />
                    <span className="text-sm font-medium">آیت</span>
                </button>
                <button onClick={() => setCurrentPage('announcement-admin')} className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl flex flex-col items-center text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800">
                    <Volume2 size={24} className="mb-2" />
                    <span className="text-sm font-medium">اعلان</span>
                </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm mb-6 border dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 flex-row-reverse">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">ایپ کے فوائد</h2>
              <div className="flex gap-2">
                <button onClick={() => openModal()} className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 rounded-lg hover:bg-emerald-200">
                   <Plus size={18} />
                </button>
                <button onClick={handleSaveBenefitsToDb} disabled={savingBenefits} className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200">
                   {savingBenefits ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {benefits.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">کوئی فائدہ شامل نہیں کیا گیا۔</p>}
              
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center justify-between border dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex gap-2">
                    <button onClick={() => openModal(b)} className="text-blue-600 p-1"><Settings size={16} /></button>
                    <button onClick={() => { if (confirm('حذف کریں؟')) setBenefits(prev => prev.filter(x => x !== b)); }} className="text-red-500 p-1"><Trash2 size={16} /></button>
                  </div>
                  <div className="flex items-center gap-3 flex-row-reverse text-right flex-1 min-w-0">
                    {/* Small thumbnail preview */}
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0 border dark:border-gray-600 flex items-center justify-center">
                      {b.iconUrl ? <img src={b.iconUrl} className="w-full h-full object-cover" alt="" /> : <ImageIcon size={16} className="text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white text-sm truncate">{b.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{b.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm mb-6 border dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white text-right mb-4">سسٹم کی ترتیبات</h2>
            <div className="space-y-2">
                <button onClick={() => setCurrentPage('security-settings')} className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-medium flex items-center justify-end px-4 hover:bg-gray-200 dark:hover:bg-gray-600">
                امنیت کے انتظامات <Shield className="ml-2" size={18} />
                </button>
                <button onClick={() => setCurrentPage('system-settings')} className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-medium flex items-center justify-end px-4 hover:bg-gray-200 dark:hover:bg-gray-600">
                سسٹم سیٹنگز <Settings className="ml-2" size={18} />
                </button>
            </div>
          </div>
        </div>
      </div>

      {showBenefitsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl border dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => setShowBenefitsModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{editingBenefit ? 'فائدہ ترمیم کریں' : 'نیا فائدہ شامل کریں'}</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-right">عنوان</label>
                <input 
                    dir="rtl"
                    value={benefitForm.title} 
                    onChange={(e) => setBenefitForm(f => ({ ...f, title: e.target.value }))} 
                    className="w-full border dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right dark:text-white focus:ring-2 ring-emerald-500 outline-none transition-all" 
                    placeholder="مثال: روحانی سکون"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-right">تفصیل</label>
                <textarea 
                    dir="rtl"
                    value={benefitForm.description} 
                    onChange={(e) => setBenefitForm(f => ({ ...f, description: e.target.value }))} 
                    className="w-full border dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right dark:text-white focus:ring-2 ring-emerald-500 outline-none transition-all" 
                    rows={3} 
                    placeholder="تفصیل لکھیں..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-right">تصویر کا URL (اختیاری)</label>
                <input 
                    value={benefitForm.iconUrl} 
                    onChange={(e) => setBenefitForm(f => ({ ...f, iconUrl: e.target.value }))} 
                    placeholder="https://example.com/image.jpg" 
                    className="w-full border dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-sm dark:text-white text-right focus:ring-2 ring-emerald-500 outline-none transition-all" 
                />
                
                {/* Image Preview in Modal */}
                {benefitForm.iconUrl && (
                  <div className="mt-3 w-full h-32 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img src={benefitForm.iconUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8">
              <button onClick={saveModalData} className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 hover:shadow-emerald-500/30 transition-all">
                محفوظ کریں
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav currentPage="admin" setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default AdminPanelPage;