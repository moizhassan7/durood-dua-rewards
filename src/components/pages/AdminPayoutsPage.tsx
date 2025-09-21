import { useState, useEffect, useRef } from 'react';
import { Loader, CheckCircle, XCircle, Upload, CreditCard } from 'lucide-react';
import { formatNumber } from '../utils/formatters';
import { UserData, PayoutRequest } from '../../types';
import TopNav from '../TopNav';
import BottomNav from '../BottomNav';
import { getPendingPayouts, acceptPayout, rejectPayout } from '../../services/firestore';

interface AdminPayoutsPageProps {
  user: UserData;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

const AdminPayoutsPage: React.FC<AdminPayoutsPageProps> = ({ user, setCurrentPage, handleLogout }) => {
  const [pendingPayouts, setPendingPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [currentRequest, setCurrentRequest] = useState<PayoutRequest | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const payouts = await getPendingPayouts();
      setPendingPayouts(payouts);
    } catch (error) {
      console.error("Failed to fetch pending payouts: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleUploadButtonClick = (request: PayoutRequest) => {
    setCurrentRequest(request);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileToUpload(file);
      setPaymentProofUrl(URL.createObjectURL(file));
      setShowDialog(true);
    }
  };

  const handleAcceptFinal = async () => {
    if (!fileToUpload || !currentRequest) {
      alert('فائل یا درخواست کی تفصیلات موجود نہیں ہیں۔');
      return;
    }
    setUploading(true);
    try {
      await acceptPayout(currentRequest.id, fileToUpload, currentRequest.userId, currentRequest.pointsAtRequest);
      alert('ادائیگی کامیابی سے قبول کر لی گئی ہے۔');
      setShowDialog(false);
      await fetchPayouts();
    } catch (error) {
      console.error("Failed to accept payout: ", error);
      alert('ادائیگی قبول کرنے میں کوئی مسئلہ پیش آیا۔');
    } finally {
      setUploading(false);
      setFileToUpload(null);
      setCurrentRequest(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectPayout(requestId, rejectionReason);
      alert('ادائیگی کی درخواست مسترد کر دی گئی ہے۔');
      setRejectionReason('');
      await fetchPayouts();
    } catch (error) {
      console.error("Failed to reject payout: ", error);
      alert('درخواست مسترد کرنے میں کوئی مسئلہ پیش آیا۔');
    }
  };

  const renderDialog = () => {
    if (!currentRequest) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" dir="rtl">
          <h2 className="text-xl font-bold mb-4">ادائیگی کی تصدیق</h2>
          <p className="text-sm text-gray-700 mb-4">براہ کرم اسکرین شاٹ کی تصدیق کریں اور ادائیگی قبول کریں۔</p>
          <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
            <img src={paymentProofUrl} alt="Payment Proof" className="w-full h-auto object-cover" />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowDialog(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg"
            >
              منسوخ کریں
            </button>
            <button
              onClick={handleAcceptFinal}
              disabled={uploading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'قبول کیا جا رہا ہے...' : 'قبول کریں'}
            </button>
          </div>
        </div>
      </div>
    );
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
        title="ادائیگی کی درخواستیں"
        user={user}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
        showBackButton={true}
        backAction={() => setCurrentPage('admin')}
      />
      <div className="flex-grow pt-16 pb-24 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h1 className="text-xl font-bold text-gray-900 mb-6" dir="rtl">زیر التواء درخواستیں</h1>
            {pendingPayouts.length > 0 ? (
              <ul className="space-y-4">
                {pendingPayouts.map(req => (
                  <li key={req.id} className="p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center" dir="rtl">
                      <div>
                        <h3 className="font-bold text-gray-900">{req.userName}</h3>
                        <p className="text-sm text-gray-500">{formatNumber(req.pointsAtRequest)} پوائنٹس</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {req.requestDate.toDate().toLocaleDateString('ur-PK')}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center space-x-2" dir="rtl">
                        <CreditCard size={16} className="text-gray-500" />
                        <span className="text-sm font-bold text-gray-800">بینک تفصیلات</span>
                      </div>
                      {req.payoutDetails ? (
                        <div className="bg-gray-100 p-3 rounded-lg text-sm space-y-1" dir="rtl">
                          <p>اکاؤنٹ ہولڈر: <span className="font-medium">{req.payoutDetails.accountName}</span></p>
                          <p>اکاؤنٹ نمبر: <span className="font-medium">{req.payoutDetails.accountNumber}</span></p>
                          <p>طریقہ: <span className="font-medium">{req.payoutDetails.method === 'bank' ? 'بینک' : req.payoutDetails.method === 'easypaisa' ? 'ایزی پیسا' : 'جazzCash'}</span></p>
                        </div>
                      ) : (
                        <div className="bg-gray-100 p-3 rounded-lg text-sm text-gray-500" dir="rtl">
                          صارف نے اپنی بینک تفصیلات فراہم نہیں کیں۔
                        </div>
                      )}
                      
                      {/* Upload Button */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      <button
                        onClick={() => handleUploadButtonClick(req)}
                        disabled={uploading}
                        className="w-full flex items-center justify-center py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? (
                          <>
                            <Loader className="animate-spin ml-2" size={16} />
                            <span>اپ لوڈ ہو رہا ہے...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={16} className="ml-2" />
                            <span>اسکرین شاٹ اپ لوڈ کریں</span>
                          </>
                        )}
                      </button>

                      <div className="flex space-x-2" dir="rtl">
                        <button
                          onClick={() => handleReject(req.id)}
                          className="w-full flex items-center justify-center py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200"
                        >
                          <XCircle size={16} className="ml-2" />
                          مسترد کریں
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-6" dir="rtl">کوئی زیر التواء درخواستیں نہیں ہیں۔</p>
            )}
          </div>
        </div>
      </div>
      {showDialog && renderDialog()}
      <BottomNav currentPage="admin" setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default AdminPayoutsPage;